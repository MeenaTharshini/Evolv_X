
import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Heart,
  Lightbulb,
  PlayCircle,
  RotateCcw,
  Terminal,
  Trophy,
  Volume2,
  Zap,
} from "lucide-react";

import { coursePaths } from "../data/coursePaths";
import { pythonLessons, getPythonLesson } from "../data/pythonLessons";
import "../styles/lesson.css";

const DEFAULT_COURSE = "python";
const STARTING_HEARTS = 3;
const VIDEO_XP = 10;
const DEFAULT_COMPLETION_XP = 20;

const progressKey = (id) => `evolv_${id}_completed`;
const xpKey = (id) => `evolv_${id}_xp`;
const heartsKey = (id) => `evolv_${id}_hearts`;
const rewardKey = (id) => `evolv_${id}_lesson_rewards`;
const quizScoreKey = (id) => `evolv_${id}_quiz_scores`;

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}

function readNumber(key, fallback = 0) {
  try {
    const value = localStorage.getItem(key);
    if (value === null || value.trim() === "") return fallback;

    const number = Number(value);
    return Number.isFinite(number) && number >= 0
      ? number
      : fallback;
  } catch {
    return fallback;
  }
}

function readProgress(courseId) {
  const value = readJSON(progressKey(courseId), []);
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .map(Number)
        .filter((id) => Number.isFinite(id) && id > 0)
    ),
  ];
}

