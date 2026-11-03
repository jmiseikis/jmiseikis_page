export const DAVOS_SHEET_ID: string;
export const DAVOS_SHEET_NAME: string;
export const DAVOS_SHEET_EDIT_URL: string;
export const DAVOS_EVENTS_CSV_URL: string;
export function buildSheetsCsvUrl(options?: { spreadsheetId?: string; sheetName?: string; gid?: string | number }): string;
export function resolveEventsCsvUrl(value?: string, baseOrigin?: string): URL;
