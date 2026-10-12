
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Code2,
  Flame,
  GraduationCap,
  Home,
  LogOut,
  LockKeyhole,
  Menu,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";

import { coursePaths } from "../data/coursePaths";
import "../styles/study-map.css";

const courseOptions = Object.values(coursePaths);

const areaInfo = {
  "Coding Forest": {
    icon: "🌲",
    subtitle: "Chapter 1",
    description: "Learn the foundations, one exercise at a time.",
  },
  "Logic Cave": {
    icon: "🪨",
    subtitle: "Chapter 2",
    description: "Build your problem-solving skills.",
  },
  "Loop Bridge": {
    icon: "🌉",
    subtitle: "Chapter 3",
    description: "Practise patterns and repetition.",
  },
  "Innovation Island": {
    icon: "🏝️",
    subtitle: "Chapter 4",
    description: "Combine concepts and build your skills.",
  },
  "Challenge Peak": {
    icon: "🏔️",
    subtitle: "Chapter 5",
    description: "Put everything together in a final challenge.",
  },
};

function ExplorerCompanion() {
  return (
    <div className="sm-companion" aria-label="EVOLV learning companion">
      <span className="sm-companion-leaf">✦</span>
      <span className="sm-companion-eye sm-eye-left" />
      <span className="sm-companion-eye sm-eye-right" />
      <span className="sm-companion-cheek sm-cheek-left" />
      <span className="sm-companion-cheek sm-cheek-right" />
      <span className="sm-companion-mouth" />
    </div>
  );
}

