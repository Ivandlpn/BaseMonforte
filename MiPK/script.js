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

    async function cargarArchivosJSON(rutas) {
        const todasPromesas = rutas.map(ruta =>
            fetch(ruta)
                .then(response => response.json())
                .catch(error => {
                    console.error(`Error al cargar ${ruta}:`, error);
                    return []; // Devuelve un array vacío si falla
                })
        );

        const datosCargados = await Promise.all(todasPromesas);
        return datosCargados.flat();
    }

    const rutasArchivos = [
        "./doc/L40Ar.json",
        "./doc/L40Br.json",
        "./doc/L40Cr.json",
        "./doc/L42Ar.json",
        "./doc/L42B.json",
        "./doc/L46.json",
        "./doc/L48.json" // Añade más rutas según sea necesario
    ];

    cargarArchivosJSON(rutasArchivos)
        .then(datosCombinados => {
            window.pkMasCercano = calcularPKMasCercano(lat, lon, datosCombinados)[0];
            mostrarPKMasCercano(window.pkMasCercano);
            actualizarPosicionPK(window.pkMasCercano);
        })
        .catch(error => console.error('Error al combinar datos de los archivos:', error));

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
        .bindPopup('Mi Ubicación');

    mapa.on('move', () => {
        centradoAutomaticamente = false;
    });

    mapa.on('zoomstart', () => {
        centradoAutomaticamente = false;
    });
}

function actualizarPosicionUsuario(lat, lon) {
    marcadorActual.setLatLng([lat, lon]);
    if (centradoAutomaticamente) {
        mapa.setView([lat, lon], 18);
    }
}

function determinarLadoVia(latUsuario, lonUsuario, pkActual, pkSiguiente) {
    const { latitud: latActual, longitud: lonActual } = pkActual;
    const { latitud: latSiguiente, longitud: lonSiguiente } = pkSiguiente;
    const latPromedioVia = (latActual + latSiguiente) / 2;
    return latUsuario > latPromedioVia ? "Vía 1" : "Vía 2";
}

const iconoPK = L.icon({
    iconUrl: 'img/MiPKubi.png',
    iconSize: [30, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

function calcularPKMasCercano(lat, lon, data) {
    let puntosCercanos = data.map(pk => {
        const distancia = calcularDistancia(lat, lon, pk.Latitud, pk.Longitud);
        return { 
            pk: pk.PK, 
            latitud: pk.Latitud, 
            longitud: pk.Longitud, 
            distancia: distancia,
            linea: pk.Linea
        };
    });

    puntosCercanos.sort((a, b) => a.distancia - b.distancia);

    const pkActual = puntosCercanos[0];
    const pkSiguiente = puntosCercanos[1] || pkActual;
    const ladoVia = determinarLadoVia(lat, lon, pkActual, pkSiguiente);
    pkActual.ladoVia = ladoVia;

    return [pkActual];
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
    const pkFormateado = formatearPK(pk.pk);
    pkElement.innerHTML = `
        <div style="font-size: 1em; margin-bottom: 3px;">${pkFormateado}</div>
        <div style="font-size: 0.6em;"> ${pk.ladoVia} (L${pk.linea})</div>
    `;
}

function actualizarPosicionPK(pk) {
    if (!marcadorPK) {
        marcadorPK = L.marker([pk.latitud, pk.longitud], { icon: iconoPK }).addTo(mapa);
    } else {
        marcadorPK.setLatLng([pk.latitud, pk.longitud]);
        marcadorPK.setIcon(iconoPK);
    }
}

function formatearPK(pk) {
    const pkStr = pk.toString();
    if (pkStr.length > 6) {
        return pkStr.slice(0, 3) + '+' + pkStr.slice(3, 6);
    } else if (pkStr.length === 6) {
        return pkStr.slice(0, 3) + '+' + pkStr.slice(3);
    } else if (pkStr.length === 5) {
        return pkStr.slice(0, 2) + '+' + pkStr.slice(2);
    } else if (pkStr.length === 4) {
        return pkStr.slice(0, 1) + '+' + pkStr.slice(1);
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

document.addEventListener("DOMContentLoaded", function() {
    const botonCapas = document.getElementById("botonCapas");
    const opcionesCapas = document.getElementById("opcionesCapas");

    botonCapas.addEventListener("click", () => {
        opcionesCapas.classList.toggle("oculto");
        opcionesCapas.classList.toggle("visible");
    });

    // Lógica para activar/desactivar capas
    document.getElementById("capaPuertas").addEventListener("change", (event) => {
        if (event.target.checked) {
            // Lógica para mostrar la capa de Puertas
        } else {
            // Lógica para ocultar la capa de Puertas
        }
    });

    document.getElementById("capaTraza").addEventListener("change", (event) => {
        if (event.target.checked) {
            // Lógica para mostrar la capa de Traza
        } else {
            // Lógica para ocultar la capa de Traza
        }
    });

    document.getElementById("capaEdificios").addEventListener("change", (event) => {
        if (event.target.checked) {
            // Lógica para mostrar la capa de Edificios
        } else {
            // Lógica para ocultar la capa de Edificios
        }
    });
});
