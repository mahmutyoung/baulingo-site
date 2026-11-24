import { trackLearningEvent } from '../analytics.js';
import { checkResponses } from './rules.js';

// One controller for small checked exercises. Free writing never enters this code.
export function activateExercise(container, initial = [], onChange = () => {}, context = null) {
  let attempts = 0;
  const fields=[...container.querySelectorAll('[data-exercise-item]')];
  const values=initial.slice();
  const items=fields.map(field=>({answers:JSON.parse(field.dataset.answers || '[]')}));
  const summary=container.querySelector('[data-exercise-feedback]');
  const clear=()=>{
    summary.textContent='';
    fields.forEach(field=>{
      const feedback=field.querySelector('[data-item-feedback]'); feedback.textContent='';
      field.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));
      field.removeAttribute('data-correct');
    });
  };
  const changed=(index,value)=>{ values[index]=value;clear();onChange(values.slice()); };
  fields.forEach((field,index)=>{
    const controls=[...field.querySelectorAll('[data-response]')];
    for(const input of controls) {
      if(input.type==='radio')input.checked=input.value===values[index];
      else input.value=values[index]||'';
      if(!input.hasAttribute('data-order-value')) input.addEventListener(input.tagName==='SELECT'||input.type==='radio'?'change':'input',()=>changed(index,input.value));
      if(input.type==='text') input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();container.querySelector('[data-exercise-check]').click();}});
    }
    const bank=[...field.querySelectorAll('[data-piece]')];
    if(!bank.length)return;
    field.querySelector('[data-order-static]').hidden=true;
    const output=field.querySelector('[data-order-answer]');
    const selected=[];
    // Restore the exact saved chunk sequence, preserving repeated words by index.
    let rest=values[index]||'';
    while(rest) {
      const option=bank.find(button=>!selected.includes(button)&& (rest===button.textContent||rest.startsWith(button.textContent+' ')));
      if(!option)break;
      selected.push(option);rest=rest.slice(option.textContent.length).trimStart();
    }
    const render=()=>{
      bank.forEach(button=>{button.disabled=selected.includes(button);});
      const answer=selected.map(button=>button.textContent).join(' ');
      output.textContent=answer;output.lang=answer?'de':'tr';
      field.querySelector('[data-order-value]').value=answer;
      field.querySelector('[data-order-undo]').disabled=!selected.length;
      return answer;
    };
    render();
    for(const button of bank)button.addEventListener('click',()=>{
      selected.push(button);changed(index,render());
      (bank.find(button=>!button.disabled)||field.querySelector('[data-order-undo]')).focus();
    });
    field.querySelector('[data-order-undo]').addEventListener('click',()=>{const last=selected.pop();changed(index,render());last?.focus();});
    field.querySelector('[data-order-reset]').addEventListener('click',()=>{selected.length=0;changed(index,render());bank[0].focus();});
  });
  container.querySelector('[data-exercise-check]').addEventListener('click',()=>{
    const results=checkResponses(items,values);
    if(context&&results.some(value=>value!==null)){
      attempts++;
      if(attempts>1)trackLearningEvent('exercise_retried',{...context,attempt_number:attempts});
      results.forEach((value,index)=>{if(value!==null)trackLearningEvent('exercise_answered',{...context,exercise_id:'item-'+(index+1),outcome:value?'correct':'incorrect',attempt_number:attempts});});
    }
    results.forEach((result,index)=>{
      const field=fields[index];
      const selected=field.querySelector('input[type="radio"]:checked');
      const explanation=selected?.dataset.optionFeedback || field.dataset.hint;
      field.dataset.correct=String(result);
      field.querySelector('[data-item-feedback]').textContent=result===null?'Önce bu soruyu yanıtla.':`${result?'Doğru.':'Henüz doğru değil.'} ${explanation}`;
      field.querySelectorAll('input:not([type="hidden"]),select').forEach(input=>input.setAttribute('aria-invalid',String(result!==true)));
    });
    const correct=results.filter(value=>value===true).length;
    summary.textContent=results.every(value=>value===null)?'Önce bir yanıt ver.':`${correct} / ${results.length} yanıt doğru. ${correct===results.length?'İstersen sonraki çalışmaya geç.':'Açıklamalara bakıp yeniden deneyebilirsin.'}`;
  });
}
