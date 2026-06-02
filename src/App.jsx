import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

const QUOTE_CATEGORIES = ['All', 'Motivational', 'Success', 'Wisdom', 'Love']
const FACT_CATEGORIES = ['All', 'Science', 'History', 'Animals', 'Space']

// 900 QUOTES TOTAL - PASTE YOUR FULL QUOTES OBJECT HERE
export const QUOTES = {
  Motivational: [
    { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { content: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { content: "Act as if what you do makes a difference. It does.", author: "William James" },
    //... add your 200 motivational quotes here
  ],
  Success: [
    { content: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
    { content: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
    //... add your 100 success quotes here
  ],
  Wisdom: [
    { content: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
    { content: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
    //... add your 200 wisdom quotes here
  ],
  Love: [
    { content: "You know you're in love when you can't fall asleep because reality is finally better than your dreams.", author: "Dr. Seuss" },
    { content: "Love is composed of a single soul inhabiting two bodies.", author: "Aristotle" },
    //... add your 100 romantic quotes here
  ],
}

// Helper: flatten all quotes into one array with category tags
const getAllQuotesPool = () => {
  const pool = []
  Object.entries(QUOTES).forEach(([category, quotes]) => {
    quotes.forEach(q => pool.push({...q, tag: category }))
  })
  return pool
}

// Helper: shuffle array
const shuffleArray = (arr) => {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
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

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('weather')
  const [weather, setWeather] = useState(null)
  const [aqi, setAqi] = useState(null)
  const [quoteOfDay, setQuoteOfDay] = useState(null)
  const [toast, setToast] = useState('')
  const [canRefresh, setCanRefresh] = useState(true)
  const [location, setLocation] = useState({ lat: 6.5244, lon: 3.3792, name: 'Lagos, NG' })
  const [locationPermission, setLocationPermission] = useState('prompt')
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showAirDropdown, setShowAirDropdown] = useState(false)
  const [citySearch, setCitySearch] = useState('')
  const [hasFetched, setHasFetched] = useState(false)
  const [isManualLocation, setIsManualLocation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
      if (session) showToast('Welcome to Zephye')
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session &&!hasFetched) {
      const savedLoc = localStorage.getItem('zephye_location')
      const savedManual = localStorage.getItem('zephye_isManual')

      if (savedLoc && savedManual === 'true') {
        try {
          const loc = JSON.parse(savedLoc)
          setLocation(loc)
          setIsManualLocation(true)
          fetchWeatherData(loc.lat, loc.lon)
          setHasFetched(true)
        } catch {
          initLocation()
        }
      } else {
        initLocation()
      }
      fetchQuoteOfDay()
    }
  // eslint-disable-next-line
  }, [session, hasFetched])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  // FIXED: Safe localStorage + crash protection
  const fetchQuoteOfDay = () => {
    const today = new Date().toISOString().split('T')[0]
    const storageKey = 'zephye_qotd_data'
    const pool = getAllQuotesPool()

    let data = { date: '', usedIndices: [], shuffledOrder: [] }

    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) data = JSON.parse(saved)
    } catch (e) {
      console.log('Corrupted QOTD data, resetting...')
    }

    if (data.date!== today || data.usedIndices.length >= pool.length) {
      data = {
        date: today,
        usedIndices: [],
        shuffledOrder: shuffleArray([...Array(pool.length).keys()])
      }
    }

    const nextIndex = data.shuffledOrder[data.usedIndices.length]
    const quote = pool[nextIndex]

    data.usedIndices.push(nextIndex)
    localStorage.setItem(storageKey, JSON.stringify(data))

    setQuoteOfDay(quote)
  }

  const initLocation = async () => {
    if (isManualLocation) {
      fetchWeatherData(location.lat, location.lon)
      setHasFetched(true)
      return
    }

    if (!navigator.geolocation) {
      fetchWeatherData(6.5244, 3.3792)
      setHasFetched(true)
      return
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      setLocationPermission(permission.state)
      if (permission.state === 'granted' || permission.state === 'prompt') {
        getCurrentLocation()
      } else {
        fetchWeatherData(6.5244, 3.3792)
        setHasFetched(true)
      }
    } catch {
      getCurrentLocation()
    }
  }

  const getCurrentLocation = () => {
    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        reverseGeocode(latitude, longitude)
        fetchWeatherData(latitude, longitude)
        setLocationPermission('granted')
        setIsManualLocation(false)
        localStorage.removeItem('zephye_location')
        localStorage.removeItem('zephye_isManual')
        setIsLoading(false)
        showToast('Location updated')
      },
      (err) => {
        setIsLoading(false)
        setLocationPermission('denied')
        showToast('Location denied')
        fetchWeatherData(6.5244, 3.3792)
        setHasFetched(true)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
      const data = await res.json()
      const name = data.city || data.locality || data.principalSubdivision || 'Current Location'
      const country = data.countryCode? `, ${data.countryCode}` : ''
      setLocation({ lat, lon, name: name + country })
    } catch {
      setLocation({ lat, lon, name: 'Current Location' })
    }
  }

  const searchCity = async () => {
    if (!citySearch.trim()) return
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(citySearch)}&count=5&language=en&format=json`)
      const data = await res.json()
      if (data.results?.[0]) {
        const { latitude: lat, longitude: lon, name, country, admin1 } = data.results[0]
        const displayName = `${name}${admin1? ', ' + admin1 : ''}, ${country}`
        const newLocation = { lat, lon, name: displayName }

        setLocation(newLocation)
        setIsManualLocation(true)
        localStorage.setItem('zephye_location', JSON.stringify(newLocation))
        localStorage.setItem('zephye_isManual', 'true')

        fetchWeatherData(lat, lon)
        setShowLocationModal(false)
        setCitySearch('')
        showToast(`Location: ${name}`)
      } else {
        showToast('City not found')
      }
    } catch {
      showToast('Search failed')
    }
  }

  const fetchWeatherData = async (lat, lon) => {
    if (!canRefresh) {
      showToast('Wait 30s before refreshing')
      return
    }

    try {
      setCanRefresh(false)
      setTimeout(() => setCanRefresh(true), 30000)

      const [weatherRes, aqiRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,pressure_msl,visibility,uv_index&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide`)
      ])

      if (!weatherRes.ok) throw new Error('Weather failed')
      const weatherData = await weatherRes.json()
      const aqiData = await aqiRes.json()
      setWeather(weatherData)
      setAqi(aqiData.current)
    } catch (err) {
      console.error(err)
      setWeather({
        current: { temperature_2m: 28, weather_code: 0, wind_speed_10m: 8, wind_direction_10m: 180, relative_humidity_2m: 75, pressure_msl: 1013, visibility: 10000, uv_index: 8 },
        hourly: {
          time: Array.from({length: 24}, (_, i) => new Date(Date.now() + i * 3600000).toISOString()),
          temperature_2m: Array(24).fill(28),
          weather_code: Array(24).fill(0)
        },
        daily: {
          time: Array.from({length: 7}, (_, i) => new Date(Date.now() + i * 86400000).toISOString().split('T')[0]),
          temperature_2m_max: Array(7).fill(32),
          temperature_2m_min: Array(7).fill(24),
          weather_code: Array(7).fill(0),
          uv_index_max: Array(7).fill(8)
        }
      })
      setAqi({ us_aqi: 55, pm2_5: 12, pm10: 20, nitrogen_dioxide: 15, sulphur_dioxide: 5, ozone: 60, carbon_monoxide: 800 })
    }
  }

  const saveQuote = async (quote) => {
    if (!quote) return

    if (!session) {
      showToast('Please login to save quotes')
      return
    }

    const { error } = await supabase.from('saved_quotes').insert({
      user_id: session.user.id,
      quote_text: quote.text || quote.content,
      quote_author: quote.author || 'Unknown',
      category: quote.tag || 'Motivational'
    })

    showToast(error? 'Failed to save: ' + error.message : 'Quote saved ♥')
  }

  const saveFact = async (fact) => {
    if (!fact) return

    if (!session) {
      showToast('Please login to save facts')
      return
    }

    const { error } = await supabase.from('saved_facts').insert({
      user_id: session.user.id,
      fact_text: fact.text
    })

    showToast(error? 'Failed to save: ' + error.message : 'Fact saved ♥')
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

  if (loading) {
    return (
      <div style={{minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{padding: '40px', textAlign: 'center', color: '#f8fafc'}}>
          <h2>Loading Zephye...</h2>
        </div>
      </div>
    )
  }

  if (!session) return <Auth />

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
              placeholder="Search city..."
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchCity()}
              className="mb-4"
            />
            <div className="flex gap-2">
              <button className="btn-primary" onClick={searchCity}>Search</button>
              <button className="btn-ghost text-xs" onClick={() => fetchWeatherData(location.lat, location.lon)} disabled={!canRefresh}>
                {canRefresh? 'Refresh ⟳' : 'Wait...'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        {tab === 'weather' && (
          <>
            <div className="glass" style={{padding: '20px', borderRadius: '20px', position: 'relative', zIndex: 2}}>
              <div className="flex items-start justify-between mb-4">
                <button className="location-btn" onClick={() => setShowLocationModal(true)}>
                  <div className="text-xs text-white/70 mb-1">📍 Location</div>
                  <div className="text-lg font-bold">{location.name}</div>
                  <div className="text-xs text-white/70 mt-1">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
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
                    ⚠️ {stormInfo.level}
                  </div>
                )}
                {aqiInfo && (
                  <div style={{position: 'relative'}}>
                    <button
                      className="status-badge"
                      style={{background: aqiInfo.color + '33', borderColor: aqiInfo.color, color: aqiInfo.color, cursor: 'pointer'}}
                      onClick={() => setShowAirDropdown(!showAirDropdown)}
                    >
                      🌬️ Air: {aqiInfo.label} ▼
                    </button>
                    {showAirDropdown && (
                      <div className="glass" style={{position: 'absolute', top: '110%', left: 0, minWidth: '300px', padding: '16px', zIndex: 999, borderRadius: '16px'}}>
                        <p className="font-bold mb-3">Weather Details</p>
                        <div className="flex justify-between mb-2 text-sm"><span className="text-white/70">AQI</span><span className="font-bold" style={{color: aqiInfo.color}}>{aqi?.us_aqi || '--'}</span></div>
                        <div className="flex justify-between mb-2 text-sm"><span className="text-white/70">Wind</span><span className="font-bold">{windSpeed} km/h {getWindDirection(windDir)}</span></div>
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

            <div className="glass" style={{padding: '20px', borderRadius: '20px', position: 'relative', zIndex: 1}}>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold">Quote of the Day</p>
                <div className="flex gap-2">
                  <button className="btn-share text-xs" onClick={() => shareQuote(quoteOfDay?.content, quoteOfDay?.author)}>Share</button>
                  <button className="btn-ghost text-xs" onClick={() => saveQuote(quoteOfDay)}>Save ♥</button>
                </div>
              </div>
              <p className="font-bold mb-2">"{quoteOfDay?.content || 'Loading quote...'}"</p>
              <p className="text-xs text-white/70">- {quoteOfDay?.author || '...'}</p>
            </div>

            <div className="glass" style={{padding: '20px', borderRadius: '20px'}}>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold">Hourly Forecast</p>
                <button className="btn-ghost text-xs" onClick={() => fetchWeatherData(location.lat, location.lon)} disabled={!canRefresh}>
                  {canRefresh? 'Refresh ⟳' : 'Wait...'}
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{scrollSnapType: 'x mandatory'}}>
                {weather?.hourly?.time?.slice(0,24).map((time, i) => (
                  <div key={time} className="glass text-center p-3 rounded-2xl flex-shrink-0" style={{minWidth: '72px', scrollSnapAlign: 'start', background: 'rgba(255,255,255,0.05)'}}>
                    <p className="text-xs text-white/70">
                      {new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                    </p>
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
        {tab === 'saved' && <SavedTab user={session.user} showToast={showToast} shareQuote={shareQuote} />}

        <div className="text-center mt-4 mb-4">
          <p className="text-sm text-muted">© hyesent.dev</p>
        </div>
      </div>

      <div className="bottom-nav">
        <button className={`nav-btn ${tab === 'weather'? 'active' : ''}`} onClick={() => setTab('weather')}>Weather</button>
        <button className={`nav-btn ${tab === 'quotes'? 'active' : ''}`} onClick={() => setTab('quotes')}>Quotes</button>
        <button className={`nav-btn ${tab === 'saved'? 'active' : ''}`} onClick={() => setTab('saved')}>Saved</button>
      </div>
    </div>
  )
}

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin }
        })
        if (error) throw error
        setError('Check your email to confirm signup!')
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#1a2332',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '40px'
      }}>
        <h1 style={{fontWeight: 700, marginBottom: '8px', fontSize: '24px'}}>Zephye</h1>
        <p style={{color: '#94a3b8', fontSize: '14px', marginBottom: '24px'}}>Weather. Wisdom. Daily.</p>

        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f8fafc',
              fontSize: '14px',
              marginBottom: '16px',
              outline: 'none'
            }}
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength="6"
            autoComplete={isLogin? "current-password" : "new-password"}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f8fafc',
              fontSize: '14px',
              marginBottom: '16px',
              outline: 'none'
            }}
          />
          {error && <p style={{color: '#ef4444', fontSize: '12px', marginBottom: '16px'}}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: '#38bdf8',
              color: '#0f172a',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              cursor: loading? 'not-allowed' : 'pointer',
              opacity: loading? 0.5 : 1
            }}
          >
            {loading? 'Loading...' : isLogin? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          type="button"
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '12px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {isLogin? 'Need an account? Sign Up' : 'Have an account? Sign In'}
        </button>

        <div style={{textAlign: 'center', marginTop: '24px'}}>
          <p style={{color: '#94a3b8', fontSize: '12px'}}>© hyesent.dev</p>
        </div>
      </div>
    </div>
  )
}

