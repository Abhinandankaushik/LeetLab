import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getUserHeatmap, getUserStats } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/heatmap", authMiddleware, getUserHeatmap);
router.get("/stats", authMiddleware, getUserStats);

export default router;
