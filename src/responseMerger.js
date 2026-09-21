// ============================================================================
// RESPONSE MERGER — Assembles final response from resolver + intent outputs
// ============================================================================

import { buildJourneyContext } from './journeyContext.js'
import { findBestDepartureWindows } from './bestTimeAdvisor.js'

const ASYNC_INTENTS = new Set(['farming', 'stargazing', 'route', 'traffic', 'traveling', 'best_time'])

export function isAsyncIntent(intentId) { return ASYNC_INTENTS.has(intentId) }

// ─── RUNNERS ───────────────────────────────────────────────────────────

async function runIntent(intent, bundle, question) {
  if (!intent || typeof intent.fn !== 'function') return null
  try {
    const result = isAsyncIntent(intent.id) ? await intent.fn(bundle, question) : intent.fn(bundle, question)
    return { intent, result }
  } catch (err) {
    console.error(`[responseMerger] Intent ${intent?.id} failed:`, err)
    return null
  }
}

async function runIntents(intents, bundle, question) {
  if (!Array.isArray(intents) || intents.length === 0) return []
  const promises = intents.map(intent => runIntent(intent, bundle, question))
  return (await Promise.all(promises)).filter(Boolean)
}

// ─── NORMALIZE ─────────────────────────────────────────────────────────

function normalizeContent(result) {
  if (result == null) return { kind: 'empty' }
  if (typeof result === 'string') {
    const trimmed = result.trim()
    if (!trimmed) return { kind: 'empty' }
    const lines = trimmed.split('\n')
    return { kind: 'string', verdict: lines[0].slice(0, 140), summary: trimmed, fullText: trimmed, details: [] }
  }
  if (typeof result === 'object') {
    if (result.verdict || result.summary) {
      return {
        kind: 'structured',
        verdict: typeof result.verdict === 'string' ? result.verdict : '',
        summary: typeof result.summary === 'string' ? result.summary : '',
        note: typeof result.note === 'string' ? result.note : '',
        details: Array.isArray(result.details) ? result.details : [],
        fullText: typeof result.fullText === 'string' ? result.fullText : '',
      }
    }
    try {
      const str = JSON.stringify(result).slice(0, 200)
      return { kind: 'string', verdict: str, summary: str, fullText: str, details: [] }
    } catch { return { kind: 'empty' } }
  }
  return { kind: 'empty' }
}

// ─── SINGLE ────────────────────────────────────────────────────────────

async function mergeSingle(resolverOut, intents, question) {
  const bundle = resolverOut.bundle
  if (!bundle) {
    return {
      verdict: "I don't have weather data right now.",
      summary: 'Try again in a moment, or check your connection.',
      note: '', details: [], fullText: '', _empty: true,
    }
  }

  const runs = await runIntents(intents, bundle, question)
  if (runs.length === 0) {
    return { verdict: 'Here is the weather.', summary: `${bundle.temp ?? '--'}°C · ${bundle.condition ?? 'unknown'}`, note: '', details: [], fullText: '' }
  }

  if (runs.length === 1) {
    const { intent, result } = runs[0]
    const normalized = normalizeContent(result)
    if (normalized.kind === 'structured') {
      return { verdict: normalized.verdict, summary: normalized.summary, note: normalized.note, details: normalized.details, fullText: normalized.fullText, _intent: intent.id, _section: intent.section }
    }
    return { verdict: `${intent.section || intent.name || 'Result'}`, summary: normalized.summary, note: '', details: [], fullText: normalized.fullText, _intent: intent.id }
  }

  const sections = runs.map(({ intent, result }) => {
    const n = normalizeContent(result)
    return {
      title: intent.section || intent.name || intent.id,
      content: n.kind === 'structured' ? { verdict: n.verdict, summary: n.summary, note: n.note, details: n.details, fullText: n.fullText } : n.fullText,
    }
  })
  const summaryParts = runs.map(({ intent, result }) => {
    const n = normalizeContent(result)
    return `${intent.section || intent.name}: ${n.verdict || n.summary?.slice(0, 80) || 'ok'}`
  })
  return {
    verdict: 'Multiple topics covered',
    summary: summaryParts.join(' · '),
    note: '', details: [],
    fullText: sections.map(s => {
      const c = s.content
      if (typeof c === 'string') return `${s.title}\n${c}`
      return `${s.title}\n${c.verdict || ''}\n${c.summary || ''}`
    }).join('\n\n---\n\n'),
    sections,
  }
}

