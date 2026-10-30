import { supabase } from "../lib/supabaseClient";
import {
  STAGES,
  getLessonDatabaseMap,
} from "./stageProgressService";

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Unable to verify your login: ${error.message}`);
  }

  if (!user) {
    throw new Error("Please log in to view your learning dashboard.");
  }

  return user;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

/**
 * Fetch dashboard data for the authenticated Supabase user.
 *
 * This function does not use localStorage.
 */
export async function getStudyMapData() {
  const user = await requireUser();

  const [
    { data: stats, error: statsError },
    { data: stageRows, error: stageError },
    { data: lessonProgressRows, error: lessonProgressError },
    { data: quizRows, error: quizError },
    { dbToFrontend },
  ] = await Promise.all([
    supabase
      .from("user_stats")
      .select(
        "total_xp, current_streak, longest_streak, last_activity_date"
      )
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("lesson_stage_progress")
      .select("lesson_id, stage, completed, completed_at, updated_at")
      .eq("user_id", user.id),

    supabase
      .from("lesson_progress")
      .select("lesson_id, status, xp_earned, completed_at, updated_at")
      .eq("user_id", user.id),

    supabase
      .from("quiz_attempts")
      .select(
        "id, lesson_id, score, total_questions, attempt_number, xp_earned, completed_at"
      )
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false }),

    getLessonDatabaseMap(),
  ]);

  if (statsError) {
    throw new Error(`Unable to load XP and streak: ${statsError.message}`);
  }

  if (stageError) {
    throw new Error(`Unable to load stage progress: ${stageError.message}`);
  }

  if (lessonProgressError) {
    throw new Error(
      `Unable to load lesson progress: ${lessonProgressError.message}`
    );
  }

  if (quizError) {
    throw new Error(`Unable to load quiz attempts: ${quizError.message}`);
  }

  // Completed stages keyed by frontend lesson number.
  const stageProgress = {};

  for (const row of stageRows ?? []) {
    if (!row.completed || !STAGES.includes(row.stage)) continue;

    const frontendId = dbToFrontend.get(Number(row.lesson_id));
    if (!frontendId) continue;

    const key = String(frontendId);
    if (!stageProgress[key]) stageProgress[key] = [];

    if (!stageProgress[key].includes(row.stage)) {
      stageProgress[key].push(row.stage);
    }
  }

  for (const key of Object.keys(stageProgress)) {
    stageProgress[key].sort(
      (a, b) => STAGES.indexOf(a) - STAGES.indexOf(b)
    );
  }

  // Lesson progress keyed by frontend lesson number.
  const lessonProgress = {};

  for (const row of lessonProgressRows ?? []) {
    const frontendId = dbToFrontend.get(Number(row.lesson_id));
    if (!frontendId) continue;

    lessonProgress[String(frontendId)] = {
      status: row.status,
      xpEarned: toNumber(row.xp_earned),
      completedAt: row.completed_at,
      updatedAt: row.updated_at,
    };
  }

  // Quiz attempts are records, not browser-local scores.
  const quizAttemptsByLesson = {};
  const normalizedQuizAttempts = (quizRows ?? []).map((row) => {
    const rawLessonId = String(row.lesson_id ?? "");
    const match = rawLessonId.match(/^python-lesson-([1-9]\d*)$/);

    let frontendId = match ? Number(match[1]) : null;

    if (frontendId == null) {
      const numericId = Number(rawLessonId);
      if (Number.isSafeInteger(numericId)) {
        frontendId =
          dbToFrontend.get(numericId) ??
          (numericId > 0 ? numericId : null);
      }
    }

    const attempt = {
      id: row.id,
      lessonId: frontendId == null ? null : String(frontendId),
      score: row.score == null ? null : toNumber(row.score),
      totalQuestions:
        row.total_questions == null
          ? null
          : toNumber(row.total_questions),
      attemptNumber:
        row.attempt_number == null
          ? null
          : toNumber(row.attempt_number),
      xpEarned: toNumber(row.xp_earned),
      completedAt: row.completed_at,
    };

    if (attempt.lessonId != null) {
      if (!quizAttemptsByLesson[attempt.lessonId]) {
        quizAttemptsByLesson[attempt.lessonId] = [];
      }

      quizAttemptsByLesson[attempt.lessonId].push(attempt);
    }

    return attempt;
  });

  // Prefer user_stats as the canonical total XP.
  const totalXP = toNumber(stats?.total_xp);
  const currentStreak = toNumber(stats?.current_streak);
  const longestStreak = toNumber(stats?.longest_streak);

  // Infer the most recently updated lesson from database progress.
  const latestLesson = [...(lessonProgressRows ?? [])]
    .filter((row) => row.updated_at)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() -
        new Date(a.updated_at).getTime()
    )[0];

  const latestFrontendId = latestLesson
    ? dbToFrontend.get(Number(latestLesson.lesson_id))
    : null;

  const latestStageRows = latestLesson
    ? (stageRows ?? []).filter(
        (row) =>
          Number(row.lesson_id) === Number(latestLesson.lesson_id) &&
          row.completed
      )
    : [];

  const completedStagesForLatest = new Set(
    latestStageRows.map((row) => row.stage)
  );

  const nextStageForLatest =
    STAGES.find((stage) => !completedStagesForLatest.has(stage)) ??
    STAGES[0];

  return {
    userId: user.id,
    totalXP,
    currentStreak,
    longestStreak,
    lastActivityDate: stats?.last_activity_date ?? null,
    stageProgress,
    lessonProgress,
    quizAttempts: normalizedQuizAttempts,
    quizAttemptsByLesson,
    quizAttemptCount: normalizedQuizAttempts.length,
    lastViewed: latestFrontendId
      ? {
          lessonId: String(latestFrontendId),
          stage: nextStageForLatest,
        }
      : null,
  };
}