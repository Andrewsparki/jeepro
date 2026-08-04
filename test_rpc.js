const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('study_sessions').insert({
    user_id: '5e3704fc-0af0-4cd1-9b79-3047b9ebeca6',
    topic_id: 'electric-charges',
    chapter_id: 'electrostatics',
    duration_seconds: 10,
    started_at: new Date().toISOString(),
    ended_at: new Date().toISOString()
  });
  console.log('study_sessions insert Error:', error);
}

test();
