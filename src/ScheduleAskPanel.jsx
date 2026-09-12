import { useState, useEffect, useMemo, useRef } from 'react'
import {
  getSchedules,
  createSchedule,
  deleteSchedule,
  editSchedule,
  formatScheduleTime,
  getCountdown
} from './scheduleEngine'
import {
  parseScheduleQuestion,
  needsDestination,
  needsOrigin
} from './scheduleParser'
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

const SearchIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
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

const RECURRENCE_OPTIONS = [
  { value: 'once',     labelKey: 'schedule.recOnce' },
  { value: 'daily',    labelKey: 'schedule.recDaily' },
  { value: 'weekdays', labelKey: 'schedule.recWeekdays' },
  { value: 'weekends', labelKey: 'schedule.recWeekends' },
  { value: 'weekly',   labelKey: 'schedule.recWeekly' },
  { value: 'custom',   labelKey: 'schedule.recCustom' }
]

const DAYS_OF_WEEK = [
  { value: 1, labelKey: 'schedule.dayMon' },
  { value: 2, labelKey: 'schedule.dayTue' },
  { value: 3, labelKey: 'schedule.dayWed' },
  { value: 4, labelKey: 'schedule.dayThu' },
  { value: 5, labelKey: 'schedule.dayFri' },
  { value: 6, labelKey: 'schedule.daySat' },
  { value: 0, labelKey: 'schedule.daySun' }
]

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── HYBRID LOCATION COMBO ───────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

