
import { supabase } from "./supabaseClient";

// ==================================================
// CONFIGURATION
// ==================================================

const LESSON_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
];

const LESSON_STAGES = [
  "video",
  "concept",
  "hands-on",
  "quiz",
];

const DEFAULT_XP_BY_STAGE = {
  video: 10,
  concept: 10,
  "hands-on": 20,
  quiz: 20,
};

const LESSON_SELECT_FIELDS = "id, course_id, slug, title";

const LESSON_PROGRESS_SELECT_FIELDS =
  "user_id, lesson_id, status, xp_earned, completed_at, updated_at";

const STAGE_PROGRESS_SELECT_FIELDS =
  "user_id, lesson_id, stage, completed, completed_at, updated_at";

// ==================================================
// AUTHENTICATION
// ==================================================

async function requireAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(
      `Unable to verify your login: ${error.message}`
    );
  }

  if (!user) {
    throw new Error(
      "Please log in to view or save your learning progress."
    );
  }

  return user;
}

// ==================================================
// VALIDATION
// ==================================================

function validateId(id, label) {
  if (
    id === undefined ||
    id === null ||
    String(id).trim() === ""
  ) {
    throw new Error(`${label} is required.`);
  }
}

function validateXP(xp) {
  const value = Number(xp);

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(
      "XP earned must be a non-negative number."
    );
  }

  return Math.floor(value);
}

function validateLessonStatus(status) {
  if (!LESSON_STATUSES.includes(status)) {
    throw new Error(`Invalid lesson status: ${status}.`);
  }

  return status;
}

function validateStage(stage) {
  if (!LESSON_STAGES.includes(stage)) {
    throw new Error(
      `Invalid lesson stage. Allowed stages: ${LESSON_STAGES.join(", ")}.`
    );
  }

  return stage;
}

function normalizeDatabaseId(id, label = "ID") {
  validateId(id, label);

  const value = String(id).trim();

  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error(
      `${label} must be a positive integer database ID.`
    );
  }

  const numericId = Number(value);

  if (!Number.isSafeInteger(numericId)) {
    throw new Error(
      `${label} is outside the supported ID range.`
    );
  }

  return numericId;
}

// ==================================================
// LESSON LOOKUP
// ==================================================

/**
 * Resolves frontend lesson identifiers to actual Supabase lessons.
 *
 * Supported examples:
 * 1                  -> python-lesson-1
 * "1"                -> python-lesson-1
 * "python-lesson-1"  -> python-lesson-1
 *
 * Numeric frontend lesson IDs are NOT treated as database IDs.
 */
async function requireDatabaseLesson(lessonId) {
  validateId(lessonId, "Lesson ID");

  const value = String(lessonId).trim();

  let slug;

  if (/^python-lesson-[1-9]\d*$/.test(value)) {
    slug = value;
  } else if (/^[1-9]\d*$/.test(value)) {
    slug = `python-lesson-${value}`;
  } else {
    throw new Error(
      `Invalid Python lesson identifier "${value}". Use a lesson number or a slug such as "python-lesson-1".`
    );
  }

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(LESSON_SELECT_FIELDS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to resolve lesson "${slug}": ${error.message}`
    );
  }

  if (!lesson) {
    throw new Error(
      `Lesson "${slug}" was not found in Supabase. Verify that the curriculum is seeded and that your account has permission to read it.`
    );
  }

  return lesson;
}

/**
 * Resolves an actual public.lessons.id database ID.
 *
 * Use this only when the supplied ID is already a Supabase
 * database lesson ID, not a frontend lesson number.
 */
export async function resolveDatabaseLessonById(
  databaseLessonId
) {
  const id = normalizeDatabaseId(
    databaseLessonId,
    "Database lesson ID"
  );

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(LESSON_SELECT_FIELDS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to resolve database lesson ID ${id}: ${error.message}`
    );
  }

  if (!lesson) {
    throw new Error(
      `Database lesson ID ${id} was not found.`
    );
  }

  return lesson;
}

// ==================================================
// LEARNING DASHBOARD
// ==================================================

