import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { type InvestorRecord, SHEET_URLS, VCS_REQUIRED, fetchSheet, toInvestors } from "../../sheets";

export default defineTool({
  name: "list_swiss_vcs",
  title: "List Swiss VCs",
  description:
    "List Swiss venture capital firms from the Swiss VCs directory. Optionally filter by a search query (sector, stage, name) and limit results.",
  inputSchema: {
    query: z.string().optional().describe("Case-insensitive substring match across all columns."),
    limit: z.number().int().positive().max(100).optional().describe("Max VCs to return (default 25)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ query, limit }) => {
    let vcs: InvestorRecord[];
    try {
      // Columns are mapped by header name; the header row is not returned as a firm.
      vcs = toInvestors(await fetchSheet(SHEET_URLS.vcs, VCS_REQUIRED));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Failed to load VCs: ${message}` }], isError: true };
    }

    const q = query?.toLowerCase().trim();
    const filtered = q ? vcs.filter((vc) => Object.values(vc).some((value) => value.toLowerCase().includes(q))) : vcs;
    const capped = filtered.slice(0, limit ?? 25);
    return {
      content: [{ type: "text", text: JSON.stringify(capped, null, 2) }],
      structuredContent: { count: capped.length, total: filtered.length, rows: capped },
    };
  },
});
