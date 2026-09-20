// ============================================================================
// RESPONSE MERGER — Assembles final response from resolver + intent outputs
//
// Input:  resolver output (single/comparison/route/multi) + intent results
// Output: unified response object ready for responseFormatter
//
// Never truncates. Never crashes. Always produces something.
// ============================================================================

// ─── INTENT DISPATCH HELPERS ───────────────────────────────────────────

const ASYNC_INTENTS = new Set([
  'farming', 'stargazing', 'route', 'traffic', 'traveling',
])

/**
 * Whether an intent returns a promise.
 */
export function isAsyncIntent(intentId) {
  return ASYNC_INTENTS.has(intentId)
}

/**
 * Run a single intent safely. Never throws.
 */
async function runIntent(intent, bundle, question) {
  if (!intent || typeof intent.fn !== 'function') return null
  try {
    const result = isAsyncIntent(intent.id)
      ? await intent.fn(bundle, question)
      : intent.fn(bundle, question)
    return { intent, result }
  } catch (err) {
    console.error(`[responseMerger] Intent ${intent?.id} failed:`, err)
    return null
  }
}

/**
 * Run multiple intents in parallel (or sequence for async-only).
 * Returns array of { intent, result } for successful runs.
 */
async function runIntents(intents, bundle, question) {
  if (!Array.isArray(intents) || intents.length === 0) return []

  // Run all in parallel — async ones return promises, sync ones return values
  const promises = intents.map(intent => runIntent(intent, bundle, question))
  const results = await Promise.all(promises)
  return results.filter(Boolean)
}

// ─── CONTENT NORMALIZATION ─────────────────────────────────────────────

/**
 * Normalize any intent output into a common shape:
 * { kind: 'structured'|'string'|'empty', verdict, summary, fullText, details }
 */
function normalizeContent(result) {
  if (result == null) {
    return { kind: 'empty' }
  }

  if (typeof result === 'string') {
    const trimmed = result.trim()
    if (!trimmed) return { kind: 'empty' }
    // Use first line as verdict, rest as fullText
    const lines = trimmed.split('\n')
    return {
      kind: 'string',
      verdict: lines[0].slice(0, 140),
      summary: trimmed.slice(0, 400),
      fullText: trimmed,
      details: [],
    }
  }

  if (typeof result === 'object') {
    if (result.verdict || result.summary) {
      return {
        kind: 'structured',
        verdict: result.verdict || '',
        summary: result.summary || '',
        note: result.note || '',
        details: Array.isArray(result.details) ? result.details : [],
        fullText: result.fullText || '',
      }
    }
    // Unknown object shape — stringify
    try {
      const str = JSON.stringify(result)
      return { kind: 'string', verdict: str.slice(0, 140), summary: str, fullText: str, details: [] }
    } catch {
      return { kind: 'empty' }
    }
  }

  return { kind: 'empty' }
}

// ─── MERGE: SINGLE ─────────────────────────────────────────────────────

/**
 * Merge multiple intent results into a single response.
 * If only one intent ran, pass its content through.
 * If multiple ran, produce a multi-section response.
 */
async function mergeSingle(resolverOut, intents, question) {
  const bundle = resolverOut.bundle
  if (!bundle) {
    return {
      verdict: "I don't have weather data right now.",
      summary: 'Try again in a moment, or check your connection.',
      note: '',
      details: [],
      fullText: '',
      _empty: true,
    }
  }

  const runs = await runIntents(intents, bundle, question)

  if (runs.length === 0) {
    // No intents matched — fall through to BasicWeather-like fallback
    return {
      verdict: 'Here is the weather.',
      summary: `${bundle.temp ?? '--'}°C · ${bundle.condition ?? 'unknown'}`,
      note: '',
      details: [],
      fullText: '',
    }
  }

  // Single intent — pass through
  if (runs.length === 1) {
    const { intent, result } = runs[0]
    const normalized = normalizeContent(result)
    if (normalized.kind === 'structured') {
      return {
        verdict: normalized.verdict,
        summary: normalized.summary,
        note: normalized.note,
        details: normalized.details,
        fullText: normalized.fullText,
        _intent: intent.id,
        _section: intent.section,
      }
    }
    return {
      verdict: `${intent.section || intent.name || 'Result'}`,
      summary: normalized.summary,
      note: '',
      details: [],
      fullText: normalized.fullText,
      _intent: intent.id,
    }
  }

  // Multiple intents — build a multi-section response
  const sections = runs.map(({ intent, result }) => {
    const normalized = normalizeContent(result)
    return {
      title: intent.section || intent.name || intent.id,
      content: normalized.kind === 'structured'
        ? {
            verdict: normalized.verdict,
            summary: normalized.summary,
            note: normalized.note,
            details: normalized.details,
            fullText: normalized.fullText,
          }
        : normalized.fullText,
    }
  })

  // Also produce a top-level summary combining all verdicts
  const summaryParts = runs.map(({ intent, result }) => {
    const n = normalizeContent(result)
    return `${intent.section || intent.name}: ${n.verdict || n.summary?.slice(0, 80) || 'ok'}`
  })

  return {
    verdict: `Multiple topics covered`,
    summary: summaryParts.join(' · '),
    note: '',
    details: [],
    fullText: sections.map(s => {
      const c = s.content
      if (typeof c === 'string') return `${s.title}\n${c}`
      return `${s.title}\n${c.verdict || ''}\n${c.summary || ''}`
    }).join('\n\n---\n\n'),
    sections,
  }
}

