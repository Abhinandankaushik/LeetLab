import { randomUUID } from "crypto";
import { execInContainer } from "./docker.client.js";
import { getPool } from "./pool.js";
import { getLanguageConfig } from "./languages.js";

const COMPILE_TIMEOUT_S = Number(process.env.EXECUTOR_COMPILE_TIMEOUT_S) || 15;
const RUN_TIMEOUT_S = Number(process.env.EXECUTOR_RUN_TIMEOUT_S) || 5;

// Execution status objects. The ids/descriptions match the long-standing
// convention the rest of the pipeline reads (`judgeStatus.description` / ids).
const STATUS = {
    ACCEPTED: { id: 3, description: "Accepted" },
    WRONG: { id: 4, description: "Wrong Answer" },
    TLE: { id: 5, description: "Time Limit Exceeded" },
    COMPILE_ERROR: { id: 6, description: "Compilation Error" },
    RUNTIME_ERROR: { id: 11, description: "Runtime Error (NZEC)" },
    KILLED: { id: 11, description: "Runtime Error (Killed: time/memory limit)" },
};

const sh = (command) => ["sh", "-c", command];
const wrapTimeout = (seconds, command) => `timeout -s KILL ${seconds} ${command}`;

// Encode arbitrary text so it can be embedded safely in a shell command and
// reconstructed inside the container without any quoting/escaping pitfalls.
const b64 = (str) => Buffer.from(str ?? "", "utf-8").toString("base64");

const compileErrorResult = (testcases, message) => ({
    status: "Compilation Error",
    total: testcases.length,
    passed: 0,
    failed: testcases.length,
    details: testcases.map((t) => ({
        input: t.input,
        expected: t.expectedOutput,
        output: message,
        status: "Failed",
        stderr: message,
        compileOutput: message,
        judgeStatus: STATUS.COMPILE_ERROR,
        memory: null,
        time: null,
    })),
});

/**
 * Warm-container executor: the app's `runSubmissions` implementation.
 *
 * Flow per submission: borrow a warm container -> write source -> compile once
 * -> run every test case (reusing the compiled artifact) -> clean up -> release.
 */
export const runSubmissions = async ({ source_code, language_id, testcases }) => {
    const config = getLanguageConfig(language_id);
    if (!config) {
        return compileErrorResult(testcases, `Unsupported language id: ${language_id}`);
    }

    const pool = await getPool(config.poolName);
    const container = await pool.acquire();
    const workdir = `/tmp/sub-${randomUUID()}`;
    let recycled = false;

    try {
        // 1. Create workdir + write the source file. The source is base64-encoded
        //    and decoded inside the container, so the user's code never has to be
        //    shell-escaped.
        await execInContainer(
            container,
            sh(`mkdir -p ${workdir} && echo '${b64(source_code)}' | base64 -d > ${workdir}/${config.file}`)
        );

        // 2. Compile once (if the language needs it).
        if (config.compile) {
            const compile = await execInContainer(
                container,
                sh(`cd ${workdir} && ${wrapTimeout(COMPILE_TIMEOUT_S, config.compile)}`),
                { hardTimeoutMs: (COMPILE_TIMEOUT_S + 5) * 1000 }
            );
            if (compile.exitCode !== 0) {
                const msg = compile.stderr || compile.stdout || "Compilation failed";
                return compileErrorResult(testcases, msg);
            }
        }

        // 3. Run each test case against the prepared program. Input is written to
        //    a file and fed via stdin redirection (no hijacked-stdin streaming).
        const details = [];
        for (const testcase of testcases) {
            const started = Date.now();
            const run = await execInContainer(
                container,
                sh(
                    `cd ${workdir} && echo '${b64(testcase.input ?? "")}' | base64 -d > input.txt && ` +
                    `${wrapTimeout(RUN_TIMEOUT_S, config.run)} < input.txt`
                ),
                { hardTimeoutMs: (RUN_TIMEOUT_S + 5) * 1000 }
            );
            const elapsed = (Date.now() - started) / 1000;

            const stdout = run.stdout || "";
            const expected = testcase.expectedOutput ?? "";

            let judgeStatus = STATUS.ACCEPTED;
            if (run.exitCode === 124) {
                judgeStatus = STATUS.TLE;
            } else if (run.exitCode === 137) {
                judgeStatus = STATUS.KILLED;
            } else if (run.exitCode !== 0) {
                judgeStatus = STATUS.RUNTIME_ERROR;
            }

            const isPassed = judgeStatus.id === 3 && stdout.trim() === expected.trim();

            details.push({
                input: testcase.input,
                expected,
                output: stdout,
                status: isPassed ? "Passed" : "Failed",
                stderr: run.stderr || null,
                compileOutput: null,
                judgeStatus: isPassed ? STATUS.ACCEPTED : judgeStatus.id === 3 ? STATUS.WRONG : judgeStatus,
                memory: null,
                time: Number(elapsed.toFixed(3)),
            });
        }

        // 4. Clean the workdir so the warm container is reusable.
        await execInContainer(container, ["sh", "-c", `rm -rf ${workdir}`]).catch(() => {});

        const total = details.length;
        const passed = details.filter((d) => d.status === "Passed").length;
        const failed = total - passed;

        let status = "Accepted";
        if (details.some((d) => d.judgeStatus.id === 6)) status = "Compilation Error";
        else if (details.some((d) => [5, 11].includes(d.judgeStatus.id))) status = "Runtime Error";
        else if (passed === total) status = "Accepted";
        else status = "Wrong Answer";

        return { status, total, passed, failed, details };
    } catch (err) {
        // Container may be in a bad state — recycle it instead of returning it.
        recycled = true;
        pool.recycle(container).catch(() => {});
        return compileErrorResult(testcases, `Executor error: ${err.message}`);
    } finally {
        if (!recycled) pool.release(container);
    }
};
