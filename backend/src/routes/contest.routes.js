import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { 
  createContest, 
  getContests, 
  getContestBySlug, 
  registerForContest,
  getContestStandings
} from "../controllers/contest.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createContest);
router.get("/", getContests);
router.get("/:slug", getContestBySlug);
router.get("/:slug/standings", getContestStandings);
router.post("/:slug/register", authMiddleware, registerForContest);

export default router;
