import type { CropOption, LocationOption, LocationsGrouped } from '@/types';

/**
 * Readers for the backend's /api/v1/meta/ responses.
 *
 *   GET /meta/crops/      -> { crops: [{ value, label }], count }
 *   GET /meta/locations/  -> { locations: [{ name, region, lat, lon, ... }], count }
 *
 * They also accept a bare list of crops or an already-grouped location map, and
 * return empty results for anything else, so an unexpected response leaves the
 * form empty instead of crashing the page.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseCrops(data: unknown): CropOption[] {
  const list = Array.isArray(data) ? data : isRecord(data) ? data.crops : undefined;
  if (!Array.isArray(list)) return [];
  return list.filter(
    (c): c is CropOption => isRecord(c) && typeof c.value === 'string' && typeof c.label === 'string'
  );
}

export function groupLocations(data: unknown): LocationsGrouped {
  const grouped: LocationsGrouped = {};
  const add = (region: string, option: LocationOption) => {
    (grouped[region] ||= []).push(option);
  };

  if (isRecord(data) && Array.isArray(data.locations)) {
    for (const item of data.locations) {
      if (!isRecord(item) || typeof item.name !== 'string') continue;
      add(typeof item.region === 'string' && item.region ? item.region : 'Other', {
        value: item.name,
        label: item.name,
        region: typeof item.region === 'string' ? item.region : 'Other',
        lat: Number(item.lat),
        lon: Number(item.lon),
      });
    }
  } else if (isRecord(data)) {
    // Already grouped: { "Region": [{ value, label, ... }] }
    for (const [region, options] of Object.entries(data)) {
      if (!Array.isArray(options)) continue;
      for (const o of options) {
        if (isRecord(o) && typeof o.value === 'string' && typeof o.label === 'string') {
          add(region, o as unknown as LocationOption);
        }
      }
    }
  }

  // Stable display order: regions A-Z, places A-Z within each region.
  const sorted: LocationsGrouped = {};
  for (const region of Object.keys(grouped).sort()) {
    sorted[region] = grouped[region].sort((a, b) => a.label.localeCompare(b.label));
  }
  return sorted;
}
