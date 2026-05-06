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
    { id: 'dashboard', icon: '⊞', title: 'Dashboard' },
    { id: 'assets',    icon: '🗂', title: 'Asset Library' },
    { id: 'scan',      icon: '🔍', title: 'Manual Scan' },
    { id: 'feed',      icon: '🚨', title: 'Infringement Feed' },
  ];

  return (
    <>
      {/* Mobile header */}
      <header className="mobile-header">
        <span style={{ fontSize:18 }}>🛡️</span>
        <span className="mobile-header-title">AEGIS</span>
        <button className="hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
          <span className={`ham-bar ${mobileOpen ? 'open' : ''}`} />
          <span className={`ham-bar ${mobileOpen ? 'open' : ''}`} />
          <span className={`ham-bar ${mobileOpen ? 'open' : ''}`} />
        </button>
      </header>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <nav className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <span style={{ fontSize:18 }}>🛡️</span>
          <span style={{ color:'#fff', fontWeight:700, letterSpacing:2 }}>AEGIS</span>
        </div>

        <ul className="nav-links">
          {links.map(l => (
            <li key={l.id}>
              <a
                className={`nav-link ${activePage === l.id ? 'active' : ''}`}
                onClick={() => go(l.id)}
                title={l.title}
              >
                <span className="nav-icon" style={{ fontSize:18 }}>{l.icon}</span>
                <span className="nav-label" style={{ marginLeft:12, fontSize:14, color:'#f4f4f4' }}>{l.title}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="sidebar-status">
          <div className={`status-dot ${online === true ? 'online' : online === false ? 'offline' : ''}`} />
        </div>
      </nav>
    </>
  );
}
