document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos DOM ---
    const portfolioTableBody = document.getElementById('portfolio-table-body');
    const totalMarketValueElement = document.getElementById('total-market-value'); // Cambiado
    const totalBaseCostElement = document.getElementById('total-base-cost');
    const totalUnrealizedGainElement = document.getElementById('total-unrealized-gain');
    const totalDividendElement = document.getElementById('total-dividend');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessageElement = document.getElementById('error-message');
    const priceStatusElement = document.getElementById('price-status'); // Nuevo
    const summarySection = document.getElementById('summary-section');
    const portfolioSection = document.getElementById('portfolio-section');
    const portfolioTable = document.getElementById('portfolio-table');

    // --- Configuración ---
    const API_KEY = 'TU_API_KEY_AQUI'; // <-- ¡¡¡ REEMPLAZA CON TU API KEY DE ALPHA VANTAGE !!!
    const API_DELAY_MS = 13000; // Retraso entre llamadas API (12-15 segundos para evitar límite de 5/min)

    // --- Estado ---
    let portfolioData = []; // Almacenará los datos combinados (JSON + API)
    let currentSort = { column: null, direction: 'asc' };
    let stocksToFetch = 0;
    let stocksFetched = 0;
    let stocksFailed = 0;


    // --- Helpers (formatCurrency, formatNumber, formatPercentageGainLoss sin cambios) ---
    const formatCurrency = (value, currencyCode, maximumFractionDigits = 2) => {
        if (value === null || value === undefined || isNaN(value)) {
            return '<span class="na-value">-</span>';
        }
        try {
            // Corregir códigos comunes si es necesario para Intl.NumberFormat
            let correctedCurrency = currencyCode?.toUpperCase();
             if (correctedCurrency === 'GBX') correctedCurrency = 'GBP'; // Ejemplo: si tuvieras peniques británicos

            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: correctedCurrency,
                minimumFractionDigits: 2,
                maximumFractionDigits: maximumFractionDigits,
            }).format(correctedCurrency === 'GBP' && currencyCode === 'GBX' ? value / 100 : value); // Ajuste para peniques
        } catch (error) {
            console.warn(`Invalid currency code for formatting: ${currencyCode}. Formatting as number.`);
            const numberPart = formatNumber(value, maximumFractionDigits);
             return `${numberPart} <span class="na-value">${currencyCode || ''}</span>`;
        }
    };

    const formatNumber = (value, maximumFractionDigits = 2) => {
        if (value === null || value === undefined || isNaN(value)) {
            return '<span class="na-value">-</span>';
        }
        return new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: maximumFractionDigits,
        }).format(value);
    };

     const formatPercentageGainLoss = (gainLossPercent) => {
         if (gainLossPercent === null || gainLossPercent === undefined || isNaN(gainLossPercent)) {
            return '<span class="na-value">-</span>';
        }
        const formattedPercent = `${gainLossPercent.toFixed(2)}%`;
        let className = 'neutral';
        if (gainLossPercent > 0.01) className = 'gain'; // Umbral pequeño
        if (gainLossPercent < -0.01) className = 'loss';

        return `<span class="${className}">${formattedPercent}</span>`;
    }

    // --- Helper: Delay ---
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // --- Actualizar Estado de Carga de Precios ---
     const updatePriceStatus = () => {
        if (stocksToFetch === 0) {
             priceStatusElement.style.display = 'none';
             return;
         }
        priceStatusElement.style.display = 'block';
        let statusText = `<i class="fas fa-sync fa-spin"></i> Obteniendo precios: ${stocksFetched} de ${stocksToFetch}`;
        if (stocksFailed > 0) {
             statusText += ` (${stocksFailed} fallidos)`;
         }
        if(stocksFetched + stocksFailed === stocksToFetch) {
            statusText = `<i class="fas fa-check-circle" style="color: var(--success-color);"></i> Precios actualizados: ${stocksFetched} correctos, ${stocksFailed} fallidos.`;
             // Ocultar después de un tiempo
             setTimeout(() => { priceStatusElement.style.display = 'none'; }, 5000);
        }
         priceStatusElement.innerHTML = statusText;
    };


    // --- Procesar Datos Iniciales del Portfolio (Solo del JSON) ---
    const processInitialPortfolioData = (data) => {
        return data.map(stock => {
            const shares = stock.shares || 0;
            const purchasePrice = stock.purchasePrice; // Puede ser null

            const costeBase = purchasePrice !== null ? shares * purchasePrice : null;

            // Inicializamos valores que vendrán de la API
            return {
                ...stock,
                costeBase,
                currentPrice: null, // Se llenará con la API
                valorActualMercado: null, // Se calculará después de la API
                gainLossMarketPercent: null, // Se calculará después de la API
                fetchStatus: 'pending', // 'pending', 'loading', 'success', 'error'
                errorMessage: null
            };
        });
    };

    // --- Renderizar la Tabla del Portfolio (con placeholders para API) ---
    const renderPortfolioTable = (dataToRender) => {
        portfolioTableBody.innerHTML = ''; // Limpiar tabla anterior

        if (!dataToRender || dataToRender.length === 0) {
            portfolioTableBody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding: 2rem;">No hay datos en el portfolio.</td></tr>';
            return;
        }

        dataToRender.forEach(stock => {
            const row = document.createElement('tr');
             // Añadir data-ticker para poder encontrar la fila fácilmente después
            row.dataset.ticker = stock.ticker;

            // Definir contenido inicial de celdas que se actualizarán
            let priceCellContent = `<span class="price-loading" title="Cargando precio..."><i class="fas fa-spinner"></i></span>`; // Placeholder inicial
            let valueCellContent = '<span class="na-value">-</span>';
            let gainLossCellContent = '<span class="na-value">-</span>';

            row.innerHTML = `
                <td>${stock.name}</td>
                <td>${stock.ticker}</td>
                <td>${stock.country}</td>
                <td>${stock.currency}</td>
                <td style="text-align: right;">${formatNumber(stock.shares, 0)}</td>
                <td style="text-align: right;">${formatCurrency(stock.purchasePrice, stock.currency)}</td>
                <td style="text-align: right;">${formatCurrency(stock.costeBase, stock.currency)}</td>
                <td style="text-align: right;" class="cell-current-price">${priceCellContent}</td>
                <td style="text-align: right;" class="cell-market-value">${valueCellContent}</td>
                <td style="text-align: right;" class="cell-market-gain-loss">${gainLossCellContent}</td>
                <td class="na-value" style="text-align: center;">N/A</td>
                <td class="na-value" style="text-align: center;">N/A</td>
            `;
            portfolioTableBody.appendChild(row);
        });
    };

     // --- Actualizar UNA Fila de la Tabla con Datos de la API ---
    const updateTableRowWithPrice = (stock) => {
        const row = portfolioTableBody.querySelector(`tr[data-ticker="${stock.ticker}"]`);
        if (!row) return; // Si la fila no existe

        const priceCell = row.querySelector('.cell-current-price');
        const valueCell = row.querySelector('.cell-market-value');
        const gainLossCell = row.querySelector('.cell-market-gain-loss');

        let priceCellContent = '';
        let valueCellContent = '<span class="na-value">-</span>';
        let gainLossCellContent = '<span class="na-value">-</span>';

        if (stock.fetchStatus === 'success') {
            priceCellContent = formatCurrency(stock.currentPrice, stock.currency);
            valueCellContent = formatCurrency(stock.valorActualMercado, stock.currency);
            gainLossCellContent = formatPercentageGainLoss(stock.gainLossMarketPercent);
        } else if (stock.fetchStatus === 'error') {
            priceCellContent = `<span class="price-error" title="${stock.errorMessage || 'Error desconocido'}">Error <i class="fas fa-exclamation-circle"></i></span>`;
        }
         // Si es 'loading' o 'pending', se queda el spinner o el placeholder inicial

        priceCell.innerHTML = priceCellContent;
        valueCell.innerHTML = valueCellContent;
        gainLossCell.innerHTML = gainLossCellContent;
    }

     // --- Calcular y Renderizar el Resumen (basado en datos actuales) ---
    const renderSummary = (currentPortfolioData) => {
        let totalMarketValue = 0;
        let totalCost = 0;
        let hasMixedCurrencies = false;
        let firstCurrency = null;

        currentPortfolioData.forEach(stock => {
            // Solo sumar si tenemos un valor de mercado válido
            if (stock.fetchStatus === 'success' && stock.valorActualMercado !== null) {
                totalMarketValue += stock.valorActualMercado;
                 // Comprobar moneda para el aviso
                if (firstCurrency === null && stock.currency) {
                     firstCurrency = stock.currency;
                 } else if (stock.currency && stock.currency !== firstCurrency) {
                     hasMixedCurrencies = true;
                 }
            }
             // El coste base no depende de la API
            if (stock.costeBase !== null) {
                totalCost += stock.costeBase;
                 // Comprobar moneda aquí también por si alguna acción no tiene precio de mercado
                 if (firstCurrency === null && stock.currency) {
                     firstCurrency = stock.currency;
                 } else if (stock.currency && stock.currency !== firstCurrency && !hasMixedCurrencies) {
                      // Solo marcar si no estaba ya marcada por los precios de mercado
                     hasMixedCurrencies = true;
                 }
            }
        });

        const totalGainLoss = totalMarketValue > 0 ? totalMarketValue - totalCost : 0; // Evitar G/P negativo si no hay valor

        // Formatear y mostrar, manejar caso de 0 o sin datos válidos
        totalMarketValueElement.innerHTML = totalMarketValue > 0 || currentPortfolioData.some(s => s.fetchStatus === 'success')
            ? formatNumber(totalMarketValue)
            : '<span class="na-value">--</span>';
        totalBaseCostElement.innerHTML = totalCost > 0 || currentPortfolioData.some(s => s.costeBase !== null)
            ? formatNumber(totalCost)
            : '<span class="na-value">--</span>';

         // Colorear Ganancia/Pérdida Total
        let gainLossClass = 'neutral';
         if (totalMarketValue > 0) { // Solo calcular si hay valor de mercado
            if (totalGainLoss > 0.01) gainLossClass = 'positive';
            if (totalGainLoss < -0.01) gainLossClass = 'negative';
             totalUnrealizedGainElement.innerHTML = formatNumber(totalGainLoss);
         } else {
             totalUnrealizedGainElement.innerHTML = '<span class="na-value">--</span>';
         }
         totalUnrealizedGainElement.className = `summary-value ${gainLossClass}`;


        // Añadir indicación de monedas mixtas si es necesario
        const currencyWarningElements = summarySection.querySelectorAll('.summary-item small');
         currencyWarningElements.forEach(el => {
            if(el.textContent.includes("Monedas Mixtas")) {
                el.style.display = hasMixedCurrencies ? 'inline' : 'none';
            }
        });

        // Dividendo total sigue siendo N/A
        totalDividendElement.textContent = 'N/A';

        summarySection.style.display = 'block'; // Asegurar que el resumen sea visible
    };


    // --- Obtener Precio de UNA Acción desde Alpha Vantage ---
    const fetchStockPrice = async (stock) => {
         if (!API_KEY || API_KEY === 'TU_API_KEY_AQUI') {
             stock.fetchStatus = 'error';
             stock.errorMessage = 'API Key no configurada.';
             console.error('Error: API Key de Alpha Vantage no configurada en script.js');
             stocksFailed++;
             return stock; // Devolver estado de error
         }

        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.ticker}&apikey=${API_KEY}`;
        stock.fetchStatus = 'loading';
        // No actualizamos la fila aquí todavía, esperamos al resultado

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data = await response.json();

            // Verificar si la API devolvió un error o nota (ej. límite alcanzado)
            if (data['Error Message'] || data['Note']) {
                const errorMessage = data['Error Message'] || data['Note'];
                 // Si es por límite de API, el mensaje suele incluir "call frequency"
                 if (errorMessage.includes('call frequency')) {
                     console.warn(`Límite de API alcanzado para ${stock.ticker}. Reintentando más tarde podría funcionar.`);
                     stock.errorMessage = 'Límite API alcanzado.';
                 } else {
                     console.error(`Error API para ${stock.ticker}: ${errorMessage}`);
                     stock.errorMessage = `API: ${errorMessage}`;
                 }
                 throw new Error(stock.errorMessage);
            }

            const quote = data['Global Quote'];
            if (quote && quote['05. price']) {
                const price = parseFloat(quote['05. price']);
                if (!isNaN(price)) {
                    stock.currentPrice = price;
                    stock.valorActualMercado = stock.shares * price;

                     // Calcular G/P solo si hay coste base y es > 0
                    if (stock.costeBase !== null && stock.costeBase !== 0) {
                         stock.gainLossMarketPercent = ((stock.valorActualMercado - stock.costeBase) / stock.costeBase) * 100;
                     } else if (stock.costeBase === 0){
                         stock.gainLossMarketPercent = stock.valorActualMercado > 0 ? Infinity : 0; // Ganancia infinita si costó 0
                     } else {
                         stock.gainLossMarketPercent = null; // No se puede calcular si no hay coste
                     }

                    stock.fetchStatus = 'success';
                    stocksFetched++;
                } else {
                    throw new Error(`Precio inválido recibido: ${quote['05. price']}`);
                }
            } else {
                // Esto puede pasar si el ticker es válido pero no hay datos recientes
                // o si el ticker no existe en Alpha Vantage
                 console.warn(`No se encontró 'Global Quote' o '05. price' para ${stock.ticker}. ¿Ticker correcto?`);
                 throw new Error('No se encontraron datos de precio (Ticker inválido o sin datos).');
            }

        } catch (error) {
            console.error(`Fallo al obtener precio para ${stock.ticker}: ${error.message}`);
            stock.fetchStatus = 'error';
             // Guardar el mensaje de error específico si no se guardó ya uno más genérico
            if (!stock.errorMessage) {
                stock.errorMessage = error.message;
            }
            stocksFailed++;
        } finally {
             updateTableRowWithPrice(stock); // Actualizar la fila específica con el resultado (éxito o error)
             updatePriceStatus(); // Actualizar contador general
             renderSummary(portfolioData); // Recalcular y renderizar resumen con el nuevo dato
        }
        return stock; // Devolver el objeto stock actualizado
    };

    // --- Bucle para Obtener Todos los Precios con Retraso ---
    const fetchAllStockPrices = async (stocks) => {
        stocksToFetch = stocks.length;
        stocksFetched = 0;
        stocksFailed = 0;
        updatePriceStatus(); // Mostrar estado inicial

        for (const stock of stocks) {
             await fetchStockPrice(stock); // Espera a que se complete la llamada (incluido error)
             // Esperar antes de la *siguiente* llamada si quedan más acciones
            if (stocks.indexOf(stock) < stocks.length - 1) {
                await delay(API_DELAY_MS);
            }
        }
        console.log('Obtención de precios finalizada.');
         // El estado final se actualiza en el `finally` de la última llamada y el timeout lo oculta
    };

     // --- Lógica de Ordenación (Adaptada a nuevos campos) ---
     const sortData = (column, type = 'string') => {
        const direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';
        currentSort = { column, direction };

        portfolioData.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

            // Tratar status de fetch como sub-orden si ordenamos por precio/valor/gp
            // Podríamos hacer más complejo esto, pero por ahora, nulos/errores al final
            const numericColumns = ['shares', 'purchasePrice', 'costeBase', 'currentPrice', 'valorActualMercado', 'gainLossMarketPercent'];
            if (numericColumns.includes(column)) {
                 // Poner errores/pendientes al final al ordenar números
                 if (a.fetchStatus !== 'success' && column !== 'shares' && column !== 'purchasePrice' && column !== 'costeBase') valA = direction === 'asc' ? Infinity : -Infinity;
                 if (b.fetchStatus !== 'success' && column !== 'shares' && column !== 'purchasePrice' && column !== 'costeBase') valB = direction === 'asc' ? Infinity : -Infinity;
            }


             // Manejo de nulos o undefined estándar
            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;

            if (type === 'number') {
                valA = Number(valA);
                valB = Number(valB);
                 if (isNaN(valA)) return 1;
                 if (isNaN(valB)) return -1;
            } else {
                valA = String(valA).toLowerCase();
                valB = String(valB).toLowerCase();
            }

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        renderPortfolioTable(portfolioData); // Re-renderizar tabla ordenada
        // Re-aplicar estado visual de precios a las celdas después de re-renderizar
         portfolioData.forEach(stock => updateTableRowWithPrice(stock));
        updateSortIndicators();
    };

    // --- Actualizar Indicadores Visuales de Ordenación (sin cambios) ---
    const updateSortIndicators = () => {
        portfolioTable.querySelectorAll('thead th[data-sortable="true"]').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            const icon = th.querySelector('i');
            icon.className = 'fas fa-sort';

            if (th.dataset.column === currentSort.column) {
                th.classList.add(currentSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
                icon.className = currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            }
        });
    };

    // --- Añadir Event Listeners para Ordenación (sin cambios) ---
    const addSortFunctionality = () => {
        portfolioTable.querySelectorAll('thead th[data-sortable="true"]').forEach(th => {
             // Remover listener antiguo si existiera (para evitar duplicados en recargas)
             // th.removeEventListener('click', handleSortClick); // Necesitaríamos una función nombrada
             // Alternativa simple: Asumiendo que solo se llama una vez
            th.addEventListener('click', () => {
                const column = th.dataset.column;
                const type = th.dataset.type || 'string';
                sortData(column, type);
            });
        });
    };


    // --- Cargar Datos del Portfolio (Flujo principal) ---
    const loadPortfolioData = async () => {
        loadingIndicator.classList.add('active');
        errorMessageElement.classList.remove('active');
        summarySection.style.display = 'none';
        portfolioSection.style.display = 'none';
        priceStatusElement.style.display = 'none'; // Ocultar estado de precios

        try {
            // 1. Cargar datos locales
            const response = await fetch('cartera.json');
            if (!response.ok) throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            const rawData = await response.json();
            if (!Array.isArray(rawData)) throw new Error("cartera.json no es un array válido.");

            // 2. Procesar datos locales iniciales
            portfolioData = processInitialPortfolioData(rawData);

            // 3. Renderizar tabla inicial (con placeholders/spinners)
            renderPortfolioTable(portfolioData);

             // 4. Renderizar resumen inicial (basado solo en coste base por ahora)
             renderSummary(portfolioData);

            // 5. Añadir funcionalidad de ordenación
            addSortFunctionality();

            // 6. Mostrar secciones principales (tabla y resumen)
            portfolioSection.style.display = 'block';
             summarySection.style.display = 'block'; // Mostrar resumen aunque los valores de mercado falten


            // 7. Iniciar la obtención de precios de la API (en segundo plano)
             if (API_KEY && API_KEY !== 'TU_API_KEY_AQUI') {
                 fetchAllStockPrices(portfolioData); // No usar await aquí para no bloquear
             } else {
                 priceStatusElement.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: var(--accent-color);"></i> API Key no configurada. No se pueden obtener precios de mercado.';
                 priceStatusElement.style.display = 'block';
                 // Marcar todas como error de API Key
                 portfolioData.forEach(stock => {
                     stock.fetchStatus = 'error';
                     stock.errorMessage = 'API Key no configurada.';
                     updateTableRowWithPrice(stock);
                 });
                 renderSummary(portfolioData); // Actualizar resumen (mostrará -- en mercado)
             }


        } catch (error) {
            console.error('Error al cargar o procesar el portfolio:', error);
            errorMessageElement.textContent = `No se pudieron cargar los datos locales del portfolio: ${error.message}. Asegúrate de que 'cartera.json' existe y es válido.`;
            errorMessageElement.classList.add('active');
            portfolioSection.style.display = 'none'; // Ocultar si falla la carga inicial
            summarySection.style.display = 'none';
        } finally {
            loadingIndicator.classList.remove('active'); // Ocultar indicador principal siempre
        }
    };

    // --- Inicializar la Aplicación ---
    loadPortfolioData();
});
