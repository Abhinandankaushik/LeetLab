import { Worker } from "bullmq";
import {
    EXECUTION_QUEUE_NAME,
    EXECUTION_JOB_TIMEOUT_MS,
    isQueueEnabled,
    buildConnection,
} from "../libs/queue.js";
import { processExecution } from "../libs/execution.service.js";

// How many code executions may run concurrently. This is the throttle that keeps
// Judge0 and the server from being overwhelmed when many users submit at once.
const concurrency = Number(process.env.EXECUTION_CONCURRENCY) || 5;

let executionWorker = null;

export const startExecutionWorker = () => {
    if (!isQueueEnabled) {
        console.log("⚙️  Execution queue disabled (QUEUE_ENABLED=false) — running code inline.");
        return null;
    }
    if (executionWorker) return executionWorker;

    executionWorker = new Worker(
        EXECUTION_QUEUE_NAME,
        async (job) => processExecution(job.data),
        {
            connection: buildConnection(),
            concurrency,
            // Executions poll Judge0 for a while, so keep the lock alive long enough.
            lockDuration: Math.max(60000, EXECUTION_JOB_TIMEOUT_MS + 30000),
        }
    );

    executionWorker.on("failed", (job, err) => {
        console.error(`❌ Execution job ${job?.id} failed:`, err?.message);
    });
    executionWorker.on("error", (err) => {
        console.error("❌ Execution worker error:", err?.message);
    });

    console.log(`⚙️  Execution worker started (concurrency=${concurrency}).`);
    return executionWorker;
};
