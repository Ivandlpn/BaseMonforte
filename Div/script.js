// Variables globales
let stocks = [];

// Cargar datos desde data.json
async function loadStocksData() {
  try {
    const response = await fetch('data.json');
    const data = await response.json();
    stocks = data.stocks;
    renderStocks();
  } catch (error) {
    console.error("Error cargando datos:", error);
    // Datos de respaldo (opcional)
    stocks = [
      { name: "Ejemplo", ticker: "AAPL", currency: "USD", shares: 10, buyPrice: 150, dividend: 2.00 }
    ];
    renderStocks();
  }
}

// Mostrar acciones en la tabla (igual que antes)
function renderStocks() {
  stocksBody.innerHTML = "";
  let totalDividends = 0;
  let totalPortfolioValue = 0;

  stocks.forEach(stock => {
    const annualDividend = stock.shares * stock.dividend;
    const positionValue = stock.shares * stock.buyPrice;
    const dividendYield = (stock.dividend / stock.buyPrice * 100).toFixed(2);
    const currencySymbol = getCurrencySymbol(stock.currency);

    totalDividends += annualDividend;
    totalPortfolioValue += positionValue;

    const row = document.createElement("tr");
    row.setAttribute("data-country", stock.country);
    row.setAttribute("data-currency", stock.currency);
    row.innerHTML = `
      <td>${stock.name} (${stock.ticker})</td>
      <td>${stock.shares}</td>
      <td>${currencySymbol}${stock.buyPrice.toFixed(2)}</td>
      <td>${currencySymbol}${annualDividend.toFixed(2)}</td>
      <td>${dividendYield}%</td>
      <td><button class="delete-btn" data-ticker="${stock.ticker}">Eliminar</button></td>
    `;
    stocksBody.appendChild(row);
  });

  annualDividendsEl.textContent = `$${totalDividends.toFixed(2)}`;
  portfolioValueEl.textContent = `$${totalPortfolioValue.toFixed(2)}`;
}

// Helper para símbolos de moneda
function getCurrencySymbol(currency) {
  const symbols = { USD: "$", EUR: "€", CAD: "CA$", NOK: "kr" };
  return symbols[currency] || currency;
}

// Inicializar (cargar datos al iniciar)
loadStocksData();
