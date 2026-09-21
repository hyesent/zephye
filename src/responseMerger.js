// ============================================================================
// RESPONSE MERGER — Assembles final response from resolver + intent outputs
// ============================================================================

const ASYNC_INTENTS = new Set([
  'farming', 'stargazing', 'route', 'traffic', 'traveling',
])

export function isAsyncIntent(intentId) {
  return ASYNC_INTENTS.has(intentId)
}

// ─── INTENT RUNNERS ────────────────────────────────────────────────────

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

async function runIntents(intents, bundle, question) {
  if (!Array.isArray(intents) || intents.length === 0) return []
  const promises = intents.map(intent => runIntent(intent, bundle, question))
  const results = await Promise.all(promises)
  return results.filter(Boolean)
}

// ─── CONTENT NORMALIZATION ─────────────────────────────────────────────

function normalizeContent(result) {
  if (result == null) return { kind: 'empty' }

  if (typeof result === 'string') {
    const trimmed = result.trim()
    if (!trimmed) return { kind: 'empty' }
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
    return {
      verdict: 'Here is the weather.',
      summary: `${bundle.temp ?? '--'}°C · ${bundle.condition ?? 'unknown'}`,
      note: '',
      details: [],
      fullText: '',
    }
  }

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

  const summaryParts = runs.map(({ intent, result }) => {
    const n = normalizeContent(result)
    return `${intent.section || intent.name}: ${n.verdict || n.summary?.slice(0, 80) || 'ok'}`
  })

  return {
    verdict: 'Multiple topics covered',
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
        content: { verdict: 'No data', summary: 'Could not fetch weather.', details: [], fullText: '' },
      })
      continue
    }

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

async function mergeSide(runs) {
  if (runs.length === 1) {
    const n = normalizeContent(runs[0].result)
    if (n.kind === 'structured') {
      return { verdict: n.verdict, summary: n.summary, note: n.note, details: n.details, fullText: n.fullText }
    }
    return { verdict: runs[0].intent.section || 'Result', summary: n.summary, details: [], fullText: n.fullText }
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

function buildComparisonTakeaway(enriched, comparisonType) {
  if (enriched.length < 2) return ''

  const extractFromDetails = (content, labelPattern) => {
    if (!content?.details) return null
    const row = content.details.find(d => (d.label || '').toLowerCase().includes(labelPattern))
    if (!row) return null
    const num = parseFloat(String(row.value || '').replace(/[^\d.-]/g, ''))
    return isNaN(num) ? null : num
  }

  const temps = enriched.map(e =>
    extractFromDetails(e.content, 'temperature') ?? extractFromDetails(e.content, 'temp') ?? null
  )
  const rains = enriched.map(e =>
    extractFromDetails(e.content, 'rain') ?? extractFromDetails(e.content, 'precip') ?? null
  )
  const winds = enriched.map(e =>
    extractFromDetails(e.content, 'wind') ?? null
  )

  const parts = []

  const maxTemp = Math.max(...temps.filter(t => t != null))
  if (isFinite(maxTemp)) {
    const warmest = enriched.filter((e, i) => temps[i] === maxTemp).map(e => e.label)
    if (warmest.length === 1) parts.push(`${warmest[0]} is warmest at ${Math.round(maxTemp)}°C`)
  }

  const minRain = Math.min(...rains.filter(r => r != null))
  if (isFinite(minRain)) {
    const driest = enriched.filter((e, i) => rains[i] === minRain).map(e => e.label)
    if (driest.length === 1) parts.push(`${driest[0]} is driest at ${Math.round(minRain)}% rain chance`)
  }

  const minWind = Math.min(...winds.filter(w => w != null))
  if (isFinite(minWind)) {
    const calmest = enriched.filter((e, i) => winds[i] === minWind).map(e => e.label)
    if (calmest.length === 1 && minWind < 20) parts.push(`${calmest[0]} is calmest at ${Math.round(minWind)} km/h wind`)
  }

  if (parts.length === 0) return ''
  return parts.join(' · ') + '.'
}

// ─── ROUTE DIAGRAM HELPERS ─────────────────────────────────────────────

function weatherEmoji(code) {
  if (code == null) return '🌡️'
  if (code === 0) return '☀️'
  if (code === 1) return '🌤️'
  if (code === 2) return '⛅'
  if (code === 3) return '☁️'
  if (code === 45 || code === 48) return '🌫️'
  if (code >= 51 && code <= 57) return '🌦️'
  if (code >= 61 && code <= 67) return '🌧️'
  if (code >= 71 && code <= 77) return '❄️'
  if (code >= 80 && code <= 82) return '🌧️'
  if (code >= 85 && code <= 86) return '❄️'
  if (code >= 95) return '⛈️'
  return '🌡️'
}

function buildRouteDiagram(waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length === 0) return ''

  const parts = []
  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i]
    const label = wp.label || `Point ${i + 1}`
    const code = wp.weather?.conditionCode
    const emoji = weatherEmoji(code)
    const rain = wp.weather?.precipitationProb
    const rainBadge = (rain != null && rain >= 60) ? `${Math.round(rain)}%` : ''
    parts.push(`${label} ${emoji}${rainBadge}`)
  }

  return parts.join(' → ')
}

