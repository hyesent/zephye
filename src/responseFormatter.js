// ============================================================================
// RESPONSE FORMATTER — One formatter to rule them all
// ============================================================================

const BRAND = 'Zephye'
const BRAND_URL = 'zephye.vercel.app'

const WIDTH = 44
const HEAVY = '═'.repeat(WIDTH)
const LIGHT = '─'.repeat(WIDTH)
const SHORT = '─────'

const LABEL_WIDTH = 20

// ─── TYPE DETECTION ─────────────────────────────────────────────────────

const isStructured = (x) =>
  x && typeof x === 'object' && !Array.isArray(x) &&
  (typeof x.verdict === 'string' || typeof x.summary === 'string' || Array.isArray(x.details))

const isComparison = (x) =>
  x && typeof x === 'object' && x.type === 'comparison' && Array.isArray(x.items) && x.items.length > 0

const isMultiIntent = (x) =>
  x && typeof x === 'object' && Array.isArray(x.sections) && x.sections.length > 0

const isRoute = (x) =>
  x && typeof x === 'object' && x.type === 'route' && Array.isArray(x.waypoints)

const isPlainString = (x) => typeof x === 'string'

// ─── TEXT UTILITIES ─────────────────────────────────────────────────────

function safeStr(v) {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  try { return String(v) } catch { return '' }
}

function padLabel(label, width = LABEL_WIDTH) {
  const s = safeStr(label)
  if (s.length >= width) return s + ' '
  return s + ' '.repeat(width - s.length)
}

// ─── HEADER BUILDER ─────────────────────────────────────────────────────

function buildHeader(context, md) {
  const { location, timeLabel, title } = context || {}
  const lines = []

  if (md) {
    const heading = title ? `## ${BRAND} — ${title}` : `## ${BRAND}`
    lines.push(heading)
  } else {
    lines.push(HEAVY)
    lines.push(title ? `${BRAND.toUpperCase()} — ${title.toUpperCase()}` : BRAND.toUpperCase())
    lines.push(HEAVY)
  }

  const meta = []
  if (location) meta.push(`📍 ${location}`)
  if (timeLabel) meta.push(`🕐 ${timeLabel}`)

  if (meta.length > 0) {
    lines.push('')
    meta.forEach(m => lines.push(m))
  }

  return lines
}

function buildSection(title, body, md) {
  if (!body || (Array.isArray(body) && body.length === 0)) return []

  const lines = []

  if (md) {
    lines.push(`### ${title}`)
    lines.push('')
  } else {
    const pad = Math.max(0, WIDTH - title.length - 5)
    lines.push(`── ${title.toUpperCase()} ${'─'.repeat(pad)}`)
  }

  if (Array.isArray(body)) {
    body.forEach(line => {
      const str = safeStr(line)
      if (str.trim() === '') return
      str.split('\n').forEach(sub => {
        lines.push(md ? sub : `  ${sub}`)
      })
    })
  } else {
    const str = safeStr(body)
    str.split('\n').forEach(line => lines.push(line))
  }

  return lines
}

function buildDetails(details, md) {
  if (!Array.isArray(details) || details.length === 0) return []

  const lines = []

  if (md) {
    lines.push('### Why')
    lines.push('')
    lines.push('| Factor | Value |')
    lines.push('|--------|-------|')
    details.forEach(d => {
      const label = safeStr(d?.label)
      const value = safeStr(d?.value)
      if (!label && !value) return
      lines.push(`| **${label}** | ${value} |`)
    })
  } else {
    const pad = Math.max(0, WIDTH - 8)
    lines.push(`── WHY ${'─'.repeat(pad)}`)
    details.forEach(d => {
      const label = safeStr(d?.label)
      const value = safeStr(d?.value)
      if (!label && !value) return
      lines.push(`  ${padLabel(label)}${value}`)
    })
  }

  return lines
}

function buildFooter(md) {
  if (md) {
    return ['', '---', '', `*via ${BRAND} — ${BRAND_URL}*`]
  }
  return ['', LIGHT, `via ${BRAND} — ${BRAND_URL}`]
}

// ─── FORMAT: SINGLE ────────────────────────────────────────────────────

