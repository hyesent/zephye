import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useAudio } from './AudioContext'
import { getMoonPhase, mapWeatherCode } from './data/calculations.js'

// ─── New pipeline ───────────────────────────────────────────────────────
import { detectIntents, INTENT_MAP } from './intentEngine.js'
import { resolveWeatherContext } from './weatherResolver.js'
import { mergeResponse } from './responseMerger.js'
import { formatResponse, formatForCopy } from './responseFormatter.js'

// ─── Recents + Pinned ───────────────────────────────────────────────────
import { addRecentAsk, getAskChips, pinAsk, unpinAsk } from './recentAsks.js'
import { getDefaultMode, setDefaultMode } from './preferences.js'

import {
  detectLanguageFromText,
  translateText,
  getVoiceForDetectedLanguage,
  LANGUAGE_NAMES,
  getVoiceForLocation
} from './zephyeHelpers'

import { useTranslation } from './utils/translation'

// 🔥 Schedule system
import ScheduleAskPanel from './ScheduleAskPanel.jsx'
import { parseScheduleQuestion } from './scheduleParser.js'
import { isScheduleCommand, detectFutureTime } from './scheduleEngine.js'

// ─── SVG ICONS ──────────────────────────────────────────────────────────

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
)

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

const SpeakIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
)

const StopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  </svg>
)

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

const ShareIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
)

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1.5"/>
    <circle cx="12" cy="12" r="1.5"/>
    <circle cx="12" cy="19" r="1.5"/>
  </svg>
)

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

// ─── CONFIG ────────────────────────────────────────────────────────────

const CONFIG = {
  MAX_SUGGESTIONS: 8,
  STREAM_DELAY_MS: 12,
  TTS_API: 'https://hyezen.onrender.com/api/tts',
  SUGGESTION_ROTATION_INTERVAL: 10000
}

// ─── HELPERS ───────────────────────────────────────────────────────────

const getSavedLocations = () => {
  try {
    const saved = localStorage.getItem('zephye_saved_locations')
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.filter(loc => loc.lat && loc.lon)
    }
    return []
  } catch {
    return []
  }
}

