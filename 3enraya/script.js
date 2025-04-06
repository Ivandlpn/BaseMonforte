// --- Configuración Inicial: Fondo de Portada Aleatorio ---

// 1. Lista con los NOMBRES de tus archivos de portada
//    ¡¡¡IMPORTANTE: Modifica esta lista con tus nombres de archivo reales!!!
const imagenesPortadaDisponibles = [
    'portada1.png',
    'portada2.png',
    'portada3.png'
    // Añade aquí los nombres de todas las imágenes que tengas en img/portada/
    // 'portada4.png',
    // 'otra_imagen.jpg',
];

// 2. Función para seleccionar y aplicar una imagen aleatoria
function establecerFondoAleatorio() {
    if (imagenesPortadaDisponibles.length > 0) {
        // Elige un índice aleatorio de la lista
        const indiceAleatorio = Math.floor(Math.random() * imagenesPortadaDisponibles.length);
        // Obtiene el nombre del archivo seleccionado
        const nombreImagenSeleccionada = imagenesPortadaDisponibles[indiceAleatorio];
        // Construye la ruta completa a la imagen
        const rutaCompletaImagen = `img/portada/${nombreImagenSeleccionada}`;

        // Aplica la imagen como fondo al BODY de la página
        document.body.style.backgroundImage = `url('${rutaCompletaImagen}')`;

        console.log(`Fondo de portada establecido aleatoriamente: ${rutaCompletaImagen}`); // Para depuración
    } else {
        console.warn("No hay imágenes de portada definidas en la lista para el fondo aleatorio.");
    }
}

// 3. Llama a la función para que se ejecute cuando se carga la página
establecerFondoAleatorio();

// --- FIN Configuración Inicial ---


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
const botonNuevoJuego = document.getElementById('boton-nuevo-juego'); // Aunque no se usa directamente, está en el HTML
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

// Referencias para el modal de reglas (añadidas según el HTML)
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
const COMBINACIONES_GANADORAS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
];
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
        console.error("Error: 'preguntasQuiz' no definido o no es un array.");
        listaPreguntasDisponibles = [];
    }
}

function cargarEjercicios() {
     if (typeof ejerciciosPausa !== 'undefined' && Array.isArray(ejerciciosPausa)) {
         listaEjerciciosDisponibles = JSON.parse(JSON.stringify(ejerciciosPausa));
         console.log("Ejercicios (re)cargados:", listaEjerciciosDisponibles.length);
    } else {
        console.error("Error: 'ejerciciosPausa' no definido o no es un array.");
        listaEjerciciosDisponibles = [];
    }
}

function actualizarMarcadorDisplay() {
    puntajeHugoElem.textContent = puntajeHugo;
    puntajeSaulElem.textContent = puntajeSaul;
    // Animación de actualización (opcional pero agradable)
    const lastScoreHugo = parseInt(puntajeHugoElem.dataset.lastScore || 0);
    const lastScoreSaul = parseInt(puntajeSaulElem.dataset.lastScore || 0);
    if (puntajeHugo > lastScoreHugo) {
        puntajeHugoElem.classList.add('actualizado');
        setTimeout(() => puntajeHugoElem.classList.remove('actualizado'), 300);
    }
     if (puntajeSaul > lastScoreSaul) {
        puntajeSaulElem.classList.add('actualizado');
        setTimeout(() => puntajeSaulElem.classList.remove('actualizado'), 300);
    }
    puntajeHugoElem.dataset.lastScore = puntajeHugo;
    puntajeSaulElem.dataset.lastScore = puntajeSaul;
}

