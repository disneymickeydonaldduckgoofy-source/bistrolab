// ビストロラボ：ネット優先。つながらないときは保存した控えを表示する
const CACHE = "bistrolab-v3";
const CORE = ["./", "index.html", "manifest.webmanifest", "bistro-recipes.json", "bl1-favicon-32.png", "bl1-apple-touch-icon-180.png", "bl1-icon-192.png", "bl1-icon-512.png", "bl1-icon-maskable-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

// ほかのラボと同じ住所(github.io)を共有しているので、消すのはビストロラボの古い控えだけ
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("bistrolab-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html")))
  );
});
