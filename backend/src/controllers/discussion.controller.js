import { db } from "../libs/db.js"

export const createDiscussion = async (req, res) => {
    try {
        const { title, content, problemId, tags, type } = req.body;
        const userId = req.user.id;

        const discussion = await db.discussion.create({
            data: {
                title,
                content,
                problemId: problemId || null,
                userId,
                tags: tags || [],
                type: type || "general",
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
            message: "Discussion created successfully",
            discussion
        });
    } catch (err) {
        console.error("Create discussion error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error while creating discussion",
            error: err.message
        });
    }
};

export const getProblemDiscussions = async (req, res) => {
    try {
        const { problemId } = req.params;
        const discussions = await db.discussion.findMany({
            where: { problemId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                votes: req.user ? {
                    where: { userId: req.user.id },
                    select: { type: true }
                } : false,
                _count: {
                    select: { comments: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Flatten user vote for easier frontend consumption
        const discussionsWithVote = discussions.map(d => ({
            ...d,
            userVote: d.votes?.[0]?.type || null,
            votes: undefined // Remove the array to save bandwidth
        }));

        res.status(200).json({
            success: true,
            discussions: discussionsWithVote
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while fetching discussions",
            error: err.message
        });
    }
};

export const getAllDiscussions = async (req, res) => {
    try {
        const { type, q } = req.query;
        
        const where = {};
        if (type && type !== 'all') {
            if (type === 'problem') {
                where.problemId = { not: null };
            } else {
                where.type = {
                    equals: type,
                    mode: 'insensitive'
                };
            }
        }
        
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { content: { contains: q, mode: 'insensitive' } },
                { tags: { has: q } }
            ];
        }

        const discussions = await db.discussion.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                problem: {
                    select: {
                        title: true
                    }
                },
                votes: req.user ? {
                    where: { userId: req.user.id },
                    select: { type: true }
                } : false,
                _count: {
                    select: { comments: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const discussionsWithVote = discussions.map(d => ({
            ...d,
            userVote: d.votes?.[0]?.type || null,
            votes: undefined
        }));

        res.status(200).json({
            success: true,
            discussions: discussionsWithVote
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while fetching discussions",
            error: err.message
        });
    }
};

export const getDiscussionById = async (req, res) => {
    try {
        const { id } = req.params;
        const discussion = await db.discussion.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                problem: {
                    select: {
                        title: true
                    }
                },
                votes: req.user ? {
                    where: { userId: req.user.id },
                    select: { type: true }
                } : false,
                _count: {
                    select: { comments: true }
                }
            }
        });

        if (!discussion) {
            return res.status(404).json({
                success: false,
                message: "Discussion not found"
            });
        }

        const discussionWithVote = {
            ...discussion,
            userVote: discussion.votes?.[0]?.type || null,
            votes: undefined
        };

        res.status(200).json({
            success: true,
            discussion: discussionWithVote
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error while fetching discussion",
            error: err.message
        });
    }
};

export const voteDiscussion = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // UPVOTE or DOWNVOTE
        const userId = req.user.id;

        // Check if vote exists
        const existingVote = await db.vote.findUnique({
            where: {
                userId_discussionId: {
                    userId,
                    discussionId: id
                }
            }
        });

        // Check if discussion exists and get current counts
        const discussion = await db.discussion.findUnique({ where: { id } });
        if (!discussion) {
            return res.status(404).json({ success: false, message: "Discussion not found" });
        }

        if (existingVote) {
            if (existingVote.type === type) {
                // Remove vote if same type clicked again
                await db.vote.delete({ where: { id: existingVote.id } });
                
                const field = type === 'UPVOTE' ? 'upvotes' : 'downvotes';
                await db.discussion.update({
                    where: { id },
                    data: {
                        [field]: { decrement: discussion[field] > 0 ? 1 : 0 }
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

                await db.discussion.update({
                    where: { id },
                    data: {
                        [addField]: { increment: 1 },
                        [subField]: { decrement: discussion[subField] > 0 ? 1 : 0 }
                    }
                });
            }
        } else {
            // New vote
            await db.vote.create({
                data: {
                    userId,
                    discussionId: id,
                    type
                }
            });
            await db.discussion.update({
                where: { id },
                data: {
                    [type === 'UPVOTE' ? 'upvotes' : 'downvotes']: { increment: 1 }
                }
            });
        }

        const updated = await db.discussion.findUnique({
            where: { id },
            select: { upvotes: true, downvotes: true }
        });

        res.status(200).json({
            success: true,
            votes: updated
        });
    } catch (err) {
        console.error("Vote error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error while voting",
            error: err.message
        });
    }
};
