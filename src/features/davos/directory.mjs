import {validateEvents,filterEvents,splitTags,formatDate,dateLabel,costLabel,isPast,zurichToday,readCache,writeCache,REFRESH_MS,COST_STATUSES,OPEN_STATUSES,toCSV,cacheKey} from './core.mjs';

import {DAVOS_EVENTS_CSV_URL,resolveEventsCsvUrl} from './sheets-config.mjs';
import {loadEventsFromSheet} from './sheets-feed.mjs';

/** Mount once per route. Call destroy on navigation/unmount. All sheet content uses textContent. */
export function mountDavosDirectory(root, options={}) {
  if (!(root instanceof HTMLElement)) throw new TypeError('A mount element is required.');
  const mode=options.mode==='preview'?'preview':'live';
  const csvUrl=String(options.csvUrl??DAVOS_EVENTS_CSV_URL);
  const now=options.now||(()=>new Date());
  let storage; try {storage=options.storage??window.localStorage;} catch {storage=null;}
  const abort=new AbortController(); let requestController,interval,busy=false,destroyed=false,events=[],status='loading',loadedAt=null,lastError='',rowIssues=0;
  let saved=new Set(); try {const stored=JSON.parse(storage?.getItem('jm-davos-shortlist-v1')||'[]');if(Array.isArray(stored))saved=new Set(stored.filter(x=>typeof x==='string'));} catch {}
  const params=new URLSearchParams(location.search);
  const filters={q:params.get('dd_q')||'',topic:params.get('dd_topic')||'',audience:params.get('dd_audience')||'',cost:params.get('dd_cost')||'',entry:params.get('dd_entry')||'',date:params.get('dd_date')||'',saved:params.get('dd_saved')==='1',noBadge:params.get('dd_noBadge')==='1',past:params.get('dd_past')==='1'};
  const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
  const on=(el,event,fn)=>el.addEventListener(event,fn,{signal:abort.signal});
  const link=(text,url,cls='')=>{const a=make('a',cls,text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
  const section=make('section','dd-root');section.setAttribute('aria-labelledby','dd-title');root.replaceChildren(section);
  const hero=make('header','dd-hero');section.append(hero);
  const eyebrow=make('div','dd-eyebrow');eyebrow.append(make('span','dd-dot'),make('span','',mode==='preview'?'DIRECTORY PREVIEW':'DAVOS ATTENDEE DIRECTORY'));hero.append(eyebrow);
  const heading=make('h1','','Davos during WEF.');heading.id='dd-title';heading.append(make('span','dd-year','2027'));hero.append(heading);
  hero.append(make('p','dd-intro','Find the right room. Know what it takes to get in.'));
  hero.append(make('p','dd-subintro','Explore attendee applications with clear audience requirements, admission terms and official registration links.'));
  const heroMeta=make('div','dd-hero-meta');heroMeta.append(make('span','','18–22 January 2027'),make('span','','Davos, Switzerland'),make('span','','All times Europe/Zurich'));hero.append(heroMeta);
  const stats=make('div','dd-stats');hero.append(stats);
  const guide=make('aside','dd-guide');guide.setAttribute('aria-label','How access works');section.append(guide);
  guide.append(make('strong','','Before you apply'),make('span','','“Interest open” is not admission. “Cost not disclosed” is not free. A side-event application does not provide a WEF Annual Meeting credential.'));
  const toolbar=make('div','dd-toolbar');section.append(toolbar);
  const searchLabel=make('label','dd-search-label','Search events');searchLabel.htmlFor='dd-search';
  const search=make('input','dd-search');search.id='dd-search';search.type='search';search.placeholder='Search AI, investors, leadership…';search.value=filters.q;search.autocomplete='off';searchLabel.append(search);toolbar.append(searchLabel);
  const toolbarActions=make('div','dd-toolbar-actions');toolbar.append(toolbarActions);
  const savedButton=make('button','dd-button','Saved events');savedButton.type='button';savedButton.setAttribute('aria-pressed',String(filters.saved));toolbarActions.append(savedButton);
  const refreshButton=make('button','dd-button','Refresh data');refreshButton.type='button';toolbarActions.append(refreshButton);
  if(mode==='preview'){refreshButton.textContent='Snapshot preview';refreshButton.disabled=true;}
  const filterPanel=make('div','dd-filter-panel');filterPanel.id='dd-filter-panel';section.append(filterPanel);
  const filterToggle=make('button','dd-button dd-filter-toggle','Filters');filterToggle.type='button';filterToggle.setAttribute('aria-expanded','false');filterToggle.setAttribute('aria-controls','dd-filter-panel');toolbarActions.prepend(filterToggle);on(filterToggle,'click',()=>{const expanded=filterPanel.classList.toggle('dd-expanded');filterToggle.setAttribute('aria-expanded',String(expanded));});
  const filterGrid=make('div','dd-filters');filterPanel.append(filterGrid);const selects={};
  function addSelect(key,label,values=[]) {
    const wrapper=make('label','dd-field',label);const input=make('select','');input.id='dd-'+key;wrapper.htmlFor=input.id;
    input.append(new Option('All '+label.toLowerCase(),''));values.forEach(v=>input.append(new Option(v,v)));wrapper.append(input);filterGrid.append(wrapper);selects[key]=input;
    input.value=filters[key];on(input,'change',()=>{filters[key]=input.value;syncURL();renderResults();});return input;
  }
  addSelect('topic','Topics');addSelect('audience','Audiences');addSelect('cost','Costs',COST_STATUSES);addSelect('entry','Application statuses',OPEN_STATUSES);
  const dayWrapper=make('label','dd-field','Day');const daySelect=make('select','');daySelect.id='dd-date';dayWrapper.htmlFor=daySelect.id;daySelect.append(new Option('Any date',''));
  for(let d=16;d<=24;d++){const val=`2027-01-${d}`;daySelect.append(new Option(formatDate(val,{weekday:'short'}),val));}daySelect.value=filters.date;dayWrapper.append(daySelect);filterGrid.append(dayWrapper);selects.date=daySelect;
  on(daySelect,'change',()=>{filters.date=daySelect.value;syncURL();renderResults();});
  const controls=make('div','dd-controls');filterPanel.append(controls);
  const extraFilters=make('div','dd-extra-filters');controls.append(extraFilters);
  function checkbox(key,label){const wrap=make('label','dd-check');const box=make('input');box.type='checkbox';box.checked=filters[key];wrap.append(box,make('span','',label));extraFilters.append(wrap);on(box,'change',()=>{filters[key]=box.checked;syncURL();renderResults();});return box;}
  const noBadge=checkbox('noBadge','No separate badge: confirmed only');const past=checkbox('past','Include past dates / deadlines');
  const tools=make('div','dd-tools');const reset=make('button','dd-text-button','Reset filters');reset.type='button';const share=make('button','dd-text-button','Share these filters');share.type='button';const download=make('button','dd-text-button','Download this view');download.type='button';tools.append(reset,share,download);controls.append(tools);
  const statusbar=make('div','dd-statusbar');section.append(statusbar);const count=make('p','dd-count');count.setAttribute('aria-live','polite');const freshness=make('p','dd-freshness');statusbar.append(count,freshness);
  const message=make('div','dd-message');message.setAttribute('role','status');section.append(message);
  const results=make('div','dd-results');results.setAttribute('aria-label','Event listings');section.append(results);
  const footer=make('footer','dd-footer');section.append(footer);
  footer.append(make('p','','Independent directory by Dr. Justinas Mišeikis. Not affiliated with or endorsed by the World Economic Forum. Organisers decide eligibility and admission.'));
  footer.append(make('p','','Saved events stay in this browser. They are a shortlist, not registrations. Listings cover the core week and selected adjacent dates through 24 January.'));
  function syncURL(){try{const p=new URLSearchParams(location.search);for(const[k,v]of Object.entries(filters)){if(v)p.set('dd_'+k,typeof v==='boolean'?'1':v);else p.delete('dd_'+k);}history.replaceState(history.state,'',location.pathname+(p.size?'?'+p:'')+location.hash);}catch{}}
  function setOptions(key,values){const input=selects[key];input.replaceChildren(new Option('All '+(key==='topic'?'topics':'audiences'),''));values.forEach(v=>input.append(new Option(v,v)));if(filters[key]&&!values.includes(filters[key]))input.append(new Option(filters[key],filters[key]));input.value=filters[key];}
  function refreshFilters(){setOptions('topic',[...new Set(events.flatMap(e=>splitTags(e.topics)))].sort());setOptions('audience',[...new Set(events.flatMap(e=>splitTags(e.audience_tags)))].sort());}
  function updateStatus(){
    if(destroyed)return;
    refreshButton.disabled=busy||mode==='preview';refreshButton.textContent=mode==='preview'?'Snapshot preview':busy?'Checking data…':'Refresh data';
    const active=filterEvents(events,{past:filters.past},new Set(),zurichToday(now()));
    stats.replaceChildren();
    for(const[n,label]of [[active.length,'attendee routes'],[active.filter(e=>e.start_date).length,'with published dates'],[active.filter(e=>e.cost_status==='Not disclosed').length,'with cost to confirm']]){const block=make('div','dd-stat');block.append(make('strong','',String(n)),make('span','',label));stats.append(block);}
    const dates=[...new Set(events.map(e=>e.verified_at))].sort();
    freshness.textContent=dates.length?`Sources checked ${formatDate(dates[0])}${dates.length>1?'–'+formatDate(dates.at(-1)):''} ${dates.at(-1).slice(0,4)}`:'';
    message.className='dd-message';message.hidden=false;
    const loaded=loadedAt?new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Zurich',hour:'2-digit',minute:'2-digit'}).format(new Date(loadedAt)):'';
    if(status==='loading')message.textContent='Loading the published event directory…';
    else if(status==='config') {message.classList.add('dd-message-warning');message.textContent='The live data source is not configured. Connect the published Google Sheets CSV URL before releasing this page.';}
    else if(status==='error'){message.classList.add('dd-message-warning');message.textContent='The directory could not be loaded. '+lastError.replace(/([^.!?])$/,'$1.')+' No unverified fallback has been substituted.';}
    else if(status==='cache'){message.classList.add('dd-message-warning');message.textContent='Live refresh failed. Showing the last successful local copy (loaded '+formatDate(zurichToday(new Date(loadedAt)))+' at '+loaded+' Zurich time, less than 24 hours old). Check the organiser before acting.';}
    else if(status==='preview'){message.classList.add('dd-message-preview');message.textContent='Preview snapshot checked 3 November 2026. The live Google Sheets connection is not enabled in this preview. Unknown costs and badge requirements are intentionally visible.';}
    else if(rowIssues){message.classList.add('dd-message-warning');message.textContent=`Loaded at ${loaded} Zurich time. ${rowIssues} invalid row(s) withheld for editorial review. Source verification dates have not changed.`;}
    else {message.textContent=`Sheet loaded at ${loaded} Zurich time. Updates are checked every five minutes while this page is visible. This does not re-check organiser websites.`;}
    if(dates.length && (now().getTime()-Date.parse(dates[0]+'T12:00:00Z'))>7*86400000){message.append(make('span','dd-stale-note',' Some source checks are over seven days old. Reconfirm availability, fees and access before applying.'));}
  }
  function detailBlock(title,text){const block=make('div','dd-detail-block');block.append(make('h3','',title),make('p','',text));return block;}
  function eventCard(e){
    const article=make('article','dd-card');article.id='event-'+e.id;
    const main=make('div','dd-card-main');article.append(main);
    const date=make('div','dd-date-block');date.append(make('strong','',dateLabel(e)),make('span','',e.start_time?`${e.start_time}${e.end_time?'–'+e.end_time:''} CET`:e.start_date?'Time not published':'January 2027 programme'));
    if(e.date_status!=='Confirmed')date.append(make('small','',e.date_status==='To be announced'?'Exact day unverified':e.date_status));main.append(date);
    const content=make('div','dd-event-content');const top=make('div','dd-event-title');const h=make('h2','',e.event_name);top.append(h);content.append(top);
    content.append(make('p','dd-description',e.description));
    const topics=make('div','dd-tags');splitTags(e.topics).slice(0,3).forEach(t=>topics.append(make('span','dd-tag',t)));content.append(topics);
    const audience=make('p','dd-audience');audience.append(make('strong','','Audience: '),document.createTextNode(splitTags(e.audience_tags).join(' · ')));content.append(audience);content.append(make('p','dd-eligibility',e.audience_requirements));
    content.append(make('p','dd-venue',e.venue));main.append(content);
    const access=make('div','dd-access');access.append(make('span','dd-status-pill',isPast(e,zurichToday(now()))?'Date / deadline passed':e.registration_status),make('strong','dd-cost',costLabel(e)),make('span','dd-badge','Badge / wristband: '+(e.badge_status==='Not required confirmed'?'not required (confirmed)':e.badge_status==='Required'?'required':'not disclosed')));
    const save=make('button','dd-save',saved.has(e.id)?'✓ Saved':'+ Save');save.type='button';save.dataset.saveId=e.id;save.setAttribute('aria-pressed',String(saved.has(e.id)));save.setAttribute('aria-label',(saved.has(e.id)?'Remove from':'Add to')+' saved events: '+e.event_name);access.append(save);
    main.append(access);
    const bottom=make('div','dd-card-bottom');const details=make('details','dd-details');const summary=make('summary','','Audience, cost & access details');details.append(summary);
    const detailGrid=make('div','dd-detail-grid');details.append(detailGrid);detailGrid.append(detailBlock('Who can attend',e.audience_requirements),detailBlock('Payment and cost',e.cost_details),detailBlock('What this request covers',e.admission_scope),detailBlock('Badges and entry',e.badge_details));
    if(e.cost_status==='Not disclosed'||e.badge_status==='Not disclosed'){
      const confirm=detailBlock('Ask before committing','“If my application is approved, is admission complimentary? Does this session require any paid pass, membership, meeting commitment, WEF credential, hotel badge or security badge?”');confirm.classList.add('dd-confirm');detailGrid.append(confirm);
    }
    detailGrid.append(detailBlock('Deadline',e.deadline?formatDate(e.deadline,{year:'numeric'})+'; confirm cut-off time with the organiser.':'No application deadline verified. Availability may change without notice.'));
    const source=detailBlock('Source check',`Checked ${formatDate(e.verified_at,{year:'numeric'})}. ${e.verification_notes}`);const sources=make('div','dd-source-links');splitTags(e.source_urls).forEach((url,i)=>sources.append(link('Source '+(i+1),url)));source.append(sources);detailGrid.append(source);
    bottom.append(details);const actions=make('div','dd-event-actions');actions.append(link('Organiser ↗',e.official_url,'dd-organiser'));
    if(!isPast(e,zurichToday(now())))actions.append(link(e.entry_route==='Visitor application'?'Visitor application ↗':e.entry_route==='Session registration'?'Session registration ↗':e.registration_status==='Interest open'?'Request an invitation ↗':'Apply with organiser ↗',e.application_url,'dd-apply'));
    bottom.append(actions);article.append(bottom);return article;
  }
  function renderResults(){
    if(destroyed)return;
    const shown=filterEvents(events,filters,saved,zurichToday(now()));
    const activeFilters=['topic','audience','cost','entry','date','noBadge','past'].filter(k=>filters[k]).length;filterToggle.textContent='Filters'+(activeFilters?' ('+activeFilters+')':'');
    savedButton.textContent=`Saved events (${events.filter(e=>saved.has(e.id)).length})`;savedButton.setAttribute('aria-pressed',String(filters.saved));
    count.textContent=status==='loading'?'Loading events…':`${shown.length} ${shown.length===1?'event':'events'} shown${filters.saved?' from your shortlist':''}`;
    results.replaceChildren();
    if(!shown.length && !['loading','config','error'].includes(status)){
      const empty=make('div','dd-empty');empty.append(make('h2','','No matching events'),make('p','',filters.cost==='Free confirmed'?'No matching event currently has verified free admission. Events with unpublished prices are not counted as free.':filters.noBadge?'No matching event currently has an explicit no-separate-badge confirmation. Unknown badge requirements are not treated as badge-free.':filters.date?'No matching events have a published date for this day. Clear the day filter to include dates still to be announced.':'Try clearing a filter or returning to all events. Saved events are stored only in this browser.'));results.append(empty);
    }else shown.forEach(e=>results.append(eventCard(e)));
    updateStatus();
  }
  async function refresh(){
    if(destroyed||busy||mode==='preview')return;
    if(!csvUrl){status='config';renderResults();return;}
    // Public Google Sheets URLs only. A configured same-origin proxy is also supported.
    let url;try{url=resolveEventsCsvUrl(csvUrl,location.origin==='null'?undefined:location.origin);}catch(error){status='error';lastError=error.message;renderResults();return;}
    busy=true;updateStatus();requestController=new AbortController();
    try{
      const checked=await loadEventsFromSheet(url.href,{signal:requestController.signal,today:zurichToday(now()),baseOrigin:location.origin==='null'?undefined:location.origin});
      if(destroyed)return;
      events=checked.events;rowIssues=checked.issues.length;loadedAt=now().getTime();status='live';lastError='';
      // Replace, never merge. Deleted, unpublished and closed rows disappear on a successful fetch.
      writeCache(storage,url.href,events,loadedAt);refreshFilters();
    }catch(error){
      if(destroyed)return;
      // An explicit access revocation must not retain a previously public copy in this UI.
      if(error.code==='ACCESS_DENIED'){try{storage?.removeItem(cacheKey(url.href));}catch{}}
      const cached=error.code==='ACCESS_DENIED'?null:readCache(storage,url.href,now().getTime());lastError=error.name==='AbortError'?'The request was cancelled.':error.message;
      if(cached){events=cached.events;loadedAt=cached.fetchedAt;status='cache';rowIssues=0;refreshFilters();}
      else {events=[];loadedAt=null;status='error';refreshFilters();}
    }finally{busy=false;if(!destroyed)renderResults();}
  }
  on(results,'click',(event)=>{const button=event.target.closest('[data-save-id]');if(!button||!results.contains(button))return;const id=button.dataset.saveId;saved.has(id)?saved.delete(id):saved.add(id);try{storage?.setItem('jm-davos-shortlist-v1',JSON.stringify([...saved]));}catch{}renderResults();results.querySelector(`[data-save-id="${id}"]`)?.focus();});
  on(search,'input',()=>{filters.q=search.value;syncURL();renderResults();});
  on(savedButton,'click',()=>{filters.saved=!filters.saved;syncURL();renderResults();});on(refreshButton,'click',refresh);
  on(download,'click',()=>{const shown=filterEvents(events,filters,saved,zurichToday(now()));const objectUrl=URL.createObjectURL(new Blob([toCSV(shown)],{type:'text/csv;charset=utf-8;'}));const a=make('a');a.href=objectUrl;a.download='davos-2027-events.csv';a.click();setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);});
  on(reset,'click',()=>{Object.keys(filters).forEach(k=>filters[k]=typeof filters[k]==='boolean'?false:'');search.value='';Object.values(selects).forEach(s=>s.value='');noBadge.checked=false;past.checked=false;syncURL();renderResults();});
  on(share,'click',async()=>{if(location.protocol==='file:'){message.textContent='This is an offline preview. Filter links become shareable on the published website.';return;}try{await navigator.clipboard.writeText(location.href);share.textContent='Link copied';}catch{message.textContent='Copy this page’s address to share the current filters: '+location.href;}});
  if(mode==='preview'){
    const checked=validateEvents(options.seedEvents||[],{today:zurichToday(now())});events=checked.events;rowIssues=checked.issues.length;status='preview';refreshFilters();renderResults();
  }else{
    renderResults();refresh();interval=setInterval(()=>{if(document.visibilityState==='visible')refresh();},Math.max(REFRESH_MS,Number(options.refreshMs)||REFRESH_MS));
    on(document,'visibilitychange',()=>{if(document.visibilityState==='visible' && (!loadedAt || now().getTime()-loadedAt>=REFRESH_MS))refresh();});
  }
  return {refresh,destroy(){destroyed=true;abort.abort();requestController?.abort();if(interval)clearInterval(interval);root.replaceChildren();}};
}
