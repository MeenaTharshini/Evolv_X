
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
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
  Target,
  Trophy,
  Wrench,
  Zap,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Rightbar from "../components/Rightbar";
import { pythonLessons } from "../data/pythonLessons";
import "../styles/study-map.css";

const DEFAULT_COURSE = "python";
const QUIZ_TOTAL_MARKS = 5;

const COURSE_INFO = {
  python: {
    title: "Python Foundations",
    subtitle: "Code Forest",
    description:
      "Climb through Python one skill at a time. Understand concepts, practise code, and solve challenges.",
    icon: "🐍",
  },
};

const WORLD_ICONS = ["🌱", "🌲", "🌊", "💎", "⛰️", "🏰"];

const WORLD_DESCRIPTIONS = [
  "Start with the basics and meet Python.",
  "Make decisions with code.",
  "Repeat actions and build logic.",
  "Store and organise data.",
  "Build reusable blocks of code.",
  "Use your skills to solve challenges.",
];

const STAGES = [
  {
    id: "video",
    label: "01",
    title: "Watch",
    description: "Watch the lesson",
    icon: Play,
    color: "video",
  },
  {
    id: "understand",
    label: "02",
    title: "Understand",
    description: "Learn the concepts",
    icon: Brain,
    color: "understand",
  },
  {
    id: "apply",
    label: "03",
    title: "Apply",
    description: "Practise with code",
    icon: Wrench,
    color: "apply",
  },
  {
    id: "solve",
    label: "04",
    title: "Solve",
    description: "Take the 5-mark quiz",
    icon: Trophy,
    color: "solve",
  },
];

const safeRead = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
};

const readCompleted = (courseId) => {
  const value = safeRead(`evolv_${courseId}_completed`, []);

  return Array.isArray(value)
    ? [...new Set(value.map(Number).filter(Number.isFinite))]
    : [];
};

const readNumber = (key, fallback = 0) => {
  try {
    const value = localStorage.getItem(key);

    if (value === null || value.trim() === "") return fallback;

    const number = Number(value);
    return Number.isFinite(number) && number >= 0
      ? number
      : fallback;
  } catch {
    return fallback;
  }
};

const readQuizScores = (courseId) => {
  const value = safeRead(`evolv_${courseId}_quiz_scores`, {});
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
};

const durationFor = (lesson) => lesson.duration || "8 min";

const xpFor = (lesson) => {
  const value = Number(lesson.xp);
  return Number.isFinite(value) && value > 0 ? value : 10;
};

const areaFor = (lesson, index) =>
  lesson.area ||
  lesson.chapter ||
  lesson.category ||
  (index < 10
    ? "Python Meadow"
    : index < 20
      ? "Logic Forest"
      : index < 30
        ? "Loop River"
        : index < 40
          ? "Data Kingdom"
          : index < 50
            ? "Function Mountains"
            : "EVOLV Citadel");

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

  return groups;
}

function formatMinutes(lessons) {
  return lessons.reduce((total, lesson) => {
    const match = String(durationFor(lesson)).match(/\d+/);
    return total + (match ? Number(match[0]) : 8);
  }, 0);
}

function quizResultFor(scores, lessonId) {
  const value = scores[String(lessonId)];

  if (typeof value === "number" && Number.isFinite(value)) {
    const score = Math.min(QUIZ_TOTAL_MARKS, Math.max(0, value));
    return { latestScore: score, bestScore: score, attempts: 1 };
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { latestScore: null, bestScore: null, attempts: 0 };
  }

  const rawLatest =
    typeof value.latestScore === "number"
      ? value.latestScore
      : typeof value.score === "number"
        ? value.score
        : null;

  const rawBest =
    typeof value.bestScore === "number" ? value.bestScore : rawLatest;

  const latest =
    rawLatest === null || !Number.isFinite(rawLatest)
      ? null
      : Math.min(QUIZ_TOTAL_MARKS, Math.max(0, rawLatest));

  const best =
    rawBest === null || !Number.isFinite(rawBest)
      ? null
      : Math.min(QUIZ_TOTAL_MARKS, Math.max(0, rawBest));

  const savedAttempts = Number(value.attempts);

  return {
    latestScore: latest,
    bestScore: best,
    attempts:
      Number.isFinite(savedAttempts) && savedAttempts > 0
        ? savedAttempts
        : value.submittedAt
          ? 1
          : 0,
  };
}

function stageStatus(stageId, completed, lessonUnlocked) {
  if (!lessonUnlocked) return "locked";
  if (completed) return "completed";
  if (stageId === "solve") return "locked";
  if (stageId === "video") return "current";
  return "available";
}

