
-- 1. Remover colunas de plano da tabela profiles
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS plan_type,
DROP COLUMN IF EXISTS plan_status,
DROP COLUMN IF EXISTS subscription_id,
DROP COLUMN IF EXISTS plan_expires_at;

-- 2. Atualizar tabela contracts para suportar o modelo transacional
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS service_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS platform_fee_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);

-- 3. Criar tabela de transações para auditoria
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.contracts(id),
  user_id UUID REFERENCES public.profiles(id),
  type TEXT CHECK (type IN ('payment', 'fee', 'payout', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')),
  mp_transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_contract ON public.transactions(contract_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);

-- 4. Criar tabela de receita da plataforma (para Admin)
CREATE TABLE IF NOT EXISTS public.platform_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.contracts(id),
  fee_amount DECIMAL(10,2) NOT NULL,
  fee_percentage DECIMAL(5,2) NOT NULL,
  service_value DECIMAL(10,2) NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_date ON public.platform_revenue(collected_at);

-- 5. Configurar RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_revenue ENABLE ROW LEVEL SECURITY;

-- Políticas para Transactions
DROP POLICY IF EXISTS "Transaction owner view" ON public.transactions;
CREATE POLICY "Transaction owner view" ON public.transactions 
FOR SELECT USING (auth.uid() = user_id);

-- Políticas para Platform Revenue (Apenas Admin)
DROP POLICY IF EXISTS "Admin revenue view" ON public.platform_revenue;
CREATE POLICY "Admin revenue view" ON public.platform_revenue 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Políticas para Contracts (Apenas participantes ou Admin)
DROP POLICY IF EXISTS "Participants can view contracts" ON public.contracts;
CREATE POLICY "Participants can view contracts" ON public.contracts 
FOR SELECT USING (
  auth.uid() = client_id OR 
  auth.uid() = freelancer_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
