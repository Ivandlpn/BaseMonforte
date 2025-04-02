// --- Referencias a Elementos del DOM ---
const botonComenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');
const juegoContenedor = document.getElementById('juego-contenedor'); // Nuevo
const infoTurno = document.getElementById('info-turno');           // Nuevo
const celdas = document.querySelectorAll('.celda');               // Nuevo (obtiene todas las celdas)

// --- Variables del Juego ---
const jugadores = ['Hugo', 'Saúl'];
let jugadorActual;
let juegoActivo = false; // El juego no empieza hasta hacer clic

// --- Funciones ---

// Función para iniciar el juego
function iniciarJuego() {
    // 1. Elegir jugador inicial aleatoriamente
    const indiceAleatorio = Math.floor(Math.random() * jugadores.length); // 0 o 1
    jugadorActual = jugadores[indiceAleatorio];
    juegoActivo = true;

    // 2. Ocultar pantalla inicial y mostrar tablero
    pantallaInicial.classList.add('oculto');       // Añade la clase CSS para ocultar
    juegoContenedor.classList.remove('oculto'); // Quita la clase CSS para mostrar

    // 3. Actualizar el texto del turno
    infoTurno.textContent = `¡Empieza ${jugadorActual}! Tu turno.`;

    // 4. Preparar el tablero (limpiar y añadir listeners)
    // Por ahora, solo añadiremos los listeners (más adelante limpiaremos)
    celdas.forEach(celda => {
        celda.textContent = ''; // Asegura que esté vacía al inicio
        // Quitamos listeners antiguos por si se reinicia (buena práctica)
        celda.removeEventListener('click', manejarClickCelda);
        // Añadimos el listener nuevo
        celda.addEventListener('click', manejarClickCelda, { once: true }); // {once: true} hace que cada celda solo se pueda clickear una vez
    });

    console.log(`Juego iniciado. Empieza: ${jugadorActual}`);
}

// Función que se ejecuta cuando se hace clic en una celda
function manejarClickCelda(evento) {
    if (!juegoActivo) return; // Si el juego no está activo, no hacer nada

    const celdaClickeada = evento.target; // La celda específica que se clickeó
    const indiceCelda = celdaClickeada.getAttribute('data-index'); // Obtenemos su índice (0-8)

    console.log(`Celda ${indiceCelda} clickeada por ${jugadorActual}`);

    // --- LÓGICA DEL JUEGO (Próximos pasos) ---
    // 1. Poner la marca del jugador actual (X u O) en la celda.
    // 2. Comprobar si hay un ganador o empate.
    // 3. Si no hay fin de juego, cambiar el turno al otro jugador.
    // 4. Actualizar el mensaje de infoTurno.
    // -------------------------------------------

    // Por ahora, solo ponemos un texto temporal y cambiamos el turno (simulado)
    celdaClickeada.textContent = jugadorActual === 'Hugo' ? 'X' : 'O'; // Asignamos X a Hugo, O a Saúl (puedes cambiarlo)

    // Cambiamos de jugador para la próxima vez (simulación simple)
    // La lógica real de cambio de turno irá después de comprobar victoria/empate
    // jugadorActual = jugadorActual === 'Hugo' ? 'Saúl' : 'Hugo';
    // infoTurno.textContent = `Turno de: ${jugadorActual}`;

     // ¡Importante! El cambio de turno y la comprobación de victoria
     // se implementarán en el siguiente paso, después de colocar la marca.
     // Por ahora, la celda se marca y no cambia el turno visiblemente hasta que implementemos esa lógica.

}

// --- Event Listeners ---

// Listener para el botón de comenzar
botonComenzar.addEventListener('click', iniciarJuego);
