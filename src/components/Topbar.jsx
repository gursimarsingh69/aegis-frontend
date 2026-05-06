export default function Topbar({ title, onNavigate }) {
  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>

      <div className="topbar-search">
        <span className="topbar-search-icon">🔍</span>
        <input placeholder="Search assets, infringements, scans..." />
      </div>

      <div className="topbar-actions">
        <button className="btn-quick-scan" onClick={() => onNavigate('scan')}>
          🔬 Quick Scan
        </button>
        <button className="icon-btn" title="Notifications">🔔</button>
        <button className="icon-btn" title="Settings">⚙️</button>
        <div className="avatar" title="Profile">A</div>
      </div>
    </header>
  );
}
