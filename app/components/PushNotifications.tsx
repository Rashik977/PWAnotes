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

  // New function to test cross-device notifications
  const handleTestCrossDevice = async () => {
    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "created",
          noteTitle: "Test Cross-Device Note",
          noteContent:
            "This is a test to check if cross-device notifications work!",
        }),
      });

      const result = await response.json();

      if (result.success) {
        await showLocalNotification("Cross-Device Test Sent! 📱", {
          body: `Sent to ${result.sent}/${result.total} devices`,
          tag: "cross-device-test",
        });
      } else {
        await showLocalNotification("Test Failed ❌", {
          body: result.error || "Failed to send cross-device notification",
          tag: "cross-device-error",
        });
      }
    } catch (error) {
      console.error("Error testing cross-device notification:", error);
      await showLocalNotification("Test Error ❌", {
        body: "Failed to send cross-device test notification",
        tag: "cross-device-error",
      });
    }
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
          <>
            <button
              onClick={handleTestNotification}
              className="px-3 py-2 border border-gray-600 rounded-md text-sm hover:bg-gray-700 transition-colors"
            >
              🧪 Test Local
            </button>

            <button
              onClick={handleTestCrossDevice}
              className="px-3 py-2 border border-blue-600 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              📱 Test Cross-Device
            </button>
          </>
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
