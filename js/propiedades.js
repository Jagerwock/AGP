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
const moreFiltersBtn = document.querySelector('[data-more-filters]');
const pricePanel = document.querySelector('[data-price-panel]');
const sortSelect = document.querySelector('[data-sort]');

const operationTabs = document.querySelectorAll('[data-operation-tab]');
const viewToggleButtons = document.querySelectorAll('[data-view-toggle]');
const bedroomChips = document.querySelectorAll('[data-bedrooms]');
const priceToggleBtn = document.querySelector('[data-price-toggle]');

const districtSelect = document.querySelector('[name="district"]');
const typeSelect = document.querySelector('[name="type"]');
const bathroomsSelect = document.querySelector('[name="bathrooms"]');
const minAreaInput = document.querySelector('[name="minArea"]');
const minPriceInput = document.querySelector('[name="minPrice"]');
const maxPriceInput = document.querySelector('[name="maxPrice"]');

const adminAccessButton = document.querySelector('[data-admin-access-btn]');
const adminPanel = document.querySelector('[data-admin-panel]');
const adminForm = document.querySelector('[data-admin-form]');
const adminLogoutButton = document.querySelector('[data-admin-logout]');
const heroEyebrow = document.querySelector('[data-hero-eyebrow]');
const introTitle = document.querySelector('[data-intro-title]');
const introCopy = document.querySelector('[data-intro-copy]');

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

const notify = (message) => {
  if (typeof showToast === 'function') {
    showToast(message);
    return;
  }
  window.alert(message);
};

const ensureDistrictOptions = () => {
  if (!districtSelect) return;
  const currentOptions = new Set(Array.from(districtSelect.options).map((option) => option.value || option.textContent));
  propertiesData.forEach((property) => {
    const district = property.district;
    if (!district || currentOptions.has(district)) return;
    const option = document.createElement('option');
    option.value = district;
    option.textContent = district;
    districtSelect.appendChild(option);
    currentOptions.add(district);
  });
};

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
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  currentPage = Math.min(currentPage, totalPages);
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

const resolveView = (view) => view;

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

const promptAdminAccess = () => {
  const identifier = window.prompt('Usuario administrador (correo autorizado):');
  if (!identifier) return false;
  const pin = window.prompt('Clave de acceso:');
  if (!pin) return false;
  const allowed = AGPData.authenticateAdmin({ identifier, pin });
  if (!allowed) {
    notify('Acceso denegado. Este usuario no está habilitado para administrar.');
    return false;
  }
  notify('Acceso administrador habilitado.');
  return true;
};

const setAdminHeroMode = (isAdmin) => {
  document.body.classList.toggle('admin-mode', isAdmin);
  if (heroEyebrow) {
    heroEyebrow.textContent = isAdmin ? 'Modo administrador' : '';
  }
  if (introTitle) {
    introTitle.textContent = 'Encuentra tu próxima propiedad en Lima';
  }
  if (introCopy) {
    introCopy.textContent = isAdmin
      ? 'Accede a inmuebles seleccionados en los distritos de mayor demanda y administra el catálogo con validaciones guiadas.'
      : 'Accede a inmuebles seleccionados en los distritos de mayor demanda.';
  }
};

const setAdminVisibility = (isVisible) => {
  if (adminAccessButton) {
    adminAccessButton.hidden = !isVisible;
  }
  setAdminHeroMode(isVisible);
  if (!isVisible && adminPanel) {
    adminPanel.hidden = true;
  }
};

const buildAdminPropertyFromForm = (formData) => {
  const lines = (key) =>
    (formData.get(key) || '')
      .toString()
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

  return {
    id: `adm-${Date.now()}`,
    title: (formData.get('title') || '').toString().trim(),
    district: (formData.get('district') || '').toString().trim(),
    operation: (formData.get('operation') || 'Venta').toString(),
    type: 'Departamento',
    pricePen: Number(formData.get('pricePen') || 0),
    bedrooms: Number(formData.get('bedrooms') || 0),
    bathrooms: Number(formData.get('bathrooms') || 0),
    parking: Number(formData.get('parking') || 0),
    areaM2: Number(formData.get('areaM2') || 0),
    maintenance: Number(formData.get('maintenance') || 0),
    addressApprox: (formData.get('addressApprox') || '').toString().trim(),
    lat: Number(formData.get('lat') || -12.097),
    lng: Number(formData.get('lng') || -77.037),
    description: (formData.get('description') || '').toString().trim(),
    images: lines('images'),
    features: lines('features'),
    imageLabels: lines('images').map((_, index) => `Foto ${index + 1}`),
    source: 'admin',
  };
};

