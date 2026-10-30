
import { supabase } from "../lib/supabaseClient";

// ==================================================
// API CONFIGURATION
// ==================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

// ==================================================
// AUTHENTICATION
// ==================================================

/**
 * Get the current Supabase access token.
 * The backend must validate this token against the same
 * Supabase project used by the frontend.
 */
export async function getAuthToken() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(
      `Unable to retrieve your session: ${error.message}`
    );
  }

  if (!session?.access_token) {
    throw new Error("No active session. Please sign in again.");
  }

  return session.access_token;
}

// ==================================================
// RESPONSE HELPERS
// ==================================================

async function readResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => ({}));
  }

  const text = await response.text().catch(() => "");
  return text ? { message: text } : {};
}

function getApiErrorMessage(data, status) {
  if (data?.error) return data.error;
  if (data?.message) return data.message;

  switch (status) {
    case 400:
      return "The request is invalid. Please check the submitted data.";
    case 401:
      return "Your session was rejected. Please sign in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested API endpoint was not found.";
    case 429:
      return "Too many requests. Please wait and try again.";
    default:
      return `Request failed with status ${status}.`;
  }
}

// ==================================================
// COMMON AUTHENTICATED API REQUEST
// ==================================================

async function request(endpoint, options = {}) {
  if (typeof endpoint !== "string" || !endpoint.startsWith("/")) {
    throw new Error("API endpoint must start with '/'.");
  }

  const token = await getAuthToken();

  const headers = {
    Accept: "application/json",
    ...(options.body !== undefined
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers,

    // Always use the current Supabase access token.
    Authorization: `Bearer ${token}`,
  };

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error("EVOLV API connection failed:", error);

    throw new Error(
      "Unable to connect to the EVOLV server. Check that the backend is running and VITE_API_BASE_URL is correct."
    );
  }

  const data = await readResponse(response);

  if (!response.ok) {
    const message = getApiErrorMessage(data, response.status);

    console.error("EVOLV API request failed:", {
      endpoint,
      status: response.status,
      message,
    });

    throw new Error(message);
  }

  return data;
}

// ==================================================
// LEGACY EXPRESS AUTHENTICATION
// ==================================================

/**
 * Keep these functions only while existing components
 * still depend on the Express authentication endpoints.
 *
 * If the application now uses Supabase Auth directly,
 * use supabase.auth.signUp() and supabase.auth.signInWithPassword()
 * in the authentication page instead.
 */

export function registerUser(userData) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function loginUser(credentials) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function getCurrentUser() {
  return request("/auth/me");
}

// ==================================================
// STREAK RESPONSE NORMALIZATION
// ==================================================

/**
 * Normalize the backend's streak response.
 *
 * Supports the backend's current fields:
 * currentStreak, longestStreak, totalXp, activeToday,
 * today, and week.
 *
 * Also supports snake_case field names.
 */
function normalizeStreakResponse(response = {}) {
  const source = response.stats ?? response;

  const totalXP = Number(
    source.totalXP ??
      source.totalXp ??
      source.total_xp ??
      0
  );

  const currentStreak = Number(
    source.currentStreak ??
      source.current_streak ??
      0
  );

  const longestStreak = Number(
    source.longestStreak ??
      source.longest_streak ??
      0
  );

  const week = Array.isArray(source.week)
    ? source.week
    : [];

  return {
    ...source,

    totalXP: Number.isFinite(totalXP)
      ? Math.max(0, totalXP)
      : 0,

    currentStreak: Number.isFinite(currentStreak)
      ? Math.max(0, currentStreak)
      : 0,

    longestStreak: Number.isFinite(longestStreak)
      ? Math.max(0, longestStreak)
      : 0,

    activeToday: Boolean(
      source.activeToday ?? source.active_today ?? false
    ),

    today: source.today ?? null,

    week: week.map((item) => ({
      ...item,
      date: item.date ?? item.activity_date ?? "",
      completed: Boolean(
        item.completed ??
          item.active ??
          item.hasActivity ??
          item.has_activity ??
          (Number(item.count) > 0)
      ),
      isToday: Boolean(item.isToday ?? item.is_today ?? false),
      isFuture: Boolean(item.isFuture ?? item.is_future ?? false),
    })),
  };
}

// ==================================================
// LEARNING STREAK
// ==================================================

/**
 * Fetch the authenticated user's learning statistics.
 */
export async function getStreak() {
  const response = await request("/streak");
  return normalizeStreakResponse(response);
}

// ==================================================
// RECORD LEARNING ACTIVITY
// ==================================================

/**
 * Record a lesson or quiz activity.
 *
 * Example:
 * recordLearningActivity({
 *   activityType: "lesson",
 *   activityRef: "python-lesson-1",
 * });
 */
export async function recordLearningActivity({
  activityType = "lesson",
  activityRef,
} = {}) {
  if (!["lesson", "quiz"].includes(activityType)) {
    throw new Error(
      "Activity type must be either lesson or quiz."
    );
  }

  if (
    typeof activityRef !== "string" ||
    !activityRef.trim()
  ) {
    throw new Error("A valid activity reference is required.");
  }

  const response = await request("/streak/activity", {
    method: "POST",
    body: JSON.stringify({
      activityType,
      activityRef: activityRef.trim(),
    }),
  });

  // Normalize the updated statistics returned by the backend.
  const normalized = normalizeStreakResponse(response);

  // Notify components that display learning progress.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("evolv:streak-updated"));
    window.dispatchEvent(new Event("evolv:progress-updated"));
  }

  return {
    ...response,
    ...normalized,
  };
}

// ==================================================
// SUPABASE LOGOUT
// ==================================================

/**
 * Sign out through Supabase Auth.
 *
 * Learning progress and XP are not deleted.
 */
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  // Remove obsolete authentication data only.
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("evolv_token");
      window.localStorage.removeItem("evolv_user");

      window.sessionStorage.removeItem("evolv_token");
      window.sessionStorage.removeItem("evolv_user");
    }
  } catch (storageError) {
    console.warn(
      "Unable to clear legacy session data:",
      storageError
    );
  }
}