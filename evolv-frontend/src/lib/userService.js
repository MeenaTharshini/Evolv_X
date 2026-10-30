import { supabase } from "./supabaseClient";

// --------------------------------------------------
// GET CURRENT AUTHENTICATED USER
// --------------------------------------------------

/**
 * Returns the currently authenticated Supabase user.
 * Returns null if nobody is signed in.
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user ?? null;
}

// --------------------------------------------------
// GET USER PROFILE
// --------------------------------------------------

/**
 * Retrieves the authenticated user's EVOLV profile.
 *
 * Uses the existing Supabase profiles table:
 * id, full_name, education, skill_level, interests,
 * goals, learning_style, weekly_hours.
 */
export async function getUserProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      [
        "id",
        "full_name",
        "education",
        "skill_level",
        "interests",
        "goals",
        "learning_style",
        "weekly_hours",
        "created_at",
        "updated_at",
      ].join(", ")
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  // Return a consistent profile structure when the profile
  // has not yet been created.
  if (!data) {
    return {
      id: user.id,
      email: user.email ?? "",
      full_name: user.user_metadata?.full_name ?? "",
      education: null,
      skill_level: null,
      interests: [],
      goals: [],
      learning_style: null,
      weekly_hours: null,
      created_at: null,
      updated_at: null,
      profileExists: false,
    };
  }

  return {
    ...data,
    email: user.email ?? "",
    interests: Array.isArray(data.interests)
      ? data.interests
      : [],
    goals: Array.isArray(data.goals)
      ? data.goals
      : data.goals
        ? [data.goals]
        : [],
    profileExists: true,
  };
}

// --------------------------------------------------
// SAVE OR UPDATE USER PROFILE
// --------------------------------------------------

/**
 * Creates or updates the authenticated user's profile.
 *
 * Accepts both database-style snake_case fields and
 * frontend-style camelCase fields.
 *
 * Example:
 * saveUserProfile({
 *   full_name: "Student Name",
 *   education: "Engineering",
 *   skillLevel: "Beginner",
 *   interests: ["Python", "Web Development"],
 *   goals: ["Build projects", "Get an internship"],
 *   learningStyle: "Visual",
 *   weeklyHours: "3–5 hours"
 * });
 */
export async function saveUserProfile(profile = {}) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Please log in before saving your profile.");
  }

  const fullName = String(
    profile.full_name ??
      profile.fullName ??
      profile.name ??
      user.user_metadata?.full_name ??
      ""
  ).trim();

  if (fullName.length < 2) {
    throw new Error("Please provide a valid name.");
  }

  const interests = Array.isArray(profile.interests)
    ? profile.interests
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  // The existing Supabase schema defines goals as an ARRAY.
  // Store an array instead of joining it into a string.
  const goals = Array.isArray(profile.goals)
    ? profile.goals
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : typeof profile.goals === "string" &&
        profile.goals.trim()
      ? profile.goals
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const payload = {
    id: user.id,
    full_name: fullName,
    education: normalizeOptionalText(profile.education),
    skill_level: normalizeOptionalText(
      profile.skill_level ?? profile.skillLevel
    ),
    interests,
    goals,
    learning_style: normalizeOptionalText(
      profile.learning_style ?? profile.learningStyle
    ),
    weekly_hours: normalizeOptionalText(
      profile.weekly_hours ?? profile.weeklyHours
    ),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select(
      [
        "id",
        "full_name",
        "education",
        "skill_level",
        "interests",
        "goals",
        "learning_style",
        "weekly_hours",
        "created_at",
        "updated_at",
      ].join(", ")
    )
    .single();

  if (error) {
    console.error("Failed to save EVOLV profile:", error);
    throw new Error(getProfileErrorMessage(error));
  }

  return {
    ...data,
    email: user.email ?? "",
    profileExists: true,
  };
}

// --------------------------------------------------
// UPDATE DISPLAY NAME
// --------------------------------------------------

/**
 * Updates the authenticated user's display name.
 *
 * Uses upsert so this also works when the profile row
 * has not been created yet.
 */
export async function updateDisplayName(fullName) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Please log in before updating your name.");
  }

  const name = String(fullName ?? "").trim();

  if (name.length < 2) {
    throw new Error("Your name must contain at least 2 characters.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: name,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select(
      [
        "id",
        "full_name",
        "education",
        "skill_level",
        "interests",
        "goals",
        "learning_style",
        "weekly_hours",
        "created_at",
        "updated_at",
      ].join(", ")
    )
    .single();

  if (error) {
    console.error("Failed to update display name:", error);
    throw new Error(getProfileErrorMessage(error));
  }

  return {
    ...data,
    email: user.email ?? "",
    profileExists: true,
  };
}

// --------------------------------------------------
// LOGOUT
// --------------------------------------------------

/**
 * Signs out the current Supabase user.
 *
 * Clears obsolete authentication keys only.
 * Does not remove saved learning progress, XP, or app settings.
 */
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("evolv_token");
      window.localStorage.removeItem("evolv_user");

      window.sessionStorage.removeItem("evolv_token");
      window.sessionStorage.removeItem("evolv_user");
    }
  } catch (error) {
    console.error("Unable to clear legacy session data:", error);
  }
}

// --------------------------------------------------
// INTERNAL HELPERS
// --------------------------------------------------

/**
 * Converts optional profile values into trimmed strings
 * or null when no value is provided.
 */
function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized || null;
}

/**
 * Provides helpful messages for common Supabase errors.
 */
function getProfileErrorMessage(error) {
  if (error?.code === "42501") {
    return (
      "Supabase denied access to your profile. Check the profiles table's Row Level Security policies."
    );
  }

  if (error?.code === "23503") {
    return (
      "The profile could not be saved because its user reference is invalid."
    );
  }

  if (error?.code === "23505") {
    return (
      "A conflicting profile record already exists. Check the profiles table constraints."
    );
  }

  if (
    error?.message?.toLowerCase().includes("column") &&
    error?.message?.toLowerCase().includes("does not exist")
  ) {
    return (
      "A required profile column is missing. Verify the profiles table schema in Supabase."
    );
  }

  return error?.message || "Unable to save your profile. Please try again.";
}