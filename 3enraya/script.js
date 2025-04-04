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
// Asegúrate que esta lista coincide con la última que me diste
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

/** Inicia el proceso de selección de fichas (y resetea puntajes si se llama desde Reiniciar) */
function iniciarProcesoSeleccion(reiniciarPuntajes = false) {
    if (reiniciarPuntajes) {
        puntajeHugo = 0;
        puntajeSaul = 0;
        console.log("Puntajes del partido reseteados a 0.");
    }

    fichaHugo = null;
    fichaSaul = null;
    juegoActivo = false;
    procesandoClick = false;
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
    infoTurno.classList.remove('partido-ganado'); // Quitar estilo de partido ganado
    actualizarMarcadorDisplay(); // Mostrar puntajes (reseteados o no)
    actualizarResaltadoFoto(); // Quitar resaltado
}


/** Actualiza la visualización del marcador (puntajes). */
function actualizarMarcadorDisplay() {
    puntajeHugoElem.textContent = puntajeHugo;
    puntajeSaulElem.textContent = puntajeSaul;
}

/** Resalta la foto del jugador activo y quita el resaltado del otro. */
function actualizarResaltadoFoto() {
    if (!juegoActivo) {
         fotoHugoElem.classList.remove('activa');
         fotoSaulElem.classList.remove('activa');
         return;
    }
    if (jugadorActual === JUGADORES[0]) {
        fotoHugoElem.classList.add('activa');
        fotoSaulElem.classList.remove('activa');
    } else {
        fotoSaulElem.classList.add('activa');
        fotoHugoElem.classList.remove('activa');
    }
}

/** Inicia una nueva PARTIDA del juego (tablero) */
function iniciarJuego() {
    pantallaSeleccion.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');
    estadoTablero = [null, null, null, null, null, null, null, null, null];
    juegoActivo = true;
    procesandoClick = false;
    const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
    jugadorActual = JUGADORES[indiceAleatorio];
    botonReiniciar.classList.add('oculto');
    infoTurno.classList.remove('partido-ganado'); // Quitar estilo por si acaso
    actualizarMarcadorDisplay();
    actualizarResaltadoFoto();
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
    if (!juegoActivo || procesandoClick) return;
    procesandoClick = true;

    let celdaClickeada = evento.target;
    if (celdaClickeada.tagName === 'IMG' && celdaClickeada.parentElement.classList.contains('celda')) {
        celdaClickeada = celdaClickeada.parentElement;
    }
    if (!celdaClickeada.classList.contains('celda') || !celdaClickeada.hasAttribute('data-index')) {
        procesandoClick = false; return;
    }
    const indiceCelda = parseInt(celdaClickeada.getAttribute('data-index'));

    if (estadoTablero[indiceCelda] !== null) {
        procesandoClick = false;
        celdaClickeada.removeEventListener('click', manejarClickCelda); // Seguridad extra
        return;
    }

    const jugadorQueJugo = jugadorActual;
    estadoTablero[indiceCelda] = jugadorQueJugo;
    const fichaAColocar = jugadorQueJugo === JUGADORES[0] ? fichaHugo : fichaSaul;
    celdaClickeada.innerHTML = `<img src="${RUTA_FICHAS}${fichaAColocar}" alt="Ficha ${jugadorQueJugo}" class="ficha-en-tablero">`;

    if (comprobarVictoria(jugadorQueJugo)) {
        finalizarJuego(false); // Pasar false (no es empate)
        return; // Importante salir aquí
    }
    if (comprobarEmpate()) {
        finalizarJuego(true); // Pasar true (es empate)
        return; // Importante salir aquí
    }

    cambiarTurno();
    procesandoClick = false;
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
}

/** Finaliza la partida actual y comprueba si se ganó el PARTIDO */
function finalizarJuego(esEmpate) {
    juegoActivo = false;
    procesandoClick = false;
    celdas.forEach(celda => {
        celda.removeEventListener('click', manejarClickCelda);
    });
    actualizarResaltadoFoto(); // Quitar resaltados

    let mensajeFinal = "";
    let partidoTerminado = false;

    if (esEmpate) {
        mensajeFinal = "¡Vaya! Partida en empate.";
        console.log("Partida finalizada: Empate.");
    } else {
        // Hubo un ganador de la PARTIDA
        const ganadorPartida = jugadorActual; // jugadorActual es el que hizo el último movimiento ganador
        mensajeFinal = `¡${ganadorPartida} gana la partida!`;
        console.log(`Partida finalizada: Ganador ${ganadorPartida}.`);

        // Actualizar puntaje
        if (ganadorPartida === JUGADORES[0]) {
            puntajeHugo++;
        } else {
            puntajeSaul++;
        }
        actualizarMarcadorDisplay();
        console.log(`Marcador actualizado: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);

        // Comprobar si se ganó el PARTIDO
        if (puntajeHugo === PUNTOS_PARA_GANAR_PARTIDO || puntajeSaul === PUNTOS_PARA_GANAR_PARTIDO) {
            partidoTerminado = true;
            mensajeFinal = `¡¡${ganadorPartida} HA GANADO EL PARTIDO ${puntajeHugo} - ${puntajeSaul}!! 🏆🎉`;
            infoTurno.classList.add('partido-ganado'); // Añadir clase para estilo especial
            console.log(`¡PARTIDO TERMINADO! Ganador: ${ganadorPartida}`);
            // Opcional: Cambiar texto del botón reiniciar a "Nuevo Partido"
            // botonReiniciar.textContent = "Nuevo Partido";
        }
    }

    infoTurno.textContent = mensajeFinal; // Mostrar mensaje final (de partida o partido)
    botonReiniciar.classList.remove('oculto'); // Mostrar botón

    // Si el partido terminó, el botón "Jugar de Nuevo" debería idealmente resetear los puntajes.
    // Modificamos el listener para que pase un argumento indicando si debe resetear.
    botonReiniciar.removeEventListener('click', manejarClickReiniciar); // Quitar listener viejo
    botonReiniciar.addEventListener('click', manejarClickReiniciar); // Añadir nuevo
}

// NUEVA Función wrapper para manejar el clic de reinicio
function manejarClickReiniciar() {
    // Comprobamos si el último estado fue una victoria de partido
    const partidoTerminadoCheck = (puntajeHugo === PUNTOS_PARA_GANAR_PARTIDO || puntajeSaul === PUNTOS_PARA_GANAR_PARTIDO);
    // Llamamos a iniciarProcesoSeleccion, pasando true si el partido había terminado
    iniciarProcesoSeleccion(partidoTerminadoCheck);
}


/** Añade clase ganadora a las celdas */
function resaltarCeldasGanadoras(combinacion) {
    combinacion.forEach(indice => {
        if(celdas[indice]) { celdas[indice].classList.add('ganadora'); }
        else { console.error("Índice de celda fuera de rango:", indice); }
    });
}

// --- Event Listeners Iniciales ---
botonComenzar.addEventListener('click', () => iniciarProcesoSeleccion(true)); // Al empezar desde portada, SIEMPRE resetear puntajes
// El listener del botón reiniciar se añade/actualiza en finalizarJuego

// --- Fin del script ---
