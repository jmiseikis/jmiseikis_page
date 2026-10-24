import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import PageMeta from "@/components/site/PageMeta";
import { Actions, ContactCta, Eyebrow, Note, PageHero, TextLink } from "@/components/site/primitives";
import { DEFAULT_SCENARIO, calculateScenario, type ScenarioInputs, type ScenarioResult } from "@/lib/raas";

const TITLE = "RaaS ROI calculator | Dr. Justinas Mišeikis";
const DESCRIPTION =
  "Explore robot-as-a-service costs, cash savings, productivity assumptions and payback with an interactive robotics scenario model.";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RaaS ROI calculator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://jmiseikis.com/raas-calculator",
  description: DESCRIPTION,
  isAccessibleForFree: true,
  author: { "@type": "Person", name: "Dr. Justinas Mišeikis", url: "https://jmiseikis.com/" },
};

type Key = keyof ScenarioInputs;
type Unit = "currency" | "%" | "years" | "";

interface Field {
  key: Key;
  label: string;
  unit: Unit;
  min: number;
  max: number;
  step: number;
  hint?: string;
}

const GROUPS: { title: string; fields: Field[] }[] = [
  {
    title: "Current workforce & costs",
    fields: [
      { key: "workers", label: "Workers per shift affected", unit: "", min: 0, max: 20, step: 1, hint: "Multiplied by shifts per day." },
      { key: "wage", label: "Hourly wage per worker", unit: "currency", min: 0, max: 150, step: 1 },
      { key: "shifts", label: "Shifts per day", unit: "", min: 1, max: 3, step: 1 },
      { key: "days", label: "Working days per week", unit: "", min: 1, max: 7, step: 1 },
      { key: "overhead", label: "Benefits & overhead", unit: "%", min: 0, max: 100, step: 5 },
      { key: "turnover", label: "Annual staff turnover", unit: "%", min: 0, max: 100, step: 5 },
      {
        key: "labourRealisation",
        label: "Cashable labour cost reduction",
        unit: "%",
        min: 0,
        max: 100,
        step: 5,
        hint: "Share of this labour cost actually removed or avoided.",
      },
    ],
  },
  {
    title: "Robot subscription & deployment",
    fields: [
      { key: "robots", label: "Robots deployed", unit: "", min: 1, max: 20, step: 1 },
      { key: "subscription", label: "Monthly subscription per robot", unit: "currency", min: 0, max: 15000, step: 250 },
      { key: "setup", label: "Setup & integration cost", unit: "currency", min: 0, max: 150000, step: 2500 },
      { key: "uptime", label: "Uptime (productivity model only)", unit: "%", min: 0, max: 100, step: 1 },
      { key: "productivity", label: "Additional productivity vs manual", unit: "%", min: 0, max: 200, step: 5 },
      {
        key: "productivityRealisation",
        label: "Incremental productivity value realised",
        unit: "%",
        min: 0,
        max: 100,
        step: 5,
        hint: "Kept out of cash results. 0% means extra output has no value here.",
      },
      { key: "years", label: "Contract length", unit: "years", min: 1, max: 5, step: 1 },
      { key: "operations", label: "Additional monthly operating costs", unit: "currency", min: 0, max: 20000, step: 250 },
    ],
  },
  {
    title: "Quality, incidents & inflation",
    fields: [
      { key: "errors", label: "Monthly rework / error cost", unit: "currency", min: 0, max: 50000, step: 500 },
      { key: "errorReduction", label: "Cashable error-cost reduction", unit: "%", min: 0, max: 100, step: 5 },
      { key: "incidents", label: "Monthly incident / liability cost", unit: "currency", min: 0, max: 20000, step: 250 },
      { key: "incidentReduction", label: "Cashable incident-cost reduction", unit: "%", min: 0, max: 100, step: 5 },
      { key: "inflation", label: "Annual labour cost inflation", unit: "%", min: 0, max: 10, step: 0.5 },
    ],
  },
];

const FIELDS = GROUPS.flatMap((g) => g.fields);
const CURRENCIES = ["USD", "CHF", "EUR"] as const;
type Currency = (typeof CURRENCIES)[number];

const toStrings = (inputs: ScenarioInputs) =>
  Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, String(v)])) as Record<Key, string>;

const parseField = (field: Field, raw: string) => {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < field.min || value > field.max) return null;
  if (field.step >= 1 && !Number.isInteger(value)) return null;
  return value;
};

const useMoney = (currency: Currency) =>
  useMemo(() => {
    const exact = new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 });
    const compact = new Intl.NumberFormat("en-US", { style: "currency", currency, notation: "compact", maximumFractionDigits: 2 });
    return {
      // Normalise -0 so an empty cost line never reads "-$0".
      exact: (v: number) => exact.format(v === 0 ? 0 : v),
      headline: (v: number) => (Math.abs(v) >= 100000 ? compact.format(v) : exact.format(v)),
    };
  }, [currency]);

