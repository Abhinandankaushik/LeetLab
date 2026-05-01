import { db } from "../libs/db.js"

export const addComment = async (req, res) => {
    try {
        const { discussionId, content } = req.body;
        const userId = req.user.id;

        const comment = await db.comment.create({
            data: {
                discussionId,
                content,
                userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            comment
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while adding comment",
            error: err.message
        });
    }
};

export const getCommentsByDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const comments = await db.comment.findMany({
            where: { discussionId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' } // Chat style usually oldest to newest
        });

        res.status(200).json({
            success: true,
            comments
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while fetching comments",
            error: err.message
        });
    }
};
