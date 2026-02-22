
-- Ensure RLS is enabled
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own admin status" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can read all admin users" ON public.admin_users;

-- Allow users to read their own admin status
CREATE POLICY "Users can read own admin status"
ON public.admin_users
FOR SELECT
USING (auth.uid() = id);

-- Allow super admins to manage admin users (optional, but good practice)
-- This assumes we can determine who is a super admin. 
-- For now, let's just stick to the basic self-read policy which is sufficient for login.
