
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Companies
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  canton text,
  sectors text[] NOT NULL DEFAULT '{}',
  zefix_url text,
  uid text UNIQUE,
  website text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.companies TO anon, authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read companies" ON public.companies FOR SELECT TO anon, authenticated USING (true);

-- Investors
CREATE TABLE public.investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  directory_url text,
  website text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.investors TO anon, authenticated;
GRANT ALL ON public.investors TO service_role;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read investors" ON public.investors FOR SELECT TO anon, authenticated USING (true);

-- Items
CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'needs_review' CHECK (status IN ('needs_review','published','hidden')),
  signal_type text NOT NULL CHECK (signal_type IN ('funding_round','new_fund','founding','spinoff','exit','grant_award','company_news')),
  headline text NOT NULL,
  summary text,
  published_at timestamptz,
  confidence numeric,
  amount numeric,
  currency text DEFAULT 'CHF',
  round_stage text,
  canton text,
  sectors text[] NOT NULL DEFAULT '{}',
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  university text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.items TO anon, authenticated;
GRANT ALL ON public.items TO service_role;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published items" ON public.items FOR SELECT TO anon, authenticated
  USING (status = 'published');
CREATE POLICY "Admins read all items" ON public.items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update items" ON public.items FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX items_pub_at_idx ON public.items (published_at DESC) WHERE status = 'published';
CREATE INDEX items_status_idx ON public.items (status);
CREATE INDEX items_signal_idx ON public.items (signal_type);
CREATE INDEX items_canton_idx ON public.items (canton);

-- Item sources
CREATE TABLE public.item_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  url text NOT NULL,
  source_key text,
  source_name text,
  trust_rank int NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.item_sources TO anon, authenticated;
GRANT ALL ON public.item_sources TO service_role;
ALTER TABLE public.item_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read item_sources of published items" ON public.item_sources FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.items i WHERE i.id = item_id AND (i.status = 'published' OR public.has_role(auth.uid(),'admin'))));
CREATE INDEX item_sources_item_idx ON public.item_sources (item_id);

-- Item investors (junction)
CREATE TABLE public.item_investors (
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  is_lead boolean NOT NULL DEFAULT false,
  PRIMARY KEY (item_id, investor_id)
);
GRANT SELECT ON public.item_investors TO anon, authenticated;
GRANT ALL ON public.item_investors TO service_role;
ALTER TABLE public.item_investors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read item_investors of published items" ON public.item_investors FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.items i WHERE i.id = item_id AND (i.status = 'published' OR public.has_role(auth.uid(),'admin'))));

-- Digests
CREATE TABLE public.digests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week text NOT NULL UNIQUE,
  editorial text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at timestamptz,
  item_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.digests TO anon, authenticated;
GRANT ALL ON public.digests TO service_role;
ALTER TABLE public.digests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published digests" ON public.digests FOR SELECT TO anon, authenticated
  USING (status = 'published');

-- Digest subscribers (insert-only for anon)
CREATE TABLE public.digest_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email)
);
GRANT INSERT ON public.digest_subscribers TO anon, authenticated;
GRANT ALL ON public.digest_subscribers TO service_role;
ALTER TABLE public.digest_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.digest_subscribers FOR INSERT TO anon, authenticated
  WITH CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 320);
CREATE POLICY "Admins read subscribers" ON public.digest_subscribers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER items_set_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER companies_set_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
