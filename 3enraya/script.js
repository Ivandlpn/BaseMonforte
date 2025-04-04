// --- Referencias a Elementos del DOM ---
// (Referencias anteriores sin cambios)
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

// NUEVAS REFERENCIAS para pantalla de ejercicio
const pantallaEjercicio = document.getElementById('pantalla-ejercicio');
const nombreEjercicioElem = document.getElementById('nombre-ejercicio');
const contadorEjercicioElem = document.getElementById('contador-ejercicio');

// --- Constantes y Variables del Juego ---
// (Constantes JUGADORES, MARCAS, PUNTOS_PARA_GANAR, COMBINACIONES sin cambios)
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

// Variables Quiz
let listaPreguntasDisponibles = [];
let respuestaCorrectaActual = null;

// NUEVAS Variables Ejercicio
let listaEjerciciosDisponibles = [];
let intervaloContadorEjercicio = null; // Para poder limpiar el intervalo
const DURACION_EJERCICIO = 10; // Segundos


// --- Funciones ---

/** Carga/Recarga la lista de preguntas disponibles */
function cargarPreguntas() { /* ... (sin cambios) ... */
    if (typeof preguntasQuiz !== 'undefined' && Array.isArray(preguntasQuiz)) {
         listaPreguntasDisponibles = JSON.parse(JSON.stringify(preguntasQuiz));
         console.log("Preguntas (re)cargadas:", listaPreguntasDisponibles.length);
    } else {
        console.error("Error: 'preguntasQuiz' no definido.");
        listaPreguntasDisponibles = [];
    }
}

/** NUEVA FUNCIÓN: Carga/Recarga la lista de ejercicios disponibles */
function cargarEjercicios() {
     if (typeof ejerciciosPausa !== 'undefined' && Array.isArray(ejerciciosPausa)) {
         listaEjerciciosDisponibles = JSON.parse(JSON.stringify(ejerciciosPausa));
         console.log("Ejercicios (re)cargados:", listaEjerciciosDisponibles.length);
    } else {
        console.error("Error: 'ejerciciosPausa' no definido. Asegúrate de que ejercicios.js se carga antes.");
        listaEjerciciosDisponibles = [];
    }
}


function actualizarMarcadorDisplay() { /* ... (sin cambios) ... */ }
function actualizarResaltadoFoto() { /* ... (sin cambios) ... */ }

