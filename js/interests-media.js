(() => {
  'use strict';
  const root = document.getElementById('anand-portfolio-reimagined');
  const object = root.querySelector('.ap-interest-object');
  const feedback = document.getElementById('ap-interest-feedback');
  const film = document.getElementById('ap-lifting-film');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const labels = { lifting: 'Lift the barbell', building: 'Build a small idea', listening: 'Spin the record', conversations: 'Start a conversation' };
  const hints = { lifting: 'Tap the barbell for a rep.', building: 'Tap the brackets to build something.', listening: 'Tap the record to spin it. Tap again to pause.', conversations: 'Tap to keep the conversation going.' };
  let reps = 0;
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
    if (interest === 'listening') {
      const playing = object.classList.toggle('is-playing');
      object.setAttribute('aria-pressed', String(playing));
      object.setAttribute('aria-label', playing ? 'Pause the record' : 'Spin the record');
      feedback.textContent = playing ? 'A little music. A different perspective.' : 'Paused. Take a breath.';
      return;
    }
    if (object.classList.contains('is-acting')) return;
    object.classList.add('is-acting');
    if (interest === 'lifting') feedback.textContent = (++reps) + (reps === 1 ? ' rep. One step forward.' : ' reps. Keep showing up.');
    if (interest === 'building') {
      object.querySelector('.ap-object-code').textContent = '{ idea }';
      feedback.textContent = 'An idea → a few lines → something that works.';
    }
    if (interest === 'conversations') {
      const words = ['Hello.', 'Tell me more.', 'Good question.', 'Let’s talk.'];
      object.querySelector('.ap-object-conversation').textContent = words[exchange++ % words.length];
      feedback.textContent = 'Good conversations start with curiosity.';
    }
    timer = setTimeout(() => object.classList.remove('is-acting'), reduced.matches ? 0 : 850);
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
    if (event.detail.view !== 'off-duty') {
      object.classList.remove('is-playing'); object.removeAttribute('aria-pressed');
      object.setAttribute('aria-label', labels[object.dataset.object]);
    }
  });
  reset();
})();
