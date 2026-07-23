// Animation system for the homepage. Everything below is gated behind a
// single guard: if the user prefers reduced motion, or the GSAP CDN failed
// to load, no tween or ScrollTrigger is ever created — .motion-disabled
// forces every animated element to its final, fully visible state instead.

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsapAvailable = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
const motionDisabled = prefersReducedMotion || !gsapAvailable;

// The sticky header's real height shifts slightly once Google Fonts swap in,
// so --header-h (used by the full-height hero) is measured, not hardcoded.
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
  initAmbientDrift();
  initScrollReveals();
  initHoverEffects();
}

// ---- Hero entrance: headline, tagline, and button stagger in on load ----
// power2.out (no bounce) keeps this reading as considered, not playful —
// overlapping the three tweens keeps total entrance time to ~1.1s.
function initHeroTimeline() {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  tl.from('.kicker', { opacity: 0, y: 20, duration: 0.5 })
    .from('.hero-headline .line', { opacity: 0, y: 28, duration: 0.6, stagger: 0.12 }, '-=0.3')
    .from('.hero-foot', { opacity: 0, y: 20, duration: 0.5 }, '-=0.2');
}

// ---- Ambient hero shape drift: slow, continuous, never distracting ----
// Independent tweens (not one shared timeline) with staggered durations/delays
// so the shapes visibly desync rather than moving in lockstep. sine.inOut +
// yoyo avoids a jump-cut at the loop boundary — reads as "breathing".
function initAmbientDrift() {
  gsap.to('.hero-shape-1', {
    y: 18, x: 8, rotation: 6, duration: 7,
    ease: 'sine.inOut', repeat: -1, yoyo: true,
  });

  gsap.to('.hero-shape-3', {
    x: 16, y: -10, duration: 8.5, delay: 1.2,
    ease: 'sine.inOut', repeat: -1, yoyo: true,
  });

  // hero-shape-2 is display:none below 640px — scope its tween so it never
  // runs against a hidden element.
  gsap.matchMedia().add('(min-width: 641px)', () => {
    gsap.to('.hero-shape-2', {
      y: -14, rotation: -8, duration: 9, delay: 0.6,
      ease: 'sine.inOut', repeat: -1, yoyo: true,
    });
  });
}

// ---- Scroll-triggered reveals through the rest of the page ----
function initScrollReveals() {
  // Services — each row is its own trigger. Rows are spread down a tall
  // section, so a single parent-with-stagger would fire row 2/3 too early.
  gsap.utils.toArray('[data-reveal]').forEach((row) => {
    gsap.from(row, {
      opacity: 0,
      y: 24,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: { trigger: row, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });

  // About — a tight 3-child cluster (eyebrow, lede, body) under one container.
  gsap.from('.about-inner > *', {
    opacity: 0,
    y: 24,
    duration: 0.5,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.about-inner', start: 'top 80%', toggleActions: 'play none none none' },
  });

  // About's decorative shapes get subtle parallax instead of ambient drift —
  // decorative layer only, small delta, never applied to text.
  gsap.to('.about-shape-1', {
    yPercent: 10,
    ease: 'none',
    scrollTrigger: { trigger: '.about', scrub: true },
  });
  gsap.to('.about-shape-2', {
    yPercent: -8,
    ease: 'none',
    scrollTrigger: { trigger: '.about', scrub: true },
  });

  // Contact — two staggered clusters: intro copy, then form fields.
  gsap.from('.contact-intro > *', {
    opacity: 0,
    y: 24,
    duration: 0.5,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.contact-intro', start: 'top 85%', toggleActions: 'play none none none' },
  });
  gsap.from('.contact-form .field, .contact-form button', {
    opacity: 0,
    y: 20,
    duration: 0.45,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.contact-form', start: 'top 85%', toggleActions: 'play none none none' },
  });

  // Footer is deliberately left un-animated — a copyright line has nothing
  // to gain from motion.
}

// ---- Hover polish: a lift on service-row cards ----
// Buttons and nav links keep their existing CSS-transition hovers (already
// compositor-friendly, no JS dependency). GSAP only owns `transform` here —
// the color-fill hover stays on CSS ::before/::after, so there's no collision.
function initHoverEffects() {
  document.querySelectorAll('.service-row').forEach((row) => {
    row.addEventListener('mouseenter', () => {
      gsap.to(row, { y: -4, duration: 0.25, ease: 'power2.out' });
    });
    row.addEventListener('mouseleave', () => {
      gsap.to(row, { y: 0, duration: 0.18, ease: 'power1.out' });
    });
  });
}
