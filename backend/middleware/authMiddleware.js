
import jwt from "jsonwebtoken";
import db from "../db.js";

export function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication token is required."
    });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      error: "Authentication token is required."
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"]
    });

    const userId = Number(payload.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        error: "Invalid authentication token."
      });
    }

    const result = db.exec(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    if (!result.length || !result[0].values.length) {
      return res.status(401).json({
        error: "User account not found."
      });
    }

    const [values] = result[0].values;
    const columns = result[0].columns;

    req.user = Object.fromEntries(
      columns.map((column, index) => [column, values[index]])
    );

    return next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        error: "Invalid or expired authentication token."
      });
    }

    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      error: "Authentication failed."
    });
  }
}
