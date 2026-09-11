import { useState, useEffect } from 'react'
import { generateWeatherImage } from '../utils/weatherShareCanvas'
import { getHourlySlice } from '../utils/weatherHighlights'
import { codeToEmoji } from '../utils/weatherHighlights'

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const SHARE_TYPES = [
  { id: 'current', label: '⛅ Current', desc: 'Weather right now' },
  { id: 'today', label: '📅 Today', desc: 'Full day summary' },
  { id: 'hourly', label: '⏰ Hourly', desc: 'Next 12 hours' },
  { id: 'singleHour', label: '🕐 Single Hour', desc: 'Pick one hour' },
  { id: 'weekly', label: '📆 Weekly', desc: '7-day forecast' }
]

export default function WeatherShareModal({
  isOpen,
  onClose,
  initialType = 'current',
  weather,
  location,
  todayStats,
  aqi
}) {
  const [activeType, setActiveType] = useState(initialType)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedHourIndex, setSelectedHourIndex] = useState(0)

  const hourlyData = getHourlySlice(weather?.hourly, 12)

  // Reset type when modal opens with a new initial type
  useEffect(() => {
    if (isOpen && initialType) {
      setActiveType(initialType)
      setSelectedHourIndex(0)
    }
  }, [isOpen, initialType])

  // Generate preview whenever type or hour changes
  useEffect(() => {
    if (!isOpen) return
    let cancelled = false

    const generate = async () => {
      setIsGenerating(true)
      setPreviewUrl(null)

      const type = activeType === 'singleHour' ? 'singleHour' : activeType
      const params = {
        weather, location, todayStats, aqi,
        hourIndex: activeType === 'singleHour' ? selectedHourIndex : undefined
      }

      const url = await generateWeatherImage(type, params)

      if (!cancelled) {
        setPreviewUrl(url)
        setIsGenerating(false)
      }
    }

    generate()
    return () => { cancelled = true }
  }, [isOpen, activeType, selectedHourIndex, weather, location, todayStats, aqi])

  const handleShareImage = async () => {
    if (!previewUrl || !navigator.share) {
      alert('Web Share API not supported. Please use "Download Image".')
      return
    }
    try {
      const response = await fetch(previewUrl)
      const blob = await response.blob()
      const fileName = `zephye-weather-${activeType}-${Date.now()}.png`
      const file = new File([blob], fileName, { type: 'image/png' })

      const shareText = `Weather for ${location?.name || 'my location'} via Zephye`

      const shareData = {
        title: 'Zephye Weather',
        text: shareText,
        files: [file]
      }

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        onClose()
      } else {
        alert('Cannot share image on this device. Please use "Download Image".')
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err)
      }
    }
  }

  const handleDownloadImage = () => {
    if (!previewUrl) return
    const fileName = `zephye-weather-${activeType}-${Date.now()}.png`
    const link = document.createElement('a')
    link.download = fileName
    link.href = previewUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyText = async () => {
    const text = buildTextSummary()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareText = async () => {
    const text = buildTextSummary()
    if (navigator.share) {
      try {
        await navigator.share({ text })
        onClose()
        return
      } catch (err) {
        if (err.name !== 'AbortError') console.warn('Share failed:', err)
      }
    }
    handleCopyText()
  }

  const buildTextSummary = () => {
    const loc = location?.name || 'Location'
    if (activeType === 'current') {
      return `Current weather in ${loc}: ${Math.round(weather?.current?.temperature_2m ?? 0)}°C, ${weather?.current?.weather_code ?? 0}. Via Zephye.`
    }
    if (activeType === 'today') {
      return `Today's weather in ${loc}: high ${weather?.daily?.temperature_2m_max?.[0] ?? '--'}°, low ${weather?.daily?.temperature_2m_min?.[0] ?? '--'}°. Via Zephye.`
    }
    if (activeType === 'hourly') {
      return `Next 12 hours in ${loc}. Via Zephye.`
    }
    if (activeType === 'singleHour') {
      const h = hourlyData[selectedHourIndex]
      return `At ${h?.hourLabel || '--'} in ${loc}: ${h?.temp ?? '--'}°C. Via Zephye.`
    }
    if (activeType === 'weekly') {
      return `7-day forecast for ${loc}. Via Zephye.`
    }
    return `Weather for ${loc}. Via Zephye.`
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass weather-share-modal"
        onClick={e => e.stopPropagation()}
        style={{
          padding: '20px',
          maxWidth: '520px',
          width: '95%',
          maxHeight: '92vh',
          overflow: 'auto',
          borderRadius: '20px'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Share Weather</h3>
          <button onClick={onClose} className="btn-ghost">
            <CloseIcon />
          </button>
        </div>

        {/* Type tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 6,
          marginBottom: 16
        }}>
          {SHARE_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              style={{
                padding: '10px 4px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 600,
                background: activeType === type.id
                  ? 'rgba(56,189,248,0.2)'
                  : 'rgba(255,255,255,0.04)',
                border: activeType === type.id
                  ? '1px solid #38bdf8'
                  : '1px solid rgba(255,255,255,0.08)',
                color: activeType === type.id ? '#7dd3fc' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Single hour picker */}
        {activeType === 'singleHour' && hourlyData.length > 0 && (
          <div style={{
            marginBottom: 12,
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
              PICK AN HOUR
            </div>
            <div style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 4
            }}>
              {hourlyData.map((h, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedHourIndex(i)}
                  style={{
                    minWidth: 62,
                    padding: '8px 6px',
                    borderRadius: 10,
                    background: selectedHourIndex === i
                      ? 'rgba(56,189,248,0.2)'
                      : 'rgba(255,255,255,0.04)',
                    border: selectedHourIndex === i
                      ? '1px solid #38bdf8'
                      : '1px solid rgba(255,255,255,0.08)',
                    color: selectedHourIndex === i ? '#7dd3fc' : '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                    flexShrink: 0
                  }}
                >
                  <div>{h.hourLabel}</div>
                  <div style={{ fontSize: 16, marginTop: 2 }}>{codeToEmoji(h.code)}</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{h.temp}°</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 16,
          padding: 12,
          marginBottom: 16,
          minHeight: 260,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {isGenerating && (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Generating...</div>
          )}
          {!isGenerating && previewUrl && (
            <img
              src={previewUrl}
              alt="Weather share preview"
              style={{
                width: '100%',
                maxWidth: 380,
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}
            />
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button
            className="btn-primary"
            onClick={handleShareImage}
            disabled={!previewUrl || isGenerating}
            style={{ padding: '12px', borderRadius: 12, fontSize: 13 }}
          >
            Share as Image
          </button>
          <button
            className="btn-ghost"
            onClick={handleDownloadImage}
            disabled={!previewUrl || isGenerating}
            style={{
              padding: '12px',
              borderRadius: 12,
              fontSize: 13,
              border: '1px solid rgba(255,255,255,0.12)'
            }}
          >
            Download Image
          </button>
          <button
            className="btn-ghost"
            onClick={handleShareText}
            style={{
              padding: '12px',
              borderRadius: 12,
              fontSize: 13,
              border: '1px solid rgba(255,255,255,0.12)'
            }}
          >
            Share as Text
          </button>
          <button
            className="btn-ghost"
            onClick={handleCopyText}
            style={{
              padding: '12px',
              borderRadius: 12,
              fontSize: 13,
              border: '1px solid rgba(255,255,255,0.12)',
              color: copied ? '#38bdf8' : 'inherit'
            }}
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  )
}
