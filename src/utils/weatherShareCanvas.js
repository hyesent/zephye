// ============================================================================
// WEATHER SHARE CANVAS — Render engine for all 5 card types
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

// ─── Draw gradient background ──────────────────────────────────────────
const drawGradient = (ctx, colors) => {
  const gradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color)
  })
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
}

// ─── Draw SVG art on top ───────────────────────────────────────────────
const drawSVGArt = async (ctx, svgType) => {
  try {
    const svgString = getSVGArt(svgType, CANVAS_SIZE, CANVAS_SIZE)
    const img = await svgToImage(svgString)
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
  } catch (err) {
    console.warn('SVG art draw failed:', err)
  }
}

// ─── Draw branded border ───────────────────────────────────────────────
const drawBorder = (ctx) => {
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.18)'
  ctx.lineWidth = 3
  const p = PADDING * 0.6
  ctx.strokeRect(p, p, CANVAS_SIZE - p * 2, CANVAS_SIZE - p * 2)
}

// ─── Draw footer ───────────────────────────────────────────────────────
const drawFooter = (ctx, accentColor = '#38bdf8') => {
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.font = 'bold 28px Georgia, serif'
  ctx.fillStyle = accentColor
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
  ctx.shadowBlur = 12
  ctx.fillText(FOOTER_TEXT, CANVAS_SIZE / 2, CANVAS_SIZE - PADDING)
  ctx.restore()
}

