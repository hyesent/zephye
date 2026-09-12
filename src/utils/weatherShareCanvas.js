// ============================================================================
// WEATHER SHARE CANVAS — SURGICAL TUNING
// Atmospheric radial gradient, per-theme SVG opacity, modern typography
// ============================================================================

import { getWeatherTheme, getSVGArt, isNightTime } from '../data/weatherGradients'
import {
  calculateTodayHighlights,
  calculateWeeklySummary,
  getHourlySlice,
  getSingleHourData,
  codeToEmoji,
  codeToName
} from './weatherHighlights'

const CANVAS_SIZE = 1080
const PADDING = 60
const FOOTER_TEXT = '✦ Zephye · zephye.vercel.app'

// ─── Modern font stacks ────────────────────────────────────────────────
const FONT_DISPLAY = '"SF Pro Display", "Inter", "Helvetica Neue", system-ui, -apple-system, sans-serif'
const FONT_BODY = '"Inter", "SF Pro Text", "Helvetica Neue", system-ui, -apple-system, sans-serif'

// ─── Load SVG string as image ──────────────────────────────────────────
const svgToImage = (svgString) => {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

// ─── Atmospheric radial gradient (surgical geometry) ───────────────────
const drawGradient = (ctx, colors, options = {}) => {
  const {
    glowX = 0.25,
    glowY = 0.18,
    outerX = 0.58,
    outerY = 0.52,
    outerRadius = 1.05
  } = options

  // 1. Deep base — fill with darkest tone
  const deepTone = colors[colors.length - 1] || '#000000'
  ctx.fillStyle = deepTone
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  // 2. Atmospheric radial glow — anchored behind upper visual region
  const cx = CANVAS_SIZE * glowX
  const cy = CANVAS_SIZE * glowY
  const cxOuter = CANVAS_SIZE * outerX
  const cyOuter = CANVAS_SIZE * outerY
  const rOuter = CANVAS_SIZE * outerRadius

  const radialGrad = ctx.createRadialGradient(cx, cy, 0, cxOuter, cyOuter, rOuter)
  radialGrad.addColorStop(0, colors[0] + 'FF')
  radialGrad.addColorStop(0.35, colors[0] + 'CC')
  radialGrad.addColorStop(0.65, colors[1] + '88')
  radialGrad.addColorStop(1, colors[2] + '00')

  ctx.fillStyle = radialGrad
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  // 3. Subtle directional depth
  const linearGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE)
  linearGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)')
  linearGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)')
  linearGrad.addColorStop(1, 'rgba(0, 0, 0, 0.18)')
  ctx.fillStyle = linearGrad
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  // 4. Corner vignette for premium depth
  const vignette = ctx.createRadialGradient(
    CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE * 0.35,
    CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE * 0.85
  )
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.32)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
}

// ─── Soft SVG blend with screen mode ───────────────────────────────────
// Uses per-theme opacity — never bakes in a fixed value
const drawSVGArt = async (ctx, svgType, opacity = 0.3) => {
  try {
    const svgString = getSVGArt(svgType, CANVAS_SIZE, CANVAS_SIZE)
    const img = await svgToImage(svgString)

    ctx.save()
    ctx.globalAlpha = opacity
    ctx.globalCompositeOperation = 'screen'
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.restore()
  } catch (err) {
    console.warn('SVG art draw failed:', err)
  }
}

// ─── Soft inner ring (no gold border) ──────────────────────────────────
const drawBorder = (ctx, accentColor = '#ffffff') => {
  const p = PADDING * 0.5
  const radius = 24
  const w = CANVAS_SIZE - p * 2
  const h = CANVAS_SIZE - p * 2

  ctx.save()
  ctx.strokeStyle = accentColor + '22'
  ctx.lineWidth = 1.5
  roundRect(ctx, p, p, w, h, radius)
  ctx.stroke()
  ctx.restore()
}

// ─── Footer ────────────────────────────────────────────────────────────
const drawFooter = (ctx, accentColor = '#38bdf8') => {
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.font = `500 26px ${FONT_BODY}`
  ctx.fillStyle = accentColor
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 16
  ctx.fillText(FOOTER_TEXT, CANVAS_SIZE / 2, CANVAS_SIZE - PADDING)
  ctx.restore()
}

