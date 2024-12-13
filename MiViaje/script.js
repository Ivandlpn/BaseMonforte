<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Viaje en Cabina</title>

    <!-- Leaflet.js -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            overflow: hidden;
            background: #f4f4f4;
        }

        header {
            height: 15%;
            width: 100%;
            background: url('img/CabeceraMiViaje.png') no-repeat center center;
            background-size: cover;
        }

        #map {
            height: 55%;
            width: 100%;
            border: 2px solid #007aff;
        }

        .tarjeta {
            width: 90%;
            background: white;
            color: #333;
            border-radius: 10px;
            padding: 8px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-top: 5px;
        }

        .tarjeta h1 {
            font-size: 1.6em;
            color: #007aff;
        }

        .tarjeta h2 {
            font-size: 1.2em;
        }

        .tarjeta p {
            font-size: 0.9em;
            color: #555;
        }

        #error {
            color: red;
            font-size: 1em;
            margin-top: 10px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <header></header>
    <div id="map"></div>
    <div class="tarjeta">
        <h1 id="pk">475+156</h1>
        <h2 id="velocidad">Velocidad: 0 Km/h</h2>
        <p id="lugar">Buscando Ubicación...</p>
    </div>
    <p id="error"></p>

    <script>
        let mapa, marcador;
        let ultimaLatitud = null;

        function inicializarMapa(lat, lon) {
            mapa = L.map('map').setView([lat, lon], 16);
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 19
            }).addTo(mapa);

            const iconoTren = L.icon({
                iconUrl: 'img/MarcadorTren.png',
                iconSize: [80, 80],
                iconAnchor: [40, 80]
            });

            marcador = L.marker([lat, lon], { icon: iconoTren }).addTo(mapa);
        }

        function determinarVia(lat) {
            if (ultimaLatitud === null) {
                ultimaLatitud = lat;
                return "Desconocida";
            }
            const via = lat > ultimaLatitud ? "Vía 1" : "Vía 2";
            ultimaLatitud = lat;
            return via;
        }

        function actualizarPK(pk, lat) {
            const via = determinarVia(lat);
            document.getElementById("pk").textContent = `${pk} (${via})`;
        }

        navigator.geolocation.watchPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;

                if (!mapa) inicializarMapa(lat, lon);
                marcador.setLatLng([lat, lon]);
                mapa.setView([lat, lon]);

                actualizarPK("475+156", lat);
                obtenerMunicipio(lat, lon);
            },
            (err) => manejarError("Error al obtener ubicación: " + err.message),
            { enableHighAccuracy: true, maximumAge: 0 }
        );

        async function obtenerMunicipio(lat, lon) {
            try {
                const respuesta = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const data = await respuesta.json();
                const municipio = data.address.city || data.address.town || data.address.village || "Desconocido";
                document.getElementById("lugar").textContent = `Ubicación: ${municipio}`;
            } catch (error) {
                manejarError("Error al obtener el municipio.");
            }
        }

        function manejarError(mensaje) {
            document.getElementById("error").textContent = mensaje;
        }
    </script>
</body>
</html>
