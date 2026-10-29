
const API_BASE_URL = "http://localhost:5000/api";

export function getAuthToken() {
  try {
    return (
      localStorage.getItem("evolv_token") ||
      sessionStorage.getItem("evolv_token") ||
      ""
    );
  } catch {
    return "";
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Your session has expired or is invalid. Please log in again."
      );
    }

    throw new Error(
      data.error ||
        data.message ||
        `Request failed with status ${response.status}.`
    );
  }

  return data;
}

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

export function getStreak() {
  return request("/streak");
}

export function recordLearningActivity({
  activityType = "lesson",
  activityRef,
}) {
  if (!["lesson", "quiz"].includes(activityType)) {
    return Promise.reject(
      new Error("Activity type must be lesson or quiz.")
    );
  }

  if (
    typeof activityRef !== "string" ||
    !activityRef.trim()
  ) {
    return Promise.reject(
      new Error("A valid activity reference is required.")
    );
  }

  return request("/streak/activity", {
    method: "POST",
    body: JSON.stringify({
      activityType,
      activityRef: activityRef.trim(),
    }),
  });
}

export function logoutUser() {
  localStorage.removeItem("evolv_token");
  localStorage.removeItem("evolv_user");
  sessionStorage.removeItem("evolv_token");
  sessionStorage.removeItem("evolv_user");
}