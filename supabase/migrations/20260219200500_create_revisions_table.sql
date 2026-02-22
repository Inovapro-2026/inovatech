CREATE TABLE public.revisions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE,
  message text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view revisions"
ON public.revisions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = revisions.contract_id
    AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())
  )
);

CREATE POLICY "Clients can create revisions"
ON public.revisions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_id
    AND contracts.client_id = auth.uid()
  )
);
