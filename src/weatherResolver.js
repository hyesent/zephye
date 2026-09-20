// ============================================================================
// WEATHER RESOLVER — The brain
// ============================================================================

import {
  fetchWeather,
  fetchWeatherBatch,
  fetchWeatherWithAqi,
} from './weatherFetcher.js'

const DAY_NAMES = [
  'sunday', 'monday', 'tuesday', 'wednesday',
  'thursday', 'friday', 'saturday',
]

const LOCATION_STOPWORDS = new Set([
  'the', 'a', 'an', 'my', 'your', 'his', 'her', 'our', 'their',
  'this', 'that', 'these', 'those', 'here', 'there',
  'morning', 'afternoon', 'evening', 'night', 'tonight',
  'today', 'tomorrow', 'yesterday', 'weekend', 'weekday',
  'now', 'later', 'soon', 'outside',
])

const HOME_ALIASES = new Set([
  'home', 'my home', 'my place', 'my house', 'here', 'current location',
])

const WORK_ALIASES = new Set([
  'work', 'office', 'my office', 'my work', 'workplace',
])

// ─── TEXT UTILITIES ─────────────────────────────────────────────────────

function cleanLocationHint(raw) {
  if (!raw) return null
  let s = raw.trim().replace(/[,?.!]+$/, '').replace(/\s+/g, ' ')
  s = s.replace(/^the\s+/i, '')
  return s || null
}

function stripStopword(text) {
  return LOCATION_STOPWORDS.has(text.toLowerCase()) ? null : text
}

// ─── TIME PARSING ───────────────────────────────────────────────────────

