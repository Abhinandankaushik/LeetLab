import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
    getAllPlaylists,
    getPlaylistById,
    createPlaylist,
    addProblemsToPlaylist,
    deletePlaylist,
    removeProblemsFromPlaylist
} from "../controllers/playlist.controller.js";

const playlistRoute = express.Router();

playlistRoute.get("/", authMiddleware, getAllPlaylists);
playlistRoute.post("/create-playlist", authMiddleware, createPlaylist);
playlistRoute.get("/:id", authMiddleware, getPlaylistById);
playlistRoute.delete("/:id", authMiddleware, deletePlaylist);
playlistRoute.post("/:id/add-problem", authMiddleware, addProblemsToPlaylist);
playlistRoute.delete("/:id/remove-problem", authMiddleware, removeProblemsFromPlaylist);

export default playlistRoute;