export async function getLearningDashboard() {
  const user = await requireAuthenticatedUser();

  const [
    { data: stats, error: statsError },
    { data: progress, error: progressError },
    { data: enrollments, error: enrollmentsError },
  ] = await Promise.all([
    supabase
      .from("user_stats")
      .select(
        "user_id, total_xp, current_streak, longest_streak, last_activity_date"
      )
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("lesson_progress")
      .select(LESSON_PROGRESS_SELECT_FIELDS)
      .eq("user_id", user.id),

    supabase
      .from("enrollments")
      .select("course_id, enrolled_at")
      .eq("user_id", user.id),
  ]);

  if (statsError) {
    throw new Error(
      `Unable to load user statistics: ${statsError.message}`
    );
  }

  if (progressError) {
    throw new Error(
      `Unable to load lesson progress: ${progressError.message}`
    );
  }

  if (enrollmentsError) {
    throw new Error(
      `Unable to load course enrollments: ${enrollmentsError.message}`
    );
  }

  const lessonProgress = progress ?? [];
  const userEnrollments = enrollments ?? [];

  const completedLessons = lessonProgress.filter(
    (item) => item.status === "completed"
  ).length;

  const calculatedXP = lessonProgress.reduce(
    (total, item) =>
      total + Number(item.xp_earned ?? 0),
    0
  );

  return {
    userId: user.id,
    email: user.email ?? "",

    totalXP:
      stats?.total_xp != null
        ? Number(stats.total_xp)
        : calculatedXP,

    currentStreak: Number(
      stats?.current_streak ?? 0
    ),

    longestStreak: Number(
      stats?.longest_streak ?? 0
    ),

    lastActivityDate:
      stats?.last_activity_date ?? null,

    completedLessons,
    enrollments: userEnrollments,
    lessonProgress,
  };
}

// ==================================================
// COURSE PROGRESS
// ==================================================

export async function getCourseProgress(courseId) {
  const databaseCourseId = normalizeDatabaseId(
    courseId,
    "Course ID"
  );

  const user = await requireAuthenticatedUser();

  const [
    { data: enrollment, error: enrollmentError },
    { data: lessons, error: lessonsError },
  ] = await Promise.all([
    supabase
      .from("enrollments")
      .select("user_id, course_id, enrolled_at")
      .eq("user_id", user.id)
      .eq("course_id", databaseCourseId)
      .maybeSingle(),

    supabase
      .from("lessons")
      .select(
        `${LESSON_SELECT_FIELDS}, description, duration_minutes, position`
      )
      .eq("course_id", databaseCourseId)
      .order("position", { ascending: true }),
  ]);

  if (enrollmentError) {
    throw new Error(
      `Unable to load course enrollment: ${enrollmentError.message}`
    );
  }

  if (lessonsError) {
    throw new Error(
      `Unable to load course lessons: ${lessonsError.message}`
    );
  }

  const courseLessons = lessons ?? [];

  if (courseLessons.length === 0) {
    return {
      userId: user.id,
      courseId: databaseCourseId,
      enrolled: Boolean(enrollment),
      enrollment: enrollment ?? null,
      totalLessons: 0,
      completedLessons: 0,
      completionPercentage: 0,
      totalXPEarned: 0,
      lessons: [],
      lessonProgress: [],
      courseProgress: [],
    };
  }

  const lessonIds = courseLessons.map(
    (lesson) => lesson.id
  );

  const {
    data: progressRecords,
    error: progressError,
  } = await supabase
    .from("lesson_progress")
    .select(LESSON_PROGRESS_SELECT_FIELDS)
    .eq("user_id", user.id)
    .in("lesson_id", lessonIds);

  if (progressError) {
    throw new Error(
      `Unable to load course progress: ${progressError.message}`
    );
  }

  const lessonProgress = progressRecords ?? [];

  const progressByLessonId = new Map(
    lessonProgress.map((record) => [
      String(record.lesson_id),
      record,
    ])
  );

  const lessonsWithProgress = courseLessons.map(
    (lesson) => {
      const record = progressByLessonId.get(
        String(lesson.id)
      );

      return {
        ...lesson,
        status: record?.status ?? "not_started",
        xp_earned: Number(record?.xp_earned ?? 0),
        completed_at: record?.completed_at ?? null,
        updated_at: record?.updated_at ?? null,
      };
    }
  );

  const completedLessons = lessonsWithProgress.filter(
    (lesson) => lesson.status === "completed"
  ).length;

  const totalXPEarned = lessonsWithProgress.reduce(
    (total, lesson) =>
      total + Number(lesson.xp_earned ?? 0),
    0
  );

  return {
    userId: user.id,
    courseId: databaseCourseId,
    enrolled: Boolean(enrollment),
    enrollment: enrollment ?? null,
    totalLessons: courseLessons.length,
    completedLessons,

    completionPercentage: Math.round(
      (completedLessons / courseLessons.length) * 100
    ),

    totalXPEarned,
    lessons: lessonsWithProgress,
    lessonProgress,
    courseProgress: lessonProgress,
  };
}

