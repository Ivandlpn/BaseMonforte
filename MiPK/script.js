let mapa, marcadorActual, marcadorPK, iconoUsuario;
let centradoAutomaticamente = true;

// Rastrear la posición continuamente
navigator.geolocation.watchPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    if (!mapa) {
        inicializarMapa(lat, lon);
    }

    if (centradoAutomaticamente) {
        actualizarPosicionUsuario(lat, lon);
    }

    fetch("./PKCoordenas.json")
        .then(response => response.json())
        .then(data => {
            window.pkMasCercano = calcularPKMasCercano(lat, lon, data)[0];
            mostrarPKMasCercano(window.pkMasCercano);
            actualizarPosicionPK(window.pkMasCercano);
            cargarTrazado();
        })
        .catch(error => console.error('Error al cargar los datos de PK:', error));
}, 
(error) => console.error('Error al obtener ubicación:', error), {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000
});

function inicializarMapa(lat, lon) {
    mapa = L.map('map', {
        center: [lat, lon],
        zoom: 18,
        maxZoom: 19,
        attributionControl: false
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        maxZoom: 19
    }).addTo(mapa);

    iconoUsuario = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/1783/1783356.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    marcadorActual = L.marker([lat, lon], { icon: iconoUsuario }).addTo(mapa)
        .bindPopup('Mi Ubicación')
        .openPopup();

    mapa.on('move', () => {
        centradoAutomaticamente = false;
    });
}

function actualizarPosicionUsuario(lat, lon) {
    marcadorActual.setLatLng([lat, lon]);
    if (centradoAutomaticamente) {
        mapa.setView([lat, lon], 18);
    }
}

