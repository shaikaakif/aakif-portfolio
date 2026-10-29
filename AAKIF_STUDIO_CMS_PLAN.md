# Aakif Studio CMS — Engineering Plan & Execution Context

Last updated: 2026-10-29
Owner: Shaik Aakif
Repository: `C:\Users\HP\Desktop\my-portfolio`
Production: https://shaikaakif.com/
Supabase: https://mppmqtmyuoaywzvtcimj.supabase.co

This file is the working source of truth for the CMS repair. Check it before every stage and update the checklist as work is completed. Do not claim a step is done unless it is verified.

---

## 1. Non-negotiables

- Preserve all working public portfolio features and existing URLs.
- Do not rewrite unrelated public sections.
- Do not add dependencies without explicit approval. Extend the existing `src/components/ui/icons.tsx` instead of installing an icon package.
- Do not hardcode secrets. Never put a password in `NEXT_PUBLIC_*`, the bundle, Git, logs, or browser storage.
- Do not delete production media or records during testing.
- Do not invent counts, dates, credits, licenses, or metadata.
- All UI must use existing semantic tokens (`--paper`, `--ink`, `--accent`, `--line`, etc.) and the 4/8px spacing rhythm.
- Every async view needs loading, empty, error, and settled states.
- No `window.confirm` for destructive admin actions; use an accessible confirmation dialog.
- No fake success states. Show success only after the database/storage operation succeeds.

---

## 2. Confirmed audit findings (evidence-based)

### Architecture / shell

1. **Public chrome leaks into admin.** `src/app/layout.tsx` renders `SiteHeader`, `SiteFooter`, brush glow, and public structured data for every route, including `/admin/*`. Admin has no isolated root layout. This is the main cause of the displaced/incorrect admin experience.
2. **Admin shell mixes incompatible positioning.** `AdminLayout.tsx` uses a CSS grid with `grid-template-columns: auto minmax(0, 1fr)` while the sidebar is `position: sticky` with a width variable and the mobile trigger is `position: fixed`. Collapse changes width but the layout does not reserve the collapsed width consistently. Styled-jsx duplicates layout rules already present in `admin.css`.
3. **Page titles are duplicated.** `AdminLayout` renders an `h1` page title in the top bar, and each admin page renders another `h1` (`Gallery Manager`, `Projects`, `Media Library`, `Settings`, `Dashboard`).
4. **Broken dashboard links.** `/admin/projects/new` and `/admin/gallery/upload` do not exist. Both return 404.
5. **No admin root metadata.** Admin pages inherit the public SEO metadata and can be indexed unless blocked; `robots.ts` disallows `/admin/`, but the admin layout should also emit `robots: noindex`.

### Authentication

6. **Email is visible in the login form.** `AdminLogin.tsx` renders an editable email field and prefills `NEXT_PUBLIC_ADMIN_EMAIL`.
7. **Client-only authorization.** `AdminAuthProvider` sets `isAdmin = Boolean(session.user)`. Any authenticated Supabase user passes the UI gate; actual protection depends only on RLS. It never calls the server-side `is_admin_user()` check.
8. **Server client uses the service-role key with cookies.** `src/lib/supabase/server.ts` creates a `@supabase/ssr` client with `SUPABASE_SERVICE_ROLE_KEY`. It is currently unused, but this pattern must not be used for user-session reads/writes.
9. **No server-side login boundary in the current static export.** The deployment is `output: "export"`. A React-only password check would be insecure. The secure compatible path is Supabase Auth (`signInWithPassword`) with the admin email kept out of the visible UI, plus a server-verified `is_admin_user()` RPC after login. The password never touches the bundle; Supabase Auth handles hashing, rate limiting, and sessions.
10. **Test credentials are not present in `.env.local`.** Authenticated browser QA is blocked until a test password is provided through a secure channel. Unauthenticated login/redirect/public QA can still run.

### Settings / dashboard

11. **Settings are fake.** `src/app/admin/settings/page.tsx` uses uncontrolled `defaultValue` inputs and shows “Saved” without persisting anything. There is no settings table in Supabase.
12. **Dashboard has no loading/error/empty handling.** It swallows errors in `console.error` and displays zeros. It has no recent uploads or recent changes.

