/* TreadFleet homepage: i18n, hero pipeline, pinned process, day-in-the-life, counters, pilot form. */
(function(){
'use strict';
const FR = {
 nav1:"Ce que c'est", nav2:"Ce que vous gagnez", nav3:"Sur le terrain", nav4:"Fondateur", nav5:"FAQ", cta:"Postuler au projet pilote", ctaHow:"Voir le fonctionnement",
 heroEyebrow:"Pour les équipes de pneus commerciaux au Canada", heroH1:"Le camion est réparé. <span class=\"hl\">La paperasse aussi.</span>",
 heroLead:"TreadFleet est le répartiteur numérique des équipes de pneus qui servent les flottes de camions. Votre technicien parle au camion; le bon de travail, le registre de couple, l'inventaire et la facture sont prêts avant son retour dans la cabine. Vous approuvez, c'est envoyé.",
 chip1:"Vous approuvez tout", chip2:"Français et anglais", chip3:"La voix d'abord, gants aux mains", laneA:"Au camion", laneC:"Au bureau",
 phTag:"APPEL DE SERVICE", m1:"Écoute…", m2:"Positions et bande", m3:"Prix de votre liste", m4:"Couple et stock", m5:"Facture préparée",
 sd1:"Aujourd'hui", sd2:"Répartition", sd3:"Travaux", sd4:"Flottes", sd5:"Stock", sd6:"Factures",
 docType:"Brouillon de facture · depuis une note vocale", docPrep:"Préparation", docReady:"Prête", docSent:"Envoyée", docPos:"Directrice gauche", thItem:"Article", thQty:"Qté",
 src1:"« posé un 11R22.5 neuf »", itRoad:"Appel de service + main-d'œuvre", src2:"« appel de service, une heure et demie »", itTorque:"Couple + rappel de resserrage", src3:"« serré à 450 »", itCasing:"Crédit de carcasse", src4:"« carcasse correcte »",
 sub:"Sous-total", approve:"Approuver et envoyer", stamp:"APPROUVÉE", sentTo:"Envoyée à Northline Freight ✓", saved:"· 2 min au lieu d'une soirée",
 pipeNote:"Exemple illustratif. Noms et prix fictifs. Les prix viennent toujours de votre propre liste.", pause:"Pause", play:"Lecture",
 pEyebrow:"Pourquoi vous êtes encore au bureau à 21 h", pH2:"Les outils sont rangés. La paperasse, non.", pLead:"Les techniciens en pneus commerciaux sont les plus difficiles à recruter. Leurs heures devraient aller aux camions, pas à la saisie. Voici les sept choses qui les grugent.",
 p1h:"Des bons de travail éparpillés entre planchettes et téléphones", p1:"Numéros d'unité, positions et profondeurs vivent sur papier, dans un texto, dans la tête de quelqu'un. Ce qui n'est pas noté n'est jamais facturé.", p1f:"Un atelier de la région de Toronto estimait perdre 20 000 à 30 000 $ par an en papiers égarés",
 p2h:"Des registres de couple impossibles à prouver", p2:"Quand une roue se détache, la première question est : où est le registre de couple? En Ontario, une perte de roue est une infraction de responsabilité absolue.", p2f:"Amendes de 2 000 à 50 000 $ (Ontario)",
 p3h:"Les appels de service chamboulent le plan", p3:"Un éclatement sur la 401 sort un technicien de la vérification en cour, et la journée se réorganise au téléphone.",
 p4h:"Des factures refusées", p4:"Mauvais numéro d'unité, bon de commande manquant. Chaque refus redémarre l'attente d'un payeur déjà lent.",
 p5h:"Un inventaire que personne ne voit", p5:"Quelles dimensions dans quel camion? Des carcasses chez le rechapeur? Vous le découvrez quand le pneu manque.",
 p6h:"Encore un outil qui ne parle pas aux autres", p6:"Installation, formation, cinq applications qui ne communiquent pas. Vous avez appris le métier, pas l'informatique.",
 p7h:"Des logiciels pensés pour les garages auto", p7:"Des baies, des voitures et un client au comptoir, pas un numéro d'unité, un bon de commande de flotte et l'accotement de l'autoroute.",
 wEyebrow:"Ce qu'est TreadFleet", wBig:"Pas une application de plus à nourrir. Un <em>répartiteur numérique</em> qui fait le travail de bureau autour de chaque intervention.",
 w1:"<b>Il écoute comme un conseiller de service d'expérience.</b> Vos techniciens parlent; il repère unités, positions, 32e, pièces et couple.",
 w2:"<b>Il prépare, vous décidez.</b> Bons de travail, factures et horaires attendent votre approbation d'un geste.",
 w3:"<b>Il apprend votre atelier.</b> Vos prix, vos marques, les règles de chaque flotte. Chaque correction améliore le prochain brouillon.",
 prEyebrow:"De l'appel à la facture payée", prH2:"Quatre tâches qu'il enlève de votre bureau",
 ps1k:"RÉCEPTION", ps1h:"Demandes triées, travaux créés", ps1:"Appels, textos, courriels et WhatsApp des flottes arrivent dans une seule boîte. Chacun devient un travail avec la bonne flotte, l'unité et le bon de commande.",
 ps2k:"RÉPARTITION", ps2h:"Le bon technicien, le bon pneu", ps2:"Les appels de service s'insèrent autour des vérifications en cour : technicien le plus proche, bonnes compétences, bonne dimension dans le camion. Un clic pour confirmer.",
 ps3k:"CONSIGNER", ps3h:"Chaque roue consignée", ps3:"Valeur de couple, séquence, heure et technicien pour chaque roue, avec rappels de resserrage automatiques.",
 ps4k:"FACTURER", ps4h:"Facturé avant votre retour", ps4:"Soumission comparée au travail fait, extras signalés, taxe provinciale appliquée, bon de commande sur chaque ligne. Approuvez, c'est envoyé.",
 scrollHint:"Continuez à défiler", inbox:"Boîte de réception", newReq:"4 nouvelles demandes",
 mg1:"« La directrice de la 4521 a éclaté sur la 401 est, km 362 »", mgA1:"Appel de service", mg2:"« Pouvez-vous faire la cour jeudi? 12 unités, vérification habituelle »", mgA2:"Vérification en cour", mg3:"« Bon de commande WB-505 pour les motrices de l'unité 77 »", mgA3:"BC associé", mgVm:"Message vocal", mg4:"« Remorque 2 de l'unité 118 perd de l'air, rappelez »", mgA4:"Travail créé",
 dispatch:"Répartition · en direct", newRoad:"Nouvel appel de service", mapT:"Priya · Camion 3", mapS:"11R22.5 à bord · à 34 min", confirm:"Confirmer",
 torqueT:"Registre de couple · Unité 4521 · Directrice G", pattern:"Séquence en étoile · spéc. 450 lb-pi", tqTech:"Technicien", tqWrench:"Clé", tqWrenchV:"Étalonnée mars 2026", tqRe:"Resserrage", tqReV:"Rappel à 80 km",
 ready:"Prête à approuver", attWo:"Bon de travail", attTq:"Registre de couple", attPh:"3 photos", unitOk:"Unité 4521 ✓", itRoad2:"Appel de service + main-d'œuvre 1,5 h", itCasing2:"Crédit de carcasse", provNote:"Choisissez une province : la taxe est calculée, jamais devinée. Taux illustratifs.",
 vEyebrow:"Ce que vous gagnez", vH2:"Ce que nous visons", vPre1:"Seulement", v1h:"De la note vocale au bon de travail", v1:"Ce qui prend une soirée de saisie, de jumelage et de prix devient une révision rapide.",
 vPre2:"Le jour", v2v:"même", v2h:"Factures aux flottes", v2:"Préparées avant votre retour, avec bon de commande et unité sur chaque ligne, donc moins de refus.",
 vPre3:"Chaque", v3h:"Roue consignée", v3:"Valeur, séquence, technicien et heure au registre, avec rappels de resserrage.", vPre4:"Moins de", v4h:"Pour démarrer", v4:"Aucun projet informatique, aucun atelier de fin de semaine. Apportez votre liste de prix.",
 vNote:"Objectifs du pilote, pas des résultats. Les vrais chiffres seront publiés après un trimestre complet d'utilisation.",
 dEyebrow:"TreadFleet sur le terrain", dH2:"Un appel de service. Un dossier qui s'écrit tout seul.", dLead:"Suivez le travail n° 1187 du premier texto au resserrage, comme le voit le bureau.",
 dt1:"L'appel arrive", dt2:"Technicien envoyé", dt3:"Note vocale au camion", dt4:"Couple consigné", dt5:"Facture approuvée", dt6:"Resserrage confirmé",
 d1h:"Nouvel appel de service", lbUnit:"Unité", lbProb:"Problème", d1p:"Éclatement directrice", lbLoc:"Lieu", srcSms:"depuis le texto", srcHist:"historique de la flotte",
 d2h:"Priya est en route", d2s:"Technicien le plus proche avec la dimension à bord", lbTech:"Technicien", lbOnboard:"À bord", lbBrief:"Fiche envoyée", d2b:"Historique, liste de matériel",
 d3h:"Note vocale, structurée", d3s:"transcrite et triée", exPos:"Position", exPosV:"Directrice · Gauche", exRem:"Retiré", exIns:"Installé", exTq:"Couple", exLab:"Main-d'œuvre", exPh:"Photos", exPhV:"3 jointes",
 d4h:"Couple au registre", d4s:"Enregistré avec le travail, prêt pour tout audit", lbVal:"Valeur", lbPat:"Séquence", d4p:"En étoile", lbTime:"Heure", lbRe:"Resserrage", d4r:"Rappel réglé · 80 km",
 d5h:"Facture approuvée et envoyée", d5s:"Approuvée depuis le téléphone du propriétaire à 9 h 02", lbInv:"Facture", lbTot:"Total", lbTo:"Envoyée à", lbAtt:"Pièces jointes", d5a:"Bon de travail, registre de couple, photos",
 d6h:"Resserrage confirmé", d6s:"Confirmé par le chauffeur par texto à 82 km", lbStatus:"Statut", d6st:"Travail fermé", lbFile:"Dossier", d6f:"6 entrées, complet", lbStock:"Stock", lbCasing:"Carcasse", d6c:"En attente du crédit du rechapeur",
 aEyebrow:"Sur la route", aH2:"Vos techniciens ont un seul gros bouton.", aLead:"Le plan du jour, le travail et un bouton d'enregistrement. Même connexion qu'au bureau. Pas de formulaires, pas de saisie avec des gants.",
 f1:"<b>Le plan du jour</b>Vérifications en cour et appels de service dans l'ordre, avec l'historique de l'unité.", f2:"<b>Un geste vers le travail</b>Appeler le chauffeur, ouvrir la navigation.", f3:"<b>Appuyez et parlez</b>Français ou anglais. Les photos s'attachent à la bonne roue.",
 phToday:"Aujourd'hui · Marc", phRoad:"9 h 20 · Appel de service", phU:"Motrice D intérieure · remplacer", phW:"Resserrage · 3 unités", talk:"● Parler",
 tEyebrow:"Notre promesse", tH2:"Conçu pour inspirer confiance sur le terrain", tr1h:"Vous gardez le contrôle", tr1:"Aucun bon de travail, aucune facture ni aucun horaire ne part sans votre accord.", tg1:"Flux d'approbation", tg2:"Piste d'audit complète",
 tr2h:"Données canadiennes", tr2:"Hébergé au Canada, conçu pour la LPRPDE et la Loi 25 du Québec. Exportez vos données en tout temps.", tg3:"Loi 25",
 tr3h:"Un registre, pas une supposition", tr3:"Prix de votre liste, taxe calculée, couple conservé tel qu'enregistré. Jamais inventé.", tg4:"Votre liste de prix", tg5:"FR / EN",
 q1:"Encore une application que mes techniciens doivent apprendre?", a1:"Non. Le technicien appuie sur enregistrer et parle, comme pour un message vocal. Les photos s'attachent au travail. Le reste se fait en arrière-plan.",
 q2:"Est-ce que ça fonctionne pour les pneus de camion, pas seulement les voitures?", a2:"C'est tout l'objectif : numéros d'unité, positions directrice, motrice et remorque, 32e, carcasses, rechapage, couple et resserrage, bons de commande.",
 q3:"Et s'il se trompe?", a3:"Rien ne part sans votre approbation. Corrigez en quelques secondes et il s'en souvient. Les prix viennent toujours de votre liste.",
 q4:"Gère-t-il les appels de service et les vérifications planifiées?", a4:"Oui. Les appels de service s'insèrent autour du travail planifié, et la répartition montre qui est le plus proche avec le bon pneu.",
 q5:"Fonctionne-t-il avec mon logiciel comptable?", a5:"Les factures s'exportent pour votre comptable. Les connexions directes sont prévues pendant le pilote; dites-nous lequel vous utilisez.",
 q6:"Combien ça coûte?", a6:"Nous sommes en phase pilote. Les équipes pilotes obtiennent un tarif spécial durable et connaissent le prix final en premier.",
 fEyebrow:"Né sur le plancher de l'entrepôt", fQuote:"J'ai géré l'inventaire de pneus et des comptes de flottes à Calgary. Les camions étaient réparés vite. La paperasse prenait les soirées. TreadFleet, c'est l'aide de bureau que j'aurais voulu avoir.",
 fBio:"Prapanch Kokkalemada, fondateur. Ancien coordonnateur ventes et opérations et gestionnaire de comptes chez un distributeur de pneus commerciaux à Calgary : un entrepôt de 18 000 pi², des négociations avec les fournisseurs et des centaines de clients en logistique.",
 c1:"Distribution de pneus, Calgary", c2:"Ruptures de stock réduites de 30 %", c4:"Chaîne d'approvisionnement",
 plEyebrow:"Projet pilote · 10 équipes", plH2:"Contribuez dès le premier jour", plLead:"Nous commençons avec dix équipes de pneus commerciaux au Canada. Dites-nous comment vous travaillez aujourd'hui.", seatNote:"10 places pilotes · candidatures étudiées personnellement",
 pk1:"Accompagnement personnel par le fondateur", pk2:"Votre façon de travailler oriente la suite", pk3:"Tarif pilote durable",
 fName:"Votre nom", fCompany:"Entreprise", fRole:"Votre rôle", choose:"Choisir…", rOwnerOp:"Technicien propriétaire-exploitant", rShop:"Propriétaire d'atelier ou d'équipe", rDispatch:"Répartiteur / directeur de service", rFleet:"Responsable de l'entretien de flotte", rOther:"Autre",
 fProvince:"Province", fTechs:"Techniciens", fFleets:"Flottes servies", fPain:"Votre plus gros casse-tête", fPainPh:"p. ex. factures envoyées en retard, registres de couple sur papier", fEmail:"Courriel", fPhone:"Téléphone (facultatif)",
 fConsent:"J'accepte que mes coordonnées soient conservées pour me contacter au sujet du pilote, comme décrit dans la <a href=\"privacy.html\">politique de confidentialité</a>. Pas d'infolettre, aucun partage.", fSubmit:"Postuler au projet pilote",
 fooTag:"Le répartiteur numérique des équipes de pneus commerciaux. Fait au Canada.", privacy:"Confidentialité", terms:"Conditions",
 msgOk:"Merci! Nous vous contactons personnellement très bientôt.", msgErr:"Envoi impossible pour le moment. Réessayez plus tard.", msgCheck:"Veuillez remplir les champs requis et accepter la politique de confidentialité."
};
const EN = {docPrep:"Preparing", docReady:"Ready", docSent:"Sent", sentTo:"Sent to Northline Freight ✓", saved:"· 2 min, not an evening", pause:"Pause", play:"Play",
  msgOk:"Thanks! We'll reach out to you personally very soon.", msgErr:"We couldn't send that right now. Please try again later.", msgCheck:"Please fill in the required fields and accept the privacy policy."};
document.querySelectorAll('[data-i]').forEach(el=>{ const k=el.dataset.i; if(!(k in EN)) EN[k] = el.hasAttribute('data-html') ? el.innerHTML : el.textContent; });
document.querySelectorAll('[data-i-ph]').forEach(el=>{ EN[el.dataset.iPh] = el.placeholder; });
let LANG = 'en';
const t = k => (LANG==='fr' && FR[k]) || EN[k] || k;
const $ = id => document.getElementById(id);
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r=> setTimeout(r, REDUCE ? 0 : ms));

// ---------- language ----------
function splitWords(el){
  const tmp=document.createElement('div'); tmp.innerHTML=t(el.dataset.i); let i=0;
  const walk=node=>[...node.childNodes].map(n=>{ if(n.nodeType===3) return n.textContent.split(/(\s+)/).map(w=> (!w||/^\s+$/.test(w)) ? w : `<span class="sw" style="transition-delay:${(i++)*55}ms">${w}</span>`).join('');
    const c=n.cloneNode(false); c.innerHTML=walk(n); return c.outerHTML; }).join('');
  el.innerHTML=walk(tmp); el.classList.add('split-words');
}
function applyLang(){
  document.documentElement.lang=LANG;
  document.querySelectorAll('[data-i]').forEach(el=>{ if(el.classList.contains('split')) return splitWords(el); const v=t(el.dataset.i); if(el.hasAttribute('data-html')) el.innerHTML=v; else el.textContent=v; });
  document.querySelectorAll('[data-i-ph]').forEach(el=> el.placeholder=t(el.dataset.iPh));
  document.querySelectorAll('.lang button').forEach(b=> b.classList.toggle('on', b.dataset.lang===LANG));
  $('pipeToggle').textContent=t(heroPlaying?'pause':'play');
  try{ localStorage.setItem('lang',LANG); }catch(e){}
  buildTicker(); restartHero(); if(dayStarted) showDay(dayI);
}
document.querySelectorAll('.lang button').forEach(b=> b.addEventListener('click', ()=>{ LANG=b.dataset.lang; applyLang(); }));

// ---------- reveal ----------
const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }),{threshold:.15});
document.querySelectorAll('.reveal,.split').forEach(el=>io.observe(el));

