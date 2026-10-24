import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import RaasCalculator from "../RaasCalculator";

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/raas-calculator"]}>
        <RaasCalculator />
      </MemoryRouter>
    </HelmetProvider>,
  );

const metric = (label: string) => screen.getByText(label).parentElement!.querySelector("strong")!;
const field = (label: string) => screen.getByRole("spinbutton", { name: new RegExp(`^${label}`) });
const breakdownValue = (label: string) =>
  within(screen.getByRole("heading", { name: "First-month breakdown" }).nextElementSibling as HTMLElement).getByText(label)
    .nextElementSibling!.textContent;

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

describe("RaaS calculator page", () => {
  it("shows the corrected default scenario, with exact values behind the compact ones", () => {
    renderPage();
    expect(metric("Monthly cash benefit")).toHaveTextContent("$36,021");
    expect(metric("Cash payback")).toHaveTextContent("1 month");
    expect(metric("Cash ROI over contract")).toHaveTextContent("558%");
    expect(metric("Contract net cash gain")).toHaveTextContent("$1.32M");
    expect(metric("Contract net cash gain")).toHaveAttribute("title", "$1,316,696");

    // Base payroll is shown before benefits, and extra output is not counted as cash by default.
    expect(breakdownValue("Base payroll (before benefits)")).toBe("$25,980");
    expect(breakdownValue("Benefits & overhead")).toBe("$7,794");
    expect(breakdownValue("Robot subscription")).toBe("-$6,000");
    expect(breakdownValue("Additional operating costs")).toBe("$0");
    expect(breakdownValue("Extra productivity value (separate, not cash)")).toBe("$0");
    expect(screen.getByText(/0% realised, not shown/)).toBeInTheDocument();
  });

  it("keeps recognised productivity value out of the cash results", () => {
    renderPage();
    fireEvent.change(field("Incremental productivity value realised"), { target: { value: "100" } });
    expect(metric("Contract net cash gain")).toHaveAttribute("title", "$1,316,696");
    expect(breakdownValue("Extra productivity value (separate, not cash)")).toBe("$9,872");
    expect(screen.queryByText(/0% realised, not shown/)).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Cumulative cash position over 36 months/ })).toHaveAccessibleDescription(
      /Including recognised productivity value it ends at \$1,672,103\./,
    );
  });

  it("pauses on an invalid value, says why, and keeps the last valid results", () => {
    renderPage();
    const workers = field("Workers per shift affected");
    fireEvent.change(workers, { target: { value: "1.5" } });
    expect(workers).toHaveAttribute("aria-invalid", "true");
    expect(workers).toHaveAccessibleDescription(/Enter a value from 0 to 20 \(whole numbers\)\./);
    expect(screen.getByRole("status")).toHaveTextContent("Results paused: check one value above.");
    expect(metric("Monthly cash benefit")).toHaveTextContent("$36,021");

    fireEvent.change(workers, { target: { value: "" } });
    fireEvent.change(field("Robots deployed"), { target: { value: "0" } });
    expect(screen.getByRole("status")).toHaveTextContent("check 2 values above");

    fireEvent.change(workers, { target: { value: "0" } });
    fireEvent.change(field("Robots deployed"), { target: { value: "2" } });
    expect(screen.getByRole("status")).toHaveTextContent("Results updated.");
    // No labour affected: quality savings less the subscription.
    expect(metric("Monthly cash benefit")).toHaveTextContent("-$1,650");
    expect(metric("Cash payback")).toHaveTextContent("Not within term");
  });

  it("moves the slider and the number field together", () => {
    renderPage();
    fireEvent.change(screen.getByRole("slider", { name: "Shifts per day slider" }), { target: { value: "1" } });
    expect(field("Shifts per day")).toHaveValue(1);
    expect(breakdownValue("Base payroll (before benefits)")).toBe("$12,990");
  });

  it("relabels the currency without converting, and resets the scenario", () => {
    renderPage();
    fireEvent.change(screen.getByRole("combobox", { name: "Currency" }), { target: { value: "CHF" } });
    expect(metric("Monthly cash benefit")).toHaveTextContent(/CHF\s36,021/);
    expect(field("Hourly wage per worker")).toHaveAccessibleName(/CHF$/);

    fireEvent.change(field("Setup & integration cost"), { target: { value: "0" } });
    expect(metric("Cash payback")).toHaveTextContent("Immediate");

    fireEvent.click(screen.getByRole("button", { name: "Reset scenario" }));
    expect(screen.getByRole("combobox", { name: "Currency" })).toHaveValue("USD");
    expect(field("Setup & integration cost")).toHaveValue(20000);
    expect(metric("Cash payback")).toHaveTextContent("1 month");
  });

  it("labels the model change and leads to an assessment enquiry", () => {
    renderPage();
    const changes = screen.getByText("How this model changed (October 2026)").closest("details")!;
    expect(within(changes).getByText(/Earlier benchmark ranges were removed/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Discuss a robotics assessment/ })).toHaveAttribute(
      "href",
      "/?enquiry=diligence#contact",
    );
  });
});
