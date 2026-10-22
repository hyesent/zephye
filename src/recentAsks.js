// ============================================================================
// RECENT ASKS — Remember what the user asked, for quick re-ask chips
//
// Storage: zephye_recent_asks (array, newest first, capped at 20)
// Also: zephye_pinned_asks (array, pinned by user, shown first)
// ============================================================================

const RECENT_KEY = 'zephye_recent_asks'
const PINNED_KEY = 'zephye_pinned_asks'
const MAX_RECENT = 20
const MAX_PINNED = 5

// ─── SAFE READ/WRITE ───────────────────────────────────────────────────

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(key, arr) {
  try {
    localStorage.setItem(key, JSON.stringify(arr))
  } catch {}
}

// ─── RECENT ────────────────────────────────────────────────────────────

export function getRecentAsks() {
  return read(RECENT_KEY)
}

export function addRecentAsk(question) {
  if (!question || typeof question !== 'string') return
  const trimmed = question.trim()
  if (trimmed.length < 3) return

  const recent = read(RECENT_KEY)

  const filtered = recent.filter(
    q => q.toLowerCase() !== trimmed.toLowerCase()
  )

  const next = [trimmed, ...filtered].slice(0, MAX_RECENT)
  write(RECENT_KEY, next)
  return next
}

export function clearRecentAsks() {
  write(RECENT_KEY, [])
}

// ─── PINNED ────────────────────────────────────────────────────────────

export function getPinnedAsks() {
  return read(PINNED_KEY)
}

export function pinAsk(question) {
  if (!question) return
  const trimmed = question.trim()
  const pinned = read(PINNED_KEY)

  if (pinned.some(q => q.toLowerCase() === trimmed.toLowerCase())) return pinned
  if (pinned.length >= MAX_PINNED) return pinned

  const next = [trimmed, ...pinned]
  write(PINNED_KEY, next)
  return next
}

export function unpinAsk(question) {
  const trimmed = question.trim()
  const pinned = read(PINNED_KEY)
  const next = pinned.filter(q => q.toLowerCase() !== trimmed.toLowerCase())
  write(PINNED_KEY, next)
  return next
}

export function isPinned(question) {
  if (!question) return false
  const trimmed = question.trim().toLowerCase()
  return read(PINNED_KEY).some(q => q.toLowerCase() === trimmed)
}

export function clearPinnedAsks() {
  write(PINNED_KEY, [])
}

// ─── COMBINED VIEW ─────────────────────────────────────────────────────

export function getAskChips() {
  const pinned = read(PINNED_KEY)
  const recent = read(RECENT_KEY)
  const pinnedSet = new Set(pinned.map(q => q.toLowerCase()))

  const recentOnly = recent.filter(q => !pinnedSet.has(q.toLowerCase()))
  return {
    pinned,
    recent: recentOnly.slice(0, 8),
  }
}

export default {
  getRecentAsks,
  addRecentAsk,
  clearRecentAsks,
  getPinnedAsks,
  pinAsk,
  unpinAsk,
  isPinned,
  clearPinnedAsks,
  getAskChips,
}