function actualizarResaltadoFoto() {
    const pantallaPreguntaVisible = !pantallaPregunta.classList.contains('oculto');
    const pantallaEjercicioVisible = !pantallaEjercicio.classList.contains('oculto');

    // Mantener resaltado si está en pantalla de pregunta o ejercicio
    if (!juegoActivo && (pantallaPreguntaVisible || pantallaEjercicioVisible)) {
         const jugadorAResaltar = jugadorQueRespondioPregunta || jugadorActual; // Prioriza quien respondió
         if (jugadorAResaltar === 'Hugo') {
             fotoHugoElem.classList.add('activa');
             fotoSaulElem.classList.remove('activa');
         } else if (jugadorAResaltar === 'Saúl') {
             fotoSaulElem.classList.add('activa');
             fotoHugoElem.classList.remove('activa');
         } else { // Si no hay jugador definido (ej. justo después de empate antes de ejercicio)
             fotoHugoElem.classList.remove('activa');
             fotoSaulElem.classList.remove('activa');
         }
         return; // Evita que se quite el resaltado inmediatamente
    }

    // Quitar resaltado si el juego no está activo y no hay modal de pregunta/ejercicio
    if (!juegoActivo) {
        fotoHugoElem.classList.remove('activa');
        fotoSaulElem.classList.remove('activa');
        return;
    }

    // Resaltar jugador activo durante el juego normal
    if (jugadorActual === 'Hugo') {
        fotoHugoElem.classList.add('activa');
        fotoSaulElem.classList.remove('activa');
    } else { // Saúl
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
    if (intervaloContadorEjercicio) clearInterval(intervaloContadorEjercicio); // Detener contador si estaba activo

    // Determinar jugador inicial (aleatorio en la primera ronda o al azar)
    if (puntajeHugo === 0 && puntajeSaul === 0 || Math.random() < 0.5 ) {
         // Primera ronda O elección aleatoria
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
    } else {
         // Podrías implementar "pierde empieza" o mantener aleatorio
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
    }

    // Ocultar todas las pantallas superpuestas y mostrar el juego
    pantallaInicial.classList.add('oculto');
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto'); // Ocultar reglas también por si acaso
    juegoContenedor.classList.remove('oculto');

    // Ocultar botones que no aplican al inicio de ronda
    botonReiniciar.classList.add('oculto');
    // botonNuevoJuego.classList.add('oculto'); // Este botón podría estar siempre oculto o manejado de otra forma
    botonVolverAJugar.classList.add('oculto');
    botonCerrarGanador.classList.add('oculto');

    actualizarMarcadorDisplay();
    actualizarResaltadoFoto();

    const marcaInicial = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `¡Turno de ${jugadorActual}! (${marcaInicial})`;

    // Limpiar y preparar tablero (re-adjuntar listeners)
    const tablero = document.getElementById('tablero');
    const celdasActuales = tablero.querySelectorAll('.celda');
    celdasActuales.forEach(celda => {
        celda.innerHTML = ''; // Limpia contenido visual
        celda.classList.remove('ganadora', 'x', 'o'); // Quita clases de estado
        celda.style.cursor = 'pointer'; // Restaura cursor
        // Clonar y reemplazar para quitar listeners antiguos de forma segura
        const celdaClonada = celda.cloneNode(true);
        celda.replaceWith(celdaClonada);
        // Añadir el nuevo listener a la celda clonada
        celdaClonada.addEventListener('click', manejarClickCelda, { once: true });
    });
    console.log(`Ronda iniciada. Empieza: ${jugadorActual}. Marcador: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);
}

function manejarClickCelda(evento) {
    if (!juegoActivo) return; // No hacer nada si el juego no está activo

    const celdaTarget = evento.target.closest('.celda'); // Asegura que sea la celda
    if (!celdaTarget || !celdaTarget.hasAttribute('data-index')) return; // Salir si no es una celda válida

    const indiceCelda = parseInt(celdaTarget.dataset.index);

    // Verificar si la celda ya está ocupada
    if (estadoTablero[indiceCelda] !== '') {
        return; // Salir si la celda ya tiene marca
    }

    const marcaActual = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    const claseMarca = (marcaActual === MARCA_HUGO) ? 'x' : 'o';

    // Actualizar estado interno y visual
    estadoTablero[indiceCelda] = marcaActual;
    celdaTarget.innerHTML = `<span class="marca-animada ${claseMarca}">${marcaActual}</span>`;
    celdaTarget.style.cursor = 'default'; // Ya no es clicable esta ronda

    console.log(`Celda ${indiceCelda} clickeada por ${jugadorActual}. Marca: ${marcaActual}`);

    // Comprobar estado del juego
    if (comprobarVictoria(marcaActual)) {
        finalizarJuego(false); // Hubo un ganador
        return; // Detener ejecución aquí
    }
    if (comprobarEmpate()) {
        finalizarJuego(true); // Hubo empate
        return; // Detener ejecución aquí
    }

    // Si no hay victoria ni empate, cambiar turno
    cambiarTurno();
}

function comprobarVictoria(marca) {
    const celdasDOM = document.querySelectorAll('.celda'); // Obtener referencia a las celdas
    for (const combinacion of COMBINACIONES_GANADORAS) {
        const [a, b, c] = combinacion;
        if (estadoTablero[a] === marca && estadoTablero[b] === marca && estadoTablero[c] === marca) {
             resaltarCeldasGanadoras(combinacion, celdasDOM); // Resaltar visualmente
            return true; // Victoria encontrada
        }
    }
    return false; // No se encontró combinación ganadora
}

function comprobarEmpate() {
    // Si todas las celdas tienen algo (!== ''), es empate
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
    juegoActivo = false; // Detener la interacción con el tablero
    // Cambiar cursor en todas las celdas (aunque 'once' ayuda, esto es más explícito)
    const celdasFinalizadas = document.querySelectorAll('.celda');
    celdasFinalizadas.forEach(celda => {
         celda.style.cursor = 'default';
    });

    if (esEmpate) {
        infoTurno.textContent = "¡Oh! ¡Empate! 🤝 ¡Vamos con una Pausa Activa!";
        console.log("Ronda finalizada: Empate. Iniciando Pausa Activa.");
        actualizarResaltadoFoto(); // Quitar resaltado activo
        setTimeout(() => {
            mostrarEjercicioPausa();
        }, 1500); // Esperar un poco antes de mostrar ejercicio
    } else {
        // Hubo un ganador en esta ronda
        infoTurno.textContent = `¡Bien hecho ${jugadorActual}! 👍 Responde para ganar el punto...`;
        console.log(`Ronda finalizada: Ganador ${jugadorActual}. Esperando pregunta.`);
        jugadorQueRespondioPregunta = jugadorActual; // Guardar quién ganó la ronda
        actualizarResaltadoFoto(); // Mantener resaltado en el ganador de la ronda
        setTimeout(() => {
            mostrarPregunta();
        }, 1800); // Esperar un poco más antes de mostrar la pregunta
    }
}

function mostrarEjercicioPausa() {
    if (listaEjerciciosDisponibles.length === 0) {
        console.log("No quedan ejercicios, recargando lista...");
        cargarEjercicios();
        if(listaEjerciciosDisponibles.length === 0) {
             console.error("¡Fallo crítico! No se pudieron cargar ejercicios. Saltando pausa activa.");
             // Mostrar botón para continuar manualmente si falla la carga
             botonReiniciar.classList.remove('oculto');
             infoTurno.textContent = "¡Empate! Hubo un problema con la pausa activa...";
             actualizarResaltadoFoto(); // Quitar resaltado si había alguno
             return;
        }
    }

    const indiceEjercicio = Math.floor(Math.random() * listaEjerciciosDisponibles.length);
    const ejercicio = listaEjerciciosDisponibles.splice(indiceEjercicio, 1)[0]; // Elegir y quitar

    nombreEjercicioElem.textContent = `${ejercicio.icono || '💪'} ${ejercicio.nombre}`; // Mostrar nombre e icono (si existe)
    contadorEjercicioElem.textContent = DURACION_EJERCICIO; // Establecer contador inicial

    pantallaEjercicio.classList.remove('oculto'); // Mostrar pantalla
    iniciarContadorEjercicio(DURACION_EJERCICIO); // Iniciar cuenta atrás
}

function iniciarContadorEjercicio(segundos) {
    let tiempoRestante = segundos;
    if (intervaloContadorEjercicio) clearInterval(intervaloContadorEjercicio); // Limpiar intervalo anterior si existe

    contadorEjercicioElem.textContent = tiempoRestante; // Mostrar tiempo inicial

    intervaloContadorEjercicio = setInterval(() => {
        tiempoRestante--;
        contadorEjercicioElem.textContent = tiempoRestante;
        if (tiempoRestante <= 0) {
            clearInterval(intervaloContadorEjercicio); // Detener cuando llega a 0
            intervaloContadorEjercicio = null;
            pantallaEjercicio.classList.add('oculto'); // Ocultar pantalla de ejercicio
            infoTurno.textContent = "¡Energía recargada! 🔥 ¿Listos para la siguiente?";
            botonReiniciar.classList.remove('oculto'); // Mostrar botón para siguiente ronda
            console.log("Pausa activa completada.");
            actualizarResaltadoFoto(); // Quitar resaltado
        }
    }, 1000); // Ejecutar cada segundo
}

function mostrarPregunta() {
    if (listaPreguntasDisponibles.length === 0) {
        console.warn("Se agotaron las preguntas disponibles en esta partida.");
        // Podríamos recargar o mostrar un mensaje final
        cargarPreguntas(); // Intentar recargar por si acaso
        if (listaPreguntasDisponibles.length === 0) {
            infoTurno.textContent = "¡Vaya! Se acabaron las preguntas. ¡Ronda de descanso!";
            // Mostrar temporalmente un mensaje en la pantalla de preguntas
            pantallaPregunta.classList.remove('oculto');
            tituloPreguntaElem.textContent = "¡Fin de las Preguntas!";
            textoPreguntaElem.textContent = "Se han usado todas las preguntas disponibles en esta partida.";
            opcionesPreguntaContenedor.innerHTML = ''; // Limpiar opciones
            feedbackPreguntaElem.classList.add('oculto');
            setTimeout(() => {
                pantallaPregunta.classList.add('oculto');
                botonReiniciar.classList.remove('oculto'); // Permitir continuar a la siguiente ronda
                actualizarResaltadoFoto(); // Quitar resaltado
            }, 3000); // Mostrar mensaje por 3 segundos
            return; // Salir de la función
        }
         console.log("Preguntas recargadas, mostrando una nueva.");
    }

    const indicePregunta = Math.floor(Math.random() * listaPreguntasDisponibles.length);
    const preguntaData = listaPreguntasDisponibles.splice(indicePregunta, 1)[0]; // Elegir y quitar
    respuestaCorrectaActual = preguntaData.respuestaCorrecta;
    tipoPreguntaActual = preguntaData.tipo || 'multiple'; // Asumir 'multiple' si no se especifica

    tituloPreguntaElem.textContent = `🧠 ¡Pregunta para ${jugadorQueRespondioPregunta}! 🧠`;
    textoPreguntaElem.textContent = preguntaData.pregunta;
    feedbackPreguntaElem.classList.add('oculto'); // Ocultar feedback anterior
    opcionesPreguntaContenedor.innerHTML = ''; // Limpiar opciones anteriores

    // Crear botones de opción según el tipo de pregunta
    if (tipoPreguntaActual === 'vf') { // Verdadero/Falso
        const botonVerdadero = document.createElement('button');
        botonVerdadero.textContent = 'Verdadero 👍';
        botonVerdadero.className = 'opcion-btn opcion-vf';
        botonVerdadero.dataset.valor = 'true'; // Guardar valor booleano como string
        botonVerdadero.addEventListener('click', manejarRespuestaPregunta);
        opcionesPreguntaContenedor.appendChild(botonVerdadero);

        const botonFalso = document.createElement('button');
        botonFalso.textContent = 'Falso 👎';
        botonFalso.className = 'opcion-btn opcion-vf';
        botonFalso.dataset.valor = 'false';
        botonFalso.addEventListener('click', manejarRespuestaPregunta);
        opcionesPreguntaContenedor.appendChild(botonFalso);
    } else { // Opción Múltiple (por defecto)
        preguntaData.opciones.forEach((opcionTexto, index) => {
            const botonOpcion = document.createElement('button');
            botonOpcion.textContent = opcionTexto;
            botonOpcion.className = 'opcion-btn opcion-multiple';
            botonOpcion.dataset.index = index; // Guardar índice de la opción
            botonOpcion.addEventListener('click', manejarRespuestaPregunta);
            opcionesPreguntaContenedor.appendChild(botonOpcion);
        });
    }

    pantallaPregunta.classList.remove('oculto'); // Mostrar la pantalla de pregunta
}


function manejarRespuestaPregunta(evento) {
    const botonClickeado = evento.target;
    // Deshabilitar todos los botones de esta pregunta para evitar clics múltiples
    const botonesOpcionActuales = Array.from(opcionesPreguntaContenedor.querySelectorAll('.opcion-btn'));
    botonesOpcionActuales.forEach(boton => boton.disabled = true);

    let esCorrecta = false;
    let valorSeleccionado;
    let textoRespuestaCorrecta = '?'; // Para el feedback en caso de error

    if (tipoPreguntaActual === 'vf') {
        valorSeleccionado = (botonClickeado.dataset.valor === 'true'); // Convertir string a boolean
        esCorrecta = (valorSeleccionado === respuestaCorrectaActual);
        // Encontrar el texto de la respuesta correcta para feedback
        const botonCorrectoVF = botonesOpcionActuales.find(btn => (btn.dataset.valor === 'true') === respuestaCorrectaActual);
        if (botonCorrectoVF) textoRespuestaCorrecta = botonCorrectoVF.textContent;
    } else { // Opción Múltiple
        valorSeleccionado = parseInt(botonClickeado.dataset.index); // Convertir string a número
        esCorrecta = (valorSeleccionado === respuestaCorrectaActual);
        // Encontrar el texto de la respuesta correcta para feedback
        const botonCorrectoMultiple = botonesOpcionActuales.find(btn => parseInt(btn.dataset.index) === respuestaCorrectaActual);
        if (botonCorrectoMultiple) textoRespuestaCorrecta = botonCorrectoMultiple.textContent;
    }

    // Aplicar estilos y mostrar feedback
    if (esCorrecta) {
        botonClickeado.classList.add('correcta');
        feedbackPreguntaElem.textContent = "✅ ¡Correctísimo! +1 Punto ✨";
        feedbackPreguntaElem.className = 'feedback-quiz correcto'; // Clase para estilo verde
    } else {
        botonClickeado.classList.add('incorrecta');
        // Resaltar también la correcta si se falló
        const botonCorrecto = (tipoPreguntaActual === 'vf')
            ? botonesOpcionActuales.find(btn => (btn.dataset.valor === 'true') === respuestaCorrectaActual)
            : botonesOpcionActuales.find(btn => parseInt(btn.dataset.index) === respuestaCorrectaActual);
        if (botonCorrecto) {
            botonCorrecto.classList.add('correcta'); // Marcarla como correcta visualmente
        }
        feedbackPreguntaElem.textContent = `❌ ¡Ohh! La respuesta correcta era: "${textoRespuestaCorrecta}"`;
        feedbackPreguntaElem.className = 'feedback-quiz incorrecto'; // Clase para estilo rojo
    }
    feedbackPreguntaElem.classList.remove('oculto'); // Mostrar el feedback

    // Esperar un tiempo antes de procesar el resultado y continuar
    setTimeout(() => {
        procesarResultadoPregunta(esCorrecta);
    }, 2000); // 2 segundos para ver el feedback
}

function procesarResultadoPregunta(fueCorrecta) {
    pantallaPregunta.classList.add('oculto'); // Ocultar la pantalla de pregunta

    let mensajeResultado = "";
    const ganadorDeRonda = jugadorQueRespondioPregunta; // Capturar quién respondió antes de resetear

    if (fueCorrecta) {
        // Incrementar puntaje del jugador correspondiente
        if (ganadorDeRonda === 'Hugo') {
            puntajeHugo++;
            mensajeResultado = "¡Punto para Hugo! 💪";
        } else if (ganadorDeRonda === 'Saúl') {
            puntajeSaul++;
            mensajeResultado = "¡Punto para Saúl! 🎉";
        }
        actualizarMarcadorDisplay(); // Actualizar el marcador visual
        console.log(`Respuesta correcta. Marcador: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);

        // Comprobar si alguien ganó el juego completo
        if (puntajeHugo >= PUNTOS_PARA_GANAR || puntajeSaul >= PUNTOS_PARA_GANAR) {
            // ¡Juego Terminado!
            infoTurno.textContent = mensajeResultado; // Mostrar último mensaje de punto
             setTimeout(() => {
                console.log(`¡JUEGO TERMINADO POR PUNTOS! Ganador: ${ganadorDeRonda}`);
                mostrarGanadorDelJuego(ganadorDeRonda); // Mostrar pantalla de ganador
            }, 500); // Breve pausa antes de la pantalla final
            // NO resetear variables de pregunta aquí, el juego terminó
        } else {
            // El juego continúa, preparar siguiente ronda
            infoTurno.textContent = mensajeResultado; // Mostrar mensaje de punto ganado
            setTimeout(() => {
                  botonReiniciar.classList.remove('oculto'); // Mostrar botón para siguiente ronda
                  actualizarResaltadoFoto(); // Quitar resaltado del que respondió
             }, 1500); // Pausa antes de mostrar botón
            // Resetear variables de la pregunta porque la ronda terminó pero el juego sigue
            respuestaCorrectaActual = null;
            tipoPreguntaActual = null;
            jugadorQueRespondioPregunta = null;
        }
    } else {
        // Respuesta Incorrecta (El juego continúa)
        mensajeResultado = `¡Ups! ${ganadorDeRonda || 'Alguien'} no sumó el punto. 😅`;
        infoTurno.textContent = mensajeResultado;
        console.log("Respuesta incorrecta. No se suma punto.");
        setTimeout(() => {
             botonReiniciar.classList.remove('oculto'); // Mostrar botón para siguiente ronda
             actualizarResaltadoFoto(); // Quitar resaltado del que respondió
         }, 1500); // Pausa antes de mostrar botón
         // Resetear variables de la pregunta porque la ronda terminó pero el juego sigue
         respuestaCorrectaActual = null;
         tipoPreguntaActual = null;
         jugadorQueRespondioPregunta = null;
    }
}

