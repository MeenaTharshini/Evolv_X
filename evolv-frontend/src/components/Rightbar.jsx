
import { useCallback, useEffect, useState } from "react";
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

const API_BASE_URL = "http://localhost:5000/api";

const initialStreak = {
  currentStreak: 0,
  longestStreak: 0,
  activeToday: false,
  today: "",
  week: [],
};

const readNumber = (key, fallback = 0) => {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) && value >= 0 ? value : fallback;
};

function getAuthToken() {
  // Change "token" if your login uses another localStorage key.
  return localStorage.getItem("token");
}

export default function Rightbar() {
  const [progress, setProgress] = useState({
    xp: 0,
    completed: [],
  });

  const [streakData, setStreakData] = useState(initialStreak);
  const [streakLoading, setStreakLoading] = useState(true);
  const [streakError, setStreakError] = useState("");

  const refreshProgress = useCallback(() => {
    try {
      const savedCompleted = JSON.parse(
        localStorage.getItem("evolv_python_completed") || "[]"
      );

      setProgress({
        xp: readNumber("evolv_python_xp"),
        completed: Array.isArray(savedCompleted)
          ? savedCompleted
          : [],
      });
    } catch {
      setProgress({
        xp: readNumber("evolv_python_xp"),
        completed: [],
      });
    }
  }, []);

  const refreshStreak = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
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
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load your learning streak."
        );
      }

      setStreakData({
        currentStreak: Number(data.currentStreak) || 0,
        longestStreak: Number(data.longestStreak) || 0,
        activeToday: Boolean(data.activeToday),
        today: data.today || "",
        week: Array.isArray(data.week) ? data.week : [],
      });
    } catch (error) {
      console.error("Streak fetch error:", error);
      setStreakError(
        error.message || "Could not connect to the streak service."
      );
    } finally {
      setStreakLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProgress();
    refreshStreak();

    const handleProgressUpdate = () => {
      refreshProgress();
      refreshStreak();
    };

    const handleFocus = () => {
      refreshProgress();
      refreshStreak();
    };

    const handleStorage = () => {
      refreshProgress();
      refreshStreak();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshProgress();
        refreshStreak();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      "evolv-progress-updated",
      handleProgressUpdate
    );
    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "evolv-progress-updated",
        handleProgressUpdate
      );
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [refreshProgress, refreshStreak]);

  const totalLessons = pythonLessons.length;
  const completedCount = progress.completed.length;

  const completionPercent =
    totalLessons > 0
      ? Math.min(
          100,
          Math.round((completedCount / totalLessons) * 100)
        )
      : 0;

  const remainingLessons = Math.max(
    0,
    totalLessons - completedCount
  );

  const streak = streakData.currentStreak;

  return (
    <aside className="ev-rightbar" aria-label="Learning overview">
      <div className="ev-rightbar-heading">
        <div>
          <span className="ev-rightbar-eyebrow">YOUR OVERVIEW</span>
          <h2>Learning Hub</h2>
        </div>

        <span className="ev-rightbar-heading-icon">
          <Sparkles size={19} />
        </span>
      </div>

      {/* Backend-powered learning streak */}
      <section className="ev-rightbar-streak">
        <div className="ev-rightbar-streak-top">
          <span className="ev-rightbar-streak-icon">
            <Flame size={23} fill="currentColor" />
          </span>

          <span className="ev-rightbar-streak-label">
            <strong>Learning streak</strong>
            <small>
              {streakLoading
                ? "Checking your progress..."
                : streakData.activeToday
                  ? "You've learned today!"
                  : "Keep your momentum going"}
            </small>
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
          <strong>{streakLoading ? "…" : streak}</strong>
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
              width: `${Math.min(100, streak * 20)}%`,
            }}
          />
        </div>

        <div className="ev-rightbar-streak-best">
          <Trophy size={14} />
          <span>
            Best streak: {streakData.longestStreak}{" "}
            {streakData.longestStreak === 1 ? "day" : "days"}
          </span>
        </div>

        <p aria-live="polite">
          {streakLoading
            ? "Loading your learning streak..."
            : streakError
              ? streakError
              : streakData.activeToday
                ? "Great work! Your learning activity is recorded for today."
                : streak > 0
                  ? "Your streak is active. Complete a lesson today to keep it going."
                  : "Complete your first lesson today to start your streak."}
        </p>

        {/* Weekly activity */}
        <div className="ev-rightbar-week">
          <div className="ev-rightbar-week-heading">
            <CalendarDays size={15} />
            <strong>This week</strong>
          </div>

          {streakData.week.length > 0 ? (
            <div className="ev-rightbar-week-days">
              {streakData.week.map((day) => (
                <div
                  key={day.date}
                  className={[
                    "ev-rightbar-week-day",
                    day.completed ? "is-completed" : "",
                    day.isToday ? "is-today" : "",
                    day.isFuture ? "is-future" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  title={`${day.date}: ${
                    day.completed
                      ? "Activity completed"
                      : "No activity recorded"
                  }`}
                >
                  <span>{day.day}</span>

                  <span className="ev-rightbar-week-dot">
                    {day.completed ? (
                      <CheckCircle2 size={16} />
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

      {/* Existing XP and lesson progress */}
      <section className="ev-rightbar-section">
        <div className="ev-rightbar-section-title">
          <Target size={17} />
          <h3>Your progress</h3>
        </div>

        <div className="ev-rightbar-xp-card">
          <span className="ev-rightbar-metric-icon ev-xp-icon">
            <Zap size={20} fill="currentColor" />
          </span>

          <div className="ev-rightbar-metric-copy">
            <span>Total XP</span>
            <strong>{progress.xp.toLocaleString()}</strong>
          </div>

          <span className="ev-rightbar-metric-tag">XP</span>
        </div>

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
            aria-valuenow={Math.min(completedCount, totalLessons)}
          >
            <span style={{ width: `${completionPercent}%` }} />
          </div>

          <div className="ev-rightbar-progress-bottom">
            <span>{completionPercent}% complete</span>
            <span>{remainingLessons} left</span>
          </div>
        </div>
      </section>

      <section className="ev-rightbar-goal">
        <div className="ev-rightbar-goal-icon">
          <Trophy size={21} />
        </div>

        <div className="ev-rightbar-goal-copy">
          <strong>One step at a time</strong>
          <p>
            Finish a lesson today to move closer to your goal.
          </p>
        </div>
      </section>

      <section className="ev-rightbar-next">
        <div className="ev-rightbar-section-title">
          <BookOpen size={17} />
          <h3>Ready to learn?</h3>
        </div>

        <p>
          Continue your Python journey and unlock the next lesson.
        </p>

        <Link
          to="/study/python"
          className="ev-rightbar-continue"
        >
          Open Study Map
          <ArrowRight size={16} />
        </Link>
      </section>

      <div className="ev-rightbar-quote">
        <CheckCircle2 size={17} />
        <p>
          Consistency beats perfection. Every lesson counts.
        </p>
      </div>
    </aside>
  );
}