// Datos de ejemplo (luego los puedes guardar en localStorage)
let stocks = [
    { ticker: "AAPL", shares: 10, buyPrice: 150.00, dividend: 5.00 },
    { ticker: "MSFT", shares: 5, buyPrice: 300.00, dividend: 7.50 }
  ];
  
  // Elementos del DOM
  const stocksBody = document.getElementById("stocksBody");
  const annualDividendsEl = document.getElementById("annualDividends");
  const portfolioValueEl = document.getElementById("portfolioValue");
  const addStockBtn = document.getElementById("addStock");
  const modal = document.getElementById("modal");
  const closeModal = document.querySelector(".close");
  const stockForm = document.getElementById("stockForm");
  
  // Mostrar acciones en la tabla
  function renderStocks() {
    stocksBody.innerHTML = "";
    let totalDividends = 0;
    let totalPortfolioValue = 0;
  
    stocks.forEach(stock => {
      const dividendYield = (stock.dividend / stock.buyPrice * 100).toFixed(2);
      const annualDividend = stock.shares * stock.dividend;
      const positionValue = stock.shares * stock.buyPrice;
  
      totalDividends += annualDividend;
      totalPortfolioValue += positionValue;
  
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${stock.ticker}</td>
        <td>${stock.shares}</td>
        <td>$${stock.buyPrice.toFixed(2)}</td>
        <td>$${annualDividend.toFixed(2)}</td>
        <td>${dividendYield}%</td>
        <td><button class="delete-btn" data-ticker="${stock.ticker}">Eliminar</button></td>
      `;
      stocksBody.appendChild(row);
    });
  
    // Actualizar resumen
    annualDividendsEl.textContent = `$${totalDividends.toFixed(2)}`;
    portfolioValueEl.textContent = `$${totalPortfolioValue.toFixed(2)}`;
  }
  
  // Eventos
  addStockBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });
  
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });
  
  stockForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const ticker = document.getElementById("ticker").value.toUpperCase();
    const shares = parseFloat(document.getElementById("shares").value);
    const buyPrice = parseFloat(document.getElementById("buyPrice").value);
    const dividend = parseFloat(document.getElementById("dividend").value);
  
    stocks.push({ ticker, shares, buyPrice, dividend });
    renderStocks();
    modal.style.display = "none";
    stockForm.reset();
  });
  
  // Delegación de eventos para botones de eliminar
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const ticker = e.target.getAttribute("data-ticker");
      stocks = stocks.filter(stock => stock.ticker !== ticker);
      renderStocks();
    }
  });
  
  // Inicializar
  renderStocks();