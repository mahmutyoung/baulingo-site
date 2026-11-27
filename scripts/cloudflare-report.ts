import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { dateRange, previousRange, toCsv } from './seo-performance.ts';
import { mapUrl } from './seo-content.ts';
import { writeContentReport } from './cloudflare-content.ts';
import { writeSnapshot } from './cloudflare-output.ts';

type Json = Record<string, any>;
const endpoint='https://api.cloudflare.com/client/v4';
const datasets={rum:'rumPageloadEventsAdaptiveGroups',vitals:'rumWebVitalsEventsAdaptiveGroups',performance:'rumPerformanceEventsAdaptiveGroups',http:'httpRequestsAdaptiveGroups',workers:'workersInvocationsAdaptive'} as const;
export async function extractWindows(start:number,end:number,maxDuration:number,limit:number,minimum:number,query:(start:number,end:number)=>Promise<Json[]>):Promise<Json[]> {
 if(!Number.isFinite(maxDuration)||maxDuration*1000<minimum||limit<1||start>=end)throw new Error('Invalid dataset window limits.');
 const step=Math.floor(maxDuration*1000/minimum)*minimum;
 const fetchWindow=async(a:number,b:number):Promise<Json[]>=>{
   const rows=await query(a,b);
   if(rows.length<limit)return rows.map(row=>({...row,windowStart:new Date(a).toISOString(),windowEnd:new Date(b).toISOString()}));
   if(b-a<=minimum)throw new Error('Cloudflare results may be truncated; narrow dimensions or filters.');
   const mid=a+Math.floor((b-a)/minimum/2)*minimum;
   return [...await fetchWindow(a,mid),...await fetchWindow(mid,b)];
 };
 const rows:Json[]=[];for(let a=start;a<end;a+=step)rows.push(...await fetchWindow(a,Math.min(a+step,end)));return rows;
}
export function performanceValues(row:Json):Json {
 const extra:Json={};for(const [key,value] of Object.entries(row))if(/P(?:50|75|90)$/.test(key)&&!key.startsWith('cumulativeLayoutShift')&&typeof value==='number')extra[key+'_ms']=value<0?null:value/1000;
 return {...row,...extra};
}
export function selectedFields(selection:string):string[] {
 const tokens=selection.match(/[A-Za-z][A-Za-z0-9_]*|[{}]/g)??[], result:string[]=[], stack:string[]=[];
 for(let i=0;i<tokens.length;i++){const name=tokens[i];if(name==='}'){stack.pop();continue;}if(tokens[i+1]==='{'){stack.push(name);i++;}else result.push([...stack,name].join('_'));}return result;
}
export function datasetAccess(settings:Json,selection:string,start:number,now=Date.now()) {
 if(!settings?.enabled)throw new Error('Dataset unavailable.');
 const fields=selectedFields(selection),unsupported=fields.filter(f=>!settings.availableFields.includes(f));
 if(unsupported.length)throw new Error('Unsupported dataset fields: '+unsupported.join(', '));
 if(fields.length>settings.maxNumberOfFields)throw new Error('Selection exceeds dataset field limit.');
 if(now-start>settings.notOlderThan*1000)throw new Error('Requested period exceeds current retention limit.');
}
export function workerValues(row:Json):Json {
 const extra:Json={};for(const [key,value] of Object.entries(row))if(/^(cpuTimeUs|requestDuration|wallTime|(?:cpuTime|requestDuration|wallTime)P(?:50|75|90))$/.test(key)&&typeof value==='number')extra[key+'_ms']=value<0?null:value/1000;
 const status=Number(row.httpResponseStatus);
 return {...row,...extra,http_outcome:row.httpResponseStatus===undefined?'unavailable':status===0?'no_http_response':status>=500?'server_error':status>=400?'client_error':status>=300?'redirect':'response'};
}
export function ranges(preset:string,end:string,start?:string) {
  const r=dateRange(preset,end,start), p=previousRange(r);
  return {start:r.startDate,end:r.endDate,previousStart:p.startDate,previousEnd:p.endDate};
}
export function flatten(row:Json):Json { return {...row.dimensions,...row.avg,...row.sum,...row.quantiles,...('count' in row?{count:row.count}:{})}; }
export function ensureComplete(rows:Json[],limit:number) { if(rows.length>=limit) throw new Error('Cloudflare results may be truncated; narrow the query.'); }
export function mapCloudflarePage(host:string,path:string) { return mapUrl(`https://${host}${path}`); }
export function classifyHttp(row:Json):string {
  const path=String(row.clientRequestPath??''), status=Number(row.edgeResponseStatus), type=String(row.edgeResponseContentTypeName??'').toLowerCase();
  if(path.startsWith('/cdn-cgi/rum')) return 'beacon';
  if(status>=300&&status<400) return 'redirect';
  if(status===404||status===410) return 'missing';
  if(path.startsWith('/api/')) return 'api';
  if(/\.(mp3|m4a|wav|mp4|webm|ogg)$/i.test(path)) return 'media';
  if(/\.(css|js|mjs|woff2?|png|jpe?g|webp|svg|ico)$/i.test(path)) return 'asset';
  if(type.includes('html')) return 'html';
  return 'unknown';
}
export function httpEvidence(row:Json):Json {
 const host=row.clientRequestHTTPHost,status=Number(row.edgeResponseStatus);
 return {...row,request_class:classifyHttp(row),host_scope:host==='baulingo.app'?'production_apex':host==='www.baulingo.app'?'production_www':'unintended',automation:row.verifiedBotCategory?'verified_bot':'unknown',is_html_response:String(row.edgeResponseContentTypeName??'').includes('html'),is_redirect:status>=300&&status<400,is_missing:status===404||status===410,is_client_error:status>=400&&status<500,is_server_error:status>=500&&status<600};
}
export async function graphql(token:string,query:string,fetcher:typeof fetch=fetch,sleep=(ms:number)=>new Promise<void>(r=>setTimeout(r,ms))):Promise<Json> {
  let response:Response|undefined;
  for(let attempt=0;attempt<4;attempt++) {
    response=await fetcher(endpoint+'/graphql',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query}),redirect:'error',signal:AbortSignal.timeout(30000)});
    if(response.ok) break;
    if((response.status===429||response.status>=500)&&attempt<3){await sleep(1000*2**attempt);continue;}
    throw new Error(`Cloudflare HTTP ${response.status}; check token, permissions and query limits.`);
  }
  if(!response?.ok) throw new Error('Cloudflare request failed.');
  const data=await response.json() as Json;
  if(data.errors?.length) throw new Error('Cloudflare GraphQL error: '+data.errors.map((e:Json)=>String(e.message ?? 'unknown').replaceAll(token,'[redacted]')).join('; '));
  if(!data.data) throw new Error('Cloudflare GraphQL returned no data.');
  return data.data;
}
async function rest(token:string,path:string):Promise<Json> {
  const r=await fetch(endpoint+path,{headers:{Authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(30000)});
  if(!r.ok) throw new Error(`Cloudflare discovery HTTP ${r.status}; check token and resource permissions.`);
  const j=await r.json() as Json; if(!j.success) throw new Error('Cloudflare resource discovery failed.');return j;
}
export function resourceIdentity(zone:Json,configured:Json={}) {
 if(zone?.name!=='baulingo.app'||!/^\w{32}$/.test(zone.id??'')||!/^\w{32}$/.test(zone.account?.id??''))throw new Error('Expected a valid baulingo.app resource identity.');
 if((configured.account&&configured.account!==zone.account.id)||(configured.zone&&configured.zone!==zone.id))throw new Error('Configured account or zone does not match baulingo.app.');
 return {account:zone.account.id as string,zone:zone.id as string};
}
async function environment() {
  let env='';try{env=await readFile('.env','utf8')}catch{}
  const read=(name:string)=>process.env[name]?.trim() || (env.split(/\r?\n/).find(line=>new RegExp('^\\s*'+name+'\\s*=').test(line))?.replace(/^[^=]*=/,'').trim().replace(/^(["'])(.*)\1$/,'$2'));
  const token=read('CLOUDFLARE_API_TOKEN');if(!token)throw new Error('Set CLOUDFLARE_API_TOKEN in the environment or ignored .env.');
  const z=await rest(token,'/zones?name=baulingo.app');if(z.result?.length!==1)throw new Error('Expected exactly one accessible baulingo.app zone.');
  const zone=z.result[0],identity=resourceIdentity(zone,{account:read('CLOUDFLARE_ACCOUNT_ID'),zone:read('CLOUDFLARE_ZONE_ID')}),account=identity.account,zoneId=identity.zone;
  const allSites:Json[]=[];let totalPages=1;for(let page=1;page<=totalPages;page++){const sites=await rest(token,`/accounts/${account}/rum/site_info/list?per_page=100&page=${page}`);allSites.push(...(sites.result??[]));totalPages=Number(sites.result_info?.total_pages??1);if(!Number.isInteger(totalPages)||totalPages>1000)throw new Error('Invalid site pagination limit.');}
  const matches=allSites.filter((s:Json)=>s.ruleset?.zone_tag===zoneId);
  const site=read('CLOUDFLARE_WEB_ANALYTICS_SITE_ID')|| (matches.length===1?matches[0].site_tag:null);
  if(!site||!matches.some((s:Json)=>s.site_tag===site))throw new Error('Could not uniquely verify Web Analytics site for zone.');
  return {token,account,zone:zoneId,site,plan:zone.plan?.name,autoInstall:matches.find((s:Json)=>s.site_tag===site).auto_install};
}
const nodeSettings=(name:string)=>`${name} { enabled availableFields maxDuration maxNumberOfFields maxPageSize notOlderThan }`;
async function settings(e:Awaited<ReturnType<typeof environment>>):Promise<Record<string,Json>> {
 const q=`{ viewer { accounts(filter:{accountTag:"${e.account}"}) { settings { ${nodeSettings(datasets.rum)} ${nodeSettings(datasets.vitals)} ${nodeSettings(datasets.performance)} ${nodeSettings(datasets.workers)} } } zones(filter:{zoneTag:"${e.zone}"}) { settings { ${nodeSettings(datasets.http)} } } } }`;
 const v=(await graphql(e.token,q)).viewer;if(v.accounts?.length!==1||v.zones?.length!==1)throw new Error('Account or zone inaccessible.');return {...v.accounts[0].settings,...v.zones[0].settings};
}
function options(args:string[]) {const o:Record<string,string>={};for(let i=0;i<args.length;i++){if(!args[i].startsWith('--')||!args[i+1]||args[i+1].startsWith('--'))throw new Error('Options require values.');o[args[i].slice(2)]=args[++i];}for(const k of Object.keys(o))if(!['range','start','end','compare','output'].includes(k))throw new Error('Unknown option: '+k);return o;}
async function main(){
 if(process.argv.includes('--help')){console.log('Read-only Cloudflare commands: check, traffic, performance.\nOptions: --range 7|28|90|custom --start YYYY-MM-DD --end YYYY-MM-DD --compare true|false --output directory\nPeriods use complete UTC days. Outputs are timestamped local JSON/CSV snapshots and Markdown summaries.\nSet CLOUDFLARE_API_TOKEN in environment or ignored .env; optional account, zone and site IDs are validated.');return;}
 const [command,...args]=process.argv.slice(2);if(!['check','traffic','performance'].includes(command))throw new Error('Choose check, traffic or performance.');
 const opts=options(args), e=await environment(), limits=await settings(e);
 if(command==='check'){
   const verification=await rest(e.token,'/user/tokens/verify');
   if(verification.result?.status!=='active')throw new Error('Cloudflare token is not active.');
   const schema=await graphql(e.token,'{ __schema { types { name } } }');
   const relevantTypes=(schema.__schema?.types??[]).filter((t:Json)=>/rum(Pageload|WebVitals|Performance)EventsAdaptiveGroups|workersInvocationsAdaptive|httpRequestsAdaptiveGroups/i.test(t.name));
   const objectTypes=relevantTypes.filter((t:Json)=>/^(AccountRum|AccountWorkersInvocations|ZoneHttpRequests)/.test(t.name)&&!/(Filter|OrderBy|Confidence)/.test(t.name));
   const schemaFields=await graphql(e.token,'{ '+objectTypes.map((t:Json,i:number)=>`t${i}:__type(name:${JSON.stringify(t.name)}) { name description fields { name description type { name kind ofType { name kind } } } }`).join(' ')+' }');
   const siteDetail=await rest(e.token,`/accounts/${e.account}/rum/site_info/${e.site}`);
   const site=siteDetail.result;
   const report={extractedAt:new Date().toISOString(),authentication:{status:'active',resourceAccess:'verified by successful zone, site and account/zone analytics queries',policyScope:'owner-supplied dedicated token; full token policy not introspected'},account:e.account,zone:e.zone,site:e.site,productionHostname:'baulingo.app',plan:e.plan,
     installation:{autoInstall:site.auto_install,ruleset:site.ruleset,rules:site.rules??[],regionalScope:'unverified'},
     worker:{name:'baulingo-site',identityEvidence:'local wrangler.json; deployed configuration unverified with analytics-only permission'},
     datasets:Object.fromEntries(Object.entries(limits).map(([name,s])=>[name,{...s,status:s.enabled?'available':'unavailable',sampling:'adaptive; inspect sampleInterval in each query',retentionDays:s.notOlderThan/86400,maxWindowDays:s.maxDuration/86400}])) as Record<string,Json>,
     schemaTypes:relevantTypes,schemaFields:Object.values(schemaFields),
     limitations:['Dataset settings establish entitlements, not populated history or completeness.','No Worker editing or deployment permissions are requested to inspect deployed configuration.','Schema membership alone does not establish entitlement; settings and successful queries are required.','The documented default GraphQL quota is 300 queries per five minutes; account-specific rate quota is unverified.']};
   const dir=join(opts.output??'.dev/cloudflare/check',new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(dir,{recursive:true});
   await writeFile(join(dir,'capabilities.json'),JSON.stringify(report,null,2)+'\n');
   await writeFile(join(dir,'capabilities.csv'),toCsv(Object.entries(report.datasets).map(([dataset,s])=>({dataset,...s,availableFields:s.availableFields.join(';')})),['dataset','status','retentionDays','maxWindowDays','maxPageSize','maxNumberOfFields','sampling','availableFields']));
   await writeSnapshot(dir,'check',Object.entries(report.datasets).map(([name,s])=>({name,dataset:name,status:s.enabled?'complete':'unavailable',rows:null,note:'Entitlement and schema check; not a measurement result.'})));
   console.log('Capability matrix saved: '+dir);return;
 }
 const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10), period=ranges(opts.range??'7',opts.end??yesterday,opts.start);
 if(period.end>yesterday)throw new Error('End date must be a complete UTC day.');
 if(opts.compare && !['true','false'].includes(opts.compare))throw new Error('--compare must be true or false.');
 const dir=join(opts.output??`.dev/cloudflare/${command}`,new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(dir,{recursive:true});
 const periods=[{name:'current',start:period.start,end:period.end},...(opts.compare==='true'?[{name:'previous',start:period.previousStart,end:period.previousEnd}]:[])];
 const vitalFields='count avg { sampleInterval } quantiles { '+['timeToFirstByte','largestContentfulPaint','interactionToNextPaint','cumulativeLayoutShift'].flatMap(m=>['P50','P75','P90'].map(p=>m+p)).join(' ')+' } sum { lcpGood lcpNeedsImprovement lcpPoor lcpTotal inpGood inpNeedsImprovement inpPoor inpTotal clsGood clsNeedsImprovement clsPoor clsTotal }';
 const workerFields='avg { sampleInterval } sum { requests errors cpuTimeUs requestDuration subrequests } quantiles { cpuTimeP50 cpuTimeP75 cpuTimeP90 requestDurationP50 requestDurationP75 requestDurationP90 wallTimeP50 wallTimeP75 wallTimeP90 }';
 const definitions=command==='traffic' ? [
 {name:'browser-total',dataset:datasets.rum,scope:'accounts',fields:'count avg { sampleInterval } sum { visits }',filter:`siteTag:"${e.site}",requestHost:"baulingo.app"`},
 {name:'browser-pages',dataset:datasets.rum,scope:'accounts',fields:'count avg { sampleInterval } sum { visits } dimensions { requestHost requestPath }',filter:`siteTag:"${e.site}",requestHost:"baulingo.app"`,map:true},
 {name:'browser-daily',dataset:datasets.rum,scope:'accounts',fields:'count avg { sampleInterval } sum { visits } dimensions { date }',filter:`siteTag:"${e.site}",requestHost:"baulingo.app"`},
 ...['refererHost','countryName','deviceType','userAgentBrowser','userAgentOS'].map(d=>({name:'browser-'+d,dataset:datasets.rum,scope:'accounts',fields:`count avg { sampleInterval } sum { visits } dimensions { ${d} }`,filter:`siteTag:"${e.site}",requestHost:"baulingo.app"`})),
 {name:'http-zone-hosts',dataset:datasets.http,scope:'zones',fields:'count avg { sampleInterval } sum { edgeResponseBytes } dimensions { clientRequestHTTPHost }',filter:''},
 ...['baulingo.app','www.baulingo.app'].flatMap(host=>{
 const prefix=host==='baulingo.app'?'http-apex':'http-www',hostFilter=`clientRequestHTTPHost:"${host}"`,filter=hostFilter+',requestSource:"eyeball"';
 return [
 {name:prefix+'-paths',dataset:datasets.http,scope:'zones',fields:'count avg { sampleInterval } sum { edgeResponseBytes } dimensions { clientRequestHTTPHost clientRequestPath edgeResponseStatus clientRequestHTTPMethodName edgeResponseContentTypeName cacheStatus verifiedBotCategory }',filter,map:true},
 ...['total','date','clientCountryName','edgeResponseStatus','clientRequestHTTPMethodName','cacheStatus','verifiedBotCategory','securityAction securitySource','requestSource'].map(d=>({name:prefix+'-'+d.replaceAll(' ','-'),dataset:datasets.http,scope:'zones',fields:'count avg { sampleInterval } sum { edgeResponseBytes } dimensions { clientRequestHTTPHost '+(d==='total'?'':d)+' }',filter:d==='requestSource'?hostFilter:filter}))];
 })
 ] : [
 ...['total','pages'].map(grain=>({name:'page-load-'+grain,dataset:datasets.performance,scope:'accounts',fields:'count avg { sampleInterval } quantiles { pageLoadTimeP50 pageLoadTimeP75 pageLoadTimeP90 }'+(grain==='pages'?' dimensions { requestHost requestPath }':''),filter:`siteTag:"${e.site}",requestHost:"baulingo.app"`,map:grain==='pages'})),
 ...['total','pages'].map(grain=>({name:'vitals-'+grain,dataset:datasets.vitals,scope:'accounts',fields:vitalFields+(grain==='pages'?' dimensions { requestHost requestPath }':''),filter:`siteTag:"${e.site}",requestHost:"baulingo.app"`,map:grain==='pages'})),
 ...[{name:'total',dimensions:'scriptName'},{name:'daily',dimensions:'scriptName date'},{name:'outcomes',dimensions:'scriptName status'},{name:'http-status',dimensions:'scriptName httpResponseStatus'},{name:'versions',dimensions:'scriptName scriptVersion'},{name:'version-daily',dimensions:'scriptName scriptVersion date'}].map(grain=>({name:'workers-'+grain.name,dataset:datasets.workers,scope:'accounts',fields:workerFields+' dimensions { '+grain.dimensions+' }',filter:'scriptName:"baulingo-site",isPreview:0'}))
 ];
 const summaries:Json[]=[];
 for(const p of periods)for(const d of definitions){
   const s=limits[d.dataset];const startMs=Date.parse(p.start+'T00:00:00Z'),endMs=Date.parse(p.end+'T00:00:00Z')+86400000;
   let rows:Json[]=[],error:string|null=null;const queryWindows:Json[]=[];
   try{
     datasetAccess(s,d.fields,startMs);
     const isDate=String(d.dataset).startsWith('rum');
     const id=d.scope==='accounts'?`accountTag:"${e.account}"`:`zoneTag:"${e.zone}"`;
     const limit=Math.min(s.maxPageSize,10000);
     const queryWindow=async(from:number,to:number):Promise<Json[]>=>{
       const date=(n:number)=>new Date(n).toISOString().slice(0,10);
       const dates=isDate?`date_geq:"${date(from)}",date_leq:"${date(to-86400000)}"`:`datetime_geq:"${new Date(from).toISOString()}",datetime_lt:"${new Date(to).toISOString()}"`;
       const filter=[dates,d.filter].filter(Boolean).join(',');
       const q=`{ viewer { ${d.scope}(filter:{${id}}) { ${d.dataset}(limit:${limit},filter:{${filter}}) { ${d.fields} } } } }`;
       const scopes=(await graphql(e.token,q)).viewer[d.scope];if(scopes?.length!==1)throw new Error('Resource unavailable.');
       const result=scopes[0][d.dataset].map(flatten);
       queryWindows.push({start:new Date(from).toISOString(),endExclusive:new Date(to).toISOString(),returnedRows:result.length,capped:result.length>=limit});
       return result;
     };
     rows=await extractWindows(startMs,endMs,s.maxDuration,limit,isDate?86400000:3600000,queryWindow);
     if(d.dataset===datasets.vitals||d.dataset===datasets.performance)rows=rows.map(performanceValues);
     if(d.dataset===datasets.workers)rows=rows.map(workerValues);
     if('map' in d && d.map)rows=rows.map(r=>({...r,...mapCloudflarePage(r.requestHost??r.clientRequestHTTPHost,r.requestPath??r.clientRequestPath)}));
     if(d.dataset===datasets.http)rows=rows.map(httpEvidence);
     if(d.name==='browser-refererHost')rows=rows.map(r=>({...r,external_referrer:Boolean(r.refererHost)&&!['baulingo.app','www.baulingo.app'].includes(r.refererHost)}));
   }catch(err){error=err instanceof Error?err.message:'Unknown error';rows=[];}
   const metadata={extractedAt:new Date().toISOString(),account:e.account,zone:e.zone,site:e.site,dataset:d.dataset,start:p.start,end:p.end,timeZone:'UTC',filter:d.filter,limits:s,status:error?'unavailable':'complete',error,queryCoverage:error?null:{start:new Date(startMs).toISOString(),endExclusive:new Date(endMs).toISOString()},observedCoverage:'Unknown; successful queries do not establish that collection existed throughout the requested interval.',metricDefinitions:{count:'Cloudflare estimated browser page views for RUM, requests for HTTP; not raw sampled observations.',visits:'Cloudflare page views initiated from a different website/referrer hostname; not unique people or GA4 sessions.',performance:'Raw RUM timings in microseconds; derived _ms columns divide nonnegative values by 1000. Negative raw values indicate unavailable; CLS is unitless.',samples:'sampleInterval is query sampling information. CWV Total fields are metric-specific reported observations, not unique people.'},limitations:['Adaptive query results may be sampled; sampleInterval is retained per row.','Missing rows are not evidence of zero traffic.','Browser visits are not unique people or GA4 sessions; edge requests include bots and assets.','Percentiles apply only to each row window and cannot be averaged; split-window results have no whole-period percentile.','Page-load dataset is beta and may change.']};
   Object.assign(metadata,{queryWindows,...(d.dataset===datasets.workers?{workerDefinitions:{requests:'Worker script invocations, excluding isPreview=1; static asset responses can bypass script execution.',errors:'Cloudflare sum_errors; invocation status is exported separately. No exception message or stack is collected.',cpuTimeUs:'Microseconds of CPU time; derived _ms divides by 1000.',requestDuration:'Microseconds; derived _ms divides by 1000.',wallTime:'Wall-time percentiles in microseconds; derived _ms divides by 1000.',httpResponseStatus:'0 means no HTTP response or non-HTTP invocation, not HTTP error status.',versions:'Version and version/date breakdowns support descriptive comparison, not causal deployment attribution.'},emptyResult:!error&&!rows.length?'No matching analytics rows returned; no zero-traffic or deployment-performance conclusion can be made.':null}: {})});
   summaries.push({name:`${p.name}-${d.name}`,dataset:d.dataset,status:metadata.status,rows:rows.length,error,start:p.start,end:p.end,account:e.account,zone:e.zone,site:e.site,note:rows.length?'See per-row sampling and query windows.':'No matching rows; not evidence of zero traffic.'});
   const base=join(dir,`${p.name}-${d.name}`);await writeFile(base+'.json',JSON.stringify({metadata,rows},null,2)+'\n');const columns=[...new Set([...selectedFields(d.fields).map(f=>f.split('_').at(-1)!), 'windowStart','windowEnd',...rows.flatMap(r=>Object.keys(r))])];await writeFile(base+'.csv',toCsv(rows,columns));console.log(`${p.name} ${d.name}: ${error?'unavailable: '+error:rows.length+' rows'}`);
   if(!error&&(d.name==='browser-pages'||(d.dataset===datasets.http&&d.name.endsWith('-paths'))))await writeContentReport({metadata,rows},dir,`${p.name}-${d.name}`);
   if(d.name.endsWith('-paths')&&d.dataset===datasets.http){
     const subsets:Record<string,(r:Json)=>boolean>={html:r=>r.is_html_response,assets:r=>r.request_class==='asset',media:r=>r.request_class==='media',api:r=>r.request_class==='api',redirects:r=>r.is_redirect,missing:r=>r.is_missing,failed:r=>r.is_client_error||r.is_server_error,beacons:r=>r.request_class==='beacon',verified_bots:r=>r.automation==='verified_bot',unknown_automation:r=>r.automation==='unknown'};
     for(const [name,keep] of Object.entries(subsets)){const subset=rows.filter(keep),file=base+'-'+name;await writeFile(file+'.json',JSON.stringify({metadata:{...metadata,subset:name,subsetOverlap:'Subsets can overlap; do not add their totals.'},rows:subset},null,2)+'\n');await writeFile(file+'.csv',toCsv(subset,columns));}
   }
 }
 const snapshot=await writeSnapshot(dir,command,summaries);console.log('Snapshot status: '+snapshot.status);console.log('Output: '+dir);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e instanceof Error?e.message:'Cloudflare report failed.');process.exitCode=1;});
