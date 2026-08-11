const fs = require('fs');
const path = './features/syllabus/data/jee-main/physics.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

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

data.chapters.forEach(ch => {
  if (topicsToAdd[ch.slug] && ch.topics.length === 0) {
    ch.topics = topicsToAdd[ch.slug].map((name, index) => ({
      id: 'physics-' + ch.slug + '-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name: name,
      order: index + 1,
      completed: false
    }));
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Updated physics.json successfully');
