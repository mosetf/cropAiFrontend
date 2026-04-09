'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { ProtectedRoute } from '@/utils/ProtectedRoute';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import apiClient from '@/lib/api';
import { YieldPrediction } from '@/types';
import Link from 'next/link';
import { Navbar, StatCard, PageHeader, Card } from '@/components';
import { Plus, Activity, BarChart3, TrendingUp, MapPin } from 'lucide-react';

function DashboardContent() {
  const { user } = useAuthStore();
  const [predictions, setPredictions] = useState<YieldPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useInactivityTimer();

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await apiClient.get('/api/v1/predictions/');
        setPredictions(response.data);
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar showAuth />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title={`Welcome back`}
          description="Track your predictions and see past results."
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <StatCard
            icon={<Plus size={24} />}
            label="New Prediction"
            value="Create"
            description="Start a new crop forecast"
            href="/predict"
            variant="primary"
          />

          <StatCard
            icon={<Activity size={24} />}
            label="Active Sessions"
            value="Manage"
            description="View login sessions"
            href="/sessions"
          />

          <StatCard
            icon={<BarChart3 size={24} />}
            label="Total Predictions"
            value={predictions.length}
            description="Estimates created"
          />
        </div>

        {/* Recent Predictions */}
        <Card>
          <div className="px-6 py-5 border-b border-neutral-200">
            <h2 className="text-xl font-semibold text-neutral-900">Recent Estimates</h2>
          </div>
          <div>
            {isLoading ? (
              <p className="px-6 py-8 text-center text-neutral-500">Loading estimates...</p>
            ) : predictions.length > 0 ? (
              <ul className="divide-y divide-neutral-200">
                {predictions.slice(0, 5).map((prediction) => (
                  <li key={prediction.id} className="px-6 py-5 hover:bg-neutral-50 transition">
                    <Link href={`/results/${prediction.id}`} className="block">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full uppercase">
                              {prediction.crop}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-neutral-600">
                              <MapPin size={14} />
                              <span>{prediction.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              <TrendingUp size={16} className="text-primary-600" />
                              <span className="font-semibold text-neutral-900">
                                {prediction.predicted_yield} t/ha
                              </span>
                            </div>
                            <span className="text-neutral-500">
                              KES {prediction.net_profit.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                          View →
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center">
                <BarChart3 size={48} className="mx-auto text-neutral-400 mb-4" />
                <p className="text-neutral-600 mb-4">No estimates yet</p>
                <Link 
                  href="/predict"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Plus size={16} />
                  Create your first estimate
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
