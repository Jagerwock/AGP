let map;
let markersLayer;
let propertiesData = [];
let usdRate = 3.75;
let currentPage = 1;
const perPage = 6;

const filtersForm = document.querySelector('[data-filters]');
const cardsContainer = document.querySelector('[data-property-cards]');
const paginationContainer = document.querySelector('[data-pagination]');

const formatPrice = (price) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(price);

const formatUsd = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    price / usdRate
  );

const renderMap = (items) => {
  if (!map) {
    map = L.map('propertiesMap', { scrollWheelZoom: false }).setView([-12.096, -77.03], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
  }

  markersLayer.clearLayers();

  items.forEach((property) => {
    const marker = L.marker([property.lat, property.lng]).addTo(markersLayer);
    marker.bindPopup(
      `<strong>${property.title}</strong><br>${property.district} · ${formatPrice(property.price_soles)}<br><a href="propiedad.html?id=${property.id}">Ver detalle</a>`
    );
    marker.on('click', () => {
      const card = document.querySelector(`[data-card-id="${property.id}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('active');
        setTimeout(() => card.classList.remove('active'), 1200);
      }
    });
  });
};

const getFiltered = () => {
  if (!filtersForm) return propertiesData;
  const formData = new FormData(filtersForm);
  return propertiesData.filter((property) => {
    const district = formData.get('district');
    const operation = formData.get('operation');
    const type = formData.get('type');
    const minPrice = parseInt(formData.get('minPrice') || '0', 10);
    const maxPrice = parseInt(formData.get('maxPrice') || '99999999', 10);
    const minBeds = parseInt(formData.get('bedrooms') || '0', 10);
    const minBaths = parseInt(formData.get('bathrooms') || '0', 10);
    const minArea = parseInt(formData.get('minArea') || '0', 10);

    return (
      (!district || property.district === district) &&
      (!operation || property.operation === operation) &&
      (!type || property.type === type) &&
      property.price_soles >= minPrice &&
      property.price_soles <= maxPrice &&
      property.bedrooms >= minBeds &&
      property.bathrooms >= minBaths &&
      property.area_m2 >= minArea
    );
  });
};

const renderCards = (items) => {
  if (!cardsContainer) return;
  cardsContainer.innerHTML = '';
  if (items.length === 0) {
    cardsContainer.innerHTML = '<p>No encontramos propiedades con esos filtros.</p>';
    return;
  }

  items.forEach((property) => {
    const card = document.createElement('article');
    card.className = 'property-card';
    card.dataset.cardId = property.id;
    card.innerHTML = `
      <img src="${property.images[0]}" alt="${property.title}" loading="lazy" />
      <div>
        <span class="badge">${property.operation}</span>
        <h3>${property.title}</h3>
        <p class="property-price">${formatPrice(property.price_soles)} <small>(USD ${formatUsd(property.price_soles)})</small></p>
        <p>${property.district} · ${property.address}</p>
        <div class="property-meta">
          <span>${property.area_m2} m²</span>
          <span>${property.bedrooms} hab.</span>
          <span>${property.bathrooms} baños</span>
          <span>${property.parking} est.</span>
        </div>
      </div>
      <a class="btn btn-outline" href="propiedad.html?id=${property.id}">Ver detalle</a>
    `;
    card.addEventListener('click', (event) => {
      if (event.target.tagName.toLowerCase() !== 'a') {
        map.setView([property.lat, property.lng], 15, { animate: true });
      }
    });
    cardsContainer.appendChild(card);
  });
};

const renderPagination = (total) => {
  if (!paginationContainer) return;
  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(total / perPage);
  for (let page = 1; page <= totalPages; page += 1) {
    const button = document.createElement('button');
    button.textContent = page;
    if (page === currentPage) button.classList.add('active');
    button.addEventListener('click', () => {
      currentPage = page;
      updateView();
    });
    paginationContainer.appendChild(button);
  }
};

const updateView = () => {
  const filtered = getFiltered();
  const start = (currentPage - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);
  renderCards(paged);
  renderPagination(filtered.length);
  renderMap(filtered);
};

const init = async () => {
  const response = await fetch('data/properties.json');
  const json = await response.json();
  propertiesData = json.properties;
  usdRate = json.usd_rate || usdRate;

  const params = new URLSearchParams(window.location.search);
  const districtParam = params.get('district');
  if (districtParam && filtersForm) {
    filtersForm.querySelector('[name="district"]').value = districtParam;
  }

  updateView();

  if (filtersForm) {
    filtersForm.addEventListener('input', () => {
      currentPage = 1;
      updateView();
    });
  }
};

init();