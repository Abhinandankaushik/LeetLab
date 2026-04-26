import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoute from "./routes/auth.js";
import problemRoute from "./routes/problem.js";
import executionRoute from "./routes/execute-code.routes.js";
import submissionRoute  from "./routes/submission.route.js";
import discussionRoute from "./routes/discussion.routes.js";

import playlistRoute from "./routes/playlist.routes.js";
import userProfile from "./routes/user.routes.js";
dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;


app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, 
}));

app.use("/api/v1/auth",authRoute);
app.use("/api/v1/problems",problemRoute);
app.use("/api/v1/execute-code",executionRoute);
app.use("/api/v1/submissions",submissionRoute);
app.use("/api/v1/discussions",discussionRoute);
app.use("/api/v1/playlist",playlistRoute);

app.use("/api/v1/profile",userProfile)

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});