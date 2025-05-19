import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getAllListDetails, getPlaylistDetailsById, createPlaylist, addProblemToPlaylist, deletePlaylist, removeProblemFromPlaylist } from "../controllers/playlist.controller.js"; 

const playlistRoute = express.Router();

playlistRoute.get("/", authMiddleware, getAllListDetails)

playlistRoute.get("/:playlistId",authMiddleware , getPlaylistDetailsById)

playlistRoute.post("/create-playlist", authMiddleware, createPlaylist)

playlistRoute.post("/:playlistId/add-problem", authMiddleware, addProblemToPlaylist)

playlistRoute.delete("/:playlistId", authMiddleware, deletePlaylist)

playlistRoute.delete("/:playlistId/remove-problem", authMiddleware, removeProblemFromPlaylist)


export default playlistRoute;