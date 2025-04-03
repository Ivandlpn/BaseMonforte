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
const FICHAS_DISPONIBLES = ['X.png', 'O.png', 'P_logo.png', 'escudo_torremolinos.png'];
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
            // Aseguramos quitar listener viejo antes de añadir (extra seguridad)
            imgFicha.removeEventListener('click', manejarSeleccionFicha);
            imgFicha.addEventListener('click', manejarSeleccionFicha); // No necesita 'once' aquí
        }
        contenedorFichasElem.appendChild(imgFicha);
    });
}

/** Maneja el clic sobre una ficha durante la selección */
function manejarSeleccionFicha(evento) {
    const fichaClickeada = evento.target;
    if (fichaClickeada.classList.contains('seleccionada')) return; // Ignorar si ya está deshabilitada

    const nombreFichaSeleccionada = fichaClickeada.dataset.filename;

    if (jugadorSeleccionando === JUGADORES[0]) { // Hugo elige
        fichaHugo = nombreFichaSeleccionada;
        fichaElegidaHugoImg.src = RUTA_FICHAS + fichaHugo;
        jugadorSeleccionando = JUGADORES[1];
        instruccionSeleccionElem.textContent = `Elige tu ficha, ${jugadorSeleccionando}`;
        mostrarFichasParaSeleccion(); // Actualiza visualización
        fichasElegidasContenedor.classList.remove('oculto');
    } else { // Saúl elige
        fichaSaul = nombreFichaSeleccionada;
        fichaElegidaSaulImg.src = RUTA_FICHAS + fichaSaul;
        pantallaSeleccion.classList.add('oculto'); // Ocultar selección
        iniciarJuego(); // Pasar al juego
    }
}

/** Inicia el proceso de selección de fichas */
function iniciarProcesoSeleccion() {
    console.log("--- Iniciando Proceso Selección ---");
    // Resetear TODO el estado relacionado con una partida
    fichaHugo = null;
    fichaSaul = null;
    juegoActivo = false;
    procesandoClick = false;
    estadoTablero = [null, null, null, null, null, null, null, null, null];
    jugadorActual = null; // Nadie tiene turno aún

    fichasElegidasContenedor.classList.add('oculto');
    fichaElegidaHugoImg.src = "";
    fichaElegidaSaulImg.src = "";
    jugadorSeleccionando = JUGADORES[0]; // Hugo empieza a elegir

    tituloSeleccionElem.textContent = `Hola Hugo y Saúl`;
    instruccionSeleccionElem.textContent = `Elige tu ficha, ${jugadorSeleccionando}`;
    mostrarFichasParaSeleccion();

    // Gestionar visibilidad
    pantallaInicial.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaSeleccion.classList.remove('oculto');
    botonReiniciar.classList.add('oculto');
    actualizarResaltadoFoto(); // Quitar resaltados
}

/** Actualiza la visualización del marcador (puntajes). */
function actualizarMarcadorDisplay() {
    puntajeHugoElem.textContent = puntajeHugo;
    puntajeSaulElem.textContent = puntajeSaul;
}

/** Resalta la foto del jugador activo y quita el resaltado del otro. */
function actualizarResaltadoFoto() {
    // Si no hay jugador actual (inicio o fin), quitar ambos
    if (!jugadorActual) {
        fotoHugoElem.classList.remove('activa');
        fotoSaulElem.classList.remove('activa');
        return;
    }
    // Resaltar el activo
    if (jugadorActual === JUGADORES[0]) {
        fotoHugoElem.classList.add('activa');
        fotoSaulElem.classList.remove('activa');
    } else {
        fotoSaulElem.classList.add('activa');
        fotoHugoElem.classList.remove('activa');
    }
}

