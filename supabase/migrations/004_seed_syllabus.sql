-- Migration: Seed missing syllabus data from JSON
-- Auto-generated to synchronize database with frontend JSON

BEGIN;

-- ==========================================
-- SUBJECT: Physics
-- ==========================================

INSERT INTO subjects (slug, name)
VALUES ('physics', 'Physics')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'physics-measurement', 
  'Physics & Measurement', 
  'The foundation of physics covering units, dimensions, and measurement techniques.', 
  1
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Units and Measurements', 
  1
FROM chapters WHERE slug = 'physics-measurement'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Units and Measurements' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'physics-measurement')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Dimensional Analysis', 
  2
FROM chapters WHERE slug = 'physics-measurement'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Dimensional Analysis' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'physics-measurement')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Errors in Measurement', 
  3
FROM chapters WHERE slug = 'physics-measurement'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Errors in Measurement' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'physics-measurement')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Significant Figures', 
  4
FROM chapters WHERE slug = 'physics-measurement'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Significant Figures' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'physics-measurement')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'kinematics', 
  'Kinematics', 
  'The study of motion without considering its causes. Fundamental for all of mechanics.', 
  2
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Motion in a Straight Line', 
  1
FROM chapters WHERE slug = 'kinematics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Motion in a Straight Line' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'kinematics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Motion in a Plane', 
  2
FROM chapters WHERE slug = 'kinematics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Motion in a Plane' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'kinematics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Projectile Motion', 
  3
FROM chapters WHERE slug = 'kinematics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Projectile Motion' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'kinematics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Relative Velocity', 
  4
FROM chapters WHERE slug = 'kinematics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Relative Velocity' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'kinematics')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'laws-of-motion', 
  'Laws of Motion', 
  'The foundation of classical mechanics describing the relationship between a body and the forces acting upon it.', 
  3
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Newton''s Laws', 
  1
FROM chapters WHERE slug = 'laws-of-motion'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Newton''s Laws' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'laws-of-motion')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Conservation of Momentum', 
  2
FROM chapters WHERE slug = 'laws-of-motion'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Conservation of Momentum' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'laws-of-motion')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Friction', 
  3
FROM chapters WHERE slug = 'laws-of-motion'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Friction' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'laws-of-motion')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Circular Motion Dynamics', 
  4
FROM chapters WHERE slug = 'laws-of-motion'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Circular Motion Dynamics' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'laws-of-motion')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'work-energy-power', 
  'Work Energy Power', 
  'Core concepts of energy conservation, work done by forces, and power.', 
  4
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Work-Energy Theorem', 
  1
FROM chapters WHERE slug = 'work-energy-power'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Work-Energy Theorem' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'work-energy-power')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Conservative Forces', 
  2
FROM chapters WHERE slug = 'work-energy-power'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Conservative Forces' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'work-energy-power')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Potential Energy', 
  3
FROM chapters WHERE slug = 'work-energy-power'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Potential Energy' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'work-energy-power')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Collisions', 
  4
FROM chapters WHERE slug = 'work-energy-power'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Collisions' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'work-energy-power')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'rotational-motion', 
  'Rotational Motion', 
  'Complex mechanics involving rigid bodies rotating about a fixed or moving axis.', 
  5
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Center of Mass', 
  1
FROM chapters WHERE slug = 'rotational-motion'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Center of Mass' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'rotational-motion')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Torque and Angular Momentum', 
  2
FROM chapters WHERE slug = 'rotational-motion'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Torque and Angular Momentum' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'rotational-motion')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Moment of Inertia', 
  3
FROM chapters WHERE slug = 'rotational-motion'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Moment of Inertia' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'rotational-motion')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Rolling Motion', 
  4
FROM chapters WHERE slug = 'rotational-motion'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Rolling Motion' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'rotational-motion')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'gravitation', 
  'Gravitation', 
  'The study of the fundamental force of gravity governing planetary motion.', 
  6
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Universal Law of Gravitation', 
  1
FROM chapters WHERE slug = 'gravitation'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Universal Law of Gravitation' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'gravitation')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Acceleration Due to Gravity', 
  2
FROM chapters WHERE slug = 'gravitation'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Acceleration Due to Gravity' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'gravitation')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Kepler''s Laws', 
  3
FROM chapters WHERE slug = 'gravitation'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Kepler''s Laws' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'gravitation')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Escape Velocity and Satellites', 
  4
FROM chapters WHERE slug = 'gravitation'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Escape Velocity and Satellites' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'gravitation')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'properties-of-solids-liquids', 
  'Properties of Solids & Liquids', 
  NULL, 
  7
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'thermodynamics', 
  'Thermodynamics', 
  'The study of heat, work, and temperature, and their relation to energy and radiation.', 
  8
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Zeroth and First Law of Thermodynamics', 
  1
