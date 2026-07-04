import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Masthead } from "@/components/swiss-tech-pulse/Masthead";
import { FilterRail, type Filters } from "@/components/swiss-tech-pulse/FilterRail";
import { FeedItem, type FeedItemData, type ItemCompany } from "@/components/swiss-tech-pulse/FeedItem";
import { CompanyDrawer } from "@/components/swiss-tech-pulse/CompanyDrawer";
import { SubscribeForm } from "@/components/swiss-tech-pulse/SubscribeForm";
import { DigestStrip } from "@/components/swiss-tech-pulse/DigestStrip";
import { format, startOfDay } from "date-fns";
import type { SignalType } from "@/components/swiss-tech-pulse/signals";
import { SIGNAL_ORDER } from "@/components/swiss-tech-pulse/signals";

const PAGE_SIZE = 30;

function parseFiltersFromUrl(params: URLSearchParams): Filters {
  const signalParam = params.get("signals") || "";
  const signals = signalParam
    .split(",")
    .filter(Boolean)
    .filter((s): s is SignalType => (SIGNAL_ORDER as string[]).includes(s));
  return {
    signals,
    canton: params.get("canton") || "",
    sector: params.get("sector") || "",
    q: params.get("q") || "",
    showAllFoundings: params.get("all_foundings") === "1",
  };
}

function filtersToUrl(f: Filters): Record<string, string> {
  const out: Record<string, string> = {};
  if (f.signals.length) out.signals = f.signals.join(",");
  if (f.canton) out.canton = f.canton;
  if (f.sector) out.sector = f.sector;
  if (f.q) out.q = f.q;
  if (f.showAllFoundings) out.all_foundings = "1";
  return out;
}

type RawItem = {
  id: string;
  signal_type: SignalType;
  headline: string;
  summary: string | null;
  published_at: string | null;
  amount: number | null;
  currency: string | null;
  round_stage: string | null;
  canton: string | null;
  sectors: string[];
  university: string | null;
  confidence: number | null;
  company: ItemCompany | null;
  item_sources: { url: string; source_name: string | null; trust_rank: number }[];
  item_investors: { is_lead: boolean; investors: { id: string; name: string; directory_url: string | null } | null }[];
};

