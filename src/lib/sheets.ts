// Google Sheets (gviz) adapter for the public directories.
// Columns are matched by header name, never by fixed position. Header labels can arrive either
// in table.cols (current events sheet) or as the first data row (VC and robotics sheets); a row
// is only skipped after it has been positively identified as a header row.

export type SheetRecord = Record<string, string>;

export interface ParsedSheet {
  records: SheetRecord[];
  availableFields: string[];
}

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
  cols?: { label?: string }[];
  rows?: { c?: (GvizCell | null)[] }[];
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
  logoUrl: ["logo url"],
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

export function parseTable(table: GvizTable | undefined, required: string[] = ["name"]): ParsedSheet {
  if (!table || !Array.isArray(table.cols) || !Array.isArray(table.rows)) {
    throw new SheetFormatError("The directory response did not contain a table.");
  }
  let rows = table.rows;
  let headers = table.cols.map((col) => normalise(col?.label));

  if (!isHeaderRow(headers)) {
    if (!rows.length) return { records: [], availableFields: [] };
    headers = (rows[0].c ?? []).map((cell) => normalise(cellText(cell)));
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
      const cells = row.c ?? [];
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

/** Fetch and parse a published sheet. Network and format errors are surfaced to the caller. */
export async function fetchSheet(url: string, required?: string[]): Promise<ParsedSheet> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Directory request failed (${response.status}).`);
  return parseGviz(await response.text(), required);
}

/** "Date(2026,0,19)" (zero-based month) -> "2026-01-19". ISO dates pass through; anything else -> "". */
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

/** Today's calendar date in Zurich as YYYY-MM-DD, used for upcoming/past boundaries. */
export function zurichToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export const splitList = (value: string | undefined) =>
  String(value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

const MISSING = new Set(["", "-", "\u2014", "n/a", "na", "unknown", "none", "null", "[url]"]);
export const isMissing = (value: string | undefined) => MISSING.has(String(value ?? "").trim().toLowerCase());

/* ---------- Events ---------- */

export interface TechEventRecord {
  name: string;
  startDate: string;
  finishDate: string;
  rawStartDate: string;
  rawFinishDate: string;
  location: string;
  canton: string;
  category: string;
  officialUrl: string;
  size: string;
  targetAudience: string;
  scope: string;
  description: string;
  /** Only present if the source sheet has a ticket price column. Missing means unavailable, not free. */
  ticketPrice?: string;
  /** Additional source rows with the same identity, kept for provenance. */
  sourceVariants?: TechEventRecord[];
}

export const EVENTS_REQUIRED = ["name", "startDate", "finishDate", "location", "officialUrl"];

export function toEvents(sheet: ParsedSheet): { events: TechEventRecord[]; sourceCount: number; hasTicketPrice: boolean } {
  const hasTicketPrice = sheet.availableFields.includes("ticketPrice");
  const rows: TechEventRecord[] = sheet.records.map((r) => {
    const startDate = gvizDate(r.startDate);
    const finishDate = gvizDate(r.finishDate) || startDate;
    const event: TechEventRecord = {
      name: r.name,
      startDate,
      finishDate,
      rawStartDate: r.startDate ?? "",
      rawFinishDate: r.finishDate ?? "",
      location: r.location ?? "",
      canton: splitList(r.location).pop() ?? "",
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
  return { events: combineExactEvents(rows), sourceCount: rows.length, hasTicketPrice };
}

/**
 * Combine rows with an identical event identity (name, dates and URL) for display only.
 * The first row is shown; the others are kept in sourceVariants. Distinct dates stay separate.
 */
export function combineExactEvents<T extends { name: string; startDate: string; finishDate: string; officialUrl: string; sourceVariants?: T[] }>(
  records: T[],
): T[] {
  const seen = new Map<string, T>();
  const out: T[] = [];
  for (const record of records) {
    if (!record.name || !record.startDate || !record.finishDate || !record.officialUrl) {
      out.push(record);
      continue;
    }
    const key = [normalise(record.name), record.startDate, record.finishDate, record.officialUrl.trim().replace(/\/+$/, "").toLowerCase()].join("|");
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

/** Sort by start date; events without a confirmed date go last. */
export const compareEvents = (a: TechEventRecord, b: TechEventRecord) =>
  (a.startDate || "9999-99-99").localeCompare(b.startDate || "9999-99-99") || a.name.localeCompare(b.name);

/** An event is past once its finish date (or start date) is before today in Zurich. Unknown dates are never past. */
export const isPastEvent = (event: TechEventRecord, today: string) => {
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

/* ---------- Robotics organisations ---------- */

export interface RoboticsRecord {
  name: string;
  type: string;
  category: string;
  website: string;
  headquarters: string;
  founded: string;
  teamSize: string;
  description: string;
  achievements: string;
}

export const ROBOTICS_REQUIRED = ["name", "type", "category", "description"];

export const toRobotics = (sheet: ParsedSheet): RoboticsRecord[] =>
  sheet.records.map((r) => ({
    name: r.name,
    type: r.type ?? "",
    category: r.category ?? "",
    website: r.website ?? "",
    headquarters: r.headquarters ?? "",
    founded: r.founded ?? "",
    teamSize: r.teamSize ?? "",
    description: r.description ?? "",
    achievements: r.achievements ?? "",
  }));

const SHEET = (id: string) => `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json`;
export const SHEET_URLS = {
  events: SHEET("1k4vfFfSX9Pmi5tNVuijUmubuTPSoFvBnIxC1kH_25x4"),
  vcs: SHEET("1FqX_G9qw9srGHumCWfQH1L4RCDlW4EtJ8-iXTfzsblI"),
  robotics: SHEET("1CL3fGiT1QvDAWQ_Itn1ixw-lvJc07ABUr3cjJHnvIRs"),
};
