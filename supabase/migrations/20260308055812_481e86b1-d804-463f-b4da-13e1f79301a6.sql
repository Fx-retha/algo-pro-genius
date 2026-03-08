-- Drop all existing restrictive policies on license_keys
DROP POLICY IF EXISTS "Admins can delete licenses" ON public.license_keys;
DROP POLICY IF EXISTS "Admins can insert licenses" ON public.license_keys;
DROP POLICY IF EXISTS "Admins can update licenses" ON public.license_keys;
DROP POLICY IF EXISTS "Admins can view all licenses" ON public.license_keys;
DROP POLICY IF EXISTS "Users can view their own license" ON public.license_keys;
DROP POLICY IF EXISTS "Users can activate unassigned licenses" ON public.license_keys;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admins can view all licenses"
ON public.license_keys FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert licenses"
ON public.license_keys FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update licenses"
ON public.license_keys FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete licenses"
ON public.license_keys FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own license"
ON public.license_keys FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can activate unassigned licenses"
ON public.license_keys FOR UPDATE TO authenticated
USING (user_id IS NULL AND status = 'active')
WITH CHECK (user_id = auth.uid());