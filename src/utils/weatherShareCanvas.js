// ============================================================================
// WEATHER SHARE CANVAS — WITH TRANSLATION
// Every static text uses t(); date/time uses uiLanguage
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

const FONT_DISPLAY = '"SF Pro Display", "Inter", "Helvetica Neue", system-ui, -apple-system, sans-serif'
const FONT_BODY = '"Inter", "SF Pro Text", "Helvetica Neue", system-ui, -apple-system, sans-serif'

// ─── Translation helper (fallback to English if no t) ──────────────────
const tr = (t, key, fallback) => {
  if (!t) return fallback
  try {
    const result = t(key)
    // If t returns the key fallback (meaning no translation found), use fallback
    if (!result || result === key.split('.').pop()) return fallback
    return result
  } catch {
    return fallback
  }
}

// ─── Load SVG ──────────────────────────────────────────────────────────
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

// ─── Atmospheric gradient ──────────────────────────────────────────────
const drawGradient = (ctx, colors, options = {}) => {
  const {
    glowX = 0.25,
    glowY = 0.18,
    outerX = 0.58,
    outerY = 0.52,
    outerRadius = 1.05
  } = options

  const deepTone = colors[colors.length - 1] || '#000000'
  ctx.fillStyle = deepTone
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

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

  const linearGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE)
  linearGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)')
  linearGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)')
  linearGrad.addColorStop(1, 'rgba(0, 0, 0, 0.18)')
  ctx.fillStyle = linearGrad
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  const vignette = ctx.createRadialGradient(
    CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE * 0.35,
    CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE * 0.85
  )
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.32)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
}

// ─── SVG draw — VISIBLE (no screen blend) ─────────────────────────────
const drawSVGArt = async (ctx, svgType, opacity = 0.5) => {
  try {
    const svgString = getSVGArt(svgType, CANVAS_SIZE, CANVAS_SIZE)
    const img = await svgToImage(svgString)

    ctx.save()
    ctx.globalAlpha = opacity
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.restore()
  } catch (err) {
    console.warn('SVG art draw failed:', err)
  }
}

// ─── Border ────────────────────────────────────────────────────────────
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

// ─── Text helpers ──────────────────────────────────────────────────────
const drawShadowedText = (ctx, text, x, y, options = {}) => {
  ctx.save()
  ctx.textAlign = options.align || 'center'
  ctx.textBaseline = options.baseline || 'middle'
  ctx.font = options.font || `400 32px ${FONT_BODY}`
  ctx.fillStyle = options.color || '#FFFFFF'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetY = 2
  ctx.fillText(text, x, y)
  ctx.restore()
}

const drawCleanText = (ctx, text, x, y, options = {}) => {
  ctx.save()
  ctx.textAlign = options.align || 'center'
  ctx.textBaseline = options.baseline || 'middle'
  ctx.font = options.font || `400 22px ${FONT_BODY}`
  ctx.fillStyle = options.color || 'rgba(255, 255, 255, 0.7)'
  ctx.fillText(text, x, y)
  ctx.restore()
}

// ─── Condition name translator ─────────────────────────────────────────
const translateCondition = (code, t) => {
  const keyMap = {
    0: ['weather.clear', 'Clear'],
    1: ['weather.mainlyClear', 'Mainly Clear'],
    2: ['weather.partlyCloudy', 'Partly Cloudy'],
    3: ['weather.overcast', 'Overcast'],
    45: ['weather.fog', 'Fog'],
    48: ['weather.fog', 'Fog'],
    51: ['weather.lightDrizzle', 'Light Drizzle'],
    53: ['weather.moderateDrizzle', 'Moderate Drizzle'],
    55: ['weather.heavyDrizzle', 'Heavy Drizzle'],
    61: ['weather.lightRain', 'Light Rain'],
    63: ['weather.moderateRain', 'Moderate Rain'],
    65: ['weather.heavyRain', 'Heavy Rain'],
    71: ['weather.lightSnow', 'Light Snow'],
    73: ['weather.moderateSnow', 'Moderate Snow'],
    75: ['weather.heavySnow', 'Heavy Snow'],
    80: ['weather.rainShowers', 'Rain Showers'],
    81: ['weather.heavyShowers', 'Heavy Showers'],
    82: ['weather.violentShowers', 'Violent Showers'],
    95: ['weather.thunderstorm', 'Thunderstorm'],
    96: ['weather.thunderstorm', 'Thunderstorm'],
    99: ['weather.heavyThunderstorm', 'Heavy Thunderstorm']
  }
  const [key, fallback] = keyMap[code] || ['weather.unknown', 'Unknown']
  return tr(t, key, fallback)
}

