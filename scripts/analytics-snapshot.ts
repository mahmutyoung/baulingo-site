import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { join, resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { snapshotStatus, localReportRoot } from './cloudflare-output.ts';
import { dateRange } from './seo-performance.ts';
type Json=Record<string,any>;
export function datasetStatus(exit:number|null,manifest:Json|null):string {
 if(!manifest)return 'unavailable';
 if(Array.isArray(manifest.reports)){
   if(manifest.reports.some((r:Json)=>r.status==='partial'))return 'partial';
   const status=snapshotStatus(manifest.reports);return exit!==0&&status==='complete'?'unavailable':status;
 }
 if(exit!==0)return 'unavailable';
 return ['complete','partial','unavailable'].includes(manifest.status)?manifest.status:'unavailable';
}
export function reusableRun(previous:Json,key:string,intact:boolean):boolean{return previous?.key===key&&previous.status==='complete'&&previous.files?.length>0&&intact;}
export function jobCacheKey(identity:Json,dependencies:Json[],configurationHash:string|null):string {
 return JSON.stringify({...identity,dependencies:dependencies.map(r=>({id:r.id,status:r.status,files:(r.files??[]).map((f:Json)=>({path:f.path,sha256:f.sha256}))})),configurationHash});
}
export function snapshotPlan(cadence:string,now=new Date()):Json[]{
 if(!['daily','weekly','monthly'].includes(cadence))throw new Error('Cadence must be daily, weekly or monthly.');
 const iso=(days:number)=>new Date(now.valueOf()-days*86400000).toISOString().slice(0,10);
 const preset=cadence==='daily'?'custom':cadence==='weekly'?'7':'28';
 const search=dateRange(preset,iso(3),iso(3)),traffic=cadence==='daily'?dateRange('custom',iso(1),iso(1)):search;
 const jobs:Json[]=[{id:'search',script:'scripts/seo-performance.ts',range:search,compare:cadence!=='daily'},{id:'ga4',script:'scripts/ga4-report.ts',range:search,blocked:search.startDate<'2026-11-27',reason:'Processed clean post-fix GA4 period not yet available.'},{id:'traffic',script:'scripts/cloudflare-report.ts',command:'traffic',range:traffic,compare:cadence==='weekly'}];
 if(cadence==='weekly')jobs.push({id:'performance',script:'scripts/cloudflare-report.ts',command:'performance',range:traffic,compare:true},{id:'indexing',script:'scripts/seo-indexing.ts'},{id:'combined',script:'scripts/seo-ga4.ts',derived:true,blocked:search.startDate<'2026-11-27',reason:'Combined report requires an entire finalized post-baseline period.'},{id:'opportunities',script:'scripts/seo-opportunities.ts',derived:true});
 if(cadence==='monthly')jobs.push({id:'search-trends',script:'scripts/seo-performance.ts',range:dateRange('90',iso(3)),compare:true},{id:'keywords-research',script:'scripts/keywords.ts',command:'research',keyword:true},{id:'keywords-historical',script:'scripts/keywords.ts',command:'historical',keyword:true},{id:'keywords-site',script:'scripts/keywords.ts',command:'research',keyword:true,seed:'site'},{id:'keywords-report',script:'scripts/keywords.ts',command:'report',derived:true,keywordReport:true});
 return jobs;
}
async function json(file:string){return JSON.parse(await readFile(file,'utf8'));}
async function files(dir:string):Promise<string[]>{const entries=await readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?files(join(dir,e.name)):Promise.resolve([join(dir,e.name)])))).flat();}
const hash=async(path:string)=>createHash('sha256').update(await readFile(path)).digest('hex');
async function execute(script:string,args:string[],dir:string):Promise<number|null>{
 return await new Promise(resolve=>{const child=spawn(process.execPath,[script,...args],{stdio:['ignore','pipe','pipe'],windowsHide:true});
 // Don't archive raw child diagnostics: provider errors may echo secrets. Scripts retain source errors in their structured reports.
 child.stdout.on('data',()=>{});child.stderr.on('data',()=>{});child.on('error',()=>resolve(1));child.on('close',resolve);});
}
async function main(){
 const[cadence,...args]=process.argv.slice(2);const opts:Json={};for(let i=0;i<args.length;i+=2){const key=args[i].slice(2);if(!['output','segment','family','force','plan'].includes(key)||!args[i+1])throw new Error('Invalid snapshot option.');opts[key]=args[i+1];}
 for(const key of ['force','plan'])if(opts[key]&&!['true','false'].includes(opts[key]))throw new Error('--'+key+' must be true or false.');
 opts.segment??='worldwide';opts.family??='all';
 const plan=snapshotPlan(cadence);if(opts.plan==='true'){console.log(JSON.stringify(plan,null,2));return;}
 const root=localReportRoot(opts.output??'.dev/snapshots');const dir=join(root,cadence,new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(dir,{recursive:true});
 let previous:Json={};try{previous=await json(join(root,cadence,'latest.json'));}catch{}
 const results:Json[]=[];
 const run=async(job:Json):Promise<Json>=>{
   const key=jobCacheKey({cadence,cycle:new Date().toISOString().slice(0,cadence==='monthly'?7:10),job,scriptHash:await hash(job.script),segment:opts.segment??null,family:opts.family??null},job.derived?results:[],job.keyword?await hash('scripts/data/keyword-research.json'):null);
   const old=previous.reports?.find((r:Json)=>r.id===job.id);let intact=false;
   if(old?.files?.length){try{intact=(await Promise.all(old.files.map(async(f:Json)=>await hash(f.path)===f.sha256))).every(Boolean);}catch{}}
   if(opts.force!=='true'&&old&&reusableRun(old,key,intact))return {...old,reused:true};
   if(job.blocked)return {id:job.id,key,status:'unavailable',note:job.reason,files:[]};
   const output=join(dir,job.id);await mkdir(output,{recursive:true});const argv:string[]=[];
   if(job.keywordReport){
     const sources=results.filter(r=>['keywords-research','keywords-historical','keywords-site'].includes(r.id));
     if(sources.length!==3||sources.some(r=>r.status!=='complete'))return {id:job.id,key,status:'unavailable',files:[],note:'The three complete keyword source reports are required.'};
     const inputs=sources.map(r=>r.files.find((f:Json)=>f.path.endsWith('keywords.json'))?.path);
     if(inputs.some(p=>!p))return {id:job.id,key,status:'unavailable',files:[],note:'Keyword source file missing.'};
     argv.push('report','--input',inputs.join(','));
   }
   if(job.derived&&!job.keywordReport){
     const source=results.find(r=>r.id==='search');const find=(id:string,suffix:string)=>results.find(r=>r.id===id)?.files?.find((f:Json)=>f.path.endsWith(suffix))?.path;
     if(source?.status!=='complete')return {id:job.id,key,status:'unavailable',note:'Required complete Search Console source unavailable.',files:[]};
     const current=find('search',job.id==='combined'?'current-page.json':'current-query_page.json');
     if(!current)return {id:job.id,key,status:'unavailable',note:'Required source file missing.',files:[]};
     argv.push(current);
     if(job.id==='combined'&&results.find(r=>r.id==='traffic')?.status==='complete'){
       const browser=find('traffic','current-browser-pages.json');if(browser)argv.push('--cloudflare',browser);
     }
     if(job.id==='opportunities'){
       argv.push(find('search','previous-query_page.json')??'-');
       if(results.find(r=>r.id==='combined')?.status==='complete')argv.push(find('combined','combined.json'));
       const index=find('indexing','indexing.json');if(index)argv.push('--indexing',index);
       argv.push('--page-current',find('search','current-page.json'),'--page-previous',find('search','previous-page.json'));
       const bundle:Json={searchPages:await json(find('search','current-page.json'))};
       for(const[name,id,suffix]of [['traffic','traffic','current-browser-pages.json'],['previousTraffic','traffic','previous-browser-pages.json'],['referrals','traffic','current-browser-refererHost.json'],['http','traffic','current-http-apex-paths.json'],['performance','performance','current-vitals-pages.json']]){
         const path=find(id,suffix);if(path){const r=await json(path);if(r.metadata?.status==='complete')bundle[name]=r;}
       }
       if(Object.keys(bundle).length>1){const path=join(output,'cloudflare-input.json');await writeFile(path,JSON.stringify(bundle,null,2)+'\n');argv.push('--cloudflare',path);}
     }
   }
   if(job.command&&!job.keywordReport)argv.push(job.command);
   if(job.range){argv.push('--start',job.range.startDate,'--end',job.range.endDate);if(job.id!=='ga4')argv.push('--range','custom','--compare',job.compare?'true':'false');}
   if(job.id==='indexing')argv.push('--limit','3','--urls','https://baulingo.app/dtz-deneme-sinavi/,https://baulingo.app/konular/cases/,https://baulingo.app/dtz-mektup-yazma/');
   if(job.keyword)argv.push('--segment',opts.segment,'--family',opts.family);
   if(job.seed)argv.push('--seed',job.seed);
   argv.push('--output',output);
   const exitCode=await execute(job.script,argv,output);const outputs=await files(output);const manifestFile=outputs.find(p=>p.endsWith('snapshot.json'));let manifest:Json|null=null;
   if(manifestFile){try{manifest=await json(manifestFile);}catch{}}
   // Existing Search Console scripts predate snapshot manifests. Validate expected reports instead of trusting exit alone.
   if(exitCode===0&&!manifest&&job.id.startsWith('search')){
     const reports:Json[]=[];for(const period of job.compare?['current','previous']:['current'])for(const name of ['total','date','query','page','query_page','country','device','query_date','page_date','appearance']){
       const file=outputs.find(p=>p.endsWith(`${period}-${name}.json`));let valid=false;try{const r=file?await json(file):null;valid=Array.isArray(r?.rows)&&r.metadata?.dataState==='final'&&r.metadata.property==='sc-domain:baulingo.app'&&(period!=='current'||(r.metadata.startDate===job.range.startDate&&r.metadata.endDate===job.range.endDate));}catch{}reports.push({name:period+'-'+name,status:valid?'complete':'unavailable'});
     }manifest={reports,status:snapshotStatus(reports)};
   }
   if(exitCode===0&&!manifest&&job.id==='indexing'){
     try{const p=outputs.find(p=>p.endsWith('indexing.json'));const r=p?await json(p):null;manifest={status:r?.inspections?.length===3&&r.sitemaps?'complete':'unavailable'};}catch{}
   }
   const status=datasetStatus(exitCode,manifest);const saved=await Promise.all(outputs.map(async path=>({path:resolve(path),sha256:await hash(path)})));
   return {id:job.id,key,status,exitCode,range:job.range??null,files:saved,sourceManifest:manifest,reused:false,note:status==='unavailable'?'Inspect authentication, source output and availability; no missing measure is zero.':null};
 };
 for(const job of plan){let result:Json;try{result=await run(job);}catch{result={id:job.id,status:'unavailable',files:[],note:'Job setup or source validation failed; inspect preserved files. Independent jobs continue.'};}results.push(result);console.log(job.id+': '+result.status+(result.reused?' (reused)':''));}
 const status=results.some(r=>r.status==='partial')?'partial':snapshotStatus(results);
 const manifest={extractedAt:new Date().toISOString(),cadence,status,reports:results,limitations:['Status describes extraction only. Review source metadata, empty responses, sampling and thresholds.','Do not sum overlapping snapshots, dimensions or distinct users. Source date boundaries differ: GA4 Berlin, Search Console Pacific, Cloudflare UTC.','Cloudflare HTTP retention is 31 days; a 28-day monthly extract is not a substitute for daily collection.','Monthly keyword jobs refresh only the selected explicit segment/family; rotate other research deliberately.','Weekly combined evidence and opportunity review require finalized post-baseline Search Console reports; run seo:combined and seo:opportunities on compatible files.']};
 await writeFile(join(dir,'snapshot.json'),JSON.stringify(manifest,null,2)+'\n');await writeFile(join(root,cadence,'latest.json'),JSON.stringify(manifest,null,2)+'\n');
 await writeFile(join(dir,'summary.md'),`# ${cadence} analytics snapshot\n\nStatus: ${status}.\n\n${results.map(r=>'- '+r.id+': '+r.status+(r.reused?' (reused)':'')).join('\n')}\n\n${manifest.limitations.join('\n\n')}\n`);
 console.log('Manifest: '+relative(process.cwd(),join(dir,'snapshot.json')));if(status!=='complete')process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e.message);process.exitCode=1;});
