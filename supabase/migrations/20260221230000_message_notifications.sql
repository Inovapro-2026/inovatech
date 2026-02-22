
-- 1. Criar a tabela de notificações se ela não existir
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar RLS na tabela de notificações
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para notificações
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications'
    ) THEN
        CREATE POLICY "Users can view own notifications" ON public.notifications
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update own notifications'
    ) THEN
        CREATE POLICY "Users can update own notifications" ON public.notifications
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END$$;

-- 4. Função para disparar notificação quando uma nova mensagem é inserida
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Só insere se o destinatário for diferente do remetente (evitar auto-notificação se alguém mandar msg pra si mesmo)
    IF NEW.receiver_id IS NOT NULL AND NEW.sender_id != NEW.receiver_id THEN
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            NEW.receiver_id,
            'Nova Mensagem',
            substring(NEW.content from 1 for 100), -- Primeiros 100 caracteres
            'info',
            '/mensagens' -- Link genérico, pode ser ajustado conforme a rota do painel
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger na tabela de mensagens
DROP TRIGGER IF EXISTS tr_new_message_notification ON public.messages;
CREATE TRIGGER tr_new_message_notification
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_message_notification();

-- 6. Garantir que a tabela de notificações está no Realtime
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
        EXCEPTION WHEN others THEN 
            -- Tabela já pode estar na publicação
        END;
    END IF;
END$$;
