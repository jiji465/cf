-- ============================================
-- CORREÇÃO: Adicionar 'deleted' ao constraint de ação do histórico
-- ============================================

-- Remover o constraint antigo
ALTER TABLE public.history DROP CONSTRAINT IF EXISTS history_action_check;

-- Adicionar novo constraint incluindo 'deleted'
ALTER TABLE public.history ADD CONSTRAINT history_action_check 
  CHECK (action IN ('created', 'updated', 'completed', 'status_changed', 'comment_added', 'deleted'));

-- Atualizar a função de histórico para incluir DELETE
CREATE OR REPLACE FUNCTION public.add_history_entry()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.history (entity_type, entity_id, action, description, user_name)
    VALUES (TG_ARGV[0], NEW.id, 'created', 'Registro criado', 'Sistema');
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO public.history (entity_type, entity_id, action, description, user_name)
      VALUES (TG_ARGV[0], NEW.id, 'status_changed', 
              'Status alterado de ' || OLD.status || ' para ' || NEW.status, 
              COALESCE(NEW.completed_by, 'Sistema'));
    END IF;
    
    IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
      INSERT INTO public.history (entity_type, entity_id, action, description, user_name)
      VALUES (TG_ARGV[0], NEW.id, 'completed', 
              'Registro concluído em ' || NEW.completed_at::TEXT, 
              COALESCE(NEW.completed_by, 'Sistema'));
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Adicionar entrada de histórico para exclusão
    INSERT INTO public.history (entity_type, entity_id, action, description, user_name)
    VALUES (TG_ARGV[0], OLD.id, 'deleted', 'Registro excluído', 'Sistema');
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recriar triggers para incluir DELETE
DROP TRIGGER IF EXISTS obligations_history_trigger ON public.obligations;
CREATE TRIGGER obligations_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.obligations
  FOR EACH ROW
  EXECUTE FUNCTION public.add_history_entry('obligation');

DROP TRIGGER IF EXISTS taxes_history_trigger ON public.taxes;
CREATE TRIGGER taxes_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.taxes
  FOR EACH ROW
  EXECUTE FUNCTION public.add_history_entry('tax');

DROP TRIGGER IF EXISTS installments_history_trigger ON public.installments;
CREATE TRIGGER installments_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.installments
  FOR EACH ROW
  EXECUTE FUNCTION public.add_history_entry('installment');

DROP TRIGGER IF EXISTS clients_history_trigger ON public.clients;
CREATE TRIGGER clients_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.add_history_entry('client');

-- ============================================
-- CORREÇÃO CONCLUÍDA!
-- ============================================
