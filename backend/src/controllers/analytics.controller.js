import { db } from "../libs/db.js";

export const getUserHeatmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;

    const where = { userId };
    if (year && year !== 'all') {
      const startOfYear = new Date(parseInt(year), 0, 1);
      const endOfYear = new Date(parseInt(year), 11, 31, 23, 59, 59);
      where.createdAt = {
        gte: startOfYear,
        lte: endOfYear,
      };
    }

    const submissions = await db.submission.findMany({
      where,
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const heatmap = {};
    submissions.forEach((s) => {
      const date = s.createdAt.toISOString().split("T")[0];
      heatmap[date] = (heatmap[date] || 0) + 1;
    });

    const activities = Object.entries(heatmap).map(([date, count]) => ({
      date,
      count,
    }));

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true }
    });

    res.status(200).json({
      success: true,
      activities,
      totalActive: activities.length,
      currentStreak: user?.currentStreak || 0,
      maxStreak: user?.longestStreak || 0
    });
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
