-- 1. Criar o enum para papéis (roles)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('client', 'freelancer', 'admin');
    ELSE
        -- Garantir que os valores novos existam no enum se ele já existir
        ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';
        ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'freelancer';
        ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
    END IF;
END$$;

-- 2. Garantir a estrutura da tabela profiles (Aditiva para não quebrar tabelas existentes)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role public.app_role DEFAULT 'client';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_onboarding_complete boolean DEFAULT false;

-- Remover restrições antigas se existirem (ex: check constraints de versões anteriores)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Certificar que role é do tipo enum correto
ALTER TABLE public.profiles ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;

-- 3. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 5. Função Trigger para manter imutabilidade do `role`
CREATE OR REPLACE FUNCTION protect_profile_role()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Acesso Negado: O campo role não pode ser alterado por usuários.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protect_profile_role_trigger ON public.profiles;
CREATE TRIGGER protect_profile_role_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION protect_profile_role();

-- 6. Função para criar perfil automaticamente no Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role public.app_role;
BEGIN
  -- Identifica o role vindo no user_metadata do Supabase Auth.
  -- Aceita freelancer/seller e client/customer para retrocompatibilidade
  IF NEW.raw_user_meta_data->>'role' = 'freelancer' OR NEW.raw_user_meta_data->>'role' = 'seller' THEN
    assigned_role := 'freelancer'::public.app_role;
  ELSIF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    assigned_role := 'admin'::public.app_role;
  ELSE
    assigned_role := 'client'::public.app_role;
  END IF;

  INSERT INTO public.profiles (id, email, role, full_name, is_onboarding_complete)
  VALUES (
    NEW.id, 
    NEW.email, 
    assigned_role,
    NEW.raw_user_meta_data->>'full_name',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;
  
  -- Sincronizar com tabela de freelancers se necessário
  IF assigned_role = 'freelancer' THEN
    INSERT INTO public.freelancers (id, availability_status)
    VALUES (NEW.id, 'AVAILABLE')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparada após o Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para updated_at atualizado
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