function mostrarGanadorDelJuego(ganador) {
    // Ocultar todo lo relacionado con el juego activo
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');

    // Configurar y mostrar la pantalla de ganador
    pantallaGanador.classList.remove('oculto');
    textoGanadorElem.textContent = `🏆 ¡EL CAMPEÓN ES ${ganador ? ganador.toUpperCase() : '???'}! 🏆`;
    nombreGanadorElem.textContent = ganador ? ganador.toUpperCase() : '???'; // Mostrar nombre en grande

    // Poner la foto correcta
    if (ganador === 'Hugo') {
        fotoGanadorElem.src = 'img/jugadores/hugo.png';
        fotoGanadorElem.alt = 'Foto Hugo';
    } else if (ganador === 'Saúl') {
        fotoGanadorElem.src = 'img/jugadores/saul.png';
        fotoGanadorElem.alt = 'Foto Saúl';
    } else {
        fotoGanadorElem.src = ''; // O una imagen genérica de trofeo
        fotoGanadorElem.alt = 'Foto no disponible';
    }

    // Mostrar botones de acción post-juego
    // botonNuevoJuego.classList.add('oculto'); // Asegurar que esté oculto
    botonReiniciar.classList.add('oculto');    // Ocultar botón de siguiente ronda
    botonVolverAJugar.classList.remove('oculto'); // Mostrar "Otra vez"
    botonCerrarGanador.classList.remove('oculto'); // Mostrar "Salir"

    // Quitar resaltado de fotos del marcador
    fotoHugoElem.classList.remove('activa');
    fotoSaulElem.classList.remove('activa');

    // Aquí podrías añadir efectos como confeti si lo deseas
}

