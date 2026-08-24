const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');

if (header) {
  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    });
  });
}

const revealTargets = document.querySelectorAll([
  '.trust-shell',
  '.hero-about .about-intro',
  '.hero-about .about-flow',
  '.hero-about .value-card',
  '#servicios .section-heading',
  '#servicios .service-card',
  '#ventajas .section-heading',
  '#ventajas .card',
  '#proceso .section-heading',
  '.timeline-item',
  '.cta-banner',
  '#contacto > .container > div',
  '.contact-item',
  '.contact-card',
  '.privacy-heading',
  '.privacy-card',
].join(','));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (revealTargets.length) {
  const revealStyles = ['reveal--scale', 'reveal--soft'];

  revealTargets.forEach((element, index) => {
    element.classList.add('reveal', revealStyles[index % revealStyles.length]);
    element.style.setProperty('--reveal-delay', `${(index % 4) * 55}ms`);
  });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.14,
    });

    revealTargets.forEach((element) => revealObserver.observe(element));
  }
}
