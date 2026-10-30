// src/pages/LessonPage.jsx

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Flame,
  Heart,
  House,
  Lightbulb,
  Play,
  RotateCcw,
  Terminal,
  Trophy,
  Video,
  Volume2,
  Zap,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  getLearningDashboard,
  getLessonStageProgress,
  saveStageCompletion,
} from "../lib/progressService";
import EvolvLoader from "../components/EvolvLoader";
import { recordLearningActivity } from "../services/api";

import { coursePaths } from "../data/coursePaths";

import {
  pythonLessons,
  getPythonLesson,
} from "../data/pythonLessons";

import TopicCompletionModal from "../components/EVO/TopicCompletionModal";

import "../styles/LessonPage.css";

// ==================================================
// CONFIGURATION
// ==================================================

const DEFAULT_COURSE = "python";
const STARTING_HEARTS = 3;
const DEFAULT_COMPLETION_XP = 20;

const STAGES = ["video", "concept", "hands-on", "quiz"];

const STAGE_LABELS = {
  video: "Video",
  concept: "Concept",
  "hands-on": "Hands-on",
  quiz: "Quiz",
};

const STAGE_ICONS = {
  video: Video,
  concept: BookOpen,
  "hands-on": Code2,
  quiz: Trophy,
};

const xpKey = (courseId) => `evolv_${courseId}_xp`;
const heartsKey = (courseId) => `evolv_${courseId}_hearts`;
const quizScoreKey = (courseId) =>
  `evolv_${courseId}_quiz_scores`;
const streakKey = (courseId) =>
  `evolv_${courseId}_streak`;

const emptyStageProgress = () => ({
  video: {},
  concept: {},
  "hands-on": {},
  quiz: {},
});

// ==================================================
// LOCAL STORAGE HELPERS
// ==================================================

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    return value === null
      ? fallback
      : JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}

function readNumber(key, fallback = 0) {
  try {
    const value = localStorage.getItem(key);

    if (value === null || value.trim() === "") {
      return fallback;
    }

    const number = Number(value);

    return Number.isFinite(number) && number >= 0
      ? number
      : fallback;
  } catch {
    return fallback;
  }
}

function readObject(key) {
  const value = readJSON(key, {});

  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? value
    : {};
}

function notifyProgressUpdated() {
  window.dispatchEvent(
    new Event("evolv-progress-updated")
  );
}

// ==================================================
// NORMALIZATION
// ==================================================

