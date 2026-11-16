'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ChevronRight, MonitorSmartphone, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { ProtectedRoute } from '@/utils/ProtectedRoute';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import apiClient from '@/lib/api';
import { formatDate, formatKes } from '@/lib/units';
import { YieldPrediction, RiskLevel } from '@/types';
import AppNavbar from '@/components/AppNavbar';
import { Group, Row } from '@/components/Group';

const RISK_DOT: Record<RiskLevel, string> = {
  low: 'bg-good',
  medium: 'bg-warn',
  high: 'bg-bad',
};

function titleCase(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function DashboardContent() {
  const { user } = useAuthStore();
  const [predictions, setPredictions] = useState<YieldPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  useInactivityTimer();

  const load = useCallback(() => {
    setIsLoading(true);
    setLoadFailed(false);
    apiClient.get('/api/v1/predictions/')
      .then(r => setPredictions(Array.isArray(r.data) ? r.data : []))
      .catch(() => setLoadFailed(true))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const total = predictions.length;
  const avgYield = total ? (predictions.reduce((a, p) => a + p.predicted_yield, 0) / total).toFixed(1) : '–';
  const name = user?.email ? user.email.split('@')[0] : '';

  return (
    <>
      <AppNavbar />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
        <header className="rise mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[34px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[44px]">
              Welcome back{name ? `, ${name}` : ''}
            </h1>
            <p className="mt-2 text-[17px] text-ink-2">Track your estimates and plan your next season.</p>
          </div>
          <Link href="/predict" className="btn btn-primary">
            <Plus size={19} strokeWidth={2.4} aria-hidden="true" /> New estimate
          </Link>
        </header>

        {loadFailed && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-[14px] bg-bad-soft p-4 text-[15px] text-bad">
            <AlertCircle className="mt-0.5 shrink-0" size={19} aria-hidden="true" />
            <p className="flex-1">We couldn&apos;t load your estimates.</p>
            <button onClick={load} className="font-semibold underline underline-offset-4">Try again</button>
          </div>
        )}

        <div className="space-y-8">
          <Group title="Overview">
            <Row label="Estimates created" value={<span className="num font-semibold text-ink">{isLoading ? '…' : total}</span>} />
            <Row label="Average yield" value={<span className="num font-semibold text-ink">{isLoading ? '…' : total ? `${avgYield} t/ha` : '–'}</span>} />
          </Group>

          <section>
            <h2 className="group-title">Recent estimates</h2>
            {isLoading ? (
              <div className="group" aria-busy="true" aria-label="Loading estimates">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="row">
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-24" />
                      <div className="skeleton h-3 w-40" />
                    </div>
                    <div className="skeleton h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : total > 0 ? (
              <ul className="group">
                {predictions.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <Link href={`/results/${p.id}`} className="row row-link">
                      <span
                        aria-label={`${p.risk_level} risk`}
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${RISK_DOT[p.risk_level] ?? 'bg-ink-3'}`}
                      />
                      <div className="row-label min-w-0">
                        <p className="font-semibold">{titleCase(p.crop)}</p>
                        <p className="text-[14px] text-ink-3">{p.location} · {formatDate(p.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="num font-semibold">{p.predicted_yield.toFixed(1)} t/ha</p>
                        <p className="num text-[14px] text-ink-3">{formatKes(p.net_profit)}</p>
                      </div>
                      <ChevronRight size={18} className="shrink-0 text-ink-3" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              !loadFailed && (
                <div className="group px-6 py-10 text-center">
                  <p className="mx-auto max-w-sm text-[17px] text-ink-2">
                    No estimates yet. Run your first one to see what your land can produce.
                  </p>
                  <Link href="/predict" className="btn btn-primary mt-6">Create an estimate</Link>
                </div>
              )
            )}
          </section>

          <Group title="Account">
            <Link href="/sessions" className="row row-link">
              <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                <MonitorSmartphone size={17} />
              </span>
              <div className="row-label min-w-0">
                <p>Active sessions</p>
                <p className="text-[14px] text-ink-3">View and revoke logins</p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-ink-3" aria-hidden="true" />
            </Link>
          </Group>
        </div>
      </main>
    </>
  );
}

export default function Dashboard() {
  return <ProtectedRoute><DashboardContent /></ProtectedRoute>;
}
