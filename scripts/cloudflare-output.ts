import { readdir, writeFile } from 'node:fs/promises';
import { join, resolve, relative, isAbsolute } from 'node:path';
type Json=Record<string,any>;
export function localReportRoot(value:string):string {
 const target=resolve(value),path=relative(resolve('.dev'),target);
 if(path==='..'||path.startsWith('..\\')||path.startsWith('../')||isAbsolute(path))throw new Error('Keep generated reporting output under ignored .dev/.');
 return target;
}
export function snapshotStatus(reports:Json[]):string {
 if(reports.some(r=>r.status==='partial'))return 'partial';
 const complete=reports.filter(r=>r.status==='complete').length;
 return !complete?'unavailable':complete===reports.length?'complete':'partial';
}
export async function writeSnapshot(dir:string,command:string,reports:Json[]) {
 const status=snapshotStatus(reports),files=(await readdir(dir)).filter(f=>f.endsWith('.json')||f.endsWith('.csv')||f.endsWith('.md')).sort();
 const manifest={extractedAt:new Date().toISOString(),command,status,reports,files:[...new Set([...files,'snapshot.json','summary.md'])].sort(),limitations:['Snapshot status describes extraction, not visitor outcomes or uninterrupted collection.','Returned row counts are not traffic totals; do not add different datasets, dimensions or overlapping snapshots.','Keep these local snapshots before retention expires; they are not deployed assets.']};
 await writeFile(join(dir,'snapshot.json'),JSON.stringify(manifest,null,2)+'\n');
 const safe=(x:unknown)=>String(x??'').replace(/[|\r\n]/g,' ');
 const source=command.startsWith('keywords')?'Keyword':command==='ga4'?'GA4':['combined','opportunities'].includes(command)?'SEO':'Cloudflare';
 const lines=['# '+source+' '+command+' snapshot','',`Extraction status: **${status}**.`,'','| Report | Dataset | Status | Returned rows | Limitation / error |','| --- | --- | --- | ---: | --- |',...reports.map(r=>`| ${safe(r.name)} | ${safe(r.dataset)} | ${safe(r.status)} | ${safe(r.rows)} | ${safe(r.error??r.note)} |`),'','Report metadata contains source periods/timezones, resource identifiers, filters, metric definitions and known gaps. Empty successful results are distinct from unavailable data.','',...manifest.limitations.map(s=>'- '+s),''];
 await writeFile(join(dir,'summary.md'),lines.join('\n'));return manifest;
}
