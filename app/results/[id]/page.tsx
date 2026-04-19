'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/utils/ProtectedRoute';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import apiClient from '@/lib/api';
import Link from 'next/link';
import { Navbar, Button, Card, StatCard } from '@/components';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Calendar,
  Thermometer,
  Droplets,
  Wind,
  TestTube,
  Sprout,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { YieldPrediction, RiskLevel } from '@/types';

function ResultsContent() {
  const params = useParams();
  const router = useRouter();
  const predictionId = params.id as string;
  useInactivityTimer();

  const [prediction, setPrediction] = useState<YieldPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await apiClient.get(`/api/v1/predictions/${predictionId}/`);
        setPrediction(response.data);
      } catch (err: any) {
        setError('Could not load prediction details');
      } finally {
        setIsLoading(false);
      }
    };

    if (predictionId) {
      fetchPrediction();
    }
  }, [predictionId]);

  const handleDelete = async () => {
    if (!confirm('Delete this prediction? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/v1/predictions/${predictionId}/`);
      router.push('/dashboard');
    } catch (err) {
      alert('Failed to delete prediction. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRiskBadge = (level: string | undefined) => {
    if (!level || !['low', 'medium', 'high'].includes(level)) {
      level = 'medium';
    }
    const riskLevel = level as RiskLevel;
    const styles = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-red-100 text-red-800 border-red-200',
    };
    const icons = {
      low: <CheckCircle2 size={16} />,
      medium: <AlertTriangle size={16} />,
      high: <AlertCircle size={16} />,
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${styles[riskLevel]}`}>
        {icons[riskLevel]}
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} risk
      </span>
    );
  };

  const renderConfidenceInterval = () => {
    if (!prediction?.yield_low || !prediction?.yield_high) return null;

    const { predicted_yield, yield_low, yield_high } = prediction;
    const range = yield_high - yield_low;
    const predictedPosition = ((predicted_yield - yield_low) / range) * 100;

    return (
      <div className="bg-neutral-50 rounded-lg p-4 mt-4">
        <h4 className="text-sm font-medium text-neutral-900 mb-2">Confidence interval</h4>
        <div className="relative">
          <div className="h-2 bg-neutral-200 rounded-full">
            <div 
              className="absolute h-2 bg-primary-500 rounded-full top-0" 
              style={{ left: `${predictedPosition}%`, width: '4px' }}
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-600 mt-1">
            <span>{yield_low.toFixed(1)} t/ha</span>
            <span>{yield_high.toFixed(1)} t/ha</span>
          </div>
          <div 
            className="absolute -top-6 text-xs font-medium text-primary-700"
            style={{ left: `${predictedPosition}%`, transform: 'translateX(-50%)' }}
          >
            {predicted_yield.toFixed(1)}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar showAuth />
        <div className="flex items-center justify-center py-20">
          <p className="text-neutral-600">Loading prediction...</p>
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar showAuth />
        <div className="max-w-2xl mx-auto py-8 px-4">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          <Card>
            <div className="p-8 text-center">
              <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
              <p className="text-red-800">{error}</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar showAuth />

      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded-full uppercase">
              {prediction.crop}
            </span>
            <span className="text-neutral-600">{prediction.location}, {prediction.region}</span>
            {getRiskBadge(prediction.risk_level)}
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Prediction Results</h1>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <StatCard
            icon={<TrendingUp size={24} />}
            label="Predicted Yield"
            value={`${prediction.predicted_yield.toFixed(1)}`}
            description="tonnes per hectare"
            variant="primary"
          />

          <StatCard
            icon={<DollarSign size={24} />}
            label="Net Profit"
            value={`KES ${prediction.net_profit.toLocaleString()}`}
            description="estimated return"
            variant="default"
          />

          <StatCard
            icon={<Calendar size={24} />}
            label="Harvest Window"
            value={prediction.harvest_window}
            description="expected timeframe"
            variant="secondary"
          />
        </div>

        {renderConfidenceInterval()}

        {/* Risk Assessment */}
        {prediction.risk_reason && (
          <Card className="mb-8">
            <div className="px-6 py-5 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">Risk Assessment</h2>
            </div>
            <div className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-amber-800 font-medium mb-1">Risk Level: {prediction.risk_level}</p>
                    <p className="text-amber-700">{prediction.risk_reason}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Input Parameters */}
        <Card className="mb-8">
          <div className="px-6 py-5 border-b border-neutral-200">
            <h2 className="text-xl font-semibold text-neutral-900">Input Parameters</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              <div className="flex items-start gap-3">
                <Thermometer size={20} className="text-neutral-500 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-600">Temperature</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {prediction.temperature}°C
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Droplets size={20} className="text-neutral-500 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-600">Rainfall</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {prediction.rainfall} mm
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Wind size={20} className="text-neutral-500 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-600">Humidity</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {prediction.humidity}%
                  </p>
                </div>
              </div>

              {prediction.soil_ph && (
                <div className="flex items-start gap-3">
                  <TestTube size={20} className="text-neutral-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-600">Soil pH</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {prediction.soil_ph}
                    </p>
                  </div>
                </div>
              )}

              {prediction.fertilizer_kg_ha && (
                <div className="flex items-start gap-3">
                  <Sprout size={20} className="text-neutral-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-600">Fertilizer</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {prediction.fertilizer_kg_ha} kg/ha
                    </p>
                  </div>
                </div>
              )}

              {prediction.soil_moisture && (
                <div className="flex items-start gap-3">
                  <Droplets size={20} className="text-neutral-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-600">Soil Moisture</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {prediction.soil_moisture}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* AI Recommendations */}
        {prediction.ai_recommendations && prediction.ai_recommendations.length > 0 && (
          <Card>
            <div className="px-6 py-5 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">AI Recommendations</h2>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2">
                  {prediction.ai_recommendations.map((rec, index) => (
                    <li key={index} className="text-blue-800">
                      {rec}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Card>
        )}

        {/* Model Info */}
        <div className="mt-8 text-center text-xs text-neutral-500">
          <p>Model version: {prediction.model_version}</p>
          <p>Generated on: {new Date(prediction.created_at).toLocaleString()}</p>
          {prediction.fallback_used && (
            <p className="text-amber-600">⚠️ Fallback model used due to incomplete weather data</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <ProtectedRoute>
      <ResultsContent />
    </ProtectedRoute>
  );
}
