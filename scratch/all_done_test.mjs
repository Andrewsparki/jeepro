import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const client = createClient(supabaseUrl, anonKey);

async function testAllDone() {
  const { data: auth } = await client.auth.signInWithPassword({
    email: 'benchmark_test@jeepro.local',
    password: 'BenchmarkPass123!',
  });

  const userId = auth.user.id;
  const today = '2026-10-14';

  await client
    .from('daily_missions')
    .update({
      current_value: 1,
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('date', today);

  console.log('Marked all as completed');
}

testAllDone().catch(console.error);
