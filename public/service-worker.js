const CACHE_NAME = 'job-portal-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const STATIC_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'favicon.ico',
  'logo144.png',
  'logo192.png',
  'logo512.png',
  'screenshot1.png',
  'apple-touch-icon.png',
  '/src/main.jsx',
  '/src/App.jsx'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('offline.html');
          }
        });
      })
  );
});

// Update service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE];
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
  // Claim clients to ensure the service worker is in control immediately
  self.clients.claim();
});

// Handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: 'logo144.png',
    badge: 'logo144.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Job Portal', options)
  );
}); 