export default function StudyMap() {
  const { courseId: routeCourseId } = useParams();

  const requestedCourseId = routeCourseId || DEFAULT_COURSE;
  const courseId = COURSE_INFO[requestedCourseId]
    ? requestedCourseId
    : DEFAULT_COURSE;

  const course = COURSE_INFO[courseId];
  const lessons = pythonLessons;

  const groups = useMemo(() => groupLessons(lessons), [lessons]);

  const [completedIds, setCompletedIds] = useState(
    () => readCompleted(courseId)
  );
  const [quizScores, setQuizScores] = useState(
    () => readQuizScores(courseId)
  );
  const [xp, setXp] = useState(
    () => readNumber(`evolv_${courseId}_xp`, 0)
  );
  const [streak, setStreak] = useState(
    () => readNumber(`evolv_${courseId}_streak`, 0)
  );

  const [expandedWorld, setExpandedWorld] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const completedSet = useMemo(
    () => new Set(completedIds.map(Number)),
    [completedIds]
  );

  const completedCount = lessons.filter((lesson) =>
    completedSet.has(Number(lesson.id))
  ).length;

  const progress = lessons.length
    ? Math.round((completedCount / lessons.length) * 100)
    : 0;

  const nextLesson =
    lessons.find((lesson) => !completedSet.has(Number(lesson.id))) || null;

  const activeWorldIndex = nextLesson
    ? groups.findIndex((group) =>
        group.lessons.some(
          (lesson) => Number(lesson.id) === Number(nextLesson.id)
        )
      )
    : Math.max(0, groups.length - 1);

  const allComplete =
    lessons.length > 0 && completedCount === lessons.length;

  const earnedXp = lessons.reduce(
    (total, lesson) =>
      completedSet.has(Number(lesson.id))
        ? total + xpFor(lesson)
        : total,
    0
  );

  const displayedXp = Math.max(xp, earnedXp);

  const quizAttemptCount = lessons.reduce(
    (total, lesson) =>
      total + quizResultFor(quizScores, lesson.id).attempts,
    0
  );

  const refreshProgress = useCallback(() => {
    setCompletedIds(readCompleted(courseId));
    setQuizScores(readQuizScores(courseId));
    setXp(readNumber(`evolv_${courseId}_xp`, 0));
    setStreak(readNumber(`evolv_${courseId}_streak`, 0));
  }, [courseId]);

  useEffect(() => {
    refreshProgress();

    const handleStorage = (event) => {
      if (
        !event ||
        event.key === null ||
        event.key === `evolv_${courseId}_completed` ||
        event.key === `evolv_${courseId}_xp` ||
        event.key === `evolv_${courseId}_streak` ||
        event.key === `evolv_${courseId}_quiz_scores`
      ) {
        refreshProgress();
      }
    };

    window.addEventListener("focus", refreshProgress);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("evolv-progress-updated", refreshProgress);

    return () => {
      window.removeEventListener("focus", refreshProgress);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "evolv-progress-updated",
        refreshProgress
      );
    };
  }, [courseId, refreshProgress]);

  useEffect(() => {
    if (activeWorldIndex < 0) {
      setExpandedWorld(0);
      setSelectedTopic(null);
      return;
    }

    setExpandedWorld(activeWorldIndex);

    const activeLesson = groups[activeWorldIndex]?.lessons.find(
      (lesson) => Number(lesson.id) === Number(nextLesson?.id)
    );

    setSelectedTopic(
      activeLesson ? Number(activeLesson.id) : null
    );
  }, [courseId, activeWorldIndex, nextLesson?.id, groups]);

  function isWorldUnlocked(groupIndex) {
    if (groupIndex === 0) return true;

    return groups
      .slice(0, groupIndex)
      .every((group) =>
        group.lessons.every((lesson) =>
          completedSet.has(Number(lesson.id))
        )
      );
  }

  function isLessonUnlocked(index) {
    if (index === 0) return true;

    return completedSet.has(Number(lessons[index - 1]?.id));
  }

  function toggleWorld(index) {
    const group = groups[index];
    if (!group || !isWorldUnlocked(index)) return;

    if (expandedWorld === index) {
      setExpandedWorld(null);
      setSelectedTopic(null);
      return;
    }

    setExpandedWorld(index);

    const firstAvailable =
      group.lessons.find((lesson) =>
        isLessonUnlocked(lesson._index)
      ) || group.lessons[0];

    setSelectedTopic(firstAvailable ? Number(firstAvailable.id) : null);
  }

  function selectTopic(lesson) {
    if (!isLessonUnlocked(lesson._index)) return;
    setSelectedTopic(Number(lesson.id));
  }

  const selectedGroup =
    expandedWorld === null ? null : groups[expandedWorld];

  const selectedLesson =
    selectedGroup?.lessons.find(
      (lesson) => Number(lesson.id) === Number(selectedTopic)
    ) || null;

  const selectedLessonCompleted = selectedLesson
    ? completedSet.has(Number(selectedLesson.id))
    : false;

  const selectedLessonUnlocked = selectedLesson
    ? isLessonUnlocked(selectedLesson._index)
    : false;

  const selectedQuizResult = selectedLesson
    ? quizResultFor(quizScores, selectedLesson.id)
    : null;

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
            <Link to="/dashboard" className="sm-back-link">
              <ArrowLeft size={15} />
              Back to Home
            </Link>

            <div className="sm-heading-main">
              <div className="sm-heading-copy">
                <span className="sm-eyebrow">
                  <Sparkles size={14} />
                  YOUR LEARNING ADVENTURE
                </span>

                <h1>Your Study Map</h1>

                <p>
                  Travel through learning worlds. Choose a topic and
                  follow its levels to master Python.
                </p>
              </div>

              <div className="sm-course-emblem">
                <span>{course.icon}</span>
                <Sparkles className="sm-emblem-spark" size={18} />
              </div>
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
                  <Target size={15} />
                  Beginner friendly
                </span>
              </div>
            </div>

            <div className="sm-course-progress">
              <div
                className="sm-progress-ring"
                style={{ "--progress": `${progress}%` }}
                role="img"
                aria-label={`${progress}% of lessons completed`}
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
                <span>lessons completed</span>
              </div>
            </div>
          </section>

          <section className="sm-stat-grid" aria-label="Learning statistics">
            <article className="sm-stat-card sm-stat-xp">
              <span className="sm-stat-icon"><Zap size={19} /></span>
              <div><span>Total XP</span><strong>{displayedXp}</strong></div>
            </article>

            <article className="sm-stat-card sm-stat-streak">
              <span className="sm-stat-icon"><Flame size={19} /></span>
              <div><span>Learning streak</span><strong>{streak} days</strong></div>
            </article>

            <article className="sm-stat-card sm-stat-completed">
              <span className="sm-stat-icon"><CheckCircle2 size={19} /></span>
              <div>
                <span>Lessons completed</span>
                <strong>{completedCount}/{lessons.length}</strong>
              </div>
            </article>

            <article className="sm-stat-card sm-stat-next">
              <span className="sm-stat-icon"><Award size={19} /></span>
              <div><span>Quiz attempts</span><strong>{quizAttemptCount}</strong></div>
            </article>
          </section>

          <section className="sm-path-section">
            <div className="sm-section-heading">
              <div>
                <span className="sm-eyebrow">EXPLORE · LEARN · LEVEL UP</span>
                <h2>Your learning worlds</h2>
                <p>
                  Open a world, travel across its topic train, then
                  explore the levels underneath your chosen topic.
                </p>
              </div>

              <span className="sm-path-count">
                <Map size={15} />
                {completedCount}/{lessons.length}
              </span>
            </div>

            <div className="sm-legend">
              <span><i className="legend-current" /> Current topic</span>
              <span><i className="legend-completed" /> Completed</span>
              <span><i className="legend-locked" /> Locked</span>
            </div>

            <div className="sm-world-list">
              {groups.map((group, groupIndex) => {
                const expanded = expandedWorld === groupIndex;
                const worldLocked = !isWorldUnlocked(groupIndex);

                const worldCompleted = group.lessons.filter((lesson) =>
                  completedSet.has(Number(lesson.id))
                ).length;

                const worldComplete =
                  group.lessons.length > 0 &&
                  worldCompleted === group.lessons.length;

                const worldHasCurrent = group.lessons.some(
                  (lesson) =>
                    Number(lesson.id) === Number(nextLesson?.id)
                );

                return (
                  <section
                    className={[
                      "sm-world",
                      expanded ? "is-expanded" : "",
                      worldHasCurrent ? "is-active-world" : "",
                      worldLocked ? "is-locked-world" : "",
                      worldComplete ? "is-complete-world" : "",
                    ].filter(Boolean).join(" ")}
                    key={`${group.title}-${groupIndex}`}
                  >
                    <button
                      type="button"
                      className="sm-world-header"
                      onClick={() => toggleWorld(groupIndex)}
                      aria-expanded={expanded}
                      disabled={worldLocked}
                    >
                      <span className="sm-world-icon">
                        {worldComplete ? (
                          <Check size={24} strokeWidth={3} />
                        ) : worldLocked ? (
                          <LockKeyhole size={21} />
                        ) : (
                          WORLD_ICONS[groupIndex % WORLD_ICONS.length]
                        )}
                      </span>

                      <span className="sm-world-heading-copy">
                        <span className="sm-world-kicker">
                          WORLD {String(groupIndex + 1).padStart(2, "0")}
                          {worldHasCurrent && (
                            <span className="sm-world-current-label">
                              CURRENT WORLD
                            </span>
                          )}
                          {worldLocked && (
                            <span className="sm-world-locked-label">LOCKED</span>
                          )}
                        </span>

                        <strong>{group.title}</strong>

                        <span className="sm-world-description">
                          {WORLD_DESCRIPTIONS[groupIndex % WORLD_DESCRIPTIONS.length]}
                        </span>
                      </span>

                      <span className="sm-world-progress">
                        <span>{worldCompleted}/{group.lessons.length}</span>
                        <span className="sm-world-progress-track">
                          <span
                            style={{
                              width: `${
                                group.lessons.length
                                  ? (worldCompleted / group.lessons.length) * 100
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
                              <Sparkles size={17} />
                            </span>
                            <div>
                              <strong>Choose your next topic</strong>
                              <p>
                                Follow the train from left to right.
                                Select a station to reveal its four levels.
                              </p>
                            </div>
                          </div>

                          {/* HORIZONTAL TOPIC TRAIN */}
                          <div
                            className="sm-topic-train"
                            aria-label={`${group.title} topics`}
                          >
                            <div className="sm-topic-train-track" />

                            {group.lessons.map((lesson) => {
                              const index = lesson._index;
                              const lessonId = Number(lesson.id);
                              const completed = completedSet.has(lessonId);
                              const unlocked = isLessonUnlocked(index);
                              const selected = selectedTopic === lessonId;

                              return (
                                <button
                                  type="button"
                                  key={lesson.id}
                                  className={[
                                    "sm-train-station",
                                    completed ? "is-completed" : "",
                                    selected ? "is-selected" : "",
                                    !unlocked ? "is-locked" : "",
                                    !completed && unlocked ? "is-current" : "",
                                  ].filter(Boolean).join(" ")}
                                  onClick={() => selectTopic(lesson)}
                                  disabled={!unlocked}
                                  aria-pressed={selected}
                                  title={
                                    unlocked
                                      ? lesson.title
                                      : "Complete the previous topic to unlock"
                                  }
                                >
                                  <span className="sm-train-node">
                                    {completed ? (
                                      <Check size={17} strokeWidth={3} />
                                    ) : !unlocked ? (
                                      <LockKeyhole size={15} />
                                    ) : (
                                      <span>{index + 1}</span>
                                    )}
                                  </span>

                                  <span className="sm-train-card">
                                    <span className="sm-train-number">
                                      TOPIC {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <strong>{lesson.title}</strong>
                                    <span className="sm-train-meta">
                                      <Clock3 size={12} />
                                      {durationFor(lesson)}
                                    </span>
                                    <span className="sm-train-status">
                                      {completed
                                        ? "Completed"
                                        : !unlocked
                                          ? "Locked"
                                          : selected
                                            ? "Selected"
                                            : `${xpFor(lesson)} XP`}
                                    </span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* SELECTED TOPIC DETAILS UNDER THE TRAIN */}
                          {selectedLesson && (
                            <article className="sm-selected-topic">
                              <div className="sm-selected-topic-header">
                                <div className="sm-selected-topic-icon">
                                  {selectedLessonCompleted ? (
                                    <CheckCircle2 size={23} />
                                  ) : (
                                    <BookOpen size={23} />
                                  )}
                                </div>

                                <div className="sm-selected-topic-copy">
                                  <span>
                                    SELECTED TOPIC · WORLD {groupIndex + 1}
                                  </span>
                                  <h3>{selectedLesson.title}</h3>
                                  <p>
                                    {selectedLesson.description ||
                                      "Explore the concept, practise your code, and check your understanding."}
                                  </p>
                                </div>

                                <span className="sm-selected-topic-xp">
                                  <Zap size={14} />
                                  {xpFor(selectedLesson)} XP
                                </span>
                              </div>

                              <div className="sm-level-heading">
                                <div>
                                  <span className="sm-eyebrow">YOUR FOUR LEVELS</span>
                                  <h4>Complete the journey</h4>
                                </div>
                                <span className="sm-level-order">01 → 02 → 03 → 04</span>
                              </div>

                              <div className="sm-level-grid">
                                {STAGES.map((stage) => {
                                  const Icon = stage.icon;
                                  const isQuiz = stage.id === "solve";
                                  const quizUnlocked =
                                    selectedLessonUnlocked &&
                                    selectedLessonCompleted;

                                  const status = stageStatus(
                                    stage.id,
                                    selectedLessonCompleted,
                                    selectedLessonUnlocked
                                  );

                                  const stageLocked =
                                    status === "locked" ||
                                    (isQuiz && !quizUnlocked);

                                  const href = isQuiz
                                    ? `/study/${courseId}/lesson/${selectedLesson.id}/quiz`
                                    : `/study/${courseId}/lesson/${selectedLesson.id}?stage=${stage.id}`;

                                  const score = selectedQuizResult?.latestScore;

                                  return (
                                    <div
                                      className={[
                                        "sm-level-card",
                                        `stage-${stage.color}`,
                                        `stage-status-${status}`,
                                        stageLocked ? "is-locked" : "",
                                      ].filter(Boolean).join(" ")}
                                      key={stage.id}
                                    >
                                      <span className="sm-level-card-number">
                                        {stage.label}
                                      </span>

                                      <span className="sm-level-card-icon">
                                        {status === "completed" ? (
                                          <Check size={21} strokeWidth={3} />
                                        ) : stageLocked ? (
                                          <LockKeyhole size={19} />
                                        ) : (
                                          <Icon size={21} />
                                        )}
                                      </span>

                                      <div className="sm-level-card-copy">
                                        <strong>{stage.title}</strong>
                                        <span>{stage.description}</span>

                                        {isQuiz && score !== null && score !== undefined && (
                                          <small>
                                            Latest {score}/5
                                            {selectedQuizResult.bestScore !== null &&
                                              ` · Best ${selectedQuizResult.bestScore}/5`}
                                          </small>
                                        )}
                                      </div>

                                      {stageLocked ? (
                                        <span
                                          className="sm-level-action is-disabled"
                                          title={
                                            isQuiz
                                              ? "Complete the lesson to unlock the quiz"
                                              : "Complete the previous topic to unlock this level"
                                          }
                                        >
                                          <LockKeyhole size={14} />
                                          Locked
                                        </span>
                                      ) : (
                                        <Link
                                          to={href}
                                          className="sm-level-action"
                                        >
                                          {status === "completed"
                                            ? "Review"
                                            : isQuiz
                                              ? "Take quiz"
                                              : "Open level"}
                                          <ArrowRight size={14} />
                                        </Link>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="sm-selected-topic-footer">
                                <div className="sm-topic-status">
                                  {selectedLessonCompleted ? (
                                    <>
                                      <CheckCircle2 size={16} />
                                      Lesson completed
                                      {selectedQuizResult?.latestScore !== null &&
                                        selectedQuizResult?.latestScore !== undefined &&
                                        ` · Quiz ${selectedQuizResult.latestScore}/5`}
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles size={16} />
                                      Start with Watch, then continue through each level.
                                    </>
                                  )}
                                </div>

                                <Link
                                  to={`/study/${courseId}/lesson/${selectedLesson.id}`}
                                  className="sm-topic-action"
                                >
                                  {selectedLessonCompleted ? "Review lesson" : "Start lesson"}
                                  <ArrowRight size={15} />
                                </Link>
                              </div>
                            </article>
                          )}

                          {!selectedLesson && (
                            <div className="sm-select-topic-prompt">
                              <Map size={22} />
                              <strong>Choose a station on the topic train</strong>
                              <p>Select an unlocked topic to see its four learning levels here.</p>
                            </div>
                          )}

                          <div className="sm-world-end">
                            <span className="sm-world-end-icon">
                              {worldComplete ? <Trophy size={19} /> : <Flag size={18} />}
                            </span>
                            <span>
                              <strong>
                                {worldComplete ? "World conquered!" : "World milestone"}
                              </strong>
                              <small>
                                {worldCompleted} of {group.lessons.length} topics completed
                              </small>
                            </span>
                          </div>
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
              {allComplete ? <Trophy size={26} /> : <Star size={25} />}
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
                  ? "Amazing work. Revisit any lesson and quiz whenever you want to practise."
                  : "Choose the next station on your train and continue your learning journey."}
              </p>
            </div>

            {nextLesson && (
              <Link
                to={`/study/${courseId}/lesson/${nextLesson.id}`}
                className="sm-finish-button"
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
