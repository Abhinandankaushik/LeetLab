import { db } from "@repo/db";
import { processExecution } from "../libs/execution.service.js";
import { enqueueExecution, isQueueEnabled } from "../libs/queue.js";

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

        // Prepare test cases (fetch from DB to prevent leaking secrets to frontend)
        let testcasesToRun = [];

        if (isSubmit || (!stdin && !expected_outputs)) {
            testcasesToRun = problem.testcases.map(t => ({
                input: t.input,
                expectedOutput: t.output
            }));
        } else {
            testcasesToRun = stdin.map((input, index) => ({
                input,
                expectedOutput: expected_outputs[index]
            }));
        }

        // Everything the (queued) executor needs — no req/res, so it can run in a worker.
        const payload = {
            userId,
            role: req.user.role,
            source_code,
            language_id,
            problemId,
            isSubmit: Boolean(isSubmit),
            contestId: contestId || null,
            testcasesToRun,
            examples: problem.examples,
        };

        // Heavy work runs through a bounded-concurrency queue so simultaneous
        // submissions can't overwhelm the executor / the server. Falls back to inline
        // execution when the queue is disabled (e.g. local dev without Redis).
        const result = isQueueEnabled
            ? await enqueueExecution(payload)
            : await processExecution(payload);

        return res.status(200).json(result);

    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error while executing code",
            error: error.message,
        });
    }
}
