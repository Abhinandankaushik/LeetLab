import { getLanguageName } from "../executor/languages.js";
import { runSubmissions } from "../executor/index.js";
import { db } from "./db.js";
import { updateUserActivity, updateUserStreak } from "./activity.lib.js";

/**
 * Heavy code-execution work: run the code in a sandboxed container, evaluate
 * results and (on submit) persist everything. This is the expensive part that we
 * run inside a bounded queue worker so concurrent users can't overwhelm the
 * executor / the server.
 *
 * It is pure-ish: all the data it needs is passed in `payload` (no req/res), so
 * it can run either inside a BullMQ worker or inline as a fallback. It returns
 * the exact JSON body that the controller should send back to the client.
 */
export const processExecution = async (payload) => {
    const {
        userId,
        role,
        source_code,
        language_id,
        problemId,
        isSubmit,
        contestId,
        testcasesToRun,
        examples = [],
    } = payload;

    console.log(`🚀 Executing ${testcasesToRun.length} test cases for problem: ${problemId}`);

    const result = await runSubmissions({
        source_code,
        language_id,
        testcases: testcasesToRun,
    });

    const allPassed = result.status === "Accepted";

    const detailedResults = result.details.map((detail, index) => ({
        testCase: index + 1,
        passed: detail.status === "Passed",
        stdout: detail.output,
        stdin: detail.input,
        expected: detail.expected,
        stderr: detail.stderr || null,
        compileOutput: detail.compileOutput || null,
        status: detail.judgeStatus.description,
        memory: detail.memory ? `${detail.memory} KB` : undefined,
        time: detail.time ? `${detail.time} s` : undefined,
    }));

    if (!isSubmit) {
        return {
            success: true,
            message: "code executed successfully",
            submission: {
                status: allPassed ? "Accepted" : "Wrong Answer",
                language: getLanguageName(language_id),
                testCases: detailedResults,
            },
        };
    }

    // ---- Submit: persist submission summary ----
    const submissionData = await db.submission.create({
        data: {
            userId,
            problemId,
            sourceCode: { code: source_code },
            language: getLanguageName(language_id),
            stdin: testcasesToRun.map((t) => t.input).join("\n"),
            stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
            stderr: detailedResults.some((r) => r.stderr) ? JSON.stringify(detailedResults.map((r) => r.stderr)) : null,
            compileOutput: detailedResults.some((r) => r.compileOutput) ? JSON.stringify(detailedResults.map((r) => r.compileOutput)) : null,
            status: allPassed ? "Accepted" : "Wrong Answer",
            memory: detailedResults.some((r) => r.memory) ? JSON.stringify(detailedResults.map((r) => r.memory)) : null,
            time: detailedResults.some((r) => r.time) ? JSON.stringify(detailedResults.map((r) => r.time)) : null,
            contestId: contestId || null,
        },
    });

    if (allPassed) {
        await db.problemSolved.upsert({
            where: { userId_problemId: { userId, problemId } },
            update: {},
            create: { userId, problemId },
        });
        await updateUserStreak(userId);
    }

    await updateUserActivity(userId);

    const testCaseResults = detailedResults.map((r) => ({
        submissionId: submissionData.id,
        testCase: r.testCase,
        passed: r.passed,
        stdout: r.stdout,
        stdin: r.stdin,
        expected: r.expected,
        stderr: r.stderr,
        compileOutput: r.compileOutput,
        status: r.status,
        memory: r.memory,
        time: r.time,
    }));

    await db.testCaseResult.createMany({ data: testCaseResults });

    const submissionWithTestCase = await db.submission.findUnique({
        where: { id: submissionData.id },
        include: { testCases: true },
    });

    // ---- Sanitization: only reveal example test cases (admins see all) ----
    const totalCount = testcasesToRun.length;
    const passedCount = detailedResults.filter((r) => r.passed).length;

    const normalize = (s) =>
        String(s ?? "")
            .replace(/\r\n/g, "\n")
            .replace(/\s+/g, " ")
            .trim();

    const exampleList = Array.isArray(examples)
        ? examples
        : examples
            ? Object.values(examples)
            : [];

    const exampleInputs = new Set(exampleList.map((ex) => normalize(ex.input)));

    const isAdmin = role === "ADMIN";
    const publicTestCases = [];
    let hiddenPassedCount = 0;
    let hiddenFailedCount = 0;

    detailedResults.forEach((res) => {
        const isExample = exampleInputs.has(normalize(res.stdin));
        if (isAdmin || isExample) {
            publicTestCases.push({
                ...res,
                type: isExample ? "EXAMPLE" : "HIDDEN (ADMIN VIEW)",
            });
        } else if (res.passed) {
            hiddenPassedCount++;
        } else {
            hiddenFailedCount++;
        }
    });

    return {
        success: true,
        message: "code submitted successfully",
        submission: {
            ...(submissionWithTestCase || {
                status: allPassed ? "Accepted" : "Wrong Answer",
                language: getLanguageName(language_id),
            }),
            testCases: publicTestCases,
            hiddenPassedCount: isAdmin ? 0 : hiddenPassedCount,
            hiddenFailedCount: isAdmin ? 0 : hiddenFailedCount,
            totalHiddenCases: isAdmin ? 0 : hiddenPassedCount + hiddenFailedCount,
        },
        totalCount,
        passedCount,
    };
};
