// ============================================================================
// REVERSE GEOCODE — Coords → place name, with caching + smart picking
//
// Uses Nominatim (OpenStreetMap). Free, no API key.
// Rate limit: ~1 request/second. We stagger calls when batching.
// Results cached for 30 days (places don't move).
// ============================================================================

import { getCached, setCached } from './weatherCache.js'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

// Long TTL — place names almost never change
const GEOCODE_TTL = 30 * 24 * 60 * 60 * 1000

// ─── LEVELS OF PLACE NAMES ──────────────────────────────────────────────
// Higher = more specific. We prefer specific over vague.

const PREFERRED_ADDRESS_KEYS = [
  'suburb',       // "Ikeja GRA"
  'neighbourhood',
  'quarter',
  'village',
  'hamlet',
  'town',         // "Sagamu"
  'city_district',
  'city',         // "Lagos"
  'municipality',
  'county',       // "Ogun State" — less ideal but usable
  'state_district',
  'state',
  'region',
  'country',      // last resort
]

function pickBestName(address, fallbackLabel) {
  if (!address || typeof address !== 'object') return fallbackLabel

  for (const key of PREFERRED_ADDRESS_KEYS) {
    const val = address[key]
    if (val && typeof val === 'string' && val.trim().length > 1) {
      return val.trim()
    }
  }

  return fallbackLabel
}

function pickSecondaryName(address, primaryName) {
  if (!address) return null
  // Use state/county as secondary context
  const secondary =
    address.city ||
    address.town ||
    address.state ||
    address.county
  if (!secondary || secondary === primaryName) return null
  return secondary
}

/**
 * Format a waypoint label for display.
 * Returns { short, medium, full }
 *   short  → "Ikeja"            (for inline diagrams)
 *   medium → "Ikeja, Lagos"     (for waypoint lists)
 *   full   → "Ikeja, Lagos, Nigeria"
 */
function buildLabel(raw, fallbackLabel) {
  if (!raw) {
    return {
      short: fallbackLabel,
      medium: fallbackLabel,
      full: fallbackLabel,
    }
  }

  const address = raw.address || {}
  const primary = pickBestName(address, fallbackLabel)
  const secondary = pickSecondaryName(address, primary)
  const country = address.country

  const short = primary
  const medium = secondary ? `${primary}, ${secondary}` : primary
  const full = country
    ? `${primary}${secondary ? `, ${secondary}` : ''}, ${country}`
    : medium

  return { short, medium, full }
}

// ─── FETCH + CACHE ──────────────────────────────────────────────────────

async function fetchReverseGeocode(lat, lon, lang = 'en') {
  try {
    const url = `${NOMINATIM_URL}?format=jsonv2&lat=${lat}&lon=${lon}&zoom=13&addressdetails=1`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Zephye-App/1.0',
        'Accept-Language': lang,
      },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data
  } catch {
    return null
  }
}

/**
 * Reverse geocode a single coordinate with caching.
 * Returns { short, medium, full, raw } or a fallback label.
 */
export async function reverseGeocode(lat, lon, fallbackLabel = 'Point', lang = 'en') {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return { short: fallbackLabel, medium: fallbackLabel, full: fallbackLabel, raw: null }
  }

  // Round to 4 decimals (~11m) so nearby lookups share cache
  const rLat = Math.round(lat * 10000) / 10000
  const rLon = Math.round(lon * 10000) / 10000

  const cached = getCached('geocode_reverse', rLat, rLon)
  if (cached) return cached

  const raw = await fetchReverseGeocode(rLat, rLon, lang)
  const label = buildLabel(raw, fallbackLabel)
  const result = { ...label, raw, lat: rLat, lon: rLon }

  if (raw) {
    setCached('geocode_reverse', rLat, rLon, result, GEOCODE_TTL)
  }

  return result
}

/**
 * Reverse geocode multiple coords with rate limiting.
 * Nominatim asks for ~1 req/sec — we stagger 1.1s apart.
 * If any fail, we fall back to the provided label.
 */
export async function reverseGeocodeBatch(coords, lang = 'en') {
  if (!Array.isArray(coords) || coords.length === 0) return []

  const results = []
  for (let i = 0; i < coords.length; i++) {
    const c = coords[i]
    const fallback = c.fallbackLabel || c.label || `Point ${i + 1}`

    // Try cache first (no rate limit)
    const rLat = Math.round((c.lat ?? 0) * 10000) / 10000
    const rLon = Math.round((c.lon ?? 0) * 10000) / 10000
    const cached = getCached('geocode_reverse', rLat, rLon)
    if (cached) {
      results.push({ ...cached, fallbackLabel: fallback })
      continue
    }

    // Cache miss — hit Nominatim
    const r = await reverseGeocode(c.lat, c.lon, fallback, lang)
    results.push({ ...r, fallbackLabel: fallback })

    // Stagger if not the last one (rate limit)
    if (i < coords.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1100))
    }
  }

  return results
}

export default { reverseGeocode, reverseGeocodeBatch }
