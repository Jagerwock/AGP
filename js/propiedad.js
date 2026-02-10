const detailContainer = document.querySelector('[data-property-detail]');
const similarContainer = document.querySelector('[data-similar]');
const modal = document.querySelector('[data-modal]');
const modalImg = document.querySelector('[data-modal-img]');
const WHATSAPP_NUMBER = '51XXXXXXXXX';

const getImageLabel = (property, index) => {
  const fallbackLabels = ['Fachada principal', 'Sala principal', 'Dormitorio principal', 'Cocina equipada', 'Terraza'];
  if (Array.isArray(property.imageLabels) && property.imageLabels[index]) {
    return property.imageLabels[index];
  }
  return fallbackLabels[index] || `Ambiente ${index + 1}`;
};

const initMap = (property) => {
  const mapContainer = document.querySelector('#propertyMap');
  if (!mapContainer) return;
  const lat = property.lat || -12.0464;
  const lng = property.lng || -77.0428;
  const pinLabel = encodeURIComponent(`${property.addressApprox}, ${property.district}`);
  mapContainer.innerHTML = `
    <iframe
      title="Mapa de ${property.title}"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      src="https://www.google.com/maps?q=${lat},${lng}%20(${pinLabel})&z=16&output=embed">
    </iframe>
  `;
};

const openModal = (src, alt) => {
  if (!modal || !modalImg) return;
  modalImg.src = src;
  modalImg.alt = alt;
  modal.classList.add('active');
};

const closeModal = () => {
  if (modal) modal.classList.remove('active');
};

if (modal) {
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target === modalImg) {
      closeModal();
    }
  });
}

