import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
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

const INITIAL_PROFILE = {
  education: "",
  skillLevel: "",
  goals: [],
  weeklyHours: "3–5 hours",
};

// Python is the only course available for now.
const CURRENT_TRACK = ["Python"];

const STEPS = [
  {
    eyebrow: "YOUR STARTING POINT",
    title: "First things first...",
    highlight: "who are you?",
    description:
      "Everyone starts somewhere. Tell us a little about where you are in your journey.",
  },
  {
    eyebrow: "YOUR CURRENT LEVEL",
    title: "What's your",
    highlight: "starting level?",
    description:
      "We'll shape your Python path around what you already know.",
  },
  {
    eyebrow: "YOUR BIGGER PICTURE",
    title: "What's your",
    highlight: "next big goal?",
    description:
      "Tell us what you're working towards. Your goals will help guide your quests.",
  },
  {
    eyebrow: "MAKE IT YOUR OWN",
    title: "How much time can",
    highlight: "you set aside?",
    description:
      "A realistic routine beats a perfect plan. Pick a pace that works for you.",
  },
];

const REVIEW_STEP = STEPS.length;

function readSavedProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return INITIAL_PROFILE;
    }

    const parsed = JSON.parse(saved);

    return {
      education:
        typeof parsed.education === "string" ? parsed.education : "",
      skillLevel:
        typeof parsed.skillLevel === "string" ? parsed.skillLevel : "",
      goals: Array.isArray(parsed.goals)
        ? parsed.goals.filter((goal) => typeof goal === "string")
        : [],
      weeklyHours: HOURS_OPTIONS.some(
        (option) => option.title === parsed.weeklyHours
      )
        ? parsed.weeklyHours
        : INITIAL_PROFILE.weeklyHours,
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

function ReviewRow({ icon, label, value, onEdit }) {
  return (
    <div className="understanding-review-row">
      <span className="understanding-review-icon">{icon}</span>

      <div className="understanding-review-copy">
        <small>{label}</small>
        <strong>{value || "Not selected"}</strong>
      </div>

      {onEdit && (
        <button
          type="button"
          className="understanding-edit-button"
          onClick={onEdit}
          aria-label={`Edit ${label.toLowerCase()}`}
        >
          Edit
        </button>
      )}
    </div>
  );
}

export default function Understanding() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(readSavedProfile);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const totalSteps = STEPS.length + 1;
  const isReview = step === REVIEW_STEP;
  const currentStep = STEPS[step];

  // Returning users who already finished onboarding skip this page.
  useEffect(() => {
    let cancelled = false;

    async function checkOnboarding() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (!cancelled && data?.onboarding_completed) {
          navigate("/dashboard", { replace: true });
        }
      } catch {
        // Stay on this page if the check fails.
      }
    }

    checkOnboarding();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Keep a local draft so a refresh doesn't lose answers.
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

  function goToStep(nextStep) {
    setStep(nextStep);
    setError("");
  }

  function validateCurrentStep() {
    if (step === 0 && !profile.education) {
      return "Choose the option that best describes you.";
    }

    if (step === 1 && !profile.skillLevel) {
      return "Choose your current skill level to continue.";
    }

    if (step === 2 && profile.goals.length === 0) {
      return "Choose at least one goal for your learning journey.";
    }

    if (step === 3 && !profile.weeklyHours) {
      return "Choose how much time you can dedicate each week.";
    }

    return "";
  }

  function handleContinue() {
    const validationMessage = validateCurrentStep();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    goToStep(Math.min(step + 1, REVIEW_STEP));
  }

  function handleBack() {
    goToStep(Math.max(step - 1, 0));
  }

  async function handleFinish() {
    if (saving) return;

    // Safety net in case someone reaches review with missing answers.
    if (
      !profile.education ||
      !profile.skillLevel ||
      profile.goals.length === 0 ||
      !profile.weeklyHours
    ) {
      setError("Please answer every question before finishing.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate("/login", {
          replace: true,
          state: { authMessage: "Please log in to continue." },
        });
        return;
      }

      const weeklyHours =
        HOURS_OPTIONS.find((option) => option.title === profile.weeklyHours)
          ?.value ?? 4;

      // profiles.full_name is NOT NULL. Keep an existing saved name, and
      // otherwise fall back so a null is never sent.
      const { data: existing } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const fullName =
        existing?.full_name?.trim() ||
        user.user_metadata?.full_name?.trim() ||
        user.user_metadata?.name?.trim() ||
        user.email?.split("@")[0] ||
        "Learner";

      const { error: saveError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: fullName,
          education: profile.education,
          skill_level: profile.skillLevel.toLowerCase(),
          interests: CURRENT_TRACK,
          goals: profile.goals,
          weekly_hours: weeklyHours,
          onboarding_completed: true,
        },
        { onConflict: "id" }
      );

      if (saveError) throw saveError;

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // No action needed.
      }

      navigate("/dashboard", { replace: true });
    } catch (saveError) {
      console.error("Could not save onboarding profile:", saveError);

      setError("We couldn't save your learning profile. Please try again.");
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
                onClick={() => updateField("education", option.title)}
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
                onClick={() => updateField("skillLevel", option.title)}
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

      case 3:
        return (
          <div className="understanding-option-list">
            {HOURS_OPTIONS.map((option) => (
              <OptionCard
                key={option.title}
                {...option}
                selected={profile.weeklyHours === option.title}
                onClick={() => updateField("weeklyHours", option.title)}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  }

  function renderReview() {
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
            onEdit={() => goToStep(0)}
          />

          <ReviewRow
            icon="⚡"
            label="YOUR SKILL LEVEL"
            value={profile.skillLevel}
            onEdit={() => goToStep(1)}
          />

          <ReviewRow
            icon="🎯"
            label="YOUR GOALS"
            value={profile.goals.join(", ")}
            onEdit={() => goToStep(2)}
          />

          <ReviewRow
            icon="⏰"
            label="YOUR WEEKLY ROUTINE"
            value={profile.weeklyHours}
            onEdit={() => goToStep(3)}
          />

          <ReviewRow
            icon="🐍"
            label="YOUR FIRST QUEST"
            value="Python for Everyone"
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

        <span className="understanding-floating-tag tag-a">Learn ✦</span>

        <span className="understanding-floating-tag tag-b">Grow ↗</span>

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
                {isReview
                  ? "READY FOR YOUR NEXT CHAPTER?"
                  : currentStep.eyebrow}
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

                {!saving && <span>{isReview ? "✦" : "→"}</span>}
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
