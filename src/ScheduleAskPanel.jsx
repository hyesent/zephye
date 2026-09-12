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

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
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
  { id: 'route',     label: 'Route',      icon: '→' },
  { id: 'traffic',   label: 'Traffic',    icon: '◈' },
  { id: 'weather',   label: 'Weather',    icon: '☁' },
  { id: 'clothing',  label: 'Clothing',   icon: '◐' },
  { id: 'events',    label: 'Events',     icon: '◆' },
  { id: 'sports',    label: 'Sports',     icon: '●' },
  { id: 'health',    label: 'Health',     icon: '✚' },
  { id: 'driving',   label: 'Driving',    icon: '◉' },
  { id: 'pets',      label: 'Pets',       icon: '◐' },
  { id: 'energy',    label: 'Energy',     icon: '⚡' },
  { id: 'stargazing',label: 'Stargazing', icon: '✦' },
  { id: 'farming',   label: 'Farming',    icon: '❀' },
  { id: 'photography', label: 'Photography', icon: '◨' },
  { id: 'lifestyle', label: 'Lifestyle',  icon: '◍' },
  { id: 'diy',       label: 'DIY',        icon: '⚒' },
  { id: 'traveling', label: 'Travel',     icon: '✈' },
  { id: 'skin_hair', label: 'Beauty',     icon: '✿' }
]

