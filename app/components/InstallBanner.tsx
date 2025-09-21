// app/components/InstallBanner.tsx
"use client";
import { useState, useEffect } from "react";

interface InstallBannerProps {
  className?: string;
}

export default function InstallBanner({ className = "" }: InstallBannerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      // Check if running as PWA
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");
      setIsInstalled(isStandalone);
    };

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log("PWA was installed");
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`User response to the install prompt: ${outcome}`);

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
    } catch (error) {
      console.error("Error during installation:", error);
    } finally {
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember dismissal for this session
    sessionStorage.setItem("install-banner-dismissed", "true");
  };

  // Don't show if already installed or user dismissed
  if (
    isInstalled ||
    !showBanner ||
    sessionStorage.getItem("install-banner-dismissed")
  ) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 bg-white text-gray-900 p-4 rounded-lg shadow-lg border border-gray-200 z-50 ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Install PWA Notes</h3>
          <p className="text-xs text-gray-600 mt-1">
            Get the full app experience with offline support and push
            notifications
          </p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            className="px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            📱 Install
          </button>
        </div>
      </div>
    </div>
  );
}
