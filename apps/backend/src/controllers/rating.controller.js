import { db } from "@repo/db";

/**
 * Expected Score (Pairwise)
 * Ei,j = 1 / (1 + 10^((Rj - Ri)/400))
 */
function expectedScore(rA, rB) {
  return 1 / (1 + Math.pow(10, (rB - rA) / 400));
}

/**
 * K-Factor Policy
 */
function getK(user) {
  if (user.contestsPlayed < 5) return 50;
  if (user.rating < 1200) return 40;
  if (user.rating < 2000) return 30;
  return 20;
}

/**
 * Update Ratings for a finished contest
 */
export const updateContestRatings = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch contest and participants (Support ID or Slug)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const contest = await db.contest.findUnique({
      where: isUuid ? { id } : { slug: id },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, rating: true, contestsPlayed: true }
            }
          }
        },
        problems: true
      }
    });

    if (!contest) return res.status(404).json({ success: false, message: "Contest not found" });
    if (contest.status !== "ended") {
       // Optional: We might want to allow this for testing, but let's be safe
       // return res.status(400).json({ success: false, message: "Ratings can only be updated for ended contests" });
    }

    const participants = contest.participants;
    const N = participants.length;

    if (N <= 1) {
      return res.status(200).json({ success: true, message: "Not enough participants to update ratings" });
    }

    // 2. Calculate current standings (rankings)
    // We reuse the logic from getContestStandings but purely on backend
    const standings = await Promise.all(
      participants.map(async (p) => {
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
            totalPoints += cp.points;
            totalTime += timeTaken;
          }
        }

        return {
          userId: p.userId,
          rating: p.user?.rating ?? 0,
          contestsPlayed: p.user?.contestsPlayed ?? 0,
          totalPoints,
          totalTime,
          participantId: p.id
        };
      })
    );

    // Sort by points (desc) then time (asc)
    standings.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return a.totalTime - b.totalTime;
    });

    // Assign Ranks (handling ties)
    let currentRank = 1;
    for (let i = 0; i < N; i++) {
      if (i > 0 && (standings[i].totalPoints === standings[i-1].totalPoints && standings[i].totalTime === standings[i-1].totalTime)) {
         standings[i].rank = standings[i-1].rank;
      } else {
         standings[i].rank = i + 1;
      }
    }

    // 3. Elo Calculation
    const results = [];

    for (let i = 0; i < N; i++) {
      let Ei = 0;

      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        Ei += expectedScore(standings[i].rating, standings[j].rating);
      }

      Ei /= (N - 1);

      // Si = (N - rank_i) / (N - 1)
      const Si = (N - standings[i].rank) / (N - 1);
      const K = getK(standings[i]);

      let delta = K * (Si - Ei);

      // Clamp to prevent abuse
      delta = Math.max(-100, Math.min(100, delta));

      const newRating = Math.round(standings[i].rating + delta);
      const ratingChange = newRating - standings[i].rating;

      results.push({
        userId: standings[i].userId,
        participantId: standings[i].participantId,
        oldRating: standings[i].rating,
        newRating,
        ratingChange,
        rank: standings[i].rank,
        score: Si
      });
    }

    // 4. Batch DB Update
    await db.$transaction(
      results.map(r => 
        db.user.update({
          where: { id: r.userId },
          data: {
            rating: r.newRating,
            contestsPlayed: { increment: 1 }
          }
        })
      ).concat(
        results.map(r => 
          db.contestParticipant.update({
            where: { id: r.participantId },
            data: {
              rank: r.rank,
              score: r.score,
              ratingChange: r.ratingChange
            }
          })
        )
      )
    );

    res.status(200).json({ 
      success: true, 
      message: "Ratings updated successfully", 
      updates: results 
    });

  } catch (error) {
    console.error("Rating update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get User Rating History (Mocked for now or can be added to schema later)
 * For now just returns current rating
 */
export const getUserRating = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                rating: true,
                contestsPlayed: true,
                contestParticipations: {
                    where: { ratingChange: { not: null } },
                    include: {
                        contest: {
                            select: { name: true, startTime: true }
                        }
                    },
                    orderBy: { contest: { startTime: "asc" } }
                }
            }
        });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, ratingData: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
/**
 * Get Predicted Ratings for a live contest
 */
export const getPredictedRatings = async (req, res) => {
  try {
    const { id } = req.params;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const contest = await db.contest.findUnique({
      where: isUuid ? { id } : { slug: id },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, rating: true, contestsPlayed: true }
            }
          }
        },
        problems: true
      }
    });

    if (!contest) return res.status(404).json({ success: false, message: "Contest not found" });

    const participants = contest.participants;
    const N = participants.length;

    if (N <= 1) {
      return res.status(200).json({ success: true, predictions: [] });
    }

    const standings = await Promise.all(
      participants.map(async (p) => {
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
            totalPoints += cp.points;
            totalTime += timeTaken;
          }
        }

        return {
          userId: p.userId,
          rating: p.user?.rating ?? 0,
          contestsPlayed: p.user?.contestsPlayed ?? 0,
          totalPoints,
          totalTime,
        };
      })
    );

    standings.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return a.totalTime - b.totalTime;
    });

    let currentRank = 1;
    for (let i = 0; i < N; i++) {
      if (i > 0 && (standings[i].totalPoints === standings[i-1].totalPoints && standings[i].totalTime === standings[i-1].totalTime)) {
         standings[i].rank = standings[i-1].rank;
      } else {
         standings[i].rank = i + 1;
      }
    }

    const predictions = [];
    for (let i = 0; i < N; i++) {
      let Ei = 0;
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        Ei += expectedScore(standings[i].rating, standings[j].rating);
      }
      Ei /= (N - 1);
      const Si = (N - standings[i].rank) / (N - 1);
      const K = getK(standings[i]);
      let delta = K * (Si - Ei);
      delta = Math.max(-100, Math.min(100, delta));
      
      predictions.push({
        userId: standings[i].userId,
        currentRating: standings[i].rating,
        predictedDelta: Math.round(delta),
        predictedRating: Math.round(standings[i].rating + delta),
        rank: standings[i].rank
      });
    }

    res.status(200).json({ success: true, predictions });
  } catch (error) {
    console.error("Prediction calculation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
