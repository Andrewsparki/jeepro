import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const client = createClient(supabaseUrl, anonKey);

async function testUpdate() {
  const { data: auth } = await client.auth.signInWithPassword({
    email: 'benchmark_test@jeepro.local',
    password: 'BenchmarkPass123!',
  });

  const userId = auth.user.id;
  const today = '2026-10-14';

  // Mark the first mission as completed (30/30)
  const { data, error } = await client
    .from('daily_missions')
    .update({
      current_value: 30,
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('date', today)
    .eq('mission_type', 'study_duration')
    .select();

  console.log('Updated mission:', data, 'Error:', error);
}

testUpdate().catch(console.error);
