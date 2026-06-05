const CACHE_NAME = 'kaoyan408-code-system-v4';
const CORE_ASSETS = [
  './',
  './index.html',
  './public/manifest.webmanifest',
  './public/icons/icon-192.png',
  './public/icons/icon-512.png',
  './src/main.js',
  './src/db.js',
  './src/models.js',
  './src/state.js',
  './src/utils.js',
  './src/components/codeEditor.js',
  './src/components/highlight.js',
  './src/components/modal.js',
  './src/components/toast.js',
  './src/views/shell.js',
  './src/views/homeView.js',
  './src/views/editorView.js',
  './src/views/previewView.js',
  './src/styles/base.css',
  './src/styles/layout.css',
  './src/styles/editor.css',
  './src/styles/preview.css',
  './src/styles/responsive.css'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      const copy = response.clone();
      if (new URL(request.url).origin === location.origin) {
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