function buildRouteWaypointBlock(waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length === 0) return ''

  const lines = []
  for (const wp of waypoints) {
    const label = wp.labelMedium || wp.label || 'Point'
    const w = wp.weather || {}
    const temp = w.temp != null ? `${Math.round(w.temp)}°C` : '—'
    const emoji = weatherEmoji(w.conditionCode)
    const rain = w.precipitationProb != null ? `${Math.round(w.precipitationProb)}% rain` : ''
    const wind = (w.wind != null && w.wind > 20) ? `${Math.round(w.wind)} km/h` : ''

    const bits = [temp, w.condition || '', rain, wind].filter(Boolean)
    lines.push(`${emoji} ${label} — ${bits.join(' · ')}`)
  }

  return lines.join('\n')
}

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

// ─── MERGE: ROUTE (with traffic) ───────────────────────────────────────

async function mergeRoute(resolverOut, intents, question) {
  const waypoints = resolverOut.waypoints || []
  const route = resolverOut.route || {}

  const routeIntent = intents.find(i => i.id === 'route')
  const trafficIntent = intents.find(i => i.id === 'traffic')
  // 🔥 other intents now run against the destination bundle, not just waypoints
  const otherIntents = intents.filter(i => i.id !== 'route' && i.id !== 'traffic')

  // ─── Waypoint narratives (weather only per-waypoint) ───────────
  const weatherIntent = intents.find(i => i.id === 'weather')
  const enrichedWaypoints = []
  for (const wp of waypoints) {
    if (!wp.weather) {
      enrichedWaypoints.push({ ...wp, narrative: null })
      continue
    }
    const runs = weatherIntent ? await runIntents([weatherIntent], wp.weather, question) : []
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

  const summary = buildRouteWeatherSummary(enrichedWaypoints)
  const diagram = buildRouteDiagram(enrichedWaypoints)
  const waypointBlock = buildRouteWaypointBlock(enrichedWaypoints)

  // ─── Directions from route intent ──────────────────────────────
  let directions = []
  if (routeIntent && typeof routeIntent.fn === 'function') {
    try {
      const routeData = {
        ...resolverOut.bundle,
        _route: route,
        _waypoints: enrichedWaypoints,
      }
      const result = await routeIntent.fn(routeData, question)
      if (typeof result === 'string') {
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

  // ─── Traffic on route ──────────────────────────────────────────
  let traffic = null
  if (trafficIntent && typeof trafficIntent.fn === 'function') {
    try {
      // FIX: pass the destination as the "current location" so traffic
      // analyzes the actual endpoint, not the raw question text.
      const destBundle = resolverOut.bundle || {}
      const trafficData = {
        ...destBundle,
        city: route.to?.label || route.to?.name || destBundle.city,
        lat: route.to?.lat ?? destBundle.lat,
        lon: route.to?.lon ?? destBundle.lon,
        _route: route,
        _waypoints: waypoints.map(wp => ({
          label: wp.label,
          lat: wp.location?.lat,
          lon: wp.location?.lon,
        })),
        fromLat: route.from?.lat,
        fromLon: route.from?.lon,
        toLat: route.to?.lat,
        toLon: route.to?.lon,
      }
      const trafficResult = await trafficIntent.fn(trafficData, question)
      const normalized = normalizeContent(trafficResult)
      traffic = {
        verdict: normalized.verdict || '',
        summary: normalized.summary || '',
        note: normalized.note || '',
        details: normalized.details || [],
        fullText: normalized.fullText || '',
      }
    } catch (err) {
      console.error('[responseMerger] Traffic intent failed:', err)
    }
  }

  // ─── Other intents (pets, clothing, health, etc.) ──────────────
  // These run against the destination bundle, not the raw waypoints.
  let otherSections = []
  if (otherIntents.length > 0 && resolverOut.bundle) {
    // Give the bundle the destination identity so intents can reference it
    const destBundle = {
      ...resolverOut.bundle,
      city: route.to?.label || route.to?.name || resolverOut.bundle.city,
      lat: route.to?.lat ?? resolverOut.bundle.lat,
      lon: route.to?.lon ?? resolverOut.bundle.lon,
    }
    const runs = await runIntents(otherIntents, destBundle, question)
    otherSections = runs.map(({ intent, result }) => {
      const n = normalizeContent(result)
      return {
        title: intent.section || intent.name || intent.id,
        content: n.kind === 'structured'
          ? { verdict: n.verdict, summary: n.summary, note: n.note, details: n.details, fullText: n.fullText }
          : n.fullText,
      }
    })
  }

  // ─── Formatting ────────────────────────────────────────────────
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

  const routeWarnings = extractRouteWarnings(enrichedWaypoints)
  const trafficWarnings = traffic?.note ? [traffic.note] : []
  const allWarnings = [...routeWarnings, ...trafficWarnings]

  const directionsText = directions.length > 0
    ? directions.map((step, i) => `${i + 1}. ${step}`).join('\n')
    : ''

  // ─── Full text ─────────────────────────────────────────────────
  const fullTextParts = []

  if (distanceLabel || durationLabel) {
    fullTextParts.push(`Route Summary: ${[distanceLabel, durationLabel].filter(Boolean).join(' · ')}`)
    fullTextParts.push('')
  }

  if (diagram) {
    fullTextParts.push('Weather along the way:')
    fullTextParts.push(diagram)
    fullTextParts.push('')
  }

  if (summary) {
    fullTextParts.push(summary)
    fullTextParts.push('')
  }

  if (waypointBlock) {
    fullTextParts.push('Stops:')
    fullTextParts.push(waypointBlock)
    fullTextParts.push('')
  }

  if (traffic?.summary) {
    fullTextParts.push('Traffic:')
    fullTextParts.push(traffic.summary)
    if (traffic.fullText && traffic.fullText !== traffic.summary) {
      fullTextParts.push(traffic.fullText)
    }
    fullTextParts.push('')
  }

  // Append other sections to full text
  otherSections.forEach(s => {
    const c = s.content
    const text = typeof c === 'string' ? c : [c.verdict, c.summary, c.fullText].filter(Boolean).join('\n')
    if (text) {
      fullTextParts.push(`${s.title}:`)
      fullTextParts.push(text)
      fullTextParts.push('')
    }
  })

  if (directionsText) {
    fullTextParts.push(`Directions (${directions.length} steps):`)
    fullTextParts.push(directionsText)
  }

  // ─── Verdict / summary / note for the collapsed bubble ────────
  const verdictLine = `Route: ${route.from?.label || route.from?.name || '?'} → ${route.to?.label || route.to?.name || '?'}`

  const summaryParts = []
  if (diagram) summaryParts.push(diagram)
  if (distanceLabel && durationLabel) summaryParts.push(`${distanceLabel} · ${durationLabel}`)
  if (summary) summaryParts.push(summary)

  const noteParts = []
  if (traffic?.verdict) noteParts.push(traffic.verdict)
  if (allWarnings.length > 0) noteParts.push(allWarnings.join(' · '))

  // Small short summary of other sections for the collapsed view
  const otherSummaries = otherSections.map(s => {
    const c = s.content
    const text = typeof c === 'string' ? c : (c.verdict || c.summary || '')
    return `${s.title}: ${text.slice(0, 80)}`
  })

  return {
    type: 'route',
    title: verdictLine,
    from: route.from?.label || route.from?.name,
    to: route.to?.label || route.to?.name,
    mode: route.mode || 'car',
    distance: distanceLabel,
    duration: durationLabel,
    summary: [...summaryParts, ...otherSummaries].join('. '),
    note: noteParts.join(' · '),
    diagram,
    waypoints: enrichedWaypoints.map(wp => ({
      label: wp.label,
      labelMedium: wp.labelMedium,
      labelFull: wp.labelFull,
      weather: {
        temp: wp.weather?.temp,
        condition: wp.weather?.condition,
        conditionCode: wp.weather?.conditionCode,
        precipitationProb: wp.weather?.precipitationProb,
        wind: wp.weather?.wind,
      },
      narrative: wp.narrative,
    })),
    directions,
    warnings: allWarnings,
    traffic,
    // 🔥 other intents surface here
    sections: otherSections.length > 0 ? otherSections : undefined,
    fullText: fullTextParts.join('\n'),
  }
}

// ─── MERGE: MULTI-LOCATION ─────────────────────────────────────────────

async function mergeMulti(resolverOut, intents, question) {
  return mergeComparison(
    { ...resolverOut, comparisonType: 'location' },
    intents,
    question
  )
}

// ─── MAIN ENTRY POINT ──────────────────────────────────────────────────

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

export default { mergeResponse, isAsyncIntent }
