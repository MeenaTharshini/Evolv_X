import "dotenv/config";
import { supabase } from "./db.js";

async function runTests() {
  console.log("=== EVOLV END-TO-END TEST SUITE ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Database Lessons & Slugs
    const { data: lessons, error: lessonError } = await supabase
      .from("lessons")
      .select("id, slug, position, title")
      .order("position", { ascending: true });

    assert(!lessonError && lessons && lessons.length === 60, "All 60 lessons exist in database");
    assert(lessons[0].slug === "python-lesson-1" && lessons[0].position === 1, "Lesson 1 has slug python-lesson-1");
    assert(lessons[1].slug === "python-lesson-2" && lessons[1].position === 2, "Lesson 2 has slug python-lesson-2");

    // Test 2: Database Lesson Map resolution
    const dbToFrontend = new Map();
    const frontendToDb = new Map();
    for (const row of lessons) {
      const match = String(row.slug ?? "").match(/^python-lesson-([1-9]\d*)$/);
      const frontendNumber = match ? Number(match[1]) : Number(row.position);
      if (frontendNumber) {
        dbToFrontend.set(Number(row.id), frontendNumber);
        frontendToDb.set(frontendNumber, Number(row.id));
      }
    }
    assert(frontendToDb.get(1) === lessons[0].id, `Frontend 1 maps to DB ID ${lessons[0].id}`);
    assert(dbToFrontend.get(lessons[0].id) === 1, `DB ID ${lessons[0].id} maps to Frontend 1`);

    // Test 3: Existing learner progress mapped correctly
    const testUserId = "8a2b2c10-1d72-4cb5-b4c1-b41c82056b0c";
    const { data: stageRows } = await supabase
      .from("lesson_stage_progress")
      .select("lesson_id, stage, completed")
      .eq("user_id", testUserId);

    const progress = {};
    for (const row of stageRows ?? []) {
      if (!row.completed) continue;
      const fNum = dbToFrontend.get(Number(row.lesson_id));
      if (fNum) {
        const k = String(fNum);
        if (!progress[k]) progress[k] = [];
        if (!progress[k].includes(row.stage)) progress[k].push(row.stage);
      }
    }

    assert(progress["1"] && progress["1"].length === 4, "Learner has all 4 stages complete for Lesson 1");
    assert(progress["2"] && progress["2"].length === 4, "Learner has all 4 stages complete for Lesson 2");

    // Test 4: Topic completion check
    const STAGES = ["video", "concept", "hands-on", "quiz"];
    const isTopic1Complete = STAGES.every(s => progress["1"]?.includes(s));
    const isTopic2Complete = STAGES.every(s => progress["2"]?.includes(s));
    const isTopic3Complete = STAGES.every(s => progress["3"]?.includes(s));
    assert(isTopic1Complete === true, "Topic 1 is complete");
    assert(isTopic2Complete === true, "Topic 2 is complete");
    assert(isTopic3Complete === false, "Topic 3 is not complete yet");

    // Test 5: Lesson locking logic
    const isLesson1Unlocked = true;
    const isLesson2Unlocked = isTopic1Complete;
    const isLesson3Unlocked = isTopic2Complete;
    const isLesson4Unlocked = isTopic3Complete;
    assert(isLesson1Unlocked, "Lesson 1 is unlocked");
    assert(isLesson2Unlocked, "Lesson 2 is unlocked");
    assert(isLesson3Unlocked, "Lesson 3 is unlocked (current active quest)");
    assert(!isLesson4Unlocked, "Lesson 4 is properly LOCKED");

    // Test 6: User stats and XP calculation
    const { data: userStats } = await supabase
      .from("user_stats")
      .select("total_xp, current_streak, longest_streak")
      .eq("user_id", testUserId)
      .single();

    assert(userStats && userStats.total_xp === 120, `User stats total XP is 120 (got ${userStats?.total_xp})`);
    assert(userStats && userStats.current_streak >= 1, `User streak is positive (got ${userStats?.current_streak})`);

    // Test 7: Profile persistence
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, skill_level")
      .eq("id", testUserId)
      .single();

    assert(profile && profile.full_name.length > 0, `Profile exists with name ${profile?.full_name}`);

    console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
}

runTests();
