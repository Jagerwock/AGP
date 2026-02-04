window.AGPData = (() => {
  const getBasePath = () => `${window.location.origin}/AGP/`;

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

  return { getBasePath, fetchProperties };
})();