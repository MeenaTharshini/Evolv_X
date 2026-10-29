// src/pages/LessonPage.jsx

import { useEffect, useMemo, useState } from "react";
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

import { recordLearningActivity } from "../services/api";
import { coursePaths } from "../data/coursePaths";
import {
  pythonLessons,
  getPythonLesson,
} from "../data/pythonLessons";

import {
  STAGES,
  getStageProgress,
  getCompletedStages,
  isStageComplete,
  isStageUnlocked,
  getNextIncompleteStage,
  isTopicComplete,
  saveStageCompletion,
} from "../utils/lessonProgress";

import TopicCompletionModal from "../components/EVO/TopicCompletionModal";
import "../styles/lesson.css";

const DEFAULT_COURSE = "python";
const STARTING_HEARTS = 3;
const VIDEO_XP = 10;
const DEFAULT_COMPLETION_XP = 20;

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
const rewardKey = (courseId) => `evolv_${courseId}_lesson_rewards`;
const quizScoreKey = (courseId) => `evolv_${courseId}_quiz_scores`;
const streakKey = (courseId) => `evolv_${courseId}_streak`;

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value) ?? fallback;
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

function normalizeType(type) {
  const value = String(type || "concept").toLowerCase();

  if (
    ["hands-on", "hands_on", "coding", "practice"].includes(value)
  ) {
    return "hands-on";
  }

  return ["video", "concept", "quiz"].includes(value)
    ? value
    : "concept";
}

function normalizeStreakResponse(response) {
  const data = response?.data ?? response ?? {};

  return {
    currentStreak: Math.max(
      0,
      Number(data.currentStreak ?? data.current_streak) || 0
    ),
    activeToday:
      typeof data.activeToday === "boolean"
        ? data.activeToday
        : typeof data.active_today === "boolean"
          ? data.active_today
          : true,
  };
}

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
    lesson.options.length > 0
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
      Array.isArray(question.options) &&
      question.options.length > 1 &&
      Number.isInteger(Number(question.answer)) &&
      Number(question.answer) >= 0 &&
      Number(question.answer) < question.options.length
  );
}

function getPractice(lesson) {
  return {
    title: lesson?.practice?.title || `Practice: ${lesson?.title || "Python"}`,
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
    hint: lesson?.practice?.hint || lesson?.hint || "",
  };
}

