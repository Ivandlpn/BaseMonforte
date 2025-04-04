// --- Referencias a Elementos del DOM ---
const botonComenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');
const juegoContenedor = document.getElementById('juego-contenedor');
const infoTurno = document.getElementById('info-turno'); // Referencia al elemento del mensaje
const botonReiniciar = document.getElementById('boton-reiniciar');
const puntajeHugoElem = document.getElementById('puntaje-hugo');
const puntajeSaulElem = document.getElementById('puntaje-saul');
const fotoHugoElem = document.getElementById('foto-hugo');
const fotoSaulElem = document.getElementById('foto-saul');
const pantallaGanador = document.getElementById('pantalla-ganador');
const textoGanadorElem = document.getElementById('texto-ganador');
const fotoGanadorElem = document.getElementById('foto-ganador');
const nombreGanadorElem = document.getElementById('nombre-ganador');
const botonNuevoJuego = document.getElementById('boton-nuevo-juego');
const botonVolverAJugar = document.getElementById('boton-volver-a-jugar');
const botonCerrarGanador = document.getElementById('boton-cerrar-ganador');
const pantallaPregunta = document.getElementById('pantalla-pregunta');
const tituloPreguntaElem = document.getElementById('titulo-pregunta');
const textoPreguntaElem = document.getElementById('texto-pregunta');
const opcionesPreguntaContenedor = document.getElementById('opciones-pregunta');
const feedbackPreguntaElem = document.getElementById('feedback-pregunta');


// --- Constantes y Variables del Juego ---
const JUGADORES = ['Hugo', 'Saúl'];
const MARCA_HUGO = 'X';
const MARCA_SAUL = 'O';
const PUNTOS_PARA_GANAR = 3;
let jugadorActual;
let jugadorQueRespondioPregunta;
let juegoActivo = false;
let estadoTablero = ['', '', '', '', '', '', '', '', ''];
const COMBINACIONES_GANADORAS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];
let puntajeHugo = 0;
let puntajeSaul = 0;
let listaPreguntasDisponibles = [];
let respuestaCorrectaActual = null;


// --- Funciones ---

function cargarPreguntas() {
    if (typeof preguntasQuiz !== 'undefined' && Array.isArray(preguntasQuiz)) {
         listaPreguntasDisponibles = JSON.parse(JSON.stringify(preguntasQuiz));
         console.log("Preguntas cargadas:", listaPreguntasDisponibles.length);
    } else {
        console.error("Error: 'preguntasQuiz' no definido. Asegúrate de que preguntas.js se carga antes.");
        listaPreguntasDisponibles = [];
    }
}

function actualizarMarcadorDisplay() {
    puntajeHugoElem.textContent = puntajeHugo;
    puntajeSaulElem.textContent = puntajeSaul;
    // Añadir clase para animación CSS breve (opcional)
    // (Código de animación de puntaje sin cambios)
    if (puntajeHugo > parseInt(puntajeHugoElem.textContent) || puntajeSaul > parseInt(puntajeSaulElem.textContent)) {
         puntajeHugoElem.classList.add('actualizado');
         puntajeSaulElem.classList.add('actualizado');
         setTimeout(() => {
             puntajeHugoElem.classList.remove('actualizado');
             puntajeSaulElem.classList.remove('actualizado');
         }, 300);
     }
}