// ---------- ticker ----------
function buildTicker(){
  const items = LANG==='fr'
    ? [["Unité 118","couple consigné 450 lb-pi","✓"],["Northline Freight","facture approuvée · BC 77812","✓"],["Appel · 401 km 362","Priya envoyée · arrivée 34 min",""],["Prairie Haul","6 pneus à remplacer dans 30 jours",""],["Unité 4521","rappel de resserrage envoyé","✓"],["Carcasse 11R22.5","crédit reçu du rechapeur","✓"],["Westbound Logistics","vérification en cour jeudi 7 h",""],["Stock camion 3","11R22.5 sous 2 · commande suggérée",""]]
    : [["Unit 118","torque logged 450 ft-lb","✓"],["Northline Freight","invoice approved · PO 77812","✓"],["Road call · 401 km 362","Priya dispatched · ETA 34 min",""],["Prairie Haul","6 tires due in 30 days",""],["Unit 4521","re-torque reminder sent","✓"],["Casing 11R22.5","credit received from retreader","✓"],["Westbound Logistics","yard check booked Thu 7:00",""],["Truck 3 stock","11R22.5 below 2 · reorder suggested",""]];
  const html=items.map(([a,b,c])=>`<span><b>${a}</b> · ${b} <i>${c}</i></span>`).join('');
  $('ticker').innerHTML=html+html;
}

