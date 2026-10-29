
import { Router } from "express";
import db, { saveDatabase } from "./db.js";
import { requireAuth } from "./middleware/authMiddleware.js";

const router = Router();

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// All streak dates use India Standard Time.
function getToday() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function shiftDate(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`);

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

function getUserActivityDates(userId) {
  const result = db.exec(
    `SELECT DISTINCT activity_date
     FROM learning_activity
     WHERE user_id = ?
     ORDER BY activity_date ASC`,
    [userId]
  );

  if (!result.length) {
    return [];
  }

  return result[0].values
    .map(([date]) => date)
    .filter(
      (date) =>
        typeof date === "string" &&
        DATE_PATTERN.test(date)
    );
}

function calculateStreaks(dates, today) {
  const dateSet = new Set(dates);
  const yesterday = shiftDate(today, -1);

  let cursor = dateSet.has(today)
    ? today
    : dateSet.has(yesterday)
      ? yesterday
      : null;

  let currentStreak = 0;

  while (cursor && dateSet.has(cursor)) {
    currentStreak += 1;
    cursor = shiftDate(cursor, -1);
  }

  let longestStreak = 0;
  let runningStreak = 0;
  let previousDate = null;

  for (const date of [...dateSet].sort()) {
    if (previousDate === null) {
      runningStreak = 1;
    } else if (shiftDate(previousDate, 1) === date) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    longestStreak = Math.max(
      longestStreak,
      runningStreak
    );

    previousDate = date;
  }

  return {
    currentStreak,
    longestStreak: Math.max(
      longestStreak,
      currentStreak
    ),
  };
}

function getWeeklyActivity(dates, today) {
  const todayDate = new Date(
    `${today}T00:00:00.000Z`
  );

  const mondayOffset =
    (todayDate.getUTCDay() + 6) % 7;

  const monday = shiftDate(today, -mondayOffset);
  const dateSet = new Set(dates);

  return Array.from({ length: 7 }, (_, index) => {
    const date = shiftDate(monday, index);

    const day = new Date(
      `${date}T00:00:00.000Z`
    ).toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC",
    });

    return {
      date,
      day,
      completed: dateSet.has(date),
      isToday: date === today,
      isFuture: date > today,
    };
  });
}

function getStreakData(userId) {
  const today = getToday();
  const dates = getUserActivityDates(userId);

  const { currentStreak, longestStreak } =
    calculateStreaks(dates, today);

  db.run(
    "UPDATE users SET streak_days = ? WHERE id = ?",
    [currentStreak, userId]
  );

  saveDatabase();

  return {
    currentStreak,
    longestStreak,
    activeToday: dates.includes(today),
    today,
    week: getWeeklyActivity(dates, today),
  };
}

// GET /api/streak
router.get("/", requireAuth, (req, res) => {
  try {
    return res.json(
      getStreakData(Number(req.user.id))
    );
  } catch (error) {
    console.error("Get streak error:", error);

    return res.status(500).json({
      error: "Could not calculate learning streak.",
    });
  }
});

// POST /api/streak/activity
router.post("/activity", requireAuth, (req, res) => {
  try {
    const userId = Number(req.user.id);
    const { activityType, activityRef } = req.body ?? {};

    if (!["lesson", "quiz"].includes(activityType)) {
      return res.status(400).json({
        error: "Activity type must be lesson or quiz.",
      });
    }

    if (
      typeof activityRef !== "string" ||
      !activityRef.trim() ||
      activityRef.trim().length > 150
    ) {
      return res.status(400).json({
        error: "A valid activity reference is required.",
      });
    }

    const today = getToday();

    db.run(
      `INSERT OR IGNORE INTO learning_activity
       (user_id, activity_date, activity_type, activity_ref)
       VALUES (?, ?, ?, ?)`,
      [
        userId,
        today,
        activityType,
        activityRef.trim(),
      ]
    );

    saveDatabase();

    // Return the updated streak immediately.
    return res.json({
      message: "Learning activity recorded.",
      ...getStreakData(userId),
    });
  } catch (error) {
    console.error("Record activity error:", error);

    return res.status(500).json({
      error: "Could not record learning activity.",
    });
  }
});

export default router;