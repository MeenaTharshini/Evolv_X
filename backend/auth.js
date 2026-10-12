
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db, { saveDatabase } from "./db.js";

const router = Router();

function getUserByEmail(email) {
  const result = db.exec(
    "SELECT * FROM users WHERE email = ? COLLATE NOCASE",
    [email]
  );

  if (!result.length || !result[0].values.length) return null;

  const columns = result[0].columns;
  const values = result[0].values[0];

  return Object.fromEntries(
    columns.map((column, index) => [column, values[index]])
  );
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    education: user.education,
    skillLevel: user.skill_level,
    interests: JSON.parse(user.interests || "[]"),
    goals: user.goals,
    learningStyle: user.learning_style,
    weeklyHours: user.weekly_hours,
    xp: user.xp,
    streakDays: user.streak_days
  };
}

function createToken(user) {
  return jwt.sign(
    { sub: String(user.id) },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const {
      name, email, password, confirmPassword,
      education, skillLevel, interests, goals,
      learningStyle, weeklyHours
    } = req.body;

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
      return res.status(400).json({
        error: "Check your name, email, and password. Passwords must match and contain 8–72 characters."
      });
    }

    if (getUserByEmail(email.trim())) {
      return res.status(409).json({
        error: "This email already has an account. Please log in."
      });
    }

    const allowedLevels = ["beginner", "intermediate", "advanced"];
    const allowedStyles = ["visual", "reading", "hands-on", "mixed"];

    if (skillLevel && !allowedLevels.includes(skillLevel)) {
      return res.status(400).json({ error: "Invalid skill level." });
    }

    if (learningStyle && !allowedStyles.includes(learningStyle)) {
      return res.status(400).json({ error: "Invalid learning style." });
    }

    const hours = weeklyHours === "" || weeklyHours == null
      ? null
      : Number(weeklyHours);

    if (hours !== null &&
        (!Number.isInteger(hours) || hours < 1 || hours > 168)) {
      return res.status(400).json({ error: "Weekly hours must be between 1 and 168." });
    }

    const cleanInterests = Array.isArray(interests)
      ? interests.filter(item => typeof item === "string").slice(0, 20)
      : [];

    const passwordHash = await bcrypt.hash(password, 12);
    const normalizedEmail = email.trim().toLowerCase();

    db.run(
      `INSERT INTO users
       (name, email, password_hash, education, skill_level,
        interests, goals, learning_style, weekly_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        normalizedEmail,
        passwordHash,
        education || null,
        skillLevel || null,
        JSON.stringify(cleanInterests),
        goals || null,
        learningStyle || null,
        hours
      ]
    );

    saveDatabase();

    const user = getUserByEmail(normalizedEmail);

    return res.status(201).json({
      message: "Welcome to EVOLV! Your adventure begins now.",
      token: createToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({ error: "Signup failed. Please try again." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        error: "Enter your email and password."
      });
    }

    const user = getUserByEmail(email.trim());

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        error: "Email or password is incorrect."
      });
    }

    return res.json({
      message: "Welcome back to EVOLV!",
      token: createToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// CURRENT USER
router.get("/me", (req, res) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Please log in." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = db.exec(
      "SELECT * FROM users WHERE id = ?",
      [Number(payload.sub)]
    );

    if (!result.length || !result[0].values.length) {
      return res.status(401).json({ error: "Account not found." });
    }

    const columns = result[0].columns;
    const values = result[0].values[0];
    const user = Object.fromEntries(
      columns.map((column, index) => [column, valueOrNull(values[index])])
    );

    return res.json({ user: publicUser(user) });
  } catch {
    return res.status(401).json({
      error: "Your session is invalid or expired. Please log in again."
    });
  }
});

function valueOrNull(value) {
  return value === undefined ? null : value;
}

export default router;
