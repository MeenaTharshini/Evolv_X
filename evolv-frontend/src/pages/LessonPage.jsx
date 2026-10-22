import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Heart,
  House,
  Lightbulb,
  PlayCircle,
  RotateCcw,
  Terminal,
  Trophy,
  Volume2,
  Zap,
} from "lucide-react";
import { recordLearningActivity } from "../services/api";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

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
  isTopicComplete,
  saveStageCompletion,
} from "../utils/lessonProgress";

import "../styles/lesson.css";

const DEFAULT_COURSE = "python";
const STARTING_HEARTS = 3;
const VIDEO_XP = 10;
const DEFAULT_COMPLETION_XP = 20;

const xpKey = (id) => `evolv_${id}_xp`;
const heartsKey = (id) => `evolv_${id}_hearts`;
const rewardKey = (id) => `evolv_${id}_lesson_rewards`;
const quizScoreKey = (id) => `evolv_${id}_quiz_scores`;

const STAGE_LABELS = {
  video: "Video",
  concept: "Concept",
  "hands-on": "Hands-on",
  quiz: "Quiz",
};

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value) ?? fallback;
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

function getPractice(lesson) {
  return {
    title:
      lesson.practice?.title ||
      `Practice: ${lesson.title}`,

    prompt:
      lesson.practice?.prompt ||
      lesson.instructions ||
      lesson.description ||
      "Complete the coding task.",

    starterCode:
      lesson.practice?.starterCode ??
      lesson.starterCode ??
      lesson.example ??
      'print("Hello, EVOLV!")',

    hint:
      lesson.practice?.hint ||
      lesson.hint ||
      "",
  };
}