// ─── SIDE MERGE ────────────────────────────────────────────────────────

async function mergeSide(runs) {
  if (runs.length === 1) {
    const n = normalizeContent(runs[0].result)
    if (n.kind === 'structured') return { verdict: n.verdict, summary: n.summary, note: n.note, details: n.details, fullText: n.fullText }
    return { verdict: runs[0].intent.section || 'Result', summary: n.summary, details: [], fullText: n.fullText }
  }
  const sections = runs.map(({ intent, result }) => {
    const n = normalizeContent(result)
    return {
      title: intent.section || intent.name || intent.id,
      content: n.kind === 'structured' ? { verdict: n.verdict, summary: n.summary, details: n.details, fullText: n.fullText } : n.fullText,
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

// ─── COMPARISON ────────────────────────────────────────────────────────

async function mergeComparison(resolverOut, intents, question) {
  const items = resolverOut.items || []
  const comparisonType = resolverOut.comparisonType || 'location'

  const enriched = []
  for (const item of items) {
    const bundle = item.bundle
    if (!bundle) {
      enriched.push({
        label: item.label,
        timeLabel: item.timeLabel || null,
        content: { verdict: 'No data', summary: 'Could not fetch weather.', details: [], fullText: '' },
      })
      continue
    }

    bundle.city = item.label
    if (item.location?.lat != null) { bundle.lat = item.location.lat; bundle.lon = item.location.lon }
    const runs = await runIntents(intents, bundle, question)
    const timeLabel = bundle._timeLabel || item.timeLabel || null

    if (runs.length === 0) {
      enriched.push({
        label: item.label,
        timeLabel,
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
    enriched.push({ label: item.label, timeLabel, content: side })
  }

  const takeaway = buildComparisonTakeaway(enriched, comparisonType)
  const titleLabels = enriched.map(e => e.label)
  const title = comparisonType === 'time'
    ? `${titleLabels[0] || 'Time 1'} vs ${titleLabels[1] || 'Time 2'}`
    : titleLabels.join(' · ')

  return {
    type: 'comparison',
    comparisonType,
    title,
    items: enriched,
    takeaway,
    _timeLabel: resolverOut._timeLabel || enriched[0]?.timeLabel || null,
  }
}

// ─── COMPARISON TAKEAWAY ───────────────────────────────────────────────
// Synthesizes a verdict from: (1) numeric weather signals,
// (2) the intent verdicts per side, (3) which side is "best".

function buildComparisonTakeaway(enriched, comparisonType) {
  if (enriched.length < 2) return ''

  // ─── Extract weather numbers from details rows ─────────────
  const extract = (content, pattern) => {
    if (!content?.details) return null
    const row = content.details.find(d => (d.label || '').toLowerCase().includes(pattern))
    if (!row) return null
    const num = parseFloat(String(row.value || '').replace(/[^\d.-]/g, ''))
    return isNaN(num) ? null : num
  }

  const temps = enriched.map(e => extract(e.content, 'temperature') ?? extract(e.content, 'temp') ?? null)
  const rains = enriched.map(e => extract(e.content, 'rain') ?? extract(e.content, 'precip') ?? null)
  const winds = enriched.map(e => extract(e.content, 'wind') ?? null)

  const parts = []

  // ─── Weather extremes ──────────────────────────────────────
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

  // ─── Intent verdict synthesis ──────────────────────────────
  const sideVerdicts = enriched.map(e => {
    const c = e.content
    const verdict = typeof c === 'string' ? c : (c?.verdict || '')
    return { label: e.label, verdict: (verdict || '').trim() }
  }).filter(s => s.verdict.length > 0)

  if (sideVerdicts.length >= 2) {
    const uniqueVerdicts = new Set(sideVerdicts.map(s => s.verdict.toLowerCase().slice(0, 60)))

    if (uniqueVerdicts.size === 1) {
      // Same advice everywhere — no difference to highlight
      parts.push(`Similar across all — ${sideVerdicts[0].verdict.slice(0, 100)}`)
    } else if (uniqueVerdicts.size === sideVerdicts.length) {
      // Every side different — score each and pick a "best"
      const scoreVerdict = (v) => {
        const lower = v.toLowerCase()
        let s = 0
        if (/clear|sunny|mild|comfort|perfect|ideal|excellent|pleasant|nice|great|good|dry/.test(lower)) s += 3
        if (/warm|fair|calm/.test(lower)) s += 2
        if (/rain|storm|heavy|harsh|severe|extreme|dangerous|hazard|thunder|flood/.test(lower)) s -= 3
        if (/cold|hot|humid|windy|wind|damp|wet|muggy|caution/.test(lower)) s -= 1
        return s
      }

      const scored = sideVerdicts.map(v => ({ ...v, score: scoreVerdict(v.verdict) }))
      const best = scored.reduce((a, b) => b.score > a.score ? b : a)
      const worst = scored.reduce((a, b) => b.score < a.score ? b : a)

      if (best.score > worst.score) {
        parts.push(`Best pick: ${best.label} — ${best.verdict.slice(0, 100)}`)
      } else if (parts.length === 0) {
        // No clear best — just list the verdicts compactly
        parts.push(sideVerdicts.map(v => `${v.label}: ${v.verdict.slice(0, 60)}`).join(' · '))
      }
    }
  }

  if (parts.length === 0) return ''
  return parts.join(' · ') + '.'
}

// ─── ROUTE HELPERS ─────────────────────────────────────────────────────

function weatherEmoji(code) {
  if (code == null) return '🌡️'
  if (code === 0) return '☀️'; if (code === 1) return '🌤️'; if (code === 2) return '⛅'; if (code === 3) return '☁️'
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
  return waypoints.map((wp, i) => {
    const label = wp.label || `Point ${i + 1}`
    const emoji = weatherEmoji(wp.weather?.conditionCode)
    const rain = wp.weather?.precipitationProb
    const badge = (rain != null && rain >= 60) ? `${Math.round(rain)}%` : ''
    return `${label} ${emoji}${badge}`
  }).join(' → ')
}

function buildRouteWaypointBlock(waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length === 0) return ''
  return waypoints.map(wp => {
    const label = wp.labelMedium || wp.label || 'Point'
    const w = wp.weather || {}
    const temp = w.temp != null ? `${Math.round(w.temp)}°C` : '—'
    const emoji = weatherEmoji(w.conditionCode)
    const rain = w.precipitationProb != null ? `${Math.round(w.precipitationProb)}% rain` : ''
    const wind = (w.wind != null && w.wind > 20) ? `${Math.round(w.wind)} km/h` : ''
    const bits = [temp, w.condition || '', rain, wind].filter(Boolean)
    return `${emoji} ${label} — ${bits.join(' · ')}`
  }).join('\n')
}

function buildRouteWeatherSummary(waypoints) {
  if (waypoints.length === 0) return ''
  const conditions = waypoints.map(wp => ({ label: wp.label, code: wp.weather?.conditionCode, temp: wp.weather?.temp, rain: wp.weather?.precipitationProb }))
  const rainCount = conditions.filter(c => (c.rain ?? 0) > 40 || isRainCode(c.code)).length
  if (rainCount === 0) {
    const avg = conditions.reduce((s, c) => s + (c.temp ?? 0), 0) / conditions.length
    return `Consistent weather along the route. Average temperature around ${Math.round(avg)}°C, no significant rain expected.`
  }
  if (rainCount === conditions.length) return `Rain throughout the entire journey. Wet roads, drive carefully.`
  const wetIdx = conditions.map((c, i) => (c.rain ?? 0) > 40 || isRainCode(c.code) ? i : -1).filter(i => i >= 0)
  const first = wetIdx[0]; const last = wetIdx[wetIdx.length - 1]
  if (first === last) return `Mostly clear with rain around ${conditions[first].label}. Watch for wet roads in that section.`
  return `Rain from ${conditions[first].label} to ${conditions[last].label}. Drive carefully through the wet section.`
}

function isRainCode(code) { return code != null && ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) }

function extractRouteWarnings(waypoints) {
  const warnings = []
  for (const wp of waypoints) {
    const w = wp.weather; if (!w) continue
    if (w.wind > 50) warnings.push(`Strong wind at ${wp.label} (${Math.round(w.wind)} km/h)`)
    if (w.visibility != null && w.visibility < 1) warnings.push(`Low visibility at ${wp.label}`)
    if (w.temp > 38) warnings.push(`Extreme heat at ${wp.label}`)
    if (w.temp < -15) warnings.push(`Extreme cold at ${wp.label}`)
    if (w.conditionCode >= 95) warnings.push(`Thunderstorm at ${wp.label}`)
  }
  return [...new Set(warnings)]
}

// ─── ROUTE ─────────────────────────────────────────────────────────────

async function mergeRoute(resolverOut, intents, question) {
  const waypoints = resolverOut.waypoints || []
  const route = resolverOut.route || {}

  const routeIntent = intents.find(i => i.id === 'route')
  const bestTimeIntent = intents.find(i => i.id === 'best_time')
  const trafficIntent = intents.find(i => i.id === 'traffic')
  const weatherIntent = intents.find(i => i.id === 'weather')
  const otherIntents = intents.filter(i => i.id !== 'route' && i.id !== 'best_time' && i.id !== 'traffic' && i.id !== 'weather')

  const enrichedWaypoints = []
  for (const wp of waypoints) {
    if (!wp.weather) { enrichedWaypoints.push({ ...wp, narrative: null }); continue }
    const runs = weatherIntent ? await runIntents([weatherIntent], wp.weather, question) : []
    const narrative = runs.length > 0 ? await mergeSide(runs) : { verdict: `${wp.weather.temp ?? '--'}°C · ${wp.weather.condition ?? 'unknown'}`, summary: '', details: [], fullText: '' }
    enrichedWaypoints.push({ ...wp, narrative })
  }

  const journey = buildJourneyContext({ route, waypoints: enrichedWaypoints })
  const summary = buildRouteWeatherSummary(enrichedWaypoints)
  const diagram = buildRouteDiagram(enrichedWaypoints)
  const waypointBlock = buildRouteWaypointBlock(enrichedWaypoints)

  let directions = []
  if (routeIntent && typeof routeIntent.fn === 'function') {
    try {
      const result = await routeIntent.fn({ ...resolverOut.bundle, _route: route, _waypoints: enrichedWaypoints, _journey: journey }, question)
      if (typeof result === 'string') directions = result.split('\n').filter(l => /^\s*\d+\./.test(l)).map(l => l.trim())
      else if (result?.directions) directions = result.directions
      else if (result?.fullText) directions = result.fullText.split('\n').filter(l => /^\s*\d+\./.test(l)).map(l => l.trim())
    } catch (err) { console.error('[responseMerger] Route intent failed:', err) }
  }

  let bestTime = null
  if (bestTimeIntent) {
    try {
      const result = findBestDepartureWindows(route, enrichedWaypoints, { searchHours: 12 })
      if (result?.bestWindow) bestTime = result
    } catch (err) { console.error('[responseMerger] BestTime failed:', err) }
  }

  let traffic = null
  if (trafficIntent && typeof trafficIntent.fn === 'function') {
    try {
      const destBundle = resolverOut.bundle || {}
      const trafficResult = await trafficIntent.fn({
        ...destBundle,
        city: route.to?.label || route.to?.name || destBundle.city,
        lat: route.to?.lat ?? destBundle.lat,
        lon: route.to?.lon ?? destBundle.lon,
        _route: route, _journey: journey,
        _waypoints: waypoints.map(wp => ({ label: wp.label, lat: wp.location?.lat, lon: wp.location?.lon })),
        fromLat: route.from?.lat, fromLon: route.from?.lon,
        toLat: route.to?.lat, toLon: route.to?.lon,
      }, question)
      const normalized = normalizeContent(trafficResult)
      traffic = { verdict: normalized.verdict || '', summary: normalized.summary || '', note: normalized.note || '', details: normalized.details || [], fullText: normalized.fullText || '' }
    } catch (err) { console.error('[responseMerger] Traffic intent failed:', err) }
  }

  let otherSections = []
  if (otherIntents.length > 0 && resolverOut.bundle) {
    const destBundle = {
      ...resolverOut.bundle,
      city: route.to?.label || route.to?.name || resolverOut.bundle.city,
      lat: route.to?.lat ?? resolverOut.bundle.lat,
      lon: route.to?.lon ?? resolverOut.bundle.lon,
      _journey: journey,
    }
    const runs = await runIntents(otherIntents, destBundle, question)
    otherSections = runs.map(({ intent, result }) => {
      const n = normalizeContent(result)
      return {
        title: intent.section || intent.name || intent.id,
        content: n.kind === 'structured' ? { verdict: n.verdict, summary: n.summary, note: n.note, details: n.details, fullText: n.fullText } : n.fullText,
      }
    })
  }

  const distanceKm = route.distance ? route.distance / 1000 : null
  const durationMin = route.duration ? route.duration / 60 : null
  const distanceLabel = distanceKm != null ? (distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : distanceKm < 10 ? `${distanceKm.toFixed(1)} km` : `${Math.round(distanceKm)} km`) : null
  const durationLabel = durationMin != null ? (durationMin < 60 ? `${Math.round(durationMin)} min` : `${Math.floor(durationMin / 60)}h ${Math.round(durationMin % 60)}m`) : null

  const routeWarnings = extractRouteWarnings(enrichedWaypoints)
  const trafficWarnings = traffic?.note ? [traffic.note] : []
  const allWarnings = [...routeWarnings, ...trafficWarnings]
  const directionsText = directions.length > 0 ? directions.map((step, i) => `${i + 1}. ${step}`).join('\n') : ''

  const fullTextParts = []
  if (diagram) { fullTextParts.push('Weather along the way:'); fullTextParts.push(diagram); fullTextParts.push('') }
  if (summary) { fullTextParts.push(summary); fullTextParts.push('') }
  if (waypointBlock) { fullTextParts.push('Stops:'); fullTextParts.push(waypointBlock); fullTextParts.push('') }
  if (bestTime?.bestWindow) {
    fullTextParts.push('Best time to leave:')
    fullTextParts.push(`${bestTime.bestWindow.start} – ${bestTime.bestWindow.end}`)
    if (bestTime.reason) fullTextParts.push(bestTime.reason)
    fullTextParts.push('')
  }
  if (traffic?.summary) {
    fullTextParts.push('Traffic:'); fullTextParts.push(traffic.summary)
    if (traffic.fullText && traffic.fullText !== traffic.summary) fullTextParts.push(traffic.fullText)
    fullTextParts.push('')
  }
  otherSections.forEach(s => {
    const c = s.content
    const text = typeof c === 'string' ? c : [c.verdict, c.summary, c.fullText].filter(Boolean).join('\n')
    if (text) { fullTextParts.push(`${s.title}:`); fullTextParts.push(text); fullTextParts.push('') }
  })
  if (directionsText) { fullTextParts.push(`Directions (${directions.length} steps):`); fullTextParts.push(directionsText) }

  const fromLabel = route.from?.label || route.from?.name || '?'
  const toLabel = route.to?.label || route.to?.name || '?'
  const verdictLine = `Route: ${fromLabel} → ${toLabel}`

  const bubbleParts = []
  if (distanceLabel && durationLabel) bubbleParts.push(`${distanceLabel} · ${durationLabel}`)
  if (summary) bubbleParts.push(summary)
  const otherSummaries = otherSections.map(s => {
    const c = s.content
    return (typeof c === 'string' ? c : (c.verdict || c.summary || '')).slice(0, 200)
  })

  const noteParts = []
  if (bestTime?.bestWindow) noteParts.push(`Best time: ${bestTime.bestWindow.start} – ${bestTime.bestWindow.end}`)
  if (traffic?.verdict) noteParts.push(traffic.verdict)
  if (allWarnings.length > 0) noteParts.push(allWarnings.join(' · '))

  return {
    type: 'route',
    title: verdictLine,
    from: fromLabel, to: toLabel, mode: route.mode || 'car',
    distance: distanceLabel, duration: durationLabel,
    summary: [...bubbleParts, ...otherSummaries].join(' '),
    note: noteParts.join(' · '),
    diagram, bestTime,
    waypoints: enrichedWaypoints.map(wp => ({
      label: wp.label, labelMedium: wp.labelMedium, labelFull: wp.labelFull,
      weather: { temp: wp.weather?.temp, condition: wp.weather?.condition, conditionCode: wp.weather?.conditionCode, precipitationProb: wp.weather?.precipitationProb, wind: wp.weather?.wind },
      narrative: wp.narrative,
    })),
    directions, warnings: allWarnings, traffic, journey,
    sections: otherSections.length > 0 ? otherSections : undefined,
    fullText: fullTextParts.join('\n'),
    _timeLabel: resolverOut.bundle?._timeLabel || null,
  }
}

// ─── ROUTE COMPARISON ──────────────────────────────────────────────────

function modeToLabel(mode) {
  const map = { car:'Drive', driving:'Drive', hgv:'Truck', truck:'Truck', walk:'Walk', walking:'Walk', foot:'Walk', hike:'Hike', hiking:'Hike', cycle:'Cycle', cycling:'Cycle', bike:'Cycle', bicycle:'Cycle', roadbike:'Road Bike', mtb:'MTB', ebike:'E-Bike', wheelchair:'Wheelchair' }
  return map[mode] || mode
}
function modeToEmoji(mode) {
  const map = { car:'🚗', driving:'🚗', hgv:'🚚', truck:'🚚', walk:'🚶', walking:'🚶', foot:'🚶', hike:'🥾', hiking:'🥾', cycle:'🚴', cycling:'🚴', bike:'🚴', bicycle:'🚴', roadbike:'🚴', mtb:'🚵', ebike:'⚡', wheelchair:'♿' }
  return map[mode] || '🚗'
}

async function mergeRouteComparison(resolverOut, intents, question) {
  const legs = resolverOut.legs || []
  if (legs.length < 2) {
    const first = legs[0]
    if (!first) return { verdict: 'Could not compare routes', summary: 'No route data available.', details: [], fullText: '' }
    return mergeRoute({ type: 'route', bundle: first.waypoints[first.waypoints.length - 1]?.weather, route: first.route, waypoints: first.waypoints, context: resolverOut.context }, intents, question)
  }

  const weatherIntent = intents.find(i => i.id === 'weather')
  const sides = []
  for (const leg of legs) {
    const { mode, route, waypoints } = leg
    const enriched = []
    for (const wp of waypoints) {
      if (!wp.weather) { enriched.push({ ...wp, narrative: null }); continue }
      const runs = weatherIntent ? await runIntents([weatherIntent], wp.weather, question) : []
      enriched.push({ ...wp, narrative: runs.length > 0 ? await mergeSide(runs) : null })
    }
    const journey = buildJourneyContext({ route, waypoints: enriched })
    const weatherNarrative = buildRouteWeatherSummary(enriched)
    const diagram = buildRouteDiagram(enriched)
    const distanceKm = route.distance ? route.distance / 1000 : null
    const durationMin = route.duration ? route.duration / 60 : null
    const distanceLabel = distanceKm != null ? (distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : distanceKm < 10 ? `${distanceKm.toFixed(1)} km` : `${Math.round(distanceKm)} km`) : null
    const durationLabel = durationMin != null ? (durationMin < 60 ? `${Math.round(durationMin)} min` : `${Math.floor(durationMin / 60)}h ${Math.round(durationMin % 60)}m`) : null
    sides.push({ mode, modeLabel: modeToLabel(mode), modeEmoji: modeToEmoji(mode), distanceLabel, durationLabel, distanceKm, durationMin, diagram, weatherNarrative, journey, waypoints: enriched, route })
  }

  const takeaway = buildModeTakeaway(sides)
  const fromLabel = sides[0]?.route?.from?.label || sides[0]?.route?.from?.name || '?'
  const toLabel = sides[0]?.route?.to?.label || sides[0]?.route?.to?.name || '?'
  const title = `${fromLabel} → ${toLabel}`

  const fullTextParts = []
  for (const side of sides) {
    fullTextParts.push(`${side.modeEmoji} ${side.modeLabel.toUpperCase()}`)
    const meta = [side.distanceLabel, side.durationLabel].filter(Boolean).join(' · ')
    if (meta) fullTextParts.push(meta)
    if (side.diagram) fullTextParts.push(side.diagram)
    if (side.weatherNarrative) fullTextParts.push(side.weatherNarrative)
    fullTextParts.push('')
  }
  if (takeaway) { fullTextParts.push('Recommendation:'); fullTextParts.push(takeaway) }

  const details = sides.map(side => {
    const bits = []
    if (side.distanceLabel) bits.push(side.distanceLabel)
    if (side.durationLabel) bits.push(side.durationLabel)
    if (side.weatherNarrative) bits.push(side.weatherNarrative.slice(0, 80))
    return { label: `${side.modeEmoji} ${side.modeLabel}`, value: bits.join(' · ') }
  })

  const summaryBits = sides.map(s => {
    const parts = []
    if (s.durationLabel) parts.push(s.durationLabel)
    if (s.journey?.hasRain) parts.push('rain')
    return `${s.modeEmoji} ${parts.join(' · ')}`
  })

  return {
    type: 'comparison', comparisonType: 'mode', title,
    items: sides.map(side => ({
      label: `${side.modeEmoji} ${side.modeLabel}`,
      timeLabel: null,
      content: {
        verdict: [side.distanceLabel, side.durationLabel].filter(Boolean).join(' · '),
        summary: side.weatherNarrative || '',
        details: [], fullText: '',
      },
    })),
    takeaway,
    summary: summaryBits.join('  vs  '),
    details,
    fullText: fullTextParts.join('\n'),
    _modeSides: sides,
  }
}

function buildModeTakeaway(sides) {
  if (sides.length < 2) return ''
  const withDuration = sides.filter(s => s.durationMin != null)
  const withRain = sides.filter(s => s.journey?.hasRain)
  const parts = []
  if (withDuration.length >= 2) {
    const sorted = [...withDuration].sort((a, b) => a.durationMin - b.durationMin)
    const diff = Math.round(sorted[sorted.length - 1].durationMin - sorted[0].durationMin)
    if (diff >= 5) parts.push(`${sorted[0].modeLabel} is fastest by ${diff} min`)
    else if (diff > 0) parts.push('Both modes take about the same time')
  }
  if (withRain.length === 0) parts.push('no rain either way')
  else if (withRain.length === sides.length) parts.push('both routes have rain')
  else {
    const dry = sides.filter(s => !s.journey?.hasRain).map(s => s.modeLabel)
    parts.push(`${dry.join(' and ')} would be drier`)
  }
  if (parts.length === 0) return ''
  return parts.join(' · ') + '.'
}

// ─── MULTI ─────────────────────────────────────────────────────────────

async function mergeMulti(resolverOut, intents, question) {
  return mergeComparison({ ...resolverOut, comparisonType: 'location' }, intents, question)
}

// ─── MAIN ──────────────────────────────────────────────────────────────

export async function mergeResponse(resolverOut, intents, question) {
  if (!resolverOut) return { verdict: 'Something went wrong.', summary: 'I could not figure out what to look up.', details: [], fullText: '' }
  try {
    switch (resolverOut.type) {
      case 'comparison': return await mergeComparison(resolverOut, intents, question)
      case 'route_comparison': return await mergeRouteComparison(resolverOut, intents, question)
      case 'route': return await mergeRoute(resolverOut, intents, question)
      case 'multi': return await mergeMulti(resolverOut, intents, question)
      case 'single':
      default: return await mergeSingle(resolverOut, intents, question)
    }
  } catch (err) {
    console.error('[responseMerger] merge failed:', err)
    return { verdict: 'Unable to merge response', summary: 'Something went wrong while assembling the answer.', details: [], fullText: '' }
  }
}

export default { mergeResponse, isAsyncIntent }