// ─── Date formatting helper ────────────────────────────────────────────
const formatDate = (date, uiLanguage, options) => {
  try {
    return date.toLocaleDateString(uiLanguage || 'en', options)
  } catch {
    return date.toLocaleDateString('en', options)
  }
}

const formatTime = (date, uiLanguage, options) => {
  try {
    return date.toLocaleTimeString(uiLanguage || 'en', options)
  } catch {
    return date.toLocaleTimeString('en', options)
  }
}

// ============================================================================
// CARD 1 — CURRENT WEATHER
// ============================================================================
export const generateCurrentCard = async (weather, location, aqi, t, uiLanguage) => {
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
    glowX: 0.25, glowY: night ? 0.16 : 0.18,
    outerX: 0.58, outerY: 0.52, outerRadius: 1.05
  })
  await drawSVGArt(ctx, theme.svg, theme.svgOpacity)
  drawBorder(ctx, theme.accent)

  const temp = Math.round(weather?.current?.temperature_2m ?? 0)
  const feels = Math.round(weather?.current?.apparent_temperature ?? temp)
  const wind = Math.round(weather?.current?.wind_speed_10m ?? 0)
  const humidity = weather?.current?.relative_humidity_2m ?? 0
  const uv = weather?.daily?.uv_index_max?.[0] ?? 0
  const aqiVal = aqi?.us_aqi
  const aqiLabel = aqiVal == null
    ? '--'
    : aqiVal <= 50 ? tr(t, 'aqi.good', 'Good')
    : aqiVal <= 100 ? tr(t, 'aqi.moderate', 'Moderate')
    : aqiVal <= 150 ? tr(t, 'aqi.unhealthy', 'Unhealthy')
    : tr(t, 'aqi.hazardous', 'Hazardous')

  const condition = translateCondition(code, t)
  const locationName = location?.name?.split(',')[0] || 'Unknown'

  // Location small caps
  drawCleanText(ctx, locationName.toUpperCase(), CANVAS_SIZE / 2, 150, {
    font: `500 24px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.6)'
  })

  // Hero temp
  drawShadowedText(ctx, `${temp}°`, CANVAS_SIZE / 2, 380, {
    font: `300 260px ${FONT_DISPLAY}`,
    color: '#FFFFFF'
  })

  // Condition (translated)
  drawShadowedText(ctx, condition, CANVAS_SIZE / 2, 545, {
    font: `400 46px ${FONT_BODY}`,
    color: theme.accent
  })

  // Metrics panel
  const panelX = PADDING * 1.6
  const panelY = 640
  const panelW = CANVAS_SIZE - panelX * 2
  const panelH = 280
  const cellW = panelW / 3
  const cellH = panelH / 2

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  roundRect(ctx, panelX, panelY, panelW, panelH, 24)
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.lineWidth = 1

  ctx.beginPath()
  ctx.moveTo(panelX + cellW, panelY + 20)
  ctx.lineTo(panelX + cellW, panelY + panelH - 20)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(panelX + cellW * 2, panelY + 20)
  ctx.lineTo(panelX + cellW * 2, panelY + panelH - 20)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(panelX + 20, panelY + cellH)
  ctx.lineTo(panelX + panelW - 20, panelY + cellH)
  ctx.stroke()
  ctx.restore()

  // Translated metric labels
  const metrics = [
    { label: tr(t, 'labels.feelsLike', 'Feels Like').toUpperCase(), value: `${feels}°` },
    { label: tr(t, 'labels.wind', 'Wind').toUpperCase(), value: `${wind} km/h` },
    { label: tr(t, 'labels.humidity', 'Humidity').toUpperCase(), value: `${humidity}%` },
    { label: tr(t, 'labels.uv', 'UV Index').toUpperCase(), value: `${uv}` },
    {
      label: tr(t, 'labels.aqi', 'AQI').toUpperCase(),
      value: aqiVal == null ? '--' : `${aqiVal}`,
      sub: aqiLabel
    },
    {
      label: tr(t, 'labels.sunset', 'Sunset').toUpperCase(),
      value: sunset
        ? formatTime(new Date(sunset), uiLanguage, { hour: 'numeric', minute: '2-digit', hour12: true })
        : '--'
    }
  ]

  metrics.forEach((m, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const cx = panelX + cellW * col + cellW / 2
    const cy = panelY + cellH * row + cellH / 2

    drawCleanText(ctx, m.label, cx, cy - 32, {
      font: `500 14px ${FONT_BODY}`,
      color: 'rgba(255, 255, 255, 0.45)'
    })

    drawCleanText(ctx, m.value, cx, cy + 5, {
      font: `600 34px ${FONT_DISPLAY}`,
      color: '#FFFFFF'
    })

    if (m.sub) {
      drawCleanText(ctx, m.sub, cx, cy + 42, {
        font: `400 14px ${FONT_BODY}`,
        color: theme.accent
      })
    }
  })

  // Timestamp with uiLanguage
  const timeStr = formatDate(now, uiLanguage, {
    weekday: 'long', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  })
  drawCleanText(ctx, timeStr, CANVAS_SIZE / 2, 965, {
    font: `400 20px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.45)'
  })

  drawFooter(ctx, theme.accent)

  return canvas.toDataURL('image/png', 1.0)
}

