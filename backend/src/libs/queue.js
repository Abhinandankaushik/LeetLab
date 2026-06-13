import { Queue, QueueEvents } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

export const EXECUTION_QUEUE_NAME = "code-execution";

// Allow running without Redis (e.g. local dev) — falls back to inline execution.
export const isQueueEnabled = String(process.env.QUEUE_ENABLED ?? "true").toLowerCase() !== "false";

// Max time (ms) a client request will wait for its queued job to finish.
export const EXECUTION_JOB_TIMEOUT_MS = Number(process.env.EXECUTION_JOB_TIMEOUT_MS) || 120000;

// Parse REDIS_URL into BullMQ connection options so each component (Queue,
// Worker, QueueEvents) opens its own connection. `maxRetriesPerRequest: null`
// is required by BullMQ for blocking commands.
export const buildConnection = () => {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    const parsed = new URL(url);
    return {
        host: parsed.hostname,
        port: Number(parsed.port || 6379),
        username: parsed.username || undefined,
        password: parsed.password || undefined,
        maxRetriesPerRequest: null,
    };
};

export const executionQueue = isQueueEnabled
    ? new Queue(EXECUTION_QUEUE_NAME, { connection: buildConnection() })
    : null;

const queueEvents = isQueueEnabled
    ? new QueueEvents(EXECUTION_QUEUE_NAME, { connection: buildConnection() })
    : null;

/**
 * Add an execution job and resolve with its result. The heavy work happens in
 * the worker (bounded concurrency), so many concurrent callers just wait their
 * turn instead of all hammering Judge0 at once.
 */
export const enqueueExecution = async (payload) => {
    if (!executionQueue || !queueEvents) {
        throw new Error("Execution queue is disabled");
    }
    const job = await executionQueue.add("execute", payload, {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: 50,
    });
    return job.waitUntilFinished(queueEvents, EXECUTION_JOB_TIMEOUT_MS);
};
