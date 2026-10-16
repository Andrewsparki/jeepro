"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers, Atom, FlaskConical, Binary } from "lucide-react";
import { dispatchInteractionSound } from "@/lib/sound-engine";

type SubjectId = "physics" | "chemistry" | "mathematics";

interface ModuleGroup {
  name: string;
  weight: string;
  chapters: { name: string; isHighYield: boolean }[];
}

interface SubjectDetail {
  id: SubjectId;
  title: string;
  count: number;
  weightage: string;
  description: string;
  workspaceHref: string;
  icon: typeof Atom;
  modules: ModuleGroup[];
}

const subjectsData: Record<SubjectId, SubjectDetail> = {
  physics: {
    id: "physics",
    title: "Physics",
    count: 29,
    weightage: "33.3% Total Examination Weight",
    description:
      "Structured from classical Newtonian mechanics and rotational inertia to Maxwell's electrodynamics and modern quantum phenomena. Complete formula memory anchors calibrated for JEE Advanced derivation rigor.",
    workspaceHref: "/dashboard/study/physics",
    icon: Atom,
    modules: [
      {
        name: "Classical Mechanics & Dynamics",
        weight: "10-12% Average Weight",
        chapters: [
          { name: "Rotational Dynamics & Inertia Tensors", isHighYield: true },
          { name: "Center of Mass & Impulse Momentum", isHighYield: true },
          { name: "Work, Energy & Conservative Fields", isHighYield: true },
          { name: "Newton's Laws & Constraint Equations", isHighYield: false },
          { name: "Fluid Mechanics & Viscous Drag", isHighYield: false },
        ],
      },
      {
        name: "Electrodynamics & Magnetism",
        weight: "12-14% Average Weight",
        chapters: [
          { name: "Electrostatics & Gauss's Divergence", isHighYield: true },
          { name: "Electromagnetic Induction & Lenz's Law", isHighYield: true },
          { name: "Current Electricity & DC Circuits", isHighYield: true },
          { name: "Magnetic Effects of Current & Ampere's Law", isHighYield: true },
          { name: "Alternating Current & LCR Resonance", isHighYield: false },
        ],
      },
      {
        name: "Thermodynamics, Waves & Optics",
        weight: "8-10% Average Weight",
        chapters: [
          { name: "Thermodynamics & Carnot Engines", isHighYield: true },
          { name: "Kinetic Theory & Mean Free Path", isHighYield: false },
          { name: "Wave Optics & Interference Fringes", isHighYield: true },
          { name: "Ray Optics & Optical Instruments", isHighYield: true },
          { name: "Simple Harmonic Motion & Oscillations", isHighYield: false },
        ],
      },
      {
        name: "Modern Physics & Quantum Phenomena",
        weight: "6-8% Average Weight",
        chapters: [
          { name: "Photoelectric Effect & Photons", isHighYield: true },
          { name: "Atomic Structure & Bohr Model", isHighYield: true },
          { name: "Nuclear Binding Energy & Decay Law", isHighYield: false },
          { name: "Semiconductor Devices & Logic", isHighYield: false },
          { name: "Electromagnetic Waves", isHighYield: false },
        ],
      },
    ],
  },
  chemistry: {
    id: "chemistry",
    title: "Chemistry",
    count: 30,
    weightage: "33.3% Total Examination Weight",
    description:
      "Equal tripartite distribution across Physical, Organic, and Inorganic Chemistry. Mapped strictly to official NCERT line-by-line requirements and IIT Advanced reaction mechanism matrices.",
    workspaceHref: "/dashboard/study/chemistry",
    icon: FlaskConical,
    modules: [
      {
        name: "Organic Chemistry Mechanisms",
        weight: "12-14% Average Weight",
        chapters: [
          { name: "Aldehydes, Ketones & Condensation", isHighYield: true },
          { name: "Electrophilic Aromatic Substitutions", isHighYield: true },
          { name: "Alcohols, Phenols & Ethers", isHighYield: true },
          { name: "Amines & Diazonium Coupling", isHighYield: false },
          { name: "General Organic Chemistry & Resonance", isHighYield: true },
        ],
      },
      {
        name: "Inorganic Coordination & Periodicity",
        weight: "10-12% Average Weight",
        chapters: [
          { name: "Coordination Compounds & Crystal Field Theory", isHighYield: true },
          { name: "Chemical Bonding & Molecular Orbitals (MOT)", isHighYield: true },
          { name: "p-Block Elements (Groups 13-18)", isHighYield: true },
          { name: "d- & f-Block Transition Elements", isHighYield: false },
          { name: "Qualitative Cation & Anion Analysis", isHighYield: false },
        ],
      },
      {
        name: "Physical Chemistry & Equilibrium",
        weight: "10-12% Average Weight",
        chapters: [
          { name: "Chemical & Ionic Equilibrium", isHighYield: true },
          { name: "Thermodynamics & Gibbs Free Energy", isHighYield: true },
          { name: "Electrochemistry & Nernst Potential", isHighYield: true },
          { name: "Chemical Kinetics & Rate Laws", isHighYield: true },
          { name: "Solutions & Colligative Properties", isHighYield: false },
        ],
      },
    ],
  },
  mathematics: {
    id: "mathematics",
    title: "Mathematics",
    count: 31,
    weightage: "33.4% Total Examination Weight",
    description:
      "Heavy emphasis on differential and integral calculus, multi-variable vector algebra, 3D analytical geometry, complex numbers, and combinatorics for Advanced score maximization.",
    workspaceHref: "/dashboard/study/mathematics",
    icon: Binary,
    modules: [
      {
        name: "Differential & Integral Calculus",
        weight: "14-16% Average Weight",
        chapters: [
          { name: "Definite Integrals & Walli's / King's Rule", isHighYield: true },
          { name: "Application of Derivatives & Tangents", isHighYield: true },
          { name: "Differential Equations & Integrating Factor", isHighYield: true },
          { name: "Area Under Curves & Bounding Loci", isHighYield: true },
          { name: "Continuity, Differentiability & Limits", isHighYield: false },
        ],
      },
      {
        name: "Vectors & 3D Analytical Geometry",
        weight: "10-12% Average Weight",
        chapters: [
          { name: "Vectors, Dot Product & Triple Products", isHighYield: true },
          { name: "Three-Dimensional Solid Lines & Planes", isHighYield: true },
          { name: "Shortest Distance Between Skew Lines", isHighYield: true },
          { name: "Conic Sections: Parabola, Ellipse, Hyperbola", isHighYield: true },
          { name: "Circles & Tangent Families", isHighYield: false },
        ],
      },
      {
        name: "Algebra, Complex Numbers & Probability",
        weight: "10-12% Average Weight",
        chapters: [
          { name: "Matrices, Determinants & Cramers Rule", isHighYield: true },
          { name: "Complex Numbers & Geometric Transformations", isHighYield: true },
          { name: "Probability & Bayes' Theorem", isHighYield: true },
          { name: "Permutations & Combinations", isHighYield: false },
          { name: "Binomial Theorem & Series Summation", isHighYield: false },
        ],
      },
    ],
  },
};

