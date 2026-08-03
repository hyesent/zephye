import { useState, useEffect, useRef, useCallback } from 'react'

// ============================================================================
// CONSTANTS
// ============================================================================

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

// Weather maps
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
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('zephye_map_location')
      if (saved) {
        const parsed = JSON.parse(saved)
        const exists = SUPPORTED_COUNTRIES.find(c => c.code === parsed.code)
        if (exists && parsed.lat && parsed.lon) {
          return parsed
        }
      }
    } catch {}
    return DEFAULT_LOCATION
  })

  // ─── Refs ──────────────────────────────────────────────────────────────────

  const mapRef = useRef(null)
  const markersRef = useRef([])
  const overlayRef = useRef(null)
  const mapContainerRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const abortControllerRef = useRef(null)
  const isMapInitializedRef = useRef(false)

  // ─── Effects ──────────────────────────────────────────────────────────────

  // Save location to localStorage
  useEffect(() => {
    if (selectedLocation?.lat && selectedLocation?.lon) {
      localStorage.setItem(
        'zephye_map_location',
        JSON.stringify({
          code: selectedLocation.code,
          name: selectedLocation.name,
          lat: selectedLocation.lat,
          lon: selectedLocation.lon,
          flag: selectedLocation.flag
        })
      )
    }
  }, [selectedLocation])

  // Fetch data when location or mode changes
  useEffect(() => {
    if (selectedLocation?.lat && selectedLocation?.lon && mapLoaded) {
      fetchMapData(selectedLocation.lat, selectedLocation.lon)
    }
  }, [selectedLocation, mode, mapLoaded])

  // Initialize map
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

    // Handle click on map to show weather at clicked location
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng
      // Fetch weather for clicked location
      const clickedData = await fetchWeatherForLocation(lat, lng)
      if (clickedData) {
        // Show popup with weather info
        const popupContent = createWeatherPopup(clickedData)
        L.popup()
          .setLatLng([lat, lng])
          .setContent(popupContent)
          .openOn(map)
      }
    })

    mapRef.current = map
    setMapLoaded(true)

    fetchMapData(lat, lon)
  }

  // ─── Fetch Weather for Clicked Location ─────────────────────────────────

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
        padding: 14px 18px;
        border-radius: 16px;
        color: #f8fafc;
        font-family: 'Poppins', sans-serif;
        min-width: 120px;
        text-align: center;
      ">
        <div style="font-size: 32px;">${emoji}</div>
        <div style="font-size: 20px; font-weight: 700;">${temp}°C</div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.5);">${name}</div>
        <div style="font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 4px;">
          ⬆ ${high}° ⬇ ${low}°
        </div>
      </div>
    `
  }

  // ─── Data Fetching ────────────────────────────────────────────────────────

  const fetchMapData = async (lat, lon) => {
    if (!lat || !lon) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsLoadingData(true)

    try {
      let data = {}

      if (mode === 'pollen') {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=pollen&timezone=auto`,
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

    setIsLoadingData(false)
  }

  // ─── Update Map ───────────────────────────────────────────────────────────

  const updateMap = (data) => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    const lat = selectedLocation?.lat ?? DEFAULT_LOCATION.lat
    const lon = selectedLocation?.lon ?? DEFAULT_LOCATION.lon

    // Clear all markers
    markersRef.current.forEach(m => {
      try { map.removeLayer(m) } catch {}
    })
    markersRef.current = []

    if (overlayRef.current) {
      try { map.removeLayer(overlayRef.current) } catch {}
      overlayRef.current = null
    }

    // ─── Home Marker ──────────────────────────────────────────────────────

    const homeIcon = L.divIcon({
      className: 'home-marker',
      html: `
        <div style="
          background: rgba(56, 189, 248, 0.12);
          backdrop-filter: blur(12px);
          padding: 10px 16px;
          border-radius: 14px;
          border: 1px solid rgba(56, 189, 248, 0.25);
          box-shadow: 0 4px 24px rgba(56, 189, 248, 0.15);
          display: flex;
          align-items: center;
          gap: 10px;
          color: #f8fafc;
          font-size: 13px;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/>
          </svg>
          <div>
            <div style="font-weight: 600; font-size: 14px;">${selectedLocation?.name || 'Location'}</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.4);">${selectedLocation?.flag || '📍'} ${selectedLocation?.code || ''}</div>
          </div>
        </div>
      `,
      iconSize: [200, 48],
      iconAnchor: [100, 24]
    })

    const homeMarker = L.marker([lat, lon], { icon: homeIcon })
    markersRef.current.push(homeMarker)
    map.addLayer(homeMarker)

    // ─── Mode-specific overlay ────────────────────────────────────────────

    if (mode === 'weather' && data?.current_weather) {
      renderWeatherOverlay(map, data, lat, lon)
    } else if (mode === 'weather' && !data?.current_weather) {
      // Show loading or error state
      const loadingIcon = L.divIcon({
        className: 'loading-marker',
        html: `
          <div style="
            background: rgba(15,23,42,0.85);
            backdrop-filter: blur(16px);
            padding: 12px 18px;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,0.06);
            color: rgba(255,255,255,0.5);
            font-size: 13px;
          ">
            ⏳ Loading weather...
          </div>
        `,
        iconSize: [160, 40],
        iconAnchor: [80, 20]
      })
      const loadingMarker = L.marker([lat + 0.12, lon + 0.12], { icon: loadingIcon })
      markersRef.current.push(loadingMarker)
      map.addLayer(loadingMarker)
    }

    if (mode === 'pollen' && data?.daily?.pollen) {
      renderPollenOverlay(map, data, lat, lon)
    } else if (mode === 'pollen' && !data?.daily?.pollen) {
      // Show loading state
      const loadingIcon = L.divIcon({
        className: 'loading-marker',
        html: `
          <div style="
            background: rgba(15,23,42,0.85);
            backdrop-filter: blur(16px);
            padding: 12px 18px;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,0.06);
            color: rgba(255,255,255,0.5);
            font-size: 13px;
          ">
            ⏳ Loading pollen data...
          </div>
        `,
        iconSize: [170, 40],
        iconAnchor: [85, 20]
      })
      const loadingMarker = L.marker([lat + 0.12, lon + 0.12], { icon: loadingIcon })
      markersRef.current.push(loadingMarker)
      map.addLayer(loadingMarker)
    }

    if (mode === 'traffic') {
      renderTrafficOverlay(map, lat, lon)
    }

    // Zoom to fit
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
          background: rgba(15,23,42,0.88);
          backdrop-filter: blur(16px);
          padding: 14px 18px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          text-align: center;
          min-width: 100px;
        ">
          <div style="font-size: 38px; margin-bottom: 2px;">${emoji}</div>
          <div style="font-size: 26px; font-weight: 700; color: #f8fafc;">${temp}°C</div>
          <div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 2px;">${name}</div>
          <div style="font-size: 10px; color: rgba(255,255,255,0.2); margin-top: 4px;">Tap map for more</div>
        </div>
      `,
      iconSize: [130, 120],
      iconAnchor: [65, 60]
    })

    const marker = L.marker([lat + 0.12, lon + 0.12], { icon: weatherIcon })
    markersRef.current.push(marker)
    map.addLayer(marker)

    // Daily details
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
              background: rgba(15,23,42,0.7);
              backdrop-filter: blur(8px);
              padding: 4px 12px;
              border-radius: 10px;
              border: 1px solid rgba(255,255,255,0.05);
              font-size: 11px;
              color: rgba(255,255,255,0.6);
            ">
              ${details}
            </div>
          `,
          iconSize: [150, 26],
          iconAnchor: [75, 13]
        })

        const detailMarker = L.marker([lat - 0.12, lon - 0.08], { icon: detailIcon })
        markersRef.current.push(detailMarker)
        map.addLayer(detailMarker)
      }
    }
  }

  // ─── Pollen Overlay (Heatmap Style) ────────────────────────────────────

  const renderPollenOverlay = (map, data, lat, lon) => {
    const pollen = data.daily.pollen
    const types = ['alder', 'birch', 'grass', 'mugwort', 'ragweed', 'tree']
    const colors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#dc2626']
    const labels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High', 'Extreme']

    // Calculate total pollen for heatmap intensity
    const totalPollen = types.reduce((sum, t) => sum + (pollen[t]?.[0] || 0), 0)
    const avgPollen = Math.round(totalPollen / types.length)

    // Create heatmap-style circles
    types.forEach((type, i) => {
      const value = pollen[type]?.[0] || 0
      const idx = Math.min(Math.floor(value / 2), colors.length - 1)
      const color = colors[idx] || colors[0]
      const label = labels[idx] || labels[0]

      // Radius based on pollen count (heatmap effect)
      const radius = 20000 + value * 5000

      const circle = L.circle(
        [lat + (i - 2.5) * 0.15, lon + ((i % 3) - 1) * 0.2],
        {
          radius: radius,
          color: color,
          fillColor: color,
          fillOpacity: 0.25 + (value / 10) * 0.4, // Heatmap opacity
          weight: 2,
          opacity: 0.6,
          className: 'pollen-circle'
        }
      )

      circle.bindPopup(`
        <div style="
          font-size: 13px;
          color: #1a1a2e;
          font-weight: 500;
          padding: 4px;
        ">
          <strong>${type.charAt(0).toUpperCase() + type.slice(1)} Pollen</strong><br>
          Level: <span style="color: ${color}; font-weight: 700;">${label}</span><br>
          Count: ${value}/10
        </div>
      `)

      markersRef.current.push(circle)
      map.addLayer(circle)
    })

    // Add a heatmap legend
    const legendIcon = L.divIcon({
      className: 'pollen-legend',
      html: `
        <div style="
          background: rgba(15,23,42,0.88);
          backdrop-filter: blur(16px);
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          text-align: center;
          min-width: 120px;
        ">
          <div style="font-size: 13px; font-weight: 600; color: #f8fafc; margin-bottom: 6px;">🌿 Pollen Heatmap</div>
          <div style="display: flex; justify-content: center; gap: 8px; font-size: 10px; color: rgba(255,255,255,0.5);">
            <span><span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #22c55e; margin-right: 2px;"></span> Low</span>
            <span><span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #eab308; margin-right: 2px;"></span> Med</span>
            <span><span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #ef4444; margin-right: 2px;"></span> High</span>
          </div>
          <div style="font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 4px;">
            Avg: ${avgPollen}/10 · ${selectedLocation?.name || 'Location'}
          </div>
        </div>
      `,
      iconSize: [160, 80],
      iconAnchor: [80, 40]
    })

    const legendMarker = L.marker([lat + 0.25, lon - 0.1], { icon: legendIcon })
    markersRef.current.push(legendMarker)
    map.addLayer(legendMarker)
  }

  // ─── Traffic Overlay ─────────────────────────────────────────────────────

  const renderTrafficOverlay = (map, lat, lon) => {
    // TomTom traffic tiles (free tier — replace key)
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

    const trafficIcon = L.divIcon({
      className: 'traffic-info',
      html: `
        <div style="
          background: rgba(15,23,42,0.85);
          backdrop-filter: blur(16px);
          padding: 10px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          text-align: center;
        ">
          <div style="font-size: 13px; font-weight: 600; color: #f8fafc;">🚦 Traffic Layer</div>
          <div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px;">
            ${selectedLocation?.name || 'Location'} · Real-time
          </div>
          <div style="font-size: 9px; color: rgba(255,255,255,0.2); margin-top: 4px;">
            Data: TomTom
          </div>
        </div>
      `,
      iconSize: [160, 65],
      iconAnchor: [80, 32]
    })

    const trafficMarker = L.marker([lat + 0.08, lon + 0.08], { icon: trafficIcon })
    markersRef.current.push(trafficMarker)
    map.addLayer(trafficMarker)
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
      {/* Header */}
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
        {/* Capsule Switch */}
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
              {m === 'weather' ? '⛅ Weather' : m === 'pollen' ? '🌿 Pollen' : '🚦 Traffic'}
            </button>
          ))}
        </div>

        {/* Search - with higher z-index so dropdown appears above map */}
        <div style={{
          position: 'relative',
          flex: 1,
          maxWidth: '320px',
          minWidth: '160px',
          zIndex: 100 // Ensure search appears above map
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
              zIndex: 1000, // High z-index to appear above everything
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

      {/* Map */}
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

      {/* Legend */}
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
            <span>Tap map for weather at any location</span>
          </>
        )}
        {mode === 'pollen' && (
          <>
            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', marginRight: '4px' }}></span> Low</span>
            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#eab308', marginRight: '4px' }}></span> Medium</span>
            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', marginRight: '4px' }}></span> High</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span>Heatmap intensity = pollen count</span>
          </>
        )}
        {mode === 'traffic' && (
          <>
            <span>🚦 TomTom Traffic</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span>Real-time flow</span>
          </>
        )}
      </div>
    </div>
  )
}
