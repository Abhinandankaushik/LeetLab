import { db } from "../libs/db.js";

export const getUserHeatmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const activities = await db.userActivity.findMany({
      where: { userId },
      orderBy: { dateKey: "asc" },
    });

    res.status(200).json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [solvedCount, submissionCount, user, solvedByDifficulty] = await Promise.all([
      db.problemSolved.count({ where: { userId } }),
      db.submission.count({ where: { userId } }),
      db.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, longestStreak: true },
      }),
      db.problemSolved.findMany({
        where: { userId },
        include: { problem: { select: { defficulty: true } } },
      }),
    ]);

    const difficultyStats = { EASY: 0, MEDIUM: 0, HARD: 0 };
    solvedByDifficulty.forEach((s) => {
      if (s.problem.defficulty) {
        difficultyStats[s.problem.defficulty]++;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalSolved: solvedCount,
        totalSubmissions: submissionCount,
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
        difficultyStats,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
