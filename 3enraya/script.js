// --- Referencias a Elementos del DOM ---
const botonComenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');
const pantallaSeleccion = document.getElementById('pantalla-seleccion-fichas'); // Nueva pantalla
const tituloSeleccionElem = document.getElementById('titulo-seleccion'); // Título selección
const instruccionSeleccionElem = document.getElementById('instruccion-seleccion'); // Instrucción selección
const contenedorFichasElem = document.getElementById('contenedor-fichas-disponibles'); // Contenedor fichas
const fichasElegidasContenedor = document.getElementById('fichas-elegidas'); // Div para mostrar elegidas
const fichaElegidaHugoImg = document.getElementById('ficha-elegida-hugo'); // Img elegida Hugo
const fichaElegidaSaulImg = document.getElementById('ficha-elegida-saul'); // Img elegida Saúl

const juegoContenedor = document.getElementById('juego-contenedor');
const infoTurno = document.getElementById('info-turno');
const celdas = document.querySelectorAll('.celda');
const botonReiniciar = document.getElementById('boton-reiniciar');
const puntajeHugoElem = document.getElementById('puntaje-hugo');
const puntajeSaulElem = document.getElementById('puntaje-saul');
const fotoHugoElem = document.getElementById('foto-hugo');
const fotoSaulElem = document.getElementById('foto-saul');

// --- Constantes y Variables del Juego ---
const JUGADORES = ['Hugo', 'Saúl'];
// IMPORTANTE: Define aquí los nombres EXACTOS de tus archivos de fichas
const FICHAS_DISPONIBLES = ['X.png', 'O.png', 'P_logo.png', 'escudo_torremolinos.png'];
const RUTA_FICHAS = 'img/fichas/'; // Ruta a la carpeta de fichas

let jugadorActual; // Quién tiene el turno en el juego
let jugadorSeleccionando; // Quién está seleccionando ficha
let fichaHugo = null; // Filename de la ficha elegida por Hugo
let fichaSaul = null; // Filename de la ficha elegida por Saúl
let juegoActivo = false;
// CAMBIO IMPORTANTE: El estado ahora guarda el *nombre* del jugador ('Hugo' o 'Saúl') o null si está vacía
let estadoTablero = [null, null, null, null, null, null, null, null, null];
let puntajeHugo = 0;
let puntajeSaul = 0;

// --- Funciones ---

/** Limpia y puebla el contenedor de selección de fichas */
function mostrarFichasParaSeleccion() {
    contenedorFichasElem.innerHTML = ''; // Limpiar por si acaso
    FICHAS_DISPONIBLES.forEach(nombreFicha => {
        const imgFicha = document.createElement('img');
        imgFicha.src = RUTA_FICHAS + nombreFicha;
        imgFicha.alt = `Ficha ${nombreFicha.split('.')[0]}`; // Alt text básico
        imgFicha.classList.add('ficha-seleccionable');
        imgFicha.dataset.filename = nombreFicha; // Guardamos el nombre del archivo

        // Deshabilitar visualmente si ya fue seleccionada por el otro jugador
        const fichaYaElegida = (jugadorSeleccionando === JUGADORES[1] && nombreFicha === fichaHugo) ||
                                (jugadorSeleccionando === JUGADORES[0] && nombreFicha === fichaSaul); // En caso de que se reinicie la selección
        if (fichaYaElegida) {
            imgFicha.classList.add('seleccionada');
        } else {
             // Añadir listener SOLO si no está seleccionada
            imgFicha.addEventListener('click', manejarSeleccionFicha);
        }

        contenedorFichasElem.appendChild(imgFicha);
    });
}

