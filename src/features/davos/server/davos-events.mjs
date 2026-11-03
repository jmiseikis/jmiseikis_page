/** OPTIONAL same-origin CSV endpoint for a host where direct browser Google fetch is blocked.
 * Use only the owner's public document. No access tokens, cookie forwarding or arbitrary URL inputs.
 * This is a handler module, not an automatically deployed server.
 */
import {DAVOS_EVENTS_CSV_URL} from '../sheets-config.mjs';
import {loadEventsFromSheet} from '../sheets-feed.mjs';
import {toCSV} from '../core.mjs';
export async function handleDavosEventsRequest(request,{fetchImpl=globalThis.fetch}={}) {
 const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
 if(request.method!=='GET')return new Response('Method not allowed',{status:405,headers:{...headers,Allow:'GET'}});
 if(new URL(request.url).search)return new Response('This endpoint accepts no query parameters',{status:400,headers});
 try{
  const result=await loadEventsFromSheet(DAVOS_EVENTS_CSV_URL,{fetchImpl,signal:request.signal,timeoutMs:12000});
  // Fail closed on invalid rows. The public response never exposes internal error details or unknown columns.
  if(result.issues.length)return new Response('The public Events sheet needs validation fixes.',{status:502,headers});
  return new Response(toCSV(result.events)+'\r\n',{status:200,headers:{...headers,'Content-Type':'text/csv; charset=utf-8'}});
 }catch(error){
  const status=error.code==='ACCESS_DENIED'?403:error.code==='NOT_FOUND'?404:502;
  return new Response('The public Events sheet is temporarily unavailable.',{status,headers});
 }
}
