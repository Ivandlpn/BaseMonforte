// --- Referencias a Elementos del DOM ---
const botonComenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');
const juegoContenedor = document.getElementById('juego-contenedor');
const infoTurno = document.getElementById('info-turno');
const celdas = document.querySelectorAll('.celda'); // NodeList de todas las celdas

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
    // (Opcional) Quitar clase de fin de juego si la añadimos
    // document.body.classList.remove('juego-terminado');

    // 4. Actualizar el texto del turno inicial
    infoTurno.textContent = `¡Empieza ${jugadorActual}! Te toca (${jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL})`;

    // 5. Preparar las celdas: limpiar y añadir listeners
    celdas.forEach(celda => {
        celda.textContent = ''; // Limpiar marca visual
        celda.classList.remove('ganadora'); // Quitar posible resaltado de partida anterior
        // Quitamos listeners antiguos por si acaso (aunque 'once' ayuda)
        celda.removeEventListener('click', manejarClickCelda);
        // Añadimos el listener nuevo para esta partida
        // { once: true } es CRUCIAL aquí. Cada celda solo permite UN clic por partida.
        // Al reiniciar, se vuelve a añadir el listener para la nueva partida.
        celda.addEventListener('click', manejarClickCelda, { once: true });
    });

    console.log(`Juego iniciado. Empieza: ${jugadorActual}`);
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

    // 2. Colocar la marca en el tablero (visual y estado interno)
    estadoTablero[indiceCelda] = marcaActual;
    celdaClickeada.textContent = marcaActual;
    // (Opcional) Añadir clase específica para X y O para estilos diferentes
    // celdaClickeada.classList.add(marcaActual === MARCA_HUGO ? 'marca-x' : 'marca-o');

    console.log(`Celda ${indiceCelda} clickeada por ${jugadorActual}. Marca: ${marcaActual}`);

    // 3. Comprobar si hay un ganador
    if (comprobarVictoria(marcaActual)) {
        finalizarJuego(false); // false indica que NO es un empate
        return; // Termina el turno, no cambiar de jugador
    }

    // 4. Comprobar si hay empate (si no hubo victoria)
    if (comprobarEmpate()) {
        finalizarJuego(true); // true indica que SÍ es un empate
        return; // Termina el turno
    }

    // 5. Si no hay victoria ni empate, cambiar el turno
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
            // (Opcional) Resaltar las celdas ganadoras
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
 * Finaliza la partida actual, mostrando el resultado.
 * @param {boolean} esEmpate - Indica si el final fue por empate.
 */
function finalizarJuego(esEmpate) {
    juegoActivo = false; // Detiene la posibilidad de más clics
    // Los listeners con {once: true} ya no funcionarán de todas formas,
    // pero desactivar juegoActivo previene lógica extra si hubiera.

    if (esEmpate) {
        infoTurno.textContent = "¡Vaya! Ha sido un empate.";
    } else {
        infoTurno.textContent = `¡Felicidades ${jugadorActual}! ¡Has ganado! 🎉`;
    }

    // (Opcional) Añadir una clase al body o contenedor para estilos de fin de juego
    // document.body.classList.add('juego-terminado');

    // Aquí podrías mostrar un botón de "Jugar de Nuevo"
    // Por ahora, el juego se reinicia recargando la página o esperando la implementación del botón Reiniciar.
    console.log("Juego finalizado.");
}

/**
 * (Opcional) Añade una clase a las celdas ganadoras para resaltarlas.
 * @param {number[]} combinacion - Array con los 3 índices ganadores.
 */
 function resaltarCeldasGanadoras(combinacion) {
    combinacion.forEach(indice => {
        celdas[indice].classList.add('ganadora');
    });
}


// --- Event Listener Inicial ---

// Listener para el botón de comenzar
botonComenzar.addEventListener('click', iniciarJuego);

// --- Fin del script ---
