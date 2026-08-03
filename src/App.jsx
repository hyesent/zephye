import { useState, useEffect } from 'react'
import { QUOTES } from './data/quotes.js'
import { AudioProvider } from './AudioContext.jsx'
import WeatherManTab from './WeatherManTab.jsx'
import ZephyeFullScreen from './ZephyeFullScreen.jsx'
import MapTab from './MapTab.jsx'
import { getLang, getVoiceForLocation } from './zephyeHelpers'

const QUOTE_CATEGORIES = ['All', 'Motivational', 'Success', 'Wisdom', 'Love']
const FACT_CATEGORIES = ['All', 'Science', 'History', 'Animals', 'Space']
const OPENWEATHER_KEY = "576b156966c5789a1b3fd0074c8469f1"

// ============================================================================
// SVG ICONS — Animated
// ============================================================================

const LocationIcon = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
    <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
  </svg>
)

const EditIcon = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const DeleteIcon = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
)

const AddIcon = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const BackIcon = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)

const CloseIcon = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ============================================================================
// ANIMATED WEATHER ICONS — SVG
// ============================================================================

const SunIcon = ({ size = 50, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="22" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2">
      <animate attributeName="r" values="22;24;22" dur="3s" repeatCount="indefinite"/>
    </circle>
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
      <line
        key={i}
        x1="50" y1="12" x2="50" y2="28"
        stroke="#FBBF24" strokeWidth="3" strokeLinecap="round"
        transform={`rotate(${deg} 50 50)`}
        opacity="0.6"
      >
        <animate attributeName="y1" values="12;8;12" dur="2s" begin={`${i * 0.15}s`} repeatCount="indefinite"/>
        <animate attributeName="y2" values="28;24;28" dur="2s" begin={`${i * 0.15}s`} repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin={`${i * 0.15}s`} repeatCount="indefinite"/>
      </line>
    ))}
    <circle cx="50" cy="50" r="50" fill="url(#sunGlow)" opacity="0.15">
      <animate attributeName="r" values="50;60;50" dur="4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.15;0.25;0.15" dur="4s" repeatCount="indefinite"/>
    </circle>
    <defs>
      <radialGradient id="sunGlow">
        <stop offset="0%" stopColor="#FBBF24"/>
        <stop offset="100%" stopColor="#FBBF24" stopOpacity="0"/>
      </radialGradient>
    </defs>
  </svg>
)

