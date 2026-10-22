
const API_BASE_URL = "http://localhost:5000/api";

function getToken() {
  return (
    localStorage.getItem("evolv_token") ||
    sessionStorage.getItem("evolv_token")
  );
}

async function request(endpoint, options = {}) {
  const token = options.token || getToken();
  const { token: _ignoredToken, ...fetchOptions } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed (${response.status})`
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

export function getCurrentUser(token) {
  return request("/auth/me", {
    method: "GET",
    token,
  });
}

// Fetch the authenticated user's streak from the backend.
export function getStreak() {
  return request("/streak");
}

// Record a successfully completed learning activity.
export function recordLearningActivity({
  activityType = "lesson",
  activityRef,
}) {
  if (!activityRef) {
    return Promise.reject(
      new Error("activityRef is required.")
    );
  }

  return request("/streak/activity", {
    method: "POST",
    body: JSON.stringify({
      activityType,
      activityRef,
    }),
  });
}

export function logoutUser() {
  localStorage.removeItem("evolv_token");
  localStorage.removeItem("evolv_user");
  sessionStorage.removeItem("evolv_token");
  sessionStorage.removeItem("evolv_user");
}
