ALTER TABLE public.contracts
DROP CONSTRAINT IF EXISTS contracts_project_id_fkey,
ADD CONSTRAINT contracts_project_id_fkey
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Client and Freelancer on Contracts already reference profiles(id), doing nothing on those.

-- Ensure messages constraints are correct:
ALTER TABLE public.messages
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.messages
DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey,
ADD CONSTRAINT messages_receiver_id_fkey
FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Ensure reviews constraints are correct:
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey,
ADD CONSTRAINT reviews_reviewer_id_fkey
FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_reviewee_id_fkey,
ADD CONSTRAINT reviews_reviewee_id_fkey
FOREIGN KEY (reviewee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
