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
const PUNTOS_PARA_GANAR_PARTIDO = 3; // <--- NUEVA CONSTANTE
// **Lista actualizada de fichas**
const FICHAS_DISPONIBLES = ['X.png', 'O.png', 'pinar.png', 'torremolinos.png','malaga.png','andalucia.png','barca.png','españa.png','local.png','madrid.png','nacional.png','sevilla.png'];
const RUTA_FICHAS = 'img/fichas/';

let jugadorActual;
let jugadorSeleccionando;
let fichaHugo = null;
let fichaSaul = null;
let juegoActivo = false;
let estadoTablero = [null, null, null, null, null, null, null, null, null];
let puntajeHugo = 0;
let puntajeSaul = 0;
// Eliminamos procesandoClick para volver a la base funcional
// let procesandoClick = false;

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
        iniciarJuego(); // Llama a iniciar la partida
    }
}

/** Inicia el proceso de selección de fichas. Resetea puntajes SIEMPRE */
function iniciarProcesoSeleccion() {
    console.log("Iniciando proceso de selección.");
    // ***** CAMBIO: Resetear puntajes SIEMPRE *****
    puntajeHugo = 0;
    puntajeSaul = 0;
    console.log("Puntajes del partido reseteados a 0.");
    // ***** FIN CAMBIO *****

    // Resetear variables de estado
    fichaHugo = null;
    fichaSaul = null;
    juegoActivo = false; // Asegurar que juego no está activo
    estadoTablero = [null, null, null, null, null, null, null, null, null];

    // UI: Resetear selección
    fichasElegidasContenedor.classList.add('oculto');
    fichaElegidaHugoImg.src = "";
    fichaElegidaSaulImg.src = "";
    jugadorSeleccionando = JUGADORES[0]; // Siempre empieza Hugo a elegir
    tituloSeleccionElem.textContent = `Hola Hugo y Saúl`;
    instruccionSeleccionElem.textContent = `Elige tu ficha, ${jugadorSeleccionando}`;
    mostrarFichasParaSeleccion(); // Mostrar fichas actualizadas

    // UI: Gestionar pantallas y botón
    pantallaInicial.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaSeleccion.classList.remove('oculto');
    botonReiniciar.classList.add('oculto');
    // ***** CAMBIO: Quitar clase de victoria de partido *****
    infoTurno.classList.remove('partido-ganado');
    // ***** FIN CAMBIO *****
    actualizarMarcadorDisplay(); // Mostrar 0-0
    actualizarResaltadoFoto(); // Quitar resaltado fotos
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
    if (juegoActivo) { // Solo resaltar si el juego está activo
        if (jugadorActual === JUGADORES[0]) {
            fotoHugoElem.classList.add('activa');
        } else {
            fotoSaulElem.classList.add('activa');
        }
    }
}

/** Inicia una nueva PARTIDA del juego (tablero) */
function iniciarJuego() {
    // Asegurarse que pantallas están correctas
    pantallaSeleccion.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');
    // Resetear estado de la partida
    estadoTablero = [null, null, null, null, null, null, null, null, null];
    juegoActivo = true; // Marcar juego como activo
    // Seleccionar jugador inicial aleatorio
    const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
    jugadorActual = JUGADORES[indiceAleatorio];
    // UI inicial de la partida
    botonReiniciar.classList.add('oculto');
    infoTurno.classList.remove('partido-ganado'); // Quitar por si acaso
    actualizarMarcadorDisplay(); // Mostrar puntajes actuales
    actualizarResaltadoFoto(); // Resaltar al que empieza
    infoTurno.textContent = `¡Empieza ${jugadorActual}! Te toca.`;
    // Preparar celdas
    celdas.forEach(celda => {
        celda.innerHTML = '';
        celda.classList.remove('ganadora');
        celda.removeEventListener('click', manejarClickCelda); // Limpiar siempre por seguridad
        celda.addEventListener('click', manejarClickCelda, { once: true }); // Re-añadir con once
    });
    console.log(`Partida iniciada. Empieza: ${jugadorActual}.`);
}

