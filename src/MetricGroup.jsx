import { useState } from 'react'

function MetricItem({ label, value, color }) {
  return (
    <div
      style={{
        padding: '12px',
        borderRadius: '14px',
        background: 'rgba(255,255,255,.05)',
        border: '1px solid rgba(255,255,255,.08)'
      }}
    >
      <div
        style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,.6)',
          marginBottom: '4px'
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 700,
          fontSize: '14px',
          color: color || '#fff'
        }}
      >
        {value}
      </div>
    </div>
  )
}

function Group({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: 'rgba(255,255,255,.8)',
          marginBottom: '10px'
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          gap: '10px'
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default function MetricGroup({
  weather,
  todayStats,
  aqi,
  getAqiLevel,
  // NEW PROPS FOR AI CHAT
  lang,
  askWeather,
  isLoadingChat,
  speakScript,
  voiceToUse
}) {
  const [chatInput, setChatInput] = useState('')

  const placeholders = {
    en: 'Ask about rain, UV, wind...',
    fr: 'Posez une question météo...',
    es: 'Pregunta sobre el clima...',
    de: 'Frage zum Wetter stellen...',
    it: 'Fai una domanda sul meteo...',
    pt: 'Pergunte sobre o clima...',
    da: 'Spørg om vejret...',
    sv: 'Fråga om vädret...',
    no: 'Spør om været...',
    fi: 'Kysy säästä...',
    nl: 'Vraag naar het weer...',
    pl: 'Zapytaj o pogodę...',
    ru: 'Sprosite o pogode...',
    tr: 'Hava durumunu sor...',
    ar: 'Is\'al aan altaqs...',
    hi: 'Mausam ke baare mein poocho...',
    ja: 'Tenki ni tsuite kiite...',
    zh: 'Wèn wèn tiānqì...',
    ko: 'Nalssie daehae mul-eoboseoyo...'
  }

  async function handleChatSubmit(e) {
    e.preventDefault()
    if (!chatInput.trim() || isLoadingChat) return

    const answer = await askWeather(chatInput, weather, location, lang)
    speakScript(answer, voiceToUse) // Auto-speaks in local language
    setChatInput('')
  }

  return (
    <>
      <Group title="Atmosphere">
        <MetricItem
          label="AQI"
          value={aqi?.us_aqi?? '--'}
          color={getAqiLevel(aqi?.us_aqi).color}
        />

        <MetricItem
          label="Humidity"
          value={`${weather?.current?.relative_humidity_2m || 0}%`}
        />

        <MetricItem
          label="Pressure"
          value={`${Math.round(weather?.current?.pressure_msl || 0)} hPa`}
        />

        <MetricItem
          label="Visibility"
          value={`${Math.round((weather?.current?.visibility || 10000)/1000)} km`}
        />
      </Group>

      <Group title="Sky">
        <MetricItem
          label="UV Index"
          value={weather?.daily?.uv_index_max?.[0] || 0}
        />

        <MetricItem
          label="Sunshine"
          value={`${todayStats?.sunHours || 0}h`}
        />

        <MetricItem
          label="Rain"
          value={`${todayStats?.rainHours || 0}h`}
        />

        <MetricItem
          label="Thunder"
          value={`${todayStats?.thunderHours || 0}h`}
        />
      </Group>

      <Group title="Wind">
        <MetricItem
          label="Wind"
          value={`${Math.round(weather?.current?.wind_speed_10m || 0)} km/h`}
        />

        <MetricItem
          label="Wind Gust"
          value={`${Math.round(todayStats?.windGust || 0)} km/h`}
        />

        <MetricItem
          label="Feels Like"
          value={`${Math.round(todayStats?.feelsLike || 0)}°`}
        />
      </Group>

      <Group title="Sun">
        <MetricItem
          label="Sunrise"
          value={
            weather?.daily?.sunrise?.[0]
             ? new Date(weather.daily.sunrise[0]).toLocaleTimeString(
                  'en-US',
                  {
                    hour: '2-digit',
                    minute: '2-digit'
                  }
                )
              : '--'
          }
        />

        <MetricItem
          label="Sunset"
          value={
            weather?.daily?.sunset?.[0]
             ? new Date(weather.daily.sunset[0]).toLocaleTimeString(
                  'en-US',
                  {
                    hour: '2-digit',
                    minute: '2-digit'
                  }
                )
              : '--'
          }
        />
      </Group>

      {/* NEW: AI CHAT GROUP */}
      <div style={{ marginBottom: '10px' }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'rgba(255,255,255,.8)',
            marginBottom: '10px'
          }}
        >
          Ask Zephye
        </div>

        <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder={placeholders || placeholders.en}
            disabled={isLoadingChat}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.08)',
              color: '#fff',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            disabled={isLoadingChat ||!chatInput.trim()}
            className="glass"
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              border: '1px solid rgba(59,130,246,.3)',
              background: isLoadingChat? 'rgba(255,255,255,.03)' : 'rgba(59,130,246,.15)',
              color: '#fff',
              fontWeight: 600,
              cursor: isLoadingChat? 'not-allowed' : 'pointer'
            }}
          >
            {isLoadingChat? '...' : 'Ask'}
          </button>
        </form>
      </div>
    </>
  )
        }
