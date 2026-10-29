-- Aakif Studio — site settings
-- Run this in the Supabase SQL Editor. Safe to run more than once.

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public can read public settings" on public.site_settings;
create policy "Public can read public settings"
  on public.site_settings for select
  using (key in ('site_identity', 'seo_defaults', 'social_links', 'gallery_defaults', 'publishing'));

drop policy if exists "Admin can manage settings" on public.site_settings;
create policy "Admin can manage settings"
  on public.site_settings for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop trigger if exists update_site_settings_updated_at on public.site_settings;
create trigger update_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.update_updated_at_column();

insert into public.site_settings (key, value) values
  ('site_identity', '{"name":"Shaik Aakif","tagline":"AI Builder & Product Developer","email":"aakifshaik512@gmail.com"}'),
  ('seo_defaults', '{"title":"Shaik Aakif — AI Builder & Product Developer","description":"Shaik Aakif is an AI builder, product developer and entrepreneur building AI-powered products, full-stack applications and intelligent systems."}'),
  ('social_links', '{"website":"https://shaikaakif.com","github":"https://github.com/shaikaakif","linkedin":"","instagram":""}'),
  ('gallery_defaults', '{"defaultStatus":"draft","defaultCategories":[]}'),
  ('publishing', '{"requireAltText":true,"autoPublishOnUpload":false}')
on conflict (key) do nothing;
