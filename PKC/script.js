// Función para actualizar la ubicación y el PK más cercano
document.getElementById('actualizarUbicacion').addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Inicializar el mapa centrado en la nueva ubicación del usuario
        const mapa = L.map('map', {
            center: [lat, lon],
            zoom: 13,
            maxZoom: 19
        });

        // Capa de satélite de Esri
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri, Maxar, GeoIQ, USGS, FAO, NPS, NRCAN, GeoBase, NOAA, and contributors'
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
