import { describe, expect, it } from "vitest";
import {
  EVENTS_REQUIRED,
  SheetFormatError,
  combineExactEvents,
  compareEvents,
  gvizDate,
  isPastEvent,
  parseGviz,
  parseTable,
  toEvents,
  toInvestors,
  toRobotics,
  zurichToday,
} from "@/lib/sheets";

const cell = (v: unknown) => ({ v });
const row = (...values: unknown[]) => ({ c: values.map((v) => (v === null ? null : cell(v))) });

// Mirrors the live events sheet: real labels in table.cols, data from the first row,
// and Size/Target Audience/Local-International/Description after Official URL.
const eventsTable = {
  cols: [
    "Event Name",
    "Start Date",
    "Finish Date",
    "Location",
    "Category",
    "Official URL",
    "Size",
    "Target Audience",
    "Local/International",
    "One Paragraph Description",
    "New Addition",
    "",
  ].map((label) => ({ label })),
  rows: [
    row("World Economic Forum Annual Meeting", "Date(2026,0,19)", "Date(2026,0,23)", "Davos, GR", "Other", "https://www.weforum.org/", "Large", "Government and Business Leaders", "International", "The premier global agenda-setting event.", false, null),
    row("Swiss AI Summit", "Date(2026,10,16)", "Date(2026,10,16)", "Zurich, ZH", "Industry", "https://example.ch/summit", "Medium", "Executives", "Local", "First source row.", false, null),
    row("Swiss AI Summit", "Date(2026,10,16)", "Date(2026,10,16)", "Zurich, ZH", "Industry", "https://example.ch/summit/", "Medium", "Executives", "Local", "Duplicate source row.", true, null),
    row("Recurring Meetup", "Date(2026,2,1)", "Date(2026,2,1)", "Bern, BE", "Startup", "https://example.ch/meetup", "Small", "Founders", "Local", "March session.", false, null),
    row("Recurring Meetup", "Date(2026,5,1)", "Date(2026,5,1)", "Bern, BE", "Startup", "https://example.ch/meetup", "Small", "Founders", "Local", "June session.", false, null),
    row("Date To Be Announced", "", "", "Basel, BS", "Research", "https://example.ch/tba", "Small", "Researchers", "Local", "No date yet.", false, null),
    row(null, null, null, null, null, null, null, null, null, null, null, null),
  ],
};

// Mirrors the VC and robotics sheets: empty column labels, headers in the first row.
const vcsTable = {
  cols: Array.from({ length: 12 }, () => ({ label: "" })),
  rows: [
    row("Name", "Sector", "Investment Rounds", "Target Geography", "Target Audience", "Estimated Fund Size", "Official URL", "Crunchbase URL", "Pitchbook URL", "LinkedIn URL", "One Paragraph Description", "Column 1"),
    row("Verve Ventures", "DeepTech, Climate, Robotics", "Seed, Series A", "Europe", "B2B", "CHF 300 m+", "https://verve.vc", "https://www.crunchbase.com/organization/verve", "https://pitchbook.com/profiles/investor/verve", "https://www.linkedin.com/company/verve", "A science-led venture capital firm.", null),
    row("Second Fund", "AI", "Pre-seed", "Switzerland", "B2B", "-", "https://second.example", "", "", "", "Early-stage investor.", null),
  ],
};

const roboticsTable = {
  cols: Array.from({ length: 10 }, () => ({ label: "" })),
  rows: [
    row("Organisation Name", "Type", "Category", "Website", "Headquarters", "Founded", "Team Size", "Description", "Key Achievements / Products", "Notes"),
    row("ABB Robotics", "Large Corp", "Robotics & Autonomous Systems", "https://global.abb/", "Zurich", 1988, "Large", "Industrial robotics.", "Large installed base.", "Internal note"),
  ],
};

