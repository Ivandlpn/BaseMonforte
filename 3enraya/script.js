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
const FICHAS_DISPONIBLES = ['X.png', 'O.png', 'pinar.png', 'torremolinos.png','malaga.png','andalucia.png','barca.png','españa.png','local.png','madrid.png','nacional.png','sevilla.png'];
const RUTA_FICHAS = 'img/fichas/';

let jugadorActual; // Quién tiene el turno AHORA ('Hugo' o 'Saúl')
let jugadorSeleccionando; // Quién está eligiendo ficha
let fichaHugo = null; // Nombre archivo ficha Hugo
let fichaSaul = null; // Nombre archivo ficha Saúl
let juegoActivo = false;
// Estado: null (vacío), 'Hugo', o 'Saúl'
let estadoTablero = [null, null, null, null, null, null, null, null, null];
let puntajeHugo = 0;
let puntajeSaul = 0;

// Combinaciones ganadoras (índices)
const COMBINACIONES_GANADORAS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// --- Funciones de Selección de Fichas ---

function mostrarFichasParaSeleccion() {
    contenedorFichasElem.innerHTML = '';
    FICHAS_DISPONIBLES.forEach(nombreFicha => {
        const imgFicha = document.createElement('img');
        imgFicha.src = RUTA_FICHAS + nombreFicha;
        imgFicha.alt = `Ficha ${nombreFicha.split('.')[0]}`;
        imgFicha.classList.add('ficha-seleccionable');
        imgFicha.dataset.filename = nombreFicha;

        // ¿Ya fue elegida por el OTRO jugador?
        const fichaYaElegidaPorOtro = (jugadorSeleccionando === JUGADORES[1] && nombreFicha === fichaHugo);
        if (fichaYaElegidaPorOtro) {
            imgFicha.classList.add('seleccionada'); // Marcar como no seleccionable
        } else {
            // Si NO está seleccionada por el otro, añadir listener
            imgFicha.removeEventListener('click', manejarSeleccionFicha); // Limpiar por si acaso
            imgFicha.addEventListener('click', manejarSeleccionFicha);
        }
        contenedorFichasElem.appendChild(imgFicha);
    });
}

function manejarSeleccionFicha(evento) {
    const fichaClickeada = evento.target;
    if (fichaClickeada.classList.contains('seleccionada')) return;

    const nombreFichaSeleccionada = fichaClickeada.dataset.filename;

    if (jugadorSeleccionando === JUGADORES[0]) { // Hugo
        fichaHugo = nombreFichaSeleccionada;
        fichaElegidaHugoImg.src = RUTA_FICHAS + fichaHugo;
        jugadorSeleccionando = JUGADORES[1]; // Pasa a Saúl
        instruccionSeleccionElem.textContent = `Elige tu ficha, ${jugadorSeleccionando}`;
        mostrarFichasParaSeleccion(); // Actualizar para deshabilitar la de Hugo
        fichasElegidasContenedor.classList.remove('oculto');
    } else { // Saúl
        fichaSaul = nombreFichaSeleccionada;
        fichaElegidaSaulImg.src = RUTA_FICHAS + fichaSaul;
        // Ambos han elegido -> Iniciar juego
        pantallaSeleccion.classList.add('oculto');
        iniciarJuegoTablero(); // Llamar a la función que configura el tablero
    }
}

function iniciarProcesoSeleccion() {
    console.log("Iniciando Proceso Selección");
    // Resetear selección y estado de juego
    fichaHugo = null;
    fichaSaul = null;
    juegoActivo = false;
    estadoTablero = Array(9).fill(null); // Resetear tablero lógico
    jugadorActual = null;

    fichasElegidasContenedor.classList.add('oculto');
    fichaElegidaHugoImg.src = "";
    fichaElegidaSaulImg.src = "";
    jugadorSeleccionando = JUGADORES[0]; // Hugo empieza

    tituloSeleccionElem.textContent = `Hola Hugo y Saúl`;
    instruccionSeleccionElem.textContent = `Elige tu ficha, ${jugadorSeleccionando}`;
    mostrarFichasParaSeleccion();

    // Mostrar/Ocultar pantallas
    pantallaInicial.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaSeleccion.classList.remove('oculto');
    botonReiniciar.classList.add('oculto');
    actualizarResaltadoFoto(); // Quitar resaltado fotos
}

