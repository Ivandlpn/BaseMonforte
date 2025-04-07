// --- NUEVO: Lista de Todos los Jugadores Disponibles ---
const JUGADORES_DISPONIBLES = [
    { id: 'hugo', nombre: 'Hugo', foto: 'img/jugadores/hugo.png' },
    { id: 'saul', nombre: 'Saúl', foto: 'img/jugadores/saul.png' },
    // ---- ¡¡¡AÑADE AQUÍ AL RESTO DE LA FAMILIA!!! ----
    { id: 'papa', nombre: 'Papá', foto: 'img/jugadores/papa.png' }, // Ejemplo
    { id: 'mama', nombre: 'Mamá', foto: 'img/jugadores/mama.png' }, // Ejemplo
    { id: 'yoyo', nombre: 'Yoyo', foto: 'img/jugadores/yoyo.png' }, // Ejemplo
     { id: 'yaya', nombre: 'Yaya', foto: 'img/jugadores/yaya.png' }, // Ejemplo
    // { id: 'abuela', nombre: 'Abuela', foto: 'img/jugadores/abuela.png' }, // Otro ejemplo
    // Asegúrate de que las rutas 'img/jugadores/...' coincidan con tus archivos reales
];
// --- FIN NUEVO ---

// --- Configuración Inicial: Fondo de Portada Aleatorio ---
const imagenesPortadaDisponibles = [
    'portada1.png',
    'portada2.png',
    'portada3.png'
    // Añade aquí los nombres de todas las imágenes que tengas en img/portada/
    // 'portada4.png',
    // 'otra_imagen.jpg',
];

function establecerFondoAleatorio() {
    if (imagenesPortadaDisponibles.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * imagenesPortadaDisponibles.length);
        const nombreImagenSeleccionada = imagenesPortadaDisponibles[indiceAleatorio];
        const rutaCompletaImagen = `img/portada/${nombreImagenSeleccionada}`;
        document.body.style.backgroundImage = `url('${rutaCompletaImagen}')`;
        console.log(`Fondo de portada establecido aleatoriamente: ${rutaCompletaImagen}`);
    } else {
        console.warn("No hay imágenes de portada definidas en la lista para el fondo aleatorio.");
    }
}

establecerFondoAleatorio();
// --- FIN Configuración Inicial ---


// --- Referencias a Elementos del DOM ---
const botonComenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');
const pantallaSeleccion = document.getElementById('pantalla-seleccion'); // NUEVO
const listaJugadoresSeleccion = document.getElementById('lista-jugadores-seleccion'); // NUEVO
const botonConfirmarJugadores = document.getElementById('boton-confirmar-jugadores'); // NUEVO
const botonVolverInicio = document.getElementById('boton-volver-inicio'); // NUEVO
const nombreSeleccionadoJ1 = document.getElementById('nombre-seleccionado-j1'); // NUEVO
const nombreSeleccionadoJ2 = document.getElementById('nombre-seleccionado-j2'); // NUEVO
const tituloSeleccion = document.getElementById('titulo-seleccion'); // NUEVO

const juegoContenedor = document.getElementById('juego-contenedor');
const infoTurno = document.getElementById('info-turno');
const botonReiniciar = document.getElementById('boton-reiniciar');

// IDs genéricos del marcador
const puntajeJ1Elem = document.getElementById('puntaje-j1'); // MODIFICADO
const puntajeJ2Elem = document.getElementById('puntaje-j2'); // MODIFICADO
const fotoJ1Elem = document.getElementById('foto-j1');       // MODIFICADO
const fotoJ2Elem = document.getElementById('foto-j2');       // MODIFICADO
const nombreJ1Elem = document.getElementById('nombre-j1');   // MODIFICADO
const nombreJ2Elem = document.getElementById('nombre-j2');   // MODIFICADO

const pantallaGanador = document.getElementById('pantalla-ganador');
const textoGanadorElem = document.getElementById('texto-ganador');
const fotoGanadorElem = document.getElementById('foto-ganador');
const nombreGanadorElem = document.getElementById('nombre-ganador');
const botonNuevoJuego = document.getElementById('boton-nuevo-juego'); // Aunque no se usa directamente, podría reactivarse
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
const MARCA_J1 = 'X'; // NUEVO
const MARCA_J2 = 'O'; // NUEVO
const PUNTOS_PARA_GANAR = 3;

