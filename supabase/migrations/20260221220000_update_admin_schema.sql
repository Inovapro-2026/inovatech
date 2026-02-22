
-- Update disputes table to match the guide
ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS decision jsonb;
ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';
ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS assigned_admin uuid REFERENCES public.admin_users(id);

-- Create types if they don't exist (or just use text for simplicity and flexibility)
-- We'll use text for priority to avoid enum conflicts if not needed strictly

-- Ensure admin_logs has all fields
ALTER TABLE public.admin_logs ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE public.admin_logs ADD COLUMN IF NOT EXISTS user_agent text;

-- Create platform_settings if it doesn't exist (it does, but just in case)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_by uuid REFERENCES public.admin_users(id)
);
