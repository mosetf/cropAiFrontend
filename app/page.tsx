'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const SUPPORTED_CROPS = [
  { name: 'Maize', season: 'March – Aug', yield: '2.1 t/ha avg', emoji: 'Maize' },
  { name: 'Beans', season: 'Oct – Jan', yield: '0.9 t/ha avg', emoji: 'Beans' },
  { name: 'Wheat', season: 'March – July', yield: '2.8 t/ha avg', emoji: 'Wheat' },
  { name: 'Sorghum', season: 'March – Aug', yield: '1.4 t/ha avg', emoji: 'Sorghum' },
  { name: 'Coffee', season: 'Oct – Feb', yield: '0.6 t/ha avg', emoji: 'Coffee' },
  { name: 'Tea', season: 'Year-round', yield: '2.5 t/ha avg', emoji: 'Tea' },
  { name: 'Potatoes', season: 'March – June', yield: '8.2 t/ha avg', emoji: 'Potato' },
  { name: 'Cassava', season: 'March – Oct', yield: '10.1 t/ha avg', emoji: 'Cassava' },
  { name: 'Rice', season: 'April – Sept', yield: '3.1 t/ha avg', emoji: 'Rice' },
];

const PROBLEMS = [
  {
    icon: 'Rainfall',
    title: 'You plant, but the rains fail',
    body: "Short rains, long rains — the timing shifts every season. You rely on what worked last year. But last year was different.",
    solution: 'CropAI pulls 10 years of rainfall data from your county and flags when your chosen planting date historically leads to low yields.',
  },
  {
    icon: 'Yield',
    title: 'You spend on fertilizer, but yields stay low',
    body: "Fertilizer is expensive. You buy it, apply it, and still harvest less than your neighbor. Nobody tells you why.",
    solution: 'Enter your soil pH and moisture levels. The model tells you exactly how much fertilizer will make a difference for your crop and soil type.',
  },
  {
    icon: 'Price',
    title: 'You sell at harvest — always at the lowest price',
    body: "Everyone harvests in May. Everyone sells in May. Prices drop. You needed to know your harvest window three months ago.",
    solution: 'The system calculates your likely harvest window from your planting date so you can plan storage and time your sale better.',
  },
  {
    icon: 'Crop choice',
    title: 'You chose the wrong crop for your land',
    body: "Coffee looks like better money than maize. But your altitude, rainfall, and soil tell a different story. You find out after two seasons.",
    solution: 'Compare yield and profit estimates across crops before you plant. Put numbers on the decision.',
  },
];

const TESTIMONIALS = [
  {
    quote: "Last year I planted maize too late because I was waiting for the land to dry. The system showed me that planting two weeks earlier — even in slightly wet soil — gives better results in Eldoret. This season I tried it. Night and day.",
    name: 'Peter Cheruiyot',
    location: 'Eldoret, Uasin Gishu',
    crop: 'Maize',
  },
  {
    quote: "I was spending 8,000 shillings on fertilizer per acre and wondering why yields were flat. Turns out my soil pH was wrong for beans. The tool told me to lime the soil first. Simple fix I had never heard about.",
    name: 'Grace Wambui',
    location: 'Muranga, Central',
    crop: 'Beans',
  },
];

