'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/utils/ProtectedRoute';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import apiClient from '@/lib/api';
import Link from 'next/link';
import { Navbar, Button, Card } from '@/components';
import {
  ArrowLeft,
  AlertCircle,
  Calendar,
  Droplets,
  Sprout,
  ChevronDown,
  CloudRain,
} from 'lucide-react';
import { CropOption, LocationsGrouped } from '@/types';

function PredictContent() {
  const router = useRouter();
  useInactivityTimer();

  const [crops, setCrops] = useState<CropOption[]>([]);
  const [locationsGrouped, setLocationsGrouped] = useState<LocationsGrouped>({});
  const [metaLoading, setMetaLoading] = useState(true);

  const [formData, setFormData] = useState({
    crop: 'maize',
    location: 'Nakuru',
    planting_date: '',
    soil_ph: 6.0,
    soil_moisture: 25.0,
    organic_carbon: 1.5,
    fertilizer_kg_ha: 100.0,
    // Weather inputs - actual user inputs
    rainfall: 800.0,
    temperature: 22.0,
    humidity: 65.0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load crops and locations from the API once on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [cropsRes, locsRes] = await Promise.all([
          apiClient.get('/api/v1/meta/crops/'),
          apiClient.get('/api/v1/meta/locations/'),
        ]);
        setCrops(cropsRes.data);
        setLocationsGrouped(locsRes.data);
      } catch {
        // Non-fatal — form still works with hardcoded defaults
      } finally {
        setMetaLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'crop' || name === 'location' || name === 'planting_date'
          ? value
          : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Send complete payload with backend-required fields set programmatically
      const payload = {
        ...formData,
        // Set default values for backend-required fields (not user input)
        predicted_yield: 0, // Backend will compute this
        harvest_window: '', // Backend will compute this
        net_profit: 0, // Backend will compute this
        rainfall: formData.rainfall || 800, // Default rainfall if not set
        temperature: formData.temperature || 22, // Default temperature if not set
        humidity: formData.humidity || 65, // Default humidity if not set
      };
      
      const response = await apiClient.post('/api/v1/predictions/', payload);
      router.push(`/results/${response.data.id}`);
    } catch (err: any) {
      const data = err.response?.data || {};
      console.error('Prediction error:', data);
      
      if (err.response?.status === 400 && data && typeof data === 'object') {
        // Handle field-specific errors
        const errorMessages: string[] = [];
        Object.keys(data).forEach(field => {
          const fieldErrors = data[field];
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            errorMessages.push(`${field}: ${fieldErrors[0]}`);
          }
        });
        setError(errorMessages.length > 0 ? errorMessages.join(', ') : 'Validation error');
      } else {
        setError(
          data.detail ||
            data.error ||
            'Could not create prediction. Check your inputs and try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar showAuth />

      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back to dashboard
        </Link>

        <Card>
          <div className="px-6 py-5 border-b border-neutral-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Sprout className="text-primary-700" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">New prediction</h2>
            </div>
            <p className="text-neutral-600">
              Enter your farm details to forecast yield and profit.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Crop + Location */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Crop type
                </label>
                <div className="relative">
                  <select
                    name="crop"
                    value={formData.crop}
                    onChange={handleChange}
                    disabled={metaLoading}
                    className="w-full appearance-none px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 text-neutral-900 transition pr-10 disabled:opacity-60"
                  >
                    {crops.length > 0 ? (
                      crops.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))
                    ) : (
                      // Fallback while loading
                      <>
                        <option value="maize">Maize</option>
                        <option value="beans">Beans</option>
                        <option value="wheat">Wheat</option>
                        <option value="sorghum">Sorghum</option>
                        <option value="coffee">Coffee</option>
                        <option value="tea">Tea</option>
                        <option value="potatoes">Potatoes</option>
                        <option value="cassava">Cassava</option>
                        <option value="rice">Rice</option>
                      </>
                    )}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Location
                </label>
                <div className="relative">
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={metaLoading}
                    className="w-full appearance-none px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 text-neutral-900 transition pr-10 disabled:opacity-60"
                  >
                    {Object.keys(locationsGrouped).length > 0 ? (
                      Object.entries(locationsGrouped).map(([region, locs]) => (
                        <optgroup key={region} label={region}>
                          {locs.map((loc) => (
                            <option key={loc.value} value={loc.value}>
                              {loc.label}
                            </option>
                          ))}
                        </optgroup>
                      ))
                    ) : (
                      // Fallback — key locations while loading
                      <>
                        <option value="Nakuru">Nakuru</option>
                        <option value="Eldoret">Eldoret</option>
                        <option value="Kisumu">Kisumu</option>
                        <option value="Meru">Meru</option>
                        <option value="Kitale">Kitale</option>
                      </>
                    )}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-900 mb-2">
                  <Calendar size={16} />
                  Planting date
                </label>
                <input
                  type="date"
                  name="planting_date"
                  value={formData.planting_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 text-neutral-900 transition"
                />
              </div>
            </div>

            {/* Soil conditions */}
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 mb-4">
                <Droplets size={20} className="text-primary-600" />
                Soil conditions
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Soil pH
                  </label>
                  <input
                    type="number"
                    name="soil_ph"
                    step="0.1"
                    min="3"
                    max="10"
                    value={formData.soil_ph}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 text-neutral-900 transition"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Optimal for most crops: 5.5–7.0
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Soil moisture (%)
                  </label>
                  <input
                    type="number"
                    name="soil_moisture"
                    step="0.5"
                    min="0"
                    max="100"
                    value={formData.soil_moisture}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 text-neutral-900 transition"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Field capacity: 20–30%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Organic carbon (%)
                  </label>
                  <input
                    type="number"
                    name="organic_carbon"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.organic_carbon}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 text-neutral-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Fertilizer (kg/ha)
                  </label>
                  <input
                    type="number"
                    name="fertilizer_kg_ha"
                    step="5"
                    min="0"
                    value={formData.fertilizer_kg_ha}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 text-neutral-900 transition"
                  />
                </div>
              </div>

              {/* Weather Conditions */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-1 flex items-center gap-2">
                  <CloudRain size={20} />
                  Weather Conditions
                </h3>
                <p className="text-sm text-blue-700 mb-4">Expected weather for your growing season</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      Expected Rainfall (mm/season)
                    </label>
                    <input
                      type="number"
                      name="rainfall"
                      step="10"
                      min="200"
                      max="2000"
                      value={formData.rainfall}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 text-neutral-900 transition"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Typical: 600-1200mm
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      Average Temperature (°C)
                    </label>
                    <input
                      type="number"
                      name="temperature"
                      step="0.5"
                      min="10"
                      max="35"
                      value={formData.temperature}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 text-neutral-900 transition"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Growing season average
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      Average Humidity (%)
                    </label>
                    <input
                      type="number"
                      name="humidity"
                      step="1"
                      min="40"
                      max="90"
                      value={formData.humidity}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 text-neutral-900 transition"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Relative humidity
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Running prediction...' : 'Create prediction'}
              </Button>
              <p className="mt-3 text-xs text-center text-neutral-500">
                Weather data is fetched automatically from OpenWeather for your
                selected location.
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function PredictPage() {
  return (
    <ProtectedRoute>
      <PredictContent />
    </ProtectedRoute>
  );
}