const SwissTechPulse = () => {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => parseFiltersFromUrl(params));
  const [items, setItems] = useState<FeedItemData[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [openCompany, setOpenCompany] = useState<ItemCompany | null>(null);
  const [digest, setDigest] = useState<{ week: string; editorial: string } | null>(null);

  useEffect(() => {
    setParams(filtersToUrl(filters), { replace: true });
    setPage(0);
    setItems([]);
    setHasMore(true);
  }, [filters, setParams]);

  useEffect(() => {
    supabase
      .from("digests")
      .select("week, editorial")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setDigest(data as { week: string; editorial: string } | null));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from("items")
        .select(
          `id, signal_type, headline, summary, published_at, amount, currency, round_stage, canton, sectors, university, confidence,
           company:companies(id, name, canton, sectors, zefix_url),
           item_sources(url, source_name, trust_rank),
           item_investors(is_lead, investors(id, name, directory_url))`
        )
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (filters.signals.length) query = query.in("signal_type", filters.signals);
      if (filters.canton) query = query.eq("canton", filters.canton);
      if (filters.sector) query = query.contains("sectors", [filters.sector]);
      if (filters.q) query = query.ilike("headline", `%${filters.q}%`);

      const { data, error } = await query;
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      const raw = (data || []) as unknown as RawItem[];
      const mapped: FeedItemData[] = raw.map((r) => ({
        id: r.id,
        signal_type: r.signal_type,
        headline: r.headline,
        summary: r.summary,
        published_at: r.published_at,
        amount: r.amount,
        currency: r.currency,
        round_stage: r.round_stage,
        canton: r.canton,
        sectors: r.sectors || [],
        university: r.university,
        confidence: r.confidence,
        company: r.company,
        sources: r.item_sources || [],
        investors: (r.item_investors || [])
          .map((x) => x.investors)
          .filter((x): x is NonNullable<typeof x> => !!x),
      }));

      const filtered = mapped.filter((it) => {
        if (it.signal_type === "founding" && !filters.showAllFoundings) {
          if ((it.confidence ?? 0) < 0.85) return false;
        }
        if (filters.q) {
          const q = filters.q.toLowerCase();
          const hay =
            it.headline.toLowerCase() +
            " " +
            (it.company?.name.toLowerCase() ?? "") +
            " " +
            it.investors.map((i) => i.name.toLowerCase()).join(" ");
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      setItems((prev) => (page === 0 ? filtered : [...prev, ...filtered]));
      setHasMore(mapped.length === PAGE_SIZE);
      setLoading(false);
    };
    load();
  }, [page, filters]);

  const grouped = useMemo(() => {
    const groups: { day: string; label: string; items: FeedItemData[] }[] = [];
    for (const it of items) {
      const d = it.published_at ? startOfDay(new Date(it.published_at)).toISOString() : "unknown";
      const label = it.published_at ? format(new Date(it.published_at), "EEEE d MMMM yyyy") : "Undated";
      const g = groups.find((x) => x.day === d);
      if (g) g.items.push(it);
      else groups.push({ day: d, label, items: [it] });
    }
    return groups;
  }, [items]);

  return (
    <div className="min-h-screen bg-white text-[#0E0E10]">
      <Helmet>
        <title>Swiss Tech Pulse — Live Swiss startup signal feed</title>
        <meta name="description" content="Foundings, spin-offs, funding rounds, exits and new VC funds across Switzerland — updated automatically." />
        <link rel="canonical" href="https://jmiseikis.lovable.app/resources/swiss-tech-pulse" />
      </Helmet>
      <Navigation />
      <Masthead />
      <FilterRail filters={filters} onChange={setFilters} />

      <main className="container mx-auto px-4 py-8">
        {digest && (
          <div className="mb-8">
            <DigestStrip week={digest.week} editorial={digest.editorial} />
          </div>
        )}

        {grouped.length === 0 && !loading && (
          <div className="py-20 text-center">
            <p className="font-anton uppercase text-3xl text-[#0E0E10]/40">No signals match yet</p>
            <p className="font-barlow mt-2 text-[#0E0E10]/60">Try clearing filters or come back soon — the feed updates automatically.</p>
          </div>
        )}

        {grouped.map((g) => (
          <section key={g.day} className="mb-10">
            <div className="sticky top-[7.5rem] z-10 bg-white/95 backdrop-blur py-2 border-b-2 border-[#0E0E10]">
              <h2 className="font-barlow-condensed uppercase tracking-widest text-xs text-[#0E0E10]/70">{g.label}</h2>
            </div>
            <div>
              {g.items.map((it) => (
                <FeedItem key={it.id} item={it} onOpenCompany={setOpenCompany} />
              ))}
            </div>
          </section>
        ))}

        {hasMore && (
          <div className="text-center py-6">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              className="border border-[#0E0E10] px-6 py-2 font-barlow-condensed uppercase tracking-widest text-xs hover:bg-[#0E0E10] hover:text-white transition-colors"
              style={{ borderRadius: 0 }}
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          </div>
        )}

        {/* Subscribe */}
        <section className="mt-16 border-t border-[#CFD2D6] pt-10">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div>
              <h3 className="font-anton uppercase text-3xl leading-none">The Friday Digest</h3>
              <p className="font-barlow text-[#0E0E10]/80 mt-2 max-w-md">
                One email a week. Every Swiss tech signal that mattered, in your own words.
              </p>
            </div>
            <SubscribeForm />
          </div>
        </section>

        <p className="mt-12 text-xs font-barlow text-[#0E0E10]/60 max-w-3xl">
          Summaries are AI-generated from linked sources. Always verify with the original. Built by Dr. Justinas Mišeikis.{" "}
          <Link to="/resources/swiss-tech-pulse/about" className="underline hover:text-[#EC1313]">
            About the sources and methodology
          </Link>
          .
        </p>
      </main>

      <CompanyDrawer company={openCompany} onClose={() => setOpenCompany(null)} />
      <Footer />
    </div>
  );
};

export default SwissTechPulse;