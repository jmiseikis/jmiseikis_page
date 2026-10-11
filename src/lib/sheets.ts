// Google Sheets (gviz) adapter for the public directories, shared by the pages and the MCP tools.
// Columns are matched by header name, never by fixed position. Header labels arrive either in
// table.cols (the events sheet) or as the first data row (the VC and robotics sheets). A row is
// only skipped after it has been positively identified as a header row.
// Keep this file free of "@/" imports: the MCP edge function bundles it with relative paths.

export type SheetRecord = Record<string, string>;

export interface ParsedSheet {
  records: SheetRecord[];
  availableFields: string[];
}

/** The response was readable but not in the expected shape. Retrying will not help. */
export class SheetFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SheetFormatError";
  }
}

interface GvizCell {
  v?: unknown;
  f?: string;
}
interface GvizTable {
  cols?: ({ label?: string } | null)[];
  rows?: ({ c?: (GvizCell | null)[] | null } | null)[];
}

const normalise = (value: unknown) => String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

/** Accepted header names per field. Add an alias here if a sheet column is renamed. */
const ALIASES: Record<string, string[]> = {
  name: ["event name", "name", "organisation name", "organization name"],
  startDate: ["start date"],
  finishDate: ["finish date", "end date"],
  location: ["location"],
  category: ["category"],
  officialUrl: ["official url"],
  size: ["size"],
  targetAudience: ["target audience"],
  scope: ["local/international", "scope"],
  description: ["one paragraph description", "description"],
  ticketPrice: ["ticket price", "price"],
  sector: ["sector"],
  investmentRounds: ["investment rounds"],
  targetGeography: ["target geography"],
  estimatedFundSize: ["estimated fund size"],
  crunchbaseUrl: ["crunchbase url"],
  pitchbookUrl: ["pitchbook url"],
  linkedinUrl: ["linkedin url"],
  type: ["type"],
  website: ["website"],
  headquarters: ["headquarters"],
  founded: ["founded"],
  teamSize: ["team size"],
  achievements: ["key achievements / products", "key achievements"],
  notes: ["notes"],
};

const isHeaderRow = (headers: string[]) => headers.some((h) => ALIASES.name.includes(h));