function LocationCombo({
  value,
  onChange,
  savedLocations = [],
  homeLocation = null,
  placeholder,
  t
}) {
  const [query, setQuery] = useState(value?.label || '')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  // Sync query when value changes externally
  useEffect(() => {
    setQuery(value?.label || '')
  }, [value])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Build saved options
  const savedOptions = useMemo(() => {
    const opts = []
    if (homeLocation) {
      opts.push({
        type: 'saved',
        lat: homeLocation.lat,
        lon: homeLocation.lon,
        label: homeLocation.label || homeLocation.name,
        country_code: homeLocation.country_code,
        isHome: true
      })
    }
    savedLocations.forEach(loc => {
      if (homeLocation &&
          Math.abs(loc.lat - homeLocation.lat) < 0.001 &&
          Math.abs(loc.lon - homeLocation.lon) < 0.001) return
      opts.push({
        type: 'saved',
        lat: loc.lat,
        lon: loc.lon,
        label: loc.label || loc.name,
        country_code: loc.country_code
      })
    })
    return opts
  }, [savedLocations, homeLocation])

  const filteredSaved = useMemo(() => {
    if (!query) return savedOptions
    const q = query.toLowerCase()
    return savedOptions.filter(o => o.label.toLowerCase().includes(q))
  }, [savedOptions, query])

  // Debounced geocoding search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const matchesSaved = savedOptions.some(o =>
      o.label.toLowerCase() === query.toLowerCase()
    )
    if (matchesSaved || query.length < 2 || !isOpen) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
        )
        const data = await res.json()
        const searchResults = (data.results || []).map(r => ({
          type: 'search',
          lat: r.latitude,
          lon: r.longitude,
          label: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}`,
          country: r.country,
          country_code: r.country_code?.toUpperCase() || 'US'
        }))
        setResults(searchResults)
      } catch {
        setResults([])
      }
      setIsSearching(false)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, savedOptions, isOpen])

  const handleSelect = (opt) => {
    onChange(opt)
    setQuery(opt.label)
    setIsOpen(false)
    setResults([])
  }

  const handleClear = () => {
    onChange(null)
    setQuery('')
    setResults([])
  }

  const allOptions = [
    ...filteredSaved,
    ...results.filter(r =>
      !filteredSaved.some(s => s.label.toLowerCase() === r.label.toLowerCase())
    )
  ]

  return (
    <div className="location-combo" ref={wrapperRef}>
      <div className="combo-input-wrap">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            if (e.target.value === '') onChange(null)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="form-input"
        />
        {query && (
          <button
            type="button"
            className="combo-clear"
            onClick={handleClear}
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (allOptions.length > 0 || isSearching) && (
        <div className="combo-dropdown">
          {isSearching && (
            <div className="combo-loading">{t('buttons.searching')}</div>
          )}

          {allOptions.map((opt, i) => (
            <button
              key={`${opt.type}-${i}`}
              type="button"
              className="combo-option"
              onClick={() => handleSelect(opt)}
            >
              <span className="combo-option-icon">
                {opt.type === 'saved' ? <LocationIcon /> : <SearchIcon />}
              </span>
              <span className="combo-option-label">
                {opt.label}
                {opt.country && opt.type === 'search' && (
                  <span className="combo-option-country"> · {opt.country}</span>
                )}
              </span>
              <span className={`combo-option-badge ${opt.type}`}>
                {opt.type === 'saved'
                  ? (opt.isHome ? t('schedule.home') : '★')
                  : '⌕'}
              </span>
            </button>
          ))}

          {allOptions.length === 0 && !isSearching && query.length >= 2 && (
            <div className="combo-empty">{t('toasts.placeNotFound')}</div>
          )}
        </div>
      )}
    </div>
  )
}

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
  // ─── Parse initial question to prefill (if provided and no initial) ─
  const parsed = useMemo(() => {
    if (initial) return null
    if (!initial?.question && !arguments?.[0]?.prefillQuestion) return null
    return null
  }, [initial])

  // ─── State ─────────────────────────────────────────────────────────
  const [question, setQuestion] = useState(initial?.question || '')

  // Intents
  const [intents, setIntents] = useState(
    initial?.intents || ['route', 'traffic', 'weather']
  )

  // Locations
  const [toLocation, setToLocation] = useState(
    initial?.location ? {
      lat: initial.location.lat,
      lon: initial.location.lon,
      label: initial.location.label
    } : null
  )
  const [fromLocation, setFromLocation] = useState(
    initial?.fromLocation ? {
      lat: initial.fromLocation.lat,
      lon: initial.fromLocation.lon,
      label: initial.fromLocation.label
    } : null
  )
  const [extraLocations, setExtraLocations] = useState(
    initial?.extraLocations || []
  )

  // Date/time
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  // Config
  const [fireWindow, setFireWindow] = useState(initial?.fireWindow || 30)
  const [recurrenceMode, setRecurrenceMode] = useState(
    initial?.recurrence?.mode || 'once'
  )
  const [recurrenceDays, setRecurrenceDays] = useState(
    initial?.recurrence?.daysOfWeek || []
  )
  const [recurrenceUntil, setRecurrenceUntil] = useState('')
  const [askNowToo, setAskNowToo] = useState(initial?.askNowToo || false)

  // Meta
  const [error, setError] = useState('')
  const [relativeWordMap, setRelativeWordMap] = useState(
    initial?.relativeWordMap || {}
  )
  const [isDaySnapshot, setIsDaySnapshot] = useState(
    initial?.isDaySnapshot || false
  )
  const [resolvedQuestion, setResolvedQuestion] = useState(
    initial?.resolvedQuestion || null
  )

  // ─── Conditional flags ──────────────────────────────────────────────
  const showDestination = needsDestination(intents)
  const showOrigin = needsOrigin(intents)
  const showMulti = intents.length > 0 && !showOrigin // allow multi when no route

  // ─── Prefill date/time from initial ─────────────────────────────────
  useEffect(() => {
    if (initial?.targetTime) {
      const d = new Date(initial.targetTime)
      setDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
      setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    } else {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      d.setHours(9, 0, 0, 0)
      setDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
      setTime('09:00')
    }
  }, [initial])

  // ─── Prefill from parser when prefilledData is passed via initial ──
  useEffect(() => {
    if (!initial?.parserPrefill) return
    const p = initial.parserPrefill

    if (p.question) setQuestion(p.question)
    if (p.suggestedIntents?.length > 0) setIntents(p.suggestedIntents)

    if (p.matchedLocation) setToLocation(p.matchedLocation)
    else if (p.toHint) setToLocation({ lat: null, lon: null, label: p.toHint, needsGeocode: true })

    if (p.matchedFrom) setFromLocation(p.matchedFrom)
    else if (p.fromHint) setFromLocation({ lat: null, lon: null, label: p.fromHint, needsGeocode: true })

    if (p.relativeWordMap) setRelativeWordMap(p.relativeWordMap)
    if (typeof p.isDaySnapshot === 'boolean') setIsDaySnapshot(p.isDaySnapshot)
    if (p.question && p.relativeWordMap && Object.keys(p.relativeWordMap).length > 0) {
      let rq = p.question
      for (const [from, to] of Object.entries(p.relativeWordMap)) {
        rq = rq.replace(new RegExp(`\\b${from}\\b`, 'gi'), to)
      }
      setResolvedQuestion(rq)
    }

    if (p.recurrence && p.recurrence.mode && p.recurrence.mode !== 'once') {
      setRecurrenceMode(p.recurrence.mode)
      if (p.recurrence.daysOfWeek?.length > 0) setRecurrenceDays(p.recurrence.daysOfWeek)
    }

    if (p.targetTime) {
      const d = new Date(p.targetTime)
      setDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
      setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    }
  }, [initial])

  // ─── Toggle intent ──────────────────────────────────────────────────
  const toggleIntent = (id) => {
    setIntents(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // ─── Toggle recurrence day ──────────────────────────────────────────
  const toggleRecurrenceDay = (day) => {
    setRecurrenceDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  // ─── Add extra location ─────────────────────────────────────────────
  const addExtraLocation = () => {
    setExtraLocations(prev => [...prev, null])
  }

  const updateExtraLocation = (index, loc) => {
    setExtraLocations(prev => {
      const copy = [...prev]
      copy[index] = loc
      return copy
    })
  }

  const removeExtraLocation = (index) => {
    setExtraLocations(prev => prev.filter((_, i) => i !== index))
  }

  // ─── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = () => {
    setError('')

    if (!question.trim()) return setError(t('schedule.errQuestion'))
    if (intents.length === 0) return setError(t('schedule.errPills'))

    // Destination only required if a pill needs it
    if (showDestination) {
      if (!toLocation || (!toLocation.lat && !toLocation.needsGeocode)) {
        return setError(t('schedule.errDestination'))
      }
    }

    // Origin only required if route pill is on
    if (showOrigin) {
      if (!fromLocation || (!fromLocation.lat && !fromLocation.needsGeocode)) {
        return setError(t('schedule.errFrom'))
      }
    }

    if (!date || !time) return setError(t('schedule.errDateTime'))

    const dt = new Date(`${date}T${time}`)
    if (isNaN(dt.getTime())) return setError(t('schedule.errInvalidDateTime'))
    if (dt.getTime() < Date.now()) return setError(t('schedule.errFutureTime'))

    // Multi location required if user added slots
    if (showMulti && extraLocations.some(l => !l || !l.lat)) {
      // Silently filter out empty ones — only submit filled ones
    }

    // Build final payload
    const cleanExtras = extraLocations.filter(l => l && l.lat && l.lon)

    // Fallback for destination when pill doesn't need it
    const finalDest = showDestination
      ? toLocation
      : (homeLocation ? {
          lat: homeLocation.lat,
          lon: homeLocation.lon,
          label: homeLocation.label || homeLocation.name
        } : null)

    if (!finalDest && !homeLocation && savedLocations.length > 0) {
      // Fallback to first saved location
      const first = savedLocations[0]
      onSubmit({
        question,
        resolvedQuestion,
        relativeWordMap,
        isDaySnapshot,
        locationMode: showOrigin ? 'route' : (cleanExtras.length > 0 ? 'multi' : 'single'),
        location: { lat: first.lat, lon: first.lon, label: first.label || first.name },
        fromLocation: showOrigin ? fromLocation : null,
        extraLocations: cleanExtras,
        checkWaypoints: showOrigin,
        targetTime: dt.getTime(),
        intents,
        fireWindow,
        recurrence: {
          mode: recurrenceMode,
          daysOfWeek: recurrenceDays,
          until: recurrenceUntil ? new Date(recurrenceUntil).getTime() : null
        },
        askNowToo
      })
      return
    }

    if (!finalDest) {
      return setError(t('schedule.errNoHomeSet'))
    }

    onSubmit({
      question,
      resolvedQuestion,
      relativeWordMap,
      isDaySnapshot,
      locationMode: showOrigin ? 'route' : (cleanExtras.length > 0 ? 'multi' : 'single'),
      location: finalDest,
      fromLocation: showOrigin ? fromLocation : null,
      extraLocations: cleanExtras,
      checkWaypoints: showOrigin,
      targetTime: dt.getTime(),
      intents,
      fireWindow,
      recurrence: {
        mode: recurrenceMode,
        daysOfWeek: recurrenceDays,
        until: recurrenceUntil ? new Date(recurrenceUntil).getTime() : null
      },
      askNowToo
    })
  }

  // ─── Recurrence — days-of-week picker shows for custom ──────────────
  const showDayPicker = recurrenceMode === 'custom'
  const showUntilDate = recurrenceMode !== 'once'

  // ─── Question hint banner ───────────────────────────────────────────
  const showDaySnapshotHint =
    isDaySnapshot &&
    Object.keys(relativeWordMap).length > 0

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
        {showDaySnapshotHint && (
          <div className="form-hint">
            ✨ {t('schedule.daySnapshotHint')}
          </div>
        )}
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

      {/* Destination (conditional) */}
      {showDestination && (
        <div className="form-field">
          <label>{t('schedule.destination')}</label>
          <LocationCombo
            value={toLocation}
            onChange={setToLocation}
            savedLocations={savedLocations}
            homeLocation={homeLocation}
            placeholder={t('schedule.selectDestination')}
            t={t}
          />
        </div>
      )}

      {/* Origin (only route) */}
      {showOrigin && (
        <div className="form-field">
          <label>{t('schedule.from')}</label>
          <LocationCombo
            value={fromLocation}
            onChange={setFromLocation}
            savedLocations={savedLocations}
            homeLocation={homeLocation}
            placeholder={t('schedule.from')}
            t={t}
          />
        </div>
      )}

      {/* Extra locations (multi mode) */}
      {showMulti && !showOrigin && (
        <div className="form-field">
          <label>{t('schedule.extraLocations')}</label>
          {extraLocations.map((loc, i) => (
            <div key={i} className="extra-location-row">
              <LocationCombo
                value={loc}
                onChange={(newLoc) => updateExtraLocation(i, newLoc)}
                savedLocations={savedLocations}
                homeLocation={homeLocation}
                placeholder={t('schedule.selectDestination')}
                t={t}
              />
              <button
                type="button"
                className="icon-btn danger"
                onClick={() => removeExtraLocation(i)}
                title={t('buttons.delete')}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="add-location-btn"
            onClick={addExtraLocation}
          >
            <PlusIcon /> {t('schedule.addAnother')}
          </button>
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

      {/* Recurrence */}
      <div className="form-field">
        <label>{t('schedule.recurrence')}</label>
        <div className="recurrence-options">
          {RECURRENCE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`rec-btn ${recurrenceMode === opt.value ? 'active' : ''}`}
              onClick={() => setRecurrenceMode(opt.value)}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>

        {showDayPicker && (
          <div className="recurrence-days">
            {DAYS_OF_WEEK.map(day => (
              <button
                key={day.value}
                type="button"
                className={`day-chip ${recurrenceDays.includes(day.value) ? 'active' : ''}`}
                onClick={() => toggleRecurrenceDay(day.value)}
              >
                {t(day.labelKey)}
              </button>
            ))}
          </div>
        )}

        {showUntilDate && (
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11 }}>{t('schedule.until')}</label>
            <input
              type="date"
              value={recurrenceUntil}
              onChange={(e) => setRecurrenceUntil(e.target.value)}
              className="form-input"
            />
          </div>
        )}
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

      {/* Ask now too */}
      <div className="form-field">
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={askNowToo}
            onChange={(e) => setAskNowToo(e.target.checked)}
          />
          <span>{t('schedule.askNowToo')}</span>
        </label>
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
  const isRecurring = schedule.recurrence && schedule.recurrence.mode !== 'once'

  return (
    <div className="schedule-card">
      <div className="schedule-card-header">
        <div className="schedule-card-loc">
          <LocationIcon />
          {schedule.location?.label || t('weather.unknown')}
          {isRecurring && (
            <span className="recur-badge">
              ⟳ {t(`schedule.rec${schedule.recurrence.mode.charAt(0).toUpperCase() + schedule.recurrence.mode.slice(1)}`)}
            </span>
          )}
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
  const [view, setView] = useState('list')
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [viewingSchedule, setViewingSchedule] = useState(null)
  const [tab, setTab] = useState('pending')

  const refresh = () => setSchedules(getSchedules())

  useEffect(() => { refresh() }, [])

  // ─── Parser prefill if prefilledData is just a raw question string ──
  const parserPrefill = useMemo(() => {
    if (!prefilledData) return null
    if (typeof prefilledData === 'string') {
      return parseScheduleQuestion(prefilledData, savedLocations, homeLocation)
    }
    if (prefilledData.question && !prefilledData.parserPrefill) {
      return {
        ...parseScheduleQuestion(prefilledData.question, savedLocations, homeLocation),
        ...prefilledData
      }
    }
    return prefilledData
  }, [prefilledData, savedLocations, homeLocation])

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
    const formInitial = view === 'edit'
      ? editingSchedule
      : (parserPrefill ? { parserPrefill } : null)

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
            initial={formInitial}
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
              {viewingSchedule.result?.fireQuestion && (
                <div className="result-question">
                  "{viewingSchedule.result.fireQuestion}"
                </div>
              )}
            </div>
            <div className="result-content">
              {viewingSchedule.result?.content || t('schedule.noResult')}
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
      <div className="panel-header">
        <button className="icon-btn" onClick={onClose}>
          <BackIcon />
        </button>
        <div className="panel-title">{t('schedule.title')}</div>
        <button className="icon-btn" onClick={() => setView('new')} title={t('schedule.newSchedule')}>
          <PlusIcon />
        </button>
      </div>

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

  .icon-btn.danger:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
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

  .recur-badge {
    font-size: 10px;
    padding: 2px 6px;
    background: rgba(139, 92, 246, 0.15);
    color: #c4b5fd;
    border-radius: 6px;
    font-weight: 600;
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

  .form-hint {
    font-size: 11px;
    color: var(--accent);
    margin-top: 6px;
    padding: 6px 10px;
    background: rgba(56, 189, 248, 0.08);
    border-radius: 8px;
    border-left: 2px solid var(--accent);
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

  /* Location Combo */
  .location-combo {
    position: relative;
  }

  .combo-input-wrap {
    position: relative;
  }

  .combo-input-wrap .form-input {
    padding-right: 32px;
  }

  .combo-clear {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 18px;
    cursor: pointer;
    padding: 0 6px;
    border-radius: 6px;
    line-height: 1;
  }

  .combo-clear:hover {
    color: var(--text);
    background: rgba(255, 255, 255, 0.08);
  }

  .combo-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    max-height: 240px;
    overflow-y: auto;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 6px;
    z-index: 100;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  }

  .combo-option {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border-radius: 8px;
    background: transparent;
    border: none;
    color: var(--text);
    font-size: 13px;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition: 0.15s;
  }

  .combo-option:hover {
    background: rgba(56, 189, 248, 0.1);
  }

  .combo-option-icon {
    display: flex;
    align-items: center;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .combo-option-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .combo-option-country {
    color: var(--text-muted);
    font-size: 11px;
  }

  .combo-option-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 6px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .combo-option-badge.saved {
    background: rgba(56, 189, 248, 0.15);
    color: #7dd3fc;
  }

  .combo-option-badge.search {
    background: rgba(139, 92, 246, 0.15);
    color: #c4b5fd;
  }

  .combo-loading,
  .combo-empty {
    padding: 12px;
    font-size: 12px;
    color: var(--text-muted);
    text-align: center;
  }

  /* Extra locations */
  .extra-location-row {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 8px;
  }

  .extra-location-row .location-combo {
    flex: 1;
  }

  .add-location-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    background: rgba(56, 189, 248, 0.08);
    color: var(--accent);
    border: 1px dashed rgba(56, 189, 248, 0.3);
    cursor: pointer;
    font-family: inherit;
    transition: 0.2s;
    margin-top: 4px;
  }

  .add-location-btn:hover {
    background: rgba(56, 189, 248, 0.15);
    border-style: solid;
  }

  /* Recurrence */
  .recurrence-options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .rec-btn {
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

  .rec-btn.active {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.4);
    color: #c4b5fd;
  }

  .rec-btn:hover:not(.active) {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text);
  }

  .recurrence-days {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }

  .day-chip {
    padding: 5px 10px;
    border-radius: 14px;
    font-size: 10px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--text-muted);
    cursor: pointer;
    font-family: inherit;
    transition: 0.2s;
    min-width: 40px;
  }

  .day-chip.active {
    background: rgba(56, 189, 248, 0.15);
    border-color: rgba(56, 189, 248, 0.4);
    color: #7dd3fc;
  }

  /* Toggle row */
  .toggle-row {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13px;
    color: var(--text);
    text-transform: none;
    letter-spacing: 0;
    font-weight: 500;
  }

  .toggle-row input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--accent);
    cursor: pointer;
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

  .result-question {
    font-style: italic;
    color: var(--text);
    font-size: 12px;
    margin-top: 4px;
  }

  .result-content {
    font-size: 13px;
    line-height: 1.6;
    color: var(--text);
    white-space: pre-wrap;
    word-break: break-word;
  }
`
