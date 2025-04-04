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
const botonAbrirMensaje = document.getElementById('boton-abrir-mensaje');
const modalMensaje = document.getElementById('modal-mensaje');
const botonCerrarMensaje = document.getElementById('boton-cerrar-mensaje');
const formMensaje = document.getElementById('form-mensaje');
const mensajeFeedback = document.getElementById('mensaje-feedback');
const botonMostrarReglas = document.getElementById('boton-mostrar-reglas');
const modalReglas = document.getElementById('modal-reglas');
const botonCerrarReglas = document.getElementById('boton-cerrar-reglas');

// --- Constantes y Variables del Juego ---
const JUGADORES = ['Hugo', 'Saúl'];
const MARCA_HUGO = 'X';
const MARCA_SAUL = 'O';
const PUNTOS_PARA_GANAR = 3;
let jugadorActual;
let jugadorQueRespondioPregunta;
let juegoActivo = false;
let estadoTablero = ['', '', '', '', '', '', '', '', ''];
const COMBINACIONES_GANADORAS = [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6] ];
let puntajeHugo = 0;
let puntajeSaul = 0;
let listaPreguntasDisponibles = [];
let respuestaCorrectaActual = null;
let tipoPreguntaActual = null;
let listaEjerciciosDisponibles = [];
let intervaloContadorEjercicio = null;
const DURACION_EJERCICIO = 15; // O 10

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
    const pantallaPreguntaVisible = !pantallaPregunta.classList.contains('oculto');
    const pantallaEjercicioVisible = !pantallaEjercicio.classList.contains('oculto');

    if (!juegoActivo && (pantallaPreguntaVisible || pantallaEjercicioVisible)) {
         const jugadorAResaltar = jugadorQueRespondioPregunta || jugadorActual;
         if (jugadorAResaltar === 'Hugo') {
             fotoHugoElem.classList.add('activa');
             fotoSaulElem.classList.remove('activa');
         } else if (jugadorAResaltar === 'Saúl') {
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
    estadoTablero = ['', '', '', '', '', '', '', '', ''];
    juegoActivo = true;
    respuestaCorrectaActual = null;
    tipoPreguntaActual = null;
    jugadorQueRespondioPregunta = null;
    if (intervaloContadorEjercicio) clearInterval(intervaloContadorEjercicio);

    if (puntajeHugo === 0 && puntajeSaul === 0 || Math.random() < 0.5 ) {
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
    } else {
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
    }

    // Ocultar todas las pantallas superpuestas
    pantallaInicial.classList.add('oculto');
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');

    // Ocultar botones que no aplican
    botonReiniciar.classList.add('oculto');
    botonNuevoJuego.classList.add('oculto');
    botonVolverAJugar.classList.add('oculto');
    botonCerrarGanador.classList.add('oculto');

    actualizarMarcadorDisplay();
    actualizarResaltadoFoto();

    const marcaInicial = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `¡Turno de ${jugadorActual}! (${marcaInicial})`;

    // Limpiar y preparar tablero
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
    const celdaTarget = evento.target.closest('.celda');
    if (!celdaTarget || !celdaTarget.hasAttribute('data-index') || estadoTablero[parseInt(celdaTarget.dataset.index)] !== '') {
        return;
    }
    const indiceCelda = parseInt(celdaTarget.dataset.index);

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
        actualizarResaltadoFoto(); // Quita resaltado para empate
        setTimeout(() => {
            mostrarEjercicioPausa();
        }, 1500);
    } else {
        infoTurno.textContent = `¡Bien hecho ${jugadorActual}! 👍 Responde para ganar el punto...`;
        console.log(`Ronda finalizada: Ganador ${jugadorActual}. Esperando pregunta.`);
        jugadorQueRespondioPregunta = jugadorActual;
        actualizarResaltadoFoto(); // Mantiene resaltado al ganador de ronda
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
             actualizarResaltadoFoto();
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
            actualizarResaltadoFoto(); // Quita resaltado después de pausa
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
        opcionesPreguntaContenedor.innerHTML = '';
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
    tipoPreguntaActual = preguntaData.tipo || 'multiple';

    tituloPreguntaElem.textContent = `🧠 ¡Pregunta para ${jugadorQueRespondioPregunta}! 🧠`;
    textoPreguntaElem.textContent = preguntaData.pregunta;
    feedbackPreguntaElem.classList.add('oculto');
    opcionesPreguntaContenedor.innerHTML = '';

    if (tipoPreguntaActual === 'vf') {
        const botonVerdadero = document.createElement('button');
        botonVerdadero.textContent = 'Verdadero 👍';
        botonVerdadero.className = 'opcion-btn opcion-vf';
        botonVerdadero.dataset.valor = 'true';
        botonVerdadero.addEventListener('click', manejarRespuestaPregunta);
        opcionesPreguntaContenedor.appendChild(botonVerdadero);

        const botonFalso = document.createElement('button');
        botonFalso.textContent = 'Falso 👎';
        botonFalso.className = 'opcion-btn opcion-vf';
        botonFalso.dataset.valor = 'false';
        botonFalso.addEventListener('click', manejarRespuestaPregunta);
        opcionesPreguntaContenedor.appendChild(botonFalso);
    } else {
        preguntaData.opciones.forEach((opcionTexto, index) => {
            const botonOpcion = document.createElement('button');
            botonOpcion.textContent = opcionTexto;
            botonOpcion.className = 'opcion-btn opcion-multiple';
            botonOpcion.dataset.index = index;
            botonOpcion.addEventListener('click', manejarRespuestaPregunta);
            opcionesPreguntaContenedor.appendChild(botonOpcion);
        });
    }

    pantallaPregunta.classList.remove('oculto');
}


function manejarRespuestaPregunta(evento) {
    const botonClickeado = evento.target;
    const botonesOpcionActuales = Array.from(opcionesPreguntaContenedor.querySelectorAll('.opcion-btn'));

    botonesOpcionActuales.forEach(boton => boton.disabled = true);

    let esCorrecta = false;
    let valorSeleccionado;

    if (tipoPreguntaActual === 'vf') {
        valorSeleccionado = (botonClickeado.dataset.valor === 'true');
        esCorrecta = (valorSeleccionado === respuestaCorrectaActual);
    } else {
        valorSeleccionado = parseInt(botonClickeado.dataset.index);
        esCorrecta = (valorSeleccionado === respuestaCorrectaActual);
    }

    if (esCorrecta) {
        botonClickeado.classList.add('correcta');
        feedbackPreguntaElem.textContent = "✅ ¡Correctísimo! +1 Punto ✨";
        feedbackPreguntaElem.className = 'feedback-quiz correcto';
    } else {
        botonClickeado.classList.add('incorrecta');
        let botonCorrecto;
        if (tipoPreguntaActual === 'vf') {
            botonCorrecto = botonesOpcionActuales.find(btn => (btn.dataset.valor === 'true') === respuestaCorrectaActual);
        } else {
            botonCorrecto = botonesOpcionActuales.find(btn => parseInt(btn.dataset.index) === respuestaCorrectaActual);
        }
        if (botonCorrecto) {
            botonCorrecto.classList.add('correcta');
        }
        feedbackPreguntaElem.textContent = `❌ ¡Ohh! La respuesta correcta era: ${botonCorrecto ? botonCorrecto.textContent : '?'}`;
        feedbackPreguntaElem.className = 'feedback-quiz incorrecto';
    }
    feedbackPreguntaElem.classList.remove('oculto');

    setTimeout(() => {
        procesarResultadoPregunta(esCorrecta);
    }, 2000);
}

function procesarResultadoPregunta(fueCorrecta) {
    pantallaPregunta.classList.add('oculto');

    let mensajeResultado = "";
    const ganadorDeRonda = jugadorQueRespondioPregunta; // Capturar antes de resetear

    if (fueCorrecta) {
        if (ganadorDeRonda === 'Hugo') {
            puntajeHugo++;
            mensajeResultado = "¡Punto para Hugo! 💪";
        } else if (ganadorDeRonda === 'Saúl') {
            puntajeSaul++;
            mensajeResultado = "¡Punto para Saúl! 🎉";
        }
        actualizarMarcadorDisplay();
        console.log(`Respuesta correcta. Marcador: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);

        if (puntajeHugo === PUNTOS_PARA_GANAR || puntajeSaul === PUNTOS_PARA_GANAR) {
            // Juego Terminado
            infoTurno.textContent = mensajeResultado;
             setTimeout(() => {
                console.log(`¡JUEGO TERMINADO POR PUNTOS! Ganador: ${ganadorDeRonda}`);
                mostrarGanadorDelJuego(ganadorDeRonda); // Pasar el ganador capturado
            }, 500);
            // NO resetear variables aquí
        } else {
            // Juego Continúa
            infoTurno.textContent = mensajeResultado;
            setTimeout(() => {
                  botonReiniciar.classList.remove('oculto');
                  actualizarResaltadoFoto(); // Quitar resaltado ahora
             }, 1500);
            // Resetear variables AQUÍ porque el juego sigue
            respuestaCorrectaActual = null;
            tipoPreguntaActual = null;
            jugadorQueRespondioPregunta = null;
        }
    } else {
        // Respuesta Incorrecta (Juego Continúa)
        mensajeResultado = `¡Ups! ${ganadorDeRonda || 'Alguien'} no sumó el punto. 😅`;
        infoTurno.textContent = mensajeResultado;
        console.log("Respuesta incorrecta. No se suma punto.");
        setTimeout(() => {
             botonReiniciar.classList.remove('oculto');
             actualizarResaltadoFoto(); // Quitar resaltado ahora
         }, 1500);
         // Resetear variables AQUÍ porque el juego sigue
         respuestaCorrectaActual = null;
         tipoPreguntaActual = null;
         jugadorQueRespondioPregunta = null;
    }
}

function mostrarGanadorDelJuego(ganador) {
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    modalMensaje.classList.add('oculto'); // Ocultar otros modales
    modalReglas.classList.add('oculto');
    pantallaGanador.classList.remove('oculto'); // Mostrar pantalla ganador

    textoGanadorElem.textContent = `🏆 ¡EL CAMPEÓN ES ${ganador ? ganador.toUpperCase() : '???'}! 🏆`;
    nombreGanadorElem.textContent = ganador ? ganador.toUpperCase() : '???';
    if (ganador === 'Hugo') {
        fotoGanadorElem.src = 'img/jugadores/hugo.png';
        fotoGanadorElem.alt = 'Foto Hugo';
    } else if (ganador === 'Saúl') {
        fotoGanadorElem.src = 'img/jugadores/saul.png';
        fotoGanadorElem.alt = 'Foto Saúl';
    } else {
        fotoGanadorElem.src = '';
        fotoGanadorElem.alt = 'Foto no disponible';
    }

    botonNuevoJuego.classList.add('oculto');
    botonReiniciar.classList.add('oculto');
    botonVolverAJugar.classList.remove('oculto');
    botonCerrarGanador.classList.remove('oculto');

    fotoHugoElem.classList.remove('activa');
    fotoSaulElem.classList.remove('activa');
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
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto');
    botonVolverAJugar.classList.add('oculto');
    botonCerrarGanador.classList.add('oculto');

    iniciarRonda(); // Inicia la primera ronda
}

function cerrarPantallaGanador() {
    console.log("Cerrando pantalla de ganador y volviendo al inicio.");
    pantallaGanador.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto');
    pantallaInicial.classList.remove('oculto'); // Mostrar inicio
    puntajeHugo = 0;
    puntajeSaul = 0;
    // No es necesario actualizar display aquí
    fotoHugoElem.classList.remove('activa');
    fotoSaulElem.classList.remove('activa');
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

// --- Funciones y Listeners para Modales (Mensaje y Reglas) ---

function abrirModalMensaje() {
    pantallaInicial.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    modalReglas.classList.add('oculto');

    formMensaje.reset();
    mensajeFeedback.classList.add('oculto');
    modalMensaje.classList.remove('oculto');
}

function cerrarModalMensaje() {
    modalMensaje.classList.add('oculto');
    // Volver a mostrar la pantalla inicial solo si no hay otra pantalla activa
    if (juegoContenedor.classList.contains('oculto') &&
        pantallaGanador.classList.contains('oculto') &&
        pantallaPregunta.classList.contains('oculto') &&
        pantallaEjercicio.classList.contains('oculto')) {
        pantallaInicial.classList.remove('oculto');
    }
}

async function manejarEnvioMensaje(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    mensajeFeedback.textContent = 'Enviando mensaje... ⏳';
    mensajeFeedback.className = 'mensaje-estado';
    mensajeFeedback.classList.remove('oculto');
    submitButton.disabled = true;

    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            mensajeFeedback.textContent = '¡Mensaje enviado con éxito! 😊';
            mensajeFeedback.classList.add('exito');
            form.reset();
            setTimeout(cerrarModalMensaje, 2500);
        } else {
            const data = await response.json();
            if (data && data.errors) {
                mensajeFeedback.textContent = 'Error: ' + data.errors.map(error => error.message).join(', ');
            } else {
                mensajeFeedback.textContent = '¡Uy! Hubo un problema al enviar el mensaje.';
            }
            mensajeFeedback.classList.add('error');
            submitButton.disabled = false;
        }
    } catch (error) {
        console.error('Error de red al enviar mensaje:', error);
        mensajeFeedback.textContent = 'Error de red. Revisa tu conexión e intenta de nuevo.';
        mensajeFeedback.classList.add('error');
        submitButton.disabled = false;
    }
}

function abrirModalReglas() {
    modalMensaje.classList.add('oculto'); // Ocultar otros modales
    modalReglas.classList.remove('oculto');
}

function cerrarModalReglas() {
    modalReglas.classList.add('oculto');
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
botonAbrirMensaje.addEventListener('click', abrirModalMensaje);
botonCerrarMensaje.addEventListener('click', cerrarModalMensaje);
formMensaje.addEventListener('submit', manejarEnvioMensaje);
botonMostrarReglas.addEventListener('click', abrirModalReglas);
botonCerrarReglas.addEventListener('click', cerrarModalReglas);
modalReglas.addEventListener('click', (event) => { // Cerrar al hacer clic fuera
    if (event.target === modalReglas) { cerrarModalReglas(); }
});
modalMensaje.addEventListener('click', (event) => { // Cerrar al hacer clic fuera
    if (event.target === modalMensaje) { cerrarModalMensaje(); }
});


// --- Fin del script ---
