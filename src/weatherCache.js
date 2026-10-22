// ============================================================================
// WEATHER CACHE — TTL-backed cache for Open-Meteo + geocoding responses
//
// Why: weather doesn't change minute-to-minute. Route waypoints, saved-
// location glances, and comparison sides all hit the same coords repeatedly.
// Caching turns N fetches into 1 and makes the whole app feel instant.
//
// Storage: localStorage with namespace prefix. Auto-evicts on overflow.
// Keys are rounded to 2 decimal places (~1km precision) so nearby requests
// share the same cache entry.
// ============================================================================

// ─── CONFIG ────────────────────────────────────────────────────────────

const PREFIX = 'zephye_cache_'

// TTLs per cache type (ms)
export const TTL = {
  WEATHER: 10 * 60 * 1000,
  FORECAST: 15 * 60 * 1000,
  GEOCODE: 24 * 60 * 60 * 1000,
  GEOCODE_REVERSE: 30 * 24 * 60 * 60 * 1000, // 30 days — places don't move
  AQI: 15 * 60 * 1000,
}

// Hard cap on cache entry size to avoid localStorage quota explosions
const MAX_ENTRY_BYTES = 500 * 1024 // 500 KB

// Auto-clean threshold — if cache grows beyond this, drop oldest entries
const MAX_ENTRIES = 200

// ─── INTERNAL HELPERS ──────────────────────────────────────────────────

const round2 = (n) => Math.round(n * 100) / 100

/**
 * Build a cache key for a single location.
 * Rounded to 2 decimals so nearby requests hit the same entry.
 */
function keyForLocation(kind, lat, lon) {
  const rLat = round2(lat)
  const rLon = round2(lon)
  return `${PREFIX}${kind}_${rLat}_${rLon}`
}

/**
 * Build a cache key for multiple locations in one request.
 * Order-insensitive — sorted so {A,B} and {B,A} map to the same key.
 */
function keyForBatch(kind, coords) {
  const normalized = coords
    .map(c => `${round2(c.lat)},${round2(c.lon)}`)
    .sort()
    .join('|')
  // Hash-ish shortcut: if too long, use length + first/last
  if (normalized.length > 180) {
    const first = normalized.slice(0, 60)
    const last = normalized.slice(-60)
    return `${PREFIX}${kind}_batch_${normalized.length}_${first}_${last}`
  }
  return `${PREFIX}${kind}_batch_${normalized}`
}

/**
 * Safely read from localStorage. Returns null on any failure.
 */
function safeRead(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Safely write to localStorage. On quota error, evict oldest entries and retry.
 */
function safeWrite(key, value) {
  try {
    const serialized = JSON.stringify(value)
    if (serialized.length > MAX_ENTRY_BYTES) {
      // Entry too large — skip caching
      console.warn('[weatherCache] Entry too large to cache:', key)
      return false
    }
    localStorage.setItem(key, serialized)
    return true
  } catch (err) {
    // Likely quota exceeded — evict old entries and retry once
    try {
      evictOldest(50)
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Remove the N oldest cache entries. Used when localStorage is full.
 */
function evictOldest(n = 50) {
  try {
    const entries = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k || !k.startsWith(PREFIX)) continue
      const raw = localStorage.getItem(k)
      try {
        const parsed = JSON.parse(raw)
        entries.push({ key: k, ts: parsed?.ts || 0 })
      } catch {
        // Corrupt entry — remove it
        localStorage.removeItem(k)
      }
    }
    entries.sort((a, b) => a.ts - b.ts)
    entries.slice(0, n).forEach(e => localStorage.removeItem(e.key))
  } catch {
    // Best-effort — give up silently
  }
}

/**
 * Remove all entries whose TTL has expired.
 * Called opportunistically on writes.
 */
export function sweepExpired() {
  try {
    const now = Date.now()
    const toRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k || !k.startsWith(PREFIX)) continue
      const raw = localStorage.getItem(k)
      try {
        const parsed = JSON.parse(raw)
        if (!parsed?.ts || !parsed?.ttl) {
          toRemove.push(k)
          continue
        }
        if (now - parsed.ts > parsed.ttl) {
          toRemove.push(k)
        }
      } catch {
        toRemove.push(k)
      }
    }
    toRemove.forEach(k => localStorage.removeItem(k))
    return toRemove.length
  } catch {
    return 0
  }
}

/**
 * Keep total cache under MAX_ENTRIES by dropping oldest.
 */
function enforceEntryCap() {
  try {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) keys.push(k)
    }
    if (keys.length <= MAX_ENTRIES) return

    const entries = keys.map(k => {
      const parsed = safeRead(k)
      return { key: k, ts: parsed?.ts || 0 }
    })
    entries.sort((a, b) => a.ts - b.ts)
    entries.slice(0, entries.length - MAX_ENTRIES).forEach(e => {
      localStorage.removeItem(e.key)
    })
  } catch {
    // Silent
  }
}

// ─── PUBLIC API: SINGLE LOCATION ────────────────────────────────────────

/**
 * Get a cached value for a single location.
 * @returns {*|null} cached value, or null if missing/expired
 */
export function getCached(kind, lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return null
  const key = keyForLocation(kind, lat, lon)
  const entry = safeRead(key)
  if (!entry) return null
  if (!entry.ts || !entry.ttl) {
    localStorage.removeItem(key)
    return null
  }
  if (Date.now() - entry.ts > entry.ttl) {
    localStorage.removeItem(key)
    return null
  }
  return entry.value
}

