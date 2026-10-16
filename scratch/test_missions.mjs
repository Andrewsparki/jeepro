import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const client = createClient(supabaseUrl, anonKey);

async function test() {
  const { data: auth, error: authErr } = await client.auth.signInWithPassword({
    email: 'benchmark_test@jeepro.local',
    password: 'BenchmarkPass123!',
  });

  if (authErr) {
    console.error('Auth error:', authErr);
    return;
  }

  const userId = auth.user.id;
  console.log('Logged in user ID:', userId);

  // Check daily missions
  const today = new Date().toISOString().split('T')[0];
  console.log('Today date:', today);

  const { data: missions, error: missionsErr } = await client
    .from('daily_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today);

  console.log('Fetched missions:', missions, 'Error:', missionsErr);

  // Try inserting/upserting daily missions
  const testMissions = [
    {
      user_id: userId,
      date: today,
      mission_type: 'study_duration',
      title: 'Study for 30 minutes',
      target_value: 30,
      reward_xp: 25,
    },
    {
      user_id: userId,
      date: today,
      mission_type: 'focus_sessions',
      title: 'Complete 1 focus session',
      target_value: 1,
      reward_xp: 25,
    },
    {
      user_id: userId,
      date: today,
      mission_type: 'chapter_completion',
      title: 'Complete 1 chapter',
      target_value: 1,
      reward_xp: 25,
    },
  ];

  const { data: upsertData, error: upsertErr } = await client
    .from('daily_missions')
    .upsert(testMissions, { onConflict: 'user_id,date,mission_type' })
    .select();

  console.log('Upsert result:', upsertData, 'Error:', upsertErr);
}

test().catch(console.error);