const getHomeLocation = () => {
  try {
    const saved = localStorage.getItem('zephye_home_location')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

// ─── TRANSLATION HELPER ────────────────────────────────────────────────

async function translateResponse(answer, targetLang, currentLang = 'en') {
  if (!answer || targetLang === 'en' || targetLang === currentLang) return answer
  if (typeof answer === 'string') return translateText(answer, targetLang)
  if (typeof answer !== 'object') return answer

  try {
    return {
      ...answer,
      verdict: answer.verdict ? await translateText(answer.verdict, targetLang) : '',
      summary: answer.summary ? await translateText(answer.summary, targetLang) : '',
      note: answer.note ? await translateText(answer.note, targetLang) : '',
      fullText: answer.fullText ? await translateText(answer.fullText, targetLang) : '',
      details: Array.isArray(answer.details)
        ? await Promise.all(answer.details.map(async (d) => ({
            ...d,
            label: d.label ? await translateText(d.label, targetLang) : '',
            value: d.value ? await translateText(d.value, targetLang) : ''
          })))
        : []
    }
  } catch (err) {
    console.warn('[translateResponse] failed:', err)
    return answer
  }
}

// ─── SAMPLE QUESTIONS ──────────────────────────────────────────────────

const SAMPLE_QUESTIONS = [
  "Will it rain tomorrow?", "What's the weather like at 2 PM?",
  "Will it be sunny this weekend?", "Is it going to rain tonight?",
  "What time will it rain tomorrow?", "Will it be hot tomorrow?",
  "Is it going to storm on Saturday?", "What's the forecast for Monday morning?",
  "Will it rain in the afternoon?", "Is it going to be windy tomorrow?",
  "Will it snow this week?", "What's the temperature going to be tomorrow?",
  "Will it be clear tonight?", "Is it going to rain on my commute?",
  "Will the weather be good this weekend?", "What should I wear today?",
  "Do I need an umbrella?", "Is it cold outside?", "Should I bring a jacket?",
  "Can I wear shorts?", "Do I need a raincoat?", "Is it hoodie weather?",
  "Should I wear sandals?", "Will I need sunglasses?", "What layers should I wear?",
  "Is it sweater weather?", "Do I need gloves?", "What shoes should I wear?",
  "Is it too hot for jeans?", "Should I wear a hat?", "Do I need sunscreen?",
  "Can I go jogging today?", "Is it good weather for a walk?",
  "Should I work out outside?", "Can I go to the park?",
  "Is it safe to run right now?", "Best time to exercise today?",
  "Can I walk my dog?", "Should I do outdoor yoga?", "Is it good cycling weather?",
  "Can I have a picnic today?", "Should I eat lunch outside?",
  "Is it good for reading in the park?", "Can I see stars tonight?",
  "Is it good for stargazing?", "Will the moon ruin stargazing?",
  "Can I see the Milky Way?", "Is it clear enough for a telescope?",
  "Best time to stargaze tonight?", "Will clouds block the stars?",
  "Can I see planets tonight?", "Is it good for meteor watching?",
  "Can I see the ISS tonight?", "Is Jupiter visible?", "Can I see Saturn's rings?",
  "Will fog be an issue?", "Is it safe to play football today?",
  "Should I cancel my marathon?", "Good weather for tennis?",
  "Is it too hot for soccer practice?", "Can kids play outside?",
  "Should I run in this weather?", "Is the field too wet for sports?",
  "Will wind affect my golf game?", "Is it safe for outdoor workouts?",
  "Should I swim outdoors today?", "Can I cycle in this wind?",
  "Is it safe for hiking?", "Basketball court too hot?",
  "Is it safe to walk my dog?", "Should I take my cat outside?",
  "Can my pet get heat stroke?", "Is the pavement too hot?",
  "Should I leave my dog in the car?", "Is it too cold for my pet?",
  "Can my dog play outside?", "Will my pet get sunburn?",
  "Is air quality bad for pets?", "Is it safe to go outside today?",
  "Will the weather affect my migraines?", "Is it bad for my arthritis?",
  "Should I worry about heat stroke?", "Will my allergies act up?",
  "Is it safe for elderly to go out?", "Can I exercise with my heart condition?",
  "Will humidity affect my breathing?", "Should I stay inside today?",
  "Is it a high pollution day?", "Will my sinuses be bad today?",
  "Should I worry about frostbite?", "Can I paint outside today?",
  "Is it good weather for concrete work?", "Should I stain my deck?",
  "Can I use power tools outside?", "Is it too humid for woodworking?",
  "Good day for roofing work?", "Will rain ruin my construction project?",
  "Can I pour concrete today?", "Is it safe to use a ladder?",
  "Is it good lighting for photos today?", "Should I do a photoshoot now?",
  "Is golden hour good today?", "Will clouds ruin my photos?",
  "Good weather for outdoor photography?", "Is it too harsh for portraits?",
  "Best time for landscape photos?", "Will rain affect my shoot?",
  "Should I bring lighting equipment?", "Is it good for astrophotography tonight?",
  "Can I shoot the Milky Way?", "Should I have my wedding outdoors today?",
  "Is it good weather for a picnic?", "Can I host a BBQ this weekend?",
  "Is it safe for an outdoor concert?", "Should I move my event indoors?",
  "Will rain cancel my party?", "Is it too windy for tents?",
  "Good weather for a beach day?", "Should I rent heaters for my event?",
  "Is it safe to drive today?", "Should I cycle to work?",
  "Good weather for motorbike?", "Are roads slippery?",
  "Is it too windy for cycling?", "Should I drive or take a cab?",
  "Will rain affect my commute?", "Is visibility bad for driving?",
  "Safe to ride my bike?", "Should I water my crops today?",
  "Is it good weather for planting?", "Will there be frost tonight?",
  "Do I need to irrigate?", "Is it safe to spray pesticides?",
  "Will rain damage my crops?", "Is it good harvesting weather?",
  "Should I cover my plants?", "Will humidity cause crop disease?",
  "Should I run AC today?", "Will my heating bill be high?",
  "Is it good weather to air out the house?", "Should I close windows?",
  "Do I need to run a dehumidifier?", "Will solar panels work well today?",
  "Should I use fans or AC?", "Is it cheap to heat the house today?",
  "Will my hair get frizzy today?", "Do I need sunscreen?",
  "Is it bad for my skin today?", "Will my makeup melt?",
  "Should I moisturize more?", "Is the air drying my skin?",
  "Do I need a hat?", "Will I get sunburned?",
  "Is it humid enough for curly hair?",
  "Traveling from Paris to London, weather?",
  "Mumbai to Delhi, what to expect?",
  "New York to Tokyo, should I pack a jacket?",
  "Lagos to Abuja, is there storm?",
  "Toronto to Montreal, flight weather?",
  "Road trip from LA to Vegas, weather?",
  "Flying to Dubai tomorrow, what should I wear?",
  "Train from Rome to Florence, conditions?",
  "Is there traffic on my route?", "Are there any accidents near me?",
  "What's the traffic like right now?", "Is there a road closure?",
  "How bad is the traffic today?", "Any traffic incidents in my area?",
  "Traffic to work?", "Is the highway congested?",
  "How do I get to Lagos?", "What's the route from Abuja to Kano?",
  "How long will it take to drive to work?",
  "What's the distance between Lagos and Ibadan?",
  "Give me directions to the airport", "Route from home to school",
  "Traffic on my way to work", "How long to get to the office?",
  "Show me the route with traffic", "What's the fastest way to get there?"
]

// ─── STRUCTURED RESPONSE COMPONENT ─────────────────────────────────────

function StructuredResponse({ data, onSpeak, isSpeaking, onCopy, t }) {
  const [showDetails, setShowDetails] = useState(false)
  const [showFull, setShowFull] = useState(false)

  if (!data || typeof data !== 'object') {
    return <div className="msg-content">{String(data)}</div>
  }

  const { verdict, summary, note, details, fullText } = data

  const handleShareComparison = () => {
    if (!data._raw || data._type !== 'comparison') return
    const items = (data._raw.items || []).map(item => ({
      label: item.label,
      weather: item.content?._rawBundle || { current: { temperature_2m: null, weather_code: null } },
      aqi: null,
    }))
    window.dispatchEvent(new CustomEvent('zephye:shareComparison', {
      detail: { items, takeaway: data._raw.takeaway || '' }
    }))
  }

  return (
    <div className="structured-response">
      <div className="verdict">{verdict}</div>
      <div className="summary">{summary}</div>
      {note && <div className="note">{note}</div>}

      <div className="response-actions">
        {details && details.length > 0 && (
          <button className="action-btn" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? t('buttons.hideDetails') : t('buttons.why')}
          </button>
        )}
        {fullText && (
          <button className="action-btn" onClick={() => setShowFull(!showFull)}>
            {showFull ? t('buttons.showLess') : t('buttons.moreDetails')}
          </button>
        )}
        {data._type === 'comparison' && (
          <button className="action-btn" onClick={handleShareComparison} title="Share comparison">
            Share
          </button>
        )}
      </div>

      {showDetails && details && details.length > 0 && (
        <div className="details-section">
          <div className="details-title">{t('labels.whyRecommendation')}</div>
          {details.map((d, i) => (
            <div key={i} className="detail-row">
              <span className="detail-label">{d.label}</span>
              <span className="detail-value">{d.value}</span>
            </div>
          ))}
        </div>
      )}

      {showFull && fullText && (
        <div className="full-section">
          <div className="full-text">{fullText}</div>
        </div>
      )}
    </div>
  )
}

// ─── FLATTEN FOR CHAT ──────────────────────────────────────────────────

function flattenForChat(merged, formatted, resolverOut) {
  if (!merged) {
    return {
      verdict: 'No response',
      summary: 'Something went wrong.',
      note: '',
      details: [],
      fullText: '',
    }
  }

  if (merged.type === 'comparison') {
    const sides = (merged.items || []).map(i => i.label).join(' vs ')
    const summary = merged.takeaway || `${merged.items?.length || 0} options compared.`
    return {
      verdict: merged.title || `Comparison: ${sides}`,
      summary,
      note: '',
      details: (merged.items || []).map(item => ({
        label: item.label,
        value: item.content?.verdict || item.content?.summary?.slice(0, 80) || '—',
      })),
      fullText: formatted.markdown,
      _type: 'comparison',
      _raw: merged,
    }
  }

  if (merged.type === 'route') {
    const summaryBits = []
    if (merged.distance) summaryBits.push(merged.distance)
    if (merged.duration) summaryBits.push(merged.duration)
    const summaryLine = summaryBits.length > 0
      ? `${summaryBits.join(' · ')}. ${merged.summary || ''}`.trim()
      : merged.summary || ''

    const warnings = merged.warnings || []
    const note = warnings.length > 0 ? warnings.join(' · ') : ''

    return {
      verdict: merged.title || `Route: ${merged.from} → ${merged.to}`,
      summary: summaryLine,
      note,
      details: (merged.waypoints || [])
        .filter(wp => wp.weather?.temp != null)
        .map(wp => ({
          label: wp.label,
          value: `${Math.round(wp.weather.temp)}°C · ${wp.weather.condition || '—'}${
            wp.weather.precipitationProb > 20
              ? ` · ${Math.round(wp.weather.precipitationProb)}% rain`
              : ''
          }`,
        })),
      fullText: formatted.markdown,
      _type: 'route',
      _raw: merged,
    }
  }

  if (merged.sections && merged.sections.length > 0) {
    return {
      verdict: merged.verdict || 'Multiple topics covered',
      summary: merged.summary || '',
      note: merged.note || '',
      details: merged.details || [],
      fullText: formatted.markdown,
      _sections: merged.sections,
    }
  }

  return {
    verdict: merged.verdict || '',
    summary: merged.summary || '',
    note: merged.note || '',
    details: merged.details || [],
    fullText: merged.fullText || formatted.markdown || '',
    _city: merged._city || resolverOut?.context?.location,
    _timeLabel: merged._timeLabel || resolverOut?.bundle?._timeLabel,
  }
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────

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
  voiceToUse: propVoiceToUse,
  uiLanguage = 'en'
}) {
  const { playGlobal, stopGlobal, isSpeaking } = useAudio()
  const { t } = useTranslation(uiLanguage, location?.country_code)

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [ghostText, setGhostText] = useState('')
  const [streamingText, setStreamingText] = useState('')
  const [moonPhase, setMoonPhase] = useState(0)
  const [savedLocations, setSavedLocations] = useState([])

  // Translation & Voice State
  const [detectedLanguage, setDetectedLanguage] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [genderPref, setGenderPref] = useState('female')

  // Recents + Pinned
  const [askChips, setAskChips] = useState({ pinned: [], recent: [] })

  // Suggestions State
  const [suggestions, setSuggestions] = useState([])
  const suggestionIntervalRef = useRef(null)

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const ghostIntervalRef = useRef(null)

  // Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Schedule State
  const [showSchedules, setShowSchedules] = useState(false)
  const [schedulePrefill, setSchedulePrefill] = useState(null)
  const [scheduleEditId, setScheduleEditId] = useState(null)
  const [showScheduleCard, setShowScheduleCard] = useState(false)
  const [parsedSchedule, setParsedSchedule] = useState(null)

  const voiceToUse = useMemo(() => {
    if (detectedLanguage !== 'en' && detectedLanguage !== lang) {
      const detectedVoice = getVoiceForDetectedLanguage(detectedLanguage, genderPref)
      if (detectedVoice) return detectedVoice
    }
    return propVoiceToUse
  }, [detectedLanguage, genderPref, propVoiceToUse, lang])

  useEffect(() => {
    if (input && input.trim().length > 2) {
      const detected = detectLanguageFromText(input)
      setDetectedLanguage(detected !== 'en' ? detected : 'en')
    }
  }, [input])

  useEffect(() => {
    if (messages.length === 1) {
      const getRandomSuggestions = () => {
        const shuffled = [...SAMPLE_QUESTIONS]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled.slice(0, 4)
      }
      setSuggestions(getRandomSuggestions())
      suggestionIntervalRef.current = setInterval(() => {
        setSuggestions(getRandomSuggestions())
      }, CONFIG.SUGGESTION_ROTATION_INTERVAL)
      return () => {
        if (suggestionIntervalRef.current) clearInterval(suggestionIntervalRef.current)
      }
    } else {
      if (suggestionIntervalRef.current) {
        clearInterval(suggestionIntervalRef.current)
        suggestionIntervalRef.current = null
      }
    }
  }, [messages.length])

  // Refresh chips
  useEffect(() => {
    if (isOpen) {
      setAskChips(getAskChips())
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    if (!input || input.trim().length < 5) {
      setShowScheduleCard(false)
      setParsedSchedule(null)
      return
    }
    const timer = setTimeout(() => {
      try {
        const parsed = parseScheduleQuestion(input, getSavedLocations(), getHomeLocation())
        if (parsed && parsed.confidence >= 60 && parsed.targetTime) {
          setParsedSchedule(parsed)
          setShowScheduleCard(true)
        } else {
          setShowScheduleCard(false)
          setParsedSchedule(null)
        }
      } catch {
        setShowScheduleCard(false)
        setParsedSchedule(null)
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [input])

  useEffect(() => {
    const handleOpen = () => {
      setShowSchedules(true)
      setScheduleEditId(null)
      setSchedulePrefill(null)
    }
    const handlePrefill = (e) => {
      setShowSchedules(true)
      setSchedulePrefill(e.detail)
      setScheduleEditId(null)
    }
    const handleEdit = (e) => {
      setShowSchedules(true)
      setScheduleEditId(e.detail.id)
      setSchedulePrefill(null)
    }
    const handlePushMessage = async (e) => {
      const result = e.detail.result
      if (!result) return
      const raw = {
        verdict: 'Scheduled ask result',
        summary: result.toastSummary || '',
        note: '',
        details: [],
        fullText: result.merged || ''
      }
      // Translate if the user is on non-English
      let content = raw
      if (detectedLanguage !== 'en' && detectedLanguage !== lang) {
        try {
          content = await translateResponse(raw, detectedLanguage, 'en')
        } catch {}
      }
      setMessages(prev => [...prev, { role: 'assistant', content }])
    }

    window.addEventListener('zephye:openSchedules', handleOpen)
    window.addEventListener('zephye:prefillSchedule', handlePrefill)
    window.addEventListener('zephye:editSchedule', handleEdit)
    window.addEventListener('zephye:pushMessage', handlePushMessage)

    return () => {
      window.removeEventListener('zephye:openSchedules', handleOpen)
      window.removeEventListener('zephye:prefillSchedule', handlePrefill)
      window.removeEventListener('zephye:editSchedule', handleEdit)
      window.removeEventListener('zephye:pushMessage', handlePushMessage)
    }
  }, [detectedLanguage, lang])

  const weatherData = useMemo(() => ({
    temp: Math.round(weather?.current?.temperature_2m || 0),
    feelsLike: Math.round(weather?.current?.apparent_temperature || weather?.current?.temperature_2m || 0),
    humidity: weather?.current?.relative_humidity_2m || 0,
    wind: weather?.current?.wind_speed_10m || 0,
    windDir: weather?.current?.wind_direction_10m || 0,
    windGust: weather?.current?.wind_gusts_10m || weather?.hourly?.wind_gusts_10m?.[0] || 0,
    uvIndex: weather?.current?.uv_index || weather?.daily?.uv_index_max?.[0] || 0,
    aqi: aqi?.us_aqi || 0,
    visibility: weather?.current?.visibility ? weather.current.visibility / 1000 : 10,
    conditionCode: weather?.current?.weather_code || 0,
    condition: mapWeatherCode(weather?.current?.weather_code || 0),
    pressure: weather?.current?.pressure_msl || 0,
    precipitation: weather?.current?.precipitation || 0,
    precipitationProb: weather?.hourly?.precipitation_probability?.[0] || 0,
    cloudCover: weather?.current?.cloud_cover || weather?.hourly?.cloud_cover?.[0] || 0,
    dewPoint: weather?.current?.dew_point || weather?.hourly?.dew_point?.[0] || 0,
    solarRadiation: weather?.current?.shortwave_radiation || 0,
    tempMax: weather?.daily?.temperature_2m_max?.[0] || 0,
    tempMin: weather?.daily?.temperature_2m_min?.[0] || 0,
    sunrise: weather?.daily?.sunrise?.[0] || '',
    sunset: weather?.daily?.sunset?.[0] || '',
    city: location?.name || 'Unknown',
    lat: location?.lat || 0,
    lon: location?.lon || 0,
    moonPhase,
    season: ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'fall', 'fall', 'fall', 'winter'][new Date().getMonth()],
    timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening',
    hourly: weather?.hourly || {},
    daily: weather?.daily || {},
    savedLocations,
    homeLat: location?.lat,
    homeLon: location?.lon,
    homeName: location?.name
  }), [weather, aqi, location, moonPhase, savedLocations])

  const aqiLevel = useMemo(() => {
    if (aqi == null) return { label: t('aqi.unknown'), color: '#6b7280' }
    if (aqi <= 50) return { label: t('aqi.good'), color: '#22c55e' }
    if (aqi <= 100) return { label: t('aqi.moderate'), color: '#eab308' }
    if (aqi <= 150) return { label: t('aqi.unhealthy'), color: '#f97316' }
    if (aqi <= 200) return { label: t('aqi.unhealthy'), color: '#ef4444' }
    return { label: t('aqi.hazardous'), color: '#dc2626' }
  }, [aqi, t])

  useEffect(() => {
    if (isOpen) setSavedLocations(getSavedLocations())
  }, [isOpen])

  useEffect(() => {
    if (isOpen && location?.lat && location?.lon) {
      getMoonPhase(location.lat, location.lon).then(setMoonPhase)
    }
  }, [isOpen, location])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const condition = mapWeatherCode(weatherData.conditionCode)
      setMessages([
        {
          role: 'assistant',
          content: {
            verdict: `${greeting || 'Hello'}, ${userName || location?.name?.split(',')[0] || 'there'}`,
            summary: `${location?.name || 'Your location'} • ${weatherData.temp}°C • ${condition} • ${t('labels.aqi')} ${aqiLevel.label}`,
            note: t('greetings.howCanIHelp'),
            details: [],
            fullText: ''
          }
        }
      ])
    }
  }, [isOpen, messages.length, greeting, userName, location, weatherData, aqiLevel, t])

  useEffect(() => {
    if (input) {
      setGhostText('')
      return
    }
    const suggestionsList = [
      t('chat.askStargazing'), t('chat.tryWear'), t('chat.askRain'),
      t('chat.compareToday'), t('chat.askBiking'), t('chat.tryDrive')
    ]
    let i = 0
    setGhostText(suggestionsList[0])
    ghostIntervalRef.current = setInterval(() => {
      i = (i + 1) % suggestionsList.length
      setGhostText(suggestionsList[i])
    }, 3000)
    return () => {
      if (ghostIntervalRef.current) clearInterval(ghostIntervalRef.current)
    }
  }, [input, t])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const speakText = useCallback(async (text) => {
    if (isSpeaking) {
      stopGlobal()
      return
    }
    let speakableText = text
    if (typeof text === 'object' && text !== null) {
      speakableText = `${text.verdict || ''} ${text.summary || ''} ${text.note || ''}`
    }
    const cleanText = String(speakableText)
      .replace(/\*\*/g, '').replace(/#/g, '').replace(/•/g, '')
      .replace(/─+/g, '').replace(/═+/g, '')
      .replace(/\n/g, '. ').replace(/\s+/g, ' ').trim()
    if (!cleanText) return
    try {
      const res = await fetch(CONFIG.TTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, voice: voiceToUse, type: 'fair' })
      })
      const data = await res.json()
      if (data.success) {
        playGlobal(`https://hyezen.onrender.com${data.url}`, voiceToUse)
      }
    } catch {}
  }, [isSpeaking, stopGlobal, playGlobal, voiceToUse])

  const copyText = useCallback((text) => {
    let copyable = ''
    if (typeof text === 'object' && text !== null) {
      try {
        copyable = formatForCopy(text, {
          location: text._city,
          timeLabel: text._timeLabel,
        })
      } catch {
        copyable = `${text.verdict || ''}\n${text.summary || ''}\n${text.note || ''}`
        if (text.fullText) copyable += `\n\n${text.fullText}`
      }
    } else {
      copyable = String(text)
    }
    navigator.clipboard.writeText(copyable).catch(() => {})
  }, [])

  const startListening = useCallback(() => {
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
  }, [lang])

  const routeQuestion = useCallback(async (question) => {
    if (!question || !question.trim()) {
      return {
        verdict: 'Ask me something',
        summary: 'Try "will it rain tomorrow?" or "weather and my route to work".',
        note: '', details: [], fullText: '',
      }
    }

    let resolverOut
    try {
      resolverOut = await resolveWeatherContext({
        question,
        baseWeather: weatherData,
        baseAqi: aqi,
        location,
        savedLocations: getSavedLocations(),
        homeLocation: getHomeLocation(),
      })
    } catch (err) {
      console.error('[routeQuestion] resolver failed:', err)
      return {
        verdict: "Couldn't figure out what to look up",
        summary: 'Try rephrasing, or mention a specific place or time.',
        note: '', details: [], fullText: '',
      }
    }

    let detectedIntents = []
    try {
      detectedIntents = detectIntents(question)
    } catch (err) {
      console.error('[routeQuestion] intent detection failed:', err)
    }

    let intents = detectedIntents.map(d => d.intent).filter(Boolean)
    if (intents.length === 0) {
      const weatherIntent = INTENT_MAP.find(i => i.id === 'weather')
      if (weatherIntent && resolverOut.bundle) intents = [weatherIntent]
    }

    let merged
    try {
      merged = await mergeResponse(resolverOut, intents, question)
    } catch (err) {
      console.error('[routeQuestion] merger failed:', err)
      return {
        verdict: 'Unable to assemble response',
        summary: 'Something went wrong while building the answer.',
        note: '', details: [], fullText: '',
      }
    }

    const context = {
      location: resolverOut.context?.location || resolverOut.bundle?.city,
      timeLabel: resolverOut.bundle?._timeLabel,
    }

    let formatted
    try {
      formatted = formatResponse(merged, context)
    } catch (err) {
      console.error('[routeQuestion] formatter failed:', err)
      formatted = {
        markdown: merged?.summary || merged?.verdict || '',
        plainText: merged?.summary || merged?.verdict || '',
      }
    }

    return flattenForChat(merged, formatted, resolverOut)
  }, [weatherData, aqi, location])

  const handleAsk = useCallback(async (question) => {
    if (!question.trim()) return

    if (isScheduleCommand(question)) {
      setShowSchedules(true)
      setScheduleEditId(null)
      setSchedulePrefill(null)
      setInput('')
      setShowScheduleCard(false)
      setParsedSchedule(null)
      return
    }

    const detectedLang = detectLanguageFromText(question)
    if (detectedLang !== 'en') setDetectedLanguage(detectedLang)

    let englishQuestion = question
    const needsTranslation = detectedLang !== 'en' && detectedLang !== lang

    if (needsTranslation) {
      setIsTranslating(true)
      englishQuestion = await translateText(question, 'en')
      setIsTranslating(false)
    }

    setMessages(prev => [...prev, {
      role: 'user',
      content: question,
      originalLang: detectedLang
    }])

    // Track recent
    if (question.trim().length > 3) {
      try { addRecentAsk(question.trim()) } catch {}
    }

    setInput('')
    setIsLoading(true)
    setStreamingText('')
    setShowScheduleCard(false)
    setParsedSchedule(null)

    try {
      const answer = await routeQuestion(englishQuestion)

      let finalAnswer = answer
      if (needsTranslation) {
        setIsTranslating(true)
        finalAnswer = await translateResponse(answer, detectedLang, 'en')
        setIsTranslating(false)
      }

      let streamText = ''
      if (typeof finalAnswer === 'string') {
        for (const word of finalAnswer.split(' ')) {
          streamText += word + ' '
          setStreamingText(streamText)
          await new Promise(r => setTimeout(r, CONFIG.STREAM_DELAY_MS))
        }
      } else if (typeof finalAnswer === 'object' && finalAnswer.verdict) {
        const streamable = `${finalAnswer.verdict} ${finalAnswer.summary}`
        for (const word of streamable.split(' ')) {
          streamText += word + ' '
          setStreamingText(streamText)
          await new Promise(r => setTimeout(r, CONFIG.STREAM_DELAY_MS))
        }
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: finalAnswer,
        originalLang: detectedLang,
        originalEnglish: needsTranslation && typeof answer === 'object' ? answer : null
      }])
      setStreamingText('')

      if (voiceToUse) speakText(finalAnswer)

    } catch (e) {
      console.error('Error:', e)
      const fallback = `${t('zephye.errorGettingAdvice')} ${weatherData.temp}°C ${t('zephye.withCondition')} ${weatherData.condition}.`
      const finalFallback = needsTranslation
        ? await translateText(fallback, detectedLang)
        : fallback
      setMessages(prev => [...prev, { role: 'assistant', content: finalFallback }])
    } finally {
      setIsLoading(false)
    }
  }, [routeQuestion, weatherData, voiceToUse, speakText, lang, t])

  if (!isOpen) return null

  if (!weather) {
    return (
      <div className="ai-fullscreen">
        <div className="ai-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className="text-muted">{t('buttons.loading')}</p>
        </div>
      </div>
    )
  }

  const cityName = location?.name?.split(',')[0] || 'City'
  const temp = weatherData.temp
  const aqiLabel = aqiLevel.label
  const condition = weatherData.condition

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }

  const currentMode = (() => { try { return getDefaultMode() } catch { return 'car' } })()

  return (
    <div className="ai-fullscreen">
      <div className="ai-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
        minHeight: '64px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px 6px' }}>
            <BackIcon />
          </button>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px', letterSpacing: '-0.3px', lineHeight: '1.3' }}>
              ZEPHYE
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400', letterSpacing: '0.2px' }}>
              {t('labels.weatherIntelligence')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>
              {cityName} · {temp}°C
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{t('labels.aqi')}</span>
              <span style={{ color: aqiLevel.color, fontWeight: '500' }}>{aqiLabel}</span>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                padding: '4px 6px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <MoreIcon />
            </button>

            {isMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: '200px',
                background: 'rgba(15,23,42,0.96)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    setShowSchedules(true)
                    setScheduleEditId(null)
                    setSchedulePrefill(null)
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 15 }}>⏰</span>
                  <span>{t('schedule.menuItem')}</span>
                </button>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

                <div style={{ padding: '4px 10px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('labels.voice')}
                </div>
                <button
                  onClick={() => { setGenderPref('female'); setIsMenuOpen(false) }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: genderPref === 'female' ? 'rgba(56,189,248,0.15)' : 'transparent',
                    border: 'none',
                    color: genderPref === 'female' ? 'var(--accent)' : 'var(--text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {t('buttons.female')}
                </button>
                <button
                  onClick={() => { setGenderPref('male'); setIsMenuOpen(false) }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: genderPref === 'male' ? 'rgba(56,189,248,0.15)' : 'transparent',
                    border: 'none',
                    color: genderPref === 'male' ? 'var(--accent)' : 'var(--text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {t('buttons.male')}
                </button>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

                <div style={{ padding: '4px 10px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Default Travel Mode
                </div>
                {['car', 'walking', 'cycling', 'hiking'].map(m => (
                  <button
                    key={m}
                    onClick={() => { setDefaultMode(m); setIsMenuOpen(false) }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      background: currentMode === m ? 'rgba(56,189,248,0.15)' : 'transparent',
                      border: 'none',
                      color: currentMode === m ? 'var(--accent)' : 'var(--text)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      textTransform: 'capitalize',
                    }}
                  >
                    {m}
                  </button>
                ))}

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

                {detectedLanguage !== 'en' && (
                  <>
                    <div style={{ padding: '4px 10px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {t('labels.language')}
                    </div>
                    <div style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GlobeIcon />
                      {LANGUAGE_NAMES[detectedLanguage] || detectedLanguage}
                      {isTranslating && ' ⌛'}
                    </div>
                    <button
                      onClick={() => { setShowOriginal(!showOriginal); setIsMenuOpen(false) }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        background: showOriginal ? 'rgba(56,189,248,0.15)' : 'transparent',
                        border: 'none',
                        color: showOriginal ? 'var(--accent)' : 'var(--text)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {showOriginal ? t('buttons.hideOriginal') : t('buttons.showOriginal')}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ai-body" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', width: '100%' }}>

          {messages.length === 1 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '300px',
              textAlign: 'center',
              padding: '20px'
            }}>
              <div style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <span>{cityName}</span>
                <span style={{ opacity: 0.3 }}>·</span>
                <span>{temp}°C</span>
                <span style={{ opacity: 0.3 }}>·</span>
                <span>{condition}</span>
                <span style={{ opacity: 0.3 }}>·</span>
                <span style={{ color: aqiLevel.color }}>{t('labels.aqi')} {aqiLabel}</span>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>
                {t(`greetings.${getTimeOfDay()}`)}, {userName || 'there'}
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                {t('greetings.howCanIHelp')}
              </p>

              {(askChips.pinned.length > 0 || askChips.recent.length > 0) && (
                <div style={{
                  width: '100%',
                  maxWidth: '520px',
                  marginBottom: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
                  {askChips.pinned.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                        color: 'var(--text-muted)', textTransform: 'uppercase',
                        marginBottom: 6, textAlign: 'left',
                      }}>📌 Pinned</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {askChips.pinned.map((q, i) => (
                          <button
                            key={`pin-${i}`}
                            onClick={() => handleAsk(q)}
                            onContextMenu={(e) => {
                              e.preventDefault()
                              unpinAsk(q)
                              setAskChips(getAskChips())
                            }}
                            style={{
                              padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                              background: 'rgba(56,189,248,0.1)',
                              border: '1px solid rgba(56,189,248,0.3)',
                              color: '#7dd3fc', cursor: 'pointer',
                            }}
                            title="Right-click to unpin"
                          >
                            {q.length > 40 ? q.slice(0, 40) + '…' : q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {askChips.recent.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                        color: 'var(--text-muted)', textTransform: 'uppercase',
                        marginBottom: 6, textAlign: 'left',
                      }}>Recent</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {askChips.recent.slice(0, 6).map((q, i) => (
                          <button
                            key={`rec-${i}`}
                            onClick={() => handleAsk(q)}
                            onContextMenu={(e) => {
                              e.preventDefault()
                              pinAsk(q)
                              setAskChips(getAskChips())
                            }}
                            style={{
                              padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: 'var(--text)', cursor: 'pointer',
                            }}
                            title="Right-click to pin"
                          >
                            {q.length > 40 ? q.slice(0, 40) + '…' : q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                width: '100%',
                maxWidth: '420px'
              }}>
                {suggestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleAsk(q)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      textAlign: 'left',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      lineHeight: '1.4',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isStructured = msg.content && typeof msg.content === 'object' && msg.content.verdict
              return (
                <div key={i} style={{
                  display: 'flex',
                  marginBottom: 12,
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div className={`chat-bubble ${msg.role}`}>
                    {msg.role === 'assistant' && (
                      <div className="msg-actions-top">
                        <button className="speak-btn" onClick={() => speakText(msg.content)} title={isSpeaking ? 'Stop' : 'Speak'}>
                          {isSpeaking ? <StopIcon /> : <SpeakIcon />}
                        </button>
                        <button className="speak-btn" onClick={() => copyText(msg.content)} title="Copy">
                          <CopyIcon />
                        </button>
                      </div>
                    )}

                    {showOriginal && msg.originalEnglish && msg.role === 'assistant' && (
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        marginBottom: '8px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        {typeof msg.originalEnglish === 'object'
                          ? msg.originalEnglish.verdict || msg.originalEnglish.summary || ''
                          : msg.originalEnglish}
                      </div>
                    )}

                    {isStructured ? (
                      <StructuredResponse
                        data={msg.content}
                        onSpeak={() => speakText(msg.content)}
                        isSpeaking={isSpeaking}
                        onCopy={() => copyText(msg.content)}
                        t={t}
                      />
                    ) : (
                      <div className="msg-content">{String(msg.content)}</div>
                    )}

                    {msg.originalLang && msg.originalLang !== 'en' && (
                      <div style={{
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        marginTop: '6px',
                        opacity: 0.5
                      }}>
                        {LANGUAGE_NAMES[msg.originalLang] || msg.originalLang}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}

          {streamingText && (
            <div style={{ display: 'flex', marginBottom: 12 }}>
              <div className="chat-bubble ai">{streamingText}▋</div>
            </div>
          )}

          {isLoading && !streamingText && (
            <div style={{ display: 'flex', marginBottom: 12 }}>
              <div className="chat-bubble ai text-muted">{t('chat.thinking')}</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {showScheduleCard && parsedSchedule && (
        <div style={{
          maxWidth: '768px',
          margin: '0 auto 8px',
          padding: '12px 14px',
          background: 'rgba(56,189,248,0.08)',
          border: '1px solid rgba(56,189,248,0.25)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginLeft: 16,
          marginRight: 16
        }}>
          <span style={{ fontSize: 20 }}>⏰</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              {t('schedule.scheduleThisAsk')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {parsedSchedule.timePhrase || 'Detected future time'}
            </div>
          </div>
          <button
            onClick={() => {
              setSchedulePrefill(parsedSchedule)
              setShowSchedules(true)
              setShowScheduleCard(false)
            }}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: 12, borderRadius: 8 }}
          >
            {t('schedule.setUp')}
          </button>
          <button
            onClick={() => setShowScheduleCard(false)}
            className="btn-ghost"
            style={{ padding: 4, fontSize: 18, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      <div className="ai-input-wrap" style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px',
        flexShrink: 0,
        background: 'var(--bg-deep)'
      }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="input-wrapper">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk(input)}
              placeholder={ghostText || t('placeholders.askZephye')}
              disabled={isLoading}
            />
            <button className="mic-btn" onClick={startListening} title="Voice input">
              <MicIcon />
            </button>
          </div>
          <button
            onClick={() => handleAsk(input)}
            disabled={!input.trim() || isLoading}
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 16px', borderRadius: '40px' }}
          >
            <SendIcon />
          </button>
        </div>
      </div>

      {showSchedules && (
        <ScheduleAskPanel
          onClose={() => {
            setShowSchedules(false)
            setScheduleEditId(null)
            setSchedulePrefill(null)
          }}
          savedLocations={getSavedLocations()}
          homeLocation={getHomeLocation()}
          prefilledData={schedulePrefill}
          editScheduleId={scheduleEditId}
          uiLanguage={uiLanguage}
        />
      )}

      <style jsx>{`
        .ai-fullscreen {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: var(--bg-deep);
          display: flex;
          flex-direction: column;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .ai-body { flex: 1; overflow-y: auto; padding: 16px; scroll-behavior: smooth; }
        .input-wrapper {
          flex: 1; display: flex; align-items: center;
          background: rgba(255,255,255,0.06);
          border-radius: 40px;
          padding: 2px 2px 2px 18px;
          border: 1.5px solid var(--glass-border);
          transition: 0.2s;
        }
        .input-wrapper:focus-within {
          border-color: var(--accent);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.15);
        }
        .input-wrapper input {
          flex: 1; border: none; background: transparent;
          padding: 11px 4px 11px 0;
          font-size: 14px; outline: none; color: var(--text);
        }
        .input-wrapper input::placeholder { color: var(--text-muted); }
        .input-wrapper .mic-btn {
          background: transparent; border: none;
          padding: 6px 12px 6px 6px; cursor: pointer;
          border-radius: 30px; transition: 0.2s;
          color: var(--text-muted);
          display: flex; align-items: center;
        }
        .input-wrapper .mic-btn:hover {
          color: var(--accent);
          background: rgba(56,189,248,0.12);
        }
        .btn-primary {
          background: var(--accent); color: var(--bg-deep);
          border: none; font-weight: 600; cursor: pointer;
          transition: 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.85; transform: scale(0.97); }
        .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }
        .btn-ghost {
          background: transparent; border: none;
          color: var(--text-muted); cursor: pointer;
          padding: 4px 8px; border-radius: 8px;
          transition: 0.2s;
          display: flex; align-items: center;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.06); color: var(--text); }
        .chat-bubble {
          max-width: 92%; padding: 14px 16px;
          border-radius: 16px; font-size: 14px;
          line-height: 1.6; position: relative;
          word-break: break-word;
        }
        .chat-bubble.user {
          background: var(--accent); color: var(--bg-deep);
          border-bottom-right-radius: 4px;
        }
        .chat-bubble.ai {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
          border-bottom-left-radius: 4px;
        }
        .chat-bubble .msg-actions-top {
          display: flex; gap: 6px; margin-bottom: 8px;
          opacity: 0; transition: opacity 0.2s;
        }
        .chat-bubble:hover .msg-actions-top { opacity: 1; }
        .chat-bubble .speak-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 4px 8px; border-radius: 6px;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border);
          color: var(--text-muted); font-size: 12px; cursor: pointer;
        }
        .chat-bubble .speak-btn:hover { background: rgba(255,255,255,0.12); }
        .chat-bubble .msg-content { white-space: pre-wrap; }
        .text-muted { color: var(--text-muted); }
        .ai-body::-webkit-scrollbar { width: 4px; }
        .ai-body::-webkit-scrollbar-track { background: transparent; }
        .ai-body::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1); border-radius: 4px;
        }
        .ai-body::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .structured-response { width: 100%; }
        .structured-response .verdict {
          font-size: 16px; font-weight: 600;
          margin-bottom: 6px; color: var(--text);
        }
        .structured-response .summary {
          font-size: 14px; color: var(--text);
          line-height: 1.6; margin-bottom: 8px;
        }
        .structured-response .note {
          font-size: 13px; color: var(--text-muted);
          margin-bottom: 12px; padding: 8px 12px;
          background: rgba(255,255,255,0.04);
          border-radius: 8px;
          border-left: 2px solid var(--accent);
        }
        .structured-response .response-actions {
          display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;
        }
        .structured-response .action-btn {
          padding: 4px 12px; border-radius: 16px;
          font-size: 12px; font-weight: 500;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-muted); cursor: pointer;
          transition: all 0.2s;
        }
        .structured-response .action-btn:hover {
          background: rgba(255,255,255,0.12); color: var(--text);
        }
        .structured-response .details-section {
          margin-top: 12px; padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .structured-response .details-title {
          font-size: 12px; font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .structured-response .detail-row {
          display: flex; justify-content: space-between;
          padding: 4px 0; font-size: 13px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .structured-response .detail-row:last-child { border-bottom: none; }
        .structured-response .detail-label {
          color: var(--text-muted); font-weight: 500;
        }
        .structured-response .detail-value {
          color: var(--text); text-align: right;
        }
        .structured-response .full-section {
          margin-top: 12px; padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .structured-response .full-text {
          font-size: 13px; color: var(--text-muted);
          line-height: 1.7; white-space: pre-wrap;
          background: rgba(255,255,255,0.03);
          padding: 12px; border-radius: 8px;
        }
      `}</style>
    </div>
  )
}
