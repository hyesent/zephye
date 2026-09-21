// ============================================================================
// CHAT CONTEXT — Temporary, session-only memory of "what we're talking about"
//
// In-memory only. Dies on page refresh. No localStorage, no persistence.
//
// Stores the last "subject" the user asked about (a route, a location,
// a comparison) so follow-up questions can inherit it as defaults.
//
// Pure functions + shape. State lives in ZephyeFullScreen via useState.
// ============================================================================

// ─── CONTEXT TYPES ──────────────────────────────────────────────────────

export const CONTEXT_TYPES = {
  ROUTE: 'route',
  LOCATION: 'location',
  COMPARISON: 'comparison',
  MULTI: 'multi',
}

// Keywords that clear the current context
const CLEAR_KEYWORDS = [
  'clear context',
  'clear the context',
  'new topic',
  'forget that',
  'forget it',
  'start over',
  'start fresh',
  'never mind',
  'nevermind',
  'different question',
  'switch topic',
  'change topic',
  'unrelated',
  'reset',
]

// ─── FACTORY ────────────────────────────────────────────────────────────

/**
 * Build a route context from resolver output.
 */
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

/**
 * Build a location context (single place + optional time).
 */
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

/**
 * Build a comparison context (2-3 places, or same place across 2 times).
 */
export function createComparisonContext({ comparisonType, items, timeLabel, question }) {
  if (!Array.isArray(items) || items.length < 2) return null

  const labels = items.map(it => it.label || '?')
  const label = comparisonType === 'time'
    ? `${labels[0]} vs ${labels[1]}`
    : labels.join(' vs ')

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
    },
  }
}

/**
 * Build a multi-stop context (3+ locations on a route).
 */
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

// ─── SHAPE HELPERS ──────────────────────────────────────────────────────

/**
 * Is this a valid, non-expired context?
 */
export function isValidContext(ctx) {
  if (!ctx || typeof ctx !== 'object') return false
  if (!ctx.type || !ctx.payload) return false
  return true
}

/**
 * Short label for the chip UI.
 */
export function getContextLabel(ctx) {
  if (!isValidContext(ctx)) return null
  return ctx.label || 'Previous topic'
}

/**
 * Icon for the chip, based on type.
 */
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

/**
 * Full chip string: "Following up: Home → Work"
 */
export function getContextChipText(ctx) {
  if (!isValidContext(ctx)) return null
  return `Following up: ${ctx.label}`
}

// ─── CLEAR DETECTION ────────────────────────────────────────────────────

/**
 * Does the user's question say "clear context"?
 */
export function isClearCommand(question) {
  if (!question) return false
  const q = question.toLowerCase().trim()
  return CLEAR_KEYWORDS.some(k => q.includes(k))
}

// ─── DEFAULT EXPORT ─────────────────────────────────────────────────────

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
