
-- Create projects table for marketplace vitrine
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  price numeric NOT NULL DEFAULT 0,
  cover_image_url text,
  image_urls text[] DEFAULT '{}',
  status text DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Anyone can view published projects
CREATE POLICY "Anyone can view published projects"
ON public.projects FOR SELECT
USING (status = 'published');

-- Freelancers can view their own projects
CREATE POLICY "Freelancers can view own projects"
ON public.projects FOR SELECT
USING (auth.uid() = freelancer_id);

-- Freelancers can insert their own projects
CREATE POLICY "Freelancers can insert own projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = freelancer_id);

-- Freelancers can update their own projects
CREATE POLICY "Freelancers can update own projects"
ON public.projects FOR UPDATE
USING (auth.uid() = freelancer_id);

-- Freelancers can delete their own projects
CREATE POLICY "Freelancers can delete own projects"
ON public.projects FOR DELETE
USING (auth.uid() = freelancer_id);

-- Admins can manage all projects
CREATE POLICY "Admins can manage all projects"
ON public.projects FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add pending_balance to wallets if it doesn't exist
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS pending_balance numeric DEFAULT 0;

-- Add updated_at trigger to projects
CREATE OR REPLACE FUNCTION public.update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_projects_updated_at();
