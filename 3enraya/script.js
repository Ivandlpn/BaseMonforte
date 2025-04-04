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
// ===== ¡LÍNEA MODIFICADA! =====
const FICHAS_DISPONIBLES = ['X.png', 'O.png', 'pinar.png', 'torremolinos.png', 'andalucia.png','barca.png','españa.png','local.png','madrid.png','nacional.png','sevilla.png'];
// ==============================
const RUTA_FICHAS = 'img/fichas/';

let jugadorActual;
let jugadorSeleccionando;
let fichaHugo = null;
let fichaSaul = null;
let juegoActivo = false;
let estadoTablero = [null, null, null, null, null, null, null, null, null];
let puntajeHugo = 0;
let puntajeSaul = 0;
// Dejamos procesandoClick si estaba en tu versión funcional
let procesandoClick = false;

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
    if (fichaClickeada.classList.contains('seleccionada')) return;
    const nombreFichaSeleccionada = fichaClickeada.dataset.filename;

    if (jugadorSeleccionando === JUGADORES[0]) {
        fichaHugo = nombreFichaSeleccionada;
        console.log(`Hugo elige: ${fichaHugo}`);
        fichaElegidaHugoImg.src = RUTA_FICHAS + fichaHugo;
        jugadorSeleccionando = JUGADORES[1];
        instruccionSeleccionElem.textContent = `Elige tu ficha, ${jugadorSeleccionando}`;
        mostrarFichasParaSeleccion();
        fichasElegidasContenedor.classList.remove('oculto');
    } else {
        fichaSaul = nombreFichaSeleccionada;
        console.log(`Saúl elige: ${fichaSaul}`);
        fichaElegidaSaulImg.src = RUTA_FICHAS + fichaSaul;
        console.log("Ambos jugadores han elegido. Iniciando juego...");
        pantallaSeleccion.classList.add('oculto');
        iniciarJuego();
    }
}

/** Inicia el proceso de selección de fichas */
function iniciarProcesoSeleccion() {
    // ***** NO TOCAMOS LOS PUNTAJES AQUÍ TODAVÍA *****
    fichaHugo = null;
    fichaSaul = null;
    juegoActivo = false;
    procesandoClick = false; // Asegurarse de resetearlo si lo usas
    estadoTablero = [null, null, null, null, null, null, null, null, null];

    fichasElegidasContenedor.classList.add('oculto');
    fichaElegidaHugoImg.src = "";
    fichaElegidaSaulImg.src = "";
    jugadorSeleccionando = JUGADORES[0];

    tituloSeleccionElem.textContent = `Hola Hugo y Saúl`;
    instruccionSeleccionElem.textContent = `Elige tu ficha, ${jugadorSeleccionando}`;
    mostrarFichasParaSeleccion();

    pantallaInicial.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaSeleccion.classList.remove('oculto');
    botonReiniciar.classList.add('oculto');
    infoTurno.classList.remove('partido-ganado'); // Quitar estilo por si acaso
    actualizarResaltadoFoto(); // Quitar resaltado
    // Los puntajes NO se resetean aquí explícitamente aún
}


/** Actualiza la visualización del marcador (puntajes). */
function actualizarMarcadorDisplay() {
    puntajeHugoElem.textContent = puntajeHugo;
    puntajeSaulElem.textContent = puntajeSaul;
}

/** Resalta la foto del jugador activo y quita el resaltado del otro. */
function actualizarResaltadoFoto() {
    fotoHugoElem.classList.remove('activa');
    fotoSaulElem.classList.remove('activa');
    if (juegoActivo) { // Solo si juego está activo
        if (jugadorActual === JUGADORES[0]) {
            fotoHugoElem.classList.add('activa');
        } else {
            fotoSaulElem.classList.add('activa');
        }
    }
}

