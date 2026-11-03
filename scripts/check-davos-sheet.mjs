/** Read-only preflight for the actual online document. Never uploads or edits rows. */
import {writeFile,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
import {loadEventsFromSheet} from '../src/features/davos/sheets-feed.mjs';
import {DAVOS_EVENTS_CSV_URL,DAVOS_SHEET_EDIT_URL} from '../src/features/davos/sheets-config.mjs';
const arg=process.argv.slice(2);
const value=(key)=>{const i=arg.indexOf(key);if(i<0)return undefined;if(!arg[i+1]||arg[i+1].startsWith('--'))throw Error(key+' needs a value.');return arg[i+1];};
const url=value('--url')||process.env.DAVOS_EVENTS_CSV_URL||process.env.VITE_DAVOS_EVENTS_CSV_URL||DAVOS_EVENTS_CSV_URL;
const reportPath=value('--report');
const report={checkedAt:new Date().toISOString(),sheet:DAVOS_SHEET_EDIT_URL,configuredCsvUrl:url,operation:'anonymous read-only CSV/schema check',liveVerified:false};
try{
 const result=await loadEventsFromSheet(url,{baseOrigin:value('--origin')});
 Object.assign(report,{liveVerified:true,rowsRead:result.rowCount,validOpenPublicRows:result.events.length,invalidRowCount:result.issues.length,issues:result.issues,sourceCheckDatesAdvanced:false});
 report.status=result.issues.length?'needs_row_fixes':result.events.length?'passed':'no_public_rows';
 if(result.issues.length||!result.events.length)process.exitCode=2;
}catch(error){Object.assign(report,{status:'failed',errorCode:error.code||'NETWORK_OR_CONFIGURATION',message:error.message,cause:error.cause?.code||error.cause?.message||null});process.exitCode=1;}
console.log(JSON.stringify(report,null,2));
if(reportPath){await mkdir(dirname(reportPath),{recursive:true});await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');}
