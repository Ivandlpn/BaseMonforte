// --- Referencias a Elementos del DOM ---
const botonComenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');
const pantallaSeleccion = document.getElementById('pantalla-seleccion-fichas');
const tituloSeleccionElem = document.getElementById('titulo-seleccion');
const instruccionSeleccionElem = document.getElementById('instruccion-seleccion');
const contenedorFichasElem = document.getElementById('contenedor-fichas-disponibles');
const fichasElegidasContenedor = document.getElementById('fichas-elegidas');
const fichaElegidaHugoImg = document.getElementById('ficha-elegida-hugo');
const fichaElegidaSaulImg = document.getElementById('ficha-elegida-saul');
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
const FICHAS_DISPONIBLES = ['X.png', 'O.png', 'P_logo.png', 'escudo_torremolinos.png'];
const RUTA_FICHAS = 'img/fichas/';

let jugadorActual; // Quién tiene el turno en el juego ('Hugo' o 'Saúl')
let jugadorSeleccionando; // Quién está seleccionando ficha
let fichaHugo = null;
let fichaSaul = null;
let juegoActivo = false;
let estadoTablero = [null, null, null, null, null, null, null, null, null];
let puntajeHugo = 0;
let puntajeSaul = 0;
let procesandoClick = false; // Flag para evitar clics múltiples rápidos

// --- Funciones ---

/** Limpia y puebla el contenedor de selección de fichas */
function mostrarFichasParaSeleccion() {
    contenedorFichasElem.innerHTML = '';
    FICHAS_DISPONIBLES.forEach(nombreFicha => {
        const imgFicha = document.createElement('img');
        imgFicha.src = RUTA_FICHAS + nombreFicha;
        imgFicha.alt = `Ficha ${nombreFicha.split('.')[0]}`;
        imgFicha.classList.add('ficha-seleccionable');
        imgFicha.dataset.filename = nombreFicha;

        const fichaYaElegidaPorOtro = (jugadorSeleccionando === JUGADORES[1] && nombreFicha === fichaHugo);
        if (fichaYaElegidaPorOtro) {
            imgFicha.classList.add('seleccionada');
        } else {
            imgFicha.addEventListener('click', manejarSeleccionFicha);
        }
        contenedorFichasElem.appendChild(imgFicha);
    });
}

/** Maneja el clic sobre una ficha durante la selección */
function manejarSeleccionFicha(evento) {
    const fichaClickeada = evento.target;
    // Prevenir si ya está seleccionada (doble seguridad)
    if (fichaClickeada.classList.contains('seleccionada')) return;

    const nombreFichaSeleccionada = fichaClickeada.dataset.filename;

    if (jugadorSeleccionando === JUGADORES[0]) {
        fichaHugo = nombreFichaSeleccionada;
        console.log(`Hugo elige: ${fichaHugo}`);
        fichaElegidaHugoImg.src = RUTA_FICHAS + fichaHugo;
        jugadorSeleccionando = JUGADORES[1]; // Cambia al siguiente jugador
        instruccionSeleccionElem.textContent = `Elige tu ficha, ${jugadorSeleccionando}`;
        mostrarFichasParaSeleccion(); // Actualiza para deshabilitar la elegida
        fichasElegidasContenedor.classList.remove('oculto');
    } else {
        fichaSaul = nombreFichaSeleccionada;
        console.log(`Saúl elige: ${fichaSaul}`);
        fichaElegidaSaulImg.src = RUTA_FICHAS + fichaSaul;
        console.log("Ambos jugadores han elegido. Iniciando juego...");
        pantallaSeleccion.classList.add('oculto');
        iniciarJuego(); // Inicia el juego del tablero
    }
}

/** Inicia el proceso de selección de fichas */
function iniciarProcesoSeleccion() {
    // Resetear estado de selección y juego
    fichaHugo = null;
    fichaSaul = null;
    juegoActivo = false;
    procesandoClick = false;
    estadoTablero = [null, null, null, null, null, null, null, null, null]; // Limpiar tablero lógico

    fichasElegidasContenedor.classList.add('oculto');
    fichaElegidaHugoImg.src = "";
    fichaElegidaSaulImg.src = "";
    jugadorSeleccionando = JUGADORES[0];

    tituloSeleccionElem.textContent = `Hola Hugo y Saúl`;
    instruccionSeleccionElem.textContent = `Elige tu ficha, ${jugadorSeleccionando}`;
    mostrarFichasParaSeleccion();

    // Gestionar visibilidad de pantallas
    pantallaInicial.classList.add('oculto');
    juegoContenedor.classList.add('oculto'); // Asegurar que el juego está oculto
    pantallaSeleccion.classList.remove('oculto'); // Mostrar selección
    botonReiniciar.classList.add('oculto'); // Ocultar botón reiniciar
    actualizarResaltadoFoto(); // Quitar resaltados de fotos
}