const FIRE_WINDOW_OPTIONS = [
  { value: 15, label: '15 min before' },
  { value: 30, label: '30 min before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '1 day before' }
]

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── NEW / EDIT FORM ─────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

function ScheduleForm({ 
  initial = null,       // if editing, the original schedule
  savedLocations = [],
  homeLocation = null,
  onSubmit,
  onCancel
}) {
  const [question, setQuestion] = useState(initial?.question || '')
  const [intents, setIntents] = useState(initial?.intents || ['route', 'traffic', 'weather'])
  const [toLocation, setToLocation] = useState(initial?.location?.label || '')
  const [fromLocation, setFromLocation] = useState(initial?.fromLocation?.label || 'Home')
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
      // Default to tomorrow 9am
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
      setError('Please describe what you want to schedule.')
      return
    }
    if (intents.length === 0) {
      setError('Select at least one pill.')
      return
    }
    if (!toLocation.trim()) {
      setError('Please pick a destination.')
      return
    }
    if (!date || !time) {
      setError('Please pick a date and time.')
      return
    }

    const dt = new Date(`${date}T${time}`)
    if (isNaN(dt.getTime())) {
      setError('Invalid date or time.')
      return
    }
    if (dt.getTime() < Date.now()) {
      setError('Target time must be in the future.')
      return
    }

    // Resolve toLocation object
    let toLoc = null
    const matchedSaved = savedLocations.find(l => 
      (l.label || l.name || '').toLowerCase() === toLocation.toLowerCase()
    )
    if (matchedSaved) {
      toLoc = { lat: matchedSaved.lat, lon: matchedSaved.lon, label: matchedSaved.label || matchedSaved.name }
    } else if (homeLocation && toLocation.toLowerCase() === (homeLocation.label || homeLocation.name || '').toLowerCase()) {
      toLoc = { lat: homeLocation.lat, lon: homeLocation.lon, label: homeLocation.label || homeLocation.name }
    } else {
      setError('Destination must be a saved location.')
      return
    }

    // Resolve fromLocation (only if routing pill selected)
    let fromLoc = null
    if (intents.includes('route')) {
      const matchedFrom = savedLocations.find(l => 
        (l.label || l.name || '').toLowerCase() === fromLocation.toLowerCase()
      )
      if (matchedFrom) {
        fromLoc = { lat: matchedFrom.lat, lon: matchedFrom.lon, label: matchedFrom.label || matchedFrom.name }
      } else if (homeLocation && fromLocation.toLowerCase() === 'home') {
        fromLoc = { lat: homeLocation.lat, lon: homeLocation.lon, label: 'Home' }
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
        <h3>{initial ? 'Edit Scheduled Ask' : 'New Scheduled Ask'}</h3>
        <button className="icon-btn" onClick={onCancel}>
          <CloseIcon />
        </button>
      </div>

      {/* Question */}
      <div className="form-field">
        <label>What are you asking?</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Going to an event in Lagos"
          className="form-input"
        />
      </div>

      {/* Pills */}
      <div className="form-field">
        <label>Include in the result</label>
        <div className="pills-grid">
          {AVAILABLE_INTENTS.map(intent => (
            <button
              key={intent.id}
              className={`pill-btn ${intents.includes(intent.id) ? 'active' : ''}`}
              onClick={() => toggleIntent(intent.id)}
              type="button"
            >
              <span className="pill-icon">{intent.icon}</span>
              {intent.label}
            </button>
          ))}
        </div>
      </div>

      {/* Locations */}
      <div className="form-field">
        <label>Destination</label>
        <select
          value={toLocation}
          onChange={(e) => setToLocation(e.target.value)}
          className="form-input"
        >
          <option value="">Select a destination...</option>
          {homeLocation && (
            <option value={homeLocation.label || homeLocation.name}>
              {homeLocation.label || homeLocation.name} (Home)
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
          <label>From</label>
          <select
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            className="form-input"
          >
            {homeLocation && <option value="Home">Home</option>}
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
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-field">
          <label>Time</label>
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
        <label>Fire reminder</label>
        <select
          value={fireWindow}
          onChange={(e) => setFireWindow(parseInt(e.target.value))}
          className="form-input"
        >
          {FIRE_WINDOW_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleSubmit}>
          {initial ? 'Save Changes' : 'Schedule Ask'}
        </button>
      </div>
    </div>
  )
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── SCHEDULE CARD ───────────────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

function ScheduleCard({ schedule, onEdit, onDelete, onView }) {
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

  const intentLabels = (schedule.intents || []).map(id => {
    const found = AVAILABLE_INTENTS.find(a => a.id === id)
    return found ? found.label : id
  })

  return (
    <div className="schedule-card">
      <div className="schedule-card-header">
        <div className="schedule-card-loc">
          <LocationIcon />
          {schedule.location?.label || 'Unknown'}
        </div>
        <div className="schedule-card-status" style={{ color: statusColor }}>
          {schedule.status.toUpperCase()}
        </div>
      </div>

      <div className="schedule-card-time">
        {formatScheduleTime(schedule.targetTime)}
      </div>

      {schedule.status === 'pending' && (
        <div className="schedule-card-countdown">
          <ClockIcon />
          Fires in {getCountdown(schedule.targetTime - (schedule.fireWindow || 30) * 60000)}
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
              <EditIcon /> Edit
            </button>
            <button className="card-btn danger" onClick={() => onDelete(schedule.id)}>
              <TrashIcon /> Delete
            </button>
          </>
        )}
        {schedule.status === 'fired' && (
          <>
            <button className="card-btn success" onClick={() => onView(schedule)}>
              View Result
            </button>
            <button className="card-btn" onClick={() => onDelete(schedule.id)}>
              <TrashIcon /> Delete
            </button>
          </>
        )}
        {['done', 'cancelled', 'dismissed', 'missed', 'shifted', 'edited'].includes(schedule.status) && (
          <button className="card-btn danger" onClick={() => onDelete(schedule.id)}>
            <TrashIcon /> Remove
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
  prefilledData = null,     // { question, location, targetTime, intents } — when opened from a future-time card
  editScheduleId = null     // when opened to edit an existing schedule
}) {
  const [schedules, setSchedules] = useState([])
  const [view, setView] = useState('list') // 'list' | 'new' | 'edit' | 'view'
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [viewingSchedule, setViewingSchedule] = useState(null)
  const [tab, setTab] = useState('pending') // 'pending' | 'fired' | 'history'

  const refresh = () => setSchedules(getSchedules())

  useEffect(() => { refresh() }, [])

  // Handle prefilled data or edit id on mount
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
    if (!confirm('Delete this scheduled ask?')) return
    deleteSchedule(id)
    refresh()
  }

  const handleView = (schedule) => {
    setViewingSchedule(schedule)
    setView('view')
  }

  // ─── RENDER FORM MODES ─────────────────────────────────────────────

  if (view === 'new' || view === 'edit') {
    return (
      <div className="schedule-panel">
        <div className="panel-header">
          <button className="icon-btn" onClick={() => { setView('list'); setEditingSchedule(null) }}>
            <BackIcon />
          </button>
          <div className="panel-title">
            {view === 'edit' ? 'Edit Schedule' : 'New Schedule'}
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
          />
        </div>
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
          <div className="panel-title">Result</div>
          <div style={{ width: 32 }} />
        </div>

        <div className="panel-body">
          <div className="result-card">
            <div className="result-meta">
              <div>📍 {viewingSchedule.location?.label}</div>
              <div>{formatScheduleTime(viewingSchedule.targetTime)}</div>
            </div>
            <div className="result-content">
              {viewingSchedule.result?.content || 'No result available.'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── RENDER LIST MODE ──────────────────────────────────────────────

  const activeList = tab === 'pending' ? pending : tab === 'fired' ? fired : history

  return (
    <div className="schedule-panel">
      {/* Header */}
      <div className="panel-header">
        <button className="icon-btn" onClick={onClose}>
          <BackIcon />
        </button>
        <div className="panel-title">Schedules</div>
        <button className="icon-btn" onClick={() => setView('new')} title="New schedule">
          <PlusIcon />
        </button>
      </div>

      {/* Tabs */}
      <div className="panel-tabs">
        <button 
          className={`panel-tab ${tab === 'pending' ? 'active' : ''}`}
          onClick={() => setTab('pending')}
        >
          Pending {pending.length > 0 && `(${pending.length})`}
        </button>
        <button 
          className={`panel-tab ${tab === 'fired' ? 'active' : ''}`}
          onClick={() => setTab('fired')}
        >
          Fired {fired.length > 0 && `(${fired.length})`}
        </button>
        <button 
          className={`panel-tab ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          History {history.length > 0 && `(${history.length})`}
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
              {tab === 'pending' && 'No pending schedules'}
              {tab === 'fired' && 'No fired schedules'}
              {tab === 'history' && 'No history yet'}
            </div>
            <div className="empty-text">
              {tab === 'pending' && 'Schedule an ask to get notified at the right time.'}
              {tab === 'fired' && 'Fired schedules will appear here when they trigger.'}
              {tab === 'history' && 'Completed and cancelled schedules will show here.'}
            </div>
            {tab === 'pending' && (
              <button className="btn-primary" onClick={() => setView('new')}>
                <PlusIcon /> New Scheduled Ask
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
            />
          ))
        )}
      </div>

      <style jsx>{`
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

        /* ─── Empty state ─────────────────────────────────────────── */
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

        /* ─── Schedule Card ───────────────────────────────────────── */
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

        /* ─── Form ────────────────────────────────────────────────── */
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

        /* ─── Result View ─────────────────────────────────────────── */
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
      `}</style>
    </div>
  )
}