// ─── MERGE: COMPARISON ─────────────────────────────────────────────────

async function mergeComparison(resolverOut, intents, question) {
  const items = resolverOut.items || []
  const comparisonType = resolverOut.comparisonType || 'location'

  const enriched = []
  for (const item of items) {
    const bundle = item.bundle
    if (!bundle) {
      enriched.push({
        label: item.label,
        content: {
          verdict: 'No data',
          summary: 'Could not fetch weather for this option.',
          details: [],
          fullText: '',
        },
      })
      continue
    }

    // Give the bundle its label so intents can reference it
    bundle.city = item.label
    if (item.location?.lat != null) {
      bundle.lat = item.location.lat
      bundle.lon = item.location.lon
    }

    const runs = await runIntents(intents, bundle, question)
    if (runs.length === 0) {
      enriched.push({
        label: item.label,
        content: {
          verdict: `${bundle.temp ?? '--'}°C · ${bundle.condition ?? 'unknown'}`,
          summary: `Feels like ${bundle.feelsLike ?? bundle.temp ?? '--'}°C.`,
          details: [],
          fullText: '',
        },
      })
      continue
    }

    // Merge this side's intents
    const side = await mergeSide(runs)
    enriched.push({ label: item.label, content: side })
  }

  const takeaway = buildComparisonTakeaway(enriched, comparisonType)

  return {
    type: 'comparison',
    comparisonType,
    title: comparisonType === 'time'
      ? `${items[0]?.label || 'Time 1'} vs ${items[1]?.label || 'Time 2'}`
      : `${enriched.map(e => e.label).join(' vs ')}`,
    items: enriched,
    takeaway,
  }
}

/**
 * Merge multiple intents for one side of a comparison into a single content block.
 */
async function mergeSide(runs) {
  if (runs.length === 1) {
    const n = normalizeContent(runs[0].result)
    if (n.kind === 'structured') {
      return {
        verdict: n.verdict,
        summary: n.summary,
        note: n.note,
        details: n.details,
        fullText: n.fullText,
      }
    }
    return {
      verdict: runs[0].intent.section || 'Result',
      summary: n.summary,
      details: [],
      fullText: n.fullText,
    }
  }

  const sections = runs.map(({ intent, result }) => {
    const n = normalizeContent(result)
    return {
      title: intent.section || intent.name || intent.id,
      content: n.kind === 'structured'
        ? { verdict: n.verdict, summary: n.summary, details: n.details, fullText: n.fullText }
        : n.fullText,
    }
  })

  const primaryVerdict = sections[0]?.content?.verdict || sections[0]?.content?.summary || 'Mixed'

  return {
    verdict: primaryVerdict,
    summary: sections.map(s => {
      const c = s.content
      const text = typeof c === 'string' ? c : (c.verdict || c.summary || '')
      return `${s.title}: ${text.slice(0, 80)}`
    }).join(' · '),
    details: [],
    fullText: sections.map(s => `${s.title}\n${typeof s.content === 'string' ? s.content : s.content.summary || ''}`).join('\n\n'),
    sections,
  }
}

/**
 * Build a plain-language takeaway from comparison results.
 * Compares temp, rain probability, wind across sides.
 */
