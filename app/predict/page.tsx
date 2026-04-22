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
  Banknote,
  Users,
  Info,
  Thermometer,
  Loader2,
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
    // Optional economic overrides
    market_price: '',
    labour_cost: '',
  });

  // Live weather preview for selected location
  const [weather, setWeather] = useState<{ temp: number; humidity: number; description: string } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load crops and locations from the API once on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [cropsRes, locsRes] = await Promise.all([
          apiClient.get('/api/v1/meta/crops/'),
          apiClient.get('/api/v1/meta/locations/'),
        ]);

        // Backend returns { crops: [...], count: N }
        setCrops(cropsRes.data.crops || []);

        // Backend returns { locations: [...], count: N } — group by region
        const locations = locsRes.data.locations || [];
        const grouped: LocationsGrouped = {};
        for (const loc of locations) {
          const region = loc.region || 'Other';
          if (!grouped[region]) grouped[region] = [];
          grouped[region].push({
            value: loc.name,
            label: loc.name,
            region: loc.region,
            lat: loc.lat,
            lon: loc.lon,
          });
        }
        setLocationsGrouped(grouped);
      } catch {
        // Non-fatal — form still works with hardcoded defaults
      } finally {
        setMetaLoading(false);
      }
    };
    load();
  }, []);

  // Fetch live weather preview when location changes
  useEffect(() => {
    if (metaLoading) return;

    // Find lat/lon for selected location
    let lat: number | null = null;
    let lon: number | null = null;
    for (const locs of Object.values(locationsGrouped)) {
      const found = locs.find((l) => l.value === formData.location);
      if (found) {
        lat = found.lat;
        lon = found.lon;
        break;
      }
    }
    if (!lat || !lon) return;

    let cancelled = false;
    const fetchWeather = async () => {
      setWeatherLoading(true);
      setWeather(null);
      setWeatherError(false);
      try {
        const res = await apiClient.get('/api/v1/weather/current/', {
          params: { lat, lon },
        });
        if (!cancelled) {
          setWeather({
            temp: res.data.temperature,
            humidity: res.data.humidity,
            description: res.data.description || 'Current conditions',
          });
        }
      } catch {
        if (!cancelled) {
          setWeatherError(true);
          setWeather(null);
        }
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    };
    fetchWeather();
    return () => { cancelled = true; };
  }, [formData.location, metaLoading, locationsGrouped]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'crop' || name === 'location' || name === 'planting_date' || name === 'market_price' || name === 'labour_cost'
          ? value
          : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Only send user input fields — backend auto-fetches weather & computes outputs
      const payload: Record<string, unknown> = {
        crop: formData.crop,
        location: formData.location,
        planting_date: formData.planting_date,
        soil_ph: formData.soil_ph,
        soil_moisture: formData.soil_moisture,
        organic_carbon: formData.organic_carbon,
        fertilizer_kg_ha: formData.fertilizer_kg_ha,
      };

      // Only include optional fields if user filled them
      if (formData.market_price) payload.market_price = parseFloat(formData.market_price);
      if (formData.labour_cost) payload.labour_cost = parseFloat(formData.labour_cost);

      const response = await apiClient.post('/api/v1/predictions/', payload);
      router.push(`/results/${response.data.id}`);
    } catch (err: any) {
      const data = err.response?.data || {};
      console.error('Prediction error:', data);

      if (err.response?.status === 400 && data && typeof data === 'object') {
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
          data.detail || data.error || 'Could not create prediction. Check your inputs and try again.'
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
            <p className="text-neutral-600 text-sm">
              Enter your farm details. Weather is fetched automatically for your location.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* ── Crop + Location + Date ─────────────────────────────── */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-1.5">
                  Crop type
                </label>
                <div className="relative">
                  <select
                    name="crop"
                    value={formData.crop}
                    onChange={handleChange}
                    disabled={metaLoading}
                    className="w-full appearance-none px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-neutral-900 transition pr-10 disabled:opacity-60 bg-white"
                  >
                    {crops.length > 0 ? (
                      crops.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))
                    ) : (
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
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-1.5">
                  Location
                </label>
                <div className="relative">
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={metaLoading}
                    className="w-full appearance-none px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-neutral-900 transition pr-10 disabled:opacity-60 bg-white"
                  >
                    {Object.keys(locationsGrouped).length > 0 ? (
                      Object.entries(locationsGrouped).map(([region, locs]) => (
                        <optgroup key={region} label={region}>
                          {locs.map((loc) => (
                            <option key={loc.value} value={loc.value}>{loc.label}</option>
                          ))}
                        </optgroup>
                      ))
                    ) : (
                      <>
                        <option value="Nakuru">Nakuru</option>
                        <option value="Eldoret">Eldoret</option>
                        <option value="Kisumu">Kisumu</option>
                        <option value="Meru">Meru</option>
                        <option value="Kitale">Kitale</option>
                      </>
                    )}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-900 mb-1.5">
                  <Calendar size={16} />
                  Planting date
                </label>
                <input
                  type="date"
                  name="planting_date"
                  value={formData.planting_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-neutral-900 transition"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Max 180 days in the past or 180 days in the future.
                </p>
              </div>
            </div>

            {/* ── Live Weather Preview ───────────────────────────────── */}
            <div className={`rounded-lg border p-4 ${
              weatherError
                ? 'bg-red-50 border-red-200'
                : 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <CloudRain size={16} className={weatherError ? 'text-red-600' : 'text-sky-600'} />
                <span className={`text-sm font-medium ${weatherError ? 'text-red-900' : 'text-sky-900'}`}>
                  Current weather
                </span>
                <span className={`text-xs ${weatherError ? 'text-red-500' : 'text-sky-600'}`}>
                  • {formData.location}
                </span>
              </div>
              {weatherLoading ? (
                <div className="flex items-center gap-2 text-sm text-sky-700">
                  <Loader2 size={14} className="animate-spin" />
                  Fetching weather…
                </div>
              ) : weatherError ? (
                <p className="text-sm text-red-700">
                  Unable to fetch weather data. Prediction will use estimated conditions.
                </p>
              ) : weather ? (
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-sky-800">
                    <Thermometer size={14} />
                    <span className="font-medium">{weather.temp}°C</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-sky-800">
                    <Droplets size={14} />
                    <span className="font-medium">{weather.humidity}% humidity</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-sky-600">
                  Select a location to see current weather.
                </p>
              )}
            </div>

            {/* ── Soil Conditions ────────────────────────────────────── */}
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 mb-4">
                <Droplets size={20} className="text-primary-600" />
                Soil conditions
              </h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1.5">
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
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-neutral-900 transition"
                  />
                  <p className="mt-1 text-xs text-neutral-500">Range 3–10. Optimal: 5.5–7.0</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1.5">
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
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-neutral-900 transition"
                  />
                  <p className="mt-1 text-xs text-neutral-500">Field capacity: 20–30%</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1.5">
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
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-neutral-900 transition"
                  />
                  <p className="mt-1 text-xs text-neutral-500">Target &gt;2% for good fertility</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1.5">
                    Fertilizer (kg/ha)
                  </label>
                  <input
                    type="number"
                    name="fertilizer_kg_ha"
                    step="5"
                    min="0"
                    value={formData.fertilizer_kg_ha}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-neutral-900 transition"
                  />
                  <p className="mt-1 text-xs text-neutral-500">Total fertilizer applied</p>
                </div>
              </div>
            </div>

            {/* ── Advanced (optional) ────────────────────────────────── */}
            <div className="border-t border-neutral-200 pt-5">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                />
                Advanced options
              </button>

              {showAdvanced && (
                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-900 mb-1.5">
                      <Banknote size={14} className="text-neutral-500" />
                      Market price override
                    </label>
                    <input
                      type="number"
                      name="market_price"
                      step="500"
                      min="0"
                      value={formData.market_price}
                      onChange={handleChange}
                      placeholder="Leave blank for default"
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-neutral-900 transition placeholder:text-neutral-400"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Expected farm-gate price (KES/tonne)
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-900 mb-1.5">
                      <Users size={14} className="text-neutral-500" />
                      Labour cost override
                    </label>
                    <input
                      type="number"
                      name="labour_cost"
                      step="1000"
                      min="0"
                      value={formData.labour_cost}
                      onChange={handleChange}
                      placeholder="Leave blank for default"
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-neutral-900 transition placeholder:text-neutral-400"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Labour cost (KES/ha)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Submit ─────────────────────────────────────────────── */}
            <div className="pt-2">
              <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
                {isLoading ? 'Running prediction…' : 'Create prediction'}
              </Button>
              <p className="mt-3 text-xs text-center text-neutral-500 flex items-center justify-center gap-1">
                <Info size={12} />
                Yield, profit & harvest window are computed automatically.
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
