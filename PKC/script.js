navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Inicializar el mapa centrado en la ubicación del usuario
    const mapa = L.map('map', {
        center: [lat, lon],
        zoom: 13,
        maxZoom: 19
    });

    // Capa de satélite de Esri (sin necesidad de API Key)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: ''
    }).addTo(mapa);

    // Crear un icono personalizado para la ubicación del usuario
    const iconoUsuario = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/1783/1783356.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    // Añadir el marcador para la ubicación del usuario
    const marcadorActual = L.marker([lat, lon], { icon: iconoUsuario }).addTo(mapa)
        .bindPopup('Mi Ubicación')
        .openPopup();

    // Cargar datos PK y calcular el más cercano
    fetch("./PKCoordenas.json")
        .then(response => response.json())
        .then(data => {
            const puntosCercanos = calcularPKMasCercano(lat, lon, data);
            const pkMasCercano = puntosCercanos[0]; // Obtener solo el más cercano

            // Mostrar en la tarjeta
            mostrarPKMasCercano(pkMasCercano);

            // Añadir marcador para el PK más cercano en el mapa
            const marcadorPK = L.marker([pkMasCercano.latitud, pkMasCercano.longitud]).addTo(mapa)
                .bindPopup('PK más cercano')
                .openPopup();
        });
});

// Función para calcular el PK más cercano
function calcularPKMasCercano(lat, lon, data) {
    let puntosCercanos = data.map(pk => {
        const distancia = calcularDistancia(lat, lon, pk.Latitud, pk.Longitud);
        return { pk: pk.PK, latitud: pk.Latitud, longitud: pk.Longitud, distancia: distancia };
    });

    // Ordenar los PKs por distancia más cercana y devolver el más cercano
    puntosCercanos.sort((a, b) => a.distancia - b.distancia);
    return puntosCercanos.slice(0, 1);
}

// Función para calcular la distancia entre dos puntos
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Función para formatear el PK en formato XXX+XXX
function formatearPK(pk) {
    const pkStr = pk.toString();
    if (pkStr.length > 6) {
        return pkStr.slice(0, 3) + '+' + pkStr.slice(3, 6); // Aseguramos un formato consistente
    } else if (pkStr.length === 6) {
        return pkStr.slice(0, 3) + '+' + pkStr.slice(3); // Formato normal
    } else {
        return pkStr; // Si no tiene 6 dígitos, se devuelve tal cual
    }
}

// Función para mostrar el PK más cercano en la tarjeta
function mostrarPKMasCercano(pk) {
    const pkElement = document.getElementById("pkCercano");
    const distanciaElement = document.getElementById("distancia");

    // Formatear el PK al formato XXX+XXX
    const pkFormateado = formatearPK(pk.pk);

    // Actualizamos los valores dinámicamente
    pkElement.textContent = pkFormateado;
    distanciaElement.textContent = `${pk.distancia.toFixed(2)} metros`;
}