export function parseTimeReference(question, now = new Date()) {
  const q = (question || '').toLowerCase()

  const result = {
    targetDate: new Date(now),
    timePhrase: null,
    hasSpecificHour: false,
    isFuture: false,
    daysAhead: 0,
    explicitHour: null,
    explicitMinute: 0,
  }

  result.targetDate.setSeconds(0, 0)

  const inMatch = q.match(/\bin\s+(\d+)\s+(day|days|hour|hours|hr|hrs|min|mins|minute|minutes)\b/i)
  if (inMatch) {
    const num = parseInt(inMatch[1], 10)
    const unit = inMatch[2].toLowerCase()
    if (unit.startsWith('day')) {
      result.targetDate.setDate(result.targetDate.getDate() + num)
      result.daysAhead = num
    } else if (unit.startsWith('hour') || unit.startsWith('hr')) {
      result.targetDate.setHours(result.targetDate.getHours() + num)
    } else {
      result.targetDate.setMinutes(result.targetDate.getMinutes() + num)
    }
    result.isFuture = true
    result.timePhrase = inMatch[0]
  }

  if (/\bday\s+after\s+tomorrow\b/i.test(q)) {
    result.targetDate.setDate(result.targetDate.getDate() + 2)
    result.daysAhead = 2
    result.isFuture = true
    result.timePhrase = 'day after tomorrow'
  } else if (/\btomorrow\b/i.test(q)) {
    result.targetDate.setDate(result.targetDate.getDate() + 1)
    result.daysAhead = 1
    result.isFuture = true
    result.timePhrase = 'tomorrow'
  } else if (/\byesterday\b/i.test(q)) {
    result.targetDate.setDate(result.targetDate.getDate() - 1)
    result.daysAhead = -1
    result.timePhrase = 'yesterday'
  } else {
    const nextDayMatch = q.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)
    if (nextDayMatch) {
      const targetDayIdx = DAY_NAMES.indexOf(nextDayMatch[1].toLowerCase())
      const currentDay = result.targetDate.getDay()
      let diff = (targetDayIdx - currentDay + 7) % 7
      if (diff === 0) diff = 7
      diff += 7
      result.targetDate.setDate(result.targetDate.getDate() + diff)
      result.daysAhead = diff
      result.isFuture = true
      result.timePhrase = nextDayMatch[0]
    } else {
      const thisDayMatch = q.match(/\b(?:this\s+|on\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)
      if (thisDayMatch) {
        const targetDayIdx = DAY_NAMES.indexOf(thisDayMatch[1].toLowerCase())
        const currentDay = result.targetDate.getDay()
        let diff = (targetDayIdx - currentDay + 7) % 7
        if (diff === 0) diff = 7
        result.targetDate.setDate(result.targetDate.getDate() + diff)
        result.daysAhead = diff
        result.isFuture = true
        result.timePhrase = thisDayMatch[0].trim()
      } else if (/\bnext\s+week\b/i.test(q)) {
        result.targetDate.setDate(result.targetDate.getDate() + 7)
        result.daysAhead = 7
        result.isFuture = true
        result.timePhrase = 'next week'
      } else if (/\b(?:this\s+)?weekend\b/i.test(q)) {
        const currentDay = result.targetDate.getDay()
        const daysUntilSat = (6 - currentDay + 7) % 7 || 7
        result.targetDate.setDate(result.targetDate.getDate() + daysUntilSat)
        result.daysAhead = daysUntilSat
        result.isFuture = true
        result.timePhrase = 'this weekend'
      }
    }
  }

  const hourMatch = q.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i)
  if (hourMatch) {
    let hour = parseInt(hourMatch[1], 10)
    const minute = parseInt(hourMatch[2], 10) || 0
    const ampm = hourMatch[3]?.toLowerCase()
    if (ampm === 'pm' && hour < 12) hour += 12
    if (ampm === 'am' && hour === 12) hour = 0
    if (hour >= 0 && hour <= 23) {
      result.explicitHour = hour
      result.explicitMinute = minute
      result.hasSpecificHour = true
    }
  }

  if (!result.hasSpecificHour) {
    if (/\b(?:morning|sunrise|dawn)\b/i.test(q)) {
      result.explicitHour = 8
      result.hasSpecificHour = true
      if (!result.timePhrase) result.timePhrase = 'morning'
    } else if (/\b(?:afternoon|noon|midday|lunch)\b/i.test(q)) {
      result.explicitHour = 14
      result.hasSpecificHour = true
      if (!result.timePhrase) result.timePhrase = 'afternoon'
    } else if (/\b(?:evening|sunset|dusk)\b/i.test(q)) {
      result.explicitHour = 19
      result.hasSpecificHour = true
      if (!result.timePhrase) result.timePhrase = 'evening'
    } else if (/\b(?:night|tonight|midnight)\b/i.test(q)) {
      result.explicitHour = 22
      result.hasSpecificHour = true
      if (!result.timePhrase) result.timePhrase = 'night'
    }
  }

  if (result.hasSpecificHour) {
    result.targetDate.setHours(result.explicitHour, result.explicitMinute, 0, 0)
    if (!result.isFuture && result.targetDate.getTime() < now.getTime()) {
      result.targetDate.setDate(result.targetDate.getDate() + 1)
      result.daysAhead = 1
      result.isFuture = true
    }
  }

  return result
}

