CREATE TABLE IF NOT EXISTS public.asset_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  operation TEXT NOT NULL, -- 'buy', 'sell', 'dividend'
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'BRL',
  operation_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Políticas de Segurança RLS
ALTER TABLE public.asset_transactions ENABLE ROW LEVEL SECURITY;

-- Criar política: usuários só podem ver e gerenciar as próprias transações
CREATE POLICY "Users can manage their own asset transactions"
ON public.asset_transactions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