function normalizeStage(stage) {
  const value = String(stage ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (
    value === "hands_on" ||
    value === "coding" ||
    value === "practice"
  ) {
    return "hands-on";
  }

  return ["video", "concept", "quiz"].includes(value)
    ? value
    : null;
}

function normalizeStreakResponse(response) {
  const data = response?.data ?? response ?? {};

  const currentStreak = Number(
    data.currentStreak ??
      data.current_streak ??
      0
  );

  return {
    currentStreak:
      Number.isFinite(currentStreak) &&
      currentStreak >= 0
        ? currentStreak
        : 0,

    activeToday:
      typeof data.activeToday === "boolean"
        ? data.activeToday
        : typeof data.active_today === "boolean"
          ? data.active_today
          : false,
  };
}

// ==================================================
// QUIZ HELPERS
// ==================================================

function getQuestions(lesson) {
  if (
    Array.isArray(lesson?.quizQuestions) &&
    lesson.quizQuestions.length > 0
  ) {
    return lesson.quizQuestions.slice(0, 5);
  }

  if (
    lesson?.question &&
    Array.isArray(lesson.options) &&
    lesson.options.length > 1
  ) {
    return [
      {
        question: lesson.question,
        options: lesson.options,
        answer: lesson.answer,
        explanation: lesson.explanation,
      },
    ];
  }

  return [];
}

function isValidQuestion(question) {
  return Boolean(
    question &&
      typeof question.question === "string" &&
      question.question.trim() &&
      Array.isArray(question.options) &&
      question.options.length > 1 &&
      question.options.every(
        (option) =>
          typeof option === "string" &&
          option.trim()
      ) &&
      Number.isInteger(Number(question.answer)) &&
      Number(question.answer) >= 0 &&
      Number(question.answer) < question.options.length
  );
}

// ==================================================
// PRACTICE HELPERS
// ==================================================

function getPractice(lesson) {
  return {
    title:
      lesson?.practice?.title ||
      `Practice: ${lesson?.title || "Python"}`,

    prompt:
      lesson?.practice?.prompt ||
      lesson?.instructions ||
      lesson?.description ||
      "Complete the coding task.",

    starterCode:
      lesson?.practice?.starterCode ??
      lesson?.starterCode ??
      lesson?.example ??
      'print("Hello, EVOLV!")',

    hint:
      lesson?.practice?.hint ||
      lesson?.hint ||
      "",
  };
}

/*
 * This is a limited preview, not a Python interpreter.
 */
function previewSimplePrint(code) {
  const output = [];

  for (const rawLine of String(code).split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(
      /^print\s*\(\s*(?:"([^"]*)"|'([^']*)'|(-?\d+(?:\.\d+)?))\s*\)\s*(?:#.*)?$/
    );

    if (!match) {
      return {
        output: output.join("\n"),
        message:
          "This preview supports simple print() statements only. It does not execute full Python.",
      };
    }

    output.push(
      match[1] ?? match[2] ?? match[3]
    );
  }

  return {
    output: output.join("\n"),
    message:
      "Preview only. This is not output from a full Python interpreter.",
  };
}

// ==================================================
// SUPABASE STAGE PROGRESS
// ==================================================

/*
 * Expected records:
 * {
 *   stage: "video" | "concept" | "hands-on" | "quiz",
 *   completed: true,
 *   completed_at: "..."
 * }
 *
 * Stage names are normalized so "hands_on" and "hands-on"
 * are treated as the same stage.
 */
function buildStageProgress(records, lessonId) {
  const progress = emptyStageProgress();

  for (const record of records ?? []) {
    const stage = normalizeStage(record.stage);

    if (!stage) {
      continue;
    }

    const completed =
      record.completed === true ||
      record.completed === 1 ||
      record.completed === "true";

    if (!completed) {
      continue;
    }

    progress[stage][String(lessonId)] = {
      completed: true,
      completedAt: record.completed_at ?? null,
    };
  }

  return progress;
}

function isStageComplete(progress, lessonId, stage) {
  const normalizedStage = normalizeStage(stage);

  if (!normalizedStage) {
    return false;
  }

  return Boolean(
    progress?.[normalizedStage]?.[
      String(lessonId)
    ]?.completed
  );
}

function getCompletedStages(progress, lessonId) {
  return STAGES.filter((stage) =>
    isStageComplete(progress, lessonId, stage)
  );
}

function isTopicComplete(progress, lessonId) {
  return STAGES.every((stage) =>
    isStageComplete(progress, lessonId, stage)
  );
}

function isStageUnlocked(progress, lessonId, stage) {
  const normalizedStage = normalizeStage(stage);
  const index = STAGES.indexOf(normalizedStage);

  if (index < 0) {
    return false;
  }

  if (index === 0) {
    return true;
  }

  return STAGES.slice(0, index).every(
    (previousStage) =>
      isStageComplete(
        progress,
        lessonId,
        previousStage
      )
  );
}

function getNextIncompleteStage(progress, lessonId) {
  return (
    STAGES.find(
      (stage) =>
        !isStageComplete(
          progress,
          lessonId,
          stage
        )
    ) ?? null
  );
}

// ==================================================
// REUSABLE UI
// ==================================================

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="lesson-section-heading">
      <span className="lesson-section-icon">
        <Icon size={22} />
      </span>

      <div>
        {eyebrow && (
          <span className="lesson-eyebrow">
            {eyebrow}
          </span>
        )}

        <h2>{title}</h2>

        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

// ==================================================
// LESSON PAGE
// ==================================================

export default function LessonPage() {
  const {
    courseId = DEFAULT_COURSE,
    lessonId,
  } = useParams();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const requestedStage = searchParams.get("stage");
  const type = normalizeStage(requestedStage) ?? "video";

  const course =
    coursePaths?.[courseId] ??
    (courseId === DEFAULT_COURSE
      ? {
          title: "Python journey",
          language: "Python",
          icon: "🐍",
          color: "green",
        }
      : null);

  const lessons = useMemo(() => {
    if (courseId === DEFAULT_COURSE) {
      return pythonLessons;
    }

    return course?.lessons ?? [];
  }, [courseId, course]);

  const lesson = useMemo(() => {
    if (courseId === DEFAULT_COURSE) {
      return getPythonLesson(lessonId);
    }

    return (
      lessons.find(
        (item) =>
          String(item.id) === String(lessonId)
      ) ?? null
    );
  }, [courseId, lessonId, lessons]);

  const lessonIndex = lessons.findIndex(
    (item) =>
      String(item.id) === String(lesson?.id)
  );

  const nextLesson =
    lessonIndex >= 0
      ? lessons[lessonIndex + 1] ?? null
      : null;

  const lessonKey = `${courseId}_${lessonId}`;

  // ------------------------------------------------
  // State
  // ------------------------------------------------

  const [stageProgress, setStageProgress] = useState(
    emptyStageProgress
  );

  const [progressLoading, setProgressLoading] =
    useState(true);

  const [progressError, setProgressError] =
    useState("");

  const [savingStage, setSavingStage] =
    useState(false);

  const [xp, setXp] = useState(() =>
    readNumber(xpKey(courseId))
  );

  const [hearts] = useState(() =>
    readNumber(
      heartsKey(courseId),
      STARTING_HEARTS
    )
  );

  const [quizScores, setQuizScores] = useState(() =>
    readObject(quizScoreKey(courseId))
  );

  const [videoFinished, setVideoFinished] =
    useState(false);

  const [practiceCode, setPracticeCode] =
    useState("");

  const [practiceOutput, setPracticeOutput] =
    useState(null);

  const [practiceMessage, setPracticeMessage] =
    useState("");

  const [taskChecked, setTaskChecked] =
    useState(false);

  const [showHint, setShowHint] =
    useState(false);

  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] =
    useState(false);

  const [currentScore, setCurrentScore] =
    useState(null);

  const [
    showCompletionModal,
    setShowCompletionModal,
  ] = useState(false);

  const [topicEarnedXP, setTopicEarnedXP] =
    useState(0);

  const [completionTotalXP, setCompletionTotalXP] =
    useState(0);

  const [
    completionContinueTo,
    setCompletionContinueTo,
  ] = useState("");

  const [currentStreak, setCurrentStreak] =
    useState(() =>
      readNumber(streakKey(courseId))
    );

  const [activeToday, setActiveToday] =
    useState(false);

  const [streakLoading, setStreakLoading] =
    useState(false);

  const [streakError, setStreakError] =
    useState("");

  const [saveError, setSaveError] =
    useState("");

  const practice = lesson
    ? getPractice(lesson)
    : null;

  const questions = lesson
    ? getQuestions(lesson)
    : [];

  // ------------------------------------------------
  // Derived progress
  // ------------------------------------------------

  const completedStages = lesson
    ? getCompletedStages(
        stageProgress,
        lesson.id
      )
    : [];

  const currentStageCompleted = lesson
    ? isStageComplete(
        stageProgress,
        lesson.id,
        type
      )
    : false;

  const currentStageUnlocked = lesson
    ? isStageUnlocked(
        stageProgress,
        lesson.id,
        type
      )
    : false;

  const nextRequiredStage = lesson
    ? getNextIncompleteStage(
        stageProgress,
        lesson.id
      ) ?? "video"
    : "video";

  const topicCompleted = lesson
    ? isTopicComplete(
        stageProgress,
        lesson.id
      )
    : false;

  const completedCount = lessons.filter(
    (item) =>
      isTopicComplete(
        stageProgress,
        item.id
      )
  ).length;

  const courseProgress = lessons.length
    ? Math.round(
        (completedCount / lessons.length) * 100
      )
    : 0;

  const savedQuiz = quizScores[lessonKey];

  // ------------------------------------------------
  // Navigation
  // ------------------------------------------------

  const continueInfo = useMemo(() => {
    if (!lesson) {
      return {
        to: `/study/${courseId}`,
        label: "Back to Study Map",
      };
    }

    const nextStage = getNextIncompleteStage(
      stageProgress,
      lesson.id
    );

    if (nextStage) {
      return {
        to: `/study/${courseId}/lesson/${lesson.id}?stage=${nextStage}`,
        label: `Continue to ${STAGE_LABELS[nextStage]}`,
      };
    }

    if (nextLesson) {
      return {
        to: `/study/${courseId}/lesson/${nextLesson.id}?stage=video`,
        label: "Continue to next topic",
      };
    }

    return {
      to: `/study/${courseId}`,
      label: "Back to Study Map",
    };
  }, [
    courseId,
    lesson,
    nextLesson,
    stageProgress,
  ]);

  // ------------------------------------------------
  // Load and refresh stage progress
  // ------------------------------------------------

  const refreshProgress = useCallback(
    async ({ showLoader = false } = {}) => {
      if (!lesson) {
        setStageProgress(emptyStageProgress());
        setProgressError("");
        setProgressLoading(false);
        return;
      }

      // Only initial loading or a manual retry shows
      // the full-screen loader.
      if (showLoader) {
        setProgressLoading(true);
      }

      setProgressError("");

      try {
        const records = await getLessonStageProgress(
          lesson.id
        );

        setStageProgress(
          buildStageProgress(records, lesson.id)
        );

        // Refresh local summaries without a full-page loader.
        setQuizScores(readObject(quizScoreKey(courseId)));
        setXp(readNumber(xpKey(courseId)));
        setCurrentStreak(readNumber(streakKey(courseId)));
      } catch (error) {
        console.error(
          "Could not refresh lesson progress:",
          error
        );

        setProgressError(
          error?.message ||
            "Could not refresh your learning progress. Please try again."
        );
      } finally {
        if (showLoader) {
          setProgressLoading(false);
        }
      }
    },
    [courseId, lesson]
  );

  // Initial load for the current lesson.
  useEffect(() => {
    let cancelled = false;

    async function loadInitialProgress() {
      if (!lesson) {
        setStageProgress(emptyStageProgress());
        setProgressError("");
        setProgressLoading(false);
        return;
      }

      setProgressLoading(true);
      setProgressError("");

      try {
        const records = await getLessonStageProgress(
          lesson.id
        );

        if (cancelled) return;

        setStageProgress(
          buildStageProgress(records, lesson.id)
        );
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Could not load stage progress:",
          error
        );

        setProgressError(
          error?.message ||
            "Could not load your progress. Please try again."
        );
      } finally {
        if (!cancelled) {
          setProgressLoading(false);
        }
      }
    }

    void loadInitialProgress();

    return () => {
      cancelled = true;
    };
  }, [lesson]);

  // Background progress updates must not show the loader.
  // Listen to one event only to prevent duplicate refreshes.
  useEffect(() => {
    const handleProgressUpdate = () => {
      void refreshProgress({ showLoader: false });
    };

    window.addEventListener(
      "evolv-progress-updated",
      handleProgressUpdate
    );

    return () => {
      window.removeEventListener(
        "evolv-progress-updated",
        handleProgressUpdate
      );
    };
  }, [refreshProgress]);
  // ------------------------------------------------
  // Load XP and streak
  // ------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const dashboard =
          await getLearningDashboard();

        if (cancelled) {
          return;
        }

        const totalXP = Number(
          dashboard?.totalXP ?? 0
        );

        const streak = Number(
          dashboard?.currentStreak ?? 0
        );

        if (
          Number.isFinite(totalXP) &&
          totalXP >= 0
        ) {
          setXp(totalXP);

          localStorage.setItem(
            xpKey(courseId),
            String(totalXP)
          );
        }

        if (
          Number.isFinite(streak) &&
          streak >= 0
        ) {
          setCurrentStreak(streak);

          localStorage.setItem(
            streakKey(courseId),
            String(streak)
          );
        }
      } catch (error) {
        console.error(
          "Could not load dashboard statistics:",
          error
        );
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // ------------------------------------------------
  // Reset temporary state when the lesson or stage
  // changes
  // ------------------------------------------------

  useEffect(() => {
    setVideoFinished(false);

    setPracticeCode(
      lesson
        ? getPractice(lesson).starterCode
        : ""
    );

    setPracticeOutput(null);
    setPracticeMessage("");
    setTaskChecked(false);
    setShowHint(false);
    setAnswers({});
    setQuizSubmitted(false);
    setCurrentScore(null);
    setStreakError("");
    setSaveError("");
    setShowCompletionModal(false);
  }, [
    courseId,
    lessonId,
    lesson,
    requestedStage,
  ]);

  // ------------------------------------------------
  // Save last viewed stage
  // ------------------------------------------------

  useEffect(() => {
    if (!lesson) {
      return;
    }

    const destination =
      `/study/${courseId}/lesson/${lesson.id}?stage=${type}`;

    try {
      localStorage.setItem(
        `evolv_${courseId}_last_viewed`,
        JSON.stringify({
          lessonId: lesson.id,
          stage: type,
          destination,
        })
      );
    } catch (error) {
      console.error(
        "Could not save last-viewed stage:",
        error
      );
    }
  }, [courseId, lesson, type]);

  // ------------------------------------------------
  // Video
  // ------------------------------------------------

  function finishVideo() {
    setVideoFinished(true);
  }

  // ------------------------------------------------
  // Practice
  // ------------------------------------------------

  function runPractice() {
    if (!practiceCode.trim()) {
      setPracticeOutput("");
      setPracticeMessage(
        "Enter some code first."
      );
      return;
    }

    const result =
      previewSimplePrint(practiceCode);

    setPracticeOutput(result.output);
    setPracticeMessage(result.message);
  }

  function markPracticeReviewed() {
    if (!practiceCode.trim()) {
      setPracticeMessage(
        "Write some code before marking this task reviewed."
      );
      return;
    }

    setTaskChecked(true);

    setPracticeMessage(
      "Practice marked as reviewed. The preview is not a full Python execution environment."
    );
  }

  // ------------------------------------------------
  // Quiz
  // ------------------------------------------------

  function submitQuiz(event) {
    event.preventDefault();

    const validQuestions =
      questions.length > 0 &&
      questions.every(isValidQuestion);

    const allAnswered = questions.every(
      (_, index) =>
        answers[index] !== undefined &&
        answers[index] !== null &&
        answers[index] !== ""
    );

    if (!validQuestions || !allAnswered) {
      return;
    }

    const score = questions.reduce(
      (total, question, index) =>
        total +
        (
          Number(answers[index]) ===
          Number(question.answer)
            ? 1
            : 0
        ),
      0
    );

    const prevScores = readObject(quizScoreKey(courseId));
    const existing = prevScores[lessonKey] || prevScores[String(lesson.id)] || {};
    const attempts = (Number(existing.attempts) || 0) + 1;

    const result = {
      score,
      maxScore: questions.length,
      attempts,
      latestScore: score,
      submittedAt: new Date().toISOString(),
    };

    const updatedScores = {
      ...prevScores,
      [lessonKey]: result,
      [String(lesson.id)]: result,
    };

    try {
      localStorage.setItem(
        quizScoreKey(courseId),
        JSON.stringify(updatedScores)
      );

      setQuizScores(updatedScores);
      setCurrentScore(result);
      setQuizSubmitted(true);

      notifyProgressUpdated();
    } catch (error) {
      console.error(
        "Could not save quiz score:",
        error
      );

      setSaveError(
        "Your quiz result could not be saved locally."
      );
    }
  }

  function restartQuiz() {
    setAnswers({});
    setQuizSubmitted(false);
    setCurrentScore(null);
  }

  // ------------------------------------------------
  // Completion eligibility
  // ------------------------------------------------

  function canCompleteStage() {
    if (
      !lesson ||
      currentStageCompleted ||
      !currentStageUnlocked
    ) {
      return false;
    }

    if (type === "video") {
      return videoFinished;
    }

    if (type === "concept") {
      return true;
    }

    if (type === "hands-on") {
      return taskChecked;
    }

    if (type === "quiz") {
      return (
        questions.length > 0 &&
        questions.every(isValidQuestion) &&
        quizSubmitted
      );
    }

    return false;
  }

  // ------------------------------------------------
  // Record learning activity
  // ------------------------------------------------

  async function recordStageActivity() {
    if (!lesson) {
      return;
    }

    setStreakLoading(true);
    setStreakError("");

    try {
      const response =
        await recordLearningActivity({
          activityType: "lesson",
          activityRef: `${courseId}-${lesson.id}-${type}`,
        });

      const streak =
        normalizeStreakResponse(response);

      setCurrentStreak(streak.currentStreak);
      setActiveToday(streak.activeToday);

      localStorage.setItem(
        streakKey(courseId),
        String(streak.currentStreak)
      );

      notifyProgressUpdated();
    } catch (error) {
      console.error(
        "Could not record learning streak:",
        error
      );

      setStreakError(
        "Your stage was saved, but your streak could not be refreshed. Check your login and connection."
      );
    } finally {
      setStreakLoading(false);
    }
  }

  // ------------------------------------------------
  // Save stage completion
  // ------------------------------------------------

  async function completeStage() {
    if (
      !lesson ||
      !currentStageUnlocked ||
      !canCompleteStage() ||
      savingStage
    ) {
      return;
    }

    setSavingStage(true);
    setSaveError("");

    try {
      /*
       * Save to Supabase.
       * The progress service must map lesson.id correctly
       * if the frontend and database use different IDs.
       */
      await saveStageCompletion({
        lessonId: lesson.id,
        stage: type,
      });

      /*
       * Reload from Supabase instead of assuming the save
       * succeeded merely because the request returned.
       */
      const records =
        await getLessonStageProgress(lesson.id);

      const updatedProgress =
        buildStageProgress(
          records,
          lesson.id
        );

      setStageProgress(updatedProgress);

      notifyProgressUpdated();

      /*
       * Activity tracking should not block stage completion.
       */
      void recordStageActivity();

      const nextStage =
        getNextIncompleteStage(
          updatedProgress,
          lesson.id
        );

      const nowTopicCompleted =
        isTopicComplete(
          updatedProgress,
          lesson.id
        );

      if (nowTopicCompleted) {
        let totalXP = xp;

        try {
          const dashboard =
            await getLearningDashboard();

          const parsedXP = Number(
            dashboard?.totalXP ?? 0
          );

          if (
            Number.isFinite(parsedXP) &&
            parsedXP >= 0
          ) {
            totalXP = parsedXP;
            setXp(parsedXP);

            localStorage.setItem(
              xpKey(courseId),
              String(parsedXP)
            );
          }
        } catch (error) {
          console.error(
            "Could not refresh dashboard XP:",
            error
          );
        }

        /*
         * This value is the lesson's displayed XP reward.
         * The actual XP total must be calculated and awarded
         * by your backend/progress service.
         */
        const rawXP = Number(
          lesson.xp ?? DEFAULT_COMPLETION_XP
        );

        const completionXP =
          Number.isFinite(rawXP) &&
          rawXP >= 0
            ? rawXP
            : DEFAULT_COMPLETION_XP;

        setTopicEarnedXP(completionXP);
        setCompletionTotalXP(totalXP);

        setCompletionContinueTo(
          nextLesson
            ? `/study/${courseId}/lesson/${nextLesson.id}?stage=video`
            : `/study/${courseId}`
        );

        setShowCompletionModal(true);
        return;
      }

      if (nextStage) {
        navigate(
          `/study/${courseId}/lesson/${lesson.id}?stage=${nextStage}`
        );
        return;
      }

      navigate(`/study/${courseId}`);
    } catch (error) {
      console.error(
        "Could not save stage progress:",
        error
      );

      setSaveError(
        error?.message ||
          "Could not save this stage. Please try again."
      );
    } finally {
      setSavingStage(false);
    }
  }

  // ==================================================
  // RENDER: NOT FOUND
  // ==================================================

  if (!course || !lesson || lessonIndex < 0) {
    return (
      <main className="lesson-page lesson-not-found">
        <section className="lesson-card lesson-error-card">
          <span className="lesson-locked-emoji">
            🌱
          </span>

          <p className="lesson-eyebrow">
            EVOLV ADVENTURE WORLD
          </p>

          <h1>Quest not found</h1>

          <p>
            This lesson may have moved, or the course
            does not exist.
          </p>

          <Link
            to="/dashboard"
            className="lesson-primary-button"
          >
            Return to dashboard
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
    );
  }

  // ==================================================
// RENDER: LOADING
// ==================================================

if (progressLoading) {
  return <EvolvLoader />;
}

  // ==================================================
  // RENDER: PROGRESS ERROR
  // ==================================================

  if (progressError) {
    return (
      <main
        className={`lesson-page course-${course.color || "green"}`}
      >
        <section className="lesson-card lesson-error-card">
          <span className="lesson-locked-emoji">
            🌱
          </span>

          <h1>We couldn't load your progress</h1>

          <p>{progressError}</p>

          <button
            type="button"
            className="lesson-primary-button"
            onClick={() =>
  void refreshProgress({ showLoader: true })
}
          >
            Retry
            <RotateCcw size={17} />
          </button>

          <Link
            to={`/study/${courseId}`}
            className="lesson-secondary-button"
          >
            Back to Study Map
          </Link>
        </section>
      </main>
    );
  }

  // ==================================================
  // RENDER: LOCKED STAGE
  // ==================================================

  if (!currentStageUnlocked) {
    return (
      <main
        className={`lesson-page course-${course.color || "green"}`}
      >
        <header className="lesson-topbar">
          <Link
            to="/dashboard"
            className="lesson-home-link"
          >
            <House size={17} />
            Home
          </Link>

          <div className="lesson-topbar-center">
            <span className="lesson-topbar-icon">
              {course.icon || "🐍"}
            </span>

            <span>
              {course.title || "Python journey"}
            </span>
          </div>

          <span className="lesson-topbar-xp">
            <Zap size={17} fill="currentColor" />
            {xp} XP
          </span>
        </header>

        <section className="lesson-card lesson-locked-card">
          <span className="lesson-locked-emoji">
            🔒
          </span>

          <p className="lesson-eyebrow">
            ONE LEVEL AT A TIME
          </p>

          <h1>This stage is locked</h1>

          <p>
            Complete{" "}
            <strong>
              {STAGE_LABELS[nextRequiredStage] ||
                "the previous stage"}
            </strong>{" "}
            first to unlock the next stage.
          </p>

          <Link
            className="lesson-primary-button"
            to={`/study/${courseId}/lesson/${lesson.id}?stage=${nextRequiredStage}`}
          >
            Continue to{" "}
            {STAGE_LABELS[nextRequiredStage]}
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
    );
  }

  // ==================================================
  // RENDER: MAIN LESSON
  // ==================================================

  const videoUrl =
    lesson.videoUrl || lesson.video || "";

  const audioUrl = lesson.audioUrl || "";

  const isHTMLLesson =
    /\.html?($|[?#])/i.test(videoUrl);

  const StageIcon =
    STAGE_ICONS[type] || BookOpen;

  const completionReady = canCompleteStage();

  const validQuestions =
    questions.length > 0 &&
    questions.every(isValidQuestion);

  const answeredCount = questions.filter(
    (_, index) =>
      answers[index] !== undefined &&
      answers[index] !== null &&
      answers[index] !== ""
  ).length;

  const allQuestionsAnswered =
    questions.length > 0 &&
    answeredCount === questions.length;

  return (
    <main
      className={`lesson-page course-${course.color || "green"}`}
    >
      <header className="lesson-topbar">
        <nav
          className="lesson-topbar-nav"
          aria-label="Learning navigation"
        >
          <Link
            to="/dashboard"
            className="lesson-home-link"
          >
            <House size={17} />
            <span>Home</span>
          </Link>

          <span className="lesson-nav-divider">
            /
          </span>

          <Link
            to={`/study/${courseId}`}
            className="lesson-back"
          >
            <ArrowLeft size={17} />
            <span>Study Map</span>
          </Link>
        </nav>

        <div className="lesson-topbar-center">
          <span className="lesson-topbar-icon">
            {course.icon || "🐍"}
          </span>

          <span>
            {course.title || "Python journey"}
          </span>
        </div>

        <div className="lesson-topbar-status">
          <span
            className="lesson-heart-count"
            title="Remaining hearts"
          >
            <Heart size={18} fill="currentColor" />
            {hearts}
          </span>

          <span className="lesson-topbar-xp">
            <Zap size={18} fill="currentColor" />
            {xp} XP
          </span>
        </div>
      </header>

      <div className="lesson-page-layout">
        <section className="lesson-main">
          <article className="lesson-card">
            <div className="lesson-heading-copy">
              <span className="lesson-eyebrow">
                {lesson.area || "PYTHON ADVENTURE"}
              </span>

              <h1>{lesson.title}</h1>

              <p>{lesson.description}</p>

              <div className="lesson-meta">
                <span>
                  <Clock3 size={16} />
                  {lesson.duration || "8 min"}
                </span>

                <span>
                  <Zap size={16} />
                  {lesson.xp ?? DEFAULT_COMPLETION_XP} XP
                </span>

                <span className="lesson-difficulty">
                  {lesson.difficulty || "Beginner"}
                </span>

                <span
                  className={`lesson-type-badge type-${type}`}
                >
                  {STAGE_LABELS[type]}
                </span>
              </div>
            </div>

            {/* COURSE PROGRESS */}

            <section className="lesson-progress-panel">
              <div className="lesson-progress-heading">
                <span>YOUR LEARNING JOURNEY</span>

                <span>
                  Lesson {lessonIndex + 1} of{" "}
                  {lessons.length}
                </span>
              </div>

              <div className="lesson-course-progress">
                <div
                  className="lesson-course-progress-fill"
                  style={{
                    width: `${courseProgress}%`,
                  }}
                />
              </div>

              <div className="lesson-course-progress-meta">
                <span>
                  {completedCount} topics completed
                </span>

                <strong>{courseProgress}%</strong>
              </div>
            </section>

            {/* FOUR STAGES */}

            <div className="lesson-stage-progress">
              <div className="lesson-stage-progress-heading">
                <strong>Topic journey</strong>

                <span>
                  {completedStages.length}/4 stages complete
                </span>
              </div>

              <div className="lesson-stage-list">
                {STAGES.map((stage) => {
                  const Icon =
                    STAGE_ICONS[stage] || BookOpen;

                  const completed =
                    isStageComplete(
                      stageProgress,
                      lesson.id,
                      stage
                    );

                  const unlocked =
                    isStageUnlocked(
                      stageProgress,
                      lesson.id,
                      stage
                    );

                  return (
                    <Link
                      key={stage}
                      to={
                        unlocked
                          ? `/study/${courseId}/lesson/${lesson.id}?stage=${stage}`
                          : "#"
                      }
                      onClick={(event) => {
                        if (!unlocked) {
                          event.preventDefault();
                        }
                      }}
                      aria-current={
                        stage === type
                          ? "step"
                          : undefined
                      }
                      aria-disabled={!unlocked}
                      className={[
                        "lesson-stage-item",
                        stage === type
                          ? "is-current-stage"
                          : "",
                        completed
                          ? "is-stage-complete"
                          : "",
                        !unlocked
                          ? "is-stage-locked"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="lesson-stage-number">
                        {completed ? (
                          <Check size={15} />
                        ) : (
                          <Icon size={15} />
                        )}
                      </span>

                      <span>
                        {STAGE_LABELS[stage]}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="lesson-divider" />

            {/* VIDEO STAGE */}

            {type === "video" && (
              <section className="lesson-content-section">
                <SectionHeading
                  icon={Video}
                  eyebrow="WATCH & DISCOVER"
                  title={
                    lesson.videoTitle ||
                    `Explore ${lesson.title}`
                  }
                  description="Watch the lesson or review the learning material before continuing."
                />

                {videoUrl ? (
                  <div className="lesson-video-frame">
                    {isHTMLLesson ? (
                      <iframe
                        className="lesson-html-frame"
                        src={videoUrl}
                        title={
                          lesson.videoTitle ||
                          lesson.title
                        }
                        loading="lazy"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        controls
                        preload="metadata"
                        poster={
                          lesson.videoPoster ||
                          undefined
                        }
                        onEnded={finishVideo}
                      >
                        <source src={videoUrl} />
                        Your browser does not support embedded video.
                      </video>
                    )}
                  </div>
                ) : (
                  <div className="lesson-video-placeholder">
                    <span className="lesson-video-placeholder-icon">
                      <Video size={32} />
                    </span>

                    <h3>Video lesson coming soon</h3>

                    <p>
                      Review the learning material and mark
                      this stage as reviewed to continue.
                    </p>
                  </div>
                )}

                {lesson.audioText && (
                  <div className="lesson-audio-text">
                    <Volume2 size={19} />
                    <p>{lesson.audioText}</p>
                  </div>
                )}

                {audioUrl && (
                  <div className="lesson-audio-card">
                    <Volume2 size={20} />

                    <div>
                      <strong>
                        Listen to the lesson
                      </strong>

                      <audio
                        controls
                        preload="none"
                      >
                        <source src={audioUrl} />
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="lesson-primary-button lesson-video-finish"
                  onClick={finishVideo}
                  disabled={videoFinished}
                >
                  {videoFinished ? (
                    <>
                      <CheckCircle2 size={18} />
                      Video reviewed
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      {videoUrl
                        ? "Mark video as watched"
                        : "Mark video stage as reviewed"}
                    </>
                  )}
                </button>

                {videoFinished && (
                  <p className="lesson-inline-success">
                    <CheckCircle2 size={17} />
                    Complete this stage to save your progress.
                  </p>
                )}
              </section>
            )}

            {/* CONCEPT STAGE */}

            {type === "concept" && (
              <section className="lesson-content-section concept-learning">
                <SectionHeading
                  icon={BookOpen}
                  eyebrow="YOUR LEARNING GUIDE"
                  title="Learn the concept"
                  description="Understand the idea, explore an example, and check what you have learned."
                />

                <div className="concept-roadmap">
                  <div className="concept-roadmap-step is-active">
                    <span className="concept-roadmap-number">
                      01
                    </span>
                    <span>Understand</span>
                  </div>

                  <span className="concept-roadmap-connector" />

                  <div className="concept-roadmap-step">
                    <span className="concept-roadmap-number">
                      02
                    </span>
                    <span>Explore</span>
                  </div>

                  <span className="concept-roadmap-connector" />

                  <div className="concept-roadmap-step">
                    <span className="concept-roadmap-number">
                      03
                    </span>
                    <span>Review</span>
                  </div>
                </div>

                <section className="concept-block">
                  <div className="concept-block-heading">
                    <span className="concept-section-number">
                      01
                    </span>

                    <div>
                      <span className="concept-section-eyebrow">
                        START WITH THE BASICS
                      </span>

                      <h3>The big idea</h3>
                    </div>
                  </div>

                  <div className="concept-idea-card">
                    <span className="concept-idea-icon">
                      <Lightbulb size={23} />
                    </span>

                    <div className="concept-idea-content">
                      <p>
                        {lesson.explanation ||
                          "Review the example below to understand this concept."}
                      </p>
                    </div>
                  </div>
                </section>

                {lesson.example && (
                  <section className="concept-block">
                    <div className="concept-block-heading">
                      <span className="concept-section-number">
                        02
                      </span>

                      <div>
                        <span className="concept-section-eyebrow">
                          LEARN BY EXAMPLE
                        </span>

                        <h3>See it in action</h3>

                        <p>
                          Look at the code and understand
                          how the concept works.
                        </p>
                      </div>
                    </div>

                    <div className="concept-example-card">
                      <div className="concept-example-intro">
                        <span className="concept-example-icon">
                          <Code2 size={19} />
                        </span>

                        <div>
                          <strong>
                            Example walkthrough
                          </strong>

                          <p>
                            Read the code one line at a time.
                          </p>
                        </div>

                        <span className="lesson-code-language">
                          PYTHON
                        </span>
                      </div>

                      <div className="concept-code-container">
                        <div className="concept-code-toolbar">
                          <div
                            className="concept-code-dots"
                            aria-hidden="true"
                          >
                            <span />
                            <span />
                            <span />
                          </div>

                          <span>example.py</span>
                        </div>

                        <pre className="lesson-code-block concept-code-block">
                          <code>{lesson.example}</code>
                        </pre>
                      </div>

                      {lesson.expectedOutput != null && (
                        <div className="concept-output-container">
                          <div className="concept-output-heading">
                            <span>
                              <Terminal size={17} />
                              Expected output
                            </span>

                            <span className="concept-output-status">
                              <CheckCircle2 size={14} />
                              Result
                            </span>
                          </div>

                          <pre className="concept-output-code">
                            <code>
                              {String(
                                lesson.expectedOutput
                              )}
                            </code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {lesson.activities?.length > 0 && (
                  <section className="concept-block">
                    <div className="concept-block-heading">
                      <span className="concept-section-number">
                        03
                      </span>

                      <div>
                        <span className="concept-section-eyebrow">
                          BUILD YOUR UNDERSTANDING
                        </span>

                        <h3>Explore the concept</h3>

                        <p>
                          Use these short activities to
                          connect the explanation with
                          practical examples.
                        </p>
                      </div>
                    </div>

                    <div className="concept-activity-list">
                      {lesson.activities.map(
                        (activity, index) => (
                          <article
                            className="concept-activity-card"
                            key={`${activity.type || "activity"}-${index}`}
                          >
                            <div className="concept-activity-marker">
                              {String(index + 1).padStart(
                                2,
                                "0"
                              )}
                            </div>

                            <div className="concept-activity-body">
                              <div className="concept-activity-title">
                                <h4>
                                  {String(
                                    activity.type ||
                                      "Learning activity"
                                  )
                                    .replaceAll("-", " ")
                                    .replace(
                                      /\b\w/g,
                                      (character) =>
                                        character.toUpperCase()
                                    )}
                                </h4>

                                <span>
                                  ACTIVITY {index + 1}
                                </span>
                              </div>

                              <p>
                                {activity.prompt ||
                                  "Review this example and think about how it relates to the concept."}
                              </p>

                              {activity.code && (
                                <div className="concept-activity-code">
                                  <pre>
                                    <code>
                                      {activity.code}
                                    </code>
                                  </pre>
                                </div>
                              )}

                              {activity.expectedOutput != null && (
                                <div className="concept-activity-result">
                                  <CheckCircle2 size={16} />

                                  <p>
                                    <strong>
                                      Expected output:
                                    </strong>{" "}
                                    {String(
                                      activity.expectedOutput
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  </section>
                )}

                {lesson.question &&
                  Array.isArray(lesson.options) &&
                  lesson.options.length > 0 && (
                    <section className="concept-quick-check">
                      <div className="concept-quick-check-header">
                        <span className="concept-quick-check-icon">
                          <Zap size={21} />
                        </span>

                        <div>
                          <span className="concept-section-eyebrow">
                            PAUSE AND THINK
                          </span>

                          <h3>Quick knowledge check</h3>
                        </div>

                        <span className="concept-quick-check-badge">
                          1 question
                        </span>
                      </div>

                      <p className="concept-quick-question">
                        {lesson.question}
                      </p>

                      <div className="concept-quick-options">
                        {lesson.options.map(
                          (option, index) => (
                            <div
                              className="concept-quick-option"
                              key={`${option}-${index}`}
                            >
                              <span className="concept-quick-option-letter">
                                {String.fromCharCode(
                                  65 + index
                                )}
                              </span>

                              <span>{option}</span>
                            </div>
                          )
                        )}
                      </div>

                      <div className="concept-quick-footer">
                        <Lightbulb size={17} />

                        <p>
                          Think through your answer. You can
                          test your knowledge in the Quiz stage.
                        </p>
                      </div>
                    </section>
                  )}

                <div className="concept-takeaway">
                  <span className="concept-takeaway-icon">
                    <CheckCircle2 size={21} />
                  </span>

                  <div>
                    <h3>Ready for the next step?</h3>

                    <p>
                      You have explored the explanation and
                      examples. Complete this stage to unlock
                      Hands-on.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* HANDS-ON STAGE */}

            {type === "hands-on" && (
              <section className="lesson-content-section">
                <SectionHeading
                  icon={Code2}
                  eyebrow="BUILD & EXPERIMENT"
                  title={practice.title}
                  description="Edit the starter code, inspect the expected result, and review your solution."
                />

                <div className="lesson-challenge-card">
                  <span className="lesson-challenge-label">
                    YOUR CODING QUEST
                  </span>

                  <h3>{lesson.title}</h3>

                  <p>{practice.prompt}</p>

                  {lesson.expectedResult != null && (
                    <div className="lesson-challenge-output">
                      <strong>Expected result</strong>

                      <pre>
                        <code>
                          {String(
                            lesson.expectedResult
                          )}
                        </code>
                      </pre>
                    </div>
                  )}
                </div>

                <label
                  className="lesson-editor-label"
                  htmlFor="lesson-code-editor"
                >
                  Your Python code
                </label>

                <textarea
                  id="lesson-code-editor"
                  className="lesson-code-editor"
                  value={practiceCode}
                  onChange={(event) => {
                    setPracticeCode(
                      event.target.value
                    );

                    setTaskChecked(false);
                    setPracticeOutput(null);
                    setPracticeMessage("");
                  }}
                  spellCheck="false"
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  aria-describedby="lesson-runner-note"
                />

                <div className="lesson-editor-actions">
                  <button
                    type="button"
                    className="lesson-run-button"
                    onClick={runPractice}
                  >
                    <Play
                      size={17}
                      fill="currentColor"
                    />
                    Preview output
                  </button>

                  <button
                    type="button"
                    className="lesson-reset-button"
                    onClick={() => {
                      setPracticeCode(
                        practice.starterCode
                      );

                      setPracticeOutput(null);
                      setPracticeMessage("");
                      setTaskChecked(false);
                    }}
                  >
                    <RotateCcw size={16} />
                    Reset code
                  </button>

                  <button
                    type="button"
                    className="lesson-secondary-button"
                    onClick={() =>
                      setShowHint((value) => !value)
                    }
                  >
                    <Lightbulb size={16} />
                    {showHint
                      ? "Hide hint"
                      : "Show hint"}
                  </button>
                </div>

                <div
                  id="lesson-runner-note"
                  className="lesson-runner-notice"
                >
                  <Lightbulb size={18} />

                  <p>
                    This preview recognises simple print()
                    statements only. It does not execute
                    arbitrary Python code.
                  </p>
                </div>

                {showHint && (
                  <div className="lesson-hint-content">
                    <strong>Hint:</strong>{" "}
                    {practice.hint ||
                      "Read the instructions and change the starter code one step at a time."}
                  </div>
                )}

                {practiceOutput !== null && (
                  <div
                    className="lesson-live-output"
                    aria-live="polite"
                  >
                    <div className="lesson-output-heading">
                      <Terminal size={17} />
                      Preview output
                    </div>

                    <pre>
                      <code>
                        {practiceOutput ||
                          "(No output to display)"}
                      </code>
                    </pre>

                    <p className="lesson-preview-message">
                      {practiceMessage}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  className="lesson-primary-button lesson-check-task"
                  onClick={markPracticeReviewed}
                  disabled={taskChecked}
                >
                  {taskChecked ? (
                    <>
                      <CheckCircle2 size={18} />
                      Practice reviewed
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Mark practice as reviewed
                    </>
                  )}
                </button>

                {taskChecked && (
                  <p className="lesson-inline-success">
                    <CheckCircle2 size={17} />
                    You can now complete this stage.
                  </p>
                )}
              </section>
            )}

            {/* QUIZ STAGE */}

            {type === "quiz" && (
              <section className="lesson-content-section lesson-quiz-section">
                <SectionHeading
                  icon={Trophy}
                  eyebrow="TEST YOUR KNOWLEDGE"
                  title="Knowledge checkpoint"
                  description="Answer every question and submit to see your score."
                />

                {validQuestions ? (
                  quizSubmitted ? (
                    <div
                      className="lesson-score-card"
                      role="status"
                    >
                      <span className="lesson-score-icon">
                        <Trophy size={30} />
                      </span>

                      <h3>
                        {currentScore?.score ===
                        currentScore?.maxScore
                          ? "Perfect score!"
                          : "Checkpoint complete!"}
                      </h3>

                      <p className="lesson-score-number">
                        {currentScore?.score}/
                        {currentScore?.maxScore}
                      </p>

                      <p>
                        {Math.round(
                          (
                            (currentScore?.score || 0) /
                            Math.max(
                              currentScore?.maxScore || 1,
                              1
                            )
                          ) * 100
                        )}
                        % correct
                      </p>

                      <p>
                        Review your result, then continue
                        when you're ready.
                      </p>

                      <button
                        type="button"
                        className="lesson-secondary-button"
                        onClick={restartQuiz}
                      >
                        <RotateCcw size={16} />
                        Try again
                      </button>
                    </div>
                  ) : (
                    <form
                      className="lesson-quiz-form"
                      onSubmit={submitQuiz}
                    >
                      <div className="lesson-quiz-topline">
                        <strong>
                          {questions.length} questions
                        </strong>

                        <span>
                          {answeredCount} of{" "}
                          {questions.length} answered
                        </span>
                      </div>

                      <div className="lesson-quiz-progress">
                        <div
                          style={{
                            width: `${
                              (
                                answeredCount /
                                questions.length
                              ) * 100
                            }%`,
                          }}
                        />
                      </div>

                      {questions.map(
                        (question, questionIndex) => (
                          <fieldset
                            className="lesson-question-card"
                            key={`${questionIndex}-${question.question}`}
                          >
                            <legend>
                              <span className="lesson-question-number">
                                {questionIndex + 1}
                              </span>

                              <span>
                                {question.question}
                              </span>
                            </legend>

                            <div className="lesson-quiz-options">
                              {question.options.map(
                                (
                                  option,
                                  optionIndex
                                ) => (
                                  <label
                                    className={[
                                      "lesson-quiz-option",
                                      Number(
                                        answers[questionIndex]
                                      ) === optionIndex
                                        ? "is-selected"
                                        : "",
                                    ]
                                      .filter(Boolean)
                                      .join(" ")}
                                    key={`${optionIndex}-${option}`}
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${questionIndex}`}
                                      value={optionIndex}
                                      checked={
                                        Number(
                                          answers[questionIndex]
                                        ) === optionIndex
                                      }
                                      onChange={() =>
                                        setAnswers(
                                          (previous) => ({
                                            ...previous,
                                            [questionIndex]:
                                              optionIndex,
                                          })
                                        )
                                      }
                                    />

                                    <span className="lesson-option-letter">
                                      {String.fromCharCode(
                                        65 + optionIndex
                                      )}
                                    </span>

                                    <span>{option}</span>
                                  </label>
                                )
                              )}
                            </div>
                          </fieldset>
                        )
                      )}

                      <button
                        type="submit"
                        className="lesson-primary-button lesson-quiz-submit"
                        disabled={!allQuestionsAnswered}
                      >
                        Submit quiz
                        <ArrowRight size={18} />
                      </button>

                      {!allQuestionsAnswered && (
                        <p className="lesson-completion-note">
                          Answer every question to submit
                          your quiz.
                        </p>
                      )}
                    </form>
                  )
                ) : (
                  <div className="lesson-empty-quiz">
                    <h3>
                      Quiz questions need attention
                    </h3>

                    <p>
                      Each question needs a question string,
                      an options array, and a valid
                      zero-based answer index. Check this
                      lesson in pythonLessons.js.
                    </p>
                  </div>
                )}

                {savedQuiz && !currentScore && (
                  <p className="lesson-saved-score">
                    Previous score:{" "}
                    <strong>
                      {savedQuiz.score}/
                      {savedQuiz.maxScore}
                    </strong>
                  </p>
                )}
              </section>
            )}

            {/* SAVE ERRORS */}

            {saveError && (
              <div
                className="lesson-error-message"
                role="alert"
              >
                <p>{saveError}</p>
              </div>
            )}

            {/* FOOTER ACTIONS */}

            <footer className="lesson-actions">
              <Link
                to={`/study/${courseId}`}
                className="lesson-secondary-button"
              >
                <ArrowLeft size={17} />
                Study Map
              </Link>

              {currentStageCompleted ? (
                <Link
                  to={continueInfo.to}
                  className="lesson-primary-button"
                >
                  {continueInfo.label}
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <button
                  type="button"
                  className="lesson-primary-button"
                  onClick={() =>
                    void completeStage()
                  }
                  disabled={
                    !completionReady ||
                    savingStage ||
                    progressLoading
                  }
                >
                  {savingStage ? (
                    <>Saving progress…</>
                  ) : (
                    <>
                      Complete this stage
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>
              )}
            </footer>

            {!currentStageCompleted &&
              !completionReady && (
                <p className="lesson-completion-note">
                  {type === "video" &&
                    "Mark the video as watched or reviewed first."}

                  {type === "concept" &&
                    "Read through the explanation, then complete this stage."}

                  {type === "hands-on" &&
                    "Review your practice before completing this stage."}

                  {type === "quiz" &&
                    "Answer all quiz questions and submit your answers first."}
                </p>
              )}

            {currentStageCompleted && (
              <div className="lesson-completed-note">
                <CheckCircle2 size={18} />

                {topicCompleted
                  ? "All four stages are complete. This topic is finished!"
                  : `${STAGE_LABELS[type]} is saved. Continue through the remaining stages to finish this topic.`}
              </div>
            )}
          </article>
        </section>

        {/* RIGHT SIDEBAR */}

        <aside className="lesson-sidebar">
          <section className="lesson-companion">
            <div className="lesson-companion-avatar">
              🦊
            </div>

            <span className="lesson-companion-label">
              YOUR COMPANION
            </span>

            <h2>One step at a time!</h2>

            <p>
              {type === "video"
                ? "Watch or review the material before continuing."
                : type === "concept"
                  ? "Understand the idea before moving to practice."
                  : type === "quiz"
                    ? "Think carefully and check every option."
                    : "Experiment with the code and review the task."}
            </p>
          </section>

          <section className="lesson-sidebar-card">
            <div className="lesson-sidebar-heading">
              <Trophy size={19} />
              <h3>Topic progress</h3>
            </div>

            <div className="lesson-progress-numbers">
              <strong>
                {completedStages.length}/4
              </strong>

              <span>stages completed</span>
            </div>

            <div
              className="lesson-progress-track"
              role="progressbar"
              aria-label="Topic stage completion"
              aria-valuemin={0}
              aria-valuemax={4}
              aria-valuenow={completedStages.length}
            >
              <div
                className="lesson-progress-fill"
                style={{
                  width: `${
                    (completedStages.length / 4) * 100
                  }%`,
                }}
              />
            </div>

            <p className="lesson-sidebar-muted">
              {topicCompleted
                ? "Amazing! All four stages are complete."
                : "Complete Video, Concept, Hands-on, and Quiz to finish this topic."}
            </p>
          </section>

          <section className="lesson-sidebar-card lesson-up-next">
            <div className="lesson-sidebar-heading">
              <ArrowRight size={19} />
              <h3>Up next on your map</h3>
            </div>

            {nextLesson ? (
              <>
                <span className="lesson-up-next-area">
                  {nextLesson.area || "Next quest"}
                </span>

                <h4>{nextLesson.title}</h4>

                <p>{nextLesson.description}</p>

                <div className="lesson-next-meta">
                  <span>
                    <Clock3 size={15} />
                    {nextLesson.duration || "5 min"}
                  </span>

                  <span>
                    <Zap size={15} />
                    {nextLesson.xp ??
                      DEFAULT_COMPLETION_XP}{" "}
                    XP
                  </span>
                </div>
              </>
            ) : (
              <p>
                You've reached the final lesson in this
                course!
              </p>
            )}
          </section>

          <section className="lesson-tip-card">
            <span>🌱</span>

            <div>
              <h3>Learning tip</h3>

              <p>
                {type === "quiz"
                  ? "Read every option carefully before submitting."
                  : type === "hands-on"
                    ? "Change one thing at a time to understand the code."
                    : "Take your time. Understanding matters more than rushing."}
              </p>
            </div>
          </section>

          <section className="lesson-sidebar-card lesson-streak-card">
            <div className="lesson-sidebar-heading">
              <Flame size={19} />
              <h3>Your streak</h3>
            </div>

            <strong className="lesson-streak-number">
              {currentStreak} day
              {currentStreak === 1 ? "" : "s"}
            </strong>

            <p className="lesson-sidebar-muted">
              {activeToday
                ? "You've been active today. Keep learning!"
                : "Complete a learning stage to record activity."}
            </p>

            {streakLoading && (
              <p className="lesson-sidebar-muted">
                Updating streak…
              </p>
            )}

            {streakError && (
              <p className="lesson-streak-error">
                {streakError}
              </p>
            )}
          </section>
        </aside>
      </div>

      <TopicCompletionModal
        isOpen={showCompletionModal}
        topicTitle={lesson.title}
        earnedXP={topicEarnedXP}
        totalXP={completionTotalXP}
        currentStreak={currentStreak}
        activeToday={activeToday}
        streakLoading={streakLoading}
        streakError={streakError}
        onContinue={() => {
          const destination =
            completionContinueTo ||
            `/study/${courseId}`;

          setShowCompletionModal(false);
          navigate(destination);
        }}
        onClose={() => {
          setShowCompletionModal(false);
        }}
      />
    </main>
  );
}