
import { useEffect, useState } from "react";
import "./auth.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

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

const hoursMap = {
  "Less than 2 hours": 1,
  "3–5 hours": 4,
  "6–10 hours": 8,
  "10+ hours": 10,
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

function saveSession(token, rememberMe, user) {
  localStorage.removeItem("evolv_token");
  sessionStorage.removeItem("evolv_token");
  localStorage.removeItem("evolv_user");
  sessionStorage.removeItem("evolv_user");

  const storage = rememberMe ? localStorage : sessionStorage;

  storage.setItem("evolv_token", token);

  if (user) {
    storage.setItem("evolv_user", JSON.stringify(user));
  }
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

function Companion({ small = false }) {
  return (
    <div
      className={`companion ${small ? "companion-small" : ""}`}
      role="img"
      aria-label="EVO, your EVOLV learning companion"
    >
      <span className="companion-shadow" />
      <span className="companion-leaf leaf-left" />
      <span className="companion-leaf leaf-right" />

      <div className="companion-body">
        <div className="companion-face">
          <span className="eye eye-left" />
          <span className="eye eye-right" />
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
      <div className="decor-cloud cloud-three" />

      <div className="decor-chip code-chip">
        <span>&lt;/&gt;</span>
        <small>CODE</small>
      </div>

      <div className="decor-chip idea-chip">
        <span>✳</span>
        <small>IDEAS</small>
      </div>

      <div className="decor-book">▤</div>

      <div className="decor-star star-one">✦</div>
      <div className="decor-star star-two">✧</div>
      <div className="decor-star star-three">✳</div>

      <div className="decor-sign sign-code">
        Code <span>→</span>
      </div>

      <div className="decor-sign sign-create">
        Create <span>→</span>
      </div>

      <div className="decor-sign sign-grow">
        Grow <span>→</span>
      </div>

      <div className="decor-island">
        <span className="island-tree tree-one">🌳</span>
        <span className="island-tree tree-two">🌲</span>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(
    location.pathname === "/login" ? "login" : "signup"
  );

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isSignup = mode === "signup";

  // Keep the displayed form synchronized with the current route.
  useEffect(() => {
    const nextMode = location.pathname === "/login" ? "login" : "signup";

    setMode(nextMode);
    setStep(1);
    setMessage("");
    setShowPassword(false);
  }, [location.pathname]);

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

  function switchMode(nextMode) {
    setStep(1);
    setMessage("");
    setShowPassword(false);

    navigate(nextMode === "login" ? "/login" : "/signup");
  }

  function continueSignup(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setMessage("Your adventure needs a name and email first.");
      return;
    }

    if (form.name.trim().length < 2) {
      setMessage("Please enter a name with at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setMessage("Enter a valid email address.");
      return;
    }

    if (form.password.length < 8 || form.password.length > 72) {
      setMessage("Use a password between 8 and 72 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Your passwords don't match. Try again!");
      return;
    }

    setStep(2);
    setMessage("");
  }

  async function submitForm(event) {
    event.preventDefault();

    if (isLoading) return;

    if (!form.email.trim() || !form.password) {
      setMessage("Enter your email and password to continue.");
      return;
    }

    if (isSignup) {
      if (!form.name.trim() || form.name.trim().length < 2) {
        setStep(1);
        setMessage("Please enter a name with at least 2 characters.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setStep(1);
        setMessage("Enter a valid email address.");
        return;
      }

      if (form.password.length < 8 || form.password.length > 72) {
        setStep(1);
        setMessage("Use a password between 8 and 72 characters.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setStep(1);
        setMessage("Your passwords don't match. Try again!");
        return;
      }

      if (
        !form.education ||
        !form.skillLevel ||
        form.interests.length === 0 ||
        form.goals.length === 0 ||
        form.learningStyle.length === 0
      ) {
        setMessage(
          "Choose your education, skill level, interests, missions and learning style."
        );
        return;
      }
    }

    setIsLoading(true);
    setMessage("");

    try {
      const endpoint = isSignup
        ? `${API_URL}/auth/signup`
        : `${API_URL}/auth/login`;

      const payload = isSignup
        ? {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            confirmPassword: form.confirmPassword,
            education: form.education,
            skillLevel: form.skillLevel.toLowerCase(),
            interests: form.interests,
            goals: form.goals.join(", "),
            learningStyle:
              learningStyleMap[form.learningStyle[0]] || "mixed",
            weeklyHours: hoursMap[form.weeklyHours] ?? 4,
          }
        : {
            email: form.email.trim(),
            password: form.password,
          };

      const response = await fetch(`${API_URL}/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            data.error ||
              "An account already exists with this email. Try logging in."
          );
        }

        throw new Error(
          data.error ||
            data.message ||
            `Authentication failed (${response.status}). Please check your details.`
        );
      }

      if (!data.token) {
        throw new Error(
          "The server did not return an authentication token."
        );
      }

      // Save only user information that the API actually returns.
      saveSession(
        data.token,
        isSignup || rememberMe,
        data.user || null
      );

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? "Unable to connect. Make sure the EVOLV backend is running on port 5000."
          : error.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="ev-auth">
      <AuthDecorations />

      <header className="ev-topbar">
        <Brand />

        <div className="topbar-right">
          <span>
            {isSignup ? "Already on the journey?" : "New explorer?"}
          </span>

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

              <p>Your learning journey starts here!</p>
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
              <div className="stepper">
                <div className="step-line">
                  <span className={step === 2 ? "complete" : ""} />
                </div>

                <div
                  className={`step-node node-one ${step >= 1 ? "active" : ""}`}
                >
                  1
                </div>

                <div
                  className={`step-node node-two ${step === 2 ? "active" : ""}`}
                >
                  2
                </div>

                <div className="step-label label-one">
                  Build your profile
                </div>

                <div className="step-label label-two">
                  Choose your quests
                </div>
              </div>
            )}

            <div className="form-intro">
              <div className="form-intro-mascot">
                <Companion small />
              </div>

              <div>
                <h3>
                  {isSignup
                    ? step === 1
                      ? "Ready, player one?"
                      : "Pick your adventure!"
                    : "Welcome back!"}
                </h3>

                <p>
                  {isSignup
                    ? step === 1
                      ? "Let's create your learning profile."
                      : "Choose what you want to explore."
                    : "Your next level is waiting for you."}
                </p>
              </div>
            </div>

            <form
              onSubmit={
                isSignup && step === 1 ? continueSignup : submitForm
              }
            >
              {isSignup && step === 1 && (
                <>
                  <Field label="What should we call you?" id="name">
                    <input
                      id="name"
                      name="name"
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
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((current) => !current)}
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
                        placeholder="One more time"
                        value={form.confirmPassword}
                        onChange={updateField}
                        minLength={8}
                        maxLength={72}
                        required
                      />

                      <span className="input-lock" aria-hidden="true">
                        ♙
                      </span>
                    </div>
                  </Field>

                  <button className="primary-button" type="submit">
                    Build my profile <span>→</span>
                  </button>
                </>
              )}

              {isSignup && step === 2 && (
                <>
                  <Field label="Choose your current world" id="education">
                    <select
                      id="education"
                      name="education"
                      value={form.education}
                      onChange={updateField}
                      required
                    >
                      <option value="">Where are you on your journey?</option>
                      <option>School student</option>
                      <option>College student</option>
                      <option>Graduate</option>
                      <option>Working professional</option>
                      <option>Career switcher</option>
                      <option>Other</option>
                    </select>
                  </Field>

                  <div className="ev-field">
                    <span className="ev-label">Choose your difficulty level</span>

                    <div className="level-grid">
                      {[
                        ["Beginner", "Fresh spawn", "🌱"],
                        ["Intermediate", "Getting stronger", "🧭"],
                        ["Advanced", "Boss-level ready", "⚡"],
                      ].map(([value, description, icon]) => (
                        <button
                          type="button"
                          key={value}
                          aria-pressed={form.skillLevel === value}
                          className={`level-card ${form.skillLevel === value ? "selected" : ""}`}
                          onClick={() => {
                            setForm((current) => ({
                              ...current,
                              skillLevel: value,
                            }));
                            setMessage("");
                          }}
                        >
                          <span className="level-emoji">{icon}</span>
                          <strong>{value}</strong>
                          <small>{description}</small>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ev-field">
                    <span className="ev-label">
                      Pick your worlds{" "}
                      <small>Choose all that spark curiosity</small>
                    </span>

                    <div className="interest-grid">
                      {interestsList.map((item) => (
                        <button
                          type="button"
                          key={item}
                          aria-pressed={form.interests.includes(item)}
                          className={`interest-card ${form.interests.includes(item) ? "selected" : ""}`}
                          onClick={() => toggleOption("interests", item)}
                        >
                          <span className="interest-glyph">{icons[item]}</span>
                          <span>{item}</span>
                          <i>{form.interests.includes(item) ? "✓" : "+"}</i>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ev-field">
                    <span className="ev-label">
                      Choose your missions{" "}
                      <small>What would make you proud?</small>
                    </span>

                    <div className="goal-list">
                      {goalsList.map((item, index) => (
                        <button
                          type="button"
                          key={item}
                          aria-pressed={form.goals.includes(item)}
                          className={`goal-option ${form.goals.includes(item) ? "selected" : ""}`}
                          onClick={() => toggleOption("goals", item)}
                        >
                          <span className="goal-glyph">
                            {["✦", "⚑", "⌘", "↗", "✹", "◎"][index]}
                          </span>
                          <span>{item}</span>
                          <i>{form.goals.includes(item) ? "✓" : "+"}</i>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ev-field">
                    <span className="ev-label">
                      Your preferred power-up{" "}
                      <small>How do you like to learn?</small>
                    </span>

                    <div className="style-grid">
                      {learningStyles.map((item, index) => (
                        <button
                          type="button"
                          key={item}
                          aria-pressed={form.learningStyle.includes(item)}
                          className={`style-option ${form.learningStyle.includes(item) ? "selected" : ""}`}
                          onClick={() => toggleOption("learningStyle", item)}
                        >
                          <span>{["▶", "▤", "</>", "◇"][index]}</span>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Field label="Weekly learning time" id="weekly-hours">
                    <select
                      id="weekly-hours"
                      name="weeklyHours"
                      value={form.weeklyHours}
                      onChange={updateField}
                    >
                      <option>Less than 2 hours</option>
                      <option>3–5 hours</option>
                      <option>6–10 hours</option>
                      <option>10+ hours</option>
                    </select>
                  </Field>

                  <div className="form-actions">
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setStep(1);
                        setMessage("");
                      }}
                    >
                      ← Back
                    </button>

                    <button
                      className="primary-button"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating profile..." : "Start my journey"}
                      {!isLoading && <span>✦</span>}
                    </button>
                  </div>
                </>
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
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((current) => !current)}
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
                        onChange={(event) => setRememberMe(event.target.checked)}
                      />
                      Remember this explorer
                    </label>

                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        setMessage("Password recovery isn't configured yet.")
                      }
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    className="primary-button"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing you in..." : "Continue adventure"}
                    {!isLoading && <span>→</span>}
                  </button>

                  <div className="login-tip">
                    <Companion small />

                    <span>
                      <strong>Your quest is still here.</strong>
                      <br />
                      Pick up where you left off.
                    </span>
                  </div>
                </>
              )}

              {message && (
                <p className="form-message" role="alert" aria-live="polite">
                  {message}
                </p>
              )}
            </form>

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

