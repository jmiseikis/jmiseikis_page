import {calculateScenario} from './calculator.mjs?v=full-4';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=v=>String(v??'').replace(/—/g,' - ');
const eh=v=>escapeHTML(clean(v));
function safeURL(value){try{const url=new URL(String(value).startsWith('www.')?'https://'+value:value);return ['https:','http:'].includes(url.protocol)?url.href:null}catch{return null}}
function external(label,url){const safe=safeURL(url);return safe?`<a class="text-link" href="${escapeHTML(safe)}" target="_blank" rel="noopener noreferrer">${eh(label)} <span aria-hidden="true">↗</span></a>`:''}
function badges(items){return `<div class="tags">${items.filter(Boolean).map(v=>`<span class="tag">${eh(v)}</span>`).join('')}</div>`}
const theme=$('#theme-toggle');
function updateTheme(){const dark=document.documentElement.classList.contains('dark');theme?.setAttribute('aria-pressed',String(dark));if(theme)theme.textContent=dark?'Light theme':'Dark theme'}
updateTheme();theme?.addEventListener('click',()=>{document.documentElement.classList.toggle('dark');try{localStorage.setItem('jm-preview-theme',document.documentElement.classList.contains('dark')?'dark':'light')}catch{}updateTheme()});
const menu=$('.mobile-menu');
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary').focus()}});
document.addEventListener('click',e=>{if(menu?.open&&!menu.contains(e.target))menu.open=false});
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.open=false));

const enquiry=$('#enquiry-form');
if(enquiry){
 const intent=new URLSearchParams(location.search).get('enquiry');if([...enquiry.elements.intent.options].some(o=>o.value===intent))enquiry.elements.intent.value=intent;
 enquiry.addEventListener('submit',e=>{e.preventDefault();if(!enquiry.reportValidity())return;const d=new FormData(enquiry),result=$('#enquiry-result');result.replaceChildren();let title=document.createElement('h3');title.textContent='Enquiry preview. Nothing sent.';let text=document.createElement('p');text.textContent=`${d.get('name')}${d.get('organisation')?' | '+d.get('organisation'):''}\n${enquiry.elements.intent.selectedOptions[0].text}\n\n${d.get('message')}`;result.append(title,text);result.hidden=false;result.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})});
}

if($('#paper-list')){
 const rows=$$('[data-paper]');
 function filterPapers(){let count=0;const query=$('#paper-search').value.toLocaleLowerCase(),type=$('#paper-type').value;rows.forEach(r=>{r.hidden=!(r.textContent.toLocaleLowerCase().includes(query)&&(!type||r.dataset.type===type));if(!r.hidden)count++});$('#paper-count').textContent=`${count} of ${rows.length} selected publications`;$('#paper-empty').hidden=count>0}
 $('#paper-search').addEventListener('input',filterPapers);$('#paper-type').addEventListener('change',filterPapers);$('#paper-reset').addEventListener('click',()=>{$('#paper-search').value='';$('#paper-type').value='';filterPapers()});filterPapers();
}

