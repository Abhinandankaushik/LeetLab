import express from "express";
import { updateContestRatings, getUserRating, getPredictedRatings } from "../controllers/rating.controller.js";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Only admins should be able to trigger a manual rating update for a contest
router.post("/contest/:id/update", authMiddleware, checkAdmin, updateContestRatings);

// Publicly fetch a user's rating data
router.get("/user/:userId", getUserRating);

// Get rating predictions for a contest (live or ended)
router.get("/contest/:id/predictions", getPredictedRatings);

export default router;
