import { useEffect, useState } from 'react'

export default function TranscriptBubble({
  text,
  isSpeaking
}) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    if (!isSpeaking) {
      setDisplayText('')
      return
    }

    let index = 0

    const interval = setInterval(() => {
      index++

      setDisplayText(text.slice(0, index))

      if (index >= text.length) {
        clearInterval(interval)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [text, isSpeaking])

  if (!isSpeaking) return null

  return (
    <div
      style={{
        padding: '18px',
        borderRadius: '20px',
        background: 'rgba(255,255,255,.06)',
        border: '1px solid rgba(255,255,255,.08)',
        marginBottom: '16px'
      }}
    >
      <div
        style={{
          fontSize: '13px',
          color: '#60a5fa',
          fontWeight: 700,
          marginBottom: '10px'
        }}
      >
        🎙 Zephye Speaking
      </div>

      <div
        style={{
          lineHeight: 1.8,
          color: '#fff',
          fontSize: '14px'
        }}
      >
        {displayText}
      </div>
    </div>
  )
  }
