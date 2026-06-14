import { db } from "@repo/db";

const buildProfilePayload = async (userId, isPublic = false) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      role: true,
      headline: true,
      bio: true,
      country: true,
      college: true,
      githubUrl: true,
      linkedinUrl: true,
      websiteUrl: true,
      skills: true,
      currentStreak: true,
      longestStreak: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return null;
  }

  if (isPublic) {
    delete user.email;
    delete user.role;
  }

  const [
    totalSolved,
    totalSubmissions,
    acceptedSubmissions,
    solvedByDifficulty,
    recentSubmissions,
    tagStats,
    allUsersCount,
    userRank,
    languageStats,
    discussCount,
  ] = await Promise.all([
    db.problemSolved.count({ where: { userId } }),
    db.submission.count({ where: { userId } }),
    db.submission.count({ where: { userId, status: "Accepted" } }),
    db.problem.groupBy({
      by: ["defficulty"],
      where: {
        solvedBy: {
          some: { userId },
        },
      },
      _count: { id: true },
    }),
    db.submission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: isPublic ? 10 : 15,
      select: {
        id: true,
        status: true,
        language: true,
        createdAt: true,
        problem: {
          select: {
            id: true,
            title: true,
            defficulty: true,
          },
        },
      },
    }),
    db.problem.findMany({
      where: {
        solvedBy: {
          some: { userId },
        },
      },
      select: {
        tags: true,
      },
    }),
    db.user.count(),
    db.user.count({
      where: {
        rating: { gt: user.rating || 0 }
      }
    }),
    db.submission.groupBy({
      by: ["language"],
      where: { userId, status: "Accepted" },
      _count: { id: true }
    }),
    db.discussion.count({ where: { userId } }),
  ]);

  // Generate distribution for percentile chart (dynamic)
  const distribution = new Array(20).fill(0); // Mock distribution for now
  distribution[5] = 10; distribution[8] = 25; distribution[10] = 50; distribution[12] = 20;

  const difficultyStats = { EASY: 0, MEDIUM: 0, HARD: 0 };
  solvedByDifficulty.forEach((item) => {
    difficultyStats[item.defficulty] = item._count.id;
  });

  const totalProblems = await db.problem.count({ where: { visibility: "PUBLIC" } });
  const diffTotal = await db.problem.groupBy({
    by: ["defficulty"],
    where: { visibility: "PUBLIC" },
    _count: { id: true }
  });
  const totalByDiff = { EASY: 0, MEDIUM: 0, HARD: 0 };
  diffTotal.forEach(d => totalByDiff[d.defficulty] = d._count.id);

  const tagCount = new Map();
  tagStats.forEach((item) => {
    item.tags.forEach((tag) => {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
    });
  });

  const normalizedTagStats = Array.from(tagCount.entries())
    .map(([tag, solved]) => ({ tag, solved }))
    .sort((a, b) => b.solved - a.solved);

  const skills = {
    advanced: normalizedTagStats.filter(s => s.solved >= 15).slice(0, 5),
    intermediate: normalizedTagStats.filter(s => s.solved >= 5 && s.solved < 15).slice(0, 5),
    fundamental: normalizedTagStats.filter(s => s.solved < 5).slice(0, 5)
  };

  const languages = languageStats.map(l => ({
    name: l.language,
    count: l._count.id
  })).sort((a, b) => b.count - a.count);

  const percentile = allUsersCount > 0 ? Number(((userRank / allUsersCount) * 100).toFixed(1)) : 100;
  const acceptanceRate = totalSubmissions > 0 ? Number(((acceptedSubmissions / totalSubmissions) * 100).toFixed(2)) : 0;

  const badges = [];
  if (totalSolved >= 25) badges.push({ key: "starter", label: "Starter", tone: "easy" });
  if (totalSolved >= 100) badges.push({ key: "hundred", label: "Century", tone: "medium" });
  if (difficultyStats.HARD >= 25) badges.push({ key: "hard-hunter", label: "Hard Hunter", tone: "hard" });
  if (user.currentStreak >= 7) badges.push({ key: "streak-7", label: "7 Day Streak", tone: "easy" });

  const activitySubmissions = await db.submission.findMany({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const heatmap = {};
  activitySubmissions.forEach((s) => {
    const date = s.createdAt.toISOString().split("T")[0];
    heatmap[date] = (heatmap[date] || 0) + 1;
  });

  const activeDays = Object.keys(heatmap).length;
  const startYear = new Date(user.createdAt).getFullYear();
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= startYear; y--) years.push(y);

  return {
    user,
    badges,
    stats: {
      totalSolved,
      totalProblems,
      totalByDiff,
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate,
      difficultyStats,
      activeDays,
      rank: userRank + 1,
      allUsersCount,
      percentile: 100 - percentile,
      following: 0,
      followers: 0,
      views: 0, // Would need a separate table/field in real app
      solutions: totalSolved,
      discuss: discussCount,
      reputation: user.reputation || 0,
      distribution
    },
    languages,
    skills,
    tagStats: normalizedTagStats.slice(0, 12),
    recentSubmissions,
    activityHeatmap: heatmap,
    activityKeys: Object.keys(heatmap),
    availableYears: years
  };
};

