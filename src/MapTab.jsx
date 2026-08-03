import { useState, useEffect, useRef } from 'react'

// ============================================================================
// AVAILABLE COUNTRIES FOR POLLEN/TRAFFIC (Open-Meteo supported)
// ============================================================================

const AVAILABLE_COUNTRIES = [
  { code: 'NG', name: 'Nigeria', lat: 9.082, lon: 8.675, flag: '🇳🇬' },
  { code: 'US', name: 'United States', lat: 37.090, lon: -95.713, flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', lat: 55.378, lon: -3.436, flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', lat: 51.165, lon: 10.451, flag: '🇩🇪' },
  { code: 'FR', name: 'France', lat: 46.603, lon: 1.888, flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', lat: 41.872, lon: 12.567, flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', lat: 40.463, lon: -3.749, flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', lat: 39.399, lon: -8.224, flag: '🇵🇹' },
  { code: 'NL', name: 'Netherlands', lat: 52.133, lon: 5.291, flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', lat: 60.128, lon: 18.643, flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', lat: 60.472, lon: 8.469, flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', lat: 56.264, lon: 9.502, flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', lat: 61.924, lon: 25.748, flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', lat: 51.919, lon: 19.145, flag: '🇵🇱' },
  { code: 'RU', name: 'Russia', lat: 61.524, lon: 105.319, flag: '🇷🇺' },
  { code: 'CN', name: 'China', lat: 35.862, lon: 104.195, flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', lat: 36.205, lon: 138.253, flag: '🇯🇵' },
  { code: 'IN', name: 'India', lat: 20.594, lon: 78.963, flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', lat: -14.235, lon: -51.925, flag: '🇧🇷' },
  { code: 'AU', name: 'Australia', lat: -25.274, lon: 133.775, flag: '🇦🇺' },
  { code: 'ZA', name: 'South Africa', lat: -30.559, lon: 22.938, flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', lat: 26.821, lon: 30.802, flag: '🇪🇬' },
  { code: 'KE', name: 'Kenya', lat: -1.292, lon: 36.822, flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', lat: 7.946, lon: -1.023, flag: '🇬🇭' },
  { code: 'ZA', name: 'South Africa', lat: -30.559, lon: 22.938, flag: '🇿🇦' },
]

export default function MapTab({ weather, location, aqi }) {
  const [mapMode, setMapMode] = useState('traffic')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(
    () => {
      const saved = localStorage.getItem('zephye_map_location')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Verify it's still a valid country
          const exists = AVAILABLE_COUNTRIES.find(c => c.code === parsed.code)
          if (exists) return parsed.code
        } catch {}
      }
      return 'NG'
    }
  )
  const [mapLoaded, setMapLoaded] = useState(false)
  const [pollenData, setPollenData] = useState(null)
  const [weatherMapData, setWeatherMapData] = useState(null)
  
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const overlayRef = useRef(null)

  const country = AVAILABLE_COUNTRIES.find(c => c.code === selectedCountry) || AVAILABLE_COUNTRIES[0]

  // Save map location to localStorage
  useEffect(() => {
    localStorage.setItem('zephye_map_location', JSON.stringify({ code: selectedCountry, name: country.name }))
  }, [selectedCountry, country])

  // Search for countries
  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const q = query.toLowerCase()
    const results = AVAILABLE_COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.code.toLowerCase().includes(q)
    )
    setSearchResults(results)
    setIsSearching(false)
  }

  const selectCountry = (code) => {
    setSelectedCountry(code)
    setSearchQuery('')
    setSearchResults([])
    if (mapRef.current && mapLoaded) {
      const c = AVAILABLE_COUNTRIES.find(c => c.code === code) || AVAILABLE_COUNTRIES[0]
      mapRef.current.setView([c.lat, c.lon], 6)
      applyOverlay(mapRef.current, mapMode, c)
    }
  }

  // Load Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapLoaded) return

    const loadMap = async () => {
      // Check if Leaflet is already loaded
      if (typeof L !== 'undefined') {
        initMap()
        return
      }

      // Load Leaflet CSS and JS
      const css = document.createElement('link')
      css.rel = 'stylesheet'
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(css)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => initMap()
      document.body.appendChild(script)
    }

    loadMap()
  }, [mapContainerRef.current])

  const initMap = () => {
    const map = L.map(mapContainerRef.current, {
      center: [country.lat, country.lon],
      zoom: 6,
      zoomControl: false,
      attributionControl: false
    })

    // Base tile layer (OpenStreetMap - free, no key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map)

    // Add a marker for the selected location
    const marker = L.marker([country.lat, country.lon], {
      title: country.name
    }).addTo(map)
    marker.bindPopup(`<b>${country.flag} ${country.name}</b><br>Map location`)

    mapRef.current = map
    setMapLoaded(true)

    // Apply initial overlay
    applyOverlay(map, mapMode, country)
    
    // Fetch pollen data for this location
    fetchPollenData(country.lat, country.lon)
    fetchWeatherMapData(country.lat, country.lon)
  }

  const fetchPollenData = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=pollen&timezone=auto`
      )
      const data = await res.json()
      setPollenData(data)
    } catch (e) {
      console.error('Pollen fetch failed:', e)
    }
  }

  const fetchWeatherMapData = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
      )
      const data = await res.json()
      setWeatherMapData(data)
    } catch (e) {
      console.error('Weather fetch failed:', e)
    }
  }

  const applyOverlay = (map, mode, country) => {
    if (!map) return

    // Remove existing overlay layers
    map.eachLayer((layer) => {
      if (layer._isOverlay) {
        map.removeLayer(layer)
      }
    })

    if (mode === 'traffic') {
      // Traffic overlay — use TomTom traffic tiles (free tier)
      // Note: TomTom requires a key, but the free tier is 50k/day
      // For no-key option, we use OSM with traffic simulation styling
      
      // Option 1: TomTom (recommended, needs free key)
      // const trafficLayer = L.tileLayer(
      //   'https://api.tomtom.com/traffic/map/4/tile/flow/{z}/{x}/{y}.png?key=YOUR_TOMTOM_KEY',
      //   { opacity: 0.6, attribution: '© TomTom', _isOverlay: true }
      // )
      
      // Option 2: No-key solution — use OSM with a traffic-style overlay (simulated)
      // For MVP, we'll show a semi-transparent OSM layer with traffic-colored markers
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        opacity: 0.3,
        attribution: '© OpenStreetMap',
        _isOverlay: true
      }).addTo(map)

      // Add some simulated traffic markers (in production, use real traffic API)
      const trafficPoints = [
        { lat: country.lat + 0.5, lon: country.lon - 0.3, level: 'heavy' },
        { lat: country.lat - 0.3, lon: country.lon + 0.4, level: 'moderate' },
        { lat: country.lat + 0.1, lon: country.lon - 0.5, level: 'light' },
      ]

      trafficPoints.forEach(p => {
        const color = p.level === 'heavy' ? '#ef4444' : p.level === 'moderate' ? '#eab308' : '#22c55e'
        const circle = L.circle([p.lat, p.lon], {
          radius: 50000,
          color: color,
          fillColor: color,
          fillOpacity: 0.3,
          weight: 2,
          _isOverlay: true
        })
        circle.addTo(map)
        circle.bindPopup(`Traffic: ${p.level}`)
      })

    } else if (mode === 'pollen') {
      // Pollen overlay — use Open-Meteo pollen data
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        opacity: 0.2,
        attribution: '© OpenStreetMap',
        _isOverlay: true
      }).addTo(map)

      if (pollenData?.daily?.pollen) {
        const pollen = pollenData.daily.pollen
        const pollenTypes = ['alder', 'birch', 'grass', 'mugwort', 'ragweed', 'tree']
        
        // Show pollen as colored circles
        pollenTypes.forEach((type, i) => {
          const value = pollen[type]?.[0] || 0
          if (value > 0) {
            const color = value > 5 ? '#ef4444' : value > 3 ? '#eab308' : '#22c55e'
            const radius = 20000 + value * 5000
            const circle = L.circle(
              [country.lat + (i - 2) * 0.2, country.lon + (i % 3 - 1) * 0.3],
              {
                radius: radius,
                color: color,
                fillColor: color,
                fillOpacity: 0.25,
                weight: 1,
                _isOverlay: true
              }
            )
            circle.addTo(map)
            circle.bindPopup(`${type}: ${value}/10`)
          }
        })
      } else {
        // Fallback: show a message on the map
        L.marker([country.lat, country.lon], {
          _isOverlay: true
        }).addTo(map)
        .bindPopup('Pollen data loading...')
      }

    } else if (mode === 'weather') {
      // Weather overlay — show current weather animation
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        opacity: 0.2,
        attribution: '© OpenStreetMap',
        _isOverlay: true
      }).addTo(map)

      const currentWeather = weatherMapData?.current_weather
      if (currentWeather) {
        const code = currentWeather.weather_code || 0
        const temp = currentWeather.temperature || 0
        const emoji = getWeatherEmoji(code)
        
        // Create a custom div icon with weather emoji
        const icon = L.divIcon({
          className: 'weather-map-icon',
          html: `<div style="font-size: 48px; text-align: center; filter: drop-shadow(0 0 20px rgba(56,189,248,0.3));">${emoji}</div>`,
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        })
        
        const marker = L.marker([country.lat, country.lon], { icon, _isOverlay: true })
        marker.addTo(map)
        marker.bindPopup(`<b>${country.flag} ${country.name}</b><br>${emoji} ${temp}°C`)
        
        // Add temperature label
        const tempIcon = L.divIcon({
          className: 'temp-label',
          html: `<div style="font-size: 16px; font-weight: bold; color: #f8fafc; text-shadow: 0 0 10px rgba(0,0,0,0.8); background: rgba(0,0,0,0.4); padding: 4px 12px; border-radius: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);">${Math.round(temp)}°C</div>`,
          iconSize: [60, 32],
          iconAnchor: [30, 50]
        })
        
        const tempMarker = L.marker([country.lat + 0.25, country.lon], { icon: tempIcon, _isOverlay: true })
        tempMarker.addTo(map)
      }
    }
  }

  const getWeatherEmoji = (code) => {
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

  // Handle mode switch
  const handleModeSwitch = (mode) => {
    setMapMode(mode)
    if (mapRef.current && mapLoaded) {
      const c = AVAILABLE_COUNTRIES.find(c => c.code === selectedCountry) || AVAILABLE_COUNTRIES[0]
      applyOverlay(mapRef.current, mode, c)
    }
  }

  return (
    <div className="map-tab-container">
      {/* Header */}
      <div className="map-header">
        <div className="map-capsule-switch">
          <button
            className={`capsule-btn ${mapMode === 'traffic' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('traffic')}
          >
            🚦 Traffic
          </button>
          <button
            className={`capsule-btn ${mapMode === 'pollen' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('pollen')}
          >
            🌿 Pollen
          </button>
          <button
            className={`capsule-btn ${mapMode === 'weather' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('weather')}
          >
            ⛅ Weather
          </button>
        </div>

        <div className="map-search-area">
          <div className="map-search-wrapper">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                handleSearch(e.target.value)
              }}
              placeholder="Search country..."
              className="map-search-input"
            />
            {isSearching && <span className="search-spinner">⏳</span>}
          </div>
          {searchResults.length > 0 && (
            <div className="map-search-results">
              {searchResults.map(c => (
                <button
                  key={c.code}
                  onClick={() => selectCountry(c.code)}
                  className="search-result-item"
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                  <span className="result-code">{c.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="map-wrapper" ref={mapContainerRef}>
        {!mapLoaded && (
          <div className="map-loading">
            <span>🗺️</span>
            <p>Loading map...</p>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="map-legend">
        {mapMode === 'traffic' && (
          <>
            <span><span className="legend-dot heavy"></span> Heavy</span>
            <span><span className="legend-dot moderate"></span> Moderate</span>
            <span><span className="legend-dot light"></span> Light</span>
          </>
        )}
        {mapMode === 'pollen' && (
          <>
            <span><span className="legend-dot high"></span> High</span>
            <span><span className="legend-dot medium"></span> Medium</span>
            <span><span className="legend-dot low"></span> Low</span>
          </>
        )}
        {mapMode === 'weather' && (
          <span>📍 {country.flag} {country.name}</span>
        )}
      </div>
    </div>
  )
}
