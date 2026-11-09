(() => {
  try {
    const theme=localStorage.getItem('portfolio-theme');
    if(theme==='light'||theme==='dark'){
      document.documentElement.style.colorScheme=theme;
      document.documentElement.dataset.theme=theme;
    }
  } catch { /* The site remains usable without browser storage. */ }
})();
