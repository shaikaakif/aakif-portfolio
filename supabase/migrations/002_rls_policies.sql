-- Migration 002: Row Level Security policies
-- Run this SECOND in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_collections ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
-- This will be populated when we create the admin user
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get current user's email from auth
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  -- Check against authorized admin emails (configure in 004_admin_user.sql)
  RETURN user_email IN (
    SELECT email FROM public.admin_users WHERE is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- Public: read published projects only
CREATE POLICY "Public can read published projects"
  ON public.projects
  FOR SELECT
  USING (published_at IS NOT NULL);

-- Admin: full access to projects
CREATE POLICY "Admin can manage projects"
  ON public.projects
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- ============================================
-- GALLERY IMAGES POLICIES
-- ============================================

-- Public: read published gallery images only
CREATE POLICY "Public can read published gallery images"
  ON public.gallery_images
  FOR SELECT
  USING (is_published = TRUE);

-- Admin: full access to gallery images
CREATE POLICY "Admin can manage gallery images"
  ON public.gallery_images
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- ============================================
-- GALLERY COLLECTIONS POLICIES
-- ============================================

-- Public: read published collections only
CREATE POLICY "Public can read published collections"
  ON public.gallery_collections
  FOR SELECT
  USING (is_published = TRUE);

-- Admin: full access to collections
CREATE POLICY "Admin can manage collections"
  ON public.gallery_collections
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());