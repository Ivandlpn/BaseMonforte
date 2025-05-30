let mapa, marcadorActual, marcadorPK, iconoUsuario;
let centradoAutomaticamente = true;

let lat, lon; // Coordenadas del usuario
let primeraEjecucion = true; // Bandera para controlar la primera actualización

let puertasData = []; // Variable para guardar datos de las puertas
let edificiosData = []; // Variable para guardar datos de los edificios
const puertasContainer = document.getElementById("puertas-card-container");
const puertasInfoDiv = document.getElementById("puertas-info");
const cerrarPuertasCard = document.getElementById("cerrar-puertas-card");

// Función para cargar los datos de los edificios
async function cargarEdificios() {
    if (edificiosData.length > 0) return edificiosData; // Ya están cargados
    
    try {
        const [albaniData, tovalData] = await Promise.all([
            fetch('doc/edificios/ALBALIv1.json').then(r => r.json()),
            fetch('doc/edificios/TOVAL.json').then(r => r.json())
        ]);
        
        edificiosData = [...albaniData, ...tovalData];
        return edificiosData;
    } catch (error) {
        console.error('Error al cargar los datos de edificios:', error);
        return [];
    }
}

const DATA_URL = 'https://api.jsonbin.io/v3/b/67adf787acd3cb34a8e087a4'; // **REEMPLAZA ESTO con la URL pública de tu archivo guardiactas_data.json**

const apiKeyOpenWeatherMap = "14225e48c44f9d35291e12867b7f32cf"; // API Meteo

    const rutasArchivos = [
        "./doc/traza/L40Z.json",
        "./doc/traza/L40Ar.json",
        "./doc/traza/L40Br.json",
        "./doc/traza/L40Cr.json",
        "./doc/traza/L42Ar.json",
        "./doc/traza/L42B.json",
        "./doc/traza/L46.json",
        "./doc/traza/L48.json"
    ];

// Rutas a los archivos de puertas
const rutasPuertas = [
    "./doc/puertas/PL42.json",
    "./doc/puertas/PL46.json",
    "./doc/puertas/PL48.json",
    "./doc/puertas/PL40.json"
];

// Función para obtener una propiedad de un objeto sin importar mayúsculas/minúsculas
function obtenerPropiedadInsensible(objeto, propiedad) {
    const clave = Object.keys(objeto).find(
        key => key.toLowerCase() === propiedad.toLowerCase()
    );
    return objeto[clave];
}

// Función para agregar capa de puertas al mapa
function agregarCapaPuertas() {
    if (!mapa) {
        console.error("No se ha inicializado el mapa.");
        return 0; // Retorna 0 puertas procesadas
    }

    // Crear capa de grupo para las puertas
    const puertasLayerGroup = L.layerGroup().addTo(mapa);
    let puertasProcesadas = 0;
    let puertasConError = 0;
    let puertasSinCoordenadas = 0;
    let erroresMostrados = 0;
    const MAX_ERRORES_MOSTRADOS = 5;



    // Agregar puertas a la capa de grupo con validación
    puertasData.forEach((puerta, index) => {
        try {
            // Obtener coordenadas sin importar mayúsculas/minúsculas
            const latRaw = obtenerPropiedadInsensible(puerta, 'lat') || obtenerPropiedadInsensible(puerta, 'latitude');
            const lonRaw = obtenerPropiedadInsensible(puerta, 'lon') || 
                          obtenerPropiedadInsensible(puerta, 'lng') || 
                          obtenerPropiedadInsensible(puerta, 'longitude');
            
            const lat = parseFloat(latRaw);
            const lon = parseFloat(lonRaw);
            
            const coordenadasValidas = !isNaN(lat) && !isNaN(lon) && 
                                     Math.abs(lat) <= 90 && 
                                     Math.abs(lon) <= 180;

            if (coordenadasValidas) {
                const marker = L.marker([lat, lon]);
                marker.addTo(puertasLayerGroup);
                marker.bindPopup(`Puerta ${puerta.nombre || 'sin nombre'}`);
                puertasProcesadas++;
                

            } else if (puerta.lat !== undefined || puerta.lon !== undefined) {
                // Solo contar como error si la puerta tiene algún valor en lat o lon pero no son válidos
                puertasConError++;
                erroresMostrados++;
            } else {
                // No tiene coordenadas definidas
                puertasSinCoordenadas++;
            }
        } catch (error) {
            puertasConError++;
            if (erroresMostrados < MAX_ERRORES_MOSTRADOS) {
                console.error(`Error al procesar puerta en índice ${index}:`, error);
                erroresMostrados++;
            }
        }
    });
    
    // Verificar si hay discrepancias
    const totalContado = puertasProcesadas + puertasConError + puertasSinCoordenadas;
    
    return puertasProcesadas;
}

// Función para eliminar capa de puertas del mapa
function eliminarCapaPuertas() {
    if (!mapa) {
        console.error("No se ha inicializado el mapa.");
        return;
    }

    // Eliminar capa de grupo de puertas
    mapa.eachLayer(layer => {
        if (layer instanceof L.LayerGroup) {
            mapa.removeLayer(layer);
        }
    });
}

async function cargarPuertas() {
    try {

        const responses = await Promise.all(rutasPuertas.map(ruta => 
            fetch(ruta).then(res => {
                if (!res.ok) {
                    throw new Error(`Error ${res.status} al cargar ${ruta}`);
                }
                return res.json();
            })
        ));
        
        // Aplanar datos
        const puertasCargadas = responses.flat();
        

        
        // Mapear los datos normalizando los nombres de las propiedades
        puertasData = puertasCargadas.map((puerta, index) => {
            // Crear un nuevo objeto con las propiedades normalizadas
            const puertaNormalizada = { ...puerta };
            
            // Mapear propiedades de coordenadas a minúsculas
            const propiedadesCoordenadas = [
                { src: ['lat', 'latitude', 'y'], dest: 'lat' },
                { src: ['lon', 'lng', 'longitude', 'x'], dest: 'lon' }
            ];
            
            // Para cada tipo de coordenada (lat/lon)
            propiedadesCoordenadas.forEach(({ src, dest }) => {
                // Buscar la primera propiedad que exista en el objeto
                const propiedadCoordenada = src.find(prop => 
                    Object.keys(puerta).some(key => key.toLowerCase() === prop.toLowerCase())
                );
                
                if (propiedadCoordenada) {
                    // Obtener el valor real (sin importar mayúsculas/minúsculas)
                    const valor = obtenerPropiedadInsensible(puerta, propiedadCoordenada);
                    if (valor !== undefined && valor !== null) {
                        // Convertir a número si es posible
                        const num = parseFloat(valor);
                        puertaNormalizada[dest] = isNaN(num) ? valor : num;
                    }
                }
            });
            

            
            return puertaNormalizada;
        });
        
        const puertasProcesadas = agregarCapaPuertas();
        
        return puertasProcesadas;
    } catch (error) {
        console.error("Error al cargar los datos de puertas:", error);
        // Mostrar mensaje de error más descriptivo
        const mensaje = `Error al cargar los datos de las puertas: ${error.message || 'Error desconocido'}`;
        mostrarMensaje(mensaje);
        throw error; // Relanzar para que el código que llama pueda manejarlo si es necesario
    }
}



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

function calcularYActualizarPK() {
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
            window.pkMasCercano = calcularPKMasCercano(lat, lon, datosCombinados)[0];
            if(window.pkMasCercano && pkElement){ //Añadimos la comprobación de pkElement
               // Eliminar la clase de PK simulado si existe (cuando se actualiza la ubicación real)
               const tarjetaPK = document.querySelector('#calculoPK .tarjeta');
               if (tarjetaPK) {
                   tarjetaPK.classList.remove('pk-simulado');
               }
               
               mostrarPKMasCercano(window.pkMasCercano);
               actualizarPosicionPK(window.pkMasCercano);
               
               // Marcar como no simulado
               if (window.pkMasCercano) {
                   window.pkMasCercano.esSimulado = false;
               }
            }
            // mostrarMensaje("   🔄 PK Actualizado");
        })
        .catch(error => console.error('Error al combinar datos de los archivos:', error));
}

