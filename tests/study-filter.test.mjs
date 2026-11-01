import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesStudyItem, studyFilterState } from '../src/dtz-study-filter.js';

test('study filters intersect level, situation, content type and exam section', () => {
 const word={level:'A1',topic:'Tanışma',kind:'word',type:'isim',parts:'Hören|Sprechen'};
 assert.equal(matchesStudyItem(word,{level:'A1',topic:'Tanışma',kind:'word',type:'isim',part:'Sprechen'}),true);
 for(const mismatch of [{level:'B1'},{topic:'Randevu'},{kind:'phrase'},{type:'fiil'},{part:'Schreiben'}]) assert.equal(matchesStudyItem(word,mismatch),false);
 assert.equal(matchesStudyItem(word,{}),true);
});

const filterItems = [
 {level:'A1',listTier:'temel',topic:'Tanışma',kind:'word',type:'isim',parts:'Hören|Sprechen'},
 {level:'A1',listTier:'temel',topic:'Tanışma',kind:'phrase',parts:'Sprechen'},
 {level:'A1',listTier:'full',topic:'Alışveriş',kind:'word',type:'fiil',parts:'Lesen'},
 {level:'A2',listTier:'temel',topic:'Randevu',kind:'sentence',parts:'Schreiben'},
];

test('level and list choices limit situations and clear incompatible downstream selections', () => {
 const {filters,options}=studyFilterState(filterItems,{level:'A1',list:'temel',topic:'Randevu',kind:'sentence',part:'Schreiben'});
 assert.deepEqual(options.topic,['Tanışma']);
 assert.equal(filters.level,'A1');
 assert.equal(filters.topic,'');
 assert.equal(filters.kind,'');
 assert.equal(filters.part,'');
 assert.deepEqual(options.kind,['word','phrase']);
 assert.deepEqual(options.part,['Hören','Sprechen']);
 assert.deepEqual(studyFilterState(filterItems,{level:'A1',list:'full'}).options.topic,['Tanışma','Alışveriş']);
 assert.deepEqual(options.level,['A1','A2']);
});

test('non-word content clears word type and offers only its available exam sections', () => {
 const {filters,options}=studyFilterState(filterItems,{level:'A1',list:'full',topic:'Tanışma',kind:'phrase',type:'isim',part:'Hören'});
 assert.equal(filters.kind,'phrase');
 assert.equal(filters.type,'');
 assert.equal(filters.part,'');
 assert.deepEqual(options.type,[]);
 assert.deepEqual(options.part,['Sprechen']);
});

test('compatible selections survive and clearing parents restores choices', () => {
 const selected={level:'A1',list:'full',topic:'Alışveriş',kind:'word',type:'fiil',part:'Lesen'};
 assert.deepEqual(studyFilterState(filterItems,selected).filters,selected);
 const {filters,options}=studyFilterState(filterItems,{...selected,list:'temel'});
 assert.equal(filters.topic,'');
 assert.equal(filters.type,'');
 assert.equal(filters.part,'');
 assert.ok(filterItems.some(item=>matchesStudyItem(item,filters)));
 assert.deepEqual(studyFilterState(filterItems,{list:'full'}).options.topic,['Tanışma','Alışveriş','Randevu']);
 assert.deepEqual(options.type,['isim']);
});

test('list types are cumulative and independent of CEFR level', () => {
 for(const level of ['A1','A2','B1']) {
  const base={level,kind:'phrase',topic:'Randevu',parts:'Sprechen'};
  for(const [selected,allowed] of [['temel',['temel']],['genisletilmis',['temel','genisletilmis']],['full',['temel','genisletilmis','full']]]) {
   for(const listTier of ['temel','genisletilmis','full']) assert.equal(matchesStudyItem({...base,listTier},{level,list:selected}),allowed.includes(listTier));
  }
 }
});
