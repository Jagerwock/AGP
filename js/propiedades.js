let map;
let markersLayer;
let propertiesData = [];
let currentPage = 1;
const perPage = 6;

const filtersForm = document.querySelector('[data-filters]');
const cardsContainer = document.querySelector('[data-property-cards]');
const paginationContainer = document.querySelector('[data-pagination]');
const resultsCount = document.querySelector('[data-results-count]');
const mapToggle = document.querySelector('[data-map-toggle]');
const mapPanel = document.querySelector('[data-map-panel]');

const formatPrice = (price) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(price);

const renderMap = (items) => {
  if (!map) {
    map = L.map('propertiesMap', { scrollWheelZoom: false }).setView([-12.097, -77.037], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
  }

  markersLayer.clearLayers();

  if (items.length === 0) {
    return;
  }

  const bounds = [];
  items.forEach((property) => {
    const marker = L.marker([property.lat, property.lng]).addTo(markersLayer);
    marker.bindPopup(
      `<strong>${property.title}</strong><br>${property.district} · ${formatPrice(property.pricePen)}<br><a href="propiedad.html?id=${property.id}">Ver detalle</a>`
    );
    bounds.push([property.lat, property.lng]);
    marker.on('click', () => {
      const card = document.querySelector(`[data-card-id="${property.id}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('active');
        setTimeout(() => card.classList.remove('active'), 1200);
      }
    });
  });
  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [30, 30] });
  }
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
      property.pricePen >= minPrice &&
      property.pricePen <= maxPrice &&
      property.bedrooms >= minBeds &&
      property.bathrooms >= minBaths &&
      property.areaM2 >= minArea
    );
  });
};

const renderCards = (items) => {
  if (!cardsContainer) return;
  cardsContainer.innerHTML = '';
  if (items.length === 0) {
    cardsContainer.innerHTML = '<p>No encontramos propiedades con esos filtros. Prueba ajustar los rangos.</p>';
    return;
  }

  items.forEach((property) => {
    const card = document.createElement('article');
    card.className = 'property-card';
    card.dataset.cardId = property.id;
    card.innerHTML = `
      <img src="${property.images[0]}" alt="${property.title}" loading="lazy" />
      <div class="property-body">
        <span class="badge">${property.operation}</span>
        <h3>${property.title}</h3>
        <p class="property-price">${formatPrice(property.pricePen)}</p>
        <p>${property.district} · ${property.addressApprox}</p>
        <div class="property-meta">
          <span><svg class="icon" aria-hidden="true"><use href="#icon-area"></use></svg>${property.areaM2} m²</span>
          <span><svg class="icon" aria-hidden="true"><use href="#icon-bed"></use></svg>${property.bedrooms} dorm.</span>
          <span><svg class="icon" aria-hidden="true"><use href="#icon-bath"></use></svg>${property.bathrooms} baños</span>
          <span><svg class="icon" aria-hidden="true"><use href="#icon-parking"></use></svg>${property.parking} est.</span>
        </div>
      </div>
      <div class="card-actions">
        <a class="btn btn-outline" href="propiedad.html?id=${property.id}">Ver detalle</a>
        <span class="badge">${property.type}</span>
      </div>
    `;
    card.addEventListener('click', (event) => {
      if (event.target.tagName.toLowerCase() !== 'a' && map) {
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
  if (resultsCount) {
    resultsCount.textContent = `${filtered.length} propiedades encontradas`;
  }
};

const init = async () => {
  const response = await fetch('data/properties.json');
  const json = await response.json();
  propertiesData = json.properties;

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

  if (mapToggle && mapPanel) {
    mapToggle.addEventListener('click', () => {
      mapPanel.classList.toggle('is-open');
      mapToggle.textContent = mapPanel.classList.contains('is-open') ? 'Ocultar mapa' : 'Ver mapa';
      if (map) {
        setTimeout(() => map.invalidateSize(), 200);
      }
    });
  }
};

init();