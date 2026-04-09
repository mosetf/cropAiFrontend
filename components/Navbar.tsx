'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { LogOut, User, Sprout } from 'lucide-react';
import apiClient from '@/lib/api';

interface NavbarProps {
  showAuth?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showAuth = true }) => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/v1/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      router.push('/login');
    }
  };

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={showAuth ? "/dashboard" : "/"} className="flex items-center gap-2 text-primary-700 hover:text-primary-800 transition">
            <Sprout size={28} />
            <span className="text-xl font-bold">CropAI Kenya</span>
          </Link>
          
          {showAuth && user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <User size={16} />
                <span>{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
