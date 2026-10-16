import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function audit() {
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, full_name, email');
  console.log('Profiles count:', profiles?.length, 'Error:', pErr);

  for (const p of profiles || []) {
    console.log(`\n=== User: ${p.email} (${p.id}) ===`);
    
    // Study sessions
    const { data: sessions } = await supabase.from('study_sessions').select('*').eq('user_id', p.id);
    const totalSecs = (sessions || []).reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
    const totalSessionXP = (sessions || []).reduce((acc, s) => acc + (s.xp_earned || 0), 0);
    console.log(`Sessions count: ${sessions?.length}, Total seconds: ${totalSecs} (${(totalSecs/60).toFixed(1)} mins), Sum xp_earned: ${totalSessionXP}`);
    if (sessions && sessions.length > 0) {
      console.log('Sample session durations (seconds):', sessions.slice(0, 10).map(s => s.duration_seconds));
    }

    // Daily missions
    const { data: missions } = await supabase.from('daily_missions').select('*').eq('user_id', p.id);
    const completedMissions = (missions || []).filter(m => m.completed);
    const missionXP = completedMissions.reduce((acc, m) => acc + (m.reward_xp || 0), 0);
    console.log(`Missions count: ${missions?.length}, Completed: ${completedMissions.length}, Mission XP: ${missionXP}`);

    // Achievements
    const { data: userAch } = await supabase.from('user_achievements').select('*').eq('user_id', p.id);
    console.log(`User achievements unlocked in DB: ${userAch?.length}`);

    // Progress
    const { data: prog } = await supabase.from('user_topic_progress').select('*').eq('user_id', p.id);
    console.log(`Topic progress records: ${prog?.length}, Mastered: ${(prog || []).filter(t => t.status === 'Mastered').length}`);

    // Check if there are xp_history records
    const { data: xpHist } = await supabase.from('xp_history').select('*').eq('user_id', p.id);
    console.log(`xp_history records: ${xpHist?.length}`);
  }
}

audit().catch(console.error);