export const getMeProfile = async (req, res) => {
  try {
    const profile = await buildProfilePayload(req.user.id, false);
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile", error: String(error) });
  }
};

export const getPublicProfile = async (req, res) => {
  const { identifier } = req.params;

  try {
    const user = await db.user.findFirst({
      where: {
        OR: [{ id: identifier }, { username: identifier }, { name: identifier }],
      },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await buildProfilePayload(user.id, true);
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch public profile", error: String(error) });
  }
};

export const updateMeProfile = async (req, res) => {
  const allowedFields = [
    "name",
    "username",
    "image",
    "headline",
    "bio",
    "country",
    "college",
    "githubUrl",
    "linkedinUrl",
    "websiteUrl",
    "skills",
  ];

  const data = {};
  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      data[field] = req.body[field];
    }
  });

  if (Array.isArray(data.skills)) {
    data.skills = data.skills
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  if (typeof data.username === "string") {
    data.username = data.username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(data.username)) {
      return res.status(400).json({ message: "Username must be 3-24 chars with letters, numbers, underscore" });
    }
  }

  try {
    const updatedUser = await db.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        role: true,
        headline: true,
        bio: true,
        country: true,
        college: true,
        githubUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
        skills: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    return res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile", error: String(error) });
  }
};

export const getMeBadges = async (req, res) => {
  try {
    const profile = await buildProfilePayload(req.user.id);
    return res.status(200).json({ badges: profile?.badges ?? [] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch badges", error: String(error) });
  }
};

export const getAdminStats = async (_req, res) => {
  try {
    const [users, problems, submissions, contests, recentUsers] = await Promise.all([
      db.user.count(),
      db.problem.count(),
      db.submission.count(),
      db.contest.count(),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          rating: true
        },
      }),
    ]);

    return res.status(200).json({
      users,
      problems,
      submissions,
      contests,
      recentUsers,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch admin stats", error: String(error) });
  }
};

export const getAdminAnalytics = async (_req, res) => {
  try {
    // 1. Submissions per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const submissionActivity = await db.submission.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      _count: { id: true }
    });

    // Normalize activity by day
    const submissionMap = {};
    submissionActivity.forEach(s => {
      const day = s.createdAt.toISOString().split("T")[0];
      submissionMap[day] = (submissionMap[day] || 0) + s._count.id;
    });

    const submissionChart = Object.entries(submissionMap).map(([date, count]) => ({ date, count }));

    // 2. Difficulty distribution
    const difficultyDist = await db.problem.groupBy({
      by: ["defficulty"],
      _count: { id: true }
    });

    // 3. User growth
    const userGrowth = await db.user.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: { id: true }
    });

    // 4. Popular Problems
    const popularProblems = await db.submission.groupBy({
      by: ["problemId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5
    });

    const problemTitles = await db.problem.findMany({
      where: { id: { in: popularProblems.map(p => p.problemId) } },
      select: { id: true, title: true }
    });

    const popularProblemsChart = popularProblems.map(p => ({
      title: problemTitles.find(t => t.id === p.problemId)?.title || "Unknown",
      count: p._count.id
    }));

    // 5. Contest Summary
    const contestSummary = await db.contest.findMany({
       select: {
         id: true,
         name: true,
         status: true,
         _count: { select: { participants: true } }
       }
    });

    return res.status(200).json({
      submissionChart,
      difficultyDist: difficultyDist.map(d => ({ name: d.defficulty, value: d._count.id })),
      userGrowth: userGrowth.length,
      popularProblems: popularProblemsChart,
      contestSummary
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Analytics failed" });
  }
};

export const getAdminAllUsers = async (_req, res) => {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users", error: String(error) });
  }
};

export const toggleUserRole = async (req, res) => {
  const { userId } = req.params;

  if (userId === req.user.id) {
    return res.status(400).json({ message: "Cannot change your own role" });
  }

  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: nextRole },
      select: { id: true, role: true },
    });

    return res.status(200).json({ message: "Role updated", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update role", error: String(error) });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  const { userId } = req.params;

  if (userId === req.user.id) {
    return res.status(400).json({ message: "Cannot delete your own account" });
  }

  try {
    await db.user.delete({ where: { id: userId } });
    return res.status(200).json({ message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user", error: String(error) });
  }
};