const directory=$('[data-directory]');
if(directory){
 const type=directory.dataset.directory;let records=[],filtered=[],page=1,view='list';const pageSize=12;
 const controls=$$('[data-filter]');const query=$('#directory-search');const results=$('#directory-results');
 const localToday=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const split=v=>String(v??'').split(',').map(x=>x.trim()).filter(Boolean);
 const missing=v=>!v||['—','-','N/A','unknown'].includes(String(v));
 const meta=(label,v)=>missing(v)?'':`<p class="item-meta"><b>${eh(label)}</b> ${eh(v)}</p>`;
 const prettyDate=value=>{if(!value)return 'Date to confirm';const d=new Date(value+'T12:00:00');return Number.isNaN(d.getTime())?'Date to confirm':new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(d)};
 function card(r){
  let left='',right='';
  if(type==='robotics'){
   left=badges([r.category,r.type])+`<h2>${eh(r.name)}</h2>`+meta('Location:',r.headquarters)+meta('Founded:',r.founded)+meta('Team size:',r.teamSize);
   right=`<p>${eh(r.description)}</p>`+(r.achievements?`<details class="detail-toggle"><summary>Products & achievements</summary><p>${eh(r.achievements)}</p></details>`:'')+`<div class="links">${external('Visit website',r.website)}</div>`;
  }else if(type==='vcs'){
   left=badges(split(r.sector))+`<h2>${eh(r.name)}</h2>`+meta('Stage:',r.investmentRounds)+meta('Geography:',r.targetGeography)+meta('Audience:',r.targetAudience);
   right=`<p>${eh(r.description)}</p>`+(!missing(r.estimatedFundSize)?`<details class="detail-toggle"><summary>Financial figure from source</summary><p>${eh(r.estimatedFundSize)}. Labelled “Estimated Fund Size” in the original directory; definition and reference date need confirmation.</p></details>`:'')+`<div class="links">${external('Website',r.officialUrl)}${external('LinkedIn',r.linkedinUrl)}${external('Crunchbase',r.crunchbaseUrl)}${external('PitchBook',r.pitchbookUrl)}</div>`;
  }else{
   const past=(r.finishDate||r.startDate)<localToday;
   left=badges([r.category,past?'Past event':'Upcoming',r.scope])+`<h2>${eh(r.name)}</h2>`+meta('Date:',prettyDate(r.startDate)+(r.finishDate&&r.finishDate!==r.startDate?' - '+prettyDate(r.finishDate):''))+meta('Location:',r.location)+meta('Size:',r.size);
   right=`<p>${eh(r.description)}</p>`+meta('Audience:',r.targetAudience)+`<div class="links">${external('Event website',r.officialUrl)}</div>`;
  }
  return `<article class="directory-item"><div>${left}</div><div class="directory-main">${right}</div></article>`;
 }
 function render(){
  const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));page=Math.min(page,totalPages);const start=(page-1)*pageSize;
  results.innerHTML=filtered.slice(start,start+pageSize).map(card).join('');results.classList.toggle('grid',view==='grid');
  $('#directory-count').textContent=`${filtered.length} of ${records.length} ${type==='robotics'?'organisations':type==='vcs'?'investors':'events'}${filtered.length?` | Showing ${start+1}-${Math.min(start+pageSize,filtered.length)}`:''}`;
  $('#directory-empty').hidden=filtered.length>0;const pg=$('#directory-pagination');pg.hidden=totalPages<=1;
  pg.innerHTML=`<button class="button secondary" data-page="prev" ${page===1?'disabled':''}>← Previous</button><span>Page ${page} of ${totalPages}</span><button class="button secondary" data-page="next" ${page===totalPages?'disabled':''}>Next →</button>`;
  pg.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>{page+=b.dataset.page==='prev'?-1:1;render();$('#directory-count').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('#directory-count').setAttribute('tabindex','-1');$('#directory-count').focus({preventScroll:true})}));
 }
 function filter(){page=1;const q=query.value.toLocaleLowerCase().trim();
  const from=$('#date-from')?.value,to=$('#date-to')?.value;
  filtered=records.filter(r=>{
   if(q&&!Object.values(r).filter(x=>typeof x==='string').join(' ').toLocaleLowerCase().includes(q))return false;
   if(!controls.every(c=>!c.value||(c.dataset.multi==='true'?split(r[c.dataset.filter]).includes(c.value):String(r[c.dataset.filter]??'')===c.value)))return false;
   if(type==='events'){
    const end=r.finishDate||r.startDate;
    if(!$('#show-past').checked&&end&&end<localToday)return false;
    if(from&&end<from)return false;if(to&&r.startDate>to)return false;
   }return true;
  });render();
 }
 function reset(){query.value='';controls.forEach(c=>c.value='');if(type==='events'){$('#date-from').value='';$('#date-to').value='';$('#show-past').checked=false}filter()}
 async function load(){
  $('#directory-error').hidden=true;$('#directory-count').textContent='Loading directory…';
  try{const res=await fetch(`/data/${type}.json`);if(!res.ok)throw new Error('Snapshot unavailable');const data=await res.json();records=data.records;
   if(type==='events'){records.forEach(r=>r.canton=r.location.split(',').pop().trim());records.sort((a,b)=>a.startDate.localeCompare(b.startDate)||a.name.localeCompare(b.name))}
   controls.forEach(c=>{const values=[...new Set(records.flatMap(r=>c.dataset.multi==='true'?split(r[c.dataset.filter]):[String(r[c.dataset.filter]??'')]).filter(v=>!missing(v)))].sort((a,b)=>a.localeCompare(b));const selected=c.value;c.replaceChildren(c.options[0]);values.forEach(v=>c.add(new Option(v,v)));c.value=values.includes(selected)?selected:''});filter();
  }catch(err){$('#directory-count').textContent='Directory unavailable';$('#directory-error').hidden=false;results.replaceChildren();$('#directory-empty').hidden=true;$('#directory-pagination').hidden=true}
 }
 query.addEventListener('input',filter);controls.forEach(c=>c.addEventListener('change',filter));['date-from','date-to','show-past'].forEach(id=>$('#'+id)?.addEventListener('change',filter));
 $('#clear-filters').addEventListener('click',reset);$('#empty-reset').addEventListener('click',reset);$('#directory-retry').addEventListener('click',load);
 $$('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;$$('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render()}));load();
}



