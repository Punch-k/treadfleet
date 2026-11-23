/* Product page: scroll-pinned process, torque wheel, province tax, one-road-call timeline, phone plan */
(function(){
'use strict';
const TF=window.TF, $=id=>document.getElementById(id);

// pinned process
const proc=$('proc'), psteps=[...document.querySelectorAll('.pstep')], pviews=[...document.querySelectorAll('.pv')], railFill=$('railFill');
let cur=-1;
function setStep(i){ if(i===cur) return; cur=i; psteps.forEach((s,j)=>s.classList.toggle('on',j===i)); pviews.forEach((v,j)=>v.classList.toggle('on',j===i));
  if(i===1){ const tr=$('t3'); tr.style.transform='translate(0,0)'; setTimeout(()=>{ tr.style.transform='translate(-16px,170px)'; },300); }
  if(i===2) runTorque(); }
const pinned=()=>innerWidth>960 && !TF.Q.has('step');
function onScroll(){ if(!pinned()) return; const r=proc.getBoundingClientRect(), total=proc.offsetHeight-innerHeight; if(total<=0) return; const p=Math.min(1,Math.max(0,-r.top/total)); railFill.style.height=(p*100)+'%'; setStep(Math.min(3,Math.floor(p*4))); }
addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',onScroll);
psteps.forEach((s,i)=>s.addEventListener('click',()=>{ if(!pinned()){ setStep(i); return; } const total=proc.offsetHeight-innerHeight; scrollTo({top:proc.offsetTop+total*(i+.5)/4,behavior:'smooth'}); }));
setInterval(()=>{ if(innerWidth<=960 && !TF.REDUCE && !TF.Q.has('step')) setStep((cur+1)%4); },4500);

// torque wheel
const wheel=$('wheel'), NS='http://www.w3.org/2000/svg', ORDER=[1,6,3,8,5,10,7,2,9,4];
for(let i=0;i<10;i++){ const a=-Math.PI/2+i*2*Math.PI/10, x=110+46*Math.cos(a), y=110+46*Math.sin(a);
  const c=document.createElementNS(NS,'circle'); c.setAttribute('cx',x); c.setAttribute('cy',y); c.setAttribute('r',9); c.setAttribute('class','stud');
  const tx=document.createElementNS(NS,'text'); tx.setAttribute('x',x); tx.setAttribute('y',y); tx.setAttribute('class','stud-n'); wheel.appendChild(c); wheel.appendChild(tx); }
let tqRun=0;
async function runTorque(){ const run=++tqRun, studs=[...wheel.querySelectorAll('.stud')], g=$('gauge'), st=$('tqState');
  studs.forEach(s=>s.classList.remove('on')); wheel.querySelectorAll('.stud-n').forEach(n=>n.textContent=''); g.textContent='0'; st.textContent='0 / 10';
  for(let k=0;k<ORDER.length;k++){ if(run!==tqRun) return; const s=studs[ORDER[k]-1]; s.classList.add('on'); s.nextSibling.textContent=k+1; st.textContent=(k+1)+' / 10'; await TF.countTo(g,450,240,v=>Math.round(v)); await TF.sleep(80); } }

// province tax
const PROV={ON:[['HST 13%',.13]],QC:[['GST 5%',.05],['QST 9.975%',.09975]],AB:[['GST 5%',.05]],BC:[['GST 5%',.05],['PST 7%',.07]],MB:[['GST 5%',.05],['RST 7%',.07]],SK:[['GST 5%',.05],['PST 6%',.06]],NS:[['HST 14%',.14]],NB:[['HST 15%',.15]]};
const provBox=$('prov');
function setProv(p){ const base=857, tv=PROV[p].reduce((a,[,r])=>a+base*r,0);
  $('taxLbl').textContent=PROV[p].map(x=>x[0]).join(' + '); $('taxV').textContent=tv.toFixed(2); $('totV').textContent=(base+tv).toFixed(2);
  provBox.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.textContent===p)); }
