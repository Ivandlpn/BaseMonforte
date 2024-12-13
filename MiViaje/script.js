let mapa, marcadorTren, iconoTren;

// Cargar las coordenadas desde PKCoordenas.json
async function dibujarVia() {
            try {
                const respuesta = await fetch('PKCoordenas.json');
                const data = await respuesta.json();

                const trazadoVia = data.map(pk => [pk.Latitud, pk.Longitud]);

                L.polyline(trazadoVia, {
                    color: 'red',
                    weight: 5,
                    opacity: 0.7,
                }).addTo(mapa);
            } catch (error) {
                console.error("Error al cargar el trazado:", error);
            }
        }

// Llamar a la función después de inicializar el mapa
function inicializarMapa(lat, lon) {
    mapa = L.map('map').setView([lat, lon], 16);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
    }).addTo(mapa);

    const iconoTren = L.icon({
        iconUrl: 'img/MarcadorTren.png',
        iconSize: [80, 80],
        iconAnchor: [40, 80]
    });

    marcador = L.marker([lat, lon], { icon: iconoTren }).addTo(mapa);

    // Llamar al trazado de la vía
    dibujarVia();
}


// Inicializar el mapa
function inicializarMapa(lat, lon) {
    mapa = L.map('map', {
        center: [lat, lon],
        zoom: 16,
        attributionControl: false // Desactiva el texto de atribución
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
    }).addTo(mapa);

iconoTren = L.icon({
    iconUrl: 'img/MarcadorTren.png', // Ruta a la imagen local
    iconSize: [80, 80],
    iconAnchor: [40, 40]
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
            lat,
            lon
        );
        const tiempo = (ahora - ultimaHora) / 1000; // Segundos
        const velocidad = (distancia / tiempo) * 3.6; // m/s a km/h

        document.getElementById('velocidad').textContent = `${velocidad.toFixed(0)} Km/h`; // Sin decimales

    }

    ultimaPosicion = { lat, lon };
    ultimaHora = ahora;
}

// Calcular distancia entre dos coordenadas (Haversine)
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

// Obtener el PK más cercano
async function obtenerPK(lat, lon) {
    try {
        const respuesta = await fetch('./PKCoordenas.json');
        const data = await respuesta.json();

        let pkMasCercano = data.reduce((masCercano, pk) => {
            const distancia = calcularDistancia(lat, lon, pk.Latitud, pk.Longitud);
            return distancia < masCercano.distancia ? { pk: pk.PK, distancia } : masCercano;
        }, { pk: null, distancia: Infinity });

        const pkFormateado = formatearPK(pkMasCercano.pk);
        document.getElementById('pk').textContent = pkFormateado;
    } catch (error) {
        console.error('Error al obtener el PK más cercano:', error);
    }
}

function formatearPK(pk) {
    const pkStr = pk.toString().padStart(6, "0"); // Asegura que tenga 6 dígitos
    return `${pkStr.slice(0, 3)}+${pkStr.slice(3)}`; // Formato XXX+XXX
}


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
        obtenerLugar(lat, lon); // Actualiza el lugar dinámicamente
    },
    (error) => console.error('Error al obtener la ubicación:', error),
    { enableHighAccuracy: true, maximumAge: 0 }
);


async function obtenerLugar(lat, lon) {
    try {
        const respuesta = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await respuesta.json();

        const municipio = data.address.city || data.address.town || data.address.village || "Desconocido";
        const provincia = data.address.state || "Desconocido";

       document.getElementById('lugar').textContent = `${municipio}`;

    } catch (error) {
        console.error("Error al obtener el lugar:", error);
        document.getElementById('lugar').textContent = "Lugar: Desconocido";
    }
}

