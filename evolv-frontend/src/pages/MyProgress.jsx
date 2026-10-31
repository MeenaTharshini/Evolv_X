import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  Flame,
  Map as MapIcon,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import EvolvLoader from "../components/EvolvLoader";

import Navbar from "../components/Navbar";
import Rightbar from "../components/Rightbar";
import { pythonLessons } from "../data/pythonLessons";
import { supabase } from "../lib/supabaseClient";
import { getStreak } from "../services/api";
import {
  STAGES,
  getCompletedStages,
} from "../utils/lessonProgress";

import "../styles/my-progress.css";

const COURSE_ID = "python";
const COURSE_NAME = "Python Foundations";
const STUDY_MAP_LINK = `/study/${COURSE_ID}`;

const LOADER_MESSAGE = "Loading your journey...";

const STAGE_XP = {
  video: 10,
  concept: 10,
  "hands-on": 20,
  hands_on: 20,
  quiz: 20,
};

const INITIAL_STATE = {
  loading: true,
  error: "",
  userId: null,
  xp: 0,
  streak: 0,
  stageProgress: {},
  quizScores: {},
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(
    Number.isFinite(Number(value)) ? Number(value) : 0
  );
}

function normalizeStage(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function getStageLabel(stage) {
  return String(stage)
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getFrontendLessonNumber(lesson) {
  const numericId = Number(lesson?.id);

  if (Number.isInteger(numericId) && numericId > 0) {
    return numericId;
  }

  const slug = String(lesson?.slug ?? "");
  const match = slug.match(/^python-lesson-([1-9]\d*)$/);

  return match ? Number(match[1]) : null;
}

/**
 * Maps database lesson IDs to frontend curriculum lesson numbers.
 *
 * The frontend uses lesson numbers, while lessons.id in Supabase is bigint.
 * The mapping is built from each lesson's slug, not from assumptions that
 * database IDs and frontend lesson numbers are identical.
 */
function buildDatabaseLessonMap(databaseLessons, frontendLessons) {
  const databaseLessonMap = new Map();
  const frontendNumbers = new Set(
    frontendLessons
      .map(getFrontendLessonNumber)
      .filter((number) => number !== null)
  );

  for (const row of databaseLessons ?? []) {
    const match = String(row.slug ?? "").match(
      /^python-lesson-([1-9]\d*)$/
    );

    if (!match) continue;

    const frontendLessonNumber = Number(match[1]);
    const databaseLessonId = Number(row.id);

    if (
      !Number.isSafeInteger(databaseLessonId) ||
      databaseLessonId <= 0 ||
      !frontendNumbers.has(frontendLessonNumber)
    ) {
      continue;
    }

    databaseLessonMap.set(databaseLessonId, frontendLessonNumber);
  }

  return databaseLessonMap;
}

/**
 * Converts lesson_stage_progress rows into the structure consumed by
 * getCompletedStages().
 *
 * Only completed stages are marked as complete. The original STAGES values
 * are retained as object keys so they match the utility's expectations.
 */
function buildStageProgress(stageRows, databaseLessonMap) {
  const result = {};
  const stageLookup = new Map(
    STAGES.map((stage) => [normalizeStage(stage), stage])
  );

  for (const row of stageRows ?? []) {
    if (row.completed !== true) continue;

    const lessonNumber = databaseLessonMap.get(Number(row.lesson_id));
    const normalizedStage = normalizeStage(row.stage);
    const canonicalStage = stageLookup.get(normalizedStage);

    if (lessonNumber == null || !canonicalStage) continue;

    const lessonKey = String(lessonNumber);

    if (!result[lessonKey]) {
      result[lessonKey] = {};
    }

    result[lessonKey][canonicalStage] = {
      completed: true,
      completedAt: row.completed_at ?? null,
    };
  }

  return result;
}

function isLessonComplete(stageProgress, lessonId) {
  const completedStages = getCompletedStages(stageProgress, lessonId);

  return (
    STAGES.length > 0 &&
    completedStages.length >= STAGES.length
  );
}

/**
 * quiz_attempts.score stores the number of correct answers, not necessarily
 * a percentage. Convert score/total_questions to a percentage for display.
 *
 * The quiz_attempts table uses completed_at, not created_at.
 */
function buildQuizScores(attemptRows, databaseLessonMap, frontendLessons) {
  const result = {};
  const frontendLessonNumbers = new Set(
    frontendLessons
      .map(getFrontendLessonNumber)
      .filter((number) => number !== null)
  );

  for (const row of attemptRows ?? []) {
    let lessonNumber = null;

    const rawLessonId = String(row.lesson_id ?? "").trim();

    // Support attempts saved with the lesson slug, e.g. python-lesson-1.
    const slugMatch = rawLessonId.match(
      /^python-lesson-([1-9]\d*)$/
    );

    if (slugMatch) {
      lessonNumber = Number(slugMatch[1]);
    } else {
      // The quiz_attempts.lesson_id column is TEXT. It may contain the
      // numeric database lesson ID or a frontend lesson number.
      const numericLessonId = Number(rawLessonId);

      if (
        Number.isSafeInteger(numericLessonId) &&
        numericLessonId > 0
      ) {
        lessonNumber =
          databaseLessonMap.get(numericLessonId) ??
          (frontendLessonNumbers.has(numericLessonId)
            ? numericLessonId
            : null);
      }
    }

    if (
      lessonNumber == null ||
      !frontendLessonNumbers.has(lessonNumber)
    ) {
      continue;
    }

    const correctAnswers = Number(row.score);
    const totalQuestions = Number(row.total_questions);

    if (
      !Number.isFinite(correctAnswers) ||
      !Number.isFinite(totalQuestions) ||
      totalQuestions <= 0 ||
      correctAnswers < 0 ||
      correctAnswers > totalQuestions
    ) {
      continue;
    }

    const percentage = Math.round(
      (correctAnswers / totalQuestions) * 100
    );

    const key = String(lessonNumber);

    if (!result[key]) {
      result[key] = {
        attempts: 0,
        latestScore: percentage,
        latestCompletedAt: row.completed_at ?? null,
        totalCorrect: 0,
        totalQuestions: 0,
        attemptHistory: [],
      };
    }

    result[key].attempts += 1;
    result[key].totalCorrect += correctAnswers;
    result[key].totalQuestions += totalQuestions;

    result[key].attemptHistory.push({
      score: correctAnswers,
      totalQuestions,
      percentage,
      attemptNumber: Number(row.attempt_number) || null,
      xpEarned: Number(row.xp_earned) || 0,
      completedAt: row.completed_at ?? null,
    });
  }

  return result;
}

function getQuizResult(scores, lessonId) {
  const result =
    scores[String(lessonId)] ??
    scores[lessonId] ??
    scores[`python_${lessonId}`];

  if (typeof result === "number" && Number.isFinite(result)) {
    return {
      attempts: 1,
      score: result,
    };
  }

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return {
      attempts: 0,
      score: null,
    };
  }

  const attempts = Number(result.attempts);

  const score =
    typeof result.latestScore === "number"
      ? result.latestScore
      : typeof result.score === "number"
        ? result.score
        : null;

  return {
    attempts:
      Number.isFinite(attempts) && attempts > 0
        ? attempts
        : result.submittedAt
          ? 1
          : 0,
    score:
      score !== null && Number.isFinite(score)
        ? score
        : null,
  };
}

function getAverageQuizScore(scores, lessons) {
  const results = lessons
    .map((lesson) => {
      const lessonNumber = getFrontendLessonNumber(lesson);

      return lessonNumber == null
        ? { attempts: 0, score: null }
        : getQuizResult(scores, lessonNumber);
    })
    .filter(
      (result) =>
        result.attempts > 0 &&
        result.score !== null &&
        Number.isFinite(result.score)
    );

  if (results.length === 0) return null;

  return Math.round(
    results.reduce((total, result) => total + result.score, 0) /
      results.length
  );
}

function getAchievements({
  completedCount,
  totalLessons,
  xp,
  quizAttempts,
  streak,
}) {
  return [
    {
      id: "first-step",
      title: "First Steps",
      description: "Complete your first topic.",
      icon: CheckCircle2,
      unlocked: completedCount >= 1,
    },
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Complete 5 topics.",
      icon: BookOpen,
      unlocked: completedCount >= 5,
    },
    {
      id: "halfway",
      title: "Growing Strong",
      description: "Complete half of your course.",
      icon: Target,
      unlocked:
        totalLessons > 0 &&
        completedCount >= Math.ceil(totalLessons / 2),
    },
    {
      id: "xp-collector",
      title: "XP Collector",
      description: "Earn 100 XP.",
      icon: Zap,
      unlocked: xp >= 100,
    },
    {
      id: "quiz-explorer",
      title: "Quiz Explorer",
      description: "Attempt 5 quizzes.",
      icon: Award,
      unlocked: quizAttempts >= 5,
    },
    {
      id: "streak-starter",
      title: "Consistency Counts",
      description: "Build a 3-day learning streak.",
      icon: Flame,
      unlocked: streak >= 3,
    },
  ];
}

