// src/ga.ts
if (import.meta.env.MODE === 'production') {
  window.dataLayer = window.dataLayer || [];
  function gtag(...args) {
    (window.dataLayer).push(args);
  }
  gtag('js', new Date());
  gtag('config', 'G-SS8KN1QVJ8');
}
s