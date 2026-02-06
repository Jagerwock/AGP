const BODY = document.body;
const WHATSAPP_NUMBER = '51XXXXXXXXX';

const THEME_KEY = 'agp-theme';

const themeToggle = document.querySelector('[data-theme-toggle]');
const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const setTheme = (theme) => {
  BODY.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  if (!themeToggle) return;
  const isDark = theme === 'dark';
  themeToggle.classList.toggle('is-dark', isDark);
  themeToggle.setAttribute('aria-pressed', isDark.toString());
  themeToggle.setAttribute('title', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo ocaso');
  const icon = themeToggle.querySelector('[data-theme-icon]');
  const label = themeToggle.querySelector('[data-theme-label]');
  if (icon) icon.textContent = isDark ? '🌙' : '☀️';
  if (label) label.textContent = isDark ? 'Ocaso' : 'Claro';
};

const storedTheme = localStorage.getItem(THEME_KEY);
const initialTheme = storedTheme || (prefersDark() ? 'dark' : 'light');
setTheme(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    BODY.classList.add('theme-transition');
    const nextTheme = BODY.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setTimeout(() => BODY.classList.remove('theme-transition'), 350);
  });
}

const drawer = document.querySelector('[data-drawer]');
const drawerToggle = document.querySelector('[data-drawer-toggle]');
const drawerClose = document.querySelector('[data-drawer-close]');

if (drawerToggle && drawer) {
  drawerToggle.addEventListener('click', () => drawer.classList.add('open'));
}

if (drawerClose && drawer) {
  drawerClose.addEventListener('click', () => drawer.classList.remove('open'));
  drawer.addEventListener('click', (event) => {
    if (event.target === drawer) {
      drawer.classList.remove('open');
    }
  });
}

const pageKey = BODY.dataset.page;
const navLinks = document.querySelectorAll('[data-nav]');
if (pageKey) {
  navLinks.forEach((link) => {
    if (link.dataset.nav === pageKey) {
      link.classList.add('active');
    }
  });
}

const toast = document.querySelector('[data-toast]');
const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4500);
};

const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const honeypot = contactForm.querySelector('input[name="company"]');
    if (honeypot && honeypot.value) return;
    showToast('¡Gracias! Un asesor de AGP Inmobiliaria te contactará en breve.');
    contactForm.reset();
  });
}

const leadForm = document.querySelector('[data-lead-form]');
if (leadForm) {
  leadForm.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Solicitud recibida. Te confirmaremos la tasación gratuita en 24 horas.');
    leadForm.reset();
  });
}

const whatsappLinks = document.querySelectorAll('[data-whatsapp]');
whatsappLinks.forEach((link) => {
  const message = encodeURIComponent(link.dataset.whatsapp || 'Hola AGP Inmobiliaria, quiero información.');
  link.setAttribute('href', `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`);
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener');
});

const contactMap = document.querySelector('[data-contact-map]');
if (contactMap && window.L) {
  const lat = parseFloat(contactMap.dataset.lat);
  const lng = parseFloat(contactMap.dataset.lng);
  const map = L.map('contactMap', { scrollWheelZoom: false }).setView([lat, lng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);
  L.marker([lat, lng]).addTo(map).bindPopup('AGP Inmobiliaria - Lima');
}

const revealElements = document.querySelectorAll('.section, .property-card, .card, .service-item');
revealElements.forEach((element) => element.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}