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
        iniciarJuego(); // Llama a iniciar la partida individual
    }
}

/** Inicia el proceso de selección de fichas (y resetea puntajes si se indica) */
function iniciarProcesoSeleccion(reiniciarPuntajes = false) {
    console.log(`Iniciando selección. Reiniciar puntajes: ${reiniciarPuntajes}`);
    if (reiniciarPuntajes) {
        puntajeHugo = 0;
        puntajeSaul = 0;
        console.log("Puntajes del partido reseteados a 0.");
    }

    // Resetear variables de estado de juego y selección
    fichaHugo = null;
    fichaSaul = null;
    juegoActivo = false;
    procesandoClick = false;
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
    infoTurno.classList.remove('partido-ganado'); // Quitar estilo especial

    actualizarMarcadorDisplay(); // Mostrar puntajes (reseteados o no)
    actualizarResaltadoFoto(); // Quitar resaltado fotos
}

/** Actualiza la visualización del marcador (puntajes). */
function actualizarMarcadorDisplay() {
    puntajeHugoElem.textContent = puntajeHugo;
    puntajeSaulElem.textContent = puntajeSaul;
}

/** Resalta la foto del jugador activo y quita el resaltado del otro. */
function actualizarResaltadoFoto() {
    if (!juegoActivo) { // Si el juego NO está activo, quitar ambos
         fotoHugoElem.classList.remove('activa');
         fotoSaulElem.classList.remove('activa');
         return;
    }
    // Si el juego SÍ está activo, resaltar el actual
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
    console.log("Iniciando nueva partida (tablero).");
    pantallaSeleccion.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');
    estadoTablero = [null, null, null, null, null, null, null, null, null];
    juegoActivo = true;
    procesandoClick = false;

    // Elegir jugador inicial aleatoriamente
    const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
    jugadorActual = JUGADORES[indiceAleatorio];

    botonReiniciar.classList.add('oculto');
    infoTurno.classList.remove('partido-ganado'); // Asegurar quitar estilo

    actualizarMarcadorDisplay();
    actualizarResaltadoFoto(); // Resaltar al que empieza

    infoTurno.textContent = `¡Empieza ${jugadorActual}! Te toca.`;

    // Limpiar celdas y re-añadir listeners
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
    if (!juegoActivo || procesandoClick) {
        console.log(`Clic ignorado: juegoActivo=${juegoActivo}, procesandoClick=${procesandoClick}`);
        return;
    }
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
        console.warn(`Celda ${indiceCelda} ya ocupada.`);
        procesandoClick = false;
        return; // {once:true} debería prevenir esto, pero por si acaso
    }

    const jugadorQueJugo = jugadorActual;
    estadoTablero[indiceCelda] = jugadorQueJugo;
    const fichaAColocar = jugadorQueJugo === JUGADORES[0] ? fichaHugo : fichaSaul;
    celdaClickeada.innerHTML = `<img src="${RUTA_FICHAS}${fichaAColocar}" alt="Ficha ${jugadorQueJugo}" class="ficha-en-tablero">`;
    console.log(`Celda ${indiceCelda} marcada por ${jugadorQueJugo}`);

    // Comprobar resultado
    if (comprobarVictoria(jugadorQueJugo)) {
        finalizarJuego(false); // false = no es empate
        return; // finalizarJuego maneja procesandoClick
    }
    if (comprobarEmpate()) {
        finalizarJuego(true); // true = es empate
        return; // finalizarJuego maneja procesandoClick
    }

    // Si no hay fin, cambiar turno
    cambiarTurno();
    procesandoClick = false; // Desbloquear clics para el siguiente turno
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
    console.log(`Cambiando turno. ANTES: ${jugadorActual}`);
    jugadorActual = (jugadorActual === JUGADORES[0]) ? JUGADORES[1] : JUGADORES[0];
    infoTurno.textContent = `Turno de: ${jugadorActual}`;
    actualizarResaltadoFoto();
    console.log(`Turno cambiado. DESPUÉS: ${jugadorActual}`);
}

/** Finaliza la partida actual y comprueba si se ganó el PARTIDO */
function finalizarJuego(esEmpate) {
    console.log(`Finalizando juego. Empate: ${esEmpate}`);
    juegoActivo = false;
    procesandoClick = false; // Asegurar desbloqueo

    // Quitar listeners restantes (como doble seguridad a {once: true})
    celdas.forEach(celda => {
        celda.removeEventListener('click', manejarClickCelda);
    });
    actualizarResaltadoFoto(); // Quitar resaltados de fotos

    let mensajeFinal = "";
    let partidoGanado = false; // Flag para saber si se ganó el partido completo

    if (esEmpate) {
        mensajeFinal = "¡Vaya! Partida en empate.";
        console.log("Partida finalizada: Empate.");
    } else {
        // Ganador de la PARTIDA individual (el que hizo el último movimiento)
        const ganadorPartida = jugadorActual;
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

// Función que se ejecuta al hacer clic en "Jugar de Nuevo"
function manejarClickReiniciar() {
    console.log("Botón Reiniciar presionado.");
    // Comprobar si el partido había terminado (puntaje llegó al límite)
    const reiniciarPuntajes = (puntajeHugo === PUNTOS_PARA_GANAR_PARTIDO || puntajeSaul === PUNTOS_PARA_GANAR_PARTIDO);
    // Volver a la pantalla de selección, reseteando puntajes si es necesario
    iniciarProcesoSeleccion(reiniciarPuntajes);
}

/** Añade clase ganadora a las celdas */
function resaltarCeldasGanadoras(combinacion) {
    combinacion.forEach(indice => {
        if(celdas[indice]) { celdas[indice].classList.add('ganadora'); }
        else { console.error("Índice de celda fuera de rango:", indice); }
    });
}

// --- Event Listeners Iniciales (Se añaden una sola vez) ---
// Al empezar desde portada, SIEMPRE resetear puntajes
botonComenzar.addEventListener('click', () => iniciarProcesoSeleccion(true));
// El botón reiniciar SIEMPRE llama a manejarClickReiniciar
botonReiniciar.addEventListener('click', manejarClickReiniciar);

// --- Fin del script ---
