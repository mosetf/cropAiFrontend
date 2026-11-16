'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { House, CirclePlus, MonitorSmartphone } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import apiClient from '@/lib/api';
import Logo from './Logo';

const TABS = [
  { href: '/dashboard', label: 'Home', match: ['/dashboard', '/results'], Icon: House },
  { href: '/predict', label: 'New estimate', match: ['/predict'], Icon: CirclePlus },
  { href: '/sessions', label: 'Sessions', match: ['/sessions'], Icon: MonitorSmartphone },
];

/**
 * Signed-in navigation: a translucent top bar, plus an iOS-style tab bar on phones.
 */
const AppNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const { user, logout } = useAuthStore();

  // Keep page content clear of the fixed tab bar on phones.
  useEffect(() => {
    document.body.classList.add('has-tabbar');
    return () => document.body.classList.remove('has-tabbar');
  }, []);

  const handleLogout = async () => {
    try { await apiClient.post('/api/v1/auth/logout/'); } catch {}
    logout();
    router.push('/login');
  };

  const isActive = (match: string[]) => match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
  const initial = user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <>
      <header className="glass sticky top-0 z-50 [border-bottom:0.5px_solid_var(--line)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/dashboard" aria-label="CropAI Kenya home" className="rounded-lg">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
            {TABS.map(({ href, label, match }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(match) ? 'page' : undefined}
                className={`rounded-full px-3.5 py-1.5 text-[15px] font-medium transition-colors ${
                  isActive(match) ? 'bg-fill text-ink' : 'text-ink-2 hover:text-ink'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span
              title={user?.email}
              className="hidden max-w-[180px] truncate text-[14px] text-ink-3 md:block"
            >
              {user?.email}
            </span>
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-[14px] font-semibold text-accent"
            >
              {initial}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-full px-2 py-1.5 text-[15px] font-medium text-accent hover:underline hover:underline-offset-4"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <nav
        aria-label="Main"
        className="glass fixed inset-x-0 bottom-0 z-50 [border-top:0.5px_solid_var(--line)] sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="mx-auto grid max-w-md grid-cols-3">
          {TABS.map(({ href, label, match, Icon }) => {
            const active = isActive(match);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                    active ? 'text-accent' : 'text-ink-3'
                  }`}
                >
                  <Icon size={25} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default AppNavbar;
