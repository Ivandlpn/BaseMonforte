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
    // --- 50 Preguntas Adicionales para preguntas.js ---

    // Ciencia y Naturaleza (Continuación)
    {
        pregunta: "¿Qué planeta de nuestro sistema solar es famoso por sus anillos?",
        opciones: ["Júpiter", "Saturno", "Urano"],
        respuestaCorrecta: 1 // Saturno - Cercana: Júpiter/Urano (también tienen, pero menos famosos), Lejana: Júpiter elegido
    },
    {
        pregunta: "¿Cuál es el estado del agua cuando está congelada?",
        opciones: ["Líquido", "Sólido", "Gaseoso"],
        respuestaCorrecta: 1 // Sólido - Cercana: Líquido/Gaseoso (otros estados), Lejana: Gaseoso elegido
    },
    {
        pregunta: "Las abejas producen una sustancia dulce llamada...",
        opciones: ["Mermelada", "Miel", "Jarabe"],
        respuestaCorrecta: 1 // Miel - Cercana: Jarabe, Lejana: Mermelada
    },
    {
        pregunta: "¿Qué órgano del cuerpo humano bombea la sangre?",
        opciones: ["Pulmón", "Corazón", "Cerebro"],
        respuestaCorrecta: 1 // Corazón - Cercana: Pulmón (relacionado con respiración/oxígeno), Lejana: Cerebro
    },
    {
        pregunta: "¿Por qué cambian de color algunos camaleones?",
        opciones: ["Para jugar al escondite", "Para camuflarse o comunicarse", "Porque se manchan"],
        respuestaCorrecta: 1 // Camuflaje/Comunicación - Cercana: Jugar (idea infantil), Lejana: Mancharse
    },
     {
        pregunta: "Además de en los polos, ¿dónde encontramos grandes masas de hielo?",
        opciones: ["En los desiertos", "En las altas montañas (glaciares)", "En el fondo del mar"],
        respuestaCorrecta: 1 // Glaciares - Cercana: Fondo del mar (agua fría, pero no masa de hielo así), Lejana: Desiertos
    },
    {
        pregunta: "¿Qué necesitan los coches (la mayoría) para moverse?",
        opciones: ["Agua", "Gasolina o electricidad", "Zumo de naranja"],
        respuestaCorrecta: 1 // Gasolina/Electricidad - Cercana: Agua (necesaria para refrigerar), Lejana: Zumo
    },
     {
        pregunta: "¿Cuál de estos animales es un reptil?",
        opciones: ["Rana", "Serpiente", "Delfín"],
        respuestaCorrecta: 1 // Serpiente - Cercana: Rana (anfibio), Lejana: Delfín (mamífero)
    },
    {
        pregunta: "El esqueleto humano está formado por...",
        opciones: ["Músculos", "Huesos", "Piel"],
        respuestaCorrecta: 1 // Huesos - Cercana: Músculos (trabajan juntos), Lejana: Piel
    },
    {
        pregunta: "¿Qué astro nos da luz y calor durante el día?",
        opciones: ["La Luna", "El Sol", "Marte"],
        respuestaCorrecta: 1 // El Sol - Cercana: La Luna (luz nocturna, reflejada), Lejana: Marte (planeta)
    },
    // Geografía (Continuación)
    {
        pregunta: "¿En qué país se encuentra la famosa Torre Eiffel?",
        opciones: ["Italia", "Francia", "Alemania"],
        respuestaCorrecta: 1 // Francia - Cercana: Italia/Alemania (países europeos vecinos), Lejana: Alemania elegido
    },
    {
        pregunta: "¿Cuál es la capital de Australia?",
        opciones: ["Sídney", "Canberra", "Melbourne"],
        respuestaCorrecta: 1 // Canberra - Cercana: Sídney/Melbourne (ciudades más conocidas), Lejana: Sídney elegido
    },
    {
        pregunta: "Un conjunto de islas cercanas entre sí se llama...",
        opciones: ["Península", "Archipiélago", "Continente"],
        respuestaCorrecta: 1 // Archipiélago - Cercana: Península (casi isla), Lejana: Continente
    },
    {
        pregunta: "¿Dónde viven los pingüinos emperador?",
        opciones: ["En el desierto del Sahara", "En la Antártida", "En el Polo Norte"],
        respuestaCorrecta: 1 // Antártida - Cercana: Polo Norte (también frío, pero viven osos polares), Lejana: Sahara
    },
    {
        pregunta: "El desierto más grande y cálido del mundo es el...",
        opciones: ["Gobi", "Sahara", "Atacama"],
        respuestaCorrecta: 1 // Sahara - Cercana: Atacama/Gobi (otros desiertos famosos), Lejana: Gobi elegido
    },
    {
        pregunta: "¿Qué país es conocido por tener forma de chile (ají)?",
        opciones: ["México", "Chile", "Perú"],
        respuestaCorrecta: 1 // Chile - Cercana: Perú/México (países americanos), Lejana: México elegido
    },
    // Historia y Cultura (Continuación)
    {
        pregunta: "¿Qué civilización antigua construyó Machu Picchu?",
        opciones: ["Los Romanos", "Los Incas", "Los Egipcios"],
        respuestaCorrecta: 1 // Incas - Cercana: Egipcios (otra gran civilización constructora), Lejana: Romanos
    },
    {
        pregunta: "¿Quién fue el primer presidente de los Estados Unidos?",
        opciones: ["Abraham Lincoln", "George Washington", "Donald Trump"],
        respuestaCorrecta: 1 // George Washington - Cercana: Abraham Lincoln (otro presidente muy famoso), Lejana: Donald Trump (reciente)
    },
    {
        pregunta: "¿Qué instrumento tocaba Mozart cuando era niño?",
        opciones: ["La batería", "El violín y el piano", "La flauta"],
        respuestaCorrecta: 1 // Violín y Piano - Cercana: Flauta (instrumento común), Lejana: Batería (anacrónica)
    },
    {
        pregunta: "Los jeroglíficos eran un sistema de escritura usado por los antiguos...",
        opciones: ["Griegos", "Egipcios", "Vikingos"],
        respuestaCorrecta: 1 // Egipcios - Cercana: Griegos (usaban alfabeto), Lejana: Vikingos (usaban runas)
    },
    {
        pregunta: "¿Qué es la 'pizza margarita'?",
        opciones: ["Una pizza con muchas flores", "Una pizza con tomate, mozzarella y albahaca", "Una pizza en forma de estrella"],
        respuestaCorrecta: 1 // Tomate, mozzarella, albahaca - Cercana: Forma de estrella (divertido pero incorrecto), Lejana: Flores
    },
    {
        pregunta: "¿Qué se celebra el 31 de octubre en muchos países, con disfraces y dulces?",
        opciones: ["Navidad", "Halloween", "Carnaval"],
        respuestaCorrecta: 1 // Halloween - Cercana: Carnaval (también disfraces), Lejana: Navidad
    },
     {
        pregunta: "La Gran Muralla fue construida en...",
        opciones: ["Japón", "China", "India"],
        respuestaCorrecta: 1 // China - Cercana: Japón/India (países asiáticos grandes), Lejana: Japón elegido
    },
    // Lengua (Continuación)
    {
        pregunta: "¿Qué tipo de palabra indica una acción?",
        opciones: ["Adjetivo", "Verbo", "Sustantivo"],
        respuestaCorrecta: 1 // Verbo - Cercana: Adjetivo/Sustantivo (otras categorías gramaticales), Lejana: Adjetivo elegido
    },
    {
        pregunta: "El plural de 'lápiz' es...",
        opciones: ["Lápizs", "Lápices", "Lápizes"],
        respuestaCorrecta: 1 // Lápices - Cercana: Lápizes (error común), Lejana: Lápizs
    },
    {
        pregunta: "Si algo es muy, muy grande, podemos decir que es...",
        opciones: ["Diminuto", "Enorme", "Rápido"],
        respuestaCorrecta: 1 // Enorme - Cercana: Diminuto (antónimo), Lejana: Rápido
    },
    {
        pregunta: "¿Qué signo usamos al final de una pregunta?",
        opciones: ["Un punto (.)", "Un signo de interrogación (?)", "Una coma (,)"],
        respuestaCorrecta: 1 // Interrogación - Cercana: Punto (fin de frase normal), Lejana: Coma
    },
    {
        pregunta: "¿Cuál de estas palabras es un nombre propio?",
        opciones: ["Ciudad", "Río", "París"],
        respuestaCorrecta: 2 // París - Cercana: Ciudad/Río (nombres comunes), Lejana: Ciudad elegido
    },
    // Matemáticas (Continuación)
    {
        pregunta: "¿Cuántos lados iguales tiene un cuadrado?",
        opciones: ["Dos", "Cuatro", "Tres"],
        respuestaCorrecta: 1 // Cuatro - Cercana: Dos/Tres (otras figuras), Lejana: Tres elegido
    },
    {
        pregunta: "Si tienes 10 galletas y das 3 a un amigo, ¿cuántas te quedan?",
        opciones: ["3", "7", "13"],
        respuestaCorrecta: 1 // 7 - Cercana: 3 (las que das), Lejana: 13 (suma)
    },
    {
        pregunta: "El resultado de 100 dividido entre 10 es...",
        opciones: ["1000", "10", "90"],
        respuestaCorrecta: 1 // 10 - Cercana: 90 (resta), Lejana: 1000 (multiplicación)
    },
    {
        pregunta: "¿Qué forma tiene una pelota de fútbol?",
        opciones: ["Cúbica", "Esférica", "Piramidal"],
        respuestaCorrecta: 1 // Esférica - Cercana: Cúbica/Piramidal (otras formas 3D), Lejana: Cúbica elegido
    },
    {
        pregunta: "¿Cuánto es 5 + 5 x 2?",
        opciones: ["20", "15", "25"],
        respuestaCorrecta: 1 // 15 (Primero 5x2=10, luego 5+10=15) - Cercana: 20 (Si se suma primero 5+5=10, luego 10x2=20), Lejana: 25
    },
    // Deportes (Continuación)
    {
        pregunta: "¿Qué se usa para golpear la pelota en el béisbol?",
        opciones: ["Una raqueta", "Un bate", "Un palo de golf"],
        respuestaCorrecta: 1 // Un bate - Cercana: Palo de golf, Lejana: Una raqueta
    },
    {
        pregunta: "En natación, ¿qué estilo consiste en mover los brazos hacia atrás por fuera del agua?",
        opciones: ["Braza", "Mariposa", "Espalda"],
        respuestaCorrecta: 1 // Mariposa - Cercana: Espalda (también boca arriba), Lejana: Braza
    },
    {
        pregunta: "¿Cuál de estos deportes se juega sobre hielo?",
        opciones: ["Baloncesto", "Hockey sobre hielo", "Voleibol"],
        respuestaCorrecta: 1 // Hockey sobre hielo - Cercana: Baloncesto/Voleibol (deportes de equipo), Lejana: Voleibol elegido
    },
    {
        pregunta: "¿Qué gimnasta famosa es conocida por sus increíbles saltos y medallas olímpicas?",
        opciones: ["Serena Williams", "Simone Biles", "Megan Rapinoe"],
        respuestaCorrecta: 1 // Simone Biles - Cercana: Serena Williams (otra gran deportista), Lejana: Megan Rapinoe (futbolista)
    },
    {
        pregunta: "Para ganar un partido de voleibol, necesitas ganar varios...",
        opciones: ["Goles", "Sets", "Puntos de partido"],
        respuestaCorrecta: 1 // Sets - Cercana: Puntos de partido (necesarios al final), Lejana: Goles
    },
    // Miscelánea y Curiosidades
    {
        pregunta: "¿De qué están hechas principalmente las nubes?",
        opciones: ["Algodón de azúcar", "Pequeñas gotas de agua o cristales de hielo", "Humo"],
        respuestaCorrecta: 1 // Gotas de agua/hielo - Cercana: Humo, Lejana: Algodón de azúcar
    },
    {
        pregunta: "¿Qué animal dice 'mu'?",
        opciones: ["El perro", "La vaca", "El gato"],
        respuestaCorrecta: 1 // La vaca - Cercana: Gato (otro animal doméstico), Lejana: Perro
    },
    {
        pregunta: "¿Para qué sirve principalmente un semáforo?",
        opciones: ["Para decorar la calle", "Para controlar el tráfico de coches y peatones", "Para dar sombra"],
        respuestaCorrecta: 1 // Controlar tráfico - Cercana: Decorar, Lejana: Dar sombra
    },
    {
        pregunta: "¿Cuál es el ingrediente principal para hacer palomitas de maíz?",
        opciones: ["Arroz", "Maíz especial", "Trigo"],
        respuestaCorrecta: 1 // Maíz especial - Cercana: Trigo/Arroz (otros granos), Lejana: Arroz elegido
    },
    {
        pregunta: "Si tienes mucho frío, ¿qué ropa te pones?",
        opciones: ["Un bañador", "Un abrigo", "Unas gafas de sol"],
        respuestaCorrecta: 1 // Un abrigo - Cercana: Gafas de sol (accesorio), Lejana: Bañador
    },
    {
        pregunta: "Los colores primarios son rojo, azul y...",
        opciones: ["Verde", "Amarillo", "Naranja"],
        respuestaCorrecta: 1 // Amarillo - Cercana: Verde/Naranja (colores secundarios), Lejana: Verde elegido
    },
    {
        pregunta: "¿Qué aparato usamos para ver las estrellas y planetas lejanos?",
        opciones: ["Microscopio", "Telescopio", "Lupa"],
        respuestaCorrecta: 1 // Telescopio - Cercana: Lupa (aumenta, pero no para tan lejos), Lejana: Microscopio (para cosas pequeñas)
    },
    {
        pregunta: "¿Qué profesional nos ayuda cuando nos duele una muela?",
        opciones: ["El panadero", "El dentista", "El bombero"],
        respuestaCorrecta: 1 // El dentista - Cercana: Panadero/Bombero (profesiones), Lejana: Bombero elegido
    },
    {
        pregunta: "El pan se hace principalmente con agua, levadura y...",
        opciones: ["Azúcar", "Harina", "Salchichas"],
        respuestaCorrecta: 1 // Harina - Cercana: Azúcar (a veces se añade poco), Lejana: Salchichas
    },
    {
        pregunta: "¿Qué es un 'cómic'?",
        opciones: ["Una película de risa", "Una historia contada con dibujos y texto", "Un tipo de caramelo"],
        respuestaCorrecta: 1 // Historia con dibujos - Cercana: Película de risa (humor), Lejana: Caramelo
    },
    {
        pregunta: "¿Qué animal construye diques en los ríos?",
        opciones: ["El oso", "El castor", "El pato"],
        respuestaCorrecta: 1 // El castor - Cercana: Pato (vive en agua), Lejana: Oso
    }

// --- Fin de las 50 preguntas adicionales ---
];

// Puedes añadir más preguntas siguiendo la misma estructura.
