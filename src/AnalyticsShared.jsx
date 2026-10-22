import { useEffect, useMemo, useState } from 'react'
import './analytics-graph-axis.css'

export const number = (value, digits = 0) =>
  value == null || !Number.isFinite(Number(value)) ? '—' : Number(value).toFixed(digits)

export function Icon({ name = 'arrow', size = 17 }) {
  const paths = {
    back: <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    wave: <><path d="M2 8c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/><path d="M2 14c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 14 4-4 4 3 5-7"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.chart}</svg>
}

export function AnalyticsHeader({ type, location, onBack, onLocationClick }) {
  const marine = type === 'marine'
  return <header className="za-header">
    <button className="za-location-chip" onClick={onLocationClick} title="Change location">
      <Icon name="pin" size={16}/>
      <span><small>LOCATION</small><strong>{location?.name || 'Current location'}</strong></span>
      <span className="za-chevron">⌄</span>
    </button>
    <button className="za-icon-button" onClick={onBack} aria-label="Close analytics"><Icon name="close" size={19}/></button>
    <div className="za-page-title">
      <div className="za-eyebrow">{marine ? 'COASTAL CONDITIONS' : 'LOCAL CONDITIONS'}</div>
      <h1>{marine ? 'Marine intelligence' : 'Environment'}</h1>
      <p>{marine ? 'Understand the sea before you head out.' : 'A clear picture of the air, sky and conditions around you.'}</p>
    </div>
  </header>
}

export function MetricCarousel({ title, subtitle, metrics, accent = 'blue', showAll = false }) {
  const [page, setPage] = useState(0)
  const pageCount = showAll ? 1 : Math.max(1, Math.ceil(metrics.length / 4))
  useEffect(() => { setPage(0) }, [title, metrics.length])
  useEffect(() => {
    if (pageCount <= 1) return
    const id = window.setInterval(() => setPage(current => (current + 1) % pageCount), 10000)
    return () => window.clearInterval(id)
  }, [pageCount])
  const visible = showAll ? metrics : metrics.slice(page * 4, page * 4 + 4)
  return <section className={`za-group za-${accent}`}>
    <div className="za-group-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><span className="za-group-count">{String(metrics.length).padStart(2,'0')} READINGS</span></div>
    <div className="za-metric-grid">
      {visible.map((metric, index) => <article className="za-metric" key={`${metric.label}-${page}-${index}`}>
        <div className="za-metric-label">{metric.label}</div>
        <div className="za-metric-value">{metric.value ?? '—'}<span>{metric.unit || ''}</span></div>
        {metric.note && <div className="za-metric-note">{metric.note}</div>}
      </article>)}
    </div>
    {!showAll && <div className="za-carousel-footer"><span>{Math.min(page * 4 + 1, metrics.length)}–{Math.min(page * 4 + visible.length, metrics.length)} of {metrics.length}</span><div className="za-dots">{Array.from({length: pageCount}, (_, i) => <button key={i} className={i === page ? 'active' : ''} onClick={() => setPage(i)} aria-label={`Show readings ${i + 1}`}/>)}</div></div>}
  </section>
}

export function TrendChart({ title, subtitle, values = [], labels = [], unit = '', kind = 'line', accent = 'blue' }) {
  const [hovered, setHovered] = useState(null)
  const clean = values.map(v => v == null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v))
  const finite = clean.filter(v => v != null)
  const rawMin = finite.length ? Math.min(...finite) : 0
  const rawMax = finite.length ? Math.max(...finite) : 1
  const pad = rawMax === rawMin ? Math.max(Math.abs(rawMax) * .08, 1) : (rawMax - rawMin) * .12
  const min = rawMin - pad, max = rawMax + pad, range = max - min || 1
  const left = 38, right = 306, top = 12, bottom = 94
  // Keep data geometry inside the plot instead of drawing strokes through the y-axis.
  const plotLeft = left + 3, plotRight = right - 3
  const xFor = i => plotLeft + i * ((plotRight-plotLeft) / Math.max(1, clean.length-1))
  const yFor = v => bottom - ((v-min)/range)*(bottom-top)
  const points = clean.map((v,i) => v == null ? null : ({ x:xFor(i), y:yFor(v), value:v, index:i }))
  const segments = []
  let segment=[]
  points.forEach(p => { if (p) segment.push(p); else if(segment.length){segments.push(segment);segment=[]} })
  if(segment.length) segments.push(segment)
  const path = segment => segment.map((p,i) => `${i?'L':'M'}${p.x},${p.y}`).join(' ')
  const yTicks = Array.from({length:5},(_,i)=>max-(range*i/4))
  const active = hovered != null ? points[hovered] : null
  const last = [...points].reverse().find(Boolean)
  const labelIndexes = Array.from(new Set([0, Math.round((clean.length-1)/4), Math.round((clean.length-1)/2), Math.round(3*(clean.length-1)/4), Math.max(0,clean.length-1)]))
  return <article className={`za-chart za-chart-${accent}`}>
    <div className="za-chart-head"><div><h3>{title}</h3><p>{subtitle}</p></div><span>{last ? `${number(last.value, 1)}${unit}` : '—'}</span></div>
    <div className="za-chart-plot">
      <svg className="za-chart-svg" viewBox="0 0 320 122" preserveAspectRatio="none" role="img" aria-label={`${title} interactive trend with vertical axis`} onMouseLeave={()=>setHovered(null)}>
        {yTicks.map((tick,i)=><g key={i}><line x1={left} x2={right} y1={top+i*((bottom-top)/4)} y2={top+i*((bottom-top)/4)} className="za-gridline"/><text x={left-5} y={top+i*((bottom-top)/4)+3} textAnchor="end" className="za-axis-label">{Number(tick.toFixed(Math.abs(range)<1?2:1))}</text></g>)}
        <line x1={left} x2={left} y1={top} y2={bottom} className="za-axis-line"/><line x1={left} x2={right} y1={bottom} y2={bottom} className="za-axis-line"/>
        {kind==='bar' ? points.map((p,i)=>p && <rect key={i} x={p.x-Math.max(1,Math.min(5,110/Math.max(1,clean.length)))} y={Math.min(p.y,bottom)} width={Math.max(2,Math.min(10,220/Math.max(1,clean.length)))} height={Math.max(1,bottom-p.y)} rx="2" className="za-bar" onMouseEnter={()=>setHovered(i)} onFocus={()=>setHovered(i)} tabIndex="0"><title>{`${labels[i] || `Point ${i+1}`}: ${p.value}${unit}`}</title></rect>) : <>
          {segments.map((seg,i)=><path key={i} d={path(seg)} className="za-chart-line"/>)}
          {points.map((p,i)=>p && <circle key={i} cx={p.x} cy={p.y} r={hovered===i?4:2.4} className="za-chart-point" tabIndex="0" role="img" aria-label={`${labels[i] || `Point ${i+1}`}: ${p.value}${unit}`} onMouseEnter={()=>setHovered(i)} onFocus={()=>setHovered(i)} onBlur={()=>setHovered(null)}><title>{`${labels[i] || `Point ${i+1}`}: ${p.value}${unit}`}</title></circle>)}
        </>}
        {active && <g><line x1={active.x} x2={active.x} y1={top} y2={bottom} className="za-crosshair"/><circle cx={active.x} cy={active.y} r="4" className="za-chart-point active"/></g>}
      </svg>
      {active && <div className="za-chart-tooltip">{labels[active.index] || `Point ${active.index+1}`} · <strong>{number(active.value,1)}{unit}</strong></div>}
    </div>
    <div className="za-chart-labels">{labelIndexes.filter(i=>labels[i]!=null).map(i=><span key={`${labels[i]}-${i}`}>{labels[i]}</span>)}</div>
  </article>
}
export function SectionTitle({ title, description, count }) {
  return <div className="za-section-title"><div><h2>{title}</h2><p>{description}</p></div>{count && <span>{count}</span>}</div>
}

