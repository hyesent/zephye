// ============================================================================
// WEATHER FETCHER — Batched, cached Open-Meteo wrapper
//
// Single source of truth for all Open-Meteo calls in the app.
// Handles: weather (current/hourly/daily), air quality, batch requests.
// Caches via weatherCache. Never called directly by UI — always via resolver.
//
// One call can fetch up to 100 coordinates. Route waypoints, saved-location
// glance, comparison sides — all become one request.
// ============================================================================

import {
  cachedFetch,
  cachedFetchBatch,
  TTL,
} from './weatherCache.js'

// ─── CONFIG ────────────────────────────────────────────────────────────

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'
const AQI_API = 'https://air-quality-api.open-meteo.com/v1/air-quality'

// Open-Meteo hard limit for multi-coordinate requests
const MAX_BATCH = 100

// Shared hourly variables — the full superset every advice module needs
const HOURLY_VARS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'dew_point_2m',
  'precipitation_probability',
  'precipitation',
  'rain',
  'showers',
  'snowfall',
  'weather_code',
  'pressure_msl',
  'surface_pressure',
  'cloud_cover',
  'cloud_cover_low',
  'cloud_cover_mid',
  'cloud_cover_high',
  'visibility',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'uv_index',
  'is_day',
  'shortwave_radiation',
  'sunshine_duration',
].join(',')

// Daily variables — expanded with wind/humidity/apparent/radiation
const DAILY_VARS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'apparent_temperature_max',
  'apparent_temperature_min',
  'sunrise',
  'sunset',
  'daylight_duration',
  'sunshine_duration',
  'uv_index_max',
  'precipitation_sum',
  'rain_sum',
  'showers_sum',
  'snowfall_sum',
  'precipitation_hours',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
  'wind_direction_10m_dominant',
  'shortwave_radiation_sum',
  'relative_humidity_2m_mean',
  'relative_humidity_2m_max',
  'relative_humidity_2m_min',
].join(',')

// Current variables — everything Open-Meteo exposes for "now"
const CURRENT_VARS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'precipitation',
  'rain',
  'showers',
  'snowfall',
  'weather_code',
  'cloud_cover',
  'pressure_msl',
  'surface_pressure',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
].join(',')

const AQI_CURRENT_VARS = [
  'us_aqi',
  'european_aqi',
  'pm10',
  'pm2_5',
  'carbon_monoxide',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'ozone',
  'uv_index',
  'alder_pollen',
  'birch_pollen',
  'grass_pollen',
  'mugwort_pollen',
  'olive_pollen',
  'ragweed_pollen',
].join(',')

// ─── URL BUILDERS ──────────────────────────────────────────────────────

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

// ─── NORMALIZATION ─────────────────────────────────────────────────────
// Open-Meteo returns slightly different shapes for single vs batch.
// We normalize to always be { current, hourly, daily, timezone, lat, lon }.

/**
 * Normalize a single-location Open-Meteo response.
 * When Open-Meteo is asked for one coord, it returns a flat object.
 * When asked for multiple, it returns an array. This handles both.
 */
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

    hourly: {
      time: src.hourly?.time ?? [],
      temperature_2m: src.hourly?.temperature_2m ?? [],
      apparent_temperature: src.hourly?.apparent_temperature ?? [],
      relative_humidity_2m: src.hourly?.relative_humidity_2m ?? [],
      dew_point_2m: src.hourly?.dew_point_2m ?? [],
      precipitation_probability: src.hourly?.precipitation_probability ?? [],
      precipitation: src.hourly?.precipitation ?? [],
      rain: src.hourly?.rain ?? [],
      showers: src.hourly?.showers ?? [],
      snowfall: src.hourly?.snowfall ?? [],
      weather_code: src.hourly?.weather_code ?? [],
      pressure_msl: src.hourly?.pressure_msl ?? [],
      surface_pressure: src.hourly?.surface_pressure ?? [],
      cloud_cover: src.hourly?.cloud_cover ?? [],
      cloud_cover_low: src.hourly?.cloud_cover_low ?? [],
      cloud_cover_mid: src.hourly?.cloud_cover_mid ?? [],
      cloud_cover_high: src.hourly?.cloud_cover_high ?? [],
      visibility: src.hourly?.visibility ?? [],
      wind_speed_10m: src.hourly?.wind_speed_10m ?? [],
      wind_direction_10m: src.hourly?.wind_direction_10m ?? [],
      wind_gusts_10m: src.hourly?.wind_gusts_10m ?? [],
      uv_index: src.hourly?.uv_index ?? [],
      is_day: src.hourly?.is_day ?? [],
      shortwave_radiation: src.hourly?.shortwave_radiation ?? [],
      sunshine_duration: src.hourly?.sunshine_duration ?? [],
    },

    daily: {
      time: src.daily?.time ?? [],
      weather_code: src.daily?.weather_code ?? [],
      temperature_2m_max: src.daily?.temperature_2m_max ?? [],
      temperature_2m_min: src.daily?.temperature_2m_min ?? [],
      apparent_temperature_max: src.daily?.apparent_temperature_max ?? [],
      apparent_temperature_min: src.daily?.apparent_temperature_min ?? [],
      sunrise: src.daily?.sunrise ?? [],
      sunset: src.daily?.sunset ?? [],
      daylight_duration: src.daily?.daylight_duration ?? [],
      sunshine_duration: src.daily?.sunshine_duration ?? [],
      uv_index_max: src.daily?.uv_index_max ?? [],
      precipitation_sum: src.daily?.precipitation_sum ?? [],
      rain_sum: src.daily?.rain_sum ?? [],
      showers_sum: src.daily?.showers_sum ?? [],
      snowfall_sum: src.daily?.snowfall_sum ?? [],
      precipitation_hours: src.daily?.precipitation_hours ?? [],
      precipitation_probability_max: src.daily?.precipitation_probability_max ?? [],
      wind_speed_10m_max: src.daily?.wind_speed_10m_max ?? [],
      wind_gusts_10m_max: src.daily?.wind_gusts_10m_max ?? [],
      wind_direction_10m_dominant: src.daily?.wind_direction_10m_dominant ?? [],
      shortwave_radiation_sum: src.daily?.shortwave_radiation_sum ?? [],
      relative_humidity_2m_mean: src.daily?.relative_humidity_2m_mean ?? [],
      relative_humidity_2m_max: src.daily?.relative_humidity_2m_max ?? [],
      relative_humidity_2m_min: src.daily?.relative_humidity_2m_min ?? [],
    },
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

