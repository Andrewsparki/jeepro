export type Difficulty = "Easy" | "Medium" | "Hard";
export type Status = "Not Started" | "In Progress" | "Mastered" | "Needs Revision";

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  completionPercentage: number;
  status: Status;
  difficulty: Difficulty;
  estimatedStudyTime: string;
  revisionStatus: string;
  description: string;
  topics: string[];
}

export interface Subject {
  id: string;
  slug: string;
  name: string;
  chapters: Chapter[];
}

export const mockSyllabus: Record<string, Subject> = {
  physics: {
    id: "sub_1",
    slug: "physics",
    name: "Physics",
    chapters: [
      {
        id: "ch_1",
        slug: "kinematics",
        title: "Kinematics",
        completionPercentage: 100,
        status: "Mastered",
        difficulty: "Easy",
        estimatedStudyTime: "12h",
        revisionStatus: "Up to date",
        description: "The study of motion without considering its causes. Fundamental for all of mechanics.",
        topics: ["Rectilinear Motion", "Projectile Motion", "Relative Velocity in 1D and 2D"]
      },
      {
        id: "ch_2",
        slug: "newtons-laws-of-motion",
        title: "Newton's Laws of Motion",
        completionPercentage: 65,
        status: "In Progress",
        difficulty: "Medium",
        estimatedStudyTime: "18h",
        revisionStatus: "Due in 3 days",
        description: "The foundation of classical mechanics describing the relationship between a body and the forces acting upon it.",
        topics: ["First, Second and Third Laws", "Friction", "Circular Motion Dynamics"]
      },
      {
        id: "ch_3",
        slug: "rotational-motion",
        title: "Rotational Motion",
        completionPercentage: 10,
        status: "In Progress",
        difficulty: "Hard",
        estimatedStudyTime: "25h",
        revisionStatus: "Pending completion",
        description: "Complex mechanics involving rigid bodies rotating about a fixed or moving axis.",
        topics: ["Center of Mass", "Moment of Inertia", "Torque and Angular Momentum", "Rolling Motion"]
      },
      {
        id: "ch_4",
        slug: "thermodynamics",
        title: "Thermodynamics",
        completionPercentage: 0,
        status: "Not Started",
        difficulty: "Medium",
        estimatedStudyTime: "20h",
        revisionStatus: "Not started",
        description: "The study of heat, work, and temperature, and their relation to energy and radiation.",
        topics: ["Zeroth and First Law", "Specific Heat Capacity", "Carnot Engine"]
      }
    ]
  },
  chemistry: {
    id: "sub_2",
    slug: "chemistry",
    name: "Chemistry",
    chapters: [
      {
        id: "ch_5",
        slug: "atomic-structure",
        title: "Atomic Structure",
        completionPercentage: 90,
        status: "Needs Revision",
        difficulty: "Medium",
        estimatedStudyTime: "15h",
        revisionStatus: "Overdue by 2 days",
        description: "The fundamental building blocks of matter and quantum mechanical model.",
        topics: ["Bohr Model", "Quantum Numbers", "Electronic Configuration"]
      },
      {
        id: "ch_6",
        slug: "chemical-bonding",
        title: "Chemical Bonding",
        completionPercentage: 0,
        status: "Not Started",
        difficulty: "Hard",
        estimatedStudyTime: "22h",
        revisionStatus: "Not started",
        description: "How atoms combine to form molecules and the structures they create.",
        topics: ["VSEPR Theory", "Valence Bond Theory", "Molecular Orbital Theory"]
      }
    ]
  },
  mathematics: {
    id: "sub_3",
    slug: "mathematics",
    name: "Mathematics",
    chapters: [
      {
        id: "ch_7",
        slug: "calculus-integration",
        title: "Integral Calculus",
        completionPercentage: 45,
        status: "In Progress",
        difficulty: "Hard",
        estimatedStudyTime: "30h",
        revisionStatus: "Due in 7 days",
        description: "The study of accumulation of quantities and the areas under and between curves.",
        topics: ["Indefinite Integrals", "Definite Integrals", "Area under curves"]
      },
      {
        id: "ch_8",
        slug: "matrices",
        title: "Matrices & Determinants",
        completionPercentage: 100,
        status: "Mastered",
        difficulty: "Easy",
        estimatedStudyTime: "14h",
        revisionStatus: "Up to date",
        description: "Rectangular arrays of numbers and their operations, heavily used in linear algebra.",
        topics: ["Matrix Operations", "Inverse of Matrix", "System of Linear Equations"]
      }
    ]
  }
};
