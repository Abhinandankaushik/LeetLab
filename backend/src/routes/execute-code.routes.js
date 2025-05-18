import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js";
import { excutecode } from "../controllers/execute-code.controller.js"; 
const executionRoute = express.Router();

executionRoute.post("/", authMiddleware, excutecode);


export default executionRoute;