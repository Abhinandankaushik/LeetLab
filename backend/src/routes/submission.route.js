import express from "express"
import { authMiddleware} from "../middleware/auth.middleware.js";
import { getAllSubmission, getSubmissionByProblemId, getSubmissionCountByProblemId } from "../controllers/submission.controller.js";    

const submissionRoute = express.Router();

submissionRoute.get("/get-all-submissions",authMiddleware, getAllSubmission);
submissionRoute.get("/get-submission/:problemId",authMiddleware, getSubmissionByProblemId);
submissionRoute.get("/get-submissions-count/:problemId",authMiddleware, getSubmissionCountByProblemId);

export default submissionRoute;