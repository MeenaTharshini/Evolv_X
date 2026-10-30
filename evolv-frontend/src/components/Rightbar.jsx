import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Flame,
  Zap,
  Target,
  Trophy,
  Clock3,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import { getStreak } from "../services/api";
import { getUserProfile } from "../lib/userService";

import "../styles/rightbar.css";

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const INDIA_TIME_ZONE = "Asia/Kolkata";

const INITIAL_STATS = {
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  activeToday: false,
  today: "",
  week: [],
};

// --------------------------------------------------
// DATE HELPERS
// --------------------------------------------------

/**
 * Get today's date in India Standard Time.
 * Returns YYYY-MM-DD regardless of the browser's timezone.
 */
function getIndiaDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

/**
 * Parse YYYY-MM-DD safely for calendar calculations.
 * UTC is used only for date arithmetic.
 */
function parseDateKey(dateKey) {
  if (typeof dateKey !== "string") {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function addDaysToDateKey(dateKey, amount) {
  const date = parseDateKey(dateKey);

  if (!date) {
    return "";
  }

  date.setUTCDate(date.getUTCDate() + amount);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Returns the Monday–Sunday dates for the current India-time week.
 */
function getWeekDates(todayKey = getIndiaDateString()) {
  const today = parseDateKey(todayKey);

  if (!today) {
    return [];
  }

  const mondayOffset = (today.getUTCDay() + 6) % 7;
  const mondayKey = addDaysToDateKey(todayKey, -mondayOffset);

  return DAYS.map((label, index) => {
    const date = addDaysToDateKey(mondayKey, index);

    return {
      label,
      date,
      isToday: date === todayKey,
      future: date > todayKey,
    };
  });
}

// --------------------------------------------------
// DATA HELPERS
// --------------------------------------------------

function normalizeNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? Math.max(0, number)
    : 0;
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (typeof value === "string") {
    return ["true", "1", "yes", "active"].includes(
      value.trim().toLowerCase()
    );
  }

  return false;
}

function getInitialStats() {
  return {
    ...INITIAL_STATS,
    today: getIndiaDateString(),
    week: [],
  };
}

function normalizeStats(result = {}) {
  const today = getIndiaDateString();

  const totalXP = normalizeNumber(
    result.totalXP ??
      result.totalXp ??
      result.total_xp ??
      result.xp
  );

  const currentStreak = normalizeNumber(
    result.currentStreak ??
      result.current_streak ??
      result.streak
  );

  const longestStreak = normalizeNumber(
    result.longestStreak ??
      result.longest_streak
  );

  const activeToday = normalizeBoolean(
    result.activeToday ??
      result.active_today ??
      result.didActivityToday
  );

  const rawWeek = Array.isArray(result.week)
    ? result.week
    : [];

  const week = rawWeek
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const date = item.date ?? item.activity_date;

      if (!parseDateKey(date)) {
        return null;
      }

      const count = normalizeNumber(
        item.count ??
          item.activityCount ??
          item.activity_count ??
          item.total
      );

      const explicitlyActive =
        item.active ??
        item.completed ??
        item.hasActivity ??
        item.has_activity;

      return {
        date,
        count,
        active:
          explicitlyActive === undefined
            ? count > 0
            : normalizeBoolean(explicitlyActive),
      };
    })
    .filter(Boolean);

  return {
    totalXP,
    currentStreak,
    longestStreak,
    activeToday,
    today:
      typeof result.today === "string" &&
      parseDateKey(result.today)
        ? result.today
        : today,
    week,
  };
}

function getDisplayName(profile, user) {
  const profileName =
    typeof profile?.full_name === "string"
      ? profile.full_name.trim()
      : "";

  const metadataName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";

  const emailName = user?.email
    ?.split("@")[0]
    ?.trim();

  return (
    profileName ||
    metadataName ||
    emailName ||
    "Learner"
  );
}

function getErrorMessage(error) {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  return "Unable to load your learning information. Please try again.";
}

// --------------------------------------------------
// RIGHTBAR
// --------------------------------------------------

