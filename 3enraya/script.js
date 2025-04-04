// --- Referencias a Elementos del DOM ---
const botonComenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');
const juegoContenedor = document.getElementById('juego-contenedor');
const infoTurno = document.getElementById('info-turno');
const celdas = document.querySelectorAll('.celda');
const botonReiniciar = document.getElementById('boton-reiniciar'); // Ahora es "Siguiente Ronda"
const puntajeHugoElem = document.getElementById('puntaje-hugo');
const puntajeSaulElem = document.getElementById('puntaje-saul');
const fotoHugoElem = document.getElementById('foto-hugo');
const fotoSaulElem = document.getElementById('foto-saul');

// NUEVAS REFERENCIAS para pantalla ganador y nuevo botón
const pantallaGanador = document.getElementById('pantalla-ganador');
const textoGanadorElem = document.getElementById('texto-ganador');
const fotoGanadorElem = document.getElementById('foto-ganador');
const nombreGanadorElem = document.getElementById('nombre-ganador');
const botonNuevoJuego = document.getElementById('boton-nuevo-juego');

// --- Constantes y Variables del Juego ---
const JUGADORES = ['Hugo', 'Saúl'];
const MARCA_HUGO = 'X';
const MARCA_SAUL = 'O';
const PUNTOS_PARA_GANAR = 3; // NUEVA CONSTANTE
let jugadorActual;
let juegoActivo = false; // Indica si una ronda está activa
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
 * Actualiza la visualización del marcador (puntajes).
 */
function actualizarMarcadorDisplay() {
    puntajeHugoElem.textContent = puntajeHugo;
    puntajeSaulElem.textContent = puntajeSaul;
}

/**
 * Resalta la foto del jugador activo y quita el resaltado del otro.
 */
function actualizarResaltadoFoto() {
    if (!juegoActivo) { // Si el juego no está activo (ej. entre rondas o en pantalla ganador), quitar ambos
        fotoHugoElem.classList.remove('activa');
        fotoSaulElem.classList.remove('activa');
        return;
    }
    if (jugadorActual === 'Hugo') {
        fotoHugoElem.classList.add('activa');
        fotoSaulElem.classList.remove('activa');
    } else {
        fotoSaulElem.classList.add('activa');
        fotoHugoElem.classList.remove('activa');
    }
}

/**
 * Inicia una nueva ronda (o la primera).
 * No resetea los puntajes globales.
 */
