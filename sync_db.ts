import { createClient } from '@supabase/supabase-js';

async function sync() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const topicsToAdd = {
    'properties-of-solids-liquids': ['Elasticity', 'Fluid Mechanics', 'Surface Tension', 'Viscosity', 'Thermal Expansion'],
    'kinetic-theory': ['Equation of State', 'Kinetic Theory of Gases', 'Degrees of Freedom and Law of Equipartition of Energy', 'Specific Heat Capacity of Gases'],
    'oscillations-waves': ['Simple Harmonic Motion', 'Energy in SHM', 'Wave Motion', 'Superposition of Waves', 'Doppler Effect'],
    'magnetic-effects-of-current-magnetism': ['Biot-Savart Law', 'Ampere Law', 'Force on Moving Charge', 'Magnetic Dipole', 'Earth Magnetism'],
    'emi-ac': ['Faraday Law of Induction', 'Lenz Law', 'Self and Mutual Inductance', 'Alternating Current', 'LCR Circuits'],
    'dual-nature': ['Photoelectric Effect', 'Matter Waves', 'Davisson-Germer Experiment'],
    'atoms': ['Rutherford Model', 'Bohr Model', 'Hydrogen Spectrum', 'X-rays'],
    'nuclei': ['Nuclear Structure', 'Radioactivity', 'Mass Defect and Binding Energy', 'Nuclear Fission and Fusion']
  };

  // Get chapter UUIDs
  const { data: chapters, error: chapError } = await supabase.from('chapters').select('id, slug');
  if (chapError) {
    console.error("Chapters error:", chapError);
    return;
  }

  for (const [slug, topicNames] of Object.entries(topicsToAdd)) {
    const chapter = chapters.find(c => c.slug === slug);
    if (!chapter) {
      console.log('Chapter not found:', slug);
      continue;
    }
    
    // Check if topics already exist
    const { data: existingTopics } = await supabase.from('topics').select('id').eq('chapter_id', chapter.id);
    if (existingTopics && existingTopics.length > 0) continue;

    console.log('Inserting topics for', slug);
    const inserts = topicNames.map((name, idx) => ({
      chapter_id: chapter.id,
      title: name,
      order_index: idx + 1
    }));
    
    const { error } = await supabase.from('topics').insert(inserts);
    if (error) console.error('Error inserting for', slug, error);
  }
  console.log("Done syncing DB.");
}
sync();
