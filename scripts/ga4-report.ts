import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { dateRange, toCsv } from './seo-performance.ts';
import { gaRows, validatePeriod } from './seo-ga4.ts';
import { writeSnapshot, localReportRoot } from './cloudflare-output.ts';
type Json=Record<string,any>;
export function ga4Status(pages:Json[]):string {
  return pages.some(p=>p.metadata?.subjectToThresholding||p.metadata?.dataLossFromOtherRow||(p.metadata?.samplingMetadatas??[]).some((s:Json)=>BigInt(s.samplesReadCount)<BigInt(s.samplingSpaceSize)))?'partial':'complete';
}
export async function fetchGa4Report(request:(body:Json)=>Promise<Json>,body:Json):Promise<Json>{
  const rows:Json[]=[],pages:Json[]=[];let offset=0;
  const dims=(body.dimensions??[]).map((d:Json)=>d.name),metrics=(body.metrics??[]).map((m:Json)=>m.name);
  while(true){
    const data=await request({...body,limit:'10000',offset:String(offset),returnPropertyQuota:true});
    const page=gaRows(data,dims,metrics);pages.push({metadata:data.metadata??{},propertyQuota:data.propertyQuota??null,rowCount:data.rowCount??0});
    if(!page.length&&offset<Number(data.rowCount??0))throw new Error('GA4 pagination ended before rowCount.');
    rows.push(...page);offset+=page.length;if(offset>=Number(data.rowCount??0))break;
  }
  return {rows,pages,status:ga4Status(pages)};
}
const event=(value:string)=>({filter:{fieldName:'eventName',stringFilter:{matchType:'EXACT',value}}});
async function main(){
  const opts:Json={};const args=process.argv.slice(2);
  for(let i=0;i<args.length;i+=2){const key=args[i].slice(2);if(!['start','end','output'].includes(key)||!args[i+1])throw new Error('Use --start, --end and --output.');opts[key]=args[i+1];}
  validatePeriod(opts.start,opts.end);dateRange('custom',opts.end,opts.start);
  // Conservative processing lag, not a guarantee against later GA4 revisions.
  const ready=new Date(Date.now()-3*86400000).toISOString().slice(0,10);
  if(opts.end>ready)throw new Error('GA4 extraction waits three days for processing; requested data is not ready.');
  const token=process.env.BAULINGO_GA4_ACCESS_TOKEN?.trim();if(!token)throw new Error('Google OAuth token unavailable.');
  const request=async(body:Json):Promise<Json>=>{
    for(let attempt=0;attempt<4;attempt++){
      const r=await fetch('https://analyticsdata.googleapis.com/v1beta/properties/565704627:runReport',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','x-goog-user-project':process.env.BAULINGO_GA4_QUOTA_PROJECT??'baulingo-web'},body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(30000)});
      if(r.ok)return await r.json() as Json;
      if((r.status===429||r.status>=500)&&attempt<3){await new Promise(r=>setTimeout(r,1000*2**attempt));continue;}
      throw new Error('GA4 HTTP '+r.status+'; check token, access, quota and report compatibility.');
    }throw new Error('GA4 unavailable.');
  };
  const dir=join(localReportRoot(opts.output??'.dev/ga4'),new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(dir,{recursive:true});
  const definitions:Json={acquisition:{dims:['date','sessionSourceMedium'],metrics:['sessions','engagedSessions']},landing:{dims:['landingPage'],metrics:['sessions']},country_device:{dims:['country','deviceCategory'],metrics:['sessions']},learning:{dims:['customEvent:content_id','eventName','customEvent:completion_type'],metrics:['eventCount','totalUsers'],dimensionFilter:{orGroup:{expressions:['content_viewed','learning_started','learning_completed','exercise_answered'].map(event)}}},study:{dims:['customEvent:content_id'],metrics:['customEvent:duration_seconds'],dimensionFilter:event('study_time')},categories:{dims:['customEvent:content_category','customEvent:content_format','customEvent:content_language'],metrics:['eventCount','totalUsers'],dimensionFilter:event('content_viewed')}};
  const statuses:Json[]=[];
  for(const[name,d]of Object.entries(definitions) as [string,Json][]){
    try{
      const body={dateRanges:[{startDate:opts.start,endDate:opts.end}],dimensions:d.dims.map((name:string)=>({name})),metrics:d.metrics.map((name:string)=>({name})),...(d.dimensionFilter?{dimensionFilter:d.dimensionFilter}:{}),orderBys:d.dims.map((dimensionName:string)=>({dimension:{dimensionName}}))};
      const report=await fetchGa4Report(request,body);
      const metadata={extractedAt:new Date().toISOString(),property:'565704627',startDate:opts.start,endDate:opts.end,timeZone:'Europe/Berlin',status:report.status,request:body,responsePages:report.pages,limitations:['Consenting population only; event counts are actions, not unique learners.','Distinct users cannot be summed across content or dimensions. Missing rows are unknown, not zero.','Three-day processing lag is conservative; successful extraction does not establish fully finalized GA4 data.']};
      await writeFile(join(dir,name+'.json'),JSON.stringify({metadata,rows:report.rows},null,2)+'\n');await writeFile(join(dir,name+'.csv'),toCsv(report.rows,[...d.dims,...d.metrics]));
      statuses.push({name,dataset:'GA4',status:report.status,rows:report.rows.length});
    }catch{statuses.push({name,dataset:'GA4',status:'unavailable',rows:null,error:'GA4 extraction failed; check credentials, quota and dimension/metric compatibility.'});}
  }
  const manifest=await writeSnapshot(dir,'ga4',statuses);console.log(`${manifest.status}. Output: ${dir}`);if(manifest.status!=='complete')process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e.message);process.exitCode=1;});
