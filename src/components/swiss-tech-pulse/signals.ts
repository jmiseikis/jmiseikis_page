export type SignalType =
  | "funding_round"
  | "new_fund"
  | "founding"
  | "spinoff"
  | "exit"
  | "grant_award"
  | "company_news";

export const SIGNAL_LABELS: Record<SignalType, string> = {
  funding_round: "Funding",
  new_fund: "New Fund",
  founding: "Founding",
  spinoff: "Spin-off",
  exit: "Exit",
  grant_award: "Grant",
  company_news: "News",
};

export const SIGNAL_ORDER: SignalType[] = [
  "funding_round",
  "new_fund",
  "founding",
  "spinoff",
  "exit",
  "grant_award",
  "company_news",
];

// Sharp-clipped corner via clip-path
const CLIP = "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)";

export function signalBadgeStyle(type: SignalType): { className: string; style: React.CSSProperties } {
  const base = "inline-flex items-center px-2.5 py-1 font-barlow-condensed uppercase tracking-widest text-[11px] font-semibold";
  const style: React.CSSProperties = { clipPath: CLIP, borderRadius: 0 };
  switch (type) {
    case "funding_round":
      return { className: `${base} bg-[#EC1313] text-white`, style };
    case "new_fund":
      return { className: `${base} border border-[#EC1313] text-[#EC1313] bg-white`, style };
    case "founding":
      return { className: `${base} bg-[#0E0E10] text-white`, style };
    case "spinoff":
      return { className: `${base} border border-[#0E0E10] text-[#0E0E10] bg-white`, style };
    case "exit":
      return { className: `${base} text-white`, style: { ...style, backgroundColor: "#D52B1E" } };
    case "grant_award":
      return { className: `${base} bg-[#6B7280] text-white`, style };
    case "company_news":
      return { className: `${base} border border-[#CFD2D6] text-[#0E0E10] bg-white`, style };
  }
}

export const SWISS_CANTONS = [
  "AG","AI","AR","BE","BL","BS","FR","GE","GL","GR","JU","LU","NE","NW","OW","SG","SH","SO","SZ","TG","TI","UR","VD","VS","ZG","ZH",
];

export const COMMON_SECTORS = [
  "AI","Robotics","Biotech","Medtech","Fintech","Cleantech","Deeptech","SaaS","Cybersecurity","Climate","Web3","Hardware","Quantum","Foodtech","Proptech",
];