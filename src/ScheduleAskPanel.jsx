import { useState, useEffect, useMemo } from 'react'
import {
  getSchedules,
  getPendingSchedules,
  getFiredSchedules,
  getHistorySchedules,
  createSchedule,
  deleteSchedule,
  editSchedule,
  markDone,
  markCancelled,
  markDismissed,
  getCountdown,
  formatScheduleTime
} from './scheduleEngine'
import { useTranslation } from './utils/translation'

// ─── SVG ICONS ──────────────────────────────────────────────────────────

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const LocationIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── AVAILABLE INTENTS (pills) ───────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const AVAILABLE_INTENTS = [
  { id: 'route',       icon: '→' },
  { id: 'traffic',     icon: '◈' },
  { id: 'weather',     icon: '☁' },
  { id: 'clothing',    icon: '◐' },
  { id: 'events',      icon: '◆' },
  { id: 'sports',      icon: '●' },
  { id: 'health',      icon: '✚' },
  { id: 'driving',     icon: '◉' },
  { id: 'pets',        icon: '◐' },
  { id: 'energy',      icon: '⚡' },
  { id: 'stargazing',  icon: '✦' },
  { id: 'farming',     icon: '❀' },
  { id: 'photography', icon: '◨' },
  { id: 'lifestyle',   icon: '◍' },
  { id: 'diy',         icon: '⚒' },
  { id: 'traveling',   icon: '✈' },
  { id: 'skin_hair',   icon: '✿' }
]

// Map intent id → translation key
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

const FIRE_WINDOW_OPTIONS = [
  { value: 15,   labelKey: 'schedule.min15' },
  { value: 30,   labelKey: 'schedule.min30' },
  { value: 60,   labelKey: 'schedule.hour1' },
  { value: 120,  labelKey: 'schedule.hours2' },
  { value: 1440, labelKey: 'schedule.day1' }
]

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── NEW / EDIT FORM ─────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

