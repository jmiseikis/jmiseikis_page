/**
 * Robotics cost comparison, model 2.0.0.
 * Quote-based, pre-tax, unfinanced monthly cash flows in one chosen currency.
 * Every metric is derived from the same ledger. These defaults are an example,
 * not a supplier quote, a benchmark, or a recommended staffing plan.
 */
export const MODEL_VERSION = "2.0.0";
export type Currency = "USD" | "CHF" | "EUR";
export type NumberLocale = "en-US" | "de-CH" | "de-DE";
export type OptionId = "manual" | "purchase" | "raas";

export interface RoiInputs {
  currency: Currency;
  numberLocale: NumberLocale;
  horizonMonths: number;
  annualDiscountPercent: number;
  baselineTaskHours: number;
  /** Avoidable cash cost per paid hour, not an allocation of fixed overhead. */
  hourlyCashCost: number;
  baselineOtherMonthlyCost: number;
  /** Manual-equivalent work handled by the quoted complete system at full deployment. */
  automatedTaskHours: number;
  retainedSupportHours: number;
  /** Released hours actually removed from the counterfactual paid staffing plan. */
  cashRealisationPercent: number;
  /** Existing paid idle time available to cover net additional work, if evidenced. */
  confirmedIdleHours: number;
  /** Extra sales contribution after all additional costs; requires demand evidence. */
  additionalContributionMonthly: number;
  /** Avoided cost contained in baselineOtherMonthlyCost, excluding labour. */
  otherCashSavingsMonthly: number;
  deploymentDelayMonths: number;
  /** First production month through full performance; 1 means immediate full performance. */
  rampMonths: number;
  firstRampPercent: number;
  labourSavingsStartMonth: number;
  operatingCostsStartMonth: number;
  raasBillingStartMonth: number;
  raasSetup: number;
  /** Fixed whole-system fee, not a robot count multiplier. */
  raasMonthlyFee: number;
  raasMonthlyOperatingCost: number;
  raasContractMonths: number;
  renewRaasAfterContract: boolean;
  /** Fee in the first renewal month; used only with explicit renewal enabled. */
  raasRenewalMonthlyFee: number;
  raasExitCost: number;
  purchasePrice: number;
  purchaseSetup: number;
  purchaseMonthlyOperatingCost: number;
  purchaseResidualValue: number;
  purchaseExitCost: number;
  labourEscalationPercent: number;
  feeEscalationPercent: number;
  operatingEscalationPercent: number;
}

export const DEFAULT_INPUTS: Readonly<RoiInputs> = Object.freeze({
  currency: "USD", numberLocale: "en-US", horizonMonths: 36, annualDiscountPercent: 8,
  baselineTaskHours: 1039.2, hourlyCashCost: 32.5, baselineOtherMonthlyCost: 0,
  automatedTaskHours: 519.6, retainedSupportHours: 103.92, cashRealisationPercent: 50,
  confirmedIdleHours: 0, additionalContributionMonthly: 0, otherCashSavingsMonthly: 0,
  deploymentDelayMonths: 1, rampMonths: 3, firstRampPercent: 50,
  labourSavingsStartMonth: 1, operatingCostsStartMonth: 1, raasBillingStartMonth: 1,
  raasSetup: 20000, raasMonthlyFee: 6000, raasMonthlyOperatingCost: 500,
  raasContractMonths: 36, renewRaasAfterContract: false, raasRenewalMonthlyFee: 6000,
  raasExitCost: 0, purchasePrice: 150000, purchaseSetup: 0,
  purchaseMonthlyOperatingCost: 1000, purchaseResidualValue: 0, purchaseExitCost: 0,
  labourEscalationPercent: 0, feeEscalationPercent: 0, operatingEscalationPercent: 0,
});

