import { trackLearningEvent, beginStudy, stopStudy } from '../analytics.js';
import { restoreProgress, remainingTime, resumeTarget, mergeLesson } from './rules.js';
import { activateExercise } from './activities.js';
import { activateWritingStudio } from './studio.js';
import { writingCourse, writingNavigation } from './catalog.js';

const root=document.querySelector('[data-writing]');
if(root)startWriting(root);

function startWriting(root) {
  const key='baulingo-writing:v1';
  const current=root.dataset.current;
  const navigation=root.querySelector('.writing-course-nav');
  if(current) navigation.innerHTML=writingNavigation;
  const review=new URLSearchParams(location.search).get('__review');
  const entries=[...navigation.querySelectorAll('a')].map(link=>{
    const url=new URL(link.href);
    const id=url.pathname.split('/').at(-2);
    if(id===current) link.setAttribute('aria-current','page');
    if(review){url.searchParams.set('__review',review);link.href=url;}
    const {reference,tasks}=writingCourse[id];
    const title=link.textContent;
    const status=document.createElement('span');
    status.className='writing-lesson-status';
    link.append(status);
    return {status,lesson:{id,title,reference,tasks}};
  });
  const lessons=entries.map(({lesson})=>lesson);
  const lesson=lessons.find(lesson=>lesson.id===current);
  const context={activity_id:current||'writing-course',activity_type:'writing',content_language:'tr'};
  let completionRecorded=false;
  const start=()=>{if(current&&!completionRecorded)beginStudy(context);};
  root.addEventListener('input', start);
  root.addEventListener('click', event=>{if(event.target.closest('[data-task] button, [data-task] summary, [data-complete], [data-timer-start], [data-activity] button'))start();},true);
  root.addEventListener('toggle',event=>{if(event.target.matches?.('.writing-model')&&event.target.open){start();trackLearningEvent('answer_revealed',{...context,section_id:event.target.closest('[data-task]')?.dataset.task});}},true);
  const storageMessage=root.querySelector('[data-storage]');
  const saveStatus=root.querySelector('[data-save-status]');
  const failure='Tarayıcıda kayıt kullanılamıyor. Yazın bu açık sayfada kalır; sayfa değişince veya yenilenince kaybolur. Çıkmadan önce yanıtlarını indir.';
  let persistent=true, raw='';
  const unavailable=()=>{
    persistent=false;storageMessage.textContent=failure;storageMessage.hidden=false;storageMessage.classList.add('writing-warning');
    root.querySelectorAll('[data-editor-warning]').forEach(element=>{element.textContent=failure;element.hidden=false;});
    root.querySelectorAll('[data-editor-save]').forEach(element=>{element.textContent='Kalıcı olarak kaydedilmedi.';});
  };
  try{raw=localStorage.getItem(key)||'';}catch{unavailable();}
  let progress=restoreProgress(raw,lessons);
  if(raw&&!progress.last&&!Object.keys(progress.lessons).length){storageMessage.hidden=false;storageMessage.textContent='Önceki mektup kaydı okunamadı. Boş kayıtla devam ediyorsun; diğer çalışmaların etkilenmedi.';}
  const localLesson=current?(progress.lessons[current]||={complete:false,tasks:{}}):null;
  const savedLesson=()=>localLesson;
  const save=(section=null,lessonFields=[],taskFields=[])=>{
    if(persistent)try{
      const fresh=restoreProgress(localStorage.getItem(key)||'',lessons);
      if(current){
        fresh.lessons[current]=mergeLesson(fresh.lessons[current],savedLesson(),{taskId:section?.dataset.task,taskFields,lessonFields});
        for(const field of ['complete','selected','deadline','lastTask','note'])localLesson[field]=fresh.lessons[current][field];
      }
      fresh.last=current||progress.last||fresh.last;
      progress=fresh;localStorage.setItem(key,JSON.stringify(progress));
    }catch{unavailable();}
    if(!persistent&&current)progress.lessons[current]=mergeLesson(progress.lessons[current],savedLesson(),{taskId:section?.dataset.task,taskFields,lessonFields});
    const message=persistent?'Kaydedildi.':'Kalıcı olarak kaydedilmedi; çıkmadan önce yanıtlarını indir.';
    if(section) section.querySelectorAll('[data-editor-save]').forEach(element=>{element.textContent=message;});
    saveStatus.textContent=message;
  };
  if(current){progress.last=current;savedLesson();}
  root.querySelectorAll('[data-enhanced]').forEach(element=>{element.hidden=false;});
  const contents=root.querySelector('.writing-contents');
  const phoneLayout=matchMedia('(max-width: 800px)');
  contents.open=!phoneLayout.matches;phoneLayout.addEventListener('change',event=>{contents.open=!event.matches;});

  const updateProgress=()=>{
    let count=0;
    for(const {status,lesson:{id,reference}} of entries){
      const done=progress.lessons[id]?.complete===true;
      status.textContent=done?'✓':reference?'↗':'○';
      status.setAttribute('aria-label',done?(reference?'Gözden geçirildi':'Tamamlandı'):reference?'Kaynak sayfası':'Henüz tamamlanmadı');
      if(done&&!reference)count++;
    }
    const total=lessons.filter(lesson=>!lesson.reference).length;
    root.querySelector('[data-progress]').textContent=`${count} / ${total} ders tamamlandı`;
    const bar=root.querySelector('[data-progress-bar]');bar.hidden=false;bar.value=count;
    const complete=root.querySelector('[data-complete]');
    if(complete){
      const done=savedLesson().complete===true;
      complete.setAttribute('aria-pressed',String(done));
      complete.textContent=done?'İşaretlendi ✓ · İşareti kaldır':lesson.reference?'Kaynağı gözden geçirdim':'Dersi tamamladım';
    }
    const resume=root.querySelector('[data-resume]');
    if(resume){
      const target=resumeTarget(progress,lessons), next=lessons.find(lesson=>lesson.id===target.lessonId);
      if(resume.hasAttribute('data-guided-start')&&!target.taskId&&!count){
        resume.href='/dtz-mektup-yazma/rehberli-yazma/#task-c11-t1';resume.textContent='Birlikte yazalım';return;
      }
      if(next){
        resume.href=`/dtz-mektup-yazma/${next.id}/${target.taskId?'#task-'+target.taskId:''}`;
        resume.textContent=target.taskId?`Yarım çalışmana dön: ${next.title}`:count?`Devam et: ${next.title}`:'İlk derse başla';
      }
    }
  };
  updateProgress();

  const taskSections=[...root.querySelectorAll('[data-task]')];
  for(const section of taskSections){
    const id=section.dataset.task;
    const task=savedLesson().tasks[id]||={draft:'',revised:'',plan:[],checks:[],responses:[]};
    if(task.guidanceVersion!==2){task.legacyChecks=task.checks||[];task.checks=[];task.guidanceVersion=2;}
    const changed=field=>{task.updatedAt=Date.now();task.reviewed=false;savedLesson().lastTask=id;savedLesson().complete=false;updateReview();save(section,['lastTask','complete'],[...(Array.isArray(field)?field:[field]),'reviewed','updatedAt']);updateProgress();};
    const review=section.querySelector('[data-task-reviewed]');
    const updateReview=()=>{
      review.setAttribute('aria-pressed',String(task.reviewed===true));
      review.textContent=task.reviewed?'Gözden geçirildi ✓ · İşareti kaldır':'Bu çalışmayı gözden geçirdim';
    };
    updateReview();review.addEventListener('click',()=>{task.reviewed=!task.reviewed;updateReview();save(section,[],['reviewed']);if(task.reviewed){start();trackLearningEvent('section_completed',{...context,section_id:id,completion_type:'self_review'});}});
    section.addEventListener('writing-letter-change',event=>{
      const fields=Object.keys(event.detail.patch).filter(field=>['draft','letterParts','letterStep','letterPrevious'].includes(field));
      for(const field of fields)task[field]=event.detail.patch[field];
      if(event.detail.edited)changed(fields);else save(section,[],fields);
    });
    const draft=section.querySelector('[data-draft]')||section.querySelector('[data-legacy-draft]');
    if(draft){
      draft.value=task.draft||'';
      const words=()=>{const count=section.querySelector('[data-word-count]');if(count)count.textContent=`${draft.value.trim().split(/\s+/).filter(Boolean).length} sözcük`;};
      words();if((task.draft||task.revised||task.plan?.some(Boolean)||task.legacyChecks?.some(Boolean))&&section.querySelector('[data-legacy]'))section.querySelector('[data-legacy]').hidden=false;
      draft.addEventListener('input',()=>{task.draft=draft.value;words();changed('draft');});
    }
    const legacy=section.querySelector('[data-legacy]');
    if(legacy&&task.plan?.some(Boolean)){
      task.plan.forEach((value,index)=>{
        const label=document.createElement('label');label.textContent=`Önceki plan ${index+1}`;
        const input=document.createElement('input');input.type='text';input.value=value||'';input.lang='de';input.maxLength=2000;
        label.append(input);legacy.append(label);input.addEventListener('input',()=>{task.plan[index]=input.value;changed('plan');});
      });
    }
    if(task.legacyChecks?.some(Boolean)){
      const legacy=section.querySelector('[data-legacy]');
      const note=document.createElement('p');note.textContent=`Önceki kontrol işaretlerin korundu. Bu görevin listesini yeniden gözden geçir.`;
      if(legacy)legacy.append(note);else section.querySelector('.writing-selfcheck')?.before(note);
    }
    const revised=section.querySelector('[data-revised]');
    if(revised){revised.value=task.revised||'';revised.addEventListener('input',()=>{task.revised=revised.value;changed('revised');});}
    section.querySelectorAll('[data-plan]').forEach(input=>{
      const index=Number(input.dataset.plan);input.value=task.plan?.[index]||'';
      input.addEventListener('input',()=>{(task.plan||=[])[index]=input.value;changed('plan');});
    });
    section.querySelectorAll('[data-selfcheck]').forEach(input=>{
      const index=Number(input.dataset.selfcheck);input.checked=task.checks?.[index]===true;
      // A checkbox alone is not an unfinished written answer or lesson completion.
      input.addEventListener('change',()=>{(task.checks||=[])[index]=input.checked;save(section,[],['checks']);});
    });
    const exercise=section.querySelector('[data-exercise]');
    if(exercise)activateExercise(exercise,task.responses||[],responses=>{task.responses=responses;changed('responses');},{...context,section_id:id});
    else section.querySelectorAll('[data-response]').forEach(input=>{
      const index=Number(input.dataset.valueIndex);input.value=task.responses?.[index]||'';
      input.addEventListener('input',()=>{(task.responses||=[])[index]=input.value;changed('responses');});
    });
  }
  const quick=root.querySelector('[data-activity]');if(quick)activateExercise(quick,[],()=>{},{...context,section_id:'quick-practice'});
  const note=root.querySelector('[data-note]');
  if(note){note.value=savedLesson().note||'';note.addEventListener('input',()=>{savedLesson().note=note.value;save(note.closest('section'),['note']);});}
  root.querySelector('[data-complete]')?.addEventListener('click',()=>{
    savedLesson().complete=!savedLesson().complete;
    save(null,['complete']);updateProgress();
    if(savedLesson().complete&&!completionRecorded){
      start();completionRecorded=true;
      if(!lesson.reference)trackLearningEvent('learning_completed',{...context,completion_type:'self_review'});
      stopStudy();
    }
  });

  const showChoice=(id,remember=false)=>{
    taskSections.filter(task=>task.hasAttribute('data-choice')).forEach(task=>{
      const selected=task.dataset.task===id;task.hidden=!selected;task.open=selected;
      if(!selected)task.querySelector('.writing-model').open=false;
    });
    root.querySelectorAll('[name="writing-task"]').forEach(input=>{input.checked=root.querySelector(`[data-choice="${input.value}"]`)?.dataset.task===id;});
    if(remember){savedLesson().selected=id;save(null,['selected']);}
  };
  if(root.querySelector('[name="writing-task"]')){
    showChoice(savedLesson().selected||'');
    root.querySelectorAll('[name="writing-task"]').forEach(input=>input.addEventListener('change',()=>{
      const selected=root.querySelector(`[data-choice="${input.value}"]`);showChoice(selected.dataset.task,true);
      selected.scrollIntoView({block:'start',behavior:'instant'});
    }));
  }
  const openHash=()=>{
    const id=location.hash.slice(1), section=taskSections.find(task=>task.id===id);
    if(!section)return;
    if(section.hasAttribute('data-choice'))showChoice(section.dataset.task);
    section.hidden=false;section.open=true;
    requestAnimationFrame(()=>section.scrollIntoView({block:'start',behavior:'instant'}));
  };
  openHash();addEventListener('hashchange',openHash);

  const timer=root.querySelector('[data-timer]');
  if(timer){
    const start=root.querySelector('[data-timer-start]'),stop=root.querySelector('[data-timer-stop]'),status=root.querySelector('[data-timer-status]');
    let announced=false;
    const tick=()=>{
      const seconds=remainingTime(savedLesson().deadline);
      timer.textContent=seconds===null?'30:00':`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
      start.hidden=seconds!==null&&seconds>0;stop.hidden=seconds===null||seconds===0;
      if(seconds===0&&!announced){status.textContent='Süre doldu. Taslağın korunuyor; kontrol edip yazmaya devam edebilirsin.';start.textContent='Yeni 30 dakika başlat';announced=true;}
    };
    start.addEventListener('click',()=>{savedLesson().deadline=Date.now()+30*60_000;announced=false;status.textContent='Süreli çalışma başladı. Örnek yanıtı ve cümle yardımını yazdıktan sonra kullanmayı dene.';save(null,['deadline']);tick();});
    stop.addEventListener('click',()=>{savedLesson().deadline=null;announced=false;status.textContent='Kendi hızında çalışıyorsun. Taslağın korunuyor.';save(null,['deadline']);tick();});
    tick();setInterval(tick,1000);
  }

  root.querySelector('[data-export]').addEventListener('click',()=>{
    trackLearningEvent('download_clicked',{...context,activity_id:'writing-export'});
    if(persistent)try{progress=restoreProgress(localStorage.getItem(key)||'',lessons);}catch{unavailable();}
    const lines=['Baulingo · DTZ Mektup Yazma','Serbest yazılar otomatik değerlendirilmemiştir.',''];
    for(const lesson of lessons){
      const saved=progress.lessons[lesson.id];if(!saved)continue;
      lines.push(lesson.title,saved.complete?'Gözden geçirildi/tamamlandı olarak işaretlendi':'Çalışılıyor');
      for(const [id,task] of Object.entries(saved.tasks||{})){
        if(!task.draft&&!task.revised&&!task.plan?.some(Boolean)&&!task.responses?.some(Boolean)&&!task.letterParts?.some(Boolean)&&!task.letterPrevious)continue;
        lines.push(`Çalışma: ${id}`,'Plan:',...(task.plan||[]),'Kısa yanıtlar:',...(task.responses||[]),'Mektubum / önceki serbest yanıtım:',task.draft||'','Geliştirdiğim cümle:',task.revised||'','');
        if(task.letterParts?.some(Boolean))lines.push('Bölüm bölüm çalışmam:',...task.letterParts,'');
        if(task.letterPrevious)lines.push('Önceki tam mektubum:',task.letterPrevious,'');
        if(task.legacyChecks?.some(Boolean))lines.push('Önceki genel kontrol işaretleri:',task.legacyChecks.map((checked,i)=>`${i+1}: ${checked?'işaretli':'işaretsiz'}`).join(', '));
      }
      if(saved.note)lines.push('Öğrenme notum:',saved.note,'');
    }
    const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.join('\n')],{type:'text/plain;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='baulingo-mektup-calismalarim.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  root.querySelector('[data-reset]').addEventListener('click',()=>{
    if(!confirm('Yalnızca bu tarayıcıdaki mektup çalışmaları ve ilerleme işaretleri silinsin mi? Önce yanıtlarını indirebilirsin.'))return;
    try{localStorage.removeItem(key);}catch{storageMessage.hidden=false;storageMessage.textContent='Tarayıcıdaki kayıt silinemedi. Site verilerini tarayıcı ayarlarından yönetebilirsin.';return;}
    location.reload();
  });
  if(current)save();
  activateWritingStudio(root, savedLesson()?.lastTask, savedLesson()?.tasks || {});
}