// ---------- hero pipeline ----------
const SCRIPT={en:"Unit 4521, steer left. Came off at |6/32|, casing looks |good|. Put on a new |11R22.5|, torqued to |450|. Road call, |hour and a half|.",
              fr:"Unité 4521, directrice gauche. Retiré à |6/32|, carcasse |correcte|. Posé un |11R22.5| neuf, serré à |450|. Appel de service, |une heure et demie|."};
let heroRun=0, heroPlaying=true, waveTimer=null;
const waveEl=$('wave'); for(let i=0;i<26;i++) waveEl.appendChild(document.createElement('i'));
function waveOn(on){ clearInterval(waveTimer); const bars=[...waveEl.children]; if(!on){ bars.forEach(b=>b.style.height='4px'); return; } waveTimer=setInterval(()=>bars.forEach(b=>b.style.height=(4+Math.random()*22)+'px'),110); }
function countTo(el,end,ms=900,fmt=v=>v.toFixed(2)){ return new Promise(res=>{ if(REDUCE){ el.textContent=fmt(end); return res(); } let done=false; setTimeout(()=>{ if(!done){ done=true; el.textContent=fmt(end); res(); } }, ms+250); const t0=performance.now(); const f=now=>{ if(done) return; const p=Math.min(1,Math.max(0,(now-t0)/ms)); el.textContent=fmt(end*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(f); else { done=true; res(); } }; requestAnimationFrame(f); }); }
function setClock(min){ $('clk').textContent=(LANG==='fr'?'mar. ':'Tue ')+'09:'+String(41+min).padStart(2,'0'); }
async function heroLoop(){
  const run=++heroRun, alive=()=>run===heroRun;
  const trans=$('phTrans'), photos=[...document.querySelectorAll('.ph-photos i')], rec=$('phRec'), recT=$('recT');
  const mini=[...document.querySelectorAll('#mini li')], brain=$('brain'), rows=[...document.querySelectorAll('.doc tr.li')], state=$('docState'), stamp=$('stamp'), sent=$('sentTxt');
  trans.innerHTML=''; photos.forEach(p=>p.classList.remove('on')); mini.forEach(m=>m.className=''); rows.forEach(r=>r.classList.remove('on','flash'));
  ['tSub','tTax','tTot'].forEach(id=>$(id).textContent='0.00'); state.className='pill hv'; state.textContent=t('docPrep'); stamp.classList.remove('on'); sent.textContent=''; $('saved').textContent=''; setClock(0); recT.textContent='0:00';
  rec.classList.add('rec-on'); waveOn(true);
  let sec=0; const recTimer=setInterval(()=>{ sec++; recT.textContent='0:'+String(sec).padStart(2,'0'); },380);
  const toks=[]; SCRIPT[LANG].split('|').forEach((seg,si)=> seg.split(/\s+/).filter(Boolean).forEach(w=> toks.push([w, si%2===1])));
  for(const [w,key] of toks){ if(!alive()){ clearInterval(recTimer); waveOn(false); return; }
    if(/^[.,;:!?]+$/.test(w) && trans.lastChild){ trans.lastChild.textContent=trans.lastChild.textContent.trimEnd()+w+' '; continue; }
    const s=document.createElement('span'); s.className='w'+(key?' k':''); s.textContent=w+' '; trans.appendChild(s); requestAnimationFrame(()=>s.classList.add('on')); await sleep(140); }
  clearInterval(recTimer); waveOn(false); rec.classList.remove('rec-on');
  for(const p of photos){ p.classList.add('on'); await sleep(170); }
  brain.classList.add('working');
  for(let i=0;i<mini.length;i++){ if(!alive()) return; mini[i].className='cur'; const r=rows[i-1]; if(r){ r.classList.add('on','flash'); setTimeout(()=>r.classList.remove('flash'),900); } await sleep(820); mini[i].className='done'; if(i===2) setClock(1); }
  brain.classList.remove('working'); if(!alive()) return;
  await Promise.all([countTo($('tSub'),857),countTo($('tTax'),111.41),countTo($('tTot'),968.41)]);
  state.className='pill go'; state.textContent=t('docReady'); setClock(2);
  await sleep(1000); if(!alive()) return;
  $('approve').animate([{transform:'scale(1)'},{transform:'scale(.92)'},{transform:'scale(1)'}],{duration:260});
  stamp.classList.add('on'); state.textContent=t('docSent'); sent.textContent=t('sentTo'); $('saved').textContent=t('saved');
  await sleep(4000); if(alive() && heroPlaying) heroLoop();
}
function restartHero(){ heroRun++; if(heroPlaying) setTimeout(heroLoop,60); }
$('pipeToggle').addEventListener('click',e=>{ heroPlaying=!heroPlaying; e.target.textContent=t(heroPlaying?'pause':'play'); if(heroPlaying) restartHero(); else heroRun++; });
$('approve').addEventListener('click',()=>{ $('stamp').classList.add('on'); $('sentTxt').textContent=t('sentTo'); });

// ---------- pinned process ----------
const proc=$('proc'), psteps=[...document.querySelectorAll('.pstep')], pviews=[...document.querySelectorAll('.pv')], railFill=$('railFill');
let curStep=-1;
function setStep(i){ if(i===curStep) return; curStep=i; psteps.forEach((s,j)=>s.classList.toggle('on',j===i)); pviews.forEach((v,j)=>v.classList.toggle('on',j===i));
  if(i===1){ const tr=$('t3'); tr.style.transform='translate(0,0)'; setTimeout(()=>{ tr.style.transform='translate(-16px,170px)'; },300); }
  if(i===2) runTorque(); }
const pinned=()=> innerWidth>960;
function onScroll(){ if(!pinned()||document.documentElement.classList.contains('noanim')) return; const r=proc.getBoundingClientRect(), total=proc.offsetHeight-innerHeight; if(total<=0) return; const p=Math.min(1,Math.max(0,-r.top/total)); railFill.style.height=(p*100)+'%'; setStep(Math.min(3,Math.floor(p*4))); }
addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',onScroll);
psteps.forEach((s,i)=>s.addEventListener('click',()=>{ if(!pinned()){ setStep(i); return; } const total=proc.offsetHeight-innerHeight; scrollTo({top:proc.offsetTop+total*(i+.5)/4,behavior:'smooth'}); }));
setInterval(()=>{ if(!pinned() && !REDUCE) setStep((curStep+1)%4); },4500);
const wheel=$('wheel'), NS='http://www.w3.org/2000/svg', ORDER=[1,6,3,8,5,10,7,2,9,4];
for(let i=0;i<10;i++){ const a=-Math.PI/2+i*2*Math.PI/10, x=110+46*Math.cos(a), y=110+46*Math.sin(a);
  const c=document.createElementNS(NS,'circle'); c.setAttribute('cx',x); c.setAttribute('cy',y); c.setAttribute('r',9); c.setAttribute('class','stud');
  const tx=document.createElementNS(NS,'text'); tx.setAttribute('x',x); tx.setAttribute('y',y); tx.setAttribute('class','stud-n'); wheel.appendChild(c); wheel.appendChild(tx); }
let tqRun=0;
async function runTorque(){ const run=++tqRun, studs=[...wheel.querySelectorAll('.stud')], g=$('gauge'), st=$('tqState');
  studs.forEach(s=>s.classList.remove('on')); wheel.querySelectorAll('.stud-n').forEach(n=>n.textContent=''); g.textContent='0'; st.textContent='0 / 10';
  for(let k=0;k<ORDER.length;k++){ if(run!==tqRun) return; const s=studs[ORDER[k]-1]; s.classList.add('on'); s.nextSibling.textContent=k+1; st.textContent=(k+1)+' / 10'; await countTo(g,450,240,v=>Math.round(v)); await sleep(80); } }
const PROV={ON:[['HST 13%',.13]],QC:[['GST 5%',.05],['QST 9.975%',.09975]],AB:[['GST 5%',.05]],BC:[['GST 5%',.05],['PST 7%',.07]],MB:[['GST 5%',.05],['RST 7%',.07]],SK:[['GST 5%',.05],['PST 6%',.06]],NS:[['HST 14%',.14]],NB:[['HST 15%',.15]]};
const provBox=$('prov');
function setProv(p){ const base=857, tv=PROV[p].reduce((a,[,r])=>a+base*r,0);
  $('taxLbl').textContent=PROV[p].map(x=>x[0]).join(' + '); $('taxV').textContent=tv.toFixed(2); $('totV').textContent=(base+tv).toFixed(2);
  provBox.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.textContent===p)); }
