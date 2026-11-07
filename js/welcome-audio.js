(() => {
'use strict';
const audio=document.getElementById('anand-voice');
const controls=document.getElementById('voice-controls');
if(!audio||!controls)return;
const play=controls.querySelector('.voice-play');
const seek=controls.querySelector('.voice-seek');
const mute=controls.querySelector('.voice-mute');
const status=document.getElementById('voice-status');
const elapsed=controls.querySelector('.voice-elapsed');
const duration=controls.querySelector('.voice-duration');
const time=(n)=>Number.isFinite(n)?Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0'):'0:00';
const sync=()=>{
 play.textContent=audio.paused?'▶':'Ⅱ';
 play.setAttribute('aria-label',audio.paused?'Play Anand’s welcome':'Pause Anand’s welcome');
 play.setAttribute('aria-pressed',String(!audio.paused));
 controls.classList.toggle('is-playing',!audio.paused && !audio.ended);
 const progress=Number.isFinite(audio.duration)?audio.currentTime/audio.duration:0;
 controls.querySelectorAll('.voice-bars span').forEach((bar,index)=>bar.classList.toggle('is-heard',index/48<progress));
 elapsed.textContent=time(audio.currentTime);
 if(Number.isFinite(audio.duration)){
 duration.textContent=time(audio.duration);
 seek.value=String(audio.currentTime/audio.duration*100);
 seek.disabled=false;
 seek.setAttribute('aria-valuetext',time(audio.currentTime)+' of '+time(audio.duration));
 }
};
audio.controls=false; audio.hidden=true; controls.hidden=false;
audio.addEventListener('contextmenu',(event)=>event.preventDefault());
play.addEventListener('click',async()=>{
 if(audio.paused){try{status.textContent='';await audio.play();}catch{status.textContent='Playback could not start. Please try again.';}}
 else audio.pause();
 sync();
});
seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(seek.value)/100*audio.duration;sync();});
mute.addEventListener('click',()=>{audio.muted=!audio.muted;mute.textContent=audio.muted?'Sound':'Mute';mute.setAttribute('aria-label',audio.muted?'Unmute welcome audio':'Mute welcome audio');mute.setAttribute('aria-pressed',String(audio.muted));});
['play','pause','ended','timeupdate','loadedmetadata'].forEach(name=>audio.addEventListener(name,sync));
audio.addEventListener('error',()=>{status.textContent='The recording could not load. You can still read the text below.';sync();});
sync();
})();