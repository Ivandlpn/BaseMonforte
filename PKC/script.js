navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Inicializar el mapa centrado en la ubicación del usuario
    const mapa = L.map('map', {
        center: [lat, lon],
        zoom: 13,  // Ajusta el nivel de zoom si es necesario
        maxZoom: 19
    });

    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
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

            // Mostrar en la lista solo el PK más cercano
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
    return puntosCercanos.slice(0, 1); // Retornar solo el más cercano
}

// Función para calcular la distancia entre dos puntos geográficos en metros
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180; // Latitud en radianes
    const φ2 = lat2 * Math.PI / 180; // Latitud en radianes
    const Δφ = (lat2 - lat1) * Math.PI / 180; // Diferencia de latitudes
    const Δλ = (lon2 - lon1) * Math.PI / 180; // Diferencia de longitudes

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
}

// Función para formatear el PK en formato XXX+XXX
function formatearPK(pk) {
    const pkStr = pk.toString();
    if (pkStr.includes('+')) {
        return pkStr; // Ya está en el formato correcto
    }

    // Si el PK no tiene el formato XXX+XXX, lo convertimos
    const longitud = pkStr.length;
    if (longitud >= 6) {
        return pkStr.slice(0, 3) + '+' + pkStr.slice(3);
    } else {
        return pkStr; // No se puede formatear si el PK no es suficientemente largo
    }
}

// Función para mostrar el PK más cercano en la lista
function mostrarPKMasCercano(pk) {
    const lista = document.getElementById("listaPKs");
    lista.innerHTML = ''; // Limpiar lista anterior

    // Crear un nuevo item en la lista con la información del PK
    const item = document.createElement('li');
    const pkFormateado = formatearPK(pk.pk);  // Aplicar el formato XXX+XXX
    item.innerHTML = `PK más cercano: <strong>${pkFormateado}</strong><br>Distancia: <strong>${(pk.distancia).toFixed(2)} metros</strong>`;
    lista.appendChild(item);
}
