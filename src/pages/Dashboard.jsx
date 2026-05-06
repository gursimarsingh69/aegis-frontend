import { useState, useEffect } from 'react';
import { getStats, getHistory } from '../api';

export default function Dashboard({ onNavigate }) {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, h] = await Promise.all([getStats(), getHistory()]);
        setStatus(s.data?.data || s.data);
        const raw = h.data?.data || h.data || [];
        setHistory(Array.isArray(raw) ? raw : []);
      } catch {}
    };
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  const totalAssets  = status?.total_assets  || 0;
  const totalScans   = status?.total_scans   || 0;
  const totalMatches = status?.total_matches || 0;

  // Threat score: 0–10 scale (10 = safest when no scans done, drops with match ratio)
  const matchRatio   = totalScans > 0 ? totalMatches / totalScans : 0;
  const threatScore  = Math.max(0, Math.round(10 - matchRatio * 10));
  const threatLabel  = threatScore >= 8 ? 'SAFE' : threatScore >= 5 ? 'MODERATE' : threatScore >= 3 ? 'HIGH' : 'CRITICAL';
  const threatColor  = threatScore >= 8 ? '#22c55e' : threatScore >= 5 ? '#f59e0b' : '#ef4444';

  // SVG arc for semicircle gauge (180° arc, r=70)
  const R = 70;
  const cx = 100, cy = 90;
  const startAngle = -180, sweepAngle = 180;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcX = (a) => cx + R * Math.cos(toRad(a));
  const arcY = (a) => cy + R * Math.sin(toRad(a));
  const trackD = `M ${arcX(startAngle)} ${arcY(startAngle)} A ${R} ${R} 0 0 1 ${arcX(startAngle + sweepAngle)} ${arcY(startAngle + sweepAngle)}`;
  const fillAngle = startAngle + (sweepAngle * threatScore) / 10;
  const fillD = `M ${arcX(startAngle)} ${arcY(startAngle)} A ${R} ${R} 0 ${threatScore > 5 ? 1 : 0} 1 ${arcX(fillAngle)} ${arcY(fillAngle)}`;

  // recent 3 for activity stream
  const recent = history.slice(0, 3);

  return (
    <>
      {/* 2-col grid: left = Threat (tall), right = 2 rows */}
      <div className="dash-grid">
        {/* Threat Level */}
        <div className="card threat-card dash-threat">
          <div className="card-title">Threat Level</div>
          <div className="gauge-wrap">
            <svg viewBox="0 0 200 110" className="gauge-svg">
              <defs>
                <linearGradient id="tGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              {/* Track */}
              <path d={trackD} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
              {/* Fill */}
              {threatScore > 0 && (
                <path d={fillD} fill="none" stroke={threatColor} strokeWidth="12" strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${threatColor}88)`, transition: 'all 1s ease' }} />
              )}
              <text x="100" y="88" textAnchor="middle" fill={threatColor} fontSize="26" fontWeight="800" fontFamily="Inter">{threatScore} -</text>
            </svg>
            <div>
              <div className="gauge-label" style={{ color: threatColor }}>{threatScore}/10</div>
              <div className="gauge-sub" style={{ color: threatColor }}>{threatLabel}</div>
            </div>
          </div>
          <button className="btn-deep-scan" onClick={() => onNavigate('scan')}>🔬 Run Deep Scan</button>
        </div>

        {/* Assets Overview */}
        <div className="card">
          <div className="card-title">Assets Overview</div>
          <div className="assets-overview-row">
            <div className="assets-stats">
              <div className="assets-count-big">{totalAssets}</div>
              <div className="assets-dot-row">
                <div className="green-dot" />
                <span>Assets Protected</span>
              </div>
              <button className="btn-manage" onClick={() => onNavigate('assets')}>Manage Assets</button>
            </div>
            <div className="assets-bars">
              {['🛡️', '🗂️', '🔍'].map((icon, i) => (
                <div className="asset-bar-row" key={i}>
                  <span className="asset-bar-icon">{icon}</span>
                  <div className="asset-bar-track">
                    <div className="asset-bar-fill" style={{ width: `${[75, 50, 30][i]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Infringements */}
        <div className="card">
          <div className="card-title">Infringements</div>
          <div className="infring-count">{totalMatches}</div>
          <div className="infring-label">Recent Infringements</div>
          <button className="btn-view-all" onClick={() => onNavigate('feed')}>View All Matches</button>
        </div>

        {/* Profile / Setup */}
        <div className="card">
          <div className="card-title">Profile / Setup</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>Asset Details</div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: 8 }}>
            <div style={{ width: '60%', height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: 16 }}>
            <div style={{ width: '40%', height: '100%', background: '#8b5cf6', borderRadius: 3 }} />
          </div>
          <button className="btn-manage" onClick={() => onNavigate('assets')}>Review</button>
        </div>
      </div>

      {/* Activity Stream */}
      <div className="activity-stream">
        <div className="activity-bg" />
        <div className="activity-inner">
          <div className="activity-stream-title">Activity Stream</div>
          <div className="activity-cards">
            {recent.length === 0 ? (
              <>
                <div className="activity-chip">
                  <span className="activity-chip-icon">🔍</span>
                  <div className="activity-chip-body">
                    <div className="activity-chip-title">No activity yet</div>
                    <div className="activity-chip-sub">Run a scan to see results here</div>
                  </div>
                </div>
              </>
            ) : recent.map((item, i) => (
              <div className="activity-chip" key={i}>
                <span className="activity-chip-icon">{item.is_authorized === false ? '🚨' : '✅'}</span>
                <div className="activity-chip-body">
                  <div className="activity-chip-title">{item.is_authorized === false ? 'Match found' : 'Scan complete'}</div>
                  <div className="activity-chip-sub">{item.assets?.name || 'Asset'} · {new Date(item.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="activity-stream-footer">
            <button className="btn-explore" onClick={() => onNavigate('feed')}>Explore Feed</button>
          </div>
        </div>
      </div>
    </>
  );
}