Object.keys(PROV).forEach(p=>{ const b=document.createElement('button'); b.type='button'; b.textContent=p; b.onclick=()=>setProv(p); provBox.appendChild(b); }); setProv('ON');

// ---------- day in the life ----------
const dtabs=[...document.querySelectorAll('#dayTabs button')], dpanes=[...document.querySelectorAll('.dpane')]; let dayI=0, dayTimer=null, dayStarted=false, dayRun=0;
const DAYTXT={en:"Unit 4521, steer left. Came off at <span class='k'>6/32</span>, casing looks good. Put on a new <span class='k'>11R22.5</span>, torqued to <span class='k'>450</span>. Road call, <span class='k'>hour and a half</span>. Three photos.",
              fr:"Unité 4521, directrice gauche. Retiré à <span class='k'>6/32</span>, carcasse correcte. Posé un <span class='k'>11R22.5</span> neuf, serré à <span class='k'>450</span>. Appel de service, <span class='k'>une heure et demie</span>. Trois photos."};
async function typeDay(){ const run=++dayRun, box=$('dayTrans'), ex=[...document.querySelectorAll('#dayEx div')]; ex.forEach(e=>e.classList.remove('on')); box.innerHTML='';
  const full=DAYTXT[LANG]; if(REDUCE){ box.innerHTML=full; ex.forEach(e=>e.classList.add('on')); return; }
  let out=''; for(const part of full.split(/(<span class='k'>.*?<\/span>)/)){ if(run!==dayRun) return; if(part.startsWith('<span')){ out+=part; box.innerHTML=out; await sleep(110); continue; } for(const ch of part){ if(run!==dayRun) return; out+=ch; box.innerHTML=out; await sleep(15); } }
  for(const e of ex){ if(run!==dayRun) return; e.classList.add('on'); await sleep(150); } }
