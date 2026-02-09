
-- Drop all existing RESTRICTIVE policies on license_keys
DROP POLICY IF EXISTS "Admins can delete licenses" ON public.license_keys;
DROP POLICY IF EXISTS "Admins can insert licenses" ON public.license_keys;
DROP POLICY IF EXISTS "Admins can update licenses" ON public.license_keys;
DROP POLICY IF EXISTS "Admins can view all licenses" ON public.license_keys;
DROP POLICY IF EXISTS "Users can activate unassigned licenses" ON public.license_keys;
DROP POLICY IF EXISTS "Users can view their own license" ON public.license_keys;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admins can delete licenses"
ON public.license_keys FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert licenses"
ON public.license_keys FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update licenses"
ON public.license_keys FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all licenses"
ON public.license_keys FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own license"
ON public.license_keys FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can activate unassigned licenses"
ON public.license_keys FOR UPDATE TO authenticated
USING ((user_id IS NULL) AND (status = 'active'::text))
WITH CHECK (user_id = auth.uid());

-- Also fix mentor_applications policies (same issue)
DROP POLICY IF EXISTS "Admins can delete applications" ON public.mentor_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.mentor_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.mentor_applications;
DROP POLICY IF EXISTS "Users can create their own application" ON public.mentor_applications;
DROP POLICY IF EXISTS "Users can view their own application" ON public.mentor_applications;

CREATE POLICY "Admins can delete applications"
ON public.mentor_applications FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update applications"
ON public.mentor_applications FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all applications"
ON public.mentor_applications FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own application"
ON public.mentor_applications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own application"
ON public.mentor_applications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix user_roles policies too
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);