function buildComparisonTakeaway(enriched, comparisonType) {
  if (enriched.length < 2) return ''

  const pick = (content, key) => {
    if (!content) return null
    if (key === 'temp') return content._temp ?? null
    if (key === 'rain') return content._rain ?? null
    if (key === 'wind') return content._wind ?? null
    return null
  }

  // Fallback: try to extract from details if present
  const extractFromDetails = (content, labelPattern) => {
    if (!content?.details) return null
    const row = content.details.find(d =>
      (d.label || '').toLowerCase().includes(labelPattern)
    )
    if (!row) return null
    const num = parseFloat(String(row.value || '').replace(/[^\d.-]/g, ''))
    return isNaN(num) ? null : num
  }

  const temps = enriched.map(e =>
    extractFromDetails(e.content, 'temperature') ??
    extractFromDetails(e.content, 'temp') ??
    null
  )
  const rains = enriched.map(e =>
    extractFromDetails(e.content, 'rain') ??
    extractFromDetails(e.content, 'precip') ??
    null
  )
  const winds = enriched.map(e =>
    extractFromDetails(e.content, 'wind') ??
    null
  )

  const parts = []

  // Warmest
  const maxTemp = Math.max(...temps.filter(t => t != null))
  if (isFinite(maxTemp)) {
    const warmest = enriched.filter((e, i) => temps[i] === maxTemp).map(e => e.label)
    if (warmest.length === 1) {
      parts.push(`${warmest[0]} is warmest at ${Math.round(maxTemp)}°C`)
    }
  }

  // Driest
  const minRain = Math.min(...rains.filter(r => r != null))
  if (isFinite(minRain)) {
    const driest = enriched.filter((e, i) => rains[i] === minRain).map(e => e.label)
    if (driest.length === 1) {
      parts.push(`${driest[0]} is driest at ${Math.round(minRain)}% rain chance`)
    }
  }

  // Calmest
  const minWind = Math.min(...winds.filter(w => w != null))
  if (isFinite(minWind)) {
    const calmest = enriched.filter((e, i) => winds[i] === minWind).map(e => e.label)
    if (calmest.length === 1 && minWind < 20) {
      parts.push(`${calmest[0]} is calmest at ${Math.round(minWind)} km/h wind`)
    }
  }

  if (parts.length === 0) return ''
  return parts.join(' · ') + '.'
}

// ─── MERGE: ROUTE ──────────────────────────────────────────────────────

