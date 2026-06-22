import { useState, useEffect } from 'react'
import { QUOTES } from './data/quotes.js'
import { AudioProvider } from './AudioContext.jsx'
import WeatherManTab from './WeatherManTab.jsx'

const QUOTE_CATEGORIES = ['All', 'Motivational', 'Success', 'Wisdom', 'Love']
const FACT_CATEGORIES = ['All', 'Science', 'History', 'Animals', 'Space']
const OPENWEATHER_KEY = "576b156966c5789a1b3fd0074c8469f1"

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
  const getAnimatedIcon = (code) => {
    if (code === 0 || code === 1) {
      return (
        <div className="weather-icon sunny-icon">
          <div className="sun">☀️</div>
          <div className="sun-rays"></div>
        </div>
      )
    }
    if (code >= 95) {
      return (
        <div className="weather-icon storm-icon">
          <div className="cloud">⛈️</div>
          <div className="lightning">⚡</div>
          <div className="rain-drop rain-1"></div>
          <div className="rain-drop rain-2"></div>
          <div className="rain-drop rain-3"></div>
        </div>
      )
    }
    if (code >= 51 && code <= 82) {
      return (
        <div className="weather-icon rainy-icon">
          <div className="cloud">🌧️</div>
          <div className="rain-drop rain-1"></div>
          <div className="rain-drop rain-2"></div>
          <div className="rain-drop rain-3"></div>
          <div className="rain-drop rain-4"></div>
        </div>
      )
    }
    if (code === 2) return <div className="weather-icon">🌤️</div>
    if (code === 3) return <div className="weather-icon">☁️</div>
    return <div className="weather-icon">⛅</div>
  }
  return getAnimatedIcon(code)
}

