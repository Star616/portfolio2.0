(() => {
  'use strict';
  const root=document.getElementById('anand-portfolio-reimagined');
  const scene=root?.querySelector('.ap-scene');
  if(!root||!scene)return;
  const kicker=scene.querySelector('.ap-scene-kicker');
  const headline=scene.querySelector('.ap-scene-title');
  const description=scene.querySelector('.ap-scene-description');
  const art=scene.querySelector('.ap-scene-art');
  const canvas=scene.querySelector('canvas');
  const surface=root.querySelector('.ap-switch-surface');
  const ctx=canvas.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const compact=matchMedia('(max-width:560px)');
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  const content={
    work:['PEOPLE. TECHNOLOGY. POSSIBILITY.','A career.','Many conversations.','Different markets. Different challenges. The same starting point: understand people.'],
    notes:['CURIOSITY, IN PROGRESS.','Things I’m learning.','Along the way.','From customer conversations to ideas brought to life.'],
    'off-duty':['BEYOND THE JOB TITLE.','Curiosity doesn’t','clock out.','A few things that keep me grounded, challenged, and curious.']
  };
  const tones={work:[.8,.15,.05],notes:[.12,.82,.06],'off-duty':[.12,.12,.76]};
  const mix=(a,b,t)=>a+(b-a)*t;
  const ease=t=>1-Math.pow(1-t,3);
  const animations=new Set();
  let enabled=root.querySelector('.ap-motion-toggle')?.getAttribute('aria-pressed')!=='true';
  let view=content[root.dataset.view]?root.dataset.view:'work';
  let width=0,height=0,dpr=1,visible=false,frame=0,start=0,pending=false,last=0;
  let points=[],from=[],target=[],weights=tones[view].slice(),fromWeights=weights.slice(),targetWeights=weights.slice();
  let pointer=[0,0],look=[0,0],sprites=[];
  const moving=()=>enabled&&!reduced.matches;
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  function cancelEntrances(){animations.forEach(a=>a.cancel());animations.clear();}
  function animate(element,keys,options){
    if(!moving()||!element?.animate)return;
    const animation=element.animate(keys,options);
    animations.add(animation);
    animation.onfinish=animation.oncancel=()=>animations.delete(animation);
  }
  function form(kind,count){
    return Array.from({length:count},(_,i)=>{
      const u=i/(count-1);
      if(kind==='work'){const t=u*Math.PI*6;return [Math.sin(t)*.52,(u-.5)*1.55,Math.cos(t)*.5];}
      if(kind==='notes'){
        const group=i%3,t=Math.floor(i/3)/(count/3-1)*Math.PI*2;
        return [Math.cos(t)*(.66+group*.065),Math.sin(t)*(.25+group*.08)+Math.cos(t)*.08,Math.sin(t+group*.3)*.52];
      }
      const cols=count/3,row=Math.floor(i/cols),col=(i%cols)/(cols-1),t=col*Math.PI*2+row*.5;
      return [(col-.5)*1.95,Math.sin(t)*.27+(row-1)*.115,Math.cos(t)*.48];
    });
  }
  function makeSprites(){
    if(!ctx)return;
    const dark=document.documentElement.dataset.theme==='dark';
    const colours=dark?['#c3e49c','#c9aaff','#88e5c5']:['#7f9e5b','#9c7cbd','#48a28a'];
    sprites=colours.map(colour=>{
      const sprite=document.createElement('canvas');sprite.width=sprite.height=64;
      const paint=sprite.getContext('2d');
      if(!paint)return null;
      const shade=paint.createRadialGradient(36,44,0,36,44,24);
      shade.addColorStop(0,dark?'#00000055':'#52604735');shade.addColorStop(1,'#00000000');
      paint.fillStyle=shade;paint.fillRect(0,20,64,44);
      const gloss=paint.createRadialGradient(24,21,1,32,30,20);
      gloss.addColorStop(0,'#ffffff');gloss.addColorStop(.16,dark?'#f5ffea': '#f8fff0');
      gloss.addColorStop(.38,colour);gloss.addColorStop(.73,colour);gloss.addColorStop(1,dark?'#3f5140':'#51624b');
      paint.fillStyle=gloss;paint.beginPath();paint.arc(31,29,18,0,Math.PI*2);paint.fill();
      return sprite;
    });
  }
  function finish(){
    points=target.map(p=>p.slice());weights=targetWeights.slice();pending=false;start=0;
  }
  function draw(){
    if(!ctx||!width||!height)return;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    const scale=Math.min(width*.45,height*.47),cx=width*.5,cy=height*.45;
    const dark=document.documentElement.dataset.theme==='dark';
    ctx.save();ctx.translate(cx,height*.86);ctx.scale(view==='off-duty'?1.3:1,.13);
    const shadow=ctx.createRadialGradient(0,0,0,0,0,scale*.65);
    shadow.addColorStop(0,dark?'#00000060':'#52604724');shadow.addColorStop(1,'#00000000');
    ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,scale*.65,0,Math.PI*2);ctx.fill();ctx.restore();
    const yaw=-.17+look[0]*.16,tilt=.08+look[1]*.12;
    const projected=points.map(p=>{
      const x=p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),z=-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw);
      return {x:cx+x*scale,y:cy+(p[1]*Math.cos(tilt)-z*Math.sin(tilt))*scale,z};
    }).sort((a,b)=>a.z-b.z);
    projected.forEach(p=>{
      const size=(compact.matches?9:11)*(1+p.z*.4),alpha=.62+(p.z+.6)*.24;
      weights.forEach((weight,i)=>{
        if(!sprites[i]||weight<.015)return;
        ctx.globalAlpha=Math.min(1,alpha)*weight;
        ctx.drawImage(sprites[i],p.x-size/2,p.y-size/2,size,size);
      });
    });
    ctx.globalAlpha=1;
  }
  function tick(now){
    frame=0;if(!visible||document.hidden||!moving())return;
    const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;
    if(pending){
      if(!start)start=now;
      const t=Math.min(1,(now-start)/(compact.matches?650:850)),amount=ease(t);
      points=target.map((p,i)=>p.map((n,j)=>mix(from[i][j],n,amount)));
      weights=targetWeights.map((n,i)=>mix(fromWeights[i],n,amount));
      if(t===1)finish();
    }
    const blend=1-Math.exp(-dt*11);
    look=look.map((n,i)=>mix(n,pointer[i],blend));draw();
    if(pending||look.some((n,i)=>Math.abs(n-pointer[i])>.001))frame=requestAnimationFrame(tick);
  }
  function wake(){
    if(!moving()){finish();look=[0,0];draw();return;}
    if(visible&&!document.hidden&&!frame)frame=requestAnimationFrame(tick);
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
    if(!width||!height)return;
    dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    const count=compact.matches?54:81;
    if(points.length!==count){target=form(view,count);targetWeights=tones[view].slice();finish();}
    draw();wake();
  }
  function show(next,shouldAnimate){
    if(!content[next])return;
    const previous=view;view=next;const words=content[view];
    cancelEntrances();
    kicker.textContent=words[0];
    const muted=document.createElement('span');muted.textContent=words[2];
    headline.replaceChildren(document.createTextNode(words[1]),document.createElement('br'),muted);
    description.textContent=words[3];
    target=form(view,compact.matches?54:81);targetWeights=tones[view].slice();
    if(shouldAnimate&&moving()&&points.length===target.length){
      from=points.map(p=>p.slice());fromWeights=weights.slice();start=0;pending=true;
      const direction=['work','notes','off-duty'].indexOf(view)>['work','notes','off-duty'].indexOf(previous)?1:-1;
      animate(headline,[{opacity:.3,transform:'translateX('+direction*10+'px)'},{opacity:1,transform:'translateX(0)'}],{duration:430,easing:'cubic-bezier(.2,.8,.2,1)'});
      animate(description,[{opacity:.35,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,delay:45,easing:'cubic-bezier(.2,.8,.2,1)'});
      animate(surface,[{transform:'scaleX(1)'},{transform:'scaleX(1.09)',offset:.3},{transform:'scaleX(1)'}],{duration:600,easing:'cubic-bezier(.2,.8,.2,1)'});
    }else finish();
    draw();wake();
  }
  function motion(){
    root.dataset.sectionMotion=moving()?'flowing':'still';
    if(!moving()){stop();cancelEntrances();pointer=[0,0];look=[0,0];finish();draw();}
    else wake();
  }
  scene.hidden=false;
  root.dataset.sectionEnhanced='true';
  const overviewTitle=root.querySelector('.cj-overview-title');
  if(overviewTitle){overviewTitle.hidden=false;root.querySelector('.cj-overview')?.setAttribute('aria-labelledby',overviewTitle.id);}
  show(view,false);makeSprites();resize();motion();
  document.addEventListener('portfolio:viewchange',event=>show(event.detail.view,event.detail.animate===true));
  document.addEventListener('portfolio:motionchange',event=>{enabled=event.detail.enabled;motion();});
  reduced.addEventListener('change',motion);
  art.addEventListener('pointermove',event=>{
    if(!finePointer.matches||!moving())return;
    const rect=art.getBoundingClientRect();
    pointer=[(event.clientX-rect.left)/rect.width-.5,(event.clientY-rect.top)/rect.height-.5];wake();
  },{passive:true});
  art.addEventListener('pointerleave',()=>{pointer=[0,0];wake();});
  new ResizeObserver(resize).observe(art);
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible)wake();
    else{stop();if(pending){from=points.map(p=>p.slice());fromWeights=weights.slice();start=0;}}
  },{threshold:.05}).observe(art);
  new MutationObserver(()=>{makeSprites();draw();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else wake();});
  // Direct section links include the shared heading; career and contact links retain their own targets.
  const initialHash=location.hash.slice(1);
  if(content[initialHash]){
    let interacted=false;
    const markInteraction=()=>{interacted=true;};
    ['wheel','touchstart','pointerdown','keydown'].forEach(name=>window.addEventListener(name,markInteraction,{once:true,passive:true}));
    const align=()=>{if(!interacted&&location.hash.slice(1)===initialHash)scene.scrollIntoView({block:'start',behavior:'instant'});};
    if(document.readyState==='complete')requestAnimationFrame(align);
    else window.addEventListener('load',align,{once:true});
  }
})();
