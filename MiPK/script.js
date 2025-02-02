let mapa, marcadorActual, marcadorPK, iconoUsuario;
let centradoAutomaticamente = true;

let lat, lon; // Coordenadas del usuario
let primeraEjecucion = true; // Bandera para controlar la primera actualización

let puertasData = []; // Variable para guardar datos de las puertas
const puertasContainer = document.getElementById("puertas-card-container");
const puertasInfoDiv = document.getElementById("puertas-info");
const cerrarPuertasCard = document.getElementById("cerrar-puertas-card");

const apiKeyOpenWeatherMap = "14225e48c44f9d35291e12867b7f32cf"; // API Meteo

    const rutasArchivos = [
        "./doc/traza/L40Ar.json",
        "./doc/traza/L40Br.json",
        "./doc/traza/L40Cr.json",
        "./doc/traza/L42Ar.json",
        "./doc/traza/L42B.json",
        "./doc/traza/L46.json",
        "./doc/traza/L48.json"
    ];

 // Cargar puertas al iniciar la app
cargarPuertas();

async function cargarPuertas() {
    try {
        console.log("Cargando datos de puertas...");
        const responses = await Promise.all([
            fetch("./doc/puertas/PL42.json"),
            fetch("./doc/puertas/PL46.json"),
            fetch("./doc/puertas/PL40.json")
        ]);
        puertasData = (await Promise.all(responses.map(res => res.json()))).flat();
        console.log("Datos de puertas cargados:", puertasData);
    } catch (error) {
        console.error("Error al cargar los datos de puertas:", error);
        alert("Error al cargar los datos de las puertas.");
    }
}

let dataEdificiosArraysGlobal = []; // Variable global para datos de edificios
let coordenadasPorPKLineaGlobal = new Map(); // Variable global para mapa de coordenadas

async function cargarDatosEdificiosGlobal() {
    try {
        const rutasEdificios = ["./doc/edificios/ALBALI.json", "./doc/edificios/TOVAL.json"];
        dataEdificiosArraysGlobal = await Promise.all(rutasEdificios.map(ruta =>
            fetch(ruta).then(response => response.json())
        ));
        console.log("Datos de edificios cargados globalmente:", dataEdificiosArraysGlobal);
         coordenadasPorPKLineaGlobal = await crearMapaCoordenadas(); // Cargar mapa de coordenadas globalmente
         console.log("Mapa de coordenadas cargado globalmente:", coordenadasPorPKLineaGlobal);

    } catch (error) {
        console.error("Error al cargar datos de edificios globalmente:", error);
        alert("Error al cargar datos de edificios.");
    }
}

cargarDatosEdificiosGlobal(); // Llamar a la función para cargar datos de edificios globalmente al inicio
console.log("dataEdificiosArraysGlobal después de cargar:", dataEdificiosArraysGlobal); // *** AÑADE ESTE CONSOLE.LOG ***


function pkToNumber(pkString) { // <--- Definición en el ámbito global
    return parseInt(pkString, 10);
}

async function cargarArchivosJSON(rutas) { // <--- Definición en el ámbito global
    const todasPromesas = rutas.map(ruta =>
        fetch(ruta)
            .then(response => response.json())
            .catch(error => {
                console.error(`Error al cargar ${ruta}:`, error);
                return [];
            })
    );
    return (await Promise.all(todasPromesas)).flat();
}

// Rastrea la posición continuamente, pero no realiza acciones automáticamente
navigator.geolocation.watchPosition((position) => {
    lat = position.coords.latitude;
    lon = position.coords.longitude;

    if (!mapa) {
        inicializarMapa(lat, lon);
    }

    if (centradoAutomaticamente) {
        actualizarPosicionUsuario(lat, lon);
    }

    // Cálculo inicial del PK más cercano (solo la primera vez)
    if (primeraEjecucion) {
        primeraEjecucion = false; // Cambia la bandera para evitar futuras ejecuciones automáticas
        calcularYActualizarPK();
    }
}, 
(error) => console.error('Error al obtener ubicación:', error), {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000
});

async function calcularYActualizarPK() {
    // Mostrar texto temporal "Buscando PK ..."
    const pkElement = document.getElementById("pkCercano");
    if(pkElement){
        pkElement.innerHTML = `<span class="texto-buscando-pk">Buscando PK...</span>`;
    }
    else {
        console.error("No se ha encontrado el elemento con id pkCercano")
        return;
    }

    if (!lat || !lon) {
        console.error("No se ha obtenido la ubicación actual del usuario.");
        return;
    }

    async function cargarArchivosJSON(rutas) {
        const todasPromesas = rutas.map(ruta =>
            fetch(ruta)
                .then(response => response.json())
                .catch(error => {
                    console.error(`Error al cargar ${ruta}:`, error);
                    return [];
                })
        );
        return (await Promise.all(todasPromesas)).flat();
    }

    cargarArchivosJSON(rutasArchivos)
        .then(datosCombinados => {
            // *** MODIFICACIÓN IMPORTANTE: Guardar datosCombinados globalmente ***
            window.datosCombinadosGlobal = datosCombinados; // <-- ASIGNACIÓN GLOBAL
            window.pkMasCercano = calcularPKMasCercano(lat, lon, datosCombinados)[0];
            if(window.pkMasCercano && pkElement){ //Añadimos la comprobación de pkElement
                mostrarPKMasCercano(window.pkMasCercano);
                actualizarPosicionPK(window.pkMasCercano);
            }
            // mostrarMensaje("   🔄 PK Actualizado");
        })
        .catch(error => console.error('Error al combinar datos de los archivos:', error));
}

// Propiedades Mensaje: PK Actualizado
function mostrarMensaje(mensaje) {
    const mensajeDiv = document.createElement("div");
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.position = "fixed";
    mensajeDiv.style.bottom = "300px";
    mensajeDiv.style.left = "50%";
    mensajeDiv.style.transform = "translateX(-50%)";
    mensajeDiv.style.backgroundColor = "#28a745"; // Verde de confirmación
    mensajeDiv.style.color = "white";
    mensajeDiv.style.padding = "10px 20px";
    mensajeDiv.style.borderRadius = "5px";
    mensajeDiv.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    mensajeDiv.style.zIndex = "9999"; // Alto z-index
    mensajeDiv.style.fontSize = "1.2em";
    mensajeDiv.style.border = "1px solid #ffffff"; // Borde blanco para visibilidad
    mensajeDiv.style.opacity = "0.9"; // Ligera opacidad

    // Ajuste del ancho
    mensajeDiv.style.minWidth = "200px"; // Ancho mínimo
    mensajeDiv.style.width = "auto"; // Permite que crezca si es necesario
    
    document.body.appendChild(mensajeDiv);

    setTimeout(() => {
        mensajeDiv.remove();
    }, 3000); // El mensaje desaparecerá después de 10 segundos
}


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
        .bindPopup(`
            <div style="text-align: center;">
                <b>Mi Ubicación</b><br><br>
                <button id="compartirUbicacionBtn" style="padding: 8px 12px; border: none; border-radius: 5px; background-color: #007bff; color: white; cursor: pointer;">Compartir 💬</button>
            </div>
        `);
        //.openPopup();

    // Event listener para el botón "Compartir Ubicación" dentro del popup
    marcadorActual.on('popupopen', function() {
        const compartirUbicacionBtn = document.getElementById('compartirUbicacionBtn');
        compartirUbicacionBtn.addEventListener('click', function() {
            // Obtener las coordenadas DEL MARCADOR directamente
            const markerLatLng = marcadorActual.getLatLng();
            const markerLat = markerLatLng.lat;
            const markerLng = markerLatLng.lng;

            const googleMapsUrl = `https://www.google.com/maps?q=${markerLat},${markerLng}`;


            if (navigator.share) {
                navigator.share({
                    title: 'Mi Ubicación',
                    text: 'Aquí está mi ubicación actual:',
                    url: googleMapsUrl
                }).then(() => {
                    console.log('Ubicación compartida exitosamente');
                })
                .catch((error) => console.error('Error al compartir', error));
            } else {
                // Si navigator.share no está soportado, muestra una alerta con el enlace
                alert('Tu navegador no soporta la función de compartir. Aquí está el enlace a Google Maps:\n\n' + googleMapsUrl);
            }
        });
    });

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


/////  INICIO CALCULO LADO VÍA /////---------------------------------------------------------------------------------------

const direccionLineas = {
    '40': 1,
    '42': 1,
    '46': 1,
    '48': 1
};


function determinarLadoVia(latUsuario, lonUsuario, pkActual, pkSiguiente, linea) {
    if (!direccionLineas.hasOwnProperty(linea)) {
        return "Línea no definida";
    }

    const vectorVia = {
        x: pkSiguiente.longitud - pkActual.longitud,
        y: pkSiguiente.latitud - pkActual.latitud
    };
    const vectorUsuario = {
        x: lonUsuario - pkActual.longitud,
        y: latUsuario - pkActual.latitud
    };
    const productoCruz = (vectorVia.x * vectorUsuario.y) - (vectorVia.y * vectorUsuario.x);

    return (productoCruz * direccionLineas[linea]) > 0 ? "Vía 1" : "Vía 2";
}


/////  FIN CALCULO LADO VÍA /////---------------------------------------------------------------------------------------



