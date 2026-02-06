const USD_RATE = 3.75;
const WHATSAPP_NUMBER = "51XXXXXXXXX";

const elements = {
  district: document.getElementById("property-district"),
  title: document.getElementById("property-title"),
  price: document.getElementById("property-price"),
  address: document.getElementById("property-address"),
  tags: document.getElementById("property-tags"),
  mainImage: document.getElementById("gallery-main"),
  thumbs: document.getElementById("gallery-thumbs"),
  description: document.getElementById("property-description"),
  features: document.getElementById("property-features"),
  table: document.getElementById("property-table"),
  similar: document.getElementById("similar-grid"),
  modal: document.getElementById("gallery-modal"),
  modalImage: document.getElementById("modal-image"),
  modalClose: document.querySelector("#gallery-modal .modal-close"),
  toast: document.getElementById("toast"),
  contactForm: document.getElementById("contact-form"),
  contactFeedback: document.getElementById("contact-feedback"),
  whatsapp: document.getElementById("property-whatsapp"),
  stickyWhatsapp: document.getElementById("sticky-whatsapp"),
  modeToggle: document.querySelector(".mode-toggle"),
  successModal: document.getElementById("success-modal"),
  navToggle: document.querySelector(".nav-toggle"),
  navMenu: document.querySelector(".nav-menu"),
};

let map;

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);

const formatUsd = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value / USD_RATE);

const showToast = (message) => {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  setTimeout(() => elements.toast.classList.remove("show"), 3000);
};

const toggleModal = (modal, show) => {
  if (!modal) return;
  modal.classList.toggle("show", show);
  modal.setAttribute("aria-hidden", String(!show));
};

const applyDarkMode = (enabled) => {
  document.documentElement.classList.toggle("dark", enabled);
  if (elements.modeToggle) {
    elements.modeToggle.setAttribute("aria-pressed", String(enabled));
  }
};

const initModeToggle = () => {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const enabled = saved ? saved === "dark" : prefersDark;
  applyDarkMode(enabled);

  elements.modeToggle?.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    elements.modeToggle.setAttribute("aria-pressed", String(isDark));
  });
};

const initMap = (property) => {
  map = L.map("property-map", { scrollWheelZoom: false }).setView([property.lat, property.lng], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
  L.marker([property.lat, property.lng]).addTo(map);
};

const renderGallery = (images) => {
  if (!images.length) return;
  elements.mainImage.src = images[0];
  elements.mainImage.alt = "Foto principal";

  elements.thumbs.innerHTML = images
    .map(
      (img, index) => `
        <button type="button" data-index="${index}">
          <img src="${img}" alt="Miniatura ${index + 1}" class="${index === 0 ? "active" : ""}" loading="lazy" />
        </button>
      `
    )
    .join("");

  elements.thumbs.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-index]");
    if (!button) return;
    const index = Number(button.dataset.index);
    elements.mainImage.src = images[index];
    elements.thumbs.querySelectorAll("img").forEach((img) => img.classList.remove("active"));
    button.querySelector("img").classList.add("active");
  });

  elements.mainImage.addEventListener("click", () => {
    elements.modalImage.src = elements.mainImage.src;
    toggleModal(elements.modal, true);
  });
}

const initGalleryModal = () => {
  elements.modalClose?.addEventListener("click", () => toggleModal(elements.modal, false));
  elements.modal?.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      toggleModal(elements.modal, false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toggleModal(elements.modal, false);
      toggleModal(elements.successModal, false);
    }
  });
};

