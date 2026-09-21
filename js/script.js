(() => {
  const body = document.body;
  const toggle = document.querySelector('.theme-toggle');
  const header = document.querySelector('.site-header');
  const year = document.querySelector('#year');
  let savedTheme;
  try {
    savedTheme = window.localStorage.getItem('portfolio-theme');
  } catch {
    // Theme controls still work when browser storage is unavailable.
  }
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  const setTheme = (theme) => {
    const isLight = theme === 'light';
    body.dataset.theme = theme;
    toggle?.setAttribute('aria-pressed', String(isLight));
    toggle?.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} theme`);
  };

  setTheme(savedTheme ?? (systemPrefersLight ? 'light' : 'dark'));

  toggle?.addEventListener('click', () => {
    const nextTheme = body.dataset.theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      window.localStorage.setItem('portfolio-theme', nextTheme);
    } catch {
      // Keep the selected theme for this page even without persistent storage.
    }
  });

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.reveal');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -28px' }
  );

  revealItems.forEach((item) => {
    observer.observe(item);
    item.classList.add('is-pending');
  });
})();