/** Inicia una nueva partida del juego (tablero) */
function iniciarJuego() {
    pantallaSeleccion.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');
    estadoTablero = [null, null, null, null, null, null, null, null, null];
    juegoActivo = true;
    procesandoClick = false; // Asegurar reset si lo usas
    const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
    jugadorActual = JUGADORES[indiceAleatorio];
    botonReiniciar.classList.add('oculto');
    infoTurno.classList.remove('partido-ganado'); // Quitar estilo
    actualizarMarcadorDisplay(); // Mostrar puntajes actuales
    actualizarResaltadoFoto(); // Resaltar al que empieza
    infoTurno.textContent = `¡Empieza ${jugadorActual}! Te toca.`;
    celdas.forEach(celda => {
        celda.innerHTML = '';
        celda.classList.remove('ganadora');
        celda.removeEventListener('click', manejarClickCelda);
        celda.addEventListener('click', manejarClickCelda, { once: true });
    });
    console.log(`Juego iniciado. Empieza: ${jugadorActual}. Fichas: Hugo=${fichaHugo}, Saúl=${fichaSaul}`);
}

/** Maneja el evento de clic en una celda del tablero */
function manejarClickCelda(evento) {
    // Usamos la comprobación que tenías
    if (!juegoActivo || procesandoClick) {
         console.log(`DEBUG: Clic ignorado (juegoActivo=${juegoActivo}, procesandoClick=${procesandoClick})`);
         return;
    }
    procesandoClick = true;
    console.log("DEBUG: procesandoClick = true");

    let celdaClickeada = evento.target;
    if (celdaClickeada.tagName === 'IMG' && celdaClickeada.parentElement.classList.contains('celda')) {
        celdaClickeada = celdaClickeada.parentElement;
    }
    if (!celdaClickeada.classList.contains('celda') || !celdaClickeada.hasAttribute('data-index')) {
        console.warn("DEBUG: Clic inválido (no es celda o sin índice)");
        procesandoClick = false; // Liberar si es inválido
        console.log("DEBUG: procesandoClick = false (clic inválido)");
        return;
    }
    const indiceCelda = parseInt(celdaClickeada.getAttribute('data-index'));
    // console.log(`DEBUG: Click en celda ${indiceCelda}. Jugador ACTUAL: ${jugadorActual}`); // Descomentar si necesitas depurar

    if (estadoTablero[indiceCelda] !== null) {
        console.warn(`DEBUG: Intento de clic en celda ${indiceCelda} ya ocupada por ${estadoTablero[indiceCelda]}`);
        procesandoClick = false; // Liberar si está ocupada
        console.log("DEBUG: procesandoClick = false (celda ocupada)");
        // {once: true} debería haber quitado el listener, pero por seguridad:
        celdaClickeada.removeEventListener('click', manejarClickCelda);
        return;
    }

    const jugadorQueJugo = jugadorActual;
    estadoTablero[indiceCelda] = jugadorQueJugo;

    const fichaAColocar = jugadorQueJugo === JUGADORES[0] ? fichaHugo : fichaSaul;
    celdaClickeada.innerHTML = `<img src="${RUTA_FICHAS}${fichaAColocar}" alt="Ficha ${jugadorQueJugo}" class="ficha-en-tablero">`;
    // console.log(`DEBUG: Celda ${indiceCelda} marcada por ${jugadorQueJugo}. Ficha: ${fichaAColocar}`); // Descomentar si necesitas depurar

    if (comprobarVictoria(jugadorQueJugo)) {
        // console.log(`DEBUG: Victoria detectada para ${jugadorQueJugo}. Finalizando.`); // Descomentar si necesitas depurar
        finalizarJuego(false);
        return; // Salir aquí
    }
    if (comprobarEmpate()) {
        // console.log(`DEBUG: Empate detectado. Finalizando.`); // Descomentar si necesitas depurar
        finalizarJuego(true);
        return; // Salir aquí
    }

    // console.log(`DEBUG: No hay fin de juego. Llamando a cambiarTurno desde ${jugadorQueJugo}.`); // Descomentar si necesitas depurar
    cambiarTurno(); // Solo se llama si no hay victoria ni empate

    procesandoClick = false; // Liberar al final del procesamiento exitoso
    console.log("DEBUG: procesandoClick = false (fin de manejo de clic)");
}

