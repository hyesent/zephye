import { useState, useEffect, useRef } from 'react'
import { useAudio } from './AudioContext'
import { getMoonPhase, mapWeatherCode } from './data/calculations.js'

// 15 QNA modules
import { getClothingAdvice } from '../data/ClothingAdvice'
import { getLifestyleAdvice } from '../data/Lifestyle'
import { getSkinHairAdvice } from '../data/SkinHair'
import { getDrivingAdvice } from '../data/Driving'
import { getTravelingAdvice } from '../data/Traveling'
import { getFarmingAdvice } from '../data/Farming'
import { getStargazingAdvice } from '../data/Stargazing'
import { getPhotographyAdvice } from '../data/Photography'
import { getEventsAdvice } from '../data/Events'
import { getSportsAdvice } from '../data/Sports'
import { getHealthAdvice } from '../data/Health'
import { getDIYConstructionAdvice } from '../data/DIYconstruction'
import { getPetsAdvice } from '../data/Pets'
import { getEnergyHomeAdvice } from '../data/EnergyHome'

const GHOST_SUGGESTIONS = [
  'Ask "stargazing tonight" or "moon phase"',
  'Try "what should I wear" or "safe to run"',
  'Ask "will it rain" or "UV burn time"',
  'Type "paint drying time" or "best photo hour"'
]

const QNA_MAP = [
  {
    keys: ['wear', 'clothes', 'outfit', 'clothing', 'dress', 'jacket', 'shirt', 'pants', 'cold', 'hot', 'layer'],
    fn: getClothingAdvice,
    name: 'Clothing'
  },
  {
    keys: ['lifestyle', 'mood', 'energy', 'vibe', 'feel', 'tired', 'productivity', 'motivation'],
    fn: getLifestyleAdvice,
    name: 'Lifestyle'
  },
  {
    keys: ['skin', 'hair', 'sunscreen', 'uv', 'sunburn', 'tan', 'spf', 'dry skin'],
    fn: getSkinHairAdvice,
    name: 'SkinHair'
  },
  {
    keys: ['drive', 'driving', 'road', 'car', 'traffic', 'commute', 'trip car', 'highway'],
    fn: getDrivingAdvice,
    name: 'Driving'
  },
  {
    keys: ['travel', 'flight', 'trip', 'vacation', 'hotel', 'airport', 'tourist'],
    fn: getTravelingAdvice,
    name: 'Traveling'
  },
  {
    keys: ['farm', 'crop', 'plant', 'harvest', 'soil', 'irrigation', 'seed'],
    fn: getFarmingAdvice,
    name: 'Farming'
  },
  {
    keys: ['star', 'moon', 'astro', 'planet', 'meteor', 'telescope', 'night sky', 'constellation'],
    fn: getStargazingAdvice,
    name: 'Stargazing'
  },
  {
    keys: ['photo', 'camera', 'golden hour', 'shoot', 'picture', 'photography', 'lighting'],
    fn: getPhotographyAdvice,
    name: 'Photography'
  },
  {
    keys: ['event', 'party', 'wedding', 'outdoor', 'bbq', 'picnic', 'gathering'],
    fn: getEventsAdvice,
    name: 'Events'
  },
  {
    keys: ['sport', 'run', 'gym', 'workout', 'game', 'exercise', 'training', 'football', 'soccer', 'jog'],
    fn: getSportsAdvice,
    name: 'Sports'
  },
  {
    keys: ['health', 'allergy', 'asthma', 'sick', 'cold', 'flu', 'headache', 'medical'],
    fn: getHealthAdvice,
    name: 'Health'
  },
  {
    keys: ['diy', 'build', 'concrete', 'paint', 'construction', 'renovation', 'hammer', 'drill'],
    fn: getDIYConstructionAdvice,
    name: 'DIY'
  },
  {
    keys: ['pet', 'dog', 'cat', 'walk', 'animal', 'puppy', 'kitten'],
    fn: getPetsAdvice,
    name: 'Pets'
  },
  {
    keys: ['energy', 'power', 'solar', 'home', 'electricity', 'bill', 'ac', 'heating'],
    fn: getEnergyHomeAdvice,
    name: 'EnergyHome'
  },
  {
    keys: ['space', 'nasa', 'satellite', 'iss'],
    fn: getAstroAdvice,
    name: 'Astro'
  }
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
        body: JSON.stringify({ text, voice: voiceToUse })
      })
      const data = await res.json()
      if (data.success) {
        playGlobal(`https://hyezen.onrender.com${data.url}`)
      }
    } catch {}
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

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center">
        <button onClick={onClose} className="text-zinc-400 text-xl">←</button>
        <div className="flex-1 text-center text-white font-semibold">Ask Zephye AI</div>
        <button onClick={startListening} className="text-zinc-400 text-xl">🎤</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user'? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-2xl text-sm whitespace-pre-line max-w-[80%]
                ${msg.role === 'user'? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-100'}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {streamingText && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 p-3 rounded-2xl text-sm text-zinc-100">
                {streamingText}▋
              </div>
            </div>
          )}

          {isLoading &&!streamingText && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 p-3 rounded-2xl text-sm text-white/60">
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-zinc-800 p-3">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk(input)}
            placeholder={ghostText || "Ask Zephye..."}
            className="flex-1 bg-zinc-900 text-white p-3 rounded-xl outline-none"
          />
          <button
            onClick={() => handleAsk(input)}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 px-4 py-2 rounded-xl text-white disabled:bg-zinc-700 disabled:text-zinc-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
  }
