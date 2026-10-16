import { Formula } from "@/features/study/services/formulas";

export interface ChapterVariable {
  symbol: string;
  name: string;
  unit?: string;
  dimensions?: string;
  description?: string;
}

export interface ChapterFormula {
  id: string;
  title: string;
  latex: string;
  explanation: string;
  variables: ChapterVariable[];
  siUnit?: string;
  dimensions?: string;
  assumptions?: string[];
  validityConditions?: string[];
}

export interface ChapterDerivationStep {
  step: number;
  description: string;
  math: string;
}

export interface ChapterDerivation {
  id: string;
  title: string;
  context: string;
  steps: ChapterDerivationStep[];
  finalResult: string;
}

export interface ChapterGraph {
  id: string;
  title: string;
  xAxis: string;
  yAxis: string;
  curveType: string;
  equation: string;
  slopeInterpretation?: string;
  areaInterpretation?: string;
  physicalInterpretation: string;
}

export interface ChapterCommonMistake {
  id: string;
  topic: string;
  mistake: string;
  correction: string;
  category?: string;
}

export interface PhysicsChapterDataset {
  id: string;
  title: string;
  order: number;
  unitNumber?: number;
  classLevel: number;
  topics: string[];
  notes: string;
  formulas: ChapterFormula[];
  derivations: ChapterDerivation[];
  graphs: ChapterGraph[];
  commonMistakes: ChapterCommonMistake[];
  quickRevision: string[];
  sources?: string[];
}

// Slugs used across JEE Pro (syllabus & study routes)
export const PHYSICS_CHAPTER_SLUG_MAP: Record<string, string> = {
  "physics-measurement": "phys-01-units-and-measurements",
  "units-and-measurements": "phys-01-units-and-measurements",
  "phys-01-units-and-measurements": "phys-01-units-and-measurements",

  "kinematics": "phys-02-kinematics",
  "phys-02-kinematics": "phys-02-kinematics",

  "laws-of-motion": "phys-03-laws-of-motion",
  "phys-03-laws-of-motion": "phys-03-laws-of-motion",

  "work-energy-power": "phys-04-work-energy-and-power",
  "work-energy-and-power": "phys-04-work-energy-and-power",
  "phys-04-work-energy-and-power": "phys-04-work-energy-and-power",

  "rotational-motion": "phys-05-rotational-motion",
  "phys-05-rotational-motion": "phys-05-rotational-motion",

  "gravitation": "phys-06-gravitation",
  "phys-06-gravitation": "phys-06-gravitation",
};

// Lazy/direct imports of the 6 datasets
import unitsData from "@/features/study/data/physics-chapters/phys-01-units-and-measurements.json";
import kinematicsData from "@/features/study/data/physics-chapters/phys-02-kinematics.json";
import lawsOfMotionData from "@/features/study/data/physics-chapters/phys-03-laws-of-motion.json";
import workEnergyData from "@/features/study/data/physics-chapters/phys-04-work-energy-and-power.json";
import rotationalMotionData from "@/features/study/data/physics-chapters/phys-05-rotational-motion.json";
import gravitationData from "@/features/study/data/physics-chapters/phys-06-gravitation.json";

const DATASETS: Record<string, PhysicsChapterDataset> = {
  "phys-01-units-and-measurements": unitsData as unknown as PhysicsChapterDataset,
  "phys-02-kinematics": kinematicsData as unknown as PhysicsChapterDataset,
  "phys-03-laws-of-motion": lawsOfMotionData as unknown as PhysicsChapterDataset,
  "phys-04-work-energy-and-power": workEnergyData as unknown as PhysicsChapterDataset,
  "phys-05-rotational-motion": rotationalMotionData as unknown as PhysicsChapterDataset,
  "phys-06-gravitation": gravitationData as unknown as PhysicsChapterDataset,
};

/**
 * Returns the integrated Physics chapter dataset if one exists for the given chapter slug/id.
 */
export function getPhysicsChapterDataset(slugOrId: string): PhysicsChapterDataset | null {
  if (!slugOrId) return null;
  const normalized = slugOrId.toLowerCase().trim();
  const targetId = PHYSICS_CHAPTER_SLUG_MAP[normalized] || normalized;
  return DATASETS[targetId] || null;
}

/**
 * Converts dataset formulas into the Formula interface used by FormulasTab.
 */
export function getDatasetFormulas(dataset: PhysicsChapterDataset, chapterId: string): Formula[] {
  return dataset.formulas.map((f, idx) => {
    const rawAssumptions = Array.isArray(f.assumptions)
      ? f.assumptions
      : typeof f.assumptions === "string"
      ? [f.assumptions]
      : [];

    const rawValidity = Array.isArray(f.validityConditions)
      ? f.validityConditions
      : typeof f.validityConditions === "string"
      ? [f.validityConditions]
      : [];

    const tags = [dataset.title, ...rawAssumptions, ...rawValidity].slice(0, 5);

    return {
      id: f.id || `ds-formula-${idx}`,
      chapterId: chapterId,
      title: f.title,
      formula: f.latex,
      description: f.explanation,
      variables: f.variables.map(v => ({
        name: v.name,
        symbol: v.symbol,
        unit: v.unit,
        description: v.dimensions ? `Dimensions: ${v.dimensions}` : undefined,
      })),
      difficulty: idx % 3 === 0 ? "Easy" : idx % 3 === 1 ? "Medium" : "Hard",
      tags: tags,
      commonMistakes: dataset.commonMistakes
        .filter(m => m.topic.toLowerCase().includes(f.title.toLowerCase()) || m.mistake.toLowerCase().includes(f.title.toLowerCase()))
        .map(m => `Mistake: ${m.mistake} -> Correction: ${m.correction}`),
      memoryTrick: rawValidity.length > 0
        ? `Validity: ${rawValidity.join("; ")}`
        : undefined,
      isOfficial: true,
    };
  });
}
