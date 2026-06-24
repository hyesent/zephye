// WMO Weather codes → condition string
export const WMO_CODES = {
  0: 'clear', 1: 'clear', 2: 'partly-cloudy', 3: 'cloudy',
  45: 'fog', 48: 'fog', 51: 'drizzle', 53: 'drizzle', 55: 'drizzle',
  61: 'rain', 63: 'rain', 65: 'rain', 71: 'snow', 73: 'snow', 75: 'snow',
  80: 'rain', 81: 'rain', 82: 'rain', 95: 'thunderstorm', 96: 'thunderstorm', 99: 'thunderstorm'
}

// WMO codes → cloud cover %
export const WMO_CLOUD = {
  0: 0, 1: 10, 2: 50, 3: 100, 45: 100, 48: 100, 51: 100, 53: 100, 55: 100,
  61: 100, 63: 100, 65: 100, 71: 100, 73: 100, 75: 100, 80: 100, 81: 100, 82: 100, 95: 100, 96: 100, 99: 100
}

// UV Index → burn time minutes for skin type II
export const UV_BURN_TIMES = [null, 60, 45, 30, 20, 15, 10, 10, 8, 6, 5, 5]

// Cache for API calls to avoid spam
const apiCache = new Map()

const fetchWithCache = async (url, key, ttl = 600000) => {
  const cached = apiCache.get(key)
  if (cached && Date.now() - cached.time < ttl) return cached.data
  try {
    const res = await fetch(url)
    const data = await res.json()
    apiCache.set(key, { data, time: Date.now() })
    return data
  } catch {
    return null
  }
}

export const random = (arr) => arr[Math.floor(Math.random() * arr.length)]

export const mapWeatherCode = (code) => WMO_CODES[code]?? 'cloudy'

export const getCloudCover = (code) => WMO_CLOUD[code]?? 50

export const getWindDirection = (deg) => {
  if (deg == null) return 'N'
  if (deg >= 337.5 || deg < 22.5) return 'N'
  if (deg >= 22.5 && deg < 67.5) return 'NE'
  if (deg >= 67.5 && deg < 112.5) return 'E'
  if (deg >= 112.5 && deg < 157.5) return 'SE'
  if (deg >= 157.5 && deg < 202.5) return 'S'
  if (deg >= 202.5 && deg < 247.5) return 'SW'
  if (deg >= 247.5 && deg < 292.5) return 'W'
  return 'NW'
}

// NOAA Heat Index - fetches humidity if missing
export const calcHeatIndex = async (temp, humidity, lat, lon) => {
  if (temp < 27) return temp
  let R = humidity
  if (R == null && lat && lon) {
    const data = await fetchWithCache(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m`,
      `humidity-${lat}-${lon}`
    )
    R = data?.current?.relative_humidity_2m
  }
  if (R == null) return temp
  const T = temp
  const HI = -8.78469475556 + 1.61139411*T + 2.33854883889*R - 0.14611605*T*R - 0.012308094*T*T - 0.0164248277778*R*R + 0.002211732*T*T*R + 0.00072546*T*R*R - 0.000003582*T*T*R*R
  return Math.round(HI * 10) / 10
}

// Environment Canada Wind Chill - km/h input
export const calcWindChill = (temp, wind) => {
  if (temp > 10 || wind < 5) return temp
  const WC = 13.12 + 0.6215*temp - 11.37*Math.pow(wind, 0.16) + 0.3965*temp*Math.pow(wind, 0.16)
  return Math.round(WC * 10) / 10
}

// Dew Point - fetches humidity if missing
export const calcDewPoint = async (temp, humidity, lat, lon) => {
  let R = humidity
  if (R == null && lat && lon) {
    const data = await fetchWithCache(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m`,
      `humidity-${lat}-${lon}`
    )
    R = data?.current?.relative_humidity_2m
  }
  if (R == null) return temp
  const a = 17.27, b = 237.7
  const alpha = ((a * temp) / (b + temp)) + Math.log(R / 100)
  const dp = (b * alpha) / (a - alpha)
  return Math.round(dp * 10) / 10
}

// Wet Bulb Globe Temperature - fetches humidity + solar if missing
export const calcWetBulbGlobeTemp = async (temp, humidity, wind, solarRadiation, lat, lon) => {
  let R = humidity, solar = solarRadiation
  if ((R == null || solar == null) && lat && lon) {
    const data = await fetchWithCache(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m,shortwave_radiation`,
      `wbgt-${lat}-${lon}`
    )
    R = R?? data?.current?.relative_humidity_2m
    solar = solar?? data?.current?.shortwave_radiation?? 0
  }
  if (R == null) return temp
  const dewPoint = await calcDewPoint(temp, R)
  const Tw = temp * Math.atan(0.151977 * Math.sqrt(R + 8.313659)) + Math.atan(temp + R) - Math.atan(R - 1.676331) + 0.00391838 * Math.pow(R, 1.5) * Math.atan(0.023101 * R) - 4.686035
  const Tg = temp + (solar / 25) * (1 / (wind * 0.1 + 1))
  const wbgt = 0.7 * Tw + 0.2 * Tg + 0.1 * temp
  return Math.round(wbgt * 10) / 10
}

// Comfort score - fetches humidity if missing
export const getComfortScore = async ({ temp, humidity, wind, lat, lon }) => {
  let R = humidity
  if (R == null && lat && lon) {
    const data = await fetchWithCache(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m`,
      `humidity-${lat}-${lon}`
    )
    R = data?.current?.relative_humidity_2m
  }
  if (temp == null) return 'Extreme'
  if (temp >= 18 && temp <= 26 && R >= 40 && R <= 60 && wind < 20) return 'Perfect'
  if (temp >= 15 && temp <= 30 && R >= 30 && R <= 70 && wind < 35) return 'Good'
  if (temp >= 10 && temp <= 35 && R >= 20 && R <= 80) return 'Poor'
  return 'Extreme'
}

