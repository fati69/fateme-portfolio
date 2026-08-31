(function () {
  'use strict';

  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const ready = () => document.body.classList.add('is-ready');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || typeof gsap === 'undefined') {
    ready();
    return;
  }

  const introBits = document.querySelectorAll('.ui-intro .ui-reveal');
  if (introBits.length) {
    gsap.from(introBits, {
      y: 24,
      opacity: 0,
      duration: 0.8,
      stagger: 0.07,
      ease: 'power3.out',
      delay: 0.08,
    });
  }

  gsap.from('.ui-live', {
    y: 28,
    opacity: 0,
    duration: 0.9,
    delay: 0.28,
    ease: 'power3.out',
  });

  ready();
})();
