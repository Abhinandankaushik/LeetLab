import { db } from "../libs/db.js"

// GET /api/profile/:id
const getProfile = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch user details
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Total solved problems
    const totalSolved = await db.problemSolved.count({
      where: { userId: id },
    });

    // Solved by difficulty
    const solvedByDifficulty = await db.problem.groupBy({
      by: ['defficulty'],
      where: {
        solvedBy: {
          some: { userId: id },
        },
      },
      _count: { id: true },
    });
    const difficultyStats = {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
    };
    solvedByDifficulty.forEach((item) => {
      difficultyStats[item.defficulty] = item._count.id;
    });

    // Total problems for percentages
    const totalProblems = await db.problem.count();

    // Submission stats
    const totalSubmissions = await db.submission.count({
      where: { userId: id },
    });
    const acceptedSubmissions = await db.submission.count({
      where: { userId: id, status: 'Accepted' },
    });
    const acceptanceRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;

    // Recent submissions (last 5)
    const recentSubmissions = await db.submission.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        problem: { select: { id: true, title: true, defficulty: true } },
        status: true,
        language: true,
        createdAt: true,
      },
    });

    // Playlists
    const playlists = await db.playlist.findMany({
      where: { userId: id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: { select: { problems: true } },
      },
    });

    // Problems created count
    const createdProblemsCount = await db.problem.count({
      where: { userId: id },
    });

    const totalEasyProblems = await db.problem.findMany({
      where: { defficulty: 'EASY' },
    })

    const totalMediumProblems = await db.problem.findMany({
      where: { defficulty: 'MEDIUM' },
    })

    const totalHardProblems = await db.problem.findMany({
      where: { defficulty: 'HARD' },
    })

    //get all problems solved by the user
    const problemSolveByUser = await db.problem.findMany({
      where: {
        solvedBy: {
          some: {
            userId: id  //[pr1,pr2,pr3]
          }
        }
      },
      include: {
        solvedBy: {
          where: {
            userId: id  //if(pr1.userId == req.user.id)  retunr [pr1,pr2]
          }
        }
      }
    })
   
    let solvedProblemByUser =  {
      Easy : 0,
      Medium : 0,
      Hard : 0,
    }

    problemSolveByUser.forEach(problem => {
      if(problem.defficulty === 'EASY') {
        solvedProblemByUser.Easy += 1
      }
      if(problem.defficulty === 'MEDIUM') {
        solvedProblemByUser.Medium += 1
      }
      if(problem.defficulty === 'HARD') {
        solvedProblemByUser.Hard += 1
      }
    })
   

    res.json({
      user,
      stats: {
        totalSolved,
        difficultyStats,
        totalProblems,
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate: acceptanceRate.toFixed(2),
      },
      recentSubmissions,
      playlists,
      createdProblemsCount, 

      TotalProblemPresentInPlatform : {
        Easy: totalEasyProblems.length,
        Medium: totalMediumProblems.length,
        Hard: totalHardProblems.length
      },

      TotalProblemSolvedByUser: solvedProblemByUser,
     
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default getProfile;