/** Inicia una nueva partida del juego (tablero) */
function iniciarJuego() {
    console.log("--- Iniciando Juego (Tablero) ---");
    pantallaSeleccion.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');

    estadoTablero = [null, null, null, null, null, null, null, null, null];
    juegoActivo = true;
    procesandoClick = false; // Listo para el primer clic

    // Elegir jugador inicial aleatorio
    const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
    jugadorActual = JUGADORES[indiceAleatorio];
    console.log(`Primer jugador: ${jugadorActual}`);

    botonReiniciar.classList.add('oculto');
    actualizarMarcadorDisplay();
    actualizarResaltadoFoto();

    infoTurno.textContent = `¡Empieza ${jugadorActual}! Te toca.`;

    // Preparar celdas: Limpiar y añadir listeners CUIDADOSAMENTE
    celdas.forEach(celda => {
        celda.innerHTML = ''; // Limpiar contenido visual
        celda.classList.remove('ganadora'); // Quitar estilo ganador

        // *** GESTIÓN DE LISTENERS CRÍTICA ***
        // 1. Eliminar CUALQUIER listener de clic anterior explícitamente.
        //    Es vital para evitar duplicados si algo salió mal antes.
        celda.removeEventListener('click', manejarClickCelda);

        // 2. Añadir el nuevo listener con { once: true }.
        //    Esto asegura que UNA VEZ que esta celda se clickea y el handler
        //    se ejecuta, este listener específico se auto-elimina.
        //    No necesitamos quitarlo manualmente DENTRO de manejarClickCelda.
        celda.addEventListener('click', manejarClickCelda, { once: true });
    });
    console.log("Listeners de celdas añadidos con { once: true }.");
}

/** Maneja el evento de clic en una celda del tablero */
function manejarClickCelda(evento) {
    console.log(`\n--- Click Detectado ---`);
    console.log(`DEBUG: Inicio manejarClickCelda. juegoActivo=${juegoActivo}, procesandoClick=${procesandoClick}`);
    // LOG INICIAL: Mostrar quién se supone que juega AHORA MISMO
    console.log(`DEBUG: jugadorActual al entrar: ${jugadorActual}`);


    // --- Validaciones Iniciales ---
    if (!juegoActivo) {
        console.warn("DEBUG: Clic ignorado (juego inactivo)");
        return; // Salir si el juego no está activo
    }
    if (procesandoClick) {
        console.warn("DEBUG: Clic ignorado (ya se está procesando otro)");
        return; // Salir si ya hay un clic en proceso
    }

    procesandoClick = true; // Bloquear clics subsiguientes
    console.log("DEBUG: procesandoClick = true");

    let celdaClickeada = evento.target;
    // Asegurar que trabajamos con el DIV.celda
    if (celdaClickeada.tagName !== 'DIV' && celdaClickeada.parentElement.classList.contains('celda')) {
        celdaClickeada = celdaClickeada.parentElement;
    }
    // Verificar que sea una celda válida con índice
    if (!celdaClickeada.classList.contains('celda') || !celdaClickeada.hasAttribute('data-index')) {
        console.error("DEBUG: Clic en elemento inválido.");
        procesandoClick = false; // Desbloquear
        console.log("DEBUG: procesandoClick = false (elemento inválido)");
        // Re-añadir listener por si {once:true} se quitó prematuramente? No debería pasar.
        return;
    }

    const indiceCelda = parseInt(celdaClickeada.getAttribute('data-index'));

    // Verificar si la celda YA está ocupada LÓGICAMENTE
    // Esto es crucial porque {once: true} solo evita que el *mismo listener* se dispare dos veces.
    // No previene que otro evento (si hubiera un bug) intente marcar una celda ya marcada.
    if (estadoTablero[indiceCelda] !== null) {
        console.warn(`DEBUG: Celda ${indiceCelda} YA OCUPADA por ${estadoTablero[indiceCelda]}. Ignorando clic.`);
        procesandoClick = false; // Desbloquear
        console.log("DEBUG: procesandoClick = false (celda lógicamente ocupada)");
        // El listener {once: true} ya debería haberse ido, no necesitamos re-añadir/quitar.
        return;
    }

    // --- Procesamiento del Movimiento Válido ---
    console.log(`DEBUG: Procesando movimiento válido en celda ${indiceCelda} por ${jugadorActual}`);
    const jugadorQueJugo = jugadorActual; // Guardar quién hizo este movimiento

    // 1. Actualizar estado interno LÓGICO
    estadoTablero[indiceCelda] = jugadorQueJugo;
    console.log(`DEBUG: estadoTablero[${indiceCelda}] = ${jugadorQueJugo}`);

    // 2. Actualizar estado VISUAL (colocar ficha)
    const fichaAColocar = jugadorQueJugo === JUGADORES[0] ? fichaHugo : fichaSaul;
    celdaClickeada.innerHTML = `<img src="${RUTA_FICHAS}${fichaAColocar}" alt="Ficha ${jugadorQueJugo}" class="ficha-en-tablero">`;
    console.log(`DEBUG: Ficha ${fichaAColocar} colocada visualmente.`);

    // 3. Comprobar Victoria
    const huboVictoria = comprobarVictoria(jugadorQueJugo);
    console.log(`DEBUG: Resultado comprobarVictoria(${jugadorQueJugo}): ${huboVictoria}`);
    if (huboVictoria) {
        finalizarJuego(false); // 'false' significa que no es empate
        console.log("DEBUG: Saliendo de manejarClickCelda por victoria.");
        // finalizarJuego ya gestiona juegoActivo y procesandoClick
        return; // ¡Importante salir aquí!
    }

    // 4. Comprobar Empate (solo si no hubo victoria)
    const huboEmpate = comprobarEmpate();
    console.log(`DEBUG: Resultado comprobarEmpate(): ${huboEmpate}`);
    if (huboEmpate) {
        finalizarJuego(true); // 'true' significa que sí es empate
        console.log("DEBUG: Saliendo de manejarClickCelda por empate.");
        // finalizarJuego ya gestiona juegoActivo y procesandoClick
        return; // ¡Importante salir aquí!
    }

    // 5. Si NO hubo victoria NI empate -> CAMBIAR TURNO
    console.log("DEBUG: No hubo fin de juego, llamando a cambiarTurno...");
    cambiarTurno(); // Actualiza jugadorActual para el SIGUIENTE clic

    // 6. Desbloquear para el próximo clic
    procesandoClick = false;
    console.log("DEBUG: procesandoClick = false (fin normal del manejo)");
    console.log(`--- Fin Manejo Clic (Turno ahora de: ${jugadorActual}) ---`);
}

