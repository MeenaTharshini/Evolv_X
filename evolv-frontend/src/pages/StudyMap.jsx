
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link, useParams } from "react-router-dom";

import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Flame,
  Flag,
  LockKeyhole,
  Map,
  Play,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Rightbar from "../components/Rightbar";
import EvolvLoader from "../components/EvolvLoader";

import { pythonLessons } from "../data/pythonLessons";
import { getStreak } from "../services/api";

import {
  STAGES,
  getAllStageProgress,
} from "../services/stageProgressService";

import "../styles/study-map.css";

/* -------------------------------------------------------------------------- */
/* Course configuration                                                       */
/* -------------------------------------------------------------------------- */

const DEFAULT_COURSE = "python";

const COURSE_INFO = {
  python: {
    title: "Python Foundations",
    subtitle: "Code Forest",
    description:
      "Travel through Python one skill at a time. Learn concepts, practise code, and solve challenges.",
    icon: "🐍",
  },
};

const WORLDS = [
  {
    icon: "🌱",
    title: "Python Meadow",
    description:
      "Discover Python, variables, and your first lines of code.",
    color: "meadow",
  },
  {
    icon: "🌲",
    title: "Logic Forest",
    description:
      "Make decisions and teach your code how to think.",
    color: "forest",
  },
  {
    icon: "🌊",
    title: "Loop River",
    description:
      "Repeat actions and build powerful programming logic.",
    color: "river",
  },
  {
    icon: "💎",
    title: "Data Kingdom",
    description:
      "Store, organise, and work with different kinds of data.",
    color: "kingdom",
  },
  {
    icon: "⛰️",
    title: "Function Mountains",
    description:
      "Create reusable blocks and solve bigger problems.",
    color: "mountains",
  },
  {
    icon: "🏰",
    title: "EVOLV Citadel",
    description:
      "Bring your knowledge together in practical challenges.",
    color: "citadel",
  },
];

const STAGE_LABELS = {
  video: "Video",
  concept: "Concept",
  "hands-on": "Hands-on",
  quiz: "Quiz",
};

const STAGE_ICONS = {
  video: Play,
  concept: BookOpen,
  "hands-on": Zap,
  quiz: Trophy,
};

const STAGE_COUNT = STAGES.length;

/* -------------------------------------------------------------------------- */
/* Safe local-storage helpers                                                 */
/* -------------------------------------------------------------------------- */

function readJSON(key, fallback = null) {
  try {
    if (typeof window === "undefined") {
      return fallback;
    }

    const raw = window.localStorage.getItem(key);

    if (raw === null) {
      return fallback;
    }

    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

function readNumber(key, fallback = 0) {
  try {
    if (typeof window === "undefined") {
      return fallback;
    }

    const raw = window.localStorage.getItem(key);

    if (raw === null || raw.trim() === "") {
      return fallback;
    }

    const value = Number(raw);

    return Number.isFinite(value) && value >= 0
      ? value
      : fallback;
  } catch {
    return fallback;
  }
}

function readObject(key) {
  const value = readJSON(key, {});

  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? value
    : {};
}

function writeNumber(key, value) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        key,
        String(Math.max(0, Number(value) || 0))
      );
    }
  } catch {
    // Local storage may be unavailable.
  }
}

/* -------------------------------------------------------------------------- */
/* Quiz-attempt storage                                                       */
/* -------------------------------------------------------------------------- */

function getQuizScoresKey(courseId) {
  return `evolv_${courseId}_quiz_scores`;
}

function readQuizScores(courseId) {
  return readObject(getQuizScoresKey(courseId));
}

/* -------------------------------------------------------------------------- */
/* Route and lesson helpers                                                   */
/* -------------------------------------------------------------------------- */

function stageDestination(courseId, lessonId, stage) {
  return `/study/${courseId}/lesson/${encodeURIComponent(
    String(lessonId)
  )}?stage=${encodeURIComponent(stage)}`;
}

function readLastViewed(courseId) {
  const value = readJSON(
    `evolv_${courseId}_last_viewed`,
    null
  );

  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    value.lessonId == null
  ) {
    return null;
  }

  const stage = STAGES.includes(value.stage)
    ? value.stage
    : STAGES[0] || "video";

  const rawWorldIndex =
    value.worldIndex == null || value.worldIndex === ""
      ? null
      : Number(value.worldIndex);

  return {
    worldIndex:
      Number.isInteger(rawWorldIndex) && rawWorldIndex >= 0
        ? rawWorldIndex
        : null,
    lessonId: value.lessonId,
    stage,
    destination: stageDestination(
      courseId,
      value.lessonId,
      stage
    ),
  };
}

function durationFor(lesson) {
  return lesson?.duration || "8 min";
}

function xpFor(lesson) {
  const value = Number(lesson?.xp);

  return Number.isFinite(value) && value > 0
    ? value
    : 10;
}

function areaFor(lesson, index) {
  const explicitArea =
    lesson?.area ||
    lesson?.chapter ||
    lesson?.category;

  if (explicitArea) {
    return String(explicitArea);
  }

  const worldIndex = Math.min(
    Math.floor(index / 10),
    WORLDS.length - 1
  );

  return WORLDS[Math.max(0, worldIndex)].title;
}

function groupLessons(lessons) {
  const groups = [];

  lessons.forEach((lesson, index) => {
    const title = areaFor(lesson, index);

    let group = groups[groups.length - 1];

    if (!group || group.title !== title) {
      group = {
        title,
        lessons: [],
      };

      groups.push(group);
    }

    group.lessons.push({
      ...lesson,
      _index: index,
    });
  });

  return groups.map((group, index) => ({
    ...group,
    worldIndex: index,
    theme: WORLDS[index % WORLDS.length],
  }));
}

