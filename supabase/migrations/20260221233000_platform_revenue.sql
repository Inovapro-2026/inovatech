
-- Criar tabela de receita da plataforma se não existir (necessária para o webhook do mercado pago)
CREATE TABLE IF NOT EXISTS public.platform_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    service_value NUMERIC(12,2) NOT NULL,
    fee_amount NUMERIC(12,2) NOT NULL,
    fee_percentage NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS (apenas admins devem ver isso)
ALTER TABLE public.platform_revenue ENABLE ROW LEVEL SECURITY;

-- Política simples para Admin (ajustar conforme política de roles do projeto)
DROP POLICY IF EXISTS "Admins can view platform revenue" ON public.platform_revenue;
CREATE POLICY "Admins can view platform revenue" 
ON public.platform_revenue FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
