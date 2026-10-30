import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveUserProfile } from "../lib/userService";
import "./understanding.css";

const STORAGE_KEY = "evolv_onboarding_draft";

const EDUCATION_OPTIONS = [
  {
    icon: "🎒",
    title: "School student",
    description: "Building my foundation",
  },
  {
    icon: "🎓",
    title: "College student",
    description: "Learning while studying",
  },
  {
    icon: "📚",
    title: "Graduate",
    description: "Preparing for what's next",
  },
  {
    icon: "💼",
    title: "Working professional",
    description: "Growing my career",
  },
  {
    icon: "🔄",
    title: "Career switcher",
    description: "Starting a new chapter",
  },
  {
    icon: "🌱",
    title: "Other",
    description: "Creating my own path",
  },
];

const LEVEL_OPTIONS = [
  {
    icon: "🌱",
    title: "Beginner",
    description: "I'm starting from scratch.",
    color: "mint",
  },
  {
    icon: "🧭",
    title: "Intermediate",
    description: "I know the basics.",
    color: "peach",
  },
  {
    icon: "⚡",
    title: "Advanced",
    description: "I'm ready for bigger challenges.",
    color: "lavender",
  },
];

const INTEREST_OPTIONS = [
  {
    icon: "</>",
    title: "Web Development",
    description: "Build websites and web apps",
    color: "mint",
  },
  {
    icon: "Py",
    title: "Python",
    description: "Code, automate and create",
    color: "peach",
  },
  {
    icon: "J",
    title: "Java",
    description: "Master object-oriented coding",
    color: "lavender",
  },
  {
    icon: "✳",
    title: "Artificial Intelligence",
    description: "Explore intelligent systems",
    color: "blue",
  },
  {
    icon: "⌁",
    title: "Data Science",
    description: "Discover insights from data",
    color: "yellow",
  },
  {
    icon: "◈",
    title: "UI/UX Design",
    description: "Design delightful experiences",
    color: "pink",
  },
  {
    icon: "⬡",
    title: "Cybersecurity",
    description: "Learn digital defense",
    color: "lavender",
  },
  {
    icon: "▣",
    title: "App Development",
    description: "Create mobile applications",
    color: "mint",
  },
  {
    icon: "☁",
    title: "Cloud Computing",
    description: "Understand cloud technology",
    color: "blue",
  },
  {
    icon: "⚡",
    title: "Competitive Programming",
    description: "Sharpen your problem-solving",
    color: "yellow",
  },
];

const GOAL_OPTIONS = [
  {
    icon: "🚀",
    title: "Build real-world projects",
    description: "Turn ideas into working products",
  },
  {
    icon: "🎯",
    title: "Prepare for placements",
    description: "Get ready for career opportunities",
  },
  {
    icon: "🌱",
    title: "Learn a new skill",
    description: "Explore something unfamiliar",
  },
  {
    icon: "💪",
    title: "Improve my existing skills",
    description: "Become better at what I know",
  },
  {
    icon: "🏆",
    title: "Earn certifications",
    description: "Showcase what I've learned",
  },
  {
    icon: "🧭",
    title: "Explore career options",
    description: "Discover where my interests lead",
  },
];

const LEARNING_OPTIONS = [
  {
    icon: "▶",
    title: "Video lessons",
    description: "Watch and understand",
    value: "visual",
  },
  {
    icon: "▤",
    title: "Reading and notes",
    description: "Learn at my own pace",
    value: "reading",
  },
  {
    icon: "</>",
    title: "Hands-on coding",
    description: "Learn by doing",
    value: "hands-on",
  },
  {
    icon: "◇",
    title: "Guided projects",
    description: "Build step by step",
    value: "mixed",
  },
];