function iniciarNuevoJuegoCompleto() {
    console.log("Iniciando nuevo juego completo...");
    // Resetear puntajes
    puntajeHugo = 0;
    puntajeSaul = 0;
    // Recargar listas de preguntas y ejercicios
    cargarPreguntas();
    cargarEjercicios();

    // Ocultar pantallas finales/modales y mostrar juego
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto');
    botonVolverAJugar.classList.add('oculto'); // Ocultar botones de ganador
    botonCerrarGanador.classList.add('oculto');

    // Iniciar la primera ronda del nuevo juego
    iniciarRonda();
}

function cerrarPantallaGanador() {
    console.log("Cerrando pantalla de ganador y volviendo al inicio.");
    // Ocultar todas las pantallas y modales del juego
    pantallaGanador.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto');

    // Mostrar la pantalla inicial
    pantallaInicial.classList.remove('oculto');

    // Resetear puntajes por si acaso
    puntajeHugo = 0;
    puntajeSaul = 0;
    // No es necesario actualizar display aquí, se hará al empezar juego
    fotoHugoElem.classList.remove('activa'); // Quitar resaltados
    fotoSaulElem.classList.remove('activa');
}

function resaltarCeldasGanadoras(combinacion, celdasDOM) {
    combinacion.forEach(indice => {
        // Comprobar que el índice sea válido y la celda exista
        if(celdasDOM && celdasDOM[indice]) {
            celdasDOM[indice].classList.add('ganadora'); // Añadir clase para el estilo CSS
        } else {
            console.error("Error al resaltar: Índice de celda fuera de rango o celdasDOM no válido. Índice:", indice);
        }
    });
}

