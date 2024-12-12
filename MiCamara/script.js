document.getElementById('iconoCamara').addEventListener('click', () => {
    // Crear o mostrar un contenedor para la cámara
    let contenedorCamara = document.getElementById('contenedorCamara');
    if (!contenedorCamara) {
        contenedorCamara = document.createElement('div');
        contenedorCamara.id = 'contenedorCamara';
        contenedorCamara.style.position = 'fixed';
        contenedorCamara.style.top = '0';
        contenedorCamara.style.left = '0';
        contenedorCamara.style.width = '100%';
        contenedorCamara.style.height = '100%';
        contenedorCamara.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        contenedorCamara.style.zIndex = '1000';
        contenedorCamara.innerHTML = `
            <video id="videoCamara" autoplay style="width: 100%; height: auto;"></video>
            <button id="cerrarCamara" style="
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 10px;
                background-color: red;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                z-index: 1001;
            ">Cerrar</button>
            <button id="hacerFoto">Hacer foto</button>
        `;
        document.body.appendChild(contenedorCamara);
    }

    // Acceder a la cámara trasera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
            const video = document.getElementById('videoCamara');
            video.srcObject = stream;

            // Botón "Cerrar"
            document.getElementById('cerrarCamara').addEventListener('click', () => {
                stream.getTracks().forEach(track => track.stop());
                contenedorCamara.remove();
            });

            // Botón "Hacer foto" - Sin funcionalidad adicional aún
            document.getElementById('hacerFoto').addEventListener('click', () => {
                alert("Botón 'Hacer foto' pulsado. Funcionalidad en desarrollo.");
            });
        })
        .catch((error) => {
            console.error('No se pudo acceder a la cámara:', error);
            alert('Error al acceder a la cámara: ' + error.message);
        });
});
