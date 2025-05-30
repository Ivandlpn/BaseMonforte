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
    iconSize: [50, 50],
    iconAnchor: [25, 25]
});


    marcadorTren = L.marker([lat, lon], { icon: iconoTren }).addTo(mapa);

    // Asegurarse de que el marcador se ha creado antes de asociar el evento
       if (marcadorTren) {
        // Asociar el evento de clic al marcador
        marcadorTren.on('click', () => {
            const pk = formatearPK(lat, lon);  // Usar lat/lon para calcular el PK (si es necesario)
            mostrarFormulario(pk);            // Mostrar el formulario para registrar el defecto
        });
    }
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

async function cargarTrazado() {
    try {
        // Carga el archivo JSON
        const respuesta = await fetch('./PKCoordenas.json');
        const data = await respuesta.json();

        // Extrae las coordenadas del archivo
        const trazado = data.map((punto) => [punto.Latitud, punto.Longitud]);

        // Dibuja el trazado en el mapa
        dibujarTrazado(trazado);
    } catch (error) {
        console.error('Error al cargar el archivo PKCoordenas.json:', error);
    }
}

function dibujarTrazado(trazado) {
    const lineaFerrocarril = L.polyline(trazado, {
        color: 'blue',         // Color de la línea
        weight: 4,             // Grosor de la línea
        opacity: 0.8,          // Transparencia
        smoothFactor: 1        // Suavizado de la línea
    }).addTo(mapa);

    // Ajustar el mapa para que muestre todo el trazado
    // mapa.fitBounds(lineaFerrocarril.getBounds());
}

function centrarMapaEnTren() {
    if (marcadorTren) {
        mapa.setView(marcadorTren.getLatLng(), mapa.getZoom()); 
        // Centra el mapa en el marcador y conserva el nivel de zoom actual
    }
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

       // Carga y dibuja el trazado al inicializar el mapa
        cargarTrazado();

      let centrarIntervalo;

// Configura el temporizador
if (!centrarIntervalo) {
    centrarIntervalo = setInterval(() => {
        centrarMapaEnTren();
    }, 10000);
}
        
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


document.getElementById('abrirPDF').addEventListener('click', () => {
    window.open('doc/IT_Inspecci%C3%B3n_Cabina.pdf', '_blank');
    console.log('PDF abierto');
});

document.getElementById('MiPK').addEventListener('click', () => {
    window.open('https://ivandlpn.github.io/BaseMonforte/PKC/', '_blank');
    console.log('IT abierta');
});

// Esta es la función que actualizará el desplegable de defectos
function actualizarDefectos(event) {
    const selectedElemento = event.target.value;
    const defectoSelect = document.getElementById('defecto');
    
    // Limpiar el listado actual de defectos
    defectoSelect.innerHTML = '';

    // Encontrar el elemento seleccionado
    const elemento = elementos.find(e => e.nombre === selectedElemento);
    if (elemento) {
        // Añadir los defectos al select
        elemento.defectos.forEach(defecto => {
            const option = document.createElement('option');
            option.value = defecto;
            option.textContent = defecto;
            defectoSelect.appendChild(option);
        });
    }
}



const elementos = [
    { nombre: 'Carril', defectos: ['Estado de carril', 'Cabeza de carril. Soldaduras'] },
    { nombre: 'Traviesas Hormigón o Bibloque', defectos: ['Estado de la traviesa'] },
    { nombre: 'Traviesas Madera', defectos: ['Estado de la traviesa'] },
    { nombre: 'Balasto', defectos: ['Contaminación de balasto', 'Insuficiencia de balasto', 'Exceso de balasto sobre traviesas', 'Presencia de vegetación'] },
    { nombre: 'Geometría de vía', defectos: ['Defecto alineación planta (garrotes, ripados)', 'Defecto nivelación alzado (Bache)'] },
    { nombre: 'Cerramientos', defectos: ['Mal estado general', 'Mal estado puntual'] },
    { nombre: 'Engrasador de carril', defectos: ['Mal estado general'] },
    { nombre: 'Limpieza del entorno ferroviario', defectos: ['Obstáculos en la zona de peligro', 'Obstáculos en la zona de seguridad', 'Presencia de vegetación en márgenes invadiendo gálibo'] },
    { nombre: 'Cartelones', defectos: ['Deficiente estado o visibilidad', 'Mala colocación', 'Falta de señales o fuera de servicio'] },
    { nombre: 'Drenajes', defectos: ['Cunetas y/o bajantes aterradas en toda su sección', 'Cunetas y/o bajantes aterradas parcialmente'] },
    { nombre: 'Desmontes', defectos: ['Deficiente estado apreciable'] },
    { nombre: 'Terraplenes', defectos: ['Deficiente estado apreciable'] },
    { nombre: 'Puentes', defectos: ['Deficiente estado apreciable'] },
    { nombre: 'Muros', defectos: ['Deficiente estado apreciable'] },
    { nombre: 'Túneles', defectos: ['Deficiente estado apreciable'] },
    { nombre: 'Estaciones', defectos: ['Deficiente estado de bordes de andén', 'Vías de estacionamiento en estado deficiente'] },
    { nombre: 'Otros', defectos: [] }
];

const nivelesDefecto = ['IAL', 'IL'];  // Niveles de defectos
const estados = ['Incorrecto', 'Correcto']; // Estados posibles
const actuaciones = ['Inspección a pie', 'Prospección', 'Otros']; // Actuaciones recomendadas

// Mostrar el formulario en un modal cuando se hace clic en el marcador
function mostrarFormulario(pk) {
    // Primero, eliminar cualquier formulario previo si existe
    const formularioExistente = document.getElementById('formularioDefecto');
    if (formularioExistente) {
        formularioExistente.remove();
    }

    // Crear un nuevo formulario
    const form = document.createElement('form');
    form.id = 'formularioDefecto';

    // Elemento
    const elementoSelect = document.createElement('select');
    elementoSelect.id = 'elemento';
    elementoSelect.addEventListener('change', actualizarDefectos); // Asociar la función de actualización
    elementos.forEach(elemento => {
        const option = document.createElement('option');
        option.value = elemento.nombre;
        option.textContent = elemento.nombre;
        elementoSelect.appendChild(option);
    });

    form.appendChild(elementoSelect);

    // Defectos (dependerá del Elemento seleccionado)
    const defectoSelect = document.createElement('select');
    defectoSelect.id = 'defecto';
    form.appendChild(defectoSelect);

    // Nivel de defectos
    const nivelSelect = document.createElement('select');
    nivelSelect.id = 'nivel';
    nivelesDefecto.forEach(nivel => {
        const option = document.createElement('option');
        option.value = nivel;
        option.textContent = nivel;
        nivelSelect.appendChild(option);
    });

    form.appendChild(nivelSelect);

    // Estado
    const estadoSelect = document.createElement('select');
    estadoSelect.id = 'estado';
    estados.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado;
        option.textContent = estado;
        estadoSelect.appendChild(option);
    });

    form.appendChild(estadoSelect);

    // Observaciones
    const observacionesInput = document.createElement('input');
    observacionesInput.id = 'observaciones';
    observacionesInput.placeholder = 'Observaciones';
    form.appendChild(observacionesInput);

    // Actuación recomendada
    const actuacionSelect = document.createElement('select');
    actuacionSelect.id = 'actuacion';
    actuaciones.forEach(actuacion => {
        const option = document.createElement('option');
        option.value = actuacion;
        option.textContent = actuacion;
        actuacionSelect.appendChild(option);
    });

    form.appendChild(actuacionSelect);

    // Botón para guardar
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Guardar Defecto';
    saveButton.addEventListener('click', (event) => {
        event.preventDefault();
        guardarDefecto(pk);
    });

    form.appendChild(saveButton);

    // Añadir el formulario al modal
    const modalContent = document.querySelector('.modal-content');
    modalContent.appendChild(form);

    // Mostrar el modal
    const modal = document.getElementById('modalFormulario');
    modal.style.display = 'block';

    // Cerrar el modal al hacer clic en la 'x'
    const closeButton = document.querySelector('.close');
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none'; // Cerrar el modal
    });

    // Cerrar el modal si el usuario hace clic fuera de él
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}



