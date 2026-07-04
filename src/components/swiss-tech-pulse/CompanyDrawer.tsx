import { X, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ItemCompany } from "./FeedItem";

type CompanyItem = { id: string; headline: string; signal_type: string; published_at: string | null };

export const CompanyDrawer = ({ company, onClose }: { company: ItemCompany | null; onClose: () => void }) => {
  const [items, setItems] = useState<CompanyItem[]>([]);
  useEffect(() => {
    if (!company) return;
    supabase
      .from("items")
      .select("id, headline, signal_type, published_at")
      .eq("company_id", company.id)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setItems((data as CompanyItem[]) || []));
  }, [company]);

  if (!company) return null;
  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <button className="flex-1 bg-black/40" onClick={onClose} aria-label="Close" />
      <aside className="w-full max-w-md bg-white h-full overflow-y-auto border-l border-[#CFD2D6]">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-anton uppercase text-3xl leading-none">{company.name}</h2>
            <button onClick={onClose} className="p-1" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {company.canton && (
              <span className="border border-[#CFD2D6] px-2 py-0.5 font-barlow-condensed uppercase tracking-widest text-[11px]" style={{ borderRadius: 0 }}>{company.canton}</span>
            )}
            {company.sectors.map((s) => (
              <span key={s} className="border border-[#CFD2D6] px-2 py-0.5 font-barlow-condensed uppercase tracking-widest text-[11px]" style={{ borderRadius: 0 }}>{s}</span>
            ))}
          </div>
          {company.zefix_url && (
            <a
              href={company.zefix_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 font-barlow-condensed uppercase tracking-widest text-xs text-[#EC1313] hover:underline"
            >
              Zefix profile <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <h3 className="mt-6 font-barlow-condensed uppercase tracking-widest text-xs text-[#0E0E10]/60">Signals</h3>
          <ul className="mt-2 divide-y divide-[#CFD2D6]">
            {items.map((it) => (
              <li key={it.id} className="py-3">
                <div className="font-barlow-condensed uppercase tracking-widest text-[10px] text-[#0E0E10]/60">
                  {it.published_at ? new Date(it.published_at).toLocaleDateString() : ""} · {it.signal_type.replace("_", " ")}
                </div>
                <div className="font-barlow text-sm">{it.headline}</div>
              </li>
            ))}
            {items.length === 0 && <li className="py-3 text-sm text-[#0E0E10]/60 font-barlow">No published signals yet.</li>}
          </ul>
        </div>
      </aside>
    </div>
  );
};