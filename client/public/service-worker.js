const CACHE_NAME = 'dental-clinic-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/favicon.ico'
];

const API_CACHE_NAME = 'dental-clinic-api-v1';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Install service worker and cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Handle fetch requests with network-first strategy for API calls
// and cache-first strategy for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle API requests
  if (url.origin === API_URL) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

async function handleApiRequest(request) {
  // Try network first
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's a POST/PUT/DELETE request, store in IndexedDB for later sync
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      await storeRequestForSync(request);
      return new Response(JSON.stringify({ 
        status: 'offline',
        message: 'Request stored for sync'
      }));
    }
  }
}

// Store failed requests in IndexedDB for later synchronization
async function storeRequestForSync(request) {
  const db = await openDB();
  const tx = db.transaction('offlineRequests', 'readwrite');
  const store = tx.objectStore('offlineRequests');
  
  const serializedRequest = {
    url: request.url,
    method: request.method,
    headers: Array.from(request.headers.entries()),
    body: await request.clone().text(),
    timestamp: Date.now()
  };
  
  await store.add(serializedRequest);
  await tx.complete;
}

// Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('dentalClinicOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineRequests')) {
        db.createObjectStore('offlineRequests', { 
          keyPath: 'id',
          autoIncrement: true 
        });
      }
    };
  });
}

// Listen for sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-patients') {
    event.waitUntil(syncOfflineRequests());
  }
});

// Synchronize offline requests when online
async function syncOfflineRequests() {
  const db = await openDB();
  const tx = db.transaction('offlineRequests', 'readwrite');
  const store = tx.objectStore('offlineRequests');
  const requests = await store.getAll();
  
  for (const request of requests) {
    try {
      await fetch(request.url, {
        method: request.method,
        headers: new Headers(request.headers),
        body: request.method !== 'DELETE' ? request.body : null
      });
      await store.delete(request.id);
    } catch (error) {
      console.error('Sync failed for request:', request, error);
    }
  }
  
  await tx.complete;
} 