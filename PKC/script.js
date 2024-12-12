let mapa, marcadorActual, marcadorPK, iconoUsuario;
let centradoAutomaticamente = true; // Variable para saber si el mapa está centrado automáticamente

// Rastrear la posición continuamente con watchPosition
navigator.geolocation.watchPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    if (!mapa) {
        inicializarMapa(lat, lon);
    }

    if (centradoAutomaticamente) {
        actualizarPosicionUsuario(lat, lon);
    }

    fetch("./PKCoordenas.json")
        .then(response => response.json())
        .then(data => {
            const pkMasCercano = calcularPKMasCercano(lat, lon, data)[0];
            mostrarPKMasCercano(pkMasCercano);
            actualizarPosicionPK(pkMasCercano);
        })
        .catch(error => console.error('Error al cargar los datos de PK:', error));
}, 
(error) => console.error('Error al obtener ubicación:', error), {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000
});

function inicializarMapa(lat, lon) {
    mapa = L.map('map', {
        center: [lat, lon],
        zoom: 18,
        maxZoom: 19,
        attributionControl: false // Desactiva la atribución de Leaflet
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '', // Vacía la atribución de la capa del mapa
        maxZoom: 19
    }).addTo(mapa);

    iconoUsuario = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/1783/1783356.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    marcadorActual = L.marker([lat, lon], { icon: iconoUsuario }).addTo(mapa)
        .bindPopup('Mi Ubicación')
        .openPopup();

    // Detectar cuando el usuario mueve el mapa
    mapa.on('move', () => {
        centradoAutomaticamente = false; // Desactivamos el centrado automático cuando el usuario mueve el mapa
    });
}

function actualizarPosicionUsuario(lat, lon) {
    marcadorActual.setLatLng([lat, lon]);
    if (centradoAutomaticamente) {
        mapa.setView([lat, lon]); // Centrar el mapa solo si el centrado automático está activado
    }
}

function calcularPKMasCercano(lat, lon, data) {
    let puntosCercanos = data.map(pk => {
        const distancia = calcularDistancia(lat, lon, pk.Latitud, pk.Longitud);
        return { pk: pk.PK, latitud: pk.Latitud, longitud: pk.Longitud, distancia: distancia };
    });

    puntosCercanos.sort((a, b) => a.distancia - b.distancia);
    return puntosCercanos.slice(0, 1);
}

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

function mostrarPKMasCercano(pk) {
    const pkElement = document.getElementById("pkCercano");
    const distanciaElement = document.getElementById("distancia");
    const pkFormateado = formatearPK(pk.pk);
    pkElement.textContent = pkFormateado;
    distanciaElement.textContent = `${pk.distancia.toFixed(2)} metros`;
}

function actualizarPosicionPK(pk) {
    if (!marcadorPK) {
        marcadorPK = L.marker([pk.latitud, pk.longitud]).addTo(mapa)
            .bindPopup('PK más cercano')
            .openPopup();
    } else {
        marcadorPK.setLatLng([pk.latitud, pk.longitud]);
    }
}

function formatearPK(pk) {
    const pkStr = pk.toString();
    if (pkStr.length > 6) {
        return pkStr.slice(0, 3) + '+' + pkStr.slice(3, 6);
    } else if (pkStr.length === 6) {
        return pkStr.slice(0, 3) + '+' + pkStr.slice(3);
    } else {
        return pkStr;
    }
}

// Funcionalidad del botón "🔵 Centrar"
document.getElementById("actualizarUbicacion").addEventListener("click", () => {
    if (marcadorActual) {
        const { lat, lng } = marcadorActual.getLatLng(); // Obtener la ubicación actual del marcador
        mapa.setView([lat, lng], 18); // Centrar el mapa en la ubicación actual con zoom 18
        centradoAutomaticamente = true; // Reactivamos el centrado automático después de pulsar el botón
    } else {
        console.error("No se ha encontrado la ubicación actual del usuario.");
    }
});
