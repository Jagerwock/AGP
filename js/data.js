window.AGPData = (() => {
  const ADMIN_STORAGE_KEY = 'agp-admin-properties';
  const ADMIN_SESSION_KEY = 'agp-admin-session';

  const ADMIN_USERS = [
    { id: 'admin@agp.com', name: 'Administrador Principal', pin: 'AGP2026' },
    { id: 'contenido@agp.com', name: 'Editor de Contenido', pin: 'CONTENIDO2026' },
  ];

  const getBasePath = () => `${window.location.origin}/AGP/`;

  const normalizeText = (value = '') => value.trim().toLowerCase();

  const normalizeProperty = (property) => {
    const parsedImages = Array.isArray(property.images) && property.images.length ? property.images : [];
    const fallbackImage = 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80';
    return {
      ...property,
      id: property.id || `adm-${Date.now()}`,
      title: property.title || 'Departamento sin título',
      district: property.district || 'Miraflores',
      operation: property.operation || 'Venta',
      type: property.type || 'Departamento',
      pricePen: Number(property.pricePen) || 0,
      bedrooms: Number(property.bedrooms) || 0,
      bathrooms: Number(property.bathrooms) || 0,
      parking: Number(property.parking) || 0,
      areaM2: Number(property.areaM2) || 0,
      maintenance: Number(property.maintenance) || 0,
      addressApprox: property.addressApprox || 'Ubicación referencial pendiente',
      lat: Number(property.lat) || -12.097,
      lng: Number(property.lng) || -77.037,
      description: property.description || 'Sin descripción.',
      features: Array.isArray(property.features) ? property.features : [],
      images: parsedImages.length ? parsedImages : [fallbackImage],
      imageLabels: Array.isArray(property.imageLabels) ? property.imageLabels : [],
      source: property.source || 'admin',
    };
  };

  const fetchProperties = async () => {
    const primaryUrl = `${getBasePath()}data/properties.json`;
    try {
      const response = await fetch(primaryUrl);
      if (!response.ok) {
        throw new Error(`Error al cargar data: ${response.status}`);
      }
      const json = await response.json();
      return json.properties || [];
    } catch (error) {
      const response = await fetch('data/properties.json');
      if (!response.ok) {
        throw error;
      }
      const json = await response.json();
      return json.properties || [];
    }
  };

  const getAdminProperties = () => {
    try {
      const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeProperty);
    } catch (error) {
      return [];
    }
  };

  const saveAdminProperty = (property) => {
    const normalized = normalizeProperty(property);
    const current = getAdminProperties();
    current.unshift(normalized);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(current));
    return normalized;
  };

  const fetchAllProperties = async () => {
    const base = await fetchProperties();
    const admin = getAdminProperties();
    const merged = [...admin, ...base];
    const seen = new Set();
    return merged.filter((property) => {
      if (seen.has(property.id)) return false;
      seen.add(property.id);
      return true;
    });
  };

  const authenticateAdmin = ({ identifier, pin }) => {
    const normalizedId = normalizeText(identifier);
    const normalizedPin = (pin || '').trim();
    const match = ADMIN_USERS.find(
      (user) => normalizeText(user.id) === normalizedId && user.pin === normalizedPin
    );
    if (!match) return false;
    sessionStorage.setItem(ADMIN_SESSION_KEY, match.id);
    return true;
  };

  const isAdminSessionActive = () => {
    const current = normalizeText(sessionStorage.getItem(ADMIN_SESSION_KEY) || '');
    return ADMIN_USERS.some((user) => normalizeText(user.id) === current);
  };

  const adminUsersList = () => ADMIN_USERS.map(({ id, name }) => ({ id, name }));

  const logoutAdmin = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  };

  return {
    getBasePath,
    fetchProperties,
    fetchAllProperties,
    getAdminProperties,
    saveAdminProperty,
    adminUsersList,
    authenticateAdmin,
    isAdminSessionActive,
    logoutAdmin,
  };
})();