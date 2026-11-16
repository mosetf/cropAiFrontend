'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ChevronLeft, Laptop, Smartphone, Tablet, XCircle } from 'lucide-react';
import { ProtectedRoute } from '@/utils/ProtectedRoute';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import apiClient from '@/lib/api';
import { UserSession } from '@/types';
import AppNavbar from '@/components/AppNavbar';
import { Button, PageHeader } from '@/components';

function deviceIcon(session: UserSession) {
  const hint = `${session.device_type ?? ''} ${session.device_name ?? ''}`.toLowerCase();
  if (hint.includes('mobile') || hint.includes('phone') || hint.includes('android') || hint.includes('iphone')) {
    return <Smartphone size={19} />;
  }
  if (hint.includes('tablet') || hint.includes('ipad')) return <Tablet size={19} />;
  return <Laptop size={19} />;
}

function lastActive(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function SessionsContent() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  useInactivityTimer();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/auth/sessions/');
      setSessions(response.data);
      setError('');
    } catch (err: any) {
      setError('Could not load sessions');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const revokeSession = async (sessionId: number) => {
    try {
      await apiClient.delete(`/api/v1/auth/sessions/?id=${sessionId}`);
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (err: any) {
      setError('Could not revoke session');
      console.error(err);
    }
  };

  const revokeAllOthers = async () => {
    if (!window.confirm('This will sign you out of all other devices. Continue?')) {
      return;
    }
    try {
      await apiClient.delete('/api/v1/auth/sessions/');
      fetchSessions();
    } catch (err: any) {
      setError('Could not revoke sessions');
      console.error(err);
    }
  };

  return (
    <>
      <AppNavbar />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        <Link href="/dashboard" className="-ml-2 mb-4 inline-flex min-h-[44px] items-center gap-0.5 rounded-full px-2 text-[17px] font-medium text-accent">
          <ChevronLeft size={22} aria-hidden="true" /> Home
        </Link>

        <PageHeader
          title="Active sessions"
          description="The devices where you're signed in."
          action={
            sessions.length > 1 ? (
              <Button variant="danger" size="sm" onClick={revokeAllOthers} icon={<XCircle size={16} />}>
                Sign out other devices
              </Button>
            ) : undefined
          }
        />

        {error && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-[14px] bg-bad-soft p-4 text-[15px] text-bad">
            <AlertCircle className="mt-0.5 shrink-0" size={19} aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="group" aria-busy="true" aria-label="Loading sessions">
            {[0, 1].map((i) => (
              <div key={i} className="row">
                <div className="skeleton h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32" />
                  <div className="skeleton h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : sessions.length > 0 ? (
          <ul className="group">
            {sessions.map((session) => (
              <li key={session.id} className="row !items-start">
                <span aria-hidden="true" className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-fill text-ink-2">
                  {deviceIcon(session)}
                </span>
                <div className="row-label min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {session.device_name}
                    {session.is_current && (
                      <span className="rounded-full bg-good-soft px-2.5 py-0.5 text-[12px] font-semibold text-good">This device</span>
                    )}
                  </p>
                  {session.device_name !== `${session.browser} on ${session.os}` && (
                    <p className="text-[15px] text-ink-2">{session.browser} on {session.os}</p>
                  )}
                  <p className="num mt-0.5 text-[13px] text-ink-3">
                    Last active {lastActive(session.last_active)} · IP {session.ip_address}
                  </p>
                </div>
                {!session.is_current && (
                  <Button variant="ghost" size="sm" onClick={() => revokeSession(session.id)} className="shrink-0 whitespace-nowrap !text-bad hover:!bg-bad-soft">
                    Sign out
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          !error && (
            <div className="group px-6 py-12 text-center">
              <Laptop size={40} className="mx-auto mb-3 text-ink-3" aria-hidden="true" />
              <p className="text-ink-2">No active sessions found.</p>
            </div>
          )
        )}
      </main>
    </>
  );
}

export default function SessionsPage() {
  return (
    <ProtectedRoute>
      <SessionsContent />
    </ProtectedRoute>
  );
}
