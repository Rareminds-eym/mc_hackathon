/**
 * Enhanced Service Worker for PWA functionality
 * Provides offline support, caching strategies, and background sync
 */

const CACHE_NAME = 'gmp-training-game-v1.0.0';
const RUNTIME_CACHE = 'gmp-runtime-cache-v1.0.0';
const IMAGE_CACHE = 'gmp-image-cache-v1.0.0';
const API_CACHE = 'gmp-api-cache-v1.0.0';

// Core assets that should always be cached
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Icons
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-192x192-maskable.png',
  '/icons/icon-512x512-maskable.png',
  // Logos
  '/logos/bulb.png',
  '/logos/Gametitle.png',
  '/logos/RareMinds.png',
  // Essential backgrounds
  '/backgrounds/Homepagebg.webp',
  '/backgrounds/LoaderBg.svg',
  // Characters
  '/characters/intern.png',
  '/characters/trainer.png',
  // Audio files
  '/lab-game-sound.mp3',
  '/bgm.mp3',
  '/correct.mp3',
  '/wrong.mp3',
  '/Bingo.mp3'
];

// Assets to cache on demand
const RUNTIME_ASSETS = [
  // Additional backgrounds
  '/backgrounds/Level1.png',
  '/backgrounds/Level2.png',
  '/backgrounds/Level3.png',
  '/backgrounds/Level4.png',
  '/backgrounds/BingoBg3.jpg',
  '/backgrounds/l3-victory-bg.webp',
  '/backgrounds/m1l3.webp',
  // Additional characters
  '/characters/Intern1.png',
  '/characters/Intern2.png',
  '/characters/Intern3.png',
  '/characters/Intern4.png',
  '/characters/Intern5.png',
  '/characters/Intern6.png',
  '/characters/Intern7.png',
  '/characters/Intern8.png',
  '/characters/Intern9.png',
  '/characters/Intern10.png',
  '/characters/Trainer2.png',
  '/characters/chara.webp',
  '/characters/worker.webp'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    Promise.all([
      // Cache core static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching core static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      }),
      // Pre-cache some runtime assets
      caches.open(RUNTIME_CACHE).then((cache) => {
        console.log('Pre-caching runtime assets');
        return cache.addAll(RUNTIME_ASSETS.slice(0, 5)); // Cache first 5 runtime assets
      })
    ]).then(() => {
      console.log('Service Worker installation complete');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('Service Worker installation failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, API_CACHE];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('Service Worker activation failed:', error);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event: FetchEvent) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (event.request.destination === 'document') {
    // For page requests, try network first, fallback to cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(event.request)
            .then((response) => {
              return response || caches.match('/index.html');
            });
        })
    );
  } else {
    // For assets, try cache first, fallback to network
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(event.request)
            .then((response) => {
              // Cache successful responses
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseClone);
                  });
              }
              return response;
            });
        })
    );
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', (event: MessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    (self as any).skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
