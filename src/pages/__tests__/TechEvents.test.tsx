import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import TechEvents from "../TechEvents";

const eventsGviz = () => {
  const json = readFileSync(path.join(__dirname, "../../lib/__tests__/fixtures/events-sheet.json"), "utf8");
  return `google.visualization.Query.setResponse(${json.trim()});`;
};

const renderPage = () =>
  render(
    <HelmetProvider>
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <TechEvents />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );

afterEach(() => {
  vi.unstubAllGlobals();
  onlineManager.setOnline(true);
});

describe("TechEvents page", () => {
  it("shows the sheet's events without a price filter", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(eventsGviz())));
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderPage();
    expect(await screen.findByText(/duplicate listing combined/)).toBeInTheDocument();
    expect(screen.getByText("43")).toBeInTheDocument();
    expect(screen.queryByText("All Prices")).not.toBeInTheDocument();
  });

  it("explains a changed sheet format instead of showing an empty list", async () => {
    const body = { status: "ok", table: { cols: [{ label: "Event Name" }], rows: [{ c: [{ v: "Test" }] }] } };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(`google.visualization.Query.setResponse(${JSON.stringify(body)});`)));
    renderPage();
    expect(await screen.findByText(/changed format/)).toBeInTheDocument();
    expect(screen.queryByText("No events match your filters")).not.toBeInTheDocument();
  });

  it("says the visitor is offline instead of showing an empty list", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    onlineManager.setOnline(false);
    renderPage();
    expect(await screen.findByText(/appear to be offline/)).toBeInTheDocument();
    expect(screen.queryByText("No events match your filters")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
