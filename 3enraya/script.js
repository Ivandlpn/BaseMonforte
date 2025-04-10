--- START OF FILE script.js ---

// --- Configuración Inicial: Fondo de Portada Aleatorio ---
const imagenesPortadaDisponibles = [ 'portada1.png', 'portada2.png', 'portada3.png' ];
function establecerFondoAleatorio() { /* ... (sin cambios) ... */ }

// --- DATOS DE JUGADORES DISPONIBLES ---
const JUGADORES_DISPONIBLES = [ /* ... (sin cambios) ... */ ];

// --- Referencias a Elementos del DOM ---
const pantallaSeleccion = document.getElementById('pantalla-seleccion-jugador');
const seleccionContenedor = document.getElementById('seleccion-contenedor');
const seleccionFeedback = document.getElementById('seleccion-feedback');
const botonConfirmarSeleccion = document.getElementById('boton-confirmar-seleccion');
const pantallaInicial = document.getElementById('pantalla-inicial');
const juegoContenedor = document.getElementById('juego-contenedor');
const infoTurno = document.getElementById('info-turno');
const botonReiniciar = document.getElementById('boton-reiniciar');
const nombreJugador1Elem = document.getElementById('nombre-jugador1');
const puntajeJugador1Elem = document.getElementById('puntaje-jugador1');
const fotoJugador1Elem = document.getElementById('foto-jugador1');
const nombreJugador2Elem = document.getElementById('nombre-jugador2');
const puntajeJugador2Elem = document.getElementById('puntaje-jugador2');
const fotoJugador2Elem = document.getElementById('foto-jugador2');
const pantallaGanador = document.getElementById('pantalla-ganador');
const textoGanadorElem = document.getElementById('texto-ganador');
const fotoGanadorElem = document.getElementById('foto-ganador');
const nombreGanadorElem = document.getElementById('nombre-ganador');
const botonVolverAElegir = document.getElementById('boton-volver-a-elegir');
const botonSalirASeleccion = document.getElementById('boton-salir-a-seleccion');
const pantallaPregunta = document.getElementById('pantalla-pregunta');
const tituloPreguntaElem = document.getElementById('titulo-pregunta');
const textoPreguntaElem = document.getElementById('texto-pregunta');
const opcionesPreguntaContenedor = document.getElementById('opciones-pregunta');
const feedbackPreguntaElem = document.getElementById('feedback-pregunta');
// Referencias cambiadas para la pantalla de curiosidad
const pantallaCuriosidad = document.getElementById('pantalla-curiosidad'); // ID cambiado
const textoCuriosidadElem = document.getElementById('texto-curiosidad'); // ID cambiado
const botonCerrarCuriosidad = document.getElementById('boton-cerrar-curiosidad'); // Nuevo botón
// Referencias para modales (sin cambios)
const botonAbrirMensaje = document.getElementById('boton-abrir-mensaje');
const modalMensaje = document.getElementById('modal-mensaje');
const botonCerrarMensaje = document.getElementById('boton-cerrar-mensaje');
const formMensaje = document.getElementById('form-mensaje');
const mensajeFeedback = document.getElementById('mensaje-feedback');
const botonMostrarReglas = document.getElementById('boton-mostrar-reglas');
const modalReglas = document.getElementById('modal-reglas');
const botonCerrarReglas = document.getElementById('boton-cerrar-reglas');

// --- Constantes y Variables del Juego ---
const MARCA_J1 = 'X';
const MARCA_J2 = 'O';
const PUNTOS_PARA_GANAR = 3;

let jugador1Seleccionado = null;
let jugador2Seleccionado = null;
let jugadorActual = null;
let jugadorQueRespondioPregunta = null;
let juegoActivo = false;
let estadoTablero = ['', '', '', '', '', '', '', '', ''];
const COMBINACIONES_GANADORAS = [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6] ];
let puntajeJugador1 = 0;
let puntajeJugador2 = 0;
let listaPreguntasDisponibles = [];
let respuestaCorrectaActual = null;
let tipoPreguntaActual = null;
let listaCuriosidadesDisponibles = []; // Cambiado de listaEjerciciosDisponibles
// Eliminadas variables de contador de ejercicio

// --- Funciones ---

