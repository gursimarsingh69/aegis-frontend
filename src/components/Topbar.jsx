import { useState, useRef, useEffect } from 'react';

export default function Topbar({ title, onNavigate, theme, setTheme }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dropRef = useRef();

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setSettingsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-brand">🛡️</div>
      <span className="topbar-title">{title}</span>

      <div className="topbar-search">
        <span className="topbar-search-icon">🔍</span>
        <input placeholder="Search resources..." />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" title="Notifications" onClick={() => onNavigate('profile')}>🔔</button>

        <div style={{ position: 'relative' }} ref={dropRef}>
          <button className="icon-btn" title="Settings" onClick={() => setSettingsOpen(o => !o)}>⚙️</button>
          {settingsOpen && (
            <div className="settings-dropdown">
              <div className="settings-dropdown-title">Theme</div>
              <label className="theme-option">
                <input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} />
                🌙 Dark Mode
              </label>
              <label className="theme-option">
                <input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => setTheme('light')} />
                ☀️ Light Mode
              </label>
            </div>
          )}
        </div>

        <div className="avatar" title="Profile" onClick={() => onNavigate('profile')}>A</div>
      </div>
    </header>
  );
}