export function sliceWeatherByTime(weather, timeRef, now = new Date()) {
  if (!weather) return null

  const bundle = {
    ...weather,
    _targetDate: timeRef?.targetDate ?? now,
    _timeLabel: timeRef?.timePhrase ?? null,
    _dayOffset: timeRef?.daysAhead ?? 0,
  }

  const hourly = weather.hourly || {}
  const daily = weather.daily || {}
  const times = hourly.time || []

  let hourIndex = -1
  if (times.length > 0 && timeRef?.hasSpecificHour) {
    const targetMs = timeRef.targetDate.getTime()
    let bestDiff = Infinity
    times.forEach((t, i) => {
      const ms = new Date(t).getTime()
      const diff = Math.abs(ms - targetMs)
      if (diff < bestDiff) { bestDiff = diff; hourIndex = i }
    })
    if (bestDiff > 2 * 60 * 60 * 1000) hourIndex = -1
  }

  let dayIndex = -1
  if (daily.time && daily.time.length > 0) {
    const targetDay = new Date(timeRef?.targetDate ?? now)
    targetDay.setHours(12, 0, 0, 0)
    const targetMs = targetDay.getTime()
    let bestDiff = Infinity
    daily.time.forEach((t, i) => {
      const dayMs = new Date(t).getTime() + 12 * 60 * 60 * 1000
      const diff = Math.abs(dayMs - targetMs)
      if (diff < bestDiff) { bestDiff = diff; dayIndex = i }
    })
    if (bestDiff > 30 * 60 * 60 * 1000) dayIndex = -1
  }

  if (dayIndex === -1 && timeRef?.daysAhead != null && daily.time?.length > timeRef.daysAhead && timeRef.daysAhead >= 0) {
    dayIndex = timeRef.daysAhead
  }

  bundle._hourIndex = hourIndex
  bundle._dayIndex = dayIndex

  const cur = weather.current || {}
  bundle.temp = cur.temperature_2m
  bundle.feelsLike = cur.apparent_temperature
  bundle.humidity = cur.relative_humidity_2m
  bundle.wind = cur.wind_speed_10m
  bundle.windGust = cur.wind_gusts_10m
  bundle.windDir = cur.wind_direction_10m
  bundle.conditionCode = cur.weather_code
  bundle.precipitation = cur.precipitation
  bundle.cloudCover = cur.cloud_cover
  bundle.pressure = cur.pressure_msl

  if (hourIndex >= 0 && times[hourIndex]) {
    const h = hourly
    if (h.temperature_2m?.[hourIndex] != null) bundle.temp = Math.round(h.temperature_2m[hourIndex])
    if (h.apparent_temperature?.[hourIndex] != null) bundle.feelsLike = Math.round(h.apparent_temperature[hourIndex])
    if (h.relative_humidity_2m?.[hourIndex] != null) bundle.humidity = h.relative_humidity_2m[hourIndex]
    if (h.wind_speed_10m?.[hourIndex] != null) bundle.wind = h.wind_speed_10m[hourIndex]
    if (h.wind_gusts_10m?.[hourIndex] != null) bundle.windGust = h.wind_gusts_10m[hourIndex]
    if (h.wind_direction_10m?.[hourIndex] != null) bundle.windDir = h.wind_direction_10m[hourIndex]
    if (h.weather_code?.[hourIndex] != null) bundle.conditionCode = h.weather_code[hourIndex]
    if (h.precipitation?.[hourIndex] != null) bundle.precipitation = h.precipitation[hourIndex]
    if (h.precipitation_probability?.[hourIndex] != null) bundle.precipitationProb = h.precipitation_probability[hourIndex]
    if (h.cloud_cover?.[hourIndex] != null) bundle.cloudCover = h.cloud_cover[hourIndex]
    if (h.pressure_msl?.[hourIndex] != null) bundle.pressure = h.pressure_msl[hourIndex]
    if (h.visibility?.[hourIndex] != null) bundle.visibility = h.visibility[hourIndex] / 1000
    if (h.uv_index?.[hourIndex] != null) bundle.uvIndex = h.uv_index[hourIndex]
    if (h.dew_point_2m?.[hourIndex] != null) bundle.dewPoint = h.dew_point_2m[hourIndex]
    if (h.is_day?.[hourIndex] != null) bundle.isDay = h.is_day[hourIndex]
  }

  if (dayIndex >= 0 && daily.time?.[dayIndex]) {
    const d = daily
    if (d.temperature_2m_max?.[dayIndex] != null) bundle.tempMax = Math.round(d.temperature_2m_max[dayIndex])
    if (d.temperature_2m_min?.[dayIndex] != null) bundle.tempMin = Math.round(d.temperature_2m_min[dayIndex])
    if (d.apparent_temperature_max?.[dayIndex] != null) bundle.feelsMax = Math.round(d.apparent_temperature_max[dayIndex])
    if (d.apparent_temperature_min?.[dayIndex] != null) bundle.feelsMin = Math.round(d.apparent_temperature_min[dayIndex])
    if (d.weather_code?.[dayIndex] != null && bundle.conditionCode == null) {
      bundle.conditionCode = d.weather_code[dayIndex]
    }
    if (d.precipitation_sum?.[dayIndex] != null) bundle.precipitationSum = d.precipitation_sum[dayIndex]
    if (d.precipitation_probability_max?.[dayIndex] != null) bundle.precipitationProb = d.precipitation_probability_max[dayIndex]
    if (d.wind_speed_10m_max?.[dayIndex] != null) bundle.windMax = d.wind_speed_10m_max[dayIndex]
    if (d.wind_gusts_10m_max?.[dayIndex] != null) bundle.windGustMax = d.wind_gusts_10m_max[dayIndex]
    if (d.wind_direction_10m_dominant?.[dayIndex] != null) bundle.windDirDominant = d.wind_direction_10m_dominant[dayIndex]
    if (d.uv_index_max?.[dayIndex] != null) bundle.uvIndex = d.uv_index_max[dayIndex]
    if (d.sunrise?.[dayIndex]) bundle.sunrise = d.sunrise[dayIndex]
    if (d.sunset?.[dayIndex]) bundle.sunset = d.sunset[dayIndex]
    if (d.relative_humidity_2m_mean?.[dayIndex] != null) {
      bundle.humidityMean = d.relative_humidity_2m_mean[dayIndex]
    }
  }

  bundle.condition = mapWeatherCode(bundle.conditionCode)
  return bundle
}

