navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Inicializar el mapa centrado en la ubicación del usuario
    const mapa = L.map('map', {
        center: [lat, lon],
        zoom: 13,
        maxZoom: 19
    });

    // Añadir capa personalizada para el mapa
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);

    // Crear un icono personalizado para la ubicación del usuario
    const iconoUsuario = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/1783/1783356.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    const iconoPK = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
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
            const pkMasCercano = puntosCercanos[0];

            // Mostrar en la lista solo el PK más cercano
            mostrarPKMasCercano(pkMasCercano);

            // Añadir marcador para el PK más cercano en el mapa
            const marcadorPK = L.marker([pkMasCercano.latitud, pkMasCercano.longitud], { icon: iconoPK }).addTo(mapa)
                .bindPopup('<strong>PK Más Cercano</strong>')
                .openPopup();
        });
});