function formatSingle(data, context, md) {
  if (data == null) return ''

  const lines = []

  lines.push(...buildHeader(context, md))
  lines.push('')

  if (isPlainString(data)) {
    lines.push(data)
    lines.push(...buildFooter(md))
    return lines.join('\n')
  }

  if (typeof data !== 'object') {
    lines.push(safeStr(data))
    lines.push(...buildFooter(md))
    return lines.join('\n')
  }

  if (data.verdict) {
    lines.push(...buildSection('Verdict', data.verdict, md))
    lines.push('')
  }

  if (data.summary) {
    lines.push(...buildSection('Summary', data.summary, md))
    lines.push('')
  }

  if (data.note) {
    lines.push(...buildSection('Note', data.note, md))
    lines.push('')
  }

  if (data.details && data.details.length > 0) {
    lines.push(...buildDetails(data.details, md))
    lines.push('')
  }

  if (data.fullText) {
    lines.push(...buildSection('Full Details', data.fullText, md))
    lines.push('')
  }

  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()

  lines.push(...buildFooter(md))
  return lines.join('\n')
}

// ─── FORMAT: COMPARISON ────────────────────────────────────────────────

function formatComparison(data, context, md) {
  const lines = []

  const title = data.title || 'Comparison'
  lines.push(...buildHeader({ ...context, title }, md))
  lines.push('')

  data.items.forEach((item, i) => {
    const label = item?.label || `Option ${i + 1}`
    const timeLabel = item?.timeLabel
    const content = item?.content

    // Render item header directly (not via buildSection — no body needed)
    if (md) {
      lines.push(`### ${label}`)
      if (timeLabel) lines.push(`*${timeLabel}*`)
      lines.push('')
    } else {
      const pad = Math.max(0, WIDTH - label.length - 5)
      lines.push(`── ${label.toUpperCase()} ${'─'.repeat(pad)}`)
      if (timeLabel) lines.push(`  ${timeLabel}`)
    }

    // Render content
    if (content) {
      if (typeof content === 'string') {
        content.split('\n').forEach(l => lines.push(md ? l : `  ${l}`))
      } else {
        // Structured content — render verdict + summary + details
        if (content.verdict) {
          lines.push(md ? `**${content.verdict}**` : `  ${content.verdict}`)
          lines.push('')
        }
        if (content.summary) {
          content.summary.split('\n').forEach(l => lines.push(md ? l : `  ${l}`))
          lines.push('')
        }
        if (content.details && content.details.length > 0) {
          content.details.forEach(d => {
            const label = safeStr(d?.label)
            const value = safeStr(d?.value)
            if (!label && !value) return
            if (md) lines.push(`- **${label}**: ${value}`)
            else lines.push(`  ${padLabel(label)}${value}`)
          })
          lines.push('')
        }
        if (content.fullText && content.fullText !== content.summary) {
          content.fullText.split('\n').forEach(l => lines.push(md ? l : `  ${l}`))
          lines.push('')
        }
      }
    }

    if (i < data.items.length - 1) {
      lines.push('')
      lines.push(md ? '---' : SHORT)
      lines.push('')
    }
  })

  if (data.takeaway) {
    lines.push('')
    lines.push(...buildSection('Takeaway', data.takeaway, md))
  }

  lines.push(...buildFooter(md))
  return lines.join('\n')
}

// ─── FORMAT: MULTI-INTENT ──────────────────────────────────────────────

function formatMultiIntent(data, context, md) {
  const lines = []

  lines.push(...buildHeader(context, md))
  lines.push('')

  data.sections.forEach((section, i) => {
    const title = section?.title || `Section ${i + 1}`
    const content = section?.content

    if (md) {
      lines.push(`### ${title}`)
      lines.push('')
    } else {
      const pad = Math.max(0, WIDTH - title.length - 5)
      lines.push(`── ${title.toUpperCase()} ${'─'.repeat(pad)}`)
    }

    if (typeof content === 'string') {
      content.split('\n').forEach(l => lines.push(md ? l : `  ${l}`))
    } else if (content) {
      if (content.verdict) {
        lines.push(md ? `**${content.verdict}**` : `  ${content.verdict}`)
        lines.push('')
      }
      if (content.summary) {
        content.summary.split('\n').forEach(l => lines.push(md ? l : `  ${l}`))
      }
      if (content.fullText && content.fullText !== content.summary) {
        lines.push('')
        content.fullText.split('\n').forEach(l => lines.push(md ? l : `  ${l}`))
      }
    }

    if (i < data.sections.length - 1) {
      lines.push('')
      lines.push(md ? '---' : SHORT)
      lines.push('')
    }
  })

  lines.push(...buildFooter(md))
  return lines.join('\n')
}

