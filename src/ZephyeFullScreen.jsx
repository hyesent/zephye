import { useState, useEffect, useRef } from 'react'
import { useAudio } from './AudioContext'
import { getMoonPhase, mapWeatherCode } from './data/calculations.js'

import { getClothingAdvice } from './data/ClothingAdvice.js'
import { getLifestyleAdvice } from './data/Lifestyle.js'
import { getSkinHairAdvice } from './data/SkinHair.js'
import { getDrivingAdvice } from './data/Driving.js'
import { getTravelingAdvice } from './data/Traveling.js'
import { getFarmingAdvice } from './data/Farming.js'
import { getStargazingAdvice } from './data/Stargazing.js'
import { getPhotographyAdvice } from './data/Photography.js'
import { getEventsAdvice } from './data/Events.js'
import { getSportsAdvice } from './data/Sports.js'
import { getHealthAdvice } from './data/Health.js'
import { getDIYConstructionAdvice } from './data/DIYconstruction.js'
import { getPetsAdvice } from './data/Pets.js'
import { getEnergyHomeAdvice } from './data/EnergyHome.js'

const GHOST_SUGGESTIONS = [
  'Ask "stargazing tonight" or "moon phase"',
  'Try "what should I wear" or "safe to run"',
  'Ask "will it rain" or "UV burn time"',
  'Type "paint drying time" or "best photo hour"'
]

const QNA_MAP = [
  { keys: ['wear', 'clothes', 'outfit', 'clothing', 'dress', 'jacket', 'shirt', 'pants', 'cold', 'hot', 'layer'], fn: getClothingAdvice, name: 'Clothing' },
  { keys: ['lifestyle', 'mood', 'energy', 'vibe', 'feel', 'tired', 'productivity', 'motivation'], fn: getLifestyleAdvice, name: 'Lifestyle' },
  { keys: ['skin', 'hair', 'sunscreen', 'uv', 'sunburn', 'tan', 'spf', 'dry skin'], fn: getSkinHairAdvice, name: 'SkinHair' },
  { keys: ['drive', 'driving', 'road', 'car', 'traffic', 'commute', 'trip car', 'highway'], fn: getDrivingAdvice, name: 'Driving' },
  { keys: ['travel', 'flight', 'trip', 'vacation', 'hotel', 'airport', 'tourist'], fn: getTravelingAdvice, name: 'Traveling' },
  { keys: ['farm', 'crop', 'plant', 'harvest', 'soil', 'irrigation', 'seed'], fn: getFarmingAdvice, name: 'Farming' },
  { keys: ['star', 'moon', 'astro', 'planet', 'meteor', 'telescope', 'night sky', 'constellation'], fn: getStargazingAdvice, name: 'Stargazing' },
  { keys: ['photo', 'camera', 'golden hour', 'shoot', 'picture', 'photography', 'lighting'], fn: getPhotographyAdvice, name: 'Photography' },
  { keys: ['event', 'party', 'wedding', 'outdoor', 'bbq', 'picnic', 'gathering'], fn: getEventsAdvice, name: 'Events' },
  { keys: ['sport', 'run', 'gym', 'workout', 'game', 'exercise', 'training', 'football', 'soccer', 'jog'], fn: getSportsAdvice, name: 'Sports' },
  { keys: ['health', 'allergy', 'asthma', 'sick', 'cold', 'flu', 'headache', 'medical'], fn: getHealthAdvice, name: 'Health' },
  { keys: ['diy', 'build', 'concrete', 'paint', 'construction', 'renovation', 'hammer', 'drill'], fn: getDIYConstructionAdvice, name: 'DIY' },
  { keys: ['pet', 'dog', 'cat', 'walk', 'animal', 'puppy', 'kitten'], fn: getPetsAdvice, name: 'Pets' },
  { keys: ['energy', 'power', 'solar', 'home', 'electricity', 'bill', 'ac', 'heating'], fn: getEnergyHomeAdvice, name: 'EnergyHome' },
]

