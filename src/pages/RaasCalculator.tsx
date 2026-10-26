import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import PageMeta from "@/components/site/PageMeta";
import { ContactCta, Eyebrow, PageHero, TextLink } from "@/components/site/primitives";
import CashFlowChart from "@/components/robotics-roi/CashFlowChart";
import Term from "@/components/robotics-roi/Term";
import {
  FIELDS, HELPER_LABELS, NUMERIC_KEYS, STEPS, STEP_FIELDS, editableNumber, fieldLimit, toRaw,
  type NumericKey, type HelperKey, type InputKey, type RawInputs,
} from "@/components/robotics-roi/input-guide";
import {
  DEFAULT_INPUTS, MODEL_VERSION, calculateComparison, deserializeScenario, parseNumericInput,
  serializeScenario, validateInputs, type RoiInputs, type NumberLocale, type OptionResult,
} from "@/lib/robotics-roi";
import "@/components/robotics-roi/robotics-roi.css";

type Evidence = "Illustrative example" | "Estimate" | "Supplier quote" | "Measured / pilot";
type StaffingChoice = "none" | "some" | "all";
interface Context { application: string; evidence: Evidence; note: string }
const STORAGE_KEY = `jmiseikis.robotics-roi.v${MODEL_VERSION}`;
const DEFAULT_CONTEXT: Context = { application: "Example task", evidence: "Illustrative example", note: "Replace these example assumptions with a scoped supplier quote and staffing plan." };
const EVIDENCE: Evidence[] = ["Illustrative example", "Estimate", "Supplier quote", "Measured / pilot"];
const APPLICATIONS = ["Example task", "Palletizing", "Machine tending", "Internal transport", "Cleaning", "Custom task"];
const staffingFor = (percent: number): StaffingChoice => percent === 0 ? "none" : percent === 100 ? "all" : "some";
const paybackLabel = (option: OptionResult, months: number) => {
  if (option.id === "manual") return "Baseline";
  if (option.paybackStatus === "recovered") return `Month ${option.paybackMonth}${option.fallsNegativeAfterPayback ? " · falls negative later" : ""}`;
  if (option.paybackStatus === "cash-positive-from-start") return "No cash deficit";
  if (option.paybackStatus === "no-upfront-ongoing-loss") return "No upfront fee; ongoing loss";
  if (option.paybackStatus === "no-change") return "No cash change";
  return `Not within ${months} months`;
};
const download = (text: string, name: string, type: string) => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const RaasCalculator = () => {
  const id = useId();
  const [raw, setRaw] = useState<RawInputs>(() => toRaw({ ...DEFAULT_INPUTS }));
  const [currency, setCurrency] = useState<RoiInputs["currency"]>(DEFAULT_INPUTS.currency);
  const [locale, setLocale] = useState<NumberLocale>(DEFAULT_INPUTS.numberLocale);
  const [renew, setRenew] = useState(DEFAULT_INPUTS.renewRaasAfterContract);
  const [context, setContext] = useState<Context>(DEFAULT_CONTEXT);
  const [showPurchase, setShowPurchase] = useState(true);
  const [status, setStatus] = useState("");
  const [hasSaved, setHasSaved] = useState(false);
  const [step, setStep] = useState(0);
  const [focusTarget, setFocusTarget] = useState<string | null>(null);
  const [timeBasis, setTimeBasis] = useState<"monthly" | "daily">("monthly");
  const [dailyHours, setDailyHours] = useState("51.96");
  const [workingDays, setWorkingDays] = useState("20");
  const [dailyAnchor, setDailyAnchor] = useState<{ hours: string; days: string; monthly: number } | null>(null);
  const [automationBasis, setAutomationBasis] = useState<"share" | "hours">("share");
  const [automationShare, setAutomationShare] = useState("50");
  const [automationAnchor, setAutomationAnchor] = useState<{ share: string; baseline: number; hours: number } | null>(null);
  const [staffingChoice, setStaffingChoice] = useState<StaffingChoice>("some");
  const lastPartialShare = useRef(50);
  const [customPeriod, setCustomPeriod] = useState(false);
  const [customRamp, setCustomRamp] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setHasSaved(window.localStorage.getItem(STORAGE_KEY) !== null); } catch { /* Storage is optional. */ }
  }, []);
  useEffect(() => {
    if (!focusTarget) return;
    const element = document.getElementById(focusTarget);
    let parent = element?.parentElement;
    while (parent) {
      if (parent.tagName === "DETAILS") (parent as HTMLDetailsElement).open = true;
      parent = parent.parentElement;
    }
    element?.focus({ preventScroll: true });
    element?.scrollIntoView?.({ block: "start", behavior: "auto" });
    setFocusTarget(null);
  }, [step, focusTarget]);

  const { input, draft, errors } = useMemo(() => {
    const next = { currency, numberLocale: locale, renewRaasAfterContract: renew } as RoiInputs;
    const invalid: Partial<Record<InputKey, string>> = {};
    const parseError = `Enter a complete number using ${locale === "de-DE" ? "a comma" : "a dot"} for decimals.`;
    for (const key of NUMERIC_KEYS) {
      if ((key === "baselineTaskHours" && timeBasis === "daily") || (key === "automatedTaskHours" && automationBasis === "share")) continue;
      const value = parseNumericInput(raw[key], locale);
      if (value === null) invalid[key] = parseError;
      else next[key] = value;
    }
    if (timeBasis === "daily") {
      const hours = parseNumericInput(dailyHours, locale), days = parseNumericInput(workingDays, locale);
      if (hours === null) invalid.dailyHours = parseError;
      else if (hours < 0 || hours > 1_000_000_000) invalid.dailyHours = "Use a non-negative total of staff hours for one working day.";
      if (days === null) invalid.workingDays = parseError;
      else if (days < 1 || days > 31) invalid.workingDays = "Use between 1 and 31 working days per month. An average may include decimals.";
      if (!invalid.dailyHours && !invalid.workingDays && hours !== null && days !== null) {
        // Changing view alone preserves the exact canonical amount, including imported decimals.
        next.baselineTaskHours = dailyAnchor?.hours === dailyHours && dailyAnchor.days === workingDays ? dailyAnchor.monthly : hours * days;
        if (next.baselineTaskHours > 1_000_000_000) invalid.dailyHours = "The calculated monthly total exceeds the model's maximum of 1 billion hours.";
      }
    }
    if (automationBasis === "share") {
      const share = parseNumericInput(automationShare, locale);
      if (share === null) invalid.automationShare = parseError;
      else if (share < 0 || share > 100) invalid.automationShare = "Use 0–100% of the current task. The robot cannot take over more work than this baseline contains.";
      else if (Number.isFinite(next.baselineTaskHours)) {
        next.automatedTaskHours = automationAnchor?.share === automationShare && automationAnchor.baseline === next.baselineTaskHours
          ? automationAnchor.hours : next.baselineTaskHours * share / 100;
      }
    }
    if (Object.keys(invalid).length === 0) {
      for (const issue of validateInputs(next)) invalid[issue.field] = issue.message.replace(/^[A-Za-z]+: /, "");
    }
    return { input: Object.keys(invalid).length === 0 ? next : null, draft: next, errors: invalid };
  }, [raw, currency, locale, renew, timeBasis, dailyHours, workingDays, dailyAnchor, automationBasis, automationShare, automationAnchor]);
  const result = useMemo(() => input ? calculateComparison(input) : null, [input]);
  const sensitivity = useMemo(() => input ? [0, input.cashRealisationPercent, 100].map((percent) => calculateComparison({ ...input, cashRealisationPercent: percent })) : [], [input]);
  const money = useMemo(() => {
    const format = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 });
    return (value: number) => format.format(Math.abs(value) < .00001 ? 0 : value);
  }, [currency, locale]);
  const number = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const fmt = (value: number) => editableNumber(value, locale);
  const numeric = (key: NumericKey) => Number.isFinite(draft[key]) ? draft[key] : null;
  const set = (key: NumericKey, value: string) => {
    setRaw((prev) => ({ ...prev, [key]: value })); setStatus("");
    if (key === "cashRealisationPercent") {
      const parsed = parseNumericInput(value, locale);
      if (parsed !== null && parsed > 0 && parsed < 100) lastPartialShare.current = parsed;
    }
  };
  const errorEntries = Object.entries(errors);
  const fieldId = (key: InputKey) => `${id}-${key}`;
  const labelFor = (key: string) => FIELDS[key as NumericKey]?.label || HELPER_LABELS[key as HelperKey] || (key === "renewRaasAfterContract" ? "Contract continuation" : "Scenario");
  const goStep = (next: number) => { setStep(next); setFocusTarget(`${id}-step-${next}`); };
  const focusField = (key: string) => {
    const owner = STEP_FIELDS.findIndex((keys) => keys.includes(key as InputKey));
    if (owner >= 0) setStep(owner);
    if (key.startsWith("purchase")) setShowPurchase(true);
    if (key === "horizonMonths") setCustomPeriod(true);
    if (key === "rampMonths" || key === "firstRampPercent") setCustomRamp(true);
    setFocusTarget(fieldId(key === "baselineTaskHours" && timeBasis === "daily" ? "dailyHours" : key as InputKey));
  };
  const nextStep = () => {
    const invalid = errorEntries.find(([key]) => STEP_FIELDS[step].includes(key as InputKey));
    if (invalid) { focusField(invalid[0]); return; }
    if (step < 3) goStep(step + 1);
    else if (errorEntries.length) focusField(errorEntries[0][0]);
    else setFocusTarget("calculator-results");
  };
  const showComparison = () => {
    if (errorEntries.length) { focusField(errorEntries[0][0]); return; }
    setStep(3); setFocusTarget("calculator-results");
  };
  const changeTimeBasis = (next: "monthly" | "daily") => {
    if (next === timeBasis) return;
    const monthly = numeric("baselineTaskHours");
    if (monthly === null || monthly < 0 || monthly > 1_000_000_000 || errors.dailyHours || errors.workingDays) {
      setStatus("Correct the staff-time inputs before changing the entry method. Your current entries have been kept."); return;
    }
    if (next === "daily") {
      const previousDays = parseNumericInput(workingDays, locale);
      const days = previousDays !== null && previousDays >= 1 && previousDays <= 31 ? previousDays : 20;
      const hoursText = fmt(monthly / days), daysText = fmt(days);
      setDailyHours(hoursText); setWorkingDays(daysText); setDailyAnchor({ hours: hoursText, days: daysText, monthly });
    } else if (monthly !== null) setRaw((prev) => ({ ...prev, baselineTaskHours: fmt(monthly) }));
    setTimeBasis(next); setStatus("Entry method changed. Review the monthly total shown below; switching methods alone does not change it.");
  };
  const changeAutomationBasis = (next: "share" | "hours") => {
    if (next === automationBasis) return;
    const hours = numeric("automatedTaskHours"), baseline = numeric("baselineTaskHours");
    if (hours === null || baseline === null || baseline < 0 || hours < 0 || hours > baseline || errors.automationShare) {
      setStatus("Correct the task and robot coverage before changing the entry method. Your current entries have been kept."); return;
    }
    if (next === "share") {
      const share = fmt(baseline > 0 ? hours / baseline * 100 : 0);
      setAutomationShare(share); setAutomationAnchor({ share, baseline, hours });
    } else if (hours !== null) setRaw((prev) => ({ ...prev, automatedTaskHours: fmt(hours) }));
    setAutomationBasis(next); setStatus("Robot coverage entry changed without changing the current hours.");
  };
  const chooseStaffing = (choice: StaffingChoice) => {
    setStaffingChoice(choice);
    set("cashRealisationPercent", fmt(choice === "none" ? 0 : choice === "all" ? 100 : lastPartialShare.current));
  };
  const control = (key: InputKey, value: string, onChange: (value: string) => void, unit?: string, options: { slider?: boolean; disabled?: boolean; max?: number; min?: number; integer?: boolean } = {}) => {
    const parsed = parseNumericInput(value, locale);
    const error = errors[key];
    return <>
      <div className="roi-control" aria-invalid={error ? "true" : undefined}>
        <input id={fieldId(key)} name={key} type="text" inputMode={options.integer ? "numeric" : "decimal"} value={value}
          onChange={(event) => onChange(event.target.value)} autoComplete="off" spellCheck={false} disabled={options.disabled}
          aria-invalid={Boolean(error)} aria-describedby={`${fieldId(key)}-hint${error ? ` ${fieldId(key)}-error` : ""}`} />
        {unit && <span aria-hidden="true">{unit}</span>}
      </div>
      {options.slider && <div className="roi-range-wrap">
        <input type="range" className="roi-range" aria-label={`${labelFor(key)} slider`} min={options.min ?? 0} max={options.max ?? 100} step="0.25"
          value={parsed === null ? 0 : Math.max(options.min ?? 0, Math.min(options.max ?? 100, parsed))}
          onChange={(event) => onChange(fmt(Number(event.target.value)))} disabled={options.disabled}
          aria-valuetext={parsed === null ? "Enter a valid percentage" : `${number.format(parsed)}%`}
          aria-describedby={`${fieldId(key)}-hint`} />
        <div className="roi-range-ends" aria-hidden="true"><span>0%</span><span>100%</span></div>
      </div>}
      {error && <p className="roi-error" id={`${fieldId(key)}-error`}>{error}</p>}
      {parsed !== null && options.max !== undefined && parsed > options.max && options.max < 1_000_000_000 && <button type="button" className="roi-limit-action" onClick={() => onChange(fmt(options.max!))}>Use the maximum: {number.format(options.max)} {unit}</button>}
    </>;
  };
  const field = (key: NumericKey, options: { slider?: boolean } = {}) => {
    const spec = FIELDS[key], limit = fieldLimit(key, draft);
    const unit = spec.unit === "money" ? currency : spec.unit === "month" ? "month #" : spec.unit === "hours" ? "h / month" : spec.unit;
    const bound = spec.unit === "%" ? "0–100%." : limit.integer ? `${limit.min}–${limit.max} whole months.` : limit.max !== undefined && ["automatedTaskHours", "otherCashSavingsMonthly", "purchaseResidualValue"].includes(key) ? `Maximum ${number.format(limit.max)} ${unit}.` : "";
    return <div className="roi-question" key={key}>
      <div className="roi-question-copy"><label htmlFor={fieldId(key)}>{spec.label}</label><p id={`${fieldId(key)}-hint`}>{spec.hint} {bound}{spec.term && <> <Term term={spec.term} /></>}</p></div>
      <div className="roi-answer">{control(key, raw[key], (value) => set(key, value), unit, { ...limit, ...options })}</div>
    </div>;
  };
  const helperField = (key: HelperKey, value: string, onChange: (value: string) => void, hint: ReactNode, unit: string, options: { slider?: boolean; disabled?: boolean; max?: number; min?: number } = {}) => <div className="roi-question">
    <div className="roi-question-copy"><label htmlFor={fieldId(key)}>{HELPER_LABELS[key]}</label><p id={`${fieldId(key)}-hint`}>{hint}</p></div>
    <div className="roi-answer">{control(key, value, onChange, unit, options)}</div>
  </div>;
  const applyInput = (next: RoiInputs, guidedExample = false) => {
    setRaw(toRaw(next)); setCurrency(next.currency); setLocale(next.numberLocale); setRenew(next.renewRaasAfterContract);
    setTimeBasis("monthly"); setAutomationBasis(guidedExample ? "share" : "hours");
    const share = editableNumber(next.baselineTaskHours > 0 ? next.automatedTaskHours / next.baselineTaskHours * 100 : 0, next.numberLocale);
    setAutomationShare(share); setAutomationAnchor({ share, baseline: next.baselineTaskHours, hours: next.automatedTaskHours });
    setDailyAnchor(null); setWorkingDays("20"); setDailyHours(editableNumber(next.baselineTaskHours / 20, next.numberLocale));
    setStaffingChoice(staffingFor(next.cashRealisationPercent));
    lastPartialShare.current = next.cashRealisationPercent > 0 && next.cashRealisationPercent < 100 ? next.cashRealisationPercent : 50;
    setCustomPeriod(![12, 36, 60].includes(next.horizonMonths));
    setCustomRamp(!(next.rampMonths === 1 || (next.rampMonths === 3 && next.firstRampPercent === 50)));
  };
  const changeLocale = (next: NumberLocale) => {
    const reformat = (text: string) => { const value = parseNumericInput(text, locale); return value === null ? text : editableNumber(value, next); };
    setRaw((previous) => Object.fromEntries(NUMERIC_KEYS.map((key) => [key, reformat(previous[key])])) as RawInputs);
    setDailyHours(reformat); setWorkingDays(reformat); setAutomationShare(reformat);
    setDailyAnchor((anchor) => anchor ? { ...anchor, hours: reformat(anchor.hours), days: reformat(anchor.days) } : null);
    setAutomationAnchor((anchor) => anchor ? { ...anchor, share: reformat(anchor.share) } : null);
    setLocale(next); setStatus("Number format changed. Review any inputs that are still highlighted.");
  };
  const exportJson = () => {
    if (!input) return;
    const payload = { ...JSON.parse(serializeScenario(input)), context, showPurchase };
    download(JSON.stringify(payload, null, 2), `robotics-roi-scenario-v${MODEL_VERSION}.json`, "application/json");
    setStatus("Scenario exported with assumptions, evidence note and model version.");
  };
  const exportCsv = () => {
    if (!result || !input) return;
    const headings = ["model_version", "currency", "month", "manual_cash_cost", "raas_cash_cost", "raas_net_cash", "raas_cumulative_cash", "raas_discounted_cash", "purchase_cash_cost", "purchase_net_cash", "purchase_cumulative_cash", "purchase_discounted_cash"];
    const rows = result.options.raas.series.map((row, index) => {
      const purchase = result.options.purchase.series[index];
      return [MODEL_VERSION, currency, row.month, row.manualCashCost, row.optionCashCost, row.incrementalCashFlow, row.cumulativeCashFlow, row.discountedCashFlow, purchase.optionCashCost, purchase.incrementalCashFlow, purchase.cumulativeCashFlow, purchase.discountedCashFlow]
        .map((value) => typeof value === "number" ? value.toFixed(2) : `"${value}"`).join(",");
    });
    download([headings.join(","), ...rows].join("\r\n"), `robotics-roi-cashflow-${currency}.csv`, "text/csv;charset=utf-8");
    setStatus("Monthly cash-flow CSV exported. Export the scenario JSON to keep its assumptions too.");
  };
  const restoreJson = (text: string) => {
    const next = deserializeScenario(text);
    const document = JSON.parse(text);
    applyInput(next);
    const candidate = document.context;
    setContext(candidate && typeof candidate === "object" ? {
      application: APPLICATIONS.includes(candidate.application) ? candidate.application : "Custom task",
      evidence: EVIDENCE.includes(candidate.evidence) ? candidate.evidence : "Estimate",
      note: typeof candidate.note === "string" ? candidate.note.slice(0, 500) : "",
    } : { ...DEFAULT_CONTEXT, evidence: "Estimate", note: "Imported scenario. Review the supporting evidence." });
    setShowPurchase(typeof document.showPurchase === "boolean" ? document.showPurchase : true);
  };
  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 100_000) { setStatus("This file is too large. Import a scenario JSON smaller than 100 KB."); return; }
    try { restoreJson(await file.text()); setStatus("Scenario imported. Review its inputs and evidence before using the results."); }
    catch (error) { setStatus(`Could not import this scenario. ${error instanceof Error ? error.message : "Use an exported scenario from this model version."}`); }
  };
  const save = () => {
    if (!input) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...JSON.parse(serializeScenario(input)), context, showPurchase }));
      setHasSaved(true); setStatus("Saved in this browser only. Use Export scenario to keep a transferable copy.");
    } catch { setStatus("This browser does not allow local saving. You can still export the scenario."); }
  };
  const load = () => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) { setHasSaved(false); setStatus("No saved scenario was found in this browser."); return; }
      restoreJson(saved); setStatus("Loaded the scenario saved in this browser.");
    } catch { setStatus("The saved scenario could not be loaded. Exported files can be imported separately."); }
  };
  const clearSaved = () => {
    try { window.localStorage.removeItem(STORAGE_KEY); setHasSaved(false); setStatus("Saved scenario removed from this browser. Current inputs remain on screen."); }
    catch { setStatus("The saved scenario could not be removed. Check browser storage settings."); }
  };
  const reset = () => {
    applyInput({ ...DEFAULT_INPUTS }, true); setContext(DEFAULT_CONTEXT); setShowPurchase(true); setStep(0);
    setStatus("Illustrative example restored. A previously saved scenario has not been changed.");
  };
  const options = result ? [result.options.manual, ...(showPurchase ? [result.options.purchase] : []), result.options.raas] : [];
  const raas = result?.options.raas;
  const resultMessage = raas && input ? Math.abs(raas.npv) < .005
    ? `The modeled RaaS cash benefits and costs balance at your ${input.annualDiscountPercent}% discount rate over ${input.horizonMonths} months.`
    : raas.npv < 0
      ? `The modeled cash benefits do not cover the RaaS costs at your ${input.annualDiscountPercent}% discount rate over ${input.horizonMonths} months.`
      : `The modeled RaaS cash benefits exceed the costs at your ${input.annualDiscountPercent}% discount rate over ${input.horizonMonths} months. Validate the workload and staffing plan before committing.` : "";

  const baselineHours = numeric("baselineTaskHours"), robotHours = numeric("automatedTaskHours"), supportHours = numeric("retainedSupportHours"), hourlyCost = numeric("hourlyCashCost"), cashShare = numeric("cashRealisationPercent");
  const hoursValid = baselineHours !== null && robotHours !== null && supportHours !== null && cashShare !== null && baselineHours >= 0 && robotHours >= 0 && robotHours <= baselineHours && supportHours >= 0 && cashShare >= 0 && cashShare <= 100;
  const freedHours = hoursValid ? Math.max(0, robotHours - supportHours) : 0;
  const avoidedHours = hoursValid ? freedHours * cashShare / 100 : 0;
  const extraSupport = hoursValid ? Math.max(0, supportHours - robotHours) : 0;
  const horizon = numeric("horizonMonths"), contract = numeric("raasContractMonths"), billingStart = numeric("raasBillingStartMonth");
  const contractEnd = contract !== null && billingStart !== null && Number.isInteger(contract) && Number.isInteger(billingStart) && contract >= 1 && contract <= 120 && billingStart >= 1 && billingStart <= 120 ? billingStart + contract - 1 : null;
  const needsRenewal = horizon !== null && contractEnd !== null && horizon > contractEnd;
  const delay = numeric("deploymentDelayMonths"), ramp = numeric("rampMonths"), firstRamp = numeric("firstRampPercent");
  const fullMonth = delay !== null && ramp !== null && firstRamp !== null ? delay + (ramp === 1 || firstRamp === 100 ? 1 : ramp) : null;
  const periodChoice = !customPeriod && horizon !== null && [12, 36, 60].includes(horizon) ? horizon : "custom";
  const rampChoice = customRamp ? "custom" : ramp === 1 ? "immediate" : ramp === 3 && firstRamp === 50 ? "gradual" : "custom";
  const choosePeriod = (months: number | "custom") => {
    setCustomPeriod(months === "custom");
    if (months !== "custom") set("horizonMonths", fmt(months));
  };
  const chooseRamp = (choice: "immediate" | "gradual" | "custom") => {
    setCustomRamp(choice === "custom");
    if (choice === "immediate") set("rampMonths", "1");
    if (choice === "gradual") setRaw((prev) => ({ ...prev, rampMonths: "3", firstRampPercent: "50" }));
  };
  const periodPresets = <div className="roi-segments" role="group" aria-label="Comparison period">
    {([12, 36, 60] as const).map((months) => <button key={months} type="button" aria-pressed={periodChoice === months} onClick={() => choosePeriod(months)}>{months / 12} {months === 12 ? "year" : "years"}<small>{months} months</small></button>)}
    <button type="button" aria-pressed={periodChoice === "custom"} onClick={() => choosePeriod("custom")}>Custom<small>1–120 months</small></button>
  </div>;

  return <div className="roi-tool roi-guided">
    <PageMeta path="/raas-calculator" />
    <PageHero eyebrow="Decision tool / Robotics economics" title="Robotics cost & ROI calculator."
      lead="Could a robot make this task worth automating? Start with the work, see what changes for your team, then compare buying with a monthly subscription."
      breadcrumb={{ to: "/resources", label: "All resources" }}>
      <div className="roi-topline">
        <span className="roi-badge">{context.evidence}</span>
        <span>Four steps. Start with what you know.</span>
        <button type="button" className="roi-inline-link" onClick={showComparison}>View the comparison</button>
      </div>
      <p className="roi-term-tip">Terms such as <Term term="roi">ROI</Term> have a dashed underline. Hover, focus or tap for a plain-language explanation.</p>
    </PageHero>
    <section className="site-wrap roi-workspace" aria-label="Robotics cost comparison">
      <nav className="roi-step-nav" aria-label="Calculator steps"><ol>{STEPS.map((name, index) => <li key={name}><button type="button" aria-current={step === index ? "step" : undefined} onClick={() => goStep(index)}><span className="roi-step-number" aria-hidden="true">{index + 1}</span><span>{name}</span></button></li>)}</ol></nav>
      {errorEntries.length > 0 && <div className="roi-error-box" role="alert"><h3>Check {errorEntries.length === 1 ? "this input" : "these inputs"} to calculate</h3><ul>{errorEntries.map(([key, message]) => <li key={key}><button type="button" className="roi-inline-link" onClick={() => focusField(key)}>{labelFor(key)}: {message}</button></li>)}</ul></div>}
      <div className="roi-layout">
        <div className="roi-inputs">
          <section className="roi-step-panel" hidden={step !== 0} aria-labelledby={`${id}-step-0`}>
            <div className="roi-step-heading"><span className="roi-step-kicker">Step 1 of 4</span><h2 id={`${id}-step-0`} tabIndex={-1}>Describe the work today.</h2><p>Choose one task. Count the staff time and costs used to do it now.</p></div>
            <div className="roi-setup-grid">
              <div className="roi-field"><label htmlFor={`${id}-application`}>What task are you considering?</label><select id={`${id}-application`} className="roi-select" value={context.application} onChange={(event) => setContext((prev) => ({ ...prev, application: event.target.value }))}>{APPLICATIONS.map((application) => <option key={application}>{application}</option>)}</select><p className="roi-field-note">A description, not a set of industry averages.</p></div>
              <div className="roi-field"><label htmlFor={`${id}-currency`}>Currency</label><select id={`${id}-currency`} className="roi-select" value={currency} onChange={(event) => setCurrency(event.target.value as RoiInputs["currency"])}>{["USD", "CHF", "EUR"].map((item) => <option key={item}>{item}</option>)}</select><p className="roi-field-note">Changes labels, not exchange rates.</p></div>
              <div className="roi-field"><label htmlFor={`${id}-number-format`}>Number format</label><select id={`${id}-number-format`} className="roi-select" value={locale} onChange={(event) => changeLocale(event.target.value as NumberLocale)}><option value="en-US">English · 20,000.50</option><option value="de-CH">Swiss · 20’000.50</option><option value="de-DE">Decimal comma · 20.000,50</option></select></div>
            </div>
            <div className="roi-question roi-question-choice"><div className="roi-question-copy"><h3>How would you like to enter the staff time?</h3><p>Use a monthly total, or let the calculator convert a typical working day.</p></div><div className="roi-answer"><div className="roi-segments" role="group" aria-label="Staff time entry method"><button type="button" aria-pressed={timeBasis === "monthly"} onClick={() => changeTimeBasis("monthly")}>Monthly total</button><button type="button" aria-pressed={timeBasis === "daily"} onClick={() => changeTimeBasis("daily")}>Daily schedule</button></div></div></div>
            <div hidden={timeBasis !== "monthly"}>{field("baselineTaskHours")}</div>
            <div hidden={timeBasis !== "daily"}>
              {helperField("dailyHours", dailyHours, setDailyHours, <>Add everyone’s time on this task. Two people spending 8 hours each = 16 staff hours. A team total can exceed 24 hours.</>, "h / day", { min: 0, max: 1_000_000_000 })}
              {helperField("workingDays", workingDays, setWorkingDays, "Days this task runs in a typical month. Use 1–31; decimal averages are allowed.", "days", { min: 1, max: 31 })}
              {baselineHours !== null && !errors.dailyHours && !errors.workingDays && <p className="roi-conversion"><span aria-hidden="true">↳</span> {dailyHours} staff hours/day × {workingDays} days = <strong>{number.format(baselineHours)} staff hours/month</strong>. Converted automatically.</p>}
            </div>
            {field("hourlyCashCost")}
            <details className="roi-more"><summary>Add other current costs <span>Optional</span></summary>{field("baselineOtherMonthlyCost")}</details>
            {baselineHours !== null && hourlyCost !== null && baselineHours >= 0 && hourlyCost >= 0 && <div className="roi-story"><span className="roi-story-label">Your starting point</span><p>This task uses <strong>{number.format(baselineHours)} staff hours a month</strong>, costing <strong>{money(baselineHours * hourlyCost)}</strong> in staff time at today’s rate.</p><p className="roi-story-small">Next, estimate how much of that work the robot can take over.</p></div>}
          </section>

          <section className="roi-step-panel" hidden={step !== 1} aria-labelledby={`${id}-step-1`}>
            <div className="roi-step-heading"><span className="roi-step-kicker">Step 2 of 4</span><h2 id={`${id}-step-1`} tabIndex={-1}>What will the robot change?</h2><p>First the work it takes over. Then the staff help it still needs. Finally, what happens to the time you free up.</p></div>
            <div className="roi-question roi-question-choice"><div className="roi-question-copy"><h3>How much of the task can it handle?</h3><p>Use the complete system’s capacity after downtime and practical limits, for the same workload as step 1.</p></div><div className="roi-answer"><div className="roi-segments" role="group" aria-label="Robot coverage entry method"><button type="button" aria-pressed={automationBasis === "share"} onClick={() => changeAutomationBasis("share")}>Share of the task</button><button type="button" aria-pressed={automationBasis === "hours"} onClick={() => changeAutomationBasis("hours")}>Exact hours</button></div></div></div>
            <div hidden={automationBasis !== "share"}>{helperField("automationShare", automationShare, setAutomationShare, <>0–100% of the staff time entered in step 1. Changing that task time keeps your selected percentage.{baselineHours === 0 && " Enter staff time in step 1 to use a percentage."}</>, "%", { slider: true, min: 0, max: 100, disabled: baselineHours === 0 })}</div>
            <div hidden={automationBasis !== "hours"}>{field("automatedTaskHours")}</div>
            {baselineHours !== null && robotHours !== null && robotHours >= 0 && !errors.automationShare && <p className="roi-conversion"><span aria-hidden="true">↳</span> The robot takes over <strong>{number.format(robotHours)} of {number.format(baselineHours)} staff hours/month</strong>.</p>}
            {field("retainedSupportHours")}
            <fieldset className="roi-staffing"><legend>What happens to the time you free up?</legend><p>Freed time saves money only when a paid expense falls or a funded cost is avoided.</p><div className="roi-choice-cards">
              {([
                ["none", "Keep paid hours", "People use the freed time for other work. No automatic payroll saving."],
                ["some", "Reduce some paid hours", "For example, less overtime or fewer agency shifts. Choose the share below."],
                ["all", "Reduce all freed paid hours", "Every freed hour removes or avoids a paid cost, supported by your staffing plan."],
              ] as const).map(([choice, title, description]) => <label key={choice} className={`roi-choice-card${staffingChoice === choice ? " is-selected" : ""}`}><input type="radio" name={`${id}-staffing`} value={choice} checked={staffingChoice === choice} onChange={() => chooseStaffing(choice)} /><span><strong>{title}</strong><span>{description}</span></span></label>)}
            </div></fieldset>
            <div hidden={staffingChoice !== "some"}>{field("cashRealisationPercent", { slider: true })}</div>
            {hoursValid && <div className={`roi-story${extraSupport > 0 ? " roi-story-caution" : ""}`}><span className="roi-story-label">What that means for your team</span>{extraSupport > 0 ? <><p>The support estimate <strong>adds {number.format(extraSupport)} staff hours a month</strong> instead of freeing time.</p><p className="roi-story-small">Extra paid work remains a cost. If already-paid idle capacity can cover it, enter that below.</p></> : <><p>The robot frees <strong>{number.format(freedHours)} hours a month</strong>. Your plan avoids paying for <strong>{number.format(avoidedHours)} hours</strong> and leaves <strong>{number.format(freedHours - avoidedHours)} hours</strong> for other work.</p>{hourlyCost !== null && <p className="roi-story-small">At full operation, that is {money(avoidedHours * hourlyCost)}/month in staff-cost savings, before robot costs. Deployment and staffing dates are applied later.</p>}</>}</div>}
            <details className="roi-more"><summary>Account for existing idle staff time <span>Optional</span></summary>{field("confirmedIdleHours")}</details>
          </section>

          <section className="roi-step-panel" hidden={step !== 2} aria-labelledby={`${id}-step-2`}>
            <div className="roi-step-heading"><span className="roi-step-kicker">Step 3 of 4</span><h2 id={`${id}-step-2`} tabIndex={-1}>Enter the supplier offers.</h2><p>Use prices for the same workload and performance. The example amounts are placeholders, not market prices.</p></div>
            <div className="roi-offer-heading"><h3>Monthly subscription <Term term="raas">RaaS</Term></h3><p>Access to the complete system through recurring payments.</p></div>
            {field("raasMonthlyFee")}{field("raasSetup")}{field("raasMonthlyOperatingCost")}
            <div className="roi-purchase-toggle"><label className="roi-check"><input type="checkbox" checked={showPurchase} onChange={(event) => setShowPurchase(event.target.checked)} /><span>Also compare buying the system</span></label><p className="roi-field-note">You can hide this option without deleting its numbers.</p></div>
            <div hidden={!showPurchase}>
              <div className="roi-offer-heading"><h3>Buy the system</h3><p>Same operating performance, different upfront and running costs.</p></div>
              {field("purchasePrice")}{field("purchaseSetup")}{field("purchaseMonthlyOperatingCost")}
              <details className="roi-more"><summary>Resale and end-of-period costs <span>Optional</span></summary>{field("purchaseResidualValue")}{field("purchaseExitCost")}</details>
            </div>
            <details className="roi-more"><summary>RaaS end-of-period payment <span>Optional</span></summary>{field("raasExitCost")}</details>
            <div className="roi-story"><span className="roi-story-label">Keep the comparison fair</span><p>Staff help is already counted in step 2. Enter only the other costs outside each quote. Next, choose when payments and benefits start.</p></div>
          </section>

          <section className="roi-step-panel" hidden={step !== 3} aria-labelledby={`${id}-step-3`}>
            <div className="roi-step-heading"><span className="roi-step-kicker">Step 4 of 4</span><h2 id={`${id}-step-3`} tabIndex={-1}>Choose the timing.</h2><p>Give installation time to happen. Then choose how far ahead to compare the cash flows.</p></div>
            <div className="roi-question"><div className="roi-question-copy"><h3>How long do you want to compare?</h3><p>A longer comparison includes more monthly payments and benefits. It does not change your quoted contract.</p></div><div className="roi-answer">{periodPresets}</div></div>
            <div hidden={periodChoice !== "custom"}>{field("horizonMonths")}</div>
            {field("raasContractMonths")}
            {(needsRenewal || renew || errors.raasRenewalMonthlyFee) && <div className="roi-renewal">
              <h3>What happens after the initial contract?</h3><p>Your initial contract ends in month {contractEnd ?? "—"}. This comparison runs for {horizon ?? "—"} months.</p>
              <label className="roi-check" htmlFor={fieldId("renewRaasAfterContract")}><input id={fieldId("renewRaasAfterContract")} type="checkbox" checked={renew} onChange={(event) => setRenew(event.target.checked)} aria-invalid={Boolean(errors.renewRaasAfterContract)} aria-describedby={`${id}-renewal-note`} /><span>Assume service continues after the initial contract</span></label>
              <p id={`${id}-renewal-note`} className="roi-field-note">This is your assumption, not a confirmed renewal offer.</p>
              {(renew || errors.raasRenewalMonthlyFee) && <>{!renew && <p className="roi-field-note">Correct the saved renewal fee below. It will only be used if you select continued service.</p>}{field("raasRenewalMonthlyFee")}</>}
              {!renew && needsRenewal && contractEnd !== null && contractEnd <= 120 && <button type="button" className="roi-button" onClick={() => { set("horizonMonths", fmt(contractEnd)); setCustomPeriod(![12, 36, 60].includes(contractEnd)); }}>Compare only the first {contractEnd} months</button>}
            </div>}
            {field("deploymentDelayMonths")}
            <div className="roi-question"><div className="roi-question-copy"><h3>How quickly does it reach full performance?</h3><p>Choose a rollout, or enter your own <Term term="ramp">ramp-up</Term>. These choices do not move the billing dates.</p></div><div className="roi-answer"><div className="roi-segments roi-ramp-options" role="group" aria-label="Performance ramp"><button type="button" aria-pressed={rampChoice === "immediate"} onClick={() => chooseRamp("immediate")}>Immediately<small>After installation</small></button><button type="button" aria-pressed={rampChoice === "gradual"} onClick={() => chooseRamp("gradual")}>Over 3 months<small>50% → 75% → 100%</small></button><button type="button" aria-pressed={rampChoice === "custom"} onClick={() => chooseRamp("custom")}>Custom<small>Set your own ramp</small></button></div></div></div>
            <div hidden={rampChoice !== "custom"}>{field("rampMonths")}{field("firstRampPercent", { slider: true })}</div>
            {delay !== null && fullMonth !== null && !errors.deploymentDelayMonths && !errors.rampMonths && !errors.firstRampPercent && <div className="roi-story"><span className="roi-story-label">Your rollout</span><p>Benefits start in <strong>month {delay + 1}</strong>{fullMonth > delay + 1 ? <> at <strong>{firstRamp}%</strong>, reaching full performance in <strong>month {fullMonth}</strong></> : <> at <strong>full performance</strong></>}.</p><p className="roi-story-small">Subscription billing starts in month {billingStart}; running costs start in month {numeric("operatingCostsStartMonth")}. Paid-cost reductions are allowed from month {numeric("labourSavingsStartMonth")}, once the robot releases time.</p></div>}
            <details className="roi-more"><summary>Adjust payment and staffing dates <span>Advanced</span></summary>{field("raasBillingStartMonth")}{field("operatingCostsStartMonth")}{field("labourSavingsStartMonth")}</details>
            <details className="roi-more"><summary>Financial assumptions and extra benefits <span>Advanced</span></summary>
              <p className="roi-more-intro">These assumptions stay in the calculation when this section is closed. Optional benefits begin at zero.</p>
              {field("annualDiscountPercent")}{field("labourEscalationPercent")}{field("feeEscalationPercent")}{field("operatingEscalationPercent")}{field("otherCashSavingsMonthly")}{field("additionalContributionMonthly")}
            </details>
            <p className="roi-assumption-line">Using {numeric("annualDiscountPercent") ?? "—"}% <Term term="discountRate">discount rate</Term>; annual increases: staff {numeric("labourEscalationPercent") ?? "—"}%, subscription {numeric("feeEscalationPercent") ?? "—"}%, running costs {numeric("operatingEscalationPercent") ?? "—"}%. Extra benefits: {money((numeric("otherCashSavingsMonthly") ?? 0) + (numeric("additionalContributionMonthly") ?? 0))}/month before ramp-up.</p>
            <details className="roi-more"><summary>Add a quote or evidence note <span>Optional</span></summary><div className="roi-evidence-grid"><div className="roi-field"><label htmlFor={`${id}-evidence`}>Basis of this scenario</label><select id={`${id}-evidence`} className="roi-select" value={context.evidence} onChange={(event) => setContext((prev) => ({ ...prev, evidence: event.target.value as Evidence }))}>{EVIDENCE.map((item) => <option key={item}>{item}</option>)}</select><p className="roi-field-note">Your label, not independent verification.</p></div><div className="roi-field"><label htmlFor={`${id}-evidence-note`}>Quote, pilot or staffing-plan reference</label><textarea id={`${id}-evidence-note`} className="roi-text" rows={3} maxLength={500} value={context.note} onChange={(event) => setContext((prev) => ({ ...prev, note: event.target.value }))} /><p className="roi-field-note">Optional. Keep confidential details out of shared exports.</p></div></div></details>
          </section>
          <div className="roi-step-actions"><div><button type="button" className="roi-button roi-button-quiet" onClick={() => step > 0 ? goStep(step - 1) : reset()}>{step > 0 ? "← Back" : "Reset example"}</button><button type="button" className="roi-inline-link" onClick={() => importRef.current?.click()}>Import a scenario</button></div><button type="button" className="roi-button roi-button-primary" onClick={nextStep}>{step === 3 ? "View comparison ↓" : `Continue: ${STEPS[step + 1]} →`}</button></div>
          <p className="roi-status" role="status" aria-live="polite">{status}</p>
          <input ref={importRef} type="file" accept=".json,application/json" onChange={importJson} className="sr-only" tabIndex={-1} aria-label="Import a scenario JSON file" />
        </div>
        <div className="roi-results" id="calculator-results" tabIndex={-1} hidden={step !== 3}>
          <div className="roi-results-top"><div><h2>Your comparison</h2><p>{input ? `${input.horizonMonths} months · ${currency} · before tax and financing` : "Results pause until the inputs are valid"}</p></div><span className="roi-badge">Model {MODEL_VERSION}</span></div>
          {!result || !input || !raas ? <div className="roi-blank"><Eyebrow>Inputs need attention</Eyebrow><h3>Results are paused.</h3><p>Correct the highlighted fields to see a new comparison. Previously calculated results are hidden so they cannot be mistaken for the current scenario.</p></div> : <>
            <div className="roi-headline"><p className="roi-headline-label">Value of RaaS in today’s money · <Term term="npv">NPV</Term></p><p className="roi-headline-value">{money(raas.npv)}</p><p className="roi-headline-message">{resultMessage}</p></div>
            <dl className="roi-stat-grid"><div className="roi-stat"><dt>RaaS <Term term="netCash">net cash</Term> over {input.horizonMonths} months</dt><dd>{money(raas.netCashBenefit)}</dd><small>Includes upfront, rollout and end-of-study cash flows.</small></div><div className="roi-stat"><dt>RaaS <Term term="payback">cash payback</Term></dt><dd>{paybackLabel(raas, input.horizonMonths)}</dd><small>First recovery of a cumulative cash deficit.</small></div></dl>
            <section className="roi-section" aria-labelledby={`${id}-hours-title`}><h3 id={`${id}-hours-title`}>Hours released ≠ payroll removed</h3><div className="roi-hours"><div><strong>{number.format(result.netTaskHoursReleased)} h</strong><span>Net task hours released each month</span></div><div><strong>{number.format(result.paidHoursAvoided)} h</strong><span>Paid hours actually avoided each month</span></div></div><div className="roi-hours-bar" aria-hidden="true"><span className="roi-hours-cash" style={{ width: `${result.netTaskHoursReleased ? input.cashRealisationPercent : 0}%` }} /><span className="roi-hours-capacity" style={{ width: `${result.netTaskHoursReleased ? 100 - input.cashRealisationPercent : 0}%` }} /></div><div className="roi-key"><span><i className="roi-dot roi-hours-cash" aria-hidden="true" />Cash saving</span><span><i className="roi-dot roi-hours-capacity" aria-hidden="true" />{number.format(result.redeployedHours)} h available for other work</span></div><p className="roi-section-intro">Full-deployment hours. The cash projection also applies the rollout and staffing-change dates.{result.additionalPaidHours > 0 ? ` Additional paid support required: ${number.format(result.additionalPaidHours)} hours/month.` : ""}</p></section>
            <section className="roi-section" aria-labelledby={`${id}-options-title`}><h3 id={`${id}-options-title`}>Same workload. Different cash commitments.</h3><div className="roi-scroll" tabIndex={0} role="region" aria-label="Option comparison, scroll horizontally if needed"><table className="roi-table"><caption>Costs and benefits for {context.application.toLowerCase()}, in {currency}.</caption><thead><tr><th scope="col">Measure</th>{options.map((option) => <th key={option.id} scope="col" className={option.id === "raas" ? "roi-featured" : undefined}>{option.label}</th>)}</tr></thead><tbody>
              <tr><th scope="row">Upfront cash</th>{options.map((option) => <td key={option.id}>{money(option.upfrontCash)}</td>)}</tr>
              <tr><th scope="row">Monthly cash cost at full operation</th>{options.map((option) => <td key={option.id}>{money(option.steadyMonthlyCost)}</td>)}</tr>
              <tr><th scope="row">Monthly benefit at full operation</th>{options.map((option) => <td key={option.id}>{option.id === "manual" ? <Term term="baseline">Baseline</Term> : money(option.steadyMonthlyBenefit)}</td>)}</tr>
              <tr><th scope="row">Total cash cost over study</th>{options.map((option) => <td key={option.id}>{money(option.horizonCashCost)}</td>)}</tr>
              <tr><th scope="row"><Term term="netCash">Net cash benefit</Term> over study</th>{options.map((option) => <td key={option.id}>{option.id === "manual" ? "Baseline" : money(option.netCashBenefit)}</td>)}</tr>
              <tr><th scope="row"><Term term="payback">Cash payback</Term></th>{options.map((option) => <td key={option.id}>{paybackLabel(option, input.horizonMonths)}</td>)}</tr>
              {raas.committedFeesBeyondHorizon > 0 && <tr><th scope="row">Contract fees after study</th>{options.map((option) => <td key={option.id}>{money(option.committedFeesBeyondHorizon)}</td>)}</tr>}
            </tbody><tfoot><tr><th scope="row"><Term term="npv">NPV</Term> at {number.format(input.annualDiscountPercent)}%</th>{options.map((option) => <td key={option.id} className={option.id === "raas" ? "roi-featured" : undefined}>{option.id === "manual" ? "Baseline" : money(option.npv)}</td>)}</tr></tfoot></table></div><p className="roi-field-note">Steady figures use full deployment at starting prices. Cash cost excludes additional sales contribution; net benefit includes it. Total and NPV use actual monthly timing.</p></section>
            <section className="roi-section" aria-labelledby={`${id}-cash-title`}><h3 id={`${id}-cash-title`}>Follow the cash through deployment</h3><p className="roi-section-intro">Above zero means a positive cumulative cash benefit versus manual operation. Setup is charged once, at month zero.</p><CashFlowChart currency={currency} money={money} showPurchase={showPurchase} points={raas.series.map((row, index) => ({ month: row.month, raas: row.cumulativeCashFlow, purchase: result.options.purchase.series[index].cumulativeCashFlow }))} />
              <details className="roi-disclosure"><summary>View the monthly cash-flow table</summary><div className="roi-scroll" tabIndex={0} role="region" aria-label="Monthly cash-flow table, scroll horizontally if needed"><table className="roi-table roi-table-months"><caption>All amounts in {currency}; rounded for display. CSV retains cents.</caption><thead><tr><th scope="col">Month</th><th scope="col">Manual cost</th><th scope="col">RaaS cost</th><th scope="col">RaaS net</th><th scope="col">RaaS cumulative</th>{showPurchase && <><th scope="col">Buy cost</th><th scope="col">Buy net</th><th scope="col">Buy cumulative</th></>}</tr></thead><tbody>{raas.series.map((row, index) => <tr key={row.month}><th scope="row">{row.month}</th><td>{money(row.manualCashCost)}</td><td>{money(row.optionCashCost)}</td><td>{money(row.incrementalCashFlow)}</td><td>{money(row.cumulativeCashFlow)}</td>{showPurchase && <><td>{money(result.options.purchase.series[index].optionCashCost)}</td><td>{money(result.options.purchase.series[index].incrementalCashFlow)}</td><td>{money(result.options.purchase.series[index].cumulativeCashFlow)}</td></>}</tr>)}</tbody></table></div></details>
            </section>
            <section className="roi-section" aria-labelledby={`${id}-sensitivity-title`}><h3 id={`${id}-sensitivity-title`}>What if paid costs do not fall as planned?</h3><p className="roi-section-intro">RaaS net cash over {input.horizonMonths} months. Same equipment and released hours; only the share that reduces payroll changes. These are scenarios, not probabilities.</p><div className="roi-scenarios">{sensitivity.map((scenario, index) => <article key={index} className={`roi-scenario${index === 1 ? " is-current" : ""}`}><h4>{index === 0 ? "No payroll reduction" : index === 1 ? "Your staffing plan" : "All released hours avoided"}</h4><strong>{money(scenario.options.raas.netCashBenefit)}</strong><p>{index === 0 ? "0" : index === 1 ? number.format(input.cashRealisationPercent) : "100"}% of released hours become paid hours avoided.</p></article>)}</div></section>
            {result.warnings.length > 0 && <aside className="roi-section" aria-labelledby={`${id}-checks-title`}><h3 id={`${id}-checks-title`}>Check these assumptions</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></aside>}
            <p className="roi-print-only">Evidence: {context.evidence}. {context.note}</p>
          </>}
          <section className="roi-section roi-no-print" aria-labelledby={`${id}-save-title`}><h3 id={`${id}-save-title`}>Keep or share your scenario</h3><p className="roi-section-intro">Calculations stay in this page. Saving is optional and uses this browser only. Exported files include your entered assumptions.</p><div className="roi-toolbar"><button type="button" className="roi-button roi-button-primary" disabled={!input} onClick={exportJson}>Export scenario · JSON</button><button type="button" className="roi-button" disabled={!result} onClick={exportCsv}>Cash-flow CSV</button><button type="button" className="roi-button roi-button-quiet" onClick={() => importRef.current?.click()}>Import scenario</button><button type="button" className="roi-button roi-button-quiet" disabled={!input} onClick={save}>Save in this browser</button>{hasSaved && <><button type="button" className="roi-button roi-button-quiet" onClick={load}>Load saved</button><button type="button" className="roi-button roi-button-quiet" onClick={clearSaved}>Delete saved</button></>}</div></section>
        </div>
      </div>
    </section>
    <section className="section-y border-t border-border bg-muted" id="methodology" aria-labelledby={`${id}-method-title`}><div className="site-wrap roi-method"><div><Eyebrow>How this works</Eyebrow><h2 id={`${id}-method-title`}>A business case you can inspect.</h2><p className="mt-5">This is a quote-based planning model. It makes the workload, staffing changes, timing and commercial assumptions visible.</p><p>Prepared by Justinas Mišeikis. Model {MODEL_VERSION}. The starting scenario is illustrative and has not been validated for an installation.</p><div className="roi-source-links"><TextLink href="/about">About Justinas</TextLink><TextLink href="/due-diligence">Technical diligence</TextLink></div></div><div>
      <article className="roi-method-item"><h3>1. Connect work to cash</h3><p>Subtract retained human support from the manual-equivalent work automated. Only the entered share of released hours counts as avoided paid work. Additional human work remains a cost unless evidenced paid idle capacity can cover it.</p><p className="roi-formula">Net released hours = work automated − retained human support<br />Payroll saving = paid hours avoided × avoidable hourly cost</p></article>
      <article className="roi-method-item"><h3>2. Keep rollout and payments separate</h3><p>The deployment delay and ramp affect benefits. Billing and operating costs follow their own start dates. Upfront payments occur at month zero; <Term term="residualValue">resale proceeds</Term> and exit costs occur at the end of the study. There is no second amortised setup charge.</p></article>
      <article className="roi-method-item"><h3>3. Compare the same monthly cash flows</h3><p>Net cash is the undiscounted sum of incremental cash flows versus manual operation. <Term term="npv">NPV</Term> discounts each monthly amount at the entered annual rate. <Term term="payback">Payback</Term> is the first recovery after an actual cumulative deficit; a later reversal is flagged.</p><p className="roi-formula">Monthly benefit = manual cost − option cost + additional contribution<br />NPV = sum of monthly benefit ÷ (1 + annual rate)<sup>month / 12</sup></p></article>
      <article className="roi-method-item"><h3>What this version assumes</h3><p>Constant workload, equivalent system performance for purchase and RaaS, a fixed whole-system subscription, pre-tax cash flows and no financing. Prices share one currency. Use a supplier quote to include reliability, capacity, maintenance scope and service exclusions in the inputs.</p><p>Metered tariffs, seasonal workloads, changing staffing schedules, taxes, loans and complex replacement schedules need a more detailed project model. A favourable result does not establish that the system can safely or reliably perform the task.</p></article>
      <article className="roi-method-item"><h3>Method reference</h3><p>For capital-investment analysis methods, including net present value, payback and sensitivity analysis:</p><div className="roi-source-links"><TextLink href="https://www.nist.gov/el/applied-economics-office/manufacturing/capital-investment-analysis">NIST capital investment analysis</TextLink></div></article>
    </div></div></section>
    <section className="site-wrap section-y" aria-labelledby={`${id}-faq-title`}><Eyebrow>Common questions</Eyebrow><h2 className="h2" id={`${id}-faq-title`}>Read the result in context.</h2><details className="roi-disclosure"><summary>Does a robot freeing an employee create a cash saving?</summary><p>It creates released capacity. A cash saving occurs when paid expenditure falls or a funded cost is avoided, such as overtime, an agency shift or a planned hire. If the person is reassigned, show the released hours and separately substantiate any extra contribution.</p></details><details className="roi-disclosure"><summary>Why can monthly savings be positive but the business case still be negative?</summary><p>Small steady savings may not recover upfront payments and rollout losses within the study period. <Term term="npv">NPV</Term> also reflects when the cash arrives. Compare the full monthly projection rather than one steady-state figure.</p></details><details className="roi-disclosure"><summary>Is a faster payback always the better option?</summary><p>No. A smaller upfront payment can produce earlier <Term term="payback">payback</Term> while recurring fees reduce total value. Compare affordability, cash-flow timing, NPV, contractual flexibility and the risks actually transferred by the service agreement.</p></details><details className="roi-disclosure"><summary>Are these robot prices or performance figures market averages?</summary><p>No. The starting values form a worked example. Selecting an application or currency does not insert local prices or convert currencies. Replace the inputs with your own task measurements, staffing plan and supplier proposal.</p></details><details className="roi-disclosure"><summary>Are my scenario inputs sent anywhere?</summary><p>The calculator runs locally in the page and does not submit its financial inputs. Save in this browser writes only to browser storage when you click it. JSON and CSV exports are downloaded to your device; they contain your scenario data.</p></details></section>
    <ContactCta eyebrow="From scenario to evidence" title="Need to challenge a robotics business case?" lead="Bring the workload, supplier proposal and staffing assumptions. A focused technical review can identify the evidence needed before an investment decision." intent="diligence" label="Discuss the business case" />
  </div>;
};

export default RaasCalculator;
