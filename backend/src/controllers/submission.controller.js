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
            message: "Internal Server Error",
            error: err.message,
        })

    }
}

export const getSubmissionByProblemId = async (req, res) => {

    try {
        const userId = req.user.id

        const problemId = req.params.problemId

        const submissions = await db.submission.findMany({
            where: {
                userId: userId,
                problemId: problemId
            },
            include: {
                testCases: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        res.status(200).json({
            success: true,
            message: "Submissions fetched successfully",
            submissions
        })
    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
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
            message: "Internal Server Error",
            error: err.message,
        })

    }
}

export const getSubmissionDetailsById = async (req, res) => {

    try {
        const userId = req.user.id;
        const submissionId = req.params.submissionId;

        const submission = await db.submission.findFirst({
            where: {
                id: submissionId,
                userId,
            },
            include: {
                testCases: true,
                problem: {
                    select: {
                        id: true,
                        title: true,
                        defficulty: true,
                        tags: true,
                        description: true,
                    },
                },
            },
        });

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Submission fetched successfully",
            submission,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
}