export default function ZephyeFullScreen({
  isOpen,
  onClose,
  weather,
  location,
  todayStats,
  aqi,
  userName,
  lang = 'en',
  greeting,
  voiceToUse
}) {
  const { playGlobal, stopGlobal, isSpeaking } = useAudio()

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [ghostText, setGhostText] = useState('')
  const [streamingText, setStreamingText] = useState('')
  const [moonPhase, setMoonPhase] = useState(0)
  const [activeTab, setActiveTab] = useState('ask') // 'ask' | 'pro'

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  const temp = Math.round(weather?.current?.temperature_2m || 0)
  const humidity = weather?.current?.relative_humidity_2m
  const wind = weather?.current?.wind_speed_10m
  const uv = weather?.current?.uv_index || weather?.daily?.uv_index_max?.[0]
  const conditionCode = weather?.current?.weather_code

  function getAqiLevel(aqi) {
    if (aqi == null) return { label: 'Unknown', color: '#6b7280' }
    if (aqi <= 50) return { label: 'Good', color: '#22c55e' }
    if (aqi <= 100) return { label: 'Moderate', color: '#eab308' }
    if (aqi <= 150) return { label: 'Unhealthy', color: '#f97316' }
    return { label: 'Hazardous', color: '#ef4444' }
  }

  const aqiLevel = getAqiLevel(aqi?.us_aqi)

  useEffect(() => {
    if (isOpen && location?.lat && location?.lon) {
      getMoonPhase(location.lat, location.lon).then(setMoonPhase)
    }
  }, [isOpen, location])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `${greeting}, ${userName || location?.name?.split(',')[0] || 'there'}\n${location?.name || 'Your location'}\n${temp}°C • AQI ${aqiLevel.label}`
        }
      ])
    }
  }, [isOpen])

  useEffect(() => {
    if (input) {
      setGhostText('')
      return
    }
    let i = 0
    setGhostText(GHOST_SUGGESTIONS[0])
    const interval = setInterval(() => {
      i = (i + 1) % GHOST_SUGGESTIONS.length
      setGhostText(GHOST_SUGGESTIONS[i])
    }, 3000)
    return () => clearInterval(interval)
  }, [input])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const routeQuestion = async (question) => {
    const q = question.toLowerCase()
    const data = {
      temp,
      feelsLike: weather?.current?.apparent_temperature || temp,
      humidity,
      wind,
      windDir: weather?.current?.wind_direction_10m,
      uvIndex: uv,
      aqi: aqi?.us_aqi,
      visibility: weather?.current?.visibility? weather.current.visibility / 1000 : 10,
      conditionCode,
      pressure: weather?.current?.pressure_msl,
      precipitation: weather?.current?.precipitation || 0,
      city: location?.name,
      lat: location?.lat,
      lon: location?.lon,
      sunrise: weather?.daily?.sunrise?.[0],
      sunset: weather?.daily?.sunset?.[0],
      solarRadiation: weather?.current?.shortwave_radiation,
      tempMax: weather?.daily?.temperature_2m_max?.[0],
      tempMin: weather?.daily?.temperature_2m_min?.[0],
      moonPhase
    }

    let bestMatch = null
    let bestScore = 0

    for (const route of QNA_MAP) {
      let score = 0
      for (const key of route.keys) {
        if (q.includes(key)) score += key.length
      }
      if (score > bestScore) {
        bestScore = score
        bestMatch = route
      }
    }

    if (bestMatch && bestScore > 2) {
      return await bestMatch.fn(data, question)
    }

    if (q.match(/rain|storm|cloud|sun|wind|humid|cold|hot|weather/)) {
      return await getClothingAdvice(data, question)
    }
    if (q.match(/moon|star|sky|night/)) {
      return await getStargazingAdvice(data, question)
    }
    if (q.match(/outside|run|exercise|walk|jog/)) {
      return await getSportsAdvice(data, question)
    }

    const suggestions = QNA_MAP.slice(0, 3).map(r => r.name).join(', ')
    return `Not sure what you need. I can help with: ${suggestions}, and more. Current temp is ${temp}°C. Try "what should I wear" or "safe to run"?`
  }

  const handleAsk = async (question) => {
    if (!question.trim()) return

    setMessages(prev => [...prev, { role: 'user', content: question }])
    setInput('')
    setIsLoading(true)
    setStreamingText('')

    try {
      const answer = await routeQuestion(question)

      let text = ''
      for (const word of answer.split(' ')) {
        text += word + ' '
        setStreamingText(text)
        await new Promise(r => setTimeout(r, 20))
      }

      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
      setStreamingText('')

      if (voiceToUse) speakText(answer)

    } catch (e) {
      const fallback = `Error getting advice. Current temp is ${temp}°C with ${mapWeatherCode(conditionCode)}.`
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }])
    } finally {
      setIsLoading(false)
    }
  }

  const speakText = async (text) => {
    if (isSpeaking) {
      stopGlobal()
      return
    }
    try {
      const res = await fetch('https://hyezen.onrender.com/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: voiceToUse, type: 'fair' })
      })
      const data = await res.json()
      if (data.success) {
        playGlobal(`https://hyezen.onrender.com${data.url}`, voiceToUse)
      }
    } catch {}
  }

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) return
    const recognition = new webkitSpeechRecognition()
    recognition.lang = lang
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript
      setInput(text)
      handleAsk(text)
    }
    recognitionRef.current = recognition
    recognition.start()
  }

  if (!isOpen) return null

  // ─── MODIFIED RETURN ──────────────────────────────────────────────
  return (
    <div className="ai-fullscreen">
      {/* HEADER with capsule switch + weather badge */}
      <div className="ai-header">
        <div className="header-left">
          <button onClick={onClose} className="btn-ghost">←</button>
        </div>
        <div className="header-center">
          <div className="capsule-switch">
            <button
              className={`capsule-option ${activeTab === 'ask' ? 'active' : ''}`}
              onClick={() => setActiveTab('ask')}
            >
              Ask Zephye
            </button>
            <button
              className="capsule-option pro"
              onClick={() => {}}
              title="Pro — coming soon"
            >
              Pro
            </button>
          </div>
        </div>
        <div className="header-right">
          <div className="weather-badge">
            <span>{location?.name?.split(',')[0] || 'City'}</span>
            <span>{temp}°C</span>
            <span className="aqi-badge">{aqiLevel.label}</span>
          </div>
        </div>
      </div>

      {/* BODY (messages) */}
      <div className="ai-body">
        <div style={{ maxWidth: '768px', margin: '0 auto' }}>
          {messages.map((msg, i) => (
            <div key={i} className="flex mb-3" style={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div className={`chat-bubble ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="msg-actions-top">
                    <button
                      className="speak-btn"
                      onClick={() => speakText(msg.content)}
                      title={isSpeaking ? 'Stop' : 'Speak'}
                    >
                      {isSpeaking ? '⏹️' : '🔊'}
                    </button>
                    <button
                      className="speak-btn"
                      onClick={() => copyText(msg.content)}
                      title="Copy"
                    >
                      📋
                    </button>
                  </div>
                )}
                <div className="msg-content">{msg.content}</div>
              </div>
            </div>
          ))}

          {streamingText && (
            <div className="flex mb-3">
              <div className="chat-bubble ai">
                {streamingText}▋
              </div>
            </div>
          )}

          {isLoading && !streamingText && (
            <div className="flex mb-3">
              <div className="chat-bubble ai text-muted">
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT AREA — microphone INSIDE the input wrapper */}
      <div className="ai-input-wrap">
        <div className="flex gap-2" style={{ maxWidth: '768px', margin: '0 auto' }}>
          <div className="input-wrapper">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk(input)}
              placeholder={ghostText || "Ask Zephye..."}
              disabled={isLoading}
            />
            <button
              className="mic-btn"
              onClick={startListening}
              title="Voice input"
            >
              🎤
            </button>
          </div>
          <button
            onClick={() => handleAsk(input)}
            disabled={!input.trim() || isLoading}
            className="btn-primary"
            style={{ width: 'auto', padding: '12px 20px' }}
          >
            Send
          </button>
        </div>
      </div>

      {/* INLINE STYLES (updated) */}
      <style jsx>{`
        .ai-fullscreen {
          position: fixed;
          inset: 0;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* HEADER */
        .ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #eef1f5;
          background: #fff;
          flex-shrink: 0;
        }
        .header-left, .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .header-center {
          display: flex;
          align-items: center;
          flex: 1;
          justify-content: center;
        }
        .btn-ghost {
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 4px 8px;
          color: #1d293b;
        }
        .btn-ghost:hover {
          background: #f0f2f5;
          border-radius: 8px;
        }

        /* CAPSULE SWITCH */
        .capsule-switch {
          display: flex;
          background: #eef2f7;
          border-radius: 40px;
          padding: 3px;
          border: 1px solid #dce3ec;
        }
        .capsule-option {
          padding: 5px 16px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          color: #4a5a72;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: 0.2s;
          letter-spacing: -0.2px;
        }
        .capsule-option.active {
          background: #2563eb;
          color: #fff;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
        }
        .capsule-option.pro {
          opacity: 0.5;
          cursor: default;
        }
        .capsule-option.pro::after {
          content: ' 🔒';
          font-size: 10px;
          opacity: 0.6;
        }

        /* WEATHER BADGE */
        .weather-badge {
          background: #f4f7fc;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 500;
          color: #1d2b41;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #e8edf5;
          white-space: nowrap;
        }
        .aqi-badge {
          background: #dce5f0;
          padding: 0 8px;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 600;
        }

        /* BODY */
        .ai-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #fafcff;
        }
        .flex {
          display: flex;
        }
        .mb-3 {
          margin-bottom: 12px;
        }
        .chat-bubble {
          max-width: 85%;
          padding: 10px 16px;
          border-radius: 20px;
          font-size: 14px;
          line-height: 1.6;
          word-break: break-word;
          background: #fff;
          border: 1px solid #e2e9f2;
          color: #1d293b;
        }
        .chat-bubble.user {
          background: #2563eb;
          color: #fff;
          border: none;
          border-bottom-right-radius: 4px;
        }
        .chat-bubble.ai {
          border-bottom-left-radius: 4px;
        }
        .text-muted {
          color: #6a7e9b;
        }
        .msg-actions-top {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .chat-bubble:hover .msg-actions-top {
          opacity: 1;
        }
        .speak-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: inherit;
          font-size: 12px;
          cursor: pointer;
        }
        .speak-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        .msg-content {
          white-space: pre-wrap;
        }

        /* INPUT AREA */
        .ai-input-wrap {
          padding: 10px 16px 16px;
          background: #fff;
          border-top: 1px solid #eef1f5;
          flex-shrink: 0;
        }
        .flex.gap-2 {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          background: #f4f7fc;
          border-radius: 40px;
          padding: 2px 2px 2px 18px;
          border: 1.5px solid #dfe6f0;
          transition: 0.2s;
        }
        .input-wrapper:focus-within {
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .input-wrapper input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 11px 4px 11px 0;
          font-size: 14px;
          outline: none;
          color: #1b2a41;
        }
        .input-wrapper input::placeholder {
          color: #8b9bb5;
        }
        .input-wrapper .mic-btn {
          background: transparent;
          border: none;
          font-size: 20px;
          padding: 6px 12px 6px 6px;
          cursor: pointer;
          border-radius: 30px;
          transition: 0.2s;
          color: #4a6a8f;
        }
        .input-wrapper .mic-btn:hover {
          color: #2563eb;
          background: rgba(37, 99, 235, 0.06);
        }
        .btn-primary {
          background: #2563eb;
          border: none;
          color: #fff;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 600;
          padding: 12px 24px;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 4px 14px -2px rgba(37, 99, 235, 0.3);
          white-space: nowrap;
        }
        .btn-primary:hover {
          background: #1d4ed8;
        }
        .btn-primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        /* scrollbar */
        .ai-body::-webkit-scrollbar {
          width: 4px;
        }
        .ai-body::-webkit-scrollbar-track {
          background: #eef2f7;
        }
        .ai-body::-webkit-scrollbar-thumb {
          background: #c2d0e6;
          border-radius: 20px;
        }
      `}</style>
    </div>
  )
   }
