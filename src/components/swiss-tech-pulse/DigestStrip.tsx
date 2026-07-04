import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const DigestStrip = ({ week, editorial }: { week: string; editorial: string }) => (
  <Link
    to={`/resources/swiss-tech-pulse/digest/${week}`}
    className="block border border-[#0E0E10] hover:bg-[#0E0E10] hover:text-white transition-colors p-5 md:p-6 group"
    style={{ borderRadius: 0 }}
  >
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div className="font-barlow-condensed uppercase tracking-widest text-[11px] text-[#EC1313]">Week in review · {week}</div>
        <h2 className="font-anton uppercase text-2xl md:text-3xl mt-1 leading-tight">The Swiss tech week</h2>
      </div>
      <span className="inline-flex items-center gap-2 font-barlow-condensed uppercase tracking-widest text-xs">
        Read digest <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </div>
    <p className="font-barlow text-sm md:text-base mt-3 line-clamp-3 max-w-3xl">{editorial}</p>
  </Link>
);