const HOURS_OPTIONS = [
  {
    icon: "☕",
    title: "Less than 2 hours",
    description: "A little at a time",
    value: 1,
  },
  {
    icon: "🌿",
    title: "3–5 hours",
    description: "A balanced weekly routine",
    value: 4,
  },
  {
    icon: "🔥",
    title: "6–10 hours",
    description: "Ready to level up",
    value: 8,
  },
  {
    icon: "🚀",
    title: "10+ hours",
    description: "All in on my goals",
    value: 10,
  },
];

const COURSE_OPTIONS = [
  {
    icon: "🐍",
    title: "Python for Everyone",
    description: "Start coding with Python, from the basics.",
    category: "Python",
    color: "mint",
  },
  {
    icon: "🌐",
    title: "Web Development",
    description: "Learn HTML, CSS and JavaScript.",
    category: "Web Development",
    color: "blue",
  },
  {
    icon: "☕",
    title: "Java Foundations",
    description: "Explore Java and object-oriented programming.",
    category: "Java",
    color: "peach",
  },
  {
    icon: "🤖",
    title: "AI Explorer",
    description: "Discover artificial intelligence fundamentals.",
    category: "Artificial Intelligence",
    color: "lavender",
  },
];

const INITIAL_PROFILE = {
  education: "",
  skillLevel: "",
  interests: [],
  goals: [],
  learningStyle: "",
  weeklyHours: "3–5 hours",
  preferredCourse: "",
};

const STEPS = [
  {
    eyebrow: "YOUR STARTING POINT",
    title: "First things first...",
    highlight: "who are you?",
    description:
      "Everyone starts somewhere. Tell us a little about where you are in your journey.",
    field: "education",
  },
  {
    eyebrow: "YOUR CURRENT LEVEL",
    title: "What's your",
    highlight: "starting level?",
    description:
      "We'll shape your learning path around what you already know.",
    field: "skillLevel",
  },
  {
    eyebrow: "FOLLOW YOUR CURIOSITY",
    title: "What would you",
    highlight: "love to explore?",
    description:
      "Choose every subject that sparks your curiosity. You can explore more worlds later.",
    field: "interests",
  },
  {
    eyebrow: "YOUR BIGGER PICTURE",
    title: "What's your",
    highlight: "next big goal?",
    description:
      "Tell us what you're working towards. Your goals will help guide your quests.",
    field: "goals",
  },
  {
    eyebrow: "YOUR LEARNING SUPERPOWER",
    title: "How do you",
    highlight: "learn best?",
    description:
      "Choose the way you enjoy learning. You can select more than one.",
    field: "learningStyle",
  },
  {
    eyebrow: "MAKE IT YOUR OWN",
    title: "How much time can",
    highlight: "you set aside?",
    description:
      "A realistic routine beats a perfect plan. Pick a pace that works for you.",
    field: "weeklyHours",
  },
  {
    eyebrow: "CHOOSE YOUR FIRST QUEST",
    title: "Where should",
    highlight: "we begin?",
    description:
      "Pick your first course. This is your starting point, not a permanent decision.",
    field: "preferredCourse",
  },
];

function readSavedProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return INITIAL_PROFILE;
    }

    const parsed = JSON.parse(saved);

    return {
      ...INITIAL_PROFILE,
      ...parsed,
      interests: Array.isArray(parsed.interests)
        ? parsed.interests
        : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
    };
  } catch {
    return INITIAL_PROFILE;
  }
}

function Companion({ small = false }) {
  return (
    <div
      className={`understanding-companion ${
        small ? "understanding-companion-small" : ""
      }`}
      role="img"
      aria-label="EVO, your EVOLV learning companion"
    >
      <span className="understanding-leaf understanding-leaf-left" />
      <span className="understanding-leaf understanding-leaf-right" />

      <div className="understanding-face">
        <span className="understanding-eye understanding-eye-left" />
        <span className="understanding-eye understanding-eye-right" />
        <span className="understanding-cheek understanding-cheek-left" />
        <span className="understanding-cheek understanding-cheek-right" />
        <span className="understanding-smile" />
      </div>

      <span className="understanding-companion-spark">✦</span>
    </div>
  );
}

