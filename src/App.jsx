import { useState, useEffect } from 'react'
import { QUOTES } from './data/quotes.js'
import { AudioProvider } from './AudioContext.jsx'
import WeatherManTab from './WeatherManTab.jsx'
import ZephyeFullScreen from './ZephyeFullScreen.jsx'
import MapTab from './MapTab.jsx'
import { getLang, getVoiceForLocation } from './zephyeHelpers'

// Import share backgrounds
import shareBg1 from './assets/images/share 1.jpg'
import shareBg2 from './assets/images/share 2.jpg'
import shareBg3 from './assets/images/share 3.jpg'
import shareBg4 from './assets/images/share 4.jpg'
import shareBg5 from './assets/images/share 5.jpg'
import shareBg6 from './assets/images/share 6.jpg'
import shareBg7 from './assets/images/share 7.jpg'
import shareBg8 from './assets/images/share 8.jpg'
import shareBg9 from './assets/images/share 9.jpg'
import shareBg10 from './assets/images/share 10.jpg'
import shareBg11 from './assets/images/share 11.jpg'
import shareBg12 from './assets/images/share 12.jpg'
import shareBg13 from './assets/images/share 13.jpg'

const shareBackgrounds = [
  shareBg1, shareBg2, shareBg3, shareBg4, shareBg5, shareBg6, shareBg7,
  shareBg8, shareBg9, shareBg10, shareBg11, shareBg12, shareBg13
]

const QUOTE_CATEGORIES = ['All', 'Motivational', 'Success', 'Wisdom', 'Love']
const FACT_CATEGORIES = ['All', 'Science', 'History', 'Animals', 'Space']
const OPENWEATHER_KEY = "576b156966c5789a1b3fd0074c8469f1"

// Font options for random selection
const FONT_FAMILIES = [
  'Georgia, serif',
  'Times New Roman, serif',
  'Garamond, serif',
  'Palatino, serif',
  'Book Antiqua, serif',
  'Didot, serif',
  'Baskerville, serif',
  'Caslon, serif'
]

const getRandomFont = () => FONT_FAMILIES[Math.floor(Math.random() * FONT_FAMILIES.length)]

// ============================================================================
// WEATHER SVG ICONS
// ============================================================================

const WeatherSunSVG = ({ size = 40, animated = true }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="25" fill="#FBBF24" className={animated ? 'sun-pulse' : ''}>
      <animate attributeName="r" values="25;28;25" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite" />
    </circle>
    {[...Array(8)].map((_, i) => (
      <g key={i} style={{ transform: `rotate(${i * 45}deg)`, transformOrigin: '50px 50px' }}>
        <line x1="50" y1="12" x2="50" y2="5" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round">
          <animate attributeName="y2" values="5;8;5" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </line>
      </g>
    ))}
    <circle cx="50" cy="50" r="25" fill="none" stroke="#FBBF24" strokeWidth="2" opacity="0.2">
      <animate attributeName="r" values="25;35;25" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite" />
    </circle>
  </svg>
)

const WeatherCloudSVG = ({ size = 40, animated = true }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className={animated ? 'cloud-float' : ''}>
      <animateTransform attributeName="transform" type="translate" values="0,0;3,0;0,0" dur="4s" repeatCount="indefinite" />
      <ellipse cx="35" cy="55" rx="20" ry="15" fill="#94A3B8" opacity="0.8" />
      <ellipse cx="55" cy="50" rx="25" ry="18" fill="#94A3B8" />
      <ellipse cx="45" cy="42" rx="18" ry="15" fill="#CBD5E1" />
      <ellipse cx="65" cy="45" rx="15" ry="12" fill="#CBD5E1" opacity="0.7" />
    </g>
  </svg>
)

const WeatherRainSVG = ({ size = 40, animated = true }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className={animated ? 'cloud-float' : ''}>
      <animateTransform attributeName="transform" type="translate" values="0,0;2,0;0,0" dur="4s" repeatCount="indefinite" />
      <ellipse cx="35" cy="50" rx="20" ry="15" fill="#64748B" opacity="0.8" />
      <ellipse cx="55" cy="45" rx="25" ry="18" fill="#64748B" />
      <ellipse cx="45" cy="37" rx="18" ry="15" fill="#94A3B8" />
      <ellipse cx="65" cy="40" rx="15" ry="12" fill="#94A3B8" opacity="0.7" />
    </g>
    {[...Array(6)].map((_, i) => (
      <g key={i}>
        <line 
          x1={25 + i * 10} 
          y1="65" 
          x2={20 + i * 10} 
          y2="85" 
          stroke="#60A5FA" 
          strokeWidth="2" 
          strokeLinecap="round"
        >
          <animate attributeName="y1" values="65;75;65" dur="0.8s" repeatCount="indefinite" begin={`${i * 0.15}s`} />
          <animate attributeName="y2" values="85;95;85" dur="0.8s" repeatCount="indefinite" begin={`${i * 0.15}s`} />
          <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" begin={`${i * 0.15}s`} />
        </line>
      </g>
    ))}
  </svg>
)

const WeatherThunderSVG = ({ size = 40, animated = true }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className={animated ? 'cloud-float' : ''}>
      <animateTransform attributeName="transform" type="translate" values="0,0;2,0;0,0" dur="4s" repeatCount="indefinite" />
      <ellipse cx="35" cy="45" rx="20" ry="15" fill="#475569" opacity="0.8" />
      <ellipse cx="55" cy="40" rx="25" ry="18" fill="#475569" />
      <ellipse cx="45" cy="32" rx="18" ry="15" fill="#64748B" />
      <ellipse cx="65" cy="35" rx="15" ry="12" fill="#64748B" opacity="0.7" />
    </g>
    <path d="M50 55 L43 68 L50 65 L45 78" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="0s" />
      <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="1.5s" />
    </path>
    <circle cx="50" cy="50" r="15" fill="#FBBF24" opacity="0.15">
      <animate attributeName="opacity" values="0;0.3;0" dur="3s" repeatCount="indefinite" />
      <animate attributeName="r" values="10;20;10" dur="3s" repeatCount="indefinite" />
    </circle>
  </svg>
)

const WeatherSnowSVG = ({ size = 40, animated = true }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className={animated ? 'cloud-float' : ''}>
      <animateTransform attributeName="transform" type="translate" values="0,0;2,0;0,0" dur="4s" repeatCount="indefinite" />
      <ellipse cx="35" cy="50" rx="20" ry="15" fill="#94A3B8" opacity="0.8" />
      <ellipse cx="55" cy="45" rx="25" ry="18" fill="#94A3B8" />
      <ellipse cx="45" cy="37" rx="18" ry="15" fill="#CBD5E1" />
      <ellipse cx="65" cy="40" rx="15" ry="12" fill="#CBD5E1" opacity="0.7" />
    </g>
    {[...Array(8)].map((_, i) => {
      const x = 25 + (i % 4) * 14
      const y = 65 + Math.floor(i / 4) * 20
      return (
        <g key={i}>
          <circle cx={x} cy={y} r="3" fill="#E2E8F0">
            <animate attributeName="cy" values={`${y};${y + 20};${y}`} dur="2s" repeatCount="indefinite" begin={`${i * 0.15}s`} />
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" begin={`${i * 0.15}s`} />
          </circle>
          <circle cx={x - 5} cy={y - 5} r="1.5" fill="#E2E8F0" opacity="0.5">
            <animate attributeName="cy" values={`${y - 5};${y + 15};${y - 5}`} dur="2.5s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
          </circle>
        </g>
      )
    })}
  </svg>
)

