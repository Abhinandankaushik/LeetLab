import axios from "axios"
import dotenv from "dotenv"
dotenv.config();

export const getJudge0LanguageId = (language) => {
    const languageMap = {
        "PYTHON": 71,
        "JAVA": 62,
        "JAVASCRIPT": 63,
        "C": 50,
        "CPP": 54,
        "C++": 54,
    }

    return languageMap[language.toUpperCase()]
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const decode = (str) => (str ? Buffer.from(str, "base64").toString("utf-8") : str);
const encode = (str) => (str ? Buffer.from(str).toString("base64") : str);

export const pollBatchResults = async (tokens) => {
    const baseUrl = process.env.JUDGE0_API_URL.replace(/\/+$/, "");
    while (true) {
        const { data } = await axios.get(`${baseUrl}/submissions/batch`, {
            params: {
                tokens: tokens.join(","),
                base64_encoded: true,
            }
        });

        const results = data.submissions;

        const isAllDone = results.every(
            (r) => r.status.id !== 1 && r.status.id !== 2
        );

        if (isAllDone) {
            return results.map(r => ({
                ...r,
                stdout: decode(r.stdout),
                stderr: decode(r.stderr),
                compile_output: decode(r.compile_output),
                message: decode(r.message)
            }));
        }
        await sleep(1000);
    }
}

export const submitBatch = async (submissions) => {
    const encodedSubmissions = submissions.map(s => ({
        ...s,
        source_code: encode(s.source_code),
        stdin: encode(s.stdin),
        expected_output: encode(s.expected_output)
    }));

    const baseUrl = process.env.JUDGE0_API_URL.replace(/\/+$/, "");
    const { data } = await axios.post(`${baseUrl}/submissions/batch?base64_encoded=true`, {
        submissions: encodedSubmissions
    });
   
  
    console.log("Submission Results: ", data);
    return data; // [{token} , {token} , {token}]
}

export const getLanguageName = (language_id) => {
    const LANGUAGE_NAMES = {
        71: "PYTHON",
        62: "JAVA",
        63: "JAVASCRIPT",
        50: "C",
        54: "CPP",
    }

    return LANGUAGE_NAMES[language_id] ?? "Unknown"
}
export const runSubmissions = async ({ source_code, language_id, testcases }) => {
    // 1 & 2. Convert and prepare submissions (encoding is handled by submitBatch)
    const allSubmissions = testcases.map((testcase) => ({
        source_code,
        language_id,
        stdin: testcase.input,
        expected_output: testcase.expectedOutput,
    }));

    // 3. Chunking (max 20 submissions per batch)
    const CHUNK_SIZE = 20;
    const chunks = [];
    for (let i = 0; i < allSubmissions.length; i += CHUNK_SIZE) {
        chunks.push(allSubmissions.slice(i, i + CHUNK_SIZE));
    }

    // 3. Sequential Execution with Throttling
    // Optimization: Verify first test case individually to ensure compilation is successful
    const initialBatch = await submitBatch([allSubmissions[0]]);
    const initialResults = await pollBatchResults([initialBatch[0].token]);
    
    if (initialResults[0].status.id === 6) { // Compilation Error
        const errorMsg = initialResults[0].compile_output || initialResults[0].message || initialResults[0].status.description;
        return {
            status: "Compilation Error",
            total: allSubmissions.length,
            passed: 0,
            failed: allSubmissions.length,
            details: allSubmissions.map(t => ({
                input: t.stdin,
                expected: t.expected_output,
                output: errorMsg,
                status: "Failed"
            }))
        };
    }

    const results = [initialResults[0]];
    const remainingSubmissions = allSubmissions.slice(1);
    
    // Use smaller chunks for Java (62) to prevent overloading the compiler
    const CHUNK_SIZE_ADJUSTED = language_id === 62 ? 5 : 10;

    for (let i = 0; i < remainingSubmissions.length; i += CHUNK_SIZE_ADJUSTED) {
        const chunk = remainingSubmissions.slice(i, i + CHUNK_SIZE_ADJUSTED);
        const submissionResponses = await submitBatch(chunk);
        const tokens = submissionResponses.map((res) => res.token);
        const batchResults = await pollBatchResults(tokens);
        results.push(...batchResults);
    }

    // 7 & 8. Decode (handled by pollBatchResults) and Evaluate Results
    const details = results.map((result, index) => {
        const expected = testcases[index].expectedOutput;
        const stdout = result.stdout || "";
        const isPassed = stdout.trim() === expected.trim() && result.status.id === 3;

        return {
            input: testcases[index].input,
            expected: expected,
            output: stdout,
            status: isPassed ? "Passed" : "Failed",
            judgeStatus: result.status,
            stderr: result.stderr,
            compile_output: result.compile_output,
        };
    });

    const total = details.length;
    const passed = details.filter((d) => d.status === "Passed").length;
    const failed = total - passed;

    // 9. Verdict Logic
    let status = "Accepted";
    const hasCompilationError = results.some((r) => r.status.id === 6); // Compilation Error
    const hasRuntimeError = results.some((r) => [7, 8, 9, 10, 11, 12].includes(r.status.id)); // Runtime Errors

    if (hasCompilationError) {
        status = "Compilation Error";
    } else if (hasRuntimeError) {
        status = "Runtime Error";
    } else if (passed === total) {
        status = "Accepted";
    } else {
        status = "Wrong Answer";
    }


    // 10. Final Return
    return {
        status,
        total,
        passed,
        failed,
        details: details.map((d) => ({
            input: d.input,
            expected: d.expected,
            output: d.output,
            status: d.status,
            stderr: d.stderr,
            compileOutput: d.compile_output,
            judgeStatus: d.judgeStatus,
            memory: d.judgeStatus.memory,
            time: d.judgeStatus.time,
        })),
    };
};