// Pavement temp estimate - sun exposure
export const getPavementTemp = (temp) => Math.round(temp + 25)

// UV burn time
export const getBurnTime = (uvIndex) => {
  if (uvIndex == null) return 60
  const idx = Math.min(Math.round(uvIndex), 11)
  return UV_BURN_TIMES[idx]?? 60
}

// Stopping distance - meters, wet doubles it
export const getStoppingDistance = (speed, conditionCode) => {
  const condition = mapWeatherCode(conditionCode)
  const base = (speed / 10) * (speed / 10) * 0.4 + speed * 0.2
  const isWet = ['rain', 'drizzle', 'thunderstorm'].includes(condition)
  return Math.round(isWet? base * 2 : base)
}

// Growing Degree Days - base 10°C
export const calcGrowingDegreeDays = (tempMin, tempMax, base = 10) => {
  if (tempMin == null || tempMax == null) return 0
  const avg = (tempMin + tempMax) / 2
  return Math.max(0, Math.round((avg - base) * 10) / 10)
}

// Evapotranspiration - fetches all missing data
export const calcEvapotranspiration = async (temp, humidity, wind, solarRadiation, lat, lon) => {
  let T = temp, R = humidity, u = wind, solar = solarRadiation
  if ((R == null || solar == null) && lat && lon) {
    const data = await fetchWithCache(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,shortwave_radiation`,
      `et-${lat}-${lon}`
    )
    T = T?? data?.current?.temperature_2m
    R = R?? data?.current?.relative_humidity_2m
    u = u?? data?.current?.wind_speed_10m
    solar = solar?? data?.current?.shortwave_radiation
  }
  if (T == null || R == null || u == null || solar == null) return 0
  const Rn = solar * 0.0864 // W/m² to MJ/m²/day
  const u2 = u / 3.6 // km/h to m/s
  const es = 0.6108 * Math.exp((17.27 * T) / (T + 237.3))
  const ea = es * (R / 100)
  const delta = (4098 * es) / Math.pow(T + 237.3, 2)
  const gamma = 0.0665
  const ET0 = (0.408 * delta * Rn + gamma * (900 / (T + 273)) * u2 * (es - ea)) / (delta + gamma * (1 + 0.34 * u2))
  return Math.max(0, Math.round(ET0 * 10) / 10)
}

// Moon phase 0-1 - CALLS ASTRONOMY API DIRECTLY
export const getMoonPhase = async (lat, lon) => {
  if (lat == null || lon == null) return 0
  try {
    const today = new Date().toISOString().split('T')[0]
    const data = await fetchWithCache(
      `https://api.open-meteo.com/v1/astronomy?latitude=${lat}&longitude=${lon}&start_date=${today}&end_date=${today}`,
      `moon-${lat}-${lon}-${today}`,
      86400000 // cache 24h
    )
    return Math.round((data?.daily?.moon_phase?.[0]?? 0) * 100) / 100
  } catch {
    return 0
  }
}

// Golden hour times - uses API sunrise/sunset passed in
export const calcGoldenHour = (sunrise, sunset) => {
  if (!sunrise ||!sunset) return { morning: '--:-- - --:--', evening: '--:-- - --:--' }
  const rise = new Date(sunrise)
  const set = new Date(sunset)
  const morningEnd = new Date(rise.getTime() + 60 * 60 * 1000)
  const eveningStart = new Date(set.getTime() - 60 * 60 * 1000)
  const fmt = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return {
    morning: `${fmt(rise)} - ${fmt(morningEnd)}`,
    evening: `${fmt(eveningStart)} - ${fmt(set)}`
  }
}

// Paint drying time - fetches humidity if missing
export const getPaintDryingTime = async (temp, humidity, lat, lon) => {
  let R = humidity
  if (R == null && lat && lon) {
    const data = await fetchWithCache(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m`,
      `humidity-${lat}-${lon}`
    )
    R = data?.current?.relative_humidity_2m
  }
  if (temp == null || R == null) return 8
  if (R > 85 || temp < 10) return 24
  if (temp >= 20 && temp <= 30 && R >= 40 && R <= 70) return 2
  if (temp >= 15 && temp <= 35 && R <= 80) return 4
  return 8
}

// Concrete curing temp advice
export const getConcreteCuringTemp = (temp) => {
  if (temp == null) return 'No temperature data.'
  if (temp < 4) return 'Too cold. Below 4°C concrete won’t cure. Use blankets/heaters.'
  if (temp >= 10 && temp <= 32) return 'Ideal range 10-32°C. Cure 7 days, keep moist.'
  if (temp > 32) return 'Too hot. Above 32°C causes rapid drying/cracks. Pour evening, keep wet.'
  return 'Cold 4-10°C. Slows cure. Allow 14+ days, protect from freeze.'
}

// Planet visibility - static string, no API
export const getPlanetVisibility = () => 'Venus: visible after sunset. Jupiter: midnight. Mars: pre-dawn.'
