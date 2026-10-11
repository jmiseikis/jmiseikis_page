import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { generateGoogleCalendarUrl, generateICSContent, generateOutlookCalendarUrl } from "../calendarLinks";

const event = {
  name: "World Economic Forum Annual Meeting",
  startDate: "2026-01-19",
  finishDate: "2026-01-23",
  location: "Davos, GR",
  description: "Annual meeting.",
  officialUrl: "https://www.weforum.org/",
};

describe("calendar links", () => {
  // Run in Zurich time: east of UTC, local midnight is the previous day in UTC.
  const originalTz = process.env.TZ;
  beforeAll(() => {
    process.env.TZ = "Europe/Zurich";
  });
  afterAll(() => {
    process.env.TZ = originalTz;
  });

  it("keeps the event dates in Outlook links", () => {
    const params = new URL(generateOutlookCalendarUrl(event)!).searchParams;
    expect(params.get("startdt")).toBe("2026-01-19");
    expect(params.get("enddt")).toBe("2026-01-23");
  });

  it("uses an exclusive end date for Google Calendar and ICS all-day events", () => {
    expect(new URL(generateGoogleCalendarUrl(event)!).searchParams.get("dates")).toBe("20260119/20260124");
    const ics = generateICSContent(event)!;
    expect(ics).toContain("DTSTART;VALUE=DATE:20260119");
    expect(ics).toContain("DTEND;VALUE=DATE:20260124");
  });

  it("still accepts the raw Google Sheets date format", () => {
    const legacy = { ...event, startDate: "Date(2026,0,19)", finishDate: "Date(2026,0,23)" };
    expect(new URL(generateOutlookCalendarUrl(legacy)!).searchParams.get("startdt")).toBe("2026-01-19");
  });

  it("returns null without a readable date", () => {
    expect(generateGoogleCalendarUrl({ ...event, startDate: "" })).toBeNull();
  });
});
