-- Migration 001: Core tables for projects and gallery
-- Run this FIRST in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  index_label TEXT, -- "01", "02", etc.
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
  code TEXT, -- Short code like "LL", "FD"
  cover_image_id UUID, -- References gallery_images.id
  screenshot_ids UUID[] DEFAULT '{}', -- Array of gallery_images.id
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_image_id UUID, -- References gallery_images.id for social preview
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery images table
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storage_path TEXT UNIQUE NOT NULL, -- e.g., "gallery/abc123.webp"
  public_url TEXT, -- Supabase public URL
  title TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  caption TEXT,
  description TEXT,
  categories TEXT[] DEFAULT '{}', -- e.g., ['photography', 'events']
  tags TEXT[] DEFAULT '{}',
  collection_id UUID, -- Optional: self-reference for collections
  sort_order INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  format TEXT, -- webp, png, jpg, etc.
  file_size_bytes BIGINT,
  taken_at DATE, -- Only when known
  photographer TEXT, -- Creator/photographer credit
  copyright_holder TEXT,
  license TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collections (for grouping gallery images)
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

-- Add foreign key for gallery_images.collection_id
ALTER TABLE public.gallery_images
  ADD CONSTRAINT fk_gallery_images_collection
  FOREIGN KEY (collection_id) REFERENCES public.gallery_collections(id) ON DELETE SET NULL;

-- Add foreign keys for projects
ALTER TABLE public.projects
  ADD CONSTRAINT fk_projects_cover_image
  FOREIGN KEY (cover_image_id) REFERENCES public.gallery_images(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_projects_seo_image
  FOREIGN KEY (seo_image_id) REFERENCES public.gallery_images(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects (published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects (featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_gallery_images_published ON public.gallery_images (created_at DESC) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_gallery_images_categories ON public.gallery_images USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_gallery_images_tags ON public.gallery_images USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_gallery_images_collection ON public.gallery_images (collection_id);
CREATE INDEX IF NOT EXISTS idx_gallery_collections_published ON public.gallery_collections (sort_order) WHERE is_published = TRUE;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_collections_updated_at
  BEFORE UPDATE ON public.gallery_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();