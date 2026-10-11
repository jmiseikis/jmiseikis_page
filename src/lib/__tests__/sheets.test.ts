import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  EVENTS_REQUIRED,
  SheetFormatError,
  VCS_REQUIRED,
  combineExactEvents,
  gvizDate,
  isPastEvent,
  parseGviz,
  parseTable,
  toEvents,
  toInvestors,
  zurichToday,
} from "../sheets";

// Verbatim gviz snapshots of the three public sheets, taken on 6 October 2026.
const fixture = (name: "events" | "vcs" | "robotics") =>
  JSON.parse(readFileSync(path.join(__dirname, "fixtures", `${name}-sheet.json`), "utf8"));

const gviz = (body: unknown) => `/*O_o*/\ngoogle.visualization.Query.setResponse(${JSON.stringify(body)});`;

describe("events sheet (labels in table.cols)", () => {
  const sheet = parseTable(fixture("events").table, EVENTS_REQUIRED);

  it("keeps every source row, including the first event (WEF)", () => {
    expect(sheet.records).toHaveLength(44);
    expect(sheet.records[0].name).toBe("World Economic Forum Annual Meeting");
  });

  it("maps the columns after Official URL by header name", () => {
    const wef = sheet.records[0];
    expect(wef.officialUrl).toBe("https://www.weforum.org/");
    expect(wef.size).toBe("Large");
    expect(wef.targetAudience).toBe("Government and Business Leaders, Policymakers, Academics");
    expect(wef.scope).toBe("International");
    expect(wef.description).toContain("global agenda");
  });

  it("reports that the sheet has no ticket price column", () => {
    expect(sheet.availableFields).not.toContain("ticketPrice");
    const { events, hasTicketPrice } = toEvents(sheet);
    expect(hasTicketPrice).toBe(false);
    expect(events.every((event) => event.ticketPrice === undefined)).toBe(true);
  });

  it("combines the two identical Swiss AI Summit rows for display only", () => {
    const { events, sourceCount } = toEvents(sheet);
    expect(sourceCount).toBe(44);
    expect(events).toHaveLength(43);
    const combined = events.filter((event) => event.sourceVariants);
    expect(combined.map((event) => event.name)).toEqual(["Swiss AI Summit"]);
    expect(combined[0].sourceVariants).toHaveLength(1);
  });

  it("converts dates to calendar dates and sorts by start date", () => {
    const { events } = toEvents(sheet);
    const wef = events.find((event) => event.name === "World Economic Forum Annual Meeting");
    expect(wef).toMatchObject({ startDate: "2026-01-19", finishDate: "2026-01-23", canton: "GR" });
    expect(events.every((event) => /^\d{4}-\d{2}-\d{2}$/.test(event.startDate))).toBe(true);
    const starts = events.map((event) => event.startDate);
    expect(starts).toEqual([...starts].sort());
  });

  it("splits upcoming and past events on the Zurich calendar date", () => {
    const { events } = toEvents(sheet);
    expect(events.filter((event) => !isPastEvent(event, "2026-10-06"))).toHaveLength(7);
  });
});

describe("VC and robotics sheets (labels in the first row)", () => {
  it("reads all 66 investors and maps them by header name", () => {
    const sheet = parseTable(fixture("vcs").table, VCS_REQUIRED);
    const investors = toInvestors(sheet);
    expect(investors).toHaveLength(66);
    expect(investors[0]).toMatchObject({
      name: "Verve Ventures",
      investmentRounds: "Seed, Series A, Series B",
      officialUrl: "https://verve.vc",
    });
    expect(investors[0].description.length).toBeGreaterThan(20);
    expect(investors.some((investor) => investor.name === "Name")).toBe(false);
  });

  it("reads all 157 robotics organisations", () => {
    const sheet = parseTable(fixture("robotics").table, ["name", "type", "category", "description"]);
    expect(sheet.records).toHaveLength(157);
    expect(sheet.records[0]).toMatchObject({ name: "ABB Robotics", type: "Large Corp", headquarters: "Zurich" });
  });
});

