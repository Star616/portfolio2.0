(() => {
  'use strict';
  const canvas=document.querySelector('[data-atmosphere="hero"]');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  if(!ctx)return;
  const host=canvas.parentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const phone=matchMedia('(max-width:820px)');
  const finePointer=matchMedia('(pointer:fine)');
  const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
  const mix=(a,b,t)=>a+(b-a)*t;
  let width=0,height=0,dpr=1,points=[];
  let frame=0,last=0,time=0,visible=false,enabled=true;
  let level=0,previousLevel=0,timbre=0,colour=0,lastPulse=-1;
  let pointer=[0,0],look=[0,0];
  const pulses=[];

  function waveHeight(x,z,t,energy,fronts){
    const distance=Math.hypot(x*.85,z);
    let y=Math.sin(x*2.6+t*.35)*.075+Math.cos(z*3.1+t*.23)*.045;
    y+=energy*Math.sin(x*4-z*2-t*1.4)*.065;
    for(const front of fronts){
      const age=t-front.born, delta=distance-age*.72;
      y+=Math.cos(delta*11)*Math.exp(-delta*delta*13)*front.strength*.24*Math.exp(-age*.65);
    }
    return y;
  }
  function buildPoints(){
    const columns=phone.matches?47:69, rows=phone.matches?31:45;
    points=[];
    for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
      const u=col/(columns-1),v=row/(rows-1),x=(u-.5)*2.3,z=(v-.5)*1.7;
      const edge=clamp(1-Math.pow(x/1.24,4)-Math.pow(z/.99,4));
      if(edge<.02)continue;
      points.push({x,z,edge:Math.sqrt(edge),seed:row*columns+col,u,v});
    }
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
    dpr=Math.min(devicePixelRatio||1,phone.matches?1.5:2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    buildPoints();render(0,true);
  }
  function render(stamp,still=false){
    if(!width||!height)return;
    const motion=enabled&&!reduced.matches&&!still;
    const dt=clamp((stamp-last)/1000,1/120,.05);
    if(motion){
      time+=dt;
      const sample=window.anandVoiceVisual?.sample()||[0,0,0,0];
      const bass=clamp(sample[0]),mid=clamp(sample[1]),high=clamp(sample[2]);
      const measured=clamp(sample[3]??(bass*.35+mid*.5+high*.15));
      // Fast response to a syllable, gentle release into the space between phrases.
      previousLevel=level;
      level=mix(level,measured,1-Math.exp(-dt*(measured>level?15:4)));
      const tone=clamp((mid*.55+high*1.4)/(bass+mid+high+.03));
      timbre=mix(timbre,tone,1-Math.exp(-dt*1.9));
      colour=mix(colour,clamp(level*.6+timbre*level),1-Math.exp(-dt*2.4));
      if(level>.10&&level-previousLevel>.012&&time-lastPulse>.18){
        pulses.push({born:time,strength:level});lastPulse=time;
        if(pulses.length>6)pulses.shift();
      }
      while(pulses.length&&time-pulses[0].born>3.6)pulses.shift();
      look=look.map((n,i)=>mix(n,pointer[i],1-Math.exp(-dt*5)));
    }
    const dark=document.documentElement.dataset.theme==='dark';
    const energy=enabled&&!reduced.matches?level:0;
    const fronts=enabled&&!reduced.matches?pulses:[];
    const hueMix=enabled&&!reduced.matches?colour:0;
    const sage=dark?[168,189,145]:[100,126,83];
    const lavender=dark?[190,180,219]:[134,119,162];
    const pearl=dark?[235,239,223]:[167,179,151];
    const yaw=.19+look[0]*.12, tilt=.86+look[1]*.10;
    const sy=Math.sin(yaw),cy=Math.cos(yaw),st=Math.sin(tilt),ct=Math.cos(tilt);
    const scale=Math.min(width,height)*.355;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    // Shallow light beneath the surface gives depth without a solid outline.
    const glow=ctx.createRadialGradient(width*.5,height*.47,0,width*.5,height*.47,width*.45);
    glow.addColorStop(0,dark?'rgba(155,177,130,.07)':'rgba(155,177,130,.055)');
    glow.addColorStop(1,'rgba(155,177,130,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    for(const p of points){
      const x=p.x+Math.sin(p.seed*3.17)*.003,z=p.z+Math.cos(p.seed*1.91)*.003;
      const y=waveHeight(x,z,time,energy,fronts);
      const rx=x*cy+z*sy,rz=-x*sy+z*cy;
      const py=y*ct-rz*st,depth=y*st+rz*ct;
      const perspective=3.7/(3.7-depth*.4);
      const sx=width*.5+rx*scale*perspective,screenY=height*.45-py*scale*perspective;
      const crest=clamp((y+.12)*1.8),shift=clamp(hueMix*(.45+p.u*.65));
      const highlight=clamp(crest*.22+energy*.12+(p.seed%97===0?.22:0));
      const rgb=sage.map((value,i)=>Math.round(mix(mix(value,lavender[i],shift),pearl[i],highlight)));
      const alpha=clamp((dark?.52:.55)+depth*.13+crest*.14)*p.edge;
      const radius=(phone.matches?.78:.69)+(depth+.7)*.27+crest*.16;
      ctx.beginPath();ctx.arc(sx,screenY,radius*perspective,0,Math.PI*2);
      ctx.fillStyle=`rgba(${rgb.join(',')},${alpha.toFixed(3)})`;ctx.fill();
      if(p.seed%97===0){ctx.beginPath();ctx.arc(sx,screenY,radius*2.6,0,Math.PI*2);ctx.fillStyle=`rgba(${rgb.join(',')},${(.07*p.edge).toFixed(3)})`;ctx.fill();}
    }
  }
  function tick(stamp){
    frame=0;if(!visible||document.hidden||!enabled||reduced.matches)return;
    if(stamp-last>=(phone.matches?30:15)){render(stamp);last=stamp;}
    frame=requestAnimationFrame(tick);
  }
  function wake(){
    if(visible&&!document.hidden&&enabled&&!reduced.matches&&!frame){last=performance.now();frame=requestAnimationFrame(tick);}
  }
  function stop(){cancelAnimationFrame(frame);frame=0;}
  host.addEventListener('pointermove',event=>{
    if(!finePointer.matches||event.pointerType!=='mouse')return;
    const rect=host.getBoundingClientRect();pointer=[clamp((event.clientX-rect.left)/rect.width)-.5,clamp((event.clientY-rect.top)/rect.height)-.5];
  },{passive:true});
  host.addEventListener('pointerleave',()=>{pointer=[0,0];});
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else stop();},{threshold:.03}).observe(canvas);
  document.addEventListener('portfolio:motionchange',event=>{
    enabled=event.detail.enabled;stop();
    if(enabled)wake();else render(0,true);
  });
  reduced.addEventListener('change',()=>{stop();render(0,true);wake();});
  phone.addEventListener('change',resize);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():wake());
  new MutationObserver(()=>render(0,true)).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  host.dataset.visual='particle-wave';
})();