FROM chapters WHERE slug = 'thermodynamics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Zeroth and First Law of Thermodynamics' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'thermodynamics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Specific Heat Capacity', 
  2
FROM chapters WHERE slug = 'thermodynamics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Specific Heat Capacity' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'thermodynamics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Thermodynamic Processes', 
  3
FROM chapters WHERE slug = 'thermodynamics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Thermodynamic Processes' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'thermodynamics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Carnot Engine and Second Law', 
  4
FROM chapters WHERE slug = 'thermodynamics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Carnot Engine and Second Law' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'thermodynamics')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'kinetic-theory', 
  'Kinetic Theory', 
  NULL, 
  9
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'oscillations-waves', 
  'Oscillations & Waves', 
  NULL, 
  10
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'electrostatics', 
  'Electrostatics', 
  'The study of stationary electric charges, fields, and potentials.', 
  11
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Coulomb''s Law', 
  1
FROM chapters WHERE slug = 'electrostatics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Coulomb''s Law' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'electrostatics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Electric Field and Gauss''s Law', 
  2
FROM chapters WHERE slug = 'electrostatics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Electric Field and Gauss''s Law' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'electrostatics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Electric Potential', 
  3
FROM chapters WHERE slug = 'electrostatics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Electric Potential' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'electrostatics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Capacitors and Capacitance', 
  4
FROM chapters WHERE slug = 'electrostatics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Capacitors and Capacitance' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'electrostatics')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'current-electricity', 
  'Current Electricity', 
  'The flow of electric charge and the analysis of electrical circuits.', 
  12
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Ohm''s Law and Resistance', 
  1
FROM chapters WHERE slug = 'current-electricity'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Ohm''s Law and Resistance' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'current-electricity')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Kirchhoff''s Laws', 
  2
FROM chapters WHERE slug = 'current-electricity'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Kirchhoff''s Laws' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'current-electricity')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Wheatstone Bridge', 
  3
FROM chapters WHERE slug = 'current-electricity'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Wheatstone Bridge' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'current-electricity')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Potentiometer and Heating Effect', 
  4
FROM chapters WHERE slug = 'current-electricity'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Potentiometer and Heating Effect' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'current-electricity')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'magnetic-effects-of-current-magnetism', 
  'Magnetic Effects of Current & Magnetism', 
  NULL, 
  13
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'emi-ac', 
  'EMI & AC', 
  NULL, 
  14
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'electromagnetic-waves', 
  'Electromagnetic Waves', 
  'The propagation of oscillating electric and magnetic fields.', 
  15
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Displacement Current', 
  1
FROM chapters WHERE slug = 'electromagnetic-waves'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Displacement Current' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'electromagnetic-waves')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'EM Wave Properties', 
  2
FROM chapters WHERE slug = 'electromagnetic-waves'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'EM Wave Properties' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'electromagnetic-waves')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Electromagnetic Spectrum', 
  3
FROM chapters WHERE slug = 'electromagnetic-waves'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Electromagnetic Spectrum' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'electromagnetic-waves')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'optics', 
  'Optics', 
  'The behavior and properties of light, including geometric and wave optics.', 
  16
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Reflection and Refraction', 
  1
FROM chapters WHERE slug = 'optics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Reflection and Refraction' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'optics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Lenses and Mirrors', 
  2
FROM chapters WHERE slug = 'optics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Lenses and Mirrors' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'optics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Optical Instruments', 
  3
FROM chapters WHERE slug = 'optics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Optical Instruments' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'optics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Wave Optics (Young''s Double Slit Experiment)', 
  4
FROM chapters WHERE slug = 'optics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Wave Optics (Young''s Double Slit Experiment)' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'optics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Diffraction and Polarization', 
  5
FROM chapters WHERE slug = 'optics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Diffraction and Polarization' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'optics')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'dual-nature', 
  'Dual Nature', 
  NULL, 
  17
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'atoms', 
  'Atoms', 
  NULL, 
  18
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'nuclei', 
  'Nuclei', 
  NULL, 
  19
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'electronic-devices', 
  'Electronic Devices', 
  'The physics of semiconductors and basic electronic components.', 
  20
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Semiconductors (p-type, n-type)', 
  1
FROM chapters WHERE slug = 'electronic-devices'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Semiconductors (p-type, n-type)' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'electronic-devices')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'p-n Junction Diode', 
  2
FROM chapters WHERE slug = 'electronic-devices'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'p-n Junction Diode' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'electronic-devices')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Rectifiers', 
  3