function showDay(i){ dayI=(i+dtabs.length)%dtabs.length; dtabs.forEach((b,j)=>{ b.classList.remove('on'); void b.offsetWidth; b.classList.toggle('on',j===dayI); b.classList.toggle('done',j<dayI); }); dpanes.forEach((p,j)=>p.classList.toggle('on',j===dayI));
  if(dayI===2) typeDay(); clearTimeout(dayTimer); const d=dayI===2?7500:4500; dtabs[dayI].style.setProperty('--d',d+'ms'); if(!REDUCE) dayTimer=setTimeout(()=>showDay(dayI+1),d); }
dtabs.forEach((b,i)=>b.addEventListener('click',()=>showDay(i)));
new IntersectionObserver((es,o)=>es.forEach(e=>{ if(e.isIntersecting&&!dayStarted){ dayStarted=true; showDay(0); o.disconnect(); } }),{threshold:.3}).observe($('day'));

// ---------- promo phone, counters, seats ----------
new IntersectionObserver((es,o)=>es.forEach(e=>{ if(e.isIntersecting){ document.querySelectorAll('#promoPh .plan').forEach((p,i)=>setTimeout(()=>p.classList.add('on'),REDUCE?0:220*i+200)); o.disconnect(); } }),{threshold:.4}).observe($('promoPh'));
document.querySelectorAll('[data-count]').forEach(el=>{ const end=+el.dataset.count; new IntersectionObserver((es,o)=>es.forEach(e=>{ if(e.isIntersecting){ countTo(el,end,1300,v=>Math.round(v)); o.disconnect(); } }),{threshold:.6}).observe(el); });
new IntersectionObserver((es,o)=>es.forEach(e=>{ if(e.isIntersecting){ [...document.querySelectorAll('#seats i')].forEach((s,i)=>setTimeout(()=>s.classList.add('lit'),REDUCE?0:120*i)); o.disconnect(); } }),{threshold:.5}).observe($('seats'));

