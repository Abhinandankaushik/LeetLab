import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getLeaderboard } from "../controllers/leaderboard.controller.js";

const leaderboardRoute = express.Router();

leaderboardRoute.get("/", getLeaderboard);

export default leaderboardRoute;