/** Maneja el evento de clic en una celda del tablero */
function manejarClickCelda(evento) {
    // Salir si el juego no está activo
    if (!juegoActivo) return;

    let celdaClickeada = evento.target;
    if (celdaClickeada.tagName === 'IMG' && celdaClickeada.parentElement.classList.contains('celda')) {
        celdaClickeada = celdaClickeada.parentElement;
    }
    if (!celdaClickeada.classList.contains('celda') || !celdaClickeada.hasAttribute('data-index')) {
        return; // Clic inválido
    }
    const indiceCelda = parseInt(celdaClickeada.getAttribute('data-index'));

    // Verificar si la celda está ocupada lógicamente
    // {once: true} previene la mayoría de los clics repetidos si juegoActivo es true
    if (estadoTablero[indiceCelda] !== null) {
        console.warn(`Intento de clic en celda ${indiceCelda} ya ocupada.`);
        return;
    }

    // Realizar el movimiento
    const jugadorQueJugo = jugadorActual;
    estadoTablero[indiceCelda] = jugadorQueJugo;
    const fichaAColocar = jugadorQueJugo === JUGADORES[0] ? fichaHugo : fichaSaul;
    celdaClickeada.innerHTML = `<img src="${RUTA_FICHAS}${fichaAColocar}" alt="Ficha ${jugadorQueJugo}" class="ficha-en-tablero">`;
    console.log(`Celda ${indiceCelda} marcada por ${jugadorQueJugo}`);

    // Comprobar resultado después del movimiento
    if (comprobarVictoria(jugadorQueJugo)) {
        finalizarJuego(false); // Ganó el jugador que jugó
    } else if (comprobarEmpate()) {
        finalizarJuego(true); // Empate
    } else {
        cambiarTurno(); // Si no hay fin, cambiar turno
    }
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
    return estadoTablero.every(celda => celda !== null);
}

/** Cambia el turno al otro jugador, actualiza mensaje y resalta foto */
function cambiarTurno() {
    jugadorActual = (jugadorActual === JUGADORES[0]) ? JUGADORES[1] : JUGADORES[0];
    infoTurno.textContent = `Turno de: ${jugadorActual}`;
    actualizarResaltadoFoto();
    console.log(`Turno cambiado a: ${jugadorActual}`);
}

/** Finaliza la partida actual y comprueba si se ganó el PARTIDO */
function finalizarJuego(esEmpate) {
    console.log(`Finalizando partida. Empate: ${esEmpate}`);
    juegoActivo = false; // Marcar juego como inactivo
    actualizarResaltadoFoto(); // Quitar resaltados

    // Quitar listeners restantes (seguridad)
    celdas.forEach(celda => {
        celda.removeEventListener('click', manejarClickCelda);
    });

    let mensajeFinal = "";
    let partidoGanado = false; // Flag local para saber si se aplica estilo especial

    if (esEmpate) {
        mensajeFinal = "¡Vaya! Partida en empate.";
        console.log("Partida finalizada: Empate.");
    } else {
        // Ganador de la PARTIDA individual
        const ganadorPartida = jugadorActual; // El que hizo el último movimiento ganador
        mensajeFinal = `¡${ganadorPartida} gana la partida!`;
        console.log(`Partida finalizada: Ganador ${ganadorPartida}.`);

        // Actualizar puntaje del partido
        if (ganadorPartida === JUGADORES[0]) {
            puntajeHugo++;
        } else {
            puntajeSaul++;
        }
        actualizarMarcadorDisplay();
        console.log(`Marcador actualizado: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);

        // ***** CAMBIO: Comprobar si se ganó el PARTIDO *****
        if (puntajeHugo === PUNTOS_PARA_GANAR_PARTIDO || puntajeSaul === PUNTOS_PARA_GANAR_PARTIDO) {
            partidoGanado = true; // Marcar que el partido terminó
            mensajeFinal = `¡¡${ganadorPartida} HA GANADO EL PARTIDO ${puntajeHugo} - ${puntajeSaul}!! 🏆🎉`;
            infoTurno.classList.add('partido-ganado'); // Aplicar estilo especial
            console.log(`¡PARTIDO TERMINADO! Ganador: ${ganadorPartida}`);
        }
        // ***** FIN CAMBIO *****
    }

    infoTurno.textContent = mensajeFinal;
    botonReiniciar.classList.remove('oculto'); // Mostrar botón "Jugar de Nuevo"
}

/** Añade clase ganadora a las celdas */
function resaltarCeldasGanadoras(combinacion) {
    combinacion.forEach(indice => {
        if(celdas[indice]) { celdas[indice].classList.add('ganadora'); }
        else { console.error("Índice de celda fuera de rango:", indice); }
    });
}

// --- Event Listeners Iniciales ---
// Estos listeners llaman DIRECTAMENTE a iniciarProcesoSeleccion
// iniciarProcesoSeleccion SIEMPRE resetea los puntajes a 0
botonComenzar.addEventListener('click', iniciarProcesoSeleccion);
botonReiniciar.addEventListener('click', iniciarProcesoSeleccion);

// --- Fin del script ---
