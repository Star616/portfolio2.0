(() => {
'use strict';
// No identifiers, message contents, contact addresses, or arbitrary URLs in events.
if (navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
window.va = window.va || function () {
  const queue=window.vaq=window.vaq||[];
  if(queue.length<100) queue.push(arguments);
};
window.si = window.si || function () {
  const queue=window.siq=window.siq||[];
  if(queue.length<100) queue.push(arguments);
};
const redact=(event)=>{
  if(event.url){try{const url=new URL(event.url);url.search='';url.hash='';event.url=url.href;}catch{return null;}}
  return event;
};
window.va('beforeSend',redact);
window.si('beforeSend',redact);
const load=(src)=>{const tag=document.createElement('script');tag.src=src;tag.defer=true;document.head.appendChild(tag);};
load('/_vercel/insights/script.js');
load('/_vercel/speed-insights/script.js');
const track=(name,data={})=>{try{window.va('event',{name,data});}catch{/* Measurement never blocks the site. */}};
document.addEventListener('portfolio:viewchange',event=>{
  if(['work','notes','off-duty'].includes(event.detail?.view))track('Section selected',{section:event.detail.view});
});
document.addEventListener('click',event=>{
  const link=event.target.closest('a');
  if(link){
    const chapter=link.dataset.careerJump;
    if(['servicenow','niq','freshworks','blockchain','skilllync'].includes(chapter))track('Career explored',{company:chapter});
    if(link.hasAttribute('download'))track('Resume downloaded');
    else {
      const href=link.getAttribute('href')||'';
      const provider=href.startsWith('mailto:')?'email':href.includes('linkedin.com')?'linkedin':href.includes('youtube.com')?'youtube':href.includes('github.com')?'github':null;
      if(provider)track('Contact or social clicked',{destination:provider});
    }
  }
  const button=event.target.closest('button');
  if(button?.closest('[data-short-player]'))track('Short player opened',{placement:button.closest('[data-short-player]').dataset.shortPlayer});
  if(button?.classList.contains('ap-company-button'))track('Career explored',{company:button.dataset.company});
  if(button?.classList.contains('ap-interest-button'))track('Interest explored',{interest:button.dataset.interest});
  if(button?.classList.contains('ap-embed-toggle')&&button.getAttribute('aria-expanded')==='true')track('LinkedIn post opened');
});
const audio=document.getElementById('anand-voice');
if(audio){
  audio.addEventListener('play',()=>track('Welcome audio played'),{once:true});
  audio.addEventListener('ended',()=>track('Welcome audio completed'),{once:true});
}
})();