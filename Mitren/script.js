document.addEventListener('DOMContentLoaded', () => {
    const trainNumberInput = document.getElementById('trainNumberInput');
    const submitButton = document.getElementById('submitButton');
    const resultArea = document.getElementById('resultArea');
    const operatorLogo = document.getElementById('operatorLogo');
    const trainInfo = document.getElementById('trainInfo');
    const operatorNameSpan = document.getElementById('operatorName');
    const routeInfoSpan = document.getElementById('routeInfo');
    const funFactSpan = document.getElementById('funFact');
    const errorMessageDiv = document.getElementById('errorMessage');
    const soundCheckbox = document.getElementById('soundCheckbox');
    const chooChooSound = document.getElementById('chooChooSound');

    const exploreMoreButton = document.getElementById('exploreMoreButton');
    const rangeInfoSection = document.getElementById('rangeInfoSection');
    const closeRangeInfoButton = document.getElementById('closeRangeInfoButton');

    // --- Lógica Principal ---
    submitButton.addEventListener('click', findTrainInfo);
    // Permitir presionar Enter en el input
    trainNumberInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            findTrainInfo();
        }
    });


    function findTrainInfo() {
        const trainNumberStr = trainNumberInput.value.trim();

        // Resetear estado
        hideError();
        hideResult();

        // Validación simple
        if (!/^\d{5}$/.test(trainNumberStr)) {
            showError("¡Ups! El número debe tener exactamente 5 dígitos.");
            return;
        }

        const trainNumber = parseInt(trainNumberStr, 10);
        let operator = null;
        let route = "Ruta desconocida (¡datos limitados!)";
        let funFact = "¡Los trenes de alta velocidad son súper rápidos!";
        let logo = "";
        let operatorCode = ""; // 'ave', 'iryo', 'ouigo'
        let bgColorClass = "";

        // --- Lógica de Rangos ---
        if (trainNumber >= 40 && trainNumber <= 99) { // AVE Cortas Sur
            operator = "AVE - Renfe";
            logo = "img/ave-logo.png";
            operatorCode = "ave";
            bgColorClass = "info-box--ave";
            route = "Probablemente una ruta corta en Andalucía (Ej: Málaga ↔ Córdoba)";
            funFact = "¡Estos trenes conectan ciudades andaluzas en un abrir y cerrar de ojos!";
        } else if (trainNumber >= 2000 && trainNumber <= 2999) { // AVE Andalucía
            operator = "AVE - Renfe";
            logo = "img/ave-logo.png";
            operatorCode = "ave";
            bgColorClass = "info-box--ave";
            if (trainNumber % 2 === 0) { // Par (generalmente Madrid -> Sur)
                route = "Probablemente Madrid → Andalucía (Sevilla, Málaga, Córdoba, Granada)";
            } else { // Impar (generalmente Sur -> Madrid)
                route = "Probablemente Andalucía (Sevilla, Málaga, Córdoba, Granada) → Madrid";
            }
            funFact = "¡El AVE a Sevilla fue la primera línea de alta velocidad en España (1992)!";
        } else if (trainNumber >= 3000 && trainNumber <= 3999) { // AVE Cataluña/Noreste
            operator = "AVE - Renfe";
            logo = "img/ave-logo.png";
            operatorCode = "ave";
            bgColorClass = "info-box--ave";
             if (trainNumber % 2 === 0) { // Par (generalmente Noreste -> Centro/Sur)
                route = "Probablemente Barcelona/Figueres → Madrid/Sur";
            } else { // Impar (generalmente Centro/Sur -> Noreste)
                route = "Probablemente Madrid/Sur → Barcelona/Figueres";
            }
            funFact = "¡Puedes llegar de Madrid a Barcelona en menos de 3 horas!";
        } else if (trainNumber >= 5000 && trainNumber <= 5999) { // AVE Levante/Noroeste
             operator = "AVE - Renfe";
             logo = "img/ave-logo.png";
             operatorCode = "ave";
             bgColorClass = "info-box--ave";
             // La distinción Levante/Noroeste en este rango es compleja, simplificamos
             if (trainNumber >= 5000 && trainNumber <= 5499) { // Más probable Levante
                 route = "Probablemente Madrid ↔ Levante (Valencia, Alicante)";
                 funFact = "¡Perfecto para una escapada a la playa en Valencia o Alicante!";
             } else { // Más probable Noroeste
                 route = "Probablemente Madrid ↔ Noroeste (Ourense, León, Valladolid)";
                 funFact = "¡Descubre la belleza del norte de España a toda velocidad!";
             }
        } else if (trainNumber >= 6000 && trainNumber <= 6299) { // IRYO
            operator = "TAV IRYO";
            logo = "img/iryo-logo.png";
            operatorCode = "iryo";
            bgColorClass = "info-box--iryo";
            // Iryo opera principalmente Madrid-Barcelona, Madrid-Valencia/Alicante, Madrid-Sevilla/Málaga
            // Los números no son tan direccionales como AVE
            if (trainNumberStr.startsWith('060')) route = "Probablemente conecta Madrid/Barcelona con Andalucía"; // Ej: 06014 BCN-SVQ
            else if (trainNumberStr.startsWith('061')) route = "Probablemente conecta Madrid con Levante (Valencia/Alicante)"; // Ej: 06122 MAD-VLC
            else route = "Probablemente una ruta de Iryo (Madrid ↔ Barcelona/Levante/Andalucía)";
            funFact = "¡Iryo trajo los modernos trenes 'Frecciarossa' (Flecha Roja) a España!";
        } else if (trainNumber >= 6400 && trainNumber <= 6999) { // OUIGO
            operator = "TAV OUIGO";
            logo = "img/ouigo-logo.png";
            operatorCode = "ouigo";
            bgColorClass = "info-box--ouigo";
             // Ouigo opera Madrid-Barcelona, Madrid-Valencia/Alicante, y Madrid-Andalucía
            if (trainNumberStr.startsWith('064') || trainNumberStr.startsWith('067')) route = "Probablemente conecta Madrid con Levante (Valencia/Alicante)"; // Ej: 06473 VLC-MAD
            else if (trainNumberStr.startsWith('065')) route = "Probablemente conecta Madrid con Cataluña (Barcelona)"; // Ej: 06540 BCN-MAD
            else if (trainNumberStr.startsWith('066') || trainNumberStr.startsWith('068')) route = "Probablemente conecta Madrid con Andalucía (Sevilla/Málaga)"; // Nueva info!
            else route = "Probablemente una ruta de Ouigo (Madrid ↔ Barcelona/Levante/Andalucía)";
            funFact = "¡Ouigo es conocido por sus trenes de dos pisos y precios bajos!";
        } else if (trainNumber >= 9700 && trainNumber <= 11368) { // AVE Especiales
             operator = "AVE - Renfe (Especial)";
             logo = "img/ave-logo.png";
             operatorCode = "ave";
             bgColorClass = "info-box--ave";
             route = "Podría ser una ruta internacional (ej. a Francia) o especial.";
             funFact = "¡Algunos trenes cruzan fronteras a alta velocidad!";
        }
         else {
            showError("¡Ups! Ese número no coincide con un tren de alta velocidad conocido. ¡Prueba otro!");
            return;
        }

        // --- Mostrar Resultados ---
        operatorNameSpan.textContent = operator;
        routeInfoSpan.textContent = route;
        funFactSpan.textContent = funFact;
        operatorLogo.src = logo;
        operatorLogo.alt = `Logo de ${operator}`;

        // Aplicar clase de color y asegurar que la animación se reinicie
        trainInfo.className = 'info-box'; // Resetear clases
        void trainInfo.offsetWidth; // Forzar reflow
        trainInfo.classList.add(bgColorClass);

        // Asegurar reinicio de animación del logo
         operatorLogo.style.animation = 'none';
         operatorLogo.offsetHeight; /* trigger reflow */
         operatorLogo.style.animation = null;
         operatorLogo.style.animation = 'bounceIn 0.6s ease-out';


        resultArea.style.display = 'flex'; // Mostrar área de resultados

        // Reproducir sonido si está activado
        if (soundCheckbox.checked) {
            chooChooSound.play().catch(e => console.log("Error al reproducir sonido:", e)); // Manejar posible error si el usuario no interactuó
        }
    }

    function showError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }

    function hideError() {
        errorMessageDiv.style.display = 'none';
    }

    function hideResult() {
        resultArea.style.display = 'none';
         // Limpiar datos anteriores por si acaso
        operatorLogo.src = "";
        operatorNameSpan.textContent = "";
        routeInfoSpan.textContent = "";
        funFactSpan.textContent = "";
    }

     // --- Funcionalidad Extra ---
    exploreMoreButton.addEventListener('click', () => {
        rangeInfoSection.style.display = 'block';
        // Opcional: Desplazar la vista hacia la sección
        rangeInfoSection.scrollIntoView({ behavior: 'smooth' });
    });

    closeRangeInfoButton.addEventListener('click', () => {
        rangeInfoSection.style.display = 'none';
    });


    // --- Manejo Inicial Sonido (Prevenir Autoplay no deseado) ---
    // Es buena práctica no reproducir sonido hasta que el usuario interactúe
    // La primera vez que se marque la casilla, intentar cargar el sonido.
    soundCheckbox.addEventListener('change', () => {
        if (soundCheckbox.checked) {
            // Intenta cargar el audio para que esté listo, necesario en algunos navegadores
             chooChooSound.load();
            console.log("Sonido activado. ¡Prepárate para el Choo-Choo!");
        } else {
            console.log("Sonido desactivado.");
        }
    });

});