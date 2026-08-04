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

// ============================================================================
// MAP MODAL — Shows when user switches to Map tab
// ============================================================================

function MapModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass"
        onClick={e => e.stopPropagation()}
        style={{
          padding: '28px 24px 24px',
          maxWidth: '420px',
          width: '90%',
          borderRadius: '20px',
          background: 'rgba(15,23,42,0.94)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 16px 64px rgba(0,0,0,0.6)',
          position: 'relative',
          textAlign: 'center'
        }}
      >
        {/* Close button (X) */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '6px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
          }}
        >
          <CloseIcon />
        </button>

        {/* Icon */}
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗺️</div>

        {/* Title */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#f8fafc',
          marginBottom: '6px'
        }}>
          Map Features
        </h3>

        {/* Status Badge */}
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '600',
          background: 'rgba(56,189,248,0.15)',
          color: '#7dd3fc',
          border: '1px solid rgba(56,189,248,0.2)',
          marginBottom: '14px'
        }}>
          ⚡ Undergoing Upgrade
        </div>

        {/* Description */}
        <p style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.5)',
          lineHeight: '1.6',
          marginBottom: '16px'
        }}>
          Some map features are being enhanced. Core functionality is still available.
        </p>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'rgba(255,255,255,0.06)',
          marginBottom: '14px'
        }} />

        {/* Gesture Helpers */}
        <div style={{
          textAlign: 'left',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.4)'
        }}>
          <p style={{ fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
            📌 How to use:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>👆</span>
              <span>Single tap — <span style={{ color: 'rgba(255,255,255,0.5)' }}>Weather data</span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>👆👆</span>
              <span>Double tap — <span style={{ color: 'rgba(255,255,255,0.5)' }}>Pollen data</span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>👆⏱️</span>
              <span>Long press / Right click — <span style={{ color: 'rgba(255,255,255,0.5)' }}>Route calculation</span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🚦</span>
              <span>Traffic tab — <span style={{ color: 'rgba(255,255,255,0.5)' }}>Live traffic + incidents</span></span>
            </div>
          </div>
        </div>

        {/* OK Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(56,189,248,0.15)',
            color: '#7dd3fc',
            fontWeight: '600',
            fontSize: '14px',
            border: '1px solid rgba(56,189,248,0.2)',
            cursor: 'pointer',
            marginTop: '16px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(56,189,248,0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(56,189,248,0.15)'
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}

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

function WeatherIcon({ code }) {
  if (code === 0 || code === 1) return <div className="weather-icon sunny-icon"><div className="sun">☀️</div><div className="sun-rays"></div></div>
  if (code >= 95) return <div className="weather-icon storm-icon"><div className="cloud">⛈️</div><div className="lightning">⚡</div><div className="rain-drop rain-1"></div><div className="rain-drop rain-2"></div><div className="rain-drop rain-3"></div></div>
  if (code >= 51 && code <= 82) return <div className="weather-icon rainy-icon"><div className="cloud">🌧️</div><div className="rain-drop rain-1"></div><div className="rain-drop rain-2"></div><div className="rain-drop rain-3"></div><div className="rain-drop rain-4"></div></div>
  if (code === 2) return <div className="weather-icon">🌤️</div>
  if (code === 3) return <div className="weather-icon">☁️</div>
  return <div className="weather-icon">⛅</div>
}

// ============================================================================
// HOURLY MODAL — PROPERLY DESIGNED
// ============================================================================

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
      <div
        className="glass"
        onClick={e => e.stopPropagation()}
        style={{
          padding: '24px',
          maxWidth: '640px',
          width: '95%',
          maxHeight: '85vh',
          overflow: 'auto',
          borderRadius: '20px',
          background: 'rgba(15,23,42,0.92)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
          paddingBottom: '14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#f8fafc',
              marginBottom: '2px'
            }}>
              Hourly Forecast
            </h3>
            <p style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.4)'
            }}>
              {locationName || 'Your location'} •{' '}
              {new Date(hourlyData.time[0]).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Hourly List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {hourlyData.time.slice(0, 24).map((time, i) => {
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
              <div
                key={time}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  background: isCurrentHour
                    ? 'rgba(56,189,248,0.08)'
                    : 'rgba(255,255,255,0.02)',
                  border: isCurrentHour
                    ? '1px solid rgba(56,189,248,0.15)'
                    : '1px solid rgba(255,255,255,0.04)',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
              >
                {/* Time */}
                <div style={{ minWidth: '65px' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: isCurrentHour ? '700' : '500',
                    color: isCurrentHour ? '#7dd3fc' : '#f8fafc'
                  }}>
                    {new Date(time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      hour12: true
                    })}
                  </div>
                  {isCurrentHour && (
                    <div style={{
                      fontSize: '8px',
                      color: 'rgba(56,189,248,0.5)',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Now
                    </div>
                  )}
                </div>

                {/* Icon */}
                <div style={{ fontSize: '24px', minWidth: '36px', textAlign: 'center' }}>
                  {getIcon(code)}
                </div>

                {/* Temp */}
                <div style={{ minWidth: '48px', textAlign: 'center' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#f8fafc'
                  }}>
                    {Math.round(temp)}°
                  </div>
                  {feelsLike && Math.round(feelsLike) !== Math.round(temp) && (
                    <div style={{
                      fontSize: '9px',
                      color: 'rgba(255,255,255,0.3)'
                    }}>
                      feels {Math.round(feelsLike)}°
                    </div>
                  )}
                </div>

                {/* Condition */}
                <div style={{
                  flex: 1,
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.6)',
                  minWidth: '70px',
                  textAlign: 'left'
                }}>
                  {getConditionName(code)}
                </div>

                {/* Details */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.4)',
                  justifyContent: 'flex-end',
                  minWidth: '100px'
                }}>
                  {precip > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      🌧️ {Math.round(precip)}%
                    </span>
                  )}
                  {rain > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      💧 {Math.round(rain * 10) / 10}mm
                    </span>
                  )}
                  {wind > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      💨 {Math.round(wind)} km/h
                    </span>
                  )}
                  {gust > 15 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#fbbf24' }}>
                      ⚡{Math.round(gust)}
                    </span>
                  )}
                  {humidity > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      💧 {Math.round(humidity)}%
                    </span>
                  )}
                  {pressure > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      📊 {Math.round(pressure)} hPa
                    </span>
                  )}
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
// APP CONTENT
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
  const [showMapModal, setShowMapModal] = useState(false)

  // ─── Show map modal when tab switches to 'map' ──────────────────────────

  useEffect(() => {
    if (tab === 'map') {
      // Check if user has seen the map modal before
      const hasSeenMapModal = localStorage.getItem('zephye_seen_map_modal')
      if (!hasSeenMapModal) {
        setShowMapModal(true)
        localStorage.setItem('zephye_seen_map_modal', 'true')
      }
    }
  }, [tab])

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
  const getWeatherIcon = (c) => c === 0 ? '☀️' : c === 1 ? '🌤️' : c === 2 ? '⛅' : c === 3 ? '☁️' : c >= 95 ? '⛈️' : c >= 51 ? '🌧️' : '☁️'
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
    <div className="app"><div className="weather-bg cloudy"></div><div className="container" style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div className="glass" style={{padding:'40px',borderRadius:'20px',textAlign:'center'}}><div className="text-4xl mb-4">🌤️</div><p className="text-xl font-bold">Loading Zephye...</p></div></div></div>
  )

  return (
    <div className="app">
      <div className={`weather-bg ${getWeatherClass(wc)}`}></div>
      {toast && <div className="toast">{toast}</div>}
      
      {/* ─── Map Modal ────────────────────────────────────────────────────── */}
      <MapModal 
        isOpen={showMapModal} 
        onClose={() => setShowMapModal(false)} 
      />

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
            <div className="mb-4 p-3 rounded-xl" style={{background:'rgba(56,189,248,0.08)',border:'1px solid rgba(56,189,248,0.2)'}}>
              <div className="flex justify-between items-center">
                <div><p className="text-xs text-muted font-medium mb-1">CURRENT LOCATION</p><p className="font-bold text-sm">{location.name}</p><p className="text-xs text-muted">{location.lat.toFixed(2)}, {location.lon.toFixed(2)}</p></div>
                <button className="btn-primary text-xs flex items-center gap-1" onClick={saveCurrentLocation}><AddIcon />Save</button>
              </div>
            </div>
            {savedLocations.length === 0 ? (
              <div className="text-center py-8"><p className="text-muted mb-3">No saved locations yet</p><button onClick={addNewLocation} className="btn-primary">Add Location</button></div>
            ) : (
              <div className="space-y-2">
                {savedLocations.map(loc => (
                  <div key={loc.id} className="p-3 rounded-xl" style={{background: editingLocId === loc.id ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.03)', border: editingLocId === loc.id ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent'}}>
                    {editingLocId === loc.id ? (
                      <div className="space-y-3">
                        <div><label className="text-xs text-muted block mb-1">Name</label><input type="text" value={editLabel} onChange={e => setEditLabel(e.target.value)} onBlur={() => updateLocationLabel(loc.id, editLabel)} placeholder="Home, Work, etc..." className="w-full text-sm" autoFocus /></div>
                        <div><label className="text-xs text-muted block mb-1">Search place</label><div className="flex gap-2"><input type="text" value={editCity} onChange={e => { setEditCity(e.target.value); searchPlaceForLocation(e.target.value) }} placeholder="Search city..." className="text-sm flex-1" /></div>
                          {isSearching && <p className="text-xs text-muted">Searching...</p>}
                          {searchResults.length > 0 && (<div className="mt-2 max-h-28 overflow-y-auto space-y-1 rounded-lg" style={{background:'rgba(0,0,0,0.3)'}}>{searchResults.map(place => (<button key={place.id} onClick={() => selectPlaceForLocation(loc.id, place)} className="w-full text-left p-2 text-xs hover:bg-white/10" style={{color:'var(--text)'}}>{place.name}</button>))}</div>)}
                        </div>
                        <div className="text-xs text-muted">{loc.lat.toFixed(2)}, {loc.lon.toFixed(2)}</div>
                        <div className="flex gap-2"><button onClick={() => saveLocationEdits(loc.id)} className="btn-primary text-xs flex-1">Done</button><button onClick={() => deleteLocation(loc.id)} className="btn-ghost text-xs" style={{color:'#ef4444'}}><DeleteIcon /></button></div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <button onClick={() => switchToSavedLocation(loc)} className="text-left flex-1 hover:opacity-80"><p className="font-bold text-sm">{loc.label || 'Untitled Location'}</p><p className="text-xs text-muted mt-1">{loc.name}</p></button>
                        <button onClick={() => { setEditingLocId(loc.id); setEditLabel(loc.label || ''); setEditCity(''); setSearchResults([]) }} className="btn-ghost" title="Edit"><EditIcon /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {savedLocations.length > 0 && !editingLocId && (
              <button onClick={addNewLocation} className="w-full mt-4 p-2 rounded-xl text-sm text-muted hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2" style={{border:'1px dashed rgba(255,255,255,0.15)'}}><AddIcon />Add Another Location</button>
            )}
          </div>
        </div>
      )}

      <ZephyeFullScreen isOpen={tab === 'ai'} onClose={() => setTab('weather')} weather={weather} location={location} todayStats={todayStats} aqi={aqi} userName={localStorage.getItem('weatherman_name')} lang={getLang(location?.country_code)} greeting="Hey" voiceToUse={voiceToUse} />
      
      <div className="container" style={{display:'flex',flexDirection:'column',gap:'16px'}}>
        {tab === 'weather' && (<>
          <div className="glass" style={{padding:'20px',borderRadius:'20px',position:'relative',zIndex:2}}>
            <div className="flex items-start justify-between mb-4">
              <button className="location-btn text-left" onClick={() => setShowLocationModal(true)}>
                <div className="text-xs text-muted mb-1 flex items-center gap-1"><LocationIcon />Location</div>
                <div className="text-lg font-bold">{location.name}</div>
                <div className="text-xs text-muted mt-1">{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div>
              </button>
              <div className="text-right"><WeatherIcon code={wc} /><h1 className="text-3xl font-bold mt-1">{weather?.current ? Math.round(weather.current.temperature_2m) : '--'}°</h1></div>
            </div>
            <div className="flex gap-2 flex-wrap mb-3">
              <button onClick={() => setShowSavedPanel(true)} className="btn-ghost text-xs flex items-center gap-1" style={{padding:'4px 10px'}}><LocationIcon />{savedLocations.length > 0 ? `${savedLocations.length} saved` : 'My Places'}</button>
              {previousLocation && <button onClick={goBackToOriginalLocation} className="btn-ghost text-xs flex items-center gap-1" style={{padding:'4px 10px',borderColor:'var(--accent)',color:'var(--accent)'}}><BackIcon />Back to my location</button>}
              {savedLocations.slice(0, 3).map(loc => <button key={loc.id} onClick={() => switchToSavedLocation(loc)} className="btn-ghost text-xs" style={{padding:'4px 10px',background:'rgba(255,255,255,0.08)',color:'var(--text)',border:'1px solid var(--glass-border)'}} title={loc.name}>{loc.label || 'Untitled'}</button>)}
            </div>
            <div className="flex gap-2 flex-wrap">
              {stormInfo && <div className="status-badge" style={{background:stormInfo.color+'33',borderColor:stormInfo.color,color:stormInfo.color}}>{stormInfo.level}</div>}
              {aqiInfo && (<div style={{position:'relative'}}>
                <button className="status-badge" style={{background:aqiInfo.color+'33',borderColor:aqiInfo.color,color:aqiInfo.color,cursor:'pointer'}} onClick={() => setShowAirDropdown(!showAirDropdown)}>Air: {aqiInfo.label} ▼</button>
                {showAirDropdown && (<div className="glass" style={{position:'absolute',top:'110%',left:0,minWidth:'300px',padding:'16px',zIndex:999,borderRadius:'16px'}}>
                  <p className="font-bold mb-3">Weather Details</p>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-muted">AQI</span><span className="font-bold" style={{color:aqiInfo.color}}>{aqi?.us_aqi??'--'}</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-muted">Wind</span><span className="font-bold">{Math.round(ws)} km/h {getWindDirection(wd)}</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-muted">Humidity</span><span className="font-bold">{hum}%</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-muted">Pressure</span><span className="font-bold">{pres} hPa</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-muted">Visibility</span><span className="font-bold">{(vis/1000).toFixed(1)} km</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted">UV Index</span><span className="font-bold">{uv}</span></div>
                </div>)}
              </div>)}
            </div>
          </div>
          <WeatherManTab weather={weather} location={location} todayStats={todayStats} aqi={aqi} onRefresh={() => fetchWeatherData(location.lat, location.lon)} />
          
          <div className="glass" style={{padding:'20px',borderRadius:'20px'}}>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-bold">Hourly Forecast</p>
              <button 
                className="btn-ghost text-xs" 
                onClick={() => setShowHourlyModal(true)}
                style={{ padding: '4px 12px' }}
              >
                View All →
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{scrollSnapType:'x mandatory'}}>
              {weather?.hourly?.time?.slice(0,12).map((time, i) => (
                <div 
                  key={time} 
                  className="glass text-center p-3 rounded-2xl flex-shrink-0" 
                  style={{
                    minWidth:'72px',
                    scrollSnapAlign:'start',
                    background:'rgba(255,255,255,0.05)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowHourlyModal(true)}
                >
                  <p className="text-xs text-muted">{new Date(time).toLocaleTimeString('en-US',{hour:'numeric',hour12:true})}</p>
                  <p className="text-2xl my-1">{getWeatherIcon(weather.hourly.weather_code?.[i] || 0)}</p>
                  <p className="text-sm font-bold">{Math.round(weather.hourly.temperature_2m?.[i] || 0)}°</p>
                  {weather.hourly.precipitation_probability?.[i] > 20 && (
                    <p className="text-[10px] text-accent">{Math.round(weather.hourly.precipitation_probability[i])}%</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass" style={{padding:'20px',borderRadius:'20px'}}>
            <p className="text-sm font-bold mb-3">7-Day Forecast</p>
            {weather?.daily?.time?.slice(0,7).map((day, i) => (
              <div key={day} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                <span className="text-sm font-medium">{new Date(day).toLocaleDateString('en',{weekday:'short'})}</span>
                <span className="text-xl">{getWeatherIcon(weather.daily.weather_code[i])}</span>
                <div className="flex gap-3 text-sm"><span className="font-bold">{Math.round(weather.daily.temperature_2m_max[i])}°</span><span className="text-muted">{Math.round(weather.daily.temperature_2m_min[i])}°</span></div>
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
        <div className="text-center mt-4 mb-4"><p className="text-sm text-muted">hyesent.dev</p></div>
      </div>
      
      <div className="bottom-nav">
        <button className={`nav-btn ${tab==='weather'?'active':''}`} onClick={()=>setTab('weather')}>Weather</button>
        <button className={`nav-btn ${tab==='map'?'active':''}`} onClick={()=>setTab('map')}>Map</button>
        <button className={`nav-btn ${tab==='quotes'?'active':''}`} onClick={()=>setTab('quotes')}>Quotes</button>
        <button className={`nav-btn ${tab==='saved'?'active':''}`} onClick={()=>setTab('saved')}>Saved</button>
        <button className={`nav-btn ${tab==='ai'?'active':''}`} onClick={()=>setTab('ai')}>AI</button>
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
    {quoteOfDay && (<div className="glass mb-4" style={{padding:'20px',borderRadius:'20px',border:'2px solid var(--accent)',background:'rgba(56,189,248,0.05)'}}><div className="flex justify-between items-start mb-2"><p className="text-sm font-bold text-accent flex items-center gap-2"><span>🌟</span> Quote of the Day</p></div><p className="text-lg font-bold mb-3">{quoteOfDay.content}</p><p className="text-sm text-muted mb-4">-- {quoteOfDay.author}</p><div className="flex gap-2"><button className="btn-share text-sm" onClick={() => shareQuote(quoteOfDay.content, quoteOfDay.author)}>Share</button><button className="btn-ghost text-sm" onClick={() => saveQuote(quoteOfDay)}>Save</button></div></div>)}
    <div className="glass mb-4" style={{padding:'20px',borderRadius:'20px'}}><div className="flex justify-between items-center mb-4"><p className="font-bold">Explore Quotes</p><button className="btn-primary text-sm" onClick={fetchQuote} disabled={loading}>{loading?'Loading...':'New Quote'}</button></div><div className="sub-tabs mb-4">{QUOTE_CATEGORIES.map(cat => <button key={cat} className={`sub-tab ${quoteCategory===cat?'active':''}`} onClick={()=>setQuoteCategory(cat)}>{cat}</button>)}</div>{currentQuote && <div className="list-item"><p className="font-bold mb-4">{currentQuote.content}</p><p className="text-sm text-muted mb-4">-- {currentQuote.author}</p><div className="flex gap-2"><button className="btn-share text-sm" onClick={() => shareQuote(currentQuote.content, currentQuote.author)}>Share</button><button className="btn-ghost text-sm" onClick={() => saveQuote(currentQuote)}>Save</button></div></div>}</div>
    <div className="glass mb-4" style={{padding:'20px',borderRadius:'20px'}}><div className="flex justify-between items-center mb-4"><p className="font-bold">Did You Know?</p><button className="btn-primary text-sm" onClick={fetchFact} disabled={loading}>{loading?'Loading...':'New Fact'}</button></div><div className="sub-tabs mb-4">{FACT_CATEGORIES.map(cat => <button key={cat} className={`sub-tab ${factCategory===cat?'active':''}`} onClick={()=>setFactCategory(cat)}>{cat}</button>)}</div>{currentFact && <div className="list-item"><p className="font-bold mb-4">{currentFact.text}</p><div className="flex gap-2"><button className="btn-share text-sm" onClick={() => shareQuote(currentFact.text, 'Fact')}>Share</button><button className="btn-ghost text-sm" onClick={() => saveFact(currentFact)}>Save</button></div></div>}</div>
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
  return (<div className="glass" style={{padding:'20px',borderRadius:'20px'}}><div className="sub-tabs mb-4"><button className={`sub-tab ${activeSubTab==='quotes'?'active':''}`} onClick={()=>setActiveSubTab('quotes')}>Quotes ({savedQuotes.length})</button><button className={`sub-tab ${activeSubTab==='facts'?'active':''}`} onClick={()=>setActiveSubTab('facts')}>Facts ({savedFacts.length})</button></div>{activeSubTab==='quotes'&&(savedQuotes.length===0?<p className="text-center text-muted py-8">No saved quotes yet.</p>:savedQuotes.map(q=>(<div key={q.id} className="list-item"><p className="font-bold mb-2">{q.quote_text}</p><p className="text-sm text-muted mb-3">-- {q.quote_author}</p><div className="flex gap-2"><button className="btn-share text-xs" onClick={()=>shareQuote(q.quote_text,q.quote_author)}>Share</button><button className="btn-ghost text-xs" onClick={()=>deleteQuote(q.id)}>Delete</button></div></div>)))}{activeSubTab==='facts'&&(savedFacts.length===0?<p className="text-center text-muted py-8">No saved facts yet.</p>:savedFacts.map(f=>(<div key={f.id} className="list-item"><p className="font-bold mb-3">{f.fact_text}</p><div className="flex gap-2"><button className="btn-share text-xs" onClick={()=>shareQuote(f.fact_text,'Fact')}>Share</button><button className="btn-ghost text-xs" onClick={()=>deleteFact(f.id)}>Delete</button></div></div>)))}</div>)
}

export default function App() { return (<AudioProvider><AppContent /></AudioProvider>) }
