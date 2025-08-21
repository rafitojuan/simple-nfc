import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scan, Zap, Shield, Volume2, History, CreditCard } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const Home: React.FC = () => {
  const { isNFCSupported, settings, history, emoneyCache, initializeApp } = useAppStore();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const stats = {
    totalScans: history.length,
    emoneyCards: Object.keys(emoneyCache).length,
    favorites: history.filter(item => item.favorite).length
  };

  const features = [
    {
      icon: Scan,
      title: 'Scan NFC',
      description: 'Baca berbagai jenis kartu NFC dan tag',
      color: 'from-blue-400 to-blue-600',
      link: '/scan'
    },
    {
      icon: CreditCard,
      title: 'E-Money',
      description: 'Kelola kartu e-money dan saldo',
      color: 'from-green-400 to-green-600',
      link: '/emoney'
    },
    {
      icon: History,
      title: 'Riwayat',
      description: 'Lihat riwayat scan dan favorit',
      color: 'from-purple-400 to-purple-600',
      link: '/history'
    },
    {
      icon: Volume2,
      title: 'Text-to-Speech',
      description: 'Dengarkan hasil scan otomatis',
      color: 'from-pink-400 to-pink-600',
      link: '/settings'
    }
  ];

  return (
    <div className="space-y-6">
      <section className="glass-card text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center animate-float">
            <Scan className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Selamat Datang di NFC Reader
          </h2>
          <p className="text-gray-600 mb-4">
            Aplikasi pembaca NFC yang sederhana dan intuitif dengan desain glassmorphism modern
          </p>
        </div>

        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
            isNFCSupported 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isNFCSupported ? (
              <>
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">NFC Didukung</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">NFC Tidak Tersedia</span>
              </>
            )}
          </div>
          
          {settings.ttsEnabled && (
            <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-blue-100 text-blue-700">
              <Volume2 className="w-4 h-4" />
              <span className="text-sm font-medium">TTS Aktif</span>
            </div>
          )}
        </div>

        <Link
          to="/scan"
          className="inline-flex items-center space-x-2 glass-button text-blue-600 font-semibold px-8 py-3 text-lg"
        >
          <Scan className="w-5 h-5" />
          <span>Mulai Scan NFC</span>
        </Link>
      </section>

      <section className="glass-card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistik</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalScans}</div>
            <div className="text-sm text-gray-600">Total Scan</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.emoneyCards}</div>
            <div className="text-sm text-gray-600">Kartu E-Money</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.favorites}</div>
            <div className="text-sm text-gray-600">Favorit</div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Fitur Utama</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                to={feature.link}
                className="glass-card hover:scale-105 transition-transform duration-200 group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:animate-pulse`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {!isNFCSupported && (
        <section className="glass-card bg-yellow-50/50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Informasi NFC</h4>
              <p className="text-sm text-yellow-700">
                Perangkat Anda tidak mendukung NFC atau fitur NFC tidak diaktifkan. 
                Beberapa fitur mungkin tidak tersedia.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;