# JEE Pro — Project Context & Architectural Knowledge Base

## 1. Project Purpose & High-Level Overview

**JEE Pro** is a high-performance, distraction-free study operating system engineered specifically for Indian engineering aspirants preparing for the **JEE Main** and **JEE Advanced** examinations.

Unlike conventional edtech apps that feature ad banners, algorithmically driven vanity feeds, or slow full-page roundtrips, JEE Pro is built around cognitive retention principles:
- **Comprehensive 90-Chapter Syllabus Hierarchy**: Physics (29 chapters), Chemistry (30 chapters), and Mathematics (31 chapters) mapped to official NTA and IIT Bombay weightings.
- **Spaced Repetition & Revision Schedules**: Automated 24h, 72h, 7d, and 21d active recall queues to prevent formula and concept decay.
- **Distraction-Free Focus Engine**: Flow sessions with a floating Picture-in-Picture (PiP) timer that stays on screen across browser tabs and PDF viewers, paired with 40Hz binaural acoustic soundscapes.
- **Realtime Community & Peer Accountability**: Global chat with moderation, end-to-end private direct messaging, study groups, friend activity presence, and competitive XP-based leaderboards.
- **Full Administrative Control Center**: User moderation (suspension, scoped muting), audit logging, real-time broadcast notifications, system settings (maintenance mode), and What's New release updates.

---

## 2. Technology Stack & Runtime Architecture

| Layer | Technologies & Libraries |
|---|---|
| **Framework** | **Next.js 16 (App Router)** with Turbopack compilation (`next: 16.2.12`, `react: 19.2.4`) |
| **Language & Typing** | **TypeScript 5** with strict null-checks and full type safety (`tsconfig.json`) |
| **Styling & Design Tokens** | **Tailwind CSS v4** (`@tailwindcss/postcss: ^4`, `@import "tailwindcss";`), CSS variables (`--bg-primary`, `--glass`, etc.) |
| **Animation & Motion** | **Framer Motion 12** (`framer-motion: ^12.43.0`), GPU-accelerated hardware transforms (`transform-gpu`) |
| **Smooth Scrolling** | **Locomotive Scroll v5** (Lenis-powered momentum engine) in `SmoothScrollProvider` |
| **Math Rendering** | **KaTeX** (`katex: ^0.16.8`, `react-katex: ^3.1.0`) with custom `MathRenderer` |
| **Database & Auth** | **Supabase** (`@supabase/ssr: ^0.12.4`, `@supabase/supabase-js: ^2.111.0`) with PostgreSQL, RLS policies, and Realtime WebSockets |
| **State Management** | **React Context** (modular providers) + **Zustand 5** (`features/focus/store/focus-store.ts`) |
| **Icons & Visuals** | **Lucide React** (`lucide-react: ^1.28.0`), custom SVGs, Google Sans Variable (`--font-google-sans`) & Geist Mono (`--font-geist-mono`) |

---

## 3. Application Routes & Directory Layout

### Public & Marketing
- `/` (`app/page.tsx`): Main public landing page. Editorial design with interactive platform preview, 3 preparation pillars, 3-subject taxonomy, daily ritual protocol, precision telemetry, feature capabilities, attention hygiene philosophy, and closing CTA.
- `/about` (`app/(marketing)/about/page.tsx`): Detailed product philosophy, mission, problem/solution, and preparation loop.
- `/pricing` (`app/(marketing)/pricing/page.tsx`): Pricing tiers, plans comparison, FAQ, and transparent free-access assurances.

### Authentication (`app/(auth)/*`)
- `/login` (`app/(auth)/login/page.tsx`): Email/password and OAuth sign-in with auto-redirect to `/dashboard` or safe `?next=`.
- `/signup` (`app/(auth)/signup/page.tsx`): Student registration and initial profile provisioning.
- `/forgot-password` (`app/(auth)/forgot-password/page.tsx`): Password recovery request.
- `/reset-password` (`app/(auth)/reset-password/page.tsx`): Auth token exchange and password update.
- `/api/auth/callback/route.ts`: Supabase OAuth / email verification callback handler.