function formatMinutes(lessons) {
  return lessons.reduce((total, lesson) => {
    const match = String(durationFor(lesson)).match(/\d+/);

    return total + (match ? Number(match[0]) : 8);
  }, 0);
}

/* -------------------------------------------------------------------------- */
/* Stage-progress helpers                                                     */
/* -------------------------------------------------------------------------- */

function getCompletedStages(progress, lessonId) {
  const stages = progress?.[String(lessonId)];

  if (!Array.isArray(stages)) {
    return [];
  }

  return STAGES.filter((stage) => stages.includes(stage));
}

function getCompletedStageCount(progress, lessonId) {
  return getCompletedStages(progress, lessonId).length;
}

function isStageComplete(progress, lessonId, stage) {
  return getCompletedStages(progress, lessonId).includes(stage);
}

function isTopicComplete(progress, lessonId) {
  return (
    STAGES.length > 0 &&
    STAGES.every((stage) =>
      isStageComplete(progress, lessonId, stage)
    )
  );
}

function isStageUnlocked(progress, lessonId, stage) {
  const stageIndex = STAGES.indexOf(stage);

  if (stageIndex < 0) {
    return false;
  }

  if (stageIndex === 0) {
    return true;
  }

  return STAGES.slice(0, stageIndex).every(
    (previousStage) =>
      isStageComplete(progress, lessonId, previousStage)
  );
}

function getNextIncompleteStage(progress, lessonId) {
  return (
    STAGES.find(
      (stage) =>
        !isStageComplete(progress, lessonId, stage)
    ) ||
    STAGES[0] ||
    "video"
  );
}

function getNextStage(progress, lessonId) {
  return getNextIncompleteStage(progress, lessonId);
}

function getTopicStageDestination(
  courseId,
  lesson,
  progress
) {
  const stage = isTopicComplete(progress, lesson.id)
    ? STAGES[0] || "video"
    : getNextStage(progress, lesson.id);

  return stageDestination(courseId, lesson.id, stage);
}

function isLessonAvailable(groups, progress, lesson) {
  if (!lesson) {
    return false;
  }

  if (isTopicComplete(progress, lesson.id)) {
    return true;
  }

  if (lesson._index === 0) {
    return true;
  }

  const allLessons = groups.flatMap(
    (group) => group.lessons
  );

  const previousLesson = allLessons.find(
    (item) => item._index === lesson._index - 1
  );

  if (!previousLesson) {
    return false;
  }

  return isTopicComplete(progress, previousLesson.id);
}

