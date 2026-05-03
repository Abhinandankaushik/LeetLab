import express from "express";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth.middleware.js";
import { 
  createContest, 
  getContests, 
  getContestById, 
  registerForContest,
  unregisterFromContest,
  getContestStandings,
  getMyContests
} from "../controllers/contest.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createContest);
router.get("/", optionalAuthMiddleware, getContests);
router.get("/my", authMiddleware, getMyContests);
router.get("/:id", optionalAuthMiddleware, getContestById);
router.get("/:id/standings", getContestStandings);
router.post("/:id/register", authMiddleware, registerForContest);
router.post("/:id/unregister", authMiddleware, unregisterFromContest);

export default router;
