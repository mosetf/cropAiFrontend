'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { ProtectedRoute } from '@/utils/ProtectedRoute';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import apiClient from '@/lib/api';
import { parseCrops, groupLocations, modelledCrops, MODELLED_CROPS } from '@/lib/meta';
import AppNavbar from '@/components/AppNavbar';
import { Button, PageHeader } from '@/components';
import { CropOption, LocationsGrouped } from '@/types';

/** YYYY-MM-DD for today plus an offset, in the visitor's own time zone. */
function isoDay(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const FALLBACK_CROPS: CropOption[] = MODELLED_CROPS.map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
})) as CropOption[];

function FieldRow({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="row">
      <label htmlFor={id} className="row-label min-w-0 cursor-pointer">
        {label}
        {hint && <span className="block text-[13px] leading-snug text-ink-3">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function PredictContent() {
  const router = useRouter();
  useInactivityTimer();

  const [crops, setCrops] = useState<CropOption[]>([]);
  const [locationsGrouped, setLocationsGrouped] = useState<LocationsGrouped>({});
  const [metaLoading, setMetaLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Weather is fetched by the server for the chosen location, so it is not asked for here.
  const [formData, setFormData] = useState({
    crop: 'maize', location: 'Nakuru', planting_date: '',
    soil_ph: 6.0, soil_moisture: 25.0, organic_carbon: 1.5, fertilizer_kg_ha: 100.0,
  });

  useEffect(() => {
    Promise.all([apiClient.get('/api/v1/meta/crops/'), apiClient.get('/api/v1/meta/locations/')])
      .then(([cr, lo]) => { setCrops(modelledCrops(parseCrops(cr.data))); setLocationsGrouped(groupLocations(lo.data)); })
      .catch(() => {})
      .finally(() => setMetaLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: ['crop', 'location', 'planting_date'].includes(name) ? value : parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      const res = await apiClient.post('/api/v1/predictions/', { ...formData, predicted_yield: 0, harvest_window: '', net_profit: 0 });
      router.push(`/results/${res.data.id}`);
    } catch (err: any) {
      const data = err.response?.data || {};
      if (!err.response) {
        setError("Can't reach the server. Check your connection and try again.");
      } else if (err.response.status === 400 && typeof data === 'object') {
        const msgs = Object.keys(data).map(k => Array.isArray(data[k]) ? `${k}: ${data[k][0]}` : '').filter(Boolean);
        setError(msgs.length ? msgs.join(', ') : 'Validation error');
      } else {
        setError(data.detail || data.error || 'Could not create prediction. Check your inputs and try again.');
      }
    } finally { setIsLoading(false); }
  };

  const cropOptions = crops.length > 0 ? crops : FALLBACK_CROPS;

  const numberRow = (name: 'soil_ph' | 'soil_moisture' | 'organic_carbon' | 'fertilizer_kg_ha', label: string, props: { step: number; min: number; max?: number; hint?: string }) => (
    <FieldRow id={name} label={label} hint={props.hint}>
      <input
        id={name}
        type="number"
        inputMode="decimal"
        name={name}
        step={props.step}
        min={props.min}
        max={props.max}
        value={formData[name]}
        onChange={handleChange}
        className="control"
      />
    </FieldRow>
  );

  return (
    <>
      <AppNavbar />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:px-6">
        <Link href="/dashboard" className="-ml-2 mb-4 inline-flex min-h-[44px] items-center gap-0.5 rounded-full px-2 text-[17px] font-medium text-accent">
          <ChevronLeft size={22} aria-hidden="true" /> Home
        </Link>

        <PageHeader title="New estimate" description="Enter your farm details to estimate yield and profit." />

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-[14px] bg-bad-soft p-4 text-[15px] text-bad">
              <AlertCircle className="mt-0.5 shrink-0" size={19} aria-hidden="true" />
              <p>{error}</p>
            </div>
          )}

          <section>
            <h2 className="group-title">Crop and place</h2>
            <div className="group">
              <FieldRow id="crop" label="Crop">
                <select id="crop" name="crop" value={formData.crop} onChange={handleChange} disabled={metaLoading} className="control control-select">
                  {cropOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </FieldRow>
              <FieldRow id="location" label="Location">
                <select id="location" name="location" value={formData.location} onChange={handleChange} disabled={metaLoading} className="control control-select">
                  {Object.keys(locationsGrouped).length > 0 ? Object.entries(locationsGrouped).map(([region, locs]) => (
                    <optgroup key={region} label={region}>{locs.map(loc => <option key={loc.value} value={loc.value}>{loc.label}</option>)}</optgroup>
                  )) : (
                    <>
                      <option value="Nakuru">Nakuru</option><option value="Eldoret">Eldoret</option>
                      <option value="Kisumu">Kisumu</option><option value="Meru">Meru</option>
                      <option value="Kitale">Kitale</option>
                    </>
                  )}
                </select>
              </FieldRow>
              <FieldRow id="planting_date" label="Planting date" hint="Up to six months either side of today">
                <input
                  id="planting_date"
                  type="date"
                  name="planting_date"
                  value={formData.planting_date}
                  min={isoDay(-180)}
                  max={isoDay(180)}
                  onChange={handleChange}
                  required
                  className="control"
                />
              </FieldRow>
            </div>
          </section>

          <section>
            <h2 className="group-title">Soil</h2>
            <div className="group">
              {numberRow('soil_ph', 'Soil pH', { step: 0.1, min: 3, max: 10, hint: 'Most crops like 5.5 to 7.0' })}
              {numberRow('soil_moisture', 'Soil moisture (%)', { step: 0.5, min: 0, max: 100, hint: 'Field capacity is 20 to 30%' })}
              {numberRow('organic_carbon', 'Organic carbon (%)', { step: 0.1, min: 0, max: 10 })}
              {numberRow('fertilizer_kg_ha', 'Fertilizer (kg/ha)', { step: 5, min: 0 })}
            </div>
            <p className="group-foot">
              These start at typical values. Your own soil readings give a better estimate.
            </p>
          </section>

          <div>
            <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
              {isLoading ? 'Working out your estimate…' : 'Get my estimate'}
            </Button>
            <p aria-live="polite" className="mt-4 px-1 text-center text-[13px] leading-snug text-ink-3">
              {isLoading
                ? 'This can take up to a minute while we check the weather and write your advice.'
                : "Weather for your location is fetched automatically. If it can't be reached, default values are used and the result says so."}
            </p>
          </div>
        </form>
      </main>
    </>
  );
}

export default function PredictPage() {
  return <ProtectedRoute><PredictContent /></ProtectedRoute>;
}