function ErrorState({ message, onRetry, loading }) {
  return (
    <section className="mp-course-card" role="alert">
      <h2>Unable to load your progress</h2>
      <p>{message}</p>

      <button
        type="button"
        className="mp-refresh-button"
        onClick={onRetry}
        disabled={loading}
      >
        <RefreshCw
          size={16}
          className={loading ? "mp-spin" : ""}
        />
        {loading ? "Retrying..." : "Try again"}
      </button>
    </section>
  );
}

/**
 * Fetch quiz history exclusively from Supabase.
 * localStorage is intentionally not used as a fallback because Supabase
 * should be the source of truth for saved quiz attempts.
 */
async function fetchQuizAttempts(userId, databaseLessonMap, lessons) {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select(
      "id, lesson_id, score, total_questions, attempt_number, xp_earned, answers_json, completed_at"
    )
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) {
    throw error;
  }

  return buildQuizScores(
    data ?? [],
    databaseLessonMap,
    lessons
  );
}

export default function MyProgress() {
  const lessons = pythonLessons;

  const [dashboard, setDashboard] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(0);

  const refreshProgress = useCallback(async () => {
    setLoading(true);

    // The full-page loader is only for the first load. Later refreshes
    // (refresh button, tab focus, progress events) keep the page visible
    // and only spin the refresh button.
    setDashboard((previous) => ({
      ...previous,
      loading: previous.userId ? false : true,
      error: "",
    }));

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setDashboard({
          ...INITIAL_STATE,
          loading: false,
          error: "Please log in to view your learning progress.",
        });
        return;
      }

      const [
        lessonsResult,
        statsResult,
        stageResult,
        streakResult,
      ] = await Promise.all([
        supabase
          .from("lessons")
          .select("id, slug")
          .like("slug", "python-lesson-%"),

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

        getStreak().catch((error) => {
          console.warn(
            "Streak API unavailable; using Supabase user statistics:",
            error
          );
          return null;
        }),
      ]);

      if (lessonsResult.error) throw lessonsResult.error;
      if (statsResult.error) throw statsResult.error;
      if (stageResult.error) throw stageResult.error;

      const databaseLessonMap = buildDatabaseLessonMap(
        lessonsResult.data ?? [],
        lessons
      );

      const mappedQuizScores = await fetchQuizAttempts(
        user.id,
        databaseLessonMap,
        lessons
      );

      const stats = statsResult.data;
      const stageRows = stageResult.data ?? [];
      const stageProgress = buildStageProgress(
        stageRows,
        databaseLessonMap
      );

      /*
       * user_stats.total_xp is authoritative when the row exists.
       * Deriving XP from completed stages is only a fallback if no stats row
       * has been created yet; it does not overwrite the database.
       */
      const statsXP = Number(stats?.total_xp);

      const progressXP = stageRows.reduce((total, row) => {
        if (row.completed !== true) return total;

        const stageXP = STAGE_XP[normalizeStage(row.stage)] ?? 0;
        return total + stageXP;
      }, 0);

      const xp =
        stats?.total_xp !== null &&
        stats?.total_xp !== undefined &&
        Number.isFinite(statsXP)
          ? statsXP
          : progressXP;

      const apiStreak = Number(streakResult?.currentStreak);
      const savedStreak = Number(stats?.current_streak);

      const streak =
        streakResult &&
        Number.isFinite(apiStreak) &&
        apiStreak >= 0
          ? apiStreak
          : Number.isFinite(savedStreak) && savedStreak >= 0
            ? savedStreak
            : 0;

      setDashboard({
        loading: false,
        error: "",
        userId: user.id,
        xp,
        streak,
        stageProgress,
        quizScores: mappedQuizScores,
      });

      setLastUpdated(Date.now());
    } catch (error) {
      console.error("Failed to load user progress:", error);

      setDashboard((previous) => ({
        ...previous,
        loading: false,
        error:
          error?.message ||
          "Something went wrong while loading your progress.",
      }));
    } finally {
      setLoading(false);
    }
  }, [lessons]);

  useEffect(() => {
    let active = true;
    let refreshTimer;

    const runRefresh = () => {
      if (active) {
        void refreshProgress();
      }
    };

    runRefresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        [
          "SIGNED_IN",
          "SIGNED_OUT",
          "TOKEN_REFRESHED",
          "USER_UPDATED",
        ].includes(event)
      ) {
        window.clearTimeout(refreshTimer);

        refreshTimer = window.setTimeout(() => {
          if (active) {
            void refreshProgress();
          }
        }, 0);
      }
    });

    const handleProgressUpdated = () => runRefresh();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        runRefresh();
      }
    };

    window.addEventListener(
      "evolv:progress-updated",
      handleProgressUpdated
    );

    window.addEventListener(
      "evolv-progress-updated",
      handleProgressUpdated
    );

    window.addEventListener(
      "evolv:streak-updated",
      handleProgressUpdated
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      active = false;
      window.clearTimeout(refreshTimer);
      subscription.unsubscribe();

      window.removeEventListener(
        "evolv:progress-updated",
        handleProgressUpdated
      );

      window.removeEventListener(
        "evolv-progress-updated",
        handleProgressUpdated
      );

      window.removeEventListener(
        "evolv:streak-updated",
        handleProgressUpdated
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [refreshProgress]);

  const stageProgress = dashboard.stageProgress;
  const quizScores = dashboard.quizScores;

  const completedLessons = useMemo(
    () =>
      lessons.filter((lesson) => {
        const lessonNumber = getFrontendLessonNumber(lesson);

        return (
          lessonNumber !== null &&
          isLessonComplete(stageProgress, lessonNumber)
        );
      }),
    [lessons, stageProgress, lastUpdated]
  );

  const completedCount = completedLessons.length;
  const totalLessons = lessons.length;

  const progress = totalLessons
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  const totalStages = totalLessons * STAGES.length;

  const completedStages = lessons.reduce((total, lesson) => {
    const lessonNumber = getFrontendLessonNumber(lesson);

    if (lessonNumber === null) return total;

    return (
      total +
      getCompletedStages(stageProgress, lessonNumber).length
    );
  }, 0);

  const quizAttempts = lessons.reduce((total, lesson) => {
    const lessonNumber = getFrontendLessonNumber(lesson);

    if (lessonNumber === null) return total;

    return total + getQuizResult(quizScores, lessonNumber).attempts;
  }, 0);

  const averageQuizScore = getAverageQuizScore(
    quizScores,
    lessons
  );

  const displayedXP = dashboard.xp;

  const nextLesson =
    lessons.find((lesson) => {
      const lessonNumber = getFrontendLessonNumber(lesson);

      return (
        lessonNumber !== null &&
        !isLessonComplete(stageProgress, lessonNumber)
      );
    }) ?? null;

  const achievements = getAchievements({
    completedCount,
    totalLessons,
    xp: displayedXP,
    quizAttempts,
    streak: dashboard.streak,
  });

  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked
  ).length;

  const courseComplete =
    totalLessons > 0 && completedCount === totalLessons;

  return (
    <div className="mp-page">
      <Navbar />

      <main className="mp-main">
        <header className="mp-topbar">
          <div className="mp-breadcrumb">
            <Link to="/dashboard">Home</Link>
            <span aria-hidden="true">/</span>
            <strong>My Progress</strong>
          </div>

          <button
            className="mp-refresh-button"
            type="button"
            onClick={refreshProgress}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "mp-spin" : ""}
            />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </header>

        <div className="mp-content">
          {dashboard.loading ? (
            <EvolvLoader message={LOADER_MESSAGE} />
          ) : dashboard.error ? (
            <ErrorState
              message={dashboard.error}
              onRetry={refreshProgress}
              loading={loading}
            />
          ) : (
            <>
              <section className="mp-page-heading">
                <div className="mp-heading-copy">
                  <span className="mp-eyebrow">
                    <Sparkles size={15} />
                    YOUR LEARNING ADVENTURE
                  </span>

                  <h1>
                    My Progress<span>.</span>
                  </h1>

                  <p>
                    Every lesson completed is another step forward.
                    See how far you have travelled in EVOLV.
                  </p>
                </div>

                <div className="mp-heading-art" aria-hidden="true">
                  <span className="mp-heading-sprout">🌱</span>
                  <Sparkles
                    className="mp-heading-sparkle"
                    size={20}
                  />
                </div>
              </section>

              <section className="mp-course-card">
                <div className="mp-course-heading">
                  <div className="mp-course-icon" aria-hidden="true">
                    <span>🌀</span>
                  </div>

                  <div className="mp-course-copy">
                    <span className="mp-section-eyebrow">
                      YOUR ACTIVE COURSE
                    </span>

                    <h2>{COURSE_NAME}</h2>

                    <p>
                      Code Forest · Learn, practise, and grow.
                    </p>
                  </div>

                  <Link
                    to={STUDY_MAP_LINK}
                    className="mp-study-map-button"
                  >
                    <MapIcon size={17} />
                    <span>Study map</span>
                  </Link>
                </div>

                <div className="mp-course-progress-heading">
                  <span>Overall course progress</span>
                  <strong>{progress}%</strong>
                </div>

                <div
                  className="mp-progress-track"
                  role="progressbar"
                  aria-label="Overall course progress"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="mp-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mp-course-meta">
                  <span>
                    <CheckCircle2 size={16} />
                    {completedCount} of {totalLessons} topics completed
                  </span>

                  <span>
                    <BookOpen size={16} />
                    {completedStages} of {totalStages} stages completed
                  </span>
                </div>
              </section>

              <section
                className="mp-stats-grid"
                aria-label="Learning statistics"
              >
                <article className="mp-stat-card">
                  <div className="mp-stat-icon mp-stat-xp">
                    <Zap size={22} />
                  </div>

                  <div className="mp-stat-copy">
                    <span>Total XP</span>
                    <strong>{formatNumber(displayedXP)}</strong>
                    <small>Experience earned</small>
                  </div>
                </article>

                <article className="mp-stat-card">
                  <div className="mp-stat-icon mp-stat-topics">
                    <BookOpen size={22} />
                  </div>

                  <div className="mp-stat-copy">
                    <span>Topics completed</span>
                    <strong>
                      {completedCount}/{totalLessons}
                    </strong>
                    <small>Your completed lessons</small>
                  </div>
                </article>

                <article className="mp-stat-card">
                  <div className="mp-stat-icon mp-stat-streak">
                    <Flame size={22} />
                  </div>

                  <div className="mp-stat-copy">
                    <span>Learning streak</span>
                    <strong>
                      {dashboard.streak}{" "}
                      {dashboard.streak === 1 ? "day" : "days"}
                    </strong>
                    <small>Consecutive active days</small>
                  </div>
                </article>
              </section>

              <section className="mp-section">
                <div className="mp-section-heading">
                  <div>
                    <span className="mp-section-eyebrow">
                      EXPLORE YOUR JOURNEY
                    </span>

                    <h2>Your learning journey</h2>

                    <p>
                      Every completed stage brings you closer to your goal.
                    </p>
                  </div>

                  <Link
                    to={STUDY_MAP_LINK}
                    className="mp-text-link"
                  >
                    View study map
                    <ArrowRight size={16} />
                  </Link>
                </div>

                <article className="mp-journey-card">
                  <div className="mp-journey-top">
                    <div className="mp-journey-icon">
                      <BookOpen size={22} />
                    </div>

                    <div className="mp-journey-copy">
                      <h3>{COURSE_NAME}</h3>

                      <p>
                        {courseComplete
                          ? "You have completed every topic. Amazing work!"
                          : nextLesson
                            ? `Continue your journey with ${nextLesson.title}.`
                            : "Your next learning adventure awaits."}
                      </p>
                    </div>

                    <div className="mp-journey-percentage">
                      <strong>{progress}%</strong>
                      <span>complete</span>
                    </div>
                  </div>

                  <div
                    className="mp-progress-track mp-journey-track"
                    role="progressbar"
                    aria-label="Journey progress"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="mp-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mp-journey-footer">
                    <span>
                      <CheckCircle2 size={15} />
                      {completedCount} topics completed
                    </span>

                    <span>
                      {Math.max(totalLessons - completedCount, 0)} remaining
                    </span>
                  </div>

                  <div className="mp-stage-summary">
                    <div className="mp-stage-summary-heading">
                      <span>Learning stages</span>
                      <strong>
                        {completedStages}/{totalStages}
                      </strong>
                    </div>

                    <div className="mp-stage-dots">
                      {STAGES.map((stage, index) => {
                        const completedForStage = lessons.filter(
                          (lesson) => {
                            const lessonNumber =
                              getFrontendLessonNumber(lesson);

                            return (
                              lessonNumber !== null &&
                              getCompletedStages(
                                stageProgress,
                                lessonNumber
                              ).some(
                                (completedStage) =>
                                  normalizeStage(completedStage) ===
                                  normalizeStage(stage)
                              )
                            );
                          }
                        ).length;

                        const stagePercentage = totalLessons
                          ? (completedForStage / totalLessons) * 100
                          : 0;

                        return (
                          <div
                            className="mp-stage-row"
                            key={stage}
                          >
                            <span>{getStageLabel(stage)}</span>

                            <div className="mp-stage-track">
                              <div
                                className={`mp-stage-fill mp-stage-fill-${index + 1}`}
                                style={{
                                  width: `${stagePercentage}%`,
                                }}
                              />
                            </div>

                            <strong>
                              {completedForStage}/{totalLessons}
                            </strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              </section>

              <section className="mp-section">
                <div className="mp-section-heading">
                  <div>
                    <span className="mp-section-eyebrow">
                      LITTLE WINS MATTER
                    </span>

                    <h2>Your achievements</h2>

                    <p>
                      Keep learning to unlock more milestones.
                    </p>
                  </div>

                  <span className="mp-achievement-count">
                    <Trophy size={16} />
                    {unlockedAchievements}/{achievements.length} unlocked
                  </span>
                </div>

                <div className="mp-achievement-grid">
                  {achievements.map((achievement) => {
                    const Icon = achievement.icon;

                    return (
                      <article
                        className={`mp-achievement-card ${
                          achievement.unlocked
                            ? "is-unlocked"
                            : "is-locked"
                        }`}
                        key={achievement.id}
                      >
                        <div className="mp-achievement-icon">
                          <Icon size={22} />
                        </div>

                        <div className="mp-achievement-copy">
                          <h3>{achievement.title}</h3>
                          <p>{achievement.description}</p>

                          <span>
                            {achievement.unlocked
                              ? "Unlocked"
                              : "Keep learning"}
                          </span>
                        </div>

                        {achievement.unlocked && (
                          <CheckCircle2
                            className="mp-achievement-check"
                            size={18}
                          />
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="mp-continue-card">
                <div className="mp-continue-icon">
                  {courseComplete ? (
                    <Trophy size={25} />
                  ) : (
                    <Target size={25} />
                  )}
                </div>

                <div className="mp-continue-copy">
                  <span className="mp-section-eyebrow">
                    {courseComplete
                      ? "ADVENTURE COMPLETED"
                      : "YOUR NEXT STEP"}
                  </span>

                  <h2>
                    {courseComplete
                      ? "You conquered every topic!"
                      : nextLesson
                        ? `Continue with ${nextLesson.title}`
                        : "Your adventure awaits"}
                  </h2>

                  <p>
                    {courseComplete
                      ? "Wonderful work! Revisit lessons to strengthen your skills."
                      : "One small step today can make a big difference tomorrow."}
                  </p>
                </div>

                <Link
                  to={
                    nextLesson
                      ? `${STUDY_MAP_LINK}/lesson/${getFrontendLessonNumber(nextLesson)}`
                      : STUDY_MAP_LINK
                  }
                  className="mp-continue-button"
                >
                  {courseComplete
                    ? "Review course"
                    : "Continue learning"}
                  <ArrowRight size={17} />
                </Link>
              </section>

              <footer className="mp-footer">
                <span>EVOLV · Learn. Practise. Grow.</span>

                <span>
                  <Clock3 size={13} />
                  Every step counts.
                </span>
              </footer>
            </>
          )}
        </div>
      </main>

      <Rightbar />
    </div>
  );
}