/*
 * This is only a simple print() preview.
 * It does not execute Python and must not be treated
 * as a real Python interpreter or code validator.
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
      "Preview only. Your code has not been executed by a Python interpreter.",
  };
}

function getQuestions(lesson) {
  if (
    Array.isArray(lesson.quizQuestions) &&
    lesson.quizQuestions.length > 0
  ) {
    return lesson.quizQuestions.slice(0, 5);
  }

  if (
    lesson.question &&
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

function isValidQuizQuestion(question) {
  if (
    !question ||
    typeof question.question !== "string" ||
    !Array.isArray(question.options) ||
    question.options.length === 0
  ) {
    return false;
  }

  const answer = Number(question.answer);

  return (
    Number.isInteger(answer) &&
    answer >= 0 &&
    answer < question.options.length
  );
}

export default function LessonPage() {
  const { courseId = DEFAULT_COURSE, lessonId } = useParams();

  const [searchParams] = useSearchParams();

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

  const lessons = useMemo(() => {
    if (courseId === DEFAULT_COURSE) {
      return pythonLessons;
    }

    return course?.lessons ?? [];
  }, [courseId, course]);

  const lesson = useMemo(() => {
    if (courseId === DEFAULT_COURSE) {
      return getPythonLesson(lessonId) ?? null;
    }

    return (
      lessons.find(
        (item) => Number(item.id) === Number(lessonId)
      ) ?? null
    );
  }, [courseId, lessonId, lessons]);

  /*
   * The URL stage takes priority.
   * lesson.type is only the default when no valid stage is supplied.
   */
  const type = STAGES.includes(requestedStage)
    ? requestedStage
    : normalizeType(lesson?.type);

  const lessonKey = `${courseId}_${lessonId}`;

  const [stageProgress, setStageProgress] = useState(() =>
    getStageProgress(courseId)
  );

  const [xp, setXp] = useState(() =>
    readNumber(xpKey(courseId))
  );

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

  const lessonReward = rewards[lessonKey] || {};

  const practice = lesson ? getPractice(lesson) : null;
  const questions = lesson ? getQuestions(lesson) : [];

  const lessonIndex = lessons.findIndex(
    (item) => Number(item.id) === Number(lesson?.id)
  );

  const nextLesson =
    lessonIndex >= 0
      ? lessons[lessonIndex + 1] ?? null
      : null;

  const completedStages = lesson
    ? getCompletedStages(stageProgress, lesson.id)
    : [];

  const currentStageCompleted = lesson
    ? isStageComplete(stageProgress, lesson.id, type)
    : false;

  const topicCompleted = lesson
    ? isTopicComplete(stageProgress, lesson.id)
    : false;

  const completedCount = lessons.filter((item) =>
    isTopicComplete(stageProgress, item.id)
  ).length;

  const courseProgress = lessons.length
    ? Math.round((completedCount / lessons.length) * 100)
    : 0;

  const lessonProgress =
    lessons.length > 0 && lessonIndex >= 0
      ? Math.round(((lessonIndex + 1) / lessons.length) * 100)
      : 0;

  const savedQuiz = quizScores[lessonKey];

  function getContinueInfo(progress = stageProgress) {
    if (!lesson) {
      return {
        to: `/study/${courseId}`,
        label: "Back to Study Map",
      };
    }

    const nextStageForThisTopic = STAGES.find(
      (stage) => !isStageComplete(progress, lesson.id, stage)
    );

    if (nextStageForThisTopic) {
      return {
        to: `/study/${courseId}/lesson/${lesson.id}?stage=${nextStageForThisTopic}`,
        label: `Continue to ${STAGE_LABELS[nextStageForThisTopic]}`,
      };
    }

    if (nextLesson) {
      const nextLessonStage =
        STAGES.find(
          (stage) => !isStageComplete(progress, nextLesson.id, stage)
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
  }

  const continueInfo = getContinueInfo();

  /*
   * Refresh when progress changes elsewhere in EVOLV,
   * such as when the learner returns to the Study Map.
   */
  useEffect(() => {
    function refreshProgress() {
      setStageProgress(getStageProgress(courseId));
      setXp(readNumber(xpKey(courseId)));
      setHearts(
        readNumber(heartsKey(courseId), STARTING_HEARTS)
      );
      setRewards(readObject(rewardKey(courseId)));
      setQuizScores(readObject(quizScoreKey(courseId)));
    }

    refreshProgress();

    window.addEventListener(
      "evolv-progress-updated",
      refreshProgress
    );

    window.addEventListener("storage", refreshProgress);

    return () => {
      window.removeEventListener(
        "evolv-progress-updated",
        refreshProgress
      );

      window.removeEventListener(
        "storage",
        refreshProgress
      );
    };
  }, [courseId]);

  /*
   * Reset temporary activity state when the learner
   * opens another topic or changes stages.
   */
  useEffect(() => {
    setVideoFinished(false);

    setPracticeCode(
      lesson ? getPractice(lesson).starterCode : ""
    );

    setPracticeOutput(null);
    setPracticeMessage("");
    setTaskChecked(false);
    setShowHint(false);
    setAnswers({});
    setQuizSubmitted(false);
    setCurrentScore(null);
  }, [courseId, lessonId, lesson, requestedStage]);

  // Keep Home and Study Map in sync with the exact lesson stage being viewed.
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

  function notifyProgressUpdated() {
    window.dispatchEvent(
      new Event("evolv-progress-updated")
    );
  }

  function saveRewards(nextRewards, nextXP = xp) {
    setRewards(nextRewards);
    setXp(nextXP);

    try {
      localStorage.setItem(
        rewardKey(courseId),
        JSON.stringify(nextRewards)
      );

      localStorage.setItem(
        xpKey(courseId),
        String(nextXP)
      );

      localStorage.setItem(
        heartsKey(courseId),
        String(hearts)
      );
    } catch (error) {
      console.error(
        "Could not save EVOLV rewards:",
        error
      );
    }

    notifyProgressUpdated();
  }

  function finishVideo() {
    setVideoFinished(true);

    /*
     * Check storage as well as React state to reduce
     * the risk of awarding the same video XP twice.
     */
    const latestRewards = readObject(rewardKey(courseId));
    const latestLessonReward =
      latestRewards[lessonKey] || {};

    if (latestLessonReward.video || lessonReward.video) {
      return;
    }

    const nextRewards = {
      ...latestRewards,
      [lessonKey]: {
        ...latestLessonReward,
        video: true,
      },
    };

    const nextXP =
      readNumber(xpKey(courseId)) + VIDEO_XP;

    saveRewards(nextRewards, nextXP);
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
      !questions.length ||
      quizSubmitted ||
      !questions.every(isValidQuizQuestion)
    ) {
      return;
    }

    const allAnswered = questions.every(
      (_, index) =>
        answers[index] !== undefined &&
        answers[index] !== null &&
        answers[index] !== ""
    );

    if (!allAnswered) {
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

    const result = {
      score,
      maxScore: questions.length,
      submittedAt: new Date().toISOString(),
    };

    const latestScores = readObject(quizScoreKey(courseId));

    const updatedScores = {
      ...latestScores,
      [lessonKey]: result,
    };

    setQuizScores(updatedScores);
    setCurrentScore(result);
    setQuizSubmitted(true);

    try {
      localStorage.setItem(
        quizScoreKey(courseId),
        JSON.stringify(updatedScores)
      );
    } catch (error) {
      console.error(
        "Could not save quiz score:",
        error
      );
    }

    notifyProgressUpdated();
  }

  function canCompleteStage() {
    if (!lesson || currentStageCompleted) {
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
        questions.every(isValidQuizQuestion) &&
        quizSubmitted
      );
    }

    return false;
  }

  function completeStage() {
    if (!lesson || !canCompleteStage()) {
      return;
    }

    try {
      /*
       * Save only this stage.
       * The topic becomes complete only when all four
       * stages have been saved by lessonProgress.js.
       */
      const updatedProgress = saveStageCompletion(
        courseId,
        lesson.id,
        type
      );

      setStageProgress(updatedProgress);

      // Record learning activity on the authenticated backend so the
      // learner's streak is maintained across refreshes and devices.
      recordLearningActivity({
        activityType: "lesson",
        activityRef: `${courseId}-${lesson.id}-${type}`,
      })
        .then((streakData) => {
          const currentStreak = Number(streakData?.currentStreak) || 0;

          localStorage.setItem(
            `evolv_${courseId}_streak`,
            String(currentStreak)
          );

          notifyProgressUpdated();
        })
        .catch((activityError) => {
          // Stage progress is already saved locally; a streak API failure
          // should not prevent the learner from continuing the lesson.
          console.error(
            "Could not record learning streak:",
            activityError
          );
        });

      const nowTopicCompleted = isTopicComplete(
        updatedProgress,
        lesson.id
      );

      /*
       * Award topic XP only once, after all four stages.
       */
      const latestRewards = readObject(rewardKey(courseId));
      const latestLessonReward =
        latestRewards[lessonKey] || {};

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
      } else {
        notifyProgressUpdated();
      }

      // Stay here so the learner can see the completion message.
      // The footer changes to a clear Continue action after progress updates.
    } catch (error) {
      console.error(
        "Could not save stage progress:",
        error
      );
    }
  }

  if (!course || !lesson || lessonIndex < 0) {
    return (
      <main className="lesson-page lesson-not-found">
        <section className="lesson-card lesson-error-card">
          <span className="lesson-error-icon">🌱</span>

          <h1>Quest not found</h1>

          <p>
            This lesson may have moved, or the course does not exist.
          </p>

          <Link
            to="/dashboard"
            className="lesson-primary-button"
          >
            Return to dashboard
            <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    );
  }

  const videoUrl = lesson.videoUrl || lesson.video || "";
  const audioUrl = lesson.audioUrl || "";
  const videoPoster = lesson.videoPoster || "";

  const completionReady = canCompleteStage();

  const isHTMLLesson = /\.html?($|[?#])/i.test(videoUrl);

  return (
    <main
      className={`lesson-page course-${course.color || "green"}`}
    >
      <header className="lesson-topbar">
        <nav className="lesson-topbar-nav" aria-label="Learning navigation">
          <Link to="/dashboard" className="lesson-home-link">
            <House size={16} />
            <span>Home</span>
          </Link>

          <span className="lesson-nav-divider" aria-hidden="true">/</span>

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

          <span>{course.title || "Python journey"}</span>
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
          <div className="lesson-progress-panel">
            <div className="lesson-progress-heading">
              <span>YOUR LEARNING JOURNEY</span>

              <span>
                Lesson {lessonIndex + 1} of {lessons.length}
              </span>
            </div>

            <div
              className="lesson-progress-track"
              role="progressbar"
              aria-label="Course topic completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={courseProgress}
            >
              <div
                className="lesson-progress-fill"
                style={{ width: `${courseProgress}%` }}
              />
            </div>
          </div>

          <article className="lesson-card">
            <div className="lesson-heading">
              <div className="lesson-heading-icon">
                {topicCompleted ? (
                  <CheckCircle2 size={30} />
                ) : (
                  <BookOpen size={30} />
                )}
              </div>

              <div className="lesson-heading-copy">
                <div className="lesson-eyebrow">
                  {course.language || course.title || "Programming"}
                  <span>•</span>
                  {lesson.area || "Learning quest"}
                </div>

                <h1>{lesson.title}</h1>

                <p>{lesson.description}</p>
              </div>
            </div>

            <div className="lesson-meta">
              <span>
                <Clock3 size={17} />
                {lesson.duration || "5 min"}
              </span>

              <span>
                <Zap size={17} />
                +{lesson.xp ?? DEFAULT_COMPLETION_XP} topic XP
              </span>

              <span className="lesson-difficulty">
                {lesson.difficulty || "Beginner"}
              </span>

              <span className={`lesson-type-badge type-${type}`}>
                {STAGE_LABELS[type]}
              </span>
            </div>

            {/* Four-stage topic progress */}
            <section className="lesson-stage-progress">
              <div className="lesson-stage-progress-heading">
                <strong>Topic stages</strong>

                <span>{completedStages.length}/4 completed</span>
              </div>

              <div className="lesson-stage-list">
                {STAGES.map((stage, index) => {
                  const done = isStageComplete(
                    stageProgress,
                    lesson.id,
                    stage
                  );

                  const current = stage === type;

                  return (
                    <div
                      key={stage}
                      className={[
                        "lesson-stage-item",
                        done ? "is-stage-complete" : "",
                        current ? "is-current-stage" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="lesson-stage-number">
                        {done ? (
                          <Check size={15} />
                        ) : (
                          index + 1
                        )}
                      </span>

                      <span>{STAGE_LABELS[stage]}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="lesson-divider" />

            {/* VIDEO STAGE */}
            {type === "video" && (
              <section className="lesson-content-section">
                <div className="lesson-section-heading">
                  <span className="lesson-section-icon video-icon">
                    <PlayCircle size={20} />
                  </span>

                  <div>
                    <h2>
                      {lesson.videoTitle || "Watch the lesson"}
                    </h2>

                    <p>
                      Watch the lesson, then mark this stage complete.
                    </p>
                  </div>
                </div>

                {videoUrl ? (
                  <div className="lesson-video-frame">
                    {isHTMLLesson ? (
                      <iframe
                        key={videoUrl}
                        src={videoUrl}
                        title={lesson.videoTitle || lesson.title}
                        className="lesson-html-frame"
                        loading="eager"
                        allow="fullscreen"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        key={videoUrl}
                        controls
                        playsInline
                        preload="metadata"
                        poster={videoPoster || undefined}
                        onEnded={finishVideo}
                      >
                        <source src={videoUrl} />

                        Your browser does not support HTML video.
                      </video>
                    )}
                  </div>
                ) : (
                  <div className="lesson-video-placeholder">
                    <PlayCircle size={38} />

                    <h3>No video added yet</h3>

                    <p>
                      You can still complete this stage after reviewing
                      the available lesson material.
                    </p>
                  </div>
                )}

                {lesson.videoDescription && (
                  <p className="lesson-muted-copy">
                    {lesson.videoDescription}
                  </p>
                )}

                {!videoFinished && !currentStageCompleted && (
                  <button
                    type="button"
                    className="lesson-secondary-button"
                    onClick={finishVideo}
                  >
                    <Check size={17} />
                    Mark video as watched
                  </button>
                )}

                {videoFinished && (
                  <p className="lesson-inline-success">
                    <CheckCircle2 size={17} />
                    Video stage ready to complete.
                  </p>
                )}

                {currentStageCompleted && (
                  <p className="lesson-inline-success">
                    <CheckCircle2 size={17} />
                    This video stage is already saved.
                  </p>
                )}
              </section>
            )}

            {/* CONCEPT STAGE */}
            {type === "concept" && (
              <section className="lesson-content-section">
                <div className="lesson-section-heading">
                  <span className="lesson-section-icon">
                    <Lightbulb size={20} />
                  </span>

                  <div>
                    <h2>Understand the concept</h2>

                    <p>
                      Read the explanation and study the example.
                    </p>
                  </div>
                </div>

                <div className="lesson-explanation">
                  {lesson.explanation || lesson.description}
                </div>

                {audioUrl && (
                  <div className="lesson-audio-card">
                    <Volume2 size={19} />

                    <div>
                      <strong>Listen to the explanation</strong>

                      <audio controls preload="metadata">
                        <source src={audioUrl} />

                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  </div>
                )}

                {!audioUrl && lesson.audioText && (
                  <div className="lesson-audio-text">
                    <Volume2 size={17} />
                    <span>{lesson.audioText}</span>
                  </div>
                )}

                {lesson.example && (
                  <div className="lesson-example">
                    <div className="lesson-code-heading">
                      <span>
                        <Code2 size={17} />
                        Example code
                      </span>

                      <span className="lesson-code-language">
                        {course.language || "Python"}
                      </span>
                    </div>

                    <pre className="lesson-code-block">
                      <code>{lesson.example}</code>
                    </pre>

                    {lesson.expectedOutput != null && (
                      <div className="lesson-output">
                        <div className="lesson-output-heading">
                          <CheckCircle2 size={16} />
                          Expected output
                        </div>

                        <pre>
                          <code>{lesson.expectedOutput}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* HANDS-ON STAGE */}
            {type === "hands-on" && (
              <section className="lesson-content-section">
                <div className="lesson-section-heading">
                  <span className="lesson-section-icon practice-icon">
                    <Terminal size={20} />
                  </span>

                  <div>
                    <h2>Hands-on coding challenge</h2>

                    <p>
                      Read the task, try the code, and check your work.
                    </p>
                  </div>
                </div>

                <div className="lesson-challenge-card">
                  <span className="lesson-challenge-label">
                    YOUR TASK
                  </span>

                  <h3>{practice.title}</h3>

                  <p>{practice.prompt}</p>
                </div>

                <label
                  className="lesson-editor-label"
                  htmlFor="practice-code"
                >
                  Your code
                </label>

                <textarea
                  id="practice-code"
                  className="lesson-code-editor"
                  value={practiceCode}
                  onChange={(event) => {
                    setPracticeCode(event.target.value);
                    setPracticeOutput(null);
                    setPracticeMessage("");
                    setTaskChecked(false);
                  }}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  disabled={currentStageCompleted}
                />

                <div className="lesson-editor-actions">
                  <button
                    type="button"
                    className="lesson-run-button"
                    onClick={runPractice}
                    disabled={
                      !practiceCode.trim() ||
                      currentStageCompleted
                    }
                  >
                    <Terminal size={17} />
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
                    disabled={currentStageCompleted}
                  >
                    <RotateCcw size={15} />
                    Reset code
                  </button>
                </div>

                <div className="lesson-runner-notice">
                  <Lightbulb size={16} />

                  <span>
                    This is a limited print() preview, not a full Python
                    interpreter. The task completion button is a
                    self-check, not automatic code validation.
                  </span>
                </div>

                {practiceOutput !== null && (
                  <div className="lesson-output lesson-live-output">
                    <div className="lesson-output-heading">
                      <Terminal size={16} />
                      Preview output
                    </div>

                    <pre>
                      <code>
                        {practiceOutput || "(No output)"}
                      </code>
                    </pre>

                    <p className="lesson-preview-message">
                      {practiceMessage}
                    </p>
                  </div>
                )}

                {practice.hint && (
                  <div className="lesson-hint">
                    <button
                      type="button"
                      className="lesson-hint-toggle"
                      onClick={() =>
                        setShowHint((value) => !value)
                      }
                      aria-expanded={showHint}
                    >
                      <Lightbulb size={18} />

                      <span>Need a hint?</span>

                      <span className="lesson-hint-symbol">
                        {showHint ? "−" : "+"}
                      </span>
                    </button>

                    {showHint && (
                      <p className="lesson-hint-content">
                        {practice.hint}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  className="lesson-primary-button lesson-check-task"
                  disabled={
                    !practiceCode.trim() ||
                    currentStageCompleted
                  }
                  onClick={() => setTaskChecked(true)}
                >
                  <CheckCircle2 size={17} />

                  {taskChecked
                    ? "Task checked"
                    : "I have completed the task"}
                </button>

                {taskChecked && (
                  <p className="lesson-inline-success">
                    <CheckCircle2 size={17} />
                    Self-check complete. Review your code before saving
                    this stage.
                  </p>
                )}
              </section>
            )}

            {/* QUIZ STAGE */}
            {type === "quiz" && (
              <section className="lesson-content-section">
                <div className="lesson-section-heading">
                  <span className="lesson-section-icon quiz-icon">
                    <Trophy size={20} />
                  </span>

                  <div>
                    <h2>Knowledge check</h2>

                    <p>
                      {questions.length} questions · one mark per
                      correct answer.
                    </p>
                  </div>
                </div>

                {questions.length > 0 &&
                questions.every(isValidQuizQuestion) ? (
                  <form
                    className="lesson-quiz-form"
                    onSubmit={submitQuiz}
                  >
                    {questions.map((item, index) => (
                      <fieldset
                        className="lesson-question"
                        key={`${lessonKey}-${index}`}
                        disabled={quizSubmitted}
                      >
                        <legend>
                          <span>Question {index + 1}</span>
                          {item.question}
                        </legend>

                        <div className="lesson-options">
                          {item.options.map(
                            (option, optionIndex) => {
                              const selected =
                                Number(answers[index]) ===
                                optionIndex;

                              const correct =
                                Number(item.answer) ===
                                optionIndex;

                              const resultClass = quizSubmitted
                                ? correct
                                  ? "option-correct"
                                  : selected
                                    ? "option-wrong"
                                    : ""
                                : "";

                              return (
                                <label
                                  className={[
                                    "lesson-option",
                                    selected
                                      ? "option-selected"
                                      : "",
                                    resultClass,
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                  key={`${index}-${optionIndex}`}
                                >
                                  <input
                                    type="radio"
                                    name={`question-${index}`}
                                    value={optionIndex}
                                    checked={selected}
                                    disabled={quizSubmitted}
                                    onChange={() =>
                                      setAnswers((previous) => ({
                                        ...previous,
                                        [index]: optionIndex,
                                      }))
                                    }
                                  />

                                  <span>{option}</span>

                                  {quizSubmitted && correct && (
                                    <CheckCircle2 size={17} />
                                  )}
                                </label>
                              );
                            }
                          )}
                        </div>

                        {quizSubmitted && item.explanation && (
                          <p className="lesson-question-explanation">
                            {item.explanation}
                          </p>
                        )}
                      </fieldset>
                    ))}

                    {!quizSubmitted ? (
                      <button
                        type="submit"
                        className="lesson-primary-button"
                        disabled={
                          !questions.every(
                            (_, index) =>
                              answers[index] !== undefined &&
                              answers[index] !== null &&
                              answers[index] !== ""
                          )
                        }
                      >
                        Submit answers
                        <ArrowRight size={17} />
                      </button>
                    ) : (
                      <div
                        className="lesson-score-card"
                        role="status"
                      >
                        <Trophy size={25} />

                        <div>
                          <strong>
                            Your score: {currentScore?.score}/
                            {currentScore?.maxScore}
                          </strong>

                          <p>
                            Your quiz score is saved separately from
                            topic-completion XP.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="lesson-secondary-button"
                          onClick={() => {
                            setAnswers({});
                            setQuizSubmitted(false);
                            setCurrentScore(null);
                          }}
                        >
                          Try again
                        </button>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="lesson-empty-quiz">
                    <h3>
                      {questions.length
                        ? "Quiz questions need correction"
                        : "No quiz questions added yet"}
                    </h3>

                    <p>
                      Add a quizQuestions array with a question,
                      an options array, and a zero-based answer index.
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

            {/* STAGE COMPLETION */}
            <footer className="lesson-actions">
              <Link
                to={`/study/${courseId}`}
                className="lesson-secondary-button"
              >
                <ArrowLeft size={17} />
                Return to Study Map
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
                  'Watch the video or select "Mark video as watched".'}

                {type === "quiz" &&
                  "Answer every question and submit your quiz first."}

                {type === "hands-on" &&
                  "Check your coding task before completing this stage."}
              </p>
            )}

            {currentStageCompleted && (
              <div className="lesson-completed-note">
                <CheckCircle2 size={18} />

                {topicCompleted
                  ? "All four stages are complete. This topic is finished!"
                  : `${STAGE_LABELS[type]} is saved. Continue with the remaining stages to complete this topic.`}
              </div>
            )}
          </article>
        </section>

        {/* SIDEBAR */}
        <aside className="lesson-sidebar">
          <section className="lesson-companion">
            <div className="lesson-companion-avatar">🦊</div>

            <span className="lesson-companion-label">
              YOUR COMPANION
            </span>

            <h2>One step at a time!</h2>

            <p>
              {type === "video"
                ? "Watch the lesson, then save your video stage."
                : type === "concept"
                  ? "Read the explanation and understand the key idea."
                  : type === "quiz"
                    ? "Think carefully. Your score is saved separately."
                    : "Experiment with the code and check the task when ready."}
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

                <p className="lesson-sidebar-muted">
                  Finish all four stages to complete this topic.
                </p>
              </>
            ) : (
              <p>
                You've reached the final lesson in this course!
              </p>
            )}
          </section>

          <section className="lesson-tip-card">
            <span>🌱</span>

            <div>
              <h3>Learning tip</h3>

              <p>
                {type === "quiz"
                  ? "Read each option carefully before submitting."
                  : type === "hands-on"
                    ? "Change one thing at a time to understand the result."
                    : "Take your time. Understanding matters more than rushing."}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
