import express from "express";
import { 
    addComment, 
    getCommentsByDiscussion 
} from "../controllers/comment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:discussionId", getCommentsByDiscussion);
router.post("/add", authMiddleware, addComment);

export default router;