let jugador1 = null; // NUEVO: Guardará el objeto del jugador 1 seleccionado
let jugador2 = null; // NUEVO: Guardará el objeto del jugador 2 seleccionado
let jugadorActual = null; // MODIFICADO: Guardará el *nombre* del jugador actual
let jugadorQueRespondioPregunta = null; // MODIFICADO: Guardará el *nombre*
let puntajes = {}; // NUEVO: Guardará los puntos { nombreJugador1: 0, nombreJugador2: 0 }

let juegoActivo = false;
let estadoTablero = ['', '', '', '', '', '', '', '', ''];
const COMBINACIONES_GANADORAS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
];
let listaPreguntasDisponibles = [];
let respuestaCorrectaActual = null;
let tipoPreguntaActual = null;
let listaEjerciciosDisponibles = [];
let intervaloContadorEjercicio = null;
const DURACION_EJERCICIO = 15;

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

// --- NUEVO: Funciones de Selección de Jugador ---

function mostrarPantallaSeleccion() {
    pantallaInicial.classList.add('oculto');
    pantallaGanador.classList.add('oculto'); // Asegurarse de ocultar todo lo demás
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto');

    // Resetear selección previa
    jugador1 = null;
    jugador2 = null;
    nombreSeleccionadoJ1.textContent = 'Nadie';
    nombreSeleccionadoJ2.textContent = 'Nadie';
    tituloSeleccion.textContent = 'Selecciona al Jugador 1 (X)';
    botonConfirmarJugadores.disabled = true;

    // Limpiar lista anterior y generar nuevas tarjetas
    listaJugadoresSeleccion.innerHTML = '';
    JUGADORES_DISPONIBLES.forEach(jugador => {
        const divJugador = document.createElement('div');
        divJugador.classList.add('jugador-seleccion-card');
        divJugador.dataset.jugadorId = jugador.id; // Guardamos el ID para identificarlo al hacer clic

        const imgJugador = document.createElement('img');
        imgJugador.src = jugador.foto;
        imgJugador.alt = jugador.nombre;
        imgJugador.classList.add('foto-seleccion');

        const nombreJugador = document.createElement('p');
        nombreJugador.textContent = jugador.nombre;
        nombreJugador.classList.add('nombre-seleccion');

        divJugador.appendChild(imgJugador);
        divJugador.appendChild(nombreJugador);

        divJugador.addEventListener('click', manejarClickSeleccionJugador);
        listaJugadoresSeleccion.appendChild(divJugador);
    });

    pantallaSeleccion.classList.remove('oculto');
}

function manejarClickSeleccionJugador(evento) {
    const cardClickeada = evento.currentTarget;
    const jugadorIdClickeado = cardClickeada.dataset.jugadorId;
    const jugadorSeleccionado = JUGADORES_DISPONIBLES.find(j => j.id === jugadorIdClickeado);

    if (!jugadorSeleccionado) return; // No debería pasar

    // Lógica de selección
    if (!jugador1) {
        // Seleccionando Jugador 1
        jugador1 = jugadorSeleccionado;
        cardClickeada.classList.add('selected-j1');
        nombreSeleccionadoJ1.textContent = jugador1.nombre;
        tituloSeleccion.textContent = 'Selecciona al Jugador 2 (O)';
    } else if (!jugador2 && jugadorSeleccionado.id !== jugador1.id) {
        // Seleccionando Jugador 2 (distinto del 1)
        jugador2 = jugadorSeleccionado;
        cardClickeada.classList.add('selected-j2');
        nombreSeleccionadoJ2.textContent = jugador2.nombre;
        tituloSeleccion.textContent = '¡Listos para jugar!';
        botonConfirmarJugadores.disabled = false; // Habilitar botón
    } else if (jugadorSeleccionado.id === jugador1.id) {
        // Deseleccionar Jugador 1 si se vuelve a clickear y J2 no está seleccionado
        if (!jugador2) {
            jugador1 = null;
            cardClickeada.classList.remove('selected-j1');
            nombreSeleccionadoJ1.textContent = 'Nadie';
            tituloSeleccion.textContent = 'Selecciona al Jugador 1 (X)';
            botonConfirmarJugadores.disabled = true;
        }
    } else if (jugador2 && jugadorSeleccionado.id === jugador2.id) {
        // Deseleccionar Jugador 2 si se vuelve a clickear
        jugador2 = null;
        cardClickeada.classList.remove('selected-j2');
        nombreSeleccionadoJ2.textContent = 'Nadie';
        tituloSeleccion.textContent = 'Selecciona al Jugador 2 (O)';
        botonConfirmarJugadores.disabled = true;
    }

    // Gestionar estilos y clics de todas las tarjetas
    document.querySelectorAll('.jugador-seleccion-card').forEach(card => {
        const cardId = card.dataset.jugadorId;
        // Resetear estilos y habilitar click por defecto
        card.style.pointerEvents = 'auto';
        card.style.opacity = '1';
        card.classList.remove('selected-j1', 'selected-j2'); // Limpiar antes de re-aplicar

        // Re-aplicar selección actual
        if(jugador1 && cardId === jugador1.id) card.classList.add('selected-j1');
        if(jugador2 && cardId === jugador2.id) card.classList.add('selected-j2');

        // Deshabilitar click en no seleccionados si ambos están elegidos
        if (jugador1 && jugador2) {
             if(cardId !== jugador1.id && cardId !== jugador2.id) {
                 card.style.pointerEvents = 'none'; // Bloquear otros
                 card.style.opacity = '0.5';
             }
        }
    });
}


