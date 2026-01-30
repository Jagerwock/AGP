const detailContainer = document.querySelector('[data-property-detail]');
const similarContainer = document.querySelector('[data-similar]');
const modal = document.querySelector('[data-modal]');
const modalImg = document.querySelector('[data-modal-img]');
const WHATSAPP_NUMBER = '51XXXXXXXXX';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(price);

const initMap = (property) => {
  const map = L.map('propertyMap', { scrollWheelZoom: false }).setView([property.lat, property.lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);
  L.marker([property.lat, property.lng]).addTo(map).bindPopup(property.title).openPopup();
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
    <section class="card property-gallery">
      <div class="gallery">
        <div class="gallery-main">
          <img src="${property.images[0]}" alt="${property.title}" loading="lazy" data-gallery-main />
        </div>
        <div class="gallery-thumbs">
          ${property.images
            .map(
              (img, index) =>
                `<img src="${img}" alt="${property.title}" loading="lazy" data-thumb="${img}" class="${index === 0 ? 'active' : ''}" />`
            )
            .join('')}
        </div>
      </div>
      <button class="btn btn-outline map-scroll" type="button" data-map-scroll>Ver mapa</button>
    </section>
    <section class="card property-details">
      <span class="badge">${property.operation}</span>
      <h1>${property.title}</h1>
      <p class="property-price">${formatPrice(property.pricePen)}</p>
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
    <aside class="property-aside">
      <div class="property-aside__sticky">
        <section class="card map-card" id="property-map">
          <h2>Ubicación en ${property.district}</h2>
          <div class="map-wrapper" id="propertyMap"></div>
        </section>
        <section class="card property-cta">
          <h3>Agenda tu visita</h3>
          <p class="muted-text">Coordina con nuestros asesores una visita personalizada.</p>
          <a class="btn btn-primary" href="contacto.html">Agendar visita</a>
          <a class="btn btn-outline" data-whatsapp-dynamic>WhatsApp</a>
        </section>
      </div>
    </aside>
  `;

  const thumbs = detailContainer.querySelectorAll('[data-thumb]');
  const main = detailContainer.querySelector('[data-gallery-main]');
  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach((item) => item.classList.remove('active'));
      thumb.classList.add('active');
      if (main) {
        main.src = thumb.dataset.thumb;
      }
    });
    thumb.addEventListener('dblclick', () => openModal(thumb.dataset.thumb, property.title));
  });

  if (main) {
    main.addEventListener('click', () => openModal(main.src, property.title));
  }

  const mapScrollBtn = detailContainer.querySelector('[data-map-scroll]');
  if (mapScrollBtn) {
    mapScrollBtn.addEventListener('click', () => {
      const mapTarget = document.querySelector('#property-map');
      if (mapTarget) {
        mapTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  initMap(property);
};

const renderSimilar = (properties, currentId) => {
  if (!similarContainer) return;
  similarContainer.innerHTML = '';
  properties
    .filter((item) => item.id !== currentId)
    .slice(0, 3)
    .forEach((item) => {
      const card = document.createElement('article');
      card.className = 'property-card';
      card.innerHTML = `
        <img src="${item.images[0]}" alt="${item.title}" loading="lazy" />
        <div class="property-body">
          <span class="badge">${item.operation}</span>
          <h3>${item.title}</h3>
          <p class="property-price">${formatPrice(item.pricePen)}</p>
          <p>${item.district}</p>
        </div>
        <div class="card-actions">
          <a class="btn btn-outline" href="propiedad.html?id=${item.id}">Ver detalle</a>
          <span class="badge">${item.type}</span>
        </div>
      `;
      similarContainer.appendChild(card);
    });
};

const init = async () => {
  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get('id');
  const response = await fetch('data/properties.json');
  const json = await response.json();
  const property = json.properties.find((item) => item.id === propertyId);

  if (!property) {
    if (detailContainer) {
      detailContainer.innerHTML = '<p>Propiedad no encontrada. Vuelve al listado principal.</p>';
    }
    return;
  }

  renderDetail(property);
  const similar = json.properties.filter((item) => item.district === property.district || item.type === property.type);
  renderSimilar(similar, property.id);

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