async function cargarJSON(rutaArchivo) {
    const response = await fetch(rutaArchivo);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} en ${rutaArchivo}`);
    }
    return await response.json();
}


// Propiedades Mensaje: PK Actualizado
function mostrarMensaje(mensaje, esError = false) {
    const mensajeDiv = document.createElement("div");
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.position = "fixed";
    mensajeDiv.style.bottom = "300px";
    mensajeDiv.style.left = "50%";
    mensajeDiv.style.transform = "translateX(-50%)";
    mensajeDiv.style.backgroundColor = esError ? "#dc3545" : "#007bff"; // Rojo para error, azul para mensajes normales
    mensajeDiv.style.color = "white";
    mensajeDiv.style.padding = "12px 24px";
    mensajeDiv.style.borderRadius = "5px";
    mensajeDiv.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    mensajeDiv.style.zIndex = "9999"; // Alto z-index
    mensajeDiv.style.fontSize = "1.2em";
    mensajeDiv.style.border = "1px solid #ffffff"; // Borde blanco para visibilidad
    mensajeDiv.style.opacity = "0.9"; // Ligera opacidad
    mensajeDiv.style.textAlign = "center"; // Centrar texto
    mensajeDiv.style.display = "flex"; // Usar flex para centrar
    mensajeDiv.style.alignItems = "center"; // Centrar verticalmente
    mensajeDiv.style.justifyContent = "center"; // Centrar horizontalmente

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
    
    // Cargar puertas después de inicializar el mapa
    cargarPuertas();
}


function actualizarPosicionUsuario(lat, lon, esSimulado = false) {
    if (marcadorActual) {
        if (esSimulado) {
            // Si es simulado, ocultar el marcador
            if (mapa.hasLayer(marcadorActual)) {
                mapa.removeLayer(marcadorActual);
            }
        } else {
            // Si no es simulado, mostrar el marcador y actualizar posición
            if (!mapa.hasLayer(marcadorActual)) {
                marcadorActual.addTo(mapa);
            }
            marcadorActual.setLatLng([lat, lon]);
        }
    }
    
    // Mover la cámara a la nueva posición (siempre que haya un mapa)
    if (mapa) {
        mapa.setView([lat, lon], 18); // Zoom 18 para una vista cercana
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
    iconUrl: 'img/MiPKubi.png', // Ruta de la imagen del icono normal
    iconSize: [30, 40], // Tamaño del icono (ajusta según sea necesario)
    iconAnchor: [20, 40], // Punto del icono que apunta a la ubicación
    popupAnchor: [0, -40] // Punto desde donde se abrirá el popup
});

// icono para el PK simulado
const iconoPKSimulado = L.icon({
    iconUrl: 'img/MiPKubisimu.png', // Ruta de la imagen del icono simulado
    iconSize: [30, 40], // Mismo tamaño que el icono normal
    iconAnchor: [20, 40], // Mismo anclaje que el icono normal
    popupAnchor: [0, -40] // Mismo popup que el icono normal
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
         const ladoViaTexto = pk.esSimulado ? '' : pk.ladoVia; // No mostrar nada si es simulado
         const textoLinea = `L${pk.linea}`; // Texto de la línea
         
         pkElement.innerHTML = `
             <div style="font-size: 1em; margin-bottom: 3px;">${pkFormateado}</div>
             <div style="font-size: 0.6em;">${textoLinea}${ladoViaTexto ? ' - ' + ladoViaTexto : ''}</div>
        `;
    } else{
         console.error("No se ha encontrado el elemento con id pkCercano en mostrarPKMasCercano.")
    }
    
    // Actualizar el estado de los iconos según si el PK es simulado o no
    actualizarEstadoIconos(pk.esSimulado || false);
}

// Función para actualizar el estado de los iconos según si el PK es simulado o no
function actualizarEstadoIconos(esSimulado) {
    const iconoCamara = document.getElementById('iconoCamara');
    const iconoPuerta = document.getElementById('iconoPuerta');
    
    if (iconoCamara && iconoPuerta) {
        if (esSimulado) {
            iconoCamara.classList.add('deshabilitado');
            iconoPuerta.classList.add('deshabilitado');
        } else {
            iconoCamara.classList.remove('deshabilitado');
            iconoPuerta.classList.remove('deshabilitado');
        }
    }
}

function actualizarPosicionPK(pk) {
    const iconoActual = pk.esSimulado ? iconoPKSimulado : iconoPK;
    
    if (!marcadorPK) {
        marcadorPK = L.marker([pk.latitud, pk.longitud], { icon: iconoActual }).addTo(mapa);
    } else {
        marcadorPK.setLatLng([pk.latitud, pk.longitud]);
        marcadorPK.setIcon(iconoActual);
    }
    
    // Actualizar el estado de los iconos según si el PK es simulado o no
    actualizarEstadoIconos(pk.esSimulado || false);
}

function formatearPK(pk) {
    const pkStr = pk.toString();

    // 1. Verificar si el PK ya tiene el formato XXX+XXX (o similar)
    if (pkStr.includes('+')) {
        return pkStr; // Si ya tiene '+', asumir que está formateado y devolverlo tal cual
    }

    // 2. Si no tiene '+', aplicar la lógica de formateo original
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

// Función para obtener coordenadas basadas en línea y PK
async function obtenerCoordenadas(linea, pk) {
    try {
        // Filtrar archivos según la línea seleccionada
        const archivosFiltrados = [
            'L40Ar.json', 'L40Br.json', 'L40Cr.json', 'L40Z.json', 
            'L42.json', 'L42A.json', 'L42Ar.json', 'L42B.json', 
            'L46.json', 'L48.json'
        ].filter(archivo => {
            if (linea === '40') return archivo.startsWith('L40');
            if (linea === '42') return archivo.startsWith('L42');
            if (linea === '46') return archivo.startsWith('L46');
            if (linea === '48') return archivo.startsWith('L48');
            return false;
        });

        // Si no hay archivos para la línea, devolver null
        if (archivosFiltrados.length === 0) {
            console.error(`No se encontraron archivos para la línea ${linea}`);
            return null;
        }

        // Buscar en los archivos filtrados
        for (const archivo of archivosFiltrados) {
            const response = await fetch(`doc/traza/${archivo}`);
            const data = await response.json();
            console.log('Datos cargados de', archivo, ':', data);
            console.log('Buscando PK:', pk, 'en línea', linea);
            
            const punto = data.find(p => p.PK === pk);
            if (punto) {
                console.log('Punto encontrado en', archivo, ':', punto);
                return { 
                    latitud: punto.Latitud, 
                    longitud: punto.Longitud 
                };
            }
        }
        console.log(`PK ${pk} no encontrado en la línea ${linea}`);
        return null;
    } catch (error) {
        console.error("Error al cargar los datos de trazado:", error);
        return null;
    }
}

// Inicializar botones como deshabilitados y en color gris
function inicializarBotones() {
    const botones = document.querySelectorAll('.simulador-option-button');
    botones.forEach(boton => {
        boton.disabled = true;
        boton.style.backgroundColor = 'gray';
    });
}

// Función para habilitar/deshabilitar botones
function actualizarEstadoBotones() {
    const linea = document.getElementById('linea-input').value.trim();
    let pk = document.getElementById('pk-input').value.trim();
    pk = pk.replace(/[+,.]/g, ''); // Eliminar caracteres + , . para un formato numérico continuo
    const botones = document.querySelectorAll('.simulador-option-button');

    if (linea && pk) {
        botones.forEach(boton => {
            boton.disabled = false; // Habilitar ambos botones
            if (boton.id === 'ver-maps-button') {
                 boton.style.backgroundColor = 'initial'; // Usar el estilo definido en CSS para el gradiente
            } else { // Botón de MiPK
                 boton.style.backgroundColor = '#28a745'; // Color verde para MiPK
            }
        });
    } else {
        botones.forEach(boton => {
            boton.disabled = true;
            boton.style.backgroundColor = 'gray';
        });
    }
}

// Eventos para actualizar el estado de los botones
const lineaInput = document.getElementById('linea-input');
const pkInput = document.getElementById('pk-input');
lineaInput.addEventListener('input', actualizarEstadoBotones);
pkInput.addEventListener('input', actualizarEstadoBotones);

// Evento para el botón Ver en Maps
const verMapsButton = document.getElementById('ver-maps-button');
verMapsButton.addEventListener('click', async function() {
    mostrarMensaje("Abriendo Google Maps..."); // Mostrar mensaje inmediatamente
    const linea = document.getElementById('linea-input').value;
    let pk = document.getElementById('pk-input').value;
    
    pk = pk.replace(/[+,.]/g, ''); // Asegurar transformación antes de la búsqueda
    const coordenadas = await obtenerCoordenadas(linea, pk);

    if (coordenadas) {
        const url = `https://www.google.com/maps?q=${coordenadas.latitud},${coordenadas.longitud}`;
        window.open(url, '_blank');
        // El mensaje se ocultará automáticamente después de un tiempo definido en mostrarMensaje
    } else {
        alert('No se pudieron obtener las coordenadas para la línea y PK especificados.');
    }
});

// Evento para el botón Ver en MiPK
const verMiPKButton = document.getElementById('ver-mipk-button');
// Función para cerrar todas las tarjetas y menús
function cerrarTodasLasTarjetas() {
    // Cerrar menú de capas si está abierto
    const menuCapas = document.getElementById('menu-capas');
    if (menuCapas) menuCapas.style.display = 'none';
    
    // Cerrar todas las tarjetas de overlay
    const overlayContainers = document.querySelectorAll('.overlay-card-container');
    overlayContainers.forEach(container => {
        container.style.display = 'none';
    });
    
    // Cerrar menú plus si está abierto
    const plusCard = document.getElementById('plus-card-container');
    if (plusCard) plusCard.style.display = 'none';
    
    // Cerrar cualquier otro menú que pueda estar abierto
    const menusAbiertos = document.querySelectorAll('[style*="display: flex"], [style*="display:block"]');
    menusAbiertos.forEach(menu => {
        if (menu.id && menu.id.includes('menu') || menu.className.includes('menu')) {
            menu.style.display = 'none';
        }
    });
}

verMiPKButton.addEventListener('click', async function() {
    // Cerrar todas las tarjetas y menús antes de continuar
    cerrarTodasLasTarjetas();
    
    const linea = document.getElementById('linea-input').value;
    let pk = document.getElementById('pk-input').value;
    
    if (!linea || !pk) {
        mostrarMensaje("Por favor, selecciona una línea y un PK");
        return;
    }
    
    // Formatear el PK si es necesario
    pk = pk.replace(/[+.]/g, ''); // Eliminar caracteres especiales
    
    // Obtener las coordenadas para el PK seleccionado
    const coordenadas = await obtenerCoordenadas(linea, pk);
    
    if (coordenadas) {
        // Actualizar la ubicación del usuario con las coordenadas del PK seleccionado
        lat = coordenadas.latitud;
        lon = coordenadas.longitud;
        
        // Actualizar la posición del usuario (ocultando el marcador ya que es simulado)
        actualizarPosicionUsuario(lat, lon, true);
        
        // Crear un objeto pkMasCercano simulado
        window.pkMasCercano = {
            pk: pk,
            latitud: lat,
            longitud: lon,
            linea: linea,
            ladoVia: 'derecha', // Valor por defecto, se actualizará en calcularPKMasCercano
            esSimulado: true // Marcar como PK simulado
        };
        
        // Actualizar la interfaz con el nuevo PK
        mostrarPKMasCercano(window.pkMasCercano);
        actualizarPosicionPK(window.pkMasCercano);
        
        // Agregar clase para indicar que es un PK simulado
        const tarjetaPK = document.querySelector('#calculoPK .tarjeta');
        if (tarjetaPK) {
            tarjetaPK.classList.add('pk-simulado');
        }
        
        // Cerrar la tarjeta de viajar
        document.getElementById('viajar-card-container').style.display = 'none';
        
        mostrarMensaje("Ubicación Simulada", true); // true para mostrar en rojo
    } else {
        mostrarMensaje('No se pudieron obtener las coordenadas para la línea y PK especificados.');
    }
});

// Evento para el botón VIAJAR
const viajarButton = document.querySelector('.plus-option-button[aria-label="VIAJAR"]');
viajarButton.addEventListener('click', function() {
    document.getElementById('viajar-card-container').style.display = 'flex';
});

document.getElementById('cerrar-viajar-card').addEventListener('click', function() {
    document.getElementById('viajar-card-container').style.display = 'none';
});
document.addEventListener('click', function(event) {
    if (!botonCapas.contains(event.target) && !menuCapas.contains(event.target)) {
        menuCapas.style.display = 'none';
    }
});


/////  INICIO CAPA MI TRAMO  /////---------------------------------------------------------------------------------------



/////  FIN CAPA MI TRAMO /////---------------------------------------------------------------------------------------



/////  INICIO CAPA TRAZADO /////---------------------------------------------------------------------------------------

