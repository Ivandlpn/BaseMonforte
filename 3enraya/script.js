// Seleccionamos el botón por su ID
const botonComenzar = document.getElementById('boton-comenzar');
const pantallaInicial = document.getElementById('pantalla-inicial');

// Añadimos un 'escuchador de eventos' que reacciona al clic
botonComenzar.addEventListener('click', () => {
    console.log('¡Botón "Comenzar Juego" presionado!'); // Mensaje en la consola del navegador

    // --- PASOS SIGUIENTES (A implementar después) ---
    // 1. Ocultar la pantalla inicial
    // pantallaInicial.style.display = 'none'; // O podrías añadir una clase CSS para ocultarla con una transición

    // 2. Mostrar la pantalla del tablero de juego
    // const tableroJuego = document.getElementById('tablero-juego'); // Suponiendo que tendrás un div con este ID
    // tableroJuego.style.display = 'grid'; // O 'flex', o lo que uses para el tablero

    // 3. Iniciar la lógica del juego (establecer turnos, etc.)
    // iniciarJuego(); // Llamar a una función que prepare el juego
    // ----------------------------------------------------

    // Por ahora, solo mostramos un mensaje y podríamos añadir una pequeña alerta
    alert('¡Preparados para jugar, Hugo y Saúl!');
});

// Puedes añadir más funcionalidad aquí a medida que avances.