function AppContent() {
  const [tab, setTab] = useState('weather')
  const [weather, setWeather] = useState(null)
  const [aqi, setAqi] = useState(null)
  const [quoteOfDay, setQuoteOfDay] = useState(null)
  const [toast, setToast] = useState('')
  const [canRefresh, setCanRefresh] = useState(true)
  const [location, setLocation] = useState({ lat: 6.5244, lon: 3.3792, name: 'Lagos, Nigeria', country_code: 'NG' })
  const [locationPermission, setLocationPermission] = useState('prompt')
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showAirDropdown, setShowAirDropdown] = useState(false)
  const [citySearch, setCitySearch] = useState('')
  const [isManualLocation, setIsManualLocation] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [todayStats, setTodayStats] = useState({
    sunHours: 0,
    rainHours: 0,
    thunderHours: 0,
    maxRainProb: 0,
    rainPeriods: [],
    sunrise: '--:--',
    sunset: '--:--',
    feelsLike: 0,
    windGust: 0,
    pressureTrend: '→'
  })
  const [hasWelcomed, setHasWelcomed] = useState(false)

  useEffect(() => {
    fetch('https://hyezen.onrender.com/api/ping', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
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
      } catch {
        initLocation()
      }
    } else {
      initLocation()
    }
    fetchQuoteOfDay()
  }, [])

  useEffect(() => {
    if (!hasWelcomed && weather &&!isLoading) {
      setTimeout(() => showToast('Welcome to Zephye 👋'), 1000)
      setHasWelcomed(true)
    }
  }, [weather, isLoading, hasWelcomed])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const fetchQuoteOfDay = () => {
    const pool = getAllQuotesPool()
    const today = new Date().toISOString().split('T')[0]
    const baseDate = new Date('2024-01-01').getTime()
    const dayNumber = Math.floor((new Date(today).getTime() - baseDate) / 86400000)
    const index = dayNumber % pool.length
    setQuoteOfDay(pool[index])
  }

  const getPressureTrend = (hourly) => {
    if (!hourly?.pressure_msl || hourly.pressure_msl.length < 3) return '→'
    const last3 = hourly.pressure_msl.slice(0, 3)
    const avg = last3.reduce((a,b) => a+b, 0) / 3
    const current = hourly.pressure_msl[0]
    if (current > avg + 1) return '↑'
    if (current < avg - 1) return '↓'
    return '→'
  }

  const calculateTodayStats = (hourly, daily) => {
    if (!hourly?.time) return
    let sunHours = 0, rainHours = 0, thunderHours = 0, maxRainProb = 0
    let currentRainPeriod = null
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

    const sunrise = daily?.sunrise?.[0]? new Date(daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'
    const sunset = daily?.sunset?.[0]? new Date(daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'
    const feelsLike = hourly?.apparent_temperature?.[0] || 0
    const windGust = hourly?.wind_gusts_10m?.[0] || 0
    const pressureTrend = getPressureTrend(hourly)

    setTodayStats({ sunHours, rainHours, thunderHours, maxRainProb, rainPeriods, sunrise, sunset, feelsLike, windGust, pressureTrend })
  }

  const initLocation = async () => {
    if (!navigator.geolocation) {
      fetchWeatherData(6.5244, 3.3792)
      return
    }
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      setLocationPermission(permission.state)
      if (permission.state === 'granted' || permission.state === 'prompt') {
        getCurrentLocation()
      } else {
        fetchWeatherData(6.5244, 3.3792)
      }
    } catch {
      getCurrentLocation()
    }
  }

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        reverseGeocode(latitude, longitude)
        fetchWeatherData(latitude, longitude)
        setLocationPermission('granted')
        setIsManualLocation(false)
        localStorage.removeItem('zephye_location')
        localStorage.removeItem('zephye_isManual')
      },
      (err) => {
        setLocationPermission('denied')
        showToast('Location denied')
        fetchWeatherData(6.5244, 3.3792)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`, {
        headers: { 'User-Agent': 'Zephye-App/1.0' }
      })
      const data = await res.json()

      const lga = data.address.county?.replace(' Local Government Area','') ||
                  data.address.town ||
                  data.address.city ||
                  data.address.village ||
                  'Current Location'
      const state = data.address.state || 'State'
      const country = data.address.country || 'Country'
      const countryCode = data.address.country_code?.toUpperCase() || 'US'

      setLocation({ lat, lon, name: `${lga}, ${state}, ${country}`, country_code: countryCode })
      setIsManualLocation(false)
      localStorage.removeItem('zephye_location')
      localStorage.removeItem('zephye_isManual')
    } catch {
      setLocation({ lat, lon, name: 'Current Location', country_code: 'US' })
    }
  }

  const searchCity = async () => {
    if (!citySearch.trim()) {
      showToast('Type a place name')
      return
    }

    try {
      let res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(citySearch)}&count=5&language=en&format=json`)
      let data = await res.json()

      if (!data.results || data.results.length === 0) {
        const owRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(citySearch)}&limit=5&appid=${OPENWEATHER_KEY}`)
        const owData = await owRes.json()

        if (!owData || owData.length === 0) {
          showToast('Place not found')
          return
        }

        const { lat, lon, name, state, country } = owData[0]
        const displayName = `${name}${state? ', ' + state : ''}, ${country}`
        const countryCode = country?.slice(0,2)?.toUpperCase() || 'US'
        const newLocation = { lat, lon, name: displayName, country_code: countryCode }
        setLocation(newLocation)
        setIsManualLocation(true)
        localStorage.setItem('zephye_location', JSON.stringify(newLocation))
        localStorage.setItem('zephye_isManual', 'true')
        fetchWeatherData(lat, lon)
        setShowLocationModal(false)
        setCitySearch('')
        showToast(`Location: ${displayName}`)
        return
      }

      const { latitude: lat, longitude: lon, name, country, admin1, country_code } = data.results[0]
      const displayName = `${name}${admin1? ', ' + admin1 : ''}, ${country}`
      const newLocation = { lat, lon, name: displayName, country_code: country_code?.toUpperCase() || 'US' }
      setLocation(newLocation)
      setIsManualLocation(true)
      localStorage.setItem('zephye_location', JSON.stringify(newLocation))
      localStorage.setItem('zephye_isManual', 'true')
      fetchWeatherData(lat, lon)
      setShowLocationModal(false)
      setCitySearch('')
      showToast(`Location: ${name}`)

    } catch {
      showToast('Search failed. Check internet')
    }
  }

  const fetchWeatherData = async (lat, lon) => {
    try {
      setIsLoading(true)
      setCanRefresh(false)
      setTimeout(() => setCanRefresh(true), 30000)

      let weatherData, aqiData

      const [weatherRes, aqiRes] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current_weather=true&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,wind_gusts_10m,pressure_msl,winddirection,windspeed_10m` +
          `&daily=temperature_2m_max,temperature_2m_min,weathercode,uv_index_max,sunrise,sunset` +
          `&timezone=auto`
        ),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide`)
      ])

      if (weatherRes.ok) {
        const om = await weatherRes.json()
        const aqiJson = await aqiRes.json()

        weatherData = {
          timezone: om.timezone || 'UTC',
          current: {
            temperature_2m: om.current_weather?.temperature?? null,
            weather_code: om.current_weather?.weathercode?? 0,
            wind_speed_10m: om.current_weather?.windspeed?? 0,
            wind_direction_10m: om.current_weather?.winddirection?? 0,
            relative_humidity_2m: null,
            pressure_msl: null,
            visibility: null,
            uv_index: om.daily?.uv_index_max?.[0]?? 0
          },
          hourly: {
            time: om.hourly?.time?? [],
            temperature_2m: om.hourly?.temperature_2m?? [],
            weather_code: om.hourly?.weathercode?? [],
            precipitation_probability: om.hourly?.precipitation_probability?? [],
            precipitation: om.hourly?.precipitation?? [],
            apparent_temperature: om.hourly?.apparent_temperature?? [],
            wind_gusts_10m: om.hourly?.wind_gusts_10m?? [],
            pressure_msl: om.hourly?.pressure_msl?? [],
            wind_direction_10m: om.hourly?.winddirection?? [],
            wind_speed_10m: om.hourly?.windspeed_10m?? []
          },
          daily: {
            time: om.daily?.time?? [],
            temperature_2m_max: om.daily?.temperature_2m_max?? [],
            temperature_2m_min: om.daily?.temperature_2m_min?? [],
            weather_code: om.daily?.weathercode?? [],
            uv_index_max: om.daily?.uv_index_max?? [],
            sunrise: om.daily?.sunrise?? [],
            sunset: om.daily?.sunset?? []
          }
        }

        aqiData = aqiJson
      } else {
        showToast('Using OpenWeather backup...')
        const owRes = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_KEY}`)
        const ow = await owRes.json()

        weatherData = {
          timezone: ow.timezone || 'UTC',
          current: {
            temperature_2m: ow.current.temp,
            weather_code: ow.current.weather[0].id,
            wind_speed_10m: ow.current.wind_speed * 3.6,
            wind_direction_10m: ow.current.wind_deg,
            relative_humidity_2m: ow.current.humidity,
            pressure_msl: ow.current.pressure,
            visibility: ow.current.visibility,
            uv_index: ow.current.uvi
          },
          hourly: {
            time: ow.hourly.slice(0,24).map(h => new Date(h.dt * 1000).toISOString()),
            temperature_2m: ow.hourly.slice(0,24).map(h => h.temp),
            weather_code: ow.hourly.slice(0,24).map(h => h.weather[0].id),
            precipitation_probability: ow.hourly.slice(0,24).map(h => (h.pop || 0) * 100),
            precipitation: ow.hourly.slice(0,24).map(h => h.rain?.['1h'] || 0),
            apparent_temperature: ow.hourly.slice(0,24).map(h => h.feels_like),
            wind_gusts_10m: ow.hourly.slice(0,24).map(h => (h.wind_gust || 0) * 3.6),
            pressure_msl: ow.hourly.slice(0,24).map(h => h.pressure)
          },
          daily: {
            time: ow.daily.slice(0,7).map(d => new Date(d.dt * 1000).toISOString().split('T')[0]),
            temperature_2m_max: ow.daily.slice(0,7).map(d => d.temp.max),
            temperature_2m_min: ow.daily.slice(0,7).map(d => d.temp.min),
            weather_code: ow.daily.slice(0,7).map(d => d.weather[0].id),
            uv_index_max: ow.daily.slice(0,7).map(d => d.uvi),
            sunrise: ow.daily.slice(0,7).map(d => new Date(d.sunrise * 1000).toISOString()),
            sunset: ow.daily.slice(0,7).map(d => new Date(d.sunset * 1000).toISOString())
          }
        }
        aqiData = { current: { us_aqi: null } }
      }

      setWeather(weatherData)
      setAqi(aqiData.current)
      calculateTodayStats(weatherData.hourly, weatherData.daily)
      setIsLoading(false)
    } catch (err) {
      console.error('Weather error:', err)
      showToast('Weather failed. Try manual location')
      setIsLoading(false)
    }
  }

  const saveQuote = (quote) => {
    if (!quote) return
    const saved = JSON.parse(localStorage.getItem('zephye_saved_quotes') || '[]')
    const newQuote = {
      id: Date.now(),
      quote_text: quote.content || quote.text,
      quote_author: quote.author || 'Unknown',
      category: quote.tag || 'Motivational',
      created_at: new Date().toISOString()
    }
    saved.unshift(newQuote)
    localStorage.setItem('zephye_saved_quotes', JSON.stringify(saved))
    showToast('Quote saved')
  }

  const saveFact = (fact) => {
    if (!fact) return
    const saved = JSON.parse(localStorage.getItem('zephye_saved_facts') || '[]')
    const newFact = {
      id: Date.now(),
      fact_text: fact.text,
      created_at: new Date().toISOString()
    }
    saved.unshift(newFact)
    localStorage.setItem('zephye_saved_facts', JSON.stringify(saved))
    showToast('Fact saved')
  }

  const shareQuote = async (text, author) => {
    const shareText = `"${text}" - ${author}\n\nvia Zephye`
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
      } catch {}
    } else {
      navigator.clipboard.writeText(shareText)
      showToast('Copied to clipboard')
    }
  }

  const getWeatherClass = (code) => {
    if (code === 0 || code === 1) return 'sunny'
    if (code >= 95) return 'thunder'
    if (code >= 51 && code <= 82) return 'rainy'
    return 'cloudy'
  }

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️'
    if (code === 1) return '🌤️'
    if (code === 2) return '⛅'
    if (code === 3) return '☁️'
    if (code >= 95) return '⛈️'
    if (code >= 51) return '🌧️'
    return '☁️'
  }

  const getStormLevel = (code, wind) => {
    if (code >= 95) return { level: 'Severe Thunderstorm', color: '#dc2626', severity: 4 }
    if (code >= 65 || wind > 50) return { level: 'Heavy Storm', color: '#f97316', severity: 3 }
    if (code >= 61 || wind > 30) return { level: 'Moderate Rain', color: '#eab308', severity: 2 }
    if (code >= 51) return { level: 'Light Rain', color: '#22c55e', severity: 1 }
    return null
  }

  const getAqiLevel = (aqi) => {
    if (aqi == null) return { label: 'Unknown', color: '#6b7280', status: 'N/A', desc: 'No data available' }
    if (aqi <= 50) return { label: 'Good', color: '#22c55e', status: 'Safe to breathe', desc: 'Air quality is satisfactory. No health risk.' }
    if (aqi <= 100) return { label: 'Moderate', color: '#eab308', status: 'Acceptable', desc: 'Acceptable for most. Sensitive groups limit prolonged outdoor activity.' }
    if (aqi <= 150) return { label: 'Unhealthy', color: '#f97316', status: 'Caution', desc: 'Sensitive groups may experience effects. Everyone reduce prolonged exertion.' }
    return { label: 'Hazardous', color: '#ef4444', status: 'Not Safe', desc: 'Health alert. Everyone may experience serious health effects.' }
  }

  const getWindDirection = (deg) => {
    if (deg >= 337.5 || deg < 22.5) return 'N'
    if (deg >= 22.5 && deg < 67.5) return 'NE'
    if (deg >= 67.5 && deg < 112.5) return 'E'
    if (deg >= 112.5 && deg < 157.5) return 'SE'
    if (deg >= 157.5 && deg < 202.5) return 'S'
    if (deg >= 202.5 && deg < 247.5) return 'SW'
    if (deg >= 247.5 && deg < 292.5) return 'W'
    return 'NW'
  }

  const weatherCode = weather?.current?.weather_code?? 0
  const windSpeed = weather?.current?.wind_speed_10m?? 0
  const windDir = weather?.current?.wind_direction_10m?? 0
  const humidity = weather?.current?.relative_humidity_2m?? 0
  const pressure = weather?.current?.pressure_msl?? 0
  const visibility = weather?.current?.visibility?? 0
  const uvIndex = weather?.current?.uv_index?? weather?.daily?.uv_index_max?.[0]?? 0
  const bgClass = getWeatherClass(weatherCode)
  const aqiInfo = getAqiLevel(aqi?.us_aqi)
  const stormInfo = getStormLevel(weatherCode, windSpeed)

  if (isLoading &&!weather) {
    return (
      <div className="app">
        <div className="weather-bg cloudy"></div>
        <div className="container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
          <div className="glass" style={{padding: '40px', borderRadius: '20px', textAlign: 'center'}}>
            <div className="text-4xl mb-4">🌤️</div>
            <p className="text-xl font-bold">Loading Zephye...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className={`weather-bg ${bgClass}`}></div>
      {toast && <div className="toast">{toast}</div>}
      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="glass modal" onClick={e => e.stopPropagation()} style={{padding: '24px'}}>
            <h3 className="font-bold mb-4">Change Location</h3>
            <input
              type="text"
              placeholder="Type any city, LGA, country..."
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchCity()}
              className="mb-4 w-full"
              autoFocus
            />
            <p className="text-xs text-white/60 mb-3">Type "London", "Ifo LGA", "Tokyo" - any real place</p>
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={searchCity}>Search</button>
              <button className="btn-ghost text-xs" onClick={() => {
                setShowLocationModal(false)
                setCitySearch('')
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="container" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        {tab === 'weather' && (
          <>
            <div className="glass" style={{padding: '20px', borderRadius: '20px', position: 'relative', zIndex: 2}}>
              <div className="flex items-start justify-between mb-4">
                <button className="location-btn text-left" onClick={() => setShowLocationModal(true)}>
                  <div className="text-xs text-white/70 mb-1 flex items-center gap-1">
                    📍 Location
                  </div>
                  <div className="text-lg font-bold">{location.name}</div>
                  <div className="text-xs text-white/70 mt-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                </button>
                <div className="text-right">
                  <WeatherIcon code={weatherCode} />
                  <h1 className="text-3xl font-bold mt-1">{weather?.current? Math.round(weather.current.temperature_2m) : '--'}°</h1>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {stormInfo && (
                  <div className="status-badge" style={{background: stormInfo.color + '33', borderColor: stormInfo.color, color: stormInfo.color}}>
                    {stormInfo.level}
                  </div>
                )}
                {aqiInfo && (
                  <div style={{position: 'relative'}}>
                    <button className="status-badge" style={{background: aqiInfo.color + '33', borderColor: aqiInfo.color, color: aqiInfo.color, cursor: 'pointer'}} onClick={() => setShowAirDropdown(!showAirDropdown)}>
                      Air: {aqiInfo.label} ▼
                    </button>
                    {showAirDropdown && (
                      <div className="glass" style={{position: 'absolute', top: '110%', left: 0, minWidth: '300px', padding: '16px', zIndex: 999, borderRadius: '16px'}}>
                        <p className="font-bold mb-3">Weather Details</p>
                        <div className="flex justify-between mb-2 text-sm"><span className="text-white/70">AQI</span><span className="font-bold" style={{color: aqiInfo.color}}>{aqi?.us_aqi?? '--'}</span></div>
                        <div className="flex justify-between mb-2 text-sm"><span className="text-white/70">Wind</span><span className="font-bold">{Math.round(windSpeed)} km/h {getWindDirection(windDir)}</span></div>
                        <div className="flex justify-between mb-2 text-sm"><span className="text-white/70">Humidity</span><span className="font-bold">{humidity}%</span></div>
                        <div className="flex justify-between mb-2 text-sm"><span className="text-white/70">Pressure</span><span className="font-bold">{pressure} hPa</span></div>
                        <div className="flex justify-between mb-2 text-sm"><span className="text-white/70">Visibility</span><span className="font-bold">{(visibility/1000).toFixed(1)} km</span></div>
                        <div className="flex justify-between text-sm"><span className="text-white/70">UV Index</span><span className="font-bold">{uvIndex}</span></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <WeatherManTab
              weather={weather}
              location={location}
              todayStats={todayStats}
              aqi={aqi}
              quote={quoteOfDay}
              onRefresh={() => fetchWeatherData(location.lat, location.lon)}
            />

            <div className="glass" style={{padding: '20px', borderRadius: '20px', position: 'relative', zIndex: 1}}>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold">Quote of the Day</p>
                <div className="flex gap-2">
                  <button className="btn-share text-xs" onClick={() => shareQuote(quoteOfDay?.content, quoteOfDay?.author)}>Share</button>
                  <button className="btn-ghost text-xs" onClick={() => saveQuote(quoteOfDay)}>Save</button>
                </div>
              </div>
              <p className="font-bold mb-2">"{quoteOfDay?.content || 'Loading quote...'}"</p>
              <p className="text-xs text-white/70">- {quoteOfDay?.author || '...'}</p>
            </div>

            <div className="glass" style={{padding: '20px', borderRadius: '20px'}}>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold">Hourly Forecast</p>
                <button className="btn-ghost text-xs" onClick={() => fetchWeatherData(location.lat, location.lon)}>
                  Refresh
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{scrollSnapType: 'x mandatory'}}>
                {weather?.hourly?.time?.slice(0,24).map((time, i) => (
                  <div key={time} className="glass text-center p-3 rounded-2xl flex-shrink-0" style={{minWidth: '72px', scrollSnapAlign: 'start', background: 'rgba(255,255,255,0.05)'}}>
                    <p className="text-xs text-white/70">{new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</p>
                    <p className="text-2xl my-1">{getWeatherIcon(weather.hourly.weather_code[i])}</p>
                                        <p className="text-sm font-bold">{Math.round(weather.hourly.temperature_2m[i])}°</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass" style={{padding: '20px', borderRadius: '20px'}}>
              <p className="text-sm font-bold mb-3">7-Day Forecast</p>
              {weather?.daily?.time?.slice(0,7).map((day, i) => (
                <div key={day} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                  <span className="text-sm font-medium">{new Date(day).toLocaleDateString('en', {weekday: 'short'})}</span>
                  <span className="text-xl">{getWeatherIcon(weather.daily.weather_code[i])}</span>
                  <div className="flex gap-3 text-sm">
                    <span className="font-bold">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
                    <span className="text-white/50">{Math.round(weather.daily.temperature_2m_min[i])}°</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 'quotes' && <QuotesTab saveQuote={saveQuote} shareQuote={shareQuote} saveFact={saveFact} />}
        {tab === 'saved' && <SavedTab showToast={showToast} shareQuote={shareQuote} />}
        <div className="text-center mt-4 mb-4">
          <p className="text-sm text-muted">©️ hyesent.dev</p>
        </div>
      </div>
      <div className="bottom-nav">
        <button className={`nav-btn ${tab === 'weather'? 'active' : ''}`} onClick={() => setTab('weather')}>Weather</button>
        <button className={`nav-btn ${tab === 'quotes'? 'active' : ''}`} onClick={() => setTab('quotes')}>Quotes</button>
        <button className={`nav-btn ${tab ==='saved'? 'active' : ''}`} onClick={() => setTab('saved')}>Saved</button>
      </div>
    </div>
  )
}

function QuotesTab({ saveQuote, shareQuote, saveFact }) {
  const [quoteCategory, setQuoteCategory] = useState('All')
  const [factCategory, setFactCategory] = useState('All')
  const [currentQuote, setCurrentQuote] = useState(null)
  const [currentFact, setCurrentFact] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState(0)

  useEffect(() => {
    fetchQuote()
    fetchFact()
  }, [])

  useEffect(() => {
    fetchQuote()
  }, [quoteCategory])

  useEffect(() => {
    fetchFact()
  }, [factCategory])

  const fetchQuote = () => {
    const now = Date.now()
    if (now - lastFetch < 5000) return
    setLastFetch(now)
    setLoading(true)
    let pool = []
    if (quoteCategory === 'All') {
      pool = getAllQuotesPool()
    } else {
      pool = QUOTES[quoteCategory]?.map(q => ({...q, tag: quoteCategory})) || []
    }
    const random = pool[Math.floor(Math.random() * pool.length)]
    setCurrentQuote(random)
    setLoading(false)
  }

  const fetchFact = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
      if (!res.ok) throw new Error('API 1 failed')
      const data = await res.json()
      setCurrentFact({ text: data.text })
    } catch {
      try {
        const res2 = await fetch('https://numbersapi.com/random/trivia?json')
        if (!res2.ok) throw new Error('API 2 failed')
        const data2 = await res2.json()
        setCurrentFact({ text: data2.text })
      } catch {
        let pool = []
        if (factCategory === 'All') {
          Object.values(LOCAL_FACTS).forEach(arr => pool.push(...arr))
        } else {
          pool = LOCAL_FACTS[factCategory] || LOCAL_FACTS.Science
        }
        const random = pool[Math.floor(Math.random() * pool.length)]
        setCurrentFact(random)
      }
    }
    setLoading(false)
  }

  return (
    <>
      <div className="glass mb-4" style={{padding: '20px', borderRadius: '20px'}}>
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold">Explore Quotes</p>
          <button className="btn-primary text-sm" onClick={fetchQuote} disabled={loading}>
            {loading? 'Loading...' : 'New Quote'}
          </button>
        </div>
        <div className="sub-tabs mb-4">
          {QUOTE_CATEGORIES.map(cat => (
            <button key={cat} className={`sub-tab ${quoteCategory === cat? 'active' : ''}`} onClick={() => setQuoteCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
        {currentQuote && (
          <div className="list-item">
            <p className="font-bold mb-4">"{currentQuote.content}"</p>
            <p className="text-sm text-muted mb-4">- {currentQuote.author}</p>
            <div className="flex gap-2">
              <button className="btn-share text-sm" onClick={() => shareQuote(currentQuote.content, currentQuote.author)}>Share</button>
              <button className="btn-ghost text-sm" onClick={() => saveQuote(currentQuote)}>Save</button>
            </div>
          </div>
        )}
      </div>
      <div className="glass mb-4" style={{padding: '20px', borderRadius: '20px'}}>
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold">Did You Know?</p>
          <button className="btn-primary text-sm" onClick={fetchFact} disabled={loading}>
            {loading? 'Loading...' : 'New Fact'}
          </button>
        </div>
        <div className="sub-tabs mb-4">
          {FACT_CATEGORIES.map(cat => (
            <button key={cat} className={`sub-tab ${factCategory === cat? 'active' : ''}`} onClick={() => setFactCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
        {currentFact && (
          <div className="list-item">
            <p className="font-bold mb-4">{currentFact.text}</p>
            <div className="flex gap-2">
              <button className="btn-share text-sm" onClick={() => shareQuote(currentFact.text, 'Fact')}>Share</button>
              <button className="btn-ghost text-sm" onClick={() => saveFact(currentFact)}>Save</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function SavedTab({ showToast, shareQuote }) {
  const [savedQuotes, setSavedQuotes] = useState([])
  const [savedFacts, setSavedFacts] = useState([])
  const [activeSubTab, setActiveSubTab] = useState('quotes')

  useEffect(() => {
    loadSaved()
  }, [])

  const loadSaved = () => {
    const quotes = JSON.parse(localStorage.getItem('zephye_saved_quotes') || '[]')
    const facts = JSON.parse(localStorage.getItem('zephye_saved_facts') || '[]')
    setSavedQuotes(quotes)
    setSavedFacts(facts)
  }

  const deleteQuote = (id) => {
    const updated = savedQuotes.filter(q => q.id!== id)
    localStorage.setItem('zephye_saved_quotes', JSON.stringify(updated))
    setSavedQuotes(updated)
    showToast('Quote deleted')
  }

  const deleteFact = (id) => {
    const updated = savedFacts.filter(f => f.id!== id)
    localStorage.setItem('zephye_saved_facts', JSON.stringify(updated))
    setSavedFacts(updated)
    showToast('Fact deleted')
  }

  return (
    <div className="glass" style={{padding: '20px', borderRadius: '20px'}}>
      <div className="sub-tabs mb-4">
        <button className={`sub-tab ${activeSubTab === 'quotes'? 'active' : ''}`} onClick={() => setActiveSubTab('quotes')}>
          Quotes ({savedQuotes.length})
        </button>
        <button className={`sub-tab ${activeSubTab === 'facts'? 'active' : ''}`} onClick={() => setActiveSubTab('facts')}>
          Facts ({savedFacts.length})
        </button>
      </div>
      {activeSubTab === 'quotes' && (
        savedQuotes.length === 0? (
          <p className="text-center text-muted py-8">No saved quotes yet. Save some!</p>
        ) : (
          savedQuotes.map(quote => (
            <div key={quote.id} className="list-item">
              <p className="font-bold mb-2">"{quote.quote_text}"</p>
              <p className="text-sm text-muted mb-3">- {quote.quote_author}</p>
              <div className="flex gap-2">
                <button className="btn-share text-xs" onClick={() => shareQuote(quote.quote_text, quote.quote_author)}>Share</button>
                <button className="btn-ghost text-xs" onClick={() => deleteQuote(quote.id)}>Delete</button>
              </div>
            </div>
          ))
        )
      )}
      {activeSubTab === 'facts' && (
        savedFacts.length === 0? (
          <p className="text-center text-muted py-8">No saved facts yet. Save some!</p>
        ) : (
          savedFacts.map(fact => (
            <div key={fact.id} className="list-item">
              <p className="font-bold mb-3">{fact.fact_text}</p>
              <div className="flex gap-2">
                <button className="btn-share text-xs" onClick={() => shareQuote(fact.fact_text, 'Fact')}>Share</button>
                <button className="btn-ghost text-xs" onClick={() => deleteFact(fact.id)}>Delete</button>
              </div>
            </div>
          ))
        )
      )}
    </div>
  )
}

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  )
                                                        }                    <p className="text-sm font-bold">{Math.round(weather.hourly.temperature_2m[i])}°</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass" style={{padding: '20px', borderRadius: '20px'}}>
              <p className="text-sm font-bold mb-3">7-Day Forecast</p>
              {weather?.daily?.time?.slice(0,7).map((day, i) => (
                <div key={day} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                  <span className="text-sm font-medium">{new Date(day).toLocaleDateString('en', {weekday: 'short'})}</span>
                  <span className="text-xl">{getWeatherIcon(weather.daily.weather_code[i])}</span>
                  <div className="flex gap-3 text-sm">
                    <span className="font-bold">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
                    <span className="text-white/50">{Math.round(weather.daily.temperature_2m_min[i])}°</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 'quotes' && <QuotesTab saveQuote={saveQuote} shareQuote={shareQuote} saveFact={saveFact} />}
        {tab === 'saved' && <SavedTab showToast={showToast} shareQuote={shareQuote} />}
        <div className="text-center mt-4 mb-4">
          <p className="text-sm text-muted">©️ hyesent.dev</p>
        </div>
      </div>
      <div className="bottom-nav">
        <button className={`nav-btn ${tab === 'weather'? 'active' : ''}`} onClick={() => setTab('weather')}>Weather</button>
        <button className={`nav-btn ${tab === 'quotes'? 'active' : ''}`} onClick={() => setTab('quotes')}>Quotes</button>
        <button className={`nav-btn ${tab ==='saved'? 'active' : ''}`} onClick={() => setTab('saved')}>Saved</button>
      </div>
    </div>
  )
}

function QuotesTab({ saveQuote, shareQuote, saveFact }) {
  const [quoteCategory, setQuoteCategory] = useState('All')
  const [factCategory, setFactCategory] = useState('All')
  const [currentQuote, setCurrentQuote] = useState(null)
  const [currentFact, setCurrentFact] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState(0)

  useEffect(() => {
    fetchQuote()
    fetchFact()
  }, [])

  useEffect(() => {
    fetchQuote()
  }, [quoteCategory])

  useEffect(() => {
    fetchFact()
  }, [factCategory])

  const fetchQuote = () => {
    const now = Date.now()
    if (now - lastFetch < 5000) return
    setLastFetch(now)
    setLoading(true)
    let pool = []
    if (quoteCategory === 'All') {
      pool = getAllQuotesPool()
    } else {
      pool = QUOTES[quoteCategory]?.map(q => ({...q, tag: quoteCategory})) || []
    }
    const random = pool[Math.floor(Math.random() * pool.length)]
    setCurrentQuote(random)
    setLoading(false)
  }

  const fetchFact = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
      if (!res.ok) throw new Error('API 1 failed')
      const data = await res.json()
      setCurrentFact({ text: data.text })
    } catch {
      try {
        const res2 = await fetch('https://numbersapi.com/random/trivia?json')
        if (!res2.ok) throw new Error('API 2 failed')
        const data2 = await res2.json()
        setCurrentFact({ text: data2.text })
      } catch {
        let pool = []
        if (factCategory === 'All') {
          Object.values(LOCAL_FACTS).forEach(arr => pool.push(...arr))
        } else {
          pool = LOCAL_FACTS[factCategory] || LOCAL_FACTS.Science
        }
        const random = pool[Math.floor(Math.random() * pool.length)]
        setCurrentFact(random)
      }
    }
    setLoading(false)
  }

  return (
    <>
      <div className="glass mb-4" style={{padding: '20px', borderRadius: '20px'}}>
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold">Explore Quotes</p>
          <button className="btn-primary text-sm" onClick={fetchQuote} disabled={loading}>
            {loading? 'Loading...' : 'New Quote'}
          </button>
        </div>
        <div className="sub-tabs mb-4">
          {QUOTE_CATEGORIES.map(cat => (
            <button key={cat} className={`sub-tab ${quoteCategory === cat? 'active' : ''}`} onClick={() => setQuoteCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
        {currentQuote && (
          <div className="list-item">
            <p className="font-bold mb-4">"{currentQuote.content}"</p>
            <p className="text-sm text-muted mb-4">- {currentQuote.author}</p>
            <div className="flex gap-2">
              <button className="btn-share text-sm" onClick={() => shareQuote(currentQuote.content, currentQuote.author)}>Share</button>
              <button className="btn-ghost text-sm" onClick={() => saveQuote(currentQuote)}>Save</button>
            </div>
          </div>
        )}
      </div>
      <div className="glass mb-4" style={{padding: '20px', borderRadius: '20px'}}>
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold">Did You Know?</p>
          <button className="btn-primary text-sm" onClick={fetchFact} disabled={loading}>
            {loading? 'Loading...' : 'New Fact'}
          </button>
        </div>
        <div className="sub-tabs mb-4">
          {FACT_CATEGORIES.map(cat => (
            <button key={cat} className={`sub-tab ${factCategory === cat? 'active' : ''}`} onClick={() => setFactCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
        {currentFact && (
          <div className="list-item">
            <p className="font-bold mb-4">{currentFact.text}</p>
            <div className="flex gap-2">
              <button className="btn-share text-sm" onClick={() => shareQuote(currentFact.text, 'Fact')}>Share</button>
              <button className="btn-ghost text-sm" onClick={() => saveFact(currentFact)}>Save</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function SavedTab({ showToast, shareQuote }) {
  const [savedQuotes, setSavedQuotes] = useState([])
  const [savedFacts, setSavedFacts] = useState([])
  const [activeSubTab, setActiveSubTab] = useState('quotes')

  useEffect(() => {
    loadSaved()
  }, [])

  const loadSaved = () => {
    const quotes = JSON.parse(localStorage.getItem('zephye_saved_quotes') || '[]')
    const facts = JSON.parse(localStorage.getItem('zephye_saved_facts') || '[]')
    setSavedQuotes(quotes)
    setSavedFacts(facts)
  }

  const deleteQuote = (id) => {
    const updated = savedQuotes.filter(q => q.id!== id)
    localStorage.setItem('zephye_saved_quotes', JSON.stringify(updated))
    setSavedQuotes(updated)
    showToast('Quote deleted')
  }

  const deleteFact = (id) => {
    const updated = savedFacts.filter(f => f.id!== id)
    localStorage.setItem('zephye_saved_facts', JSON.stringify(updated))
    setSavedFacts(updated)
    showToast('Fact deleted')
  }

  return (
    <div className="glass" style={{padding: '20px', borderRadius: '20px'}}>
      <div className="sub-tabs mb-4">
        <button className={`sub-tab ${activeSubTab === 'quotes'? 'active' : ''}`} onClick={() => setActiveSubTab('quotes')}>
          Quotes ({savedQuotes.length})
        </button>
        <button className={`sub-tab ${activeSubTab === 'facts'? 'active' : ''}`} onClick={() => setActiveSubTab('facts')}>
          Facts ({savedFacts.length})
        </button>
      </div>
      {activeSubTab === 'quotes' && (
        savedQuotes.length === 0? (
          <p className="text-center text-muted py-8">No saved quotes yet. Save some!</p>
        ) : (
          savedQuotes.map(quote => (
            <div key={quote.id} className="list-item">
              <p className="font-bold mb-2">"{quote.quote_text}"</p>
              <p className="text-sm text-muted mb-3">- {quote.quote_author}</p>
              <div className="flex gap-2">
                <button className="btn-share text-xs" onClick={() => shareQuote(quote.quote_text, quote.quote_author)}>Share</button>
                <button className="btn-ghost text-xs" onClick={() => deleteQuote(quote.id)}>Delete</button>
              </div>
            </div>
          ))
        )
      )}
      {activeSubTab === 'facts' && (
        savedFacts.length === 0? (
          <p className="text-center text-muted py-8">No saved facts yet. Save some!</p>
        ) : (
          savedFacts.map(fact => (
            <div key={fact.id} className="list-item">
              <p className="font-bold mb-3">{fact.fact_text}</p>
              <div className="flex gap-2">
                <button className="btn-share text-xs" onClick={() => shareQuote(fact.fact_text, 'Fact')}>Share</button>
                <button className="btn-ghost text-xs" onClick={() => deleteFact(fact.id)}>Delete</button>
              </div>
            </div>
          ))
        )
      )}
    </div>
  )
}

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  )
}
