import { useState, useEffect, useRef } from 'react';
import { getAssets, registerAsset, deleteAsset } from '../api';

export default function Assets({ addToast }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    try {
      const res = await getAssets();
      // Backend returns { success, data: [...] }, axios wraps in res.data
      setAssets(res.data.data || []);
    } catch { /* offline */ }
  };

  useEffect(() => { load(); }, []);

  const handleFiles = async (files) => {
    setLoading(true);
    for (const file of files) {
      try {
        await registerAsset(file);
        addToast(`✅ Registered: ${file.name}`, 'success');
      } catch {
        addToast(`❌ Failed: ${file.name}`, 'error');
      }
    }
    setLoading(false);
    load();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles([...e.dataTransfer.files]);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAsset(id);
      addToast('🗑️ Asset deleted', 'info');
      load();
    } catch {
      addToast('❌ Delete failed', 'error');
    }
  };

  // Extract dimensions from hash_signature (which is a JSON object)
  const getDimensions = (asset) => {
    const hs = asset.hash_signature;
    if (!hs) return '';
    const sig = typeof hs === 'string' ? JSON.parse(hs) : hs;
    return sig.width && sig.height ? `${sig.width}×${sig.height}` : '';
  };

  return (
    <div>
      <h1 className="page-title">Asset Library</h1>

      <div className="asset-toolbar">
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{ flex: 1 }}
        >
          <span className="upload-icon">📤</span>
          <span className="upload-text">
            {loading ? 'Uploading...' : <>Drop images here or <strong>click to upload</strong></>}
          </span>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFiles([...e.target.files])}
          />
        </div>
      </div>

      <div className="asset-count" style={{ marginBottom: 16 }}>
        {assets.length} asset{assets.length !== 1 ? 's' : ''} registered
      </div>

      <div className="asset-grid">
        {assets.map((asset) => (
          <div key={asset.id} className="asset-thumb">
            <div className="asset-placeholder">
              <span>{asset.type === 'video' ? '🎬' : '🖼️'}</span>
            </div>
            <button className="delete-btn" onClick={() => handleDelete(asset.id)}>✕</button>
            <div className="asset-info">
              <div className="asset-name">{asset.name}</div>
              <div className="asset-dims">{getDimensions(asset)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