/** Actualiza la visualización del marcador (puntajes). */
function actualizarMarcadorDisplay() {
    puntajeHugoElem.textContent = puntajeHugo;
    puntajeSaulElem.textContent = puntajeSaul;
}

/** Resalta la foto del jugador activo y quita el resaltado del otro. */
function actualizarResaltadoFoto() {
    if (!juegoActivo) {
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
    pantallaSeleccion.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');

    estadoTablero = [null, null, null, null, null, null, null, null, null];
    juegoActivo = true;
    procesandoClick = false; // Resetear flag de procesamiento

    // Elegir jugador inicial aleatoriamente para la *partida*
    const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
    jugadorActual = JUGADORES[indiceAleatorio];

    botonReiniciar.classList.add('oculto');
    actualizarMarcadorDisplay();
    actualizarResaltadoFoto();

    infoTurno.textContent = `¡Empieza ${jugadorActual}! Te toca.`;

    celdas.forEach(celda => {
        celda.innerHTML = '';
        celda.classList.remove('ganadora');
        // IMPORTANTE: Re-añadir listener CADA vez que inicia partida
        celda.removeEventListener('click', manejarClickCelda); // Limpiar por si acaso
        celda.addEventListener('click', manejarClickCelda, { once: true }); // {once: true} es crucial
    });

    console.log(`Juego iniciado. Empieza: ${jugadorActual}. Fichas: Hugo=${fichaHugo}, Saúl=${fichaSaul}`);
}

/** Maneja el evento de clic en una celda del tablero */
function manejarClickCelda(evento) {
    // Protección contra clics mientras se procesa o juego inactivo
    if (!juegoActivo || procesandoClick) {
         console.log(`DEBUG: Clic ignorado (juegoActivo=${juegoActivo}, procesandoClick=${procesandoClick})`);
         return;
    }

    procesandoClick = true; // Bloquear nuevos clics inmediatamente
    console.log("DEBUG: procesandoClick = true");


    let celdaClickeada = evento.target;
    if (celdaClickeada.tagName === 'IMG' && celdaClickeada.parentElement.classList.contains('celda')) {
        celdaClickeada = celdaClickeada.parentElement;
    }

    if (!celdaClickeada.classList.contains('celda') || !celdaClickeada.hasAttribute('data-index')) {
        console.warn("DEBUG: Clic inválido (no es celda o sin índice)");
        procesandoClick = false; // Desbloquear si el clic no es válido
        console.log("DEBUG: procesandoClick = false (clic inválido)");
        return;
    }

    const indiceCelda = parseInt(celdaClickeada.getAttribute('data-index'));
    console.log(`DEBUG: Click en celda ${indiceCelda}. Jugador ACTUAL: ${jugadorActual}`);

    // Verificar si la celda ya está ocupada LÓGICAMENTE
    if (estadoTablero[indiceCelda] !== null) {
        console.warn(`DEBUG: Intento de clic en celda ${indiceCelda} ya ocupada por ${estadoTablero[indiceCelda]}`);
        procesandoClick = false; // Desbloquear si la celda está ocupada
        console.log("DEBUG: procesandoClick = false (celda ocupada)");
        // IMPORTANTE: Aunque {once: true} ayuda, este chequeo lógico es vital
        // Quitamos el listener de nuevo por seguridad si se llega aquí incorrectamente
        celdaClickeada.removeEventListener('click', manejarClickCelda);
        return;
    }

    // Guardamos quién hizo el movimiento para las comprobaciones
    const jugadorQueJugo = jugadorActual;
    estadoTablero[indiceCelda] = jugadorQueJugo; // Marcar tablero lógico

    // Colocar ficha visual
    const fichaAColocar = jugadorQueJugo === JUGADORES[0] ? fichaHugo : fichaSaul;
    celdaClickeada.innerHTML = `<img src="${RUTA_FICHAS}${fichaAColocar}" alt="Ficha ${jugadorQueJugo}" class="ficha-en-tablero">`;
    console.log(`DEBUG: Celda ${indiceCelda} marcada por ${jugadorQueJugo}. Ficha: ${fichaAColocar}`);

    // Comprobar victoria/empate
    if (comprobarVictoria(jugadorQueJugo)) {
        console.log(`DEBUG: Victoria detectada para ${jugadorQueJugo}. Finalizando.`);
        finalizarJuego(false); // FinalizarJuego gestiona juegoActivo y procesandoClick
        return; // Salir de la función aquí
    }
    if (comprobarEmpate()) {
        console.log(`DEBUG: Empate detectado. Finalizando.`);
        finalizarJuego(true); // FinalizarJuego gestiona juegoActivo y procesandoClick
        return; // Salir de la función aquí
    }

    // Si no hay fin de juego, CAMBIAR TURNO
    console.log(`DEBUG: No hay fin de juego. Llamando a cambiarTurno desde ${jugadorQueJugo}.`);
    cambiarTurno(); // ESTO ACTUALIZA jugadorActual para el SIGUIENTE clic

    // Desbloquear para el siguiente clic DESPUÉS de procesar todo
    procesandoClick = false;
    console.log("DEBUG: procesandoClick = false (fin de manejo de clic)");
}

/** Comprueba si el jugador dado ha ganado */
function comprobarVictoria(jugador) {
    for (const combinacion of COMBINACIONES_GANADORAS) {
        const [a, b, c] = combinacion;
        if (estadoTablero[a] === jugador && estadoTablero[b] === jugador && estadoTablero[c] === jugador) {
             resaltarCeldasGanadoras(combinacion); // Resaltar visualmente
            return true;
        }
    }
    return false;
}

/** Comprueba si hay empate (ninguna celda es null) */
function comprobarEmpate() {
    const empate = estadoTablero.every(celda => celda !== null);
    return empate; // No mostrar log aquí, se muestra al finalizar
}

/** Cambia el turno al otro jugador, actualiza mensaje y resalta foto */
function cambiarTurno() {
    console.log(`DEBUG: Entrando a cambiarTurno. Jugador actual ANTES: ${jugadorActual}`);
    // Alternar jugador
    jugadorActual = (jugadorActual === JUGADORES[0]) ? JUGADORES[1] : JUGADORES[0];
    infoTurno.textContent = `Turno de: ${jugadorActual}`;
    actualizarResaltadoFoto();
    console.log(`DEBUG: Saliendo de cambiarTurno. Jugador actual DESPUÉS: ${jugadorActual}`);
}

/** Finaliza la partida actual */
function finalizarJuego(esEmpate) {
    console.log(`DEBUG: Entrando a finalizarJuego. Es empate: ${esEmpate}`);
    juegoActivo = false;
    procesandoClick = false; // Asegurar desbloqueo
    console.log("DEBUG: juegoActivo = false, procesandoClick = false");

    // Quitar listeners de todas las celdas (seguridad extra a {once: true})
    celdas.forEach(celda => {
        celda.removeEventListener('click', manejarClickCelda);
    });
    actualizarResaltadoFoto(); // Quita resaltados de fotos

    if (esEmpate) {
        infoTurno.textContent = "¡Vaya! Ha sido un empate.";
        console.log("Juego finalizado: Empate.");
    } else {
        // ¡Ojo! jugadorActual aquí es el que acaba de ganar
        infoTurno.textContent = `¡Felicidades ${jugadorActual}! ¡Has ganado! 🎉`;
        console.log(`Juego finalizado: Ganador ${jugadorActual}.`);
        if (jugadorActual === JUGADORES[0]) { puntajeHugo++; } else { puntajeSaul++; }
        actualizarMarcadorDisplay();
        console.log(`Marcador actualizado: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);
    }
    botonReiniciar.classList.remove('oculto'); // Mostrar botón para volver a selección
}

/** Añade clase ganadora a las celdas */
function resaltarCeldasGanadoras(combinacion) {
    combinacion.forEach(indice => {
        if(celdas[indice]) { celdas[indice].classList.add('ganadora'); }
        else { console.error("Índice de celda fuera de rango:", indice); }
    });
}

// --- Event Listeners Iniciales ---
botonComenzar.addEventListener('click', iniciarProcesoSeleccion);
botonReiniciar.addEventListener('click', iniciarProcesoSeleccion);

// --- Fin del script ---
