import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Scan from './pages/Scan';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import ToastContainer from './components/ToastContainer';
import { useState, useEffect } from 'react';
import './index.css';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const titles = {
    dashboard: 'Aegis Command Center',
    assets: 'Asset Library',
    scan: 'Manual Scan',
    feed: 'Infringement Feed',
    profile: 'Profile',
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard addToast={addToast} onNavigate={setPage} />;
      case 'assets':    return <Assets addToast={addToast} />;
      case 'scan':      return <Scan addToast={addToast} />;
      case 'feed':      return <Feed addToast={addToast} />;
      case 'profile':   return <Profile />;
      default:          return <Dashboard addToast={addToast} onNavigate={setPage} />;
    }
  };

  return (
    <>
      <Sidebar activePage={page} onNavigate={setPage} />
      <Topbar title={titles[page]} onNavigate={setPage} theme={theme} setTheme={setTheme} />
      <main className="main-content">
        <div className="page-inner">
          {renderPage()}
        </div>
      </main>
      <ToastContainer toasts={toasts} />
    </>
  );
}