export interface ValidationIssue { field: keyof RoiInputs | "global"; message: string }
export type PaybackStatus = "recovered" | "not-recovered" | "cash-positive-from-start" | "no-upfront-ongoing-loss" | "no-change";
export interface MonthlyCashFlow {
  month: number;
  ramp: number;
  manualCashCost: number;
  optionCashCost: number;
  remainingLabourCost: number;
  otherOperatingCost: number;
  systemCashCost: number;
  labourCashSaving: number;
  otherCashSaving: number;
  additionalContribution: number;
  taskHoursReleased: number;
  paidHoursAvoided: number;
  additionalPaidHours: number;
  incrementalCashFlow: number;
  cumulativeCashFlow: number;
  discountedCashFlow: number;
}
export interface OptionResult {
  id: OptionId;
  label: string;
  upfrontCash: number;
  /** Full deployment at month-one prices, without terminal cash flows. */
  steadyMonthlyCost: number;
  steadyMonthlyBenefit: number;
  horizonCashCost: number;
  netCashBenefit: number;
  npv: number;
  /** First recovery AFTER an actual negative cumulative balance; null if not recovered. */
  paybackMonth: number | null;
  paybackStatus: PaybackStatus;
  /** A later negative cumulative balance makes an early recovery insufficient. */
  fallsNegativeAfterPayback: boolean;
  /** Binding initial-contract payments after the study horizon, excluded from horizon cash. */
  committedFeesBeyondHorizon: number;
  series: MonthlyCashFlow[];
}
export interface ComparisonResult {
  modelVersion: string;
  currency: Currency;
  horizonMonths: number;
  baselineMonthlyCost: number;
  netTaskHoursReleased: number;
  paidHoursAvoided: number;
  redeployedHours: number;
  additionalPaidHours: number;
  options: Record<OptionId, OptionResult>;
  warnings: string[];
}
export class RoiValidationError extends Error {
  constructor(public issues: ValidationIssue[]) {
    super(issues.map((issue) => issue.message).join(" "));
    this.name = "RoiValidationError";
  }
}

/** Strict complete-number parsing. Decimal comma is accepted only for de-DE. */
export function parseNumericInput(raw: string, locale: NumberLocale = "en-US"): number | null {
  if (typeof raw !== "string" || !["en-US", "de-CH", "de-DE"].includes(locale)) return null;
  let text = raw.trim().replace(/[\u2019\u02bc]/g, "'").replace(/[\u00a0\u202f]/g, " ");
  if (!text) return null;
  let sign = 1;
  if (text[0] === "-" || text[0] === "+") {
    if (text[0] === "-") sign = -1;
    text = text.slice(1);
  }
  const decimal = locale === "de-DE" ? "," : ".";
  const parts = text.split(decimal);
  if (parts.length > 2 || !parts[0] || (parts.length === 2 && !/^\d+$/.test(parts[1]))) return null;
  const allowedGroups = locale === "de-DE" ? [".", "'", " "] : [",", "'", " "];
  const presentGroups = allowedGroups.filter((separator) => parts[0].includes(separator));
  if (presentGroups.length > 1) return null;
  let integral = parts[0];
  if (presentGroups.length) {
    const groups = integral.split(presentGroups[0]);
    if (!/^\d{1,3}$/.test(groups[0]) || groups.slice(1).some((group) => !/^\d{3}$/.test(group))) return null;
    integral = groups.join("");
  } else if (!/^\d+$/.test(integral)) return null;
  const value = sign * Number(integral + (parts.length === 2 ? `.${parts[1]}` : ""));
  return Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER ? (value === 0 ? 0 : value) : null;
}

const INTEGER_FIELDS: (keyof RoiInputs)[] = ["horizonMonths", "deploymentDelayMonths", "rampMonths", "labourSavingsStartMonth", "operatingCostsStartMonth", "raasBillingStartMonth", "raasContractMonths"];
const PERCENT_FIELDS: (keyof RoiInputs)[] = ["cashRealisationPercent", "firstRampPercent", "annualDiscountPercent", "labourEscalationPercent", "feeEscalationPercent", "operatingEscalationPercent"];
const MONTH_FIELDS: (keyof RoiInputs)[] = ["horizonMonths", "rampMonths", "labourSavingsStartMonth", "operatingCostsStartMonth", "raasBillingStartMonth", "raasContractMonths"];

