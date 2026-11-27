import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { parseKeywordCsv, keywordRequest, fetchKeywordPages, normalizeKeyword, mapKeyword, keywordFindings, runKeywords, keywordApi, allKeywordRequests, mergeKeywordReports } from '../scripts/keywords.ts';

test('manual keyword exports preserve wording, ranges, localized values and quoted delimiters', () => {
  const rows=parseKeywordCsv('\ufeffKeyword\tAvg. monthly searches\tCompetition\r\n"Almanca, A1"\t"100–1.000"\tDüşük\r\n');
  assert.deepEqual(rows,[{Keyword:'Almanca, A1','Avg. monthly searches':'100–1.000',Competition:'Düşük'}]);
  assert.equal(parseKeywordCsv('Keyword,Notes\n"DTZ Brief","line 1\nline 2"\n')[0].Notes,'line 1\nline 2');
  assert.throws(()=>parseKeywordCsv('Keyword,Keyword\na,b'),/header/i);
  assert.throws(()=>parseKeywordCsv('Keyword,Volume\n"unfinished'),/quoted/i);
  assert.deepEqual(parseKeywordCsv('Keyword Stats 2026-11-27\n2025-11-01 - 2026-10-31\nKeyword,Avg. monthly searches\nDTZ,100–1000\n'),[{Keyword:'DTZ','Avg. monthly searches':'100–1000'}]);
});
test('external demand evidence keeps range strings and requires intent review without organic difficulty scores',()=>{
 const report={metadata:{source:'Google Ads Keyword Planner manual CSV',segment,sourceExtractedAt:'2026-11-27T08:00:00Z'},rows:[{keyword:'Almanca Akkusativ Dativ',avg_monthly_searches:'100–1.000',advertising_competition:'HIGH'}]};
 const findings=keywordFindings(report,[family]);assert.equal(findings[0].external_demand.avg_monthly_searches,'100–1.000');assert.equal(findings[0].action,'collect_more_evidence');assert.equal(findings[0].ranking_page,'https://baulingo.app/konular/cases/');assert.equal(findings[0].organic_difficulty,undefined);
 assert.throws(()=>keywordFindings({rows:[]},[family]),/source/i);
});
const segment={id:'tr-DE',queryLanguage:'tr',adsLanguage:'languageConstants/1037',geoTargets:['geoTargetConstants/2276'],market:'DE'};
const family={id:'cases',seeds:{tr:['Almanca Akkusativ Dativ'],de:['Akkusativ Dativ Übungen'],en:['German cases exercises']},path:'/konular/cases/'};
test('worldwide research combines three query languages without country or Ads-language restrictions',()=>{
 const worldwide={id:'worldwide',queryLanguages:['tr','en','de'],adsLanguage:null,geoTargets:[],market:'worldwide'};
 const r=keywordRequest('research',worldwide,family,'keywords');
 assert.deepEqual(r.keywordSeed.keywords,['Almanca Akkusativ Dativ','German cases exercises','Akkusativ Dativ Übungen']);
 assert.equal(Object.hasOwn(r,'language'),false);assert.equal(Object.hasOwn(r,'geoTargetConstants'),false);
 assert.equal(keywordRequest('historical',worldwide,family,'keywords').keywords.length,3);
});
test('all-family worldwide research batches seeds within API limits and retains every language',()=>{
 const worldwide={id:'worldwide',queryLanguages:['tr','en','de'],adsLanguage:null,geoTargets:[]};
 const families=Array.from({length:17},(_,i)=>({id:'f'+i,path:'/',seeds:{tr:['Almanca '+i],en:['German '+i],de:['Deutsch '+i]}}));
 const ideas=allKeywordRequests('research',worldwide,families,'keywords');
 assert.deepEqual(ideas.map(r=>r.keywordSeed.keywords.length),[20,20,11]);
 assert.equal(new Set(ideas.flatMap(r=>r.keywordSeed.keywords)).size,51);
 assert.equal(allKeywordRequests('historical',worldwide,families,'keywords')[0].keywords.length,51);
 assert.equal(allKeywordRequests('research',worldwide,families,'site').length,1);
});
test('one worldwide report merges duplicate observations without summing volumes or hiding conflicts',()=>{
 const metadata={source:'Google Ads Keyword Planner',segment:{id:'worldwide',geoTargets:[],adsLanguage:null},customerId:'4715501548'};
 const report=rows=>({metadata,rows});
 const merged=mergeKeywordReports([report([{keyword:'Deutsch lernen',avg_monthly_searches:'100',close_variants:[]}]),report([{keyword:'Deutsch lernen',avg_monthly_searches:'100',close_variants:['deutsch lernen']},{keyword:'DTZ',avg_monthly_searches:'0'}])]);
 assert.equal(merged.rows.length,2);assert.equal(merged.rows[0].avg_monthly_searches,'100');assert.equal(merged.rows[0].source_observations.length,2);assert.equal(merged.rows[1].avg_monthly_searches,'0');
 const conflict=mergeKeywordReports([report([{keyword:'DTZ',avg_monthly_searches:'100'}]),report([{keyword:'DTZ',avg_monthly_searches:'200'}])]);
 assert.equal(conflict.rows[0].avg_monthly_searches,null);assert.deepEqual(conflict.rows[0].metric_conflicts.avg_monthly_searches,['100','200']);
 assert.throws(()=>mergeKeywordReports([report([]),{metadata:{...metadata,segment:{id:'DE'}},rows:[]}]),/target/i);
});
test('keyword and website discovery retain separate query-language and Ads targeting settings',()=>{
  const r=keywordRequest('research',segment,family,'keywords');
  assert.deepEqual(r.keywordSeed.keywords,['Almanca Akkusativ Dativ']);
  assert.equal(r.language,'languageConstants/1037');
  assert.deepEqual(r.geoTargetConstants,['geoTargetConstants/2276']);
  assert.deepEqual(keywordRequest('research',segment,family,'url').urlSeed,{url:'https://baulingo.app/konular/cases/'});
  assert.ok(keywordRequest('historical',segment,family,'keywords').keywords);
  assert.throws(()=>keywordRequest('research',{...segment,queryLanguage:'fr'},family,'keywords'),/seed/i);
});
test('all idea pages are retained and repeated continuation tokens fail explicitly',async()=>{
  let n=0;const pages=await fetchKeywordPages(async body=>{n++;return n===1?{results:[{text:'eins'}],nextPageToken:'next'}:{results:[{text:'zwei'}]};},{});
  assert.equal(pages.length,2);
  assert.equal(pages[1].results[0].text,'zwei');
  await assert.rejects(fetchKeywordPages(async()=>({results:[],nextPageToken:'same'}),{}),/token/i);
});
test('missing and grouped keyword metrics stay distinct from zero and catalog suggestions need review',()=>{
  const row=normalizeKeyword({text:'DTZ Brief',closeVariants:['dtz briefe'],keywordIdeaMetrics:{avgMonthlySearches:'100',monthlySearchVolumes:[{year:'2026',month:'OCTOBER',monthlySearches:'90'}],competition:'HIGH'}},'research');
  assert.equal(row.avg_monthly_searches,'100');assert.equal(row.competition_index,null);assert.deepEqual(row.close_variants,['dtz briefe']);
  assert.equal(normalizeKeyword({text:'unknown'},'research').avg_monthly_searches,null);
  const mapped=mapKeyword('Almanca Akkusativ Dativ',[family]);assert.equal(mapped.candidates[0].page_id,'topic-cases:tr');assert.equal(mapped.review_required,true);
  assert.equal(mapKeyword('unrelated term',[family]).candidates.length,0);
});
test('manual import and map commands preserve provenance accepted by the SEO review',async t=>{
 await mkdir('.dev',{recursive:true});const root=await mkdtemp(resolve('.dev/keyword-command-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const csv=join(root,'export.csv');const original=Buffer.concat([Buffer.from([255,254]),Buffer.from('Keyword Stats\r\nKeyword\tAvg. monthly searches\r\nAlmanca Akkusativ Dativ\t100–1.000\r\n','utf16le')]);await writeFile(csv,original);
 const imported=join(root,'import');await runKeywords(['import','--input',csv,'--segment','tr-DE','--extracted-at','2026-11-27T08:00:00Z','--output',imported]);
 const importDir=join(imported,(await readdir(imported))[0]);assert.deepEqual(await readFile(join(importDir,'original-export.csv')),original);
 const csvRows=parseKeywordCsv(await readFile(join(importDir,'keywords.csv'),'utf8'),'keyword');
 assert.equal(csvRows[0].market,'DE');assert.equal(csvRows[0].query_seed_languages,'tr');assert.equal(csvRows[0].source_extracted_at,'2026-11-27T08:00:00Z');
 const mapped=join(root,'mapped');await runKeywords(['map','--input',join(importDir,'keywords.json'),'--output',mapped]);
 const report=JSON.parse(await readFile(join(mapped,(await readdir(mapped))[0],'keywords.json'),'utf8'));
 assert.equal(report.metadata.segment.id,'tr-DE');assert.equal(report.rows[0].avg_monthly_searches,'100–1.000');assert.equal(keywordFindings(report,[family])[0].page_id,'topic-cases:tr');
});
test('customer and planning reads use their distinct REST paths and errors omit token echoes',async()=>{
 const seen=[];const api=keywordApi('private-test-token','v26','1234567890','0987654321',async(url,init)=>{seen.push({url,init});return new Response(JSON.stringify({results:[]}));});
 await api('checkCustomer');await api('generateKeywordIdeas',{keywordSeed:{keywords:['DTZ']}});
 assert.equal(seen[0].url,'https://googleads.googleapis.com/v26/customers/1234567890/googleAds:search');
 assert.equal(seen[1].url,'https://googleads.googleapis.com/v26/customers/1234567890:generateKeywordIdeas');
 assert.equal(seen[1].init.headers['login-customer-id'],'0987654321');
 await assert.rejects(api('mutateCampaigns',{}),/Only keyword reads/);
 const denied=keywordApi('private-test-token','v26','1234567890','',async()=>new Response(JSON.stringify({error:{status:'PERMISSION_DENIED',message:'private-test-token'}}),{status:403}));
 await assert.rejects(denied('checkCustomer'),error=>error.message.includes('403')&&!error.message.includes('private-test-token'));
});