function mostrarPantallaSeleccion() {
    console.log("Mostrando pantalla de selección...");
    establecerFondoAleatorio();

    pantallaInicial.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaCuriosidad.classList.add('oculto'); // Ocultar pantalla curiosidad
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto');

    jugador1Seleccionado = null;
    jugador2Seleccionado = null;
    puntajeJugador1 = 0;
    puntajeJugador2 = 0;
    jugadorActual = null;
    jugadorQueRespondioPregunta = null;
    juegoActivo = false;

    seleccionContenedor.innerHTML = '';
    seleccionFeedback.classList.add('oculto');
    seleccionFeedback.textContent = '';
    botonConfirmarSeleccion.disabled = true;

    JUGADORES_DISPONIBLES.forEach(jugador => { /* ... (sin cambios en la creación de tarjetas) ... */ });

    pantallaSeleccion.classList.remove('oculto');
}

function manejarClickSeleccionJugador(evento) { /* ... (sin cambios) ... */ }
function actualizarEstadoBotonConfirmar() { /* ... (sin cambios) ... */ }

function iniciarJuegoConSeleccionados() {
    if (!jugador1Seleccionado || !jugador2Seleccionado) {
        console.error("Intento de iniciar juego sin 2 jugadores seleccionados.");
        return;
    }
    console.log(`Iniciando juego con: ${jugador1Seleccionado.nombre} (X) vs ${jugador2Seleccionado.nombre} (O)`);

    cargarPreguntas();
    cargarCuriosidades(); // Llamar a cargar curiosidades

    pantallaSeleccion.classList.add('oculto');

    // Actualizar marcador (sin cambios)
    nombreJugador1Elem.textContent = jugador1Seleccionado.nombre.toUpperCase();
    fotoJugador1Elem.src = jugador1Seleccionado.imagen;
    fotoJugador1Elem.alt = `Foto ${jugador1Seleccionado.nombre}`;
    puntajeJugador1Elem.textContent = puntajeJugador1;
    puntajeJugador1Elem.dataset.lastScore = 0;
    nombreJugador2Elem.textContent = jugador2Seleccionado.nombre.toUpperCase();
    fotoJugador2Elem.src = jugador2Seleccionado.imagen;
    fotoJugador2Elem.alt = `Foto ${jugador2Seleccionado.nombre}`;
    puntajeJugador2Elem.textContent = puntajeJugador2;
    puntajeJugador2Elem.dataset.lastScore = 0;

    iniciarRonda();
}

function cargarPreguntas() { /* ... (sin cambios) ... */ }

// Función renombrada y modificada para cargar curiosidades
function cargarCuriosidades() {
    if (typeof curiosidadesDivertidas !== 'undefined' && Array.isArray(curiosidadesDivertidas)) {
         listaCuriosidadesDisponibles = JSON.parse(JSON.stringify(curiosidadesDivertidas)); // Usar el array correcto
         console.log("Curiosidades cargadas:", listaCuriosidadesDisponibles.length); // Mensaje actualizado
    } else {
        console.error("Error: 'curiosidadesDivertidas' no definido o no es un array."); // Mensaje actualizado
        listaCuriosidadesDisponibles = [];
    }
}

function actualizarMarcadorDisplay() { /* ... (sin cambios) ... */ }

