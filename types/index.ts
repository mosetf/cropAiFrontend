// ── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
}

export interface LoginResponse {
  access: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
}

// ── Sessions ─────────────────────────────────────────────────────────────────

export interface UserSession {
  id: number;
  device_name: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  ip_address: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
}

// ── Predictions ───────────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';

export type CropType =
  | 'maize'
  | 'beans'
  | 'wheat'
  | 'sorghum'
  | 'coffee'
  | 'tea'
  | 'potatoes'
  | 'cassava'
  | 'rice';

export interface YieldPrediction {
  id: number;
  crop: CropType;
  location: string;
  region: string;
  planting_date: string;
  season: string;

  // ML outputs
  predicted_yield: number;
  yield_low: number | null;
  yield_high: number | null;
  harvest_window: string;
  net_profit: number;

  // Weather used
  rainfall: number;
  temperature: number;
  humidity: number;

  // Soil inputs
  soil_ph: number | null;
  soil_moisture: number | null;
  organic_carbon: number | null;
  fertilizer_kg_ha: number | null;

  // AI advisory
  ai_recommendations: string[];
  risk_level: RiskLevel;
  risk_reason: string;

  // Meta
  fallback_used: boolean;
  model_version: string;
  created_at: string;
}

export interface PredictionRequest {
  crop: CropType;
  location: string;
  planting_date: string;
  soil_ph: number;
  soil_moisture: number;
  organic_carbon: number;
  fertilizer: number;
  market_price?: number;
}

// List item — lighter shape returned by GET /api/v1/predictions/
export interface PredictionListItem {
  id: number;
  crop: CropType;
  location: string;
  predicted_yield: number;
  risk_level: RiskLevel;
  net_profit: number;
  created_at: string;
}

// ── Crops & Locations ─────────────────────────────────────────────────────────

export interface CropOption {
  value: CropType;
  label: string;
}

export interface LocationOption {
  value: string;
  label: string;
  region: string;
  lat: number;
  lon: number;
}

export type LocationsGrouped = Record<string, LocationOption[]>;

// ── API Error shapes ──────────────────────────────────────────────────────────

export interface ApiError {
  detail?: string;
  non_field_errors?: string[];
  email?: string[];
  name?: string[];
  password?: string[];
  password2?: string[];
  [key: string]: string | string[] | undefined;
}
