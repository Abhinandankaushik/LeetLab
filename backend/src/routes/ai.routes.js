import express from "express";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import { getCodeReview, generateProblem } from "../controllers/ai.controller.js";

const router = express.Router();

router.get("/review/:submissionId", authMiddleware, getCodeReview);
router.post("/generate-problem", authMiddleware, checkAdmin, generateProblem);

export default router;
