import { assembleLetter, editLetterPart, transferLetterParts, letterStartStep, emptyLetterParts } from './letter-rules.js';
import { appendGermanText, writingGermanMentions } from '../learning-text.js';

// Tabler outline icons, distributed with their MIT license in assets/.
export const letterIcon = name => `<svg class="letter-icon" aria-hidden="true" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><use href="/assets/writing-icons.svg#${name}"></use></svg>`;
const make = (tag, className, text) => { const element=document.createElement(tag); element.className=className; if(text)element.textContent=text; return element; };
const button = (label, className='') => { const element=make('button',className,label); element.type='button'; return element; };
const pointIcon = text => /gün|saat|tarih|zaman|dönüş|başlangıç/i.test(text)?'calendar':/ücret|fiyat|ödeme|masraf/i.test(text)?'coin':/yer|adres|ulaşım/i.test(text)?'map-pin':'pencil';

export function activateLetterBuilder(task, initial, root) {
  task.dataset.hasBuilder='';
  const content=task.querySelector('.writing-task-content');
  const draft=task.querySelector('[data-draft]');
  let state={...initial,draft:draft.value,letterParts:emptyLetterParts().map((_,i)=>initial.letterParts?.[i]||'')};
  let step=letterStartStep(state);
  const labels=['Kime yazıyorsun?','Neden yazıyorsun?',...Array.from(task.querySelectorAll('.writing-task-points li'),item=>item.textContent),'Mektubu bitir','Adını yaz','Mektubunu kontrol et'];
  const icons=['user','message-circle',...labels.slice(2,6).map(pointIcon),'signature','user','circle-check'];
  const sections=['Hitap','Giriş',...labels.slice(2,6),'Kapanış','Adın'];
  const commit=(patch,edited=false)=>{
    state={...state,...patch}; draft.value=state.draft;
    const count=task.querySelector('[data-word-count]');
    if(count)count.textContent=`${state.draft.trim().split(/\s+/).filter(Boolean).length} sözcük`;
    task.dispatchEvent(new CustomEvent('writing-letter-change',{bubbles:true,detail:{patch,edited}}));
  };

  const support=make('section','letter-support');
  support.append(make('h3','','Görevin tamamı'));
  const lessonLink=make('a','','Ders açıklamasını oku');lessonLink.href='#ogren';support.append(lessonLink);
  for(const selector of ['[data-stimulus]','.writing-task-points'])support.append(task.querySelector(selector));
  const planner=task.querySelector('.writing-planner');planner.open=false;
  const source=task.querySelector('.writing-source');
  // Retain the original prompt, plan fields and source; present long prose as lists.
  const brief=support.querySelector('[data-stimulus]');
  const list=make('ul','letter-instructions');
  for(const sentence of brief.textContent.split(/(?<=[.!?])\s+/u)){
    const item=make('li','');appendGermanText(item,sentence,writingGermanMentions);list.append(item);
  }
  brief.replaceChildren(list);

  const full=make('div','letter-full');full.dataset.letterFull='';
  const label=content.querySelector(`label[for="${draft.id}"]`);
  const status=task.querySelector('[data-editor-save]'), warning=task.querySelector('[data-editor-warning]');
  const caption=task.querySelector('[data-word-count]').closest('p');
  full.append(label,status,warning,draft,caption);
  const review=task.querySelector('.writing-review-tools');
  const reviewed=task.querySelector('[data-task-reviewed]');

  const builder=make('section','letter-builder');builder.dataset.letterBuilder='';
  const progress=make('p','letter-progress');progress.setAttribute('role','status');progress.setAttribute('aria-live','polite');
  const title=make('h2','letter-question');title.tabIndex=-1;
  const instruction=make('p','letter-instruction');
  const inputLabel=make('label','letter-input-label','Almanca cümlen');inputLabel.htmlFor=`letter-part-${task.dataset.task}`;
  const input=make('textarea','letter-input');input.id=inputLabel.htmlFor;input.lang='de';input.rows=3;input.maxLength=2000;input.dataset.letterInput='';
  const fieldStatus=status.cloneNode(true);fieldStatus.id=`letter-save-${task.dataset.task}`;input.setAttribute('aria-describedby',fieldStatus.id);
  const fieldWarning=warning.cloneNode(true);
  const field=make('div','letter-field');field.append(inputLabel,input,fieldStatus,fieldWarning);
  const suggestions=make('section','letter-suggestions');suggestions.setAttribute('aria-label','Bu adım için cümle yardımı');
  const suggestionTitle=make('h3','');suggestionTitle.innerHTML=letterIcon('message-circle');suggestionTitle.append(document.createTextNode('Cümle yardımı'));
  const related=make('div','letter-related');
  const all=button('Tüm kalıplar','letter-all-patterns');
  const allPatterns=make('div','letter-all-content');allPatterns.hidden=true;
  all.setAttribute('aria-expanded','false');
  const toolbox=root.querySelector('[data-phrase-toolbox]');
  const toolboxHome=toolbox?.parentElement;
  const moveToolbox=()=>{
    const open=allPatterns.hidden; allPatterns.hidden=!open;all.setAttribute('aria-expanded',String(open));
    if(open&&toolbox){allPatterns.append(toolbox);toolbox.open=true;}
    else if(toolbox)toolboxHome.prepend(toolbox);
  };
  all.addEventListener('click',moveToolbox);
  suggestions.append(suggestionTitle,related,all,allPatterns);

  const transfer=button('Bölümlerimi mektuba aktar','button');transfer.hidden=true;transfer.dataset.letterTransfer='';
  const restart=button('Bölüm bölüm yaz','writing-small-button');
  restart.addEventListener('click',()=>showStep(0,true));
  const previousDraft=make('details','letter-previous');
  previousDraft.append(make('summary','','Önceki tam mektubum'),make('p',''));
  const controls=make('div','letter-controls');
  const back=button('Geri','button');const forward=button('Devam et','button button-primary');
  controls.append(back,forward);
  builder.append(progress,title,instruction,field,suggestions,full,transfer,restart,previousDraft,controls);

  const sheet=make('section','letter-sheet');sheet.dataset.letterSheet='';
  const sheetSummary=make('h3','');sheetSummary.innerHTML=letterIcon('file-text');sheetSummary.append(document.createTextNode('Mektubum'));
  const paper=make('div','letter-paper');
  const blocks=sections.map((section,index)=>{
    const block=button('','letter-section');block.dataset.letterSection=index;
    const heading=make('span','letter-section-label');heading.innerHTML=letterIcon(icons[index]);heading.append(document.createTextNode(section));
    const text=make('span','letter-section-text');text.lang='de';
    block.append(heading,text);
    block.addEventListener('click',()=>{showStep(index,true);});
    paper.append(block);return block;
  });
  const finalPreview=make('p','letter-final-preview');finalPreview.lang='de';paper.append(finalPreview);
  sheet.append(sheetSummary,paper);
  const media=matchMedia('(max-width:800px)');
  const layout=make('div','letter-layout');layout.append(builder,sheet);
  content.prepend(support,layout);content.append(planner,source);

  const renderPreview=()=>{
    const composed=assembleLetter(state.letterParts);
    const independent=!!state.draft&&state.draft!==composed;
    finalPreview.hidden=!independent||step!==8;
    finalPreview.textContent=state.draft;
    paper.classList.toggle('letter-has-full-draft',independent);
    blocks.forEach((block,index)=>{
      block.querySelector('.letter-section-text').textContent=state.letterParts[index]||'Henüz yazılmadı.';
      block.classList.toggle('letter-section-empty',!state.letterParts[index].trim());
      block.classList.toggle('letter-section-current',index===step);
      if(index===step)block.setAttribute('aria-current','step');else block.removeAttribute('aria-current');
      // A manually edited full letter is kept as one text, never guessed into sections.
      block.hidden=independent&&step===8;
    });
    transfer.hidden=!(step===8&&independent&&composed);
    previousDraft.hidden=!state.letterPrevious;
    previousDraft.querySelector('p').textContent=state.letterPrevious||'';
  };

  const refreshPhrases=()=>{
    related.replaceChildren();
    if(step===8)return;
    const entries=[...root.querySelectorAll('.writing-toolbox-group dl > div')];
    const point=labels[step].toLocaleLowerCase('tr');
    const groupName=step===0||step===6?'Hitap ve kapanış':step===1?'Yazma nedeni':/neden|hedef|etki/.test(point)?'Neden ve bağlaçlar':/rica|iste|tamir/.test(point)?'Nazik rica':'Bilgi isteme';
    const score=entry=>{
      const text=entry.textContent.toLocaleLowerCase('tr');let rank=entry.closest('.writing-toolbox-group').querySelector('h3').textContent===groupName?30:0;
      if(step===0&&/sehr geehrt|liebe/.test(text))rank+=10;
      if(step===0&&task.dataset.taskTitle.includes('Herr ')&&/sehr geehrter herr/.test(text))rank+=20;
      if(step===0&&task.dataset.taskTitle.includes('Frau ')&&/sehr geehrte frau/.test(text))rank+=20;
      if(step===6&&/grüße|grüßen/.test(text))rank+=25;
      if(/ücret|fiyat|ödeme/.test(point)&&/kosten|ücret|fiyat/.test(text))rank+=20;
      if(/gün|saat|başlangıç/.test(point)&&/wann|beginn|zeit/.test(text))rank+=15;
      return rank;
    };
    if(step===7){related.append(make('p','','Mektubun sonuna adını yaz.'));return;}
    for(const entry of entries.sort((a,b)=>score(b)-score(a)).slice(0,3)){
      const row=make('div','letter-pattern');
      row.append(make('p','',entry.querySelector('dt').textContent),make('p','',entry.querySelector('dd > p').textContent));
      row.firstElementChild.lang='de';
      row.firstElementChild.className='german-target';
      const add=button('Ekle','writing-phrase-insert');add.setAttribute('aria-label',entry.querySelector('dt').textContent+' kalıbını ekle');
      add.addEventListener('click',()=>{input.focus();entry.querySelector('.writing-phrase-insert').click();});
      row.append(add);related.append(row);
    }
    if(!entries.length)related.append(make('p','','Kalıplar yükleniyor.'));
  };
  function showStep(index, focus=false) {
    step=index;task.dataset.letterStep=step;commit({letterStep:step});
    progress.textContent=`Adım ${step+1} / 9`;
    title.innerHTML=letterIcon(icons[step]);title.append(document.createTextNode(labels[step]));
    instruction.textContent=step===0?'Hitabını Almanca yaz.':step===1?'Neden yazdığını bir cümleyle anlat.':step===6?'Bir kapanış ifadesi yaz.':step===7?'Mektubun sonuna adını yaz.':step===8?'Mektubunu oku. İstediğin cümleyi burada değiştirebilirsin.':'Bu madde için bir Almanca cümle yaz.';
    field.hidden=step===8;full.hidden=step!==8;review.hidden=reviewed.hidden=step!==8;
    suggestionTitle.hidden=related.hidden=step===8;
    if(step===8)full.after(suggestions);else field.after(suggestions);
    restart.hidden=step!==8;restart.textContent=state.letterParts.some(Boolean)?'Bölümleri düzenle':'Bölüm bölüm yaz';
    inputLabel.textContent=step===7?'Adın':'Almanca cümlen';input.value=state.letterParts[step]||'';
    back.disabled=step===0;forward.hidden=step===8;
    forward.textContent=step===7?'Mektubum':'Devam et';
    refreshPhrases();renderPreview();
    if(focus && !matchMedia('(prefers-reduced-motion: reduce)').matches){
      title.getAnimations().forEach(animation=>animation.cancel());
      title.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'});
    }
    if(focus){title.focus();title.scrollIntoView({block:'start',behavior:'instant'});}
  }
  input.addEventListener('input',()=>{
    const next=editLetterPart(state,step,input.value);
    commit({letterParts:next.letterParts,draft:next.draft,letterStep:step},true);renderPreview();
  });
  draft.addEventListener('input',()=>{state.draft=draft.value;renderPreview();});
  transfer.addEventListener('click',()=>{
    const next=transferLetterParts(state);commit({draft:next.draft,letterPrevious:next.letterPrevious},true);renderPreview();draft.focus();
  });
  back.addEventListener('click',()=>showStep(step-1,true));
  forward.addEventListener('click',()=>showStep(step+1,true));
  root.addEventListener('writing-phrases-ready',refreshPhrases);
  root.addEventListener('writing-context-change',()=>{
    if(!allPatterns.hidden&&(task.hidden||root.dataset.studioStage!=='yaz'))moveToolbox();
  });
  root.addEventListener('input',event=>{
    if((event.target===input||event.target===draft)&&!allPatterns.hidden&&media.matches)moveToolbox();
  });
  showStep(step);
}
