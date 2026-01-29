const detailContainer = document.querySelector('[data-property-detail]');
const similarContainer = document.querySelector('[data-similar]');
const modal = document.querySelector('[data-modal]');
const modalImg = document.querySelector('[data-modal-img]');

const formatPrice = (price) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(price);

const formatUsd = (price, rate) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    price / rate
  );

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

const renderDetail = (property, usdRate) => {
  if (!detailContainer) return;

  detailContainer.innerHTML = `
    <section class="card">
      <div class="gallery">
        <div class="gallery-main">
          <img src="${property.images[0]}" alt="${property.title}" loading="lazy" data-gallery-main />
        </div>
        <div class="gallery-thumbs">
          ${property.images
            .map(
              (img) => `<img src="${img}" alt="${property.title}" loading="lazy" data-thumb="${img}" />`
            )
            .join('')}
        </div>
      </div>
    </section>
    <section class="card">
      <span class="badge">${property.operation}</span>
      <h1>${property.title}</h1>
      <p class="property-price">${formatPrice(property.price_soles)} <small>(USD ${formatUsd(
    property.price_soles,
    usdRate
  )})</small></p>
      <p>${property.district} · ${property.address}</p>
      <div class="tags">
        <span>${property.area_m2} m²</span>
        <span>${property.bedrooms} dormitorios</span>
        <span>${property.bathrooms} baños</span>
        <span>${property.parking} estacionamientos</span>
      </div>
      <p>${property.description}</p>
      <table class="table">
        ${property.features.map((feature) => `<tr><td>${feature}</td></tr>`).join('')}
      </table>
    </section>
    <section class="card">
      <h2>Ubicación en ${property.district}</h2>
      <div class="map-wrapper" id="propertyMap" style="min-height:320px"></div>
    </section>
  `;

  const thumbs = detailContainer.querySelectorAll('[data-thumb]');
  const main = detailContainer.querySelector('[data-gallery-main]');
  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      if (main) {
        main.src = thumb.dataset.thumb;
      }
      openModal(thumb.dataset.thumb, property.title);
    });
  });

  if (main) {
    main.addEventListener('click', () => openModal(main.src, property.title));
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
        <div>
          <span class="badge">${item.operation}</span>
          <h3>${item.title}</h3>
          <p class="property-price">${formatPrice(item.price_soles)}</p>
          <p>${item.district}</p>
        </div>
        <a class="btn btn-outline" href="propiedad.html?id=${item.id}">Ver detalle</a>
      `;
      similarContainer.appendChild(card);
    });
};

const init = async () => {
  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get('id');
  const response = await fetch('data/properties.json');
  const json = await response.json();
  const usdRate = json.usd_rate || 3.75;
  const property = json.properties.find((item) => item.id === propertyId);

  if (!property) {
    if (detailContainer) {
      detailContainer.innerHTML = '<p>Propiedad no encontrada. Vuelve al listado.</p>';
    }
    return;
  }

  renderDetail(property, usdRate);
  const similar = json.properties.filter((item) => item.district === property.district || item.type === property.type);
  renderSimilar(similar, property.id);

  const whatsappBtn = document.querySelector('[data-whatsapp-message]');
  if (whatsappBtn) {
    const message = encodeURIComponent(`Hola AGP Inmobiliaria, me interesa la propiedad ${property.title} (${property.id}).`);
    whatsappBtn.setAttribute('href', `https://wa.me/51999999999?text=${message}`);
  }
};

init();