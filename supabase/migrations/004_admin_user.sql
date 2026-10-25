-- Migration 004: Admin user setup
-- Run this FOURTH in Supabase SQL Editor
-- AFTER creating your admin user in Supabase Auth Dashboard

-- Table to store authorized admin emails
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin_users table
CREATE POLICY "Admin can read admin users"
  ON public.admin_users
  FOR SELECT
  USING (public.is_admin_user());

-- Only admins can manage admin users
CREATE POLICY "Admin can manage admin users"
  ON public.admin_users
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- MANUAL STEP: After running this migration,
-- do the following in Supabase Dashboard:
--
-- 1. Go to Authentication > Users > "Add user"
-- 2. Create your admin account with email: aakifshaik512@gmail.com
-- 3. Copy the generated User UUID
-- 4. Run this SQL (replace YOUR_USER_UUID):
--
-- INSERT INTO public.admin_users (email, user_id)
-- VALUES ('aakifshaik512@gmail.com', 'YOUR_USER_UUID')
-- ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;
--
-- 5. Verify: SELECT * FROM public.admin_users;
-- ============================================