### Gallery

13. **Upload is incomplete.** `src/app/admin/gallery/page.tsx` uploads raw files and inserts only title/alt/categories/tags/status. It does not record width, height, format, or file size; does not validate type/size; does not preview before publish; does not retry or cancel; does not clean up storage if the DB insert fails; and can double-submit.
14. **Duplicate data loading.** Gallery has both `fetchImages`/`fetchCollections` callbacks and duplicate `useEffect` loaders.
15. **Limited management.** No status filter, sort control, pagination/load-more, bulk actions, or detail drawer. Editing is a small modal with six fields; no description, taken date, photographer, copyright, license, sort order, or read-only technical metadata.
16. **Unsafe operations.** Delete uses `window.confirm`, removes storage before DB, and does not check whether the asset is used by a project. Reorder writes every row on every move.
17. **Poor grid ergonomics.** Thumbnails are 4:3, actions are hover-only inside a dark overlay, the copy action uses a text glyph (`⧉`), and selection is absent.
18. **No accessible dialog behavior.** The metadata modal has no Escape handling, focus trap, focus return, or `aria-modal`.
19. **Draft/published semantics are honest in the DB**, but the public storage bucket is public. Draft URLs are unguessable UUID paths, but not access-controlled. This is a documented residual risk.

### Media library

20. **Media Library is a duplicate of Gallery** with less functionality. No list view, filters, usage tracking, metadata editing, or safe deletion. Search input is hardcoded to `width: 300px`, which overflows on mobile.
21. **No distinction between asset and gallery entry.** Both read/write `gallery_images`; the UI never explains that publishing controls public gallery visibility.

### Projects

22. **Project form is incomplete.** It does not expose `seo_image_id`, cover preview, cover alt text, or usage. It has no unsaved-change warning, no accessible dialog behavior, and no visual media picker.
23. **Project list lacks sorting, featured filtering, and accessible confirmations.** It uses `window.confirm`, text glyphs (`★`, `●`), and no cover thumbnails.
24. **Public work pages are static.** `src/app/work/page.tsx` and `src/app/work/[slug]/page.tsx` read `src/content/projects.ts`, not Supabase. Admin project edits do not appear on the public site. Drafts are not exposed (RLS), but published DB projects are also invisible.

### Public gallery / SEO

25. **Public gallery is client-only.** `/gallery/` server HTML contains “Loading gallery…” and no image markup. Published images are not crawlable at first paint, and there is no per-image metadata.
26. **No image sitemap entries.** `sitemap.ts` lists `/gallery/` only; it does not list gallery image pages or image URLs.
27. **No per-image OG/canonical/structured data.** `public-gallery.tsx` has alt/caption rendering, but no metadata, no `ImageObject` JSON-LD, and no detail page.
28. **No responsive image sizing / width-height layout protection in admin.** Public images do pass `width`/`height` when present, but the admin grid does not, and most uploads currently have null dimensions.

### Database / storage state (read-only inspection)

- Tables: `projects`, `gallery_images`, `gallery_collections`, `admin_users`.
- `projects`: 0 rows.
- `gallery_images`: 1 row, `is_published = false`, dimensions and file size null.
- `gallery_collections`: 0 rows.
- Admin auth user exists: `aakifshaik512@gmail.com`, confirmed, last sign-in 2026-10-25.
- Storage bucket `portfolio-media` exists, public, 10 MB limit, MIME allow-list `image/webp`, `image/png`, `image/jpeg`, `image/gif`, `image/avif`.
- No `site_settings` table.
- Anon access returns 0 published gallery rows and 0 projects, confirming RLS is active.
- No `psql` or Supabase CLI is installed, so SQL migrations cannot be applied from this machine without the Supabase dashboard/Management API.

### Browser automation

- Playwright/Puppeteer are not installed.
- Google Chrome and Microsoft Edge are installed.
- Node v22.14.0 is available, including the global `WebSocket` client, so Chrome DevTools Protocol (CDP) can be driven with a zero-dependency script.
- Plan: launch Chrome headless with `--remote-debugging-port`, use CDP for navigation, DOM evaluation, console/network capture, and screenshots at 1440, 1024, 768, 390, and 360 px. No package installation required.