function useIntersection(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useIntersection();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [activeCrop, setActiveCrop] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Lora', Georgia, serif", background: '#FDFAF5', color: '#1C1410', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Nunito+Sans:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sans { font-family: 'Nunito Sans', system-ui, sans-serif !important; }

        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0 1.5rem;
          transition: background 0.3s, box-shadow 0.3s, border-color 0.3s;
        }
        .nav.scrolled {
          background: rgba(253,250,245,0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(61,43,31,0.1);
          box-shadow: 0 2px 20px rgba(61,43,31,0.07);
        }
        .nav-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          height: 72px;
        }
        .nav-logo {
          font-size: 1.25rem; font-weight: 700; color: #3D2B1F;
          text-decoration: none; display: flex; align-items: center; gap: 10px;
          letter-spacing: -0.02em;
        }
        .nav-leaf {
          width: 34px; height: 34px; background: #2D6A2D;
          border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; flex-shrink: 0; transition: transform 0.4s ease;
        }
        .nav-logo:hover .nav-leaf { transform: rotate(-45deg) scale(1.1); }
        .nav-leaf-inner { transform: rotate(45deg); display: block; }
        .nav-links { display: flex; align-items: center; gap: 2rem; }
        .nav-link {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.88rem; font-weight: 600; color: #5C4A3A;
          text-decoration: none; transition: color 0.2s;
        }
        .nav-link:hover { color: #2D6A2D; }
        .btn-primary {
          font-family: 'Nunito Sans', sans-serif;
          background: #2D6A2D; color: white;
          padding: 0.6rem 1.4rem; border-radius: 8px;
          font-size: 0.88rem; font-weight: 700;
          text-decoration: none; border: none; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-primary:hover { background: #235823; transform: translateY(-1px); }
        .btn-outline {
          font-family: 'Nunito Sans', sans-serif;
          background: transparent; color: #2D6A2D;
          padding: 0.6rem 1.4rem; border-radius: 8px;
          font-size: 0.88rem; font-weight: 700;
          text-decoration: none;
          border: 2px solid #2D6A2D;
          transition: background 0.2s, color 0.2s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-outline:hover { background: #2D6A2D; color: white; }

        /* HERO */
        .hero {
          min-height: 100vh;
          background: linear-gradient(155deg, #EFE3CA 0%, #E2CFA8 45%, #D3BC90 100%);
          display: flex; align-items: center;
          position: relative; overflow: hidden;
          padding: 100px 1.5rem 60px;
        }
        .hero-orb {
          position: absolute; border-radius: 50%;
          background: rgba(45,106,45,0.07); pointer-events: none;
        }
        .hero-inner {
          max-width: 1100px; margin: 0 auto; width: 100%;
          display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 4rem; align-items: center;
        }
        .hero-tag {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #4A8F4A;
          background: rgba(45,106,45,0.1);
          padding: 6px 14px; border-radius: 20px;
          display: inline-block; margin-bottom: 1.2rem;
        }
        .hero h1 {
          font-size: clamp(2rem, 4.2vw, 3.3rem); font-weight: 700; line-height: 1.15;
          color: #3D2B1F; margin-bottom: 1.4rem; letter-spacing: -0.02em;
        }
        .hero h1 em { color: #2D6A2D; font-style: italic; }
        .hero-lead {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 1.05rem; line-height: 1.7; color: #5C4A3A; margin-bottom: 2rem;
        }
        .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

        /* HERO CARD */
        .hero-card {
          background: white; border-radius: 18px; padding: 1.8rem;
          box-shadow: 0 20px 60px rgba(61,43,31,0.14);
          border: 1px solid rgba(196,168,130,0.3); position: relative;
        }
        .card-label {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #C4A882; margin-bottom: 1.2rem;
        }
        .yield-big { font-size: 2.8rem; font-weight: 700; color: #2D6A2D; line-height: 1; }
        .yield-unit {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.82rem; color: #5C4A3A; margin-bottom: 1.4rem; margin-top: 2px;
        }
        .bar-row { margin-bottom: 0.75rem; }
        .bar-labels {
          font-family: 'Nunito Sans', sans-serif; font-size: 0.75rem; color: #5C4A3A;
          display: flex; justify-content: space-between; margin-bottom: 4px;
        }
        .bar-track { height: 6px; background: #EDE0CC; border-radius: 3px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 3px; }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; margin-top: 1.2rem; }
        .stat-box { background: #F5EDD8; border-radius: 10px; padding: 0.75rem 0.9rem; }
        .stat-val { font-size: 1.2rem; font-weight: 700; color: #3D2B1F; }
        .stat-lbl { font-family: 'Nunito Sans', sans-serif; font-size: 0.68rem; color: #5C4A3A; margin-top: 1px; }
        .badge {
          position: absolute;
          font-family: 'Nunito Sans', sans-serif; font-size: 0.75rem; font-weight: 700;
          border-radius: 10px; padding: 0.5rem 0.9rem; white-space: nowrap;
          box-shadow: 0 6px 18px rgba(0,0,0,0.2);
        }

        /* STATS BAR */
        .stats-bar { background: #2D6A2D; padding: 1.1rem 1.5rem; }
        .stats-bar-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; justify-content: space-around; flex-wrap: wrap; gap: 1rem;
        }
        .stat-bar-item { text-align: center; color: white; }
        .stat-bar-val { font-size: 1.35rem; font-weight: 700; }
        .stat-bar-lbl {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.75rem; opacity: 0.7; margin-top: 2px;
        }

        /* SECTIONS */
        .section { padding: 80px 1.5rem; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-tag {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #D97706;
          display: block; margin-bottom: 0.8rem;
        }
        .section-title {
          font-size: clamp(1.7rem, 3.3vw, 2.5rem); font-weight: 700;
          color: #3D2B1F; margin-bottom: 0.9rem; line-height: 1.2; letter-spacing: -0.02em;
        }
        .section-sub {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 1rem; color: #5C4A3A; line-height: 1.65; max-width: 540px;
        }

        /* PROBLEMS */
        .problem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4rem; margin-top: 3rem; }
        .problem-card {
          background: white; border-radius: 16px; padding: 1.8rem;
          border: 1.5px solid rgba(196,168,130,0.25);
          box-shadow: 0 3px 18px rgba(61,43,31,0.06);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .problem-card:hover { box-shadow: 0 8px 32px rgba(61,43,31,0.11); transform: translateY(-2px); }
        .problem-icon { font-size: 1.9rem; margin-bottom: 0.8rem; }
        .problem-title { font-size: 1.15rem; font-weight: 700; color: #3D2B1F; margin-bottom: 0.55rem; line-height: 1.3; }
        .problem-body {
          font-family: 'Nunito Sans', sans-serif; font-size: 0.9rem; color: #5C4A3A;
          line-height: 1.65; margin-bottom: 0.9rem;
        }
        .problem-rule { height: 1.5px; background: #A8D5A2; margin-bottom: 0.9rem; }
        .solution-label {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #2D6A2D; margin-bottom: 0.35rem;
        }
        .solution-text {
          font-family: 'Nunito Sans', sans-serif; font-size: 0.87rem;
          color: #1C1410; line-height: 1.6;
        }

        /* CROPS */
        .crops-bg { background: #F5EDD8; }
        .crop-tabs { display: flex; gap: 0.45rem; flex-wrap: wrap; margin: 2.2rem 0 1.8rem; }
        .crop-tab {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.82rem; font-weight: 600;
          padding: 0.45rem 1rem; border-radius: 8px;
          border: 1.5px solid rgba(61,43,31,0.12);
          background: white; color: #5C4A3A;
          cursor: pointer; transition: all 0.18s;
        }
        .crop-tab.active { background: #2D6A2D; color: white; border-color: #2D6A2D; }
        .crop-tab:hover:not(.active) { border-color: #4A8F4A; color: #2D6A2D; }
        .crop-detail {
          background: white; border-radius: 18px; padding: 2.4rem;
          border: 1px solid rgba(196,168,130,0.25);
          box-shadow: 0 4px 24px rgba(61,43,31,0.07);
          display: grid; grid-template-columns: 1fr 1.6fr; gap: 2.5rem; align-items: center;
        }
        .crop-emoji-wrap { text-align: center; font-size: 5rem; }
        .crop-name { font-size: 2rem; font-weight: 700; color: #3D2B1F; margin-bottom: 0.8rem; }
        .crop-meta-row { display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 1.2rem; }
        .crop-meta-label {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: #C4A882; margin-bottom: 2px;
        }
        .crop-meta-val {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.92rem; font-weight: 700; color: #1C1410;
        }
        .crop-check {
          font-family: 'Nunito Sans', sans-serif; font-size: 0.87rem; color: #5C4A3A;
          display: flex; gap: 0.5rem; align-items: flex-start; margin-bottom: 0.45rem;
          line-height: 1.5;
        }
        .crop-check-icon { color: #2D6A2D; font-weight: 700; flex-shrink: 0; margin-top: 1px; }

        /* HOW */
        .steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 2rem; margin-top: 3rem; }
        .step { text-align: center; padding: 2rem 1.5rem; }
        .step-num {
          width: 50px; height: 50px; border-radius: 50%;
          background: #2D6A2D; color: white;
          font-family: 'Nunito Sans', sans-serif;
          font-size: 1.15rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.2rem;
        }
        .step-title { font-size: 1.05rem; font-weight: 700; color: #3D2B1F; margin-bottom: 0.55rem; }
        .step-body {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.88rem; color: #5C4A3A; line-height: 1.65;
        }

        /* TESTIMONIALS */
        .testimonials-bg { background: #3D2B1F; }
        .testimonials-bg .section-tag { color: #A8D5A2; }
        .testimonials-bg .section-title { color: white; }
        .testimonials-bg .section-sub { color: rgba(255,255,255,0.6); }
        .testimonial-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4rem; margin-top: 2.5rem; }
        .testimonial-card {
          background: rgba(255,255,255,0.07); border-radius: 14px; padding: 1.8rem;
          border: 1px solid rgba(255,255,255,0.09);
        }
        .testimonial-quote {
          font-style: italic; font-size: 1rem; line-height: 1.72;
          color: rgba(255,255,255,0.88); margin-bottom: 1.2rem;
        }
        .testimonial-name {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.88rem; font-weight: 700; color: white; margin-bottom: 2px;
        }
        .testimonial-meta {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 0.75rem; color: rgba(255,255,255,0.42);
        }

        /* CTA */
        .cta-section {
          background: linear-gradient(135deg, #2D6A2D 0%, #1A4220 100%);
          text-align: center; padding: 80px 1.5rem;
        }
        .cta-section h2 { font-size: clamp(1.7rem, 3.3vw, 2.6rem); color: white; margin-bottom: 1rem; }
        .cta-section p {
          font-family: 'Nunito Sans', sans-serif; font-size: 1rem;
          color: rgba(255,255,255,0.68); max-width: 500px; margin: 0 auto 2rem; line-height: 1.65;
        }
        .btn-white {
          font-family: 'Nunito Sans', sans-serif;
          background: white; color: #2D6A2D;
          padding: 0.85rem 2.2rem; border-radius: 10px;
          font-size: 1rem; font-weight: 700; text-decoration: none;
          display: inline-block;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.28); }

        footer { background: #140E09; color: rgba(255,255,255,0.45); padding: 36px 1.5rem; }
        .footer-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
        }
        .footer-logo { color: rgba(255,255,255,0.8); font-weight: 700; font-size: 0.95rem; }
        .footer-links { display: flex; gap: 1.5rem; }
        .footer-link {
          font-family: 'Nunito Sans', sans-serif; font-size: 0.8rem;
          color: rgba(255,255,255,0.38); text-decoration: none; transition: color 0.2s;
        }
        .footer-link:hover { color: rgba(255,255,255,0.75); }

        @media (max-width: 768px) {
          .hero-inner { grid-template-columns: 1fr; }
          .hero-card-wrap { display: none; }
          .problem-grid { grid-template-columns: 1fr; }
          .crop-detail { grid-template-columns: 1fr; text-align: center; }
          .steps { grid-template-columns: 1fr; }
          .testimonial-grid { grid-template-columns: 1fr; }
          .nav-links .nav-link { display: none; }
          .footer-inner { flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            <div className="nav-leaf"><span className="nav-leaf-inner">🌱</span></div>
            CropAI Kenya
          </a>
          <div className="nav-links">
            <a href="#problems" className="nav-link">Why it works</a>
            <a href="#crops" className="nav-link">Supported crops</a>
            <a href="#how" className="nav-link">How it works</a>
            <Link href="/login" className="nav-link">Sign in</Link>
            <Link href="/signup" className="btn-primary">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-orb" style={{ width: 560, height: 560, top: -200, right: -180 }} />
        <div className="hero-orb" style={{ width: 280, height: 280, bottom: -80, left: -80 }} />
        <div className="hero-inner">
          <div style={{ opacity: 1, transform: 'translateY(0)', animation: 'none' }}>
            <div
              style={{
                opacity: 0, transform: 'translateY(24px)',
                animation: 'heroFadeIn 0.7s ease 0.1s forwards',
              }}
            >
              <style>{`@keyframes heroFadeIn { to { opacity: 1; transform: translateY(0); } }`}</style>
              <span className="hero-tag">For Kenyan Farmers</span>
              <h1>
                Know what to expect<br />
                <em>before you plant</em>
              </h1>
              <p className="hero-lead">
                Most farmers find out a harvest was bad in May. CropAI lets you check the numbers in January — before you buy seeds, before you pay for labour, before you commit to the wrong crop.
              </p>
              <div className="hero-actions">
                <Link href="/signup" className="btn-primary">Try it free →</Link>
                <a href="#problems" className="btn-outline">See how it works</a>
              </div>
            </div>
          </div>

          <div className="hero-card-wrap">
            <div style={{ position: 'relative' }}>
              <div className="hero-card">
                <div className="card-label">Maize — Nakuru, 1 acre</div>
                <div className="yield-big">2.4</div>
                <div className="yield-unit">tonnes per hectare expected</div>
                <div className="bar-row">
                  <div className="bar-labels"><span>Rainfall match</span><span>Good</span></div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: '78%', background: '#2D6A2D' }} /></div>
                </div>
                <div className="bar-row">
                  <div className="bar-labels"><span>Soil pH</span><span>Needs lime</span></div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: '52%', background: '#D97706' }} /></div>
                </div>
                <div className="bar-row">
                  <div className="bar-labels"><span>Fertilizer efficiency</span><span>High</span></div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: '85%', background: '#2D6A2D' }} /></div>
                </div>
                <div className="stat-grid">
                  <div className="stat-box">
                    <div className="stat-val sans">KES 42,000</div>
                    <div className="stat-lbl">Projected net profit</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-val sans">July</div>
                    <div className="stat-lbl">Expected harvest</div>
                  </div>
                </div>
              </div>
              <div className="badge" style={{ top: -18, right: -18, background: '#2D6A2D', color: 'white' }}>
                ✓ Planted March 12
              </div>
              <div className="badge" style={{ bottom: -14, left: -14, background: '#D97706', color: 'white' }}>
                ⚠ Lime before planting
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="stats-bar">
        <div className="stats-bar-inner">
          {[
            { val: '9 crops', lbl: 'supported across Kenya' },
            { val: '10 years', lbl: 'of weather data per county' },
            { val: '40+ regions', lbl: 'with local soil data' },
            { val: 'Free', lbl: 'to get started' },
          ].map(s => (
            <div key={s.val} className="stat-bar-item">
              <div className="stat-bar-val">{s.val}</div>
              <div className="stat-bar-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEMS */}
      <section id="problems" className="section">
        <div className="section-inner">
          <FadeIn>
            <span className="section-tag">Why most forecasts fail farmers</span>
            <h2 className="section-title">Four things that go wrong<br />every season</h2>
            <p className="section-sub">
              These are not unusual situations. They happen to almost every smallholder in Kenya, every year. Here is what CropAI actually does about them.
            </p>
          </FadeIn>
          <div className="problem-grid">
            {PROBLEMS.map((p, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="problem-card">
                  <div className="problem-icon">{p.icon}</div>
                  <div className="problem-title">{p.title}</div>
                  <div className="problem-body">{p.body}</div>
                  <div className="problem-rule" />
                  <div className="solution-label">How we help</div>
                  <div className="solution-text">{p.solution}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CROPS */}
      <section id="crops" className="section crops-bg">
        <div className="section-inner">
          <FadeIn>
            <span className="section-tag">Supported crops</span>
            <h2 className="section-title">Nine crops, all major<br />Kenyan growing regions</h2>
            <p className="section-sub">
              The model was trained on Kenyan county data — not global averages. Nakuru maize behaves differently to Kitui maize. The predictions reflect that.
            </p>
          </FadeIn>
          <div className="crop-tabs">
            {SUPPORTED_CROPS.map((c, i) => (
              <button key={i} className={`crop-tab${activeCrop === i ? ' active' : ''}`} onClick={() => setActiveCrop(i)}>
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
          <FadeIn>
            <div className="crop-detail">
              <div className="crop-emoji-wrap">{SUPPORTED_CROPS[activeCrop].emoji}</div>
              <div>
                <div className="crop-name">{SUPPORTED_CROPS[activeCrop].name}</div>
                <div className="crop-meta-row">
                  <div>
                    <div className="crop-meta-label">Growing season</div>
                    <div className="crop-meta-val">{SUPPORTED_CROPS[activeCrop].season}</div>
                  </div>
                  <div>
                    <div className="crop-meta-label">Kenya avg yield</div>
                    <div className="crop-meta-val">{SUPPORTED_CROPS[activeCrop].yield}</div>
                  </div>
                </div>
                <div className="crop-check"><span className="crop-check-icon">✓</span>Yield estimate using your soil pH, moisture, and organic carbon</div>
                <div className="crop-check"><span className="crop-check-icon">✓</span>Net profit after fertilizer cost and local market price</div>
                <div className="crop-check"><span className="crop-check-icon">✓</span>Harvest window from your planting date</div>
                <div className="crop-check"><span className="crop-check-icon">✓</span>Risk flags for weather and soil conditions before you plant</div>
                <div className="crop-check"><span className="crop-check-icon">✓</span>AI recommendations specific to your inputs</div>
                <div style={{ marginTop: '1.5rem' }}>
                  <Link href="/signup" className="btn-primary">
                    Run a prediction for {SUPPORTED_CROPS[activeCrop].name} →
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section">
        <div className="section-inner">
          <FadeIn>
            <span className="section-tag">How it works</span>
            <h2 className="section-title">Three inputs.<br />One clear answer.</h2>
            <p className="section-sub">
              No complicated setup. No guesswork. Enter your details and see the numbers.
            </p>
          </FadeIn>
          <div className="steps">
            {[
              {
                n: '1',
                title: 'Enter your farm details',
                body: 'Your crop, location, planting date, and soil readings. Soil pH and moisture testers cost under 1,000 shillings at any agro-vet.',
              },
              {
                n: '2',
                title: 'The model runs on your data',
                body: 'XGBoost compares your inputs against 10 years of local weather and soil data from your region. Patterns from your specific county, not global averages.',
              },
              {
                n: '3',
                title: 'You get numbers to plan with',
                body: 'Expected yield, net profit after costs, harvest window, and any soil or weather risks worth knowing about before you plant.',
              },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="step">
                  <div className="step-num">{s.n}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-body">{s.body}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section testimonials-bg">
        <div className="section-inner">
          <FadeIn>
            <span className="section-tag">From farmers using CropAI</span>
            <h2 className="section-title">What changed for them</h2>
            <p className="section-sub">
              Not success stories. Honest accounts of one decision they made differently.
            </p>
          </FadeIn>
          <div className="testimonial-grid">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="testimonial-card">
                  <p className="testimonial-quote">{t.quote}</p>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-meta">{t.location} · {t.crop}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <FadeIn>
          <h2>Your next planting season<br />starts with a number</h2>
          <p>
            Create an account, enter your crop and location, and see what the data says. Takes about three minutes.
          </p>
          <Link href="/signup" className="btn-white">Get started — it is free</Link>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-logo">🌱 CropAI Kenya</div>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Terms</a>
            <a href="mailto:support@cropai-kenya.com" className="footer-link">Contact</a>
          </div>
          <div style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: '0.78rem' }}>
            © 2025 CropAI Kenya
          </div>
        </div>
      </footer>
    </div>
  );
}