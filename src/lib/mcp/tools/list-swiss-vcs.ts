import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const SHEET_ID = "1FqX_G9qw9srGHumCWfQH1L4RCDlW4EtJ8-iXTfzsblI";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

type Row = { c: Array<{ v: unknown; f?: string } | null> };

function parseGviz(text: string): Row[] {
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?/);
  if (!match) return [];
  try {
    const json = JSON.parse(match[1]);
    return json?.table?.rows ?? [];
  } catch {
    return [];
  }
}

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
    const res = await fetch(SHEET_URL);
    if (!res.ok) {
      return { content: [{ type: "text", text: `Failed to fetch VCs: ${res.status}` }], isError: true };
    }
    const rows = parseGviz(await res.text());
    const vcs = rows
      .map((r) => r.c.map((cell) => (cell?.f ?? cell?.v ?? "") as string))
      .filter((cols) => cols.some((c) => c && String(c).trim().length > 0));

    const q = query?.toLowerCase().trim();
    const filtered = q ? vcs.filter((cols) => cols.some((c) => String(c).toLowerCase().includes(q))) : vcs;
    const capped = filtered.slice(0, limit ?? 25);
    return {
      content: [{ type: "text", text: JSON.stringify(capped, null, 2) }],
      structuredContent: { count: capped.length, total: filtered.length, rows: capped },
    };
  },
});