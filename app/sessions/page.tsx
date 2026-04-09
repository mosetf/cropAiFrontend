'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/utils/ProtectedRoute';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import apiClient from '@/lib/api';
import { UserSession } from '@/types';
import Link from 'next/link';
import { Navbar, Card, PageHeader, Button } from '@/components';
import { ArrowLeft, Monitor, Smartphone, Tablet, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

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

  const getDeviceIcon = (deviceName: string) => {
    const lower = deviceName.toLowerCase();
    if (lower.includes('mobile') || lower.includes('phone') || lower.includes('android') || lower.includes('iphone')) {
      return <Smartphone size={20} className="text-neutral-600" />;
    }
    if (lower.includes('tablet') || lower.includes('ipad')) {
      return <Tablet size={20} className="text-neutral-600" />;
    }
    return <Monitor size={20} className="text-neutral-600" />;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar showAuth />

      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>

        <PageHeader
          title="Active Sessions"
          description="Manage devices where you're signed in"
          action={
            sessions.length > 1 ? (
              <Button
                variant="danger"
                size="sm"
                onClick={revokeAllOthers}
                icon={<XCircle size={16} />}
              >
                Revoke All Others
              </Button>
            ) : undefined
          }
        />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <Card padding="none">
          {isLoading ? (
            <p className="px-6 py-8 text-center text-neutral-500">Loading sessions...</p>
          ) : sessions.length > 0 ? (
            <ul className="divide-y divide-neutral-200">
              {sessions.map((session) => (
                <li key={session.id} className="px-6 py-5 hover:bg-neutral-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getDeviceIcon(session.device_name)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-neutral-900">
                            {session.device_name}
                          </h3>
                          {session.is_current && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-primary-700 bg-primary-100 rounded-full">
                              <CheckCircle2 size={12} />
                              Current
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm text-neutral-600">
                            {session.browser} on {session.os}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <span>IP: {session.ip_address}</span>
                            <span>Last active: {new Date(session.last_active).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {!session.is_current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeSession(session.id)}
                        icon={<XCircle size={16} />}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-12 text-center">
              <Monitor size={48} className="mx-auto text-neutral-400 mb-4" />
              <p className="text-neutral-600">No active sessions found</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function SessionsPage() {
  return (
    <ProtectedRoute>
      <SessionsContent />
    </ProtectedRoute>
  );
}
