// ============================================================================
// WEATHER RESOLVER — The brain
//
// Takes a raw question + base context, figures out what locations and times
// the user is asking about, fetches the data, and returns clean bundle(s)
// ready to hand directly to intent/advice modules.
//
// Advice modules never fetch. They never parse. They never calculate dates.
// They just read the bundle and narrate.
//
// Returns one of:
//   { type: 'single',     bundle }                      — normal question
//   { type: 'comparison', items: [bundle, bundle, ...] } — 2-3 sides
//   { type: 'route',      bundle, waypoints }            — route + weather
//   { type: 'multi',      items: [bundle, bundle, ...] } — multi-location
// ============================================================================

import {
  fetchWeather,
  fetchWeatherBatch,
  fetchWeatherWithAqi,
} from './weatherFetcher.js'

// ─── CONSTANTS ─────────────────────────────────────────────────────────

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

// Common "home" aliases → resolve to homeLocation
const HOME_ALIASES = new Set([
  'home', 'my home', 'my place', 'my house', 'here', 'current location',
])

// Common "work" aliases → resolve to a saved location labelled work/office
const WORK_ALIASES = new Set([
  'work', 'office', 'my office', 'my work', 'workplace',
])

// ─── TEXT UTILITIES ────────────────────────────────────────────────────

function cleanLocationHint(raw) {
  if (!raw) return null
  let s = raw.trim().replace(/[,?.!]+$/, '').replace(/\s+/g, ' ')
  // Strip leading "the " for matching
  s = s.replace(/^the\s+/i, '')
  return s || null
}

function stripStopword(text) {
  return LOCATION_STOPWORDS.has(text.toLowerCase()) ? null : text
}

// ─── TIME PARSING ──────────────────────────────────────────────────────

/**
 * Parse a time reference from a question.
 * Returns { targetDate, timePhrase, hasSpecificHour, isFuture, daysAhead }
 */
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

  // ─── "in X days/hours/minutes" ─────────────────────────────────────
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

  // ─── "day after tomorrow" ──────────────────────────────────────────
  if (/\bday\s+after\s+tomorrow\b/i.test(q)) {
    result.targetDate.setDate(result.targetDate.getDate() + 2)
    result.daysAhead = 2
    result.isFuture = true
    result.timePhrase = 'day after tomorrow'
  }
  // ─── "tomorrow" ────────────────────────────────────────────────────
  else if (/\btomorrow\b/i.test(q)) {
    result.targetDate.setDate(result.targetDate.getDate() + 1)
    result.daysAhead = 1
    result.isFuture = true
    result.timePhrase = 'tomorrow'
  }
  // ─── "yesterday" ───────────────────────────────────────────────────
  else if (/\byesterday\b/i.test(q)) {
    result.targetDate.setDate(result.targetDate.getDate() - 1)
    result.daysAhead = -1
    result.timePhrase = 'yesterday'
  }
  // ─── "next <weekday>" ──────────────────────────────────────────────
  else {
    const nextDayMatch = q.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)
    if (nextDayMatch) {
      const targetDayIdx = DAY_NAMES.indexOf(nextDayMatch[1].toLowerCase())
      const currentDay = result.targetDate.getDay()
      let diff = (targetDayIdx - currentDay + 7) % 7
      if (diff === 0) diff = 7
      diff += 7 // "next" means week after this coming one
      result.targetDate.setDate(result.targetDate.getDate() + diff)
      result.daysAhead = diff
      result.isFuture = true
      result.timePhrase = nextDayMatch[0]
    }
    // ─── "this <weekday>" / "on <weekday>" ───────────────────────────
    else {
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
      }
      // ─── "next week" ──────────────────────────────────────────────
      else if (/\bnext\s+week\b/i.test(q)) {
        result.targetDate.setDate(result.targetDate.getDate() + 7)
        result.daysAhead = 7
        result.isFuture = true
        result.timePhrase = 'next week'
      }
      // ─── "this weekend" / "weekend" ───────────────────────────────
      else if (/\b(?:this\s+)?weekend\b/i.test(q)) {
        const currentDay = result.targetDate.getDay()
        const daysUntilSat = (6 - currentDay + 7) % 7 || 7
        result.targetDate.setDate(result.targetDate.getDate() + daysUntilSat)
        result.daysAhead = daysUntilSat
        result.isFuture = true
        result.timePhrase = 'this weekend'
      }
    }
  }

  // ─── Explicit hour ("at 5pm", "at 17:30") ──────────────────────────
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

  // ─── Named times of day ────────────────────────────────────────────
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

  // ─── Apply explicit hour ───────────────────────────────────────────
  if (result.hasSpecificHour) {
    result.targetDate.setHours(result.explicitHour, result.explicitMinute, 0, 0)

    // If it's already past that hour today, push to tomorrow
    if (!result.isFuture && result.targetDate.getTime() < now.getTime()) {
      result.targetDate.setDate(result.targetDate.getDate() + 1)
      result.daysAhead = 1
      result.isFuture = true
    }
  }

  // ─── If in past and not yesterday, push forward ────────────────────
  if (!result.isFuture && result.daysAhead === 0) {
    if (result.targetDate.getTime() < now.getTime() && result.hasSpecificHour) {
      result.targetDate.setDate(result.targetDate.getDate() + 1)
      result.daysAhead = 1
      result.isFuture = true
    }
  }

  return result
}

