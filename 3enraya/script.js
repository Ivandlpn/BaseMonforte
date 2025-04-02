// --- Referencias a Elementos del DOM ---
const botonComenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');
const juegoContenedor = document.getElementById('juego-contenedor');
const infoTurno = document.getElementById('info-turno');
const celdas = document.querySelectorAll('.celda'); // NodeList de todas las celdas
const botonReiniciar = document.getElementById('boton-reiniciar');
const marcadorHugoElem = document.getElementById('marcador-hugo');
const marcadorSaulElem = document.getElementById('marcador-saul');

// --- Constantes y Variables del Juego ---
const JUGADORES = ['Hugo', 'Saúl'];
const MARCA_HUGO = 'X'; // Hugo usará X
const MARCA_SAUL = 'O'; // Saúl usará O
let jugadorActual;
let juegoActivo = false; // El juego no está activo hasta que se presiona "Comenzar"
// Array para guardar el estado del tablero. '' significa vacío.
let estadoTablero = ['', '', '', '', '', '', '', '', ''];

// Combinaciones ganadoras (índices del array estadoTablero)
const COMBINACIONES_GANADORAS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontales
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticales
    [0, 4, 8], [2, 4, 6]             // Diagonales
];
// Variables para puntuaciones (se mantienen entre partidas)
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

    // 7. Preparar las celdas: limpiar (con innerHTML) y añadir listeners
    celdas.forEach(celda => {
        celda.innerHTML = ''; // Limpia el contenido, incluyendo el posible span anterior
        celda.classList.remove('ganadora'); // Quitar resaltado
        // Quitamos listeners antiguos por si acaso (aunque 'once' ayuda mucho)
        celda.removeEventListener('click', manejarClickCelda);
        // Añadimos el listener nuevo para esta partida. { once: true } es clave.
        celda.addEventListener('click', manejarClickCelda, { once: true });
    });

    console.log(`Juego iniciado. Empieza: ${jugadorActual}. Marcador: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);
}

/**
 * Maneja el evento de clic en una celda.
 * @param {Event} evento - El objeto del evento de clic.
 */
function manejarClickCelda(evento) {
    // Si el juego no está activo, no hacer nada (seguridad extra)
    if (!juegoActivo) return;

    const celdaClickeada = evento.target; // La celda específica que se clickeó
    // Obtenemos el índice (0-8) del atributo data-index y lo convertimos a número
    const indiceCelda = parseInt(celdaClickeada.getAttribute('data-index'));

    // Verificar si la casilla ya está jugada en nuestro estado interno (doble chequeo)
    if (estadoTablero[indiceCelda] !== '') {
        console.warn("Intento de clic en celda ya ocupada:", indiceCelda);
        return; // No hacer nada si ya tiene una marca
    }

    // 1. Determinar la marca a colocar
    const marcaActual = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;

    // 2. Colocar la marca en el estado interno
    estadoTablero[indiceCelda] = marcaActual;

    // 3. Colocar la marca visualmente CON ANIMACIÓN
    // Insertamos un span con la clase CSS que activa la animación
    celdaClickeada.innerHTML = `<span class="marca-animada">${marcaActual}</span>`;

    console.log(`Celda ${indiceCelda} clickeada por ${jugadorActual}. Marca: ${marcaActual} (animada)`);

    // 4. Comprobar si hay un ganador
    if (comprobarVictoria(marcaActual)) {
        finalizarJuego(false); // false indica que NO es un empate
        return; // Termina el turno, no cambiar de jugador
    }

    // 5. Comprobar si hay empate (si no hubo victoria)
    if (comprobarEmpate()) {
        finalizarJuego(true); // true indica que SÍ es un empate
        return; // Termina el turno
    }

    // 6. Si no hay victoria ni empate, cambiar el turno
    cambiarTurno();
}

/**
 * Comprueba si el jugador con la marca dada ha ganado.
 * @param {string} marca - La marca a comprobar ('X' o 'O').
 * @returns {boolean} - True si hay victoria, false si no.
 */
function comprobarVictoria(marca) {
    // Iteramos sobre cada combinación ganadora posible
    for (const combinacion of COMBINACIONES_GANADORAS) {
        // Desestructuramos para obtener los 3 índices de la combinación
        const [a, b, c] = combinacion;
        // Comprobamos si las 3 celdas en el estadoTablero tienen la marca del jugador actual
        if (estadoTablero[a] === marca && estadoTablero[b] === marca && estadoTablero[c] === marca) {
            console.log(`Victoria detectada para ${marca} en combinación: ${a},${b},${c}`);
            // Resaltar las celdas ganadoras
             resaltarCeldasGanadoras(combinacion);
            return true; // ¡Hay un ganador!
        }
    }
    return false; // No se encontró ninguna combinación ganadora
}

/**
 * Comprueba si el juego ha terminado en empate.
 * @returns {boolean} - True si es empate, false si no.
 */
function comprobarEmpate() {
    // Si todas las celdas en estadoTablero son diferentes de '', es un empate
    // El método every() comprueba si TODOS los elementos del array cumplen la condición
    const empate = estadoTablero.every(celda => celda !== '');
    if (empate) {
        console.log("Empate detectado.");
    }
    return empate;
}

/**
 * Cambia el turno al otro jugador y actualiza el mensaje.
 */
function cambiarTurno() {
    // Cambia al otro jugador
    jugadorActual = jugadorActual === JUGADORES[0] ? JUGADORES[1] : JUGADORES[0];
    // Determina la marca del nuevo jugador actual
    const marcaSiguiente = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    // Actualiza el mensaje informativo
    infoTurno.textContent = `Turno de: ${jugadorActual} (${marcaSiguiente})`;
    console.log(`Turno cambiado a: ${jugadorActual}`);
}

/**
 * Finaliza la partida actual, actualiza el marcador si hay ganador,
 * muestra el resultado y el botón de reinicio.
 * @param {boolean} esEmpate - Indica si el final fue por empate.
 */
function finalizarJuego(esEmpate) {
    juegoActivo = false; // Detiene la posibilidad de más clics

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
botonComenzar.addEventListener('click', iniciarJuego);
botonReiniciar.addEventListener('click', iniciarJuego);

// --- Fin del script ---
