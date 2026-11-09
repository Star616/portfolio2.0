(() => {
  'use strict';
  const root=document.getElementById('anand-portfolio-reimagined');
  const work=document.getElementById('work');
  const stories=work?.querySelector('.cj-stories');
  if(!root||!stories)return;
  const chapters=[...stories.querySelectorAll('.cj-chapter')];
  const links=[...work.querySelectorAll('[data-career-jump]')];
  const rail=stories.querySelector('.cj-rail');
  const base=rail.querySelector('.cj-path-base');
  const progress=rail.querySelector('.cj-path-progress');
  const cursor=rail.querySelector('.cj-path-cursor');
  const nodes=rail.querySelector('.cj-path-nodes');
  const currentLabel=work.querySelector('.cj-position-current');
  const totalLabel=work.querySelector('.cj-position-total');
  if(totalLabel)totalLabel.textContent=String(chapters.length).padStart(2,'0');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let enabled=true,frame=0,length=0,positions=[],selected=-1;
  const entrances=new Set();
  const clamp=n=>Math.max(0,Math.min(1,n));
  const canMove=()=>enabled&&!reduced.matches;
  function select(index){
    if(index===selected)return;
    selected=index;
    chapters.forEach((chapter,i)=>chapter.classList.toggle('is-current',i===index));
    links.forEach((link,i)=>{if(i===index)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
    [...nodes.children].forEach((node,i)=>node.classList.toggle('is-current',i===index));
    currentLabel.textContent=String(chapters[index].dataset.chapter).padStart(2,'0');
  }
  function update(){
    frame=0;if(work.hidden||!positions.length)return;
    const focus=Math.min(innerHeight*.38,310);
    const rect=stories.getBoundingClientRect();
    let index=0,score=Infinity;
    chapters.forEach((chapter,i)=>{
      const r=chapter.getBoundingClientRect();
      const distance=Math.abs(r.top+Math.min(r.height*.28,135)-focus);
      if(distance<score){score=distance;index=i;}
    });
    select(index);
    const amount=canMove()?clamp((focus-rect.top-8)/Math.max(1,rect.height-30)):1;
    progress.style.strokeDashoffset=String(1-amount);
    if(length){const point=base.getPointAtLength(length*amount);cursor.setAttribute('cx',point.x);cursor.setAttribute('cy',point.y);}
  }
  function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update);}
  function rebuild(){
    if(work.hidden||!stories.getBoundingClientRect().width)return;
    const rect=stories.getBoundingClientRect();
    const xs=[27,70,18,65,30,61];
    positions=chapters.map((chapter,i)=>{
      const company=chapter.querySelector('.cj-company');
      // Use layout positions so an entrance transform never displaces a marker.
      return {x:xs[i%xs.length],y:chapter.offsetTop+company.offsetTop+company.offsetHeight/2};
    });
    const points=[{x:44,y:8},...positions,{x:44,y:rect.height-22}];
    let path='M'+points[0].x+' '+points[0].y;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],middle=(a.y+b.y)/2;
      path+=' C'+a.x+' '+middle+' '+b.x+' '+middle+' '+b.x+' '+b.y;
    }
    rail.setAttribute('viewBox','0 0 88 '+rect.height);
    base.setAttribute('d',path);progress.setAttribute('d',path);
    const markers=positions.map((position,i)=>{
      const node=document.createElementNS('http://www.w3.org/2000/svg','circle');
      node.setAttribute('cx',position.x);node.setAttribute('cy',position.y);node.setAttribute('r','5');
      node.setAttribute('class','cj-path-node'+(i===selected?' is-current':''));return node;
    });
    nodes.replaceChildren(...markers);length=base.getTotalLength();update();
  }
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    reveal.unobserve(entry.target);
    if(!canMove()||typeof entry.target.animate!=='function')return;
    const animation=entry.target.animate([{opacity:.45,transform:'translateY('+ (innerWidth<=820?8:18) +'px)'},{opacity:1,transform:'translateY(0)'}],{duration:innerWidth<=820?400:650,easing:'cubic-bezier(.16,1,.3,1)'});
    entrances.add(animation);animation.onfinish=()=>entrances.delete(animation);
  }),{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  chapters.forEach(chapter=>reveal.observe(chapter));
  links.forEach(link=>link.addEventListener('click',event=>{
    const chapter=chapters.find(item=>item.dataset.career===link.dataset.careerJump);
    if(!chapter)return;
    event.preventDefault();
    chapter.focus({preventScroll:true});
    chapter.scrollIntoView({block:'start',behavior:canMove()?'smooth':'auto'});
  }));
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  new ResizeObserver(rebuild).observe(stories);
  document.fonts?.ready.then(rebuild);
  document.addEventListener('portfolio:viewchange',()=>{if(!work.hidden)requestAnimationFrame(rebuild);});
  function motion(){
    root.dataset.careerMotion=canMove()?'flowing':'still';
    if(!canMove()){entrances.forEach(animation=>animation.cancel());entrances.clear();}
    schedule();
  }
  document.addEventListener('portfolio:motionchange',event=>{enabled=event.detail.enabled;motion();});
  reduced.addEventListener('change',motion);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
  motion();rebuild();
})();

