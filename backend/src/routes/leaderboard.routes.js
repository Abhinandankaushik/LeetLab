import express from "express";
import { getLeaderboard } from "../controllers/leaderboard.controller.js";

const leaderboardRoute = express.Router();

leaderboardRoute.get("/", getLeaderboard);

export default leaderboardRoute;
