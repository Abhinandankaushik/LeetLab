import express from "express";
import { 
    addComment, 
    getCommentsByDiscussion,
    voteComment
} from "../controllers/comment.controller.js";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:discussionId", optionalAuthMiddleware, getCommentsByDiscussion);
router.post("/add", authMiddleware, addComment);
router.post("/vote/:id", authMiddleware, voteComment);

export default router;