FROM chapters WHERE slug = 'electronic-devices'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Rectifiers' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'electronic-devices')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Logic Gates', 
  4
FROM chapters WHERE slug = 'electronic-devices'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Logic Gates' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'electronic-devices')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'experimental-skills', 
  'Experimental Skills', 
  'Practical experimental skills required for physics laboratory work.', 
  21
FROM subjects WHERE slug = 'physics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Vernier Calipers', 
  1
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Vernier Calipers' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Screw Gauge', 
  2
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Screw Gauge' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Simple Pendulum Energy-loss Graph', 
  3
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Simple Pendulum Energy-loss Graph' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Metre Scale Moments', 
  4
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Metre Scale Moments' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Young''s Modulus', 
  5
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Young''s Modulus' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Surface Tension by Capillary Rise', 
  6
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Surface Tension by Capillary Rise' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Viscosity', 
  7
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Viscosity' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Resonance Tube', 
  8
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Resonance Tube' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Specific Heat by Mixtures', 
  9
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Specific Heat by Mixtures' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Metre Bridge Resistivity', 
  10
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Metre Bridge Resistivity' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Ohm''s Law', 
  11
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Ohm''s Law' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Galvanometer Figure of Merit', 
  12
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Galvanometer Figure of Merit' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Focal Lengths', 
  13
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Focal Lengths' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Prism Deviation', 
  14
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Prism Deviation' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Refractive Index', 
  15
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Refractive Index' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Diode/Zener Characteristics', 
  16
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Diode/Zener Characteristics' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Component Identification', 
  17
FROM chapters WHERE slug = 'experimental-skills'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Component Identification' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'experimental-skills')
);

-- ==========================================
-- SUBJECT: Chemistry
-- ==========================================

INSERT INTO subjects (slug, name)
VALUES ('chemistry', 'Chemistry')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'some-basic-concepts-in-chemistry', 
  'Some Basic Concepts in Chemistry', 
  'Fundamental concepts of chemical calculations.', 
  1
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Mole concept', 
  1
FROM chapters WHERE slug = 'some-basic-concepts-in-chemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Mole concept' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'some-basic-concepts-in-chemistry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Stoichiometry', 
  2
FROM chapters WHERE slug = 'some-basic-concepts-in-chemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Stoichiometry' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'some-basic-concepts-in-chemistry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Concentration terms', 
  3
FROM chapters WHERE slug = 'some-basic-concepts-in-chemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Concentration terms' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'some-basic-concepts-in-chemistry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Empirical and molecular formula', 
  4
FROM chapters WHERE slug = 'some-basic-concepts-in-chemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Empirical and molecular formula' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'some-basic-concepts-in-chemistry')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'atomic-structure', 
  'Atomic Structure', 
  'The fundamental building blocks of matter and quantum mechanical model.', 
  2
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Bohr model', 
  1
FROM chapters WHERE slug = 'atomic-structure'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Bohr model' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'atomic-structure')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Quantum mechanical model', 
  2
FROM chapters WHERE slug = 'atomic-structure'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Quantum mechanical model' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'atomic-structure')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Quantum numbers', 
  3
FROM chapters WHERE slug = 'atomic-structure'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Quantum numbers' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'atomic-structure')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Electronic configuration', 
  4
FROM chapters WHERE slug = 'atomic-structure'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Electronic configuration' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'atomic-structure')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'chemical-bonding-and-molecular-structure', 
  'Chemical Bonding and Molecular Structure', 
  'How atoms combine to form molecules and the structures they create.', 
  3
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'VSEPR theory', 
  1
FROM chapters WHERE slug = 'chemical-bonding-and-molecular-structure'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'VSEPR theory' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'chemical-bonding-and-molecular-structure')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Valence bond theory', 
  2
FROM chapters WHERE slug = 'chemical-bonding-and-molecular-structure'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Valence bond theory' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'chemical-bonding-and-molecular-structure')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Molecular orbital theory', 
  3
FROM chapters WHERE slug = 'chemical-bonding-and-molecular-structure'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Molecular orbital theory' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'chemical-bonding-and-molecular-structure')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Hydrogen bonding', 
  4
FROM chapters WHERE slug = 'chemical-bonding-and-molecular-structure'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Hydrogen bonding' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'chemical-bonding-and-molecular-structure')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'chemical-thermodynamics', 
  'Chemical Thermodynamics', 
  'Energy changes in chemical reactions.', 
  4
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'First law of thermodynamics', 
  1
FROM chapters WHERE slug = 'chemical-thermodynamics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'First law of thermodynamics' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'chemical-thermodynamics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Enthalpy, entropy, and free energy', 
  2
