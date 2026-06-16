import { db } from "@repo/db";

// Helper to auto-update contest status based on time
const updateContestStatus = async (contest) => {
  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  
  let newStatus = contest.status;
  if (now < start) newStatus = "upcoming";
  else if (now >= start && now <= end) newStatus = "live";
  else newStatus = "ended";

  if (newStatus !== contest.status) {
    await db.contest.update({
      where: { id: contest.id },
      data: { status: newStatus }
    });
    return { ...contest, status: newStatus };
  }
  return contest;
};

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
    const userId = req.user?.id;
    const contests = await db.contest.findMany({
      include: {
        _count: {
          select: { participants: true, problems: true },
        },
        participants: userId ? {
          where: { userId }
        } : false
      },
      orderBy: { startTime: "desc" },
    });

    // Update statuses lazily and map results
    const updatedContests = await Promise.all(contests.map(async (c) => {
      const synced = await updateContestStatus(c);
      return {
        ...synced,
        isRegistered: userId ? c.participants.length > 0 : false,
        participantCount: synced._count?.participants || 0,
        participants: undefined
      };
    }));

    res.status(200).json({ success: true, contests: updatedContests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    console.log(`[GET /contests/${id}] Requested by user: ${userId || 'guest'}`);

    const contest = await db.contest.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      },
      include: {
        problems: {
          include: {
            problem: {
              select: {
                id: true,
                title: true,
                description: true,
                defficulty: true,
                tags: true,
                visibility: true,
                examples: true,
                codeSnippets: true,
                constraints: true,
              }
            }
          },
          orderBy: { label: "asc" }
        },
        participants: {
          where: userId ? { userId } : { userId: "none" },
          select: { userId: true }
        },
        _count: {
          select: { participants: true }
        }
      },
    });

    if (!contest) return res.status(404).json({ success: false, message: "Contest not found" });

    // Fetch user's successful submissions for this contest to show "Solved" status
    let userSolvedProblemIds = new Set();
    if (userId) {
      const solvedSubmissions = await db.submission.findMany({
        where: {
          userId,
          contestId: contest.id,
          status: "Accepted"
        },
        select: { problemId: true }
      });
      userSolvedProblemIds = new Set(solvedSubmissions.map(s => s.problemId));
    }

    // Sync status
    const syncedContest = await updateContestStatus(contest);
    const now = new Date();
    // Security: Controlled problem visibility
    const isEnded = now > new Date(syncedContest.endTime);
    const hasStarted = now >= new Date(syncedContest.startTime);
    const isLive = hasStarted && !isEnded;
    const isAdmin = req.user?.role === 'ADMIN';
    const isRegistered = syncedContest.participants.length > 0;
    
    // Rule:
    // 1. Admins see everything.
    // 2. Registered users see everything while contest is LIVE or UPCOMING (upcoming is masked anyway).
    // 3. After contest ENDS, private problems are masked for everyone except admins.
    
    let problems = syncedContest.problems;
    problems = problems.map(cp => {
      const isSolved = userSolvedProblemIds.has(cp.problem.id);
      const isPrivate = cp.problem.visibility === "PRIVATE";
      
      // If it's private and the contest is over, only admins can see details
      const shouldMask = !isAdmin && (
        !isRegistered || 
        !hasStarted || 
        (isEnded && isPrivate)
      );

      if (shouldMask) {
        return {
          ...cp,
          isSolved,
          problem: {
            id: cp.problem.id,
            title: cp.problem.title,
            defficulty: cp.problem.defficulty,
            visibility: cp.problem.visibility,
          }
        };
      }
      return { ...cp, isSolved };
    });

    const responseData = {
      ...syncedContest,
      problems: problems,
      isRegistered,
      isLive,
      hasStarted,
      participantCount: syncedContest._count?.participants || 0,
      participants: undefined, // Don't leak full participant list
      _count: undefined
    };

    res.status(200).json({ success: true, contest: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerForContest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const contest = await db.contest.findFirst({ where: { OR: [{ id }, { slug: id }] } });
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

export const unregisterFromContest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const contest = await db.contest.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (!contest) return res.status(404).json({ success: false, message: "Contest not found" });

    const result = await db.contestParticipant.deleteMany({
      where: {
        contestId: contest.id,
        userId,
      },
    });

    if (result.count === 0) {
      return res.status(400).json({ success: false, message: "You are not registered for this contest" });
    }

    res.status(200).json({ success: true, message: "Unenrolled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContestStandings = async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await db.contest.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      },
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

export const getMyContests = async (req, res) => {
  try {
    const userId = req.user.id;

    const participations = await db.contestParticipant.findMany({
      where: { userId },
      include: {
        contest: {
          include: {
            _count: {
              select: { participants: true, problems: true },
            },
          },
        },
      },
      orderBy: { contest: { startTime: "desc" } },
    });

    const contests = participations.map(p => ({
      ...p.contest,
      registeredAt: p.registeredAt,
    }));

    res.status(200).json({ success: true, contests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateContest = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startTime, endTime, status, slug } = req.body;

    const updatedContest = await db.contest.update({
      where: { id },
      data: {
        name,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        status,
        slug
      }
    });

    res.status(200).json({ success: true, contest: updatedContest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
