import { db } from "@repo/db"


export const getAllSubmission = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [submissions, total] = await Promise.all([
            db.submission.findMany({
                where: { userId },
                include: {
                    problem: {
                        select: {
                            id: true,
                            title: true,
                            defficulty: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            db.submission.count({ where: { userId } })
        ]);

        res.status(200).json({
            success: true,
            message: "Submissions fetched successfully",
            submissions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
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
                testCases: {
                    select: {
                        passed: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const formattedSubmissions = submissions.map(sub => ({
            id: sub.id,
            problemId: sub.problemId,
            language: sub.language,
            status: sub.status,
            time: sub.time,
            memory: sub.memory,
            totalTestcases: sub.testCases.length,
            passedTestcases: sub.testCases.filter(tc => tc.passed).length,
            createdAt: sub.createdAt
        }));

        res.status(200).json({
            success: true,
            message: "Submissions fetched successfully",
            submissions: formattedSubmissions
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
            count: submissionCount
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
        const isAdmin = req.user.role === 'ADMIN';
        const submissionId = req.params.submissionId;

        const submission = await db.submission.findFirst({
            where: {
                id: submissionId,
                ...(isAdmin ? {} : { userId }),
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
                        examples: true, // Need examples to identify public cases
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

        // Helper to normalize strings for comparison (trim every line)
        const normalize = (s) => String(s ?? "")
            .replace(/\r\n/g, "\n")
            .split('\n')
            .map(line => line.trim())
            .join('\n')
            .trim();

        // Extract example inputs
        const examples = Array.isArray(submission.problem.examples)
            ? submission.problem.examples
            : submission.problem.examples ? Object.values(submission.problem.examples) : [];
        const exampleInputs = new Set(examples.map(ex => normalize(ex.input)));

        // Separate results: Public Examples vs Hidden Cases
        const publicTestCases = [];
        let hiddenPassedCount = 0;
        let hiddenFailedCount = 0;

        submission.testCases.forEach(tc => {
            const normalizedInput = normalize(tc.stdin);
            const isPublic = exampleInputs.has(normalizedInput);
            if (isAdmin || isPublic) {
                publicTestCases.push(tc);
            } else {
                if (tc.passed) {
                    hiddenPassedCount++;
                } else {
                    hiddenFailedCount++;
                }
            }
        });

        const totalCount = submission.testCases.length;
        const passedCount = submission.testCases.filter(tc => tc.passed).length;

        res.status(200).json({
            success: true,
            message: "Submission fetched successfully",
            submission: {
                ...submission,
                testCases: publicTestCases,
                hiddenPassedCount: isAdmin ? 0 : hiddenPassedCount,
                hiddenFailedCount: isAdmin ? 0 : hiddenFailedCount,
                totalHiddenCases: isAdmin ? 0 : (hiddenPassedCount + hiddenFailedCount),
                totalCount,
                passedCount
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
}