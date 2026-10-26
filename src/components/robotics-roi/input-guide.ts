import { DEFAULT_INPUTS, type RoiInputs, type NumberLocale } from "@/lib/robotics-roi";
import type { TermKey } from "./Term";

export type NumericKey = { [K in keyof RoiInputs]: RoiInputs[K] extends number ? K : never }[keyof RoiInputs];
export type HelperKey = "dailyHours" | "workingDays" | "automationShare";
export type InputKey = NumericKey | HelperKey | "renewRaasAfterContract" | "global";
export type RawInputs = Record<NumericKey, string>;
export interface FieldSpec {
  label: string;
  unit?: "money" | "hours" | "%" | "months" | "month";
  hint: string;
  term?: TermKey;
}

export const NUMERIC_KEYS = Object.keys(DEFAULT_INPUTS).filter((key) => typeof DEFAULT_INPUTS[key as keyof RoiInputs] === "number") as NumericKey[];
export const editableNumber = (value: number, locale: NumberLocale) => new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: 20 }).format(value);
export const toRaw = (input: RoiInputs): RawInputs => Object.fromEntries(NUMERIC_KEYS.map((key) => [key, editableNumber(input[key], input.numberLocale)])) as RawInputs;

export const STEPS = ["Today's work", "Robot & people", "Supplier offers", "Timing & results"];
export const STEP_FIELDS: InputKey[][] = [
  ["baselineTaskHours", "hourlyCashCost", "baselineOtherMonthlyCost", "dailyHours", "workingDays"],
  ["automatedTaskHours", "automationShare", "retainedSupportHours", "cashRealisationPercent", "confirmedIdleHours"],
  ["raasMonthlyFee", "raasSetup", "raasMonthlyOperatingCost", "purchasePrice", "purchaseSetup", "purchaseMonthlyOperatingCost", "purchaseResidualValue", "purchaseExitCost", "raasExitCost"],
  ["horizonMonths", "raasContractMonths", "renewRaasAfterContract", "raasRenewalMonthlyFee", "deploymentDelayMonths", "rampMonths", "firstRampPercent", "labourSavingsStartMonth", "raasBillingStartMonth", "operatingCostsStartMonth", "annualDiscountPercent", "labourEscalationPercent", "feeEscalationPercent", "operatingEscalationPercent", "otherCashSavingsMonthly", "additionalContributionMonthly"],
];
export const HELPER_LABELS: Record<HelperKey, string> = {
  dailyHours: "Combined staff hours per day", workingDays: "Working days per month", automationShare: "Share of the task the robot handles",
};

