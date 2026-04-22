'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { ProtectedRoute } from '@/utils/ProtectedRoute';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import apiClient from '@/lib/api';
import { YieldPrediction } from '@/types';
import Link from 'next/link';
import AppNavbar from '@/components/AppNavbar';

function DashboardContent() {
  const { user } = useAuthStore();
  const [predictions, setPredictions] = useState<YieldPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useInactivityTimer();

  useEffect(() => {
    apiClient.get('/api/v1/predictions/').then(r => setPredictions(r.data)).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const total = predictions.length;
  const avgYield = total ? (predictions.reduce((a, p) => a + p.predicted_yield, 0) / total).toFixed(1) : '—';
  const totalProfit = total ? predictions.reduce((a, p) => a + p.net_profit, 0) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Nunito+Sans:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .db-root { min-height: 100vh; background: #F5EDD8; font-family: 'Lora', Georgia, serif; color: #1C1410; }
        .db-body { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
        .db-greeting { margin-bottom: 2.5rem; }
        .db-greeting h1 { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 700; color: #3D2B1F; letter-spacing: -0.02em; margin-bottom: 0.3rem; }
        .db-greeting p { font-family: 'Nunito Sans', sans-serif; font-size: 0.95rem; color: #6B4A3A; }

        .stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.2rem; margin-bottom: 2.5rem; }
        .stat-card { background: white; border-radius: 14px; padding: 1.4rem 1.6rem; border: 1.5px solid rgba(196,168,130,0.25); box-shadow: 0 2px 12px rgba(61,43,31,0.06); }
        .stat-card.primary { background: #2D6A2D; border-color: #2D6A2D; }
        .stat-label { font-family: 'Nunito Sans', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #C4A882; margin-bottom: 0.6rem; }
        .stat-card.primary .stat-label { color: rgba(255,255,255,0.6); }
        .stat-val { font-size: 1.9rem; font-weight: 700; color: #3D2B1F; letter-spacing: -0.02em; }
        .stat-card.primary .stat-val { color: white; }
        .stat-desc { font-family: 'Nunito Sans', sans-serif; font-size: 0.78rem; color: #8B6A5A; margin-top: 0.3rem; }
        .stat-card.primary .stat-desc { color: rgba(255,255,255,0.6); }
        .stat-action { font-family: 'Nunito Sans', sans-serif; font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.85); text-decoration: none; margin-top: 0.9rem; display: inline-flex; align-items: center; gap: 4px; }
        .stat-action:hover { color: white; }

        .quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 2.5rem; }
        .quick-card { background: white; border-radius: 14px; padding: 1.3rem 1.5rem; border: 1.5px solid rgba(196,168,130,0.22); box-shadow: 0 2px 10px rgba(61,43,31,0.05); text-decoration: none; color: inherit; display: flex; align-items: center; gap: 1rem; transition: box-shadow 0.2s, transform 0.15s; }
        .quick-card:hover { box-shadow: 0 6px 20px rgba(61,43,31,0.1); transform: translateY(-2px); }
        .qc-icon { width: 46px; height: 46px; border-radius: 12px; background: rgba(45,106,45,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .qc-title { font-size: 0.95rem; font-weight: 700; color: #3D2B1F; margin-bottom: 2px; }
        .qc-sub { font-family: 'Nunito Sans', sans-serif; font-size: 0.78rem; color: #8B6A5A; }

        .panel { background: white; border-radius: 16px; border: 1.5px solid rgba(196,168,130,0.22); box-shadow: 0 2px 12px rgba(61,43,31,0.06); overflow: hidden; }
        .panel-head { padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(196,168,130,0.2); display: flex; align-items: center; justify-content: space-between; }
        .panel-title { font-size: 1.1rem; font-weight: 700; color: #3D2B1F; }
        .panel-link { font-family: 'Nunito Sans', sans-serif; font-size: 0.82rem; font-weight: 700; color: #2D6A2D; text-decoration: none; }
        .panel-link:hover { text-decoration: underline; }
        .panel-empty { padding: 3rem 1.5rem; text-align: center; }
        .panel-empty-icon { font-size: 2.5rem; margin-bottom: 0.8rem; }
        .panel-empty-text { font-family: 'Nunito Sans', sans-serif; font-size: 0.92rem; color: #8B6A5A; margin-bottom: 1.2rem; }

        .pred-list { list-style: none; }
        .pred-item { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(196,168,130,0.15); transition: background 0.15s; }
        .pred-item:last-child { border-bottom: none; }
        .pred-item:hover { background: #FDFAF5; }
        .pred-item a { text-decoration: none; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
        .pred-crop-badge { font-family: 'Nunito Sans', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; background: rgba(45,106,45,0.1); color: #2D6A2D; }
        .pred-meta { font-family: 'Nunito Sans', sans-serif; font-size: 0.82rem; color: #8B6A5A; display: flex; align-items: center; gap: 0.4rem; }
        .pred-yield { font-family: 'Nunito Sans', sans-serif; font-size: 0.95rem; font-weight: 700; color: #2D6A2D; }
        .pred-profit { font-family: 'Nunito Sans', sans-serif; font-size: 0.82rem; color: #8B6A5A; }
        .pred-arrow { font-family: 'Nunito Sans', sans-serif; font-size: 0.8rem; color: #C4A882; }
        .risk-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        .btn-new { font-family: 'Nunito Sans', sans-serif; background: #2D6A2D; color: white; padding: 0.55rem 1.2rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; text-decoration: none; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: background 0.2s; }
        .btn-new:hover { background: #235823; }

        @media (max-width: 640px) {
          .stats-row { grid-template-columns: 1fr; }
          .quick-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="db-root">
        <AppNavbar />
        <div className="db-body">
          {/* Greeting */}
          <div className="db-greeting">
            <h1>Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}</h1>
            <p>Track your predictions and plan your next season.</p>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <Link href="/predict" style={{ textDecoration: 'none' }}>
              <div className="stat-card primary">
                <div className="stat-label">New Prediction</div>
                <div className="stat-val">+</div>
                <div className="stat-desc">Run a crop forecast</div>
                <span className="stat-action">Start now →</span>
              </div>
            </Link>
            <div className="stat-card">
              <div className="stat-label">Total Predictions</div>
              <div className="stat-val">{total}</div>
              <div className="stat-desc">Estimates created</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg Yield</div>
              <div className="stat-val">{avgYield}{total ? ' t/ha' : ''}</div>
              <div className="stat-desc">Across all predictions</div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="quick-grid">
            <Link href="/sessions" className="quick-card">
              <div className="qc-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A2D" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                </svg>
              </div>
              <div>
                <div className="qc-title">Active Sessions</div>
                <div className="qc-sub">View & revoke logins</div>
              </div>
            </Link>
            <Link href="/predict" className="quick-card">
              <div className="qc-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A2D" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 22V12M8 16l4-4 4 4"/><path d="M3 6c0-1.7 3.6-3 8-3s8 1.3 8 3v4c0 1.7-3.6 3-8 3S3 11.7 3 10V6z"/>
                </svg>
              </div>
              <div>
                <div className="qc-title">New Estimate</div>
                <div className="qc-sub">Forecast a crop yield</div>
              </div>
            </Link>
          </div>

          {/* Recent predictions */}
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Recent Estimates</span>
              {predictions.length > 5 && <Link href="/predictions" className="panel-link">View all</Link>}
            </div>
            {isLoading ? (
              <div className="panel-empty"><div className="panel-empty-text">Loading estimates...</div></div>
            ) : predictions.length > 0 ? (
              <ul className="pred-list">
                {predictions.slice(0, 6).map(p => (
                  <li key={p.id} className="pred-item">
                    <Link href={`/results/${p.id}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', minWidth: 0 }}>
                        <div className="risk-dot" style={{ background: p.risk_level === 'low' ? '#16A34A' : p.risk_level === 'medium' ? '#D97706' : '#DC2626' }} />
                        <span className="pred-crop-badge">{p.crop}</span>
                        <span className="pred-meta">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {p.location}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexShrink: 0 }}>
                        <div>
                          <div className="pred-yield">{p.predicted_yield.toFixed(1)} t/ha</div>
                          <div className="pred-profit">KES {p.net_profit.toLocaleString()}</div>
                        </div>
                        <span className="pred-arrow">→</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="panel-empty">
                <div className="panel-empty-icon">🌱</div>
                <div className="panel-empty-text">No estimates yet. Run your first prediction to see what your land can produce.</div>
                <Link href="/predict" className="btn-new">+ Create estimate</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  return <ProtectedRoute><DashboardContent /></ProtectedRoute>;
}