// ─── Modern text helper with soft shadow ───────────────────────────────
const drawShadowedText = (ctx, text, x, y, options = {}) => {
  ctx.save()
  ctx.textAlign = options.align || 'center'
  ctx.textBaseline = options.baseline || 'middle'
  ctx.font = options.font || `400 32px ${FONT_BODY}`
  ctx.fillStyle = options.color || '#FFFFFF'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 2
  ctx.fillText(text, x, y)
  ctx.restore()
}

// ─── Clean text helper (no shadow, for secondary info) ─────────────────
const drawCleanText = (ctx, text, x, y, options = {}) => {
  ctx.save()
  ctx.textAlign = options.align || 'center'
  ctx.textBaseline = options.baseline || 'middle'
  ctx.font = options.font || `400 22px ${FONT_BODY}`
  ctx.fillStyle = options.color || 'rgba(255, 255, 255, 0.7)'
  ctx.fillText(text, x, y)
  ctx.restore()
}

// ============================================================================
// CARD TYPE 1 — CURRENT WEATHER
// ============================================================================
export const generateCurrentCard = async (weather, location, aqi) => {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = canvas.getContext('2d')

  const code = weather?.current?.weather_code ?? 0
  const now = new Date()
  const sunrise = weather?.daily?.sunrise?.[0]
  const sunset = weather?.daily?.sunset?.[0]
  const night = isNightTime(now, sunrise, sunset)

  const theme = getWeatherTheme(code, night)

  // Atmospheric gradient
  drawGradient(ctx, theme.gradient, {
    glowX: 0.25,
    glowY: night ? 0.16 : 0.18,
    outerX: 0.58,
    outerY: 0.52,
    outerRadius: 1.05
  })

  // Soft SVG art — per-theme opacity
  await drawSVGArt(ctx, theme.svg, theme.svgOpacity)

  drawBorder(ctx, theme.accent)

  // Data
  const temp = Math.round(weather?.current?.temperature_2m ?? 0)
  const feels = Math.round(weather?.current?.apparent_temperature ?? temp)
  const wind = Math.round(weather?.current?.wind_speed_10m ?? 0)
  const humidity = weather?.current?.relative_humidity_2m ?? 0
  const uv = weather?.daily?.uv_index_max?.[0] ?? 0
  const aqiVal = aqi?.us_aqi
  const aqiLabel = aqiVal == null ? 'Unknown'
    : aqiVal <= 50 ? 'Good'
    : aqiVal <= 100 ? 'Moderate'
    : aqiVal <= 150 ? 'Unhealthy'
    : 'Hazardous'
  const condition = codeToName(code)
  const locationName = location?.name?.split(',')[0] || 'Unknown'

  // ─── Hero temperature ───────────────────────────────────────────────
  drawShadowedText(ctx, `${temp}°`, CANVAS_SIZE / 2, 420, {
    font: `500 240px ${FONT_DISPLAY}`,
    color: '#FFFFFF'
  })

  // ─── Condition ──────────────────────────────────────────────────────
  drawShadowedText(ctx, condition, CANVAS_SIZE / 2, 570, {
    font: `400 44px ${FONT_BODY}`,
    color: theme.accent
  })

  // ─── Location ───────────────────────────────────────────────────────
  drawCleanText(ctx, locationName, CANVAS_SIZE / 2, 640, {
    font: `400 34px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.9)'
  })

  // ─── Feels + AQI ────────────────────────────────────────────────────
  drawCleanText(ctx, `Feels ${feels}°  ·  AQI ${aqiVal ?? '--'} ${aqiLabel}`, CANVAS_SIZE / 2, 710, {
    font: `400 24px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.65)'
  })

  // ─── Metrics row ────────────────────────────────────────────────────
  const metricsY = 780
  const metricSpacing = CANVAS_SIZE / 4

  const metrics = [
    { icon: '💨', value: `${wind} km/h` },
    { icon: '💧', value: `${humidity}%` },
    { icon: '☀️', value: `UV ${uv}` }
  ]

  metrics.forEach((m, i) => {
    const x = metricSpacing * (i + 1)
    drawCleanText(ctx, `${m.icon}  ${m.value}`, x, metricsY, {
      font: `500 22px ${FONT_BODY}`,
      color: 'rgba(255, 255, 255, 0.8)'
    })
  })

  // ─── Timestamp ──────────────────────────────────────────────────────
  const timeStr = now.toLocaleString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  })
  drawCleanText(ctx, timeStr, CANVAS_SIZE / 2, 860, {
    font: `400 20px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.4)'
  })

  drawFooter(ctx, theme.accent)

  return canvas.toDataURL('image/png', 1.0)
}

// ============================================================================
// CARD TYPE 2 — TODAY SUMMARY
// ============================================================================
export const generateTodayCard = async (weather, location, todayStats, aqi) => {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = canvas.getContext('2d')

  const highlights = calculateTodayHighlights(
    weather?.hourly, weather?.daily, todayStats, aqi
  )

  const now = new Date()
  const sunrise = weather?.daily?.sunrise?.[0]
  const sunset = weather?.daily?.sunset?.[0]
  const night = isNightTime(now, sunrise, sunset)
  const theme = getWeatherTheme(highlights.dominantCode, night)

  drawGradient(ctx, theme.gradient, {
    glowX: 0.25, glowY: 0.18, outerX: 0.58, outerY: 0.52, outerRadius: 1.05
  })
  await drawSVGArt(ctx, theme.svg, theme.svgOpacity)
  drawBorder(ctx, theme.accent)

  const locationName = location?.name?.split(',')[0] || 'Unknown'
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  // ─── Header ─────────────────────────────────────────────────────────
  drawShadowedText(ctx, `TODAY IN ${locationName.toUpperCase()}`, CANVAS_SIZE / 2, 130, {
    font: `600 40px ${FONT_DISPLAY}`
  })

  drawCleanText(ctx, dateStr, CANVAS_SIZE / 2, 185, {
    font: `400 26px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.6)'
  })

  // ─── Emoji ──────────────────────────────────────────────────────────
  drawShadowedText(ctx, codeToEmoji(highlights.dominantCode), CANVAS_SIZE / 2, 300, {
    font: `120px ${FONT_DISPLAY}`
  })

  // ─── High / Low ─────────────────────────────────────────────────────
  drawShadowedText(ctx, `${highlights.high}°  /  ${highlights.low}°`, CANVAS_SIZE / 2, 420, {
    font: `500 56px ${FONT_DISPLAY}`
  })

  drawCleanText(ctx, 'High / Low', CANVAS_SIZE / 2, 465, {
    font: `400 20px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.45)'
  })

  // ─── Detail panel ───────────────────────────────────────────────────
  const boxX = PADDING * 2
  const boxY = 520
  const boxW = CANVAS_SIZE - boxX * 2
  const boxH = 380

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.lineWidth = 1
  roundRect(ctx, boxX, boxY, boxW, boxH, 24)
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  const rows = [
    ['☀️  Sunshine', `${highlights.sunHours}h`],
    ['🌧️  Rain', `${highlights.rainHours}h`],
    ['⛈️  Thunder', `${highlights.thunderHours}h`],
    ['💨  Max wind', `${highlights.maxWind} km/h`],
    ['💧  Humidity', `${highlights.maxHumidity}%`],
    ['☀️  UV Peak', `${highlights.uvPeak}`],
    ['🌅  Sunrise', highlights.sunrise],
    ['🌇  Sunset', highlights.sunset]
  ]

  const rowStartY = boxY + 55
  const rowGap = 42

  rows.forEach((row, i) => {
    const y = rowStartY + i * rowGap

    drawCleanText(ctx, row[0], boxX + 40, y, {
      align: 'left',
      font: `400 24px ${FONT_BODY}`,
      color: 'rgba(255, 255, 255, 0.75)'
    })

    drawCleanText(ctx, row[1], boxX + boxW - 40, y, {
      align: 'right',
      font: `600 24px ${FONT_BODY}`,
      color: theme.accent
    })
  })

  drawFooter(ctx, theme.accent)

  return canvas.toDataURL('image/png', 1.0)
}

// ============================================================================
// CARD TYPE 3 — BULK HOURLY (12 HOURS)
// ============================================================================
export const generateHourlyCard = async (weather, location) => {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = canvas.getContext('2d')

  const code = weather?.current?.weather_code ?? 0
  const now = new Date()
  const sunrise = weather?.daily?.sunrise?.[0]
  const sunset = weather?.daily?.sunset?.[0]
  const night = isNightTime(now, sunrise, sunset)
  const theme = getWeatherTheme(code, night)

  drawGradient(ctx, theme.gradient, {
    glowX: 0.25, glowY: night ? 0.16 : 0.18, outerX: 0.58, outerY: 0.52, outerRadius: 1.05
  })
  await drawSVGArt(ctx, theme.svg, theme.svgOpacity)
  drawBorder(ctx, theme.accent)

  const hours = getHourlySlice(weather?.hourly, 12)
  const locationName = location?.name?.split(',')[0] || 'Unknown'

  drawShadowedText(ctx, 'NEXT 12 HOURS', CANVAS_SIZE / 2, 120, {
    font: `600 46px ${FONT_DISPLAY}`
  })

  drawCleanText(ctx, locationName, CANVAS_SIZE / 2, 180, {
    font: `400 26px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.55)'
  })

  // Grid
  const gridStartY = 260
  const cellW = 150
  const cellH = 240
  const gapX = 12
  const gapY = 30
  const totalW = 6 * cellW + 5 * gapX
  const gridStartX = (CANVAS_SIZE - totalW) / 2

  hours.forEach((hour, i) => {
    const row = Math.floor(i / 6)
    const col = i % 6
    const x = gridStartX + col * (cellW + gapX)
    const y = gridStartY + row * (cellH + gapY)

    ctx.save()
    ctx.fillStyle = hour.isNow ? 'rgba(56, 189, 248, 0.15)' : 'rgba(0, 0, 0, 0.22)'
    ctx.strokeStyle = hour.isNow ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.06)'
    ctx.lineWidth = 1
    roundRect(ctx, x, y, cellW, cellH, 18)
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    drawCleanText(ctx, hour.hourLabel, x + cellW / 2, y + 32, {
      font: `600 20px ${FONT_BODY}`,
      color: hour.isNow ? theme.accent : 'rgba(255, 255, 255, 0.9)'
    })

    drawShadowedText(ctx, codeToEmoji(hour.code), x + cellW / 2, y + 105, {
      font: `54px ${FONT_DISPLAY}`
    })

    drawShadowedText(ctx, `${hour.temp}°`, x + cellW / 2, y + 170, {
      font: `600 34px ${FONT_DISPLAY}`
    })

    if (hour.rainProb > 0) {
      drawCleanText(ctx, `${hour.rainProb}%`, x + cellW / 2, y + 210, {
        font: `500 18px ${FONT_BODY}`,
        color: 'rgba(150, 200, 255, 0.9)'
      })
    }
  })

  const rainHours = hours.filter(h => h.rainProb >= 50)
  if (rainHours.length > 0) {
    const first = rainHours[0].hourLabel
    const last = rainHours[rainHours.length - 1].hourLabel
    const summary = rainHours.length === 1
      ? `Rain likely around ${first}`
      : `Rain likely ${first} – ${last}`

    drawCleanText(ctx, summary, CANVAS_SIZE / 2, 880, {
      font: `400 24px ${FONT_BODY}`,
      color: 'rgba(150, 200, 255, 0.85)'
    })
  }

  drawFooter(ctx, theme.accent)

  return canvas.toDataURL('image/png', 1.0)
}

