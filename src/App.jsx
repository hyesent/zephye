import { useState, useEffect, useRef, useMemo } from 'react'
import { QUOTES } from './data/quotes.js'
import { AudioProvider } from './AudioContext.jsx'
import WeatherManTab from './WeatherManTab.jsx'
import ZephyeFullScreen from './ZephyeFullScreen.jsx'
import MapTab from './MapTab.jsx'
import WeatherShareModal from './WeatherShareModal'
import ScheduleToast from './ScheduleToast'
import ScheduleAskPanel from './ScheduleAskPanel'
import { checkDueSchedules } from './scheduleEngine'
import { getLang, getVoiceForLocation } from './zephyeHelpers'
import { LanguageProvider, useLanguage, useTranslation } from './utils/translation'
import { fetchWeather, fetchWeatherBatch, fetchAqi } from './weatherFetcher.js'
import { checkAndNotify } from './weatherAlerts.js'

import shareBg1 from './assets/images/share 1.jpg'
import shareBg2 from './assets/images/share 2.jpg'
import shareBg3 from './assets/images/share 3.jpg'
import shareBg4 from './assets/images/share 4.jpg'
import shareBg5 from './assets/images/share 5.jpg'
import shareBg6 from './assets/images/share 6.jpg'
import shareBg7 from './assets/images/share 7.jpg'
import shareBg8 from './assets/images/share 8.jpg'
import shareBg9 from './assets/images/share 9.jpg'
import shareBg10 from './assets/images/share 10.jpg'
import shareBg11 from './assets/images/share 11.jpg'
import shareBg12 from './assets/images/share 12.jpg'
import shareBg13 from './assets/images/share 13.jpg'

const shareBackgrounds = [
  shareBg1, shareBg2, shareBg3, shareBg4, shareBg5, shareBg6, shareBg7,
  shareBg8, shareBg9, shareBg10, shareBg11, shareBg12, shareBg13
]

const QUOTE_CATEGORIES = ['All', 'Motivational', 'Success', 'Wisdom', 'Love']
const FACT_CATEGORIES = ['All', 'Science', 'History', 'Animals', 'Space']
const OPENWEATHER_KEY = "576b156966c5789a1b3fd0074c8469f1"

const FONT_FAMILIES = [
  'Georgia, serif', 'Times New Roman, serif', 'Garamond, serif',
  'Palatino, serif', 'Book Antiqua, serif', 'Didot, serif',
  'Baskerville, serif', 'Caslon, serif'
]

// ─── SVG ICONS ────────────────────────────────────────────────────────
const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
)
const AddIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const ShareIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
)

// ─── HELPERS ───────────────────────────────────────────────────────────

