import { supabase } from "../lib/supabaseClient";

/**
 * EVOLV Stage Progress Service
 *
 * Supabase is the source of truth for lesson-stage completion.
 *
 * Required tables:
 *   lessons
 *   lesson_stage_progress
 *
 * Required RPC:
 *   complete_lesson_stage(p_lesson_id bigint, p_stage text)
 *
 * Expected lesson slugs:
 *   python-lesson-1
 *   python-lesson-2
 *   python-lesson-3
 *   ...
 */

export const STAGES = [
  "video",
  "concept",
  "hands-on",
  "quiz",
];

export const STAGE_XP = {
  video: 10,
  concept: 10,
  "hands-on": 20,
  quiz: 20,
};

const PYTHON_LESSON_SLUG_PREFIX = "python-lesson-";

const PROGRESS_UPDATED_EVENTS = [
  "evolv-progress-updated",
  "evolv:progress-updated",
];

/* -------------------------------------------------------------------------- */
/* Validation helpers                                                         */
/* -------------------------------------------------------------------------- */

function normalizeLessonId(lessonId) {
  if (lessonId === null || lessonId === undefined) {
    throw new Error("A lesson ID is required.");
  }

  const normalized = String(lessonId).trim();

  if (!normalized) {
    throw new Error("A valid lesson ID is required.");
  }

  return normalized;
}

function normalizeStage(stage) {
  if (!STAGES.includes(stage)) {
    throw new Error(
      `Invalid lesson stage "${stage}". Expected one of: ${STAGES.join(", ")}.`
    );
  }

  return stage;
}

function normalizeDatabaseLessonId(id) {
  const normalized = Number(id);

  if (!Number.isSafeInteger(normalized) || normalized <= 0) {
    throw new Error(
      `Invalid database lesson ID "${id}". Expected a positive integer.`
    );
  }

  return normalized;
}

function throwIfError(error, action) {
  if (!error) {
    return;
  }

  console.error(`[stageProgressService] ${action}:`, error);

  throw new Error(
    error.message || `Unable to ${action.toLowerCase()}.`
  );
}

/* -------------------------------------------------------------------------- */
/* Authentication                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Get the currently authenticated Supabase user.
 *
 * Do not use a user ID from localStorage or from a component.
 * The Supabase session determines whose progress is loaded.
 */
async function getAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  throwIfError(error, "verify your Supabase session");

  if (!user?.id) {
    throw new Error(
      "You are not signed in. Please sign in to load your learning progress."
    );
  }

  return user;
}

/* -------------------------------------------------------------------------- */
/* Lesson lookup                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Convert a frontend lesson ID into its database slug.
 *
 * Examples:
 *   1 -> python-lesson-1
 *   "1" -> python-lesson-1
 *   "python-lesson-1" -> python-lesson-1
 *
 * If your pythonLessons data uses another slug format, update this function
 * to match the actual values in your Supabase lessons table.
 */
function getPythonLessonSlug(frontendLessonId) {
  const id = normalizeLessonId(frontendLessonId);

  if (id.startsWith(PYTHON_LESSON_SLUG_PREFIX)) {
    return id;
  }

  return `${PYTHON_LESSON_SLUG_PREFIX}${id}`;
}

/**
 * Load database lessons corresponding to frontend lesson IDs.
 *
 * We resolve by slug instead of assuming that frontend IDs are the same
 * as database IDs. This matters because lessons.id is a database bigint,
 * while pythonLessons may use simple IDs such as 1, 2, and 3.
 */
async function getDatabaseLessons(frontendLessonIds) {
  const uniqueFrontendIds = [
    ...new Set(frontendLessonIds.map(normalizeLessonId)),
  ];

  if (uniqueFrontendIds.length === 0) {
    return {
      byFrontendId: new Map(),
      byDatabaseId: new Map(),
    };
  }

  const slugs = uniqueFrontendIds.map(getPythonLessonSlug);

  const { data, error } = await supabase
    .from("lessons")
    .select("id, slug, title")
    .in("slug", slugs);

  throwIfError(error, "load lessons from Supabase");

  const lessons = Array.isArray(data) ? data : [];

  const byFrontendId = new Map();
  const byDatabaseId = new Map();

  for (const lesson of lessons) {
    if (!lesson?.slug || lesson.id == null) {
      continue;
    }

    const databaseId = normalizeDatabaseLessonId(lesson.id);

    byDatabaseId.set(String(databaseId), lesson);

    if (lesson.slug.startsWith(PYTHON_LESSON_SLUG_PREFIX)) {
      const frontendId = lesson.slug.slice(
        PYTHON_LESSON_SLUG_PREFIX.length
      );

      byFrontendId.set(String(frontendId), {
        ...lesson,
        id: databaseId,
      });
    }
  }

  return {
    byFrontendId,
    byDatabaseId,
  };
}