FROM chapters WHERE slug = 'chemical-thermodynamics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Enthalpy, entropy, and free energy' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'chemical-thermodynamics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Spontaneity of reactions', 
  3
FROM chapters WHERE slug = 'chemical-thermodynamics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Spontaneity of reactions' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'chemical-thermodynamics')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'solutions', 
  'Solutions', 
  'Properties of homogeneous mixtures.', 
  5
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Types of solutions', 
  1
FROM chapters WHERE slug = 'solutions'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Types of solutions' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'solutions')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Raoult''s law', 
  2
FROM chapters WHERE slug = 'solutions'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Raoult''s law' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'solutions')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Colligative properties', 
  3
FROM chapters WHERE slug = 'solutions'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Colligative properties' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'solutions')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Van''t Hoff factor', 
  4
FROM chapters WHERE slug = 'solutions'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Van''t Hoff factor' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'solutions')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'equilibrium', 
  'Equilibrium', 
  'The state in which forward and reverse reaction rates are equal.', 
  6
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Chemical equilibrium', 
  1
FROM chapters WHERE slug = 'equilibrium'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Chemical equilibrium' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'equilibrium')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Le Chatelier''s principle', 
  2
FROM chapters WHERE slug = 'equilibrium'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Le Chatelier''s principle' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'equilibrium')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Ionic equilibrium', 
  3
FROM chapters WHERE slug = 'equilibrium'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Ionic equilibrium' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'equilibrium')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'pH and buffer solutions', 
  4
FROM chapters WHERE slug = 'equilibrium'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'pH and buffer solutions' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'equilibrium')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Solubility product', 
  5
FROM chapters WHERE slug = 'equilibrium'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Solubility product' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'equilibrium')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'redox-reactions-and-electrochemistry', 
  'Redox Reactions and Electrochemistry', 
  'Electron transfer reactions and their applications.', 
  7
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Oxidation numbers', 
  1
FROM chapters WHERE slug = 'redox-reactions-and-electrochemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Oxidation numbers' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'redox-reactions-and-electrochemistry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Balancing redox reactions', 
  2
FROM chapters WHERE slug = 'redox-reactions-and-electrochemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Balancing redox reactions' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'redox-reactions-and-electrochemistry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Galvanic cells and Nernst equation', 
  3
FROM chapters WHERE slug = 'redox-reactions-and-electrochemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Galvanic cells and Nernst equation' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'redox-reactions-and-electrochemistry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Electrolysis', 
  4
FROM chapters WHERE slug = 'redox-reactions-and-electrochemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Electrolysis' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'redox-reactions-and-electrochemistry')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'chemical-kinetics', 
  'Chemical Kinetics', 
  'Rates of chemical reactions and factors affecting them.', 
  8
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Rate of reaction', 
  1
FROM chapters WHERE slug = 'chemical-kinetics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Rate of reaction' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'chemical-kinetics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Order and molecularity', 
  2
FROM chapters WHERE slug = 'chemical-kinetics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Order and molecularity' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'chemical-kinetics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Integrated rate equations', 
  3
FROM chapters WHERE slug = 'chemical-kinetics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Integrated rate equations' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'chemical-kinetics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Arrhenius equation', 
  4
FROM chapters WHERE slug = 'chemical-kinetics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Arrhenius equation' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'chemical-kinetics')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'classification-of-elements-and-periodicity-in-properties', 
  'Classification of Elements and Periodicity in Properties', 
  'Organization of elements and trends in their properties.', 
  9
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Modern periodic table', 
  1
FROM chapters WHERE slug = 'classification-of-elements-and-periodicity-in-properties'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Modern periodic table' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'classification-of-elements-and-periodicity-in-properties')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Periodic trends (atomic radii, ionization energy, electron gain enthalpy, electronegativity)', 
  2
FROM chapters WHERE slug = 'classification-of-elements-and-periodicity-in-properties'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Periodic trends (atomic radii, ionization energy, electron gain enthalpy, electronegativity)' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'classification-of-elements-and-periodicity-in-properties')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'p-block-elements', 
  'p-Block Elements', 
  'Chemistry of elements in groups 13 through 18.', 
  10
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Group 13 to 18 elements', 
  1
FROM chapters WHERE slug = 'p-block-elements'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Group 13 to 18 elements' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'p-block-elements')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'General trends', 
  2
FROM chapters WHERE slug = 'p-block-elements'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'General trends' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'p-block-elements')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Important compounds and their properties', 
  3
