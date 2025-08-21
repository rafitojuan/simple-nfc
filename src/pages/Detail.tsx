import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, Heart, Volume2, VolumeX, CreditCard, Tag, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ttsService } from '../services/ttsService';

const Detail: React.FC = () => {
  const navigate = useNavigate();
  const { scanResult, settings, toggleHistoryFavorite } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!scanResult) {
      navigate('/scan');
      return;
    }

    if (settings.ttsEnabled && settings.autoSpeak) {
      speakResult();
    }
  }, [scanResult, settings, navigate]);

  useEffect(() => {
    const checkSpeaking = () => {
      setIsSpeaking(ttsService.isSpeaking());
    };

    const interval = setInterval(checkSpeaking, 500);
    return () => clearInterval(interval);
  }, []);

  if (!scanResult) {
    return null;
  }

  const speakResult = () => {
    if (scanResult.success) {
      ttsService.speakNFCData(scanResult.data, scanResult.type);
    }
  };

  const stopSpeaking = () => {
    ttsService.stop();
    setIsSpeaking(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareResult = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hasil Scan NFC',
          text: getShareText(),
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      copyToClipboard(getShareText());
    }
  };

  const getShareText = (): string => {
    if (!scanResult.success) return 'Scan NFC gagal';
    
    switch (scanResult.type) {
      case 'emoney':
        return `Kartu E-Money: ${scanResult.data.cardType}\nSaldo: ${new Intl.NumberFormat('id-ID').format(scanResult.data.balance)} ${scanResult.data.currency}`;
      case 'tag':
        return `NFC Tag: ${scanResult.data.data}`;
      case 'raw':
        return `Data NFC: ${JSON.stringify(scanResult.data, null, 2)}`;
      default:
        return 'Data NFC terdeteksi';
    }
  };

  const getTypeIcon = () => {
    switch (scanResult.type) {
      case 'emoney':
        return CreditCard;
      case 'tag':
        return Tag;
      case 'raw':
        return Database;
      default:
        return Tag;
    }
  };

  const getTypeColor = () => {
    switch (scanResult.type) {
      case 'emoney':
        return 'from-green-400 to-green-600';
      case 'tag':
        return 'from-blue-400 to-blue-600';
      case 'raw':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getTypeLabel = () => {
    switch (scanResult.type) {
      case 'emoney':
        return 'Kartu E-Money';
      case 'tag':
        return 'NFC Tag';
      case 'raw':
        return 'Data NFC Mentah';
      default:
        return 'Data NFC';
    }
  };

  const TypeIcon = getTypeIcon();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="glass-button flex items-center space-x-2 text-gray-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        
        <div className="flex items-center space-x-2">
          {settings.ttsEnabled && (
            <button
              onClick={isSpeaking ? stopSpeaking : speakResult}
              className={`glass-button p-2 ${
                isSpeaking ? 'text-red-600' : 'text-blue-600'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          )}
          
          <button
            onClick={shareResult}
            className="glass-button p-2 text-gray-600"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {scanResult.success ? (
        <>
          <div className="glass-card text-center">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${getTypeColor()} flex items-center justify-center animate-float`}>
              <TypeIcon className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {getTypeLabel()}
            </h2>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-medium">Scan Berhasil</span>
            </div>
          </div>

          {scanResult.type === 'emoney' && (
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Kartu</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Jenis Kartu:</span>
                  <span className="font-semibold text-gray-800">{scanResult.data.cardType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ID Kartu:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm text-gray-800">{scanResult.data.cardId}</span>
                    <button
                      onClick={() => copyToClipboard(scanResult.data.cardId)}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Saldo:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('id-ID').format(scanResult.data.balance)} {scanResult.data.currency}
                  </span>
                </div>
                {scanResult.data.lastTransaction && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Terakhir Dibaca:</span>
                    <span className="text-sm text-gray-800">
                      {new Date(scanResult.data.lastTransaction).toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {scanResult.type === 'tag' && (
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Tag</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-600 block mb-1">Tipe Record:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {scanResult.data.recordType}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Konten:</span>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-800 break-all">{scanResult.data.data}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(scanResult.data.data)}
                    className="mt-2 glass-button text-sm flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Salin</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {scanResult.type === 'raw' && (
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Mentah</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-600 block mb-1">Jumlah Records:</span>
                  <span className="font-semibold text-gray-800">{scanResult.data.records}</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Data JSON:</span>
                  <div className="bg-gray-50 p-3 rounded-lg overflow-x-auto">
                    <pre className="text-xs text-gray-800">
                      {JSON.stringify(scanResult.data, null, 2)}
                    </pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(scanResult.data, null, 2))}
                    className="mt-2 glass-button text-sm flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Salin JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/scan')}
              className="flex-1 glass-button bg-blue-100/50 text-blue-600 font-semibold py-3"
            >
              Scan Lagi
            </button>
            <button
              onClick={() => navigate('/history')}
              className="flex-1 glass-button bg-purple-100/50 text-purple-600 font-semibold py-3"
            >
              Lihat Riwayat
            </button>
          </div>
        </>
      ) : (
        <div className="glass-card text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Scan Gagal</h2>
          
          <p className="text-gray-600 mb-6">
            {scanResult.error || 'Terjadi kesalahan saat membaca NFC'}
          </p>
          
          <button
            onClick={() => navigate('/scan')}
            className="glass-button bg-blue-100/50 text-blue-600 font-semibold py-3 px-6"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {copied && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 glass-card bg-green-100/80 text-green-800 px-4 py-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Disalin ke clipboard</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;