function iniciarRonda() {
    // (Lógica de resetear estado, elegir jugador sin cambios)
    estadoTablero = ['', '', '', '', '', '', '', '', ''];
    juegoActivo = true;
    respuestaCorrectaActual = null;
    jugadorQueRespondioPregunta = null;
    // Limpiar contador si quedó alguno activo por error
    if (intervaloContadorEjercicio) clearInterval(intervaloContadorEjercicio);

    if (puntajeHugo === 0 && puntajeSaul === 0 || Math.random() < 0.5 ) {
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
    } else {
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
    }

    // Gestionar visibilidad - Asegurar que ejercicio esté oculto
    pantallaInicial.classList.add('oculto');
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto'); // Ocultar pantalla ejercicio
    juegoContenedor.classList.remove('oculto');
    botonReiniciar.classList.add('oculto');
    botonNuevoJuego.classList.add('oculto');
    botonVolverAJugar.classList.add('oculto');
    botonCerrarGanador.classList.add('oculto');

    // (Actualizar UI y limpiar tablero sin cambios)
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

function manejarClickCelda(evento) { /* ... (sin cambios) ... */ }
function comprobarVictoria(marca) { /* ... (sin cambios) ... */ }
function comprobarEmpate() { /* ... (sin cambios) ... */ }
function cambiarTurno() { /* ... (sin cambios) ... */ }

/**
 * Finaliza la ronda actual. Muestra pregunta si hay ganador,
 * o inicia pausa activa si hay empate.
 */
function finalizarJuego(esEmpate) {
    juegoActivo = false;
    const celdasFinalizadas = document.querySelectorAll('.celda');
    celdasFinalizadas.forEach(celda => {
         celda.style.cursor = 'default';
    });

    if (esEmpate) {
        // --- ¡CAMBIO AQUÍ! EN CASO DE EMPATE ---
        infoTurno.textContent = "¡Oh! ¡Empate! 🤝 ¡Vamos con una Pausa Activa!";
        console.log("Ronda finalizada: Empate. Iniciando Pausa Activa.");
        actualizarResaltadoFoto(); // Quitar resaltado
        // NO mostrar botón reiniciar todavía
        setTimeout(() => { // Pequeña pausa antes de mostrar ejercicio
            mostrarEjercicioPausa();
        }, 1500);

    } else {
        // Ganador de ronda -> Mostrar pregunta (como antes)
        infoTurno.textContent = `¡Bien hecho ${jugadorActual}! 👍 Responde para ganar el punto...`;
        console.log(`Ronda finalizada: Ganador ${jugadorActual}. Esperando pregunta.`);
        jugadorQueRespondioPregunta = jugadorActual;
        actualizarResaltadoFoto();
        setTimeout(() => {
            mostrarPregunta();
        }, 1800);
    }
}

/**
 * NUEVA FUNCIÓN: Muestra la pantalla de Pausa Activa con un ejercicio aleatorio.
 */
function mostrarEjercicioPausa() {
     // Si se acaban los ejercicios, recargarlos
    if (listaEjerciciosDisponibles.length === 0) {
        console.log("Recargando lista de ejercicios.");
        cargarEjercicios();
        // Salir si sigue sin haber ejercicios (error en carga)
        if(listaEjerciciosDisponibles.length === 0) {
             console.error("No se pudieron cargar ejercicios. Saltando pausa activa.");
             botonReiniciar.classList.remove('oculto'); // Mostrar botón para continuar
             infoTurno.textContent = "¡Empate! Algo falló con la pausa activa...";
             return;
        }
    }

    // Seleccionar ejercicio aleatorio y quitarlo de la lista temporalmente
    const indiceEjercicio = Math.floor(Math.random() * listaEjerciciosDisponibles.length);
    const ejercicio = listaEjerciciosDisponibles.splice(indiceEjercicio, 1)[0];

    // Actualizar UI del ejercicio
    nombreEjercicioElem.textContent = `${ejercicio.icono || ''} ${ejercicio.nombre}`;
    contadorEjercicioElem.textContent = DURACION_EJERCICIO; // Mostrar contador inicial

    // Mostrar pantalla
    pantallaEjercicio.classList.remove('oculto');

    // Iniciar contador
    iniciarContadorEjercicio(DURACION_EJERCICIO);
}

/**
 * NUEVA FUNCIÓN: Inicia el contador regresivo para el ejercicio.
 */
function iniciarContadorEjercicio(segundos) {
    let tiempoRestante = segundos;
    // Limpiar intervalo anterior si existe
    if (intervaloContadorEjercicio) clearInterval(intervaloContadorEjercicio);

    contadorEjercicioElem.textContent = tiempoRestante; // Mostrar valor inicial

    intervaloContadorEjercicio = setInterval(() => {
        tiempoRestante--;
        contadorEjercicioElem.textContent = tiempoRestante;

        if (tiempoRestante <= 0) {
            clearInterval(intervaloContadorEjercicio); // Detener contador
            intervaloContadorEjercicio = null;
            pantallaEjercicio.classList.add('oculto'); // Ocultar pantalla ejercicio
            infoTurno.textContent = "¡Energía recargada! 🔥 ¿Listos para la siguiente?";
            botonReiniciar.classList.remove('oculto'); // Mostrar botón para seguir
            console.log("Pausa activa completada.");
        }
    }, 1000); // Ejecutar cada segundo
}


// --- Funciones de Preguntas y Resultados (sin cambios internos relevantes) ---
function mostrarPregunta() { /* ... (sin cambios) ... */ }
function manejarRespuestaPregunta(evento) { /* ... (sin cambios) ... */ }
function procesarResultadoPregunta(fueCorrecta) { /* ... (sin cambios) ... */ }
function mostrarGanadorDelJuego(ganador) {
    // Asegurarse de ocultar también la pantalla de ejercicio
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto'); // Ocultar ejercicio
    pantallaGanador.classList.remove('oculto');
    // Resto sin cambios...
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
    cargarEjercicios(); // Cargar también los ejercicios

    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto'); // Ocultar ejercicio
    botonVolverAJugar.classList.add('oculto');
    botonCerrarGanador.classList.add('oculto');

    iniciarRonda();
}
function cerrarPantallaGanador() {
    // Asegurarse de ocultar ejercicio
    console.log("Cerrando pantalla de ganador y volviendo al inicio.");
    pantallaGanador.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto'); // Ocultar ejercicio
    pantallaInicial.classList.remove('oculto');
    puntajeHugo = 0;
    puntajeSaul = 0;
    actualizarMarcadorDisplay();
}
function resaltarCeldasGanadoras(combinacion, celdasDOM) { /* ... (sin cambios) ... */ }

// --- Event Listeners Iniciales ---
botonComenzar.addEventListener('click', () => {
    cargarPreguntas();
    cargarEjercicios(); // Cargar ejercicios al empezar
    iniciarRonda();
});
botonReiniciar.addEventListener('click', iniciarRonda);
botonVolverAJugar.addEventListener('click', iniciarNuevoJuegoCompleto);
botonCerrarGanador.addEventListener('click', cerrarPantallaGanador);

// --- Fin del script ---
