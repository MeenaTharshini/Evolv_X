
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  LockKeyhole,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { coursePaths } from "../data/coursePaths";
import "../styles/study-map.css";

const courseOptions = Object.values(coursePaths);

const areaInfo = {
  "Coding Forest": {
    icon: "🌲",
    description: "Discover the building blocks.",
  },
  "Logic Cave": {
    icon: "🪨",
    description: "Learn to think like a programmer.",
  },
  "Loop Bridge": {
    icon: "🌉",
    description: "Practise patterns and repetition.",
  },
  "Innovation Island": {
    icon: "🏝️",
    description: "Combine concepts to create more.",
  },
  "Challenge Peak": {
    icon: "🏔️",
    description: "Reach the summit with a final challenge.",
  },
};

function ExplorerCompanion() {
  return (
    <div className="map-companion" role="img" aria-label="Your EVOLV explorer">
      <span className="map-companion-backpack" />
      <span className="map-companion-eye eye-left" />
      <span className="map-companion-eye eye-right" />
      <span className="map-companion-cheek cheek-left" />
      <span className="map-companion-cheek cheek-right" />
      <span className="map-companion-mouth" />
      <span className="map-companion-leaf">✦</span>
    </div>
  );
}

export default function StudyMap() {
  const { courseId = "python" } = useParams();
  const navigate = useNavigate();
  const course = coursePaths[courseId] || coursePaths.python;

  const storageKey = `evolv_${course.id}_completed`;
  const [completedIds, setCompletedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  });

  const completedCount = completedIds.length;
  const progress = Math.round(
    (completedCount / course.lessons.length) * 100
  );

  const groupedLessons = Object.entries(
    course.lessons.reduce((groups, lesson) => {
      if (!groups[lesson.area]) groups[lesson.area] = [];
      groups[lesson.area].push(lesson);
      return groups;
    }, {})
  );

  function markDemoComplete(lessonId) {
    const updated = completedIds.includes(lessonId)
      ? completedIds
      : [...completedIds, lessonId];

    setCompletedIds(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }

  function isUnlocked(index) {
    return index === 0 || completedIds.includes(course.lessons[index - 1]?.id);
  }

  return (
    <div className={`study-map-page theme-${course.color}`}>
      <Navbar />

      <main className="study-map-container">
        <Link to="/dashboard" className="map-back-link">
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <section className="map-hero">
          <div className="map-hero-copy">
            <span className="map-eyebrow">
              <Sparkles size={14} /> YOUR NEXT ADVENTURE
            </span>

            <h1>
              Welcome to the
              <br />
              <span>{course.language} world!</span>
            </h1>

            <p>{course.subtitle}</p>

            <div className="map-hero-tags">
              <span><BookOpen size={15} /> {course.lessons.length} checkpoints</span>
              <span><Clock3 size={15} /> Learn at your pace</span>
              <span><Zap size={15} /> Earn XP</span>
            </div>
          </div>

          <div className="map-hero-art" aria-hidden="true">
            <span className="map-orbit orbit-one" />
            <span className="map-orbit orbit-two" />
            <span className="map-hero-star star-one">✦</span>
            <span className="map-hero-star star-two">✧</span>
            <div className="map-hero-book">{course.icon}</div>
            <ExplorerCompanion />
            <span className="map-hero-ground" />
          </div>
        </section>

        <section className="map-overview">
          <div className="map-overview-title">
            <span className="map-overview-icon"><Trophy size={20} /></span>
            <div>
              <h2>Your adventure progress</h2>
              <p>Every checkpoint brings you one step closer.</p>
            </div>
          </div>

          <div className="map-progress-summary">
            <strong>{progress}%</strong>
            <span>{completedCount} of {course.lessons.length} completed</span>
          </div>

          <div
            className="map-progress-track"
            role="progressbar"
            aria-label={`${course.language} course progress`}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div style={{ width: `${progress}%` }} />
          </div>
        </section>

        <section className="map-course-switcher">
          <div>
            <span className="map-eyebrow">CHOOSE YOUR WORLD</span>
            <h2>Where shall we explore?</h2>
          </div>

          <div className="map-course-options">
            {courseOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`map-course-option ${
                  option.id === course.id ? "selected" : ""
                }`}
                onClick={() => navigate(`/study/${option.id}`)}
                aria-pressed={option.id === course.id}
              >
                <span>{option.icon}</span>
                {option.language}
                {option.id === course.id && <Check size={14} />}
              </button>
            ))}
          </div>
        </section>

        <section className="map-journey-section">
          <div className="map-section-heading">
            <div>
              <span className="map-eyebrow">YOUR LEARNING PATH</span>
              <h2>Follow the trail</h2>
              <p>Complete one checkpoint to unlock the next.</p>
            </div>
            <div className="map-legend">
              <span><i className="legend-available" /> Available</span>
              <span><i className="legend-done" /> Completed</span>
              <span><i className="legend-locked" /> Locked</span>
            </div>
          </div>

          <div className="map-landscape">
            <div className="map-landscape-decoration decoration-cloud cloud-one">☁</div>
            <div className="map-landscape-decoration decoration-cloud cloud-two">☁</div>
            <span className="map-landscape-decoration decoration-sun">☀</span>
            <span className="map-landscape-decoration decoration-tree tree-one">🌲</span>
            <span className="map-landscape-decoration decoration-tree tree-two">🌳</span>
            <span className="map-landscape-decoration decoration-flower flower-one">✿</span>
            <span className="map-landscape-decoration decoration-flower flower-two">✿</span>

            <div className="map-path">
              {groupedLessons.map(([area, lessonsInArea], areaIndex) => {
                const info = areaInfo[area] || {
                  icon: "🌿",
                  description: "Keep exploring.",
                };

                return (
                  <section className="map-area" key={area}>
                    <div className="map-area-heading">
                      <span className="map-area-icon">{info.icon}</span>
                      <div>
                        <h3>{area}</h3>
                        <p>{info.description}</p>
                      </div>
                    </div>

                    <div className={`map-checkpoint-grid grid-area-${areaIndex % 2}`}>
                      {lessonsInArea.map((lesson) => {
                        const index = course.lessons.findIndex(
                          (item) => item.id === lesson.id
                        );
                        const done = completedIds.includes(lesson.id);
                        const unlocked = isUnlocked(index);

                        return (
                          <article
                            className={`map-checkpoint ${
                              done ? "checkpoint-done" : ""
                            } ${!unlocked ? "checkpoint-locked" : ""}`}
                            key={lesson.id}
                          >
                            <button
                              type="button"
                              className="map-checkpoint-button"
                              disabled={!unlocked}
                              onClick={() => {
                                if (!unlocked) return;
                                navigate(
                                  `/study/${course.id}/lesson/${lesson.id}`
                                );
                              }}
                              aria-label={`${lesson.title}${done ? ", completed" : unlocked ? ", available" : ", locked"}`}
                            >
                              <span className="map-checkpoint-number">
                                {done ? <Check size={23} /> : unlocked ? lesson.id : <LockKeyhole size={20} />}
                              </span>
                              {done && <span className="map-checkpoint-spark">✦</span>}
                            </button>

                            <div className="map-checkpoint-label">
                              <span className="map-checkpoint-status">
                                {done ? "COMPLETED" : unlocked ? "READY TO EXPLORE" : "LOCKED"}
                              </span>
                              <h4>{lesson.title}</h4>
                              <p>{lesson.description}</p>
                              <div className="map-checkpoint-meta">
                                <span><Clock3 size={12} /> {lesson.duration}</span>
                                <span><Zap size={12} /> {lesson.xp} XP</span>
                              </div>

                              {unlocked && !done && (
                                <button
                                  type="button"
                                  className="map-demo-complete"
                                  onClick={() => markDemoComplete(lesson.id)}
                                  title="Temporary demo action: simulate lesson completion"
                                >
                                  Demo: mark complete
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>

            <div className="map-finish-banner">
              <span className="map-finish-icon"><Trophy size={23} /></span>
              <div>
                <strong>The final challenge awaits!</strong>
                <p>Keep going to reach the summit of {course.language}.</p>
              </div>
              <Star size={21} className="map-finish-star" />
            </div>
          </div>
        </section>

        <section className="map-encouragement">
          <ExplorerCompanion />
          <div>
            <span className="map-eyebrow">A NOTE FROM YOUR COMPANION</span>
            <h2>Little steps make big adventures.</h2>
            <p>You don't need to know it all today. Just take your next step.</p>
          </div>
          <Link to="/dashboard" className="map-dashboard-link">
            My dashboard <ChevronRight size={17} />
          </Link>
        </section>

        <footer className="map-footer">
          <Link to="/dashboard">EVOLV<span>.</span></Link>
          <span>Learn. Build. Grow. Keep becoming.</span>
          <span>{completedCount}/{course.lessons.length} checkpoints explored</span>
        </footer>
      </main>
    </div>
  );
}
