-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create admin user
DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'inovaprotechnology@gmail.com';
  v_password text := 'VmWH7Le9VJxjay;+Df3.';
BEGIN
  -- Check if user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    -- Create user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"admin","full_name":"Admin Inova"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO v_user_id;

    -- The trigger on auth.users will automatically create the profile in public.profiles
    -- based on the raw_user_meta_data provided above.
    
  ELSE
    -- Update existing user password and metadata
    UPDATE auth.users
    SET encrypted_password = crypt(v_password, gen_salt('bf')),
        raw_user_meta_data = jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{role}',
            '"admin"'
        )
    WHERE id = v_user_id;
    
    -- Ensure profile is admin in public schema
    -- We need to check if profile exists, if not create it (though trigger usually handles this)
    INSERT INTO public.profiles (id, email, role, full_name)
    VALUES (v_user_id, v_email, 'admin', 'Admin Inova')
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin';
    
  END IF;

END $$;