// --- Funciones y Listeners para Modal de Mensaje ---

function abrirModalMensaje() {
    // Ocultar otras pantallas por si acaso estaban visibles
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaInicial.classList.add('oculto'); // Ocultar también la inicial
    modalReglas.classList.add('oculto');

    // Preparar y mostrar el modal de mensaje
    formMensaje.reset(); // Limpiar campos previos
    mensajeFeedback.classList.add('oculto'); // Ocultar feedback anterior
    mensajeFeedback.className = 'mensaje-estado oculto'; // Resetear clases de estado (éxito/error)
    const submitButton = formMensaje.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = false; // Habilitar botón de envío
    modalMensaje.classList.remove('oculto');
}

function cerrarModalMensaje() {
    modalMensaje.classList.add('oculto');
    // Volver a mostrar la pantalla inicial por defecto al cerrar
    // (a menos que el juego estuviera activo, pero lo normal es abrirlo desde la inicial)
    if (juegoContenedor.classList.contains('oculto') && pantallaGanador.classList.contains('oculto')) {
         pantallaInicial.classList.remove('oculto');
    }
}

async function manejarEnvioMensaje(event) {
    event.preventDefault(); // Prevenir recarga de página
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    // Mostrar estado de envío y deshabilitar botón
    mensajeFeedback.textContent = 'Enviando mensaje... ⏳';
    mensajeFeedback.className = 'mensaje-estado'; // Quita éxito/error anteriores
    mensajeFeedback.classList.remove('oculto');
    if (submitButton) submitButton.disabled = true;

    try {
        // Enviar a Formspree (o tu endpoint)
        const response = await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: { 'Accept': 'application/json' } // Importante para Formspree
        });

        // Procesar respuesta
        if (response.ok) {
            mensajeFeedback.textContent = '¡Mensaje enviado con éxito! 😊';
            mensajeFeedback.classList.add('exito');
            form.reset(); // Limpiar formulario
            setTimeout(cerrarModalMensaje, 2500); // Cerrar modal tras éxito
        } else {
            // Intentar obtener detalles del error si es posible
            const data = await response.json().catch(() => ({})); // Captura si la respuesta no es JSON
            let errorMsg = '¡Uy! Hubo un problema al enviar el mensaje.';
            if (data && data.errors) {
                errorMsg = 'Error: ' + data.errors.map(error => error.message).join(', ');
            } else if (response.statusText) {
                 errorMsg = `Error: ${response.statusText}`;
            }
            mensajeFeedback.textContent = errorMsg;
            mensajeFeedback.classList.add('error');
            if (submitButton) submitButton.disabled = false; // Habilitar botón para reintentar
        }
    } catch (error) {
        // Error de red u otro problema
        console.error('Error de red o JS al enviar mensaje:', error);
        mensajeFeedback.textContent = 'Error de red. Revisa tu conexión e intenta de nuevo.';
        mensajeFeedback.classList.add('error');
        if (submitButton) submitButton.disabled = false; // Habilitar botón para reintentar
    }
}


