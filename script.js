// Animation system for the homepage. Everything below is gated behind a
// single guard: if the user prefers reduced motion, or the GSAP CDN failed
// to load, no tween or ScrollTrigger is ever created — .motion-disabled
// forces every animated element to its final, fully visible state instead.

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsapAvailable = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
const motionDisabled = prefersReducedMotion || !gsapAvailable;

// The floating header's real height shifts slightly once Google Fonts swap
// in, so --header-h (used by scroll-margin-top and the hero's top padding)
// is measured, not hardcoded.
function syncHeaderHeight() {
  const header = document.querySelector('.site-header');
  const height = header.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--header-h', `${height}px`);
}

syncHeaderHeight();
window.addEventListener('resize', syncHeaderHeight);

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    syncHeaderHeight();
    if (!motionDisabled) ScrollTrigger.refresh();
  });
}

if (motionDisabled) {
  document.documentElement.classList.add('motion-disabled');
} else {
  gsap.registerPlugin(ScrollTrigger);
  initHeroTimeline();
  initBlobDrift();
  initScrollReveals();
}

// ---- Hero entrance: headline, tagline, and button stagger in on load ----
// power2.out (no bounce) keeps this reading as considered, not playful —
// overlapping the three tweens keeps total entrance time to ~1.1s.
// Uses fromTo (not from): these elements are permanently opacity:0 in CSS
// (so they never flash visible before GSAP loads), and .from() would read
// that same opacity:0 as its "current/end" state, animating 0 -> 0 — a
// silent no-op. fromTo states both ends explicitly instead of trusting CSS.
function initHeroTimeline() {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  tl.fromTo('.kicker', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 })
    .fromTo('.hero-headline .line', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, '-=0.3')
    .fromTo('.hero-foot', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');
}

// ---- Blob drift: soft background color tied to scroll position ----
// Each blob gets its own scrub tween across the whole page's scroll range,
// so they drift continuously rather than looping — a background layer only,
// never touching text or interactive elements (pointer-events:none on the
// wrapper, z-index:-1 keeps them behind all content regardless of DOM order).
function initBlobDrift() {
  gsap.to('.blob--violet', {
    x: 140, y: 220, scale: 1.15,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 },
  });

  gsap.to('.blob--lime', {
    x: -160, y: -260, scale: 1.1,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 },
  });
}

// ---- Scroll-triggered reveals: a section-level fade-in, then a finer ----
// ---- stagger for the content inside it. ----
// All use fromTo for the same reason as the hero timeline above.
function initScrollReveals() {
  // Panel-level fade-ins — the "section transition" as the user scrolls
  // from one section into the next.
  gsap.utils.toArray('.services, .about-panel, .contact-inner').forEach((panel) => {
    gsap.fromTo(panel,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: panel, start: 'top 82%', toggleActions: 'play none none none' },
      }
    );
  });

  // Service cards — grid stagger, landing just after the panel fade above
  // for a "panel arrives, then its cards settle in" compound effect.
  gsap.fromTo('[data-reveal-item]',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.55,
      ease: 'power2.out',
      stagger: { each: 0.12, from: 'start' },
      scrollTrigger: { trigger: '.service-grid', start: 'top 80%', toggleActions: 'play none none none' },
    }
  );

  // About text cluster (eyebrow, lede, body)
  gsap.fromTo('.about-inner > *',
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.about-inner', start: 'top 80%', toggleActions: 'play none none none' },
    }
  );

  // About photo — a gentle settle (fade + scale down to 1) rather than a slide
  gsap.fromTo('.about-photo',
    { opacity: 0, scale: 1.06 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.about-panel', start: 'top 80%', toggleActions: 'play none none none' },
    }
  );

  // Contact — two staggered clusters: intro copy, then form fields.
  gsap.fromTo('.contact-intro > *',
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.contact-intro', start: 'top 85%', toggleActions: 'play none none none' },
    }
  );
  gsap.fromTo('.contact-form .field, .contact-form button',
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.contact-form', start: 'top 85%', toggleActions: 'play none none none' },
    }
  );

  // Footer is deliberately left un-animated — a copyright line has nothing
  // to gain from motion.
}

// Hover (cards, buttons, nav) is intentionally pure CSS — see .service-card:hover
// and .btn-primary:hover in style.css. No JS-driven hover here: it would either
// duplicate the CSS transform (double-animating the same property) or need its
// own reduced-motion bookkeeping that CSS transitions get for free.