/** Maneja el clic sobre una ficha durante la selección */
function manejarSeleccionFicha(evento) {
    const fichaClickeada = evento.target;
    const nombreFichaSeleccionada = fichaClickeada.dataset.filename;

    // Asignar al jugador correspondiente
    if (jugadorSeleccionando === JUGADORES[0]) { // Es Hugo
        fichaHugo = nombreFichaSeleccionada;
        console.log(`Hugo elige: ${fichaHugo}`);
        fichaElegidaHugoImg.src = RUTA_FICHAS + fichaHugo; // Mostrar miniatura elegida
        // Pasar al siguiente jugador
        jugadorSeleccionando = JUGADORES[1];
        instruccionSeleccionElem.textContent = `Turno de ${jugadorSeleccionando}`;
        // Actualizar visualización de fichas (deshabilitar la elegida)
        mostrarFichasParaSeleccion();
        fichasElegidasContenedor.classList.remove('oculto'); // Mostrar contenedor de elegidas

    } else { // Es Saúl
        fichaSaul = nombreFichaSeleccionada;
        console.log(`Saúl elige: ${fichaSaul}`);
        fichaElegidaSaulImg.src = RUTA_FICHAS + fichaSaul; // Mostrar miniatura elegida
        // Ambos han elegido, iniciar juego
        console.log("Ambos jugadores han elegido. Iniciando juego...");
        pantallaSeleccion.classList.add('oculto');
        iniciarJuego(); // Ahora sí, al juego real
    }
}

/** Inicia el proceso de selección de fichas */
function iniciarProcesoSeleccion() {
    fichaHugo = null; // Resetear fichas elegidas
    fichaSaul = null;
    fichasElegidasContenedor.classList.add('oculto'); // Ocultar miniaturas
    fichaElegidaHugoImg.src = "";
    fichaElegidaSaulImg.src = "";
    jugadorSeleccionando = JUGADORES[0]; // Empieza Hugo a elegir

    tituloSeleccionElem.textContent = `Hola Hugo y Saúl`; // Saludo
    instruccionSeleccionElem.textContent = `Elige tu ficha, ${jugadorSeleccionando}`;
    mostrarFichasParaSeleccion(); // Mostrar las fichas disponibles

    // Ocultar pantalla inicial y mostrar pantalla de selección
    pantallaInicial.classList.add('oculto');
    pantallaSeleccion.classList.remove('oculto');
    juegoContenedor.classList.add('oculto'); // Asegurarse que el juego está oculto
}


/** Actualiza la visualización del marcador (puntajes). */
function actualizarMarcadorDisplay() {
    puntajeHugoElem.textContent = puntajeHugo;
    puntajeSaulElem.textContent = puntajeSaul;
}

/** Resalta la foto del jugador activo y quita el resaltado del otro. */
function actualizarResaltadoFoto() {
    if (!juegoActivo) { // Si el juego no está activo, quitar ambos resaltados
         fotoHugoElem.classList.remove('activa');
         fotoSaulElem.classList.remove('activa');
         return;
    }
    if (jugadorActual === JUGADORES[0]) {
        fotoHugoElem.classList.add('activa');
        fotoSaulElem.classList.remove('activa');
    } else {
        fotoSaulElem.classList.add('activa');
        fotoHugoElem.classList.remove('activa');
    }
}

/** Inicia una nueva partida del juego (tablero) */
function iniciarJuego() {
    // Asegurarse que la pantalla de selección está oculta y el juego visible
    pantallaSeleccion.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');

    // Resetear estado del tablero (ahora con null)
    estadoTablero = [null, null, null, null, null, null, null, null, null];
    juegoActivo = true;

    // Elegir jugador inicial aleatoriamente para el *juego*
    const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
    jugadorActual = JUGADORES[indiceAleatorio];

    botonReiniciar.classList.add('oculto');
    actualizarMarcadorDisplay();
    actualizarResaltadoFoto(); // Resalta foto del primer jugador

    // Mensaje de turno usando nombre (sin la marca X/O)
    infoTurno.textContent = `¡Empieza ${jugadorActual}! Te toca.`;

    celdas.forEach(celda => {
        celda.innerHTML = ''; // Limpiar contenido (imágenes anteriores)
        celda.classList.remove('ganadora');
        celda.removeEventListener('click', manejarClickCelda);
        celda.addEventListener('click', manejarClickCelda, { once: true });
    });

    console.log(`Juego iniciado. Empieza: ${jugadorActual}. Fichas: Hugo=${fichaHugo}, Saúl=${fichaSaul}`);
}

