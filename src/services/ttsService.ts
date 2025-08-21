import { SpeechConfig, TTSService } from '../types/nfc';

class TextToSpeechService implements TTSService {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private defaultConfig: SpeechConfig = {
    rate: 1,
    pitch: 1,
    volume: 0.8,
    lang: 'id-ID'
  };

  constructor() {
    this.synth = window.speechSynthesis;
  }

  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }

  public getIndonesianVoices(): SpeechSynthesisVoice[] {
    return this.getVoices().filter(voice => 
      voice.lang.startsWith('id') || voice.lang.startsWith('ID')
    );
  }

  public speak(text: string, config?: Partial<SpeechConfig>): void {
    if (!this.isSupported()) {
      console.warn('Text-to-Speech tidak didukung pada browser ini');
      return;
    }

    this.stop();

    const finalConfig = { ...this.defaultConfig, ...config };
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = finalConfig.rate;
    utterance.pitch = finalConfig.pitch;
    utterance.volume = finalConfig.volume;
    utterance.lang = finalConfig.lang;

    if (finalConfig.voice) {
      utterance.voice = finalConfig.voice;
    } else {
      const indonesianVoices = this.getIndonesianVoices();
      if (indonesianVoices.length > 0) {
        utterance.voice = indonesianVoices[0];
      }
    }

    utterance.onstart = () => {
      console.log('TTS dimulai:', text);
    };

    utterance.onend = () => {
      console.log('TTS selesai');
      this.currentUtterance = null;
    };

    utterance.onerror = (event) => {
      console.error('TTS error:', event.error);
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  public pause(): void {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  public isSpeaking(): boolean {
    return this.synth.speaking;
  }

  public isPaused(): boolean {
    return this.synth.paused;
  }

  public speakNFCData(data: any, type: 'emoney' | 'tag' | 'raw'): void {
    let text = '';

    switch (type) {
      case 'emoney':
        text = this.formatEMoneyText(data);
        break;
      case 'tag':
        text = this.formatTagText(data);
        break;
      case 'raw':
        text = this.formatRawText(data);
        break;
      default:
        text = 'Data NFC terdeteksi';
    }

    this.speak(text);
  }

  private formatEMoneyText(data: any): string {
    const { cardType, balance, currency } = data;
    const formattedBalance = new Intl.NumberFormat('id-ID').format(balance);
    
    return `Kartu ${cardType || 'e-money'} terdeteksi. Saldo ${formattedBalance} ${currency || 'rupiah'}.`;
  }

  private formatTagText(data: any): string {
    const { recordType, data: content } = data;
    
    if (recordType === 'url') {
      return `Tag NFC berisi URL: ${content}`;
    } else if (recordType === 'text') {
      return `Tag NFC berisi teks: ${content}`;
    } else {
      return `Tag NFC dengan tipe ${recordType} terdeteksi`;
    }
  }

  private formatRawText(data: any): string {
    const { records } = data;
    return `Data NFC mentah terdeteksi dengan ${records || 1} record.`;
  }

  public setDefaultConfig(config: Partial<SpeechConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  public getDefaultConfig(): SpeechConfig {
    return { ...this.defaultConfig };
  }
}

export const ttsService = new TextToSpeechService();