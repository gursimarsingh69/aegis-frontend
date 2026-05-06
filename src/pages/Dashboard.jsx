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
  const totalMatches = status?.total_matches || 0;
  const totalScans   = status?.total_scans   || 0;
  const matchRatio   = totalScans > 0 ? totalMatches / totalScans : 0;
  const threatScore  = Math.max(0, Math.round(10 - matchRatio * 10));
  const threatLabel  = threatScore >= 8 ? 'SAFE' : threatScore >= 5 ? 'MODERATE' : 'HIGH RISK';
  const threatColor  = threatScore >= 8 ? '#24a148' : threatScore >= 5 ? '#b45309' : '#da1e28';

  const recent = history.slice(0, 3);

  return (
    <>
      {/* Page header bar */}
      <div className="page-header">
        <h1>Command Center</h1>
      </div>

      {/* Top cards grid */}
      <div className="carbon-grid">

        {/* Threat Level */}
        <div className="carbon-card">
          <div className="carbon-card-title">Threat Level</div>
          <div className="carbon-card-sub">Current security status of your media assets.</div>
          <div style={{ margin:'12px 0' }}>
            <span style={{ fontSize:48, fontWeight:300, color:threatColor }}>{threatScore}/10</span>
            <span style={{ display:'block', fontSize:13, fontWeight:600, color:threatColor, marginTop:4 }}>{threatLabel}</span>
          </div>
          <button className="btn-carbon filled" onClick={() => onNavigate('scan')}>Run Scan →</button>
        </div>

        {/* Assets */}
        <div className="carbon-card">
          <div className="carbon-card-title">Asset Library</div>
          <div className="carbon-card-sub">Manage your registered protected media.</div>
          <span className={`carbon-stat ${totalAssets > 0 ? 'green' : ''}`}>{totalAssets}</span>
          <span style={{ fontSize:12, color:'#525252', marginBottom:8 }}>assets protected</span>
          <button className="btn-carbon" onClick={() => onNavigate('assets')}>Manage Assets →</button>
        </div>

        {/* Infringements */}
        <div className="carbon-card">
          <div className="carbon-card-title">Infringements</div>
          <div className="carbon-card-sub">Unauthorized uses of your protected media detected online.</div>
          <span className={`carbon-stat ${totalMatches > 0 ? 'red' : ''}`}>{totalMatches}</span>
          <span style={{ fontSize:12, color:'#525252', marginBottom:8 }}>matches found</span>
          <button className="btn-carbon" onClick={() => onNavigate('feed')}>View All Matches →</button>
        </div>

      </div>

      {/* Activity stream */}
      <div className="carbon-stream">
        <div className="carbon-stream-title">Activity Stream</div>
        <div className="carbon-stream-chips">
          {recent.length === 0 ? (
            <div className="carbon-chip">
              <span className="carbon-chip-icon">📭</span>
              <div>
                <div className="carbon-chip-title">No activity yet</div>
                <div className="carbon-chip-sub">Run a scan to see results here.</div>
              </div>
            </div>
          ) : recent.map((item, i) => (
            <div className="carbon-chip" key={i}>
              <span className="carbon-chip-icon">{item.is_authorized === false ? '🚨' : '✅'}</span>
              <div>
                <div className="carbon-chip-title">{item.is_authorized === false ? 'Match found' : 'Scan complete'}</div>
                <div className="carbon-chip-sub">
                  {item.assets?.name || 'Asset'} &middot; {new Date(item.detected_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:16 }}>
          <button className="btn-carbon filled" onClick={() => onNavigate('feed')}>Explore Feed →</button>
        </div>
      </div>
    </>
  );
}