// ==================================================
// ENROLLMENT
// ==================================================

export async function enrollInCourse(courseId) {
  const databaseCourseId = normalizeDatabaseId(
    courseId,
    "Course ID"
  );

  const user = await requireAuthenticatedUser();

  const { data, error } = await supabase
    .from("enrollments")
    .upsert(
      {
        user_id: user.id,
        course_id: databaseCourseId,
      },
      {
        onConflict: "user_id,course_id",
        ignoreDuplicates: true,
      }
    )
    .select("user_id, course_id, enrolled_at")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to enroll in the course: ${error.message}`
    );
  }

  if (data) {
    return data;
  }

  // If an existing enrollment was preserved, retrieve it.
  const {
    data: existing,
    error: existingError,
  } = await supabase
    .from("enrollments")
    .select("user_id, course_id, enrolled_at")
    .eq("user_id", user.id)
    .eq("course_id", databaseCourseId)
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `Unable to verify enrollment: ${existingError.message}`
    );
  }

  if (!existing) {
    throw new Error(
      "Enrollment could not be confirmed. Verify the course ID and Supabase permissions."
    );
  }

  return existing;
}

// ==================================================
// SAVE LESSON PROGRESS
// ==================================================

export async function saveLessonProgress({
  lessonId,
  status = "in_progress",
  xpEarned = 0,
} = {}) {
  validateLessonStatus(status);

  const requestedXP = validateXP(xpEarned);

  const user = await requireAuthenticatedUser();
  const lesson = await requireDatabaseLesson(lessonId);

  const {
    data: existing,
    error: existingError,
  } = await supabase
    .from("lesson_progress")
    .select("status, xp_earned, completed_at")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `Unable to read existing lesson progress: ${existingError.message}`
    );
  }

  // Never downgrade a completed lesson.
  const finalStatus =
    existing?.status === "completed"
      ? "completed"
      : status;

  // Never reduce previously earned lesson XP.
  const finalXP = Math.max(
    Number(existing?.xp_earned ?? 0),
    requestedXP
  );

  const completedAt =
    finalStatus === "completed"
      ? existing?.completed_at ??
        new Date().toISOString()
      : null;

  const payload = {
    user_id: user.id,
    lesson_id: lesson.id,
    status: finalStatus,
    xp_earned: finalXP,
    completed_at: completedAt,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("lesson_progress")
    .upsert(payload, {
      onConflict: "user_id,lesson_id",
    })
    .select(LESSON_PROGRESS_SELECT_FIELDS)
    .single();

  if (error) {
    throw new Error(
      `Unable to save lesson progress: ${error.message}`
    );
  }

  return data;
}

// ==================================================
// GET PROGRESS FOR ONE LESSON
// ==================================================

export async function getLessonProgress(lessonId) {
  const lesson = await requireDatabaseLesson(lessonId);
  const user = await requireAuthenticatedUser();

  const { data, error } = await supabase
    .from("lesson_progress")
    .select(LESSON_PROGRESS_SELECT_FIELDS)
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load lesson progress: ${error.message}`
    );
  }

  return data ?? null;
}

// ==================================================
// STAGE PROGRESS
// ==================================================

