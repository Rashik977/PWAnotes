// app/api/weather/route.ts
import { NextRequest, NextResponse } from 'next/server';

const DEMO_WEATHER_DATA = [
  {
    location: 'New York',
    temperature: 22,
    description: 'Partly cloudy',
  },
  {
    location: 'London',
    temperature: 18,
    description: 'Light rain',
  },
  {
    location: 'Tokyo',
    temperature: 25,
    description: 'Sunny',
  },
  {
    location: 'Sydney',
    temperature: 20,
    description: 'Clear sky',
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'London';
  
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    
    if (API_KEY && API_KEY !== 'demo_key') {
      // Use real OpenWeatherMap API
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
        { 
          next: { revalidate: 600 } // Cache for 10 minutes
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        return NextResponse.json({
          location: data.name,
          temperature: Math.round(data.main.temp),
          description: data.weather[0].description,
        });
      }
    }
    
    // Fallback to demo data
    const demoData = DEMO_WEATHER_DATA[Math.floor(Math.random() * DEMO_WEATHER_DATA.length)];
    
    return NextResponse.json({
      ...demoData,
      description: `${demoData.description} (demo data)`,
    });
    
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Return demo data as fallback
    const demoData = DEMO_WEATHER_DATA[0];
    return NextResponse.json({
      ...demoData,
      description: `${demoData.description} (demo data)`,
    });
  }
}