const WeatherFogSVG = ({ size = 40, animated = true }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="50" rx="25" ry="12" fill="#94A3B8" opacity="0.3">
      <animate attributeName="cx" values="30;35;30" dur="3s" repeatCount="indefinite" />
    </ellipse>
    <ellipse cx="55" cy="45" rx="30" ry="10" fill="#94A3B8" opacity="0.25">
      <animate attributeName="cx" values="55;50;55" dur="4s" repeatCount="indefinite" />
    </ellipse>
    <ellipse cx="40" cy="58" rx="28" ry="10" fill="#94A3B8" opacity="0.2">
      <animate attributeName="cx" values="40;45;40" dur="3.5s" repeatCount="indefinite" />
    </ellipse>
    <ellipse cx="60" cy="55" rx="20" ry="8" fill="#94A3B8" opacity="0.2">
      <animate attributeName="cx" values="60;55;60" dur="4.5s" repeatCount="indefinite" />
    </ellipse>
    <ellipse cx="25" cy="40" rx="20" ry="8" fill="#94A3B8" opacity="0.15">
      <animate attributeName="cx" values="25;30;25" dur="5s" repeatCount="indefinite" />
    </ellipse>
  </svg>
)

const WeatherPartlyCloudySVG = ({ size = 40, animated = true }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="35" r="18" fill="#FBBF24">
      <animate attributeName="r" values="18;20;18" dur="2s" repeatCount="indefinite" />
    </circle>
    {[...Array(6)].map((_, i) => (
      <g key={i} style={{ transform: `rotate(${i * 60}deg)`, transformOrigin: '30px 35px' }}>
        <line x1="30" y1="12" x2="30" y2="7" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" opacity="0.6">
          <animate attributeName="y2" values="7;9;7" dur="2s" repeatCount="indefinite" />
        </line>
      </g>
    ))}
    <g>
      <animateTransform attributeName="transform" type="translate" values="0,0;2,0;0,0" dur="4s" repeatCount="indefinite" />
      <ellipse cx="55" cy="50" rx="22" ry="16" fill="#94A3B8" />
      <ellipse cx="45" cy="42" rx="16" ry="14" fill="#CBD5E1" />
      <ellipse cx="65" cy="45" rx="14" ry="11" fill="#CBD5E1" opacity="0.7" />
    </g>
  </svg>
)

// Map weather codes to SVG components
const getWeatherSVG = (code, size = 40) => {
  if (code === 0 || code === 1) return <WeatherSunSVG size={size} />
  if (code === 2) return <WeatherPartlyCloudySVG size={size} />
  if (code === 3) return <WeatherCloudSVG size={size} />
  if (code >= 95) return <WeatherThunderSVG size={size} />
  if (code >= 51 && code <= 82) return <WeatherRainSVG size={size} />
  if (code >= 71 && code <= 77) return <WeatherSnowSVG size={size} />
  if (code === 45 || code === 48) return <WeatherFogSVG size={size} />
  return <WeatherCloudSVG size={size} />
}

// ============================================================================
// WEATHER BACKGROUND SVG (Full screen animated background)
// ============================================================================