function calcularPKMasCercano(lat, lon, data) {
    let puntosCercanos = data.map(pk => {
        const distancia = calcularDistancia(lat, lon, pk.Latitud, pk.Longitud);
        return { pk: pk.PK, latitud: pk.Latitud, longitud: pk.Longitud, distancia: distancia };
    });

    puntosCercanos.sort((a, b) => a.distancia - b.distancia);
    return puntosCercanos.slice(0, 1);
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function mostrarPKMasCercano(pk) {
    const pkElement = document.getElementById("pkCercano");
    const distanciaElement = document.getElementById("distancia");
    const pkFormateado = formatearPK(pk.pk);
    pkElement.textContent = pkFormateado;
    distanciaElement.textContent = `${pk.distancia.toFixed(2)} metros`;
}

function actualizarPosicionPK(pk) {
    if (!marcadorPK) {
        marcadorPK = L.marker([pk.latitud, pk.longitud]).addTo(mapa)
            .bindPopup('PK cercano')
            .openPopup();
    } else {
        marcadorPK.setLatLng([pk.latitud, pk.longitud]);
    }
}

function formatearPK(pk) {
    const pkStr = pk.toString();
    if (pkStr.length > 6) {
        return pkStr.slice(0, 3) + '+' + pkStr.slice(3, 6);
    } else if (pkStr.length === 6) {
        return pkStr.slice(0, 3) + '+' + pkStr.slice(3);
    } else {
        return pkStr;
    }
}



function dibujarTrazadoConEventos(data) {
    const trazado = data.map((punto) => [punto.Latitud, punto.Longitud]);
    const lineaFerrocarril = L.polyline(trazado, {
        color: 'blue',
        weight: 4,
        opacity: 0.8
    }).addTo(mapa);

    // Añadir eventos para cada punto del trazado
    data.forEach((punto) => {
        const marcador = L.circleMarker([punto.Latitud, punto.Longitud], {
            radius: 4,
            color: 'red'
        }).addTo(mapa);

        marcador.bindPopup(`PK: ${punto.PK}`);
    });

    mapa.fitBounds(lineaFerrocarril.getBounds());
}

async function cargarTrazadoConEventos() {
    try {
        const respuesta = await fetch('./PKCoordenas.json');
        const data = await respuesta.json();

        dibujarTrazadoConEventos(data);
    } catch (error) {
        console.error('Error al cargar el trazado con eventos:', error);
    }
}






document.getElementById("actualizarUbicacion").addEventListener("click", () => {
    if (marcadorActual) {
        const { lat, lng } = marcadorActual.getLatLng();
        mapa.setView([lat, lng], 18);
        centradoAutomaticamente = true;
    }
});

// Modificación para abrir la cámara y añadir un botón
document.getElementById("iconoCamara").addEventListener("click", () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
            const contenedor = document.createElement("div");
            contenedor.style.position = "absolute";
            contenedor.style.top = "0";
            contenedor.style.left = "0";
            contenedor.style.width = "100%";
            contenedor.style.height = "100%";
            contenedor.style.zIndex = "1000";
            contenedor.style.backgroundColor = "black";
            document.body.appendChild(contenedor);

            const video = document.createElement("video");
            video.srcObject = stream;
            video.autoplay = true;
            video.style.width = "100%";
            video.style.height = "100%";
            video.style.objectFit = "cover";
            contenedor.appendChild(video);

            const botonFoto = document.createElement("button");
            botonFoto.textContent = "Hacer Foto";
            botonFoto.style.position = "absolute";
            botonFoto.style.bottom = "10px";
            botonFoto.style.left = "50%";
            botonFoto.style.transform = "translateX(-50%)";
            botonFoto.style.padding = "10px 20px";
            botonFoto.style.fontSize = "16px";
            botonFoto.style.color = "white";
            botonFoto.style.backgroundColor = "#007aff";
            botonFoto.style.border = "none";
            botonFoto.style.borderRadius = "5px";
            botonFoto.style.cursor = "pointer";
            botonFoto.style.zIndex = "1001";
            contenedor.appendChild(botonFoto);

            botonFoto.addEventListener("click", () => {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const textoPK = `PK ${formatearPK(window.pkMasCercano.pk)}`;
                const padding = 20;
                const fontSize = 24;
                const margenExtra = 60; // Ajusta este valor según sea necesario
                const tarjetaWidth = ctx.measureText(textoPK).width + padding * 2 + margenExtra;
                const tarjetaHeight = fontSize + padding * 2;

              ctx.fillStyle = "rgba(0, 122, 255, 0.5)"; // Fondo azul semitransparente
                const x = (canvas.width - tarjetaWidth) / 2;
                const y = canvas.height - tarjetaHeight - 20;
                ctx.beginPath();
                ctx.roundRect(x, y, tarjetaWidth, tarjetaHeight, 20); // 20 = radio de las esquinas
                ctx.fill();


                ctx.fillStyle = "white";
                ctx.font = `${fontSize}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(
                    textoPK,
                    canvas.width / 2,
                    canvas.height - tarjetaHeight / 2 - 20
                );

                const imagenCapturada = document.createElement("img");
                imagenCapturada.src = canvas.toDataURL("image/png");
                imagenCapturada.style.position = "absolute";
                imagenCapturada.style.top = "0";
                imagenCapturada.style.left = "0";
                imagenCapturada.style.width = "100%";
                imagenCapturada.style.height = "100%";
                imagenCapturada.style.objectFit = "cover";
                imagenCapturada.style.zIndex = "1002";
                document.body.appendChild(imagenCapturada);

                video.style.display = "none";

                const contenedorBotones = document.createElement("div");
                contenedorBotones.style.position = "absolute";
                contenedorBotones.style.top = "10px";
                contenedorBotones.style.left = "50%";
                contenedorBotones.style.transform = "translateX(-50%)";
                contenedorBotones.style.display = "flex";
                contenedorBotones.style.gap = "10px";
                contenedorBotones.style.zIndex = "1003";
                document.body.appendChild(contenedorBotones);

                const estiloBoton = `
                    padding: 8px 15px;
                    font-size: 14px;
                    color: white;
                    background-color: #479af5;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                `;

// Botón "Guardar"
const imagenGuardar = document.createElement("img"); // Cambiar de button a img
imagenGuardar.src = "img/guardar.png"; // Reemplaza con el nombre y ruta de tu archivo de imagen
imagenGuardar.alt = "Guardar";
imagenGuardar.style.cssText = "cursor: pointer; width: 60px; height: 50px;"; // Ajusta el tamaño según necesites
contenedorBotones.appendChild(imagenGuardar); // Añadir la imagen al contenedor

// Mantener la función mostrarMensaje como está
function mostrarMensaje(mensaje) {
    const mensajeDiv = document.createElement("div");
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.position = "fixed";
    mensajeDiv.style.bottom = "20px";
    mensajeDiv.style.left = "50%";
    mensajeDiv.style.transform = "translateX(-50%)";
    mensajeDiv.style.backgroundColor = "#28a745"; // Verde de confirmación
    mensajeDiv.style.color = "white";
    mensajeDiv.style.padding = "10px 20px";
    mensajeDiv.style.borderRadius = "5px";
    mensajeDiv.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    mensajeDiv.style.zIndex = "1000";
    mensajeDiv.style.fontSize = "1.2em";
    document.body.appendChild(mensajeDiv);

    setTimeout(() => {
        mensajeDiv.remove();
    }, 3000); // El mensaje desaparecerá después de 3 segundos
}

// Cambiar el evento click del botón por el evento click de la imagen
imagenGuardar.addEventListener("click", () => { // Cambia botonGuardar por imagenGuardar
    try {
        // Obtener el PK formateado
        const pkFormateado = formatearPK(window.pkMasCercano.pk);

        // Obtener la fecha actual
        const fechaActual = new Date();
        const dia = String(fechaActual.getDate()).padStart(2, "0");
        const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
        const anio = fechaActual.getFullYear();
        const fechaFormateada = `${dia}-${mes}-${anio}`;

        // Crear el nombre del archivo
        const nombreArchivo = `${pkFormateado} ${fechaFormateada}.jpg`;

        // Crear un Blob a partir del canvas en formato JPG
        canvas.toBlob((blob) => {
            if (!blob) {
                alert("Error al generar la imagen.");
                return;
            }

            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);

            link.href = url;
            link.download = nombreArchivo;

            // Simular un clic para descargar
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Liberar el objeto URL
            URL.revokeObjectURL(url);

            // Mostrar el mensaje de confirmación sin el nombre del sitio
            mostrarMensaje("Foto guardada");
        }, "image/jpeg"); // Formato JPEG
    } catch (error) {
        console.error("Error al intentar guardar la imagen:", error);
        alert("No se puede guardar la imagen en este dispositivo.");
    }
});





const imagenCompartir = document.createElement("img");
imagenCompartir.src = "img/compartir.png"; // Reemplaza con el nombre real de tu archivo de imagen
imagenCompartir.alt = "Compartir";
imagenCompartir.style.cssText = "cursor: pointer; width: 60px; height: 50px;"; // Ajusta el tamaño según necesites
contenedorBotones.appendChild(imagenCompartir);

imagenCompartir.addEventListener("click", async () => {
    try {
        const dataUrl = canvas.toDataURL("image/png");
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "foto_con_pk.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: "Foto con PK",
                text: "Aquí está la foto con la información del PK."
            });
        } else {
            alert("No se puede compartir esta imagen desde tu dispositivo.");
        }
    } catch (error) {
        console.error("Error al compartir:", error);
    }
});