/* -------------------------------------------------------------------------- */
/* Fetch all stage progress                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Returns the structure expected by StudyMap.jsx:
 *
 * {
 *   "1": ["video", "concept"],
 *   "2": ["video"],
 *   "3": []
 * }
 *
 * Only completed stages belonging to the currently authenticated user
 * are returned.
 *
 * Lessons without saved progress are included with an empty array.
 */
export async function getAllStageProgress(frontendLessons = null) {
  const user = await getAuthenticatedUser();

  let lessons;

  if (Array.isArray(frontendLessons)) {
    lessons = frontendLessons;
  } else {
    /*
     * This service intentionally avoids importing pythonLessons here.
     * That keeps the service independent from frontend content modules.
     *
     * The default query loads the Python lessons by their expected slugs.
     * If you have more than 100 lessons, use pagination or pass the
     * frontend lesson list as the argument.
     */
    const { data, error } = await supabase
      .from("lessons")
      .select("id, slug, title")
      .like("slug", `${PYTHON_LESSON_SLUG_PREFIX}%`)
      .order("position", { ascending: true });

    throwIfError(error, "load Python lessons from Supabase");

    const databaseLessons = Array.isArray(data) ? data : [];

    const result = {};

    for (const lesson of databaseLessons) {
      if (lesson?.slug && lesson.id != null) {
        const frontendId = lesson.slug.slice(
          PYTHON_LESSON_SLUG_PREFIX.length
        );

        result[frontendId] = [];
      }
    }

    if (databaseLessons.length === 0) {
      return result;
    }

    const databaseLessonIds = databaseLessons.map((lesson) =>
      normalizeDatabaseLessonId(lesson.id)
    );

    const { data: progressRows, error: progressError } =
      await supabase
        .from("lesson_stage_progress")
        .select("lesson_id, stage, completed")
        .eq("user_id", user.id)
        .in("lesson_id", databaseLessonIds)
        .eq("completed", true);

    throwIfError(
      progressError,
      "load your completed lesson stages"
    );

    for (const row of progressRows || []) {
      if (!STAGES.includes(row.stage)) {
        continue;
      }

      const databaseLesson = databaseLessons.find(
        (lesson) => String(lesson.id) === String(row.lesson_id)
      );

      if (!databaseLesson?.slug) {
        continue;
      }

      const frontendId = databaseLesson.slug.slice(
        PYTHON_LESSON_SLUG_PREFIX.length
      );

      if (!Array.isArray(result[frontendId])) {
        result[frontendId] = [];
      }

      if (!result[frontendId].includes(row.stage)) {
        result[frontendId].push(row.stage);
      }
    }

    for (const lessonId of Object.keys(result)) {
      result[lessonId] = STAGES.filter((stage) =>
        result[lessonId].includes(stage)
      );
    }

    return result;
  }

  /*
   * If a component passes its frontend lesson list, resolve those lessons
   * first and then fetch only the authenticated user's progress.
   */
  const frontendLessonIds = lessons.map((lesson) =>
    normalizeLessonId(lesson.id)
  );

  const { byFrontendId } = await getDatabaseLessons(
    frontendLessonIds
  );

  const result = {};

  for (const frontendId of frontendLessonIds) {
    result[frontendId] = [];
  }

  const databaseLessonIds = frontendLessonIds
    .map((frontendId) => byFrontendId.get(frontendId)?.id)
    .filter((id) => Number.isSafeInteger(id));

  if (databaseLessonIds.length === 0) {
    return result;
  }

  const { data, error } = await supabase
    .from("lesson_stage_progress")
    .select("lesson_id, stage, completed")
    .eq("user_id", user.id)
    .in("lesson_id", databaseLessonIds)
    .eq("completed", true);

  throwIfError(error, "load your completed lesson stages");

  const frontendIdByDatabaseId = new Map();

  for (const [frontendId, lesson] of byFrontendId.entries()) {
    frontendIdByDatabaseId.set(String(lesson.id), frontendId);
  }

  for (const row of data || []) {
    if (!STAGES.includes(row.stage)) {
      continue;
    }

    const frontendId = frontendIdByDatabaseId.get(
      String(row.lesson_id)
    );

    if (
      frontendId !== undefined &&
      !result[frontendId].includes(row.stage)
    ) {
      result[frontendId].push(row.stage);
    }
  }

  for (const frontendId of Object.keys(result)) {
    result[frontendId] = STAGES.filter((stage) =>
      result[frontendId].includes(stage)
    );
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Read one lesson's stage progress                                           */
/* -------------------------------------------------------------------------- */

/**
 * Fetch the completed stages for one frontend lesson ID.
 *
 * Example:
 *   await getLessonStageProgress(1)
 *   // ["video", "concept"]
 */
export async function getLessonStageProgress(frontendLessonId) {
  const user = await getAuthenticatedUser();
  const frontendId = normalizeLessonId(frontendLessonId);

  const { byFrontendId } = await getDatabaseLessons([frontendId]);

  const lesson = byFrontendId.get(frontendId);

  if (!lesson) {
    throw new Error(
      `The lesson "${frontendId}" was not found in Supabase. Check its slug.`
    );
  }

  const { data, error } = await supabase
    .from("lesson_stage_progress")
    .select("stage, completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .eq("completed", true);

  throwIfError(error, "load this lesson's stage progress");

  const completedStages = new Set(
    (data || [])
      .map((row) => row.stage)
      .filter((stage) => STAGES.includes(stage))
  );

  return STAGES.filter((stage) => completedStages.has(stage));
}

/* -------------------------------------------------------------------------- */
/* Complete a stage using the database RPC                                   */
/* -------------------------------------------------------------------------- */

/**
 * Complete a lesson stage through the PostgreSQL RPC.
 *
 * The RPC validates the stage order and updates:
 *   lesson_stage_progress
 *   lesson_progress
 *   user_stats.total_xp
 *
 * Do not directly insert a completed stage from the browser.
 */
export async function saveStageCompletion(
  frontendLessonId,
  stage
) {
  await getAuthenticatedUser();

  const frontendId = normalizeLessonId(frontendLessonId);
  const safeStage = normalizeStage(stage);

  const { byFrontendId } = await getDatabaseLessons([frontendId]);

  const lesson = byFrontendId.get(frontendId);

  if (!lesson) {
    throw new Error(
      `The lesson "${frontendId}" was not found in Supabase. Expected slug "${getPythonLessonSlug(frontendId)}".`
    );
  }

  const { data, error } = await supabase.rpc(
    "complete_lesson_stage",
    {
      p_lesson_id: normalizeDatabaseLessonId(lesson.id),
      p_stage: safeStage,
    }
  );

  throwIfError(error, `complete the ${safeStage} stage`);

  if (typeof window !== "undefined") {
    for (const eventName of PROGRESS_UPDATED_EVENTS) {
      window.dispatchEvent(new Event(eventName));
    }

    window.dispatchEvent(new Event("evolv:streak-updated"));
    window.dispatchEvent(new Event("evolv-streak-updated"));
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* Read XP directly from Supabase                                             */
/* -------------------------------------------------------------------------- */

/**
 * Reads the authenticated user's total XP from user_stats.
 * This avoids using a localStorage XP value as the source of truth.
 */
export async function getUserLearningStats() {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("user_stats")
    .select(
      "user_id, total_xp, current_streak, longest_streak, last_activity_date"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  throwIfError(error, "load your learning statistics");

  return {
    userId: user.id,
    totalXP: Math.max(0, Number(data?.total_xp) || 0),
    currentStreak: Math.max(
      0,
      Number(data?.current_streak) || 0
    ),
    longestStreak: Math.max(
      0,
      Number(data?.longest_streak) || 0
    ),
    lastActivityDate: data?.last_activity_date ?? null,
  };
}

/**
 * Build a mapping between Supabase lesson IDs and frontend lesson IDs.
 *
 * Home.jsx expects:
 * {
 *   dbToFrontend: Map {
 *     databaseLessonId => frontendLessonId
 *   }
 * }
 */
export async function getLessonDatabaseMap(frontendLessons = []) {
  await getAuthenticatedUser();

  let lessons;

  if (frontendLessons.length > 0) {
    const frontendIds = frontendLessons.map((lesson) =>
      normalizeLessonId(lesson.id)
    );

    const { byDatabaseId } = await getDatabaseLessons(frontendIds);

    lessons = [...byDatabaseId.values()];
  } else {
    const { data, error } = await supabase
      .from("lessons")
      .select("id, slug")
      .like("slug", `${PYTHON_LESSON_SLUG_PREFIX}%`);

    throwIfError(error, "load lesson mappings from Supabase");

    lessons = data ?? [];
  }

  const dbToFrontend = new Map();

  for (const lesson of lessons) {
    if (!lesson?.slug || lesson.id == null) {
      continue;
    }

    if (!lesson.slug.startsWith(PYTHON_LESSON_SLUG_PREFIX)) {
      continue;
    }

    const frontendId = Number(
      lesson.slug.slice(PYTHON_LESSON_SLUG_PREFIX.length)
    );

    if (!Number.isSafeInteger(frontendId) || frontendId <= 0) {
      continue;
    }

    dbToFrontend.set(
      normalizeDatabaseLessonId(lesson.id),
      frontendId
    );
  }

  return { dbToFrontend };
}