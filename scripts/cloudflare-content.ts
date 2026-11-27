import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mapUrl } from './seo-content.ts';
import { toCsv } from './seo-performance.ts';
type Json=Record<string,any>;
const dimensions=['page_id','content_id','level','content_language','content_format','content_category','collection_id'];
const metrics=['count','visits','edgeResponseBytes'];
export function contentReport(source:Json) {
 if(!['rumPageloadEventsAdaptiveGroups','httpRequestsAdaptiveGroups'].includes(source.metadata?.dataset))throw new Error('Expected a page-load or HTTP dataset; performance percentiles cannot be summed.');
 if(source.metadata.status!=='complete'||!Array.isArray(source.rows))throw new Error('Input unavailable or malformed.');
 const http=source.metadata.dataset==='httpRequestsAdaptiveGroups';
 const rows:Json[]=source.rows.map((row:Json):Json=>{
   const host=row[http?'clientRequestHTTPHost':'requestHost'],path=row[http?'clientRequestPath':'requestPath'];
   if(typeof host!=='string'||typeof path!=='string')throw new Error('Input must have host and path dimensions.');
   for(const metric of metrics)if(row[metric]!==undefined&&(!Number.isFinite(row[metric])||row[metric]<0))throw new Error('Invalid additive metric.');
   return {...row,...mapUrl('https://'+host+path)};
 });
 const mapped=rows.filter((r:Json)=>r.page_id);
 const rollups:Record<string,Json[]>={};
 for(const dimension of dimensions){
   const fields=dimension==='content_language'?['content_language']:[dimension,'content_language'];
   const groups=new Map<string,Json>();
   for(const row of mapped){
     const values=Object.fromEntries(fields.map(f=>[f,row[f]??null]));const key=JSON.stringify(values);
     const group=groups.get(key)??{...values,sourceRows:0,sampleIntervalMin:null,sampleIntervalMax:null,samplingUnknown:false,missingMetrics:[],...Object.fromEntries(metrics.map(m=>[m,null]))};
     group.sourceRows++;
     for(const metric of metrics)if(row[metric]!==undefined)group[metric]=(group[metric]??0)+row[metric];else if(!group.missingMetrics.includes(metric))group.missingMetrics.push(metric);
     if(Number.isFinite(row.sampleInterval)){group.sampleIntervalMin=group.sampleIntervalMin===null?row.sampleInterval:Math.min(group.sampleIntervalMin,row.sampleInterval);group.sampleIntervalMax=group.sampleIntervalMax===null?row.sampleInterval:Math.max(group.sampleIntervalMax,row.sampleInterval);}else group.samplingUnknown=true;
     groups.set(key,group);
   }
   rollups[dimension]=[...groups.values()].map(group=>{for(const metric of group.missingMetrics)group[metric]=null;return {...group,missingMetrics:group.missingMetrics.join(';')};});
 }
 return {metadata:{...source.metadata,mappedAt:new Date().toISOString(),mapping:'Existing Search Console mapUrl; exact production-origin catalog paths only. Localized pages retain separate IDs.',rollupDefinitions:'Derived sums of returned additive path metrics over disjoint extraction windows; no sample weighting is applied again. Each rollup retains content language. Null classifications are undefined in the catalog. Rollups include matched paths only and are not property totals.',limitations:['HTTP sums are requests and bytes, including bots and all returned statuses, not page views.','Independent query sampling means these sums may differ from native totals. Do not sum overlapping rollups or snapshots.','Unmatched paths are not established as removed URLs. Redirects are observed only in HTTP data.','Catalog formats/categories/collections are the only classification system; no exam, vocabulary or interactive-tool labels are inferred when absent.']},rows,rollups,unmatched:rows.filter((r:Json)=>!r.page_id),redirects:http?rows.filter((r:Json)=>r.edgeResponseStatus>=300&&r.edgeResponseStatus<400):[],missing:http?rows.filter((r:Json)=>[404,410].includes(r.edgeResponseStatus)):[],nonContent:rows.filter((r:Json)=>!r.content_id&&!r.collection_id)};
}
export async function writeContentReport(source:Json,dir:string,prefix:string) {
 const report=contentReport(source);await mkdir(dir,{recursive:true});
 await writeFile(join(dir,prefix+'-catalog.json'),JSON.stringify(report,null,2)+'\n');
 const tables:Record<string,Json[]>={pages:report.rows,unmatched:report.unmatched,redirects:report.redirects,missing:report.missing,nonContent:report.nonContent,...report.rollups};
 for(const [name,rows] of Object.entries(tables))await writeFile(join(dir,prefix+'-catalog-'+name+'.csv'),toCsv(rows,[...new Set([...dimensions,...rows.flatMap(r=>Object.keys(r))])]));
 return report;
}
async function main(){const [input,output]=process.argv.slice(2);if(!input)throw new Error('Usage: node scripts/cloudflare-content.ts <path-report.json> [output-directory]');const source=JSON.parse(await readFile(input,'utf8'));const dir=output??join('.dev/cloudflare/catalog',new Date().toISOString().replace(/[:.]/g,'-'));const r=await writeContentReport(source,dir,'content');console.log(`${r.rows.length} rows; ${r.unmatched.length} unmatched. Output: ${dir}`);}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e instanceof Error?e.message:'Mapping failed.');process.exitCode=1;});
