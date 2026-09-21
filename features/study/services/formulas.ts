import { createClient } from "@/lib/supabase/client";

export interface FormulaVariable {
  name: string;
  symbol: string;
  unit?: string;
  description?: string;
}

export interface Formula {
  id: string;
  user_id?: string | null;
  subjectId?: string;
  chapterId: string;
  topicId?: string | null;
  title: string;
  formula: string; // LaTeX string
  description: string;
  variables: FormulaVariable[];
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  relatedIds?: string[];
  commonMistakes?: string[];
  memoryTrick?: string;
  isOfficial?: boolean;
  createdAt?: string;
}

// Default Seeded Official Formulas Fallback
const DEFAULT_OFFICIAL_FORMULAS: Formula[] = [
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
    memoryTrick: "v-u-a-t -> 'vuat' sounds like 'what'. What is the velocity?",
    isOfficial: true
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
    ],
    isOfficial: true
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
    relatedIds: ["f-kin-001", "f-kin-002"],
    isOfficial: true
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
    memoryTrick: "Range is maximized when sin(2θ) = 1, which happens at θ = 45°.",
    isOfficial: true
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
    isOfficial: true
  }
];

const LOCAL_CUSTOM_FORMULAS_KEY = "jee_custom_formulas_v1";

function getLocalCustomFormulas(chapterId: string): Formula[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_CUSTOM_FORMULAS_KEY}_${chapterId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalCustomFormulas(chapterId: string, formulas: Formula[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LOCAL_CUSTOM_FORMULAS_KEY}_${chapterId}`, JSON.stringify(formulas));
  } catch (err) {
    console.error("setLocalCustomFormulas error:", err);
  }
}

export async function getFormulasByChapter(chapterId: string, topicId?: string): Promise<Formula[]> {
  const customLocal = getLocalCustomFormulas(chapterId);
  const officialLocal = DEFAULT_OFFICIAL_FORMULAS.filter(
    (f) => f.chapterId === chapterId || chapterId.includes(f.chapterId)
  );

  let allFormulas: Formula[] = [...officialLocal, ...customLocal];

  try {
    const supabase = createClient();
    const { data: dbFormulas, error } = await supabase
      .from("formulas")
      .select("*")
      .or(`chapter_id.eq.${chapterId},chapter_id.ilike.%${chapterId}%`);

    if (!error && dbFormulas && dbFormulas.length > 0) {
      const mapped: Formula[] = dbFormulas.map((row: Record<string, unknown>) => ({
        id: String(row.id),
        user_id: typeof row.user_id === "string" ? row.user_id : null,
        subjectId: String(row.subject_id ?? ""),
        chapterId: String(row.chapter_id ?? ""),
        topicId: typeof row.topic_id === "string" ? row.topic_id : undefined,
        title: String(row.title ?? ""),
        formula: String(row.formula ?? ""),
        description: typeof row.description === "string" ? row.description : "",
        variables: Array.isArray(row.variables) ? row.variables.map(String) : [],
        difficulty: typeof row.difficulty === "string" ? row.difficulty : "Medium",
        tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
        commonMistakes: Array.isArray(row.common_mistakes) ? row.common_mistakes.map(String) : [],
        memoryTrick: typeof row.memory_trick === "string" ? row.memory_trick : undefined,
        isOfficial: Boolean(row.is_official),
        createdAt: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
      }));

      // Combine DB formulas with default fallback if DB has non-overlapping items
      const existingIds = new Set(mapped.map((f) => f.id));
      const extraDefaults = officialLocal.filter((f) => !existingIds.has(f.id));
      allFormulas = [...mapped, ...extraDefaults];
    }
  } catch (err) {
    console.warn("[getFormulasByChapter] DB query failed, using fallback:", err);
  }

  if (topicId) {
    return allFormulas.filter((f) => !f.topicId || f.topicId === topicId);
  }

  return allFormulas;
}

export async function searchFormulas(
  query: string,
  chapterId?: string,
  topicId?: string,
  difficultyFilter: string = "All",
  sourceFilter: string = "All"
): Promise<Formula[]> {
  const baseFormulas = chapterId ? await getFormulasByChapter(chapterId, topicId) : DEFAULT_OFFICIAL_FORMULAS;

  const q = query.toLowerCase().trim();

  return baseFormulas.filter((f) => {
    // Difficulty filter
    if (difficultyFilter !== "All" && f.difficulty !== difficultyFilter) {
      return false;
    }

    // Source filter
    if (sourceFilter === "Official" && !f.isOfficial) return false;
    if (sourceFilter === "Custom" && f.isOfficial) return false;

    // Search query filter
    if (!q) return true;

    return (
      f.title.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.formula.toLowerCase().includes(q) ||
      f.tags.some((t) => t.toLowerCase().includes(q)) ||
      f.variables.some((v) => v.name.toLowerCase().includes(q) || v.symbol.toLowerCase().includes(q))
    );
  });
}

export async function createCustomFormula(
  formulaData: Partial<Formula> & { chapterId: string; title: string; formula: string }
): Promise<Formula> {
  const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `formula-${Date.now()}`;
  const now = new Date().toISOString();

  const newFormula: Formula = {
    id: newId,
    user_id: "guest",
    subjectId: formulaData.subjectId || "physics",
    chapterId: formulaData.chapterId,
    topicId: formulaData.topicId || null,
    title: formulaData.title,
    formula: formulaData.formula,
    description: formulaData.description || "",
    variables: formulaData.variables || [],
    difficulty: formulaData.difficulty || "Medium",
    tags: formulaData.tags || ["Custom"],
    commonMistakes: formulaData.commonMistakes || [],
    memoryTrick: formulaData.memoryTrick || undefined,
    isOfficial: false,
    createdAt: now,
  };

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      newFormula.user_id = user.id;
      const { data, error } = await supabase
        .from("formulas")
        .insert({
          user_id: user.id,
          subject_id: newFormula.subjectId,
          chapter_id: newFormula.chapterId,
          topic_id: newFormula.topicId,
          title: newFormula.title,
          formula: newFormula.formula,
          description: newFormula.description,
          variables: newFormula.variables,
          difficulty: newFormula.difficulty,
          tags: newFormula.tags,
          common_mistakes: newFormula.commonMistakes,
          memory_trick: newFormula.memoryTrick,
          is_official: false,
        })
        .select()
        .single();

      if (!error && data) {
        const created: Formula = {
          id: data.id,
          user_id: data.user_id,
          subjectId: data.subject_id,
          chapterId: data.chapter_id,
          topicId: data.topic_id,
          title: data.title,
          formula: data.formula,
          description: data.description,
          variables: data.variables || [],
          difficulty: data.difficulty,
          tags: data.tags || [],
          commonMistakes: data.common_mistakes || [],
          memoryTrick: data.memory_trick,
          isOfficial: false,
          createdAt: data.created_at,
        };

        const currentLocal = getLocalCustomFormulas(formulaData.chapterId);
        setLocalCustomFormulas(formulaData.chapterId, [created, ...currentLocal]);
        return created;
      }
    }
  } catch (err) {
    console.warn("[createCustomFormula] Failed DB insert, using local fallback:", err);
  }

  const currentLocal = getLocalCustomFormulas(formulaData.chapterId);
  setLocalCustomFormulas(formulaData.chapterId, [newFormula, ...currentLocal]);
  return newFormula;
}

export async function deleteCustomFormula(id: string, chapterId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && !id.startsWith("formula-")) {
      await supabase.from("formulas").delete().eq("id", id).eq("user_id", user.id);
    }
  } catch (err) {
    console.warn("[deleteCustomFormula] DB delete error:", err);
  }

  const local = getLocalCustomFormulas(chapterId);
  setLocalCustomFormulas(
    chapterId,
    local.filter((f) => f.id !== id)
  );
  return true;
}
