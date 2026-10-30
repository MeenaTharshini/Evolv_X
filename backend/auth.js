
import { Router } from "express";
import { supabase } from "./db.js";
import { requireAuth } from "./middleware/authMiddleware.js";

const router = Router();

const ALLOWED_LEVELS = ["beginner", "intermediate", "advanced"];
const ALLOWED_STYLES = ["visual", "reading", "hands-on", "mixed"];

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function validateProfileInput({
  name,
  email,
  password,
  confirmPassword,
  skillLevel,
  learningStyle,
  interests,
  goals,
  weeklyHours,
}) {
  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 72 ||
    password !== confirmPassword
  ) {
    return "Check your name, email, and password. Passwords must match and contain 8–72 characters.";
  }

  if (
    skillLevel != null &&
    skillLevel !== "" &&
    !ALLOWED_LEVELS.includes(skillLevel)
  ) {
    return "Invalid skill level.";
  }

  if (
    learningStyle != null &&
    learningStyle !== "" &&
    !ALLOWED_STYLES.includes(learningStyle)
  ) {
    return "Invalid learning style.";
  }

  if (
    interests != null &&
    (!Array.isArray(interests) ||
      interests.some((item) => typeof item !== "string"))
  ) {
    return "Interests must be provided as a list of strings.";
  }

  if (
    goals != null &&
    (!Array.isArray(goals) ||
      goals.some((item) => typeof item !== "string"))
  ) {
    return "Goals must be provided as a list of strings.";
  }

  const hours =
    weeklyHours == null || weeklyHours === ""
      ? null
      : Number.parseInt(String(weeklyHours).match(/^\d+/)?.[0] ?? "", 10);

  if (
    weeklyHours != null &&
    weeklyHours !== "" &&
    (!Number.isInteger(hours) || hours < 1 || hours > 168)
  ) {
    return "Weekly hours must be between 1 and 168.";
  }

  return null;
}

function getWeeklyHours(value) {
  if (value == null || value === "") return null;

  // Supports values such as "3–5 hours" and "5".
  const match = String(value).match(/\d+/);
  if (!match) return null;

  const hours = Number(match[0]);
  return Number.isInteger(hours) && hours >= 1 && hours <= 168
    ? hours
    : null;
}

function cleanString(value) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function cleanStringArray(value) {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ].slice(0, 20);
}

function publicUser(user, profile = null) {
  const metadata = user.user_metadata ?? {};

  return {
    id: user.id,
    email: user.email,
    name:
      profile?.full_name ||
      metadata.full_name ||
      metadata.name ||
      "",
    education: profile?.education ?? metadata.education ?? null,
    skillLevel: profile?.skill_level ?? metadata.skill_level ?? null,
    interests: profile?.interests ?? metadata.interests ?? [],
    goals: profile?.goals ?? metadata.goals ?? [],
    learningStyle:
      profile?.learning_style ?? metadata.learning_style ?? null,
    weeklyHours: profile?.weekly_hours ?? metadata.weekly_hours ?? null,
  };
}

