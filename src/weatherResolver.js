// ============================================================================
// WEATHER RESOLVER — The brain
// ============================================================================

import {
  fetchWeather,
  fetchWeatherBatch,
} from './weatherFetcher.js'
import { reverseGeocodeBatch } from './reverseGeocode.js'
import {
  createRouteContext,
  createLocationContext,
  createComparisonContext,
  CONTEXT_TYPES,
} from './chatContext.js'

const DAY_NAMES = [
  'sunday', 'monday', 'tuesday', 'wednesday',
  'thursday', 'friday', 'saturday',
]

const LOCATION_STOPWORDS = new Set([
  'the', 'a', 'an', 'my', 'your', 'his', 'her', 'our', 'their',
  'this', 'that', 'these', 'those', 'here', 'there',
  'morning', 'afternoon', 'evening', 'night', 'tonight',
  'today', 'tomorrow', 'yesterday', 'weekend', 'weekday',
  'now', 'later', 'soon', 'outside', 'compare', 'versus', 'vs',
  'weather', 'forecast', 'temperature', 'check', 'show', 'tell',
  'give', 'what', 'how', 'is', 'will', 'be', 'and', 'or', 'in',
  'at', 'on', 'for', 'to', 'from', 'of', 'about',
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

function isPlausibleLocation(text) {
  if (!text) return false
  const t = text.toLowerCase().trim()
  if (t.length < 2 || t.length > 40) return false
  if (LOCATION_STOPWORDS.has(t)) return false
  const firstWord = t.split(/\s+/)[0]
  if (LOCATION_STOPWORDS.has(firstWord)) return false
  if (/^(compare|check|show|tell|give|weather|forecast|what|how|when|where|is|are|will|can|should)\b/.test(t)) return false
  if (t.split(/\s+/).length > 3) return false
  return true
}

// ─── HOUR LABEL HELPER ──────────────────────────────────────────────────

function formatHourLabel(hour24, minute = 0) {
  const h12 = hour24 % 12 || 12
  const ampm = hour24 >= 12 ? 'pm' : 'am'
  const minStr = minute > 0 ? `:${String(minute).padStart(2, '0')}` : ''
  return `${h12}${minStr}${ampm}`
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
    hasExplicitTime: false,
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
    result.hasExplicitTime = true
  }

  if (/\bday\s+after\s+tomorrow\b/i.test(q)) {
    result.targetDate.setDate(result.targetDate.getDate() + 2)
    result.daysAhead = 2
    result.isFuture = true
    result.timePhrase = 'day after tomorrow'
    result.hasExplicitTime = true
  } else if (/\btomorrow\b/i.test(q)) {
    result.targetDate.setDate(result.targetDate.getDate() + 1)
    result.daysAhead = 1
    result.isFuture = true
    result.timePhrase = 'tomorrow'
    result.hasExplicitTime = true
  } else if (/\byesterday\b/i.test(q)) {
    result.targetDate.setDate(result.targetDate.getDate() - 1)
    result.daysAhead = -1
    result.timePhrase = 'yesterday'
    result.hasExplicitTime = true
  } else if (/\btoday\b/i.test(q)) {
    result.timePhrase = 'today'
    result.hasExplicitTime = true
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
      result.hasExplicitTime = true
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
        result.hasExplicitTime = true
      } else if (/\bnext\s+week\b/i.test(q)) {
        result.targetDate.setDate(result.targetDate.getDate() + 7)
        result.daysAhead = 7
        result.isFuture = true
        result.timePhrase = 'next week'
        result.hasExplicitTime = true
      } else if (/\b(?:this\s+)?weekend\b/i.test(q)) {
        const currentDay = result.targetDate.getDay()
        const daysUntilSat = (6 - currentDay + 7) % 7 || 7
        result.targetDate.setDate(result.targetDate.getDate() + daysUntilSat)
        result.daysAhead = daysUntilSat
        result.isFuture = true
        result.timePhrase = 'this weekend'
        result.hasExplicitTime = true
      }
    }
  }

  // Explicit "at 5pm" form
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
      result.hasExplicitTime = true
    }
  }

  // Loose "7pm" without "at"
  if (!result.hasSpecificHour) {
    const looseHourMatch = q.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i)
    if (looseHourMatch) {
      let hour = parseInt(looseHourMatch[1], 10)
      const minute = parseInt(looseHourMatch[2], 10) || 0
      const ampm = looseHourMatch[3]?.toLowerCase()
      if (ampm === 'pm' && hour < 12) hour += 12
      if (ampm === 'am' && hour === 12) hour = 0
      if (hour >= 0 && hour <= 23) {
        result.explicitHour = hour
        result.explicitMinute = minute
        result.hasSpecificHour = true
        result.hasExplicitTime = true
        if (!result.timePhrase) {
          result.timePhrase = formatHourLabel(hour, minute)
        }
      }
    }
  }

  if (!result.hasSpecificHour) {
    if (/\b(?:morning|sunrise|dawn)\b/i.test(q)) {
      result.explicitHour = 8
      result.hasSpecificHour = true
      result.hasExplicitTime = true
      if (!result.timePhrase) result.timePhrase = 'morning'
    } else if (/\b(?:afternoon|noon|midday|lunch)\b/i.test(q)) {
      result.explicitHour = 14
      result.hasSpecificHour = true
      result.hasExplicitTime = true
      if (!result.timePhrase) result.timePhrase = 'afternoon'
    } else if (/\b(?:evening|sunset|dusk)\b/i.test(q)) {
      result.explicitHour = 19
      result.hasSpecificHour = true
      result.hasExplicitTime = true
      if (!result.timePhrase) result.timePhrase = 'evening'
    } else if (/\b(?:night|tonight|midnight)\b/i.test(q)) {
      result.explicitHour = 22
      result.hasSpecificHour = true
      result.hasExplicitTime = true
      if (!result.timePhrase) result.timePhrase = 'night'
    }
  }

  // Combine "tomorrow" + "5pm" into "tomorrow 5pm"
  if (result.hasSpecificHour && result.timePhrase && !/\d/.test(result.timePhrase)) {
    result.timePhrase = `${result.timePhrase} ${formatHourLabel(result.explicitHour, result.explicitMinute)}`
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

// ─── TIME SLICING ───────────────────────────────────────────────────────

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

  const cur = weather.current || {}
  const legacy = weather.current_weather || {}

  const hourlyCode = hourly.weather_code || hourly.weathercode || []
  const dailyCode = daily.weather_code || daily.weathercode || []

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

  const h0 = (key) => hourly?.[key]?.[0]
  const d0 = (key) => daily?.[key]?.[0]

  bundle.temp = cur.temperature_2m ?? legacy.temperature ?? h0('temperature_2m') ?? null
  bundle.feelsLike = cur.apparent_temperature ?? cur.temperature_2m ?? legacy.temperature ?? h0('apparent_temperature') ?? h0('temperature_2m') ?? bundle.temp
  bundle.humidity = cur.relative_humidity_2m ?? h0('relative_humidity_2m') ?? 50
  bundle.wind = cur.wind_speed_10m ?? legacy.windspeed ?? h0('wind_speed_10m') ?? 0
  bundle.windDir = cur.wind_direction_10m ?? legacy.winddirection ?? h0('wind_direction_10m') ?? 0
  bundle.windGust = cur.wind_gusts_10m ?? h0('wind_gusts_10m') ?? 0
  bundle.conditionCode = cur.weather_code ?? legacy.weathercode ?? h0('weather_code') ?? hourlyCode[0] ?? d0('weather_code') ?? dailyCode[0] ?? 0
  bundle.precipitation = cur.precipitation ?? h0('precipitation') ?? 0
  bundle.precipitationProb = h0('precipitation_probability') ?? d0('precipitation_probability_max') ?? 0
  bundle.cloudCover = cur.cloud_cover ?? h0('cloud_cover') ?? 0
  bundle.pressure = cur.pressure_msl ?? h0('pressure_msl') ?? null
  bundle.visibility = h0('visibility') != null ? h0('visibility') / 1000 : 10
  bundle.uvIndex = h0('uv_index') ?? d0('uv_index_max') ?? 0
  bundle.dewPoint = h0('dew_point_2m') ?? null

  if (hourIndex >= 0 && times[hourIndex]) {
    const h = hourly
    const codeArr = hourlyCode
    if (h.temperature_2m?.[hourIndex] != null) bundle.temp = Math.round(h.temperature_2m[hourIndex])
    if (h.apparent_temperature?.[hourIndex] != null) bundle.feelsLike = Math.round(h.apparent_temperature[hourIndex])
    if (h.relative_humidity_2m?.[hourIndex] != null) bundle.humidity = h.relative_humidity_2m[hourIndex]
    if (h.wind_speed_10m?.[hourIndex] != null) bundle.wind = h.wind_speed_10m[hourIndex]
    if (h.wind_gusts_10m?.[hourIndex] != null) bundle.windGust = h.wind_gusts_10m[hourIndex]
    if (h.wind_direction_10m?.[hourIndex] != null) bundle.windDir = h.wind_direction_10m[hourIndex]
    if (codeArr[hourIndex] != null) bundle.conditionCode = codeArr[hourIndex]
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
    const codeArr = dailyCode
    if (d.temperature_2m_max?.[dayIndex] != null) bundle.tempMax = Math.round(d.temperature_2m_max[dayIndex])
    if (d.temperature_2m_min?.[dayIndex] != null) bundle.tempMin = Math.round(d.temperature_2m_min[dayIndex])
    if (d.apparent_temperature_max?.[dayIndex] != null) bundle.feelsMax = Math.round(d.apparent_temperature_max[dayIndex])
    if (d.apparent_temperature_min?.[dayIndex] != null) bundle.feelsMin = Math.round(d.apparent_temperature_min[dayIndex])
    if (codeArr[dayIndex] != null && bundle.conditionCode == null) {
      bundle.conditionCode = codeArr[dayIndex]
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

  // ─── Day-only questions: use daily max as representative temp ──
  // Fixes "today vs tomorrow" showing identical values.
  if (hourIndex === -1 && dayIndex >= 0 && bundle.tempMax != null) {
    bundle.temp = bundle.tempMax
    if (bundle.feelsMax != null) bundle.feelsLike = bundle.feelsMax
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

// ─── COMPARISON DETECTION ──────────────────────────────────────────────

export function detectComparison(question, savedLocations = []) {
  if (!question) return null
  const q = question.toLowerCase().trim()

  const hasCompare = /\b(vs|versus|compare|or|better|best|which|difference|rather)\b/i.test(q)
  if (!hasCompare) return null

  const timeWords = ['today', 'tomorrow', 'yesterday', 'morning', 'afternoon', 'evening', 'night', 'tonight']
  const foundTimes = timeWords.filter(w => q.includes(w))
  if (foundTimes.length >= 2) {
    return { type: 'time', time1: foundTimes[0], time2: foundTimes[1] }
  }

  const foundLocations = []

  for (const loc of savedLocations || []) {
    const label = (loc.label || '').toLowerCase()
    const name = (loc.name || '').toLowerCase()
    if (!label && !name) continue
    if ((label && q.includes(label)) || (name && q.includes(name))) {
      foundLocations.push(loc.label || loc.name)
    }
  }

  const cleaned = q
    .replace(/\b(compare|versus|vs\.?|better|best|which|difference|rather)\b/gi, ' ')
    .replace(/\b(weather|forecast|temperature|conditions?)\b/gi, ' ')
    .replace(/\b(today|tomorrow|tonight|yesterday|this|next)\b/gi, ' ')
    .replace(/\b(morning|afternoon|evening|night)\b/gi, ' ')
    .replace(/[?!.]/g, ' ')

  const segments = cleaned
    .split(/\s*,\s*|\s+and\s+|\s+or\s+/i)
    .map(s => s.trim())
    .filter(Boolean)

  segments.forEach(seg => {
    const stripped = seg.replace(/^\s*(?:in|at|near)\s+/i, '').trim()
    if (isPlausibleLocation(stripped) && !foundLocations.includes(stripped)) {
      const normalized = stripped
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
      if (!foundLocations.includes(normalized)) {
        foundLocations.push(normalized)
      }
    }
  })

  if (foundLocations.length < 2) {
    const vsMatch = q.match(/([a-z][a-z\s]{1,25}?)\s+(?:vs\.?|versus)\s+([a-z][a-z\s]{1,25}?)(?:\s+(?:tomorrow|today|tonight|\?)|$)/i)
    if (vsMatch) {
      const a = cleanLocationHint(vsMatch[1])
      const b = cleanLocationHint(vsMatch[2])
      if (a && isPlausibleLocation(a) && !foundLocations.includes(a)) foundLocations.push(a)
      if (b && isPlausibleLocation(b) && !foundLocations.includes(b)) foundLocations.push(b)
    }
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
  car: 'driving-car', driving: 'driving-car',
  hgv: 'driving-hgv', truck: 'driving-hgv',
  walk: 'foot-walking', walking: 'foot-walking', foot: 'foot-walking',
  hike: 'foot-hiking', hiking: 'foot-hiking',
  cycle: 'cycling-regular', cycling: 'cycling-regular',
  bike: 'cycling-regular', bicycle: 'cycling-regular',
  roadbike: 'cycling-road', mtb: 'cycling-mountain', ebike: 'cycling-electric',
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

export function detectModes(question) {
  const q = (question || '').toLowerCase()
  const modes = new Set()

  if (/\b(walk|walking|on foot)\b/.test(q)) modes.add('walking')
  if (/\b(hike|hiking|trail)\b/.test(q)) modes.add('hiking')
  if (/\b(cycl|bike|bicycl|biking|mtb|road bike|ebike)\b/.test(q)) modes.add('cycling')
  if (/\b(truck|hgv|lorry)\b/.test(q)) modes.add('hgv')
  if (/\b(wheelchair|accessible)\b/.test(q)) modes.add('wheelchair')
  if (/\b(drive|driving|car|auto|vehicle)\b/.test(q)) modes.add('car')

  if (modes.size === 0) return [detectMode(question)]
  return [...modes]
}

function sampleWaypoints(coords, steps = [], maxPoints = 5) {
  if (!Array.isArray(coords) || coords.length < 2) return []

  if (Array.isArray(steps) && steps.length > 0) {
    const candidates = []

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const wp = step?.way_points
      if (!Array.isArray(wp) || wp.length < 2) continue

      const endIdx = wp[1]
      if (endIdx <= 0 || endIdx >= coords.length - 1) continue

      const [lon, lat] = coords[endIdx]
      const name = (step.name || '').trim()

      const distance = step.distance || 0
      if (distance < 200 && candidates.length > 0) continue

      candidates.push({
        lat,
        lon,
        fallbackLabel: name || `Point ${candidates.length + 1}`,
        stepName: name || null,
        distance,
      })
    }

    if (candidates.length > maxPoints) {
      const stepSize = Math.floor(candidates.length / maxPoints)
      const trimmed = []
      for (let i = 0; i < candidates.length && trimmed.length < maxPoints; i += stepSize) {
        trimmed.push(candidates[i])
      }
      return trimmed
    }

    if (candidates.length > 0) return candidates
  }

  const total = coords.length
  const points = []
  const stepSize = Math.max(1, Math.floor(total / (maxPoints + 1)))
  for (let i = stepSize; i < total - 1; i += stepSize) {
    const [lon, lat] = coords[i]
    points.push({
      lat,
      lon,
      fallbackLabel: `Point ${points.length + 1}`,
      stepName: null,
      distance: 0,
    })
    if (points.length >= maxPoints) break
  }
  return points
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
      name: s.name,
      way_points: s.way_points,
    }))

    const coords = feature.geometry?.coordinates || []
    const waypoints = sampleWaypoints(coords, steps, 5)

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

// ─── CONTEXT HELPERS ───────────────────────────────────────────────────

function buildNewContext(resolverOut, question) {
  if (!resolverOut) return null

  if (resolverOut.type === 'route' && resolverOut.route) {
    return createRouteContext({
      from: resolverOut.route.from,
      to: resolverOut.route.to,
      mode: resolverOut.route.mode,
      question,
    })
  }

  if (resolverOut.type === 'route_comparison' && resolverOut.legs?.length > 0) {
    const firstLeg = resolverOut.legs[0]
    return createRouteContext({
      from: firstLeg.route.from,
      to: firstLeg.route.to,
      mode: firstLeg.mode,
      question,
    })
  }

  if (resolverOut.type === 'comparison' && resolverOut.items) {
    const items = resolverOut.items.map(it => ({
      label: it.label,
      location: it.location,
    }))
    return createComparisonContext({
      comparisonType: resolverOut.comparisonType,
      items,
      timeLabel: resolverOut._timeLabel || null,
      targetDate: resolverOut._targetDate || null,
      question,
    })
  }

  if (resolverOut.type === 'single' && resolverOut.location) {
    return createLocationContext({
      location: resolverOut.location,
      targetDate: resolverOut.bundle?._targetDate,
      timeLabel: resolverOut.bundle?._timeLabel,
      question,
    })
  }

  return null
}

function applyContext(context, question, now) {
  const hints = {
    routeFrom: null,
    routeTo: null,
    location: null,
    targetDate: null,
    timeLabel: null,
    mode: null,
  }

  if (!context?.payload) return hints

  const hasExplicitRoute = !!parseFromTo(question)
  const hasExplicitLocation = !!(parseInLocation(question) || parseToOnly(question))
  const timeRef = parseTimeReference(question, now)
  const hasExplicitTime = timeRef.hasExplicitTime

  if (context.type === CONTEXT_TYPES.ROUTE) {
    if (!hasExplicitRoute && !hasExplicitLocation) {
      hints.routeFrom = context.payload.from
      hints.routeTo = context.payload.to
    }
    if (!hasExplicitTime && context.payload.targetDate) {
      hints.targetDate = context.payload.targetDate
      hints.timeLabel = context.payload.timeLabel
    }
    if (!question.toLowerCase().match(/\b(walk|drive|cycl|bike|hike|truck|wheelchair|foot)\b/)) {
      hints.mode = context.payload.mode
    }
  }

  if (context.type === CONTEXT_TYPES.LOCATION) {
    if (!hasExplicitLocation && !hasExplicitRoute) {
      hints.location = context.payload.location
    }
    if (!hasExplicitTime && context.payload.targetDate) {
      hints.targetDate = context.payload.targetDate
      hints.timeLabel = context.payload.timeLabel
    }
  }

  // ─── COMPARISON: match a side by name (fixes "what about tokyo") ───
  if (context.type === CONTEXT_TYPES.COMPARISON) {
    const q = question.toLowerCase()
    for (const item of context.payload.items || []) {
      const label = (item.label || '').toLowerCase()
      if (label && q.includes(label) && item.location?.lat != null) {
        hints.location = item.location
        break
      }
    }
    if (!hasExplicitTime && context.payload.targetDate) {
      hints.targetDate = context.payload.targetDate
      hints.timeLabel = context.payload.timeLabel
    }
  }

  return hints
}

// ─── COLLAPSE WAYPOINTS TO JOURNEY BUNDLE ──────────────────────────────

export function collapseWaypointsToBundle(waypoints, baseBundle) {
  if (!Array.isArray(waypoints) || waypoints.length === 0) {
    return baseBundle || null
  }

  const weathers = waypoints.map(w => w.weather).filter(Boolean)
  if (weathers.length === 0) return baseBundle || null
  if (weathers.length === 1) return weathers[0]

  const nums = (key) => weathers.map(w => w[key]).filter(v => v != null && !isNaN(v))
  const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null

  const temps = nums('temp')
  const feels = nums('feelsLike')
  const hums = nums('humidity')
  const winds = nums('wind')
  const gusts = nums('windGust')
  const rains = nums('precipitationProb')
  const precs = nums('precipitation')
  const vis = nums('visibility')
  const uvs = nums('uvIndex')
  const aqis = nums('aqi')
  const dews = nums('dewPoint')
  const pressures = nums('pressure')

  const conditionRank = (w) => {
    const c = w.conditionCode ?? 0
    if (c >= 95) return 100
    if (c >= 85 && c <= 86) return 90
    if (c >= 71 && c <= 77) return 85
    if (c === 65 || c === 82) return 80
    if (c >= 61 && c <= 67) return 70
    if (c === 80 || c === 81) return 65
    if (c >= 51 && c <= 57) return 50
    if (c === 45 || c === 48) return 40
    if (c === 3) return 20
    if (c === 2) return 15
    if (c === 1) return 10
    return 0
  }

  const worst = weathers.reduce((a, b) =>
    conditionRank(b) > conditionRank(a) ? b : a
  , weathers[0])

  return {
    temp: avg(temps) ?? baseBundle?.temp ?? null,
    feelsLike: avg(feels) ?? baseBundle?.feelsLike ?? null,
    humidity: avg(hums) ?? baseBundle?.humidity ?? null,
    wind: avg(winds) ?? baseBundle?.wind ?? null,
    dewPoint: avg(dews) ?? baseBundle?.dewPoint ?? null,
    pressure: avg(pressures) ?? baseBundle?.pressure ?? null,

    tempMin: temps.length ? Math.round(Math.min(...temps)) : baseBundle?.tempMin ?? null,
    tempMax: temps.length ? Math.round(Math.max(...temps)) : baseBundle?.tempMax ?? null,
    windGust: gusts.length ? Math.round(Math.max(...gusts)) : baseBundle?.windGust ?? null,
    windMax: winds.length ? Math.round(Math.max(...winds)) : null,
    precipitationProb: rains.length ? Math.round(Math.max(...rains)) : baseBundle?.precipitationProb ?? null,
    precipitation: precs.length ? Math.round(Math.max(...precs) * 10) / 10 : baseBundle?.precipitation ?? 0,
    visibility: vis.length ? Math.round(Math.min(...vis) * 10) / 10 : baseBundle?.visibility ?? null,
    uvIndex: uvs.length ? Math.round(Math.max(...uvs)) : baseBundle?.uvIndex ?? null,
    aqi: aqis.length ? Math.round(Math.max(...aqis)) : baseBundle?.aqi ?? null,

    condition: worst.condition || baseBundle?.condition || 'unknown',
    conditionCode: worst.conditionCode ?? baseBundle?.conditionCode ?? 0,

    city: baseBundle?.city ?? worst.city ?? null,
    lat: baseBundle?.lat ?? worst.lat ?? null,
    lon: baseBundle?.lon ?? worst.lon ?? null,

    hourly: baseBundle?.hourly || {},
    daily: baseBundle?.daily || {},
    sunrise: baseBundle?.sunrise,
    sunset: baseBundle?.sunset,

    _journeyWaypoints: waypoints.map(w => ({
      label: w.label || 'Point',
      temp: w.weather?.temp,
      condition: w.weather?.condition,
      conditionCode: w.weather?.conditionCode,
      precipitationProb: w.weather?.precipitationProb,
      wind: w.weather?.wind,
    })),
  }
}

// ─── ROUTE LEG BUILDER ─────────────────────────────────────────────────

async function buildRouteLeg(fromLoc, toLoc, mode, timeRef, now) {
  const route = await fetchRoute(fromLoc, toLoc, mode)
  if (!route) return null

  const rawPoints = [
    { ...fromLoc, role: 'from', fallbackLabel: fromLoc.label || fromLoc.name || 'Origin' },
    ...route.waypoints.map((wp, i) => ({
      ...wp,
      role: 'waypoint',
      fallbackLabel: wp.fallbackLabel || wp.label || `Point ${i + 1}`,
    })),
    { ...toLoc, role: 'to', fallbackLabel: toLoc.label || toLoc.name || 'Destination' },
  ]

  const geocodable = rawPoints.filter(p => p.role === 'waypoint')
  const geocoded = geocodable.length > 0
    ? await reverseGeocodeBatch(geocodable.map(p => ({
        lat: p.lat,
        lon: p.lon,
        fallbackLabel: p.fallbackLabel,
      })))
    : []

  let gIdx = 0
  const allPoints = rawPoints.map(p => {
    if (p.role === 'waypoint') {
      const g = geocoded[gIdx++]
      const short = g?.short || p.fallbackLabel
      const medium = g?.medium || short
      const full = g?.full || medium
      return { ...p, label: short, labelMedium: medium, labelFull: full }
    }
    return {
      ...p,
      label: p.fallbackLabel,
      labelMedium: p.fallbackLabel,
      labelFull: p.fallbackLabel,
    }
  })

  const coords = allPoints.map(p => ({ lat: p.lat, lon: p.lon }))
  const weathers = await fetchWeatherBatch(coords)

  const waypoints = allPoints.map((p, i) => ({
    label: p.label,
    labelMedium: p.labelMedium,
    labelFull: p.labelFull,
    role: p.role,
    location: p,
    weather: weathers[i] ? sliceWeatherByTime(weathers[i], timeRef, now) : null,
  }))

  return {
    mode,
    route: {
      from: fromLoc,
      to: toLoc,
      mode,
      distance: route.distance,
      duration: route.duration,
      steps: route.steps,
    },
    waypoints,
  }
}

// ─── MAIN RESOLVER ─────────────────────────────────────────────────────

export async function resolveWeatherContext({
  question,
  baseWeather,
  baseAqi,
  location,
  savedLocations = [],
  homeLocation = null,
  context = null,
}) {
  const now = new Date()
  const contextMeta = {
    question,
    location: location?.name || homeLocation?.name || null,
  }

  const hints = applyContext(context, question, now)

  // ─── 1. Comparison ────────────────────────────────────────────────
  const comparison = detectComparison(question, savedLocations)
  if (comparison) {
    if (comparison.type === 'time') {
      const baseLat = location?.lat
      const baseLon = location?.lon
      if (baseLat == null) return { type: 'single', bundle: null, context: contextMeta, newContext: null }

      const weather = baseWeather || await fetchWeather(baseLat, baseLon)
      if (!weather) return { type: 'single', bundle: null, context: contextMeta, newContext: null }

      const t1 = parseTimeReference(comparison.time1, now)
      const t2 = parseTimeReference(comparison.time2, now)

      const out = {
        type: 'comparison',
        comparisonType: 'time',
        items: [
          { label: comparison.time1, bundle: sliceWeatherByTime(weather, t1, now), timeLabel: t1.timePhrase },
          { label: comparison.time2, bundle: sliceWeatherByTime(weather, t2, now), timeLabel: t2.timePhrase },
        ],
        context: contextMeta,
      }
      out.newContext = buildNewContext(out, question)
      return out
    }

    if (comparison.type === 'location') {
      const resolved = []
      for (const hint of comparison.locations) {
        const loc = await resolveLocation(hint, savedLocations, homeLocation)
        if (loc?.lat != null) resolved.push(loc)
      }

      if (resolved.length >= 2) {
        const coords = resolved.map(r => ({ lat: r.lat, lon: r.lon }))
        const weathers = await fetchWeatherBatch(coords)
        const timeRef = parseTimeReference(question, now)

        const items = resolved.map((loc, i) => ({
          label: loc.label || loc.name,
          bundle: weathers[i] ? sliceWeatherByTime(weathers[i], timeRef, now) : null,
          location: loc,
          timeLabel: timeRef.timePhrase,
        })).filter(item => item.bundle != null)

        if (items.length >= 2) {
          contextMeta.location = items.map(it => it.label).join(' · ')
          const out = {
            type: 'comparison',
            comparisonType: 'location',
            items,
            context: contextMeta,
            _timeLabel: timeRef.timePhrase,
            _targetDate: timeRef.targetDate.getTime(),
          }
          out.newContext = buildNewContext(out, question)
          return out
        }
      }
    }
  }

  // ─── 2. Route (single OR comparison) ─────────────────────────────
  let routeFromTo = parseFromTo(question)
  if (!routeFromTo && hints.routeFrom && hints.routeTo) {
    const hasNewLocation = !!(parseInLocation(question) || parseToOnly(question))
    if (!hasNewLocation) {
      routeFromTo = {
        from: hints.routeFrom.label,
        to: hints.routeTo.label,
        fromResolved: hints.routeFrom,
        toResolved: hints.routeTo,
      }
    }
  }

  if (routeFromTo) {
    let fromLoc = routeFromTo.fromResolved
    let toLoc = routeFromTo.toResolved

    if (!fromLoc) fromLoc = await resolveLocation(routeFromTo.from, savedLocations, homeLocation)
    if (!toLoc) toLoc = await resolveLocation(routeFromTo.to, savedLocations, homeLocation)

    if (fromLoc?.lat != null && toLoc?.lat != null) {
      let timeRef = parseTimeReference(question, now)
      if (!timeRef.hasExplicitTime && hints.targetDate) {
        timeRef = {
          ...timeRef,
          targetDate: new Date(hints.targetDate),
          timePhrase: hints.timeLabel,
          isFuture: new Date(hints.targetDate).getTime() > now.getTime(),
        }
      }

      const detectedModes = detectModes(question)
      const isComparison = detectedModes.length >= 2 && !hints.mode

      if (isComparison) {
        const legResults = await Promise.all(
          detectedModes.map(m => buildRouteLeg(fromLoc, toLoc, m, timeRef, now))
        )
        const validLegs = legResults.filter(Boolean)

        if (validLegs.length >= 2) {
          contextMeta.location = `${fromLoc.label || fromLoc.name} → ${toLoc.label || toLoc.name}`
          const out = {
            type: 'route_comparison',
            comparisonType: 'mode',
            legs: validLegs,
            context: contextMeta,
          }
          out.newContext = buildNewContext(out, question)
          return out
        }
      }

      const mode = hints.mode || detectedModes[0] || detectMode(question)
      const leg = await buildRouteLeg(fromLoc, toLoc, mode, timeRef, now)

      if (leg) {
        const destWeather = leg.waypoints[leg.waypoints.length - 1]?.weather
        const journeyBundle = collapseWaypointsToBundle(leg.waypoints, destWeather)
        if (journeyBundle && timeRef.timePhrase) {
          journeyBundle._timeLabel = timeRef.timePhrase
        }

        const out = {
          type: 'route',
          bundle: journeyBundle,
          route: leg.route,
          waypoints: leg.waypoints,
          context: contextMeta,
        }
        out.newContext = buildNewContext(out, question)
        return out
      }

      const destWeather = await fetchWeather(toLoc.lat, toLoc.lon)
      const out = {
        type: 'single',
        bundle: destWeather ? sliceWeatherByTime(destWeather, timeRef, now) : null,
        location: toLoc,
        context: contextMeta,
      }
      out.newContext = buildNewContext(out, question)
      return out
    }
  }

  // ─── 3. Single location ──────────────────────────────────────────
  let hint = parseInLocation(question) || parseToOnly(question)
  let loc = null

  if (hint) {
    loc = await resolveLocation(hint, savedLocations, homeLocation)
  } else if (hints.location?.lat != null) {
    loc = hints.location
  }

  if (loc?.lat != null) {
    const weather = await fetchWeather(loc.lat, loc.lon)
    let timeRef = parseTimeReference(question, now)
    if (!timeRef.hasExplicitTime && hints.targetDate) {
      timeRef = {
        ...timeRef,
        targetDate: new Date(hints.targetDate),
        timePhrase: hints.timeLabel,
        isFuture: new Date(hints.targetDate).getTime() > now.getTime(),
      }
    }

    const bundle = weather ? sliceWeatherByTime(weather, timeRef, now) : null
    if (bundle) {
      bundle.city = loc.label || loc.name
      bundle.lat = loc.lat
      bundle.lon = loc.lon
      bundle._timeLabel = timeRef.timePhrase
    }
    contextMeta.location = loc.label || loc.name

    const out = { type: 'single', bundle, location: loc, context: contextMeta }
    out.newContext = hint ? buildNewContext(out, question) : null
    return out
  }

  // ─── 4. Current location ─────────────────────────────────────────
  let weather = baseWeather
  let timeRef = parseTimeReference(question, now)

  if (!timeRef.hasExplicitTime && hints.targetDate) {
    timeRef = {
      ...timeRef,
      targetDate: new Date(hints.targetDate),
      timePhrase: hints.timeLabel,
      isFuture: new Date(hints.targetDate).getTime() > now.getTime(),
    }
  }

  const needsForecast = timeRef.isFuture || timeRef.daysAhead > 0 || !weather?.hourly?.time?.length

  if (needsForecast && location?.lat != null) {
    weather = await fetchWeather(location.lat, location.lon) || weather
  }

  const bundle = weather ? sliceWeatherByTime(weather, timeRef, now) : null
  if (bundle) {
    bundle.city = location?.name
    bundle.lat = location?.lat
    bundle.lon = location?.lon
    bundle._timeLabel = timeRef.timePhrase
    bundle.savedLocations = savedLocations
    bundle.homeLat = homeLocation?.lat
    bundle.homeLon = homeLocation?.lon
    bundle.homeName = homeLocation?.name
  }

  const out = { type: 'single', bundle, location, context: contextMeta }
  out.newContext = null
  return out
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
  detectModes,
  fetchRoute,
  mapWeatherCode,
  collapseWaypointsToBundle,
}
