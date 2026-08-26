(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktopQuery = window.matchMedia('(min-width: 1024px)');

  const EASE = {
    editorial: 'power3.out',
    expo: 'expo.out',
    smooth: 'power2.inOut',
  };

  const REVEAL_SELECTORS = [
    '.reveal',
    '.reveal-heading',
    '.reveal-stagger > *',
    '.step',
    '.step-connector',
    '.contact__photo',
    '.hero__word',
  ].join(', ');

  /* ── Reveals: keep content visible even if animation JS fails ── */
  function showAllReveals() {
    document.querySelectorAll(REVEAL_SELECTORS).forEach((el) => {
      el.classList.add('is-visible');
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
    });

    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = el.dataset.count;
      const suffix = el.dataset.suffix || '';
      if (target) el.textContent = target + suffix;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showAllReveals);
  } else {
    showAllReveals();
  }

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    showAllReveals();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ── Smooth scroll (Lenis + ScrollTrigger) ── */
  const scrollRoot = document.body;
  let lenis;

  if (!prefersReducedMotion) {
    lenis = new Lenis({
      lerp: 0.2,
      smoothWheel: true,
    });

    ScrollTrigger.scrollerProxy(scrollRoot, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: scrollRoot.style.transform ? 'transform' : 'fixed',
    });

    lenis.on('scroll', ScrollTrigger.update);
    ScrollTrigger.addEventListener('refresh', () => lenis.resize());
    ScrollTrigger.defaults({ scroller: scrollRoot });

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Hero ── */
  function splitHeroWords() {
    document.querySelectorAll('.hero__title .name, .hero__title .role').forEach((line) => {
      const text = line.textContent.trim();
      const words = text.split(/\s+/);
      line.textContent = '';

      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.className = 'hero__word';
        span.textContent = word;
        span.style.display = 'inline-block';
        line.appendChild(span);
        if (i < words.length - 1) line.appendChild(document.createTextNode(' '));
      });
    });
  }

  function initHeroEntrance() {
    if (prefersReducedMotion) return;

    splitHeroWords();

    const words = gsap.utils.toArray('.hero__word');
    const tagline = document.querySelector('.hero__tagline');
    const scrollRow = document.querySelector('.hero__scroll-row');
    const portraitWrap = document.querySelector('.hero__portrait-wrap');
    const sparkle = document.querySelector('.hero__sparkle');
    const label = document.querySelector('.hero__label');
    const tl = gsap.timeline({ defaults: { ease: EASE.editorial } });

    tl.from(words, {
      yPercent: 110,
      opacity: 0,
      filter: 'blur(10px)',
      duration: 0.85,
      stagger: 0.06,
    });

    if (tagline) {
      tl.from(tagline, { y: 24, opacity: 0, filter: 'blur(6px)', duration: 0.7 }, '-=0.45');
    }

    if (scrollRow) {
      tl.from(scrollRow, { x: -16, opacity: 0, duration: 0.6 }, '-=0.5');
    }

    if (portraitWrap) {
      tl.from(portraitWrap, { y: 40, opacity: 0, scale: 0.96, duration: 0.9 }, '-=0.7');
    }

    if (label) {
      tl.from(label, { y: 12, opacity: 0, duration: 0.55 }, '-=0.35');
    }

    if (sparkle) {
      gsap.to(sparkle, {
        y: -12,
        rotation: '+=8',
        duration: 3.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      gsap.to(sparkle, {
        x: 6,
        duration: 2.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 0.6,
      });
    }
  }

  function initHeroScroll() {
    const hero = document.querySelector('.hero');
    const heroInner = document.querySelector('.hero__inner');
    const portraitWrap = document.querySelector('.hero__portrait-wrap');
    if (!hero || !heroInner || prefersReducedMotion) return;

    gsap.to(heroInner, {
      scale: 0.95,
      opacity: 0.55,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=350',
        scrub: true,
      },
    });

    if (portraitWrap) {
      gsap.to(portraitWrap, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }

  /* ── Sticky project deck ── */
  function initProjectCardHover(card, row, image) {
    if (prefersReducedMotion) return;

    const media = row.querySelector('.project-row__media') || card;
    let magneticTween;

    media.addEventListener('mouseenter', () => {
      card.classList.add('is-hover-lift');
      if (image) {
        gsap.to(image, { scale: 1.06, duration: 0.75, ease: EASE.editorial });
      }
      gsap.to(card, { y: -6, duration: 0.65, ease: EASE.editorial });
    });

    media.addEventListener('mouseleave', () => {
      card.classList.remove('is-hover-lift');
      if (magneticTween) magneticTween.kill();
      gsap.to(card, { x: 0, y: 0, duration: 0.75, ease: EASE.editorial });
      if (image) {
        gsap.to(image, { scale: 1, duration: 0.75, ease: EASE.editorial });
      }
    });

    if (!desktopQuery.matches) return;

    media.addEventListener('mousemove', (e) => {
      const rect = media.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      if (magneticTween) magneticTween.kill();
      magneticTween = gsap.to(card, {
        x: relX * 14,
        y: relY * 10 - 6,
        duration: 0.5,
        ease: EASE.smooth,
      });
    });
  }

  function initProjectDeck() {
    const rows = gsap.utils.toArray('.project-row');
    if (!rows.length) return;

    rows.forEach((row, index) => {
      const card = row.querySelector('.project-card');
      const imageWrap = row.querySelector('.project-card__image');
      const image = row.querySelector('.project-card__image img');
      if (!card || prefersReducedMotion) return;

      gsap.fromTo(
        card,
        { scale: 0.8 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: row,
            start: 'top bottom',
            end: '+=100%',
            scrub: true,
          },
        }
      );

      if (imageWrap && image) {
        gsap.fromTo(
          image,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: 'none',
            scrollTrigger: {
              trigger: row,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }

      if (desktopQuery.matches) {
        gsap.to(row, {
          yPercent: -100,
          ease: 'none',
          scrollTrigger: {
            trigger: row,
            start: 'bottom top',
            end: '+=100%',
            scrub: true,
          },
        });

        gsap.to(card, {
          scale: 0.8,
          ease: 'none',
          scrollTrigger: {
            trigger: row,
            start: 'bottom top',
            end: '+=100%',
            scrub: true,
          },
        });
      } else if (index < 2) {
        gsap.to(card, {
          opacity: 0,
          scale: 0.6,
          ease: 'none',
          scrollTrigger: {
            trigger: row,
            start: 'center center',
            end: '+=100%',
            scrub: true,
          },
        });
      }

      initProjectCardHover(card, row, image);
    });
  }

  /* ── Scroll reveals (optional polish; content stays visible) ── */
  function initScrollReveals() {
    if (prefersReducedMotion) return;

    gsap.utils.toArray('.reveal-heading').forEach((el) => {
      gsap.fromTo(
        el,
        { y: 32, opacity: 0.001, filter: 'blur(8px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.85,
          ease: EASE.editorial,
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    gsap.utils.toArray('.reveal-stagger').forEach((container) => {
      const children = container.children;
      if (!children.length) return;

      gsap.fromTo(
        children,
        { y: 24, opacity: 0.001, filter: 'blur(4px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.7,
          stagger: 0.08,
          ease: EASE.editorial,
          immediateRender: false,
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.fromTo(
        el,
        { y: 28, opacity: 0.001, filter: 'blur(6px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: EASE.editorial,
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }

  /* ── Impact metrics ── */
  function initMetricsCountUp() {
    const values = gsap.utils.toArray('.metric__value[data-count]');
    if (!values.length) return;

    if (prefersReducedMotion) {
      values.forEach((el) => {
        el.textContent = el.dataset.count + (el.dataset.suffix || '');
      });
      return;
    }

    values.forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const counter = { val: 0 };

      el.textContent = '0' + suffix;

      gsap.to(counter, {
        val: target,
        duration: 1.4,
        ease: EASE.expo,
        scrollTrigger: {
          trigger: el.closest('.metric') || el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        onUpdate() {
          el.textContent = Math.round(counter.val) + suffix;
        },
      });
    });
  }

  /* ── Philosophy ── */
  function initPhilosophySteps() {
    const steps = gsap.utils.toArray('.step');
    if (!steps.length || prefersReducedMotion) return;

    steps.forEach((step, i) => {
      const fromLeft = i % 2 === 0;
      gsap.fromTo(
        step,
        { x: fromLeft ? -48 : 48, opacity: 0.001, filter: 'blur(6px)' },
        {
          x: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: EASE.editorial,
          immediateRender: false,
          scrollTrigger: {
            trigger: step,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    gsap.utils.toArray('.step-connector').forEach((connector) => {
      gsap.fromTo(
        connector,
        { scaleY: 0, opacity: 0.001 },
        {
          scaleY: 1,
          opacity: 1,
          duration: 0.6,
          ease: EASE.editorial,
          immediateRender: false,
          scrollTrigger: {
            trigger: connector,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }

  /* ── Contact ── */
  function initContact() {
    const photo = document.querySelector('.contact__photo');
    if (!photo || prefersReducedMotion) return;

    gsap.fromTo(
      photo,
      { scale: 0.92, opacity: 0.001, filter: 'blur(8px)' },
      {
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.9,
        ease: EASE.editorial,
        immediateRender: false,
        scrollTrigger: {
          trigger: photo,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  /* ── Nav ── */
  function initNav() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;

    ScrollTrigger.create({
      start: 'top -40',
      onUpdate: (self) => {
        nav.classList.toggle('is-scrolled', self.scroll() > 40);
      },
    });
  }

  /* ── Init ── */
  function init() {
    try {
      showAllReveals();
      initHeroEntrance();
      initHeroScroll();
      initProjectDeck();
      initScrollReveals();
      initMetricsCountUp();
      initPhilosophySteps();
      initContact();
      initNav();
      ScrollTrigger.refresh();

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        showAllReveals();
      });
      setTimeout(showAllReveals, 300);
    } catch (err) {
      console.error('Animation init failed:', err);
      showAllReveals();
    }
  }

  window.addEventListener('load', init);

  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });
})();