/** Validates exported/edited scenarios as well as form values. No silent coercion or clamping. */
export function validateInputs(value: unknown): ValidationIssue[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [{ field: "global", message: "Enter a complete scenario." }];
  const input = value as Record<string, unknown>;
  const issues: ValidationIssue[] = [];
  const add = (field: keyof RoiInputs, message: string) => issues.push({ field, message });
  for (const key of Object.keys(DEFAULT_INPUTS) as (keyof RoiInputs)[]) {
    if (typeof DEFAULT_INPUTS[key] !== "number") continue;
    const n = input[key];
    if (typeof n !== "number" || !Number.isFinite(n) || n < 0 || n > 1_000_000_000) add(key, `${key}: enter a finite, non-negative number no greater than 1 billion.`);
  }
  if (typeof input.currency !== "string" || !["USD", "CHF", "EUR"].includes(input.currency)) add("currency", "Select USD, CHF or EUR. Currency selection does not convert values.");
  if (typeof input.numberLocale !== "string" || !["en-US", "de-CH", "de-DE"].includes(input.numberLocale)) add("numberLocale", "Select a supported number format.");
  if (typeof input.renewRaasAfterContract !== "boolean") add("renewRaasAfterContract", "Confirm whether the RaaS contract continues after its initial term.");
  if (issues.length) return issues;
  const s = input as unknown as RoiInputs;
  for (const key of INTEGER_FIELDS) if (!Number.isInteger(s[key])) add(key, `${key}: use whole months.`);
  for (const key of MONTH_FIELDS) if ((s[key] as number) < 1 || (s[key] as number) > 120) add(key, `${key}: use 1 to 120 months.`);
  if (s.deploymentDelayMonths > 119) add("deploymentDelayMonths", "Deployment delay must be 0 to 119 months.");
  for (const key of PERCENT_FIELDS) if ((s[key] as number) > 100) add(key, `${key}: use 0 to 100%.`);
  if (s.automatedTaskHours > s.baselineTaskHours) add("automatedTaskHours", "Automated task hours cannot exceed the baseline task hours for the same workload.");
  if (s.otherCashSavingsMonthly > s.baselineOtherMonthlyCost) add("otherCashSavingsMonthly", "Other savings cannot exceed the other baseline costs from which they are removed.");
  if (s.purchaseResidualValue > s.purchasePrice + s.purchaseSetup) add("purchaseResidualValue", "Residual value cannot exceed the entered installed purchase cost in this model.");
  const contractLastMonth = s.raasBillingStartMonth + s.raasContractMonths - 1;
  if (s.horizonMonths > contractLastMonth && !s.renewRaasAfterContract) add("renewRaasAfterContract", "The study extends beyond the RaaS contract. Confirm continued service and enter a renewal fee, or shorten the study.");
  return issues;
}

/** Month 0 has no operations. Delay 1, ramp 3, first 50% gives 0%, 50%, 75%, 100%. */
export function benefitRamp(month: number, s: RoiInputs): number {
  const productionMonth = month - s.deploymentDelayMonths;
  if (productionMonth <= 0) return 0;
  if (s.rampMonths === 1 || productionMonth >= s.rampMonths) return 1;
  const first = s.firstRampPercent / 100;
  return first + ((productionMonth - 1) / (s.rampMonths - 1)) * (1 - first);
}

interface WorkEffect { released: number; paidAvoided: number; additionalPaid: number; labourSaving: number }
function workEffect(s: RoiInputs, ramp: number, allowPayrollSaving: boolean): WorkEffect {
  const net = (s.automatedTaskHours - s.retainedSupportHours) * ramp;
  const released = Math.max(0, net);
  const paidAvoided = allowPayrollSaving ? Math.min(s.baselineTaskHours, released * s.cashRealisationPercent / 100) : 0;
  // A zero savings percentage does not erase the cash cost of additional support work.
  const additionalPaid = Math.max(0, -net - s.confirmedIdleHours);
  return { released, paidAvoided, additionalPaid, labourSaving: (paidAvoided - additionalPaid) * s.hourlyCashCost };
}
const escalation = (percent: number, month: number) => (1 + percent / 100) ** (Math.max(0, month - 1) / 12);
const nominalRaasFee = (s: RoiInputs, month: number) => {
  if (month < s.raasBillingStartMonth) return 0;
  const contractLastMonth = s.raasBillingStartMonth + s.raasContractMonths - 1;
  // Each entered fee is its contract-period opening rate. Do not inflate a quoted
  // renewal fee a second time for the years before that renewal starts.
  return month <= contractLastMonth
    ? s.raasMonthlyFee * escalation(s.feeEscalationPercent, month - s.raasBillingStartMonth + 1)
    : s.raasRenewalMonthlyFee * escalation(s.feeEscalationPercent, month - contractLastMonth);
};