function confirmarJugadoresEIniciar() {
    if (!jugador1 || !jugador2) {
        alert("Por favor, selecciona dos jugadores diferentes.");
        return;
    }

    // Inicializar puntajes para los jugadores seleccionados
    puntajes = {
        [jugador1.nombre]: 0,
        [jugador2.nombre]: 0
    };
    console.log("Jugadores confirmados:", jugador1.nombre, "vs", jugador2.nombre);
    console.log("Puntajes inicializados:", puntajes);

    pantallaSeleccion.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');

    // Cargar datos necesarios para el juego si no se hizo antes
    cargarPreguntas();
    cargarEjercicios();

    iniciarRonda(); // Empezar la primera ronda con los jugadores seleccionados
}

function volverAPantallaInicial() {
    pantallaSeleccion.classList.add('oculto');
    pantallaInicial.classList.remove('oculto');
}
// --- FIN NUEVO ---

// --- Funciones del Juego (Modificadas) ---

function actualizarMarcadorDisplay() {
    if (!jugador1 || !jugador2) return; // No hacer nada si no hay jugadores

    // Actualizar Jugador 1
    fotoJ1Elem.src = jugador1.foto;
    fotoJ1Elem.alt = `Foto ${jugador1.nombre}`;
    nombreJ1Elem.textContent = jugador1.nombre.toUpperCase();
    puntajeJ1Elem.textContent = puntajes[jugador1.nombre] !== undefined ? puntajes[jugador1.nombre] : 0; // Check undefined

    // Actualizar Jugador 2
    fotoJ2Elem.src = jugador2.foto;
    fotoJ2Elem.alt = `Foto ${jugador2.nombre}`;
    nombreJ2Elem.textContent = jugador2.nombre.toUpperCase();
    puntajeJ2Elem.textContent = puntajes[jugador2.nombre] !== undefined ? puntajes[jugador2.nombre] : 0; // Check undefined

    // Animación de actualización (opcional pero agradable)
    const lastScoreJ1 = parseInt(puntajeJ1Elem.dataset.lastScore || 0);
    const lastScoreJ2 = parseInt(puntajeJ2Elem.dataset.lastScore || 0);
    const currentScoreJ1 = puntajes[jugador1.nombre] || 0;
    const currentScoreJ2 = puntajes[jugador2.nombre] || 0;


    if (currentScoreJ1 > lastScoreJ1) {
        puntajeJ1Elem.classList.add('actualizado');
        setTimeout(() => puntajeJ1Elem.classList.remove('actualizado'), 300);
    }
     if (currentScoreJ2 > lastScoreJ2) {
        puntajeJ2Elem.classList.add('actualizado');
        setTimeout(() => puntajeJ2Elem.classList.remove('actualizado'), 300);
    }
    puntajeJ1Elem.dataset.lastScore = currentScoreJ1;
    puntajeJ2Elem.dataset.lastScore = currentScoreJ2;
}

