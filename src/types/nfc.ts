export interface NFCReadingEvent {
  message: {
    records: NFCRecord[];
  };
}

export interface NFCRecord {
  recordType: string;
  data: ArrayBuffer;
  id?: string;
  mediaType?: string;
}

export interface EMoney {
  cardId: string;
  balance: number;
  currency: string;
  lastTransaction?: Date;
  cardType?: string;
  nickname?: string;
}

export interface SpeechConfig {
  voice?: SpeechSynthesisVoice;
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
}

export interface TTSService {
  speak(text: string, config?: SpeechConfig): void;
  stop(): void;
  pause(): void;
  resume(): void;
}

export interface AppSettings {
  ttsEnabled: boolean;
  autoSpeak: boolean;
  language: string;
  ttsVoice: string;
  ttsSpeed: number;
  ttsVolume: number;
  securityEnabled: boolean;
  securityPin?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: 'emoney' | 'tag' | 'raw';
  data: any;
  favorite: boolean;
  readableText: string;
}

export interface EMoneyCache {
  [cardId: string]: {
    balance: number;
    currency: string;
    lastRead: number;
    cardType: string;
    nickname?: string;
  };
}

export type NFCStatus = 'idle' | 'scanning' | 'reading' | 'success' | 'error';

export interface NFCScanResult {
  success: boolean;
  data?: any;
  error?: string;
  type: 'emoney' | 'tag' | 'raw';
}