// ─── FORMAT: ROUTE ─────────────────────────────────────────────────────

function formatRoute(data, context, md) {
  const lines = []

  const title = data.title || `Route: ${data.from || '?'} → ${data.to || '?'}`
  lines.push(...buildHeader({ ...context, title }, md))
  lines.push('')

  const summaryBits = []
  if (data.distance) summaryBits.push(`Distance: ${data.distance}`)
  if (data.duration) summaryBits.push(`Duration: ${data.duration}`)
  if (data.mode) summaryBits.push(`Mode: ${data.mode}`)
  if (summaryBits.length > 0) {
    lines.push(...buildSection('Route Summary', summaryBits, md))
    lines.push('')
  }

  if (data.diagram) {
    lines.push(...buildSection('Weather along the way', [data.diagram], md))
    lines.push('')
  }

  if (data.summary) {
    lines.push(...buildSection('Summary', data.summary, md))
    lines.push('')
  }

  if (data.waypoints && data.waypoints.length > 0) {
    const wpLines = data.waypoints.map(wp => {
      const w = wp.weather || {}
      const bits = []
      if (w.temp != null) bits.push(`${Math.round(w.temp)}°C`)
      if (w.condition) bits.push(w.condition)
      if (w.precipitationProb > 20) bits.push(`${Math.round(w.precipitationProb)}% rain`)
      if (w.wind > 20) bits.push(`wind ${Math.round(w.wind)} km/h`)
      return `${wp.label} — ${bits.join(' · ')}`
    })
    lines.push(...buildSection('Stops', wpLines, md))
    lines.push('')
  }

  if (Array.isArray(data.directions) && data.directions.length > 0) {
    const stepLines = data.directions.map((step, i) => `${i + 1}. ${step}`)
    lines.push(...buildSection(`Directions (${data.directions.length} steps)`, stepLines, md))
    lines.push('')
  }

  if (Array.isArray(data.warnings) && data.warnings.length > 0) {
    lines.push(...buildSection('Warnings', data.warnings, md))
    lines.push('')
  }

  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()

  lines.push(...buildFooter(md))
  return lines.join('\n')
}

// ─── PUBLIC API ─────────────────────────────────────────────────────────

export function formatResponse(data, context = {}) {
  let markdown = ''
  let plainText = ''

  try {
    if (isRoute(data)) {
      markdown = formatRoute(data, context, true)
      plainText = formatRoute(data, context, false)
    } else if (isComparison(data)) {
      markdown = formatComparison(data, context, true)
      plainText = formatComparison(data, context, false)
    } else if (isMultiIntent(data)) {
      markdown = formatMultiIntent(data, context, true)
      plainText = formatMultiIntent(data, context, false)
    } else {
      markdown = formatSingle(data, context, true)
      plainText = formatSingle(data, context, false)
    }
  } catch (err) {
    console.warn('[responseFormatter] format failed:', err)
    const fallback = safeStr(data) || 'Unable to format response.'
    return { markdown: fallback, plainText: fallback }
  }

  return { markdown, plainText }
}

export function formatForCopy(data, context = {}) {
  return formatResponse(data, context).plainText
}

export function formatForMarkdown(data, context = {}) {
  return formatResponse(data, context).markdown
}

export function formatForShare(data, context = {}) {
  return formatResponse(data, context).markdown
}

export function formatForChat(data, context = {}) {
  return formatResponse(data, context).markdown
}

export function formatForImage(data, context = {}) {
  return formatResponse(data, context).plainText
}

export default {
  formatResponse,
  formatForCopy,
  formatForMarkdown,
  formatForShare,
  formatForChat,
  formatForImage,
}