// FIXED: Quote category filter now works
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
  // eslint-disable-next-line
  }, [])

  useEffect(() => {
    fetchQuote()
  // eslint-disable-next-line
  }, [quoteCategory])

  useEffect(() => {
    fetchFact()
  // eslint-disable-next-line
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

    //... continues from where it cut off

    const random = pool[Math.floor(Math.random() * pool.length)]
    setCurrentQuote(random)
    setLoading(false)
  }

  const fetchFact = () => {
    let pool = []
    if (factCategory === 'All') {
      Object.values(LOCAL_FACTS).forEach(arr => pool.push(...arr))
    } else {
      pool = LOCAL_FACTS[factCategory] || LOCAL_FACTS.Science
    }
    const random = pool[Math.floor(Math.random() * pool.length)]
    setCurrentFact(random)
  }

  return (
    <>
      <div className="glass mb-4" style={{padding: '20px', borderRadius: '20px'}}>
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold">Explore Quotes</p>
          <button className="btn-primary text-sm" onClick={fetchQuote} disabled={loading}>
            {loading? 'Loading...' : 'New Quote ⟳'}
          </button>
        </div>

        <div className="sub-tabs mb-4">
          {QUOTE_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`sub-tab ${quoteCategory === cat? 'active' : ''}`}
              onClick={() => setQuoteCategory(cat)}
            >
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
              <button className="btn-ghost text-sm" onClick={() => saveQuote(currentQuote)}>Save ♥</button>
            </div>
          </div>
        )}
      </div>

      <div className="glass mb-4" style={{padding: '20px', borderRadius: '20px'}}>
       <div className="flex justify-between items-center mb-4">
          <p className="font-bold">Did You Know?</p>
          <button className="btn-ghost text-sm" onClick={fetchFact}>New Fact ⟳</button>
        </div>

        <div className="sub-tabs mb-4">
          {FACT_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`sub-tab ${factCategory === cat? 'active' : ''}`}
              onClick={() => setFactCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {currentFact && (
          <div className="list-item">
            <p className="text-sm mb-4">{currentFact.text}</p>
            <button className="btn-ghost text-sm" onClick={() => saveFact(currentFact)}>Save ♥</button>
          </div>
        )}
      </div>
    </>
  )
}

