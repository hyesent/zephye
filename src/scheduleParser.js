// ============================================================================
// SCHEDULE PARSER — Extract schedule hints from raw questions
// Pure function. No side effects. No storage. No UI.
// ============================================================================

import { detectIntents } from './intentEngine.js'

// ============================================================================
// CONFIG
// ============================================================================

const DEFAULT_FIRE_HOUR = 6 // 6 AM default fire time for day-snapshots

// Pills that require a destination location
const DESTINATION_PILLS = ['route', 'traffic', 'events', 'traveling']

// Days of week (index matches Date.getDay())
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// Words that should never be captured as a location
const LOCATION_STOPWORDS = new Set([
  'the', 'a', 'an', 'my', 'your', 'his', 'her', 'our', 'their',
  'this', 'that', 'these', 'those', 'here', 'there',
  'morning', 'afternoon', 'evening', 'night', 'tonight',
  'work', 'school', 'home', 'town', 'city', 'nowhere'
])

// ============================================================================
// TIME PARSER
// ============================================================================

/**
 * Parse time hints from a question.
 * Returns { targetTime, resolvedDate, timePhrase, isDaySnapshot, relativeWordMap, explicitHour }
 */
function parseTime(question) {
  const empty = {
    targetTime: null,
    resolvedDate: null,
    timePhrase: null,
    isDaySnapshot: true,
    relativeWordMap: {},
    explicitHour: null
  }

  if (!question) return empty

  const q = question.toLowerCase()
  const now = new Date()
  const target = new Date(now)

  let explicitHour = null
  let explicitMinute = 0
  let relativeWordMap = {}
  let hasTimeReference = false
  let hasDayReference = false
  let isMomentMode = false // true if user specified a specific hour/min

  // ─── Extract explicit hour ("at 5pm", "at 17:30", "at 9am") ────────────
  const timeMatch = q.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i)
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10)
    const minute = parseInt(timeMatch[2], 10) || 0
    const ampm = timeMatch[3]?.toLowerCase()
    if (ampm === 'pm' && hour < 12) hour += 12
    if (ampm === 'am' && hour === 12) hour = 0
    if (hour >= 0 && hour <= 23) {
      explicitHour = hour
      explicitMinute = minute
      isMomentMode = true
    }
  }

  // ─── "in X days/hours/minutes" ─────────────────────────────────────────
  const inMatch = q.match(/\bin\s+(\d+)\s+(day|days|hour|hours|hr|hrs|minute|minutes|min|mins)\b/i)
  if (inMatch) {
    const num = parseInt(inMatch[1], 10)
    const unit = inMatch[2].toLowerCase()
    if (unit.startsWith('day')) {
      target.setDate(target.getDate() + num)
      hasDayReference = true
    } else if (unit.startsWith('hour') || unit.startsWith('hr')) {
      target.setHours(target.getHours() + num)
      isMomentMode = true
    } else if (unit.startsWith('min')) {
      target.setMinutes(target.getMinutes() + num)
      isMomentMode = true
    }
    hasTimeReference = true
  }

  // ─── Named times of day ────────────────────────────────────────────────
  if (explicitHour === null) {
    if (/\b(?:morning|sunrise|dawn)\b/i.test(q)) {
      explicitHour = 6
      isMomentMode = true
    } else if (/\b(?:afternoon|noon|midday|lunch)\b/i.test(q)) {
      explicitHour = 13
      isMomentMode = true
    } else if (/\b(?:evening|sunset|dusk)\b/i.test(q)) {
      explicitHour = 18
      isMomentMode = true
    } else if (/\b(?:night|tonight|midnight)\b/i.test(q)) {
      explicitHour = 21
      isMomentMode = true
    }
  }

  // ─── Day references ────────────────────────────────────────────────────
  const todayMatch = /\btoday\b/i.test(q)
  const tomorrowMatch = /\btomorrow\b/i.test(q)
  const nextWeekMatch = /\bnext\s+week\b/i.test(q)
  const weekendMatch = /\b(?:this\s+)?weekend\b/i.test(q)
  const dayNameMatch = q.match(/\b(?:on\s+|next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)

  if (tomorrowMatch) {
    target.setDate(target.getDate() + 1)
    relativeWordMap['tomorrow'] = 'today'
    hasDayReference = true
  } else if (todayMatch) {
    hasDayReference = true
  } else if (nextWeekMatch) {
    target.setDate(target.getDate() + 7)
    relativeWordMap['next week'] = 'today'
    hasDayReference = true
  } else if (weekendMatch) {
    const day = target.getDay()
    const daysUntilSat = (6 - day + 7) % 7 || 7
    target.setDate(target.getDate() + daysUntilSat)
    hasDayReference = true
  } else if (dayNameMatch) {
    const targetDay = DAY_NAMES.indexOf(dayNameMatch[1].toLowerCase())
    const daysUntil = (targetDay - target.getDay() + 7) % 7 || 7
    target.setDate(target.getDate() + daysUntil)
    relativeWordMap[dayNameMatch[0].toLowerCase()] = 'today'
    hasDayReference = true
  }

  // ─── "later" → default evening ─────────────────────────────────────────
  if (/\blater\b/i.test(q) && explicitHour === null) {
    explicitHour = 18
    isMomentMode = true
  }

  if (!hasDayReference && explicitHour === null && !isMomentMode) {
    return empty
  }

  // ─── Apply hour ────────────────────────────────────────────────────────
  if (isMomentMode && explicitHour !== null) {
    target.setHours(explicitHour, explicitMinute, 0, 0)
  } else {
    target.setHours(DEFAULT_FIRE_HOUR, 0, 0, 0)
  }

  // ─── Push to future if in past ─────────────────────────────────────────
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1)
  }

  // ─── Build resolved date + phrase ──────────────────────────────────────
  const yyyy = target.getFullYear()
  const mm = String(target.getMonth() + 1).padStart(2, '0')
  const dd = String(target.getDate()).padStart(2, '0')
  const resolvedDate = `${yyyy}-${mm}-${dd}`

  const phraseParts = []
  if (tomorrowMatch) phraseParts.push('tomorrow')
  else if (todayMatch) phraseParts.push('today')
  else if (dayNameMatch) phraseParts.push(dayNameMatch[0])
  else if (nextWeekMatch) phraseParts.push('next week')
  else if (weekendMatch) phraseParts.push('this weekend')
  if (isMomentMode && explicitHour !== null) {
    phraseParts.push(`at ${explicitHour}:${String(explicitMinute).padStart(2, '0')}`)
  }
  const timePhrase = phraseParts.join(' ') || null

  return {
    targetTime: target.getTime(),
    resolvedDate,
    timePhrase,
    isDaySnapshot: !isMomentMode,
    relativeWordMap,
    explicitHour
  }
}