// --- Funciones del Juego Principal (Basadas en el código que funcionaba) ---

/** Actualiza la visualización del marcador (puntajes). */
function actualizarMarcadorDisplay() {
    puntajeHugoElem.textContent = puntajeHugo;
    puntajeSaulElem.textContent = puntajeSaul;
}

/** Resalta la foto del jugador activo y quita el resaltado del otro. */
function actualizarResaltadoFoto() {
    if (!jugadorActual) { // Si no hay jugador (inicio/fin)
        fotoHugoElem.classList.remove('activa');
        fotoSaulElem.classList.remove('activa');
        return;
    }
    fotoHugoElem.classList.toggle('activa', jugadorActual === JUGADORES[0]);
    fotoSaulElem.classList.toggle('activa', jugadorActual === JUGADORES[1]);
}

/** Prepara e inicia una partida en el tablero (llamada DESPUÉS de selección) */
function iniciarJuegoTablero() {
    console.log("Iniciando Juego Tablero");
    estadoTablero = Array(9).fill(null); // Asegurar reset tablero lógico
    juegoActivo = true;

    // Elegir jugador inicial aleatorio para ESTA partida
    const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
    jugadorActual = JUGADORES[indiceAleatorio];
    console.log(`Primer turno para: ${jugadorActual}`);

    // Actualizar interfaz
    juegoContenedor.classList.remove('oculto'); // Mostrar tablero
    botonReiniciar.classList.add('oculto');
    actualizarMarcadorDisplay();
    actualizarResaltadoFoto(); // Resaltar foto del que empieza
    infoTurno.textContent = `¡Empieza ${jugadorActual}! Te toca.`;

    // Preparar celdas: limpiar y añadir listeners
    celdas.forEach(celda => {
        celda.innerHTML = ''; // Limpiar (quita imágenes previas)
        celda.classList.remove('ganadora'); // Quitar estilo ganador

        // Gestionar listeners CUIDADOSAMENTE
        celda.removeEventListener('click', manejarClickCelda); // Siempre quitar el viejo
        celda.addEventListener('click', manejarClickCelda, { once: true }); // Añadir nuevo con auto-eliminación
    });
    console.log("Listeners de celdas añadidos para la partida.");
}

/** Maneja el evento de clic en una celda del tablero */
function manejarClickCelda(evento) {
    console.log(`--- Click en Celda --- (Jugador actual ANTES: ${jugadorActual})`);
    // Validaciones básicas
    if (!juegoActivo) {
        console.warn("Clic ignorado: juego inactivo.");
        return;
    }

    let celdaClickeada = evento.target;
    // Asegurar que es el DIV.celda
    if (!celdaClickeada.classList.contains('celda')) {
        celdaClickeada = celdaClickeada.closest('.celda'); // Intentar subir al padre .celda
    }
    // Si sigue sin ser una celda válida, salir
    if (!celdaClickeada || !celdaClickeada.hasAttribute('data-index')) {
         console.error("Clic en elemento no válido dentro del tablero.");
         return;
    }

    const indiceCelda = parseInt(celdaClickeada.getAttribute('data-index'));

    // Comprobación lógica: ¿Está ya ocupada en nuestro array?
    if (estadoTablero[indiceCelda] !== null) {
        console.warn(`Clic ignorado: Celda ${indiceCelda} ya ocupada por ${estadoTablero[indiceCelda]}.`);
        // Nota: El listener {once: true} debería haber prevenido esto, pero es una buena doble comprobación.
        return;
    }

    // --- Procesar movimiento ---
    const jugadorQueJugo = jugadorActual; // Guardar quién hizo este movimiento
    console.log(`Movimiento válido en celda ${indiceCelda} por ${jugadorQueJugo}`);

    // 1. Actualizar estado lógico
    estadoTablero[indiceCelda] = jugadorQueJugo;

    // 2. Actualizar estado visual (poner imagen)
    const fichaSrc = RUTA_FICHAS + (jugadorQueJugo === JUGADORES[0] ? fichaHugo : fichaSaul);
    celdaClickeada.innerHTML = `<img src="${fichaSrc}" alt="Ficha ${jugadorQueJugo}" class="ficha-en-tablero">`;

    // 3. Comprobar victoria
    if (comprobarVictoria(jugadorQueJugo)) {
        console.log(`VICTORIA de ${jugadorQueJugo}`);
        finalizarJuego(false); // Termina el juego (no es empate)
        return; // Salir, no cambiar turno
    }

    // 4. Comprobar empate (si no hubo victoria)
    if (comprobarEmpate()) {
        console.log("EMPATE");
        finalizarJuego(true); // Termina el juego (sí es empate)
        return; // Salir, no cambiar turno
    }

    // 5. Si no hay fin de juego -> Cambiar turno
    console.log("No hay fin de juego, cambiando turno...");
    cambiarTurno();
    console.log(`Turno cambiado a: ${jugadorActual}`);
}

