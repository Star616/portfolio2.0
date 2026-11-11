(() => {
  'use strict';
  const audio=document.getElementById('anand-voice');
  const stage=document.querySelector('.ap-atmosphere-stage');
  const controls=document.getElementById('voice-controls');
  if(!audio||!stage||!controls)return;
  const start=controls.querySelector('.ribbon-start');
  const mute=controls.querySelector('.ribbon-mute');
  const pause=controls.querySelector('.ribbon-pause');
  const label=controls.querySelector('.ribbon-label');
  const progress=controls.querySelector('.ribbon-progress');
  const clock=controls.querySelector('.ribbon-time');
  const status=document.getElementById('voice-status');
  let context,source,analyser,bins,waveform,preparing;
  let starting=false;
  const time=n=>Number.isFinite(n)?Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0'):'0:00';
  // Analysis stays on-device and uses this recording only. No microphone is opened.
  const prepareAnalysis=()=>{
    if(preparing)return preparing;
    const Context=window.AudioContext||window.webkitAudioContext;
    if(!Context)return Promise.resolve();
    try{
      context ||= new Context();
      const resumed=context.state==='running'?Promise.resolve():context.resume();
      preparing=resumed.then(()=>{
        // Never reroute audible media into a suspended context.
        if(context.state!=='running'||source)return;
        analyser=context.createAnalyser();analyser.fftSize=512;analyser.smoothingTimeConstant=.78;
        bins=new Uint8Array(analyser.frequencyBinCount);
        waveform=new Uint8Array(analyser.fftSize);
        source=context.createMediaElementSource(audio);
        source.connect(analyser);analyser.connect(context.destination);
        stage.dataset.audioReactive='true';
      }).catch(()=>{}).finally(()=>{preparing=null;});
      return preparing;
    }catch{return Promise.resolve();}
  };
  window.anandVoiceVisual={sample(){
    if(!analyser||audio.paused||audio.ended||context.state!=='running')return [0,0,0,0];
    analyser.getByteFrequencyData(bins);
    const average=(from,to)=>{let sum=0;for(let i=from;i<to;i++)sum+=bins[i];return sum/(to-from)/255;};
    analyser.getByteTimeDomainData(waveform);
    let sum=0;for(const value of waveform){const n=(value-128)/128;sum+=n*n;}
    const loudness=Math.min(1,Math.sqrt(sum/waveform.length)*8);
    return [average(1,8),average(8,36),average(36,100),loudness];
  }};
  function sync(){
    const playing=!audio.paused&&!audio.ended;
    stage.dataset.audioState=audio.ended?'ended':playing?'playing':'ready';
    rootPlaying(playing);
    label.textContent=playing?(audio.muted?'ANAND’S WELCOME · MUTED':'ANAND’S WELCOME · PLAYING'):audio.ended?'THANK YOU FOR LISTENING':'A WELCOME FROM ANAND';
    start.hidden=playing;
    start.textContent=audio.ended?'Hear it again':audio.currentTime>0?'Resume welcome':'Hear my welcome';
    start.setAttribute('aria-label',audio.ended?'Replay Anand’s welcome':audio.currentTime>0?'Resume Anand’s welcome':'Play Anand’s welcome');
    if(pause)pause.hidden=!playing;
    clock.textContent=time(audio.currentTime)+' / '+(Number.isFinite(audio.duration)?time(audio.duration):'1:38');
    progress.style.setProperty('--progress',Number.isFinite(audio.duration)?(audio.currentTime/audio.duration*100)+'%':'0%');
    mute.textContent=audio.muted?'Sound off':'Sound on';
    mute.setAttribute('aria-label',audio.muted?'Unmute Anand’s welcome':'Mute Anand’s welcome');
    mute.setAttribute('aria-pressed',String(audio.muted));
  }
  function rootPlaying(playing){document.getElementById('anand-portfolio-reimagined').classList.toggle('ap-voice-playing',playing);}
  async function begin(gesture=false){
    if(starting||(!audio.paused&&!audio.ended))return;
    starting=true;status.textContent='';
    if(audio.ended)audio.currentTime=0;
    // Both calls begin within the deliberate tap, preserving browser activation.
    if(gesture)void prepareAnalysis();
    try{await audio.play();if(!gesture)void prepareAnalysis();}
    catch(error){
      if(error.name!=='NotAllowedError')status.textContent='The recording could not start. Tap the wave to try again.';
    }finally{starting=false;sync();}
  }
  audio.controls=false;audio.hidden=true;controls.hidden=false;start.hidden=false;
  audio.preload='metadata';
  audio.addEventListener('contextmenu',event=>event.preventDefault());
  start.addEventListener('click',()=>begin(true));
  pause?.addEventListener('click',()=>audio.pause());
  mute.addEventListener('click',()=>{audio.muted=!audio.muted;sync();});
  ['play','pause','ended','loadedmetadata','timeupdate','volumechange'].forEach(name=>audio.addEventListener(name,sync));
  audio.addEventListener('error',()=>{status.textContent='The recording could not load. Please try again later.';sync();});
  sync();
  // The welcome starts only after a deliberate tap.
})();

