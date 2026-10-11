import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  EVENTS_REQUIRED,
  SHEET_URLS,
  type TechEventsResult,
  fetchSheet,
  isPastEvent,
  toEvents,
  zurichToday,
} from "../../sheets";

export default defineTool({
  name: "list_tech_events",
  title: "List tech events",
  description:
    "List curated European tech, AI, and robotics events from the Tech Events directory. Optionally filter by a search query and limit results.",
  inputSchema: {
    query: z
      .string()
      .optional()
      .describe("Case-insensitive substring match against event name, location, or topic."),
    limit: z.number().int().positive().max(100).optional().describe("Max events to return (default 25)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ query, limit }) => {
    let result: TechEventsResult;
    try {
      // Columns are mapped by header name, the same way as on the /tech-events page.
      result = toEvents(await fetchSheet(SHEET_URLS.events, EVENTS_REQUIRED));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Failed to load events: ${message}` }], isError: true };
    }

    const today = zurichToday();
    // Return every source row: rows combined on the page (same name, dates and URL) can still
    // differ in other columns. Dates are YYYY-MM-DD; `past` uses today's date in Zurich.
    const events = result.events
      .flatMap((event) => [event, ...(event.sourceVariants ?? [])])
      .map(({ sourceVariants, canton, ...event }) => ({ ...event, past: isPastEvent(event, today) }));

    const q = query?.toLowerCase().trim();
    const filtered = q
      ? events.filter((event) =>
          Object.values(event).some((value) => typeof value === "string" && value.toLowerCase().includes(q)),
        )
      : events;

    const capped = filtered.slice(0, limit ?? 25);
    return {
      content: [{ type: "text", text: JSON.stringify(capped, null, 2) }],
      structuredContent: { count: capped.length, total: filtered.length, rows: capped },
    };
  },
});