async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, education, skill_level, interests, goals, learning_style, weekly_hours"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      education,
      skillLevel,
      interests,
      goals,
      learningStyle,
      weeklyHours,
    } = req.body ?? {};

    const validationError = validateProfileInput({
      name,
      email,
      password,
      confirmPassword,
      skillLevel,
      learningStyle,
      interests,
      goals,
      weeklyHours,
    });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const normalizedEmail = normalizeEmail(email);
    const cleanInterests = cleanStringArray(interests);
    const cleanGoals =
      typeof goals === "string"
        ? cleanStringArray([goals])
        : cleanStringArray(goals);

    const profileMetadata = {
      full_name: name.trim(),
      education: cleanString(education),
      skill_level: skillLevel || null,
      interests: cleanInterests,
      goals: cleanGoals,
      learning_style: learningStyle || null,
      // The existing profiles.weekly_hours column is TEXT.
      weekly_hours:
        weeklyHours == null || weeklyHours === ""
          ? null
          : String(weeklyHours).trim(),
    };

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: profileMetadata,
      },
    });

    if (error) {
      const status =
        /already registered|already exists/i.test(error.message)
          ? 409
          : 400;

      return res.status(status).json({
        error:
          status === 409
            ? "This email already has an account. Please log in."
            : error.message,
      });
    }

    if (!data.user) {
      return res.status(400).json({
        error: "Signup could not be completed. Please try again.",
      });
    }

    // Supabase may require email confirmation before a session is issued.
    // A database trigger should create profiles when auth.users is inserted.
    let profile = null;

    if (data.session) {
      const { data: savedProfile, error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: data.user.id,
            ...profileMetadata,
          },
          { onConflict: "id" }
        )
        .select(
          "id, full_name, education, skill_level, interests, goals, learning_style, weekly_hours"
        )
        .single();

      if (profileError) {
        console.error("Profile save error:", profileError.message);

        return res.status(500).json({
          error:
            "Your account was created, but saving your profile failed. Please log in and try again.",
        });
      }

      profile = savedProfile;
    }

    return res.status(201).json({
      message: data.session
        ? "Welcome to EVOLV! Your adventure begins now."
        : "Your account was created. Check your email to confirm your account before logging in.",
      requiresEmailConfirmation: !data.session,
      session: data.session,
      token: data.session?.access_token ?? null,
      user: publicUser(data.user, profile),
    });
  } catch (error) {
    console.error("Signup error:", error.message);

    return res.status(500).json({
      error: "Signup failed. Please try again.",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        error: "Enter your email and password.",
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });

    if (error || !data.user || !data.session) {
      return res.status(401).json({
        error: "Email or password is incorrect. If needed, confirm your email first.",
      });
    }

    const profile = await getProfile(data.user.id);

    return res.status(200).json({
      message: "Welcome back to EVOLV!",
      session: data.session,
      token: data.session.access_token,
      user: publicUser(data.user, profile),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      error: "Login failed. Please try again.",
    });
  }
});

// CURRENT USER
router.get("/me", requireAuth, async (req, res) => {
  try {
    // requireAuth must attach the authenticated Supabase user to req.user.
    const user = req.user;

    if (!user?.id) {
      return res.status(401).json({
        error: "Your session is invalid. Please log in again.",
      });
    }

    const profile = await getProfile(user.id);

    return res.status(200).json({
      user: publicUser(user, profile),
    });
  } catch (error) {
    console.error("Current user error:", error.message);

    return res.status(500).json({
      error: "Could not retrieve your account.",
    });
  }
});

// UPDATE PROFILE
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const user = req.user;

    if (!user?.id) {
      return res.status(401).json({
        error: "Your session is invalid. Please log in again.",
      });
    }

    const {
      name,
      full_name,
      education,
      skillLevel,
      skill_level,
      interests,
      goals,
      learningStyle,
      learning_style,
      weeklyHours,
      weekly_hours,
    } = req.body ?? {};

    const profilePayload = {
      id: user.id,
      updated_at: new Date().toISOString(),
    };

    const resolvedName = cleanString(full_name || name);
    if (resolvedName) profilePayload.full_name = resolvedName;

    const resolvedEducation = cleanString(education);
    if (resolvedEducation !== null) profilePayload.education = resolvedEducation;

    const resolvedLevel = skill_level || skillLevel;
    if (resolvedLevel && ALLOWED_LEVELS.includes(resolvedLevel)) {
      profilePayload.skill_level = resolvedLevel;
    }

    if (interests !== undefined) {
      profilePayload.interests = cleanStringArray(interests);
    }

    if (goals !== undefined) {
      profilePayload.goals = typeof goals === "string"
        ? cleanStringArray([goals])
        : cleanStringArray(goals);
    }

    const resolvedStyle = learning_style || learningStyle;
    if (resolvedStyle) {
      profilePayload.learning_style = cleanString(resolvedStyle);
    }

    const resolvedHours = weekly_hours ?? weeklyHours;
    if (resolvedHours !== undefined) {
      profilePayload.weekly_hours = cleanString(String(resolvedHours));
    }

    const { data: updatedProfile, error: profileError } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" })
      .select("id, full_name, education, skill_level, interests, goals, learning_style, weekly_hours")
      .single();

    if (profileError) {
      console.error("Profile update error:", profileError.message);
      return res.status(500).json({
        error: "Failed to update profile.",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: publicUser(user, updatedProfile),
    });
  } catch (error) {
    console.error("Profile update route error:", error.message);
    return res.status(500).json({
      error: "Could not update profile.",
    });
  }
});

export default router;