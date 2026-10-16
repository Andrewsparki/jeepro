<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# JEE Pro — Agent Guidelines & Fast Execution Mode

You are a permanent coding agent for **JEE Pro**. Follow these instructions to understand the codebase, work with high speed, and preserve architecture and reliability.

---

## 1. Documentation First: How to Navigate

Before reading large numbers of files, follow this order of discovery:
1. **`AGENTS.md`** (this document): Operational guidelines, coding rules, and validation commands.
2. **`PROJECT_CONTEXT.md`**: High-level application purpose, full tech stack, database schemas, and workflows.
3. **`CODEBASE_MAP.md`**: Detailed directory index, feature responsibilities, and where to make changes for specific tasks.

Never recursively inspect the entire workspace for routine, single-feature requests.

---

## 2. Fast Execution Mode: The 7 Core Rules

### Rule 1: Read the map, not the entire repository
- Use `CODEBASE_MAP.md` and symbol searches (`grep`, `find_by_name`, `Select-String`) to identify likely target files before opening them.
- Do not dump unnecessary files into your context window.

### Rule 2: Use targeted investigation
- Identify the exact feature, route, component, or behavior requested.
- Search for immediate imports and dependencies only.
- Confine edits to the smallest coherent set of files that fully achieves the goal.

### Rule 3: Act instead of endlessly analysing
- Once you understand what to change, implement it immediately.
- Do not produce intermediate multi-paragraph analysis summaries unless specifically asked.
- Ask questions only if an essential requirement cannot reasonably be inferred and an incorrect guess would cause material breakage.

### Rule 4: Optimize tool usage
- Batch related edits or checks where possible.
- Avoid running heavy production builds after every minor edit; run lightweight typechecks or targeted lints during development, and reserve full builds for final verification.

### Rule 5: Preserve functioning code
- Do not refactor working code merely to match personal style preferences.
- Preserve existing routing, database tables, RLS policies, sound engines, auth flows, and UI styling unless the user explicitly requested a redesign.

### Rule 6: Keep project knowledge current
- If a task adds new routes, tables, or architectural concepts, update `PROJECT_CONTEXT.md` and `CODEBASE_MAP.md` accordingly.
- Keep documentation factual, concise, and maintainable.

### Rule 7: Verify the result efficiently
- Always verify your work with real validation checks:
  1. `npm run typecheck` (`tsc --noEmit` — mandatory 0 errors).
  2. `npx eslint <changed_files>` (0 errors).
  3. `npm run build` (when changing routes, layouts, or build config).
- Report only checks that were genuinely executed.

---

## 3. Project Conventions & Standards

- **Next.js & React**: Next.js 16 (App Router) + React 19. All client components must start with `"use client";`. Avoid unnecessary `"use client"` on static layouts.
- **Tailwind CSS v4**: Theme tokens are CSS variables defined in `app/globals.css` (`--bg-primary`, `--glass`, etc.). Use Tailwind utility classes with hardware transforms (`transform-gpu`) for motion.
- **Icons & Typography**: Use `lucide-react` for icons. Use `font-sans` (`Google Sans`) and `font-mono` (`Geist Mono`) for technical/metadata tags.
- **Supabase**:
  - Browser/client: `lib/supabase/client.ts`
  - Server/routes: `lib/supabase/server.ts`
  - Admin/service-role: `lib/supabase/admin.ts`
  - Auth route guards: `lib/supabase/middleware.ts`
- **Math Rendering**: Wrap LaTeX formulas with `MathRenderer` (`components/ui/math-renderer.tsx`) using KaTeX.
- **Buttons & Interactions**: Reusable primary action buttons use `DopamineCTAButton` (`components/ui/dopamine-cta-button.tsx`) with variants `aurora`, `electric-white`, or `neon-glass`.
