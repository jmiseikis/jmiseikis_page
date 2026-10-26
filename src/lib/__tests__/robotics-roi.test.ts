import { describe, expect, it } from "vitest";
import {
  DEFAULT_INPUTS, MODEL_VERSION, RoiValidationError, benefitRamp,
  calculateComparison, calculateStaffingSensitivity, deserializeScenario,
  parseNumericInput, serializeScenario, validateInputs, type RoiInputs,
} from "../robotics-roi";

const scenario = (changes: Partial<RoiInputs> = {}): RoiInputs => ({ ...DEFAULT_INPUTS, ...changes });

describe("strict complete number parsing", () => {
  it.each([
    ["20,000", "en-US", 20000], ["20'000", "en-US", 20000], ["20’000", "de-CH", 20000],
    ["20 000", "en-US", 20000], ["20\u202f000", "de-CH", 20000],
    ["1,039.20", "en-US", 1039.2], ["1.039,20", "de-DE", 1039.2],
    ["25,5", "de-DE", 25.5], ["25.5", "de-CH", 25.5], ["0", "en-US", 0],
    ["-0", "en-US", 0], ["-1,000", "en-US", -1000],
  ] as const)("parses %s in %s without truncation", (text, locale, expected) => {
    expect(parseNumericInput(text, locale)).toBe(expected);
  });
  it.each(["", " ", "20,00", "25,5", "3000garbage", "USD 3000", "1e6", "Infinity", "NaN", "1,234'567", "1.2.3", "1.", ".5", "1,,000", "20 00"])("rejects incomplete or ambiguous input %s", (text) => {
    expect(parseNumericInput(text, "en-US")).toBeNull();
  });
  it("rejects a decimal point in German unless it is valid grouping", () => {
    expect(parseNumericInput("25.5", "de-DE")).toBeNull();
    expect(parseNumericInput("25.500", "de-DE")).toBe(25500);
  });
});

describe("reference cash flows, independently hand-calculated", () => {
  it("reproduces the fully cashable 36-month example including rollout and discounting", () => {
    const result = calculateComparison(scenario({ cashRealisationPercent: 100 }));
    expect(result.baselineMonthlyCost).toBeCloseTo(33774, 8);
    expect(result.netTaskHoursReleased).toBeCloseTo(415.68, 8);
    expect(result.paidHoursAvoided).toBeCloseTo(415.68, 8);
    expect(result.options.raas.steadyMonthlyBenefit).toBeCloseTo(7009.6, 8);
    expect(result.options.raas.netCashBenefit).toBeCloseTo(208703.8, 6);
    expect(result.options.raas.npv).toBeCloseTo(181205.95, 2);
    expect(result.options.raas.paybackMonth).toBe(7);
    expect(result.options.purchase.netCashBenefit).toBeCloseTo(276703.8, 6);
    expect(result.options.purchase.npv).toBeCloseTo(227444.27, 2);
    expect(result.options.purchase.paybackMonth).toBe(14);
  });
  it("keeps the default partial-realisation case slightly positive in steady state but unrecovered in 36 months", () => {
    const result = calculateComparison(scenario());
    expect(result.paidHoursAvoided).toBeCloseTo(207.84, 8);
    expect(result.redeployedHours).toBeCloseTo(207.84, 8);
    expect(result.options.raas.steadyMonthlyBenefit).toBeCloseTo(254.8, 8);
    expect(result.options.raas.netCashBenefit).toBeCloseTo(-22648.1, 6);
    expect(result.options.raas.npv).toBeCloseTo(-23537.85, 2);
    expect(result.options.raas.paybackMonth).toBeNull();
    expect(result.options.raas.paybackStatus).toBe("not-recovered");
    expect(result.options.purchase.netCashBenefit).toBeCloseTo(45351.9, 6);
    expect(result.options.purchase.paybackMonth).toBe(29);
  });
  it("shows hours released without automatically monetising redeployment", () => {
    const result = calculateComparison(scenario({ cashRealisationPercent: 0 }));
    expect(result.netTaskHoursReleased).toBeCloseTo(415.68, 8);
    expect(result.redeployedHours).toBeCloseTo(415.68, 8);
    expect(result.paidHoursAvoided).toBe(0);
    expect(result.options.raas.steadyMonthlyBenefit).toBe(-6500);
    expect(result.options.raas.netCashBenefit).toBe(-254000);
    expect(result.options.raas.npv).toBeCloseTo(-228281.65, 2);
  });
  it("reconciles every row and total to one ledger including terminal cash flows", () => {
    const result = calculateComparison(scenario({ cashRealisationPercent: 75, otherCashSavingsMonthly: 100, baselineOtherMonthlyCost: 500, additionalContributionMonthly: 200, purchaseResidualValue: 5000, purchaseExitCost: 300, raasExitCost: 800, labourEscalationPercent: 3, operatingEscalationPercent: 2, feeEscalationPercent: 1 }));
    for (const option of Object.values(result.options)) {
      let cumulative = 0;
      for (const row of option.series) {
        expect(row.optionCashCost).toBeCloseTo(row.remainingLabourCost + row.otherOperatingCost + row.systemCashCost, 7);
        expect(row.incrementalCashFlow).toBeCloseTo(row.manualCashCost - row.optionCashCost + row.additionalContribution, 7);
        cumulative += row.incrementalCashFlow;
        expect(row.cumulativeCashFlow).toBeCloseTo(cumulative, 7);
      }
      expect(option.netCashBenefit).toBeCloseTo(cumulative, 7);
      expect(option.horizonCashCost).toBeCloseTo(option.series.reduce((sum, row) => sum + row.optionCashCost, 0), 7);
      expect(option.npv).toBeCloseTo(option.series.reduce((sum, row) => sum + row.discountedCashFlow, 0), 7);
    }
    expect(result.options.manual.netCashBenefit).toBe(0);
    expect(result.options.manual.npv).toBe(0);
  });
});

