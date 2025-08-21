import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import Layout from './components/Layout';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Detail from './pages/Detail';
import History from './pages/History';
import EMoney from './pages/EMoney';
import Settings from './pages/Settings';

function App() {
  const { loadData } = useAppStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="scan" element={<Scanner />} />
          <Route path="detail" element={<Detail />} />
          <Route path="history" element={<History />} />
          <Route path="emoney" element={<EMoney />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