// icono para el PK más cercano
const iconoPK = L.icon({
    iconUrl: 'img/MiPKubi.png', // Ruta de la imagen del icono
    iconSize: [30, 40], // Tamaño del icono (ajusta según sea necesario)
    iconAnchor: [20, 40], // Punto del icono que apunta a la ubicación
    popupAnchor: [0, -40] // Punto desde donde se abrirá el popup
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

    // Definir el incremento de PK para el "siguiente" PK
    const incrementoPK = 10;

    // Función para convertir el formato PK a un número para comparar
    function pkToNumber(pkString) {
        const parts = pkString.split('+');
        return parseInt(parts[0]) * 1000 + parseInt(parts[1] || 0);
    }

    // Función para convertir un número de nuevo al formato PK
    function numberToPk(pkNumber) {
        const parteEntera = Math.floor(pkNumber / 1000);
        const parteDecimal = pkNumber % 1000;
        return `${parteEntera}+${parteDecimal.toString().padStart(3, '0')}`;
    }

    const pkActualNumerico = pkToNumber(pkActual.pk);
    const pkSiguienteObjetivoNumerico = pkActualNumerico + incrementoPK;
    const pkSiguienteObjetivoFormateado = numberToPk(pkSiguienteObjetivoNumerico);

    // Buscar el PK en los datos que coincida con el PK objetivo
    const pkSiguiente = data.find(pk => pk.PK === pkSiguienteObjetivoFormateado && pk.Linea === pkActual.linea);

    // Si no se encuentra el PK siguiente objetivo, usar el siguiente más cercano (o manejarlo de otra manera)
    // Esto es importante para el final de la línea o tramos con espaciamiento irregular.
    const pkSiguienteParaVector = pkSiguiente || puntosCercanos.find(p => p.linea === pkActual.linea && pkToNumber(p.pk) > pkActualNumerico) || pkActual;

    // Determinar lado de la vía usando el PK siguiente objetivo (o el más cercano si no se encuentra el objetivo)
    const ladoVia = determinarLadoVia(lat, lon, pkActual, pkSiguienteParaVector, pkActual.linea);
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
     if(pkElement) // <-- Comprobación IMPORTANTE
     {
         const pkFormateado = formatearPK(pk.pk); // Formatea el PK
         pkElement.innerHTML = `
             <div style="font-size: 1em; margin-bottom: 3px;">${pkFormateado}</div>
              <div style="font-size: 0.6em;"> ${pk.ladoVia}  (L${pk.linea})</div>
        `;
    } else{
         console.error("No se ha encontrado el elemento con id pkCercano en mostrarPKMasCercano.")
    }
}



function actualizarPosicionPK(pk) {
    if (!marcadorPK) {
        marcadorPK = L.marker([pk.latitud, pk.longitud], { icon: iconoPK }).addTo(mapa)
            //.bindPopup('PK cercano')
            //.openPopup();
    } else {
        marcadorPK.setLatLng([pk.latitud, pk.longitud]);
        marcadorPK.setIcon(iconoPK); // Asegura que el icono se actualice si ya existe el marcador
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
        return pkStr; // Si tiene menos de 4 cifras, no se formatea
    }
}

/////  INICIO CAPAS/////---------------------------------------------------------------------------------------

const botonCapas = document.getElementById('boton-capas');
const menuCapas = document.getElementById('menu-capas');
const checkTrazado = document.getElementById('check-trazado');
const checkEdificios = document.getElementById('check-edificios');
const checkTiempo = document.getElementById('check-tiempo');

// Función para mostrar u ocultar el menú de capas
function toggleMenuCapas() {
    if (menuCapas.style.display === 'none') {
        menuCapas.style.display = 'block';
    } else {
        menuCapas.style.display = 'none';
    }
}

// Event listener para el botón de capas
botonCapas.addEventListener('click', toggleMenuCapas);

// Event listener para cerrar el menú al hacer clic fuera de él
document.addEventListener('click', function(event) {
    if (!botonCapas.contains(event.target) && !menuCapas.contains(event.target)) {
        menuCapas.style.display = 'none';
    }
});


/////  INICIO CAPA MI TRAMO  /////---------------------------------------------------------------------------------------

let capaMiTramoTrack = null; // Variable para la capa de trazado de "Mi Tramo"
let capaMiTramoEdificios = null; // Variable para la capa de edificios de "Mi Tramo"
const rangoMiTramo = 2000; // Rango en metros alrededor del PK del usuario para "Mi Tramo"

// Función para activar la capa "Mi Tramo"
async function activarCapaMiTramo() {
    if (!window.pkMasCercano) {
        console.warn("No se puede activar 'Mi Tramo' sin PK cercano.");
        alert("Calculando PK actual antes de activar 'Mi Tramo'...");
        await calcularYActualizarPK(); // Asegurarse de tener el PK calculado
        if (!window.pkMasCercano) {
            alert("No se pudo determinar el PK actual. 'Mi Tramo' no se activará.");
            return;
        }
    }

    const pkUsuarioNumerico = pkToNumber(window.pkMasCercano.pk);
    const lineaUsuario = window.pkMasCercano.linea;

    const pkInicioTramo = pkUsuarioNumerico - rangoMiTramo;
    const pkFinTramo = pkUsuarioNumerico + rangoMiTramo;

    // 1. Filtrar trazado dentro del rango PK
    const puntosTrazadoMiTramo = window.datosCombinadosGlobal.filter(punto => {
        const pkNumericoPunto = pkToNumber(punto.PK);
        return punto.Linea === lineaUsuario && pkNumericoPunto >= pkInicioTramo && pkNumericoPunto <= pkFinTramo;
    });

    // 2. Crear polilínea de trazado simplificada (dos segmentos)
    if (puntosTrazadoMiTramo.length > 0) {
        const coordenadasTrazadoMiTramo = puntosTrazadoMiTramo.map(punto => [parseFloat(punto.Latitud), parseFloat(punto.Longitud)]);

        // Encontrar el índice del punto más cercano al PK del usuario (aproximado)
        let indicePkUsuarioEnTramo = -1;
        let distanciaMinima = Infinity;

        for (let i = 0; i < puntosTrazadoMiTramo.length; i++) {
            const pkNumericoPunto = pkToNumber(puntosTrazadoMiTramo[i].PK);
            const distancia = Math.abs(pkNumericoPunto - pkUsuarioNumerico);
            if (distancia < distanciaMinima) {
                distanciaMinima = distancia;
                indicePkUsuarioEnTramo = i;
            }
        }

        let coordenadasSegmento1 = [];
        let coordenadasSegmento2 = [];

        if (indicePkUsuarioEnTramo !== -1) {
            coordenadasSegmento1 = coordenadasTrazadoMiTramo.slice(0, indicePkUsuarioEnTramo + 1); // Desde inicio hasta PK usuario (incluido)
            coordenadasSegmento2 = coordenadasTrazadoMiTramo.slice(indicePkUsuarioEnTramo); // Desde PK usuario (incluido) hasta el final
        } else {
            coordenadasSegmento1 = coordenadasTrazadoMiTramo; // Si no se encuentra el PK usuario, mostrar todo el tramo como un solo segmento
            coordenadasSegmento2 = []; // No hay segundo segmento
        }


        capaMiTramoTrack = L.layerGroup(); // Usamos LayerGroup para agrupar segmentos

        if (coordenadasSegmento1.length > 1) {
            const polyline1 = L.polyline(coordenadasSegmento1, { color: 'red', weight: 3 }).addTo(mapa);
            capaMiTramoTrack.addLayer(polyline1);
        }
        if (coordenadasSegmento2.length > 1) {
            const polyline2 = L.polyline(coordenadasSegmento2, { color: 'red', weight: 3 }).addTo(mapa);
            capaMiTramoTrack.addLayer(polyline2);
        }
         mapa.addLayer(capaMiTramoTrack);

    }


    // 3. Filtrar y mostrar edificios dentro del rango PK
    const edificiosMiTramo = dataEdificiosArraysGlobal.flat().filter(edificio => { // Ajuste: usar dataEdificiosArraysGlobal
        const pkNumericoEdificio = pkToNumber(edificio.PK);
        return edificio.LINEA === lineaUsuario && pkNumericoEdificio >= pkInicioTramo && pkNumericoEdificio <= pkFinTramo;
    });

        console.log("pkInicioTramo:", pkInicioTramo, "pkFinTramo:", pkFinTramo, "lineaUsuario:", lineaUsuario); // *** AÑADE ESTE CONSOLE.LOG ***
    console.log("Edificios ANTES del filtro Mi Tramo (primeros 5):", dataEdificiosArraysGlobal.flat().slice(0, 5)); // *** AÑADE ESTE CONSOLE.LOG ***
    console.log("Edificios DESPUÉS del filtro Mi Tramo:", edificiosMiTramo); // *** AÑADE ESTE CONSOLE.LOG **

    if (edificiosMiTramo.length > 0) {
        capaMiTramoEdificios = L.layerGroup(); // Usamos LayerGroup para agrupar marcadores
        edificiosMiTramo.forEach(edificio => {
            const puntoCoordenadas = window.coordenadasPorPKLineaGlobal.get(`${edificio.PK}-${edificio.LINEA}`); // Ajuste: usar coordenadasPorPKLineaGlobal
                       console.log("Buscando coordenadas para edificio:", edificio.NOMBRE, "PK:", edificio.PK, "Linea:", edificio.LINEA, " - Coordenadas encontradas:", puntoCoordenadas); // *** AÑADE ESTE CONSOLE.LOG ***
            if (puntoCoordenadas) {
                const icono = crearIconoEdificio(edificio.TIPO);
                if (icono) {
                    const marker = L.marker([puntoCoordenadas.Latitud, puntoCoordenadas.Longitud], { icon: icono })
                        .bindPopup(`<div style="text-align: center;"><b>${edificio.NOMBRE}</b><br>${formatearPK(edificio.PK)} (L${edificio.LINEA})</div>`);
                    capaMiTramoEdificios.addLayer(marker);
                }
            }
        });
        mapa.addLayer(capaMiTramoEdificios);
    }

    mapa.setZoom(16); // Ajustar zoom al activar "Mi Tramo"
}


// Función para desactivar la capa "Mi Tramo"
function desactivarCapaMiTramo() {
    if (capaMiTramoTrack) {
        mapa.removeLayer(capaMiTramoTrack);
        capaMiTramoTrack = null;
    }
    if (capaMiTramoEdificios) {
        mapa.removeLayer(capaMiTramoEdificios);
        capaMiTramoEdificios = null;
    }
}

// Event listener para el checkbox "Mi tramo"
const checkMitramo = document.getElementById('check-mitramo');
if (checkMitramo) {
    checkMitramo.addEventListener('change', function () {
        if (this.checked) {
            activarCapaMiTramo();
        } else {
            desactivarCapaMiTramo();
        }
    });
} else {
    console.error("No se encontró el checkbox 'check-mitramo'");
}

/////  FIN CAPA MI TRAMO /////---------------------------------------------------------------------------------------


/////  INICIO CAPA TRAZADO /////---------------------------------------------------------------------------------------

let trazadosLinea = [];
let ultimoPKPorLinea = {}; // Último PK procesado por línea
const separacionPK = 500; // Selección de puntos cada 2000 unidades de PK

async function activarCapaTrazado() {
    try {
        const datosTrazado = await cargarArchivosJSON(rutasArchivos);
        const puntosPorLinea = agruparYFiltrarPuntos(datosTrazado);
        dibujarLineas(puntosPorLinea);
    } catch (error) {
        console.error("Error al cargar o procesar los datos de trazado:", error);
    }
}

// 🔹 **Agrupar y seleccionar puntos en un solo paso**
function agruparYFiltrarPuntos(datos) {
    const puntosPorLinea = {};

    for (const punto of datos) {
        const linea = punto.Linea;
        const pkNumerico = pkToNumber(punto.PK);

        if (!puntosPorLinea[linea]) {
            puntosPorLinea[linea] = [];
            ultimoPKPorLinea[linea] = pkNumerico; // Inicia con el primer PK
        }

        if (pkNumerico >= ultimoPKPorLinea[linea]) {
            puntosPorLinea[linea].push([parseFloat(punto.Latitud), parseFloat(punto.Longitud)]);
            ultimoPKPorLinea[linea] = pkNumerico + separacionPK; // Salto de 2000 PK
        }
    }

    return puntosPorLinea;
}

// 🔹 **Dibujar líneas solo con los puntos seleccionados**
function dibujarLineas(puntosPorLinea) {
    for (const linea in puntosPorLinea) {
        const coordenadas = puntosPorLinea[linea];

        if (coordenadas.length > 1) {
            const lineaTrazado = L.polyline(coordenadas, {
                color: "blue",
                weight: 2,
                opacity: 0.8
            }).addTo(mapa);
            trazadosLinea.push(lineaTrazado);
        }
    }
}

// 🔹 **Cargar archivos JSON optimizado**
async function cargarArchivosJSON(rutas) {
    const datosCargados = await Promise.all(
        rutas.map(ruta =>
            fetch(ruta)
                .then(response => response.json())
                .catch(error => {
                    console.error(`Error al cargar ${ruta}:`, error);
                    return [];
                })
        )
    );
    return datosCargados.flat();
}

// 🔹 **Conversión de PK a número**
function pkToNumber(pkString) {
    return parseInt(pkString, 10) || 0;
}

// 🔹 **Desactivar capa limpiando solo lo necesario**
function desactivarCapaTrazado() {
    trazadosLinea.forEach(linea => mapa.removeLayer(linea));
    trazadosLinea = [];
    ultimoPKPorLinea = {};
}

// 🔹 **Manejo de evento de activación/desactivación**
checkTrazado.addEventListener('change', function () {
    if (this.checked) {
        activarCapaTrazado();
    } else {
        desactivarCapaTrazado();
    }
});

/////  FIN CAPA TRAZADO /////---------------------------------------------------------------------------------------




/////  INICIO CAPA TIEMPO /////---------------------------------------------------------------------------------------

let cacheTiempo = {}; // Variable global para la caché de datos meteorológicos
const tiempoValidezCache = 15 * 60 * 1000; // 15 minutos en milisegundos
let marcadoresTiempoLayerGroup; // Variable para el grupo de capas de marcadores de tiempo

checkTiempo.addEventListener('change', function() {
    if (this.checked) {
        activarCapaTiempo();
    } else {
        desactivarCapaTiempo();
    }
});

async function obtenerDatosTiempo(lat, lon, ciudadNombre) { // Añadimos ciudadNombre como parámetro
  const ahora = new Date();

  // 1. Comprobar si hay datos en la caché para esta ciudad
  if (cacheTiempo[ciudadNombre]) {
    const datosCacheados = cacheTiempo[ciudadNombre];
    const tiempoCache = datosCacheados.timestamp;

    // 2. Verificar si la caché es válida (menos de 15 minutos de antigüedad)
    if (ahora - tiempoCache < tiempoValidezCache) {
      console.log(`[Cache] Datos de tiempo para ${ciudadNombre} obtenidos de la caché.`);
      return datosCacheados.data; // Devolver datos desde la caché
    } else {
      console.log(`[Cache] Datos de tiempo para ${ciudadNombre} en caché expirados. Actualizando...`);
    }
  }

  // 3. Si no hay caché válida, realizar petición a la API
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKeyOpenWeatherMap}&units=metric&lang=es`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === 200) {
      const datosTiempo = { // Objeto con los datos que queremos guardar en caché
        temperatura: data.main.temp,
        sensacion: data.main.feels_like,
        viento: data.wind.speed,
        descripcion: data.weather[0].description,
        icono: data.weather[0].icon,
      };

      // 4. Guardar los datos en la caché junto con la fecha y hora actual
      cacheTiempo[ciudadNombre] = {
        data: datosTiempo,
        timestamp: ahora,
      };
      console.log(`[Cache] Datos de tiempo para ${ciudadNombre} actualizados y guardados en la caché.`);
      return datosTiempo; // Devolver datos de la API
    } else {
      console.error(`Error al obtener datos de tiempo para ${ciudadNombre}: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.error(`Error al obtener datos de tiempo para ${ciudadNombre}:`, error);
    return null;
  }
}



function mostrarInfoTiempo(ciudad, lat, lon, datosTiempo) {
  if (datosTiempo) {
    // *** MODIFICADO: Construir la ruta a tu icono personalizado ***
    const iconoUrl = `img/iconos-tiempo/${datosTiempo.icono}.png`;
    // *** FIN MODIFICACIÓN ***

    // Función para capitalizar la primera letra (sin cambios)
    function capitalizarPrimeraLetra(texto) {
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    }
    const descripcionCapitalizada = capitalizarPrimeraLetra(datosTiempo.descripcion);

    const popupContent = `
      <div style="text-align: center;">
        <h3 style="margin: 0;">${ciudad}</h3>
        <img src="${iconoUrl}" alt="${datosTiempo.descripcion}" style="width: 40px; height: 40px;">
        <p style="margin: 5px 0;">🌡 Temperatura: ${datosTiempo.temperatura} °C</p>
        <p style="margin: 5px 0;">🥵 Sensación: ${datosTiempo.sensacion} °C</p>
        <p style="margin: 5px 0;">ℹ ${descripcionCapitalizada}</p>
      </div>
    `;

   const marcador = L.marker([lat, lon], {
      icon: L.divIcon({
        className: 'icono-tiempo',
        // *** MODIFICADO: Usar la ruta al icono personalizado en el HTML ***
        html: `<img src="${iconoUrl}" alt="${datosTiempo.descripcion}">`,
       // iconSize: [5, 5], // Puedes ajustar el tamaño si es necesario
      }),
    })
      .addTo(mapa)
      .bindPopup(popupContent);
     return marcador;

  }
  return null;
}

let marcadoresTiempo = []; // Array para almacenar los marcadores de tiempo

