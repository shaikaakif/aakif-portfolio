# Portfolio Implementation Plan

**Project:** `C:\Users\HP\Desktop\my-portfolio`  
**Mission:** Research, audit, design intelligence, architecture, and phased plan. No full implementation, dependency install, Git init, or deployment in this mission.  
**Date:** 23 October 2026

---

## 1. Audit: What Was Inspected

### 1.1 Directory state

The folder is effectively empty of implementation. It contains four project files and one tool config:

| File | Size | Role |
|---|---:|---|
| `AI_ENGINEERING_CONSTITUTION.md` | 7,031 B | Mandatory engineering rules; read completely (370 lines). |
| `MASTER_AI_ENGINEERING_SOP.md` | 17,148 B | Mandatory SOP v2.0; read completely (257 lines). |
| `SHAIK_AAKIF_DATA.md` | 37,840 B | Portfolio source of truth; read completely (865 lines). |
| `opencode.json` | 416 B | Local LM Studio provider config. Left untouched. |

There is **no** `package.json`, lockfile, `node_modules`, `src/`, `public/`, asset folder, README, Next config, Tailwind config, or existing implementation.

### 1.2 Git state

- No `.git` directory.
- No repository, commits, branches, or remotes.
- No Git operation was performed. Nothing was initialized, staged, committed, pushed, or deployed.

### 1.3 Environment

| Tool | Verified state |
|---|---|
| OS shell | Windows PowerShell 5.1 (win32) |
| Node.js | `v22.14.0` |
| npm | `10.9.2` |
| npx | `10.9.2` |
| Bun | `1.2.8` |
| pnpm | Not installed |
| Yarn | Not installed |
| Git | `2.51.0.windows.1` |
| Global CLIs | `@capacitor/cli`, `ngrok`, `opencode-ai`, `pm2`, `vercel` |

Next.js 16.4.3 declares `node >=20.9.0`, so the installed Node version qualifies.

### 1.4 Skills and agent support

- OpenCode's official Agent Skills docs were inspected. Project skills belong at `.opencode/skills/<name>/SKILL.md` and require `name` + `description` frontmatter.
- The global OpenCode config has no `skills/` directory.
- The built-in `customize-opencode` skill exists, but no portfolio-specific skill existed.
- A project skill was created at `.opencode/skills/portfolio-design-system/SKILL.md`. It is **not claimed to be active in this session**; newly created skills are discovered on a new session/restart.

### 1.5 Filename discrepancy

The mission names `SHAIK_AAKIF_` and `DATA.md` as separate files. The actual folder contains one combined file, `SHAIK_AAKIF_DATA.md`. No required content appears to be missing, so work proceeded against the combined file. The separate filenames do not exist.

### 1.6 Missing assets

The data file references assets that are not present:

- `public/images/shaik_aakif_portrait.jpg`
- `public/resume.pdf`
- `public/favicon.ico`
- `public/icon.png`
- `public/icon.svg`
- `public/apple-touch-icon.png`

These are **blockers for final release**, not for the initial scaffold. Project screenshots are also absent; no screenshots may be invented.

### 1.7 Conflicts between vision and engineering documents

