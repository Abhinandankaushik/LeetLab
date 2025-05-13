import { db } from "../libs/db.js"
import { getJudge0LanguageId, submitBatch, pollBatchResults } from "../libs/judge0.lib.js"

export const createProblem = async (req, res) => {

    //going to get all the data from req body
    const { title, description, defficulty, tags,
        exaples, constraints, testcases, codeSnippets,
        referenceSolutions } = req.body
    // check user roll should be admin

    if (req.user.role !== "ADMIN") {
        return res.status(400).json({
            success: false,
            error: "Only admin can create problem"
        })
    }

    try {
        for (conts[language, solutionCode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0LanguageId(language);

            if (!languageId) {
                return res.status(400).json({
                    success: false,
                    error: `Language :${language} not supported`
                })
            }

            const submissions = testcases.map(({ intput, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: intput,
                expected_output: output,

            }))

            const submissionResults = await submitBatch(submissions);

            const tokens = submissionResults.map((res) => res.token);

            const results = await pollBatchResults(tokens);

            for (let i = 0; i < results.length; i++) {

                const result = results[i];

                if (result.status.id !== 3) {
                    return res.status(400).json({
                        error: `Testcae ${i + 1} failed for language ${language}`
                    })
                }
            }

            const newProblem = await db.problem.create({
                data: {
                    title,
                    description,
                    defficulty,
                    tags,
                    exaples,
                    constraints,
                    testcases,
                    codeSnippets,
                    referenceSolutions,
                    userId: req.user.id
                },
            })

            return res.status(200).json({
                success: true,
                message: "Problem created successfully",
                problem: newProblem
            })


        }
    } catch (err) {
        console.log("error while creating problem", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error while creating problem"
        })
    }

    //loop through 
}

export const getAllProblem = async (req, res) => {
}

export const getProblemById = async (req, res) => {
}

export const updateProblem = async (req, res) => {
}

export const deleteProblem = async (req, res) => {
}

export const getSolvedProblemByUser = async (req, res) => {
}