### Authenticated Workspace (`app/dashboard/*`)
- `/dashboard` (`app/dashboard/page.tsx`): Aspirant intelligence center. Cold-start optimized with independent widget hydration, daily progress, XP metrics, revision cues, and recent study sessions.
- `/dashboard/study` & `/dashboard/study/[subject]` & `/[subject]/[chapterSlug]`: Core study console. Chapter concept checklists, formula memory anchors, revision history, and problem-solving logs.
- `/dashboard/syllabus` & `/[subject]/[chapterSlug]`: Full 90-chapter syllabus explorer.
- `/dashboard/focus`: Dedicated Deep Work Chamber with Pomodoro and flow modes, PiP floating timer, and ambient acoustic soundscapes.
- `/dashboard/analytics`: Comprehensive preparation telemetry, chapter completion velocity, accuracy distributions, and difficulty tiers.
- `/dashboard/planner`: Study calendar and event scheduler (`planner_events`).
- `/dashboard/leaderboard`: Global and friends leaderboard with XP and streak tracking.
- `/dashboard/achievements`: Gamification badge unlocks, milestones, and celebration triggers.
- `/dashboard/friends`: Friend request management, mutual friendships, and online presence.
- `/dashboard/groups`: Study group management, member rosters, invites, and group chats.
- `/dashboard/chat` & `/dashboard/chat/[userId]`: Direct private messaging with Realtime WebSockets.
- `/dashboard/history`: Historical study sessions log.
- `/dashboard/settings`: Account profile, target exam year, theme preferences, and sound effect toggles.
- `/dashboard/support`: Student support ticketing system (`support_tickets`).

### Standalone Routes
- `/chat` & `/chat/[userId]`: Alternative full-screen view for direct chats.
- `/friends`, `/groups`, `/groups/[groupId]`, `/leaderboard`, `/achievements`: Standalone views sharing dashboard components.
- `/maintenance` (`app/maintenance/page.tsx`): Displayed when `system_settings.maintenance_mode` is enabled (admins bypass automatically).
- `/suspended` (`app/suspended/page.tsx`): Displayed when user profile has `is_suspended = true`.

### Administrative Control Center (`app/admin/*`)
- `/admin` (`app/admin/page.tsx`): Admin KPI overview (total users, active sessions, system health).
- `/admin/analytics` (`app/admin/analytics/page.tsx`): Product intelligence dashboard with active engagement tracking, onboarding & study workflow funnels, cohort retention matrix, and client runtime error telemetry.
- `/admin/users` & `/admin/users/[id]`: User management (role assignment, suspensions, scoped chat muting, and audit-logged pseudonymous user telemetry insights).
- `/admin/notifications`: Broadcast system announcements and targeted user alerts.
- `/admin/audit-log`: Security audit trail of administrative actions (`audit_logs`).
- `/admin/reports`: User chat report queue and moderation actions (`chat_reports`).
- `/admin/system`: Maintenance mode toggle, system environment status, and configuration.
- `/admin/whats-new`: Creation and release of platform update modals (`app_updates`).

---

## 4. Backend Architecture & Supabase Integration

### Supabase Client Types (`lib/supabase/*`)
1. **Browser Client** (`lib/supabase/client.ts`):
   - Created with `createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)`.
   - Used inside client components, hooks, and Realtime channels.
2. **Server Client** (`lib/supabase/server.ts`):
   - Created with `createServerClient` reading cookies via `next/headers`.
   - Used inside Server Components and API route handlers (`app/api/*`).
3. **Admin Client** (`lib/supabase/admin.ts`):
   - Created with `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` bypassing RLS.
   - Strictly reserved for privileged server-side actions (e.g., admin API endpoints).
4. **Middleware Client** (`lib/supabase/middleware.ts`):
   - Handles cookie refresh, maintenance mode bypass, session validation, route protection, and admin authorization.

### Database Tables Summary

| Domain | Tables |
|---|---|
| **Syllabus & Progress** | `subjects`, `chapters`, `topics`, `progress`, `user_topic_progress`, `daily_progress`, `user_resume_state`, `study_sessions`, `formulas`, `user_notes`, `user_bookmarks` |
| **Gamification & Habits** | `daily_missions`, `planner_events`, `xp_history`, `achievements`, `user_achievements` |
| **Social & Messaging** | `profiles`, `friendships`, `chat_messages`, `chat_reports`, `conversations`, `conversation_participants`, `private_messages`, `groups`, `group_members`, `group_invites`, `group_messages` |
| **Platform & Admin** | `system_settings`, `notifications`, `audit_logs`, `support_tickets`, `user_moderation_scopes`, `app_updates`, `user_app_update_reads` |

---

## 5. Global Providers & Execution Hierarchy