// ============================================================================
// RECURRENCE PARSER
// ============================================================================

function parseRecurrence(question) {
  if (!question) return { mode: 'once', daysOfWeek: [], until: null }

  const q = question.toLowerCase()
  const hasEvery = /\bevery\b/i.test(q) || /\bdaily\b/i.test(q) || /\bweekly\b/i.test(q) || /\beach\b/i.test(q)

  // ─── Explicit day list ("every monday and wednesday") ──────────────────
  const dayMatches = q.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\b/g)
  if (dayMatches && hasEvery) {
    const days = [...new Set(dayMatches.map(d => DAY_NAMES.indexOf(d.replace(/s$/, ''))))]
    if (days.length === 1) {
      return { mode: 'weekly', daysOfWeek: days, until: null }
    }
    return { mode: 'custom', daysOfWeek: days, until: null }
  }

  // ─── Weekday / weekend groups ──────────────────────────────────────────
  if (/\bevery\s+weekday\b/i.test(q) || /\bweekdays?\b/i.test(q)) {
    return { mode: 'weekdays', daysOfWeek: [1, 2, 3, 4, 5], until: null }
  }

  if (/\bevery\s+weekend\b/i.test(q) || /\bweekends?\b/i.test(q)) {
    return { mode: 'weekends', daysOfWeek: [0, 6], until: null }
  }

  // ─── Daily patterns ────────────────────────────────────────────────────
  if (/\bevery\s+day\b/i.test(q) || /\bdaily\b/i.test(q) || /\bevery\s+(morning|evening|night|afternoon)\b/i.test(q)) {
    return { mode: 'daily', daysOfWeek: [], until: null }
  }

  // ─── Weekly pattern ────────────────────────────────────────────────────
  if (/\bevery\s+week\b/i.test(q) || /\bweekly\b/i.test(q)) {
    return { mode: 'weekly', daysOfWeek: [], until: null }
  }

  return { mode: 'once', daysOfWeek: [], until: null }
}

