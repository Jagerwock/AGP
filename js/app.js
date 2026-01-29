const DISTRICTS = [
  "Miraflores",
  "San Isidro",
  "Barranco",
  "Surco",
  "La Molina",
  "Jesús María",
  "Magdalena",
  "San Miguel",
  "Pueblo Libre",
  "Lince",
];

const USD_RATE = 3.75;
const ITEMS_PER_PAGE = 6;
const WHATSAPP_NUMBER = "51XXXXXXXXX";
const CALENDLY_LINK = "https://calendly.com";

const state = {
  allProperties: [],
  filtered: [],
  currentPage: 1,
  showUsd: false,
};

const elements = {
  form: document.getElementById("filters-form"),
  district: document.getElementById("filter-district"),
  operation: document.getElementById("filter-operation"),
  type: document.getElementById("filter-type"),
  priceMin: document.getElementById("filter-price-min"),
  priceMax: document.getElementById("filter-price-max"),
  bedrooms: document.getElementById("filter-bedrooms"),
  area: document.getElementById("filter-area"),
  clear: document.getElementById("clear-filters"),
  grid: document.getElementById("property-grid"),
  loadMore: document.getElementById("load-more"),
  results: document.getElementById("results-count"),
  currencyToggle: document.getElementById("currency-toggle"),
  zonesGrid: document.getElementById("zones-grid"),
  toast: document.getElementById("toast"),
  leadForm: document.getElementById("lead-form"),
  contactForm: document.getElementById("contact-form"),
  contactFeedback: document.getElementById("contact-feedback"),
  navToggle: document.querySelector(".nav-toggle"),
  navMenu: document.querySelector(".nav-menu"),
  modeToggle: document.querySelector(".mode-toggle"),
  modal: document.getElementById("success-modal"),
};

let map;
let markersLayer;

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

const toggleModal = (show) => {
  if (!elements.modal) return;
  elements.modal.classList.toggle("show", show);
  elements.modal.setAttribute("aria-hidden", String(!show));
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

const populateDistricts = () => {
  if (!elements.district) return;
  DISTRICTS.forEach((district) => {
    const option = document.createElement("option");
    option.value = district;
    option.textContent = district;
    elements.district.appendChild(option);
  });

  if (elements.zonesGrid) {
    elements.zonesGrid.innerHTML = DISTRICTS.map(
      (district) => `
        <article class="zone-card">
          <h3>${district}</h3>
          <p>Demanda alta y valorización sostenida.</p>
          <button type="button" data-district="${district}">Ver propiedades</button>
        </article>
      `
    ).join("");

    elements.zonesGrid.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-district]");
      if (!button) return;
      elements.district.value = button.dataset.district;
      applyFilters();
      document.getElementById("propiedades")?.scrollIntoView({ behavior: "smooth" });
    });
  }
};

const buildCard = (property) => {
  const price = formatCurrency(property.pricePen);
  const usd = state.showUsd ? ` · ${formatUsd(property.pricePen)}` : "";
  return `
    <article class="property-card">
      <img src="${property.images[0]}" alt="${property.title}" loading="lazy" />
      <div class="property-card__body">
        <span class="badge">${property.operation}</span>
        <h3>${property.title}</h3>
        <p><strong>${price}${usd}</strong></p>
        <div class="property-card__meta">
          <span>${property.district}</span>
          <span>${property.areaM2} m² · ${property.bedrooms} hab · ${property.bathrooms} baños</span>
        </div>
        <a class="btn btn-secondary" href="propiedad.html?id=${property.id}">Ver detalle</a>
      </div>
    </article>
  `;
};

const renderProperties = () => {
  const end = ITEMS_PER_PAGE * state.currentPage;
  const slice = state.filtered.slice(0, end);
  if (!slice.length) {
    elements.grid.innerHTML = `<p>No se encontraron propiedades con esos filtros.</p>`;
  } else {
    elements.grid.innerHTML = slice.map(buildCard).join("");
  }
  elements.results.textContent = `${state.filtered.length} propiedades`;
  elements.loadMore.style.display = state.filtered.length > end ? "inline-flex" : "none";
};

