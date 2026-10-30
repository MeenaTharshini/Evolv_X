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

import EvolvLoader from "../components/EvolvLoader";
import Navbar from "../components/Navbar";
import Rightbar from "../components/Rightbar";

import { pythonLessons } from "../data/pythonLessons";
import { supabase } from "../lib/supabaseClient";
import { getStreak } from "../services/api";
import { getLessonDatabaseMap } from "../services/stageProgressService";

import "../styles/home.css";

const COURSE_SLUG = "python";
const STUDY_MAP_LINK = `/study/${COURSE_SLUG}`;

const COURSE_CATALOG = [
  {
    id: "python",
    slug: "python",
    title: "Python Foundations",
    description:
      "Build your programming foundation, practise core concepts, and create useful programs.",
    level: "Beginner",
    icon: "🐍",
    color: "blue",
    duration: "Self-paced",
  },
];

const INITIAL_STATE = {
  loading: true,
  error: "",
  userId: null,
  firstName: "Learner",
  completedIds: [],
  xp: 0,
  streak: 0,
  lastViewed: null,
  registeredCourseIds: [],
};

function getLessonDuration(lesson) {
  if (lesson?.duration) return lesson.duration;

  const duration = Number(lesson?.duration_minutes);

  if (Number.isFinite(duration) && duration > 0) {
    return `${duration} min`;
  }

  return Number(lesson?.id) === 1 ? "5 min" : "6 min";
}

function getNextIncompleteLesson(completedIds) {
  const completed = new Set(completedIds);

  return pythonLessons.find(
    (lesson) => !completed.has(Number(lesson.id))
  );
}

function getLastViewedLesson(lastViewed, completedIds) {
  if (!lastViewed) return null;

  const lessonId = Number(lastViewed.lessonId);

  const lesson = pythonLessons.find(
    (item) => Number(item.id) === lessonId
  );

  if (!lesson) return null;

  return {
    ...lesson,
    isCompleted: completedIds.includes(Number(lesson.id)),
  };
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
        <span
          className="home-registered-course-icon"
          aria-hidden="true"
        >
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
        className="home-button home-button-primary"
        to={STUDY_MAP_LINK}
      >
        {completedCount > 0 ? "Continue learning" : "Explore courses"}
        <ArrowRight size={17} />
      </Link>
    </article>
  );
}

function LoadingState() {
  return <EvolvLoader />;
}

