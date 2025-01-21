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
    pkElement.innerHTML = `<span class="texto-buscando-pk">Buscando PK...</span>`;
 
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
            mostrarPKMasCercano(window.pkMasCercano);
            actualizarPosicionPK(window.pkMasCercano);
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
        .bindPopup('Mi Ubicación')
        //.openPopup();

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
    const pkFormateado = formatearPK(pk.pk); // Formatea el PK

    pkElement.innerHTML = `
        <div style="font-size: 1em; margin-bottom: 3px;">${pkFormateado}</div>
        <div style="font-size: 0.6em;"> ${pk.ladoVia}  (L${pk.linea})</div>
    `;
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
// Obtener referencias a los elementos del DOM
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





/////  FIN CAPA MI TRAMO /////---------------------------------------------------------------------------------------

/////  INICIO CAPA TRAZADO /////---------------------------------------------------------------------------------------


let marcadoresTrazado = [];
let ultimoPKPorLinea = {}; // Objeto para almacenar el último PK por línea

async function activarCapaTrazado() {

    try {
        const datosTrazado = await cargarArchivosJSON(rutasArchivos);
        const puntosPorLinea = agruparPuntosPorLinea(datosTrazado);
        for (const linea in puntosPorLinea) {
            const puntosDeLaLinea = puntosPorLinea[linea];
            dibujarPuntosCada20Metros(puntosDeLaLinea, linea);
        }
    } catch (error) {
        console.error("Error al cargar o procesar los datos de trazado:", error);
    }

    function agruparPuntosPorLinea(datos) {
        const puntosPorLinea = {};
        datos.forEach(punto => {
            if (!puntosPorLinea[punto.Linea]) {
                puntosPorLinea[punto.Linea] = [];
            }
            puntosPorLinea[punto.Linea].push(punto);
        });
        return puntosPorLinea;
    }


    function dibujarPuntosCada20Metros(puntos, linea) {
        let siguientePK = ultimoPKPorLinea[linea] || null; // Inicializar con el último PK de la línea o null
        const separacionPK = 500;

        for (const punto of puntos) {
            const pkActualNumerico = pkToNumber(punto.PK);
             console.log(`Línea: ${linea}, PK Actual: ${punto.PK}, Numérico: ${pkActualNumerico}, SiguientePK: ${siguientePK}, UltimoPKGlobal[linea]: ${ultimoPKPorLinea[linea]}`);

            if (siguientePK === null || pkActualNumerico >= siguientePK) {
                console.log(`   Dibujando punto en PK: ${punto.PK} (Línea: ${linea})`);
                const puntoLat = parseFloat(punto.Latitud);
                const puntoLng = parseFloat(punto.Longitud);

                if (!isNaN(puntoLat) && !isNaN(puntoLng)) {
                    const marcador = L.circleMarker([puntoLat, puntoLng], {
                        radius: 2,
                        fillColor: "blue",
                        color: "blue",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 1
                    }).addTo(mapa);
                    marcadoresTrazado.push(marcador);
                    ultimoPKPorLinea[linea] = pkActualNumerico; // Guardar el último PK de la línea
                     siguientePK = pkActualNumerico + separacionPK;
                } else {
                    console.error("Latitud o Longitud no válidas:", punto);
                }
            } else {
              //  console.log(`   No cumple la condición en PK: ${punto.PK} (Línea: ${linea})`);
            }
        }
    }


    function pkToNumber(pkString) {
        return parseInt(pkString, 10);
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
        const datosCargados = await Promise.all(todasPromesas);
        return datosCargados.flat();
    }
}

function desactivarCapaTrazado() {
    marcadoresTrazado.forEach(marcador => {
        mapa.removeLayer(marcador);
    });
    marcadoresTrazado = [];
     ultimoPKPorLinea = {}; // Limpiar los últimos PKs por línea al desactivar
}

checkTrazado.addEventListener('change', function () {
    if (this.checked) {
        activarCapaTrazado();
    } else {
        desactivarCapaTrazado();
    }
});

/////  FIN CAPA TRAZADO /////---------------------------------------------------------------------------------------