const renderSimilar = (allProperties, current) => {
  const similar = allProperties
    .filter(
      (property) =>
        property.id !== current.id &&
        (property.district === current.district || property.type === current.type)
    )
    .slice(0, 3);

  elements.similar.innerHTML = similar
    .map(
      (property) => `
      <article class="property-card">
        <div class="property-card__media">
          <img src="${property.images[0]}" alt="${property.title}" loading="lazy" />
          <span class="property-card__tag">${property.operation}</span>
        </div>
        <div class="property-body">
          <h3>${property.title}</h3>
          <p class="property-price">${formatCurrency(property.pricePen)}</p>
          <p>${property.district}</p>
          <div class="property-meta">
            <span>${property.areaM2} m² · ${property.bedrooms} hab</span>
          </div>
          </div>
        <div class="card-actions">
          <a class="btn btn-outline" href="propiedad.html?id=${property.id}">Ver detalle</a>
        </div>
      </article>
    `
    )
    .join("");
};

const renderProperty = (property, allProperties) => {
  const usd = formatUsd(property.pricePen);
  elements.district.textContent = property.district;
  elements.title.textContent = property.title;
  elements.price.textContent = `${formatCurrency(property.pricePen)} · ${usd}`;
  elements.address.textContent = property.addressApprox;
  elements.tags.innerHTML = `
    <span class="badge">${property.operation}</span>
    <span class="badge">${property.type}</span>
    <span class="badge">${property.bedrooms} hab</span>
    <span class="badge">${property.areaM2} m²</span>
  `;
  elements.description.textContent = property.description;
  elements.features.innerHTML = property.features.map((feature) => `<li>${feature}</li>`).join("");
  elements.table.innerHTML = `
    <tr><td>Operación</td><td>${property.operation}</td></tr>
    <tr><td>Tipo</td><td>${property.type}</td></tr>
    <tr><td>Dormitorios</td><td>${property.bedrooms}</td></tr>
    <tr><td>Baños</td><td>${property.bathrooms}</td></tr>
    <tr><td>Área</td><td>${property.areaM2} m²</td></tr>
    <tr><td>Distrito</td><td>${property.district}</td></tr>
    <tr><td>ID</td><td>${property.id}</td></tr>
  `;

  const whatsappMessage = encodeURIComponent(
    `Hola, quiero agendar una visita para la propiedad ${property.id} (${property.title}) en ${property.district}.`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;
  elements.whatsapp.href = whatsappUrl;
  elements.stickyWhatsapp.href = whatsappUrl;

  renderGallery(property.images);
  renderSimilar(allProperties, property);
  initMap(property);
};

const initSuccessModal = () => {
  if (!elements.successModal) return;
  const closeButton = elements.successModal.querySelector(".modal-close");
  closeButton?.addEventListener("click", () => toggleModal(elements.successModal, false));
  elements.successModal.addEventListener("click", (event) => {
    if (event.target === elements.successModal) {
      toggleModal(elements.successModal, false);
    }
  });
};

const initForms = () => {
  elements.contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const honeypot = elements.contactForm.querySelector(".honeypot").value;
    if (honeypot) return;
    if (elements.contactForm.checkValidity()) {
      elements.contactFeedback.textContent = "¡Listo! Te contactaremos en menos de 24h.";
      showToast("Solicitud recibida");
      toggleModal(elements.successModal, true);
      elements.contactForm.reset();
    } else {
      elements.contactFeedback.textContent = "Revisa los campos requeridos.";
    }
  });
};

const initNav = () => {
  elements.navToggle?.addEventListener("click", () => {
    const expanded = elements.navToggle.getAttribute("aria-expanded") === "true";
    elements.navToggle.setAttribute("aria-expanded", String(!expanded));
    elements.navMenu?.classList.toggle("open");
  });
};

const loadProperty = async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    showToast("No se encontró la propiedad.");
    return;
  }

  const response = await fetch("data/properties.json");
  const data = await response.json();
  const property = data.find((item) => String(item.id) === id);

  if (!property) {
    showToast("No se encontró la propiedad.");
    return;
  }

  renderProperty(property, data);
};

const init = () => {
  initModeToggle();
  initForms();
  initGalleryModal();
  initSuccessModal();
  initNav();
  loadProperty();
};

init();