function iniciarRonda() {
    estadoTablero = ['', '', '', '', '', '', '', '', ''];
    juegoActivo = true;
    // Si es la primera ronda del juego completo, elige al azar, sino, podría empezar el que perdió la anterior (opcional, mantenemos al azar por ahora)
    if (puntajeHugo === 0 && puntajeSaul === 0) {
       const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
       jugadorActual = JUGADORES[indiceAleatorio];
    } else {
        // Para simplificar, sigue eligiendo al azar o podría alternar
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
         // Alternativa: Empieza el que no ganó la última ronda (si hubo ganador)
         // O simplemente alterna: jugadorActual = jugadorActual === JUGADORES[0] ? JUGADORES[1] : JUGADORES[0];
    }


    pantallaInicial.classList.add('oculto'); // Asegura que la pantalla inicial esté oculta
    pantallaGanador.classList.add('oculto'); // Asegura que la pantalla de ganador esté oculta
    juegoContenedor.classList.remove('oculto');
    botonReiniciar.classList.add('oculto'); // Oculta botón "Siguiente Ronda" al inicio de la ronda
    botonNuevoJuego.classList.add('oculto'); // Oculta botón "Nuevo Juego" al inicio de la ronda


    // Actualiza el display del marcador
    actualizarMarcadorDisplay();
    // Resalta la foto del jugador que empieza
    actualizarResaltadoFoto();

    const marcaInicial = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `Turno de: ${jugadorActual} (${marcaInicial})`; // Mensaje de turno normal

    celdas.forEach(celda => {
        celda.innerHTML = '';
        celda.classList.remove('ganadora');
        // Asegurarse de limpiar listeners viejos y añadir nuevos
        celda.replaceWith(celda.cloneNode(true)); // Clonar nodo es una forma fácil de quitar listeners
    });
    // Volver a obtener referencias a las celdas clonadas y añadir listeners
    const nuevasCeldas = document.querySelectorAll('.celda');
    nuevasCeldas.forEach(celda => {
        celda.addEventListener('click', manejarClickCelda, { once: true });
    });


    console.log(`Ronda iniciada. Empieza: ${jugadorActual}. Marcador: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);
}

/**
 * Maneja el evento de clic en una celda.
 */
function manejarClickCelda(evento) {
    if (!juegoActivo) return; // Si la ronda no está activa, no hacer nada

    const celdaClickeada = evento.target;
    // Asegurarse de que se obtiene el div.celda incluso si se hace clic en el span interior
     const celdaTarget = celdaClickeada.closest('.celda');
     if (!celdaTarget || !celdaTarget.hasAttribute('data-index')) return;


    const indiceCelda = parseInt(celdaTarget.getAttribute('data-index'));

    // Comprobar si la celda ya está ocupada (aunque {once: true} debería prevenirlo)
    if (estadoTablero[indiceCelda] !== '') return;

    const marcaActual = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    estadoTablero[indiceCelda] = marcaActual;
    celdaTarget.innerHTML = `<span class="marca-animada">${marcaActual}</span>`;

    console.log(`Celda ${indiceCelda} clickeada por ${jugadorActual}. Marca: ${marcaActual}`);

    if (comprobarVictoria(marcaActual)) {
        finalizarJuego(false); // Finalizar, no es empate
        return;
    }
    if (comprobarEmpate()) {
        finalizarJuego(true); // Finalizar, sí es empate
        return;
    }
    cambiarTurno();
}


/**
 * Comprueba si el jugador con la marca dada ha ganado la ronda.
 */
function comprobarVictoria(marca) {
    for (const combinacion of COMBINACIONES_GANADORAS) {
        const [a, b, c] = combinacion;
        if (estadoTablero[a] === marca && estadoTablero[b] === marca && estadoTablero[c] === marca) {
            // Necesitamos obtener las celdas actuales del DOM para resaltarlas
             const celdasActuales = document.querySelectorAll('.celda');
             resaltarCeldasGanadoras(combinacion, celdasActuales);
            return true;
        }
    }
    return false;
}

/**
 * Comprueba si la ronda ha terminado en empate.
 */
function comprobarEmpate() {
    return estadoTablero.every(celda => celda !== '');
}

/**
 * Cambia el turno al otro jugador, actualiza el mensaje y resalta la foto.
 */
function cambiarTurno() {
    jugadorActual = jugadorActual === JUGADORES[0] ? JUGADORES[1] : JUGADORES[0];
    const marcaSiguiente = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `Turno de: ${jugadorActual} (${marcaSiguiente})`;
    actualizarResaltadoFoto();
    console.log(`Turno cambiado a: ${jugadorActual}`);
}

/**
 * Finaliza la ronda actual.
 * Comprueba si alguien ha ganado el JUEGO COMPLETO.
 * Muestra resultado de la ronda y botón para siguiente ronda o pantalla de ganador final.
 */
function finalizarJuego(esEmpate) {
    juegoActivo = false; // La ronda ya no está activa
    actualizarResaltadoFoto(); // Quitar resaltado de fotos

     // Quitar listeners de las celdas actuales para evitar clics accidentales
     const celdasActuales = document.querySelectorAll('.celda');
     celdasActuales.forEach(celda => {
         celda.removeEventListener('click', manejarClickCelda);
         // Opcional: Cambiar cursor para indicar que no se puede clickear
         celda.style.cursor = 'default';
     });


    if (esEmpate) {
        infoTurno.textContent = "¡Empate en esta ronda!";
        console.log("Ronda finalizada: Empate.");
        botonReiniciar.classList.remove('oculto'); // Mostrar botón "Siguiente Ronda"
    } else {
        infoTurno.textContent = `¡${jugadorActual} gana la ronda! 🎉`;
        console.log(`Ronda finalizada: Ganador ${jugadorActual}.`);
        if (jugadorActual === 'Hugo') {
            puntajeHugo++;
        } else {
            puntajeSaul++;
        }
        actualizarMarcadorDisplay();
        console.log(`Marcador actualizado: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);

        // --- ¡NUEVA LÓGICA: COMPROBAR GANADOR DEL JUEGO! ---
        if (puntajeHugo === PUNTOS_PARA_GANAR || puntajeSaul === PUNTOS_PARA_GANAR) {
            console.log(`¡JUEGO TERMINADO! Ganador: ${jugadorActual}`);
            mostrarGanadorDelJuego(jugadorActual);
        } else {
            // Si nadie ha ganado el juego aún, mostrar botón para la siguiente ronda
            botonReiniciar.classList.remove('oculto');
        }
    }
}

