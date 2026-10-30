import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  saveUserProfile,
  getUserProfile,
} from "../lib/userService";
import "./auth.css";

const interestsList = [
  "Web Development",
  "Python",
  "Java",
  "Artificial Intelligence",
  "Data Science",
  "UI/UX Design",
  "Cybersecurity",
  "App Development",
  "Cloud Computing",
  "Competitive Programming",
];

const goalsList = [
  "Build real-world projects",
  "Prepare for placements",
  "Learn a new skill",
  "Improve my existing skills",
  "Earn certifications",
  "Explore career options",
];

const learningStyles = [
  "Video lessons",
  "Reading and notes",
  "Hands-on coding",
  "Guided projects",
];

const learningStyleMap = {
  "Video lessons": "visual",
  "Reading and notes": "reading",
  "Hands-on coding": "hands-on",
  "Guided projects": "mixed",
};

const hoursMap = {
  "Less than 2 hours": 1,
  "3–5 hours": 4,
  "6–10 hours": 8,
  "10+ hours": 10,
};

const icons = {
  "Web Development": "</>",
  Python: "Py",
  Java: "J",
  "Artificial Intelligence": "✳",
  "Data Science": "⌁",
  "UI/UX Design": "◈",
  Cybersecurity: "⬡",
  "App Development": "▣",
  "Cloud Computing": "☁",
  "Competitive Programming": "⚡",
};

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  education: "",
  skillLevel: "",
  interests: [],
  goals: [],
  learningStyle: [],
  weeklyHours: "3–5 hours",
};

function Field({ label, id, hint, children }) {
  return (
    <div className="ev-field">
      <label className="ev-label" htmlFor={id}>
        {label}
      </label>

      {children}

      {hint && <small className="field-hint">{hint}</small>}
    </div>
  );
}

function Brand() {
  return (
    <Link className="ev-brand" to="/" aria-label="EVOLV home">
      <span className="brand-symbol">✦</span>

      <span className="brand-copy">
        <strong>
          EVOLV<span>.</span>
        </strong>
        <small>LEARN · BUILD · GROW</small>
      </span>
    </Link>
  );
}

function Companion({ small = false }) {
  return (
    <div
      className={`companion ${small ? "companion-small" : ""}`}
      role="img"
      aria-label="EVO, your EVOLV learning companion"
    >
      <span className="companion-leaf leaf-left" />
      <span className="companion-leaf leaf-right" />

      <div className="companion-body">
        <div className="companion-face">
          <span className="eye" />
          <span className="eye" />
          <span className="cheek cheek-left" />
          <span className="cheek cheek-right" />
          <span className="smile" />
        </div>
      </div>

      <span className="companion-spark spark-one">✦</span>
      <span className="companion-spark spark-two">✧</span>
    </div>
  );
}

function AuthDecorations() {
  return (
    <div className="auth-decorations" aria-hidden="true">
      <div className="decor-cloud cloud-one" />
      <div className="decor-cloud cloud-two" />

      <div className="decor-chip code-chip">
        <span>&lt;/&gt;</span>
        <small>CODE</small>
      </div>

      <div className="decor-chip idea-chip">
        <span>✳</span>
        <small>IDEAS</small>
      </div>

      <div className="decor-star star-one">✦</div>
      <div className="decor-star star-two">✧</div>

      <div className="decor-sign sign-code">
        Code <span>→</span>
      </div>

      <div className="decor-sign sign-create">
        Create <span>→</span>
      </div>

      <div className="decor-sign sign-grow">
        Grow <span>→</span>
      </div>
    </div>
  );
}

