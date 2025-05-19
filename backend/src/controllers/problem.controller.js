import { isCancel } from "axios";
import { db } from "../libs/db.js"
import { getJudge0LanguageId, submitBatch, pollBatchResults } from "../libs/judge0.lib.js"

//working fine in postman -> true
export const createProblem = async (req, res) => {
    const {
        title,
        description,
        defficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
    } = req.body;

    // going to check the user role once again

    try {
        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0LanguageId(language);

            if (!languageId) {
                return res
                    .status(400)
                    .json({ error: `Language ${language} is not supported` });
            }

            //
            const submissions = testcases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }));

            const submissionResults = await submitBatch(submissions);

            const tokens = submissionResults.map((res) => res.token);

            const results = await pollBatchResults(tokens);

            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                console.log("Result-----", result);
                // console.log(
                //   `Testcase ${i + 1} and Language ${language} ----- result ${JSON.stringify(result.status.description)}`
                // );
                if (result.status.id !== 3) {
                    return res.status(400).json({
                        error: `Testcase ${i + 1} failed for language ${language}`,
                    });
                }
            }
        }

        const newProblem = await db.problem.create({
            data: {
                title,
                description,
                defficulty,
                tags,
                examples,
                constraints,
                testcases,
                codeSnippets,
                referenceSolutions,
                userId: req.user.id,
            },
        });

        return res.status(201).json({
            sucess: true,
            message: "Message Created Successfully",
            problem: newProblem,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Error While Creating Problem",
            message: error
        });
    }
};

//working fine in postman -> true
export const getAllProblem = async (req, res) => {

    try {
        const allProblem = await db.problem.findMany();


        if (!allProblem) {
            return res.status(404).json({
                success: false,
                message: "No Problem Found->Problem Db empty"
            })
        }

        res.status(200).json({
            success: true,
            message: "All Problem Fetched Successfully",
            problems: allProblem
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while getting all problem",
            error: err,
        })

    }
}

//working fine in postman -> true
export const getProblemById = async (req, res) => {

    try {
        const { id } = req.params;

        const problem = await db.problem.findUnique({
            where: {
                id
            }
        })

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "No Problem Found On this Id"
            })
        }

        res.status(200).json({
            success: true,
            message: "Problem Fetched Successfully",
            problem
        })

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Internal Server Error while getting problem by id",
            error: err,
        })
    }
}

//Assignment --> flase
export const updateProblem = async (req, res) => {

    //ToDo

}

//working fine in postman -> true
export const deleteProblem = async (req, res) => {

    try {
        const { id } = req.params;

        const problem = await db.problem.findUnique({
            where: {
                id
            }
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "No Problem Found On this Id"
            })
        }

        await db.problem.delete({
            where: {
                id
            }
        })

        res.status(200).json({
            success: true,
            message: "Problem Deleted Successfully"
        })

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Internal Server Error while deleting problem",
            error: err,
        })
    }
}

export const getSolvedProblemByUser = async (req, res) => {

    try {
        const problem = await db.problem.findMany({
            where: {
                solvedBy: {
                    some: {
                        userId: req.user.id  //[pr1,pr2,pr3]
                    }
                }
            },
            include: {
                solvedBy: {
                    where: {
                        userId: req.user.id  //if(pr1.userId == req.user.id)  retunr [pr1,pr2]
                    }
                }
            }
        })

        console.log(problem);


        res.status(200).json({
            success: true,
            message: "Problem fetched successfully",
            problems: problem
        })

    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Error while fetching problem solved by currently logedIn user",
            error: err
        })
    }
}