describe("parseTable", () => {
  it("supports a legacy layout with a ticket price column", () => {
    const legacy = {
      cols: [{ label: "" }, { label: "" }],
      rows: [{ c: [{ v: "Event Name" }, { v: "Ticket Price" }] }, { c: [{ v: "Test event" }, { v: "Free" }] }],
    };
    const sheet = parseTable(legacy);
    expect(sheet.records).toEqual([{ name: "Test event", ticketPrice: "Free" }]);
    expect(toEvents(sheet).hasTicketPrice).toBe(true);
  });

  it("drops a repeated header row only when it is clearly one", () => {
    const table = {
      cols: [{ label: "Event Name" }, { label: "Location" }],
      rows: [
        { c: [{ v: "Event Name" }, { v: "Location" }] },
        { c: [{ v: "First event" }, { v: "Zurich, ZH" }] },
      ],
    };
    expect(parseTable(table).records.map((r) => r.name)).toEqual(["First event"]);
  });

  it("does not skip the first data row when labels are in table.cols", () => {
    const table = {
      cols: [{ label: "Event Name" }],
      rows: [{ c: [{ v: "First event" }] }, { c: [{ v: "Second event" }] }],
    };
    expect(parseTable(table).records.map((r) => r.name)).toEqual(["First event", "Second event"]);
  });

  it("throws a format error when the name column is missing", () => {
    expect(() => parseTable({ cols: [{ label: "Unknown" }], rows: [{ c: [{ v: "Unknown" }] }] })).toThrow(SheetFormatError);
  });

  it("throws a format error when a required events column is missing", () => {
    const table = {
      cols: ["Event Name", "Start Date", "Finish Date", "Location"].map((label) => ({ label })),
      rows: [],
    };
    expect(() => parseTable(table, EVENTS_REQUIRED)).toThrow(/missing: officialUrl/);
  });

  it("returns no records for an empty sheet without labels", () => {
    expect(parseTable({ cols: [{ label: "" }], rows: [] })).toEqual({ records: [], availableFields: [] });
  });
});

describe("parseGviz", () => {
  it("reads a gviz response", () => {
    const body = { status: "ok", table: { cols: [{ label: "Event Name" }], rows: [{ c: [{ v: "Test" }] }] } };
    expect(parseGviz(gviz(body)).records).toHaveLength(1);
  });

  it("rejects unrecognised or failed responses", () => {
    expect(() => parseGviz("not a response")).toThrow(SheetFormatError);
    expect(() => parseGviz(gviz({ status: "error", errors: [] }))).toThrow(SheetFormatError);
  });
});

describe("dates", () => {
  it("converts gviz dates with zero-based months", () => {
    expect(gvizDate("Date(2026,0,19)")).toBe("2026-01-19");
    expect(gvizDate("Date(2026,11,5)")).toBe("2026-12-05");
    expect(gvizDate("2026-03-04")).toBe("2026-03-04");
    expect(gvizDate("TBC")).toBe("");
  });

  it("uses the calendar date in Zurich, not UTC", () => {
    expect(zurichToday(new Date("2026-10-10T22:30:00Z"))).toBe("2026-10-11");
    expect(zurichToday(new Date("2026-12-31T23:30:00Z"))).toBe("2027-01-01");
    expect(zurichToday(new Date("2026-10-11T21:59:00Z"))).toBe("2026-10-11");
  });

  it("treats an event as upcoming until its finish date has passed", () => {
    const event = { startDate: "2026-10-09", finishDate: "2026-10-11" };
    expect(isPastEvent(event, "2026-10-11")).toBe(false);
    expect(isPastEvent(event, "2026-10-12")).toBe(true);
    expect(isPastEvent({ startDate: "", finishDate: "" }, "2026-10-12")).toBe(false);
  });
});

describe("combineExactEvents", () => {
  it("keeps events with the same name but different dates apart", () => {
    const base = { name: "Same", officialUrl: "https://example.com" };
    const events = [
      { ...base, startDate: "2026-01-01", finishDate: "2026-01-01" },
      { ...base, startDate: "2026-02-01", finishDate: "2026-02-01" },
    ];
    expect(combineExactEvents(events)).toHaveLength(2);
  });

  it("ignores a trailing slash and letter case in the URL", () => {
    const events = [
      { name: "Same", startDate: "2026-01-01", finishDate: "2026-01-01", officialUrl: "https://Example.com/" },
      { name: "same ", startDate: "2026-01-01", finishDate: "2026-01-01", officialUrl: "https://example.com" },
    ];
    expect(combineExactEvents(events)).toHaveLength(1);
  });
});
