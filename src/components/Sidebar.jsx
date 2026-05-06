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
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'assets',    icon: '🗂',  label: 'Asset Library' },
    { id: 'scan',      icon: '🔍', label: 'Manual Scan' },
    { id: 'feed',      icon: '🚨', label: 'Infringement Feed' },
  ];

  const statusText = online === true ? 'Engine Online' : online === false ? 'Engine Offline' : 'Checking…';

  return (
    <>
      {/* Mobile header */}
      <header className="mobile-header">
        <span style={{ fontSize: 20 }}>🛡️</span>
        <span className="mobile-header-title">AEGIS</span>
        <button className="hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
          <span className={`ham-bar ${mobileOpen ? 'open' : ''}`} />
          <span className={`ham-bar ${mobileOpen ? 'open' : ''}`} />
          <span className={`ham-bar ${mobileOpen ? 'open' : ''}`} />
        </button>
      </header>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <nav className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '20px 20px 16px',
          borderBottom: '1px solid #393939',
        }}>
          <span style={{ fontSize: 22 }}>🛡️</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: 2 }}>AEGIS</span>
        </div>

        {/* Section label */}
        <div style={{ padding: '16px 20px 4px', fontSize: 11, fontWeight: 600, color: '#6f6f6f', textTransform: 'uppercase', letterSpacing: '.8px' }}>
          Navigation
        </div>

        <ul className="nav-links">
          {links.map(l => (
            <li key={l.id}>
              <a
                className={`nav-link ${activePage === l.id ? 'active' : ''}`}
                onClick={() => go(l.id)}
                title={l.label}
              >
                <span className="nav-icon">{l.icon}</span>
                <span className="nav-label">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div style={{ margin: '8px 20px', borderTop: '1px solid #393939' }} />

        {/* Status */}
        <div className="sidebar-status">
          <div className={`status-dot ${online === true ? 'online' : online === false ? 'offline' : ''}`} />
          <span>{statusText}</span>
        </div>
      </nav>
    </>
  );
}
