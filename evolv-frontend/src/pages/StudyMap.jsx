
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
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
import { Link, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Rightbar from "../components/Rightbar";
import { pythonLessons } from "../data/pythonLessons";
import {
  STAGES,
  getStageProgress,
  getCompletedStages,
  getCompletedStageCount,
  isStageComplete,
  isTopicComplete,
  getNextIncompleteStage,
  syncCompletedTopics,
} from "../utils/lessonProgress";

import "../styles/study-map.css";

const DEFAULT_COURSE = "python";
const QUIZ_TOTAL_MARKS = 5;

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
    description: "Discover Python, variables, and your first lines of code.",
    color: "meadow",
  },
  {
    icon: "🌲",
    title: "Logic Forest",
    description: "Make decisions and teach your code how to think.",
    color: "forest",
  },
  {
    icon: "🌊",
    title: "Loop River",
    description: "Repeat actions and build powerful programming logic.",
    color: "river",
  },
  {
    icon: "💎",
    title: "Data Kingdom",
    description: "Store, organise, and work with different kinds of data.",
    color: "kingdom",
  },
  {
    icon: "⛰️",
    title: "Function Mountains",
    description: "Create reusable blocks and solve bigger problems.",
    color: "mountains",
  },
  {
    icon: "🏰",
    title: "EVOLV Citadel",
    description: "Bring your knowledge together in practical challenges.",
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

function readJSON(key, fallback) {
  try {
    if (typeof window === "undefined") return fallback;

    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function readNumber(key, fallback = 0) {
  try {
    const raw = localStorage.getItem(key);

    if (raw === null || raw.trim() === "") return fallback;

    const value = Number(raw);

    return Number.isFinite(value) && value >= 0 ? value : fallback;
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

function readLastViewed(courseId) {
  const value = readJSON(`evolv_${courseId}_last_viewed`, null);

  if (!value || !Number.isFinite(Number(value.lessonId))) {
    return null;
  }

  const stage =
    STAGES.includes(value.stage) ? value.stage : "video";

  return {
    lessonId: Number(value.lessonId),
    stage,
    destination: `/study/${courseId}/lesson/${Number(value.lessonId)}?stage=${stage}`,
  };
}

function durationFor(lesson) {
  return lesson.duration || "8 min";
}

function xpFor(lesson) {
  const value = Number(lesson.xp);

  return Number.isFinite(value) && value > 0 ? value : 10;
}

function areaFor(lesson, index) {
  return (
    lesson.area ||
    lesson.chapter ||
    lesson.category ||
    WORLDS[
      Math.min(Math.floor(index / 10), WORLDS.length - 1)
    ].title
  );
}

function groupLessons(lessons) {
  const groups = [];

  lessons.forEach((lesson, index) => {
    const title = areaFor(lesson, index);
    let group = groups[groups.length - 1];

    if (!group || group.title !== title) {
      group = { title, lessons: [] };
      groups.push(group);
    }

    group.lessons.push({ ...lesson, _index: index });
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

function quizResultFor(scores, lessonId) {
  const value = scores[String(lessonId)] ??
    scores[`python_${lessonId}`];

  if (typeof value === "number" && Number.isFinite(value)) {
    return { attempts: 1, latestScore: value };
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { attempts: 0, latestScore: null };
  }

  const attempts = Number(value.attempts);

  return {
    attempts:
      Number.isFinite(attempts) && attempts > 0
        ? attempts
        : value.submittedAt
          ? 1
          : 0,
    latestScore:
      typeof value.latestScore === "number"
        ? value.latestScore
        : typeof value.score === "number"
          ? value.score
          : null,
  };
}

function stageDestination(courseId, lessonId, stage) {
  return `/study/${courseId}/lesson/${lessonId}?stage=${encodeURIComponent(stage)}`;
}

function getNextStage(progress, lessonId) {
  return getNextIncompleteStage(progress, lessonId) || "video";
}

function getTopicStageDestination(courseId, lesson, progress) {
  const stage = getNextStage(progress, lesson.id);
  return stageDestination(courseId, lesson.id, stage);
}

function getInitialSelection(groups, progress, lastViewed) {
  if (lastViewed) {
    const worldIndex = groups.findIndex((group) =>
      group.lessons.some(
        (lesson) => Number(lesson.id) === Number(lastViewed.lessonId)
      )
    );

    const lesson = groups[worldIndex]?.lessons.find(
      (item) => Number(item.id) === Number(lastViewed.lessonId)
    );

    if (
      lesson &&
      isLessonAvailable(groups, progress, worldIndex, lesson)
    ) {
      return {
        worldIndex,
        lessonId: Number(lesson.id),
      };
    }
  }

  for (let worldIndex = 0; worldIndex < groups.length; worldIndex += 1) {
    const group = groups[worldIndex];

    for (const lesson of group.lessons) {
      if (
        isLessonAvailable(groups, progress, worldIndex, lesson) &&
        !isTopicComplete(progress, lesson.id)
      ) {
        return {
          worldIndex,
          lessonId: Number(lesson.id),
        };
      }
    }
  }

  return {
    worldIndex: groups.length ? 0 : null,
    lessonId: groups[0]?.lessons[0]
      ? Number(groups[0].lessons[0].id)
      : null,
  };
}

function isLessonAvailable(groups, progress, worldIndex, lesson) {
  if (worldIndex === 0 && lesson._index === 0) return true;

  const previousLesson = lesson._index > 0
    ? groups.flatMap((group) => group.lessons).find(
        (item) => item._index === lesson._index - 1
      )
    : null;

  if (!previousLesson) return worldIndex === 0;

  return isTopicComplete(progress, previousLesson.id);
}

export default function StudyMap() {
  const { courseId: routeCourseId } = useParams();

  const courseId = COURSE_INFO[routeCourseId]
    ? routeCourseId
    : DEFAULT_COURSE;

  const course = COURSE_INFO[courseId];
  const lessons = pythonLessons;

  const groups = useMemo(() => groupLessons(lessons), [lessons]);

  const [stageProgress, setStageProgress] = useState(
    () => getStageProgress(courseId)
  );

  const [quizScores, setQuizScores] = useState(
    () => readObject(`evolv_${courseId}_quiz_scores`)
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

  const initial = getInitialSelection(groups, stageProgress, lastViewed);

  const [expandedWorld, setExpandedWorld] = useState(initial.worldIndex);
  const [selectedTopic, setSelectedTopic] = useState(initial.lessonId);

  const refreshProgress = useCallback(() => {
    const latestProgress = getStageProgress(courseId);

    setStageProgress(latestProgress);
    setQuizScores(readObject(`evolv_${courseId}_quiz_scores`));
    setXp(readNumber(`evolv_${courseId}_xp`));
    setStreak(readNumber(`evolv_${courseId}_streak`));
    setLastViewed(readLastViewed(courseId));
  }, [courseId]);

  useEffect(() => {
    // Rebuild the legacy completed-topics list from the four-stage
    // records. This prevents an old one-stage completion from unlocking
    // a topic or world.
    const latest = getStageProgress(courseId);
    syncCompletedTopics(courseId, lessons, latest, false);
    refreshProgress();

    const onStorage = (event) => {
      if (
        !event ||
        event.key === null ||
        [
          `evolv_${courseId}_stage_progress`,
          `evolv_${courseId}_completed`,
          `evolv_${courseId}_xp`,
          `evolv_${courseId}_streak`,
          `evolv_${courseId}_quiz_scores`,
          `evolv_${courseId}_last_viewed`,
        ].includes(event.key)
      ) {
        refreshProgress();
      }
    };

    window.addEventListener("focus", refreshProgress);
    window.addEventListener("storage", onStorage);
    window.addEventListener("evolv-progress-updated", refreshProgress);

    return () => {
      window.removeEventListener("focus", refreshProgress);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "evolv-progress-updated",
        refreshProgress
      );
    };
  }, [courseId, lessons, refreshProgress]);

  useEffect(() => {
    const selection = getInitialSelection(
      groups,
      stageProgress,
      lastViewed
    );

    setExpandedWorld(selection.worldIndex);
    setSelectedTopic(selection.lessonId);
  }, [courseId, groups, stageProgress, lastViewed]);

  const completedIds = useMemo(
    () =>
      lessons
        .filter((lesson) => isTopicComplete(stageProgress, lesson.id))
        .map((lesson) => Number(lesson.id)),
    [lessons, stageProgress]
  );

  const completedSet = useMemo(
    () => new Set(completedIds),
    [completedIds]
  );

  const completedCount = completedIds.length;

  const progress = lessons.length
    ? Math.round((completedCount / lessons.length) * 100)
    : 0;

  const allComplete =
    lessons.length > 0 && completedCount === lessons.length;

  const nextLesson =
    lessons.find(
      (lesson) => !isTopicComplete(stageProgress, lesson.id)
    ) || null;

  const earnedXp = lessons.reduce(
    (total, lesson) =>
      total +
      (isTopicComplete(stageProgress, lesson.id) ? xpFor(lesson) : 0),
    0
  );

  const displayedXp = Math.max(xp, earnedXp);

  const quizAttemptCount = lessons.reduce(
    (total, lesson) =>
      total + quizResultFor(quizScores, lesson.id).attempts,
    0
  );

  function isWorldUnlocked(worldIndex) {
    if (worldIndex === 0) return true;

    return groups
      .slice(0, worldIndex)
      .every((group) =>
        group.lessons.every((lesson) =>
          isTopicComplete(stageProgress, lesson.id)
        )
      );
  }

  function isLessonUnlocked(lesson) {
    return isLessonAvailable(
      groups,
      stageProgress,
      groups.findIndex((group) =>
        group.lessons.some(
          (item) => Number(item.id) === Number(lesson.id)
        )
      ),
      lesson
    );
  }

  function recordLastViewed(lesson, worldIndex, destination) {
    if (!lesson) return;

    const match = String(destination || "").match(/[?&]stage=([^&]+)/);
    const stage = match
      ? decodeURIComponent(match[1])
      : getNextStage(stageProgress, lesson.id);

    const safeStage = STAGES.includes(stage) ? stage : "video";

    const record = {
      worldIndex,
      lessonId: Number(lesson.id),
      stage: safeStage,
      destination: stageDestination(courseId, lesson.id, safeStage),
    };

    try {
      localStorage.setItem(
        `evolv_${courseId}_last_viewed`,
        JSON.stringify(record)
      );
    } catch (error) {
      console.error("Could not save last-viewed topic:", error);
    }

    setLastViewed(record);
  }

  function toggleWorld(index) {
    if (!groups[index] || !isWorldUnlocked(index)) return;

    setExpandedWorld((previous) =>
      previous === index ? null : index
    );

    setSelectedTopic(null);
  }

  function selectTopic(lesson, worldIndex) {
    if (!isLessonUnlocked(lesson)) return;

    setExpandedWorld(worldIndex);
    setSelectedTopic((previous) =>
      Number(previous) === Number(lesson.id)
        ? null
        : Number(lesson.id)
    );
  }

  const selectedGroup =
    expandedWorld === null ? null : groups[expandedWorld];

  const selectedLesson =
    selectedGroup?.lessons.find(
      (lesson) => Number(lesson.id) === Number(selectedTopic)
    ) || null;

  const selectedCompleted = selectedLesson
    ? isTopicComplete(stageProgress, selectedLesson.id)
    : false;

  const savedLesson = lastViewed
    ? lessons.find(
        (lesson) => Number(lesson.id) === Number(lastViewed.lessonId)
      )
    : null;

  const resumeLesson = savedLesson || nextLesson;

  const resumeDestination = resumeLesson
    ? getTopicStageDestination(courseId, resumeLesson, stageProgress)
    : "/dashboard";

  const resumeLabel = !resumeLesson
    ? "Back to dashboard"
    : selectedCompleted
      ? "Review learning"
      : savedLesson
        ? "Resume learning"
        : completedCount === 0
          ? "Start learning"
          : "Continue learning";

  function getTopicAction(lesson) {
    const completed = isTopicComplete(stageProgress, lesson.id);

    const destination = completed
      ? stageDestination(courseId, lesson.id, "video")
      : getTopicStageDestination(courseId, lesson, stageProgress);

    return {
      label: completed
        ? "Review learning"
        : getCompletedStages(stageProgress, lesson.id).length > 0
          ? "Continue learning"
          : "Start learning",
      destination,
    };
  }

  return (
    <div className="sm-page">
      <Navbar />

      <main className="sm-main">
        <header className="sm-topbar">
          <div className="sm-breadcrumb">
            <Link to="/dashboard">Workspace</Link>
            <span>/</span>
            <strong>Study Map</strong>
          </div>

          <div className="sm-topbar-actions">
            <span>One checkpoint at a time</span>
            <span className="sm-topbar-avatar">{course.icon}</span>
          </div>
        </header>

        <div className="sm-content">
          <section className="sm-page-heading">
            <div className="sm-heading-main">
              <div className="sm-heading-copy">
                <span className="sm-eyebrow">
                  <Sparkles size={14} />
                  YOUR LEARNING ADVENTURE
                </span>

                <h1>Your Study Map</h1>

                <p>
                  Explore each world, follow the winding lesson path,
                  and unlock new levels as you grow.
                </p>
              </div>

              <div className="sm-course-emblem">
                <span>{course.icon}</span>
                <Sparkles className="sm-emblem-spark" size={18} />
              </div>
            </div>

            <div className="sm-resume-card">
              <div className="sm-resume-icon">
                <Play size={22} fill="currentColor" />
              </div>

              <div className="sm-resume-copy">
                <span>PICK UP WHERE YOU LEFT OFF</span>

                <strong>
                  {resumeLesson?.title || "Your Python adventure"}
                </strong>

                <small>
                  {resumeLesson
                    ? `${course.subtitle} · ${
                        isTopicComplete(stageProgress, resumeLesson.id)
                          ? "Topic completed — ready to review"
                          : `Next stage: ${
                              STAGE_LABELS[
                                getNextStage(
                                  stageProgress,
                                  resumeLesson.id
                                )
                              ]
                            }`
                      }`
                    : "Choose a topic to begin learning."}
                </small>
              </div>

              <Link
                to={resumeDestination}
                className="sm-resume-button"
                onClick={() => {
                  if (!resumeLesson) return;

                  const worldIndex = groups.findIndex((group) =>
                    group.lessons.some(
                      (lesson) =>
                        Number(lesson.id) === Number(resumeLesson.id)
                    )
                  );

                  recordLastViewed(
                    resumeLesson,
                    worldIndex,
                    resumeDestination
                  );
                }}
              >
                {resumeLabel}
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

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

          <section className="sm-stat-grid" aria-label="Learning statistics">
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
                <strong>{streak} days</strong>
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

            <article className="sm-stat-card sm-stat-next">
              <span className="sm-stat-icon">
                <Award size={19} />
              </span>
              <div>
                <span>Quiz attempts</span>
                <strong>{quizAttemptCount}</strong>
              </div>
            </article>
          </section>

          <section className="sm-path-section">
            <div className="sm-section-heading">
              <div>
                <span className="sm-eyebrow">
                  EXPLORE · LEARN · LEVEL UP
                </span>

                <h2>Your learning worlds</h2>

                <p>
                  Open a world to reveal its winding path. Complete all
                  four stages in each topic to unlock the next stop.
                </p>
              </div>

              <span className="sm-path-count">
                <Map size={15} />
                {completedCount}/{lessons.length}
              </span>
            </div>

            <div className="sm-legend">
              <span>
                <i className="legend-current" /> Current topic
              </span>
              <span>
                <i className="legend-completed" /> Completed
              </span>
              <span>
                <i className="legend-locked" /> Locked
              </span>
            </div>

            <div className="sm-world-list">
              {groups.map((group, groupIndex) => {
                const expanded = expandedWorld === groupIndex;
                const locked = !isWorldUnlocked(groupIndex);

                const completedInWorld = group.lessons.filter((lesson) =>
                  isTopicComplete(stageProgress, lesson.id)
                ).length;

                const worldComplete =
                  group.lessons.length > 0 &&
                  completedInWorld === group.lessons.length;

                const hasCurrent = group.lessons.some(
                  (lesson) =>
                    Number(lesson.id) === Number(nextLesson?.id)
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
                      worldComplete ? "is-complete-world" : "",
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
                          <Check size={25} strokeWidth={3} />
                        ) : locked ? (
                          <LockKeyhole size={21} />
                        ) : (
                          theme.icon
                        )}
                      </span>

                      <span className="sm-world-heading-copy">
                        <span className="sm-world-kicker">
                          WORLD {String(groupIndex + 1).padStart(2, "0")}

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
                          {completedInWorld}/{group.lessons.length}
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
                              <strong>Your {group.title} journey</strong>
                              <p>
                                Complete Video, Concept, Hands-on, and
                                Quiz to unlock the next topic.
                              </p>
                            </div>
                          </div>

                          <div className="sm-topic-journey">
                            <div className="sm-journey-start">
                              <span className="sm-journey-start-icon">
                                🚩
                              </span>

                              <span>
                                <strong>Start your journey</strong>
                                <small>
                                  {group.lessons.length} topics in this world
                                </small>
                              </span>
                            </div>

                            <div className="sm-winding-path">
                              {group.lessons.map((lesson, localIndex) => {
                                const index = lesson._index;
                                const lessonId = Number(lesson.id);

                                const completed = isTopicComplete(
                                  stageProgress,
                                  lesson.id
                                );

                                const completedStages = getCompletedStages(
                                  stageProgress,
                                  lesson.id
                                );

                                const stageCount = getCompletedStageCount(
                                  stageProgress,
                                  lesson.id
                                );

                                const unlocked = isLessonUnlocked(lesson);
                                const selected =
                                  Number(selectedTopic) === lessonId;

                                const isNext =
                                  !completed &&
                                  unlocked &&
                                  Number(nextLesson?.id) === lessonId;

                                const position =
                                  localIndex % 4 === 0
                                    ? "path-left"
                                    : localIndex % 4 === 1
                                      ? "path-center-left"
                                      : localIndex % 4 === 2
                                        ? "path-center-right"
                                        : "path-right";

                                const topicAction = getTopicAction(lesson);

                                return (
                                  <div
                                    className={[
                                      "sm-path-entry",
                                      selected ? "has-selected-topic" : "",
                                    ]
                                      .filter(Boolean)
                                      .join(" ")}
                                    key={lesson.id}
                                  >
                                    <div
                                      className={[
                                        "sm-path-stop",
                                        position,
                                        completed ? "is-completed" : "",
                                        unlocked ? "is-unlocked" : "is-locked",
                                        selected ? "is-selected" : "",
                                        isNext ? "is-next-topic" : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    >
                                      <button
                                        type="button"
                                        className="sm-path-node"
                                        onClick={() =>
                                          selectTopic(lesson, groupIndex)
                                        }
                                        disabled={!unlocked}
                                        aria-pressed={selected}
                                        aria-label={`Topic ${index + 1}: ${lesson.title}`}
                                        title={
                                          unlocked
                                            ? lesson.title
                                            : "Complete all four stages of the previous topic to unlock"
                                        }
                                      >
                                        <span className="sm-path-node-inner">
                                          {completed ? (
                                            <Check
                                              size={24}
                                              strokeWidth={3}
                                            />
                                          ) : !unlocked ? (
                                            <LockKeyhole size={20} />
                                          ) : isNext ? (
                                            <Play
                                              size={23}
                                              fill="currentColor"
                                            />
                                          ) : (
                                            <span>{localIndex + 1}</span>
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
                                          selectTopic(lesson, groupIndex)
                                        }
                                        disabled={!unlocked}
                                      >
                                        <span className="sm-path-topic-number">
                                          TOPIC{" "}
                                          {String(index + 1).padStart(2, "0")}
                                        </span>

                                        <strong>{lesson.title}</strong>

                                        <span className="sm-path-topic-meta">
                                          <Clock3 size={12} />
                                          {durationFor(lesson)}
                                        </span>

                                        <span className="sm-path-topic-status">
                                          {completed
                                            ? "✓ Completed"
                                            : !unlocked
                                              ? "🔒 Locked"
                                              : `${stageCount}/4 stages · ${xpFor(lesson)} XP`}
                                        </span>
                                      </button>
                                    </div>

                                    {selected && selectedLesson && (
                                      <div className="sm-selected-topic-anchor">
                                        <article
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
                                                <CheckCircle2 size={25} />
                                              ) : (
                                                <BookOpen size={25} />
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
                                                {durationFor(selectedLesson)}
                                                <span>·</span>
                                                <Zap size={13} />
                                                {xpFor(selectedLesson)} XP
                                              </span>
                                            </div>
                                          </div>

                                          <div className="sm-stage-panel">
                                            <div className="sm-stage-panel-heading">
                                              <strong>Topic levels</strong>
                                              <span>
                                                {completedStages.length}/4
                                                complete
                                              </span>
                                            </div>

                                            <div className="sm-stage-grid">
                                              {STAGES.map((stage, stageIndex) => {
                                                const done = isStageComplete(
                                                  stageProgress,
                                                  selectedLesson.id,
                                                  stage
                                                );

                                                const Icon =
                                                  STAGE_ICONS[stage];

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
                                                    ]
                                                      .filter(Boolean)
                                                      .join(" ")}
                                                    onClick={() =>
                                                      recordLastViewed(
                                                        selectedLesson,
                                                        groupIndex,
                                                        destination
                                                      )
                                                    }
                                                  >
                                                    <span className="sm-stage-link-icon">
                                                      {done ? (
                                                        <CheckCircle2
                                                          size={17}
                                                        />
                                                      ) : (
                                                        <Icon size={17} />
                                                      )}
                                                    </span>

                                                    <span className="sm-stage-link-name">
                                                      {STAGE_LABELS[stage]}
                                                    </span>

                                                    <span className="sm-stage-link-number">
                                                      {done
                                                        ? "Done"
                                                        : `Level ${stageIndex + 1}`}
                                                    </span>
                                                  </Link>
                                                );
                                              })}
                                            </div>
                                          </div>

                                          <div className="sm-cute-card-footer">
                                            <span className="sm-cute-card-hint">
                                              {selectedCompleted
                                                ? "✨ Revisit this quest anytime."
                                                : `${stageCount}/4 stages completed · Finish all four to unlock the next topic.`}
                                            </span>

                                            <Link
                                              to={topicAction.destination}
                                              className="sm-compact-topic-button"
                                              onClick={() =>
                                                recordLastViewed(
                                                  selectedLesson,
                                                  groupIndex,
                                                  topicAction.destination
                                                )
                                              }
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
                              })}
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
                                  {completedInWorld} of {group.lessons.length}{" "}
                                  topics completed
                                </small>
                              </span>
                            </div>
                          </div>

                          {!selectedLesson && (
                            <div className="sm-select-topic-prompt">
                              <Map size={23} />
                              <strong>Select an unlocked circle</strong>
                              <p>
                                Tap a topic on the path to start or resume
                                learning.
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
                to={getTopicStageDestination(
                  courseId,
                  nextLesson,
                  stageProgress
                )}
                className="sm-finish-button"
                onClick={() => {
                  const worldIndex = groups.findIndex((group) =>
                    group.lessons.some(
                      (lesson) =>
                        Number(lesson.id) === Number(nextLesson.id)
                    )
                  );

                  recordLastViewed(
                    nextLesson,
                    worldIndex,
                    getTopicStageDestination(
                      courseId,
                      nextLesson,
                      stageProgress
                    )
                  );
                }}
              >
                Continue <ArrowRight size={15} />
              </Link>
            )}
          </section>

          <section className="sm-bottom-banner">
            <div className="sm-bottom-banner-icon">
              <Sparkles size={23} />
            </div>

            <div>
              <h3>Small steps make big progress.</h3>
              <p>Watch. Understand. Apply. Solve. Keep evolving.</p>
            </div>

            <Link to="/dashboard" className="sm-bottom-link">
              Home <ArrowRight size={15} />
            </Link>
          </section>

          <footer className="sm-footer">
            <Link to="/dashboard" className="sm-footer-brand">
              <span>✦</span> EVOLV<span className="sm-footer-dot">.</span>
            </Link>

            <span>Learn. Practise. Keep evolving.</span>
          </footer>
        </div>
      </main>

      <Rightbar />
    </div>
  );
}