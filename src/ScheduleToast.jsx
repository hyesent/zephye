import { useState, useEffect } from 'react'
import { 
  markDone, 
  markCancelled, 
  markDismissed, 
  shiftSchedule,
  formatScheduleTime,
  getCountdown
} from './scheduleEngine'
import { useTranslation } from './utils/translation'

// ─── SVG ICONS ──────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const ShiftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)

const CancelIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)

const ExpandIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/>
    <polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/>
    <line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
)

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── INTENT LABEL KEYS ───────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const INTENT_LABEL_KEY = {
  route: 'schedule.pillRoute',
  traffic: 'schedule.pillTraffic',
  weather: 'schedule.pillWeather',
  clothing: 'schedule.pillClothing',
  events: 'schedule.pillEvents',
  sports: 'schedule.pillSports',
  health: 'schedule.pillHealth',
  driving: 'schedule.pillDriving',
  pets: 'schedule.pillPets',
  energy: 'schedule.pillEnergy',
  stargazing: 'schedule.pillStargazing',
  farming: 'schedule.pillFarming',
  photography: 'schedule.pillPhotography',
  lifestyle: 'schedule.pillLifestyle',
  diy: 'schedule.pillDIY',
  traveling: 'schedule.pillTravel',
  skin_hair: 'schedule.pillBeauty'
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── SHIFT PICKER ────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

function ShiftPicker({ schedule, onConfirm, onCancel, t }) {
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('')

  const quickShifts = [
    { labelKey: 'schedule.min15Plus', ms: 15 * 60 * 1000 },
    { labelKey: 'schedule.min30Plus', ms: 30 * 60 * 1000 },
    { labelKey: 'schedule.hour1Plus', ms: 60 * 60 * 1000 },
    { labelKey: 'schedule.hours2Plus', ms: 2 * 60 * 60 * 1000 },
    { labelKey: 'schedule.day1Plus', ms: 24 * 60 * 60 * 1000 },
    { labelKey: 'schedule.week1Plus', ms: 7 * 24 * 60 * 60 * 1000 }
  ]

  const handleQuickShift = (ms) => {
    onConfirm(schedule.targetTime + ms)
  }

  const handleCustomShift = () => {
    if (!customDate || !customTime) return
    const dt = new Date(`${customDate}T${customTime}`)
    if (isNaN(dt.getTime())) return
    onConfirm(dt.getTime())
  }

  return (
    <div className="shift-picker">
      <div className="shift-title">{t('schedule.shiftToWhen')}</div>
      <div className="shift-original">
        {t('schedule.original')}: {formatScheduleTime(schedule.targetTime)}
      </div>

      <div className="shift-quick">
        {quickShifts.map((q, i) => (
          <button 
            key={i} 
            className="shift-chip"
            onClick={() => handleQuickShift(q.ms)}
          >
            {t(q.labelKey)}
          </button>
        ))}
      </div>

      <div className="shift-custom">
        <input
          type="date"
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          className="shift-input"
        />
        <input
          type="time"
          value={customTime}
          onChange={(e) => setCustomTime(e.target.value)}
          className="shift-input"
        />
      </div>

      <div className="shift-actions">
        <button className="toast-btn secondary" onClick={onCancel}>
          {t('buttons.cancel')}
        </button>
        <button 
          className="toast-btn primary" 
          onClick={handleCustomShift}
          disabled={!customDate || !customTime}
        >
          {t('schedule.confirm')}
        </button>
      </div>
    </div>
  )
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── MAIN COMPONENT ──────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export default function ScheduleToast({ 
  firedResults,
  onDismiss,
  onEdit,
  onOpenSchedules,
  onCopyToChat,
  uiLanguage = 'en'
}) {
  // Get home language for UI chrome (buttons, labels)
  const { t } = useTranslation(uiLanguage)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFull, setShowFull] = useState(false)
  const [showShift, setShowShift] = useState(false)

  const current = firedResults?.[currentIndex]
  const schedule = current?.schedule

  useEffect(() => {
    if (!firedResults || firedResults.length === 0) return
    setShowFull(false)
    setShowShift(false)
  }, [currentIndex, firedResults])

  if (!firedResults || firedResults.length === 0 || !schedule) return null

  // ─── ACTIONS ───────────────────────────────────────────────────────

  const handleDone = () => {
    markDone(schedule.id)
    advance()
  }

  const handleEdit = () => {
    onEdit?.(schedule.id)
    handleDismiss()
  }

  const handleShift = () => {
    setShowShift(true)
  }

  const handleShiftConfirm = (newTargetTime) => {
    shiftSchedule(schedule.id, newTargetTime)
    setShowShift(false)
    advance()
  }

  const handleCancel = () => {
    markCancelled(schedule.id)
    advance()
  }

  const handleDismiss = () => {
    markDismissed(schedule.id)
    advance()
  }

  const handleViewFull = () => {
    setShowFull(!showFull)
  }

  const handleOpenInChat = () => {
    onCopyToChat?.(current)
    advance()
  }

  const advance = () => {
    if (firedResults.length > 1) {
      const remaining = firedResults.filter((_, i) => i !== currentIndex)
      if (remaining.length > 0) {
        firedResults.splice(0, firedResults.length, ...remaining)
        setCurrentIndex(0)
      } else {
        onDismiss?.()
      }
    } else {
      onDismiss?.()
    }
  }

  const intentLabels = (schedule.intents || []).map(id => t(INTENT_LABEL_KEY[id] || id))

  // ─── RENDER ────────────────────────────────────────────────────────

  return (
    <div className="schedule-toast-overlay">
      <div className="schedule-toast" style={{
        maxHeight: showFull ? '70vh' : 'auto'
      }}>
        {/* Header */}
        <div className="toast-header">
          <div className="toast-header-left">
            <ClockIcon />
            <span className="toast-title">{t('schedule.ready')}</span>
          </div>
          <button className="toast-close" onClick={handleDismiss} title={t('schedule.statusDismissed')}>
            <CloseIcon />
          </button>
        </div>

        {/* Queue indicator */}
        {firedResults.length > 1 && (
          <div className="toast-queue-badge">
            {currentIndex + 1} {t('schedule.of')} {firedResults.length}
          </div>
        )}

        {/* Location + Time */}
        <div className="toast-meta">
          <div className="toast-location">
            📍 {schedule.location?.label || t('weather.unknown')}
          </div>
          <div className="toast-time">
            {formatScheduleTime(schedule.targetTime)}
          </div>
        </div>

        {/* Intent pills */}
        <div className="toast-pills">
          {intentLabels.map((label, i) => (
            <span key={i} className="toast-pill">{label}</span>
          ))}
        </div>

        {/* Summary (dynamically translated result content) */}
        <div className="toast-summary">
          {current.toastSummary || t('schedule.yourScheduledCheck')}
        </div>

        {/* Full content (expandable) */}
        {showFull && (
          <div className="toast-full-content">
            <div className="toast-full-text">
              {current.merged}
            </div>
            <button 
              className="toast-btn ghost" 
              onClick={handleOpenInChat}
            >
              {t('schedule.openInChat')} →
            </button>
          </div>
        )}

        {/* Shift picker */}
        {showShift && (
          <ShiftPicker
            schedule={schedule}
            onConfirm={handleShiftConfirm}
            onCancel={() => setShowShift(false)}
            t={t}
          />
        )}

        {/* Actions */}
        {!showShift && (
          <>
            <button 
              className="toast-btn expand" 
              onClick={handleViewFull}
            >
              <ExpandIcon />
              {showFull ? t('schedule.hideFull') : t('schedule.viewFull')}
            </button>

            <div className="toast-actions">
              <button className="toast-btn done" onClick={handleDone}>
                <CheckIcon />
                {t('schedule.done')}
              </button>
              <button className="toast-btn edit" onClick={handleEdit}>
                <EditIcon />
                {t('buttons.edit')}
              </button>
              <button className="toast-btn shift" onClick={handleShift}>
                <ShiftIcon />
                {t('schedule.shift')}
              </button>
              <button className="toast-btn cancel" onClick={handleCancel}>
                <CancelIcon />
                {t('schedule.cancel')}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .schedule-toast-overlay {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10001;
          width: calc(100% - 32px);
          max-width: 480px;
          pointer-events: none;
        }

        .schedule-toast {
          background: rgba(15, 23, 42, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(56, 189, 248, 0.15);
          pointer-events: auto;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .toast-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .toast-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--accent);
        }

        .toast-title {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          transition: 0.2s;
        }

        .toast-close:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text);
        }

        .toast-queue-badge {
          position: absolute;
          top: 12px;
          right: 40px;
          background: rgba(56, 189, 248, 0.15);
          color: var(--accent);
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .toast-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 10px;
        }

        .toast-location {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }

        .toast-time {
          font-size: 11px;
          color: var(--text-muted);
        }

        .toast-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .toast-pill {
          font-size: 10px;
          padding: 3px 10px;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 12px;
          color: #7dd3fc;
          font-weight: 500;
        }

        .toast-summary {
          font-size: 13px;
          line-height: 1.5;
          color: var(--text);
          margin-bottom: 12px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          border-left: 2px solid var(--accent);
        }

        .toast-full-content {
          margin-bottom: 12px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          max-height: 40vh;
          overflow-y: auto;
        }

        .toast-full-text {
          font-size: 12px;
          line-height: 1.6;
          color: var(--text-muted);
          white-space: pre-wrap;
          margin-bottom: 10px;
          word-break: break-word;
        }

        .toast-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .toast-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-family: inherit;
        }

        .toast-btn.expand {
          width: 100%;
          margin-bottom: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-muted);
        }

        .toast-btn.expand:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text);
        }

        .toast-btn.ghost {
          background: transparent;
          color: var(--accent);
          border: 1px solid rgba(56, 189, 248, 0.3);
          font-size: 11px;
        }

        .toast-btn.ghost:hover {
          background: rgba(56, 189, 248, 0.1);
        }

        .toast-btn.done {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .toast-btn.done:hover {
          background: rgba(34, 197, 94, 0.25);
        }

        .toast-btn.edit {
          background: rgba(56, 189, 248, 0.12);
          color: #7dd3fc;
          border: 1px solid rgba(56, 189, 248, 0.25);
        }

        .toast-btn.edit:hover {
          background: rgba(56, 189, 248, 0.2);
        }

        .toast-btn.shift {
          background: rgba(234, 179, 8, 0.12);
          color: #eab308;
          border: 1px solid rgba(234, 179, 8, 0.25);
        }

        .toast-btn.shift:hover {
          background: rgba(234, 179, 8, 0.2);
        }

        .toast-btn.cancel {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .toast-btn.cancel:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .toast-btn.primary {
          background: var(--accent);
          color: var(--bg-deep);
        }

        .toast-btn.secondary {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-muted);
        }

        .toast-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Shift Picker */
        .shift-picker {
          margin-top: 8px;
          padding: 12px;
          background: rgba(234, 179, 8, 0.05);
          border: 1px solid rgba(234, 179, 8, 0.2);
          border-radius: 10px;
        }

        .shift-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
        }

        .shift-original {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .shift-quick {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }

        .shift-chip {
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text);
          cursor: pointer;
          transition: 0.2s;
          font-family: inherit;
        }

        .shift-chip:hover {
          background: rgba(234, 179, 8, 0.15);
          border-color: rgba(234, 179, 8, 0.3);
          color: #eab308;
        }

        .shift-custom {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }

        .shift-input {
          flex: 1;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text);
          outline: none;
          font-family: inherit;
        }

        .shift-input:focus {
          border-color: var(--accent);
        }

        .shift-actions {
          display: flex;
          gap: 8px;
        }

        .shift-actions .toast-btn {
          flex: 1;
          padding: 8px;
          font-size: 12px;
        }

        @media (max-width: 480px) {
          .toast-actions {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  )
}
