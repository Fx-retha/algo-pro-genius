-- Function to enforce the 500 license record limit
CREATE OR REPLACE FUNCTION public.check_license_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT count(*) FROM public.license_keys) >= 500 THEN
    RAISE EXCEPTION 'Maximum license capacity of 500 reached.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce the limit before insertion
DROP TRIGGER IF EXISTS enforce_license_limit ON public.license_keys;
CREATE TRIGGER enforce_license_limit
BEFORE INSERT ON public.license_keys
FOR EACH ROW
EXECUTE FUNCTION public.check_license_limit();

-- RPC to get accurate inventory stats
CREATE OR REPLACE FUNCTION public.get_license_inventory_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_limit CONSTANT INTEGER := 500;
  current_total INTEGER;
  used_count INTEGER;
  remaining_count INTEGER;
BEGIN
  SELECT count(*) INTO current_total FROM public.license_keys;
  SELECT count(*) INTO used_count FROM public.license_keys WHERE user_id IS NOT NULL;
  
  -- Remaining is capacity left (Total Limit - Used)
  -- Or maybe "Inventory Remaining" which is Unassigned Keys?
  -- Let's provide all metrics for the dashboard.
  
  RETURN json_build_object(
    'limit', total_limit,
    'total_records', current_total,
    'used', used_count,
    'unassigned', (current_total - used_count),
    'remaining_capacity', (total_limit - current_total)
  );
END;
$$;