FROM chapters WHERE slug = 'p-block-elements'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Important compounds and their properties' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'p-block-elements')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'd-and-f-block-elements', 
  'd- and f-Block Elements', 
  'Chemistry of transition and inner transition metals.', 
  11
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Transition elements (d-block)', 
  1
FROM chapters WHERE slug = 'd-and-f-block-elements'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Transition elements (d-block)' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'd-and-f-block-elements')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Lanthanoids and Actinoids (f-block)', 
  2
FROM chapters WHERE slug = 'd-and-f-block-elements'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Lanthanoids and Actinoids (f-block)' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'd-and-f-block-elements')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Properties and trends', 
  3
FROM chapters WHERE slug = 'd-and-f-block-elements'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Properties and trends' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'd-and-f-block-elements')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'coordination-compounds', 
  'Coordination Compounds', 
  'Complexes formed by transition metals.', 
  12
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Werner''s theory', 
  1
FROM chapters WHERE slug = 'coordination-compounds'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Werner''s theory' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'coordination-compounds')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Nomenclature', 
  2
FROM chapters WHERE slug = 'coordination-compounds'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Nomenclature' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'coordination-compounds')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Isomerism', 
  3
FROM chapters WHERE slug = 'coordination-compounds'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Isomerism' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'coordination-compounds')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Valence bond theory and Crystal field theory', 
  4
FROM chapters WHERE slug = 'coordination-compounds'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Valence bond theory and Crystal field theory' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'coordination-compounds')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'purification-and-characterisation-of-organic-compounds', 
  'Purification and Characterisation of Organic Compounds', 
  'Techniques for isolating and analyzing organic substances.', 
  13
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Methods of purification', 
  1
FROM chapters WHERE slug = 'purification-and-characterisation-of-organic-compounds'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Methods of purification' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'purification-and-characterisation-of-organic-compounds')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Qualitative analysis', 
  2
FROM chapters WHERE slug = 'purification-and-characterisation-of-organic-compounds'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Qualitative analysis' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'purification-and-characterisation-of-organic-compounds')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Quantitative analysis', 
  3
FROM chapters WHERE slug = 'purification-and-characterisation-of-organic-compounds'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Quantitative analysis' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'purification-and-characterisation-of-organic-compounds')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'some-basic-principles-of-organic-chemistry', 
  'Some Basic Principles of Organic Chemistry', 
  'Fundamental concepts underlying organic reactions.', 
  14
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'IUPAC nomenclature', 
  1
FROM chapters WHERE slug = 'some-basic-principles-of-organic-chemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'IUPAC nomenclature' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'some-basic-principles-of-organic-chemistry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Electronic effects (inductive, resonance, hyperconjugation)', 
  2
FROM chapters WHERE slug = 'some-basic-principles-of-organic-chemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Electronic effects (inductive, resonance, hyperconjugation)' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'some-basic-principles-of-organic-chemistry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Isomerism', 
  3
FROM chapters WHERE slug = 'some-basic-principles-of-organic-chemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Isomerism' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'some-basic-principles-of-organic-chemistry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Reaction intermediates', 
  4
FROM chapters WHERE slug = 'some-basic-principles-of-organic-chemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Reaction intermediates' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'some-basic-principles-of-organic-chemistry')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'hydrocarbons', 
  'Hydrocarbons', 
  'Compounds containing only carbon and hydrogen.', 
  15
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Alkanes', 
  1
FROM chapters WHERE slug = 'hydrocarbons'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Alkanes' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'hydrocarbons')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Alkenes', 
  2
FROM chapters WHERE slug = 'hydrocarbons'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Alkenes' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'hydrocarbons')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Alkynes', 
  3
FROM chapters WHERE slug = 'hydrocarbons'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Alkynes' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'hydrocarbons')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Aromatic hydrocarbons (Benzene)', 
  4
FROM chapters WHERE slug = 'hydrocarbons'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Aromatic hydrocarbons (Benzene)' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'hydrocarbons')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'organic-compounds-containing-halogens', 
  'Organic Compounds Containing Halogens', 
  'Alkyl and aryl halides and their reactions.', 
  16
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Haloalkanes and haloarenes', 
  1
FROM chapters WHERE slug = 'organic-compounds-containing-halogens'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Haloalkanes and haloarenes' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'organic-compounds-containing-halogens')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Substitution reactions (SN1, SN2)', 
  2
FROM chapters WHERE slug = 'organic-compounds-containing-halogens'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Substitution reactions (SN1, SN2)' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'organic-compounds-containing-halogens')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Elimination reactions', 
  3
