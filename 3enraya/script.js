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
const PUNTOS_PARA_GANAR_PARTIDO = 3; // Límite de puntos
// **Usa tu lista actualizada aquí**
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
// Eliminamos procesandoClick por simplicidad, confiando en juegoActivo y {once:true}
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
    console.log("Iniciando proceso de selección. Reseteando puntajes.");
    // Resetear puntajes SIEMPRE al volver a selección
    puntajeHugo = 0;
    puntajeSaul = 0;

    // Resetear variables de estado
    fichaHugo = null;
    fichaSaul = null;
    juegoActivo = false; // Asegurar que juego no está activo
    estadoTablero = [null, null, null, null, null, null, null, null, null];

    // UI: Resetear selección
    fichasElegidasContenedor.classList.add('oculto');
    fichaElegidaHugoImg.src = "";
    fichaElegidaSaulImg.src = "";
    jugadorSeleccionando = JUGADORES[0];
    tituloSeleccionElem.textContent = `Hola Hugo y Saúl`;
    instruccionSeleccionElem.textContent = `Elige tu ficha, ${jugadorSeleccionando}`;
    mostrarFichasParaSeleccion();

    // UI: Gestionar pantallas y botón
    pantallaInicial.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaSeleccion.classList.remove('oculto');
    botonReiniciar.classList.add('oculto');
    infoTurno.classList.remove('partido-ganado'); // Quitar estilo especial

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
    // Siempre quitar ambos primero para evitar estados inconsistentes
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
    console.log("Iniciando nueva partida (tablero).");
    pantallaSeleccion.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');
    estadoTablero = [null, null, null, null, null, null, null, null, null];
    juegoActivo = true; // Marcar juego como activo

    // Elegir jugador inicial aleatoriamente
    const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
    jugadorActual = JUGADORES[indiceAleatorio];

    botonReiniciar.classList.add('oculto');
    infoTurno.classList.remove('partido-ganado'); // Asegurar quitar estilo

    actualizarMarcadorDisplay(); // Mostrar puntajes actuales
    actualizarResaltadoFoto(); // Resaltar al que empieza

    infoTurno.textContent = `¡Empieza ${jugadorActual}! Te toca.`;

    // Limpiar celdas y re-añadir listeners
    celdas.forEach(celda => {
        celda.innerHTML = '';
        celda.classList.remove('ganadora');
        celda.removeEventListener('click', manejarClickCelda); // Limpiar por seguridad
        celda.addEventListener('click', manejarClickCelda, { once: true }); // Re-añadir con once
    });
    console.log(`Partida iniciada. Empieza: ${jugadorActual}.`);
}

/** Maneja el evento de clic en una celda del tablero */
function manejarClickCelda(evento) {
    if (!juegoActivo) { // Solo procesar si el juego está activo
        console.log(`Clic ignorado: juegoActivo=${juegoActivo}`);
        return;
    }

    let celdaClickeada = evento.target;
    if (celdaClickeada.tagName === 'IMG' && celdaClickeada.parentElement.classList.contains('celda')) {
        celdaClickeada = celdaClickeada.parentElement;
    }
    if (!celdaClickeada.classList.contains('celda') || !celdaClickeada.hasAttribute('data-index')) {
        return; // Clic inválido
    }
    const indiceCelda = parseInt(celdaClickeada.getAttribute('data-index'));

    // Verificar si la celda está ocupada lógicamente
    if (estadoTablero[indiceCelda] !== null) {
        console.warn(`Celda ${indiceCelda} ya ocupada.`);
        // El listener ya se quitó con {once: true}
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
        finalizarJuego(false); // false = no es empate
    } else if (comprobarEmpate()) {
        finalizarJuego(true); // true = es empate
    } else {
        // Si no hay fin, cambiar turno para el SIGUIENTE clic
        cambiarTurno();
    }
}

/** Comprueba si el jugador dado ha ganado la partida */
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

/** Comprueba si hay empate */
function comprobarEmpate() {
    return estadoTablero.every(celda => celda !== null);
}

/** Cambia el turno al otro jugador */
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

    // Quitar listeners restantes (doble seguridad)
    celdas.forEach(celda => {
        celda.removeEventListener('click', manejarClickCelda);
    });
    actualizarResaltadoFoto(); // Quitar resaltado fotos

    let mensajeFinal = "";
    let partidoGanado = false; // Flag local

    if (esEmpate) {
        mensajeFinal = "¡Vaya! Partida en empate.";
        console.log("Partida finalizada: Empate.");
    } else {
        // Ganador de la PARTIDA individual
        const ganadorPartida = jugadorActual; // El que hizo el último movimiento
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

        // Comprobar si se ganó el PARTIDO COMPLETO
        if (puntajeHugo === PUNTOS_PARA_GANAR_PARTIDO || puntajeSaul === PUNTOS_PARA_GANAR_PARTIDO) {
            partidoGanado = true; // Marcar que el partido terminó
            mensajeFinal = `¡¡${ganadorPartida} HA GANADO EL PARTIDO ${puntajeHugo} - ${puntajeSaul}!! 🏆🎉`;
            infoTurno.classList.add('partido-ganado'); // Aplicar estilo especial
            console.log(`¡PARTIDO TERMINADO! Ganador: ${ganadorPartida}`);
        }
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

// --- Event Listeners Iniciales (Se añaden una sola vez) ---
// Al empezar desde portada, SIEMPRE iniciar proceso de selección reseteando puntajes
botonComenzar.addEventListener('click', () => iniciarProcesoSeleccion(true));
// El botón reiniciar SIEMPRE inicia proceso de selección (que resetea puntajes)
botonReiniciar.addEventListener('click', () => iniciarProcesoSeleccion(true)); // Simplificado: siempre resetea

// --- Fin del script ---
