// ============================================================================
// SCHEDULE ENGINE — Schedule Ask system for Zephye
// Handles: storage, state machine, fire logic, edit/shift, recurrence,
//          route waypoints, multi-location, day-snapshot rewriting
// ============================================================================

import { getIntentFunction, getIntentById } from './intentEngine.js'
import { rewriteQuestionForFireDay } from './scheduleParser.js'

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── CONSTANTS ────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const STORAGE_KEY = 'zephye_schedules'
const MISSED_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const FIRED_TIMEOUT_MS = 5 * 60 * 1000    // check every 5 min for missed

// Recurrence safety cap
const MAX_RECURRENCE_OCCURRENCES = 52

// Auto-clean history older than 30 days
const HISTORY_CLEANUP_MS = 30 * 24 * 60 * 60 * 1000

// Retry weather fetch
const WEATHER_FETCH_RETRIES = 3
const WEATHER_FETCH_RETRY_DELAY_MS = 2000

// Max waypoints to sample on a route
const MAX_ROUTE_WAYPOINTS = 3

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── STORAGE ──────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function getSchedules() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveSchedules(schedules) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules))
  } catch {
    // Storage full — clean up old fired/cancelled/done records
    const cleaned = schedules.filter(s => 
      s.status === 'pending' || s.status === 'fired' || s.status === 'missed'
    )
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
    } catch {
      // Give up
    }
  }
}

export function getScheduleById(id) {
  return getSchedules().find(s => s.id === id) || null
}

export function getPendingSchedules() {
  return getSchedules().filter(s => s.status === 'pending')
}

export function getFiredSchedules() {
  return getSchedules().filter(s => s.status === 'fired')
}

