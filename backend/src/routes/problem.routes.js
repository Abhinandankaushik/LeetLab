import express from "express"
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js"
import {
    createProblem, getAllProblem, getProblemById,
    updateProblem, deleteProblem, getSolvedProblemByUser
} from "../controllers/problem.controller.js"


const problemRoute = express.Router();

problemRoute.post("/create-problem", authMiddleware, checkAdmin, createProblem);

problemRoute.get("/get-all-problems", authMiddleware, getAllProblem);

problemRoute.get("/get-problem/:id", authMiddleware, getProblemById);

problemRoute.put("/update-problem/:id", authMiddleware, checkAdmin, updateProblem);

problemRoute.delete("/delete-problem/:id", authMiddleware, checkAdmin, deleteProblem);

problemRoute.get("/get-solved-problems", authMiddleware, getSolvedProblemByUser);

export default problemRoute;