/////  INICIO CAPA TIEMPO /////---------------------------------------------------------------------------------------

checkTiempo.addEventListener('change', function() {
    if (this.checked) {
        activarCapaTiempo();
    } else {
        desactivarCapaTiempo();
    }
});

async function obtenerDatosTiempo(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKeyOpenWeatherMap}&units=metric&lang=es`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === 200) {
      return {
        temperatura: data.main.temp,
        sensacion: data.main.feels_like, // Sensación térmica
        viento: data.wind.speed, // Velocidad del viento
        descripcion: data.weather[0].description,
        icono: data.weather[0].icon,
      };
    } else {
      console.error(`Error al obtener datos de tiempo: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.error(`Error al obtener datos de tiempo:`, error);
    return null;
  }
}



function mostrarInfoTiempo(ciudad, lat, lon, datosTiempo) {
  if (datosTiempo) {
    const iconoUrl = `https://openweathermap.org/img/wn/${datosTiempo.icono}@2x.png`;

    // Función para capitalizar la primera letra
    function capitalizarPrimeraLetra(texto) {
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    }


    const descripcionCapitalizada = capitalizarPrimeraLetra(datosTiempo.descripcion);

    const popupContent = `
      <div style="text-align: center;">
        <h3 style="margin: 0;">${ciudad}</h3>
        <img src="${iconoUrl}" alt="${datosTiempo.descripcion}">
        <p style="margin: 5px 0;">🌡 Temperatura: ${datosTiempo.temperatura} °C</p>
        <p style="margin: 5px 0;">🥵 Sensación: ${datosTiempo.sensacion} °C</p>
        <p style="margin: 5px 0;">ℹ ${descripcionCapitalizada}</p> 
      </div>
    `;

   const marcador = L.marker([lat, lon], {
      icon: L.divIcon({
        className: 'icono-tiempo',
        html: `<img src="${iconoUrl}" alt="${datosTiempo.descripcion}">`,
        iconSize: [50, 50],
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
  const ciudades = [
  
    { nombre: "Villena", provincia: "Alicante", pais: "ES", lat: 38.6333, lon: -0.8667 },
    { nombre: "Almansa", provincia: "Albacete", pais: "ES", lat: 38.8706, lon: -1.0976 },
    { nombre: "Bonete", provincia: "Albacete", pais: "ES", lat: 38.9211, lon: -1.3480 },


    { nombre: "Estación AVE Alicante", ciudad: "Alicante", pais: "ES", lat: 38.3394, lon: -0.5015 }, // Estación de AVE de Alicante
    { nombre: "Estación AVE Villena", ciudad: "Villena", pais: "ES", lat: 38.6536, lon: -0.8872 }, // Estación de AVE de Villena
    { nombre: "Estación AVE Albacete", ciudad: "Albacete", pais: "ES", lat: 39.0045, lon: -1.8531 }, // Estación de AVE de Albacete
    { nombre: "Estación AVE Cuenca", ciudad: "Cuenca", pais: "ES", lat: 40.0269, lon: -2.0985 }, // Estación de AVE de Cuenca (Fernando Zóbel)
    { nombre: "Estación AVE Requena", ciudad: "Requena", pais: "ES", lat: 39.4558, lon: -1.0995 }, // Estación de AVE de Requena-Utiel
    { nombre: "Estación AVE Valencia", ciudad: "Valencia", pais: "ES", lat: 39.4598, lon: -0.3832 }, // Estación de AVE de Valencia (Joaquín Sorolla)
    { nombre: "Estación Madrid Chamartín", ciudad: "Madrid", pais: "ES", lat: 40.4722, lon: -3.6825 }, // Estación de Madrid Chamartín
   
    { nombre: "BM Villarrubia", ciudad: "Villarrubia", pais: "ES", lat: 39.9577, lon: -3.3513 },
    { nombre: "BM Requena", ciudad: "Requena", pais: "ES", lat: 39.5364, lon: -1.1565 },
    { nombre: "BM Gabaldón", ciudad: "Gabaldón", pais: "ES", lat: 39.6362, lon: -1.9438 },
    { nombre: "BM Monforte", provincia: "Alicante", pais: "ES", lat: 38.4069, lon: -0.6949 },
  ];

  for (const ciudad of ciudades) {
        try {
            const datosTiempo = await obtenerDatosTiempo(ciudad.lat, ciudad.lon);
            if (datosTiempo) {
                const marcador = mostrarInfoTiempo(ciudad.nombre, ciudad.lat, ciudad.lon, datosTiempo);
                if (marcador) {
                marcadoresTiempo.push(marcador);
               }
            }
        } catch (error) {
             console.error(
               `Error al obtener datos de tiempo para ${ciudad.nombre}:`,
              error
            );
        }
    }
}

function desactivarCapaTiempo() {
    marcadoresTiempo.forEach(marcador => {
        mapa.removeLayer(marcador);
    });
    marcadoresTiempo = [];
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
                            ${pkFormateado} (L${lineaElemento})
                        </div>
                    `);
                layerGroup.addLayer(marker);

            } else {
                console.warn(`No se encontraron coordenadas para el PK ${pkElemento} en la línea ${lineaElemento} (Tipo: ${elemento.TIPO})`);
            }
        });
        mapa.addLayer(layerGroup);

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


async function cargarPuertas() {
    try {
        console.log("Cargando datos de puertas...");
        const responses = await Promise.all([
            fetch("./doc/puertas/PL42.json"),
            fetch("./doc/puertas/PL46.json")
        ]);
        puertasData = (await Promise.all(responses.map(res => res.json()))).flat();
        console.log("Datos de puertas cargados:", puertasData);
    } catch (error) {
        console.error("Error al cargar los datos de puertas:", error);
        alert("Error al cargar los datos de las puertas.");
    }
}

 function mostrarPuertasCercanas() {
        console.log("Mostrando puertas cercanas...");
        if (!lat || !lon) {
            alert("No se ha obtenido la ubicación actual del usuario.");
            return;
        }

         const currentLocation = `${lat.toFixed(6)},${lon.toFixed(6)}`; // Use a string with fixed precision for comparison
            if (cachedPuertasCercanas && lastUserLocation === currentLocation) {
            console.log("Usando puertas cercanas cacheadas.");
            const html = generarHTMLPuertas(cachedPuertasCercanas);
            puertasInfoDiv.innerHTML = html;
            puertasContainer.style.display = "flex";
             agregarEventosVerMapa(cachedPuertasCercanas);
          }else{
            calcularPuertasCercanas(lat, lon)
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
                const pkMatch = puertaTexto.match(pkRegex);
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
                    <p style="margin: 0; font-size: 1.3em; font-weight: bold;">PK ${pk}</p>
                </div>
            `);

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
                    <p style="margin: 0; font-size: 1.3em; font-weight: bold;">PK ${formatearPK(puerta.PK)}</p>
                </div>
                `);
              bounds.push([puerta.Latitud, puerta.Longitud]);

        });
        if (lat && lon)
        {
          bounds.push([lat,lon])
        }
    mapa.fitBounds(bounds);
}


async function calcularPuertasCercanas(latUsuario, lonUsuario) {
    console.log("Calculando puertas cercanas...");
    const puertasPorVia = {};
    const pkUsuarioNumerico = pkToNumber(window.pkMasCercano.pk);
    console.log("PK del usuario (numérico):", pkUsuarioNumerico);

    puertasData.forEach(puerta => {
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
        html += `<p style="text-align: center; font-weight: bold; margin-bottom: 10px;">👤 Estás en el PK: ${pkActualFormateado}</p>`;
    } else {
        html += `<p style="text-align: center; font-style: italic; margin-bottom: 10px;">Calculando PK actual...</p>`;
    }

    let puertasArray = [];

    for (const via in puertasCercanas) {
        const tienePuertas = puertasCercanas[via].creciente || puertasCercanas[via].decreciente;
        if (tienePuertas) {
            console.log(`Agregando título de vía: ${via}`);
            html += `<h3>Vía ${via}</h3>`;
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