function actualizarResaltadoFoto() {
    // Ligera modificación para manejar la pantalla de curiosidad
    const pantallaPreguntaVisible = !pantallaPregunta.classList.contains('oculto');
    const pantallaCuriosidadVisible = !pantallaCuriosidad.classList.contains('oculto'); // Comprobar pantalla curiosidad

    if (!jugador1Seleccionado || !jugador2Seleccionado) return;

    const jugadorActivoONo = jugadorQueRespondioPregunta || jugadorActual;

    // Mantener resaltado si está en pantalla de pregunta O curiosidad
    if (!juegoActivo && (pantallaPreguntaVisible || pantallaCuriosidadVisible) && jugadorActivoONo) {
        if (jugadorActivoONo.nombre === jugador1Seleccionado.nombre) {
            fotoJugador1Elem.classList.add('activa');
            fotoJugador2Elem.classList.remove('activa');
        } else if (jugadorActivoONo.nombre === jugador2Seleccionado.nombre) {
            fotoJugador2Elem.classList.add('activa');
            fotoJugador1Elem.classList.remove('activa');
        } else { // Si no hay jugador activo (ej. tras empate antes de cerrar curiosidad)
            fotoJugador1Elem.classList.remove('activa');
            fotoJugador2Elem.classList.remove('activa');
        }
        return; // Importante: salir aquí para no quitar el resaltado
    }
     // Si está en la pantalla de curiosidad pero el juego no está activo y NO hay jugador definido (caso empate)
     if (!juegoActivo && pantallaCuriosidadVisible && !jugadorActivoONo) {
        fotoJugador1Elem.classList.remove('activa');
        fotoJugador2Elem.classList.remove('activa');
        return;
     }

    if (!juegoActivo) {
        fotoJugador1Elem.classList.remove('activa');
        fotoJugador2Elem.classList.remove('activa');
        return;
    }

    // Resaltado normal durante el juego
    if (jugadorActual && jugadorActual.nombre === jugador1Seleccionado.nombre) {
        fotoJugador1Elem.classList.add('activa');
        fotoJugador2Elem.classList.remove('activa');
    } else if (jugadorActual && jugadorActual.nombre === jugador2Seleccionado.nombre) {
        fotoJugador2Elem.classList.add('activa');
        fotoJugador1Elem.classList.remove('activa');
    } else {
        fotoJugador1Elem.classList.remove('activa');
        fotoJugador2Elem.classList.remove('activa');
    }
}


function iniciarRonda() {
    if (!jugador1Seleccionado || !jugador2Seleccionado) { /* ... (sin cambios) ... */ }

    estadoTablero = ['', '', '', '', '', '', '', '', ''];
    juegoActivo = true;
    respuestaCorrectaActual = null;
    tipoPreguntaActual = null;
    jugadorQueRespondioPregunta = null;
    // No hay intervalo de ejercicio que limpiar

    jugadorActual = (Math.random() < 0.5) ? jugador1Seleccionado : jugador2Seleccionado;

    pantallaSeleccion.classList.add('oculto');
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaCuriosidad.classList.add('oculto'); // Ocultar pantalla curiosidad
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');

    botonReiniciar.classList.add('oculto');
    botonVolverAElegir.classList.add('oculto');
    botonSalirASeleccion.classList.add('oculto');

    actualizarMarcadorDisplay();
    actualizarResaltadoFoto();

    const marcaInicial = (jugadorActual.nombre === jugador1Seleccionado.nombre) ? MARCA_J1 : MARCA_J2;
    infoTurno.textContent = `¡Turno de ${jugadorActual.nombre}! (${marcaInicial})`;

    const tablero = document.getElementById('tablero');
    const celdasActuales = tablero.querySelectorAll('.celda');
    celdasActuales.forEach(celda => { /* ... (limpieza de celdas sin cambios) ... */ });
    console.log(`Ronda iniciada. Empieza: ${jugadorActual.nombre}. Marcador: ${jugador1Seleccionado.nombre} ${puntajeJugador1} - ${jugador2Seleccionado.nombre} ${puntajeJugador2}`);
}

function manejarClickCelda(evento) { /* ... (sin cambios) ... */ }
function comprobarVictoria(marca) { /* ... (sin cambios) ... */ }
function comprobarEmpate() { /* ... (sin cambios) ... */ }
function cambiarTurno() { /* ... (sin cambios) ... */ }

function finalizarJuego(esEmpate) {
    juegoActivo = false;
    const celdasFinalizadas = document.querySelectorAll('.celda');
    celdasFinalizadas.forEach(celda => { celda.style.cursor = 'default'; });

    if (esEmpate) {
        // Cambios para mostrar curiosidad en lugar de ejercicio
        infoTurno.textContent = "¡Oh! ¡Empate! 🤝 ¡Mira este Dato Curioso!";
        console.log("Ronda finalizada: Empate.");
        jugadorActual = null; // Nadie es "activo" tras empate
        actualizarResaltadoFoto(); // Quitar resaltado
        setTimeout(mostrarCuriosidad, 1500); // Llamar a mostrarCuriosidad
    } else {
        infoTurno.textContent = `¡Bien hecho ${jugadorActual.nombre}! 👍 Responde para ganar el punto...`;
        console.log(`Ronda finalizada: Ganador ${jugadorActual.nombre}. Esperando pregunta.`);
        jugadorQueRespondioPregunta = jugadorActual;
        // No es necesario llamar a actualizarResaltadoFoto aquí, ya debería estar resaltado
        setTimeout(mostrarPregunta, 1800);
    }
}