const RainIcon = ({ size = 50, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <ellipse cx="50" cy="40" rx="35" ry="22" fill="#94A3B8" opacity="0.8">
        <animate attributeName="ry" values="22;24;22" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <circle cx="35" cy="30" r="12" fill="#64748B" opacity="0.6">
        <animate attributeName="cx" values="35;37;35" dur="4s" repeatCount="indefinite"/>
      </circle>
      <circle cx="65" cy="30" r="14" fill="#64748B" opacity="0.6">
        <animate attributeName="cx" values="65;63;65" dur="4.5s" repeatCount="indefinite"/>
      </circle>
      {[
        { x: 30, delay: 0, speed: 0.6 },
        { x: 40, delay: 0.2, speed: 0.7 },
        { x: 50, delay: 0.4, speed: 0.55 },
        { x: 60, delay: 0.1, speed: 0.65 },
        { x: 70, delay: 0.3, speed: 0.75 },
        { x: 35, delay: 0.5, speed: 0.6 },
        { x: 55, delay: 0.15, speed: 0.7 },
        { x: 45, delay: 0.35, speed: 0.5 },
      ].map((drop, i) => (
        <line
          key={i}
          x1={drop.x} y1="50" x2={drop.x + 2} y2="75"
          stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"
        >
          <animate attributeName="y1" values="50;10;50" dur={`${drop.speed}s`} begin={`${drop.delay}s`} repeatCount="indefinite"/>
          <animate attributeName="y2" values="75;35;75" dur={`${drop.speed}s`} begin={`${drop.delay}s`} repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0;0.6" dur={`${drop.speed}s`} begin={`${drop.delay}s`} repeatCount="indefinite"/>
        </line>
      ))}
    </g>
  </svg>
)

const ThunderIcon = ({ size = 50, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="40" rx="35" ry="22" fill="#475569" opacity="0.9">
      <animate attributeName="ry" values="22;25;22" dur="2.5s" repeatCount="indefinite"/>
    </ellipse>
    <circle cx="32" cy="28" r="14" fill="#334155" opacity="0.7">
      <animate attributeName="cx" values="32;35;32" dur="3.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="68" cy="28" r="16" fill="#334155" opacity="0.7">
      <animate attributeName="cx" values="68;65;68" dur="4s" repeatCount="indefinite"/>
    </circle>
    <g opacity="0.9">
      <polygon points="48,55 55,70 48,70 52,85 60,68 52,68 58,55" fill="#FBBF24">
        <animate attributeName="opacity" values="0.9;1;0.3;0.9" dur="4s" repeatCount="indefinite"/>
      </polygon>
    </g>
    <rect x="0" y="0" width="100" height="100" fill="white" opacity="0">
      <animate attributeName="opacity" values="0;0;0;0.4;0;0;0;0.3;0;0" dur="4s" repeatCount="indefinite"/>
    </rect>
    {[
      { x: 35, delay: 0, speed: 0.5 },
      { x: 45, delay: 0.15, speed: 0.6 },
      { x: 55, delay: 0.3, speed: 0.55 },
      { x: 65, delay: 0.1, speed: 0.65 },
    ].map((drop, i) => (
      <line
        key={i}
        x1={drop.x} y1="50" x2={drop.x + 2} y2="75"
        stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"
      >
        <animate attributeName="y1" values="50;5;50" dur={`${drop.speed}s`} begin={`${drop.delay}s`} repeatCount="indefinite"/>
        <animate attributeName="y2" values="75;30;75" dur={`${drop.speed}s`} begin={`${drop.delay}s`} repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0;0.5" dur={`${drop.speed}s`} begin={`${drop.delay}s`} repeatCount="indefinite"/>
      </line>
    ))}
  </svg>
)

const CloudIcon = ({ size = 50, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="45" rx="38" ry="24" fill="#94A3B8" opacity="0.8">
      <animate attributeName="rx" values="38;42;38" dur="5s" repeatCount="indefinite"/>
      <animate attributeName="cx" values="50;52;50" dur="6s" repeatCount="indefinite"/>
    </ellipse>
    <circle cx="28" cy="35" r="16" fill="#64748B" opacity="0.7">
      <animate attributeName="cx" values="28;31;28" dur="5.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="72" cy="35" r="18" fill="#64748B" opacity="0.7">
      <animate attributeName="cx" values="72;69;72" dur="6.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="50" cy="28" r="14" fill="#64748B" opacity="0.6">
      <animate attributeName="cx" values="50;53;50" dur="4.5s" repeatCount="indefinite"/>
    </circle>
  </svg>
)

const PartlyCloudyIcon = ({ size = 50, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="25" cy="30" r="16" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5">
      <animate attributeName="r" values="16;18;16" dur="3s" repeatCount="indefinite"/>
    </circle>
    <ellipse cx="55" cy="48" rx="30" ry="18" fill="#94A3B8" opacity="0.8">
      <animate attributeName="rx" values="30;34;30" dur="4s" repeatCount="indefinite"/>
    </ellipse>
    <circle cx="42" cy="40" r="12" fill="#64748B" opacity="0.6">
      <animate attributeName="cx" values="42;45;42" dur="5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="68" cy="40" r="14" fill="#64748B" opacity="0.6">
      <animate attributeName="cx" values="68;65;68" dur="5.5s" repeatCount="indefinite"/>
    </circle>
    {[0, 45, 90, 135, 180, 225, 270, 315].slice(0, 6).map((deg, i) => (
      <line
        key={i}
        x1="25" y1="8" x2="25" y2="18"
        stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"
        transform={`rotate(${deg} 25 30)`}
        opacity="0.5"
      >
        <animate attributeName="y1" values="8;5;8" dur="2.5s" begin={`${i * 0.2}s`} repeatCount="indefinite"/>
        <animate attributeName="y2" values="18;15;18" dur="2.5s" begin={`${i * 0.2}s`} repeatCount="indefinite"/>
      </line>
    ))}
  </svg>
)

const FogIcon = ({ size = 50, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="40" rx="40" ry="22" fill="#94A3B8" opacity="0.5">
      <animate attributeName="rx" values="40;45;40" dur="4s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="30" cy="55" rx="35" ry="10" fill="#94A3B8" opacity="0.3">
      <animate attributeName="cx" values="30;35;30" dur="5s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="70" cy="60" rx="30" ry="8" fill="#94A3B8" opacity="0.3">
      <animate attributeName="cx" values="70;65;70" dur="4.5s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="50" cy="75" rx="40" ry="8" fill="#94A3B8" opacity="0.2">
      <animate attributeName="cx" values="50;55;50" dur="6s" repeatCount="indefinite"/>
    </ellipse>
  </svg>
)

// ============================================================================
// WEATHER ICON MAPPER
// ============================================================================

const getWeatherSvgIcon = (code, size = 50) => {
  if (code === 0 || code === 1) return <SunIcon size={size} />
  if (code === 2) return <PartlyCloudyIcon size={size} />
  if (code === 3) return <CloudIcon size={size} />
  if (code >= 95) return <ThunderIcon size={size} />
  if (code >= 61 && code <= 82) return <RainIcon size={size} />
  if (code >= 51 && code <= 57) return <RainIcon size={size} />
  if (code === 45 || code === 48) return <FogIcon size={size} />
  return <SunIcon size={size} />
}

const getWeatherEmojiFallback = (code) => {
  if (code === 0 || code === 1) return '☀️'
  if (code === 2) return '⛅'
  if (code === 3) return '☁️'
  if (code >= 95) return '⛈️'
  if (code >= 61 && code <= 82) return '🌧️'
  if (code >= 51 && code <= 57) return '🌦️'
  if (code >= 71 && code <= 77) return '❄️'
  if (code === 45 || code === 48) return '🌫️'
  return '🌤️'
}

// ============================================================================
// QUOTE & FACT HELPERS
// ============================================================================

const getAllQuotesPool = () => {
  const pool = []
  Object.keys(QUOTES).forEach(cat => {
    QUOTES[cat].forEach(q => pool.push({...q, tag: cat }))
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

// ============================================================================
// WEATHER ICON COMPONENT
// ============================================================================

function WeatherIcon({ code }) {
  const size = 50
  return (
    <div className="weather-icon-wrapper">
      {getWeatherSvgIcon(code, size)}
    </div>
  )
}

// ============================================================================
// HOURLY MODAL COMPONENT
// ============================================================================

function HourlyModal({ isOpen, onClose, hourlyData, locationName }) {
  if (!isOpen || !hourlyData) return null

  const getWeatherIconSmall = (code) => {
    return getWeatherSvgIcon(code, 32)
  }

  return (
    <div className="hourly-modal-overlay" onClick={onClose}>
      <div className="hourly-modal-content" onClick={e => e.stopPropagation()}>
        <button className="hourly-modal-close" onClick={onClose}>
          <CloseIcon />
        </button>

        <h3 className="hourly-modal-title">Hourly Forecast</h3>
        <p className="hourly-modal-subtitle">
          {locationName || 'Your location'} • {new Date(hourlyData.time[0]).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>

        <div className="hourly-list">
          {hourlyData.time.slice(0, 24).map((time, i) => {
            const temp = hourlyData.temperature_2m?.[i]
            const code = hourlyData.weather_code?.[i] || 0
            const precip = hourlyData.precipitation_probability?.[i]
            const rain = hourlyData.precipitation?.[i]
            const wind = hourlyData.wind_speed_10m?.[i]
            const humidity = hourlyData.relative_humidity_2m?.[i]
            const pressure = hourlyData.pressure_msl?.[i]
            const gust = hourlyData.wind_gusts_10m?.[i]

            return (
              <div key={time} className="hourly-item">
                <div className="hourly-time">
                  {new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                </div>
                <div className="hourly-icon">{getWeatherIconSmall(code)}</div>
                <div className="hourly-temp">{Math.round(temp)}°</div>
                <div className="hourly-details">
                  {precip > 0 && <span className="hourly-detail precip">🌧️ {Math.round(precip)}%</span>}
                  {rain > 0 && <span className="hourly-detail rain">💧 {Math.round(rain * 10) / 10}mm</span>}
                  {wind > 0 && <span className="hourly-detail wind">💨 {Math.round(wind)} km/h</span>}
                  {gust > 15 && <span className="hourly-detail gust">⚡{Math.round(gust)}</span>}
                  {humidity > 0 && <span className="hourly-detail humidity">💧 {Math.round(humidity)}%</span>}
                  {pressure > 0 && <span className="hourly-detail pressure">📊 {Math.round(pressure)} hPa</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN APP CONTENT
// ============================================================================

function AppContent() {
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
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [todayStats, setTodayStats] = useState({ sunHours: 0, rainHours: 0, thunderHours: 0, maxRainProb: 0, rainPeriods: [], sunrise: '--:--', sunset: '--:--', feelsLike: 0, windGust: 0, pressureTrend: '→' })
  const [hasWelcomed, setHasWelcomed] = useState(false)
  const [voiceToUse, setVoiceToUse] = useState('en-US-JennyNeural')
  const [showHourlyModal, setShowHourlyModal] = useState(false)

  useEffect(() => { localStorage.setItem('zephye_saved_locations', JSON.stringify(savedLocations)) }, [savedLocations])

  useEffect(() => {
    const autoVoice = getVoiceForLocation(null, location?.country_code, 'female')
    setVoiceToUse(autoVoice)
    localStorage.setItem('weatherman_voice', autoVoice)
  }, [location?.country_code])

  useEffect(() => {
    fetch('https://hyezen.onrender.com/api/ping', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ timestamp: Date.now(), user: localStorage.getItem('weatherman_name') || 'anonymous', location: location.name }) }).catch(() => {})
    const savedLoc = localStorage.getItem('zephye_location')
    const savedManual = localStorage.getItem('zephye_isManual')
    if (savedLoc && savedManual === 'true') {
      try { const loc = JSON.parse(savedLoc); setLocation(loc); setIsManualLocation(true); fetchWeatherData(loc.lat, loc.lon) } catch { initLocation() }
    } else { initLocation() }
    fetchQuoteOfDay()
  }, [])

  useEffect(() => { if (!hasWelcomed && weather && !isLoading) { setTimeout(() => showToast('Welcome to Zephye'), 1000); setHasWelcomed(true) } }, [weather, isLoading])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const addNewLocation = () => {
    const newLoc = { id: Date.now(), label: '', lat: location.lat, lon: location.lon, name: location.name, country_code: location.country_code }
    setSavedLocations(prev => [...prev, newLoc])
    setEditingLocId(newLoc.id)
    setEditLabel('')
    setEditCity('')
    setSearchResults([])
  }

  const searchPlaceForLocation = async (query) => {
    if (!query || query.length < 2) { setSearchResults([]); return }
    setIsSearching(true)
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`)
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results.map(r => ({ id: r.id, name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`, lat: r.latitude, lon: r.longitude, country_code: r.country_code?.toUpperCase() || 'US' })))
      } else { setSearchResults([]) }
    } catch { setSearchResults([]) }
    setIsSearching(false)
  }

  const selectPlaceForLocation = (locId, place) => {
    setSavedLocations(prev => prev.map(loc => loc.id === locId ? { ...loc, lat: place.lat, lon: place.lon, name: place.name, country_code: place.country_code } : loc))
    setSearchResults([])
    setEditCity('')
  }

  const updateLocationLabel = (locId, label) => { setSavedLocations(prev => prev.map(loc => loc.id === locId ? { ...loc, label: label || 'Untitled Location' } : loc)) }
  const saveLocationEdits = () => { setEditingLocId(null); setEditLabel(''); setEditCity(''); setSearchResults([]); showToast('Location updated') }
  const deleteLocation = (locId) => { setSavedLocations(prev => prev.filter(loc => loc.id !== locId)); if (editingLocId === locId) setEditingLocId(null); showToast('Location removed') }

  const switchToSavedLocation = (savedLoc) => {
    if (!previousLocation) setPreviousLocation({ lat: location.lat, lon: location.lon, name: location.name, country_code: location.country_code, isManual: isManualLocation })
    const nl = { lat: savedLoc.lat, lon: savedLoc.lon, name: savedLoc.name, country_code: savedLoc.country_code }
    setLocation(nl); setIsManualLocation(true)
    localStorage.setItem('zephye_location', JSON.stringify(nl)); localStorage.setItem('zephye_isManual', 'true')
    fetchWeatherData(savedLoc.lat, savedLoc.lon); setShowSavedPanel(false)
    showToast(`Showing weather for ${savedLoc.label || savedLoc.name}`)
  }

  const goBackToOriginalLocation = () => {
    if (!previousLocation) return
    const ol = { lat: previousLocation.lat, lon: previousLocation.lon, name: previousLocation.name, country_code: previousLocation.country_code }
    setLocation(ol); setIsManualLocation(previousLocation.isManual || false)
    if (previousLocation.isManual) { localStorage.setItem('zephye_location', JSON.stringify(ol)); localStorage.setItem('zephye_isManual', 'true') }
    else { localStorage.removeItem('zephye_location'); localStorage.removeItem('zephye_isManual') }
    fetchWeatherData(ol.lat, ol.lon); setPreviousLocation(null)
    showToast('Back to original location')
  }

  const saveCurrentLocation = () => {
    if (savedLocations.find(loc => Math.abs(loc.lat - location.lat) < 0.01 && Math.abs(loc.lon - location.lon) < 0.01)) { showToast('Already saved'); return }
    const nl = { id: Date.now(), label: '', lat: location.lat, lon: location.lon, name: location.name, country_code: location.country_code }
    setSavedLocations(prev => [...prev, nl]); setEditingLocId(nl.id); setEditLabel(''); setEditCity(''); setSearchResults([])
    showToast('Location saved. Edit label to name it.')
  }

  const fetchQuoteOfDay = () => {
    const pool = getAllQuotesPool(); const today = new Date().toISOString().split('T')[0]
    const dn = Math.floor((new Date(today).getTime() - new Date('2024-01-01').getTime()) / 86400000)
    setQuoteOfDay(pool[dn % pool.length])
  }

  const calculateTodayStats = (hourly, daily) => {
    if (!hourly?.time) return
    let sunHours = 0, rainHours = 0, thunderHours = 0, maxRainProb = 0, currentRainPeriod = null
    const rainPeriods = []
    hourly.time.slice(0, 24).forEach((time, i) => {
      const code = hourly.weather_code?.[i] || 0, prob = hourly.precipitation_probability?.[i] || 0, precip = hourly.precipitation?.[i] || 0
      if (code === 0 || code === 1) sunHours++
      if (prob > 30 || precip > 0.1) {
        rainHours++; const hour = new Date(time).getHours()
        if (!currentRainPeriod) currentRainPeriod = { start: hour, end: hour }
        else if (hour === currentRainPeriod.end + 1) currentRainPeriod.end = hour
        else { rainPeriods.push(`${currentRainPeriod.start}:00-${currentRainPeriod.end + 1}:00`); currentRainPeriod = { start: hour, end: hour } }
      } else if (currentRainPeriod) { rainPeriods.push(`${currentRainPeriod.start}:00-${currentRainPeriod.end + 1}:00`); currentRainPeriod = null }
      if (code >= 95) thunderHours++; if (prob > maxRainProb) maxRainProb = prob
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
    try { const p = await navigator.permissions.query({ name: 'geolocation' }); if (p.state === 'granted' || p.state === 'prompt') getCurrentLocation(); else fetchWeatherData(6.5244, 3.3792) } catch { getCurrentLocation() }
  }

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => { reverseGeocode(pos.coords.latitude, pos.coords.longitude); fetchWeatherData(pos.coords.latitude, pos.coords.longitude); setIsManualLocation(false); localStorage.removeItem('zephye_location'); localStorage.removeItem('zephye_isManual') },
      () => { showToast('Location denied'); fetchWeatherData(6.5244, 3.3792) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`, { headers: { 'User-Agent': 'Zephye-App/1.0' } })
      const data = await res.json()
      const lga = data.address.county?.replace(' Local Government Area','') || data.address.town || data.address.city || data.address.village || 'Current Location'
      setLocation({ lat, lon, name: `${lga}, ${data.address.state || 'State'}, ${data.address.country || 'Country'}`, country_code: data.address.country_code?.toUpperCase() || 'US' })
      setIsManualLocation(false); localStorage.removeItem('zephye_location'); localStorage.removeItem('zephye_isManual')
    } catch { setLocation({ lat, lon, name: 'Current Location', country_code: 'US' }) }
  }

  const searchCity = async () => {
    if (!citySearch.trim()) { showToast('Type a place name'); return }
    try {
      let res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(citySearch)}&count=5&language=en&format=json`)
      let data = await res.json()
      if (!data.results?.length) {
        const owRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(citySearch)}&limit=5&appid=${OPENWEATHER_KEY}`)
        const owData = await owRes.json()
        if (!owData?.length) { showToast('Place not found'); return }
        const r = owData[0]; const dn = `${r.name}${r.state ? ', ' + r.state : ''}, ${r.country}`
        const nl = { lat: r.lat, lon: r.lon, name: dn, country_code: r.country?.slice(0,2)?.toUpperCase() || 'US' }
        setLocation(nl); setIsManualLocation(true); localStorage.setItem('zephye_location', JSON.stringify(nl)); localStorage.setItem('zephye_isManual', 'true')
        fetchWeatherData(r.lat, r.lon); setShowLocationModal(false); setCitySearch(''); showToast(`Location: ${dn}`); return
      }
      const r = data.results[0]; const dn = `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`
      const nl = { lat: r.latitude, lon: r.longitude, name: dn, country_code: r.country_code?.toUpperCase() || 'US' }
      setLocation(nl); setIsManualLocation(true); localStorage.setItem('zephye_location', JSON.stringify(nl)); localStorage.setItem('zephye_isManual', 'true')
      fetchWeatherData(r.latitude, r.longitude); setShowLocationModal(false); setCitySearch(''); showToast(`Location: ${r.name}`)
    } catch { showToast('Search failed') }
  }

  const fetchWeatherData = async (lat, lon) => {
    try {
      setIsLoading(true)
      const [weatherRes, aqiRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,wind_gusts_10m,pressure_msl,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode,uv_index_max,sunrise,sunset&timezone=auto`),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10`)
      ])
      if (weatherRes.ok) {
        const om = await weatherRes.json(); const aqiJson = await aqiRes.json()
        const wd = {
          timezone: om.timezone || 'UTC',
          current: { temperature_2m: om.current_weather?.temperature ?? null, weather_code: om.current_weather?.weathercode ?? 0, wind_speed_10m: om.current_weather?.windspeed ?? 0, wind_direction_10m: om.current_weather?.winddirection ?? 0, relative_humidity_2m: om.hourly?.relative_humidity_2m?.[0] ?? 50, pressure_msl: om.hourly?.pressure_msl?.[0] ?? null, visibility: null, uv_index: om.daily?.uv_index_max?.[0] ?? 0 },
          hourly: { time: om.hourly?.time ?? [], temperature_2m: om.hourly?.temperature_2m ?? [], weather_code: om.hourly?.weathercode ?? [], precipitation_probability: om.hourly?.precipitation_probability ?? [], precipitation: om.hourly?.precipitation ?? [], apparent_temperature: om.hourly?.apparent_temperature ?? [], wind_gusts_10m: om.hourly?.wind_gusts_10m ?? [], pressure_msl: om.hourly?.pressure_msl ?? [], relative_humidity_2m: om.hourly?.relative_humidity_2m ?? [] },
          daily: { time: om.daily?.time ?? [], temperature_2m_max: om.daily?.temperature_2m_max ?? [], temperature_2m_min: om.daily?.temperature_2m_min ?? [], weather_code: om.daily?.weathercode ?? [], uv_index_max: om.daily?.uv_index_max ?? [], sunrise: om.daily?.sunrise ?? [], sunset: om.daily?.sunset ?? [] }
        }
        setWeather(wd); setAqi(aqiJson.current); calculateTodayStats(wd.hourly, wd.daily)
      }
      setIsLoading(false)
    } catch (err) { console.error(err); showToast('Weather failed'); setIsLoading(false) }
  }

  const saveQuote = (quote) => {
    if (!quote) return
    const saved = JSON.parse(localStorage.getItem('zephye_saved_quotes') || '[]')
    saved.unshift({ id: Date.now(), quote_text: quote.content || quote.text, quote_author: quote.author || 'Unknown', category: quote.tag || 'Motivational', created_at: new Date().toISOString() })
    localStorage.setItem('zephye_saved_quotes', JSON.stringify(saved)); showToast('Quote saved')
  }

  const saveFact = (fact) => {
    if (!fact) return
    const saved = JSON.parse(localStorage.getItem('zephye_saved_facts') || '[]')
    saved.unshift({ id: Date.now(), fact_text: fact.text, created_at: new Date().toISOString() })
    localStorage.setItem('zephye_saved_facts', JSON.stringify(saved)); showToast('Fact saved')
  }

  const shareQuote = async (text, author) => {
    const st = `"${text}" - ${author}\n\nvia Zephye`
    if (navigator.share) { try { await navigator.share({ text: st }) } catch {} } else { navigator.clipboard.writeText(st); showToast('Copied') }
  }

  const getWeatherClass = (c) => c === 0 || c === 1 ? 'sunny' : c >= 95 ? 'thunder' : c >= 51 && c <= 82 ? 'rainy' : 'cloudy'
  const getWeatherIconFallback = (c) => c === 0 ? '☀️' : c === 1 ? '🌤️' : c === 2 ? '⛅' : c === 3 ? '☁️' : c >= 95 ? '⛈️' : c >= 51 ? '🌧️' : '☁️'
  const getStormLevel = (c, w) => c >= 95 ? { level: 'Severe Thunderstorm', color: '#dc2626' } : c >= 65 || w > 50 ? { level: 'Heavy Storm', color: '#f97316' } : c >= 61 || w > 30 ? { level: 'Moderate Rain', color: '#eab308' } : c >= 51 ? { level: 'Light Rain', color: '#22c55e' } : null
  const getAqiLevel = (a) => a == null ? { label: 'Unknown', color: '#6b7280' } : a <= 50 ? { label: 'Good', color: '#22c55e' } : a <= 100 ? { label: 'Moderate', color: '#eab308' } : a <= 150 ? { label: 'Unhealthy', color: '#f97316' } : { label: 'Hazardous', color: '#ef4444' }
  const getWindDirection = (d) => d >= 337.5 || d < 22.5 ? 'N' : d < 67.5 ? 'NE' : d < 112.5 ? 'E' : d < 157.5 ? 'SE' : d < 202.5 ? 'S' : d < 247.5 ? 'SW' : d < 292.5 ? 'W' : 'NW'

  const wc = weather?.current?.weather_code ?? 0
  const ws = weather?.current?.wind_speed_10m ?? 0
  const wd = weather?.current?.wind_direction_10m ?? 0
  const hum = weather?.current?.relative_humidity_2m ?? 50
  const pres = weather?.current?.pressure_msl ?? 0
  const vis = weather?.current?.visibility ?? 0
  const uv = weather?.current?.uv_index ?? weather?.daily?.uv_index_max?.[0] ?? 0
  const aqiInfo = getAqiLevel(aqi?.us_aqi)
  const stormInfo = getStormLevel(wc, ws)

  if (isLoading && !weather) return (
    <div className="app">
      <div className="weather-bg cloudy"></div>
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>
        <div className="glass loading-container" style={{padding:'40px',borderRadius:'20px',textAlign:'center'}}>
          <div className="loading-spinner">
            <SunIcon size={64} />
          </div>
          <p className="text-xl font-bold" style={{marginTop:'16px'}}>Loading Zephye...</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="app">
      <div className={`weather-bg ${getWeatherClass(wc)}`}></div>
      {toast && <div className="toast">{toast}</div>}
      
      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="glass modal" onClick={e => e.stopPropagation()} style={{padding:'24px'}}>
            <h3 className="font-bold mb-4">Change Location</h3>
            <input type="text" placeholder="Type any city, LGA, country..." value={citySearch} onChange={e => setCitySearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchCity()} className="mb-4 w-full" autoFocus />
            <p className="text-xs text-muted mb-3">Type "London", "Ifo LGA", "Tokyo" - any real place</p>
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={searchCity}>Search</button>
              <button className="btn-ghost text-xs" onClick={() => { setShowLocationModal(false); setCitySearch('') }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSavedPanel && (
        <div className="modal-overlay" onClick={() => setShowSavedPanel(false)}>
          <div className="glass modal" onClick={e => e.stopPropagation()} style={{padding:'24px',maxWidth:'480px',width:'90%',maxHeight:'80vh',overflow:'auto'}}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">My Locations</h3>
              <button onClick={() => setShowSavedPanel(false)} className="btn-ghost" style={{fontSize:'24px',lineHeight:1}}>&times;</button>
            </div>
            <div className="current-location-card">
              <div>
                <p className="loc-label">CURRENT LOCATION</p>
                <p className="loc-name">{location.name}</p>
                <p className="loc-coords">{location.lat.toFixed(2)}, {location.lon.toFixed(2)}</p>
              </div>
              <button className="save-btn" onClick={saveCurrentLocation}>
                <AddIcon /> Save
              </button>
            </div>
            {savedLocations.length === 0 ? (
              <div className="text-center py-8"><p className="text-muted mb-3">No saved locations yet</p><button onClick={addNewLocation} className="btn-primary">Add Location</button></div>
            ) : (
              <div className="saved-locations-list">
                {savedLocations.map(loc => (
                  <div key={loc.id} className={`saved-location-item ${editingLocId === loc.id ? 'editing' : ''}`}>
                    {editingLocId === loc.id ? (
                      <div className="saved-location-edit">
                        <input type="text" value={editLabel} onChange={e => setEditLabel(e.target.value)} onBlur={() => updateLocationLabel(loc.id, editLabel)} placeholder="Home, Work, etc..." autoFocus />
                        <div className="flex gap-2 mt-2">
                          <input type="text" value={editCity} onChange={e => { setEditCity(e.target.value); searchPlaceForLocation(e.target.value) }} placeholder="Search city..." className="flex-1" />
                        </div>
                        {isSearching && <p className="text-xs text-muted">Searching...</p>}
                        {searchResults.length > 0 && (
                          <div className="search-results-dropdown">
                            {searchResults.map(place => (
                              <button key={place.id} onClick={() => selectPlaceForLocation(loc.id, place)} className="search-result-item">
                                {place.name}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="edit-actions">
                          <button className="save-btn" onClick={saveLocationEdits}>Done</button>
                          <button className="cancel-btn" onClick={() => deleteLocation(loc.id)}>Delete</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => switchToSavedLocation(loc)} className="loc-info">
                          <p className="loc-label">{loc.label || 'Untitled Location'}</p>
                          <p className="loc-name">{loc.name}</p>
                        </button>
                        <div className="loc-actions">
                          <button onClick={() => { setEditingLocId(loc.id); setEditLabel(loc.label || ''); setEditCity(''); setSearchResults([]) }}><EditIcon /></button>
                          <button className="delete-btn" onClick={() => deleteLocation(loc.id)}><DeleteIcon /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            {savedLocations.length > 0 && !editingLocId && (
              <button onClick={addNewLocation} className="add-location-btn">
                <AddIcon /> Add Another Location
              </button>
            )}
          </div>
        </div>
      )}

      <ZephyeFullScreen isOpen={tab === 'ai'} onClose={() => setTab('weather')} weather={weather} location={location} todayStats={todayStats} aqi={aqi} userName={localStorage.getItem('weatherman_name')} lang={getLang(location?.country_code)} greeting="Hey" voiceToUse={voiceToUse} />
      
      <div className="container">
        {tab === 'weather' && (<>
          <div className="glass main-weather-card">
            <div className="weather-header">
              <button className="location-btn" onClick={() => setShowLocationModal(true)}>
                <div className="location-label"><LocationIcon /> Location</div>
                <div className="location-name">{location.name}</div>
                <div className="location-date">{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div>
              </button>
              <div className="weather-temp-display">
                <WeatherIcon code={wc} />
                <h1 className="temp-main">{weather?.current ? Math.round(weather.current.temperature_2m) : '--'}°</h1>
              </div>
            </div>
            <div className="location-actions">
              <button onClick={() => setShowSavedPanel(true)} className="action-btn">
                <LocationIcon /> {savedLocations.length > 0 ? `${savedLocations.length} saved` : 'My Places'}
              </button>
              {previousLocation && (
                <button onClick={goBackToOriginalLocation} className="action-btn back-btn">
                  <BackIcon /> Back to my location
                </button>
              )}
              {savedLocations.slice(0, 3).map(loc => (
                <button key={loc.id} onClick={() => switchToSavedLocation(loc)} className="action-btn saved-loc-btn" title={loc.name}>
                  {loc.label || 'Untitled'}
                </button>
              ))}
            </div>
            <div className="status-badges">
              {stormInfo && <div className="status-badge" style={{background:stormInfo.color+'33',borderColor:stormInfo.color,color:stormInfo.color}}>{stormInfo.level}</div>}
              {aqiInfo && (
                <div className="status-badge-wrapper">
                  <button className="status-badge" style={{background:aqiInfo.color+'33',borderColor:aqiInfo.color,color:aqiInfo.color}} onClick={() => setShowAirDropdown(!showAirDropdown)}>
                    Air: {aqiInfo.label} ▼
                  </button>
                  {showAirDropdown && (
                    <div className="glass air-dropdown">
                      <p className="font-bold mb-3">Weather Details</p>
                      <div className="air-detail"><span className="text-muted">AQI</span><span style={{color:aqiInfo.color}}>{aqi?.us_aqi??'--'}</span></div>
                      <div className="air-detail"><span className="text-muted">Wind</span><span>{Math.round(ws)} km/h {getWindDirection(wd)}</span></div>
                      <div className="air-detail"><span className="text-muted">Humidity</span><span>{hum}%</span></div>
                      <div className="air-detail"><span className="text-muted">Pressure</span><span>{pres} hPa</span></div>
                      <div className="air-detail"><span className="text-muted">Visibility</span><span>{(vis/1000).toFixed(1)} km</span></div>
                      <div className="air-detail"><span className="text-muted">UV Index</span><span>{uv}</span></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <WeatherManTab weather={weather} location={location} todayStats={todayStats} aqi={aqi} onRefresh={() => fetchWeatherData(location.lat, location.lon)} />
          
          <div className="glass hourly-section">
            <div className="hourly-header">
              <p className="section-title">Hourly Forecast</p>
              <button className="view-all-btn" onClick={() => setShowHourlyModal(true)}>
                View All →
              </button>
            </div>
            <div className="hourly-scroll">
              {weather?.hourly?.time?.slice(0,12).map((time, i) => (
                <div 
                  key={time} 
                  className="hourly-card"
                  onClick={() => setShowHourlyModal(true)}
                >
                  <p className="hourly-time-label">{new Date(time).toLocaleTimeString('en-US',{hour:'numeric',hour12:true})}</p>
                  <div className="hourly-icon-small">
                    {getWeatherSvgIcon(weather.hourly.weather_code?.[i] || 0, 32)}
                  </div>
                  <p className="hourly-temp-label">{Math.round(weather.hourly.temperature_2m?.[i] || 0)}°</p>
                  {weather.hourly.precipitation_probability?.[i] > 20 && (
                    <p className="hourly-precip">{Math.round(weather.hourly.precipitation_probability[i])}%</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass forecast-section">
            <p className="section-title">7-Day Forecast</p>
            {weather?.daily?.time?.slice(0,7).map((day, i) => (
              <div key={day} className="forecast-day">
                <span className="forecast-day-name">{new Date(day).toLocaleDateString('en',{weekday:'short'})}</span>
                <div className="forecast-icon">{getWeatherSvgIcon(weather.daily.weather_code[i], 32)}</div>
                <div className="forecast-temps">
                  <span className="forecast-high">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
                  <span className="forecast-low">{Math.round(weather.daily.temperature_2m_min[i])}°</span>
                </div>
              </div>
            ))}
          </div>
        </>)}
        
        {tab === 'map' && (
          <MapTab 
            weather={weather} 
            location={location} 
            aqi={aqi} 
          />
        )}
        
        {tab === 'quotes' && <QuotesTab saveQuote={saveQuote} shareQuote={shareQuote} saveFact={saveFact} quoteOfDay={quoteOfDay} />}
        {tab === 'saved' && <SavedTab showToast={showToast} shareQuote={shareQuote} />}
        <div className="footer-credit"><p>hyesent.dev</p></div>
      </div>
      
      <div className="bottom-nav">
        <button className={`nav-btn ${tab==='weather'?'active':''}`} onClick={()=>setTab('weather')}>
          <span className="nav-icon">⛅</span>
          <span>Weather</span>
        </button>
        <button className={`nav-btn ${tab==='map'?'active':''}`} onClick={()=>setTab('map')}>
          <span className="nav-icon">🗺️</span>
          <span>Map</span>
        </button>
        <button className={`nav-btn ${tab==='quotes'?'active':''}`} onClick={()=>setTab('quotes')}>
          <span className="nav-icon">💬</span>
          <span>Quotes</span>
        </button>
        <button className={`nav-btn ${tab==='saved'?'active':''}`} onClick={()=>setTab('saved')}>
          <span className="nav-icon">⭐</span>
          <span>Saved</span>
        </button>
        <button className={`nav-btn ${tab==='ai'?'active':''}`} onClick={()=>setTab('ai')}>
          <span className="nav-icon">🤖</span>
          <span>AI</span>
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

// ============================================================================
// QUOTES TAB
// ============================================================================

function QuotesTab({ saveQuote, shareQuote, saveFact, quoteOfDay }) {
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
    if (Date.now() - lastFetch < 5000) return; setLastFetch(Date.now()); setLoading(true)
    let pool = quoteCategory === 'All' ? getAllQuotesPool() : (QUOTES[quoteCategory]?.map(q => ({...q, tag: quoteCategory})) || [])
    setCurrentQuote(pool[Math.floor(Math.random() * pool.length)]); setLoading(false)
  }
  const fetchFact = async () => {
    setLoading(true)
    try { const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en'); if (!res.ok) throw new Error(); setCurrentFact({ text: (await res.json()).text }) }
    catch { try { const res2 = await fetch('https://numbersapi.com/random/trivia?json'); if (!res2.ok) throw new Error(); setCurrentFact({ text: (await res2.json()).text }) } catch { let pool = factCategory === 'All' ? Object.values(LOCAL_FACTS).flat() : (LOCAL_FACTS[factCategory] || LOCAL_FACTS.Science); setCurrentFact(pool[Math.floor(Math.random() * pool.length)]) } }
    setLoading(false)
  }
  return (<>
    {quoteOfDay && (<div className="glass quote-of-day"><div className="quote-header"><span className="quote-star">🌟</span> Quote of the Day</div><p className="quote-text">{quoteOfDay.content}</p><p className="quote-author">-- {quoteOfDay.author}</p><div className="quote-actions"><button className="btn-share" onClick={() => shareQuote(quoteOfDay.content, quoteOfDay.author)}>Share</button><button className="btn-ghost" onClick={() => saveQuote(quoteOfDay)}>Save</button></div></div>)}
    <div className="glass quotes-section"><div className="quotes-header"><p className="section-title">Explore Quotes</p><button className="btn-primary" onClick={fetchQuote} disabled={loading}>{loading?'Loading...':'New Quote'}</button></div><div className="sub-tabs">{QUOTE_CATEGORIES.map(cat => <button key={cat} className={`sub-tab ${quoteCategory===cat?'active':''}`} onClick={()=>setQuoteCategory(cat)}>{cat}</button>)}</div>{currentQuote && <div className="quote-item"><p className="quote-text">{currentQuote.content}</p><p className="quote-author">-- {currentQuote.author}</p><div className="quote-actions"><button className="btn-share" onClick={() => shareQuote(currentQuote.content, currentQuote.author)}>Share</button><button className="btn-ghost" onClick={() => saveQuote(currentQuote)}>Save</button></div></div>}</div>
    <div className="glass facts-section"><div className="facts-header"><p className="section-title">Did You Know?</p><button className="btn-primary" onClick={fetchFact} disabled={loading}>{loading?'Loading...':'New Fact'}</button></div><div className="sub-tabs">{FACT_CATEGORIES.map(cat => <button key={cat} className={`sub-tab ${factCategory===cat?'active':''}`} onClick={()=>setFactCategory(cat)}>{cat}</button>)}</div>{currentFact && <div className="fact-item"><p className="fact-text">{currentFact.text}</p><div className="fact-actions"><button className="btn-share" onClick={() => shareQuote(currentFact.text, 'Fact')}>Share</button><button className="btn-ghost" onClick={() => saveFact(currentFact)}>Save</button></div></div>}</div>
  </>)
}

// ============================================================================
// SAVED TAB
// ============================================================================

function SavedTab({ showToast, shareQuote }) {
  const [savedQuotes, setSavedQuotes] = useState([])
  const [savedFacts, setSavedFacts] = useState([])
  const [activeSubTab, setActiveSubTab] = useState('quotes')
  useEffect(() => { setSavedQuotes(JSON.parse(localStorage.getItem('zephye_saved_quotes')||'[]')); setSavedFacts(JSON.parse(localStorage.getItem('zephye_saved_facts')||'[]')) }, [])
  const deleteQuote = (id) => { const u = savedQuotes.filter(q => q.id!==id); localStorage.setItem('zephye_saved_quotes',JSON.stringify(u)); setSavedQuotes(u); showToast('Quote deleted') }
  const deleteFact = (id) => { const u = savedFacts.filter(f => f.id!==id); localStorage.setItem('zephye_saved_facts',JSON.stringify(u)); setSavedFacts(u); showToast('Fact deleted') }
  return (<div className="glass saved-tab"><div className="sub-tabs"><button className={`sub-tab ${activeSubTab==='quotes'?'active':''}`} onClick={()=>setActiveSubTab('quotes')}>Quotes ({savedQuotes.length})</button><button className={`sub-tab ${activeSubTab==='facts'?'active':''}`} onClick={()=>setActiveSubTab('facts')}>Facts ({savedFacts.length})</button></div>{activeSubTab==='quotes'&&(savedQuotes.length===0?<p className="empty-state">No saved quotes yet.</p>:savedQuotes.map(q=>(<div key={q.id} className="saved-item"><p className="saved-text">{q.quote_text}</p><p className="saved-author">-- {q.quote_author}</p><div className="saved-actions"><button className="btn-share" onClick={()=>shareQuote(q.quote_text,q.quote_author)}>Share</button><button className="btn-ghost" onClick={()=>deleteQuote(q.id)}>Delete</button></div></div>)))}{activeSubTab==='facts'&&(savedFacts.length===0?<p className="empty-state">No saved facts yet.</p>:savedFacts.map(f=>(<div key={f.id} className="saved-item"><p className="saved-text">{f.fact_text}</p><div className="saved-actions"><button className="btn-share" onClick={()=>shareQuote(f.fact_text,'Fact')}>Share</button><button className="btn-ghost" onClick={()=>deleteFact(f.id)}>Delete</button></div></div>)))}</div>)
}

// ============================================================================
// APP EXPORT
// ============================================================================

export default function App() { return (<AudioProvider><AppContent /></AudioProvider>) }
