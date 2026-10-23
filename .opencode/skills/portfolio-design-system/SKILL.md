---
name: portfolio-design-system
description: Design and engineering rules for Shaik Aakif's light-first portfolio, covering tokens, responsive layout, Motion, restrained React Three Fiber, accessibility, and performance. Use when building or reviewing portfolio UI.
license: MIT
compatibility: opencode
metadata:
  audience: frontend-engineers
  project: my-portfolio
  source-of-truth: SHAIK_AAKIF_DATA.md
  opencode/slash: "true"
  opencode/autoinvoke: "false"
---

# Portfolio Design System Skill

## What I do

Provide the project-specific design and implementation contract for this portfolio:

- Light-first "Editorial Signal" visual system with semantic tokens.
- Mobile-first responsive rules and 48px controls.
- Motion for React orchestration with reduced-motion support.
- One restrained React Three Fiber hero scene with progressive fallbacks.
- Apple HIG-inspired interaction and accessibility.
- Static-first, database-free architecture and performance budgets.

## When to use me

Use this skill when writing, reviewing, or refactoring any portfolio UI, design token, animation, 3D scene, metadata, or responsive layout.

Do not use it to invent content. Profile, project, achievement, and link content must come from `SHAIK_AAKIF_DATA.md`.

## Source of truth and honesty

- Read `SHAIK_AAKIF_DATA.md` before writing content.
- Never invent projects, metrics, testimonials, clients, employment, awards, or screenshots.
- Use the data file's real project URLs, GitHub links, stack, problem, and solution.
- If a value is missing, use an honest empty state or ask the owner.
- Do not present self-reported metrics as independently verified.

## Visual contract

### Light tokens

- `--background: #F7F6F2`
- `--surface: #FFFFFF`
- `--surface-muted: #EFEEE9`
- `--foreground: #0A0A0B`
- `--muted-foreground: #52525B`
- `--subtle-foreground: #71717A` (large/decorative only)
- `--accent: #1D4ED8`
- `--accent-soft: #E8EEFF`
- `--sky: #38BDF8` (decorative only)
- `--success: #047857`
- `--border: rgba(10,10,11,0.10)`
- `--border-strong: rgba(10,10,11,0.20)`
- `--ring: #1D4ED8`

Dark mode is optional. If enabled, reuse the data file's dark palette: `#09090B`, `#121215`, `#FAFAFA`, `#A1A1AA`, `#38BDF8`.

### Typography

- Display: Outfit.
- Body: Inter.
- Metadata: JetBrains Mono.
- Maximum three families. No weights below 400. Body 16px+. Max measure 68ch.

### Layout and controls

- Mobile-first. Test 320, 375, 390, 768, 1024, 1280, 1440, 1920.
- 48px preferred control height; 44px minimum target.
- 4/8px spacing grid. One card radius, one control radius.
- Hairline borders over heavy shadows. Glass only for floating functional layers.
- No horizontal body overflow. The project rail is the only intentional horizontal scroller.

## Motion contract

- Use `motion` and import from `motion/react`.
- Wrap the app in `<MotionConfig reducedMotion="user">`.
- Use `useReducedMotion()` for bespoke transform-to-opacity substitutions.
- Animate transform/opacity; avoid layout properties in loops.
- `whileInView` with `once: true`; stagger 40-60ms.
- No autoplay, parallax, scroll hijacking, or infinite decoration.
- Replace movement with fades under reduced motion.

## 3D contract

- One hero scene only: "Signal Core".
- R3F 9 + React 19 + three. Procedural geometry; no external models, HDRs, or textures.
- `< 30` draw calls target, `< 50` ceiling; `< 50k` triangles target, `< 100k` ceiling.
- `dpr={[1, 1.5]}`, `frameloop="demand"`, `performance={{ min: 0.5 }}`.
- No shadows, post-processing, transmission, or reflections.
- Lazy load after the hero text; headline is the LCP element.
- Fallback to a designed poster for reduced motion, save-data, low memory/CPU, no WebGL, or context loss.
- Pause offscreen and when the document is hidden.
- Canvas is `aria-hidden` when atmospheric; provide a DOM control and text description for the interaction.

## Accessibility contract

- WCAG 2.2 AA: 4.5:1 body text, 3:1 large text/UI.
- Visible 2px focus ring with offset; never remove focus outlines.
- Full keyboard access; Escape closes dialogs; focus returns to trigger.
- Mobile nav and project details use native `<dialog>` or an equally accessible primitive.
- Carousel: labeled region, slide groups, Prev/Next, index announcement, arrow/Home/End keys, no autoplay.
- Support 200% text zoom, 320px reflow, reduced motion, reduced transparency, forced colors.
- Status never conveyed by color alone.

## Performance contract

- Static export; no database, no CMS, no runtime API.
- Self-host fonts with `next/font`, subset Latin, `display: swap`.
- Pre-optimize images; no large hero image.
- Initial JS target `<= 170KB` gzip excluding the lazy 3D chunk; 3D chunk `<= 200KB` gzip.
- LCP `<= 2.0s`, INP `<= 200ms`, CLS `<= 0.05` on a mid-tier mobile profile.
- Lighthouse mobile: Performance `>= 90`, Accessibility/SEO/Best Practices `100`.
- No third-party analytics or cookies by default.

## Workflow

1. Read the relevant existing files and `SHAIK_AAKIF_DATA.md`.
2. Identify the smallest additive change.
3. Use semantic tokens and existing components; no raw hex or magic spacing.
4. Implement all relevant states: loading, empty, error, settled.
5. Verify with lint, typecheck, build, Playwright matrix, axe, and console checks.
6. Do not install a dependency, initialize Git, push, or deploy without owner approval.

## Verification commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e
npm run audit:a11y
npm run audit:links
```

## Anti-patterns

- Dark-first tokens in a light-first brief.
- Glassmorphism everywhere.
- Neon/cyberpunk styling.
- Fake project screenshots or metrics.
- Scroll hijacking.
- Autoplay carousels.
- Heavy 3D on every route.
- Multiple WebGL canvases.
- Tiny controls or hover-only actions.
- `transition-all` and layout-thrashing animation.
- Unapproved dependencies or secret keys in client code.

## References

- `SHAIK_AAKIF_DATA.md`
- `.cursor/rules/responsive-design.mdc`
- `.cursor/rules/motion-design.mdc`
- `.cursor/rules/3d-web-design.mdc`
- `.cursor/rules/visual-design-system.mdc`
- `.cursor/rules/apple-inspired-ux.mdc`
- `PORTFOLIO_IMPLEMENTATION_PLAN.md`
