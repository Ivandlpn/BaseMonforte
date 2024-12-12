// Referencias a los elementos HTML
const tomarFotoBtn = document.getElementById("tomarFoto");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let fotoTomada = false;
let imagenTomada = null;

// Evento para abrir la cámara y tomar la foto
tomarFotoBtn.addEventListener("click", async () => {
    try {
        // Solicitar acceso a la cámara
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();

        // Crear un elemento de contenedor para mostrar la vista previa
        const videoContainer = document.createElement("div");
        videoContainer.style.position = "fixed";
        videoContainer.style.top = "0";
        videoContainer.style.left = "0";
        videoContainer.style.zIndex = "9999";
        videoContainer.appendChild(video);

        // Añadir el video al body para mostrarlo
        document.body.appendChild(videoContainer);

        // Tomar la foto después de 2 segundos para ajustar bien la cámara
        setTimeout(() => {
            // Configuramos el tamaño del canvas
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            // Dibujar el video en el canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Obtener la imagen del canvas como una URL
            imagenTomada = canvas.toDataURL("image/png");

            // Detener la cámara
            stream.getTracks().forEach(track => track.stop());

            // Remover el contenedor del video
            document.body.removeChild(videoContainer);

            // Mostrar la imagen tomada y la información del PK
            sobreimprimirPK(imagenTomada);
        }, 2000);
    } catch (error) {
        console.error("Error al acceder a la cámara", error);
    }
});

// Función para sobreimprimir el PK en la foto
function sobreimprimirPK(imagen) {
    const pk = document.getElementById("pkCercano").textContent;

    // Crear una nueva imagen para cargarla
    const img = new Image();
    img.src = imagen;
    img.onload = () => {
        // Dibujar la imagen original en el canvas
        ctx.drawImage(img, 0, 0);

        // Añadir el texto del PK en la esquina inferior derecha
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(`PK ${pk}`, canvas.width - 150, canvas.height - 20);

        // Mostrar la imagen final
        const imagenFinal = canvas.toDataURL("image/png");
        mostrarImagen(imagenFinal);
    };
}

// Función para mostrar la imagen con el PK sobreimpresionado
function mostrarImagen(imagen) {
    const imgTag = document.createElement("img");
    imgTag.src = imagen;
    imgTag.style.position = "fixed";
    imgTag.style.top = "0";
    imgTag.style.left = "0";
    imgTag.style.zIndex = "10000";
    imgTag.style.maxWidth = "100%";
    imgTag.style.maxHeight = "100%";
    document.body.appendChild(imgTag);
    
    // Opción para guardar o compartir
    imgTag.addEventListener("click", () => {
        const a = document.createElement("a");
        a.href = imagen;
        a.download = `foto_Pk_${document.getElementById("pkCercano").textContent}.png`;
        a.click();
    });
}