function readObject(key) {
  const value = readJSON(key, {});
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeType(type) {
  const value = String(type || "concept").toLowerCase();

  if (["hands-on", "hands_on", "coding", "practice"].includes(value)) {
    return "hands-on";
  }

  return ["video", "quiz"].includes(value) ? value : "concept";
}

function getPractice(lesson) {
  return {
    title: lesson.practice?.title || `Practice: ${lesson.title}`,
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
    hint: lesson.practice?.hint || lesson.hint || "",
  };
}

// Preview simple print() statements only; this is not a Python interpreter.
function previewSimplePrint(code) {
  const output = [];

  for (const rawLine of String(code).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

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
    message: "Simple print() preview only — not a full Python interpreter.",
  };
}

function getQuestions(lesson) {
  if (
    Array.isArray(lesson.quizQuestions) &&
    lesson.quizQuestions.length > 0
  ) {
    return lesson.quizQuestions.slice(0, 5);
  }

  if (lesson.question && Array.isArray(lesson.options)) {
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
  return (
    typeof question.question === "string" &&
    Array.isArray(question.options) &&
    question.options.length > 0 &&
    Number.isInteger(Number(question.answer)) &&
    Number(question.answer) >= 0 &&
    Number(question.answer) < question.options.length
  );
}

export default function LessonPage() {
  const { courseId = DEFAULT_COURSE, lessonId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requestedStage = searchParams.get("stage");
  const validStages = ["video", "concept", "hands-on", "quiz"];
  const course = coursePaths[courseId];

  const lessons = useMemo(
    () =>
      courseId === DEFAULT_COURSE
        ? pythonLessons
        : course?.lessons ?? [],
    [courseId, course]
  );

  const lesson = useMemo(() => {
    if (courseId === DEFAULT_COURSE) {
      return getPythonLesson(lessonId) ?? null;
    }

    return (
      lessons.find((item) => Number(item.id) === Number(lessonId)) ?? null
    );
  }, [courseId, lessonId, lessons]);

  const [completedLessons, setCompletedLessons] = useState(
    () => readProgress(courseId)
  );
  const [xp, setXp] = useState(() => readNumber(xpKey(courseId)));
  const [hearts, setHearts] = useState(
    () => readNumber(heartsKey(courseId), STARTING_HEARTS)
  );
  const [rewards, setRewards] = useState(
    () => readObject(rewardKey(courseId))
  );
  const [quizScores, setQuizScores] = useState(
    () => readObject(quizScoreKey(courseId))
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

  const lessonKey = `${courseId}_${lessonId}`;
  const lessonReward = rewards[lessonKey] || {};

  // The URL stage takes priority; otherwise use the lesson's configured type.
  const type =
    validStages.includes(requestedStage)
      ? requestedStage
      : normalizeType(lesson?.type);

  const isCompleted =
    Boolean(lesson) && completedLessons.includes(Number(lesson.id));

  const practice = lesson ? getPractice(lesson) : null;
  const questions = lesson ? getQuestions(lesson) : [];

  const lessonIndex = lessons.findIndex(
    (item) => Number(item.id) === Number(lesson?.id)
  );

  const nextLesson =
    lessonIndex >= 0 ? lessons[lessonIndex + 1] ?? null : null;

  const completedCount = completedLessons.filter((id) =>
    lessons.some((item) => Number(item.id) === Number(id))
  ).length;

  const courseProgress = lessons.length
    ? Math.round((completedCount / lessons.length) * 100)
    : 0;

  const lessonProgress =
    lessons.length > 0 && lessonIndex >= 0
      ? Math.round(((lessonIndex + 1) / lessons.length) * 100)
      : 0;

  const savedQuiz = quizScores[lessonKey];

  useEffect(() => {
    const refreshProgress = () => {
      setCompletedLessons(readProgress(courseId));
      setXp(readNumber(xpKey(courseId)));
      setHearts(readNumber(heartsKey(courseId), STARTING_HEARTS));
      setRewards(readObject(rewardKey(courseId)));
      setQuizScores(readObject(quizScoreKey(courseId)));
    };

    refreshProgress();
    window.addEventListener("evolv-progress-updated", refreshProgress);
    window.addEventListener("storage", refreshProgress);

    return () => {
      window.removeEventListener("evolv-progress-updated", refreshProgress);
      window.removeEventListener("storage", refreshProgress);
    };
  }, [courseId]);

  // Reset temporary activity state when the lesson or stage changes.
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

  function notifyProgressUpdated() {
    window.dispatchEvent(new Event("evolv-progress-updated"));
  }

  function saveRewards(nextRewards, nextXP = xp) {
    setRewards(nextRewards);
    setXp(nextXP);

    try {
      localStorage.setItem(rewardKey(courseId), JSON.stringify(nextRewards));
      localStorage.setItem(xpKey(courseId), String(nextXP));
      localStorage.setItem(heartsKey(courseId), String(hearts));
    } catch (error) {
      console.error("Could not save EVOLV rewards:", error);
    }

    notifyProgressUpdated();
  }

  function finishVideo() {
    if (videoFinished) return;
    setVideoFinished(true);

    if (isCompleted || lessonReward.video) return;

    const nextRewards = {
      ...rewards,
      [lessonKey]: {
        ...lessonReward,
        video: true,
      },
    };

    saveRewards(nextRewards, xp + VIDEO_XP);
  }

  function runPractice() {
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

    const score = questions.reduce(
      (total, question, index) =>
        total +
        (Number(answers[index]) === Number(question.answer) ? 1 : 0),
      0
    );

    const result = {
      score,
      maxScore: questions.length,
      submittedAt: new Date().toISOString(),
    };

    const updatedScores = {
      ...quizScores,
      [lessonKey]: result,
    };

    setQuizScores(updatedScores);
    setCurrentScore(result);
    setQuizSubmitted(true);

    try {
      localStorage.setItem(quizScoreKey(courseId), JSON.stringify(updatedScores));
    } catch (error) {
      console.error("Could not save quiz score:", error);
    }

    notifyProgressUpdated();
  }

  function canComplete() {
    if (!lesson || isCompleted) return false;
    if (type === "video") return videoFinished;
    if (type === "quiz") return questions.length > 0 && quizSubmitted;
    if (type === "hands-on") return taskChecked;
    return true;
  }

  function completeLesson() {
    if (!lesson || isCompleted || !canComplete()) return;

    const updatedCompleted = [
      ...new Set([...completedLessons, Number(lesson.id)]),
    ];

    const alreadyRewarded = Boolean(lessonReward.completion);
    const rawXP = Number(lesson.xp ?? DEFAULT_COMPLETION_XP);
    const completionXP =
      Number.isFinite(rawXP) && rawXP >= 0
        ? rawXP
        : DEFAULT_COMPLETION_XP;

    const nextXP = alreadyRewarded ? xp : xp + completionXP;

    const nextRewards = {
      ...rewards,
      [lessonKey]: {
        ...lessonReward,
        completion: true,
      },
    };

    try {
      localStorage.setItem(
        progressKey(courseId),
        JSON.stringify(updatedCompleted)
      );
    } catch (error) {
      console.error("Could not save lesson completion:", error);
    }

    setCompletedLessons(updatedCompleted);
    saveRewards(nextRewards, nextXP);

    navigate(`/study/${courseId}`, {
      replace: true,
      state: {
        completedLessonId: lesson.id,
        completedLessonTitle: lesson.title,
        showCompletion: true,
      },
    });
  }

  if (!course || !lesson || lessonIndex < 0) {
    return (
      <main className="lesson-page lesson-not-found">
        <section className="lesson-card lesson-error-card">
          <span className="lesson-error-icon">🌱</span>
          <h1>Quest not found</h1>
          <p>This lesson may have moved, or the course does not exist.</p>
          <Link to="/dashboard" className="lesson-primary-button">
            Return to dashboard <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    );
  }

  const videoUrl = lesson.videoUrl || lesson.video || "";
  const audioUrl = lesson.audioUrl || "";
  const videoPoster = lesson.videoPoster || "";
  const completionReady = canComplete();

  // HTML lesson pages use an iframe; actual video files use a video element.
  const isHTMLLesson = /\.html?($|[?#])/i.test(videoUrl);

  return (
    <main className={`lesson-page course-${course.color || "green"}`}>
      <header className="lesson-topbar">
        <Link to={`/study/${courseId}`} className="lesson-back">
          <ArrowLeft size={19} />
          <span>Study map</span>
        </Link>

        <div className="lesson-topbar-center">
          <span className="lesson-topbar-icon">{course.icon || "🐍"}</span>
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
              aria-label="Lesson position"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={lessonProgress}
            >
              <div
                className="lesson-progress-fill"
                style={{ width: `${lessonProgress}%` }}
              />
            </div>
          </div>

          <article className="lesson-card">
            <div className="lesson-heading">
              <div className="lesson-heading-icon">
                {isCompleted ? (
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
                +{lesson.xp ?? DEFAULT_COMPLETION_XP} completion XP
              </span>
              <span className="lesson-difficulty">
                {lesson.difficulty || "Beginner"}
              </span>
              <span className={`lesson-type-badge type-${type}`}>
                {type === "hands-on" ? "Hands-on" : type}
              </span>
            </div>

            <div className="lesson-divider" />

            {type === "video" && (
              <section className="lesson-content-section">
                <div className="lesson-section-heading">
                  <span className="lesson-section-icon video-icon">
                    <PlayCircle size={20} />
                  </span>
                  <div>
                    <h2>{lesson.videoTitle || "Watch the lesson"}</h2>
                    <p>
                      Explore the lesson below, then mark this stage complete.
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
                    <h3>Your lesson content goes here</h3>
                    <p>Add a videoUrl in your lesson data.</p>
                  </div>
                )}

                {lesson.videoDescription && (
                  <p className="lesson-muted-copy">{lesson.videoDescription}</p>
                )}

                {!videoFinished && !isCompleted && (
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
                    Stage marked complete.
                    {lessonReward.video
                      ? " Video XP already claimed."
                      : ` +${VIDEO_XP} video XP earned.`}
                  </p>
                )}
              </section>
            )}

            {type === "concept" && (
              <section className="lesson-content-section">
                <div className="lesson-section-heading">
                  <span className="lesson-section-icon">
                    <Lightbulb size={20} />
                  </span>
                  <div>
                    <h2>Understand the concept</h2>
                    <p>Read the explanation and listen to the narration.</p>
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
                    <small>Add audioUrl to enable audio playback.</small>
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

            {type === "hands-on" && (
              <section className="lesson-content-section">
                <div className="lesson-section-heading">
                  <span className="lesson-section-icon practice-icon">
                    <Terminal size={20} />
                  </span>
                  <div>
                    <h2>Hands-on coding challenge</h2>
                    <p>Follow the task, edit the code, and check your work.</p>
                  </div>
                </div>

                <div className="lesson-challenge-card">
                  <span className="lesson-challenge-label">YOUR TASK</span>
                  <h3>{practice.title}</h3>
                  <p>{practice.prompt}</p>
                </div>

                <label className="lesson-editor-label" htmlFor="practice-code">
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
                />

                <div className="lesson-editor-actions">
                  <button
                    type="button"
                    className="lesson-run-button"
                    onClick={runPractice}
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
                  >
                    <RotateCcw size={15} />
                    Reset code
                  </button>
                </div>

                <div className="lesson-runner-notice">
                  <Lightbulb size={16} />
                  This preview supports simple print() statements only. It is
                  not a full Python runtime.
                </div>

                {practiceOutput !== null && (
                  <div className="lesson-output lesson-live-output">
                    <div className="lesson-output-heading">
                      <Terminal size={16} />
                      Preview output
                    </div>
                    <pre>
                      <code>{practiceOutput || "(No output)"}</code>
                    </pre>
                    <p className="lesson-preview-message">{practiceMessage}</p>
                  </div>
                )}

                {practice.hint && (
                  <div className="lesson-hint">
                    <button
                      type="button"
                      className="lesson-hint-toggle"
                      onClick={() => setShowHint((value) => !value)}
                      aria-expanded={showHint}
                    >
                      <Lightbulb size={18} />
                      <span>Need a hint?</span>
                      <span className="lesson-hint-symbol">
                        {showHint ? "−" : "+"}
                      </span>
                    </button>

                    {showHint && (
                      <p className="lesson-hint-content">{practice.hint}</p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  className="lesson-primary-button lesson-check-task"
                  disabled={!practiceCode.trim() || isCompleted}
                  onClick={() => setTaskChecked(true)}
                >
                  <CheckCircle2 size={17} />
                  {taskChecked
                    ? "Task marked as checked"
                    : "I have completed the task"}
                </button>

                {taskChecked && (
                  <p className="lesson-inline-success">
                    <CheckCircle2 size={17} />
                    Task marked complete. Arbitrary Python code is not
                    automatically validated.
                  </p>
                )}
              </section>
            )}

            {type === "quiz" && (
              <section className="lesson-content-section">
                <div className="lesson-section-heading">
                  <span className="lesson-section-icon quiz-icon">
                    <Trophy size={20} />
                  </span>
                  <div>
                    <h2>Knowledge check</h2>
                    <p>
                      {questions.length} questions · one mark per correct answer.
                    </p>
                  </div>
                </div>

                {questions.length > 0 &&
                questions.every(isValidQuizQuestion) ? (
                  <form className="lesson-quiz-form" onSubmit={submitQuiz}>
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
                          {item.options.map((option, optionIndex) => {
                            const selected =
                              Number(answers[index]) === optionIndex;
                            const correct =
                              Number(item.answer) === optionIndex;

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
                                  selected ? "option-selected" : "",
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
                          })}
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
                          Object.keys(answers).length !== questions.length
                        }
                      >
                        Submit answers
                        <ArrowRight size={17} />
                      </button>
                    ) : (
                      <div className="lesson-score-card" role="status">
                        <Trophy size={25} />
                        <div>
                          <strong>
                            Your score: {currentScore?.score}/
                            {currentScore?.maxScore}
                          </strong>
                          <p>
                            Your quiz score is saved separately from completion
                            XP.
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
                      Add a quizQuestions array with a question, options array,
                      and zero-based answer index.
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
              <button
                type="button"
                className="lesson-secondary-button"
                onClick={() => navigate(`/study/${courseId}`)}
              >
                <ArrowLeft size={17} />
                Return to Study Map
              </button>

              <button
                type="button"
                className="lesson-primary-button"
                onClick={completeLesson}
                disabled={isCompleted || !completionReady}
              >
                {isCompleted ? "Lesson completed" : "Complete lesson"}
                {isCompleted ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            </footer>

            {!isCompleted && !completionReady && (
              <p className="lesson-completion-note">
                {type === "video" &&
                  "View the lesson or select “Mark video as watched” to continue."}
                {type === "quiz" &&
                  "Submit your quiz before completing this stage."}
                {type === "hands-on" &&
                  "Mark your coding task as checked before completing this stage."}
              </p>
            )}

            {isCompleted && (
              <div className="lesson-completed-note">
                <CheckCircle2 size={18} />
                Lesson completion is saved. Quiz marks are tracked separately.
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
                ? "Explore the lesson, then mark this stage complete."
                : type === "concept"
                  ? "Read the concept and listen to the narration at your own pace."
                  : type === "quiz"
                    ? "Think carefully. Your quiz score is separate from XP."
                    : "Experiment with the code and check the task when you're ready."}
            </p>
          </section>

          <section className="lesson-sidebar-card">
            <div className="lesson-sidebar-heading">
              <Trophy size={19} />
              <h3>Your progress</h3>
            </div>

            <div className="lesson-progress-numbers">
              <strong>{completedCount}</strong>
              <span>of {lessons.length} lessons completed</span>
            </div>

            <div
              className="lesson-progress-track"
              role="progressbar"
              aria-label="Course completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={courseProgress}
            >
              <div
                className="lesson-progress-fill"
                style={{ width: `${courseProgress}%` }}
              />
            </div>

            <p className="lesson-sidebar-muted">
              {courseProgress === 100
                ? "Amazing! You completed every lesson."
                : `${courseProgress}% completed. Keep going!`}
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
                  Return to the Study Map to choose your next lesson.
                </p>
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
                  ? "Read each option carefully before submitting."
                  : type === "hands-on"
                    ? "Change one thing at a time so you understand the result."
                    : "Take your time. Understanding matters more than rushing."}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}