---

## 3. Architecture decisions

### 3.1 Keep the static export

`next.config.ts` uses `output: "export"`. The site is deployed on Vercel and currently serves static HTML. Removing the export would enable SSR but changes the deployment/cost model and risks breaking the current production setup.

Decision:
- Keep `output: "export"` and `trailingSlash: true`.
- Public content that must be SEO-crawlable is fetched **at build time** from Supabase using the public anon key and RLS (published rows only).
- Admin writes remain client-side Supabase operations protected by RLS.
- New/edited public content appears after the next build/deploy. This limitation is documented in the admin UI and final report.
- If true publish-without-redeploy is required later, the upgrade path is: remove `output: "export"`, add authenticated server actions/route handlers, and revalidate paths. Do not do this without owner approval.

### 3.2 Separate public and admin layouts with route groups

- `src/app/layout.tsx`: only `<html>`, `<body>`, fonts, global CSS, and a neutral metadata fallback.
- `src/app/(site)/layout.tsx`: public header/footer, decorative layers, public structured data, public metadata.
- Move public routes into `(site)`:
  - `src/app/(site)/page.tsx`
  - `src/app/(site)/about/page.tsx`
  - `src/app/(site)/work/page.tsx`
  - `src/app/(site)/work/[slug]/page.tsx`
  - `src/app/(site)/gallery/page.tsx`
  - `src/app/(site)/gallery/[id]/page.tsx` (new)
- Admin stays at `src/app/admin/*` with its own layout and `admin.css`.
- URLs are unchanged by route groups.
- Root `not-found.tsx` stays at the root for unmatched routes.

### 3.3 Password-only authentication

- UI: password field only. No email input. No email shown on the login screen.
- Internally, the configured admin email is read from `NEXT_PUBLIC_ADMIN_EMAIL` (not a secret) and passed to `supabase.auth.signInWithPassword`.
- After sign-in, call `supabase.rpc("is_admin_user")`. If false, sign out and show “This account is not authorized for Aakif Studio.”
- `AdminLayout` gates on the verified `isAdmin` value, not merely a session.
- Supabase Auth is the trusted authentication boundary: passwords are verified server-side by Supabase, not in React.
- Do not add a client-side password constant or a fake “password check”.
- Session expiry/refresh is handled by `onAuthStateChange`; expired sessions redirect to `/admin/login/`.
- RLS and storage policies remain the real data boundary.
- Recommend rotating the previously shared password before production use.

### 3.4 Settings persistence

- Add `public.site_settings` key/value table via `supabase/migrations/006_site_settings.sql`.
- RLS: public read for non-sensitive keys (`site_identity`, `seo_defaults`, `social_links`, `gallery_defaults`, `publishing`); admin full access.
- Admin settings page upserts each group only after user save, with loading/error states.
- If the table is missing, the page shows an explicit setup notice and disables saving. It must not fake success.
- Public metadata can consume `site_identity`/`seo_defaults` at build time when the table exists; fall back to `src/content/seo.ts`.
- Migration is a manual setup step until a SQL runner is available.

### 3.5 Gallery vs Media Library

- `gallery_images` is the single asset table. There is no duplicate media table.
- Gallery = curated, publishable images (`is_published`).
- Media Library = all uploaded assets, including drafts, with usage tracking and reuse.
- An asset can be referenced by projects via `cover_image_id`, `screenshot_ids`, and `seo_image_id`.
- Deleting an asset used by a project is blocked with a clear explanation. Unused assets can be deleted after confirmation.

### 3.6 Public content from Supabase (build-time)

- Add `src/lib/supabase/static.ts`: server-only client using the anon key, no cookies.
- Add `src/lib/content/cms.ts`:
  - `getPublishedGalleryImages()`
  - `getPublishedCollections()`
  - `getPublishedProjects()`
  - `getPublishedProject(slug)`
  - `getSiteSettings()`
