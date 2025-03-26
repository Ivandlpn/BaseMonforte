document.addEventListener('DOMContentLoaded', () => {
    const trainNumberInput = document.getElementById('trainNumberInput');
    const submitButton = document.getElementById('submitButton');
    const resultArea = document.getElementById('resultArea');
    const operatorLogo = document.getElementById('operatorLogo');
    const trainInfo = document.getElementById('trainInfo');
    const routeInfoSpan = document.getElementById('routeInfo');
    const serviceTypeP = document.getElementById('serviceType'); // Para AVE/Avant
    // Spans de operatorName y funFact eliminados
    const errorMessageDiv = document.getElementById('errorMessage');

    const exploreMoreButton = document.getElementById('exploreMoreButton');
    const rangeInfoSection = document.getElementById('rangeInfoSection');
    const closeRangeInfoButton = document.getElementById('closeRangeInfoButton');

    // --- Lógica Principal ---
    submitButton.addEventListener('click', findTrainInfo);
    trainNumberInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            findTrainInfo();
        }
    });

    function findTrainInfo() {
        const trainNumberStr = trainNumberInput.value.trim();
        hideError();
        hideResult();

        if (!/^\d{5}$/.test(trainNumberStr)) {
            showError("¡Ups! El número debe tener exactamente 5 dígitos.");
            return;
        }

        const trainNumber = parseInt(trainNumberStr, 10);
        let service = ""; // "AVE", "Avant", "Iryo", "Ouigo"
        let route = "Ruta no identificada";
        let logo = "";
        let bgColorClass = "";
        let operatorDisplay = ""; // Texto a mostrar para Renfe (AVE/Avant) o el operador

        // --- Lógica de Rangos Consolidada ---
        // Priorizar rangos más específicos primero

        // RENFE AVE Corto
        if (trainNumber >= 40 && trainNumber <= 99) {
            service = "AVE";
            operatorDisplay = "Renfe AVE";
            logo = "img/ave-logo.png"; // Usaremos el logo AVE para ambos Renfe
            bgColorClass = "info-box--ave";
            route = "Probable ruta corta en Andalucía (Ej: Málaga ↔ Córdoba)";
        }
        // RENFE AVANT (08xxx)
        else if (trainNumber >= 8000 && trainNumber <= 8999) {
            service = "Avant";
            operatorDisplay = "Renfe Avant";
            logo = "img/ave-logo.png"; // Logo Renfe genérico o AVE
            bgColorClass = "info-box--avant"; // Clase distinta si quieres otro color, si no, usa --ave
            // Intentar deducir ruta basado en sub-rangos o paridad si es útil
            if ([8172, 8312, 8072, 8102, 8192, 8212, 8082, 8292, 8322, 8182].includes(trainNumber)) route = "Probablemente Madrid → Toledo";
            else if ([8183, 8273, 8173, 8133, 8153, 8103, 8213, 8283].includes(trainNumber)) route = "Probablemente Toledo → Madrid";
            else if ([8178, 8208, 8058, 8068, 8078, 8278, 8158, 8118, 8168, 8198].includes(trainNumber)) route = "Probablemente Valladolid → Madrid";
            else if ([8219, 8069, 8079, 8189, 8199, 8209, 8389, 8109, 8179, 8159, 8169].includes(trainNumber)) route = "Probablemente Madrid → Valladolid";
            else if ([8190, 8130, 8170, 8180, 8220].includes(trainNumber)) route = "Probablemente Madrid → Puertollano";
            else if ([8191, 8111, 8101, 8161, 8081].includes(trainNumber)) route = "Probablemente Puertollano → Madrid";
            else if ([8195, 8085, 8175, 8075, 8125].includes(trainNumber)) route = "Probablemente Sevilla → Málaga";
            else if ([8745, 8785, 8665, 8765, 8695, 8705].includes(trainNumber)) route = "Probablemente Málaga → Sevilla";
            else if ([8275, 8295, 8335, 8395].includes(trainNumber)) route = "Probablemente Sevilla → Granada";
            else if ([8475, 8505, 8525].includes(trainNumber)) route = "Probablemente Granada → Sevilla";
            else if ([8815, 8855, 8835].includes(trainNumber)) route = "Probablemente Málaga → Granada";
            else if ([8915, 8955].includes(trainNumber)) route = "Probablemente Granada → Málaga";
            else if ([8497, 8377, 8287, 8297].includes(trainNumber)) route = "Probablemente Barcelona → Figueres";
            else if ([8396, 8316].includes(trainNumber)) route = "Probablemente Figueres → Barcelona";
            else if ([8087, 8207, 8187].includes(trainNumber)) route = "Probablemente Lleida → Barcelona";
            else if ([8206, 8186].includes(trainNumber)) route = "Probablemente Barcelona → Lleida";
            else route = "Ruta Avant (Media Distancia AV)";
        }
         // RENFE AVANT (090xx-093xx)
        else if (trainNumber >= 9000 && trainNumber <= 9399) {
             service = "Avant";
             operatorDisplay = "Renfe Avant";
             logo = "img/ave-logo.png";
             bgColorClass = "info-box--avant";
             if ([9215, 9125, 9195, 9175, 9155].includes(trainNumber)) route = "Probablemente Alicante → Murcia";
             else if ([9127, 9197, 9167, 9157, 9107, 9217].includes(trainNumber)) route = "Probablemente Murcia → Alicante";
             else if (trainNumber === 9374) route = "Probablemente Madrid → Albacete"; // Ejemplo específico
             else route = "Ruta Avant (Media Distancia AV) - Eje Este/Sur";
        }
        // RENFE AVANT (33xxx)
        else if (trainNumber >= 33000 && trainNumber <= 33999) {
            service = "Avant";
            operatorDisplay = "Renfe Avant";
            logo = "img/ave-logo.png";
            bgColorClass = "info-box--avant";
            if (trainNumber === 33654) route = "Probablemente Córdoba → Sevilla";
            else if (trainNumber === 33869) route = "Probablemente Camp de Tarragona → Barcelona";
            else if (trainNumber === 33968) route = "Probablemente Barcelona → Camp de Tarragona";
            else route = "Ruta Avant especial (Media Distancia AV)";
        }
        // RENFE AVE Andalucía
        else if (trainNumber >= 2000 && trainNumber <= 2999) {
            service = "AVE";
            operatorDisplay = "Renfe AVE";
            logo = "img/ave-logo.png";
            bgColorClass = "info-box--ave";
            route = (trainNumber % 2 === 0) ? "Probable: Madrid → Andalucía" : "Probable: Andalucía → Madrid";
        }
        // RENFE AVE Noreste
        else if (trainNumber >= 3000 && trainNumber <= 3999) {
            service = "AVE";
            operatorDisplay = "Renfe AVE";
            logo = "img/ave-logo.png";
            bgColorClass = "info-box--ave";
            route = (trainNumber % 2 === 0) ? "Probable: Noreste → Madrid/Sur" : "Probable: Madrid/Sur → Noreste";
        }
        // RENFE AVE Levante/Noroeste
        else if (trainNumber >= 5000 && trainNumber <= 5999) {
            service = "AVE";
            operatorDisplay = "Renfe AVE";
            logo = "img/ave-logo.png";
            bgColorClass = "info-box--ave";
            if (trainNumber >= 5000 && trainNumber <= 5499) route = "Probable: Madrid ↔ Levante";
            else route = "Probable: Madrid ↔ Noroeste";
        }
        // IRYO
        else if (trainNumber >= 6000 && trainNumber <= 6299) {
            service = "Iryo";
            operatorDisplay = "Iryo"; // Nombre corto
            logo = "img/iryo-logo.png";
            bgColorClass = "info-box--iryo";
            // Rutas Iryo no siguen patrón numérico claro aún
            route = "Ruta de Iryo (Ej: Madrid ↔ BCN/VLC/SVQ)";
        }
        // OUIGO
        else if (trainNumber >= 6400 && trainNumber <= 6999) {
            service = "Ouigo";
            operatorDisplay = "Ouigo"; // Nombre corto
            logo = "img/ouigo-logo.png";
            bgColorClass = "info-box--ouigo";
            // Rutas Ouigo no siguen patrón numérico claro aún
             route = "Ruta de Ouigo (Ej: Madrid ↔ BCN/VLC/ALC/SVQ/VLL)";
        }
        // RENFE AVE Especiales/Internacionales
        else if (trainNumber >= 9700 && trainNumber <= 11368) {
            service = "AVE";
            operatorDisplay = "Renfe AVE (Especial/Int.)";
            logo = "img/ave-logo.png";
            bgColorClass = "info-box--ave";
            route = "Ruta especial o internacional (Ej: Hacia Francia)";
        }
        // Número no reconocido
        else {
            showError("¡Ups! Ese número no coincide con un tren conocido. ¡Prueba otro!");
            return;
        }

        // --- Mostrar Resultados Simplificados ---
        serviceTypeP.textContent = operatorDisplay; // Muestra "Renfe AVE", "Renfe Avant", "Iryo", "Ouigo"
        routeInfoSpan.textContent = route;
        operatorLogo.src = logo;
        operatorLogo.alt = `Logo de ${service}`; // Alt text simple

        trainInfo.className = 'info-box'; // Resetear clases
        void trainInfo.offsetWidth; // Forzar reflow
        trainInfo.classList.add(bgColorClass);

        operatorLogo.style.animation = 'none';
        operatorLogo.offsetHeight; /* trigger reflow */
        operatorLogo.style.animation = 'bounceIn 0.6s ease-out';

        resultArea.style.display = 'flex';
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
        operatorLogo.src = "";
        routeInfoSpan.textContent = "";
        serviceTypeP.textContent = ""; // Limpiar también el tipo de servicio
    }

    // --- Funcionalidad Extra (sin cambios) ---
    exploreMoreButton.addEventListener('click', () => {
        rangeInfoSection.style.display = 'block';
        rangeInfoSection.scrollIntoView({ behavior: 'smooth' });
    });

    closeRangeInfoButton.addEventListener('click', () => {
        rangeInfoSection.style.display = 'none';
    });

});
