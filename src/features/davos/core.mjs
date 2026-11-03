/** Public Davos directory data contract. No framework or third-party dependencies. */
export const SCHEMA_VERSION = 1;
export const COLUMNS = ['id','published','edition','event_name','organiser','topics','audience_tags','audience_requirements','description','start_date','end_date','start_time','end_time','timezone','date_status','venue','city','registration_status','entry_route','admission_scope','cost_status','price_amount','currency','cost_details','badge_status','badge_details','deadline','official_url','application_url','source_urls','verified_at','verification_notes'];
export const OPEN_STATUSES = ['Open','Approval required','Interest open','Waitlist'];
export const COST_STATUSES = ['Free confirmed','Paid','Not disclosed'];
export const BADGE_STATUSES = ['Not required confirmed','Required','Not disclosed'];
export const DATE_STATUSES = ['Confirmed','Programme window','Provisional','To be announced'];
export const MAX_CSV_BYTES = 2_000_000;
export const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const REFRESH_MS = 5 * 60 * 1000;
export const EDITION_END = '2027-01-24';
export const splitTags = (s = '') => [...new Set(String(s).split('|').map(x=>x.trim()).filter(Boolean))];
export const normalise = (s = '') => String(s).normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
export function zurichToday(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  return ['year','month','day'].map(t=>parts.find(p=>p.type===t).value).join('-');
}
export function safeUrl(value) {
  try { const url = new URL(String(value)); return ['https:','http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
export function validISODate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10) === value;
}
/** RFC 4180-style CSV, including BOM, embedded commas, escaped quotes and CRLF. */
export function parseCSV(input) {
  if (typeof input !== 'string' || input.length > MAX_CSV_BYTES) throw new Error('CSV is missing or exceeds the 2 MB limit.');
  const text = input.replace(/^\uFEFF/,'');
  if (/^\s*</.test(text)) throw new Error('The source returned HTML, not CSV. Check publishing and the CSV URL.');
  const rows=[]; let row=[], cell='', quoted=false, closed=false, start=true;
  for (let i=0;i<text.length;i++) {
    const ch=text[i];
    if (quoted) {
      if (ch==='"') { if (text[i+1]==='"') {cell+='"'; i++;} else {quoted=false; closed=true;} }
      else cell+=ch;
    } else if (ch==='"') {
      if (!start || closed) throw new Error('Malformed CSV quotation.');
      quoted=true; start=false;
    } else if (ch===',' || ch==='\n' || ch==='\r') {
      row.push(cell); cell=''; closed=false; start=true;
      if (ch!==',') { if (ch==='\r' && text[i+1]==='\n') i++; rows.push(row); row=[]; }
    } else {
      if (closed && !/\s/.test(ch)) throw new Error('Unexpected text after a quoted CSV value.');
      if (!closed) { cell+=ch; start=false; }
    }
  }
  if (quoted) throw new Error('Unterminated quoted CSV value.');
  if (cell!=='' || row.length || closed) {row.push(cell);rows.push(row);}
  const nonempty=rows.filter(r=>r.some(c=>c.trim()!==''));
  if (!nonempty.length) throw new Error('CSV has no header.');
  const headers=nonempty.shift().map(c=>c.trim());
  if (new Set(headers).size!==headers.length) throw new Error('Duplicate CSV column names.');
  const missing=COLUMNS.filter(k=>!headers.includes(k));
  if (missing.length) throw new Error('Missing columns: '+missing.join(', '));
  return nonempty.map((r,i)=>{
    if (r.length!==headers.length) throw new Error(`CSV row ${i+2} has ${r.length} columns; expected ${headers.length}.`);
    return Object.fromEntries(headers.map((h,j)=>[h,r[j].trim()]));
  });
}
export function validateEvents(raw, {today=zurichToday()}={}) {
  if (!Array.isArray(raw)) throw new Error('Expected an array of event records.');
  const events=[], issues=[]; const idCounts=new Map();
  for (const r of raw) if (String(r.published).toUpperCase()==='TRUE') idCounts.set(r.id,(idCounts.get(r.id)||0)+1);
  for (const [index,r] of raw.entries()) {
    // FALSE rows are deliberately unpublished, not errors. Typos never publish.
    if (!['TRUE','FALSE'].includes(String(r.published).toUpperCase())) { issues.push({row:index+2,id:r.id||'',reason:'published must be TRUE or FALSE'}); continue; }
    if (String(r.published).toUpperCase()==='FALSE') continue;
    const e=Object.fromEntries(COLUMNS.map(k=>[k,String(r[k]??'').trim()]));
    const errors=[];
    for (const k of ['id','event_name','organiser','audience_requirements','description','admission_scope','cost_details','badge_details','official_url','application_url','source_urls','verified_at']) if (!e[k]) errors.push(`${k} is required`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.id)) errors.push('id must be a stable lowercase slug');
    if (idCounts.get(e.id)>1) errors.push('duplicate id (all conflicting rows withheld)');
    if (e.edition!=='2027') errors.push('wrong edition');
    if (e.timezone!=='Europe/Zurich') errors.push('timezone must be Europe/Zurich');
    if (!['Davos','Davos-Klosters','Klosters'].includes(e.city)) errors.push('city is outside this directory');
    if (!DATE_STATUSES.includes(e.date_status)) errors.push('invalid date_status');
    if (!COST_STATUSES.includes(e.cost_status)) errors.push('invalid cost_status');
    if (!BADGE_STATUSES.includes(e.badge_status)) errors.push('invalid badge_status');
    if (![...OPEN_STATUSES,'Not open','Unverified','Closed'].includes(e.registration_status)) errors.push('invalid registration_status');
    for (const k of ['start_date','end_date','deadline','verified_at']) if (e[k] && !validISODate(e[k])) errors.push(`${k} must be YYYY-MM-DD`);
    if (e.verified_at>today) errors.push('verification date is in the future');
    if (e.date_status==='To be announced') {
      if (e.start_date || e.end_date || e.start_time || e.end_time) errors.push('TBA rows must not contain inferred calendar dates or times');
    } else if (!e.start_date || !e.end_date) errors.push('dated rows need start_date and end_date');
    for (const k of ['start_date','end_date']) if (e[k] && (e[k]<'2027-01-16' || e[k]>EDITION_END)) errors.push(`${k} is outside the January 2027 coverage window`);
    if (e.start_date && e.end_date<e.start_date) errors.push('end_date precedes start_date');
    for (const k of ['start_time','end_time']) if (e[k] && !/^([01]\d|2[0-3]):[0-5]\d$/.test(e[k])) errors.push(`${k} must be HH:MM`);
    if (e.start_date===e.end_date && e.start_time && e.end_time && e.end_time<=e.start_time) errors.push('end_time must follow start_time for a same-day event');
    if (e.cost_status==='Free confirmed' && e.price_amount!=='0') errors.push('confirmed free entry requires price_amount 0 and evidence in cost_details');
    if (e.cost_status==='Not disclosed' && (e.price_amount || e.currency)) errors.push('unpublished prices must not have a numeric amount or currency');
    if (e.cost_status==='Paid' && e.price_amount && (!/^\d+(\.\d{1,2})?$/.test(e.price_amount) || Number(e.price_amount)<=0 || !/^[A-Z]{3}$/.test(e.currency))) errors.push('paid amount requires a positive number and ISO currency');
    for (const k of ['official_url','application_url']) if (!safeUrl(e[k])) errors.push(`${k} must be a public HTTP(S) URL`);
    if (splitTags(e.source_urls).some(u=>!safeUrl(u))) errors.push('source_urls contains an unsafe URL');
    if (errors.length) {issues.push({row:index+2,id:e.id,reason:errors.join('; ')});continue;}
    if (OPEN_STATUSES.includes(e.registration_status)) events.push(e);
  }
  return {events,issues};
}
export function isPast(e,today=zurichToday()) {return (e.end_date || EDITION_END)<today || Boolean(e.deadline && e.deadline<today);}
export function filterEvents(events, filters={}, saved=new Set(), today=zurichToday()) {
  return events.filter(e=>{
    if (!filters.past && isPast(e,today)) return false;
    if (filters.saved && !saved.has(e.id)) return false;
    if (filters.q && !normalise([e.event_name,e.organiser,e.description,e.topics,e.audience_tags,e.audience_requirements,e.venue].join(' ')).includes(normalise(filters.q))) return false;
    if (filters.topic && !splitTags(e.topics).includes(filters.topic)) return false;
    if (filters.audience && !splitTags(e.audience_tags).includes(filters.audience)) return false;
    if (filters.cost && filters.cost!==e.cost_status) return false;
    if (filters.entry && filters.entry!==e.registration_status) return false;
    if (filters.noBadge && e.badge_status!=='Not required confirmed') return false;
    // Unknown dates are not silently treated as matches to a specific day.
    if (filters.date && (!e.start_date || filters.date<e.start_date || filters.date>e.end_date)) return false;
    return true;
  }).sort((a,b)=>(a.start_date||'9999').localeCompare(b.start_date||'9999') || (a.start_time||'99:99').localeCompare(b.start_time||'99:99') || a.event_name.localeCompare(b.event_name));
}
export function formatDate(value, options={}) {
  return value ? new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Zurich',day:'numeric',month:'short',...options}).format(new Date(value+'T12:00:00Z')) : 'Date to be announced';
}
export function dateLabel(e) {
  if (!e.start_date) return 'Date to be announced';
  return formatDate(e.start_date)+(e.end_date!==e.start_date?' – '+formatDate(e.end_date):'');
}
export function costLabel(e) {
  if (e.cost_status==='Free confirmed') return 'Free entry confirmed';
  if (e.cost_status==='Paid') return e.price_amount?`${e.currency} ${Number(e.price_amount).toLocaleString('en-GB')} · paid`:'Paid · see organiser';
  return 'Cost not disclosed';
}
export function cacheKey(url) {return `jm-davos-v${SCHEMA_VERSION}:`+encodeURIComponent(url);}
export function readCache(storage,url,now=Date.now()) {
  try {
    const item=JSON.parse(storage?.getItem(cacheKey(url))||'null');
    if (!item || item.version!==SCHEMA_VERSION || !Number.isFinite(item.fetchedAt) || item.fetchedAt>now || now-item.fetchedAt>CACHE_MAX_AGE_MS) return null;
    const result=validateEvents(item.rows,{today:zurichToday(new Date(now))});
    if (result.issues.length) return null;
    return {...result,fetchedAt:item.fetchedAt};
  } catch {return null;}
}
export function writeCache(storage,url,rows,now=Date.now()) {
  try {storage?.setItem(cacheKey(url),JSON.stringify({version:SCHEMA_VERSION,fetchedAt:now,rows}));return true;}
  catch {return false;}
}
export function csvCell(value) {
  let s=String(value??'');
  if (/^[=+@\t\r]/.test(s) || /^-\D/.test(s)) s="'"+s; // spreadsheet formula-injection protection
  return '"'+s.replaceAll('"','""')+'"';
}
export function toCSV(events) {return '\uFEFF'+[COLUMNS,...events.map(e=>COLUMNS.map(k=>e[k]??''))].map(row=>row.map(csvCell).join(',')).join('\r\n');}
