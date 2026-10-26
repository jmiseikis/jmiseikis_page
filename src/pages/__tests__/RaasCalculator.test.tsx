import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import RaasCalculator from "../RaasCalculator";
import { DEFAULT_INPUTS, MODEL_VERSION, type RoiInputs } from "@/lib/robotics-roi";

const STORAGE_KEY = `jmiseikis.robotics-roi.v${MODEL_VERSION}`;
const STEP_NAMES = ["Today's work", "Robot & people", "Supplier offers", "Timing & results"] as const;
const renderPage = () => render(
  <HelmetProvider><MemoryRouter initialEntries={["/raas-calculator"]}><RaasCalculator /></MemoryRouter></HelmetProvider>,
);
const stepButton = (step: number) => within(screen.getByRole("navigation", { name: "Calculator steps" }))
  .getByRole("button", { name: STEP_NAMES[step], exact: true });
const go = (step: number) => fireEvent.click(stepButton(step));
const field = (name: string) => screen.getByRole("textbox", { name, exact: true });
const change = (name: string, value: string) => fireEvent.change(field(name), { target: { value } });
const chooseStaffing = (name: RegExp) => fireEvent.click(screen.getByRole("radio", { name }));
const metric = (name: string) => {
  const term = screen.getAllByRole("term").find((element) => element.textContent?.replace(/\s+/g, " ").trim() === name);
  expect(term, `Visible metric '${name}'`).toBeDefined();
  return within(term!.parentElement!).getByRole("definition");
};
const tableRow = (name: RegExp) => within(
  screen.getByRole("region", { name: "Option comparison, scroll horizontally if needed" }),
).getByRole("row", { name });
const openDetails = (name: RegExp) => fireEvent.click(screen.getByText(name, { selector: "summary" }));
const savedScenario = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
const saveScenario = () => {
  go(3);
  fireEvent.click(screen.getByRole("button", { name: "Save in this browser", exact: true }));
  return savedScenario();
};
const importScenario = async (payload: unknown) => {
  fireEvent.click(screen.getByRole("button", { name: "Import a scenario", exact: true }));
  const text = JSON.stringify(payload);
  const file = new File([text], "scenario.json", { type: "application/json" });
  Object.defineProperty(file, "text", { value: () => Promise.resolve(text) });
  // The visible import button opens this deliberately hidden native file control.
  fireEvent.change(screen.getByLabelText("Import a scenario JSON file"), { target: { files: [file] } });
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/Scenario imported|Could not import/));
};
const readBlob = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(reader.error);
  reader.readAsText(blob);
});

