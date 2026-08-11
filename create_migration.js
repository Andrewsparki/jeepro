const fs = require('fs');

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

let sql = '-- Add missing physics topics\n\n';

for (const [slug, topicNames] of Object.entries(topicsToAdd)) {
  sql += `-- ${slug}\n`;
  sql += `DO $$\n`;
  sql += `DECLARE\n`;
  sql += `  v_chapter_id uuid;\n`;
  sql += `BEGIN\n`;
  sql += `  SELECT id INTO v_chapter_id FROM chapters WHERE slug = '${slug}';\n`;
  sql += `  IF v_chapter_id IS NOT NULL THEN\n`;
  
  topicNames.forEach((name, idx) => {
    sql += `    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, '${name}', ${idx + 1});\n`;
  });
  
  sql += `  END IF;\n`;
  sql += `END $$;\n\n`;
}

fs.writeFileSync('supabase/migrations/20260810141900_add_missing_physics_topics.sql', sql);
console.log('Created migration');
