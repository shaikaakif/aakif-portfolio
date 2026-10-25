-- Migration 003: Supabase Storage buckets and policies
-- Run this THIRD in Supabase SQL Editor

-- Create storage bucket for portfolio media
-- Single bucket with path prefixes for organization
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-media',
  'portfolio-media',
  TRUE, -- Public bucket for published images
  10485760, -- 10MB limit
  ARRAY['image/webp', 'image/png', 'image/jpeg', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies

-- Public: read all files in public bucket
CREATE POLICY "Public read access"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'portfolio-media');

-- Admin: full write access (upload, update, delete)
CREATE POLICY "Admin write access"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'portfolio-media'
    AND public.is_admin_user()
  )
  WITH CHECK (
    bucket_id = 'portfolio-media'
    AND public.is_admin_user()
  );

-- Note: For more granular control, you could create separate policies per path prefix:
-- CREATE POLICY "Admin manage projects"
--   ON storage.objects FOR ALL
--   USING (bucket_id = 'portfolio-media' AND (storage.foldername(name))[1] = 'projects' AND public.is_admin_user());
-- CREATE POLICY "Admin manage blog"
--   ON storage.objects FOR ALL
--   USING (bucket_id = 'portfolio-media' AND (storage.foldername(name))[1] = 'blog' AND public.is_admin_user());
-- CREATE POLICY "Admin manage gallery"
--   ON storage.objects FOR ALL
--   USING (bucket_id = 'portfolio-media' AND (storage.foldername(name))[1] = 'gallery' AND public.is_admin_user());