/** Comprueba si el jugador dado ha ganado */
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

/** Comprueba si hay empate (ninguna celda es null) */
function comprobarEmpate() {
    // every(callback) devuelve true si callback devuelve true para TODOS los elementos
    return estadoTablero.every(celda => celda !== null);
}

/** Cambia el turno al otro jugador, actualiza mensaje y resalta foto */
function cambiarTurno() {
    console.log(`DEBUG: --- Entrando a cambiarTurno ---`);
    console.log(`DEBUG: jugadorActual ANTES: ${jugadorActual}`);
    jugadorActual = (jugadorActual === JUGADORES[0]) ? JUGADORES[1] : JUGADORES[0];
    console.log(`DEBUG: jugadorActual DESPUÉS: ${jugadorActual}`);
    infoTurno.textContent = `Turno de: ${jugadorActual}`;
    actualizarResaltadoFoto();
    console.log(`DEBUG: --- Saliendo de cambiarTurno ---`);
}

/** Finaliza la partida actual */
function finalizarJuego(esEmpate) {
    console.log(`DEBUG: --- Entrando a finalizarJuego (esEmpate: ${esEmpate}) ---`);
    juegoActivo = false;
    procesandoClick = false; // Asegurar desbloqueo por si acaso
    console.log(`DEBUG: juegoActivo = false, procesandoClick = false`);

    // Quitar listeners explícitamente (aunque {once: true} ayuda)
    // Esto previene clics accidentales *después* de que el juego ha terminado.
    celdas.forEach(celda => {
        celda.removeEventListener('click', manejarClickCelda);
        // Opcional: resetear cursor
        // celda.style.cursor = 'default';
    });
    console.log(`DEBUG: Listeners de celdas eliminados en finalizarJuego.`);

    actualizarResaltadoFoto(); // Quita resaltados

    if (esEmpate) {
        infoTurno.textContent = "¡Vaya! Ha sido un empate.";
        console.log("Juego finalizado: Empate.");
    } else {
        // jugadorActual aquí ES el ganador porque cambiarTurno no se llamó
        infoTurno.textContent = `¡Felicidades ${jugadorActual}! ¡Has ganado! 🎉`;
        console.log(`Juego finalizado: Ganador ${jugadorActual}.`);
        if (jugadorActual === JUGADORES[0]) { puntajeHugo++; } else { puntajeSaul++; }
        actualizarMarcadorDisplay();
        console.log(`Marcador actualizado: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);
    }
    botonReiniciar.classList.remove('oculto');
    console.log(`DEBUG: --- Saliendo de finalizarJuego ---`);
}

/** Añade clase ganadora a las celdas */
function resaltarCeldasGanadoras(combinacion) {
    combinacion.forEach(indice => {
        if(celdas[indice]) { celdas[indice].classList.add('ganadora'); }
        else { console.error("Índice de celda fuera de rango:", indice); }
    });
}

// --- Event Listeners Iniciales ---
botonComenzar.addEventListener('click', iniciarProcesoSeleccion);
botonReiniciar.addEventListener('click', iniciarProcesoSeleccion);

// --- Fin del script ---