async function activarCapaTiempo() {
  // Inicializar el grupo de capas al activar la capa
  marcadoresTiempoLayerGroup = L.layerGroup().addTo(mapa);
  marcadoresTiempo = []; // Limpiar el array de marcadores (opcional, ya que ahora usaremos layerGroup)

  const ciudades = [
        { nombre: "Estación AVE Alicante", ciudad: "Alicante", pais: "ES", lat: 38.34504710449551, lon: -0.49624913479889377 }, // Estación de AVE de Alicante ,
        { nombre: "Estación AVE Villena", ciudad: "Villena", pais: "ES", lat: 38.58458615754724, lon: -0.8737778624739008 }, // Estación de AVE de Villena ,
        { nombre: "Estación AVE Albacete", ciudad: "Albacete", pais: "ES", lat: 39.0000, lon: -1.8482 }, // Estación de AVE de Albacete
        { nombre: "Estación AVE Valencia", ciudad: "Valencia", pais: "ES", lat: 39.4598, lon: -0.3832 }, // Estación de AVE de Valencia (Joaquín Sorolla)
        { nombre: "Estación AVE Requena", ciudad: "Requena", pais: "ES", lat: 39.4912, lon: -1.1049 }, // Estación de AVE de Requena-Utiel ,
        { nombre: "Estación AVE Cuenca", ciudad: "Cuenca", pais: "ES", lat: 40.03475517879438, lon: -2.1447602073689995 }, // Estación de AVE de Cuenca (Fernando Zóbel) ,
        { nombre: "Madrid Sur", ciudad: "Madrid", pais: "ES", lat: 40.347113073135155, lon: -3.6629191646569375 }, // 40.347113073135155, -3.6629191646569375
        { nombre: "Estación Madrid Atocha", ciudad: "Madrid", pais: "ES", lat: 40.40305191998353, lon: -3.6880508709609807 }, // Estación de Madrid Atocha 40.40305191998353,
        { nombre: "Madrid - Paseo Rey", ciudad: "Madrid", pais: "ES", lat: 40.42476032513849, lon: -3.722183550683615 }, // Estación de Madrid Atocha ,
        { nombre: "Estación Madrid Chamartín", ciudad: "Madrid", pais: "ES", lat: 40.4722, lon: -3.6825 }, // Estación de Madrid Chamartín

        { nombre: "BM Villarrubia", ciudad: "Villarrubia", pais: "ES", lat: 39.9577, lon: -3.3513 },
        { nombre: "BM Requena", ciudad: "Requena", pais: "ES", lat: 39.5364, lon: -1.1565 },
        { nombre: "BM Gabaldón", ciudad: "Gabaldón", pais: "ES", lat: 39.6359, lon: -1.9448 },
        { nombre: "BM Monforte", provincia: "Alicante", pais: "ES", lat: 38.4069, lon: -0.6949 },
  ];

  for (const ciudad of ciudades) {
    try {
      const datosTiempo = await obtenerDatosTiempo(ciudad.lat, ciudad.lon, ciudad.nombre);
      if (datosTiempo) {
        const marcador = mostrarInfoTiempo(ciudad.nombre, ciudad.lat, ciudad.lon, datosTiempo);
        if (marcador) {
          marcadoresTiempo.push(marcador); // Mantener el array para referencia si es necesario
          marcadoresTiempoLayerGroup.addLayer(marcador); // Añadir marcador al grupo de capas
        }
      }
    } catch (error) {
      console.error(
        `Error al obtener datos de tiempo para ${ciudad.nombre}:`,
        error
      );
    }
  }

  // Establecer un nivel de zoom fijo al activar la capa Tiempo
  mapa.setZoom(7); // Nivel de zoom fijo (puedes ajustarlo)
}

function desactivarCapaTiempo() {
    if (marcadoresTiempoLayerGroup) {
        mapa.removeLayer(marcadoresTiempoLayerGroup); // Eliminar el grupo de capas del mapa
        marcadoresTiempoLayerGroup = null; // Limpiar la variable del grupo de capas
    }
    marcadoresTiempo = []; // Limpiar el array de marcadores
}

/////  FIN CAPA TIEMPO /////---------------------------------------------------------------------------------------



/////  INICIO CAPA EDIFICIOS /////---------------------------------------------------------------------------------------


const iconosEdificios = {
    "SE": 'img/edificios/se_icon.png',
    "ATI": 'img/edificios/energia_icon.png',
    "ATF": 'img/edificios/energia_icon.png',
    "BTS": 'img/edificios/bts_icon.png',
    "CS": 'img/edificios/iiss_icon.png',
    "ET": 'img/edificios/iiss_icon.png',
    "ESTACIÓN": 'img/edificios/estaciones_icon.png',
    "TUNEL": 'img/edificios/tunel_icon.png',
    "BM": 'img/edificios/bm_icon.png'
};

function crearIconoEdificio(tipo) {
    const iconUrl = iconosEdificios[tipo];
    if (!iconUrl) return null;
    return L.icon({
        iconUrl: iconUrl,
        iconSize: [25, 25],
        iconAnchor: [12, 35],
        popupAnchor: [0, -35]
    });
}


function compartirUbicacionEdificio(lat, lon, nombreEdificio) {
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

    if (navigator.share) {
        navigator.share({
            title: `Ubicación de ${nombreEdificio}`,
            text: `Ubicación de ${nombreEdificio} en el mapa:`,
            url: googleMapsUrl
        }).then(() => {
            console.log('Ubicación de edificio compartida exitosamente');
        })
        .catch((error) => console.error('Error al compartir ubicación de edificio', error));
    } else {
        // Si navigator.share no está soportado, muestra una alerta con el enlace
        alert('Tu navegador no soporta la función de compartir. Aquí está el enlace a Google Maps:\n\n' + googleMapsUrl);
    }
}


async function activarCapaEdificios(layerGroup, tipos) {
    try {
        // Cargar y combinar datos de ambos archivos
        const rutasEdificios = ["./doc/edificios/ALBALI.json", "./doc/edificios/TOVAL.json"];
        const dataEdificiosArrays = await Promise.all(rutasEdificios.map(ruta =>
            fetch(ruta).then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar ${ruta}: ${response.statusText}`);
                }
                return response.json();
            }).catch(error => {
                console.error(`Error al cargar ${ruta}:`, error);
                return [];
            })
        ));
        const dataEdificios = dataEdificiosArrays.flat();

        // Mapear coordenadas a un objeto para mejor búsqueda
        const coordenadasPorPKLinea = await crearMapaCoordenadas();

        // Filtrar elementos por tipo
        const elementosFiltrados = dataEdificios.filter(item => tipos.includes(item.TIPO));

        elementosFiltrados.forEach(elemento => {
            const pkElemento = elemento.PK;
            const lineaElemento = elemento.LINEA;
            const key = `${pkElemento}-${lineaElemento}`;

            // Buscar las coordenadas correspondientes al PK y la línea
            const puntoCoordenadas = coordenadasPorPKLinea.get(key);
            const icono = crearIconoEdificio(elemento.TIPO);

            if (puntoCoordenadas && icono) {
                const pkFormateado = formatearPK(pkElemento);
                const marker = L.marker([puntoCoordenadas.Latitud, puntoCoordenadas.Longitud], { icon: icono })
                    .bindPopup(`
                        <div style="text-align: center;">
                            <b style="font-size: 1.1em;">${elemento.NOMBRE}</b><br>
                            ${pkFormateado} (L${lineaElemento})<br><br>
                            <button
                                style="padding: 0; border: none; border-radius: 5px; background-color: transparent; cursor: pointer; display:flex; align-items: center; justify-content: center; margin: 0 auto;"
                                onclick="compartirUbicacionEdificio(${puntoCoordenadas.Latitud}, ${puntoCoordenadas.Longitud}, '${elemento.NOMBRE.replace(/'/g, "\\'")}');"
                                aria-label="Compartir ubicación de ${elemento.NOMBRE}"
                            >
                                <img src="img/edificios/compartirubi.png" alt="Compartir Ubicación" style="width: 77px; height: 35px;">
                            </button>
                        </div>
                    `);
                layerGroup.addLayer(marker);

            } else {
                console.warn(`No se encontraron coordenadas para el PK ${pkElemento} en la línea ${lineaElemento} (Tipo: ${elemento.TIPO})`);
            }
        });
        mapa.addLayer(layerGroup);
          mapa.setZoom(7); // Nivel de zoom fijo (puedes ajustarlo)

    } catch (error) {
        console.error("Error al activar la capa de edificios:", error);
    }
}

async function crearMapaCoordenadas() {

    try {
        const dataCoordenadasArrays = await Promise.all(rutasArchivos.map(ruta =>
            fetch(ruta).then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar ${ruta}: ${response.statusText}`);
                }
                return response.json();
            }).catch(error => {
                console.error(`Error al cargar ${ruta}:`, error);
                return [];
            })
        ));

        const dataCoordenadas = dataCoordenadasArrays.flat();
        const mapaCoordenadas = new Map();

        dataCoordenadas.forEach(punto => {
            const key = `${punto.PK}-${punto.Linea}`;
            mapaCoordenadas.set(key, punto);
        });

        return mapaCoordenadas;

    } catch (error) {
        console.error("Error al crear el mapa de coordenadas:", error);
        return new Map();
    }
}

function desactivarCapaEdificios(layerGroup) {
    mapa.removeLayer(layerGroup);
}

// Event listeners para las capas de edificios
const checkEnergia = document.getElementById('check-energia');
const energiaLayer = L.layerGroup();
checkEnergia.addEventListener('change', function () {
    this.checked ? activarCapaEdificios(energiaLayer, ["SE", "ATI", "ATF"]) : desactivarCapaEdificios(energiaLayer);
});

const checkBts = document.getElementById('check-bts');
const btsLayer = L.layerGroup();
checkBts.addEventListener('change', function () {
    this.checked ? activarCapaEdificios(btsLayer, ["BTS"]) : desactivarCapaEdificios(btsLayer);
});

const checkIiss = document.getElementById('check-iiss');
const iissLayer = L.layerGroup();
checkIiss.addEventListener('change', function () {
    this.checked ? activarCapaEdificios(iissLayer, ["CS", "ET"]) : desactivarCapaEdificios(iissLayer);
});

const checkEstaciones = document.getElementById('check-estaciones');
const estacionesLayer = L.layerGroup();
checkEstaciones.addEventListener('change', function () {
    this.checked ? activarCapaEdificios(estacionesLayer, ["ESTACIÓN", "BM"]) : desactivarCapaEdificios(estacionesLayer);
});

const checkTuneles = document.getElementById('check-tuneles');
const tunelesLayer = L.layerGroup();
checkTuneles.addEventListener('change', function () {
    this.checked ? activarCapaEdificios(tunelesLayer, ["TUNEL"]) : desactivarCapaEdificios(tunelesLayer);
});

/////  FIN CAPA EDIFICIOS /////---------------------------------------------------------------------------------------

    /////  INICIO PUERTAS /////---------------------------------------------------------------------------------------

let cachedPuertasCercanas = null;
let lastUserLocation = null;

function compartirUbicacionPuerta(lat, lon) {
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

    if (navigator.share) {
        navigator.share({
            title: 'Ubicación de Puerta',
            text: 'Aquí está la ubicación de la puerta en el mapa:',
            url: googleMapsUrl
        }).then(() => {
            console.log('Ubicación de puerta compartida exitosamente');
        })
        .catch((error) => console.error('Error al compartir ubicación de puerta', error));
    } else {
        // Si navigator.share no está soportado, muestra una alerta con el enlace
        alert('Tu navegador no soporta la función de compartir. Aquí está el enlace a Google Maps:\n\n' + googleMapsUrl);
    }
}


 function mostrarPuertasCercanas() {
        console.log("Mostrando puertas cercanas...");
        if (!lat || !lon) {
            alert("No se ha obtenido la ubicación actual del usuario.");
            return;
        }

        // Mostrar el mensaje de "Buscando puertas..." inmediatamente
        puertasInfoDiv.innerHTML = '<p style="text-align: center;">Buscando puertas...</p>';
        puertasContainer.style.display = "flex";

        if (!window.pkMasCercano || !window.pkMasCercano.linea) {
            alert("No se puede determinar la línea del usuario. Calculando PK...");
            calcularYActualizarPK().then(() => { // Recalcular PK and then show doors
                if (window.pkMasCercano && window.pkMasCercano.linea) {
                    mostrarPuertasCercanasInterno(); // Call the internal function after PK is updated
                } else {
                    alert("No se pudo determinar la línea del usuario.");
                }
            });
            return; // Exit this function execution and wait for PK calculation
        } else {
            mostrarPuertasCercanasInterno(); // If line is available, directly show doors
        }
    }

function mostrarPuertasCercanasInterno() {
    const currentLocation = `${lat.toFixed(6)},${lon.toFixed(6)}`;
    console.log("Ubicación actual:", currentLocation);
    console.log("Ubicación en caché:", lastUserLocation);
    if (cachedPuertasCercanas && lastUserLocation === currentLocation) {
        console.log("Usando puertas cercanas cacheadas.");
        const html = generarHTMLPuertas(cachedPuertasCercanas);
        puertasInfoDiv.innerHTML = html;
        puertasContainer.style.display = "flex";
         agregarEventosVerMapa(cachedPuertasCercanas);
    } else {
        console.log("No se usa la caché, recalculando puertas...");
        // Filtrar puertasData por la línea del usuario
        const lineaUsuario = window.pkMasCercano.linea;
        const puertasLineaUsuario = puertasData.filter(puerta => puerta.Linea === lineaUsuario);

        calcularPuertasCercanas(lat, lon, puertasLineaUsuario)
            .then(puertasCercanas => {
                 lastUserLocation = currentLocation;
                cachedPuertasCercanas = puertasCercanas;
                console.log("Puertas cercanas calculadas:", puertasCercanas);
                const html = generarHTMLPuertas(puertasCercanas);
                puertasInfoDiv.innerHTML = html;
                puertasContainer.style.display = "flex";
                 agregarEventosVerMapa(puertasCercanas);
            })
            .catch(error => {
                console.error("Error al calcular las puertas:", error);
                alert("Error al calcular las puertas cercanas.");
            });
      }
}
function agregarEventosVerMapa(puertasCercanas) {
      setTimeout(() => { // Asegurar que el contenido se ha renderizado
        const enlacesVerMapa = document.querySelectorAll('.ver-en-mapa');
         enlacesVerMapa.forEach(enlace => {
            enlace.addEventListener('click', function(event) {
                event.preventDefault(); // Evita que el enlace recargue la página

                // Cerrar la tarjeta de puertas
                ocultarPuertasCercanas();

                const latPuerta = parseFloat(this.dataset.lat);
                const lonPuerta = parseFloat(this.dataset.lon);
                const via = this.dataset.via;

                // Obtener el elemento padre .puerta-fila
                 const puertaFila = this.closest(".puerta-fila");
                // Extraer el texto del SPAN, en este caso toda la info de la puerta
                 const puertaTexto = puertaFila.querySelector("span").textContent;
                // Expresión regular para encontrar el PK en la cadena
                 const pkRegex = /PK (\d+[+]?\d+)/;
                // Buscar el PK usando la expresión regular
                const pkMatch = puertaTexto ? puertaTexto.match(pkRegex) : null; // Check if puertaTexto is not null
                // Si se encuentra un PK, se guarda en la variable. Si no, se deja vacío.
                const pk = pkMatch ? pkMatch[1] : "";

                // Crear el marcador de la puerta
                const iconoPuertaMapa = L.icon({
                    iconUrl: 'img/iconopuerta.png',
                    iconSize: [30, 30],
                    iconAnchor: [15, 30],
                    popupAnchor: [0, -30]
                });
                const marcadorPuerta = L.marker([latPuerta, lonPuerta], { icon: iconoPuertaMapa })
                    .addTo(mapa)
                   .bindPopup(`
    <div style="text-align: center;">
        <p style="margin: 0; font-size: 1.2em;">Vía ${via}</p>
        <p style="margin: 0; font-size: 1.3em; font-weight: bold;">PK ${pk}</p><br>
        <button id="compartirUbicacionBtn"
                onclick="compartirUbicacionPuerta(${latPuerta}, ${lonPuerta})" 
                style="padding: 8px 12px; border: none; border-radius: 5px; background-color: #007bff; color: white; cursor: pointer;">Compartir 💬</button>
    </div>
`);

                // *** INICIO: AÑADIR EVENT LISTENER PARA BOTÓN COMPARTIR EN POPUP DE PUERTA ***
        marcadorPuerta.on('popupopen', function() {
            const compartirUbicacionBtn = document.getElementById('compartirUbicacionBtn');
            compartirUbicacionBtn.addEventListener('click', function() {
                // Obtener las coordenadas DEL MARCADOR DE LA PUERTA directamente
                const markerLatLng = marcadorPuerta.getLatLng();
                const markerLat = markerLatLng.lat;
                const markerLng = markerLatLng.lng;

                const googleMapsUrl = `https://www.google.com/maps?q=${markerLat},${markerLng}`;

                if (navigator.share) {
                    navigator.share({
                        title: 'Ubicación de Puerta',
                        text: 'Aquí está la ubicación de la puerta en el mapa:',
                        url: googleMapsUrl
                    }).then(() => {
                        console.log('Ubicación de puerta compartida exitosamente');
                    })
                    .catch((error) => console.error('Error al compartir ubicación de puerta', error));
                } else {
                    // Si navigator.share no está soportado, muestra una alerta con el enlace
                    alert('Tu navegador no soporta la función de compartir. Aquí está el enlace a Google Maps:\n\n' + googleMapsUrl);
                }
            });
        });

                // Centrar el mapa para mostrar al usuario y la puerta
                if (lat && lon) {
                    const bounds = L.latLngBounds([lat, lon], [latPuerta, lonPuerta]);
                    mapa.fitBounds(bounds);
                }
            });
        });
    const verTodasPuertas = document.getElementById('ver-todas-puertas');
    if(verTodasPuertas){
            verTodasPuertas.addEventListener('click', function(event) {
                event.preventDefault(); // Prevenir la acción por defecto del enlace
                    ocultarPuertasCercanas(); // Cerrar la tarjeta de puertas
                const puertas = JSON.parse(this.dataset.puertas);
                mostrarTodasPuertas(puertas); // Mostrar todas las puertas en el mapa
             });
    }
    }, 0);
}