FROM chapters WHERE slug = 'organic-compounds-containing-halogens'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Elimination reactions' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'organic-compounds-containing-halogens')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'organic-compounds-containing-oxygen', 
  'Organic Compounds Containing Oxygen', 
  'Oxygen-containing functional groups and their chemistry.', 
  17
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Alcohols, Phenols, and Ethers', 
  1
FROM chapters WHERE slug = 'organic-compounds-containing-oxygen'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Alcohols, Phenols, and Ethers' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'organic-compounds-containing-oxygen')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Aldehydes and Ketones', 
  2
FROM chapters WHERE slug = 'organic-compounds-containing-oxygen'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Aldehydes and Ketones' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'organic-compounds-containing-oxygen')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Carboxylic Acids', 
  3
FROM chapters WHERE slug = 'organic-compounds-containing-oxygen'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Carboxylic Acids' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'organic-compounds-containing-oxygen')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'organic-compounds-containing-nitrogen', 
  'Organic Compounds Containing Nitrogen', 
  'Nitrogen-containing functional groups.', 
  18
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Amines', 
  1
FROM chapters WHERE slug = 'organic-compounds-containing-nitrogen'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Amines' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'organic-compounds-containing-nitrogen')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Diazonium salts', 
  2
FROM chapters WHERE slug = 'organic-compounds-containing-nitrogen'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Diazonium salts' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'organic-compounds-containing-nitrogen')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'biomolecules', 
  'Biomolecules', 
  'Molecules essential for life processes.', 
  19
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Carbohydrates', 
  1
FROM chapters WHERE slug = 'biomolecules'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Carbohydrates' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'biomolecules')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Proteins', 
  2
FROM chapters WHERE slug = 'biomolecules'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Proteins' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'biomolecules')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Vitamins', 
  3
FROM chapters WHERE slug = 'biomolecules'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Vitamins' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'biomolecules')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Nucleic acids', 
  4
FROM chapters WHERE slug = 'biomolecules'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Nucleic acids' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'biomolecules')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'principles-related-to-practical-chemistry', 
  'Principles Related to Practical Chemistry', 
  'Practical laboratory techniques and concepts.', 
  20
FROM subjects WHERE slug = 'chemistry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Titrations (Acid-base, Redox)', 
  1
FROM chapters WHERE slug = 'principles-related-to-practical-chemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Titrations (Acid-base, Redox)' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'principles-related-to-practical-chemistry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Salt analysis', 
  2
FROM chapters WHERE slug = 'principles-related-to-practical-chemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Salt analysis' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'principles-related-to-practical-chemistry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Preparation of standard solutions', 
  3
FROM chapters WHERE slug = 'principles-related-to-practical-chemistry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Preparation of standard solutions' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'principles-related-to-practical-chemistry')
);

-- ==========================================
-- SUBJECT: Mathematics
-- ==========================================

INSERT INTO subjects (slug, name)
VALUES ('mathematics', 'Mathematics')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'sets', 
  'Sets', 
  'Fundamental concepts of collections of objects.', 
  1
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Sets and their representations', 
  1
FROM chapters WHERE slug = 'sets'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Sets and their representations' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'sets')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Union, intersection and complement', 
  2
FROM chapters WHERE slug = 'sets'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Union, intersection and complement' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'sets')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Venn diagrams', 
  3
FROM chapters WHERE slug = 'sets'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Venn diagrams' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'sets')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'relations', 
  'Relations', 
  'The mapping between sets and their properties.', 
  2
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Relations and Functions', 
  1
FROM chapters WHERE slug = 'relations'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Relations and Functions' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'relations')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Domain, codomain and range', 
  2
FROM chapters WHERE slug = 'relations'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Domain, codomain and range' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'relations')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Types of relations', 
  3
FROM chapters WHERE slug = 'relations'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Types of relations' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'relations')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'complex-numbers', 
  'Complex Numbers', 
  'Numbers with real and imaginary parts and their geometric representation.', 
  3
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Algebra of complex numbers', 
  1
FROM chapters WHERE slug = 'complex-numbers'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Algebra of complex numbers' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'complex-numbers')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Argand diagram', 
  2
FROM chapters WHERE slug = 'complex-numbers'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Argand diagram' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'complex-numbers')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Polar representation', 
  3
FROM chapters WHERE slug = 'complex-numbers'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Polar representation' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'complex-numbers')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Roots of unity', 
  4
FROM chapters WHERE slug = 'complex-numbers'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Roots of unity' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'complex-numbers')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'quadratic-equations', 
  'Quadratic Equations', 
  'Polynomial equations of degree two and their properties.', 
  4
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Roots of a quadratic equation', 
  1
FROM chapters WHERE slug = 'quadratic-equations'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Roots of a quadratic equation' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'quadratic-equations')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Relationship between roots and coefficients', 
  2