function getInitialSelection(groups, progress, lastViewed) {
  if (lastViewed) {
    const worldIndex = groups.findIndex((group) =>
      group.lessons.some(
        (lesson) =>
          String(lesson.id) === String(lastViewed.lessonId)
      )
    );

    const lesson = groups[worldIndex]?.lessons.find(
      (item) =>
        String(item.id) === String(lastViewed.lessonId)
    );

    if (
      lesson &&
      isLessonAvailable(groups, progress, lesson)
    ) {
      return {
        worldIndex,
        lessonId: lesson.id,
      };
    }
  }

  for (
    let worldIndex = 0;
    worldIndex < groups.length;
    worldIndex += 1
  ) {
    for (const lesson of groups[worldIndex].lessons) {
      if (
        isLessonAvailable(groups, progress, lesson) &&
        !isTopicComplete(progress, lesson.id)
      ) {
        return {
          worldIndex,
          lessonId: lesson.id,
        };
      }
    }
  }

  const firstLesson = groups[0]?.lessons[0] || null;

  return {
    worldIndex: firstLesson ? 0 : null,
    lessonId: firstLesson?.id ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Study Map                                                                  */
/* -------------------------------------------------------------------------- */

export default function StudyMap() {
  const { courseId: routeCourseId } = useParams();

  const courseId = COURSE_INFO[routeCourseId]
    ? routeCourseId
    : DEFAULT_COURSE;

  const course = COURSE_INFO[courseId];
  const lessons = pythonLessons;

  const groups = useMemo(
    () => groupLessons(lessons),
    [lessons]
  );

  const [stageProgress, setStageProgress] = useState({});
  const [quizScores, setQuizScores] = useState(
    () => readQuizScores(courseId)
  );

  const [xp, setXp] = useState(
    () => readNumber(`evolv_${courseId}_xp`)
  );

  const [streak, setStreak] = useState(
    () => readNumber(`evolv_${courseId}_streak`)
  );

  const [lastViewed, setLastViewed] = useState(
    () => readLastViewed(courseId)
  );

  const [expandedWorld, setExpandedWorld] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const selectedTopicRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const pendingScrollRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [progressError, setProgressError] = useState("");

  /* ------------------------------------------------------------------------ */
  /* Reliable selected-topic scrolling                                        */
  /* ------------------------------------------------------------------------ */

  const scrollToSelectedTopic = useCallback(() => {
    pendingScrollRef.current = true;

    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current);
    }

    // Wait for React to render the expanded world and selected card.
    scrollTimerRef.current = window.setTimeout(() => {
      const target = selectedTopicRef.current;

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });

        pendingScrollRef.current = false;
        return;
      }

      // The world/card may still be rendering; retry briefly.
      let attempts = 0;

      const retry = () => {
        const element = selectedTopicRef.current;

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });

          pendingScrollRef.current = false;
          return;
        }

        attempts += 1;

        if (attempts < 10) {
          scrollTimerRef.current =
            window.setTimeout(retry, 100);
        } else {
          pendingScrollRef.current = false;
          console.warn(
            "EVOLV: selected topic card was not found for scrolling."
          );
        }
      };

      retry();
    }, 100);
  }, []);

  useEffect(() => {
    if (
      loading ||
      expandedWorld === null ||
      selectedTopic === null ||
      !pendingScrollRef.current
    ) {
      return;
    }

    scrollToSelectedTopic();
  }, [
    loading,
    expandedWorld,
    selectedTopic,
    scrollToSelectedTopic,
  ]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Refresh progress                                                         */
  /* ------------------------------------------------------------------------ */

  const refreshProgress = useCallback(async () => {
    setProgressError("");

    try {
      const progress = await getAllStageProgress();

      if (
        !progress ||
        typeof progress !== "object" ||
        Array.isArray(progress)
      ) {
        throw new Error(
          "The progress service returned an unexpected format."
        );
      }

      setStageProgress(progress);
      setQuizScores(readQuizScores(courseId));
      setLastViewed(readLastViewed(courseId));

      try {
        const streakData = await getStreak();

        const currentStreak = Math.max(
          0,
          Number(streakData?.currentStreak) || 0
        );

        const currentXp = Math.max(
          0,
          Number(
            streakData?.totalXP ?? streakData?.totalXp
          ) || 0
        );

        setStreak(currentStreak);
        setXp(currentXp);

        writeNumber(
          `evolv_${courseId}_streak`,
          currentStreak
        );

        writeNumber(
          `evolv_${courseId}_xp`,
          currentXp
        );
      } catch {
        setXp(readNumber(`evolv_${courseId}_xp`));
        setStreak(readNumber(`evolv_${courseId}_streak`));
      }

      return progress;
    } catch (error) {
      console.error(
        "Could not load lesson-stage progress:",
        error
      );

      setProgressError(
        error?.message ||
          "Unable to load your learning progress. Please try again."
      );

      throw error;
    }
  }, [courseId]);

  /* ------------------------------------------------------------------------ */
  /* Initial load                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let cancelled = false;

    async function initializeStudyMap() {
      setLoading(true);
      setProgressError("");

      try {
        const progress = await getAllStageProgress();

        if (cancelled) {
          return;
        }

        if (
          !progress ||
          typeof progress !== "object" ||
          Array.isArray(progress)
        ) {
          throw new Error(
            "The progress service returned an unexpected format."
          );
        }

        const saved = readLastViewed(courseId);

        setStageProgress(progress);
        setLastViewed(saved);
        setQuizScores(readQuizScores(courseId));

        const selection = getInitialSelection(
          groups,
          progress,
          saved
        );

        setExpandedWorld(selection.worldIndex);
        setSelectedTopic(selection.lessonId);

        try {
          const streakData = await getStreak();

          if (cancelled) {
            return;
          }

          const currentStreak = Math.max(
            0,
            Number(streakData?.currentStreak) || 0
          );

          const currentXp = Math.max(
            0,
            Number(
              streakData?.totalXP ?? streakData?.totalXp
            ) || 0
          );

          setStreak(currentStreak);
          setXp(currentXp);

          writeNumber(
            `evolv_${courseId}_streak`,
            currentStreak
          );

          writeNumber(
            `evolv_${courseId}_xp`,
            currentXp
          );
        } catch (error) {
          if (!cancelled) {
            console.error(
              "Could not load learning statistics:",
              error
            );

            setStreak(
              readNumber(`evolv_${courseId}_streak`)
            );

            setXp(
              readNumber(`evolv_${courseId}_xp`)
            );
          }
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Study Map initialization failed:",
          error
        );

        setProgressError(
          error?.message ||
            "Could not load your learning progress. Please try again."
        );

        setStageProgress({});
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initializeStudyMap();

    return () => {
      cancelled = true;
    };
  }, [courseId, groups]);

  /* ------------------------------------------------------------------------ */
  /* Sync progress from other components and browser tabs                     */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    function syncLocalProgress() {
      setQuizScores(readQuizScores(courseId));
      setXp(readNumber(`evolv_${courseId}_xp`));
      setStreak(readNumber(`evolv_${courseId}_streak`));
      setLastViewed(readLastViewed(courseId));
    }

    function handleStorage(event) {
      const relevantKeys = [
        getQuizScoresKey(courseId),
        `evolv_${courseId}_xp`,
        `evolv_${courseId}_streak`,
        `evolv_${courseId}_last_viewed`,
      ];

      if (
        event.key !== null &&
        !relevantKeys.includes(event.key)
      ) {
        return;
      }

      syncLocalProgress();
    }

    function handleProgressUpdated() {
      syncLocalProgress();
      void refreshProgress().catch(() => {});
    }

    function handleLastViewedUpdated() {
      setLastViewed(readLastViewed(courseId));
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      "evolv-progress-updated",
      handleProgressUpdated
    );
    window.addEventListener(
      "evolv:progress-updated",
      handleProgressUpdated
    );
    window.addEventListener(
      "evolv-streak-updated",
      handleProgressUpdated
    );
    window.addEventListener(
      "evolv:streak-updated",
      handleProgressUpdated
    );
    window.addEventListener(
      "evolv-last-viewed-updated",
      handleLastViewedUpdated
    );
    window.addEventListener("focus", syncLocalProgress);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "evolv-progress-updated",
        handleProgressUpdated
      );
      window.removeEventListener(
        "evolv:progress-updated",
        handleProgressUpdated
      );
      window.removeEventListener(
        "evolv-streak-updated",
        handleProgressUpdated
      );
      window.removeEventListener(
        "evolv:streak-updated",
        handleProgressUpdated
      );
      window.removeEventListener(
        "evolv-last-viewed-updated",
        handleLastViewedUpdated
      );
      window.removeEventListener("focus", syncLocalProgress);
    };
  }, [courseId, refreshProgress]);

  /* ------------------------------------------------------------------------ */
  /* Derived statistics                                                       */
  /* ------------------------------------------------------------------------ */

  const completedIds = useMemo(
    () =>
      lessons
        .filter((lesson) =>
          isTopicComplete(stageProgress, lesson.id)
        )
        .map((lesson) => lesson.id),
    [lessons, stageProgress]
  );

  const completedSet = useMemo(
    () => new Set(completedIds.map(String)),
    [completedIds]
  );

  const completedCount = completedIds.length;

  const progress = lessons.length
    ? Math.round((completedCount / lessons.length) * 100)
    : 0;

  const allComplete =
    lessons.length > 0 &&
    completedCount === lessons.length;

  const nextLesson =
    lessons.find(
      (lesson) =>
        !isTopicComplete(stageProgress, lesson.id)
    ) || null;

  const earnedXp = lessons.reduce(
    (total, lesson) =>
      total +
      (isTopicComplete(stageProgress, lesson.id)
        ? xpFor(lesson)
        : 0),
    0
  );

  const displayedXp = Math.max(xp, earnedXp);

  /* ------------------------------------------------------------------------ */
  /* World and lesson unlocking                                               */
  /* ------------------------------------------------------------------------ */

  const isWorldUnlocked = useCallback(
    (worldIndex) => {
      if (worldIndex === 0) {
        return true;
      }

      const group = groups[worldIndex];

      if (!group) {
        return false;
      }

      if (
        group.lessons.some((lesson) =>
          isTopicComplete(stageProgress, lesson.id)
        )
      ) {
        return true;
      }

      return groups
        .slice(0, worldIndex)
        .every((previousGroup) =>
          previousGroup.lessons.every((lesson) =>
            isTopicComplete(stageProgress, lesson.id)
          )
        );
    },
    [groups, stageProgress]
  );

  const isLessonUnlocked = useCallback(
    (lesson) =>
      isLessonAvailable(groups, stageProgress, lesson),
    [groups, stageProgress]
  );

  /* ------------------------------------------------------------------------ */
  /* Save the last-viewed topic                                               */
  /* ------------------------------------------------------------------------ */

  const recordLastViewed = useCallback(
    (lesson, worldIndex, destination) => {
      if (!lesson) {
        return;
      }

      const match = String(destination || "").match(
        /[?&]stage=([^&]+)/
      );

      let requestedStage = getNextStage(
        stageProgress,
        lesson.id
      );

      if (match) {
        try {
          requestedStage = decodeURIComponent(match[1]);
        } catch {
          requestedStage = match[1];
        }
      }

      const safeStage = STAGES.includes(requestedStage)
        ? requestedStage
        : STAGES[0] || "video";

      const record = {
        worldIndex,
        lessonId: lesson.id,
        stage: safeStage,
        destination: stageDestination(
          courseId,
          lesson.id,
          safeStage
        ),
      };

      try {
        window.localStorage.setItem(
          `evolv_${courseId}_last_viewed`,
          JSON.stringify(record)
        );
      } catch (error) {
        console.error(
          "Could not save last-viewed topic:",
          error
        );
      }

      setLastViewed(record);
      setExpandedWorld(worldIndex);
      setSelectedTopic(lesson.id);

      // Ask the scrolling effect to run after React renders the card.
      pendingScrollRef.current = true;

      window.dispatchEvent(
        new Event("evolv-last-viewed-updated")
      );
    },
    [courseId, stageProgress]
  );

  const toggleWorld = useCallback(
    (index) => {
      if (!groups[index] || !isWorldUnlocked(index)) {
        return;
      }

      setExpandedWorld((previous) =>
        previous === index ? null : index
      );

      setSelectedTopic(null);
      pendingScrollRef.current = false;
    },
    [groups, isWorldUnlocked]
  );

  const selectTopic = useCallback(
    (lesson, worldIndex) => {
      if (!isLessonUnlocked(lesson)) {
        return;
      }

      const willSelect =
        String(selectedTopic) !== String(lesson.id) ||
        expandedWorld !== worldIndex;

      setExpandedWorld(worldIndex);
      setSelectedTopic(willSelect ? lesson.id : null);

      pendingScrollRef.current = willSelect;
    },
    [
      expandedWorld,
      isLessonUnlocked,
      selectedTopic,
    ]
  );

  /* ------------------------------------------------------------------------ */
  /* Selected topic and resume card                                           */
  /* ------------------------------------------------------------------------ */

  const selectedGroup =
    expandedWorld === null ? null : groups[expandedWorld];

  const selectedLesson =
    selectedGroup?.lessons.find(
      (lesson) =>
        String(lesson.id) === String(selectedTopic)
    ) || null;

  const selectedCompleted = selectedLesson
    ? isTopicComplete(stageProgress, selectedLesson.id)
    : false;

  const savedLesson = lastViewed
    ? lessons.find(
        (lesson) =>
          String(lesson.id) === String(lastViewed.lessonId)
      ) || null
    : null;

  const resumeLesson = savedLesson || nextLesson;

  const savedStageIncomplete =
    Boolean(savedLesson) &&
    Boolean(lastViewed?.stage) &&
    !isStageComplete(
      stageProgress,
      savedLesson.id,
      lastViewed.stage
    );

  const resumeStage = resumeLesson
    ? savedLesson && savedStageIncomplete
      ? lastViewed.stage
      : getNextStage(stageProgress, resumeLesson.id)
    : STAGES[0] || "video";

  const resumeDestination = resumeLesson
    ? stageDestination(
        courseId,
        resumeLesson.id,
        isTopicComplete(stageProgress, resumeLesson.id)
          ? STAGES[0] || "video"
          : resumeStage
      )
    : "/dashboard";

  const resumeLabel = !resumeLesson
    ? "Back to dashboard"
    : isTopicComplete(stageProgress, resumeLesson.id)
      ? "Review learning"
      : savedLesson
        ? "Resume learning"
        : completedCount === 0
          ? "Start learning"
          : "Continue learning";

  const getTopicAction = useCallback(
    (lesson) => {
      const completed = isTopicComplete(
        stageProgress,
        lesson.id
      );

      const completedStages = getCompletedStages(
        stageProgress,
        lesson.id
      );

      const destination = completed
        ? stageDestination(
            courseId,
            lesson.id,
            STAGES[0] || "video"
          )
        : getTopicStageDestination(
            courseId,
            lesson,
            stageProgress
          );

      return {
        label: completed
          ? "Review learning"
          : completedStages.length > 0
            ? "Continue learning"
            : "Start learning",
        destination,
      };
    },
    [courseId, stageProgress]
  );

  const studyMapDestination = `/study/${courseId}`;

  const openTopicOnMap = useCallback(
    (lesson, destination) => {
      if (!lesson) {
        return;
      }

      const worldIndex = groups.findIndex((group) =>
        group.lessons.some(
          (item) => String(item.id) === String(lesson.id)
        )
      );

      if (worldIndex < 0) {
        return;
      }

      recordLastViewed(lesson, worldIndex, destination);
      scrollToSelectedTopic();
    },
    [groups, recordLastViewed, scrollToSelectedTopic]
  );

  /* ------------------------------------------------------------------------ */
  /* Loading state                                                            */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="sm-page">
        <Navbar />
        <main className="sm-main">
          <div className="sm-content">
            <EvolvLoader />
          </div>
        </main>
        <Rightbar />
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error state                                                              */
  /* ------------------------------------------------------------------------ */

  if (progressError) {
    return (
      <div className="sm-page">
        <Navbar />

        <main className="sm-main">
          <div className="sm-content">
            <header className="sm-topbar">
              <div className="sm-breadcrumb">
                <Link to="/dashboard">Home</Link>
                <span aria-hidden="true">/</span>
                <strong>Study Map</strong>
              </div>
            </header>

            <div
              className="sm-select-topic-prompt"
              role="alert"
            >
              <Sparkles size={24} />
              <strong>
                We couldn't load your learning progress.
              </strong>
              <p>{progressError}</p>

              <button
                type="button"
                className="sm-resume-button"
                onClick={async () => {
                  setLoading(true);
                  setProgressError("");

                  try {
                    const progressData =
                      await refreshProgress();

                    const saved = readLastViewed(courseId);

                    const selection = getInitialSelection(
                      groups,
                      progressData,
                      saved
                    );

                    setExpandedWorld(selection.worldIndex);
                    setSelectedTopic(selection.lessonId);
                  } catch {
                    // refreshProgress sets the error message.
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Try again
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </main>

        <Rightbar />
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Main render                                                              */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="sm-page">
      <Navbar />

      <main className="sm-main">
        <header className="sm-topbar">
          <div className="sm-breadcrumb">
            <Link to="/dashboard">Home</Link>
            <span aria-hidden="true">/</span>
            <strong>Study Map</strong>
          </div>

          <div className="sm-topbar-actions">
            <span>One checkpoint at a time</span>
            <span className="sm-topbar-avatar">
              {course.icon}
            </span>
          </div>
        </header>

        <div className="sm-content">
          {/* Page heading and resume card */}
          <section className="sm-page-heading">
            <div className="sm-heading-main">
              <div className="sm-heading-copy">
                <span className="sm-eyebrow">
                  <Sparkles size={14} />
                  YOUR LEARNING ADVENTURE
                </span>

                <h1>Your Study Map</h1>

                <p>
                  Explore each world, follow the winding lesson
                  path, and unlock new levels as you grow.
                </p>
              </div>

              <div
                className="sm-course-emblem"
                aria-hidden="true"
              >
                <span>{course.icon}</span>
                <Sparkles
                  className="sm-emblem-spark"
                  size={18}
                />
              </div>
            </div>

            <div className="sm-resume-card">
              <div className="sm-resume-icon">
                <Play size={22} fill="currentColor" />
              </div>

              <div className="sm-resume-copy">
                <span>PICK UP WHERE YOU LEFT OFF</span>

                <strong>
                  {resumeLesson?.title ||
                    "Your Python adventure"}
                </strong>

                <small>
                  {resumeLesson
                    ? `${course.subtitle} · ${
                        isTopicComplete(
                          stageProgress,
                          resumeLesson.id
                        )
                          ? "Topic completed — ready to review"
                          : `Next stage: ${
                              STAGE_LABELS[resumeStage] || "Video"
                            }`
                      }`
                    : "Choose a topic to begin learning."}
                </small>
              </div>

              <Link
                to={
                  resumeLesson
                    ? studyMapDestination
                    : "/dashboard"
                }
                className="sm-resume-button"
                onClick={(event) => {
                  if (!resumeLesson) {
                    return;
                  }

                  event.preventDefault();

                  openTopicOnMap(
                    resumeLesson,
                    resumeDestination
                  );
                }}
              >
                {resumeLabel}
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* Active course */}
          <section className="sm-course-banner">
            <div className="sm-course-banner-copy">
              <span className="sm-course-label">
                <span className="sm-status-dot" />
                ACTIVE COURSE
              </span>

              <h2>{course.title}</h2>
              <p>{course.description}</p>

              <div className="sm-course-meta">
                <span>
                  <BookOpen size={15} />
                  {lessons.length} topics
                </span>

                <span>
                  <Clock3 size={15} />
                  About {formatMinutes(lessons)} min
                </span>

                <span>
                  <Star size={15} />
                  Beginner friendly
                </span>
              </div>
            </div>

            <div className="sm-course-progress">
              <div
                className="sm-progress-ring"
                style={{ "--progress": `${progress}%` }}
                role="img"
                aria-label={`${progress}% complete`}
              >
                <div className="sm-progress-ring-inner">
                  <strong>{progress}%</strong>
                  <span>complete</span>
                </div>
              </div>

              <div className="sm-course-progress-text">
                <strong>
                  {completedCount} of {lessons.length}
                </strong>
                <span>topics completed</span>
              </div>
            </div>
          </section>

          {/* Learning statistics */}
          <section
            className="sm-stat-grid"
            aria-label="Learning statistics"
          >
            <article className="sm-stat-card sm-stat-xp">
              <span className="sm-stat-icon">
                <Zap size={19} />
              </span>
              <div>
                <span>Total XP</span>
                <strong>{displayedXp}</strong>
              </div>
            </article>

            <article className="sm-stat-card sm-stat-streak">
              <span className="sm-stat-icon">
                <Flame size={19} />
              </span>
              <div>
                <span>Learning streak</span>
                <strong>
                  {streak} {streak === 1 ? "day" : "days"}
                </strong>
              </div>
            </article>

            <article className="sm-stat-card sm-stat-completed">
              <span className="sm-stat-icon">
                <CheckCircle2 size={19} />
              </span>
              <div>
                <span>Topics completed</span>
                <strong>
                  {completedCount}/{lessons.length}
                </strong>
              </div>
            </article>
          </section>

          {/* Learning worlds */}
          <section className="sm-path-section">
            <div className="sm-section-heading">
              <div>
                <span className="sm-eyebrow">
                  EXPLORE · LEARN · LEVEL UP
                </span>

                <h2>Your learning worlds</h2>

                <p>
                  Open a world to reveal its winding path.
                  Complete all four stages in each topic to
                  unlock the next stop. Completed topics stay
                  available for review.
                </p>
              </div>

              <span className="sm-path-count">
                <Map size={15} />
                {completedCount}/{lessons.length}
              </span>
            </div>

            <div className="sm-legend">
              <span>
                <i className="legend-current" />
                Current topic
              </span>
              <span>
                <i className="legend-completed" />
                Completed
              </span>
              <span>
                <i className="legend-locked" />
                Locked
              </span>
            </div>

            <div className="sm-world-list">
              {groups.map((group, groupIndex) => {
                const expanded =
                  expandedWorld === groupIndex;

                const locked =
                  !isWorldUnlocked(groupIndex);

                const completedInWorld =
                  group.lessons.filter((lesson) =>
                    isTopicComplete(
                      stageProgress,
                      lesson.id
                    )
                  ).length;

                const worldComplete =
                  group.lessons.length > 0 &&
                  completedInWorld === group.lessons.length;

                const hasCurrent =
                  group.lessons.some(
                    (lesson) =>
                      String(lesson.id) ===
                      String(nextLesson?.id)
                  );

                const theme = group.theme;

                return (
                  <section
                    key={`${group.title}-${groupIndex}`}
                    className={[
                      "sm-world",
                      `world-${theme.color}`,
                      expanded ? "is-expanded" : "",
                      locked ? "is-locked-world" : "",
                      worldComplete
                        ? "is-complete-world"
                        : "",
                      hasCurrent ? "is-active-world" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <button
                      type="button"
                      className="sm-world-header"
                      onClick={() => toggleWorld(groupIndex)}
                      disabled={locked}
                      aria-expanded={expanded}
                    >
                      <span className="sm-world-icon">
                        {worldComplete ? (
                          <Check
                            size={25}
                            strokeWidth={3}
                          />
                        ) : locked ? (
                          <LockKeyhole size={21} />
                        ) : (
                          theme.icon
                        )}
                      </span>

                      <span className="sm-world-heading-copy">
                        <span className="sm-world-kicker">
                          WORLD{" "}
                          {String(groupIndex + 1).padStart(
                            2,
                            "0"
                          )}

                          {hasCurrent && !worldComplete && (
                            <span className="sm-world-current-label">
                              YOUR NEXT WORLD
                            </span>
                          )}

                          {locked && (
                            <span className="sm-world-locked-label">
                              LOCKED
                            </span>
                          )}

                          {worldComplete && (
                            <span className="sm-world-current-label">
                              COMPLETED
                            </span>
                          )}
                        </span>

                        <strong>{group.title}</strong>

                        <span className="sm-world-description">
                          {theme.description}
                        </span>
                      </span>

                      <span className="sm-world-progress">
                        <span>
                          {completedInWorld}/
                          {group.lessons.length}
                        </span>

                        <span className="sm-world-progress-track">
                          <span
                            style={{
                              width: `${
                                group.lessons.length
                                  ? (completedInWorld /
                                      group.lessons.length) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </span>
                      </span>

                      <span className="sm-world-chevron">
                        <ChevronDown size={20} />
                      </span>
                    </button>

                    {expanded && (
                      <div className="sm-world-content">
                        <div className="sm-world-content-inner">
                          <div className="sm-climb-intro">
                            <span className="sm-climb-intro-icon">
                              <Sparkles size={18} />
                            </span>

                            <div>
                              <strong>
                                Your {group.title} journey
                              </strong>
                              <p>
                                Complete Video, Concept,
                                Hands-on, and Quiz to unlock
                                the next topic. You can revisit
                                completed topics anytime.
                              </p>
                            </div>
                          </div>

                          <div className="sm-topic-journey">
                            <div className="sm-journey-start">
                              <span className="sm-journey-start-icon">
                                🚩
                              </span>

                              <span>
                                <strong>
                                  Start your journey
                                </strong>
                                <small>
                                  {group.lessons.length} topics
                                  in this world
                                </small>
                              </span>
                            </div>

                            <div className="sm-winding-path">
                              {group.lessons.map(
                                (lesson, localIndex) => {
                                  const index = lesson._index;

                                  const completed =
                                    completedSet.has(
                                      String(lesson.id)
                                    );

                                  const completedStages =
                                    getCompletedStages(
                                      stageProgress,
                                      lesson.id
                                    );

                                  const stageCount =
                                    getCompletedStageCount(
                                      stageProgress,
                                      lesson.id
                                    );

                                  const unlocked =
                                    isLessonUnlocked(lesson);

                                  const selected =
                                    String(selectedTopic) ===
                                      String(lesson.id) &&
                                    expandedWorld === groupIndex;

                                  const isNext =
                                    !completed &&
                                    unlocked &&
                                    String(nextLesson?.id) ===
                                      String(lesson.id);

                                  const position =
                                    localIndex % 4 === 0
                                      ? "path-left"
                                      : localIndex % 4 === 1
                                        ? "path-center-left"
                                        : localIndex % 4 === 2
                                          ? "path-center-right"
                                          : "path-right";

                                  const topicAction =
                                    getTopicAction(lesson);

                                  return (
                                    <div
                                      className={[
                                        "sm-path-entry",
                                        selected
                                          ? "has-selected-topic"
                                          : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                      key={lesson.id}
                                    >
                                      <div
                                        className={[
                                          "sm-path-stop",
                                          position,
                                          completed
                                            ? "is-completed"
                                            : "",
                                          unlocked
                                            ? "is-unlocked"
                                            : "is-locked",
                                          selected
                                            ? "is-selected"
                                            : "",
                                          isNext
                                            ? "is-next-topic"
                                            : "",
                                        ]
                                          .filter(Boolean)
                                          .join(" ")}
                                      >
                                        <button
                                          type="button"
                                          className="sm-path-node"
                                          onClick={() =>
                                            selectTopic(
                                              lesson,
                                              groupIndex
                                            )
                                          }
                                          disabled={!unlocked}
                                          aria-pressed={selected}
                                          aria-label={`Topic ${
                                            index + 1
                                          }: ${lesson.title}`}
                                          title={
                                            completed
                                              ? "Completed — click to review"
                                              : unlocked
                                                ? lesson.title
                                                : "Complete the previous topic to unlock"
                                          }
                                        >
                                          <span className="sm-path-node-inner">
                                            {completed ? (
                                              <Check
                                                size={24}
                                                strokeWidth={3}
                                              />
                                            ) : !unlocked ? (
                                              <LockKeyhole
                                                size={20}
                                              />
                                            ) : isNext ? (
                                              <Play
                                                size={23}
                                                fill="currentColor"
                                              />
                                            ) : (
                                              <span>
                                                {localIndex + 1}
                                              </span>
                                            )}
                                          </span>

                                          {selected && (
                                            <span className="sm-node-pulse" />
                                          )}
                                        </button>

                                        <button
                                          type="button"
                                          className="sm-path-topic-label"
                                          onClick={() =>
                                            selectTopic(
                                              lesson,
                                              groupIndex
                                            )
                                          }
                                          disabled={!unlocked}
                                        >
                                          <span className="sm-path-topic-number">
                                            TOPIC{" "}
                                            {String(
                                              index + 1
                                            ).padStart(2, "0")}
                                          </span>

                                          <strong>
                                            {lesson.title}
                                          </strong>

                                          <span className="sm-path-topic-meta">
                                            <Clock3 size={12} />
                                            {durationFor(lesson)}
                                          </span>

                                          <span className="sm-path-topic-status">
                                            {completed
                                              ? "✓ Completed · Review anytime"
                                              : !unlocked
                                                ? "🔒 Locked"
                                                : `${stageCount}/${STAGE_COUNT} stages · ${xpFor(
                                                    lesson
                                                  )} XP`}
                                          </span>
                                        </button>
                                      </div>

                                      {/* Selected topic details */}
                                      {selected &&
                                        selectedLesson && (
                                          <div className="sm-selected-topic-anchor">
                                            <article
                                              ref={selectedTopicRef}
                                              className={[
                                                "sm-selected-topic",
                                                "sm-selected-topic-inline",
                                                "sm-selected-topic-compact",
                                                "sm-selected-topic-cute",
                                                `cute-${theme.color}`,
                                              ].join(" ")}
                                            >
                                              <div className="sm-cute-card-decoration">
                                                <span>✦</span>
                                                <span>✧</span>
                                                <span>✦</span>
                                              </div>

                                              <div className="sm-cute-card-topline">
                                                <span className="sm-cute-card-badge">
                                                  <Sparkles size={13} />
                                                  {selectedCompleted
                                                    ? "QUEST COMPLETED"
                                                    : "YOUR LITTLE QUEST"}
                                                </span>

                                                <span className="sm-cute-card-world">
                                                  {theme.icon} World{" "}
                                                  {groupIndex + 1}
                                                </span>
                                              </div>

                                              <div className="sm-cute-card-main">
                                                <div className="sm-compact-topic-icon">
                                                  {selectedCompleted ? (
                                                    <CheckCircle2
                                                      size={25}
                                                    />
                                                  ) : (
                                                    <BookOpen
                                                      size={25}
                                                    />
                                                  )}
                                                </div>

                                                <div className="sm-compact-topic-copy">
                                                  <span className="sm-compact-topic-kicker">
                                                    {selectedCompleted
                                                      ? "LOOK HOW FAR YOU'VE COME!"
                                                      : "YOUR FOUR-STAGE QUEST"}
                                                  </span>

                                                  <strong>
                                                    {selectedLesson.title}
                                                  </strong>

                                                  <span className="sm-compact-topic-meta">
                                                    <Clock3 size={13} />
                                                    {durationFor(
                                                      selectedLesson
                                                    )}
                                                    <span>·</span>
                                                    <Zap size={13} />
                                                    {xpFor(
                                                      selectedLesson
                                                    )}{" "}
                                                    XP
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="sm-stage-panel">
                                                <div className="sm-stage-panel-heading">
                                                  <strong>
                                                    {selectedCompleted
                                                      ? "Review topic levels"
                                                      : "Topic levels"}
                                                  </strong>

                                                  <span>
                                                    {completedStages.length}/
                                                    {STAGE_COUNT} complete
                                                  </span>
                                                </div>

                                                <div className="sm-stage-grid">
                                                  {STAGES.map(
                                                    (
                                                      stage,
                                                      stageIndex
                                                    ) => {
                                                      const done =
                                                        isStageComplete(
                                                          stageProgress,
                                                          selectedLesson.id,
                                                          stage
                                                        );

                                                      const stageUnlocked =
                                                        done ||
                                                        isStageUnlocked(
                                                          stageProgress,
                                                          selectedLesson.id,
                                                          stage
                                                        );

                                                      const Icon =
                                                        STAGE_ICONS[
                                                          stage
                                                        ] || BookOpen;

                                                      const destination =
                                                        stageDestination(
                                                          courseId,
                                                          selectedLesson.id,
                                                          stage
                                                        );

                                                      return (
                                                        <Link
                                                          key={stage}
                                                          to={destination}
                                                          className={[
                                                            "sm-stage-link",
                                                            done
                                                              ? "is-stage-done"
                                                              : "",
                                                            stageUnlocked
                                                              ? "is-stage-unlocked"
                                                              : "is-stage-locked",
                                                          ]
                                                            .filter(Boolean)
                                                            .join(" ")}
                                                          aria-disabled={
                                                            !stageUnlocked
                                                          }
                                                          onClick={(event) => {
                                                            if (!stageUnlocked) {
                                                              event.preventDefault();
                                                              return;
                                                            }

                                                            recordLastViewed(
                                                              selectedLesson,
                                                              groupIndex,
                                                              destination
                                                            );
                                                          }}
                                                        >
                                                          <span className="sm-stage-link-icon">
                                                            {done ? (
                                                              <CheckCircle2
                                                                size={17}
                                                              />
                                                            ) : (
                                                              <Icon
                                                                size={17}
                                                              />
                                                            )}
                                                          </span>

                                                          <span className="sm-stage-link-name">
                                                            {STAGE_LABELS[
                                                              stage
                                                            ] || stage}
                                                          </span>

                                                          <span className="sm-stage-link-number">
                                                            {done
                                                              ? "Review"
                                                              : stageUnlocked
                                                                ? `Level ${
                                                                    stageIndex + 1
                                                                  } · Start`
                                                                : "🔒 Locked"}
                                                          </span>
                                                        </Link>
                                                      );
                                                    }
                                                  )}
                                                </div>
                                              </div>

                                              <div className="sm-cute-card-footer">
                                                <span className="sm-cute-card-hint">
                                                  {selectedCompleted
                                                    ? "✨ Review this quest anytime. Reviewing does not grant extra XP."
                                                    : `${stageCount}/${STAGE_COUNT} stages completed · Finish all stages to unlock the next topic.`}
                                                </span>

                                                <Link
                                                  to={studyMapDestination}
                                                  className="sm-compact-topic-button"
                                                  onClick={(event) => {
                                                    event.preventDefault();

                                                    openTopicOnMap(
                                                      selectedLesson,
                                                      topicAction.destination
                                                    );
                                                  }}
                                                >
                                                  {topicAction.label}
                                                  <ArrowRight size={16} />
                                                </Link>
                                              </div>
                                            </article>
                                          </div>
                                        )}
                                    </div>
                                  );
                                }
                              )}
                            </div>

                            <div className="sm-journey-finish">
                              <span className="sm-journey-finish-icon">
                                {worldComplete ? (
                                  <Trophy size={23} />
                                ) : (
                                  <Flag size={21} />
                                )}
                              </span>

                              <span>
                                <strong>
                                  {worldComplete
                                    ? "World conquered!"
                                    : "World milestone"}
                                </strong>

                                <small>
                                  {completedInWorld} of{" "}
                                  {group.lessons.length} topics
                                  completed
                                </small>
                              </span>
                            </div>
                          </div>

                          {!selectedLesson && (
                            <div className="sm-select-topic-prompt">
                              <Map size={23} />

                              <strong>
                                Select a topic circle
                              </strong>

                              <p>
                                Select an unlocked topic to start,
                                resume, or review learning.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </section>

          {/* Next milestone */}
          <section className="sm-path-finish">
            <div className="sm-finish-icon">
              {allComplete ? (
                <Trophy size={27} />
              ) : (
                <Star size={25} />
              )}
            </div>

            <div className="sm-finish-copy">
              <span>YOUR NEXT MILESTONE</span>

              <h3>
                {allComplete
                  ? "You conquered every lesson!"
                  : nextLesson
                    ? `Continue with ${nextLesson.title}`
                    : "Your adventure awaits"}
              </h3>

              <p>
                {allComplete
                  ? "Amazing work. Revisit lessons and quizzes to keep practising."
                  : "Complete all four stages of the next topic to keep moving along your learning path."}
              </p>
            </div>

            {nextLesson && (
              <Link
                to={studyMapDestination}
                className="sm-finish-button"
                onClick={(event) => {
                  event.preventDefault();

                  openTopicOnMap(
                    nextLesson,
                    getTopicStageDestination(
                      courseId,
                      nextLesson,
                      stageProgress
                    )
                  );
                }}
              >
                Continue
                <ArrowRight size={15} />
              </Link>
            )}
          </section>

          {/* Bottom banner */}
          <section className="sm-bottom-banner">
            <div className="sm-bottom-banner-icon">
              <Sparkles size={23} />
            </div>

            <div>
              <h3>Small steps make big progress.</h3>
              <p>
                Watch. Understand. Apply. Solve. Keep evolving.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="sm-bottom-link"
            >
              Home
              <ArrowRight size={15} />
            </Link>
          </section>

          {/* Footer */}
          <footer className="sm-footer">
            <Link
              to="/dashboard"
              className="sm-footer-brand"
            >
              <span>✦</span> EVOLV
              <span className="sm-footer-dot">.</span>
            </Link>

            <span>
              Learn. Practise. Keep evolving.
            </span>
          </footer>
        </div>
      </main>

      <Rightbar />
    </div>
  );
}