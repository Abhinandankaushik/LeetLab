import { db } from "./db.js";

/**
 * Updates user activity count for the contribution heatmap.
 * @param {string} userId - The ID of the user.
 */
export const updateUserActivity = async (userId) => {
  const dateKey = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    await db.userActivity.upsert({
      where: {
        userId_dateKey: {
          userId,
          dateKey,
        },
      },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        userId,
        dateKey,
        count: 1,
      },
    });
  } catch (error) {
    console.error("Error updating user activity:", error);
  }
};

/**
 * Updates user streaks based on problem-solving activity.
 * @param {string} userId - The ID of the user.
 */
export const updateUserStreak = async (userId) => {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true, lastSolvedDate: true },
    });

    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const lastSolved = user.lastSolvedDate;

    if (lastSolved === today) return; // Already updated today

    let newStreak = 1;
    if (lastSolved) {
      const lastDate = new Date(lastSolved);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = user.currentStreak + 1;
      }
    }

    const updateData = {
      currentStreak: newStreak,
      lastSolvedDate: today,
    };

    if (newStreak > user.longestStreak) {
      updateData.longestStreak = newStreak;
    }

    await db.user.update({
      where: { id: userId },
      data: updateData,
    });
  } catch (error) {
    console.error("Error updating user streak:", error);
  }
};
