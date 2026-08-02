# Design System

JEE Pro uses a heavily customized design system inspired by Apple, Linear, and modern SaaS.

## Tokens (Tailwind v4)

We use inline theme custom properties in `globals.css`:
- `--background`: `#000000`
- `--surface`: `#111111`
- `--card`: `#181818`
- `--border`: `#2A2A2A`
- `--accent`: `#3B82F6` (Blue)
- `--muted`: `#888888`
- `--foreground`: `#ffffff`

## Typography
- **Sans-serif**: `Geist`
- **Monospace**: `Geist Mono`

## Principles
1. **Dark Mode First**: The primary experience is dark mode.
2. **Minimalism**: No unnecessary borders or backgrounds.
3. **Animations**: Every animation must have a purpose. Default to spring physics.
4. **Consistency**: Use the `design-tokens.ts` for any JS-level styling calculations.