function actualizarResaltadoFoto() {
    if (!jugador1 || !jugador2) { // Si no hay jugadores definidos, quitar resaltado
        fotoJ1Elem.classList.remove('activa');
        fotoJ2Elem.classList.remove('activa');
        return;
    }

    const pantallaPreguntaVisible = !pantallaPregunta.classList.contains('oculto');
    const pantallaEjercicioVisible = !pantallaEjercicio.classList.contains('oculto');
    let jugadorAResaltar = null;

    if (!juegoActivo && (pantallaPreguntaVisible || pantallaEjercicioVisible)) {
        // Mantener resaltado en quien respondió o jugó último antes de pausa/pregunta
        jugadorAResaltar = jugadorQueRespondioPregunta || jugadorActual;
    } else if (juegoActivo) {
        // Resaltar jugador activo durante el juego normal
        jugadorAResaltar = jugadorActual;
    }

    // Aplicar resaltado
    if (jugadorAResaltar === jugador1.nombre) {
        fotoJ1Elem.classList.add('activa');
        fotoJ2Elem.classList.remove('activa');
    } else if (jugadorAResaltar === jugador2.nombre) {
        fotoJ2Elem.classList.add('activa');
        fotoJ1Elem.classList.remove('activa');
    } else {
        // Sin resaltado si no hay jugador claro (ej. inicio, después de empate)
        fotoJ1Elem.classList.remove('activa');
        fotoJ2Elem.classList.remove('activa');
    }
}

function iniciarRonda() {
    if (!jugador1 || !jugador2) {
        console.error("Error: No se han seleccionado los jugadores para iniciar la ronda.");
        mostrarPantallaSeleccion();
        return;
    }
     // Asegurarse que los puntajes estén inicializados si no lo estaban
    if (puntajes[jugador1.nombre] === undefined) puntajes[jugador1.nombre] = 0;
    if (puntajes[jugador2.nombre] === undefined) puntajes[jugador2.nombre] = 0;


    estadoTablero = ['', '', '', '', '', '', '', '', ''];
    juegoActivo = true;
    respuestaCorrectaActual = null;
    tipoPreguntaActual = null;
    jugadorQueRespondioPregunta = null; // Limpiar quién respondió
    if (intervaloContadorEjercicio) clearInterval(intervaloContadorEjercicio);

    // Determinar jugador inicial aleatoriamente entre los seleccionados
    const jugadoresRonda = [jugador1.nombre, jugador2.nombre];
    // Si es la primera ronda (puntajes 0-0), elegir al azar. Si no, podría mantenerse al azar o implementar otra lógica (ej: pierde empieza)
    if ((puntajes[jugador1.nombre] === 0 && puntajes[jugador2.nombre] === 0) || Math.random() < 0.5) {
         const indiceAleatorio = Math.floor(Math.random() * jugadoresRonda.length);
         jugadorActual = jugadoresRonda[indiceAleatorio];
    } else {
        // Mantener aleatorio por ahora en siguientes rondas
         const indiceAleatorio = Math.floor(Math.random() * jugadoresRonda.length);
         jugadorActual = jugadoresRonda[indiceAleatorio];
        // Opcional: Implementar que empiece quien no empezó la anterior o quien perdió
    }


    // Ocultar pantallas superpuestas y mostrar el juego
    pantallaInicial.classList.add('oculto');
    pantallaSeleccion.classList.add('oculto'); // Asegurar ocultar selección
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto');
    juegoContenedor.classList.remove('oculto');

    // Ocultar botones que no aplican al inicio de ronda
    botonReiniciar.classList.add('oculto');
    botonVolverAJugar.classList.add('oculto');
    botonCerrarGanador.classList.add('oculto');

    actualizarMarcadorDisplay(); // Actualizar con los nombres y puntajes correctos
    actualizarResaltadoFoto();

    const marcaInicial = (jugadorActual === jugador1.nombre) ? MARCA_J1 : MARCA_J2; // Usar marcas genéricas
    infoTurno.textContent = `¡Turno de ${jugadorActual}! (${marcaInicial})`;

    // Limpiar y preparar tablero
    const tablero = document.getElementById('tablero');
    const celdasActuales = tablero.querySelectorAll('.celda');
    celdasActuales.forEach(celda => {
        celda.innerHTML = '';
        celda.classList.remove('ganadora', 'x', 'o');
        celda.style.cursor = 'pointer';
        // Clonar y reemplazar para quitar listeners antiguos
        const celdaClonada = celda.cloneNode(true);
        celda.replaceWith(celdaClonada);
        celdaClonada.addEventListener('click', manejarClickCelda, { once: true });
    });

    console.log(`Ronda iniciada. Empieza: ${jugadorActual}. Marcador: ${jugador1.nombre} ${puntajes[jugador1.nombre]} - ${jugador2.nombre} ${puntajes[jugador2.nombre]}`);
}


