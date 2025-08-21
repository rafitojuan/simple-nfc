import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, Loader2, AlertCircle, CheckCircle, Smartphone, Wifi, Volume2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { nfcService } from '../services/nfcService';
import { NFCStatus } from '../types/nfc';

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const { 
    nfcStatus, 
    isNFCSupported, 
    setNFCStatus, 
    setScanResult, 
    setError,
    settings 
  } = useAppStore();
  
  const [scanMessage, setScanMessage] = useState('Tekan tombol untuk memulai scan');

  const startScan = async () => {
    if (!isNFCSupported) {
      setError('NFC tidak didukung pada perangkat ini');
      return;
    }

    try {
      setNFCStatus('scanning');
      setError(null);
      setScanMessage('Dekatkan kartu NFC ke perangkat...');
      
      const result = await nfcService.startScan();
      
      setNFCStatus('success');
      setScanResult(result);
      setScanMessage('Scan berhasil!');
      
      setTimeout(() => {
        navigate('/detail');
        setTimeout(() => {
          setNFCStatus('idle');
          setScanMessage('Tekan tombol untuk memulai scan');
        }, 100);
      }, 1500);
      
    } catch (error) {
      setNFCStatus('error');
      setError((error as Error).message);
      setScanMessage('Scan gagal. Coba lagi.');
      
      setTimeout(() => {
        setNFCStatus('idle');
        setScanMessage('Tekan tombol untuk memulai scan');
      }, 3000);
    }
  };

  const stopScan = () => {
    nfcService.stopScan();
    setNFCStatus('idle');
    setScanMessage('Scan dibatalkan');
    
    setTimeout(() => {
      setScanMessage('Tekan tombol untuk memulai scan');
    }, 2000);
  };

  const getScanButtonContent = () => {
    switch (nfcStatus) {
      case 'scanning':
        return (
          <>
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-lg font-semibold">Scanning...</span>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-8 h-8" />
            <span className="text-lg font-semibold">Berhasil!</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-8 h-8" />
            <span className="text-lg font-semibold">Error</span>
          </>
        );
      default:
        return (
          <>
            <Scan className="w-8 h-8" />
            <span className="text-lg font-semibold">Mulai Scan</span>
          </>
        );
    }
  };

  const getScanButtonColor = () => {
    switch (nfcStatus) {
      case 'scanning':
        return 'from-blue-400 to-blue-600';
      case 'success':
        return 'from-green-400 to-green-600';
      case 'error':
        return 'from-red-400 to-red-600';
      default:
        return 'from-purple-400 to-purple-600';
    }
  };

  if (!isNFCSupported) {
    return (
      <div className="space-y-6">
        <div className="glass-card text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
            <Wifi className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">NFC Tidak Didukung</h2>
          <p className="text-gray-600 mb-4">
            Perangkat Anda tidak mendukung teknologi NFC atau fitur NFC tidak diaktifkan.
          </p>
          <div className="glass rounded-xl p-4 bg-red-50/50">
            <h3 className="font-semibold text-red-800 mb-2">Cara Mengaktifkan NFC:</h3>
            <ul className="text-sm text-red-700 space-y-1 text-left">
              <li>• Buka Pengaturan perangkat</li>
              <li>• Cari menu "NFC" atau "Koneksi"</li>
              <li>• Aktifkan fitur NFC</li>
              <li>• Restart aplikasi browser</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Scanner NFC</h2>
        <p className="text-gray-600 mb-6">
          Scan kartu e-money, tag NFC, atau data NFC lainnya
        </p>

        <div className="relative mb-8">
          <div className={`nfc-scan-area mx-auto ${
            nfcStatus === 'scanning' ? 'animate-scan' : ''
          }`}>
            {nfcStatus === 'scanning' && (
              <div className="nfc-scan-pulse"></div>
            )}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className={`text-lg font-medium ${
            nfcStatus === 'error' ? 'text-red-600' :
            nfcStatus === 'success' ? 'text-green-600' :
            nfcStatus === 'scanning' ? 'text-blue-600' :
            'text-gray-700'
          }`}>
            {scanMessage}
          </p>
        </div>

        <div className="space-y-4">
          {nfcStatus === 'scanning' ? (
            <button
              onClick={stopScan}
              className="w-full glass-button bg-red-100/50 text-red-600 font-semibold py-4 px-6 text-lg"
            >
              Batalkan Scan
            </button>
          ) : (
            <button
              onClick={startScan}
              disabled={nfcStatus === ('scanning' as NFCStatus) || nfcStatus === ('success' as NFCStatus)}
              className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${
                getScanButtonColor()
              } hover:scale-105 active:scale-95`}
            >
              {getScanButtonContent()}
            </button>
          )}
        </div>
      </div>

      <div className="glass-card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tips Scanning</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
            <p>Pastikan NFC diaktifkan pada perangkat Anda</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
            <p>Dekatkan kartu NFC ke bagian belakang perangkat</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-purple-400 mt-2"></div>
            <p>Tahan kartu selama beberapa detik hingga terdeteksi</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-pink-400 mt-2"></div>
            <p>Jangan gerakkan kartu saat proses scanning</p>
          </div>
        </div>
      </div>

      {settings.ttsEnabled && (
        <div className="glass-card bg-blue-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">Text-to-Speech Aktif</h4>
              <p className="text-sm text-blue-600">
                Hasil scan akan dibacakan secara otomatis
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;