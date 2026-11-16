'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Trash2, CloudRain, Thermometer, Droplets, FlaskConical, Sprout } from 'lucide-react';
import { ProtectedRoute } from '@/utils/ProtectedRoute';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import apiClient from '@/lib/api';
import AppNavbar from '@/components/AppNavbar';
import RiskBadge from '@/components/RiskBadge';
import { Group, Row } from '@/components/Group';
import { formatDate, formatKes, formatWindow, maizeBagsPerAcre, tonnesPerAcre } from '@/lib/units';
import { YieldPrediction } from '@/types';

/** Counts up to a number once, unless the visitor prefers reduced motion. */
function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    setValue(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);
  return value;
}

function titleCase(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function YieldRange({ low, mid, high }: { low: number; mid: number; high: number }) {
  const scaleMax = Math.max(high * 1.25, 0.1);
  const pct = (n: number) => `${Math.min(100, Math.max(0, (n / scaleMax) * 100))}%`;
  return (
    <div>
      <div
        role="img"
        aria-label={`Expected between ${low.toFixed(1)} and ${high.toFixed(1)} tonnes per hectare, best estimate ${mid.toFixed(1)}`}
        className="relative h-3 rounded-full bg-fill"
      >
        <div
          className="absolute inset-y-0 rounded-full bg-accent opacity-30"
          style={{ left: pct(low), width: `calc(${pct(high)} - ${pct(low)})` }}
        />
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface bg-accent shadow-card"
          style={{ left: pct(mid) }}
        />
      </div>
      <div className="num mt-3 flex justify-between text-[14px] text-ink-3">
        <span>Low {low.toFixed(1)}</span>
        <span>High {high.toFixed(1)}</span>
      </div>
    </div>
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

  const shownYield = useCountUp(prediction?.predicted_yield ?? 0);
  const perAcre = prediction ? tonnesPerAcre(prediction.predicted_yield) : 0;
  const bags = prediction ? maizeBagsPerAcre(prediction.crop, prediction.predicted_yield) : null;

  return (
    <>
      <AppNavbar />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="-ml-2 inline-flex min-h-[44px] items-center gap-0.5 rounded-full px-2 text-[17px] font-medium text-accent">
            <ChevronLeft size={22} aria-hidden="true" /> Home
          </Link>
          {prediction && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-[15px] font-medium text-bad hover:bg-bad-soft disabled:opacity-50"
            >
              <Trash2 size={17} aria-hidden="true" /> {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>

        {loading && (
          <div role="status" className="py-24 text-center text-ink-3">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-accent" />
            Loading your estimate…
          </div>
        )}

        {!loading && error && (
          <div role="alert" className="rounded-squircle bg-bad-soft p-5 text-[17px] text-bad">
            {error}
          </div>
        )}

        {prediction && (
          <div className="space-y-8">
            <header className="rise" style={{ '--i': 0 } as React.CSSProperties}>
              <p className="eyebrow">
                {titleCase(prediction.crop)} · {prediction.location}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="num text-[88px] font-bold leading-[0.9] tracking-[-0.05em] text-ink sm:text-[112px]">
                  {shownYield.toFixed(1)}
                </span>
                <span className="text-[26px] font-semibold text-ink-3">t/ha</span>
              </div>
              <p className="mt-3 text-[17px] text-ink-2">
                About {perAcre.toFixed(2)} tonnes per acre
                {bags !== null && <> · roughly {Math.round(bags)} bags of 90 kg</>}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <RiskBadge level={prediction.risk_level} />
                <span className="text-[15px] text-ink-3">{prediction.region} · planted {formatDate(prediction.planting_date)}</span>
              </div>
            </header>

            {prediction.yield_low !== null && prediction.yield_high !== null && (
              <section className="rise rounded-squircle bg-surface p-5 shadow-card" style={{ '--i': 1 } as React.CSSProperties}>
                <h2 className="mb-5 text-[17px] font-semibold tracking-[-0.02em]">Expected range</h2>
                <YieldRange low={prediction.yield_low} mid={prediction.predicted_yield} high={prediction.yield_high} />
              </section>
            )}

            <Group title="Estimate" className="rise" >
              <Row label="Net profit" value={<span className="font-semibold text-ink">{formatKes(prediction.net_profit)}</span>} />
              <Row label="Harvest window" value={formatWindow(prediction.harvest_window)} />
              <Row label="Planting date" value={formatDate(prediction.planting_date)} />
            </Group>

            <Group title="Risk">
              <Row label={<RiskBadge level={prediction.risk_level} />} />
              {prediction.risk_reason && <Row label={<span className="text-ink-2">{prediction.risk_reason}</span>} />}
            </Group>

            {prediction.ai_recommendations?.length > 0 && (
              <section>
                <h2 className="group-title">Recommendations</h2>
                <ol className="group">
                  {prediction.ai_recommendations.map((rec, i) => (
                    <li key={i} className="row items-start">
                      <span
                        aria-hidden="true"
                        className="num mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft text-[14px] font-bold text-accent"
                      >
                        {i + 1}
                      </span>
                      <p className="min-w-0 flex-1 text-[17px] leading-snug text-ink">{rec}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <Group
              title="Basis of this estimate"
              footer={
                prediction.fallback_used
                  ? 'Some figures used default values because live weather or advice was unavailable.'
                  : 'Weather and advice came from live sources.'
              }
            >
              <Row icon={<CloudRain size={17} />} label="Rainfall" value={`${prediction.rainfall} mm`} />
              <Row icon={<Thermometer size={17} />} label="Temperature" value={`${prediction.temperature} °C`} />
              <Row icon={<Droplets size={17} />} label="Humidity" value={`${prediction.humidity}%`} />
              <Row icon={<FlaskConical size={17} />} label="Soil pH" value={prediction.soil_ph !== null ? prediction.soil_ph.toFixed(1) : '–'} />
              <Row icon={<Droplets size={17} />} label="Soil moisture" value={prediction.soil_moisture !== null ? `${prediction.soil_moisture}%` : '–'} />
              <Row icon={<Sprout size={17} />} label="Fertilizer" value={prediction.fertilizer_kg_ha !== null ? `${prediction.fertilizer_kg_ha} kg/ha` : '–'} />
            </Group>

            <p className="px-1 text-[13px] leading-relaxed text-ink-3">
              This is an estimate, not a forecast. Check it against advice from your extension officer or agro-vet.
              <br />
              {prediction.model_version} · generated {new Date(prediction.created_at).toLocaleString('en-GB')}
            </p>
          </div>
        )}
      </main>
    </>
  );
}

export default function ResultsPage() {
  return <ProtectedRoute><ResultsContent /></ProtectedRoute>;
}