// ============================================================================
// CARD 2 — TODAY SUMMARY
// ============================================================================
export const generateTodayCard = async (weather, location, todayStats, aqi, t, uiLanguage) => {
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
  const dateStr = formatDate(new Date(), uiLanguage, {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  drawCleanText(ctx, tr(t, 'labels.todayIn', 'Today in').toUpperCase(), CANVAS_SIZE / 2, 110, {
    font: `500 22px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.5)'
  })

  drawShadowedText(ctx, locationName, CANVAS_SIZE / 2, 165, {
    font: `600 52px ${FONT_DISPLAY}`
  })

  drawCleanText(ctx, dateStr, CANVAS_SIZE / 2, 225, {
    font: `400 24px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.55)'
  })

  drawShadowedText(ctx, codeToEmoji(highlights.dominantCode), CANVAS_SIZE / 2, 360, {
    font: `140px ${FONT_DISPLAY}`
  })

  drawShadowedText(ctx, `${highlights.high}°`, CANVAS_SIZE * 0.35, 490, {
    font: `600 80px ${FONT_DISPLAY}`
  })
  drawShadowedText(ctx, `${highlights.low}°`, CANVAS_SIZE * 0.65, 490, {
    font: `600 80px ${FONT_DISPLAY}`,
    color: 'rgba(255, 255, 255, 0.55)'
  })

  drawCleanText(ctx, tr(t, 'labels.high', 'High').toUpperCase(), CANVAS_SIZE * 0.35, 545, {
    font: `500 14px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.4)'
  })
  drawCleanText(ctx, tr(t, 'labels.low', 'Low').toUpperCase(), CANVAS_SIZE * 0.65, 545, {
    font: `500 14px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.4)'
  })

  ctx.save()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PADDING * 3, 590)
  ctx.lineTo(CANVAS_SIZE - PADDING * 3, 590)
  ctx.stroke()
  ctx.restore()

  const gridX = PADDING * 1.8
  const gridY = 640
  const gridW = CANVAS_SIZE - gridX * 2
  const gridCellW = gridW / 4
  const gridCellH = 100

  const rows = [
    { icon: '☀️', label: tr(t, 'labels.sunshine', 'Sunshine').toUpperCase(), value: `${highlights.sunHours}h` },
    { icon: '🌧️', label: tr(t, 'labels.rain', 'Rain').toUpperCase(), value: `${highlights.rainHours}h` },
    { icon: '⛈️', label: tr(t, 'labels.thunder', 'Thunder').toUpperCase(), value: `${highlights.thunderHours}h` },
    { icon: '💨', label: tr(t, 'labels.wind', 'Wind').toUpperCase(), value: `${highlights.maxWind} km/h` },
    { icon: '💧', label: tr(t, 'labels.humidity', 'Humidity').toUpperCase(), value: `${highlights.maxHumidity}%` },
    { icon: '☀️', label: tr(t, 'labels.uv', 'UV Peak').toUpperCase(), value: `${highlights.uvPeak}` },
    { icon: '🌅', label: tr(t, 'labels.sunrise', 'Sunrise').toUpperCase(), value: highlights.sunrise },
    { icon: '🌇', label: tr(t, 'labels.sunset', 'Sunset').toUpperCase(), value: highlights.sunset }
  ]

  rows.forEach((r, i) => {
    const col = i % 4
    const row = Math.floor(i / 4)
    const cx = gridX + gridCellW * col + gridCellW / 2
    const cy = gridY + row * gridCellH + gridCellH / 2

    drawCleanText(ctx, r.icon, cx, cy - 25, {
      font: `28px ${FONT_BODY}`
    })

    drawCleanText(ctx, r.label, cx, cy + 5, {
      font: `500 12px ${FONT_BODY}`,
      color: 'rgba(255, 255, 255, 0.4)'
    })

    drawCleanText(ctx, r.value, cx, cy + 32, {
      font: `600 22px ${FONT_DISPLAY}`,
      color: '#FFFFFF'
    })
  })

  drawFooter(ctx, theme.accent)

  return canvas.toDataURL('image/png', 1.0)
}

