import { db } from "../libs/db.js";

export const getProblemDiscussions = async (req, res) => {
  try {
    const { problemId } = req.params;

    const discussions = await db.discussion.findMany({
      where: { problemId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        problem: {
          select: {
            id: true,
            title: true,
            defficulty: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Discussions fetched successfully",
      discussions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching discussions",
      error,
    });
  }
};

export const createDiscussion = async (req, res) => {
  try {
    const { problemId } = req.params;
    const { title, content } = req.body;

    if (typeof title !== "string" || !title.trim() || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const discussion = await db.discussion.create({
      data: {
        problemId,
        userId: req.user.id,
        title: title.trim().slice(0, 120),
        content: content.trim().slice(0, 4000),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        problem: {
          select: {
            id: true,
            title: true,
            defficulty: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Discussion created successfully",
      discussion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while creating discussion",
      error,
    });
  }
};

export const getDiscussionStats = async (_req, res) => {
  try {
    const stats = await db.problem.findMany({
      select: {
        id: true,
        title: true,
        defficulty: true,
        createdAt: true,
        _count: {
          select: {
            discussions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Discussion stats fetched successfully",
      problems: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching discussion stats",
      error,
    });
  }
};