function ocultarPuertasCercanas() {
    console.log("Ocultando la tarjeta de puertas...");
    puertasContainer.style.display = "none";
}

 function mostrarTodasPuertas(puertas) {
        console.log("Mostrando todas las puertas en el mapa:", puertas);
        if (!puertas || puertas.length === 0) {
            console.log("No hay puertas para mostrar.");
            return;
        }

        const bounds = [];
        const iconoPuertaMapa = L.icon({
                    iconUrl: 'img/iconopuerta.png',
                    iconSize: [30, 30],
                    iconAnchor: [15, 30],
                    popupAnchor: [0, -30]
        });

        puertas.forEach(puerta => {
            const marcadorPuerta = L.marker([puerta.Latitud, puerta.Longitud], { icon: iconoPuertaMapa })
                .addTo(mapa)
                  .bindPopup(`
    <div style="text-align: center;">
        <p style="margin: 0; font-size: 1.2em;">Vía ${puerta.Via}</p>
        <p style="margin: 0; font-size: 1.3em; font-weight: bold;">PK ${formatearPK(puerta.PK)}</p><br>
        <button id="compartirUbicacionBtn"
                onclick="compartirUbicacionPuerta(${puerta.Latitud}, ${puerta.Longitud})" 
                style="padding: 8px 12px; border: none; border-radius: 5px; background-color: #007bff; color: white; cursor: pointer;">Compartir 💬</button>
    </div>
`);


 // *** INICIO: AÑADIR EVENT LISTENER PARA BOTÓN COMPARTIR EN POPUP DE PUERTA (MOSTRAR TODAS) ***
            marcadorPuerta.on('popupopen', function() {
                const compartirUbicacionBtn = document.getElementById('compartirUbicacionBtn');
                compartirUbicacionBtn.addEventListener('click', function() {
                    // Obtener las coordenadas DEL MARCADOR DE LA PUERTA directamente
                    const markerLatLng = marcadorPuerta.getLatLng();
                    const markerLat = markerLatLng.lat;
                    const markerLng = markerLatLng.lng;

                    const googleMapsUrl = `https://www.google.com/maps?q=${markerLat},${markerLng}`;

                    if (navigator.share) {
                        navigator.share({
                            title: 'Ubicación de Puerta',
                            text: 'Aquí está la ubicación de la puerta en el mapa:',
                            url: googleMapsUrl
                        }).then(() => {
                            console.log('Ubicación de puerta compartida exitosamente (desde mostrarTodasPuertas)');
                        })
                        .catch((error) => console.error('Error al compartir ubicación de puerta (desde mostrarTodasPuertas)', error));
                    } else {
                        // Si navigator.share no está soportado, muestra una alerta con el enlace
                        alert('Tu navegador no soporta la función de compartir. Aquí está el enlace a Google Maps:\n\n' + googleMapsUrl);
                    }
                });
            });
            
              bounds.push([puerta.Latitud, puerta.Longitud]);

        });
        if (lat && lon)
        {
          bounds.push([lat,lon])
        }
    mapa.fitBounds(bounds);
}


async function calcularPuertasCercanas(latUsuario, lonUsuario, puertasFiltradas) { // <-- Puertas filtradas como argumento
    console.log("Calculando puertas cercanas...");
    const puertasPorVia = {};
    const pkUsuarioNumerico = pkToNumber(window.pkMasCercano.pk);
    console.log("PK del usuario (numérico):", pkUsuarioNumerico);

    puertasFiltradas.forEach(puerta => { // Usar puertasFiltradas en lugar de puertasData
        const pkPuertaNumerico = parseInt(puerta.PK, 10);
        const diferenciaPK = pkPuertaNumerico - pkUsuarioNumerico;
        console.log(`Puerta PK: ${puerta.PK}, numérico: ${pkPuertaNumerico}, diferencia: ${diferenciaPK}, vía: ${puerta.Via}`);

        if (!puertasPorVia[puerta.Via]) {
            puertasPorVia[puerta.Via] = [];
        }
        puertasPorVia[puerta.Via].push({ ...puerta, diferenciaPK });
    });
    console.log("Puertas agrupadas por vía:", puertasPorVia);

    const puertasCercanasPorVia = {};

    for (const via in puertasPorVia) {
        console.log(`Procesando vía: ${via}`);
        const puertasOrdenadas = puertasPorVia[via].sort((a, b) => a.diferenciaPK - b.diferenciaPK);
        let crecienteMasCercana = null;
        let decrecienteMasCercana = null;
        console.log(`Puertas ordenadas para vía ${via}:`, puertasOrdenadas);

        for (const puerta of puertasOrdenadas) {
            console.log(`  - Puerta PK: ${puerta.PK}, diferencia: ${puerta.diferenciaPK}`);
            if (puerta.diferenciaPK > 0 && !crecienteMasCercana) {
                console.log(`    - Encontrada puerta creciente más cercana: ${puerta.PK}`);
                crecienteMasCercana = puerta;
            } else if (puerta.diferenciaPK < 0) {
                console.log(`    - Encontrada puerta decreciente más cercana: ${puerta.PK}`);
                decrecienteMasCercana = puerta;
            }
            if (crecienteMasCercana && decrecienteMasCercana) {
                console.log("    - Puertas crecientes y decrecientes encontradas. Saliendo del loop.");
                break;
            }
        }
        puertasCercanasPorVia[via] = { creciente: crecienteMasCercana, decreciente: decrecienteMasCercana };
        console.log(`Puertas cercanas para la vía ${via}:`, puertasCercanasPorVia[via]);
    }
    console.log("Puertas cercanas calculadas (antes de coordenadas):", puertasCercanasPorVia);
    return obtenerCoordenadasPuertasCercanas(puertasCercanasPorVia);
}

async function obtenerCoordenadasPuertasCercanas(puertasCercanasPorVia) {
    console.log("Obteniendo coordenadas de puertas cercanas...");

    const datosTraza = await cargarArchivosJSON(rutasArchivos);
       console.log("Datos de traza cargados:", datosTraza);

    for (const via in puertasCercanasPorVia) {
         console.log(`Procesando via: ${via}`);
        for (const sentido in puertasCercanasPorVia[via]) {
            const puerta = puertasCercanasPorVia[via][sentido];
            if (puerta) {
                const pkPuertaNumerico = parseInt(puerta.PK, 10);
                const lineaPuerta = puerta.Linea;
                 console.log(`  - Buscando coordenadas para puerta PK: ${puerta.PK}, numérico: ${pkPuertaNumerico}, línea: ${lineaPuerta}`);

                const puntoEnTraza = datosTraza.find(
                    (punto) => parseInt(punto.PK, 10) === pkPuertaNumerico && punto.Linea === lineaPuerta
                );

                if (puntoEnTraza) {
                      console.log(`    - Coordenadas encontradas para PK ${puerta.PK}:`, puntoEnTraza);
                    puertasCercanasPorVia[via][sentido] = {
                        ...puerta,
                        Latitud: parseFloat(puntoEnTraza.Latitud),
                        Longitud: parseFloat(puntoEnTraza.Longitud),
                    };
                } else {
                     console.warn(`    - No se encontraron coordenadas para la puerta PK ${puerta.PK} en la línea ${lineaPuerta}`);
                    puertasCercanasPorVia[via][sentido] = null;
                }
            }
        }
          console.log(`Puertas cercanas con coordenadas para la vía ${via}:`, puertasCercanasPorVia[via]);
    }
    console.log("Puertas cercanas con coordenadas:", puertasCercanasPorVia);
    return puertasCercanasPorVia;
}

function generarHTMLPuertas(puertasCercanas) {
    console.log("Generando HTML de puertas cercanas...", puertasCercanas);

    let html = '';

    if (window.pkMasCercano) {
        const pkActualFormateado = formatearPK(window.pkMasCercano.pk);
       html += `<p style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 1.3em;">▶️ Estás en el PK: ${pkActualFormateado} ◀️</p>`;
    } else {
        html += `<p style="text-align: center; font-style: italic; margin-bottom: 30px;">Calculando PK actual...</p>`;
    }

    let puertasArray = [];

    for (const via in puertasCercanas) {
        const tienePuertas = puertasCercanas[via].creciente || puertasCercanas[via].decreciente;
        if (tienePuertas) {
            console.log(`Agregando título de vía: ${via}`);
           html += `<h3 style="margin-bottom: 5px; margin-top: 25px;"><u>Vía ${via}</u></h3>`; // Subrayado aquí
        }


        if (puertasCercanas[via].creciente) {
            const puerta = puertasCercanas[via].creciente;
            const distanciaFormateada = puerta.diferenciaPK.toFixed(0);
            const pkFormateado = formatearPK(puerta.PK);
            console.log(`  - Agregando puerta creciente: PK ${puerta.PK}, distancia ${distanciaFormateada}, Latitud: ${puerta.Latitud}, Longitud: ${puerta.Longitud}`);

            html += `<div class="puerta-fila">
                        <span>🚪 a + ${distanciaFormateada} metros - PK ${pkFormateado}
                        <a href="#" class="ver-en-mapa" data-lat="${puerta.Latitud}" data-lon="${puerta.Longitud}" data-via="${via}">
                            <img src="img/vermapa.png" alt="Ver en el mapa" style="width: 20px; height: 20px; vertical-align: middle;">
                        </a>
                        </span>
                    </div>`;
            puertasArray.push(puerta);
        }


        if (puertasCercanas[via].decreciente) {
            const puerta = puertasCercanas[via].decreciente;
            const distanciaFormateada = puerta.diferenciaPK.toFixed(0);
            const pkFormateado = formatearPK(puerta.PK);
            console.log(`  - Agregando puerta decreciente: PK ${puerta.PK}, distancia ${distanciaFormateada}, Latitud: ${puerta.Latitud}, Longitud: ${puerta.Longitud}`);
            html += `<div class="puerta-fila">
                        <span>🚪 a ${distanciaFormateada} metros - PK ${pkFormateado}
                        <a href="#" class="ver-en-mapa" data-lat="${puerta.Latitud}" data-lon="${puerta.Longitud}" data-via="${via}">
                            <img src="img/vermapa.png" alt="Ver en el mapa" style="width: 20px; height: 20px; vertical-align: middle;">
                        </a>
                        </span>
                    </div>`;
            puertasArray.push(puerta);
        }
    }

    if (html === '') {
           console.log("No se encontraron puertas cercanas. Mostrando mensaje.");
        html = '<p>No se encontraron puertas cercanas.</p>';
    } else {
          console.log("Añadiendo enlaces para ver todas las puertas y buscar por PK");
        html += `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 15px;">
            <a href="#" id="ver-todas-puertas" data-puertas='${JSON.stringify(puertasArray)}' style="margin-right: auto;">
                <img src="img/vertodasmapa.png" alt="Ver todas las puertas en el mapa" style="width: 120px; height: auto;">
            </a>
            <a href="#" id="buscar-puerta-por-pk">
                <img src="img/buscapuerta.png" alt="Buscar puerta por PK" style="width: 120px; height: auto;">
            </a>
        </div>
        <div id="mensaje-proximamente" style="display: none; text-align: center; margin-top: 10px; background-color: #f8f9fa; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
            <p style="font-weight: bold; color: #333;">PROXIMAMENTE</p>
            <p style="color: #333;">Búsqueda de Puertas por PK</p>
        </div>
    `;
    }
      console.log("HTML de puertas generado:", html);

    return html;
}




            /////  INCIO BOTÓN BUSQUEDA PUERTAS POR PK /////---------------------------------------------------------------------------------------

            // Event listener para el botón "Buscar puerta por PK"
            document.addEventListener('click', function(event) {
                if (event.target.closest('#buscar-puerta-por-pk')) {
                    const mensajeProximamente = document.getElementById('mensaje-proximamente');
                    if (mensajeProximamente) {
                        mensajeProximamente.style.display = 'block';
                        // Ocultar el mensaje después de 3 segundos
                        setTimeout(() => {
                            mensajeProximamente.style.display = 'none';
                        }, 3000);
                    }
                }
            });

            /////  INCIO BOTÓN BUSQUEDA PUERTAS POR PK /////---------------------------------------------------------------------------------------


