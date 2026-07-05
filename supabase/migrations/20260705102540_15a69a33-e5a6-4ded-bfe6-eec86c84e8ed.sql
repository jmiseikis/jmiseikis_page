
-- Move has_role out of the exposed public schema so it cannot be called via PostgREST
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- Recreate policies to reference private.has_role
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles
FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins read all items" ON public.items;
CREATE POLICY "Admins read all items" ON public.items
FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins update items" ON public.items;
CREATE POLICY "Admins update items" ON public.items
FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Public read item_sources of published items" ON public.item_sources;
CREATE POLICY "Public read item_sources of published items" ON public.item_sources
FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.items i WHERE i.id = item_sources.item_id AND (i.status = 'published' OR private.has_role(auth.uid(), 'admin'::public.app_role))));

DROP POLICY IF EXISTS "Public read item_investors of published items" ON public.item_investors;
CREATE POLICY "Public read item_investors of published items" ON public.item_investors
FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.items i WHERE i.id = item_investors.item_id AND (i.status = 'published' OR private.has_role(auth.uid(), 'admin'::public.app_role))));

DROP POLICY IF EXISTS "Admins read subscribers" ON public.digest_subscribers;
CREATE POLICY "Admins read subscribers" ON public.digest_subscribers
FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Drop the now-unused public.has_role so it's no longer exposed via PostgREST
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
