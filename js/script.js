(() => {
  'use strict';
  const root = document.getElementById('anand-portfolio-reimagined');
  if (!root) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const select = (selector) => root.querySelector(selector);
  const setText = (selector, value) => { select(selector).textContent = value; };
  const animateIn = (element) => {
    if (reducedMotion.matches || typeof element.animate !== 'function') return;
    element.getAnimations().forEach((animation) => animation.cancel());
    element.animate(
      [{ transform: 'translateY(9px)', opacity: 0.6 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' }
    );
  };
  const careers = {
    servicenow: {
      number: '01', sector: 'ENTERPRISE\n& STRATEGIC', role: 'ServiceNow / Account management',
      title: 'Complex accounts.\nClear next steps.',
      copy: 'Enterprise and strategic account engagement across manufacturing. Territory planning, executive conversations, and progressing opportunities.',
      tags: ['Manufacturing', 'Account strategy', 'Executive engagement'],
      result: '$10M+ in qualified sales pipeline generated.'
    },
    niq: {
      number: '02', sector: 'INDIA\n& APAC', role: 'NielsenIQ / Retail & CPG',
      title: 'Start with insight.\nFind the opportunity.',
      copy: 'Prospecting and account development across India and APAC. Turning retail and consumer-goods market context into relevant customer conversations.',
      tags: ['Retail & CPG', 'Market insights', 'Pipeline creation'], result: ''
    },
    freshworks: {
      number: '03', sector: 'NORTH AMERICA\nSMB', role: 'Freshworks / North America, SMB',
      title: 'Better conversations.\nBetter customer experiences.',
      copy: 'Working with small and medium-sized businesses in North America, connecting customer priorities with SaaS solutions and progressing commercial conversations.',
      tags: ['SaaS', 'North America', 'SMB'], result: ''
    },
    blockchain: {
      number: '04', sector: 'AUSTRALIA\n& NEW ZEALAND', role: 'Blockchain App Factory / Business development',
      title: 'Emerging technology.\nReal business needs.',
      copy: 'Connecting clients and technical teams on blockchain-based products and services, with a focus on understanding requirements and building long-term relationships.',
      tags: ['Technology services', 'ANZ', 'Client relationships'], result: ''
    },
    skilllync: {
      number: '05', sector: 'INSIDE\nSALES', role: 'Skill-Lync / Inside sales',
      title: 'Learn the craft.\nEarn the conversation.',
      copy: 'The foundations: prospecting, cold calling, understanding a customer’s goals, negotiating, and converting interest into revenue.',
      tags: ['Prospecting', 'Discovery', 'Negotiation'], result: ''
    }
  };
  const interests = {
    lifting: { kicker: 'DISCIPLINE', title: 'A little stronger.\nEvery week.', copy: 'Training keeps me disciplined, motivated, and mentally sharp. There’s something satisfying about showing up and making steady progress.' },
    building: { kicker: 'CURIOSITY', title: 'An idea. A few lines.\nSomething that works.', copy: 'I enjoy learning to code, experimenting with ideas, and building things with my own hands. This portfolio is part of that curiosity.' },
    listening: { kicker: 'PERSPECTIVE', title: 'Press play.\nKeep an open mind.', copy: 'Music and long-form podcasts, including The Joe Rogan Experience, help me wind down, find new perspectives, and keep learning beyond work.' },
    conversations: { kicker: 'CONNECTION', title: 'A good conversation.\nTime well spent.', copy: 'Long conversations with close friends—exchanging ideas, catching up, and staying connected—are one of my favourite ways to spend time.' }
  };
  const setSelected = (buttons, selected) => buttons.forEach((button) => {
    button.setAttribute('aria-selected', String(button === selected));
    button.tabIndex = button === selected ? 0 : -1;
  });
  const viewButtons = Array.from(root.querySelectorAll('.ap-view-button'));
  const panels = Array.from(root.querySelectorAll('.ap-chapter'));
  const validViews = new Set(panels.map((panel) => panel.id));
  const legacyViews = { about: 'work', experience: 'work', focus: 'work', hobbies: 'off-duty' };
  const viewFromHash = () => {
    const hash = window.location.hash.slice(1);
    return validViews.has(hash) ? hash : (legacyViews[hash] || 'work');
  };
  const showView = (view, shouldAnimate = true) => {
    if (!validViews.has(view)) return;
    root.dataset.view = view;
    setSelected(viewButtons, viewButtons.find((button) => button.dataset.view === view));
    panels.forEach((panel) => { panel.hidden = panel.id !== view; });
    if (shouldAnimate) animateIn(document.getElementById(view));
    document.dispatchEvent(new CustomEvent('portfolio:viewchange', { detail: { view } }));
  };
  viewButtons.forEach((button) => button.addEventListener('click', () => {
    const view = button.dataset.view;
    if (root.dataset.view === view) return;
    showView(view);
    window.history.pushState(null, '', '#' + view);
  }));
  window.addEventListener('popstate', () => showView(viewFromHash(), false));
  window.addEventListener('hashchange', () => showView(viewFromHash(), false));
  showView(viewFromHash(), false);
  root.dataset.enhanced = 'true';
  const companyButtons = Array.from(root.querySelectorAll('.ap-company-button'));
  companyButtons.forEach((button) => button.addEventListener('click', () => {
    const career = careers[button.dataset.company];
    if (!career) return;
    setSelected(companyButtons, button);
    const detail = select('#ap-career-detail');
    detail.setAttribute('aria-labelledby', button.id);
    setText('.ap-career-number', career.number); setText('.ap-career-sector', career.sector);
    setText('.ap-career-role', career.role); setText('.ap-career-title', career.title);
    setText('.ap-career-copy', career.copy); setText('.ap-career-result', career.result);
    select('.ap-career-result').hidden = !career.result;
    const tags = career.tags.map((text) => {
      const span = document.createElement('span'); span.textContent = text; return span;
    });
    select('.ap-career-tags').replaceChildren(...tags); animateIn(detail);
  }));
  const interestButtons = Array.from(root.querySelectorAll('.ap-interest-button'));
  interestButtons.forEach((button) => button.addEventListener('click', () => {
    const interest = interests[button.dataset.interest];
    if (!interest) return;
    setSelected(interestButtons, button);
    const detail = select('#ap-interest-detail'); detail.setAttribute('aria-labelledby', button.id);
    select('.ap-interest-object').dataset.object = button.dataset.interest;
    setText('.ap-interest-kicker', interest.kicker); setText('.ap-interest-title', interest.title);
    setText('.ap-interest-copy', interest.copy); animateIn(detail);
  }));
  root.querySelectorAll('[role="tablist"]').forEach((group) => group.addEventListener('keydown', (event) => {
    const buttons = Array.from(group.querySelectorAll('[role="tab"]'));
    const index = buttons.indexOf(document.activeElement);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = buttons.length - 1;
    if (next !== undefined) {
      event.preventDefault(); buttons[next].focus(); buttons[next].click();
    }
  }));
  const portrait = select('.ap-portrait');
  portrait.addEventListener('click', () => {
    const flipped = portrait.getAttribute('aria-pressed') !== 'true';
    portrait.setAttribute('aria-pressed', String(flipped));
    portrait.setAttribute('aria-label', flipped ? 'Turn the card back to Anand’s portrait' : 'Turn Anand’s portrait over to read his introduction');
    select('.ap-photo-front').setAttribute('aria-hidden', String(flipped));
    select('.ap-photo-back').setAttribute('aria-hidden', String(!flipped));
  });
  const appearance = select('.ap-appearance');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let savedTheme;
  try { savedTheme = window.localStorage.getItem('portfolio-theme'); } catch { /* Optional storage. */ }
  const setTheme = (theme) => {
    document.documentElement.style.colorScheme = theme;
    document.documentElement.dataset.theme = theme;
    const dark = theme === 'dark';
    setText('.ap-appearance-label', dark ? 'Day' : 'Night');
    appearance.setAttribute('aria-label', 'Switch to ' + (dark ? 'day' : 'night') + ' appearance');
    appearance.setAttribute('aria-pressed', String(dark));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#171817' : '#f5f4f0';
  };
  setTheme(['light', 'dark'].includes(savedTheme) ? savedTheme : (systemTheme.matches ? 'dark' : 'light'));
  appearance.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(theme); savedTheme = theme;
    try { window.localStorage.setItem('portfolio-theme', theme); } catch { /* Session-only choice. */ }
  });
  systemTheme.addEventListener('change', (event) => {
    if (!['light', 'dark'].includes(savedTheme)) setTheme(event.matches ? 'dark' : 'light');
  });
})();