// Modifica la parte donde se muestra la tarjeta de puertas para agregar el event listener
document.getElementById("iconoPuerta").addEventListener("click", () => {
    mostrarPuertasCercanas();
});

// Event Listener para cerrar la tarjeta de puertas
cerrarPuertasCard.addEventListener("click", ocultarPuertasCercanas);

document.getElementById("actualizarUbicacion").addEventListener("click", () => {
    if (marcadorActual) {
        const { lat, lng } = marcadorActual.getLatLng();
        mapa.setView([lat, lng], 18);
        centradoAutomaticamente = true;
    }
});

/////  FIN PUERTAS /////---------------------------------------------------------------------------------------


///// INICIO ICONO PLUS /////

document.getElementById("iconoPlus").addEventListener("click", () => {
    document.getElementById("plus-card-container").style.display = "flex";
});

document.getElementById("cerrar-plus-card").addEventListener("click", () => {
    document.getElementById("plus-card-container").style.display = "none";
});


                // ----- INICIO FUNCIONALIDAD BOTÓN CIRCULACIÓN -----
                
                document.addEventListener('DOMContentLoaded', function() {
                    const circulacionButton = document.querySelector('.plus-option-button[aria-label="CIRCULACIÓN"]');
                
                    if (circulacionButton) {
                        circulacionButton.addEventListener('click', function() {
                            document.getElementById('circulacion-card-container').style.display = 'flex'; // Mostrar la tarjeta de operadores
                            generarBotonesOperadores(); // Llama a la función para generar los botones
                        });
                    } else {
                        console.error('No se encontró el botón CIRCULACIÓN'); // Mensaje de error si no se encuentra el botón
                    }
                });
                
                // ----- FIN FUNCIONALIDAD BOTÓN CIRCULACIÓN -----
                
                
// ----- INICIO FUNCIONALIDAD LISTADO OPERADORES CIRCULACIÓN -----



const operadoresCirculacionData = [
    {
        nombre: "Operador Banda Albacete 1",
        lineas: [{ linea: "40", pk_inicio: 35000, pk_fin: 240574 }],
        telefono: "967539500"
    },
    {
        nombre: "Operador Banda Albacete 2",
        lineas: [{ linea: "40", pk_inicio: 272379, pk_fin: 397214 }],
        telefono: "967539502"
    },
    {
        nombre: "Operador Banda Albacete 3",
        lineas: [
            { linea: "40", pk_inicio: 240574, pk_fin: 272379 },
            { linea: "42", pk_inicio: 248102, pk_fin: 485975 },
            { linea: "46", pk_inicio: 461356, pk_fin: 467551 }
        ],
        telefono: "967539532"
    },
    {
        nombre: "Operador Banda Albacete 4",
        lineas: [{ linea: "46", pk_inicio: 467551, pk_fin: 529281 }],
        telefono: "967539511"
    },
    {
        nombre: "Operador Banda Atocha",
        lineas: [{ linea: "40", pk_inicio: 0, pk_fin: 35000 }],
        telefono: "914688406"
    },
];

document.addEventListener('DOMContentLoaded', function() {
    const circulacionButton = document.querySelector('.plus-option-button[aria-label="CIRCULACIÓN"]');
    const circulacionCardContainer = document.getElementById('circulacion-card-container');
    const operadoresContainer = document.getElementById('operadores-container');
    const cerrarCirculacionCardButton = document.getElementById('cerrar-circulacion-card');

    if (circulacionButton) {
        circulacionButton.addEventListener('click', function() {
            circulacionCardContainer.style.display = 'flex';
            generarBotonesOperadores();
        });
    } else {
        console.error('No se encontró el botón CIRCULACIÓN');
    }

    if (cerrarCirculacionCardButton) {
        cerrarCirculacionCardButton.addEventListener('click', function() {
            circulacionCardContainer.style.display = 'none';
        });
    } else {
        console.error('No se encontró el botón de cerrar de la tarjeta de Circulación');
    }

function generarBotonesOperadores() {
    const operadoresContainer = document.getElementById('operadores-container');
    operadoresContainer.innerHTML = '';
    operadoresContainer.innerHTML += `<h3 style="text-align: center; margin-top: 10px; margin-bottom: 10px;"><u>CRC ALBACETE</u></h3>`;

    operadoresCirculacionData.forEach((operador) => {
        const botonOperador = document.createElement('a');
        botonOperador.href = `tel:${operador.telefono}`;
        botonOperador.className = 'operador-button circulacion-option-button';

        let descripcionHTML = "";
        operador.lineas.forEach(lineaInfo => {
            descripcionHTML += `🔹L${lineaInfo.linea}: Pk ${formatearPK(lineaInfo.pk_inicio)} al Pk ${formatearPK(lineaInfo.pk_fin)}<br>`;
        });

        botonOperador.innerHTML = `<b>📞 ${operador.nombre}</b><br><span class="operador-descripcion">${descripcionHTML}</span>`;

        if (operador.nombre === "Operador Banda Atocha") {
            operadoresContainer.innerHTML += `<h3 style="text-align: center; margin-top: 20px; margin-bottom: 10px;"><u>CRC MADRID</u></h3>`;
        }
        operadoresContainer.appendChild(botonOperador);
    });

    // Lógica simplificada para destacar el botón del operador recomendado
    if (window.pkMasCercano) {
        const pkNumericoUsuario = pkToNumber(window.pkMasCercano.pk);
        const lineaUsuario = window.pkMasCercano.linea;

        const botonesOperadorCirculacion = operadoresContainer.querySelectorAll('.circulacion-option-button');

        botonesOperadorCirculacion.forEach((boton, index) => {
            const operador = operadoresCirculacionData[index];
            let operadorRecomendado = false;

            operador.lineas.forEach(lineaInfo => {
                if (lineaUsuario === lineaInfo.linea && pkNumericoUsuario >= lineaInfo.pk_inicio && pkNumericoUsuario <= lineaInfo.pk_fin) {
                    operadorRecomendado = true;
                }
            });

            if (operadorRecomendado) {
                boton.style.backgroundColor = '#ffeb3b';
                boton.style.border = '4px solid #fbc02d';
            }
        });
    }
}
});

// ----- FIN FUNCIONALIDAD LISTADO OPERADORES CIRCULACIÓN -----





                    // ----- INICIO FUNCIONALIDAD BOTÓN CPS -----
                    
                    const operadoresCpsData = [ // Array con los datos de los operadores CPS
                        {
                            nombre: "CPS Valencia",
                            lineas: [
                                "L40 desde 293+907 hasta Valencia Estación",
                                "L42 desde 412+783 hasta Alicante Estación"
                            ],
                            telefono: "963131735" // No mostrar en la tarjeta inicialmente
                        },
                        {
                            nombre: "CPS Madrid",
                            lineas: [
                                "L40 desde Madrid Chamartín hasta 293+907",
                                "L42 desde Bif. Albacete hasta 412+783"
                            ],
                            telefono: "913008066" // No mostrar en la tarjeta inicialmente
                        },
                    ];
                    
                    document.addEventListener('DOMContentLoaded', function() {
                        const cpsButton = document.querySelector('.plus-option-button[aria-label="CPS"]');
                        const cpsCardContainer = document.getElementById('cps-card-container');
                        const cpsContentContainer = document.getElementById('cps-content'); // Contenedor para el contenido de CPS
                        const cerrarCpsCardButton = document.getElementById('cerrar-cps-card');
                    
                        if (cpsButton) {
                            cpsButton.addEventListener('click', function() {
                                cpsCardContainer.style.display = 'flex'; // Mostrar la tarjeta CPS
                                generarContenidoCps(); // Llama a la función para generar el contenido de CPS
                            });
                        } else {
                            console.error('No se encontró el botón CPS');
                        }
                    
                        if (cerrarCpsCardButton) {
                            cerrarCpsCardButton.addEventListener('click', function() {
                                cpsCardContainer.style.display = 'none'; // Ocultar la tarjeta CPS al hacer clic en "Cerrar"
                            });
                        } else {
                            console.error('No se encontró el botón de cerrar de la tarjeta CPS');
                        }
                    
function generarContenidoCps() {
    const cpsContentContainer = document.getElementById('cps-content');
    cpsContentContainer.innerHTML = '';

    operadoresCpsData.forEach(operador => {
        const botonCps = document.createElement('a');
        botonCps.href = `tel:${operador.telefono}`;
        botonCps.className = 'operador-button cps-option-button';
        botonCps.innerHTML = `<b>📞 ${operador.nombre}</b><br><span class="operador-descripcion">${operador.lineas.join('<br>')}</span>`;
        cpsContentContainer.appendChild(botonCps);
    });

    if (window.pkMasCercano) {
        const pkNumerico = pkToNumber(window.pkMasCercano.pk);
        const lineaUsuario = window.pkMasCercano.linea;
        let cpsRecomendado = "CPS Madrid";

        if (
            (lineaUsuario === '40' && pkNumerico > 293907) ||
            (lineaUsuario === '42' && pkNumerico > 412783) ||
            lineaUsuario === '46' ||
            lineaUsuario === '48'
        ) {
            cpsRecomendado = "CPS Valencia";
        }

        const textoInformativo = `ℹ️ Estás en el PK ${formatearPK(window.pkMasCercano.pk)} de la línea ${lineaUsuario}.<br>Este punto pertenece al ámbito de <br><b>${cpsRecomendado}</b>.`;

        const infoParrafo = document.createElement('p');
        infoParrafo.className = 'cps-info-text';
        infoParrafo.innerHTML = textoInformativo;
        cpsContentContainer.appendChild(infoParrafo);

        // Destacar el botón del CPS recomendado
        const botonesCps = cpsContentContainer.querySelectorAll('.cps-option-button');
        botonesCps.forEach(boton => {
            if (boton.innerHTML.includes(cpsRecomendado)) {
                boton.style.backgroundColor = '#ffeb3b'; // Color de fondo destacado
                boton.style.border = '4px solid #fbc02d'; // Borde destacado
            }
        });
    } else {
        cpsContentContainer.innerHTML += '<p style="font-style: italic;">No se pudo determinar tu ubicación para recomendar CPS.</p>';
    }
}
                    });
                    
                    // ----- FIN FUNCIONALIDAD BOTÓN CPS -----



