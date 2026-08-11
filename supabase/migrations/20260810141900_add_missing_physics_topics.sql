-- Add missing physics topics

-- properties-of-solids-liquids
DO $$
DECLARE
  v_chapter_id uuid;
BEGIN
  SELECT id INTO v_chapter_id FROM chapters WHERE slug = 'properties-of-solids-liquids';
  IF v_chapter_id IS NOT NULL THEN
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Elasticity', 1);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Fluid Mechanics', 2);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Surface Tension', 3);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Viscosity', 4);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Thermal Expansion', 5);
  END IF;
END $$;

-- kinetic-theory
DO $$
DECLARE
  v_chapter_id uuid;
BEGIN
  SELECT id INTO v_chapter_id FROM chapters WHERE slug = 'kinetic-theory';
  IF v_chapter_id IS NOT NULL THEN
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Equation of State', 1);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Kinetic Theory of Gases', 2);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Degrees of Freedom and Law of Equipartition of Energy', 3);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Specific Heat Capacity of Gases', 4);
  END IF;
END $$;

-- oscillations-waves
DO $$
DECLARE
  v_chapter_id uuid;
BEGIN
  SELECT id INTO v_chapter_id FROM chapters WHERE slug = 'oscillations-waves';
  IF v_chapter_id IS NOT NULL THEN
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Simple Harmonic Motion', 1);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Energy in SHM', 2);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Wave Motion', 3);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Superposition of Waves', 4);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Doppler Effect', 5);
  END IF;
END $$;

-- magnetic-effects-of-current-magnetism
DO $$
DECLARE
  v_chapter_id uuid;
BEGIN
  SELECT id INTO v_chapter_id FROM chapters WHERE slug = 'magnetic-effects-of-current-magnetism';
  IF v_chapter_id IS NOT NULL THEN
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Biot-Savart Law', 1);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Ampere Law', 2);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Force on Moving Charge', 3);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Magnetic Dipole', 4);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Earth Magnetism', 5);
  END IF;
END $$;

-- emi-ac
DO $$
DECLARE
  v_chapter_id uuid;
BEGIN
  SELECT id INTO v_chapter_id FROM chapters WHERE slug = 'emi-ac';
  IF v_chapter_id IS NOT NULL THEN
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Faraday Law of Induction', 1);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Lenz Law', 2);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Self and Mutual Inductance', 3);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Alternating Current', 4);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'LCR Circuits', 5);
  END IF;
END $$;

-- dual-nature
DO $$
DECLARE
  v_chapter_id uuid;
BEGIN
  SELECT id INTO v_chapter_id FROM chapters WHERE slug = 'dual-nature';
  IF v_chapter_id IS NOT NULL THEN
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Photoelectric Effect', 1);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Matter Waves', 2);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Davisson-Germer Experiment', 3);
  END IF;
END $$;

-- atoms
DO $$
DECLARE
  v_chapter_id uuid;
BEGIN
  SELECT id INTO v_chapter_id FROM chapters WHERE slug = 'atoms';
  IF v_chapter_id IS NOT NULL THEN
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Rutherford Model', 1);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Bohr Model', 2);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Hydrogen Spectrum', 3);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'X-rays', 4);
  END IF;
END $$;

-- nuclei
DO $$
DECLARE
  v_chapter_id uuid;
BEGIN
  SELECT id INTO v_chapter_id FROM chapters WHERE slug = 'nuclei';
  IF v_chapter_id IS NOT NULL THEN
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Nuclear Structure', 1);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Radioactivity', 2);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Mass Defect and Binding Energy', 3);
    INSERT INTO topics (chapter_id, title, order_index) VALUES (v_chapter_id, 'Nuclear Fission and Fusion', 4);
  END IF;
END $$;