const renderDetail = (property) => {
  if (!detailContainer) return;

  detailContainer.innerHTML = `
    <div class="property-detail-grid">
      <section class="card property-gallery">
        <div class="gallery">
          <div class="gallery-main">
          <button class="gallery-arrow gallery-arrow--left" type="button" data-gallery-prev aria-label="Imagen anterior">❮</button>
            <img src="${property.images[0]}" alt="${property.title}" loading="lazy" data-gallery-main />
            <button class="gallery-arrow gallery-arrow--right" type="button" data-gallery-next aria-label="Imagen siguiente">❯</button>
            <span class="gallery-caption" data-gallery-caption>${getImageLabel(property, 0)}</span>
          </div>
          <div class="gallery-thumbs">
            ${property.images
              .map(
                (img, index) =>
                  `<button type="button" class="gallery-thumb-btn ${index === 0 ? 'active' : ''}" data-thumb-index="${index}" data-thumb="${img}">
                    <img src="${img}" alt="${getImageLabel(property, index)}" loading="lazy" />
                  </button>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <aside class="property-aside">
        <div class="property-aside__sticky">
          <section class="card map-card" id="property-map">
            <h2>Ubicación en ${property.district}</h2>
            <p class="muted-text">${property.addressApprox}</p>
            <div class="map-wrapper" id="propertyMap"></div>
            <a class="btn btn-outline" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}">Abrir mapa completo</a>
          </section>
          <section class="card property-cta">
            <h3>Agenda tu visita</h3>
            <p class="muted-text">Coordina con nuestros asesores una visita personalizada.</p>
            <a class="btn btn-primary" href="contacto.html">Agendar visita</a>
            <a class="btn btn-outline" data-whatsapp-dynamic>WhatsApp</a>
          </section>
        </div>
      </aside>

      <section class="card property-details">
        <span class="badge">${property.operation}</span>
        <h1>${property.title}</h1>
        <p class="property-price">${AGPRender.formatPrice(property.pricePen)}</p>
        <p>${property.district} · ${property.addressApprox}</p>
        <div class="property-attributes">
          <div class="attribute-item"><svg class="icon" aria-hidden="true" fill="currentColor"><use href="#icon-bed"></use></svg>${property.bedrooms} dormitorios</div>
          <div class="attribute-item"><svg class="icon" aria-hidden="true" fill="currentColor"><use href="#icon-bath"></use></svg>${property.bathrooms} baños</div>
          <div class="attribute-item"><svg class="icon" aria-hidden="true" fill="currentColor"><use href="#icon-parking"></use></svg>${property.parking} estacionamientos</div>
          <div class="attribute-item"><svg class="icon" aria-hidden="true" fill="currentColor"><use href="#icon-area"></use></svg>${property.areaM2} m²</div>
          ${property.maintenance ? `<div class="attribute-item"><svg class="icon" aria-hidden="true" fill="currentColor"><use href="#icon-wallet"></use></svg>Mantenimiento S/ ${property.maintenance}</div>` : ''}
        </div>
        <p>${property.description}</p>
        <h2>Características</h2>
        <ul class="features-list">
          ${property.features
            .map(
              (feature) =>
                `<li><svg class="icon" aria-hidden="true" fill="currentColor"><use href="#icon-check"></use></svg><span>${feature}</span></li>`
            )
            .join('')}
        </ul>
      </section>
    </div>
  `;

  const thumbs = detailContainer.querySelectorAll('[data-thumb-index]');         
  const main = detailContainer.querySelector('[data-gallery-main]');
  const caption = detailContainer.querySelector('[data-gallery-caption]');
  const prevBtn = detailContainer.querySelector('[data-gallery-prev]');
  const nextBtn = detailContainer.querySelector('[data-gallery-next]');
  let currentIndex = 0;

  const setGalleryImage = (nextIndex) => {
    currentIndex = (nextIndex + property.images.length) % property.images.length;
    if (main) {
      main.src = property.images[currentIndex];
    }
    if (caption) {
      caption.textContent = getImageLabel(property, currentIndex);
    }
    thumbs.forEach((thumb) => {
      thumb.classList.toggle('active', parseInt(thumb.dataset.thumbIndex || '0', 10) === currentIndex);
    });
  };
  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const nextIndex = parseInt(thumb.dataset.thumbIndex || '0', 10);
      setGalleryImage(nextIndex);
    });
  });

  if (prevBtn) prevBtn.addEventListener('click', () => setGalleryImage(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => setGalleryImage(currentIndex + 1));

  if (main) {
    main.addEventListener('click', () => openModal(main.src, property.title));
  }

  initMap(property);
};

const getSimilarProperties = (properties, current) => {
  const typeFamilies = {
    Departamento: ['Departamento', 'Dúplex'],
    'Dúplex': ['Dúplex', 'Departamento'],
    Penthouse: ['Penthouse', 'Departamento'],
    Casa: ['Casa'],
    Oficina: ['Oficina'],
  };
  const similarTypes = typeFamilies[current.type] || [current.type];
  const candidates = properties.filter((item) => item.id !== current.id);

  const scored = candidates.map((item) => {
    const sameDistrict = item.district === current.district;
    const sameOperation = item.operation === current.operation;
    const similarType = similarTypes.includes(item.type);
    const priceDelta = Math.abs(item.pricePen - current.pricePen);
    const within = priceDelta / current.pricePen <= 0.15;
    let score = priceDelta;
    if (sameDistrict) score -= 500000;
    if (sameOperation) score -= 250000;
    if (similarType) score -= 150000;
    if (within) score -= 100000;
    return { item, score };
  });

  return scored
    .sort((a, b) => a.score - b.score)
    .map((entry) => entry.item)
    .slice(0, 6);
};

const renderSimilar = (items) => {
  if (!similarContainer) return;
  similarContainer.innerHTML = '';
  items.forEach((item) => {
    const card = AGPRender.createCardElement(item);
    similarContainer.appendChild(card);
  });
};

const init = async () => {
  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get('id');
  if (!propertyId) {
    if (detailContainer) {
      detailContainer.innerHTML = '<p>Propiedad no encontrada. Vuelve al listado principal.</p>';
    }
    return;
  }

  let properties = [];
  try {
    properties = await AGPData.fetchProperties();
  } catch (error) {
    if (detailContainer) {
      detailContainer.innerHTML = '<p>No pudimos cargar la propiedad. Intenta nuevamente en unos minutos.</p>';
    }
    return;
  }

  const property = properties.find((item) => item.id === propertyId);

  if (!property) {
    if (detailContainer) {
      detailContainer.innerHTML = '<p>Propiedad no encontrada. Vuelve al listado principal.</p>';
    }
    return;
  }

  renderDetail(property);
  const similar = getSimilarProperties(properties, property);
  renderSimilar(similar);

  const whatsappBtns = document.querySelectorAll('[data-whatsapp-dynamic]');
  if (whatsappBtns.length) {
    const message = encodeURIComponent(
      `Hola AGP Inmobiliaria, quiero información sobre: ${property.title} (ID: ${property.id}).`
    );
    whatsappBtns.forEach((whatsappBtn) => {
      whatsappBtn.setAttribute('href', `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`);
      whatsappBtn.setAttribute('target', '_blank');
      whatsappBtn.setAttribute('rel', 'noopener');
    });
  }
};

init();