// ---------- pilot form (Supabase, Canada Central; insert-only table) ----------
const FORM_ENDPOINT={url:'https://ipinfzrmhgaxdymnuaev.supabase.co', key:'sb_publishable__-TKGkOjHSit4ntla4UKqA_8EQRfhEj', table:'pilot_applications'};
$('applyForm').addEventListener('submit',async ev=>{
  ev.preventDefault(); const f=ev.target, msg=$('formMsg');
  if(!f.checkValidity()){ msg.style.color='var(--warn)'; msg.textContent=t('msgCheck'); return; }
  const fd=Object.fromEntries(new FormData(f));
  const data={name:fd.name,company:fd.company,role:fd.role||null,province:fd.province||null,techs:fd.techs||null,fleets:fd.fleets||null,pain:fd.pain||null,email:fd.email,phone:fd.phone||null,consent:!!fd.consent,lang:LANG,source:(location.origin+location.pathname).slice(0,300)};
  try{ const r=await fetch(`${FORM_ENDPOINT.url}/rest/v1/${FORM_ENDPOINT.table}`,{method:'POST',headers:{'Content-Type':'application/json',apikey:FORM_ENDPOINT.key,Prefer:'return=minimal'},body:JSON.stringify(data)});
    if(!r.ok) throw new Error(r.status); f.reset(); msg.style.color='var(--go)'; msg.textContent=t('msgOk'); }
  catch(e){ msg.style.color='var(--warn)'; msg.textContent=t('msgErr'); }
});

