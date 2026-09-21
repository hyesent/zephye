// ============================================================================
// FLIGHT DELAY ADVICE — Intent wrapper around assessFlightDelay()
//
// Takes the standard intent signature (data, question) and produces a
// structured response. Delegates the actual scoring to assessFlightDelay().
// ============================================================================

import { assessFlightDelay } from './FlightDelay.js'

/**
 * Intent handler for flight delay questions.
 *
 * Expected questions:
 *   - "will my 3pm flight be delayed"
 *   - "is my flight tomorrow going to be delayed"
 *   - "flight delay risk today"
 *   - "should I worry about my flight"
 */
export function getFlightDelayAdvice(data, question = '') {
  if (!data) {
    return {
      verdict: 'No flight data',
      summary: 'I need weather data for the origin airport to assess delay risk.',
      note: '',
      details: [],
      fullText: '',
    }
  }

  const q = (question || '').toLowerCase()
  let targetDate = new Date()

  // ─── Extract departure hour from question ────────────────────────
  const hourMatch = q.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i)
  if (hourMatch) {
    let hour = parseInt(hourMatch[1], 10)
    const minute = parseInt(hourMatch[2], 10) || 0
    const ampm = hourMatch[3]?.toLowerCase()
    if (ampm === 'pm' && hour < 12) hour += 12
    if (ampm === 'am' && hour === 12) hour = 0
    if (hour >= 0 && hour <= 23) {
      targetDate.setHours(hour, minute, 0, 0)
    }
  }

  // ─── Shift day if tomorrow ───────────────────────────────────────
  if (/\btomorrow\b/i.test(q)) {
    targetDate.setDate(targetDate.getDate() + 1)
  } else if (/\bnext week\b/i.test(q)) {
    targetDate.setDate(targetDate.getDate() + 7)
  }

  // ─── Push to future if it's already passed ───────────────────────
  if (targetDate.getTime() < Date.now() && hourMatch) {
    targetDate.setDate(targetDate.getDate() + 1)
  }

  // ─── Run assessment (origin only; destination unknown from single bundle)
  const assessment = assessFlightDelay(data, null, targetDate)

  const riskEmoji = {
    low: '✅',
    moderate: '⚠️',
    high: '🔴',
    severe: '🛑',
    unknown: '❓',
  }[assessment.risk] || '❓'

  const riskLabel = {
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    severe: 'Severe',
    unknown: 'Unknown',
  }[assessment.risk] || 'Unknown'

  // ─── Build details rows ──────────────────────────────────────────
  const details = []

  if (assessment.origin?.score != null) {
    details.push({
      label: 'Origin risk',
      value: `${Math.round(assessment.origin.score)}/100`,
    })
  }
  if (assessment.origin?.factors?.length > 0) {
    details.push({
      label: 'Origin factors',
      value: assessment.origin.factors.join(', '),
    })
  }
  if (assessment.origin?.time) {
    try {
      const t = new Date(assessment.origin.time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      details.push({ label: 'Checked at', value: t })
    } catch {}
  }

  return {
    verdict: `${riskEmoji} ${riskLabel} delay risk`,
    summary: assessment.summary,
    note: assessment.caveat,
    details,
    fullText: `${assessment.summary}\n\nNote: ${assessment.caveat}`,
  }
}

export default getFlightDelayAdvice
