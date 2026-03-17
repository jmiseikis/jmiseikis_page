import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, ChartTooltip);

/* ── Helpers ─────────────────────────────────────── */
function fmt(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e6) return sign + "$" + (abs / 1e6).toFixed(2) + "M";
  if (abs >= 1000) return sign + "$" + (abs / 1000).toFixed(1) + "K";
  return sign + "$" + abs.toFixed(0);
}

function fmtMonths(m: number): string {
  if (m <= 0) return "Immediate";
  if (m > 60) return ">5 years";
  if (m === 1) return "1 month";
  return m + " months";
}

function parseInput(str: string): number {
  let s = str.trim().replace(/\$/g, "").replace(/%/g, "").replace(/yr/gi, "").replace(/\s+/g, "");
  let mult = 1;
  if (/[Mm]$/.test(s)) { mult = 1e6; s = s.slice(0, -1); }
  else if (/[Kk]$/.test(s)) { mult = 1000; s = s.slice(0, -1); }
  return parseFloat(s) * mult;
}

/* ── Slider field component ──────────────────────── */
interface SliderFieldProps {
  label: string;
  tooltip?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

const SliderField = ({ label, tooltip, value, min, max, step, format, onChange }: SliderFieldProps) => {
  const [displayVal, setDisplayVal] = useState(format(value));

  useEffect(() => {
    setDisplayVal(format(value));
  }, [value, format]);

  const applyTyped = () => {
    const raw = parseInput(displayVal);
    if (isNaN(raw)) {
      setDisplayVal(format(value));
      return;
    }
    const snapped = Math.round((raw - min) / step) * step + min;
    const clamped = Math.min(max, Math.max(min, snapped));
    onChange(clamped);
  };

  return (
    <div className="raas-field">
      <div className="raas-fl">
        <span className="raas-fl-name">
          {label}
          {tooltip && (
            <span className="raas-tip">
              <span className="raas-tip-i">?</span>
              <span className="raas-tip-box">{tooltip}</span>
            </span>
          )}
        </span>
        <input
          type="text"
          className="raas-vbadge"
          value={displayVal}
          onChange={(e) => setDisplayVal(e.target.value)}
          onBlur={applyTyped}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
};

/* ── KPI Card ────────────────────────────────────── */
const KpiCard = ({ label, value, sub, color, accent }: {
  label: string; value: string; sub: string; color: string; accent: string;
}) => (
  <div className={`raas-kpi raas-k-${accent}`}>
    <div className="raas-kpi-label">{label}</div>
    <div className={`raas-kpi-val raas-kv-${color}`}>{value}</div>
    <div className="raas-kpi-sub">{sub}</div>
  </div>
);

/* ── Main Calculator ─────────────────────────────── */
const PAGE_TITLE = "RaaS ROI Calculator - Robot-as-a-Service Cost Analysis | Dr. Justinas Miseikis";
const PAGE_DESC = "Free interactive Robot-as-a-Service (RaaS) ROI calculator. Model labour savings, break-even timelines, and total cost of ownership for robotic automation deployments in warehousing, manufacturing, and logistics.";

const RAAS_JSONLD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "RaaS ROI Calculator",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://jmiseikis.lovable.app/raas-calculator",
  "description": PAGE_DESC,
  "author": {
    "@type": "Person",
    "name": "Dr. Justinas Miseikis",
    "url": "https://jmiseikis.lovable.app"
  },
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "keywords": "RaaS, Robot as a Service, ROI calculator, robotic automation, warehouse automation, manufacturing robots, cobot ROI, automation cost analysis, labour cost reduction, break-even analysis"
};

const RAAS_FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Robot-as-a-Service (RaaS)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Robot-as-a-Service (RaaS) is a subscription-based model where businesses lease robots instead of purchasing them outright. Monthly fees typically include the hardware, maintenance, software updates, and support - converting large CapEx into predictable OpEx. Industry pricing ranges from $1,500 to $8,000 per robot per month."
      }
    },
    {
      "@type": "Question",
      "name": "How do you calculate ROI for robotic automation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ROI for robotic automation is calculated by comparing total current costs (labour, benefits, turnover, error/rework, safety incidents) against RaaS costs (subscription fees plus one-time setup). Key factors include robot uptime (90-98%), productivity gains over manual labour (typically 30-50%), error reduction (50-90%), and break-even timeline (industry benchmark: 9-18 months)."
      }
    },
    {
      "@type": "Question",
      "name": "What is a typical break-even period for RaaS deployments?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The industry benchmark for RaaS break-even is 9 to 18 months. Factors that shorten break-even include higher labour costs, multi-shift operations, high staff turnover, and significant quality/safety cost reductions. A break-even under 6 months is considered excellent; 18+ months may require renegotiating subscription terms."
      }
    },
    {
      "@type": "Question",
      "name": "Who built this RaaS ROI Calculator?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "This calculator was built by Dr. Justinas Miseikis, an AI strategy expert and robotics PhD based in Zurich, Switzerland. He works as Strategy and Partnerships Manager at Sony AI and advises robotics startups, VCs, and enterprises on automation strategy and due diligence."
      }
    }
  ]
};

