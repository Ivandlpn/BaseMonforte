let mapa, marcadorTren, iconoTren;

// Inicializar el mapa
function inicializarMapa(lat, lon) {
    mapa = L.map('map', {
        center: [lat, lon],
        zoom: 16,
        attributionControl: false
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
    }).addTo(mapa);

    iconoTren = L.icon({
        iconUrl: 'img/MarcadorTren.png',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    marcadorTren = L.marker([lat, lon], { icon: iconoTren }).addTo(mapa);
}

// Actualizar la posición del tren en el mapa
function actualizarPosicion(lat, lon) {
    marcadorTren.setLatLng([lat, lon]);
    mapa.setView([lat, lon], 16);
}

// Calcular velocidad en km/h
let ultimaPosicion = null;
let ultimaHora = null;

function calcularVelocidad(lat, lon) {
    const ahora = Date.now();

    if (ultimaPosicion && ultimaHora) {
        const distancia = calcularDistancia(
            ultimaPosicion.lat,
            ultimaPosicion.lon,
            lat, lon
        );
        const tiempo = (ahora - ultimaHora) / 1000;
        const velocidad = (distancia / tiempo) * 3.6;

        document.getElementById('velocidad').textContent = velocidad.toFixed(1);
    }

    ultimaPosicion = { lat, lon };
    ultimaHora = ahora;
}

// Calcular distancia entre dos coordenadas (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371000;
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

// Obtener el PK más cercano
async function obtenerPK(lat, lon) {
    try {
        const respuesta = await fetch('./PKCoordenas.json');
        const data = await respuesta.json();

        let pkMasCercano = data.reduce((masCercano, pk) => {
            const distancia = calcularDistancia(lat, lon, pk.Latitud, pk.Longitud);
            return distancia < masCercano.distancia ? { pk: pk.PK, distancia } : masCercano;
        }, { pk: null, distancia: Infinity });

        document.getElementById('pk').textContent = pkMasCercano.pk;
    } catch (error) {
        console.error('Error al obtener el PK más cercano:', error);
    }
}

// Rastreo en tiempo real
navigator.geolocation.watchPosition(
    (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        if (!mapa) {
            inicializarMapa(lat, lon);
        }

        actualizarPosicion(lat, lon);
        calcularVelocidad(lat, lon);
        obtenerPK(lat, lon);
    },
    (error) => console.error('Error al obtener la ubicación:', error),
    { enableHighAccuracy: true, maximumAge: 0 }
);