Object.keys(PROV).forEach(p=>{ const b=document.createElement('button'); b.type='button'; b.textContent=p; b.onclick=()=>setProv(p); provBox.appendChild(b); }); setProv('ON');

// one road call
const dtabs=[...document.querySelectorAll('#dayTabs button')], dpanes=[...document.querySelectorAll('.dpane')]; let dayI=0, dayTimer=null, dayStarted=false, dayRun=0;
const DAYTXT={en:"Unit 4521, steer left. Came off at <span class='k'>6/32</span>, casing looks good. Put on a new <span class='k'>11R22.5</span>, torqued to <span class='k'>450</span>. Road call, <span class='k'>hour and a half</span>. Three photos.",
              fr:"Unité 4521, directrice gauche. Retiré à <span class='k'>6/32</span>, carcasse correcte. Posé un <span class='k'>11R22.5</span> neuf, serré à <span class='k'>450</span>. Appel de service, <span class='k'>une heure et demie</span>. Trois photos."};
async function typeDay(){ const run=++dayRun, box=$('dayTrans'), ex=[...document.querySelectorAll('#dayEx div')]; ex.forEach(e=>e.classList.remove('on')); box.innerHTML='';
  const full=DAYTXT[TF.lang]; if(TF.REDUCE){ box.innerHTML=full; ex.forEach(e=>e.classList.add('on')); return; }
  let out=''; for(const part of full.split(/(<span class='k'>.*?<\/span>)/)){ if(run!==dayRun) return; if(part.startsWith('<span')){ out+=part; box.innerHTML=out; await TF.sleep(110); continue; } for(const ch of part){ if(run!==dayRun) return; out+=ch; box.innerHTML=out; await TF.sleep(15); } }
  for(const e of ex){ if(run!==dayRun) return; e.classList.add('on'); await TF.sleep(150); } }
function showDay(i){ dayI=(i+dtabs.length)%dtabs.length; dtabs.forEach((b,j)=>{ b.classList.remove('on'); void b.offsetWidth; b.classList.toggle('on',j===dayI); b.classList.toggle('done',j<dayI); }); dpanes.forEach((p,j)=>p.classList.toggle('on',j===dayI));
  if(dayI===2) typeDay(); clearTimeout(dayTimer); const d=dayI===2?7500:4500; dtabs[dayI].style.setProperty('--d',d+'ms'); if(!TF.REDUCE && !TF.Q.has('day')) dayTimer=setTimeout(()=>showDay(dayI+1),d); }
dtabs.forEach((b,i)=>b.addEventListener('click',()=>showDay(i)));
TF.onView($('day'), ()=>{ dayStarted=true; showDay(0); }, .3);

// phone plan
TF.onView($('promoPh'), ()=> document.querySelectorAll('#promoPh .plan').forEach((p,i)=>setTimeout(()=>p.classList.add('on'), TF.REDUCE?0:220*i+200)), .4);

document.addEventListener('tf:lang', ()=>{ if(dayStarted) showDay(dayI); });

// preview helpers
if(TF.Q.get('step')!==null){ proc.style.height='auto'; const pin=proc.querySelector('.proc-pin'); pin.style.position='static'; pin.style.height='auto'; pin.style.padding='80px 0'; setStep(+TF.Q.get('step')); }
if(TF.Q.get('day')!==null){ dayStarted=true; showDay(+TF.Q.get('day')); }
onScroll();
// deep link from the home chooser: product.html?s=N#process
const sp=TF.Q.get('s'); if(sp!==null && !TF.Q.has('step')){ const i=Math.max(0,Math.min(3,+sp)); setTimeout(()=>{ if(pinned()){ const total=proc.offsetHeight-innerHeight; scrollTo({top:proc.offsetTop+total*(i+.5)/4}); } else { setStep(i); proc.scrollIntoView(); } }, 150); }
})();
