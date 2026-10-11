// Pure adaptation reference for the existing fetch/query layer. No network calls.
// Header names are read from the response, not assumed column positions.
const normalise=s=>String(s??'').trim().toLowerCase().replace(/\s+/g,' ');
const aliases={
 name:['event name','name','organisation name'],
 startDate:['start date'],finishDate:['finish date','end date'],location:['location'],
 category:['category'],officialUrl:['official url'],size:['size'],
 targetAudience:['target audience'],scope:['local/international','scope'],
 description:['one paragraph description','description'],ticketPrice:['ticket price','price'],logoUrl:['logo url'],
 sector:['sector'],investmentRounds:['investment rounds'],targetGeography:['target geography'],
 estimatedFundSize:['estimated fund size'],crunchbaseUrl:['crunchbase url'],pitchbookUrl:['pitchbook url'],linkedinUrl:['linkedin url'],
 type:['type'],website:['website'],headquarters:['headquarters'],founded:['founded'],teamSize:['team size'],achievements:['key achievements / products'],notes:['notes']
};
export function parseGviz(text){
 const match=text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
 if(!match)throw new Error('Unrecognised Google Sheets response');
 const parsed=JSON.parse(match[1]);if(parsed.status&&parsed.status!=='ok')throw new Error('Google Sheets query failed');
 return parseTable(parsed.table);
}
export function parseTable(table){
 if(!Array.isArray(table?.cols)||!Array.isArray(table?.rows))throw new Error('Missing table');
 const cells=r=>r.c.map(c=>c?.v??'');
 let headers=table.cols.map(c=>normalise(c.label)),rows=table.rows;
 const hasName=h=>aliases.name.some(n=>h.includes(n));
 if(!hasName(headers)){
  if(!rows.length)return {records:[],availableFields:[]};
  headers=cells(rows[0]).map(normalise);
  if(!hasName(headers))throw new Error('Required name header is missing');
  rows=rows.slice(1); // Only skip a row after positively identifying it as headers.
 }
 const indexes=Object.fromEntries(Object.entries(aliases).map(([key,names])=>[key,headers.findIndex(h=>names.includes(h))]).filter(([,i])=>i>=0));
 const records=rows.map(row=>{const values=cells(row);return Object.fromEntries(Object.entries(indexes).map(([k,i])=>[k,values[i]??'']))}).filter(r=>String(r.name??'').trim());
 return {records,availableFields:Object.keys(indexes)};
}
export function gvizDate(value){
 const match=String(value??'').match(/^Date\((\d+),(\d+),(\d+)\)$/);
 if(!match)return value;
 return `${match[1]}-${String(Number(match[2])+1).padStart(2,'0')}-${String(Number(match[3])).padStart(2,'0')}`;
}
export function combineExactEvents(records){
 const seen=new Map(),out=[];
 for(const record of records){
  const r={...record,startDate:gvizDate(record.startDate),finishDate:gvizDate(record.finishDate)};
  if(!r.name||!r.startDate||!r.finishDate||!r.officialUrl){out.push(r);continue}
  const key=[normalise(r.name),r.startDate,r.finishDate,String(r.officialUrl).replace(/\/$/,'')].join('|');
  if(seen.has(key)){const first=seen.get(key);first.sourceVariants??=[];first.sourceVariants.push(r)}
  else{seen.set(key,r);out.push(r)}
 }
 return out;
}
