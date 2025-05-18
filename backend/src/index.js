import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.js";
import problemRoute from "./routes/problem.js";
import executionRoute from "./routes/execute-code.routes.js";
dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;


app.use(cookieParser());
app.use(express.json());

app.use("/api/v1/auth",authRoute);
app.use("/api/v1/problem",problemRoute);
app.use("/api/v1/execute-code",executionRoute);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});