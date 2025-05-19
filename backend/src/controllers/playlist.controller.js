import { db } from "../libs/db.js";

//runnig -> true
export const getAllListDetails = async (req, res) => {


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
        })

       
        res.status(200).json({
            success: true,
            message: "Playlist Fetched Successfully",
            playlists
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while getting playlist ",
            error: err
        })
    }

}

//running -> true
export const getPlaylistDetailsById = async (req, res) => {

    try {

        const { playlistId } = req.params;

        const playlist = await db.playlist.findUnique({
            where: {
                id: playlistId,
                userId: req.user.id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        })

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist Not Found"
            })
        }


        res.status(200).json({
            success: true,
            message: "Playlist Fetched Successfully",
            playlist
        })
    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Internal Server Error while getting playlist ",
            error: err
        })
    }

}

//running -> true
export const createPlaylist = async (req, res) => {

    try {

        const { name, description } = req.body;

        const userId = req.user.id

        const playlist = await db.playlist.create({
            data: {
                name,
                description,
                userId
            }
        })

        res.status(200).json({
            success: true,
            message: "Playlist Created Successfully",
            playlist
        })
    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Internal Server Error while creating playlist",
            error: err
        })
    }
}

//runnig -> true
export const addProblemToPlaylist = async (req, res) => {

    try {
        const { playlistId } = req.params
        const { problemIds } = req.body;

        if (!Array.isArray(problemIds) || problemIds.length == 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid Problem Ids"
            })
        }

        //Create records for each problem in playlist
        const problemInPlaylist = await db.problemInPlaylist.createMany({

            data: problemIds.map((problemId) => {
                return {
                    playlistId,
                    problemId,
                }
            })
        })

        res.status(201).json({
            success: true,
            message: "Problem Added To Playlist Successfully",
            problemInPlaylist
        })

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Internal Server Error while adding problem to playlist",
            error: err
        })
    }
}

//runnig -> true
export const deletePlaylist = async (req, res) => {

    try {
        const { playlistId } = req.params
        const deletePlaylist = await db.playlist.delete({
            where: {
                id: playlistId
            }
        })

        res.status(200).json({
            success: true,
            message: "Playlist Deleted Successfully",
            deletePlaylist
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while deleting playlist",
            error: err
        })
    }
}

//runnig -> true
export const removeProblemFromPlaylist = async (req, res) => {

    try {
        const { playlistId } = req.params
        const { problemIds } = req.body

        if (!Array.isArray(problemIds) || problemIds.length == 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid Problem Ids"
            })
        }

        const deletedProblem = await db.problemInPlaylist.deleteMany({
            where: {
                playlistId,
                problemId: {
                    in: problemIds
                }
            }
        })


        res.status(200).json({
            success: true,
            message: "Problem removed from playlist successfully",
            deletedProblem
        })

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Internal Server Error while removing problem from playlist",
            error: err
        })
    }
}

