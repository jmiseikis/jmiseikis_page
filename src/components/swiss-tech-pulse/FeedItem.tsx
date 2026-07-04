import { ArrowUpRight, GraduationCap } from "lucide-react";
import { format } from "date-fns";
import { SIGNAL_LABELS, signalBadgeStyle, type SignalType } from "./signals";

export type ItemSource = { url: string; source_name: string | null; trust_rank: number };
export type ItemInvestor = { id: string; name: string; directory_url: string | null };
export type ItemCompany = { id: string; name: string; canton: string | null; sectors: string[]; zefix_url: string | null };

export type FeedItemData = {
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
  sources: ItemSource[];
  investors: ItemInvestor[];
};

function formatAmount(amount: number | null, currency: string | null) {
  if (!amount) return null;
  const c = currency || "CHF";
  if (amount >= 1_000_000_000) return `${c} ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${c} ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${c} ${Math.round(amount / 1_000)}K`;
  return `${c} ${amount}`;
}

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center border border-[#CFD2D6] px-2 py-0.5 font-barlow-condensed uppercase tracking-widest text-[11px] text-[#0E0E10]" style={{ borderRadius: 0 }}>
    {children}
  </span>
);

export const FeedItem = ({ item, onOpenCompany }: { item: FeedItemData; onOpenCompany: (c: ItemCompany) => void }) => {
  const badge = signalBadgeStyle(item.signal_type);
  const day = item.published_at ? format(new Date(item.published_at), "d") : "—";
  const month = item.published_at ? format(new Date(item.published_at), "MMM").toUpperCase() : "";
  const amount = formatAmount(item.amount, item.currency);
  const topSource = item.sources.slice().sort((a, b) => a.trust_rank - b.trust_rank)[0];

  return (
    <article className="grid grid-cols-[64px_1fr] md:grid-cols-[88px_1fr] gap-4 md:gap-6 py-6 border-b border-[#CFD2D6]">
      <div className="pt-1">
        <div className="font-anton leading-none text-4xl md:text-5xl text-[#0E0E10]">{day}</div>
        <div className="font-barlow-condensed uppercase tracking-widest text-[11px] text-[#0E0E10]/60 mt-1">{month}</div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className={badge.className} style={badge.style}>{SIGNAL_LABELS[item.signal_type]}</span>
          {item.signal_type === "spinoff" && item.university && (
            <span className="inline-flex items-center gap-1 border border-[#0E0E10] px-2 py-0.5 font-barlow-condensed uppercase tracking-widest text-[10px]" style={{ borderRadius: 0 }}>
              <GraduationCap className="w-3 h-3" /> {item.university}
            </span>
          )}
          {topSource && (
            <a
              href={topSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 font-barlow-condensed uppercase tracking-widest text-[11px] text-[#0E0E10]/70 hover:text-[#EC1313]"
            >
              via {topSource.source_name || new URL(topSource.url).hostname}
              <ArrowUpRight className="w-3 h-3" />
            </a>
          )}
        </div>

        <h3 className="font-barlow font-bold text-lg md:text-xl leading-snug text-[#0E0E10]">
          {item.company ? (
            <button className="hover:underline underline-offset-4 text-left" onClick={() => item.company && onOpenCompany(item.company)}>
              {item.headline}
            </button>
          ) : (
            item.headline
          )}
        </h3>

        {item.summary && (
          <p className="font-barlow text-[15px] leading-relaxed text-[#0E0E10]/80 mt-2 max-w-3xl">{item.summary}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap mt-3">
          {amount && (
            <span className="font-anton text-xl text-[#EC1313]" style={{ letterSpacing: "0.02em" }}>
              {amount}
            </span>
          )}
          {item.round_stage && <Chip>{item.round_stage}</Chip>}
          {item.canton && <Chip>{item.canton}</Chip>}
          {item.sectors.slice(0, 4).map((s) => <Chip key={s}>{s}</Chip>)}
        </div>

        {item.investors.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <span className="font-barlow-condensed uppercase tracking-widest text-[10px] text-[#0E0E10]/60">Investors</span>
            {item.investors.map((inv) =>
              inv.directory_url ? (
                <a
                  key={inv.id}
                  href={inv.directory_url}
                  className="border border-[#EC1313] text-[#EC1313] hover:bg-[#EC1313] hover:text-white px-2 py-0.5 font-barlow-condensed uppercase tracking-widest text-[11px] transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  {inv.name}
                </a>
              ) : (
                <span key={inv.id} className="border border-[#CFD2D6] px-2 py-0.5 font-barlow-condensed uppercase tracking-widest text-[11px]" style={{ borderRadius: 0 }}>
                  {inv.name}
                </span>
              )
            )}
          </div>
        )}
      </div>
    </article>
  );
};