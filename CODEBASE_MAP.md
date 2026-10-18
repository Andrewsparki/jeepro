# JEE Pro — Codebase Map & Module Navigation Guide

This document maps the repository's first-party code, explaining where features are implemented, which files are responsible for each system, and which files to modify for common development tasks.

---

## 1. Top-Level Directory Overview

```
c:\jee-pro\
├── app/                  # Next.js App Router: pages, layouts, and API endpoints
├── components/           # Reusable UI primitives, layout wrappers, and shared widgets
├── constants/            # Site metadata, static navigation links, animation defaults
├── features/             # Domain-driven feature modules (study, chat, admin, etc.)
├── hooks/                # Reusable React utility hooks (debounce, user, media query)
├── lib/                  # Core services, Supabase clients, fonts, sounds, helpers
├── providers/            # Root application context providers
├── public/               # Static assets: images, sounds, ambient background videos
├── supabase/             # Database migrations, schema definitions, seed scripts
├── types/                # TypeScript interfaces, database definitions, API types
├── AGENTS.md             # Guidelines and fast execution rules for AI coding agents
├── PROJECT_CONTEXT.md    # High-level architecture, database models, and workflows
└── CODEBASE_MAP.md       # This file: directory map and navigation index
```

---

## 2. Directory Index by Domain

### `app/` — Application Routes & Pages
- `page.tsx`: Public marketing home page (composed of marketing components).
- `layout.tsx`: Root HTML shell, fonts (`fontSans`, `fontMono`), metadata, and `<Providers>`.
- `globals.css`: Tailwind CSS v4 root stylesheet, Obsidian + Electric Blue design tokens (`--bg-primary: #0B0D12`, `--accent: #78A9FF`, `--accent-hover: #A8C5FF`, `--text-primary: #F5F7FB`, `--border: #2B3342`, `--success: #5DC98B`), and utility classes.
- `(auth)/`: Unauthenticated authentication flow pages (`/login`, `/signup`, `/forgot-password`, `/reset-password`).
- `(marketing)/`: Secondary public pages (`/about`, `/pricing`).
- `dashboard/`: Primary student workspace layout (`layout.tsx`), home page (`page.tsx`), and sub-routes (`study`, `syllabus`, `focus`, `analytics`, `leaderboard`, `achievements`, `friends`, `groups`, `chat`, `planner`, `settings`, `support`, `history`, `tests`).
- `admin/`: Administrative control center layout (`layout.tsx`) and sub-routes (`roles`, `users`, `analytics`, `notifications`, `audit-log`, `reports`, `support`, `system`, `whats-new`).
- `api/`: Backend Next.js Route Handlers:
  - `api/auth/callback/route.ts`: Supabase OAuth/email redirect callback.
  - `api/maintenance/route.ts`: Maintenance mode status endpoint.
  - `api/whats-new/route.ts`: Active release modal endpoint.
  - `api/analytics/track/route.ts`: Opt-in consented telemetry, session counting, and active engagement time tracking (excludes admin routes).
  - `api/admin/*`: Protected endpoints for administrative CRUD, RBAC role management, and stats.
- `maintenance/page.tsx`: Dedicated maintenance screen shown when the platform is locked.
- `suspended/page.tsx`: Access suspension notice shown to banned users.

---

### `features/` — Feature Modules

| Feature Directory | Primary Responsibilities | Key Files to Check |
|---|---|---|
| **`features/auth/`** | Auth state listener, session initialization, sign-in/sign-up forms | `components/auth-provider.tsx`, `components/auth-form.tsx` |
| **`features/dashboard/`** | Aspirant dashboard metrics, widgets, daily progress | `components/dashboard-content.tsx`, `context/dashboard-data-context.tsx` |
| **`features/study/`** | Core study workspace, chapter checklist, formulas, derivations | `components/workspace/*`, `services/progress.ts`, `services/study-session.ts` |
| **`features/syllabus/`** | 90-chapter syllabus taxonomy, subject trees, chapter pages | `components/subject-detail-view.tsx`, `services/syllabus.ts` |
| **`features/focus/`** | Deep Work Chamber, countdown timer, PiP mode, ambient audio | `components/focus-chamber.tsx`, `hooks/use-pip-timer.ts`, `store/focus-store.ts` |
| **`features/analytics/`** | Product intelligence, active engagement tracking, conversion funnels, cohort retention, error telemetry | `services/server-analytics.service.ts`, `services/telemetry.service.ts`, `components/analytics-tracker.tsx` |
| **`features/daily-missions/`** | Daily XP targets, streaks, completion verification | `services/missions.service.ts`, `components/missions-widget.tsx` |
| **`features/gamification/`** | XP animations, level-up modals, milestone sound triggers | `components/milestone-celebration.tsx`, `services/xp-service.ts` |
| **`features/leaderboard/`** | Global and friends XP rankings, streak filters | `components/leaderboard-table.tsx`, `hooks/use-leaderboard.ts` |
| **`features/achievements/`** | Badge unlocks, criteria checks, trophy showcase | `components/achievement-card.tsx`, `components/achievements-view.tsx`, `services/achievements.service.ts`, `services/achievements.server.ts` |
| **`features/chat/`** | Global chat room, private DMs, message reports, moderation | `components/chat-view.tsx`, `hooks/use-global-chat.ts`, `hooks/use-private-chat.ts` |
| **`features/friends/`** | Mutual friend requests, search, online presence | `components/friends-list.tsx`, `hooks/use-friends.ts` |
| **`features/groups/`** | Collaborative study groups, group chat, invites, member roles | `components/groups-dashboard.tsx`, `hooks/use-group-chat.ts` |
| **`features/notifications/`** | In-app notification bell, read states, Realtime broadcast | `context/notification-context.tsx`, `components/notifications-popover.tsx` |
| **`features/marketing/`** | Public landing page sections and marketing components | `components/hero-section.tsx`, `components/subjects-section.tsx`, `components/daily-ritual.tsx`, `components/focus-section.tsx`, `components/features-section.tsx`, `components/cta-section.tsx` |
| **`features/admin/`** | Admin center UI, user editing, audit log tables, broadcast forms | `components/admin-overview.tsx`, `components/user-management.tsx`, `services/admin-service.ts` |
| **`features/planner/`** | Study schedule calendar, event creation, revision reminders | `components/planner-workspace.tsx`, `services/planner-service.ts` |
| **`features/settings/`** | Dual-pane configuration hub: profile, appearance, performance & effects, study, sound & alerts, data & privacy, and platform info | `components/settings-layout.tsx`, `components/sections/*` |
| **`features/support/`** | Ticket creation, user issue reporting, status tracking | `components/support-portal.tsx`, `services/support-service.ts` |
| **`features/whats-new/`** | Update announcement modals, release notes, seen tracking | `components/whats-new-modal.tsx`, `services/whats-new-service.ts` |
| **`features/search/`** | Global `Cmd+K` command palette for instant navigation | `context/command-palette-context.tsx`, `components/command-palette.tsx` |
| **`features/break-room/`** | Hidden activity overlay triggered by typing `bored` | `context/break-room-context.tsx`, `components/break-room-modal.tsx` |
| **`features/concert-mode/`** | Secret immersive audiovisual concert mode featuring Web Audio API spectrum visualizer | `context/concert-mode-context.tsx`, `components/concert-modal.tsx`, `hooks/use-concert-audio.ts` |

