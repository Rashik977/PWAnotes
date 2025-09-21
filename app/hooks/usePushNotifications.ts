// app/hooks/usePushNotifications.ts
import { useState, useEffect } from 'react';
import { PushManager } from '@/app/lib/push-manager';
import { saveSubscription } from '@/app/actions/push-actions';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSupport();
    checkSubscription();
  }, []);

  const checkSupport = async () => {
    const supported = await PushManager.isSupported();
    setIsSupported(supported);
  };

  const checkSubscription = async () => {
    try {
      const subscription = await PushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  };

  const subscribe = async () => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const subscription = await PushManager.subscribe();
      const subscriptionData = PushManager.subscriptionToData(subscription);
      
      const result = await saveSubscription(subscriptionData);
      
      if (result.success) {
        setIsSubscribed(true);
        return true;
      } else {
        setError(result.error || 'Failed to save subscription');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await PushManager.unsubscribe();
      if (success) {
        setIsSubscribed(false);
        return true;
      } else {
        setError('Failed to unsubscribe');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsubscribe';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const showLocalNotification = async (title: string, options?: NotificationOptions) => {
    try {
      await PushManager.showLocalNotification(title, options);
    } catch (err) {
      console.error('Error showing local notification:', err);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    showLocalNotification,
    refresh: checkSubscription
  };
}