const CACHE = "shop-pro-v2";

// install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([
        "./",
        "./index.html",
        "./manifest.json"
      ]);
    })
  );

  self.skipWaiting();
});

// activate (clean old caches)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE) return caches.delete(k);
        })
      )
    )
  );

  self.clients.claim();
});

// fetch strategy: cache first, then network
self.addEventListener("fetch", event => {

  const req = event.request;

  // ignore non-GET requests (important for Drive API, uploads)
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then(cacheRes => {
      if (cacheRes) return cacheRes;

      return fetch(req).then(networkRes => {

        // optional: cache only same-origin assets
        if (req.url.startsWith(self.location.origin)) {
          const copy = networkRes.clone();
          caches.open(CACHE).then(cache => {
            cache.put(req, copy);
          });
        }

        return networkRes;
      }).catch(() => {
        // fallback for offline
        if (req.destination === "document") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