const getWindDirection = (d) => {
  if (d == null) return ''
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(d / 45) % 8]
}
const getUvLabel = (uv) => {
  if (uv == null) return ''
  if (uv >= 11) return 'Extreme'
  if (uv >= 8) return 'Very High'
  if (uv >= 6) return 'High'
  if (uv >= 3) return 'Moderate'
  return 'Low'
}
const getAqiLabelFor = (a) => {
  if (a == null) return 'Unknown'
  if (a <= 50) return 'Good'
  if (a <= 100) return 'Moderate'
  if (a <= 150) return 'Unhealthy for sensitive'
  if (a <= 200) return 'Unhealthy'
  if (a <= 300) return 'Very unhealthy'
  return 'Hazardous'
}
const getPressureTrend = (p) => {
  if (p == null) return ''
  if (p > 1020) return 'high'
  if (p < 1005) return 'low'
  return 'stable'
}
const getBurnTime = (uv) => {
  if (uv == null || uv < 3) return null
  if (uv >= 11) return '< 10 min'
  if (uv >= 8) return '~15 min'
  if (uv >= 6) return '~25 min'
  return '~45 min'
}
const formatTime = (iso) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '—' }
}
const formatDuration = (seconds) => {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

// ═══════════════════════════════════════════════════════════════════════
// SHARE MODAL (quotes/facts)
// ═══════════════════════════════════════════════════════════════════════

function ShareModal({ isOpen, onClose, content, author, type }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [backgroundIndex, setBackgroundIndex] = useState(0)
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0])

  useEffect(() => {
    if (isOpen) {
      setBackgroundIndex(Math.floor(Math.random() * shareBackgrounds.length))
      setFontFamily(FONT_FAMILIES[Math.floor(Math.random() * FONT_FAMILIES.length)])
    }
  }, [isOpen])

  const generateImageDataUrl = () => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const size = 1080
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      const bgImg = new Image()
      bgImg.crossOrigin = 'anonymous'
      bgImg.src = shareBackgrounds[backgroundIndex]
      bgImg.onload = () => {
        try {
          ctx.drawImage(bgImg, 0, 0, size, size)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
          ctx.fillRect(0, 0, size, size)
          const padding = size * 0.05
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)'
          ctx.lineWidth = 3
          ctx.strokeRect(padding, padding, size - padding * 2, size - padding * 2)
          ctx.fillStyle = 'rgba(255, 215, 0, 0.2)'
          ctx.font = 'bold 180px Georgia, serif'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
          ctx.fillText('"', padding * 2, padding * 1.5)
          const maxWidth = size - padding * 6
          const lineHeight = 78
          let fontSize = 56
          let lines = []
          let currentLine = ''
          const words = content.split(' ')
          while (fontSize > 28) {
            ctx.font = `${fontSize}px ${fontFamily}`
            lines = []
            currentLine = ''
            for (const word of words) {
              const testLine = currentLine ? `${currentLine} ${word}` : word
              if (ctx.measureText(testLine).width > maxWidth) {
                lines.push(currentLine)
                currentLine = word
              } else {
                currentLine = testLine
              }
            }
            lines.push(currentLine)
            if (lines.length <= 8) break
            fontSize -= 4
          }
          ctx.fillStyle = '#ffffff'
          ctx.font = `${fontSize}px ${fontFamily}`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const startY = size * 0.32
          lines.forEach((line, i) => {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
            ctx.shadowBlur = 15
            ctx.fillText(line, size / 2, startY + i * lineHeight)
          })
          ctx.shadowBlur = 0
          const dividerY = startY + lines.length * lineHeight + 50
          ctx.fillStyle = 'rgba(255, 215, 0, 0.5)'
          ctx.shadowColor = 'rgba(255, 215, 0, 0.2)'
          ctx.shadowBlur = 15
          ctx.fillRect(size / 2 - 100, dividerY, 200, 3)
          ctx.shadowBlur = 0
          if (author && author !== 'Fact') {
            ctx.fillStyle = '#f0e6d3'
            ctx.font = `bold 44px ${fontFamily}`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
            ctx.shadowBlur = 15
            ctx.fillText(`— ${author}`, size / 2, dividerY + 25)
            ctx.shadowBlur = 0
          }
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
          ctx.font = '24px Arial, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(type || 'Zephye', size / 2, size - 90)
          ctx.fillStyle = 'rgba(255, 215, 0, 0.35)'
          ctx.font = 'bold 32px Arial, sans-serif'
          ctx.textAlign = 'right'
          ctx.textBaseline = 'bottom'
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
          ctx.shadowBlur = 10
          ctx.fillText('✦ Zephye', size - padding * 2, size - padding * 1.5)
          ctx.shadowBlur = 0
          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
          ctx.font = '18px Arial, sans-serif'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'bottom'
          ctx.fillText('zephye.vercel.app', padding * 2, size - padding * 1.5)
          resolve(canvas.toDataURL('image/png', 1.0))
        } catch (err) { reject(err) }
      }
      bgImg.onerror = () => reject(new Error('Failed to load background image'))
    })
  }

  const handleCopyText = async () => {
    const text = type === 'Fact'
      ? `${content}\n\n— via Zephye — zephye.vercel.app`
      : `"${content}" — ${author}\n\n— via Zephye — zephye.vercel.app`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareImage = async () => {
    if (!navigator.share) {
      alert('Web Share API is not supported on this device. Please use the "Download Image" button instead.')
      return
    }
    setIsGenerating(true)
    try {
      const imageDataUrl = await generateImageDataUrl()
      const fileName = `${(author || 'quote').replace(/\s/g, '_')}.png`
      const shareText = type === 'Fact' ? content : `"${content}" — ${author}`
      const response = await fetch(imageDataUrl)
      const blob = await response.blob()
      const file = new File([blob], fileName, { type: 'image/png' })
      const shareData = { title: type || 'Quote', text: shareText, files: [file] }
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        onClose()
      } else {
        alert('Cannot share image on this device. Please use "Download Image" instead.')
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Share failed:', err)
    } finally { setIsGenerating(false) }
  }

  const handleDownloadImage = async () => {
    setIsGenerating(true)
    try {
      const imageDataUrl = await generateImageDataUrl()
      const fileName = `${(author || 'quote').replace(/\s/g, '_')}.png`
      const link = document.createElement('a')
      link.download = fileName
      link.href = imageDataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading image:', error)
      alert('Failed to download image')
    } finally { setIsGenerating(false) }
  }

  const handleShareText = async () => {
    const text = type === 'Fact'
      ? `${content}\n\n— via Zephye — zephye.vercel.app`
      : `"${content}" — ${author}\n\n— via Zephye — zephye.vercel.app`
    if (navigator.share) {
      try { await navigator.share({ text }); onClose(); return }
      catch (err) { if (err.name !== 'AbortError') console.warn('Share failed:', err) }
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass share-modal" onClick={e => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose}><CloseIcon /></button>
        <div className="share-modal-header"><h3>Share {type || 'Quote'}</h3></div>
        <div className="share-modal-preview">
          <p className="share-modal-content">"{content}"</p>
          {author && author !== 'Fact' && <p className="share-modal-author">— {author}</p>}
        </div>
        <div className="share-modal-actions">
          <button className="share-btn-image" onClick={handleShareImage} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Share as Image'}
          </button>
          <button className="share-btn-download" onClick={handleDownloadImage} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Download Image'}
          </button>
          <button className="share-btn-text" onClick={handleShareText}>Share as Text</button>
          <button className={`share-btn-copy ${copied ? 'copied' : ''}`} onClick={handleCopyText}>
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// MAP MODAL
// ═══════════════════════════════════════════════════════════════════════

function MapModal({ isOpen, onClose }) {
  if (!isOpen) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass map-modal" onClick={e => e.stopPropagation()}>
        <button className="map-modal-close" onClick={onClose}><CloseIcon /></button>
        <div className="map-modal-icon">🗺️</div>
        <h3 className="map-modal-title">Map Features</h3>
        <div className="map-modal-badge">⚡ Undergoing Upgrade</div>
        <p className="map-modal-description">Some map features are being enhanced. Core functionality is still available.</p>
        <div className="map-modal-divider" />
        <div className="map-modal-helpers">
          <p className="map-modal-helpers-title">📌 How to use:</p>
          <div className="map-modal-helpers-list">
            <div><span>👆</span><span>Single tap — <span>Weather data</span></span></div>
            <div><span>👆👆</span><span>Double tap — <span>Pollen data</span></span></div>
            <div><span>👆⏱️</span><span>Long press / Right click — <span>Route calculation</span></span></div>
            <div><span>🚦</span><span>Traffic tab — <span>Live traffic + incidents</span></span></div>
          </div>
        </div>
        <button className="map-modal-btn" onClick={onClose}>Got it</button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════

const getAllQuotesPool = () => {
  const pool = []
  Object.keys(QUOTES).forEach(cat => {
    QUOTES[cat].forEach(q => pool.push({ ...q, tag: cat }))
  })
  return pool
}

const LOCAL_FACTS = {
  Science: [
    { text: "Octopuses have three hearts and blue blood." },
    { text: "A day on Venus is longer than a year on Venus." },
    { text: "Honey never spoils. Archaeologists found 3,000-year-old edible honey." },
    { text: "Bananas are berries, but strawberries aren't." },
    { text: "A cloud can weigh more than a million pounds." }
  ],
  History: [
    { text: "The shortest war in history lasted 38 minutes between Britain and Zanzibar in 1896." },
    { text: "Cleopatra lived closer in time to the Moon landing than to the building of the pyramids." },
    { text: "Oxford University is older than the Aztec Empire." }
  ],
  Animals: [
    { text: "A group of flamingos is called a flamboyance." },
    { text: "Sloths can hold their breath longer than dolphins." },
    { text: "Crows can recognize human faces and hold grudges." },
    { text: "A shrimp's heart is in its head." },
    { text: "Turritopsis dohrnii jellyfish is biologically immortal." }
  ],
  Space: [
    { text: "There are more stars in the universe than grains of sand on Earth." },
    { text: "One million Earths could fit inside the Sun." },
    { text: "A day on Mercury lasts 1,408 hours." },
    { text: "Neutron stars can spin 600 times per second." }
  ]
}

// ═══════════════════════════════════════════════════════════════════════
// WEATHER ICONS
// ═══════════════════════════════════════════════════════════════════════

function WeatherIcon({ code }) {
  if (code === 0 || code === 1) return <div className="weather-icon sunny-icon"><div className="sun">☀️</div><div className="sun-rays"></div></div>
  if (code >= 95) return <div className="weather-icon storm-icon"><div className="cloud">⛈️</div><div className="lightning">⚡</div><div className="rain-drop rain-1"></div><div className="rain-drop rain-2"></div><div className="rain-drop rain-3"></div></div>
  if (code >= 51 && code <= 82) return <div className="weather-icon rainy-icon"><div className="cloud">🌧️</div><div className="rain-drop rain-1"></div><div className="rain-drop rain-2"></div><div className="rain-drop rain-3"></div><div className="rain-drop rain-4"></div></div>
  if (code === 2) return <div className="weather-icon">🌤️</div>
  if (code === 3) return <div className="weather-icon">☁️</div>
  return <div className="weather-icon">⛅</div>
}

function WeatherEmoji({ code }) {
  if (code === 0) return '☀️'
  if (code === 1) return '🌤️'
  if (code === 2) return '⛅'
  if (code === 3) return '☁️'
  if (code >= 95) return '⛈️'
  if (code >= 71 && code <= 86) return '❄️'
  if (code >= 51) return '🌧️'
  return '☁️'
}

// ═══════════════════════════════════════════════════════════════════════
// HOURLY MODAL
// ═══════════════════════════════════════════════════════════════════════

function HourlyModal({ isOpen, onClose, hourlyData, locationName }) {
  if (!isOpen || !hourlyData) return null
  const getIcon = (code) => {
    const map = {
      0: '☀️', 1: '☀️', 2: '⛅', 3: '☁️',
      45: '🌫️', 48: '🌫️',
      51: '🌦️', 53: '🌦️', 55: '🌦️',
      61: '🌧️', 63: '🌧️', 65: '🌧️',
      71: '❄️', 73: '❄️', 75: '❄️',
      80: '🌧️', 81: '🌧️', 82: '🌧️',
      95: '⛈️', 96: '⛈️', 99: '⛈️'
    }
    return map[code] || '🌤️'
  }
  const getConditionName = (code) => {
    const map = {
      0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Fog',
      51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Heavy Drizzle',
      61: 'Light Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
      71: 'Light Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
      80: 'Rain Showers', 81: 'Heavy Showers', 82: 'Violent Showers',
      95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Heavy Thunderstorm'
    }
    return map[code] || 'Unknown'
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass hourly-modal" onClick={e => e.stopPropagation()}>
        <div className="hourly-modal-header">
          <div>
            <h3>Hourly Forecast</h3>
            <p>
              {locationName || 'Your location'} •{' '}
              {hourlyData.time?.[0] && new Date(hourlyData.time[0]).toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
          <button className="hourly-modal-close" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="hourly-modal-list">
          {(hourlyData.time || []).slice(0, 24).map((time, i) => {
            const temp = hourlyData.temperature_2m?.[i]
            const feelsLike = hourlyData.apparent_temperature?.[i]
            const code = hourlyData.weather_code?.[i] || 0
            const precip = hourlyData.precipitation_probability?.[i]
            const rain = hourlyData.precipitation?.[i]
            const wind = hourlyData.wind_speed_10m?.[i]
            const humidity = hourlyData.relative_humidity_2m?.[i]
            const pressure = hourlyData.pressure_msl?.[i]
            const gust = hourlyData.wind_gusts_10m?.[i]
            const isCurrentHour = i === 0
            return (
              <div key={time} className={`hourly-item ${isCurrentHour ? 'current' : ''}`}>
                <div className="hourly-time">
                  <div>{new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</div>
                  {isCurrentHour && <div className="hourly-now">Now</div>}
                </div>
                <div className="hourly-icon">{getIcon(code)}</div>
                <div className="hourly-temp">
                  <div>{Math.round(temp)}°</div>
                  {feelsLike && Math.round(feelsLike) !== Math.round(temp) && (
                    <div className="hourly-feels">feels {Math.round(feelsLike)}°</div>
                  )}
                </div>
                <div className="hourly-condition">{getConditionName(code)}</div>
                <div className="hourly-details">
                  {precip > 0 && <span>🌧️ {Math.round(precip)}%</span>}
                  {rain > 0 && <span>💧 {Math.round(rain * 10) / 10}mm</span>}
                  {wind > 0 && <span>💨 {Math.round(wind)} km/h</span>}
                  {gust > 15 && <span className="hourly-gust">⚡{Math.round(gust)}</span>}
                  {humidity > 0 && <span>💧 {Math.round(humidity)}%</span>}
                  {pressure > 0 && <span>📊 {Math.round(pressure)} hPa</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// EXPANDED WEATHER DETAILS PANEL
// ═══════════════════════════════════════════════════════════════════════

function WeatherDetailsPanel({ weather, aqi, onClose }) {
  if (!weather) return null
  const cur = weather.current || {}
  const hourly = weather.hourly || {}
  const daily = weather.daily || {}
  const h0 = (key) => hourly?.[key]?.[0]
  const d0 = (key) => daily?.[key]?.[0]

  const sections = [
    {
      title: 'Temperature', icon: '🌡️',
      rows: [
        { label: 'Current', value: cur.temperature_2m != null ? `${Math.round(cur.temperature_2m)}°C` : null },
        { label: 'Feels like', value: cur.apparent_temperature != null ? `${Math.round(cur.apparent_temperature)}°C` : null },
        { label: 'High / Low', value: d0('temperature_2m_max') != null && d0('temperature_2m_min') != null ? `${Math.round(d0('temperature_2m_max'))}° / ${Math.round(d0('temperature_2m_min'))}°` : null },
        { label: 'Feels range', value: d0('apparent_temperature_max') != null && d0('apparent_temperature_min') != null ? `${Math.round(d0('apparent_temperature_max'))}° / ${Math.round(d0('apparent_temperature_min'))}°` : null },
        { label: 'Dew point', value: h0('dew_point_2m') != null ? `${Math.round(h0('dew_point_2m'))}°C` : (cur.dew_point != null ? `${Math.round(cur.dew_point)}°C` : null) },
      ],
    },
    {
      title: 'Wind', icon: '💨',
      rows: [
        { label: 'Speed', value: cur.wind_speed_10m != null ? `${Math.round(cur.wind_speed_10m)} km/h ${getWindDirection(cur.wind_direction_10m)}` : null },
        { label: 'Gusts', value: cur.wind_gusts_10m != null ? `${Math.round(cur.wind_gusts_10m)} km/h` : null },
        { label: 'Max today', value: d0('wind_speed_10m_max') != null ? `${Math.round(d0('wind_speed_10m_max'))} km/h` : null },
        { label: 'Max gusts', value: d0('wind_gusts_10m_max') != null ? `${Math.round(d0('wind_gusts_10m_max'))} km/h` : null },
        { label: 'Dominant dir', value: d0('wind_direction_10m_dominant') != null ? getWindDirection(d0('wind_direction_10m_dominant')) : null },
      ],
    },
    {
      title: 'Precipitation', icon: '🌧️',
      rows: [
        { label: 'Chance', value: h0('precipitation_probability') != null ? `${Math.round(h0('precipitation_probability'))}%` : (d0('precipitation_probability_max') != null ? `${Math.round(d0('precipitation_probability_max'))}%` : null) },
        { label: 'Current', value: cur.precipitation != null ? `${cur.precipitation.toFixed(1)} mm` : null },
        { label: 'Today', value: d0('precipitation_sum') != null ? `${d0('precipitation_sum').toFixed(1)} mm` : null },
        { label: 'Rain total', value: d0('rain_sum') != null ? `${d0('rain_sum').toFixed(1)} mm` : null },
        { label: 'Hours', value: d0('precipitation_hours') != null ? `${d0('precipitation_hours')}h expected` : null },
      ],
    },
    {
      title: 'Atmosphere', icon: '🌫️',
      rows: [
        { label: 'Humidity', value: cur.relative_humidity_2m != null ? `${Math.round(cur.relative_humidity_2m)}%` : null },
        { label: 'Avg humidity', value: d0('relative_humidity_2m_mean') != null ? `${Math.round(d0('relative_humidity_2m_mean'))}%` : null },
        { label: 'Pressure', value: cur.pressure_msl != null ? `${Math.round(cur.pressure_msl)} hPa (${getPressureTrend(cur.pressure_msl)})` : null },
        { label: 'Surface', value: cur.surface_pressure != null ? `${Math.round(cur.surface_pressure)} hPa` : null },
        { label: 'Visibility', value: h0('visibility') != null ? `${(h0('visibility') / 1000).toFixed(1)} km` : null },
        { label: 'Cloud cover', value: cur.cloud_cover != null ? `${Math.round(cur.cloud_cover)}%` : null },
      ],
    },
    {
      title: 'Sun & UV', icon: '☀️',
      rows: [
        { label: 'UV index', value: h0('uv_index') != null ? `${Math.round(h0('uv_index'))} (${getUvLabel(h0('uv_index'))})` : (d0('uv_index_max') != null ? `${Math.round(d0('uv_index_max'))} (${getUvLabel(d0('uv_index_max'))})` : null) },
        { label: 'Burn time', value: getBurnTime(h0('uv_index') ?? d0('uv_index_max')) },
        { label: 'Sunrise', value: d0('sunrise') ? formatTime(d0('sunrise')) : null },
        { label: 'Sunset', value: d0('sunset') ? formatTime(d0('sunset')) : null },
        { label: 'Daylight', value: d0('daylight_duration') != null ? formatDuration(d0('daylight_duration')) : null },
        { label: 'Sunshine', value: d0('sunshine_duration') != null ? formatDuration(d0('sunshine_duration')) : null },
      ],
    },
    {
      title: 'Radiation', icon: '🔆',
      rows: [
        { label: 'Shortwave', value: h0('shortwave_radiation') != null ? `${Math.round(h0('shortwave_radiation'))} W/m²` : null },
        { label: 'Daily sum', value: d0('shortwave_radiation_sum') != null ? `${d0('shortwave_radiation_sum').toFixed(1)} MJ/m²` : null },
      ],
    },
    {
      title: 'Air quality', icon: '🫁',
      rows: [
        { label: 'AQI (US)', value: aqi?.us_aqi != null ? `${aqi.us_aqi} (${getAqiLabelFor(aqi.us_aqi)})` : null },
        { label: 'PM2.5', value: aqi?.pm2_5 != null ? `${aqi.pm2_5.toFixed(1)} µg/m³` : null },
        { label: 'PM10', value: aqi?.pm10 != null ? `${aqi.pm10.toFixed(1)} µg/m³` : null },
        { label: 'Ozone', value: aqi?.ozone != null ? `${aqi.ozone.toFixed(1)} µg/m³` : null },
        { label: 'NO₂', value: aqi?.nitrogen_dioxide != null ? `${aqi.nitrogen_dioxide.toFixed(1)} µg/m³` : null },
        { label: 'CO', value: aqi?.carbon_monoxide != null ? `${aqi.carbon_monoxide.toFixed(1)} µg/m³` : null },
        { label: 'SO₂', value: aqi?.sulphur_dioxide != null ? `${aqi.sulphur_dioxide.toFixed(1)} µg/m³` : null },
      ],
    },
  ]

  return (
    <div
      className="glass weather-details-panel"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: 0,
        maxWidth: 480,
        maxHeight: '70vh',
        overflowY: 'auto',
        padding: '20px',
        zIndex: 99999,
        borderRadius: 16,
        background: 'rgba(15, 23, 42, 0.98)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 16px 64px rgba(0, 0, 0, 0.6)',
      }}
    >
      <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
        <p className="font-bold" style={{ fontSize: 14 }}>Weather Details</p>
        <button onClick={onClose} className="btn-ghost" style={{ fontSize: 18, lineHeight: 1, padding: '2px 8px' }}>×</button>
      </div>

      {sections.map((section, si) => {
        const visibleRows = section.rows.filter(r => r.value != null && r.value !== '')
        if (visibleRows.length === 0) return null
        return (
          <div key={section.title} style={{ marginBottom: si === sections.length - 1 ? 0 : 18 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.6px',
              marginBottom: 8, paddingBottom: 6,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ fontSize: 13 }}>{section.icon}</span>
              <span>{section.title}</span>
            </div>
            {visibleRows.map((row, ri) => (
              <div key={ri} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'baseline', padding: '5px 0',
                fontSize: 13, gap: 12,
              }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{row.label}</span>
                <span style={{ color: 'var(--text)', fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// LOCATIONS SUB-TAB
// ═══════════════════════════════════════════════════════════════════════

function LocationsSubTab({
  savedLocations,
  homeLocation,
  currentLocation,
  onSwitchToLocation,
  onDeleteLocation,
  onSaveCurrent,
  onAddNew,
  onEditLocation,
  onShareLocation,
}) {
  const [weatherMap, setWeatherMap] = useState({})
  const [loading, setLoading] = useState(false)

  const allLocations = useMemo(() => {
    const list = []
    if (homeLocation?.lat != null) {
      list.push({ ...homeLocation, id: 'home', isHome: true, label: homeLocation.label || 'Home' })
    }
    savedLocations.forEach(l => {
      const dupe = homeLocation && Math.abs(l.lat - homeLocation.lat) < 0.001 && Math.abs(l.lon - homeLocation.lon) < 0.001
      if (!dupe) list.push(l)
    })
    return list
  }, [savedLocations, homeLocation])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (allLocations.length === 0) return
      setLoading(true)
      try {
        const coords = allLocations.map(l => ({ lat: l.lat, lon: l.lon }))
        const results = await fetchWeatherBatch(coords)
        if (cancelled) return
        const map = {}
        results.forEach((w, i) => {
          const key = allLocations[i]?.id ?? `idx-${i}`
          if (w) {
            map[key] = {
              temp: w.current?.temperature_2m,
              code: w.current?.weather_code ?? 0,
              full: w,
            }
          }
        })
        setWeatherMap(map)
      } catch (err) {
        console.error('[LocationsSubTab] batch fetch failed:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [allLocations])

  const handleShare = async (loc) => {
    let fullWeather = weatherMap[loc.id]?.full
    if (!fullWeather) {
      try { fullWeather = await fetchWeather(loc.lat, loc.lon) } catch {}
    }
    let locAqi = null
    try { locAqi = await fetchAqi(loc.lat, loc.lon) } catch {}
    onShareLocation(loc, fullWeather, locAqi)
  }

  return (
    <div className="locations-sub-tab">
      {currentLocation && (
        <div className="current-location-card" style={{ marginBottom: 16 }}>
          <div className="loc-info">
            <div className="loc-label">CURRENT LOCATION</div>
            <div className="loc-name">{currentLocation.name}</div>
            <div className="loc-coords">
              {currentLocation.lat?.toFixed?.(2)}, {currentLocation.lon?.toFixed?.(2)}
            </div>
          </div>
          <button className="save-btn" onClick={onSaveCurrent}>
            <AddIcon /> Save
          </button>
        </div>
      )}

      {allLocations.length === 0 ? (
        <div className="saved-locations-empty">
          <div className="empty-icon">📍</div>
          <div className="empty-title">No saved locations yet</div>
          <div className="empty-subtitle">Save your favourite places for quick access</div>
          <button onClick={onAddNew} className="btn-primary" style={{ marginTop: 12 }}>
            Add Location
          </button>
        </div>
      ) : (
        <div className="locations-grid">
          {allLocations.map((loc) => {
            const w = weatherMap[loc.id]
            const code = w?.code ?? 0
            const temp = w?.temp
            return (
              <div key={loc.id} className="location-glance-card">
                <div className="lg-header">
                  <span className="lg-pin">{loc.isHome ? '🏠' : '📍'}</span>
                  <div className="lg-titles">
                    <div className="lg-label">{loc.label || loc.name || 'Location'}</div>
                    <div className="lg-sub">{loc.name}</div>
                  </div>
                  {loc.isHome && <span className="lg-badge">HOME</span>}
                </div>

                <div className="lg-weather">
                  <div className="lg-emoji">{WeatherEmoji({ code })}</div>
                  <div className="lg-temp">
                    {loading && temp == null ? '…' : temp != null ? `${Math.round(temp)}°C` : '—'}
                  </div>
                </div>

                <div className="lg-actions">
                  <button className="lg-btn" onClick={() => onSwitchToLocation(loc)}>Open</button>
                  {!loc.isHome && (
                    <>
                      <button className="lg-btn" onClick={() => onEditLocation(loc.id)}><EditIcon /></button>
                      <button className="lg-btn danger" onClick={() => onDeleteLocation(loc.id)}><DeleteIcon /></button>
                    </>
                  )}
                  <button className="lg-btn share" onClick={() => handleShare(loc)}>
                    <ShareIcon size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {allLocations.length > 0 && (
        <button className="add-location-btn" onClick={onAddNew} style={{ marginTop: 16 }}>
          <AddIcon /> Add Another Location
        </button>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// APP CONTENT INNER
// ═══════════════════════════════════════════════════════════════════════

function AppContentInner({ homeLocation, setHomeLocation }) {
  const { uiLanguage } = useLanguage()
  const { t } = useTranslation(uiLanguage, homeLocation?.country_code)

  const [tab, setTab] = useState('weather')
  const [weather, setWeather] = useState(null)
  const [aqi, setAqi] = useState(null)
  const [quoteOfDay, setQuoteOfDay] = useState(null)
  const [toast, setToast] = useState('')
  const [location, setLocation] = useState({ lat: 6.5244, lon: 3.3792, name: 'Lagos, Nigeria', country_code: 'NG' })
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showAirDropdown, setShowAirDropdown] = useState(false)
  const [citySearch, setCitySearch] = useState('')
  const [isManualLocation, setIsManualLocation] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [savedLocations, setSavedLocations] = useState(() => {
    const saved = localStorage.getItem('zephye_saved_locations')
    return saved ? JSON.parse(saved) : []
  })
  const [previousLocation, setPreviousLocation] = useState(null)
  const [showSavedPanel, setShowSavedPanel] = useState(false)
  const [editingLocId, setEditingLocId] = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editMode, setEditMode] = useState('manual')
  const [editGPSLoading, setEditGPSLoading] = useState(false)
  const [editGPSError, setEditGPSError] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [todayStats, setTodayStats] = useState({
    sunHours: 0, rainHours: 0, thunderHours: 0, maxRainProb: 0,
    rainPeriods: [], sunrise: '--:--', sunset: '--:--',
    feelsLike: 0, windGust: 0, pressureTrend: '→'
  })
  const [hasWelcomed, setHasWelcomed] = useState(false)
  const [voiceToUse, setVoiceToUse] = useState('en-US-JennyNeural')
  const [showHourlyModal, setShowHourlyModal] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [shareModal, setShareModal] = useState({ isOpen: false, content: '', author: '', type: '' })
  const [weatherShare, setWeatherShare] = useState({
    isOpen: false, type: 'current',
    overrideWeather: null, overrideLocation: null, overrideAqi: null, overrideStats: null,
    comparisonItems: null, comparisonTakeaway: '',
  })

  const [firedSchedules, setFiredSchedules] = useState([])
  const [showSchedulesPanel, setShowSchedulesPanel] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState(null)
  const [prefilledScheduleData, setPrefilledScheduleData] = useState(null)
  const scheduleCheckRef = useRef(null)

  useEffect(() => {
    if (!homeLocation && location && location.name && location.name !== 'Lagos, Nigeria' && location.country_code) {
      const home = { ...location, label: 'Home', id: Date.now() }
      setHomeLocation(home)
      localStorage.setItem('zephye_home_location', JSON.stringify(home))
      const exists = savedLocations.find(loc => loc.label === 'Home')
      if (!exists) setSavedLocations(prev => [home, ...prev])
    }
  }, [location, homeLocation, savedLocations, setHomeLocation])

  useEffect(() => {
    if (tab === 'map') {
      const hasSeenMapModal = localStorage.getItem('zephye_seen_map_modal')
      if (!hasSeenMapModal) {
        setShowMapModal(true)
        localStorage.setItem('zephye_seen_map_modal', 'true')
      }
    }
  }, [tab])

  useEffect(() => {
    localStorage.setItem('zephye_saved_locations', JSON.stringify(savedLocations))
  }, [savedLocations])

  useEffect(() => {
    const autoVoice = getVoiceForLocation(null, location?.country_code, 'female')
    setVoiceToUse(autoVoice)
    localStorage.setItem('weatherman_voice', autoVoice)
  }, [location?.country_code])

  useEffect(() => {
    fetch('https://hyezen.onrender.com/api/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: Date.now(),
        user: localStorage.getItem('weatherman_name') || 'anonymous',
        location: location.name
      })
    }).catch(() => {})

    const savedLoc = localStorage.getItem('zephye_location')
    const savedManual = localStorage.getItem('zephye_isManual')
    if (savedLoc && savedManual === 'true') {
      try {
        const loc = JSON.parse(savedLoc)
        setLocation(loc)
        setIsManualLocation(true)
        fetchWeatherData(loc.lat, loc.lon)
      } catch { initLocation() }
    } else { initLocation() }
    fetchQuoteOfDay()
  }, [])

  useEffect(() => {
    if (!hasWelcomed && weather && !isLoading) {
      setTimeout(() => showToast(t('toasts.welcome') || 'Welcome to Zephye'), 1000)
      setHasWelcomed(true)
    }
  }, [weather, isLoading])

  useEffect(() => {
    let mounted = true
    const runCheck = async () => {
      try {
        const fired = await checkDueSchedules()
        if (!mounted) return
        if (fired && fired.length > 0) {
          setFiredSchedules(prev => [...prev, ...fired])
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            for (const f of fired) {
              try {
                new Notification('Zephye — Schedule Ready', {
                  body: f.toastSummary || 'Your scheduled check is ready.',
                  tag: f.schedule.id,
                  icon: '/favicon.ico'
                })
              } catch {}
            }
          }
        }
      } catch (e) {
        console.error('[App] schedule check failed:', e)
      }
    }
    runCheck()
    scheduleCheckRef.current = setInterval(runCheck, 60000)
    return () => {
      mounted = false
      if (scheduleCheckRef.current) clearInterval(scheduleCheckRef.current)
    }
  }, [])

  useEffect(() => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'default') {
      const timer = setTimeout(() => {
        Notification.requestPermission().catch(() => {})
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Share comparison event listener
  useEffect(() => {
    const handler = (e) => {
      const { items, takeaway } = e.detail || {}
      if (!items || items.length === 0) return
      setWeatherShare({
        isOpen: true,
        type: 'comparison',
        overrideWeather: null,
        overrideLocation: location,
        overrideAqi: null,
        overrideStats: null,
        comparisonItems: items,
        comparisonTakeaway: takeaway || '',
      })
    }
    window.addEventListener('zephye:shareComparison', handler)
    return () => window.removeEventListener('zephye:shareComparison', handler)
  }, [location])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }
  const shareQuote = (text, author) => {
    setShareModal({ isOpen: true, content: text, author: author || 'Unknown', type: 'Quote' })
  }
  const shareFact = (text) => {
    setShareModal({ isOpen: true, content: text, author: 'Fact', type: 'Fact' })
  }

  const addNewLocation = () => {
    const newLoc = {
      id: Date.now(), label: '',
      lat: location.lat, lon: location.lon,
      name: location.name, country_code: location.country_code
    }
    setSavedLocations(prev => [...prev, newLoc])
    setEditingLocId(newLoc.id)
    setEditLabel('')
    setEditCity('')
    setEditMode('manual')
    setEditGPSError(null)
    setSearchResults([])
    setShowSavedPanel(true)
  }

  const searchPlaceForLocation = async (query) => {
    if (!query || query.length < 2) { setSearchResults([]); return }
    setIsSearching(true)
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`)
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results.map(r => ({
          id: r.id,
          name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`,
          lat: r.latitude, lon: r.longitude,
          country_code: r.country_code?.toUpperCase() || 'US',
          elevation: r.elevation ?? null,
          population: r.population ?? null
        })))
      } else { setSearchResults([]) }
    } catch { setSearchResults([]) }
    setIsSearching(false)
  }

  const selectPlaceForLocation = (locId, place) => {
    setSavedLocations(prev => prev.map(loc =>
      loc.id === locId
        ? { ...loc, lat: place.lat, lon: place.lon, name: place.name, country_code: place.country_code, elevation: place.elevation, population: place.population }
        : loc
    ))
    setSearchResults([])
    setEditCity('')
    showToast(`Location updated to ${place.name}`)
  }

  const updateLocationLabel = (locId, label) => {
    setSavedLocations(prev => prev.map(loc =>
      loc.id === locId ? { ...loc, label: label || 'Untitled Location' } : loc
    ))
  }

  const saveLocationEdits = () => {
    setEditingLocId(null)
    setEditLabel('')
    setEditCity('')
    setSearchResults([])
    setEditGPSError(null)
    showToast(t('toasts.locationUpdated') || 'Location updated')
  }

  const deleteLocation = (locId) => {
    setSavedLocations(prev => prev.filter(loc => loc.id !== locId))
    if (editingLocId === locId) setEditingLocId(null)
    showToast(t('toasts.locationRemoved') || 'Location removed')
  }

  const switchToSavedLocation = (savedLoc) => {
    if (!previousLocation) {
      setPreviousLocation({
        lat: location.lat, lon: location.lon, name: location.name,
        country_code: location.country_code, isManual: isManualLocation
      })
    }
    const nl = { lat: savedLoc.lat, lon: savedLoc.lon, name: savedLoc.name, country_code: savedLoc.country_code }
    setLocation(nl)
    setIsManualLocation(true)
    localStorage.setItem('zephye_location', JSON.stringify(nl))
    localStorage.setItem('zephye_isManual', 'true')
    fetchWeatherData(savedLoc.lat, savedLoc.lon)
    setShowSavedPanel(false)
    setTab('weather')
    showToast(`Showing weather for ${savedLoc.label || savedLoc.name}`)
  }

  const goBackToOriginalLocation = () => {
    if (!previousLocation) return
    const ol = {
      lat: previousLocation.lat, lon: previousLocation.lon,
      name: previousLocation.name, country_code: previousLocation.country_code
    }
    setLocation(ol)
    setIsManualLocation(previousLocation.isManual || false)
    if (previousLocation.isManual) {
      localStorage.setItem('zephye_location', JSON.stringify(ol))
      localStorage.setItem('zephye_isManual', 'true')
    } else {
      localStorage.removeItem('zephye_location')
      localStorage.removeItem('zephye_isManual')
    }
    fetchWeatherData(ol.lat, ol.lon)
    setPreviousLocation(null)
    showToast('Back to original location')
  }

  const saveCurrentLocation = () => {
    const exists = savedLocations.find(loc =>
      Math.abs(loc.lat - location.lat) < 0.01 &&
      Math.abs(loc.lon - location.lon) < 0.01
    )
    if (exists) {
      const base = exists.label || exists.name || 'Location'
      const existingLabels = savedLocations.map(l => l.label).filter(Boolean)
      let count = 2
      while (existingLabels.includes(`${base} ${count}`)) count++
      const finalLabel = `${base} ${count}`
      const newLoc = {
        id: Date.now(), label: finalLabel,
        lat: location.lat, lon: location.lon,
        name: location.name, country_code: location.country_code
      }
      setSavedLocations(prev => [...prev, newLoc])
      showToast(`Saved as "${finalLabel}"`)
      return
    }
    const nl = {
      id: Date.now(), label: '',
      lat: location.lat, lon: location.lon,
      name: location.name, country_code: location.country_code
    }
    setSavedLocations(prev => [...prev, nl])
    setEditingLocId(nl.id)
    setEditLabel('')
    setEditCity('')
    setEditMode('manual')
    setSearchResults([])
    setShowSavedPanel(true)
    showToast(t('toasts.locationSaved') || 'Location saved. Edit label to name it.')
  }

  const captureCurrentGPSForEdit = () => {
    if (!navigator.geolocation) { setEditGPSError('GPS not supported'); return }
    setEditGPSLoading(true)
    setEditGPSError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`,
            { headers: { 'User-Agent': 'Zephye-App/1.0', 'Accept-Language': uiLanguage || 'en' } }
          )
          const data = await res.json()
          const lga = data.address.county?.replace(' Local Government Area', '') || data.address.town || data.address.city || data.address.village || 'Current Location'
          const name = `${lga}, ${data.address.state || 'State'}, ${data.address.country || 'Country'}`
          const cc = data.address.country_code?.toUpperCase() || 'US'
          setSavedLocations(prev => prev.map(loc =>
            loc.id === editingLocId ? { ...loc, lat, lon, name, country_code: cc } : loc
          ))
        } catch {
          setSavedLocations(prev => prev.map(loc =>
            loc.id === editingLocId ? { ...loc, lat, lon, name: 'Current Location', country_code: 'US' } : loc
          ))
        }
        setEditGPSLoading(false)
      },
      () => {
        setEditGPSError(t('toasts.gpsUnavailable') || 'Location unavailable. Try again or use Manual.')
        setEditGPSLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const fetchQuoteOfDay = () => {
    const pool = getAllQuotesPool()
    const today = new Date().toISOString().split('T')[0]
    const dn = Math.floor((new Date(today).getTime() - new Date('2024-01-01').getTime()) / 86400000)
    setQuoteOfDay(pool[dn % pool.length])
  }

  const calculateTodayStats = (hourly, daily) => {
    if (!hourly?.time) return
    let sunHours = 0, rainHours = 0, thunderHours = 0, maxRainProb = 0, currentRainPeriod = null
    const rainPeriods = []
    hourly.time.slice(0, 24).forEach((time, i) => {
      const code = hourly.weather_code?.[i] || 0
      const prob = hourly.precipitation_probability?.[i] || 0
      const precip = hourly.precipitation?.[i] || 0
      if (code === 0 || code === 1) sunHours++
      if (prob > 30 || precip > 0.1) {
        rainHours++
        const hour = new Date(time).getHours()
        if (!currentRainPeriod) currentRainPeriod = { start: hour, end: hour }
        else if (hour === currentRainPeriod.end + 1) currentRainPeriod.end = hour
        else {
          rainPeriods.push(`${currentRainPeriod.start}:00-${currentRainPeriod.end + 1}:00`)
          currentRainPeriod = { start: hour, end: hour }
        }
      } else if (currentRainPeriod) {
        rainPeriods.push(`${currentRainPeriod.start}:00-${currentRainPeriod.end + 1}:00`)
        currentRainPeriod = null
      }
      if (code >= 95) thunderHours++
      if (prob > maxRainProb) maxRainProb = prob
    })
    if (currentRainPeriod) rainPeriods.push(`${currentRainPeriod.start}:00-${currentRainPeriod.end + 1}:00`)
    setTodayStats({
      sunHours, rainHours, thunderHours, maxRainProb, rainPeriods,
      sunrise: daily?.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--',
      sunset: daily?.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--',
      feelsLike: hourly?.apparent_temperature?.[0] || 0,
      windGust: hourly?.wind_gusts_10m?.[0] || 0,
      pressureTrend: '→'
    })
  }

  const initLocation = async () => {
    if (!navigator.geolocation) { fetchWeatherData(6.5244, 3.3792); return }
    try {
      const p = await navigator.permissions.query({ name: 'geolocation' })
      if (p.state === 'granted' || p.state === 'prompt') getCurrentLocation()
      else fetchWeatherData(6.5244, 3.3792)
    } catch { getCurrentLocation() }
  }

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        reverseGeocode(pos.coords.latitude, pos.coords.longitude)
        fetchWeatherData(pos.coords.latitude, pos.coords.longitude)
        setIsManualLocation(false)
        localStorage.removeItem('zephye_location')
        localStorage.removeItem('zephye_isManual')
      },
      () => {
        showToast(t('toasts.locationDenied') || 'Location denied')
        fetchWeatherData(6.5244, 3.3792)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`,
        { headers: { 'User-Agent': 'Zephye-App/1.0', 'Accept-Language': uiLanguage || 'en' } }
      )
      const data = await res.json()
      const lga = data.address.county?.replace(' Local Government Area', '') || data.address.town || data.address.city || data.address.village || 'Current Location'
      setLocation({
        lat, lon,
        name: `${lga}, ${data.address.state || 'State'}, ${data.address.country || 'Country'}`,
        country_code: data.address.country_code?.toUpperCase() || 'US'
      })
      setIsManualLocation(false)
      localStorage.removeItem('zephye_location')
      localStorage.removeItem('zephye_isManual')
    } catch {
      setLocation({ lat, lon, name: 'Current Location', country_code: 'US' })
    }
  }

  const searchCity = async () => {
    if (!citySearch.trim()) { showToast(t('toasts.typePlace') || 'Type a place name'); return }
    try {
      let res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(citySearch)}&count=5&language=en&format=json`)
      let data = await res.json()
      if (!data.results?.length) {
        const owRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(citySearch)}&limit=5&appid=${OPENWEATHER_KEY}`)
        const owData = await owRes.json()
        if (!owData?.length) { showToast(t('toasts.placeNotFound') || 'Place not found'); return }
        const r = owData[0]
        const dn = `${r.name}${r.state ? ', ' + r.state : ''}, ${r.country}`
        const nl = { lat: r.lat, lon: r.lon, name: dn, country_code: r.country?.slice(0, 2)?.toUpperCase() || 'US' }
        setLocation(nl); setIsManualLocation(true)
        localStorage.setItem('zephye_location', JSON.stringify(nl))
        localStorage.setItem('zephye_isManual', 'true')
        fetchWeatherData(r.lat, r.lon)
        setShowLocationModal(false); setCitySearch('')
        showToast(`Location: ${dn}`)
        return
      }
      const r = data.results[0]
      const dn = `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`
      const nl = { lat: r.latitude, lon: r.longitude, name: dn, country_code: r.country_code?.toUpperCase() || 'US' }
      setLocation(nl); setIsManualLocation(true)
      localStorage.setItem('zephye_location', JSON.stringify(nl))
      localStorage.setItem('zephye_isManual', 'true')
      fetchWeatherData(r.latitude, r.longitude)
      setShowLocationModal(false); setCitySearch('')
      showToast(`Location: ${r.name}`)
    } catch { showToast(t('toasts.searchFailed') || 'Search failed') }
  }

  const fetchWeatherData = async (lat, lon) => {
    try {
      setIsLoading(true)
      const [w, a] = await Promise.all([
        fetchWeather(lat, lon),
        fetchAqi(lat, lon),
      ])
      if (w) {
        setWeather(w)
        calculateTodayStats(w.hourly, w.daily)
      }
      if (a) setAqi(a)
      setIsLoading(false)

      try {
        checkAndNotify(w, a, { lat, lon, name: location?.name })
      } catch (err) {
        console.warn('[alerts]', err)
      }
    } catch (err) {
      console.error('[fetchWeatherData]', err)
      showToast(t('toasts.weatherFailed') || 'Weather failed')
      setIsLoading(false)
    }
  }

  const saveQuote = (quote) => {
    if (!quote) return
    const saved = JSON.parse(localStorage.getItem('zephye_saved_quotes') || '[]')
    saved.unshift({
      id: Date.now(),
      quote_text: quote.content || quote.text,
      quote_author: quote.author || 'Unknown',
      category: quote.tag || 'Motivational',
      created_at: new Date().toISOString()
    })
    localStorage.setItem('zephye_saved_quotes', JSON.stringify(saved))
    showToast(t('toasts.quoteSaved') || 'Quote saved')
  }

  const saveFact = (fact) => {
    if (!fact) return
    const saved = JSON.parse(localStorage.getItem('zephye_saved_facts') || '[]')
    saved.unshift({ id: Date.now(), fact_text: fact.text, created_at: new Date().toISOString() })
    localStorage.setItem('zephye_saved_facts', JSON.stringify(saved))
    showToast(t('toasts.factSaved') || 'Fact saved')
  }

  const getWeatherClass = (c) => c === 0 || c === 1 ? 'sunny' : c >= 95 ? 'thunder' : c >= 51 && c <= 82 ? 'rainy' : 'cloudy'
  const getWeatherIcon = (c) => c === 0 ? '☀️' : c === 1 ? '🌤️' : c === 2 ? '⛅' : c === 3 ? '☁️' : c >= 95 ? '⛈️' : c >= 51 ? '🌧️' : '☁️'
  const getStormLevel = (c, w) => c >= 95 ? { level: 'Severe Thunderstorm', color: '#dc2626' } : c >= 65 || w > 50 ? { level: 'Heavy Storm', color: '#f97316' } : c >= 61 || w > 30 ? { level: 'Moderate Rain', color: '#eab308' } : c >= 51 ? { level: 'Light Rain', color: '#22c55e' } : null
  const getAqiLevel = (a) => a == null ? { label: 'Unknown', color: '#6b7280' } : a <= 50 ? { label: 'Good', color: '#22c55e' } : a <= 100 ? { label: 'Moderate', color: '#eab308' } : a <= 150 ? { label: 'Unhealthy', color: '#f97316' } : { label: 'Hazardous', color: '#ef4444' }

  const wc = weather?.current?.weather_code ?? 0
  const ws = weather?.current?.wind_speed_10m ?? 0
  const aqiInfo = getAqiLevel(aqi?.us_aqi)
  const stormInfo = getStormLevel(wc, ws)

  if (isLoading && !weather) return (
    <div className="app">
      <div className="weather-bg cloudy"></div>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="glass" style={{ padding: '40px', borderRadius: '20px', textAlign: 'center' }}>
          <div className="text-4xl mb-4">🌤️</div>
          <p className="text-xl font-bold">{t('buttons.loading') || 'Loading'} Zephye...</p>
        </div>
      </div>
    </div>
  )

  const handleShareSavedLocation = (loc, locWeather, locAqi) => {
    if (!locWeather) {
      showToast('Could not load weather for that location')
      return
    }
    const locStats = {
      sunHours: 0, rainHours: 0, thunderHours: 0, maxRainProb: 0,
      rainPeriods: [], sunrise: '--:--', sunset: '--:--',
      feelsLike: locWeather.current?.apparent_temperature || 0,
      windGust: locWeather.current?.wind_gusts_10m || 0,
      pressureTrend: '→'
    }
    setWeatherShare({
      isOpen: true,
      type: 'current',
      overrideWeather: locWeather,
      overrideLocation: { name: loc.name, lat: loc.lat, lon: loc.lon, country_code: loc.country_code },
      overrideAqi: locAqi,
      overrideStats: locStats,
      comparisonItems: null,
      comparisonTakeaway: '',
    })
  }

  const shareWeatherForCurrent = () => {
    setWeatherShare({
      isOpen: true, type: 'current',
      overrideWeather: null, overrideLocation: null, overrideAqi: null, overrideStats: null,
      comparisonItems: null, comparisonTakeaway: '',
    })
  }

  return (
    <div className="app">
      <div className={`weather-bg ${getWeatherClass(wc)}`}></div>
      {toast && <div className="toast">{toast}</div>}

      <MapModal isOpen={showMapModal} onClose={() => setShowMapModal(false)} />

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, content: '', author: '', type: '' })}
        content={shareModal.content}
        author={shareModal.author}
        type={shareModal.type}
      />

      <WeatherShareModal
        isOpen={weatherShare.isOpen}
        onClose={() => setWeatherShare({
          isOpen: false, type: 'current',
          overrideWeather: null, overrideLocation: null, overrideAqi: null, overrideStats: null,
          comparisonItems: null, comparisonTakeaway: '',
        })}
        initialType={weatherShare.type}
        weather={weatherShare.overrideWeather || weather}
        location={weatherShare.overrideLocation || location}
        todayStats={weatherShare.overrideStats || todayStats}
        aqi={weatherShare.overrideAqi || aqi}
        uiLanguage={uiLanguage}
        comparisonItems={weatherShare.comparisonItems}
        comparisonTakeaway={weatherShare.comparisonTakeaway}
      />

      <ScheduleToast
        firedResults={firedSchedules}
        onDismiss={() => setFiredSchedules([])}
        onEdit={(scheduleId) => {
          setEditingScheduleId(scheduleId)
          setShowSchedulesPanel(true)
        }}
        onOpenSchedules={() => setShowSchedulesPanel(true)}
        onCopyToChat={(firedResult) => {
          setTab('ai')
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('zephye:pushMessage', {
              detail: {
                role: 'assistant',
                content: firedResult.merged
              }
            }))
          }, 400)
        }}
      />

      {showSchedulesPanel && (
        <ScheduleAskPanel
          onClose={() => {
            setShowSchedulesPanel(false)
            setEditingScheduleId(null)
            setPrefilledScheduleData(null)
          }}
          savedLocations={savedLocations}
          homeLocation={
            homeLocation
              ? { lat: homeLocation.lat, lon: homeLocation.lon, label: homeLocation.label || homeLocation.name }
              : location
                ? { lat: location.lat, lon: location.lon, label: 'Home' }
                : null
          }
          prefilledData={prefilledScheduleData}
          editScheduleId={editingScheduleId}
        />
      )}

      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="glass modal" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <h3 className="font-bold mb-4">{t('modals.changeLocation') || 'Change Location'}</h3>
            <input
              type="text"
              placeholder={t('placeholders.searchCity') || 'Type any city, LGA, country...'}
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchCity()}
              className="mb-4 w-full"
              autoFocus
            />
            <p className="text-xs text-muted mb-3">Type "London", "Ifo LGA", "Tokyo" - any real place</p>
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={searchCity}>{t('buttons.search') || 'Search'}</button>
              <button className="btn-ghost text-xs" onClick={() => { setShowLocationModal(false); setCitySearch('') }}>
                {t('buttons.cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSavedPanel && (
        <div className="modal-overlay" onClick={() => setShowSavedPanel(false)}>
          <div className="glass modal" onClick={e => e.stopPropagation()} style={{ padding: '24px', maxWidth: '480px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{t('labels.savedLocations') || 'My Locations'}</h3>
              <button onClick={() => setShowSavedPanel(false)} className="btn-ghost" style={{ fontSize: '24px', lineHeight: 1 }}>&times;</button>
            </div>

            <div className="current-location-card">
              <div className="loc-info">
                <div className="loc-label">{t('labels.currentLocation') || 'CURRENT LOCATION'}</div>
                <div className="loc-name">{location.name}</div>
                <div className="loc-coords">{location.lat?.toFixed?.(2)}, {location.lon?.toFixed?.(2)}</div>
              </div>
              <button className="save-btn" onClick={saveCurrentLocation}>
                <AddIcon /> {t('buttons.save') || 'Save'}
              </button>
            </div>

            {savedLocations.length === 0 ? (
              <div className="saved-locations-empty">
                <div className="empty-icon">📍</div>
                <div className="empty-title">{t('labels.noSavedLocations') || 'No saved locations yet'}</div>
                <div className="empty-subtitle">{t('labels.saveFavoritePlaces') || 'Save your favorite places for quick access'}</div>
                <button onClick={addNewLocation} className="btn-primary" style={{ marginTop: '12px' }}>
                  {t('buttons.addLocation') || 'Add Location'}
                </button>
              </div>
            ) : (
              <div className="saved-locations-container">
                {savedLocations.map(loc => (
                  <div key={loc.id} className={`saved-location-card ${editingLocId === loc.id ? 'editing' : ''}`}>
                    {editingLocId === loc.id ? (
                      <div className="saved-location-edit-form">
                        <div className="form-group">
                          <label>{t('modals.name') || 'Name'}</label>
                          <input
                            type="text"
                            value={editLabel}
                            onChange={e => setEditLabel(e.target.value)}
                            placeholder={t('placeholders.locationName') || 'Home, Work, etc...'}
                            autoFocus
                          />
                        </div>
                        <div className="form-group">
                          <label>{t('modals.coordinates') || 'Coordinates'}</label>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                            <button
                              onClick={() => setEditMode('manual')}
                              style={{
                                flex: 1, padding: '8px 12px', borderRadius: 10,
                                background: editMode === 'manual' ? 'rgba(56,189,248,.15)' : 'rgba(255,255,255,.04)',
                                border: editMode === 'manual' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,.08)',
                                color: editMode === 'manual' ? '#38bdf8' : '#fff',
                                cursor: 'pointer', fontSize: 13
                              }}
                            >
                              📝 {t('buttons.manual') || 'Manual'}
                            </button>
                            <button
                              onClick={() => setEditMode('auto')}
                              style={{
                                flex: 1, padding: '8px 12px', borderRadius: 10,
                                background: editMode === 'auto' ? 'rgba(56,189,248,.15)' : 'rgba(255,255,255,.04)',
                                border: editMode === 'auto' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,.08)',
                                color: editMode === 'auto' ? '#38bdf8' : '#fff',
                                cursor: 'pointer', fontSize: 13
                              }}
                            >
                              📍 {t('buttons.autoCurrent') || 'Auto (current)'}
                            </button>
                          </div>

                          {editMode === 'manual' ? (
                            <div className="location-search-container">
                              <input
                                type="text"
                                value={editCity}
                                onChange={e => {
                                  setEditCity(e.target.value)
                                  searchPlaceForLocation(e.target.value)
                                }}
                                placeholder={t('placeholders.searchLocation') || 'Search city...'}
                              />
                              {isSearching && (
                                <div className="location-search-suggestions">
                                  <div className="searching-text">{t('buttons.loading') || 'Searching...'}</div>
                                </div>
                              )}
                              {searchResults.length > 0 && (
                                <div className="location-search-suggestions">
                                  {searchResults.map(place => (
                                    <button
                                      key={place.id}
                                      className="suggestion-item"
                                      onClick={() => selectPlaceForLocation(loc.id, place)}
                                    >
                                      <span className="suggestion-icon">📍</span>
                                      <span className="suggestion-name">{place.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ padding: 16, background: 'rgba(255,255,255,.04)', borderRadius: 10, textAlign: 'center' }}>
                              {editGPSLoading ? (
                                <div style={{ color: '#38bdf8', fontSize: 13 }}>
                                  📡 {t('toasts.detecting') || 'Detecting your location...'}
                                </div>
                              ) : editGPSError ? (
                                <div style={{ color: '#ef4444', fontSize: 13 }}>❌ {editGPSError}</div>
                              ) : (
                                <button
                                  className="btn-primary"
                                  onClick={captureCurrentGPSForEdit}
                                  style={{ padding: '10px 16px', fontSize: 13 }}
                                >
                                  📍 {t('buttons.useMyLocation') || 'Use My Current Location'}
                                </button>
                              )}
                            </div>
                          )}

                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 8 }}>
                            {loc.lat?.toFixed?.(4)}, {loc.lon?.toFixed?.(4)}
                          </div>
                        </div>

                        <div className="edit-actions">
                          <button className="save-btn" onClick={() => {
                            if (editLabel.trim()) updateLocationLabel(loc.id, editLabel.trim())
                            saveLocationEdits()
                          }}>
                            {t('buttons.done') || 'Done'}
                          </button>
                          <button className="cancel-btn" onClick={() => {
                            setEditingLocId(null)
                            setSearchResults([])
                            setEditGPSError(null)
                          }}>
                            {t('buttons.cancel') || 'Cancel'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="saved-location-info">
                        <div className="loc-details" onClick={() => switchToSavedLocation(loc)}>
                          <div className="loc-label">{loc.label || 'Untitled Location'}</div>
                          <div className="loc-name">{loc.name}</div>
                          {loc.elevation != null && (
                            <div className="loc-coords" style={{ fontSize: '11px', opacity: 0.6 }}>
                              ⛰️ {Math.round(loc.elevation)}m elevation
                            </div>
                          )}
                        </div>
                        <div className="loc-actions">
                          <button className="edit-btn" onClick={() => {
                            setEditingLocId(loc.id)
                            setEditLabel(loc.label || '')
                            setEditCity('')
                            setEditMode('manual')
                            setEditGPSError(null)
                            setSearchResults([])
                          }}>
                            <EditIcon />
                          </button>
                          <button className="delete-btn" onClick={() => deleteLocation(loc.id)}>
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {savedLocations.length > 0 && !editingLocId && (
              <button className="add-location-btn" onClick={addNewLocation}>
                <AddIcon /> {t('buttons.addAnother') || 'Add Another Location'}
              </button>
            )}
          </div>
        </div>
      )}

      <ZephyeFullScreen
        isOpen={tab === 'ai'}
        onClose={() => setTab('weather')}
        weather={weather}
        location={location}
        todayStats={todayStats}
        aqi={aqi}
        userName={localStorage.getItem('weatherman_name')}
        lang={getLang(location?.country_code)}
        greeting="Hey"
        voiceToUse={voiceToUse}
        uiLanguage={uiLanguage}
      />

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tab === 'weather' && (
          <>
            <div
              className="glass"
              style={{
                padding: '20px', borderRadius: '20px',
                position: 'relative',
                zIndex: showAirDropdown ? 100 : 2,
                overflow: 'visible'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <button className="location-btn text-left" onClick={() => setShowLocationModal(true)}>
                  <div className="text-xs text-muted mb-1 flex items-center gap-1">
                    <LocationIcon />{t('labels.location') || 'Location'}
                  </div>
                  <div className="text-lg font-bold">{location.name}</div>
                  <div className="text-xs text-muted mt-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                </button>

                <div className="text-right">
                  <WeatherIcon code={wc} />
                  <h1 className="text-3xl font-bold mt-1">
                    {weather?.current ? Math.round(weather.current.temperature_2m) : '--'}°
                  </h1>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap mb-3">
                <button onClick={() => setShowSavedPanel(true)} className="btn-ghost text-xs flex items-center gap-1" style={{ padding: '4px 10px' }}>
                  <LocationIcon />{savedLocations.length > 0 ? `${savedLocations.length} saved` : 'My Places'}
                </button>
                {previousLocation && (
                  <button onClick={goBackToOriginalLocation} className="btn-ghost text-xs flex items-center gap-1" style={{ padding: '4px 10px', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                    <BackIcon />{t('buttons.back') || 'Back'}
                  </button>
                )}
                {savedLocations.slice(0, 3).map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => switchToSavedLocation(loc)}
                    className="btn-ghost text-xs"
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(255,255,255,0.08)',
                      color: 'var(--text)',
                      border: '1px solid var(--glass-border)'
                    }}
                    title={loc.name}
                  >
                    {loc.label || 'Untitled'}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap items-center" style={{ overflow: 'visible', position: 'relative' }}>
                {stormInfo && (
                  <div className="status-badge" style={{ background: stormInfo.color + '33', borderColor: stormInfo.color, color: stormInfo.color }}>
                    {stormInfo.level}
                  </div>
                )}
                <div style={{ position: 'relative', overflow: 'visible', zIndex: 9999 }}>
                  <button
                    className="status-badge"
                    style={{
                      background: aqiInfo.color + '33',
                      borderColor: aqiInfo.color,
                      color: aqiInfo.color,
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowAirDropdown(!showAirDropdown)}
                  >
                    Air: {aqiInfo.label} ▼
                  </button>
                  {showAirDropdown && (
                    <WeatherDetailsPanel
                      weather={weather}
                      aqi={aqi}
                      onClose={() => setShowAirDropdown(false)}
                    />
                  )}
                </div>

                <button
                  onClick={shareWeatherForCurrent}
                  className="btn-ghost"
                  style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}
                  title={t('buttons.shareWeather') || 'Share weather'}
                >
                  <ShareIcon size={18} />
                </button>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
              <WeatherManTab
                weather={weather}
                location={location}
                todayStats={todayStats}
                aqi={aqi}
                onRefresh={() => fetchWeatherData(location.lat, location.lon)}
                uiLanguage={uiLanguage}
              />
            </div>

            <div className="glass" style={{ padding: '20px', borderRadius: '20px', position: 'relative', zIndex: 2, overflow: 'visible' }}>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold">{t('labels.hourlyForecast') || 'Hourly Forecast'}</p>
                <div className="flex gap-2">
                  <button
                    className="btn-ghost text-xs"
                    onClick={() => setWeatherShare({
                      isOpen: true, type: 'hourly',
                      overrideWeather: null, overrideLocation: null, overrideAqi: null, overrideStats: null,
                      comparisonItems: null, comparisonTakeaway: '',
                    })}
                    style={{ padding: '6px 10px', display: 'flex', alignItems: 'center' }}
                    title={t('buttons.shareHourly') || 'Share hourly'}
                  >
                    <ShareIcon size={16} />
                  </button>
                  <button
                    className="btn-ghost text-xs"
                    onClick={() => setShowHourlyModal(true)}
                    style={{ padding: '4px 12px' }}
                  >
                    {t('buttons.viewAll') || 'View All →'}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
                {(weather?.hourly?.time || []).slice(0, 12).map((time, i) => (
                  <div
                    key={time}
                    className="glass text-center p-3 rounded-2xl flex-shrink-0"
                    style={{
                      minWidth: '72px',
                      scrollSnapAlign: 'start',
                      background: 'rgba(255,255,255,0.05)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowHourlyModal(true)}
                  >
                    <p className="text-xs text-muted">
                      {new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                    </p>
                    <p className="text-2xl my-1">{getWeatherIcon(weather.hourly.weather_code?.[i] || 0)}</p>
                    <p className="text-sm font-bold">{Math.round(weather.hourly.temperature_2m?.[i] || 0)}°</p>
                    {weather.hourly.precipitation_probability?.[i] > 20 && (
                      <p className="text-[10px] text-accent">{Math.round(weather.hourly.precipitation_probability[i])}%</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass" style={{ padding: '20px', borderRadius: '20px', position: 'relative', zIndex: 2, overflow: 'visible' }}>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold">{t('labels.dailyForecast') || '7-Day Forecast'}</p>
                <button
                  className="btn-ghost text-xs"
                  onClick={() => setWeatherShare({
                    isOpen: true, type: 'weekly',
                    overrideWeather: null, overrideLocation: null, overrideAqi: null, overrideStats: null,
                    comparisonItems: null, comparisonTakeaway: '',
                  })}
                  style={{ padding: '6px 10px', display: 'flex', alignItems: 'center' }}
                  title={t('buttons.shareWeekly') || 'Share weekly'}
                >
                  <ShareIcon size={16} />
                </button>
              </div>
              {(weather?.daily?.time || []).slice(0, 7).map((day, i) => (
                <div key={day} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                  <span className="text-sm font-medium">{new Date(day).toLocaleDateString('en', { weekday: 'short' })}</span>
                  <span className="text-xl">{getWeatherIcon(weather.daily.weather_code[i])}</span>
                  <div className="flex gap-3 text-sm">
                    <span className="font-bold">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
                    <span className="text-muted">{Math.round(weather.daily.temperature_2m_min[i])}°</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'map' && (
          <MapTab weather={weather} location={location} aqi={aqi} uiLanguage={uiLanguage} />
        )}

        {tab === 'quotes' && (
          <QuotesTab
            saveQuote={saveQuote}
            shareQuote={shareQuote}
            shareFact={shareFact}
            saveFact={saveFact}
            quoteOfDay={quoteOfDay}
          />
        )}

        {tab === 'saved' && (
          <SavedTab
            showToast={showToast}
            shareQuote={shareQuote}
            shareFact={shareFact}
            savedLocations={savedLocations}
            homeLocation={homeLocation}
            currentLocation={location}
            onSwitchToLocation={switchToSavedLocation}
            onDeleteLocation={deleteLocation}
            onSaveCurrent={saveCurrentLocation}
            onAddNew={addNewLocation}
            onEditLocation={(locId) => {
              setEditingLocId(locId)
              setEditLabel(savedLocations.find(l => l.id === locId)?.label || '')
              setEditCity('')
              setEditMode('manual')
              setEditGPSError(null)
              setSearchResults([])
              setShowSavedPanel(true)
            }}
            onShareLocation={handleShareSavedLocation}
          />
        )}

        <div className="text-center mt-4 mb-4">
          <p className="text-sm text-muted">hyesent.dev</p>
        </div>
      </div>

      <div className="bottom-nav">
        <button className={`nav-btn ${tab === 'weather' ? 'active' : ''}`} onClick={() => setTab('weather')}>
          {t('tabs.weather') || 'Weather'}
        </button>
        <button className={`nav-btn ${tab === 'map' ? 'active' : ''}`} onClick={() => setTab('map')}>
          {t('tabs.map') || 'Map'}
        </button>
        <button className={`nav-btn ${tab === 'quotes' ? 'active' : ''}`} onClick={() => setTab('quotes')}>
          {t('tabs.quotes') || 'Quotes'}
        </button>
        <button className={`nav-btn ${tab === 'saved' ? 'active' : ''}`} onClick={() => setTab('saved')}>
          {t('tabs.saved') || 'Saved'}
        </button>
        <button className={`nav-btn ${tab === 'ai' ? 'active' : ''}`} onClick={() => setTab('ai')}>
          {t('tabs.ai') || 'AI'}
        </button>
      </div>

      <HourlyModal
        isOpen={showHourlyModal}
        onClose={() => setShowHourlyModal(false)}
        hourlyData={weather?.hourly}
        locationName={location?.name}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// QUOTES TAB
// ═══════════════════════════════════════════════════════════════════════

function QuotesTab({ saveQuote, shareQuote, shareFact, saveFact, quoteOfDay }) {
  const [quoteCategory, setQuoteCategory] = useState('All')
  const [factCategory, setFactCategory] = useState('All')
  const [currentQuote, setCurrentQuote] = useState(null)
  const [currentFact, setCurrentFact] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState(0)

  useEffect(() => { fetchQuote(); fetchFact() }, [])
  useEffect(() => { fetchQuote() }, [quoteCategory])
  useEffect(() => { fetchFact() }, [factCategory])

  const fetchQuote = () => {
    if (Date.now() - lastFetch < 5000) return
    setLastFetch(Date.now())
    setLoading(true)
    let pool = quoteCategory === 'All'
      ? getAllQuotesPool()
      : (QUOTES[quoteCategory]?.map(q => ({ ...q, tag: quoteCategory })) || [])
    setCurrentQuote(pool[Math.floor(Math.random() * pool.length)])
    setLoading(false)
  }

  const fetchFact = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
      if (!res.ok) throw new Error()
      setCurrentFact({ text: (await res.json()).text })
    } catch {
      try {
        const res2 = await fetch('https://numbersapi.com/random/trivia?json')
        if (!res2.ok) throw new Error()
        setCurrentFact({ text: (await res2.json()).text })
      } catch {
        let pool = factCategory === 'All'
          ? Object.values(LOCAL_FACTS).flat()
          : (LOCAL_FACTS[factCategory] || LOCAL_FACTS.Science)
        setCurrentFact(pool[Math.floor(Math.random() * pool.length)])
      }
    }
    setLoading(false)
  }

  return (
    <>
      {quoteOfDay && (
        <div className="glass mb-4" style={{ padding: '20px', borderRadius: '20px', border: '2px solid var(--accent)', background: 'rgba(56,189,248,0.05)' }}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-bold text-accent flex items-center gap-2">
              <span>🌟</span> Quote of the Day
            </p>
          </div>
          <p className="text-lg font-bold mb-3">{quoteOfDay.content}</p>
          <p className="text-sm text-muted mb-4">— {quoteOfDay.author}</p>
          <div className="flex gap-2">
            <button className="btn-share text-sm" onClick={() => shareQuote(quoteOfDay.content, quoteOfDay.author)}>Share</button>
            <button className="btn-ghost text-sm" onClick={() => saveQuote(quoteOfDay)}>Save</button>
          </div>
        </div>
      )}

      <div className="glass mb-4" style={{ padding: '20px', borderRadius: '20px' }}>
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold">Explore Quotes</p>
          <button className="btn-primary text-sm" onClick={fetchQuote} disabled={loading}>
            {loading ? 'Loading...' : 'New Quote'}
          </button>
        </div>
        <div className="sub-tabs mb-4">
          {QUOTE_CATEGORIES.map(cat => (
            <button key={cat} className={`sub-tab ${quoteCategory === cat ? 'active' : ''}`} onClick={() => setQuoteCategory(cat)}>{cat}</button>
          ))}
        </div>
        {currentQuote && (
          <div className="list-item">
            <p className="font-bold mb-4">{currentQuote.content}</p>
            <p className="text-sm text-muted mb-4">— {currentQuote.author}</p>
            <div className="flex gap-2">
              <button className="btn-share text-sm" onClick={() => shareQuote(currentQuote.content, currentQuote.author)}>Share</button>
              <button className="btn-ghost text-sm" onClick={() => saveQuote(currentQuote)}>Save</button>
            </div>
          </div>
        )}
      </div>

      <div className="glass mb-4" style={{ padding: '20px', borderRadius: '20px' }}>
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold">Did You Know?</p>
          <button className="btn-primary text-sm" onClick={fetchFact} disabled={loading}>
            {loading ? 'Loading...' : 'New Fact'}
          </button>
        </div>
        <div className="sub-tabs mb-4">
          {FACT_CATEGORIES.map(cat => (
            <button key={cat} className={`sub-tab ${factCategory === cat ? 'active' : ''}`} onClick={() => setFactCategory(cat)}>{cat}</button>
          ))}
        </div>
        {currentFact && (
          <div className="list-item">
            <p className="font-bold mb-4">{currentFact.text}</p>
            <div className="flex gap-2">
              <button className="btn-share text-sm" onClick={() => shareFact(currentFact.text)}>Share</button>
              <button className="btn-ghost text-sm" onClick={() => saveFact(currentFact)}>Save</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// SAVED TAB
// ═══════════════════════════════════════════════════════════════════════

function SavedTab({
  showToast, shareQuote, shareFact,
  savedLocations = [], homeLocation = null, currentLocation = null,
  onSwitchToLocation, onDeleteLocation, onSaveCurrent, onAddNew,
  onEditLocation, onShareLocation,
}) {
  const [savedQuotes, setSavedQuotes] = useState([])
  const [savedFacts, setSavedFacts] = useState([])
  const [activeSubTab, setActiveSubTab] = useState('locations')

  useEffect(() => {
    setSavedQuotes(JSON.parse(localStorage.getItem('zephye_saved_quotes') || '[]'))
    setSavedFacts(JSON.parse(localStorage.getItem('zephye_saved_facts') || '[]'))
  }, [])

  const deleteQuote = (id) => {
    const u = savedQuotes.filter(q => q.id !== id)
    localStorage.setItem('zephye_saved_quotes', JSON.stringify(u))
    setSavedQuotes(u)
    showToast('Quote deleted')
  }

  const deleteFact = (id) => {
    const u = savedFacts.filter(f => f.id !== id)
    localStorage.setItem('zephye_saved_facts', JSON.stringify(u))
    setSavedFacts(u)
    showToast('Fact deleted')
  }

  return (
    <div className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
      <div className="sub-tabs mb-4">
        <button className={`sub-tab ${activeSubTab === 'locations' ? 'active' : ''}`} onClick={() => setActiveSubTab('locations')}>
          Locations ({savedLocations.length})
        </button>
        <button className={`sub-tab ${activeSubTab === 'quotes' ? 'active' : ''}`} onClick={() => setActiveSubTab('quotes')}>
          Quotes ({savedQuotes.length})
        </button>
        <button className={`sub-tab ${activeSubTab === 'facts' ? 'active' : ''}`} onClick={() => setActiveSubTab('facts')}>
          Facts ({savedFacts.length})
        </button>
      </div>

      {activeSubTab === 'locations' && (
        <LocationsSubTab
          savedLocations={savedLocations}
          homeLocation={homeLocation}
          currentLocation={currentLocation}
          onSwitchToLocation={onSwitchToLocation}
          onDeleteLocation={onDeleteLocation}
          onSaveCurrent={onSaveCurrent}
          onAddNew={onAddNew}
          onEditLocation={onEditLocation}
          onShareLocation={onShareLocation}
        />
      )}

      {activeSubTab === 'quotes' && (
        savedQuotes.length === 0 ?
          <p className="text-center text-muted py-8">No saved quotes yet.</p> :
          savedQuotes.map(q => (
            <div key={q.id} className="list-item">
              <p className="font-bold mb-2">{q.quote_text}</p>
              <p className="text-sm text-muted mb-3">— {q.quote_author}</p>
              <div className="flex gap-2">
                <button className="btn-share text-xs" onClick={() => shareQuote(q.quote_text, q.quote_author)}>Share</button>
                <button className="btn-ghost text-xs" onClick={() => deleteQuote(q.id)}>Delete</button>
              </div>
            </div>
          ))
      )}

      {activeSubTab === 'facts' && (
        savedFacts.length === 0 ?
          <p className="text-center text-muted py-8">No saved facts yet.</p> :
          savedFacts.map(f => (
            <div key={f.id} className="list-item">
              <p className="font-bold mb-3">{f.fact_text}</p>
              <div className="flex gap-2">
                <button className="btn-share text-xs" onClick={() => shareFact(f.fact_text)}>Share</button>
                <button className="btn-ghost text-xs" onClick={() => deleteFact(f.id)}>Delete</button>
              </div>
            </div>
          ))
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════════════

function AppContent() {
  const [homeLocation, setHomeLocation] = useState(() => {
    const saved = localStorage.getItem('zephye_home_location')
    return saved ? JSON.parse(saved) : null
  })

  return (
    <LanguageProvider homeLocation={homeLocation}>
      <AppContentInner homeLocation={homeLocation} setHomeLocation={setHomeLocation} />
    </LanguageProvider>
  )
}

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  )
}
