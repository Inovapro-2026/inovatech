
-- Add FK from wallets to profiles to allow embedding in queries
ALTER TABLE public.wallets
DROP CONSTRAINT IF EXISTS wallets_user_id_fkey_profiles;

ALTER TABLE public.wallets
ADD CONSTRAINT wallets_user_id_fkey_profiles
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