describe("operational and timing invariants", () => {
  it("uses no output during deployment, then the stated ramp", () => {
    expect([0, 1, 2, 3, 4, 5].map((month) => benefitRamp(month, scenario()))).toEqual([0, 0, 0.5, 0.75, 1, 1]);
    const rows = calculateComparison(scenario()).options.raas.series;
    expect(rows[1].labourCashSaving).toBe(0);
    expect(rows[1].systemCashCost).toBe(6500);
    expect(rows[2].paidHoursAvoided).toBeCloseTo(103.92, 8);
  });
  it("permits immediate full performance as an explicit assumption", () => {
    expect(benefitRamp(1, scenario({ deploymentDelayMonths: 0, rampMonths: 1, firstRampPercent: 0 }))).toBe(1);
  });
  it("does not warn about an unfinished ramp when first production already reaches 100%", () => {
    const result = calculateComparison(scenario({ horizonMonths: 12, rampMonths: 120, firstRampPercent: 100 }));
    expect(result.options.raas.series[2].ramp).toBe(1);
    expect(result.warnings.some((warning) => warning.includes("Full deployment is reached after"))).toBe(false);
    const partial = calculateComparison(scenario({ horizonMonths: 12, rampMonths: 120, firstRampPercent: 50 }));
    expect(partial.warnings.some((warning) => warning.includes("Full deployment is reached after"))).toBe(true);
  });
  it("does not remove payroll before the entered staffing change date", () => {
    const rows = calculateComparison(scenario({ cashRealisationPercent: 100, labourSavingsStartMonth: 6 })).options.raas.series;
    expect(rows[4].taskHoursReleased).toBeCloseTo(415.68, 8);
    expect(rows[4].paidHoursAvoided).toBe(0);
    expect(rows[6].paidHoursAvoided).toBeCloseTo(415.68, 8);
  });
  it("charges additional paid support work even when cash realisation is zero", () => {
    const result = calculateComparison(scenario({ automatedTaskHours: 100, retainedSupportHours: 200, cashRealisationPercent: 0, deploymentDelayMonths: 0, rampMonths: 1 }));
    expect(result.additionalPaidHours).toBe(100);
    expect(result.options.raas.series[1].labourCashSaving).toBe(-3250);
    expect(result.options.raas.steadyMonthlyBenefit).toBe(-9750);
  });
  it("uses only documented idle capacity to offset additional payroll", () => {
    const result = calculateComparison(scenario({ automatedTaskHours: 100, retainedSupportHours: 200, confirmedIdleHours: 30, cashRealisationPercent: 0 }));
    expect(result.additionalPaidHours).toBe(70);
    expect(result.options.raas.steadyMonthlyBenefit).toBe(-8775);
  });
  it("does not generate labour benefits when no work is automated", () => {
    const result = calculateComparison(scenario({ automatedTaskHours: 0, retainedSupportHours: 0, cashRealisationPercent: 100 }));
    expect(result.options.raas.series.every((row) => row.labourCashSaving === 0)).toBe(true);
    expect(result.options.raas.steadyMonthlyBenefit).toBe(-6500);
  });
  it("ties sensitivity only to the explicitly disclosed staffing assumption", () => {
    const cases = calculateStaffingSensitivity(scenario());
    expect(cases.map((item) => item.cashRealisationPercent)).toEqual([0, 50, 100]);
    expect(cases.map((item) => item.result.netTaskHoursReleased)).toEqual([415.68, 415.68, 415.68]);
  });
  it("preserves opening rates and applies each escalation separately after month one", () => {
    const s = scenario({ cashRealisationPercent: 100, deploymentDelayMonths: 0, rampMonths: 1, labourEscalationPercent: 10, feeEscalationPercent: 20, operatingEscalationPercent: 30 });
    const rows = calculateComparison(s).options.raas.series;
    expect(rows[1].labourCashSaving).toBeCloseTo(13509.6, 8);
    expect(rows[1].systemCashCost).toBe(6500);
    expect(rows[13].labourCashSaving).toBeCloseTo(13509.6 * 1.1, 8);
    expect(rows[13].systemCashCost).toBeCloseTo(6000 * 1.2 + 500 * 1.3, 8);
  });
  it("separates billing start from the benefit ramp and customer operating costs", () => {
    const rows = calculateComparison(scenario({ raasBillingStartMonth: 4 })).options.raas.series;
    expect(rows[1].systemCashCost).toBe(500);
    expect(rows[2].labourCashSaving).toBeGreaterThan(0);
    expect(rows[4].systemCashCost).toBe(6500);
  });
  it("uses each quoted subscription fee at the start of its own contract period", () => {
    const rows = calculateComparison(scenario({ horizonMonths: 60, raasBillingStartMonth: 4, renewRaasAfterContract: true, raasRenewalMonthlyFee: 8000, feeEscalationPercent: 20 })).options.raas.series;
    expect(rows[4].systemCashCost).toBe(6500);
    expect(rows[16].systemCashCost).toBeCloseTo(6000 * 1.2 + 500, 8);
    expect(rows[40].systemCashCost).toBe(8500);
    expect(rows[52].systemCashCost).toBeCloseTo(8000 * 1.2 + 500, 8);
  });
});

