document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a Elementos del DOM ---
    const addStockForm = document.getElementById('add-stock-form');
    const portfolioBody = document.getElementById('portfolio-body');
    const portfolioTable = document.getElementById('portfolio-table'); // Referencia a la tabla completa
    const tableContainer = document.querySelector('#portfolio div[style*="overflow-x: auto"]'); // Contenedor scrollable
    const noDataMsg = document.querySelector('#portfolio .no-data-message');
    const totalValueEl = document.getElementById('total-value');
    const estimatedYieldEl = document.getElementById('estimated-yield');

    // --- Estado de la Aplicación ---
    let portfolio = []; // El array que contendrá nuestros objetos de acciones

    // --- Funciones Auxiliares ---

    /**
     * Formatea un número a una cantidad de decimales o devuelve un guión.
     * @param {number | string | null | undefined} num El número a formatear.
     * @param {number} decimals Número de decimales (por defecto 2).
     * @returns {string} El número formateado o '-'.
     */
    const formatNumber = (num, decimals = 2) => {
        const number = parseFloat(num);
        if (num === null || num === undefined || isNaN(number)) {
            return '-';
        }
        // Puedes añadir .toLocaleString() aquí para formatos locales si lo necesitas
        return number.toFixed(decimals);
    };

    /**
     * Guarda el portfolio actual en localStorage.
     */
    function savePortfolio() {
        localStorage.setItem('dividendPortfolio', JSON.stringify(portfolio));
        console.log("Portfolio guardado en localStorage.");
    }

    /**
     * Actualiza la sección de resumen (valores placeholder por ahora).
     */
    function updateSummary() {
        // TODO: Calcular estos valores cuando tengamos datos de precios y dividendos
        let currentTotalValue = 0;
        let estimatedAnnualDividend = 0;

        // Ejemplo (necesitará datos reales de API más adelante):
        portfolio.forEach(stock => {
            // Placeholder - Necesitamos el precio actual y dividendo anual de la API
            // const currentValuePerShare = ... (de API)
            // const annualDividendPerShare = ... (de API)
            // if (currentValuePerShare) {
            //     currentTotalValue += stock.shares * currentValuePerShare;
            // }
            // if (annualDividendPerShare) {
            //     estimatedAnnualDividend += stock.shares * annualDividendPerShare;
            // }
        });

        totalValueEl.textContent = formatNumber(currentTotalValue) + ' €'; // Asume Euro por defecto, ajustar si es necesario
        estimatedYieldEl.textContent = formatNumber(estimatedAnnualDividend) + ' €';
    }

    /**
     * Renderiza la tabla del portfolio en el HTML.
     */
    function renderPortfolio() {
        portfolioBody.innerHTML = ''; // Limpiar tabla anterior

        if (!portfolio || portfolio.length === 0) {
            if (tableContainer) tableContainer.style.display = 'none'; // Ocultar contenedor tabla
            if (noDataMsg) noDataMsg.style.display = 'block'; // Mostrar mensaje
        } else {
            if (tableContainer) tableContainer.style.display = 'block'; // Mostrar contenedor tabla
            if (noDataMsg) noDataMsg.style.display = 'none';   // Ocultar mensaje

            portfolio.forEach((stock, index) => {
                const row = portfolioBody.insertRow();

                // Obtener datos del objeto, con valores por defecto seguros
                const name = stock.name || '-';
                const ticker = stock.ticker?.toUpperCase() || '-'; // Usar optional chaining
                const country = stock.country || '-';
                const currency = stock.currency || '-';
                const shares = parseFloat(stock.shares) || 0;
                const purchasePrice = parseFloat(stock.purchasePrice) || 0;
                const clubPrice = parseFloat(stock.clubPrice) ?? null; // Mantiene null si es null/undefined
                const costBase = (shares && purchasePrice) ? (shares * purchasePrice) : null;

                row.innerHTML = `
                    <td>${name}</td>
                    <td>${ticker}</td>
                    <td>${country}</td>
                    <td>${currency}</td>
                    <td class="text-right">${formatNumber(shares, 0)}</td>
                    <td class="text-right">${formatNumber(purchasePrice)} ${currencySymbol(currency)}</td>
                    <td class="text-right">${formatNumber(costBase)} ${currencySymbol(currency)}</td>
                    <td class="text-right">${formatNumber(clubPrice)} ${currencySymbol(currency)}</td>
                    <td class="text-right current-value" data-ticker="${ticker}">Cargando...</td> <!-- Placeholder API -->
                    <td class="text-right dividend-per-share" data-ticker="${ticker}">-</td> <!-- Placeholder API -->
                    <td class="ex-dividend-date" data-ticker="${ticker}">-</td> <!-- Placeholder API -->
                    <td class="actions">
                        <button class="edit-btn" data-index="${index}" title="Editar">✏️</button>
                        <button class="delete-btn" data-index="${index}" title="Eliminar">❌</button>
                    </td>
                `;
            });
            // Re-añadir listeners a los botones recién creados
             addTableActionListeners();
             // TODO: Llamar a función para buscar datos de API después de renderizar
             // fetchApiDataForPortfolio();
        }
        // Actualizar resumen después de renderizar
        updateSummary();
    }


    /**
     * Añade event listeners a los botones de editar y eliminar en la tabla.
     */
    function addTableActionListeners() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            // Quitar listener anterior para evitar duplicados si se re-renderiza
            button.removeEventListener('click', handleDeleteStock);
            button.addEventListener('click', handleDeleteStock);
        });
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.removeEventListener('click', handleEditStock);
            button.addEventListener('click', handleEditStock);
        });
    }

     /**
     * Devuelve el símbolo de la moneda.
     * @param {string} currencyCode Código ISO (USD, EUR, CAD, NOK).
     * @returns {string} Símbolo de moneda o código si no se encuentra.
     */
     function currencySymbol(currencyCode) {
        switch (currencyCode?.toUpperCase()) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'CAD': return 'C$';
            case 'NOK': return 'kr';
            default: return currencyCode || ''; // Devuelve el código si no hay símbolo conocido
        }
    }

    // --- Manejadores de Eventos ---

    /**
     * Maneja el envío del formulario para añadir o actualizar acciones.
     * @param {Event} e El evento de envío del formulario.
     */
    function handleAddStockFormSubmit(e) {
        e.preventDefault();

        const tickerInput = document.getElementById('ticker');
        const sharesInput = document.getElementById('shares');
        const purchasePriceInput = document.getElementById('purchase-price');

        const ticker = tickerInput.value.trim().toUpperCase();
        const shares = parseFloat(sharesInput.value);
        const purchasePrice = parseFloat(purchasePriceInput.value) || null; // null si está vacío

        // Validación básica
        if (!ticker || isNaN(shares) || shares <= 0) {
            alert('Por favor, introduce un Ticker y un número de acciones válido.');
            return;
        }

        const existingStockIndex = portfolio.findIndex(s => s.ticker === ticker);

        if (existingStockIndex > -1) {
            // Actualizar acción existente
            const existingStock = portfolio[existingStockIndex];
            const totalShares = existingStock.shares + shares;
            let newAveragePrice = existingStock.purchasePrice;

            // Calcular nuevo precio medio ponderado si se proporciona un nuevo precio de compra
            if (purchasePrice !== null && purchasePrice >= 0 && existingStock.purchasePrice !== null) {
                 newAveragePrice = ((existingStock.shares * existingStock.purchasePrice) + (shares * purchasePrice)) / totalShares;
            } else if (purchasePrice !== null && purchasePrice >= 0 && existingStock.purchasePrice === null) {
                // Si no había precio antes y se añade ahora
                newAveragePrice = purchasePrice;
            }
             // Si no se proporciona nuevo precio, se mantiene el promedio anterior

            portfolio[existingStockIndex].shares = totalShares;
            portfolio[existingStockIndex].purchasePrice = newAveragePrice;

            alert(`Acción ${ticker} actualizada. Total acciones: ${totalShares}, Precio Medio: ${formatNumber(newAveragePrice)} ${currencySymbol(existingStock.currency)}`);

        } else {
            // Añadir nueva acción (faltarán datos como nombre, país, etc.)
            const newStock = {
                ticker: ticker,
                shares: shares,
                purchasePrice: purchasePrice,
                // Valores por defecto para los campos no presentes en el form
                name: ticker, // Usar ticker como nombre temporal
                country: 'N/A',
                currency: 'N/A', // O intentar adivinar por el ticker?
                clubPrice: null
            };
            portfolio.push(newStock);
            alert(`Acción ${ticker} añadida. Completa los detalles editándola si es necesario.`);
        }

        savePortfolio();
        renderPortfolio();
        addStockForm.reset();
        tickerInput.focus();
    }

    /**
     * Maneja el clic en el botón de eliminar.
     * @param {Event} event El evento del clic.
     */
    function handleDeleteStock(event) {
        const index = parseInt(event.target.closest('button').dataset.index, 10); // Más robusto
        if (isNaN(index)) return;

        const stockToDelete = portfolio[index];
        if (!stockToDelete) return;


        if (confirm(`¿Estás seguro de que quieres eliminar ${stockToDelete.shares} acciones de ${stockToDelete.ticker}?`)) {
            portfolio.splice(index, 1); // Eliminar del array
            savePortfolio();
            renderPortfolio(); // Volver a dibujar la tabla
        }
    }

    /**
     * Maneja el clic en el botón de editar (implementación básica con prompt).
     * @param {Event} event El evento del clic.
     */
    function handleEditStock(event) {
        const index = parseInt(event.target.closest('button').dataset.index, 10);
         if (isNaN(index)) return;

        const stockToEdit = portfolio[index];
         if (!stockToEdit) return;

        // --- Edición Mejorada (Ejemplo básico) ---
        // Podrías usar un modal aquí para una mejor UX

        const newSharesStr = prompt(`Editar número de acciones para ${stockToEdit.ticker}:`, stockToEdit.shares);
        if (newSharesStr === null) return; // Cancelado

        const newShares = parseFloat(newSharesStr);
        if (isNaN(newShares) || newShares < 0) {
             alert("Número de acciones inválido.");
             return;
         }

        const newPriceStr = prompt(`Editar precio de compra PROMEDIO para ${stockToEdit.ticker} (${currencySymbol(stockToEdit.currency)}):`, stockToEdit.purchasePrice ?? '');
         if (newPriceStr === null) return; // Cancelado

         let newPrice = null;
         if (newPriceStr.trim() !== '') {
             newPrice = parseFloat(newPriceStr);
             if (isNaN(newPrice) || newPrice < 0) {
                 alert("Precio de compra inválido.");
                 return;
             }
         }

         // Podrías añadir prompts para otros campos: Name, Country, Currency, ClubPrice
         // const newName = prompt("Editar Nombre:", stockToEdit.name);
         // ... etc ...

         // Actualizar el objeto en el array
         portfolio[index].shares = newShares;
         portfolio[index].purchasePrice = newPrice;
         // portfolio[index].name = newName || portfolio[index].name; // Actualizar si no es null/vacío

         savePortfolio();
         renderPortfolio();
    }


    // --- Inicialización ---

    /**
     * Carga los datos iniciales del portfolio desde localStorage o desde un archivo JSON.
     */
    async function loadInitialData() {
        const storedPortfolio = localStorage.getItem('dividendPortfolio');

        if (storedPortfolio) {
            try {
                portfolio = JSON.parse(storedPortfolio);
                console.log("Portfolio cargado desde localStorage.");
            } catch (error) {
                console.error("Error al parsear portfolio desde localStorage:", error);
                localStorage.removeItem('dividendPortfolio'); // Limpiar datos corruptos
                // Intentar cargar desde JSON como fallback
                await loadFromJson();
            }
        } else {
           await loadFromJson();
        }
         // Renderizar siempre después de intentar cargar
         renderPortfolio();
    }

    /**
     * Función auxiliar para cargar desde cartera.json
     */
     async function loadFromJson() {
         try {
            console.log("Intentando cargar portfolio desde cartera.json...");
            const response = await fetch('cartera.json'); // Usando cartera.json
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
            const jsonData = await response.json();
             // Validar que sea un array (básico)
             if (!Array.isArray(jsonData)) {
                throw new Error("El archivo JSON no contiene un array válido.");
             }
            portfolio = jsonData;
            console.log("Portfolio cargado correctamente desde cartera.json.");
            savePortfolio(); // Guarda los datos iniciales del JSON en localStorage
        } catch (error) {
            console.error("Error al cargar o procesar cartera.json:", error);
            if (noDataMsg) {
                noDataMsg.textContent = `Error al cargar cartera.json: ${error.message}. Revisa la consola.`;
                noDataMsg.style.display = 'block';
            }
             if (tableContainer) tableContainer.style.display = 'none';
            portfolio = []; // Asegurarse de que el portfolio esté vacío si falla la carga
        }
     }

    // --- Ejecución Inicial ---
    addStockForm.addEventListener('submit', handleAddStockFormSubmit); // Adjuntar listener al formulario
    loadInitialData(); // Cargar datos al iniciar

});