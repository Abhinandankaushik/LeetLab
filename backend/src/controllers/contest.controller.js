import { db } from "../libs/db.js";

export const createContest = async (req, res) => {
  try {
    const { name, description, startTime, endTime, problems } = req.body;
    const createdById = req.user.id;

    const slug = name.toLowerCase().replace(/ /g, "-") + "-" + Date.now();

    const contest = await db.contest.create({
      data: {
        name,
        slug,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        createdById,
        problems: {
          create: problems.map((p, index) => ({
            problemId: p.id,
            label: String.fromCharCode(65 + index), // A, B, C...
          })),
        },
      },
    });

    res.status(201).json({ success: true, contest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContests = async (req, res) => {
  try {
    const contests = await db.contest.findMany({
      include: {
        _count: {
          select: { participants: true, problems: true },
        },
      },
      orderBy: { startTime: "desc" },
    });
    res.status(200).json({ success: true, contests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContestBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const contest = await db.contest.findUnique({
      where: { slug },
      include: {
        problems: {
          include: { problem: true },
        },
        participants: {
          include: { user: { select: { name: true, username: true } } },
        },
      },
    });

    if (!contest) return res.status(404).json({ success: false, message: "Contest not found" });

    const now = new Date();
    const hasStarted = new Date(contest.startTime) <= now;
    const isAdmin = req.user?.role === 'ADMIN';
    const isRegistered = contest.participants.some(p => p.userId === req.user?.id);

    // If contest hasn't started and not admin, hide problems
    if (!hasStarted && !isAdmin) {
      contest.problems = [];
    } else if (!isAdmin) {
      // If started but not admin, only show private problems if registered
      contest.problems = contest.problems.filter(cp => {
        if (cp.problem.visibility === 'PUBLIC') return true;
        return isRegistered;
      });
    }

    res.status(200).json({ success: true, contest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerForContest = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const contest = await db.contest.findUnique({ where: { slug } });
    if (!contest) return res.status(404).json({ success: false, message: "Contest not found" });

    await db.contestParticipant.upsert({
      where: {
        contestId_userId: {
          contestId: contest.id,
          userId,
        },
      },
      update: {},
      create: {
        contestId: contest.id,
        userId,
      },
    });

    res.status(200).json({ success: true, message: "Registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContestStandings = async (req, res) => {
  try {
    const { slug } = req.params;

    const contest = await db.contest.findUnique({
      where: { slug },
      include: {
        problems: { include: { problem: true } },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, username: true, image: true, rating: true },
            },
          },
        },
      },
    });

    if (!contest) return res.status(404).json({ success: false, message: "Contest not found" });

    // Calculate standings
    // For each participant, find their best submissions for each contest problem during the contest time
    const standings = await Promise.all(
      contest.participants.map(async (p) => {
        const solvedProblems = [];
        let totalPoints = 0;
        let totalTime = 0;

        for (const cp of contest.problems) {
          const bestSubmission = await db.submission.findFirst({
            where: {
              userId: p.userId,
              problemId: cp.problemId,
              status: "Accepted",
              createdAt: {
                gte: contest.startTime,
                lte: contest.endTime,
              },
            },
            orderBy: { createdAt: "asc" },
          });

          if (bestSubmission) {
            const timeTaken = Math.floor((new Date(bestSubmission.createdAt) - new Date(contest.startTime)) / 1000 / 60);
            solvedProblems.push({
              label: cp.label,
              points: cp.points,
              time: timeTaken,
            });
            totalPoints += cp.points;
            totalTime += timeTaken;
          }
        }

        return {
          user: p.user,
          solvedProblems,
          totalPoints,
          totalTime,
        };
      })
    );

    // Sort by points (desc) then time (asc)
    standings.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return a.totalTime - b.totalTime;
    });

    res.status(200).json({
      success: true,
      standings: standings.map((s, idx) => ({ ...s, rank: idx + 1 })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
