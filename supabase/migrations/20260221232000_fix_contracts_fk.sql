
-- Add FKs from contracts to profiles to allow embedding in queries
ALTER TABLE public.contracts
DROP CONSTRAINT IF EXISTS contracts_client_id_fkey_profiles;

ALTER TABLE public.contracts
ADD CONSTRAINT contracts_client_id_fkey_profiles
FOREIGN KEY (client_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

ALTER TABLE public.contracts
DROP CONSTRAINT IF EXISTS contracts_freelancer_id_fkey_profiles;

ALTER TABLE public.contracts
ADD CONSTRAINT contracts_freelancer_id_fkey_profiles
FOREIGN KEY (freelancer_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