let trazadosLinea = [];
let ultimoPKPorLinea = {}; // Último PK procesado por línea
const separacionPK = 500; // Selección de puntos cada 500 unidades de PK

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

        // ⛔ **Añadimos la condición para excluir PKs que empiezan por 900** ⛔
        if (pkNumerico >= 900000 && pkNumerico <= 999999) {
            continue; // Saltar este punto y pasar al siguiente
        }

        if (!puntosPorLinea[linea]) {
            puntosPorLinea[linea] = [];
            ultimoPKPorLinea[linea] = pkNumerico; // Inicia con el primer PK (que no empieza por 900)
        }

        if (pkNumerico >= ultimoPKPorLinea[linea]) {
            puntosPorLinea[linea].push([parseFloat(punto.Latitud), parseFloat(punto.Longitud)]);
            ultimoPKPorLinea[linea] = pkNumerico + separacionPK; // Salto de 500 PK
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
    mapa.setZoom(7); // Nivel de zoom fijo (puedes ajustarlo)
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



const iconosEdificios = {
    "SE": 'img/edificios/se_icon.png',
    "ATI": 'img/edificios/energia_icon.png',
    "ATF": 'img/edificios/energia_icon.png',
    "BTS": 'img/edificios/bts_icon.png',
    "5G": 'img/edificios/5g_icon.png',
    "CS": 'img/edificios/iiss_icon.png',
    "PICV": 'img/edificios/iiss_icon.png',
    "ET": 'img/edificios/iiss_icon.png',
    "ESTACIÓN": 'img/edificios/estaciones_icon.png',
    "TUNEL": 'img/edificios/tunel_icon.png',
    "BM": 'img/edificios/bm_icon.png',
    "PUERTA": 'img/iconopuerta.png'
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


async function activarCapaPuertas(layerGroup) {
    try {
        const sistemaCoordenadas = await crearMapaCoordenadas();

        puertasData.forEach(puerta => {
            const pkPuerta = puerta.PK;
            const lineaPuerta = puerta.Linea;
            
            // Buscar las coordenadas usando el nuevo sistema
            const puntoCoordenadas = sistemaCoordenadas.buscar(pkPuerta, lineaPuerta);
            
            if (!puntoCoordenadas) {
                console.warn(`No se encontraron coordenadas para el PK ${pkPuerta} en la línea ${lineaPuerta}`);
                return;
            }

            const icono = crearIconoEdificio("PUERTA");

            if (puntoCoordenadas && icono) {
                const pkFormateado = formatearPK(pkPuerta);
                const marker = L.marker([puntoCoordenadas.Latitud, puntoCoordenadas.Longitud], { icon: icono })
                    .bindPopup(`
                        <div style="text-align: center;">
                            <b style="font-size: 1.1em;">Puerta Vía ${puerta.Via}</b><br>
                            ${pkFormateado} (L${lineaPuerta})<br><br>
                            <button
                                style="padding: 0; border: none; border-radius: 5px; background-color: transparent; cursor: pointer; display:flex; align-items: center; justify-content: center; margin: 0 auto;"
                                onclick="compartirUbicacionEdificio(${puntoCoordenadas.Latitud}, ${puntoCoordenadas.Longitud}, 'Puerta Vía ${puerta.Via}');"
                                aria-label="Compartir ubicación de puerta"
                            >
                                <img src="img/edificios/compartirubi.png" alt="Compartir Ubicación" style="width: 77px; height: 35px;">
                            </button>
                        </div>
                    `);
                layerGroup.addLayer(marker);
            }
        });
        mapa.addLayer(layerGroup);

    } catch (error) {
        console.error("Error al activar la capa de puertas:", error);
    }
}

async function crearMapaCoordenadas() {
    try {
        // Primero obtener todos los datos de los archivos
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

        // Crear un mapa por cada archivo
        const mapasPorArchivo = dataCoordenadasArrays.map(data => {
            const mapa = new Map();
            data.forEach(punto => {
                const key = `${punto.PK}-${punto.Linea}`;
                mapa.set(key, punto);
            });
            return mapa;
        });

        // Función para buscar en todos los mapas en orden
        function buscarCoordenadasEnTodosMapas(pk, linea) {
            const key = `${pk}-${linea}`;
            
            // Primero intentar con el PK exacto
            for (const mapa of mapasPorArchivo) {
                const coordenadas = mapa.get(key);
                if (coordenadas) return coordenadas;
            }

            // Si no se encontró el PK exacto, buscar el más cercano
            const pkNumero = parseInt(pk);
            let coordenadasMasCercanas = null;
            let distanciaMinima = Infinity;

            // Para cada archivo, buscar el punto más cercano
            for (const mapa of mapasPorArchivo) {
                // Obtener todos los puntos del archivo
                const puntos = Array.from(mapa.values());
                
                // Para cada punto, calcular la distancia al PK buscado
                for (const punto of puntos) {
                    const pkPunto = parseInt(punto.PK);
                    const distancia = Math.abs(pkPunto - pkNumero);
                    
                    // Si encontramos un punto más cercano
                    if (distancia < distanciaMinima) {
                        distanciaMinima = distancia;
                        coordenadasMasCercanas = punto;
                    }
                }
            }

            return coordenadasMasCercanas;
        }

        // Devolver una función que busca en todos los mapas
        return {
            buscar: buscarCoordenadasEnTodosMapas
        };

    } catch (error) {
        console.error("Error al crear el mapa de coordenadas:", error);
        return { buscar: () => null };
    }
}

async function activarCapaEdificios(layerGroup, tiposEdificios) {
    try {
        // Limpiar la capa
        layerGroup.clearLayers();
        
        // Cargar datos de edificios si no están cargados
        const edificios = await cargarEdificios();
        
        // Filtrar edificios por los tipos solicitados
        const edificiosFiltrados = edificios.filter(edificio => 
            tiposEdificios.includes(edificio.TIPO)
        );
        
        if (edificiosFiltrados.length === 0) {
            console.warn('No se encontraron edificios de los tipos:', tiposEdificios);
            return;
        }
        
        // Obtener el sistema de coordenadas
        const sistemaCoordenadas = await crearMapaCoordenadas();
        
        // Procesar cada edificio
        for (const edificio of edificiosFiltrados) {
            try {
                const pk = edificio.PK;
                const linea = edificio.LINEA;
                
                // Buscar coordenadas
                const puntoCoordenadas = sistemaCoordenadas.buscar(pk, linea);
                
                if (!puntoCoordenadas) {
                    console.warn(`No se encontraron coordenadas para el PK ${pk} en la línea ${linea}`);
                    continue;
                }
                
                // Crear marcador
                const icono = crearIconoEdificio(edificio.TIPO);
                if (!icono) continue;
                
                const pkFormateado = formatearPK(pk);
                const popupContent = `
                    <div style="text-align: center;">
                        <b>${edificio.NOMBRE || edificio.TIPO}</b><br>
                        ${pkFormateado} (L${linea})<br><br>
                        <button
                            style="padding: 0; border: none; border-radius: 5px; background-color: transparent; cursor: pointer; display:flex; align-items: center; justify-content: center; margin: 0 auto;"
                            onclick="compartirUbicacionEdificio(${puntoCoordenadas.Latitud}, ${puntoCoordenadas.Longitud}, '${edificio.NOMBRE || edificio.TIPO}');"
                            aria-label="Compartir ubicación de ${edificio.NOMBRE || edificio.TIPO}"
                        >
                            <img src="img/edificios/compartirubi.png" alt="Compartir Ubicación" style="width: 77px; height: 35px;">
                        </button>
                    </div>
                `;
                
                const marker = L.marker(
                    [puntoCoordenadas.Latitud, puntoCoordenadas.Longitud], 
                    { icon: icono }
                ).bindPopup(popupContent);
                
                layerGroup.addLayer(marker);
                
            } catch (error) {
                console.error('Error al procesar edificio:', edificio, error);
            }
        }
        
        // Añadir la capa al mapa si no está ya añadida
        if (!mapa.hasLayer(layerGroup)) {
            mapa.addLayer(layerGroup);
        }
        
    } catch (error) {
        console.error('Error en activarCapaEdificios:', error);
        throw error; // Relanzar el error para que pueda ser manejado por el llamador
    }
}

function desactivarCapaEdificios(layerGroup) {
    if (mapa.hasLayer(layerGroup)) {
        mapa.removeLayer(layerGroup);
    }
}

// Función para crear iconos según el tipo de edificio
function crearIconoEdificio(tipo) {
    let iconName;
    
    // Mapear tipos de edificios a sus iconos correspondientes
    switch(tipo) {
        case 'PUERTA':
            iconName = 'iconopuerta.png';
            break;
        case 'BTS':
            iconName = 'bts_icon.png';
            break;
        case '5G':
            iconName = '5g_icon.png';
            break;
        case 'SE':
            iconName = 'se_icon.png';
            break;
        case 'ATI':
        case 'ATF':
            iconName = 'energia_icon.png';
            break;
        case 'CS':
        case 'PICV':
        case 'ET':
            iconName = 'iiss_icon.png';
            break;
        case 'ESTACIÓN':
        case 'BM':
            iconName = 'estaciones_icon.png'; // Asegúrate de que este archivo exista
            break;
        case 'TUNEL':
            iconName = 'tunel_icon.png'; // Asegúrate de que este archivo exista
            break;
        default:
            console.warn(`Tipo de edificio no reconocido: ${tipo}`);
            iconName = 'default_icon.png';
    }
    
    const iconUrl = `img/edificios/${iconName}`;
    
    return L.icon({
        iconUrl: iconUrl,
        iconSize: [25, 25],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
}

// Event listeners para las capas de edificios
const checkEnergia = document.getElementById('check-energia');
const energiaLayer = L.layerGroup();
checkEnergia.addEventListener('change', async function() {
    if (this.checked) {
        const ocultarMensaje = mostrarMensajeCarga('🔄 Cargando capa de Energía...');
        try {
            await activarCapaEdificios(energiaLayer, ["SE", "ATI", "ATF"]);
            setTimeout(ocultarMensaje, 500);
        } catch (error) {
            console.error('Error al cargar capa de Energía:', error);
            mostrarMensajeCarga('❌ Error al cargar la capa de Energía');
            this.checked = false;
            setTimeout(ocultarMensaje, 3000);
        }
    } else {
        desactivarCapaEdificios(energiaLayer);
    }
});

const checkBts = document.getElementById('check-bts');
const btsLayer = L.layerGroup();
checkBts.addEventListener('change', async function() {
    if (this.checked) {
        const ocultarMensaje = mostrarMensajeCarga('🔄 Cargando capa de BTS...');
        try {
            await activarCapaEdificios(btsLayer, ["BTS","5G"]);
            setTimeout(ocultarMensaje, 500);
        } catch (error) {
            console.error('Error al cargar capa de BTS:', error);
            mostrarMensajeCarga('❌ Error al cargar la capa de BTS');
            this.checked = false;
            setTimeout(ocultarMensaje, 3000);
        }
    } else {
        desactivarCapaEdificios(btsLayer);
    }
});

// Función para mostrar un mensaje de carga
function mostrarMensajeCarga(mensaje) {
    // Crear el contenedor del mensaje si no existe
    let mensajeContainer = document.getElementById('mensaje-carga');
    
    if (!mensajeContainer) {
        mensajeContainer = document.createElement('div');
        mensajeContainer.id = 'mensaje-carga';
        mensajeContainer.style.position = 'fixed';
        mensajeContainer.style.top = '50%';
        mensajeContainer.style.left = '50%';
        mensajeContainer.style.transform = 'translate(-50%, -50%)';
        mensajeContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        mensajeContainer.style.color = 'white';
        mensajeContainer.style.padding = '15px 30px';
        mensajeContainer.style.borderRadius = '10px';
        mensajeContainer.style.zIndex = '10000';
        mensajeContainer.style.fontSize = '16px';
        mensajeContainer.style.fontWeight = 'bold';
        mensajeContainer.style.textAlign = 'center';
        mensajeContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        mensajeContainer.style.display = 'none';
        document.body.appendChild(mensajeContainer);
    }

    // Mostrar el mensaje
    mensajeContainer.textContent = mensaje;
    mensajeContainer.style.display = 'block';

    // Devolver función para ocultar el mensaje
    return function() {
        mensajeContainer.style.display = 'none';
    };
}

const checkPuertas = document.getElementById('check-puertas');
const puertasLayer = L.layerGroup();
checkPuertas.addEventListener('change', async function() {
    if (this.checked) {
        // Mostrar mensaje de carga
        const ocultarMensaje = mostrarMensajeCarga('🔄 Cargando capa de Puertas...');
        
        try {
            // Esperar un pequeño retraso para asegurar que el mensaje se muestre
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Activar la capa
            await activarCapaPuertas(puertasLayer);
            
            // Ocultar mensaje después de un breve retraso
            setTimeout(ocultarMensaje, 500);
        } catch (error) {
            console.error('Error al cargar la capa de puertas:', error);
            // Mostrar mensaje de error
            mostrarMensajeCarga('❌ Error al cargar la capa de Puertas');
            // Desmarcar el checkbox en caso de error
            checkPuertas.checked = false;
            // Ocultar mensaje después de 3 segundos
            setTimeout(ocultarMensaje, 3000);
        }
    } else {
        desactivarCapaEdificios(puertasLayer);
    }
});

const checkIiss = document.getElementById('check-iiss');
const iissLayer = L.layerGroup();
checkIiss.addEventListener('change', async function() {
    if (this.checked) {
        const ocultarMensaje = mostrarMensajeCarga('🔄 Cargando capa de IISS...');
        try {
            await activarCapaEdificios(iissLayer, ["CS", "PICV", "ET"]);
            setTimeout(ocultarMensaje, 500);
        } catch (error) {
            console.error('Error al cargar capa de IISS:', error);
            mostrarMensajeCarga('❌ Error al cargar la capa de IISS');
            this.checked = false;
            setTimeout(ocultarMensaje, 3000);
        }
    } else {
        desactivarCapaEdificios(iissLayer);
    }
});

const checkEstaciones = document.getElementById('check-estaciones');
const estacionesLayer = L.layerGroup();
checkEstaciones.addEventListener('change', async function() {
    if (this.checked) {
        const ocultarMensaje = mostrarMensajeCarga('🔄 Cargando capa de Estaciones/BM...');
        try {
            await activarCapaEdificios(estacionesLayer, ["ESTACIÓN", "BM"]);
            setTimeout(ocultarMensaje, 500);
        } catch (error) {
            console.error('Error al cargar capa de Estaciones/BM:', error);
            mostrarMensajeCarga('❌ Error al cargar la capa de Estaciones/BM');
            this.checked = false;
            setTimeout(ocultarMensaje, 3000);
        }
    } else {
        desactivarCapaEdificios(estacionesLayer);
    }
});

const checkTuneles = document.getElementById('check-tuneles');
const tunelesLayer = L.layerGroup();
checkTuneles.addEventListener('change', async function() {
    if (this.checked) {
        const ocultarMensaje = mostrarMensajeCarga('🔄 Cargando capa de Túneles...');
        try {
            await activarCapaEdificios(tunelesLayer, ["TUNEL"]);
            setTimeout(ocultarMensaje, 500);
        } catch (error) {
            console.error('Error al cargar capa de Túneles:', error);
            mostrarMensajeCarga('❌ Error al cargar la capa de Túneles');
            this.checked = false;
            setTimeout(ocultarMensaje, 3000);
        }
    } else {
        desactivarCapaEdificios(tunelesLayer);
    }
});

/////  FIN CAPA EDIFICIOS /////---------------------------------------------------------------------------------------


// ----- INICIO FUNCIONALIDAD GENERAR BOTONES OCUPACIÓN -----

function generarBotonesOcupacion() {
    const botonesOcupacionContainer = document.getElementById('botones-ocupacion-container');
    botonesOcupacionContainer.innerHTML = ''; // Limpiar el contenedor antes de añadir nuevos botones

    const botonesData = [
        { nombre: "BM VILLARRUBIA", enlace: "https://inecospain-my.sharepoint.com/:f:/r/personal/maria_bausela_ineco_com/Documents/Ocupaci%C3%B3n%20de%20V%C3%ADa%20Levante/Ocupaci%C3%B3n%20Base%20Villarrubia?csf=1&web=1&e=3pdCf0" }, // Reemplazar "#" con el enlace real
        { nombre: "BM GABALDÓN", enlace: "https://inecospain-my.sharepoint.com/:f:/r/personal/maria_bausela_ineco_com/Documents/Ocupaci%C3%B3n%20de%20V%C3%ADa%20Levante/Ocupaci%C3%B3n%20Base%20Gabald%C3%B3n?csf=1&web=1&e=32Zft1" },   // Reemplazar "#" con el enlace real
        { nombre: "BM REQUENA", enlace: "https://inecospain-my.sharepoint.com/:f:/r/personal/maria_bausela_ineco_com/Documents/Ocupaci%C3%B3n%20de%20V%C3%ADa%20Levante/Ocupaci%C3%B3n%20Base%20Requena?csf=1&web=1&e=TpqMJK" },    // Reemplazar "#" con el enlace real
        { nombre: "BM MONFORTE", enlace: "https://inecospain-my.sharepoint.com/:f:/r/personal/maria_bausela_ineco_com/Documents/Ocupaci%C3%B3n%20de%20V%C3%ADa%20Levante/Ocupaci%C3%B3n%20Base%20Monforte?csf=1&web=1&e=gSh5NK" }    // Reemplazar "#" con el enlace real
    ];

    botonesData.forEach(botonData => {
        const boton = document.createElement('a');
        boton.href = botonData.enlace;
        boton.target = "_blank"; // Para abrir el enlace en una nueva pestaña
        boton.className = 'operador-button'; // Usamos la misma clase que los botones del Mallas
        boton.textContent = botonData.nombre;
        botonesOcupacionContainer.appendChild(boton);
    });
}

// ----- FIN FUNCIONALIDAD GENERAR BOTONES OCUPACIÓN -----

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
        const enlacesVerMapa = document.querySelectorAll('.ver-en-mapa-button'); // *** Selector MODIFICADO ***
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
               const puertaTexto = puertaFila.querySelector(".pk-puerta-fila").textContent;
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
    console.log("Generando HTML de puertas cercanas (DISEÑO MEJORADO)...", puertasCercanas);

    let html = '';

    if (window.pkMasCercano) {
        const pkActualFormateado = formatearPK(window.pkMasCercano.pk);
       html += `<p style="text-align: center; font-weight: bold; margin-bottom: 20px; font-size: 1.2em; color: white;">▶️ Estás en el PK: ${pkActualFormateado} ◀️</p>`; // Estilo texto PK actual
    } else {
        html += `<p style="text-align: center; font-style: italic; margin-bottom: 20px; color: white;">Calculando PK actual...</p>`; // Estilo texto "Calculando PK"
    }

    let puertasArray = [];

    for (const via in puertasCercanas) {
        const tienePuertas = puertasCercanas[via].creciente || puertasCercanas[via].decreciente;
        if (tienePuertas) {
            console.log(`Agregando título de vía: ${via}`);
           html += `<h3 style="margin-bottom: 15px; margin-top: 20px; color: white;"><u>Vía ${via}</u></h3>`; // Estilo título Vía
        }

        if (puertasCercanas[via].creciente) {
            const puerta = puertasCercanas[via].creciente;
            const distanciaFormateada = puerta.diferenciaPK.toFixed(0);
            const pkFormateado = formatearPK(puerta.PK);
            console.log(`  - Agregando puerta creciente: PK ${puerta.PK}, distancia ${distanciaFormateada}, Latitud: ${puerta.Latitud}, Longitud: ${puerta.Longitud}`);

            html += `
            <div class="puerta-fila">
                <div class="icono-puerta-fila">🚪</div>  <!-- Icono de puerta -->
                <div class="info-puerta-fila">
                    <span class="distancia-puerta-fila">+${distanciaFormateada} metros</span>
                    <span class="pk-puerta-fila">PK ${pkFormateado}</span>
                </div>
                <a href="#" class="ver-en-mapa-button" data-lat="${puerta.Latitud}" data-lon="${puerta.Longitud}" data-via="${via}">
                    Ver en Mapa
                </a>
            </div>`;
            puertasArray.push(puerta);
        }

        if (puertasCercanas[via].decreciente) {
            const puerta = puertasCercanas[via].decreciente;
            const distanciaFormateada = puerta.diferenciaPK.toFixed(0);
            const pkFormateado = formatearPK(puerta.PK);
            console.log(`  - Agregando puerta decreciente: PK ${puerta.PK}, distancia ${distanciaFormateada}, Latitud: ${puerta.Latitud}, Longitud: ${puerta.Longitud}`);
            html += `
            <div class="puerta-fila">
                <div class="icono-puerta-fila">🚪</div>  <!-- Icono de puerta -->
                <div class="info-puerta-fila">
                    <span class="distancia-puerta-fila">${distanciaFormateada} metros</span>
                    <span class="pk-puerta-fila">PK ${pkFormateado}</span>
                </div>
                <a href="#" class="ver-en-mapa-button" data-lat="${puerta.Latitud}" data-lon="${puerta.Longitud}" data-via="${via}">
                    Ver en Mapa
                </a>
            </div>`;
            puertasArray.push(puerta);
        }
    }

    if (html === '') {
           console.log("No se encontraron puertas cercanas. Mostrando mensaje.");
        html = '<p style="color: white;">No se encontraron puertas cercanas.</p>'; // Estilo mensaje "No se encontraron puertas"
    } else {
          console.log("Añadiendo enlaces para ver todas las puertas y buscar por PK");
        html += `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.3);"> <!-- Separador superior y estilo contenedor enlaces -->
            <a href="#" id="ver-todas-puertas" data-puertas='${JSON.stringify(puertasArray)}' class="enlace-puertas-card"> <!-- Clase para enlaces inferiores -->
                <img src="img/vertodasmapa.png" alt="Ver todas las puertas en el mapa" style="width: 120px; height: auto;">
            </a>
            <a href="#" id="buscar-puerta-por-pk" class="enlace-puertas-card"> <!-- Clase para enlaces inferiores -->
                <img src="img/buscapuerta.png" alt="Buscar puerta por PK" style="width: 120px; height: auto;">
            </a>
        </div>
        <div id="mensaje-proximamente" style="display: none; text-align: center; margin-top: 10px; background-color: #f8f9fa; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
            <p style="font-weight: bold; color: #333;">PROXIMAMENTE</p>
            <p style="color: #333;">Búsqueda de Puertas por PK</p>
        </div>
    `;
    }
      console.log("HTML de puertas generado (DISEÑO MEJORADO):", html);

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
             window.open('https://adif365.sharepoint.com/:b:/r/sites/SubdirecciondeOperacionesAV/Documentos%20compartidos/0.%20Subdirecci%C3%B3n%20de%20Operaciones%20AV/GAIAV/Este/GMAVE/Z01%20DOC.%20COM%C3%9AN/MiPK%20%F0%9F%93%8D/Actas/Semana%20Actual/Acta.pdf?csf=1&web=1&e=kODiY7', '_blank'); // Abre la URL en una nueva pestaña
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



    // ----- INICIO FUNCIONALIDAD BOTÓN OCUPACIÓN -----

    const ocupacionButton = document.querySelector('.plus-option-button[aria-label="OCUPACIÓN"]');
    const ocupacionCardContainer = document.getElementById('ocupacion-card-container');
    const cerrarOcupacionCardButton = document.getElementById('cerrar-ocupacion-card');

    if (ocupacionButton) {
        ocupacionButton.addEventListener('click', function() {
            ocupacionCardContainer.style.display = 'flex'; // Mostrar la tarjeta OCUPACIÓN
            generarBotonesOcupacion(); // Llamamos a la función para generar los botones
        });
    } else {
        console.error('No se encontró el botón OCUPACIÓN');
    }

    if (cerrarOcupacionCardButton) {
        cerrarOcupacionCardButton.addEventListener('click', function() {
            ocupacionCardContainer.style.display = 'none'; // Ocultar la tarjeta OCUPACIÓN al hacer clic en "Cerrar"
        });
    } else {
        console.error('No se encontró el botón de cerrar de la tarjeta OCUPACIÓN');
    }

    // ----- FIN FUNCIONALIDAD BOTÓN OCUPACIÓN -----



 // ----- INICIO FUNCIONALIDAD BOTÓN ACCIDENTE -----
    // ----- INICIO FUNCIONALIDAD BOTÓN ACCIDENTE -----
    const accidenteButton = document.querySelector('.plus-option-button[aria-label="ACCIDENTE"]');
    const accidenteCardContainer = document.getElementById('accidente-card-container');
    const plusCardContainer = document.getElementById('plus-card-container');
    const cerrarAccidenteCardButton = document.getElementById('cerrar-accidente-card');

    const botonTrabajadorAccidente = document.getElementById('boton-trabajador');
    const instruccionesTrabajadorCardContainer = document.getElementById('instrucciones-trabajador-card-container');
    const cerrarInstruccionesTrabajadorCardButton = document.getElementById('cerrar-instrucciones-trabajador-card');

    const botonVehiculoAccidente = document.getElementById('boton-vehiculo');
    const instruccionesVehiculoCardContainer = document.getElementById('instrucciones-vehiculo-card-container');
    const cerrarInstruccionesVehiculoCardButton = document.getElementById('cerrar-instrucciones-vehiculo-card');


    if (accidenteButton) {
        accidenteButton.addEventListener('click', function() {
            plusCardContainer.style.display = 'none'; // Ocultar la tarjeta PLUS
            accidenteCardContainer.style.display = 'flex'; // Mostrar la tarjeta ACCIDENTE (tipos de accidente)
        });
    } else {
        console.error('No se encontró el botón ACCIDENTE');
    }

    if (cerrarAccidenteCardButton) {
        cerrarAccidenteCardButton.addEventListener('click', function() {
            accidenteCardContainer.style.display = 'none'; // Ocultar la tarjeta ACCIDENTE (tipos de accidente)
        });
    } else {
        console.error('No se encontró el botón de cerrar de la tarjeta ACCIDENTE');
    }

    if (botonTrabajadorAccidente) {
        botonTrabajadorAccidente.addEventListener('click', function() {
            accidenteCardContainer.style.display = 'none'; // Ocultar tarjeta ACCIDENTE (tipos de accidente)
            instruccionesTrabajadorCardContainer.style.display = 'flex'; // Mostrar tarjeta instrucciones TRABAJADOR
        });
    } else {
        console.error('No se encontró el botón TRABAJADOR en tarjeta ACCIDENTE');
    }

    if (cerrarInstruccionesTrabajadorCardButton) {
        cerrarInstruccionesTrabajadorCardButton.addEventListener('click', function() {
            instruccionesTrabajadorCardContainer.style.display = 'none'; // Ocultar tarjeta instrucciones TRABAJADOR
        });
    } else {
        console.error('No se encontró el botón de cerrar de la tarjeta instrucciones TRABAJADOR');
    }

    if (botonVehiculoAccidente) {
        botonVehiculoAccidente.addEventListener('click', function() {
            accidenteCardContainer.style.display = 'none'; // Ocultar tarjeta ACCIDENTE (tipos de accidente)
            instruccionesVehiculoCardContainer.style.display = 'flex'; // Mostrar tarjeta instrucciones VEHÍCULO
        });
    } else {
        console.error('No se encontró el botón VEHÍCULO en tarjeta ACCIDENTE');
    }

    if (cerrarInstruccionesVehiculoCardButton) {
        cerrarInstruccionesVehiculoCardButton.addEventListener('click', function() {
            instruccionesVehiculoCardContainer.style.display = 'none'; // Ocultar tarjeta instrucciones VEHÍCULO
        });
    } else {
        console.error('No se encontró el botón de cerrar de la tarjeta instrucciones VEHÍCULO');
    }

    // ----- FIN FUNCIONALIDAD BOTÓN ACCIDENTE -----


// ----- INICIO FUNCIONALIDAD TRENES -----

document.addEventListener('DOMContentLoaded', function() {
    const trenesButton = document.querySelector('.plus-option-button[aria-label="TRENES"]');
    const trenesCardContainer = document.getElementById('trenes-card-container');
    const trenesContainer = document.getElementById('trenes-container');
    const cerrarTrenesCardButton = document.getElementById('cerrar-trenes-card');
    let trenesInterval; // Variable para almacenar el intervalo

    // *** AÑADIDO: Crear la cabecera de la tabla UNA SOLA VEZ ***
    let tablaHTML = `
        <table style="width:100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th colspan="5" style="text-align: left; padding: 8px; color: white;">
                        <div style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="check-anteriores" style="margin-right: 5px;">
                            <label for="check-anteriores" style="margin:0; cursor: pointer;">Mostrar anteriores</label>
                        </div>
                    </th>
                </tr>
                <tr style="border-bottom: 1px solid white;">
                    <th style="padding: 8px; text-align: center; color: white;">HORA</th>
                    <th style="padding: 8px; text-align: center; color: white;">MIN.</th>
                    <th style="padding: 8px; text-align: center; color: white;">VÍA</th>
                    <th style="padding: 8px; text-align: center; color: white;">ORI/DES</th>
                    <th style="padding: 8px; text-align: center; color: white;">MODELO</th>
                </tr>
            </thead>
            <tbody>  <!-- CUERPO DE LA TABLA VACÍO INICIALMENTE -->
            </tbody>
        </table>
    `;
    trenesContainer.innerHTML = tablaHTML; // Insertar la cabecera

    // *** AÑADIDO: Event listener para el checkbox (fuera de mostrarTrenesCercanosInterpolado) ***
    const checkboxMostrarAnteriores = document.getElementById('check-anteriores');
    if (checkboxMostrarAnteriores) {
        checkboxMostrarAnteriores.addEventListener('change', mostrarTrenesCercanosInterpolado);
    }


    if (trenesButton) {
        trenesButton.addEventListener('click', function() {
            trenesCardContainer.style.display = 'flex';
            mostrarTrenesCercanosInterpolado(); // Carga inicial de la tabla
            // *** INICIO: CONFIGURAR INTERVALO PARA ACTUALIZACIÓN CADA MINUTO ***
            if (!trenesInterval) { // Verifica si el intervalo ya existe para evitar duplicados
                trenesInterval = setInterval(mostrarTrenesCercanosInterpolado, 60000); // 60000 ms = 1 minuto
            }
            // *** FIN: CONFIGURAR INTERVALO ***
        });
    } else {
        console.error('No se encontró el botón TRENES');
    }

    if (cerrarTrenesCardButton) {
        cerrarTrenesCardButton.addEventListener('click', function() {
            trenesCardContainer.style.display = 'none';
            // *** INICIO: LIMPIAR INTERVALO AL CERRAR LA TARJETA ***
            clearInterval(trenesInterval);
            trenesInterval = null; // Resetear la variable del intervalo
            // *** FIN: LIMPIAR INTERVALO ***
        });
    } else {
        console.error('No se encontró el botón de cerrar de la tarjeta de Trenes');
    }

}); // Fin del DOMContentLoaded


async function mostrarTrenesCercanosInterpolado() {
    // Crear la superposición
    const overlayDiv = document.createElement('div');
    overlayDiv.style.position = 'fixed';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.width = '100%';
    overlayDiv.style.height = '100%';
    overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlayDiv.style.display = 'flex';
    overlayDiv.style.justifyContent = 'center';
    overlayDiv.style.alignItems = 'center';
    overlayDiv.style.zIndex = '9999'; // Asegurar que esté en primer plano
    overlayDiv.style.pointerEvents = 'none'; // Evitar que la superposición capture eventos

    // Crear la tarjeta de advertencia
    const advertenciaDiv = document.createElement('div');
    advertenciaDiv.style.backgroundColor = 'red';
    advertenciaDiv.style.color = 'white';
    advertenciaDiv.style.padding = '30px';
    advertenciaDiv.style.textAlign = 'center';
    advertenciaDiv.style.fontWeight = 'bold';
    advertenciaDiv.style.fontSize = '2em';
    advertenciaDiv.style.border = '5px solid yellow';
    advertenciaDiv.style.borderRadius = '15px';
    advertenciaDiv.style.boxShadow = '0 0 30px red';
    advertenciaDiv.style.animation = 'pulse 1s infinite alternate';
    advertenciaDiv.style.zIndex = '10000'; // Asegurar que esté en primer plano
    advertenciaDiv.style.position = 'fixed'; // Añadir posición fixed
    advertenciaDiv.innerHTML = '⚠️ ¡Advertencia! ⚠️<br>Los horarios son orientativos.<br>Verifique siempre con el Puesto de Mando.';

    // Agregar animación (se debe definir en CSS)
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = `@keyframes pulse {
      from { opacity: 1; }
      to { opacity: 0.7; }
    }`;
    document.head.appendChild(styleSheet);

    // Insertar la tarjeta de advertencia dentro de la superposición
    overlayDiv.appendChild(advertenciaDiv);
    document.body.appendChild(overlayDiv);

    // Ocultar la superposición después de 5 segundos
    setTimeout(() => {
        overlayDiv.style.display = 'none';
    }, 3000);

    // Obtener el tbody de la tabla (ya existente)
    const tbody = document.querySelector('#trenes-container tbody');
    if (!tbody) {
        console.error("mostrarTrenesCercanosInterpolado: No se encontró el tbody de la tabla.");
        return;
    }
    tbody.innerHTML = '<p style="text-align: center;">Actualizando horarios de trenes...</p>'; // Mensaje de carga

    // *** OBTENER ESTADO DEL CHECKBOX (si existe) ***
    const checkboxMostrarAnteriores = document.getElementById('check-anteriores');
    const mostrarAnteriores = checkboxMostrarAnteriores ? checkboxMostrarAnteriores.checked : false;

    // *** AÑADIDO: Obtener referencia al elemento trenes-pk-actual ***
    const trenesPkActualElement = document.getElementById('trenes-pk-actual');

    // *** AÑADIDO: Actualizar el texto del elemento con el PK formateado ***
    if (window.pkMasCercano) {
        const pkFormateado = formatearPK(window.pkMasCercano.pk);
        trenesPkActualElement.textContent = `PK: ${pkFormateado}`;
    } else {
        trenesPkActualElement.textContent = 'Calculando PK...';
    }

    try {
        const trenesData = await cargarJSON("./doc/trenes/TrenesALIEne25.json");
        const horaPasoData = await cargarJSON("./doc/trenes/horapasoA.json");

        if (!window.pkMasCercano || !window.pkMasCercano.linea) {
            trenesContainer.innerHTML = '<p style="text-align: center; color: red;">No se puede determinar la línea actual. PK desconocido.</p>';
            return;
        }

        const lineaUsuario = window.pkMasCercano.linea;
        const pkUsuarioNumerico = pkToNumber(window.pkMasCercano.pk);
        const horaActualUsuario = new Date();

        const trenesFiltrados = trenesData.filter(tren => tren.Línea === lineaUsuario);

        if (trenesFiltrados.length === 0) {
            trenesContainer.innerHTML = '<p style="text-align: center;">No hay trenes programados para la línea actual.</p>';
            return;
        }

        const resultadosTrenes = [];

        for (const tren of trenesFiltrados) {
            if (tren.Red !== "AV") {
                continue;
            }
            const tipoTren = tren.Tipo;
            if (tipoTren === 'C') {
                if (pkUsuarioNumerico < 465000 || pkUsuarioNumerico > 485900) {
                    continue;
                }
            }

            const pkTrenReferenciaNumerico = pkToNumber(tren.PK);
            const horaProgramadaParts = tren["Hora"].split(':');
            const horaProgramadaSegundos = parseInt(horaProgramadaParts[0]) * 3600 + parseInt(horaProgramadaParts[1]) * 60;
            const sentidoVia = tren.Vía === '1' ? 'decreciente' : 'creciente';

            const tiempoViajeSegundosInterpolado = await calcularTiempoViajeInterpolado(pkTrenReferenciaNumerico, pkUsuarioNumerico, lineaUsuario, horaPasoData, tipoTren);

            let horaPasoEstimadaSegundos;
            if (sentidoVia === 'decreciente') {
                horaPasoEstimadaSegundos = horaProgramadaSegundos + tiempoViajeSegundosInterpolado;
            } else {
                horaPasoEstimadaSegundos = horaProgramadaSegundos - tiempoViajeSegundosInterpolado;
            }

            const horaPasoEstimadaDate = new Date();
            horaPasoEstimadaDate.setHours(0, 0, 0, 0);
            horaPasoEstimadaDate.setSeconds(horaPasoEstimadaSegundos);
            const horaPasoFormateada = formatearHora(horaPasoEstimadaSegundos);

            const tiempoRestanteSegundos = horaPasoEstimadaSegundos - (horaActualUsuario.getHours() * 3600 + horaActualUsuario.getMinutes() * 60 + horaActualUsuario.getSeconds());
            const minutosRestantes = Math.round(tiempoRestanteSegundos / 60);

            resultadosTrenes.push({
                horaPaso: horaPasoFormateada,
                minutosRestantes: minutosRestantes,
                via: tren.Vía,
                origenDestino: tren.OD,
                horaProgramada: tren["Hora"],
                modelo: tren.Modelo,
                pasado: minutosRestantes <= -15  //  "pasado" si son 15 minutos o más
            });
        }

        // Filtrado condicional
        let resultadosTrenesFiltrados;
        if (mostrarAnteriores) {
              resultadosTrenesFiltrados = resultadosTrenes;
        } else {
            const tiempoLimitePasadoMinutos = -15;
            resultadosTrenesFiltrados = resultadosTrenes.filter(tren => tren.minutosRestantes > tiempoLimitePasadoMinutos);
        }

        resultadosTrenesFiltrados.sort((a, b) => {
            const horaA_parts = a.horaPaso.split(':');
            const horaB_parts = b.horaPaso.split(':');
            const horaA_segundos = parseInt(horaA_parts[0]) * 3600 + parseInt(horaA_parts[1]) * 60;
            const horaB_segundos = parseInt(horaB_parts[0]) * 3600 + parseInt(horaB_parts[1]) * 60;
            return horaA_segundos - horaB_segundos;
        });

        //  Construir SOLO el <tbody>
        let tablaHTML = ''; // Ya no se necesita la tabla completa, solo el tbody
        for (const trenResultado of resultadosTrenesFiltrados) {
            let claseFila = "";
            let horaPasoCelda, minutosRestantesCelda;

            // *** CORREGIDO: El parpadeo ahora es SIEMPRE para trenes próximos (<= 2 minutos) ***
            if (Math.abs(trenResultado.minutosRestantes) <= 2) {
                claseFila = "tren-proximo-parpadeo";
                horaPasoCelda = '🕒';
                minutosRestantesCelda = 'Próximo';
            } else {
                horaPasoCelda = trenResultado.horaPaso;
                minutosRestantesCelda = trenResultado.minutosRestantes;
            }

             if (trenResultado.pasado) {
                claseFila = "tren-pasado"; // Aplica clase para trenes pasados
             }

        //  Mapeo de modelos a imágenes (añadir más si es necesario)
        let imagenModelo = "";
        const modeloTren = trenResultado.modelo.toUpperCase(); //Ensure case consistency for matching

        if (modeloTren.includes("ALVIA")) {
            imagenModelo = '<img src="img/trenes/alvia.png" alt="Alvia">';
        } else if (modeloTren.includes("AVANT")) {
            imagenModelo = '<img src="img/trenes/avant.png" alt="Avant">';
        } else if (modeloTren.includes("AVE") && !modeloTren.includes("AVLO")) { // Ensure AVLO is not matched here
            imagenModelo = '<img src="img/trenes/ave.png" alt="Ave">';
        } else if (modeloTren.includes("AVLO")) {
            imagenModelo = '<img src="img/trenes/avlo.png" alt="Avlo">';
        } else if (modeloTren.includes("OUIGO")) {
            imagenModelo = '<img src="img/trenes/ouigo.png" alt="Ouigo">';
        } else if (modeloTren.includes("IRYO")) {
             imagenModelo = '<img src="img/trenes/iryo.png" alt="Iryo">';
        } else {
           imagenModelo = '<span> - </span>';  // Or a default image, or empty string
        }

            tablaHTML += `
                <tr class="${claseFila}" style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px; color: white; text-align: center">${horaPasoCelda}</td>
                    <td style="padding: 8px; color: white; text-align: center">${minutosRestantesCelda}</td>
                    <td style="padding: 8px; color: white; text-align: center">${trenResultado.via}</td>
                    <td style="padding: 8px; color: white; text-align: center">${trenResultado.origenDestino}</td>
                    <td style="padding: 8px; color: white; text-align: center">${imagenModelo}</td>
                </tr>
            `;
        }


        tbody.innerHTML = tablaHTML; // Insertar el tbody generado en la tabla existente.


    } catch (error) {
        console.error("Error al cargar datos de trenes o calcular tiempos:", error);
        trenesContainer.innerHTML = '<p style="text-align: center; color: red;">Error al cargar horarios de trenes.</p>';
    }
}

    async function cargarJSON(rutaArchivo) {
        const response = await fetch(rutaArchivo);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} en ${rutaArchivo}`);
        }
        return await response.json();
    }

    async function calcularTiempoViajeInterpolado(pkTrenReferencia, pkUsuario, linea, horaPasoData, tipoTren) {
        const pkUsuarioNumerico = pkToNumber(pkUsuario);
        const pkTrenReferenciaNumerico = pkToNumber(pkTrenReferencia);

        const tiemposLinea = horaPasoData.filter(item => item.Linea === linea);

        if (tiemposLinea.length === 0) {
            console.warn(`No hay datos de tiempo de paso para la línea ${linea}. Usando tiempo de viaje 0.`);
            return 0;
        }

        tiemposLinea.sort((a, b) => pkToNumber(b.PK) - pkToNumber(a.PK));

        let pkTablaAnterior = null;
        let pkTablaPosterior = null;

        for (let i = 0; i < tiemposLinea.length; i++) {
            const pkTablaActualNumerico = pkToNumber(tiemposLinea[i].PK);

            if (pkTablaActualNumerico <= pkUsuarioNumerico) {
                pkTablaAnterior = tiemposLinea[i];
                pkTablaPosterior = tiemposLinea[i - 1] || pkTablaAnterior;
                break;
            }
        }

        if (!pkTablaAnterior) {
            pkTablaAnterior = tiemposLinea[tiemposLinea.length - 1];
            pkTablaPosterior = tiemposLinea[0];
        }

        const pkAnteriorNumerico = pkToNumber(pkTablaAnterior.PK);
        const pkPosteriorNumerico = pkToNumber(pkTablaPosterior.PK);
        let tiempoAnterior, tiempoPosterior;

        switch (tipoTren) {
            case 'A':
                tiempoAnterior = parseFloat(pkTablaAnterior.A) || 0;
                tiempoPosterior = parseFloat(pkTablaPosterior.A) || 0;
                break;
            case 'B':
                tiempoAnterior = parseFloat(pkTablaAnterior.B) || 0;
                tiempoPosterior = parseFloat(pkTablaPosterior.B) || 0;
                break;
            case 'C':
                tiempoAnterior = parseFloat(pkTablaAnterior.C) || 0;
                tiempoPosterior = parseFloat(pkTablaPosterior.C) || 0;
                break;
            default: // Tipo desconocido, usar tipo A por defecto
                tiempoAnterior = parseFloat(pkTablaAnterior.A) || 0;
                tiempoPosterior = parseFloat(pkTablaPosterior.A) || 0;
                console.warn(`Tipo de tren desconocido: ${tipoTren}. Usando tipo A por defecto.`);
        }


        let tiempoInterpoladoMinutos;

        if (pkUsuarioNumerico === pkTrenReferenciaNumerico) {
            tiempoInterpoladoMinutos = 0;
        } else if (pkAnteriorNumerico === pkPosteriorNumerico) {
            tiempoInterpoladoMinutos = tiempoAnterior;
        } else {
            tiempoInterpoladoMinutos = tiempoAnterior + ((pkUsuarioNumerico - pkAnteriorNumerico) / (pkPosteriorNumerico - pkAnteriorNumerico)) * (tiempoPosterior - tiempoAnterior);
        }

        return Math.max(0, Math.round(tiempoInterpoladoMinutos * 60));
    }


    function formatearHora(segundosDesdeMedianoche) {
        if (isNaN(segundosDesdeMedianoche) || segundosDesdeMedianoche < 0) {
            return "--:--";
        }
        const horas = Math.floor(segundosDesdeMedianoche / 3600);
        const minutos = Math.floor((segundosDesdeMedianoche % 3600) / 60);
        return String(horas).padStart(2, '0') + ':' + String(minutos).padStart(2, '0');
    }
// ----- FIN FUNCIONALIDAD TRENES -----

///// INICIO ICONO GUARDIA ACTAS /////

document.addEventListener('DOMContentLoaded', function() {
    const guardiaActasButtonPlus = document.querySelector('.plus-option-button[aria-label="GUARDIA ACTAS"]');
    const guardiaActasCardContainer = document.getElementById('guardiactas-card-container');
    const cerrarGuardiaActasCardButton = document.getElementById('cerrar-guardiactas-card');
    const guardiaActasListContainer = document.getElementById('guardiactas-list');
    const guardiaActasDetailsCard = document.getElementById('guardiactas-details-card');
    const guardiaActasEditCard = document.getElementById('guardiactas-edit-card');
    const guardiaActasPasswordContainer = document.getElementById('guardiactas-password-container');
    const mensajeCardContainer = document.getElementById('mensaje-card-container');

    const guardiasLista = ["Ana", "Edu", "Ernesto", "Iván", "Manuel", "Pepe", "Raúl"]; // Lista de guardias

    if (guardiaActasButtonPlus) {
        guardiaActasButtonPlus.addEventListener('click', function() {
            guardiaActasCardContainer.style.display = 'flex';
            mostrarListaSemanasGuardiaActas();
        });
    }

    if (cerrarGuardiaActasCardButton) {
        cerrarGuardiaActasCardButton.addEventListener('click', function() {
            guardiaActasCardContainer.style.display = 'none';
            ocultarTarjetasGuardiaActas();
        });
    }

    function ocultarTarjetasGuardiaActas() {
        guardiaActasDetailsCard.style.display = 'none';
        guardiaActasEditCard.style.display = 'none';
        guardiaActasPasswordContainer.style.display = 'none';
        mensajeCardContainer.style.display = 'none';
    }

    async function mostrarListaSemanasGuardiaActas() {
        guardiaActasListContainer.innerHTML = ''; // Limpiar lista anterior
        guardiaActasListContainer.style.display = 'block'; // Asegurar que se muestra la lista
        guardiaActasDetailsCard.style.display = 'none';
        guardiaActasEditCard.style.display = 'none';
        guardiaActasPasswordContainer.style.display = 'none';

        const jsonData = await cargarDatosGuardiaActas(); // Cargar datos desde el archivo JSON
        console.log("jsonData después de cargarDatosGuardiaActas (mostrarListaSemanasGuardiaActas):", jsonData); // <-- LOGGING AÑADIDO
        const semanasData = jsonData.semanas;

        const semanaActual = obtenerNumeroSemana(new Date());
        for (let i = 0; i < 2; i++) { // Mostrar semana actual y anterior
            const semana = semanaActual - i;
            const fechaInicioFin = obtenerRangoFechasSemana(semana, new Date().getFullYear());
            const datosSemana = semanasData.find(s => s.semana === semana) || {}; // Buscar datos de la semana en jsonData
            const semanaDiv = document.createElement('div');
            semanaDiv.innerHTML = `
                Semana ${semana} (${fechaInicioFin})
                <button class="boton-ver-guardiactas" data-semana="${semana}">👁️</button>
                <button class="boton-editar-guardiactas" data-semana="${semana}">✏️</button>
            `;
            guardiaActasListContainer.appendChild(semanaDiv);
        }
        agregarEventosBotonesSemana();
    }

    function agregarEventosBotonesSemana() {
        document.querySelectorAll('.boton-ver-guardiactas').forEach(button => {
            button.addEventListener('click', function() {
                const semana = this.dataset.semana;
                mostrarDetallesSemanaGuardiaActas(semana);
            });
        });
        document.querySelectorAll('.boton-editar-guardiactas').forEach(button => {
            button.addEventListener('click', function() {
                const semana = this.dataset.semana;
                mostrarPasswordCardGuardiaActas(semana);
            });
        });
    }

    async function mostrarDetallesSemanaGuardiaActas(semana) {
        const jsonData = await cargarDatosGuardiaActas();
        const datosSemana = jsonData.semanas.find(s => s.semana === parseInt(semana)) || {};
        console.log("datosSemana en mostrarDetallesSemanaGuardiaActas:", datosSemana); // <-- LOGGING AÑADIDO (¡NUEVO!)
        guardiaActasListContainer.style.display = 'none';
        guardiaActasDetailsCard.style.display = 'block';

        document.getElementById('guardiactas-details-semana').textContent = semana;
        document.getElementById('guardiactas-details-fecha').textContent = obtenerRangoFechasSemana(semana, new Date().getFullYear());
        document.getElementById('guardiactas-details-ilt').textContent = datosSemana.actaILT || 'Sin datos';
        document.getElementById('guardiactas-details-estaciones').textContent = datosSemana.actaEstaciones || 'Sin datos';
        document.getElementById('guardiactas-details-guardia').textContent = datosSemana.guardia || 'Sin datos';
    }

    document.getElementById('guardiactas-details-volver-button').addEventListener('click', function() {
        mostrarListaSemanasGuardiaActas();
    });

    function mostrarPasswordCardGuardiaActas(semana) {
        guardiaActasListContainer.style.display = 'none';
        guardiaActasPasswordContainer.style.display = 'flex';

        const confirmarPasswordButton = document.getElementById('guardiactas-password-confirmar-button');
        const passwordInput = document.getElementById('guardiactas-password-input');

        const confirmarPasswordHandler = function() {
            if (passwordInput.value === 'MDC') {
                guardiaActasPasswordContainer.style.display = 'none';
                mostrarEditarSemanaGuardiaActas(semana);
                // Eliminar el event listener después de usarlo para evitar múltiples ejecuciones
                confirmarPasswordButton.removeEventListener('click', confirmarPasswordHandler);
            } else {
                mostrarMensajeGuardiaActas("Error", "Contraseña incorrecta");
                // Eliminar el event listener también en caso de contraseña incorrecta
                confirmarPasswordButton.removeEventListener('click', confirmarPasswordHandler);
            }
        };

        // Asignar el event listener CADA VEZ que se muestra la tarjeta de contraseña
        confirmarPasswordButton.addEventListener('click', confirmarPasswordHandler);
    }

    async function mostrarEditarSemanaGuardiaActas(semana) {
        const jsonData = await cargarDatosGuardiaActas();
        const datosSemana = jsonData.semanas.find(s => s.semana === parseInt(semana)) || {};
        guardiaActasEditCard.style.display = 'block';
        guardiaActasListContainer.style.display = 'none';
        guardiaActasDetailsCard.style.display = 'none';

        document.getElementById('guardiactas-edit-semana').textContent = semana;
        document.getElementById('guardiactas-edit-ilt').value = datosSemana.actaILT || '';
        document.getElementById('guardiactas-edit-estaciones').value = datosSemana.actaEstaciones || '';

        const guardiaSelect = document.getElementById('guardiactas-edit-guardia');
        guardiaSelect.innerHTML = '<option value="">Seleccionar Guardia</option>'; // Limpiar opciones previas
        guardiasLista.forEach(guardia => {
            const option = document.createElement('option');
            option.value = guardia;
            option.text = guardia;
            if (guardia === datosSemana.guardia) {
                option.selected = true;
            }
            guardiaSelect.appendChild(option);
        });
    }

    document.getElementById('guardiactas-edit-cancelar-button').addEventListener('click', function() {
        mostrarListaSemanasGuardiaActas();
    });

    document.getElementById('guardiactas-edit-guardar-button').addEventListener('click', async function() {
        const semana = document.getElementById('guardiactas-edit-semana').textContent;
        const actaILT = document.getElementById('guardiactas-edit-ilt').value;
        const actaEstaciones = document.getElementById('guardiactas-edit-estaciones').value;
        const guardia = document.getElementById('guardiactas-edit-guardia').value;

        await guardarDatosSemanaGuardiaActas(semana, actaILT, actaEstaciones, guardia); // Guardar datos en el archivo JSON
        mostrarMensajeGuardiaActas("Éxito", "Datos guardados correctamente");
        mostrarListaSemanasGuardiaActas(); // Volver a la lista de semanas tras guardar
    });

    function mostrarMensajeGuardiaActas(titulo, texto) {
        mensajeCardContainer.style.display = 'flex';
        document.getElementById('mensaje-titulo').textContent = titulo;
        document.getElementById('mensaje-texto').textContent = texto;
    }

    document.getElementById('cerrar-mensaje-button').addEventListener('click', function() {
        mensajeCardContainer.style.display = 'none';
    });
    
    async function cargarDatosGuardiaActas() {
        try {
            const cacheBuster = Math.random().toString(36).substring(7); // Cache buster aleatorio
            const urlConCacheBuster = `${DATA_URL}?cache=${cacheBuster}`; // URL con cache buster
            const response = await fetch(urlConCacheBuster, { // Usar URL con cache buster
                method: 'GET',
                headers: { // Añadir headers para DESACTIVAR CACHÉ (¡NUEVO!)
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonDataCompleto = await response.json();
            const jsonData = jsonDataCompleto.record;
            return jsonData;
        } catch (error) {
            console.error("Error al cargar datos de Guardia Actas:", error);
            mensajeCardContainer.style.display = 'flex'; // Mostrar mensaje de error en tarjeta
            document.getElementById('mensaje-titulo').textContent = "Error al cargar datos";
            document.getElementById('mensaje-texto').textContent = "No se pudieron cargar los datos de Guardia Actas. Inténtalo de nuevo más tarde.";
            return { semanas: [] }; // Devolver datos vacíos para evitar errores
        }
    }

    async function guardarDatosSemanaGuardiaActas(semana, actaILT, actaEstaciones, guardia) {
        try {
            // --- LOGGING AÑADIDO PARA VER DATOS A GUARDAR ---
            const jsonData = await cargarDatosGuardiaActas();
            const semanaIndex = jsonData.semanas.findIndex(s => s.semana === parseInt(semana));
            if (semanaIndex !== -1) {
                jsonData.semanas[semanaIndex] = {
                    semana: parseInt(semana),
                    fechaInicioFin: obtenerRangoFechasSemana(semana, new Date().getFullYear()), // Mantener fecha original
                    actaILT: actaILT,
                    actaEstaciones: actaEstaciones,
                    guardia: guardia
                };
            } else { // Si la semana no existe, la añade (opcional, decide si quieres añadir nuevas semanas o solo editar las existentes)
                jsonData.semanas.push({
                    semana: parseInt(semana),
                    fechaInicioFin: obtenerRangoFechasSemana(semana, new Date().getFullYear()),
                    actaILT: actaILT,
                    actaEstaciones: actaEstaciones,
                    guardia: guardia
                });
            }

            console.log("Datos JSON que se intentan GUARDAR:", jsonData); // <-- LOGGING AÑADIDO

            const response = await fetch(DATA_URL, { // Enviar los datos actualizados de vuelta al archivo JSON
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error al guardar datos de Guardia Actas:", error); // Mantenemos este mensaje general
            console.error("Error DETALLADO al guardar:", error); // <-- **AÑADIMOS ESTE console.error PARA VER EL ERROR COMPLETO**
            mostrarMensajeGuardiaActas("Error al guardar", "No se pudieron guardar los datos. Inténtalo de nuevo más tarde.");
        }
    }

    function obtenerNumeroSemana(fecha) {
        const date = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
        const weekNo = Math.ceil(( ( (date - yearStart) / 86400000) + 1)/7);
        return weekNo;
    }

    function obtenerRangoFechasSemana(semana, year) {
        const primerDiaAnio = new Date(year, 0, 1);
        let primerLunesAnio = new Date(primerDiaAnio.getTime());
        if (primerDiaAnio.getDay() !== 1) {
            primerLunesAnio.setDate(primerDiaAnio.getDate() + (8 - primerDiaAnio.getDay()) % 7);
        }
        const primerDiaSemana = new Date(primerLunesAnio.getFullYear(), primerLunesAnio.getMonth(), primerLunesAnio.getDate() + (semana - 1) * 7);
        const ultimoDiaSemana = new Date(primerDiaSemana.getFullYear(), primerDiaSemana.getMonth(), primerDiaSemana.getDate() + 6);

        const formatoFecha = { day: 'numeric', month: 'long' };
        const inicioSemanaFormateado = primerDiaSemana.toLocaleDateString('es-ES', formatoFecha);
        const finSemanaFormateado = ultimoDiaSemana.toLocaleDateString('es-ES', formatoFecha);

        return `${inicioSemanaFormateado} - ${finSemanaFormateado}`;
    }

});

///// FIN ICONO GUARDIA ACTAS /////


    ///// *** INICIO: FUNCIONALIDAD BOTÓN EMPLAZAMIENTOS - LOCALIZADOR *** /////

document.addEventListener('DOMContentLoaded', function() {
    const emplazamientosButtonPlus = document.querySelector('.plus-option-button[aria-label="EMPLAZAMIENTOS"]');
    const emplazamientosCardContainer = document.getElementById('emplazamientos-card-container');
    const cerrarEmplazamientosCardButton = document.getElementById('cerrar-emplazamientos-card');

    if (emplazamientosButtonPlus) {
        emplazamientosButtonPlus.addEventListener('click', function() {
            emplazamientosCardContainer.style.display = 'flex';
            cargarYGenerarOpcionesEmplazamientos(); // Cargar datos y generar opciones de selects al abrir la tarjeta
        });
    } else {
        console.error('No se encontró el botón EMPLAZAMIENTOS');
    }

    if (cerrarEmplazamientosCardButton) {
        cerrarEmplazamientosCardButton.addEventListener('click', function() {
            emplazamientosCardContainer.style.display = 'none';
        });
    } else {
        console.error('No se encontró el botón de cerrar de la tarjeta EMPLAZAMIENTOS');
    }

    const buscarEmplazamientosBtn = document.getElementById('emplazamiento-buscar-btn');
    if (buscarEmplazamientosBtn) {
        buscarEmplazamientosBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Evitar la recarga de la página al hacer clic en "Buscar"
            filtrarYMostrarResultadosEmplazamientos(); // Llamar a la función para filtrar y mostrar resultados
        });
    } else {
        console.error('No se encontró el botón BUSCAR EMPLAZAMIENTOS');
    }

    // ----- INICIO FUNCIONALIDAD CHECKBOX "MiPK" EN TARJETA EMPLAZAMIENTOS -----

    const checkMiPKEmplazamientos = document.getElementById('emplazamiento-check-mipk');
    const lineaSelectEmplazamientos = document.getElementById('emplazamiento-linea-select');
    const pkInputEmplazamientos = document.getElementById('emplazamiento-pk-input');

    if (checkMiPKEmplazamientos) { // Verificar que el checkbox existe en el DOM
        checkMiPKEmplazamientos.addEventListener('change', function() {
            if (this.checked) { // Si el checkbox está activado
                if (window.pkMasCercano && window.pkMasCercano.linea && window.pkMasCercano.pk) {
                    lineaSelectEmplazamientos.value = formatearLineaEmplazamientos(window.pkMasCercano.linea); // Usar función formatearLineaEmplazamientos
                    pkInputEmplazamientos.value = formatearPKMiles(window.pkMasCercano.pk); // Usar función formatearPKMiles
                } else {
                    alert("Ubicación PK no disponible. Asegúrate de que la aplicación tiene acceso a tu ubicación y ha calculado el PK.");
                    checkMiPKEmplazamientos.checked = false; // Desmarcar el checkbox si no hay PK
                    // Opcionalmente, podrías indicar "No disponible" en el label del checkbox en lugar de alert:
                    // checkMiPKEmplazamientos.nextElementSibling.textContent = "MiPK (No disponible)";
                }
            } else {
                // Opcionalmente, si quieres hacer algo al desmarcar el checkbox (por ahora no se requiere nada)
                // Por ejemplo, podrías limpiar los campos:
                // lineaSelectEmplazamientos.value = "";
                // pkInputEmplazamientos.value = "";
            }
        });
    } else {
        console.error("No se encontró el checkbox 'MiPK' en la tarjeta Emplazamientos.");
    }

    // Función auxiliar para formatear PK a "miles" (XXX)
    function formatearPKMiles(pk) {
        const pkStr = pk.toString();
        if (pkStr.includes('+')) {
            return pkStr.split('+')[0]; // Devuelve solo la parte antes del '+' (los "miles")
        } else if (pkStr.length >= 3) {
            return pkStr.slice(0, 3); // Si no tiene '+', devuelve los primeros 3 caracteres si tiene al menos 3
        } else {
            return pkStr; // Si tiene menos de 3 caracteres, devuelve tal cual
        }
    }

        // Función auxiliar para formatear la línea a 3 dígitos (ej. "40" -> "040")
    function formatearLineaEmplazamientos(linea) {
        const lineaStr = String(linea); // Convertir a string por si acaso es un número
        return lineaStr.padStart(3, '0'); // Rellenar con ceros a la izquierda hasta 3 dígitos
    }

    // ----- FIN FUNCIONALIDAD CHECKBOX "MiPK" EN TARJETA EMPLAZAMIENTOS -----
});

let emplazamientosData = []; // Variable global para almacenar los datos de emplazamientos
let columnaOrdenActual = null; // Variable global para rastrear la columna de ordenación actual
let ordenActual = 'asc';       // Variable global para rastrear el orden actual (ascendente/descendente)


async function cargarDatosEmplazamientos() {
    if (emplazamientosData.length > 0) {
        return emplazamientosData; // Si ya están cargados, devolver los datos en caché
    }
    try {
        const response = await fetch("./doc/emplazamientos/emplazamientos.json"); // Ruta al archivo emplazamientos.json
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        emplazamientosData = await response.json(); // Cargar y parsear JSON
        return emplazamientosData;
    } catch (error) {
        console.error("Error al cargar datos de emplazamientos:", error);
        alert("Error al cargar los datos de emplazamientos. Por favor, intenta de nuevo más tarde.");
        return []; // Devolver un array vacío en caso de error
    }
}

async function cargarYGenerarOpcionesEmplazamientos() {
    const data = await cargarDatosEmplazamientos();
    if (!data || data.length === 0) {
        return; // Si no hay datos, salir de la función
    }

    // Generar opciones para el select de Línea (MODIFICADO para mostrar solo el número)
    const lineasUnicas = [...new Set(data.map(item => {
        const tipoVia = item["Tipo Vía"];
        const match = tipoVia.match(/^(\d{2,3})\s*-/); // Busca un número de 2 o 3 dígitos al inicio seguido de " - "
        return match ? match[1] : null; // Devuelve el número capturado o null si no hay coincidencia
    }))]
        .filter(linea => linea && ['024', '040', '042', '046', '048'].includes(linea)) // Filtrar líneas válidas
        .sort();

    const lineaSelect = document.getElementById('emplazamiento-linea-select');
    lineaSelect.innerHTML = '<option value="">Línea</option>'; // Opción por defecto
    lineasUnicas.forEach(linea => {
        const option = document.createElement('option');
        option.value = linea;
        option.text = linea; // MODIFICADO: Mostrar solo el número de línea como texto
        lineaSelect.appendChild(option);
    });

    // Generar opciones para el select de Tipo de Emplazamiento (sin cambios)
    const tiposUnicos = [...new Set(data.map(item => item["Tipo de Emplazamiento"]))].sort();
    const tipoSelect = document.getElementById('emplazamiento-tipo-select');
    tipoSelect.innerHTML = '<option value="">Tipo Emplazamiento</option>'; // Opción por defecto
    tiposUnicos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.text = tipo;
        tipoSelect.appendChild(option);
    });

    // Generar opciones para el select de Base (NUEVO para el filtro Base)
    const basesUnicas = [
        "BM VILLARRUBIA",
        "BM GABALDON",
        "BM REQUENA",
        "BM MONFORTE"
    ];
    const baseSelect = document.getElementById('emplazamiento-base-select');
    baseSelect.innerHTML = '<option value="">Base</option>'; // Opción por defecto
    basesUnicas.forEach(base => {
        const option = document.createElement('option');
        option.value = base;
        option.text = base;
        baseSelect.appendChild(option);
    });
}

// Función para formatear PK a número de 6 dígitos para comparación (NUEVA para filtro Base)
function formatPKToNumberForComparison(pkString) {
    let pkNumber = pkToNumber(pkString); // Reutilizamos tu función pkToNumber existente
    let pkStringNumber = String(pkNumber);
    return pkStringNumber.padStart(6, '0'); // Rellenar con ceros a la izquierda hasta 6 dígitos
}


async function filtrarYMostrarResultadosEmplazamientos() {
    const data = await cargarDatosEmplazamientos();
    if (!data || data.length === 0) {
        return;
    }

    const nombreBusqueda = document.getElementById('emplazamiento-nombre-input').value.toLowerCase().trim();
    const lineaSeleccionada = document.getElementById('emplazamiento-linea-select').value;
    const pkBusqueda = document.getElementById('emplazamiento-pk-input').value.toUpperCase().trim();
    const tipoSeleccionado = document.getElementById('emplazamiento-tipo-select').value;
    const baseSeleccionada = document.getElementById('emplazamiento-base-select').value; // Valor de Base Seleccionada

    // Definir los ambitos de cada Base (NUEVO para filtro Base)
    const baseAmbitos = {
        "BM VILLARRUBIA": {
            lineas: ["040", "024"], // Ahora abarca las líneas 040 y 024
            pk_rangos: [
                { linea: "040", pk_inicio: formatPKToNumberForComparison("0+000"), pk_fin: formatPKToNumberForComparison("199+176") }, // Rango para L40
                { linea: "024", pk_inicio: formatPKToNumberForComparison("0+000"), pk_fin: formatPKToNumberForComparison("199+176") }  // Rango para L24 (MISMO RANGO INICIALMENTE)
            ]
        },
        "BM GABALDON": {
            lineas: ["040", "042"], // Abarca dos líneas
            pk_rangos: [
                { linea: "040", pk_inicio: formatPKToNumberForComparison("199+177"), pk_fin: formatPKToNumberForComparison("286+287") }, // Rango para L40
                { linea: "042", pk_inicio: formatPKToNumberForComparison("247+026"), pk_fin: formatPKToNumberForComparison("364+285") }  // Rango para L42
            ]
        },
        "BM REQUENA": {
            linea: "040",
            pk_inicio: formatPKToNumberForComparison("286+288"), // PK 286+288 en formato numérico
            pk_fin: formatPKToNumberForComparison("397+213")   // PK 397+213 en formato numérico
        },
        "BM MONFORTE": {
            linea: "042",
            pk_inicio: formatPKToNumberForComparison("364+286"), // PK 364+286 en formato numérico
            pk_fin: formatPKToNumberForComparison("485+925")   // PK 485+925 en formato numérico
        }
    };


    const resultadosFiltrados = data.filter(item => {
        const nombreCoincide = item["Emplazamiento"].toLowerCase().includes(nombreBusqueda);
        const lineaCoincide = !lineaSeleccionada || item["Tipo Vía"].startsWith(lineaSeleccionada.padStart(3, '0'));
         const pkBusquedaMiles = pkBusqueda.substring(0, 3); // ✨ NUEVO: Obtener solo los 3 primeros dígitos del PK buscado
        const pkEmplazamientoFormateado = formatearPK(item["PK"]); // Formatear PK del emplazamiento
        const pkEmplazamientoMiles = pkEmplazamientoFormateado.split('+')[0]; // ✨ NUEVO: Obtener los "miles" del PK del emplazamiento

        const pkCoincide = !pkBusqueda || (pkEmplazamientoMiles && pkEmplazamientoMiles === pkBusquedaMiles); // ✨ MODIFICADO: Coincidencia por "miles"
        const tipoCoincide = !tipoSeleccionado || item["Tipo de Emplazamiento"] === tipoSeleccionado;

        let baseCoincide = true; // Inicialmente no filtra por base

        if (baseSeleccionada && baseSeleccionada !== "") {
            baseCoincide = false; // Si se selecciona base, empezamos asumiendo que NO coincide

            const emplazamientoLineaTipoVia = item["Tipo Vía"];
            const emplazamientoPKString = item["PK"];
            const emplazamientoLinea = emplazamientoLineaTipoVia.match(/^(\d{2,3})\s*-/)?.[1]; //Extraer línea del tipo de vía


            if (baseSeleccionada === "BM VILLARRUBIA" || baseSeleccionada === "BM GABALDON") {
                // Lógica para BM VILLARRUBIA y BM GABALDON (con pk_rangos)
                const ambitoBaseMultiLinea = baseAmbitos[baseSeleccionada]; // Usamos ambitoBaseMultiLinea para claridad
                ambitoBaseMultiLinea.pk_rangos.forEach(rango => {
                    if (emplazamientoLinea === rango.linea) {
                        const emplazamientoPKNumber = formatPKToNumberForComparison(emplazamientoPKString);
                        if (emplazamientoPKNumber >= rango.pk_inicio && emplazamientoPKNumber <= rango.pk_fin) {
                            baseCoincide = true;
                        }
                    }
                    if (baseCoincide) return; // Si ya coincide, salir del forEach
                });


            } else if (baseSeleccionada === "BM REQUENA" || baseSeleccionada === "BM MONFORTE") {
                // Lógica para BM REQUENA y BM MONFORTE (sin pk_rangos, acceso directo)
                const ambitoBaseUnicaLinea = baseAmbitos[baseSeleccionada]; // Reutilizamos ambitoBaseUnicaLinea (ahora correcto para estas bases)
                if (emplazamientoLinea === ambitoBaseUnicaLinea.linea) { //Comprobar si la línea coincide
                    const emplazamientoPKNumber = formatPKToNumberForComparison(emplazamientoPKString);
                    if (emplazamientoPKNumber >= ambitoBaseUnicaLinea.pk_inicio && emplazamientoPKNumber <= ambitoBaseUnicaLinea.pk_fin) {
                        baseCoincide = true; // Coincide con el ámbito de la base
                    }
                }
            }
        }


        return nombreCoincide && lineaCoincide && pkCoincide && tipoCoincide && baseCoincide;
    });

    mostrarTablaResultadosEmplazamientos(resultadosFiltrados, columnaOrdenActual, ordenActual);
}


function mostrarTablaResultadosEmplazamientos(resultados, columnaOrdenacion = null, orden = 'asc') {
    const tbodyResultados = document.querySelector('#emplazamientos-tabla-resultados tbody');
    tbodyResultados.innerHTML = ''; // Limpiar resultados anteriores

    if (resultados.length === 0) {
        tbodyResultados.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:10px;">No se encontraron emplazamientos.</td></tr>`;
        return;
    }

    // *** INICIO: LÓGICA DE ORDENACIÓN (si se especifica columnaOrdenacion) ***
    if (columnaOrdenacion) {
        resultados.sort((a, b) => {
            let valorA, valorB;

            if (columnaOrdenacion === 'linea') {
                valorA = a["Tipo Vía"].match(/^(\d{2,3})\s*-/)?.[1] || '-';
                valorB = b["Tipo Vía"].match(/^(\d{2,3})\s*-/)?.[1] || '-';
            } else if (columnaOrdenacion === 'pk') {
                valorA = pkToNumber(a["PK"]);
                valorB = pkToNumber(b["PK"]);
            } else if (columnaOrdenacion === 'tipo') {
                valorA = a["Tipo de Emplazamiento"];
                valorB = b["Tipo de Emplazamiento"];
            } else if (columnaOrdenacion === 'nombre') {
                valorA = a["Emplazamiento"];
                valorB = b["Emplazamiento"];
            } else if (columnaOrdenacion === 'via') {
                valorA = a["Vía/s"];
                valorB = b["Vía/s"];
            } else {
                return 0; // Columna de ordenación no válida, no ordenar
            }

            if (typeof valorA === 'number' && typeof valorB === 'number') {
                return orden === 'asc' ? valorA - valorB : valorB - valorA; // Orden numérico
            } else {
                return orden === 'asc' ? String(valorA).localeCompare(String(valorB)) : String(valorB).localeCompare(String(valorA)); // Orden alfabético
            }
        });
    }
    // *** FIN: LÓGICA DE ORDENACIÓN ***


    resultados.forEach(emplazamiento => {
        const fila = tbodyResultados.insertRow();

        // *** INICIO: Lógica de extracción de línea REUTILIZANDO la expresión regular (sin cambios) ***
        let linea = '-'; // Valor por defecto si no se encuentra la línea
        const tipoVia = emplazamiento["Tipo Vía"];
        const match = tipoVia.match(/^(\d{2,3})\s*-/);
        if (match && ['024', '040', '042', '046', '048'].includes(match[1])) {
        linea = parseInt(match[1], 10).toString(); // ✨ MODIFICADO: Convertir a número y luego a string para quitar "0" inicial
        }
        // *** FIN: Lógica de extracción de línea REUTILIZANDO la expresión regular (sin cambios) ***

        const cellLinea = fila.insertCell();
        cellLinea.textContent = linea; // MODIFICADO: Mostrar solo el número de línea en la celda

        const cellPK = fila.insertCell();
        cellPK.textContent = formatearPK(emplazamiento["PK"]); // Formatear PK

        const cellTipo = fila.insertCell();
        cellTipo.textContent = emplazamiento["Tipo de Emplazamiento"];

        const cellNombre = fila.insertCell();
        cellNombre.textContent = emplazamiento["Emplazamiento"];

        const cellVia = fila.insertCell();
        // *** INICIO: NUEVA LÓGICA PARA MOSTRAR "VÍA" SEGÚN REQUERIMIENTOS (sin cambios) ***
        const viasValor = emplazamiento["Vía/s"];
        let textoVia = "Todas"; // Valor por defecto para otros casos

        if (viasValor === "Ninguna") {
            textoVia = "-";
        } else if (viasValor === "1") {
            textoVia = "1";
        } else if (viasValor === "2") {
            textoVia = "2";
        }
        cellVia.textContent = textoVia;
        // *** FIN: NUEVA LÓGICA PARA MOSTRAR "VÍA" SEGÚN REQUERIMIENTOS (sin cambios) ***
    });
}

// *** INICIO: EVENT LISTENER PARA ORDENACIÓN DE COLUMNAS ***
document.getElementById('emplazamientos-tabla-resultados').addEventListener('click', function(event) {
    const elementoClicado = event.target;

    if (elementoClicado.tagName === 'TH') {
        const columnaClicada = elementoClicado.dataset.columna;

        if (columnaClicada) {
            if (columnaOrdenActual === columnaClicada) {
                // Si se hace clic en la misma columna, cambiar el orden
                ordenActual = ordenActual === 'asc' ? 'desc' : 'asc';
            } else {
                // Si se hace clic en una columna diferente, establecerla como columna de ordenación y usar orden ascendente
                columnaOrdenActual = columnaClicada;
                ordenActual = 'asc';
            }

            filtrarYMostrarResultadosEmplazamientos(); // Volver a filtrar y mostrar resultados (ahora ordenados)
        }
    }
});
// *** FIN: EVENT LISTENER PARA ORDENACIÓN DE COLUMNAS ***

///// *** FIN: FUNCIONALIDAD BOTÓN EMPLAZAMIENTOS - LOCALIZADOR *** /////






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

// Obtener referencias a los elementos
const botonOperadores = document.getElementById('boton-operadores');
const operadoresCardContainer = document.getElementById('operadores-card-container');
const cerrarOperadoresCardButton = document.getElementById('cerrar-operadores-card');

// Event listener para el botón "Operadores"
botonOperadores.addEventListener('click', () => {
    operadoresCardContainer.style.display = 'flex'; // Mostrar la tarjeta
});

// Event listener para el botón de cerrar
cerrarOperadoresCardButton.addEventListener('click', () => {
    operadoresCardContainer.style.display = 'none'; // Ocultar la tarjeta
});

// Evento para el botón WikiRail
document.getElementById('boton-wikirail').addEventListener('click', function() {
    window.open('https://ivandlpn.github.io/Aplicaciones/WikiRail/', '_blank');
    document.getElementById('plus-card-container').style.display = 'none';
});
