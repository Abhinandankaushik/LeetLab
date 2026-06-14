import { db } from "@repo/db";

export const getAllPlaylists = async (req, res) => {
    try {
        const playlists = await db.playlist.findMany({
            where: {
                userId: req.user.id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: "Playlists fetched successfully",
            playlists
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while getting playlists",
            error: err.message
        });
    }
};

export const getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params;

        const playlist = await db.playlist.findUnique({
            where: {
                id,
                userId: req.user.id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        });

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Playlist fetched successfully",
            playlist
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while getting playlist details",
            error: err.message
        });
    }
};

export const createPlaylist = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Playlist name is required"
            });
        }

        const playlist = await db.playlist.create({
            data: {
                name,
                description,
                userId
            }
        });

        res.status(201).json({
            success: true,
            message: "Playlist created successfully",
            playlist
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while creating playlist",
            error: err.message
        });
    }
};

export const addProblemsToPlaylist = async (req, res) => {
    try {
        const { id } = req.params; // playlistId
        const { problemIds } = req.body;

        if (!Array.isArray(problemIds) || problemIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty problemIds"
            });
        }

        // Use createMany but wrap in a try-catch to handle potential duplicates (@@unique constraint)
        const data = problemIds.map(problemId => ({
            playlistId: id,
            problemId
        }));

        await db.problemInPlaylist.createMany({
            data,
            skipDuplicates: true
        });

        res.status(200).json({
            success: true,
            message: "Problems added to playlist successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while adding problems to playlist",
            error: err.message
        });
    }
};

export const removeProblemsFromPlaylist = async (req, res) => {
    try {
        const { id } = req.params; // playlistId
        const { problemIds } = req.body;

        if (!Array.isArray(problemIds) || problemIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty problemIds"
            });
        }

        await db.problemInPlaylist.deleteMany({
            where: {
                playlistId: id,
                problemId: {
                    in: problemIds
                }
            }
        });

        res.status(200).json({
            success: true,
            message: "Problems removed from playlist successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while removing problems from playlist",
            error: err.message
        });
    }
};

export const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const playlist = await db.playlist.findUnique({
            where: { id }
        });

        if (!playlist) {
            return res.status(404).json({ success: false, message: "Playlist not found" });
        }

        if (playlist.userId !== req.user.id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        await db.playlist.delete({
            where: { id }
        });

        res.status(200).json({
            success: true,
            message: "Playlist deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while deleting playlist",
            error: err.message
        });
    }
};
