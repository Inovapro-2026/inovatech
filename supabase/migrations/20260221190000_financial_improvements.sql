-- 1. Melhorar a tabela de contratos
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS completed_at timestamptz,
ADD COLUMN IF NOT EXISTS paid_at timestamptz,
ADD COLUMN IF NOT EXISTS platform_fee numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount numeric(10,2) DEFAULT 0;

-- Atualizar net_amount para registros existentes (valor - 10% padrão de taxa)
UPDATE public.contracts 
SET platform_fee = amount * 0.10, 
    net_amount = amount * 0.90
WHERE net_amount = 0;

-- 2. Criar enums para transações e saques
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE public.transaction_type AS ENUM ('earnings', 'withdrawal', 'refund', 'bonus');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'processing');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'withdrawal_status') THEN
        CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'processing', 'completed');
    END IF;
END$$;

-- 3. Criar tabela de transações
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type public.transaction_type NOT NULL,
    amount numeric(12,2) NOT NULL,
    status public.transaction_status DEFAULT 'pending',
    description TEXT,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- Habilitar RLS para transações
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Criar tabela de solicitações de saque
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount numeric(12,2) NOT NULL,
    status public.withdrawal_status DEFAULT 'pending',
    bank_account_data JSONB NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ,
    admin_notes TEXT
);

-- Habilitar RLS para saques
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own withdrawals" ON public.withdrawal_requests;
CREATE POLICY "Users can view their own withdrawals" 
ON public.withdrawal_requests FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can request withdrawals" ON public.withdrawal_requests;
CREATE POLICY "Users can request withdrawals" 
ON public.withdrawal_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. Criar tabela de métodos de pagamento (Contas Bancárias/PIX)
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'pix', 'bank'
    label TEXT NOT NULL,
    data JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para métodos de pagamento
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own payment methods" ON public.payment_methods;
CREATE POLICY "Users can manage their own payment methods" 
ON public.payment_methods FOR ALL 
USING (auth.uid() = user_id);

-- 6. Ativar Realtime para as novas tabelas
-- Nota: Isso pode variar dependendo de como sua publicação 'supabase_realtime' está configurada.
-- Se ela já existe e inclui todas as tabelas, não é necessário.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawal_requests;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_methods;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Ignorar erro se a tabela já estiver na publicação
END$$;
