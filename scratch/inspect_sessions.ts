import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cdivkxaqwcziorbbhbno.supabase.co";
const supabaseAnonKey = "sb_publishable_d5_ZGybjGa0CQHuR5waqIw_EksgkLej";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  // Check study_sessions schema
  const { data: ss } = await supabase.from("study_sessions").select("*").limit(1);
  console.log("study_sessions columns:", ss && ss.length > 0 ? Object.keys(ss[0]) : "Empty table or check schema");

  // Check if RPC exists
  const { data, error } = await supabase.rpc("end_study_session_transaction", {
    p_user_id: "00000000-0000-0000-0000-000000000000",
    p_duration_seconds: 0,
    p_started_at: new Date().toISOString(),
    p_ended_at: new Date().toISOString(),
    p_chapter_id: null,
    p_topic_id: null,
    p_xp_earned: 0,
  });
  if (error) {
    console.log("RPC test result:", error.message, "|", error.code);
  } else {
    console.log("RPC exists and returned:", data);
  }
  
  // Check counts
  const { count: sessCount } = await supabase.from("study_sessions").select("*", { count: "exact", head: true });
  const { count: progressCount } = await supabase.from("user_topic_progress").select("*", { count: "exact", head: true });
  console.log("Total study_sessions:", sessCount);
  console.log("Total user_topic_progress:", progressCount);
}

inspect().catch(console.error);
