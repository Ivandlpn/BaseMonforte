let mapa, marcadorActual, marcadorPK, iconoUsuario;

// Rastrear la posición continuamente con watchPosition
navigator.geolocation.watchPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Si el mapa no está inicializado, crearlo
    if (!mapa) {
        inicializarMapa(lat, lon);
    }

    // Actualizar marcador de ubicación del usuario
    actualizarPosicionUsuario(lat, lon);

    // Recalcular y actualizar el PK más cercano
    fetch("./PKCoordenas.json")
        .then(response => response.json())
        .then(data => {
            const pkMasCercano = calcularPKMasCercano(lat, lon, data)[0]; // Solo el más cercano
            mostrarPKMasCercano(pkMasCercano);
            actualizarPosicionPK(pkMasCercano);
        })
        .catch(error => console.error('Error al cargar los datos de PK:', error));
}, 
(error) => console.error('Error al obtener ubicación:', error), {
    enableHighAccuracy: true, // Usar alta precisión para movimientos pequeños
    maximumAge: 0,            // No usar datos en caché
    timeout: 10000            // Tiempo de espera razonable
});

// Función para inicializar el mapa con la capa de satélite de ESRI
function inicializarMapa(lat, lon) {
    mapa = L.map('map', {
        center: [lat, lon],
        zoom: 18,
        maxZoom: 19
    });

    // Añadir capa de satélite ESRI World Imagery (gratuito sin registro)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© ESRI, © OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(mapa);

    // Crear el icono personalizado del usuario
    iconoUsuario = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/1783/1783356.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    // Añadir marcador inicial del usuario
    marcadorActual = L.marker([lat, lon], { icon: iconoUsuario }).addTo(mapa)
        .bindPopup('Mi Ubicación')
        .openPopup();
}

// Función para actualizar la posición del usuario
function actualizarPosicionUsuario(lat, lon) {
    marcadorActual.setLatLng([lat, lon]);
    mapa.setView([lat, lon]); // Centrar el mapa en la nueva ubicación
}

// Función para calcular el PK más cercano
function calcularPKMasCercano(lat, lon, data) {
    let puntosCercanos = data.map(pk => {
        const distancia = calcularDistancia(lat, lon, pk.Latitud, pk.Longitud);
        return { pk: pk.PK, latitud: pk.Latitud, longitud: pk.Longitud, distancia: distancia };
    });

    // Ordenar los PKs por distancia y devolver el más cercano
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

// Función para actualizar la posición del PK más cercano
function actualizarPosicionPK(pk) {
    if (!marcadorPK) {
        marcadorPK = L.marker([pk.latitud, pk.longitud]).addTo(mapa)
            .bindPopup('PK más cercano')
            .openPopup();
    } else {
        marcadorPK.setLatLng([pk.latitud, pk.longitud]);
    }
}

// Función para formatear el PK en formato XXX+XXX
function formatearPK(pk) {
    const pkStr = pk.toString();
    if (pkStr.length > 6) {
        return pkStr.slice(0, 3) + '+' + pkStr.slice(3, 6);
    } else if (pkStr.length === 6) {
        return pkStr.slice(0, 3) + '+' + pkStr.slice(3);
    } else {
        return pkStr; // Si no tiene 6 dígitos, se devuelve tal cual
    }
}

// Funcionalidad del botón "Actualizar ubicación"
document.getElementById("actualizarUbicacion").addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Actualizar el mapa y la ubicación
        actualizarPosicionUsuario(lat, lon);
        
        // Recargar el PK más cercano
        fetch("./PKCoordenas.json")
            .then(response => response.json())
            .then(data => {
                const pkMasCercano = calcularPKMasCercano(lat, lon, data)[0]; // Solo el más cercano
                mostrarPKMasCercano(pkMasCercano);
                actualizarPosicionPK(pkMasCercano);
            });
    });
});
