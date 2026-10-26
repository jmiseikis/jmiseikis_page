import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Term, { TERM_DEFINITIONS } from "../Term";

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("Term explanations", () => {
  it("opens on keyboard focus, exposes its description and dismisses with Escape", () => {
    render(<Term term="npv">NPV</Term>);
    const trigger = screen.getByRole("button", { name: "NPV" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.focus(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAccessibleDescription(`${TERM_DEFINITIONS.npv.label} ${TERM_DEFINITIONS.npv.description}`);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("lets a pointer move into the portal and keeps a clicked explanation open", () => {
    vi.useFakeTimers();
    const { container } = render(<Term term="payback">Payback</Term>);
    const trigger = screen.getByRole("button", { name: "Payback" });
    fireEvent.pointerEnter(trigger);
    const tooltip = screen.getByRole("tooltip");
    expect(container).not.toContainElement(tooltip);
    expect(document.body).toContainElement(tooltip);
    fireEvent.pointerLeave(trigger);
    fireEvent.pointerEnter(tooltip);
    act(() => vi.advanceTimersByTime(150));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.click(trigger);
    fireEvent.pointerLeave(tooltip);
    fireEvent.blur(trigger);
    act(() => vi.advanceTimersByTime(150));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("supports tap to open and an outside pointer to dismiss", () => {
    render(<><Term term="discountRate">Discount rate</Term><button>Elsewhere</button></>);
    const trigger = screen.getByRole("button", { name: "Discount rate" });
    fireEvent.click(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole("tooltip"));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Elsewhere" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes an unpinned explanation after focus and hover both leave", () => {
    vi.useFakeTimers();
    render(<Term term="baseline">Baseline</Term>);
    const trigger = screen.getByRole("button", { name: "Baseline" });
    fireEvent.focus(trigger);
    fireEvent.blur(trigger);
    act(() => vi.advanceTimersByTime(150));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
