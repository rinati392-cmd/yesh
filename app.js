/* YESH. CONFIG — fill these before launch. Never invent an email destination. */
const SITE_CONFIG = {
  contactEmail: '', // fallback only: your REAL inbox. Opens the visitor's mail app; nothing is sent by the site.
  formEndpoint: '', // preferred: '/api/contact' once api/contact.js is deployed with its env vars (see README).
  gaId: '',         // optional Google Analytics 4 id (G-XXXX). Empty = no analytics and no cookie banner.
};

const $ = (sel,root=document)=>root.querySelector(sel);
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Mobile menu */
const navToggle=$('#menu-toggle');
const overlay=$('#mobile-menu');
function setMenu(open) {
  navToggle.setAttribute('aria-expanded',String(open));
  navToggle.setAttribute('aria-label', open?'סגירת תפריט':'פתיחת תפריט');
  overlay.setAttribute('aria-hidden',String(!open));
  overlay.inert=!open;
  overlay.classList.toggle('is-open',open);
  document.body.classList.toggle('no-scroll',open);
  if(open) requestAnimationFrame(()=>overlay.querySelector('a')?.focus()); else navToggle.focus();
}
if(navToggle && overlay){
  navToggle.addEventListener('click',()=>setMenu(navToggle.getAttribute('aria-expanded')!=='true'));
  overlay.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown', e=>{if(e.key==='Escape' && overlay.classList.contains('is-open')) setMenu(false)});
}

/* Header state + reading progress */
const header=$('#site-header');
const progress=$('.reading-progress');
let scrolling=false;
function updateScroll(){
  header?.classList.toggle('scrolled',window.scrollY>30);
  const doc=document.documentElement;
  if(progress) progress.style.transform=`scaleX(${Math.min(1,Math.max(0,window.scrollY/Math.max(1,doc.scrollHeight-innerHeight)))})`;
  scrolling=false;
}
window.addEventListener('scroll',()=>{if(!scrolling){scrolling=true;requestAnimationFrame(updateScroll)}},{passive:true});
updateScroll();

/* Restrained reveal */
if('IntersectionObserver' in window && !reduceMotion) {
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
    });
  },{threshold:.08,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach((el,i)=>{
    if(el.closest('.hero')) el.style.transitionDelay=`${Math.min(i*120,240)}ms`;
    observer.observe(el);
  });
} else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));

/* Silent preview loop on the films card — only in view, never with reduced motion or data saver */
const saveData=navigator.connection?.saveData;
document.querySelectorAll('.work-video').forEach(video=>{
  if(reduceMotion || saveData || !('IntersectionObserver' in window)) { video.remove(); return; }
  new IntersectionObserver(([entry])=>{
    if(entry.isIntersecting){ video.preload='auto'; video.play().then(()=>video.classList.add('is-playing')).catch(()=>{}); }
    else video.pause();
  },{threshold:.35}).observe(video);
});

const year=$('#year'); if(year) year.textContent=String(new Date().getFullYear());

/* Contact form */
const form=$('#lead-form');
if(form){
  const status=$('#form-status');
  const startedAt=Date.now();
  const showStatus=(message,error=false)=>{status.textContent=message;status.classList.toggle('is-error',error)};
  if(!SITE_CONFIG.formEndpoint && !SITE_CONFIG.contactEmail) showStatus('הטופס עדיין לא מחובר לכתובת יעד. בינתיים אפשר לפנות אלינו ישירות.');
  const validateContact=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)||/^[+\d()\s-]{9,20}$/.test(v);
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const data=new FormData(form);
    const field=k=>String(data.get(k)||'').trim();
    const name=field('name'), contact=field('contact');
    form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
    const fail=(id,msg)=>{const el=$(id);el.setAttribute('aria-invalid','true');el.focus();showStatus(msg,true)};
    if(name.length<2) return fail('#lead-name','נא להזין שם מלא.');
    if(!validateContact(contact)) return fail('#lead-contact','נא להזין מספר טלפון או כתובת אימייל תקינים.');
    if(!$('#lead-consent').checked) return fail('#lead-consent','כדי שנוכל לחזור אליך יש לאשר את מדיניות הפרטיות.');
    if(field('website')) return; // honeypot

    if(SITE_CONFIG.formEndpoint){
      const button=form.querySelector('button[type=submit]');button.disabled=true;showStatus('שולחים את הפנייה…');
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
      try{
        const payload={name,company:field('company'),contact,type:field('type'),message:field('message'),consent:true,website:field('website'),elapsed:Date.now()-startedAt};
        const response=await fetch(SITE_CONFIG.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
        const result=await response.json().catch(()=>({}));
        if(!response.ok||!result.ok) throw new Error(result.error||`HTTP ${response.status}`);
        showStatus('הפנייה נשלחה. נחזור אליך בהקדם — תודה!');form.reset();
      }catch{showStatus('לא ניתן היה לשלוח את הפנייה. אפשר לנסות שוב בעוד רגע.',true)}
      finally{clearTimeout(timer);button.disabled=false}
      return;
    }
    if(SITE_CONFIG.contactEmail){
      const message=`שם: ${name}\nחברה: ${field('company')||'—'}\nיצירת קשר: ${contact}\nסוג פרויקט: ${field('type')||'—'}\nפרטים: ${field('message')||'—'}`;
      showStatus('תיפתח תוכנת הדוא״ל לשליחת הפנייה. נא להשלים את השליחה שם.');
      window.location.href=`mailto:${SITE_CONFIG.contactEmail}?subject=${encodeURIComponent('פנייה חדשה מאתר YESH. — '+name)}&body=${encodeURIComponent(message)}`;
      return;
    }
    showStatus('הטופס עדיין לא מחובר לכתובת יעד, ולכן הפרטים לא נשלחו.',true);
  });
}

/* Analytics — loaded only after explicit opt-in, and only when gaId is configured */
(function consent(){
  if(!SITE_CONFIG.gaId) return;
  const KEY='yesh-consent';
  const read=()=>{try{return localStorage.getItem(KEY)}catch{return null}};
  const write=v=>{try{localStorage.setItem(KEY,v)}catch{}};
  const load=()=>{
    if(window.gtag) return;
    const s=document.createElement('script');s.async=true;s.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(SITE_CONFIG.gaId)}`;document.head.append(s);
    window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};
    gtag('js',new Date());gtag('config',SITE_CONFIG.gaId,{anonymize_ip:true});
  };
  const root=document.documentElement.dataset.root||'';
  const banner=document.createElement('div');
  banner.className='consent-banner';banner.setAttribute('role','region');banner.setAttribute('aria-label','הגדרות עוגיות');
  banner.innerHTML=`<p>אנחנו משתמשים בעוגיות מדידה רק אם תאשרו. <a href="${root}privacy.html">מדיניות הפרטיות</a></p><div><button type="button" data-v="granted">מאשר/ת</button><button type="button" data-v="denied">רק הכרחיות</button></div>`;
  banner.addEventListener('click',e=>{const v=e.target.dataset?.v;if(!v)return;write(v);banner.remove();if(v==='granted')load()});
  const show=()=>{if(!banner.isConnected)document.body.append(banner);banner.querySelector('button').focus()};
  document.querySelectorAll('[data-consent-open]').forEach(b=>{b.hidden=false;b.addEventListener('click',show)});
  const state=read();
  if(state==='granted') load(); else if(!state) document.body.append(banner);
})();