/** Comprueba si el jugador (nombre) ha ganado */
function comprobarVictoria(jugador) {
    return COMBINACIONES_GANADORAS.some(combinacion => {
        // every comprueba si todos los índices de la combinación pertenecen al jugador
        const victoria = combinacion.every(index => estadoTablero[index] === jugador);
        if (victoria) {
            resaltarCeldasGanadoras(combinacion); // Resaltar si hay victoria
        }
        return victoria;
    });
}

/** Comprueba si hay empate (tablero lleno) */
function comprobarEmpate() {
    // every comprueba si ninguna celda es null
    return estadoTablero.every(celda => celda !== null);
}

/** Cambia el turno al otro jugador y actualiza la interfaz */
function cambiarTurno() {
    // Cambiar jugador lógicamente
    jugadorActual = (jugadorActual === JUGADORES[0]) ? JUGADORES[1] : JUGADORES[0];
    // Actualizar interfaz
    infoTurno.textContent = `Turno de: ${jugadorActual}`;
    actualizarResaltadoFoto();
}

/** Finaliza la partida actual */
function finalizarJuego(esEmpate) {
    console.log(`Finalizando juego. Empate: ${esEmpate}`);
    juegoActivo = false; // Marcar juego como inactivo

    // Quitar listeners restantes (por si acaso, aunque {once: true} debería haberlos quitado)
    celdas.forEach(celda => {
        celda.removeEventListener('click', manejarClickCelda);
    });

    actualizarResaltadoFoto(); // Quitar resaltado fotos

    if (esEmpate) {
        infoTurno.textContent = "¡Vaya! Ha sido un empate.";
    } else {
        // jugadorActual aquí es el GANADOR
        infoTurno.textContent = `¡Felicidades ${jugadorActual}! ¡Has ganado! 🎉`;
        // Actualizar puntaje
        if (jugadorActual === JUGADORES[0]) { puntajeHugo++; } else { puntajeSaul++; }
        actualizarMarcadorDisplay();
    }
    botonReiniciar.classList.remove('oculto'); // Mostrar botón para volver a selección
}

/** Añade clase ganadora a las celdas */
function resaltarCeldasGanadoras(combinacion) {
    combinacion.forEach(indice => {
        if(celdas[indice]) { celdas[indice].classList.add('ganadora'); }
    });
}

// --- Event Listeners Iniciales ---
// Ambos botones ahora inician el proceso de SELECCIÓN
botonComenzar.addEventListener('click', iniciarProcesoSeleccion);
botonReiniciar.addEventListener('click', iniciarProcesoSeleccion);

// --- Fin del script ---
