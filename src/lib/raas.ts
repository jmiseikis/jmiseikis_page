// RaaS (robots as a service) scenario model.
// Separates cash effects from explicitly recognised extra output. Inputs are illustrative
// assumptions; no deployment capacity, ramp-up, financing, tax or discounting is modelled.
//
// Changes from the previous on-page model (see the calculator page for the user-facing note):
// - Workers are per shift; base pay = workers x wage x shifts x 8 h x days x 4.33 weeks.
// - Only a user-set share of labour cost counts as cash saved (previously always 100%).
// - Productivity value is no longer added to "net savings"; it is a separate economic series
//   that only counts at an explicit realisation percentage (default 0%).
// - Extra monthly operating costs can be entered.
// - Labour inflation is configurable and starts after month 1 (previously a fixed 2% that
//   already inflated month 1).
// - Payback is the first month the cumulative cash position, starting at minus setup, is
//   non-negative (previously setup / first-month net, which ignored inflation and term).
// - The breakdown no longer labels loaded pay as base pay next to a separate benefits line.

export interface ScenarioInputs {
  /** Workers per shift whose cost the deployment affects. */
  workers: number;
  /** Hourly wage per worker. */
  wage: number;
  shifts: number;
  /** Working days per week. */
  days: number;
  /** Benefits and overhead, % of base pay. */
  overhead: number;
  /** Annual staff turnover, % of affected staff. */
  turnover: number;
  /** Share of labour cost that is actually removed or avoided, %. */
  labourRealisation: number;
  robots: number;
  /** Monthly subscription per robot. */
  subscription: number;
  /** One-off setup and integration cost. */
  setup: number;
  /** Uptime %, used for the productivity estimate only. */
  uptime: number;
  /** Additional productivity versus manual work, %. */
  productivity: number;
  /** Share of the extra output recognised as economic value, %. */
  productivityRealisation: number;
  /** Contract length in years. */
  years: number;
  /** Additional monthly operating costs (supervision, maintenance not in the subscription, etc.). */
  operations: number;
  /** Monthly rework or error cost. */
  errors: number;
  errorReduction: number;
  /** Monthly incident or liability cost. */
  incidents: number;
  incidentReduction: number;
  /** Annual labour cost inflation, %. */
  inflation: number;
}

export interface ScenarioPoint {
  month: number;
  cash: number;
  economic: number;
}

export interface ScenarioResult {
  base: number;
  overhead: number;
  turnover: number;
  labourAvoided: number;
  quality: number;
  subscription: number;
  operations: number;
  recurring: number;
  productiveValue: number;
  cashMonthly: number;
  cashGain: number;
  economicGain: number;
  /** First whole month with a non-negative cumulative cash position; 0 = immediate; null = not within term. */
  payback: number | null;
  months: number;
  investment: number;
  /** Cash ROI in %, or null when there is no modelled cash investment. */
  roi: number | null;
  series: ScenarioPoint[];
}

export const WEEKS_PER_MONTH = 4.33;
export const HOURS_PER_SHIFT = 8;
/** Replacement cost of a leaver, as a share of annual base pay. An explicit assumption, not a benchmark. */
export const TURNOVER_REPLACEMENT_SHARE = 0.75;

export const DEFAULT_SCENARIO: ScenarioInputs = {
  workers: 3,
  wage: 25,
  shifts: 2,
  days: 5,
  overhead: 30,
  turnover: 20,
  labourRealisation: 100,
  robots: 2,
  subscription: 3000,
  setup: 20000,
  uptime: 95,
  productivity: 40,
  productivityRealisation: 0,
  years: 3,
  operations: 0,
  errors: 5000,
  errorReduction: 75,
  incidents: 1000,
  incidentReduction: 60,
  inflation: 2,
};

const PERCENT_FIELDS: (keyof ScenarioInputs)[] = [
  "overhead",
  "turnover",
  "labourRealisation",
  "uptime",
  "productivityRealisation",
  "errorReduction",
  "incidentReduction",
];

export class ScenarioError extends Error {}

export function calculateScenario(s: ScenarioInputs): ScenarioResult {
  for (const key of Object.keys(DEFAULT_SCENARIO) as (keyof ScenarioInputs)[]) {
    const value = s?.[key];
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new ScenarioError(`Invalid ${key}`);
  }
  for (const key of PERCENT_FIELDS) if (s[key] > 100) throw new ScenarioError(`Invalid percentage: ${key}`);
  if (!Number.isInteger(s.robots) || s.robots < 1 || s.robots > 20) throw new ScenarioError("Use 1 to 20 robots");
  if (!Number.isInteger(s.workers) || s.workers > 20) throw new ScenarioError("Use 0 to 20 workers per shift");
  if (!Number.isInteger(s.shifts) || s.shifts < 1 || s.shifts > 3) throw new ScenarioError("Use 1 to 3 shifts");
  if (!Number.isInteger(s.days) || s.days < 1 || s.days > 7) throw new ScenarioError("Use 1 to 7 working days");
  const months = Math.round(s.years * 12);
  if (months < 1 || months > 60) throw new ScenarioError("Contract must be 1 to 60 months");

  const base = s.workers * s.wage * s.shifts * HOURS_PER_SHIFT * s.days * WEEKS_PER_MONTH;
  const overhead = (base * s.overhead) / 100;
  const turnover = ((base * s.turnover) / 100) * TURNOVER_REPLACEMENT_SHARE;
  const labourAvoided = ((base + overhead + turnover) * s.labourRealisation) / 100;
  const quality = (s.errors * s.errorReduction) / 100 + (s.incidents * s.incidentReduction) / 100;
  const subscription = s.robots * s.subscription;
  const recurring = subscription + s.operations;
  const productiveValue = (((base * s.productivity) / 100) * s.uptime * s.productivityRealisation) / 10000;
  const cashMonthly = labourAvoided + quality - recurring;

  let cash = -s.setup;
  let economic = -s.setup;
  let payback: number | null = s.setup === 0 && cashMonthly >= 0 ? 0 : null;
  const series: ScenarioPoint[] = [{ month: 0, cash, economic }];
  for (let month = 1; month <= months; month++) {
    // Month 1 is the configured baseline; annual labour inflation applies after it.
    const inflation = (1 + s.inflation / 100) ** ((month - 1) / 12);
    const monthCash = labourAvoided * inflation + quality - recurring;
    cash += monthCash;
    economic += monthCash + productiveValue;
    if (payback === null && cash >= 0) payback = month;
    series.push({ month, cash, economic });
  }

  const investment = s.setup + recurring * months;
  return {
    base,
    overhead,
    turnover,
    labourAvoided,
    quality,
    subscription,
    operations: s.operations,
    recurring,
    productiveValue,
    cashMonthly,
    cashGain: cash,
    economicGain: economic,
    payback,
    months,
    investment,
    roi: investment > 0 ? (cash / investment) * 100 : null,
    series,
  };
}