function ScheduleForm({
  initial = null,
  savedLocations = [],
  homeLocation = null,
  onSubmit,
  onCancel,
  t
}) {
  const [question, setQuestion] = useState(initial?.question || '')
  const [intents, setIntents] = useState(initial?.intents || ['route', 'traffic', 'weather'])
  const [toLocation, setToLocation] = useState(initial?.location?.label || '')
  const [fromLocation, setFromLocation] = useState(initial?.fromLocation?.label || t('schedule.home'))
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [fireWindow, setFireWindow] = useState(initial?.fireWindow || 30)
  const [error, setError] = useState('')

  // Prefill date/time from initial
  useEffect(() => {
    if (initial?.targetTime) {
      const d = new Date(initial.targetTime)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const mi = String(d.getMinutes()).padStart(2, '0')
      setDate(`${yyyy}-${mm}-${dd}`)
      setTime(`${hh}:${mi}`)
    } else {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      d.setHours(9, 0, 0, 0)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      setDate(`${yyyy}-${mm}-${dd}`)
      setTime('09:00')
    }
  }, [initial])

  const toggleIntent = (id) => {
    setIntents(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleSubmit = () => {
    setError('')

    if (!question.trim()) {
      setError(t('schedule.errQuestion'))
      return
    }
    if (intents.length === 0) {
      setError(t('schedule.errPills'))
      return
    }
    if (!toLocation.trim()) {
      setError(t('schedule.errDestination'))
      return
    }
    if (!date || !time) {
      setError(t('schedule.errDateTime'))
      return
    }

    const dt = new Date(`${date}T${time}`)
    if (isNaN(dt.getTime())) {
      setError(t('schedule.errInvalidDateTime'))
      return
    }
    if (dt.getTime() < Date.now()) {
      setError(t('schedule.errFutureTime'))
      return
    }

    // Resolve destination
    let toLoc = null
    const matchedSaved = savedLocations.find(l =>
      (l.label || l.name || '').toLowerCase() === toLocation.toLowerCase()
    )
    if (matchedSaved) {
      toLoc = { lat: matchedSaved.lat, lon: matchedSaved.lon, label: matchedSaved.label || matchedSaved.name }
    } else if (homeLocation && toLocation.toLowerCase() === (homeLocation.label || homeLocation.name || '').toLowerCase()) {
      toLoc = { lat: homeLocation.lat, lon: homeLocation.lon, label: homeLocation.label || homeLocation.name }
    } else {
      setError(t('schedule.errDestinationSaved'))
      return
    }

    // Resolve origin (only if routing pill selected)
    let fromLoc = null
    if (intents.includes('route')) {
      const matchedFrom = savedLocations.find(l =>
        (l.label || l.name || '').toLowerCase() === fromLocation.toLowerCase()
      )
      if (matchedFrom) {
        fromLoc = { lat: matchedFrom.lat, lon: matchedFrom.lon, label: matchedFrom.label || matchedFrom.name }
      } else if (homeLocation && fromLocation.toLowerCase() === t('schedule.home').toLowerCase()) {
        fromLoc = { lat: homeLocation.lat, lon: homeLocation.lon, label: t('schedule.home') }
      }
    }

    onSubmit({
      question,
      location: toLoc,
      fromLocation: fromLoc,
      targetTime: dt.getTime(),
      intents,
      fireWindow
    })
  }

  return (
    <div className="schedule-form">
      <div className="form-header">
        <h3>{initial ? t('schedule.editSchedule') : t('schedule.newSchedule')}</h3>
        <button className="icon-btn" onClick={onCancel}>
          <CloseIcon />
        </button>
      </div>

      {/* Question */}
      <div className="form-field">
        <label>{t('schedule.whatAsking')}</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('schedule.whatAskingPlaceholder')}
          className="form-input"
        />
      </div>

      {/* Pills */}
      <div className="form-field">
        <label>{t('schedule.includeInResult')}</label>
        <div className="pills-grid">
          {AVAILABLE_INTENTS.map(intent => (
            <button
              key={intent.id}
              className={`pill-btn ${intents.includes(intent.id) ? 'active' : ''}`}
              onClick={() => toggleIntent(intent.id)}
              type="button"
            >
              <span className="pill-icon">{intent.icon}</span>
              {t(INTENT_LABEL_KEY[intent.id])}
            </button>
          ))}
        </div>
      </div>

      {/* Destination */}
      <div className="form-field">
        <label>{t('schedule.destination')}</label>
        <select
          value={toLocation}
          onChange={(e) => setToLocation(e.target.value)}
          className="form-input"
        >
          <option value="">{t('schedule.selectDestination')}</option>
          {homeLocation && (
            <option value={homeLocation.label || homeLocation.name}>
              {homeLocation.label || homeLocation.name} ({t('schedule.home')})
            </option>
          )}
          {savedLocations.map((loc, i) => (
            <option key={i} value={loc.label || loc.name}>
              {loc.label || loc.name}
            </option>
          ))}
        </select>
      </div>

      {intents.includes('route') && (
        <div className="form-field">
          <label>{t('schedule.from')}</label>
          <select
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            className="form-input"
          >
            {homeLocation && <option value={t('schedule.home')}>{t('schedule.home')}</option>}
            {savedLocations.map((loc, i) => (
              <option key={i} value={loc.label || loc.name}>
                {loc.label || loc.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Date + Time */}
      <div className="form-row">
        <div className="form-field">
          <label>{t('schedule.date')}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-field">
          <label>{t('schedule.time')}</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Fire window */}
      <div className="form-field">
        <label>{t('schedule.fireReminder')}</label>
        <select
          value={fireWindow}
          onChange={(e) => setFireWindow(parseInt(e.target.value))}
          className="form-input"
        >
          {FIRE_WINDOW_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>
          {t('buttons.cancel')}
        </button>
        <button className="btn-primary" onClick={handleSubmit}>
          {initial ? t('schedule.saveChanges') : t('schedule.scheduleAsk')}
        </button>
      </div>
    </div>
  )
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── SCHEDULE CARD ───────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

function ScheduleCard({ schedule, onEdit, onDelete, onView, t }) {
  const statusColor = {
    pending: 'var(--accent)',
    fired: '#eab308',
    done: '#22c55e',
    cancelled: '#ef4444',
    dismissed: '#6b7280',
    missed: '#f97316',
    shifted: '#8b5cf6',
    edited: '#06b6d4'
  }[schedule.status] || 'var(--text-muted)'

  const statusKey = {
    pending: 'schedule.statusPending',
    fired: 'schedule.statusFired',
    done: 'schedule.statusDone',
    cancelled: 'schedule.statusCancelled',
    dismissed: 'schedule.statusDismissed',
    missed: 'schedule.statusMissed',
    shifted: 'schedule.statusShifted',
    edited: 'schedule.statusEdited'
  }[schedule.status]

  const intentLabels = (schedule.intents || []).map(id => t(INTENT_LABEL_KEY[id] || id))

  return (
    <div className="schedule-card">
      <div className="schedule-card-header">
        <div className="schedule-card-loc">
          <LocationIcon />
          {schedule.location?.label || t('weather.unknown')}
        </div>
        <div className="schedule-card-status" style={{ color: statusColor }}>
          {t(statusKey)}
        </div>
      </div>

      <div className="schedule-card-time">
        {formatScheduleTime(schedule.targetTime)}
      </div>

      {schedule.status === 'pending' && (
        <div className="schedule-card-countdown">
          <ClockIcon />
          {t('schedule.firesIn')} {getCountdown(schedule.targetTime - (schedule.fireWindow || 30) * 60000)}
        </div>
      )}

      <div className="schedule-card-pills">
        {intentLabels.map((label, i) => (
          <span key={i} className="mini-pill">{label}</span>
        ))}
      </div>

      {schedule.question && (
        <div className="schedule-card-question">
          "{schedule.question}"
        </div>
      )}

      <div className="schedule-card-actions">
        {schedule.status === 'pending' && (
          <>
            <button className="card-btn" onClick={() => onEdit(schedule)}>
              <EditIcon /> {t('buttons.edit')}
            </button>
            <button className="card-btn danger" onClick={() => onDelete(schedule.id)}>
              <TrashIcon /> {t('buttons.delete')}
            </button>
          </>
        )}
        {schedule.status === 'fired' && (
          <>
            <button className="card-btn success" onClick={() => onView(schedule)}>
              {t('schedule.viewResult')}
            </button>
            <button className="card-btn" onClick={() => onDelete(schedule.id)}>
              <TrashIcon /> {t('buttons.delete')}
            </button>
          </>
        )}
        {['done', 'cancelled', 'dismissed', 'missed', 'shifted', 'edited'].includes(schedule.status) && (
          <button className="card-btn danger" onClick={() => onDelete(schedule.id)}>
            <TrashIcon /> {t('schedule.remove')}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── MAIN PANEL ──────────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export default function ScheduleAskPanel({
  onClose,
  savedLocations = [],
  homeLocation = null,
  prefilledData = null,
  editScheduleId = null,
  uiLanguage = 'en'
}) {
  const { t } = useTranslation(uiLanguage, homeLocation?.country_code)

  const [schedules, setSchedules] = useState([])
  const [view, setView] = useState('list') // 'list' | 'new' | 'edit' | 'view'
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [viewingSchedule, setViewingSchedule] = useState(null)
  const [tab, setTab] = useState('pending')

  const refresh = () => setSchedules(getSchedules())

  useEffect(() => { refresh() }, [])

  useEffect(() => {
    if (editScheduleId) {
      const s = getSchedules().find(x => x.id === editScheduleId)
      if (s) {
        setEditingSchedule(s)
        setView('edit')
      }
    } else if (prefilledData) {
      setView('new')
    }
  }, [editScheduleId, prefilledData])

  const pending = useMemo(() => schedules.filter(s => s.status === 'pending'), [schedules])
  const fired = useMemo(() => schedules.filter(s => s.status === 'fired'), [schedules])
  const history = useMemo(() => schedules.filter(s =>
    ['done', 'shifted', 'edited', 'cancelled', 'dismissed', 'missed'].includes(s.status)
  ), [schedules])

  const handleCreate = (data) => {
    createSchedule(data)
    refresh()
    setView('list')
    setTab('pending')
  }

  const handleEditSave = (data) => {
    if (editingSchedule) {
      editSchedule(editingSchedule.id, data)
      refresh()
      setEditingSchedule(null)
      setView('list')
    }
  }

  const handleDelete = (id) => {
    if (!confirm(t('schedule.deleteConfirm'))) return
    deleteSchedule(id)
    refresh()
  }

  const handleView = (schedule) => {
    setViewingSchedule(schedule)
    setView('view')
  }

  // ─── FORM MODES ────────────────────────────────────────────────────

  if (view === 'new' || view === 'edit') {
    return (
      <div className="schedule-panel">
        <div className="panel-header">
          <button className="icon-btn" onClick={() => { setView('list'); setEditingSchedule(null) }}>
            <BackIcon />
          </button>
          <div className="panel-title">
            {view === 'edit' ? t('schedule.editSchedule') : t('schedule.newSchedule')}
          </div>
          <div style={{ width: 32 }} />
        </div>

        <div className="panel-body">
          <ScheduleForm
            initial={view === 'edit' ? editingSchedule : (prefilledData ? {
              question: prefilledData.question || '',
              location: prefilledData.location,
              intents: prefilledData.intents || ['route', 'traffic', 'weather'],
              targetTime: prefilledData.targetTime,
              fireWindow: 30
            } : null)}
            savedLocations={savedLocations}
            homeLocation={homeLocation}
            onSubmit={view === 'edit' ? handleEditSave : handleCreate}
            onCancel={() => { setView('list'); setEditingSchedule(null) }}
            t={t}
          />
        </div>

        <style jsx>{PANEL_STYLES}</style>
      </div>
    )
  }

  if (view === 'view' && viewingSchedule) {
    return (
      <div className="schedule-panel">
        <div className="panel-header">
          <button className="icon-btn" onClick={() => setView('list')}>
            <BackIcon />
          </button>
          <div className="panel-title">{t('schedule.result')}</div>
          <div style={{ width: 32 }} />
        </div>

        <div className="panel-body">
          <div className="result-card">
            <div className="result-meta">
              <div><LocationIcon /> {viewingSchedule.location?.label}</div>
              <div>{formatScheduleTime(viewingSchedule.targetTime)}</div>
            </div>
            <div className="result-content">
              {viewingSchedule.result?.content || 'No result available.'}
            </div>
          </div>
        </div>

        <style jsx>{PANEL_STYLES}</style>
      </div>
    )
  }

  // ─── LIST MODE ─────────────────────────────────────────────────────

  const activeList = tab === 'pending' ? pending : tab === 'fired' ? fired : history

  return (
    <div className="schedule-panel">
      {/* Header */}
      <div className="panel-header">
        <button className="icon-btn" onClick={onClose}>
          <BackIcon />
        </button>
        <div className="panel-title">{t('schedule.title')}</div>
        <button className="icon-btn" onClick={() => setView('new')} title={t('schedule.newSchedule')}>
          <PlusIcon />
        </button>
      </div>

      {/* Tabs */}
      <div className="panel-tabs">
        <button
          className={`panel-tab ${tab === 'pending' ? 'active' : ''}`}
          onClick={() => setTab('pending')}
        >
          {t('schedule.tabPending')} {pending.length > 0 && `(${pending.length})`}
        </button>
        <button
          className={`panel-tab ${tab === 'fired' ? 'active' : ''}`}
          onClick={() => setTab('fired')}
        >
          {t('schedule.tabFired')} {fired.length > 0 && `(${fired.length})`}
        </button>
        <button
          className={`panel-tab ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          {t('schedule.tabHistory')} {history.length > 0 && `(${history.length})`}
        </button>
      </div>

      {/* List */}
      <div className="panel-body">
        {activeList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <ClockIcon />
            </div>
            <div className="empty-title">
              {tab === 'pending' && t('schedule.noPending')}
              {tab === 'fired' && t('schedule.noFired')}
              {tab === 'history' && t('schedule.noHistory')}
            </div>
            <div className="empty-text">
              {tab === 'pending' && t('schedule.noPendingDesc')}
              {tab === 'fired' && t('schedule.noFiredDesc')}
              {tab === 'history' && t('schedule.noHistoryDesc')}
            </div>
            {tab === 'pending' && (
              <button className="btn-primary" onClick={() => setView('new')}>
                <PlusIcon /> {t('schedule.newScheduledAsk')}
              </button>
            )}
          </div>
        ) : (
          activeList.map(s => (
            <ScheduleCard
              key={s.id}
              schedule={s}
              onEdit={(sch) => { setEditingSchedule(sch); setView('edit') }}
              onDelete={handleDelete}
              onView={handleView}
              t={t}
            />
          ))
        )}
      </div>

      <style jsx>{PANEL_STYLES}</style>
    </div>
  )
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── SHARED PANEL STYLES ─────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

const PANEL_STYLES = `
  .schedule-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-deep);
    z-index: 10000;
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }

  .panel-title {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;
  }

  .icon-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    color: var(--text);
  }

  .panel-tabs {
    display: flex;
    gap: 4px;
    padding: 12px 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }

  .panel-tab {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 600;
    padding: 8px 14px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: 0.2s;
    font-family: inherit;
  }

  .panel-tab.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }

  .panel-tab:hover:not(.active) {
    color: var(--text);
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 300px;
    text-align: center;
    gap: 12px;
  }

  .empty-icon {
    color: var(--text-muted);
    opacity: 0.4;
  }

  .empty-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
  }

  .empty-text {
    font-size: 13px;
    color: var(--text-muted);
    max-width: 260px;
    line-height: 1.5;
    margin-bottom: 8px;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    background: var(--accent);
    color: var(--bg-deep);
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: 0.2s;
  }

  .btn-primary:hover {
    opacity: 0.9;
    transform: scale(0.98);
  }

  .btn-secondary {
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.06);
    color: var(--text);
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
    font-family: inherit;
    transition: 0.2s;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  /* Schedule Card */
  .schedule-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 14px;
    margin-bottom: 12px;
    transition: 0.2s;
  }

  .schedule-card:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .schedule-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .schedule-card-loc {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }

  .schedule-card-status {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .schedule-card-time {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 6px;
  }

  .schedule-card-countdown {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--accent);
    font-weight: 500;
    margin-bottom: 8px;
  }

  .schedule-card-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
  }

  .mini-pill {
    font-size: 10px;
    padding: 2px 8px;
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.2);
    border-radius: 10px;
    color: #7dd3fc;
    font-weight: 500;
  }

  .schedule-card-question {
    font-size: 12px;
    color: var(--text-muted);
    font-style: italic;
    line-height: 1.4;
    margin-bottom: 10px;
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 8px;
  }

  .schedule-card-actions {
    display: flex;
    gap: 6px;
  }

  .card-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.06);
    color: var(--text);
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
    font-family: inherit;
    transition: 0.2s;
  }

  .card-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .card-btn.danger {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.2);
  }

  .card-btn.danger:hover {
    background: rgba(239, 68, 68, 0.15);
  }

  .card-btn.success {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.08);
    border-color: rgba(34, 197, 94, 0.2);
  }

  .card-btn.success:hover {
    background: rgba(34, 197, 94, 0.15);
  }

  /* Form */
  .schedule-form {
    max-width: 520px;
    margin: 0 auto;
  }

  .form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .form-header h3 {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .form-field {
    margin-bottom: 16px;
  }

  .form-field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .form-input {
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text);
    font-size: 13px;
    outline: none;
    font-family: inherit;
    transition: 0.2s;
  }

  .form-input:focus {
    border-color: var(--accent);
    background: rgba(255, 255, 255, 0.08);
  }

  select.form-input {
    cursor: pointer;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .pills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .pill-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 11px;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--text-muted);
    cursor: pointer;
    font-family: inherit;
    transition: 0.2s;
  }

  .pill-btn.active {
    background: rgba(56, 189, 248, 0.15);
    border-color: rgba(56, 189, 248, 0.4);
    color: #7dd3fc;
  }

  .pill-btn:hover:not(.active) {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text);
  }

  .pill-icon {
    font-size: 12px;
    opacity: 0.7;
  }

  .form-error {
    padding: 10px 14px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 8px;
    color: #ef4444;
    font-size: 12px;
    margin-bottom: 16px;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 24px;
  }

  /* Result View */
  .result-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 16px;
  }

  .result-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .result-content {
    font-size: 13px;
    line-height: 1.6;
    color: var(--text);
    white-space: pre-wrap;
    word-break: break-word;
  }
`