function manejarClickCelda(evento) {
    if (!juegoActivo) return;

    const celdaTarget = evento.target.closest('.celda');
    if (!celdaTarget || !celdaTarget.hasAttribute('data-index')) return;

    const indiceCelda = parseInt(celdaTarget.dataset.index);

    if (estadoTablero[indiceCelda] !== '') {
        return;
    }

    const marcaActual = (jugadorActual === jugador1.nombre) ? MARCA_J1 : MARCA_J2;
    const claseMarca = (marcaActual === MARCA_J1) ? 'x' : 'o';

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
    // Cambia al otro jugador seleccionado
    jugadorActual = (jugadorActual === jugador1.nombre) ? jugador2.nombre : jugador1.nombre;

    const marcaSiguiente = (jugadorActual === jugador1.nombre) ? MARCA_J1 : MARCA_J2;
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
        jugadorQueRespondioPregunta = null; // Nadie ganó la ronda
        actualizarResaltadoFoto(); // Quitar resaltado activo
        setTimeout(() => {
            mostrarEjercicioPausa();
        }, 1500);
    } else {
        // Hubo un ganador en esta ronda (es el 'jugadorActual' en este punto)
        infoTurno.textContent = `¡Bien hecho ${jugadorActual}! 👍 Responde para ganar el punto...`;
        console.log(`Ronda finalizada: Ganador ${jugadorActual}. Esperando pregunta.`);
        jugadorQueRespondioPregunta = jugadorActual; // Guardar quién ganó la ronda (el nombre)
        actualizarResaltadoFoto(); // Mantener resaltado en el ganador de la ronda
        setTimeout(() => {
            mostrarPregunta();
        }, 1800);
    }
}

function mostrarEjercicioPausa() {
    if (listaEjerciciosDisponibles.length === 0) {
        console.log("No quedan ejercicios, recargando lista...");
        cargarEjercicios();
        if(listaEjerciciosDisponibles.length === 0) {
             console.error("¡Fallo crítico! No se pudieron cargar ejercicios. Saltando pausa activa.");
             botonReiniciar.classList.remove('oculto');
             infoTurno.textContent = "¡Empate! Hubo un problema con la pausa activa...";
             actualizarResaltadoFoto();
             return;
        }
    }

    const indiceEjercicio = Math.floor(Math.random() * listaEjerciciosDisponibles.length);
    const ejercicio = listaEjerciciosDisponibles.splice(indiceEjercicio, 1)[0];

    nombreEjercicioElem.textContent = `${ejercicio.icono || '💪'} ${ejercicio.nombre}`;
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
             jugadorQueRespondioPregunta = null; // Asegurar que no quede nadie marcado tras pausa
            actualizarResaltadoFoto(); // Quitar resaltado
        }
    }, 1000);
}

