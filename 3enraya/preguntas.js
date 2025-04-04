// --- Archivo: preguntas.js ---
// Contiene las preguntas para el quiz del juego 3 en Raya.
// Total: 150 preguntas de dificultad variada para niños de 9-12 años.
// Estructura de cada pregunta:
// {
//   pregunta: "Texto de la pregunta",
//   opciones: ["Opción A", "Opción B", "Opción C"], // Array de 3 strings
//   respuestaCorrecta: 0 // Índice (0, 1 o 2) de la opción correcta en el array 'opciones'
// }

const preguntasQuiz = [
    // --- Batch 1: Preguntas 1-50 (Dificultad Base) ---
    // Geografía (1-7)
    {
        pregunta: "¿Cuál es el río más largo de España?",
        opciones: ["Ebro", "Tajo", "Amazonas"],
        respuestaCorrecta: 1 // Tajo
    },
    {
        pregunta: "¿En qué continente se encuentra Egipto?",
        opciones: ["Asia", "África", "Oceanía"],
        respuestaCorrecta: 1 // África
    },
    {
        pregunta: "¿Cuál es la capital de Portugal?",
        opciones: ["Oporto", "Lisboa", "Barcelona"],
        respuestaCorrecta: 1 // Lisboa
    },
    {
        pregunta: "¿Qué océano es el más grande del mundo?",
        opciones: ["Atlántico", "Pacífico", "Mediterráneo"],
        respuestaCorrecta: 1 // Pacífico
    },
    {
        pregunta: "¿Cuál de estos países NO tiene costa?",
        opciones: ["Francia", "Bolivia", "Italia"],
        respuestaCorrecta: 1 // Bolivia
    },
     {
        pregunta: "¿Cómo se llama la cordillera más alta del mundo?",
        opciones: ["Andes", "Alpes", "Himalaya"],
        respuestaCorrecta: 2 // Himalaya
    },
    {
        pregunta: "¿Qué país tiene forma de bota?",
        opciones: ["Grecia", "Italia", "Portugal"],
        respuestaCorrecta: 1 // Italia
    },
    // Naturaleza y Ciencia (8-15)
    {
        pregunta: "¿Qué gas necesitan las plantas para hacer la fotosíntesis?",
        opciones: ["Oxígeno", "Dióxido de Carbono", "Nitrógeno"],
        respuestaCorrecta: 1 // Dióxido de Carbono
    },
    {
        pregunta: "¿Cuál es el animal terrestre más grande?",
        opciones: ["Rinoceronte", "Elefante Africano", "Ballena Azul"],
        respuestaCorrecta: 1 // Elefante Africano
    },
    {
        pregunta: "¿Cuántos corazones tiene un pulpo?",
        opciones: ["Uno", "Tres", "Ocho"],
        respuestaCorrecta: 1 // Tres
    },
    {
        pregunta: "¿De qué se alimentan principalmente los koalas?",
        opciones: ["Bambú", "Hojas de eucalipto", "Fruta"],
        respuestaCorrecta: 1 // Hojas de eucalipto
    },
    {
        pregunta: "¿Qué planeta es conocido como el 'Planeta Rojo'?",
        opciones: ["Júpiter", "Marte", "Sol"],
        respuestaCorrecta: 1 // Marte
    },
    {
        pregunta: "El proceso por el cual el agua se convierte en vapor se llama:",
        opciones: ["Condensación", "Evaporación", "Congelación"],
        respuestaCorrecta: 1 // Evaporación
    },
    {
        pregunta: "¿Qué tipo de animal es una ballena?",
        opciones: ["Pez", "Mamífero", "Reptil"],
        respuestaCorrecta: 1 // Mamífero
    },
    {
        pregunta: "¿Cuántas patas tiene una araña?",
        opciones: ["Seis", "Ocho", "Diez"],
        respuestaCorrecta: 1 // Ocho
    },
    // Matemáticas (16-22)
    {
        pregunta: "¿Cuánto es 9 multiplicado por 7?",
        opciones: ["56", "63", "97"],
        respuestaCorrecta: 1 // 63
    },
    {
        pregunta: "Si tienes 5 manzanas y te comes 2, ¿cuántas te quedan?",
        opciones: ["2", "3", "7"],
        respuestaCorrecta: 1 // 3
    },
    {
        pregunta: "¿Cuántos lados tiene un hexágono?",
        opciones: ["Cinco", "Seis", "Ocho"],
        respuestaCorrecta: 1 // Seis
    },
    {
        pregunta: "¿Qué número sigue en esta serie: 2, 4, 6, 8...?",
        opciones: ["9", "10", "12"],
        respuestaCorrecta: 1 // 10
    },
    {
        pregunta: "La mitad de 50 es:",
        opciones: ["100", "25", "30"],
        respuestaCorrecta: 1 // 25
    },
    {
        pregunta: "¿Cuántos minutos hay en una hora y media?",
        opciones: ["60", "90", "150"],
        respuestaCorrecta: 1 // 90
    },
     {
        pregunta: "Si un triángulo tiene todos sus lados iguales, se llama:",
        opciones: ["Isósceles", "Equilátero", "Rectángulo"],
        respuestaCorrecta: 1 // Equilátero
    },
    // Lengua (23-29)
    {
        pregunta: "¿Cuál es el antónimo (lo contrario) de 'rápido'?",
        opciones: ["Veloz", "Lento", "Pequeño"],
        respuestaCorrecta: 1 // Lento
    },
    {
        pregunta: "La palabra 'árbol' es un:",
        opciones: ["Verbo", "Sustantivo (nombre)", "Adjetivo"],
        respuestaCorrecta: 1 // Sustantivo (nombre)
    },
    {
        pregunta: "¿Qué palabra está mal escrita?",
        opciones: ["Jirafa", "Elefante", "Vurro"],
        respuestaCorrecta: 2 // Vurro (es Burro)
    },
    {
        pregunta: "En la frase 'El perro marrón ladra fuerte', ¿cuál es el adjetivo?",
        opciones: ["Perro", "Marrón", "Ladra"],
        respuestaCorrecta: 1 // Marrón
    },
    {
        pregunta: "Un sinónimo (significa lo mismo) de 'contento' es:",
        opciones: ["Triste", "Alegre", "Enfadado"],
        respuestaCorrecta: 1 // Alegre
    },
     {
        pregunta: "¿Cuántas sílabas tiene la palabra 'bicicleta'?",
        opciones: ["Tres", "Cuatro", "Cinco"],
        respuestaCorrecta: 2 // Cinco (bi-ci-cle-ta)
    },
    {
        pregunta: "La letra 'H' en español...",
        opciones: ["Siempre suena fuerte", "Nunca suena (es muda)", "Suena como la 'J'"],
        respuestaCorrecta: 1 // Nunca suena (es muda)
    },
    // Deportes (30-36)
    {
        pregunta: "¿Cuántos jugadores hay en un equipo de baloncesto en la cancha?",
        opciones: ["11", "5", "7"],
        respuestaCorrecta: 1 // 5
    },
    {
        pregunta: "¿Qué deporte practica Rafa Nadal?",
        opciones: ["Fútbol", "Tenis", "Golf"],
        respuestaCorrecta: 1 // Tenis
    },
    {
        pregunta: "¿Cada cuántos años se celebran los Juegos Olímpicos de Verano?",
        opciones: ["Cada 2 años", "Cada 4 años", "Todos los años"],
        respuestaCorrecta: 1 // Cada 4 años
    },
    {
        pregunta: "En fútbol, ¿qué tarjeta significa expulsión directa?",
        opciones: ["Amarilla", "Roja", "Verde"],
        respuestaCorrecta: 1 // Roja
    },
    {
        pregunta: "¿Qué necesitas para jugar al bádminton además de la raqueta?",
        opciones: ["Una pelota", "Un volante (pluma)", "Un disco"],
        respuestaCorrecta: 1 // Un volante (pluma)
    },
    {
        pregunta: "¿Cómo se llama la carrera ciclista más famosa de Francia?",
        opciones: ["Giro de Italia", "Tour de Francia", "Vuelta a España"],
        respuestaCorrecta: 1 // Tour de Francia
    },
    {
        pregunta: "¿Qué país ganó el Mundial de Fútbol de 2010 en Sudáfrica?",
        opciones: ["Brasil", "España", "Argentina"],
        respuestaCorrecta: 1 // España
    },
    // Cultura General e Historia (37-44)
    {
        pregunta: "¿Quién pintó la Mona Lisa?",
        opciones: ["Picasso", "Leonardo da Vinci", "Van Gogh"],
        respuestaCorrecta: 1 // Leonardo da Vinci
    },
    {
        pregunta: "¿En qué ciudad están las pirámides de Giza?",
        opciones: ["Roma", "El Cairo (cerca)", "Atenas"],
        respuestaCorrecta: 1 // El Cairo (cerca)
    },
    {
        pregunta: "¿Qué instrumento musical tiene teclas blancas y negras?",
        opciones: ["Guitarra", "Piano", "Tambor"],
        respuestaCorrecta: 1 // Piano
    },
    {
        pregunta: "Los dinosaurios vivieron hace millones de años, ¿con quién NO convivieron?",
        opciones: ["Otros reptiles", "Primeros mamíferos", "Seres humanos"],
        respuestaCorrecta: 2 // Seres humanos
    },
    {
        pregunta: "¿Cuál de estos es un famoso personaje de cuento?",
        opciones: ["Harry Potter", "Caperucita Roja", "Bob Esponja"],
        respuestaCorrecta: 1 // Caperucita Roja
    },
     {
        pregunta: "¿Qué inventó Thomas Edison que usamos mucho hoy en día?",
        opciones: ["El teléfono", "La bombilla eléctrica (incandescente)", "El coche"],
        respuestaCorrecta: 1 // La bombilla eléctrica (incandescente)
    },
    {
        pregunta: "¿Cómo se llamaban los barcos de Cristóbal Colón en su primer viaje?",
        opciones: ["La Pinta, La Niña y la Santa María", "El Victoria y el Trinidad", "El Mayflower"],
        respuestaCorrecta: 0 // La Pinta, La Niña y la Santa María
    },
     {
        pregunta: "En la mitología griega, ¿quién era el rey de los dioses?",
        opciones: ["Hércules", "Zeus", "Poseidón"],
        respuestaCorrecta: 1 // Zeus
    },
    // Miscelánea (45-50)
    {
        pregunta: "¿Cuál es la comida más famosa de Italia?",
        opciones: ["Paella", "Pizza", "Sushi"],
        respuestaCorrecta: 1 // Pizza
    },
    {
        pregunta: "¿Qué color se obtiene si mezclas azul y amarillo?",
        opciones: ["Rojo", "Verde", "Naranja"],
        respuestaCorrecta: 1 // Verde
    },
    {
        pregunta: "¿Cuántos días tiene un año bisiesto?",
        opciones: ["365", "366", "360"],
        respuestaCorrecta: 1 // 366
    },
    {
        pregunta: "El papel se hace principalmente de...",
        opciones: ["Plástico", "Madera (celulosa)", "Metal"],
        respuestaCorrecta: 1 // Madera (celulosa)
    },
    {
        pregunta: "¿Qué sentido usamos principalmente para escuchar música?",
        opciones: ["La vista", "El oído", "El olfato"],
        respuestaCorrecta: 1 // El oído
    },
    {
        pregunta: "¿En qué año llegó el hombre a la Luna?",
        opciones: ["1965", "1969", "1972"],
        respuestaCorrecta: 1 // 1969
     },

    // --- Batch 2: Preguntas 51-100 (Dificultad similar/ligeramente mayor) ---
    // Ciencia y Naturaleza (Continuación) (51-60)
    {
        pregunta: "¿Qué planeta de nuestro sistema solar es famoso por sus anillos?",
        opciones: ["Júpiter", "Saturno", "Urano"],
        respuestaCorrecta: 1 // Saturno
    },
    {
        pregunta: "¿Cuál es el estado del agua cuando está congelada?",
        opciones: ["Líquido", "Sólido", "Gaseoso"],
        respuestaCorrecta: 1 // Sólido
    },
    {
        pregunta: "Las abejas producen una sustancia dulce llamada...",
        opciones: ["Mermelada", "Miel", "Jarabe"],
        respuestaCorrecta: 1 // Miel
    },
    {
        pregunta: "¿Qué órgano del cuerpo humano bombea la sangre?",
        opciones: ["Pulmón", "Corazón", "Cerebro"],
        respuestaCorrecta: 1 // Corazón
    },
    {
        pregunta: "¿Por qué cambian de color algunos camaleones?",
        opciones: ["Para jugar al escondite", "Para camuflarse o comunicarse", "Porque se manchan"],
        respuestaCorrecta: 1 // Para camuflarse o comunicarse
    },
     {
        pregunta: "Además de en los polos, ¿dónde encontramos grandes masas de hielo?",
        opciones: ["En los desiertos", "En las altas montañas (glaciares)", "En el fondo del mar"],
        respuestaCorrecta: 1 // En las altas montañas (glaciares)
    },
    {
        pregunta: "¿Qué necesitan los coches (la mayoría) para moverse?",
        opciones: ["Agua", "Gasolina o electricidad", "Zumo de naranja"],
        respuestaCorrecta: 1 // Gasolina o electricidad
    },
     {
        pregunta: "¿Cuál de estos animales es un reptil?",
        opciones: ["Rana", "Serpiente", "Delfín"],
        respuestaCorrecta: 1 // Serpiente
    },
    {
        pregunta: "El esqueleto humano está formado por...",
        opciones: ["Músculos", "Huesos", "Piel"],
        respuestaCorrecta: 1 // Huesos
    },
    {
        pregunta: "¿Qué astro nos da luz y calor durante el día?",
        opciones: ["La Luna", "El Sol", "Marte"],
        respuestaCorrecta: 1 // El Sol
    },
    // Geografía (Continuación) (61-66)
    {
        pregunta: "¿En qué país se encuentra la famosa Torre Eiffel?",
        opciones: ["Italia", "Francia", "Alemania"],
        respuestaCorrecta: 1 // Francia
    },
    {
        pregunta: "¿Cuál es la capital de Australia?",
        opciones: ["Sídney", "Canberra", "Melbourne"],
        respuestaCorrecta: 1 // Canberra
    },
    {
        pregunta: "Un conjunto de islas cercanas entre sí se llama...",
        opciones: ["Península", "Archipiélago", "Continente"],
        respuestaCorrecta: 1 // Archipiélago
    },
    {
        pregunta: "¿Dónde viven los pingüinos emperador?",
        opciones: ["En el desierto del Sahara", "En la Antártida", "En el Polo Norte"],
        respuestaCorrecta: 1 // En la Antártida
    },
    {
        pregunta: "El desierto más grande y cálido del mundo es el...",
        opciones: ["Gobi", "Sahara", "Atacama"],
        respuestaCorrecta: 1 // Sahara
    },
    {
        pregunta: "¿Qué país es conocido por tener forma de chile (ají)?",
        opciones: ["México", "Chile", "Perú"],
        respuestaCorrecta: 1 // Chile
    },
    // Historia y Cultura (Continuación) (67-73)
    {
        pregunta: "¿Qué civilización antigua construyó Machu Picchu?",
        opciones: ["Los Romanos", "Los Incas", "Los Egipcios"],
        respuestaCorrecta: 1 // Los Incas
    },
    {
        pregunta: "¿Quién fue el primer presidente de los Estados Unidos?",
        opciones: ["Abraham Lincoln", "George Washington", "Donald Trump"],
        respuestaCorrecta: 1 // George Washington
    },
    {
        pregunta: "¿Qué instrumento tocaba Mozart cuando era niño?",
        opciones: ["La batería", "El violín y el piano", "La flauta"],
        respuestaCorrecta: 1 // El violín y el piano
    },
    {
        pregunta: "Los jeroglíficos eran un sistema de escritura usado por los antiguos...",
        opciones: ["Griegos", "Egipcios", "Vikingos"],
        respuestaCorrecta: 1 // Egipcios
    },
    {
        pregunta: "¿Qué es la 'pizza margarita'?",
        opciones: ["Una pizza con muchas flores", "Una pizza con tomate, mozzarella y albahaca", "Una pizza en forma de estrella"],
        respuestaCorrecta: 1 // Una pizza con tomate, mozzarella y albahaca
    },
    {
        pregunta: "¿Qué se celebra el 31 de octubre en muchos países, con disfraces y dulces?",
        opciones: ["Navidad", "Halloween", "Carnaval"],
        respuestaCorrecta: 1 // Halloween
    },
     {
        pregunta: "La Gran Muralla fue construida en...",
        opciones: ["Japón", "China", "India"],
        respuestaCorrecta: 1 // China
    },
    // Lengua (Continuación) (74-78)
    {
        pregunta: "¿Qué tipo de palabra indica una acción?",
        opciones: ["Adjetivo", "Verbo", "Sustantivo"],
        respuestaCorrecta: 1 // Verbo
    },
    {
        pregunta: "El plural de 'lápiz' es...",
        opciones: ["Lápizs", "Lápices", "Lápizes"],
        respuestaCorrecta: 1 // Lápices
    },
    {
        pregunta: "Si algo es muy, muy grande, podemos decir que es...",
        opciones: ["Diminuto", "Enorme", "Rápido"],
        respuestaCorrecta: 1 // Enorme
    },
    {
        pregunta: "¿Qué signo usamos al final de una pregunta?",
        opciones: ["Un punto (.)", "Un signo de interrogación (?)", "Una coma (,)"],
        respuestaCorrecta: 1 // Un signo de interrogación (?)
    },
    {
        pregunta: "¿Cuál de estas palabras es un nombre propio?",
        opciones: ["Ciudad", "Río", "París"],
        respuestaCorrecta: 2 // París
    },
    // Matemáticas (Continuación) (79-83)
    {
        pregunta: "¿Cuántos lados iguales tiene un cuadrado?",
        opciones: ["Dos", "Cuatro", "Tres"],
        respuestaCorrecta: 1 // Cuatro
    },
    {
        pregunta: "Si tienes 10 galletas y das 3 a un amigo, ¿cuántas te quedan?",
        opciones: ["3", "7", "13"],
        respuestaCorrecta: 1 // 7
    },
    {
        pregunta: "El resultado de 100 dividido entre 10 es...",
        opciones: ["1000", "10", "90"],
        respuestaCorrecta: 1 // 10
    },
    {
        pregunta: "¿Qué forma tiene una pelota de fútbol?",
        opciones: ["Cúbica", "Esférica", "Piramidal"],
        respuestaCorrecta: 1 // Esférica
    },
    {
        pregunta: "¿Cuánto es 5 + 5 x 2?",
        opciones: ["20", "15", "25"],
        respuestaCorrecta: 1 // 15
    },
    // Deportes (Continuación) (84-88)
    {
        pregunta: "¿Qué se usa para golpear la pelota en el béisbol?",
        opciones: ["Una raqueta", "Un bate", "Un palo de golf"],
        respuestaCorrecta: 1 // Un bate
    },
    {
        pregunta: "En natación, ¿qué estilo consiste en mover los brazos hacia atrás por fuera del agua?",
        opciones: ["Braza", "Mariposa", "Espalda"],
        respuestaCorrecta: 1 // Mariposa
    },
    {
        pregunta: "¿Cuál de estos deportes se juega sobre hielo?",
        opciones: ["Baloncesto", "Hockey sobre hielo", "Voleibol"],
        respuestaCorrecta: 1 // Hockey sobre hielo
    },
    {
        pregunta: "¿Qué gimnasta famosa es conocida por sus increíbles saltos y medallas olímpicas?",
        opciones: ["Serena Williams", "Simone Biles", "Megan Rapinoe"],
        respuestaCorrecta: 1 // Simone Biles
    },
    {
        pregunta: "Para ganar un partido de voleibol, necesitas ganar varios...",
        opciones: ["Goles", "Sets", "Puntos de partido"],
        respuestaCorrecta: 1 // Sets
    },
    // Miscelánea y Curiosidades (Continuación) (89-100)
    {
        pregunta: "¿De qué están hechas principalmente las nubes?",
        opciones: ["Algodón de azúcar", "Pequeñas gotas de agua o cristales de hielo", "Humo"],
        respuestaCorrecta: 1 // Pequeñas gotas de agua o cristales de hielo
    },
    {
        pregunta: "¿Qué animal dice 'mu'?",
        opciones: ["El perro", "La vaca", "El gato"],
        respuestaCorrecta: 1 // La vaca
    },
    {
        pregunta: "¿Para qué sirve principalmente un semáforo?",
        opciones: ["Para decorar la calle", "Para controlar el tráfico de coches y peatones", "Para dar sombra"],
        respuestaCorrecta: 1 // Para controlar el tráfico de coches y peatones
    },
    {
        pregunta: "¿Cuál es el ingrediente principal para hacer palomitas de maíz?",
        opciones: ["Arroz", "Maíz especial", "Trigo"],
        respuestaCorrecta: 1 // Maíz especial
    },
    {
        pregunta: "Si tienes mucho frío, ¿qué ropa te pones?",
        opciones: ["Un bañador", "Un abrigo", "Unas gafas de sol"],
        respuestaCorrecta: 1 // Un abrigo
    },
    {
        pregunta: "Los colores primarios son rojo, azul y...",
        opciones: ["Verde", "Amarillo", "Naranja"],
        respuestaCorrecta: 1 // Amarillo
    },
    {
        pregunta: "¿Qué aparato usamos para ver las estrellas y planetas lejanos?",
        opciones: ["Microscopio", "Telescopio", "Lupa"],
        respuestaCorrecta: 1 // Telescopio
    },
    {
        pregunta: "¿Qué profesional nos ayuda cuando nos duele una muela?",
        opciones: ["El panadero", "El dentista", "El bombero"],
        respuestaCorrecta: 1 // El dentista
    },
    {
        pregunta: "El pan se hace principalmente con agua, levadura y...",
        opciones: ["Azúcar", "Harina", "Salchichas"],
        respuestaCorrecta: 1 // Harina
    },
    {
        pregunta: "¿Qué es un 'cómic'?",
        opciones: ["Una película de risa", "Una historia contada con dibujos y texto", "Un tipo de caramelo"],
        respuestaCorrecta: 1 // Una historia contada con dibujos y texto
    },
    {
        pregunta: "¿Qué animal construye diques en los ríos?",
        opciones: ["El oso", "El castor", "El pato"],
        respuestaCorrecta: 1 // El castor
    },
    {
        pregunta: "¿Qué animal es el logo de Ferrari?",
        opciones: ["León", "Toro", "Caballo"],
        respuestaCorrecta: 2 // Caballo
     },

    // --- Batch 3: Preguntas 101-150 (Mayor Dificultad) ---
    // Ciencia y Naturaleza (Más específico) (101-110)
    {
        pregunta: "¿Qué gas compone la mayor parte del aire que respiramos?",
        opciones: ["Oxígeno", "Nitrógeno", "Dióxido de Carbono"],
        respuestaCorrecta: 1 // Nitrógeno
    },
    {
        pregunta: "Las plantas absorben agua principalmente a través de sus...",
        opciones: ["Hojas", "Raíces", "Flores"],
        respuestaCorrecta: 1 // Raíces
    },
    {
        pregunta: "¿Qué tipo de animal es un murciélago?",
        opciones: ["Ave", "Mamífero", "Insecto"],
        respuestaCorrecta: 1 // Mamífero
    },
    {
        pregunta: "La fuerza que atrae los objetos hacia el centro de la Tierra se llama:",
        opciones: ["Magnetismo", "Gravedad", "Electricidad"],
        respuestaCorrecta: 1 // Gravedad
    },
    {
        pregunta: "¿Cuál de estos NO es un planeta de nuestro Sistema Solar?",
        opciones: ["Venus", "Sirio", "Neptuno"],
        respuestaCorrecta: 1 // Sirio (es una estrella)
    },
    {
        pregunta: "El proceso por el cual una oruga se convierte en mariposa se llama:",
        opciones: ["Evolución", "Metamorfosis", "Nacimiento"],
        respuestaCorrecta: 1 // Metamorfosis
    },
    {
        pregunta: "¿Qué animales tienen sangre fría (su temperatura depende del ambiente)?",
        opciones: ["Perros y gatos", "Reptiles y anfibios", "Pájaros y peces"],
        respuestaCorrecta: 1 // Reptiles y anfibios
    },
    {
        pregunta: "¿Qué parte del ojo controla cuánta luz entra?",
        opciones: ["La retina", "La pupila", "El párpado"],
        respuestaCorrecta: 1 // La pupila
    },
    {
        pregunta: "¿Qué metal es líquido a temperatura ambiente?",
        opciones: ["Hierro", "Mercurio", "Aluminio"],
        respuestaCorrecta: 1 // Mercurio
    },
    {
        pregunta: "Un animal que come solo plantas se llama:",
        opciones: ["Carnívoro", "Herbívoro", "Omnívoro"],
        respuestaCorrecta: 1 // Herbívoro
    },
    // Geografía (Más específico) (111-115)
    {
        pregunta: "¿Cuál es el desierto más grande del mundo (incluyendo fríos)?",
        opciones: ["Sahara", "Antártida", "Gobi"],
        respuestaCorrecta: 1 // Antártida
    },
    {
        pregunta: "¿Qué estrecho separa España de África?",
        opciones: ["Canal de la Mancha", "Estrecho de Gibraltar", "Canal de Suez"],
        respuestaCorrecta: 1 // Estrecho de Gibraltar
    },
    {
        pregunta: "¿Qué país ocupa la mayor parte de la Península Ibérica?",
        opciones: ["Portugal", "España", "Andorra"],
        respuestaCorrecta: 1 // España
    },
    {
        pregunta: "El Monte Everest se encuentra en la cordillera del...",
        opciones: ["Himalaya", "Alpes", "Cáucaso"],
        respuestaCorrecta: 0 // Himalaya
    },
    {
        pregunta: "¿Cuál es la capital de Canadá?",
        opciones: ["Toronto", "Ottawa", "Vancouver"],
        respuestaCorrecta: 1 // Ottawa
    },
    // Historia y Cultura (Más específico) (116-122)
    {
        pregunta: "¿Quién escribió la obra de teatro 'Romeo y Julieta'?",
        opciones: ["Cervantes", "Shakespeare", "Lope de Vega"],
        respuestaCorrecta: 1 // Shakespeare
    },
    {
        pregunta: "¿Qué imperio construyó el Coliseo de Roma?",
        opciones: ["El Imperio Griego", "El Imperio Romano", "El Imperio Egipcio"],
        respuestaCorrecta: 1 // El Imperio Romano
    },
    {
        pregunta: "¿Qué evento marcó el inicio de la Revolución Francesa en 1789?",
        opciones: ["La coronación del rey", "La toma de la Bastilla", "La invención de la guillotina"],
        respuestaCorrecta: 1 // La toma de la Bastilla
    },
    {
        pregunta: "Leonardo da Vinci es famoso por pintar la Mona Lisa y también por diseñar...",
        opciones: ["Edificios modernos", "Máquinas voladoras y otros inventos", "Esculturas de animales"],
        respuestaCorrecta: 1 // Máquinas voladoras y otros inventos
    },
    {
        pregunta: "¿Qué significa la palabra 'Democracia'?",
        opciones: ["Gobierno de los ricos", "Gobierno del pueblo", "Gobierno de un rey"],
        respuestaCorrecta: 1 // Gobierno del pueblo
    },
    {
        pregunta: "¿Qué instrumento musical es el símbolo de Irlanda?",
        opciones: ["La gaita", "El arpa", "El violín"],
        respuestaCorrecta: 1 // El arpa
    },
    {
        pregunta: "¿Qué es el 'origami'?",
        opciones: ["Un tipo de comida japonesa", "El arte japonés de doblar papel", "Un arte marcial"],
        respuestaCorrecta: 1 // El arte japonés de doblar papel
    },
    // Lengua (Más específico) (123-127)
    {
        pregunta: "Una palabra que suena igual que otra pero significa algo diferente se llama:",
        opciones: ["Sinónimo", "Homófona", "Antónimo"],
        respuestaCorrecta: 1 // Homófona
    },
    {
        pregunta: "¿Qué es un palíndromo?",
        opciones: ["Una palabra muy larga", "Una palabra o frase que se lee igual al revés", "Un tipo de rima"],
        respuestaCorrecta: 1 // Una palabra o frase que se lee igual al revés
    },
    {
        pregunta: "El conjunto de letras de un idioma ordenadas se llama:",
        opciones: ["Diccionario", "Alfabeto (o Abecedario)", "Gramática"],
        respuestaCorrecta: 1 // Alfabeto (o Abecedario)
    },
    {
        pregunta: "¿Qué significa el prefijo 'sub-' en palabras como 'submarino'?",
        opciones: ["Encima", "Debajo", "Al lado"],
        respuestaCorrecta: 1 // Debajo
    },
    {
        pregunta: "En la frase 'Cantamos alegremente', ¿qué tipo de palabra es 'alegremente'?",
        opciones: ["Adjetivo", "Adverbio", "Verbo"],
        respuestaCorrecta: 1 // Adverbio
    },
    // Matemáticas (Más específico) (128-132)
    {
        pregunta: "¿Cuántos grados tiene un ángulo recto?",
        opciones: ["45 grados", "90 grados", "180 grados"],
        respuestaCorrecta: 1 // 90 grados
    },
    {
        pregunta: "El número romano 'C' representa el número...",
        opciones: ["50", "100", "1000"],
        respuestaCorrecta: 1 // 100
    },
    {
        pregunta: "Si un reloj marca las 3:15 PM, ¿cuántos minutos faltan para las 4:00 PM?",
        opciones: ["15 minutos", "45 minutos", "60 minutos"],
        respuestaCorrecta: 1 // 45 minutos
    },
    {
        pregunta: "¿Qué es un número primo?",
        opciones: ["Un número que es par", "Un número solo divisible por 1 y por sí mismo", "Un número que termina en 5"],
        respuestaCorrecta: 1 // Un número solo divisible por 1 y por sí mismo
    },
    {
        pregunta: "¿Cuál es el perímetro de un cuadrado cuyo lado mide 5 cm?",
        opciones: ["10 cm", "20 cm", "25 cm"],
        respuestaCorrecta: 1 // 20 cm
    },
    // Deportes (Más específico) (133-137)
    {
        pregunta: "En tenis, si el marcador está 40-40, se dice que es...",
        opciones: ["Punto de partido", "Deuce (Iguales)", "Ventaja"],
        respuestaCorrecta: 1 // Deuce (Iguales)
    },
    {
        pregunta: "¿Qué país es famoso por inventar el Judo?",
        opciones: ["China", "Japón", "Corea"],
        respuestaCorrecta: 1 // Japón
    },
    {
        pregunta: "¿Cuántos hoyos tiene un recorrido estándar de golf?",
        opciones: ["9", "18", "27"],
        respuestaCorrecta: 1 // 18
    },
    {
        pregunta: "¿Qué significan las siglas 'NBA' en baloncesto?",
        opciones: ["National Ball Association", "National Basketball Association", "New Basketball Aspirants"],
        respuestaCorrecta: 1 // National Basketball Association
    },
    {
        pregunta: "El 'maillot amarillo' en el Tour de Francia lo lleva...",
        opciones: ["El ciclista más joven", "El líder de la clasificación general", "El ganador de la etapa anterior"],
        respuestaCorrecta: 1 // El líder de la clasificación general
    },
    // Miscelánea y Curiosidades (Más específico) (138-150)
    {
        pregunta: "¿Qué es la 'Vía Láctea'?",
        opciones: ["Una marca de chocolate", "Nuestra galaxia", "Una carretera espacial"],
        respuestaCorrecta: 1 // Nuestra galaxia
    },
    {
        pregunta: "¿Qué significan las siglas 'CPU' en un ordenador?",
        opciones: ["Control Panel Unit", "Central Processing Unit", "Computer Power Unit"],
        respuestaCorrecta: 1 // Central Processing Unit
    },
    {
        pregunta: "¿Qué se mide con un termómetro?",
        opciones: ["La distancia", "La temperatura", "El peso"],
        respuestaCorrecta: 1 // La temperatura
    },
    {
        pregunta: "Un grupo de lobos se llama...",
        opciones: ["Rebaño", "Manada", "Piara"],
        respuestaCorrecta: 1 // Manada
    },
    {
        pregunta: "¿Cuál de estos NO es un instrumento de viento?",
        opciones: ["Flauta", "Trompeta", "Violonchelo"],
        respuestaCorrecta: 2 // Violonchelo
    },
    {
        pregunta: "¿Qué país regaló la Estatua de la Libertad a Estados Unidos?",
        opciones: ["Reino Unido", "Francia", "España"],
        respuestaCorrecta: 1 // Francia
    },
    {
        pregunta: "¿Qué significan las siglas 'SOS' en código Morse?",
        opciones: ["Save Our Ship (Salven nuestro barco)", "Es una señal de auxilio internacional", "Save Our Souls (Salven nuestras almas)"],
        respuestaCorrecta: 1 // Es una señal de auxilio internacional
    },
    {
        pregunta: "¿Cuántos colores tiene el arcoíris tradicionalmente?",
        opciones: ["Cinco", "Siete", "Nueve"],
        respuestaCorrecta: 1 // Siete
    },
    {
        pregunta: "¿Qué es un 'lustro'?",
        opciones: ["Un periodo de 10 años", "Un periodo de 5 años", "Un objeto brillante"],
        respuestaCorrecta: 1 // Un periodo de 5 años
    },
    {
        pregunta: "¿De qué personaje de ficción es la frase 'Elemental, mi querido Watson'?",
        opciones: ["Hercules Poirot", "Sherlock Holmes", "Batman"],
        respuestaCorrecta: 1 // Sherlock Holmes
    },
    {
       pregunta: "¿A qué temperatura en grados Celsius se congela el agua?",
       opciones: ["100 grados", "0 grados", "-10 grados"],
       respuestaCorrecta: 1 // 0 grados
    },
    {
       pregunta: "La parte roja dentro de nuestra sangre que transporta oxígeno se llama:",
       opciones: ["Plasma", "Glóbulos rojos (Hemoglobina)", "Glóbulos blancos"],
       respuestaCorrecta: 1 // Glóbulos rojos
    },
    {
       pregunta: "¿Qué es un 'delta' en geografía?",
       opciones: ["Una letra griega", "La desembocadura de un río con forma de triángulo", "Una montaña muy alta"],
       respuestaCorrecta: 1 // Desembocadura de río
    },
    // ... (tus 150 preguntas anteriores aquí) ...
// Asegúrate de que la última pregunta anterior tenga una coma al final

// --- Bloque de Preguntas Verdadero/Falso ---
    {
        pregunta: "El Sol es una estrella.",
        tipo: 'vf', // Indica que es Verdadero/Falso
        respuestaCorrecta: true
    },
    {
        pregunta: "Los pingüinos pueden volar.",
        tipo: 'vf',
        respuestaCorrecta: false
    },
    {
        pregunta: "El agua hierve a 100 grados Celsius al nivel del mar.",
        tipo: 'vf',
        respuestaCorrecta: true
    },
    {
        pregunta: "Los tiburones son mamíferos.",
        tipo: 'vf',
        respuestaCorrecta: false // Son peces cartilaginosos
    },
    {
        pregunta: "La capital de España es Barcelona.",
        tipo: 'vf',
        respuestaCorrecta: false // Es Madrid
    },
    {
        pregunta: "Los humanos tenemos 5 sentidos principales.",
        tipo: 'vf',
        respuestaCorrecta: true
    },
    {
        pregunta: "El río Amazonas es más largo que el Nilo.",
        tipo: 'vf',
        respuestaCorrecta: true // Según mediciones más recientes
    },
    {
        pregunta: "Los plátanos crecen en árboles.",
        tipo: 'vf',
        respuestaCorrecta: false // Crecen en plantas herbáceas gigantes
    },
    {
        pregunta: "Júpiter es el planeta más grande de nuestro Sistema Solar.",
        tipo: 'vf',
        respuestaCorrecta: true
    },
    {
        pregunta: "Los murciélagos son ciegos.",
        tipo: 'vf',
        respuestaCorrecta: false // Usan ecolocalización, pero no son ciegos
    },
    {
        pregunta: "La Gran Muralla China se puede ver desde la Luna.",
        tipo: 'vf',
        respuestaCorrecta: false // Es un mito popular
    },
    {
        pregunta: "El corazón humano tiene cuatro cámaras.",
        tipo: 'vf',
        respuestaCorrecta: true
    },
    {
        pregunta: "Los dinosaurios se extinguieron por un meteorito.",
        tipo: 'vf',
        respuestaCorrecta: true // Es la teoría más aceptada
    },
    {
        pregunta: "El desierto del Sahara está en América del Sur.",
        tipo: 'vf',
        respuestaCorrecta: false // Está en África
    },
    {
        pregunta: "Las arañas son insectos.",
        tipo: 'vf',
        respuestaCorrecta: false // Son arácnidos (8 patas)
    }
    // Puedes añadir más preguntas V/F aquí

]; // Fin del array preguntasQuiz