- Use React `cache` to dedupe build-time fetches.
- Fall back to existing static content when the DB is empty/unavailable, so the current site never goes blank.
- Public project pages: DB published projects take precedence; static content remains the fallback. `generateStaticParams` uses the union of both.
- Public gallery: server-rendered initial images/collections, then client-side filtering/lightbox. If the DB has no published images, keep the honest empty state.
- Per-image pages `/gallery/[id]/` are generated from published images at build time, with metadata, OG image, canonical, and `ImageObject` JSON-LD.

---

## 4. Design system for the admin

### Tokens (existing, no raw hex in components)

- Background: `--paper` (#fbf9f4), surface: `--paper-soft`, muted surface: `--paper-deep`.
- Text: `--ink`, `--ink-soft`, `--muted`.
- Borders: `--line`, `--line-strong`.
- Accent: `--accent`, `--accent-deep`, `--accent-soft`.
- Success: `--success`; danger: use a scoped admin token derived from `--accent-deep` plus a dedicated `--admin-danger` defined in `admin.css`.
- Radii: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`.
- Shadows: `--shadow-card`, `--shadow-lift`.

### Admin layout metrics

- Sidebar expanded: `17rem`; collapsed: `4.75rem`.
- Top bar height: `4.5rem`; sticky.
- Content max width: `88rem`; padding `clamp(1rem, 3vw, 2.5rem)`.
- Sidebar is `position: fixed` on desktop with the main content offset by the current sidebar width via a CSS variable on `.admin-shell`. Collapse changes the variable, not margins on individual pages.
- Mobile (`<= 64rem`): sidebar becomes an off-canvas drawer; main content has no offset; overlay + Escape close + focus return.
- Admin grid breakpoints: mobile 2 columns, tablet 3, desktop 4, wide 5.
- All controls: minimum 44px touch target, 48px preferred.
- Focus: visible 2px accent ring with offset; never removed.
- Motion: 150–220ms ease for hover/expand; `prefers-reduced-motion` disables transforms and transitions.

### Component inventory

- `AdminShell` (layout + sidebar + topbar + mobile drawer).
- `AdminPageHeader` (title, description, actions).
- `AdminToolbar` (search, filters, sort).
- `AdminButton` (primary/secondary/ghost/danger, sizes, loading).
- `AdminField` (label, hint, error, required marker).
- `AdminBadge` (published/draft/featured/format).
- `AdminEmptyState`.
- `AdminSkeleton`.
- `AdminToast` (success/error, `aria-live`, dismiss).
- `ConfirmDialog` (focus trap, Escape, danger variant).
- `SideDrawer` (gallery/media editor; focus trap, Escape, body scroll lock).
- `UploadDialog` (dropzone, file list, per-file status/progress, retry/cancel, publish toggle).
- `MediaPicker` (visual grid, search, single/multi select, cover preview).
- `MediaUsageBadge` (used in N projects).
- `GalleryCard` (square thumbnail, checkbox, status, actions).
- `ProjectRow`/`ProjectCardAdmin` (cover thumb, status, actions).

### Icon policy

- Extend `src/components/ui/icons.tsx` with consistent 24×24 stroke icons: `LayoutDashboardIcon`, `UploadIcon`, `MoreIcon`, `StarIcon`, `ExternalLinkIcon`, `CheckCircleIcon`, `AlertCircleIcon`, `MenuIcon`, `ChevronDownIcon`, `ArrowUpIcon`, `ArrowDownIcon`, `LinkIcon`, `RefreshIcon`, `CalendarIcon`, `TagIcon`, `FolderPlusIcon`, `EyeIcon` (exists), `CopyIcon` (exists), `CloseIcon` (exists), `SearchIcon` (exists), `TrashIcon` (exists), `EditIcon` (exists), `FilterIcon` (exists).
- No emoji or text glyphs for core controls.

---

## 5. Data model

### Existing (do not destroy)

`projects`, `gallery_images`, `gallery_collections`, `admin_users` as defined in `supabase/run_all.sql`.

### New migration `006_site_settings.sql`

```sql
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- Public read for public-safe settings
create policy "Public can read public settings"
  on public.site_settings for select
  using (key in ('site_identity','seo_defaults','social_links','gallery_defaults','publishing'));

-- Admin full access
create policy "Admin can manage settings"
  on public.site_settings for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- updated_at trigger
create trigger update_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.update_updated_at_column();

-- defaults
insert into public.site_settings (key, value) values
  ('site_identity', '{"name":"Shaik Aakif","tagline":"AI Builder & Product Developer","email":"aakifshaik512@gmail.com"}'),
  ('seo_defaults', '{"title":"Shaik Aakif — AI Builder & Product Developer","description":"Shaik Aakif is an AI builder, product developer and entrepreneur building AI-powered products, full-stack applications and intelligent systems."}'),
  ('social_links', '{"website":"https://shaikaakif.com","github":"https://github.com/shaikaakif","linkedin":"","instagram":""}'),
  ('gallery_defaults', '{"defaultStatus":"draft","defaultCategories":[]}'),
  ('publishing', '{"requireAltText":true,"autoPublishOnUpload":false}')
on conflict (key) do nothing;
```

Manual step: run this in Supabase SQL Editor. Until then, settings UI shows a setup notice.

### Optional future migration (not in this pass)

- Gallery `slug` and `is_featured` columns for friendlier image URLs and featured curation.
- Private storage bucket + signed URLs if draft files must be access-controlled.
- Activity log table for real “recent changes” metrics.

---

## 6. File change map

### New files

- `src/app/(site)/layout.tsx`
- `src/app/(site)/gallery/[id]/page.tsx`
- `src/lib/supabase/static.ts`
- `src/lib/content/cms.ts`
- `src/lib/admin/types.ts`
- `src/lib/admin/format.ts`
- `src/lib/admin/images.ts`
- `src/lib/admin/usage.ts`
- `src/components/admin/ui/AdminPageHeader.tsx`
- `src/components/admin/ui/AdminToolbar.tsx`
- `src/components/admin/ui/AdminBadge.tsx`
- `src/components/admin/ui/AdminEmptyState.tsx`
- `src/components/admin/ui/AdminToast.tsx`
- `src/components/admin/ui/ConfirmDialog.tsx`
- `src/components/admin/ui/SideDrawer.tsx`
- `src/components/admin/ui/UploadDialog.tsx`
- `src/components/admin/ui/MediaPicker.tsx`
- `src/components/admin/GalleryCard.tsx`
- `src/components/admin/GalleryEditor.tsx`
- `src/components/admin/MediaLibrary.tsx` (or page-local)
- `supabase/migrations/006_site_settings.sql`

### Modified files

- `src/app/layout.tsx` (strip public chrome/metadata)
- `src/app/admin/layout.tsx` (metadata, admin CSS)
- `src/app/admin/page.tsx` (real metrics + recent uploads)
- `src/app/admin/gallery/page.tsx` (full rebuild)
- `src/app/admin/media/page.tsx` (full rebuild)
- `src/app/admin/projects/page.tsx` (full rebuild)
- `src/app/admin/settings/page.tsx` (real persistence)
- `src/components/admin/AdminAuthProvider.tsx` (password-only + RPC verification)
- `src/components/admin/AdminLogin.tsx` (password-only UI)
- `src/components/admin/AdminLayout.tsx` (shell rebuild, no styled-jsx)
- `src/components/admin/ProjectFormModal.tsx` (complete form, media picker, unsaved warning)
- `src/components/sections/public-gallery.tsx` (initial server data, detail links, SEO-friendly markup)
- `src/app/(site)/gallery/page.tsx` (build-time data + metadata + JSON-LD)
- `src/app/(site)/work/page.tsx` (DB projects with static fallback)
- `src/app/(site)/work/[slug]/page.tsx` (DB project metadata/content with static fallback)
- `src/app/sitemap.ts` (published projects + gallery images + image URLs)
- `src/styles/admin.css` (complete admin design system)
- `src/styles/gallery.css` (detail page + grid tweaks)
- `src/components/ui/icons.tsx` (new icons)
- `src/lib/supabase/server.ts` (remove service-role cookie client; use anon user client)
- `src/content/types.ts` (only if a shared CMS type is needed)

### Moved files (git mv, URLs unchanged)

- `src/app/page.tsx` → `src/app/(site)/page.tsx`
- `src/app/about/page.tsx` → `src/app/(site)/about/page.tsx`
- `src/app/work/page.tsx` → `src/app/(site)/work/page.tsx`
- `src/app/work/[slug]/page.tsx` → `src/app/(site)/work/[slug]/page.tsx`
- `src/app/gallery/page.tsx` → `src/app/(site)/gallery/page.tsx`

---

## 7. Page workflows

### Login

1. Password-only form with brand, “Aakif Studio”, short instruction.
2. Submit → loading → Supabase Auth.
3. Error → inline alert, focus stays in form, generic message.
4. Success → RPC `is_admin_user`.
5. Authorized → replace `/admin/`.
6. Unauthorized → sign out, show “This account is not authorized.”
7. Already signed in as admin → redirect to `/admin/`.

### Admin shell

1. Desktop: fixed sidebar + offset main. Collapse toggles width and icon-only labels with accessible names.
2. Mobile: hamburger opens drawer; overlay/Escape closes; focus returns to trigger; body scroll locked.
3. Top bar: breadcrumb + current page label, “View site”, account email, sign out.
4. Active nav state from pathname; `/admin` matches only the dashboard; nested routes match their section.
5. Session expiry → login redirect.

### Dashboard

1. Load counts and recent rows in parallel.
2. Loading skeletons.
3. Error banner with retry.
4. Metric cards: total projects, published, drafts, gallery images, published gallery, draft gallery.
5. Recent uploads list (thumbnail, title, status, date) with link to Gallery.
6. Recent projects list (title, status, updated date) with link to Projects.
7. Quick actions: New project (opens projects page with create intent), Upload images (opens gallery with upload intent), Manage media, Settings.
8. No fake trends or activity.

### Gallery

1. Header: title, description, “Upload images” primary action.
2. Toolbar: search, status filter, collection filter, sort, view size? (grid only).
3. Collections collapsible: create, publish/unpublish, delete with confirmation.
4. Grid: square thumbnails, checkbox selection, status badge, title, dimensions/size, hover/focus actions (edit, publish toggle, copy URL, delete).
5. Selection bar: count, select all, publish, unpublish, delete.
6. Load more (24 per page) or pagination.
7. Empty state: upload CTA.
8. Upload dialog: dropzone, file validation, previews, editable title/alt, publish-now toggle, per-file progress/status, retry failed, cancel remaining, success only after DB insert.
9. Editor drawer: preview, editable metadata, read-only technical metadata, save, publish toggle, previous/next, delete.
10. Delete: usage check, confirmation, DB first then storage; report partial failure.

### Media Library

1. Header + “Add media” action.
2. Search, format filter, status filter, date filter, sort, grid/list toggle.
3. Grid: square thumbs, status, format, dimensions, size, usage badge.
4. List: responsive table with thumbnail, title, format, dimensions, size, status, usage, actions; container scrolls horizontally, not the page.
5. Editor drawer: same metadata editor as gallery.
6. Usage: fetch projects and map references; show “Used in N projects” with links.
7. Delete: blocked if used; confirmation if unused; storage + DB consistency.

### Projects

1. Header + “New project”.
2. Toolbar: search, status filter, featured filter, sort.
3. List: cover thumb (or code/artwork fallback), title, tagline, category, status, slug, updated date.
4. Actions: edit, feature toggle, publish toggle, delete with confirmation.
5. Form: sections for identity, story, links, media, SEO, publishing.
6. Media picker: search, visual thumbnails, cover (single), screenshots (multi), social image (single).
7. Validation: required title/slug/category/tagline/description; slug format; URL format; duplicate slug error from Supabase.
8. Unsaved changes: close/backdrop/Escape prompts; `beforeunload` while dirty.
9. Saving state; success closes and refreshes; error stays open with actionable message.
10. Public: build-time published projects replace static fallback; drafts never rendered.

### Settings

1. Load `site_settings` rows.
2. Missing table → setup notice with migration path; save disabled.
3. Groups: Site identity, Default SEO, Social links, Gallery defaults, Publishing.
4. Save only changed groups via upsert; show saving, success, error.
5. Reset form to last saved values (no destructive DB reset).
6. No fake “Saved” badge.

### Public gallery / SEO

1. Server component fetches published images/collections at build time.
2. Gallery page metadata: title, description, canonical, OG image (first published image or site default).
3. JSON-LD `ImageGallery` with `ImageObject` entries.
4. Client component receives initial data; filters, lightbox, detail links.
5. Grid images: alt text, width/height when known, `loading="lazy"`, `decoding="async"`, `object-fit: cover`.
6. Detail page `/gallery/[id]/`: image, title, caption, description, dimensions, date taken (only if known), credit/license (only if known), tags/categories, back link, canonical, OG/Twitter metadata, `ImageObject` JSON-LD.
7. Sitemap: `/gallery/`, each `/gallery/[id]/`, and image URLs for published images.
8. Drafts excluded by RLS and build-time queries.
9. Report that new images require a rebuild/deploy under static export.

---

## 8. Verification plan

### Commands

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run preview` (serve `out`) for production-build QA
- Optional: start `npm run dev` for interactive admin QA

### Browser matrix (Chrome CDP, no new dependency)

- 1440×900 desktop
- 1024×768 small desktop/tablet landscape
- 768×1024 tablet
- 390×844 mobile
- 360×800 narrow mobile

For each route (`/`, `/work/`, `/gallery/`, `/admin/login/`, `/admin/`):
- No horizontal overflow (`documentElement.scrollWidth <= clientWidth + 1`).
- No uncaught console errors.
- No failed same-origin network requests (Supabase 401/406 expected when signed out must be understood).
- Admin login page renders password-only, no email field.
- `/admin/` redirects to `/admin/login/` when signed out.
- Public gallery server HTML contains published image markup when published data exists; currently there are no published images, so verify the honest empty state and the presence of server-rendered metadata.
- Screenshots captured to the temp directory for review.

### Authenticated QA (blocked until credentials)

- Sign in, navigate all admin sections, open dialogs, test forms, upload a test image, edit metadata, publish/unpublish, reorder, bulk actions, delete a test-only record, settings save, project create/edit, sign out, session expiry.
- Do not delete existing production media. Use a clearly prefixed temporary record only if the owner provides explicit permission, and clean it up.
- If credentials are unavailable, report the gap explicitly; do not claim authenticated tests passed.

### Database verification

- Anon key cannot read drafts or unpublished projects.
- Admin RPC `is_admin_user` returns true for the admin session only.
- Storage upload/delete policies match the bucket.
- Settings RLS: public read only for public keys; writes require admin.
- No secrets in the client bundle (`grep` the built `out/_next` for the service-role key and password).

---

## 9. Execution checklist

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done and verified, `[!]` blocked.

### Stage A — Audit and plan

- [x] Inspect Git state, package scripts, Next config, deployment target.
- [x] Inspect root/admin layouts, auth, pages, CSS, icons.
- [x] Inspect Supabase tables, RLS, bucket, row counts, auth user.
- [x] Confirm browser automation availability and credentials gap.
- [x] Write this plan file.
- [ ] Owner review of static-export publish limitation and settings migration.

### Stage B — Implementation

- [x] Route groups: separate public and admin layouts.
- [x] Admin CSS design system + shell rebuild.
- [x] Icons: add missing interface icons.
- [x] Password-only login + RPC admin verification.
- [x] Fix `src/lib/supabase/server.ts`.
- [x] Shared admin utilities/types/components.
- [x] Dashboard rebuild.
- [x] Gallery rebuild (grid, filters, bulk, upload, editor, delete safety).
- [x] Media Library rebuild (grid/list, filters, usage, safe delete).
- [x] Projects rebuild (list + complete form + media picker).
- [x] Settings persistence + migration file.
- [x] Public gallery build-time data + per-image pages + metadata + JSON-LD.
- [x] Public projects build-time data + metadata.
- [x] Sitemap images/pages.
- [~] Responsive + accessibility pass (implemented, browser QA pending).
- [x] Remove dead routes/links and duplicate styled-jsx (verified none).

### Stage C — Verification

- [x] `npm run typecheck` passes.
- [x] `npm run lint` passes.
- [x] `npm run build` passes (exit 0) with `prebuild` cache clear.
- [x] Production preview served (`serve out`, `/`, `/gallery/`, `/gallery/[id]/`, `/sitemaps/`, `/sitemap.xml`, `/admin/`, `/admin-favicon.svg` all 200).
- [ ] Browser screenshots at all five widths (blocked: no browser-automation run yet; Chrome/CDP available).
- [ ] Console/network check (blocked: no browser-automation run yet).
- [x] Unauthenticated admin redirect verified in `AdminLayout` (replaces `/admin/login/` when not admin); client-side QA pending credentials.
- [x] Public gallery empty/published behavior verified (3 published images build; detail pages and sitemap entries present).
- [x] Secret scan of built output (no `service_role`/password references in `out/`).
- [x] Update this plan with actual results and remaining defects.
- [x] Final report: changed files, verification proof, manual steps, residual risks.

---

## 10. Manual steps / open items for the owner

1. **Rotate the previously shared admin password** in Supabase Auth before production use.
2. **Run `supabase/migrations/006_site_settings.sql`** in the Supabase SQL Editor. Settings persistence depends on it.
3. Provide a test admin password through a secure channel if authenticated browser QA is required. Do not put it in `.env.local` or Git.
4. Decide whether publishing should require a rebuild/deploy (current static-export behavior) or whether to upgrade to SSR/ISR for publish-without-redeploy.
5. Optional hardening: make the storage bucket private and serve published images through signed URLs or a proxy, so draft files are not accessible by URL.
6. Optional: add a real activity log if “recent changes” should include edits/deletes, not just recent uploads.

---

## 11. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Static export means new published content needs a rebuild | Document in admin; keep build-time fetch; propose SSR upgrade if required |
| No settings table yet | Graceful setup notice; migration file; no fake success |
| No test credentials | Do not claim authenticated QA; provide exact blocked checklist |
| Public storage bucket exposes draft URLs if guessed | UUID paths; no links/indexing; recommend private bucket + signed URLs |
| `is_admin_user()` hardcodes the admin email | Existing design; keep in sync with `NEXT_PUBLIC_ADMIN_EMAIL`; optionally move to `admin_users` |
| Route group move breaks imports | Use `git mv`; run typecheck/build; URLs unchanged |
| Large gallery slows admin | Client-side pagination/load-more; lazy thumbnails; no full-res prefetch |
| Supabase image transformations unavailable | Do not use transform URLs; use original public URLs with lazy loading |
| Service-role key leakage | Never import service role into client code; scan built output; keep `server-only` boundary |

---

## 12. Current status snapshot

- Plan written: yes.
- Code changes started: yes.
- Build/typecheck/lint baseline: typecheck, lint, and build pass (Next 16.4.3, 32 static pages incl. 3 gallery detail routes).
- Browser QA: not yet run (no browser-automation script executed).
- Manual migration applied: no.
- Authenticated QA credentials: unavailable.
- Known defect: with zero published gallery images, `/gallery/[id]` exports a placeholder `_empty` route so static export can build; it resolves to notFound and is not linked.
- Sitemap fixes: `/sitemaps/` human-readable index added; `/sitemap.xml` now includes project and gallery detail URLs plus image entries. `/sitemaps/` is linked from the footer.
- Admin favicon: `/admin-favicon.svg` added and wired through admin metadata.
- Gallery/media cards: edit, publish, copy, and delete actions moved to an always-visible row under each card; publish uses eye/eye-off icons.
- Image SEO: gallery detail pages now emit generated descriptions and keyword sets (including name misspellings), plus `ImageObject` JSON-LD. The gallery editor prefills SEO defaults and offers a “Generate SEO defaults” action.
- Build freshness: `prebuild` clears `.next/cache` so build-time Supabase reads are not served from a stale Next fetch cache.
