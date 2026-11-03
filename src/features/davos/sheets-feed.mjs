import {parseCSV,validateEvents,MAX_CSV_BYTES,zurichToday} from './core.mjs';
import {DAVOS_EVENTS_CSV_URL,resolveEventsCsvUrl} from './sheets-config.mjs';
export class SheetFeedError extends Error {
  constructor(code,message) {super(message);this.name='SheetFeedError';this.code=code;}
}
/** Read at most 2 MB. Do not buffer a very large upstream response before checking its size. */
export async function readCsvResponse(response) {
  const length=Number(response.headers.get('content-length')||0);
  if(length>MAX_CSV_BYTES)throw new SheetFeedError('TOO_LARGE','The sheet exceeds the 2 MB size limit.');
  const type=(response.headers.get('content-type')||'').toLowerCase();
  if(type.includes('text/html'))throw new SheetFeedError('NOT_CSV','Google returned a web or sign-in page, not CSV. Check anonymous viewing and the Events tab.');
  if(!response.body?.getReader) {
    const text=await response.text();
    if(new TextEncoder().encode(text).byteLength>MAX_CSV_BYTES)throw new SheetFeedError('TOO_LARGE','The sheet exceeds the 2 MB size limit.');
    return text;
  }
  const reader=response.body.getReader(),decoder=new TextDecoder();let bytes=0,text='';
  try {
    while(true){const{done,value}=await reader.read();if(done)break;bytes+=value.byteLength;
      if(bytes>MAX_CSV_BYTES){await reader.cancel();throw new SheetFeedError('TOO_LARGE','The sheet exceeds the 2 MB size limit.');}
      text+=decoder.decode(value,{stream:true});}
    return text+decoder.decode();
  } finally {reader.releaseLock();}
}
/** Shared browser/server/CLI loader. Read-only; no OAuth, cookies, JSONP, submission or sheet writes. */
export async function loadEventsFromSheet(csvUrl=DAVOS_EVENTS_CSV_URL,{
  fetchImpl=globalThis.fetch,signal,today=zurichToday(),timeoutMs=15000,baseOrigin
}={}) {
  const url=resolveEventsCsvUrl(csvUrl,baseOrigin);
  const controller=new AbortController();let timedOut=false;
  const cancel=()=>controller.abort();
  if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',cancel,{once:true});
  const timer=setTimeout(()=>{timedOut=true;controller.abort();},timeoutMs);
  try {
    const response=await fetchImpl(url.href,{signal:controller.signal,credentials:'omit',cache:'no-store',redirect:'follow'});
    if(response.status===401||response.status===403)throw new SheetFeedError('ACCESS_DENIED','The sheet is not available anonymously (HTTP '+response.status+'). Confirm public viewing, or publish only the public Events tab.');
    if(response.status===404)throw new SheetFeedError('NOT_FOUND','Google could not find the configured document or tab (HTTP 404). Check the sheet ID and tab selector.');
    if(!response.ok)throw new SheetFeedError('UPSTREAM_HTTP','The sheet returned HTTP '+response.status+'.');
    if(response.url && new URL(response.url).hostname==='accounts.google.com')throw new SheetFeedError('ACCESS_DENIED','The sheet redirected to Google sign-in. Anonymous access is required.');
    const text=await readCsvResponse(response);
    let raw;try{raw=parseCSV(text);}catch(error){throw new SheetFeedError('SCHEMA',error.message);}
    const checked=validateEvents(raw,{today});
    const publishing=raw.some(r=>String(r.published).toUpperCase()==='TRUE');
    if(publishing&&!checked.events.length&&checked.issues.length)throw new SheetFeedError('INVALID_ROWS','All published rows failed validation. Check the Events headers and row values.');
    return {events:checked.events,issues:checked.issues,rowCount:raw.length,sourceUrl:url.href};
  } catch(error) {
    if(timedOut)throw new SheetFeedError('TIMEOUT','The live sheet request timed out.');
    throw error;
  } finally {clearTimeout(timer);signal?.removeEventListener('abort',cancel);}
}