// ─── WMO CODE MAP ──────────────────────────────────────────────────────

export function mapWeatherCode(code) {
  if (code === 0) return 'clear'
  if (code === 1) return 'mainly-clear'
  if (code === 2) return 'partly-cloudy'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 55) return 'drizzle'
  if (code === 56 || code === 57) return 'freezing-drizzle'
  if (code >= 61 && code <= 65) return 'rain'
  if (code === 66 || code === 67) return 'freezing-rain'
  if (code >= 71 && code <= 75) return 'snow'
  if (code === 77) return 'snow-grains'
  if (code >= 80 && code <= 82) return 'rain-showers'
  if (code === 85 || code === 86) return 'snow-showers'
  if (code >= 95) return 'thunderstorm'
  return 'unknown'
}

// ─── LOCATION PARSING ──────────────────────────────────────────────────

/**
 * FIXED: proper end-of-string handling for route parsing.
 */
export function parseFromTo(question) {
  if (!question) return null
  const m = question.match(
    /\bfrom\s+([A-Za-z][A-Za-z\s,'-]{1,40}?)\s+to\s+([A-Za-z][A-Za-z\s,'-]{1,40}?)(?:\s+(?:on|at|by|for|tomorrow|today|tonight|next|this|the)\b|\s*$|[\?.,])/i
  )
  if (!m) return null
  const from = cleanLocationHint(m[1])
  const to = cleanLocationHint(m[2])
  if (!from || !to) return null
  return { from, to }
}

