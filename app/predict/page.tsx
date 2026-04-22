'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/utils/ProtectedRoute';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import apiClient from '@/lib/api';
import Link from 'next/link';
import AppNavbar from '@/components/AppNavbar';
import { CropOption, LocationsGrouped } from '@/types';

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.9rem',
  border: '1.5px solid rgba(196,168,130,0.4)', borderRadius: 9,
  fontFamily: "'Nunito Sans', sans-serif", fontSize: '0.9rem', color: '#1C1410',
  background: 'white', transition: 'border-color 0.2s, box-shadow 0.2s', outline: 'none',
};

function PredictContent() {
  const router = useRouter();
  useInactivityTimer();

  const [crops, setCrops] = useState<CropOption[]>([]);
  const [locationsGrouped, setLocationsGrouped] = useState<LocationsGrouped>({});
  const [metaLoading, setMetaLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    crop: 'maize', location: 'Nakuru', planting_date: '',
    soil_ph: 6.0, soil_moisture: 25.0, organic_carbon: 1.5, fertilizer_kg_ha: 100.0,
    rainfall: 800.0, temperature: 22.0, humidity: 65.0,
  });

  useEffect(() => {
    Promise.all([apiClient.get('/api/v1/meta/crops/'), apiClient.get('/api/v1/meta/locations/')])
      .then(([cr, lo]) => { setCrops(cr.data); setLocationsGrouped(lo.data); })
      .catch(() => {})
      .finally(() => setMetaLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: ['crop', 'location', 'planting_date'].includes(name) ? value : parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      const res = await apiClient.post('/api/v1/predictions/', { ...formData, predicted_yield: 0, harvest_window: '', net_profit: 0 });
      router.push(`/results/${res.data.id}`);
    } catch (err: any) {
      const data = err.response?.data || {};
      if (err.response?.status === 400 && typeof data === 'object') {
        const msgs = Object.keys(data).map(k => Array.isArray(data[k]) ? `${k}: ${data[k][0]}` : '').filter(Boolean);
        setError(msgs.length ? msgs.join(', ') : 'Validation error');
      } else {
        setError(data.detail || data.error || 'Could not create prediction. Check your inputs and try again.');
      }
    } finally { setIsLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Nunito+Sans:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .pr-root { min-height: 100vh; background: #F5EDD8; font-family: 'Lora', Georgia, serif; }
        .pr-body { max-width: 700px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
        .back-link { font-family: 'Nunito Sans', sans-serif; font-size: 0.85rem; font-weight: 600; color: #5C4A3A; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; margin-bottom: 1.5rem; transition: color 0.15s; }
        .back-link:hover { color: #2D6A2D; }
        .pr-card { background: white; border-radius: 18px; border: 1.5px solid rgba(196,168,130,0.25); box-shadow: 0 4px 24px rgba(61,43,31,0.07); overflow: hidden; }
        .pr-card-head { padding: 1.5rem 1.8rem; border-bottom: 1px solid rgba(196,168,130,0.2); background: #FDFAF5; }
        .pr-card-head h2 { font-size: 1.4rem; font-weight: 700; color: #3D2B1F; letter-spacing: -0.02em; margin-bottom: 0.3rem; }
        .pr-card-head p { font-family: 'Nunito Sans', sans-serif; font-size: 0.88rem; color: #8B6A5A; }
        .pr-form { padding: 1.8rem; }
        .field-group { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 1.4rem; }
        .field-group.single { grid-template-columns: 1fr; }
        .field-group.three { grid-template-columns: 1fr 1fr 1fr; }
        .field-wrap label { font-family: 'Nunito Sans', sans-serif; font-size: 0.78rem; font-weight: 700; color: #5C4A3A; display: block; margin-bottom: 5px; }
        .field-hint { font-family: 'Nunito Sans', sans-serif; font-size: 0.7rem; color: #C4A882; margin-top: 3px; }
        .sec-divider { border: none; border-top: 1.5px solid rgba(196,168,130,0.2); margin: 1.6rem 0; }
        .sec-label { font-size: 1rem; font-weight: 700; color: #3D2B1F; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.5rem; }
        .weather-box { background: rgba(45,106,45,0.05); border: 1.5px solid rgba(45,106,45,0.15); border-radius: 12px; padding: 1.2rem 1.4rem; margin-bottom: 1.4rem; }
        .weather-box-head { font-size: 0.95rem; font-weight: 700; color: #2D6A2D; margin-bottom: 0.3rem; }
        .weather-box-sub { font-family: 'Nunito Sans', sans-serif; font-size: 0.78rem; color: #4A8F4A; margin-bottom: 1.2rem; }
        .err-box { background: #FEF2F2; border: 1.5px solid rgba(239,68,68,0.2); border-radius: 10px; padding: 0.9rem 1.1rem; margin-bottom: 1.4rem; font-family: 'Nunito Sans', sans-serif; font-size: 0.85rem; color: #B91C1C; display: flex; align-items: flex-start; gap: 0.5rem; }
        .btn-submit { width: 100%; background: #2D6A2D; color: white; border: none; cursor: pointer; font-family: 'Nunito Sans', sans-serif; font-size: 1rem; font-weight: 700; padding: 0.85rem; border-radius: 10px; transition: background 0.2s, transform 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-submit:hover:not(:disabled) { background: #235823; transform: translateY(-1px); }
        .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .form-note { font-family: 'Nunito Sans', sans-serif; font-size: 0.75rem; color: #C4A882; text-align: center; margin-top: 0.8rem; }
        @media (max-width: 560px) { .field-group { grid-template-columns: 1fr; } .field-group.three { grid-template-columns: 1fr; } }
      `}</style>

      <div className="pr-root">
        <AppNavbar />
        <div className="pr-body">
          <Link href="/dashboard" className="back-link">← Back to dashboard</Link>
          <div className="pr-card">
            <div className="pr-card-head">
              <h2>New prediction</h2>
              <p>Enter your farm details to forecast yield and profit.</p>
            </div>
            <form className="pr-form" onSubmit={handleSubmit}>
              {error && (
                <div className="err-box">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              {/* Crop + Location */}
              <div className="field-group">
                <div className="field-wrap">
                  <label>Crop type</label>
                  <div style={{ position: 'relative' }}>
                    <select name="crop" value={formData.crop} onChange={handleChange} disabled={metaLoading} style={{ ...fieldStyle, paddingRight: '2rem', appearance: 'none' }}>
                      {crops.length > 0 ? crops.map(c => <option key={c.value} value={c.value}>{c.label}</option>) : (
                        <>
                          <option value="maize">Maize</option><option value="beans">Beans</option>
                          <option value="wheat">Wheat</option><option value="sorghum">Sorghum</option>
                          <option value="coffee">Coffee</option><option value="tea">Tea</option>
                          <option value="potatoes">Potatoes</option><option value="cassava">Cassava</option>
                          <option value="rice">Rice</option>
                        </>
                      )}
                    </select>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="2" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
                <div className="field-wrap">
                  <label>Location</label>
                  <div style={{ position: 'relative' }}>
                    <select name="location" value={formData.location} onChange={handleChange} disabled={metaLoading} style={{ ...fieldStyle, paddingRight: '2rem', appearance: 'none' }}>
                      {Object.keys(locationsGrouped).length > 0 ? Object.entries(locationsGrouped).map(([region, locs]) => (
                        <optgroup key={region} label={region}>{locs.map(loc => <option key={loc.value} value={loc.value}>{loc.label}</option>)}</optgroup>
                      )) : (
                        <>
                          <option value="Nakuru">Nakuru</option><option value="Eldoret">Eldoret</option>
                          <option value="Kisumu">Kisumu</option><option value="Meru">Meru</option>
                          <option value="Kitale">Kitale</option>
                        </>
                      )}
                    </select>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="2" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="field-group single">
                <div className="field-wrap">
                  <label>Planting date</label>
                  <input type="date" name="planting_date" value={formData.planting_date} onChange={handleChange} required style={fieldStyle}/>
                </div>
              </div>

              <hr className="sec-divider"/>
              <div className="sec-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D6A2D" strokeWidth="1.8"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M12 6v6l4 2"/></svg>
                Soil conditions
              </div>

              <div className="field-group">
                <div className="field-wrap">
                  <label>Soil pH</label>
                  <input type="number" name="soil_ph" step="0.1" min="3" max="10" value={formData.soil_ph} onChange={handleChange} style={fieldStyle}/>
                  <div className="field-hint">Optimal for most crops: 5.5 – 7.0</div>
                </div>
                <div className="field-wrap">
                  <label>Soil moisture (%)</label>
                  <input type="number" name="soil_moisture" step="0.5" min="0" max="100" value={formData.soil_moisture} onChange={handleChange} style={fieldStyle}/>
                  <div className="field-hint">Field capacity: 20 – 30%</div>
                </div>
                <div className="field-wrap">
                  <label>Organic carbon (%)</label>
                  <input type="number" name="organic_carbon" step="0.1" min="0" max="10" value={formData.organic_carbon} onChange={handleChange} style={fieldStyle}/>
                </div>
                <div className="field-wrap">
                  <label>Fertilizer (kg/ha)</label>
                  <input type="number" name="fertilizer_kg_ha" step="5" min="0" value={formData.fertilizer_kg_ha} onChange={handleChange} style={fieldStyle}/>
                </div>
              </div>

              <hr className="sec-divider"/>
              <div className="weather-box">
                <div className="weather-box-head">Expected weather conditions</div>
                <div className="weather-box-sub">Estimated weather for your growing season</div>
                <div className="field-group three">
                  <div className="field-wrap">
                    <label>Rainfall (mm/season)</label>
                    <input type="number" name="rainfall" step="10" min="200" max="2000" value={formData.rainfall} onChange={handleChange} style={fieldStyle}/>
                    <div className="field-hint">Typical: 600 – 1200 mm</div>
                  </div>
                  <div className="field-wrap">
                    <label>Avg temperature (°C)</label>
                    <input type="number" name="temperature" step="0.5" min="10" max="35" value={formData.temperature} onChange={handleChange} style={fieldStyle}/>
                  </div>
                  <div className="field-wrap">
                    <label>Avg humidity (%)</label>
                    <input type="number" name="humidity" step="1" min="40" max="90" value={formData.humidity} onChange={handleChange} style={fieldStyle}/>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.7s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    Running prediction...
                  </>
                ) : 'Create prediction →'}
              </button>
              <div className="form-note">Weather data is fetched automatically from OpenWeather for your selected location.</div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PredictPage() {
  return <ProtectedRoute><PredictContent /></ProtectedRoute>;
}