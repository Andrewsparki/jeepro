import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cdivkxaqwcziorbbhbno.supabase.co";
const supabaseKey = "sb_publishable_d5_ZGybjGa0CQHuR5waqIw_EksgkLej";
const supabase = createClient(supabaseUrl, supabaseKey);

async function audit() {
  // 1. Check user_topic_progress table exists
  const { data: utp, error: utpErr } = await supabase.from("user_topic_progress").select("*").limit(1);
  console.log("user_topic_progress:", utpErr ? `ERROR: ${utpErr.message} (${utpErr.code})` : `OK (${utp?.length} rows sample)`);

  // 2. Check mapping cache works - topics count
  const { data: topics, error: topErr } = await supabase.from("topics").select("id").limit(5);
  console.log("topics table:", topErr ? `ERROR: ${topErr.message}` : `OK (sample: ${topics?.length})`);

  // 3. Check chapters
  const { data: chapters } = await supabase.from("chapters").select("id,slug").limit(3);
  console.log("chapters sample:", chapters?.map(c => c.slug));

  // 4. Check subjects
  const { data: subjects } = await supabase.from("subjects").select("id,slug");
  console.log("subjects:", subjects?.map(s => s.slug));

  // 5. Check daily_missions
  const { data: dm, error: dmErr } = await supabase.from("daily_missions").select("*").limit(1);
  console.log("daily_missions:", dmErr ? `ERROR: ${dmErr.message}` : `OK (${dm?.length} rows sample)`);

  // 6. Check study_sessions columns
  const { data: ss, error: ssErr } = await supabase.from("study_sessions").select("*").limit(1);
  console.log("study_sessions:", ssErr ? `ERROR: ${ssErr.message}` : `OK (${ss?.length} rows, cols: ${ss?.length ? Object.keys(ss[0]) : 'empty'})`);
}

audit().catch(console.error);