| # | Conflict | Resolution proposed |
|---|---|---|
| C1 | Vision says **light-theme-first**. Data design tokens are dark-first (`#050507`, `#09090B`, "Deep dark mode"). | Treat this mission's explicit light-first instruction as the approved override, add new light tokens, and keep the data's dark palette as an optional dark theme. Requires approval. |
| C2 | Vision wants distinctive type; data fixes Outfit/Inter/JetBrains Mono. | Keep the data typography to protect brand consistency; create distinction through layout, color, and the 3D interaction. Optional serif display font only with approval. |
| C3 | "Minimal unnecessary vertical scrolling" vs 11 projects, skills, journey, achievements, contact. | Home stays compact (hero, work rail, capabilities, contact) with a horizontal project rail. About, full work index, and project details live on separate static routes. No scroll hijacking. |
| C4 | SOP Law 8 requires explicit approval before adding dependencies. | No dependencies installed. The proposed list below is a gate item, not an action taken. |
| C5 | Constitution bans fake data; data includes strong metrics (94% retention, 4KB, 40%, <300ms, 10x). | Use them only as the owner's reported project outcomes, not independently verified claims. Recommend omitting unprovable metrics until the owner confirms evidence. |
| C6 | Data has inconsistent counts: "11+", "13+", "10 live", 1 case study. | Home rail uses the 11 numbered main projects. The 3 about-page extras are "More experiments". The 2 doc-only projects are pending owner confirmation. Never claim a count that is not displayed. |
| C7 | Data says `Featured: Yes` for all 11 projects. | Do not fabricate a ranking. Show all 11 with category/status; optionally order by narrative fit, clearly not as a quality ranking. |
| C8 | Contact form vs static-first/no database. | No form in v1. Use `mailto:` compose + copy email + LinkedIn. A form would add a third-party service or serverless function and spam risk. |
| C9 | Static export vs `next/image` optimization. | Use `output: "export"` and pre-optimize images with `sharp` at build time, or deploy static-prerendered Next on Vercel without server functions. Choose one at M1. |
| C10 | Data's SEO base is `https://shaik-aakif.vercel.app`; current hosting target is undecided. | Keep as canonical until a custom domain is approved; centralize in `src/content/seo.ts`. |

---

## 2. Official Design Research

All sources below were actually accessed on 23 October 2026. Repository READMEs and official docs were preferred.

