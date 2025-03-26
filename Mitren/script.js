document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const trainNumberInput = document.getElementById('trainNumberInput');
    const submitButton = document.getElementById('submitButton');
    const resultArea = document.getElementById('resultArea');
    const operatorLogo = document.getElementById('operatorLogo');
    const trainInfo = document.getElementById('trainInfo');
    const routeInfoSpan = document.getElementById('routeInfo');
    const serviceTypeP = document.getElementById('serviceType'); // Shows Operator + Speed Type
    const errorMessageDiv = document.getElementById('errorMessage');
    const exploreMoreButton = document.getElementById('exploreMoreButton');
    const rangeInfoSection = document.getElementById('rangeInfoSection');
    const closeRangeInfoButton = document.getElementById('closeRangeInfoButton');

    // --- Event Listeners ---
    submitButton.addEventListener('click', findTrainInfo);
    trainNumberInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            findTrainInfo();
        }
    });
    exploreMoreButton.addEventListener('click', () => {
        rangeInfoSection.style.display = 'block';
        rangeInfoSection.scrollIntoView({ behavior: 'smooth' });
    });
    closeRangeInfoButton.addEventListener('click', () => {
        rangeInfoSection.style.display = 'none';
    });

    // --- Core Logic Function ---
    function findTrainInfo() {
        const trainNumberStr = trainNumberInput.value.trim();
        hideError();
        hideResult();

        // --- Input Validation ---
        if (!/^\d{5}$/.test(trainNumberStr)) {
            showError("¡Ups! El número debe tener exactamente 5 dígitos.");
            return;
        }
        const trainNumber = parseInt(trainNumberStr, 10);

        // --- Variable Initialization ---
        let service = "";           // Base type: "AVE", "Avant", "Iryo", "Ouigo"
        let route = "Ruta desconocida"; // Default route
        let logo = "";              // Logo path
        let bgColorClass = "";      // CSS class for background
        let operatorDisplay = "";   // Final text for service type display

        // --- Detailed Range Logic (Prioritized by Specificity) ---

        // 1. Renfe AVE Transversal/Short (000xx)
        if (trainNumber >= 40 && trainNumber <= 99) {
            service = "AVE";
            operatorDisplay = "Renfe AVE (Alta Velocidad)";
            logo = "img/ave-logo.png";
            bgColorClass = "info-box--ave";
            if (trainNumber >= 90) { // 0009x
                route = "Probable ruta corta Sur (Ej: Málaga ↔ Córdoba)";
            } else { // 0004x - 0008x
                 if ([40, 41, 42, 43, 50, 51].includes(trainNumber)) route = "Probable ruta transversal (Ej: BCN ↔ SVQ/GRN)";
                 else if ([81, 83].includes(trainNumber)) route = "Probable ruta transversal (Ej: SVQ ↔ VLC)";
                 else route = "Probable ruta transversal AVE";
            }
        }
        // 2. Renfe Avant - Main Range (08xxx)
        else if (trainNumber >= 8000 && trainNumber <= 8999) {
            service = "Avant";
            operatorDisplay = "Renfe Avant (Media Distancia AV)";
            logo = "img/ave-logo.png";
            bgColorClass = "info-box--avant";
            // Specific Avant routes based on Vxx Nucleos/examples
            if (trainNumber >= 8000 && trainNumber <= 8049 || // V00: Madrid-Toledo examples
                trainNumber >= 8100 && trainNumber <= 8149 ||
                trainNumber >= 8170 && trainNumber <= 8179 || // More Madrid-Toledo
                trainNumber >= 8182 && trainNumber <= 8183 ||
                trainNumber >= 8192 && trainNumber <= 8193 ||
                [8062, 8072, 8073, 8082, 8093, 8102, 8103, 8123, 8132, 8133, 8142, 8152, 8153, 8162, 8163, 8172, 8173, 8203, 8212, 8213, 8273, 8283, 8292, 8312, 8322].includes(trainNumber)) {
                 route = (trainNumber % 2 === 0) ? "Probable: Madrid → Toledo (MD AV)" : "Probable: Toledo → Madrid (MD AV)";
            } else if (trainNumber >= 8050 && trainNumber <= 8099 || // V06: Madrid-Valladolid examples
                       trainNumber >= 8109 && trainNumber <= 8118 ||
                       trainNumber >= 8129 && trainNumber <= 8169 || // More Madrid-Valladolid
                       trainNumber >= 8178 && trainNumber <= 8179 ||
                       trainNumber >= 8189 && trainNumber <= 8219 ||
                       [8058, 8068, 8069, 8078, 8079, 8088, 8098, 8139, 8148, 8158, 8159, 8168, 8169, 8198, 8199, 8208, 8209, 8278, 8359, 8389].includes(trainNumber)) {
                route = (trainNumber % 2 === 0) ? "Probable: Valladolid → Madrid (MD AV)" : "Probable: Madrid → Valladolid (MD AV)";
            } else if (trainNumber >= 8100 && trainNumber <= 8101 || // V02: Madrid-Puertollano examples
                       trainNumber >= 8110 && trainNumber <= 8111 ||
                       trainNumber >= 8130 && trainNumber <= 8131 ||
                       trainNumber >= 8140 && trainNumber <= 8141 ||
                       trainNumber >= 8150 && trainNumber <= 8151 ||
                       trainNumber >= 8160 && trainNumber <= 8161 ||
                       trainNumber >= 8170 && trainNumber <= 8171 ||
                       trainNumber >= 8180 && trainNumber <= 8181 ||
                       trainNumber >= 8190 && trainNumber <= 8191 ||
                       [8080, 8081, 8200, 8211, 8220, 8471].includes(trainNumber)) {
                 route = (trainNumber % 2 === 0) ? "Probable: Madrid → Puertollano (MD AV)" : "Probable: Puertollano → Madrid (MD AV)";
            } else if (trainNumber >= 8075 && trainNumber <= 8075 || // V04: Andalucia examples
                       trainNumber >= 8085 && trainNumber <= 8085 ||
                       trainNumber >= 8125 && trainNumber <= 8125 ||
                       trainNumber >= 8155 && trainNumber <= 8155 ||
                       trainNumber >= 8175 && trainNumber <= 8175 ||
                       trainNumber >= 8195 && trainNumber <= 8195 ||
                       trainNumber >= 8215 && trainNumber <= 8215 || // Sevilla-Cordoba
                       trainNumber >= 8275 && trainNumber <= 8275 ||
                       trainNumber >= 8295 && trainNumber <= 8295 ||
                       trainNumber >= 8335 && trainNumber <= 8335 ||
                       trainNumber >= 8395 && trainNumber <= 8395 ||
                       trainNumber >= 8475 && trainNumber <= 8475 || // Granada-Sevilla
                       trainNumber >= 8505 && trainNumber <= 8505 ||
                       trainNumber >= 8525 && trainNumber <= 8525 ||
                       trainNumber >= 8575 && trainNumber <= 8575 ||
                       trainNumber >= 8654 && trainNumber <= 8654 || // Cordoba-Sevilla
                       trainNumber >= 8665 && trainNumber <= 8665 || // Malaga-Sevilla
                       trainNumber >= 8695 && trainNumber <= 8695 ||
                       trainNumber >= 8705 && trainNumber <= 8705 ||
                       trainNumber >= 8745 && trainNumber <= 8745 ||
                       trainNumber >= 8765 && trainNumber <= 8765 ||
                       trainNumber >= 8785 && trainNumber <= 8785 ||
                       trainNumber >= 8815 && trainNumber <= 8815 || // Malaga-Granada
                       trainNumber >= 8835 && trainNumber <= 8835 ||
                       trainNumber >= 8855 && trainNumber <= 8855 ||
                       trainNumber >= 8915 && trainNumber <= 8915 || // Granada-Malaga
                       trainNumber >= 8935 && trainNumber <= 8935 ||
                       trainNumber >= 8955 && trainNumber <= 8955) {
                 route = "Probable ruta Avant Andalucía (MD AV)"; // Specific routes too complex for simple summary
            } else if (trainNumber >= 8077 && trainNumber <= 8077 || // V08: Catalunya examples
                       trainNumber >= 8087 && trainNumber <= 8087 ||
                       trainNumber >= 8166 && trainNumber <= 8166 ||
                       trainNumber >= 8186 && trainNumber <= 8187 ||
                       trainNumber >= 8206 && trainNumber <= 8207 ||
                       trainNumber >= 8216 && trainNumber <= 8216 ||
                       trainNumber >= 8287 && trainNumber <= 8287 || // BCN-FIG
                       trainNumber >= 8297 && trainNumber <= 8297 ||
                       trainNumber >= 8316 && trainNumber <= 8316 || // FIG-BCN
                       trainNumber >= 8377 && trainNumber <= 8377 ||
                       trainNumber >= 8396 && trainNumber <= 8396 ||
                       trainNumber >= 8497 && trainNumber <= 8497 ) {
                 route = "Probable ruta Avant Cataluña (MD AV)"; // E.g., BCN ↔ Lleida/TGN/Figueres
            }
            else { route = "Ruta Avant (Media Distancia AV)"; } // Generic fallback
        }
        // 3. Renfe Avant - East/South (090xx-093xx)
        else if (trainNumber >= 9000 && trainNumber <= 9399) {
            service = "Avant";
            operatorDisplay = "Renfe Avant (Media Distancia AV)";
            logo = "img/ave-logo.png";
            bgColorClass = "info-box--avant";
            if (trainNumber >= 9000 && trainNumber <= 9299) { // V14: Alicante-Murcia examples
                route = (trainNumber % 2 !== 0) ? "Probable: Murcia → Alicante (MD AV)" : "Probable: Alicante → Murcia (MD AV)";
            } else if (trainNumber === 9374 || trainNumber === 33374 ) { // Madrid-Albacete examples
                 route = "Probable: Madrid ↔ Albacete (MD AV)";
            } else { route = "Ruta Avant Este/Sur (Media Distancia AV)"; }
        }
        // 4. Renfe Avant - Specific/Less Common (33xxx)
        else if (trainNumber >= 33000 && trainNumber <= 33999) {
             service = "Avant";
             operatorDisplay = "Renfe Avant (Media Distancia AV)";
             logo = "img/ave-logo.png";
             bgColorClass = "info-box--avant";
             if ([33063, 33271].includes(trainNumber)) route = "Probable: Toledo → Madrid (MD AV)";
             else if ([33292].includes(trainNumber)) route = "Probable: Madrid → Toledo (MD AV)";
             else if ([33260, 33200].includes(trainNumber)) route = "Probable: Madrid → Puertollano (MD AV)";
             else if ([33271].includes(trainNumber)) route = "Probable: Puertollano → Madrid (MD AV)";
             else if ([33654].includes(trainNumber)) route = "Probable: Córdoba → Sevilla (MD AV)";
             else if ([33155].includes(trainNumber)) route = "Probable: Sevilla → Málaga (MD AV)";
             else if ([33745].includes(trainNumber)) route = "Probable: Málaga → Sevilla (MD AV)";
             else if ([33084].includes(trainNumber)) route = "Probable: Antequera → Málaga (MD AV)";
             else if ([33275].includes(trainNumber)) route = "Probable: Sevilla → Granada (MD AV)";
             else if ([34075, 34475].includes(trainNumber)) route = "Probable: Granada → Sevilla (MD AV)"; // Incluye 34xxx aquí
             else if ([33158, 33088, 33198].includes(trainNumber)) route = "Probable: Valladolid → Madrid (MD AV)";
             else if ([33869].includes(trainNumber)) route = "Probable: Camp Tarragona → Barcelona (MD AV)";
             else if ([33968].includes(trainNumber)) route = "Probable: Barcelona → Camp Tarragona (MD AV)";
             else if ([33067].includes(trainNumber)) route = "Probable: Murcia → Alicante (MD AV)"; // Levante
             else { route = "Ruta Avant Específica (Media Distancia AV)"; }
        }
         // 5. Renfe Avant - Specific South/East (34xxx) - Parcialmente cubierta en 33xxx
        else if (trainNumber >= 34000 && trainNumber <= 34999) {
            service = "Avant";
            operatorDisplay = "Renfe Avant (Media Distancia AV)";
            logo = "img/ave-logo.png";
            bgColorClass = "info-box--avant";
             if ([34075, 34475].includes(trainNumber)) route = "Probable: Granada → Sevilla (MD AV)";
             else if ([34085].includes(trainNumber)) route = "Probable: Alicante → Murcia (MD AV)";
             else route = "Ruta Avant Específica Sur/Este (MD AV)";
        }
        // 6. Renfe AVE South Radial (02xxx)
        else if (trainNumber >= 2000 && trainNumber <= 2999) {
            service = "AVE";
            operatorDisplay = "Renfe AVE (Alta Velocidad)";
            logo = "img/ave-logo.png";
            bgColorClass = "info-box--ave";
            if ([2692, 2783].includes(trainNumber)) route = "Probable ruta transversal (BCN ↔ AGP)";
            else if ([2711, 2761].includes(trainNumber)) route = "Probable ruta transversal (HUE ↔ SVQ)";
            else route = (trainNumber % 2 === 0) ? "Probable: Madrid → Andalucía (AV)" : "Probable: Andalucía → Madrid (AV)";
        }
        // 7. Renfe AVE Northeast Radial/Intra (03xxx)
        else if (trainNumber >= 3000 && trainNumber <= 3999) {
            service = "AVE";
            operatorDisplay = "Renfe AVE (Alta Velocidad)";
            logo = "img/ave-logo.png";
            bgColorClass = "info-box--ave";
            if ([3381, 3385, 3387, 3389, 10111].includes(trainNumber)) route = "Probable: Barcelona → Figueres (AV)";
            else if ([3290, 3292, 3380, 3382, 10114].includes(trainNumber)) route = "Probable: Figueres → Barcelona (AV)";
            else if ([3793].includes(trainNumber)) route = "Probable: Madrid → Huesca (AV)";
            else if ([2711, 3883, 10711].includes(trainNumber)) route = "Probable: Huesca → Madrid/Sur (AV)"; // Incluye transversales
            else if ([3166, 3186, 3206, 3216].includes(trainNumber)) route = "Probable: Barcelona → Lleida (AV)"; // Podrían ser Avant camuflados?
            else if ([3077, 3087, 3187, 3207].includes(trainNumber)) route = "Probable: Lleida → Barcelona (AV)"; // Podrían ser Avant camuflados?
            else route = (trainNumber % 2 !== 0) ? "Probable: Madrid → Noreste (AV)" : "Probable: Noreste → Madrid (AV)";
        }
        // 8. Renfe AVE/Alvia Northwest Radial (04xxx)
        else if (trainNumber >= 4000 && trainNumber <= 4999) {
            service = "AVE"; // Simplificamos a AVE por ahora
            operatorDisplay = "Renfe (Alta Velocidad Noroeste)"; // Genérico
            logo = "img/ave-logo.png";
            bgColorClass = "info-box--ave";
            route = (trainNumber % 2 !== 0) ? "Probable: Madrid → Noroeste (AV)" : "Probable: Noroeste → Madrid (AV)";
        }
        // 9. Renfe AVE/Alvia East/NW/Transversal (05xxx)
        else if (trainNumber >= 5000 && trainNumber <= 5999) {
            service = "AVE"; // Simplificamos
            operatorDisplay = "Renfe (Alta Velocidad Este/Norte/Transv.)";
            logo = "img/ave-logo.png";
            bgColorClass = "info-box--ave";
             if ([5183, 5273, 5383].includes(trainNumber)) route = "Probable ruta transversal (Levante ↔ Noroeste)";
             else if ([5101, 5170, 5200, 5210, 5312].includes(trainNumber)) route = "Probable ruta transversal (Levante ↔ Norte)";
             else if ([5280, 5371, 5792, 5763].includes(trainNumber)) route = "Probable ruta transversal (Levante ↔ Burgos/Norte)";
             else if (trainNumber >= 5000 && trainNumber <= 5499 || [5668, 5742, 5817, 5843, 5863, 5903, 5912, 5913, 5962].includes(trainNumber)) route = "Probable: Madrid ↔ Levante (AV)"; // Incluye Murcia
             else route = "Probable: Madrid ↔ Norte/Noroeste (AV)"; // Resto más probable Noroeste/Norte
        }
        // 10. Iryo (06000-06399)
        else if (trainNumber >= 6000 && trainNumber <= 6399 || trainNumber == 6400) { // Incluye el 6400 visto
            service = "Iryo";
            operatorDisplay = "Iryo (Alta Velocidad)";
            logo = "img/iryo-logo.png";
            bgColorClass = "info-box--iryo";
            if ([6010, 6012, 6014, 6066, 6078, 6086, 6106, 6107, 6118, 6119, 6127, 6136, 6147, 6148, 6159, 6168, 6177, 6189, 6196, 6208, 6209, 6217].includes(trainNumber)) route = "Ruta Iryo Eje Sur (AV)";
            else if ([6062, 6063, 6074, 6082, 6102, 6103, 6122, 6123, 6125, 6142, 6143, 6154, 6162, 6163, 6164, 6182, 6183, 6195, 6202, 6203, 6205, 6223].includes(trainNumber)) route = "Ruta Iryo Eje Este (AV)";
            else route = "Ruta Iryo Eje Noreste o Transversal (AV)"; // El resto
        }
        // 11. Ouigo (06400-06999) - Excluyendo el 6400 si Iryo lo reclama
        else if (trainNumber > 6400 && trainNumber <= 6999) {
             service = "Ouigo";
             operatorDisplay = "Ouigo (Alta Velocidad)";
             logo = "img/ouigo-logo.png";
             bgColorClass = "info-box--ouigo";
             if ([6472, 6473, 6503, 6512, 6532, 6553, 6572, 6573, 6602, 6603].includes(trainNumber)) route = "Ruta Ouigo Eje Este (VLC) (AV)";
             else if ([6484, 6485, 6504, 6535, 6544, 6545, 6564, 6584, 6585, 6604, 6615, 6815].includes(trainNumber)) route = "Ruta Ouigo Eje Este (ALC/MUR) (AV)";
             else if ([6875, 6912, 6924, 6943, 6944, 6904, 6985].includes(trainNumber)) route = "Ruta Ouigo Eje Norte/Este (VLL ↔ Levante) (AV)";
             else route = "Ruta Ouigo Eje Noreste (BCN) (AV)"; // El resto, mayoritario
        }
        // 12. Renfe/Ouigo International/Special (097xx)
        else if (trainNumber >= 9700 && trainNumber <= 9799) {
            if ([9709, 9710, 9712, 9714, 9716, 9732].includes(trainNumber)) { // Ouigo Internacionales BCN-Frontera
                 service = "Ouigo";
                 operatorDisplay = "Ouigo (Internacional AV)";
                 logo = "img/ouigo-logo.png";
                 bgColorClass = "info-box--ouigo";
                 route = "Probable: Barcelona ↔ Frontera Francia (AV)";
            } else { // Renfe Internacionales/Especiales
                service = "AVE";
                operatorDisplay = "Renfe AVE (Internacional/Especial AV)";
                logo = "img/ave-logo.png";
                bgColorClass = "info-box--ave";
                route = "Probable: Madrid/BCN ↔ Frontera Francia (AV)";
            }
        }
        // 13. Special/Reinforcement Range (1xxxx)
        else if (trainNumber >= 10000 && trainNumber <= 11999) { // Ampliado ligeramente
            // Podría ser AVE, Avant, o incluso Iryo (visto 11xxx L77)
            if ([10041, 10044, 10052, 10143, 10391].includes(trainNumber)) { service = "AVE"; operatorDisplay = "Renfe AVE (Especial Noreste AV)"; logo = "img/ave-logo.png"; bgColorClass = "info-box--ave"; route = "Servicio especial AVE Noreste"; }
            else if ([10070, 10081, 10123, 10193, 10216, 10311, 10367, 11181, 11193].includes(trainNumber)) { service = "AVE"; operatorDisplay = "Renfe AVE (Especial Sur AV)"; logo = "img/ave-logo.png"; bgColorClass = "info-box--ave"; route = "Servicio especial AVE Sur"; }
            else if ([10061, 10063, 10064, 10102, 10140, 10153, 10181, 10280].includes(trainNumber)) { service = "AVE/Avant"; operatorDisplay = "Renfe (Especial Este/Norte AV)"; logo = "img/ave-logo.png"; bgColorClass = "info-box--ave"; route = "Servicio especial Renfe Este/Norte"; }
            else if ([10711, 10761].includes(trainNumber)) { service = "AVE"; operatorDisplay = "Renfe AVE (Transversal HUE-SVQ)"; logo = "img/ave-logo.png"; bgColorClass = "info-box--ave"; route = "Probable: Huesca ↔ Sevilla (AV)"; }
             else if ([11814, 11836, 11866, 11890, 11893].includes(trainNumber)) { // L77 -> Iryo Sur?
                 service = "Iryo";
                 operatorDisplay = "Iryo (Especial Sur AV?)";
                 logo = "img/iryo-logo.png";
                 bgColorClass = "info-box--iryo";
                 route = "Servicio especial Iryo Eje Sur (?)";
             }
            else { // Default para 1xxxx
                 service = "Especial";
                 operatorDisplay = "Tren Especial/Refuerzo";
                 logo = "img/ave-logo.png"; // Logo Renfe por defecto
                 bgColorClass = "info-box--ave";
                 route = "Ruta especial o de refuerzo";
             }
        }
         // 14. Iryo Special? (38xxx)
        else if (trainNumber >= 38000 && trainNumber <= 38999) {
             service = "Iryo"; // Asumido por códigos L77/L75
             operatorDisplay = "Iryo (Especial AV)";
             logo = "img/iryo-logo.png";
             bgColorClass = "info-box--iryo";
             if ([38066, 38136, 38138, 38178, 38201].includes(trainNumber)) route = "Servicio especial Iryo Eje Sur";
             else if ([38860, 38011].includes(trainNumber)) route = "Servicio especial Iryo Eje Noreste";
             else route = "Servicio especial Iryo";
        }

        // --- No Match Found ---
        else {
            showError("¡Ups! Ese número no coincide con un tren conocido en nuestra base de datos. ¡Prueba otro!");
            return;
        }

        // --- Display Results ---
        serviceTypeP.textContent = operatorDisplay;
        routeInfoSpan.textContent = route;
        operatorLogo.src = logo;
        operatorLogo.alt = `Logo de ${service}`; // Alt text reflects base service

        trainInfo.className = 'info-box'; // Reset classes
        void trainInfo.offsetWidth;       // Force reflow to restart animation
        trainInfo.classList.add(bgColorClass);

        operatorLogo.style.animation = 'none';
        operatorLogo.offsetHeight; // Trigger reflow
        operatorLogo.style.animation = 'bounceIn 0.6s ease-out';

        resultArea.style.display = 'flex';
    }

    // --- Helper Functions ---
    function showError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }

    function hideError() {
        errorMessageDiv.style.display = 'none';
    }

    function hideResult() {
        resultArea.style.display = 'none';
        // Clear previous results
        operatorLogo.src = "";
        operatorLogo.alt = "";
        routeInfoSpan.textContent = "";
        serviceTypeP.textContent = "";
    }
});
