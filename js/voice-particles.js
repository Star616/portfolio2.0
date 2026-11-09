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

  // Cache small shaded spheres once. Rendering stays light even with many beads.
  let materials=[],materialTheme;
  const colourText=rgb=>`rgb(${rgb.map(Math.round).join(',')})`;
  const blendColour=(a,b,t)=>a.map((value,i)=>mix(value,b[i],t));
  function createMaterials(dark){
    const sage=dark?[155,224,112]:[105,178,65];
    const mint=dark?[129,218,186]:[68,169,143];
    const lavender=dark?[197,155,255]:[155,112,222];
    const pearl=[250,252,239];
    materials=[];materialTheme=dark;
    for(let step=0;step<28;step++){
      const t=step/27,base=t<.4?blendColour(sage,mint,t/.4):blendColour(mint,lavender,(t-.4)/.6);
      const sprite=document.createElement('canvas');sprite.width=64;sprite.height=64;
      const surface=sprite.getContext('2d');
      if(!surface){materials.push(null);continue;}
      // All spheres share an upper-left light source and a lower-right shadow.
      const shade=surface.createRadialGradient(36,43,0,36,43,24);
      shade.addColorStop(0,dark?'rgba(0,0,0,.36)':'rgba(46,58,40,.23)');shade.addColorStop(1,'rgba(0,0,0,0)');
      surface.save();surface.translate(0,28);surface.scale(1,.38);surface.fillStyle=shade;surface.fillRect(8,15,54,60);surface.restore();
      const body=surface.createRadialGradient(24,22,1,32,32,22);
      body.addColorStop(0,colourText(blendColour(base,pearl,.72)));
      body.addColorStop(.22,colourText(blendColour(base,pearl,.22)));
      body.addColorStop(.52,colourText(base));
      body.addColorStop(.84,colourText(blendColour(base,[29,44,35],.3)));
      body.addColorStop(1,colourText(blendColour(base,[18,27,25],.55)));
      surface.beginPath();surface.arc(32,32,22,0,Math.PI*2);surface.fillStyle=body;surface.fill();
      const gleam=surface.createRadialGradient(25,23,0,25,23,9);
      gleam.addColorStop(0,'rgba(255,255,249,.98)');gleam.addColorStop(.27,'rgba(255,255,249,.7)');gleam.addColorStop(1,'rgba(255,255,249,0)');
      surface.beginPath();surface.arc(25,23,9,0,Math.PI*2);surface.fillStyle=gleam;surface.fill();
      // A restrained reflected edge gives the lower half a polished finish.
      surface.beginPath();surface.arc(32,32,20,.12*Math.PI,.72*Math.PI);surface.strokeStyle=colourText(blendColour(base,pearl,.48));surface.globalAlpha=.45;surface.lineWidth=1.4;surface.stroke();
      materials.push(sprite);
    }
  }

  function waveHeight(x,z,t,energy,fronts){
    const distance=Math.hypot(x*.85,z);
    let y=Math.sin(x*2.6+t*.35)*.11+Math.cos(z*3.1+t*.23)*.07;
    y+=energy*Math.sin(x*4-z*2-t*1.4)*.09;
    for(const front of fronts){
      const age=t-front.born, delta=distance-age*.72;
      y+=Math.cos(delta*11)*Math.exp(-delta*delta*13)*front.strength*.29*Math.exp(-age*.65);
    }
    return y;
  }
  function buildPoints(){
    const columns=phone.matches?37:57, rows=phone.matches?25:37;
    points=[];
    for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
      const u=col/(columns-1),v=row/(rows-1),x=(u-.5)*2.3,z=(v-.5)*1.7;
      const edge=clamp(1-Math.pow(x/1.24,2)-Math.pow(z/.99,2));
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
      colour=mix(colour,clamp(level*.85+timbre*level*1.1),1-Math.exp(-dt*2.4));
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
    if(materialTheme!==dark)createMaterials(dark);
    const yaw=.19+look[0]*.12, tilt=.86+look[1]*.10;
    const sy=Math.sin(yaw),cy=Math.cos(yaw),st=Math.sin(tilt),ct=Math.cos(tilt);
    const scale=Math.min(width,height)*.355;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    // A soft cast shadow anchors the floating surface without darkening the beads.
    ctx.save();ctx.translate(width*.51,height*.67);ctx.scale(1,.20);
    const shadow=ctx.createRadialGradient(0,0,0,0,0,width*.37);
    shadow.addColorStop(0,dark?'rgba(0,0,0,.32)':'rgba(45,59,41,.15)');
    shadow.addColorStop(.45,dark?'rgba(0,0,0,.14)':'rgba(45,59,41,.055)');
    shadow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=shadow;ctx.fillRect(-width*.5,-width*.5,width,width);ctx.restore();
    const glow=ctx.createRadialGradient(width*.49,height*.43,0,width*.49,height*.43,width*.43);
    glow.addColorStop(0,dark?'rgba(145,220,138,.09)':'rgba(145,210,128,.06)');
    glow.addColorStop(1,'rgba(145,210,128,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    const projected=[];
    for(const p of points){
      const x=p.x+Math.sin(p.seed*3.17)*.003,z=p.z+Math.cos(p.seed*1.91)*.003;
      const y=waveHeight(x,z,time,energy,fronts);
      const rx=x*cy+z*sy,rz=-x*sy+z*cy;
      const py=y*ct-rz*st,depth=y*st+rz*ct;
      const perspective=3.7/(3.7-depth*.4);
      const sx=width*.5+rx*scale*perspective,screenY=height*.45-py*scale*perspective;
      const crest=clamp((y+.12)*1.8);
      const shift=clamp(.10+p.u*.12+hueMix*(.48+p.u*.57));
      const alpha=clamp(.90+depth*.05+crest*.07)*p.edge;
      const radius=((phone.matches?1.35:1.45)+(depth+.7)*.48+crest*.32)*perspective;
      projected.push({x:sx,y:screenY,depth,alpha,radius,colour:Math.round(shift*(materials.length-1))});
    }
    // Draw back to front so the nearer spheres correctly overlap the distant ones.
    projected.sort((a,b)=>a.depth-b.depth);
    for(const p of projected){
      const sprite=materials[p.colour];
      if(!sprite)continue;
      const size=p.radius*64/22;
      ctx.globalAlpha=p.alpha;
      ctx.drawImage(sprite,p.x-size*.5,p.y-size*.5,size,size);
    }
    ctx.globalAlpha=1;
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
  host.dataset.visual='particle-wave';host.dataset.material='gloss';
})();