const RaasCalculator = () => {
  const [workers, setWorkers] = useState(3);
  const [wage, setWage] = useState(25);
  const [shifts, setShifts] = useState(2);
  const [days, setDays] = useState(5);
  const [overhead, setOverhead] = useState(30);
  const [turnover, setTurnover] = useState(20);
  const [robots, setRobots] = useState(2);
  const [sub, setSub] = useState(3000);
  const [setup, setSetup] = useState(20000);
  const [uptime, setUptime] = useState(95);
  const [speed, setSpeed] = useState(40);
  const [contract, setContract] = useState(3);
  const [errors, setErrors] = useState(5000);
  const [errReduce, setErrReduce] = useState(75);
  const [incidents, setIncidents] = useState(1000);
  const [incReduce, setIncReduce] = useState(60);

  // SEO: set page title, meta description, canonical, and inject JSON-LD
  useEffect(() => {
    const prevTitle = document.title;
    document.title = PAGE_TITLE;

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };

    setMeta("description", PAGE_DESC);
    setMeta("keywords", "RaaS ROI calculator, Robot as a Service, robotic automation ROI, warehouse automation cost, manufacturing robot cost analysis, cobot ROI, automation break-even, labour cost reduction robots, RaaS pricing, robotics startup tools, automation business case, OpEx robotics");
    setMeta("og:title", PAGE_TITLE, "property");
    setMeta("og:description", PAGE_DESC, "property");
    setMeta("og:url", "https://jmiseikis.lovable.app/raas-calculator", "property");
    setMeta("og:type", "website", "property");
    setMeta("twitter:title", "RaaS ROI Calculator - Free Robot-as-a-Service Cost Analysis");
    setMeta("twitter:description", PAGE_DESC);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://jmiseikis.lovable.app/raas-calculator";

    // Inject JSON-LD
    const scripts: HTMLScriptElement[] = [];
    [RAAS_JSONLD, RAAS_FAQ_JSONLD].forEach((data) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
      scripts.push(s);
    });

    return () => {
      document.title = prevTitle;
      scripts.forEach((s) => s.remove());
    };
  }, []);

  const calc = useMemo(() => {
    const overheadPc = overhead / 100;
    const turnoverPc = turnover / 100;
    const uptimePc = uptime / 100;
    const speedPc = speed / 100;
    const errRedPc = errReduce / 100;
    const incRedPc = incReduce / 100;

    const hoursPerMonth = shifts * 8 * days * 4.33;
    const laborBase = workers * wage * hoursPerMonth;
    const laborWithOH = laborBase * (1 + overheadPc);
    const annualBase = laborBase * 12;
    const turnoverMonthly = (annualBase * turnoverPc * 0.75) / 12;
    const totalCurrent = laborWithOH + turnoverMonthly + errors + incidents;

    const raasMonthly = robots * sub;
    const totalMonths = Math.round(contract * 12);
    const setupAmortized = totalMonths > 0 ? setup / totalMonths : 0;

    const laborSavings = laborWithOH + turnoverMonthly;
    const qualitySavings = errors * errRedPc + incidents * incRedPc;
    const prodGain = laborBase * speedPc * uptimePc;
    const totalSavings = laborSavings + qualitySavings + prodGain;
    const netMonthly = totalSavings - raasMonthly;

    let breakeven: number;
    if (setup === 0) breakeven = 0;
    else if (netMonthly <= 0) breakeven = -1;
    else breakeven = Math.ceil(setup / netMonthly);

    const cumSavings: number[] = [];
    const cumCosts: number[] = [];
    const netPos: number[] = [];
    const labels: string[] = [];

    let runSave = 0, runCost = setup, runNet = -setup;
    for (let m = 1; m <= totalMonths; m++) {
      const inflFactor = Math.pow(1.02, m / 12);
      const mSave = laborSavings * inflFactor + qualitySavings + prodGain;
      const mCost = raasMonthly;
      runSave += mSave;
      runCost += mCost;
      runNet += (mSave - mCost);
      cumSavings.push(runSave);
      cumCosts.push(runCost);
      netPos.push(runNet);
      labels.push((m === 1 || m % 3 === 0) ? "Mo " + m : "");
    }

    const totalInvestment = setup + raasMonthly * totalMonths;
    const netGain = runNet;
    const roi = totalInvestment > 0 ? (netGain / totalInvestment) * 100 : 0;

    return {
      laborBase, laborWithOH, turnoverMonthly, totalCurrent, errors: errors,
      incidents: incidents, raasMonthly, setupAmortized, setup,
      laborSavings, qualitySavings, prodGain, netMonthly,
      breakeven, netGain, roi, contract, totalMonths, workers, robots,
      cumSavings, cumCosts, netPos, labels,
    };
  }, [workers, wage, shifts, days, overhead, turnover, robots, sub, setup, uptime, speed, contract, errors, errReduce, incidents, incReduce]);

  // Break-even bar
  const maxM = calc.totalMonths;
  let bePct: number, beGood: boolean;
  if (calc.setup === 0 || calc.breakeven === 0) { bePct = 100; beGood = true; }
  else if (calc.breakeven < 0 || calc.breakeven > maxM) { bePct = 3; beGood = false; }
  else { bePct = Math.min(100, Math.round((calc.breakeven / maxM) * 100)); beGood = calc.breakeven <= 18; }

  const beStatusText = calc.breakeven === 0 ? "Immediate ROI"
    : calc.breakeven < 0 ? "Never recoups setup cost"
    : calc.breakeven > maxM ? "Beyond contract period"
    : "Break-even: month " + calc.breakeven;

  // Verdict
  let verdictCls = "", verdictLabel = "", verdictHtml = "";
  if (calc.netMonthly <= 0) {
    verdictLabel = "\u26a0\ufe0f Negative Return";
    verdictHtml = `The RaaS subscription (<strong>${fmt(calc.raasMonthly)}/mo</strong>) currently exceeds total savings. Consider <strong>fewer robots</strong>, a lower subscription tier, or replacing more workers to turn this positive.`;
  } else if (calc.breakeven < 0 || calc.breakeven > maxM) {
    verdictLabel = "\ud83d\udccb Beyond Contract Period";
    verdictHtml = `Generates <strong>${fmt(calc.netMonthly)}/month</strong> net savings, but the <strong>${fmt(calc.setup)}</strong> setup cost would take <strong>${fmtMonths(calc.breakeven)}</strong> to recover — beyond the ${calc.contract}-year contract. Negotiate a lower setup fee or extend the term.`;
  } else if (calc.breakeven <= 6) {
    verdictCls = "good";
    verdictLabel = "\ud83d\ude80 Excellent ROI Profile";
    verdictHtml = `Break-even in just <strong>${fmtMonths(calc.breakeven)}</strong>. Net gain over ${calc.contract} year${calc.contract > 1 ? "s" : ""}: <strong>${fmt(calc.netGain)}</strong> at <strong>${calc.roi.toFixed(0)}% ROI</strong>. A highly compelling pitch — <strong>${calc.robots} robot${calc.robots > 1 ? "s" : ""}</strong> replacing/assisting <strong>${calc.workers} worker${calc.workers > 1 ? "s" : ""}</strong>.`;
  } else if (calc.breakeven <= 18) {
    verdictCls = "good";
    verdictLabel = "\u2705 Strong Business Case";
    verdictHtml = `Break-even at <strong>${fmtMonths(calc.breakeven)}</strong> is within the industry benchmark of 9-18 months. Net gain: <strong>${fmt(calc.netGain)}</strong> at <strong>${calc.roi.toFixed(0)}% ROI</strong> — a credible and competitive RaaS proposal.`;
  } else {
    verdictCls = "warn";
    verdictLabel = "\ud83d\udcca Moderate ROI";
    verdictHtml = `Break-even at <strong>${fmtMonths(calc.breakeven)}</strong> is above the 9-18 month benchmark. Net gain: <strong>${fmt(calc.netGain)}</strong>. Consider lower setup costs, more robots per contract, or higher-wage target markets.`;
  }

  const chartData = {
    labels: calc.labels,
    datasets: [
      {
        label: "Cumulative Savings",
        data: calc.cumSavings,
        borderColor: "#0d7a4e",
        backgroundColor: "rgba(13,122,78,0.07)",
        borderWidth: 2, pointRadius: 0, pointHoverRadius: 4,
        fill: true, tension: 0.35,
      },
      {
        label: "Total RaaS Cost",
        data: calc.cumCosts,
        borderColor: "#E8192C",
        backgroundColor: "rgba(232,25,44,0.05)",
        borderWidth: 2, pointRadius: 0, pointHoverRadius: 4,
        fill: true, tension: 0.35,
      },
      {
        label: "Net Position",
        data: calc.netPos,
        borderColor: "#555555",
        backgroundColor: "transparent",
        borderWidth: 2, borderDash: [5, 3],
        pointRadius: 0, pointHoverRadius: 5,
        fill: false, tension: 0.35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1c1c1c",
        borderColor: "#333",
        borderWidth: 1,
        titleColor: "#aaa",
        bodyColor: "#fff",
        padding: 12,
        callbacks: {
          label: (ctx: any) => "  " + ctx.dataset.label + ": " + fmt(ctx.parsed.y),
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(0,0,0,0.04)" },
        ticks: { color: "#aaa", font: { family: "Inter", size: 10 }, maxRotation: 0 },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.04)" },
        ticks: {
          color: "#aaa",
          font: { family: "Inter", size: 10 },
          callback: (v: any) => fmt(v),
        },
      },
    },
  };

  return (
    <article className="raas-page" itemScope itemType="https://schema.org/SoftwareApplication">
      <meta itemProp="name" content="RaaS ROI Calculator" />
      <meta itemProp="applicationCategory" content="BusinessApplication" />
      <meta itemProp="operatingSystem" content="Web" />

      {/* Back nav */}
      <nav aria-label="Breadcrumb">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </nav>

      {/* Header */}
      <header>
        <div className="raas-eyebrow"><span className="raas-eyebrow-dot" /> Robot as a Service &middot; Interactive Tool</div>
        <h1 className="raas-h1">RaaS <span>ROI</span> Calculator</h1>
        <p className="raas-subtitle" itemProp="description">
          Free interactive Robot-as-a-Service ROI calculator. Model the financial impact of deploying robots on a subscription model versus maintaining manual labour for warehousing, manufacturing, and logistics. Adjust every slider -- all numbers update in real time.
        </p>
      </header>

      {/* KPIs */}
      <div className="raas-sh">Live Results</div>
      <div className="raas-g4">
        <KpiCard label="Monthly Net Savings" value={fmt(calc.netMonthly)} sub="After RaaS subscription" color={calc.netMonthly >= 0 ? "green" : "red"} accent="green" />
        <KpiCard label="Break-even" value={calc.breakeven === 0 ? "Immediate" : calc.breakeven < 0 ? "Never" : fmtMonths(calc.breakeven)} sub="Months to recover setup cost" color={calc.breakeven >= 0 && calc.breakeven <= 18 ? "green" : "red"} accent="red" />
        <KpiCard label="ROI over Contract" value={calc.roi.toFixed(0) + "%"} sub="Return on total investment" color={calc.roi >= 0 ? "amber" : "red"} accent="amber" />
        <KpiCard label="Net Gain (Contract)" value={fmt(calc.netGain)} sub="Cumulative savings after costs" color={calc.netGain >= 0 ? "black" : "red"} accent="black" />
      </div>

      {/* Inputs */}
      <div className="raas-sh">Configure Your Scenario</div>
      <div className="raas-g2">
        <div className="raas-card">
          <div className="raas-ct">👷 Current Labour Costs</div>
          <SliderField label="Workers replaced / assisted" value={workers} min={1} max={20} step={1} format={v => String(Math.round(v))} onChange={setWorkers} />
          <SliderField label="Hourly wage per worker" value={wage} min={10} max={80} step={1} format={v => "$" + Math.round(v)} onChange={setWage} />
          <SliderField label="Shifts per day" value={shifts} min={1} max={3} step={1} format={v => String(Math.round(v))} onChange={setShifts} />
          <SliderField label="Working days per week" value={days} min={5} max={7} step={1} format={v => String(Math.round(v))} onChange={setDays} />
          <SliderField label="Benefits & overhead" tooltip="Employer-paid benefits: health, pension, payroll taxes. Typically 25-40% on top of base salary." value={overhead} min={10} max={60} step={5} format={v => Math.round(v) + "%"} onChange={setOverhead} />
          <SliderField label="Annual staff turnover" tooltip="Replacement cost ~75% of annual salary, covering recruiting, onboarding and lost productivity." value={turnover} min={0} max={100} step={5} format={v => Math.round(v) + "%"} onChange={setTurnover} />
        </div>

        <div className="raas-card">
          <div className="raas-ct">🤖 RaaS Subscription Model</div>
          <SliderField label="Robots deployed" value={robots} min={1} max={20} step={1} format={v => String(Math.round(v))} onChange={setRobots} />
          <SliderField label="Monthly subscription / robot" tooltip="Industry range: $1,500-$8,000/month. Typically includes hardware, maintenance, software & support." value={sub} min={500} max={15000} step={250} format={fmt} onChange={setSub} />
          <SliderField label="Setup / integration fee" tooltip="WMS integration, facility modifications, safety compliance, staff training. Typically $10K-$100K." value={setup} min={0} max={150000} step={2500} format={fmt} onChange={setSetup} />
          <SliderField label="Robot uptime vs. human" tooltip="Robots don't take sick days or vacations. Effective productive uptime is typically 90-98%." value={uptime} min={70} max={99} step={1} format={v => Math.round(v) + "%"} onChange={setUptime} />
          <SliderField label="Productivity gain vs. human" tooltip="How much more productive is the robot? 40% means it produces 40% more output in the same time." value={speed} min={0} max={200} step={5} format={v => Math.round(v) + "%"} onChange={setSpeed} />
          <SliderField label="Contract length" value={contract} min={1} max={5} step={1} format={v => Math.round(v) + " yr"} onChange={setContract} />
        </div>
      </div>

      <div className="raas-g2" style={{ marginTop: 14 }}>
        <div className="raas-card">
          <div className="raas-ct">⚠️ Quality & Error Costs</div>
          <SliderField label="Monthly rework / error cost" tooltip="Cost of defects, rework or errors per month under current manual operations." value={errors} min={0} max={50000} step={500} format={fmt} onChange={setErrors} />
          <SliderField label="Error reduction from robots" tooltip="Robots reduce defect rates by 50-90% vs. humans in repetitive tasks (industry average)." value={errReduce} min={0} max={100} step={5} format={v => Math.round(v) + "%"} onChange={setErrReduce} />
          <SliderField label="Incident / liability cost / mo" tooltip="Workplace injuries, insurance premiums, compliance fines. Robots substantially reduce this." value={incidents} min={0} max={20000} step={250} format={fmt} onChange={setIncidents} />
          <SliderField label="Incident reduction from robots" value={incReduce} min={0} max={100} step={5} format={v => Math.round(v) + "%"} onChange={setIncReduce} />
        </div>

        <div className="raas-card">
          <div className="raas-ct">📐 Model Assumptions & Sources</div>
          <p className="text-xs mb-3" style={{ color: "var(--raas-gray-50)", lineHeight: 1.6 }}>
            Benchmarks for <strong style={{ color: "var(--raas-black)" }}>warehouse, manufacturing & logistics</strong> RaaS deployments. 2% annual labour inflation applied.
          </p>
          <div className="raas-ar"><span className="raas-ar-lbl">Labour cost source</span><span className="raas-ar-val raas-ar-r">BLS / Eurostat</span></div>
          <div className="raas-ar"><span className="raas-ar-lbl">RaaS pricing source</span><span className="raas-ar-val raas-ar-r">Rapyuta · Formic · ABB</span></div>
          <div className="raas-ar"><span className="raas-ar-lbl">Typical break-even</span><span className="raas-ar-val raas-ar-g">9-18 months</span></div>
          <div className="raas-ar"><span className="raas-ar-lbl">Avg. labour cost reduction</span><span className="raas-ar-val raas-ar-g">30-50%</span></div>
          <div className="raas-ar"><span className="raas-ar-lbl">Integration timeline</span><span className="raas-ar-val raas-ar-a">1-6 months</span></div>
          <div className="raas-ar"><span className="raas-ar-lbl">Cost model</span><span className="raas-ar-val">OpEx / RaaS</span></div>
          <div className="raas-ar"><span className="raas-ar-lbl">Labour inflation baked in</span><span className="raas-ar-val">2% / year</span></div>
        </div>
      </div>

      {/* Chart */}
      <div className="raas-card" style={{ marginTop: 14 }}>
        <div className="raas-chart-head">
          <div>
            <div className="raas-chart-title">Cumulative Cash Flow Over Contract</div>
            <div className="raas-chart-sub">Month-by-month: gross savings vs. RaaS costs vs. net position (2% labour inflation applied)</div>
          </div>
          <div className="raas-legend">
            <div className="raas-leg-i"><div className="raas-leg-dot" style={{ background: "#0d7a4e" }} />Cumulative Savings</div>
            <div className="raas-leg-i"><div className="raas-leg-dot" style={{ background: "#E8192C" }} />Total RaaS Cost</div>
            <div className="raas-leg-i"><div className="raas-leg-dot" style={{ background: "#555" }} />Net Position</div>
          </div>
        </div>
        <div style={{ position: "relative", height: 230 }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Breakdown */}
      <div className="raas-g2" style={{ marginTop: 14 }}>
        <div className="raas-card">
          <div className="raas-ct">📊 Monthly Cost Breakdown</div>
          <div className="raas-brow"><span className="raas-brow-lbl">Base labour cost</span><span className="raas-brow-val raas-bv-r">{fmt(calc.laborWithOH)}</span></div>
          <div className="raas-brow"><span className="raas-brow-lbl">Benefits & overhead</span><span className="raas-brow-val raas-bv-r">{fmt(calc.laborWithOH - calc.laborBase)}</span></div>
          <div className="raas-brow"><span className="raas-brow-lbl">Turnover cost (monthly)</span><span className="raas-brow-val raas-bv-r">{fmt(calc.turnoverMonthly)}</span></div>
          <div className="raas-brow"><span className="raas-brow-lbl">Error / rework cost</span><span className="raas-brow-val raas-bv-r">{fmt(calc.errors)}</span></div>
          <div className="raas-brow"><span className="raas-brow-lbl">Incident / liability</span><span className="raas-brow-val raas-bv-r">{fmt(calc.incidents)}</span></div>
          <div className="raas-brow raas-brow-total"><span className="raas-brow-lbl">Total current monthly</span><span className="raas-brow-val raas-bv-r">{fmt(calc.totalCurrent)}</span></div>
        </div>

        <div className="raas-card">
          <div className="raas-ct">🤖 RaaS Monthly Summary</div>
          <div className="raas-brow"><span className="raas-brow-lbl">RaaS subscription total</span><span className="raas-brow-val raas-bv-r">{fmt(calc.raasMonthly)}</span></div>
          <div className="raas-brow"><span className="raas-brow-lbl">Setup fee (amortised)</span><span className="raas-brow-val raas-bv-r">{fmt(calc.setupAmortized)}</span></div>
          <div className="raas-brow"><span className="raas-brow-lbl">Labour savings</span><span className="raas-brow-val raas-bv-g">+{fmt(calc.laborSavings)}</span></div>
          <div className="raas-brow"><span className="raas-brow-lbl">Quality savings</span><span className="raas-brow-val raas-bv-g">+{fmt(calc.qualitySavings)}</span></div>
          <div className="raas-brow"><span className="raas-brow-lbl">Productivity gain value</span><span className="raas-brow-val raas-bv-g">+{fmt(calc.prodGain)}</span></div>
          <div className="raas-brow raas-brow-total">
            <span className="raas-brow-lbl">Net monthly savings</span>
            <span className={`raas-brow-val ${calc.netMonthly >= 0 ? "raas-bv-g" : "raas-bv-r"}`}>
              {(calc.netMonthly >= 0 ? "+" : "") + fmt(calc.netMonthly)}
            </span>
          </div>
        </div>
      </div>

      {/* Break-even bar */}
      <div className="raas-card" style={{ marginTop: 14 }}>
        <div className="raas-ct">📍 Break-even Progress</div>
        <div className="raas-be-head">
          <span className="raas-be-lbl">Setup cost recovery timeline</span>
          <span className={`raas-be-stat ${beGood ? "raas-be-good" : ""}`}>{beStatusText}</span>
        </div>
        <div className="raas-bar-track">
          <div className={`raas-bar-fill ${beGood ? "raas-bar-good" : ""}`} style={{ width: bePct + "%" }} />
        </div>
        <div className="raas-bar-ticks">
          <span>Month 0</span>
          <span>Month {Math.round(maxM / 2)}</span>
          <span>Month {maxM}</span>
        </div>
      </div>

      {/* Verdict */}
      <div className={`raas-verdict ${verdictCls ? "raas-verdict-" + verdictCls : ""}`} style={{ marginTop: 14 }}>
        <div className="raas-v-label">{verdictLabel}</div>
        <div className="raas-v-text" dangerouslySetInnerHTML={{ __html: verdictHtml }} />
      </div>

      {/* Footer */}
      <div className="raas-footer">
        Built by <Link to="/" className="raas-footer-link">Dr. Justinas Miseikis</Link> · AI Strategy & Robotics Expert · Benchmarks: BLS, Rapyuta, Automate.org, Formic
      </div>
    </div>
  );
};

export default RaasCalculator;
