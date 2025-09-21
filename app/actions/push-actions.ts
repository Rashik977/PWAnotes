// app/actions/push-actions.ts
'use server'

import webpush from 'web-push';
import { PushSubscriptionData, NotificationPayload } from '@/app/lib/types';

// Configure web-push
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'admin@example.com'}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// In-memory storage for demo (use database in production)
let subscriptions: PushSubscriptionData[] = [];

export async function saveSubscription(subscriptionData: PushSubscriptionData) {
  try {
    // Check if subscription already exists
    const existingIndex = subscriptions.findIndex(sub => 
      sub.endpoint === subscriptionData.endpoint
    );
    
    if (existingIndex >= 0) {
      // Update existing subscription
      subscriptions[existingIndex] = subscriptionData;
    } else {
      // Add new subscription
      subscriptions.push(subscriptionData);
    }
    
    console.log(`Subscription saved. Total: ${subscriptions.length}`);
    
    return { 
      success: true, 
      message: 'Subscription saved successfully',
      totalSubscriptions: subscriptions.length
    };
  } catch (error) {
    console.error('Error saving subscription:', error);
    return { 
      success: false, 
      error: 'Failed to save subscription' 
    };
  }
}

export async function removeSubscription(endpoint: string) {
  try {
    const initialLength = subscriptions.length;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    
    const removed = initialLength > subscriptions.length;
    
    return { 
      success: true, 
      removed,
      totalSubscriptions: subscriptions.length
    };
  } catch (error) {
    console.error('Error removing subscription:', error);
    return { 
      success: false, 
      error: 'Failed to remove subscription' 
    };
  }
}

export async function sendPushToAllDevices(payload: NotificationPayload) {
  if (subscriptions.length === 0) {
    return { 
      success: false, 
      error: 'No subscriptions available',
      sent: 0,
      total: 0
    };
  }

  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/icon-192x192.png',
    data: payload.data || {},
    tag: payload.tag || 'pwa-notes'
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys
          },
          pushPayload
        );
        return { success: true, endpoint: sub.endpoint };
      } catch (error) {
        console.error(`Failed to send to ${sub.endpoint}:`, error);
        // Remove invalid subscriptions
        if (error instanceof Error && error.message.includes('410')) {
          subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
        }
        return { success: false, endpoint: sub.endpoint, error };
      }
    })
  );

  const successful = results.filter(result => 
    result.status === 'fulfilled' && result.value.success
  ).length;

  console.log(`Push notifications sent: ${successful}/${subscriptions.length}`);

  return {
    success: true,
    sent: successful,
    total: subscriptions.length,
    results: results.map(result => 
      result.status === 'fulfilled' ? result.value : { success: false }
    )
  };
}

export async function sendPushToDevice(endpoint: string, payload: NotificationPayload) {
  const subscription = subscriptions.find(sub => sub.endpoint === endpoint);
  
  if (!subscription) {
    return { 
      success: false, 
      error: 'Subscription not found' 
    };
  }

  try {
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-192x192.png',
      data: payload.data || {},
      tag: payload.tag || 'pwa-notes'
    });

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys
      },
      pushPayload
    );

    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    
    // Remove invalid subscription
    if (error instanceof Error && error.message.includes('410')) {
      subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send notification' 
    };
  }
}

export async function getSubscriptionStats() {
  return {
    total: subscriptions.length,
    subscriptions: subscriptions.map(sub => ({
      endpoint: sub.endpoint.substring(0, 50) + '...',
      hasKeys: !!(sub.keys.p256dh && sub.keys.auth)
    }))
  };
}