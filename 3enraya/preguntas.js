// --- Archivo: preguntas.js ---
// Contiene las preguntas para el quiz del juego 3 en Raya.
// Estructura de cada pregunta:
// {
//   pregunta: "Texto de la pregunta",
//   opciones: ["Opción A", "Opción B", "Opción C"], // Array de 3 strings
//   respuestaCorrecta: 0 // Índice (0, 1 o 2) de la opción correcta en el array 'opciones'
// }

const preguntasQuiz = [
    // Geografía
    {
        pregunta: "¿Cuál es el río más largo de España?",
        opciones: ["Ebro", "Tajo", "Amazonas"],
        respuestaCorrecta: 1 // Tajo (considerando longitud total, aunque Ebro es el más caudaloso y largo *dentro* de España) - Cercana: Ebro, Lejana: Amazonas
    },
    {
        pregunta: "¿En qué continente se encuentra Egipto?",
        opciones: ["Asia", "África", "Oceanía"],
        respuestaCorrecta: 1 // África - Cercana: Asia (por cercanía geográfica), Lejana: Oceanía
    },
    {
        pregunta: "¿Cuál es la capital de Portugal?",
        opciones: ["Oporto", "Lisboa", "Barcelona"],
        respuestaCorrecta: 1 // Lisboa - Cercana: Oporto, Lejana: Barcelona
    },
    {
        pregunta: "¿Qué océano es el más grande del mundo?",
        opciones: ["Atlántico", "Pacífico", "Mediterráneo"],
        respuestaCorrecta: 1 // Pacífico - Cercana: Atlántico, Lejana: Mediterráneo (es un mar)
    },
    {
        pregunta: "¿Cuál de estos países NO tiene costa?",
        opciones: ["Francia", "Bolivia", "Italia"],
        respuestaCorrecta: 1 // Bolivia - Cercana: Italia (península pero tiene costa), Lejana: Francia (amplia costa)
    },
     {
        pregunta: "¿Cómo se llama la cordillera más alta del mundo?",
        opciones: ["Andes", "Alpes", "Himalaya"],
        respuestaCorrecta: 2 // Himalaya - Cercana: Andes, Lejana: Alpes
    },
    {
        pregunta: "¿Qué país tiene forma de bota?",
        opciones: ["Grecia", "Italia", "Portugal"],
        respuestaCorrecta: 1 // Italia - Cercana: Grecia, Lejana: Portugal
    },
    // Naturaleza y Ciencia
    {
        pregunta: "¿Qué gas necesitan las plantas para hacer la fotosíntesis?",
        opciones: ["Oxígeno", "Dióxido de Carbono", "Nitrógeno"],
        respuestaCorrecta: 1 // Dióxido de Carbono - Cercana: Oxígeno (lo producen), Lejana: Nitrógeno
    },
    {
        pregunta: "¿Cuál es el animal terrestre más grande?",
        opciones: ["Rinoceronte", "Elefante Africano", "Ballena Azul"],
        respuestaCorrecta: 1 // Elefante Africano - Cercana: Rinoceronte, Lejana: Ballena Azul (es marino)
    },
    {
        pregunta: "¿Cuántos corazones tiene un pulpo?",
        opciones: ["Uno", "Tres", "Ocho"],
        respuestaCorrecta: 1 // Tres - Cercana: Ocho (por los tentáculos), Lejana: Uno
    },
    {
        pregunta: "¿De qué se alimentan principalmente los koalas?",
        opciones: ["Bambú", "Hojas de eucalipto", "Fruta"],
        respuestaCorrecta: 1 // Hojas de eucalipto - Cercana: Bambú (lo come el panda), Lejana: Fruta
    },
    {
        pregunta: "¿Qué planeta es conocido como el 'Planeta Rojo'?",
        opciones: ["Júpiter", "Marte", "Sol"],
        respuestaCorrecta: 1 // Marte - Cercana: Júpiter (grande, pero no rojo), Lejana: Sol (es una estrella)
    },
    {
        pregunta: "El proceso por el cual el agua se convierte en vapor se llama:",
        opciones: ["Condensación", "Evaporación", "Congelación"],
        respuestaCorrecta: 1 // Evaporación - Cercana: Condensación (proceso inverso), Lejana: Congelación
    },
    {
        pregunta: "¿Qué tipo de animal es una ballena?",
        opciones: ["Pez", "Mamífero", "Reptil"],
        respuestaCorrecta: 1 // Mamífero - Cercana: Pez (vive en agua), Lejana: Reptil
    },
    {
        pregunta: "¿Cuántas patas tiene una araña?",
        opciones: ["Seis", "Ocho", "Diez"],
        respuestaCorrecta: 1 // Ocho - Cercana: Seis (insectos), Lejana: Diez
    },
    // Matemáticas
    {
        pregunta: "¿Cuánto es 9 multiplicado por 7?",
        opciones: ["56", "63", "97"],
        respuestaCorrecta: 1 // 63 - Cercana: 56 (8x7 o 7x8), Lejana: 97
    },
    {
        pregunta: "Si tienes 5 manzanas y te comes 2, ¿cuántas te quedan?",
        opciones: ["2", "3", "7"],
        respuestaCorrecta: 1 // 3 - Cercana: 2 (las que te comes), Lejana: 7 (suma)
    },
    {
        pregunta: "¿Cuántos lados tiene un hexágono?",
        opciones: ["Cinco", "Seis", "Ocho"],
        respuestaCorrecta: 1 // Seis - Cercana: Cinco (pentágono) u Ocho (octógono), Lejana: elegimos Cinco
    },
    {
        pregunta: "¿Qué número sigue en esta serie: 2, 4, 6, 8...?",
        opciones: ["9", "10", "12"],
        respuestaCorrecta: 1 // 10 - Cercana: 12 (siguiente par), Lejana: 9 (impar)
    },
    {
        pregunta: "La mitad de 50 es:",
        opciones: ["100", "25", "30"],
        respuestaCorrecta: 1 // 25 - Cercana: 30, Lejana: 100 (el doble)
    },
    {
        pregunta: "¿Cuántos minutos hay en una hora y media?",
        opciones: ["60", "90", "150"],
        respuestaCorrecta: 1 // 90 - Cercana: 60 (una hora), Lejana: 150
    },
     {
        pregunta: "Si un triángulo tiene todos sus lados iguales, se llama:",
        opciones: ["Isósceles", "Equilátero", "Rectángulo"],
        respuestaCorrecta: 1 // Equilátero - Cercana: Isósceles (dos lados iguales), Lejana: Rectángulo (tipo de ángulo)
    },
    // Lengua
    {
        pregunta: "¿Cuál es el antónimo (lo contrario) de 'rápido'?",
        opciones: ["Veloz", "Lento", "Pequeño"],
        respuestaCorrecta: 1 // Lento - Cercana: Veloz (sinónimo), Lejana: Pequeño
    },
    {
        pregunta: "La palabra 'árbol' es un:",
        opciones: ["Verbo", "Sustantivo (nombre)", "Adjetivo"],
        respuestaCorrecta: 1 // Sustantivo - Cercana: Adjetivo, Lejana: Verbo
    },
    {
        pregunta: "¿Qué palabra está mal escrita?",
        opciones: ["Jirafa", "Elefante", "Vurro"],
        respuestaCorrecta: 2 // Vurro (es Burro) - Las otras son correctas y comunes
    },
    {
        pregunta: "En la frase 'El perro marrón ladra fuerte', ¿cuál es el adjetivo?",
        opciones: ["Perro", "Marrón", "Ladra"],
        respuestaCorrecta: 1 // Marrón - Cercana: Perro (sustantivo), Lejana: Ladra (verbo)
    },
    {
        pregunta: "Un sinónimo (significa lo mismo) de 'contento' es:",
        opciones: ["Triste", "Alegre", "Enfadado"],
        respuestaCorrecta: 1 // Alegre - Cercana: Enfadado (otra emoción), Lejana: Triste (antónimo)
    },
     {
        pregunta: "¿Cuántas sílabas tiene la palabra 'bicicleta'?",
        opciones: ["Tres", "Cuatro", "Cinco"],
        respuestaCorrecta: 2 // Cinco (bi-ci-cle-ta) - Cercana: Cuatro, Lejana: Tres
    },
    {
        pregunta: "La letra 'H' en español...",
        opciones: ["Siempre suena fuerte", "Nunca suena (es muda)", "Suena como la 'J'"],
        respuestaCorrecta: 1 // Nunca suena (salvo 'ch') - Cercana: Suena como la J (en otros idiomas), Lejana: Siempre suena fuerte
    },
    // Deportes
    {
        pregunta: "¿Cuántos jugadores hay en un equipo de baloncesto en la cancha?",
        opciones: ["11", "5", "7"],
        respuestaCorrecta: 1 // 5 - Cercana: 7 (balonmano), Lejana: 11 (fútbol)
    },
    {
        pregunta: "¿Qué deporte practica Rafa Nadal?",
        opciones: ["Fútbol", "Tenis", "Golf"],
        respuestaCorrecta: 1 // Tenis - Cercana: Golf, Lejana: Fútbol
    },
    {
        pregunta: "¿Cada cuántos años se celebran los Juegos Olímpicos de Verano?",
        opciones: ["Cada 2 años", "Cada 4 años", "Todos los años"],
        respuestaCorrecta: 1 // Cada 4 años - Cercana: Cada 2 años (alterna invierno), Lejana: Todos los años
    },
    {
        pregunta: "En fútbol, ¿qué tarjeta significa expulsión directa?",
        opciones: ["Amarilla", "Roja", "Verde"],
        respuestaCorrecta: 1 // Roja - Cercana: Amarilla (amonestación), Lejana: Verde (no existe)
    },
    {
        pregunta: "¿Qué necesitas para jugar al bádminton además de la raqueta?",
        opciones: ["Una pelota", "Un volante (pluma)", "Un disco"],
        respuestaCorrecta: 1 // Un volante - Cercana: Una pelota, Lejana: Un disco
    },
    {
        pregunta: "¿Cómo se llama la carrera ciclista más famosa de Francia?",
        opciones: ["Giro de Italia", "Tour de Francia", "Vuelta a España"],
        respuestaCorrecta: 1 // Tour de Francia - Cercana: Vuelta a España, Lejana: Giro de Italia
    },
    {
        pregunta: "¿Qué país ganó el Mundial de Fútbol de 2010 en Sudáfrica?",
        opciones: ["Brasil", "España", "Argentina"],
        respuestaCorrecta: 1 // España - Cercana: Argentina / Brasil (potencias), Lejana: Brasil
    },
    // Cultura General e Historia
    {
        pregunta: "¿Quién pintó la Mona Lisa?",
        opciones: ["Picasso", "Leonardo da Vinci", "Van Gogh"],
        respuestaCorrecta: 1 // Leonardo da Vinci - Cercana: Picasso, Lejana: Van Gogh
    },
    {
        pregunta: "¿En qué ciudad están las pirámides de Giza?",
        opciones: ["Roma", "El Cairo (cerca)", "Atenas"],
        respuestaCorrecta: 1 // El Cairo (cerca) - Cercana: Atenas (otras ruinas famosas), Lejana: Roma
    },
    {
        pregunta: "¿Qué instrumento musical tiene teclas blancas y negras?",
        opciones: ["Guitarra", "Piano", "Tambor"],
        respuestaCorrecta: 1 // Piano - Cercana: Guitarra, Lejana: Tambor
    },
    {
        pregunta: "Los dinosaurios vivieron hace millones de años, ¿con quién NO convivieron?",
        opciones: ["Otros reptiles", "Primeros mamíferos", "Seres humanos"],
        respuestaCorrecta: 2 // Seres humanos - Cercana: Primeros mamíferos (sí coincidieron algunos), Lejana: Otros reptiles
    },
    {
        pregunta: "¿Cuál de estos es un famoso personaje de cuento?",
        opciones: ["Harry Potter", "Caperucita Roja", "Bob Esponja"],
        respuestaCorrecta: 1 // Caperucita Roja - Cercana: Harry Potter (literatura infantil/juvenil), Lejana: Bob Esponja (dibujos animados)
    },
     {
        pregunta: "¿Qué inventó Thomas Edison que usamos mucho hoy en día?",
        opciones: ["El teléfono", "La bombilla eléctrica (incandescente)", "El coche"],
        respuestaCorrecta: 1 // Bombilla - Cercana: Teléfono (Bell), Lejana: Coche (varios inventores)
    },
    {
        pregunta: "¿Cómo se llamaban los barcos de Cristóbal Colón en su primer viaje?",
        opciones: ["La Pinta, La Niña y la Santa María", "El Victoria y el Trinidad", "El Mayflower"],
        respuestaCorrecta: 0 // Pinta, Niña, Santa María - Cercana: Victoria y Trinidad (Magallanes), Lejana: Mayflower (peregrinos)
    },
     {
        pregunta: "En la mitología griega, ¿quién era el rey de los dioses?",
        opciones: ["Hércules", "Zeus", "Poseidón"],
        respuestaCorrecta: 1 // Zeus - Cercana: Poseidón (dios importante, hermano), Lejana: Hércules (héroe, hijo)
    },
    // Miscelánea
    {
        pregunta: "¿Cuál es la comida más famosa de Italia?",
        opciones: ["Paella", "Pizza", "Sushi"],
        respuestaCorrecta: 1 // Pizza - Cercana: Paella (famosa en España), Lejana: Sushi (Japón)
    },
    {
        pregunta: "¿Qué color se obtiene si mezclas azul y amarillo?",
        opciones: ["Rojo", "Verde", "Naranja"],
        respuestaCorrecta: 1 // Verde - Cercana: Naranja (rojo+amarillo), Lejana: Rojo
    },
    {
        pregunta: "¿Cuántos días tiene un año bisiesto?",
        opciones: ["365", "366", "360"],
        respuestaCorrecta: 1 // 366 - Cercana: 365 (año normal), Lejana: 360
    },
    {
        pregunta: "El papel se hace principalmente de...",
        opciones: ["Plástico", "Madera (celulosa)", "Metal"],
        respuestaCorrecta: 1 // Madera (celulosa) - Cercana: Plástico, Lejana: Metal
    },
    {
        pregunta: "¿Qué sentido usamos principalmente para escuchar música?",
        opciones: ["La vista", "El oído", "El olfato"],
        respuestaCorrecta: 1 // El oído - Cercana: La vista (vemos al músico), Lejana: El olfato
    }

];

// Puedes añadir más preguntas siguiendo la misma estructura.
