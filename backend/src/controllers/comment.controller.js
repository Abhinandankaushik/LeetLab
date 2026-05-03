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
                },
                ...(req.user ? {
                    votes: {
                        where: { userId: req.user.id },
                        select: { type: true }
                    }
                } : {})
            },
            orderBy: { createdAt: 'asc' }
        });

        const commentsWithVote = comments.map(c => ({
            ...c,
            userVote: c.votes?.[0]?.type || null,
            votes: undefined
        }));

        res.status(200).json({
            success: true,
            comments: commentsWithVote
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while fetching comments",
            error: err.message
        });
    }
};

export const voteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // UPVOTE or DOWNVOTE
        const userId = req.user.id;

        if (!['UPVOTE', 'DOWNVOTE'].includes(type)) {
            return res.status(400).json({ success: false, message: "Invalid vote type" });
        }

        // Check if comment exists
        const comment = await db.comment.findUnique({ where: { id } });
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        const existingVote = await db.vote.findFirst({
            where: {
                userId,
                commentId: id
            }
        });

        if (existingVote) {
            if (existingVote.type === type) {
                // Remove vote if same type clicked again
                await db.vote.delete({ where: { id: existingVote.id } });
                
                const field = type === 'UPVOTE' ? 'upvotes' : 'downvotes';
                await db.comment.update({
                    where: { id },
                    data: {
                        [field]: { decrement: comment[field] > 0 ? 1 : 0 }
                    }
                });
            } else {
                // Change vote type
                await db.vote.update({
                    where: { id: existingVote.id },
                    data: { type }
                });

                const addField = type === 'UPVOTE' ? 'upvotes' : 'downvotes';
                const subField = type === 'UPVOTE' ? 'downvotes' : 'upvotes';

                await db.comment.update({
                    where: { id },
                    data: {
                        [addField]: { increment: 1 },
                        [subField]: { decrement: comment[subField] > 0 ? 1 : 0 }
                    }
                });
            }
        } else {
            // New vote
            await db.vote.create({
                data: {
                    userId,
                    commentId: id,
                    type
                }
            });
            await db.comment.update({
                where: { id },
                data: {
                    [type === 'UPVOTE' ? 'upvotes' : 'downvotes']: { increment: 1 }
                }
            });
        }

        const updated = await db.comment.findUnique({
            where: { id },
            select: { upvotes: true, downvotes: true }
        });

        res.status(200).json({
            success: true,
            votes: updated
        });
    } catch (err) {
        console.error('Error in voteComment:', err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error while voting on comment",
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await db.comment.findUnique({ where: { id } });

    if (!comment) return res.status(404).json({ success: false, message: "Not found" });

    // Admin or Owner
    if (req.user.role !== "ADMIN" && comment.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await db.comment.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
