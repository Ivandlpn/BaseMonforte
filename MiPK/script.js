const archivosJSON = [
    './doc/L40A.json',
    './doc/L40B.json',
    './doc/L40C.json',
    './doc/L42.json'    
    './doc/L46.json',
    './doc/L48.json' // Agrega más rutas según sea necesario
];

let mapa, marcadorActual, marcadorPK, iconoUsuario;
let centradoAutomaticamente = true;
let datosCombinados = [];

// Rastrear la posición continuamente
navigator.geolocation.watchPosition(
    async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        if (!mapa) {
            inicializarMapa(lat, lon);
        }

        if (centradoAutomaticamente) {
            actualizarPosicionUsuario(lat, lon);
        }

        try {
            // Carga y combina datos de todos los archivos JSON
            datosCombinados = await cargarDatosDeArchivos(archivosJSON);

            // Calcular el PK más cercano
            const pkMasCercano = calcularPKMasCercano(lat, lon, datosCombinados)[0];
            mostrarPKMasCercano(pkMasCercano);
            actualizarPosicionPK(pkMasCercano);

            // Dibujar el trazado
            cargarTrazado(datosCombinados);
        } catch (error) {
            console.error('Error al cargar los datos de PK:', error);
        }
    },
    (error) => console.error('Error al obtener ubicación:', error),
    {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
    }
);

// Función para inicializar el mapa
function inicializarMapa(lat, lon) {
    mapa = L.map('map', {
        center: [lat, lon],
        zoom: 18,
        maxZoom: 19,
        attributionControl: false,
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        maxZoom: 19,
    }).addTo(mapa);

    iconoUsuario = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/1783/1783356.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
    });

    marcadorActual = L.marker([lat, lon], { icon: iconoUsuario }).addTo(mapa)
        .bindPopup('Mi Ubicación')
        .openPopup();

    mapa.on('move', () => {
        centradoAutomaticamente = false;
    });

    mapa.on('zoomstart', () => {
        centradoAutomaticamente = false;
    });
}

// Actualiza la posición del usuario en el mapa
function actualizarPosicionUsuario(lat, lon) {
    marcadorActual.setLatLng([lat, lon]);
    if (centradoAutomaticamente) {
        mapa.setView([lat, lon], 18);
    }
}

// Función para cargar y combinar datos de múltiples archivos JSON
async function cargarDatosDeArchivos(listaDeArchivos) {
    const promesas = listaDeArchivos.map((archivo) => fetch(archivo).then((res) => res.json()));
    const resultados = await Promise.all(promesas);
    return resultados.flat(); // Combina los datos de todos los archivos en un solo array
}

// Cálculo del PK más cercano
function calcularPKMasCercano(lat, lon, data) {
    let puntosCercanos = data.map(pk => {
        const distancia = calcularDistancia(lat, lon, pk.Latitud, pk.Longitud);
        return {
            pk: pk.PK,
            latitud: pk.Latitud,
            longitud: pk.Longitud,
            distancia: distancia,
            linea: pk.Linea,
        };
    });

    puntosCercanos.sort((a, b) => a.distancia - b.distancia);

    const pkActual = puntosCercanos[0]; // PK más cercano
    const pkSiguiente = puntosCercanos[1] || pkActual; // PK siguiente (o actual si es el último)

    // Determinar lado de la vía
    const ladoVia = determinarLadoVia(lat, lon, pkActual, pkSiguiente);
    pkActual.ladoVia = ladoVia;

    return [pkActual];
}

// Calcular distancia entre dos coordenadas
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

// Mostrar el PK más cercano
function mostrarPKMasCercano(pk) {
    const pkElement = document.getElementById("pkCercano");
    const pkFormateado = formatearPK(pk.pk);

    pkElement.innerHTML = `
        <div style="font-size: 1em; margin-bottom: 3px;">${pkFormateado}</div>
        <div style="font-size: 0.6em;"> ${pk.ladoVia}  (L${pk.linea})</div>
    `;
}

// Actualiza la posición del PK más cercano
function actualizarPosicionPK(pk) {
    if (!marcadorPK) {
        marcadorPK = L.marker([pk.latitud, pk.longitud]).addTo(mapa)
            .bindPopup('PK cercano')
            .openPopup();
    } else {
        marcadorPK.setLatLng([pk.latitud, pk.longitud]);
    }
}

// Formatear el número de PK
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

// Dibujar trazado con datos combinados
function cargarTrazado(datos) {
    try {
        const trazado = datos.map((punto) => [punto.Latitud, punto.Longitud]);
        const puntosFiltrados = filtrarPuntosCada50Metros(trazado);
        dibujarPuntos(puntosFiltrados);
    } catch (error) {
        console.error('Error al dibujar el trazado:', error);
    }
}

// Filtrar puntos para dibujar cada 50 metros
function filtrarPuntosCada50Metros(trazado) {
    const puntosFiltrados = [];
    let ultimaPosicion = trazado[0];
    puntosFiltrados.push(ultimaPosicion);

    for (let i = 1; i < trazado.length; i++) {
        const distancia = calcularDistancia(
            ultimaPosicion[0], ultimaPosicion[1],
            trazado[i][0], trazado[i][1]
        );
        if (distancia >= 50) {
            puntosFiltrados.push(trazado[i]);
            ultimaPosicion = trazado[i];
        }
    }

    return puntosFiltrados;
}

// Dibujar puntos en el mapa
function dibujarPuntos(puntos) {
    puntos.forEach(punto => {
        L.circleMarker(punto, {
            color: 'blue',
            radius: 2,
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.8,
        }).addTo(mapa);
    });
}

// Determinar en qué lado de la vía está el usuario
function determinarLadoVia(latUsuario, lonUsuario, pkActual, pkSiguiente) {
    const { latitud: latActual, longitud: lonActual } = pkActual;
    const { latitud: latSiguiente, longitud: lonSiguiente } = pkSiguiente;

    const vectorEjeX = lonSiguiente - lonActual;
    const vectorEjeY = latSiguiente - latActual;

    const vectorUsuarioX = lonUsuario - lonActual;
    const vectorUsuarioY = latUsuario - latActual;

    const productoCruzado = vectorEjeX * vectorUsuarioY - vectorEjeY * vectorUsuarioX;
    return productoCruzado > 0 ? "Vía 1" : "Vía 2";
}