// ----- INICIO FUNCIONALIDAD BOTÓN CSI -----
                
                const operadoresCsiData = [ // Array con los datos de los operadores CSI
                    {
                        nombre: "CSI Albacete",
                        lineas: [
                            "L40 - Desde Bif.Torrejón hasta Valencia Est.",
                            "L42 - Desde Bif.Albacete hasta Alicante Est.",
                            "L46 - Toda la línea"
                        ],
                        telefono: "967539504" // No visible en la tarjeta
                    },
                    {
                        nombre: "CSI Madrid",
                        lineas: [
                            "L40 - Desde Madrid Chamartín hasta Bif.Torrejón"
                        ],
                        telefono: "914688275" // No visible en la tarjeta
                    },
                ];
                
                
                document.addEventListener('DOMContentLoaded', function() {
                    const csiButton = document.querySelector('.plus-option-button[aria-label="CSI"]');
                    const csiCardContainer = document.getElementById('csi-card-container');
                    const csiContentContainer = document.getElementById('csi-content');
                    const cerrarCsiCardButton = document.getElementById('cerrar-csi-card');
                
                    if (csiButton) {
                        csiButton.addEventListener('click', function() {
                            csiCardContainer.style.display = 'flex'; // Mostrar la tarjeta CSI
                            generarContenidoCsi(); // Llama a la función para generar el contenido de CSI
                        });
                    } else {
                        console.error('No se encontró el botón CSI');
                    }
                
                    if (cerrarCsiCardButton) {
                        cerrarCsiCardButton.addEventListener('click', function() {
                            csiCardContainer.style.display = 'none'; // Ocultar la tarjeta CSI al hacer clic en "Cerrar"
                        });
                    } else {
                        console.error('No se encontró el botón de cerrar de la tarjeta CSI');
                    }
                
function generarContenidoCsi() {
    const csiContentContainer = document.getElementById('csi-content');
    csiContentContainer.innerHTML = '';

    operadoresCsiData.forEach(operador => {
        const botonCsi = document.createElement('a');
        botonCsi.href = `tel:${operador.telefono}`;
        botonCsi.className = 'operador-button csi-option-button';
        botonCsi.innerHTML = `<b>📞 ${operador.nombre}</b><br><span class="operador-descripcion">${operador.lineas.join('<br>')}</span>`;
        csiContentContainer.appendChild(botonCsi);
    });

    if (window.pkMasCercano) {
        const pkNumerico = pkToNumber(window.pkMasCercano.pk);
        const lineaUsuario = window.pkMasCercano.linea;
        let csiRecomendado = "CSI Albacete";

       if (lineaUsuario === "40" && pkNumerico < 293907 )
       {
           csiRecomendado = "CSI Madrid"
        }

        const textoInformativo = `ℹ️ Estás en el PK ${formatearPK(window.pkMasCercano.pk)} de la línea ${lineaUsuario}.<br>Este punto pertenece al ámbito de <br><b>${csiRecomendado}</b>.`;


        const infoParrafo = document.createElement('p');
         infoParrafo.className = 'csi-info-text';
        infoParrafo.innerHTML = textoInformativo;
        csiContentContainer.appendChild(infoParrafo);

        // Resaltar el botón del CSI recomendado
       const botonesCsi = csiContentContainer.querySelectorAll('.csi-option-button');
            botonesCsi.forEach(boton => {
            if (boton.innerHTML.includes(csiRecomendado)) {
             boton.style.backgroundColor = '#ffeb3b'; // Color de fondo destacado
             boton.style.border = '4px solid #fbc02d'; // Borde destacado
         }
        });


    } else {
       csiContentContainer.innerHTML += '<p style="font-style: italic;">No se pudo determinar tu ubicación para recomendar CSI.</p>';
    }
}
                });
                
                // ----- FIN FUNCIONALIDAD BOTÓN CSI -----


                                // ----- INICIO FUNCIONALIDAD BOTÓN TELEMANDO -----
                                
                                const operadoresTelemandoData = [ // Array con los datos de los operadores TELEMANDO
                                    {
                                        nombre: "Telemando Albacete",
                                        lineas: [
                                            "L40 - Desde Bif.Torrejón hasta Valencia Est.",
                                            "L42 / L46 / L48 - Toda la línea"
                                        ],
                                        telefono: "967539503"
                                    },
                                         {
                                        nombre: "Telemando Atocha",
                                        lineas: [
                                            "L40 - De Madrid Chamartín a Bif.Torrejón"
                                        ],
                                        telefono: "914688255"
                                    },
                                    {
                                        nombre: "Telemando Villaverde",
                                        lineas: [
                                            "Respaldo de toda las líneas"
                                        ],
                                        telefonos: [ // Array de teléfonos para Villaverde
                                            "914688659",
                                            "914688669"
                                        ]
                                    },

                                ];
                                
                                
                                document.addEventListener('DOMContentLoaded', function() {
                                    const telemandoButton = document.querySelector('.plus-option-button[aria-label="TELEMANDO"]');
                                    const telemandoCardContainer = document.getElementById('telemando-card-container');
                                    const telemandoContentContainer = document.getElementById('telemando-content');
                                    const cerrarTelemandoCardButton = document.getElementById('cerrar-telemando-card');
                                
                                    if (telemandoButton) {
                                        telemandoButton.addEventListener('click', function() {
                                            telemandoCardContainer.style.display = 'flex'; // Mostrar la tarjeta TELEMANDO
                                            generarContenidoTelemando(); // Llama a la función para generar el contenido de TELEMANDO
                                        });
                                    } else {
                                        console.error('No se encontró el botón TELEMANDO');
                                    }
                                
                                    if (cerrarTelemandoCardButton) {
                                        cerrarTelemandoCardButton.addEventListener('click', function() {
                                            telemandoCardContainer.style.display = 'none'; // Ocultar la tarjeta TELEMANDO al hacer clic en "Cerrar"
                                        });
                                    } else {
                                        console.error('No se encontró el botón de cerrar de la tarjeta TELEMANDO');
                                    }
                                
                        function generarContenidoTelemando() {
                            const telemandoContentContainer = document.getElementById('telemando-content');
                            telemandoContentContainer.innerHTML = '';
                        
                            operadoresTelemandoData.forEach(operador => {
                                const botonTelemando = document.createElement('a'); // Create <a> for button (consistent)
                                botonTelemando.className = 'operador-button'; // Use ONLY 'operador-button' class (consistent style)
                        
                                // Construct button innerHTML for consistent formatting (Name on top, lines below)
                                botonTelemando.innerHTML = `<b>📞 ${operador.nombre}</b><br><span class="operador-descripcion">${operador.lineas.join('<br>')}</span>`;
                        
                                botonTelemando.href = operador.telefonos ? `tel:${operador.telefonos[0]}` : `tel:${operador.telefono}`; // Default to first phone for Villaverde
                        
                                telemandoContentContainer.appendChild(botonTelemando); // Append directly to container (consistent structure)
                        
                                if (operador.telefonos && operador.telefonos.length > 1) { // Handle second phone for Villaverde if it exists
                                    const botonTelemando2 = document.createElement('a');
                                    botonTelemando2.className = 'operador-button'; // Use ONLY 'operador-button' class (consistent style)
                                    botonTelemando2.innerHTML = `<b>📞 ${operador.nombre} 2</b><br><span class="operador-descripcion">${operador.lineas.join('<br>')}</span>`; // Indicate "(Tel 2)"
                                    botonTelemando2.href = `tel:${operador.telefonos[1]}`; // Link to the second phone number
                                    telemandoContentContainer.appendChild(botonTelemando2); // Append the second button as well
                                }
                            });
                        }
                                    
                });
                
                // ----- FIN FUNCIONALIDAD BOTÓN TELEMANDO -----


                                // ----- INICIO FUNCIONALIDAD BOTÓN ACTAS -----

document.addEventListener('DOMContentLoaded', function() {
    const actasButton = document.querySelector('.plus-option-button[aria-label="ACTAS"]');

    if (actasButton) {
        actasButton.addEventListener('click', function() {
             window.open('https://inecospain.sharepoint.com/:b:/s/MONMUR/ESJKZPzMthtFkoi0ZgjznjABzIc0enH8-NvcGeoqV2zkcg?e=N8XLLz', '_blank'); // Abre la URL en una nueva pestaña
        });
    } else {
        console.error('No se encontró el botón ACTAS');
    }
});

        // ----- FIN FUNCIONALIDAD BOTÓN ACTAS -----


    // ----- INICIO FUNCIONALIDAD BOTÓN MALLAS -----

    const operadoresMallasData = [
        { nombre: "Malla Madrid-Valencia", vinculo: "https://inecospain.sharepoint.com/:b:/s/MONMUR/EcS4mBWyMU5HoVl336R4ILkBQwRDc45bU5LCXeK4owK7Vw?e=sixrSd" },
        { nombre: "Malla Bif.Albacete-Alicante", vinculo: "https://inecospain.sharepoint.com/:b:/s/MONMUR/EabTrGPFMhBDsn8oK3tp_88BqDeLuukuJ8OSZ8fOdCtP7g?e=5FOYZz" },
       { nombre: "Malla Alicante-Murcia", vinculo: "https://inecospain.sharepoint.com/:b:/s/MONMUR/EejdOyp0_dxIjKSSQ3aDQ68BIKlimADApEqpNSy8guVZaA?e=kQxzgQ" },
    ];
    
    
    document.addEventListener('DOMContentLoaded', function() {
        const mallasButton = document.querySelector('.plus-option-button[aria-label="MALLAS"]');
        const mallasCardContainer = document.getElementById('mallas-card-container');
        const mallasContainer = document.getElementById('mallas-container');
        const cerrarMallasCardButton = document.getElementById('cerrar-mallas-card');

        if (mallasButton) {
            mallasButton.addEventListener('click', function() {
                mallasCardContainer.style.display = 'flex'; // Mostrar la tarjeta de operadores
                 generarBotonesMallas();
            });
        } else {
            console.error('No se encontró el botón MALLAS');
        }

          if (cerrarMallasCardButton) {
            cerrarMallasCardButton.addEventListener('click', function() {
               mallasCardContainer.style.display = 'none'; // Ocultar la tarjeta de operadores al hacer clic en "Cerrar"
           });
        } else {
            console.error('No se encontró el botón de cerrar de la tarjeta de MALLAS');
         }

       function generarBotonesMallas() {
         const mallasContainer = document.getElementById('mallas-container'); // Obtener el contenedor AQUÍ
            mallasContainer.innerHTML = ''; // Limpiar el contenedor antes de añadir botones nuevos
            operadoresMallasData.forEach(operador => {
             const botonMalla = document.createElement('a'); // Usar <a> para enlaces tel:
                botonMalla.href = operador.vinculo;
                botonMalla.target = "_blank";
                botonMalla.className = 'operador-button';
                botonMalla.innerHTML = `<b>${operador.nombre}</b>`;
              mallasContainer.appendChild(botonMalla); // Añadir botón al contenedor
          });
       }
    });


 // ----- FIN FUNCIONALIDAD BOTÓN MALLAS -----



 // ----- INICIO FUNCIONALIDAD BOTÓN DIRECTORIO -----
function normalizeText(text) {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

 const directorioData = []; // Array para guardar los datos del directorio
   document.addEventListener('DOMContentLoaded', async function() {
      const directorioButton = document.querySelector('.plus-option-button[aria-label="DIRECTORIO"]');
      const directorioCardContainer = document.getElementById('directorio-card-container');
      const directorioContainer = document.getElementById('directorio-container');
     const cerrarDirectorioCardButton = document.getElementById('cerrar-directorio-card');
     
    // Cargar datos del directorio
    try {
        const response = await fetch("./doc/directorio/directorio.json");
        const data = await response.json();
         directorioData.push(...data);
        } catch (error) {
          console.error('Error al cargar el archivo directorio.json:', error);
          directorioContainer.innerHTML = '<p>Error al cargar los datos del directorio.</p>';
          return; // Salir de la función si falla la carga
    }
   
     // Variables para almacenar las imagenes cargadas
    let logoAdif = null;
    let logoIneco = null;

    if (directorioButton) {
        directorioButton.addEventListener('click', async function() {
             // Carga previa de las imágenes
            logoAdif = await cargarImagen('img/Logo-adif.png');
             logoIneco = await cargarImagen('img/Logo-Ineco.png');
            directorioCardContainer.style.display = 'flex';
            generarFormularioBusqueda(); // Llama a la función para generar el formulario
        });
    } else {
        console.error('No se encontró el botón DIRECTORIO');
    }

    if (cerrarDirectorioCardButton) {
            cerrarDirectorioCardButton.addEventListener('click', function() {
               directorioCardContainer.style.display = 'none';
           });
        } else {
            console.error('No se encontró el botón de cerrar de la tarjeta de DIRECTORIO');
         }

    async function cargarImagen(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img); // Resuelve la promesa con la imagen cargada
            img.onerror = () => {
                console.error(`Error al cargar imagen: ${src}`);
                resolve(null);  // Resuelve la promesa con null si hay un error
            };
        });
    }

      function generarFormularioBusqueda() {
            const directorioContainer = document.getElementById('directorio-container'); // Obtener el contenedor AQUÍ
            directorioContainer.innerHTML = `
            <div id="directorio-formulario">
                <input type="text" id="nombre-input" placeholder="Nombre">
                <select id="ubicacion-select">
                     <option value="">Todos</option>
                </select>
                <select id="puesto-select">
                     <option value="">Todos</option>
                </select>
                 <input type="text" id="telefono-input" placeholder="Teléfono">
                  <div id="directorio-buscar-container">
                      <button id="buscar-btn">Buscar</button>
                  </div>
                  <hr id="separador-resultados">
            </div>
             <div id="directorio-resultados">
                <!-- Aquí se insertará la tabla de resultados -->
            </div>
             `; // Limpiar el contenedor y añadir el formulario
             // Genera los select
             generarSelects();
              const buscarBtn = document.getElementById('buscar-btn');
                  buscarBtn.addEventListener('click', filtrarYMostrarResultados);

          }

   function generarSelects()
    {
       const puestos = [...new Set(directorioData.map(item => item.Puesto))];
       const ubicaciones = [...new Set(directorioData.map(item => item.Ubicación))];

        // Ordenar alfabéticamente los arrays
        puestos.sort();
        ubicaciones.sort();

        const puestoSelect = document.getElementById("puesto-select");
        // Añadir la opción "Puesto" por defecto
         const optionPuestoLabel = document.createElement('option');
         optionPuestoLabel.value = "";
         optionPuestoLabel.text = "Puesto";
        optionPuestoLabel.disabled = true; // Deshabilitar la opción "Puesto"
        optionPuestoLabel.selected = true; // Seleccionar la opción "Puesto" por defecto
         puestoSelect.appendChild(optionPuestoLabel);
          //Añadir la opción "Todos"
           const optionTodosPuesto = document.createElement('option');
           optionTodosPuesto.value = "";
             optionTodosPuesto.text = "Todos";
           puestoSelect.appendChild(optionTodosPuesto);
        puestos.forEach(puesto => {
           const option = document.createElement('option');
           option.value = puesto;
           option.text = puesto;
          puestoSelect.appendChild(option);
         });

        const ubicacionSelect = document.getElementById("ubicacion-select");
        // Añadir la opción "Ubicación" por defecto
        const optionUbicacionLabel = document.createElement('option');
        optionUbicacionLabel.value = "";
        optionUbicacionLabel.text = "Ubicación";
       optionUbicacionLabel.disabled = true; // Deshabilitar la opción "Ubicación"
        optionUbicacionLabel.selected = true; // Seleccionar la opción "Ubicación" por defecto
        ubicacionSelect.appendChild(optionUbicacionLabel);

         //Añadir la opción "Todos"
           const optionTodosUbicacion = document.createElement('option');
           optionTodosUbicacion.value = "";
           optionTodosUbicacion.text = "Todos";
           ubicacionSelect.appendChild(optionTodosUbicacion);
          ubicaciones.forEach(ubicacion => {
             const option = document.createElement('option');
             option.value = ubicacion;
             option.text = ubicacion;
             ubicacionSelect.appendChild(option);
         });
   }

 function filtrarYMostrarResultados() {
      const nombreInput = document.getElementById('nombre-input').value.toLowerCase();
      const puestoSelect = document.getElementById('puesto-select').value;
      const telefonoInput = document.getElementById('telefono-input').value;
      const ubicacionSelect = document.getElementById('ubicacion-select').value;

      const resultadosFiltrados = directorioData.filter(item => {
        const nombreNormalizado = normalizeText(item.Nombre).toLowerCase(); // Normalizar el nombre
         const nombreCoincide = nombreNormalizado.includes(normalizeText(nombreInput));
        const puestoCoincide = puestoSelect === "" || item.Puesto === puestoSelect;
        const telefonoCoincide = telefonoInput === "" || (item["Teléfonos Interior"] && item["Teléfonos Interior"].includes(telefonoInput)) || (item["Teléfono Exterior"] && item["Teléfono Exterior"].toString().includes(telefonoInput));
          const ubicacionCoincide = ubicacionSelect === "" || item.Ubicación === ubicacionSelect;


           return nombreCoincide && puestoCoincide && telefonoCoincide && ubicacionCoincide;
      });
        
            mostrarResultadosEnTabla(resultadosFiltrados);
    }

