/* TreadFleet shared script: language, reveal, counters, parallax, ticker, pilot form. Page scripts listen for 'tf:lang'. */
(function(){
'use strict';
const FR = window.TF_FR || {};
const EN = {msgOk:"Thanks. We'll get back to you personally within a few days.", msgErr:"We couldn't send that right now. Please try again later.", msgCheck:"Please fill in the required fields and accept the privacy policy."};
document.querySelectorAll('[data-i]').forEach(el=>{ const k=el.dataset.i; if(!(k in EN)) EN[k] = el.hasAttribute('data-html') ? el.innerHTML : el.textContent; });
document.querySelectorAll('[data-i-ph]').forEach(el=>{ EN[el.dataset.iPh]=el.placeholder; });
const TF = window.TF = {lang:'en', REDUCE: matchMedia('(prefers-reduced-motion: reduce)').matches, Q:new URLSearchParams(location.search)};
TF.t = k => (TF.lang==='fr' && FR[k]) || EN[k] || k;
TF.EN = EN;
TF.sleep = ms => new Promise(r=>setTimeout(r, TF.REDUCE?0:ms));
TF.countTo = (el,end,ms=900,fmt=v=>v.toFixed(2)) => new Promise(res=>{
  if(TF.REDUCE){ el.textContent=fmt(end); return res(); }
  let done=false; setTimeout(()=>{ if(!done){ done=true; el.textContent=fmt(end); res(); } }, ms+250);
  const t0=performance.now(); const f=now=>{ if(done) return; const p=Math.min(1,Math.max(0,(now-t0)/ms)); el.textContent=fmt(end*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(f); else { done=true; res(); } }; requestAnimationFrame(f); });
TF.onView = (el, fn, threshold=.35) => { if(!el) return; new IntersectionObserver((es,o)=>es.forEach(e=>{ if(e.isIntersecting){ fn(); o.disconnect(); } }),{threshold}).observe(el); };

function applyLang(){
  document.documentElement.lang=TF.lang;
  document.querySelectorAll('[data-i]').forEach(el=>{ const v=TF.t(el.dataset.i); if(el.hasAttribute('data-html')) el.innerHTML=v; else el.textContent=v; });
  document.querySelectorAll('[data-i-ph]').forEach(el=> el.placeholder=TF.t(el.dataset.iPh));
  document.querySelectorAll('.lang button').forEach(b=> b.classList.toggle('on', b.dataset.lang===TF.lang));
  try{ localStorage.setItem('lang',TF.lang); }catch(e){}
  buildTicker();
  document.dispatchEvent(new CustomEvent('tf:lang'));
}
TF.applyLang = applyLang;
document.querySelectorAll('.lang button').forEach(b=> b.addEventListener('click',()=>{ TF.lang=b.dataset.lang; applyLang(); }));

// reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// counters
document.querySelectorAll('[data-count]').forEach(el=> TF.onView(el, ()=> TF.countTo(el, +el.dataset.count, 1200, v=>Math.round(v)), .6));

// parallax photo bands
const par=[...document.querySelectorAll('[data-parallax]')];
if(par.length && !TF.REDUCE){ const tick=()=>{ par.forEach(b=>{ const r=b.parentElement.getBoundingClientRect(); const p=(r.top+r.height/2-innerHeight/2)/innerHeight; b.style.transform=`translateY(${(p*-50).toFixed(1)}px)`; }); }; addEventListener('scroll',tick,{passive:true}); tick(); }

// ticker
function buildTicker(){
  const el=document.getElementById('ticker'); if(!el) return;
  const items = TF.lang==='fr'
    ? [["Unité 118","couple consigné 450 lb-pi","✓"],["Northline Freight","facture approuvée · BC 77812","✓"],["Appel · 401 km 362","Marc en route · 34 min",""],["Prairie Haul","6 pneus à remplacer dans 30 jours",""],["Unité 4521","rappel de resserrage envoyé","✓"],["Carcasse 11R22.5","crédit reçu du rechapeur","✓"],["Westbound Logistics","vérification en cour jeudi 7 h",""],["Stock camion 3","11R22.5 sous 2 · commande suggérée",""]]
    : [["Unit 118","torque logged 450 ft-lb","✓"],["Northline Freight","invoice approved · PO 77812","✓"],["Road call · 401 km 362","Marc on the way · 34 min",""],["Prairie Haul","6 tires due in 30 days",""],["Unit 4521","re-torque reminder sent","✓"],["Casing 11R22.5","credit received from retreader","✓"],["Westbound Logistics","yard check booked Thu 7:00",""],["Truck 3 stock","11R22.5 below 2 · reorder suggested",""]];
  const html=items.map(([a,b,c])=>`<span><b>${a}</b> · ${b} <i>${c}</i></span>`).join('');
  el.innerHTML=html+html;
}

// pilot seats
TF.onView(document.getElementById('seats'), ()=> [...document.querySelectorAll('#seats i')].forEach((s,i)=>setTimeout(()=>s.classList.add('lit'), TF.REDUCE?0:110*i)), .5);

// pilot form (Supabase, Canada Central; insert-only table)
const FORM_ENDPOINT={url:'https://ipinfzrmhgaxdymnuaev.supabase.co', key:'sb_publishable__-TKGkOjHSit4ntla4UKqA_8EQRfhEj', table:'pilot_applications'};
const form=document.getElementById('applyForm');
if(form) form.addEventListener('submit', async ev=>{
  ev.preventDefault(); const msg=document.getElementById('formMsg');
  if(!form.checkValidity()){ msg.style.color='var(--warn)'; msg.textContent=TF.t('msgCheck'); return; }
  const fd=Object.fromEntries(new FormData(form));
  const data={name:fd.name,company:fd.company,role:fd.role||null,province:fd.province||null,techs:fd.techs||null,fleets:fd.fleets||null,pain:fd.pain||null,email:fd.email,phone:fd.phone||null,consent:!!fd.consent,lang:TF.lang,source:(location.origin+location.pathname).slice(0,300)};
  try{ const r=await fetch(`${FORM_ENDPOINT.url}/rest/v1/${FORM_ENDPOINT.table}`,{method:'POST',headers:{'Content-Type':'application/json',apikey:FORM_ENDPOINT.key,Prefer:'return=minimal'},body:JSON.stringify(data)});
    if(!r.ok) throw new Error(r.status); form.reset(); msg.style.color='var(--go)'; msg.textContent=TF.t('msgOk'); }
  catch(e){ msg.style.color='var(--warn)'; msg.textContent=TF.t('msgErr'); }
});

// start
try{ if(localStorage.getItem('lang')==='fr' || location.hash==='#fr') TF.lang='fr'; }catch(e){}
if(TF.Q.get('lang')) TF.lang=TF.Q.get('lang');
if(TF.Q.has('show')){ document.documentElement.classList.add('noanim'); document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in')); }
document.addEventListener('DOMContentLoaded', applyLang);
if(document.readyState!=='loading') setTimeout(applyLang,0);
})();
