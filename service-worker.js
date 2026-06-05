const CACHE_NAME = "kaoyan408-code-system-flat-v5-preview-clean";
const CORE = [
  "./",
  "./index.html",
  "./styles.css",
  "./main.js",
  "./utils.js",
  "./models.js",
  "./db.js",
  "./highlight.js",
  "./codeEditor.js",
  "./homeView.js",
  "./editView.js",
  "./previewView.js",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const req = event.request;
  const url = new URL(req.url);

  // 导航请求优先走网络，失败时回退 index，解决已安装 PWA 直接启动失败。
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy)).catch(() => {});
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // CDN 资源不强制缓存，失败时不影响本地降级编辑器。
  if (url.hostname.includes("cdn.jsdelivr.net")) {
    event.respondWith(fetch(req).catch(() => Response.error()));
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
        }
        return response;
      }).catch(() => caches.match("./index.html"))
    })
  );
});