// Función renombrada y modificada para mostrar curiosidad
function mostrarCuriosidad() {
    if (listaCuriosidadesDisponibles.length === 0) {
        console.log("No quedan curiosidades, recargando...");
        cargarCuriosidades(); // Cargar más curiosidades
        if(listaCuriosidadesDisponibles.length === 0) {
             console.error("¡Fallo crítico al cargar curiosidades!");
             botonReiniciar.classList.remove('oculto');
             infoTurno.textContent = "¡Empate! Hubo un problema con la curiosidad..."; // Mensaje de error
             actualizarResaltadoFoto();
             return;
        }
    }
    const indiceCuriosidad = Math.floor(Math.random() * listaCuriosidadesDisponibles.length);
    const curiosidad = listaCuriosidadesDisponibles.splice(indiceCuriosidad, 1)[0];

    // Actualizar el texto en la pantalla de curiosidad
    textoCuriosidadElem.textContent = (curiosidad.icono ? curiosidad.icono + " " : "") + curiosidad.texto;

    pantallaCuriosidad.classList.remove('oculto'); // Mostrar la pantalla correcta
    // No hay contador que iniciar
}

// Eliminada la función iniciarContadorEjercicio

function mostrarPregunta() { /* ... (sin cambios lógicos internos, pero asegura llamar a cargarPreguntas si se vacía) ... */ }
function manejarRespuestaPregunta(evento) { /* ... (sin cambios) ... */ }
function procesarResultadoPregunta(fueCorrecta) { /* ... (sin cambios) ... */ }
function mostrarGanadorDelJuego(ganador) { /* ... (sin cambios) ... */ }
function volverAElegirJugadores() { /* ... (sin cambios) ... */ }
function resaltarCeldasGanadoras(combinacion, celdasDOM) { /* ... (sin cambios) ... */ }

// --- Funciones Modales ---
function abrirModalMensaje() { /* ... (sin cambios, pero asegura ocultar pantallaCuriosidad) ... */
    pantallaCuriosidad.classList.add('oculto');
    // ... resto del código sin cambios
}
function cerrarModalMensaje() { /* ... (sin cambios en la lógica de regreso) ... */ }
async function manejarEnvioMensaje(event) { /* ... (sin cambios) ... */ }
function abrirModalReglas() { /* ... (sin cambios, pero asegura ocultar pantallaCuriosidad) ... */
     pantallaCuriosidad.classList.add('oculto');
    // ... resto del código sin cambios
}
function cerrarModalReglas() { /* ... (sin cambios en la lógica de regreso) ... */ }


// --- Nueva Función para cerrar la pantalla de curiosidad ---
function cerrarCuriosidad() {
    pantallaCuriosidad.classList.add('oculto'); // Oculta la pantalla
    infoTurno.textContent = "¡Qué interesante! 🤔 ¿Listos para la siguiente ronda?"; // Mensaje opcional
    botonReiniciar.classList.remove('oculto'); // Muestra el botón para la siguiente ronda
    console.log("Curiosidad cerrada.");

    // Quitar resaltado (ya que jugadorActual es null después de empate)
    actualizarResaltadoFoto();
}


// --- Event Listeners Iniciales ---
document.addEventListener('DOMContentLoaded', mostrarPantallaSeleccion);
botonConfirmarSeleccion.addEventListener('click', iniciarJuegoConSeleccionados);
botonReiniciar.addEventListener('click', iniciarRonda);
botonVolverAElegir.addEventListener('click', volverAElegirJugadores);
botonSalirASeleccion.addEventListener('click', volverAElegirJugadores);
// Modales (sin cambios)
botonAbrirMensaje.addEventListener('click', abrirModalMensaje);
botonCerrarMensaje.addEventListener('click', cerrarModalMensaje);
formMensaje.addEventListener('submit', manejarEnvioMensaje);
botonMostrarReglas.addEventListener('click', abrirModalReglas);
botonCerrarReglas.addEventListener('click', cerrarModalReglas);
// Nuevo listener para el botón de cerrar curiosidad
botonCerrarCuriosidad.addEventListener('click', cerrarCuriosidad);

// --- Fin del script ---
console.log("Script del juego (con curiosidades) cargado y listo.");
--- END OF FILE script.js ---
