
import { Router } from "express";
import { supabase } from "./db.js";
import { requireAuth } from "./middleware/authMiddleware.js";

const router = Router();

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_ACTIVITY_TYPES = new Set(["lesson", "quiz"]);

// ==================================================
// DATE HELPERS
// ==================================================

/**
 * Return today's date in India Standard Time.
 * Format: YYYY-MM-DD
 */
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

/**
 * Validate a real calendar date in YYYY-MM-DD format.
 */
function isValidDateString(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

/**
 * Shift a YYYY-MM-DD date by a number of days using UTC arithmetic.
 */
function shiftDate(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`);

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

/**
 * Safely convert a database number into a non-negative integer.
 */
function toNonNegativeInteger(value) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.floor(number));
}

// ==================================================
// STREAK CALCULATION
// ==================================================

/**
 * Calculate current and longest streaks from unique activity dates.
 *
 * Current streak:
 * - Includes today if the user was active today.
 * - Otherwise continues from yesterday if the user was active yesterday.
 * - Becomes zero if neither date has activity.
 */
function calculateStreaks(dates, today) {
  const dateSet = new Set(
    dates.filter(isValidDateString)
  );

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

  const sortedDates = [...dateSet].sort();

  for (const date of sortedDates) {
    if (previousDate === null) {
      runningStreak = 1;
    } else if (shiftDate(previousDate, 1) === date) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    longestStreak = Math.max(longestStreak, runningStreak);
    previousDate = date;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
  };
}

// ==================================================
// WEEKLY ACTIVITY
// ==================================================

/**
 * Return activity for Monday through Sunday of the current week.
 */
function getWeeklyActivity(dates, today) {
  const todayDate = new Date(`${today}T00:00:00.000Z`);
  const mondayOffset = (todayDate.getUTCDay() + 6) % 7;
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

// ==================================================
// DATABASE HELPERS
// ==================================================

/**
 * Fetch all distinct activity dates for a user.
 *
 * The learning_activity table is expected to contain:
 * user_id, activity_date, activity_type, activity_ref.
 */
async function getUserActivityDates(userId) {
  const { data, error } = await supabase
    .from("learning_activity")
    .select("activity_date")
    .eq("user_id", userId)
    .order("activity_date", { ascending: true });

  if (error) {
    throw error;
  }

  return [
    ...new Set(
      (data ?? [])
        .map((row) => row.activity_date)
        .filter(isValidDateString)
    ),
  ];
}

/**
 * Fetch or initialize a user's statistics row.
 *
 * Assumptions:
 * - user_stats.user_id is unique.
 * - user_stats.user_id references auth.users(id).
 */
async function getOrCreateUserStats(userId) {
  const { data: existingStats, error: readError } = await supabase
    .from("user_stats")
    .select(
      "user_id, total_xp, current_streak, longest_streak, last_activity_date"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existingStats) {
    return existingStats;
  }

  const { data: newStats, error: insertError } = await supabase
    .from("user_stats")
    .insert({
      user_id: userId,
      total_xp: 0,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
    })
    .select(
      "user_id, total_xp, current_streak, longest_streak, last_activity_date"
    )
    .single();

  if (!insertError) {
    return newStats;
  }

  // Another request may have initialized the row concurrently.
  if (insertError.code === "23505") {
    const { data: stats, error: retryError } = await supabase
      .from("user_stats")
      .select(
        "user_id, total_xp, current_streak, longest_streak, last_activity_date"
      )
      .eq("user_id", userId)
      .single();

    if (retryError) {
      throw retryError;
    }

    return stats;
  }

  throw insertError;
}

// ==================================================
// UPDATE STREAK STATISTICS
// ==================================================

/**
 * Recalculate streak statistics and persist them.
 *
 * XP is read from user_stats but not changed here.
 * Award XP separately when a lesson or quiz is successfully completed.
 */
async function getStreakData(userId) {
  const today = getToday();

  const [dates, stats] = await Promise.all([
    getUserActivityDates(userId),
    getOrCreateUserStats(userId),
  ]);

  const {
    currentStreak,
    longestStreak: calculatedLongestStreak,
  } = calculateStreaks(dates, today);

  // Preserve the historical record if it exceeds the streak
  // currently reconstructed from available activity dates.
  const longestStreak = Math.max(
    toNonNegativeInteger(stats.longest_streak),
    calculatedLongestStreak,
    currentStreak
  );

  const lastActivityDate = dates.length
    ? dates[dates.length - 1]
    : null;

  const { data: updatedStats, error: updateError } = await supabase
    .from("user_stats")
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_activity_date: lastActivityDate,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select(
      "total_xp, current_streak, longest_streak, last_activity_date"
    )
    .single();

  if (updateError) {
    throw updateError;
  }

  return {
    success: true,

    // Frontend-compatible fields.
    totalXP: toNonNegativeInteger(updatedStats.total_xp),
    totalXp: toNonNegativeInteger(updatedStats.total_xp),
    currentStreak: toNonNegativeInteger(
      updatedStats.current_streak
    ),
    longestStreak: toNonNegativeInteger(
      updatedStats.longest_streak
    ),

    activeToday: dates.includes(today),
    today,
    lastActivityDate: updatedStats.last_activity_date ?? null,
    week: getWeeklyActivity(dates, today),
  };
}

// ==================================================
// GET /api/streak
// ==================================================

/**
 * Return the authenticated user's learning statistics.
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.authUser?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authenticated Supabase user was not found.",
      });
    }

    const streak = await getStreakData(userId);

    return res.status(200).json(streak);
  } catch (error) {
    console.error("Get streak error:", error);

    return res.status(500).json({
      success: false,
      error: "Could not calculate learning streak.",
    });
  }
});

// ==================================================
// POST /api/streak/activity
// ==================================================

/**
 * Record lesson or quiz activity for today.
 *
 * Request body:
 * {
 *   "activityType": "lesson",
 *   "activityRef": "python-lesson-1"
 * }
 *
 * The database should enforce uniqueness on:
 * user_id, activity_date, activity_type, activity_ref.
 */
router.post("/activity", requireAuth, async (req, res) => {
  try {
    const userId = req.authUser?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authenticated Supabase user was not found.",
      });
    }

    const { activityType, activityRef } = req.body ?? {};

    if (!ALLOWED_ACTIVITY_TYPES.has(activityType)) {
      return res.status(400).json({
        success: false,
        error: "Activity type must be lesson or quiz.",
      });
    }

    if (
      typeof activityRef !== "string" ||
      !activityRef.trim() ||
      activityRef.trim().length > 150
    ) {
      return res.status(400).json({
        success: false,
        error: "A valid activity reference is required.",
      });
    }

    const today = getToday();
    const cleanActivityRef = activityRef.trim();

    const { error: insertError } = await supabase
      .from("learning_activity")
      .upsert(
        {
          user_id: userId,
          activity_date: today,
          activity_type: activityType,
          activity_ref: cleanActivityRef,
        },
        {
          onConflict:
            "user_id,activity_date,activity_type,activity_ref",
          ignoreDuplicates: true,
        }
      );

    if (insertError) {
      throw insertError;
    }

    const streak = await getStreakData(userId);

    return res.status(200).json({
      ...streak,
      message: "Learning activity recorded.",
    });
  } catch (error) {
    console.error("Record activity error:", error);

    return res.status(500).json({
      success: false,
      error: "Could not record learning activity.",
    });
  }
});

export default router;