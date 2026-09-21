// ============================================================================
// CHAT CONTEXT — Temporary, session-only memory of "what we're talking about"
// ============================================================================

export const CONTEXT_TYPES = {
  ROUTE: 'route',
  LOCATION: 'location',
  COMPARISON: 'comparison',
  MULTI: 'multi',
}

const CLEAR_KEYWORDS = [
  'clear context',
  'clear the context',
  'clear this',
  'new topic',
  'forget that',
  'forget about that',
  'forget this',
  'forget it',
  'forget it all',
  'never mind',
  'nevermind',
  'never mind that',
  'nevermind that',
  'ignore that',
  'ignore this',
  'scratch that',
  'cancel that',
  'drop that',
  'disregard',
  'disregard that',
  'start over',
  'start fresh',
  'different question',
  'switch topic',
  'change topic',
  'unrelated',
  'reset',
]

// ─── FACTORY ────────────────────────────────────────────────────────────

export function createRouteContext({ from, to, mode, question }) {
  if (!from?.lat || !to?.lat) return null
  return {
    id: `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: CONTEXT_TYPES.ROUTE,
    createdAt: Date.now(),
    question: question || '',
    label: `${from.label || from.name || '?'} → ${to.label || to.name || '?'}`,
    payload: {
      from: { lat: from.lat, lon: from.lon, label: from.label || from.name },
      to: { lat: to.lat, lon: to.lon, label: to.label || to.name },
      mode: mode || 'car',
    },
  }
}

export function createLocationContext({ location, targetDate, timeLabel, question }) {
  if (!location?.lat) return null
  const labelParts = [location.label || location.name || '?']

  return {
    id: `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: CONTEXT_TYPES.LOCATION,
    createdAt: Date.now(),
    question: question || '',
    label: labelParts.join(' · '),
    payload: {
      location: { lat: location.lat, lon: location.lon, label: location.label || location.name },
      targetDate: targetDate ? new Date(targetDate).getTime() : null,
      timeLabel: timeLabel || null,
    },
  }
}

export function createComparisonContext({ comparisonType, items, timeLabel, targetDate, question }) {
  if (!Array.isArray(items) || items.length < 2) return null

  const labels = items.map(it => it.label || '?')
  const label = comparisonType === 'time'
    ? `${labels[0]} vs ${labels[1]}`
    : labels.join(' · ')

  return {
    id: `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: CONTEXT_TYPES.COMPARISON,
    createdAt: Date.now(),
    question: question || '',
    label,
    payload: {
      comparisonType: comparisonType || 'location',
      items: items.map(it => ({
        label: it.label,
        location: it.location
          ? { lat: it.location.lat, lon: it.location.lon, label: it.label }
          : null,
        timeLabel: it.timeLabel || null,
      })),
      timeLabel: timeLabel || null,
      targetDate: targetDate || null,
    },
  }
}

export function createMultiContext({ stops, mode, question }) {
  if (!Array.isArray(stops) || stops.length < 2) return null

  return {
    id: `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: CONTEXT_TYPES.MULTI,
    createdAt: Date.now(),
    question: question || '',
    label: stops.map(s => s.label || '?').join(' → '),
    payload: {
      stops: stops.map(s => ({
        lat: s.lat,
        lon: s.lon,
        label: s.label || s.name,
      })),
      mode: mode || 'car',
    },
  }
}

// ─── HELPERS ────────────────────────────────────────────────────────────

export function isValidContext(ctx) {
  if (!ctx || typeof ctx !== 'object') return false
  if (!ctx.type || !ctx.payload) return false
  return true
}

export function getContextLabel(ctx) {
  if (!isValidContext(ctx)) return null
  return ctx.label || 'Previous topic'
}

export function getContextIcon(ctx) {
  if (!isValidContext(ctx)) return '📌'
  switch (ctx.type) {
    case CONTEXT_TYPES.ROUTE: return '📍'
    case CONTEXT_TYPES.LOCATION: return '🌍'
    case CONTEXT_TYPES.COMPARISON: return '⚖️'
    case CONTEXT_TYPES.MULTI: return '🔗'
    default: return '📌'
  }
}

export function getContextChipText(ctx) {
  if (!isValidContext(ctx)) return null
  return `Following up: ${ctx.label}`
}

export function isClearCommand(question) {
  if (!question) return false
  const q = question.toLowerCase().trim()
  return CLEAR_KEYWORDS.some(k => q.includes(k))
}

export default {
  CONTEXT_TYPES,
  createRouteContext,
  createLocationContext,
  createComparisonContext,
  createMultiContext,
  isValidContext,
  getContextLabel,
  getContextIcon,
  getContextChipText,
  isClearCommand,
}
