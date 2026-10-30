
import { useEffect, useState } from "react";
import { Heart, Sparkles, Star, Trophy, Zap } from "lucide-react";
import "../EVO/EvoCelebration.css";
import "../../styles/home.css";

const EXPRESSIONS = {
  idle: "evo-mascot--idle",
  happy: "evo-mascot--happy",
  celebrate: "evo-mascot--celebrate",
  thinking: "evo-mascot--thinking",
  encouraging: "evo-mascot--encouraging",
};

const VALID_MOODS = Object.keys(EXPRESSIONS);

export default function EvoMascot({
  mood = "idle",
  size = 180,
  message = "",
  showName = false,
  showSparkles = true,
  className = "",
}) {
  const [blink, setBlink] = useState(false);

  const safeMood = VALID_MOODS.includes(mood) ? mood : "idle";

  useEffect(() => {
    let blinkTimer;
    let closeTimer;
    let cancelled = false;

    function scheduleBlink() {
      blinkTimer = window.setTimeout(() => {
        if (cancelled) return;

        setBlink(true);

        closeTimer = window.setTimeout(() => {
          if (cancelled) return;

          setBlink(false);
          scheduleBlink();
        }, 140);
      }, 2500 + Math.random() * 2500);
    }

    scheduleBlink();

    return () => {
      cancelled = true;
      window.clearTimeout(blinkTimer);
      window.clearTimeout(closeTimer);
    };
  }, []);

  return (
    <div
      className={[
        "evo-mascot",
        EXPRESSIONS[safeMood],
        className,
      ].filter(Boolean).join(" ")}
      style={{ "--evo-size": `${size}px` }}
      role="img"
      aria-label={`EVO, EVOLV's ${safeMood} learning companion`}
    >
      <div className="evo-mascot-stage">
        {showSparkles && (
          <>
            <span className="evo-decoration evo-decoration--left">
              <Sparkles size={Math.max(15, size * 0.13)} />
            </span>
            <span className="evo-decoration evo-decoration--right">
              <Star size={Math.max(14, size * 0.12)} />
            </span>
          </>
        )}

        {safeMood === "celebrate" && (
          <>
            <span className="evo-confetti evo-confetti--one" />
            <span className="evo-confetti evo-confetti--two" />
            <span className="evo-confetti evo-confetti--three" />
            <span className="evo-confetti evo-confetti--four" />
          </>
        )}

        <div className="evo-loader evo-mascot-character">
          <div className="evo-loader-leaf evo-leaf-left" />
          <div className="evo-loader-leaf evo-leaf-right" />

          <div className="evo-loader-body">
            <div
              className={[
                "evo-loader-eye",
                "evo-eye-left",
                blink ? "evo-mascot-eye-blink" : "",
              ].filter(Boolean).join(" ")}
            >
              {safeMood === "celebrate" ? (
                <Star className="evo-mascot-star-eye" fill="currentColor" />
              ) : (
                <span />
              )}
            </div>

            <div
              className={[
                "evo-loader-eye",
                "evo-eye-right",
                blink ? "evo-mascot-eye-blink" : "",
              ].filter(Boolean).join(" ")}
            >
              {safeMood === "celebrate" ? (
                <Star className="evo-mascot-star-eye" fill="currentColor" />
              ) : (
                <span />
              )}
            </div>

            <div className="evo-loader-cheek evo-cheek-left" />
            <div className="evo-loader-cheek evo-cheek-right" />

            <div
              className={[
                "evo-loader-mouth",
                safeMood === "celebrate" || safeMood === "happy"
                  ? "evo-mascot-big-smile"
                  : "",
                safeMood === "thinking"
                  ? "evo-mascot-thinking-mouth"
                  : "",
              ].filter(Boolean).join(" ")}
            />
          </div>

          <div className="evo-loader-shadow" />
        </div>

        {safeMood === "celebrate" && (
          <div className="evo-achievement">
            <Trophy size={Math.max(18, size * 0.15)} />
          </div>
        )}

        {safeMood === "encouraging" && (
          <div className="evo-encouragement-heart">
            <Heart size={Math.max(17, size * 0.14)} fill="currentColor" />
          </div>
        )}

        {safeMood === "happy" && (
          <div className="evo-happy-zap">
            <Zap size={Math.max(16, size * 0.13)} fill="currentColor" />
          </div>
        )}
      </div>

      {showName && (
        <div className="evo-mascot-name">
          <span className="evo-name-dot" />
          <strong>EVO</strong>
          <span className="evo-name-caption">
            YOUR LEARNING COMPANION
          </span>
        </div>
      )}

      {message && (
        <p className="evo-mascot-message">{message}</p>
      )}
    </div>
  );
}