function evaluateOption(s: RoiInputs, id: OptionId): OptionResult {
  const automated = id !== "manual";
  const upfrontCash = id === "raas" ? s.raasSetup : id === "purchase" ? s.purchasePrice + s.purchaseSetup : 0;
  const full = workEffect(s, 1, true);
  const baseline = s.baselineTaskHours * s.hourlyCashCost + s.baselineOtherMonthlyCost;
  const steadySystem = id === "raas" ? s.raasMonthlyFee + s.raasMonthlyOperatingCost : id === "purchase" ? s.purchaseMonthlyOperatingCost : 0;
  const steadyMonthlyCost = automated ? baseline - full.labourSaving - s.otherCashSavingsMonthly + steadySystem : baseline;
  const steadyMonthlyBenefit = automated ? baseline - steadyMonthlyCost + s.additionalContributionMonthly : 0;
  let cumulative = -upfrontCash;
  const zero: MonthlyCashFlow = { month: 0, ramp: 0, manualCashCost: 0, optionCashCost: upfrontCash, remainingLabourCost: 0, otherOperatingCost: 0, systemCashCost: upfrontCash, labourCashSaving: 0, otherCashSaving: 0, additionalContribution: 0, taskHoursReleased: 0, paidHoursAvoided: 0, additionalPaidHours: 0, incrementalCashFlow: -upfrontCash, cumulativeCashFlow: cumulative, discountedCashFlow: -upfrontCash };
  const series: MonthlyCashFlow[] = [zero];
  for (let month = 1; month <= s.horizonMonths; month++) {
    const ramp = automated ? benefitRamp(month, s) : 0;
    const labourFactor = escalation(s.labourEscalationPercent, month);
    const opFactor = escalation(s.operatingEscalationPercent, month);
    const work = workEffect(s, ramp, month >= s.labourSavingsStartMonth);
    const labourCashSaving = work.labourSaving * labourFactor;
    const baselineLabour = s.baselineTaskHours * s.hourlyCashCost * labourFactor;
    const baselineOther = s.baselineOtherMonthlyCost * opFactor;
    const otherCashSaving = automated ? s.otherCashSavingsMonthly * ramp * opFactor : 0;
    const operating = month >= s.operatingCostsStartMonth;
    let systemCashCost = id === "raas" ? nominalRaasFee(s, month) + (operating ? s.raasMonthlyOperatingCost * opFactor : 0) : id === "purchase" && operating ? s.purchaseMonthlyOperatingCost * opFactor : 0;
    if (month === s.horizonMonths) {
      if (id === "raas") systemCashCost += s.raasExitCost;
      if (id === "purchase") systemCashCost += s.purchaseExitCost - s.purchaseResidualValue;
    }
    const remainingLabourCost = baselineLabour - labourCashSaving;
    const otherOperatingCost = baselineOther - otherCashSaving;
    const manualCashCost = baselineLabour + baselineOther;
    const optionCashCost = remainingLabourCost + otherOperatingCost + systemCashCost;
    const additionalContribution = automated ? s.additionalContributionMonthly * ramp : 0;
    const incrementalCashFlow = manualCashCost - optionCashCost + additionalContribution;
    cumulative += incrementalCashFlow;
    series.push({ month, ramp, manualCashCost, optionCashCost, remainingLabourCost, otherOperatingCost, systemCashCost, labourCashSaving, otherCashSaving, additionalContribution, taskHoursReleased: work.released, paidHoursAvoided: work.paidAvoided, additionalPaidHours: work.additionalPaid, incrementalCashFlow, cumulativeCashFlow: cumulative, discountedCashFlow: incrementalCashFlow / (1 + s.annualDiscountPercent / 100) ** (month / 12) });
  }
  // Recovery requires a real deficit first, including any rollout deficit with no upfront fee.
  let hasDeficit = series[0].cumulativeCashFlow < -1e-8;
  let paybackMonth: number | null = null;
  let fallsNegativeAfterPayback = false;
  for (const row of series.slice(1)) {
    if (hasDeficit && paybackMonth === null && row.cumulativeCashFlow >= -1e-8) paybackMonth = row.month;
    if (row.cumulativeCashFlow < -1e-8) {
      hasDeficit = true;
      if (paybackMonth !== null) fallsNegativeAfterPayback = true;
    }
  }
  const allZero = series.every((row) => Math.abs(row.incrementalCashFlow) < 1e-8);
  const paybackStatus: PaybackStatus = paybackMonth !== null ? "recovered" : allZero ? "no-change" : !hasDeficit ? "cash-positive-from-start" : upfrontCash === 0 && steadyMonthlyBenefit <= 0 ? "no-upfront-ongoing-loss" : "not-recovered";
  let committedFeesBeyondHorizon = 0;
  if (id === "raas") {
    for (let month = Math.max(s.horizonMonths + 1, s.raasBillingStartMonth); month < s.raasBillingStartMonth + s.raasContractMonths; month++) committedFeesBeyondHorizon += nominalRaasFee(s, month);
  }
  return { id, label: id === "manual" ? "Manual operation" : id === "purchase" ? "Buy a system" : "RaaS", upfrontCash, steadyMonthlyCost, steadyMonthlyBenefit, horizonCashCost: series.reduce((sum, row) => sum + row.optionCashCost, 0), netCashBenefit: cumulative, npv: series.reduce((sum, row) => sum + row.discountedCashFlow, 0), paybackMonth, paybackStatus, fallsNegativeAfterPayback, committedFeesBeyondHorizon, series };
}