// ---------- start ----------
try{ if(localStorage.getItem('lang')==='fr') LANG='fr'; }catch(e){}
applyLang(); onScroll();
const Q=new URLSearchParams(location.search);
if(Q.get('only')){ document.documentElement.classList.add('noanim'); document.querySelectorAll('body > header, body > section').forEach(el=>{ if(el.id!==Q.get('only')) el.style.display='none'; }); if(Q.get('only')==='process'){ proc.style.height='auto'; proc.querySelector('.proc-pin').style.position='static'; } }
if(Q.get('step')!==null){ curStep=-1; setStep(+Q.get('step')); }
if(Q.has('ow')) setTimeout(()=>{ const W=document.documentElement.clientWidth; const bad=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>0 && (r.right>W+1) && !e.closest('.ticker,.tread-bg,.navlinks')}).slice(0,8).map(e=>e.tagName+'.'+e.className+':'+Math.round(e.getBoundingClientRect().right)); document.title='OW '+document.documentElement.scrollWidth+'/'+W+' '+bad.join(' | '); },1500);
if(Q.get('day')!==null){ dayStarted=true; showDay(+Q.get('day')); }
if(new URLSearchParams(location.search).has('show')) document.querySelectorAll('.reveal,.split').forEach(el=>el.classList.add('in'));
})();
