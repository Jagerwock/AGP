const BODY = document.body;
const WHATSAPP_NUMBER = '51XXXXXXXXX';

const themeToggle = document.querySelector('[data-theme-toggle]');
const storedTheme = localStorage.getItem('agp-theme');
if (storedTheme) {
  BODY.setAttribute('data-theme', storedTheme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = BODY.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    BODY.setAttribute('data-theme', nextTheme);
    localStorage.setItem('agp-theme', nextTheme);
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