// ─── LOW-LEVEL FETCH ───────────────────────────────────────────────────

async function rawFetchJson(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        // Rate limit — back off harder
        if (res.status === 429) {
          const wait = 1500 * (attempt + 1)
          await new Promise(r => setTimeout(r, wait))
          continue
        }
        // Other errors — quick retry
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

// ─── PUBLIC API: WEATHER (SINGLE) ──────────────────────────────────────

/**
 * Fetch full weather for one location. Cached.
 * @returns {Promise<Object|null>} normalized weather object or null
 */
export async function fetchWeather(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return null

  return cachedFetch('weather', lat, lon, async () => {
    const url = buildWeatherUrl(lat, lon)
    const raw = await rawFetchJson(url)
    return normalizeWeatherResponse(raw, lat, lon)
  }, TTL.FORECAST)
}

// ─── PUBLIC API: WEATHER (BATCH) ───────────────────────────────────────

/**
 * Fetch weather for multiple locations in ONE request. Cached.
 *
 * @param {Array<{lat:number, lon:number}>} coords
 * @returns {Promise<Array<Object|null>>} — array aligned with input order
 */
export async function fetchWeatherBatch(coords) {
  if (!Array.isArray(coords) || coords.length === 0) return []

  // Single location — fall through to single fetch
  if (coords.length === 1) {
    const one = await fetchWeather(coords[0].lat, coords[0].lon)
    return [one]
  }

  // Chunk if > MAX_BATCH
  if (coords.length > MAX_BATCH) {
    const chunks = []
    for (let i = 0; i < coords.length; i += MAX_BATCH) {
      chunks.push(coords.slice(i, i + MAX_BATCH))
    }
    const results = []
    for (const chunk of chunks) {
      const part = await fetchWeatherBatch(chunk)
      results.push(...part)
    }
    return results
  }

  return cachedFetchBatch('weather', coords, async () => {
    const url = buildWeatherBatchUrl(coords)
    const raw = await rawFetchJson(url)

    // Batch response is an array aligned with input coordinates
    const arr = Array.isArray(raw) ? raw : [raw]
    return coords.map((c, i) => {
      const entry = arr[i] ?? arr[0]
      return normalizeWeatherResponse(entry, c.lat, c.lon)
    })
  }, TTL.FORECAST)
}

// ─── PUBLIC API: AQI (SINGLE + BATCH) ──────────────────────────────────

export async function fetchAqi(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return null

  return cachedFetch('aqi', lat, lon, async () => {
    const url = buildAqiUrl(lat, lon)
    const raw = await rawFetchJson(url)
    return normalizeAqiResponse(raw, lat, lon)
  }, TTL.AQI)
}

export async function fetchAqiBatch(coords) {
  if (!Array.isArray(coords) || coords.length === 0) return []

  if (coords.length === 1) {
    const one = await fetchAqi(coords[0].lat, coords[0].lon)
    return [one]
  }

  if (coords.length > MAX_BATCH) {
    const chunks = []
    for (let i = 0; i < coords.length; i += MAX_BATCH) {
      chunks.push(coords.slice(i, i + MAX_BATCH))
    }
    const results = []
    for (const chunk of chunks) {
      const part = await fetchAqiBatch(chunk)
      results.push(...part)
    }
    return results
  }

  return cachedFetchBatch('aqi', coords, async () => {
    const url = buildAqiBatchUrl(coords)
    const raw = await rawFetchJson(url)
    const arr = Array.isArray(raw) ? raw : [raw]
    return coords.map((c, i) => {
      const entry = arr[i] ?? arr[0]
      return normalizeAqiResponse(entry, c.lat, c.lon)
    })
  }, TTL.AQI)
}

// ─── PUBLIC API: COMBINED ──────────────────────────────────────────────

/**
 * Fetch weather + AQI together. Cached independently.
 * @returns {Promise<{weather: Object|null, aqi: Object|null}>}
 */
export async function fetchWeatherWithAqi(lat, lon) {
  const [weather, aqi] = await Promise.all([
    fetchWeather(lat, lon),
    fetchAqi(lat, lon),
  ])
  return { weather, aqi }
}

/**
 * Batch version — returns parallel arrays.
 * @returns {Promise<Array<{weather: Object|null, aqi: Object|null}>>}
 */
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

// ─── DEFAULT EXPORT ────────────────────────────────────────────────────

export default {
  fetchWeather,
  fetchWeatherBatch,
  fetchAqi,
  fetchAqiBatch,
  fetchWeatherWithAqi,
  fetchWeatherWithAqiBatch,
}