const updateMap = () => {
  if (!map) return;
  markersLayer.clearLayers();
  const bounds = [];

  state.filtered.forEach((property) => {
    const marker = L.marker([property.lat, property.lng]);
    marker.bindPopup(`
      <strong>${property.title}</strong><br />
      ${property.district}<br />
      <a href="propiedad.html?id=${property.id}">Ver detalle</a>
    `);
    markersLayer.addLayer(marker);
    bounds.push([property.lat, property.lng]);
  });

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [40, 40] });
  }
};

const applyFilters = () => {
  const district = elements.district.value;
  const operation = elements.operation.value;
  const type = elements.type.value;
  const priceMin = Number(elements.priceMin.value) || 0;
  const priceMax = Number(elements.priceMax.value) || Infinity;
  const bedrooms = Number(elements.bedrooms.value) || 0;
  const areaMin = Number(elements.area.value) || 0;

  state.filtered = state.allProperties.filter((property) => {
    return (
      (!district || property.district === district) &&
      (!operation || property.operation === operation) &&
      (!type || property.type === type) &&
      property.pricePen >= priceMin &&
      property.pricePen <= priceMax &&
      property.bedrooms >= bedrooms &&
      property.areaM2 >= areaMin
    );
  });

  state.currentPage = 1;
  renderProperties();
  updateMap();
};

const initMap = () => {
  map = L.map("map", { scrollWheelZoom: false }).setView([-12.0464, -77.0428], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
};

const initModal = () => {
  if (!elements.modal) return;
  const closeButton = elements.modal.querySelector(".modal-close");
  closeButton?.addEventListener("click", () => toggleModal(false));
  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      toggleModal(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toggleModal(false);
    }
  });
};

const initForms = () => {
  elements.form?.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });

  elements.clear?.addEventListener("click", () => {
    elements.form.reset();
    applyFilters();
  });

  elements.loadMore?.addEventListener("click", () => {
    state.currentPage += 1;
    renderProperties();
  });

  elements.currencyToggle?.addEventListener("change", (event) => {
    state.showUsd = event.target.checked;
    renderProperties();
  });

  elements.leadForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const feedback = elements.leadForm.querySelector(".form-feedback");
    if (elements.leadForm.checkValidity()) {
      feedback.textContent = "¡Solicitud recibida! Te contactaremos pronto.";
      showToast("Solicitud recibida");
      toggleModal(true);
      elements.leadForm.reset();
    } else {
      feedback.textContent = "Completa los campos requeridos.";
    }
  });

  elements.contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const honeypot = elements.contactForm.querySelector(".honeypot").value;
    if (honeypot) return;
    if (elements.contactForm.checkValidity()) {
      elements.contactFeedback.textContent = "¡Listo! Te contactaremos en menos de 24h.";
      showToast("Solicitud recibida");
      toggleModal(true);
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
    elements.navMenu.classList.toggle("open");
  });
};

const loadProperties = async () => {
  try {
    const response = await fetch("data/properties.json");
    if (!response.ok) {
      throw new Error("No se pudo cargar el JSON");
    }
    state.allProperties = await response.json();
  } catch (error) {
    showToast("Activa un servidor local para cargar el JSON.");
    state.allProperties = [];
  }
  state.filtered = [...state.allProperties];
};

const init = async () => {
  initModeToggle();
  populateDistricts();
  initMap();
  initNav();
  initModal();
  initForms();
  await loadProperties();
  applyFilters();
};

init();

window.AGP_CONFIG = {
  whatsapp: WHATSAPP_NUMBER,
  calendly: CALENDLY_LINK,
  usdRate: USD_RATE,
};