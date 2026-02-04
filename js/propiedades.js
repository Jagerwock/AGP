let map;
let markersLayer;
let propertiesData = [];
let currentPage = 1;
const perPage = 6;

const filtersShell = document.querySelector('[data-filters]');
const cardsContainer = document.querySelector('[data-property-cards]');
const paginationContainer = document.querySelector('[data-pagination]');
const resultsCount = document.querySelector('[data-results-count]');
const layout = document.querySelector('[data-layout]');
const mapPanel = document.querySelector('[data-map-panel]');
const mapCard = document.querySelector('[data-map-card]');
const activeChipsContainer = document.querySelector('[data-active-chips]');
const advancedPanel = document.querySelector('[data-advanced-panel]');
const pricePanel = document.querySelector('[data-price-panel]');
const sortSelect = document.querySelector('[data-sort]');

const operationTabs = document.querySelectorAll('[data-operation-tab]');
const viewToggleButtons = document.querySelectorAll('[data-view-toggle]');
const bedroomChips = document.querySelectorAll('[data-bedrooms]');
const moreFiltersBtn = document.querySelector('[data-more-filters]');
const priceToggleBtn = document.querySelector('[data-price-toggle]');

const districtSelect = document.querySelector('[name="district"]');
const typeSelect = document.querySelector('[name="type"]');
const bathroomsSelect = document.querySelector('[name="bathrooms"]');
const minAreaInput = document.querySelector('[name="minArea"]');
const minPriceInput = document.querySelector('[name="minPrice"]');
const maxPriceInput = document.querySelector('[name="maxPrice"]');

const defaultState = {
  operation: 'Venta',
  district: '',
  type: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  bathrooms: '',
  minArea: '',
  sort: 'recent',
};

const state = { ...defaultState };

const setActiveButton = (buttons, value) => {
  buttons.forEach((button) => {
    const isActive = button.dataset.value === value;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive.toString());
  });
};

const applyStateToInputs = () => {
  if (districtSelect) districtSelect.value = state.district;
  if (typeSelect) typeSelect.value = state.type;
  if (bathroomsSelect) bathroomsSelect.value = state.bathrooms;
  if (minAreaInput) minAreaInput.value = state.minArea;
  if (minPriceInput) minPriceInput.value = state.minPrice;
  if (maxPriceInput) maxPriceInput.value = state.maxPrice;
  if (sortSelect) sortSelect.value = state.sort;

  setActiveButton(operationTabs, state.operation || 'all');
  setActiveButton(bedroomChips, state.bedrooms || '');
};

const updateStateFromInputs = () => {
  if (districtSelect) state.district = districtSelect.value;
  if (typeSelect) state.type = typeSelect.value;
  if (bathroomsSelect) state.bathrooms = bathroomsSelect.value;
  if (minAreaInput) state.minArea = minAreaInput.value;
  if (minPriceInput) state.minPrice = minPriceInput.value;
  if (maxPriceInput) state.maxPrice = maxPriceInput.value;
  if (sortSelect) state.sort = sortSelect.value;
};

const buildActiveChips = () => {
  const chips = [];
  if (state.operation) chips.push({ key: 'operation', label: state.operation });
  if (state.district) chips.push({ key: 'district', label: state.district });
  if (state.type) chips.push({ key: 'type', label: state.type });
  if (state.bedrooms) chips.push({ key: 'bedrooms', label: `${state.bedrooms}+ dorm.` });
  if (state.bathrooms) chips.push({ key: 'bathrooms', label: `${state.bathrooms}+ baños` });
  if (state.minArea) chips.push({ key: 'minArea', label: `Área ${state.minArea}+ m²` });
  if (state.minPrice || state.maxPrice) {
    const min = state.minPrice ? `S/ ${state.minPrice}` : 'S/ 0';
    const max = state.maxPrice ? `S/ ${state.maxPrice}` : 'sin tope';
    chips.push({ key: 'price', label: `Precio ${min} - ${max}` });
  }
  return chips;
};

const renderActiveChips = () => {
  if (!activeChipsContainer) return;
  const chips = buildActiveChips();
  activeChipsContainer.innerHTML = '';
  if (chips.length === 0) {
    activeChipsContainer.innerHTML = '<span class="muted-text">Sin filtros activos.</span>';
    return;
  }
  chips.forEach((chip) => {
    const chipEl = document.createElement('span');
    chipEl.className = 'active-chip';
    chipEl.innerHTML = `${chip.label} <button type="button" aria-label="Quitar filtro">✕</button>`;
    chipEl.querySelector('button').addEventListener('click', () => {
      if (chip.key === 'price') {
        state.minPrice = '';
        state.maxPrice = '';
      } else {
        state[chip.key] = '';
      }
      applyStateToInputs();
      updateView();
    });
    activeChipsContainer.appendChild(chipEl);
  });
};

