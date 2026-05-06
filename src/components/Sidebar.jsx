import { useState, useEffect } from 'react';
import { getStatus } from '../api';

export default function Sidebar({ activePage, onNavigate }) {
  const [online, setOnline] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const check = async () => {
      try { await getStatus(); setOnline(true); }
      catch { setOnline(false); }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const go = (id) => { onNavigate(id); setMobileOpen(false); };

  const links = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'assets',    icon: '🗂️', label: 'Asset Library' },
    { id: 'scan',      icon: '🔍', label: 'Manual Scan' },
    { id: 'feed',      icon: '🚨', label: 'Infringement Feed' },
  ];

  return (
    <>
      {/* Mobile top bar */}
      <header className="mobile-header">
        <div className="brand-icon" style={{ width:32, height:32, fontSize:15 }}>🛡️</div>
        <span className="brand-text">AEGIS</span>
        <button className="hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
          <span className={`ham-bar ${mobileOpen ? 'open' : ''}`} />
          <span className={`ham-bar ${mobileOpen ? 'open' : ''}`} />
          <span className={`ham-bar ${mobileOpen ? 'open' : ''}`} />
        </button>
      </header>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <nav className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">🛡️</div>
          <span className="brand-text">AEGIS</span>
        </div>

        <ul className="nav-links">
          {links.map(l => (
            <li key={l.id}>
              <a className={`nav-link ${activePage === l.id ? 'active' : ''}`} onClick={() => go(l.id)}>
                <span className="nav-icon">{l.icon}</span>
                <span className="nav-label">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="sidebar-status">
          <div className={`status-dot ${online === true ? 'online' : online === false ? 'offline' : ''}`} />
          <span>{online === true ? 'Engine Online' : online === false ? 'Engine Offline' : 'Checking…'}</span>
        </div>
      </nav>
    </>
  );
}
