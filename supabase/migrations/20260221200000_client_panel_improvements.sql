
-- 1. Melhorias na tabela de perfis (profiles)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_status') THEN
        CREATE TYPE public.profile_status AS ENUM ('active', 'inactive', 'banned', 'deleted');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
        CREATE TYPE public.plan_type AS ENUM ('free', 'pro', 'enterprise');
    END IF;
END$$;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS cnpj text,
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS language text DEFAULT 'pt-BR',
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/Sao_Paulo',
ADD COLUMN IF NOT EXISTS billing_name text,
ADD COLUMN IF NOT EXISTS billing_cnpj text,
ADD COLUMN IF NOT EXISTS billing_address text,
ADD COLUMN IF NOT EXISTS billing_zipcode text,
ADD COLUMN IF NOT EXISTS billing_city text,
ADD COLUMN IF NOT EXISTS plan_type public.plan_type DEFAULT 'free',
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS status public.profile_status DEFAULT 'active';

-- 2. Melhorias na tabela de mensagens para suportar conversas genéricas
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS conversation_id uuid,
ADD COLUMN IF NOT EXISTS receiver_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS file_url text,
ADD COLUMN IF NOT EXISTS type text DEFAULT 'text'; -- 'text' ou 'file'

-- 3. Melhorias na tabela de revisões
ALTER TABLE public.revisions 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- 4. Habilitar Realtime para tabelas críticas se ainda não estiverem
-- (A maioria já deve estar configurada nas migrações anteriores, mas por precaução)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        -- Tentar adicionar as tabelas à publicação de realtime
        -- Usamos um bloco aninhado para capturar erros caso a tabela já esteja na publicação
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;
        EXCEPTION WHEN others THEN END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.revisions;
        EXCEPTION WHEN others THEN END;
    END IF;
END$$;

-- 5. Atualizar políticas RLS para as novas colunas/tabelas
-- (Verificar se são necessárias novas políticas específicas)
