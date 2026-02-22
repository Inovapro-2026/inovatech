-- 1. Função para criar notificações financeiras automaticamente
CREATE OR REPLACE FUNCTION public.handle_financial_notification()
RETURNS trigger AS $$
DECLARE
  msg_title TEXT;
  msg_body TEXT;
  notif_type TEXT := 'info';
BEGIN
  -- Notificações para Transações
  IF (TG_TABLE_NAME = 'transactions') THEN
    IF (NEW.status = 'completed') THEN
        IF (NEW.type = 'earnings') THEN
            msg_title := 'Pagamento Recebido! 💰';
            msg_body := 'Você recebeu R$ ' || NEW.amount || ' referente ao projeto ' || COALESCE(NEW.description, '');
            notif_type := 'success';
        ELSIF (NEW.type = 'withdrawal') THEN
            msg_title := 'Saque Concluído ✅';
            msg_body := 'Seu saque de R$ ' || NEW.amount || ' foi processado com sucesso.';
            notif_type := 'success';
        END IF;
    ELSIF (NEW.status = 'cancelled') THEN
        msg_title := 'Transação Cancelada ⚠️';
        msg_body := 'Uma transação de R$ ' || NEW.amount || ' foi cancelada ou estornada.';
        notif_type := 'warning';
    END IF;
  END IF;

  -- Notificações para Pedidos de Saque
  IF (TG_TABLE_NAME = 'withdrawal_requests') THEN
    IF (NEW.status = 'approved') THEN
        msg_title := 'Saque Aprovado! 💸';
        msg_body := 'Sua solicitação de saque de R$ ' || NEW.amount || ' foi aprovada e está sendo processada.';
        notif_type := 'success';
    ELSIF (NEW.status = 'rejected') THEN
        msg_title := 'Saque Rejeitado ❌';
        msg_body := 'Sua solicitação de saque de R$ ' || NEW.amount || ' não foi aprovada. Motivo: ' || COALESCE(NEW.admin_notes, 'Dados incorretos.');
        notif_type := 'error';
    END IF;
  END IF;

  -- Inserir na tabela de notificações se houver mensagem
  IF (msg_title IS NOT NULL) THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (NEW.user_id, msg_title, msg_body, notif_type);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Triggers para as tabelas financeiras
DROP TRIGGER IF EXISTS on_transaction_status_change ON public.transactions;
CREATE TRIGGER on_transaction_status_change
AFTER UPDATE OF status ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_financial_notification();

DROP TRIGGER IF EXISTS on_withdrawal_status_change ON public.withdrawal_requests;
CREATE TRIGGER on_withdrawal_status_change
AFTER UPDATE OF status ON public.withdrawal_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_financial_notification();

-- 3. Função para gerar ganhos quando um contrato é completado
CREATE OR REPLACE FUNCTION public.generate_earning_from_contract()
RETURNS trigger AS $$
BEGIN
  IF (NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed')) THEN
    INSERT INTO public.transactions (user_id, type, amount, status, description, contract_id)
    VALUES (
      NEW.freelancer_id, 
      'earnings', 
      NEW.amount * 0.9, -- Valor líquido (exemplo 10% taxa)
      'completed', 
      'Pagamento do contrato #' || SUBSTRING(NEW.id::text, 1, 8),
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_contract_completed_earning ON public.contracts;
CREATE TRIGGER on_contract_completed_earning
AFTER UPDATE OF status ON public.contracts
FOR EACH ROW EXECUTE FUNCTION public.generate_earning_from_contract();
