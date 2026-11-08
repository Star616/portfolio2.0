(() => {
  'use strict';
  const root = document.getElementById('anand-portfolio-reimagined');
  const object = root.querySelector('.ap-interest-object');
  const feedback = document.getElementById('ap-interest-feedback');
  const film = document.getElementById('ap-lifting-film');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const labels = { lifting: 'Perform a deadlift', building: 'Build a small idea', listening: 'Animate the sound waves', conversations: 'Start a conversation' };
  const hints = { lifting: 'Tap the lifter to perform a deadlift.', building: 'Tap the geometry to build something.', listening: 'Tap the waves to bring them to life. Tap again to pause.', conversations: 'Tap to keep the conversation going.' };

  const figure = object.querySelector('.ap-lifter');
  let frame;
  const start = { hip:[127,133], knee:[160,172], rear:[146,174], shoulder:[174,98], neck:[182,84], head:[186,72], elbow:[176,144], hand:[170,189] };
  const finish = { hip:[138,126], knee:[142,169], rear:[128,170], shoulder:[141,61], neck:[141,47], head:[141,34], elbow:[156,104], hand:[170,146] };
  const drawPose = (amount) => {
    const pose = {};
    for (const key of Object.keys(start)) pose[key] = start[key].map((n,i) => n + (finish[key][i]-n)*amount);
    const path = (name, points) => figure.querySelector('[data-limb="'+name+'"]').setAttribute('d', points.map((point,i)=>(i?'L':'M')+point.join(' ')).join(' '));
    path('rear-leg',[pose.hip,pose.rear,[125,211]]);
    path('leg',[pose.hip,pose.knee,[140,211]]);
    path('torso',[pose.hip,pose.shoulder]);
    path('neck',[pose.shoulder,pose.neck]);
    path('arm',[pose.shoulder,pose.elbow,pose.hand]);
    figure.querySelector('[data-limb="head"]').setAttribute('cx',pose.head[0]);
    figure.querySelector('[data-limb="head"]').setAttribute('cy',pose.head[1]);
    figure.querySelector('[data-limb="weight"]').setAttribute('transform','translate('+pose.hand.join(' ')+')');
  };
  const lift = () => {
    cancelAnimationFrame(frame);
    if (reduced.matches) { drawPose(0); return; }
    const began = performance.now();
    const tick = (now) => {
      const t = Math.min((now-began)/1800,1);
      const phase = t<.45 ? t/.45 : t<.6 ? 1 : (1-t)/.4;
      drawPose(phase*phase*(3-2*phase));
      if(t<1) frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
  };

  let reps = 0;
  let exchange = 0;
  let timer;
  const reset = () => {
    clearTimeout(timer);
    cancelAnimationFrame(frame); drawPose(0);
    object.classList.remove('is-playing', 'is-acting');
    object.removeAttribute('aria-pressed');
    object.setAttribute('aria-label', labels[object.dataset.object]);
    object.querySelector('.ap-object-code').innerHTML = '&lt;<span>/</span>&gt;';
    object.querySelector('.ap-object-conversation').textContent = '“';
    feedback.textContent = hints[object.dataset.object];
    film.hidden = object.dataset.object !== 'lifting';
    if (film.hidden) unload(film);
  };
  const unload = (container) => container.querySelectorAll('[data-short-player]').forEach((player) => {
    player.querySelector('iframe')?.remove();
    player.querySelector('button').hidden = false;
  });
  root.querySelectorAll('.ap-interest-button').forEach((button) => button.addEventListener('click', reset));
  object.addEventListener('click', () => {
    const interest = object.dataset.object;
    if (interest === 'listening') {
      const playing = object.classList.toggle('is-playing');
      object.setAttribute('aria-pressed', String(playing));
      object.setAttribute('aria-label', playing ? 'Pause the sound waves' : 'Animate the sound waves');
      feedback.textContent = playing ? 'A little music. A different perspective.' : 'Paused. Take a breath.';
      return;
    }
    if (object.classList.contains('is-acting')) return;
    object.classList.add('is-acting');
    if (interest === 'lifting') {
      lift();
      feedback.textContent = (++reps) + (reps === 1 ? ' rep. One step forward.' : ' reps. Keep showing up.');
    }
    if (interest === 'building') {
      object.querySelector('.ap-object-code').textContent = '{ idea }';
      feedback.textContent = 'An idea → a few lines → something that works.';
    }
    if (interest === 'conversations') {
      const words = ['Hello.', 'Tell me more.', 'Good question.', 'Let’s talk.'];
      object.querySelector('.ap-object-conversation').textContent = words[exchange++ % words.length];
      feedback.textContent = 'Good conversations start with curiosity.';
    }
    timer = setTimeout(() => object.classList.remove('is-acting'), reduced.matches ? 0 : (interest === 'lifting' ? 1850 : 850));
  });
  root.querySelectorAll('[data-short-player]').forEach((player) => {
    player.querySelector('button').addEventListener('click', () => {
      // Only one player is mounted at a time; leaving a section stops its video.
      unload(root);
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/Yj_wckIYnjw';
      iframe.title = 'Anand’s 180 kg deadlift at Decathlon Navalur';
      iframe.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      player.querySelector('button').hidden = true;
      player.append(iframe);
    });
  });
  document.addEventListener('portfolio:viewchange', (event) => {
    unload(root);
    cancelAnimationFrame(frame); drawPose(0); clearTimeout(timer); object.classList.remove('is-acting');
    if (event.detail.view !== 'off-duty') {
      object.classList.remove('is-playing'); object.removeAttribute('aria-pressed');
      object.setAttribute('aria-label', labels[object.dataset.object]);
    }
  });
  reset();
})();

