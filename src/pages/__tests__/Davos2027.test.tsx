import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Davos2027 from "../Davos2027";

// FIXTURES ONLY: these responses stand in for Google in tests. They are the package's offline snapshot, never
// loaded by the page itself, and passing here is not evidence that the live sheet is reachable.
type Row = Record<string, string>;
const SNAPSHOT: Row[] = JSON.parse(readFileSync(join(process.cwd(), "tests/davos/fixtures/events.json"), "utf8"));
const COLUMNS = Object.keys(SNAPSHOT[0]);
const csv = (rows: Row[]) =>
  [COLUMNS, ...rows.map((row) => COLUMNS.map((key) => row[key] ?? ""))]
    .map((cells) => cells.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\r\n");
const ok = (rows: Row[]) => new Response(csv(rows), { status: 200, headers: { "Content-Type": "text/csv" } });

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/davos-2027"]}>
        <Davos2027 />
      </MemoryRouter>
    </HelmetProvider>,
  );

const first = SNAPSHOT[0].event_name;
const second = SNAPSHOT[1].event_name;

beforeEach(() => {
  localStorage.clear();
  // Fix the date inside the coverage window; timers stay real.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-10T09:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("/davos-2027", () => {
  it("reads the configured Events tab of the owner's sheet and replaces the static introduction", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(ok(SNAPSHOT));
    renderPage();
    expect(await screen.findByRole("heading", { level: 2, name: first })).toBeInTheDocument();
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.hostname).toBe("docs.google.com");
    expect(url.pathname).toBe("/spreadsheets/d/10LwgzJqUyUVuL-JI7DU2-oY29Qxbh7sgnbQFRdYU0YU/gviz/tq");
    expect(url.searchParams.get("sheet")).toBe("Events");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: "omit", cache: "no-store" });
    expect(screen.queryByText("Davos events during WEF 2027")).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText(/Sheet loaded at/)).toBeInTheDocument();
  });

  it("replaces the list on refresh, so unpublished and deleted rows disappear", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(ok(SNAPSHOT));
    renderPage();
    await screen.findByRole("heading", { level: 2, name: second });
    const unpublished = SNAPSHOT.map((row, index) => (index === 0 ? { ...row, published: "FALSE" } : row));
    fetchMock.mockResolvedValueOnce(ok(unpublished.filter((_, index) => index !== 1)));
    fireEvent.click(screen.getByRole("button", { name: "Refresh data" }));
    await waitFor(() => expect(screen.queryByRole("heading", { level: 2, name: first })).not.toBeInTheDocument());
    expect(screen.queryByRole("heading", { level: 2, name: second })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: SNAPSHOT[2].event_name })).toBeInTheDocument();
  });

  it("shows a labelled error, not the snapshot, when the sheet is not public", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("denied", { status: 403 }));
    renderPage();
    expect(await screen.findByText(/could not be loaded.*not available anonymously.*No unverified fallback/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: first })).not.toBeInTheDocument();
  });

  it("labels a recent local copy when a later refresh fails", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(ok(SNAPSHOT));
    renderPage();
    await screen.findByRole("heading", { level: 2, name: first });
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    fireEvent.click(screen.getByRole("button", { name: "Refresh data" }));
    expect(await screen.findByText(/Live refresh failed\. Showing the last successful local copy/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: first })).toBeInTheDocument();
  });

  it("cancels the request and the five-minute timer on unmount", async () => {
    let signal: AbortSignal | undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation((_url, init) => {
      signal = init?.signal ?? undefined;
      return new Promise(() => {});
    });
    const clear = vi.spyOn(window, "clearInterval");
    const { unmount } = renderPage();
    await waitFor(() => expect(signal).toBeDefined());
    unmount();
    expect(signal?.aborted).toBe(true);
    expect(clear).toHaveBeenCalled();
  });

  it("is kept out of search", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(ok(SNAPSHOT));
    renderPage();
    await waitFor(() => expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow"));
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "https://jmiseikis.com/davos-2027");
  });
});
