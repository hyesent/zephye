// ============================================================================
// SCHEDULE ENGINE — Schedule Ask system for Zephye
// Handles: storage, state machine, fire logic, edit/shift, command detection
// ============================================================================

import { getIntentFunction, getIntentById } from './intentEngine.js'

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── CONSTANTS ────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const STORAGE_KEY = 'zephye_schedules'
const MISSED_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const FIRED_TIMEOUT_MS = 5 * 60 * 1000    // check every 5 min for missed

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
// ─── CREATE ───────────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function createSchedule({
  question,
  location,
  fromLocation = null,   // { lat, lon, label } — only if routing pill selected
  targetTime,            // timestamp
  intents,               // ['route', 'traffic', 'weather', ...]
  fireWindow = 30,       // minutes before target
  notify = 'both'        // 'toast' | 'browser' | 'both'
}) {
  const now = Date.now()
  const schedule = {
    id: `sch_${now}_${Math.random().toString(36).slice(2, 8)}`,
    question: question || '',
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
    targetTime,
    fireWindow,
    intents: intents || [],
    notify,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    history: [{ status: 'pending', timestamp: now }],
    firedAt: null,
    result: null,
    reminderCount: 0
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
// ─── ACTIONS (from toast) ────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function markDone(id) {
  return transitionSchedule(id, 'done')
}

export function markCancelled(id) {
  return transitionSchedule(id, 'cancelled')
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
    location: original.location,
    fromLocation: original.fromLocation,
    targetTime: newTargetTime,
    intents: original.intents,
    fireWindow: original.fireWindow,
    notify: original.notify
  })

  // Link them
  updateSchedule(id, { derivedId: newSchedule.id })
  updateSchedule(newSchedule.id, { derivedFrom: id })

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
    location: changes.location ?? original.location,
    fromLocation: changes.fromLocation ?? original.fromLocation,
    targetTime: original.targetTime,
    intents: changes.intents ?? original.intents,
    fireWindow: changes.fireWindow ?? original.fireWindow,
    notify: changes.notify ?? original.notify
  })

  // Link them
  updateSchedule(id, { derivedId: newSchedule.id })
  updateSchedule(newSchedule.id, { derivedFrom: id })

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

    // Basic condition mapping (duplicated here to avoid circular import)
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

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── FIRE A SCHEDULE ──────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export async function fireSchedule(schedule) {
  if (!schedule) return null

  // Fetch weather for destination
  const weather = await fetchWeatherForLocation(
    schedule.location.lat,
    schedule.location.lon
  )

  if (!weather) {
    transitionSchedule(schedule.id, 'missed', {
      firedAt: Date.now(),
      result: { error: 'Failed to fetch weather' }
    })
    return null
  }

  // Build data object passed to advice functions
  const data = {
    ...weather,
    city: schedule.location.label,
    lat: schedule.location.lat,
    lon: schedule.location.lon,
    homeLat: schedule.fromLocation?.lat ?? schedule.location.lat,
    homeLon: schedule.fromLocation?.lon ?? schedule.location.lon,
    homeName: schedule.fromLocation?.label ?? schedule.location.label,
    savedLocations: getSavedLocationsForRouting(),
    _scheduledQuestion: schedule.question,
    _scheduleFrom: schedule.fromLocation,
    _scheduleTo: schedule.location
  }

    // Run only the pills the user selected
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
        ? await intentFn(data, schedule.question)
        : intentFn(data, schedule.question)

      results.push({
        intentId,
        label: intentMeta?.section || intentId,
        content: response
      })
    } catch (e) {
      console.error(`[ScheduleEngine] Error in ${intentId}:`, e)
    }
  }
  // Merge results as plain string
  const merged = results.map(r => {
    if (typeof r.content === 'string') {
      return `${r.label}\n${r.content}`
    } else if (r.content && typeof r.content === 'object') {
      return `${r.label}\n${r.content.summary || r.content.verdict || JSON.stringify(r.content)}`
    }
    return `${r.label}\n${String(r.content)}`
  }).join('\n\n---\n\n')

  // Short summary for toast
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

  // Mark as fired
  transitionSchedule(schedule.id, 'fired', {
    firedAt: Date.now(),
    result: {
      firedAt: Date.now(),
      content: merged,
      summary: toastSummary,
      intentCount: results.length
    }
  })

  return {
    schedule,
    merged,
    toastSummary,
    results
  }
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
// ─── FUTURE TIME DETECTION ────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function detectFutureTime(question) {
  if (!question) return null
  const q = question.toLowerCase()

  const now = new Date()
  const result = { hasFutureTime: false, targetTime: null, phrase: null }

  // Pattern: "in X days/hours/minutes"
  const inMatch = q.match(/in\s+(\d+)\s+(day|days|hour|hours|hr|hrs|minute|minutes|min|mins)\b/i)
  if (inMatch) {
    const num = parseInt(inMatch[1])
    const unit = inMatch[2].toLowerCase()
    const target = new Date(now)

    if (unit.startsWith('day')) target.setDate(target.getDate() + num)
    else if (unit.startsWith('hour') || unit.startsWith('hr')) target.setHours(target.getHours() + num)
    else if (unit.startsWith('min')) target.setMinutes(target.getMinutes() + num)

    // Try to also parse a time of day if present
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

  // Pattern: "tomorrow at X"
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

  // Pattern: "next week"
  if (q.includes('next week')) {
    const target = new Date(now)
    target.setDate(target.getDate() + 7)
    target.setHours(9, 0, 0, 0)
    result.hasFutureTime = true
    result.targetTime = target.getTime()
    result.phrase = 'next week'
    return result
  }

  // Pattern: "on monday" / "on saturday" etc (with optional time)
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
