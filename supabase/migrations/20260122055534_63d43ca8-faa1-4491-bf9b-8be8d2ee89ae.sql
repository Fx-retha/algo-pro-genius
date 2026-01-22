-- Add mentor_id to profiles for unique mentor identification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mentor_id text UNIQUE;

-- Create function to generate unique mentor ID
CREATE OR REPLACE FUNCTION public.generate_mentor_id()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..5 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Create trigger to auto-generate mentor_id for admins
CREATE OR REPLACE FUNCTION public.set_mentor_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.mentor_id IS NULL THEN
    NEW.mentor_id := generate_mentor_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_mentor_id_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_mentor_id();