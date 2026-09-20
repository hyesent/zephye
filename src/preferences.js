// ============================================================================
// PREFERENCES — User-level settings that persist across sessions
// ============================================================================

const PREFIX = 'zephye_pref_'

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// ─── Transport mode ────────────────────────────────────────────────────

const MODES = ['car', 'walking', 'cycling', 'hiking', 'hgv', 'wheelchair']
const DEFAULT_MODE = 'car'

export function getDefaultMode() {
  const stored = safeRead('defaultMode', DEFAULT_MODE)
  return MODES.includes(stored) ? stored : DEFAULT_MODE
}

export function setDefaultMode(mode) {
  if (!MODES.includes(mode)) return false
  return safeWrite('defaultMode', mode)
}

export function getAvailableModes() {
  return [...MODES]
}

// ─── Voice gender ──────────────────────────────────────────────────────

export function getVoiceGender() {
  return safeRead('voiceGender', 'female')
}

export function setVoiceGender(g) {
  if (g !== 'female' && g !== 'male') return false
  return safeWrite('voiceGender', g)
}

// ─── Units ─────────────────────────────────────────────────────────────

export function getUnits() {
  return safeRead('units', 'metric')
}

export function setUnits(u) {
  if (u !== 'metric' && u !== 'imperial') return false
  return safeWrite('units', u)
}

// ─── Reset ─────────────────────────────────────────────────────────────

export function clearAllPreferences() {
  try {
    const toRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) toRemove.push(k)
    }
    toRemove.forEach(k => localStorage.removeItem(k))
  } catch {}
}

export default {
  getDefaultMode,
  setDefaultMode,
  getAvailableModes,
  getVoiceGender,
  setVoiceGender,
  getUnits,
  setUnits,
  clearAllPreferences,
}