function SavedTab({ user, showToast, shareQuote }) {
  const [quotes, setQuotes] = useState([])
  const [facts, setFacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadSaved() }, [])

  const loadSaved = async () => {
    try {
      const [quotesRes, factsRes] = await Promise.all([
        supabase.from('saved_quotes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('saved_facts').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ])
      setQuotes(quotesRes.data || [])
      setFacts(factsRes.data || [])
    } catch (err) {
      showToast('Failed to load: ' + err.message)
    }
    setLoading(false)
  }

  const deleteQuote = async (id) => {
    const { error } = await supabase.from('saved_quotes').delete().eq('id', id)
    if (!error) {
      setQuotes(quotes.filter(q => q.id!== id))
      showToast('Quote deleted')
    } else {
      showToast('Delete failed: ' + error.message)
    }
  }

  const deleteFact = async (id) => {
    const { error } = await supabase.from('saved_facts').delete().eq('id', id)
    if (!error) {
      setFacts(facts.filter(f => f.id!== id))
      showToast('Fact deleted')
    } else {
      showToast('Delete failed: ' + error.message)
    }
  }

  if (loading) return <div className="glass" style={{padding: '40px', textAlign: 'center', borderRadius: '20px'}}>Loading saved...</div>

  return (
    <>
      <div className="glass mb-4" style={{padding: '20px', borderRadius: '20px'}}>
        <p className="font-bold mb-4">Saved Quotes ({quotes.length})</p>
        {quotes.length === 0? <p className="text-muted text-sm">No saved quotes yet</p> :
          quotes.map(q => (
            <div key={q.id} className="list-item">
              <p className="font-bold mb-4">"{q.quote_text}"</p>
              <p className="text-sm text-muted mb-4">- {q.quote_author}</p>
              <div className="flex gap-2">
                <button className="btn-share text-sm" onClick={() => shareQuote(q.quote_text, q.quote_author)}>Share</button>
                <button className="btn-danger text-sm" onClick={() => deleteQuote(q.id)}>Delete</button>
              </div>
            </div>
          ))
        }
      </div>
      <div className="glass mb-4" style={{padding: '20px', borderRadius: '20px'}}>
        <p className="font-bold mb-4">Saved Facts ({facts.length})</p>
        {facts.length === 0? <p className="text-muted text-sm">No saved facts yet</p> :
          facts.map(f => (
            <div key={f.id} className="list-item">
              <p className="text-sm mb-4">{f.fact_text}</p>
              <button className="btn-danger text-sm" onClick={() => deleteFact(f.id)}>Delete</button>
            </div>
          ))
        }
      </div>
      <button className="btn-ghost mb-4" style={{width: '100%'}} onClick={() => supabase.auth.signOut()}>Sign Out</button>
    </>
  )
         }
