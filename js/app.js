const BODY = document.body;

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

const scrollSections = document.querySelectorAll('[data-scrollspy]');
if (scrollSections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const key = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.nav === key);
          });
        }
      });
    },
    { threshold: 0.6 }
  );
  scrollSections.forEach((section) => observer.observe(section));
}

const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  const toast = document.querySelector('[data-toast]');
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const honeypot = contactForm.querySelector('input[name="company"]');
    if (honeypot && honeypot.value) {
      return;
    }
    const data = new FormData(contactForm);
    const name = data.get('name');
    const email = data.get('email');
    const phone = data.get('phone');
    if (!name || !email || !phone) {
      return;
    }
    if (toast) {
      toast.classList.add('show');
      toast.textContent = '¡Gracias! Tu mensaje fue enviado. Un asesor de AGP te contactará pronto.';
      setTimeout(() => toast.classList.remove('show'), 5000);
    }
    contactForm.reset();
  });
}

const leadForm = document.querySelector('[data-lead-form]');
if (leadForm) {
  const toast = document.querySelector('[data-toast]');
  leadForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (toast) {
      toast.classList.add('show');
      toast.textContent = 'Solicitud recibida. Te confirmaremos la tasación gratuita en 24 horas.';
      setTimeout(() => toast.classList.remove('show'), 5000);
    }
    leadForm.reset();
  });
}

const whatsappLinks = document.querySelectorAll('[data-whatsapp]');
whatsappLinks.forEach((link) => {
  const message = encodeURIComponent(link.dataset.whatsapp || 'Hola AGP Inmobiliaria, quisiera más información.');
  link.setAttribute('href', `https://wa.me/51999999999?text=${message}`);
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener');
});