/*
 * This is intentionally only a simple preview.
 * It does NOT execute arbitrary Python.
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

    output.push(match[1] ?? match[2] ?? match[3]);
  }

  return {
    output: output.join("\n"),
    message:
      "Preview only. This is not output from a full Python interpreter.",
  };
}

function notifyProgressUpdated() {
  window.dispatchEvent(new Event("evolv-progress-updated"));
}

function SectionHeading({ icon: Icon, eyebrow, title, description }) {
  return (
    <div className="lesson-section-heading">
      <span className="lesson-section-icon">
        <Icon size={22} />
      </span>

      <div>
        {eyebrow && <span className="lesson-eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

export default function LessonPage() {
  const { courseId = DEFAULT_COURSE, lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const requestedStage = searchParams.get("stage");

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

  const lessons = useMemo(
    () =>
      courseId === DEFAULT_COURSE
        ? pythonLessons
        : course?.lessons ?? [],
    [courseId, course]
  );

  const lesson = useMemo(() => {
    if (courseId === DEFAULT_COURSE) {
      return getPythonLesson(lessonId);
    }

    return (
      lessons.find(
        (item) => Number(item.id) === Number(lessonId)
      ) ?? null
    );
  }, [courseId, lessonId, lessons]);

  const initialProgress = getStageProgress(courseId);

  const type = STAGES.includes(requestedStage)
    ? requestedStage
    : lesson
      ? getNextIncompleteStage(initialProgress, lesson.id) || "video"
      : normalizeType(lesson?.type);

  const lessonKey = `${courseId}_${lessonId}`;

  const [stageProgress, setStageProgress] = useState(initialProgress);
  const [xp, setXp] = useState(() => readNumber(xpKey(courseId)));
  const [hearts, setHearts] = useState(() =>
    readNumber(heartsKey(courseId), STARTING_HEARTS)
  );
  const [rewards, setRewards] = useState(() =>
    readObject(rewardKey(courseId))
  );
  const [quizScores, setQuizScores] = useState(() =>
    readObject(quizScoreKey(courseId))
  );

  const [videoFinished, setVideoFinished] = useState(false);
  const [practiceCode, setPracticeCode] = useState("");
  const [practiceOutput, setPracticeOutput] = useState(null);
  const [practiceMessage, setPracticeMessage] = useState("");
  const [taskChecked, setTaskChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentScore, setCurrentScore] = useState(null);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [topicEarnedXP, setTopicEarnedXP] = useState(0);
  const [completionTotalXP, setCompletionTotalXP] = useState(0);
  const [completionContinueTo, setCompletionContinueTo] = useState("");

  const [currentStreak, setCurrentStreak] = useState(() =>
    readNumber(streakKey(courseId))
  );
  const [activeToday, setActiveToday] = useState(false);
  const [streakLoading, setStreakLoading] = useState(false);
  const [streakError, setStreakError] = useState("");

  const lessonIndex = lessons.findIndex(
    (item) => Number(item.id) === Number(lesson?.id)
  );

  const nextLesson =
    lessonIndex >= 0 ? lessons[lessonIndex + 1] ?? null : null;

  const lessonReward = rewards[lessonKey] || {};
  const practice = lesson ? getPractice(lesson) : null;
  const questions = lesson ? getQuestions(lesson) : [];

  const completedStages = lesson
    ? getCompletedStages(stageProgress, lesson.id)
    : [];

  const currentStageCompleted = lesson
    ? isStageComplete(stageProgress, lesson.id, type)
    : false;

  const currentStageUnlocked = lesson
    ? currentStageCompleted ||
      isStageUnlocked(stageProgress, lesson.id, type)
    : false;

  const nextRequiredStage = lesson
    ? getNextIncompleteStage(stageProgress, lesson.id) || "video"
    : "video";

  const topicCompleted = lesson
    ? isTopicComplete(stageProgress, lesson.id)
    : false;

  const completedCount = lessons.filter((item) =>
    isTopicComplete(stageProgress, item.id)
  ).length;

  const courseProgress = lessons.length
    ? Math.round((completedCount / lessons.length) * 100)
    : 0;

  const savedQuiz = quizScores[lessonKey];

  const continueInfo = useMemo(() => {
    if (!lesson) {
      return {
        to: `/study/${courseId}`,
        label: "Back to Study Map",
      };
    }

    const nextStage = STAGES.find(
      (stage) => !isStageComplete(stageProgress, lesson.id, stage)
    );

    if (nextStage) {
      return {
        to: `/study/${courseId}/lesson/${lesson.id}?stage=${nextStage}`,
        label: `Continue to ${STAGE_LABELS[nextStage]}`,
      };
    }

    if (nextLesson) {
      const nextLessonStage =
        STAGES.find(
          (stage) => !isStageComplete(stageProgress, nextLesson.id, stage)
        ) || "video";

      return {
        to: `/study/${courseId}/lesson/${nextLesson.id}?stage=${nextLessonStage}`,
        label: "Continue to next topic",
      };
    }

    return {
      to: `/study/${courseId}`,
      label: "Back to Study Map",
    };
  }, [courseId, lesson, nextLesson, stageProgress]);

  useEffect(() => {
    function refreshProgress() {
      setStageProgress(getStageProgress(courseId));
      setXp(readNumber(xpKey(courseId)));
      setHearts(readNumber(heartsKey(courseId), STARTING_HEARTS));
      setRewards(readObject(rewardKey(courseId)));
      setQuizScores(readObject(quizScoreKey(courseId)));
      setCurrentStreak(readNumber(streakKey(courseId)));
    }

    refreshProgress();

    window.addEventListener("evolv-progress-updated", refreshProgress);
    window.addEventListener("storage", refreshProgress);

    return () => {
      window.removeEventListener(
        "evolv-progress-updated",
        refreshProgress
      );
      window.removeEventListener("storage", refreshProgress);
    };
  }, [courseId]);

  useEffect(() => {
    setVideoFinished(false);
    setPracticeCode(lesson ? getPractice(lesson).starterCode : "");
    setPracticeOutput(null);
    setPracticeMessage("");
    setTaskChecked(false);
    setShowHint(false);
    setAnswers({});
    setQuizSubmitted(false);
    setCurrentScore(null);
  }, [courseId, lessonId, lesson, requestedStage]);

  useEffect(() => {
    if (!lesson || !STAGES.includes(type)) return;

    const destination =
      `/study/${courseId}/lesson/${lesson.id}?stage=${type}`;

    try {
      localStorage.setItem(
        `evolv_${courseId}_last_viewed`,
        JSON.stringify({
          lessonId: Number(lesson.id),
          stage: type,
          destination,
        })
      );
    } catch (error) {
      console.error("Could not save last-viewed stage:", error);
    }
  }, [courseId, lesson, type]);

  function saveRewards(nextRewards, nextXP = xp) {
    setRewards(nextRewards);
    setXp(nextXP);

    try {
      localStorage.setItem(
        rewardKey(courseId),
        JSON.stringify(nextRewards)
      );
      localStorage.setItem(xpKey(courseId), String(nextXP));
      localStorage.setItem(heartsKey(courseId), String(hearts));
    } catch (error) {
      console.error("Could not save EVOLV rewards:", error);
    }

    notifyProgressUpdated();
  }

  function finishVideo() {
    setVideoFinished(true);

    const latestRewards = readObject(rewardKey(courseId));
    const latestLessonReward = latestRewards[lessonKey] || {};

    if (latestLessonReward.video) return;

    const nextRewards = {
      ...latestRewards,
      [lessonKey]: {
        ...latestLessonReward,
        video: true,
      },
    };

    saveRewards(
      nextRewards,
      readNumber(xpKey(courseId)) + VIDEO_XP
    );
  }

  function runPractice() {
    if (!practiceCode.trim()) {
      setPracticeOutput("");
      setPracticeMessage("Enter some code first.");
      return;
    }

    const result = previewSimplePrint(practiceCode);
    setPracticeOutput(result.output);
    setPracticeMessage(result.message);
  }

  function submitQuiz(event) {
    event.preventDefault();

    if (
      questions.length === 0 ||
      !questions.every(isValidQuestion) ||
      questions.some(
        (_, index) =>
          answers[index] === undefined ||
          answers[index] === null ||
          answers[index] === ""
      )
    ) {
      return;
    }

    const score = questions.reduce((total, question, index) => {
      return (
        total +
        (Number(answers[index]) === Number(question.answer) ? 1 : 0)
      );
    }, 0);

    const result = {
      score,
      maxScore: questions.length,
      submittedAt: new Date().toISOString(),
    };

    const updatedScores = {
      ...readObject(quizScoreKey(courseId)),
      [lessonKey]: result,
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
      console.error("Could not save quiz score:", error);
    }
  }

  function restartQuiz() {
    setAnswers({});
    setQuizSubmitted(false);
    setCurrentScore(null);
  }

  function canCompleteStage() {
    if (!lesson || currentStageCompleted) return false;

    if (type === "video") {
      // If a video is not supplied, the learner can still mark the
      // video stage reviewed using the button displayed below.
      return videoFinished;
    }

    if (type === "concept") return true;
    if (type === "hands-on") return taskChecked;

    if (type === "quiz") {
      return (
        questions.length > 0 &&
        questions.every(isValidQuestion) &&
        quizSubmitted
      );
    }

    return false;
  }

  async function recordStageActivity() {
    setStreakLoading(true);
    setStreakError("");

    try {
      const response = await recordLearningActivity({
        activityType: "lesson",
        activityRef: `${courseId}-${lesson.id}-${type}`,
      });

      const streak = normalizeStreakResponse(response);

      setCurrentStreak(streak.currentStreak);
      setActiveToday(streak.activeToday);

      localStorage.setItem(
        streakKey(courseId),
        String(streak.currentStreak)
      );

      notifyProgressUpdated();
    } catch (error) {
      console.error("Could not record learning streak:", error);
      setStreakError(
        "Your progress was saved, but the streak could not be refreshed. Check your connection and try again later."
      );
    } finally {
      setStreakLoading(false);
    }
  }

  function completeStage() {
    if (
      !lesson ||
      !currentStageUnlocked ||
      !canCompleteStage()
    ) {
      return;
    }

    try {
      const updatedProgress = saveStageCompletion(
        courseId,
        lesson.id,
        type
      );

      setStageProgress(updatedProgress);
      void recordStageActivity();

      const nowTopicCompleted = isTopicComplete(
        updatedProgress,
        lesson.id
      );

      const latestRewards = readObject(rewardKey(courseId));
      const latestLessonReward = latestRewards[lessonKey] || {};

      if (
        nowTopicCompleted &&
        !latestLessonReward.completion
      ) {
        const rawXP = Number(
          lesson.xp ?? DEFAULT_COMPLETION_XP
        );

        const completionXP =
          Number.isFinite(rawXP) && rawXP >= 0
            ? rawXP
            : DEFAULT_COMPLETION_XP;

        const nextRewards = {
          ...latestRewards,
          [lessonKey]: {
            ...latestLessonReward,
            completion: true,
          },
        };

        const nextXP =
          readNumber(xpKey(courseId)) + completionXP;

        saveRewards(nextRewards, nextXP);

        setTopicEarnedXP(
          completionXP +
            (latestLessonReward.video ? VIDEO_XP : 0)
        );

        setCompletionTotalXP(nextXP);
        setCompletionContinueTo(continueInfo.to);
        setActiveToday(true);
        setShowCompletionModal(true);
      } else {
        notifyProgressUpdated();
      }
    } catch (error) {
      console.error("Could not save stage progress:", error);
    }
  }

  function markPracticeReviewed() {
    if (!practiceCode.trim()) {
      setPracticeMessage("Write some code before marking this task reviewed.");
      return;
    }

    setTaskChecked(true);
    setPracticeMessage(
      "Practice marked as reviewed. The simple preview is not a full Python execution environment."
    );
  }

  function continueAfterCelebration() {
    const destination =
      completionContinueTo || `/study/${courseId}`;

    setShowCompletionModal(false);
    navigate(destination);
  }

  if (!course || !lesson || lessonIndex < 0) {
    return (
      <main className="lesson-page lesson-not-found">
        <section className="lesson-card lesson-error-card">
          <span className="lesson-locked-emoji">🌱</span>
          <p className="lesson-eyebrow">EVOLV ADVENTURE WORLD</p>
          <h1>Quest not found</h1>
          <p>
            This lesson may have moved, or the course does not exist.
          </p>

          <Link to="/dashboard" className="lesson-primary-button">
            Return to dashboard
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
    );
  }

  if (!currentStageUnlocked) {
    return (
      <main className={`lesson-page course-${course.color || "green"}`}>
        <header className="lesson-topbar">
          <Link to="/dashboard" className="lesson-home-link">
            <House size={17} />
            Home
          </Link>

          <div className="lesson-topbar-center">
            <span className="lesson-topbar-icon">
              {course.icon || "🐍"}
            </span>
            <span>{course.title || "Python journey"}</span>
          </div>

          <span className="lesson-topbar-xp">
            <Zap size={17} fill="currentColor" />
            {xp} XP
          </span>
        </header>

        <section className="lesson-card lesson-locked-card">
          <span className="lesson-locked-emoji">🔒</span>
          <p className="lesson-eyebrow">ONE LEVEL AT A TIME</p>
          <h1>This stage is locked</h1>
          <p>
            Complete <strong>{STAGE_LABELS[nextRequiredStage]}</strong>{" "}
            first to unlock the next stage.
          </p>

          <Link
            className="lesson-primary-button"
            to={`/study/${courseId}/lesson/${lesson.id}?stage=${nextRequiredStage}`}
          >
            Continue to {STAGE_LABELS[nextRequiredStage]}
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
    );
  }

  const videoUrl = lesson.videoUrl || lesson.video || "";
  const audioUrl = lesson.audioUrl || "";
  const isHTMLLesson = /\.html?($|[?#])/i.test(videoUrl);
  const StageIcon = STAGE_ICONS[type] || BookOpen;
  const completionReady = canCompleteStage();

  const validQuestions = questions.every(isValidQuestion);
  const allQuestionsAnswered = questions.every(
    (_, index) =>
      answers[index] !== undefined &&
      answers[index] !== null &&
      answers[index] !== ""
  );

  return (
    <main className={`lesson-page course-${course.color || "green"}`}>
      <header className="lesson-topbar">
        <nav className="lesson-topbar-nav" aria-label="Learning navigation">
          <Link to="/dashboard" className="lesson-home-link">
            <House size={17} />
            <span>Home</span>
          </Link>

          <span className="lesson-nav-divider">/</span>

          <Link to={`/study/${courseId}`} className="lesson-back">
            <ArrowLeft size={17} />
            <span>Study Map</span>
          </Link>
        </nav>

        <div className="lesson-topbar-center">
          <span className="lesson-topbar-icon">
            {course.icon || "🐍"}
          </span>
          <span>{course.title || "Python journey"}</span>
        </div>

        <div className="lesson-topbar-status">
          <span className="lesson-heart-count" title="Remaining hearts">
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
          <section className="lesson-progress-panel">
            <div className="lesson-progress-heading">
              <span>YOUR LEARNING JOURNEY</span>
              <span>
                Lesson {lessonIndex + 1} of {lessons.length}
              </span>
            </div>

            <div className="lesson-course-progress">
              <div
                className="lesson-course-progress-fill"
                style={{ width: `${courseProgress}%` }}
              />
            </div>

            <div className="lesson-course-progress-meta">
              <span>{completedCount} topics completed</span>
              <strong>{courseProgress}%</strong>
            </div>
          </section>

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

                <span className={`lesson-type-badge type-${type}`}>
                  {STAGE_LABELS[type]}
                </span>
              </div>
            </div>

            <div className="lesson-stage-progress">
              <div className="lesson-stage-progress-heading">
                <strong>Topic journey</strong>
                <span>{completedStages.length}/4 stages complete</span>
              </div>

              <div className="lesson-stage-list">
                {STAGES.map((stage, index) => {
                  const Icon = STAGE_ICONS[stage] || BookOpen;
                  const completed = isStageComplete(
                    stageProgress,
                    lesson.id,
                    stage
                  );

                  const unlocked =
                    completed ||
                    isStageUnlocked(stageProgress, lesson.id, stage);

                  return (
                    <Link
                      key={stage}
                      to={
                        unlocked
                          ? `/study/${courseId}/lesson/${lesson.id}?stage=${stage}`
                          : "#"
                      }
                      onClick={(event) => {
                        if (!unlocked) event.preventDefault();
                      }}
                      aria-current={stage === type ? "step" : undefined}
                      aria-disabled={!unlocked}
                      className={[
                        "lesson-stage-item",
                        stage === type ? "is-current-stage" : "",
                        completed ? "is-stage-complete" : "",
                        !unlocked ? "is-stage-locked" : "",
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

                      <span>{STAGE_LABELS[stage]}</span>
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
                  title={lesson.videoTitle || `Explore ${lesson.title}`}
                  description="Watch the lesson or review the learning material before continuing."
                />

                {videoUrl ? (
                  <div className="lesson-video-frame">
                    {isHTMLLesson ? (
                      <iframe
                        className="lesson-html-frame"
                        src={videoUrl}
                        title={lesson.videoTitle || lesson.title}
                        loading="lazy"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        controls
                        preload="metadata"
                        poster={lesson.videoPoster || undefined}
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
                      This topic does not have a video file configured yet.
                      You can review the concept and mark this stage as
                      reviewed to continue.
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
                      <strong>Listen to the lesson</strong>
                      <audio controls preload="none">
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
                  disabled={Boolean(lessonReward.video)}
                >
                  {lessonReward.video ? (
                    <>
                      <CheckCircle2 size={18} />
                      Video reward collected
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

                {lessonReward.video && (
                  <p className="lesson-inline-success">
                    <CheckCircle2 size={17} />
                    You have already collected the video reward.
                  </p>
                )}
              </section>
            )}

            {/* CONCEPT STAGE */}
            {type === "concept" && (
              <section className="lesson-content-section">
                <SectionHeading
                  icon={BookOpen}
                  eyebrow="UNDERSTAND THE IDEA"
                  title="Learn the concept"
                  description="Understand the idea first, then study the example."
                />

                <div className="lesson-explanation">
                  {lesson.explanation}
                </div>

                {lesson.example && (
                  <div className="lesson-example">
                    <div className="lesson-code-heading">
                      <span>
                        <Code2 size={17} />
                        Example code
                      </span>
                      <span className="lesson-code-language">Python</span>
                    </div>

                    <pre className="lesson-code-block">
                      <code>{lesson.example}</code>
                    </pre>

                    {lesson.expectedOutput !== undefined &&
                      lesson.expectedOutput !== null && (
                        <div className="lesson-output">
                          <div className="lesson-output-heading">
                            <Terminal size={16} />
                            Expected output
                          </div>
                          <pre>
                            <code>{String(lesson.expectedOutput)}</code>
                          </pre>
                        </div>
                      )}
                  </div>
                )}

                {lesson.activities?.length > 0 && (
                  <div className="lesson-activities">
                    <h3>Try these mini activities</h3>

                    <div className="lesson-activity-list">
                      {lesson.activities.map((activity, index) => (
                        <div
                          className="lesson-activity-card"
                          key={`${activity.type || "activity"}-${index}`}
                        >
                          <span className="lesson-activity-number">
                            {index + 1}
                          </span>

                          <div>
                            <strong>
                              {String(
                                activity.type || "activity"
                              ).replaceAll("-", " ")}
                            </strong>

                            <p>
                              {activity.prompt ||
                                "Review the example and practise the concept."}
                            </p>

                            {activity.code && (
                              <pre>
                                <code>{activity.code}</code>
                              </pre>
                            )}

                            {activity.expectedOutput !== undefined && (
                              <p className="lesson-activity-output">
                                Expected output:{" "}
                                {String(activity.expectedOutput)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lesson.question && lesson.options?.length > 0 && (
                  <div className="lesson-quick-check">
                    <span className="lesson-eyebrow">QUICK CHECK</span>
                    <h3>{lesson.question}</h3>

                    <div className="lesson-quick-options">
                      {lesson.options.map((option, index) => (
                        <div
                          className="lesson-quick-option"
                          key={`${option}-${index}`}
                        >
                          <span>{String.fromCharCode(65 + index)}</span>
                          {option}
                        </div>
                      ))}
                    </div>

                    <p>
                      You can test your understanding in the Quiz stage.
                    </p>
                  </div>
                )}
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

                  {lesson.expectedResult !== undefined &&
                    lesson.expectedResult !== null && (
                      <div className="lesson-challenge-output">
                        <strong>Expected result</strong>
                        <pre>
                          <code>{String(lesson.expectedResult)}</code>
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
                    setPracticeCode(event.target.value);
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
                    <Play size={17} fill="currentColor" />
                    Preview output
                  </button>

                  <button
                    type="button"
                    className="lesson-reset-button"
                    onClick={() => {
                      setPracticeCode(practice.starterCode);
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
                    onClick={() => setShowHint((value) => !value)}
                  >
                    <Lightbulb size={16} />
                    {showHint ? "Hide hint" : "Show hint"}
                  </button>
                </div>

                <div
                  id="lesson-runner-note"
                  className="lesson-runner-notice"
                >
                  <Lightbulb size={18} />
                  <p>
                    The current preview recognises simple print()
                    statements only. It does not run loops, conditions,
                    functions, imports, or arbitrary Python code.
                  </p>
                </div>

                {showHint && (
                  <div className="lesson-hint-content">
                    <strong>Hint:</strong> {practice.hint || lesson.hint ||
                      "Read the instructions and change the starter code one step at a time."}
                  </div>
                )}

                {practiceOutput !== null && (
                  <div className="lesson-live-output" aria-live="polite">
                    <div className="lesson-output-heading">
                      <Terminal size={17} />
                      Preview output
                    </div>

                    <pre>
                      <code>
                        {practiceOutput || "(No output to display)"}
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

                {questions.length > 0 && validQuestions ? (
                  quizSubmitted ? (
                    <div className="lesson-score-card" role="status">
                      <span className="lesson-score-icon">
                        <Trophy size={30} />
                      </span>

                      <h3>
                        {currentScore?.score === currentScore?.maxScore
                          ? "Perfect score!"
                          : "Checkpoint complete!"}
                      </h3>

                      <p className="lesson-score-number">
                        {currentScore?.score}/{currentScore?.maxScore}
                      </p>

                      <p>
                        {Math.round(
                          ((currentScore?.score || 0) /
                            Math.max(currentScore?.maxScore || 1, 1)) *
                            100
                        )}
                        % correct
                      </p>

                      <p>
                        Review the answers, then continue when you're ready.
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
                        <strong>{questions.length} questions</strong>
                        <span>
                          {Object.keys(answers).filter(
                            (key) => answers[key] !== undefined
                          ).length}{" "}
                          of {questions.length} answered
                        </span>
                      </div>

                      <div className="lesson-quiz-progress">
                        <div
                          style={{
                            width: `${
                              (Object.keys(answers).filter(
                                (key) => answers[key] !== undefined
                              ).length /
                                questions.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>

                      {questions.map((question, questionIndex) => (
                        <fieldset
                          className="lesson-question-card"
                          key={`${questionIndex}-${question.question}`}
                        >
                          <legend>
                            <span className="lesson-question-number">
                              {questionIndex + 1}
                            </span>

                            <span>{question.question}</span>
                          </legend>

                          <div className="lesson-quiz-options">
                            {question.options.map((option, optionIndex) => (
                              <label
                                className={[
                                  "lesson-quiz-option",
                                  Number(answers[questionIndex]) ===
                                  optionIndex
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
                                    Number(answers[questionIndex]) ===
                                    optionIndex
                                  }
                                  onChange={() =>
                                    setAnswers((previous) => ({
                                      ...previous,
                                      [questionIndex]: optionIndex,
                                    }))
                                  }
                                />

                                <span className="lesson-option-letter">
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>

                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      ))}

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
                          Answer every question to submit your quiz.
                        </p>
                      )}
                    </form>
                  )
                ) : (
                  <div className="lesson-empty-quiz">
                    <h3>Quiz questions need attention</h3>
                    <p>
                      Each quiz question needs a question string, an
                      options array, and a valid zero-based answer index.
                      Check this lesson in pythonLessons.js.
                    </p>
                  </div>
                )}

                {savedQuiz && !currentScore && (
                  <p className="lesson-saved-score">
                    Previous score:{" "}
                    <strong>
                      {savedQuiz.score}/{savedQuiz.maxScore}
                    </strong>
                  </p>
                )}
              </section>
            )}

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
                  onClick={completeStage}
                  disabled={!completionReady}
                >
                  Complete this stage
                  <CheckCircle2 size={18} />
                </button>
              )}
            </footer>

            {!currentStageCompleted && !completionReady && (
              <p className="lesson-completion-note">
                {type === "video" &&
                  "Mark the video as watched or mark the stage as reviewed."}
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

        <aside className="lesson-sidebar">
          <section className="lesson-companion">
            <div className="lesson-companion-avatar">🦊</div>
            <span className="lesson-companion-label">YOUR COMPANION</span>
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
              <strong>{completedStages.length}/4</strong>
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
                  width: `${(completedStages.length / 4) * 100}%`,
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
                    {nextLesson.xp ?? DEFAULT_COMPLETION_XP} XP
                  </span>
                </div>
              </>
            ) : (
              <p>You've reached the final lesson in this course!</p>
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
              {currentStreak} day{currentStreak === 1 ? "" : "s"}
            </strong>

            <p className="lesson-sidebar-muted">
              {activeToday
                ? "You've been active today. Keep learning!"
                : "Complete a learning stage to record activity."}
            </p>

            {streakLoading && (
              <p className="lesson-sidebar-muted">Updating streak…</p>
            )}

            {streakError && (
              <p className="lesson-streak-error">{streakError}</p>
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
        onContinue={continueAfterCelebration}
        onClose={() => setShowCompletionModal(false)}
      />
    </main>
  );
}