function mostrarResultadosEnTabla(resultados) {
    const directorioResultados = document.getElementById('directorio-resultados');
    directorioResultados.innerHTML = ''; // Limpiar el contenedor

    if (resultados.length === 0) {
      directorioResultados.innerHTML = '<p>No se encontraron resultados.</p>';
        return;
    }
    
     resultados.forEach(item => {
        const resultadoDiv = document.createElement('div');
        resultadoDiv.classList.add('directorio-resultado'); // Añade una clase para estilos CSS
          let logoElement;
        // Añadir el logo según el dominio
        if (item.Correo && item.Correo.includes('@adif.es')) {
             if (logoAdif)
          {
             logoElement = logoAdif.cloneNode();
              logoElement.classList.add('logo-adif');
           } else {
               logoElement = document.createElement('span');
             logoElement.textContent = '🟢';
             logoElement.classList.add('logo-fallback')
           }
           resultadoDiv.appendChild(logoElement);
        } else if (item.Correo && item.Correo.includes('@ineco.com') || item.Correo.includes('@externos.adif.es')) {
           if(logoIneco)
           {
               logoElement = logoIneco.cloneNode();
              logoElement.classList.add('logo-ineco');
          } else {
             logoElement = document.createElement('span');
             logoElement.textContent = '🔵';
             logoElement.classList.add('logo-fallback')
             console.error(`No se pudo obtener el logo de ineco para el usuario ${item.Nombre}`);
           }
           resultadoDiv.appendChild(logoElement);
        }


        const nombreParrafo = document.createElement('p');
        nombreParrafo.innerHTML = `<b>👤 ${item.Nombre}</b>`;
        resultadoDiv.appendChild(nombreParrafo);

        const puestoParrafo = document.createElement('p');
        puestoParrafo.textContent = item.Puesto || 'Puesto no disponible';
        resultadoDiv.appendChild(puestoParrafo);


        const ubicacionParrafo = document.createElement('p');
        ubicacionParrafo.textContent = item.Ubicación || 'Ubicación no disponible';
        resultadoDiv.appendChild(ubicacionParrafo);

       const telefonoParrafo = document.createElement('p');
       const telefono = item["Teléfono Exterior"] || 'No disponible';
       telefonoParrafo.innerHTML = `📞 <a href="tel:${telefono}">${telefono}</a>`
        resultadoDiv.appendChild(telefonoParrafo);
        
         const correoParrafo = document.createElement('p');
         const correo = item.Correo || 'Correo no disponible';
        correoParrafo.innerHTML = `📧 <a href="mailto:${correo}">${correo}</a>`;
        resultadoDiv.appendChild(correoParrafo);

       directorioResultados.appendChild(resultadoDiv);
    });
 }
});

 // ----- FIN FUNCIONALIDAD BOTÓN DIRECTORIO -----

 // ----- INICIO FUNCIONALIDAD BOTÓN SIMULADOR -----

        const simuladorButton = document.querySelector('.plus-option-button[aria-label="SIMULADOR"]');
        const simuladorCardContainer = document.getElementById('simulador-card-container');
         const cerrarSimuladorCardButton = document.getElementById('cerrar-simulador-card');
          const simuladorOpciones = document.getElementById('simulador-opciones');
        const simuladorPkForm = document.getElementById('simulador-pk-form');
       let usarSimulacion = false;
    let latSimulada, lonSimulada;

    if (simuladorButton) {
        simuladorButton.addEventListener('click', async function() {
            simuladorCardContainer.style.display = 'flex';
            });
        } else {
            console.error('No se encontró el botón SIMULADOR');
        }

      if (cerrarSimuladorCardButton) {
            cerrarSimuladorCardButton.addEventListener('click', function() {
                simuladorCardContainer.style.display = 'none';
                 simuladorPkForm.style.display = 'none';
                  usarSimulacion = false; // Desactiva la simulación al cerrar la tarjeta
                   calcularYActualizarPK();
                     if (marcadorActual) {
                         const { lat, lng } = marcadorActual.getLatLng();
                        mapa.setView([lat, lng], 18);
                         centradoAutomaticamente = true;
                    }
            });
        } else {
            console.error('No se encontró el botón de cerrar de la tarjeta de SIMULADOR');
        }
          const simularPkBtn = document.getElementById('simular-pk-btn');
           if (simularPkBtn) {
               simularPkBtn.addEventListener('click', function(){
                 simuladorOpciones.style.display = 'none';
                 simuladorPkForm.style.display = 'flex';
                generarSelectSimuladorLinea();
            });
        } else {
             console.error('No se encontró el botón simular pk');
         }

          const aplicarSimulacionBtn = document.getElementById('aplicar-simulacion-btn');
       if (aplicarSimulacionBtn) {
            aplicarSimulacionBtn.addEventListener('click', async function() {
                 const linea = document.getElementById('simulador-linea-select').value;
                const pk = document.getElementById('simulador-pk-input').value;
                 simularPK(linea, pk);
           });
        } else {
            console.error('No se encontró el botón aplicar simulación');
        }
         

          function generarSelectSimuladorLinea(){

       const lineas = ["40", "42", "46", "48"]; // Array con las líneas permitidas
         const simuladorLineaSelect = document.getElementById("simulador-linea-select");
        // Añadir la opción "Ubicación" por defecto
         const optionLineaLabel = document.createElement('option');
         optionLineaLabel.value = "";
         optionLineaLabel.text = "Línea";
         optionLineaLabel.disabled = true; // Deshabilitar la opción "Línea"
         optionLineaLabel.selected = true; // Seleccionar la opción "Línea" por defecto
         simuladorLineaSelect.appendChild(optionLineaLabel);
        
        lineas.forEach(linea => {
           const option = document.createElement('option');
           option.value = linea;
           option.text = linea;
             simuladorLineaSelect.appendChild(option);
            });
    }

   async function simularPK(linea, pk) {
    if (!linea || linea === "") {
          alert("Debes seleccionar una línea.");
          return;
    }
    if (!pk || isNaN(pkToNumber(pk))) {
        alert("Debes introducir un PK válido.");
        return;
    }

    // Mostrar mensaje "Buscando PK..."
    const pkElement = document.getElementById("pkCercano");
    const textoOriginalPK = pkElement.innerHTML; // Guarda el texto original para restaurar
    pkElement.innerHTML = `<span class="texto-buscando-pk">Buscando PK simulado...</span>`;
   
  
    try {
        const datosTrazado = await cargarArchivosJSON(rutasArchivos);
         const puntoSimulado = datosTrazado.find(punto => pkToNumber(punto.PK) === pkToNumber(pk) && punto.Linea === linea);
         if (puntoSimulado)
           {
                latSimulada = parseFloat(puntoSimulado.Latitud);
                lonSimulada = parseFloat(puntoSimulado.Longitud);
                usarSimulacion = true;
                 mapa.setView([latSimulada, lonSimulada], 18);
                  const pkSimulado = calcularPKMasCercano(latSimulada, lonSimulada, datosTrazado)[0]
                  mostrarPKMasCercano(pkSimulado);
                  actualizarPosicionPK(pkSimulado);
                 
               
                mostrarMensaje("✅ Simulación Aplicada")
           }
         else {
                alert("No se ha encontrado el PK o linea simulada.");
           }
                pkElement.innerHTML = textoOriginalPK; // Restaura el texto original
    } catch (error) {
        console.error("Error al simular PK:", error);
         alert("Error al realizar la simulación del PK.");
         pkElement.innerHTML = textoOriginalPK; // Restaura el texto original
    }
}
 // ----- FIN FUNCIONALIDAD BOTÓN SIMULADOR -----



// ----- INICIO FUNCIONALIDAD TRENES -----
async function cargarDatosTrenes() {
    try {
        const [velocidadesResponse, trenesResponse] = await Promise.all([
            fetch("./doc/trenes/velocidades.json"),
            fetch("./doc/trenes/trenes2.json")
        ]);

        if (!velocidadesResponse.ok) {
            throw new Error(`Error al cargar velocidades.json: ${velocidadesResponse.statusText}`);
        }
        if (!trenesResponse.ok) {
            throw new Error(`Error al cargar trenes.json: ${trenesResponse.statusText}`);
        }

        const velocidadesData = await velocidadesResponse.json();
        const trenesData = await trenesResponse.json();

        // Convertir la velocidad de string a número
       const velocidadesDataConvertida = velocidadesData.map(item => ({
             ...item,
            Velocidad: parseInt(item.Velocidad, 10),
            "PK INI": parseInt(item["PK INI"], 10),
            "PK FIN": parseInt(item["PK FIN"],10)
         }));
        console.log("Datos de velocidades cargados:", velocidadesDataConvertida);

    
     const trenesDataConvertida = trenesData.map(item => ({
         ...item,
          PK: parseInt(item.PK, 10),
            }))
        console.log("Datos de trenes cargados:", trenesDataConvertida);

        return {
            velocidades: velocidadesDataConvertida,
             trenes: trenesDataConvertida
        };
    } catch (error) {
        console.error("Error al cargar los datos de trenes:", error);
        alert("Error al cargar los datos de trenes.");
        return null;
    }
}


async function predecirPasoTrenes() {
    const { velocidades, trenes } = await cargarDatosTrenes();
     if (!velocidades || !trenes) {
        console.error("No se pudieron cargar los datos de trenes.");
        return;
    }
    if (!window.pkMasCercano) {
        console.error("No se ha calculado el PK del usuario. No se pueden predecir trenes.");
         alert("No se ha calculado el PK del usuario. No se pueden predecir trenes.");
         return;
     }
    // Obtener datos del usuario
    const pkUsuario = window.pkMasCercano.pk;
     const lineaUsuario = window.pkMasCercano.linea;
    const ladoViaUsuario = window.pkMasCercano.ladoVia;
    const pkUsuarioNumerico = pkToNumber(pkUsuario);

    // Filtrar los trenes por la línea del usuario
     const trenesFiltrados = trenes.filter(tren => tren.Línea === lineaUsuario);
       console.log("Trenes filtrados por línea:", trenesFiltrados);
    if (trenesFiltrados.length === 0) {
         console.warn("No hay trenes en la línea:", lineaUsuario);
          mostrarTarjetaTrenes("No hay trenes en esta línea");
      return;
    }
     // Obtener el día actual para filtrar trenes
    const now = new Date();
   const diaSemana = ["D", "L", "M", "X", "J", "V", "S"][now.getDay()];

     const trenesFiltradosDia = trenesFiltrados.filter(tren => {
            if(Array.isArray(tren.Día)){
                   return tren.Día.includes(diaSemana)
            }
           else if (tren.Día === "L") {
                // Si el día es "L", verifica que el día de la semana actual esté entre lunes y jueves
                return diaSemana === "L" || diaSemana === "M" || diaSemana === "X" || diaSemana === "J";
            }
           else{
                return tren.Día === diaSemana
           }
        });
      console.log("Trenes filtrados por día:", trenesFiltradosDia);
        if (trenesFiltradosDia.length === 0) {
          console.warn("No hay trenes para el día de hoy:", diaSemana);
         mostrarTarjetaTrenes("No hay trenes para el día de hoy");
        return;
       }
    const predicciones = [];
    const nowTime = new Date().getTime();
    // Calcular la hora de paso para cada tren
    for (const tren of trenesFiltradosDia)
      {
      const tiempoEstimado = calcularTiempoEstimadoPaso(tren, pkUsuarioNumerico, velocidades);
          if(tiempoEstimado)
          {
            const tiempoPaso = new Date(tiempoEstimado);
             if (tiempoPaso.getTime() > nowTime && tiempoPaso.getTime() < nowTime + 10 * 60 * 60 * 1000)
               {
                  predicciones.push({
                      tren: tren,
                     tiempoEstimado: tiempoEstimado
                     });
                }

          }

     }
      console.log("Predicciones calculadas:", predicciones);
    if(predicciones.length > 0)
      {
         // Ordenar las predicciones por tiempo estimado de paso
             predicciones.sort((a, b) => a.tiempoEstimado - b.tiempoEstimado);
            mostrarTarjetaTrenes(generarTablaTrenes(predicciones, nowTime));
       }
     else {
        console.warn("No hay predicciones para el PK actual");
        mostrarTarjetaTrenes("No hay trenes en las próximas 5 horas");
        }

}

function calcularTiempoEstimadoPaso(tren, pkUsuarioNumerico, velocidades) {
    console.log("Calculando tiempo para el tren:", tren, " PK Usuario:", pkUsuarioNumerico);

    const lineaTren = tren.Línea;
    const pkTrenExtremo = tren.PK;
    const viaTren = tren.Vía;
    const horaTrenExtremo = tren.Hora;
    
    console.log("Datos del tren:", { lineaTren, pkTrenExtremo, viaTren, horaTrenExtremo });

    const tramo = velocidades.find(tramo => tramo.Línea === lineaTren && pkUsuarioNumerico >= tramo["PK INI"] &&  pkUsuarioNumerico <= tramo["PK FIN"]);
     if(!tramo)
       {
         console.warn("No se ha encontrado un tramo para el PK:",pkUsuarioNumerico, "en la línea", lineaTren);
         return null;
       }
    console.log("Tramo encontrado:", tramo)
    let distanciaTramo = 0;
    let sentidoTramo = 1; //Valor por defecto para vía 1
     if (viaTren === "1") {
      distanciaTramo = Math.abs(pkUsuarioNumerico - pkTrenExtremo)
        sentidoTramo = -1; //Valor -1 para la Vía 1 (decreciente)
         } else if (viaTren === "2")
          {
            distanciaTramo = Math.abs(pkTrenExtremo - pkUsuarioNumerico)
              sentidoTramo = 1;  //Valor 1 para la Vía 2 (creciente)
        }
     console.log("Sentido del tramo", sentidoTramo);
      console.log("Distancia al extremo:", distanciaTramo, "metros");
    const distanciaTramoKm = distanciaTramo / 1000; // Convertimos metros a kilómetros
      console.log("Distancia al extremo:", distanciaTramoKm, "Km");

    const tiempoTramo = distanciaTramoKm / tramo.Velocidad;
     console.log("Tiempo hasta el extremo:", tiempoTramo, "horas");

    const horaLlegadaExtremo = new Date();
    const [horas, minutos] = horaTrenExtremo.split(":");
    horaLlegadaExtremo.setHours(parseInt(horas, 10));
    horaLlegadaExtremo.setMinutes(parseInt(minutos, 10));
    
     console.log("horaLlegadaExtremo", horaLlegadaExtremo)

    let horaEstimada = new Date(horaLlegadaExtremo.getTime());
      console.log("Hora Estimada Inicial", horaEstimada)

    const tiempoTotalMinutos = tiempoTramo * 60;
      console.log("tiempoTotalMinutos", tiempoTotalMinutos)
       
    horaEstimada.setTime(horaEstimada.getTime() - sentidoTramo * tiempoTotalMinutos * 60 * 1000);
        console.log("Hora Estimada Final", horaEstimada)
    return  horaEstimada.getTime();
}

