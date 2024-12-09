// Inicialización de la aplicación
let mapa;
let lat, lon;

// Función para obtener la ubicación actual del usuario y mostrar el mapa
navigator.geolocation.getCurrentPosition((position) => {
    lat = position.coords.latitude;
    lon = position.coords.longitude;

    // Inicializar el mapa con Leaflet.js
    mapa = L.map('map').setView([lat, lon], 13); // Centrado en la ubicación del usuario

    // Añadir la capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(mapa);

    // Crear un icono personalizado para el marcador del usuario
    const iconoUsuario = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/svgs/solid/map-marker-alt.svg',
        iconSize: [30, 30], // Tamaño del icono
        iconAnchor: [15, 30], // Ajuste del ancla para que se alinee bien con el marcador
        popupAnchor: [0, -30] // Ubicación del popup
    });

    // Añadir el marcador para la ubicación actual del usuario
    const marcadorActual = L.marker([lat, lon], { icon: iconoUsuario }).addTo(mapa)
        .bindPopup('Tu ubicación')
        .openPopup();

    // Cargar el archivo PKCoordenas.json (ruta relativa)
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

// Función para calcular la distancia entre dos puntos (en metros)
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

// Función para mostrar los PK cercanos en la lista
function mostrarPKCercanos(puntosCercanos) {
    const lista = document.getElementById('listaPKs');
    puntosCercanos.slice(0, 5).forEach((punto) => {
        const li = document.createElement('li');
        li.textContent = `PK: ${punto.PK}, Distancia: ${punto.distancia.toFixed(2)} m`;
        lista.appendChild(li);
    });
}

// Función para cambiar entre modo claro y oscuro
document.getElementById('modoOscuro').addEventListener('click', () => {
    document.body.classList.toggle('oscuro');
    document.querySelector('header').classList.toggle('oscuro');
    document.querySelector('button').classList.toggle('oscuro');
    const listaItems = document.querySelectorAll('ul li');
    listaItems.forEach(item => item.classList.toggle('oscuro'));
});