function ErrorState({ message, onRetry }) {
  return (
    <section className="home-continue-card" role="alert">
      <div className="home-continue-details">
        <h2>We couldn't load your learning data.</h2>
        <p>{message}</p>

        <button
          type="button"
          className="home-button home-button-primary"
          onClick={onRetry}
        >
          Try again
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}

export default function Home() {
  const [dashboard, setDashboard] = useState(INITIAL_STATE);

  const loadDashboard = useCallback(async () => {
    setDashboard((previous) => ({
      ...previous,
      loading: true,
      error: "",
    }));

    try {
      // Identify the authenticated Supabase user.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setDashboard({
          ...INITIAL_STATE,
          loading: false,
          error: "Your session has expired. Please log in again.",
        });

        return;
      }

      // Load the current user's profile.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, interests")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Fetch the user's progress, statistics, enrollments, streak and lesson map.
      const [
        progressResult,
        statsResult,
        enrollmentResult,
        streakResult,
        lessonMapResult,
      ] = await Promise.all([
        supabase
          .from("lesson_progress")
          .select(
            "lesson_id, status, xp_earned, completed_at, updated_at"
          )
          .eq("user_id", user.id),

        supabase
          .from("user_stats")
          .select("total_xp, current_streak, longest_streak")
          .eq("user_id", user.id)
          .maybeSingle(),

        supabase
          .from("enrollments")
          .select("course_id, courses(id, slug, title)")
          .eq("user_id", user.id),

        getStreak().catch((error) => {
          console.warn("Could not retrieve the streak API:", error);
          return null;
        }),

        getLessonDatabaseMap(),
      ]);

      if (progressResult.error) throw progressResult.error;
      if (statsResult.error) throw statsResult.error;
      if (enrollmentResult.error) throw enrollmentResult.error;

      const progressRows = progressResult.data || [];
      const stats = statsResult.data || {};

      // The mapping service should return { dbToFrontend: Map }.
      const dbToFrontend =
        lessonMapResult?.dbToFrontend instanceof Map
          ? lessonMapResult.dbToFrontend
          : new Map();

      // Frontend curriculum lesson IDs.
      const validLessonIds = new Set(
        pythonLessons.map((lesson) => Number(lesson.id))
      );

      const completedIds = new Set();
      let calculatedProgressXP = 0;

      for (const row of progressRows) {
        const dbId = Number(row.lesson_id);

        // Prefer the explicit database-to-frontend mapping.
        const mappedId = dbToFrontend.get(dbId);
        const frontendId =
          mappedId != null
            ? Number(mappedId)
            : validLessonIds.has(dbId)
              ? dbId
              : null;

        if (
          !Number.isSafeInteger(frontendId) ||
          !validLessonIds.has(frontendId)
        ) {
          continue;
        }

        calculatedProgressXP += Math.max(
          0,
          Number(row.xp_earned) || 0
        );

        if (String(row.status).toLowerCase() === "completed") {
          completedIds.add(frontendId);
        }
      }

      const completedLessonIds = [...completedIds];

      // Use the strongest available XP total.
      const storedXp = Number(stats.total_xp);

      const backendStreakXp = Number(
        streakResult?.totalXP ?? streakResult?.totalXp
      );

      const xp = Math.max(
        Number.isFinite(storedXp) && storedXp > 0 ? storedXp : 0,
        Number.isFinite(backendStreakXp) && backendStreakXp > 0
          ? backendStreakXp
          : 0,
        calculatedProgressXP
      );

      const backendStreak = Number(
        streakResult?.currentStreak ?? stats.current_streak ?? 0
      );

      const streak =
        Number.isFinite(backendStreak) && backendStreak >= 0
          ? backendStreak
          : 0;

      // Find the most recently updated lesson in this user's database records.
      const mostRecentRow = [...progressRows].sort((a, b) => {
        const dateA = new Date(
          a.updated_at || a.completed_at || 0
        ).getTime();

        const dateB = new Date(
          b.updated_at || b.completed_at || 0
        ).getTime();

        return dateB - dateA;
      })[0];

      let lastViewed = null;

      if (mostRecentRow) {
        const dbId = Number(mostRecentRow.lesson_id);
        const mappedId = dbToFrontend.get(dbId);

        const frontendId =
          mappedId != null
            ? Number(mappedId)
            : validLessonIds.has(dbId)
              ? dbId
              : null;

        if (
          Number.isSafeInteger(frontendId) &&
          validLessonIds.has(frontendId)
        ) {
          lastViewed = { lessonId: frontendId };
        }
      }

      // Use the last-viewed value only as a fallback when no database record exists.
      if (!lastViewed && typeof window !== "undefined") {
        try {
          const rawLast = localStorage.getItem(
            `evolv_${COURSE_SLUG}_last_viewed`
          );

          if (rawLast) {
            const parsed = JSON.parse(rawLast);
            const lessonId = Number(parsed?.lessonId);

            if (
              Number.isSafeInteger(lessonId) &&
              validLessonIds.has(lessonId)
            ) {
              lastViewed = { lessonId };
            }
          }
        } catch {
          // Ignore malformed local storage.
        }
      }

      // Normalize the current user's enrolled course IDs.
      const registeredCourseIds = [
        ...new Set(
          (enrollmentResult.data || [])
            .map((enrollment) => {
              const course = Array.isArray(enrollment.courses)
                ? enrollment.courses[0]
                : enrollment.courses;

              return String(
                course?.slug ||
                  course?.id ||
                  enrollment.course_id ||
                  ""
              ).toLowerCase();
            })
            .filter(Boolean)
        ),
      ];

      const fullName =
        profile?.full_name?.trim() ||
        user.user_metadata?.full_name?.trim() ||
        user.user_metadata?.name?.trim() ||
        user.email?.split("@")[0] ||
        "Learner";

      setDashboard({
        loading: false,
        error: "",
        userId: user.id,
        firstName: fullName.split(/\s+/)[0],
        completedIds: completedLessonIds,
        xp,
        streak,
        lastViewed,
        registeredCourseIds,
      });
    } catch (error) {
      console.error("Failed to load the EVOLV dashboard:", error);

      setDashboard((previous) => ({
        ...previous,
        loading: false,
        error:
          error?.message ||
          "An unexpected error occurred while loading your dashboard.",
      }));
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initialLoad = async () => {
      if (active) {
        await loadDashboard();
      }
    };

    initialLoad();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        active &&
        [
          "SIGNED_IN",
          "SIGNED_OUT",
          "USER_UPDATED",
          "TOKEN_REFRESHED",
        ].includes(event)
      ) {
        // Defer database calls until after the auth callback.
        setTimeout(() => {
          if (active) loadDashboard();
        }, 0);
      }
    });

    const handleProgressUpdated = () => {
      if (active) loadDashboard();
    };

    const handleVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        active
      ) {
        loadDashboard();
      }
    };

    window.addEventListener(
      "evolv:progress-updated",
      handleProgressUpdated
    );

    window.addEventListener(
      "evolv-progress-updated",
      handleProgressUpdated
    );

    window.addEventListener(
      "evolv:streak-updated",
      handleProgressUpdated
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      active = false;
      subscription.unsubscribe();

      window.removeEventListener(
        "evolv:progress-updated",
        handleProgressUpdated
      );

      window.removeEventListener(
        "evolv-progress-updated",
        handleProgressUpdated
      );

      window.removeEventListener(
        "evolv:streak-updated",
        handleProgressUpdated
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [loadDashboard]);

  const completedIds = dashboard.completedIds;

  const completedLessons = completedIds.length;
  const totalLessons = pythonLessons.length;

  const progress = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  const nextLesson = getNextIncompleteLesson(completedIds);

  const viewedLesson = getLastViewedLesson(
    dashboard.lastViewed,
    completedIds
  );

  const resumeLesson =
    viewedLesson ||
    (nextLesson
      ? {
          ...nextLesson,
          isCompleted: false,
        }
      : null);

  const registeredCourses = useMemo(() => {
    const enrolledIds = new Set(dashboard.registeredCourseIds);

    const filtered = COURSE_CATALOG.filter(
      (course) =>
        enrolledIds.has(course.id) ||
        enrolledIds.has(course.slug)
    );

    // Keep Python available as the primary course even before enrollment.
    return filtered.length > 0 ? filtered : COURSE_CATALOG;
  }, [dashboard.registeredCourseIds]);

  const firstName = dashboard.firstName || "Learner";

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

        {dashboard.loading ? (
          <LoadingState />
        ) : dashboard.error ? (
          <div className="home-container">
            <ErrorState
              message={dashboard.error}
              onRetry={loadDashboard}
            />
          </div>
        ) : (
          <div className="home-container">
            {/* Welcome section */}
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
                    className="home-button home-button-primary home-continue-button"
                    to={STUDY_MAP_LINK}
                  >
                    {resumeLesson?.isCompleted
                      ? "Review module"
                      : "Resume module"}
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
                  <span>{dashboard.xp} XP earned</span>
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
                  <span className="home-stat-label">
                    Lessons completed
                  </span>

                  <strong>
                    {completedLessons}
                    <small> / {totalLessons}</small>
                  </strong>

                  <span className="home-stat-caption">
                    Every step counts!
                  </span>
                </div>
              </article>

              <article className="home-stat-card stat-blue">
                <span className="home-stat-icon">
                  <Trophy size={21} />
                </span>

                <div>
                  <span className="home-stat-label">
                    Experience points
                  </span>

                  <strong>
                    {dashboard.xp} <small>XP</small>
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
                  <span className="home-stat-label">
                    Learning streak
                  </span>

                  <strong>
                    {dashboard.streak} <small>days</small>
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
                  <span className="home-stat-label">
                    Course progress
                  </span>

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

            {/* Continue learning */}
            <section
              className="home-continue-section"
              aria-labelledby="home-continue-title"
            >
              <SectionHeading
                eyebrow="PICK UP WHERE YOU LEFT OFF"
                title="Continue learning"
                description="Jump back into your learning path."
              />

              {resumeLesson ? (
                <article className="home-continue-card">
                  <div
                    className="home-continue-icon"
                    aria-hidden="true"
                  >
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
                        {resumeLesson.isCompleted
                          ? "Completed · available to review"
                          : "Continue your progress"}
                      </span>
                    </div>
                  </div>

                  <Link
                    className="home-button home-button-primary"
                    to={STUDY_MAP_LINK}
                  >
                    Continue learning
                    <ArrowRight size={17} />
                  </Link>
                </article>
              ) : (
                <article className="home-continue-card home-continue-empty">
                  <div
                    className="home-continue-icon"
                    aria-hidden="true"
                  >
                    <BookOpen size={27} />
                  </div>

                  <div className="home-continue-details">
                    <h3 id="home-continue-title">
                      You have completed this learning path!
                    </h3>

                    <p>
                      Explore another learning opportunity or revisit
                      completed lessons.
                    </p>
                  </div>

                  <Link
                    className="home-button home-button-primary"
                    to={STUDY_MAP_LINK}
                  >
                    Review learning path
                    <ArrowRight size={17} />
                  </Link>
                </article>
              )}
            </section>

            {/* Registered courses */}
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
                        course.id === COURSE_SLUG
                          ? completedLessons
                          : 0
                      }
                      totalCount={
                        course.id === COURSE_SLUG
                          ? totalLessons
                          : 0
                      }
                    />
                  ))}
                </div>
              ) : (
                <article className="home-continue-card home-continue-empty">
                  <div
                    className="home-continue-icon"
                    aria-hidden="true"
                  >
                    <GraduationCap size={27} />
                  </div>

                  <div className="home-continue-details">
                    <h3 id="home-courses-title">No courses yet</h3>

                    <p>
                      Explore available learning paths and enroll in a
                      course to see it here.
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

            {/* Bottom call to action */}
            <section className="home-start-banner" id="start-here">
              <div className="home-start-art" aria-hidden="true">
                <Companion />
                <span className="home-start-star star-left">✦</span>
                <span className="home-start-star star-right">✧</span>
              </div>

              <div className="home-start-copy">
                <span className="home-eyebrow">
                  YOUR NEXT LITTLE WIN
                </span>

                <h2>Small steps lead to brilliant things.</h2>

                <p>
                  Keep exploring, practising, and building skills at your
                  own pace.
                </p>
              </div>

              <Link
                className="home-button home-button-primary"
                to={STUDY_MAP_LINK}
              >
                Continue learning
                <ArrowRight size={17} />
              </Link>
            </section>

            {/* Footer */}
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
        )}
      </main>

      <Rightbar />
    </div>
  );
}