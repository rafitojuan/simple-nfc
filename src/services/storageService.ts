import { AppSettings, HistoryEntry, EMoneyCache } from '../types/nfc';

class StorageService {
  private readonly SETTINGS_KEY = 'nfc_app_settings';
  private readonly HISTORY_KEY = 'nfc_scan_history';
  private readonly EMONEY_CACHE_KEY = 'emoney_cache';

  public getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }

    return this.getDefaultSettings();
  }

  public saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  public getDefaultSettings(): AppSettings {
    return {
      ttsEnabled: true,
      autoSpeak: true,
      language: 'id-ID',
      ttsVoice: '',
      ttsSpeed: 1,
      ttsVolume: 1,
      securityEnabled: false
    };
  }

  public getHistory(): HistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        return history.sort((a: HistoryEntry, b: HistoryEntry) => b.timestamp - a.timestamp);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }

    return [];
  }

  public addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
    try {
      const history = this.getHistory();
      const newEntry: HistoryEntry = {
        ...entry,
        id: this.generateId(),
        timestamp: Date.now()
      };

      history.unshift(newEntry);
      
      const maxEntries = 100;
      if (history.length > maxEntries) {
        history.splice(maxEntries);
      }

      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error adding history entry:', error);
    }
  }

  public removeHistoryEntry(id: string): void {
    try {
      const history = this.getHistory();
      const filtered = history.filter(entry => entry.id !== id);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing history entry:', error);
    }
  }

  public toggleHistoryFavorite(id: string): void {
    try {
      const history = this.getHistory();
      const entry = history.find(item => item.id === id);
      if (entry) {
        entry.favorite = !entry.favorite;
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  public clearHistory(): void {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  public getEMoneyCache(): EMoneyCache {
    try {
      const stored = localStorage.getItem(this.EMONEY_CACHE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading e-money cache:', error);
    }

    return {};
  }

  public updateEMoneyCache(cardId: string, data: {
    balance: number;
    currency: string;
    cardType: string;
    nickname?: string;
  }): void {
    try {
      const cache = this.getEMoneyCache();
      cache[cardId] = {
        ...data,
        lastRead: Date.now()
      };
      localStorage.setItem(this.EMONEY_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error updating e-money cache:', error);
    }
  }

  public removeEMoneyFromCache(cardId: string): void {
    try {
      const cache = this.getEMoneyCache();
      delete cache[cardId];
      localStorage.setItem(this.EMONEY_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error removing e-money from cache:', error);
    }
  }

  public clearEMoneyCache(): void {
    try {
      localStorage.removeItem(this.EMONEY_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing e-money cache:', error);
    }
  }

  public clearAllData(): void {
    try {
      localStorage.removeItem(this.SETTINGS_KEY);
      localStorage.removeItem(this.HISTORY_KEY);
      localStorage.removeItem(this.EMONEY_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public exportData(): string {
    const data = {
      settings: this.getSettings(),
      history: this.getHistory(),
      emoneyCache: this.getEMoneyCache(),
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      
      if (data.history) {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(data.history));
      }
      
      if (data.emoneyCache) {
        localStorage.setItem(this.EMONEY_CACHE_KEY, JSON.stringify(data.emoneyCache));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();