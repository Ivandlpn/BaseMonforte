// --- Referencias a Elementos del DOM ---
const botonComenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');
const juegoContenedor = document.getElementById('juego-contenedor');
const infoTurno = document.getElementById('info-turno');
// Eliminamos la referencia global 'celdas' ya que la obtendremos dinámicamente
// const celdas = document.querySelectorAll('.celda'); // Ya no es necesaria aquí
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
 * Limpia el tablero visualmente, resetea el estado interno y asigna listeners.
 * No resetea los puntajes globales.
 */
function iniciarRonda() {
    estadoTablero = ['', '', '', '', '', '', '', '', '']; // Resetea estado interno
    juegoActivo = true;

    // Lógica para decidir quién empieza (ej. al azar)
    if (puntajeHugo === 0 && puntajeSaul === 0 || Math.random() < 0.5 ) { // Empieza al azar en la 1ra o 50% de las veces
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
    } else {
        // Podría alternar o empezar el que perdió la anterior, mantenemos al azar por simplicidad
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
    }

    // Gestionar visibilidad de pantallas y botones
    pantallaInicial.classList.add('oculto');
    pantallaGanador.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');
    botonReiniciar.classList.add('oculto');
    botonNuevoJuego.classList.add('oculto');

    actualizarMarcadorDisplay(); // Actualizar 0-0 al principio o puntajes actuales
    actualizarResaltadoFoto(); // Resaltar foto del que empieza

    const marcaInicial = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `Turno de: ${jugadorActual} (${marcaInicial})`;

    // --- CORRECTO: Limpiar tablero y añadir listeners ---
    // 1. Obtener TODAS las celdas actuales en el DOM dentro del tablero
    const tablero = document.getElementById('tablero');
    const celdasActuales = tablero.querySelectorAll('.celda');

    // 2. Iterar sobre ellas para limpiarlas y preparar listeners
    celdasActuales.forEach(celda => {
        // a. Limpiar contenido visual y clases de estado
        celda.innerHTML = '';
        celda.classList.remove('ganadora');
        celda.style.cursor = 'pointer'; // Asegurar cursor correcto

        // b. Reemplazar la celda con un clon para eliminar listeners antiguos de forma segura
        const celdaClonada = celda.cloneNode(true); // Clon profundo
        celda.replaceWith(celdaClonada);

        // c. Añadir el nuevo listener a la celda clonada (que ahora está en el DOM)
        celdaClonada.addEventListener('click', manejarClickCelda, { once: true });
    });
    // --- Fin de la limpieza y configuración de listeners ---

    console.log(`Ronda iniciada. Empieza: ${jugadorActual}. Marcador: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);
}


/**
 * Maneja el evento de clic en una celda.
 */
function manejarClickCelda(evento) {
    if (!juegoActivo) return;

    const celdaClickeada = evento.target;
    const celdaTarget = celdaClickeada.closest('.celda'); // Asegura obtener el DIV .celda

    if (!celdaTarget || !celdaTarget.hasAttribute('data-index')) return;

    const indiceCelda = parseInt(celdaTarget.getAttribute('data-index'));

    if (estadoTablero[indiceCelda] !== '') return; // Doble chequeo por si acaso

    const marcaActual = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    estadoTablero[indiceCelda] = marcaActual;
    celdaTarget.innerHTML = `<span class="marca-animada">${marcaActual}</span>`;
    celdaTarget.style.cursor = 'default'; // Ya no se puede clicar en esta celda en esta ronda

    console.log(`Celda ${indiceCelda} clickeada por ${jugadorActual}. Marca: ${marcaActual}`);

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
 * Comprueba si el jugador con la marca dada ha ganado la ronda.
 */
function comprobarVictoria(marca) {
    // Obtener las celdas *actuales* del DOM cada vez que se comprueba
    const celdasDOM = document.querySelectorAll('.celda');
    for (const combinacion of COMBINACIONES_GANADORAS) {
        const [a, b, c] = combinacion;
        if (estadoTablero[a] === marca && estadoTablero[b] === marca && estadoTablero[c] === marca) {
             resaltarCeldasGanadoras(combinacion, celdasDOM); // Pasa las celdas actuales
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
    juegoActivo = false;
    actualizarResaltadoFoto(); // Quitar resaltado

     // Deshabilitar clics en todas las celdas (cambiando cursor)
     const celdasFinalizadas = document.querySelectorAll('.celda');
     celdasFinalizadas.forEach(celda => {
         celda.style.cursor = 'default';
         // Opcional: Remover listeners explícitamente aunque 'once' ayuda
         // celda.removeEventListener('click', manejarClickCelda);
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
            // Esperar un poco para que se vea el tablero final antes de la pantalla de ganador
            setTimeout(() => {
                 mostrarGanadorDelJuego(jugadorActual);
            }, 1500); // Espera 1.5 segundos (ajusta si quieres)

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

    if (ganador === 'Hugo') {
        fotoGanadorElem.src = 'img/jugadores/hugo.png';
        fotoGanadorElem.alt = 'Foto Hugo';
    } else {
        fotoGanadorElem.src = 'img/jugadores/saul.png';
        fotoGanadorElem.alt = 'Foto Saúl';
    }

    juegoContenedor.classList.add('oculto');
    pantallaGanador.classList.remove('oculto');
    botonNuevoJuego.classList.remove('oculto'); // Mostrar botón Nuevo Juego
    botonReiniciar.classList.add('oculto'); // Ocultar Siguiente Ronda
}

/**
 * NUEVA FUNCIÓN: Reinicia todo para un juego completamente nuevo.
 */
function iniciarNuevoJuegoCompleto() {
    console.log("Iniciando nuevo juego completo...");
    puntajeHugo = 0;
    puntajeSaul = 0;
    // No es necesario actualizar display aquí, iniciarRonda lo hará

    pantallaGanador.classList.add('oculto');
    botonNuevoJuego.classList.add('oculto');
    // Asegurarse de que el contenedor del juego sea visible si estaba oculto
    juegoContenedor.classList.remove('oculto');

    iniciarRonda(); // Iniciar la primera ronda del nuevo juego
}


/**
 * Añade una clase a las celdas ganadoras para resaltarlas.
 * Acepta la lista de celdas actuales (nodos DOM) como argumento.
 */
 function resaltarCeldasGanadoras(combinacion, celdasDOM) {
    combinacion.forEach(indice => {
        // Validar que el índice exista en la colección de nodos DOM pasada
        if(celdasDOM && celdasDOM[indice]) {
            celdasDOM[indice].classList.add('ganadora');
        } else {
            console.error("Índice de celda fuera de rango o celdasDOM no válido al resaltar:", indice);
        }
    });
}


// --- Event Listeners Iniciales ---
botonComenzar.addEventListener('click', iniciarRonda);
botonReiniciar.addEventListener('click', iniciarRonda); // Botón entre rondas
botonNuevoJuego.addEventListener('click', iniciarNuevoJuegoCompleto);

// --- Fin del script ---
