import { useEffect, useRef } from "react";
import {
  X,
  Zap,
  Flame,
  Trophy,
  Star,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import EvoMascot from "./EvoMascot";
import "./EvoCelebration.css";

/**
 * TopicCompletionModal
 *
 * Props:
 *   isOpen       - Whether the modal is visible.
 *   topicTitle   - Name of the completed topic.
 *   earnedXP     - XP earned from this topic.
 *   totalXP      - Student's updated total XP.
 *   currentStreak - Actual current streak from the backend.
 *   activeToday  - Whether today's activity has been recorded.
 *   streakLoading - Whether the streak request is in progress.
 *   streakError  - Optional streak request error.
 *   onContinue   - Called when the student continues learning.
 *   onClose      - Optional close handler.
 */

export default function TopicCompletionModal({
  isOpen = false,
  topicTitle = "Completed topic",
  earnedXP = 0,
  totalXP = 0,
  currentStreak = 0,
  activeToday = false,
  streakLoading = false,
  streakError = "",
  onContinue,
  onClose,
}) {
  const continueButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  const safeEarnedXP = Math.max(0, Number(earnedXP) || 0);
  const safeTotalXP = Math.max(0, Number(totalXP) || 0);
  const safeStreak = Math.max(0, Number(currentStreak) || 0);

  /**
   * Lock background scrolling and manage keyboard focus.
   */
  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current = document.activeElement;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      continueButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (onClose) {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleContinue = () => {
    if (typeof onContinue === "function") {
      onContinue();
    } else if (typeof onClose === "function") {
      onClose();
    }
  };

  const streakHeading = streakLoading
    ? "Checking your learning streak..."
    : streakError
      ? "Your topic is complete!"
      : activeToday
        ? safeStreak > 0
          ? `${safeStreak}-day learning streak!`
          : "Today's learning activity recorded!"
        : "Keep your learning streak going!";

  const streakMessage = streakLoading
    ? "We're checking your latest learning activity."
    : streakError
      ? "Your topic is complete, but we couldn't confirm your streak. Please try refreshing."
      : activeToday
        ? safeStreak > 0
          ? "Amazing! You've learned today. Come back tomorrow to keep your streak alive."
          : "Great job! You've recorded your learning activity for today. Come back tomorrow to build your streak."
        : safeStreak > 0
          ? "Complete a qualifying learning activity today to maintain your streak."
          : "Keep learning every day to start building your streak.";

  return (
    <div
      className="evo-completion-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          onClose
        ) {
          onClose();
        }
      }}
    >
      <section
        className="evo-completion-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evo-completion-title"
        aria-describedby="evo-completion-description"
      >
        {/* Close button */}
        {onClose && (
          <button
            type="button"
            className="evo-completion-close"
            onClick={onClose}
            aria-label="Close topic completion dialog"
          >
            <X size={20} />
          </button>
        )}

        {/* Celebration heading */}
        <div className="evo-completion-heading">
          <span className="evo-completion-eyebrow">
            <Sparkles size={15} />
            EVOLV ADVENTURE COMPLETE
          </span>

          <h2 id="evo-completion-title">
            You did it!
          </h2>

          <p id="evo-completion-description">
            Another step forward in your learning journey.
          </p>
        </div>

        {/* EVO celebration */}
        <div className="evo-completion-mascot">
          <span className="evo-completion-orbit evo-orbit-one" />
          <span className="evo-completion-orbit evo-orbit-two" />

          <EvoMascot
            mood="celebrate"
            size={170}
            showName
            showSparkles
            message="I'm so proud of you! Keep growing!"
          />
        </div>

        {/* Completed topic */}
        <div className="evo-completion-topic">
          <span className="evo-completion-topic-icon">
            <CheckCircle2 size={19} />
          </span>

          <div>
            <span className="evo-completion-topic-label">
              TOPIC COMPLETED
            </span>

            <h3>{topicTitle}</h3>
          </div>
        </div>

        {/* XP reward card */}
        <div className="evo-completion-xp-card">
          <div className="evo-completion-xp-icon">
            <Zap size={25} fill="currentColor" />
          </div>

          <div className="evo-completion-xp-copy">
            <span>XP earned from this topic</span>

            <strong>
              +{safeEarnedXP.toLocaleString()} XP
            </strong>
          </div>

          <div className="evo-completion-star">
            <Star size={23} fill="currentColor" />
          </div>
        </div>

        {/* Total XP */}
        <div className="evo-completion-total">
          <span>
            <Trophy size={17} />
            Your total XP
          </span>

          <strong>
            {safeTotalXP.toLocaleString()} XP
          </strong>
        </div>

        {/* Learning streak */}
        <div
          className={[
            "evo-completion-streak",
            activeToday && !streakError
              ? "evo-completion-streak--active"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-live="polite"
        >
          <div className="evo-completion-streak-icon">
            <Flame size={23} fill="currentColor" />
          </div>

          <div className="evo-completion-streak-copy">
            <strong>{streakHeading}</strong>

            <p>{streakMessage}</p>
          </div>

          {!streakLoading &&
            !streakError &&
            activeToday && (
              <CheckCircle2
                className="evo-completion-streak-check"
                size={21}
              />
            )}
        </div>

        {/* Continue */}
        <button
          ref={continueButtonRef}
          type="button"
          className="evo-completion-continue"
          onClick={handleContinue}
        >
          <span>Continue Learning</span>
          <ArrowRight size={19} />
        </button>

        <p className="evo-completion-footer">
          Every small step helps you grow. 🌱
        </p>
      </section>
    </div>
  );
}