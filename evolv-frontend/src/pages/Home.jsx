
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
import "../styles/home.css";

const lessons = [
  {
    id: 1,
    title: "Introduction to Python",
    description: "Discover Python and write your first line of code.",
    duration: "5 min",
    status: "available",
    type: "Basics",
    color: "pink",
  },
  {
    id: 2,
    title: "Variables & data types",
    description: "Learn how programs store and use information.",
    duration: "8 min",
    status: "available",
    type: "Core concept",
    color: "green",
  },
  {
    id: 3,
    title: "Conditions & decisions",
    description: "Teach your program to make decisions.",
    duration: "10 min",
    status: "locked",
    type: "Logic",
    color: "blue",
  },
  {
    id: 4,
    title: "Loops & repetition",
    description: "Make your code repeat tasks efficiently.",
    duration: "12 min",
    status: "locked",
    type: "Practice",
    color: "purple",
  },
];

function Companion() {
  return (
    <div
      className="home-companion"
      aria-label="EVOLV learning companion"
      role="img"
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

export default function Home() {
  // Demo statistics until progress is connected to the backend.
  const completedLessons = 0;
  const totalLessons = lessons.length;
  const progress = Math.round(
    (completedLessons / totalLessons) * 100
  );
  const xp = 0;
  const streak = 0;

  const studyMapLink = "/study/python";

  return (
    <div className="ev-home" id="home">
      <Navbar />

      <main className="home-container">
        {/* Welcome banner */}
        <section className="home-welcome">
          <div className="home-welcome-copy">
            <span className="home-welcome-pill">
              <Sparkles size={14} />
              YOUR LEARNING SPACE
            </span>

            <h1>
              Every expert was
              <br />
              once a <span>beginner.</span>
            </h1>

            <p>
              Your journey, your pace, your possibilities.
              <br className="home-desktop-break" />
              Take one small step toward something brilliant today.
            </p>

            <div className="home-welcome-actions">
              <Link
                className="home-button home-button-primary"
                to={studyMapLink}
              >
                Explore my path <ArrowRight size={17} />
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

        {/* Learner statistics */}
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
                {xp} <small>XP</small>
              </strong>
              <span className="home-stat-caption">
                Your first reward awaits
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
                {streak} <small>days</small>
              </strong>
              <span className="home-stat-caption">
                Start a new habit today
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
                {progress}<small>%</small>
              </strong>
              <span className="home-stat-caption">
                Your journey starts here
              </span>
            </div>
          </article>
        </section>

        {/* Learning path and sidebar */}
        <section className="home-main-grid">
          <div className="home-main-column">
            {/* Featured course */}
            <section
              className="home-course-card"
              aria-labelledby="home-course-title"
            >
              <div className="home-course-content">
                <span className="home-course-badge">
                  <span className="home-live-dot" />
                  YOUR FIRST LEARNING PATH
                </span>

                <h2 id="home-course-title">
                  Python Foundations
                </h2>

                <p>
                  From your first print statement to writing useful
                  programs, build your foundation one friendly lesson
                  at a time.
                </p>

                <div className="home-course-meta">
                  <span>
                    <BookOpen size={15} />
                    4 starter lessons
                  </span>

                  <span>
                    <Clock3 size={15} />
                    35 minutes
                  </span>

                  <span>
                    <Sparkles size={15} />
                    Beginner friendly
                  </span>
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
                  <div
                    className="home-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <Link
                  className="home-button home-button-primary"
                  to={studyMapLink}
                >
                  <Play size={16} fill="currentColor" />
                  Start learning
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="home-course-art" aria-hidden="true">
                <div className="home-code-window">
                  <div className="home-code-top">
                    <span />
                    <span />
                    <span />
                    <small>hello.py</small>
                  </div>

                  <div className="home-code-body">
                    <span className="home-line-number">1</span>
                    <code>
                      <i>print</i>(<b>"Hello, world!"</b>)
                    </code>

                    <span className="home-line-number">2</span>
                    <code>
                      <em># Let's begin!</em>
                    </code>

                    <span className="home-line-number">3</span>
                    <code>
                      <i>learn</i>(){" "}
                      <span className="home-code-comment">✨</span>
                    </code>
                  </div>

                  <div className="home-code-success">
                    <CheckCircle2 size={15} />
                    <span>Ready for your first quest</span>
                  </div>
                </div>

                <span className="home-code-deco deco-one">
                  {"{ }"}
                </span>
                <span className="home-code-deco deco-two">
                  &lt;/&gt;
                </span>
                <span className="home-code-deco deco-three">
                  ✦
                </span>
              </div>
            </section>

            {/* Lessons */}
            <section
              className="home-lessons-section"
              id="python-course"
            >
              <SectionHeading
                eyebrow="YOUR NEXT ADVENTURE"
                title="Your learning path"
                description="Little lessons. Real skills. One step at a time."
              />

              <div className="home-lesson-list">
                {lessons.map((lesson) => {
                  const locked = lesson.status === "locked";

                  return (
                    <article
                      className={`home-lesson-item ${
                        locked ? "is-locked" : ""
                      }`}
                      key={lesson.id}
                    >
                      <div
                        className={`home-lesson-number lesson-${lesson.color}`}
                      >
                        {locked ? (
                          <LockKeyhole size={18} />
                        ) : (
                          <span>
                            {String(lesson.id).padStart(2, "0")}
                          </span>
                        )}
                      </div>

                      <div className="home-lesson-details">
                        <div className="home-lesson-title-row">
                          <h3>{lesson.title}</h3>

                          <span
                            className={`home-lesson-type type-${lesson.color}`}
                          >
                            {lesson.type}
                          </span>
                        </div>

                        <p>{lesson.description}</p>

                        <span className="home-lesson-duration">
                          <Clock3 size={13} />
                          {lesson.duration}
                        </span>
                      </div>

                      {locked ? (
                        <span className="home-lesson-locked-label">
                          <LockKeyhole size={13} />
                          Coming up
                        </span>
                      ) : (
                        <Link
                          to={studyMapLink}
                          className="home-lesson-action"
                          aria-label={`Explore the Study Map for ${lesson.title}`}
                          title={`Explore ${lesson.title}`}
                        >
                          <ChevronRight size={20} />
                        </Link>
                      )}
                    </article>
                  );
                })}
              </div>

              <div className="home-unlock-note">
                <span className="home-unlock-icon">
                  <LockKeyhole size={17} />
                </span>

                <p>
                  <strong>More adventures are ahead!</strong>
                  <br />
                  Keep learning to unlock your next lessons.
                </p>

                <Sparkles
                  size={21}
                  className="home-unlock-spark"
                />
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <aside className="home-side-column">
            <section
              className="home-side-card home-progress-card"
              id="progress"
            >
              <div className="home-side-card-heading">
                <div>
                  <span className="home-eyebrow">
                    YOUR JOURNEY
                  </span>
                  <h2>Your progress</h2>
                </div>

                <span className="home-side-heading-icon">
                  <Target size={20} />
                </span>
              </div>

              <p className="home-side-description">
                Progress isn't about speed. It's about showing up.
              </p>

              <div className="home-big-progress">
                <div
                  className="home-progress-ring"
                  style={{
                    "--home-progress": `${progress}%`,
                  }}
                  role="img"
                  aria-label={`${progress}% course progress`}
                >
                  <div>
                    <strong>{progress}%</strong>
                    <span>completed</span>
                  </div>
                </div>
              </div>

              <div className="home-mini-stats">
                <div>
                  <span className="mini-stat-icon mini-green">
                    <Check size={15} />
                  </span>
                  <span>Lessons done</span>
                  <strong>{completedLessons}</strong>
                </div>

                <div>
                  <span className="mini-stat-icon mini-blue">
                    <Trophy size={15} />
                  </span>
                  <span>Earned XP</span>
                  <strong>{xp}</strong>
                </div>

                <div>
                  <span className="mini-stat-icon mini-orange">
                    <Flame size={15} />
                  </span>
                  <span>Day streak</span>
                  <strong>{streak}</strong>
                </div>
              </div>

              <div className="home-progress-footer">
                <Sparkles size={16} />
                <span>
                  Your first lesson is waiting for you.
                </span>
              </div>
            </section>

            <section className="home-goal-card">
              <div className="home-goal-top">
                <span className="home-goal-icon">
                  <Target size={20} />
                </span>
                <span className="home-goal-label">
                  TODAY'S LITTLE GOAL
                </span>
              </div>

              <h3>Start small. Dream big.</h3>

              <p>
                Complete one short lesson today. You don't need to know
                everything; you just need to begin.
              </p>

              <Link
                to={studyMapLink}
                className="home-text-link"
              >
                Take the first step <ArrowRight size={16} />
              </Link>

              <span className="home-goal-spark goal-spark-one">
                ✦
              </span>
              <span className="home-goal-spark goal-spark-two">
                ✧
              </span>
            </section>

            <section className="home-tip-card">
              <span className="home-tip-icon">
                <BookOpen size={20} />
              </span>

              <div>
                <strong>A tiny learning tip</strong>
                <p>
                  Try writing the code yourself instead of only
                  reading it.
                </p>
              </div>
            </section>
          </aside>
        </section>

        {/* Bottom encouragement */}
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

            <h2>Ready to write your first line of code?</h2>

            <p>
              Open your Python path and turn curiosity into a new skill.
            </p>
          </div>

          <Link
            className="home-button home-button-primary"
            to={studyMapLink}
          >
            Explore lessons <ArrowRight size={17} />
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
      </main>
    </div>
  );
}