/** Maneja el evento de clic en una celda del tablero */
function manejarClickCelda(evento) {
    if (!juegoActivo) return;

    let celdaClickeada = evento.target;
    // Si se hizo clic en la imagen dentro de la celda, subir al div.celda
    if (celdaClickeada.tagName === 'IMG' && celdaClickeada.parentElement.classList.contains('celda')) {
        celdaClickeada = celdaClickeada.parentElement;
    }
    // Asegurarse de que es una celda válida y no está ocupada
    if (!celdaClickeada.classList.contains('celda') || !celdaClickeada.hasAttribute('data-index')) return;
    const indiceCelda = parseInt(celdaClickeada.getAttribute('data-index'));
    if (estadoTablero[indiceCelda] !== null) return; // Ya está ocupada si no es null

    // 1. Actualizar estado interno con el NOMBRE del jugador
    estadoTablero[indiceCelda] = jugadorActual;

    // 2. Determinar qué ficha (imagen) colocar
    const fichaAColocar = jugadorActual === JUGADORES[0] ? fichaHugo : fichaSaul;

    // 3. Colocar la FICHA (imagen) visualmente CON ANIMACIÓN
    celdaClickeada.innerHTML = `<img src="${RUTA_FICHAS}${fichaAColocar}" alt="Ficha ${jugadorActual}" class="ficha-en-tablero">`; // Clase activa animación

    console.log(`Celda ${indiceCelda} clickeada por ${jugadorActual}. Ficha: ${fichaAColocar}`);

    // 4. Comprobar victoria (ahora busca el nombre del jugador)
    if (comprobarVictoria(jugadorActual)) {
        finalizarJuego(false);
        return;
    }
    // 5. Comprobar empate (ahora busca que no haya null)
    if (comprobarEmpate()) {
        finalizarJuego(true);
        return;
    }
    // 6. Cambiar turno
    cambiarTurno();
}

/** Comprueba si el jugador dado ha ganado */
function comprobarVictoria(jugador) { // Recibe el nombre del jugador
    for (const combinacion of COMBINACIONES_GANADORAS) {
        const [a, b, c] = combinacion;
        // Comprueba si las 3 celdas tienen el nombre del jugador actual
        if (estadoTablero[a] === jugador && estadoTablero[b] === jugador && estadoTablero[c] === jugador) {
            console.log(`Victoria detectada para ${jugador} en combinación: ${a},${b},${c}`);
            resaltarCeldasGanadoras(combinacion);
            return true;
        }
    }
    return false;
}

/** Comprueba si hay empate (ninguna celda es null) */
function comprobarEmpate() {
    const empate = estadoTablero.every(celda => celda !== null);
    if (empate) { console.log("Empate detectado."); }
    return empate;
}

/** Cambia el turno al otro jugador, actualiza mensaje y resalta foto */
function cambiarTurno() {
    jugadorActual = jugadorActual === JUGADORES[0] ? JUGADORES[1] : JUGADORES[0];
    infoTurno.textContent = `Turno de: ${jugadorActual}`; // Mensaje sin marca
    actualizarResaltadoFoto(); // Actualiza foto activa
    console.log(`Turno cambiado a: ${jugadorActual}`);
}

/** Finaliza la partida actual */
function finalizarJuego(esEmpate) {
    juegoActivo = false;
    celdas.forEach(celda => {
        celda.removeEventListener('click', manejarClickCelda);
    });
    actualizarResaltadoFoto(); // Quita resaltado de fotos

    if (esEmpate) {
        infoTurno.textContent = "¡Vaya! Ha sido un empate.";
        console.log("Juego finalizado: Empate.");
    } else {
        infoTurno.textContent = `¡Felicidades ${jugadorActual}! ¡Has ganado! 🎉`;
        console.log(`Juego finalizado: Ganador ${jugadorActual}.`);
        if (jugadorActual === JUGADORES[0]) { puntajeHugo++; } else { puntajeSaul++; }
        actualizarMarcadorDisplay();
        console.log(`Marcador actualizado: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);
    }
    botonReiniciar.classList.remove('oculto');
}

/** Añade clase ganadora a las celdas */
function resaltarCeldasGanadoras(combinacion) {
    combinacion.forEach(indice => {
        if(celdas[indice]) { celdas[indice].classList.add('ganadora'); }
        else { console.error("Índice de celda fuera de rango:", indice); }
    });
}

// --- Event Listeners Iniciales ---
// El botón comenzar ahora inicia el PROCESO DE SELECCIÓN
botonComenzar.addEventListener('click', iniciarProcesoSeleccion);
// El botón reiniciar ahora también vuelve al PROCESO DE SELECCIÓN
botonReiniciar.addEventListener('click', iniciarProcesoSeleccion);

// --- Fin del script ---
