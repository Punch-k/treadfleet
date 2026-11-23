/* Home: hero live card + voice-note-to-invoice pipeline demo */
(function(){
'use strict';
const TF=window.TF, t=TF.t, $=id=>document.getElementById(id);

// hero live card: steps tick through in a loop
let lvRun=0;
async function liveLoop(){ const run=++lvRun, steps=[...document.querySelectorAll('#lvSteps li')], times=['08:44','08:44','08:45','08:45','09:02'];
  while(run===lvRun){ steps.forEach(s=>s.className='');
    for(let i=0;i<steps.length;i++){ if(run!==lvRun) return; steps[i].className='cur'; $('lvTime').textContent=times[i]; await TF.sleep(i===0?1600:1100); steps[i].className='done'; }
    await TF.sleep(3200); } }

// pipeline
const SCRIPT={en:"Unit 4521, steer left. Came off at |6/32|, casing looks |good|. Put on a new |11R22.5|, torqued to |450|. Road call, |hour and a half|.",
              fr:"Unité 4521, directrice gauche. Retiré à |6/32|, carcasse |correcte|. Posé un |11R22.5| neuf, serré à |450|. Appel de service, |une heure et demie|."};
const L={en:{prep:'Preparing',ready:'Ready',sent:'Sent',sentTo:'Sent to Northline Freight ✓',saved:'· 2 min, not an evening',pause:'Pause',play:'Play',day:'Tue '},
         fr:{prep:'Préparation',ready:'Prête',sent:'Envoyée',sentTo:'Envoyée à Northline Freight ✓',saved:'· 2 min au lieu d’une soirée',pause:'Pause',play:'Lecture',day:'mar. '}};
const l=()=>L[TF.lang];
let heroRun=0, playing=true, waveTimer=null, started=false;
const waveEl=$('wave'); for(let i=0;i<26;i++) waveEl.appendChild(document.createElement('i'));
function waveOn(on){ clearInterval(waveTimer); const bars=[...waveEl.children]; if(!on){ bars.forEach(b=>b.style.height='4px'); return; } waveTimer=setInterval(()=>bars.forEach(b=>b.style.height=(4+Math.random()*22)+'px'),110); }
const setClock=m=>{ $('clk').textContent=l().day+'09:'+String(41+m).padStart(2,'0'); };
async function pipeLoop(){
  const run=++heroRun, alive=()=>run===heroRun;
  const trans=$('phTrans'), photos=[...document.querySelectorAll('.ph-photos i')], rec=$('phRec'), recT=$('recT'), mini=[...document.querySelectorAll('#mini li')], brain=$('brain'), rows=[...document.querySelectorAll('.doc tr.li')], state=$('docState');
  trans.innerHTML=''; photos.forEach(p=>p.classList.remove('on')); mini.forEach(m=>m.className=''); rows.forEach(r=>r.classList.remove('on','flash'));
  ['tSub','tTax','tTot'].forEach(id=>$(id).textContent='0.00'); state.className='pill hv'; state.textContent=l().prep; $('stamp').classList.remove('on'); $('sentTxt').textContent=''; $('saved').textContent=''; setClock(0); recT.textContent='0:00';
  rec.classList.add('rec-on'); waveOn(true);
  let sec=0; const recTimer=setInterval(()=>{ sec++; recT.textContent='0:'+String(sec).padStart(2,'0'); },380);
  const toks=[]; SCRIPT[TF.lang].split('|').forEach((seg,si)=>seg.split(/\s+/).filter(Boolean).forEach(w=>toks.push([w,si%2===1])));
  for(const [w,key] of toks){ if(!alive()){ clearInterval(recTimer); waveOn(false); return; }
    if(/^[.,;:!?]+$/.test(w) && trans.lastChild){ trans.lastChild.textContent=trans.lastChild.textContent.trimEnd()+w+' '; continue; }
    const s=document.createElement('span'); s.className='w'+(key?' k':''); s.textContent=w+' '; trans.appendChild(s); requestAnimationFrame(()=>s.classList.add('on')); await TF.sleep(140); }
  clearInterval(recTimer); waveOn(false); rec.classList.remove('rec-on');
  for(const p of photos){ p.classList.add('on'); await TF.sleep(170); }
  brain.classList.add('working');
  for(let i=0;i<mini.length;i++){ if(!alive()) return; mini[i].className='cur'; const r=rows[i-1]; if(r){ r.classList.add('on','flash'); setTimeout(()=>r.classList.remove('flash'),900); } await TF.sleep(820); mini[i].className='done'; if(i===2) setClock(1); }
  brain.classList.remove('working'); if(!alive()) return;
  await Promise.all([TF.countTo($('tSub'),857),TF.countTo($('tTax'),111.41),TF.countTo($('tTot'),968.41)]);
  state.className='pill go'; state.textContent=l().ready; setClock(2);
  await TF.sleep(1000); if(!alive()) return;
  $('approve').animate([{transform:'scale(1)'},{transform:'scale(.92)'},{transform:'scale(1)'}],{duration:260});
  $('stamp').classList.add('on'); state.textContent=l().sent; $('sentTxt').textContent=l().sentTo; $('saved').textContent=l().saved;
  await TF.sleep(4200); if(alive() && playing) pipeLoop();
}
function restart(){ heroRun++; if(playing && started) setTimeout(pipeLoop,60); }
$('pipeToggle').addEventListener('click',e=>{ playing=!playing; e.target.textContent=playing?l().pause:l().play; if(playing) restart(); else heroRun++; });
$('approve').addEventListener('click',()=>{ $('stamp').classList.add('on'); $('sentTxt').textContent=l().sentTo; });
TF.onView($('pipe'), ()=>{ started=true; restart(); }, .3);
document.addEventListener('tf:lang', ()=>{ $('pipeToggle').textContent=playing?l().pause:l().play; restart(); lvRun++; liveLoop(); });
})();
