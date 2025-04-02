// Nome do cache
const CACHE_NAME = 'mines-ia-v1';

// Arquivos a serem cacheados
const urlsToCache = [
  '/',
  '/index.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://apis.google.com/js/api.js',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Erro ao cachear recursos:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estratégia de cache: Cache First, então Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna o recurso do cache se encontrado
        if (response) {
          return response;
        }
        
        // Caso contrário, busca na rede
        return fetch(event.request)
          .then(networkResponse => {
            // Não cachear se não for um GET ou se for uma requisição de API
            if (event.request.method !== 'GET' || 
                event.request.url.includes('googleapis.com')) {
              return networkResponse;
            }
            
            // Clone a resposta, pois o corpo só pode ser lido uma vez
            const responseToCache = networkResponse.clone();
            
            // Adicionar ao cache para uso futuro
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return networkResponse;
          })
          .catch(error => {
            console.error('Falha ao buscar recurso:', error);
            // Você pode retornar uma página de fallback para casos de erro de rede
          });
      })
  );
});
