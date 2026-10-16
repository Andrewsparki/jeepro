import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key exists:', !!anonKey);
console.log('Service Key exists:', !!serviceKey);

const supabase = createClient(supabaseUrl, serviceKey || anonKey);

async function check() {
  const { data: users, error: usersErr } = await supabase.from('profiles').select('id, email, is_admin').limit(5);
  console.log('Profiles:', users, 'Error:', usersErr);

  // Try creating or getting a test benchmark user
  const testEmail = 'benchmark_test@jeepro.local';
  const testPass = 'BenchmarkPass123!';

  const clientSupabase = createClient(supabaseUrl, anonKey);
  let { data: authData, error: authErr } = await clientSupabase.auth.signInWithPassword({
    email: testEmail,
    password: testPass,
  });

  if (authErr) {
    console.log('SignIn failed, attempting signUp:', authErr.message);
    const { data: signUpData, error: signUpErr } = await clientSupabase.auth.signUp({
      email: testEmail,
      password: testPass,
      options: {
        data: { full_name: 'Benchmark Tester' },
      },
    });
    console.log('SignUp result:', signUpData?.user?.id, 'Error:', signUpErr);
    authData = signUpData;
  }

  if (authData?.session) {
    console.log('Successfully obtained test user session!');
    console.log('Access token:', authData.session.access_token.slice(0, 20) + '...');
  }
}

check().catch(console.error);
