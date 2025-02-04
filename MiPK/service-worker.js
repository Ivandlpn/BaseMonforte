const cacheName = 'mi-pk-cache-v1'; // Cambia la versión al actualizar la caché
const staticAssets = [
    '/',
    'index.html',
    'styles.css',
    'script.js',
    'img/CabeceraMiPK2.png',
    'img/PieMiPK.png',
    'img/FaviconMiPK.png',
    './doc/traza/L40Z.json',  // Archivos de trazado
    './doc/traza/L40Ar.json',
    './doc/traza/L40Br.json',
    './doc/traza/L40Cr.json',
    './doc/traza/L42Ar.json',
    './doc/traza/L42B.json',
    './doc/traza/L46.json',
    './doc/traza/L48.json',
    './doc/puertas/PL42.json',  // Archivos de puertas
    './doc/puertas/PL46.json',
    './doc/puertas/PL40.json',
    './doc/edificios/ALBALI.json', // Archivos de edificios
    './doc/edificios/TOVAL.json',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',

    //... (otros archivos estáticos)
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                console.log('Cacheando archivos estáticos');
                return cache.addAll(staticAssets);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== cacheName) // Elimina caches antiguos
                    .map(key => caches.delete(key))
            );
        })
    );
});

// Intercepción de solicitudes
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request); // Sirve desde la caché o va a la red
            })
    );
});