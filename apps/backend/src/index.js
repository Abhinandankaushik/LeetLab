import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoute from "./routes/auth.js";
import problemRoute from "./routes/problem.js";
import executionRoute from "./routes/execute-code.routes.js";
import submissionRoute  from "./routes/submission.routes.js";
import discussionRoute from "./routes/discussion.routes.js";
import commentRoute from "./routes/comment.routes.js";

import playlistRoute from "./routes/playlist.routes.js";
import usersRoute from "./routes/users.routes.js";
import leaderboardRoute from "./routes/leaderboard.routes.js";
import contestRoute from "./routes/contest.routes.js";
import analyticsRoute from "./routes/analytics.routes.js";
import aiRoute from "./routes/ai.routes.js";
import ratingRoute from "./routes/rating.routes.js";
import { startExecutionWorker } from "./workers/execution.worker.js";
import { initExecutor, shutdownExecutor } from "./executor/index.js";
dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

// Allow any localhost / 127.0.0.1 port in addition to the explicit allow-list.
// Vite often falls back to 5174, 5175, ... when 5173 is taken, and that must
// not break API calls during local development.
const isLocalhostOrigin = (origin) =>
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(cors({
    origin(origin, callback) {
        // Non-browser clients (curl, server-to-server) send no Origin header.
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || isLocalhostOrigin(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.use("/api/v1/auth",authRoute);
app.use("/api/v1/problems",problemRoute);
app.use("/api/v1/execute-code",executionRoute);
app.use("/api/v1/submissions",submissionRoute);
app.use("/api/v1/discussions",discussionRoute);
app.use("/api/v1/comments", commentRoute);
app.use("/api/v1/playlist",playlistRoute);

app.use("/api/v1/users", usersRoute)
app.use("/api/v1/leaderboard", leaderboardRoute)
app.use("/api/v1/contests", contestRoute);
app.use("/api/v1/analytics", analyticsRoute);
app.use("/api/v1/ai", aiRoute);
app.use("/api/v1/ratings", ratingRoute);

// Start the in-process code-execution worker (bounded concurrency). No-op when
// QUEUE_ENABLED=false.
startExecutionWorker();

// Warm up the container pools (no-op unless CODE_EXECUTOR=docker). Runs in the
// background so the HTTP server can start accepting requests immediately.
initExecutor().catch((e) => console.error("[executor] init failed:", e.message));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down executor pools...`);
    try {
        await shutdownExecutor();
    } catch (e) {
        console.error("[executor] shutdown error:", e.message);
    }
    process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));