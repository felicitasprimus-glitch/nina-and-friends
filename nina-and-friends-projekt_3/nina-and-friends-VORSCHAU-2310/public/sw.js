// Einfacher Service Worker fuer Installierbarkeit und Offline-Grundfunktion.
const CACHE = "naf-v3";
const CORE = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Dynamische Daten (Dateien, Seiten, Kategorien, Inhalte) immer frisch aus
  // dem Netz holen - niemals aus dem Cache, damit Neues sofort erscheint.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/.netlify/")
  ) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // Navigationsanfragen: Netzwerk zuerst, bei Offline Fallback auf index.html (SPA)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/index.html").then((r) => r || Response.error()))
    );
    return;
  }

  // Statische Dateien: aus Cache, sonst Netzwerk und nachladen
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached || Response.error());
    })
  );
});

/* ---------- Push-Nachrichten ---------- */

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "Nina and Friends", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Nina and Friends";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icons/icon-192.png",
    badge: data.badge || "/icons/icon-192.png",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const ziel = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((liste) => {
      for (const client of liste) {
        if ("focus" in client) {
          client.navigate(ziel);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(ziel);
    })
  );
});