function mostrarPregunta() {
     if (!jugadorQueRespondioPregunta) {
         console.error("Error: Se intentó mostrar pregunta sin un jugador que ganó la ronda.");
         // Mostrar botón para la siguiente ronda como fallback
         infoTurno.textContent = "¡Ups! Hubo un error. ¿Listos para la siguiente?";
         botonReiniciar.classList.remove('oculto');
         actualizarResaltadoFoto();
         return;
     }

    if (listaPreguntasDisponibles.length === 0) {
        console.warn("Se agotaron las preguntas disponibles en esta partida. Recargando...");
        cargarPreguntas();
        if (listaPreguntasDisponibles.length === 0) {
            infoTurno.textContent = "¡Vaya! Se acabaron las preguntas. ¡Ronda de descanso!";
            pantallaPregunta.classList.remove('oculto');
            tituloPreguntaElem.textContent = "¡Fin de las Preguntas!";
            textoPreguntaElem.textContent = "Se han usado todas las preguntas disponibles en esta partida.";
            opcionesPreguntaContenedor.innerHTML = '';
            feedbackPreguntaElem.classList.add('oculto');
            setTimeout(() => {
                pantallaPregunta.classList.add('oculto');
                botonReiniciar.classList.remove('oculto');
                jugadorQueRespondioPregunta = null; // Limpiar
                actualizarResaltadoFoto();
            }, 3000);
            return;
        }
         console.log("Preguntas recargadas, mostrando una nueva.");
    }

    const indicePregunta = Math.floor(Math.random() * listaPreguntasDisponibles.length);
    const preguntaData = listaPreguntasDisponibles.splice(indicePregunta, 1)[0];
    respuestaCorrectaActual = preguntaData.respuestaCorrecta;
    tipoPreguntaActual = preguntaData.tipo || 'multiple';

    // Usar el nombre del jugador que respondió
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
    let textoRespuestaCorrecta = '?';

    if (tipoPreguntaActual === 'vf') {
        valorSeleccionado = (botonClickeado.dataset.valor === 'true');
        esCorrecta = (valorSeleccionado === respuestaCorrectaActual);
        const botonCorrectoVF = botonesOpcionActuales.find(btn => (btn.dataset.valor === 'true') === respuestaCorrectaActual);
        if (botonCorrectoVF) textoRespuestaCorrecta = botonCorrectoVF.textContent;
    } else {
        valorSeleccionado = parseInt(botonClickeado.dataset.index);
        esCorrecta = (valorSeleccionado === respuestaCorrectaActual);
        const botonCorrectoMultiple = botonesOpcionActuales.find(btn => parseInt(btn.dataset.index) === respuestaCorrectaActual);
        if (botonCorrectoMultiple) textoRespuestaCorrecta = botonCorrectoMultiple.textContent;
    }

    if (esCorrecta) {
        botonClickeado.classList.add('correcta');
        feedbackPreguntaElem.textContent = "✅ ¡Correctísimo! +1 Punto ✨";
        feedbackPreguntaElem.className = 'feedback-quiz correcto';
    } else {
        botonClickeado.classList.add('incorrecta');
        const botonCorrecto = (tipoPreguntaActual === 'vf')
            ? botonesOpcionActuales.find(btn => (btn.dataset.valor === 'true') === respuestaCorrectaActual)
            : botonesOpcionActuales.find(btn => parseInt(btn.dataset.index) === respuestaCorrectaActual);
        if (botonCorrecto) {
            botonCorrecto.classList.add('correcta');
        }
        feedbackPreguntaElem.textContent = `❌ ¡Ohh! La respuesta correcta era: "${textoRespuestaCorrecta}"`;
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
    const ganadorDeRonda = jugadorQueRespondioPregunta; // Capturar quién respondió

    if (fueCorrecta && ganadorDeRonda) {
        // Incrementar puntaje usando el objeto puntajes
        puntajes[ganadorDeRonda]++;
        mensajeResultado = `¡Punto para ${ganadorDeRonda}! 💪🎉`;

        actualizarMarcadorDisplay();
        console.log(`Respuesta correcta. Marcador: ${jugador1.nombre} ${puntajes[jugador1.nombre]} - ${jugador2.nombre} ${puntajes[jugador2.nombre]}`);

        // Comprobar si el jugador que respondió ganó el juego completo
        if (puntajes[ganadorDeRonda] >= PUNTOS_PARA_GANAR) {
            infoTurno.textContent = mensajeResultado;
             setTimeout(() => {
                console.log(`¡JUEGO TERMINADO POR PUNTOS! Ganador: ${ganadorDeRonda}`);
                mostrarGanadorDelJuego(ganadorDeRonda); // Pasar el nombre del ganador
            }, 500);
            // No limpiar jugadorQueRespondioPregunta aquí, el juego terminó
             respuestaCorrectaActual = null; // Limpiar por si acaso
             tipoPreguntaActual = null;
            return; // Salir para no mostrar botón de siguiente ronda
        } else {
            infoTurno.textContent = mensajeResultado;
        }
    } else {
        mensajeResultado = `¡Ups! ${ganadorDeRonda || 'Alguien'} no sumó el punto. 😅`;
        infoTurno.textContent = mensajeResultado;
        console.log(`Respuesta incorrecta por ${ganadorDeRonda || 'nadie'}. No se suma punto.`);
    }

    // Si el juego no ha terminado, mostrar botón para siguiente ronda
    setTimeout(() => {
          botonReiniciar.classList.remove('oculto');
          jugadorQueRespondioPregunta = null; // Limpiar para la siguiente ronda
          actualizarResaltadoFoto(); // Quitar resaltado
     }, 1500);
     // Resetear variables de la pregunta
     respuestaCorrectaActual = null;
     tipoPreguntaActual = null;
}


function mostrarGanadorDelJuego(nombreGanador) {
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');

    // Encontrar el objeto del jugador ganador a partir de su nombre
    // Asegurarse que jugador1 y jugador2 existen antes de buscar
    const jugadoresActivos = [];
    if (jugador1) jugadoresActivos.push(jugador1);
    if (jugador2) jugadoresActivos.push(jugador2);
    const ganadorObj = jugadoresActivos.find(j => j.nombre === nombreGanador);


    pantallaGanador.classList.remove('oculto');

    if (ganadorObj) {
         textoGanadorElem.textContent = `🏆 ¡EL CAMPEÓN ES ${ganadorObj.nombre.toUpperCase()}! 🏆`;
         nombreGanadorElem.textContent = ganadorObj.nombre.toUpperCase();
         fotoGanadorElem.src = ganadorObj.foto;
         fotoGanadorElem.alt = `Foto ${ganadorObj.nombre}`;
    } else {
         textoGanadorElem.textContent = `🏆 ¡TENEMOS UN CAMPEÓN! 🏆`;
         nombreGanadorElem.textContent = "¡FELICIDADES!";
         fotoGanadorElem.src = ''; // O imagen genérica de trofeo
         fotoGanadorElem.alt = 'Foto Ganador';
         console.error("No se pudo encontrar el objeto del jugador ganador:", nombreGanador);
    }

    botonReiniciar.classList.add('oculto');
    botonVolverAJugar.classList.remove('oculto');
    botonCerrarGanador.classList.remove('oculto');

    if (fotoJ1Elem) fotoJ1Elem.classList.remove('activa');
    if (fotoJ2Elem) fotoJ2Elem.classList.remove('activa');
}


function iniciarNuevoJuegoCompleto() {
    console.log("Volviendo a la selección de jugadores...");
    // Resetear variables globales de juego y jugadores
    puntajes = {};
    jugador1 = null;
    jugador2 = null;
    jugadorActual = null;
    jugadorQueRespondioPregunta = null;
    juegoActivo = false;
    estadoTablero = ['', '', '', '', '', '', '', '', ''];

    // Ocultar pantallas finales/modales/juego
    pantallaGanador.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    modalMensaje.classList.add('oculto');
    modalReglas.classList.add('oculto');
    botonVolverAJugar.classList.add('oculto');
    botonCerrarGanador.classList.add('oculto');

    // Limpiar visualmente el marcador por si acaso
     if(nombreJ1Elem) nombreJ1Elem.textContent = "J1";
     if(puntajeJ1Elem) puntajeJ1Elem.textContent = "0";
     if(fotoJ1Elem) fotoJ1Elem.src = "";
     if(nombreJ2Elem) nombreJ2Elem.textContent = "J2";
     if(puntajeJ2Elem) puntajeJ2Elem.textContent = "0";
     if(fotoJ2Elem) fotoJ2Elem.src = "";
     if(fotoJ1Elem) fotoJ1Elem.classList.remove('activa');
     if(fotoJ2Elem) fotoJ2Elem.classList.remove('activa');


    // Mostrar la pantalla de selección en lugar de iniciar ronda directamente
    mostrarPantallaSeleccion();
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

    // Resetear variables de jugador y puntajes
    jugador1 = null;
    jugador2 = null;
    puntajes = {};
    jugadorActual = null;
    jugadorQueRespondioPregunta = null;
    juegoActivo = false;
    estadoTablero = ['', '', '', '', '', '', '', '', ''];


    // Limpiar visualmente el marcador
     if(nombreJ1Elem) nombreJ1Elem.textContent = "J1";
     if(puntajeJ1Elem) puntajeJ1Elem.textContent = "0";
     if(fotoJ1Elem) fotoJ1Elem.src = "";
     if(nombreJ2Elem) nombreJ2Elem.textContent = "J2";
     if(puntajeJ2Elem) puntajeJ2Elem.textContent = "0";
     if(fotoJ2Elem) fotoJ2Elem.src = "";
     if(fotoJ1Elem) fotoJ1Elem.classList.remove('activa');
     if(fotoJ2Elem) fotoJ2Elem.classList.remove('activa');
}

function resaltarCeldasGanadoras(combinacion, celdasDOM) {
    combinacion.forEach(indice => {
        if(celdasDOM && celdasDOM[indice]) {
            celdasDOM[indice].classList.add('ganadora');
        } else {
            console.error("Error al resaltar: Índice de celda fuera de rango o celdasDOM no válido. Índice:", indice);
        }
    });
}

// --- Funciones y Listeners para Modales (Mensaje y Reglas - sin cambios) ---

function abrirModalMensaje() {
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaInicial.classList.add('oculto');
    pantallaSeleccion.classList.add('oculto'); // Ocultar selección también
    modalReglas.classList.add('oculto');

    formMensaje.reset();
    mensajeFeedback.classList.add('oculto');
    mensajeFeedback.className = 'mensaje-estado oculto';
    const submitButton = formMensaje.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = false;
    modalMensaje.classList.remove('oculto');
}

function cerrarModalMensaje() {
    modalMensaje.classList.add('oculto');
    // Volver a mostrar la pantalla adecuada (inicial o selección si estaba activa)
    if (pantallaSeleccion.classList.contains('oculto') &&
        juegoContenedor.classList.contains('oculto') &&
        pantallaGanador.classList.contains('oculto')) {
         pantallaInicial.classList.remove('oculto');
    } else if (!pantallaSeleccion.classList.contains('oculto')){
        // Si estabamos en selección, volver a ella (poco probable abrir mensaje desde ahí)
         // pantallaSeleccion.classList.remove('oculto');
         // Por seguridad, mejor volver al inicio siempre
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
    if (submitButton) submitButton.disabled = true;

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
            const data = await response.json().catch(() => ({}));
            let errorMsg = '¡Uy! Hubo un problema al enviar el mensaje.';
            if (data && data.errors) {
                errorMsg = 'Error: ' + data.errors.map(error => error.message).join(', ');
            } else if (response.statusText) {
                 errorMsg = `Error: ${response.statusText}`;
            }
            mensajeFeedback.textContent = errorMsg;
            mensajeFeedback.classList.add('error');
            if (submitButton) submitButton.disabled = false;
        }
    } catch (error) {
        console.error('Error de red o JS al enviar mensaje:', error);
        mensajeFeedback.textContent = 'Error de red. Revisa tu conexión e intenta de nuevo.';
        mensajeFeedback.classList.add('error');
        if (submitButton) submitButton.disabled = false;
    }
}


