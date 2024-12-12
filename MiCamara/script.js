// Variables para la cámara
const abrirCamara = document.getElementById('abrirCamara');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('camera');
const takePhoto = document.getElementById('takePhoto');
const photoCanvas = document.getElementById('photoCanvas');
const photoActions = document.getElementById('photoActions');
const savePhoto = document.getElementById('savePhoto');
const sharePhoto = document.getElementById('sharePhoto');
const backHome = document.getElementById('backHome');

let stream = null;
let pkTexto = "";

// Abrir cámara al hacer clic en el icono
abrirCamara.addEventListener('click', async () => {
    cameraContainer.classList.remove('oculto');
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
});

// Tomar foto
takePhoto.addEventListener('click', () => {
    const context = photoCanvas.getContext('2d');
    photoCanvas.width = video.videoWidth;
    photoCanvas.height = video.videoHeight;

    // Dibujar la foto en el canvas
    context.drawImage(video, 0, 0);

    // Añadir tarjeta del PK
    context.fillStyle = 'rgba(0, 51, 102, 0.8)';
    context.fillRect(0, photoCanvas.height - 50, photoCanvas.width, 50);

    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.textAlign = 'center';
    context.fillText(pkTexto, photoCanvas.width / 2, photoCanvas.height - 20);

    photoCanvas.classList.remove('oculto');
    photoActions.classList.remove('oculto');
    video.classList.add('oculto');
    takePhoto.classList.add('oculto');

    // Detener la transmisión
    stream.getTracks().forEach(track => track.stop());
});

// Guardar foto
savePhoto.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'foto_pk.png';
    link.href = photoCanvas.toDataURL('image/png');
    link.click();
});

// Compartir foto
sharePhoto.addEventListener('click', async () => {
    const blob = await new Promise(resolve => photoCanvas.toBlob(resolve, 'image/png'));
    const file = new File([blob], 'foto_pk.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
            files: [file],
            title: 'Foto del PK',
        });
    } else {
        alert('Tu navegador no soporta compartir archivos.');
    }
});

// Volver a la página inicial
backHome.addEventListener('click', () => {
    cameraContainer.classList.add('oculto');
    photoCanvas.classList.add('oculto');
    photoActions.classList.add('oculto');
    video.classList.remove('oculto');
    takePhoto.classList.remove('oculto');
});

// Actualizar PK en la tarjeta al calcular el más cercano
function mostrarPKMasCercano(pk) {
    const pkElement = document.getElementById("pkCercano");
    const distanciaElement = document.getElementById("distancia");
    const pkFormateado = formatearPK(pk.pk);
    pkElement.textContent = pkFormateado;
    distanciaElement.textContent = `${pk.distancia.toFixed(2)} metros`;

    // Actualizar el texto para la foto
    pkTexto = `PK ${pkFormateado}`;
}
