import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  GraduationCap,
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
import { getStreak } from "../services/api";
import "../styles/home.css";

const COURSE_ID = "python";
const STUDY_MAP_LINK = `/study/${COURSE_ID}`;

const PROGRESS_KEY = `evolv_${COURSE_ID}_completed`;
const XP_KEY = `evolv_${COURSE_ID}_xp`;
const STREAK_KEY = `evolv_${COURSE_ID}_streak`;

// Keep these keys aligned with the keys used in StudyMap.jsx.
const LAST_VIEWED_KEYS = [
  `evolv_${COURSE_ID}_lastViewed`,
  `evolv_${COURSE_ID}_last_viewed`,
  `evolv_${COURSE_ID}_lastViewedLesson`,
  `evolv_${COURSE_ID}_last_viewed_lesson`,
  `evolv_${COURSE_ID}_currentLesson`,
  `evolv_${COURSE_ID}_current_lesson`,
];

// Add additional registered courses here as your platform grows.
// The course IDs must match the IDs used in your routes and backend.
const COURSE_CATALOG = [
  {
    id: "python",
    title: "Python Foundations",
    description:
      "Build your programming foundation, practise core concepts, and create useful programs.",
    level: "Beginner",
    icon: "🐍",
    color: "blue",
    duration: "Self-paced",
  },
];

const lessonColors = ["pink", "green", "blue", "purple", "orange"];

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

    return [
      ...new Set(
        saved
          .map(Number)
          .filter((id) => Number.isFinite(id) && validIds.has(id))
      ),
    ];
  } catch {
    return [];
  }
}

