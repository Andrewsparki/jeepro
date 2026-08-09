import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cdivkxaqwcziorbbhbno.supabase.co";
const supabaseAnonKey = "sb_publishable_d5_ZGybjGa0CQHuR5waqIw_EksgkLej";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectSchema() {
  const { data: sub } = await supabase.from("subjects").select("*").limit(1);
  const { data: chap } = await supabase.from("chapters").select("*").limit(1);
  const { data: top } = await supabase.from("topics").select("*").limit(1);

  console.log("Subjects columns:", sub && sub.length > 0 ? Object.keys(sub[0]) : "Empty table");
  console.log("Chapters columns:", chap && chap.length > 0 ? Object.keys(chap[0]) : "Empty table");
  console.log("Topics columns:", top && top.length > 0 ? Object.keys(top[0]) : "Empty table");
}

inspectSchema().catch(console.error);
