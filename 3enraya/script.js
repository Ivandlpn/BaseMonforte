// --- Refer y pasarla explícitamente.

**Código Corregido (`script.js`):**

Soloencias a Elementos del DOM ---
// (Sin cambios aquí...)
const boton necesitas modificar la función `procesarResultadoPregunta`.

```javascript
//Comenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');
const juegoContenedor = document.getElementById('juego-contenedor');
const infoTurno = document.getElementById('info --- Referencias a Elementos del DOM ---
// ... (sin cambios) ...
const botonComenzar = document.getElementById('boton-comenzar');
const-turno');
const botonReiniciar = document.getElementById('boton-reiniciar');
const puntajeHugoElem = document.getElementById('puntaje-hugo');
const puntajeSaulElem = document.getElementById('puntaje-saul'); pantallaInicial = document.getElementById('pantalla-inicial');
const juegoContenedor = document.getElementById('juego-contenedor');
const infoTurno = document.getElementById('info
const fotoHugoElem = document.getElementById('foto-hugo');
const fotoSaulElem = document.getElementById('foto-saul');
-turno');
const botonReiniciar = document.getElementById('boton-reiniciar');
const puntajeHugoElem = document.getElementById('puntaje-hugo');
constconst pantallaGanador = document.getElementById('pantalla-ganador');
const textoGanadorElem = document.getElementById('texto-ganador');
 puntajeSaulElem = document.getElementById('puntaje-saul');
const fotoHugoElem = document.getElementById('foto-hugo');
const fotoGanadorElem = document.getElementById('foto-ganador');
const nombreGanadorElem = document.getElementById('nombre-ganador');
const botonNuevoJuego = document.getElementById('boton-nuevo-juego');
const botonVolverAJugar = document.getElementById('boton-volverconst fotoSaulElem = document.getElementById('foto-saul');
const pantallaGanador = document.getElementById('pantalla-ganador');
const textoGanadorElem = document.getElementById('texto-ganador');
const fotoGanadorElem = document.getElementById('foto-ganador');
-a-jugar');
const botonCerrarGanador = document.getElementById('boton-cerrar-ganador');
const pantallaPregunta = document.getElementById('pantalla-pregunta');
const tituloPreguntaElem = document.getElementById('titulo-pregunta');
const textoconst nombreGanadorElem = document.getElementById('nombre-ganador');
const botonNuevoJuego = document.getElementById('boton-nuevo-juego');
const botonVolverAJugar = document.getElementById('boton-volver-a-jugar');
const botonCerrarGanador = documentPreguntaElem = document.getElementById('texto-pregunta');
const opcionesPreguntaContenedor = document.getElementById('opciones-pregunta');
const feedbackPreguntaElem = document.getElementById('feedback-pregunta');.getElementById('boton-cerrar-ganador');
const pantallaPregunta = document.getElementById('pantalla
const pantallaEjercicio = document.getElementById('pantalla-ejercicio');
const nombreEjercicioElem = document.getElementById('nombre-ejercicio');
const-pregunta');
const tituloPreguntaElem = document.getElementById('titulo-pregunta');
const textoPreguntaElem = document.getElementById('texto-pregunta');
const opcionesPreguntaContenedor = document.getElementById('opciones-pregunta'); contadorEjercicioElem = document.getElementById('contador-ejercicio');


// --- Constantes y Variables del Juego
const feedbackPreguntaElem = document.getElementById('feedback-pregunta');
const pantallaEjercicio = document.getElementById('pantalla-ejercicio');
 ---
// (Sin cambios aquí...)
const JUGADORES = ['Hugo', 'Saúl'];
const MARCA_HUGO = 'X';
const MARCA_SAconst nombreEjercicioElem = document.getElementById('nombre-ejercicio');
const contadorEjercicioElem = document.getElementById('contador-ejercicio');

// ---UL = 'O';
const PUNTOS_PARA_GANAR = 3;
let jugadorActual;
let jugadorQueRespondioPregunta;
let juego Constantes y Variables del Juego ---
// ... (sin cambios) ...
const JUGADORES = ['Hugo', 'Saúl'];
const MARCA_HUGO = 'X';
const MARCA_SAUL = 'O';
const PUNTActivo = false;
let estadoTablero = ['', '', '', '', '', '', '', '', ''];
const COMBINACIONES_GANADORAS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [OS_PARA_GANAR = 3;
let jugadorActual;
let jugadorQueRespondioPregunta;
let juegoActivo = false;
let estadoTablero = ['', '', '', '', '', '', '', '', ''];
const COMBINACIONES_GANADORAS = [
    [0, 1,1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
];
let puntajeHugo = 0;
let puntajeSaul = 0;
let listaPreguntasDisponibles 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
];
let puntajeHugo = 0;
let punt = [];
let respuestaCorrectaActual = null;
let listaEjerciciosDisponibles = [];
let intervaloContadorEjercicio = null;
const DURACION_EJERCICIO = 15; // Ajustado a 15 segundos

// --- Funciones ---
function cargarPreguntas() { /* ... (sin cambios) ... */ }
functionajeSaul = 0;
let listaPreguntasDisponibles = [];
let respuestaCorrectaActual = null;
let listaEjerciciosDisponibles = [];
let intervaloContadorEjercicio = null;
const DURACION_EJERCICIO =  cargarEjercicios() { /* ... (sin cambios) ... */ }
function actualizarMarcadorDisplay() { /* ... (sin cambios) ... */ }
function actualizarResaltadoFoto() { /* ... (sin cambios) ...15; // (o 10 si no lo cambiaste)


// */ }
function iniciarRonda() { /* ... (sin cambios) ... --- Funciones ---
// ... (cargarPreguntas, cargarEjercicios, actualizarMarcadorDisplay */ }
function manejarClickCelda(evento) { /* ... (sin cambios) ... */ }
function comprobarVictoria(marca) { /* ... (sin cambios) ... */ }
function, actualizarResaltadoFoto, iniciarRonda, manejarClickCelda, comprobar comprobarEmpate() { /* ... (sin cambios) ... */ }
function cambiarVictoria, comprobarEmpate, cambiarTurno, finalizarJuego, mostrarEjercicioTurno() { /* ... (sin cambios) ... */ }
function finalizarJuego(esEmpate) { /* ... (sin cambios) ... */Pausa, iniciarContadorEjercicio, mostrarPregunta, manejarRespuestaPregunta - SIN CAMBIOS) ...

/**
 * Procesa el resultado de la pregunta (correcta/incorrecta). }
function mostrarEjercicioPausa() { /* ... (sin cambios) ... */ }
function iniciarContadorEjercicio(segundos) { /* ... (sin cambios) ... */ }
function mostrarPregunta() { /* ... (sin cambios) ... */
 * Actualiza marcador, mensaje y comprueba victoria final.
 */
function procesarResultadoPreg }
function manejarRespuestaPregunta(evento) { /* ... (sinunta(fueCorrecta) {
    pantallaPregunta.classList. cambios) ... */ }


/**
 * Procesa el resultado de la pregunta,add('oculto');
    actualizarResaltadoFoto();

 actualiza marcador y mensaje principal,
 * comprueba victoria del juego y muestra siguiente    let mensajeResultado = "";
    // --- CAPTURAR EL GANADOR ANTES DE RESET paso.
 * CORREGIDO: Resetea variables solo si el juego continúa.
 */
EAR ---
    const ganadorDeEstaRonda = jugadorQueRespondioPregfunction procesarResultadoPregunta(fueCorrecta) {
    pantallaPregunta.classList.addunta;

    if (fueCorrecta) {
        // Sumar punto('oculto');
    actualizarResaltadoFoto(); // Qu usando la variable capturada si es necesario, aunque ya está en puntaje[ita el resaltado de "respondiendo"

    let mensajeResultado = "";

    if (fueCorrectaX]Elem
        if (ganadorDeEstaRonda === 'Hugo) {
        // Sumar punto y actualizar display
        if (jugadorQueRespond') {
            puntajeHugo++;
            mensajeResultado = "¡Punto para Hugo! 💪ioPregunta === 'Hugo') {
            puntajeHugo++;
            mensajeResultado = "¡Punto para Hugo! 💪";
        } else";
        } else if (ganadorDeEstaRonda === 'Saúl') {
            puntajeSaul++;
            mensajeResultado = "¡Punto para Saúl if (jugadorQueRespondioPregunta === 'Saúl') {
            puntajeSaul++;
            mensajeResultado = "¡Punto para! 🎉";
        }
        actualizarMarcadorDisplay();
        console.log(`Respuesta correcta. Marcador: Hugo ${puntajeHugo} - Saúl ${ Saúl! 🎉";
        }
        actualizarMarcadorDisplay();
        console.log(`Respuesta correcta. Marcador: Hugo ${puntajeHugo} - Saúl ${puntajeSapuntajeSaul}`);

        // Comprueba si se ganó el JUEGO COMPLETO
        if (puntajeHugo === PUNTOS_PARA_GANAR || puntajeul}`);

        // Comprobar si se ganó el JUEGO COMPLETO
        if (puntajeHugo === PUNTOS_PARA_GANAR || puntajeSaul === PUNTOS_Saul === PUNTOS_PARA_GANAR) {
            infoTurno.textContent = mensajeResultado; // Mostrar último mensaje de punto
             //PARA_GANAR) {
            // --- Juego Terminado ---
            infoTurno.textContent = mensajeResultado; // Mostrar último mensaje de punto
            // ¡IMPORT --- USAR LA VARIABLE CAPTURADA EN EL TIMEOUT ---
             setTimeout((ANTE! No resetear jugadorQueRespondioPregunta aquí
            setTimeout(() => {
                consoleganadorFinal) => {
                console.log(`¡JUEGO TERMINADO POR PUNTOS.log(`¡JUEGO TERMINADO POR PUNTOS! Ganador! Ganador: ${ganadorFinal}`);
                mostrarGanadorDelJuego(ganador: ${jugadorQueRespondioPregunta}`);
                // Ahora jugadorQueRespondioPregunta todavíaFinal); // Pasar la variable capturada
            }, 500, ganadorDeEstaRonda tiene el nombre del ganador
                mostrarGanadorDelJuego(jugadorQueRespondio); // Pasar ganadorDeEstaRonda como argumento al callback
        } else {
            //Pregunta);
            }, 500); // Pausa breve antes de mostrar pantalla El juego continúa, muestra mensaje y luego botón
            infoTurno.textContent final

        } else {
            // --- Juego Continúa ---
            infoTurno.textContent = mensajeResultado;
            setTimeout(() => {
                   = mensajeResultado;
            setTimeout(() => {
                  botonReiniciar.classList.remove('oculto');
             }, 1500);
        }
    } else {
botonReiniciar.classList.remove('oculto');
             }, 1500);
        // Respuesta incorrecta
        // Usar la variable capturada para el mensaje             // ¡Resetear variables AQUÍ porque el juego sigue!
             respuestaCorrectaActual = null;
             jugadorQueRespondioPregunta = null;
        
        mensajeResultado = `¡Ups! ${ganadorDeEstaRonda || 'Alguien'} no sumó el punto. 😅`;
        info}
    } else {
        // --- Respuesta Incorrecta (Juego Continúa) ---
        mensajeResultado = `¡Ups! ${jugadorQueRespondioPregunta} no sumó el punto. 😅`;
        infoTurno.textContent = mensajeResultado;
        Turno.textContent = mensajeResultado;
        console.log("Respuesta incorrecta. No se suma punto.");
        setTimeout(() => {
             botonReiniciar.classList.remove('oculto');
         }, console.log("Respuesta incorrecta. No se suma punto.");
        setTimeout(() => {
             botonReiniciar.classList.remove('oculto1500);
    }

    // --- RESETEAR DESPUÉS DE CONFIGURAR TODO ---
    respuestaCorrectaActual = null;
    jug');
         }, 1500);
         // ¡Resetear variables AQUÍ porque el juego sigue!
         respuestaCorrectaActual = null;
         jugadorQueRespondioPregunta = null;
    }

    adorQueRespondioPregunta = null; // Ahora sí se puede resetear
}


// ... (mostrarGanadorDelJuego, iniciarNuevoJuegoCompleto, cerrar// QUITAR los resets de aquí, ya están dentro de los bloques condicionales dePantallaGanador, resaltarCeldasGanadoras - SIN CAMBIOS EN "juego continúa"
    // respuestaCorrectaActual = null;
    // SU LÓGICA INTERNA) ...

// Asegúrate que mostrarGanadorDelJuego usa jugadorQueRespondioPregunta = null;
}


function mostrarGanadorDelJuego(ganador) {
    // Ahora 'ganador' debería el parámetro 'ganador' correctamente:
function mostrarGanadorDelJuego ser 'Hugo' o 'Saúl', no null
    juegoContenedor.classList.add(ganador) { // 'ganador' es el parámetro que recibe el valor correcto('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('ocult
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallao');
    pantallaGanador.classList.remove('oculto');

    //Ejercicio.classList.add('oculto');
    pantallaGanador.classList.remove('ocult Usar la variable 'ganador' que se pasó a la función
    textoGanadorElemo');

    // Usa el parámetro 'ganador' que SÍ tiene.textContent = `🏆 ¡EL CAMPEÓN ES ${ganador.toUpperCase()}! 🏆`;
    nombreGanadorElem.textContent = ganador.toUpperCase();
    fotoGanador valor
    textoGanadorElem.textContent = `🏆 ¡EL CAMPEÓN ES ${ganElem.src = (ganador === 'Hugo') ? 'img/jugadores/hugo.png' : 'img/jugadores/saulador ? ganador.toUpperCase() : 'DESCONOCIDO'}! 🏆`;
    nombreGanadorElem.textContent = ganador ? ganador.toUpperCase() :.png';
    fotoGanadorElem.alt = `Foto ${ganador}`;

    // Gestionar botones finales
    botonNuevoJuego.classList.add('oculto');
    botonReiniciar.classList.add('oculto');
    botonVolverAJugar.classList.remove '???';
    // Asigna la imagen basándose en el parámetro 'ganador'
    if (ganador === 'Hugo') {
        fotoGanadorElem.src('oculto');
    botonCerrarGanador.classList.remove('oculto');
}

function iniciarNuevoJuegoCompleto = 'img/jugadores/hugo.png';
        fotoGanadorElem.alt = 'Foto Hugo';
    } else if (ganador === '() { /* ... (sin cambios) ... */ }
function cerrarPantallaGanador() { /* ... (sin cambios) ... */ }
function resaltarCeldasGanadoras(combinacion, celdasDOM) { /* ... (sin cambios) ...Saúl') {
        fotoGanadorElem.src = 'img/jugadores/saul.png';
        fotoGanadorElem.alt = 'Foto Saúl';
    } else {
        fotoGanadorElem.src = ''; */ }

// --- Event Listeners Iniciales ---
// (Sin cambios aquí...)
botonComenzar.addEventListener('click', () => {
    cargarPreguntas();
    cargarEjercicios();
    iniciarRonda();
});
botonRein // O una imagen por defecto
        fotoGanadorElem.alt = 'Foto no encontrada';
    }

    botonNuevoJuego.classList.add('ociciar.addEventListener('click', iniciarRonda);
botonVolverAJugar.addEventListener('click', iniciarNuevoJuegoCompleto);
botonCerrarGanador.addEventListener('click', cerrarPantallaGanador);

//ulto');
    botonReiniciar.classList.add('oculto');
    botonVolverAJugar.classList.remove('oculto');
    botonCerrarGanador.classList.remove('oculto');
}


 --- Fin del script ---
