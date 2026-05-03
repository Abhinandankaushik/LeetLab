import { submitBatch, pollBatchResults, getLanguageName, runSubmissions } from "../libs/judge0.lib.js";
import { db } from "../libs/db.js"
import { updateUserActivity, updateUserStreak } from "../libs/activity.lib.js";

export const excutecode = async (req, res) => {

    try {

        const { source_code, language_id, expected_outputs, stdin, problemId, isSubmit, contestId } = req.body;



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

        // 2. Prepare test cases (fetch from DB to prevent leaking secrets to frontend)
        let testcasesToRun = [];

        if (isSubmit || (!stdin && !expected_outputs)) {
            // Use hidden test cases from DB for submission or full run
            testcasesToRun = problem.testcases.map(t => ({

                input: t.input,
                expectedOutput: t.output
            }));

        } else {
            // Use custom test cases provided by user for "Run"
            testcasesToRun = stdin.map((input, index) => ({
                input,
                expectedOutput: expected_outputs[index]
            }));
        }



        console.log(`🚀 Executing ${testcasesToRun.length} test cases for problem: ${problem.title}`);

        // 3. Send and Evaluate submissions using the pipeline
        const result = await runSubmissions({
            source_code: source_code,
            language_id,
            testcases: testcasesToRun
        });



        const allPassed = result.status === "Accepted";


        // Map pipeline details back to the controller's format
        const detailedResults = result.details.map((detail, index) => {
            return {
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
            };
        });

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
                stdin: testcasesToRun.map(t => t.input).join("\n"),
                stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
                stderr: detailedResults.some((r) => r.stderr) ? JSON.stringify(detailedResults.map((r) => r.stderr)) : null,
                compileOutput: detailedResults.some((r) => r.compileOutput) ? JSON.stringify(detailedResults.map((r) => r.compileOutput)) : null,
                status: allPassed ? "Accepted" : "Wrong Answer",
                memory: detailedResults.some((r) => r.memory) ? JSON.stringify(detailedResults.map((r) => r.memory)) : null,
                time: detailedResults.some((r) => r.time) ? JSON.stringify(detailedResults.map((r) => r.time)) : null,
                contestId: contestId || null,
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


        // ================== FINAL SANITIZATION LOGIC ==================

        const totalCount = testcasesToRun.length;
        const passedCount = detailedResults.filter(r => r.passed).length;

        // 🔥 Strong normalization (VERY IMPORTANT)
        const normalize = (s) =>
            String(s ?? "")
                .replace(/\r\n/g, "\n")
                .replace(/\s+/g, " ")
                .trim();

        // Extract examples safely
        const examples = Array.isArray(problem.examples)
            ? problem.examples
            : problem.examples
                ? Object.values(problem.examples)
                : [];

        // 🔥 Create normalized example input set
        const exampleInputs = new Set(
            examples.map(ex => normalize(ex.input))
        );


        // ================== FILTERING ==================
        const isAdmin = req.user.role === "ADMIN";
        const publicTestCases = [];
        let hiddenPassedCount = 0;
        let hiddenFailedCount = 0;

        detailedResults.forEach((res) => {
            const normalizedInput = normalize(res.stdin);

            // 🔥 RULE: if exists in examples OR user is admin → ALWAYS show
            const isExample = exampleInputs.has(normalizedInput);

            if (isAdmin || isExample) {
                publicTestCases.push({
                    ...res,
                    type: isExample ? "EXAMPLE" : "HIDDEN (ADMIN VIEW)"
                });
            } else {
                // hidden testcase → only count
                if (res.passed) hiddenPassedCount++;
                else hiddenFailedCount++;
            }
        });



        // ================== FINAL RESPONSE ==================

        return res.status(200).json({
            success: true,
            message: isSubmit
                ? "code submitted successfully"
                : "code executed successfully",

            submission: {
                ...(submissionWithTestCase || {
                    status: allPassed ? "Accepted" : "Wrong Answer",
                    language: getLanguageName(language_id),
                }),

                // 🔥 ONLY example testcases sent (unless admin)
                testCases: publicTestCases,

                // 🔥 hidden summary only (unless admin)
                hiddenPassedCount: isAdmin ? 0 : hiddenPassedCount,
                hiddenFailedCount: isAdmin ? 0 : hiddenFailedCount,
                totalHiddenCases: isAdmin ? 0 : (hiddenPassedCount + hiddenFailedCount)
            },

            // 🔥 overall stats
            totalCount,
            passedCount
        });


    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error while executing code",
            error: error.message,
        })
    }
}