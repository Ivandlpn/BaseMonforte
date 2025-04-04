// --- Referencias a Elementos del DOM ---
const botonComenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');
const juegoContenedor = document.getElementById('juego-contenedor');
const infoTurno = document.getElementById('info-turno');
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
const pantallaEjercicio = document.getElementById('pantalla-ejercicio');
const nombreEjercicioElem = document.getElementById('nombre-ejercicio');
const contadorEjercicioElem = document.getElementById('contador-ejercicio');

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
    [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
];
let puntajeHugo = 0;
let puntajeSaul = 0;
let listaPreguntasDisponibles = [];
let respuestaCorrectaActual = null;
let listaEjerciciosDisponibles = [];
let intervaloContadorEjercicio = null;
const DURACION_EJERCICIO = 10; // Segundos

// --- Funciones ---

function cargarPreguntas() {
    if (typeof preguntasQuiz !== 'undefined' && Array.isArray(preguntasQuiz)) {
         listaPreguntasDisponibles = JSON.parse(JSON.stringify(preguntasQuiz));
         console.log("Preguntas (re)cargadas:", listaPreguntasDisponibles.length);
    } else {
        console.error("Error: 'preguntasQuiz' no definido.");
        listaPreguntasDisponibles = [];
    }
}

function cargarEjercicios() {
     if (typeof ejerciciosPausa !== 'undefined' && Array.isArray(ejerciciosPausa)) {
         listaEjerciciosDisponibles = JSON.parse(JSON.stringify(ejerciciosPausa));
         console.log("Ejercicios (re)cargados:", listaEjerciciosDisponibles.length);
    } else {
        console.error("Error: 'ejerciciosPausa' no definido.");
        listaEjerciciosDisponibles = [];
    }
}

function actualizarMarcadorDisplay() {
    puntajeHugoElem.textContent = puntajeHugo;
    puntajeSaulElem.textContent = puntajeSaul;

    // Animar el número que cambió
    if (puntajeHugo > parseInt(puntajeHugoElem.dataset.lastScore || 0)) {
        puntajeHugoElem.classList.add('actualizado');
        setTimeout(() => puntajeHugoElem.classList.remove('actualizado'), 300);
    }
     if (puntajeSaul > parseInt(puntajeSaulElem.dataset.lastScore || 0)) {
        puntajeSaulElem.classList.add('actualizado');
        setTimeout(() => puntajeSaulElem.classList.remove('actualizado'), 300);
    }
    puntajeHugoElem.dataset.lastScore = puntajeHugo;
    puntajeSaulElem.dataset.lastScore = puntajeSaul;
}

