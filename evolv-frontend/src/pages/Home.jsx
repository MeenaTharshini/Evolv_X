
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Flame,
  LockKeyhole,
  Play,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Rightbar from "../components/Rightbar";
import { pythonLessons } from "../data/pythonLessons";
import "../styles/home.css";

const COURSE_ID = "python";
const STUDY_MAP_LINK = `/study/${COURSE_ID}`;
const PROGRESS_KEY = `evolv_${COURSE_ID}_completed`;
const XP_KEY = `evolv_${COURSE_ID}_xp`;
const STREAK_KEY = `evolv_${COURSE_ID}_streak`;

const lessonColors = [
  "pink",
  "green",
  "blue",
  "purple",
  "orange",
];

function readNumber(key, fallback = 0) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  } catch {
    return fallback;
  }
}

function readCompletedIds() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
    if (!Array.isArray(saved)) return [];

    const validIds = new Set(pythonLessons.map((lesson) => Number(lesson.id)));

    return [...new Set(saved.map(Number).filter((id) => validIds.has(id)))];
  } catch {
    return [];
  }
}

function getXpFromProgress(completedIds) {
  return pythonLessons.reduce((total, lesson) => {
    if (!completedIds.includes(Number(lesson.id))) return total;
    return total + (Number(lesson.xp) || 10);
  }, 0);
}

function getStoredXp(completedIds) {
  try {
    const stored = localStorage.getItem(XP_KEY);
    return stored === null
      ? getXpFromProgress(completedIds)
      : readNumber(XP_KEY, getXpFromProgress(completedIds));
  } catch {
    return getXpFromProgress(completedIds);
  }
}

function getLessonDuration(lesson) {
  if (lesson.duration) return lesson.duration;
  return Number(lesson.id) === 1 ? "5 min" : "6 min";
}

function getLessonType(lesson, index) {
  if (lesson.area) return lesson.area;

  const types = [
    "Getting started",
    "Core concept",
    "Core concept",
    "Practice",
    "Logic",
    "Practice",
    "Reusable code",
    "Collections",
    "Collections",
    "Challenge",
  ];

  return types[index] || "Practice";
}