function Sidebar({ course, closeMobile, onLogout }) {
  return (
    <aside className="sm-sidebar">
      <Link
        to="/dashboard"
        className="sm-brand"
        onClick={closeMobile}
        aria-label="EVOLV dashboard"
      >
        <span className="sm-brand-icon">
          <BookOpen size={24} />
        </span>
        <span>
          EVOLV<span className="sm-brand-dot">.</span>
        </span>
      </Link>

      <div className="sm-sidebar-label">YOUR LEARNING SPACE</div>

      <nav className="sm-sidebar-nav" aria-label="Main navigation">
        <Link to="/dashboard" className="sm-nav-item" onClick={closeMobile}>
          <Home size={20} />
          <span>Home</span>
        </Link>

        <Link
          to={`/study/${course.id}`}
          className="sm-nav-item sm-nav-active"
          onClick={closeMobile}
          aria-current="page"
        >
          <BookOpen size={20} />
          <span>Learn</span>
        </Link>

        <Link to="/dashboard" className="sm-nav-item" onClick={closeMobile}>
          <Target size={20} />
          <span>My progress</span>
        </Link>

        <Link to="/dashboard" className="sm-nav-item" onClick={closeMobile}>
          <Trophy size={20} />
          <span>Achievements</span>
        </Link>

        <Link to="/dashboard" className="sm-nav-item" onClick={closeMobile}>
          <Users size={20} />
          <span>Community</span>
        </Link>
      </nav>

      <div className="sm-sidebar-bottom">
        <div className="sm-sidebar-tip">
          <span className="sm-tip-icon">
            <Sparkles size={19} />
          </span>
          <strong>Keep growing!</strong>
          <p>One small lesson can make a big difference.</p>
        </div>

        <button
          type="button"
          className="sm-nav-item sm-logout"
          onClick={onLogout}
        >
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default function StudyMap() {
  const { courseId = "python" } = useParams();
  const navigate = useNavigate();
  const course = coursePaths[courseId] || coursePaths.python;

  const lessons = course?.lessons || [];
  const storageKey = `evolv_${course.id}_completed`;

  const [completedIds, setCompletedIds] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const validIds = new Set(lessons.map((lesson) => lesson.id));

      setCompletedIds(
        Array.isArray(saved)
          ? saved.filter((id) => validIds.has(id))
          : []
      );
    } catch {
      setCompletedIds([]);
    }
  }, [storageKey, course.id]);

  const completedSet = useMemo(
    () => new Set(completedIds),
    [completedIds]
  );

  const completedCount = lessons.filter((lesson) =>
    completedSet.has(lesson.id)
  ).length;

  const totalLessons = lessons.length;

  const totalXP = lessons.reduce(
    (sum, lesson) =>
      sum +
      (completedSet.has(lesson.id) ? Number(lesson.xp) || 0 : 0),
    0
  );

  const progress = totalLessons
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  // Find the first lesson that has not been completed.
  const nextLessonIndex = lessons.findIndex(
    (lesson) => !completedSet.has(lesson.id)
  );

  const nextLesson =
    nextLessonIndex >= 0 ? lessons[nextLessonIndex] : null;

  const groupedLessons = useMemo(() => {
    const groups = new Map();

    lessons.forEach((lesson, index) => {
      const area = lesson.area || "Learning Trail";

      if (!groups.has(area)) groups.set(area, []);

      groups.get(area).push({
        ...lesson,
        originalIndex: index,
      });
    });

    return Array.from(groups.entries());
  }, [lessons]);

  // A lesson unlocks only when the immediately previous lesson is complete.
  function isUnlocked(index) {
    if (index === 0) return true;
    return completedSet.has(lessons[index - 1]?.id);
  }

  function completeLesson(lessonId) {
    setCompletedIds((current) => {
      if (current.includes(lessonId)) return current;

      const updated = [...current, lessonId];

      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (error) {
        console.error("Could not save lesson progress:", error);
      }

      return updated;
    });
  }

  function handleLogout() {
    localStorage.removeItem("evolv_token");
    sessionStorage.removeItem("evolv_token");
    localStorage.removeItem("evolv_user");
    sessionStorage.removeItem("evolv_user");

    navigate("/login", { replace: true });
  }

  function openLesson(lesson) {
    navigate(`/study/${course.id}/lesson/${lesson.id}`);
  }

  function startNextLesson() {
    if (nextLesson && isUnlocked(nextLessonIndex)) {
      openLesson(nextLesson);
    }
  }

  return (
    <div className={`study-map-page theme-${course.color || "green"}`}>
      <button
        type="button"
        className="sm-mobile-menu"
        onClick={() => setMobileMenuOpen((open) => !open)}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
      </button>

      {mobileMenuOpen && (
        <button
          type="button"
          className="sm-mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="sm-app-layout">
        <div
          className={`sm-sidebar-shell ${
            mobileMenuOpen ? "sm-sidebar-open" : ""
          }`}
        >
          <Sidebar
            course={course}
            closeMobile={() => setMobileMenuOpen(false)}
            onLogout={handleLogout}
          />
        </div>

        <main className="sm-main">
          <header className="sm-topbar">
            <div>
              <span className="sm-eyebrow">
                <Sparkles size={14} />
                YOUR LEARNING ADVENTURE
              </span>
              <h1>{course.language} learning path</h1>
              <p>Little lessons. Big progress.</p>
            </div>

            <div className="sm-topbar-badge">
              <span className="sm-topbar-badge-icon">
                <GraduationCap size={21} />
              </span>
              <div>
                <strong>
                  {completedCount}/{totalLessons}
                </strong>
                <span>Levels completed</span>
              </div>
            </div>
          </header>

          <section className="sm-hero">
            <div className="sm-hero-copy">
              <span className="sm-hero-pill">
                <Sparkles size={14} />
                YOUR NEXT ADVENTURE
              </span>

              <h2>
                Learn a little.
                <br />
                <span>Grow a lot.</span>
              </h2>

              <p>
                {course.subtitle ||
                  "Follow your path, complete exercises, and unlock new levels."}
              </p>

              <p className="sm-hero-subtext">
                Complete each level to unlock the next step in your journey.
              </p>

              <div className="sm-hero-actions">
                <button
                  type="button"
                  className="sm-primary-button"
                  onClick={startNextLesson}
                  disabled={!nextLesson}
                >
                  {nextLesson ? "Continue learning" : "Journey completed"}
                  <ChevronRight size={19} />
                </button>

                <span className="sm-hero-note">
                  <span />
                  {progress}% of your path complete
                </span>
              </div>
            </div>

            <div className="sm-hero-art" aria-hidden="true">
              <span className="sm-art-orbit sm-orbit-one" />
              <span className="sm-art-orbit sm-orbit-two" />
              <span className="sm-art-spark sm-art-spark-one">✦</span>
              <span className="sm-art-spark sm-art-spark-two">✧</span>

              <div className="sm-art-book">{course.icon || "📘"}</div>
              <ExplorerCompanion />

              <span className="sm-art-float sm-art-float-top">
                <Code2 size={16} />
                Keep learning!
              </span>

              <span className="sm-art-float sm-art-float-bottom">
                <Zap size={16} />
                Earn XP
              </span>
            </div>
          </section>

          <section className="sm-stat-grid" aria-label="Learning statistics">
            <article className="sm-stat-card">
              <span className="sm-stat-icon sm-stat-pink">
                <Check size={23} />
              </span>
              <div>
                <span className="sm-stat-label">Levels completed</span>
                <div className="sm-stat-value">
                  {completedCount}
                  <small> / {totalLessons}</small>
                </div>
                <p>Every step counts!</p>
              </div>
            </article>

            <article className="sm-stat-card">
              <span className="sm-stat-icon sm-stat-blue">
                <Trophy size={23} />
              </span>
              <div>
                <span className="sm-stat-label">Experience points</span>
                <div className="sm-stat-value">
                  {totalXP}
                  <small> XP</small>
                </div>
                <p>{totalXP ? "Great work so far!" : "Your first reward awaits"}</p>
              </div>
            </article>

            <article className="sm-stat-card">
              <span className="sm-stat-icon sm-stat-green">
                <Flame size={23} />
              </span>
              <div>
                <span className="sm-stat-label">Learning streak</span>
                <div className="sm-stat-value">
                  {completedCount > 0 ? 1 : 0}
                  <small> day demo</small>
                </div>
                <p>Keep building your habit!</p>
              </div>
            </article>

            <article className="sm-stat-card">
              <span className="sm-stat-icon sm-stat-purple">
                <Target size={23} />
              </span>
              <div>
                <span className="sm-stat-label">Course progress</span>
                <div className="sm-stat-value">
                  {progress}
                  <small>%</small>
                </div>
                <p>Your journey starts here</p>
              </div>
            </article>
          </section>

          <section className="sm-course-switcher">
            <div className="sm-switcher-heading">
              <span className="sm-eyebrow">CHOOSE YOUR WORLD</span>
              <h2>Where shall we explore?</h2>
            </div>

            <div className="sm-course-options">
              {courseOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`sm-course-option ${
                    option.id === course.id ? "selected" : ""
                  }`}
                  onClick={() => navigate(`/study/${option.id}`)}
                  aria-pressed={option.id === course.id}
                >
                  <span>{option.icon || "📘"}</span>
                  {option.language}
                  {option.id === course.id && <Check size={15} />}
                </button>
              ))}
            </div>
          </section>

          <section className="sm-journey-section">
            <div className="sm-section-heading">
              <div>
                <span className="sm-eyebrow">YOUR LEARNING PATH</span>
                <h2>Your adventure map</h2>
                <p>
                  Follow the trail, finish each level, and unlock your next
                  checkpoint.
                </p>
              </div>

              <div className="sm-legend">
                <span><i className="sm-legend-available" /> Available</span>
                <span><i className="sm-legend-done" /> Completed</span>
                <span><i className="sm-legend-locked" /> Locked</span>
              </div>
            </div>

            {lessons.length === 0 ? (
              <div className="sm-empty-state">
                <BookOpen size={38} />
                <h3>Your learning trail is waiting</h3>
                <p>Add lessons to this course in coursePaths to build your map.</p>
              </div>
            ) : (
              <div className="sm-map-landscape">
                <span className="sm-landscape-cloud sm-cloud-one">☁</span>
                <span className="sm-landscape-cloud sm-cloud-two">☁</span>
                <span className="sm-landscape-sun">✳</span>
                <span className="sm-landscape-plant sm-plant-one">🌿</span>
                <span className="sm-landscape-plant sm-plant-two">🌱</span>

                <div className="sm-map-path">
                  {groupedLessons.map(([area, lessonsInArea], areaIndex) => {
                    const info = areaInfo[area] || {
                      icon: "🌿",
                      subtitle: `Chapter ${areaIndex + 1}`,
                      description: "Keep exploring and growing.",
                    };

                    const chapterDone = lessonsInArea.every((lesson) =>
                      completedSet.has(lesson.id)
                    );

                    const firstIndex = lessonsInArea[0].originalIndex;
                    const chapterUnlocked = isUnlocked(firstIndex);

                    const chapterCompleted = lessonsInArea.filter((lesson) =>
                      completedSet.has(lesson.id)
                    ).length;

                    return (
                      <section className="sm-map-area" key={area}>
                        <div className="sm-map-area-heading">
                          <span
                            className={`sm-map-area-icon ${
                              chapterDone ? "sm-chapter-done" : ""
                            }`}
                          >
                            {chapterDone ? <Check size={25} /> : info.icon}
                          </span>

                          <div className="sm-chapter-heading-copy">
                            <span className="sm-chapter-kicker">
                              {info.subtitle || `Chapter ${areaIndex + 1}`}
                            </span>
                            <h3>{area}</h3>
                            <p>{info.description}</p>
                          </div>

                          <span className="sm-chapter-count">
                            {chapterCompleted}/{lessonsInArea.length}
                          </span>
                        </div>

                        <div className="sm-chapter-progress">
                          <span
                            style={{
                              width: `${
                                (chapterCompleted / lessonsInArea.length) * 100
                              }%`,
                            }}
                          />
                        </div>

                        {!chapterUnlocked && (
                          <div className="sm-chapter-locked-note">
                            <LockKeyhole size={15} />
                            Complete the previous level to unlock this chapter.
                          </div>
                        )}

                        <div className="sm-checkpoint-grid">
                          {lessonsInArea.map((lesson, localIndex) => {
                            const index = lesson.originalIndex;
                            const done = completedSet.has(lesson.id);
                            const unlocked = isUnlocked(index);
                            const active = unlocked && !done;

                            const position =
                              (index % 4) + 1;

                            return (
                              <article
                                className={[
                                  "sm-checkpoint",
                                  `sm-node-position-${position}`,
                                  done ? "sm-checkpoint-done" : "",
                                  active ? "sm-checkpoint-active" : "",
                                  !unlocked ? "sm-checkpoint-locked" : "",
                                ].filter(Boolean).join(" ")}
                                key={lesson.id}
                              >
                                <button
                                  type="button"
                                  className="sm-checkpoint-button"
                                  disabled={!unlocked}
                                  onClick={() => openLesson(lesson)}
                                  aria-label={`${lesson.title}: ${
                                    done
                                      ? "completed"
                                      : unlocked
                                        ? "available"
                                        : "locked"
                                  }`}
                                >
                                  <span className="sm-checkpoint-node">
                                    {done ? (
                                      <Check size={28} strokeWidth={3} />
                                    ) : !unlocked ? (
                                      <LockKeyhole size={23} />
                                    ) : (
                                      <BookOpen size={26} />
                                    )}
                                  </span>

                                  {active && (
                                    <span className="sm-checkpoint-current">
                                      START
                                    </span>
                                  )}

                                  {done && (
                                    <span className="sm-checkpoint-spark">✦</span>
                                  )}
                                </button>

                                <div className="sm-checkpoint-label">
                                  <span className="sm-checkpoint-status">
                                    {done
                                      ? "LEVEL COMPLETED"
                                      : unlocked
                                        ? "YOUR NEXT LEVEL"
                                        : "LEVEL LOCKED"}
                                  </span>

                                  <span className="sm-level-number">
                                    Level {index + 1}
                                  </span>

                                  <h4>{lesson.title}</h4>

                                  <p>
                                    {lesson.description ||
                                      "Practise this concept and grow your skills."}
                                  </p>

                                  <div className="sm-checkpoint-meta">
                                    <span>
                                      <Clock3 size={13} />
                                      {lesson.duration || "5 min"}
                                    </span>
                                    <span>
                                      <Zap size={13} />
                                      {lesson.xp || 10} XP
                                    </span>
                                  </div>

                                  {unlocked && (
                                    <button
                                      type="button"
                                      className="sm-level-action"
                                      onClick={() => openLesson(lesson)}
                                    >
                                      {done ? "Practise again" : "Start level"}
                                      <ChevronRight size={15} />
                                    </button>
                                  )}

                                  {import.meta.env.DEV && unlocked && !done && (
                                    <button
                                      type="button"
                                      className="sm-demo-complete"
                                      onClick={() => completeLesson(lesson.id)}
                                      title="Development testing only"
                                    >
                                      <Check size={13} />
                                      Demo: complete level
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

                <div className="sm-finish-banner">
                  <span className="sm-finish-icon">
                    <Trophy size={25} />
                  </span>
                  <div>
                    <strong>
                      {progress === 100
                        ? "You reached the summit!"
                        : "The final challenge awaits!"}
                    </strong>
                    <p>
                      {progress === 100
                        ? "Amazing work. Keep practising your skills."
                        : `Keep going to master ${course.language}.`}
                    </p>
                  </div>
                  <Star size={24} className="sm-finish-star" />
                </div>
              </div>
            )}
          </section>

          <footer className="sm-footer">
            <Link to="/dashboard" className="sm-footer-brand">
              EVOLV<span>.</span>
            </Link>
            <span>Learn. Build. Grow. Keep becoming.</span>
            <span>{completedCount}/{totalLessons} levels completed</span>
          </footer>
        </main>

        <aside className="sm-right-sidebar">
          <section className="sm-widget sm-super-widget">
            <span className="sm-widget-eyebrow">
              <Sparkles size={14} /> YOUR NEXT STEP
            </span>
            <div className="sm-super-art">🚀</div>
            <h3>One level at a time</h3>
            <p>Finish an exercise, earn XP, and unlock your next challenge.</p>
            <button
              type="button"
              className="sm-widget-button"
              onClick={startNextLesson}
              disabled={!nextLesson}
            >
              {nextLesson ? "CONTINUE LEARNING" : "COURSE COMPLETED"}
              <ChevronRight size={16} />
            </button>
          </section>

          <section className="sm-widget sm-league-widget">
            <div className="sm-widget-heading">
              <h3>Your achievements</h3>
              <Trophy size={19} />
            </div>

            <div className="sm-achievement">
              <span className="sm-achievement-icon">
                <ShieldCheck size={28} />
              </span>
              <div>
                <strong>
                  {completedCount > 0 ? "First steps taken!" : "First badge"}
                </strong>
                <p>
                  {completedCount > 0
                    ? `${completedCount} level${completedCount === 1 ? "" : "s"} completed`
                    : "Complete your first level to begin."}
                </p>
              </div>
            </div>

            <div className="sm-achievement">
              <span className="sm-achievement-icon sm-achievement-gold">
                <Star size={27} />
              </span>
              <div>
                <strong>{totalXP >= 50 ? "XP collector!" : "XP collector"}</strong>
                <p>
                  {totalXP >= 50
                    ? "50 XP milestone reached."
                    : `${totalXP}/50 XP earned`}
                </p>
              </div>
            </div>
          </section>

          <section className="sm-widget sm-quests-widget">
            <div className="sm-widget-heading">
              <h3>Daily quests</h3>
              <Sparkles size={19} />
            </div>

            <div className="sm-quest">
              <span className="sm-quest-icon sm-quest-yellow">
                <Zap size={23} />
              </span>
              <div className="sm-quest-content">
                <strong>Complete one level</strong>
                <p>{Math.min(completedCount, 1)} / 1 completed</p>
                <div className="sm-quest-track">
                  <span style={{ width: completedCount > 0 ? "100%" : "0%" }} />
                </div>
              </div>
            </div>

            <div className="sm-quest">
              <span className="sm-quest-icon sm-quest-green">
                <Target size={23} />
              </span>
              <div className="sm-quest-content">
                <strong>Reach 50 XP</strong>
                <p>{Math.min(totalXP, 50)} / 50 XP</p>
                <div className="sm-quest-track">
                  <span
                    style={{
                      width: `${Math.min((totalXP / 50) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="sm-quest">
              <span className="sm-quest-icon sm-quest-blue">
                <BookOpen size={23} />
              </span>
              <div className="sm-quest-content">
                <strong>Explore your course</strong>
                <p>{completedCount} / {totalLessons} levels</p>
                <div className="sm-quest-track">
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </section>

          <section className="sm-widget sm-progress-widget">
            <div className="sm-widget-heading">
              <h3>Course progress</h3>
              <Target size={19} />
            </div>

            <div className="sm-big-progress">
              <div
                className="sm-progress-ring"
                style={{ "--sm-progress": `${progress}%` }}
                role="img"
                aria-label={`${progress}% completed`}
              >
                <span>{progress}%</span>
              </div>
              <div>
                <strong>{course.language}</strong>
                <p>{completedCount} of {totalLessons} levels complete</p>
              </div>
            </div>

            <div className="sm-progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>

            <p className="sm-progress-message">
              {nextLesson
                ? `Next up: ${nextLesson.title}`
                : "You've completed this learning path!"}
            </p>
          </section>

          <section className="sm-companion-widget">
            <ExplorerCompanion />
            <div>
              <strong>You've got this!</strong>
              <p>Learn at your own pace. Every level matters.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