export function parseToOnly(question) {
  if (!question) return null
  const m = question.match(
    /\bto\s+([A-Za-z][A-Za-z\s,'-]{1,40}?)(?:\s+(?:on|at|by|for|tomorrow|today|tonight|next|this|the)\b|\s*$|[\?.,])/i
  )
  if (!m) return null
  const hint = cleanLocationHint(m[1])
  if (!hint) return null
  return stripStopword(hint)
}

export function parseInLocation(question) {
  if (!question) return null
  const m = question.match(
    /\b(?:in|at|near)\s+([A-Za-z][A-Za-z\s,'-]{1,40}?)(?:\s+(?:on|at|by|for|tomorrow|today|tonight|next|this|the)\b|\s*$|[\?.,])/i
  )
  if (!m) return null
  const hint = cleanLocationHint(m[1])
  if (!hint) return null
  return stripStopword(hint)
}

/**
 * FIXED: comparison now detects unsaved locations too.
 */
export function detectComparison(question, savedLocations = []) {
  if (!question) return null
  const q = question.toLowerCase()

  const hasCompare = /\b(vs|versus|compare|or|better|best|which|difference|rather)\b/i.test(q)
  if (!hasCompare) return null

  // ─── Time comparison ─────────────────────────────────────────────
  const timeWords = [
    'today', 'tomorrow', 'yesterday',
    'morning', 'afternoon', 'evening', 'night', 'tonight',
    'weekend', 'weekday',
    ...DAY_NAMES,
  ]
  const foundTimes = timeWords.filter(w => q.includes(w))
  if (foundTimes.length >= 2) {
    return { type: 'time', time1: foundTimes[0], time2: foundTimes[1] }
  }

  // ─── Location comparison ─────────────────────────────────────────
  const foundLocations = []

  // (a) Check saved locations
  for (const loc of savedLocations || []) {
    const label = (loc.label || '').toLowerCase()
    const name = (loc.name || '').toLowerCase()
    if (!label && !name) continue
    if ((label && q.includes(label)) || (name && q.includes(name))) {
      foundLocations.push(loc.label || loc.name)
    }
  }

  // (b) "in X" / "at X" — catches unsaved locations
  const inMatches = [...q.matchAll(/\b(?:in|at)\s+([a-z][a-z\s,'-]{1,30}?)(?=\s+(?:vs|versus|or|and|,|tomorrow|today|tonight|\?)|$)/gi)]
  inMatches.forEach(m => {
    const hint = cleanLocationHint(m[1])
    if (hint && !LOCATION_STOPWORDS.has(hint.toLowerCase()) && !foundLocations.includes(hint)) {
      foundLocations.push(hint)
    }
  })

  // (c) Comma-separated list: "London, Paris and Tokyo"
  const commaListMatch = q.match(
    /\b([a-z]+(?:\s+[a-z]+)?)\s*,\s*([a-z]+(?:\s+[a-z]+)?)(?:\s*,\s*([a-z]+(?:\s+[a-z]+)?))?(?:\s*,?\s*and\s+([a-z]+(?:\s+[a-z]+)?))?/i
  )
  if (commaListMatch) {
    const parts = [commaListMatch[1], commaListMatch[2], commaListMatch[3], commaListMatch[4]]
      .filter(Boolean)
      .map(s => s.trim())
    parts.forEach(p => {
      const clean = p.split(/\s+/).slice(0, 2).join(' ')
      if (clean && !LOCATION_STOPWORDS.has(clean.toLowerCase()) && !foundLocations.includes(clean)) {
        foundLocations.push(clean)
      }
    })
  }

  // (d) "X vs Y" / "X versus Y" / "X and Y"
  const pairMatch = q.match(/\b([a-z][a-z\s,'-]{1,25}?)\s+(?:vs\.?|versus|and)\s+([a-z][a-z\s,'-]{1,25}?)(?:\s+(?:tomorrow|today|tonight|\?)|$)/i)
  if (pairMatch) {
    const a = cleanLocationHint(pairMatch[1])
    const b = cleanLocationHint(pairMatch[2])
    if (a && !LOCATION_STOPWORDS.has(a.toLowerCase()) && !foundLocations.includes(a)) foundLocations.push(a)
    if (b && !LOCATION_STOPWORDS.has(b.toLowerCase()) && !foundLocations.includes(b)) foundLocations.push(b)
  }

  const unique = [...new Set(foundLocations)]
  if (unique.length >= 2) {
    return { type: 'location', locations: unique.slice(0, 3) }
  }

  return null
}

// ─── SAVED LOCATION MATCHING ───────────────────────────────────────────

export function matchSavedLocation(hint, savedLocations = [], homeLocation = null) {
  if (!hint) return null
  const lower = hint.toLowerCase().trim()

  if (HOME_ALIASES.has(lower) && homeLocation?.lat != null) {
    return {
      lat: homeLocation.lat,
      lon: homeLocation.lon,
      label: homeLocation.label || homeLocation.name || 'Home',
      country_code: homeLocation.country_code,
      isHome: true,
    }
  }

  const all = []
  if (homeLocation?.lat != null) {
    all.push({
      lat: homeLocation.lat,
      lon: homeLocation.lon,
      label: homeLocation.label || homeLocation.name || 'Home',
      country_code: homeLocation.country_code,
      isHome: true,
    })
  }
  for (const loc of savedLocations || []) {
    all.push({
      lat: loc.lat,
      lon: loc.lon,
      label: loc.label || loc.name,
      name: loc.name,
      country_code: loc.country_code,
    })
  }

  let match = all.find(l => (l.label || '').toLowerCase() === lower)
  if (match) return match

  match = all.find(l => (l.name || '').toLowerCase() === lower)
  if (match) return match

  if (WORK_ALIASES.has(lower)) {
    match = all.find(l => {
      const lbl = (l.label || '').toLowerCase()
      const nm = (l.name || '').toLowerCase()
      return lbl.includes('work') || lbl.includes('office') ||
             nm.includes('work') || nm.includes('office')
    })
    if (match) return match
  }

  match = all.find(l => {
    const lbl = (l.label || '').toLowerCase()
    return lbl && (lbl.includes(lower) || lower.includes(lbl))
  })
  if (match) return match

  match = all.find(l => {
    const nm = (l.name || '').toLowerCase()
    return nm && (nm.includes(lower) || lower.includes(nm))
  })
  if (match) return match

  return { label: hint, needsGeocode: true }
}

// ─── GEOCODING ─────────────────────────────────────────────────────────

export async function geocodeLocation(name) {
  if (!name) return null
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const r = data?.results?.[0]
    if (!r) return null
    return {
      lat: r.latitude,
      lon: r.longitude,
      label: r.name,
      name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country || ''}`.trim(),
      country_code: r.country_code?.toUpperCase() || 'US',
      timezone: r.timezone || 'UTC',
      elevation: r.elevation ?? null,
    }
  } catch {
    return null
  }
}

export async function resolveLocation(hint, savedLocations = [], homeLocation = null) {
  if (!hint) return null
  if (typeof hint === 'object' && hint.lat != null) return hint

  const matched = matchSavedLocation(hint, savedLocations, homeLocation)
  if (!matched) return null
  if (!matched.needsGeocode) return matched

  const geocoded = await geocodeLocation(matched.label)
  return geocoded
}

// ─── ROUTE RESOLUTION ──────────────────────────────────────────────────

const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjkzZGIxMDYzZDZmOTQyOGZiZGFlMzk2OTA3ZWJkZjA4IiwiaCI6Im11cm11cjY0In0='

const MODE_TO_ORS_PROFILE = {
  car: 'driving-car',
  driving: 'driving-car',
  hgv: 'driving-hgv',
  truck: 'driving-hgv',
  walk: 'foot-walking',
  walking: 'foot-walking',
  foot: 'foot-walking',
  hike: 'foot-hiking',
  hiking: 'foot-hiking',
  cycle: 'cycling-regular',
  cycling: 'cycling-regular',
  bike: 'cycling-regular',
  bicycle: 'cycling-regular',
  roadbike: 'cycling-road',
  mtb: 'cycling-mountain',
  ebike: 'cycling-electric',
  wheelchair: 'wheelchair',
}

export function detectMode(question) {
  const q = (question || '').toLowerCase()
  if (/\b(walk|walking|on foot)\b/.test(q)) return 'walking'
  if (/\b(hike|hiking|trail)\b/.test(q)) return 'hiking'
  if (/\b(cycl|bike|bicycl|biking|mtb|road bike|ebike)\b/.test(q)) return 'cycling'
  if (/\b(truck|hgv|lorry)\b/.test(q)) return 'hgv'
  if (/\b(wheelchair|accessible)\b/.test(q)) return 'wheelchair'
  return 'car'
}

export async function fetchRoute(from, to, mode = 'car') {
  if (!from?.lat || !to?.lat) return null
  const profile = MODE_TO_ORS_PROFILE[mode] || 'driving-car'
  try {
    const url =
      `https://api.openrouteservice.org/v2/directions/${profile}?` +
      `api_key=${ORS_API_KEY}&` +
      `start=${from.lon},${from.lat}&` +
      `end=${to.lon},${to.lat}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const feature = data?.features?.[0]
    if (!feature) return null

    const segment = feature.properties?.segments?.[0] || {}
    const steps = (segment.steps || []).map(s => ({
      instruction: s.instruction,
      distance: s.distance,
      duration: s.duration,
      type: s.type,
      way_points: s.way_points,
    }))

    const coords = feature.geometry?.coordinates || []
    const waypoints = sampleWaypoints(coords, 4)

    return {
      distance: segment.distance || 0,
      duration: segment.duration || 0,
      steps,
      coordinates: coords,
      waypoints,
      mode,
    }
  } catch {
    return null
  }
}

function sampleWaypoints(coords, maxPoints = 4) {
  if (!Array.isArray(coords) || coords.length < 2) return []
  const total = coords.length
  const points = []
  const step = Math.max(1, Math.floor(total / (maxPoints + 1)))
  for (let i = step; i < total - 1; i += step) {
    const [lon, lat] = coords[i]
    points.push({ lat, lon, label: `Waypoint ${points.length + 1}` })
    if (points.length >= maxPoints) break
  }
  return points
}

// ─── MAIN RESOLVER ─────────────────────────────────────────────────────

export async function resolveWeatherContext({
  question,
  baseWeather,
  baseAqi,
  location,
  savedLocations = [],
  homeLocation = null,
}) {
  const now = new Date()
  const context = {
    question,
    location: location?.name || homeLocation?.name || null,
  }

  // ─── 1. Comparison ────────────────────────────────────────────────
  const comparison = detectComparison(question, savedLocations)
  if (comparison) {
    if (comparison.type === 'time') {
      const baseLat = location?.lat
      const baseLon = location?.lon
      if (baseLat == null) return { type: 'single', bundle: null, context }

      const weather = baseWeather || await fetchWeather(baseLat, baseLon)
      if (!weather) return { type: 'single', bundle: null, context }

      const t1 = parseTimeReference(comparison.time1, now)
      const t2 = parseTimeReference(comparison.time2, now)

      return {
        type: 'comparison',
        comparisonType: 'time',
        items: [
          { label: comparison.time1, bundle: sliceWeatherByTime(weather, t1, now) },
          { label: comparison.time2, bundle: sliceWeatherByTime(weather, t2, now) },
        ],
        context,
      }
    }
    if (comparison.type === 'location') {
      const resolved = []
      for (const hint of comparison.locations) {
        const loc = await resolveLocation(hint, savedLocations, homeLocation)
        if (loc?.lat != null) resolved.push(loc)
      }
      if (resolved.length < 2) {
        return { type: 'single', bundle: null, context }
      }
      const coords = resolved.map(r => ({ lat: r.lat, lon: r.lon }))
      const weathers = await fetchWeatherBatch(coords)
      const timeRef = parseTimeReference(question, now)
      const items = resolved.map((loc, i) => ({
        label: loc.label || loc.name,
        bundle: weathers[i] ? sliceWeatherByTime(weathers[i], timeRef, now) : null,
        location: loc,
      }))

      // Context: use the first resolved location so header isn't "Lagos"
      context.location = resolved.map(r => r.label || r.name).join(' vs ')

      return {
        type: 'comparison',
        comparisonType: 'location',
        items,
        context,
      }
    }
  }

  // ─── 2. Route ─────────────────────────────────────────────────────
  const fromTo = parseFromTo(question)
  if (fromTo) {
    const fromLoc = await resolveLocation(fromTo.from, savedLocations, homeLocation)
    const toLoc = await resolveLocation(fromTo.to, savedLocations, homeLocation)

    if (fromLoc?.lat != null && toLoc?.lat != null) {
      const mode = detectMode(question)
      const route = await fetchRoute(fromLoc, toLoc, mode)

      if (route) {
        const allPoints = [
          { ...fromLoc, role: 'from' },
          ...route.waypoints.map(wp => ({ ...wp, label: wp.label || 'Waypoint', role: 'waypoint' })),
          { ...toLoc, role: 'to' },
        ]

        const coords = allPoints.map(p => ({ lat: p.lat, lon: p.lon }))
        const weathers = await fetchWeatherBatch(coords)
        const timeRef = parseTimeReference(question, now)

        const waypoints = allPoints.map((p, i) => ({
          label: p.label || p.name || `Point ${i + 1}`,
          role: p.role || 'waypoint',
          location: p,
          weather: weathers[i] ? sliceWeatherByTime(weathers[i], timeRef, now) : null,
        }))

        const destWeather = waypoints[waypoints.length - 1]?.weather

        return {
          type: 'route',
          bundle: destWeather,
          route: {
            from: fromLoc,
            to: toLoc,
            mode,
            distance: route.distance,
            duration: route.duration,
            steps: route.steps,
          },
          waypoints,
          context,
        }
      }

      // Route fetch failed — fall back to destination weather
      const destWeather = await fetchWeather(toLoc.lat, toLoc.lon)
      const timeRef = parseTimeReference(question, now)
      return {
        type: 'single',
        bundle: destWeather ? sliceWeatherByTime(destWeather, timeRef, now) : null,
        location: toLoc,
        context,
      }
    }
  }

  // ─── 3. Single location ──────────────────────────────────────────
  const hint = parseInLocation(question) || parseToOnly(question)

  if (hint) {
    const loc = await resolveLocation(hint, savedLocations, homeLocation)
    if (loc?.lat != null) {
      const weather = await fetchWeather(loc.lat, loc.lon)
      const timeRef = parseTimeReference(question, now)
      const bundle = weather ? sliceWeatherByTime(weather, timeRef, now) : null
      if (bundle) {
        bundle.city = loc.label || loc.name
        bundle.lat = loc.lat
        bundle.lon = loc.lon
      }
      context.location = loc.label || loc.name

      return {
        type: 'single',
        bundle,
        location: loc,
        context,
      }
    }
  }

  // ─── 4. No location — current ─────────────────────────────────────
  let weather = baseWeather
  const timeRef = parseTimeReference(question, now)
  const needsForecast = timeRef.isFuture || timeRef.daysAhead > 0 || !weather?.hourly?.time?.length

  if (needsForecast && location?.lat != null) {
    weather = await fetchWeather(location.lat, location.lon) || weather
  }

  const bundle = weather ? sliceWeatherByTime(weather, timeRef, now) : null
  if (bundle) {
    bundle.city = location?.name
    bundle.lat = location?.lat
    bundle.lon = location?.lon
    bundle.savedLocations = savedLocations
    bundle.homeLat = homeLocation?.lat
    bundle.homeLon = homeLocation?.lon
    bundle.homeName = homeLocation?.name
  }

  return { type: 'single', bundle, location, context }
}

export default {
  resolveWeatherContext,
  parseTimeReference,
  sliceWeatherByTime,
  parseFromTo,
  parseToOnly,
  parseInLocation,
  detectComparison,
  matchSavedLocation,
  resolveLocation,
  geocodeLocation,
  detectMode,
  fetchRoute,
  mapWeatherCode,
}
