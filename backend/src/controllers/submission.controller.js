import { db } from "../libs/db.js"


export const getAllSubmission = async (req, res) => {

    try {

        const userId = req.user.id;

        const submission = await db.submission.findMany({
            where: {
                userId: userId
            }
        })


        res.status(200).json({
            success: true,
            message: "Submission fetched successfully",
            submission: submission
        })

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Internal Server Error while getting all submission",
            error: err,
        })

    }
}

export const getSubmissionByProblemId = async (req, res) => {

    try {
        const userId = req.user.id

        const problemId = req.params.problemId

        const submission = await db.submission.findMany({
            where: {
                userId: userId,
                problemId: problemId
            }
        })

        res.status(200).json({
            success: true,
            message: "Submission fetched successfully",
            submission
        })
    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Internal Server Error while getting submission by problem id",
            error: err,
        })
    }
}

export const getSubmissionCountByProblemId = async (req, res) => {

    try {

        const problemId = req.params.problemId

        const submissionCount = await db.submission.count({
            where: {
                problemId: problemId
            }
        })

        res.status(200).json({
            success: true,
            message: "Submission count fetched successfully",
            count : submissionCount
        })
    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Internal Server Error while getting submission count by problem id",
            error: err,
        })

    }
}