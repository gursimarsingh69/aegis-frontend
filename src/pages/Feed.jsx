import { useState, useEffect } from 'react';
import { getHistory, markFalsePositive, getAssetImageUrl } from '../api';

// Map backend detection fields → frontend display fields
function mapDetection(item) {
  const sourceUrl = item.source_url || '';
  // Derive platform from source_url hostname
  let platform = 'manual';
  if (sourceUrl.includes('reddit.com')) platform = 'reddit';
  else if (sourceUrl.includes('twitter.com') || sourceUrl.includes('x.com')) platform = 'twitter';

  return {
    ...item,
    match: !item.is_authorized,               // unauthorized = infringement
    confidence: item.similarity_score || 0,    // similarity_score → confidence
    scanned_at: item.detected_at,              // detected_at → scanned_at
    source: platform,                          // derived from source_url
    post_url: sourceUrl,                       // source_url → post_url
    reason: item.assets
      ? `Matched asset: ${item.assets.name}`
      : 'Unauthorized media detected',
  };
}

export default function Feed({ addToast }) {
  const [history, setHistory] = useState([]);
  const [platform, setPlatform] = useState('all');
  const [minConf, setMinConf] = useState(0);

  const load = async () => {
    try {
      const res = await getHistory();
      const raw = res.data?.data || res.data || [];
      setHistory((Array.isArray(raw) ? raw : []).map(mapDetection));
    } catch { /* offline */ }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = history.filter(h => {
    if (platform !== 'all' && h.source !== platform) return false;
    if (h.confidence < minConf) return false;
    return true;
  });

  const confClass = (c) => c >= 70 ? 'high' : c >= 40 ? 'medium' : 'low';

  const handleDismiss = async (id) => {
    try {
      await markFalsePositive(id);
      addToast('Marked as false positive', 'info');
      load();
    } catch {
      addToast('Failed to update', 'error');
    }
  };

  const exportCSV = () => {
    const rows = [['Date', 'Platform', 'Match', 'Confidence %', 'Reason', 'Post URL']];
    filtered.forEach(h => {
      const reason = (h.reason || '').replaceAll('"', "'");
      rows.push([
        h.scanned_at, h.source, h.match ? 'YES' : 'NO', h.confidence,
        `"${reason}"`, h.post_url || ''
      ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('📥 Report exported', 'success');
  };

  const formatDate = (iso) => {
    if (!iso) return 'Unknown date';
    const d = new Date(iso);
    if (isNaN(d)) return 'Unknown date';
    return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  const platformLabel = (src) => {
    if (src === 'reddit') return '🔴 Reddit';
    if (src === 'twitter') return '🐦 Twitter / X';
    return '📎 Manual';
  };

  return (
    <>
      <div className="page-header"><h1>Infringement Feed</h1></div>
      <div className="page-body">
        <div className="feed-toolbar">
          <div className="feed-filters">
            <select className="skeu-select" value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="all">All Platforms</option>
              <option value="reddit">Reddit</option>
              <option value="twitter">Twitter / X</option>
              <option value="manual">Manual</option>
            </select>
            <div className="confidence-filter">
              <label>Min Confidence:</label>
              <input type="range" min="0" max="100" value={minConf} onChange={(e) => setMinConf(Number(e.target.value))} />
              <span>{minConf}%</span>
            </div>
          </div>
          <button className="btn-export" onClick={exportCSV}>📥 Export CSV</button>
        </div>

        {filtered.length === 0 ? (
          <div className="skeu-card">
            <div className="activity-empty">
              {history.length === 0
                ? 'No scans yet. Run the crawler or use Manual Scan to see results here.'
                : 'No detections match your filters. Try lowering the confidence threshold.'}
            </div>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className={`feed-card ${item.match ? 'is-match' : 'is-clean'}`}>
              {/* Asset thumbnail if we have a matched asset */}
              {item.assets?.id && (
                <img
                  className="feed-thumb"
                  src={getAssetImageUrl(item.assets.id)}
                  alt={item.assets.name || 'Asset'}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="feed-info">
                <div className="feed-source">
                  {platformLabel(item.source)}
                  {' · '}
                  <span style={{ fontWeight: 700, color: item.match ? '#da1e28' : '#24a148' }}>
                    {item.match ? '🚨 INFRINGEMENT' : '✅ CLEAN'}
                  </span>
                </div>
                <div className="feed-reason">{item.reason}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  {formatDate(item.scanned_at)}
                </div>
              </div>
              <div className="feed-actions">
                <div className={`feed-conf ${confClass(item.confidence)}`}>{item.confidence}%</div>
                {item.post_url && item.post_url !== '' && (
                  <a href={item.post_url} target="_blank" rel="noopener noreferrer" className="btn-sm">
                    View Post ↗
                  </a>
                )}
                {item.match && (
                  <button className="btn-sm danger" onClick={() => handleDismiss(item.id)}>
                    False Positive
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