function abrirModalReglas() {
    pantallaGanador.classList.add('oculto');
    pantallaPregunta.classList.add('oculto');
    pantallaEjercicio.classList.add('oculto');
    juegoContenedor.classList.add('oculto');
    pantallaInicial.classList.add('oculto');
     pantallaSeleccion.classList.add('oculto'); // Ocultar selección
    modalMensaje.classList.add('oculto');
    modalReglas.classList.remove('oculto');
}

function cerrarModalReglas() {
    modalReglas.classList.add('oculto');
     // Volver a la pantalla adecuada (inicial o selección)
    if (pantallaSeleccion.classList.contains('oculto') &&
        juegoContenedor.classList.contains('oculto') &&
        pantallaGanador.classList.contains('oculto')) {
         pantallaInicial.classList.remove('oculto');
    } else if (!pantallaSeleccion.classList.contains('oculto')){
         // Si estabamos en selección, volver a ella
         // pantallaSeleccion.classList.remove('oculto');
         // Mejor volver a inicio
          pantallaInicial.classList.remove('oculto');
    }
}


// --- Event Listeners Iniciales ---
// Botón en pantalla inicial ahora muestra la selección
botonComenzar.addEventListener('click', mostrarPantallaSeleccion); // MODIFICADO

// Botón para confirmar jugadores e iniciar el juego
botonConfirmarJugadores.addEventListener('click', confirmarJugadoresEIniciar); // NUEVO

// Botón para volver al inicio desde la selección
botonVolverInicio.addEventListener('click', volverAPantallaInicial); // NUEVO

// Botón para pasar a la siguiente ronda
botonReiniciar.addEventListener('click', iniciarRonda);

// Botón en pantalla de ganador para jugar otra partida (ahora vuelve a selección)
botonVolverAJugar.addEventListener('click', iniciarNuevoJuegoCompleto); // Comportamiento modificado

// Botón en pantalla de ganador para salir al menú inicial
botonCerrarGanador.addEventListener('click', cerrarPantallaGanador); // Función modificada internamente

// Listeners de abrir/cerrar mensaje y reglas
botonAbrirMensaje.addEventListener('click', abrirModalMensaje);
botonCerrarMensaje.addEventListener('click', cerrarModalMensaje);
formMensaje.addEventListener('submit', manejarEnvioMensaje);
if (botonMostrarReglas) botonMostrarReglas.addEventListener('click', abrirModalReglas);
if (botonCerrarReglas) botonCerrarReglas.addEventListener('click', cerrarModalReglas);

// --- Fin del script ---
console.log("Script del juego (con selección de jugador) cargado y listo.");