/**
 * Returns one record per stage, including incomplete stages.
 *
 * lesson_id is the Supabase database ID. The caller should
 * associate the returned records with its frontend lesson ID.
 */
export async function getLessonStageProgress(lessonId) {
  const lesson = await requireDatabaseLesson(lessonId);
  const user = await requireAuthenticatedUser();

  const { data, error } = await supabase
    .from("lesson_stage_progress")
    .select(STAGE_PROGRESS_SELECT_FIELDS)
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id);

  if (error) {
    throw new Error(
      `Unable to load lesson stage progress: ${error.message}`
    );
  }

  const progressByStage = new Map(
    (data ?? []).map((record) => [
      record.stage,
      record,
    ])
  );

  return LESSON_STAGES.map((stage) => {
    const record = progressByStage.get(stage);

    return {
      stage,
      completed: Boolean(record?.completed),
      completed_at: record?.completed_at ?? null,
      updated_at: record?.updated_at ?? null,
    };
  });
}

/**
 * Loads stage progress for actual Supabase database lesson IDs.
 */
export async function getCourseStageProgress(
  lessonIds = []
) {
  if (!Array.isArray(lessonIds)) {
    throw new Error(
      "Lesson IDs must be provided as an array."
    );
  }

  if (lessonIds.length === 0) {
    return [];
  }

  const uniqueLessonIds = [
    ...new Set(
      lessonIds.map((id) =>
        normalizeDatabaseId(id, "Database lesson ID")
      )
    ),
  ];

  const user = await requireAuthenticatedUser();

  const { data, error } = await supabase
    .from("lesson_stage_progress")
    .select(STAGE_PROGRESS_SELECT_FIELDS)
    .eq("user_id", user.id)
    .in("lesson_id", uniqueLessonIds);

  if (error) {
    throw new Error(
      `Unable to load course stage progress: ${error.message}`
    );
  }

  return data ?? [];
}

// ==================================================
// SAVE STAGE COMPLETION
// ==================================================

/**
 * Stage order:
 * video -> concept -> hands-on -> quiz
 *
 * Stage completion is idempotent: saving the same completed
 * stage again does not add more XP.
 */
/**
 * Saves stage completion atomically through Supabase.
 *
 * The database function:
 * - Verifies authentication.
 * - Enforces stage order.
 * - Prevents duplicate stage XP.
 * - Synchronizes lesson progress and total XP.
 *
 * Stage order:
 * video -> concept -> hands-on -> quiz
 */
export async function saveStageCompletion({
  lessonId,
  stage,
} = {}) {
  validateStage(stage);

  const user = await requireAuthenticatedUser();
  const lesson = await requireDatabaseLesson(lessonId);

  const { data, error } = await supabase.rpc(
    "complete_lesson_stage",
    {
      p_lesson_id: lesson.id,
      p_stage: stage,
    }
  );

  if (error) {
    throw new Error(
      `Unable to complete the "${stage}" stage: ${error.message}`
    );
  }

  if (!data || typeof data !== "object") {
    throw new Error(
      "Stage completion did not return valid progress data."
    );
  }

  // Keep the existing frontend's expected response structure.
  const lessonProgress = await getLessonProgress(lesson.slug);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        "evolv_python_xp",
        String(Number(data.totalXP ?? 0))
      );
    } catch {
      // localStorage is only a cache.
    }

    window.dispatchEvent(
      new Event("evolv:progress-updated")
    );

    window.dispatchEvent(
      new Event("evolv-progress-updated")
    );
  }

  return {
    lesson,
    stage: data.stage,
    completed: Boolean(data.completed),
    allStagesComplete: Boolean(data.allStagesComplete),
    completedStages: Array.isArray(data.completedStages)
      ? data.completedStages
      : [],
    xpEarned: Number(data.xpEarned ?? 0),
    totalXP: Number(data.totalXP ?? 0),
    lessonProgress,
    userId: user.id,
  };
}

// ==================================================
// CONSTANTS
// ==================================================

export {
  LESSON_STAGES,
  LESSON_STATUSES,
};