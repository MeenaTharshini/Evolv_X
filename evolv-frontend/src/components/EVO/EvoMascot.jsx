import { useEffect, useState } from "react";
import {
  Sparkles,
  Star,
  Zap,
  Heart,
  Trophy,
  Flame,
} from "lucide-react";
import "./EvoCelebration.css";

const EXPRESSIONS = {
  idle: {
    eyes: "normal",
    mouth: "smile",
    animation: "evo-idle",
  },
  happy: {
    eyes: "happy",
    mouth: "big-smile",
    animation: "evo-happy",
  },
  celebrate: {
    eyes: "starry",
    mouth: "big-smile",
    animation: "evo-celebrate",
  },
  thinking: {
    eyes: "thinking",
    mouth: "small-smile",
    animation: "evo-thinking",
  },
  encouraging: {
    eyes: "normal",
    mouth: "smile",
    animation: "evo-encouraging",
  },
};

const VALID_MOODS = Object.keys(EXPRESSIONS);

/**
 * EVO — EVOLV's learning companion.
 *
 * Props:
 *   mood       - "idle" | "happy" | "celebrate" | "thinking" | "encouraging"
 *   size       - number, in pixels
 *   message    - optional message displayed below the mascot
 *   showName   - whether to display the EVO name
 *   showSparkles - whether to display decorative sparkles
 *   className  - optional extra CSS class
 */
export default function EvoMascot({
  mood = "idle",
  size = 180,
  message = "",
  showName = false,
  showSparkles = true,
  className = "",
}) {
  const [blink, setBlink] = useState(false);

  const safeMood = VALID_MOODS.includes(mood)
    ? mood
    : "idle";

  const expression = EXPRESSIONS[safeMood];

  // Give EVO a natural blinking animation.
  useEffect(() => {
    let blinkTimeout;
    let cancelled = false;

    const scheduleBlink = () => {
      const delay = 2200 + Math.random() * 2800;

      blinkTimeout = window.setTimeout(() => {
        if (cancelled) return;

        setBlink(true);

        window.setTimeout(() => {
          if (!cancelled) {
            setBlink(false);
            scheduleBlink();
          }
        }, 140);
      }, delay);
    };

    scheduleBlink();

    return () => {
      cancelled = true;
      window.clearTimeout(blinkTimeout);
    };
  }, []);

  return (
    <div
      className={[
        "evo-mascot",
        `evo-mascot--${safeMood}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        "--evo-size": `${size}px`,
      }}
      role="img"
      aria-label={`EVO, EVOLV's ${safeMood} learning companion`}
    >
      <div className="evo-mascot-stage">
        {/* Floating decorations */}
        {showSparkles && (
          <div className="evo-decoration evo-decoration--left">
            <Sparkles size={Math.max(15, size * 0.13)} />
          </div>
        )}

        {showSparkles && (
          <div className="evo-decoration evo-decoration--right">
            <Star size={Math.max(14, size * 0.12)} />
          </div>
        )}

        {safeMood === "celebrate" && (
          <>
            <span className="evo-confetti evo-confetti--one" />
            <span className="evo-confetti evo-confetti--two" />
            <span className="evo-confetti evo-confetti--three" />
            <span className="evo-confetti evo-confetti--four" />
          </>
        )}

        {/* Shadow */}
        <div className="evo-ground-shadow" />

        {/* Main character */}
        <div className={`evo-character ${expression.animation}`}>
          {/* Leaf-like antenna */}
          <div className="evo-antenna">
            <span className="evo-antenna-stem" />
            <span className="evo-antenna-leaf" />
            <span className="evo-antenna-glow" />
          </div>

          {/* Body */}
          <div className="evo-body">
            {/* Head highlight */}
            <div className="evo-head-highlight" />

            {/* Cheeks */}
            <span className="evo-cheek evo-cheek--left" />
            <span className="evo-cheek evo-cheek--right" />

            {/* Eyes */}
            <div className="evo-eyes">
              <span
                className={[
                  "evo-eye",
                  "evo-eye--left",
                  expression.eyes === "happy"
                    ? "evo-eye--happy"
                    : "",
                  expression.eyes === "starry"
                    ? "evo-eye--starry"
                    : "",
                  expression.eyes === "thinking"
                    ? "evo-eye--thinking"
                    : "",
                  blink ? "evo-eye--blink" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {expression.eyes === "starry" ? (
                  <Star className="evo-eye-star" fill="currentColor" />
                ) : (
                  <span className="evo-pupil">
                    <span className="evo-eye-shine" />
                  </span>
                )}
              </span>

              <span
                className={[
                  "evo-eye",
                  "evo-eye--right",
                  expression.eyes === "happy"
                    ? "evo-eye--happy"
                    : "",
                  expression.eyes === "starry"
                    ? "evo-eye--starry"
                    : "",
                  expression.eyes === "thinking"
                    ? "evo-eye--thinking"
                    : "",
                  blink ? "evo-eye--blink" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {expression.eyes === "starry" ? (
                  <Star className="evo-eye-star" fill="currentColor" />
                ) : (
                  <span className="evo-pupil">
                    <span className="evo-eye-shine" />
                  </span>
                )}
              </span>
            </div>

            {/* Mouth */}
            <div
              className={[
                "evo-mouth",
                expression.mouth === "big-smile"
                  ? "evo-mouth--big"
                  : "",
                expression.mouth === "small-smile"
                  ? "evo-mouth--small"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {expression.mouth === "big-smile" && (
                <span className="evo-mouth-highlight" />
              )}
            </div>

            {/* Body badge */}
            <div className="evo-chest-badge">
              <Sparkles size={Math.max(12, size * 0.09)} />
            </div>

            {/* Arms */}
            <div className="evo-arm evo-arm--left">
              <span className="evo-hand" />
            </div>

            <div className="evo-arm evo-arm--right">
              <span className="evo-hand" />
            </div>
          </div>

          {/* Feet */}
          <div className="evo-feet">
            <span className="evo-foot evo-foot--left" />
            <span className="evo-foot evo-foot--right" />
          </div>
        </div>

        {/* Achievement symbol */}
        {safeMood === "celebrate" && (
          <div className="evo-achievement">
            <Trophy size={Math.max(18, size * 0.15)} />
          </div>
        )}

        {safeMood === "encouraging" && (
          <div className="evo-encouragement-heart">
            <Heart
              size={Math.max(17, size * 0.14)}
              fill="currentColor"
            />
          </div>
        )}

        {safeMood === "happy" && (
          <div className="evo-happy-zap">
            <Zap
              size={Math.max(16, size * 0.13)}
              fill="currentColor"
            />
          </div>
        )}
      </div>

      {/* Character name */}
      {showName && (
        <div className="evo-mascot-name">
          <span className="evo-name-dot" />
          <strong>EVO</strong>
          <span className="evo-name-caption">
            YOUR LEARNING COMPANION
          </span>
        </div>
      )}

      {/* Optional message */}
      {message && (
        <p className="evo-mascot-message">
          {message}
        </p>
      )}
    </div>
  );
}