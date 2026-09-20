// ============================================================================
// WEATHER FETCHER — Batched, cached Open-Meteo wrapper
// ============================================================================

import { cachedFetch, cachedFetchBatch, TTL } from './weatherCache.js'

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'
const AQI_API = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const MAX_BATCH = 100

const HOURLY_VARS = [
  'temperature_2m', 'apparent_temperature', 'relative_humidity_2m',
  'dew_point_2m', 'precipitation_probability', 'precipitation',
  'rain', 'showers', 'snowfall', 'weather_code', 'pressure_msl',
  'surface_pressure', 'cloud_cover', 'cloud_cover_low',
  'cloud_cover_mid', 'cloud_cover_high', 'visibility',
  'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
  'uv_index', 'is_day', 'shortwave_radiation', 'sunshine_duration',
].join(',')

const DAILY_VARS = [
  'weather_code', 'temperature_2m_max', 'temperature_2m_min',
  'apparent_temperature_max', 'apparent_temperature_min',
  'sunrise', 'sunset', 'daylight_duration', 'sunshine_duration',
  'uv_index_max', 'precipitation_sum', 'rain_sum', 'showers_sum',
  'snowfall_sum', 'precipitation_hours', 'precipitation_probability_max',
  'wind_speed_10m_max', 'wind_gusts_10m_max', 'wind_direction_10m_dominant',
  'shortwave_radiation_sum', 'relative_humidity_2m_mean',
  'relative_humidity_2m_max', 'relative_humidity_2m_min',
].join(',')

const CURRENT_VARS = [
  'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
  'is_day', 'precipitation', 'rain', 'showers', 'snowfall',
  'weather_code', 'cloud_cover', 'pressure_msl', 'surface_pressure',
  'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
].join(',')

const AQI_CURRENT_VARS = [
  'us_aqi', 'european_aqi', 'pm10', 'pm2_5', 'carbon_monoxide',
  'nitrogen_dioxide', 'sulphur_dioxide', 'ozone', 'uv_index',
  'alder_pollen', 'birch_pollen', 'grass_pollen', 'mugwort_pollen',
  'olive_pollen', 'ragweed_pollen',
].join(',')

// ─── URL BUILDERS ───────────────────────────────────────────────────────

function buildWeatherUrl(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: CURRENT_VARS,
    hourly: HOURLY_VARS,
    daily: DAILY_VARS,
    timezone: 'auto',
    forecast_days: '16',
  })
  return `${WEATHER_API}?${params.toString()}`
}

function buildWeatherBatchUrl(coords) {
  const lats = coords.map(c => c.lat).join(',')
  const lons = coords.map(c => c.lon).join(',')
  const params = new URLSearchParams({
    latitude: lats,
    longitude: lons,
    current: CURRENT_VARS,
    hourly: HOURLY_VARS,
    daily: DAILY_VARS,
    timezone: 'auto',
    forecast_days: '16',
  })
  return `${WEATHER_API}?${params.toString()}`
}

function buildAqiUrl(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: AQI_CURRENT_VARS,
    timezone: 'auto',
  })
  return `${AQI_API}?${params.toString()}`
}

function buildAqiBatchUrl(coords) {
  const lats = coords.map(c => c.lat).join(',')
  const lons = coords.map(c => c.lon).join(',')
  const params = new URLSearchParams({
    latitude: lats,
    longitude: lons,
    current: AQI_CURRENT_VARS,
    timezone: 'auto',
  })
  return `${AQI_API}?${params.toString()}`
}

// ─── COORD NORMALIZATION (NEW) ──────────────────────────────────────────

function normalizeCoords(coords) {
  if (!Array.isArray(coords)) return []
  return coords
    .map(c => ({
      lat: typeof c?.lat === 'number' ? c.lat : (typeof c?.latitude === 'number' ? c.latitude : null),
      lon: typeof c?.lon === 'number' ? c.lon : (typeof c?.longitude === 'number' ? c.longitude : null),
    }))
    .filter(c => c.lat != null && c.lon != null)
}

// ─── NORMALIZATION ──────────────────────────────────────────────────────

function normalizeWeatherResponse(raw, lat, lon) {
  if (!raw || typeof raw !== 'object') return null
  const src = Array.isArray(raw) ? raw[0] : raw
  if (!src || !src.current) return null

  return {
    timezone: src.timezone || 'UTC',
    lat: src.latitude ?? lat,
    lon: src.longitude ?? lon,
    elevation: src.elevation ?? null,
    current: {
      temperature_2m: src.current.temperature_2m ?? null,
      relative_humidity_2m: src.current.relative_humidity_2m ?? null,
      apparent_temperature: src.current.apparent_temperature ?? null,
      is_day: src.current.is_day ?? 1,
      precipitation: src.current.precipitation ?? 0,
      rain: src.current.rain ?? 0,
      showers: src.current.showers ?? 0,
      snowfall: src.current.snowfall ?? 0,
      weather_code: src.current.weather_code ?? 0,
      cloud_cover: src.current.cloud_cover ?? 0,
      pressure_msl: src.current.pressure_msl ?? null,
      surface_pressure: src.current.surface_pressure ?? null,
      wind_speed_10m: src.current.wind_speed_10m ?? 0,
      wind_direction_10m: src.current.wind_direction_10m ?? 0,
      wind_gusts_10m: src.current.wind_gusts_10m ?? 0,
    },
    hourly: src.hourly || {},
    daily: src.daily || {},
  }
}

