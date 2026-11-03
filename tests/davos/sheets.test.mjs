import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DAVOS_SHEET_ID,DAVOS_EVENTS_CSV_URL,buildSheetsCsvUrl,resolveEventsCsvUrl} from '../../src/features/davos/sheets-config.mjs';
import {loadEventsFromSheet,readCsvResponse} from '../../src/features/davos/sheets-feed.mjs';
import {handleDavosEventsRequest} from '../../src/features/davos/server/davos-events.mjs';
import {COLUMNS,MAX_CSV_BYTES,toCSV,parseCSV} from '../../src/features/davos/core.mjs';
const rows=JSON.parse(await readFile(new URL('./fixtures/events.json',import.meta.url),'utf8'));
const csv=await readFile(new URL('./fixtures/events.csv',import.meta.url),'utf8');
const opts={today:'2026-11-03'};
const fake=(text=csv,status=200,headers={})=>async()=>new Response(text,{status,headers:{'Content-Type':'text/csv',...headers}});
const load=(options={})=>loadEventsFromSheet(DAVOS_EVENTS_CSV_URL,{...opts,fetchImpl:fake(),...options});

test('the default is the exact user-nominated online document, not a placeholder',()=>{
 assert.equal(DAVOS_SHEET_ID,'10LwgzJqUyUVuL-JI7DU2-oY29Qxbh7sgnbQFRdYU0YU');
 const u=new URL(DAVOS_EVENTS_CSV_URL);assert.equal(u.pathname,`/spreadsheets/d/${DAVOS_SHEET_ID}/gviz/tq`);
 assert.equal(u.searchParams.get('sheet'),'Events');assert.equal(u.searchParams.get('headers'),'1');assert.equal(u.searchParams.get('tqx'),'out:csv');assert.equal(u.searchParams.has('gid'),false);
});
test('a verified gid overrides name without guessing first-tab gid zero',()=>{const u=new URL(buildSheetsCsvUrl({gid:0}));assert.equal(u.searchParams.get('gid'),'0');assert.equal(u.searchParams.has('sheet'),false);});
test('sheet names are URL encoded safely',()=>{const u=new URL(buildSheetsCsvUrl({sheetName:'Public Events & Access'}));assert.equal(u.searchParams.get('sheet'),'Public Events & Access');});
test('invalid ID, gid or blank tab is rejected',()=>{for(const x of [{spreadsheetId:'../../bad'},{gid:'1&sheet=Secret'},{sheetName:''}])assert.throws(()=>buildSheetsCsvUrl(x));});
test('default URL resolves with no env variable',()=>assert.equal(resolveEventsCsvUrl().href,DAVOS_EVENTS_CSV_URL));
test('edit/share URLs, JSONP, guessed first tabs and insecure URLs are rejected',()=>{
 for(const url of [`https://docs.google.com/spreadsheets/d/${DAVOS_SHEET_ID}/edit?usp=sharing`,`https://docs.google.com/spreadsheets/d/${DAVOS_SHEET_ID}/gviz/tq?tqx=out:json&sheet=Events&headers=1`,`https://docs.google.com/spreadsheets/d/${DAVOS_SHEET_ID}/gviz/tq?tqx=out:csv&headers=1`,'http://docs.google.com/sheet','javascript:alert(1)','https://example.org/events.csv',DAVOS_EVENTS_CSV_URL+'#oops'])assert.throws(()=>resolveEventsCsvUrl(url));
});
test('explicit published CSV is an allowed override',()=>{const u=`https://docs.google.com/spreadsheets/d/e/${DAVOS_SHEET_ID}/pub?gid=123&single=true&output=csv`;assert.equal(resolveEventsCsvUrl(u).href,u);});
test('same-origin proxy is supported, arbitrary foreign proxy is not',()=>{
 assert.equal(resolveEventsCsvUrl('/api/davos-events','https://jmiseikis.com').href,'https://jmiseikis.com/api/davos-events');assert.throws(()=>resolveEventsCsvUrl('//evil.example/feed','https://jmiseikis.com'));
});
test('valid feed maps the exact live CSV, excludes unpublished and unknown extra columns',async()=>{
 const text=csv.replace('verification_notes','verification_notes,internal_unused').split(/\r?\n/).filter(Boolean).map((s,i)=>i?s+',not rendered':s).join('\r\n');
 const r=await load({fetchImpl:fake(text)});assert.equal(r.events.length,15);assert.equal(r.issues.length,0);assert.equal('internal_unused' in r.events[0],false);
});
test('fetch uses anonymous no-store GET and exact source; never sends Google cookies',async()=>{
 let called;await load({fetchImpl:async(url,options)=>{called={url,options};return new Response(csv);}});assert.equal(called.url,DAVOS_EVENTS_CSV_URL);assert.equal(called.options.credentials,'omit');assert.equal(called.options.cache,'no-store');assert.equal(called.options.redirect,'follow');
});
test('edits and row removal replace, rather than merge with, old data',async()=>{
 const a=await load();const changed=rows.slice(1).map((r,i)=>({...r,...(!i?{event_name:'Edited in Google Sheets'}:{})}));const b=await load({fetchImpl:fake(toCSV(changed))});assert.equal(a.events.length,15);assert.equal(b.events.length,14);assert.equal(b.events[0].event_name,'Edited in Google Sheets');assert.equal(b.events.some(r=>r.id===rows[0].id),false);
});
test('headers-only sheet is an intentional empty result',async()=>{const r=await load({fetchImpl:fake(COLUMNS.join(','))});assert.equal(r.events.length,0);assert.equal(r.rowCount,0);});
test('FALSE and Closed rows are removed, not considered a failed feed',async()=>{const r=await load({fetchImpl:fake(toCSV([{...rows[0],published:'FALSE'},{...rows[1],registration_status:'Closed'}]))});assert.equal(r.events.length,0);assert.equal(r.issues.length,0);});
test('wrong tab, readable directory view or incompatible header fails clearly',async()=>{await assert.rejects(load({fetchImpl:fake('Event,Date\nExample,January')}),e=>e.code==='SCHEMA'&&e.message.includes('Missing columns'));});
test('Google sign-in HTML never becomes events',async()=>{await assert.rejects(load({fetchImpl:fake('<html>Please sign in</html>',200,{'Content-Type':'text/html'})}),e=>e.code==='NOT_CSV');});
test('HTML disguised as CSV is rejected',async()=>{await assert.rejects(load({fetchImpl:fake('<html>Denied</html>')}),e=>e.code==='SCHEMA');});
test('all-invalid public rows fail, not a successful empty publication',async()=>{await assert.rejects(load({fetchImpl:fake(toCSV([{...rows[0],edition:'2026'}]))}),e=>e.code==='INVALID_ROWS');});
test('some valid rows survive with explicit withheld-row diagnostics',async()=>{const r=await load({fetchImpl:fake(toCSV([rows[0],{...rows[1],edition:'2026'}]))});assert.equal(r.events.length,1);assert.equal(r.issues.length,1);});
test('access denied, missing source and transient failure are distinct',async()=>{
 for(const [status,code]of [[401,'ACCESS_DENIED'],[403,'ACCESS_DENIED'],[404,'NOT_FOUND'],[429,'UPSTREAM_HTTP'],[500,'UPSTREAM_HTTP']])await assert.rejects(load({fetchImpl:fake('error',status)}),e=>e.code===code);
});
test('sign-in redirect is recognised even if body looks like CSV',async()=>{await assert.rejects(load({fetchImpl:async()=>{const r=new Response(csv);Object.defineProperty(r,'url',{value:'https://accounts.google.com/ServiceLogin'});return r;}}),e=>e.code==='ACCESS_DENIED');});
test('UTF-8 streaming size cap is enforced without a content-length',async()=>{await assert.rejects(readCsvResponse(new Response('€'.repeat(Math.ceil(MAX_CSV_BYTES/3)+1))),e=>e.code==='TOO_LARGE');});
test('oversize advertised Content-Length is refused before reading',async()=>{await assert.rejects(readCsvResponse(new Response('small',{headers:{'content-length':String(MAX_CSV_BYTES+1)}})),e=>e.code==='TOO_LARGE');});
test('split UTF-8 stream chunks preserve non-ASCII event names',async()=>{const data=new TextEncoder().encode('Mišeikis');let i=0;const stream=new ReadableStream({pull(c){if(i===data.length)c.close();else c.enqueue(data.slice(i,i+=1));}});assert.equal(await readCsvResponse(new Response(stream)),'Mišeikis');});
test('stalled fetch is bounded by timeout',async()=>{await assert.rejects(load({timeoutMs:10,fetchImpl:(_u,{signal})=>new Promise((_r,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))))}),e=>e.code==='TIMEOUT');});
test('unmount cancellation propagates and is not relabelled as a timeout',async()=>{const c=new AbortController();c.abort();await assert.rejects(load({signal:c.signal,fetchImpl:async(_u,{signal})=>{if(signal.aborted)throw new DOMException('Aborted','AbortError');return new Response(csv);}}),e=>e.name==='AbortError');});
test('proxy only accepts GET and never accepts an arbitrary URL query',async()=>{
 const post=await handleDavosEventsRequest(new Request('https://jmiseikis.com/api/davos-events',{method:'POST'}));assert.equal(post.status,405);
 const query=await handleDavosEventsRequest(new Request('https://jmiseikis.com/api/davos-events?url=https://example.org'));assert.equal(query.status,400);
});
test('proxy uses fixed source and only returns vetted public rows with no-store',async()=>{
 let fetched;const res=await handleDavosEventsRequest(new Request('https://jmiseikis.com/api/davos-events'),{fetchImpl:async(url)=>{fetched=url;return new Response(toCSV([rows[0],{...rows[1],published:'FALSE'}]));}});
 assert.equal(fetched,DAVOS_EVENTS_CSV_URL);assert.equal(res.status,200);assert.equal(res.headers.get('cache-control'),'no-store');assert.equal(res.headers.has('access-control-allow-origin'),false);assert.equal(parseCSV(await res.text()).length,1);
});
test('proxy validates before exposing and emits no raw row errors',async()=>{const res=await handleDavosEventsRequest(new Request('https://jmiseikis.com/api/davos-events'),{fetchImpl:fake(toCSV([rows[0],{...rows[1],edition:'2026'}]))});assert.equal(res.status,502);assert.equal((await res.text()).includes(rows[1].id),false);});
test('proxy preserves access-revoked HTTP code',async()=>{const res=await handleDavosEventsRequest(new Request('https://jmiseikis.com/api/davos-events'),{fetchImpl:fake('denied',403)});assert.equal(res.status,403);});
// The host page (the package's standalone live-check HTML is not shipped): live mode, configured source, no seed data.
test('host page mounts the live sheet and bundles no seed data',async()=>{const t=await readFile(new URL('../../src/pages/Davos2027.tsx',import.meta.url),'utf8');assert.ok(t.includes('DAVOS_EVENTS_CSV_URL'));assert.ok(t.includes('mode: "live"'));assert.ok(!/seedEvents|fixtures|events\.json|events\.csv/.test(t));assert.ok(!t.includes(rows[0].event_name));});
