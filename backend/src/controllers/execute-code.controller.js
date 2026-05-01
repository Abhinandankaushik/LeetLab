import { submitBatch, pollBatchResults, getLanguageName } from "../libs/judge0.lib.js";
import { db } from "../libs/db.js"
import { updateUserActivity, updateUserStreak } from "../libs/activity.lib.js";

export const excutecode = async (req, res) => {

    try {

        const { source_code, language_id, expected_outputs, stdin, problemId, isSubmit } = req.body;

        const userId = req.user.id;

        if (
            typeof source_code !== "string" ||
            !source_code.trim() ||
            typeof language_id !== "number" ||
            typeof problemId !== "string" ||
            !problemId.trim()
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid execution payload",
            });
        }

        // Check problem visibility before execution
        const problem = await db.problem.findUnique({
            where: { id: problemId },
            include: {
                contestProblems: {
                    include: {
                        contest: {
                            include: {
                                participants: {
                                    where: { userId: userId }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                error: "Problem not found",
            });
        }

        if (problem.visibility === 'PRIVATE' && req.user.role !== 'ADMIN') {
            const now = new Date();
            const hasAccessThroughContest = problem.contestProblems.some(cp => {
                const contest = cp.contest;
                const isRegistered = contest.participants.length > 0;
                const hasStarted = new Date(contest.startTime) <= now;
                return isRegistered && hasStarted;
            });

            if (!hasAccessThroughContest) {
                return res.status(403).json({
                    success: false,
                    error: "This problem is private and only accessible during a contest you are registered for.",
                });
            }
        }

        //validate test cases

        if (
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length ||
            stdin.length > 25
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid test cases"
            });
        }

        //2. prepare each test cases for judge0 batch submission

        const submission = stdin.map((input) => ({
            source_code: source_code.slice(0, 50000),
            language_id,
            stdin: input,
        }));

        //3. Send batch of submission to judge0
        const submitResponse = await submitBatch(submission);

        const tokens = submitResponse.map((r) => r.token);

        //4. Poll for results
        const results = await pollBatchResults(tokens);

        //Analyze test case results

        let allPassed = true;
        const detailedResults = results.map((result, index) => {

            const stdout = result.stdout?.trim();
            const expected_output = expected_outputs[index]?.trim();
            const passed = stdout === expected_output;

            if (!passed) allPassed = false;

            return {
                testCase: index + 1,
                passed,
                stdout,
                stdin: stdin[index],
                expected: expected_output,
                stderr: result.stderr || null,
                compileOutput: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory} KB` : undefined,
                time: result.time ? `${result.time} s` : undefined,
            }

        })

        if (!isSubmit) {
            // If just "Run", don't save to DB, just return results
            return res.status(200).json({
                success: true,
                message: "code executed successfully",
                submission: {
                    status: allPassed ? "Accepted" : "Wrong Answer",
                    language: getLanguageName(language_id),
                    testCases: detailedResults
                },
            })
        }

        // If "Submit", store submission summary in database
        const submissionData = await db.submission.create({
            data: {
                userId,
                problemId,
                sourceCode: { code: source_code }, // Wrap in object for Prisma JSON
                language: getLanguageName(language_id),
                stdin: stdin.join("\n"),
                stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
                stderr: detailedResults.some((r) => r.stderr) ? JSON.stringify(detailedResults.map((r) => r.stderr)) : null,
                compileOutput: detailedResults.some((r) => r.compileOutput) ? JSON.stringify(detailedResults.map((r) => r.compileOutput)) : null,
                status: allPassed ? "Accepted" : "Wrong Answer",
                memory: detailedResults.some((r) => r.memory) ? JSON.stringify(detailedResults.map((r) => r.memory)) : null,
                time: detailedResults.some((r) => r.time) ? JSON.stringify(detailedResults.map((r) => r.time)) : null,
            }
        });

        //if All passed = true mark problem as solved for the current user
        if (allPassed) {
            await db.problemSolved.upsert({
                where: {
                    userId_problemId: {
                        userId, problemId
                    }
                },
                update: {},
                create: {
                    userId, problemId
                }
            });
            
            // Update streak on successful solve
            await updateUserStreak(userId);
        }

        // Update activity heatmap for any submission attempt
        await updateUserActivity(userId);

        //save individual test case results in db-->testCase
        const testCaseResults = detailedResults.map((result) => ({
            submissionId: submissionData.id,
            testCase: result.testCase,
            passed: result.passed,
            stdout: result.stdout,
            stdin: result.stdin,
            expected: result.expected,
            stderr: result.stderr,
            compileOutput: result.compileOutput,
            status: result.status,
            memory: result.memory,
            time: result.time,
        }))


        await db.testCaseResult.createMany({
            data: testCaseResults
        })

        //
        const submissionWithTestCase = await db.submission.findUnique({
            where: {
                id: submissionData.id
            },
            include: {
                testCases: true
            }
        })


        return res.status(200).json({
            success: true,
            message: "code submitted successfully",
            submission: submissionWithTestCase,
        })

    } catch (err) {
        console.error("EXECUTION ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error while executing code",
            error: err.message,
        })
    }

}