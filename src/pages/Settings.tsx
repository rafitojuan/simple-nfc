import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Volume2, Shield, Download, Upload, Trash2, Save, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ttsService } from '../services/ttsService';
import { storageService } from '../services/storageService';

const Settings: React.FC = () => {
  const { settings, updateSettings, clearAllData } = useAppStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showPin, setShowPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testSpeech, setTestSpeech] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = ttsService.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleTTSToggle = (enabled: boolean) => {
    updateSettings({ ttsEnabled: enabled });
    if (enabled && ttsService.isSupported()) {
      setMessage({ type: 'success', text: 'Text-to-Speech diaktifkan' });
    }
  };

  const handleVoiceChange = (voiceName: string) => {
    updateSettings({ ttsVoice: voiceName });
    setMessage({ type: 'success', text: 'Suara berhasil diubah' });
  };

  const handleSpeedChange = (speed: number) => {
    updateSettings({ ttsSpeed: speed });
  };

  const handleVolumeChange = (volume: number) => {
    updateSettings({ ttsVolume: volume });
  };

  const handleAutoSpeakToggle = (enabled: boolean) => {
    updateSettings({ autoSpeak: enabled });
  };

  const handleSecurityToggle = (enabled: boolean) => {
    if (!enabled) {
      updateSettings({ securityEnabled: false, securityPin: '' });
      setMessage({ type: 'success', text: 'Keamanan dinonaktifkan' });
    } else {
      updateSettings({ securityEnabled: true });
    }
  };

  const handlePinSave = () => {
    if (newPin.length < 4) {
      setMessage({ type: 'error', text: 'PIN minimal 4 digit' });
      return;
    }
    
    if (newPin !== confirmPin) {
      setMessage({ type: 'error', text: 'Konfirmasi PIN tidak cocok' });
      return;
    }

    updateSettings({ securityPin: newPin });
    setNewPin('');
    setConfirmPin('');
    setMessage({ type: 'success', text: 'PIN keamanan berhasil disimpan' });
  };

  const testTTS = () => {
    if (settings.ttsEnabled) {
      setTestSpeech(true);
      ttsService.speak('Ini adalah tes suara text-to-speech. Pengaturan suara berhasil.');
      setTimeout(() => setTestSpeech(false), 3000);
    }
  };

  const exportData = () => {
    try {
      const data = storageService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nfc-reader-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Data berhasil diekspor' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal mengekspor data' });
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        storageService.importData(data);
        window.location.reload();
      } catch (error) {
        setMessage({ type: 'error', text: 'File tidak valid atau rusak' });
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    clearAllData();
    setShowConfirmClear(false);
    setMessage({ type: 'success', text: 'Semua data berhasil dihapus' });
  };

  return (
    <div className="space-y-6">
      <div className="glass-card">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan</h1>
      </div>

      <div className="glass-card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Volume2 className="w-5 h-5" />
          <span>Text-to-Speech</span>
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Aktifkan TTS</h3>
              <p className="text-sm text-gray-600">Bacakan hasil scan secara otomatis</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.ttsEnabled}
                onChange={(e) => handleTTSToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.ttsEnabled && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Bicara Otomatis</h3>
                  <p className="text-sm text-gray-600">Langsung bicara saat scan berhasil</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSpeak}
                    onChange={(e) => handleAutoSpeakToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Suara
                </label>
                <select
                  value={settings.ttsVoice}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="w-full px-3 py-2 glass border-0 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kecepatan Bicara: {settings.ttsSpeed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.ttsSpeed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume: {Math.round(settings.ttsVolume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.ttsVolume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button
                onClick={testTTS}
                disabled={testSpeech}
                className={`glass-button bg-blue-100/50 text-blue-600 font-medium py-2 px-4 w-full ${
                  testSpeech ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {testSpeech ? 'Sedang Tes...' : 'Tes Suara'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="glass-card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Keamanan</span>
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Aktifkan Keamanan</h3>
              <p className="text-sm text-gray-600">Lindungi modifikasi saldo dengan PIN</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.securityEnabled}
                onChange={(e) => handleSecurityToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.securityEnabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Keamanan Baru
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3 py-2 pr-10 glass border-0 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                    placeholder="Masukkan PIN (min. 4 digit)"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi PIN
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full px-3 py-2 glass border-0 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                  placeholder="Konfirmasi PIN"
                  maxLength={6}
                />
              </div>
              
              <button
                onClick={handlePinSave}
                disabled={!newPin || !confirmPin}
                className="glass-button bg-green-100/50 text-green-600 font-medium py-2 px-4 w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan PIN</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Data & Backup</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={exportData}
              className="glass-button bg-blue-100/50 text-blue-600 font-medium py-3 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Data</span>
            </button>
            
            <label className="glass-button bg-green-100/50 text-green-600 font-medium py-3 flex items-center justify-center space-x-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Impor Data</span>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
          
          <button
            onClick={() => setShowConfirmClear(true)}
            className="glass-button bg-red-100/50 text-red-600 font-medium py-3 w-full flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Semua Data</span>
          </button>
        </div>
      </div>

      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-sm w-full">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Hapus Semua Data?
              </h3>
              <p className="text-gray-600 mb-6">
                Semua riwayat, kartu e-money, dan pengaturan akan dihapus. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleClearAllData}
                  className="flex-1 glass-button bg-red-100/50 text-red-600 font-semibold py-3"
                >
                  Hapus Semua
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1 glass-button bg-gray-100/50 text-gray-600 font-semibold py-3"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 glass-card px-4 py-2 ${
          message.type === 'success' ? 'bg-green-100/80 text-green-800' : 'bg-red-100/80 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;