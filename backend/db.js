
import initSqlJs from "sql.js";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.resolve("data");
const dbPath = path.join(dataDir, "evolv.sqlite");

fs.mkdirSync(dataDir, { recursive: true });

const SQL = await initSqlJs();

let db;

if (fs.existsSync(dbPath)) {
  const fileBuffer = fs.readFileSync(dbPath);
  db = new SQL.Database(fileBuffer);
} else {
  db = new SQL.Database();
}

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    education TEXT,
    skill_level TEXT,
    interests TEXT DEFAULT '[]',
    goals TEXT,
    learning_style TEXT,
    weekly_hours INTEGER,
    xp INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// One record per user per learning date.
db.run(`
  CREATE TABLE IF NOT EXISTS learning_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity_date TEXT NOT NULL,
    activity_type TEXT NOT NULL
      CHECK (activity_type IN ('lesson', 'quiz')),
    activity_ref TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE,

    UNIQUE (user_id, activity_date, activity_type, activity_ref)
  );
`);

// Helps retrieve a user's learning history by date.
db.run(`
  CREATE INDEX IF NOT EXISTS idx_learning_activity_user_date
  ON learning_activity(user_id, activity_date);
`);

export function saveDatabase() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

saveDatabase();

export default db;