// ============================================================================
// CARD TYPE 4 — SINGLE HOUR
// ============================================================================
export const generateSingleHourCard = async (weather, location, hourIndex) => {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = canvas.getContext('2d')

  const hourData = getSingleHourData(weather?.hourly, hourIndex)
  if (!hourData) return null

  const sunrise = weather?.daily?.sunrise?.[0]
  const sunset = weather?.daily?.sunset?.[0]
  const hourDate = new Date(hourData.time)
  const night = isNightTime(hourDate, sunrise, sunset)
  const theme = getWeatherTheme(hourData.code, night)

  drawGradient(ctx, theme.gradient, {
    glowX: 0.25, glowY: night ? 0.16 : 0.18, outerX: 0.58, outerY: 0.52, outerRadius: 1.05
  })
  await drawSVGArt(ctx, theme.svg, theme.svgOpacity)
  drawBorder(ctx, theme.accent)

  const locationName = location?.name?.split(',')[0] || 'Unknown'

  drawShadowedText(ctx, hourData.hourLabel, CANVAS_SIZE / 2, 180, {
    font: `500 96px ${FONT_DISPLAY}`
  })

  drawCleanText(ctx, hourData.dateLabel, CANVAS_SIZE / 2, 260, {
    font: `400 26px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.6)'
  })

  drawShadowedText(ctx, `${hourData.temp}°`, CANVAS_SIZE / 2, 450, {
    font: `500 200px ${FONT_DISPLAY}`
  })

  drawShadowedText(ctx, codeToName(hourData.code), CANVAS_SIZE / 2, 590, {
    font: `400 42px ${FONT_BODY}`,
    color: theme.accent
  })

  drawCleanText(ctx, locationName, CANVAS_SIZE / 2, 660, {
    font: `400 32px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.85)'
  })

  drawCleanText(ctx, `💨 ${hourData.wind} km/h  ·  💧 ${hourData.humidity}%`, CANVAS_SIZE / 2, 740, {
    font: `400 24px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.7)'
  })

  drawCleanText(ctx, `🌧 ${hourData.rainProb}% chance  ·  Feels ${hourData.feelsLike}°`, CANVAS_SIZE / 2, 785, {
    font: `400 22px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.6)'
  })

  drawFooter(ctx, theme.accent)

  return canvas.toDataURL('image/png', 1.0)
}

