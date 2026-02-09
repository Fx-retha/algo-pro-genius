
-- Function to validate a license key without requiring authentication
-- Returns basic info: whether key is valid, its status, plan, and if it's already assigned
CREATE OR REPLACE FUNCTION public.validate_license_key(license_key text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  license_record RECORD;
BEGIN
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
$$;

-- Function to activate a license key for the current authenticated user
CREATE OR REPLACE FUNCTION public.activate_license_key(license_key text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  license_record RECORD;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT id, status, user_id, expires_at
  INTO license_record
  FROM public.license_keys
  WHERE key = upper(license_key);

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid license key');
  END IF;

  IF license_record.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'License key is not active');
  END IF;

  IF license_record.expires_at IS NOT NULL AND license_record.expires_at < now() THEN
    RETURN json_build_object('success', false, 'error', 'License key has expired');
  END IF;

  IF license_record.user_id IS NOT NULL AND license_record.user_id != current_user_id THEN
    RETURN json_build_object('success', false, 'error', 'License key already assigned to another user');
  END IF;

  -- If already assigned to this user, just return success
  IF license_record.user_id = current_user_id THEN
    RETURN json_build_object('success', true);
  END IF;

  -- Activate the license
  UPDATE public.license_keys
  SET user_id = current_user_id,
      activated_at = now()
  WHERE id = license_record.id;

  RETURN json_build_object('success', true);
END;
$$;