if($('#calculator')){
 const numberInputs=$$('.calc-control input[type=number]'),ranges=$$('.calc-control input[type=range]');const defaults=Object.fromEntries(numberInputs.map(n=>[n.name,Number(n.defaultValue)]));
 const money=value=>new Intl.NumberFormat('en-CH',{style:'currency',currency:$('#currency').value,maximumFractionDigits:0}).format(value);
 const metricMoney=value=>Math.abs(value)>=100000?new Intl.NumberFormat('en',{style:'currency',currency:$('#currency').value,notation:'compact',maximumFractionDigits:2}).format(value):money(value);
 function drawChart(result){
  const W=560,H=295,L=70,R=20,T=20,B=40;const values=result.series.flatMap(p=>[p.cash,p.economic]);let min=Math.min(0,...values),max=Math.max(0,...values);if(max===min)max=min+1;const pad=(max-min)*.06;min-=pad;max+=pad;
  const x=m=>L+m/result.months*(W-L-R),y=v=>T+(max-v)/(max-min)*(H-T-B);
  const ticks=Array.from({length:5},(_,i)=>min+(max-min)*i/4);
  const compact=v=>new Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:1}).format(v);
  const cash=result.series.map(p=>`${x(p.month)},${y(p.cash)}`).join(' '),economic=result.series.map(p=>`${x(p.month)},${y(p.economic)}`).join(' ');
  $('#cash-chart').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="chart-title chart-desc"><title id="chart-title">Cumulative cash position over ${result.months} months</title><desc id="chart-desc">Net cash starts at ${money(result.series[0].cash)} after setup and ends at ${money(result.cashGain)}. The dashed line includes explicitly recognised productivity value.</desc>${ticks.map(t=>`<line class="chart-grid" x1="${L}" y1="${y(t)}" x2="${W-R}" y2="${y(t)}"/><text class="chart-label" x="${L-9}" y="${y(t)+4}" text-anchor="end">${compact(t)}</text>`).join('')}<line class="chart-zero" x1="${L}" y1="${y(0)}" x2="${W-R}" y2="${y(0)}"/><polyline class="chart-economic" points="${economic}"/><polyline class="chart-cash" points="${cash}"/>${[0,Math.round(result.months/2),result.months].map(m=>`<text class="chart-label" x="${x(m)}" y="${H-13}" text-anchor="middle">Month ${m}</text>`).join('')}</svg>`;
 }
 function update(){
  $$('[data-currency-unit]').forEach(el=>el.textContent=$('#currency').value);
  if(numberInputs.some(i=>!i.checkValidity())){$('#calc-status').textContent='Enter a valid value within the stated range to refresh results.';return}
  const s=Object.fromEntries(numberInputs.map(i=>[i.name,Number(i.value)]));const r=calculateScenario(s);
  $('#metric-monthly').textContent=metricMoney(r.cashMonthly);$('#metric-payback').textContent=r.payback===null?'Not within term':r.payback===0?'Immediate':`${r.payback} month${r.payback===1?'':'s'}`;$('#metric-roi').textContent=r.roi===null?'Not defined':`${Math.round(r.roi)}%`;$('#metric-gain').textContent=metricMoney(r.cashGain);$('#metric-gain').title=money(r.cashGain);
  const rows=[['Base payroll',r.base],['Benefits & overhead',r.overhead],['Turnover cost assumption',r.turnover],['Cashable labour avoided',r.labourAvoided],['Cashable quality / incident savings',r.quality],['Subscription cost',-r.subscription],['Additional operating costs',-s.operations],['Net monthly cash benefit',r.cashMonthly],['Extra productivity value (separate)',r.productiveValue]];
  $('#cash-breakdown').innerHTML=rows.map(([label,value],i)=>`<div ${i===7?'class="total"':''}><dt>${label}</dt><dd>${money(value)}</dd></div>`).join('');drawChart(r);
  $('#calc-status').textContent='Results refreshed. Modelled benefits are assumptions and should be validated against the proposed deployment.';
 }
 numberInputs.forEach(i=>i.addEventListener('input',()=>{const range=$(`[data-for="${i.name}"]`);if(i.checkValidity())range.value=i.value;update()}));ranges.forEach(i=>i.addEventListener('input',()=>{$(`#${i.dataset.for}-number`).value=i.value;update()}));$('#currency').addEventListener('change',update);
 $('#calc-reset').addEventListener('click',()=>{numberInputs.forEach(i=>i.value=defaults[i.name]);ranges.forEach(i=>i.value=defaults[i.dataset.for]);$('#currency').value='USD';update()});update();
}