/** Comprueba si el jugador dado ha ganado */
function comprobarVictoria(jugador) {
    for (const combinacion of COMBINACIONES_GANADORAS) {
        const [a, b, c] = combinacion;
        if (estadoTablero[a] === jugador && estadoTablero[b] === jugador && estadoTablero[c] === jugador) {
             resaltarCeldasGanadoras(combinacion);
            return true;
        }
    }
    return false;
}

/** Comprueba si hay empate (ninguna celda es null) */
function comprobarEmpate() {
    const empate = estadoTablero.every(celda => celda !== null);
    return empate;
}

/** Cambia el turno al otro jugador, actualiza mensaje y resalta foto */
function cambiarTurno() {
    // console.log(`DEBUG: Entrando a cambiarTurno. Jugador actual ANTES: ${jugadorActual}`); // Descomentar si necesitas depurar
    jugadorActual = (jugadorActual === JUGADORES[0]) ? JUGADORES[1] : JUGADORES[0];
    infoTurno.textContent = `Turno de: ${jugadorActual}`;
    actualizarResaltadoFoto();
    // console.log(`DEBUG: Saliendo de cambiarTurno. Jugador actual DESPUÉS: ${jugadorActual}`); // Descomentar si necesitas depurar
}

/** Finaliza la partida actual */
function finalizarJuego(esEmpate) {
    // console.log(`DEBUG: Entrando a finalizarJuego. Es empate: ${esEmpate}`); // Descomentar si necesitas depurar
    juegoActivo = false;
    procesandoClick = false; // Asegurarse de liberar
    // console.log("DEBUG: juegoActivo = false, procesandoClick = false"); // Descomentar si necesitas depurar

    celdas.forEach(celda => {
        celda.removeEventListener('click', manejarClickCelda); // Quitar listeners restantes
    });
    actualizarResaltadoFoto(); // Quitar resaltado

    let mensajeFinal = ""; // Variable para el mensaje final

    if (esEmpate) {
        mensajeFinal = "¡Vaya! Ha sido un empate.";
        console.log("Juego finalizado: Empate.");
    } else {
        const ganadorPartida = jugadorActual; // El jugador que hizo el último movimiento ganador
        mensajeFinal = `¡Felicidades ${ganadorPartida}! ¡Has ganado! 🎉`; // Mensaje de partida ganada
        console.log(`Juego finalizado: Ganador ${ganadorPartida}.`);

        // Actualizar puntaje
        if (ganadorPartida === JUGADORES[0]) {
             puntajeHugo++;
        } else {
             puntajeSaul++;
        }
        actualizarMarcadorDisplay();
        console.log(`Marcador actualizado: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);

        // ----- INICIO: MODIFICACIÓN MÍNIMA -----
        // Comprobar si se ganó el PARTIDO después de actualizar puntajes
        if (puntajeHugo === PUNTOS_PARA_GANAR_PARTIDO || puntajeSaul === PUNTOS_PARA_GANAR_PARTIDO) {
            // Sobrescribir el mensaje SÓLO si se ganó el partido
            mensajeFinal = `¡¡${ganadorPartida} HA GANADO EL PARTIDO ${puntajeHugo} - ${puntajeSaul}!! 🏆🎉`;
            infoTurno.classList.add('partido-ganado'); // Añadir clase para estilo
            console.log(`¡PARTIDO TERMINADO! Ganador: ${ganadorPartida}`);
        }
        // ----- FIN: MODIFICACIÓN MÍNIMA -----
    }
    // Establecer el mensaje (sea de partida o partido) y mostrar botón
    infoTurno.textContent = mensajeFinal;
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
// Los listeners originales que funcionaban: llaman a iniciarProcesoSeleccion
// (y ahora iniciarProcesoSeleccion SIEMPRE resetea los puntajes)
botonComenzar.addEventListener('click', iniciarProcesoSeleccion);
botonReiniciar.addEventListener('click', iniciarProcesoSeleccion);

// --- Fin del script ---