function actualizarResaltadoFoto() {
    // (Código sin cambios)
    if (!juegoActivo && !pantallaPregunta.classList.contains('oculto')) {
         if (jugadorQueRespondioPregunta === 'Hugo') {
             fotoHugoElem.classList.add('activa');
             fotoSaulElem.classList.remove('activa');
         } else if (jugadorQueRespondioPregunta === 'Saúl') {
             fotoSaulElem.classList.add('activa');
             fotoHugoElem.classList.remove('activa');
         } else {
             fotoHugoElem.classList.remove('activa');
             fotoSaulElem.classList.remove('activa');
         }
         return;
    }
    if (!juegoActivo) {
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

function iniciarRonda() {
    // (Código sin cambios)
    estadoTablero = ['', '', '', '', '', '', '', '', ''];
    juegoActivo = true;
    respuestaCorrectaActual = null;
    jugadorQueRespondioPregunta = null;

    if (puntajeHugo === 0 && puntajeSaul === 0 || Math.random() < 0.5 ) {
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
    } else {
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
    }

    pantallaInicial.classList.add('oculto');
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');
    botonReiniciar.classList.add('oculto');
    botonNuevoJuego.classList.add('oculto');
    botonVolverAJugar.classList.add('oculto');
    botonCerrarGanador.classList.add('oculto');

    actualizarMarcadorDisplay();
    actualizarResaltadoFoto();

    const marcaInicial = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `¡Turno de ${jugadorActual}! (${marcaInicial})`;

    const tablero = document.getElementById('tablero');
    const celdasActuales = tablero.querySelectorAll('.celda');

    celdasActuales.forEach(celda => {
        celda.innerHTML = '';
        celda.classList.remove('ganadora');
        celda.style.cursor = 'pointer';
        const celdaClonada = celda.cloneNode(true);
        celda.replaceWith(celdaClonada);
        celdaClonada.addEventListener('click', manejarClickCelda, { once: true });
    });

    console.log(`Ronda iniciada. Empieza: ${jugadorActual}. Marcador: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);
}

function manejarClickCelda(evento) {
    // (Código sin cambios)
    if (!juegoActivo) return;
    const celdaClickeada = evento.target;
    const celdaTarget = celdaClickeada.closest('.celda');
    if (!celdaTarget || !celdaTarget.hasAttribute('data-index')) return;
    const indiceCelda = parseInt(celdaTarget.getAttribute('data-index'));
    if (estadoTablero[indiceCelda] !== '') return;

    const marcaActual = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    const claseMarca = (marcaActual === MARCA_HUGO) ? 'x' : 'o';
    estadoTablero[indiceCelda] = marcaActual;
    celdaTarget.innerHTML = `<span class="marca-animada ${claseMarca}">${marcaActual}</span>`;
    celdaTarget.style.cursor = 'default';

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

function comprobarVictoria(marca) { /* ... (sin cambios) ... */
    const celdasDOM = document.querySelectorAll('.celda');
    for (const combinacion of COMBINACIONES_GANADORAS) {
        const [a, b, c] = combinacion;
        if (estadoTablero[a] === marca && estadoTablero[b] === marca && estadoTablero[c] === marca) {
             resaltarCeldasGanadoras(combinacion, celdasDOM);
            return true;
        }
    }
    return false;
}

function comprobarEmpate() { /* ... (sin cambios) ... */
    return estadoTablero.every(celda => celda !== '');
}

function cambiarTurno() { /* ... (sin cambios) ... */
    jugadorActual = jugadorActual === JUGADORES[0] ? JUGADORES[1] : JUGADORES[0];
    const marcaSiguiente = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `¡Turno de ${jugadorActual}! (${marcaSiguiente})`;
    actualizarResaltadoFoto();
    console.log(`Turno cambiado a: ${jugadorActual}`);
}

function finalizarJuego(esEmpate) {
    // (Código sin cambios)
    juegoActivo = false;
    const celdasFinalizadas = document.querySelectorAll('.celda');
    celdasFinalizadas.forEach(celda => {
         celda.style.cursor = 'default';
    });

    if (esEmpate) {
        infoTurno.textContent = "¡Oh! ¡Empate en esta ronda! 🤝";
        console.log("Ronda finalizada: Empate.");
        actualizarResaltadoFoto(); // Quitar resaltado
        botonReiniciar.classList.remove('oculto');
    } else {
        // El jugador actual es el ganador de la ronda
        infoTurno.textContent = `¡Bien hecho ${jugadorActual}! 👍 Responde para ganar el punto...`;
        console.log(`Ronda finalizada: Ganador ${jugadorActual}. Esperando pregunta.`);
        jugadorQueRespondioPregunta = jugadorActual;
        actualizarResaltadoFoto(); // Mantener resaltado mientras responde
        setTimeout(() => {
            mostrarPregunta();
        }, 1800);
    }
}

function mostrarPregunta() {
    // (Código sin cambios)
    const botonesOpcionActuales = opcionesPreguntaContenedor.querySelectorAll('.opcion-btn');

    if (listaPreguntasDisponibles.length === 0) {
        console.warn("No quedan preguntas disponibles.");
        // Actualizar infoTurno también en este caso
        infoTurno.textContent = "¡Vaya! Se acabaron las preguntas. ¡Empate técnico!";
        feedbackPreguntaElem.textContent = "¡Uy! Se acabaron las preguntas por ahora.";
        feedbackPreguntaElem.className = 'feedback-quiz';
        feedbackPreguntaElem.classList.remove('oculto');
         pantallaPregunta.classList.remove('oculto'); // Mostrar pantalla para el mensaje
        setTimeout(() => {
            pantallaPregunta.classList.add('oculto'); // Ocultar después de mostrar mensaje
            feedbackPreguntaElem.classList.add('oculto');
            botonReiniciar.classList.remove('oculto');
            actualizarResaltadoFoto();
        }, 2500);
        return;
    }

    const indicePregunta = Math.floor(Math.random() * listaPreguntasDisponibles.length);
    const preguntaData = listaPreguntasDisponibles.splice(indicePregunta, 1)[0];
    respuestaCorrectaActual = preguntaData.respuestaCorrecta;

    tituloPreguntaElem.textContent = `🧠 ¡Pregunta para ${jugadorQueRespondioPregunta}! 🧠`;
    textoPreguntaElem.textContent = preguntaData.pregunta;
    feedbackPreguntaElem.classList.add('oculto');

    botonesOpcionActuales.forEach((boton, index) => {
        boton.textContent = preguntaData.opciones[index];
        boton.disabled = false;
        boton.className = 'opcion-btn';

        const botonClonado = boton.cloneNode(true);
        boton.replaceWith(botonClonado);
        opcionesPreguntaContenedor.querySelectorAll('.opcion-btn')[index].addEventListener('click', manejarRespuestaPregunta);
    });

    pantallaPregunta.classList.remove('oculto');
}


function manejarRespuestaPregunta(evento) {
    // (Código sin cambios)
    const botonClickeado = evento.target;
    const indiceSeleccionado = parseInt(botonClickeado.getAttribute('data-index'));
    const botonesOpcionActuales = opcionesPreguntaContenedor.querySelectorAll('.opcion-btn');

    botonesOpcionActuales.forEach(boton => boton.disabled = true);

    const esCorrecta = (indiceSeleccionado === respuestaCorrectaActual);

    if (esCorrecta) {
        botonClickeado.classList.add('correcta');
        feedbackPreguntaElem.textContent = "✅ ¡Correctísimo! +1 Punto ✨";
        feedbackPreguntaElem.className = 'feedback-quiz correcto';
    } else {
        botonClickeado.classList.add('incorrecta');
        if (botonesOpcionActuales[respuestaCorrectaActual]) {
             botonesOpcionActuales[respuestaCorrectaActual].classList.add('correcta');
        }
        feedbackPreguntaElem.textContent = `❌ ¡Ohh! La correcta era: ${botonesOpcionActuales[respuestaCorrectaActual]?.textContent || '?'}`;
        feedbackPreguntaElem.className = 'feedback-quiz incorrecto';
    }
    feedbackPreguntaElem.classList.remove('oculto');

    setTimeout(() => {
        procesarResultadoPregunta(esCorrecta);
    }, 2000);
}

/**
 * Procesa el resultado de la pregunta, actualiza marcador y mensaje principal,
 * comprueba victoria del juego y muestra siguiente paso.
 */
function procesarResultadoPregunta(fueCorrecta) {
    pantallaPregunta.classList.add('oculto'); // Ocultar modal de pregunta
    actualizarResaltadoFoto(); // Quitar resaltado específico de pregunta

    // --- ¡CAMBIO AQUÍ! Actualizar el mensaje de infoTurno ---
    if (fueCorrecta) {
        // Sumar punto al jugador que respondió
        if (jugadorQueRespondioPregunta === 'Hugo') {
            puntajeHugo++;
            infoTurno.textContent = "¡Punto para Hugo! 💪"; // Mensaje actualizado
        } else if (jugadorQueRespondioPregunta === 'Saúl') {
            puntajeSaul++;
            infoTurno.textContent = "¡Punto para Saúl! 🎉"; // Mensaje actualizado
        }
        actualizarMarcadorDisplay();
        console.log(`Respuesta correcta. Marcador: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);

        // Comprobar si se ganó el JUEGO COMPLETO
        if (puntajeHugo === PUNTOS_PARA_GANAR || puntajeSaul === PUNTOS_PARA_GANAR) {
            console.log(`¡JUEGO TERMINADO POR PUNTOS! Ganador: ${jugadorQueRespondioPregunta}`);
            // No necesitamos timeout aquí, ya hubo pausas antes
            mostrarGanadorDelJuego(jugadorQueRespondioPregunta);
        } else {
            // No se ganó el juego, mostrar botón para siguiente ronda después de un momento
             setTimeout(() => { // Breve pausa para leer el mensaje de punto sumado
                  botonReiniciar.classList.remove('oculto');
             }, 1500); // 1.5 segundos de pausa
        }
    } else {
        // Respuesta incorrecta
        infoTurno.textContent = `¡Ups! ${jugadorQueRespondioPregunta} no sumó el punto. 😅`; // Mensaje actualizado
        console.log("Respuesta incorrecta. No se suma punto.");
         // Mostrar botón para siguiente ronda después de un momento
         setTimeout(() => { // Breve pausa para leer el mensaje de punto no sumado
             botonReiniciar.classList.remove('oculto');
         }, 1500); // 1.5 segundos de pausa
    }

    // Resetear variables de la pregunta actual
    respuestaCorrectaActual = null;
    jugadorQueRespondioPregunta = null;
}


function mostrarGanadorDelJuego(ganador) {
    // (Código sin cambios)
    textoGanadorElem.textContent = `🏆 ¡EL CAMPEÓN ES ${ganador.toUpperCase()}! 🏆`;
    nombreGanadorElem.textContent = ganador.toUpperCase();
    fotoGanadorElem.src = (ganador === 'Hugo') ? 'img/jugadores/hugo.png' : 'img/jugadores/saul.png';
    fotoGanadorElem.alt = `Foto ${ganador}`;

    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaGanador.classList.remove('oculto');

    botonNuevoJuego.classList.add('oculto');
    botonReiniciar.classList.add('oculto');
    botonVolverAJugar.classList.remove('oculto');
    botonCerrarGanador.classList.remove('oculto');
}

function iniciarNuevoJuegoCompleto() {
    // (Código sin cambios)
    console.log("Iniciando nuevo juego completo...");
    puntajeHugo = 0;
    puntajeSaul = 0;
    cargarPreguntas();

    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    botonVolverAJugar.classList.add('oculto');
    botonCerrarGanador.classList.add('oculto');

    iniciarRonda();
}

function cerrarPantallaGanador() {
    // (Código sin cambios)
    console.log("Cerrando pantalla de ganador y volviendo al inicio.");
    pantallaGanador.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaInicial.classList.remove('oculto');

    puntajeHugo = 0;
    puntajeSaul = 0;
    actualizarMarcadorDisplay();
}


function resaltarCeldasGanadoras(combinacion, celdasDOM) {
    // (Código sin cambios)
    combinacion.forEach(indice => {
        if(celdasDOM && celdasDOM[indice]) {
            celdasDOM[indice].classList.add('ganadora');
        } else {
            console.error("Índice de celda fuera de rango o celdasDOM no válido al resaltar:", indice);
        }
    });
}

// --- Event Listeners Iniciales ---
botonComenzar.addEventListener('click', () => {
    cargarPreguntas();
    iniciarRonda();
});
botonReiniciar.addEventListener('click', iniciarRonda);
botonVolverAJugar.addEventListener('click', iniciarNuevoJuegoCompleto);
botonCerrarGanador.addEventListener('click', cerrarPantallaGanador);

// --- Fin del script ---
