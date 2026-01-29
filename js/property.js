const USD_RATE = 3.8;

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
  map: document.getElementById("property-map"),
  modal: document.getElementById("gallery-modal"),
  modalImage: document.getElementById("modal-image"),
  modalClose: document.querySelector(".modal-close"),
  toast: document.getElementById("toast"),
  contactForm: document.getElementById("contact-form"),
  contactFeedback: document.getElementById("contact-feedback"),
  whatsapp: document.getElementById("property-whatsapp"),
  stickyWhatsapp: document.getElementById("sticky-whatsapp"),
  modeToggle: document.querySelector(".mode-toggle"),
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
    elements.modal.classList.add("show");
    elements.modal.setAttribute("aria-hidden", "false");
  });

  elements.modalClose.addEventListener("click", () => {
    elements.modal.classList.remove("show");
    elements.modal.setAttribute("aria-hidden", "true");
  });

  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      elements.modal.classList.remove("show");
      elements.modal.setAttribute("aria-hidden", "true");
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
        <img src="${property.images[0]}" alt="${property.title}" loading="lazy" />
        <div class="property-card__body">
          <span class="badge">${property.operation}</span>
          <h3>${property.title}</h3>
          <p><strong>${formatCurrency(property.pricePen)}</strong></p>
          <div class="property-card__meta">
            <span>${property.district}</span>
            <span>${property.areaM2} m² · ${property.bedrooms} hab</span>
          </div>
          <a class="btn btn-secondary" href="propiedad.html?id=${property.id}">Ver detalle</a>
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
  `;

  const whatsappMessage = encodeURIComponent(
    `Hola, quiero agendar una visita para ${property.title} en ${property.district}.`
  );
  const whatsappUrl = `https://wa.me/51999999999?text=${whatsappMessage}`;
  elements.whatsapp.href = whatsappUrl;
  elements.stickyWhatsapp.href = whatsappUrl;

  renderGallery(property.images);
  renderSimilar(allProperties, property);
  initMap(property);
};

const initForms = () => {
  elements.contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const honeypot = elements.contactForm.querySelector(".honeypot").value;
    if (honeypot) return;
    if (elements.contactForm.checkValidity()) {
      elements.contactFeedback.textContent = "¡Listo! Te contactaremos en menos de 24h.";
      showToast("Mensaje enviado (demo)");
      elements.contactForm.reset();
    } else {
      elements.contactFeedback.textContent = "Revisa los campos requeridos.";
    }
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
  loadProperty();
};

init();