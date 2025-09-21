// app/lib/storage.ts
import { Note, WeatherData } from './types';

export class StorageManager {
  private static readonly NOTES_KEY = 'pwa-notes';
  private static readonly WEATHER_KEY = 'pwa-weather-data';
  private static readonly WEATHER_CACHE_TIME_KEY = 'pwa-weather-cache-time';

  // Notes management
  static getNotes(): Note[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(this.NOTES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  }

  static saveNotes(notes: Note[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  }

  static addNote(text: string, image?: string): Note {
    const notes = this.getNotes();
    const newNote: Note = {
      id: Date.now(),
      text,
      image,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    const updatedNotes = [...notes, newNote];
    this.saveNotes(updatedNotes);
    return newNote;
  }

  static deleteNote(id: number): void {
    const notes = this.getNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    this.saveNotes(filteredNotes);
  }

  static updateNote(id: number, updates: Partial<Note>): void {
    const notes = this.getNotes();
    const updatedNotes = notes.map(note =>
      note.id === id 
        ? { ...note, ...updates, updatedAt: Date.now() }
        : note
    );
    this.saveNotes(updatedNotes);
  }

  // Weather data management
  static getWeatherData(): WeatherData | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(this.WEATHER_KEY);
      const cacheTime = localStorage.getItem(this.WEATHER_CACHE_TIME_KEY);
      
      if (data && cacheTime) {
        const weatherData = JSON.parse(data);
        weatherData.lastUpdated = parseInt(cacheTime);
        weatherData.cached = true;
        return weatherData;
      }
      return null;
    } catch (error) {
      console.error('Error loading weather data:', error);
      return null;
    }
  }

  static saveWeatherData(data: Omit<WeatherData, 'cached' | 'lastUpdated'>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.WEATHER_KEY, JSON.stringify(data));
      localStorage.setItem(this.WEATHER_CACHE_TIME_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving weather data:', error);
    }
  }

  static isWeatherDataFresh(maxAgeMinutes: number = 10): boolean {
    if (typeof window === 'undefined') return false;
    const cacheTime = localStorage.getItem(this.WEATHER_CACHE_TIME_KEY);
    if (!cacheTime) return false;
    
    const age = Date.now() - parseInt(cacheTime);
    const maxAge = maxAgeMinutes * 60 * 1000;
    return age < maxAge;
  }

  // Clear all data
  static clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.NOTES_KEY);
    localStorage.removeItem(this.WEATHER_KEY);
    localStorage.removeItem(this.WEATHER_CACHE_TIME_KEY);
  }
}