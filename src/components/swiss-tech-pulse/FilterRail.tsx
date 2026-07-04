import { Search } from "lucide-react";
import { SIGNAL_LABELS, SIGNAL_ORDER, SWISS_CANTONS, COMMON_SECTORS, type SignalType } from "./signals";

export type Filters = {
  signals: SignalType[];
  canton: string;
  sector: string;
  q: string;
  showAllFoundings: boolean;
};

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
};

export const FilterRail = ({ filters, onChange }: Props) => {
  const toggleSignal = (s: SignalType) => {
    const has = filters.signals.includes(s);
    onChange({ ...filters, signals: has ? filters.signals.filter((x) => x !== s) : [...filters.signals, s] });
  };
  return (
    <div className="sticky top-20 z-30 bg-white/95 backdrop-blur border-b border-[#CFD2D6]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto md:overflow-visible md:flex-wrap md:gap-3 -mx-1 px-1 no-scrollbar">
          {SIGNAL_ORDER.map((s) => {
            const active = filters.signals.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSignal(s)}
                className={`shrink-0 font-barlow-condensed uppercase tracking-widest text-xs px-3 py-1.5 border transition-colors ${
                  active
                    ? "bg-[#0E0E10] text-white border-[#0E0E10]"
                    : "bg-white text-[#0E0E10] border-[#CFD2D6] hover:border-[#0E0E10]"
                }`}
                style={{ borderRadius: 0 }}
              >
                {SIGNAL_LABELS[s]}
              </button>
            );
          })}

          <select
            value={filters.canton}
            onChange={(e) => onChange({ ...filters, canton: e.target.value })}
            className="shrink-0 font-barlow-condensed uppercase tracking-widest text-xs px-3 py-1.5 border border-[#CFD2D6] bg-white"
            style={{ borderRadius: 0 }}
          >
            <option value="">All Cantons</option>
            {SWISS_CANTONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filters.sector}
            onChange={(e) => onChange({ ...filters, sector: e.target.value })}
            className="shrink-0 font-barlow-condensed uppercase tracking-widest text-xs px-3 py-1.5 border border-[#CFD2D6] bg-white"
            style={{ borderRadius: 0 }}
          >
            <option value="">All Sectors</option>
            {COMMON_SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="shrink-0 flex items-center gap-2 border border-[#CFD2D6] bg-white px-2 py-1.5" style={{ borderRadius: 0 }}>
            <Search className="w-4 h-4 text-[#0E0E10]/60" />
            <input
              value={filters.q}
              onChange={(e) => onChange({ ...filters, q: e.target.value })}
              placeholder="Search headlines, companies, investors"
              className="font-barlow text-sm outline-none w-56 md:w-72 bg-transparent"
            />
          </div>

          <label className="shrink-0 inline-flex items-center gap-2 font-barlow-condensed uppercase tracking-widest text-xs ml-1 select-none">
            <input
              type="checkbox"
              checked={filters.showAllFoundings}
              onChange={(e) => onChange({ ...filters, showAllFoundings: e.target.checked })}
            />
            <span>Show all registry foundings</span>
          </label>
        </div>
      </div>
    </div>
  );
};