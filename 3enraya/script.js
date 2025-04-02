// --- Referencias a Elementos del DOM ---
const botonComenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');
const juegoContenedor = document.getElementById('juego-contenedor');
const infoTurno = document.getElementById('info-turno');
const celdas = document.querySelectorAll('.celda');
const botonReiniciar = document.getElementById('boton-reiniciar');
// ACTUALIZADAS las referencias para los puntajes en el nuevo marcador
const puntajeHugoElem = document.getElementById('puntaje-hugo');
const puntajeSaulElem = document.getElementById('puntaje-saul');

// --- Constantes y Variables del Juego ---
const JUGADORES = ['Hugo', 'Saúl'];
const MARCA_HUGO = 'X';
const MARCA_SAUL = 'O';
let jugadorActual;
let juegoActivo = false;
let estadoTablero = ['', '', '', '', '', '', '', '', ''];
const COMBINACIONES_GANADORAS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];
let puntajeHugo = 0;
let puntajeSaul = 0;

// --- Funciones ---

/**
 * Actualiza la visualización del marcador en el HTML (solo los números).
 */
function actualizarMarcadorDisplay() {
    // Ahora solo actualizamos el contenido de los spans de puntaje
    puntajeHugoElem.textContent = puntajeHugo;
    puntajeSaulElem.textContent = puntajeSaul;
}

/**
 * Inicia una nueva partida.
 */
function iniciarJuego() {
    estadoTablero = ['', '', '', '', '', '', '', '', ''];
    juegoActivo = true;
    const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
    jugadorActual = JUGADORES[indiceAleatorio];
    pantallaInicial.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');
    botonReiniciar.classList.add('oculto');

    // Actualiza el display del marcador al iniciar (muestra 0-0 la primera vez)
    actualizarMarcadorDisplay();

    const marcaInicial = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `¡Empieza ${jugadorActual}! Te toca (${marcaInicial})`;

    celdas.forEach(celda => {
        celda.innerHTML = '';
        celda.classList.remove('ganadora');
        celda.removeEventListener('click', manejarClickCelda);
        celda.addEventListener('click', manejarClickCelda, { once: true });
    });

    console.log(`Juego iniciado. Empieza: ${jugadorActual}. Marcador: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);
}

/**
 * Maneja el evento de clic en una celda.
 */
function manejarClickCelda(evento) {
    if (!juegoActivo) return;

    let celdaClickeada = evento.target;
    if (celdaClickeada.tagName === 'SPAN' && celdaClickeada.parentElement.classList.contains('celda')) {
        celdaClickeada = celdaClickeada.parentElement;
    }
    if (!celdaClickeada.classList.contains('celda') || !celdaClickeada.hasAttribute('data-index')) return;

    const indiceCelda = parseInt(celdaClickeada.getAttribute('data-index'));
    if (estadoTablero[indiceCelda] !== '') return;

    const marcaActual = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    estadoTablero[indiceCelda] = marcaActual;
    celdaClickeada.innerHTML = `<span class="marca-animada">${marcaActual}</span>`;

    console.log(`Celda ${indiceCelda} clickeada por ${jugadorActual}. Marca: ${marcaActual} (animada)`);

    if (comprobarVictoria(marcaActual)) {
        finalizarJuego(false);
        return;
    }
    if (comprobarEmpate()) {
        finalizarJuego(true);
        return;
    }
    cambiarTurno();
}

/**
 * Comprueba si el jugador con la marca dada ha ganado.
 */
function comprobarVictoria(marca) {
    for (const combinacion of COMBINACIONES_GANADORAS) {
        const [a, b, c] = combinacion;
        if (estadoTablero[a] === marca && estadoTablero[b] === marca && estadoTablero[c] === marca) {
            resaltarCeldasGanadoras(combinacion);
            return true;
        }
    }
    return false;
}

/**
 * Comprueba si el juego ha terminado en empate.
 */
function comprobarEmpate() {
    return estadoTablero.every(celda => celda !== '');
}

/**
 * Cambia el turno al otro jugador y actualiza el mensaje.
 */
function cambiarTurno() {
    jugadorActual = jugadorActual === JUGADORES[0] ? JUGADORES[1] : JUGADORES[0];
    const marcaSiguiente = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `Turno de: ${jugadorActual} (${marcaSiguiente})`;
}

/**
 * Finaliza la partida actual, actualiza marcador si hay ganador, muestra resultado y botón reiniciar.
 */
function finalizarJuego(esEmpate) {
    juegoActivo = false;
    celdas.forEach(celda => {
        celda.removeEventListener('click', manejarClickCelda);
    });

    if (esEmpate) {
        infoTurno.textContent = "¡Vaya! Ha sido un empate.";
        console.log("Juego finalizado: Empate.");
    } else {
        infoTurno.textContent = `¡Felicidades ${jugadorActual}! ¡Has ganado! 🎉`;
        console.log(`Juego finalizado: Ganador ${jugadorActual}.`);
        if (jugadorActual === 'Hugo') {
            puntajeHugo++;
        } else {
            puntajeSaul++;
        }
        // ACTUALIZAR DISPLAY DEL MARCADOR (ahora solo los números)
        actualizarMarcadorDisplay();
        console.log(`Marcador actualizado: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);
    }
    botonReiniciar.classList.remove('oculto');
}

/**
 * Añade una clase a las celdas ganadoras para resaltarlas.
 */
function resaltarCeldasGanadoras(combinacion) {
    combinacion.forEach(indice => {
        if(celdas[indice]) {
            celdas[indice].classList.add('ganadora');
        } else {
            console.error("Índice de celda fuera de rango:", indice);
        }
    });
}

// --- Event Listeners Iniciales ---
botonComenzar.addEventListener('click', iniciarJuego);
botonReiniciar.addEventListener('click', iniciarJuego);

// --- Fin del script ---
