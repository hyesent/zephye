import { useState, useEffect } from 'react'
import { useAudio } from './AudioContext'

const BACKEND_URL = 'https://hyezen.onrender.com'

const getAqiLevel = (aqi) => {
  if (aqi == null) return { label: 'Unknown', color: '#6b7280' }
  if (aqi <= 50) return { label: 'Good', color: '#22c55e' }
  if (aqi <= 100) return { label: 'Moderate', color: '#eab308' }
  if (aqi <= 150) return { label: 'Unhealthy', color: '#f97316' }
  return { label: 'Hazardous', color: '#ef4444' }
}

function MetricItem({ label, value, color }) {
  return (
    <div className="glass" style={{padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)'}}>
      <div className="text-xs text-white/70 mb-1">{label}</div>
      <p className="text-sm font-bold" style={{color: color || '#fff'}}>{value?? '--'}</p>
    </div>
  )
}

export default function WeatherManTab({ weather, location, todayStats, aqi }) {
  const { playGlobal, stopGlobal, isSpeaking } = useAudio()
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('en-US-GuyNeural')
  const [briefMode, setBriefMode] = useState(false)
  const [userName, setUserName] = useState(localStorage.getItem('weatherman_name') || '')
  const [showNameModal, setShowNameModal] = useState(false)
  const [tempName, setTempName] = useState('')
  const code = weather?.current?.weather_code

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/voices/fair`)
  .then(r => r.json())
  .then(data => setVoices(data || []))
  .catch(() => setVoices([]))
  }, [])

  const saveName = () => {
    const name = tempName.trim()
    if (name) {
      localStorage.setItem('weatherman_name', name)
      setUserName(name)
      setShowNameModal(false)
      setTempName('')
    }
  }

  const buildScript = () => {
    const time = new Date().getHours()
    const greeting = time < 12? 'Good morning' : time < 17? 'Good afternoon' : 'Good evening'
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

  const speakScript = async () => {
    if (isSpeaking) {
      stopGlobal()
      return
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/tts`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          text: buildScript(),
          voice: selectedVoice,
          type: 'fair'
        })
      })
      const data = await res.json()
      if (data.success) {
        playGlobal(`${BACKEND_URL}${data.url}`, selectedVoice)
      } else {
        console.error('TTS failed:', data.error)
      }
    } catch (err) {
      console.error('TTS Error:', err)
    }
  }

  return (
    <>
      {/* NAME SETTING MODAL */}
      {showNameModal && (
        <div className="modal-overlay" onClick={() => setShowNameModal(false)}>
          <div className="glass modal" onClick={e => e.stopPropagation()} style={{padding: '24px'}}>
            <h3 className="font-bold mb-4">Set Your Name</h3>
            <p className="text-sm text-white/70 mb-3">Zephye will greet you by name in the briefing</p>
            <input
              type="text"
              placeholder="Enter your name"
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              className="mb-4 w-full"
              autoFocus
            />
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={saveName}>Save</button>
              <button className="btn-ghost text-xs" onClick={() => {
                setShowNameModal(false)
                setTempName('')
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ZEPHYE PANEL - Fixed layout */}
      <div className="glass" style={{
        padding: '20px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)',
        border: '1px solid rgba(59,130,246,0.2)'
      }}>
        {/* ZEPHYE TITLE - Top line now */}
        <div className="mb-3">
          <span className="text-base font-bold text-white/90">Zephye</span>
          {userName && (
            <span className="text-xs text-white/60 ml-2">Hi {userName}</span>
          )}
        </div>

        {/* CONTROLS ROW - Full width flex */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setTempName(userName)
              setShowNameModal(true)
            }}
            className="glass text-xs flex-1"
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            👤 You
          </button>

          <button
            onClick={() => setBriefMode(!briefMode)}
            className="glass text-xs flex-1"
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: briefMode? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
              background: briefMode? 'rgba(59,130,246,0.2)' : 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontWeight: briefMode? '700' : '500'
            }}
          >
            {briefMode? '⚡ Brief' : '📋 Full'}
          </button>

          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="glass text-xs flex-1"
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff'
            }}
          >
            {voices.map(v => (
              <option key={v.name} value={v.name}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* ALL 15 METRICS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '16px'
        }}>
          <MetricItem label="AQI" value={aqi?.us_aqi?? '--'} color={getAqiLevel(aqi?.us_aqi).color} />
          <MetricItem label="Wind" value={`${Math.round(weather?.current?.wind_speed_10m || 0)} km/h`} />
          <MetricItem label="Humidity" value={`${weather?.current?.relative_humidity_2m || 0}%`} />
          <MetricItem label="Pressure" value={`${Math.round(weather?.current?.surface_pressure || weather?.current?.pressure_msl || 0)} hPa`} />
          <MetricItem label="Visibility" value={`${Math.round((weather?.current?.visibility || 10000)/1000)} km`} />
          <MetricItem label="UV Index" value={weather?.daily?.uv_index_max?.[0] || weather?.current?.uv_index || 0} />
          <MetricItem label="Sunshine" value={`${todayStats?.sunHours || 0}h`} />
          <MetricItem label="Rain" value={`${todayStats?.rainHours || 0}h ${todayStats?.maxRainProb || 0}%`} />
          <MetricItem label="Thunder" value={`${todayStats?.thunderHours || 0}h`} />
          <MetricItem label="Feels Like" value={`${Math.round(todayStats?.feelsLike || 0)}°`} />
          <MetricItem label="Wind Gust" value={`${Math.round(weather?.daily?.wind_gusts_10m_max?.[0] || todayStats?.windGust || 0)} km/h`} />
          <MetricItem label="Sunrise" value={new Date(weather?.daily?.sunrise?.[0]).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})} />
          <MetricItem label="Sunset" value={new Date(weather?.daily?.sunset?.[0]).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})} />
          <MetricItem label="Rain 2h" value={`${weather?.hourly?.precipitation_probability?.slice(0,2).reduce((a,b) => Math.max(a,b), 0) || 0}%`} />
          <MetricItem label="Rain 24h" value={`${weather?.hourly?.precipitation_probability?.slice(0,24).reduce((a,b) => Math.max(a,b), 0) || 0}%`} />
        </div>

        <button
          onClick={speakScript}
          style={{
            width: '100%',
            background: isSpeaking? 'rgba(239,68,68,0.2)' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            padding: '14px',
            borderRadius: '14px',
            border: isSpeaking? '1px solid #ef4444' : 'none',
            color: '#fff',
            fontWeight: '700',
            fontSize: '15px',
            cursor: 'pointer'
          }}
        >
          {isSpeaking? ' Stop Zephye 🌬 ' : briefMode? '⚡ Play Brief Update' : '🔊 Play Full Briefing'}
        </button>
      </div>
    </>
  )
      }