/**
 * NUEVA FUNCIÓN: Muestra la pantalla de ganador del juego completo.
 */
function mostrarGanadorDelJuego(ganador) {
    textoGanadorElem.textContent = `¡EL CAMPEÓN ES ${ganador.toUpperCase()}!`;
    nombreGanadorElem.textContent = ganador.toUpperCase();

    // Establecer la foto correcta
    if (ganador === 'Hugo') {
        fotoGanadorElem.src = 'img/jugadores/hugo.png';
        fotoGanadorElem.alt = 'Foto Hugo';
    } else {
        fotoGanadorElem.src = 'img/jugadores/saul.png';
        fotoGanadorElem.alt = 'Foto Saúl';
    }

    // Ocultar contenedor del juego y mostrar pantalla de ganador
    juegoContenedor.classList.add('oculto');
    pantallaGanador.classList.remove('oculto');

    // Mostrar el botón para empezar un nuevo juego completo
    botonNuevoJuego.classList.remove('oculto');
     // Ocultar explícitamente el botón de siguiente ronda por si acaso
     botonReiniciar.classList.add('oculto');
}

/**
 * NUEVA FUNCIÓN: Reinicia todo para un juego completamente nuevo.
 */
function iniciarNuevoJuegoCompleto() {
    console.log("Iniciando nuevo juego completo...");
    // Resetear puntuaciones
    puntajeHugo = 0;
    puntajeSaul = 0;
    actualizarMarcadorDisplay(); // Actualizar display a 0-0

    // Ocultar pantalla de ganador y botón de nuevo juego
    pantallaGanador.classList.add('oculto');
    botonNuevoJuego.classList.add('oculto');

    // Mostrar el contenedor del juego e iniciar la primera ronda
    juegoContenedor.classList.remove('oculto');
    iniciarRonda(); // Iniciar la primera ronda del nuevo juego
}


/**
 * Añade una clase a las celdas ganadoras para resaltarlas.
 * Acepta la lista de celdas actuales como argumento.
 */
 function resaltarCeldasGanadoras(combinacion, celdasDOM) {
    combinacion.forEach(indice => {
        if(celdasDOM[indice]) {
            celdasDOM[indice].classList.add('ganadora');
        } else {
            console.error("Índice de celda fuera de rango al resaltar:", indice);
        }
    });
}


// --- Event Listeners Iniciales ---
botonComenzar.addEventListener('click', iniciarRonda); // Ahora inicia la primera ronda
botonReiniciar.addEventListener('click', iniciarRonda); // Botón entre rondas
botonNuevoJuego.addEventListener('click', iniciarNuevoJuegoCompleto); // NUEVO listener para el juego completo

// --- Fin del script ---
