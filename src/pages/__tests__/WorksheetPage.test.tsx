import { beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import WorksheetPage from "../WorksheetPage";
import { WORKSHEET_LIST, worksheetPdf, type WorksheetSlug } from "@/content/worksheets";
import { contactPath } from "@/lib/site";

const renderSheet = (slug: WorksheetSlug) =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <WorksheetPage slug={slug} />
      </MemoryRouter>
    </HelmetProvider>,
  );

const KEY = "jm-worksheet:technical-diligence-checklist:v1";

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

describe("Worksheet pages", () => {
  it.each(WORKSHEET_LIST.map((s) => s.slug))("%s has its blank PDF and every section", (slug) => {
    expect(existsSync(join(process.cwd(), "public", worksheetPdf(slug)))).toBe(true);
    renderSheet(slug);
    expect(screen.getByRole("link", { name: "Download printable PDF" })).toHaveAttribute("href", worksheetPdf(slug));
    for (const field of WORKSHEET_LIST.find((s) => s.slug === slug)!.fields) {
      expect(screen.getAllByText(field.label).length).toBeGreaterThan(0);
    }
  });

  it("offers a contextual enquiry that never carries the answers", () => {
    renderSheet("technical-diligence-checklist");
    fireEvent.change(screen.getByRole("textbox", { name: "Material risks" }), { target: { value: "Confidential note" } });
    const link = screen.getByRole("link", { name: "Discuss this brief" });
    expect(link).toHaveAttribute("href", contactPath("diligence"));
    expect(link.getAttribute("href")).not.toMatch(/Confidential/);
  });

  it("saves answers in this browser only and restores them", () => {
    const { unmount } = renderSheet("technical-diligence-checklist");
    fireEvent.change(screen.getByRole("textbox", { name: "Material risks" }), { target: { value: "Single customer" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /Problem, user and why/ }));
    fireEvent.change(screen.getByRole("combobox", { name: "Status" }), { target: { value: "Reported" } });
    expect(JSON.parse(localStorage.getItem(KEY)!)).toMatchObject({ risks: "Single customer", "early.0": true });
    unmount();

    renderSheet("technical-diligence-checklist");
    expect(screen.getByRole("textbox", { name: "Material risks" })).toHaveValue("Single customer");
    expect(screen.getByRole("checkbox", { name: /Problem, user and why/ })).toBeChecked();
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveValue("Reported");
  });

  it("adds and removes entries, and clears everything after confirmation", () => {
    renderSheet("technical-diligence-checklist");
    fireEvent.click(screen.getByRole("button", { name: "Add another entry" }));
    expect(screen.getAllByRole("combobox", { name: "Status" })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Remove entry 2" }));
    expect(screen.getAllByRole("combobox", { name: "Status" })).toHaveLength(1);

    fireEvent.change(screen.getByRole("textbox", { name: "Material risks" }), { target: { value: "x" } });
    vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole("button", { name: "Clear answers" }));
    expect(screen.getByRole("textbox", { name: "Material risks" })).toHaveValue("x");
    fireEvent.click(screen.getByRole("button", { name: "Clear answers" }));
    expect(screen.getByRole("textbox", { name: "Material risks" })).toHaveValue("");
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("prints from the browser and keeps working when storage is blocked", () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    renderSheet("ai-workflow-pilot-brief");
    fireEvent.change(screen.getByRole("textbox", { name: "1. Process" }), { target: { value: "Invoice triage" } });
    expect(screen.getByRole("textbox", { name: "1. Process" })).toHaveValue("Invoice triage");
    expect(screen.getByText(/not saving answers here/)).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("form", { name: "AI workflow pilot brief" })).getByRole("button", { name: "Print or save as PDF" }));
    expect(print).toHaveBeenCalled();
  });
});