/**
 * Set a cached value for a single location.
 * @param {string} kind — 'weather' | 'forecast' | 'geocode' | 'aqi'
 * @param {number} lat
 * @param {number} lon
 * @param {*} value — any JSON-serializable value
 * @param {number} [ttl] — override default TTL
 */
export function setCached(kind, lat, lon, value, ttl) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return
  const effectiveTtl = ttl || TTL[kind.toUpperCase()] || TTL.WEATHER
  const key = keyForLocation(kind, lat, lon)
  safeWrite(key, {
    value,
    ts: Date.now(),
    ttl: effectiveTtl,
  })
  enforceEntryCap()
}

// ─── PUBLIC API: BATCH ──────────────────────────────────────────────────

/**
 * Get a cached value for a batch of locations.
 * @param {string} kind
 * @param {Array<{lat:number, lon:number}>} coords
 */
export function getCachedBatch(kind, coords) {
  if (!Array.isArray(coords) || coords.length === 0) return null
  const key = keyForBatch(kind, coords)
  const entry = safeRead(key)
  if (!entry) return null
  if (!entry.ts || !entry.ttl) {
    localStorage.removeItem(key)
    return null
  }
  if (Date.now() - entry.ts > entry.ttl) {
    localStorage.removeItem(key)
    return null
  }
  return entry.value
}

/**
 * Set a cached value for a batch of locations.
 */
export function setCachedBatch(kind, coords, value, ttl) {
  if (!Array.isArray(coords) || coords.length === 0) return
  const effectiveTtl = ttl || TTL[kind.toUpperCase()] || TTL.FORECAST
  const key = keyForBatch(kind, coords)
  safeWrite(key, {
    value,
    ts: Date.now(),
    ttl: effectiveTtl,
  })
  enforceEntryCap()
}

// ─── CACHED FETCH WRAPPER ───────────────────────────────────────────────

/**
 * Fetch with caching. If cached, returns immediately.
 * Otherwise runs fetcher(), caches the result, returns it.
 *
 * @param {string} kind — 'weather' | 'forecast' | 'geocode' | 'aqi'
 * @param {number} lat
 * @param {number} lon
 * @param {Function} fetcher — async () => value
 * @param {number} [ttl]
 * @returns {Promise<*>}
 */
export async function cachedFetch(kind, lat, lon, fetcher, ttl) {
  const cached = getCached(kind, lat, lon)
  if (cached !== null && cached !== undefined) {
    return cached
  }
  const fresh = await fetcher()
  if (fresh !== null && fresh !== undefined) {
    setCached(kind, lat, lon, fresh, ttl)
  }
  return fresh
}

/**
 * Batched version. If ANY coordinate in the batch is uncached,
 * runs the full batch fetch and caches the whole result.
 *
 * Note: this is all-or-nothing per batch. For finer granularity, call
 * cachedFetch per location. But for route waypoints and saved-glance,
 * the batch is small and refreshing together is fine.
 */
export async function cachedFetchBatch(kind, coords, fetcher, ttl) {
  const cached = getCachedBatch(kind, coords)
  if (cached !== null && cached !== undefined) {
    return cached
  }
  const fresh = await fetcher()
  if (fresh !== null && fresh !== undefined) {
    setCachedBatch(kind, coords, fresh, ttl)
  }
  return fresh
}

// ─── INVALIDATION ───────────────────────────────────────────────────────

/**
 * Remove cached value for a single location.
 */
export function invalidate(kind, lat, lon) {
  const key = keyForLocation(kind, lat, lon)
  localStorage.removeItem(key)
}

/**
 * Remove all cached entries of a given kind.
 */
export function invalidateKind(kind) {
  try {
    const prefix = `${PREFIX}${kind}_`
    const toRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(prefix)) toRemove.push(k)
    }
    toRemove.forEach(k => localStorage.removeItem(k))
  } catch {
    // Silent
  }
}

/**
 * Nuke everything.
 */
export function invalidateAll() {
  try {
    const toRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) toRemove.push(k)
    }
    toRemove.forEach(k => localStorage.removeItem(k))
  } catch {
    // Silent
  }
}

// ─── DEBUG ──────────────────────────────────────────────────────────────

/**
 * Return cache stats for debugging.
 */
export function getCacheStats() {
  try {
    const stats = { total: 0, kinds: {}, bytes: 0 }
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k || !k.startsWith(PREFIX)) continue
      const raw = localStorage.getItem(k) || ''
      const kindMatch = k.match(new RegExp(`^${PREFIX}([a-z]+)_`))
      const kind = kindMatch ? kindMatch[1] : 'unknown'
      stats.total++
      stats.bytes += raw.length
      stats.kinds[kind] = (stats.kinds[kind] || 0) + 1
    }
    return stats
  } catch {
    return { total: 0, kinds: {}, bytes: 0 }
  }
}

// ─── DEFAULT EXPORT ─────────────────────────────────────────────────────

export default {
  TTL,
  getCached,
  setCached,
  getCachedBatch,
  setCachedBatch,
  cachedFetch,
  cachedFetchBatch,
  invalidate,
  invalidateKind,
  invalidateAll,
  sweepExpired,
  getCacheStats,
}
