import express from "express";
import { 
    createDiscussion, 
    getAllDiscussions, 
    getProblemDiscussions, 
    voteDiscussion,
    getDiscussionById
} from "../controllers/discussion.controller.js";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/all", optionalAuthMiddleware, getAllDiscussions);
router.get("/problem/:problemId", optionalAuthMiddleware, getProblemDiscussions);
router.get("/:id", optionalAuthMiddleware, getDiscussionById);
router.post("/create", authMiddleware, createDiscussion);
router.post("/vote/:id", authMiddleware, voteDiscussion);

export default router;
