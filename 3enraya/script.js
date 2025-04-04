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

// NUEVAS REFERENCIAS para Modal de Reglas
const botonMostrarReglas = document.getElementById('boton-mostrar-reglas');
const modalReglas = document.getElementById('modal-reglas');
const botonCerrarReglas = document.getElementById('boton-cerrar-reglas');

// --- Constantes y Variables del Juego ---
// (Sin cambios aquí...)
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
const DURACION_EJERCICIO = 15;

// --- Funciones ---

function cargarPreguntas() { /* ... (sin cambios) ... */ }
function cargarEjercicios() { /* ... (sin cambios) ... */ }
function actualizarMarcadorDisplay() { /* ... (sin cambios) ... */ }
function actualizarResaltadoFoto() { /* ... (sin cambios) ... */ }

function iniciarRonda() {
    // ... (lógica existente)
    // Asegurar que todos los modales estén ocultos al iniciar ronda
    pantallaInicial.classList.add('oculto');
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto'); // Ocultar modal de reglas también
    juegoContenedor.classList.remove('oculto');
    // ... (resto de la función sin cambios) ...
}

function manejarClickCelda(evento) { /* ... (sin cambios) ... */ }
function comprobarVictoria(marca) { /* ... (sin cambios) ... */ }
function comprobarEmpate() { /* ... (sin cambios) ... */ }
function cambiarTurno() { /* ... (sin cambios) ... */ }
function finalizarJuego(esEmpate) { /* ... (sin cambios) ... */ }
function mostrarEjercicioPausa() { /* ... (sin cambios) ... */ }
function iniciarContadorEjercicio(segundos) { /* ... (sin cambios) ... */ }
function mostrarPregunta() { /* ... (sin cambios) ... */ }
function manejarRespuestaPregunta(evento) { /* ... (sin cambios) ... */ }
function procesarResultadoPregunta(fueCorrecta) { /* ... (sin cambios) ... */ }

function mostrarGanadorDelJuego(ganador) {
    // Asegurar que otros modales estén ocultos
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto');
    pantallaGanador.classList.remove('oculto');
    // ... (resto de la función sin cambios) ...
}

function iniciarNuevoJuegoCompleto() {
    // Asegurar que otros modales estén ocultos
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto');
    // ... (resto de la función sin cambios) ...
    cargarPreguntas();
    cargarEjercicios();
    iniciarRonda();
}

function cerrarPantallaGanador() {
    // Asegurar que otros modales estén ocultos
    pantallaGanador.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto');
    pantallaInicial.classList.remove('oculto'); // Mostrar inicio
    // ... (resto de la función sin cambios) ...
}

function resaltarCeldasGanadoras(combinacion, celdasDOM) { /* ... (sin cambios) ... */ }

// --- Funciones y Listeners para Modal de Mensaje ---

function abrirModalMensaje() {
    // Ocultar otros modales/pantallas
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
    // Volver a mostrar la pantalla inicial por defecto
    if (juegoContenedor.classList.contains('oculto') &&
        pantallaGanador.classList.contains('oculto')) {
        pantallaInicial.classList.remove('oculto');
    } // Solo muestra inicio si no hay otra pantalla activa
}

async function manejarEnvioMensaje(event) { /* ... (sin cambios) ... */ }

// --- NUEVAS Funciones y Listeners para Modal de Reglas ---

/** Abre el modal de reglas */
function abrirModalReglas() {
    // Ocultar otros modales/pantallas si es necesario
    modalMensaje.classList.add('oculto');
    // Podrías decidir si ocultar juego/ganador/pregunta/ejercicio si se abre desde allí,
    // pero como está en la pantalla inicial, solo ocultamos el de mensaje por si acaso.

    modalReglas.classList.remove('oculto');
}

/** Cierra el modal de reglas */
function cerrarModalReglas() {
    modalReglas.classList.add('oculto');
    // No necesita mostrar ninguna otra pantalla por defecto si se cierra
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

// Listeners para Modal de Mensaje
botonAbrirMensaje.addEventListener('click', abrirModalMensaje);
botonCerrarMensaje.addEventListener('click', cerrarModalMensaje);
formMensaje.addEventListener('submit', manejarEnvioMensaje);

// NUEVOS Listeners para Modal de Reglas
botonMostrarReglas.addEventListener('click', abrirModalReglas);
botonCerrarReglas.addEventListener('click', cerrarModalReglas);
// Opcional: Cerrar modal reglas al hacer clic fuera del contenido
modalReglas.addEventListener('click', (event) => {
    if (event.target === modalReglas) { // Si el clic es en el fondo del modal
        cerrarModalReglas();
    }
});


// --- Fin del script ---
