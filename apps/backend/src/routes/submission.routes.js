import express from "express"
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import { getAllSubmission, getSubmissionByProblemId, getSubmissionCountByProblemId, getSubmissionDetailsById } from "../controllers/submission.controller.js";    

const submissionRoute = express.Router();

submissionRoute.get("/get-all-submissions",authMiddleware, getAllSubmission);
submissionRoute.get("/get-submissions/:problemId",authMiddleware, getSubmissionByProblemId);
submissionRoute.get("/get-submissions-count/:problemId",authMiddleware, getSubmissionCountByProblemId);
submissionRoute.get("/get-submission/:submissionId",authMiddleware, getSubmissionDetailsById);

export default submissionRoute;