/** Rendered width of an element, so the chart can draw at real pixel size and keep its labels legible on phones. */
const useWidth = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
};

const CashChart = ({ result, money }: { result: ScenarioResult; money: (v: number) => string }) => {
  const titleId = useId();
  const descId = useId();
  const [ref, measured] = useWidth<HTMLDivElement>();
  const W = measured || 560;
  const H = W < 480 ? 240 : 295;
  const L = 52;
  const R = 8;
  const T = 12;
  const B = 34;
  const values = result.series.flatMap((p) => [p.cash, p.economic]);
  let min = Math.min(0, ...values);
  let max = Math.max(0, ...values);
  if (max === min) max = min + 1;
  const pad = (max - min) * 0.06;
  min -= pad;
  max += pad;
  const x = (m: number) => L + (m / result.months) * (W - L - R);
  const y = (v: number) => T + ((max - v) / (max - min)) * (H - T - B);
  const ticks = Array.from({ length: 5 }, (_, i) => min + ((max - min) * i) / 4);
  const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
  const line = (key: "cash" | "economic") => result.series.map((p) => `${x(p.month).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");
  const showEconomic = result.productiveValue > 0;
  const monthTicks = [0, Math.round(result.months / 2), result.months];

  return (
    <div ref={ref} className="mt-7">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={titleId} aria-describedby={descId} className="block h-auto w-full">
        <title id={titleId}>Cumulative cash position over {result.months} months</title>
        <desc id={descId}>
          Net cash starts at {money(result.series[0].cash)} after setup and ends at {money(result.cashGain)}.
          {showEconomic ? ` Including recognised productivity value it ends at ${money(result.economicGain)}.` : ""}
        </desc>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
              {compact.format(t)}
            </text>
          </g>
        ))}
        <line x1={L} x2={W - R} y1={y(0)} y2={y(0)} className="stroke-muted-foreground" strokeWidth={1} strokeDasharray="3 4" />
        {showEconomic && <polyline points={line("economic")} fill="none" className="stroke-foreground" strokeWidth={2} strokeDasharray="5 4" />}
        <polyline points={line("cash")} fill="none" className="stroke-primary" strokeWidth={3} />
        {monthTicks.map((m, i) => (
          <text
            key={i}
            x={x(m)}
            y={H - 10}
            textAnchor={i === 0 ? "start" : i === monthTicks.length - 1 ? "end" : "middle"}
            className="fill-muted-foreground text-[11px]"
          >
            Month {m}
          </text>
        ))}
      </svg>
    </div>
  );
};

const RaasCalculator = () => {
  const formId = useId();
  const [raw, setRaw] = useState<Record<Key, string>>(() => toStrings(DEFAULT_SCENARIO));
  const [currency, setCurrency] = useState<Currency>("USD");
  const money = useMoney(currency);
  const lastValid = useRef<ScenarioResult>(calculateScenario(DEFAULT_SCENARIO));

  const { result, invalid } = useMemo(() => {
    const invalidFields = FIELDS.filter((f) => parseField(f, raw[f.key]) === null);
    if (invalidFields.length) return { result: null, invalid: invalidFields };
    const inputs = Object.fromEntries(FIELDS.map((f) => [f.key, parseField(f, raw[f.key])])) as unknown as ScenarioInputs;
    try {
      return { result: calculateScenario(inputs), invalid: invalidFields };
    } catch {
      return { result: null, invalid: invalidFields };
    }
  }, [raw]);
  if (result) lastValid.current = result;
  const shown = result ?? lastValid.current;

  const unitLabel = (unit: Unit) => (unit === "currency" ? currency : unit);
  const set = (key: Key, value: string) => setRaw((prev) => ({ ...prev, [key]: value }));
  const reset = () => {
    setRaw(toStrings(DEFAULT_SCENARIO));
    setCurrency("USD");
  };

  const payback =
    shown.payback === null ? "Not within term" : shown.payback === 0 ? "Immediate" : `${shown.payback} month${shown.payback === 1 ? "" : "s"}`;
  const roi = shown.roi === null ? "Not defined" : `${Math.round(shown.roi)}%`;

  const metrics = [
    ["Monthly cash benefit", money.headline(shown.cashMonthly), money.exact(shown.cashMonthly), "After subscription and extra operating costs"],
    ["Cash payback", payback, payback, "Setup recovered within the contract term"],
    ["Cash ROI over contract", roi, roi, "Net cash gain / total modelled cash investment"],
    ["Contract net cash gain", money.headline(shown.cashGain), money.exact(shown.cashGain), "Includes setup and operating costs"],
  ];

  const breakdown: [string, number, boolean?][] = [
    ["Base payroll (before benefits)", shown.base],
    ["Benefits & overhead", shown.overhead],
    ["Turnover cost assumption", shown.turnover],
    ["Cashable labour cost avoided", shown.labourAvoided],
    ["Cashable quality / incident savings", shown.quality],
    ["Robot subscription", -shown.subscription],
    ["Additional operating costs", -shown.operations],
    ["Net monthly cash benefit", shown.cashMonthly, true],
    ["Extra productivity value (separate, not cash)", shown.productiveValue],
  ];

  return (
    <>
      <PageMeta
        path="/raas-calculator"
        title={TITLE}
        description={DESCRIPTION}
        ogTitle="RaaS ROI Calculator"
        ogSubtitle="ROBOT AS A SERVICE · SCENARIO MODEL"
        ogImage="/og-raas-calculator.png"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(JSON_LD)}</script>
      </Helmet>

      <PageHero
        breadcrumb={{ to: "/resources", label: "Resources" }}
        eyebrow="Resource | Robotics scenario planning"
        title="RaaS ROI calculator."
        lead="Explore the costs of robotics as a service. Keep cash savings separate from estimated productivity value, and make the assumptions visible."
      />

      <section className="site-wrap pb-12 pt-8 md:pb-20" aria-labelledby={`${formId}-results`}>
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 md:grid-cols-[minmax(0,1fr)_120px_auto] md:items-center md:gap-6">
          <div className="col-span-2 md:col-span-1">
            <Eyebrow className="mb-2">Illustrative scenario</Eyebrow>
            <p className="fine max-w-[70ch]">
              Values are assumptions, not quotes or market benchmarks. Currency selection changes the label only; it does not
              convert amounts.
            </p>
          </div>
          <label className="block max-w-[130px] text-[13px] font-semibold text-foreground">
            Currency
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="mt-2 block min-h-10 w-full border border-input bg-background px-3 py-2 text-base font-normal text-foreground md:text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={reset}
            className="min-h-11 self-end border-b border-primary bg-transparent px-0 text-xs text-foreground hover:text-primary"
          >
            Reset scenario
          </button>
        </div>

        <h2 id={`${formId}-results`} className="sr-only">
          Results
        </h2>
        <div aria-live="polite" className="mb-8 mt-6 grid grid-cols-2 border-t-[3px] border-primary bg-muted md:mb-10 lg:grid-cols-4">
          {metrics.map(([label, value, exact, sub], index) => (
            <div
              key={label}
              className="min-w-0 border-border px-3 py-4 xs:px-3.5 md:px-5 md:py-6 [&:nth-child(-n+2)]:border-b lg:[&:nth-child(-n+2)]:border-b-0 odd:border-r lg:border-r lg:last:border-r-0"
            >
              <span className="block text-[11px] leading-snug text-muted-foreground">{label}</span>
              <strong
                title={exact}
                className="my-3 block text-[22px] leading-tight tracking-[-0.05em] text-foreground [overflow-wrap:anywhere] xs:text-[24px] md:text-[28px]"
              >
                {value}
              </strong>
              <small className="block text-[10px] leading-snug text-muted-foreground md:text-[11px]">{sub}</small>
              {(index === 0 || index === 3) && value !== exact && <span className="sr-only">Exact value {exact}.</span>}
            </div>
          ))}
        </div>

        <Actions className="mb-7 mt-0 lg:hidden">
          <TextLink href="#calc-inputs" arrow={false}>
            Edit assumptions ↓
          </TextLink>
          <TextLink href="#calc-output" arrow={false}>
            View chart & breakdown ↓
          </TextLink>
        </Actions>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-9">
          <form id="calc-inputs" aria-label="Scenario assumptions" className="min-w-0" onSubmit={(e) => e.preventDefault()} noValidate>
            {GROUPS.map((group) => (
              <fieldset key={group.title} className="mb-7 min-w-0 border border-border px-4 pb-5 pt-3 md:px-6">
                <legend className="-ml-2 max-w-full px-2 text-base font-semibold tracking-[-0.02em] text-foreground">{group.title}</legend>
                {group.fields.map((field) => {
                  const id = `${formId}-${field.key}`;
                  const value = raw[field.key];
                  const parsed = parseField(field, value);
                  const errorId = `${id}-error`;
                  const hintId = `${id}-hint`;
                  return (
                    <div key={field.key} className="my-4 grid grid-cols-[minmax(0,1fr)_92px] items-center gap-x-4">
                      <label htmlFor={id} className="text-[13px] font-normal text-foreground">
                        {field.label}{" "}
                        {field.unit && <span className="text-[10px] text-muted-foreground">{unitLabel(field.unit)}</span>}
                      </label>
                      <input
                        id={id}
                        type="number"
                        inputMode="decimal"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={value}
                        required
                        aria-invalid={parsed === null}
                        aria-describedby={[field.hint ? hintId : null, parsed === null ? errorId : null].filter(Boolean).join(" ") || undefined}
                        onChange={(e) => set(field.key, e.target.value)}
                        className="block min-h-10 w-full border border-input bg-background px-2 py-2 text-base text-foreground md:text-sm"
                      />
                      <input
                        type="range"
                        aria-label={`${field.label} slider`}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={parsed ?? Math.min(field.max, Math.max(field.min, Number(value) || field.min))}
                        onChange={(e) => set(field.key, e.target.value)}
                        className="col-span-2 mt-2.5 min-h-7 w-full cursor-pointer accent-[hsl(var(--primary))]"
                      />
                      {field.hint && (
                        <p id={hintId} className="fine col-span-2 mt-1 text-[11px]">
                          {field.hint}
                        </p>
                      )}
                      {parsed === null && (
                        <p id={errorId} className="col-span-2 mt-1 text-xs font-medium text-destructive">
                          Enter a value from {field.min} to {field.max}
                          {field.step >= 1 ? " (whole numbers)" : ""}.
                        </p>
                      )}
                    </div>
                  );
                })}
              </fieldset>
            ))}
          </form>

          <div id="calc-output" className="min-w-0">
            <div className="border border-border p-4 xs:p-5 md:p-6">
              <Eyebrow className="mb-3">Cumulative position</Eyebrow>
              <h2 className="text-[26px] md:text-[28px]">Cash first. Value separately.</h2>
              <CashChart result={shown} money={money.exact} />
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[10px] leading-normal text-foreground md:text-[11px]">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="inline-block w-5 border-t-2 border-primary" />
                  Net cash position
                </span>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="inline-block w-5 border-t-2 border-dashed border-foreground" />
                  Including productivity value{shown.productiveValue > 0 ? "" : " (0% realised, not shown)"}
                </span>
              </div>
              <p className="fine mt-3">
                Cash line includes setup at month zero. Productivity value is included only at your selected realisation
                percentage.
              </p>
            </div>

            <div className="py-7">
              <h3 className="text-lg">First-month breakdown</h3>
              <dl className="mt-3">
                {breakdown.map(([label, value, total]) => (
                  <div
                    key={label}
                    className={
                      total
                        ? "flex flex-wrap justify-between gap-x-5 gap-y-1 border-b border-t-2 border-border border-t-foreground py-2.5 text-xs font-bold"
                        : "flex flex-wrap justify-between gap-x-5 gap-y-1 border-b border-border py-2.5 text-xs"
                    }
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="ml-auto whitespace-nowrap font-semibold tabular-nums text-foreground">{money.exact(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <Note title="Read the assumptions." className="mt-0">
              <p>
                “Workers per shift” is multiplied by shifts, 8 hours per shift, working days and 4.33 weeks per month. Turnover
                replacement cost is assumed to be 75% of annual base pay.
              </p>
              <p>
                Cashable labour reduction must reflect an actual reduction or avoided spend. Extra output has no cash value here
                unless you explicitly recognise incremental productivity value. Do not count the same output twice.
              </p>
              <p>
                The model assumes the proposed robot fleet can support the workload. Validate capacity, ramp-up, downtime,
                integration, residual staffing and ongoing costs before making a decision. No discounting, taxes, financing or
                residual value are modelled. An illustrative ROI is not a forecast for a specific deployment.
              </p>
            </Note>

            <details className="mt-6 border-y border-border">
              <summary className="cursor-pointer py-4 text-sm font-semibold text-foreground">How this model changed (October 2026)</summary>
              <ul className="list-disc space-y-1.5 pb-5 pl-5 text-[13px] text-muted-foreground">
                <li>Workers are counted per shift, and base pay is shown before benefits.</li>
                <li>Only the cashable share of labour cost you enter counts as a cash saving.</li>
                <li>Productivity gains are a separate economic value, off by default, and never added to cash results.</li>
                <li>Additional operating costs and the labour inflation rate can be entered.</li>
                <li>Payback is the first month the cumulative cash position, after setup, reaches zero.</li>
                <li>Earlier benchmark ranges were removed because their sources were not documented.</li>
              </ul>
            </details>

            <p role="status" className="fine mt-4">
              {invalid.length
                ? `Results paused: check ${invalid.length === 1 ? "one value" : `${invalid.length} values`} above. The last valid scenario is shown.`
                : "Results updated. Modelled benefits are assumptions and should be validated against the proposed deployment."}
            </p>
          </div>
        </div>
      </section>

      <ContactCta
        title="Want an independent review of the assumptions?"
        lead="Use this model to frame questions. A technical-commercial assessment can examine the deployment plan, cost drivers and evidence."
        intent="diligence"
        label="Discuss a robotics assessment"
      />
    </>
  );
};

export default RaasCalculator;