// Reemplazar el botón "Volver" por una imagen
const imagenVolver = document.createElement("img"); // Cambiar de button a img
imagenVolver.src = "img/volver.png"; // Reemplaza con el nombre y ruta de tu archivo de imagen
imagenVolver.alt = "Volver";
imagenVolver.style.cssText = "cursor: pointer; width: 60px; height: 50px;"; // Ajusta el tamaño según necesites
contenedorBotones.appendChild(imagenVolver); // Añadir la imagen al contenedor

// Agregar el evento click a la imagen
imagenVolver.addEventListener("click", () => {
    imagenCapturada.remove();
    contenedorBotones.remove();
    video.style.display = "block";
});


                
// Crear la imagen como botón de editar
const imagenEditar = document.createElement("img");
imagenEditar.src = "img/editar.png"; // Ruta de tu imagen de editar
imagenEditar.alt = "Editar";
imagenEditar.style.cssText = `
    cursor: pointer; 
    width: 60px; 
    height: 50px; 
    margin: 0 5px; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
    border-radius: 5px;
`;
contenedorBotones.appendChild(imagenEditar);

// Función para abrir la interfaz de edición
imagenEditar.addEventListener("click", () => {
    const contenedorEdicion = document.createElement("div");
    contenedorEdicion.style.position = "absolute";
    contenedorEdicion.style.top = "0";
    contenedorEdicion.style.left = "0";
    contenedorEdicion.style.width = "100%";
    contenedorEdicion.style.height = "100%";
    contenedorEdicion.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    contenedorEdicion.style.zIndex = "1004";
    contenedorEdicion.style.display = "flex";
    contenedorEdicion.style.flexDirection = "column";
    contenedorEdicion.style.justifyContent = "center";
    contenedorEdicion.style.alignItems = "center";
    document.body.appendChild(contenedorEdicion);

    // Mostrar la imagen capturada en un canvas editable
    const canvasEdicion = document.createElement("canvas");
    canvasEdicion.width = canvas.width;
    canvasEdicion.height = canvas.height;
    const ctxEdicion = canvasEdicion.getContext("2d");
    ctxEdicion.drawImage(canvas, 0, 0);
    contenedorEdicion.appendChild(canvasEdicion);

    // Campo de texto para añadir información
    const inputTexto = document.createElement("input");
    inputTexto.type = "text";
    inputTexto.placeholder = "Añade información...";
    inputTexto.style.margin = "20px";
    inputTexto.style.padding = "10px";
    inputTexto.style.fontSize = "16px";
    contenedorEdicion.appendChild(inputTexto);

    // Botón para guardar cambios
    const botonGuardarEdicion = document.createElement("button");
    botonGuardarEdicion.textContent = "Guardar Cambios";
    botonGuardarEdicion.style.margin = "10px";
    botonGuardarEdicion.style.padding = "10px 20px";
    botonGuardarEdicion.style.fontSize = "16px";
    botonGuardarEdicion.style.color = "white";
    botonGuardarEdicion.style.backgroundColor = "#007aff";
    botonGuardarEdicion.style.border = "none";
    botonGuardarEdicion.style.borderRadius = "5px";
    botonGuardarEdicion.style.cursor = "pointer";
    contenedorEdicion.appendChild(botonGuardarEdicion);

    // Evento para guardar cambios
    botonGuardarEdicion.addEventListener("click", () => {
        const texto = inputTexto.value;
        ctxEdicion.font = "20px Arial";
        ctxEdicion.fillStyle = "white";
        ctxEdicion.fillText(texto, 20, canvasEdicion.height - 50);
        ctx.drawImage(canvasEdicion, 0, 0); // Actualizar la imagen original
        contenedorEdicion.remove();
    });

    // Botón para cerrar la edición
    const botonCerrarEdicion = document.createElement("button");
    botonCerrarEdicion.textContent = "Cerrar";
    botonCerrarEdicion.style.margin = "10px";
    botonCerrarEdicion.style.padding = "10px 20px";
    botonCerrarEdicion.style.fontSize = "16px";
    botonCerrarEdicion.style.color = "white";
    botonCerrarEdicion.style.backgroundColor = "#ff3b30";
    botonCerrarEdicion.style.border = "none";
    botonCerrarEdicion.style.borderRadius = "5px";
    botonCerrarEdicion.style.cursor = "pointer";
    contenedorEdicion.appendChild(botonCerrarEdicion);

    // Evento para cerrar la edición
    botonCerrarEdicion.addEventListener("click", () => {
        contenedorEdicion.remove();
    });
});

                




            video.addEventListener("click", () => {
                stream.getTracks().forEach(track => track.stop());
                contenedor.remove();
            });
        })
        .catch((error) => {
            console.error("Error al acceder a la cámara: ", error);
        });
});

});
