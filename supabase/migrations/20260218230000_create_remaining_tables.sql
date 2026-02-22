
-- Create contracts table
CREATE TYPE contract_status AS ENUM ('pending_acceptance', 'in_progress', 'delivered', 'completed', 'cancelled_refunded', 'dispute');

CREATE TABLE public.contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id),
  client_id uuid REFERENCES auth.users(id) NOT NULL,
  freelancer_id uuid REFERENCES auth.users(id) NOT NULL,
  amount numeric NOT NULL,
  stripe_payment_intent_id text,
  mp_payment_id text,
  status contract_status DEFAULT 'pending_acceptance',
  accepted_at timestamptz,
  deadline timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Contract Policies
CREATE POLICY "Users can view own contracts"
ON public.contracts FOR SELECT
USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

CREATE POLICY "Clients can create contracts"
ON public.contracts FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update own contracts"
ON public.contracts FOR UPDATE
USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

-- Create deliveries table
CREATE TABLE public.deliveries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE,
  message text,
  files_urls text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Delivery Policies
CREATE POLICY "Participants can view deliveries"
ON public.deliveries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = deliveries.contract_id
    AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())
  )
);

CREATE POLICY "Freelancers can create deliveries"
ON public.deliveries FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_id
    AND contracts.freelancer_id = auth.uid()
  )
);

-- Create messages table for chat
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Message Policies
CREATE POLICY "Participants can view messages"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = messages.contract_id
    AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())
  )
);

CREATE POLICY "Participants can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_id
    AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())
  )
);

-- Create reviews table
CREATE TABLE public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid REFERENCES public.contracts(id),
  reviewer_id uuid REFERENCES auth.users(id),
  rated_id uuid REFERENCES auth.users(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reviews view"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Participants can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = reviewer_id);

-- Realtime Setup
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table contracts;