// ============================================================================
// INTENT PARSER
// ============================================================================

function parseIntents(question) {
  if (!question) return []
  try {
    const detected = detectIntents(question)
    return detected.map(d => d.intent.id)
  } catch (e) {
    console.warn('[scheduleParser] Intent detection failed:', e)
    return []
  }
}

// ============================================================================
// LOCATION PARSER
// ============================================================================

function parseLocations(question, savedLocations = [], homeLocation = null) {
  const result = {
    locationMode: 'single',
    toHint: null,
    fromHint: null,
    matchedTo: null,
    matchedFrom: null
  }

  if (!question) return result

  // ─── "from X to Y" → route mode ────────────────────────────────────────
  const fromToMatch = question.match(
    /\bfrom\s+([A-Za-z][A-Za-z\s,'-]{1,40}?)\s+to\s+([A-Za-z][A-Za-z\s,'-]{1,40}?)(?:\s+(?:on|at|by|for|tomorrow|today|tonight|next|this|the|\?|,|$))/i
  )
  if (fromToMatch) {
    result.locationMode = 'route'
    result.fromHint = cleanHint(fromToMatch[1])
    result.toHint = cleanHint(fromToMatch[2])
    result.matchedFrom = findLocation(result.fromHint, savedLocations, homeLocation)
    result.matchedTo = findLocation(result.toHint, savedLocations, homeLocation)
    return result
  }

  // ─── "to Y" → destination only ─────────────────────────────────────────
  const toOnlyMatch = question.match(
    /\bto\s+([A-Za-z][A-Za-z\s,'-]{1,40}?)(?:\s+(?:on|at|by|for|tomorrow|today|tonight|next|this|the|\?|,|$))/i
  )
  if (toOnlyMatch) {
    const hint = cleanHint(toOnlyMatch[1])
    if (hint && !LOCATION_STOPWORDS.has(hint.toLowerCase())) {
      result.toHint = hint
      result.matchedTo = findLocation(hint, savedLocations, homeLocation)
      return result
    }
  }

  // ─── "at X" / "in X" → destination hint ────────────────────────────────
  const atMatch = question.match(
    /\b(?:at|in)\s+([A-Za-z][A-Za-z\s,'-]{1,40}?)(?:\s+(?:on|at|by|for|tomorrow|today|tonight|next|this|the|\?|,|$))/i
  )
  if (atMatch) {
    const hint = cleanHint(atMatch[1])
    if (hint && !LOCATION_STOPWORDS.has(hint.toLowerCase())) {
      result.toHint = hint
      result.matchedTo = findLocation(hint, savedLocations, homeLocation)
    }
  }

  return result
}

function cleanHint(raw) {
  if (!raw) return null
  return raw.trim().replace(/[,]+$/, '').replace(/\s+/g, ' ')
}

function findLocation(hint, savedLocations, homeLocation) {
  if (!hint) return null
  const lower = hint.toLowerCase().trim()

  // ─── Home match ────────────────────────────────────────────────────────
  if (homeLocation) {
    const homeLabel = (homeLocation.label || homeLocation.name || '').toLowerCase()
    const homeCity = (homeLocation.name || '').split(',')[0].toLowerCase()
    if (
      homeLabel &&
      (homeLabel === lower || homeLabel.includes(lower) || lower.includes(homeLabel) ||
       homeCity === lower || homeCity.includes(lower) || lower.includes(homeCity))
    ) {
      return {
        lat: homeLocation.lat,
        lon: homeLocation.lon,
        label: homeLocation.label || homeLocation.name,
        isHome: true
      }
    }
  }

  // ─── Saved location match ──────────────────────────────────────────────
  for (const loc of savedLocations) {
    const label = (loc.label || loc.name || '').toLowerCase()
    const city = (loc.name || '').split(',')[0].toLowerCase()
    if (
      label &&
      (label === lower || label.includes(lower) || lower.includes(label) ||
       city === lower || city.includes(lower) || lower.includes(city))
    ) {
      return {
        lat: loc.lat,
        lon: loc.lon,
        label: loc.label || loc.name,
        country_code: loc.country_code
      }
    }
  }

  // ─── No match → return as geocode candidate ────────────────────────────
  return {
    lat: null,
    lon: null,
    label: hint,
    needsGeocode: true
  }
}

// ============================================================================
// MAIN PARSER
// ============================================================================

/**
 * Parse a raw question and extract everything needed to prefill a schedule.
 * Pure function. No side effects.
 *
 * @param {string} question
 * @param {Array} savedLocations
 * @param {Object|null} homeLocation
 * @returns {Object} parsed schedule hints
 */
export function parseScheduleQuestion(question, savedLocations = [], homeLocation = null) {
  const time = parseTime(question)
  const recurrence = parseRecurrence(question)
  const suggestedIntents = parseIntents(question)
  const locations = parseLocations(question, savedLocations, homeLocation)

  // ─── Auto-augment intents based on location hints ──────────────────────
  if (locations.locationMode === 'route' && !suggestedIntents.includes('route')) {
    suggestedIntents.unshift('route')
  }
  if (locations.toHint && !suggestedIntents.includes('weather')) {
    suggestedIntents.push('weather')
  }

  // ─── Confidence scoring ────────────────────────────────────────────────
  let confidence = 0
  if (time.targetTime) confidence += 50
  if (suggestedIntents.length > 0) confidence += 25
  if (locations.toHint || locations.fromHint) confidence += 15
  if (recurrence.mode !== 'once') confidence += 10
  confidence = Math.min(confidence, 100)

  return {
    question: question || '',

    // Time
    targetTime: time.targetTime,
    resolvedDate: time.resolvedDate,
    timePhrase: time.timePhrase,
    isDaySnapshot: time.isDaySnapshot,
    relativeWordMap: time.relativeWordMap,

    // Location
    locationMode: locations.locationMode,
    locationHint: locations.toHint,
    fromHint: locations.fromHint,
    toHint: locations.toHint,
    matchedLocation: locations.matchedTo,
    matchedFrom: locations.matchedFrom,

    // Intent
    suggestedIntents,

    // Recurrence
    recurrence,

    // Confidence
    confidence
  }
}

// ============================================================================
// REWRITER — Called on fire day
// ============================================================================

/**
 * Rewrite a schedule question for the fire day.
 * Replaces "tomorrow" → "today", "next monday" → "today", etc.
 *
 * @param {string} question - original question text
 * @param {Object} relativeWordMap - e.g. { tomorrow: 'today' }
 * @returns {string} rewritten question
 */
export function rewriteQuestionForFireDay(question, relativeWordMap = {}) {
  if (!question || !relativeWordMap) return question
  let rewritten = question
  for (const [from, to] of Object.entries(relativeWordMap)) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
    rewritten = rewritten.replace(regex, to)
  }
  return rewritten
}

// ============================================================================
// HELPERS (for form use)
// ============================================================================

/**
 * Whether the given intent list requires a destination location.
 */
export function needsDestination(intents = []) {
  return intents.some(id => DESTINATION_PILLS.includes(id))
}

/**
 * Whether the given intent list requires an origin location.
 */
export function needsOrigin(intents = []) {
  return intents.includes('route')
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  parseScheduleQuestion,
  rewriteQuestionForFireDay,
  needsDestination,
  needsOrigin
}