function Brand() {
  return (
    <Link
      className="understanding-brand"
      to="/"
      aria-label="EVOLV home"
    >
      <span className="understanding-brand-symbol">✦</span>

      <span className="understanding-brand-copy">
        <strong>
          EVOLV<span>.</span>
        </strong>
        <small>LEARN · BUILD · GROW</small>
      </span>
    </Link>
  );
}

function ProgressBar({ step, total }) {
  const progress = Math.round((step / total) * 100);

  return (
    <div className="understanding-progress">
      <div className="understanding-progress-top">
        <span>
          YOUR JOURNEY <strong>· {step} OF {total}</strong>
        </span>

        <span className="understanding-progress-percent">
          {progress}%
        </span>
      </div>

      <div
        className="understanding-progress-track"
        role="progressbar"
        aria-label="Onboarding progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={step}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function OptionCard({
  icon,
  title,
  description,
  selected,
  onClick,
  color = "mint",
  multi = false,
}) {
  return (
    <button
      type="button"
      className={`understanding-option ${color} ${
        selected ? "selected" : ""
      }`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className="understanding-option-icon">{icon}</span>

      <span className="understanding-option-copy">
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>

      <span
        className={`understanding-option-check ${
          selected ? "checked" : ""
        }`}
        aria-hidden="true"
      >
        {selected ? "✓" : multi ? "+" : ""}
      </span>
    </button>
  );
}

export default function Understanding() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(readSavedProfile);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const totalSteps = STEPS.length + 1;
  const isReview = step === STEPS.length;
  const currentStep = STEPS[step];

  const selectedCourse = useMemo(
    () =>
      COURSE_OPTIONS.find(
        (course) => course.title === profile.preferredCourse
      ),
    [profile.preferredCourse]
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // The onboarding flow can still be used if storage is unavailable.
    }
  }, [profile]);

  function updateField(field, value) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  function toggleMultiple(field, value) {
    setProfile((current) => {
      const selected = current[field];

      return {
        ...current,
        [field]: selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value],
      };
    });

    setError("");
  }

  function validateCurrentStep() {
    if (step === 0 && !profile.education) {
      return "Choose the option that best describes you.";
    }

    if (step === 1 && !profile.skillLevel) {
      return "Choose your current skill level to continue.";
    }

    if (step === 2 && profile.interests.length === 0) {
      return "Choose at least one subject you're interested in.";
    }

    if (step === 3 && profile.goals.length === 0) {
      return "Choose at least one goal for your learning journey.";
    }

    if (step === 4 && !profile.learningStyle) {
      return "Choose a learning style to continue.";
    }

    if (step === 5 && !profile.weeklyHours) {
      return "Choose how much time you can dedicate each week.";
    }

    if (step === 6 && !profile.preferredCourse) {
      return "Choose a course for your first quest.";
    }

    return "";
  }

  function handleContinue() {
    const validationMessage = validateCurrentStep();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setError("");
    setStep((current) => Math.min(current + 1, STEPS.length));
  }

  function handleBack() {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  async function handleFinish() {
    if (saving) return;

    setSaving(true);
    setError("");

    const completedProfile = {
      ...profile,
      completed: true,
      completedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        "evolv_onboarding",
        JSON.stringify(completedProfile)
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedProfile));

      // Persist profile to Supabase
      try {
        await saveUserProfile({
          education: profile.education,
          skillLevel: profile.skillLevel?.toLowerCase(),
          interests: profile.interests,
          goals: profile.goals,
          learningStyle: profile.learningStyle,
          weeklyHours: profile.weeklyHours,
        });
      } catch (dbError) {
        console.warn("Could not save profile to Supabase:", dbError);
      }

      const token =
        localStorage.getItem("evolv_token") ||
        sessionStorage.getItem("evolv_token");

      const storage = localStorage.getItem("evolv_token")
        ? localStorage
        : sessionStorage;

      if (token) {
        storage.setItem(
          "evolv_onboarding",
          JSON.stringify(completedProfile)
        );
      }

      navigate("/dashboard", { replace: true });
    } catch {
      setError(
        "We couldn't save your learning profile. Please try again."
      );
      setSaving(false);
    }
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Start your onboarding again? Your current answers will be cleared."
    );

    if (!confirmed) return;

    setProfile(INITIAL_PROFILE);
    setStep(0);
    setError("");

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("evolv_onboarding");
      sessionStorage.removeItem("evolv_onboarding");
    } catch {
      // No action needed.
    }
  }

  function renderQuestion() {
    switch (step) {
      case 0:
        return (
          <div className="understanding-option-list">
            {EDUCATION_OPTIONS.map((option) => (
              <OptionCard
                key={option.title}
                {...option}
                selected={profile.education === option.title}
                onClick={() =>
                  updateField("education", option.title)
                }
              />
            ))}
          </div>
        );

      case 1:
        return (
          <div className="understanding-level-grid">
            {LEVEL_OPTIONS.map((option) => (
              <button
                key={option.title}
                type="button"
                className={`understanding-level-card ${option.color} ${
                  profile.skillLevel === option.title ? "selected" : ""
                }`}
                aria-pressed={profile.skillLevel === option.title}
                onClick={() =>
                  updateField("skillLevel", option.title)
                }
              >
                <span className="understanding-level-icon">
                  {option.icon}
                </span>

                <strong>{option.title}</strong>
                <small>{option.description}</small>

                <span className="understanding-radio">
                  {profile.skillLevel === option.title ? "✓" : ""}
                </span>
              </button>
            ))}
          </div>
        );

      case 2:
        return (
          <>
            <div className="understanding-selection-note">
              <span>✦</span>
              Select all the worlds you want to explore.
            </div>

            <div className="understanding-interest-grid">
              {INTEREST_OPTIONS.map((option) => (
                <OptionCard
                  key={option.title}
                  {...option}
                  multi
                  selected={profile.interests.includes(option.title)}
                  onClick={() =>
                    toggleMultiple("interests", option.title)
                  }
                />
              ))}
            </div>

            <p className="understanding-selection-count">
              {profile.interests.length}{" "}
              {profile.interests.length === 1 ? "world" : "worlds"} selected
            </p>
          </>
        );

      case 3:
        return (
          <div className="understanding-option-list">
            {GOAL_OPTIONS.map((option) => (
              <OptionCard
                key={option.title}
                {...option}
                multi
                selected={profile.goals.includes(option.title)}
                onClick={() => toggleMultiple("goals", option.title)}
              />
            ))}
          </div>
        );

      case 4:
        return (
          <div className="understanding-learning-grid">
            {LEARNING_OPTIONS.map((option) => (
              <button
                key={option.title}
                type="button"
                className={`understanding-learning-card ${
                  profile.learningStyle === option.value
                    ? "selected"
                    : ""
                }`}
                aria-pressed={
                  profile.learningStyle === option.value
                }
                onClick={() =>
                  updateField("learningStyle", option.value)
                }
              >
                <span className="understanding-learning-icon">
                  {option.icon}
                </span>

                <strong>{option.title}</strong>
                <small>{option.description}</small>

                <span className="understanding-radio">
                  {profile.learningStyle === option.value ? "✓" : ""}
                </span>
              </button>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="understanding-option-list">
            {HOURS_OPTIONS.map((option) => (
              <OptionCard
                key={option.title}
                {...option}
                selected={profile.weeklyHours === option.title}
                onClick={() =>
                  updateField("weeklyHours", option.title)
                }
              />
            ))}
          </div>
        );

      case 6:
        return (
          <div className="understanding-course-grid">
            {COURSE_OPTIONS.map((course) => (
              <button
                key={course.title}
                type="button"
                className={`understanding-course-card ${course.color} ${
                  profile.preferredCourse === course.title
                    ? "selected"
                    : ""
                }`}
                aria-pressed={
                  profile.preferredCourse === course.title
                }
                onClick={() =>
                  updateField("preferredCourse", course.title)
                }
              >
                <span className="understanding-course-icon">
                  {course.icon}
                </span>

                <span className="understanding-course-copy">
                  <strong>{course.title}</strong>
                  <small>{course.description}</small>
                </span>

                <span className="understanding-course-check">
                  {profile.preferredCourse === course.title ? "✓" : "+"}
                </span>
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  }

  function renderReview() {
    const learningStyleTitle =
      LEARNING_OPTIONS.find(
        (option) => option.value === profile.learningStyle
      )?.title || "Not selected";

    return (
      <div className="understanding-review">
        <div className="understanding-review-banner">
          <span className="understanding-review-star">✦</span>

          <div>
            <strong>Your adventure is taking shape!</strong>
            <p>
              Here's the learning profile you've created. You can go
              back and change any answer.
            </p>
          </div>
        </div>

        <div className="understanding-review-list">
          <ReviewRow
            icon="🎒"
            label="YOUR BACKGROUND"
            value={profile.education}
            onEdit={() => {
              setStep(0);
              setError("");
            }}
          />

          <ReviewRow
            icon="⚡"
            label="YOUR SKILL LEVEL"
            value={profile.skillLevel}
            onEdit={() => {
              setStep(1);
              setError("");
            }}
          />

          <ReviewRow
            icon="🌍"
            label="YOUR WORLDS"
            value={profile.interests.join(", ")}
            onEdit={() => {
              setStep(2);
              setError("");
            }}
          />

          <ReviewRow
            icon="🎯"
            label="YOUR GOALS"
            value={profile.goals.join(", ")}
            onEdit={() => {
              setStep(3);
              setError("");
            }}
          />

          <ReviewRow
            icon="📖"
            label="YOUR LEARNING STYLE"
            value={learningStyleTitle}
            onEdit={() => {
              setStep(4);
              setError("");
            }}
          />

          <ReviewRow
            icon="⏰"
            label="YOUR WEEKLY ROUTINE"
            value={profile.weeklyHours}
            onEdit={() => {
              setStep(5);
              setError("");
            }}
          />

          <ReviewRow
            icon="🚀"
            label="YOUR FIRST QUEST"
            value={selectedCourse?.title || "Not selected"}
            onEdit={() => {
              setStep(6);
              setError("");
            }}
          />
        </div>

        <div className="understanding-review-note">
          <Companion small />

          <span>
            <strong>Remember, explorer!</strong>
            <br />
            Your path can change as you grow. There's no single right
            way to learn.
          </span>
        </div>
      </div>
    );
  }

  return (
    <main className="ev-understanding">
      <div className="understanding-background" aria-hidden="true">
        <span className="understanding-cloud cloud-a" />
        <span className="understanding-cloud cloud-b" />
        <span className="understanding-cloud cloud-c" />

        <span className="understanding-decor-star star-a">✦</span>
        <span className="understanding-decor-star star-b">✧</span>
        <span className="understanding-decor-star star-c">✳</span>

        <span className="understanding-floating-tag tag-a">
          Learn ✦
        </span>

        <span className="understanding-floating-tag tag-b">
          Grow ↗
        </span>

        <div className="understanding-island">
          <span>🌳</span>
          <span>🌲</span>
        </div>
      </div>

      <header className="understanding-topbar">
        <Brand />

        <button
          type="button"
          className="understanding-save-label"
          onClick={handleReset}
          title="Clear your answers and restart onboarding"
        >
          <span className="understanding-save-dot" />
          YOUR JOURNEY, YOUR WAY
        </button>
      </header>

      <section className="understanding-layout">
        <aside className="understanding-side">
          <span className="understanding-eyebrow">
            LET'S GET TO KNOW YOU
          </span>

          <h1>
            Your path.
            <br />
            Your pace.
            <br />
            Your <span>potential.</span>
          </h1>

          <p className="understanding-side-description">
            A few little questions will help us create a learning
            experience that feels like yours.
          </p>

          <div className="understanding-illustration">
            <div className="understanding-illustration-sun" />

            <div className="understanding-hill hill-back" />
            <div className="understanding-hill hill-front" />

            <div className="understanding-path" />

            <div className="understanding-illustration-companion">
              <Companion />
            </div>

            <span className="understanding-illustration-star illustration-star-one">
              ✦
            </span>

            <span className="understanding-illustration-star illustration-star-two">
              ✧
            </span>

            <span className="understanding-illustration-label">
              Your next chapter starts here!
            </span>
          </div>

          <div className="understanding-side-tip">
            <span className="understanding-side-tip-icon">✦</span>

            <p>
              <strong>There's no perfect learner.</strong>
              <br />
              Just a curious mind and a willingness to begin.
            </p>
          </div>
        </aside>

        <section className="understanding-main">
          <div className="understanding-card">
            <div className="understanding-card-top">
              <ProgressBar step={step + 1} total={totalSteps} />

              <div className="understanding-card-mascot">
                <Companion small />
              </div>
            </div>

            <div className="understanding-heading">
              <span className="understanding-question-eyebrow">
                {isReview ? "READY FOR YOUR NEXT CHAPTER?" : currentStep.eyebrow}
              </span>

              <h2>
                {isReview ? (
                  <>
                    Look at you,
                    <br />
                    <span>future achiever!</span>
                  </>
                ) : (
                  <>
                    {currentStep.title}
                    <br />
                    <span>{currentStep.highlight}</span>
                  </>
                )}
              </h2>

              <p>
                {isReview
                  ? "Your learning profile is ready. Let's start turning your goals into progress."
                  : currentStep.description}
              </p>
            </div>

            <div className="understanding-question-content" key={step}>
              {isReview ? renderReview() : renderQuestion()}
            </div>

            {error && (
              <div
                className="understanding-error"
                role="alert"
                aria-live="polite"
              >
                <span>!</span>
                {error}
              </div>
            )}

            <div className="understanding-actions">
              <button
                type="button"
                className="understanding-back-button"
                onClick={handleBack}
                disabled={step === 0 || saving}
              >
                <span>←</span> Back
              </button>

              <button
                type="button"
                className="understanding-continue-button"
                onClick={isReview ? handleFinish : handleContinue}
                disabled={saving}
              >
                {saving
                  ? "Getting things ready..."
                  : isReview
                    ? "Let's start learning"
                    : "Continue"}

                {!saving && (
                  <span>{isReview ? "✦" : "→"}</span>
                )}
              </button>
            </div>

            <div className="understanding-card-footer">
              <span>✦</span>
              Take your time. This is your adventure.
            </div>
          </div>

          <p className="understanding-below-card">
            Made for curious minds <span>♥</span>
          </p>
        </section>
      </section>

      <footer className="understanding-footer">
        <span>© {new Date().getFullYear()} EVOLV</span>
        <span>LEARN · BUILD · GROW</span>
      </footer>
    </main>
  );
}

function ReviewRow({ icon, label, value, onEdit }) {
  return (
    <div className="understanding-review-row">
      <span className="understanding-review-icon">{icon}</span>

      <div className="understanding-review-copy">
        <small>{label}</small>
        <strong>{value || "Not selected"}</strong>
      </div>

      <button
        type="button"
        className="understanding-edit-button"
        onClick={onEdit}
        aria-label={`Edit ${label.toLowerCase()}`}
      >
        Edit
      </button>
    </div>
  );
}