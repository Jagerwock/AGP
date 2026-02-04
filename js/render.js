window.AGPRender = (() => {
  const formatPrice = (price) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(price);

  const createCardElement = (property) => {
    const card = document.createElement('article');
    card.className = 'property-card';
    card.dataset.cardId = property.id;
    card.innerHTML = `
      <img src="${property.images[0]}" alt="${property.title}" loading="lazy" />
      <div class="property-body">
        <span class="badge">${property.operation}</span>
        <h3>${property.title}</h3>
        <p class="property-price">${formatPrice(property.pricePen)}</p>
        <p>${property.district} · ${property.addressApprox || ''}</p>
        <div class="property-meta">
          <span><svg class="icon" aria-hidden="true" fill="currentColor"><use href="#icon-area"></use></svg>${property.areaM2} m²</span>
          <span><svg class="icon" aria-hidden="true" fill="currentColor"><use href="#icon-bed"></use></svg>${property.bedrooms} dorm.</span>
          <span><svg class="icon" aria-hidden="true" fill="currentColor"><use href="#icon-bath"></use></svg>${property.bathrooms} baños</span>
          <span><svg class="icon" aria-hidden="true" fill="currentColor"><use href="#icon-parking"></use></svg>${property.parking} est.</span>
        </div>
      </div>
      <div class="card-actions">
        <a class="btn btn-outline" href="propiedad.html?id=${property.id}">Ver detalle</a>
        <span class="badge">${property.type}</span>
      </div>
    `;
    return card;
  };

  const renderSkeletons = (container, count = 6) => {
    if (!container) return;
    container.innerHTML = '';
    for (let index = 0; index < count; index += 1) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-card';
      container.appendChild(skeleton);
    }
  };

  const renderEmptyState = (container, onClear) => {
    if (!container) return;
    container.innerHTML = `
      <div class="empty-state">
        <h3>No encontramos propiedades con esos filtros.</h3>
        <p>Prueba ajustar los rangos o limpiar filtros para ver más opciones.</p>
        <button class="btn btn-primary" type="button" data-clear-filters>Limpiar filtros</button>
      </div>
    `;
    const button = container.querySelector('[data-clear-filters]');
    if (button && onClear) {
      button.addEventListener('click', onClear);
    }
  };

  return { formatPrice, createCardElement, renderSkeletons, renderEmptyState };
})();