export default function Rightbar() {
  const [profileName, setProfileName] = useState("Learner");

  const [stats, setStats] = useState(getInitialStats);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [userId, setUserId] = useState(null);

  const requestIdRef = useRef(0);

  const mountedRef = useRef(false);

  const refreshingRef = useRef(false);

  // --------------------------------------------------
  // LOAD LEARNER DATA
  // --------------------------------------------------

  const loadRightbarData = useCallback(
    async ({ showLoading = false } = {}) => {
      const requestId = ++requestIdRef.current;

      if (showLoading) {
        setLoading(true);
      }

      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        // No authenticated user.
        if (!user) {
          setUserId(null);
          setProfileName("Learner");
          setStats(getInitialStats());
          setError("");

          return;
        }

        // Clear previous user's data immediately when accounts change.
        setUserId((previousId) => {
          if (previousId && previousId !== user.id) {
            setProfileName("Learner");
            setStats(getInitialStats());
          }

          return user.id;
        });

        // Load profile and streak independently.
        const [profileResult, streakResult] =
          await Promise.allSettled([
            getUserProfile(),
            getStreak(),
          ]);

        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        // ----------------------------------------------
        // PROFILE
        // ----------------------------------------------

        if (profileResult.status === "fulfilled") {
          setProfileName(
            getDisplayName(profileResult.value, user)
          );
        } else {
          console.error(
            "Unable to load learner profile:",
            profileResult.reason
          );

          setProfileName(getDisplayName(null, user));
        }

        // ----------------------------------------------
        // LEARNING STATISTICS
        // ----------------------------------------------

        if (streakResult.status === "fulfilled") {
          setStats(normalizeStats(streakResult.value));
          setError("");
        } else {
          console.error(
            "Unable to load learning statistics:",
            streakResult.reason
          );

          // Keep previously loaded statistics when a refresh fails.
          setError(
            "Your learning statistics couldn't be loaded. Please try refreshing."
          );
        }
      } catch (loadError) {
        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        console.error(
          "Rightbar loading failed:",
          loadError
        );

        setError(getErrorMessage(loadError));
      } finally {
        if (
          mountedRef.current &&
          requestId === requestIdRef.current
        ) {
          setLoading(false);
          setRefreshing(false);
          refreshingRef.current = false;
        }
      }
    },
    []
  );

  // --------------------------------------------------
  // INITIAL LOAD AND AUTH LISTENER
  // --------------------------------------------------

  useEffect(() => {
    mountedRef.current = true;

    void loadRightbarData({ showLoading: true });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mountedRef.current) {
          return;
        }

        if (event === "SIGNED_OUT") {
          // Invalidate outstanding requests.
          requestIdRef.current += 1;

          setUserId(null);
          setProfileName("Learner");
          setStats(getInitialStats());
          setLoading(false);
          setRefreshing(false);
          refreshingRef.current = false;
          setError("");

          return;
        }

        if (
          event === "SIGNED_IN" ||
          event === "USER_UPDATED" ||
          event === "TOKEN_REFRESHED"
        ) {
          // Avoid calling Supabase APIs directly inside its auth callback.
          setTimeout(() => {
            if (mountedRef.current) {
              void loadRightbarData({
                showLoading: true,
              });
            }
          }, 0);
        }

        const nextUserId = session?.user?.id ?? null;

        if (nextUserId !== userId) {
          setUserId(nextUserId);
          setProfileName("Learner");
          setStats(getInitialStats());
        }
      }
    );

    // ----------------------------------------------
    // PROGRESS UPDATE EVENTS
    // ----------------------------------------------

    const handleProgressUpdated = () => {
      if (mountedRef.current) {
        void loadRightbarData();
      }
    };

    window.addEventListener(
      "evolv:progress-updated",
      handleProgressUpdated
    );

    window.addEventListener(
      "evolv:streak-updated",
      handleProgressUpdated
    );

    window.addEventListener(
      "evolv-progress-updated",
      handleProgressUpdated
    );

    window.addEventListener(
      "evolv-streak-updated",
      handleProgressUpdated
    );

    // Refresh when the learner returns to the tab.
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        mountedRef.current
      ) {
        void loadRightbarData();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      mountedRef.current = false;

      requestIdRef.current += 1;

      refreshingRef.current = false;

      subscription.unsubscribe();

      window.removeEventListener(
        "evolv:progress-updated",
        handleProgressUpdated
      );

      window.removeEventListener(
        "evolv:streak-updated",
        handleProgressUpdated
      );

      window.removeEventListener(
        "evolv-progress-updated",
        handleProgressUpdated
      );

      window.removeEventListener(
        "evolv-streak-updated",
        handleProgressUpdated
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [loadRightbarData, userId]);

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------

  const handleRefresh = useCallback(async () => {
    if (refreshingRef.current) {
      return;
    }

    refreshingRef.current = true;

    setRefreshing(true);

    await loadRightbarData();
  }, [loadRightbarData]);

  // --------------------------------------------------
  // WEEKLY ACTIVITY
  // --------------------------------------------------

  const todayKey = getIndiaDateString();

  const weekDates = useMemo(
    () => getWeekDates(todayKey),
    [todayKey, stats.today]
  );

  const weeklyActivity = useMemo(() => {
    const activityByDate = new Map(
      stats.week.map((item) => [item.date, item])
    );

    return weekDates.map((day) => {
      const activity = activityByDate.get(day.date);

      return {
        ...day,
        active: day.isToday
          ? stats.activeToday || Boolean(activity?.active)
          : Boolean(activity?.active),
      };
    });
  }, [weekDates, stats.week, stats.activeToday]);

  // --------------------------------------------------
  // DISPLAY HELPERS
  // --------------------------------------------------

  const firstName =
    profileName.split(/\s+/)[0] || "Learner";

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <aside
      className="ev-rightbar"
      aria-label="Learning hub"
    >
      {/* HEADER */}
      <div className="ev-rightbar-header">
        <div>
          <span className="ev-rightbar-eyebrow">
            YOUR SPACE
          </span>

          <h2>Learning Hub</h2>
        </div>

        <button
          type="button"
          className="ev-rightbar-refresh"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          aria-label="Refresh learning statistics"
          title="Refresh statistics"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "ev-refresh-spinning"
                : ""
            }
          />
        </button>
      </div>

      {/* LEARNER GREETING */}
      <section className="ev-rightbar-greeting">
        <div className="ev-rightbar-greeting-icon">
          <Target size={21} />
        </div>

        <div>
          <span>Keep moving forward</span>

          <h3>
            {profileName === "Learner"
              ? "Your next level awaits!"
              : `You've got this, ${firstName}!`}
          </h3>
        </div>
      </section>

      {/* LOADING STATE */}
      {loading && (
        <div
          className="ev-rightbar-state"
          role="status"
          aria-live="polite"
        >
          <span className="ev-rightbar-spinner" />

          <p>Loading your learning stats...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div
          className="ev-rightbar-error"
          role="alert"
        >
          <AlertCircle size={18} />

          <div>
            <strong>Couldn't refresh stats</strong>

            <p>{error}</p>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? "Retrying..." : "Try again"}
            </button>
          </div>
        </div>
      )}

      {/* LEARNING STATISTICS */}
      {!loading && (
        <>
          <section
            className="ev-rightbar-stats"
            aria-label="Learning statistics"
          >
            {/* TOTAL XP */}
            <article className="ev-rightbar-stat ev-stat-xp">
              <div className="ev-rightbar-stat-top">
                <span className="ev-rightbar-stat-icon">
                  <Zap size={19} />
                </span>

                <span className="ev-rightbar-stat-label">
                  TOTAL XP
                </span>
              </div>

              <strong>
                {stats.totalXP.toLocaleString("en-IN")}
              </strong>

              <small>Experience earned</small>
            </article>

            {/* CURRENT STREAK */}
            <article className="ev-rightbar-stat ev-stat-streak">
              <div className="ev-rightbar-stat-top">
                <span className="ev-rightbar-stat-icon">
                  <Flame size={19} />
                </span>

                <span className="ev-rightbar-stat-label">
                  STREAK
                </span>
              </div>

              <strong>{stats.currentStreak}</strong>

              <small>
                {stats.currentStreak === 1
                  ? "Day in a row"
                  : "Days in a row"}
              </small>
            </article>
          </section>

          {/* WEEKLY ACTIVITY */}
          <section className="ev-rightbar-card">
            <div className="ev-rightbar-card-heading">
              <div>
                <span className="ev-rightbar-card-icon">
                  <TrendingUp size={18} />
                </span>

                <h3>This week</h3>
              </div>

              {stats.activeToday && (
                <span className="ev-rightbar-today-badge">
                  <CheckCircle2 size={13} />
                  Active today
                </span>
              )}
            </div>

            <p className="ev-rightbar-card-description">
              Every small step counts.
            </p>

            <div
              className="ev-rightbar-week"
              aria-label="Weekly learning activity"
            >
              {weeklyActivity.map((day) => {
                const status = day.active
                  ? "Activity recorded"
                  : day.future
                    ? "Upcoming"
                    : "No activity recorded";

                return (
                  <div
                    key={day.date}
                    className={[
                      "ev-rightbar-week-day",
                      day.active
                        ? "ev-week-day-active"
                        : "",
                      day.isToday
                        ? "ev-week-day-today"
                        : "",
                      day.future
                        ? "ev-week-day-future"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    title={`${day.label}: ${status}`}
                    aria-label={`${day.label}: ${status}`}
                  >
                    <span className="ev-rightbar-week-dot">
                      {day.active ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        <span className="ev-rightbar-week-empty" />
                      )}
                    </span>

                    <span className="ev-rightbar-week-label">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* LONGEST STREAK */}
          <section className="ev-rightbar-record">
            <div className="ev-rightbar-record-icon">
              <Trophy size={21} />
            </div>

            <div className="ev-rightbar-record-copy">
              <span>PERSONAL BEST</span>

              <strong>
                {stats.longestStreak}{" "}
                {stats.longestStreak === 1
                  ? "day"
                  : "days"}
              </strong>

              <small>Your longest learning streak</small>
            </div>
          </section>

          {/* DAILY REMINDER */}
          <section className="ev-rightbar-reminder">
            <div className="ev-rightbar-reminder-icon">
              <Clock3 size={19} />
            </div>

            <div>
              <strong>
                {stats.activeToday
                  ? "Great work today!"
                  : "Your journey continues"}
              </strong>

              <p>
                {stats.activeToday
                  ? "You've shown up today. Keep building your momentum!"
                  : "Complete a lesson or quiz today to build your learning habit."}
              </p>
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <div className="ev-rightbar-footer">
        <span className="ev-rightbar-footer-mark">
          ✦
        </span>

        <p>Progress over perfection.</p>
      </div>
    </aside>
  );
}