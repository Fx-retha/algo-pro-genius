-- 1. Remove broad license claim policy (any user could claim any unassigned key)
DROP POLICY IF EXISTS "Users can activate unassigned licenses" ON public.license_keys;

-- 2. Ensure RLS is enabled everywhere
ALTER TABLE public.mentor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mt_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_configs ENABLE ROW LEVEL SECURITY;

-- 3. Prevent any direct role writes from clients (roles are admin/service managed)
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;
REVOKE ALL ON public.user_roles FROM anon;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- 4. Lock down mentor_applications PII to owner + admin only
REVOKE ALL ON public.mentor_applications FROM anon;
GRANT SELECT, INSERT ON public.mentor_applications TO authenticated;
GRANT ALL ON public.mentor_applications TO service_role;

-- 5. license_keys: no anon access at all
REVOKE ALL ON public.license_keys FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.license_keys TO authenticated;
GRANT ALL ON public.license_keys TO service_role;

-- 6. validate_license_key must require authentication
CREATE OR REPLACE FUNCTION public.validate_license_key(license_key text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  license_record RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('valid', false, 'error', 'Authentication required');
  END IF;

  SELECT id, key, status, plan, user_id, expires_at
  INTO license_record
  FROM public.license_keys
  WHERE key = upper(license_key);

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid license key');
  END IF;

  IF license_record.status != 'active' THEN
    RETURN json_build_object('valid', false, 'error', 'This license key is not active');
  END IF;

  IF license_record.expires_at IS NOT NULL AND license_record.expires_at < now() THEN
    RETURN json_build_object('valid', false, 'error', 'This license key has expired');
  END IF;

  RETURN json_build_object(
    'valid', true,
    'plan', license_record.plan,
    'assigned', license_record.user_id IS NOT NULL
  );
END;
$function$;

-- 7. Cryptographically secure, admin-only license key generation
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.generate_license_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
  segment INTEGER;
  rnd BYTEA;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only administrators can generate license keys';
  END IF;

  rnd := extensions.gen_random_bytes(16);
  FOR segment IN 1..4 LOOP
    IF segment > 1 THEN
      result := result || '-';
    END IF;
    FOR i IN 1..4 LOOP
      result := result || substr(chars, (get_byte(rnd, (segment - 1) * 4 + i - 1) % length(chars)) + 1, 1);
    END LOOP;
  END LOOP;
  RETURN result;
END;
$function$;

-- 8. Restrict EXECUTE on internal / definer functions
REVOKE ALL ON FUNCTION public.generate_license_key() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_license_key() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.generate_mentor_id() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_mentor_id() TO service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_mentor_id() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.validate_license_key(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validate_license_key(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.activate_license_key(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activate_license_key(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;