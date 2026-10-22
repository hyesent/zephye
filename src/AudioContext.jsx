import { createContext, useContext, useState, useRef, useEffect } from 'react'

const AudioContext = createContext()

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) throw new Error('useAudio must be used within AudioProvider')
  return context
}

export const AudioProvider = ({ children }) => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentVoice, setCurrentVoice] = useState('')
  const [showOrb, setShowOrb] = useState(false)
  const audioRef = useRef(null)
  const sourceRef = useRef(null)

  // Wake lock to keep screen alive during playback
  const wakeLockRef = useRef(null)

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch (err) {
      console.log('Wake Lock failed:', err)
    }
  }

  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
      }
    } catch (err) {
      console.log('Wake Lock release failed:', err)
    }
  }

  const playGlobal = async (audioUrl, voiceName = '') => {
    try {
      stopGlobal()
      setCurrentVoice(voiceName)
      setShowOrb(true)
      setIsSpeaking(true)
      await requestWakeLock()

      // Handle iOS Safari audio unlock
      if (!audioRef.current) {
        audioRef.current = new Audio()
        audioRef.current.preload = 'auto'
      }

      const audio = audioRef.current
      audio.src = audioUrl

      audio.onended = () => {
        setIsSpeaking(false)
        setShowOrb(false)
        setCurrentVoice('')
        releaseWakeLock()
      }

      audio.onerror = () => {
        setIsSpeaking(false)
        setShowOrb(false)
        setCurrentVoice('')
        releaseWakeLock()
        console.error('Audio playback error')
      }

      // iOS requires user gesture - this is called from button click
      await audio.play()
    } catch (err) {
      console.error('playGlobal failed:', err)
      setIsSpeaking(false)
      setShowOrb(false)
      releaseWakeLock()
    }
  }

  const stopGlobal = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsSpeaking(false)
    setShowOrb(false)
    setCurrentVoice('')
    releaseWakeLock()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopGlobal()
    }
  }, [])

  // Handle page visibility - keep playing in background
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isSpeaking) {
        console.log('App backgrounded, keeping audio alive')
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isSpeaking])

  return (
    <AudioContext.Provider value={{
      isSpeaking,
      currentVoice,
      showOrb,
      playGlobal,
      stopGlobal
    }}>
      {children}

      {/* Global Siri-style Orb */}
      {showOrb && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          zIndex: 9999,
          pointerEvents: 'auto'
        }}>
          <div
            onClick={stopGlobal}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #3b82f6, #8b5cf6, #ec4899)',
              boxShadow: '0 0 30px rgba(59,130,246,0.6), 0 0 60px rgba(139,92,246,0.4)',
              animation: isSpeaking? 'siriPulse 1.5s ease-in-out infinite' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              animation: isSpeaking? 'siriInner 1s ease-in-out infinite' : 'none'
            }}></div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes siriPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes siriInner {
          0%, 100% { transform: scale(0.8); opacity: 0.6; }
          50% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </AudioContext.Provider>
  )
  }