const WeatherBackground = ({ code }) => {
  const getBackgroundStyles = () => {
    if (code === 0 || code === 1) {
      return {
        gradient: 'linear-gradient(180deg, #0a1a2e 0%, #1a3a6e 50%, #0f172a 100%)',
        overlay: 'rgba(255, 200, 50, 0.05)'
      }
    }
    if (code === 2) {
      return {
        gradient: 'linear-gradient(180deg, #0a1a2e 0%, #2a3a5e 50%, #0f172a 100%)',
        overlay: 'rgba(255, 255, 255, 0.03)'
      }
    }
    if (code === 3) {
      return {
        gradient: 'linear-gradient(180deg, #0a0a1a 0%, #1a2a3e 50%, #0f172a 100%)',
        overlay: 'rgba(255, 255, 255, 0.02)'
      }
    }
    if (code >= 95) {
      return {
        gradient: 'linear-gradient(180deg, #0a0a1a 0%, #1a0a2a 50%, #0f172a 100%)',
        overlay: 'rgba(255, 200, 50, 0.03)'
      }
    }
    if (code >= 51 && code <= 82) {
      return {
        gradient: 'linear-gradient(180deg, #0a0a1a 0%, #0a1a2a 50%, #0f172a 100%)',
        overlay: 'rgba(100, 150, 255, 0.03)'
      }
    }
    return {
      gradient: 'linear-gradient(180deg, #0a1a2e 0%, #0f172a 100%)',
      overlay: 'rgba(255, 255, 255, 0.02)'
    }
  }

  const styles = getBackgroundStyles()

  return (
    <div className="weather-bg-container" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      background: styles.gradient,
      overflow: 'hidden',
      pointerEvents: 'none'
    }}>
      {/* Animated particles/rays */}
      {code === 0 || code === 1 ? (
        // Sun rays
        <div style={{ position: 'absolute', inset: 0 }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '4px',
              height: `${40 + Math.random() * 60}%`,
              background: 'rgba(255, 200, 50, 0.03)',
              transformOrigin: 'center center',
              transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
              borderRadius: '2px',
              animation: `pulseRay ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`
            }} />
          ))}
        </div>
      ) : code >= 95 ? (
        // Thunder - random flashes
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.3)',
            animation: 'thunderFlash 4s ease-in-out infinite',
            pointerEvents: 'none'
          }} />
        </div>
      ) : code >= 51 && code <= 82 ? (
        // Rain drops
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {[...Array(30)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 20}%`,
              width: '2px',
              height: `${10 + Math.random() * 20}px`,
              background: 'rgba(100, 150, 255, 0.15)',
              borderRadius: '0 0 2px 2px',
              animation: `rainDrop ${0.8 + Math.random() * 0.6}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.3 + Math.random() * 0.5
            }} />
          ))}
        </div>
      ) : null}
      
      <style>{`
        @keyframes pulseRay {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) rotate(var(--rot)) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) rotate(var(--rot)) scale(1.1); }
        }
        @keyframes thunderFlash {
          0%, 90%, 100% { opacity: 0; }
          92%, 94% { opacity: 0.8; }
          96% { opacity: 0.3; }
          98% { opacity: 0.9; }
        }
        @keyframes rainDrop {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
)

const AddIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ============================================================================
// SHARE MODAL
// ============================================================================

function ShareModal({ isOpen, onClose, content, author, type }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const getRandomBackground = () => {
    return Math.floor(Math.random() * shareBackgrounds.length)
  }
  
  const [backgroundIndex] = useState(getRandomBackground)
  const [fontFamily] = useState(getRandomFont())

  const generateImageDataUrl = () => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const size = 1080
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')

      const bgImg = new Image()
      bgImg.crossOrigin = 'anonymous'
      bgImg.src = shareBackgrounds[backgroundIndex]
      
      bgImg.onload = () => {
        try {
          ctx.drawImage(bgImg, 0, 0, size, size)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
          ctx.fillRect(0, 0, size, size)

          const padding = size * 0.05
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)'
          ctx.lineWidth = 3
          ctx.strokeRect(padding, padding, size - padding * 2, size - padding * 2)

          ctx.fillStyle = 'rgba(255, 215, 0, 0.2)'
          ctx.font = 'bold 180px Georgia, serif'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
          ctx.fillText('"', padding * 2, padding * 1.5)

          const maxWidth = size - padding * 6
          const lineHeight = 78
          let fontSize = 56
          let lines = []
          let currentLine = ''

          const words = content.split(' ')
          
          while (fontSize > 28) {
            ctx.font = `${fontSize}px ${fontFamily}`
            lines = []
            currentLine = ''
            for (const word of words) {
              const testLine = currentLine ? `${currentLine} ${word}` : word
              if (ctx.measureText(testLine).width > maxWidth) {
                lines.push(currentLine)
                currentLine = word
              } else {
                currentLine = testLine
              }
            }
            lines.push(currentLine)
            if (lines.length <= 8) break
            fontSize -= 4
          }

          ctx.fillStyle = '#ffffff'
          ctx.font = `${fontSize}px ${fontFamily}`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          const startY = size * 0.32
          lines.forEach((line, i) => {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
            ctx.shadowBlur = 15
            ctx.fillText(line, size / 2, startY + i * lineHeight)
          })
          ctx.shadowBlur = 0

          const dividerY = startY + lines.length * lineHeight + 50
          ctx.fillStyle = 'rgba(255, 215, 0, 0.5)'
          ctx.shadowColor = 'rgba(255, 215, 0, 0.2)'
          ctx.shadowBlur = 15
          ctx.fillRect(size / 2 - 100, dividerY, 200, 3)
          ctx.shadowBlur = 0

          if (author && author !== 'Fact') {
            ctx.fillStyle = '#f0e6d3'
            ctx.font = `bold 44px ${fontFamily}`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
            ctx.shadowBlur = 15
            ctx.fillText(`— ${author}`, size / 2, dividerY + 25)
            ctx.shadowBlur = 0
          }

          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
          ctx.font = '24px Arial, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(type || 'Zephye', size / 2, size - 90)

          ctx.fillStyle = 'rgba(255, 215, 0, 0.35)'
          ctx.font = 'bold 32px Arial, sans-serif'
          ctx.textAlign = 'right'
          ctx.textBaseline = 'bottom'
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
          ctx.shadowBlur = 10
          ctx.fillText('✦ Zephye', size - padding * 2, size - padding * 1.5)
          ctx.shadowBlur = 0

          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
          ctx.font = '18px Arial, sans-serif'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'bottom'
          ctx.fillText('zephye.app', padding * 2, size - padding * 1.5)

          resolve(canvas.toDataURL('image/png', 1.0))
        } catch (err) {
          reject(err)
        }
      }
      
      bgImg.onerror = () => {
        reject(new Error('Failed to load background image'))
      }
    })
  }

  const handleCopyText = async () => {
    const text = type === 'Fact' 
      ? `${content}\n\n— via Zephye` 
      : `"${content}" — ${author}\n\n— via Zephye`
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

  const handleShareImage = async () => {
    if (!navigator.share) {
      alert('Web Share API is not supported on this device. Please use the "Download Image" button instead.')
      return
    }
    
    setIsGenerating(true)
    try {
      const imageDataUrl = await generateImageDataUrl()
      const fileName = `${(author || 'quote').replace(/\s/g, '_')}.png`
      const shareText = type === 'Fact' 
        ? content 
        : `"${content}" — ${author}`

      const response = await fetch(imageDataUrl)
      const blob = await response.blob()
      const file = new File([blob], fileName, { type: 'image/png' })
      const shareData = { 
        title: type || 'Quote', 
        text: shareText,
        files: [file]
      }
      
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        onClose()
      } else {
        alert('Cannot share image on this device. Please use "Download Image" instead.')
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err)
        alert('Failed to share image. Please use "Download Image" instead.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadImage = async () => {
    setIsGenerating(true)
    try {
      const imageDataUrl = await generateImageDataUrl()
      const fileName = `${(author || 'quote').replace(/\s/g, '_')}.png`
      
      const link = document.createElement('a')
      link.download = fileName
      link.href = imageDataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading image:', error)
      alert('Failed to download image')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShareText = async () => {
    const text = type === 'Fact' 
      ? `${content}\n\n— via Zephye` 
      : `"${content}" — ${author}\n\n— via Zephye`
    
    if (navigator.share) {
      try {
        await navigator.share({ text })
        onClose()
        return
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Share failed:', err)
        }
      }
    }
    
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

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass share-modal"
        onClick={e => e.stopPropagation()}
      >
        <button className="share-modal-close" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className="share-modal-header">
          <h3>Share {type || 'Quote'}</h3>
        </div>
        
        <div className="share-modal-preview">
          <p className="share-modal-content">"{content}"</p>
          {author && author !== 'Fact' && (
            <p className="share-modal-author">— {author}</p>
          )}
        </div>

        <div className="share-modal-actions">
          <button
            className="share-btn-image"
            onClick={handleShareImage}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Share as Image'}
          </button>

          <button
            className="share-btn-download"
            onClick={handleDownloadImage}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Download Image'}
          </button>

          <button
            className="share-btn-text"
            onClick={handleShareText}
          >
            Share as Text
          </button>

          <button
            className={`share-btn-copy ${copied ? 'copied' : ''}`}
            onClick={handleCopyText}
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAP MODAL
// ============================================================================

function MapModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass map-modal"
        onClick={e => e.stopPropagation()}
      >
        <button className="map-modal-close" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className="map-modal-icon">🗺️</div>
        <h3 className="map-modal-title">Map Features</h3>
        <div className="map-modal-badge">⚡ Undergoing Upgrade</div>
        <p className="map-modal-description">
          Some map features are being enhanced. Core functionality is still available.
        </p>
        <div className="map-modal-divider" />
        <div className="map-modal-helpers">
          <p className="map-modal-helpers-title">📌 How to use:</p>
          <div className="map-modal-helpers-list">
            <div><span>👆</span><span>Single tap — <span>Weather data</span></span></div>
            <div><span>👆👆</span><span>Double tap — <span>Pollen data</span></span></div>
            <div><span>👆⏱️</span><span>Long press / Right click — <span>Route calculation</span></span></div>
            <div><span>🚦</span><span>Traffic tab — <span>Live traffic + incidents</span></span></div>
          </div>
        </div>
        <button className="map-modal-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )
}

const getAllQuotesPool = () => {
  const pool = []
  Object.keys(QUOTES).forEach(cat => {
    QUOTES[cat].forEach(q => pool.push({...q, tag: cat }))
  })
  return pool
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
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {getWeatherSVG(code, 50)}
  </div>
}

// ============================================================================
// HOURLY MODAL
// ============================================================================

function HourlyModal({ isOpen, onClose, hourlyData, locationName }) {
  const [selectedHour, setSelectedHour] = useState(null)

  if (!isOpen || !hourlyData) return null

  const getIcon = (code) => getWeatherSVG(code, 36)

  const getConditionName = (code) => {
    const map = {
      0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Fog',
      51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Heavy Drizzle',
      61: 'Light Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
      71: 'Light Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
      80: 'Rain Showers', 81: 'Heavy Showers', 82: 'Violent Showers',
      95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Heavy Thunderstorm'
    }
    return map[code] || 'Unknown'
  }

  const handleHourClick = (index) => {
    setSelectedHour(selectedHour === index ? null : index)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass hourly-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="hourly-modal-header">
          <div>
            <h3>Hourly Forecast</h3>
            <p>
              {locationName || 'Your location'} •{' '}
              {new Date(hourlyData.time[0]).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button className="hourly-modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="hourly-modal-list">
          {hourlyData.time.slice(0, 24).map((time, i) => {
            const temp = hourlyData.temperature_2m?.[i]
            const feelsLike = hourlyData.apparent_temperature?.[i]
            const code = hourlyData.weather_code?.[i] || 0
            const precip = hourlyData.precipitation_probability?.[i]
            const rain = hourlyData.precipitation?.[i]
            const wind = hourlyData.wind_speed_10m?.[i]
            const humidity = hourlyData.relative_humidity_2m?.[i]
            const pressure = hourlyData.pressure_msl?.[i]
            const gust = hourlyData.wind_gusts_10m?.[i]

            const isCurrentHour = i === 0
            const isSelected = selectedHour === i

            return (
              <div
                key={time}
                className={`hourly-item ${isCurrentHour ? 'current' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleHourClick(i)}
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Background SVG when selected */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.15,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                  }}>
                    {getWeatherSVG(code, 120)}
                  </div>
                )}
                
                <div className="hourly-time" style={{ position: 'relative', zIndex: 1 }}>
                  <div>
                    {new Date(time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      hour12: true
                    })}
                  </div>
                  {isCurrentHour && <div className="hourly-now">Now</div>}
                </div>

                <div className="hourly-icon" style={{ position: 'relative', zIndex: 1 }}>
                  {getWeatherSVG(code, 32)}
                </div>

                <div className="hourly-temp" style={{ position: 'relative', zIndex: 1 }}>
                  <div>{Math.round(temp)}°</div>
                  {feelsLike && Math.round(feelsLike) !== Math.round(temp) && (
                    <div className="hourly-feels">feels {Math.round(feelsLike)}°</div>
                  )}
                </div>

                <div className="hourly-condition" style={{ position: 'relative', zIndex: 1 }}>
                  {getConditionName(code)}
                </div>

                <div className="hourly-details" style={{ position: 'relative', zIndex: 1 }}>
                  {precip > 0 && <span>🌧️ {Math.round(precip)}%</span>}
                  {rain > 0 && <span>💧 {Math.round(rain * 10) / 10}mm</span>}
                  {wind > 0 && <span>💨 {Math.round(wind)} km/h</span>}
                  {gust > 15 && <span className="hourly-gust">⚡{Math.round(gust)}</span>}
                  {humidity > 0 && <span>💧 {Math.round(humidity)}%</span>}
                  {pressure > 0 && <span>📊 {Math.round(pressure)} hPa</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// APP CONTENT
// ============================================================================

function AppContent() {
  const [tab, setTab] = useState('weather')
  const [weather, setWeather] = useState(null)
  const [aqi, setAqi] = useState(null)
  const [quoteOfDay, setQuoteOfDay] = useState(null)
  const [toast, setToast] = useState('')
  const [location, setLocation] = useState({ lat: 6.5244, lon: 3.3792, name: 'Lagos, Nigeria', country_code: 'NG' })
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showAirDropdown, setShowAirDropdown] = useState(false)
  const [citySearch, setCitySearch] = useState('')
  const [isManualLocation, setIsManualLocation] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [savedLocations, setSavedLocations] = useState(() => {
    const saved = localStorage.getItem('zephye_saved_locations')
    return saved ? JSON.parse(saved) : []
  })
  const [previousLocation, setPreviousLocation] = useState(null)
  const [showSavedPanel, setShowSavedPanel] = useState(false)
  const [editingLocId, setEditingLocId] = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const [editCity, setEditCity] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [todayStats, setTodayStats] = useState({ sunHours: 0, rainHours: 0, thunderHours: 0, maxRainProb: 0, rainPeriods: [], sunrise: '--:--', sunset: '--:--', feelsLike: 0, windGust: 0, pressureTrend: '→' })
  const [hasWelcomed, setHasWelcomed] = useState(false)
  const [voiceToUse, setVoiceToUse] = useState('en-US-JennyNeural')
  const [showHourlyModal, setShowHourlyModal] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [shareModal, setShareModal] = useState({ isOpen: false, content: '', author: '', type: '' })

  useEffect(() => {
    if (tab === 'map') {
      const hasSeenMapModal = localStorage.getItem('zephye_seen_map_modal')
      if (!hasSeenMapModal) {
        setShowMapModal(true)
        localStorage.setItem('zephye_seen_map_modal', 'true')
      }
    }
  }, [tab])

  useEffect(() => { localStorage.setItem('zephye_saved_locations', JSON.stringify(savedLocations)) }, [savedLocations])

  useEffect(() => {
    const autoVoice = getVoiceForLocation(null, location?.country_code, 'female')
    setVoiceToUse(autoVoice)
    localStorage.setItem('weatherman_voice', autoVoice)
  }, [location?.country_code])

  useEffect(() => {
    fetch('https://hyezen.onrender.com/api/ping', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ timestamp: Date.now(), user: localStorage.getItem('weatherman_name') || 'anonymous', location: location.name }) }).catch(() => {})
    const savedLoc = localStorage.getItem('zephye_location')
    const savedManual = localStorage.getItem('zephye_isManual')
    if (savedLoc && savedManual === 'true') {
      try { const loc = JSON.parse(savedLoc); setLocation(loc); setIsManualLocation(true); fetchWeatherData(loc.lat, loc.lon) } catch { initLocation() }
    } else { initLocation() }
    fetchQuoteOfDay()
  }, [])

  useEffect(() => { if (!hasWelcomed && weather && !isLoading) { setTimeout(() => showToast('Welcome to Zephye'), 1000); setHasWelcomed(true) } }, [weather, isLoading])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const shareQuote = (text, author) => {
    setShareModal({
      isOpen: true,
      content: text,
      author: author || 'Unknown',
      type: 'Quote'
    })
  }

  const shareFact = (text) => {
    setShareModal({
      isOpen: true,
      content: text,
      author: 'Fact',
      type: 'Fact'
    })
  }

  const addNewLocation = () => {
    const newLoc = { id: Date.now(), label: '', lat: location.lat, lon: location.lon, name: location.name, country_code: location.country_code }
    setSavedLocations(prev => [...prev, newLoc])
    setEditingLocId(newLoc.id)
    setEditLabel('')
    setEditCity('')
    setSearchResults([])
  }

  const searchPlaceForLocation = async (query) => {
    if (!query || query.length < 2) { setSearchResults([]); return }
    setIsSearching(true)
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`)
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results.map(r => ({ id: r.id, name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`, lat: r.latitude, lon: r.longitude, country_code: r.country_code?.toUpperCase() || 'US' })))
      } else { setSearchResults([]) }
    } catch { setSearchResults([]) }
    setIsSearching(false)
  }

  const selectPlaceForLocation = (locId, place) => {
    setSavedLocations(prev => prev.map(loc => loc.id === locId ? { ...loc, lat: place.lat, lon: place.lon, name: place.name, country_code: place.country_code } : loc))
    setSearchResults([])
    setEditCity('')
    const loc = savedLocations.find(l => l.id === locId)
    if (loc) {
      showToast(`Location updated to ${place.name}`)
    }
  }

  const updateLocationLabel = (locId, label) => { 
    setSavedLocations(prev => prev.map(loc => loc.id === locId ? { ...loc, label: label || 'Untitled Location' } : loc))
  }
  
  const saveLocationEdits = () => { 
    setEditingLocId(null); 
    setEditLabel(''); 
    setEditCity(''); 
    setSearchResults([]); 
    showToast('Location updated') 
  }
  
  const deleteLocation = (locId) => { 
    setSavedLocations(prev => prev.filter(loc => loc.id !== locId)); 
    if (editingLocId === locId) setEditingLocId(null); 
    showToast('Location removed') 
  }

  const switchToSavedLocation = (savedLoc) => {
    if (!previousLocation) setPreviousLocation({ lat: location.lat, lon: location.lon, name: location.name, country_code: location.country_code, isManual: isManualLocation })
    const nl = { lat: savedLoc.lat, lon: savedLoc.lon, name: savedLoc.name, country_code: savedLoc.country_code }
    setLocation(nl); setIsManualLocation(true)
    localStorage.setItem('zephye_location', JSON.stringify(nl)); localStorage.setItem('zephye_isManual', 'true')
    fetchWeatherData(savedLoc.lat, savedLoc.lon); setShowSavedPanel(false)
    showToast(`Showing weather for ${savedLoc.label || savedLoc.name}`)
  }

  const goBackToOriginalLocation = () => {
    if (!previousLocation) return
    const ol = { lat: previousLocation.lat, lon: previousLocation.lon, name: previousLocation.name, country_code: previousLocation.country_code }
    setLocation(ol); setIsManualLocation(previousLocation.isManual || false)
    if (previousLocation.isManual) { localStorage.setItem('zephye_location', JSON.stringify(ol)); localStorage.setItem('zephye_isManual', 'true') }
    else { localStorage.removeItem('zephye_location'); localStorage.removeItem('zephye_isManual') }
    fetchWeatherData(ol.lat, ol.lon); setPreviousLocation(null)
    showToast('Back to original location')
  }

  const saveCurrentLocation = () => {
    if (savedLocations.find(loc => Math.abs(loc.lat - location.lat) < 0.01 && Math.abs(loc.lon - location.lon) < 0.01)) { showToast('Already saved'); return }
    const nl = { id: Date.now(), label: '', lat: location.lat, lon: location.lon, name: location.name, country_code: location.country_code }
    setSavedLocations(prev => [...prev, nl]); setEditingLocId(nl.id); setEditLabel(''); setEditCity(''); setSearchResults([])
    showToast('Location saved. Edit label to name it.')
  }

  const fetchQuoteOfDay = () => {
    const pool = getAllQuotesPool(); const today = new Date().toISOString().split('T')[0]
    const dn = Math.floor((new Date(today).getTime() - new Date('2024-01-01').getTime()) / 86400000)
    setQuoteOfDay(pool[dn % pool.length])
  }

  const calculateTodayStats = (hourly, daily) => {
    if (!hourly?.time) return
    let sunHours = 0, rainHours = 0, thunderHours = 0, maxRainProb = 0, currentRainPeriod = null
    const rainPeriods = []
    hourly.time.slice(0, 24).forEach((time, i) => {
      const code = hourly.weather_code?.[i] || 0, prob = hourly.precipitation_probability?.[i] || 0, precip = hourly.precipitation?.[i] || 0
      if (code === 0 || code === 1) sunHours++
      if (prob > 30 || precip > 0.1) {
        rainHours++; const hour = new Date(time).getHours()
        if (!currentRainPeriod) currentRainPeriod = { start: hour, end: hour }
        else if (hour === currentRainPeriod.end + 1) currentRainPeriod.end = hour
        else { rainPeriods.push(`${currentRainPeriod.start}:00-${currentRainPeriod.end + 1}:00`); currentRainPeriod = { start: hour, end: hour } }
      } else if (currentRainPeriod) { rainPeriods.push(`${currentRainPeriod.start}:00-${currentRainPeriod.end + 1}:00`); currentRainPeriod = null }
      if (code >= 95) thunderHours++; if (prob > maxRainProb) maxRainProb = prob
    })
    if (currentRainPeriod) rainPeriods.push(`${currentRainPeriod.start}:00-${currentRainPeriod.end + 1}:00`)
    setTodayStats({
      sunHours, rainHours, thunderHours, maxRainProb, rainPeriods,
      sunrise: daily?.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--',
      sunset: daily?.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--',
      feelsLike: hourly?.apparent_temperature?.[0] || 0,
      windGust: hourly?.wind_gusts_10m?.[0] || 0,
      pressureTrend: '→'
    })
  }

  const initLocation = async () => {
    if (!navigator.geolocation) { fetchWeatherData(6.5244, 3.3792); return }
    try { const p = await navigator.permissions.query({ name: 'geolocation' }); if (p.state === 'granted' || p.state === 'prompt') getCurrentLocation(); else fetchWeatherData(6.5244, 3.3792) } catch { getCurrentLocation() }
  }

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => { reverseGeocode(pos.coords.latitude, pos.coords.longitude); fetchWeatherData(pos.coords.latitude, pos.coords.longitude); setIsManualLocation(false); localStorage.removeItem('zephye_location'); localStorage.removeItem('zephye_isManual') },
      () => { showToast('Location denied'); fetchWeatherData(6.5244, 3.3792) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`, { headers: { 'User-Agent': 'Zephye-App/1.0' } })
      const data = await res.json()
      const lga = data.address.county?.replace(' Local Government Area','') || data.address.town || data.address.city || data.address.village || 'Current Location'
      setLocation({ lat, lon, name: `${lga}, ${data.address.state || 'State'}, ${data.address.country || 'Country'}`, country_code: data.address.country_code?.toUpperCase() || 'US' })
      setIsManualLocation(false); localStorage.removeItem('zephye_location'); localStorage.removeItem('zephye_isManual')
    } catch { setLocation({ lat, lon, name: 'Current Location', country_code: 'US' }) }
  }

  const searchCity = async () => {
    if (!citySearch.trim()) { showToast('Type a place name'); return }
    try {
      let res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(citySearch)}&count=5&language=en&format=json`)
      let data = await res.json()
      if (!data.results?.length) {
        const owRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(citySearch)}&limit=5&appid=${OPENWEATHER_KEY}`)
        const owData = await owRes.json()
        if (!owData?.length) { showToast('Place not found'); return }
        const r = owData[0]; const dn = `${r.name}${r.state ? ', ' + r.state : ''}, ${r.country}`
        const nl = { lat: r.lat, lon: r.lon, name: dn, country_code: r.country?.slice(0,2)?.toUpperCase() || 'US' }
        setLocation(nl); setIsManualLocation(true); localStorage.setItem('zephye_location', JSON.stringify(nl)); localStorage.setItem('zephye_isManual', 'true')
        fetchWeatherData(r.lat, r.lon); setShowLocationModal(false); setCitySearch(''); showToast(`Location: ${dn}`); return
      }
      const r = data.results[0]; const dn = `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`
      const nl = { lat: r.latitude, lon: r.longitude, name: dn, country_code: r.country_code?.toUpperCase() || 'US' }
      setLocation(nl); setIsManualLocation(true); localStorage.setItem('zephye_location', JSON.stringify(nl)); localStorage.setItem('zephye_isManual', 'true')
      fetchWeatherData(r.latitude, r.longitude); setShowLocationModal(false); setCitySearch(''); showToast(`Location: ${r.name}`)
    } catch { showToast('Search failed') }
  }

  const fetchWeatherData = async (lat, lon) => {
    try {
      setIsLoading(true)
      const [weatherRes, aqiRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,wind_gusts_10m,pressure_msl,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode,uv_index_max,sunrise,sunset&timezone=auto`),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10`)
      ])
      if (weatherRes.ok) {
        const om = await weatherRes.json(); const aqiJson = await aqiRes.json()
        const wd = {
          timezone: om.timezone || 'UTC',
          current: { temperature_2m: om.current_weather?.temperature ?? null, weather_code: om.current_weather?.weathercode ?? 0, wind_speed_10m: om.current_weather?.windspeed ?? 0, wind_direction_10m: om.current_weather?.winddirection ?? 0, relative_humidity_2m: om.hourly?.relative_humidity_2m?.[0] ?? 50, pressure_msl: om.hourly?.pressure_msl?.[0] ?? null, visibility: null, uv_index: om.daily?.uv_index_max?.[0] ?? 0 },
          hourly: { time: om.hourly?.time ?? [], temperature_2m: om.hourly?.temperature_2m ?? [], weather_code: om.hourly?.weathercode ?? [], precipitation_probability: om.hourly?.precipitation_probability ?? [], precipitation: om.hourly?.precipitation ?? [], apparent_temperature: om.hourly?.apparent_temperature ?? [], wind_gusts_10m: om.hourly?.wind_gusts_10m ?? [], pressure_msl: om.hourly?.pressure_msl ?? [], relative_humidity_2m: om.hourly?.relative_humidity_2m ?? [] },
          daily: { time: om.daily?.time ?? [], temperature_2m_max: om.daily?.temperature_2m_max ?? [], temperature_2m_min: om.daily?.temperature_2m_min ?? [], weather_code: om.daily?.weathercode ?? [], uv_index_max: om.daily?.uv_index_max ?? [], sunrise: om.daily?.sunrise ?? [], sunset: om.daily?.sunset ?? [] }
        }
        setWeather(wd); setAqi(aqiJson.current); calculateTodayStats(wd.hourly, wd.daily)
      }
      setIsLoading(false)
    } catch (err) { console.error(err); showToast('Weather failed'); setIsLoading(false) }
  }

  const saveQuote = (quote) => {
    if (!quote) return
    const saved = JSON.parse(localStorage.getItem('zephye_saved_quotes') || '[]')
    saved.unshift({ id: Date.now(), quote_text: quote.content || quote.text, quote_author: quote.author || 'Unknown', category: quote.tag || 'Motivational', created_at: new Date().toISOString() })
    localStorage.setItem('zephye_saved_quotes', JSON.stringify(saved)); showToast('Quote saved')
  }

  const saveFact = (fact) => {
    if (!fact) return
    const saved = JSON.parse(localStorage.getItem('zephye_saved_facts') || '[]')
    saved.unshift({ id: Date.now(), fact_text: fact.text, created_at: new Date().toISOString() })
    localStorage.setItem('zephye_saved_facts', JSON.stringify(saved)); showToast('Fact saved')
  }

  const getWeatherClass = (c) => c === 0 || c === 1 ? 'sunny' : c >= 95 ? 'thunder' : c >= 51 && c <= 82 ? 'rainy' : 'cloudy'
  const getWeatherIcon = (c) => c === 0 ? '☀️' : c === 1 ? '🌤️' : c === 2 ? '⛅' : c === 3 ? '☁️' : c >= 95 ? '⛈️' : c >= 51 ? '🌧️' : '☁️'
  const getStormLevel = (c, w) => c >= 95 ? { level: 'Severe Thunderstorm', color: '#dc2626' } : c >= 65 || w > 50 ? { level: 'Heavy Storm', color: '#f97316' } : c >= 61 || w > 30 ? { level: 'Moderate Rain', color: '#eab308' } : c >= 51 ? { level: 'Light Rain', color: '#22c55e' } : null
  const getAqiLevel = (a) => a == null ? { label: 'Unknown', color: '#6b7280' } : a <= 50 ? { label: 'Good', color: '#22c55e' } : a <= 100 ? { label: 'Moderate', color: '#eab308' } : a <= 150 ? { label: 'Unhealthy', color: '#f97316' } : { label: 'Hazardous', color: '#ef4444' }
  const getWindDirection = (d) => d >= 337.5 || d < 22.5 ? 'N' : d < 67.5 ? 'NE' : d < 112.5 ? 'E' : d < 157.5 ? 'SE' : d < 202.5 ? 'S' : d < 247.5 ? 'SW' : d < 292.5 ? 'W' : 'NW'

  const wc = weather?.current?.weather_code ?? 0
  const ws = weather?.current?.wind_speed_10m ?? 0
  const wd = weather?.current?.wind_direction_10m ?? 0
  const hum = weather?.current?.relative_humidity_2m ?? 50
  const pres = weather?.current?.pressure_msl ?? 0
  const vis = weather?.current?.visibility ?? 0
  const uv = weather?.current?.uv_index ?? weather?.daily?.uv_index_max?.[0] ?? 0
  const aqiInfo = getAqiLevel(aqi?.us_aqi)
  const stormInfo = getStormLevel(wc, ws)

  if (isLoading && !weather) return (
    <div className="app">
      <WeatherBackground code={0} />
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',position:'relative',zIndex:1}}>
        <div className="glass" style={{padding:'40px',borderRadius:'20px',textAlign:'center'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>
            <WeatherSunSVG size={60} />
          </div>
          <p className="text-xl font-bold">Loading Zephye...</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="app">
      <WeatherBackground code={wc} />
      {toast && <div className="toast">{toast}</div>}
      
      <MapModal 
        isOpen={showMapModal} 
        onClose={() => setShowMapModal(false)} 
      />

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, content: '', author: '', type: '' })}
        content={shareModal.content}
        author={shareModal.author}
        type={shareModal.type}
      />

      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="glass modal" onClick={e => e.stopPropagation()} style={{padding:'24px'}}>
            <h3 className="font-bold mb-4">Change Location</h3>
            <input type="text" placeholder="Type any city, LGA, country..." value={citySearch} onChange={e => setCitySearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchCity()} className="mb-4 w-full" autoFocus />
            <p className="text-xs text-muted mb-3">Type "London", "Ifo LGA", "Tokyo" - any real place</p>
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={searchCity}>Search</button>
              <button className="btn-ghost text-xs" onClick={() => { setShowLocationModal(false); setCitySearch('') }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSavedPanel && (
        <div className="modal-overlay" onClick={() => setShowSavedPanel(false)}>
          <div className="glass modal" onClick={e => e.stopPropagation()} style={{padding:'24px',maxWidth:'480px',width:'90%',maxHeight:'80vh',overflow:'auto'}}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">My Locations</h3>
              <button onClick={() => setShowSavedPanel(false)} className="btn-ghost" style={{fontSize:'24px',lineHeight:1}}>&times;</button>
            </div>
            <div className="current-location-card">
              <div className="loc-info">
                <div className="loc-label">CURRENT LOCATION</div>
                <div className="loc-name">{location.name}</div>
                <div className="loc-coords">{location.lat.toFixed(2)}, {location.lon.toFixed(2)}</div>
              </div>
              <button className="save-btn" onClick={saveCurrentLocation}>
                <AddIcon /> Save
              </button>
            </div>
            {savedLocations.length === 0 ? (
              <div className="saved-locations-empty">
                <div className="empty-icon">📍</div>
                <div className="empty-title">No saved locations yet</div>
                <div className="empty-subtitle">Save your favorite places for quick access</div>
                <button onClick={addNewLocation} className="btn-primary" style={{marginTop:'12px'}}>Add Location</button>
              </div>
            ) : (
              <div className="saved-locations-container">
                {savedLocations.map(loc => (
                  <div key={loc.id} className={`saved-location-card ${editingLocId === loc.id ? 'editing' : ''}`}>
                    {editingLocId === loc.id ? (
                      <div className="saved-location-edit-form">
                        <div className="form-group">
                          <label>Name</label>
                          <input 
                            type="text" 
                            value={editLabel} 
                            onChange={e => setEditLabel(e.target.value)} 
                            placeholder="Home, Work, etc..." 
                            autoFocus 
                          />
                        </div>
                        <div className="form-group">
                          <label>Search place</label>
                          <div className="location-search-container">
                            <input 
                              type="text" 
                              value={editCity} 
                              onChange={e => { 
                                setEditCity(e.target.value); 
                                searchPlaceForLocation(e.target.value) 
                              }} 
                              placeholder="Search city..." 
                            />
                            {isSearching && (
                              <div className="location-search-suggestions">
                                <div className="searching-text">Searching...</div>
                              </div>
                            )}
                            {searchResults.length > 0 && (
                              <div className="location-search-suggestions">
                                {searchResults.map(place => (
                                  <button 
                                    key={place.id} 
                                    className="suggestion-item"
                                    onClick={() => selectPlaceForLocation(loc.id, place)}
                                  >
                                    <span className="suggestion-icon">📍</span>
                                    <span className="suggestion-name">{place.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Coordinates</label>
                          <div style={{fontSize:'12px', color:'var(--text-muted)'}}>
                            {loc.lat.toFixed(4)}, {loc.lon.toFixed(4)}
                          </div>
                        </div>
                        <div className="edit-actions">
                          <button className="save-btn" onClick={saveLocationEdits}>Done</button>
                          <button className="cancel-btn" onClick={() => { setEditingLocId(null); setSearchResults([]); }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="saved-location-info">
                        <div className="loc-details" onClick={() => switchToSavedLocation(loc)}>
                          <div className="loc-label">{loc.label || 'Untitled Location'}</div>
                          <div className="loc-name">{loc.name}</div>
                        </div>
                        <div className="loc-actions">
                          <button className="edit-btn" onClick={() => { 
                            setEditingLocId(loc.id); 
                            setEditLabel(loc.label || ''); 
                            setEditCity(''); 
                            setSearchResults([]); 
                          }}>
                            <EditIcon />
                          </button>
                          <button className="delete-btn" onClick={() => deleteLocation(loc.id)}>
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {savedLocations.length > 0 && !editingLocId && (
              <button className="add-location-btn" onClick={addNewLocation}>
                <AddIcon /> Add Another Location
              </button>
            )}
          </div>
        </div>
      )}

      <ZephyeFullScreen isOpen={tab === 'ai'} onClose={() => setTab('weather')} weather={weather} location={location} todayStats={todayStats} aqi={aqi} userName={localStorage.getItem('weatherman_name')} lang={getLang(location?.country_code)} greeting="Hey" voiceToUse={voiceToUse} />
      
      <div className="container" style={{display:'flex',flexDirection:'column',gap:'16px',position:'relative',zIndex:1}}>
        {tab === 'weather' && (
          <>
            {/* Weather Card - Dynamic z-index when dropdown is open */}
            <div 
              className="glass" 
              style={{
                padding:'20px',
                borderRadius:'20px',
                position:'relative',
                zIndex: showAirDropdown ? 100 : 2,
                overflow: 'visible'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <button className="location-btn text-left" onClick={() => setShowLocationModal(true)}>
                  <div className="text-xs text-muted mb-1 flex items-center gap-1"><LocationIcon />Location</div>
                  <div className="text-lg font-bold">{location.name}</div>
                  <div className="text-xs text-muted mt-1">{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div>
                </button>
                <div className="text-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getWeatherSVG(wc, 60)}
                  </div>
                  <h1 className="text-3xl font-bold mt-1">{weather?.current ? Math.round(weather.current.temperature_2m) : '--'}°</h1>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap mb-3">
                <button onClick={() => setShowSavedPanel(true)} className="btn-ghost text-xs flex items-center gap-1" style={{padding:'4px 10px'}}><LocationIcon />{savedLocations.length > 0 ? `${savedLocations.length} saved` : 'My Places'}</button>
                {previousLocation && <button onClick={goBackToOriginalLocation} className="btn-ghost text-xs flex items-center gap-1" style={{padding:'4px 10px',borderColor:'var(--accent)',color:'var(--accent)'}}><BackIcon />Back to my location</button>}
                {savedLocations.slice(0, 3).map(loc => <button key={loc.id} onClick={() => switchToSavedLocation(loc)} className="btn-ghost text-xs" style={{padding:'4px 10px',background:'rgba(255,255,255,0.08)',color:'var(--text)',border:'1px solid var(--glass-border)'}} title={loc.name}>{loc.label || 'Untitled'}</button>)}
              </div>
              <div className="flex gap-2 flex-wrap" style={{ overflow: 'visible' }}>
                {stormInfo && <div className="status-badge" style={{background:stormInfo.color+'33',borderColor:stormInfo.color,color:stormInfo.color}}>{stormInfo.level}</div>}
                {aqiInfo && (
                  <div style={{position:'relative', overflow: 'visible', zIndex: 9999}}>
                    <button 
                      className="status-badge" 
                      style={{
                        background: aqiInfo.color + '33',
                        borderColor: aqiInfo.color,
                        color: aqiInfo.color,
                        cursor: 'pointer'
                      }} 
                      onClick={() => setShowAirDropdown(!showAirDropdown)}
                    >
                      Air: {aqiInfo.label} ▼
                    </button>
                    {showAirDropdown && (
                      <div 
                        className="glass" 
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 8px)',
                          left: 0,
                          minWidth: '300px',
                          padding: '16px',
                          zIndex: 99999,
                          borderRadius: '16px',
                          background: 'rgba(15, 23, 42, 0.98)',
                          backdropFilter: 'blur(24px)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: '0 16px 64px rgba(0, 0, 0, 0.6)'
                        }}
                      >
                        <p className="font-bold mb-3">Weather Details</p>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-muted">AQI</span>
                          <span className="font-bold" style={{color: aqiInfo.color}}>{aqi?.us_aqi ?? '--'}</span>
                        </div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-muted">Wind</span>
                          <span className="font-bold">{Math.round(ws)} km/h {getWindDirection(wd)}</span>
                        </div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-muted">Humidity</span>
                          <span className="font-bold">{hum}%</span>
                        </div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-muted">Pressure</span>
                          <span className="font-bold">{pres} hPa</span>
                        </div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-muted">Visibility</span>
                          <span className="font-bold">{(vis / 1000).toFixed(1)} km</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">UV Index</span>
                          <span className="font-bold">{uv}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* WeatherManTab - positioned below weather card with lower z-index */}
            <div style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
              <WeatherManTab 
                weather={weather} 
                location={location} 
                todayStats={todayStats} 
                aqi={aqi} 
                onRefresh={() => fetchWeatherData(location.lat, location.lon)} 
              />
            </div>
            
            {/* Hourly Forecast Card */}
            <div className="glass" style={{padding:'20px',borderRadius:'20px',position:'relative',zIndex:2,overflow:'visible'}}>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold">Hourly Forecast</p>
                <button 
                  className="btn-ghost text-xs" 
                  onClick={() => setShowHourlyModal(true)}
                  style={{ padding: '4px 12px' }}
                >
                  View All →
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{scrollSnapType:'x mandatory'}}>
                {weather?.hourly?.time?.slice(0,12).map((time, i) => (
                  <div 
                    key={time} 
                    className="glass text-center p-3 rounded-2xl flex-shrink-0" 
                    style={{
                      minWidth:'72px',
                      scrollSnapAlign:'start',
                      background:'rgba(255,255,255,0.05)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowHourlyModal(true)}
                  >
                    <p className="text-xs text-muted">{new Date(time).toLocaleTimeString('en-US',{hour:'numeric',hour12:true})}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                      {getWeatherSVG(weather.hourly.weather_code?.[i] || 0, 32)}
                    </div>
                    <p className="text-sm font-bold">{Math.round(weather.hourly.temperature_2m?.[i] || 0)}°</p>
                    {weather.hourly.precipitation_probability?.[i] > 20 && (
                      <p className="text-[10px] text-accent">{Math.round(weather.hourly.precipitation_probability[i])}%</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Daily Forecast Card */}
            <div className="glass" style={{padding:'20px',borderRadius:'20px',position:'relative',zIndex:2,overflow:'visible'}}>
              <p className="text-sm font-bold mb-3">7-Day Forecast</p>
              {weather?.daily?.time?.slice(0,7).map((day, i) => (
                <div key={day} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                  <span className="text-sm font-medium">{new Date(day).toLocaleDateString('en',{weekday:'short'})}</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getWeatherSVG(weather.daily.weather_code[i], 32)}
                  </div>
                  <div className="flex gap-3 text-sm"><span className="font-bold">{Math.round(weather.daily.temperature_2m_max[i])}°</span><span className="text-muted">{Math.round(weather.daily.temperature_2m_min[i])}°</span></div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {tab === 'map' && (
          <MapTab 
            weather={weather} 
            location={location} 
            aqi={aqi} 
          />
        )}
        
        {tab === 'quotes' && (
          <QuotesTab 
            saveQuote={saveQuote} 
            shareQuote={shareQuote}
            shareFact={shareFact}
            saveFact={saveFact} 
            quoteOfDay={quoteOfDay} 
          />
        )}
        {tab === 'saved' && (
          <SavedTab 
            showToast={showToast} 
            shareQuote={shareQuote}
            shareFact={shareFact}
          />
        )}
        <div className="text-center mt-4 mb-4"><p className="text-sm text-muted">hyesent.dev</p></div>
      </div>
      
      <div className="bottom-nav">
        <button className={`nav-btn ${tab==='weather'?'active':''}`} onClick={()=>setTab('weather')}>Weather</button>
        <button className={`nav-btn ${tab==='map'?'active':''}`} onClick={()=>setTab('map')}>Map</button>
        <button className={`nav-btn ${tab==='quotes'?'active':''}`} onClick={()=>setTab('quotes')}>Quotes</button>
        <button className={`nav-btn ${tab==='saved'?'active':''}`} onClick={()=>setTab('saved')}>Saved</button>
        <button className={`nav-btn ${tab==='ai'?'active':''}`} onClick={()=>setTab('ai')}>AI</button>
      </div>
      
      <HourlyModal 
        isOpen={showHourlyModal}
        onClose={() => setShowHourlyModal(false)}
        hourlyData={weather?.hourly}
        locationName={location?.name}
      />
    </div>
  )
}

// ============================================================================
// QUOTES TAB
// ============================================================================

function QuotesTab({ saveQuote, shareQuote, shareFact, saveFact, quoteOfDay }) {
  const [quoteCategory, setQuoteCategory] = useState('All')
  const [factCategory, setFactCategory] = useState('All')
  const [currentQuote, setCurrentQuote] = useState(null)
  const [currentFact, setCurrentFact] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState(0)
  
  useEffect(() => { fetchQuote(); fetchFact() }, [])
  useEffect(() => { fetchQuote() }, [quoteCategory])
  useEffect(() => { fetchFact() }, [factCategory])
  
  const fetchQuote = () => {
    if (Date.now() - lastFetch < 5000) return; 
    setLastFetch(Date.now()); 
    setLoading(true)
    let pool = quoteCategory === 'All' ? getAllQuotesPool() : (QUOTES[quoteCategory]?.map(q => ({...q, tag: quoteCategory})) || [])
    setCurrentQuote(pool[Math.floor(Math.random() * pool.length)]); 
    setLoading(false)
  }
  
  const fetchFact = async () => {
    setLoading(true)
    try { 
      const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en'); 
      if (!res.ok) throw new Error(); 
      setCurrentFact({ text: (await res.json()).text }) 
    } catch { 
      try { 
        const res2 = await fetch('https://numbersapi.com/random/trivia?json'); 
        if (!res2.ok) throw new Error(); 
        setCurrentFact({ text: (await res2.json()).text }) 
      } catch { 
        let pool = factCategory === 'All' ? Object.values(LOCAL_FACTS).flat() : (LOCAL_FACTS[factCategory] || LOCAL_FACTS.Science); 
        setCurrentFact(pool[Math.floor(Math.random() * pool.length)]) 
      } 
    }
    setLoading(false)
  }
  
  return (
    <>
      {quoteOfDay && (
        <div className="glass mb-4" style={{padding:'20px',borderRadius:'20px',border:'2px solid var(--accent)',background:'rgba(56,189,248,0.05)'}}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-bold text-accent flex items-center gap-2"><span>🌟</span> Quote of the Day</p>
          </div>
          <p className="text-lg font-bold mb-3">{quoteOfDay.content}</p>
          <p className="text-sm text-muted mb-4">— {quoteOfDay.author}</p>
          <div className="flex gap-2">
            <button className="btn-share text-sm" onClick={() => shareQuote(quoteOfDay.content, quoteOfDay.author)}>Share</button>
            <button className="btn-ghost text-sm" onClick={() => saveQuote(quoteOfDay)}>Save</button>
          </div>
        </div>
      )}
      
      <div className="glass mb-4" style={{padding:'20px',borderRadius:'20px'}}>
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold">Explore Quotes</p>
          <button className="btn-primary text-sm" onClick={fetchQuote} disabled={loading}>{loading?'Loading...':'New Quote'}</button>
        </div>
        <div className="sub-tabs mb-4">
          {QUOTE_CATEGORIES.map(cat => <button key={cat} className={`sub-tab ${quoteCategory===cat?'active':''}`} onClick={()=>setQuoteCategory(cat)}>{cat}</button>)}
        </div>
        {currentQuote && (
          <div className="list-item">
            <p className="font-bold mb-4">{currentQuote.content}</p>
            <p className="text-sm text-muted mb-4">— {currentQuote.author}</p>
            <div className="flex gap-2">
              <button className="btn-share text-sm" onClick={() => shareQuote(currentQuote.content, currentQuote.author)}>Share</button>
              <button className="btn-ghost text-sm" onClick={() => saveQuote(currentQuote)}>Save</button>
            </div>
          </div>
        )}
      </div>
      
      <div className="glass mb-4" style={{padding:'20px',borderRadius:'20px'}}>
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold">Did You Know?</p>
          <button className="btn-primary text-sm" onClick={fetchFact} disabled={loading}>{loading?'Loading...':'New Fact'}</button>
        </div>
        <div className="sub-tabs mb-4">
          {FACT_CATEGORIES.map(cat => <button key={cat} className={`sub-tab ${factCategory===cat?'active':''}`} onClick={()=>setFactCategory(cat)}>{cat}</button>)}
        </div>
        {currentFact && (
          <div className="list-item">
            <p className="font-bold mb-4">{currentFact.text}</p>
            <div className="flex gap-2">
              <button className="btn-share text-sm" onClick={() => shareFact(currentFact.text)}>Share</button>
              <button className="btn-ghost text-sm" onClick={() => saveFact(currentFact)}>Save</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ============================================================================
// SAVED TAB
// ============================================================================

function SavedTab({ showToast, shareQuote, shareFact }) {
  const [savedQuotes, setSavedQuotes] = useState([])
  const [savedFacts, setSavedFacts] = useState([])
  const [activeSubTab, setActiveSubTab] = useState('quotes')
  
  useEffect(() => { 
    setSavedQuotes(JSON.parse(localStorage.getItem('zephye_saved_quotes')||'[]')); 
    setSavedFacts(JSON.parse(localStorage.getItem('zephye_saved_facts')||'[]')) 
  }, [])
  
  const deleteQuote = (id) => { 
    const u = savedQuotes.filter(q => q.id!==id); 
    localStorage.setItem('zephye_saved_quotes',JSON.stringify(u)); 
    setSavedQuotes(u); 
    showToast('Quote deleted') 
  }
  
  const deleteFact = (id) => { 
    const u = savedFacts.filter(f => f.id!==id); 
    localStorage.setItem('zephye_saved_facts',JSON.stringify(u)); 
    setSavedFacts(u); 
    showToast('Fact deleted') 
  }
  
  return (
    <div className="glass" style={{padding:'20px',borderRadius:'20px'}}>
      <div className="sub-tabs mb-4">
        <button className={`sub-tab ${activeSubTab==='quotes'?'active':''}`} onClick={()=>setActiveSubTab('quotes')}>Quotes ({savedQuotes.length})</button>
        <button className={`sub-tab ${activeSubTab==='facts'?'active':''}`} onClick={()=>setActiveSubTab('facts')}>Facts ({savedFacts.length})</button>
      </div>
      
      {activeSubTab==='quotes' && (
        savedQuotes.length===0 ? 
        <p className="text-center text-muted py-8">No saved quotes yet.</p> :
        savedQuotes.map(q => (
          <div key={q.id} className="list-item">
            <p className="font-bold mb-2">{q.quote_text}</p>
            <p className="text-sm text-muted mb-3">— {q.quote_author}</p>
            <div className="flex gap-2">
              <button className="btn-share text-xs" onClick={()=>shareQuote(q.quote_text, q.quote_author)}>Share</button>
              <button className="btn-ghost text-xs" onClick={()=>deleteQuote(q.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
      
      {activeSubTab==='facts' && (
        savedFacts.length===0 ? 
        <p className="text-center text-muted py-8">No saved facts yet.</p> :
        savedFacts.map(f => (
          <div key={f.id} className="list-item">
            <p className="font-bold mb-3">{f.fact_text}</p>
            <div className="flex gap-2">
              <button className="btn-share text-xs" onClick={()=>shareFact(f.fact_text)}>Share</button>
              <button className="btn-ghost text-xs" onClick={()=>deleteFact(f.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default function App() { 
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  )
}