describe("payback, contracts and terminal values", () => {
  it("never calls zero-upfront recurring losses immediate payback", () => {
    const result = calculateComparison(scenario({ raasSetup: 0, cashRealisationPercent: 0 })).options.raas;
    expect(result.paybackMonth).toBeNull();
    expect(result.paybackStatus).toBe("no-upfront-ongoing-loss");
  });
  it("recovers a real rollout deficit even when there is no upfront payment", () => {
    const result = calculateComparison(scenario({ raasSetup: 0, cashRealisationPercent: 100 })).options.raas;
    expect(result.series[1].cumulativeCashFlow).toBe(-6500);
    expect(result.paybackMonth).toBe(4);
    expect(result.paybackStatus).toBe("recovered");
  });
  it("distinguishes a no-deficit case from payback on an investment", () => {
    const result = calculateComparison(scenario({ raasSetup: 0, cashRealisationPercent: 100, deploymentDelayMonths: 0, rampMonths: 1 })).options.raas;
    expect(result.paybackMonth).toBeNull();
    expect(result.paybackStatus).toBe("cash-positive-from-start");
  });
  it("flags a later return below zero after first recovery", () => {
    const result = calculateComparison(scenario({ cashRealisationPercent: 100, raasExitCost: 500000 })).options.raas;
    expect(result.paybackMonth).toBe(7);
    expect(result.fallsNegativeAfterPayback).toBe(true);
    expect(result.netCashBenefit).toBeLessThan(0);
  });
  it("requires explicit renewal when the study outlasts the contract", () => {
    expect(validateInputs(scenario({ horizonMonths: 60 })).some((issue) => issue.field === "renewRaasAfterContract")).toBe(true);
    expect(() => calculateComparison(scenario({ horizonMonths: 60 }))).toThrow(RoiValidationError);
    const rows = calculateComparison(scenario({ horizonMonths: 60, renewRaasAfterContract: true, raasRenewalMonthlyFee: 8000 })).options.raas.series;
    expect(rows[36].systemCashCost).toBe(6500);
    expect(rows[37].systemCashCost).toBe(8500);
  });
  it("discloses future commitments without pretending they are paid inside the horizon", () => {
    const result = calculateComparison(scenario({ horizonMonths: 12 }));
    expect(result.options.raas.committedFeesBeyondHorizon).toBe(24 * 6000);
    expect(result.options.raas.series).toHaveLength(13);
    expect(result.warnings.some((text) => text.includes("beyond the study horizon"))).toBe(true);
  });
  it("counts actual initial and terminal payments exactly once", () => {
    const a = calculateComparison(scenario()).options.purchase;
    const b = calculateComparison(scenario({ purchaseSetup: 10000, purchaseResidualValue: 5000, purchaseExitCost: 2000 })).options.purchase;
    expect(b.series[0].incrementalCashFlow - a.series[0].incrementalCashFlow).toBe(-10000);
    expect(b.series[36].incrementalCashFlow - a.series[36].incrementalCashFlow).toBe(3000);
    expect(b.netCashBenefit - a.netCashBenefit).toBeCloseTo(-7000, 7);
  });
  it("uses a discount rate of zero as an undiscounted comparison", () => {
    const result = calculateComparison(scenario({ annualDiscountPercent: 0 }));
    expect(result.options.raas.npv).toBeCloseTo(result.options.raas.netCashBenefit, 8);
  });
});

