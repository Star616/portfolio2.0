(() => {
  'use strict';
  const root=document.getElementById('anand-portfolio-reimagined');
  if(!root)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const compact=matchMedia('(max-width:820px)');
  const nav=root.querySelector('.ap-chapter-control');
  const hero=root.querySelector('.ap-hero');
  const stage=root.querySelector('.ap-atmosphere-stage');
  const art=stage?.querySelector('canvas');
  const sentinel=document.createElement('span');
  sentinel.className='ap-nav-sentinel';sentinel.setAttribute('aria-hidden','true');
  nav.before(sentinel);
  let frame=0,enabled=true,heroVisible=true;
  const animations=new Set();
  const canMove=()=>enabled&&!reduced.matches;
  function finishEntrances(){animations.forEach(a=>a.cancel());animations.clear();}
  const reveal=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const el=entry.target;reveal.unobserve(el);
      if(!canMove()||typeof el.animate!=='function')return;
      const delay=el.classList.contains('ap-interest-story')?70:0;
      const animation=el.animate([
        {opacity:.3,transform:'translateY('+(compact.matches?8:18)+'px)'},
        {opacity:1,transform:'translateY(0)'}
      ],{duration:compact.matches?420:650,delay,easing:'cubic-bezier(.16,1,.3,1)'});
      animations.add(animation);animation.onfinish=()=>animations.delete(animation);
    });
  },{threshold:.08,rootMargin:'0px 0px -24px 0px'});
  root.querySelectorAll('.ap-film>div:first-child,.ap-section-top,.ap-section-intro,.ap-company-picker,.ap-career-detail,.ap-note,.ap-interest-object,.ap-interest-story,.discover-links,.ap-contact-row').forEach(el=>reveal.observe(el));
  // Passive scroll sampling. Only artwork moves; text and controls keep their positions.
  function update(){
    frame=0;
    const top=sentinel.getBoundingClientRect().top;
    nav.classList.toggle('is-docked',top<12);
    if(heroVisible&&hero&&stage&&art){
      const rect=hero.getBoundingClientRect();
      const progress=canMove()?Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height*.8))):0;
      stage.style.setProperty('--scroll-drift',(progress*(compact.matches?6:22)).toFixed(2)+'px');
      art.style.setProperty('--scroll-contract',(1-progress*(compact.matches?.035:.10)).toFixed(4));
    }
  }
  const schedule=()=>{if(!frame&&!document.hidden)frame=requestAnimationFrame(update);};
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  nav.addEventListener('click',event=>{
    const button=event.target.closest('.ap-view-button');
    if(!button)return;
    // Keep the shared scene beneath the dock when navigating by touch, mouse, or keyboard.
    const panel=document.getElementById(button.dataset.view);
    const destination=root.querySelector('.ap-scene:not([hidden])')||panel;
    if(panel&&!panel.hidden&&destination)destination.scrollIntoView({block:'start',behavior:canMove()?'smooth':'instant'});
  });
  document.addEventListener('portfolio:viewchange',schedule);
  document.addEventListener('portfolio:motionchange',event=>{
    enabled=event.detail.enabled;
    if(!enabled)finishEntrances();
    schedule();
  });
  reduced.addEventListener('change',()=>{finishEntrances();schedule();});
  compact.addEventListener('change',schedule);
  new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;schedule();}).observe(hero);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
  update();
})();