export function getHistorySchedules() {
  return getSchedules().filter(s => 
    ['done', 'shifted', 'edited', 'cancelled', 'dismissed', 'missed'].includes(s.status)
  )
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── AUTO-CLEAN (runs on due check) ──────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

function autoCleanHistory() {
  const now = Date.now()
  const schedules = getSchedules()
  const before = schedules.length

  const cleaned = schedules.filter(s => {
    // Always keep pending + fired
    if (s.status === 'pending' || s.status === 'fired') return true

    // Keep history records younger than 30 days
    const age = now - (s.updatedAt || s.createdAt || now)
    return age < HISTORY_CLEANUP_MS
  })

  if (cleaned.length !== before) {
    saveSchedules(cleaned)
    console.log(`[ScheduleEngine] Auto-cleaned ${before - cleaned.length} old history records`)
  }
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── CREATE ───────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function createSchedule({
  question,
  resolvedQuestion = null,          // 🆕 rewritten for fire day
  resolvedDate = null,              // 🆕 "2026-09-14"
  relativeWordMap = {},             // 🆕 { tomorrow: 'today' }
  isDaySnapshot = false,            // 🆕 day overview vs moment

  locationMode = 'single',          // 🆕 'single' | 'route' | 'multi'
  location,
  fromLocation = null,              // 🆕 only if route mode
  extraLocations = [],              // 🆕 for multi mode
  checkWaypoints = false,           // 🆕 auto-true for route

  targetTime,
  fireWindow = 30,
  intents,
  recurrence = { mode: 'once', daysOfWeek: [], until: null },  // 🆕
  askNowToo = false,                // 🆕

  notify = 'both'
}) {
  const now = Date.now()

  const schedule = {
    id: `sch_${now}_${Math.random().toString(36).slice(2, 8)}`,

    // Question + rewriting
    question: question || '',
    resolvedQuestion: resolvedQuestion || question || '',
    resolvedDate,
    relativeWordMap: relativeWordMap || {},
    isDaySnapshot,

    // Location modes
    locationMode,
    location: {
      lat: location?.lat || 0,
      lon: location?.lon || 0,
      label: location?.label || location?.name || 'Unknown'
    },
    fromLocation: fromLocation ? {
      lat: fromLocation.lat,
      lon: fromLocation.lon,
      label: fromLocation.label || fromLocation.name || 'Unknown'
    } : null,
    extraLocations: (extraLocations || []).map(l => ({
      lat: l.lat,
      lon: l.lon,
      label: l.label || l.name || 'Unknown'
    })),
    checkWaypoints: locationMode === 'route' ? (checkWaypoints !== false) : false,

    // Core
    targetTime,
    fireWindow,
    intents: intents || [],

    // Recurrence
    recurrence: recurrence || { mode: 'once', daysOfWeek: [], until: null },
    chainCount: 0,
    maxOccurrences: MAX_RECURRENCE_OCCURRENCES,

    // Flags
    askNowToo,
    notify,

    // State machine
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    history: [{ status: 'pending', timestamp: now }],
    firedAt: null,
    result: null,
    reminderCount: 0,

    // Chain linking
    derivedFrom: null,
    derivedId: null
  }

  const schedules = getSchedules()
  schedules.push(schedule)
  saveSchedules(schedules)
  return schedule
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── UPDATE ───────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function updateSchedule(id, changes) {
  const schedules = getSchedules()
  const idx = schedules.findIndex(s => s.id === id)
  if (idx === -1) return null

  const updated = {
    ...schedules[idx],
    ...changes,
    updatedAt: Date.now()
  }

  if (changes.status && changes.status !== schedules[idx].status) {
    updated.history = [
      ...(schedules[idx].history || []),
      { status: changes.status, timestamp: Date.now() }
    ]
  }

  schedules[idx] = updated
  saveSchedules(schedules)
  return updated
}

export function transitionSchedule(id, newStatus, extra = {}) {
  return updateSchedule(id, { status: newStatus, ...extra })
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── DELETE ───────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function deleteSchedule(id) {
  const schedules = getSchedules().filter(s => s.id !== id)
  saveSchedules(schedules)
  return true
}

export function clearHistory() {
  const schedules = getSchedules().filter(s => 
    s.status === 'pending' || s.status === 'fired'
  )
  saveSchedules(schedules)
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── CANCEL WITH PROMPT (single vs chain) ────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

/**
 * Cancel a schedule.
 * @param {string} id
 * @param {string} mode — 'one' (cancel this occurrence) | 'chain' (kill entire recurrence)
 */
export function cancelSchedule(id, mode = 'one') {
  const schedule = getScheduleById(id)
  if (!schedule) return null

  // Mark this one cancelled
  transitionSchedule(id, 'cancelled')

  if (mode === 'chain') {
    // Find the root of the chain
    let root = schedule
    let safety = 0
    while (root.derivedFrom && safety < 100) {
      const parent = getScheduleById(root.derivedFrom)
      if (!parent) break
      root = parent
      safety++
    }

    // BFS forward through all descendants
    const all = getSchedules()
    const queue = [root.id]
    const visited = new Set()

    while (queue.length > 0) {
      const currentId = queue.shift()
      if (visited.has(currentId)) continue
      visited.add(currentId)

      const current = all.find(s => s.id === currentId)
      if (!current) continue

      // Cancel any pending in the chain
      if (current.status === 'pending') {
        transitionSchedule(current.id, 'cancelled')
      }

      // Queue children
      all.forEach(s => {
        if (s.derivedFrom === currentId && !visited.has(s.id)) {
          queue.push(s.id)
        }
      })
    }
  }

  return getScheduleById(id)
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── ACTIONS (from toast) ────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function markDone(id) {
  return transitionSchedule(id, 'done')
}

export function markCancelled(id, mode = 'one') {
  // Delegate to cancelSchedule for chain-awareness
  return cancelSchedule(id, mode)
}

export function markDismissed(id) {
  return transitionSchedule(id, 'dismissed')
}

export function markMissed(id) {
  return transitionSchedule(id, 'missed')
}

// Shift = same schedule, new target time → creates new pending
export function shiftSchedule(id, newTargetTime) {
  const original = getScheduleById(id)
  if (!original) return null

  // Mark old as shifted
  transitionSchedule(id, 'shifted', {
    shiftedTo: newTargetTime
  })

  // Create new pending with same everything except target time
  const newSchedule = createSchedule({
    question: original.question,
    resolvedQuestion: original.resolvedQuestion,
    resolvedDate: original.resolvedDate,
    relativeWordMap: original.relativeWordMap,
    isDaySnapshot: original.isDaySnapshot,
    locationMode: original.locationMode,
    location: original.location,
    fromLocation: original.fromLocation,
    extraLocations: original.extraLocations,
    checkWaypoints: original.checkWaypoints,
    targetTime: newTargetTime,
    intents: original.intents,
    recurrence: original.recurrence,
    fireWindow: original.fireWindow,
    notify: original.notify
  })

  // Link them
  updateSchedule(id, { derivedId: newSchedule.id })
  updateSchedule(newSchedule.id, {
    derivedFrom: id,
    chainCount: original.chainCount || 0
  })

  return newSchedule
}

// Edit = same target time, new config → creates new pending
export function editSchedule(id, changes) {
  const original = getScheduleById(id)
  if (!original) return null

  // Mark old as edited
  transitionSchedule(id, 'edited', {
    editedAt: Date.now(),
    editedChanges: changes
  })

  // Create new pending with edits applied (but same target time)
  const newSchedule = createSchedule({
    question: changes.question ?? original.question,
    resolvedQuestion: changes.resolvedQuestion ?? original.resolvedQuestion,
    resolvedDate: changes.resolvedDate ?? original.resolvedDate,
    relativeWordMap: changes.relativeWordMap ?? original.relativeWordMap,
    isDaySnapshot: changes.isDaySnapshot ?? original.isDaySnapshot,
    locationMode: changes.locationMode ?? original.locationMode,
    location: changes.location ?? original.location,
    fromLocation: changes.fromLocation ?? original.fromLocation,
    extraLocations: changes.extraLocations ?? original.extraLocations,
    checkWaypoints: changes.checkWaypoints ?? original.checkWaypoints,
    targetTime: original.targetTime,
    intents: changes.intents ?? original.intents,
    recurrence: changes.recurrence ?? original.recurrence,
    fireWindow: changes.fireWindow ?? original.fireWindow,
    notify: changes.notify ?? original.notify
  })

  // Link them
  updateSchedule(id, { derivedId: newSchedule.id })
  updateSchedule(newSchedule.id, {
    derivedFrom: id,
    chainCount: original.chainCount || 0
  })

  return newSchedule
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── RECURRENCE SPAWNER ───────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function spawnNextRecurrence(schedule) {
  const recurrence = schedule.recurrence || { mode: 'once' }
  if (recurrence.mode === 'once') return null

  const count = schedule.chainCount || 0
  const maxCount = schedule.maxOccurrences || MAX_RECURRENCE_OCCURRENCES

  if (count >= maxCount) {
    console.log('[ScheduleEngine] Recurrence cap reached — stopping chain')
    return null
  }

  // ─── Compute next target time ─────────────────────────────────────
  const currentTarget = new Date(schedule.targetTime)
  const nextTarget = new Date(currentTarget)

  if (recurrence.mode === 'daily') {
    nextTarget.setDate(nextTarget.getDate() + 1)
  } else if (recurrence.mode === 'weekly') {
    nextTarget.setDate(nextTarget.getDate() + 7)
  } else if (recurrence.mode === 'weekdays') {
    nextTarget.setDate(nextTarget.getDate() + 1)
    let guard = 0
    while ((nextTarget.getDay() === 0 || nextTarget.getDay() === 6) && guard < 14) {
      nextTarget.setDate(nextTarget.getDate() + 1)
      guard++
    }
  } else if (recurrence.mode === 'weekends') {
    nextTarget.setDate(nextTarget.getDate() + 1)
    let guard = 0
    while (nextTarget.getDay() !== 0 && nextTarget.getDay() !== 6 && guard < 14) {
      nextTarget.setDate(nextTarget.getDate() + 1)
      guard++
    }
  } else if (recurrence.mode === 'custom' && recurrence.daysOfWeek?.length > 0) {
    nextTarget.setDate(nextTarget.getDate() + 1)
    let guard = 0
    while (!recurrence.daysOfWeek.includes(nextTarget.getDay()) && guard < 14) {
      nextTarget.setDate(nextTarget.getDate() + 1)
      guard++
    }
  } else {
    // Unknown mode — treat as once
    return null
  }

  // ─── Check until date ─────────────────────────────────────────────
  if (recurrence.until && nextTarget.getTime() > recurrence.until) {
    console.log('[ScheduleEngine] Recurrence until date passed — stopping chain')
    return null
  }

  // ─── Create new pending schedule ──────────────────────────────────
  const now = Date.now()
  const newSchedule = {
    ...schedule,
    id: `sch_${now}_${Math.random().toString(36).slice(2, 8)}`,
    targetTime: nextTarget.getTime(),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    history: [{ status: 'pending', timestamp: now }],
    firedAt: null,
    result: null,
    reminderCount: 0,
    chainCount: count,   // inherit — will increment when THIS fires
    derivedFrom: schedule.id,
    derivedId: null
  }

  const schedules = getSchedules()
  schedules.push(newSchedule)
  saveSchedules(schedules)

  return newSchedule
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── DUE CHECK ────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

// Returns schedules that should fire now (targetTime - fireWindow <= now)
export function getDueSchedules() {
  const now = Date.now()
  return getSchedules().filter(s => {
    if (s.status !== 'pending') return false
    const fireAt = s.targetTime - (s.fireWindow || 30) * 60 * 1000
    return fireAt <= now
  })
}

// Returns fired schedules that should transition to missed (30+ min old)
export function getMissedCandidates() {
  const now = Date.now()
  return getSchedules().filter(s => {
    if (s.status !== 'fired') return false
    if (!s.firedAt) return false
    return (now - s.firedAt) >= MISSED_TIMEOUT_MS
  })
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── WEATHER FETCH (self-contained, no external import) ──────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

async function fetchWeatherForLocation(lat, lon) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,wind_gusts_10m,pressure_msl,relative_humidity_2m,wind_speed_10m,cloud_cover,visibility,uv_index,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,weathercode,uv_index_max,sunrise,sunset,precipitation_sum,precipitation_probability_max,cloud_cover&timezone=auto`
    )
    const om = await res.json()

    const WMO = {
      0: 'clear', 1: 'clear', 2: 'partly-cloudy', 3: 'cloudy',
      45: 'fog', 48: 'fog', 51: 'drizzle', 53: 'drizzle', 55: 'drizzle',
      61: 'rain', 63: 'rain', 65: 'rain', 71: 'snow', 73: 'snow', 75: 'snow',
      80: 'rain', 81: 'rain', 82: 'rain', 95: 'thunderstorm', 96: 'thunderstorm', 99: 'thunderstorm'
    }

    return {
      hourly: om.hourly || {},
      daily: om.daily || {},
      temp: Math.round(om.current_weather?.temperature ?? 0),
      feelsLike: Math.round(om.hourly?.apparent_temperature?.[0] ?? om.current_weather?.temperature ?? 0),
      humidity: om.hourly?.relative_humidity_2m?.[0] ?? 50,
      wind: om.current_weather?.windspeed ?? 0,
      windDir: om.current_weather?.winddirection ?? 0,
      windGust: om.hourly?.wind_gusts_10m?.[0] ?? 0,
      uvIndex: om.hourly?.uv_index?.[0] ?? om.daily?.uv_index_max?.[0] ?? 0,
      conditionCode: om.current_weather?.weathercode ?? 0,
      condition: WMO[om.current_weather?.weathercode ?? 0] || 'cloudy',
      cloudCover: om.hourly?.cloud_cover?.[0] ?? 0,
      precipitationProb: om.hourly?.precipitation_probability?.[0] ?? 0,
      precipitation: om.hourly?.precipitation?.[0] ?? 0,
      pressure: om.hourly?.pressure_msl?.[0] ?? 0,
      visibility: om.hourly?.visibility?.[0] ? om.hourly.visibility[0] / 1000 : 10,
      tempMax: om.daily?.temperature_2m_max?.[0] ?? 0,
      tempMin: om.daily?.temperature_2m_min?.[0] ?? 0,
      sunrise: om.daily?.sunrise?.[0] ?? '',
      sunset: om.daily?.sunset?.[0] ?? '',
      lat,
      lon
    }
  } catch {
    return null
  }
}

/**
 * Fetch with retry — 3 attempts, 2s apart.
 */
async function fetchWeatherWithRetry(lat, lon) {
  for (let attempt = 0; attempt < WEATHER_FETCH_RETRIES; attempt++) {
    const result = await fetchWeatherForLocation(lat, lon)
    if (result) return result

    if (attempt < WEATHER_FETCH_RETRIES - 1) {
      await new Promise(r => setTimeout(r, WEATHER_FETCH_RETRY_DELAY_MS))
    }
  }
  return null
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── WAYPOINT DISCOVERY (uses saved locations, no CITY_DATABASE) ─────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

/**
 * Find saved locations that lie roughly between two points.
 * Uses a lat/lon bounding box heuristic (no external API).
 */
function getWaypointsAlong(fromLat, fromLon, toLat, toLon, savedLocations, max = MAX_ROUTE_WAYPOINTS) {
  if (!fromLat || !fromLon || !toLat || !toLon) return []
  if (!savedLocations || savedLocations.length === 0) return []

  const minLat = Math.min(fromLat, toLat) - 0.5
  const maxLat = Math.max(fromLat, toLat) + 0.5
  const minLon = Math.min(fromLon, toLon) - 0.5
  const maxLon = Math.max(fromLon, toLon) + 0.5

  const candidates = savedLocations.filter(loc => {
    if (!loc.lat || !loc.lon) return false

    // Exclude endpoints (same as from or to within 5km)
    const dFrom = Math.hypot(loc.lat - fromLat, loc.lon - fromLon)
    const dTo = Math.hypot(loc.lat - toLat, loc.lon - toLon)
    if (dFrom < 0.05 || dTo < 0.05) return false

    // Must be inside the bounding box
    return loc.lat >= minLat && loc.lat <= maxLat && loc.lon >= minLon && loc.lon <= maxLon
  })

  // Sort by distance from start
  candidates.sort((a, b) => {
    const da = Math.hypot(a.lat - fromLat, a.lon - fromLon)
    const db = Math.hypot(b.lat - fromLat, b.lon - fromLon)
    return da - db
  })

  return candidates.slice(0, max)
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── RUN INTENTS (shared by fire + preview) ──────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

async function runScheduleIntents(schedule, { persist = true } = {}) {
  if (!schedule) return null

  // ─── Day-snapshot rewriting ───────────────────────────────────────
  // "will it rain tomorrow?" → on fire day → "will it rain today?"
  const fireQuestion = schedule.resolvedQuestion
    || (schedule.relativeWordMap
        ? rewriteQuestionForFireDay(schedule.question, schedule.relativeWordMap)
        : schedule.question)

  // ─── Determine locations to fetch ─────────────────────────────────
  const locationMode = schedule.locationMode || 'single'
  const locationList = []

  if (locationMode === 'route') {
    // From + waypoints + To
    if (schedule.fromLocation?.lat) {
      locationList.push({ ...schedule.fromLocation, _role: 'from' })
    }

    const saved = getSavedLocationsForRouting()
    const waypoints = schedule.checkWaypoints !== false
      ? getWaypointsAlong(
          schedule.fromLocation?.lat, schedule.fromLocation?.lon,
          schedule.location.lat, schedule.location.lon,
          saved
        )
      : []

    waypoints.forEach(w => locationList.push({
      lat: w.lat, lon: w.lon, label: w.label || w.name, _role: 'waypoint'
    }))

    locationList.push({ ...schedule.location, _role: 'to' })
  } else if (locationMode === 'multi') {
    // Primary + extras
    locationList.push({ ...schedule.location, _role: 'primary' })
    ;(schedule.extraLocations || []).forEach(l => locationList.push({
      ...l, _role: 'extra'
    }))
  } else {
    locationList.push({ ...schedule.location, _role: 'single' })
  }

  // ─── Fetch weather for each (with retry) ──────────────────────────
  const weatherMap = {}
  for (const loc of locationList) {
    const weather = await fetchWeatherWithRetry(loc.lat, loc.lon)
    weatherMap[loc.label] = weather
  }

  // ─── Primary weather must succeed ─────────────────────────────────
  const primaryWeather = weatherMap[schedule.location.label]
  if (!primaryWeather) {
    if (persist) {
      transitionSchedule(schedule.id, 'missed', {
        firedAt: Date.now(),
        result: { error: 'Failed to fetch weather after retries' }
      })
    }
    return null
  }

  // ─── Build enriched data ──────────────────────────────────────────
  const baseData = {
    ...primaryWeather,
    city: schedule.location.label,
    lat: schedule.location.lat,
    lon: schedule.location.lon,
    homeLat: schedule.fromLocation?.lat ?? schedule.location.lat,
    homeLon: schedule.fromLocation?.lon ?? schedule.location.lon,
    homeName: schedule.fromLocation?.label ?? schedule.location.label,
    savedLocations: getSavedLocationsForRouting(),
    _scheduledQuestion: fireQuestion,
    _originalQuestion: schedule.question,
    _scheduleFrom: schedule.fromLocation,
    _scheduleTo: schedule.location,
    _locationMode: locationMode
  }

  if (locationMode === 'route') {
    baseData._waypoints = locationList
      .filter(l => l._role === 'waypoint')
      .map(w => ({
        label: w.label,
        weather: weatherMap[w.label]
      }))
    baseData._fromWeather = weatherMap[schedule.fromLocation?.label]
  } else if (locationMode === 'multi') {
    baseData._multiLocations = locationList.map(loc => ({
      label: loc.label,
      weather: weatherMap[loc.label],
      role: loc._role
    }))
  }

  // ─── Run intents ──────────────────────────────────────────────────
  const results = []
  for (const intentId of schedule.intents) {
    const intentFn = getIntentFunction(intentId)
    const intentMeta = getIntentById(intentId)

    if (typeof intentFn !== 'function') {
      console.warn(`[ScheduleEngine] No function for intent: ${intentId}`)
      continue
    }

    try {
      const isAsync = ['farming', 'stargazing', 'route', 'traffic'].includes(intentId)
      const response = isAsync
        ? await intentFn(baseData, fireQuestion)
        : intentFn(baseData, fireQuestion)

      results.push({
        intentId,
        label: intentMeta?.section || intentId,
        content: response
      })
    } catch (e) {
      console.error(`[ScheduleEngine] Error in ${intentId}:`, e)
    }
  }

  // ─── Merge results ────────────────────────────────────────────────
  const merged = results.map(r => {
    if (typeof r.content === 'string') {
      return `${r.label}\n${r.content}`
    } else if (r.content && typeof r.content === 'object') {
      return `${r.label}\n${r.content.summary || r.content.verdict || JSON.stringify(r.content)}`
    }
    return `${r.label}\n${String(r.content)}`
  }).join('\n\n---\n\n')

  // ─── Short summary ────────────────────────────────────────────────
  const summaryParts = results.map(r => {
    if (r.content && typeof r.content === 'object' && r.content.verdict) {
      return `${r.label}: ${r.content.verdict}`
    }
    if (typeof r.content === 'string') {
      const firstLine = r.content.split('\n').find(l => l.trim())
      return `${r.label}: ${firstLine?.slice(0, 60) || ''}`
    }
    return r.label
  })

  const toastSummary = summaryParts.join(' · ')

  // ─── Persist (fire mode only) ─────────────────────────────────────
  if (persist) {
    const newChainCount = (schedule.chainCount || 0) + 1

    transitionSchedule(schedule.id, 'fired', {
      firedAt: Date.now(),
      chainCount: newChainCount,
      result: {
        firedAt: Date.now(),
        content: merged,
        summary: toastSummary,
        intentCount: results.length,
        fireQuestion,
        locationMode
      }
    })

    // Spawn next recurrence
    const recurrence = schedule.recurrence || { mode: 'once' }
    if (recurrence.mode !== 'once') {
      const next = spawnNextRecurrence({
        ...schedule,
        chainCount: newChainCount
      })
      if (next) {
        updateSchedule(schedule.id, { derivedId: next.id })
      }
    }
  }

  return {
    schedule,
    merged,
    toastSummary,
    results,
    fireQuestion
  }
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── FIRE A SCHEDULE ──────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export async function fireSchedule(schedule) {
  return runScheduleIntents(schedule, { persist: true })
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── PREVIEW A SCHEDULE (ask-now-too) ────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

/**
 * Run intents without persisting state or spawning recurrence.
 * Used for "Ask now too" — user sees result immediately.
 */
export async function previewSchedule(schedule) {
  return runScheduleIntents(schedule, { persist: false })
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── SAVED LOCATIONS HELPER ──────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

function getSavedLocationsForRouting() {
  try {
    const raw = localStorage.getItem('zephye_saved_locations')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(l => l.lat && l.lon) : []
  } catch {
    return []
  }
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── COMMAND DETECTION ────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const SCHEDULE_COMMAND_PATTERNS = [
  /^(open\s+)?schedules?$/i,
  /^my\s+schedules?$/i,
  /^scheduled(\s+asks?)?$/i,
  /^reminders?$/i,
  /^my\s+reminders?$/i,
  /^upcoming$/i,
  /^show\s+schedules?$/i,
  /^list\s+schedules?$/i,
  /^view\s+schedules?$/i,
  /^open\s+my\s+schedules?$/i,
  /^my\s+scheduled\s+asks?$/i,
  /^show\s+(my\s+)?reminders?$/i
]

export function isScheduleCommand(question) {
  if (!question) return false
  const q = question.trim()
  return SCHEDULE_COMMAND_PATTERNS.some(p => p.test(q))
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── FUTURE TIME DETECTION (legacy — kept for compatibility) ─────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function detectFutureTime(question) {
  if (!question) return null
  const q = question.toLowerCase()

  const now = new Date()
  const result = { hasFutureTime: false, targetTime: null, phrase: null }

  const inMatch = q.match(/in\s+(\d+)\s+(day|days|hour|hours|hr|hrs|minute|minutes|min|mins)\b/i)
  if (inMatch) {
    const num = parseInt(inMatch[1])
    const unit = inMatch[2].toLowerCase()
    const target = new Date(now)

    if (unit.startsWith('day')) target.setDate(target.getDate() + num)
    else if (unit.startsWith('hour') || unit.startsWith('hr')) target.setHours(target.getHours() + num)
    else if (unit.startsWith('min')) target.setMinutes(target.getMinutes() + num)

    const timeMatch = q.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
    if (timeMatch) {
      let hour = parseInt(timeMatch[1])
      const minute = parseInt(timeMatch[2]) || 0
      const ampm = timeMatch[3]?.toLowerCase()
      if (ampm === 'pm' && hour < 12) hour += 12
      if (ampm === 'am' && hour === 12) hour = 0
      target.setHours(hour, minute, 0, 0)
    }

    result.hasFutureTime = true
    result.targetTime = target.getTime()
    result.phrase = inMatch[0]
    return result
  }

  if (q.includes('tomorrow')) {
    const target = new Date(now)
    target.setDate(target.getDate() + 1)
    const timeMatch = q.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
    if (timeMatch) {
      let hour = parseInt(timeMatch[1])
      const minute = parseInt(timeMatch[2]) || 0
      const ampm = timeMatch[3]?.toLowerCase()
      if (ampm === 'pm' && hour < 12) hour += 12
      if (ampm === 'am' && hour === 12) hour = 0
      target.setHours(hour, minute, 0, 0)
    } else {
      target.setHours(9, 0, 0, 0)
    }
    result.hasFutureTime = true
    result.targetTime = target.getTime()
    result.phrase = 'tomorrow'
    return result
  }

  if (q.includes('next week')) {
    const target = new Date(now)
    target.setDate(target.getDate() + 7)
    target.setHours(9, 0, 0, 0)
    result.hasFutureTime = true
    result.targetTime = target.getTime()
    result.phrase = 'next week'
    return result
  }

  const dayMatch = q.match(/\b(?:on\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)
  if (dayMatch) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const targetDay = days.indexOf(dayMatch[1].toLowerCase())
    const target = new Date(now)
    const daysUntil = (targetDay - target.getDay() + 7) % 7 || 7
    target.setDate(target.getDate() + daysUntil)

    const timeMatch = q.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
    if (timeMatch) {
      let hour = parseInt(timeMatch[1])
      const minute = parseInt(timeMatch[2]) || 0
      const ampm = timeMatch[3]?.toLowerCase()
      if (ampm === 'pm' && hour < 12) hour += 12
      if (ampm === 'am' && hour === 12) hour = 0
      target.setHours(hour, minute, 0, 0)
    } else {
      target.setHours(9, 0, 0, 0)
    }

    result.hasFutureTime = true
    result.targetTime = target.getTime()
    result.phrase = dayMatch[0]
    return result
  }

  return result
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── MAIN CHECK (called from App.jsx on mount + interval) ────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export async function checkDueSchedules() {
  // Auto-clean old history first (cheap)
  autoCleanHistory()

  const due = getDueSchedules()
  const fired = []

  for (const schedule of due) {
    try {
      const result = await fireSchedule(schedule)
      if (result) fired.push(result)
    } catch (e) {
      console.error('[ScheduleEngine] Fire failed:', e)
    }
  }

  // Also check for missed (fired but ignored)
  const missed = getMissedCandidates()
  for (const s of missed) {
    transitionSchedule(s.id, 'missed')
  }

  return fired
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── UTILITIES ────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function getCountdown(targetTime) {
  const now = Date.now()
  const diff = targetTime - now

  if (diff <= 0) return 'Fired'

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function formatScheduleTime(targetTime) {
  const d = new Date(targetTime)
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export { MISSED_TIMEOUT_MS, FIRED_TIMEOUT_MS }
