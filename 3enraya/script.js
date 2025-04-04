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
const botonNuevoJuego = document.getElementById('boton-nuevo-juego'); // El que estaba fuera

// NUEVAS REFERENCIAS para botones en pantalla ganador
const botonVolverAJugar = document.getElementById('boton-volver-a-jugar');
const botonCerrarGanador = document.getElementById('boton-cerrar-ganador');


// --- Constantes y Variables del Juego ---
const JUGADORES = ['Hugo', 'Saúl'];
const MARCA_HUGO = 'X';
const MARCA_SAUL = 'O';
const PUNTOS_PARA_GANAR = 3;
let jugadorActual;
let juegoActivo = false;
let estadoTablero = ['', '', '', '', '', '', '', '', ''];
const COMBINACIONES_GANADORAS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];
let puntajeHugo = 0;
let puntajeSaul = 0;

// --- Funciones ---

function actualizarMarcadorDisplay() {
    puntajeHugoElem.textContent = puntajeHugo;
    puntajeSaulElem.textContent = puntajeSaul;
}

function actualizarResaltadoFoto() {
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

    if (puntajeHugo === 0 && puntajeSaul === 0 || Math.random() < 0.5 ) {
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
    } else {
         const indiceAleatorio = Math.floor(Math.random() * JUGADORES.length);
         jugadorActual = JUGADORES[indiceAleatorio];
    }

    // Asegurar visibilidad correcta de elementos al iniciar ronda
    pantallaInicial.classList.add('oculto');
    pantallaGanador.classList.add('oculto'); // Ocultar pantalla ganador si estaba visible
    juegoContenedor.classList.remove('oculto');
    botonReiniciar.classList.add('oculto'); // Ocultar "Siguiente Ronda"
    botonNuevoJuego.classList.add('oculto'); // Ocultar "Nuevo Juego Completo"
    botonVolverAJugar.classList.add('oculto'); // Ocultar botón específico de pantalla ganador
    botonCerrarGanador.classList.add('oculto'); // Ocultar botón específico de pantalla ganador


    actualizarMarcadorDisplay();
    actualizarResaltadoFoto();

    const marcaInicial = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `Turno de: ${jugadorActual} (${marcaInicial})`;

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
    estadoTablero[indiceCelda] = marcaActual;
    celdaTarget.innerHTML = `<span class="marca-animada">${marcaActual}</span>`;
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
    jugadorActual = jugadorActual === JUGADORES[0] ? JUGADORES[1] : JUGADORES[0];
    const marcaSiguiente = jugadorActual === 'Hugo' ? MARCA_HUGO : MARCA_SAUL;
    infoTurno.textContent = `Turno de: ${jugadorActual} (${marcaSiguiente})`;
    actualizarResaltadoFoto();
    console.log(`Turno cambiado a: ${jugadorActual}`);
}

function finalizarJuego(esEmpate) {
    juegoActivo = false;
    actualizarResaltadoFoto();

     const celdasFinalizadas = document.querySelectorAll('.celda');
     celdasFinalizadas.forEach(celda => {
         celda.style.cursor = 'default';
     });

    if (esEmpate) {
        infoTurno.textContent = "¡Empate en esta ronda!";
        console.log("Ronda finalizada: Empate.");
        botonReiniciar.classList.remove('oculto'); // Mostrar "Siguiente Ronda"
    } else {
        infoTurno.textContent = `¡${jugadorActual} gana la ronda! 🎉`;
        console.log(`Ronda finalizada: Ganador ${jugadorActual}.`);
        if (jugadorActual === 'Hugo') {
            puntajeHugo++;
        } else {
            puntajeSaul++;
        }
        actualizarMarcadorDisplay();
        console.log(`Marcador actualizado: Hugo ${puntajeHugo} - Saúl ${puntajeSaul}`);

        if (puntajeHugo === PUNTOS_PARA_GANAR || puntajeSaul === PUNTOS_PARA_GANAR) {
            console.log(`¡JUEGO TERMINADO! Ganador: ${jugadorActual}`);
            setTimeout(() => {
                 mostrarGanadorDelJuego(jugadorActual);
            }, 1500); // Espera para mostrar pantalla ganador

        } else {
            botonReiniciar.classList.remove('oculto'); // Mostrar "Siguiente Ronda"
        }
    }
}

/**
 * Muestra la pantalla de ganador del juego completo con los nuevos botones.
 */
function mostrarGanadorDelJuego(ganador) {
    textoGanadorElem.textContent = `¡EL CAMPEÓN ES ${ganador.toUpperCase()}!`;
    nombreGanadorElem.textContent = ganador.toUpperCase();

    if (ganador === 'Hugo') {
        fotoGanadorElem.src = 'img/jugadores/hugo.png';
        fotoGanadorElem.alt = 'Foto Hugo';
    } else {
        fotoGanadorElem.src = 'img/jugadores/saul.png';
        fotoGanadorElem.alt = 'Foto Saúl';
    }

    juegoContenedor.classList.add('oculto'); // Ocultar juego
    pantallaGanador.classList.remove('oculto'); // Mostrar pantalla ganador

    // Gestionar botones: Ocultar los viejos, mostrar los nuevos de esta pantalla
    botonNuevoJuego.classList.add('oculto');
    botonReiniciar.classList.add('oculto');
    botonVolverAJugar.classList.remove('oculto'); // Mostrar "Volver a Jugar"
    botonCerrarGanador.classList.remove('oculto'); // Mostrar "Cerrar"
}

/**
 * Reinicia todo para un juego completamente nuevo.
 */
function iniciarNuevoJuegoCompleto() {
    console.log("Iniciando nuevo juego completo...");
    puntajeHugo = 0;
    puntajeSaul = 0;
    // iniciarRonda ya actualiza display y gestiona botones/pantallas

    // Asegurarse de ocultar la pantalla de ganador explícitamente
    pantallaGanador.classList.add('oculto');
    // Asegurarse de ocultar los botones de la pantalla de ganador
    botonVolverAJugar.classList.add('oculto');
    botonCerrarGanador.classList.add('oculto');


    iniciarRonda(); // Iniciar la primera ronda del nuevo juego
}

/**
 * NUEVA FUNCIÓN: Cierra la pantalla de ganador y vuelve a la pantalla inicial.
 */
function cerrarPantallaGanador() {
    console.log("Cerrando pantalla de ganador y volviendo al inicio.");
    pantallaGanador.classList.add('oculto'); // Ocultar pantalla ganador
    juegoContenedor.classList.add('oculto'); // Asegurar que el juego también esté oculto
    pantallaInicial.classList.remove('oculto'); // Mostrar pantalla inicial

    // Resetear puntuaciones al cerrar
    puntajeHugo = 0;
    puntajeSaul = 0;
    actualizarMarcadorDisplay(); // Mostrar 0-0 en el marcador (aunque esté oculto)
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
botonComenzar.addEventListener('click', iniciarRonda);
botonReiniciar.addEventListener('click', iniciarRonda); // "Siguiente Ronda"
// botonNuevoJuego ya no necesita listener aquí, se reemplaza su función

// NUEVOS LISTENERS para los botones de la pantalla de ganador
botonVolverAJugar.addEventListener('click', iniciarNuevoJuegoCompleto);
botonCerrarGanador.addEventListener('click', cerrarPantallaGanador);


// --- Fin del script ---