/**
 * Given a normalized weather object and a time reference, slice out the
 * exact hour/day values the user asked about.
 *
 * This is the "look up in Open-Meteo's own arrays" logic — no manual math.
 * Returns a bundle shaped like the weather object but with `temp`, `wind`,
 * `humidity`, etc. hoisted to the top level for advice modules to read.
 */
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

  // ─── Find the closest hour index ───────────────────────────────────
  let hourIndex = -1
  if (times.length > 0 && timeRef?.hasSpecificHour) {
    const targetMs = timeRef.targetDate.getTime()
    let bestDiff = Infinity
    times.forEach((t, i) => {
      const ms = new Date(t).getTime()
      const diff = Math.abs(ms - targetMs)
      if (diff < bestDiff) {
        bestDiff = diff
        hourIndex = i
      }
    })
    // Sanity: if we're more than 2 hours off, no good match
    if (bestDiff > 2 * 60 * 60 * 1000) hourIndex = -1
  }

  // ─── Find the day index ────────────────────────────────────────────
  let dayIndex = -1
  if (daily.time && daily.time.length > 0) {
    const targetDay = new Date(timeRef?.targetDate ?? now)
    targetDay.setHours(12, 0, 0, 0)
    const targetMs = targetDay.getTime()
    let bestDiff = Infinity
    daily.time.forEach((t, i) => {
      const dayMs = new Date(t).getTime() + 12 * 60 * 60 * 1000
      const diff = Math.abs(dayMs - targetMs)
      if (diff < bestDiff) {
        bestDiff = diff
        dayIndex = i
      }
    })
    // Sanity: if we're more than 30 hours off, no good match
    if (bestDiff > 30 * 60 * 60 * 1000) dayIndex = -1
  }

  // If no explicit hour, default dayIndex = daysAhead
  if (dayIndex === -1 && timeRef?.daysAhead != null && daily.time?.length > timeRef.daysAhead) {
    dayIndex = timeRef.daysAhead
  }

  bundle._hourIndex = hourIndex
  bundle._dayIndex = dayIndex

  // ─── Hoist current values (fallback) ───────────────────────────────
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

  // ─── Override with hourly if we have an hour match ─────────────────
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

  // ─── Override with daily if we only have a day match ───────────────
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

  // ─── Condition string from code ────────────────────────────────────
  bundle.condition = mapWeatherCode(bundle.conditionCode)

  return bundle
}

// ─── SIMPLE WMO MAP (inlined so resolver has no external dep) ──────────

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
 * Extract "from X to Y" from a question.
 * Returns { from, to } or null.
 */
export function parseFromTo(question) {
  if (!question) return null
  const m = question.match(
    /\bfrom\s+([A-Za-z][A-Za-z\s,'-]{1,40}?)\s+to\s+([A-Za-z][A-Za-z\s,'-]{1,40}?)(?:\s+(?:on|at|by|for|tomorrow|today|tonight|next|this|the|\?|,|$))/i
  )
  if (!m) return null
  const from = cleanLocationHint(m[1])
  const to = cleanLocationHint(m[2])
  if (!from || !to) return null
  return { from, to }
}

/**
 * Extract "to X" (destination-only).
 */
