let mapa, marcadorActual, marcadorPK, iconoUsuario;
let centradoAutomaticamente = true;

// Rastrear la posición continuamente
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
        attributionControl: false
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

    mapa.on('move', () => {
        centradoAutomaticamente = false;
    });
}

function actualizarPosicionUsuario(lat, lon) {
    marcadorActual.setLatLng([lat, lon]);
    if (centradoAutomaticamente) {
        mapa.setView([lat, lon], 18);
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
            .bindPopup('PK cercano')
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

document.getElementById("actualizarUbicacion").addEventListener("click", () => {
    if (marcadorActual) {
        const { lat, lng } = marcadorActual.getLatLng();
        mapa.setView([lat, lng], 18);
        centradoAutomaticamente = true;
    }
});

// Modificación para abrir la cámara trasera
document.getElementById("iconoCamara").addEventListener("click", () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
            // Contenedor para el video y el botón
            const contenedor = document.createElement("div");
            contenedor.style.position = "absolute";
            contenedor.style.top = "0";
            contenedor.style.left = "0";
            contenedor.style.width = "100%";
            contenedor.style.height = "100%";
            contenedor.style.zIndex = "1000";
            contenedor.style.backgroundColor = "black"; // Fondo negro para destacar la cámara
            document.body.appendChild(contenedor);

            // Elemento de video
            const video = document.createElement("video");
            video.srcObject = stream;
            video.autoplay = true;
            video.style.width = "100%";
            video.style.height = "100%";
            video.style.objectFit = "cover";
            contenedor.appendChild(video);

            // Botón "Hacer Foto"
            const botonFoto = document.createElement("button");
            botonFoto.textContent = "Hacer Foto";
            botonFoto.style.position = "absolute";
            botonFoto.style.bottom = "10px";
            botonFoto.style.left = "50%";
            botonFoto.style.transform = "translateX(-50%)";
            botonFoto.style.padding = "10px 20px";
            botonFoto.style.fontSize = "16px";
            botonFoto.style.color = "white";
            botonFoto.style.backgroundColor = "#007aff";
            botonFoto.style.border = "none";
            botonFoto.style.borderRadius = "5px";
            botonFoto.style.cursor = "pointer";
            botonFoto.style.zIndex = "1001";
            contenedor.appendChild(botonFoto);

            // Cerrar la cámara y eliminar elementos al hacer clic en el video
            video.addEventListener("click", () => {
                stream.getTracks().forEach(track => track.stop());
                contenedor.remove();
            });
        })
        .catch((error) => {
            console.error("Error al acceder a la cámara: ", error);
        });
});

});


