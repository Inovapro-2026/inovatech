
-- Grant super_admin permissions to the created user
DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'inovaprotechnology@gmail.com';
BEGIN
  -- Get user id
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NOT NULL THEN
    -- Insert into admin_users
    INSERT INTO public.admin_users (id, role, permissions)
    VALUES (v_user_id, 'super_admin', '{"all"}')
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin';
  END IF;
END $$;