function Companion() {
  return (
    <div className="home-companion" role="img" aria-label="EVOLV learning companion">
      <span className="home-companion-leaf leaf-a" />
      <span className="home-companion-leaf leaf-b" />
      <div className="home-companion-face">
        <span className="home-eye eye-a" />
        <span className="home-eye eye-b" />
        <span className="home-cheek cheek-a" />
        <span className="home-cheek cheek-b" />
        <span className="home-smile" />
      </div>
      <Sparkles className="home-companion-spark" size={21} />
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="home-section-heading">
      <div>
        <span className="home-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

export default function Home() {
  const [completedIds, setCompletedIds] = useState(readCompletedIds);
  const [xp, setXp] = useState(() => getStoredXp(readCompletedIds()));
  const [streak, setStreak] = useState(() => readNumber(STREAK_KEY, 0));

  const refreshProgress = useCallback(() => {
    const ids = readCompletedIds();
    setCompletedIds(ids);
    setXp(getStoredXp(ids));
    setStreak(readNumber(STREAK_KEY, 0));
  }, []);

  useEffect(() => {
    refreshProgress();

    const handleStorage = (event) => {
      if (
        !event ||
        event.key === null ||
        [PROGRESS_KEY, XP_KEY, STREAK_KEY].includes(event.key)
      ) {
        refreshProgress();
      }
    };

    window.addEventListener("focus", refreshProgress);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("evolv-progress-updated", refreshProgress);

    return () => {
      window.removeEventListener("focus", refreshProgress);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("evolv-progress-updated", refreshProgress);
    };
  }, [refreshProgress]);

  const completedSet = useMemo(
    () => new Set(completedIds),
    [completedIds]
  );

  const completedLessons = completedIds.length;
  const totalLessons = pythonLessons.length;
  const progress = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  const nextLesson = pythonLessons.find(
    (lesson) => !completedSet.has(Number(lesson.id))
  );

  const totalMinutes = pythonLessons.reduce((total, lesson) => {
    const match = String(getLessonDuration(lesson)).match(/\d+/);
    return total + (match ? Number(match[0]) : 5);
  }, 0);

  const firstName = useMemo(() => {
    try {
      const user = JSON.parse(
        localStorage.getItem("evolv_user") ||
          sessionStorage.getItem("evolv_user") ||
          "{}"
      );

      return (
        user?.name?.trim()?.split(/\s+/)[0] ||
        user?.username?.trim()?.split(/\s+/)[0] ||
        "Learner"
      );
    } catch {
      return "Learner";
    }
  }, []);

  return (
    <div className="ev-home" id="home">
      <Navbar />

      <main className="home-main">
        <div className="home-topbar">
          <div className="home-breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>Home</strong>
          </div>

          <div className="home-topbar-actions">
            <span className="home-topbar-greeting">Keep growing, {firstName}!</span>
            <span className="home-topbar-avatar" aria-hidden="true">
              {firstName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="home-container">
          <section className="home-welcome">
            <div className="home-welcome-copy">
              <span className="home-welcome-pill">
                <Sparkles size={14} />
                YOUR LEARNING SPACE
              </span>

              <h1>
                Welcome, {firstName}!
                <br />
                Every expert was once a <span>beginner.</span>
              </h1>

              <p>
                Your journey, your pace, your possibilities.
                <br className="home-desktop-break" />
                Take one small step toward something brilliant today.
              </p>

              <div className="home-welcome-actions">
                <Link className="home-button home-button-primary" to={STUDY_MAP_LINK}>
                  {nextLesson ? "Continue learning" : "Review my path"}
                  <ArrowRight size={17} />
                </Link>

                <span className="home-friendly-note">
                  <span className="home-note-dot" />
                  No rush. Just progress.
                </span>
              </div>
            </div>

            <div className="home-welcome-art" aria-hidden="true">
              <div className="home-art-circle" />
              <div className="home-floating-tag tag-code">
                <Code2 size={17} />
                <span>Keep coding!</span>
              </div>
              <div className="home-floating-tag tag-xp">
                <Zap size={16} />
                <span>+XP awaits</span>
              </div>
              <div className="home-art-book">
                <BookOpen size={39} strokeWidth={1.7} />
              </div>
              <div className="home-art-spark spark-a">✦</div>
              <div className="home-art-spark spark-b">✧</div>
              <div className="home-art-spark spark-c">✳</div>
              <Companion />
              <div className="home-art-ground" />
            </div>
          </section>

          <section className="home-stats" aria-label="Your learning statistics">
            <article className="home-stat-card stat-pink">
              <span className="home-stat-icon"><CheckCircle2 size={21} /></span>
              <div>
                <span className="home-stat-label">Lessons completed</span>
                <strong>{completedLessons}<small> / {totalLessons}</small></strong>
                <span className="home-stat-caption">Every step counts!</span>
              </div>
            </article>

            <article className="home-stat-card stat-blue">
              <span className="home-stat-icon"><Trophy size={21} /></span>
              <div>
                <span className="home-stat-label">Experience points</span>
                <strong>{xp} <small>XP</small></strong>
                <span className="home-stat-caption">Every lesson is a win</span>
              </div>
            </article>

            <article className="home-stat-card stat-green">
              <span className="home-stat-icon"><Flame size={21} /></span>
              <div>
                <span className="home-stat-label">Learning streak</span>
                <strong>{streak} <small>days</small></strong>
                <span className="home-stat-caption">Build a little habit daily</span>
              </div>
            </article>

            <article className="home-stat-card stat-purple">
              <span className="home-stat-icon"><Target size={21} /></span>
              <div>
                <span className="home-stat-label">Course progress</span>
                <strong>{progress}<small>%</small></strong>
                <span className="home-stat-caption">Keep moving forward</span>
              </div>
            </article>
          </section>

          <section className="home-course-card" aria-labelledby="home-course-title">
            <div className="home-course-content">
              <span className="home-course-badge">
                <span className="home-live-dot" />
                YOUR LEARNING PATH
              </span>

              <h2 id="home-course-title">Python Foundations</h2>
              <p>
                From your first print statement to writing useful programs,
                build your foundation one friendly lesson at a time.
              </p>

              <div className="home-course-meta">
                <span><BookOpen size={15} /> {totalLessons} lessons</span>
                <span><Clock3 size={15} /> About {totalMinutes} minutes</span>
                <span><Sparkles size={15} /> Beginner friendly</span>
              </div>

              <div className="home-progress-copy">
                <span>Your course progress</span>
                <strong>{progress}%</strong>
              </div>

              <div
                className="home-progress-track"
                role="progressbar"
                aria-label="Python course progress"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="home-progress-fill" style={{ width: `${progress}%` }} />
              </div>

              <Link className="home-button home-button-primary" to={STUDY_MAP_LINK}>
                <Play size={16} fill="currentColor" />
                {nextLesson ? "Start learning" : "Review course"}
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="home-course-art" aria-hidden="true">
              <div className="home-code-window">
                <div className="home-code-top">
                  <span /><span /><span />
                  <small>hello.py</small>
                </div>
                <div className="home-code-body">
                  <span className="home-line-number">1</span>
                  <code><i>print</i>(<b>"Hello, world!"</b>)</code>
                  <span className="home-line-number">2</span>
                  <code><em># Let's begin!</em></code>
                  <span className="home-line-number">3</span>
                  <code><i>learn</i>() <span className="home-code-comment">✨</span></code>
                </div>
                <div className="home-code-success">
                  <CheckCircle2 size={15} />
                  <span>Ready for your next quest</span>
                </div>
              </div>
              <span className="home-code-deco deco-one">{"{ }"}</span>
              <span className="home-code-deco deco-two">&lt;/&gt;</span>
              <span className="home-code-deco deco-three">✦</span>
            </div>
          </section>

          <section className="home-lessons-section" id="python-course">
            <SectionHeading
              eyebrow="YOUR NEXT ADVENTURE"
              title="Your learning path"
              description="Little lessons. Real skills. One step at a time."
            />

            <div className="home-lesson-list">
              {pythonLessons.map((lesson, index) => {
                const lessonId = Number(lesson.id);
                const completed = completedSet.has(lessonId);
                const previousId = Number(pythonLessons[index - 1]?.id);
                const locked =
                  index > 0 && !completedSet.has(previousId);
                const color = lessonColors[index % lessonColors.length];

                return (
                  <article
                    className={`home-lesson-item ${locked ? "is-locked" : ""} ${completed ? "is-completed" : ""}`}
                    key={lesson.id}
                  >
                    <div className={`home-lesson-number lesson-${color}`}>
                      {completed ? (
                        <Check size={19} />
                      ) : locked ? (
                        <LockKeyhole size={18} />
                      ) : (
                        <span>{String(lesson.id).padStart(2, "0")}</span>
                      )}
                    </div>

                    <div className="home-lesson-details">
                      <div className="home-lesson-title-row">
                        <h3>{lesson.title}</h3>
                        <span className={`home-lesson-type type-${color}`}>
                          {getLessonType(lesson, index)}
                        </span>
                      </div>

                      <p>
                        {lesson.description ||
                          "Explore the concept and practise what you learn."}
                      </p>

                      <span className="home-lesson-duration">
                        <Clock3 size={13} />
                        {getLessonDuration(lesson)}
                      </span>
                    </div>

                    {completed ? (
                      <span className="home-lesson-status completed-label">
                        <CheckCircle2 size={14} /> Completed
                      </span>
                    ) : locked ? (
                      <span className="home-lesson-status">
                        <LockKeyhole size={13} /> Locked
                      </span>
                    ) : (
                      <Link
                        to={`${STUDY_MAP_LINK}/lesson/${lesson.id}`}
                        className="home-lesson-action"
                        aria-label={`Open ${lesson.title}`}
                        title={`Open ${lesson.title}`}
                      >
                        <ChevronRight size={20} />
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>

            <div className="home-unlock-note">
              <span className="home-unlock-icon"><LockKeyhole size={17} /></span>
              <p>
                <strong>
                  {nextLesson
                    ? "More adventures are ahead!"
                    : "Amazing work — you finished the path!"}
                </strong>
                <br />
                {nextLesson
                  ? "Complete your current lesson to unlock the next one."
                  : "You can revisit the Study Map to review your lessons."}
              </p>
              <Sparkles size={21} className="home-unlock-spark" />
            </div>
          </section>

          <section className="home-start-banner" id="start-here">
            <div className="home-start-art" aria-hidden="true">
              <Companion />
              <span className="home-start-star star-left">✦</span>
              <span className="home-start-star star-right">✧</span>
            </div>

            <div className="home-start-copy">
              <span className="home-eyebrow">YOUR NEXT LITTLE WIN</span>
              <h2>
                {nextLesson
                  ? "Ready for your next line of code?"
                  : "Your learning journey keeps growing!"}
              </h2>
              <p>
                Open your Python path and turn curiosity into a new skill.
              </p>
            </div>

            <Link className="home-button home-button-primary" to={STUDY_MAP_LINK}>
              Explore lessons <ArrowRight size={17} />
            </Link>
          </section>

          <footer className="home-footer">
            <Link className="home-footer-brand" to="/dashboard">
              <span className="home-footer-symbol">✦</span>
              EVOLV<span className="home-brand-dot">.</span>
            </Link>
            <span>Learn. Build. Grow. Keep becoming.</span>
            <a href="#home" className="home-back-top">Back to top ↑</a>
          </footer>
        </div>
      </main>

      <Rightbar />
    </div>
  );
}