// ============================================================================
// CARD 3 — HOURLY (12 HOURS)
// ============================================================================
export const generateHourlyCard = async (weather, location, t, uiLanguage) => {
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
    glowX: 0.25, glowY: night ? 0.16 : 0.18,
    outerX: 0.58, outerY: 0.52, outerRadius: 1.05
  })
  await drawSVGArt(ctx, theme.svg, theme.svgOpacity)
  drawBorder(ctx, theme.accent)

  const hours = getHourlySlice(weather?.hourly, 12)
  const locationName = location?.name?.split(',')[0] || 'Unknown'

  drawCleanText(ctx, tr(t, 'labels.next12Hours', 'Next 12 Hours').toUpperCase(), CANVAS_SIZE / 2, 120, {
    font: `500 22px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.5)'
  })

  drawShadowedText(ctx, locationName, CANVAS_SIZE / 2, 175, {
    font: `600 48px ${FONT_DISPLAY}`
  })

  const gridStartY = 280
  const cellW = 148
  const cellH = 250
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
    ctx.fillStyle = hour.isNow ? 'rgba(56, 189, 248, 0.18)' : 'rgba(0, 0, 0, 0.28)'
    ctx.strokeStyle = hour.isNow ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1.5
    roundRect(ctx, x, y, cellW, cellH, 20)
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    drawCleanText(ctx, hour.hourLabel, x + cellW / 2, y + 35, {
      font: `600 20px ${FONT_BODY}`,
      color: hour.isNow ? theme.accent : 'rgba(255, 255, 255, 0.9)'
    })

    drawShadowedText(ctx, codeToEmoji(hour.code), x + cellW / 2, y + 115, {
      font: `64px ${FONT_DISPLAY}`
    })

    drawShadowedText(ctx, `${hour.temp}°`, x + cellW / 2, y + 180, {
      font: `600 36px ${FONT_DISPLAY}`
    })

    if (hour.rainProb > 0) {
      drawCleanText(ctx, `${hour.rainProb}%`, x + cellW / 2, y + 220, {
        font: `500 18px ${FONT_BODY}`,
        color: 'rgba(150, 200, 255, 0.9)'
      })
    }
  })

  const rainHours = hours.filter(h => h.rainProb >= 50)
  if (rainHours.length > 0) {
    const first = rainHours[0].hourLabel
    const last = rainHours[rainHours.length - 1].hourLabel
    const summaryTemplate = tr(t, 'map.rainLikely', 'Rain likely {range}')
    const range = rainHours.length === 1
      ? tr(t, 'map.around', `around ${first}`)
      : `${first} – ${last}`
    const summary = summaryTemplate.includes('{range}')
      ? summaryTemplate.replace('{range}', range)
      : summaryTemplate

    drawCleanText(ctx, summary, CANVAS_SIZE / 2, 900, {
      font: `500 24px ${FONT_BODY}`,
      color: 'rgba(150, 200, 255, 0.9)'
    })
  }

  drawFooter(ctx, theme.accent)

  return canvas.toDataURL('image/png', 1.0)
}

// ============================================================================
// CARD 4 — SINGLE HOUR
// ============================================================================
export const generateSingleHourCard = async (weather, location, hourIndex, t, uiLanguage) => {
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
    glowX: 0.25, glowY: night ? 0.16 : 0.18,
    outerX: 0.58, outerY: 0.52, outerRadius: 1.05
  })
  await drawSVGArt(ctx, theme.svg, theme.svgOpacity)
  drawBorder(ctx, theme.accent)

  const locationName = location?.name?.split(',')[0] || 'Unknown'

  // Format date using uiLanguage
  const dateLabel = formatDate(new Date(hourData.time), uiLanguage, {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  drawCleanText(ctx, dateLabel.toUpperCase(), CANVAS_SIZE / 2, 140, {
    font: `500 22px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.5)'
  })

  drawShadowedText(ctx, hourData.hourLabel, CANVAS_SIZE / 2, 220, {
    font: `600 76px ${FONT_DISPLAY}`
  })

  drawShadowedText(ctx, `${hourData.temp}°`, CANVAS_SIZE / 2, 440, {
    font: `300 240px ${FONT_DISPLAY}`
  })

  drawShadowedText(ctx, translateCondition(hourData.code, t), CANVAS_SIZE / 2, 600, {
    font: `400 44px ${FONT_BODY}`,
    color: theme.accent
  })

  drawCleanText(ctx, locationName, CANVAS_SIZE / 2, 660, {
    font: `400 30px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.8)'
  })

  const panelX = PADDING * 1.6
  const panelY = 720
  const panelW = CANVAS_SIZE - panelX * 2
  const panelH = 160

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  roundRect(ctx, panelX, panelY, panelW, panelH, 20)
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  const metrics = [
    { label: tr(t, 'labels.feelsShort', 'Feels').toUpperCase(), value: `${hourData.feelsLike}°` },
    { label: tr(t, 'labels.wind', 'Wind').toUpperCase(), value: `${hourData.wind} km/h` },
    { label: tr(t, 'labels.humidity', 'Humidity').toUpperCase(), value: `${hourData.humidity}%` },
    { label: tr(t, 'labels.rain', 'Rain').toUpperCase(), value: `${hourData.rainProb}%` }
  ]

  const cellW = panelW / 4

  metrics.forEach((m, i) => {
    const cx = panelX + cellW * i + cellW / 2
    const cy = panelY + panelH / 2

    drawCleanText(ctx, m.label, cx, cy - 28, {
      font: `500 14px ${FONT_BODY}`,
      color: 'rgba(255, 255, 255, 0.45)'
    })

    drawCleanText(ctx, m.value, cx, cy + 15, {
      font: `600 30px ${FONT_DISPLAY}`,
      color: '#FFFFFF'
    })
  })

  drawFooter(ctx, theme.accent)

  return canvas.toDataURL('image/png', 1.0)
}

// ============================================================================
// CARD 5 — WEEKLY (7 DAYS)
// ============================================================================
export const generateWeeklyCard = async (weather, location, t, uiLanguage) => {
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

  drawCleanText(ctx, tr(t, 'labels.dailyForecast', '7-Day Forecast').toUpperCase(), CANVAS_SIZE / 2, 120, {
    font: `500 22px ${FONT_BODY}`,
    color: 'rgba(255, 255, 255, 0.5)'
  })

  drawShadowedText(ctx, locationName, CANVAS_SIZE / 2, 175, {
    font: `600 48px ${FONT_DISPLAY}`
  })

  const boxX = PADDING * 1.6
  const boxY = 250
  const boxW = CANVAS_SIZE - boxX * 2
  const rowH = 80
  const boxH = rowH * 7 + 40

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  roundRect(ctx, boxX, boxY, boxW, boxH, 24)
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  weekly.days.forEach((day, i) => {
    const y = boxY + 20 + i * rowH + rowH / 2

    // Format day name with uiLanguage
    const dayName = formatDate(new Date(day.date), uiLanguage, { weekday: 'short' })

    drawCleanText(ctx, dayName.toUpperCase(), boxX + 45, y, {
      align: 'left',
      font: `600 26px ${FONT_BODY}`,
      color: '#FFFFFF'
    })

    drawShadowedText(ctx, codeToEmoji(day.code), boxX + boxW * 0.42, y, {
      font: `44px ${FONT_DISPLAY}`
    })

    drawCleanText(ctx, `${day.high}°`, boxX + boxW * 0.68, y, {
      align: 'right',
      font: `600 32px ${FONT_BODY}`,
      color: '#FFB088'
    })

    drawCleanText(ctx, `${day.low}°`, boxX + boxW * 0.82, y, {
      align: 'right',
      font: `600 32px ${FONT_BODY}`,
      color: '#88C5FF'
    })

    drawCleanText(ctx, `${day.rainProb}%`, boxX + boxW - 45, y, {
      align: 'right',
      font: `500 22px ${FONT_BODY}`,
      color: 'rgba(150, 200, 255, 0.85)'
    })

    if (i < weekly.days.length - 1) {
      ctx.save()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(boxX + 30, y + rowH / 2)
      ctx.lineTo(boxX + boxW - 30, y + rowH / 2)
      ctx.stroke()
      ctx.restore()
    }
  })

  // Summary line — translate if template provided, otherwise use raw
  const summaryRaw = weekly.summary || ''
  const summaryTemplate = tr(t, 'map.weekSummary', summaryRaw)
  const summary = summaryTemplate
    .replace('{count}', weekly.rainyDays)
    .replace('{days}', weekly.rainyDays)

  drawCleanText(ctx, summary, CANVAS_SIZE / 2, 900, {
    font: `italic 400 26px ${FONT_BODY}`,
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
    const { t, uiLanguage } = params
    if (type === 'current') {
      return await generateCurrentCard(params.weather, params.location, params.aqi, t, uiLanguage)
    }
    if (type === 'today') {
      return await generateTodayCard(params.weather, params.location, params.todayStats, params.aqi, t, uiLanguage)
    }
    if (type === 'hourly') {
      return await generateHourlyCard(params.weather, params.location, t, uiLanguage)
    }
    if (type === 'singleHour') {
      return await generateSingleHourCard(params.weather, params.location, params.hourIndex, t, uiLanguage)
    }
    if (type === 'weekly') {
      return await generateWeeklyCard(params.weather, params.location, t, uiLanguage)
    }
    return null
  } catch (err) {
    console.error('Weather image generation failed:', err)
    return null
  }
}
