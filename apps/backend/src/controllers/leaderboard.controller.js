import { db } from "@repo/db";

const getRangeDate = (range) => {
  const now = new Date();
  if (range === "week") {
    const date = new Date(now);
    date.setDate(now.getDate() - 7);
    return date;
  }
  if (range === "month") {
    const date = new Date(now);
    date.setMonth(now.getMonth() - 1);
    return date;
  }
  return null;
};

const ratingFromDifficulty = (easy, medium, hard) => {
  return 1200 + easy * 8 + medium * 15 + hard * 25;
};

export const getLeaderboard = async (req, res) => {
  const range = req.query.range ?? "all";
  const since = getRangeDate(range);

  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        currentStreak: true,
        longestStreak: true,
        ProblemSolved: {
          where: since ? { createdAt: { gte: since } } : undefined,
          select: {
            problem: {
              select: {
                defficulty: true,
              },
            },
          },
        },
        contestParticipations: {
          select: { id: true }
        }
      },
    });

    const entries = users
      .map((user) => {
        let easy = 0;
        let medium = 0;
        let hard = 0;

        user.ProblemSolved.forEach((item) => {
          if (item.problem.defficulty === "EASY") easy += 1;
          if (item.problem.defficulty === "MEDIUM") medium += 1;
          if (item.problem.defficulty === "HARD") hard += 1;
        });

        const solved = easy + medium + hard;
        const contestCount = user.contestParticipations.length;
        const rating = ratingFromDifficulty(easy, medium, hard) + (contestCount * 50);

        return {
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            image: user.image,
          },
          solved,
          easy,
          medium,
          hard,
          rating,
          contests: contestCount,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
        };
      })
      .filter((entry) => entry.solved > 0)
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.solved - a.solved;
      })
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return res.status(200).json({ entries, range });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch leaderboard", error: String(error) });
  }
};
