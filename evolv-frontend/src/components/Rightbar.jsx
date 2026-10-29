import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Flame,
  Zap,
  Target,
  Trophy,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { pythonLessons } from "../data/pythonLessons";
import "../styles/rightbar.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");
const initialStreak = {
  currentStreak: 0,
  longestStreak: 0,
  activeToday: false,
  today: "",
  week: [],
};

const initialProgress = {
  xp: 0,
  completed: [],
};

/**
 * Read a non-negative number from browser storage safely.
 */
function readNumber(key, fallback = 0) {
  try {
    const rawValue = localStorage.getItem(key);

    if (rawValue === null || rawValue.trim() === "") {
      return fallback;
    }

    const value = Number(rawValue);

    return Number.isFinite(value) && value >= 0
      ? value
      : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Read the current EVOLV authentication token.
 * AuthPage saves the token as "evolv_token".
 */
function getAuthToken() {
  try {
    return (
      localStorage.getItem("evolv_token") ||
      sessionStorage.getItem("evolv_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      ""
    );
  } catch {
    return "";
  }
}

/**
 * Safely read JSON responses.
 */
async function readResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

/**
 * Read completed Python lessons from local storage.
 */
function readCompletedLessons() {
  try {
    const saved = localStorage.getItem("evolv_python_completed");

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Normalize streak data returned by the backend.
 */
function normalizeStreak(data) {
  return {
    currentStreak: Math.max(
      0,
      Number(data.currentStreak) || 0
    ),
    longestStreak: Math.max(
      0,
      Number(data.longestStreak) || 0
    ),
    activeToday: Boolean(data.activeToday),
    today: data.today || "",
    week: Array.isArray(data.week) ? data.week : [],
  };
}

export default function Rightbar() {
  const [progress, setProgress] = useState(initialProgress);
  const [streakData, setStreakData] = useState(initialStreak);
  const [streakLoading, setStreakLoading] = useState(true);
  const [streakError, setStreakError] = useState("");

  /**
   * Refresh XP and completed lessons.
   *
   * These keys must match the keys used by LessonPage.jsx.
   */
  const refreshProgress = useCallback(() => {
    setProgress({
      xp: readNumber("evolv_python_xp"),
      completed: readCompletedLessons(),
    });
  }, []);

  /**
   * Fetch the authenticated user's streak from the backend.
   */
  const refreshStreak = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setStreakData(initialStreak);
      setStreakError("Please log in to view your learning streak.");
      setStreakLoading(false);
      return;
    }

    setStreakLoading(true);
    setStreakError("");

    try {
      const response = await fetch(`${API_BASE_URL}/streak`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await readResponse(response);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your session may have expired. Please log in again."
          );
        }

        throw new Error(
          data.error ||
            data.message ||
            `Unable to load your learning streak (${response.status}).`
        );
      }

      setStreakData(normalizeStreak(data));
    } catch (error) {
      console.error("EVOLV streak fetch error:", error);

      setStreakError(
        error.message ||
          "Could not connect to the streak service."
      );
    } finally {
      setStreakLoading(false);
    }
  }, []);

  /**
   * Load data initially and refresh it when learning progress changes.
   */
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      if (!mounted) return;

      refreshProgress();
      await refreshStreak();
    };

    loadInitialData();

    const handleProgressUpdate = () => {
      refreshProgress();
      refreshStreak();
    };

    const handleFocus = () => {
      refreshProgress();
      refreshStreak();
    };

    const handleStorage = (event) => {
      // Refresh for relevant EVOLV storage changes, or when the
      // browser reports a general storage update.
      if (
        !event ||
        !event.key ||
        [
          "evolv_token",
          "token",
          "evolv_python_xp",
          "evolv_python_completed",
        ].includes(event.key)
      ) {
        refreshProgress();
        refreshStreak();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshProgress();
        refreshStreak();
      }
    };

    window.addEventListener(
      "evolv-progress-updated",
      handleProgressUpdate
    );
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        "evolv-progress-updated",
        handleProgressUpdate
      );
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [refreshProgress, refreshStreak]);

  /**
   * Python lesson progress calculations.
   */
  const totalLessons = pythonLessons.length;

  const completedCount = useMemo(() => {
    const uniqueCompleted = new Set(
      progress.completed.map(String)
    );

    return Math.min(uniqueCompleted.size, totalLessons);
  }, [progress.completed, totalLessons]);

  const completionPercent =
    totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

  const remainingLessons = Math.max(
    0,
    totalLessons - completedCount
  );

  /**
   * Streak display values.
   */
  const streak = streakData.currentStreak;

  const streakProgress = Math.min(
    100,
    (streak / 5) * 100
  );

  const streakStatus = streakLoading
    ? "Checking your progress..."
    : streakError
      ? "Streak unavailable"
      : streakData.activeToday
        ? "You've learned today!"
        : "Keep your momentum going";

  const streakMessage = streakLoading
    ? "Loading your learning streak..."
    : streakError
      ? streakError
      : streakData.activeToday
        ? "Great work! Your learning activity is recorded for today."
        : streak > 0
          ? "Complete a lesson today to maintain your streak."
          : "Complete your first lesson today to start your streak.";

  return (
    <aside
      className="ev-rightbar"
      aria-label="Learning overview"
    >
      {/* Sidebar heading */}
      <div className="ev-rightbar-heading">
        <div>
          <span className="ev-rightbar-eyebrow">
            YOUR OVERVIEW
          </span>

          <h2>Learning Hub</h2>
        </div>

        <span
          className="ev-rightbar-heading-icon"
          aria-hidden="true"
        >
          <Sparkles size={19} />
        </span>
      </div>

      {/* Learning streak */}
      <section
        className="ev-rightbar-streak"
        aria-labelledby="ev-streak-heading"
      >
        <div className="ev-rightbar-streak-top">
          <span
            className="ev-rightbar-streak-icon"
            aria-hidden="true"
          >
            <Flame size={23} fill="currentColor" />
          </span>

          <span className="ev-rightbar-streak-label">
            <strong id="ev-streak-heading">
              Learning streak
            </strong>

            <small>{streakStatus}</small>
          </span>

          <button
            type="button"
            className="ev-rightbar-refresh"
            onClick={refreshStreak}
            disabled={streakLoading}
            aria-label="Refresh learning streak"
            title="Refresh streak"
          >
            <RefreshCw
              size={15}
              className={streakLoading ? "ev-spin" : ""}
            />
          </button>
        </div>

        <div className="ev-rightbar-streak-value">
          <strong>
            {streakLoading ? "…" : streak}
          </strong>

          <span>{streak === 1 ? "day" : "days"}</span>
        </div>

        <div
          className="ev-rightbar-streak-track"
          role="progressbar"
          aria-label="Streak progress toward five days"
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={Math.min(streak, 5)}
        >
          <span
            style={{
              width: `${streakProgress}%`,
            }}
          />
        </div>

        <div className="ev-rightbar-streak-best">
          <Trophy size={14} aria-hidden="true" />

          <span>
            Best streak: {streakData.longestStreak}{" "}
            {streakData.longestStreak === 1
              ? "day"
              : "days"}
          </span>
        </div>

        <p
          className="ev-rightbar-streak-message"
          aria-live="polite"
        >
          {streakMessage}
        </p>

        {/* Weekly activity */}
        <div className="ev-rightbar-week">
          <div className="ev-rightbar-week-heading">
            <CalendarDays size={15} aria-hidden="true" />
            <strong>This week</strong>
          </div>

          {streakData.week.length > 0 ? (
            <div className="ev-rightbar-week-days">
              {streakData.week.map((day, index) => (
                <div
                  key={
                    day.date ||
                    `${day.day || "day"}-${index}`
                  }
                  className={[
                    "ev-rightbar-week-day",
                    day.completed ? "is-completed" : "",
                    day.isToday ? "is-today" : "",
                    day.isFuture ? "is-future" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  title={`${day.date || day.day || "Day"}: ${
                    day.completed
                      ? "Activity completed"
                      : "No activity recorded"
                  }`}
                >
                  <span>{day.day || "—"}</span>

                  <span className="ev-rightbar-week-dot">
                    {day.completed ? (
                      <CheckCircle2
                        size={16}
                        aria-label="Activity completed"
                      />
                    ) : (
                      <span className="ev-rightbar-week-empty" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="ev-rightbar-week-empty-message">
              {streakLoading
                ? "Loading weekly activity..."
                : streakError
                  ? "Weekly activity is unavailable."
                  : "Your weekly activity will appear here."}
            </p>
          )}
        </div>
      </section>

      {/* XP and lesson progress */}
      <section
        className="ev-rightbar-section"
        aria-labelledby="ev-progress-heading"
      >
        <div className="ev-rightbar-section-title">
          <Target size={17} aria-hidden="true" />
          <h3 id="ev-progress-heading">
            Your progress
          </h3>
        </div>

        {/* Total XP */}
        <div className="ev-rightbar-xp-card">
          <span
            className="ev-rightbar-metric-icon ev-xp-icon"
            aria-hidden="true"
          >
            <Zap size={20} fill="currentColor" />
          </span>

          <div className="ev-rightbar-metric-copy">
            <span>Total XP</span>

            <strong>
              {progress.xp.toLocaleString()}
            </strong>
          </div>

          <span className="ev-rightbar-metric-tag">
            XP
          </span>
        </div>

        {/* Python lesson completion */}
        <div className="ev-rightbar-progress-card">
          <div className="ev-rightbar-progress-top">
            <span>Python lessons</span>

            <strong>
              {completedCount}/{totalLessons}
            </strong>
          </div>

          <div
            className="ev-rightbar-progress-track"
            role="progressbar"
            aria-label="Python lesson completion"
            aria-valuemin={0}
            aria-valuemax={totalLessons}
            aria-valuenow={completedCount}
          >
            <span
              style={{
                width: `${completionPercent}%`,
              }}
            />
          </div>

          <div className="ev-rightbar-progress-bottom">
            <span>
              {completionPercent}% complete
            </span>

            <span>
              {remainingLessons} left
            </span>
          </div>
        </div>
      </section>

      {/* Motivation card */}
      <section className="ev-rightbar-goal">
        <div
          className="ev-rightbar-goal-icon"
          aria-hidden="true"
        >
          <Trophy size={21} />
        </div>

        <div className="ev-rightbar-goal-copy">
          <strong>One step at a time</strong>

          <p>
            Finish a lesson today to move closer to your goal.
          </p>
        </div>
      </section>

      {/* Continue learning */}
      <section
        className="ev-rightbar-next"
        aria-labelledby="ev-next-heading"
      >
        <div className="ev-rightbar-section-title">
          <BookOpen size={17} aria-hidden="true" />
          <h3 id="ev-next-heading">
            Ready to learn?
          </h3>
        </div>

        <p>
          Continue your Python journey and unlock the next lesson.
        </p>

        <Link
          to="/study/python"
          className="ev-rightbar-continue"
        >
          <span>Open Study Map</span>

          <ArrowRight
            size={16}
            aria-hidden="true"
          />
        </Link>
      </section>

      {/* Footer */}
      <div className="ev-rightbar-quote">
        <CheckCircle2 size={17} aria-hidden="true" />

        <p>
          Consistency beats perfection. Every lesson counts.
        </p>
      </div>
    </aside>
  );
}