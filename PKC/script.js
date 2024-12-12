let mapa, marcadorActual, marcadorPK, iconoUsuario, iconoPK;

// Rastrear la posición continuamente con watchPosition
navigator.geolocation.watchPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    if (!mapa) {
        inicializarMapa(lat, lon);
    }

    actualizarPosicionUsuario(lat, lon);

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

    // Asegurándonos de que el icono del PK se actualice con el nuevo archivo IconPK.png
    iconoPK = L.icon({
        iconUrl: 'IconPK.png', // Ruta a tu nuevo icono para el PK
        iconSize: [40, 40], // Ajusta el tamaño del icono si es necesario
        iconAnchor: [20, 40], // Ajusta el punto de anclaje del icono
        popupAnchor: [0, -40] // Ajusta la posición del popup respecto al icono
    });

    marcadorActual = L.marker([lat, lon], { icon: iconoUsuario }).addTo(mapa)
        .bindPopup('Mi Ubicación')
        .openPopup();
}

function actualizarPosicionUsuario(lat, lon) {
    marcadorActual.setLatLng([lat, lon]);
    mapa.setView([lat, lon]); // Centrar el mapa en la ubicación actual
}

function actualizarPosicionPK(pk) {
    if (!marcadorPK) {
        marcadorPK = L.marker([pk.latitud, pk.longitud], { icon: iconoPK }).addTo(mapa)
            .bindPopup('PK más cercano')
            .openPopup();
    } else {
        marcadorPK.setLatLng([pk.latitud, pk.longitud]);
    }
}

// Resto del código permanece igual
