let mapa, marcadorActual, marcadorPK, iconoUsuario;

// Archivos JSON
const archivos = [
    "ALB-ALI.json",
    "BFM-MUR.json",
    "CUE-GAB.json",
    "GAB-ALB.json",
    "GAB-VAL.json",
    "MAD-CUE.json"
];

// Función para cargar todos los archivos JSON y combinar los datos
function cargarDatosPK() {
    const promesas = archivos.map(archivo => 
        fetch(`./${archivo}`).then(response => response.json())
    );

    Promise.all(promesas)
        .then(datos => {
            // Combina todos los datos de los diferentes archivos
            const datosCombinados = [].concat(...datos);
            // Calcular el PK más cercano usando los datos combinados
            const pkMasCercano = calcularPKMasCercano(lat, lon, datosCombinados)[0];
            mostrarPKMasCercano(pkMasCercano);
            actualizarPosicionPK(pkMasCercano);
        })
        .catch(error => console.error('Error al cargar los archivos JSON:', error));
}

// Rastrear la posición continuamente con watchPosition
navigator.geolocation.watchPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    if (!mapa) {
        inicializarMapa(lat, lon);
    }

    actualizarPosicionUsuario(lat, lon);

    // Llamamos a la función para cargar todos los archivos JSON y buscar el PK más cercano
    cargarDatosPK();
}, 
(error) => console.error('Error al obtener ubicación:', error), {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000
});

// Inicializar el mapa
function inicializarMapa(lat, lon) {
    mapa = L.map('map', {
        center: [lat, lon],
        zoom: 18,
        maxZoom: 19
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
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
}

// Actualizar la ubicación del usuario en el mapa
function actualizarPosicionUsuario(lat, lon) {
    marcadorActual.setLatLng([lat, lon]);
    mapa.setView([lat, lon]);
}

// Calcular el PK más cercano
function calcularPKMasCercano(lat, lon, data) {
    let puntosCercanos = data.map(pk => {
        const distancia = calcularDistancia(lat, lon, pk.Latitud, pk.Longitud);
        return { pk: pk.PK, latitud: pk.Latitud, longitud: pk.Longitud, distancia: distancia, Linea: pk.Linea };
    });

    puntosCercanos.sort((a, b) => a.distancia - b.distancia);
    return puntosCercanos.slice(0, 1);
}

// Función para calcular distancia entre dos puntos geográficos
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

// Mostrar el PK más cercano en el HTML
function mostrarPKMasCercano(pk) {
    const pkElement = document.getElementById("pkCercano");
    const distanciaElement = document.getElementById("distancia");
    const pkFormateado = formatearPK(pk.pk);
    pkElement.textContent = `${pkFormateado} - L${pk.Linea}`;
    distanciaElement.textContent = `${pk.distancia.toFixed(2)} metros`;
}

// Actualizar la posición del marcador del PK
function actualizarPosicionPK(pk) {
    if (!marcadorPK) {
        marcadorPK = L.marker([pk.latitud, pk.longitud]).addTo(mapa)
            .bindPopup('PK más cercano')
            .openPopup();
    } else {
        marcadorPK.setLatLng([pk.latitud, pk.longitud]);
    }
}

// Formatear el PK para mostrar en el formato correcto
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

// Actualizar ubicación manualmente al hacer clic en el botón
document.getElementById("actualizarUbicacion").addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        actualizarPosicionUsuario(lat, lon);
        cargarDatosPK();
    });
});
