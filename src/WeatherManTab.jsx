import { useState, useEffect } from 'react'
import { useAudio } from './AudioContext'
import ZephyeAIPanel from './ZephyeAIPanel'
import { getLang, getVoiceForLocation, useWeatherChat, getGreeting } from './zephyeHelpers'

const BACKEND_URL = 'https://hyezen.onrender.com'

const getAqiLevel = (aqi) => {
  if (aqi == null) return { label: 'Unknown', color: '#6b7280' }
  if (aqi <= 50) return { label: 'Good', color: '#22c55e' }
  if (aqi <= 100) return { label: 'Moderate', color: '#eab308' }
  if (aqi <= 150) return { label: 'Unhealthy', color: '#f97316' }
  return { label: 'Hazardous', color: '#ef4444' }
}

export default function WeatherManTab({ weather, location, todayStats, aqi }) {
  const { playGlobal, stopGlobal, isSpeaking } = useAudio()
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('en-US-GuyNeural')
  const [briefMode, setBriefMode] = useState(false)
  const [userName, setUserName] = useState(localStorage.getItem('weatherman_name') || '')
  const { askWeather, isLoading } = useWeatherChat()
  const code = weather?.current?.weather_code

  // NEW: Get language + voice from location
  const countryCode = location?.country_code || location?.name?.split(', ').pop()?.slice(0,2)?.toUpperCase() || 'US'
  const lang = getLang(countryCode)
  const voiceToUse = getVoiceForLocation(selectedVoice, countryCode)
  const timezone = weather?.timezone || 'UTC'
  const greeting = getGreeting(timezone, lang)

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/voices/fair`)
  .then(r => r.json())
  .then(data => setVoices(data || []))
  .catch(() => setVoices([]))
  }, [])

  const buildScript = () => {
    const name = userName || location.name.split(',')[0]
    const temp = Math.round(weather?.current?.temperature_2m || 0)
    const feels = Math.round(todayStats?.feelsLike || 0)
    const wind = Math.round(weather?.current?.wind_speed_10m || 0)
    const rain2h = weather?.hourly?.precipitation_probability?.slice(0,2).reduce((a,b) => Math.max(a,b), 0) || 0
    const uv = weather?.daily?.uv_index_max?.[0] || 0

    let script = `${greeting} ${name}. `

    if (briefMode) {
      if (code >= 95) {
        script += `Thunderstorms in ${location.name} right now. `
      } else if (code >= 51) {
        script += `Rain expected in ${location.name}. `
      } else {
        script += `Currently ${temp} degrees in ${location.name}. `
      }

      script += `Feels like ${feels}. `

      if (rain2h >= 60) {
        script += `Rain likely in 2 hours. `
      } else if (todayStats?.maxRainProb >= 50) {
        script += `${todayStats.maxRainProb} percent chance of rain today. `
      }

      if (uv >= 8) script += `High UV index. `
      if (aqi?.us_aqi > 100) script += `Air quality is poor. `

      script += `That's your update from Zephye.`
      return script
    }

    if (code >= 95) {
      script += `Heads up, we have thunderstorms in ${location.name} right now. `
    } else if (code >= 51) {
      script += `It's a rainy day in ${location.name}. `
    } else if (code === 0 || code === 1) {
      script += `Clear skies over ${location.name} today. `
    } else {
      script += `Cloudy conditions in ${location.name}. `
    }

    script += `Right now it's ${temp} degrees, but it feels like ${feels}. `

    const gust = Math.round(weather?.daily?.wind_gusts_10m_max?.[0] || 0)
    if (wind >= 20 || gust >= 30) {
      script += `Winds are picking up at ${wind} kilometers per hour, with gusts up to ${gust}. `
    } else {
      script += `Winds are light at ${wind} kilometers per hour. `
    }

    script += `Humidity is sitting at ${weather?.current?.relative_humidity_2m || 0} percent. `

    if (uv >= 8) {
      script += `UV index is high at ${uv}, so sun protection is advised. `
    } else if (uv >= 6) {
      script += `UV index is moderate at ${uv}. `
    }

    if (rain2h >= 60) {
      script += `Grab an umbrella, there's a ${rain2h} percent chance of rain in the next 2 hours. `
    } else if (todayStats?.maxRainProb >= 50) {
      script += `There's a ${todayStats.maxRainProb} percent chance of rain later today. `
    } else {
      script += `No major rain expected today, just a ${todayStats?.maxRainProb || 0} percent chance. `
    }

    if (todayStats?.thunderHours > 0) {
      script += `Thunder is possible for about ${todayStats.thunderHours} hours today. `
    }

    if (aqi?.us_aqi) {
      const aqiLevel = getAqiLevel(aqi.us_aqi).label
      if (aqi.us_aqi > 100) {
        script += `Air quality is ${aqiLevel}, so sensitive groups should limit outdoor activity. `
      } else {
        script += `Air quality is ${aqiLevel}. `
      }
    }

    const sunrise = new Date(weather?.daily?.sunrise?.[0]).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})
    const sunset = new Date(weather?.daily?.sunset?.[0]).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})
    script += `Sunrise was at ${sunrise}, and sunset is at ${sunset}. `

    script += `That's your update from Zephye. Stay safe out there.`
    return script
  }

  const speakScript = async (customText = null, customVoice = null) => {
    if (isSpeaking) {
      stopGlobal()
      return
    }

    const textToSpeak = customText || buildScript()
    const voiceToSpeak = customVoice || voiceToUse

    try {
      const res = await fetch(`${BACKEND_URL}/api/tts`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          text: textToSpeak,
          voice: voiceToSpeak,
          type: 'fair'
        })
      })
      const data = await res.json()
      if (data.success) {
        playGlobal(`${BACKEND_URL}${data.url}`, voiceToSpeak)
      } else {
        console.error('TTS failed:', data.error)
      }
    } catch (err) {
      console.error('TTS Error:', err)
    }
  }

  return (
    <ZephyeAIPanel
      weather={weather}
      todayStats={todayStats}
      aqi={aqi}
      location={location}
      voices={voices}
      selectedVoice={selectedVoice}
      setSelectedVoice={setSelectedVoice}
      userName={userName}
      setUserName={setUserName}
      briefMode={briefMode}
      setBriefMode={setBriefMode}
      isSpeaking={isSpeaking}
      speakScript={speakScript}
      buildScript={buildScript}
      getAqiLevel={getAqiLevel}
      // NEW PROPS
      lang={lang}
      voiceToUse={voiceToUse}
      greeting={greeting}
      askWeather={askWeather}
      isLoadingChat={isLoading}
    />
  )
    }
