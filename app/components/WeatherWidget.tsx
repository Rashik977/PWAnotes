// app/components/WeatherWidget.tsx
"use client";
import { useState, useEffect } from "react";
import { WeatherData } from "@/app/lib/types";
import { StorageManager } from "@/app/lib/storage";
import { useOnlineStatus } from "@/app/hooks/useOnlineStatus";

interface WeatherWidgetProps {
  className?: string;
}

export default function WeatherWidget({ className = "" }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      if (!forceRefresh) {
        const cachedData = StorageManager.getWeatherData();
        if (cachedData && StorageManager.isWeatherDataFresh(10)) {
          setWeather(cachedData);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data if online
      if (isOnline) {
        const response = await fetch("/api/weather");
        if (response.ok) {
          const data = await response.json();
          const weatherData: WeatherData = {
            ...data,
            cached: false,
            lastUpdated: Date.now(),
          };

          setWeather(weatherData);
          StorageManager.saveWeatherData(data);
        } else {
          throw new Error("Weather API failed");
        }
      } else {
        // Use cached data if offline
        const cachedData = StorageManager.getWeatherData();
        if (cachedData) {
          setWeather(cachedData);
        } else {
          setError("No weather data available offline");
        }
      }
    } catch (err) {
      console.error("Weather error:", err);

      // Try cached data as fallback
      const cachedData = StorageManager.getWeatherData();
      if (cachedData) {
        setWeather(cachedData);
      } else {
        setError("Failed to load weather data");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatLastUpdated = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading && !weather) {
    return (
      <div className={`p-3 bg-gray-800 rounded ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className={`p-3 bg-red-800 rounded text-sm ${className}`}>
        <div className="flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button
            onClick={() => loadWeatherData(true)}
            className="text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className={`p-3 bg-gray-800 rounded ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold flex items-center">
          🌤️ Weather in {weather.location}
        </h3>
        <button
          onClick={() => loadWeatherData(true)}
          disabled={loading}
          className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          title="Refresh weather"
        >
          {loading ? "↻" : "🔄"}
        </button>
      </div>

      <div className="text-lg font-semibold mb-1">{weather.temperature}°C</div>

      <div className="text-sm text-gray-300 mb-2">{weather.description}</div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          {weather.cached ? (
            <span className="flex items-center text-yellow-400">📱 Cached</span>
          ) : (
            <span className="flex items-center text-green-400">🔄 Live</span>
          )}

          {!isOnline && <span className="text-red-400">🔴 Offline</span>}
        </div>

        {weather.lastUpdated && (
          <span>{formatLastUpdated(weather.lastUpdated)}</span>
        )}
      </div>
    </div>
  );
}
