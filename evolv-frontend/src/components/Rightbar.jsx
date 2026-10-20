
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
} from "lucide-react";
import { Link } from "react-router-dom";
import { pythonLessons } from "../data/pythonLessons";
import "../styles/rightbar.css";

const readNumber = (key, fallback = 0) => {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) && value >= 0 ? value : fallback;
};

export default function Rightbar() {
  const [progress, setProgress] = useState({
    xp: 0,
    streak: 0,
    completed: [],
  });

  const refreshProgress = useCallback(() => {
    try {
      const savedCompleted = JSON.parse(
        localStorage.getItem("evolv_python_completed") || "[]"
      );

      setProgress({
        xp: readNumber("evolv_python_xp"),
        streak: readNumber("evolv_python_streak"),
        completed: Array.isArray(savedCompleted) ? savedCompleted : [],
      });
    } catch {
      setProgress({
        xp: readNumber("evolv_python_xp"),
        streak: readNumber("evolv_python_streak"),
        completed: [],
      });
    }
  }, []);

  useEffect(() => {
    refreshProgress();

    window.addEventListener("focus", refreshProgress);
    window.addEventListener("storage", refreshProgress);
    window.addEventListener("evolv-progress-updated", refreshProgress);

    return () => {
      window.removeEventListener("focus", refreshProgress);
      window.removeEventListener("storage", refreshProgress);
      window.removeEventListener(
        "evolv-progress-updated",
        refreshProgress
      );
    };
  }, [refreshProgress]);

  const totalLessons = pythonLessons.length;
  const completedCount = progress.completed.length;
  const completionPercent =
    totalLessons > 0
      ? Math.min(100, Math.round((completedCount / totalLessons) * 100))
      : 0;

  const remainingLessons = Math.max(
    0,
    totalLessons - completedCount
  );

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

      <section className="ev-rightbar-streak">
        <div className="ev-rightbar-streak-top">
          <span className="ev-rightbar-streak-icon">
            <Flame size={23} fill="currentColor" />
          </span>

          <span className="ev-rightbar-streak-label">
            <strong>Learning streak</strong>
            <small>Keep your momentum going</small>
          </span>
        </div>

        <div className="ev-rightbar-streak-value">
          <strong>{progress.streak}</strong>
          <span>{progress.streak === 1 ? "day" : "days"}</span>
        </div>

        <div className="ev-rightbar-streak-track">
          <span
            style={{
              width: `${Math.min(100, progress.streak * 20)}%`,
            }}
          />
        </div>

        <p>
          {progress.streak > 0
            ? "Great work! Keep showing up to build your habit."
            : "Start learning today and build your streak."}
        </p>
      </section>

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
          <p>Finish a lesson today to move closer to your goal.</p>
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

        <Link to="/study/python" className="ev-rightbar-continue">
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
