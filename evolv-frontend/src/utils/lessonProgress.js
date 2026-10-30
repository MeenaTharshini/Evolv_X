
// ==================================================
// LESSON PROGRESS SERVICE
// ==================================================

export const STAGES = ["video", "concept", "hands-on", "quiz"];

// ==================================================
// STORAGE KEYS
// ==================================================

function stageProgressKey(courseId) {
  return `evolv_${courseId}_stage_progress`;
}

function completedTopicsKey(courseId) {
  return `evolv_${courseId}_completed`;
}

// ==================================================
// VALIDATION HELPERS
// ==================================================

function validateCourseId(courseId) {
  if (
    courseId === undefined ||
    courseId === null ||
    String(courseId).trim() === ""
  ) {
    throw new Error("courseId is required.");
  }
}

function validateTopicId(topicId) {
  if (
    topicId === undefined ||
    topicId === null ||
    String(topicId).trim() === ""
  ) {
    throw new Error("topicId is required.");
  }
}

function validateStage(stage) {
  if (!STAGES.includes(stage)) {
    throw new Error(
      `Invalid stage "${stage}". Valid stages: ${STAGES.join(", ")}.`
    );
  }
}

// ==================================================
// SAFE STORAGE HELPERS
// ==================================================

function readJSON(key, fallback = {}) {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return fallback;
    }

    const value = window.localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    const parsed = JSON.parse(value);

    return parsed ?? fallback;
  } catch (error) {
    console.error(`Unable to read "${key}" from localStorage:`, error);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      throw new Error("Browser storage is unavailable.");
    }

    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to save "${key}" to localStorage:`, error);

    throw new Error(
      "Unable to save learning progress. Check browser storage permissions and available storage space."
    );
  }
}

function notifyProgressUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("evolv-progress-updated"));
  }
}

// ==================================================
// READ STAGE PROGRESS
// ==================================================

/*
 * Stored structure:
 *
 * {
 *   "1": {
 *     "video": {
 *       completed: true,
 *       completedAt: "2026-10-30T10:00:00.000Z"
 *     },
 *     "concept": {
 *       completed: false,
 *       completedAt: null
 *     }
 *   }
 * }
 */

export function getStageProgress(courseId) {
  if (
    courseId === undefined ||
    courseId === null ||
    String(courseId).trim() === ""
  ) {
    return {};
  }

  const progress = readJSON(stageProgressKey(courseId), {});

  if (
    !progress ||
    typeof progress !== "object" ||
    Array.isArray(progress)
  ) {
    return {};
  }

  return progress;
}

// ==================================================
// STAGE COMPLETION HELPERS
// ==================================================

export function isStageComplete(progress, topicId, stage) {
  if (!STAGES.includes(stage)) {
    return false;
  }

  return progress?.[String(topicId)]?.[stage]?.completed === true;
}

export function getCompletedStages(progress, topicId) {
  return STAGES.filter((stage) =>
    isStageComplete(progress, topicId, stage)
  );
}

export function getCompletedStageCount(progress, topicId) {
  return getCompletedStages(progress, topicId).length;
}

export function isTopicComplete(progress, topicId) {
  return STAGES.every((stage) =>
    isStageComplete(progress, topicId, stage)
  );
}

export function getNextIncompleteStage(progress, topicId) {
  return (
    STAGES.find(
      (stage) => !isStageComplete(progress, topicId, stage)
    ) ?? null
  );
}

// ==================================================
// STAGE UNLOCKING
// ==================================================

/*
 * Video is always unlocked.
 * Each later stage requires all previous stages to be complete.
 */

export function isStageUnlocked(progress, topicId, stage) {
  const stageIndex = STAGES.indexOf(stage);

  if (stageIndex === -1) {
    return false;
  }

  if (stageIndex === 0) {
    return true;
  }

  return STAGES.slice(0, stageIndex).every((previousStage) =>
    isStageComplete(progress, topicId, previousStage)
  );
}

// ==================================================
// NEXT STAGE
// ==================================================

export function getNextStage(stage) {
  const index = STAGES.indexOf(stage);

  if (index === -1 || index >= STAGES.length - 1) {
    return null;
  }

  return STAGES[index + 1];
}

// ==================================================
// SAVE STAGE COMPLETION
// ==================================================

/*
 * Marks one stage as completed.
 *
 * Rules:
 * 1. Stages must be completed in order.
 * 2. Re-completing a stage does not change its original timestamp.
 * 3. A topic is complete only when all four stages are complete.
 * 4. Completed topics are synchronized with the legacy topic list.
 */

export function saveStageCompletion(courseId, topicId, stage) {
  validateCourseId(courseId);
  validateTopicId(topicId);
  validateStage(stage);

  const progress = getStageProgress(courseId);
  const topicKey = String(topicId);

  const alreadyCompleted = isStageComplete(
    progress,
    topicKey,
    stage
  );

  // Prevent skipping stages.
  if (
    !alreadyCompleted &&
    !isStageUnlocked(progress, topicKey, stage)
  ) {
    const expectedStage = getNextIncompleteStage(
      progress,
      topicKey
    );

    throw new Error(
      `Complete "${expectedStage}" before completing "${stage}".`
    );
  }

  const existingTopic = progress[topicKey] ?? {};
  const existingStage = existingTopic[stage] ?? {};

  const updatedProgress = {
    ...progress,
    [topicKey]: {
      ...existingTopic,
      [stage]: {
        ...existingStage,
        completed: true,
        completedAt:
          existingStage.completedAt || new Date().toISOString(),
      },
    },
  };

  // Persist stage progress first.
  writeJSON(stageProgressKey(courseId), updatedProgress);

  // Synchronize the legacy completed-topic list.
  syncCompletedTopics(
    courseId,
    null,
    updatedProgress,
    false
  );

  // Notify Study Map, Home, and other listening components.
  notifyProgressUpdated();

  return updatedProgress;
}

// ==================================================
// COMPLETED-TOPIC SYNCHRONIZATION
// ==================================================

/*
 * The legacy completed-topic list contains only topics whose
 * video, concept, hands-on, and quiz stages are all complete.
 */

export function syncCompletedTopics(
  courseId,
  lessons = null,
  progress = null,
  dispatchEvent = true
) {
  if (
    courseId === undefined ||
    courseId === null ||
    String(courseId).trim() === ""
  ) {
    return [];
  }

  const currentProgress =
    progress ?? getStageProgress(courseId);

  let topicIds;

  if (Array.isArray(lessons)) {
    topicIds = lessons
      .filter(
        (lesson) =>
          lesson?.id !== undefined &&
          lesson?.id !== null &&
          isTopicComplete(currentProgress, lesson.id)
      )
      .map((lesson) => lesson.id);
  } else {
    topicIds = Object.keys(currentProgress).filter(
      (topicId) => isTopicComplete(currentProgress, topicId)
    );
  }

  const completedIds = [
    ...new Set(
      topicIds
        .map(Number)
        .filter((id) => Number.isSafeInteger(id) && id > 0)
    ),
  ];

  writeJSON(completedTopicsKey(courseId), completedIds);

  if (dispatchEvent) {
    notifyProgressUpdated();
  }

  return completedIds;
}

// ==================================================
// READ COMPLETED TOPICS
// ==================================================

export function getCompletedTopics(courseId) {
  if (
    courseId === undefined ||
    courseId === null ||
    String(courseId).trim() === ""
  ) {
    return [];
  }

  const completed = readJSON(
    completedTopicsKey(courseId),
    []
  );

  if (!Array.isArray(completed)) {
    return [];
  }

  return [
    ...new Set(
      completed
        .map(Number)
        .filter((id) => Number.isSafeInteger(id) && id > 0)
    ),
  ];
}

// ==================================================
// TOPIC PROGRESS PERCENTAGE
// ==================================================

export function getTopicProgressPercentage(progress, topicId) {
  const completedCount = getCompletedStageCount(progress, topicId);

  return Math.round((completedCount / STAGES.length) * 100);
}