FROM chapters WHERE slug = 'quadratic-equations'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Relationship between roots and coefficients' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'quadratic-equations')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Nature of roots', 
  3
FROM chapters WHERE slug = 'quadratic-equations'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Nature of roots' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'quadratic-equations')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'matrices', 
  'Matrices', 
  'Rectangular arrays of numbers and their algebraic operations.', 
  5
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Types of matrices', 
  1
FROM chapters WHERE slug = 'matrices'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Types of matrices' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'matrices')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Matrix operations', 
  2
FROM chapters WHERE slug = 'matrices'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Matrix operations' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'matrices')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Transpose and inverse', 
  3
FROM chapters WHERE slug = 'matrices'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Transpose and inverse' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'matrices')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'determinants', 
  'Determinants', 
  'Scalar values associated with square matrices.', 
  6
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Properties of determinants', 
  1
FROM chapters WHERE slug = 'determinants'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Properties of determinants' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'determinants')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Evaluation of determinants', 
  2
FROM chapters WHERE slug = 'determinants'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Evaluation of determinants' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'determinants')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'System of linear equations', 
  3
FROM chapters WHERE slug = 'determinants'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'System of linear equations' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'determinants')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'p-c', 
  'P&C', 
  'Techniques for counting arrangements and selections.', 
  7
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Fundamental principle of counting', 
  1
FROM chapters WHERE slug = 'p-c'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Fundamental principle of counting' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'p-c')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Permutations', 
  2
FROM chapters WHERE slug = 'p-c'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Permutations' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'p-c')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Combinations', 
  3
FROM chapters WHERE slug = 'p-c'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Combinations' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'p-c')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'binomial', 
  'Binomial', 
  'Algebraic expansion of powers of a binomial.', 
  8
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Binomial theorem for positive integral index', 
  1
FROM chapters WHERE slug = 'binomial'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Binomial theorem for positive integral index' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'binomial')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'General and middle terms', 
  2
FROM chapters WHERE slug = 'binomial'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'General and middle terms' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'binomial')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Properties of binomial coefficients', 
  3
FROM chapters WHERE slug = 'binomial'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Properties of binomial coefficients' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'binomial')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'sequence', 
  'Sequence', 
  'Ordered lists of numbers following specific patterns.', 
  9
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Arithmetic Progression (AP)', 
  1
FROM chapters WHERE slug = 'sequence'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Arithmetic Progression (AP)' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'sequence')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Geometric Progression (GP)', 
  2
FROM chapters WHERE slug = 'sequence'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Geometric Progression (GP)' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'sequence')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Harmonic Progression (HP)', 
  3
FROM chapters WHERE slug = 'sequence'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Harmonic Progression (HP)' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'sequence')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'AM, GM, HM relations', 
  4
FROM chapters WHERE slug = 'sequence'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'AM, GM, HM relations' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'sequence')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'limits', 
  'Limits', 
  'The value a function approaches as the input approaches a point.', 
  10
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Concept of limit', 
  1
FROM chapters WHERE slug = 'limits'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Concept of limit' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'limits')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Standard limits', 
  2
FROM chapters WHERE slug = 'limits'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Standard limits' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'limits')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'L''Hopital''s rule', 
  3
FROM chapters WHERE slug = 'limits'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'L''Hopital''s rule' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'limits')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'continuity', 
  'Continuity', 
  'The property of functions having no breaks or jumps.', 
  11
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Continuity at a point', 
  1
FROM chapters WHERE slug = 'continuity'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Continuity at a point' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'continuity')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Continuity on an interval', 
  2
FROM chapters WHERE slug = 'continuity'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Continuity on an interval' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'continuity')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Discontinuity', 
  3
FROM chapters WHERE slug = 'continuity'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Discontinuity' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'continuity')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'differentiability', 
  'Differentiability', 
  'The rate of change of a function and its applications.', 
  12
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Derivative of a function', 
  1
FROM chapters WHERE slug = 'differentiability'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Derivative of a function' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'differentiability')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Rules of differentiation', 
  2
FROM chapters WHERE slug = 'differentiability'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Rules of differentiation' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'differentiability')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Maxima and Minima', 
  3
FROM chapters WHERE slug = 'differentiability'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Maxima and Minima' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'differentiability')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Tangents and Normals', 
  4
FROM chapters WHERE slug = 'differentiability'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Tangents and Normals' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'differentiability')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'integral', 
  'Integral', 
  'The accumulation of quantities and inverse operation of differentiation.', 
  13
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Indefinite integrals', 
  1
FROM chapters WHERE slug = 'integral'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Indefinite integrals' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'integral')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Definite integrals', 
  2
