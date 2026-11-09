(() => {
  'use strict';
  const root = document.getElementById('anand-portfolio-reimagined');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width:820px)');
  const toggle = root.querySelector('.ap-motion-toggle');
  let paused = false;
  const scenes = [];
  const TAU = Math.PI * 2;
  const mix = (a,b,t) => a+(b-a)*t;
  // Shared geometry for the off-duty artwork; the welcome has its own particle renderer.
  function form(kind, u, v, time, pulse) {
    const a=u*TAU, band=v-.5;
    if (kind === 'lifting') return [0,0,0];
    if (kind === 'building') {
      const side=Math.min(5,Math.floor(v*6)), t=u*2-1, k=(v*6%1)*2-1;
      const s=.6, cube=[[t,k,1],[t,k,-1],[1,t,k],[-1,t,k],[k,1,t],[k,-1,t]][side];
      return cube.map((n,i)=>n*s+(pulse*.14*Math.sin(a+i)));
    }
    if (kind === 'listening') {
      const r=.28+v*.59, wave=Math.sin(a*5+time)*.035*(pulse+.3);
      return [Math.cos(a)*(r+wave),Math.sin(a)*(r+wave),Math.sin(a*2+time)*.08];
    }
    if (kind === 'conversations') {
      const side=v<.5?-1:1, b=(v*2%1)-.5, r=.35+b*.16;
      return [side*(.36-pulse*.08)+Math.cos(a)*(r+pulse*.035),Math.sin(a)*.55,Math.sin(a+side*time*.15)*.2+b*.12];
    }
    const r=.57+Math.cos(a*3+time*.1)*.11;
    return [Math.cos(a)*(r+band*.38*Math.cos(a*1.5)),Math.sin(a)*(r+band*.38*Math.cos(a*1.5)),Math.sin(a*1.5)*band*.6+Math.sin(a*2)*.18];
  }
  function createScene(canvas, kind) {
    const ctx=canvas.getContext('2d');
    if (!ctx) return;
    const host=canvas.parentElement;
    const scene={canvas,kind,visible:false,frame:0,last:0,time:0,pointer:[0,0],current:[],look:[0,0],pulse:0,start:0,active:false,settleUntil:0};
    let bands=compact.matches?18:26,samples=compact.matches?52:64;
    let width=0,height=0,dpr=1;
    function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;dpr=Math.min(devicePixelRatio||1,compact.matches?1.5:2);const nextBands=compact.matches?18:26,nextSamples=compact.matches?52:64;if(nextBands!==bands||nextSamples!==samples){bands=nextBands;samples=nextSamples;scene.current=[];}canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);render(0,true);}
    function render(stamp,still=false){
      if(!width||!height)return;
      const moving=!paused&&!reduced.matches&&!still;
      const dt=Math.min(Math.max((stamp-scene.last)/1000,0),.05);
      if(moving && (scene.kind!=='listening'||scene.active))scene.time+=dt*.65;
      const blend=1-Math.exp(-dt*9);
      for(let axis=0;axis<2;axis++)scene.look[axis]=mix(scene.look[axis],scene.pointer[axis],blend);
      if(scene.start){const p=Math.min((performance.now()-scene.start)/1900,1);scene.pulse=Math.sin(p*Math.PI);if(p===1)scene.start=0;}
      const dark=document.documentElement.dataset.theme==='dark';
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      const scale=Math.min(width,height)*.43, cx=width*.5,cy=height*.49;
      const rotation=(scene.kind==='lifting'?-.06:scene.kind==='building'?.6:.15)+scene.look[0]*.12;
      const tilt=(scene.kind==='lifting'?.05:.42)+scene.look[1]*.1;
      const project=(p)=>{const x=p[0]*Math.cos(rotation)+p[2]*Math.sin(rotation), z=-p[0]*Math.sin(rotation)+p[2]*Math.cos(rotation);const y=p[1]*Math.cos(tilt)-z*Math.sin(tilt);const depth=p[1]*Math.sin(tilt)+z*Math.cos(tilt);return [cx+x*scale,cy-y*scale,depth];};
      const lines=[];
      for(let j=0;j<bands;j++){
        const points=[];
        for(let i=0;i<=samples;i++){
          const idx=j*(samples+1)+i, target=form(scene.kind,i/samples,j/(bands-1),scene.time,scene.pulse+(scene.active?.45:0));
          let p=scene.current[idx];if(!p)p=scene.current[idx]=target.slice();
          const amount=still||reduced.matches?1:1-Math.exp(-dt*8);
          for(let k=0;k<3;k++)p[k]=mix(p[k],target[k],amount);
          points.push(project(p));
        }
        lines.push({points,j,z:points.reduce((a,p)=>a+p[2],0)/points.length});
      }
      lines.sort((a,b)=>a.z-b.z);
      for(const {points,j,z} of lines){
        const hue=mix(78,252,j/(bands-1)), light=dark?mix(64,83,j/(bands-1)):mix(39,62,j/(bands-1));
        ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
        const alpha=.32+(z+.8)*.21;
        ctx.strokeStyle=`hsla(${hue},${dark?36:25}%,${light}%,${alpha})`;
        ctx.lineWidth=scene.kind==='lifting'?1.7:1.1;
        ctx.stroke();
        if(j%5===0){ctx.strokeStyle=dark?'rgba(228,235,212,.14)':'rgba(255,255,255,.6)';ctx.lineWidth=.45;ctx.stroke();}
      }
      // Tiny highlights define the material without an image or heavy 3D dependency.
      if(scene.kind!=='lifting')for(let n=0;n<5;n++){const p=project(form(scene.kind,(n*.193+scene.time*.007)%1,.5,scene.time,0));ctx.beginPath();ctx.arc(p[0],p[1],1.6,0,TAU);ctx.fillStyle=dark?'#e2eace':'#7e8c71';ctx.fill();}
    }
    function tick(stamp){
      scene.frame=0;if(!scene.visible||document.hidden||paused||reduced.matches)return;
      render(stamp);scene.last=stamp;
      const settled=scene.look.every((value,i)=>Math.abs(value-scene.pointer[i])<.001);
      if(scene.kind==='listening'&&!scene.active&&!scene.start&&stamp>scene.settleUntil&&settled)return;
      scene.frame=requestAnimationFrame(tick);
    }
    scene.wake=()=>{if(paused||reduced.matches){render(0,true);return;}if(scene.visible&&!document.hidden&&!scene.frame){scene.last=performance.now();scene.frame=requestAnimationFrame(tick);}};
    scene.stop=()=>{cancelAnimationFrame(scene.frame);scene.frame=0;};
    scene.change=(next)=>{scene.kind=next;scene.start=0;scene.active=false;scene.settleUntil=performance.now()+800;scene.wake();};
    scene.act=()=>{scene.start=performance.now();if(scene.kind==='listening')scene.active=!scene.active;scene.wake();};
    host.addEventListener('pointermove',e=>{if(e.pointerType&&e.pointerType!=='mouse')return;const r=host.getBoundingClientRect();scene.pointer=[(e.clientX-r.left)/r.width-.5,(e.clientY-r.top)/r.height-.5];scene.wake();},{passive:true});
    host.addEventListener('pointerleave',()=>{scene.pointer=[0,0];scene.wake();});
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(entries=>{scene.visible=entries[0].isIntersecting;if(scene.visible)scene.wake();else scene.stop();},{threshold:.05}).observe(canvas);
    scenes.push(scene);return scene;
  }
  root.querySelectorAll('[data-atmosphere]').forEach(canvas=>{
    if(canvas.dataset.atmosphere==='hero')return;
    const scene=createScene(canvas,canvas.dataset.atmosphere);
    if(!scene)return;
    if(canvas.dataset.atmosphere==='lifting'){
      root.querySelectorAll('.ap-interest-button').forEach(button=>button.addEventListener('click',()=>scene.change(button.dataset.interest)));
      canvas.parentElement.addEventListener('click',()=>scene.act());
    }
  });
  const updateToggle=()=>{toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=paused?'Motion off':'Motion on';toggle.setAttribute('aria-label',paused?'Enable artwork motion':'Disable artwork motion');toggle.disabled=reduced.matches;if(reduced.matches)toggle.textContent='Reduced motion';document.dispatchEvent(new CustomEvent('portfolio:motionchange',{detail:{enabled:!paused&&!reduced.matches}}));};
  toggle.addEventListener('click',()=>{paused=!paused;updateToggle();scenes.forEach(scene=>paused?scene.stop():scene.wake());});
  reduced.addEventListener('change',()=>{updateToggle();scenes.forEach(scene=>{scene.stop();scene.wake();});});
  document.addEventListener('visibilitychange',()=>scenes.forEach(scene=>document.hidden?scene.stop():scene.wake()));
  new MutationObserver(()=>scenes.forEach(scene=>scene.wake())).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  document.addEventListener('portfolio:viewchange',()=>{for(const scene of scenes){scene.active=false;scene.start=0;}});
  updateToggle();
  root.dataset.atmosphereReady='true';
  // Career points reuse the real, keyboard-accessible company controls.
  const companies=Array.from(root.querySelectorAll('.ap-company-button'));
  companies.forEach((button,i)=>{button.style.setProperty('--node-index',i);button.style.setProperty('--node-height',[18,2,26,7,17][i]+'px');});
  const voice=document.getElementById('anand-voice');
  voice?.addEventListener('play',()=>root.classList.add('ap-voice-playing'));
  ['pause','ended'].forEach(event=>voice?.addEventListener(event,()=>root.classList.remove('ap-voice-playing')));
})();


