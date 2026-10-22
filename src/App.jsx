import { useState, useEffect, useRef, useMemo } from 'react'
import { PROFILE_NAME_KEY, readProfileName, saveProfileName } from './profileStorage.js'
import { QUOTES } from './data/quotes.js'
import { AudioProvider } from './AudioContext.jsx'
import WeatherManTab from './WeatherManTab.jsx'
import EnvironmentPage from './EnvironmentPage.jsx'
import MarinePage from './MarinePage.jsx'
import morningWeatherBackground from './assets/images/weather-morning.png'
import nightWeatherBackground from './assets/images/weather-night.png'
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
import ScoreHub from './ScoreHub.jsx'
import { calculateScores } from './ScoreEngine.js'
import { getSunPosition, getMoonPosition, skyPoint, getSolarEvents, getMoonEvents, getLunarPhase, getSkyPath, getNextLunarPhases, getEclipseCandidates } from './astronomy.js'

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

const readTemperatureUnit = () => localStorage.getItem('zephye_temperature_unit') === 'F' ? 'F' : 'C'
const toDisplayTemp = (value, unit) => {
  if (value == null || !Number.isFinite(Number(value))) return null
  const c = Number(value)
  return Math.round(unit === 'F' ? (c * 9 / 5) + 32 : c)
}
const getWindDirection = (d) => {
  if (d == null) return ''
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(d / 45) % 8]
}
const getWeatherConditionLabel = (code) => {
  if (code === 0) return 'Clear sky'
  if (code === 1) return 'Mainly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Foggy'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow'
  if (code >= 95) return 'Thunderstorms'
  return 'Current conditions'
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


// Hourly forecast icons use the forecast timestamp itself, not the current time.
function isForecastNight(time) {
  const hour = Number(String(time || '').slice(11, 13))
  return Number.isFinite(hour) && (hour < 6 || hour >= 18)
}

function HourlyWeatherIcon({ code = 0, time, className = '' }) {
  const night = isForecastNight(time)
  const c = Number(code)
  const rain = (c >= 51 && c <= 67) || (c >= 80 && c <= 82)
  const snow = c >= 71 && c <= 77 || c >= 85 && c <= 86
  const storm = c >= 95
  const fog = c === 45 || c === 48
  const cloudy = c === 2 || c === 3 || c === 1
  const clear = c === 0
  const stroke = 'currentColor'
  return (
    <svg className={className} viewBox="0 0 64 64" width="36" height="36" role="img" aria-label={`${night ? 'Night' : 'Day'} ${getConditionLabel(c)}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`cloud-${night ? 'n' : 'd'}-${c}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={night ? '#d8e4ff' : '#ffffff'} />
          <stop offset="100%" stopColor={night ? '#8398c5' : '#b7d4e9'} />
        </linearGradient>
      </defs>
      {(clear || (cloudy && c !== 3)) && (night ? (
        <path d="M39 7a17 17 0 1 0 17 24A19 19 0 0 1 39 7Z" fill="#dbe7ff" stroke="#a9c1f7" strokeWidth="1.5"/>
      ) : (
        <g stroke="#ffc65c" strokeWidth="2.5" strokeLinecap="round"><circle cx="30" cy="25" r="10" fill="#ffd166" stroke="#ffb938"/><path d="M30 7v4M30 39v4M12 25h4M44 25h4M17 12l3 3M40 35l3 3M43 12l-3 3M20 35l-3 3"/></g>
      ))}
      {night && (clear || cloudy) && c !== 3 && <g fill="#fff" opacity=".85"><circle cx="12" cy="13" r="1.3"/><circle cx="51" cy="13" r="1"/><circle cx="13" cy="34" r=".9"/></g>}
      {(cloudy || rain || snow || storm || fog) && (
        <g>
          <path d="M17 44c-6 0-10-4-10-9s4-9 10-9c2-8 9-12 16-9 5 2 7 6 8 10 7-1 13 4 13 10 0 4-4 7-9 7Z" fill={`url(#cloud-${night ? 'n' : 'd'}-${c})`} stroke={night ? '#9eb1dc' : '#dcebf6'} strokeWidth="1.8" strokeLinejoin="round"/>
        </g>
      )}
      {rain && <g stroke="#55b9f2" strokeWidth="3" strokeLinecap="round"><path d="m20 48-3 6M32 48l-3 6M44 48l-3 6"/></g>}
      {snow && <g stroke="#bfeaff" strokeWidth="2.4" strokeLinecap="round"><path d="M20 50v8m-3-5 6 2m-6 0 6-2M34 50v8m-3-5 6 2m-6 0 6-2M47 50v8m-3-5 6 2m-6 0 6-2"/></g>}
      {storm && <path d="m34 42-8 12h7l-3 9 13-16h-8l4-5Z" fill="#ffd166" stroke="#f5b82e" strokeLinejoin="round"/>}
      {fog && <g stroke={night ? '#c3d0eb' : '#d7e5ef'} strokeWidth="3" strokeLinecap="round"><path d="M13 50h38M18 56h29"/></g>}
    </svg>
  )
}

function getConditionLabel(code) {
  if (code === 0) return 'clear sky'
  if (code === 1) return 'mainly clear'
  if (code === 2) return 'partly cloudy'
  if (code === 3) return 'overcast'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 95) return 'thunderstorm'
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snow'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'
  return 'cloudy'
}

// ═══════════════════════════════════════════════════════════════════════
// HOURLY MODAL
// ═══════════════════════════════════════════════════════════════════════

function HourlyModal({ isOpen, onClose, hourlyData, locationName, temperatureUnit = 'C' }) {
  if (!isOpen || !hourlyData) return null
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
                <div className="hourly-icon"><HourlyWeatherIcon code={code} time={time} /></div>
                <div className="hourly-temp">
                  <div>{toDisplayTemp(temp, temperatureUnit)}°{temperatureUnit}</div>
                  {feelsLike && toDisplayTemp(feelsLike, temperatureUnit) !== toDisplayTemp(temp, temperatureUnit) && (
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

function ForecastViewModal({ isOpen, onClose, type = 'hourly', weather, locationName, temperatureUnit = 'C' }) {
  const [mode, setMode] = useState('extensive')
  const [selected, setSelected] = useState(null)
  const [expandedDay, setExpandedDay] = useState(null)
  useEffect(() => { if (isOpen) { setMode('summary'); setSelected(null); setExpandedDay(null) } }, [isOpen, type])
  if (!isOpen || !weather) return null
  const hourly = weather.hourly || {}, daily = weather.daily || {}
  const fmt = (v, suffix = '') => v == null || !Number.isFinite(Number(v)) ? '—' : `${Math.round(Number(v))}${suffix}`
  const condition = code => ({0:'Clear skies',1:'Mostly clear skies',2:'Partly cloudy skies',3:'Overcast skies',45:'Foggy conditions',48:'Foggy conditions',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Periods of rain',63:'Steady rain',65:'Heavy rain',71:'Light snow',73:'Snowfall',75:'Heavy snow',80:'Rain showers',81:'Frequent showers',82:'Heavy showers',95:'Thunderstorms',96:'Thunderstorms with hail',99:'Severe thunderstorms'}[code] || 'Variable conditions')
  const hourLabel = (time) => new Date(time).toLocaleTimeString(undefined, {hour:'numeric', minute:'2-digit'})
  const dayLabel = (day, i) => i === 0 ? 'Today' : new Date(`${day}T12:00:00`).toLocaleDateString(undefined,{weekday:'short'})
  const hourMetrics = (i) => [
    ['Temperature',fmt(toDisplayTemp(hourly.temperature_2m?.[i],temperatureUnit),`°${temperatureUnit}`)],['Feels like',fmt(toDisplayTemp(hourly.apparent_temperature?.[i],temperatureUnit),`°${temperatureUnit}`)],
    ['Conditions',condition(hourly.weather_code?.[i])],['Rain probability',fmt(hourly.precipitation_probability?.[i],'%')],['Precipitation',fmt(hourly.precipitation?.[i],' mm')],['Rain',fmt(hourly.rain?.[i],' mm')],['Showers',fmt(hourly.showers?.[i],' mm')],['Snowfall',fmt(hourly.snowfall?.[i],' cm')],['Humidity',fmt(hourly.relative_humidity_2m?.[i],'%')],['Dew point',fmt(toDisplayTemp(hourly.dew_point_2m?.[i],temperatureUnit),`°${temperatureUnit}`)],['Wind speed',fmt(hourly.wind_speed_10m?.[i],' km/h')],['Wind direction',fmt(hourly.wind_direction_10m?.[i],'°')],['Wind gusts',fmt(hourly.wind_gusts_10m?.[i],' km/h')],['Cloud cover',fmt(hourly.cloud_cover?.[i],'%')],['Visibility',fmt(hourly.visibility?.[i] == null ? null : hourly.visibility[i]/1000,' km')],['Pressure',fmt(hourly.pressure_msl?.[i],' hPa')],['UV index',fmt(hourly.uv_index?.[i])],['Sunshine',fmt(hourly.sunshine_duration?.[i] == null ? null : hourly.sunshine_duration[i]/60,' min')]
  ].filter(([,v]) => v !== '—')
  const dayMetrics = i => [
    ['Conditions',condition(daily.weather_code?.[i])],['Highest temperature',fmt(daily.temperature_2m_max?.[i],`°${temperatureUnit}`)],['Lowest temperature',fmt(daily.temperature_2m_min?.[i],`°${temperatureUnit}`)],['Feels like high',fmt(daily.apparent_temperature_max?.[i],`°${temperatureUnit}`)],['Feels like low',fmt(daily.apparent_temperature_min?.[i],`°${temperatureUnit}`)],['Precipitation chance',fmt(daily.precipitation_probability_max?.[i],'%')],['Precipitation total',fmt(daily.precipitation_sum?.[i],' mm')],['Rain total',fmt(daily.rain_sum?.[i],' mm')],['Showers total',fmt(daily.showers_sum?.[i],' mm')],['Precipitation hours',fmt(daily.precipitation_hours?.[i],' h')],['Maximum wind',fmt(daily.wind_speed_10m_max?.[i],' km/h')],['Wind gusts',fmt(daily.wind_gusts_10m_max?.[i],' km/h')],['Dominant wind direction',fmt(daily.wind_direction_10m_dominant?.[i],'°')],['UV peak',fmt(daily.uv_index_max?.[i])],['Sunrise',daily.sunrise?.[i] ? new Date(daily.sunrise[i]).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}) : '—'],['Sunset',daily.sunset?.[i] ? new Date(daily.sunset[i]).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}) : '—'],['Daylight',fmt(daily.daylight_duration?.[i] == null ? null : daily.daylight_duration[i]/3600,' h')],['Sunshine',fmt(daily.sunshine_duration?.[i] == null ? null : daily.sunshine_duration[i]/3600,' h')]
  ].filter(([,v]) => v !== '—')
  const items = type === 'hourly' ? (hourly.time || []).slice(0, 24).map((time,i)=>({time,i})) : (daily.time || []).map((time,i)=>({time,i}))
  return <div className="modal-overlay forecast-modal-overlay" onClick={onClose} role="presentation"><section className="forecast-detail-modal" role="dialog" aria-modal="true" aria-label={`${type === 'hourly' ? 'Hourly' : 'Seven-day'} forecast details`} onClick={e=>e.stopPropagation()}>
    <header className="forecast-modal-header"><div><span className="forecast-modal-kicker">ZEPHYE FORECAST</span><h2>{type === 'hourly' ? 'Hourly forecast' : '7-day forecast'}</h2><p>{locationName || 'Your location'} · {type === 'hourly' ? 'Explore each hour' : 'Plan the week ahead'}</p></div><button className="forecast-modal-close" onClick={onClose} aria-label="Close forecast">×</button></header>
    <div className="forecast-modal-tabs" role="tablist" aria-label="Forecast detail mode"><button className={mode==='extensive'?'active':''} onClick={()=>setMode('extensive')} role="tab" aria-selected={mode==='extensive'}>Extensive</button><button className={mode==='summary'?'active':''} onClick={()=>setMode('summary')} role="tab" aria-selected={mode==='summary'}>Summary</button></div>
    {type === 'hourly' ? <>
      <div className={mode==='extensive'?'forecast-pill-grid':'forecast-summary-list'}>{items.map(({time,i})=><button key={time} className={`forecast-time-pill ${selected===i?'selected':''}`} onClick={()=>setSelected(selected===i?null:i)}><span>{hourLabel(time)}</span><span className="forecast-pill-weather"><HourlyWeatherIcon code={hourly.weather_code?.[i] ?? 0} time={time}/></span><strong>{fmt(toDisplayTemp(hourly.temperature_2m?.[i],temperatureUnit),`°${temperatureUnit}`)}</strong>{mode==='summary'&&<small>{condition(hourly.weather_code?.[i])}</small>}</button>)}</div>
      {selected != null && <div className="forecast-hour-detail-backdrop" role="presentation" onClick={()=>setSelected(null)}><section className="forecast-hour-detail-dialog" role="dialog" aria-modal="true" aria-label={`Weather details for ${hourLabel(hourly.time?.[selected] || '')}`} onClick={e=>e.stopPropagation()}><div className="forecast-selected-heading"><div><span>HOURLY DETAILS</span><h3>{hourLabel(hourly.time?.[selected] || '')}</h3><p>{condition(hourly.weather_code?.[selected])}</p></div><button onClick={()=>setSelected(null)} aria-label="Close hour details">×</button></div><div className="forecast-metric-grid">{hourMetrics(selected).map(([label,value])=><div className="forecast-metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section></div>}
    </> : <div className="forecast-day-detail-list">{items.map(({time,i})=><article className={`forecast-detail-day ${expandedDay===i?'expanded':''}`} key={time}><button className="forecast-day-pill" onClick={()=>setExpandedDay(expandedDay===i?null:i)}><span className="forecast-day-pill-date"><strong>{dayLabel(time,i)}</strong><small>{new Date(`${time}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</small></span><span className="forecast-day-pill-condition">{condition(daily.weather_code?.[i])}</span><span className="forecast-day-pill-temps"><strong>{fmt(toDisplayTemp(daily.temperature_2m_max?.[i],temperatureUnit),`°${temperatureUnit}`)}</strong><small>{fmt(toDisplayTemp(daily.temperature_2m_min?.[i],temperatureUnit),`°${temperatureUnit}`)}</small></span><span className="forecast-expand-mark">{expandedDay===i?'−':'+'}</span></button>{expandedDay===i&&<div className="forecast-day-expanded"><div className="forecast-metric-grid">{dayMetrics(i).map(([label,value])=><div className="forecast-metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>{mode==='extensive'&&<div className="forecast-day-hourly"><h4>Hourly breakdown</h4><div className="forecast-pill-grid">{(hourly.time||[]).map((ht,hi)=>({ht,hi})).filter(({ht})=>ht.slice(0,10)===time).map(({ht,hi})=><button className={`forecast-time-pill ${selected===hi?'selected':''}`} key={ht} onClick={()=>setSelected(selected===hi?null:hi)}><span>{hourLabel(ht)}</span><span className="forecast-pill-weather"><HourlyWeatherIcon code={hourly.weather_code?.[hi]??0} time={ht}/></span><strong>{fmt(toDisplayTemp(hourly.temperature_2m?.[hi],temperatureUnit),`°${temperatureUnit}`)}</strong></button>)}</div>{selected!=null&&hourly.time?.[selected]?.slice(0,10)===time&&<div className="forecast-metric-grid forecast-nested-hour-details">{hourMetrics(selected).map(([label,value])=><div className="forecast-metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}</div>}</div>}</article>)}</div>}
    <footer className="forecast-modal-footer">Forecast measurements shown when available from the weather data provider.</footer>
  </section></div>
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
  const [temperatureUnit, setTemperatureUnit] = useState(readTemperatureUnit)
  const [showSettings, setShowSettings] = useState(false)
  const [displayName, setDisplayName] = useState(() => readProfileName())
  const [nameDraft, setNameDraft] = useState(() => readProfileName())
  const [showNameSetup, setShowNameSetup] = useState(() => !readProfileName())
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
  const [forecastModalType, setForecastModalType] = useState('hourly')
  const [hourlyForecastView, setHourlyForecastView] = useState('cards')
  const [dailyForecastView, setDailyForecastView] = useState('cards')
  const [astronomyNow, setAstronomyNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setAstronomyNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])
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
        user: readProfileName() || 'anonymous',
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
  const getWeatherIcon = (c) => c === 0 ? '☀️' : c === 1 ? '🌤️' : c === 2 ? '⛅' : c === 3 ? '☁️' : c >= 95 ? '⛈️' : c >= 71 && c <= 86 ? '❄️' : c >= 51 ? '🌧️' : '☁️'
  const getDailyConditionSummary = (code, probability, rain) => {
    const p = Number(probability)
    const amount = Number(rain)
    if (code >= 95) return 'Thunderstorms expected'
    if (code >= 80 && code <= 82) return amount > 8 ? 'Frequent heavy showers' : 'Scattered rain showers'
    if (code >= 61 && code <= 67) return amount > 8 ? 'Periods of heavier rain' : 'Periods of rain'
    if (code >= 51 && code <= 57) return amount > 4 ? 'Mostly drizzling' : 'Some light drizzle'
    if (code >= 71 && code <= 86) return 'Snow or wintry showers'
    if (code === 45 || code === 48) return 'Foggy or misty conditions'
    if (code === 3) return 'Mostly cloudy skies'
    if (code === 2) return 'Partly cloudy skies'
    if (code === 1) return 'Mostly clear skies'
    if (code === 0) return 'Clear skies'
    if (p >= 65) return 'Rain is likely at times'
    if (p >= 30) return 'A chance of showers'
    return 'Mostly dry conditions'
  }
  const formatForecastValue = (value, suffix = '') => value == null || !Number.isFinite(Number(value)) ? '—' : `${Math.round(Number(value))}${suffix}`
  const ForecastLineGraph = ({ labels, series, unit = '°', ariaLabel }) => {
    const [activePoint, setActivePoint] = useState(Math.max(0, Math.floor((labels.length - 1) / 2)))
    const allValues = series.flatMap(item => item.values.filter(v => v != null && Number.isFinite(Number(v))).map(Number))
    if (!labels.length || !allValues.length) return <p className="forecast-graph-empty">Graph data is not available.</p>
    const rawMin = Math.min(...allValues), rawMax = Math.max(...allValues)
    const spread = Math.max(rawMax - rawMin, 1)
    const min = rawMin - spread * .08, max = rawMax + spread * .08
    const range = Math.max(max - min, 1)
    const yTicks = [max, (max + min) / 2, min]
    const coordsFor = values => values.map((v, i) => v == null || !Number.isFinite(Number(v)) ? null : ({ x: 48 + (i * 530 / Math.max(labels.length - 1, 1)), y: 106 - ((Number(v) - min) / range) * 70 }))
    const smoothPath = points => {
      let path = '', previous = null
      points.forEach(point => {
        if (!point) { previous = null; return }
        if (!previous) path += ` M ${point.x} ${point.y}`
        else { const mid = (previous.x + point.x) / 2; path += ` C ${mid} ${previous.y}, ${mid} ${point.y}, ${point.x} ${point.y}` }
        previous = point
      })
      return path.trim()
    }

    return <div className="forecast-graph-wrap"><div className="forecast-graph-topline"><span>FORECAST TREND</span><span>{labels.length} time points</span></div><svg className="forecast-line-graph" viewBox="0 0 600 138" role="img" aria-label={ariaLabel}>
      <defs><linearGradient id="forecastAreaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity=".22"/><stop offset="100%" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs>
      {[34, 68, 102].map((y, i) => <g key={y}><line x1="42" x2="584" y1={y} y2={y} className="forecast-grid-line" /><text x="35" y={y + 3} textAnchor="end" className="forecast-axis-label">{yTicks[i].toFixed(0)}°</text></g>)}
      <line x1="42" x2="42" y1="25" y2="112" className="forecast-y-axis" />
      {series.map((item, index) => { const points = coordsFor(item.values); const path = smoothPath(points); const first = points.find(Boolean); const last = [...points].reverse().find(Boolean); const area = first && last ? `${path} L ${last.x} 112 L ${first.x} 112 Z` : ''; return <g key={item.label} className={`forecast-series forecast-series-${index}`}>
        {index === 0 && area && <path d={area} className="forecast-area"/>}
        <path d={path} className={`forecast-line forecast-line-${index}`} />
        {points.map((pt, i) => pt ? <g key={i} className="forecast-point-hit" role="button" tabIndex={0} aria-label={`${labels[i]}: ${item.values[i]} ${item.unit || unit}`} onClick={() => setActivePoint(i)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActivePoint(i) } }}><circle cx={pt.x} cy={pt.y} r={11} className={`forecast-point-halo forecast-point-halo-${index}`} /><circle cx={pt.x} cy={pt.y} r={i === activePoint ? 3.6 : 2.2} className={`forecast-point forecast-point-${index}`} /></g> : null)}
      </g>})}
    </svg><div className="forecast-graph-labels">{labels.map((label, i) => <span key={`${label}-${i}`}>{(labels.length <= 8 || i === 0 || i === labels.length - 1 || i === activePoint || i % Math.ceil(labels.length / 6) === 0) ? label : ''}</span>)}</div><div className="forecast-graph-selection" aria-live="polite"><strong>{labels[activePoint] ?? labels[0]}</strong>{series.map((item, i) => Number.isFinite(Number(item.values[activePoint])) && <span key={item.label}><i className={`forecast-legend-dot forecast-line-${i}`} />{item.label}: <b>{Number(item.values[activePoint]).toFixed(1)} {item.unit || unit}</b></span>)}</div><div className="forecast-graph-legend">{series.map((item, i) => <span key={item.label}><i className={`forecast-legend-dot forecast-line-${i}`} />{item.label}{item.unit || unit ? ` (${item.unit || unit})` : ''}</span>)}</div></div>
  }

  const getStormLevel = (c, w) => c >= 95 ? { level: 'Severe Thunderstorm', color: '#dc2626' } : c >= 65 || w > 50 ? { level: 'Heavy Storm', color: '#f97316' } : c >= 61 || w > 30 ? { level: 'Moderate Rain', color: '#eab308' } : c >= 51 ? { level: 'Light Rain', color: '#22c55e' } : null
  const getAqiLevel = (a) => a == null ? { label: 'Unknown', color: '#6b7280' } : a <= 50 ? { label: 'Good', color: '#22c55e' } : a <= 100 ? { label: 'Moderate', color: '#eab308' } : a <= 150 ? { label: 'Unhealthy', color: '#f97316' } : { label: 'Hazardous', color: '#ef4444' }

  const wc = weather?.current?.weather_code ?? 0
  const ws = weather?.current?.wind_speed_10m ?? 0
  const aqiInfo = getAqiLevel(aqi?.us_aqi)
  const stormInfo = getStormLevel(wc, ws)
  const localHour = weather?.timezone
    ? Number(new Intl.DateTimeFormat('en-US', { hour: '2-digit', hourCycle: 'h23', timeZone: weather.timezone }).format(new Date()))
    : new Date().getHours()
  const isNightTime = localHour < 6 || localHour >= 18
  const astroLat = Number(location?.lat ?? 6.5244)
  const astroLon = Number(location?.lon ?? 3.3792)
  const sunPosition = getSunPosition(astronomyNow, astroLat, astroLon)
  const moonPosition = getMoonPosition(astronomyNow, astroLat, astroLon)
  const sunPoint = skyPoint(sunPosition)
  const moonPoint = skyPoint(moonPosition)
  const showSunInSky = sunPosition.altitude > -4 && sunPosition.altitude < 90
  const showMoonInSky = moonPosition.altitude > -4 && moonPosition.altitude < 90
  const moonRadius = 26
  const moonShadowWidth = Math.max(1, Math.min(moonRadius * 2, (1 - moonPosition.illumination) * moonRadius * 2))
  const solarEvents = getSolarEvents(astronomyNow, astroLat, astroLon)
  const lunarEvents = getMoonEvents(astronomyNow, astroLat, astroLon)
  const lunarPhase = getLunarPhase(astronomyNow)
  const nextLunarPhases = getNextLunarPhases(astronomyNow).slice(0, 4)
  const eclipseCandidates = getEclipseCandidates(astronomyNow, 12)
  const sunPath = getSkyPath('sun', astronomyNow, astroLat, astroLon, 30)
  const moonPath = getSkyPath('moon', astronomyNow, astroLat, astroLon, 30)
  const formatAstroTime = (value) => value ? new Intl.DateTimeFormat(uiLanguage || undefined, { hour: 'numeric', minute: '2-digit', timeZone: weather?.timezone || undefined }).format(value) : '—'
  const formatAstroDate = (value) => value ? new Intl.DateTimeFormat(uiLanguage || undefined, { month: 'short', day: 'numeric', timeZone: weather?.timezone || undefined }).format(value) : '—'
  const skyPathToD = (points, width = 320, height = 100, padX = 12, padY = 12) => {
    const visible = points.filter(p => Number.isFinite(p.altitude) && p.altitude > 0)
    return visible.map((p, i) => {
      const x = padX + (Math.max(0, Math.min(1440, p.minuteOfDay)) / 1440) * (width - padX * 2)
      const y = height - padY - (Math.max(0, Math.min(90, p.altitude)) / 90) * (height - padY * 2)
      return `${i ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`
    }).join(' ')
  }
  const currentMinuteOfDay = (() => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: weather?.timezone || undefined, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(astronomyNow)
    const part = type => Number(parts.find(p => p.type === type)?.value || 0)
    return part('hour') * 60 + part('minute')
  })()
  const moonTrackX = 12 + (currentMinuteOfDay / 1440) * 296
  const moonTrackY = 88 - (Math.max(0, Math.min(90, moonPosition.altitude)) / 90) * 64

  const timePhase = localHour >= 5 && localHour < 8 ? 'dawn'
    : localHour >= 8 && localHour < 16 ? 'day'
      : localHour >= 16 && localHour < 19 ? 'dusk' : 'night'
  const weatherMood = wc >= 95 ? 'storm'
    : (wc >= 80 && wc <= 82) ? 'showers'
      : ((wc >= 71 && wc <= 77) || wc === 85 || wc === 86) ? 'snow'
        : wc >= 66 ? 'freezing-rain'
          : wc >= 51 ? 'rain'
            : wc === 3 ? 'overcast'
              : wc === 2 ? 'partly-cloudy' : 'clear'
  const weatherBackgroundOverlay = (() => {
    const palettes = {
      dawn: {
        clear: 'linear-gradient(180deg, rgba(255,174,125,.22) 0%, rgba(69,94,145,.34) 34%, rgba(9,16,31,.97) 100%)',
        cloud: 'linear-gradient(180deg, rgba(166,139,167,.32) 0%, rgba(54,76,112,.46) 38%, rgba(9,16,31,.98) 100%)',
        rain: 'linear-gradient(180deg, rgba(75,103,133,.52) 0%, rgba(28,52,78,.72) 48%, rgba(8,15,29,.98) 100%)',
        storm: 'linear-gradient(180deg, rgba(48,39,78,.68) 0%, rgba(23,35,62,.82) 48%, rgba(5,10,24,.99) 100%)'
      },
      day: {
        clear: 'linear-gradient(180deg, rgba(70,164,204,.20) 0%, rgba(30,95,139,.32) 30%, rgba(9,16,31,.97) 100%)',
        cloud: 'linear-gradient(180deg, rgba(116,151,177,.36) 0%, rgba(49,77,104,.55) 38%, rgba(9,16,31,.98) 100%)',
        rain: 'linear-gradient(180deg, rgba(49,95,122,.56) 0%, rgba(24,55,78,.72) 48%, rgba(8,15,29,.99) 100%)',
        storm: 'linear-gradient(180deg, rgba(37,38,72,.70) 0%, rgba(20,33,57,.86) 48%, rgba(5,10,24,.99) 100%)'
      },
      dusk: {
        clear: 'linear-gradient(180deg, rgba(238,124,107,.25) 0%, rgba(111,77,127,.40) 28%, rgba(20,31,62,.75) 58%, rgba(8,14,30,.98) 100%)',
        cloud: 'linear-gradient(180deg, rgba(133,93,125,.42) 0%, rgba(66,67,103,.62) 38%, rgba(8,14,30,.99) 100%)',
        rain: 'linear-gradient(180deg, rgba(74,70,112,.55) 0%, rgba(31,51,80,.76) 48%, rgba(7,13,28,.99) 100%)',
        storm: 'linear-gradient(180deg, rgba(43,35,74,.72) 0%, rgba(20,31,58,.86) 48%, rgba(4,9,22,.99) 100%)'
      },
      night: {
        clear: 'linear-gradient(180deg, rgba(8,18,53,.30) 0%, rgba(13,29,67,.54) 30%, rgba(9,16,31,.98) 100%)',
        cloud: 'linear-gradient(180deg, rgba(37,43,76,.48) 0%, rgba(23,35,61,.70) 40%, rgba(7,13,28,.99) 100%)',
        rain: 'linear-gradient(180deg, rgba(19,42,66,.60) 0%, rgba(14,31,51,.82) 46%, rgba(5,10,24,.99) 100%)',
        storm: 'linear-gradient(180deg, rgba(18,15,44,.76) 0%, rgba(13,25,49,.88) 48%, rgba(3,7,19,1) 100%)'
      }
    }
    const mood = weatherMood === 'storm' ? 'storm'
      : ['rain', 'showers', 'snow', 'freezing-rain'].includes(weatherMood) ? 'rain'
        : ['overcast', 'partly-cloudy'].includes(weatherMood) ? 'cloud' : 'clear'
    return palettes[timePhase][mood]
  })()

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
      <div
        className={`weather-bg ${getWeatherClass(wc)} time-${timePhase} mood-${weatherMood}`}
        style={{ backgroundImage: weatherBackgroundOverlay }}
        aria-hidden="true"
      >
        {tab === 'weather' && <div className="weather-image-blend" style={{ backgroundImage: `url(${isNightTime ? nightWeatherBackground : morningWeatherBackground})` }} />}
        <svg className={`weather-atmosphere-svg phase-${timePhase} effect-${weatherMood}`} viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMin slice" role="presentation" aria-hidden="true">
          <defs>
            <linearGradient id="za-atmosphere-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity=".16" />
              <stop offset="52%" stopColor="#b7d9ef" stopOpacity=".035" />
              <stop offset="100%" stopColor="#07101f" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="za-rain-stroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d9f2ff" stopOpacity="0" />
              <stop offset="100%" stopColor="#a7d8f2" stopOpacity=".56" />
            </linearGradient>
            <radialGradient id="za-glass-drop" cx="30%" cy="22%" r="82%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity=".26" />
              <stop offset="38%" stopColor="#c8edff" stopOpacity=".10" />
              <stop offset="76%" stopColor="#8ec9ef" stopOpacity=".035" />
              <stop offset="100%" stopColor="#e9f8ff" stopOpacity=".13" />
            </radialGradient>
            <linearGradient id="za-glass-edge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity=".62" />
              <stop offset="48%" stopColor="#d8f3ff" stopOpacity=".10" />
              <stop offset="100%" stopColor="#a8d8f5" stopOpacity=".34" />
            </linearGradient>
            <radialGradient id="za-sun-glow"><stop offset="0%" stopColor="#ffe6ad" stopOpacity=".72"/><stop offset="100%" stopColor="#ffc879" stopOpacity="0"/></radialGradient>
            <radialGradient id="za-moon-glow"><stop offset="0%" stopColor="#d5e4ff" stopOpacity=".28"/><stop offset="100%" stopColor="#9cb9ff" stopOpacity="0"/></radialGradient>
            <filter id="za-soft-blur"><feGaussianBlur stdDeviation="18"/></filter>
          </defs>
          <rect width="1000" height="1000" fill="url(#za-atmosphere-fade)" />
          {showSunInSky && weatherMood !== 'storm' && weatherMood !== 'rain' && weatherMood !== 'showers' && weatherMood !== 'overcast' && weatherMood !== 'snow' && <g className="za-sun-atmosphere" transform={`translate(${sunPoint.x} ${sunPoint.y})`}><circle r="132" fill="url(#za-sun-glow)" filter="url(#za-soft-blur)"/><circle r="27" fill="#ffe7b5" fillOpacity=".94"/><circle r="35" fill="none" stroke="#ffe7b5" strokeOpacity=".28" strokeWidth="2"/><title>{`Sun altitude ${sunPosition.altitude.toFixed(1)}°, azimuth ${sunPosition.azimuth.toFixed(1)}°`}</title></g>}
          <g className="za-night-sky">{sunPosition.altitude < -6 && Array.from({length:42},(_,i)=>{const x=(i*137+53)%1000,y=(i*83+29)%480,r=i%7===0?2.1:0.9;return <circle key={`star-${i}`} cx={x} cy={y} r={r} fill="#e7f1ff" fillOpacity={i%3===0?'.72':'.38'}/>})}{showMoonInSky && <g transform={`translate(${moonPoint.x} ${moonPoint.y})`}><circle r="82" fill="url(#za-moon-glow)"/><circle r={moonRadius} fill="#dce8ff"/><clipPath id="za-moon-disc"><circle r={moonRadius}/></clipPath><g clipPath="url(#za-moon-disc)"><ellipse cx={moonPosition.waxing ? -moonRadius + moonShadowWidth : moonRadius - moonShadowWidth} cy="0" rx={moonRadius} ry={moonRadius} fill="#263653" fillOpacity=".98"/></g><title>{`Moon illumination ${Math.round(moonPosition.illumination * 100)}%; altitude ${moonPosition.altitude.toFixed(1)}°, azimuth ${moonPosition.azimuth.toFixed(1)}°`}</title></g>}</g>
          {(weatherMood === 'overcast' || weatherMood === 'partly-cloudy' || weatherMood === 'rain' || weatherMood === 'showers' || weatherMood === 'storm' || weatherMood === 'snow' || weatherMood === 'freezing-rain') && <g className="za-cloud-atmosphere" fill="#c4d7e8" fillOpacity={weatherMood==='storm'?.11:weatherMood==='overcast'?.16:.09}><path d="M-40 180 C-10 130 35 135 70 160 C90 112 155 112 182 160 C235 145 270 175 275 210 L-40 225Z"/><path d="M570 120 C600 75 655 82 680 111 C715 70 775 82 795 125 C842 109 892 134 900 171 L570 184Z"/><path d="M250 340 C280 298 330 300 350 328 C386 288 445 301 462 340 L250 365Z"/></g>}
          {(weatherMood === 'rain' || weatherMood === 'showers' || weatherMood === 'storm' || weatherMood === 'freezing-rain') && <g className="za-rain-atmosphere" stroke="url(#za-rain-stroke)" strokeWidth="1.6" strokeLinecap="round">{Array.from({length:64},(_,i)=>{const x=(i*79+23)%1000,y=(i*61+35)%670;return <line key={`rain-${i}`} x1={x} y1={y} x2={x-14} y2={y+35+(i%4)*7}/>})}</g>}
          {(weatherMood === 'rain' || weatherMood === 'showers' || weatherMood === 'storm' || weatherMood === 'freezing-rain') && <g className="za-glass-rain-drops">{Array.from({length: weatherMood === 'storm' ? 30 : weatherMood === 'showers' ? 18 : 12}, (_,i) => { const x=(i*137+47)%980+10, y=(i*97+68)%610+35, rx=2.2+(i%4)*1.15, ry=4.5+(i%5)*2.1; return <g key={`glass-drop-${i}`} transform={`translate(${x} ${y}) rotate(${(i%5-2)*5})`}><ellipse rx={rx+1.1} ry={ry+1.1} fill="#bfeaff" fillOpacity=".035"/><ellipse rx={rx} ry={ry} fill="url(#za-glass-drop)" stroke="url(#za-glass-edge)" strokeWidth={i%3===0?1.15:.72}/><path d={`M ${-rx*.48} ${-ry*.36} Q ${-rx*.62} ${-ry*.02} ${-rx*.3} ${ry*.18}`} fill="none" stroke="#ffffff" strokeOpacity={i%3===0?'.58':'.34'} strokeWidth=".8" strokeLinecap="round"/><ellipse cx={rx*.32} cy={ry*.42} rx={rx*.22} ry={ry*.12} fill="#dff5ff" fillOpacity=".22"/></g>})}</g>}
          {weatherMood === 'snow' && <g className="za-snow-atmosphere" fill="#e7f4ff" fillOpacity=".66">{Array.from({length:34},(_,i)=>{const x=(i*113+17)%1000,y=(i*71+41)%650,r=1.5+(i%4)*.65;return <circle key={`snow-${i}`} cx={x} cy={y} r={r}/>})}</g>}
          {weatherMood === 'storm' && <g className="za-lightning-atmosphere"><path d="M735 190 L700 258 L731 253 L704 315 L770 230 L738 236Z" fill="#e6efff" fillOpacity=".24"/><path d="M205 265 L185 305 L207 301 L191 340 L232 290 L211 294Z" fill="#d9e8ff" fillOpacity=".16"/></g>}
          {weatherMood === 'clear' && timePhase === 'day' && <g className="za-clear-air-haze"><ellipse cx="500" cy="320" rx="390" ry="125" fill="#a9e1f5" fillOpacity=".045" filter="url(#za-soft-blur)"/></g>}
        </svg>
        {weatherMood === 'storm' && <div className="za-lightning-flash" />}
      </div>
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
        userName={displayName}
        lang={getLang(location?.country_code)}
        greeting="Hey"
        voiceToUse={voiceToUse}
        uiLanguage={uiLanguage}
      />

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tab === 'weather' && (
          <>
            <section className="za-weather-hero za-weather-hero-atmosphere">
              <div className="za-weather-topbar">
                <button className="location-btn text-left" onClick={() => setShowLocationModal(true)}>
                  <span className="za-location-label"><LocationIcon /> {t('labels.location') || 'Location'}</span>
                  <strong>{location.name}</strong>
                  <small>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</small>
                </button>
                <div className="za-hero-actions">
                  <button className="za-icon-button" onClick={shareWeatherForCurrent} aria-label={t('buttons.shareWeather') || 'Share weather'} title={t('buttons.shareWeather') || 'Share weather'}>
                    <ShareIcon size={17} />
                  </button>
                  <button className="za-icon-button" onClick={() => { setNameDraft(displayName); setShowSettings(true) }} aria-label="Settings" title="Settings">
                    <svg className="za-settings-glyph" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.1"/><path d="M19.2 13.8a1.7 1.7 0 0 0 .34 1.86l.04.04-1.75 3.03-.06-.02a1.7 1.7 0 0 0-1.78.52l-.03.05h-3.5l-.02-.06a1.7 1.7 0 0 0-1.44-1.08 1.7 1.7 0 0 0-1.15.28l-.05.03-3.03-1.75.02-.06a1.7 1.7 0 0 0-.52-1.78l-.05-.03v-3.5l.06-.02a1.7 1.7 0 0 0 1.08-1.44 1.7 1.7 0 0 0-.28-1.15l-.03-.05 1.75-3.03.06.02a1.7 1.7 0 0 0 1.78-.52l.03-.05h3.5l.02.06a1.7 1.7 0 0 0 1.44 1.08 1.7 1.7 0 0 0 1.15-.28l.05-.03 3.03 1.75-.02.06a1.7 1.7 0 0 0 .52 1.78l.05.03v3.5z"/></svg>
                  </button>
                </div>
              </div>

              <div className="za-current-weather">
                <span className="za-current-eyebrow">CURRENT CONDITIONS</span>
                <div className="za-current-temp-row">
                  <h1>{weather?.current ? toDisplayTemp(weather.current.temperature_2m, temperatureUnit) : '--'}°{temperatureUnit}</h1>
                  <WeatherIcon code={wc} />
                </div>
                <div className="za-condition-label">{getWeatherConditionLabel(wc)}</div>
                <div className="za-high-low">
                  {weather?.current ? `${toDisplayTemp(weather.current.temperature_2m, temperatureUnit)}°${temperatureUnit} now` : 'Temperature unavailable'}
                  <span>·</span>
                  <span>High {weather?.daily?.temperature_2m_max?.[0] != null ? `${toDisplayTemp(weather.daily.temperature_2m_max[0], temperatureUnit)}°${temperatureUnit}` : '—'}</span>
                  <span>/</span>
                  <span>Low {weather?.daily?.temperature_2m_min?.[0] != null ? `${toDisplayTemp(weather.daily.temperature_2m_min[0], temperatureUnit)}°${temperatureUnit}` : '—'}</span>
                </div>
              </div>

              <div className="za-saved-location-row">
                <button onClick={() => setShowSavedPanel(true)} className="za-location-pill">
                  <LocationIcon /> {savedLocations.length > 0 ? `${savedLocations.length} saved` : 'My Places'}
                </button>
                {previousLocation && (
                  <button onClick={goBackToOriginalLocation} className="za-location-pill za-location-pill-active">
                    <BackIcon /> {t('buttons.back') || 'Back to my location'}
                  </button>
                )}
                {savedLocations.slice(0, 3).map(loc => (
                  <button key={loc.id} onClick={() => switchToSavedLocation(loc)} className="za-location-pill" title={loc.name}>
                    {loc.label || 'Untitled'}
                  </button>
                ))}
              </div>

              <div className="za-weather-indicators" aria-label="Weather indicators">
                {stormInfo && <span className="za-weather-indicator" style={{ '--indicator-color': stormInfo.color }}><i />{stormInfo.level}</span>}
                <span className="za-weather-indicator" style={{ '--indicator-color': aqiInfo.color }}><i />Air {aqiInfo.label}</span>
                <span className="za-weather-indicator"><i />Humidity {weather?.current?.relative_humidity_2m ?? '—'}%</span>
                <span className="za-weather-indicator"><i />UV {weather?.daily?.uv_index_max?.[0] ?? '—'}</span>
                <span className="za-weather-indicator"><i />Wind {weather?.current?.wind_speed_10m != null ? `${Math.round(weather.current.wind_speed_10m)} km/h` : '—'}</span>
              </div>
            </section>

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

            <section className="forecast-section">
              <div className="forecast-section-heading">
                <div><h2>{t('labels.hourlyForecast') || 'Hourly Forecast'}</h2><p>How conditions change through the next hours.</p></div>
                <div className="forecast-heading-actions">
                  <div className="forecast-view-toggle" role="group" aria-label="Hourly forecast view">
                    <button className={hourlyForecastView === 'cards' ? 'active' : ''} onClick={() => setHourlyForecastView('cards')}>Cards</button>
                    <button className={hourlyForecastView === 'graph' ? 'active' : ''} onClick={() => setHourlyForecastView('graph')}>Graph</button>
                  </div>
                  <button className="btn-ghost text-xs" onClick={() => { setForecastModalType('hourly'); setShowHourlyModal(true) }}>{t('buttons.viewAll') || 'View All →'}</button>
                </div>
              </div>
              {hourlyForecastView === 'cards' ? <div className="forecast-card-track">
                {(weather?.hourly?.time || []).slice(0, 12).map((time, i) => <button key={time} type="button" className="forecast-glass-card hourly-forecast-card" onClick={() => { setForecastModalType('hourly'); setShowHourlyModal(true) }}>
                  <span className="forecast-card-time">{new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</span>
                  <span className="forecast-card-icon"><HourlyWeatherIcon code={weather.hourly.weather_code?.[i] ?? 0} time={time} /></span>
                  <strong>{formatForecastValue(weather.hourly.temperature_2m?.[i], '°')}</strong>
                  {weather.hourly.precipitation_probability?.[i] != null && <small>{Math.round(weather.hourly.precipitation_probability[i])}% rain</small>}
                </button>)}
              </div> : <ForecastLineGraph labels={(weather?.hourly?.time || []).slice(0, 12).map(time => new Date(time).toLocaleTimeString('en-US', { hour: 'numeric' }))} series={[{ label: 'Temperature', unit: '°', values: (weather?.hourly?.temperature_2m || []).slice(0, 12) }, { label: 'Feels like', unit: `°${temperatureUnit}`, values: (weather?.hourly?.apparent_temperature || []).slice(0, 12).map(v => toDisplayTemp(v, temperatureUnit)) }]} ariaLabel="Hourly temperature and precipitation probability" />}
            </section>

            <section className="forecast-section">
              <div className="forecast-section-heading">
                <div><h2>{t('labels.dailyForecast') || '7-Day Forecast'}</h2><p>A daily outlook with conditions and useful planning details.</p></div>
                <div className="forecast-heading-actions">
                  <div className="forecast-view-toggle" role="group" aria-label="7-day forecast view">
                    <button className={dailyForecastView === 'cards' ? 'active' : ''} onClick={() => setDailyForecastView('cards')}>Cards</button>
                    <button className={dailyForecastView === 'graph' ? 'active' : ''} onClick={() => setDailyForecastView('graph')}>Graph</button>
                  </div>
                  <button className="forecast-view-all" onClick={() => { setForecastModalType('daily'); setShowHourlyModal(true) }}>View All <span aria-hidden="true">↗</span></button><button className="btn-ghost text-xs" onClick={() => setWeatherShare({ isOpen: true, type: 'weekly', overrideWeather: null, overrideLocation: null, overrideAqi: null, overrideStats: null, comparisonItems: null, comparisonTakeaway: '' })} title={t('buttons.shareWeekly') || 'Share weekly'}><ShareIcon size={16} /></button>
                </div>
              </div>
              {dailyForecastView === 'cards' ? <div className="forecast-day-list">
                {(weather?.daily?.time || []).slice(0, 7).map((day, i) => {
                  const code = weather?.daily?.weather_code?.[i]
                  const rain = weather?.daily?.precipitation_sum?.[i] ?? weather?.daily?.rain_sum?.[i]
                  const probability = weather?.daily?.precipitation_probability_max?.[i]
                  const description = getDailyConditionSummary(code, probability, rain)
                  return <div key={day} className="forecast-day-row">
                    <div className="forecast-day-date"><strong>{i === 0 ? 'Today' : new Date(`${day}T12:00:00`).toLocaleDateString('en', { weekday: 'short' })}</strong><small>{new Date(`${day}T12:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</small></div>
                    <span className="forecast-day-icon" aria-label={description}>{getWeatherIcon(code ?? 0)}</span>
                    <div className="forecast-day-condition"><strong>{description}</strong><small>{probability != null ? `${Math.round(probability)}% chance of precipitation` : rain != null ? `${Number(rain).toFixed(1)} mm expected precipitation` : 'Daily conditions'}</small></div>
                    <div className="forecast-day-temperatures"><strong>{formatForecastValue(toDisplayTemp(weather?.daily?.temperature_2m_max?.[i], temperatureUnit), `°${temperatureUnit}`)}</strong><span>{formatForecastValue(toDisplayTemp(weather?.daily?.temperature_2m_min?.[i], temperatureUnit), `°${temperatureUnit}`)}</span></div>
                  </div>
                })}
              </div> : <ForecastLineGraph labels={(weather?.daily?.time || []).slice(0, 7).map(day => new Date(`${day}T12:00:00`).toLocaleDateString('en', { weekday: 'short' }))} series={[{ label: 'High', unit: `°${temperatureUnit}`, values: (weather?.daily?.temperature_2m_max || []).slice(0, 7).map(v => toDisplayTemp(v, temperatureUnit)) }, { label: 'Low', unit: `°${temperatureUnit}`, values: (weather?.daily?.temperature_2m_min || []).slice(0, 7).map(v => toDisplayTemp(v, temperatureUnit)) }]} ariaLabel="Seven-day high and low temperatures" />}
              <div className="forecast-extra-data">
                {(weather?.daily?.precipitation_sum || weather?.daily?.precipitation_hours || weather?.daily?.uv_index_max || weather?.daily?.wind_speed_10m_max || weather?.daily?.sunshine_duration) && <>
                  <span><small>Precipitation</small><strong>{weather?.daily?.precipitation_sum?.[0] != null ? `${Number(weather.daily.precipitation_sum[0]).toFixed(1)} mm` : '—'}</strong></span>
                  <span><small>Rain hours</small><strong>{formatForecastValue(weather?.daily?.precipitation_hours?.[0], ' h')}</strong></span>
                  <span><small>UV peak</small><strong>{formatForecastValue(weather?.daily?.uv_index_max?.[0])}</strong></span>
                  <span><small>Max wind</small><strong>{formatForecastValue(weather?.daily?.wind_speed_10m_max?.[0], ' km/h')}</strong></span>
                  <span><small>Sunshine</small><strong>{weather?.daily?.sunshine_duration?.[0] != null ? `${(weather.daily.sunshine_duration[0] / 3600).toFixed(1)} h` : '—'}</strong></span>
                </>}
              </div>
            </section>

            <section className="za-home-hub za-astronomy-hub" aria-labelledby="za-astronomy-title" style={{background:'transparent',border:'1px solid rgba(255,255,255,.12)',boxShadow:'none'}}>
              <div className="za-home-hub-heading"><div><h2 id="za-astronomy-title" style={{fontSize:26,letterSpacing:'-.04em'}}>{(() => { const title = t('astronomy.cardTitle'); return !title || title === 'astronomy.cardTitle' || title === 'card-title' ? 'Astronomy' : title })()}</h2><p>{location?.name || t('labels.location') || 'Selected location'} · {t('astronomy.locationAware') || 'Calculated for this location'}</p></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{marginTop:16}}>
                <div className="glass" style={{padding:'20px',borderRadius:'20px',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.10)',boxShadow:'none'}}>
                  <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><strong style={{fontSize:18}}>☀️ {t('astronomy.sun') || 'Sun'}</strong><span style={{fontSize:12,opacity:.72}}>{t('astronomy.altitude') || 'Altitude'} {sunPosition.altitude.toFixed(1)}° · {sunPosition.azimuth.toFixed(1)}° {t('astronomy.azimuth') || 'azimuth'}</span></div>
                  <div style={{marginTop:10,padding:'4px 4px 0'}}>
                    <svg viewBox="0 0 320 132" role="img" aria-label={t('astronomy.solarPath') || 'Sun path across the sky'} style={{width:'100%',height:'auto',display:'block'}}>
                      <defs><linearGradient id="astroSunArc" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#f6b85d" stopOpacity=".35"/><stop offset="50%" stopColor="#ffd88b"/><stop offset="100%" stopColor="#f6b85d" stopOpacity=".35"/></linearGradient></defs>
                      <path d="M 18 112 A 142 94 0 0 1 302 112" fill="none" stroke="currentColor" strokeOpacity=".10" strokeWidth="1" strokeDasharray="3 5"/>
                      <path d="M 18 112 A 142 94 0 0 1 302 112" fill="none" stroke="url(#astroSunArc)" strokeWidth="3" strokeLinecap="round"/>
                      <path d="M 18 112 H 302" stroke="currentColor" strokeOpacity=".24" strokeWidth="1"/>
                      <circle cx={Math.max(18,Math.min(302,160 + Math.sin(sunPosition.azimuth*Math.PI/180)*130))} cy={Math.max(18,Math.min(108,112-Math.max(0,sunPosition.altitude)*1.05))} r="15" fill="#ffc96f" fillOpacity=".14"/>
                      <circle cx={Math.max(18,Math.min(302,160 + Math.sin(sunPosition.azimuth*Math.PI/180)*130))} cy={Math.max(18,Math.min(108,112-Math.max(0,sunPosition.altitude)*1.05))} r="6" fill="#ffd580" stroke="#fff1c8" strokeWidth="1.5"/>
                      <text x="18" y="128" fill="currentColor" opacity=".58" fontSize="9">EAST</text><text x="160" y="12" textAnchor="middle" fill="currentColor" opacity=".58" fontSize="9">SKY</text><text x="302" y="128" textAnchor="end" fill="currentColor" opacity=".58" fontSize="9">WEST</text>
                    </svg>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:8}}><div><small>{t('astronomy.sunrise') || 'Sunrise'}</small><div style={{fontSize:22,fontWeight:750,marginTop:3}}>{formatAstroTime(solarEvents.sunrise || weather?.daily?.sunrise?.[0] && new Date(weather.daily.sunrise[0]))}</div></div><div><small>{t('astronomy.sunset') || 'Sunset'}</small><div style={{fontSize:22,fontWeight:750,marginTop:3}}>{formatAstroTime(solarEvents.sunset || weather?.daily?.sunset?.[0] && new Date(weather.daily.sunset[0]))}</div></div></div>
                  <div style={{marginTop:15,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,fontSize:12,opacity:.82}}><span>{t('astronomy.civilTwilight') || 'Civil twilight'}<br/><strong style={{display:'inline-block',marginTop:4}}>{formatAstroTime(solarEvents.civilDawn)} – {formatAstroTime(solarEvents.civilDusk)}</strong></span><span>{t('astronomy.daylight') || 'Daylight'}<br/><strong style={{display:'inline-block',marginTop:4}}>{solarEvents.daylightMinutes == null ? '—' : `${Math.round(solarEvents.daylightMinutes)} ${t('astronomy.minutes') || 'min'}`}</strong></span></div>
                </div>
                <div className="glass" style={{padding:'20px',borderRadius:'20px',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.10)',boxShadow:'none'}}>
                  <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><strong style={{fontSize:18}}>🌙 {t('astronomy.moon') || 'Moon'}</strong><span style={{fontSize:12,opacity:.72}}>{Math.round(lunarPhase.illumination*100)}% {t('astronomy.illuminated') || 'illuminated'}</span></div>
                  <div style={{display:'flex',alignItems:'center',gap:14,marginTop:12}}><span aria-hidden="true" style={{fontSize:54,lineHeight:1,filter:'drop-shadow(0 3px 12px rgba(190,210,255,.18))'}}>{{'New Moon':'🌑','Waxing Crescent':'🌒','First Quarter':'🌓','Waxing Gibbous':'🌔','Full Moon':'🌕','Waning Gibbous':'🌖','Last Quarter':'🌗','Waning Crescent':'🌘'}[lunarPhase.name] || '🌙'}</span><div><div style={{fontSize:21,fontWeight:750,lineHeight:1.25}}>{t(`astronomy.phase.${lunarPhase.name}`) || lunarPhase.name}</div><div style={{fontSize:12,opacity:.78,marginTop:5}}>{t('astronomy.altitude') || 'Altitude'} {moonPosition.altitude.toFixed(1)}° · {moonPosition.azimuth.toFixed(1)}° {t('astronomy.azimuth') || 'azimuth'}</div></div></div>
                  <div style={{marginTop:14}}><small>{t('astronomy.lunarPath') || 'Moon’s path across the sky today'}</small><svg viewBox="0 0 320 104" role="img" aria-label={t('astronomy.lunarPath') || 'Moon’s path across the sky today'} style={{width:'100%',height:'auto',display:'block',marginTop:5,overflow:'visible'}}><defs><linearGradient id="zaLunarTrack" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#b9d0ff" stopOpacity=".25"/><stop offset="50%" stopColor="#dce8ff" stopOpacity=".95"/><stop offset="100%" stopColor="#b9d0ff" stopOpacity=".25"/></linearGradient></defs><path d="M 12 88 H 308" fill="none" stroke="currentColor" strokeOpacity=".24" strokeWidth="1"/><path d="M 12 88 Q 160 4 308 88" fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="1" strokeDasharray="3 5"/><path d={skyPathToD(moonPath,320,104,12,16)} fill="none" stroke="url(#zaLunarTrack)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>{moonPosition.altitude > 0 && <g transform={`translate(${moonTrackX} ${moonTrackY})`}><circle r="10" fill="#cbdcff" fillOpacity=".15"/><circle r="4.5" fill="#e4edff" stroke="#9db8f5" strokeWidth="1.5"/><title>{`${Math.round(lunarPhase.illumination*100)}% illuminated · altitude ${moonPosition.altitude.toFixed(1)}°`}</title></g>}<text x="12" y="101" fontSize="9" fill="currentColor" opacity=".62">12 AM</text><text x="160" y="101" textAnchor="middle" fontSize="9" fill="currentColor" opacity=".62">12 PM</text><text x="308" y="101" textAnchor="end" fontSize="9" fill="currentColor" opacity=".62">12 AM</text></svg></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:8}}><div><small>{t('astronomy.moonrise') || 'Moonrise'}</small><div style={{fontSize:21,fontWeight:750,marginTop:3}}>{formatAstroTime(lunarEvents.moonrise)}</div></div><div><small>{t('astronomy.moonset') || 'Moonset'}</small><div style={{fontSize:21,fontWeight:750,marginTop:3}}>{formatAstroTime(lunarEvents.moonset)}</div></div></div>
                </div>
              </div>
              <div className="glass" style={{padding:'18px 20px',borderRadius:'20px',marginTop:14,background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.10)',boxShadow:'none'}}>
                <strong style={{fontSize:17}}>{t('astronomy.upcomingPhases') || 'Upcoming lunar phases'}</strong>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{marginTop:14}}>{nextLunarPhases.map(p => <div key={`${p.name}-${p.date.toISOString()}`} style={{padding:'12px 8px',borderRadius:14,border:'1px solid rgba(255,255,255,.09)',background:'transparent',display:'flex',alignItems:'center',gap:10,minWidth:0}}><span aria-hidden="true" style={{fontSize:29,lineHeight:1}}>{{'New Moon':'🌑','Waxing Crescent':'🌒','First Quarter':'🌓','Waxing Gibbous':'🌔','Full Moon':'🌕','Waning Gibbous':'🌖','Last Quarter':'🌗','Waning Crescent':'🌘'}[p.name] || '🌙'}</span><span style={{minWidth:0}}><span style={{display:'block',fontSize:12,opacity:.78,lineHeight:1.35}}>{t(`astronomy.phase.${p.name}`) || p.name}</span><strong style={{display:'block',fontSize:14,marginTop:4}}>{formatAstroDate(p.date)}</strong></span></div>)}</div>
                <div style={{marginTop:18,paddingTop:15,borderTop:'1px solid rgba(255,255,255,.10)'}}><strong style={{fontSize:16}}>{t('astronomy.eclipseOutlook') || 'Upcoming astronomical events'}</strong><p style={{fontSize:12,opacity:.7,marginTop:5}}>{t('astronomy.eclipseDisclaimer') || 'Potential eclipse dates are estimates, not confirmed local visibility or contact times.'}</p>
                  {eclipseCandidates.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-2" style={{marginTop:10}}>{eclipseCandidates.slice(0,4).map((e,i)=><div key={`${e.type}-${i}`} style={{fontSize:13,padding:'12px 10px',borderRadius:14,border:'1px solid rgba(255,255,255,.09)',background:'transparent',display:'flex',alignItems:'center',gap:10}}><span aria-hidden="true" style={{fontSize:27}}>{e.type==='Possible solar eclipse'?'🌞':'🌕'}</span><span><strong style={{display:'block'}}>{formatAstroDate(e.date)}</strong><span style={{opacity:.78}}>{t(e.type==='Possible solar eclipse'?'astronomy.possibleSolarEclipse':'astronomy.possibleLunarEclipse') || e.type}</span></span></div>)}</div> : <div style={{fontSize:13,opacity:.8,marginTop:8}}>🌌 {t('astronomy.noCandidate') || 'No likely eclipse candidate flagged in the next year by this screening calculation.'}</div>}
                </div>
              </div>
            </section>

            <ScoreHub scores={calculateScores(weather, aqi, (() => { try { return JSON.parse(localStorage.getItem('zephye_marine_cache') || 'null') } catch { return null } })())} onViewAnalytics={(mode) => setTab(mode === 'ocean' ? 'marine' : 'environment')} />
            <section className="za-home-hub">
              <div className="za-home-hub-heading"><div><span className="za-eyebrow">DETAILED WEATHER</span><h2>Explore your environment</h2><p>Open the full analytics pages for grouped readings and trends.</p></div></div>
              <div className="za-home-hub-links">
                <button className="za-home-hub-link" onClick={() => setTab('environment')}><span className="za-home-hub-symbol">◌</span><span><strong>Open Environment page</strong><small>Air, sky, wind, solar and comfort trends</small></span><span className="za-home-hub-arrow">↗</span></button>
                <button className="za-home-hub-link" onClick={() => setTab('marine')}><span className="za-home-hub-symbol za-ocean-symbol">≈</span><span><strong>Open Marine page</strong><small>Waves, swell, sea temperature and coastal context</small></span><span className="za-home-hub-arrow">↗</span></button>
              </div>
            </section>
          </>
        )}

        {tab === 'environment' && (
          <EnvironmentPage
            weather={weather}
            aqi={aqi}
            location={location}
            onBack={() => setTab('weather')}
            onLocationClick={() => setShowLocationModal(true)}
          />
        )}

        {tab === 'marine' && (
          <MarinePage
            location={location}
            onBack={() => setTab('weather')}
            onLocationClick={() => setShowLocationModal(true)}
            onSelectMarineLocation={(preset) => { setLocation({ lat:preset.lat, lon:preset.lon, name:`${preset.name}, ${preset.region}`, country_code:preset.country_code }); setTab('marine') }}
          />
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

      {(showSettings || showNameSetup) && (
        <div className="zephye-settings-backdrop" role="presentation" onClick={() => { if (!showNameSetup) setShowSettings(false) }}>
          <section className="zephye-settings-panel" role="dialog" aria-modal="true" aria-labelledby="zephye-settings-title" onClick={e => e.stopPropagation()}>
            <div className="zephye-settings-heading"><div><span className="zephye-settings-kicker">PERSONALIZE ZEPHYE</span><h2 id="zephye-settings-title">{showNameSetup ? 'Welcome to Zephye' : 'Settings'}</h2></div>{!showNameSetup && <button className="za-icon-button" onClick={() => setShowSettings(false)} aria-label="Close settings">×</button>}</div>
            {showNameSetup && <p className="zephye-settings-description">What should Zephye call you in your weather briefing?</p>}
            <label className="zephye-settings-label" htmlFor="zephye-display-name">Your name</label>
            <input id="zephye-display-name" className="zephye-settings-input" value={nameDraft} onChange={e => setNameDraft(e.target.value)} placeholder="Enter your name" autoComplete="given-name" maxLength={40} />
            {!showNameSetup && <><div className="zephye-settings-divider"/><div className="zephye-settings-unit-row"><div><strong>Temperature unit</strong><small>Choose how temperatures are displayed</small></div><div className="zephye-unit-switch"><button className={temperatureUnit === 'C' ? 'active' : ''} onClick={() => { setTemperatureUnit('C'); localStorage.setItem('zephye_temperature_unit', 'C') }}>°C</button><button className={temperatureUnit === 'F' ? 'active' : ''} onClick={() => { setTemperatureUnit('F'); localStorage.setItem('zephye_temperature_unit', 'F') }}>°F</button></div></div></>}
            <button className="zephye-settings-save" onClick={() => { const cleaned = nameDraft.trim(); if (!cleaned) return; saveProfileName(cleaned); setDisplayName(cleaned); setShowNameSetup(false); setShowSettings(false) }}>{showNameSetup ? 'Continue' : 'Save changes'}</button>
          </section>
        </div>
      )}

      <div className="bottom-nav">
        <button className={`nav-btn ${tab === 'weather' ? 'active' : ''}`} onClick={() => setTab('weather')}>
          {t('tabs.home') || 'Home'}
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

      <ForecastViewModal
        isOpen={showHourlyModal}
        onClose={() => setShowHourlyModal(false)}
        type={forecastModalType}
        weather={weather}
        locationName={location?.name}
        temperatureUnit={temperatureUnit}
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
        <div className="glass-card-unified quote-day-card mb-4">
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

      <div className="glass-card-unified mb-4">
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
          <div className="glass-card-unified quote-fact-content-card">
            <p className="font-bold mb-4">{currentQuote.content}</p>
            <p className="text-sm text-muted mb-4">— {currentQuote.author}</p>
            <div className="flex gap-2">
              <button className="btn-share text-sm" onClick={() => shareQuote(currentQuote.content, currentQuote.author)}>Share</button>
              <button className="btn-ghost text-sm" onClick={() => saveQuote(currentQuote)}>Save</button>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card-unified mb-4">
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
          <div className="glass-card-unified quote-fact-content-card">
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
