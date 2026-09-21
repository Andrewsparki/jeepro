# Jee Pro

A Next.js application for a study platform and learning dashboard.

## Prerequisites

- Node.js 20+
- npm
- A Supabase project with environment variables configured

## Local setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your Supabase credentials.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

## Useful commands

```bash
npm run dev
npm run dev:host
npm run build
npm run lint
npm run typecheck
npm run check
```

## CI

This repo includes a basic GitHub Actions workflow for type-checking and production builds.

## Notes

- The Next.js build currently succeeds, but lint still reports existing React hook violations and a handful of no-explicit-any issues. These should be addressed incrementally while extending the app.
- The workspace is now set up with a ready baseline for additional feature work.
