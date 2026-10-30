import { supabase } from "../lib/supabaseClient";
import { pythonLessons } from "../data/pythonLessons";

export async function seedPythonCourse() {
  // 1. Create the Python course or retrieve the existing one.
  const { data: existingCourse, error: lookupError } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", "python")
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  let courseId = existingCourse?.id;

  if (!courseId) {
    const { data: newCourse, error: createError } = await supabase
      .from("courses")
      .insert({
        slug: "python",
        title: "Python for Everyone",
        description:
          "Learn Python through interactive lessons, coding activities, and quizzes.",
        difficulty: "Beginner",
        total_lessons: pythonLessons.length,
        is_published: true,
      })
      .select("id")
      .single();

    if (createError) {
      throw createError;
    }

    courseId = newCourse.id;
  } else {
    const { error: updateError } = await supabase
      .from("courses")
      .update({
        total_lessons: pythonLessons.length,
      })
      .eq("id", courseId);

    if (updateError) {
      throw updateError;
    }
  }

  // 2. Convert the existing frontend curriculum into database records.
  const rows = pythonLessons.map((lesson, index) => {
    const duration = Number.parseInt(lesson.duration, 10);

    return {
      course_id: courseId,
      slug: `python-lesson-${lesson.id}`,
      title: lesson.title,
      description: lesson.description,
      duration_minutes: Number.isFinite(duration) ? duration : 8,
      position: index + 1,
    };
  });

  // 3. Insert lessons in batches.
  // The composite constraints are respected because each slug and
  // position is unique within this course.
  for (let start = 0; start < rows.length; start += 20) {
    const batch = rows.slice(start, start + 20);

    const { error } = await supabase
      .from("lessons")
      .upsert(batch, {
        onConflict: "course_id,slug",
      });

    if (error) {
      throw error;
    }
  }

  // 4. Verify the saved lesson count.
  const { count, error: countError } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  if (countError) {
    throw countError;
  }

  if (count !== pythonLessons.length) {
    throw new Error(
      `Expected ${pythonLessons.length} Python lessons, but found ${count}.`
    );
  }

  return {
    courseId,
    lessonCount: count,
  };
}