export function SubjectsSection() {
  const [activeSubj, setActiveSubj] = useState<SubjectId>("physics");
  const current = subjectsData[activeSubj];
  const Icon = current.icon;

  return (
    <section id="subjects" className="relative py-24 sm:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Structural layout guides */}
      <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none">
        <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-[1px] bg-white/[0.04]" />
        <div className="absolute right-4 sm:right-8 top-0 bottom-0 w-[1px] bg-white/[0.04]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        
        {/* Section Header */}
        <div className="mb-14 sm:mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2B3342] bg-[#121722]/85 text-[#A4ADBB] font-mono text-[11px] uppercase tracking-wider mb-6">
            <Layers className="w-3.5 h-3.5 text-[#78A9FF]" />
            <span>Syllabus Taxonomy</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F5F7FB] leading-[1.08] mb-6">
            Three Subjects. 90 Chapters. <br />
            Zero Uncharted Ground.
          </h2>

          <p className="text-base sm:text-lg text-[#A4ADBB] font-normal leading-relaxed max-w-2xl">
            Select a subject below to inspect its core modules, official exam weightages, and high-yield chapters. 
            Drill down directly into the JEE Pro workspace.
          </p>
        </div>

        {/* High-Craft Interactive Subject Navigation Selector */}
        <div 
          role="tablist" 
          aria-label="Syllabus Subjects" 
          className="grid grid-cols-3 gap-2 sm:gap-4 p-1.5 rounded-xl bg-[#121722]/60 border border-[#2B3342] mb-8"
        >
          {(["physics", "chemistry", "mathematics"] as SubjectId[]).map((subjId) => {
            const subj = subjectsData[subjId];
            const SubjIcon = subj.icon;
            const isActive = activeSubj === subjId;

            return (
              <button
                key={subjId}
                type="button"
                role="tab"
                id={`tab-${subjId}`}
                aria-selected={isActive}
                aria-controls={`panel-${subjId}`}
                onClick={() => {
                  dispatchInteractionSound("ui.tab");
                  setActiveSubj(subjId);
                }}
                className={`py-3 sm:py-4 px-3 rounded-lg text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78A9FF] ${
                  isActive
                    ? "bg-[#171D28] border border-[#78A9FF]/30 text-[#F5F7FB] shadow-lg"
                    : "text-[#A4ADBB] hover:text-[#F5F7FB] hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <SubjIcon className={`w-4 h-4 ${isActive ? "text-[#78A9FF]" : "text-[#A4ADBB]"}`} />
                  <span className="font-bold text-sm sm:text-base tracking-tight">{subj.title}</span>
                </div>
                <div className="font-mono text-xs text-[#A4ADBB] hidden sm:block">
                  {subj.count} Chapters • {subj.title === "Mathematics" ? "33.4%" : "33.3%"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Detailed Syllabus Viewport */}
        <div 
          role="tabpanel"
          id={`panel-${current.id}`}
          aria-labelledby={`tab-${current.id}`}
          className="rounded-2xl sm:rounded-3xl bg-[#121722]/85 border border-[#2B3342] p-6 sm:p-10 shadow-2xl"
        >
          {/* Top Panel Overview */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-[#2B3342]">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-[#2B3342] flex items-center justify-center text-white">
                  <Icon className="w-4 h-4 text-[#78A9FF]" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#F5F7FB] tracking-tight">
                  {current.title} Taxonomy ({current.count} Chapters)
                </h3>
              </div>
              <p className="text-sm text-[#A4ADBB] leading-relaxed font-normal">
                {current.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <div className="px-3.5 py-2 rounded-xl bg-white/[0.02] border border-[#2B3342] text-left">
                <span className="block font-mono text-[10px] uppercase text-[#A4ADBB]">Total Coverage</span>
                <span className="font-mono text-sm font-bold text-[#F5F7FB]">{current.weightage}</span>
              </div>

              <Link
                href={current.workspaceHref}
                aria-label={`Open complete ${current.title} study workspace`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#78A9FF] text-[#0B0D12] font-bold text-xs hover:bg-[#A8C5FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78A9FF] shadow-[0_2px_12px_rgba(120,169,255,0.3)]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open {current.title} Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {current.modules.map((mod) => (
              <div
                key={mod.name}
                className="p-5 rounded-xl bg-white/[0.02] border border-[#2B3342] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2B3342]">
                    <h4 className="text-sm font-bold text-[#F5F7FB] tracking-tight">
                      {mod.name}
                    </h4>
                    <span className="font-mono text-[10px] text-[#A4ADBB] uppercase">
                      {mod.weight}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {mod.chapters.map((ch) => (
                      <li
                        key={ch.name}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white/[0.01]"
                      >
                        <span className="text-[#A4ADBB] truncate pr-2">{ch.name}</span>
                        {ch.isHighYield && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#78A9FF]/15 text-[#78A9FF] border border-[#78A9FF]/30 shrink-0 font-semibold">
                            High Yield
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 text-[11px] font-mono text-zinc-400">
                  {mod.chapters.length} Key Chapters Mapped
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
