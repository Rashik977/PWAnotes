// app/lib/push-manager.ts
import { PushSubscriptionData } from './types';

export class PushManager {
  private static vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  static async isSupported(): Promise<boolean> {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }
    return await Notification.requestPermission();
  }

  static async getSubscription(): Promise<PushSubscription | null> {
    if (!await this.isSupported()) return null;
    
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  }

  static async subscribe(): Promise<PushSubscription> {
    if (!this.vapidPublicKey) {
      throw new Error('VAPID public key not configured');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permission denied for notifications');
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
    });

    return subscription;
  }

  static async unsubscribe(): Promise<boolean> {
    const subscription = await this.getSubscription();
    if (subscription) {
      return await subscription.unsubscribe();
    }
    return false;
  }

  static subscriptionToData(subscription: PushSubscription): PushSubscriptionData {
    const keys = subscription.getKey ? {
      p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
      auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
    } : { p256dh: '', auth: '' };

    return {
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime || undefined,
      keys
    };
  }

  static async showLocalNotification(
    title: string, 
    options?: NotificationOptions
  ): Promise<void> {
    const permission = await this.requestPermission();
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      ...options
    });
  }

  // Utility functions
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}