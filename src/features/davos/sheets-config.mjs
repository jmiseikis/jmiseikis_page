/** The owner's nominated online document is the source of truth, not data/events.json.
 * Events is the EXPECTED tab from the supplied workbook; its live name/gid is not yet verified.
 * Use a known gid after inspection, or change sheetName here if the tab has a different name.
 * This file contains public identifiers only. Never put credentials in frontend config.
 */
export const DAVOS_SHEET_ID = '10LwgzJqUyUVuL-JI7DU2-oY29Qxbh7sgnbQFRdYU0YU';
export const DAVOS_SHEET_NAME = 'Events';
export const DAVOS_SHEET_EDIT_URL = `https://docs.google.com/spreadsheets/d/${DAVOS_SHEET_ID}/edit?usp=sharing`;
export function buildSheetsCsvUrl({spreadsheetId=DAVOS_SHEET_ID,sheetName=DAVOS_SHEET_NAME,gid}={}) {
  if(!/^[A-Za-z0-9_-]{20,}$/.test(String(spreadsheetId))) throw new TypeError('Invalid Google spreadsheet ID.');
  const url=new URL(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq`);
  url.searchParams.set('tqx','out:csv');
  url.searchParams.set('headers','1');
  if(gid!==undefined && gid!==null && String(gid)!=='') {
    if(!/^\d+$/.test(String(gid))) throw new TypeError('gid must be a non-negative integer.');
    url.searchParams.set('gid',String(gid));
  } else {
    if(!String(sheetName).trim()) throw new TypeError('An explicit sheet name or verified gid is required.');
    url.searchParams.set('sheet',String(sheetName).trim());
  }
  return url.href;
}
export const DAVOS_EVENTS_CSV_URL = buildSheetsCsvUrl();
/** Allow a tab-specific Google CSV or the host's own fixed CSV endpoint, never a web edit URL. */
export function resolveEventsCsvUrl(value=DAVOS_EVENTS_CSV_URL,baseOrigin) {
  const raw=String(value).trim();
  if(!raw)throw new TypeError('The live Google Sheets CSV source is not configured.');
  const url=new URL(raw,baseOrigin);
  if(url.username||url.password||url.hash)throw new TypeError('The feed URL must not contain credentials or a fragment.');
  if(baseOrigin && url.origin===new URL(baseOrigin).origin && ['http:','https:'].includes(url.protocol))return url;
  if(url.protocol!=='https:'||url.hostname!=='docs.google.com')throw new TypeError('Use a Google Sheets HTTPS CSV URL or a same-origin CSV endpoint.');
  if(/\/edit\/?$/.test(url.pathname))throw new TypeError('Use the CSV endpoint, not the Google Sheets edit/share URL.');
  const p=url.searchParams;
  const csv=(/\/gviz\/tq$/.test(url.pathname) && p.get('tqx')==='out:csv' && p.get('headers')==='1') || (/\/(?:pub|export)$/.test(url.pathname) && (p.get('output')==='csv'||p.get('format')==='csv'));
  if(!csv || (!p.get('sheet')&&!/^\d+$/.test(p.get('gid')||'')))throw new TypeError('Select an explicit Events tab by sheet name or verified gid, and CSV output.');
  return url;
}