beforeEach(() => window.localStorage.clear());
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("Guided robotics cost and ROI calculator", () => {
  it("provides four navigable steps and preserves inputs through Continue and Back", () => {
    renderPage();
    const nav = screen.getByRole("navigation", { name: "Calculator steps" });
    expect(within(nav).getAllByRole("button")).toHaveLength(4);
    expect(stepButton(0)).toHaveAttribute("aria-current", "step");
    expect(screen.queryByRole("textbox", { name: "Monthly subscription", exact: true })).not.toBeInTheDocument();
    change("Staff time each month", "800");
    for (let next = 1; next <= 3; next++) {
      fireEvent.click(screen.getByRole("button", { name: /^Continue:/ }));
      expect(stepButton(next)).toHaveAttribute("aria-current", "step");
    }
    expect(screen.getByRole("heading", { name: "Your comparison", exact: true })).toBeInTheDocument();
    for (let previous = 2; previous >= 0; previous--) {
      fireEvent.click(screen.getByRole("button", { name: "← Back", exact: true }));
      expect(stepButton(previous)).toHaveAttribute("aria-current", "step");
    }
    expect(field("Staff time each month")).toHaveValue("800");
  });

  it("shows an explicitly illustrative comparison with the unchanged 50% staffing result", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Robotics cost & ROI calculator.");
    expect(screen.getByText("Illustrative example", { selector: ".roi-badge" })).toBeInTheDocument();
    go(1);
    expect(field("Share of freed time that cuts paid costs")).toHaveValue("50");
    go(3);
    expect(metric("RaaS net cash over 36 months")).toHaveTextContent("-$22,648");
    expect(metric("RaaS cash payback")).toHaveTextContent("Not within 36 months");
    expect(tableRow(/^NPV at 8%/)).toHaveTextContent("-$23,538");
    expect(screen.getByText("415.68 h")).toBeInTheDocument();
    expect(screen.getByText("207.84 h")).toBeInTheDocument();
    expect(tableRow(/^Upfront cash/)).toHaveTextContent("$150,000");
    expect(tableRow(/^Upfront cash/)).toHaveTextContent("$20,000");
  });

  it("changes financial results when all released hours become avoided paid work", () => {
    renderPage();
    go(1);
    chooseStaffing(/^Reduce all freed paid hours/);
    go(3);
    expect(metric("RaaS net cash over 36 months")).toHaveTextContent("$208,704");
    expect(metric("RaaS cash payback")).toHaveTextContent("Month 7");
    expect(tableRow(/^NPV at 8%/)).toHaveTextContent("$181,206");
    expect(tableRow(/^Cash payback/)).toHaveTextContent("Month 14");
    expect(screen.getByRole("img", { name: /Cumulative cash benefit/ })).toHaveAccessibleDescription(
      /month 36, RaaS has a cumulative benefit of \$208,704/,
    );
  });

  it("accepts grouped numbers without silently turning setup into zero", () => {
    renderPage();
    for (const value of ["20,000", "20'000", "20000.00"]) {
      go(2);
      change("RaaS setup payment", value);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      go(3);
      expect(tableRow(/^Upfront cash/)).toHaveTextContent("$20,000");
      expect(metric("RaaS net cash over 36 months")).toHaveTextContent("-$22,648");
    }
  });

  it("pauses results and exports while an input is invalid", () => {
    renderPage();
    go(2);
    change("Monthly subscription", "6000garbage");
    expect(field("Monthly subscription")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a complete number");
    go(3);
    expect(screen.getByRole("heading", { name: "Results are paused." })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /Cumulative cash benefit/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export scenario/ })).toBeDisabled();
    go(2);
    change("Monthly subscription", "6000");
    go(3);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(metric("RaaS net cash over 36 months")).toHaveTextContent("-$22,648");
  });

  it("does not present zero upfront cost as positive payback during recurring losses", () => {
    renderPage();
    go(1);
    chooseStaffing(/^Keep paid hours/);
    go(2);
    change("RaaS setup payment", "0");
    go(3);
    expect(metric("RaaS cash payback")).toHaveTextContent("No upfront fee; ongoing loss");
    expect(metric("RaaS net cash over 36 months")).toHaveTextContent("-$234,000");
    expect(screen.queryByText(/Immediate ROI/)).not.toBeInTheDocument();
  });

  it("requires explicit renewal for 60 months without automatically extending the quoted contract", () => {
    renderPage();
    go(3);
    fireEvent.click(within(screen.getByRole("group", { name: "Comparison period" })).getByRole("button", { name: /5 years/ }));
    expect(field("Quoted contract length")).toHaveValue("36");
    expect(screen.getByRole("alert")).toHaveTextContent("The study extends beyond the RaaS contract");
    expect(screen.getByRole("heading", { name: "Results are paused." })).toBeInTheDocument();
    const renewal = screen.getByRole("checkbox", { name: "Assume service continues after the initial contract", exact: true });
    expect(renewal).not.toBeChecked();
    fireEvent.click(renewal);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(field("Monthly fee after renewal")).toHaveValue("6000");
    expect(field("Quoted contract length")).toHaveValue("36");
    expect(metric("RaaS net cash over 60 months")).toBeInTheDocument();
    expect(screen.getAllByText(/not a confirmed renewal offer/).length).toBeGreaterThan(0);
  });

  it("reformats numbers when decimal convention changes without converting currencies", () => {
    renderPage();
    fireEvent.change(screen.getByRole("combobox", { name: "Currency", exact: true }), { target: { value: "CHF" } });
    go(2);
    expect(field("RaaS setup payment")).toHaveValue("20000");
    go(3);
    expect(metric("RaaS net cash over 36 months")).toHaveTextContent(/CHF\s?22,648/);
    go(0);
    fireEvent.change(screen.getByRole("combobox", { name: "Number format", exact: true }), { target: { value: "de-DE" } });
    expect(field("Staff time each month")).toHaveValue("1039,2");
    expect(field("Cost per paid staff hour")).toHaveValue("32,5");
    go(2);
    change("RaaS setup payment", "20.000,50");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(field("RaaS setup payment")).toHaveValue("20.000,50");
  });

  it("saves only on request and restores or deletes the versioned scenario", () => {
    renderPage();
    expect(window.localStorage.length).toBe(0);
    const saved = saveScenario();
    expect(saved.modelVersion).toBe(MODEL_VERSION);
    expect(saved.inputs.cashRealisationPercent).toBe(50);
    go(1);
    chooseStaffing(/^Reduce all freed paid hours/);
    go(3);
    fireEvent.click(screen.getByRole("button", { name: "Load saved", exact: true }));
    expect(metric("RaaS net cash over 36 months")).toHaveTextContent("-$22,648");
    go(1);
    expect(field("Share of freed time that cuts paid costs")).toHaveValue("50");
    go(3);
    fireEvent.click(screen.getByRole("button", { name: "Delete saved", exact: true }));
    expect(window.localStorage.length).toBe(0);
    expect(metric("RaaS net cash over 36 months")).toHaveTextContent("-$22,648");
  });

  it("repairs a decimal-comma entry without reinterpreting other valid values", () => {
    renderPage();
    change("Cost per paid staff hour", "25,50");
    go(2);
    change("RaaS setup payment", "20,000");
    go(3);
    expect(screen.getByRole("heading", { name: "Results are paused." })).toBeInTheDocument();
    go(0);
    fireEvent.change(screen.getByRole("combobox", { name: "Number format", exact: true }), { target: { value: "de-DE" } });
    expect(field("Cost per paid staff hour")).toHaveValue("25,50");
    expect(field("Staff time each month")).toHaveValue("1039,2");
    go(2);
    expect(field("RaaS setup payment")).toHaveValue("20000");
    go(3);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(tableRow(/^Monthly cash cost at full operation/)).toHaveTextContent("26.500");
    expect(metric("RaaS net cash over 36 months")).toBeInTheDocument();
  });

  it("rejects unsupported imports while retaining the valid current example", async () => {
    renderPage();
    await importScenario({ modelVersion: "0", inputs: {} });
    expect(screen.getByRole("status")).toHaveTextContent(/unsupported model version/);
    go(3);
    expect(metric("RaaS net cash over 36 months")).toHaveTextContent("-$22,648");
  });

  it("explains the scope and offers an assessment without a lead-form gate", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "A business case you can inspect." })).toBeInTheDocument();
    expect(screen.getByText(/Metered tariffs, seasonal workloads/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Discuss the business case/ })).toHaveAttribute("href", "/?enquiry=diligence#contact");
    expect(screen.queryByRole("textbox", { name: /email/i })).not.toBeInTheDocument();
  });

  it("switches daily and monthly entry without changing hours or financial results", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Daily schedule", exact: true }));
    expect(field("Combined staff hours per day")).toHaveValue("51.96");
    expect(field("Working days per month")).toHaveValue("20");
    go(3);
    expect(metric("RaaS net cash over 36 months")).toHaveTextContent("-$22,648");
    go(0);
    fireEvent.click(screen.getByRole("button", { name: "Monthly total", exact: true }));
    expect(field("Staff time each month")).toHaveValue("1039.2");
    expect(saveScenario().inputs).toEqual(DEFAULT_INPUTS);
  });

  it("converts aggregate daily hours using explicit days and offers a 31-day limit repair", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Daily schedule", exact: true }));
    change("Combined staff hours per day", "48");
    change("Working days per month", "21.65");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(saveScenario().inputs.baselineTaskHours).toBeCloseTo(1039.2, 10);
    expect(metric("RaaS net cash over 36 months")).toHaveTextContent("-$22,648");
    go(0);
    change("Working days per month", "32");
    expect(screen.getByRole("alert")).toHaveTextContent("between 1 and 31 working days");
    fireEvent.click(screen.getByRole("button", { name: "Use the maximum: 31 days", exact: true }));
    expect(field("Working days per month")).toHaveValue("31");
    expect(field("Combined staff hours per day")).toHaveValue("48");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(saveScenario().inputs.baselineTaskHours).toBe(1488);
  });

  it("keeps the coverage slider, exact hours and share conversion in sync", () => {
    renderPage();
    go(1);
    fireEvent.change(screen.getByRole("slider", { name: "Share of the task the robot handles slider", exact: true }), { target: { value: "62.5" } });
    expect(field("Share of the task the robot handles")).toHaveValue("62.5");
    fireEvent.click(screen.getByRole("button", { name: "Exact hours", exact: true }));
    expect(field("Work the robot takes over")).toHaveValue("649.5");
    change("Work the robot takes over", "400");
    fireEvent.click(screen.getByRole("button", { name: "Share of the task", exact: true }));
    expect(Number((field("Share of the task the robot handles") as HTMLInputElement).value)).toBeCloseTo(400 / 1039.2 * 100, 12);
    expect(saveScenario().inputs.automatedTaskHours).toBe(400);
  });

  it("requires an explicit repair for a typed coverage above 100 percent", () => {
    renderPage();
    go(1);
    change("Share of the task the robot handles", "101");
    expect(field("Share of the task the robot handles")).toHaveValue("101");
    expect(screen.getByRole("alert")).toHaveTextContent("Use 0–100% of the current task");
    fireEvent.click(screen.getByRole("button", { name: "Use the maximum: 100 %", exact: true }));
    expect(field("Share of the task the robot handles")).toHaveValue("100");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(saveScenario().inputs.automatedTaskHours).toBe(1039.2);
  });

  it("allows support above automated work and retains its extra payroll cost", () => {
    renderPage();
    go(1);
    fireEvent.click(screen.getByRole("button", { name: "Exact hours", exact: true }));
    change("Work the robot takes over", "100");
    change("Staff help the robot still needs", "200");
    chooseStaffing(/^Keep paid hours/);
    expect(field("Staff help the robot still needs")).toHaveValue("200");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("adds 100 staff hours a month")).toBeInTheDocument();
    go(3);
    expect(tableRow(/^Monthly benefit at full operation/)).toHaveTextContent("-$9,750");
    expect(screen.getByText(/Additional paid support required: 100 hours\/month/)).toBeInTheDocument();
    expect(saveScenario().inputs.retainedSupportHours).toBe(200);
  });

  it("maps some, none and all staffing choices while retaining the custom partial percentage", () => {
    renderPage();
    go(1);
    change("Share of freed time that cuts paid costs", "23.75");
    chooseStaffing(/^Keep paid hours/);
    expect(screen.queryByRole("textbox", { name: "Share of freed time that cuts paid costs", exact: true })).not.toBeInTheDocument();
    expect(saveScenario().inputs.cashRealisationPercent).toBe(0);
    go(1);
    chooseStaffing(/^Reduce all freed paid hours/);
    expect(saveScenario().inputs.cashRealisationPercent).toBe(100);
    go(1);
    chooseStaffing(/^Reduce some paid hours/);
    expect(field("Share of freed time that cuts paid costs")).toHaveValue("23.75");
    expect(saveScenario().inputs.cashRealisationPercent).toBe(23.75);
  });

  it("opens the owning hidden step and focuses its field when an error is selected", async () => {
    renderPage();
    go(2);
    change("Monthly subscription", "invalid");
    go(0);
    expect(screen.queryByRole("textbox", { name: "Monthly subscription", exact: true })).not.toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("alert")).getByRole("button", { name: /^Monthly subscription:/ }));
    await waitFor(() => expect(field("Monthly subscription")).toHaveFocus());
    expect(stepButton(2)).toHaveAttribute("aria-current", "step");
    fireEvent.click(screen.getByRole("button", { name: /^Continue:/ }));
    expect(stepButton(2)).toHaveAttribute("aria-current", "step");
  });

  it("keeps invalid daily input visible instead of restoring a stale monthly amount", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Daily schedule", exact: true }));
    change("Working days per month", "32");
    fireEvent.click(screen.getByRole("button", { name: "Monthly total", exact: true }));
    expect(screen.getByRole("button", { name: "Daily schedule", exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(field("Working days per month")).toHaveValue("32");
    expect(screen.getByRole("alert")).toHaveTextContent("between 1 and 31");
  });

  it("keeps invalid coverage visible instead of restoring stale exact hours", () => {
    renderPage();
    go(1);
    change("Share of the task the robot handles", "101");
    fireEvent.click(screen.getByRole("button", { name: "Exact hours", exact: true }));
    expect(screen.getByRole("button", { name: "Share of the task", exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(field("Share of the task the robot handles")).toHaveValue("101");
    expect(screen.getByRole("alert")).toHaveTextContent("Use 0–100%");
  });

  it("keeps an invalid renewal fee repairable after renewal is unchecked and the horizon shortened", () => {
    renderPage();
    go(3);
    const period = screen.getByRole("group", { name: "Comparison period" });
    fireEvent.click(within(period).getByRole("button", { name: /5 years/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Assume service continues after the initial contract", exact: true }));
    change("Monthly fee after renewal", "-1");
    fireEvent.click(screen.getByRole("checkbox", { name: "Assume service continues after the initial contract", exact: true }));
    fireEvent.click(within(period).getByRole("button", { name: /3 years/ }));
    expect(field("Monthly fee after renewal")).toHaveValue("-1");
    expect(screen.getByRole("checkbox", { name: "Assume service continues after the initial contract", exact: true })).not.toBeChecked();
    expect(screen.getByRole("alert")).toHaveTextContent("Monthly fee after renewal");
    change("Monthly fee after renewal", "6000");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(metric("RaaS net cash over 36 months")).toHaveTextContent("-$22,648");
  });

  it("preserves imported canonical inputs through display changes, navigation, saving and export", async () => {
    const imported: RoiInputs = {
      ...DEFAULT_INPUTS, currency: "CHF", baselineTaskHours: 1243.210987654321,
      automatedTaskHours: 345.6789012345678, retainedSupportHours: 16.23456789,
      cashRealisationPercent: 23.75, baselineOtherMonthlyCost: 500.25,
      otherCashSavingsMonthly: 101.25, additionalContributionMonthly: 300.75,
      horizonMonths: 47, deploymentDelayMonths: 4, rampMonths: 7, firstRampPercent: 33.333,
      labourSavingsStartMonth: 8, operatingCostsStartMonth: 2, raasBillingStartMonth: 3,
      raasContractMonths: 18, renewRaasAfterContract: true, raasRenewalMonthlyFee: 6789.12,
      purchaseSetup: 4321.25, purchaseResidualValue: 18000, purchaseExitCost: 321.5,
      raasExitCost: 190.25, annualDiscountPercent: 9.5, labourEscalationPercent: 2.25,
      feeEscalationPercent: 3.25, operatingEscalationPercent: 1.5,
    };
    const context = { application: "Machine tending", evidence: "Supplier quote", note: "Quote reference ABC-17" };
    renderPage();
    await importScenario({ modelVersion: MODEL_VERSION, inputs: imported, context, showPurchase: false });
    expect(field("Staff time each month")).toHaveValue(String(imported.baselineTaskHours));
    fireEvent.click(screen.getByRole("button", { name: "Daily schedule", exact: true }));
    go(1);
    expect(field("Work the robot takes over")).toHaveValue(String(imported.automatedTaskHours));
    fireEvent.click(screen.getByRole("button", { name: "Share of the task", exact: true }));
    go(2);
    expect(screen.getByRole("checkbox", { name: "Also compare buying the system", exact: true })).not.toBeChecked();
    go(3);
    expect(field("Months to compare")).toHaveValue("47");
    expect(field("Months to reach full performance")).toHaveValue("7");
    openDetails(/Adjust payment and staffing dates/);
    expect(field("First month paid costs can fall")).toHaveValue("8");
    go(0);
    fireEvent.click(screen.getByRole("button", { name: "Monthly total", exact: true }));
    go(1);
    fireEvent.click(screen.getByRole("button", { name: "Exact hours", exact: true }));
    const saved = saveScenario();
    expect(saved.inputs).toEqual(imported);
    expect(saved.context).toEqual(context);
    expect(saved.showPurchase).toBe(false);
    const createObjectURL = vi.fn((_blob: Blob) => "blob:scenario-export");
    const OriginalURL = URL;
    class DownloadURL extends OriginalURL {
      static createObjectURL = createObjectURL;
      static revokeObjectURL = vi.fn();
    }
    vi.stubGlobal("URL", DownloadURL);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    fireEvent.click(screen.getByRole("button", { name: /Export scenario/ }));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const exported = JSON.parse(await readBlob(createObjectURL.mock.calls[0][0]));
    expect(exported.inputs).toEqual(imported);
    expect(exported.context).toEqual(context);
    expect(exported.showPurchase).toBe(false);
  });
});
