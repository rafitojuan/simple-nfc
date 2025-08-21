import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Minus, Edit3, Save, X, AlertTriangle, CheckCircle, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { EMoney as EMoneyType } from '../types/nfc';

const EMoney: React.FC = () => {
  const { emoneyCache, settings, updateEMoneyCache, removeFromEMoneyCache } = useAppStore();
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState<number>(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<EMoneyType | null>(null);
  const [showBalances, setShowBalances] = useState<Record<string, boolean>>({});
  const [securityPin, setSecurityPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [error, setError] = useState('');

  const cards = Object.entries(emoneyCache).map(([cardId, data]) => ({
    cardId,
    ...data
  } as EMoneyType));

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleEditBalance = (card: EMoneyType) => {
    if (!settings.securityEnabled) {
      startEdit(card);
      return;
    }

    setSelectedCard(card);
    setShowPinInput(true);
  };

  const verifyPin = () => {
    if (securityPin === settings.securityPin) {
      setShowPinInput(false);
      setSecurityPin('');
      if (selectedCard) {
        startEdit(selectedCard);
      }
    } else {
      setError('PIN keamanan salah');
      setSecurityPin('');
    }
  };

  const startEdit = (card: EMoneyType) => {
    setEditingCard(card.cardId);
    setNewBalance(card.balance);
  };

  const saveBalance = () => {
    if (editingCard && newBalance >= 0) {
      const existingCard = cards.find(c => c.cardId === editingCard);
      if (existingCard) {
        updateEMoneyCache(editingCard, {
          ...existingCard,
          balance: newBalance
        });
      }
      setEditingCard(null);
      setNewBalance(0);
    }
  };

  const cancelEdit = () => {
    setEditingCard(null);
    setNewBalance(0);
  };

  const handleDeleteCard = (card: EMoneyType) => {
    setSelectedCard(card);
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (selectedCard) {
      removeFromEMoneyCache(selectedCard.cardId);
      setShowConfirmDialog(false);
      setSelectedCard(null);
    }
  };

  const toggleBalanceVisibility = (cardId: string) => {
    setShowBalances(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const formatBalance = (balance: number, currency: string, cardId: string) => {
    if (showBalances[cardId]) {
      return `${new Intl.NumberFormat('id-ID').format(balance)} ${currency}`;
    }
    return '••••••';
  };

  const getCardTypeColor = (cardType: string) => {
    const type = cardType.toLowerCase();
    if (type.includes('bca')) return 'from-blue-500 to-blue-700';
    if (type.includes('mandiri')) return 'from-yellow-500 to-orange-600';
    if (type.includes('bni')) return 'from-orange-500 to-red-600';
    if (type.includes('bri')) return 'from-blue-600 to-indigo-700';
    if (type.includes('flazz')) return 'from-red-500 to-pink-600';
    if (type.includes('tapcash')) return 'from-green-500 to-teal-600';
    if (type.includes('jakcard')) return 'from-purple-500 to-indigo-600';
    return 'from-gray-500 to-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Kartu E-Money</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{cards.length} kartu</span>
          </div>
        </div>

        {settings.securityEnabled && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                Keamanan Aktif - PIN diperlukan untuk modifikasi saldo
              </span>
            </div>
          </div>
        )}
      </div>

      {cards.length === 0 ? (
        <div className="glass-card text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Belum Ada Kartu E-Money
          </h3>
          <p className="text-gray-600 mb-6">
            Scan kartu e-money untuk menambahkannya ke daftar
          </p>
          <button
            onClick={() => window.location.href = '/scan'}
            className="glass-button bg-blue-100/50 text-blue-600 font-semibold py-2 px-6"
          >
            Scan Kartu E-Money
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <div key={card.cardId} className="glass-card">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getCardTypeColor(card.cardType)} flex items-center justify-center flex-shrink-0`}>
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {card.cardType}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleBalanceVisibility(card.cardId)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                      >
                        {showBalances[card.cardId] ? (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 font-mono mb-3">
                    {card.cardId}
                  </p>
                  
                  {editingCard === card.cardId ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={newBalance}
                          onChange={(e) => setNewBalance(Number(e.target.value))}
                          className="flex-1 px-3 py-2 glass border-0 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                          placeholder="Saldo baru"
                          min="0"
                        />
                        <span className="text-sm text-gray-600">{card.currency}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={saveBalance}
                          className="flex-1 glass-button bg-green-100/50 text-green-600 font-medium py-2 flex items-center justify-center space-x-1"
                        >
                          <Save className="w-4 h-4" />
                          <span>Simpan</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 glass-button bg-red-100/50 text-red-600 font-medium py-2 flex items-center justify-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Batal</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-800">
                          {formatBalance(card.balance, card.currency, card.cardId)}
                        </span>
                        {card.lastTransaction && (
                          <p className="text-xs text-gray-500 mt-1">
                            Terakhir: {new Date(card.lastTransaction).toLocaleString('id-ID')}
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleEditBalance(card)}
                        className="glass-button bg-blue-100/50 text-blue-600 p-2"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPinInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Masukkan PIN Keamanan
            </h3>
            <input
              type="password"
              value={securityPin}
              onChange={(e) => setSecurityPin(e.target.value)}
              className="w-full px-4 py-3 glass border-0 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:outline-none mb-4"
              placeholder="PIN Keamanan"
              maxLength={6}
            />
            <div className="flex space-x-3">
              <button
                onClick={verifyPin}
                disabled={securityPin.length === 0}
                className="flex-1 glass-button bg-blue-100/50 text-blue-600 font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verifikasi
              </button>
              <button
                onClick={() => {
                  setShowPinInput(false);
                  setSecurityPin('');
                  setSelectedCard(null);
                }}
                className="flex-1 glass-button bg-gray-100/50 text-gray-600 font-semibold py-3"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDialog && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-sm w-full">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Hapus Kartu?
              </h3>
              <p className="text-gray-600 mb-6">
                Kartu {selectedCard.cardType} akan dihapus dari daftar. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 glass-button bg-red-100/50 text-red-600 font-semibold py-3"
                >
                  Hapus
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setSelectedCard(null);
                  }}
                  className="flex-1 glass-button bg-gray-100/50 text-gray-600 font-semibold py-3"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 glass-card bg-red-100/80 text-red-800 px-4 py-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EMoney;