import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Trash2, Heart, CreditCard, Tag, Database, Calendar, Clock } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { HistoryEntry } from '../types/nfc';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { history, clearHistory, toggleHistoryFavorite } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'emoney' | 'tag' | 'raw'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredHistory = history.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.data.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || entry.type === filterType;
    const matchesFavorites = !showFavoritesOnly || entry.favorite;
    
    return matchesSearch && matchesType && matchesFavorites;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emoney':
        return 'text-green-600 bg-green-100';
      case 'tag':
        return 'text-blue-600 bg-blue-100';
      case 'raw':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'emoney':
        return 'E-Money';
      case 'tag':
        return 'NFC Tag';
      case 'raw':
        return 'Data Mentah';
      default:
        return 'NFC';
    }
  };

  const getEntryTitle = (entry: HistoryEntry) => {
    switch (entry.type) {
      case 'emoney':
        return `${entry.data.cardType || 'Kartu E-Money'}`;
      case 'tag':
        return entry.data.data?.substring(0, 30) + (entry.data.data?.length > 30 ? '...' : '') || 'NFC Tag';
      case 'raw':
        return `Data NFC (${entry.data.records || 0} records)`;
      default:
        return 'Data NFC';
    }
  };

  const getEntrySubtitle = (entry: HistoryEntry) => {
    switch (entry.type) {
      case 'emoney':
        return `Saldo: ${new Intl.NumberFormat('id-ID').format(entry.data.balance || 0)} ${entry.data.currency || 'IDR'}`;
      case 'tag':
        return `Tipe: ${entry.data.type || 'Unknown'}`;
      case 'raw':
        return `ID: ${entry.data.cardId || 'Unknown'}`;
      default:
        return '';
    }
  };

  const handleEntryClick = (entry: HistoryEntry) => {
    navigate('/detail', { state: { scanResult: { success: true, type: entry.type, data: entry.data } } });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('id-ID', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Riwayat Scan</h1>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari riwayat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass border-0 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'glass-button text-gray-600'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('emoney')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'emoney'
                  ? 'bg-green-600 text-white'
                  : 'glass-button text-gray-600'
              }`}
            >
              E-Money
            </button>
            <button
              onClick={() => setFilterType('tag')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'tag'
                  ? 'bg-blue-600 text-white'
                  : 'glass-button text-gray-600'
              }`}
            >
              NFC Tag
            </button>
            <button
              onClick={() => setFilterType('raw')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'raw'
                  ? 'bg-purple-600 text-white'
                  : 'glass-button text-gray-600'
              }`}
            >
              Data Mentah
            </button>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                showFavoritesOnly
                  ? 'bg-pink-600 text-white'
                  : 'glass-button text-gray-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              <span>Favorit</span>
            </button>
          </div>
        </div>
      </div>

      {filteredHistory.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            {filteredHistory.length} dari {history.length} entri
          </p>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="glass-button text-red-600 flex items-center space-x-1 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Semua</span>
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="glass-card text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {history.length === 0 ? 'Belum Ada Riwayat' : 'Tidak Ada Hasil'}
            </h3>
            <p className="text-gray-600 mb-6">
              {history.length === 0
                ? 'Mulai scan NFC untuk melihat riwayat di sini'
                : 'Coba ubah filter atau kata kunci pencarian'}
            </p>
            <button
              onClick={() => navigate('/scan')}
              className="glass-button bg-blue-100/50 text-blue-600 font-semibold py-2 px-6"
            >
              {history.length === 0 ? 'Mulai Scan' : 'Scan Sekarang'}
            </button>
          </div>
        ) : (
          filteredHistory.map((entry) => {
            const TypeIcon = getTypeIcon(entry.type);
            return (
              <div
                key={entry.id}
                onClick={() => handleEntryClick(entry)}
                className="glass-card hover:bg-white/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl ${getTypeColor(entry.type)} flex items-center justify-center flex-shrink-0`}>
                    <TypeIcon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {getEntryTitle(entry)}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleHistoryFavorite(entry.id);
                        }}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            entry.favorite
                              ? 'text-pink-600 fill-current'
                              : 'text-gray-400 group-hover:text-pink-400'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {getEntrySubtitle(entry)}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}>
                        {getTypeLabel(entry.type)}
                      </span>
                      
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(entry.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredHistory.length > 0 && (
        <div className="glass-card text-center">
          <p className="text-sm text-gray-600 mb-4">
            Ingin scan lebih banyak?
          </p>
          <button
            onClick={() => navigate('/scan')}
            className="glass-button bg-blue-100/50 text-blue-600 font-semibold py-2 px-6"
          >
            Scan NFC Baru
          </button>
        </div>
      )}
    </div>
  );
};

export default History;