// --- Funciones y Listeners para Modal de Reglas ---

function abrirModalReglas() {
     // Ocultar otras pantallas/modales
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaInicial.classList.add('oculto');
    modalMensaje.classList.add('oculto');
    // Mostrar modal de reglas
    modalReglas.classList.remove('oculto');
}

function cerrarModalReglas() {
    modalReglas.classList.add('oculto');
    // Volver a la pantalla inicial por defecto
     if (juegoContenedor.classList.contains('oculto') && pantallaGanador.classList.contains('oculto')) {
         pantallaInicial.classList.remove('oculto');
    }
}


// --- Event Listeners Iniciales ---
// Botón principal para empezar a jugar
botonComenzar.addEventListener('click', () => {
    cargarPreguntas(); // Cargar/recargar datos antes de empezar
    cargarEjercicios();
    iniciarRonda(); // Empezar la primera ronda
});

// Botón para pasar a la siguiente ronda (después de pregunta o pausa)
botonReiniciar.addEventListener('click', iniciarRonda);

// Botón en pantalla de ganador para jugar otra partida completa
botonVolverAJugar.addEventListener('click', iniciarNuevoJuegoCompleto);

// Botón en pantalla de ganador para salir al menú inicial
botonCerrarGanador.addEventListener('click', cerrarPantallaGanador);

// Botones para abrir/cerrar el modal de mensaje
botonAbrirMensaje.addEventListener('click', abrirModalMensaje);
botonCerrarMensaje.addEventListener('click', cerrarModalMensaje);

// Listener para el envío del formulario de mensaje
formMensaje.addEventListener('submit', manejarEnvioMensaje);

// Listeners para abrir/cerrar el modal de reglas
if (botonMostrarReglas) botonMostrarReglas.addEventListener('click', abrirModalReglas);
if (botonCerrarReglas) botonCerrarReglas.addEventListener('click', cerrarModalReglas);


// --- Fin del script ---
console.log("Script del juego cargado y listo.");
