import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { toCsv } from './seo-performance.ts';
import { mapUrl } from './seo-content.ts';
import { writeSnapshot, localReportRoot } from './cloudflare-output.ts';

type Json = Record<string, any>;
export const keywordLimitations = ['Google Ads volumes are estimates, may be rounded, grouped or restricted, and close variants can be combined.', 'Advertising competition and bids are not organic ranking difficulty.', 'Query language is a seed/editorial label; Ads language targeting does not identify learner native language. Learner target language is German.', 'Catalog suggestions require intent review. Missing metrics are unknown, not zero. Do not sum overlapping segments, close variants or keyword snapshots.'];

// Planner downloads can be comma CSV or tab-separated, including UTF-16 exports.
export function parseKeywordCsv(input: string, keywordHeader='Keyword'): Json[] {
  const text=input.replace(/^\uFEFF/,'');
  const headerLine=text.split(/\r?\n/).find(line=>line.split(/[\t,]/).some(value=>value.replace(/^"|"$/g,'')===keywordHeader))??text.split(/\r?\n/)[0];
  const delimiter=headerLine.includes('\t')?'\t':',';
  const records:string[][]=[];let row:string[]=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(!quoted&&(c===delimiter||c==='\n'||c==='\r')){row.push(cell);cell='';if(c!==delimiter){if(row.some(x=>x!==''))records.push(row);row=[];if(c==='\r'&&text[i+1]==='\n')i++;}}
    else cell+=c;
  }
  if(quoted)throw new Error('Unclosed quoted CSV field.');
  if(cell||row.length){row.push(cell);records.push(row);}
  const headerIndex=records.findIndex(row=>row.includes(keywordHeader));if(headerIndex>0)records.splice(0,headerIndex);
  const headers=records.shift();
  if(!headers?.length||headers.some(h=>!h)||new Set(headers).size!==headers.length)throw new Error('CSV headers must be nonempty and unique.');
  return records.map(values=>{if(values.length!==headers.length)throw new Error('CSV row width differs from headers.');return Object.fromEntries(headers.map((h,i)=>[h,values[i]]));});
}
export function keywordRequest(mode:string,segment:Json,family:Json,seed:string):Json {
  if(!['research','historical'].includes(mode))throw new Error('Invalid keyword mode.');
  const languages=segment.queryLanguages??[segment.queryLanguage];
  const keywords=languages.flatMap((language:string)=>family.seeds?.[language]??[]);
  const limit=mode==='historical'?10000:20;
  if(!keywords.length||keywords.length>limit||keywords.some((k:unknown)=>typeof k!=='string'||!k.trim())||languages.some((language:string)=>!family.seeds?.[language]))throw new Error(`Provide 1–${limit} seed keywords for the query languages.`);
  if((segment.adsLanguage!=null&&!/^languageConstants\/\d+$/.test(segment.adsLanguage))||!Array.isArray(segment.geoTargets)||segment.geoTargets.length>10||segment.geoTargets.some((g:string)=>!/^geoTargetConstants\/\d+$/.test(g)))throw new Error('Invalid Ads language or geographic targets.');
  const url='https://baulingo.app'+family.path;
  if(!mapUrl(url).page_id)throw new Error('Keyword family URL must exist in the catalog.');
  const body:Json={...(segment.adsLanguage?{language:segment.adsLanguage}:{}),...(segment.geoTargets.length?{geoTargetConstants:segment.geoTargets}:{}),keywordPlanNetwork:'GOOGLE_SEARCH',historicalMetricsOptions:{includeAverageCpc:true}};
  if(mode==='historical')return {...body,keywords};
  if(!['keywords','url','site','both'].includes(seed))throw new Error('Seed must be keywords, url, site or both.');
  return {...body,pageSize:10000,includeAdultKeywords:false,...(seed==='keywords'?{keywordSeed:{keywords}}:seed==='url'?{urlSeed:{url}}:seed==='site'?{siteSeed:{site:'https://baulingo.app'}}:{keywordAndUrlSeed:{keywords,url}})};
}
export function allKeywordRequests(mode:string,segment:Json,families:Json[],seed:string):Json[]{
  const languages=segment.queryLanguages??[segment.queryLanguage];
  const keywords=[...new Set<string>(families.flatMap(f=>languages.flatMap((language:string)=>f.seeds?.[language]??[])))];
  if(!keywords.length)throw new Error('No keyword seeds for the selected research scope.');
  const limit=mode==='historical'?10000:20;
  const requests:Json[]=[];
  for(let i=0;i<keywords.length;i+=limit){
    const batch=keywords.slice(i,i+limit);
    requests.push(keywordRequest(mode,{...segment,queryLanguages:['batch']},{path:'/',seeds:{batch}},seed));
    if(mode==='research'&&['url','site'].includes(seed))break;
  }
  return requests;
}
export async function fetchKeywordPages(request:(body:Json)=>Promise<Json>,body:Json):Promise<Json[]> {
  const pages:Json[]=[],seen=new Set<string>();let token='';
  do{const page=await request({...body,...(token?{pageToken:token}:{})});if(page.results!==undefined&&!Array.isArray(page.results))throw new Error('Invalid keyword results.');pages.push(page);token=page.nextPageToken??'';if(typeof token!=='string'||(token&&seen.has(token)))throw new Error('Invalid or repeated keyword page token.');seen.add(token);}while(token);
  return pages;
}
export function normalizeKeyword(result:Json,mode:string):Json {
  const m=result[mode==='historical'?'keywordMetrics':'keywordIdeaMetrics']??{};
  return {keyword:result.text,close_variants:result.closeVariants??[],avg_monthly_searches:m.avgMonthlySearches??null,monthly_search_volumes:m.monthlySearchVolumes??null,advertising_competition:m.competition??null,competition_index:m.competitionIndex??null,low_top_of_page_bid_micros:m.lowTopOfPageBidMicros??null,high_top_of_page_bid_micros:m.highTopOfPageBidMicros??null,average_cpc_micros:m.averageCpcMicros??null};
}
export function mergeKeywordReports(reports:Json[]):Json {
  if(!reports.length)throw new Error('Provide keyword source reports.');
  const first=reports[0].metadata,groups=new Map<string,Json[]>();
  if(!first?.segment||!first.source?.startsWith('Google Ads Keyword Planner'))throw new Error('Keyword source metadata is required.');
  const customers=new Set<string>(),currencies=new Set<string>();
  for(const [sourceIndex,report]of reports.entries()){
    if(!report.metadata?.source?.startsWith('Google Ads Keyword Planner')||JSON.stringify(report.metadata.segment)!==JSON.stringify(first.segment)||!Array.isArray(report.rows))throw new Error('Keyword sources must use the same targeting and contain source metadata.');
    if(report.metadata.customerId)customers.add(report.metadata.customerId);
    if(report.metadata.customerCurrency)currencies.add(report.metadata.customerCurrency);
    for(const [rowIndex,row]of report.rows.entries()){
      if(typeof row.keyword!=='string'||!row.keyword.trim())throw new Error('Invalid keyword source row.');
      const group=groups.get(row.keyword)??[];group.push({sourceIndex,rowIndex,...row});groups.set(row.keyword,group);
    }
  }
  if(customers.size>1)throw new Error('Keyword sources must use the same customer account.');
  if(currencies.size>1)throw new Error('Keyword sources must use the same customer currency.');
  const fields=['avg_monthly_searches','monthly_search_volumes','advertising_competition','competition_index','low_top_of_page_bid_micros','high_top_of_page_bid_micros','average_cpc_micros'];
  const rows=[...groups].map(([keyword,observations])=>{
    const metrics:Json={},conflicts:Json={};
    for(const field of fields){const values=[...new Map(observations.filter(o=>o[field]!=null).map(o=>[JSON.stringify(o[field]),o[field]])).values()];metrics[field]=values.length===1?values[0]:null;if(values.length>1)conflicts[field]=values;}
    return {keyword,...metrics,close_variants:[...new Set(observations.flatMap(o=>o.close_variants??[]))],metric_conflicts:conflicts,source_observations:observations};
  });
  return {metadata:{...first,extractedAt:new Date().toISOString(),source:'Google Ads Keyword Planner combined report',customerId:[...customers][0]??null,customerCurrency:[...currencies][0]??null,sources:reports.map(r=>r.metadata),sourceRows:reports.reduce((n,r)=>n+r.rows.length,0),uniqueKeywords:rows.length,limitations:[...keywordLimitations,'One row per original canonical keyword wording. Equal observations are retained without summing; conflicting metric values stay null with their original observations preserved.','Close variants and keyword families can overlap. No total search-market volume is calculated.']},rows};
}
export function mapKeyword(keyword:string,families:Json[]):Json {
  const key=keyword.toLocaleLowerCase('tr').trim();
  const candidates=families.filter(f=>Object.values(f.seeds??{}).flat().some(k=>String(k).toLocaleLowerCase('tr').trim()===key)).map(f=>({family:f.id,...mapUrl('https://baulingo.app'+f.path)}));
  return {keyword,candidates,review_required:true};
}
export function keywordFindings(report:Json,families:Json[]):Json[]{
  if(!report.metadata?.source?.startsWith('Google Ads Keyword Planner')||!report.metadata.segment||!Array.isArray(report.rows))throw new Error('Keyword evidence requires original Planner source and segment metadata.');
  return report.rows.map((row:Json)=>{
    if(typeof row.keyword!=='string'||!row.keyword.trim())throw new Error('Invalid keyword evidence.');
    const mapped=mapKeyword(row.keyword,families),candidate=mapped.candidates[0];
    return {category:'external_keyword_review',action:'collect_more_evidence',query:row.keyword,ranking_page:candidate?.canonical_url??'Unmapped; review educational intent',page_id:candidate?.page_id??null,existing_content:candidate?.family??null,external_demand:row,source_metadata:report.metadata,impressions:null,clicks:null,historical_trend:null,ga4_engagement:null,
      problem:'External keyword estimates do not establish Baulingo visibility, educational fit or organic competition.',proposed_improvement:'Inspect search intent and competing educational pages; prefer improving relevant existing material before proposing a new page.',evidence:`Planner value as supplied: ${row.avg_monthly_searches??'unavailable'}; segment ${report.metadata.segment.id??'custom'}. Advertising competition is not organic difficulty.`,confidence:'low',effort:'unknown',priority:'review'};
  });
}
export function keywordApi(token:string,version:string,customer:string,manager='',fetcher:typeof fetch=fetch){
  if(!/^v\d+$/.test(version)||!/^\d{10}$/.test(customer)||(manager&&!/^\d{10}$/.test(manager)))throw new Error('Use an API version and ten-digit customer/manager IDs without hyphens.');
  let lastRequest=0;
  return async(method:string,body?:Json):Promise<Json>=>{
    if(!['generateKeywordIdeas','generateKeywordHistoricalMetrics','checkCustomer'].includes(method))throw new Error('Only keyword reads are supported.');
    const endpoint=method==='checkCustomer'?'googleAds:search':method;
    const payload=method==='checkCustomer'?{query:'SELECT customer.id, customer.descriptive_name, customer.manager, customer.test_account, customer.currency_code FROM customer LIMIT 1'}:body;
    for(let attempt=0;attempt<3;attempt++){
      const delay=1100-(Date.now()-lastRequest);if(delay>0)await new Promise(r=>setTimeout(r,delay));lastRequest=Date.now();
      const r=await fetcher(`https://googleads.googleapis.com/${version}/customers/${customer}${method==='checkCustomer'?'/':':'}${endpoint}`,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',...(manager?{'login-customer-id':manager}:{})},body:JSON.stringify(payload),redirect:'error',signal:AbortSignal.timeout(30000)});
      if(r.ok)return await r.json() as Json;
      if((r.status===429||r.status>=500)&&attempt<2){await new Promise(r=>setTimeout(r,2000*2**attempt));continue;}
      // Raw server messages may echo credentials or request data; retain error codes only.
      const data=await r.json().catch(()=>({})) as Json;
      const codes=(data.error?.details??[]).flatMap((d:Json)=>(d.errors??[]).map((e:Json)=>e.errorCode));
      throw new Error(`Google Ads HTTP ${r.status}; status ${data.error?.status??'unknown'}; codes ${JSON.stringify(codes)}. Verify OAuth scope, Cloud project access level and customer eligibility.`);
    }
    throw new Error('Google Ads request unavailable.');
  };
}
export async function runKeywords(argv:string[]){
  const [mode,...args]=argv;const opts:Json={};
  for(let i=0;i<args.length;i+=2){if(!args[i]?.startsWith('--')||!args[i+1]||args[i+1].startsWith('--'))throw new Error('Options require values.');const key=args[i].slice(2);if(!['config','segment','family','seed','input','columns','output','extracted-at'].includes(key))throw new Error('Unknown option: '+key);opts[key]=args[i+1];}
  if(!['check','research','historical','import','map','report'].includes(mode))throw new Error('Choose check, research, historical, import, map or report.');
  const config=JSON.parse(await readFile(opts.config??'scripts/data/keyword-research.json','utf8'));
  const segment=config.segments.find((s:Json)=>s.id===(opts.segment??(mode==='import'?undefined:config.defaultSegment))),family=config.families.find((f:Json)=>f.id===opts.family);
  const dir=join(localReportRoot(opts.output??'.dev/keywords'),new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(dir,{recursive:true});
  let rows:Json[]=[],raw:unknown=null,metadata:Json={extractedAt:new Date().toISOString(),source:'Google Ads Keyword Planner',limitations:keywordLimitations};
  if(mode==='report'){
    if(!opts.input)throw new Error('Provide --input with comma-separated source keywords.json paths.');
    const files=opts.input.split(',');const reports=await Promise.all(files.map(async(file:string)=>JSON.parse(await readFile(file,'utf8'))));
    const merged=mergeKeywordReports(reports);metadata={...merged.metadata,sourceFiles:files.map((p:string)=>resolve(p))};raw=reports;
    rows=merged.rows.map((r:Json)=>({...r,...mapKeyword(r.keyword,config.families)}));
  }else if(mode==='map'){
    const input=JSON.parse(await readFile(opts.input,'utf8'));metadata={...input.metadata,mappedAt:new Date().toISOString(),input:resolve(opts.input)};
    rows=input.rows.map((r:Json)=>({...r,...mapKeyword(r.keyword,config.families)}));
  }else if(mode==='import'){
    if(!segment||!opts['extracted-at']||!Number.isFinite(Date.parse(opts['extracted-at'])))throw new Error('Import requires --segment and --extracted-at with the actual export timestamp.');
    const bytes=await readFile(opts.input);const text=bytes[0]===255&&bytes[1]===254?bytes.subarray(2).toString('utf16le'):bytes.toString('utf8');
    const columns=opts.columns?JSON.parse(await readFile(opts.columns,'utf8')):{keyword:'Keyword',avg_monthly_searches:'Avg. monthly searches',advertising_competition:'Competition',competition_index:'Competition (indexed value)',low_top_of_page_bid:'Top of page bid (low range)',high_top_of_page_bid:'Top of page bid (high range)'};raw=parseKeywordCsv(text,columns.keyword);
    if(!(raw as Json[]).length||!(columns.keyword in (raw as Json[])[0]))throw new Error('Keyword column missing; supply --columns mapping for localized exports.');
    rows=(raw as Json[]).map(r=>{if(!r[columns.keyword]?.trim())throw new Error('Empty keyword in export.');return {...Object.fromEntries(Object.entries(columns).map(([key,col])=>[key,r[String(col)]??null])),raw_fields:r};});
    metadata={...metadata,source:'Google Ads Keyword Planner manual CSV',segment,sourceExtractedAt:opts['extracted-at'],input:resolve(opts.input),sha256:createHash('sha256').update(bytes).digest('hex'),metricsPrecision:'Original strings, including ranges and localized formatting; no numeric conversion.',metricPeriod:'Read original export fields/header; not inferred from import date.',currency:'Preserve export currency; not inferred.'};
    await writeFile(join(dir,'original-export.csv'),bytes);
  }else{
    const token=(process.env.BAULINGO_ADS_ACCESS_TOKEN??process.env.BAULINGO_GA4_ACCESS_TOKEN)?.trim();
    if(!token)throw new Error('Ads OAuth authorization unavailable; use keywords:import while access is pending.');
    const customerId=process.env.BAULINGO_ADS_CUSTOMER_ID??config.customer?.id??'';
    const request=keywordApi(token,config.apiVersion,customerId,process.env.BAULINGO_ADS_MANAGER_ID??'');
    metadata={...metadata,customerId,customerCurrency:customerId===config.customer?.id?config.customer.currencyCode:null};
    if(mode==='check'){
      raw=await request('checkCustomer');rows=(raw as Json).results??[];
      metadata={...metadata,note:'Customer read succeeded. This does not prove Basic access, planning permission or historical metrics availability; verify a keyword request.'};
    }else{
      const all=!opts.family||opts.family==='all';
      if(!segment||(!all&&!family))throw new Error('Select a valid research segment and family.');
      const requests=all?allKeywordRequests(mode,segment,config.families,opts.seed??'keywords'):[keywordRequest(mode,segment,family,opts.seed??'keywords')];
      const pages:Json[]=[];
      for(const [requestIndex,body]of requests.entries()){
        const response=mode==='research'?await fetchKeywordPages(b=>request('generateKeywordIdeas',b),body):[await request('generateKeywordHistoricalMetrics',body)];
        pages.push(...response.map(page=>({requestIndex,...page})));
      }
      raw=pages;
      const unique=new Map<string,Json>();
      for(const page of pages)for(const result of page.results??[]){const row=normalizeKeyword(result,mode),key=JSON.stringify(row);const previous=unique.get(key);if(previous){previous.source_requests=[...new Set([...previous.source_requests,page.requestIndex])];}else unique.set(key,{...row,source_requests:[page.requestIndex]});}
      rows=[...unique.values()];
      metadata={...metadata,apiVersion:config.apiVersion,segment,family:all?'all':family.id,requests,learnerTargetLanguage:'de',queryLanguages:segment.queryLanguages??[segment.queryLanguage],metricPeriod:'Google default preceding 12 months; inspect monthly_search_volumes for returned months.',currency:'Customer currency; verify with keywords:check.',seedKeywords:requests.flatMap(r=>r.keywords??r.keywordSeed?.keywords??r.keywordAndUrlSeed?.keywords??[]),deduplication:'Only identical complete metric/variant rows are collapsed, retaining source request indices. Differing observations stay separate; no volumes are summed.'};
    }
  }
  await writeFile(join(dir,'keywords.json'),JSON.stringify({metadata,rows},null,2)+'\n');
  await writeFile(join(dir,'raw.json'),JSON.stringify(raw,null,2)+'\n');
  const csvContext={source:metadata.source,source_extracted_at:[...new Set((metadata.sources??[metadata]).map((m:Json)=>m.sourceExtractedAt??m.extractedAt).filter(Boolean))].join(' | '),report_created_at:metadata.extractedAt,customer_id:metadata.customerId??null,bid_currency:metadata.customerCurrency??null,market:metadata.segment?.market??null,query_seed_languages:(metadata.queryLanguages??metadata.segment?.queryLanguages??[metadata.segment?.queryLanguage]).filter(Boolean).join(';'),ads_language_target:metadata.segment?(metadata.segment.adsLanguage??'all (unrestricted)'):null,geo_targets:metadata.segment?.geoTargets??null,metric_period:metadata.metricPeriod??null};
  const flat=rows.map(r=>Object.fromEntries(Object.entries({...r,...csvContext}).map(([k,v])=>[k,typeof v==='object'&&v!==null?JSON.stringify(v):v])));
  await writeFile(join(dir,'keywords.csv'),toCsv(flat,[...new Set([...flat.flatMap(Object.keys),'keyword','avg_monthly_searches','monthly_search_volumes',...Object.keys(csvContext)])]));
  await writeSnapshot(dir,'keywords '+mode,[{name:mode,dataset:metadata.source,status:'complete',rows:rows.length,note:'Extraction only; not exact demand or an organic difficulty score.'}]);
  console.log('Output: '+dir);
  return dir;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)runKeywords(process.argv.slice(2)).catch(error=>{console.error(error.message);process.exitCode=1;});
