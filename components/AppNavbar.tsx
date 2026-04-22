'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import apiClient from '@/lib/api';

const AppNavbar: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLogout = async () => {
    try { await apiClient.post('/api/v1/auth/logout/'); } catch {}
    logout();
    router.push('/login');
  };

  return (
    <>
      <style>{`
        .app-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(253,250,245,0.97);
          border-bottom: 1px solid rgba(196,168,130,0.25);
          padding: 0 1.5rem;
          transition: box-shadow 0.2s;
          font-family: 'Nunito Sans', sans-serif;
        }
        .app-nav.raised { box-shadow: 0 2px 16px rgba(61,43,31,0.08); }
        .app-nav-in {
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px;
        }
        .app-logo {
          font-family: 'Lora', Georgia, serif;
          font-size: 1.1rem; font-weight: 700; color: #3D2B1F;
          text-decoration: none; display: flex; align-items: center; gap: 9px;
          letter-spacing: -0.02em;
        }
        .app-logo-leaf {
          width: 30px; height: 30px; background: #2D6A2D;
          border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 0.78rem; transition: transform 0.3s;
        }
        .app-logo:hover .app-logo-leaf { transform: rotate(-45deg) scale(1.08); }
        .app-logo-leaf span { transform: rotate(45deg); display: block; }
        .app-nav-links { display: flex; align-items: center; gap: 0.5rem; }
        .app-nav-link {
          font-size: 0.85rem; font-weight: 600; color: #5C4A3A;
          text-decoration: none; padding: 0.4rem 0.75rem; border-radius: 7px;
          transition: background 0.15s, color 0.15s;
        }
        .app-nav-link:hover { background: rgba(45,106,45,0.08); color: #2D6A2D; }
        .app-nav-link.active { background: rgba(45,106,45,0.1); color: #2D6A2D; }
        .app-user-chip {
          display: flex; align-items: center; gap: 0.6rem;
          background: #F5EDD8; border-radius: 20px;
          padding: 0.3rem 0.9rem 0.3rem 0.5rem;
          border: 1px solid rgba(196,168,130,0.3);
        }
        .app-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: #2D6A2D; color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
        }
        .app-email { font-size: 0.78rem; color: #5C4A3A; font-weight: 600; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .app-logout-btn {
          background: none; border: none; cursor: pointer;
          font-size: 0.78rem; font-weight: 700; color: #8B6A5A;
          padding: 0.35rem 0.7rem; border-radius: 6px;
          transition: background 0.15s, color 0.15s;
        }
        .app-logout-btn:hover { background: rgba(61,43,31,0.07); color: #3D2B1F; }
        .app-new-btn {
          background: #2D6A2D; color: white;
          border: none; cursor: pointer;
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.82rem; font-weight: 700;
          padding: 0.45rem 1rem; border-radius: 8px;
          text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
          transition: background 0.2s;
        }
        .app-new-btn:hover { background: #235823; }
        @media (max-width: 600px) {
          .app-nav-links .app-nav-link:not(.always) { display: none; }
          .app-email { display: none; }
        }
      `}</style>
      <nav className={`app-nav${mounted && scrolled ? ' raised' : ''}`} suppressHydrationWarning>
        <div className="app-nav-in">
          <Link href="/dashboard" className="app-logo">
            <div className="app-logo-leaf"><span>🌱</span></div>
            CropAI Kenya
          </Link>
          <div className="app-nav-links">
            <Link href="/dashboard" className="app-nav-link">Dashboard</Link>
            <Link href="/predict" className="app-nav-link">New Estimate</Link>
            <Link href="/sessions" className="app-nav-link">Sessions</Link>
            <div className="app-user-chip">
              <div className="app-avatar">{user?.email?.[0]?.toUpperCase() ?? 'U'}</div>
              <span className="app-email">{user?.email}</span>
            </div>
            <button className="app-logout-btn" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default AppNavbar;