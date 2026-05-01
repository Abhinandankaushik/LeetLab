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
    while (true) {
        const { data } = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
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

    const { data } = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=true`, {
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
