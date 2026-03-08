ALTER TABLE public.license_keys
DROP CONSTRAINT IF EXISTS license_keys_plan_check;

ALTER TABLE public.license_keys
ADD CONSTRAINT license_keys_plan_check
CHECK (
  plan = ANY (ARRAY['basic'::text, 'pro'::text, 'enterprise'::text, 'days'::text, 'lifetime'::text])
);