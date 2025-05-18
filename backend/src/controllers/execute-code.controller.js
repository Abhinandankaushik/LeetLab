import { submitBatch, pollBatchResults, getLanguageName } from "../libs/judge0.lib.js";
import { db } from "../libs/db.js"

export const excutecode = async (req, res) => {

    try {

        const { source_code, language_id, expected_outputs, stdin, problemId } = req.body;

        const userId = req.user.id;

        //validate test cases

        if (
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid test cases"
            });
        }

        //2. prepare each test cases for judge0 batch submission

        const submission = stdin.map((input) => ({
            source_code,
            language_id,
            stdin: input,
        }));

        //3. Send batch of submission to judge0
        const submitResponse = await submitBatch(submission);

        const tokens = submitResponse.map((r) => r.token);

        //4. Poll for results
        const results = await pollBatchResults(tokens);

        console.log('Result------------')
        console.log(results)

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
                expected: expected_output,
                stderr: result.stderr || null,
                compileOutput: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory} KB` : undefined,
                time: result.time ? `${result.time} s` : undefined,
            }

        })

        console.log(detailedResults)

        //strore submission summary in database

        const submissionData = await db.submission.create({
            data: {
                userId,
                problemId,
                sourceCode: source_code,
                language: getLanguageName(language_id),
                stdin: stdin.join("\n"),
                stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
                stderr: detailedResults.some((r) => r.stderr) ? JSON.stringify(detailedResults.map((r) => r.stderr)) : null,
                compileOutput: detailedResults.some((r) => r.compile_output) ? JSON.stringify(detailedResults.map((r) => r.compile_output)) : null,
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
            })
        }

        //save individual test case results in db-->testCase
        const testCaseResults = detailedResults.map((result) => ({
            submissionId: submissionData.id,
            testCase: result.testCase,
            passed: result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr: result.stderr,
            compileOutput: result.compile_output,
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
            message: "code executed successfully",
            submission: submissionWithTestCase,
        })

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Internal Server Error while excuting code",
            error: err,
        })
    }

}