import axios from 'axios';

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://aegis-backend-production-ff73.up.railway.app';

const API = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 minutes for AI scans
});

export const getStatus = () => API.get('/health');
export const getHistory = () => API.get('/api/detections');
export const getAssets = () => API.get('/api/assets');
export const deleteAsset = (id) => API.delete(`/api/assets/${id}`);
export const getAssetImageUrl = (id) => `${API_BASE}/api/assets/${id}/image`;
export const getSuspiciousImageUrl = (filename) => `${API_BASE}/api/sources/${filename}`;


export const registerAsset = (file) => {
  const form = new FormData();
  form.append('file', file);
  return API.post('/api/assets', form);
};

export const scanImage = (file) => {
  const form = new FormData();
  form.append('file', file);
  return API.post('/api/assets/scan/file', form);
};

export const markFalsePositive = (scanId) => API.patch(`/api/detections/${scanId}`);

export default API;