function actualizarResaltadoFoto() {
    if (!juegoActivo && (!pantallaPregunta.classList.contains('oculto') || !pantallaEjercicio.classList.contains('oculto'))) {
         // Mantener resaltado al que responde pregunta o al que ganó ronda antes de ejercicio
         const jugadorAResaltar = jugadorQueRespondioPregunta || jugadorActual; // Usa el último activo si aplica
         if (jugadorAResaltar === 'Hugo') {
             fotoHugoElem.classList.add('activa');
             fotoSaulElem.classList.remove('activa');
         } else if (jugadorAResaltar === 'Saúl') {
             fotoSaulElem.classList.add('activa');
             fotoHugoElem.classList.remove('activa');
         } else { // Si no hay jugador definido (ej. empate antes de ejercicio)
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
    estadoTablero = ['', '', '', '', '', '', '', '', ''];
    juegoActivo = true;
    respuestaCorrectaActual = null;
    jugadorQueRespondioPregunta = null;
    if (intervaloContadorEjercicio) clearInterval(intervaloContadorEjercicio);

    if (puntajeHugo === 0 && puntajeSaul === 0 || Math.random() < 0.5 ) {
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
    } else {
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
    }

    // Gestionar visibilidad
    pantallaInicial.classList.add('oculto');
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
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
        finalizarJuego(false); return;
    }
    if (comprobarEmpate()) {
        finalizarJuego(true); return;
    }
    cambiarTurno();
}

function comprobarVictoria(marca) {
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

function comprobarEmpate() {
    return estadoTablero.every(celda => celda !== '');
}

function cambiarTurno() {
    jugadorActual = jugadorActual === JUGADORES[0] ? JUGADORES[1] : JUGADORES[0];
    const marcaSiguiente = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `¡Turno de ${jugadorActual}! (${marcaSiguiente})`;
    actualizarResaltadoFoto();
    console.log(`Turno cambiado a: ${jugadorActual}`);
}

function finalizarJuego(esEmpate) {
    juegoActivo = false;
    const celdasFinalizadas = document.querySelectorAll('.celda');
    celdasFinalizadas.forEach(celda => {
         celda.style.cursor = 'default';
    });

    if (esEmpate) {
        infoTurno.textContent = "¡Oh! ¡Empate! 🤝 ¡Vamos con una Pausa Activa!";
        console.log("Ronda finalizada: Empate. Iniciando Pausa Activa.");
        actualizarResaltadoFoto(); // Quitar resaltado
        setTimeout(() => {
            mostrarEjercicioPausa();
        }, 1500);
    } else {
        infoTurno.textContent = `¡Bien hecho ${jugadorActual}! 👍 Responde para ganar el punto...`;
        console.log(`Ronda finalizada: Ganador ${jugadorActual}. Esperando pregunta.`);
        jugadorQueRespondioPregunta = jugadorActual;
        actualizarResaltadoFoto();
        setTimeout(() => {
            mostrarPregunta();
        }, 1800);
    }
}

function mostrarEjercicioPausa() {
    if (listaEjerciciosDisponibles.length === 0) {
        console.log("Recargando lista de ejercicios.");
        cargarEjercicios();
        if(listaEjerciciosDisponibles.length === 0) {
             console.error("No se pudieron cargar ejercicios. Saltando pausa activa.");
             botonReiniciar.classList.remove('oculto');
             infoTurno.textContent = "¡Empate! Algo falló con la pausa activa...";
             return;
        }
    }

    const indiceEjercicio = Math.floor(Math.random() * listaEjerciciosDisponibles.length);
    const ejercicio = listaEjerciciosDisponibles.splice(indiceEjercicio, 1)[0];

    nombreEjercicioElem.textContent = `${ejercicio.icono || ''} ${ejercicio.nombre}`;
    contadorEjercicioElem.textContent = DURACION_EJERCICIO;

    pantallaEjercicio.classList.remove('oculto');
    iniciarContadorEjercicio(DURACION_EJERCICIO);
}

function iniciarContadorEjercicio(segundos) {
    let tiempoRestante = segundos;
    if (intervaloContadorEjercicio) clearInterval(intervaloContadorEjercicio);
    contadorEjercicioElem.textContent = tiempoRestante;

    intervaloContadorEjercicio = setInterval(() => {
        tiempoRestante--;
        contadorEjercicioElem.textContent = tiempoRestante;
        if (tiempoRestante <= 0) {
            clearInterval(intervaloContadorEjercicio);
            intervaloContadorEjercicio = null;
            pantallaEjercicio.classList.add('oculto');
            infoTurno.textContent = "¡Energía recargada! 🔥 ¿Listos para la siguiente?";
            botonReiniciar.classList.remove('oculto');
            console.log("Pausa activa completada.");
        }
    }, 1000);
}

function mostrarPregunta() {
    if (listaPreguntasDisponibles.length === 0) {
        console.warn("No quedan preguntas disponibles en este ciclo.");
        infoTurno.textContent = "¡Vaya! Se acabaron las preguntas. ¡Ronda de descanso!";
        pantallaPregunta.classList.remove('oculto');
        tituloPreguntaElem.textContent = "¡Fin de las Preguntas!";
        textoPreguntaElem.textContent = "Se han usado todas las preguntas disponibles en esta partida.";
        opcionesPreguntaContenedor.innerHTML = ''; // Limpiar opciones
        feedbackPreguntaElem.classList.add('oculto');
        setTimeout(() => {
            pantallaPregunta.classList.add('oculto');
            botonReiniciar.classList.remove('oculto');
            actualizarResaltadoFoto();
        }, 3000);
        return;
    }

    const indicePregunta = Math.floor(Math.random() * listaPreguntasDisponibles.length);
    const preguntaData = listaPreguntasDisponibles.splice(indicePregunta, 1)[0];
    respuestaCorrectaActual = preguntaData.respuestaCorrecta;

    tituloPreguntaElem.textContent = `🧠 ¡Pregunta para ${jugadorQueRespondioPregunta}! 🧠`;
    textoPreguntaElem.textContent = preguntaData.pregunta;
    feedbackPreguntaElem.classList.add('oculto');
    opcionesPreguntaContenedor.innerHTML = `
        <button class="opcion-btn" data-index="0">Opción A</button>
        <button class="opcion-btn" data-index="1">Opción B</button>
        <button class="opcion-btn" data-index="2">Opción C</button>
    `;
    const nuevosBotonesOpcion = opcionesPreguntaContenedor.querySelectorAll('.opcion-btn');
    nuevosBotonesOpcion.forEach((boton, index) => {
        boton.textContent = preguntaData.opciones[index];
        boton.disabled = false;
        boton.className = 'opcion-btn';
        boton.addEventListener('click', manejarRespuestaPregunta);
    });

    pantallaPregunta.classList.remove('oculto');
}


function manejarRespuestaPregunta(evento) {
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

function procesarResultadoPregunta(fueCorrecta) {
    pantallaPregunta.classList.add('oculto');
    actualizarResaltadoFoto();

    let mensajeResultado = "";

    if (fueCorrecta) {
        if (jugadorQueRespondioPregunta === 'Hugo') {
            puntajeHugo++;
            mensajeResultado = "¡Punto para Hugo! 💪";
        } else if (jugadorQueRespondioPregunta === 'Saúl') {
            puntajeSaul++;
            mensajeResultado = "¡Punto para Saúl! 🎉";
        }
        actualizarMarcadorDisplay();
        console.log(`Respuesta correcta. Marcador: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);

        if (puntajeHugo === PUNTOS_PARA_GANAR || puntajeSaul === PUNTOS_PARA_GANAR) {
            infoTurno.textContent = mensajeResultado;
             setTimeout(() => {
                console.log(`¡JUEGO TERMINADO POR PUNTOS! Ganador: ${jugadorQueRespondioPregunta}`);
                mostrarGanadorDelJuego(jugadorQueRespondioPregunta);
            }, 500);
        } else {
            infoTurno.textContent = mensajeResultado;
            setTimeout(() => {
                  botonReiniciar.classList.remove('oculto');
             }, 1500);
        }
    } else {
        mensajeResultado = `¡Ups! ${jugadorQueRespondioPregunta} no sumó el punto. 😅`;
        infoTurno.textContent = mensajeResultado;
        console.log("Respuesta incorrecta. No se suma punto.");
        setTimeout(() => {
             botonReiniciar.classList.remove('oculto');
         }, 1500);
    }

    respuestaCorrectaActual = null;
    jugadorQueRespondioPregunta = null;
}

function mostrarGanadorDelJuego(ganador) {
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    pantallaGanador.classList.remove('oculto');

    textoGanadorElem.textContent = `🏆 ¡EL CAMPEÓN ES ${ganador.toUpperCase()}! 🏆`;
    nombreGanadorElem.textContent = ganador.toUpperCase();
    fotoGanadorElem.src = (ganador === 'Hugo') ? 'img/jugadores/hugo.png' : 'img/jugadores/saul.png';
    fotoGanadorElem.alt = `Foto ${ganador}`;
    botonNuevoJuego.classList.add('oculto');
    botonReiniciar.classList.add('oculto');
    botonVolverAJugar.classList.remove('oculto');
    botonCerrarGanador.classList.remove('oculto');
}

function iniciarNuevoJuegoCompleto() {
    console.log("Iniciando nuevo juego completo...");
    puntajeHugo = 0;
    puntajeSaul = 0;
    cargarPreguntas();
    cargarEjercicios();

    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    botonVolverAJugar.classList.add('oculto');
    botonCerrarGanador.classList.add('oculto');

    iniciarRonda();
}

function cerrarPantallaGanador() {
    console.log("Cerrando pantalla de ganador y volviendo al inicio.");
    pantallaGanador.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    pantallaInicial.classList.remove('oculto');
    puntajeHugo = 0;
    puntajeSaul = 0;
    actualizarMarcadorDisplay();
}

function resaltarCeldasGanadoras(combinacion, celdasDOM) {
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
    cargarEjercicios();
    iniciarRonda();
});
botonReiniciar.addEventListener('click', iniciarRonda);
botonVolverAJugar.addEventListener('click', iniciarNuevoJuegoCompleto);
botonCerrarGanador.addEventListener('click', cerrarPantallaGanador);

// --- Fin del script ---
