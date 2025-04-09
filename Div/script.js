document.addEventListener('DOMContentLoaded', () => {
    const portfolioTableBody = document.getElementById('portfolio-table-body');
    const totalValueElement = document.getElementById('total-value');
    const totalBaseCostElement = document.getElementById('total-base-cost');
    const totalUnrealizedGainElement = document.getElementById('total-unrealized-gain');
    const totalDividendElement = document.getElementById('total-dividend');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessageElement = document.getElementById('error-message');
    const summarySection = document.getElementById('summary-section');
    const portfolioSection = document.getElementById('portfolio-section');
    const portfolioTable = document.getElementById('portfolio-table');

    let portfolioData = []; // Almacenará los datos procesados
    let currentSort = { column: null, direction: 'asc' };

    // --- Helper: Formato de Moneda ---
    // Nota: Esto formatea en la moneda original. Sumar totales mixtos requiere tipos de cambio.
    const formatCurrency = (value, currencyCode, maximumFractionDigits = 2) => {
        if (value === null || value === undefined || isNaN(value)) {
            return '<span class="na-value">-</span>';
        }
        try {
            return new Intl.NumberFormat(undefined, { // Usa el locale del navegador
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: maximumFractionDigits,
            }).format(value);
        } catch (error) {
            // Si el código de moneda no es válido, formatea como número normal
            console.warn(`Invalid currency code: ${currencyCode}. Formatting as number.`);
            return `${formatNumber(value)} <span class="na-value">${currencyCode || ''}</span>`;
        }
    };

    // --- Helper: Formato de Número ---
    const formatNumber = (value, maximumFractionDigits = 2) => {
        if (value === null || value === undefined || isNaN(value)) {
            return '<span class="na-value">-</span>';
        }
        return new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: maximumFractionDigits,
        }).format(value);
    };

    // --- Helper: Formato de Porcentaje con Color ---
    const formatPercentageGainLoss = (gainLossPercent) => {
         if (gainLossPercent === null || gainLossPercent === undefined || isNaN(gainLossPercent)) {
            return '<span class="na-value">-</span>';
        }
        const formattedPercent = `${gainLossPercent.toFixed(2)}%`;
        let className = 'neutral';
        if (gainLossPercent > 0.1) className = 'gain'; // Umbral pequeño para evitar verde en 0.01%
        if (gainLossPercent < -0.1) className = 'loss';

        return `<span class="${className}">${formattedPercent}</span>`;
    }

    // --- Procesar Datos del Portfolio (Añadir Cálculos) ---
    const processPortfolioData = (data) => {
        return data.map(stock => {
            const shares = stock.shares || 0;
            const purchasePrice = stock.purchasePrice; // Puede ser null
            const clubPrice = stock.clubPrice; // Puede ser null

            const costeBase = purchasePrice !== null ? shares * purchasePrice : null;
            const valorActualClub = clubPrice !== null ? shares * clubPrice : null;

            let gainLossPercent = null;
            if (costeBase !== null && costeBase !== 0 && valorActualClub !== null) {
                 gainLossPercent = ((valorActualClub - costeBase) / costeBase) * 100;
            }


            return {
                ...stock, // Copia todas las propiedades originales
                costeBase,
                valorActualClub,
                gainLossPercent
            };
        });
    };

    // --- Renderizar la Tabla del Portfolio ---
    const renderPortfolioTable = (dataToRender) => {
        portfolioTableBody.innerHTML = ''; // Limpiar tabla anterior

        if (!dataToRender || dataToRender.length === 0) {
            portfolioTableBody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding: 2rem;">No hay datos en el portfolio.</td></tr>';
            return;
        }

        dataToRender.forEach(stock => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stock.name}</td>
                <td>${stock.ticker}</td>
                <td>${stock.country}</td>
                <td>${stock.currency}</td>
                <td style="text-align: right;">${formatNumber(stock.shares, 0)}</td>
                <td style="text-align: right;">${formatCurrency(stock.purchasePrice, stock.currency)}</td>
                <td style="text-align: right;">${formatCurrency(stock.costeBase, stock.currency)}</td>
                <td style="text-align: right;">${formatCurrency(stock.clubPrice, stock.currency)}</td>
                <td style="text-align: right;">${formatCurrency(stock.valorActualClub, stock.currency)}</td>
                <td style="text-align: right;">${formatPercentageGainLoss(stock.gainLossPercent)}</td>
                <td class="na-value" style="text-align: center;">N/A</td>
                <td class="na-value" style="text-align: center;">N/A</td>
            `;
            portfolioTableBody.appendChild(row);
        });
    };

    // --- Calcular y Renderizar el Resumen ---
    const renderSummary = (processedData) => {
        // ¡IMPORTANTE! Estas sumas mezclan monedas. No son financieramente precisas sin conversión.
        let totalValue = 0;
        let totalCost = 0;
        let hasMixedCurrencies = false;
        let firstCurrency = null;

        processedData.forEach(stock => {
            if (stock.valorActualClub !== null) {
                totalValue += stock.valorActualClub;
            }
            if (stock.costeBase !== null) {
                totalCost += stock.costeBase;
            }
            // Comprobar si hay monedas mixtas
             if (firstCurrency === null && stock.currency) {
                firstCurrency = stock.currency;
            } else if (stock.currency && stock.currency !== firstCurrency) {
                hasMixedCurrencies = true;
            }
        });

        const totalGainLoss = totalValue - totalCost;

        // Mostrar N/A si no hay datos válidos para sumar
        totalValueElement.innerHTML = totalValue > 0 || processedData.some(s=> s.valorActualClub !== null) ? formatNumber(totalValue) : '<span class="na-value">--</span>';
        totalBaseCostElement.innerHTML = totalCost > 0 || processedData.some(s=> s.costeBase !== null) ? formatNumber(totalCost) : '<span class="na-value">--</span>';

        // Colorear Ganancia/Pérdida Total
        let gainLossClass = 'neutral';
         if (totalValue > 0 || totalCost > 0) { // Solo calcular si hay valores
            if (totalGainLoss > 0.1) gainLossClass = 'positive';
            if (totalGainLoss < -0.1) gainLossClass = 'negative';
             totalUnrealizedGainElement.innerHTML = formatNumber(totalGainLoss);
             totalUnrealizedGainElement.className = `summary-value ${gainLossClass}`;
         } else {
             totalUnrealizedGainElement.innerHTML = '<span class="na-value">--</span>';
             totalUnrealizedGainElement.className = 'summary-value'; // Reset class
         }


        // Añadir indicación de monedas mixtas si es necesario
        const currencyWarningElements = document.querySelectorAll('.summary-item small');
        currencyWarningElements.forEach(el => {
            if(el.textContent.includes("Monedas Mixtas")) {
                el.style.display = hasMixedCurrencies ? 'inline' : 'none';
            }
        });


        // Dividendo total sigue siendo N/A
        totalDividendElement.textContent = 'N/A';

        summarySection.style.display = 'block'; // Mostrar sección
    };

     // --- Lógica de Ordenación ---
     const sortData = (column, type = 'string') => {
        const direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';
        currentSort = { column, direction };

        portfolioData.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

             // Manejo de nulos o undefined: ponerlos al final
            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;

            if (type === 'number') {
                valA = Number(valA);
                valB = Number(valB);
                 if (isNaN(valA)) return 1; // NaN al final
                 if (isNaN(valB)) return -1; // NaN al final
            } else { // string (case-insensitive)
                valA = String(valA).toLowerCase();
                valB = String(valB).toLowerCase();
            }

            if (valA < valB) {
                return direction === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0; // Son iguales
        });

        renderPortfolioTable(portfolioData); // Re-renderizar con datos ordenados
        updateSortIndicators(); // Actualizar iconos de las cabeceras
    };

    // --- Actualizar Indicadores Visuales de Ordenación ---
    const updateSortIndicators = () => {
        portfolioTable.querySelectorAll('thead th[data-sortable="true"]').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            const icon = th.querySelector('i');
            icon.className = 'fas fa-sort'; // Reset icon

            if (th.dataset.column === currentSort.column) {
                th.classList.add(currentSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
                icon.className = currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            }
        });
    };

    // --- Añadir Event Listeners para Ordenación ---
    const addSortFunctionality = () => {
        portfolioTable.querySelectorAll('thead th[data-sortable="true"]').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.column;
                const type = th.dataset.type || 'string'; // Default a string si no se especifica data-type="number"
                sortData(column, type);
            });
        });
    };


    // --- Cargar Datos del Portfolio ---
    const loadPortfolioData = async () => {
        loadingIndicator.classList.add('active');
        errorMessageElement.classList.remove('active');
        summarySection.style.display = 'none';
        portfolioSection.style.display = 'none';

        try {
            const response = await fetch('cartera.json');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }
            const rawData = await response.json();

            if (!Array.isArray(rawData)) {
                 throw new Error("El archivo JSON no contiene un array válido.");
            }

            portfolioData = processPortfolioData(rawData); // Procesar y guardar
            renderPortfolioTable(portfolioData);
            renderSummary(portfolioData);

            addSortFunctionality(); // Añadir listeners de ordenación DESPUÉS de cargar datos

            portfolioSection.style.display = 'block'; // Mostrar tabla

        } catch (error) {
            console.error('Error al cargar o procesar el portfolio:', error);
            errorMessageElement.textContent = `No se pudieron cargar los datos del portfolio: ${error.message}. Asegúrate de que 'cartera.json' existe y es válido.`;
            errorMessageElement.classList.add('active');
        } finally {
            loadingIndicator.classList.remove('active'); // Ocultar indicador siempre
        }
    };

    // --- Inicializar la Aplicación ---
    loadPortfolioData();
});
