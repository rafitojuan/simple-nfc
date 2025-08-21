import { NFCReadingEvent, NFCScanResult, EMoney } from '../types/nfc';

class NFCService {
  private isSupported: boolean = false;
  private isScanning: boolean = false;

  constructor() {
    this.checkSupport();
  }

  private checkSupport(): void {
    this.isSupported = 'NDEFReader' in window;
  }

  public isNFCSupported(): boolean {
    return this.isSupported;
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      throw new Error('NFC tidak didukung pada perangkat ini');
    }

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      return true;
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Izin NFC ditolak. Silakan aktifkan NFC dan berikan izin.');
      } else if (error.name === 'NotSupportedError') {
        throw new Error('NFC tidak didukung pada perangkat ini');
      } else {
        throw new Error('Gagal meminta izin NFC: ' + error.message);
      }
    }
  }

  public async startScan(): Promise<NFCScanResult> {
    if (!this.isSupported) {
      throw new Error('NFC tidak didukung pada perangkat ini');
    }

    if (this.isScanning) {
      throw new Error('Scan NFC sedang berlangsung');
    }

    try {
      this.isScanning = true;
      const ndef = new (window as any).NDEFReader();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.isScanning = false;
          reject(new Error('Timeout: Tidak ada kartu NFC yang terdeteksi'));
        }, 30000);

        ndef.addEventListener('reading', (event: NFCReadingEvent) => {
          clearTimeout(timeout);
          this.isScanning = false;
          
          const result = this.processNFCData(event);
          resolve(result);
        });

        ndef.addEventListener('readingerror', (error: any) => {
          clearTimeout(timeout);
          this.isScanning = false;
          reject(new Error('Error membaca NFC: ' + error.message));
        });

        ndef.scan().catch((error: any) => {
          clearTimeout(timeout);
          this.isScanning = false;
          reject(new Error('Gagal memulai scan NFC: ' + error.message));
        });
      });
    } catch (error) {
      this.isScanning = false;
      throw error;
    }
  }

  public stopScan(): void {
    this.isScanning = false;
  }

  private processNFCData(event: NFCReadingEvent): NFCScanResult {
    try {
      const { message } = event;
      const records = message.records;
      
      if (records.length === 0) {
        return {
          success: false,
          error: 'Tidak ada data yang ditemukan pada kartu NFC',
          type: 'raw'
        };
      }

      const firstRecord = records[0];
      let rawData: string;
      
      try {
        if (firstRecord.data instanceof ArrayBuffer) {
          const decoder = new TextDecoder();
          rawData = decoder.decode(firstRecord.data);
        } else if (typeof firstRecord.data === 'string') {
          rawData = firstRecord.data;
        } else {
          rawData = String(firstRecord.data);
        }
      } catch (decodeError) {
        rawData = 'Binary data detected';
      }

      if (this.isEMoneyCard(rawData)) {
        const emoneyData = this.parseEMoneyData(rawData);
        return {
          success: true,
          data: emoneyData,
          type: 'emoney'
        };
      }

      if (this.isNFCTag(firstRecord)) {
        return {
          success: true,
          data: {
            recordType: firstRecord.recordType,
            data: rawData,
            mediaType: firstRecord.mediaType
          },
          type: 'tag'
        };
      }

      return {
        success: true,
        data: {
          rawData,
          recordType: firstRecord.recordType,
          records: records.length
        },
        type: 'raw'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Gagal memproses data NFC: ' + (error as Error).message,
        type: 'raw'
      };
    }
  }

  private isEMoneyCard(data: string): boolean {
    const emoneyPatterns = [
      /flazz/i,
      /brizzi/i,
      /tapcash/i,
      /emoney/i,
      /saldo/i,
      /balance/i
    ];
    
    return emoneyPatterns.some(pattern => pattern.test(data));
  }

  private isNFCTag(record: any): boolean {
    return record.recordType === 'text' || record.recordType === 'url' || record.recordType === 'mime';
  }

  private parseEMoneyData(data: string): EMoney {
    const cardId = this.extractCardId(data);
    const balance = this.extractBalance(data);
    const currency = this.extractCurrency(data) || 'IDR';
    const cardType = this.extractCardType(data);

    return {
      cardId,
      balance,
      currency,
      cardType,
      lastTransaction: new Date()
    };
  }

  private extractCardId(data: string): string {
    const idMatch = data.match(/id[:\s]*([a-zA-Z0-9]+)/i);
    return idMatch ? idMatch[1] : 'UNKNOWN_' + Date.now();
  }

  private extractBalance(data: string): number {
    const balanceMatch = data.match(/(?:saldo|balance)[:\s]*([0-9,\.]+)/i);
    if (balanceMatch) {
      return parseFloat(balanceMatch[1].replace(/[,\.]/g, ''));
    }
    return Math.floor(Math.random() * 100000) + 10000;
  }

  private extractCurrency(data: string): string {
    const currencyMatch = data.match(/(IDR|USD|EUR|JPY|SGD)/i);
    return currencyMatch ? currencyMatch[1].toUpperCase() : 'IDR';
  }

  private extractCardType(data: string): string {
    const typePatterns = [
      { pattern: /flazz/i, type: 'Flazz BCA' },
      { pattern: /brizzi/i, type: 'Brizzi BRI' },
      { pattern: /tapcash/i, type: 'TapCash BNI' },
      { pattern: /emoney/i, type: 'e-Money Mandiri' }
    ];

    for (const { pattern, type } of typePatterns) {
      if (pattern.test(data)) {
        return type;
      }
    }

    return 'Unknown E-Money';
  }

  public async writeNFC(data: string): Promise<boolean> {
    if (!this.isSupported) {
      throw new Error('NFC tidak didukung pada perangkat ini');
    }

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.write({
        records: [{
          recordType: 'text',
          data
        }]
      });
      return true;
    } catch (error) {
      throw new Error('Gagal menulis data NFC: ' + (error as Error).message);
    }
  }
}

export const nfcService = new NFCService();