function getXpFromProgress(completedIds) {
  const completedSet = new Set(completedIds);

  return pythonLessons.reduce((total, lesson) => {
    if (!completedSet.has(Number(lesson.id))) return total;

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
  if (lesson?.duration) return lesson.duration;

  return Number(lesson?.id) === 1 ? "5 min" : "6 min";
}

function getFirstName() {
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
}

function readLastViewedModule() {
  try {
    for (const key of LAST_VIEWED_KEYS) {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      // The saved value might be a simple lesson ID or a JSON object.
      try {
        const parsed = JSON.parse(raw);

        if (typeof parsed === "number" || typeof parsed === "string") {
          const id = Number(parsed);

          if (Number.isFinite(id)) return { lessonId: id };
        }

        if (parsed && typeof parsed === "object") {
          const lessonId = Number(
            parsed.lessonId ??
              parsed.lesson_id ??
              parsed.topicId ??
              parsed.topic_id ??
              parsed.id
          );

          if (Number.isFinite(lessonId)) {
            return {
              lessonId,
              title: parsed.title || parsed.lessonTitle || parsed.name,
              courseId: parsed.courseId || parsed.course_id || COURSE_ID,
              stage: parsed.stage || parsed.lastStage,
              path: parsed.path,
            };
          }
        }
      } catch {
        const id = Number(raw);

        if (Number.isFinite(id)) return { lessonId: id };
      }
    }
  } catch {
    // If storage is unavailable, use the first incomplete lesson instead.
  }

  return null;
}

function getLastViewedLesson(lastViewed) {
  if (!lastViewed) return null;

  const lessonId = Number(lastViewed.lessonId);

  const lesson = pythonLessons.find(
    (item) => Number(item.id) === lessonId
  );

  if (!lesson) return null;

  return {
    ...lesson,
    resumePath:
      typeof lastViewed.path === "string" && lastViewed.path.startsWith("/")
        ? lastViewed.path
        : `${STUDY_MAP_LINK}/lesson/${lesson.id}${
            lastViewed.stage
              ? `/${encodeURIComponent(String(lastViewed.stage))}`
              : ""
          }`,
  };
}

function getNextIncompleteLesson(completedIds) {
  const completedSet = new Set(completedIds);

  return pythonLessons.find(
    (lesson) => !completedSet.has(Number(lesson.id))
  );
}

function readRegisteredCourses() {
  const userCourseKeys = [
    "evolv_registered_courses",
    "evolv_courses",
    "registeredCourses",
  ];

  try {
    for (const key of userCourseKeys) {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      const parsed = JSON.parse(raw);
      const courseList = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.courses)
          ? parsed.courses
          : null;

      if (!courseList) continue;

      const ids = courseList
        .map((course) =>
          typeof course === "string" || typeof course === "number"
            ? String(course).toLowerCase()
            : String(
                course?.courseId ??
                  course?.course_id ??
                  course?.id ??
                  course?.slug ??
                  ""
              ).toLowerCase()
        )
        .filter(Boolean);

      return ids;
    }
  } catch {
    // Use the default course if registered-course data is unavailable.
  }

  // Backward-compatible fallback for the current Python course.
  return [COURSE_ID];
}

function Companion() {
  return (
    <div
      className="home-companion"
      role="img"
      aria-label="EVOLV learning companion"
    >
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

function CourseCard({ course, completedCount, totalCount }) {
  const progress = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  return (
    <article className={`home-registered-course course-${course.color}`}>
      <div className="home-registered-course-top">
        <span className="home-registered-course-icon" aria-hidden="true">
          {course.icon}
        </span>

        <span className="home-course-level">{course.level}</span>
      </div>

      <h3>{course.title}</h3>
      <p>{course.description}</p>

      <div className="home-course-meta">
        <span>
          <BookOpen size={15} />
          {totalCount} lessons
        </span>

        <span>
          <Clock3 size={15} />
          {course.duration}
        </span>
      </div>

      <div className="home-progress-copy">
        <span>Course progress</span>
        <strong>{progress}%</strong>
      </div>

      <div
        className="home-progress-track"
        role="progressbar"
        aria-label={`${course.title} progress`}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="home-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Link
        className="home-button home-button-primary home-course-open"
        to={`/study/${course.id}`}
      >
        {progress === 100 ? "Review course" : "Open course"}
        <ArrowRight size={17} />
      </Link>
    </article>
  );
}

export default function Home() {
  const [completedIds, setCompletedIds] = useState(readCompletedIds);
  const [xp, setXp] = useState(() => getStoredXp(readCompletedIds()));
  const [streak, setStreak] = useState(() => readNumber(STREAK_KEY, 0));
  const [lastViewed, setLastViewed] = useState(readLastViewedModule);
  const [registeredCourseIds, setRegisteredCourseIds] = useState(
    readRegisteredCourses
  );

  const refreshProgress = useCallback(() => {
    const ids = readCompletedIds();

    setCompletedIds(ids);
    setXp(getStoredXp(ids));
    setStreak(readNumber(STREAK_KEY, 0));
    setLastViewed(readLastViewedModule());
    setRegisteredCourseIds(readRegisteredCourses());
  }, []);

  const refreshBackendStreak = useCallback(async () => {
    try {
      const data = await getStreak();
      const currentStreak = Number(data?.currentStreak);

      if (!Number.isFinite(currentStreak) || currentStreak < 0) {
        throw new Error("The backend returned an invalid streak value.");
      }

      setStreak(currentStreak);

      try {
        localStorage.setItem(STREAK_KEY, String(currentStreak));
      } catch (storageError) {
        console.warn("Could not cache the streak locally:", storageError);
      }
    } catch (error) {
      // Keep the cached streak visible when the API is unavailable.
      console.error("Could not load learning streak:", error);
    }
  }, []);

  useEffect(() => {
    refreshProgress();
    refreshBackendStreak();

    const handleStorage = (event) => {
      if (
        !event ||
        event.key === null ||
        [
          PROGRESS_KEY,
          XP_KEY,
          STREAK_KEY,
          ...LAST_VIEWED_KEYS,
          "evolv_registered_courses",
          "evolv_courses",
          "registeredCourses",
        ].includes(event.key)
      ) {
        refreshProgress();

        if (
          !event ||
          event.key === null ||
          event.key === STREAK_KEY
        ) {
          refreshBackendStreak();
        }
      }
    };

    const handleProgressUpdated = () => {
      refreshProgress();
      refreshBackendStreak();
    };

    const handleFocus = () => {
      refreshProgress();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      "evolv-progress-updated",
      handleProgressUpdated
    );

    // Also refresh when StudyMap announces a last-viewed module change.
    window.addEventListener("evolv-last-viewed-updated", refreshProgress);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "evolv-progress-updated",
        handleProgressUpdated
      );
      window.removeEventListener(
        "evolv-last-viewed-updated",
        refreshProgress
      );
    };
  }, [refreshProgress, refreshBackendStreak]);

  const firstName = useMemo(() => getFirstName(), []);

  const completedSet = useMemo(
    () => new Set(completedIds),
    [completedIds]
  );

  const completedLessons = completedIds.length;
  const totalLessons = pythonLessons.length;

  const progress = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  const nextLesson = getNextIncompleteLesson(completedIds);

  const viewedLesson = getLastViewedLesson(lastViewed);

  const resumeLesson =
    viewedLesson ||
    (nextLesson
      ? {
          ...nextLesson,
          resumePath: `${STUDY_MAP_LINK}/lesson/${nextLesson.id}`,
        }
      : null);

  const totalMinutes = pythonLessons.reduce((total, lesson) => {
    const match = String(getLessonDuration(lesson)).match(/\d+/);
    return total + (match ? Number(match[0]) : 5);
  }, 0);

  const registeredCourses = useMemo(() => {
    const uniqueIds = [...new Set(registeredCourseIds)];

    return uniqueIds
      .map((id) => COURSE_CATALOG.find((course) => course.id === id))
      .filter(Boolean);
  }, [registeredCourseIds]);

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
            <span className="home-topbar-greeting">
              Keep growing, {firstName}!
            </span>

            <span className="home-topbar-avatar" aria-hidden="true">
              {firstName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="home-container">
          {/* Welcome */}
          <section className="home-welcome">
            <div className="home-welcome-copy">
              <span className="home-welcome-pill">
                <Sparkles size={14} />
                YOUR LEARNING SPACE
              </span>

              <h1>
                Welcome back, {firstName}!
                <br />
                Every expert was once a <span>beginner.</span>
              </h1>

              <p>
                Your journey, your pace, your possibilities.
                <br className="home-desktop-break" />
                Take one small step toward something brilliant today.
              </p>

              <div className="home-welcome-actions">
                <Link
                  className="home-button home-button-primary"
                  to={resumeLesson?.resumePath || STUDY_MAP_LINK}
                >
                  {resumeLesson ? "Continue learning" : "Explore courses"}
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
                <GraduationCap size={17} />
                <span>Keep growing!</span>
              </div>

              <div className="home-floating-tag tag-xp">
                <Zap size={16} />
                <span>{xp} XP earned</span>
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

          {/* Learning statistics */}
          <section
            className="home-stats"
            aria-label="Your learning statistics"
          >
            <article className="home-stat-card stat-pink">
              <span className="home-stat-icon">
                <CheckCircle2 size={21} />
              </span>

              <div>
                <span className="home-stat-label">Lessons completed</span>
                <strong>
                  {completedLessons}
                  <small> / {totalLessons}</small>
                </strong>
                <span className="home-stat-caption">Every step counts!</span>
              </div>
            </article>

            <article className="home-stat-card stat-blue">
              <span className="home-stat-icon">
                <Trophy size={21} />
              </span>

              <div>
                <span className="home-stat-label">Experience points</span>
                <strong>
                  {xp} <small>XP</small>
                </strong>
                <span className="home-stat-caption">
                  Every lesson is a win
                </span>
              </div>
            </article>

            <article className="home-stat-card stat-green">
              <span className="home-stat-icon">
                <Flame size={21} />
              </span>

              <div>
                <span className="home-stat-label">Learning streak</span>
                <strong>
                  {streak} <small>days</small>
                </strong>
                <span className="home-stat-caption">
                  Build a little habit daily
                </span>
              </div>
            </article>

            <article className="home-stat-card stat-purple">
              <span className="home-stat-icon">
                <Target size={21} />
              </span>

              <div>
                <span className="home-stat-label">Course progress</span>
                <strong>
                  {progress}
                  <small>%</small>
                </strong>
                <span className="home-stat-caption">
                  Keep moving forward
                </span>
              </div>
            </article>
          </section>

          {/* Resume last-viewed module */}
          <section
            className="home-continue-section"
            aria-labelledby="home-continue-title"
          >
            <SectionHeading
              eyebrow="PICK UP WHERE YOU LEFT OFF"
              title="Continue learning"
              description="Jump straight back into the module you last visited."
            />

            {resumeLesson ? (
              <article className="home-continue-card">
                <div className="home-continue-icon" aria-hidden="true">
                  <Play size={27} fill="currentColor" />
                </div>

                <div className="home-continue-details">
                  <span className="home-continue-course">
                    <BookOpen size={14} />
                    Python Foundations
                  </span>

                  <h3 id="home-continue-title">
                    {resumeLesson.title}
                  </h3>

                  <p>
                    {resumeLesson.description ||
                      "Continue your learning journey from where you left off."}
                  </p>

                  <div className="home-course-meta">
                    <span>
                      <Clock3 size={15} />
                      {getLessonDuration(resumeLesson)}
                    </span>

                    <span>
                      <Sparkles size={15} />
                      {completedSet.has(Number(resumeLesson.id))
                        ? "Completed · available to review"
                        : "Continue your progress"}
                    </span>
                  </div>
                </div>

                <Link
                  className="home-button home-button-primary home-continue-button"
                  to={resumeLesson.resumePath}
                >
                  {completedSet.has(Number(resumeLesson.id))
                    ? "Review module"
                    : "Resume module"}
                  <ArrowRight size={17} />
                </Link>
              </article>
            ) : (
              <article className="home-continue-card home-continue-empty">
                <div className="home-continue-icon" aria-hidden="true">
                  <BookOpen size={27} />
                </div>

                <div className="home-continue-details">
                  <h3 id="home-continue-title">
                    Ready for your first adventure?
                  </h3>

                  <p>
                    Open a course to begin learning. Your recently viewed
                    module will appear here next time.
                  </p>
                </div>

                <Link
                  className="home-button home-button-primary home-continue-button"
                  to={STUDY_MAP_LINK}
                >
                  Start learning
                  <ArrowRight size={17} />
                </Link>
              </article>
            )}
          </section>

          {/* Registered courses only — no individual lesson list */}
          <section
            className="home-courses-section"
            aria-labelledby="home-courses-title"
          >
            <SectionHeading
              eyebrow="YOUR LEARNING LIBRARY"
              title="Your courses"
              description="All your registered courses, ready when you are."
            />

            {registeredCourses.length > 0 ? (
              <div className="home-registered-courses">
                {registeredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    completedCount={
                      course.id === COURSE_ID ? completedLessons : 0
                    }
                    totalCount={
                      course.id === COURSE_ID ? totalLessons : 0
                    }
                  />
                ))}
              </div>
            ) : (
              <article className="home-continue-card home-continue-empty">
                <div className="home-continue-icon" aria-hidden="true">
                  <GraduationCap size={27} />
                </div>

                <div className="home-continue-details">
                  <h3 id="home-courses-title">No courses yet</h3>
                  <p>
                    Explore the available learning paths and register for
                    a course to see it here.
                  </p>
                </div>

                <Link
                  className="home-button home-button-primary"
                  to="/courses"
                >
                  Explore courses
                  <ArrowRight size={17} />
                </Link>
              </article>
            )}
          </section>

          {/* Encouragement banner */}
          <section className="home-start-banner" id="start-here">
            <div className="home-start-art" aria-hidden="true">
              <Companion />
              <span className="home-start-star star-left">✦</span>
              <span className="home-start-star star-right">✧</span>
            </div>

            <div className="home-start-copy">
              <span className="home-eyebrow">YOUR NEXT LITTLE WIN</span>

              <h2>
                Small steps lead to brilliant things.
              </h2>

              <p>
                Keep exploring, practising, and building skills at your own
                pace.
              </p>
            </div>

            <Link
              className="home-button home-button-primary"
              to={resumeLesson?.resumePath || STUDY_MAP_LINK}
            >
              {resumeLesson ? "Continue learning" : "Explore learning paths"}
              <ArrowRight size={17} />
            </Link>
          </section>

          <footer className="home-footer">
            <Link className="home-footer-brand" to="/dashboard">
              <span className="home-footer-symbol">✦</span>
              EVOLV<span className="home-brand-dot">.</span>
            </Link>

            <span>Learn. Build. Grow. Keep becoming.</span>

            <a href="#home" className="home-back-top">
              Back to top ↑
            </a>
          </footer>
        </div>
      </main>

      <Rightbar />
    </div>
  );
}