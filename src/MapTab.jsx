import { useState, useEffect, useRef } from 'react'

// ============================================================================
// AVAILABLE COUNTRIES FOR POLLEN/TRAFFIC
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
  { code: 'GH', name: 'Ghana', lat: 7.946, lon: -1.023, flag: '🇬🇭' }
]

// ============================================================================
// MAP TAB COMPONENT
// ============================================================================

export default function MapTab({ weather, location, aqi }) {
  // ========================================================================
  // STATE
  // ========================================================================

  const [mapMode, setMapMode] = useState('traffic')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapData, setMapData] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const saved = localStorage.getItem('zephye_map_location')

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const exists = AVAILABLE_COUNTRIES.find(c => c.code === parsed.code)

        if (exists) return parsed
      } catch {}
    }

    return AVAILABLE_COUNTRIES.find(c => c.code === 'NG') || AVAILABLE_COUNTRIES[0]
  })

  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const overlayRef = useRef(null)

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Save map location to localStorage
  useEffect(() => {
    localStorage.setItem(
      'zephye_map_location',
      JSON.stringify({ code: selectedLocation.code, name: selectedLocation.name })
    )
  }, [selectedLocation])

  // Fetch map data when location or mode changes
  useEffect(() => {
    if (selectedLocation) {
      fetchMapData(selectedLocation.lat, selectedLocation.lon)
    }
  }, [selectedLocation, mapMode])

  // Load Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapLoaded) return

    const loadMap = async () => {
      if (typeof L !== 'undefined') {
        initMap()
        return
      }

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

  // ========================================================================
  // FETCH MAP DATA
  // ========================================================================

  const fetchMapData = async (lat, lon) => {
    try {
      let data = {}

      if (mapMode === 'pollen') {
        const pollenRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=pollen&timezone=auto`
        )

        data.pollen = await pollenRes.json()
      }

      if (mapMode === 'weather') {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
        )

        data.weather = await weatherRes.json()
      }

      // Traffic data is handled via tile overlay
      if (mapMode === 'traffic') {
        data.traffic = { status: 'ready' }
      }

      setMapData(data)

      // Update map overlay
      if (mapRef.current && mapLoaded) {
        updateMapOverlay(mapRef.current, mapMode, selectedLocation, data)
      }
    } catch (error) {
      console.error('Map data fetch failed:', error)
    }
  }

  // ========================================================================
  // SEARCH FUNCTIONALITY
  // ========================================================================

  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      // Search using Open-Meteo geocoding API
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`
      )

      const data = await res.json()

      if (data.results && data.results.length > 0) {
        // Filter to only include countries in our supported list
        const results = data.results
          .map(r => {
            const countryCode = r.country_code?.toUpperCase() || 'US'
            const isSupported = AVAILABLE_COUNTRIES.some(c => c.code === countryCode)

            return {
              id: r.id,
              name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`,
              lat: r.latitude,
              lon: r.longitude,
              country_code: countryCode,
              admin1: r.admin1,
              admin2: r.admin2,
              supported: isSupported
            }
          })
          .filter(r => r.supported) // Only show supported countries

        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    }

    setIsSearching(false)
  }

  const selectLocation = (result) => {
    const country = AVAILABLE_COUNTRIES.find(c => c.code === result.country_code)

    if (country) {
      setSelectedLocation({
        ...country,
        lat: result.lat,
        lon: result.lon,
        name: result.name
      })
    }

    setSearchQuery('')
    setSearchResults([])

    // Center map on selected location
    if (mapRef.current && mapLoaded) {
      mapRef.current.setView([result.lat, result.lon], 8)
    }
  }

  // ========================================================================
  // MAP INITIALIZATION
  // ========================================================================

  const initMap = () => {
    const map = L.map(mapContainerRef.current, {
      center: [selectedLocation.lat, selectedLocation.lon],
      zoom: 6,
      zoomControl: false,
      attributionControl: false
    })

    // Base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map)

    mapRef.current = map
    setMapLoaded(true)

    // Fetch initial data
    fetchMapData(selectedLocation.lat, selectedLocation.lon)
  }

  // ========================================================================
  // UPDATE MAP OVERLAY
  // ========================================================================

  const updateMapOverlay = (map, mode, location, data) => {
    if (!map) return

    // Clear existing overlays
    markersRef.current.forEach(marker => {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker)
      }
    })
    markersRef.current = []

    if (overlayRef.current) {
      if (map.hasLayer(overlayRef.current)) {
        map.removeLayer(overlayRef.current)
      }
      overlayRef.current = null
    }

    // ======================================================================
    // TRAFFIC MODE
    // ======================================================================

    if (mode === 'traffic') {
      // For traffic, we use TomTom traffic tiles (free tier)
      // Note: This requires a free TomTom API key
      const trafficLayer = L.tileLayer(
        'https://api.tomtom.com/traffic/map/4/tile/flow/{z}/{x}/{y}.png?key=YOUR_TOMTOM_KEY',
        {
          opacity: 0.7,
          attribution: '© TomTom',
          _isOverlay: true
        }
      )

      overlayRef.current = trafficLayer
      map.addLayer(trafficLayer)

      // Add a popup with traffic info
      const infoMarker = L.marker([location.lat, location.lon], {
        icon: L.divIcon({
          className: 'map-info-marker',
          html: `<div style="
            background: rgba(15,23,42,0.85);
            backdrop-filter: blur(10px);
            padding: 8px 14px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.1);
            color: #f8fafc;
            font-size: 13px;
            font-weight: 500;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          ">
            🚦 Traffic Layer Active
            <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px;">
              ${location.name}
            </div>
          </div>`,
          iconSize: [200, 60],
          iconAnchor: [100, 30]
        })
      })

      markersRef.current.push(infoMarker)
      map.addLayer(infoMarker)
    }

    // ======================================================================
    // POLLEN MODE
    // ======================================================================

    else if (mode === 'pollen') {
      if (data?.pollen?.daily?.pollen) {
        const pollen = data.pollen.daily.pollen
        const pollenTypes = ['alder', 'birch', 'grass', 'mugwort', 'ragweed', 'tree']

        // Create a heatmap-style overlay with circles
        const colors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#dc2626']

        pollenTypes.forEach((type, i) => {
          const value = pollen[type]?.[0] || 0

          if (value > 0) {
            const colorIndex = Math.min(Math.floor(value / 2), colors.length - 1)
            const color = colors[colorIndex] || colors[0]
            const radius = 20000 + value * 5000

            const circle = L.circle(
              [location.lat + (i - 2.5) * 0.15, location.lon + ((i % 3) - 1) * 0.2],
              {
                radius: radius,
                color: color,
                fillColor: color,
                fillOpacity: 0.25,
                weight: 2,
                _isOverlay: true
              }
            )

            // Add popup with pollen info
            const level = value > 7 ? 'Very High' : value > 5 ? 'High' : value > 3 ? 'Medium' : 'Low'
            const emoji = value > 7 ? '🔴' : value > 5 ? '🟠' : value > 3 ? '🟡' : '🟢'

            circle.bindPopup(`
              <div style="font-size: 14px;">
                <strong>${type.charAt(0).toUpperCase() + type.slice(1)} Pollen</strong><br>
                Level: ${emoji} ${level}<br>
                Count: ${value}/10
              </div>
            `)

            markersRef.current.push(circle)
            map.addLayer(circle)
          }
        })

        // Add summary marker
        const summaryMarker = L.marker([location.lat, location.lon], {
          icon: L.divIcon({
            className: 'map-info-marker',
            html: `<div style="
              background: rgba(15,23,42,0.85);
              backdrop-filter: blur(10px);
              padding: 8px 14px;
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,0.1);
              color: #f8fafc;
              font-size: 13px;
              font-weight: 500;
              text-align: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ">
              🌿 Pollen Forecast
              <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px;">
                ${location.name}
              </div>
            </div>`,
            iconSize: [180, 60],
            iconAnchor: [90, 30]
          })
        })

        markersRef.current.push(summaryMarker)
        map.addLayer(summaryMarker)
      } else {
        // Fallback if no pollen data
        const fallbackMarker = L.marker([location.lat, location.lon], {
          icon: L.divIcon({
            className: 'map-info-marker',
            html: `<div style="
              background: rgba(15,23,42,0.85);
              backdrop-filter: blur(10px);
              padding: 8px 14px;
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,0.1);
              color: #f8fafc;
              font-size: 13px;
              font-weight: 500;
              text-align: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ">
              🌿 Pollen Data Unavailable
              <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px;">
                No pollen data for this location
              </div>
            </div>`,
            iconSize: [220, 60],
            iconAnchor: [110, 30]
          })
        })

        markersRef.current.push(fallbackMarker)
        map.addLayer(fallbackMarker)
      }
    }

    // ======================================================================
    // WEATHER MODE
    // ======================================================================

    else if (mode === 'weather') {
      const currentWeather = data?.weather?.current_weather

      if (currentWeather) {
        const code = currentWeather.weather_code || 0
        const temp = currentWeather.temperature || 0

        // Weather emoji based on code
        const getWeatherEmoji = (c) => {
          if (c === 0 || c === 1) return '☀️'
          if (c === 2) return '⛅'
          if (c === 3) return '☁️'
          if (c >= 95) return '⛈️'
          if (c >= 61 && c <= 82) return '🌧️'
          if (c >= 51 && c <= 57) return '🌦️'
          if (c >= 71 && c <= 77) return '❄️'
          if (c === 45 || c === 48) return '🌫️'
          return '🌤️'
        }

        // Get condition name
        const getConditionName = (c) => {
          const map = {
            0: 'Clear Sky',
            1: 'Mainly Clear',
            2: 'Partly Cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Fog',
            51: 'Light Drizzle',
            53: 'Moderate Drizzle',
            55: 'Heavy Drizzle',
            61: 'Light Rain',
            63: 'Moderate Rain',
            65: 'Heavy Rain',
            71: 'Light Snow',
            73: 'Moderate Snow',
            75: 'Heavy Snow',
            80: 'Rain Showers',
            81: 'Heavy Rain Showers',
            82: 'Violent Rain Showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with Hail',
            99: 'Heavy Thunderstorm'
          }
          return map[c] || 'Unknown'
        }

        // Create main weather marker
        const weatherMarker = L.marker([location.lat, location.lon], {
          icon: L.divIcon({
            className: 'map-info-marker',
            html: `<div style="
              background: rgba(15,23,42,0.85);
              backdrop-filter: blur(10px);
              padding: 12px 18px;
              border-radius: 16px;
              border: 1px solid rgba(255,255,255,0.1);
              color: #f8fafc;
              font-size: 14px;
              font-weight: 500;
              text-align: center;
              box-shadow: 0 4px 16px rgba(0,0,0,0.4);
              min-width: 120px;
            ">
              <div style="font-size: 36px; margin-bottom: 4px;">${getWeatherEmoji(code)}</div>
              <div style="font-size: 20px; font-weight: 700;">${Math.round(temp)}°C</div>
              <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 2px;">
                ${getConditionName(code)}
              </div>
              <div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 4px;">
                ${location.name}
              </div>
            </div>`,
            iconSize: [140, 110],
            iconAnchor: [70, 55]
          })
        })

        markersRef.current.push(weatherMarker)
        map.addLayer(weatherMarker)

        // Add additional weather info if available
        if (data.weather?.daily) {
          const daily = data.weather.daily

          // Get today's forecast
          const todayHigh = daily.temperature_2m_max?.[0]
          const todayLow = daily.temperature_2m_min?.[0]

          if (todayHigh || todayLow) {
            const infoMarker = L.marker(
              [location.lat + 0.2, location.lon],
              {
                icon: L.divIcon({
                  className: 'map-info-marker',
                  html: `<div style="
                    background: rgba(15,23,42,0.8);
                    backdrop-filter: blur(10px);
                    padding: 6px 12px;
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.08);
                    color: #f8fafc;
                    font-size: 12px;
                    font-weight: 400;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  ">
                    📊 ${todayHigh ? Math.round(todayHigh) + '°' : '--'} / ${todayLow ? Math.round(todayLow) + '°' : '--'}
                  </div>`,
                  iconSize: [80, 30],
                  iconAnchor: [40, 15]
                })
              }
            )

            markersRef.current.push(infoMarker)
            map.addLayer(infoMarker)
          }
        }
      } else {
        // Fallback if no weather data
        const fallbackMarker = L.marker([location.lat, location.lon], {
          icon: L.divIcon({
            className: 'map-info-marker',
            html: `<div style="
              background: rgba(15,23,42,0.85);
              backdrop-filter: blur(10px);
              padding: 8px 14px;
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,0.1);
              color: #f8fafc;
              font-size: 13px;
              font-weight: 500;
              text-align: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ">
              ⛅ Weather Data Unavailable
              <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px;">
                ${location.name}
              </div>
            </div>`,
            iconSize: [200, 60],
            iconAnchor: [100, 30]
          })
        })

        markersRef.current.push(fallbackMarker)
        map.addLayer(fallbackMarker)
      }
    }
  }

  // ========================================================================
  // HANDLE MODE SWITCH
  // ========================================================================

  const handleModeSwitch = (mode) => {
    setMapMode(mode)

    if (mapRef.current && mapLoaded && selectedLocation) {
      fetchMapData(selectedLocation.lat, selectedLocation.lon)
    }
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="map-tab-container glass" style={{ padding: '16px' }}>
      {/* Header with capsule and search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div className="map-capsule-switch" style={{
          display: 'flex',
          background: 'rgba(10,22,40,0.8)',
          borderRadius: '40px',
          padding: '4px',
          border: '1px solid rgba(100,150,255,0.2)',
          backdropFilter: 'blur(10px)',
          gap: '2px'
        }}>
          {['traffic', 'pollen', 'weather'].map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeSwitch(mode)}
              className={`map-capsule-btn ${mapMode === mode ? 'active' : ''}`}
              style={{
                padding: '6px 16px',
                borderRadius: '30px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: mapMode === mode ? 'rgba(56,189,248,0.2)' : 'transparent',
                color: mapMode === mode ? '#7dd3fc' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {mode === 'traffic' ? '🚦 Traffic' : mode === 'pollen' ? '🌿 Pollen' : '⛅ Weather'}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', flex: 1, maxWidth: '300px', minWidth: '150px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              handleSearch(e.target.value)
            }}
            placeholder="Search city, state, LGA..."
            className="map-search-input"
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '30px',
              background: 'rgba(10,22,40,0.8)',
              border: '1px solid rgba(100,150,255,0.2)',
              color: '#e2e8f0',
              fontSize: '13px',
              outline: 'none'
            }}
          />

          {isSearching && (
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '14px',
              animation: 'spin 1s linear infinite'
            }}>
              ⏳
            </span>
          )}

          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              right: 0,
              maxHeight: '200px',
              overflowY: 'auto',
              background: 'rgba(10,22,40,0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(100,150,255,0.15)',
              padding: '6px',
              zIndex: 50,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}>
              {searchResults.map(result => (
                <button
                  key={result.id}
                  onClick={() => selectLocation(result)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#e2e8f0',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56,189,248,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span>📍</span>
                  <span style={{ flex: 1 }}>{result.name}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                    {result.country_code}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="map-wrapper"
        style={{
          width: '100%',
          height: '400px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#0a1628',
          border: '1px solid rgba(100,150,255,0.1)',
          position: 'relative'
        }}
      >
        {!mapLoaded && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            gap: '12px',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '14px'
          }}>
            <span style={{ fontSize: '32px' }}>🗺️</span>
            <div>Loading map...</div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div style={{
        marginTop: '12px',
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.4)',
        flexWrap: 'wrap'
      }}>
        {mapMode === 'traffic' && (
          <>
            <span><span className="legend-dot heavy" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', marginRight: '4px' }}></span> Heavy</span>
            <span><span className="legend-dot moderate" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#eab308', marginRight: '4px' }}></span> Moderate</span>
            <span><span className="legend-dot light" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', marginRight: '4px' }}></span> Light</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span>Data: TomTom</span>
          </>
        )}

        {mapMode === 'pollen' && (
          <>
            <span><span className="legend-dot" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', marginRight: '4px' }}></span> High</span>
            <span><span className="legend-dot" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#eab308', marginRight: '4px' }}></span> Medium</span>
            <span><span className="legend-dot" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', marginRight: '4px' }}></span> Low</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span>Data: Open-Meteo</span>
          </>
        )}

        {mapMode === 'weather' && (
          <>
            <span>📍 {selectedLocation.flag} {selectedLocation.name}</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span>Data: Open-Meteo</span>
          </>
        )}
      </div>
    </div>
  )
}