const getFiltered = () => {
  const minPrice = parseInt(state.minPrice || '0', 10);
  const maxPrice = parseInt(state.maxPrice || '99999999', 10);
  const minBeds = parseInt(state.bedrooms || '0', 10);
  const minBaths = parseInt(state.bathrooms || '0', 10);
  const minArea = parseInt(state.minArea || '0', 10);

  return propertiesData.filter((property) => {
    return (
      (!state.district || property.district === state.district) &&
      (!state.operation || property.operation === state.operation) &&
      (!state.type || property.type === state.type) &&
      property.pricePen >= minPrice &&
      property.pricePen <= maxPrice &&
      property.bedrooms >= minBeds &&
      property.bathrooms >= minBaths &&
      property.areaM2 >= minArea
    );
  });
};

const sortItems = (items) => {
  const sorted = [...items];
  switch (state.sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.pricePen - b.pricePen);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.pricePen - a.pricePen);
      break;
    default:
      break;
  }
  return sorted;
};

const renderMap = (items) => {
  const mapContainer = document.querySelector('#propertiesMap');
  if (!mapContainer || !mapPanel) return;

  if (!window.L) {
    mapContainer.innerHTML = '<div class="map-placeholder">Mapa no disponible en este entorno.</div>';
    return;
  }
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
      `<strong>${property.title}</strong><br>${property.district} · ${AGPRender.formatPrice(property.pricePen)}<br><a href="propiedad.html?id=${property.id}">Ver detalle</a>`
    );
    bounds.push([property.lat, property.lng]);
    marker.on('click', () => {
      const card = document.querySelector(`[data-card-id="${property.id}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('active');
        setTimeout(() => card.classList.remove('active'), 1200);
      }
      if (mapCard) {
        mapCard.classList.add('is-visible');
        mapCard.innerHTML = `
          <h4>${property.title}</h4>
          <p class="muted-text">${property.district} · ${AGPRender.formatPrice(property.pricePen)}</p>
          <a class="btn btn-outline" href="propiedad.html?id=${property.id}">Ver detalle</a>
        `;
      }
    });
  });

  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [30, 30] });
  }
};

const renderCards = (items) => {
  if (!cardsContainer) return;
  cardsContainer.innerHTML = '';
  if (items.length === 0) {
    AGPRender.renderEmptyState(cardsContainer, resetFilters);
    return;
  }

  items.forEach((property) => {
    const card = AGPRender.createCardElement(property);
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
  if (totalPages <= 1) return;
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

const updateResultsCount = (total) => {
  if (resultsCount) {
    resultsCount.textContent = `${total} propiedades encontradas`;
  }
};

const updateView = () => {
  updateStateFromInputs();
  renderActiveChips();
  const filtered = sortItems(getFiltered());
  const start = (currentPage - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);
  renderCards(paged);
  renderPagination(filtered.length);
  renderMap(filtered);
  updateResultsCount(filtered.length);
};

const resetFilters = () => {
  Object.assign(state, defaultState);
  currentPage = 1;
  applyStateToInputs();
  updateView();
};

const resolveView = (view) => {
  if (view === 'list' && window.innerWidth > 960) {
    return 'split';
  }
  return view;
};

const setView = (view) => {
  if (!layout) return;
  layout.dataset.view = resolveView(view);
  viewToggleButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.viewToggle === view);
  });
  if (map) {
    setTimeout(() => map.invalidateSize(), 200);
  }
};

const init = async () => {
  if (cardsContainer) {
    AGPRender.renderSkeletons(cardsContainer, perPage);
  }
  try {
    propertiesData = await AGPData.fetchProperties();
  } catch (error) {
    if (cardsContainer) {
      cardsContainer.innerHTML = '<p>No pudimos cargar las propiedades. Intenta nuevamente en unos minutos.</p>';
    }
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const districtParam = params.get('district');
  if (districtParam) {
    state.district = districtParam;
  }

  applyStateToInputs();
  updateView();

  operationTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      state.operation = tab.dataset.value === 'all' ? '' : tab.dataset.value;
      currentPage = 1;
      applyStateToInputs();
      updateView();
    });
  });

  bedroomChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      state.bedrooms = chip.dataset.value;
      currentPage = 1;
      applyStateToInputs();
      updateView();
    });
  });

  if (filtersShell) {
    filtersShell.addEventListener('change', () => {
      currentPage = 1;
      updateView();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentPage = 1;
      updateView();
    });
  }

  if (moreFiltersBtn && advancedPanel) {
    moreFiltersBtn.addEventListener('click', () => {
      advancedPanel.classList.toggle('is-open');
      moreFiltersBtn.textContent = advancedPanel.classList.contains('is-open') ? 'Ocultar filtros' : 'Más filtros';
    });
  }

  if (priceToggleBtn && pricePanel) {
    priceToggleBtn.addEventListener('click', () => {
      pricePanel.classList.toggle('is-open');
      priceToggleBtn.classList.toggle('is-active');
      priceToggleBtn.setAttribute('aria-expanded', pricePanel.classList.contains('is-open').toString());
    });
  }

  viewToggleButtons.forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.viewToggle));
  });

  if (layout && !layout.dataset.view) {
    layout.dataset.view = 'split';
  }
  setView('list');
};

init();