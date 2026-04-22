'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/utils/ProtectedRoute';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import apiClient from '@/lib/api';
import Link from 'next/link';
import AppNavbar from '@/components/AppNavbar';
import { YieldPrediction, RiskLevel } from '@/types';

function RiskBadge({ level }: { level: RiskLevel }) {
  const map = {
    low: { bg: 'rgba(22,163,74,0.1)', color: '#15803D', border: 'rgba(22,163,74,0.2)', label: 'Low risk' },
    medium: { bg: 'rgba(217,119,6,0.1)', color: '#B45309', border: 'rgba(217,119,6,0.2)', label: 'Medium risk' },
    high: { bg: 'rgba(220,38,38,0.1)', color: '#B91C1C', border: 'rgba(220,38,38,0.2)', label: 'High risk' },
  }[level];
  return (
    <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: map.bg, color: map.color, border: `1.5px solid ${map.border}` }}>
      {map.label}
    </span>
  );
}

function ResultsContent() {
  const params = useParams();
  const router = useRouter();
  const predId = params.id as string;
  useInactivityTimer();

  const [prediction, setPrediction] = useState<YieldPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!predId) return;
    apiClient.get(`/api/v1/predictions/${predId}/`)
      .then(r => setPrediction(r.data))
      .catch(() => setError('Could not load prediction details'))
      .finally(() => setLoading(false));
  }, [predId]);

  const handleDelete = async () => {
    if (!confirm('Delete this prediction? This cannot be undone.')) return;
    setDeleting(true);
    try { await apiClient.delete(`/api/v1/predictions/${predId}/`); router.push('/dashboard'); }
    catch { alert('Failed to delete. Please try again.'); }
    finally { setDeleting(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Nunito+Sans:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .res-root { min-height: 100vh; background: #F5EDD8; font-family: 'Lora', Georgia, serif; }
        .res-body { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
        .res-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.8rem; flex-wrap: wrap; gap: 1rem; }
        .back-link { font-family: 'Nunito Sans', sans-serif; font-size: 0.85rem; font-weight: 600; color: #5C4A3A; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; transition: color 0.15s; }
        .back-link:hover { color: #2D6A2D; }
        .btn-del { font-family: 'Nunito Sans', sans-serif; font-size: 0.82rem; font-weight: 700; background: none; border: 1.5px solid rgba(220,38,38,0.25); color: #B91C1C; padding: 0.4rem 0.9rem; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: background 0.15s; }
        .btn-del:hover:not(:disabled) { background: rgba(220,38,38,0.06); }
        .btn-del:disabled { opacity: 0.6; cursor: not-allowed; }
        .res-hero { background: #2D6A2D; border-radius: 18px; padding: 2rem 2.2rem; margin-bottom: 1.5rem; color: white; }
        .res-crop-row { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .crop-badge { font-family: 'Nunito Sans', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; background: rgba(255,255,255,0.15); color: white; padding: 4px 12px; border-radius: 20px; }
        .res-location { font-family: 'Nunito Sans', sans-serif; font-size: 0.85rem; color: rgba(255,255,255,0.7); }
        .res-yield-big { font-size: clamp(2.8rem, 6vw, 4rem); font-weight: 700; line-height: 1; letter-spacing: -0.03em; }
        .res-yield-unit { font-family: 'Nunito Sans', sans-serif; font-size: 0.9rem; color: rgba(255,255,255,0.65); margin-top: 4px; margin-bottom: 1.4rem; }
        .res-meta-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .res-meta-item { background: rgba(255,255,255,0.1); border-radius: 10px; padding: 0.9rem 1rem; }
        .res-meta-label { font-family: 'Nunito Sans', sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 4px; }
        .res-meta-val { font-family: 'Nunito Sans', sans-serif; font-size: 1.05rem; font-weight: 700; color: white; }
        .res-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 1.2rem; }
        .res-panel { background: white; border-radius: 14px; padding: 1.5rem; border: 1.5px solid rgba(196,168,130,0.22); box-shadow: 0 2px 12px rgba(61,43,31,0.06); }
        .res-panel.full { grid-column: 1 / -1; }
        .rp-title { font-size: 1rem; font-weight: 700; color: #3D2B1F; margin-bottom: 1.1rem; }
        .param-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.9rem; }
        .param-item { display: flex; align-items: flex-start; gap: 0.5rem; }
        .param-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(45,106,45,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .param-label { font-family: 'Nunito Sans', sans-serif; font-size: 0.72rem; color: #8B6A5A; margin-bottom: 2px; }
        .param-val { font-family: 'Nunito Sans', sans-serif; font-size: 0.95rem; font-weight: 700; color: #1C1410; }
        .risk-box { background: rgba(217,119,6,0.07); border: 1.5px solid rgba(217,119,6,0.2); border-radius: 10px; padding: 1rem 1.1rem; display: flex; align-items: flex-start; gap: 0.7rem; }
        .risk-text { font-family: 'Nunito Sans', sans-serif; font-size: 0.88rem; color: #92400E; line-height: 1.55; }
        .ai-list { list-style: none; }
        .ai-item { font-family: 'Nunito Sans', sans-serif; font-size: 0.88rem; color: #1C1410; line-height: 1.55; display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.5rem 0; border-bottom: 1px solid rgba(196,168,130,0.15); }
        .ai-item:last-child { border-bottom: none; }
        .ai-num { width: 22px; height: 22px; border-radius: 50%; background: rgba(45,106,45,0.1); color: #2D6A2D; font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .ci-bar { height: 8px; background: #EDE0CC; border-radius: 4px; position: relative; overflow: visible; margin: 0.8rem 0 0.4rem; }
        .ci-fill { height: 100%; background: #2D6A2D; border-radius: 4px; }
        .ci-marker { position: absolute; width: 3px; height: 16px; background: #D97706; border-radius: 2px; top: -4px; }
        .ci-labels { display: flex; justify-content: space-between; font-family: 'Nunito Sans', sans-serif; font-size: 0.75rem; color: #8B6A5A; }
        .model-note { font-family: 'Nunito Sans', sans-serif; font-size: 0.75rem; color: #C4A882; text-align: center; margin-top: 1.5rem; line-height: 1.6; }
        .loading-state { padding: 4rem 1.5rem; text-align: center; font-family: 'Nunito Sans', sans-serif; color: #8B6A5A; }
        @media (max-width: 640px) { .res-grid { grid-template-columns: 1fr; } .res-meta-row { grid-template-columns: 1fr 1fr; } .param-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="res-root">
        <AppNavbar />
        <div className="res-body">
          {loading ? (
            <div className="loading-state">Loading prediction...</div>
          ) : error || !prediction ? (
            <div>
              <Link href="/dashboard" className="back-link">← Back to dashboard</Link>
              <div style={{ background: 'white', borderRadius: 14, padding: '3rem', textAlign: 'center', marginTop: '1rem', fontFamily: "'Nunito Sans', sans-serif", color: '#B91C1C' }}>{error || 'Prediction not found'}</div>
            </div>
          ) : (
            <>
              <div className="res-topbar">
                <Link href="/dashboard" className="back-link">← Back to dashboard</Link>
                <button className="btn-del" onClick={handleDelete} disabled={deleting}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>

              {/* Hero */}
              <div className="res-hero">
                <div className="res-crop-row">
                  <span className="crop-badge">{prediction.crop}</span>
                  <span className="res-location">{prediction.location}{prediction.region ? `, ${prediction.region}` : ''}</span>
                  <RiskBadge level={prediction.risk_level} />
                </div>
                <div className="res-yield-big">{prediction.predicted_yield.toFixed(1)} t/ha</div>
                <div className="res-yield-unit">Predicted yield</div>
                <div className="res-meta-row">
                  <div className="res-meta-item">
                    <div className="res-meta-label">Net profit</div>
                    <div className="res-meta-val">KES {prediction.net_profit.toLocaleString()}</div>
                  </div>
                  <div className="res-meta-item">
                    <div className="res-meta-label">Harvest window</div>
                    <div className="res-meta-val">{prediction.harvest_window}</div>
                  </div>
                  <div className="res-meta-item">
                    <div className="res-meta-label">Planted</div>
                    <div className="res-meta-val">{new Date(prediction.planting_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</div>
                  </div>
                </div>
              </div>

              {/* Confidence interval */}
              {prediction.yield_low != null && prediction.yield_high != null && (
                <div className="res-panel" style={{ marginBottom: '1.2rem' }}>
                  <div className="rp-title">Confidence interval</div>
                  <div className="ci-bar">
                    <div className="ci-fill" style={{ width: '100%' }} />
                    <div className="ci-marker" style={{ left: `${((prediction.predicted_yield - prediction.yield_low) / (prediction.yield_high - prediction.yield_low)) * 100}%` }} />
                  </div>
                  <div className="ci-labels">
                    <span>{prediction.yield_low.toFixed(1)} t/ha (low)</span>
                    <span style={{ color: '#D97706', fontWeight: 700 }}>{prediction.predicted_yield.toFixed(1)} predicted</span>
                    <span>{prediction.yield_high.toFixed(1)} t/ha (high)</span>
                  </div>
                </div>
              )}

              <div className="res-grid">
                {/* Risk */}
                {prediction.risk_reason && (
                  <div className="res-panel">
                    <div className="rp-title">Risk assessment</div>
                    <div className="risk-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      <div className="risk-text">{prediction.risk_reason}</div>
                    </div>
                  </div>
                )}

                {/* Input params */}
                <div className="res-panel">
                  <div className="rp-title">Input parameters</div>
                  <div className="param-grid">
                    {[
                      { label: 'Temperature', val: `${prediction.temperature}°C`, icon: '🌡' },
                      { label: 'Rainfall', val: `${prediction.rainfall} mm`, icon: '🌧' },
                      { label: 'Humidity', val: `${prediction.humidity}%`, icon: '💧' },
                      prediction.soil_ph ? { label: 'Soil pH', val: String(prediction.soil_ph), icon: '🧪' } : null,
                      prediction.fertilizer_kg_ha ? { label: 'Fertilizer', val: `${prediction.fertilizer_kg_ha} kg/ha`, icon: '🌱' } : null,
                      prediction.soil_moisture ? { label: 'Soil moisture', val: `${prediction.soil_moisture}%`, icon: '🫧' } : null,
                    ].filter(Boolean).map((p: any) => (
                      <div key={p.label} className="param-item">
                        <div className="param-icon" style={{ fontSize: '0.9rem' }}>{p.icon}</div>
                        <div>
                          <div className="param-label">{p.label}</div>
                          <div className="param-val">{p.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI recommendations */}
                {prediction.ai_recommendations?.length > 0 && (
                  <div className="res-panel full">
                    <div className="rp-title">Recommendations</div>
                    <ul className="ai-list">
                      {prediction.ai_recommendations.map((rec, i) => (
                        <li key={i} className="ai-item">
                          <span className="ai-num">{i + 1}</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="model-note">
                Model version: {prediction.model_version} · Generated {new Date(prediction.created_at).toLocaleString()}
                {prediction.fallback_used && ' · Fallback model used (incomplete weather data)'}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function ResultsPage() {
  return <ProtectedRoute><ResultsContent /></ProtectedRoute>;
}