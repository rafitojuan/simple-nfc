import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Scan, History, CreditCard, Settings, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const Layout: React.FC = () => {
  const location = useLocation();
  const { isNFCSupported } = useAppStore();

  const navItems = [
    { path: '/', icon: Home, label: 'Beranda' },
    { path: '/scan', icon: Scan, label: 'Scan NFC' },
    { path: '/history', icon: History, label: 'Riwayat' },
    { path: '/emoney', icon: CreditCard, label: 'E-Money' },
    { path: '/settings', icon: Settings, label: 'Pengaturan' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-pastel-purple to-pastel-green">
      <header className="glass-card mx-4 mt-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <Scan className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">NFC Reader</h1>
              <p className="text-sm text-gray-600">Simple & Intuitive</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isNFCSupported ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-xs font-medium">NFC Ready</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-500">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs font-medium">No NFC</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass backdrop-blur-lg border-t border-white/20">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white/30 text-blue-600 scale-105'
                    : 'text-gray-600 hover:text-blue-500 hover:bg-white/20'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse-slow' : ''}`} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;