describe("validation and reproducible scenario exports", () => {
  it.each([
    { hourlyCashCost: NaN }, { baselineTaskHours: Infinity }, { raasSetup: -1 },
    { horizonMonths: 36.5 }, { horizonMonths: 121 }, { cashRealisationPercent: 101 },
    { automatedTaskHours: 2000 }, { otherCashSavingsMonthly: 1 }, { purchaseResidualValue: 200000 },
  ])("rejects invalid scenario %j", (changes) => {
    expect(validateInputs(scenario(changes)).length).toBeGreaterThan(0);
  });
  it("round-trips inputs and the exact model version", () => {
    const s = scenario({ currency: "CHF", numberLocale: "de-CH" });
    expect(JSON.parse(serializeScenario(s)).modelVersion).toBe(MODEL_VERSION);
    expect(deserializeScenario(serializeScenario(s))).toEqual(s);
  });
  it("returns validation issues for malformed enum objects without executing coercion", () => {
    expect(validateInputs({ ...scenario(), currency: { toString: null } }).some((issue) => issue.field === "currency")).toBe(true);
  });
  it("rejects unsupported scenario versions", () => {
    expect(() => deserializeScenario(JSON.stringify({ modelVersion: "0.1", inputs: scenario() }))).toThrow(RoiValidationError);
  });
  it("ignores unsupported imported fields and does not mutate inputs", () => {
    const s = scenario();
    const before = JSON.stringify(s);
    calculateComparison(s);
    expect(JSON.stringify(s)).toBe(before);
    const imported = deserializeScenario(JSON.stringify({ modelVersion: MODEL_VERSION, inputs: { ...s, surprise: "ignored" } }));
    expect("surprise" in imported).toBe(false);
  });
  it("does not silently convert amounts when the display currency changes", () => {
    const usd = calculateComparison(scenario());
    const chf = calculateComparison(scenario({ currency: "CHF" }));
    expect(chf.options.raas.netCashBenefit).toBe(usd.options.raas.netCashBenefit);
  });
});