// ============================================================================
// CARD TYPE 5 — WEEKLY (7 DAYS)
// ============================================================================
export const generateWeeklyCard = async (weather, location) => {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = canvas.getContext('2d')

  const weekly = calculateWeeklySummary(weather?.daily)
  const now = new Date()
  const sunrise = weather?.daily?.sunrise?.[0]
  const sunset = weather?.daily?.sunset?.[0]
  const night = isNightTime(now, sunrise, sunset)

  const weekCodes = weekly.days.map(d => d.code)
  const counts = {}
  weekCodes.forEach(c => counts[c] = (counts[c] || 0) + 1)
  const dominantCode = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0
  const theme = getWeatherTheme(parseInt(dominantCode), night)

  drawGradient(ctx, theme.gradient, {
    glowX: 0.25, glowY: 0.18, outerX: 0.58, outerY: 0.52, outerRadius: 1.05
  })
  await drawSVGArt(ctx, theme.svg, theme.svgOpacity)
  drawBorder(ctx, theme.accent)

  const locationName = location?.name?.split(',')[0] || 'Unknown'

  drawShadowedText(ctx, '7-DAY FORECAST', CANVAS_SIZE / 2, 120, {
    font: `600 46px ${FONT_DISPLAY}`
  })

  drawCleanText(ctx, locationName, CANVAS_SIZE / 2, 180, {
    font: `400 26px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.55)'
  })

  const startY = 260
  const rowH = 78
  const boxX = PADDING * 1.8
  const boxW = CANVAS_SIZE - boxX * 2

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.lineWidth = 1
  roundRect(ctx, boxX, startY - 20, boxW, rowH * 7 + 40, 24)
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  weekly.days.forEach((day, i) => {
    const y = startY + i * rowH + 40

    drawCleanText(ctx, day.dayName.toUpperCase(), boxX + 40, y, {
      align: 'left',
      font: `600 26px ${FONT_BODY}`,
      color: '#FFFFFF'
    })

    drawShadowedText(ctx, codeToEmoji(day.code), boxX + boxW * 0.42, y, {
      font: `40px ${FONT_DISPLAY}`
    })

    drawCleanText(ctx, `${day.high}°`, boxX + boxW * 0.68, y, {
      align: 'right',
      font: `600 30px ${FONT_BODY}`,
      color: '#FFB088'
    })

    drawCleanText(ctx, `${day.low}°`, boxX + boxW * 0.82, y, {
      align: 'right',
      font: `600 30px ${FONT_BODY}`,
      color: '#88C5FF'
    })

    drawCleanText(ctx, `${day.rainProb}%`, boxX + boxW - 40, y, {
      align: 'right',
      font: `500 22px ${FONT_BODY}`,
      color: 'rgba(150, 200, 255, 0.8)'
    })
  })

  drawCleanText(ctx, weekly.summary, CANVAS_SIZE / 2, 900, {
    font: `italic 400 24px ${FONT_BODY}`,
    color: theme.accent
  })

  drawFooter(ctx, theme.accent)

  return canvas.toDataURL('image/png', 1.0)
}

// ============================================================================
// UTILITIES
// ============================================================================

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export const generateWeatherImage = async (type, params) => {
  try {
    if (type === 'current') {
      return await generateCurrentCard(params.weather, params.location, params.aqi)
    }
    if (type === 'today') {
      return await generateTodayCard(params.weather, params.location, params.todayStats, params.aqi)
    }
    if (type === 'hourly') {
      return await generateHourlyCard(params.weather, params.location)
    }
    if (type === 'singleHour') {
      return await generateSingleHourCard(params.weather, params.location, params.hourIndex)
    }
    if (type === 'weekly') {
      return await generateWeeklyCard(params.weather, params.location)
    }
    return null
  } catch (err) {
    console.error('Weather image generation failed:', err)
    return null
  }
}
