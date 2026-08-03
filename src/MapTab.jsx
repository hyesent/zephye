import { useState, useEffect, useRef, useCallback } from 'react'

// ============================================================================
// CONSTANTS
// ============================================================================

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjkzZGIxMDYzZDZmOTQyOGZiZGFlMzk2OTA3ZWJkZjA4IiwiaCI6Im11cm11cjY0In0="

const SUPPORTED_COUNTRIES = [
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

const WEATHER_EMOJIS = {
  0: '☀️', 1: '☀️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️',
  80: '🌧️', 81: '🌧️', 82: '🌧️',
  95: '⛈️', 96: '⛈️', 99: '⛈️'
}

const WEATHER_NAMES = {
  0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Fog',
  51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Heavy Drizzle',
  61: 'Light Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
  71: 'Light Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
  80: 'Rain Showers', 81: 'Heavy Showers', 82: 'Violent Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Heavy Thunderstorm'
}

const POLLEN_TYPES = ['alder', 'birch', 'grass', 'mugwort', 'olive', 'ragweed']
const POLLEN_LABELS = { alder: 'Alder', birch: 'Birch', grass: 'Grass', mugwort: 'Mugwort', olive: 'Olive', ragweed: 'Ragweed' }
const POLLEN_COLORS = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#dc2626']
const POLLEN_LEVELS = ['Very Low', 'Low', 'Moderate', 'High', 'Very High', 'Extreme']

const DEFAULT_LOCATION = SUPPORTED_COUNTRIES.find(c => c.code === 'NG') || SUPPORTED_COUNTRIES[0]

// ============================================================================
// MAP TAB COMPONENT
// ============================================================================

export default function MapTab({ weather, location, aqi }) {
  // ─── State ────────────────────────────────────────────────────────────────

  const [mode, setMode] = useState('weather')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapData, setMapData] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('zephye_map_location')
      if (saved) {
        const parsed = JSON.parse(saved)
        const exists = SUPPORTED_COUNTRIES.find(c => c.code === parsed.code)
        if (exists && parsed.lat && parsed.lon) return parsed
      }
    } catch {}
    return DEFAULT_LOCATION
  })
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false)

  // ─── Refs ──────────────────────────────────────────────────────────────────

  const mapRef = useRef(null)
  const markersRef = useRef([])
  const overlayRef = useRef(null)
  const mapContainerRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const abortControllerRef = useRef(null)
  const isMapInitializedRef = useRef(false)
  const routeLayerRef = useRef(null)
  const routeMarkersRef = useRef([])
  const longPressTimerRef = useRef(null)
  const isLongPressRef = useRef(false)
  const currentPopupRef = useRef(null)

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (selectedLocation?.lat && selectedLocation?.lon) {
      localStorage.setItem('zephye_map_location', JSON.stringify({
        code: selectedLocation.code,
        name: selectedLocation.name,
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
        flag: selectedLocation.flag
      }))
    }
  }, [selectedLocation])

  useEffect(() => {
    if (selectedLocation?.lat && selectedLocation?.lon && mapLoaded) {
      fetchMapData(selectedLocation.lat, selectedLocation.lon)
    }
  }, [selectedLocation, mode, mapLoaded])

  useEffect(() => {
    if (isMapInitializedRef.current) return
    if (!mapContainerRef.current) return
    if (!selectedLocation?.lat || !selectedLocation?.lon) {
      setSelectedLocation(DEFAULT_LOCATION)
      return
    }

    isMapInitializedRef.current = true

    const loadMap = () => {
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
      script.onload = initMap
      document.body.appendChild(script)
    }

    loadMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      setMapLoaded(false)
      isMapInitializedRef.current = false
    }
  }, [])

  // ─── Map Initialization ──────────────────────────────────────────────────

  const initMap = () => {
    if (!mapContainerRef.current) return

    const lat = selectedLocation?.lat ?? DEFAULT_LOCATION.lat
    const lon = selectedLocation?.lon ?? DEFAULT_LOCATION.lon

    const map = L.map(mapContainerRef.current, {
      center: [lat, lon],
      zoom: 6,
      zoomControl: false,
      attributionControl: false
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map)

    // ─── SINGLE TAP → POLLEN ─────────────────────────────────────────────
    map.on('click', (e) => {
      if (isLongPressRef.current) {
        isLongPressRef.current = false
        return
      }
      const { lat, lng } = e.latlng
      handleSingleTap(lat, lng, map)
    })

    // ─── DOUBLE TAP → ROUTE ──────────────────────────────────────────────
    map.on('dblclick', (e) => {
      const { lat, lng } = e.latlng
      handleDoubleTap(lat, lng, map)
    })

    // ─── RIGHT CLICK → ROUTE ─────────────────────────────────────────────
    map.on('contextmenu', (e) => {
      const { lat, lng } = e.latlng
      handleDoubleTap(lat, lng, map)
    })

    // ─── LONG PRESS DETECTION ────────────────────────────────────────────
    map.on('mousedown', () => {
      isLongPressRef.current = false
      longPressTimerRef.current = setTimeout(() => {
        isLongPressRef.current = true
      }, 500)
    })

    map.on('mouseup', () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    })

    mapRef.current = map
    setMapLoaded(true)

    fetchMapData(lat, lon)
  }

  // ─── Popup Helper ────────────────────────────────────────────────────────

  const showPopup = (map, lat, lng, html, options = {}) => {
    // Close existing popup
    if (currentPopupRef.current) {
      map.closePopup(currentPopupRef.current)
      currentPopupRef.current = null
    }

    const popup = L.popup({
      maxWidth: options.maxWidth || 300,
      className: 'custom-popup'
    })
      .setLatLng([lat, lng])
      .setContent(html)

    popup.openOn(map)
    currentPopupRef.current = popup
    return popup
  }

  // ─── Tap Handlers ────────────────────────────────────────────────────────

  const handleSingleTap = async (lat, lng, map) => {
    // Show loading
    showPopup(map, lat, lng, `
      <div style="
        background: rgba(15,23,42,0.92);
        backdrop-filter: blur(16px);
        padding: 10px 16px;
        border-radius: 12px;
        color: #f8fafc;
        font-size: 13px;
        font-family: 'Poppins', sans-serif;
      ">
        ⏳ Loading pollen...
      </div>
    `)

    const pollenData = await fetchPollenForLocation(lat, lng)

    if (pollenData && pollenData.hourly) {
      showPopup(map, lat, lng, createPollenPopup(pollenData, lat, lng))
    } else {
      const weatherData = await fetchWeatherForLocation(lat, lng)
      if (weatherData) {
        showPopup(map, lat, lng, createWeatherPopup(weatherData))
      } else {
        showPopup(map, lat, lng, `
          <div style="
            background: rgba(15,23,42,0.92);
            backdrop-filter: blur(16px);
            padding: 10px 16px;
            border-radius: 12px;
            color: #f8fafc;
            font-size: 13px;
            font-family: 'Poppins', sans-serif;
            text-align: center;
          ">
            ❌ No data available
            <div style="font-size: 9px; color: rgba(255,255,255,0.3); margin-top: 4px;">
              Try double tap or right-click for route
            </div>
          </div>
        `)
      }
    }
  }

  const handleDoubleTap = async (lat, lng, map) => {
    // Clear previous route
    clearRoute(map)

    // Show calculating
    showPopup(map, lat, lng, `
      <div style="
        background: rgba(15,23,42,0.92);
        backdrop-filter: blur(16px);
        padding: 10px 16px;
        border-radius: 12px;
        color: #f8fafc;
        font-size: 13px;
        font-family: 'Poppins', sans-serif;
        text-align: center;
      ">
        🗺️ Calculating route...
      </div>
    `)

    setIsCalculatingRoute(true)

    const result = await calculateRoute(
      selectedLocation.lat,
      selectedLocation.lon,
      lat,
      lng
    )

    setIsCalculatingRoute(false)

    if (result) {
      drawRoute(map, result, lat, lng)
    } else {
      showPopup(map, lat, lng, `
        <div style="
          background: rgba(15,23,42,0.92);
          backdrop-filter: blur(16px);
          padding: 10px 16px;
          border-radius: 12px;
          color: #f8fafc;
          font-size: 13px;
          font-family: 'Poppins', sans-serif;
          text-align: center;
        ">
          ❌ Route not found
          <div style="font-size: 9px; color: rgba(255,255,255,0.3); margin-top: 4px;">
            Try a different location
          </div>
        </div>
      `)
    }
  }

  // ─── Route Calculation ──────────────────────────────────────────────────

  const calculateRoute = async (startLat, startLon, endLat, endLon) => {
    try {
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?` +
        `api_key=${ORS_API_KEY}&` +
        `start=${startLon},${startLat}&` +
        `end=${endLon},${endLat}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        const geometry = feature.geometry
        const properties = feature.properties

        const distance = properties.segments[0]?.distance || 0
        const duration = properties.segments[0]?.duration || 0

        const distanceKm = (distance / 1000).toFixed(1)
        const durationMin = Math.round(duration / 60)
        const durationStr = durationMin < 60
          ? `${durationMin} min`
          : `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`

        return {
          geometry,
          distance: distanceKm,
          duration: durationStr
        }
      }
      return null
    } catch (error) {
      console.error('Route calculation failed:', error)
      return null
    }
  }

  const drawRoute = (map, result, endLat, endLon) => {
    if (!map) return

    // Convert geometry to Leaflet polyline
    const coords = result.geometry.coordinates.map(coord => [coord[1], coord[0]])

    const routeLine = L.polyline(coords, {
      color: '#38bdf8',
      weight: 4,
      opacity: 0.9,
      dashArray: '8, 6'
    }).addTo(map)

    routeLayerRef.current = routeLine

    // Start marker (green)
    const startIcon = L.divIcon({
      className: 'route-marker-start',
      html: `<div style="
        background: #22c55e;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid #f8fafc;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    })

    // End marker (red)
    const endIcon = L.divIcon({
      className: 'route-marker-end',
      html: `<div style="
        background: #ef4444;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid #f8fafc;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    })

    const startMarker = L.marker([selectedLocation.lat, selectedLocation.lon], { icon: startIcon }).addTo(map)
    const endMarker = L.marker([endLat, endLon], { icon: endIcon }).addTo(map)

    routeMarkersRef.current = [startMarker, endMarker]

    // Show route info popup
    const midLat = (selectedLocation.lat + endLat) / 2
    const midLon = (selectedLocation.lon + endLon) / 2

    showPopup(map, midLat, midLon, `
      <div style="
        background: rgba(15,23,42,0.92);
        backdrop-filter: blur(16px);
        padding: 12px 16px;
        border-radius: 14px;
        color: #f8fafc;
        font-family: 'Poppins', sans-serif;
        min-width: 140px;
        text-align: center;
      ">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">🚗 Route</div>
        <div style="font-size: 22px; font-weight: 700; color: #38bdf8;">${result.distance} km</div>
        <div style="font-size: 14px; color: rgba(255,255,255,0.6);">⏱️ ${result.duration}</div>
        <div style="font-size: 9px; color: rgba(255,255,255,0.2); margin-top: 4px;">
          OpenRouteService · Driving
        </div>
        <div style="font-size: 8px; color: rgba(255,255,255,0.15); margin-top: 2px;">
          Tap map to clear
        </div>
      </div>
    `, { maxWidth: 250 })

    // Zoom to fit route
    map.fitBounds(routeLine.getBounds(), { padding: [80, 80] })

    // Click to clear route
    const clearHandler = () => {
      clearRoute(map)
      map.off('click', clearHandler)
    }
    map.on('click', clearHandler)
  }

  const clearRoute = (map) => {
    if (!map) return

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current)
      routeLayerRef.current = null
    }

    routeMarkersRef.current.forEach(m => {
      if (map.hasLayer(m)) {
        map.removeLayer(m)
      }
    })
    routeMarkersRef.current = []

    if (currentPopupRef.current) {
      map.closePopup(currentPopupRef.current)
      currentPopupRef.current = null
    }
  }

  // ─── Fetch Functions ────────────────────────────────────────────────────

  const fetchPollenForLocation = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?` +
        `latitude=${lat}&longitude=${lon}&` +
        `hourly=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&` +
        `timezone=auto`
      )
      return await res.json()
    } catch {
      return null
    }
  }

  const fetchWeatherForLocation = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
      )
      return await res.json()
    } catch {
      return null
    }
  }

  // ─── Popup HTML Creators ────────────────────────────────────────────────

  const createPollenPopup = (data, lat, lon) => {
    if (!data?.hourly) return 'No pollen data available'

    const todayIndex = data.hourly?.time?.findIndex(t => {
      const date = new Date(t)
      const today = new Date()
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear()
    }) || 0

    let popupHtml = `
      <div style="
        background: rgba(15,23,42,0.92);
        backdrop-filter: blur(16px);
        padding: 12px 16px;
        border-radius: 14px;
        color: #f8fafc;
        font-family: 'Poppins', sans-serif;
        min-width: 160px;
      ">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">🌿 Pollen Levels</div>
        <div style="font-size: 9px; color: rgba(255,255,255,0.25); margin-bottom: 6px;">
          ${lat.toFixed(2)}, ${lon.toFixed(2)}
        </div>
    `

    let hasData = false

    POLLEN_TYPES.forEach((type) => {
      const key = `${type}_pollen`
      const values = data.hourly?.[key] || []
      const todayValues = values.slice(todayIndex, todayIndex + 12).filter(v => v !== null)
      const avg = todayValues.length > 0
        ? todayValues.reduce((a, b) => a + b, 0) / todayValues.length
        : 0

      if (avg > 0) hasData = true

      const intensity = Math.min(avg / 8, 1)
      const colorIndex = Math.min(Math.floor(intensity * 5), POLLEN_COLORS.length - 1)
      const color = POLLEN_COLORS[colorIndex] || POLLEN_COLORS[0]
      const levelIndex = Math.min(Math.floor(intensity * 5), POLLEN_LEVELS.length - 1)
      const level = POLLEN_LEVELS[levelIndex] || POLLEN_LEVELS[0]

      const label = POLLEN_LABELS[type] || type

      popupHtml += `
        <div style="display: flex; justify-content: space-between; font-size: 11px; padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <span>${label}</span>
          <span style="color: ${color}; font-weight: 600;">${level}</span>
          <span style="color: rgba(255,255,255,0.4); font-size: 10px;">${avg.toFixed(0)}</span>
        </div>
      `
    })

    if (!hasData) {
      popupHtml += `
        <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-align: center; padding: 8px 0;">
          No pollen data available
        </div>
      `
    }

    popupHtml += `
        <div style="font-size: 8px; color: rgba(255,255,255,0.15); margin-top: 6px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 6px;">
          Double tap or right-click for route
        </div>
      </div>
    `

    return popupHtml
  }

  const createWeatherPopup = (data) => {
    if (!data?.current_weather) return 'No weather data available'

    const w = data.current_weather
    const code = w.weather_code || 0
    const temp = Math.round(w.temperature || 0)
    const emoji = WEATHER_EMOJIS[code] || '🌤️'
    const name = WEATHER_NAMES[code] || 'Unknown'
    const high = data.daily?.temperature_2m_max?.[0] ? Math.round(data.daily.temperature_2m_max[0]) : '--'
    const low = data.daily?.temperature_2m_min?.[0] ? Math.round(data.daily.temperature_2m_min[0]) : '--'

    return `
      <div style="
        background: rgba(15,23,42,0.92);
        backdrop-filter: blur(16px);
        padding: 12px 16px;
        border-radius: 14px;
        color: #f8fafc;
        font-family: 'Poppins', sans-serif;
        min-width: 120px;
        text-align: center;
      ">
        <div style="font-size: 28px;">${emoji}</div>
        <div style="font-size: 18px; font-weight: 700;">${temp}°C</div>
        <div style="font-size: 11px; color: rgba(255,255,255,0.5);">${name}</div>
        <div style="font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 2px;">
          ⬆ ${high}° ⬇ ${low}°
        </div>
        <div style="font-size: 8px; color: rgba(255,255,255,0.15); margin-top: 4px;">
          Double tap or right-click for route
        </div>
      </div>
    `
  }

  // ─── Data Fetching for Map Mode ─────────────────────────────────────────

  const fetchMapData = async (lat, lon) => {
    if (!lat || !lon) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      let data = {}

      if (mode === 'pollen') {
        const res = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?` +
          `latitude=${lat}&longitude=${lon}&` +
          `hourly=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&` +
          `timezone=auto`,
          { signal: abortControllerRef.current.signal }
        )
        data = await res.json()
      }

      if (mode === 'weather') {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`,
          { signal: abortControllerRef.current.signal }
        )
        data = await res.json()
      }

      if (mode === 'traffic') {
        data = { traffic: true }
      }

      setMapData(data)
      updateMap(data)

    } catch (error) {
      if (error.name === 'AbortError') return
      console.error('Map data fetch failed:', error)
    }
  }

  // ─── Update Map ───────────────────────────────────────────────────────────

  const updateMap = (data) => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    const lat = selectedLocation?.lat ?? DEFAULT_LOCATION.lat
    const lon = selectedLocation?.lon ?? DEFAULT_LOCATION.lon

    markersRef.current.forEach(m => {
      try { map.removeLayer(m) } catch {}
    })
    markersRef.current = []

    if (overlayRef.current) {
      try { map.removeLayer(overlayRef.current) } catch {}
      overlayRef.current = null
    }

    // ─── HOME MARKER — Just the home icon ──────────────────────────────

    const homeIcon = L.divIcon({
      className: 'home-marker',
      html: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/>
          <circle cx="12" cy="10" r="1.5" fill="#38bdf8"/>
        </svg>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })

    const homeMarker = L.marker([lat, lon], { icon: homeIcon })
    homeMarker.bindPopup(`
      <div style="
        background: rgba(15,23,42,0.92);
        backdrop-filter: blur(16px);
        padding: 8px 12px;
        border-radius: 10px;
        color: #f8fafc;
        font-size: 12px;
        font-family: 'Poppins', sans-serif;
        text-align: center;
      ">
        <strong>${selectedLocation?.name || 'Location'}</strong>
        <div style="font-size: 10px; color: rgba(255,255,255,0.3);">${selectedLocation?.flag || ''} Tap map for data</div>
      </div>
    `)

    markersRef.current.push(homeMarker)
    map.addLayer(homeMarker)

    // ─── Mode-specific overlay ────────────────────────────────────────────

    if (mode === 'weather' && data?.current_weather) {
      renderWeatherOverlay(map, data, lat, lon)
    } else if (mode === 'weather' && !data?.current_weather) {
      renderLoadingState(map, lat, lon, 'Loading weather...')
    }

    if (mode === 'pollen' && data?.hourly) {
      renderPollenOverlay(map, data, lat, lon)
    } else if (mode === 'pollen' && !data?.hourly) {
      renderLoadingState(map, lat, lon, 'Loading pollen data...')
    }

    if (mode === 'traffic') {
      renderTrafficOverlay(map, lat, lon)
    }

    if (markersRef.current.length > 0) {
      try {
        const group = L.featureGroup(markersRef.current)
        const bounds = group.getBounds()
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 })
        }
      } catch {}
    }
  }

  // ─── Loading State ───────────────────────────────────────────────────────

  const renderLoadingState = (map, lat, lon, message) => {
    const loadingIcon = L.divIcon({
      className: 'loading-marker',
      html: `
        <div style="
          background: rgba(15,23,42,0.85);
          backdrop-filter: blur(16px);
          padding: 6px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.4);
          font-size: 11px;
          text-align: center;
        ">
          ⏳ ${message}
        </div>
      `,
      iconSize: [140, 30],
      iconAnchor: [70, 15]
    })
    const loadingMarker = L.marker([lat + 0.10, lon + 0.10], { icon: loadingIcon })
    markersRef.current.push(loadingMarker)
    map.addLayer(loadingMarker)
  }

  // ─── Weather Overlay ─────────────────────────────────────────────────────

  const renderWeatherOverlay = (map, data, lat, lon) => {
    const w = data.current_weather
    const code = w.weather_code || 0
    const temp = Math.round(w.temperature || 0)

    const emoji = WEATHER_EMOJIS[code] || '🌤️'
    const name = WEATHER_NAMES[code] || 'Unknown'

    const weatherIcon = L.divIcon({
      className: 'weather-marker',
      html: `
        <div style="
          background: rgba(15,23,42,0.85);
          backdrop-filter: blur(16px);
          padding: 10px 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          text-align: center;
          min-width: 80px;
        ">
          <div style="font-size: 32px; margin-bottom: 0px;">${emoji}</div>
          <div style="font-size: 20px; font-weight: 700; color: #f8fafc;">${temp}°C</div>
          <div style="font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 0px;">${name}</div>
          <div style="font-size: 8px; color: rgba(255,255,255,0.15); margin-top: 2px;">Tap for pollen · Double tap for route</div>
        </div>
      `,
      iconSize: [120, 105],
      iconAnchor: [60, 52]
    })

    const marker = L.marker([lat + 0.10, lon + 0.10], { icon: weatherIcon })
    markersRef.current.push(marker)
    map.addLayer(marker)

    const daily = data.daily
    if (daily) {
      const high = daily.temperature_2m_max?.[0]
      const low = daily.temperature_2m_min?.[0]
      const uv = daily.uv_index_max?.[0]

      let details = ''
      if (high) details += `⬆ ${Math.round(high)}°C`
      if (low) details += ` ⬇ ${Math.round(low)}°C`
      if (uv) details += ` · UV ${Math.round(uv)}`

      if (details) {
        const detailIcon = L.divIcon({
          className: 'detail-marker',
          html: `
            <div style="
              background: rgba(15,23,42,0.6);
              backdrop-filter: blur(6px);
              padding: 2px 10px;
              border-radius: 8px;
              border: 1px solid rgba(255,255,255,0.04);
              font-size: 10px;
              color: rgba(255,255,255,0.5);
            ">
              ${details}
            </div>
          `,
          iconSize: [130, 22],
          iconAnchor: [65, 11]
        })

        const detailMarker = L.marker([lat - 0.10, lon - 0.06], { icon: detailIcon })
        markersRef.current.push(detailMarker)
        map.addLayer(detailMarker)
      }
    }
  }

  // ─── Pollen Overlay ─────────────────────────────────────────────────────

  const renderPollenOverlay = (map, data, lat, lon) => {
    const todayIndex = data.hourly?.time?.findIndex(t => {
      const date = new Date(t)
      const today = new Date()
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear()
    }) || 0

    const pollenValues = POLLEN_TYPES.map(type => {
      const key = `${type}_pollen`
      const values = data.hourly?.[key] || []
      const todayValues = values.slice(todayIndex, todayIndex + 24).filter(v => v !== null)
      const avg = todayValues.length > 0
        ? todayValues.reduce((a, b) => a + b, 0) / todayValues.length
        : 0
      return { type, value: avg, label: POLLEN_LABELS[type] || type }
    })

    const maxValue = Math.max(...pollenValues.map(p => p.value), 1)

    pollenValues.forEach((p, i) => {
      const intensity = Math.min(p.value / maxValue, 1)
      const colorIndex = Math.min(Math.floor(intensity * 5), POLLEN_COLORS.length - 1)
      const color = POLLEN_COLORS[colorIndex] || POLLEN_COLORS[0]
      const levelIndex = Math.min(Math.floor(intensity * 5), POLLEN_LEVELS.length - 1)
      const level = POLLEN_LEVELS[levelIndex] || POLLEN_LEVELS[0]

      const radius = 12000 + p.value * 2500

      const circle = L.circle(
        [lat + (i - 2.5) * 0.13, lon + ((i % 3) - 1) * 0.18],
        {
          radius: radius,
          color: color,
          fillColor: color,
          fillOpacity: 0.12 + intensity * 0.5,
          weight: 1.5,
          opacity: 0.5,
          className: 'pollen-circle'
        }
      )

      const popupContent = `
        <div style="
          font-size: 12px;
          color: #1a1a2e;
          font-weight: 500;
          padding: 2px;
          min-width: 100px;
        ">
          <strong>${p.label} Pollen</strong><br>
          Level: <span style="color: ${color}; font-weight: 700;">${level}</span><br>
          Count: ${p.value.toFixed(1)} grains/m³
        </div>
      `
      circle.bindPopup(popupContent)

      markersRef.current.push(circle)
      map.addLayer(circle)
    })

    const avgPollen = pollenValues.reduce((sum, p) => sum + p.value, 0) / pollenValues.length

    const legendIcon = L.divIcon({
      className: 'pollen-legend',
      html: `
        <div style="
          background: rgba(15,23,42,0.85);
          backdrop-filter: blur(16px);
          padding: 6px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
          text-align: center;
          min-width: 80px;
        ">
          <div style="font-size: 10px; font-weight: 600; color: #f8fafc; margin-bottom: 2px;">🌿 Pollen Heatmap</div>
          <div style="display: flex; justify-content: center; gap: 4px; font-size: 8px; color: rgba(255,255,255,0.4);">
            <span><span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #22c55e; margin-right: 2px;"></span> Low</span>
            <span><span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #eab308; margin-right: 2px;"></span> Med</span>
            <span><span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #ef4444; margin-right: 2px;"></span> High</span>
          </div>
          <div style="font-size: 8px; color: rgba(255,255,255,0.2); margin-top: 2px;">
            Avg: ${avgPollen.toFixed(1)} grains/m³
          </div>
          <div style="font-size: 7px; color: rgba(255,255,255,0.12); margin-top: 2px;">
            Double tap or right-click for route
          </div>
        </div>
      `,
      iconSize: [120, 70],
      iconAnchor: [60, 35]
    })

    const legendMarker = L.marker([lat + 0.22, lon - 0.08], { icon: legendIcon })
    markersRef.current.push(legendMarker)
    map.addLayer(legendMarker)
  }

  // ─── Traffic Overlay ─────────────────────────────────────────────────────

  const renderTrafficOverlay = (map, lat, lon) => {
    const infoIcon = L.divIcon({
      className: 'traffic-info',
      html: `
        <div style="
          background: rgba(15,23,42,0.85);
          backdrop-filter: blur(16px);
          padding: 8px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.5);
          font-size: 11px;
          text-align: center;
          max-width: 160px;
        ">
          🗺️ Route Calculator
          <div style="font-size: 9px; color: rgba(255,255,255,0.25); margin-top: 2px;">
            Double tap or right-click any location
          </div>
          <div style="font-size: 8px; color: rgba(255,255,255,0.15); margin-top: 2px;">
            OpenRouteService · Driving
          </div>
        </div>
      `,
      iconSize: [160, 65],
      iconAnchor: [80, 32]
    })

    const infoMarker = L.marker([lat + 0.08, lon + 0.08], { icon: infoIcon })
    markersRef.current.push(infoMarker)
    map.addLayer(infoMarker)
  }

  // ─── Search ──────────────────────────────────────────────────────────────

  const handleSearch = useCallback((query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
        )

        const data = await res.json()

        if (data.results?.length) {
          const results = data.results
            .map(r => {
              const code = r.country_code?.toUpperCase() || 'US'
              const supported = SUPPORTED_COUNTRIES.some(c => c.code === code)

              return {
                id: r.id,
                name: `${r.name}${r.admin1 ? `, ${r.admin1}` : ''}`,
                fullName: `${r.name}${r.admin1 ? `, ${r.admin1}` : ''}, ${r.country}`,
                lat: r.latitude,
                lon: r.longitude,
                country_code: code,
                supported,
                flag: SUPPORTED_COUNTRIES.find(c => c.code === code)?.flag || '🌍'
              }
            })
            .filter(r => r.supported)

          setSearchResults(results)
        } else {
          setSearchResults([])
        }
      } catch {
        setSearchResults([])
      }

      setIsSearching(false)
    }, 300)
  }, [])

  const selectLocation = (result) => {
    const country = SUPPORTED_COUNTRIES.find(c => c.code === result.country_code)

    if (country && result.lat && result.lon) {
      const newLocation = {
        ...country,
        lat: result.lat,
        lon: result.lon,
        name: result.fullName
      }

      setSelectedLocation(newLocation)

      if (mapRef.current && mapLoaded) {
        mapRef.current.setView([result.lat, result.lon], 8)
      }
    }

    setSearchQuery('')
    setSearchResults([])
  }

  // ─── Switch Mode ─────────────────────────────────────────────────────────

  const switchMode = (newMode) => {
    setMode(newMode)
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="map-tab-container glass" style={{ padding: '16px', position: 'relative' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          background: 'rgba(10,22,40,0.8)',
          borderRadius: '40px',
          padding: '4px',
          border: '1px solid rgba(100,150,255,0.15)',
          gap: '2px'
        }}>
          {['weather', 'pollen', 'traffic'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                padding: '7px 18px',
                borderRadius: '30px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: mode === m ? 'rgba(56,189,248,0.2)' : 'transparent',
                color: mode === m ? '#7dd3fc' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {m === 'weather' ? '⛅ Weather' : m === 'pollen' ? '🌿 Pollen' : '🗺️ Route'}
            </button>
          ))}
        </div>

        <div style={{
          position: 'relative',
          flex: 1,
          maxWidth: '320px',
          minWidth: '160px',
          zIndex: 100
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              handleSearch(e.target.value)
            }}
            placeholder="Search city, state, LGA..."
            style={{
              width: '100%',
              padding: '8px 16px',
              borderRadius: '30px',
              background: 'rgba(10,22,40,0.8)',
              border: '1px solid rgba(100,150,255,0.15)',
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
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              maxHeight: '200px',
              overflowY: 'auto',
              background: 'rgba(10,22,40,0.96)',
              backdropFilter: 'blur(20px)',
              borderRadius: '14px',
              border: '1px solid rgba(100,150,255,0.1)',
              padding: '6px',
              zIndex: 1000,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
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
                    transition: 'background 0.15s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56,189,248,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '16px' }}>{result.flag}</span>
                  <span style={{ flex: 1 }}>{result.fullName}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                    {result.country_code}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '420px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#0a1628',
          border: '1px solid rgba(100,150,255,0.08)',
          position: 'relative',
          zIndex: 1
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
            color: 'rgba(255,255,255,0.25)',
            fontSize: '14px'
          }}>
            <span style={{ fontSize: '36px' }}>🗺️</span>
            <div>Loading map...</div>
          </div>
        )}
      </div>

      <div style={{
        marginTop: '12px',
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.35)',
        flexWrap: 'wrap'
      }}>
        {mode === 'weather' && (
          <>
            <span>📍 {selectedLocation?.flag || '📍'} {selectedLocation?.name || 'Location'}</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span>Tap for pollen · Double tap/right-click for route</span>
          </>
        )}
        {mode === 'pollen' && (
          <>
            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', marginRight: '4px' }}></span> Low</span>
            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#eab308', marginRight: '4px' }}></span> Medium</span>
            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', marginRight: '4px' }}></span> High</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span>Open-Meteo Air Quality (free)</span>
          </>
        )}
        {mode === 'traffic' && (
          <>
            <span>🗺️ OpenRouteService</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span>Double tap/right-click for route</span>
          </>
        )}
      </div>
    </div>
  )
}
