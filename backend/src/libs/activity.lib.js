import { db } from "./db.js";

/**
 * Updates user activity count and streaks
 */
export const trackActivity = async (userId) => {
  try {
    const now = new Date();
    const dateKey = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      .toISOString()
      .slice(0, 10);

    // Update daily activity count
    await db.userActivity.upsert({
      where: {
        userId_dateKey: { userId, dateKey },
      },
      update: {
        count: { increment: 1 },
        lastSeenAt: now,
      },
      create: {
        userId,
        dateKey,
        count: 1,
        lastSeenAt: now,
      },
    });

    // Handle streak logic
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { 
        currentStreak: true, 
        longestStreak: true, 
        lastSolvedDate: true 
      },
    });

    if (!user) return;

    let newStreak = user.currentStreak;
    const lastDate = user.lastSolvedDate;

    // Calculate yesterday for continuity check
    const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    if (!lastDate) {
      newStreak = 1;
    } else if (lastDate === dateKey) {
      // Already active today
    } else if (lastDate === yesterdayKey) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    const newLongestStreak = Math.max(user.longestStreak, newStreak);

    await db.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastSolvedDate: dateKey,
      },
    });

  } catch (error) {
    console.error("Activity tracking failed:", error);
  }
};