export function calculateComparison(input: RoiInputs): ComparisonResult {
  const issues = validateInputs(input);
  if (issues.length) throw new RoiValidationError(issues);
  const s = input;
  const full = workEffect(s, 1, true);
  const options = { manual: evaluateOption(s, "manual"), purchase: evaluateOption(s, "purchase"), raas: evaluateOption(s, "raas") };
  const warnings: string[] = [];
  if (s.deploymentDelayMonths >= s.horizonMonths) warnings.push("Deployment begins after the study ends: no operational benefit is included in this horizon.");
  else if (benefitRamp(s.horizonMonths, s) < 1) warnings.push("Full deployment is reached after the study ends. Steady-state figures are an eventual operating case, not a month within this horizon.");
  if (s.labourSavingsStartMonth > s.horizonMonths && full.paidAvoided > 0) warnings.push("The staffing change starts after the study ends. No avoided payroll is included in this horizon.");
  if (full.additionalPaid > 0) warnings.push("Retained support exceeds the work automated. Additional paid labour is included even when cash realisation is zero.");
  if (s.additionalContributionMonthly > 0) warnings.push("Additional contribution assumes documented demand and margin after all extra costs; verify that required staff are not also counted as payroll savings.");
  if (s.confirmedIdleHours > 0) warnings.push("Confirmed idle hours are assumed available at no additional payroll cost. Keep the staffing evidence with the quote.");
  if (options.raas.committedFeesBeyondHorizon > 0) warnings.push("The RaaS contract has committed payments beyond the study horizon. They are disclosed separately and are not included in the horizon cash total or NPV.");
  if (s.renewRaasAfterContract && s.horizonMonths >= s.raasBillingStartMonth + s.raasContractMonths) warnings.push("RaaS continues beyond the initial term at the entered renewal fee. This is an explicit assumption, not a confirmed renewal offer.");
  if (options.raas.fallsNegativeAfterPayback || options.purchase.fallsNegativeAfterPayback) warnings.push("At least one option returns to a negative cumulative balance after its first recovery. Review its whole cash-flow curve.");
  return { modelVersion: MODEL_VERSION, currency: s.currency, horizonMonths: s.horizonMonths, baselineMonthlyCost: s.baselineTaskHours * s.hourlyCashCost + s.baselineOtherMonthlyCost, netTaskHoursReleased: full.released, paidHoursAvoided: full.paidAvoided, redeployedHours: full.released - full.paidAvoided, additionalPaidHours: full.additionalPaid, options, warnings };
}

/** Staffing sensitivity only: identical equipment and workload, no probability assigned. */
export function calculateStaffingSensitivity(input: RoiInputs): { cashRealisationPercent: number; result: ComparisonResult }[] {
  return [0, 50, 100].map((cashRealisationPercent) => ({ cashRealisationPercent, result: calculateComparison({ ...input, cashRealisationPercent }) }));
}

/** Exact input + model-version export; no browser or personal data dependencies. */
export function serializeScenario(input: RoiInputs): string {
  const issues = validateInputs(input);
  if (issues.length) throw new RoiValidationError(issues);
  return JSON.stringify({ modelVersion: MODEL_VERSION, inputs: input }, null, 2);
}

export function deserializeScenario(json: string): RoiInputs {
  const parsed: unknown = JSON.parse(json);
  if (!parsed || typeof parsed !== "object" || !("modelVersion" in parsed) || parsed.modelVersion !== MODEL_VERSION || !("inputs" in parsed)) throw new RoiValidationError([{ field: "global", message: "This scenario uses an unsupported model version." }]);
  const issues = validateInputs(parsed.inputs);
  if (issues.length) throw new RoiValidationError(issues);
  // Copy only the supported fields, so an imported document cannot add executable/config data.
  const source = parsed.inputs as RoiInputs;
  return Object.fromEntries(Object.keys(DEFAULT_INPUTS).map((key) => [key, source[key as keyof RoiInputs]])) as unknown as RoiInputs;
}
