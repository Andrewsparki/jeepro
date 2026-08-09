import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Supabase credentials
const supabaseUrl = "https://cdivkxaqwcziorbbhbno.supabase.co";
const supabaseAnonKey = "sb_publishable_d5_ZGybjGa0CQHuR5waqIw_EksgkLej";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySlugs() {
  console.log("=== Fetching Database Reference Tables ===");
  const { data: dbSubjects, error: errSub } = await supabase.from("subjects").select("id, slug, name");
  const { data: dbChapters, error: errChap } = await supabase.from("chapters").select("id, slug, title, subject_id");
  const { data: dbTopics, error: errTop } = await supabase.from("topics").select("id, title, chapter_id");

  if (errSub || errChap || errTop) {
    console.error("Error fetching from Supabase:", errSub || errChap || errTop);
    return;
  }

  console.log(`DB Counts -> Subjects: ${dbSubjects.length}, Chapters: ${dbChapters.length}, Topics: ${dbTopics.length}`);

  const dbSubjectMap = new Map();
  dbSubjects.forEach((s: any) => dbSubjectMap.set(s.slug, s));
  
  const dbChapterMap = new Map();
  dbChapters.forEach((c: any) => dbChapterMap.set(c.slug, c));

  const dbTopicMap = new Map();
  dbTopics.forEach((t: any) => dbTopicMap.set(`${t.chapter_id}::${t.title}`, t));

  const jsonFiles = ["physics.json", "chemistry.json", "mathematics.json"];
  const basePath = path.join(process.cwd(), "features", "syllabus", "data", "jee-main");

  const mismatches: any[] = [];
  const successfulMatches = { subjects: 0, chapters: 0, topics: 0 };

  for (const file of jsonFiles) {
    const filePath = path.join(basePath, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const subjectSlug = jsonData.subject.toLowerCase();
    
    console.log(`\n--- Validating Subject: ${subjectSlug} (${file}) ---`);

    const dbSub = dbSubjectMap.get(subjectSlug);
    if (!dbSub) {
      mismatches.push({ type: "SUBJECT", jsonSlug: subjectSlug, issue: "Not found in DB" });
    } else {
      successfulMatches.subjects++;
    }

    for (const chapter of jsonData.chapters) {
      const jsonChapterSlug = chapter.slug;
      const dbChap = dbChapterMap.get(jsonChapterSlug);
      
      let mappedDbChapId = null;

      if (!dbChap) {
        mismatches.push({ 
          type: "CHAPTER", 
          subject: subjectSlug,
          jsonSlug: jsonChapterSlug, 
          jsonId: chapter.id,
          jsonName: chapter.name,
          issue: "Not found in DB" 
        });
        
        const dbChapByName = dbChapters.find((c: any) => c.title === chapter.name);
        if (dbChapByName) {
           mismatches.push({
             type: "CHAPTER_SUGGESTION",
             subject: subjectSlug,
             jsonSlug: jsonChapterSlug,
             dbSlug: dbChapByName.slug,
             issue: "Found matching name but different slug"
           });
        }
      } else {
        successfulMatches.chapters++;
        mappedDbChapId = dbChap.id;
      }

      for (const topic of chapter.topics) {
        if (mappedDbChapId) {
          const dbTopic = dbTopicMap.get(`${mappedDbChapId}::${topic.name}`);
          if (!dbTopic) {
            mismatches.push({
              type: "TOPIC",
              chapterSlug: jsonChapterSlug,
              jsonId: topic.id,
              jsonName: topic.name,
              issue: "Not found in DB by exact title match within chapter"
            });
            const closeTopics = dbTopics.filter((t: any) => t.chapter_id === mappedDbChapId);
            if (closeTopics.length > 0) {
              const bestMatch = closeTopics.find((t: any) => t.title.toLowerCase() === topic.name.toLowerCase());
              if (bestMatch) {
                mismatches.push({
                  type: "TOPIC_SUGGESTION",
                  chapterSlug: jsonChapterSlug,
                  jsonName: topic.name,
                  dbName: bestMatch.title,
                  issue: "Found case-insensitive match but not exact match"
                });
              } else {
                const similar = closeTopics.filter((t: any) => t.title.includes(topic.name) || topic.name.includes(t.title));
                if (similar.length > 0) {
                  mismatches.push({
                    type: "TOPIC_SUGGESTION",
                    chapterSlug: jsonChapterSlug,
                    jsonName: topic.name,
                    dbName: similar[0].title,
                    issue: "Found similar name in chapter"
                  });
                }
              }
            }
          } else {
            successfulMatches.topics++;
          }
        } else {
           mismatches.push({
              type: "TOPIC_ORPHAN",
              chapterSlug: jsonChapterSlug,
              jsonId: topic.id,
              jsonName: topic.name,
              issue: "Parent chapter not found, cannot map topic"
           });
        }
      }
    }
  }

  console.log("\n=== VALIDATION SUMMARY ===");
  console.log(`Successful Matches: Subjects: ${successfulMatches.subjects}, Chapters: ${successfulMatches.chapters}, Topics: ${successfulMatches.topics}`);
  console.log(`Total Mismatches Found: ${mismatches.length}`);
  
  if (mismatches.length > 0) {
    console.log("\n=== DETAILED MISMATCH REPORT ===");
    console.table(mismatches);
    fs.writeFileSync("mismatch_report.json", JSON.stringify(mismatches, null, 2));
    console.log("Detailed report saved to mismatch_report.json");
  } else {
    console.log("✅ All JSON slugs and topics match the database perfectly!");
  }
}

verifySlugs().catch(console.error);
