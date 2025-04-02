// --- Referencias a Elementos del DOM ---
const botonComenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');
const juegoContenedor = document.getElementById('juego-contenedor');
const infoTurno = document.getElementById('info-turno');
const celdas = document.querySelectorAll('.celda');
const botonReiniciar = document.getElementById('boton-reiniciar');
// NUEVAS REFERENCIAS PARA EL MARCADOR
const marcadorHugoElem = document.getElementById('marcador-hugo');
const marcadorSaulElem = document.getElementById('marcador-saul');

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
// NUEVAS VARIABLES PARA PUNTUACIONES (se mantienen entre partidas)
let puntajeHugo = 0;
let puntajeSaul = 0;

// --- Funciones ---

/**
 * Actualiza la visualización del marcador en el HTML.
 */
function actualizarMarcadorDisplay() {
    marcadorHugoElem.textContent = `Hugo: ${puntajeHugo}`;
    marcadorSaulElem.textContent = `Saúl: ${puntajeSaul}`;
}

/**
 * Inicia una nueva partida (pero NO resetea el marcador).
 */
function iniciarJuego() {
    // 1. Reiniciar estado del tablero
    estadoTablero = ['', '', '', '', '', '', '', '', ''];
    juegoActivo = true;

    // 2. Elegir jugador inicial aleatoriamente
    const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
    jugadorActual = JUGADORES[indiceAleatorio];

    // 3. Ocultar pantalla inicial y mostrar tablero
    pantallaInicial.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');

    // 4. OCULTAR el botón de reiniciar
    botonReiniciar.classList.add('oculto');

    // 5. ACTUALIZAR DISPLAY DEL MARCADOR (muestra los puntajes actuales)
    actualizarMarcadorDisplay();

    // 6. Actualizar el texto del turno inicial
    const marcaInicial = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `¡Empieza ${jugadorActual}! Te toca (${marcaInicial})`;

    // 7. Preparar las celdas
    celdas.forEach(celda => {
        celda.textContent = '';
        celda.classList.remove('ganadora');
        celda.removeEventListener('click', manejarClickCelda);
        celda.addEventListener('click', manejarClickCelda, { once: true });
    });

    console.log(`Juego iniciado. Empieza: ${jugadorActual}. Marcador: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);
}

/**
 * Maneja el evento de clic en una celda.
 * @param {Event} evento - El objeto del evento de clic.
 */
function manejarClickCelda(evento) {
    // ... (lógica interna igual que antes: verificar activo, celda ocupada, poner marca) ...
    if (!juegoActivo) return;
    const celdaClickeada = evento.target;
    const indiceCelda = parseInt(celdaClickeada.getAttribute('data-index'));
    if (estadoTablero[indiceCelda] !== '') return;
    const marcaActual = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    estadoTablero[indiceCelda] = marcaActual;
    celdaClickeada.textContent = marcaActual;

    // ... (comprobar victoria y empate, igual que antes) ...
    if (comprobarVictoria(marcaActual)) {
        finalizarJuego(false);
        return;
    }
    if (comprobarEmpate()) {
        finalizarJuego(true);
        return;
    }

    // ... (cambiar turno, igual que antes) ...
    cambiarTurno();
}

/**
 * Comprueba si el jugador con la marca dada ha ganado.
 * @param {string} marca - La marca a comprobar ('X' o 'O').
 * @returns {boolean} - True si hay victoria, false si no.
 */
function comprobarVictoria(marca) {
    // ... (lógica igual que antes) ...
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
 * @returns {boolean} - True si es empate, false si no.
 */
function comprobarEmpate() {
    // ... (lógica igual que antes) ...
    return estadoTablero.every(celda => celda !== '');
}

/**
 * Cambia el turno al otro jugador y actualiza el mensaje.
 */
function cambiarTurno() {
    // ... (lógica igual que antes) ...
    jugadorActual = jugadorActual === JUGADORES[0] ? JUGADORES[1] : JUGADORES[0];
    const marcaSiguiente = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `Turno de: ${jugadorActual} (${marcaSiguiente})`;
}

/**
 * Finaliza la partida actual, actualiza el marcador si hay ganador,
 * muestra el resultado y el botón de reinicio.
 * @param {boolean} esEmpate - Indica si el final fue por empate.
 */
function finalizarJuego(esEmpate) {
    juegoActivo = false;

    if (esEmpate) {
        infoTurno.textContent = "¡Vaya! Ha sido un empate.";
        console.log("Juego finalizado: Empate.");
    } else {
        // Hubo un ganador
        infoTurno.textContent = `¡Felicidades ${jugadorActual}! ¡Has ganado! 🎉`;
        console.log(`Juego finalizado: Ganador ${jugadorActual}.`);

        // ACTUALIZAR PUNTAJE
        if (jugadorActual === 'Hugo') {
            puntajeHugo++;
        } else {
            puntajeSaul++;
        }
        // ACTUALIZAR DISPLAY DEL MARCADOR
        actualizarMarcadorDisplay();
        console.log(`Marcador actualizado: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);
    }

    // MOSTRAR el botón de reiniciar
    botonReiniciar.classList.remove('oculto');
}

/**
 * Añade una clase a las celdas ganadoras para resaltarlas.
 * @param {number[]} combinacion - Array con los 3 índices ganadores.
 */
 function resaltarCeldasGanadoras(combinacion) {
    // ... (lógica igual que antes) ...
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

// --- INICIALIZACIÓN (opcional pero bueno): Asegurar que el marcador se muestre con 0 al cargar ---
// Se podría llamar aquí a actualizarMarcadorDisplay() si el juego empezara visible,
// pero como empieza oculto, la llamada dentro de iniciarJuego() es suficiente la primera vez.
// actualizarMarcadorDisplay(); // Descomentar si fuera necesario

// --- Fin del script ---
