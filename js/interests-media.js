(() => {
  'use strict';
  const root = document.getElementById('anand-portfolio-reimagined');
  const object = root.querySelector('.ap-interest-object');
  const feedback = document.getElementById('ap-interest-feedback');
  const film = document.getElementById('ap-lifting-film');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const labels = { lifting: 'See Anand’s 180 kg deadlift video', building: 'Build a small idea', listening: 'Animate the sound waves', conversations: 'Start a conversation' };
  const hints = { lifting: 'A personal milestone. See the real lift below.', building: 'Tap the geometry to build something.', listening: 'Tap the waves to bring them to life. Tap again to pause.', conversations: 'Tap to keep the conversation going.' };

  let exchange = 0;
  let timer;
  const reset = () => {
    clearTimeout(timer);
    
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
    if (interest === 'lifting') { film.scrollIntoView({block:'start',behavior:reduced.matches?'auto':'smooth'}); return; }
    if (interest === 'listening') {
      const playing = object.classList.toggle('is-playing');
      object.setAttribute('aria-pressed', String(playing));
      object.setAttribute('aria-label', playing ? 'Pause the sound waves' : 'Animate the sound waves');
      feedback.textContent = playing ? 'A little music. A different perspective.' : 'Paused. Take a breath.';
      return;
    }
    if (object.classList.contains('is-acting')) return;
    object.classList.add('is-acting');

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
     clearTimeout(timer); object.classList.remove('is-acting');
    if (event.detail.view !== 'off-duty') {
      object.classList.remove('is-playing'); object.removeAttribute('aria-pressed');
      object.setAttribute('aria-label', labels[object.dataset.object]);
    }
  });
  reset();
})();

