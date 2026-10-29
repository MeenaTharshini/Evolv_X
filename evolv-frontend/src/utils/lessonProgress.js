
const STAGES = ["video", "concept", "hands-on", "quiz"];

/*
 * Storage keys
 */
function stageProgressKey(courseId) {
  return `evolv_${courseId}_stage_progress`;
}

function completedTopicsKey(courseId) {
  return `evolv_${courseId}_completed`;
}

/*
 * Safely read JSON from localStorage.
 */
function readJSON(key, fallback = {}) {
  try {
    const value = localStorage.getItem(key);

    if (!value) return fallback;

    const parsed = JSON.parse(value);

    return parsed ?? fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

/*
 * Get saved stage progress.
 *
 * Structure:
 * {
 *   "1": {
 *     "video": {
 *       completed: true,
 *       completedAt: "..."
 *     },
 *     "concept": {
 *       completed: false,
 *       completedAt: null
 *     }
 *   }
 * }
 */
export function getStageProgress(courseId) {
  if (!courseId) return {};

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

/*
 * Check whether a stage is completed.
 */
export function isStageComplete(progress, topicId, stage) {
  if (!STAGES.includes(stage)) return false;

  return progress?.[String(topicId)]?.[stage]?.completed === true;
}

/*
 * Get completed stages for one topic.
 */
export function getCompletedStages(progress, topicId) {
  return STAGES.filter((stage) =>
    isStageComplete(progress, topicId, stage)
  );
}

/*
 * Get the number of completed stages.
 */
export function getCompletedStageCount(progress, topicId) {
  return getCompletedStages(progress, topicId).length;
}

/*
 * Check whether all four stages are completed.
 */
export function isTopicComplete(progress, topicId) {
  return STAGES.every((stage) =>
    isStageComplete(progress, topicId, stage)
  );
}

/*
 * Get the first incomplete stage.
 *
 * Examples:
 * Nothing completed -> "video"
 * Video completed -> "concept"
 * Video + Concept completed -> "hands-on"
 * First three completed -> "quiz"
 * All completed -> null
 */
export function getNextIncompleteStage(progress, topicId) {
  return (
    STAGES.find(
      (stage) => !isStageComplete(progress, topicId, stage)
    ) || null
  );
}

/*
 * Check whether a stage is unlocked.
 *
 * Video is always the first available stage.
 * Every other stage requires the previous stage
 * to be completed.
 */
export function isStageUnlocked(progress, topicId, stage) {
  const stageIndex = STAGES.indexOf(stage);

  if (stageIndex === -1) return false;

  // The first stage is available by default.
  if (stageIndex === 0) return true;

  // A stage is unlocked only if every preceding
  // stage has been completed.
  return STAGES.slice(0, stageIndex).every((previousStage) =>
    isStageComplete(progress, topicId, previousStage)
  );
}

/*
 * Get the next stage in sequence.
 *
 * Returns null if the current stage is invalid
 * or if it is the final stage.
 */
export function getNextStage(stage) {
  const index = STAGES.indexOf(stage);

  if (index === -1 || index === STAGES.length - 1) {
    return null;
  }

  return STAGES[index + 1];
}

/*
 * Save completion for one stage only.
 *
 * A stage cannot be completed through this function
 * unless all preceding stages have been completed.
 *
 * Completing Quiz completes the topic only when the
 * other three stages have also been completed.
 */
export function saveStageCompletion(courseId, topicId, stage) {
  if (!courseId) {
    throw new Error("courseId is required to save stage progress.");
  }

  if (topicId === undefined || topicId === null) {
    throw new Error("topicId is required to save stage progress.");
  }

  if (!STAGES.includes(stage)) {
    throw new Error(
      `Invalid stage "${stage}". Valid stages: ${STAGES.join(", ")}`
    );
  }

  const progress = getStageProgress(courseId);

  // Enforce sequential completion.
  if (!isStageUnlocked(progress, topicId, stage)) {
    const expectedStage = getNextIncompleteStage(progress, topicId);

    throw new Error(
      `Complete "${expectedStage}" before completing "${stage}".`
    );
  }

  const topicKey = String(topicId);
  const existingTopic = progress[topicKey] || {};
  const existingStage = existingTopic[stage] || {};

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

  localStorage.setItem(
    stageProgressKey(courseId),
    JSON.stringify(updatedProgress)
  );

  // Keep the legacy completed-topic list in sync.
  syncCompletedTopics(courseId, null, updatedProgress, false);

  // Notify the map and other components.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("evolv-progress-updated"));
  }

  return updatedProgress;
}

/*
 * Synchronize the legacy completed-topic list.
 *
 * A topic is added only when all four stages
 * are marked completed.
 */
export function syncCompletedTopics(
  courseId,
  lessons = null,
  progress = null,
  dispatchEvent = true
) {
  if (!courseId) return [];

  const currentProgress = progress || getStageProgress(courseId);

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
    topicIds = Object.keys(currentProgress).filter((topicId) =>
      isTopicComplete(currentProgress, topicId)
    );
  }

  const completedIds = [
    ...new Set(
      topicIds
        .map(Number)
        .filter((id) => Number.isFinite(id))
    ),
  ];

  localStorage.setItem(
    completedTopicsKey(courseId),
    JSON.stringify(completedIds)
  );

  if (dispatchEvent && typeof window !== "undefined") {
    window.dispatchEvent(new Event("evolv-progress-updated"));
  }

  return completedIds;
}

/*
 * Read completed topic IDs.
 */
export function getCompletedTopics(courseId) {
  if (!courseId) return [];

  const completed = readJSON(completedTopicsKey(courseId), []);

  if (!Array.isArray(completed)) return [];

  return completed
    .map(Number)
    .filter((id) => Number.isFinite(id));
}

/*
 * Get the number of completed stages as a percentage.
 */
export function getTopicProgressPercentage(progress, topicId) {
  return Math.round(
    (getCompletedStageCount(progress, topicId) / STAGES.length) * 100
  );
}

/*
 * Export the stage list for StudyMap and LessonPage.
 */
export { STAGES };