
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import pythonLessons from "../evolv-frontend/src/data/pythonLessons.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const COURSE_SLUG = "python";
const EXPECTED_LESSONS = 60;
const BATCH_SIZE = 20;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env"
  );
}

if (!Array.isArray(pythonLessons)) {
  throw new Error(
    "Python curriculum must export an array as its default export."
  );
}

if (pythonLessons.length !== EXPECTED_LESSONS) {
  throw new Error(
    `Expected ${EXPECTED_LESSONS} Python lessons, found ${pythonLessons.length}.`
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function durationToMinutes(duration) {
  const match = String(duration ?? "").match(/(\d+(?:\.\d+)?)/);
  return match ? Math.max(1, Math.round(Number(match[1]))) : 8;
}

function validateCurriculum() {
  const seenPositions = new Set();
  const seenSlugs = new Set();

  for (let index = 0; index < pythonLessons.length; index += 1) {
    const lesson = pythonLessons[index];

    if (lesson.id == null || !String(lesson.title ?? "").trim()) {
      throw new Error(
        `Lesson at position ${index + 1} is missing its ID or title.`
      );
    }

    const slug = `python-lesson-${lesson.id}`;

    if (seenSlugs.has(slug)) {
      throw new Error(`Duplicate lesson slug found: ${slug}`);
    }

    seenSlugs.add(slug);

    const position = index + 1;

    if (seenPositions.has(position)) {
      throw new Error(`Duplicate lesson position: ${position}`);
    }

    seenPositions.add(position);
  }
}

async function getPythonCourse() {
  const { data: existingCourse, error: lookupError } = await supabase
    .from("courses")
    .select("id, slug, title")
    .eq("slug", COURSE_SLUG)
    .maybeSingle();

  if (lookupError) {
    throw new Error(
      `Could not look up Python course: ${lookupError.message}`
    );
  }

  const courseFields = {
    title: "Python for Everyone",
    description:
      "Learn Python step by step through 60 interactive lessons across 8 learning worlds.",
    difficulty: "Beginner",
    total_lessons: pythonLessons.length,
    is_published: true,
  };

  if (existingCourse) {
    const { data, error } = await supabase
      .from("courses")
      .update(courseFields)
      .eq("id", existingCourse.id)
      .select("id, slug, title")
      .single();

    if (error) {
      throw new Error(`Could not update Python course: ${error.message}`);
    }

    return data;
  }

  // Do not supply id. PostgreSQL must generate it.
  const { data, error } = await supabase
    .from("courses")
    .insert({
      slug: COURSE_SLUG,
      ...courseFields,
    })
    .select("id, slug, title")
    .single();

  if (error) {
    throw new Error(`Could not create Python course: ${error.message}`);
  }

  return data;
}

async function getExistingLessons(courseId) {
  const { data, error } = await supabase
    .from("lessons")
    .select("id, slug, position")
    .eq("course_id", courseId);

  if (error) {
    throw new Error(`Could not read existing lessons: ${error.message}`);
  }

  return data ?? [];
}

function buildLessonRows(existingLessons, courseId) {
  const existingBySlug = new Map(
    existingLessons.map((lesson) => [
      lesson.slug,
      {
        id: lesson.id,
        position: lesson.position,
      },
    ])
  );

  return pythonLessons.map((lesson, index) => {
    const slug = `python-lesson-${lesson.id}`;
    const existing = existingBySlug.get(slug);

    const row = {
      course_id: courseId,
      slug,
      title: String(lesson.title).trim(),
      description: lesson.description ?? null,
      duration_minutes: durationToMinutes(lesson.duration),
      position: index + 1,
    };

    // Keep an existing lesson's ID. Omit ID for new lessons so that
    // PostgreSQL can generate it automatically.
    if (existing) {
      row.id = existing.id;
    }

    return row;
  });
}

async function seedLessons(lessonRows) {
  for (let start = 0; start < lessonRows.length; start += BATCH_SIZE) {
    const batch = lessonRows.slice(start, start + BATCH_SIZE);

    const { error } = await supabase
      .from("lessons")
      .upsert(batch, {
        onConflict: "course_id,slug",
      });

    if (error) {
      throw new Error(
        `Failed to seed lessons ${start + 1}-${start + batch.length}: ${error.message}`
      );
    }

    console.log(
      `Seeded lessons ${start + 1}-${start + batch.length} of ${lessonRows.length}`
    );
  }
}

async function verifySeed(courseId) {
  const { data, error } = await supabase
    .from("lessons")
    .select("id, slug, position")
    .eq("course_id", courseId);

  if (error) {
    throw new Error(`Could not verify seeded lessons: ${error.message}`);
  }

  const lessons = data ?? [];

  if (lessons.length !== EXPECTED_LESSONS) {
    throw new Error(
      `Verification failed: expected ${EXPECTED_LESSONS} lessons, found ${lessons.length}.`
    );
  }

  const positions = new Set(lessons.map((lesson) => lesson.position));
  const slugs = new Set(lessons.map((lesson) => lesson.slug));

  if (positions.size !== EXPECTED_LESSONS) {
    throw new Error("Verification failed: lesson positions are not unique.");
  }

  if (slugs.size !== EXPECTED_LESSONS) {
    throw new Error("Verification failed: lesson slugs are not unique.");
  }

  for (let index = 1; index <= EXPECTED_LESSONS; index += 1) {
    if (!slugs.has(`python-lesson-${index}`)) {
      throw new Error(`Verification failed: missing python-lesson-${index}.`);
    }
  }

  return lessons;
}

async function main() {
  validateCurriculum();

  console.log("Starting EVOLV Python curriculum seed...");
  console.log(`Curriculum lessons: ${pythonLessons.length}`);

  const course = await getPythonCourse();
  const courseId = course.id;

  console.log(`Course ready: ${course.title} (ID ${courseId})`);

  const existingLessons = await getExistingLessons(courseId);
  console.log(`Existing Python lessons: ${existingLessons.length}`);

  const lessonRows = buildLessonRows(existingLessons, courseId);

  await seedLessons(lessonRows);

  const verifiedLessons = await verifySeed(courseId);

  console.log("\nPython curriculum seeded successfully!");
  console.log(`Course: ${course.title}`);
  console.log(`Course ID: ${courseId}`);
  console.log(`Verified lessons: ${verifiedLessons.length}`);
  console.log("Existing lesson IDs were preserved where applicable.");
  console.log("No RLS policies were changed.");
}

main().catch((error) => {
  console.error("\nPython seed failed:", error.message);
  process.exitCode = 1;
});