// app/lib/types.ts

export interface Note {
    id: number;
    text: string;
    image?: string;
    createdAt: number;
    updatedAt: number;
  }
  
  export interface WeatherData {
    location: string;
    temperature: number;
    description: string;
    cached: boolean;
    lastUpdated: number;
  }
  
  export interface PushSubscriptionData {
    endpoint: string;
    expirationTime?: number;
    keys: {
      p256dh: string;
      auth: string;
    };
  }
  
  export interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
    tag?: string;
  }
  
  export interface AppState {
    isOnline: boolean;
    isInstalled: boolean;
    pushEnabled: boolean;
    serviceWorkerReady: boolean;
  }