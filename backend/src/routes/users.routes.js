import express from "express";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import {
  deleteUserByAdmin,
  getAdminAllUsers,
  getAdminStats,
  getAdminAnalytics,
  getMeBadges,
  getMeProfile,
  getPublicProfile,
  toggleUserRole,
  updateMeProfile,
  getUserTopicStats,
} from "../controllers/users.controller.js";

const usersRoute = express.Router();

usersRoute.get("/me/profile", authMiddleware, getMeProfile);
usersRoute.patch("/me/profile", authMiddleware, updateMeProfile);
usersRoute.get("/me/badges", authMiddleware, getMeBadges);

usersRoute.get("/admin/stats", authMiddleware, checkAdmin, getAdminStats);
usersRoute.get("/admin/analytics", authMiddleware, checkAdmin, getAdminAnalytics);
usersRoute.get("/admin/all", authMiddleware, checkAdmin, getAdminAllUsers);
usersRoute.patch("/admin/:userId/role", authMiddleware, checkAdmin, toggleUserRole);
usersRoute.delete("/admin/:userId", authMiddleware, checkAdmin, deleteUserByAdmin);

usersRoute.get("/:userId/topic-stats", authMiddleware, getUserTopicStats);
usersRoute.get("/:identifier", authMiddleware, getPublicProfile);

export default usersRoute;
