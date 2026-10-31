import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./auth.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
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

function getErrorMessage(error) {
  const message = error?.message || "";

  if (/invalid login credentials/i.test(message)) {
    return "Incorrect email or password. Please try again.";
  }

  if (/user already registered|already been registered/i.test(message)) {
    return "An account already exists with this email. Please log in.";
  }

  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email using the link we sent you before logging in.";
  }

  if (/password should be at least/i.test(message)) {
    return "Your password is too short. Please choose a stronger password.";
  }

  if (/rate limit|too many requests|security purposes/i.test(message)) {
    return "Too many attempts. Please wait a minute and try again.";
  }

  if (/failed to fetch|network request failed/i.test(message)) {
    return "Unable to connect. Check your internet connection and try again.";
  }

  return message || "Something went wrong. Please try again.";
}

// Decides where a signed-in user should go next.
async function getPostLoginPath(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;

  return data?.onboarding_completed ? "/dashboard" : "/understanding";
}

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(
    location.pathname === "/login" ? "login" : "signup"
  );
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(location.state?.authMessage || "");

  const isSignup = mode === "signup";

  // Keep the mode in sync with the URL.
  useEffect(() => {
    setMode(location.pathname === "/login" ? "login" : "signup");
    setMessage(location.state?.authMessage || "");
    setShowPassword(false);
  }, [location.pathname, location.state]);

  // If the user already has a session, skip the auth page.
  useEffect(() => {
    let cancelled = false;

    async function redirectIfSignedIn() {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;
        if (!user || cancelled) return;

        const path = await getPostLoginPath(user.id);
        if (!cancelled) navigate(path, { replace: true });
      } catch {
        // Stay on the auth page if anything goes wrong.
      }
    }

    redirectIfSignedIn();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  function switchMode(nextMode) {
    if (nextMode === mode) return;

    setMessage("");
    setShowPassword(false);
    setMode(nextMode);

    navigate(nextMode === "login" ? "/login" : "/signup");
  }

  function validateSignup() {
    if (form.name.trim().length < 2) {
      setMessage("Please enter a name with at least 2 characters.");
      return false;
    }

    if (!EMAIL_PATTERN.test(form.email.trim())) {
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

  function validateLogin() {
    if (!form.email.trim() || !form.password) {
      setMessage("Enter your email and password to continue.");
      return false;
    }

    if (!EMAIL_PATTERN.test(form.email.trim())) {
      setMessage("Enter a valid email address.");
      return false;
    }

    return true;
  }

  async function handleSignup() {
    const email = form.email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: { full_name: form.name.trim() },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) throw error;

    if (!data?.user) {
      throw new Error("Signup could not be completed. Please try again.");
    }

    // For an email that is already registered, Supabase returns a user
    // with an empty identities array instead of an error.
    if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error("User already registered");
    }

    // Email confirmation is on: no session yet, so send them to log in.
    if (!data.session) {
      navigate("/login", {
        replace: true,
        state: {
          authMessage:
            "Account created! Check your email to confirm it, then log in.",
        },
      });
      return;
    }

    // Session exists: continue straight to onboarding.
    navigate("/understanding", { replace: true });
  }

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    if (error) throw error;

    if (!data?.user) {
      throw new Error("Login succeeded, but no user was returned.");
    }

    const path = await getPostLoginPath(data.user.id);
    navigate(path, { replace: true });
  }

  async function submitForm(event) {
    event.preventDefault();

    if (isLoading) return;

    if (isSignup ? !validateSignup() : !validateLogin()) return;

    setIsLoading(true);
    setMessage("");

    try {
      if (isSignup) {
        await handleSignup();
      } else {
        await handleLogin();
      }
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword() {
    const email = form.email.trim().toLowerCase();

    if (!email || !EMAIL_PATTERN.test(email)) {
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
        "If an account exists for that email, a password-reset link is on its way."
      );
    } catch (error) {
      setMessage(getErrorMessage(error));
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

            <div className="form-intro">
              <div className="form-intro-mascot">
                <Companion small />
              </div>

              <h3>{isSignup ? "Create your account" : "Welcome back!"}</h3>

              <p>
                {isSignup
                  ? "Your learning journey starts here."
                  : "Your next level is waiting for you."}
              </p>
            </div>

            <form onSubmit={submitForm} noValidate>
              {isSignup ? (
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
              ) : (
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

              <button
                className="primary-button"
                type="submit"
                disabled={isLoading}
              >
                {isSignup
                  ? isLoading
                    ? "Creating account..."
                    : "Create account"
                  : isLoading
                    ? "Signing you in..."
                    : "Continue adventure"}

                {!isLoading && <span>→</span>}
              </button>
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
