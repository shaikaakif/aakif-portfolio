-- Aakif Studio — idempotent setup
-- Safe to run multiple times in the Supabase SQL Editor.

-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Tables
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  index_label TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Live', 'Case study')),
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  problem TEXT,
  solution TEXT,
  stack TEXT[] DEFAULT '{}',
  live_url TEXT,
  github_url TEXT,
  metric TEXT,
  tone TEXT NOT NULL CHECK (tone IN ('clay', 'cobalt', 'sage', 'amber', 'rose', 'plum', 'ink')),
  artwork TEXT NOT NULL CHECK (artwork IN ('orbit', 'grid', 'wave', 'stack', 'aperture', 'fold', 'pulse')),
  code TEXT,
  cover_image_id UUID,
  screenshot_ids UUID[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_image_id UUID,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storage_path TEXT UNIQUE NOT NULL,
  public_url TEXT,
  title TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  caption TEXT,
  description TEXT,
  categories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  collection_id UUID,
  sort_order INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  format TEXT,
  file_size_bytes BIGINT,
  taken_at DATE,
  photographer TEXT,
  copyright_holder TEXT,
  license TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gallery_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_id UUID REFERENCES public.gallery_images(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Foreign keys (added only if missing)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_gallery_images_collection'
  ) THEN
    ALTER TABLE public.gallery_images
      ADD CONSTRAINT fk_gallery_images_collection
      FOREIGN KEY (collection_id) REFERENCES public.gallery_collections(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_projects_cover_image'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT fk_projects_cover_image
      FOREIGN KEY (cover_image_id) REFERENCES public.gallery_images(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_projects_seo_image'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT fk_projects_seo_image
      FOREIGN KEY (seo_image_id) REFERENCES public.gallery_images(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects (published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects (featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_gallery_images_published ON public.gallery_images (created_at DESC) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_gallery_images_categories ON public.gallery_images USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_gallery_images_tags ON public.gallery_images USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_gallery_images_collection ON public.gallery_images (collection_id);
CREATE INDEX IF NOT EXISTS idx_gallery_collections_published ON public.gallery_collections (sort_order) WHERE is_published = TRUE;

-- ============================================================
-- updated_at trigger function + triggers
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_images_updated_at ON public.gallery_images;
CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_collections_updated_at ON public.gallery_collections;
CREATE TRIGGER update_gallery_collections_updated_at
  BEFORE UPDATE ON public.gallery_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Enable RLS
-- ============================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Admin check: authorized by signed-in email (no admin_users row needed)
-- Change the email below if your admin account changes.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND lower(email) = lower('aakifshaik512@gmail.com')
  );
$$;

-- ============================================================
-- Policies (dropped first so re-runs don't fail)
-- ============================================================
DROP POLICY IF EXISTS "Public can read published projects" ON public.projects;
CREATE POLICY "Public can read published projects"
  ON public.projects FOR SELECT
  USING (published_at IS NOT NULL);

DROP POLICY IF EXISTS "Admin can manage projects" ON public.projects;
CREATE POLICY "Admin can manage projects"
  ON public.projects FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "Public can read published gallery images" ON public.gallery_images;
CREATE POLICY "Public can read published gallery images"
  ON public.gallery_images FOR SELECT
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "Admin can manage gallery images" ON public.gallery_images;
CREATE POLICY "Admin can manage gallery images"
  ON public.gallery_images FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "Public can read published collections" ON public.gallery_collections;
CREATE POLICY "Public can read published collections"
  ON public.gallery_collections FOR SELECT
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "Admin can manage collections" ON public.gallery_collections;
CREATE POLICY "Admin can manage collections"
  ON public.gallery_collections FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "Admin can read admin users" ON public.admin_users;
CREATE POLICY "Admin can read admin users"
  ON public.admin_users FOR SELECT
  USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admin can manage admin users" ON public.admin_users;
CREATE POLICY "Admin can manage admin users"
  ON public.admin_users FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- ============================================================
-- Storage bucket + policies
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-media',
  'portfolio-media',
  TRUE,
  10485760,
  ARRAY['image/webp', 'image/png', 'image/jpeg', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Admin write access" ON storage.objects;
CREATE POLICY "Admin write access"
  ON storage.objects FOR ALL
  USING (bucket_id = 'portfolio-media' AND public.is_admin_user())
  WITH CHECK (bucket_id = 'portfolio-media' AND public.is_admin_user());
