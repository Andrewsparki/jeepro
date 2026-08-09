import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Use service role key to bypass RLS for seeding
const supabaseUrl = "https://cdivkxaqwcziorbbhbno.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error("SUPABASE_KEY is not configured");
} const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log("🚀 Starting database seeding...");

  // 1. Fetch existing data to avoid duplicates
  console.log("Fetching existing reference data...");
  const { data: dbSubjects, error: errSub } = await supabase.from("subjects").select("id, slug");
  const { data: dbChapters, error: errChap } = await supabase.from("chapters").select("id, slug");
  const { data: dbTopics, error: errTop } = await supabase.from("topics").select("id, title, chapter_id");

  if (errSub || errChap || errTop) {
    console.error("❌ Error fetching from Supabase:", errSub || errChap || errTop);
    process.exit(1);
  }

  const subjectMap = new Map(dbSubjects.map((s: any) => [s.slug, s.id]));
  const chapterMap = new Map(dbChapters.map((c: any) => [c.slug, c.id]));
  const topicMap = new Map(dbTopics.map((t: any) => [`${t.chapter_id}::${t.title}`, t.id]));

  const jsonFiles = ["physics.json", "chemistry.json", "mathematics.json"];
  const basePath = path.join(process.cwd(), "features", "syllabus", "data", "jee-main");

  let subjectsInserted = 0;
  let chaptersInserted = 0;
  let topicsInserted = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(basePath, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      continue;
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const subjectSlug = jsonData.subject.toLowerCase();

    console.log(`\n--- Processing Subject: ${jsonData.subject} ---`);

    // Ensure Subject Exists
    let subjectId = subjectMap.get(subjectSlug);
    if (!subjectId) {
      console.log(`Inserting missing subject: ${subjectSlug}`);
      const { data, error } = await supabase
        .from("subjects")
        .insert([{ slug: subjectSlug, name: jsonData.subject }])
        .select("id")
        .single();

      if (error) {
        console.error(`❌ Failed to insert subject ${subjectSlug}:`, error.message);
        continue;
      }
      subjectId = data.id;
      subjectMap.set(subjectSlug, subjectId);
      subjectsInserted++;
    }

    // Process Chapters
    for (const chapter of jsonData.chapters) {
      const chapterSlug = chapter.slug;
      let chapterId = chapterMap.get(chapterSlug);

      if (!chapterId) {
        console.log(`  Inserting missing chapter: ${chapterSlug}`);
        const { data, error } = await supabase
          .from("chapters")
          .insert([{
            subject_id: subjectId,
            slug: chapterSlug,
            title: chapter.name,
            description: chapter.description || "",
            difficulty: chapter.difficulty || "Medium",
            estimated_study_time: `${chapter.estimatedHours || 4}h`,
            order_index: chapter.order || 0
          }])
          .select("id")
          .single();

        if (error) {
          console.error(`  ❌ Failed to insert chapter ${chapterSlug}:`, error.message);
          continue;
        }
        chapterId = data.id;
        chapterMap.set(chapterSlug, chapterId);
        chaptersInserted++;
      }

      // Process Topics
      if (!chapter.topics) continue;

      const missingTopics = [];
      for (const topic of chapter.topics) {
        const topicKey = `${chapterId}::${topic.name}`;
        if (!topicMap.has(topicKey)) {
          missingTopics.push({
            chapter_id: chapterId,
            title: topic.name,
            order_index: topic.order || 0
          });
        }
      }

      if (missingTopics.length > 0) {
        console.log(`    Inserting ${missingTopics.length} missing topics for chapter ${chapterSlug}...`);
        const { data, error } = await supabase
          .from("topics")
          .insert(missingTopics)
          .select("id, title, chapter_id");

        if (error) {
          console.error(`    ❌ Failed to insert topics for ${chapterSlug}:`, error.message);
        } else {
          topicsInserted += missingTopics.length;
          // Update map in case of multiple passes
          data.forEach((t: any) => topicMap.set(`${t.chapter_id}::${t.title}`, t.id));
        }
      }
    }
  }

  console.log("\n✅ Seeding Complete!");
  console.log(`Inserted -> Subjects: ${subjectsInserted}, Chapters: ${chaptersInserted}, Topics: ${topicsInserted}`);
}

seedDatabase().catch(console.error);
