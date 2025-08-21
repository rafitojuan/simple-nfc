import { create } from 'zustand';
import { NFCStatus, NFCScanResult, AppSettings, HistoryEntry, EMoneyCache } from '../types/nfc';
import { storageService } from '../services/storageService';
import { ttsService } from '../services/ttsService';

interface AppState {
  nfcStatus: NFCStatus;
  scanResult: NFCScanResult | null;
  settings: AppSettings;
  history: HistoryEntry[];
  emoneyCache: EMoneyCache;
  isNFCSupported: boolean;
  error: string | null;
  
  setNFCStatus: (status: NFCStatus) => void;
  setScanResult: (result: NFCScanResult | null) => void;
  setError: (error: string | null) => void;
  
  updateSettings: (settings: Partial<AppSettings>) => void;
  loadSettings: () => void;
  
  loadHistory: () => void;
  addToHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  removeFromHistory: (id: string) => void;
  toggleHistoryFavorite: (id: string) => void;
  clearHistory: () => void;
  
  loadEMoneyCache: () => void;
  updateEMoneyCache: (cardId: string, data: any) => void;
  removeFromEMoneyCache: (cardId: string) => void;
  clearEMoneyCache: () => void;
  
  initializeApp: () => void;
  resetApp: () => void;
  clearAllData: () => void;
  formatReadableText: (data: any, type: string) => string;
  loadData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  nfcStatus: 'idle',
  scanResult: null,
  settings: storageService.getDefaultSettings(),
  history: [],
  emoneyCache: {},
  isNFCSupported: 'NDEFReader' in window,
  error: null,

  setNFCStatus: (status) => set({ nfcStatus: status }),
  
  setScanResult: (result) => {
    set({ scanResult: result });
    
    if (result && result.success) {
      const { settings } = get();
      
      const entry: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: result.type as 'emoney' | 'tag' | 'raw',
      data: result.data,
      readableText: get().formatReadableText(result.data, result.type),
      favorite: false
    };
    get().addToHistory(entry);
      
      if (settings.ttsEnabled && settings.autoSpeak) {
        ttsService.speakNFCData(result.data, result.type);
      }
      
      if (result.type === 'emoney' && result.data) {
        get().updateEMoneyCache(result.data.cardId, {
          balance: result.data.balance,
          currency: result.data.currency,
          cardType: result.data.cardType,
          nickname: result.data.nickname
        });
      }
    }
  },
  
  setError: (error) => set({ error }),

  updateSettings: (newSettings) => {
    const settings = { ...get().settings, ...newSettings };
    set({ settings });
    storageService.saveSettings(settings);
  },

  loadSettings: () => {
    const settings = storageService.getSettings();
    set({ settings });
  },

  loadHistory: () => {
    const history = storageService.getHistory();
    set({ history });
  },

  addToHistory: (entry) => {
    storageService.addHistoryEntry(entry);
    get().loadHistory();
  },

  removeFromHistory: (id) => {
    storageService.removeHistoryEntry(id);
    get().loadHistory();
  },

  toggleHistoryFavorite: (id) => {
    storageService.toggleHistoryFavorite(id);
    get().loadHistory();
  },

  clearHistory: () => {
    storageService.clearHistory();
    set({ history: [] });
  },

  clearAllData: () => {
    const defaultSettings = {
      ttsEnabled: true,
      autoSpeak: true,
      language: 'id-ID',
      ttsVoice: '',
      ttsSpeed: 1,
      ttsVolume: 1,
      securityEnabled: false
    };
    set({ 
      settings: defaultSettings,
      history: [],
      emoneyCache: {}
    });
    storageService.clearAllData();
  },

  formatReadableText: (data: any, type: string): string => {
    if (type === 'emoney') {
      return `Kartu e-money terdeteksi. ID: ${data.cardId}. Saldo: ${data.balance} ${data.currency}.`;
    } else if (type === 'tag') {
      return `Tag NFC terdeteksi. Tipe: ${data.type}. Data: ${data.text || 'Tidak ada teks'}.`;
    } else {
      return `Data NFC mentah terdeteksi. ${data.records?.length || 0} record ditemukan.`;
    }
  },

  loadEMoneyCache: () => {
    const emoneyCache = storageService.getEMoneyCache();
    set({ emoneyCache });
  },

  updateEMoneyCache: (cardId, data) => {
    storageService.updateEMoneyCache(cardId, data);
    get().loadEMoneyCache();
  },

  removeFromEMoneyCache: (cardId) => {
    storageService.removeEMoneyFromCache(cardId);
    get().loadEMoneyCache();
  },

  clearEMoneyCache: () => {
    storageService.clearEMoneyCache();
    set({ emoneyCache: {} });
  },

  initializeApp: () => {
    get().loadSettings();
    get().loadHistory();
    get().loadEMoneyCache();
  },

  resetApp: () => {
    set({
      nfcStatus: 'idle',
      scanResult: null,
      error: null
    });
  },

  loadData: () => {
    get().loadSettings();
    get().loadHistory();
    get().loadEMoneyCache();
  }
}));