
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  Flame,
  Map,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Rightbar from "../components/Rightbar";
import { pythonLessons } from "../data/pythonLessons";
import { getStreak } from "../services/api";
import {
  STAGES,
  getStageProgress,
  getCompletedStages,
  isTopicComplete,
} from "../utils/lessonProgress";

import "../styles/my-progress.css";

const COURSE_ID = "python";
const COURSE_NAME = "Python Foundations";
const STUDY_MAP_LINK = `/study/${COURSE_ID}`;

const xpKey = (courseId) => `evolv_${courseId}_xp`;
const quizScoreKey = (courseId) =>
  `evolv_${courseId}_quiz_scores`;

function readJSON(key, fallback = {}) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) return fallback;

    const parsed = JSON.parse(value);

    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function readNumber(key, fallback = 0) {
  try {
    const value = localStorage.getItem(key);

    if (value === null || value.trim() === "") {
      return fallback;
    }

    const number = Number(value);

    return Number.isFinite(number) && number >= 0
      ? number
      : fallback;
  } catch {
    return fallback;
  }
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

  if (
    !result ||
    typeof result !== "object" ||
    Array.isArray(result)
  ) {
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
    score,
  };
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function getLessonXP(lesson) {
  const xp = Number(lesson.xp ?? 20);

  return Number.isFinite(xp) && xp >= 0 ? xp : 20;
}

function getStageCount(progress, lessons) {
  return lessons.reduce(
    (total, lesson) =>
      total + getCompletedStages(progress, lesson.id).length,
    0
  );
}

function getAverageQuizScore(scores, lessons) {
  const results = lessons
    .map((lesson) => getQuizResult(scores, lesson.id))
    .filter(
      (result) =>
        result.attempts > 0 &&
        result.score !== null &&
        Number.isFinite(result.score)
    );

  if (!results.length) return null;

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

function getStageLabel(stage) {
  if (typeof stage !== "string") {
    return String(stage);
  }

  return stage
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function MyProgress() {
  const lessons = pythonLessons;

  const [stageProgress, setStageProgress] = useState(() =>
    getStageProgress(COURSE_ID)
  );

  const [xp, setXp] = useState(() =>
    readNumber(xpKey(COURSE_ID))
  );

  const [quizScores, setQuizScores] = useState(() =>
    readJSON(quizScoreKey(COURSE_ID), {})
  );

  const [streak, setStreak] = useState(() =>
    readNumber(`evolv_${COURSE_ID}_streak`)
  );

  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(0);

  const refreshProgress = useCallback(() => {
    setStageProgress(getStageProgress(COURSE_ID));
    setXp(readNumber(xpKey(COURSE_ID)));
    setQuizScores(readJSON(quizScoreKey(COURSE_ID), {}));
    setLastUpdated(Date.now());
  }, []);

  const refreshStreak = useCallback(async () => {
    try {
      const data = await getStreak();

      const currentStreak = Math.max(
        0,
        Number(data?.currentStreak) || 0
      );

      setStreak(currentStreak);

      try {
        localStorage.setItem(
          `evolv_${COURSE_ID}_streak`,
          String(currentStreak)
        );
      } catch {
        // Keep the API result available in component state.
      }
    } catch {
      // Use the cached streak if the API is unavailable.
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);

    try {
      refreshProgress();
      await refreshStreak();
    } finally {
      setLoading(false);
    }
  }, [refreshProgress, refreshStreak]);

  useEffect(() => {
    refreshProgress();
    refreshStreak();

    const handleStorage = () => refreshProgress();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleStorage);
    window.addEventListener(
      "evolv-progress-updated",
      handleStorage
    );

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleStorage);
      window.removeEventListener(
        "evolv-progress-updated",
        handleStorage
      );
    };
  }, [refreshProgress, refreshStreak]);

  const completedLessons = useMemo(
    () =>
      lessons.filter((lesson) =>
        isTopicComplete(stageProgress, lesson.id)
      ),
    [lessons, stageProgress, lastUpdated]
  );

  const completedCount = completedLessons.length;
  const totalLessons = lessons.length;

  const progress = totalLessons
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  const totalStages = totalLessons * STAGES.length;
  const completedStages = getStageCount(stageProgress, lessons);

  const displayedXP = Math.max(
    xp,
    completedLessons.reduce(
      (total, lesson) => total + getLessonXP(lesson),
      0
    )
  );

  const quizAttempts = lessons.reduce(
    (total, lesson) =>
      total + getQuizResult(quizScores, lesson.id).attempts,
    0
  );

  const averageQuizScore = getAverageQuizScore(
    quizScores,
    lessons
  );

  const nextLesson =
    lessons.find(
      (lesson) => !isTopicComplete(stageProgress, lesson.id)
    ) ?? null;

  const achievements = getAchievements({
    completedCount,
    totalLessons,
    xp: displayedXP,
    quizAttempts,
    streak,
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
            onClick={handleRefresh}
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
          {/* Page heading */}

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

          {/* Active course */}

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

                <p>Code Forest · Learn, practise, and grow.</p>
              </div>

              <Link
                to={STUDY_MAP_LINK}
                className="mp-study-map-button"
              >
                <Map size={17} />
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

          {/* Learning statistics */}

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
              <div className="mp-stat-icon mp-stat-quiz">
                <Target size={22} />
              </div>

              <div className="mp-stat-copy">
                <span>Quiz average</span>
                <strong>
                  {averageQuizScore === null
                    ? "—"
                    : `${averageQuizScore}%`}
                </strong>
                <small>
                  {quizAttempts}{" "}
                  {quizAttempts === 1 ? "quiz attempt" : "quiz attempts"}
                </small>
              </div>
            </article>

            <article className="mp-stat-card">
              <div className="mp-stat-icon mp-stat-streak">
                <Flame size={22} />
              </div>

              <div className="mp-stat-copy">
                <span>Learning streak</span>
                <strong>
                  {streak} {streak === 1 ? "day" : "days"}
                </strong>
                <small>Consecutive active days</small>
              </div>
            </article>
          </section>

          {/* Learning journey */}

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
                      (lesson) =>
                        getCompletedStages(
                          stageProgress,
                          lesson.id
                        ).includes(stage)
                    ).length;

                    const stagePercentage = totalLessons
                      ? (completedForStage / totalLessons) * 100
                      : 0;

                    return (
                      <div className="mp-stage-row" key={stage}>
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

          {/* Achievements */}

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

          {/* Continue learning */}

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
                  ? `${STUDY_MAP_LINK}/lesson/${nextLesson.id}`
                  : STUDY_MAP_LINK
              }
              className="mp-continue-button"
            >
              {courseComplete ? "Review course" : "Continue learning"}
              <ArrowRight size={17} />
            </Link>
          </section>

          {/* Footer */}

          <footer className="mp-footer">
            <span>EVOLV · Learn. Practise. Grow.</span>

            <span>
              <Clock3 size={13} />
              Every step counts.
            </span>
          </footer>
        </div>
      </main>

      <Rightbar />
    </div>
  );
}