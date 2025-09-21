// app/components/ServiceWorkerRegister.tsx
"use client";
import { useEffect } from "react";

interface ServiceWorkerRegisterProps {
  onReady?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}

export default function ServiceWorkerRegister({
  onReady,
  onUpdate,
}: ServiceWorkerRegisterProps) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.log("Service Worker not supported");
      return;
    }

    const isDev = process.env.NODE_ENV === "development";

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration.scope);
        onReady?.(registration);

        // Handle updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          console.log("New Service Worker found, installing...");

          newWorker.addEventListener("statechange", () => {
            switch (newWorker.state) {
              case "installed":
                if (navigator.serviceWorker.controller) {
                  // New content is available
                  console.log("New content available");
                  onUpdate?.(registration);

                  if (isDev) {
                    console.log(
                      "Development mode: activating new SW immediately"
                    );
                    newWorker.postMessage({ type: "SKIP_WAITING" });
                  }
                } else {
                  console.log("Content is cached for offline use");
                }
                break;

              case "redundant":
                console.log("New Service Worker is redundant");
                break;
            }
          });
        });
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });

    // Listen for SW updates
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("Service Worker controller changed");
      if (isDev) {
        console.log("Development mode: reloading page");
        window.location.reload();
      }
    });

    // Listen for messages from SW
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SW_UPDATED") {
        console.log("Service Worker updated");
        onUpdate?.(event.data.registration);
      }
    });
  }, [onReady, onUpdate]);

  return null;
}