const onboardingSteps = [
  {
    key: "education",
    title: "Where are you on your journey?",
    subtitle: "This helps us personalize your learning path.",
    type: "single",
    options: [
      ["School student", "🎒"],
      ["College student", "🎓"],
      ["Graduate", "📘"],
      ["Working professional", "💼"],
      ["Career switcher", "🔁"],
      ["Other", "✨"],
    ],
  },
  {
    key: "skillLevel",
    title: "What's your current skill level?",
    subtitle: "Choose the level that best describes you right now.",
    type: "single",
    options: [
      ["Beginner", "🌱"],
      ["Intermediate", "🧭"],
      ["Advanced", "⚡"],
    ],
  },
  {
    key: "interests",
    title: "What are you curious about?",
    subtitle: "Select all the topics you'd love to explore.",
    type: "multi",
    options: interestsList.map((item) => [item, icons[item]]),
  },
  {
    key: "goals",
    title: "What would you like to achieve?",
    subtitle: "Choose the missions that matter most to you.",
    type: "multi",
    options: goalsList.map((item, index) => [
      item,
      ["✦", "⚑", "⌘", "↗", "✹", "◎"][index],
    ]),
  },
  {
    key: "learningStyle",
    title: "How do you like to learn?",
    subtitle: "Pick the learning styles that work best for you.",
    type: "multi",
    options: learningStyles.map((item, index) => [
      item,
      ["▶", "▤", "</>", "◇"][index],
    ]),
  },
  {
    key: "weeklyHours",
    title: "How much time can you learn each week?",
    subtitle: "We'll help you set a pace that feels right.",
    type: "single",
    options: [
      ["Less than 2 hours", "☁"],
      ["3–5 hours", "🌿"],
      ["6–10 hours", "🚀"],
      ["10+ hours", "🔥"],
    ],
  },
];

function getErrorMessage(error) {
  const message = error?.message || "";

  if (/invalid login credentials/i.test(message)) {
    return "Incorrect email or password. Please try again.";
  }

  if (/user already registered/i.test(message)) {
    return "An account already exists with this email. Please log in.";
  }

  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email using the link we sent you before logging in.";
  }

  if (/password should be at least/i.test(message)) {
    return "Your password is too short. Please choose a stronger password.";
  }

  if (/failed to fetch|network request failed/i.test(message)) {
    return "Unable to connect to Supabase. Check your internet connection and configuration.";
  }

  return message || "Something went wrong. Please try again.";
}

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(
    location.pathname === "/login" ? "login" : "signup"
  );

  // Step 0: account details.
  // Steps 1–6: onboarding questions.
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isSignup = mode === "signup";
  const totalSignupSteps = onboardingSteps.length + 1;
  const activeQuestion = step > 0 ? onboardingSteps[step - 1] : null;


useEffect(() => {
  setMode(location.pathname === "/login" ? "login" : "signup");
  setStep(0);
  setMessage(location.state?.authMessage || "");
  setShowPassword(false);
}, [location.pathname, location.state]);


  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  function toggleOption(field, option) {
    setForm((current) => {
      const selected = current[field];

      return {
        ...current,
        [field]: selected.includes(option)
          ? selected.filter((item) => item !== option)
          : [...selected, option],
      };
    });

    setMessage("");
  }

  function chooseSingle(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  }

  function switchMode(nextMode) {
    setStep(0);
    setMessage("");
    setShowPassword(false);
    setMode(nextMode);

    navigate(nextMode === "login" ? "/login" : "/signup");
  }

  function validateCredentials() {
    const name = form.name.trim();
    const email = form.email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.length < 2) {
      setMessage("Please enter a name with at least 2 characters.");
      return false;
    }

    if (!emailPattern.test(email)) {
      setMessage("Enter a valid email address.");
      return false;
    }

    if (form.password.length < 8 || form.password.length > 72) {
      setMessage("Use a password between 8 and 72 characters.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Your passwords don't match. Try again!");
      return false;
    }

    return true;
  }

  function validateOnboarding() {
    for (let index = 0; index < onboardingSteps.length; index += 1) {
      const question = onboardingSteps[index];
      const answer = form[question.key];

      const missing =
        question.type === "multi" ? answer.length === 0 : !answer;

      if (missing) {
        setStep(index + 1);
        setMessage("Please complete this question to continue.");
        return false;
      }
    }

    return true;
  }

  function continueSignup(event) {
    event.preventDefault();

    if (isLoading) return;

    if (step === 0) {
      if (validateCredentials()) {
        setStep(1);
        setMessage("");
      }

      return;
    }

    const question = onboardingSteps[step - 1];

    if (!question) {
      setMessage("This onboarding step is unavailable. Please try again.");
      return;
    }

    const answer = form[question.key];

    const missing =
      question.type === "multi" ? answer.length === 0 : !answer;

    if (missing) {
      setMessage(
        question.type === "multi"
          ? "Please select at least one option to continue."
          : "Please choose an option to continue."
      );
      return;
    }

    if (step < onboardingSteps.length) {
      setStep((current) => current + 1);
      setMessage("");
      return;
    }

    submitForm(event);
  }

  async function submitForm(event) {
    event.preventDefault();

    if (isLoading) return;

    if (isSignup) {
      if (step === 0) {
        if (!validateCredentials()) return;

        setStep(1);
        return;
      }

      if (!validateOnboarding()) return;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!form.email.trim() || !form.password) {
        setMessage("Enter your email and password to continue.");
        return;
      }

      if (!emailPattern.test(form.email.trim())) {
        setMessage("Enter a valid email address.");
        return;
      }
    }

    setIsLoading(true);
    setMessage("");

    try {
      let authData;
      let authError;

      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          options: {
            data: {
              full_name: form.name.trim(),
            },
          },
        });

        authData = data;
        authError = error;

        if (authError) throw authError;

        const user = authData?.user;

        if (!user) {
          throw new Error("Supabase did not return a user. Please try again.");
        }

        // Supabase may require email confirmation before creating a session.
        // Save the profile only when an authenticated session is available.

