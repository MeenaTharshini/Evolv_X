
import { BookOpen, Sparkles } from "lucide-react";
import "../styles/home.css";

export default function EvolvLoader() {
  return (
    <div
      className="home-loading-screen"
      role="status"
      aria-live="polite"
      aria-label="Loading your learning space"
    >
      <div className="home-loading-scene">
        <span className="home-loading-star loading-star-one">✦</span>
        <span className="home-loading-star loading-star-two">✧</span>
        <span className="home-loading-star loading-star-three">✦</span>

        <div className="evo-loader">
          <div className="evo-loader-leaf evo-leaf-left" />
          <div className="evo-loader-leaf evo-leaf-right" />

          <div className="evo-loader-body">
            <div className="evo-loader-eye evo-eye-left">
              <span />
            </div>

            <div className="evo-loader-eye evo-eye-right">
              <span />
            </div>

            <div className="evo-loader-cheek evo-cheek-left" />
            <div className="evo-loader-cheek evo-cheek-right" />
            <div className="evo-loader-mouth" />
          </div>

          <div className="evo-loader-shadow" />
        </div>

        <span className="home-loading-symbol loading-symbol-book">
          📚
        </span>

        <span className="home-loading-symbol loading-symbol-bulb">
          💡
        </span>

        <span className="home-loading-symbol loading-symbol-code">
          {"</>"}
        </span>
      </div>

      <div className="home-loading-copy">
        <span className="home-loading-brand">
          EVOLV<span>.</span>
        </span>

        <h2>Getting your world ready</h2>

        <p>Your next little adventure is almost here...</p>

        <div className="home-loading-progress" aria-hidden="true">
          <span />
        </div>

        <span className="home-loading-caption">
          Learn <span>·</span> Build <span>·</span> Grow
        </span>
      </div>
    </div>
  );
}
