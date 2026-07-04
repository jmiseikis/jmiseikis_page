import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { SIGNAL_LABELS, SIGNAL_ORDER, type SignalType } from "@/components/swiss-tech-pulse/signals";

type Digest = { week: string; editorial: string; item_ids: string[]; published_at: string | null };
type Item = { id: string; headline: string; signal_type: SignalType; company_id: string | null; summary: string | null };

const SwissTechPulseDigest = () => {
  const { week } = useParams<{ week: string }>();
  const [digest, setDigest] = useState<Digest | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!week) return;
    (async () => {
      const { data } = await supabase
        .from("digests")
        .select("week, editorial, item_ids, published_at")
        .eq("week", week)
        .eq("status", "published")
        .maybeSingle();
      setDigest(data as Digest | null);
      if (data?.item_ids?.length) {
        const { data: its } = await supabase
          .from("items")
          .select("id, headline, signal_type, company_id, summary")
          .in("id", data.item_ids)
          .eq("status", "published");
        setItems((its as Item[]) || []);
      }
      setLoading(false);
    })();
  }, [week]);

  const groupedBySignal = SIGNAL_ORDER.map((sig) => ({
    signal: sig,
    items: items.filter((i) => i.signal_type === sig),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-white text-[#0E0E10]">
      <Helmet>
        <title>{`Swiss Tech Pulse Digest — ${week}`}</title>
        <meta name="description" content={`Weekly Swiss tech ecosystem digest for ${week}.`} />
      </Helmet>
      <Navigation />
      <main className="container mx-auto px-4 pt-28 pb-16 max-w-3xl">
        <Link to="/resources/swiss-tech-pulse" className="font-barlow-condensed uppercase tracking-widest text-xs text-[#EC1313] hover:underline">
          ← Back to feed
        </Link>
        <h1 className="font-anton uppercase text-5xl md:text-6xl leading-none mt-4">
          Week in Review · <span className="text-[#EC1313]">{week}</span>
        </h1>
        {loading && <p className="mt-6 font-barlow text-[#0E0E10]/60">Loading…</p>}
        {!loading && !digest && (
          <p className="mt-6 font-barlow text-[#0E0E10]/60">No digest published for this week.</p>
        )}
        {digest && (
          <>
            <div className="mt-8 font-barlow text-[17px] leading-relaxed whitespace-pre-line text-[#0E0E10]/90">
              {digest.editorial}
            </div>
            <div className="mt-10 border-t border-[#CFD2D6] pt-6">
              {groupedBySignal.map((g) => (
                <section key={g.signal} className="mb-8">
                  <h2 className="font-barlow-condensed uppercase tracking-widest text-xs text-[#EC1313] mb-3">
                    {SIGNAL_LABELS[g.signal]}
                  </h2>
                  <ul className="space-y-3">
                    {g.items.map((it) => (
                      <li key={it.id} className="border-b border-[#CFD2D6] pb-3">
                        <div className="font-barlow font-bold text-base">{it.headline}</div>
                        {it.summary && (
                          <div className="font-barlow text-sm text-[#0E0E10]/80 mt-1">{it.summary}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SwissTechPulseDigest;