export const FIELDS: Record<NumericKey, FieldSpec> = {
  baselineTaskHours: { label: "Staff time each month", unit: "hours", hint: "Count time spent on this task across all people and shifts, not the whole payroll." },
  hourlyCashCost: { label: "Cost per paid staff hour", unit: "money", hint: "Include pay and employer costs that would fall if paid hours were reduced. Leave out overhead that stays." },
  baselineOtherMonthlyCost: { label: "Other current costs per month", unit: "money", hint: "For this task only, such as scrap or outsourcing. Staff costs are already counted." },
  automatedTaskHours: { label: "Work the robot takes over", unit: "hours", hint: "Monthly hours of today's work the complete quoted system can handle, after downtime and capacity limits." },
  retainedSupportHours: { label: "Staff help the robot still needs", unit: "hours", hint: "Each month: loading, supervision, changeovers and handling exceptions. This is subtracted from the work taken over." },
  cashRealisationPercent: { label: "Share of freed time that cuts paid costs", unit: "%", hint: "Apply this to hours freed after support. Use your plan for avoided overtime, agency hours, funded hires or payroll." },
  confirmedIdleHours: { label: "Existing paid idle time available", unit: "hours", hint: "Only offsets extra support work. Leave at zero unless already-paid capacity is genuinely available." },
  additionalContributionMonthly: { label: "Extra monthly profit from sales", unit: "money", hint: "Extra sold output after all extra costs. Requires demand and capacity evidence; do not reuse staff also removed from payroll." },
  otherCashSavingsMonthly: { label: "Other monthly costs removed", unit: "money", hint: "Can only come from the other current costs in step 1. Do not repeat staff savings." },
  raasSetup: { label: "RaaS setup payment", unit: "money", hint: "One payment upfront for installation, integration or training. Enter zero if included in the subscription." },
  raasMonthlyFee: { label: "Monthly subscription", unit: "money", hint: "The fee for the complete system in the first billed month. Use the same workload as your purchase quote." },
  raasMonthlyOperatingCost: { label: "Other RaaS running costs", unit: "money", hint: "Each month, only costs outside the fee: energy, consumables, software or service exclusions. Staff help is already counted." },
  raasContractMonths: { label: "Quoted contract length", unit: "months", hint: "The supplier's initial commitment, counted from the first billing month. This is independent of the comparison period." },
  raasRenewalMonthlyFee: { label: "Monthly fee after renewal", unit: "money", hint: "Your assumed fee in the first renewal month. Annual increases apply after renewal starts." },
  raasExitCost: { label: "RaaS exit payment", unit: "money", hint: "Cash paid at the end of this comparison. Remaining initial-contract fees are disclosed separately." },
  purchasePrice: { label: "System purchase price", unit: "money", hint: "The complete system for the same workload and performance. Paid upfront." },
  purchaseSetup: { label: "Extra purchase setup costs", unit: "money", hint: "Integration, site work and training only if excluded from the purchase price." },
  purchaseMonthlyOperatingCost: { label: "Purchase running costs per month", unit: "money", hint: "Maintenance, service, energy, consumables and software. Staff help is already counted." },
  purchaseResidualValue: { label: "Expected resale proceeds", unit: "money", hint: "Cash you expect to receive at the end of the comparison. Leave at zero without evidence.", term: "residualValue" },
  purchaseExitCost: { label: "Purchase exit payment", unit: "money", hint: "Removal or other cash costs paid at the end of the comparison." },
  deploymentDelayMonths: { label: "Months before the robot starts helping", unit: "months", hint: "Zero means benefits start in month 1. One full month of installation means benefits start in month 2." },
  rampMonths: { label: "Months to reach full performance", unit: "months", hint: "Count the first working month. One means full performance immediately after installation.", term: "ramp" },
  firstRampPercent: { label: "Performance in the first working month", unit: "%", hint: "For a gradual rollout, benefits rise evenly from this share to 100%." },
  labourSavingsStartMonth: { label: "First month paid costs can fall", unit: "month", hint: "Use the date your staffing changes can take effect. Savings also wait for the robot to release time." },
  raasBillingStartMonth: { label: "First subscription billing month", unit: "month", hint: "Billing can begin before the robot delivers benefits. The quoted fee applies in this month." },
  operatingCostsStartMonth: { label: "First month running costs are paid", unit: "month", hint: "Applies to both options, independently of benefits and subscription billing." },
  annualDiscountPercent: { label: "Required annual return", unit: "%", hint: "Used to value future cash in today's money. Use your organisation's rate if known; 8% is an example.", term: "discountRate" },
  labourEscalationPercent: { label: "Annual staff-cost increase", unit: "%", hint: "Applied to avoidable hourly costs. Zero keeps the opening rate throughout.", term: "escalation" },
  feeEscalationPercent: { label: "Annual subscription increase", unit: "%", hint: "Applied from each contract's first billed month. Zero means no annual increase.", term: "escalation" },
  operatingEscalationPercent: { label: "Annual running-cost increase", unit: "%", hint: "Applied to other operating costs and their corresponding savings.", term: "escalation" },
  horizonMonths: { label: "Months to compare", unit: "months", hint: "The length of your cash-flow comparison. It does not change the supplier's contract." },
};

/** Constraints exposed to the visitor; the engine remains the final validator. */
export function fieldLimit(key: NumericKey, draft: Partial<RoiInputs>): { min: number; max?: number; integer?: boolean } {
  const validAmount = (value: number | undefined): value is number => value !== undefined && Number.isFinite(value) && value >= 0 && value <= 1_000_000_000;
  if (FIELDS[key].unit === "%") return { min: 0, max: 100 };
  if (key === "deploymentDelayMonths") return { min: 0, max: 119, integer: true };
  if (FIELDS[key].unit === "months" || FIELDS[key].unit === "month") return { min: 1, max: 120, integer: true };
  if (key === "automatedTaskHours") return { min: 0, ...(validAmount(draft.baselineTaskHours) ? { max: draft.baselineTaskHours } : {}) };
  if (key === "otherCashSavingsMonthly") return { min: 0, ...(validAmount(draft.baselineOtherMonthlyCost) ? { max: draft.baselineOtherMonthlyCost } : {}) };
  if (key === "purchaseResidualValue") return { min: 0, ...(validAmount(draft.purchasePrice) && validAmount(draft.purchaseSetup) ? { max: Math.min(1_000_000_000, draft.purchasePrice + draft.purchaseSetup) } : {}) };
  return { min: 0, max: 1_000_000_000 };
}