export function parseToOnly(question) {
  if (!question) return null
  const m = question.match(
    /\bto\s+([A-Za-z][A-Za-z\s,'-]{1,40}?)(?:\s+(?:on|at|by|for|tomorrow|today|tonight|next|this|the|\?|,|$))/i
  )
  if (!m) return null
  const hint = cleanLocationHint(m[1])
  if (!hint) return null
  return stripStopword(hint)
}

/**
 * Extract "in X" / "at X" location hint.
 */
export function parseInLocation(question) {
  if (!question) return null
  const m = question.match(
    /\b(?:in|at|near)\s+([A-Za-z][A-Za-z\s,'-]{1,40}?)(?:\s+(?:on|at|by|for|tomorrow|today|tonight|next|this|the|\?|,|$))/i
  )
  if (!m) return null
  const hint = cleanLocationHint(m[1])
  if (!hint) return null
  return stripStopword(hint)
}

/**
 * Detect a comparison question.
 * Returns { type, time1, time2 } | { type, locations: [...] } | null
 */
export function detectComparison(question, savedLocations = []) {
  if (!question) return null
  const q = question.toLowerCase()

  // Must contain a comparison trigger
  const hasCompare = /\b(vs|versus|compare|or|better|best|which|difference|rather)\b/i.test(q)
  if (!hasCompare) return null

  // ─── Time comparison ───────────────────────────────────────────────
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

  // ─── Location comparison ───────────────────────────────────────────
  const foundLocations = []
  for (const loc of savedLocations || []) {
    const label = (loc.label || '').toLowerCase()
    const name = (loc.name || '').toLowerCase()
    if (!label && !name) continue
    if ((label && q.includes(label)) || (name && q.includes(name))) {
      foundLocations.push(loc.label || loc.name)
    }
  }
  // Also catch "in X vs in Y" pattern
  const inMatches = [...q.matchAll(/\bin\s+([a-z][a-z\s,'-]{1,30}?)(?=\s+(?:vs|versus|or|,)|$)/gi)]
  inMatches.forEach(m => {
    const hint = cleanLocationHint(m[1])
    if (hint && !LOCATION_STOPWORDS.has(hint.toLowerCase())) {
      foundLocations.push(hint)
    }
  })
  const unique = [...new Set(foundLocations)]
  if (unique.length >= 2) {
    return { type: 'location', locations: unique.slice(0, 3) }
  }

  return null
}

// ─── SAVED LOCATION MATCHING ───────────────────────────────────────────

/**
 * Match a hint against saved locations + home.
 * Returns { lat, lon, label, country_code } or { label, needsGeocode: true }
 * or null.
 */
export function matchSavedLocation(hint, savedLocations = [], homeLocation = null) {
  if (!hint) return null
  const lower = hint.toLowerCase().trim()

  // ─── Home aliases → homeLocation ───────────────────────────────────
  if (HOME_ALIASES.has(lower) && homeLocation?.lat != null) {
    return {
      lat: homeLocation.lat,
      lon: homeLocation.lon,
      label: homeLocation.label || homeLocation.name || 'Home',
      country_code: homeLocation.country_code,
      isHome: true,
    }
  }

  // ─── Direct saved-location match ───────────────────────────────────
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

  // Exact label match
  let match = all.find(l => (l.label || '').toLowerCase() === lower)
  if (match) return match

  // Exact name match
  match = all.find(l => (l.name || '').toLowerCase() === lower)
  if (match) return match

  // Work aliases → saved location labelled work/office
  if (WORK_ALIASES.has(lower)) {
    match = all.find(l => {
      const lbl = (l.label || '').toLowerCase()
      const nm = (l.name || '').toLowerCase()
      return lbl.includes('work') || lbl.includes('office') ||
             nm.includes('work') || nm.includes('office')
    })
    if (match) return match
  }

  // Partial label match
  match = all.find(l => {
    const lbl = (l.label || '').toLowerCase()
    return lbl && (lbl.includes(lower) || lower.includes(lbl))
  })
  if (match) return match

  // Partial name match
  match = all.find(l => {
    const nm = (l.name || '').toLowerCase()
    return nm && (nm.includes(lower) || lower.includes(nm))
  })
  if (match) return match

  // No saved match → needs geocode
  return { label: hint, needsGeocode: true }
}

// ─── GEOCODING ─────────────────────────────────────────────────────────

/**
 * Geocode a place name via Open-Meteo geocoding API.
 * Result cached for 24h via weatherCache (kind = 'geocode').
 */
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

/**
 * Full resolve: try saved match, else geocode.
 * Returns a fully-resolved location object or null.
 */
export async function resolveLocation(hint, savedLocations = [], homeLocation = null) {
  if (!hint) return null

  // If hint is already a resolved object (e.g. from UI dropdown), pass through
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

/**
 * Detect transport mode from a question. Default 'car'.
 */
export function detectMode(question) {
  const q = (question || '').toLowerCase()
  if (/\b(walk|walking|on foot)\b/.test(q)) return 'walking'
  if (/\b(hike|hiking|trail)\b/.test(q)) return 'hiking'
  if (/\b(cycl|bike|bicycl|biking|mtb|road bike|ebike)\b/.test(q)) return 'cycling'
  if (/\b(truck|hgv|lorry)\b/.test(q)) return 'hgv'
  if (/\b(wheelchair|accessible)\b/.test(q)) return 'wheelchair'
  return 'car'
}

/**
 * Fetch a route via OpenRouteService.
 * Returns { distance, duration, steps, coordinates } or null.
 */
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

    // Sample waypoints from the route geometry for weather along the way
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

/**
 * Sample N evenly-spaced points from a route's coordinate list.
 * Skips start and end (they're added separately).
 */
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

/**
 * The main entry point. Given a question and base context, returns
 * clean bundle(s) ready for intent modules.
 *
 * @param {Object} params
 * @param {string} params.question — the raw user question (already in English)
 * @param {Object} params.baseWeather — current weather at user's location (for fallback)
 * @param {Object} params.location — user's current location
 * @param {Array}  params.savedLocations — user's saved places
 * @param {Object} params.homeLocation — auto-created home
 * @param {Object} [params.baseAqi] — current AQI at user's location
 * @returns {Promise<Object>} — { type, bundle(s), context }
 */
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

  // ─── 1. Comparison? ────────────────────────────────────────────────
  const comparison = detectComparison(question, savedLocations)
  if (comparison) {
    if (comparison.type === 'time') {
      // Same location, two different times
      const baseLat = location?.lat
      const baseLon = location?.lon
      if (baseLat == null) {
        return { type: 'single', bundle: null, context }
      }
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
      // Resolve each location, then batch-fetch
      const resolved = []
      for (const hint of comparison.locations) {
        const loc = await resolveLocation(hint, savedLocations, homeLocation)
        if (loc?.lat != null) resolved.push(loc)
      }
      if (resolved.length < 2) {
        return { type: 'single', bundle: null, context }
      }
      const weathers = await fetchWeatherBatch(resolved)
      const timeRef = parseTimeReference(question, now)
      const items = resolved.map((loc, i) => ({
        label: loc.label || loc.name,
        bundle: weathers[i] ? sliceWeatherByTime(weathers[i], timeRef, now) : null,
        location: loc,
      }))
      return {
        type: 'comparison',
        comparisonType: 'location',
        items,
        context,
      }
    }
  }

  // ─── 2. Route? ─────────────────────────────────────────────────────
  const fromTo = parseFromTo(question)
  if (fromTo) {
    const fromLoc = await resolveLocation(fromTo.from, savedLocations, homeLocation)
    const toLoc = await resolveLocation(fromTo.to, savedLocations, homeLocation)
    if (fromLoc?.lat != null && toLoc?.lat != null) {
      const mode = detectMode(question)
      const route = await fetchRoute(fromLoc, toLoc, mode)
      if (route) {
        // Build waypoint list: from + samples + to
        const allPoints = [
          { ...fromLoc, role: 'from' },
          ...route.waypoints,
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

        // Primary bundle = destination weather (for the main advice)
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
      // Route fetch failed — fall back to single weather at destination
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

  // ─── 3. Single location? ───────────────────────────────────────────
  // Try "to X", "in X", "at X"
  const hint = parseInLocation(question) || parseToOnly(question)

  if (hint) {
    const loc = await resolveLocation(hint, savedLocations, homeLocation)
    if (loc?.lat != null) {
      const weather = await fetchWeather(loc.lat, loc.lon)
      const timeRef = parseTimeReference(question, now)
      const bundle = weather ? sliceWeatherByTime(weather, timeRef, now) : null
      if (bundle) bundle.city = loc.label || loc.name
      if (bundle) bundle.lat = loc.lat
      if (bundle) bundle.lon = loc.lon
      return {
        type: 'single',
        bundle,
        location: loc,
        context,
      }
    }
  }

  // ─── 4. No location — use current ──────────────────────────────────
  let weather = baseWeather
  const timeRef = parseTimeReference(question, now)

  // If time reference is beyond today and we don't have full forecast, refetch
  const needsForecast =
    timeRef.isFuture ||
    timeRef.daysAhead > 0 ||
    !weather?.hourly?.time?.length

  if (needsForecast && location?.lat != null) {
    weather = await fetchWeather(location.lat, location.lon) || weather
  }

  const bundle = weather
    ? sliceWeatherByTime(weather, timeRef, now)
    : null

  if (bundle) {
    bundle.city = location?.name
    bundle.lat = location?.lat
    bundle.lon = location?.lon
    bundle.savedLocations = savedLocations
    bundle.homeLat = homeLocation?.lat
    bundle.homeLon = homeLocation?.lon
    bundle.homeName = homeLocation?.name
  }

  return {
    type: 'single',
    bundle,
    location,
    context,
  }
}

// ─── DEFAULT EXPORT ────────────────────────────────────────────────────

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
