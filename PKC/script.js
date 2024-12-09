navigator.geolocation.getCurrentPosition((position) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  // Inicializar el mapa centrado en la ubicación del usuario
  const mapa = L.map('map', {
      center: [lat, lon],
      zoom: 13,  // Puedes ajustar el nivel de zoom según lo que prefieras
      maxZoom: 19
  });

  // Añadir capa de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
  }).addTo(mapa);

  // Crear un icono personalizado para la ubicación del usuario
  const iconoUsuario = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/svgs/solid/map-marker-alt.svg',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
  });

  // Añadir el marcador para la ubicación del usuario
  const marcadorActual = L.marker([lat, lon], { icon: iconoUsuario }).addTo(mapa)
      .bindPopup('Tu ubicación')
      .openPopup();

  // Cargar datos PK y calcular el más cercano
  fetch("./PKCoordenas.json")
      .then(response => response.json())
      .then(data => {
          const puntosCercanos = calcularPKMasCercano(lat, lon, data);
          mostrarPKCercanos(puntosCercanos);
      });
});


// Función para calcular el PK más cercano
function calcularPKMasCercano(lat, lon, datosPK) {
  const puntosCercanos = [];
  datosPK.forEach(punto => {
      const distancia = calcularDistancia(lat, lon, punto.Latitud, punto.Longitud);
      puntosCercanos.push({ ...punto, distancia });
  });
  puntosCercanos.sort((a, b) => a.distancia - b.distancia);
  return puntosCercanos;
}

// Función para calcular la distancia entre dos puntos
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Distancia en metros
}

// Mostrar PK más cercanos en la interfaz
function mostrarPKCercanos(puntosCercanos) {
  const lista = document.getElementById('listaPKs');
  puntosCercanos.slice(0, 5).forEach(punto => {
      const li = document.createElement('li');
      li.textContent = `PK: ${punto.PK}, Distancia: ${punto.distancia.toFixed(2)} m`;
      lista.appendChild(li);
  });
}
