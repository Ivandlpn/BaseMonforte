// --- Referencias a Elementos del DOM ---
const botonComenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');
const juegoContenedor = document.getElementById('juego-contenedor');
const infoTurno = document.getElementById('info-turno');
const celdas = document.querySelectorAll('.celda');
const botonReiniciar = document.getElementById('boton-reiniciar'); // NUEVA REFERENCIA

// --- Constantes y Variables del Juego ---
// ... (igual que antes: JUGADORES, MARCAS, jugadorActual, juegoActivo, estadoTablero, COMBINACIONES_GANADORAS)
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


// --- Funciones ---

/**
 * Inicia una nueva partida.
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

    // 4. OCULTAR el botón de reiniciar al empezar una nueva partida
    botonReiniciar.classList.add('oculto');

    // 5. Actualizar el texto del turno inicial
    const marcaInicial = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `¡Empieza ${jugadorActual}! Te toca (${marcaInicial})`;

    // 6. Preparar las celdas: limpiar y añadir listeners
    celdas.forEach(celda => {
        celda.textContent = '';
        celda.classList.remove('ganadora'); // Quitar resaltado
        celda.removeEventListener('click', manejarClickCelda); // Quitar listener viejo
        celda.addEventListener('click', manejarClickCelda, { once: true }); // Añadir nuevo
    });

    console.log(`Juego iniciado. Empieza: ${jugadorActual}`);
}

/**
 * Maneja el evento de clic en una celda.
 * @param {Event} evento - El objeto del evento de clic.
 */
function manejarClickCelda(evento) {
    if (!juegoActivo) return;

    const celdaClickeada = evento.target;
    const indiceCelda = parseInt(celdaClickeada.getAttribute('data-index'));

    if (estadoTablero[indiceCelda] !== '') return; // Ya está ocupada

    const marcaActual = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    estadoTablero[indiceCelda] = marcaActual;
    celdaClickeada.textContent = marcaActual;

    if (comprobarVictoria(marcaActual)) {
        finalizarJuego(false); // Ganador
        return;
    }

    if (comprobarEmpate()) {
        finalizarJuego(true); // Empate
        return;
    }

    cambiarTurno();
}

/**
 * Comprueba si el jugador con la marca dada ha ganado.
 * @param {string} marca - La marca a comprobar ('X' o 'O').
 * @returns {boolean} - True si hay victoria, false si no.
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
 * @returns {boolean} - True si es empate, false si no.
 */
function comprobarEmpate() {
    // Empate si todas las celdas están llenas Y no hay ganador (implícito, porque se comprueba victoria antes)
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
 * Finaliza la partida actual, mostrando el resultado y el botón de reinicio.
 * @param {boolean} esEmpate - Indica si el final fue por empate.
 */
function finalizarJuego(esEmpate) {
    juegoActivo = false; // Detiene la posibilidad de más clics

    if (esEmpate) {
        infoTurno.textContent = "¡Vaya! Ha sido un empate.";
        console.log("Juego finalizado: Empate.");
    } else {
        infoTurno.textContent = `¡Felicidades ${jugadorActual}! ¡Has ganado! 🎉`;
        console.log(`Juego finalizado: Ganador ${jugadorActual}.`);
    }

    // MOSTRAR el botón de reiniciar
    botonReiniciar.classList.remove('oculto');
}

/**
 * Añade una clase a las celdas ganadoras para resaltarlas.
 * @param {number[]} combinacion - Array con los 3 índices ganadores.
 */
 function resaltarCeldasGanadoras(combinacion) {
    combinacion.forEach(indice => {
        // Asegurarnos de acceder a la celda correcta usando el NodeList 'celdas'
        if(celdas[indice]) {
            celdas[indice].classList.add('ganadora');
        } else {
            console.error("Índice de celda fuera de rango:", indice);
        }
    });
}


// --- Event Listeners Iniciales ---

// Listener para el botón de comenzar
botonComenzar.addEventListener('click', iniciarJuego);

// Listener para el botón de reiniciar
botonReiniciar.addEventListener('click', iniciarJuego); // ¡Llama a la misma función para empezar de nuevo!

// --- Fin del script ---