| Source | Verified findings | Implementation consequence |
|---|---|---|
| **Tailwind CSS** (`tailwindcss@4.3.3`) | Utility-first styling; CSS-first `@theme`; mobile-first breakpoints `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem; container queries; arbitrary values are an escape hatch. | Use Tailwind v4 with CSS variables and `@theme`; avoid a large JS config; no arbitrary values outside documented exceptions. |
| **Motion** (`motion@14.6.0`) | React package is `motion/react`; hybrid engine uses Web Animations/ScrollTimeline with JS fallback; `MotionConfig reducedMotion="user"`; `useReducedMotion`; `whileInView`; layout animations; `AnimatePresence`; gestures. | Use Motion for orchestration and micro-interactions; global reduced-motion config; transform/opacity only; no scroll hijacking. |
| **React Three Fiber** (`@react-three/fiber@9.8.2`) | React renderer for three.js; R3F 9 pairs with React 19 (`>=19 <19.4`), three `>=0.156`; `frameloop="demand"` + `invalidate()`; reuse geometry/materials; instancing; `PerformanceMonitor`; DPR/quality regression; draw-call guidance (max ~1000, optimally a few hundred or fewer). | Use R3F 9.8.2 + three 0.186.1 + React 19.3.1; one procedural scene; on-demand rendering; stricter internal budget of <30 draw calls. |
| **shadcn/ui** | "Not a component library"; open code, composition, distribution, CSS-variable theming, semantic token pairs, radius scale. | Adopt semantic token naming and composable component discipline. Do **not** install the full CLI/runtime for a small portfolio; native `<dialog>` + custom primitives are enough. |
| **Apple HIG** | Principles: purpose, agency, responsibility, familiarity, flexibility, simplicity, craft, delight. Accessibility: 4.5:1 text contrast, 44x44pt default iOS controls, spacing between controls, 200% text, avoid fast/blinking animation. Layout: visual hierarchy, progressive disclosure, safe areas. Typography: few typefaces, avoid light weights, minimum sizes, Dynamic Type. Materials: Liquid Glass only for functional floating layers, sparingly. | 48px controls, visible focus, native semantics, reduced motion/transparency, glass only on nav/sheets, no decorative blur on content. |
| **applecn** (optional reference) | MIT; Apple HIG translated into shadcn/Base UI/Hugeicons; tokens as data; CSS-driven dark mode, Increase Contrast, Reduce Transparency, Dynamic Type; 64 components; axe tests; ships no Apple fonts. | Extract principles only: measured tokens, CSS-driven accessibility states, test discipline. Do not copy code, components, or visual identity. |
| **OpenCode Agent Skills** | Project path `.opencode/skills/<name>/SKILL.md`; frontmatter requires `name` and `description`; optional `license`, `compatibility`, `metadata`; name must match directory and be lowercase/hyphenated. | Project skill created and validated structurally. |

### Verified package versions

From `npm view <package> version` on 23 Oct 2026:

| Package | Latest verified |
|---|---:|
| `next` | 16.4.3 |
| `react` / `react-dom` | 19.3.1 |
| `tailwindcss` / `@tailwindcss/postcss` | 4.3.3 |
| `motion` | 14.6.0 |
| `three` | 0.186.1 |
| `@react-three/fiber` | 9.8.2 |
| `@react-three/drei` | 10.7.9 |
| `lucide-react` | 1.61.0 |
| `typescript` | 7.0.2 |
| `eslint` | 10.13.0 |
| `eslint-config-next` | 16.4.3 |
| `@playwright/test` | 1.64.1 |
| `vitest` | 5.0.5 |
| `@axe-core/playwright` | 4.14.0 |

**Unverified until M1:** TypeScript 7.0.2 and ESLint 10.13.0 compatibility with the Next 16 toolchain. Pin only after `build`/`lint` pass; fall back to the compatible major the scaffold verifies. Do not ship unverified version assumptions.

**Not verified in this mission:** live project URLs, remote asset availability, browser behavior, build success, Lighthouse scores, 3D frame rate, and whether the reported project metrics are accurate. No claims are made about those.

---

## 3. Reusable Design Intelligence

Created in `.cursor/rules/` with valid Cursor MDC frontmatter:

| File | Application scope | Purpose |
|---|---|---|
| `responsive-design.mdc` | Source TS/TSX/CSS files | Mobile-first layout, breakpoints, overflow, touch targets, reflow, carousel/nav behavior. |
| `motion-design.mdc` | TS/TSX files | Motion API, tokens, reduced motion, performance, anti-patterns. |
| `3d-web-design.mdc` | `src/components/three/**` and 3D-named files | R3F scene budget, lazy loading, fallbacks, accessibility, GPU constraints. |
| `visual-design-system.mdc` | `alwaysApply: true` | Light-first tokens, typography, spacing, radii, component and anti-pattern rules. |
| `apple-inspired-ux.mdc` | TS/TSX/CSS files | HIG principles, materials, input, navigation, feedback, content honesty. |

Each rule contains design principles, verified APIs, accessibility requirements, performance constraints, anti-patterns, and official documentation URLs.

**Agent skill created:** `.opencode/skills/portfolio-design-system/SKILL.md` with `name`, `description`, `license`, `compatibility`, and `metadata`. It encodes the same contract in a format OpenCode can load. It is not claimed to be activated in this session.

---

## 4. Recommended Architecture

### 4.1 Decision

**Next.js 16 App Router + React 19 + TypeScript strict + Tailwind CSS v4 + Motion + React Three Fiber, statically exported.**

Why:

- Static generation gives HTML per route, good SEO, and hosting portability.
- Next provides metadata, `generateStaticParams`, `next/font`, and image conventions.
- The portfolio has no persistent server data; a database is unnecessary.
- A single-page React/Vite build would require custom prerendering for project detail SEO.
- Astro would be lighter but adds a second UI model around the React/R3F hero and Motion interactions.

**Export strategy:** `output: "export"` with static `out/`. Pre-optimize the portrait/resume preview with `sharp`; use `next/image` with `unoptimized` or plain responsive `<img>` with explicit dimensions. If owner prefers Vercel's image optimizer, deploy Next statically on Vercel with no server functions. Choose at M1.

### 4.2 Routes and content model

```text
src/
  app/
    layout.tsx                 # fonts, metadata, MotionConfig, skip link
    page.tsx                   # hero, work rail, capabilities, contact
    globals.css                # Tailwind import + semantic tokens
    about/page.tsx             # story, timeline, achievements, AI team model
    work/page.tsx              # accessible full project index
    work/[slug]/page.tsx       # static project detail pages
    not-found.tsx
    sitemap.ts
    robots.ts
  components/
    layout/                    # header, mobile nav, footer, skip link
    sections/                  # hero, work rail, capabilities, journey, contact
    work/                      # project card, rail, detail blocks
    three/                     # SignalCore, poster fallback
    ui/                        # button, dialog/sheet, tag, icon
  content/
    profile.ts
    projects.ts
    skills.ts
    timeline.ts
    achievements.ts
    seo.ts
    types.ts
  lib/
    cn.ts
    format.ts
  public/
    images/                    # owner-supplied portrait, optimized variants
    resume.pdf
    favicon.ico, icon.png, icon.svg, apple-touch-icon.png
```

Content is transcribed into typed TS from `SHAIK_AAKIF_DATA.md`. No Markdown parser, CMS, or runtime fetch is needed. A `scripts/check-content.ts` will validate unique slugs, required fields, URL shapes, and project counts at build time.

### 4.3 Dependency proposal (requires approval)

**Core runtime (6):**

- `next@16.4.3`
- `react@19.3.1`
- `react-dom@19.3.1`
- `motion@14.6.0`
- `three@0.186.1`
- `@react-three/fiber@9.8.2`

**Optional runtime (1, choose one):**

- `lucide-react@1.61.0` for the 10 data-defined icons, or a hand-built inline SVG icon set to avoid the dependency.

**Explicitly not used in v1:**

- `@react-three/drei` (implement the small amount needed directly)
- shadcn CLI/runtime, Radix, Embla
- Framer Motion legacy package
- Database, ORM, CMS, analytics, auth, form service

**Dev tooling (provisional until M1):**

- `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `@types/three`
- `eslint`, `eslint-config-next`
- `@playwright/test`, `@axe-core/playwright`
- `vitest` for pure logic/data checks
- `sharp` for one-time asset optimization

No dependency has been installed. SOP Law 8 requires explicit owner approval and a stated size impact before installation.

### 4.4 Design tokens and typography

- Tailwind v4 `@theme` maps semantic CSS variables to utilities.
- Light-first tokens: porcelain background, white surfaces, near-black ink, cobalt action, hairline borders.
- Dark theme optional, using the data file's existing dark palette.
- Fonts self-hosted with `next/font`: Outfit (display), Inter (body), JetBrains Mono (metadata). Latin subset, `display: swap`.
- Fluid type scale with `clamp()`; body 16px+; max measure 68ch.
- All spacing, radii, shadows, and z-index values tokenized.

### 4.5 Responsive navigation

- Sticky top bar with wordmark, three links, availability chip, and a resume/contact CTA.
- Mobile: 48px menu trigger; native `<dialog>` sheet with focus trap, ESC, scroll lock, focus restoration.
- Desktop: inline nav with active-section indication; skip link first in DOM.
- Reduced transparency: solid nav background.
- No scroll-hiding nav, no custom scroll gestures.

### 4.6 Hero and restrained 3D

**Concept: "Signal Core"** - a polished low-poly ceramic/obsidian form orbited by a thin cobalt ring and five small fragments, representing one product vision coordinated with an AI team.

- One meaningful interaction: pointer/touch rotates the core; a visible "Focus the core" button (and keyboard equivalent) snaps the ring into alignment and changes a short caption. The effect is explanatory, not decorative.
- The headline is the LCP element; the canvas never blocks text.
- Lazy-load R3F after main content via `next/dynamic` (`ssr: false`) and intersection/idle scheduling.
- Static designed SVG/CSS poster for reduced motion, save-data, low memory/CPU, no WebGL, or context loss.
- Pause offscreen/hidden tab. Dispose geometry, materials, renderer, listeners, and observers.
- No external model, HDR, texture, shadow, or post-processing.

### 4.7 Horizontal projects section

- Native horizontal scroller with `scroll-snap-type: x mandatory`.
- One card plus peek on mobile, two plus peek on tablet, 2.5-3 on desktop.
- Cards: index, category, status, title, tagline, stack, owner-reported metric (if approved), primary link.
- Controls: Prev/Next, textual "Project 3 of 11", progress bar.
- Keyboard: Left/Right, Home/End; focus moves to the next card and scrolls it into view.
- Touch: native pan; no custom drag library.
- No autoplay. Reduced motion disables smooth scrolling.
- Every card remains in the DOM and keyboard reachable.
- CSS/typographic artwork by default; owner-supplied screenshots only, never generated fake screenshots.

### 4.8 Project detail presentation

- Static `/work/[slug]` pages generated with `generateStaticParams`.
- Sections: title, tagline, status, problem, solution, stack, links, optional architecture notes where the data provides them.
- No invented outcomes. Metrics are shown as "Reported outcome" only if approved.
- "More experiments" for the 3 extra projects; doc-only projects remain pending confirmation.
- `/work` index is the accessible, no-JavaScript listing of all displayed projects.

### 4.9 Skills and technical narrative

- Six focus domains from the data, presented as a compact 2x3 grid with one-line descriptions.
- Capability matrix (Product/UX, Frontend, Backend/Cloud, AI Orchestration) from the data.
- Stack groups with honest labels; no proficiency percentages.
- AI team operating model as a small, readable diagram/table (ChatGPT, Claude, Gemini, Antigravity).
- Timeline and achievements on `/about`, not crammed into the home hero.

### 4.10 Contact strategy

- No backend and no database.
- Primary: `mailto:aakifshaik512@gmail.com` and Gmail compose link from the data.
- Secondary: LinkedIn, GitHub, Instagram, resume PDF.
- Copy-email button with a clear success state and accessible live announcement.
- No contact form in v1. If later required: Formspree/Web3Forms (external, privacy/cost) or a serverless Resend route (breaks pure static export or requires a host function). Both need approval.

### 4.11 Metadata, SEO, social

- Next Metadata API with the data's title template, description, keywords, canonical, OG, Twitter card.
- `sitemap.ts` and `robots.ts`.
- JSON-LD `ProfilePage`/`Person` from the data; no invented credentials.
- Static 1200x630 OG image from the owner's portrait or a branded typographic card (asset pending).
- Project pages get unique titles/descriptions from real content.
- Semantic headings, one `h1` per page, descriptive link text, image alt text.
- Canonical base stays `https://shaik-aakif.vercel.app` until a domain is approved.

### 4.12 Performance budgets

| Metric | Budget |
|---|---|
| Initial JS (gzip, excluding 3D) | <= 170 KB |
| Lazy 3D chunk (gzip) | <= 200 KB |
| Total JS after 3D load | <= 350 KB |
| CSS (gzip) | <= 30 KB |
| Fonts | <= 120 KB total, Latin subset |
| LCP (mid-tier mobile) | <= 2.0 s |
| INP | <= 200 ms |
| CLS | <= 0.05 |
| Lighthouse mobile | Performance >= 90; A11y/SEO/Best Practices 100 |
| 3D | 45+ fps mid-tier; 30+ fps low-tier; <30 draw calls |

Techniques: static export, self-hosted fonts, pre-optimized images, lazy 3D, on-demand rendering, no analytics by default, tree-shaken imports, no heavy UI library, CSS-only artwork.

### 4.13 Database decision

**No database.** A portfolio is static content; no feature requires persistent server-side data.

| Item | Ongoing cost |
|---|---|
| Static hosting (Vercel Hobby, Cloudflare Pages, GitHub Pages) | $0 |
| Domain (optional) | ~$10-20/year |
| Email | $0 (existing Gmail) |
| Database | $0, not used |
| Contact form (if added later) | Formspree free tier, then ~$8-10/month; or Resend free tier + server function |
| Analytics (if added later) | $0 Vercel Analytics; Plausible ~$9/month |

---

## 5. Visual Direction and Interaction Model

**Direction:** "Editorial Signal" - warm porcelain light surfaces, ink typography, cobalt action, fine hairlines, generous negative space, one restrained sky-blue glow. The feel is a calm AI product studio, not a template portfolio.

**Light tokens:** `#F7F6F2` background, `#FFFFFF` surface, `#0A0A0B` ink, `#52525B` secondary, `#1D4ED8` accent, `#38BDF8` decorative sky, `#047857` status. Contrast verified: ink 18.3:1, secondary 7.15:1, accent 6.70:1 with white, success 5.07:1. `#71717A` is 4.47:1 and is restricted to large/decorative text.

**Typography:** Outfit display, Inter body, JetBrains Mono metadata. Strong hierarchy through scale/weight, not extra families.

**Home composition:**

1. Hero: availability chip, short headline, one-paragraph positioning, two CTAs, hero metrics from the data, Signal Core.
2. Selected Work: horizontal rail with 11 real projects.
3. Capabilities: six focus domains + stack groups.
4. Contact: one large CTA, email/LinkedIn/GitHub, resume.
5. Footer: concise real copy.

**Interaction model:** native scroll, no hijacking; one 3D moment; restrained hover/focus transitions; horizontal work rail; project detail pages; mobile nav sheet; reduced-motion poster. The user is always in control.

---

## 6. Implementation Plan

### M0 - Approvals and asset intake (no code)

**Inputs:** approvals in section 8; portrait, resume, favicons, OG image, optional project screenshots; confirmation of metrics/awards.

**Acceptance:** decisions recorded; assets present or explicitly deferred; no placeholder data passed off as real.

### M1 - Static Next scaffold and toolchain

**Files:** `package.json`, lockfile, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, ESLint config, `.gitignore`, `.nvmrc`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`.

**Dependencies:** core runtime + dev tooling from section 4.3, after approval.

**Acceptance:** `npm run build` exit 0; `npm run lint` and `npm run typecheck` exit 0; static `out/` produced; no console errors; no secrets; Git initialized only if approved.

### M2 - Tokens, fonts, primitives, shell

**Files:** `globals.css`, `src/components/layout/*`, `src/components/ui/*`, `src/lib/cn.ts`.

**Acceptance:** semantic tokens only; contrast verified; skip link; keyboard nav; 320-1920 no body overflow; 48px controls; focus rings; reduced-transparency fallback.

### M3 - Content layer, routes, SEO

**Files:** `src/content/*`, `src/app/about/page.tsx`, `src/app/work/page.tsx`, `src/app/work/[slug]/page.tsx`, `src/app/not-found.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, metadata.

**Acceptance:** all 11 main projects present; real links/stack/problem/solution only; `/work` index accessible without JS; static detail pages for every slug; structured data valid; no invented content.

### M4 - Hero and Signal Core

**Files:** `src/components/sections/hero.tsx`, `src/components/three/signal-core.tsx`, `signal-core-poster.tsx`.

**Acceptance:** headline is LCP; 3D lazy-loads; reduced-motion/save-data/low-power/no-WebGL poster; keyboard-accessible focus action; 30-second idle test shows no rendering; navigation away disposes context; budget met.

### M5 - Projects rail and detail presentation

**Files:** `src/components/work/project-rail.tsx`, `project-card.tsx`, `project-detail.tsx`, `src/app/work/*`.

**Acceptance:** touch swipe, keyboard arrows/Home/End, labeled controls, index announcement, no autoplay, all cards focusable, reduced motion respected, no fake screenshots.

### M6 - Skills, journey, achievements, contact

**Files:** `src/components/sections/capabilities.tsx`, `journey.tsx`, `contact.tsx`, `src/app/about/page.tsx`.

**Acceptance:** six domains, capability matrix, AI team model, timeline, achievements from data; copy-email success state; all external links correct; no form unless separately approved.

### M7 - Motion polish and accessibility

**Files:** motion wrappers, focus management, reduced-motion variants, dialog/sheet.

**Acceptance:** `MotionConfig reducedMotion="user"`; no scroll hijack; focus visible; Escape closes dialogs; focus returns; 200% zoom; 320px reflow; forced-colors; axe no critical/serious issues.

### M8 - SEO, performance, release verification

**Files:** OG image, favicons, `sitemap.ts`, `robots.ts`, metadata, JSON-LD, Lighthouse/Playwright configs.

**Acceptance:** metadata and OG preview correct; sitemap/robots correct; budgets met; production build served from `out/`; all checks below pass; deploy preview only with explicit approval.

### Verification commands (to be defined in `package.json` at M1)

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e
npm run audit:a11y
npm run audit:links
npm audit --omit=dev
```

### QA matrix

- **Viewports:** 320x568, 375x812, 390x844, 768x1024, 1024x768, 1280x800, 1440x900, 1920x1080, plus 844x390 landscape.
- **Accessibility:** axe per route; keyboard-only nav/carousel/dialog; NVDA or VoiceOver smoke test; 200% zoom; reduced motion; reduced transparency; forced colors; contrast script.
- **Performance:** Lighthouse mobile + desktop; LCP/INP/CLS; bundle analysis; 3D draw calls/triangles; 30-second idle CPU/GPU; no memory leak across navigation.
- **Content:** every URL and GitHub link resolved or explicitly marked unavailable; no broken internal routes; no missing alt text.
- **Console:** fail on `console.error` and `pageerror` in Playwright.
- **Build:** static export served locally; direct navigation to nested routes works; 404 works.

### Git safety

- No repo exists today. Do not initialize until M1 approval.
- Before changes: inspect `git status`, `git diff`, `git log`.
- `.gitignore` must include `node_modules/`, `.next/`, `out/`, `.env*`, `playwright-report/`, `test-results/`, `.vercel/`.
- Never commit secrets, keys, `.env` files, private data, or generated credentials.
- No commit, push, deploy, or remote change without explicit approval.
- Report only verified results; a command is not "passing" until its exit code is 0.

---

## 7. Risks and Open Questions

| Risk | Impact | Mitigation |
|---|---|---|
| Missing portrait/resume/favicons/OG | Release blocked; broken links | Asset intake at M0; honest fallback until supplied. |
| No project screenshots | Cards may feel less visual | Designed typographic/CSS artwork; request screenshots from owner. |
| Unverified metrics/awards | Credibility/legal risk | Label as owner-reported or omit; request proof. |
| Light-first conflicts with dark brand tokens | Brand inconsistency | Light default + optional dark theme; approval required. |
| 3D bundle and low-end performance | Slow load, battery drain | Lazy load, poster fallback, on-demand rendering, strict budgets. |
| Next 16 / TS 7 / ESLint 10 compatibility | Toolchain failure | Verify at M1; pin working versions from lockfile. |
| Static export limits `next/image` | Image optimization tradeoff | Pre-optimize with sharp, or deploy static-prerendered on Vercel. |
| Horizontal carousel accessibility | Hidden content / keyboard traps | Native scroll, all slides in DOM, explicit controls, Playwright keyboard tests. |
| Content volume vs minimal scroll | Cluttered home | Home stays 4-5 sections; deep content on `/about` and `/work`. |
| Link rot on live projects | Broken external links | Build-time link audit; mark unavailable projects honestly. |
| Contact email scraping/spam | Inbox noise | Use `mailto`, no exposed form; consider obfuscation only if owner wants. |
| Dependency approval (SOP Law 8) | Blocked install | Approve list and size impact before M1. |
| No Git history/remote | No recovery/checkpoints | Initialize at M1; commit per milestone after approval. |

### Approvals required

1. Confirm **light-first default + optional dark theme** (replaces the data's dark-first default for this build).
2. Confirm **Outfit/Inter/JetBrains Mono** (or approve a serif display alternative).
3. Approve the **dependency list** and accept the stated bundle impact.
4. Confirm project scope: **11 main projects**, 3 experiments, 2 doc-only projects pending.
5. Decide metric handling: show owner-reported metrics, or omit until evidence is supplied.
6. Decide contact: **mailto only** (recommended) vs form service/serverless.
7. Decide analytics: **none** (recommended) vs Vercel Analytics/Plausible.
8. Approve **Git init** at M1 and confirm hosting target (static export vs Vercel static-prerender).
9. Supply or approve fallbacks for **portrait, resume, favicons, OG image**.
10. Confirm the **"Signal Core"** 3D concept and that a keyboard-accessible focus action is desired.
11. Confirm the SEO canonical domain (`shaik-aakif.vercel.app` or custom).

---

## 8. Evidence Collected

### Commands

- `Get-ChildItem -Force` -> four files, no implementation.
- `Test-Path .git` -> `False`; no repo or remotes.
- `node --version` -> `v22.14.0`; `npm --version` -> `10.9.2`; `bun --version` -> `1.2.8`; `git --version` -> `2.51.0.windows.1`.
- `npm view <package> version` -> versions table in section 2.
- `npm view @react-three/fiber peerDependencies` -> React `>=19 <19.4`, three `>=0.156`.
- `npm view next engines` -> Node `>=20.9.0`.
- Contrast calculation -> ink 18.30:1, secondary 7.15:1, accent 6.70:1, success 5.07:1, `#71717A` 4.47:1.

### Official sources accessed

- https://github.com/tailwindlabs/tailwindcss
- https://tailwindcss.com/docs/styling-with-utility-classes
- https://tailwindcss.com/docs/responsive-design
- https://github.com/motiondivision/motion
- https://motion.dev/docs/react-quick-start
- https://motion.dev/docs/react-accessibility
- https://github.com/pmndrs/react-three-fiber
- https://r3f.docs.pmnd.rs/getting-started/introduction
- https://r3f.docs.pmnd.rs/advanced/scaling-performance
- https://github.com/shadcn-ui/ui
- https://ui.shadcn.com/docs
- https://ui.shadcn.com/docs/theming
- https://developer.apple.com/design/human-interface-guidelines/
- https://developer.apple.com/design/human-interface-guidelines/design-principles
- https://developer.apple.com/design/human-interface-guidelines/accessibility
- https://developer.apple.com/design/human-interface-guidelines/layout
- https://developer.apple.com/design/human-interface-guidelines/typography
- https://developer.apple.com/design/human-interface-guidelines/materials
- https://github.com/STiXzoOR/applecn
- https://opencode.ai/docs/skills/
- https://cursor.com/docs/context/rules
- https://nextjs.org/docs/app/guides/static-exports
- https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- https://nextjs.org/docs/app/getting-started/images

### Files created by this mission

- `.cursor/rules/responsive-design.mdc`
- `.cursor/rules/motion-design.mdc`
- `.cursor/rules/3d-web-design.mdc`
- `.cursor/rules/visual-design-system.mdc`
- `.cursor/rules/apple-inspired-ux.mdc`
- `.opencode/skills/portfolio-design-system/SKILL.md`
- `PORTFOLIO_IMPLEMENTATION_PLAN.md`

### Explicitly not done

- No dependencies installed.
- No code scaffolded.
- No Git repository initialized.
- No commit, push, deploy, or remote change.
- No project URLs, assets, or metrics verified externally.
- No build, browser, Lighthouse, or 3D performance result claimed.

---

## 9. Recommendation

Proceed with M1 only after approvals on the light-first theme, dependency list, metric handling, assets, and Git/hosting target. Build the static Next.js foundation and token system first; add the 3D hero only after the text-first hero is fast and accessible. Treat the horizontal project rail and static detail pages as the core product, not decoration.
