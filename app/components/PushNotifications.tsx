// app/components/PushNotifications.tsx
"use client";
import { usePushNotifications } from "@/app/hooks/usePushNotifications";

interface PushNotificationsProps {
  className?: string;
  onStatusChange?: (enabled: boolean) => void;
}

export default function PushNotifications({
  className = "",
  onStatusChange,
}: PushNotificationsProps) {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    showLocalNotification,
  } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      onStatusChange?.(false);
      if (success) {
        await showLocalNotification("Push Notifications", {
          body: "Push notifications have been disabled",
        });
      }
    } else {
      const success = await subscribe();
      onStatusChange?.(success);
      if (success) {
        await showLocalNotification("Push Notifications Enabled! 🎉", {
          body: "You will now receive notifications on all your devices when you add notes",
        });
      }
    }
  };

  const handleTestNotification = async () => {
    await showLocalNotification("Test Notification 🔔", {
      body: "This is a test notification from PWA Notes",
      tag: "test-notification",
      requireInteraction: false,
    });
  };

  if (!isSupported) {
    return (
      <div className={`text-xs text-gray-400 ${className}`}>
        Push notifications not supported
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`px-3 py-2 rounded-md text-sm transition-colors disabled:opacity-50 ${
            isSubscribed
              ? "bg-green-600 text-white hover:bg-green-700"
              : "border border-gray-600 hover:bg-gray-700"
          }`}
        >
          {isLoading
            ? "⏳ Loading..."
            : isSubscribed
            ? "✅ Push Enabled"
            : "🔔 Enable Push"}
        </button>

        {isSubscribed && (
          <button
            onClick={handleTestNotification}
            className="px-3 py-2 border border-gray-600 rounded-md text-sm hover:bg-gray-700 transition-colors"
          >
            🧪 Test Notification
          </button>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
          ⚠️ {error}
        </div>
      )}

      {isSubscribed && (
        <div className="text-xs text-green-400 bg-green-900/20 p-2 rounded">
          You will receive notifications on all your devices when you add notes
        </div>
      )}
    </div>
  );
}