export function WeatherGraphs({ weather, aqi }) {
  const daily = weather?.daily || {}
  const hourly = weather?.hourly || {}
  const days = (daily.time || []).slice(0,7)
  const hourTimes = hourly.time || []
  const nearestHour = hourTimes.length ? hourTimes.reduce((best,t,i)=>Math.abs(new Date(t).getTime()-Date.now())<Math.abs(new Date(hourTimes[best]).getTime()-Date.now())?i:best,0) : 0
  const hours = hourTimes.slice(nearestHour, nearestHour+12)
  const dayLabel = days.map(d => new Date(d).toLocaleDateString(undefined,{weekday:'short'}))
  const hourLabel = hours.map(d => new Date(d).toLocaleTimeString(undefined,{hour:'numeric'}))
  const aqHourly = aqi?.hourly || {}
  const aqSeries = Array.isArray(aqHourly.us_aqi) && aqHourly.us_aqi.some(v => v != null) ? (() => { const ts=aqHourly.time||[]; const start=ts.length?ts.reduce((best,t,i)=>Math.abs(new Date(t).getTime()-Date.now())<Math.abs(new Date(ts[best]).getTime()-Date.now())?i:best,0):0; return aqHourly.us_aqi.slice(start,start+12) })() : [aqi?.us_aqi ?? null]
  const allAqTimes = aqHourly.time || []
  const aqStart = allAqTimes.length ? allAqTimes.reduce((best,t,i)=>Math.abs(new Date(t).getTime()-Date.now())<Math.abs(new Date(allAqTimes[best]).getTime()-Date.now())?i:best,0) : 0
  const aqTimes = aqSeries.length > 1 ? allAqTimes.slice(aqStart,aqStart+aqSeries.length) : []
  const aqLabels = aqTimes.length ? aqTimes.map(t => new Date(t).toLocaleTimeString(undefined,{hour:'numeric'})) : ['Now']
  const graphs = [
    ['Temperature · 7 days','Daily high temperature',daily.temperature_2m_max,dayLabel,'°C','line'],
    ['Precipitation','Daily rainfall total',daily.precipitation_sum,dayLabel,' mm','bar'],
    ['Wind','Daily maximum wind speed',daily.wind_speed_10m_max,dayLabel,' km/h','line'],
    ['Cloud & visibility','Hourly cloud cover',hourly.cloud_cover?.slice(nearestHour, nearestHour+12),hourLabel,'%','line'],
    ['UV / solar exposure','Daily maximum UV index',daily.uv_index_max,dayLabel,'','line'],
    ['Pressure','Hourly mean sea-level pressure',hourly.pressure_msl?.slice(nearestHour, nearestHour+12),hourLabel,' hPa','line'],
    ['Soil moisture','Hourly soil moisture near surface',hourly.soil_moisture_0_to_1cm?.slice(nearestHour, nearestHour+12),hourLabel,' m³/m³','line'],
    ['Air quality',aqSeries.length > 1 ? 'Hourly US AQI' : 'Current US AQI · hourly series unavailable',aqSeries,aqLabels,' AQI','line']
  ]
  return <><SectionTitle title="Trends & history" description="Interactive trends from the available forecast feeds. Hover or focus points to inspect readings." count="8 CHARTS"/><div className="za-chart-grid">{graphs.map(([title,subtitle,raw,labels,unit,kind],i)=><TrendChart key={title} title={title} subtitle={subtitle} values={Array.isArray(raw) ? raw.slice(0,12) : []} labels={labels || []} unit={unit} kind={kind} accent={i%2?'violet':'blue'}/>)}</div><p className="za-disclaimer">Charts show only values returned by the selected providers. Missing river-discharge, water-quality, tide and coastal-hazard observations are not inferred from unrelated weather measurements.</p></>
}