if (!authData.session) {
  navigate("/login", {
    replace: true,
    state: {
      authMessage:
        "Your account has been created. Check your email to confirm your account, then log in.",
    },
  });
  return;
}


        const profile = {
          id: user.id,
          full_name: form.name.trim(),
          education: form.education,
          skill_level: form.skillLevel.toLowerCase(),
          interests: form.interests,
          goals: form.goals,
          learning_style: form.learningStyle.map(
            (style) => learningStyleMap[style]
          ),
          weekly_hours: hoursMap[form.weeklyHours] ?? 4,
        };

        await saveUserProfile(profile);

        // Keep legacy UI compatibility while other pages migrate to Supabase.
        const storage = rememberMe ? localStorage : sessionStorage;

        const legacyUser = {
          id: user.id,
          name: form.name.trim(),
          full_name: form.name.trim(),
          email: user.email,
          education: form.education,
          skillLevel: form.skillLevel.toLowerCase(),
          interests: form.interests,
          goals: form.goals,
          learningStyle: profile.learning_style,
          weeklyHours: profile.weekly_hours,
        };

        localStorage.removeItem("evolv_user");
        sessionStorage.removeItem("evolv_user");
        localStorage.removeItem("evolv_token");
        sessionStorage.removeItem("evolv_token");

        storage.setItem("evolv_user", JSON.stringify(legacyUser));

        // Navigate to the understanding questionnaire after signup
        navigate("/understanding", { replace: true });
        return;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        });

        authData = data;
        authError = error;

        if (authError) throw authError;

        if (!authData?.user) {
          throw new Error("Login succeeded, but no user was returned.");
        }

        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select(
              "id, full_name, education, skill_level, interests, goals, learning_style, weekly_hours"
            )
            .eq("id", authData.user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        const profile = profileData || {
          id: authData.user.id,
          full_name:
            authData.user.user_metadata?.full_name ||
            authData.user.email?.split("@")[0] ||
            "Learner",
          education: "",
          skill_level: "beginner",
          interests: [],
          goals: [],
          learning_style: ["mixed"],
          weekly_hours: 4,
        };

        const legacyUser = {
          ...profile,
          id: authData.user.id,
          name: profile.full_name,
          email: authData.user.email,
          skillLevel: profile.skill_level,
          learningStyle: profile.learning_style,
          weeklyHours: profile.weekly_hours,
        };

        localStorage.removeItem("evolv_user");
        sessionStorage.removeItem("evolv_user");
        localStorage.removeItem("evolv_token");
        sessionStorage.removeItem("evolv_token");

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("evolv_user", JSON.stringify(legacyUser));

        // If this is an older account without a profile, create one.
        if (!profileData) {
          await saveUserProfile({
            id: authData.user.id,
            full_name: legacyUser.full_name,
            education: profile.education,
            skill_level: profile.skill_level,
            interests: profile.interests,
            goals: profile.goals,
            learning_style: profile.learning_style,
            weekly_hours: profile.weekly_hours,
          });
        }

        // Returning users who have already answered onboarding go to dashboard;
        // otherwise, route to understanding.
        const hasCompletedOnboarding = Boolean(
          profileData?.education ||
            (Array.isArray(profileData?.interests) && profileData.interests.length > 0) ||
            localStorage.getItem("evolv_onboarding")
        );

        navigate(hasCompletedOnboarding ? "/dashboard" : "/understanding", { replace: true });
      }
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword() {
    const email = form.email.trim().toLowerCase();

    if (!email) {
      setMessage("Enter your email address first to reset your password.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage(
        "If an account exists for that email, Supabase will send a password-reset link."
      );
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  const signupTitle =
    step === 0 ? "Create your account" : activeQuestion?.title;

  const signupSubtitle =
    step === 0
      ? "Your learning journey starts here."
      : activeQuestion?.subtitle;

  return (
    <main className="ev-auth">
      <AuthDecorations />

      <header className="ev-topbar">
        <Brand />

        <div className="topbar-right">
          <span>{isSignup ? "Already on the journey?" : "New explorer?"}</span>

          <button
            type="button"
            className="text-button"
            onClick={() => switchMode(isSignup ? "login" : "signup")}
          >
            {isSignup ? "Log in" : "Create account"} ↗
          </button>
        </div>
      </header>

      <section className="auth-layout">
        <aside className="adventure-copy">
          <span className="adventure-eyebrow">
            YOUR NEXT CHAPTER STARTS HERE
          </span>

          <h1>
            Learn boldly.
            <br />
            Build <span>brilliantly.</span>
          </h1>

          <p>
            Explore new skills. Build real things. Become who you imagine.
          </p>

          <div className="adventure-mascot">
            <Companion />
          </div>

          <div className="adventure-caption">
            <strong>Small steps.</strong>
            <br />
            Big dreams. ✦
          </div>
        </aside>

        <section className="form-panel">
          <div className="form-card">
            <div className="form-brand-heading">
              <span className="form-brand-spark">✦</span>
              <span>Welcome to</span>

              <h2>
                EVOLV<span>.</span>
              </h2>
            </div>

            <div
              className="mode-switch"
              role="group"
              aria-label="Authentication mode"
            >
              <button
                type="button"
                className={isSignup ? "active" : ""}
                aria-pressed={isSignup}
                onClick={() => switchMode("signup")}
              >
                Sign Up
              </button>

              <button
                type="button"
                className={!isSignup ? "active" : ""}
                aria-pressed={!isSignup}
                onClick={() => switchMode("login")}
              >
                Log In
              </button>
            </div>

            {isSignup && (
              <div
                className="onboarding-progress"
                aria-label={`Step ${step + 1} of ${totalSignupSteps}`}
              >
                <div className="progress-track">
                  <span
                    style={{
                      width: `${((step + 1) / totalSignupSteps) * 100}%`,
                    }}
                  />
                </div>

                <div className="progress-copy">
                  <span>
                    {step === 0
                      ? "Account details"
                      : `Question ${step} of ${onboardingSteps.length}`}
                  </span>

                  <span>
                    {Math.round(((step + 1) / totalSignupSteps) * 100)}%
                  </span>
                </div>
              </div>
            )}

            <div className="form-intro">
              <div className="form-intro-mascot">
                <Companion small />
              </div>

              <h3>{isSignup ? signupTitle : "Welcome back!"}</h3>

              <p>
                {isSignup
                  ? signupSubtitle
                  : "Your next level is waiting for you."}
              </p>
            </div>

            <form
              onSubmit={isSignup ? continueSignup : submitForm}
              noValidate
            >
              {isSignup && step === 0 && (
                <>
                  <Field label="Full name" id="signup-name">
                    <input
                      id="signup-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name or nickname"
                      value={form.name}
                      onChange={updateField}
                      minLength={2}
                      required
                    />
                  </Field>

                  <Field label="Email address" id="signup-email">
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={updateField}
                      required
                    />
                  </Field>

                  <Field
                    label="Create a password"
                    id="signup-password"
                    hint="8–72 characters"
                  >
                    <div className="password-wrap">
                      <input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Make it strong"
                        value={form.password}
                        onChange={updateField}
                        minLength={8}
                        maxLength={72}
                        required
                      />

                      <button
                        type="button"
                        className="show-password"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() =>
                          setShowPassword((current) => !current)
                        }
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirm password" id="confirm-password">
                    <div className="password-wrap">
                      <input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Enter it again"
                        value={form.confirmPassword}
                        onChange={updateField}
                        minLength={8}
                        maxLength={72}
                        required
                      />
                    </div>
                  </Field>
                </>
              )}

              {isSignup && step > 0 && activeQuestion && (
                <div
                  className={`question-options ${
                    activeQuestion.key === "interests"
                      ? "question-options-grid"
                      : ""
                  }`}
                >
                  {activeQuestion.options.map(([label, glyph]) => {
                    const isMulti = activeQuestion.type === "multi";

                    const selected = isMulti
                      ? form[activeQuestion.key].includes(label)
                      : form[activeQuestion.key] === label;

                    return (
                      <button
                        type="button"
                        key={label}
                        className={`answer-option ${
                          selected ? "selected" : ""
                        }`}
                        aria-pressed={selected}
                        onClick={() =>
                          isMulti
                            ? toggleOption(activeQuestion.key, label)
                            : chooseSingle(activeQuestion.key, label)
                        }
                      >
                        <span className="answer-glyph">{glyph}</span>
                        <span className="answer-label">{label}</span>
                        <span className="answer-check">
                          {selected ? "✓" : isMulti ? "+" : "○"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {!isSignup && (
                <>
                  <Field label="Email address" id="login-email">
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={updateField}
                      required
                    />
                  </Field>

                  <Field label="Password" id="login-password">
                    <div className="password-wrap">
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={updateField}
                        required
                      />

                      <button
                        type="button"
                        className="show-password"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() =>
                          setShowPassword((current) => !current)
                        }
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </Field>

                  <div className="login-options">
                    <label className="remember-option">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) =>
                          setRememberMe(event.target.checked)
                        }
                      />
                      Remember this explorer
                    </label>

                    <button
                      type="button"
                      className="text-button"
                      disabled={isLoading}
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </button>
                  </div>
                </>
              )}

              {message && (
                <p
                  className="form-message"
                  role="alert"
                  aria-live="polite"
                >
                  {message}
                </p>
              )}

              {isSignup ? (
                <div className="form-actions">
                  {step > 0 && (
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setStep((current) => Math.max(0, current - 1));
                        setMessage("");
                      }}
                    >
                      ← Back
                    </button>
                  )}

                  <button
                    className="primary-button"
                    type="submit"
                    disabled={isLoading}
                  >
                    {step === totalSignupSteps - 1
                      ? isLoading
                        ? "Creating profile..."
                        : "Start my journey"
                      : "Continue"}

                    {!isLoading && <span>→</span>}
                  </button>
                </div>
              ) : (
                <button
                  className="primary-button"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing you in..." : "Continue adventure"}

                  {!isLoading && <span>→</span>}
                </button>
              )}
            </form>

            {!isSignup && (
              <div className="login-tip">
                <Companion small />

                <span>
                  <strong>Your quest is still here.</strong>
                  <br />
                  Pick up where you left off.
                </span>
              </div>
            )}

            <div className="card-switch">
              {isSignup
                ? "Already have an account?"
                : "First time in this world?"}

              <button
                type="button"
                className="text-button"
                onClick={() => switchMode(isSignup ? "login" : "signup")}
              >
                {isSignup ? "Log in" : "Create an account"}
              </button>
            </div>

            <p className="privacy-note">
              No pressure. No leaderboard required. Just your own progress,
              at your own pace.
            </p>
          </div>
        </section>

        <aside className="right-adventure" aria-hidden="true">
          <div className="right-message">
            You're capable of
            <br />
            amazing things! <span>♥</span>
          </div>

          <div className="right-mascot">
            🐻<span>🐷</span>
          </div>
        </aside>
      </section>

      <footer className="ev-footer">
        <span>© {new Date().getFullYear()} EVOLV</span>
        <span>LEARN · BUILD · GROW</span>
      </footer>
    </main>
  );
}