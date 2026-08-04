export interface FormulaVariable {
  name: string;
  symbol: string;
  unit?: string;
  description?: string;
}

export interface Formula {
  id: string;
  chapterId: string;
  title: string;
  formula: string; // LaTeX string
  description: string;
  variables: FormulaVariable[];
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  relatedIds?: string[];
  commonMistakes?: string[];
  memoryTrick?: string;
}

// Mock Database for Sprint 5.3
const MOCK_FORMULAS: Formula[] = [
  // Kinematics Formulas
  {
    id: "f-kin-001",
    chapterId: "kinematics",
    title: "First Equation of Motion",
    formula: "v = u + at",
    description: "Relates final velocity, initial velocity, acceleration, and time. Valid only for constant acceleration.",
    variables: [
      { name: "Final Velocity", symbol: "v", unit: "m/s" },
      { name: "Initial Velocity", symbol: "u", unit: "m/s" },
      { name: "Acceleration", symbol: "a", unit: "m/s²" },
      { name: "Time", symbol: "t", unit: "s" },
    ],
    difficulty: "Easy",
    tags: ["Kinematics", "Motion", "1D"],
    commonMistakes: [
      "Using this equation when acceleration is not constant.",
      "Forgetting sign conventions for velocity and acceleration."
    ],
    memoryTrick: "v-u-a-t -> 'vuat' sounds like 'what'. What is the velocity?"
  },
  {
    id: "f-kin-002",
    chapterId: "kinematics",
    title: "Second Equation of Motion",
    formula: "s = ut + \\frac{1}{2}at^2",
    description: "Calculates the displacement of an object moving under constant acceleration over a specific time interval.",
    variables: [
      { name: "Displacement", symbol: "s", unit: "m" },
      { name: "Initial Velocity", symbol: "u", unit: "m/s" },
      { name: "Acceleration", symbol: "a", unit: "m/s²" },
      { name: "Time", symbol: "t", unit: "s" },
    ],
    difficulty: "Medium",
    tags: ["Kinematics", "Displacement", "1D"],
    relatedIds: ["f-kin-001", "f-kin-003"],
    commonMistakes: [
      "Confusing displacement (s) with distance traveled.",
      "Forgetting the square on time (t²)."
    ]
  },
  {
    id: "f-kin-003",
    chapterId: "kinematics",
    title: "Third Equation of Motion",
    formula: "v^2 = u^2 + 2as",
    description: "Relates initial and final velocities with acceleration and displacement, independent of time.",
    variables: [
      { name: "Final Velocity", symbol: "v", unit: "m/s" },
      { name: "Initial Velocity", symbol: "u", unit: "m/s" },
      { name: "Acceleration", symbol: "a", unit: "m/s²" },
      { name: "Displacement", symbol: "s", unit: "m" },
    ],
    difficulty: "Medium",
    tags: ["Kinematics", "Time-Independent"],
    relatedIds: ["f-kin-001", "f-kin-002"]
  },
  {
    id: "f-kin-004",
    chapterId: "kinematics",
    title: "Projectile Range",
    formula: "R = \\frac{u^2 \\sin(2\\theta)}{g}",
    description: "Calculates the maximum horizontal distance covered by a projectile launched at an angle from the ground.",
    variables: [
      { name: "Range", symbol: "R", unit: "m" },
      { name: "Initial Velocity", symbol: "u", unit: "m/s" },
      { name: "Launch Angle", symbol: "\\theta", unit: "rad or degrees" },
      { name: "Gravity", symbol: "g", unit: "m/s²" },
    ],
    difficulty: "Hard",
    tags: ["Kinematics", "Projectile", "2D"],
    commonMistakes: [
      "Using sine squared instead of sine of 2-theta.",
      "Using this formula when launch and landing heights are different."
    ],
    memoryTrick: "Range is maximized when sin(2θ) = 1, which happens at θ = 45°."
  },
  
  // Gravitation Formulas
  {
    id: "f-grav-001",
    chapterId: "gravitation",
    title: "Newton's Law of Universal Gravitation",
    formula: "F = G \\frac{m_1 m_2}{r^2}",
    description: "Calculates the attractive gravitational force between two point masses.",
    variables: [
      { name: "Gravitational Force", symbol: "F", unit: "N" },
      { name: "Gravitational Constant", symbol: "G", unit: "N·m²/kg²" },
      { name: "Mass 1", symbol: "m_1", unit: "kg" },
      { name: "Mass 2", symbol: "m_2", unit: "kg" },
      { name: "Distance", symbol: "r", unit: "m" },
    ],
    difficulty: "Medium",
    tags: ["Gravitation", "Force", "Newton"],
  }
];

export async function getFormulasByChapter(chapterId: string): Promise<Formula[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_FORMULAS.filter(f => f.chapterId === chapterId);
}

export async function searchFormulas(query: string, chapterId?: string): Promise<Formula[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const q = query.toLowerCase().trim();
  if (!q) return chapterId ? await getFormulasByChapter(chapterId) : [];
  
  const formulas = chapterId ? MOCK_FORMULAS.filter(f => f.chapterId === chapterId) : MOCK_FORMULAS;
  
  return formulas.filter(f => {
    return f.title.toLowerCase().includes(q) || 
           f.description.toLowerCase().includes(q) ||
           f.tags.some(t => t.toLowerCase().includes(q)) ||
           f.variables.some(v => v.name.toLowerCase().includes(q) || v.symbol.toLowerCase().includes(q));
  });
}
