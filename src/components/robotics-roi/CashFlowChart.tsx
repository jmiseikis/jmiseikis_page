import { useEffect, useId, useRef, useState } from "react";

export interface ChartPoint { month: number; raas: number; purchase: number }

/** Readable server SVG, enhanced to actual width so labels stay legible on phones. */
export default function CashFlowChart({ points, showPurchase, currency, money }: {
  points: ChartPoint[];
  showPurchase: boolean;
  currency: string;
  money: (value: number) => string;
}) {
  const id = useId();
  const container = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(680);
  useEffect(() => {
    if (!container.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const height = 300, left = width < 480 ? 54 : 67, right = 12, top = 22, bottom = 44;
  const values = points.flatMap((p) => showPurchase ? [p.raas, p.purchase] : [p.raas]);
  let min = Math.min(0, ...values), max = Math.max(0, ...values);
  if (min === max) max = min + 1;
  const margin = (max - min) * .09;
  min -= margin; max += margin;
  const finalMonth = points[points.length - 1]?.month ?? 1;
  const x = (month: number) => left + month / Math.max(finalMonth, 1) * (width - left - right);
  const y = (value: number) => top + (max - value) / (max - min) * (height - top - bottom);
  const line = (key: "raas" | "purchase") => points.map((p) => `${x(p.month).toFixed(2)},${y(p[key]).toFixed(2)}`).join(" ");
  const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 0 });
  const ticks = Array.from({ length: 5 }, (_, n) => min + n * (max - min) / 4);
  const end = points[points.length - 1];
  return (
    <figure className="roi-chart" ref={container}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}>
        <title id={`${id}-title`}>Cumulative cash benefit compared with manual operation</title>
        <desc id={`${id}-desc`}>
          The zero line is manual operation. Upfront payments appear at month zero.
          {end ? ` At month ${end.month}, RaaS has a cumulative benefit of ${money(end.raas)}.` : ""}
          {end && showPurchase ? ` Purchase has a cumulative benefit of ${money(end.purchase)}.` : ""}
          Exact monthly values are available in the cash-flow table below.
        </desc>
        {ticks.map((tick, index) => <g key={index}>
          <line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} className="roi-chart-grid" />
          <text x={left - 10} y={y(tick) + 4} textAnchor="end" className="roi-chart-label">{compact.format(tick)}</text>
        </g>)}
        <line x1={left} x2={width - right} y1={y(0)} y2={y(0)} className="roi-chart-zero" />
        {showPurchase && <polyline points={line("purchase")} className="roi-chart-purchase" />}
        <polyline points={line("raas")} className="roi-chart-raas" />
        {[0, Math.round(finalMonth / 2), finalMonth].map((month, index) => (
          <text key={index} x={x(month)} y={height - 14} textAnchor={index === 0 ? "start" : index === 2 ? "end" : "middle"} className="roi-chart-label">Month {month}</text>
        ))}
        <text x={left} y={12} className="roi-chart-label">{currency} · cumulative</text>
      </svg>
      <figcaption className="roi-chart-legend">
        <span><i className="roi-line-raas" aria-hidden="true" />RaaS</span>
        {showPurchase && <span><i className="roi-line-purchase" aria-hidden="true" />Purchase</span>}
        <span><i className="roi-line-manual" aria-hidden="true" />Manual baseline</span>
      </figcaption>
    </figure>
  );
}
