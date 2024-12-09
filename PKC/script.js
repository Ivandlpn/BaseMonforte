const obtenerUbicacion = () => {
  if (!navigator.geolocation) {
    mostrarError("La geolocalización no está disponible en tu navegador.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      calcularPKMasCercano(lat, lon);
    },
    () => mostrarError("No se pudo obtener la ubicación."),
    { enableHighAccuracy: true }
  );
};

const calcularPKMasCercano = async (lat, lon) => {
  try {
    const respuesta = await fetch("PKCoordenas.json");
    const datos = await respuesta.json();

    let pkCercano = null;
    let distanciaMinima = Infinity;

    datos.forEach((punto) => {
      const distancia = calcularDistancia(lat, lon, punto.Latitud, punto.Longitud);
      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        pkCercano = punto.PK;
      }
    });

    mostrarResultados(pkCercano, distanciaMinima);
  } catch (error) {
    mostrarError("No se pudieron cargar los datos de PK.");
  }
};

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const mostrarResultados = (pk, distancia) => {
  document.querySelector("#resultados").style.display = "block";
  document.querySelector("#pkCercano").textContent = convertirFormatoPK(pk);
  document.querySelector("#distancia").textContent = distancia.toFixed(2);
};

const convertirFormatoPK = (pk) => {
  const match = pk.toString().match(/^(\d+)(\d{3})$/);
  return match ? `${match[1]}+${match[2]}` : pk;
};

const mostrarError = (mensaje) => {
  document.querySelector("#error").style.display = "block";
  document.querySelector("#error").textContent = mensaje;
};

// Iniciar al cargar
document.addEventListener("DOMContentLoaded", obtenerUbicacion);
