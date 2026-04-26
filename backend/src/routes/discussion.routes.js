import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createDiscussion,
  getDiscussionStats,
  getProblemDiscussions,
} from "../controllers/discussion.controller.js";

const discussionRoute = express.Router();

discussionRoute.get("/stats", authMiddleware, getDiscussionStats);
discussionRoute.get("/problem/:problemId", authMiddleware, getProblemDiscussions);
discussionRoute.post("/problem/:problemId", authMiddleware, createDiscussion);

export default discussionRoute;
