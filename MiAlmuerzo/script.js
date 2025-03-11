document.addEventListener('DOMContentLoaded', () => {
    const nuevoPedidoBtn = document.getElementById('nuevo-pedido');
    const verPedidosBtn = document.getElementById('ver-pedidos');
    const formularioPedido = document.getElementById('formulario-pedido');
    const listaBebidas = document.getElementById('lista-bebidas');
    const listaComidas = document.getElementById('lista-comidas');
    const resumenPedidoSection = document.getElementById('resumen-pedido');
    const itemsPedidoList = document.getElementById('items-pedido');
    const precioTotalElement = document.getElementById('precio-total');
    const enviarCocinaBtn = document.getElementById('enviar-cocina');

    let pedidoActual = [];
    let precioTotal = 0;

    // Datos de ejemplo (puedes expandir y organizar mejor en un objeto o JSON)
    const bebidas = [
        { nombre: 'Café Solo', precio: 1.20 },
        { nombre: 'Café con Leche', precio: 1.50 },
        { nombre: 'Cortado', precio: 1.30 },
        { nombre: 'Carajillo', precio: 2.00 },
        { nombre: 'Bombón', precio: 2.20 },
        { nombre: 'Cremaet', precio: 2.50 },
        { nombre: 'Americano', precio: 1.40 },
        { nombre: 'Zumo Naranja Natural', precio: 2.50 },
        { nombre: 'Zumo Limón', precio: 2.00 },
        { nombre: 'Coca-Cola', precio: 2.00 },
        { nombre: 'Fanta Naranja', precio: 2.00 },
        { nombre: 'Aquarius', precio: 2.20 },
        { nombre: 'Cerveza Rubia', precio: 2.00 },
        { nombre: 'Cerveza Tostada', precio: 2.20 },
        { nombre: 'Cerveza Sin Alcohol', precio: 2.00 },
        { nombre: 'Radler', precio: 2.20 },
        { nombre: 'Vermut', precio: 2.50 },
        { nombre: 'Cazalla', precio: 3.00 },
        { nombre: 'Mistela', precio: 2.80 },
        { nombre: 'Orujo', precio: 3.20 },
        { nombre: 'Gin-Tonic', precio: 6.00 },
        { nombre: 'Agua con Gas', precio: 1.50 },
        { nombre: 'Agua sin Gas', precio: 1.50 },
        { nombre: 'Leche', precio: 1.00 },
        { nombre: 'Horchata', precio: 2.50 }
    ];

    const comidas = [
        { nombre: 'Tostada Jamón Serrano', precio: 3.50, tipo: 'tostada' },
        { nombre: 'Tostada Tomate y Aceite', precio: 2.50, tipo: 'tostada' },
        { nombre: 'Medio Bocadillo Jamón York y Queso', precio: 3.00, tipo: 'medio bocadillo' },
        { nombre: 'Bocadillo Entero Chorizo', precio: 4.50, tipo: 'bocadillo entero' },
        // ... Añade más comidas
    ];

    // Funciones para mostrar productos en el menú
    function mostrarBebidas() {
        listaBebidas.innerHTML = ''; // Limpiar contenido anterior
        bebidas.forEach(bebida => {
            const productoDiv = crearProductoElement(bebida);
            listaBebidas.appendChild(productoDiv);
        });
    }

    function mostrarComidas() {
        listaComidas.innerHTML = ''; // Limpiar contenido anterior
        comidas.forEach(comida => {
            const productoDiv = crearProductoElement(comida);
            listaComidas.appendChild(productoDiv);
        });
    }

    function crearProductoElement(producto) {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto');
        productoDiv.innerHTML = `
            <h4>${producto.nombre}</h4>
            <p>${producto.precio.toFixed(2)} €</p>
        `;
        productoDiv.addEventListener('click', () => agregarAlPedido(producto));
        return productoDiv;
    }

    function agregarAlPedido(producto) {
        pedidoActual.push(producto);
        actualizarResumenPedido();
        resumenPedidoSection.classList.remove('oculto'); // Mostrar resumen al añadir el primer item
    }

    function actualizarResumenPedido() {
        itemsPedidoList.innerHTML = ''; // Limpiar resumen anterior
        precioTotal = 0;

        pedidoActual.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.nombre} - ${item.precio.toFixed(2)} €`;
            itemsPedidoList.appendChild(listItem);
            precioTotal += item.precio;
        });

        precioTotalElement.textContent = `Total: ${precioTotal.toFixed(2)} €`;
    }


    // Event listeners
    nuevoPedidoBtn.addEventListener('click', () => {
        formularioPedido.classList.remove('oculto');
        document.getElementById('acciones-principales').classList.add('oculto');
        mostrarBebidas();
        mostrarComidas();
        pedidoActual = []; // Limpiar pedido anterior
        precioTotal = 0;
        resumenPedidoSection.classList.add('oculto'); // Ocultar resumen al inicio de nuevo pedido
    });

    verPedidosBtn.addEventListener('click', () => {
        alert('Funcionalidad para ver pedidos abiertos (en desarrollo)');
        // Aquí iría la lógica para mostrar pedidos abiertos
    });

    enviarCocinaBtn.addEventListener('click', () => {
        if (pedidoActual.length > 0) {
            alert('Comanda enviada a cocina (funcionalidad simulada)');
            // Aquí iría la lógica para enviar la comanda (ej. AJAX request)
            formularioPedido.classList.add('oculto');
            document.getElementById('acciones-principales').classList.remove('oculto');
        } else {
            alert('El pedido está vacío. Añade productos antes de enviar.');
        }
    });
});