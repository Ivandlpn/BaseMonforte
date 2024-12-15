let mapa, marcadorTren, iconoTren;

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
    iconSize: [60, 60],
    iconAnchor: [30, 30]
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

// NUEVO VIAJE

document.getElementById('nuevoviaje').addEventListener('click', () => {
    // Obtener la fecha y hora actuales
    const fecha = new Date();
    const dia = fecha.getDate().toString().padStart(2, '0'); // Aseguramos 2 dígitos
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Aseguramos 2 dígitos
    const anio = fecha.getFullYear(); // Año (4 dígitos)
    const hora = fecha.getHours().toString().padStart(2, '0'); // Hora con 2 dígitos
    const minuto = fecha.getMinutes().toString().padStart(2, '0'); // Minuto con 2 dígitos

    // Contenido inicial del documento (PK de inicio aún no disponible)
    const contenidoInicial = `
    Viaje en Cabina
    Fecha: ${dia}/${mes}/${anio}
    Hora de Inicio: ${hora}:${minuto}
    PK de Inicio: Cargando...
    Eventos:
    `;

    // Nombre del archivo con la fecha y hora
    const nombreArchivo = `ViajeCabina ${dia}${mes}${anio} ${hora}:${minuto}.txt`;

    // Crear el archivo de texto
    const blob = new Blob([contenidoInicial], { type: 'text/plain' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombreArchivo; // Nombre del archivo con la fecha y hora

    // Crear una nueva ventana para abrir el archivo en el editor de texto
    enlace.click(); // Iniciar la descarga

    // Intentar abrir el archivo automáticamente en el editor de texto predeterminado
    // El archivo se descarga en la carpeta de descargas, y luego el sistema operativo abrirá el archivo
    const url = URL.createObjectURL(blob);
    window.open(url);  // Abrir el archivo en una nueva ventana (esto depende del navegador y sistema operativo)
    
    console.log('Documento creado y descargado con nombre:', nombreArchivo);
});



// NUEVO EVENTO

document.getElementById('nuevoevento').addEventListener('click', () => {
    console.log('Evento registrado');
    alert('Evento registrado exitosamente.');
});



document.getElementById('abrirPDF').addEventListener('click', () => {
    window.open('doc/IT_Inspecci%C3%B3n_Cabina.pdf', '_blank');
    console.log('PDF abierto');
});

document.getElementById('MiPK').addEventListener('click', () => {
    window.open('https://ivandlpn.github.io/BaseMonforte/PKC/', '_blank');
    console.log('IT abierta');
});