describe("parseTable", () => {
  it("uses column labels as headers and keeps the first data row (WEF)", () => {
    const sheet = parseTable(eventsTable, EVENTS_REQUIRED);
    expect(sheet.records[0].name).toBe("World Economic Forum Annual Meeting");
    expect(sheet.records).toHaveLength(6); // blank row dropped
  });

  it("maps the shifted columns by header name", () => {
    const [wef] = parseTable(eventsTable).records;
    expect(wef.size).toBe("Large");
    expect(wef.targetAudience).toBe("Government and Business Leaders");
    expect(wef.scope).toBe("International");
    expect(wef.description).toContain("agenda-setting");
  });

  it("reports ticket price as unavailable rather than inventing a value", () => {
    const sheet = parseTable(eventsTable);
    expect(sheet.availableFields).not.toContain("ticketPrice");
    expect(toEvents(sheet).hasTicketPrice).toBe(false);
    expect(toEvents(sheet).events[0]).not.toHaveProperty("ticketPrice");
  });

  it("only skips the first row when it is positively identified as headers", () => {
    const vcs = toInvestors(parseTable(vcsTable));
    expect(vcs).toHaveLength(2);
    expect(vcs[0]).toMatchObject({
      name: "Verve Ventures",
      estimatedFundSize: "CHF 300 m+",
      officialUrl: "https://verve.vc",
      linkedinUrl: "https://www.linkedin.com/company/verve",
      description: "A science-led venture capital firm.",
    });
    const robotics = toRobotics(parseTable(roboticsTable));
    expect(robotics).toEqual([
      expect.objectContaining({ name: "ABB Robotics", founded: "1988", teamSize: "Large", achievements: "Large installed base." }),
    ]);
  });

  it("supports legacy sheets with a header row and a ticket price column", () => {
    const legacy = { cols: [{ label: "" }, { label: "" }], rows: [row("Event Name", "Ticket Price"), row("Test event", "Free")] };
    const sheet = parseTable(legacy);
    expect(sheet.records).toEqual([{ name: "Test event", ticketPrice: "Free" }]);
  });

  it("fails visibly when the name or a required column disappears", () => {
    expect(() => parseTable({ cols: [{ label: "Unknown" }], rows: [row("Unknown")] })).toThrow(SheetFormatError);
    const withoutUrl = {
      cols: eventsTable.cols.filter((c) => c.label !== "Official URL"),
      rows: [],
    };
    expect(() => parseTable(withoutUrl, EVENTS_REQUIRED)).toThrow(/officialUrl/);
    expect(() => parseTable(undefined)).toThrow(SheetFormatError);
  });
});

describe("parseGviz", () => {
  it("unwraps the JSONP response", () => {
    const text = `/*O_o*/\ngoogle.visualization.Query.setResponse(${JSON.stringify({ status: "ok", table: vcsTable })});`;
    expect(parseGviz(text).records).toHaveLength(2);
  });

  it("rejects unrecognised or failed responses", () => {
    expect(() => parseGviz("not a response")).toThrow(SheetFormatError);
    expect(() => parseGviz(`google.visualization.Query.setResponse(${JSON.stringify({ status: "error" })});`)).toThrow(SheetFormatError);
  });
});

describe("events", () => {
  it("converts gviz dates with zero-based months", () => {
    expect(gvizDate("Date(2026,0,19)")).toBe("2026-01-19");
    expect(gvizDate("Date(2026,11,5)")).toBe("2026-12-05");
    expect(gvizDate("2026-03-04")).toBe("2026-03-04");
    expect(gvizDate("")).toBe("");
    expect(gvizDate("sometime")).toBe("");
  });

  it("combines exact duplicates for display while keeping provenance", () => {
    const { events, sourceCount } = toEvents(parseTable(eventsTable));
    expect(sourceCount).toBe(6);
    expect(events).toHaveLength(5);
    const summit = events.filter((e) => e.name === "Swiss AI Summit");
    expect(summit).toHaveLength(1);
    expect(summit[0].description).toBe("First source row.");
    expect(summit[0].sourceVariants).toHaveLength(1);
    expect(summit[0].sourceVariants?.[0].description).toBe("Duplicate source row.");
  });

  it("keeps distinct sessions of the same event", () => {
    const sessions = combineExactEvents([
      { name: "Same", startDate: "2026-01-01", finishDate: "2026-01-01", officialUrl: "https://example.com" },
      { name: "Same", startDate: "2026-02-01", finishDate: "2026-02-01", officialUrl: "https://example.com" },
    ]);
    expect(sessions).toHaveLength(2);
  });

  it("uses Zurich calendar dates for the upcoming/past boundary", () => {
    // 23:30 UTC on 18 Jan is already 19 Jan in Zurich.
    expect(zurichToday(new Date("2026-01-18T23:30:00Z"))).toBe("2026-01-19");
    const { events } = toEvents(parseTable(eventsTable));
    const wef = events.find((e) => e.name.startsWith("World Economic"))!;
    expect(isPastEvent(wef, "2026-01-23")).toBe(false);
    expect(isPastEvent(wef, "2026-01-24")).toBe(true);
    const tba = events.find((e) => e.name === "Date To Be Announced")!;
    expect(tba.startDate).toBe("");
    expect(isPastEvent(tba, "2030-01-01")).toBe(false);
    expect([...events].sort(compareEvents).at(-1)?.name).toBe("Date To Be Announced");
  });
});
