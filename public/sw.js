// public/sw.js
const CACHE_NAME = "pwa-notes-cache-v3";
const OFFLINE_URL = "/offline.html";

// Don't cache in development mode
const isDev =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1" ||
  self.location.port === "3000";

const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install - precache basic assets (skip in dev)
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");

  if (!isDev) {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => {
          console.log("[SW] Precaching assets");
          return cache.addAll(PRECACHE_URLS);
        })
        .catch((error) => {
          console.error("[SW] Precaching failed:", error);
        })
    );
  }

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName.startsWith("pwa-notes-cache-")
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] Taking control of all clients");
        return self.clients.claim();
      })
  );
});

// Fetch - different strategy for dev vs production
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip caching for API routes in development
  if (isDev && url.pathname.startsWith("/api/")) {
    return;
  }

  // Skip external requests (except for weather API)
  if (
    url.origin !== self.location.origin &&
    !url.hostname.includes("openweathermap.org")
  ) {
    return;
  }

  event.respondWith(handleFetch(event.request));
});

async function handleFetch(request) {
  const url = new URL(request.url);

  try {
    // Development mode - always try network first
    if (isDev) {
      const networkResponse = await fetch(request);
      return networkResponse;
    }

    // Production caching strategy

    // For API requests, try network first, then cache
    if (url.pathname.startsWith("/api/")) {
      return await networkFirst(request);
    }

    // For app shell, try cache first, then network
    if (url.pathname === "/" || url.pathname.startsWith("/_next/")) {
      return await cacheFirst(request);
    }

    // For other resources, try cache first
    return await cacheFirst(request);
  } catch (error) {
    console.error("[SW] Fetch failed:", error);

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      const cachedOffline = await caches.match(OFFLINE_URL);
      if (cachedOffline) {
        return cachedOffline;
      }
    }

    // Return a basic offline response
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);

  // Cache successful responses
  if (networkResponse.status === 200) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Push event - show notification
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event.data?.text());

  let payload = {
    title: "PWA Notes",
    body: "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    data: {},
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch (e) {
    console.warn("[SW] Failed to parse push payload:", e);
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    data: payload.data,
    vibrate: [200, 100, 200],
    tag: payload.tag || "pwa-notes-notification",
    requireInteraction: true,
    actions: [
      {
        action: "view",
        title: "👀 View",
        icon: "/icons/icon-192x192.png",
      },
      {
        action: "dismiss",
        title: "❌ Dismiss",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  // Handle notification click
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Find existing window
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }

        // Open new window
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
  );
});

// Background sync (for future use)
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Add background sync logic here
      console.log("Background sync completed")
    );
  }
});

// Message from main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Received SKIP_WAITING message");
    self.skipWaiting();
  }
});

// Error handling
self.addEventListener("error", (error) => {
  console.error("[SW] Error:", error);
});

self.addEventListener("unhandledrejection", (error) => {
  console.error("[SW] Unhandled promise rejection:", error);
});