Mounted in [`providers/index.tsx`](file:///c:/jee-pro/providers/index.tsx) at the root layout:

```tsx
<ThemeProvider>              {/* Theme switching: midnight, amoled, titanium */}
  <SettingsProvider>         {/* User preferences & Web Audio sound effects */}
    <PerformanceProvider>    {/* Performance modes: premium, balanced, battery-saver */}
      <AppBootSequenceProvider>
        <AuthProvider>       {/* Supabase user session, profile, and auth listener */}
          <BirthdayModeProvider>
            <BirthdayCheckGuard />
            <LightingProvider>
              <DialogProvider>
                <ContextMenuProvider>
                  <BackgroundSystem />
                  <SmoothScrollProvider>
                    <AppBootGuard>
                      <SectionTransitionBridge>
                        {children}
                      </SectionTransitionBridge>
                    </AppBootGuard>
                  </SmoothScrollProvider>
                  <Toaster position="bottom-right" />
                </ContextMenuProvider>
              </DialogProvider>
            </LightingProvider>
          </BirthdayModeProvider>
        </AuthProvider>
      </AppBootSequenceProvider>
    </PerformanceProvider>
  </SettingsProvider>
</ThemeProvider>
```

---

## 6. Development & Validation Commands

- **Development Server**: `npm run dev` (starts on `http://localhost:3000`)
- **Production Build**: `npm run build` (Turbopack production build and static prerendering)
- **Production Start**: `npm start` (runs built production server)
- **TypeScript Typecheck**: `npm run typecheck` (`tsc --noEmit` — must exit with code 0)
- **ESLint Linting**: `npm run lint` (`eslint .` or `npx eslint <path>` for targeted checks)
- **Full Verification Check**: `npm run check` (`npm run typecheck && npm run build`)

---

## 7. Brand Identity & Design System Tokens (Obsidian + Electric Blue)

The JEE Pro interface is anchored around an intentional, focus-first palette:

| Token | Hex / Value | Usage & Rules |
|---|---|---|
| **Obsidian Base** | `#0B0D12` | Global root background (`--bg-primary`). Deep, rich carbon-tinted black. |
| **Elevated Surface** | `#121722` | Primary cards, panels, sidebars (`--bg-secondary`). |
| **Secondary Surface** | `#171D28` | Hovered items, input containers, tertiary cards (`--bg-elevated`). |
| **Electric Blue** | `#78A9FF` | Primary accent (`--accent`). Reserved for primary CTAs, active status, high-yield badges, and focused UI elements. |
| **Accent Hover** | `#A8C5FF` | Hover and active interactive states (`--accent-hover`). |
| **Warm White** | `#F5F7FB` | Primary typography (`--text-primary`). High legibility against obsidian. |
| **Secondary Slate** | `#A4ADBB` | Secondary typography & metadata (`--text-secondary`). |
| **Hairline Border** | `#2B3342` | Subtle borders, dividers, card boundaries (`--glass-border`). |
| **Success** | `#5DC98B` | Positive outcomes, completed tasks, mastered topics, green streak indicators. Strictly reserved for success states. |
| **Warning** | `#F1BE62` | Warnings, intermediate states, revision cues. |
| **Error** | `#F17C7C` | Errors, destructive actions, overdue alerts. |

---

## 8. Quality & Performance Verification Baselines

All engineering work is validated against verified baselines:
- **TypeScript**: Strict typechecking via `npm run typecheck` (`tsc --noEmit`) with **0 errors**.
- **ESLint**: Next.js + React 19 rules via `npm run lint` with **0 errors, 0 warnings**.
- **Production Build**: Turbopack production compilation (`npm run build`) in **15.9s** with **49/49 static and dynamic routes** prerendered cleanly.
- **Image Optimization**: All user avatars and release illustrations utilize Next.js `<Image />` components with responsive sizing.
- **Audio Engine**: Procedural Web Audio API sound engine (`lib/sound-engine.ts`) with user volume control and global mute toggle.

---

## 9. Study Session & Time-Tracking System Architecture

JEE Pro enforces a unified, idempotent time-tracking and mission progress pipeline across all timers:
- **Centralized IST Calendar Attribution**: Indian Standard Time (`Asia/Kolkata`) is enforced across all daily metrics, streaks, and missions using [`lib/date-utils.ts`](file:///c:/jee-pro/lib/date-utils.ts) (`getLocalISTDateString`). Prevents midnight UTC date boundary splits.
- **Dual Timer Sources**: Both the workspace study timer ([`StudySessionProvider`](file:///c:/jee-pro/features/study/context/study-session-context.tsx)) and the dedicated Focus chamber timer ([`FocusPage`](file:///c:/jee-pro/app/dashboard/focus/page.tsx)) persist active durations via [`SessionService.endSession()`](file:///c:/jee-pro/features/study-engine/services/session.service.ts).
- **Pomodoro Cycle Auto-Save**: In Pomodoro mode, completed study blocks are automatically persisted upon timer completion so progress is never lost even if the student closes the tab before clicking "End Session".
- **Strict Break Isolation**: Break phases (`shortBreak`, `longBreak`) and paused durations are strictly excluded from study accumulation (`phase === "study"` guard).
- **Authoritative Daily Mission Reconciliation**: Missions auto-generate on first session if not already created, and reconcile baseline progress against recorded sessions from `study_sessions`.
- **Idempotency & Deduplication**: Database RPC `end_study_session_transaction` (Migration `032`) ensures identical session windows cannot be inserted twice or double-award XP.