const cellText = (cell: GvizCell | null | undefined) => {
  const value = cell?.v;
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const rowCells = (row: { c?: (GvizCell | null)[] | null } | null | undefined) => row?.c ?? [];

export function parseTable(table: GvizTable | undefined, required: string[] = ["name"]): ParsedSheet {
  if (!table || !Array.isArray(table.cols) || !Array.isArray(table.rows)) {
    throw new SheetFormatError("The directory response did not contain a table.");
  }
  let rows = table.rows;
  let headers = table.cols.map((col) => normalise(col?.label));

  if (isHeaderRow(headers)) {
    // Labels came from table.cols. Drop a repeated header row only if it is clearly one.
    if (rows.length && isHeaderRow(rowCells(rows[0]).map((cell) => normalise(cellText(cell))))) rows = rows.slice(1);
  } else {
    if (!rows.length) return { records: [], availableFields: [] };
    headers = rowCells(rows[0]).map((cell) => normalise(cellText(cell)));
    if (!isHeaderRow(headers)) throw new SheetFormatError("The directory is missing its name column.");
    rows = rows.slice(1);
  }

  const indexes = Object.entries(ALIASES)
    .map(([field, names]) => [field, headers.findIndex((h) => names.includes(h))] as const)
    .filter(([, index]) => index >= 0);
  const availableFields = indexes.map(([field]) => field);

  const missing = required.filter((field) => !availableFields.includes(field));
  if (missing.length) {
    throw new SheetFormatError(`The directory format has changed (missing: ${missing.join(", ")}).`);
  }

  const records = rows
    .map((row) => {
      const cells = rowCells(row);
      const record: SheetRecord = {};
      for (const [field, index] of indexes) record[field] = cellText(cells[index]);
      return record;
    })
    .filter((record) => record.name);

  return { records, availableFields };
}

export function parseGviz(text: string, required?: string[]): ParsedSheet {
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
  if (!match) throw new SheetFormatError("Unrecognised Google Sheets response.");
  let parsed: { status?: string; table?: GvizTable };
  try {
    parsed = JSON.parse(match[1]);
  } catch {
    throw new SheetFormatError("The directory response could not be read.");
  }
  if (parsed.status && parsed.status !== "ok") throw new SheetFormatError("The directory query failed.");
  return parseTable(parsed.table, required);
}

/** Fetch and parse a published sheet. Network and format errors are passed to the caller. */
export async function fetchSheet(url: string, required?: string[]): Promise<ParsedSheet> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Directory request failed (${response.status}).`);
  return parseGviz(await response.text(), required);
}

/** "Date(2026,0,19)" (zero-based month) becomes "2026-01-19". ISO dates pass through; anything else becomes "". */
export function gvizDate(value: string | undefined): string {
  const raw = String(value ?? "").trim();
  const gviz = raw.match(/^Date\((\d{4}),(\d{1,2}),(\d{1,2})/);
  if (gviz) {
    const [, year, month, day] = gviz;
    return `${year}-${String(Number(month) + 1).padStart(2, "0")}-${String(Number(day)).padStart(2, "0")}`;
  }
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : "";
}

/** Today's calendar date in Zurich as YYYY-MM-DD, used for the upcoming/past boundary. */
export function zurichToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/* ---------- Events ---------- */

export interface TechEventRecord {
  name: string;
  /** Calendar date as YYYY-MM-DD, or "" if the sheet has no readable date. */
  startDate: string;
  /** Calendar date as YYYY-MM-DD. Falls back to the start date. */
  finishDate: string;
  location: string;
  /** Last comma-separated part of the location, e.g. "ZH" in "Zurich, ZH". */
  canton: string;
  category: string;
  officialUrl: string;
  size: string;
  targetAudience: string;
  scope: string;
  description: string;
  /** Only present if the source sheet has a ticket price column. Missing means unknown, not free. */
  ticketPrice?: string;
  /** Further source rows with the same identity, kept for provenance. */
  sourceVariants?: TechEventRecord[];
}

export const EVENTS_REQUIRED = ["name", "startDate", "finishDate", "location", "officialUrl"];

export interface TechEventsResult {
  events: TechEventRecord[];
  /** Number of event rows in the source sheet, before identical rows are combined. */
  sourceCount: number;
  hasTicketPrice: boolean;
}

export function toEvents(sheet: ParsedSheet): TechEventsResult {
  const hasTicketPrice = sheet.availableFields.includes("ticketPrice");
  const rows = sheet.records.map((r) => {
    const startDate = gvizDate(r.startDate);
    const location = r.location ?? "";
    const event: TechEventRecord = {
      name: r.name,
      startDate,
      finishDate: gvizDate(r.finishDate) || startDate,
      location,
      canton: location.split(",").map((part) => part.trim()).filter(Boolean).pop() ?? "",
      category: r.category ?? "",
      officialUrl: r.officialUrl ?? "",
      size: r.size ?? "",
      targetAudience: r.targetAudience ?? "",
      scope: r.scope ?? "",
      description: r.description ?? "",
    };
    if (hasTicketPrice) event.ticketPrice = r.ticketPrice ?? "";
    return event;
  });
  return { events: combineExactEvents(rows).sort(compareEvents), sourceCount: rows.length, hasTicketPrice };
}

/**
 * Combine rows with an identical event identity (name, dates and URL) for display only.
 * The first row is shown and the others are kept in sourceVariants. Different dates stay separate.
 */
export function combineExactEvents<
  T extends { name: string; startDate: string; finishDate: string; officialUrl: string; sourceVariants?: T[] },
>(records: T[]): T[] {
  const seen = new Map<string, T>();
  const out: T[] = [];
  for (const record of records) {
    if (!record.name || !record.startDate || !record.finishDate || !record.officialUrl) {
      out.push(record);
      continue;
    }
    const key = [
      normalise(record.name),
      record.startDate,
      record.finishDate,
      record.officialUrl.trim().replace(/\/+$/, "").toLowerCase(),
    ].join("|");
    const first = seen.get(key);
    if (first) {
      first.sourceVariants = [...(first.sourceVariants ?? []), record];
    } else {
      const copy = { ...record };
      seen.set(key, copy);
      out.push(copy);
    }
  }
  return out;
}

/** Sort by start date, then name. Events without a readable date go last. */
export const compareEvents = (a: TechEventRecord, b: TechEventRecord) =>
  (a.startDate || "9999-99-99").localeCompare(b.startDate || "9999-99-99") || a.name.localeCompare(b.name);

/** An event is past once its finish date is before today in Zurich. Events without a date are never past. */
export const isPastEvent = (event: Pick<TechEventRecord, "startDate" | "finishDate">, today: string) => {
  const end = event.finishDate || event.startDate;
  return !!end && end < today;
};

/* ---------- Investors ---------- */

export interface InvestorRecord {
  name: string;
  sector: string;
  investmentRounds: string;
  targetGeography: string;
  targetAudience: string;
  estimatedFundSize: string;
  officialUrl: string;
  crunchbaseUrl: string;
  pitchbookUrl: string;
  linkedinUrl: string;
  description: string;
}

export const VCS_REQUIRED = ["name", "sector", "investmentRounds", "description"];

export const toInvestors = (sheet: ParsedSheet): InvestorRecord[] =>
  sheet.records.map((r) => ({
    name: r.name,
    sector: r.sector ?? "",
    investmentRounds: r.investmentRounds ?? "",
    targetGeography: r.targetGeography ?? "",
    targetAudience: r.targetAudience ?? "",
    estimatedFundSize: r.estimatedFundSize ?? "",
    officialUrl: r.officialUrl ?? "",
    crunchbaseUrl: r.crunchbaseUrl ?? "",
    pitchbookUrl: r.pitchbookUrl ?? "",
    linkedinUrl: r.linkedinUrl ?? "",
    description: r.description ?? "",
  }));

const sheetUrl = (id: string) => `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json`;

export const SHEET_URLS = {
  events: sheetUrl("1k4vfFfSX9Pmi5tNVuijUmubuTPSoFvBnIxC1kH_25x4"),
  vcs: sheetUrl("1FqX_G9qw9srGHumCWfQH1L4RCDlW4EtJ8-iXTfzsblI"),
};