// ─── Text helpers ──────────────────────────────────────────────────────
const drawShadowedText = (ctx, text, x, y, options = {}) => {
  ctx.save()
  ctx.textAlign = options.align || 'center'
  ctx.textBaseline = options.baseline || 'middle'
  ctx.font = options.font || '32px Georgia, serif'
  ctx.fillStyle = options.color || '#FFFFFF'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
  ctx.shadowBlur = 15
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

  drawGradient(ctx, theme.gradient)
  await drawSVGArt(ctx, theme.svg)
  drawBorder(ctx)

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
  const emoji = codeToEmoji(code)
  const condition = codeToName(code)
  const locationName = location?.name?.split(',')[0] || 'Unknown'

  // Big emoji
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '160px Georgia, serif'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 25
  ctx.fillText(emoji, CANVAS_SIZE / 2, 280)
  ctx.restore()

  // Temperature
  drawShadowedText(ctx, `${temp}°`, CANVAS_SIZE / 2, 460, {
    font: 'bold 180px Georgia, serif'
  })

  // Condition name
  drawShadowedText(ctx, condition, CANVAS_SIZE / 2, 590, {
    font: '44px Georgia, serif',
    color: theme.accent
  })

  // Location
  drawShadowedText(ctx, locationName, CANVAS_SIZE / 2, 660, {
    font: '38px Georgia, serif'
  })

  // Feels + AQI line
  drawShadowedText(ctx, `Feels like ${feels}° · AQI ${aqiVal ?? '--'} (${aqiLabel})`, CANVAS_SIZE / 2, 735, {
    font: '26px Georgia, serif',
    color: 'rgba(255, 255, 255, 0.85)'
  })

  // Wind + Humidity + UV
  drawShadowedText(ctx, `💨 ${wind} km/h    💧 ${humidity}%    ☀️ UV ${uv}`, CANVAS_SIZE / 2, 800, {
    font: '28px Georgia, serif',
    color: 'rgba(255, 255, 255, 0.9)'
  })

  // Timestamp
  const timeStr = now.toLocaleString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  })
  drawShadowedText(ctx, timeStr, CANVAS_SIZE / 2, 885, {
    font: '24px Georgia, serif',
    color: 'rgba(255, 255, 255, 0.6)'
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

  drawGradient(ctx, theme.gradient)
  await drawSVGArt(ctx, theme.svg)
  drawBorder(ctx)

  const locationName = location?.name?.split(',')[0] || 'Unknown'
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  // Header
  drawShadowedText(ctx, `TODAY IN ${locationName.toUpperCase()}`, CANVAS_SIZE / 2, 130, {
    font: 'bold 42px Georgia, serif'
  })

  drawShadowedText(ctx, dateStr, CANVAS_SIZE / 2, 190, {
    font: '28px Georgia, serif',
    color: 'rgba(255, 255, 255, 0.7)'
  })

  // Weather emoji trio (dominant)
  const trioEmoji = codeToEmoji(highlights.dominantCode)
  drawShadowedText(ctx, trioEmoji, CANVAS_SIZE / 2, 310, {
    font: '120px Georgia, serif'
  })

  // High / Low
  drawShadowedText(ctx, `High: ${highlights.high}°   Low: ${highlights.low}°`, CANVAS_SIZE / 2, 430, {
    font: 'bold 42px Georgia, serif'
  })

  // Detail box
  const boxX = PADDING * 2
  const boxY = 510
  const boxW = CANVAS_SIZE - boxX * 2
  const boxH = 380

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 2
  roundRect(ctx, boxX, boxY, boxW, boxH, 20)
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  const rows = [
    ['☀️ Sunshine', `${highlights.sunHours}h`],
    ['🌧️ Rain', `${highlights.rainHours}h`],
    ['⛈️ Thunder', `${highlights.thunderHours}h`],
    ['💨 Max wind', `${highlights.maxWind} km/h`],
    ['💧 Humidity', `${highlights.maxHumidity}%`],
    ['☀️ UV Peak', `${highlights.uvPeak}`],
    ['🌅 Sunrise', highlights.sunrise],
    ['🌇 Sunset', highlights.sunset]
  ]

  const rowStartY = boxY + 50
  const rowGap = 42

  rows.forEach((row, i) => {
    const y = rowStartY + i * rowGap
    ctx.save()
    ctx.font = '26px Georgia, serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(row[0], boxX + 40, y)

    ctx.textAlign = 'right'
    ctx.fillStyle = theme.accent
    ctx.font = 'bold 26px Georgia, serif'
    ctx.fillText(row[1], boxX + boxW - 40, y)
    ctx.restore()
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

  drawGradient(ctx, theme.gradient)
  await drawSVGArt(ctx, theme.svg)
  drawBorder(ctx)

  const hours = getHourlySlice(weather?.hourly, 12)
  const locationName = location?.name?.split(',')[0] || 'Unknown'

  drawShadowedText(ctx, 'NEXT 12 HOURS', CANVAS_SIZE / 2, 130, {
    font: 'bold 48px Georgia, serif'
  })

  drawShadowedText(ctx, locationName, CANVAS_SIZE / 2, 195, {
    font: '30px Georgia, serif',
    color: 'rgba(255, 255, 255, 0.7)'
  })

  // 2 rows x 6 columns grid
  const gridStartY = 280
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

    // Cell background
    ctx.save()
    ctx.fillStyle = hour.isNow ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0, 0, 0, 0.3)'
    ctx.strokeStyle = hour.isNow ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 2
    roundRect(ctx, x, y, cellW, cellH, 16)
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    // Hour label
    drawShadowedText(ctx, hour.hourLabel, x + cellW / 2, y + 30, {
      font: 'bold 20px Georgia, serif',
      color: hour.isNow ? theme.accent : '#FFFFFF'
    })

    // Emoji
    drawShadowedText(ctx, codeToEmoji(hour.code), x + cellW / 2, y + 100, {
      font: '56px Georgia, serif'
    })

    // Temp
    drawShadowedText(ctx, `${hour.temp}°`, x + cellW / 2, y + 165, {
      font: 'bold 30px Georgia, serif'
    })

    // Rain %
    if (hour.rainProb > 0) {
      drawShadowedText(ctx, `${hour.rainProb}%`, x + cellW / 2, y + 210, {
        font: '20px Georgia, serif',
        color: 'rgba(150, 200, 255, 0.9)'
      })
    }
  })

  // Rain summary line
  const rainHours = hours.filter(h => h.rainProb >= 50)
  if (rainHours.length > 0) {
    const first = rainHours[0].hourLabel
    const last = rainHours[rainHours.length - 1].hourLabel
    const summary = rainHours.length === 1
      ? `Rain likely around ${first}`
      : `Rain likely ${first} - ${last}`
    drawShadowedText(ctx, summary, CANVAS_SIZE / 2, 885, {
      font: '26px Georgia, serif',
      color: 'rgba(150, 200, 255, 0.9)'
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

  drawGradient(ctx, theme.gradient)
  await drawSVGArt(ctx, theme.svg)
  drawBorder(ctx)

  const locationName = location?.name?.split(',')[0] || 'Unknown'

  // Big hour label
  drawShadowedText(ctx, hourData.hourLabel, CANVAS_SIZE / 2, 180, {
    font: 'bold 96px Georgia, serif'
  })

  drawShadowedText(ctx, hourData.dateLabel, CANVAS_SIZE / 2, 270, {
    font: '30px Georgia, serif',
    color: 'rgba(255, 255, 255, 0.7)'
  })

  // Emoji
  drawShadowedText(ctx, codeToEmoji(hourData.code), CANVAS_SIZE / 2, 440, {
    font: '160px Georgia, serif'
  })

  // Temp
  drawShadowedText(ctx, `${hourData.temp}°C`, CANVAS_SIZE / 2, 610, {
    font: 'bold 140px Georgia, serif'
  })

  // Condition
  drawShadowedText(ctx, codeToName(hourData.code), CANVAS_SIZE / 2, 720, {
    font: '38px Georgia, serif',
    color: theme.accent
  })

  // Location
  drawShadowedText(ctx, locationName, CANVAS_SIZE / 2, 785, {
    font: '32px Georgia, serif'
  })

  // Metrics
  drawShadowedText(ctx, `💨 ${hourData.wind} km/h    💧 ${hourData.humidity}%`, CANVAS_SIZE / 2, 855, {
    font: '26px Georgia, serif',
    color: 'rgba(255, 255, 255, 0.85)'
  })

  drawShadowedText(ctx, `🌧 ${hourData.rainProb}% chance    Feels ${hourData.feelsLike}°`, CANVAS_SIZE / 2, 900, {
    font: '24px Georgia, serif',
    color: 'rgba(255, 255, 255, 0.75)'
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

  // Dominant code from week
  const weekCodes = weekly.days.map(d => d.code)
  const counts = {}
  weekCodes.forEach(c => counts[c] = (counts[c] || 0) + 1)
  const dominantCode = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0
  const theme = getWeatherTheme(parseInt(dominantCode), night)

  drawGradient(ctx, theme.gradient)
  await drawSVGArt(ctx, theme.svg)
  drawBorder(ctx)

  const locationName = location?.name?.split(',')[0] || 'Unknown'

  drawShadowedText(ctx, '7-DAY FORECAST', CANVAS_SIZE / 2, 130, {
    font: 'bold 48px Georgia, serif'
  })

  drawShadowedText(ctx, locationName, CANVAS_SIZE / 2, 195, {
    font: '30px Georgia, serif',
    color: 'rgba(255, 255, 255, 0.7)'
  })

  // Days grid — 7 rows
  const startY = 275
  const rowH = 78
  const boxX = PADDING * 1.8
  const boxW = CANVAS_SIZE - boxX * 2

  // Box background
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 2
  roundRect(ctx, boxX, startY - 20, boxW, rowH * 7 + 40, 20)
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  weekly.days.forEach((day, i) => {
    const y = startY + i * rowH + 40

    // Day name
    ctx.save()
    ctx.font = 'bold 30px Georgia, serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 8
    ctx.fillText(day.dayName.toUpperCase(), boxX + 40, y)
    ctx.restore()

    // Emoji
    ctx.save()
    ctx.font = '42px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(codeToEmoji(day.code), boxX + boxW * 0.42, y)
    ctx.restore()

    // High (warm color)
    ctx.save()
    ctx.font = 'bold 32px Georgia, serif'
    ctx.fillStyle = '#FFB088'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 8
    ctx.fillText(`${day.high}°`, boxX + boxW * 0.68, y)
    ctx.restore()

    // Low (cool color)
    ctx.save()
    ctx.font = 'bold 32px Georgia, serif'
    ctx.fillStyle = '#88C5FF'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 8
    ctx.fillText(`${day.low}°`, boxX + boxW * 0.82, y)
    ctx.restore()

    // Rain %
    ctx.save()
    ctx.font = 'bold 24px Georgia, serif'
    ctx.fillStyle = 'rgba(150, 200, 255, 0.85)'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 8
    ctx.fillText(`${day.rainProb}%`, boxX + boxW - 40, y)
    ctx.restore()
  })

  // Summary line
  drawShadowedText(ctx, weekly.summary, CANVAS_SIZE / 2, 890, {
    font: 'italic 28px Georgia, serif',
    color: theme.accent
  })

  drawFooter(ctx, theme.accent)

  return canvas.toDataURL('image/png', 1.0)
}

// ============================================================================
// UTILITY
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

// ─── Master generator ──────────────────────────────────────────────────
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
