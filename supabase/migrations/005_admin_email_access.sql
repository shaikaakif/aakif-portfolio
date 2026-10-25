-- Migration 005: Authorize the admin by email directly
-- Run this after 001-004 (or any time after the tables exist).
--
-- This makes admin access depend only on the signed-in Supabase Auth user's
-- email, so you do NOT need a matching row in public.admin_users.
-- Change the email below if your admin account uses a different address.

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

-- Verify (run while signed in as the admin user via the app, or inspect):
-- SELECT public.is_admin_user();
