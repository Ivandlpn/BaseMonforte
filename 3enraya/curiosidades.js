// --- START OF FILE curiosidades.js ---

const curiosidadesDivertidas = [
    {
        texto: "Los pulpos tienen ¡tres corazones! y su sangre es de color azul. 🐙💙",
        categoria: "Ciencia / Animales"
    },
    {
        texto: "¿Sabías que las jirafas no tienen cuerdas vocales? ¡Son casi mudas! 🦒🤫",
        categoria: "Ciencia / Animales"
    },
    {
        texto: "El primer programador de computadoras fue una mujer llamada Ada Lovelace, ¡hace casi 200 años! 👩‍💻🕰️",
        categoria: "Tecnología / Historia"
    },
    {
        texto: "En Júpiter y Saturno, ¡llueven diamantes! 💎🪐",
        categoria: "Ciencia / Espacio"
    },
    {
        texto: "La palabra 'reconocer' se lee igual de izquierda a derecha que de derecha a izquierda. ¡Es un palíndromo! ✨",
        categoria: "Lengua"
    },
    {
        texto: "El país más pequeño del mundo es la Ciudad del Vaticano, ¡es más pequeño que algunos parques! 🇻🇦",
        categoria: "Geografía"
    },
    {
        texto: "Las hormigas pueden levantar ¡50 veces su propio peso! Son súper fuertes. 💪🐜",
        categoria: "Ciencia / Animales"
    },
    {
        texto: "Hay un pueblo en Noruega que se llama 'A'. ¡Solo una letra! 🇳🇴🅰️",
        categoria: "Geografía / Lengua"
    },
    {
        texto: "Los teléfonos móviles actuales son ¡millones de veces más potentes! que los ordenadores que llevaron al hombre a la Luna. 📱🚀",
        categoria: "Tecnología"
    },
    {
        texto: "El desierto del Sahara es tan grande como ¡casi todo Estados Unidos! 🏜️🇺🇸",
        categoria: "Geografía"
    },
    {
        texto: "La palabra 'murciélago' tiene las cinco vocales ¡y sin repetir ninguna! 🦇AEIOU",
        categoria: "Lengua"
    },
    {
        texto: "La Catedral de Málaga es conocida como 'la manquita' porque quedó inacabada y carece de la torre sur.",
        categoria: "Arquitectura / Historia"
    },
    {
        texto: "En Málaga, hay diferentes formas específicas de pedir un café, como 'solo', 'largo', 'sombra' o 'nube'.",
        categoria: "Gastronomía / Idioma"
    },
    {
        texto: "El Puente de los Alemanes fue construido por Alemania como agradecimiento por la ayuda de los malagueños en el naufragio de la fragata SMS Gneisenau en 1900.",
        categoria: "Historia"
    },
    {
        texto: "Málaga cuenta con 10 estrellas Michelin repartidas en 7 restaurantes.",
        categoria: "Gastronomía"
    },
    {
        texto: "Málaga disfruta de más de 300 días de sol al año.",
        categoria: "Geografía / Clima"
    },
    {
        texto: "En Málaga hay más de 45 bodegas y 265 denominaciones de origen para los amantes del vino.",
        categoria: "Gastronomía"
    },
    {
        texto: "El centro histórico de Málaga tiene una alta densidad de museos, ¡más de 30!",
        categoria: "Cultura"
    },
    {
        texto: "Algunos platos típicos de la gastronomía malagueña son los espetos, los boquerones fritos, el gazpachuelo o el ajoblanco.",
        categoria: "Gastronomía"
    },
    {
        texto: "El Pasaje de Chinitas es una calle famosa donde se ubicaba un café-cabaret-teatro que aparece en una obra de Federico García Lorca.",
        categoria: "Cultura / Literatura"
    },
    {
        texto: "Existen palabras y expresiones malagueñas como 'esmallao' (hambriento), 'alobao' (atontado) o 'boquerón' (malagueño).",
        categoria: "Idioma"
    },
    {
        texto: "Málaga es una de las ciudades más antiguas del mundo, con asentamientos que datan del siglo VIII a.C.",
        categoria: "Historia"
    },
    {
        texto: "Pablo Picasso nació en Málaga.",
        categoria: "Personajes Ilustres / Arte"
    },
    {
        texto: "La Alcazaba de Málaga es un castillo y palacio árabe del siglo XI.",
        categoria: "Arquitectura / Historia"
    },
    {
        texto: "Málaga es famosa por su vino dulce 'Málaga Dulce', elaborado con uvas Moscatel.",
        categoria: "Gastronomía"
    },
    {
        texto: "La Catedral de Málaga fue construida en el siglo XVI sobre el emplazamiento de una mezquita.",
        categoria: "Arquitectura / Historia"
    },
    {
        texto: "La Feria de Agosto es una de las mayores fiestas de España y se celebra en Málaga.",
        categoria: "Cultura / Tradiciones"
    },
    {
        texto: "El centro histórico de Málaga es un laberinto de calles estrechas con cafés, bares y tiendas.",
        categoria: "Arquitectura"
    },
    {
        texto: "La cocina malagueña es una fusión de sabores tradicionales españoles y especias árabes.",
        categoria: "Gastronomía"
    },
    {
        texto: "El Teatro Romano de Málaga es uno de los más antiguos y mejor conservados de España.",
        categoria: "Arquitectura / Historia"
    },
    {
        texto: "Málaga alberga varios festivales importantes, incluyendo la procesión de Semana Santa.",
        categoria: "Cultura / Tradiciones"
    },
    {
        texto: "Málaga es famosa por su arte callejero con murales y grafitis.",
        categoria: "Arte / Cultura"
    },
    {
        texto: "El Muelle Uno fue un antiguo puerto pesquero reconvertido en complejo comercial y de ocio.",
        categoria: "Arquitectura / Historia"
    },
    {
        texto: "Málaga es un destino popular para los golfistas con campos de nivel de campeonato.",
        categoria: "Deporte"
    },
    {
        texto: "El Castillo de Gibralfaro es un castillo árabe del siglo XIV en Málaga.",
        categoria: "Arquitectura / Historia"
    },
    {
        texto: "El Cementerio Inglés de Málaga es el primer cementerio protestante de España.",
        categoria: "Historia"
    },
    {
        texto: "Durante la Semana Santa, la Cofradía de Jesús El Rico tiene el privilegio de liberar a un preso.",
        categoria: "Tradiciones / Historia"
    },
    {
        texto: "El Festival de Cine Español de Málaga entrega el premio 'Biznaga de Oro'.",
        categoria: "Cultura / Cine"
    },
    {
        texto: "En Málaga se han descubierto dos mezquitas funerarias de época almohade, únicas en el mundo.",
        categoria: "Arquitectura / Historia / Religión"
    },
    {
        texto: "El antiguo apodo de un edificio cerca de la Alcazaba, donde se descubrió el Teatro Romano, fue 'la casa de la incultura'.",
        categoria: "Historia / Curiosidades"
    },
    {
        texto: "Tras una gran inundación en 1907, varios alemanes afincados en Málaga promovieron la reconstrucción de un puente con donaciones de Alemania, conocido como el Puente de los Alemanes.",
        categoria: "Historia"
    },
    {
        texto: "La 'loca' es un pastel típico de Málaga que surgió en la posguerra como dulce quitahambres.",
        categoria: "Gastronomía / Historia"
    },
    {
        texto: "El metro de Málaga tiene relojes que marcan 59 segundos al estilo de los antiguos relojes de ferrocarril británicos.",
        categoria: "Tecnología / Curiosidades"
    },
    {
        texto: "En varios lugares de Málaga, como la Librería Proteo o el MIMA, se pueden encontrar restos de la antigua muralla de la ciudad de la época de Al-Andalus.",
        categoria: "Historia / Arquitectura"
    },
    {
        texto: "Dentro del Aparcamiento Plaza de la Marina se hallan ruinas del Castillo de los Genoveses, construido en época nazarí.",
        categoria: "Historia / Arquitectura"
    },
    {
        texto: "En el sótano de la cafetería del Hotel Tribuna se pueden observar restos de la muralla y la barbacana.",
        categoria: "Historia / Arquitectura"
    },
    {
        texto: "El Cementerio Inglés fue construido en 1821 y es el primer cementerio protestante de España.",
        categoria: "Historia"
    },
    {
        texto: "Cada año, Málaga conmemora el Día de la Independencia de Estados Unidos el 4 de julio, recordando la ayuda de Bernardo de Gálvez.",
        categoria: "Historia / Tradiciones"
    },
    {
        texto: "El escritor danés Hans Christian Andersen se enamoró de Málaga y escribió sobre ella en su libro 'Viaje a España'. Una estatua en su honor se encuentra junto a la calle Larios.",
        categoria: "Personajes Ilustres / Literatura"
    },
    {
        texto: "La Iglesia-Santuario de Nuestra Señora de la Victoria ocupa el lugar del campamento de las tropas de los Reyes Católicos durante la conquista de Málaga en 1487.",
        categoria: "Historia / Religión"
    },
    {
        texto: "El faro de Málaga se llama 'La Farola' y es considerado el único faro femenino de la Península Ibérica.",
        categoria: "Arquitectura / Curiosidades"
    },
    {
        texto: "La taberna más antigua de Málaga es la Antigua Casa de Guardia, abierta desde 1840.",
        categoria: "Gastronomía / Historia"
    },
    {
        texto: "El bar restaurante El Pimpi es uno de los lugares más emblemáticos de Málaga, con una historia que incluye ser un convento y una sala de fiestas.",
        categoria: "Historia / Cultura"
    },
    {
        texto: "El nombre 'El Pimpi' proviene de los jóvenes que ayudaban a los marineros y viajeros que llegaban al puerto de Málaga.",
        categoria: "Historia / Costumbres"
    },
    {
        texto: "La Calle Marqués de Larios es la calle más famosa de Málaga, inaugurada en 1891 e inspirada en la arquitectura de Chicago.",
        categoria: "Arquitectura / Historia"
    },
    {
        texto: "La Calle Larios fue apodada 'el Salón de Baile' por sus aceras de madera en su origen.",
        categoria: "Historia / Curiosidades"
    },
    {
        texto: "La calle Larios figura en el Libro Guinness de los Récords desde 2018 por reunir a miles de personas bailando flamenco.",
        categoria: "Cultura / Curiosidades"
    },
    {
        texto: "En fachadas de casas antiguas de Málaga han aparecido pinturas restauradas del siglo XVIII, que estuvieron ocultas bajo capas de cal.",
        categoria: "Arte / Historia"
    },
    {
        texto: "El arte callejero es visible en distritos como Lagunillas y el Soho de Málaga.",
        categoria: "Arte / Cultura"
    },
    {
        texto: "Málaga es la única capital que tiene grandes hallazgos de las tres principales culturas: judía, árabe y romana.",
        categoria: "Historia / Cultura"
    },
    {
        texto: "En la Plaza de la Constitución de Málaga están grabadas en el suelo las portadas de los principales periódicos con la noticia de la aprobación de la Constitución de 1978.",
        categoria: "Historia / Curiosidades"
    },
    {
        texto: "La biznaga es un símbolo de Málaga, un ramillete de jazmines con el tallo seco.",
        categoria: "Cultura / Tradiciones"
    },
    {
        texto: "A los malagueños se les llama 'boquerones' por la importancia del boquerón frito en su gastronomía.",
        categoria: "Gastronomía / Idioma"
    },
    {
        texto: "El escudo de armas de Málaga fue otorgado por los Reyes Católicos y contiene las iniciales 'TM' que significan 'Tanto Monta'.",
        categoria: "Historia / Símbolos"
    },
    {
        texto: "Durante la Guerra Civil, la huida de miles de malagueños hacia Almería se conoce como 'La Desbandá', una masacre en la carretera de Almería.",
        categoria: "Historia"
    },
    {
        texto: "La Farola de Málaga es uno de los dos únicos faros en España con género femenino.",
        categoria: "Arquitectura / Curiosidades"
    },
    {
        texto: "La forma de pedir café en Málaga es una seña de identidad del malagueño, con denominaciones únicas para las proporciones de café y leche.",
        categoria: "Gastronomía / Idioma"
    },
    {
        texto: "Los espetos de sardina son un manjar y una seña de identidad cultural de Málaga.",
        categoria: "Gastronomía / Cultura"
    },
    {
        texto: "En Málaga se encuentra el Museo Pompidou, la primera sede fuera de Francia del museo parisino.",
        categoria: "Cultura / Arte"
    },
    {
        texto: "La Feria de Málaga se celebra en verano para conmemorar la incorporación de la ciudad a la Corona de Castilla en 1487.",
        categoria: "Historia / Tradiciones"
    },
    {
        texto: "Málaga cuenta con un viento cálido muy común en verano llamado 'terral'.",
        categoria: "Geografía / Clima"
    },
    {
        texto: "Los Verdiales son el cante malagueño más antiguo, un tipo particular de fandango cantado y bailado.",
        categoria: "Cultura / Música / Tradiciones"
    },
    {
        texto: "Durante la Revolución Industrial, Málaga fue una de las regiones españolas más avanzadas, destacando en la fundición y llegando a ser la primera ciudad industrial de la Península Ibérica.",
        categoria: "Historia / Economía"
    },
    {
        texto: "Puerto Banús fue inaugurado con la presencia de numerosas personalidades internacionales.",
        categoria: "Historia / Curiosidades"
    }
];

// --- END OF FILE curiosidades.js ---
