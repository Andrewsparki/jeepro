const fs = require('fs');
const path = require('path');

function escapeSqlString(str) {
  if (!str) return 'NULL';
  return "'" + str.replace(/'/g, "''") + "'";
}

function generateSeeder() {
  const jsonFiles = ["physics.json", "chemistry.json", "mathematics.json"];
  const basePath = path.join(process.cwd(), "features", "syllabus", "data", "jee-main");
  
  let sql = `-- Migration: Seed missing syllabus data from JSON
-- Auto-generated to synchronize database with frontend JSON

BEGIN;

`;

  for (const file of jsonFiles) {
    const filePath = path.join(basePath, file);
    if (!fs.existsSync(filePath)) continue;

    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const subjectSlug = jsonData.subject.toLowerCase();
    const subjectName = jsonData.subject;

    sql += `-- ==========================================
-- SUBJECT: ${subjectName}
-- ==========================================

INSERT INTO subjects (slug, name)
VALUES (${escapeSqlString(subjectSlug)}, ${escapeSqlString(subjectName)})
ON CONFLICT (slug) DO NOTHING;

`;

    for (const chapter of jsonData.chapters) {
      const chapSlug = chapter.slug;
      const chapTitle = chapter.name;
      const chapDesc = chapter.description || '';
      const chapOrder = chapter.order || 0;
      
      sql += `INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  ${escapeSqlString(chapSlug)}, 
  ${escapeSqlString(chapTitle)}, 
  ${escapeSqlString(chapDesc)}, 
  ${chapOrder}
FROM subjects WHERE slug = ${escapeSqlString(subjectSlug)}
ON CONFLICT (slug) DO NOTHING;

`;

      if (chapter.topics && chapter.topics.length > 0) {
        for (const topic of chapter.topics) {
          const topTitle = topic.name;
          const topOrder = topic.order || 0;

          // Instead of ON CONFLICT, use WHERE NOT EXISTS to be safe since we don't know the exact unique constraints on topics
          sql += `INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  ${escapeSqlString(topTitle)}, 
  ${topOrder}
FROM chapters WHERE slug = ${escapeSqlString(chapSlug)}
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = ${escapeSqlString(topTitle)} 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = ${escapeSqlString(chapSlug)})
);

`;
        }
      }
    }
  }

  sql += `COMMIT;
`;

  const outPath = path.join(process.cwd(), 'supabase', 'migrations', '004_seed_syllabus.sql');
  fs.writeFileSync(outPath, sql);
  console.log(`Generated migration at ${outPath}`);
}

generateSeeder();
