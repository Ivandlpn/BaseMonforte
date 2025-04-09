document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a Elementos del DOM ---
    const portfolioBody = document.getElementById('portfolio-body');
    const portfolioTable = document.getElementById('portfolio-table');
    const tableContainer = document.querySelector('#portfolio div[style*="overflow-x: auto"]');
    const noDataMsg = document.querySelector('#portfolio .no-data-message');
    const totalValueEl = document.getElementById('total-value');
    const estimatedYieldEl = document.getElementById('estimated-yield');

    // --- Estado de la Aplicación ---
    let portfolio = []; // Se llenará desde cartera.json

    // --- Funciones Auxiliares ---

    /**
     * Formatea un número o devuelve '-'.
     */
    const formatNumber = (num, decimals = 2) => {
        const number = parseFloat(num);
        if (num === null || num === undefined || isNaN(number)) {
            return '-';
        }
        return number.toFixed(decimals);
    };

     /**
     * Devuelve el símbolo de la moneda.
     */
     function currencySymbol(currencyCode) {
        switch (currencyCode?.toUpperCase()) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'CAD': return 'C$';
            case 'NOK': return 'kr';
            default: return currencyCode || '';
        }
    }


    /**
     * Actualiza la sección de resumen (placeholders).
     */
    function updateSummary() {
        // TODO: Calcular cuando tengamos datos de API
        let currentTotalValue = 0;
        let estimatedAnnualDividend = 0;

        totalValueEl.textContent = formatNumber(currentTotalValue) + ' €'; // Ajustar moneda base si es necesario
        estimatedYieldEl.textContent = formatNumber(estimatedAnnualDividend) + ' €';
    }

    /**
     * Renderiza la tabla del portfolio en el HTML.
     */
    function renderPortfolio() {
        portfolioBody.innerHTML = ''; // Limpiar tabla anterior

        if (!portfolio || portfolio.length === 0) {
            if (tableContainer) tableContainer.style.display = 'none';
            if (noDataMsg) noDataMsg.style.display = 'block';
        } else {
            if (tableContainer) tableContainer.style.display = 'block';
            if (noDataMsg) noDataMsg.style.display = 'none';

            portfolio.forEach((stock) => { // No necesitamos el índice ahora
                const row = portfolioBody.insertRow();

                const name = stock.name || '-';
                const ticker = stock.ticker?.toUpperCase() || '-';
                const country = stock.country || '-';
                const currency = stock.currency || '-';
                const shares = parseFloat(stock.shares) || 0;
                const purchasePrice = parseFloat(stock.purchasePrice) || 0;
                const clubPrice = parseFloat(stock.clubPrice) ?? null;
                const costBase = (shares && purchasePrice) ? (shares * purchasePrice) : null;
                const displayCurrency = currencySymbol(currency);

                // Se eliminó la última celda (<td>) que contenía los botones
                row.innerHTML = `
                    <td>${name}</td>
                    <td>${ticker}</td>
                    <td>${country}</td>
                    <td>${currency}</td>
                    <td style="text-align: right;">${formatNumber(shares, 0)}</td>
                    <td style="text-align: right;">${formatNumber(purchasePrice)} ${displayCurrency}</td>
                    <td style="text-align: right;">${formatNumber(costBase)} ${displayCurrency}</td>
                    <td style="text-align: right;">${formatNumber(clubPrice)} ${displayCurrency}</td>
                    <td style="text-align: right;" class="current-value" data-ticker="${ticker}">Cargando...</td>
                    <td style="text-align: right;" class="dividend-per-share" data-ticker="${ticker}">-</td>
                    <td class="ex-dividend-date" data-ticker="${ticker}">-</td>
                `;
            });

             // TODO: Llamar a función para buscar datos de API después de renderizar
             // fetchApiDataForPortfolio();
        }
        updateSummary(); // Actualizar resumen
    }

    // --- FUNCIONES DE GUARDAR, EDITAR, ELIMINAR ELIMINADAS ---

    // --- Inicialización ---

    /**
     * Carga los datos iniciales del portfolio SIEMPRE desde cartera.json.
     */
    async function loadInitialData() {
        try {
            console.log("Intentando cargar portfolio desde cartera.json...");
            const response = await fetch('cartera.json'); // Siempre lee de aquí
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
            const jsonData = await response.json();
            if (!Array.isArray(jsonData)) {
               throw new Error("El archivo cartera.json no contiene un array válido.");
            }
            portfolio = jsonData; // Asigna los datos cargados
            console.log("Portfolio cargado correctamente desde cartera.json.");

        } catch (error) {
            console.error("Error al cargar o procesar cartera.json:", error);
            portfolio = []; // Asegura que el portfolio esté vacío en caso de error
            if (noDataMsg) {
                // Muestra el error en el mensaje de "no hay datos"
                noDataMsg.textContent = `Error al cargar cartera.json: ${error.message}. Verifica el archivo y la consola.`;
                noDataMsg.style.display = 'block'; // Asegura que sea visible
            }
             if (tableContainer) tableContainer.style.display = 'none'; // Oculta la tabla si hay error
        } finally {
             // Renderiza el portfolio (vacío o con datos) después del intento de carga
             renderPortfolio();
        }
    }

    // --- Ejecución Inicial ---
    loadInitialData(); // Cargar datos al iniciar

});
