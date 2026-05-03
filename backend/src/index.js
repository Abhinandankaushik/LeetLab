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
dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;


app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : ["http://localhost:5173", "http://localhost:5174"],
    credentials: true, 
}));

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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});