function normalizeAqiResponse(raw, lat, lon) {
  if (!raw || typeof raw !== 'object') return null
  const src = Array.isArray(raw) ? raw[0] : raw
  if (!src || !src.current) return null

  return {
    lat: src.latitude ?? lat,
    lon: src.longitude ?? lon,
    timezone: src.timezone || 'UTC',
    us_aqi: src.current.us_aqi ?? null,
    european_aqi: src.current.european_aqi ?? null,
    pm10: src.current.pm10 ?? null,
    pm2_5: src.current.pm2_5 ?? null,
    carbon_monoxide: src.current.carbon_monoxide ?? null,
    nitrogen_dioxide: src.current.nitrogen_dioxide ?? null,
    sulphur_dioxide: src.current.sulphur_dioxide ?? null,
    ozone: src.current.ozone ?? null,
    uv_index: src.current.uv_index ?? null,
    pollen: {
      alder: src.current.alder_pollen ?? null,
      birch: src.current.birch_pollen ?? null,
      grass: src.current.grass_pollen ?? null,
      mugwort: src.current.mugwort_pollen ?? null,
      olive: src.current.olive_pollen ?? null,
      ragweed: src.current.ragweed_pollen ?? null,
    },
  }
}

// ─── LOW-LEVEL FETCH ────────────────────────────────────────────────────

async function rawFetchJson(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        if (res.status === 429) {
          const wait = 1500 * (attempt + 1)
          await new Promise(r => setTimeout(r, wait))
          continue
        }
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
          continue
        }
        return null
      }
      return await res.json()
    } catch {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
        continue
      }
      return null
    }
  }
  return null
}

// ─── PUBLIC: WEATHER (SINGLE) ───────────────────────────────────────────

export async function fetchWeather(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return null
  return cachedFetch('weather', lat, lon, async () => {
    const url = buildWeatherUrl(lat, lon)
    const raw = await rawFetchJson(url)
    return normalizeWeatherResponse(raw, lat, lon)
  }, TTL.FORECAST)
}

// ─── PUBLIC: WEATHER (BATCH) ────────────────────────────────────────────

export async function fetchWeatherBatch(coords) {
  const normalized = normalizeCoords(coords)
  if (normalized.length === 0) return []
  if (normalized.length === 1) {
    const one = await fetchWeather(normalized[0].lat, normalized[0].lon)
    return [one]
  }
  if (normalized.length > MAX_BATCH) {
    const chunks = []
    for (let i = 0; i < normalized.length; i += MAX_BATCH) {
      chunks.push(normalized.slice(i, i + MAX_BATCH))
    }
    const results = []
    for (const chunk of chunks) {
      const part = await fetchWeatherBatch(chunk)
      results.push(...part)
    }
    return results
  }
  return cachedFetchBatch('weather', normalized, async () => {
    const url = buildWeatherBatchUrl(normalized)
    const raw = await rawFetchJson(url)
    const arr = Array.isArray(raw) ? raw : [raw]
    return normalized.map((c, i) => {
      const entry = arr[i] ?? arr[0]
      return normalizeWeatherResponse(entry, c.lat, c.lon)
    })
  }, TTL.FORECAST)
}

// ─── PUBLIC: AQI ────────────────────────────────────────────────────────

export async function fetchAqi(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return null
  return cachedFetch('aqi', lat, lon, async () => {
    const url = buildAqiUrl(lat, lon)
    const raw = await rawFetchJson(url)
    return normalizeAqiResponse(raw, lat, lon)
  }, TTL.AQI)
}

export async function fetchAqiBatch(coords) {
  const normalized = normalizeCoords(coords)
  if (normalized.length === 0) return []
  if (normalized.length === 1) {
    const one = await fetchAqi(normalized[0].lat, normalized[0].lon)
    return [one]
  }
  return cachedFetchBatch('aqi', normalized, async () => {
    const url = buildAqiBatchUrl(normalized)
    const raw = await rawFetchJson(url)
    const arr = Array.isArray(raw) ? raw : [raw]
    return normalized.map((c, i) => {
      const entry = arr[i] ?? arr[0]
      return normalizeAqiResponse(entry, c.lat, c.lon)
    })
  }, TTL.AQI)
}

// ─── COMBINED ───────────────────────────────────────────────────────────

export async function fetchWeatherWithAqi(lat, lon) {
  const [weather, aqi] = await Promise.all([
    fetchWeather(lat, lon),
    fetchAqi(lat, lon),
  ])
  return { weather, aqi }
}

export async function fetchWeatherWithAqiBatch(coords) {
  const [weathers, aqis] = await Promise.all([
    fetchWeatherBatch(coords),
    fetchAqiBatch(coords),
  ])
  return coords.map((_, i) => ({
    weather: weathers[i] ?? null,
    aqi: aqis[i] ?? null,
  }))
}

export default {
  fetchWeather,
  fetchWeatherBatch,
  fetchAqi,
  fetchAqiBatch,
  fetchWeatherWithAqi,
  fetchWeatherWithAqiBatch,
}
