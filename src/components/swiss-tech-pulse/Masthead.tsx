import { Rss } from "lucide-react";

const FEED_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-feed/feed.xml`;

export const Masthead = () => (
  <header className="border-b border-[#CFD2D6] bg-white">
    <div className="container mx-auto px-4 pt-28 pb-10">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-anton uppercase leading-none tracking-tight text-[56px] md:text-[104px]">
            <span className="text-[#0E0E10]">SWISS</span>{" "}
            <span className="text-[#EC1313]">TECH PULSE</span>
          </h1>
          <p className="mt-3 font-barlow-condensed uppercase tracking-[0.14em] text-[#0E0E10]/70 text-sm md:text-base">
            Foundings · Spin-offs · Funding · New funds — the Swiss startup signal feed, updated automatically
          </p>
        </div>
        <a
          href={FEED_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-[#0E0E10] px-3 py-2 font-barlow-condensed uppercase tracking-widest text-xs hover:bg-[#0E0E10] hover:text-white transition-colors"
          aria-label="RSS feed"
        >
          <Rss className="w-4 h-4" />
          <span>RSS</span>
        </a>
      </div>

      {/* Pulse line */}
      <div className="relative mt-8 h-[2px] w-full bg-[#EC1313]/25 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-full">
          <span
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#EC1313] shadow-[0_0_10px_2px_rgba(236,19,19,0.7)] motion-safe:animate-pulse-blip motion-reduce:left-0 motion-reduce:opacity-100"
            style={{ borderRadius: 0 }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  </header>
);