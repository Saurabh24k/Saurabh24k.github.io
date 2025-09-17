const body = document.body;
const html = document.documentElement;
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navLinks = Array.from(document.querySelectorAll('.nav__link'));
const header = document.getElementById('header');
const themeToggle = document.getElementById('theme-toggle');
const currentYearEl = document.getElementById('current-year');

const openMenu = () => {
  if (!navMenu) return;
  navMenu.classList.add('show-menu');
  body?.classList.add('menu-open');
};

const closeMenu = () => {
  if (!navMenu) return;
  navMenu.classList.remove('show-menu');
  body?.classList.remove('menu-open');
};

navToggle?.addEventListener('click', openMenu);
navClose?.addEventListener('click', closeMenu);
navLinks.forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
});

window.addEventListener('scroll', () => {
  if (!header) return;
  header.classList.toggle('header--scrolled', window.scrollY > 12);
});

if (header) {
  header.classList.toggle('header--scrolled', window.scrollY > 12);
}

const sections = document.querySelectorAll('section[id]');
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const activeLink = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
      if (!activeLink) return;
      navLinks.forEach((link) => link.classList.remove('active-link'));
      activeLink.classList.add('active-link');
    });
  },
  {
    rootMargin: '-30% 0px -45% 0px',
    threshold: 0.35,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

if (navLinks.length > 0) {
  navLinks[0].classList.add('active-link');
}

const themeStorageKey = 'saurabh-theme';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

const setTheme = (theme, persist = false) => {
  body?.setAttribute('data-theme', theme);
  html?.setAttribute('data-theme', theme);
  if (persist) {
    localStorage.setItem(themeStorageKey, theme);
  }
  if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'uil uil-sun' : 'uil uil-moon';
    }
    themeToggle.setAttribute('aria-label', `Activate ${theme === 'dark' ? 'light' : 'dark'} theme`);
  }
};

const storedTheme = localStorage.getItem(themeStorageKey);
if (storedTheme) {
  setTheme(storedTheme);
} else {
  setTheme(prefersDark.matches ? 'dark' : 'light');
}

prefersDark.addEventListener('change', (event) => {
  if (!localStorage.getItem(themeStorageKey)) {
    setTheme(event.matches ? 'dark' : 'light');
  }
});

themeToggle?.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(currentTheme, true);
});

if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear().toString();
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = document.querySelectorAll('.reveal');

if (prefersReducedMotion.matches) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  const introTimeline = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });
  introTimeline
    .from('.nav__logo', { y: -20, opacity: 0 })
    .from('.nav__list li', { y: -20, opacity: 0, stagger: 0.08 }, '-=0.6')
    .from('.hero__eyebrow', { y: 20, opacity: 0 }, '-=0.4')
    .from('.hero__title', { y: 30, opacity: 0 }, '-=0.5')
    .from('.hero__description', { y: 30, opacity: 0 }, '-=0.5')
    .from('.hero__actions', { y: 20, opacity: 0 }, '-=0.5')
    .from('.hero__social', { y: 20, opacity: 0 }, '-=0.6')
    .from('.hero__stats .hero__stat', { y: 30, opacity: 0, stagger: 0.12 }, '-=0.6')
    .from('.hero__media', { x: 40, opacity: 0, duration: 1 }, '-=0.8');

  gsap.utils.toArray('.reveal').forEach((element) => {
    gsap.from(element, {
      opacity: 0,
      y: 60,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}
