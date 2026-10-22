import { useEffect, useMemo, useState } from 'react'
import { AnalyticsHeader, MetricCarousel, TrendChart, SectionTitle, number } from './AnalyticsShared.jsx'
import { fetchMarineWithFallback } from './marineData.js'
import { fetchWeather } from './weatherFetcher.js'
import MarinePresetPicker from './MarinePresetPicker.jsx'

const fmt = (v, digits=1) => v == null || !Number.isFinite(Number(v)) ? '—' : number(v,digits)

export default function MarinePage({ location, onBack, onLocationClick, onSelectMarineLocation }) {
  const [marine, setMarine] = useState(null)
  const [coastalWeather, setCoastalWeather] = useState(null)
  const [status, setStatus] = useState('loading')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    if (location?.lat == null || location?.lon == null) { setStatus('unavailable'); return }
    const controller = new AbortController()
    fetchWeather(Number(location.lat), Number(location.lon)).then(data => setCoastalWeather(data)).catch(() => setCoastalWeather(null))
    setStatus('loading')
    fetchMarineWithFallback(location.lat, location.lon, { signal: controller.signal })
      .then(data => { setMarine(data); try { localStorage.setItem('zephye_marine_cache', JSON.stringify(data.hourly ? {hourly:data.hourly, daily:data.daily, timezone:data.timezone, _zephyeGrid:data._zephyeGrid} : data)) } catch {} setStatus('ready') })
      .catch(error => { if (error.name !== 'AbortError') { setMarine(null); setStatus('unavailable') } })
    return () => controller.abort()
  }, [location?.lat, location?.lon, retry])

  const index = useMemo(() => {
    const times = marine?.hourly?.time || []
    if (!times.length) return 0
    const now = Date.now()
    let best = 0, gap = Infinity
    times.forEach((time,i) => { const diff=Math.abs(new Date(time).getTime()-now); if(diff<gap){gap=diff;best=i} })
    return best
  }, [marine])
  const current = marine?.hourly || {}
  const coastCurrent = coastalWeather?.current || {}
  const tideValues = (current.sea_level_height_msl || []).slice(index, index + 24).filter(v => v != null && Number.isFinite(Number(v)))
  const tideRange = tideValues.length >= 2 ? Math.max(...tideValues.map(Number)) - Math.min(...tideValues.map(Number)) : null
  const at = key => current[key]?.[index]
  const values = key => (current[key] || []).slice(0,24)
  const labels = (current.time || []).slice(0,24).map(t=>new Date(t).toLocaleTimeString(undefined,{hour:'numeric'}))
  const groups = useMemo(() => {
    const read = (label,key,unit='',digits=1) => ({label,value:fmt(at(key),digits),unit})
    return [
      {title:'Waves',subtitle:'Significant wave conditions',metrics:[
        read('Significant wave height','wave_height','m'),read('Wave direction','wave_direction','°',0),read('Wave period','wave_period','s'),read('Peak wave period','wave_peak_period','s'),
        read('Wind-wave height','wind_wave_height','m'),read('Wind-wave direction','wind_wave_direction','°',0),read('Wind-wave period','wind_wave_period','s'),read('Wind-wave peak period','wind_wave_peak_period','s')
      ]},
      {title:'Swell',subtitle:'Primary and secondary swell components',metrics:[
        read('Swell height','swell_wave_height','m'),read('Swell direction','swell_wave_direction','°',0),read('Swell period','swell_wave_period','s'),read('Swell peak period','swell_wave_peak_period','s'),
        read('Secondary swell height','secondary_swell_wave_height','m'),read('Secondary swell direction','secondary_swell_wave_direction','°',0),read('Secondary swell period','secondary_swell_wave_period','s'),
        read('Tertiary swell height','tertiary_swell_wave_height','m'),read('Tertiary swell direction','tertiary_swell_wave_direction','°',0),read('Tertiary swell period','tertiary_swell_wave_period','s')
      ]},
      {title:'Sea & Currents',subtitle:'Modelled sea conditions; not water-quality measurements',metrics:[
        read('Sea-surface temperature','sea_surface_temperature','°C'),read('Ocean current speed','ocean_current_velocity','m/s'),read('Current direction','ocean_current_direction','°',0),read('Sea level (MSL datum)','sea_level_height_msl','m',2),read('Pressure-related sea-level effect','invert_barometer_height','m',3)
      ]},
      {title:'Wind / Coastal Context',subtitle:'Weather forecast near the selected coordinates',metrics:[
        {label:'Wind at 10 m',value:fmt(coastCurrent.wind_speed_10m,1),unit:coastCurrent.wind_speed_10m == null ? 'unavailable' : 'km/h'},
        {label:'Wind gusts at 10 m',value:fmt(coastCurrent.wind_gusts_10m,1),unit:coastCurrent.wind_gusts_10m == null ? 'unavailable' : 'km/h'},
        {label:'Beach UV',value:fmt(coastalWeather?.hourly?.uv_index?.[index] ?? coastalWeather?.current?.uv_index,1),unit:'UV index'},
        {label:'Next 24 h sea-level range',value:fmt(tideRange,2),unit:tideRange == null ? 'insufficient sea-level series' : 'm (modelled range)'}
      ]},
      {title:'Daily Marine Outlook',subtitle:'Daily summaries returned by Open-Meteo',metrics:[
        {label:'Maximum wave height',value:fmt(marine?.daily?.wave_height_max?.[0]),unit:'m'},
        {label:'Dominant wave direction',value:fmt(marine?.daily?.wave_direction_dominant?.[0],0),unit:'°'},
        {label:'Maximum wave period',value:fmt(marine?.daily?.wave_period_max?.[0]),unit:'s'},
        {label:'Maximum wind-wave height',value:fmt(marine?.daily?.wind_wave_height_max?.[0]),unit:'m'},
        {label:'Maximum swell height',value:fmt(marine?.daily?.swell_wave_height_max?.[0]),unit:'m'},
        {label:'Dominant swell direction',value:fmt(marine?.daily?.swell_wave_direction_dominant?.[0],0),unit:'°'},
        {label:'Maximum swell period',value:fmt(marine?.daily?.swell_wave_period_max?.[0]),unit:'s'}
      ]}
    ]
  }, [marine,index,coastalWeather,coastCurrent])
  const chartData = [
    ['Wave height','Significant wave height',values('wave_height'),' m'],
    ['Wave period','Wave period',values('wave_period'),' s'],
    ['Peak wave period','Peak wave period',values('wave_peak_period'),' s'],
    ['Wind-wave peak period','Peak period of wind-generated waves',values('wind_wave_peak_period'),' s'],
    ['Swell peak period','Peak period of primary swell',values('swell_wave_peak_period'),' s'],
    ['Tertiary swell direction','Direction of tertiary swell',values('tertiary_swell_wave_direction'),'°'],
    ['Tertiary swell period','Period of tertiary swell',values('tertiary_swell_wave_period'),' s'],
    ['Wind waves','Wind-generated wave height',values('wind_wave_height'),' m'],
    ['Swell height','Primary swell height',values('swell_wave_height'),' m'],
    ['Secondary swell','Secondary swell height',values('secondary_swell_wave_height'),' m'],
    ['Sea temperature','Sea-surface temperature',values('sea_surface_temperature'),' °C'],
    ['Sea level','Sea level relative to mean sea level',values('sea_level_height_msl'),' m'],
    ['Pressure sea-level effect','Inverted-barometer contribution',values('invert_barometer_height'),' m'],
    ['Ocean current','Current speed',values('ocean_current_velocity'),' m/s'],
    ['Marine wind','Coastal weather forecast · wind speed', (coastalWeather?.hourly?.wind_speed_10m || []).slice(0,24), ' km/h'],
    ['Tertiary swell','Tertiary swell height',values('tertiary_swell_wave_height'),' m']
  ]
  return <main className="za-page">
    <AnalyticsHeader type="marine" location={location} onBack={onBack} onLocationClick={onLocationClick}/>
    <MarinePresetPicker onSelect={onSelectMarineLocation} selectedLocation={location}/>
    <div className={`za-marine-status ${status==='ready'?'ready':''}`}>
      <span className="za-status-dot"/><div><strong>{status==='loading'?'Checking marine grid…':status==='ready'?'Marine forecast loaded':'Marine readings unavailable'}</strong><p>{status==='ready' ? `${marine?._zephyeGrid?.isProxy ? `Nearby marine-grid proxy · ${marine._zephyeGrid.distanceKm} km away` : 'Selected marine grid'} · ${marine?.timezone || 'local time'} · nearest forecast hour shown` : status==='loading' ? 'Requesting wave and sea variables for this location.' : 'This point may be inland or outside the provider grid. No sea values are invented; choose a coastal preset or another location.'}</p></div>
      {status==='unavailable' && <button onClick={()=>setRetry(v=>v+1)}>Retry</button>}
    </div>
    {status==='ready' ? <>
      <div className="za-groups">{groups.map((group,i)=><MetricCarousel key={group.title} title={group.title} subtitle={group.subtitle} accent={i%2?'violet':'blue'} metrics={group.metrics} showAll/>)}</div>
      <SectionTitle title="Marine trends" description="Forecast trends for the selected marine grid cell." count="16 CHARTS"/>
      <div className="za-chart-grid">{chartData.map(([title,subtitle,series,unit],i)=><TrendChart key={title} title={title} subtitle={subtitle} values={series} labels={labels} unit={unit} kind={i===0||i===3||i===4||i===5||i===11?'bar':'line'} accent={i%2?'violet':'blue'}/>)}</div>
    </> : <div className="za-empty-state"><div className="za-empty-mark">≈</div><h2>No local marine grid yet</h2><p>Marine values are shown only when the provider returns real data. Inland coordinates and unsupported variables stay unavailable rather than being guessed.</p><button onClick={onLocationClick}>Choose a coastal location</button></div>}
    <p className="za-disclaimer">Forecast data is not a navigation product. Dedicated sea-level-anomaly, rip-current, storm-surge, water-clarity and water-quality observations are not supplied by this request; do not use these charts to determine whether swimming or boating is safe.</p>
  </main>
}
