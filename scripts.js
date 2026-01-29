const properties = [
  {
    id: 1,
    name: "Residencia Vista Azul",
    price: 850000,
    location: "Polanco, CDMX",
    size: 320,
    bedrooms: 4,
    bathrooms: 3,
    type: "Casa",
    operation: "Venta",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Residencia con diseño contemporáneo, terraza panorámica y acabados premium. Ideal para familias que buscan exclusividad.",
    features: [
      "Terraza con vista 360°",
      "Cocina equipada",
      "Seguridad 24/7",
      "Estacionamiento para 3 autos",
    ],
  },
  {
    id: 2,
    name: "Penthouse Aurora",
    price: 620000,
    location: "Providencia, Guadalajara",
    size: 220,
    bedrooms: 3,
    bathrooms: 3,
    type: "Departamento",
    operation: "Venta",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Penthouse con doble altura, iluminación natural y amenities exclusivos en una de las zonas más buscadas.",
    features: ["Roof garden privado", "Gimnasio", "Alberca", "Smart home"],
  },
  {
    id: 3,
    name: "Terreno Sunset",
    price: 290000,
    location: "Playa del Carmen",
    size: 500,
    bedrooms: 0,
    bathrooms: 0,
    type: "Terreno",
    operation: "Venta",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Terreno listo para desarrollar con vistas al mar y alta plusvalía. Ideal para inversión residencial.",
    features: ["Uso de suelo residencial", "Acceso pavimentado", "Servicios cercanos"],
  },
  {
    id: 4,
    name: "Loft Gran Vía",
    price: 2400,
    location: "Madrid Centro",
    size: 90,
    bedrooms: 1,
    bathrooms: 1,
    type: "Departamento",
    operation: "Alquiler",
    image:
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Loft amueblado con ubicación estratégica, ideal para ejecutivos o parejas. Incluye servicios premium.",
    features: ["Amueblado", "Cowork cercano", "Wi-Fi", "Concierge"],
  },
];

const grid = document.getElementById("properties-grid");
const detailGallery = document.getElementById("detail-gallery");
const detailInfo = document.getElementById("detail-info");
const form = document.getElementById("search-form");
const toggleTheme = document.getElementById("toggle-theme");

const currencyFormat = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function renderProperties(list) {
  grid.innerHTML = "";
  list.forEach((property) => {
    const card = document.createElement("article");
    card.className = "property-card";
    card.innerHTML = `
      <img src="${property.image}" alt="${property.name}" />
      <div class="property-body">
        <h3>${property.name}</h3>
        <strong>${currencyFormat.format(property.price)}</strong>
        <p>${property.location}</p>
        <div class="property-meta">
          <span>${property.size} m²</span>
          <span>${property.bedrooms} hab.</span>
          <span>${property.bathrooms} baños</span>
          <span>${property.operation}</span>
        </div>
        <button class="btn btn-outline" data-id="${property.id}">Ver detalles</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderDetail(property) {
  detailGallery.innerHTML = property.gallery
    .map((image) => `<img src="${image}" alt="Galería ${property.name}" />`)
    .join("");

  detailInfo.innerHTML = `
    <h3>${property.name}</h3>
    <p>${property.description}</p>
    <ul>
      <li><strong>Ubicación:</strong> ${property.location}</li>
      <li><strong>Precio:</strong> ${currencyFormat.format(property.price)}</li>
      <li><strong>Tamaño:</strong> ${property.size} m²</li>
      <li><strong>Habitaciones:</strong> ${property.bedrooms}</li>
      <li><strong>Baños:</strong> ${property.bathrooms}</li>
      <li><strong>Tipo:</strong> ${property.type}</li>
    </ul>
    <div>
      <strong>Características destacadas</strong>
      <ul>
        ${property.features.map((feature) => `<li>${feature}</li>`).join("")}
      </ul>
    </div>
    <div class="detail-actions">
      <a class="btn btn-primary" href="#contacto">Agendar visita</a>
      <a class="btn btn-secondary" href="https://wa.me/525500000000">WhatsApp</a>
      <a class="btn btn-outline" href="tel:+525500000000">Llamar</a>
    </div>
  `;
}

function applyFilters(event) {
  event.preventDefault();
  const data = new FormData(form);
  const location = data.get("location").toLowerCase();
  const priceMin = Number(data.get("priceMin")) || 0;
  const priceMax = Number(data.get("priceMax")) || Infinity;
  const type = data.get("type");
  const operation = data.get("operation");
  const bedrooms = Number(data.get("bedrooms")) || 0;
  const bathrooms = Number(data.get("bathrooms")) || 0;

  const filtered = properties.filter((property) => {
    const matchesLocation = property.location.toLowerCase().includes(location);
    const matchesPrice = property.price >= priceMin && property.price <= priceMax;
    const matchesType = type ? property.type === type : true;
    const matchesOperation = operation ? property.operation === operation : true;
    const matchesBedrooms = bedrooms ? property.bedrooms >= bedrooms : true;
    const matchesBathrooms = bathrooms ? property.bathrooms >= bathrooms : true;

    return (
      matchesLocation &&
      matchesPrice &&
      matchesType &&
      matchesOperation &&
      matchesBedrooms &&
      matchesBathrooms
    );
  });

  renderProperties(filtered);
}

function handleCardClick(event) {
  const target = event.target;
  if (target.matches("button[data-id]")) {
    const propertyId = Number(target.dataset.id);
    const selected = properties.find((property) => property.id === propertyId);
    if (selected) {
      renderDetail(selected);
      document
        .getElementById("propiedad-destacada")
        .scrollIntoView({ behavior: "smooth" });
    }
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  toggleTheme.textContent = isDark ? "Modo claro" : "Modo oscuro";
  localStorage.setItem("agp-theme", isDark ? "dark" : "light");
}

function initTheme() {
  const saved = localStorage.getItem("agp-theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
    toggleTheme.textContent = "Modo claro";
  }
}

form.addEventListener("submit", applyFilters);

grid.addEventListener("click", handleCardClick);

toggleTheme.addEventListener("click", toggleDarkMode);

renderProperties(properties);
renderDetail(properties[0]);
initTheme();