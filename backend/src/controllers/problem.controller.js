import { db } from "../libs/db.js"
import { getJudge0LanguageId, submitBatch, pollBatchResults } from "../libs/judge0.lib.js"

const validateProblem = async (referenceSolutions, testcases) => {
    const langsToValidate = Object.keys(referenceSolutions || {});
    
    if (langsToValidate.length === 0) {
        throw new Error("Reference solutions are required for validation");
    }

    for (const language of langsToValidate) {
        const solutionCode = referenceSolutions[language];
        const languageId = getJudge0LanguageId(language);

        if (!languageId) {
            throw new Error(`Language ${language} is not supported`);
        }

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
            if (result.status.id !== 3) {
                const error = new Error(`Validation failed for language ${language}: ${result.status.description}`);
                error.details = result.compile_output || result.stderr;
                throw error;
            }
        }
    }
};

// Working fine in postman -> true
export const createProblem = async (req, res) => {
    const {
        title,
        description,
        defficulty,
        tags,
        examples,
        constraints,
        hints,
        editorial,
        testcases,
        codeSnippets,
        referenceSolutions,
        visibility,
    } = req.body;

    // Check if body is valid
    if (!title || !description || !testcases) {
        return res.status(400).json({ error: "Title, description and testcases are required" });
    }

    try {
        await validateProblem(referenceSolutions, testcases);

        const newProblem = await db.problem.create({
            data: {
                title,
                description,
                defficulty,
                tags,
                examples,
                constraints,
                hints,
                editorial,
                testcases,
                codeSnippets,
                referenceSolutions,
                visibility: visibility || "PUBLIC",
                userId: req.user.id,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Problem Created Successfully",
            problem: newProblem,
        });
    } catch (error) {
        console.error("Create Problem Error:", error);
        return res.status(400).json({
            success: false,
            error: error.message,
            details: error.details
        });
    }
};

// Working fine in postman -> true
export const getAllProblem = async (req, res) => {
    try {
        const include = {
            solvedBy: req.user ? {
                where: {
                    userId: req.user.id
                }
            } : false
        };

        const where = {};
        if (!req.user || req.user?.role !== 'ADMIN') {
            where.visibility = 'PUBLIC';
        }

        const allProblem = await db.problem.findMany({
            where,
            include: include.solvedBy ? { solvedBy: include.solvedBy } : {}
        });

        res.status(200).json({
            success: true,
            message: "All Problems Fetched Successfully",
            problems: allProblem
        });

    } catch (err) {
        console.error("getAllProblem error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error while getting all problems",
            error: err.message,
        });
    }
};

// Working fine in postman -> true
export const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const problem = await db.problem.findUnique({
            where: { id },
            include: {
                contestProblems: {
                    include: {
                        contest: {
                            include: {
                                participants: userId ? {
                                    where: { userId }
                                } : false
                            }
                        }
                    }
                }
            }
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "No Problem Found with this ID"
            });
        }

        // Check visibility
        if (problem.visibility === 'PRIVATE' && req.user?.role !== 'ADMIN') {
            const now = new Date();
            const hasAccessThroughContest = userId && problem.contestProblems.some(cp => {
                const contest = cp.contest;
                const isRegistered = contest.participants.length > 0;
                const hasStarted = new Date(contest.startTime) <= now;
                return isRegistered && hasStarted;
            });

            if (!hasAccessThroughContest) {
                return res.status(403).json({
                    success: false,
                    message: "This problem is private and only accessible during a contest you are registered for."
                });
            }
        }

        res.status(200).json({
            success: true,
            message: "Problem Fetched Successfully",
            problem
        });

    } catch (err) {
        console.error("getProblemById error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error while getting problem by id",
            error: err.message,
        });
    }
};

export const updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            defficulty,
            tags,
            examples,
            constraints,
            hints,
            editorial,
            testcases,
            codeSnippets,
            referenceSolutions,
            visibility,
        } = req.body;

        const existingProblem = await db.problem.findUnique({
            where: { id },
        });

        if (!existingProblem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found",
            });
        }

        // Conditional validation: only run Judge0 if critical fields changed
        const needsValidation = 
            (testcases && JSON.stringify(testcases) !== JSON.stringify(existingProblem.testcases)) ||
            (codeSnippets && JSON.stringify(codeSnippets) !== JSON.stringify(existingProblem.codeSnippets)) ||
            (referenceSolutions && JSON.stringify(referenceSolutions) !== JSON.stringify(existingProblem.referenceSolutions));

        if (needsValidation) {
            await validateProblem(
                referenceSolutions || existingProblem.referenceSolutions,
                testcases || existingProblem.testcases
            );
        }

        const updatedProblem = await db.problem.update({
            where: { id },
            data: {
                title: title ?? existingProblem.title,
                description: description ?? existingProblem.description,
                defficulty: defficulty ?? existingProblem.defficulty,
                tags: Array.isArray(tags) ? tags : existingProblem.tags,
                examples: examples ?? existingProblem.examples,
                constraints: constraints ?? existingProblem.constraints,
                hints: hints ?? existingProblem.hints,
                editorial: editorial ?? existingProblem.editorial,
                testcases: testcases ?? existingProblem.testcases,
                codeSnippets: codeSnippets ?? existingProblem.codeSnippets,
                referenceSolutions: referenceSolutions ?? existingProblem.referenceSolutions,
                visibility: visibility ?? existingProblem.visibility,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Problem updated successfully",
            problem: updatedProblem,
        });
    } catch (err) {
        console.error("Update error:", err);
        return res.status(400).json({
            success: false,
            message: err.message,
            details: err.details
        });
    }
};

// Working fine in postman -> true
export const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;

        const problem = await db.problem.findUnique({
            where: { id }
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "No Problem Found with this ID"
            });
        }

        await db.problem.delete({
            where: { id }
        });

        res.status(200).json({
            success: true,
            message: "Problem Deleted Successfully"
        });

    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error while deleting problem",
            error: err.message,
        });
    }
};

export const getSolvedProblemByUser = async (req, res) => {
    try {
        const problem = await db.problem.findMany({
            where: {
                solvedBy: {
                    some: {
                        userId: req.user.id
                    }
                }
            },
            include: {
                solvedBy: {
                    where: {
                        userId: req.user.id
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: "Solved problems fetched successfully",
            problems: problem
        });

    } catch (err) {
        console.error("getSolvedProblemByUser error:", err);
        res.status(400).json({
            success: false,
            message: "Error while fetching problem solved by current user",
            error: err.message
        });
    }
};
