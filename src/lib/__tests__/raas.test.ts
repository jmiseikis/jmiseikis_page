import { describe, expect, it } from "vitest";
import { DEFAULT_SCENARIO as d, calculateScenario, type ScenarioInputs } from "@/lib/raas";

const near = (actual: number, expected: number) => expect(Math.abs(actual - expected)).toBeLessThan(1e-6);

describe("calculateScenario", () => {
  const base = calculateScenario(d);

  it("computes the baseline arithmetic with workers per shift", () => {
    near(base.base, 25980); // 3 x 25 x 2 shifts x 8 h x 5 days x 4.33
    near(base.overhead, 7794);
    near(base.turnover, 3897);
    near(base.labourAvoided, 37671);
    near(base.quality, 4350);
    near(base.cashMonthly, 36021);
    expect(base.payback).toBe(1);
    expect(base.series).toHaveLength(37);
    expect(base.productiveValue).toBe(0);
    near(base.cashGain, base.economicGain);
  });

  it("documents the default illustrative outcome", () => {
    expect(Math.round(base.cashGain * 100) / 100).toBe(1316696.31);
    expect(Math.round(base.roi!)).toBe(558);
  });

  it("treats the subscription as a cost when there are no cashable savings", () => {
    const r = calculateScenario({ ...d, labourRealisation: 0, errorReduction: 0, incidentReduction: 0, inflation: 0 });
    near(r.cashMonthly, -6000);
    near(r.cashGain, -236000);
    expect(r.payback).toBeNull();
    near(r.roi!, -100);
  });

  it("keeps extra output out of the cash view", () => {
    const r = calculateScenario({ ...d, productivityRealisation: 100 });
    near(r.cashGain, base.cashGain);
    near(r.productiveValue, 9872.4);
    near(r.economicGain - r.cashGain, 9872.4 * 36);
  });

  it("recovers setup on a whole-month cumulative cash basis", () => {
    const never = calculateScenario({ ...d, workers: 0, errors: 0, incidents: 0, subscription: 0, setup: 500, operations: 0 });
    expect(never.payback).toBeNull();
    near(never.cashGain, -500);
    near(never.roi!, -100);
  });

  it("returns an undefined ROI when nothing is invested", () => {
    const r = calculateScenario({ ...d, workers: 0, errors: 0, incidents: 0, subscription: 0, setup: 0, operations: 0 });
    expect(r.roi).toBeNull();
    expect(r.payback).toBe(0);
    near(r.cashGain, 0);
  });

  it("interprets staffing as workers per shift", () => {
    near(calculateScenario({ ...d, shifts: 1 }).base, base.base / 2);
  });

  it("subtracts additional operating costs every month", () => {
    const r = calculateScenario({ ...d, operations: 1000 });
    near(r.cashMonthly, base.cashMonthly - 1000);
    near(r.cashGain, base.cashGain - 36000);
  });

  it("reports no payback when setup is not recovered within the term", () => {
    const r = calculateScenario({
      ...d,
      workers: 0,
      subscription: 0,
      errors: 100,
      errorReduction: 100,
      incidents: 0,
      years: 1,
      setup: 20000,
      inflation: 0,
    });
    expect(r.payback).toBeNull();
    near(r.cashGain, -18800);
  });

  it("applies inflation from month 2 onwards", () => {
    const r = calculateScenario({ ...d, inflation: 10, years: 2 });
    const month1 = r.series[1].cash - r.series[0].cash;
    const month13 = r.series[13].cash - r.series[12].cash;
    near(month1, r.cashMonthly);
    near(month13 - month1, r.labourAvoided * 0.1);
  });

  it.each<[string, Partial<ScenarioInputs>]>([
    ["an invalid term", { years: 0 }],
    ["a non-numeric value", { wage: Number.NaN }],
    ["a negative input", { setup: -1 }],
    ["zero robots", { robots: 0 }],
    ["a percentage above 100", { labourRealisation: 101 }],
    ["a fractional worker count", { workers: 1.5 }],
  ])("rejects %s", (_label, change) => {
    expect(() => calculateScenario({ ...d, ...change })).toThrow();
  });

  it("rejects missing inputs", () => {
    expect(() => calculateScenario({} as ScenarioInputs)).toThrow();
  });
});