// Función para guardar el defecto
function guardarDefecto() {
    // Capturar información de la tarjeta de información
    const pk = document.getElementById('pk').textContent.trim();
    const velocidad = document.getElementById('velocidad').textContent.trim();
    const lugar = document.getElementById('lugar').textContent.trim();

    // Obtener la hora actual en formato HH:MM
    const horaActual = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    });

    // Validar el formato del PK
    const pkRegex = /^\d{3}\+\d{3}$/;
    const pkValido = pkRegex.test(pk) ? pk : "000+000"; // Valor por defecto si el PK no es válido

    // Capturar valores del formulario
    const elemento = document.getElementById('elemento').value.trim();
    const defecto = document.getElementById('defecto').value.trim();
    const nivel = document.getElementById('nivel').value.trim();
    const estado = document.getElementById('estado').value.trim();
    const observaciones = document.getElementById('observaciones').value.trim() || 'Sin observaciones';
    const actuacion = document.getElementById('actuacion').value.trim();

    // Crear el contenido del archivo con el formato solicitado
    const contenido = `
=== DATOS DEL DEFECTO ===
PK: ${pkValido}
Velocidad: ${velocidad}
Hora: ${horaActual}
Ubicación: ${lugar}

=== DESCRIPCIÓN ===
Elemento: ${elemento}
Defecto: ${defecto}
Nivel: ${nivel}
Estado: ${estado}
Observaciones: ${observaciones}
Actuación recomendada: ${actuacion}
    `;

    // Utilizar TextEncoder para convertir a UTF-8
    const encoder = new TextEncoder();
    const contenidoUtf8 = encoder.encode(contenido);

    // Crear el archivo de texto con la codificación UTF-8
    const blob = new Blob([contenidoUtf8], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const fecha = new Date().toISOString().split('T')[0]; // Fecha en formato YYYY-MM-DD
    link.download = `Defecto_${pkValido.replace('+', '_')}_${fecha}.txt`; // Reemplaza '+' por '_' en el nombre del archivo

    // Iniciar la descarga
    link.click();

    // Mostrar mensaje de éxito
    alert('Defecto registrado con éxito');

    // Cerrar el modal después de guardar
    const modal = document.getElementById('modalFormulario');
    modal.style.display = 'none';
}
