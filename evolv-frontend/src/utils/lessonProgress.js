
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
 * Safely read JSON from localStorage
 */
function readJSON(key, fallback = {}) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    const parsed = JSON.parse(value);

    return parsed ?? fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

/*
 * Get saved stage progress for a course.
 *
 * Structure:
 * {
 *   "1": {
 *     "video": { completed: true, completedAt: "..." },
 *     "concept": { completed: true, completedAt: "..." }
 *   }
 * }
 */
export function getStageProgress(courseId) {
  if (!courseId) {
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

/*
 * Check whether one stage is completed.
 */
export function isStageComplete(progress, topicId, stage) {
  if (!STAGES.includes(stage)) {
    return false;
  }

  return progress?.[String(topicId)]?.[stage]?.completed === true;
}

/*
 * Return the completed stages of a topic.
 */
export function getCompletedStages(progress, topicId) {
  return STAGES.filter((stage) =>
    isStageComplete(progress, topicId, stage)
  );
}

/*
 * Return the number of completed stages.
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
 * Save completion for ONE stage only.
 *
 * Completing Video does not complete Concept,
 * Hands-on, Quiz, or the whole topic.
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

  // Update the legacy completed-topics list only when all
  // four stages of a topic have been completed.
  syncCompletedTopics(courseId, null, updatedProgress, false);

  // Notify StudyMap and other components to refresh.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("evolv-progress-updated"));
  }

  return updatedProgress;
}

/*
 * Synchronize the old completed-topics list.
 *
 * If lessons are provided, only those lessons are checked.
 * If lessons are null, existing topic IDs in stage progress
 * are checked.
 *
 * This keeps compatibility with components that still read:
 * evolv_<courseId>_completed
 */
export function syncCompletedTopics(
  courseId,
  lessons = null,
  progress = null,
  dispatchEvent = true
) {
  if (!courseId) {
    return [];
  }

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
 * Read the completed-topic IDs from localStorage.
 */
export function getCompletedTopics(courseId) {
  if (!courseId) {
    return [];
  }

  const completed = readJSON(completedTopicsKey(courseId), []);

  if (!Array.isArray(completed)) {
    return [];
  }

  return completed
    .map(Number)
    .filter((id) => Number.isFinite(id));
}

/*
 * Get the next incomplete stage for a topic.
 * Returns "video" if no stages have been completed.
 * Returns null if the topic is fully completed.
 */
export function getNextIncompleteStage(progress, topicId) {
  return (
    STAGES.find(
      (stage) => !isStageComplete(progress, topicId, stage)
    ) || null
  );
}

/*
 * Export the stage list for use in LessonPage and StudyMap.
 */
export { STAGES };