async function mergeRoute(resolverOut, intents, question) {
  const waypoints = resolverOut.waypoints || []
  const route = resolverOut.route || {}

  // Run intents per waypoint (weather advice mostly) — but only if bundle exists
  // The route intent itself is special: it uses the route object, not the bundle
  const weatherIntents = intents.filter(i => i.id !== 'route')
  const routeIntent = intents.find(i => i.id === 'route')

  // Build waypoint narratives
  const enrichedWaypoints = []
  for (const wp of waypoints) {
    if (!wp.weather) {
      enrichedWaypoints.push({ ...wp, narrative: null })
      continue
    }

    // Run only the weather-relevant intents on each waypoint
    const simple = weatherIntents.length > 0 ? weatherIntents : []
    const runs = await runIntents(simple, wp.weather, question)
    const narrative = runs.length > 0
      ? await mergeSide(runs)
      : {
          verdict: `${wp.weather.temp ?? '--'}°C · ${wp.weather.condition ?? 'unknown'}`,
          summary: '',
          details: [],
          fullText: '',
        }
    enrichedWaypoints.push({ ...wp, narrative })
  }

  // Build a summary narrative of weather along the way
  const summary = buildRouteWeatherSummary(enrichedWaypoints)

  // Get full route directions via the route intent (if present)
  let directions = []
  if (routeIntent && typeof routeIntent.fn === 'function') {
    try {
      // Route advice uses a special data shape — pass through waypoints + route
      const routeData = {
        ...resolverOut.bundle,
        _route: route,
        _waypoints: enrichedWaypoints,
      }
      const result = await routeIntent.fn(routeData, question)
      if (typeof result === 'string') {
        // Parse step lines from output
        directions = result.split('\n').filter(l => /^\s*\d+\./.test(l)).map(l => l.trim())
      } else if (result?.directions) {
        directions = result.directions
      } else if (result?.fullText) {
        directions = result.fullText.split('\n').filter(l => /^\s*\d+\./.test(l)).map(l => l.trim())
      }
    } catch (err) {
      console.error('[responseMerger] Route intent failed:', err)
    }
  }

  // Format distance and duration human-readable
  const distanceKm = route.distance ? route.distance / 1000 : null
  const durationMin = route.duration ? route.duration / 60 : null

  const distanceLabel = distanceKm != null
    ? (distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m`
      : distanceKm < 10 ? `${distanceKm.toFixed(1)} km`
      : `${Math.round(distanceKm)} km`)
    : null

  const durationLabel = durationMin != null
    ? (durationMin < 60 ? `${Math.round(durationMin)} min`
      : `${Math.floor(durationMin / 60)}h ${Math.round(durationMin % 60)}m`)
    : null

  return {
    type: 'route',
    title: `Route: ${route.from?.label || route.from?.name || '?'} → ${route.to?.label || route.to?.name || '?'}`,
    from: route.from?.label || route.from?.name,
    to: route.to?.label || route.to?.name,
    mode: route.mode || 'car',
    distance: distanceLabel,
    duration: durationLabel,
    summary,
    waypoints: enrichedWaypoints.map(wp => ({
      label: wp.label,
      weather: {
        temp: wp.weather?.temp,
        condition: wp.weather?.condition,
        precipitationProb: wp.weather?.precipitationProb,
        wind: wp.weather?.wind,
      },
      narrative: wp.narrative,
    })),
    directions,
    warnings: extractRouteWarnings(enrichedWaypoints),
  }
}

/**
 * Build a plain-language summary of the weather along the route.
 * "Clear at start, rain in the middle, cloudy at destination."
 */
function buildRouteWeatherSummary(waypoints) {
  if (waypoints.length === 0) return ''

  const conditions = waypoints.map(wp => ({
    label: wp.label,
    code: wp.weather?.conditionCode,
    temp: wp.weather?.temp,
    rain: wp.weather?.precipitationProb,
  }))

  const rainCount = conditions.filter(c => (c.rain ?? 0) > 40 || isRainCode(c.code)).length

  if (rainCount === 0) {
    const avgTemp = conditions.reduce((s, c) => s + (c.temp ?? 0), 0) / conditions.length
    return `Consistent weather along the route. Average temperature around ${Math.round(avgTemp)}°C, no significant rain expected.`
  }

  if (rainCount === conditions.length) {
    return `Rain throughout the entire journey. Wet roads, drive carefully.`
  }

  // Find the wet span
  const wetIndices = conditions.map((c, i) => (c.rain ?? 0) > 40 || isRainCode(c.code) ? i : -1).filter(i => i >= 0)
  const firstWet = wetIndices[0]
  const lastWet = wetIndices[wetIndices.length - 1]

  if (firstWet === lastWet) {
    return `Mostly clear with rain around ${conditions[firstWet].label}. Watch for wet roads in that section.`
  }

  return `Rain from ${conditions[firstWet].label} to ${conditions[lastWet].label}. Drive carefully through the wet section.`
}

function isRainCode(code) {
  if (code == null) return false
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95
}

/**
 * Extract any warnings from waypoint narratives or weather extremes.
 */
function extractRouteWarnings(waypoints) {
  const warnings = []
  for (const wp of waypoints) {
    const w = wp.weather
    if (!w) continue
    if (w.wind > 50) warnings.push(`Strong wind at ${wp.label} (${Math.round(w.wind)} km/h)`)
    if (w.visibility != null && w.visibility < 1) warnings.push(`Low visibility at ${wp.label}`)
    if (w.temp > 38) warnings.push(`Extreme heat at ${wp.label}`)
    if (w.temp < -15) warnings.push(`Extreme cold at ${wp.label}`)
    if (w.conditionCode >= 95) warnings.push(`Thunderstorm at ${wp.label}`)
  }
  return [...new Set(warnings)]
}

// ─── MERGE: MULTI-LOCATION ─────────────────────────────────────────────

async function mergeMulti(resolverOut, intents, question) {
  // Treat like a comparison with location type, but allow 3+ sides
  return mergeComparison(
    { ...resolverOut, comparisonType: 'location' },
    intents,
    question
  )
}

// ─── MAIN ENTRY POINT ──────────────────────────────────────────────────

/**
 * Merge resolver output + intent results into a final response object.
 *
 * @param {Object} resolverOut — output of resolveWeatherContext
 * @param {Array} intents — matched intents from detectIntents
 * @param {string} question — original question
 * @returns {Promise<Object>} — unified response object
 */
export async function mergeResponse(resolverOut, intents, question) {
  if (!resolverOut) {
    return {
      verdict: 'Something went wrong.',
      summary: 'I could not figure out what to look up.',
      details: [],
      fullText: '',
    }
  }

  try {
    switch (resolverOut.type) {
      case 'comparison':
        return await mergeComparison(resolverOut, intents, question)
      case 'route':
        return await mergeRoute(resolverOut, intents, question)
      case 'multi':
        return await mergeMulti(resolverOut, intents, question)
      case 'single':
      default:
        return await mergeSingle(resolverOut, intents, question)
    }
  } catch (err) {
    console.error('[responseMerger] merge failed:', err)
    return {
      verdict: 'Unable to merge response',
      summary: 'Something went wrong while assembling the answer.',
      details: [],
      fullText: '',
    }
  }
}

// ─── DEFAULT EXPORT ────────────────────────────────────────────────────

export default {
  mergeResponse,
  isAsyncIntent,
}
