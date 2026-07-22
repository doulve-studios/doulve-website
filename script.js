// Reveals each service row as it scrolls into view.
// Respects prefers-reduced-motion by skipping the animation entirely.

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rows = document.querySelectorAll('[data-reveal]');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  rows.forEach((row) => row.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  rows.forEach((row) => observer.observe(row));
}
