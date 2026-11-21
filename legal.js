function setL(l){document.body.classList.toggle('fr',l==='fr');document.documentElement.lang=l;document.querySelectorAll('.lang a').forEach(function(a){a.classList.toggle('on',a.dataset.l===l)});try{localStorage.setItem('lang',l)}catch(e){}}
document.querySelectorAll('.lang a').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();setL(a.dataset.l)})});
try{setL(localStorage.getItem('lang')==='fr'||location.hash==='#fr'?'fr':'en')}catch(e){setL('en')}