---

### `components/` — Shared UI & Layout

- **`components/layout/`**:
  - `navbar.tsx`: Floating translucent pill header with smooth scroll section tracking.
  - `footer.tsx`: Standard footer with platform, syllabus, and legal links.
  - `ambient-background.tsx`: Atmospheric backdrop (`variant="default"` for authenticated video loop, `variant="obsidian"` for zero-video high-contrast landing canvas).
- **`components/ui/`**:
  - `dopamine-cta-button.tsx`: High-polish animated CTA button (`aurora`, `electric-white`, `neon-glass`).
  - `smooth-scroll-provider.tsx`: Hardware-accelerated Locomotive/Lenis momentum scroll engine.
  - `cinematic-preloader.tsx`: Session boot screen preloader with route guards (`AppBootGuard`).
  - `lighting-provider.tsx`: Subtle mouse cursor spotlight effects.
  - `math-renderer.tsx`: KaTeX math wrapper for formulas.
  - Radix UI wrappers: `dialog.tsx`, `sheet.tsx`, `dropdown-menu.tsx`, `popover.tsx`, `accordion.tsx`, `card.tsx`, `button.tsx`, `input.tsx`, `slider.tsx`, `checkbox.tsx`, `skeleton.tsx`, `sonner.tsx`.

---

### `lib/` — Core Utilities & Services

- `lib/supabase/`:
  - `client.ts`: Supabase browser client for client components.
  - `server.ts`: Supabase server client for Server Components and route handlers.
  - `admin.ts`: Supabase service-role client for privileged admin actions.
  - `middleware.ts`: Next.js middleware session validator, route guard, and redirector.
- `lib/sound-effects.ts` & `lib/sound-engine.ts`: Web Audio API procedural sound engine with volume and mute controls.
- `lib/performance-context.tsx`: Performance mode settings (`premium`, `balanced`, `battery-saver`).
- `lib/fonts.ts`: Font loader configuring Google Sans and Geist Mono.
- `lib/utils.ts`: Standard `cn()` utility combining `clsx` and `tailwind-merge`.
- `lib/validations.ts`: Zod validation schemas for forms and API requests.
- `lib/date-utils.ts`: Centralized Indian Standard Time (`Asia/Kolkata`) date, midnight boundary, and streak calculations.

---

## 3. Common Development Tasks & Where to Make Changes

| Task | Files Likely to Require Changes |
|---|---|
| **Add or update marketing landing page content** | `app/page.tsx`, `features/marketing/components/*` |
| **Add a new chapter or topic to the syllabus** | `features/syllabus/services/syllabus.ts`, `supabase/migrations/*`, `seed_syllabus.ts` |
| **Modify the study timer or Picture-in-Picture logic** | `features/focus/components/focus-chamber.tsx`, `features/focus/hooks/use-pip-timer.ts`, `features/focus/store/focus-store.ts` |
| **Add a new navigation link to the floating navbar** | `components/layout/navbar.tsx`, `constants/navigation.ts` |
| **Update authentication logic or user onboarding** | `features/auth/components/*`, `lib/supabase/middleware.ts`, `app/(auth)/*` |
| **Change theme colors, surface styles, or tokens** | `app/globals.css`, `providers/theme-provider.tsx` |
| **Add an admin tool or moderation capability** | `app/admin/*`, `features/admin/*`, `app/api/admin/*`, `supabase/migrations/*` |
| **Create a new database table or RLS policy** | `supabase/migrations/<new_migration>.sql`, `types/database.ts` |
| **Update sound effects or notification chimes** | `lib/sound-effects.ts`, `lib/sound-engine.ts`, `providers/settings-provider.tsx` |
