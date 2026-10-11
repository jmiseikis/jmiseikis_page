import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import listSwissVcs from "../tools/list-swiss-vcs";
import listTechEvents from "../tools/list-tech-events";

const gvizFixture = (name: "events" | "vcs") => {
  const json = readFileSync(path.join(__dirname, "../../__tests__/fixtures", `${name}-sheet.json`), "utf8");
  return `/*O_o*/\ngoogle.visualization.Query.setResponse(${json.trim()});`;
};

const respondWith = (body: string, status = 200) =>
  vi.stubGlobal("fetch", vi.fn(async () => new Response(body, { status })));

// The tools do not read the auth context.
const ctx = {} as Parameters<typeof listTechEvents.handler>[1];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("list_tech_events", () => {
  it("returns named fields for every source row, including the first one", async () => {
    respondWith(gvizFixture("events"));
    const result = await listTechEvents.handler({ query: undefined, limit: 100 }, ctx);
    const { rows, total } = result.structuredContent as { rows: Record<string, unknown>[]; total: number };
    expect(result.isError).toBeUndefined();
    expect(total).toBe(44);
    expect(rows.filter((row) => row.name === "Swiss AI Summit")).toHaveLength(2);
    expect(rows.some((row) => "sourceVariants" in row || "canton" in row)).toBe(false);
    const wef = rows.find((row) => row.name === "World Economic Forum Annual Meeting");
    expect(wef).toMatchObject({
      startDate: "2026-01-19",
      finishDate: "2026-01-23",
      location: "Davos, GR",
      size: "Large",
      scope: "International",
      officialUrl: "https://www.weforum.org/",
    });
    expect(wef).not.toHaveProperty("ticketPrice");
  });

  it("marks past events using the Zurich calendar date, not UTC", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    // 23 January 23:30 UTC is already 24 January in Zurich, the day after WEF ends.
    vi.setSystemTime(new Date("2026-01-23T23:30:00Z"));
    respondWith(gvizFixture("events"));
    const result = await listTechEvents.handler({ query: "weforum", limit: undefined }, ctx);
    const { rows } = result.structuredContent as { rows: { name: string; past: boolean }[] };
    expect(rows).toMatchObject([{ name: "World Economic Forum Annual Meeting", past: true }]);
  });

  it("filters by query across all returned fields", async () => {
    respondWith(gvizFixture("events"));
    const byLocation = await listTechEvents.handler({ query: "davos", limit: undefined }, ctx);
    const davos = (byLocation.structuredContent as { rows: object[] }).rows;
    expect(davos.length).toBeGreaterThan(0);
    expect(davos.every((row) => JSON.stringify(row).toLowerCase().includes("davos"))).toBe(true);

    respondWith(gvizFixture("events"));
    const all = await listTechEvents.handler({ query: undefined, limit: 100 }, ctx);
    const international = (all.structuredContent as { rows: { scope: string }[] }).rows.filter(
      (row) => row.scope === "International",
    );
    const byScope = await listTechEvents.handler({ query: "international", limit: 100 }, ctx);
    const { rows } = byScope.structuredContent as { rows: { name: string; scope: string }[] };
    expect(international.length).toBeGreaterThan(1);
    expect(rows.filter((row) => row.scope === "International")).toHaveLength(international.length);
    expect(rows.map((row) => row.name)).toContain("World Economic Forum Annual Meeting");
  });

  it("reports a changed sheet layout as an error instead of an empty list", async () => {
    respondWith(gvizFixture("vcs"));
    const result = await listTechEvents.handler({ query: undefined, limit: undefined }, ctx);
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain("missing");
  });

  it("reports a failed request as an error", async () => {
    respondWith("", 503);
    const result = await listTechEvents.handler({ query: undefined, limit: undefined }, ctx);
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain("503");
  });
});

describe("list_swiss_vcs", () => {
  it("returns named fields and skips the header row", async () => {
    respondWith(gvizFixture("vcs"));
    const result = await listSwissVcs.handler({ query: undefined, limit: 100 }, ctx);
    const { rows, total } = result.structuredContent as { rows: Record<string, string>[]; total: number };
    expect(total).toBe(66);
    expect(rows[0]).toMatchObject({ name: "Verve Ventures", officialUrl: "https://verve.vc" });
    expect(rows.some((row) => row.name === "Name")).toBe(false);
  });

  it("filters by query across all fields", async () => {
    respondWith(gvizFixture("vcs"));
    const result = await listSwissVcs.handler({ query: "verve", limit: undefined }, ctx);
    const { rows } = result.structuredContent as { rows: { name: string }[] };
    expect(rows.map((row) => row.name)).toContain("Verve Ventures");
  });
});