const validateAdminProperty = (property) => {
  if (property.title.length < 5) return 'El título debe tener al menos 5 caracteres.';
  if (property.description.length < 24) return 'La descripción debe tener al menos 24 caracteres.';
  if (property.pricePen < 10000) return 'El precio debe ser mayor o igual a S/ 10,000.';
  if (property.areaM2 < 30) return 'El área mínima debe ser de 30 m².';
  if (property.bedrooms < 1 || property.bathrooms < 1) return 'Dormitorios y baños deben ser al menos 1.';
  if (property.lat > -11 || property.lat < -13 || property.lng > -76 || property.lng < -78) {
    return 'Las coordenadas deben corresponder a Lima Metropolitana.';
  }
  if (!property.images.length) return 'Ingresa al menos una URL de imagen.';
  const hasInvalidImage = property.images.some((url) => !/^https?:\/\//i.test(url));
  if (hasInvalidImage) return 'Todas las imágenes deben iniciar con http:// o https://';
  if (!property.features.length) return 'Ingresa al menos una característica.';
  return '';
};

const initAdminMode = () => {
  setAdminHeroMode(false);
  const enableAdmin = () => {
    setAdminVisibility(true);
    if (adminPanel) {
      adminPanel.hidden = false;
      adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const canViewAdmin = AGPData.isAdminSessionActive();
  setAdminVisibility(canViewAdmin);

  if (adminAccessButton) {
    adminAccessButton.addEventListener('click', () => {
      if (!AGPData.isAdminSessionActive()) {
        const granted = promptAdminAccess();
        if (!granted) return;
        setAdminVisibility(true);
      }
      if (adminPanel) {
        adminPanel.hidden = !adminPanel.hidden;
      }
    });
  }

  if (adminLogoutButton) {
    adminLogoutButton.addEventListener('click', () => {
      AGPData.logoutAdmin();
      setAdminVisibility(false);
      notify('Sesión de administrador cerrada.');
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      if (AGPData.isAdminSessionActive()) {
        enableAdmin();
        return;
      }
      const granted = promptAdminAccess();
      if (granted) {
        enableAdmin();
      }
    }
  });

  if (adminForm) {
    adminForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!AGPData.isAdminSessionActive()) {
        notify('Tu sesión de administrador expiró. Vuelve a iniciar sesión.');
        return;
      }
      const formData = new FormData(adminForm);
      const newProperty = buildAdminPropertyFromForm(formData);
      const validationMessage = validateAdminProperty(newProperty);
      if (validationMessage) {
        notify(validationMessage);
        return;
      }
      AGPData.saveAdminProperty(newProperty);
      propertiesData = await AGPData.fetchAllProperties();
      ensureDistrictOptions();
      if (!state.district) {
        state.type = 'Departamento';
      }
      currentPage = 1;
      applyStateToInputs();
      updateView();
      adminForm.reset();
      notify('Departamento agregado correctamente.');
    });
  }
};

const init = async () => {
  if (cardsContainer) {
    AGPRender.renderSkeletons(cardsContainer, perPage);
  }
  try {
    propertiesData = await AGPData.fetchAllProperties();
  } catch (error) {
    if (cardsContainer) {
      cardsContainer.innerHTML = '<p>No pudimos cargar las propiedades. Intenta nuevamente en unos minutos.</p>';
    }
    return;
  }

  ensureDistrictOptions();

  const params = new URLSearchParams(window.location.search);
  const districtParam = params.get('district');
  const typeParam = params.get('type');
  if (districtParam) {
    state.district = districtParam;
  }

  if (typeParam) {
    state.type = typeParam;
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
    moreFiltersBtn.setAttribute('aria-expanded', advancedPanel.classList.contains('is-open').toString());
    moreFiltersBtn.addEventListener('click', () => {
      advancedPanel.classList.toggle('is-open');
      const isOpen = advancedPanel.classList.contains('is-open');
      moreFiltersBtn.setAttribute('aria-expanded', isOpen.toString());
      moreFiltersBtn.textContent = isOpen ? 'Quitar filtros' : 'Más filtros';
    });
  }

  viewToggleButtons.forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.viewToggle));
  });

  if (layout && !layout.dataset.view) {
    layout.dataset.view = 'list';
  }
  setView('list');
  initAdminMode();
};

init();