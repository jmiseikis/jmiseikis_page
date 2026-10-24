-- Retire Swiss Tech Pulse. The feature was never launched and the website no longer uses it.
-- Checked on 24 October 2026: every table below had 0 rows, nothing else referenced these objects,
-- and the private schema held only private.has_role.
-- Dropping a table also drops its policies, triggers, indexes and grants.
-- No CASCADE: if anything unexpected depends on these objects, the migration stops instead.

DROP TABLE IF EXISTS public.item_investors;
DROP TABLE IF EXISTS public.item_sources;
DROP TABLE IF EXISTS public.items;
DROP TABLE IF EXISTS public.digests;
DROP TABLE IF EXISTS public.digest_subscribers;
DROP TABLE IF EXISTS public.investors;
DROP TABLE IF EXISTS public.companies;
DROP TABLE IF EXISTS public.user_roles;

DROP FUNCTION IF EXISTS public.set_updated_at();
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS private.has_role(uuid, public.app_role);
DROP TYPE IF EXISTS public.app_role;
DROP SCHEMA IF EXISTS private;
