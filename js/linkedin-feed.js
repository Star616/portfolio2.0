(() => {
  'use strict';
  const feed = document.getElementById('linkedin-feed');
  if (!feed) return;
  const curated = document.getElementById('linkedin-curated');
  const provider = document.getElementById('linkedin-provider');
  let configPromise;
  let providerMounted = false;

  const trustedEmbedUrl = (value, kind) => {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return null;
      if (kind === 'linkedin' && url.hostname === 'www.linkedin.com' && /^\/embed\/feed\/update\/urn:li:(activity|share|ugcPost):\d+$/.test(url.pathname)) return url.href;
      if (kind === 'provider' && url.hostname === 'widgets.sociablekit.com' && /^\/linkedin-profile-posts\/iframe\/\d+\/?$/.test(url.pathname)) return url.href;
    } catch { /* Invalid configuration keeps the curated links visible. */ }
    return null;
  };
  const readConfig = () => {
    if (!configPromise) {
      configPromise = fetch('data/linkedin-feed.json', { cache: 'no-cache' })
        .then((response) => {
          if (!response.ok) throw new Error('Feed configuration unavailable');
          return response.json();
        })
        .catch(() => null);
    }
    return configPromise;
  };
  const createFrame = (url, title, height) => {
    const frame = document.createElement('iframe');
    frame.src = url; frame.title = title; frame.width = '100%'; frame.height = String(height);
    frame.loading = 'lazy'; frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation');
    return frame;
  };
  const connectProvider = async () => {
    if (providerMounted) return;
    const config = await readConfig();
    const url = trustedEmbedUrl(config?.provider?.iframeUrl, 'provider');
    if (!url || providerMounted || document.getElementById('anand-portfolio-reimagined').dataset.view !== 'notes') return;
    providerMounted = true;
    const frame = createFrame(url, 'Anand’s LinkedIn profile posts', 1100);
    frame.className = 'ap-provider-frame';
    const recovery = document.createElement('button');
    recovery.type = 'button'; recovery.className = 'ap-feed-recovery';
    recovery.textContent = 'Show selected posts instead';
    const showCurated = () => {
      provider.hidden = true; curated.hidden = false; provider.replaceChildren();
      document.querySelector('#notes .ap-small-note').textContent = 'Selected from LinkedIn';
    };
    recovery.addEventListener('click', showCurated);
    frame.addEventListener('error', showCurated, { once: true });
    provider.replaceChildren(frame, recovery); provider.hidden = false; curated.hidden = true;
    document.querySelector('#notes .ap-small-note').textContent = 'From LinkedIn';
  };
  feed.querySelectorAll('.ap-embed-toggle').forEach((button) => {
    button.addEventListener('click', async () => {
      const slot = document.getElementById(button.getAttribute('aria-controls'));
      const expanded = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(expanded));
      button.firstChild.textContent = expanded ? 'Close post ' : 'Read here ';
      button.querySelector('span').textContent = expanded ? '−' : '+';
      slot.hidden = !expanded;
      if (!expanded || slot.childElementCount) return;
      const status = document.createElement('p');
      status.className = 'ap-embed-status'; status.setAttribute('role', 'status');
      status.textContent = 'Loading LinkedIn post…'; slot.append(status);
      const config = await readConfig();
      if (slot.hidden) { slot.replaceChildren(); return; }
      const post = config?.posts?.find((item) => item.id === button.closest('[data-post]').dataset.post);
      const url = trustedEmbedUrl(post?.embedUrl, 'linkedin');
      if (!url) { status.textContent = 'Use “Open on LinkedIn” to read the original post.'; return; }
      const frame = createFrame(url, post.title, 1120);
      frame.className = 'ap-linkedin-frame';
      frame.addEventListener('load', () => { status.hidden = true; }, { once: true });
      frame.addEventListener('error', () => {
        status.textContent = 'Use “Open on LinkedIn” to read the original post.'; frame.hidden = true;
      }, { once: true });
      slot.append(frame);
    });
  });
  document.addEventListener('portfolio:viewchange', (event) => {
    if (event.detail.view === 'notes') connectProvider();
    else {
      // Unload embedded media when another section is selected.
      feed.querySelectorAll('.ap-embed-toggle').forEach((button) => {
        button.setAttribute('aria-expanded', 'false');
        button.firstChild.textContent = 'Read here ';
        button.querySelector('span').textContent = '+';
        const slot = document.getElementById(button.getAttribute('aria-controls'));
        slot.hidden = true; slot.replaceChildren();
      });
      provider.replaceChildren(); provider.hidden = true;
      curated.hidden = false; providerMounted = false;
      document.querySelector('#notes .ap-small-note').textContent = 'Selected from LinkedIn';
    }
  });
  if (document.getElementById('anand-portfolio-reimagined').dataset.view === 'notes') connectProvider();
})();