FROM chapters WHERE slug = 'integral'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Definite integrals' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'integral')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Properties of definite integrals', 
  3
FROM chapters WHERE slug = 'integral'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Properties of definite integrals' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'integral')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Area under curves', 
  4
FROM chapters WHERE slug = 'integral'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Area under curves' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'integral')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'differential-equations', 
  'Differential Equations', 
  'Equations involving derivatives of functions.', 
  14
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Order and degree', 
  1
FROM chapters WHERE slug = 'differential-equations'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Order and degree' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'differential-equations')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Formation of differential equations', 
  2
FROM chapters WHERE slug = 'differential-equations'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Formation of differential equations' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'differential-equations')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Solving first-order first-degree equations', 
  3
FROM chapters WHERE slug = 'differential-equations'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Solving first-order first-degree equations' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'differential-equations')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'coordinate-geometry', 
  'Coordinate Geometry', 
  'Geometry using a coordinate system.', 
  15
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Straight lines', 
  1
FROM chapters WHERE slug = 'coordinate-geometry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Straight lines' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'coordinate-geometry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Circles', 
  2
FROM chapters WHERE slug = 'coordinate-geometry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Circles' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'coordinate-geometry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Parabola, Ellipse, and Hyperbola (Conic sections)', 
  3
FROM chapters WHERE slug = 'coordinate-geometry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Parabola, Ellipse, and Hyperbola (Conic sections)' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'coordinate-geometry')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  '3d', 
  '3D', 
  'Geometry in three dimensions.', 
  16
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Direction cosines and ratios', 
  1
FROM chapters WHERE slug = '3d'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Direction cosines and ratios' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = '3d')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Equation of a line in space', 
  2
FROM chapters WHERE slug = '3d'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Equation of a line in space' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = '3d')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Equation of a plane', 
  3
FROM chapters WHERE slug = '3d'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Equation of a plane' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = '3d')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Shortest distance between skew lines', 
  4
FROM chapters WHERE slug = '3d'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Shortest distance between skew lines' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = '3d')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'vector', 
  'Vector', 
  'Quantities having both magnitude and direction.', 
  17
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Vector addition and scalar multiplication', 
  1
FROM chapters WHERE slug = 'vector'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Vector addition and scalar multiplication' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'vector')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Dot and cross product', 
  2
FROM chapters WHERE slug = 'vector'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Dot and cross product' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'vector')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Scalar triple product', 
  3
FROM chapters WHERE slug = 'vector'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Scalar triple product' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'vector')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'statistics', 
  'Statistics', 
  'Analysis of data sets.', 
  18
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Mean, median, mode', 
  1
FROM chapters WHERE slug = 'statistics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Mean, median, mode' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'statistics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Variance and standard deviation', 
  2
FROM chapters WHERE slug = 'statistics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Variance and standard deviation' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'statistics')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Mean deviation', 
  3
FROM chapters WHERE slug = 'statistics'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Mean deviation' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'statistics')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'probability', 
  'Probability', 
  'The measure of the likelihood that an event will occur.', 
  19
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Axiomatic probability', 
  1
FROM chapters WHERE slug = 'probability'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Axiomatic probability' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'probability')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Conditional probability', 
  2
FROM chapters WHERE slug = 'probability'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Conditional probability' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'probability')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Bayes'' theorem', 
  3
FROM chapters WHERE slug = 'probability'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Bayes'' theorem' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'probability')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Binomial distribution', 
  4
FROM chapters WHERE slug = 'probability'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Binomial distribution' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'probability')
);

INSERT INTO chapters (subject_id, slug, title, description, order_index)
SELECT 
  id, 
  'trigonometry', 
  'Trigonometry', 
  'Relationships between angles and sides of triangles.', 
  20
FROM subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Trigonometric identities', 
  1
FROM chapters WHERE slug = 'trigonometry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Trigonometric identities' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'trigonometry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Trigonometric equations', 
  2
FROM chapters WHERE slug = 'trigonometry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Trigonometric equations' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'trigonometry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Inverse trigonometric functions', 
  3
FROM chapters WHERE slug = 'trigonometry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Inverse trigonometric functions' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'trigonometry')
);

INSERT INTO topics (chapter_id, title, order_index)
SELECT 
  id, 
  'Properties of triangles', 
  4
FROM chapters WHERE slug = 'trigonometry'
WHERE NOT EXISTS (
  SELECT 1 FROM topics 
  WHERE title = 'Properties of triangles' 
  AND chapter_id = (SELECT id FROM chapters WHERE slug = 'trigonometry')
);

COMMIT;
