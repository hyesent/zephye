import { useMemo, useState } from 'react'
import LiveIndicator from './LiveIndicator'
import TranscriptBubble from './TranscriptBubble'

import { useTranslation } from './utils/translation'

export default function ZephyeAIPanel({
  weather,
  todayStats,
  aqi,
  location,
  voices,
  selectedVoice,
  setSelectedVoice,
  userName,
  setUserName,
  briefMode,
  setBriefMode,
  isSpeaking,
  speakScript,
  buildScript,
  getAqiLevel,
  lang,
  voiceToUse,
  greeting,
  askWeather,
  isLoadingChat,
  uiLanguage = 'en'
}) {
  const { t } = useTranslation(uiLanguage, location?.country_code)
  const [mode, setMode] = useState('reporter')

  const code = weather?.current?.weather_code || 0

  const background = useMemo(() => {
    if (code >= 95) {
      return 'linear-gradient(135deg,rgba(249,115,22,.12),rgba(239,68,68,.12))'
    }

    if (code >= 51) {
      return 'linear-gradient(135deg,rgba(14,165,233,.12),rgba(6,182,212,.12))'
    }

    return 'linear-gradient(135deg,rgba(59,130,246,.12),rgba(147,51,234,.12))'
  }, [code])


  return (
    <>
      <div
        className="glass"
        style={{
          padding: 20,
          borderRadius: 24,
          background,
          border: '1px solid rgba(255,255,255,.08)'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18
          }}
        >
          <div>
            <div
              style={{
                fontSize: 19,
                fontWeight: 750,
                letterSpacing: '-.03em'
              }}
            >
              Weather briefing
            </div>

            <div
              style={{
                color: 'rgba(255,255,255,.6)',
                fontSize: 13,
                marginTop: 4
              }}
            >
              {userName
              ? `${greeting}, ${userName}`
                : `${greeting}, ${location?.name?.split(',')[0]}`}
            </div>
          </div>

          {isSpeaking && <LiveIndicator location={location} uiLanguage={uiLanguage} />}
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 18
          }}
        >
          <button
            className="glass"
            onClick={() => setBriefMode(!briefMode)}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 14,
              border: briefMode? '1px solid #3b82f6' : '1px solid rgba(255,255,255,.08)',
              background: briefMode? 'rgba(59,130,246,.15)' : 'rgba(255,255,255,.03)',
              color: '#fff'
            }}
          >
            {briefMode? `${t('buttons.brief')}` : `${t('buttons.full')}`}
          </button>

          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 14,
              background: 'rgba(255,255,255,.05)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,.08)'
            }}
          >
            {voices.map(v => (
              <option key={v.name} value={v.name}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Transcript */}
        <TranscriptBubble
          text={buildScript()}
          isSpeaking={isSpeaking}
          uiLanguage={uiLanguage}
        />

        {/* Button */}
        <button
          onClick={() => speakScript()}
          style={{
            width: '100%',
            marginTop: 10,
            padding: 16,
            borderRadius: 18,
            border: 'none',
            background: isSpeaking
            ? 'rgba(239,68,68,.2)'
              : 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 15,
            cursor: 'pointer'
          }}
        >
          {isSpeaking
          ? `${t('buttons.speaking')}`
            : `${t('buttons.beginBriefing')}`}
        </button>
      </div>
    </>
  )
}