function generarTablaTrenes(predicciones, nowTime) {
    let tablaHTML = `<table style="width: 100%; border-collapse: collapse; margin-top: 10px; text-align: center;">
                     <thead style="font-weight: bold;">
                        <tr style="border-bottom: 2px solid #ddd;">
                            <th style="padding: 8px; border: 1px solid #ddd;">Hora</th>
                             <th style="padding: 8px; border: 1px solid #ddd;">Minutos</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Vía</th>
                             <th style="padding: 8px; border: 1px solid #ddd;">Ori/Des</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Hora</th>
                        </tr>
                   </thead>
                   <tbody>`;
        for(const prediccion of predicciones)
    {
          const horaPaso = new Date(prediccion.tiempoEstimado);
          const horas = String(horaPaso.getHours()).padStart(2, '0');
         const minutos = String(horaPaso.getMinutes()).padStart(2, '0');
           const minutosRestantes = Math.abs(Math.round((prediccion.tiempoEstimado - nowTime)/ (60 * 1000)))
          let origen = "";
         if (prediccion.tren.Línea === "42")
         {
           origen = "Alicante"
         }
       else if (prediccion.tren.Línea === "40")
         {
            origen = "Valencia"
        }
          const horaExtremoDate = new Date(prediccion.tiempoEstimado);
            const [horasExtremo, minutosExtremo] = prediccion.tren.Hora.split(":");
              horaExtremoDate.setHours(parseInt(horasExtremo, 10));
              horaExtremoDate.setMinutes(parseInt(minutosExtremo, 10));

         const horasExtremoFormat = String(horaExtremoDate.getHours()).padStart(2,'0');
         const minutosExtremoFormat = String(horaExtremoDate.getMinutes()).padStart(2, '0');

        tablaHTML +=`
            <tr style="border-bottom: 1px solid #eee;">
                 <td style="padding: 8px; border: 1px solid #ddd;">${horas}:${minutos}</td>
                 <td style="padding: 8px; border: 1px solid #ddd;">${minutosRestantes}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${prediccion.tren.Vía}</td>
                 <td style="padding: 8px; border: 1px solid #ddd;">${origen}</td>
                   <td style="padding: 8px; border: 1px solid #ddd;">${horasExtremoFormat}:${minutosExtremoFormat}</td>
              </tr>
       `
    }
       tablaHTML += `</tbody></table>`;
    return tablaHTML;

}

function mostrarTarjetaTrenes(contenido) {
    const trenesCardContainer = document.getElementById('trenes-card-container');
     const trenesContainer = document.getElementById('trenes-container');
     const cerrarTrenesCardButton = document.getElementById('cerrar-trenes-card');

     if (trenesContainer) {
          trenesContainer.innerHTML = contenido;
           trenesCardContainer.style.display = 'flex'; // Mostrar la tarjeta de trenes
           } else{
            console.error('No se encontró el contenedor de trenes');
        }
        if (cerrarTrenesCardButton) {
            cerrarTrenesCardButton.addEventListener('click', function() {
                trenesCardContainer.style.display = 'none'; // Ocultar la tarjeta de trenes al hacer clic en "Cerrar"
            });
        } else {
            console.error('No se encontró el botón de cerrar de la tarjeta de trenes');
        }

}
     document.addEventListener('DOMContentLoaded', function() {
           // ... (resto del código de los botones plus)...

            const trenesButton = document.querySelector('.plus-option-button[aria-label="TRENES"]');
            if (trenesButton) {
                  trenesButton.addEventListener('click', function() {
                       predecirPasoTrenes();
               });
           } else {
               console.error('No se encontró el botón TRENES');
          }
     });
// ----- FIN FUNCIONALIDAD TRENES -----




///// FIN ICONO PLUS /////








document.getElementById("iconoMas").addEventListener("click", () => {
     calcularYActualizarPK(); // Llama a la función de cálculo del PK
    if (!lat || !lon) {
        alert("No se ha obtenido la ubicación actual del usuario.");
        return;
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
        return datosCargados.flat(); // Combina todos los datos en un solo array
    }


    cargarArchivosJSON(rutasArchivos)
        .then(datosCombinados => {
            window.pkMasCercano = calcularPKMasCercano(lat, lon, datosCombinados)[0];
            mostrarPKMasCercano(window.pkMasCercano);
            actualizarPosicionPK(window.pkMasCercano);
            mostrarMensaje(" 🔄 PK Actualizado");
            
            // Centrar el mapa en la posición actual
            if (marcadorActual) {
                const { lat, lng } = marcadorActual.getLatLng();
                mapa.setView([lat, lng], 18);
                centradoAutomaticamente = true;
            }

            
        })
        .catch(error => console.error('Error al combinar datos de los archivos:', error));

    });

/////  INICIO BOTÓN CAMARA /////---------------------------------------------------------------------------------------

document.getElementById("iconoCamara").addEventListener("click", () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
            const contenedor = document.createElement("div");
            contenedor.style.position = "absolute";
            contenedor.style.top = "0";
            contenedor.style.left = "0";
            contenedor.style.width = "100%";
            contenedor.style.height = "100%";
            contenedor.style.zIndex = "1000";
            contenedor.style.backgroundColor = "black";
            document.body.appendChild(contenedor);

            const video = document.createElement("video");
            video.srcObject = stream;
            video.autoplay = true;
            video.style.width = "100%";
            video.style.height = "100%";
            video.style.objectFit = "cover";
            contenedor.appendChild(video);

            // Crear una imagen en lugar de un botón
            const imagenCamara = document.createElement("img");
            imagenCamara.src = "img/botoncamara.png"; // Ruta de la imagen
            imagenCamara.alt = "Hacer Foto";
            imagenCamara.style.position = "absolute";
            imagenCamara.style.bottom = "10px";
            imagenCamara.style.left = "50%";
            imagenCamara.style.transform = "translateX(-50%)";
            imagenCamara.style.cursor = "pointer";
            imagenCamara.style.width = "60px"; // Ajusta el tamaño según necesites
            imagenCamara.style.height = "60px"; // Ajusta el tamaño según necesites
            imagenCamara.style.zIndex = "1001";
            contenedor.appendChild(imagenCamara);

// Evento click para la imagen
imagenCamara.addEventListener("click", () => {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                  // Detener el stream y eliminar el video
                stream.getTracks().forEach(track => track.stop()); // Cierra la cámara
                contenedor.remove();

const textoPK = `PK ${formatearPK(window.pkMasCercano.pk)}`;
const textoViaLinea = `${window.pkMasCercano.ladoVia} (L${window.pkMasCercano.linea})`;

// Obtener la fecha actual en formato DD/MM/AAAA
const fechaActual = new Date();
const dia = String(fechaActual.getDate()).padStart(2, "0");
const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
const anio = fechaActual.getFullYear();
const textoFecha = `${dia}/${mes}/${anio}`;

// Configuración del recuadro y fuente
const paddingHorizontal = 30; // Espaciado adicional horizontal
const paddingVertical = 15; // Espaciado adicional vertical
const fontSizePK = 24; // Tamaño de fuente para el PK
const fontSizeViaLinea = 18; // Tamaño de fuente para la vía y línea
const fontSizeFecha = 16; // Tamaño de fuente para la fecha
const margenEntreLineas = 5; // Separación entre líneas de texto

// Configurar la fuente antes de medir el texto
ctx.font = `${fontSizePK}px Arial`;
const anchoPK = ctx.measureText(textoPK).width; // Ancho del texto PK
ctx.font = `${fontSizeViaLinea}px Arial`;
const anchoViaLinea = ctx.measureText(textoViaLinea).width; // Ancho del texto Vía y Línea
ctx.font = `${fontSizeFecha}px Arial`;
const anchoFecha = ctx.measureText(textoFecha).width; // Ancho del texto Fecha

// Calcular el ancho y alto del recuadro
const textoMasAncho = Math.max(anchoPK, anchoViaLinea, anchoFecha);
const tarjetaWidth = textoMasAncho + paddingHorizontal * 2; // Ancho total con padding
const tarjetaHeight = fontSizePK + fontSizeViaLinea + fontSizeFecha + paddingVertical * 2 + margenEntreLineas * 2; // Altura total

// Dibujar el fondo del recuadro
ctx.fillStyle = "rgba(0, 122, 255, 0.5)"; // Fondo azul semitransparente
const x = (canvas.width - tarjetaWidth) / 2; // Centrar horizontalmente
const y = canvas.height - tarjetaHeight - 20; // Margen inferior
ctx.beginPath();
ctx.roundRect(x, y, tarjetaWidth, tarjetaHeight, 20); // Esquinas redondeadas
ctx.fill();

// Dibujar el texto del PK
ctx.fillStyle = "white";
ctx.font = `${fontSizePK}px Arial`;
ctx.textAlign = "center";
ctx.textBaseline = "top";
ctx.fillText(
    textoPK,
    canvas.width / 2,
    y + paddingVertical // Comenzar desde el padding superior
);

// Dibujar el texto de la Vía y Línea
ctx.font = `${fontSizeViaLinea}px Arial`;
ctx.fillText(
    textoViaLinea,
    canvas.width / 2,
    y + paddingVertical + fontSizePK + margenEntreLineas // Alinear debajo del texto del PK
);

// Dibujar la fecha
ctx.font = `${fontSizeFecha}px Arial`;
ctx.fillText(
    textoFecha,
    canvas.width / 2,
    y + paddingVertical + fontSizePK + fontSizeViaLinea + margenEntreLineas * 2 // Alinear debajo del texto de la Vía y Línea
);


                const imagenCapturada = document.createElement("img");
                imagenCapturada.src = canvas.toDataURL("image/png");
                imagenCapturada.style.position = "absolute";
                imagenCapturada.style.top = "0";
                imagenCapturada.style.left = "0";
                imagenCapturada.style.width = "100%";
                imagenCapturada.style.height = "100%";
                imagenCapturada.style.objectFit = "cover";
                imagenCapturada.style.zIndex = "1002";
                document.body.appendChild(imagenCapturada);

                video.style.display = "none";

                const contenedorBotones = document.createElement("div");
                contenedorBotones.style.position = "absolute";
                contenedorBotones.style.top = "10px";
                contenedorBotones.style.left = "50%";
                contenedorBotones.style.transform = "translateX(-50%)";
                contenedorBotones.style.display = "flex";
                contenedorBotones.style.gap = "10px";
                contenedorBotones.style.zIndex = "1003";
                document.body.appendChild(contenedorBotones);

                const estiloBoton = `
                    padding: 8px 15px;
                    font-size: 14px;
                    color: white;
                    background-color: #479af5;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                `;

// BOTÓN VOLVER
const imagenVolver = document.createElement("img"); // Cambiar de button a img
imagenVolver.src = "img/volver.png"; // Reemplaza con el nombre y ruta de tu archivo de imagen
imagenVolver.alt = "Volver";
imagenVolver.classList.add("boton-control"); // Añadir clase común
imagenVolver.style.cssText = "cursor: pointer; width: 60px; height: 50px;"; // Ajusta el tamaño según necesites
contenedorBotones.appendChild(imagenVolver); // Añadir la imagen al contenedor

// Agregar el evento click a la imagen
imagenVolver.addEventListener("click", () => {
    imagenCapturada.remove();
    contenedorBotones.remove();
    video.style.display = "block";
});               
                
                
                
// BOTÓN GUARRDAR
const imagenGuardar = document.createElement("img"); // Cambiar de button a img
imagenGuardar.src = "img/guardar.png"; // Reemplaza con el nombre y ruta de tu archivo de imagen
imagenGuardar.alt = "Guardar";
imagenGuardar.classList.add("boton-control"); // Añadir clase común
imagenGuardar.style.cssText = "cursor: pointer; width: 60px; height: 50px;"; // Ajusta el tamaño según necesites
contenedorBotones.appendChild(imagenGuardar); // Añadir la imagen al contenedor


// Evento click GUARDAR
imagenGuardar.addEventListener("click", () => { // Cambia botonGuardar por imagenGuardar
    try {
        // Obtener el PK formateado
        const pkFormateado = formatearPK(window.pkMasCercano.pk);

        // Obtener la fecha actual
        const fechaActual = new Date();
        const dia = String(fechaActual.getDate()).padStart(2, "0");
        const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
        const anio = fechaActual.getFullYear();
        const fechaFormateada = `${dia}-${mes}-${anio}`;

        // Crear el nombre del archivo
        const nombreArchivo = `${pkFormateado} ${fechaFormateada}.jpg`;

        // Crear un Blob a partir del canvas en formato JPG
        canvas.toBlob((blob) => {
            if (!blob) {
                alert("Error al generar la imagen.");
                return;
            }

            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);

            link.href = url;
            link.download = nombreArchivo;

            // Simular un clic para descargar
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Liberar el objeto URL
            URL.revokeObjectURL(url);

            // Mostrar el mensaje de confirmación sin el nombre del sitio
            mostrarMensaje("✅ Foto guardada");
        }, "image/jpeg"); // Formato JPEG
    } catch (error) {
        console.error("Error al intentar guardar la imagen:", error);
        alert("No se puede guardar la imagen en este dispositivo.");
    }
});




// BOTÓN COMPARTIR
const imagenCompartir = document.createElement("img");
imagenCompartir.src = "img/compartir.png"; // Reemplaza con el nombre real de tu archivo de imagen
imagenCompartir.alt = "Compartir";
imagenCompartir.classList.add("boton-control"); // Añadir clase común
imagenCompartir.style.cssText = "cursor: pointer; width: 60px; height: 50px;"; // Ajusta el tamaño según necesites
contenedorBotones.appendChild(imagenCompartir);

 // Evento click COMPARTIR
imagenCompartir.addEventListener("click", async () => {
    try {
        const dataUrl = canvas.toDataURL("image/png");
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "foto_con_pk.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: "Foto con PK",
                text: "Aquí está la foto con la información del PK."
            });
        } else {
            alert("No se puede compartir esta imagen desde tu dispositivo.");
        }
    } catch (error) {
        console.error("Error al compartir:", error);
    }
});
   
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
