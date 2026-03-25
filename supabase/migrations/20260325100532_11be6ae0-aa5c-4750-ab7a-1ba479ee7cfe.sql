CREATE OR REPLACE FUNCTION public.generate_mentor_id()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  chars TEXT := '0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$function$