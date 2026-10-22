import { useEffect, useMemo, useState } from 'react'
import { AnalyticsHeader, MetricCarousel, WeatherGraphs, number } from './AnalyticsShared.jsx'

const val = (value, digits = 0) => value == null || !Number.isFinite(Number(value)) ? '—' : number(value, digits)

export default function EnvironmentPage({ weather, aqi, location, onBack, onLocationClick }) {
  const [riverDischarge, setRiverDischarge] = useState(null)
  useEffect(() => {
    let cancelled = false
    setRiverDischarge(null)
    if (location?.lat == null || location?.lon == null) return () => { cancelled = true }
    fetch(`https://flood-api.open-meteo.com/v1/flood?${new URLSearchParams({ latitude: String(location.lat), longitude: String(location.lon), daily: 'river_discharge', forecast_days: '7', timezone: 'auto' })}`)
      .then(r => r.ok ? r.json() : null).then(data => { if (!cancelled) { const values = data?.daily?.river_discharge || []; const value = values.find(v => v != null); setRiverDischarge(value == null ? null : value) } })
      .catch(() => { if (!cancelled) setRiverDischarge(null) })
    return () => { cancelled = true }
  }, [location?.lat, location?.lon])
  const current = weather?.current || {}
  const hourly = weather?.hourly || {}
  const daily = weather?.daily || {}
  const groups = useMemo(() => {
    const h = (key, i = 0) => hourly[key]?.[i]
    const d = (key, i = 0) => daily[key]?.[i]
    const sunrise = d('sunrise')
    const sunset = d('sunset')
    const time = value => value ? new Date(value).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'}) : '—'
    return [
      { title:'Atmosphere', subtitle:'Air quality, pressure and moisture', metrics:[
        ['US Air Quality Index',val(aqi?.us_aqi),'AQI'],['PM2.5',val(aqi?.pm2_5,1),'µg/m³'],['Relative humidity',val(current.relative_humidity_2m),'%'],['Dew point',val(current.dew_point_2m),'°C'],['Sea-level pressure',val(current.pressure_msl),'hPa'],['Visibility',val(current.visibility == null ? null : current.visibility/1000,1),'km']
      ]},
      { title:'Sky', subtitle:'Cloud, rain and changing conditions', metrics:[
        ['Cloud cover',val(current.cloud_cover),'%'],['Weather code',current.weather_code ?? '—',''],['Rain probability',val(h('precipitation_probability')),'%'],['Precipitation',val(h('precipitation'),1),'mm'],['Rain today',val(d('precipitation_sum'),1),'mm'],['Thunder probability',val(h('precipitation_probability')), '%'],['Snowfall',val(h('snowfall'),1),'cm']
      ]},
      { title:'Wind', subtitle:'Wind speed, direction and gusts', metrics:[
        ['Wind speed',val(current.wind_speed_10m,1),'km/h'],['Wind gusts',val(current.wind_gusts_10m,1),'km/h'],['Wind direction',val(current.wind_direction_10m),'°'],['Wind at 80 m',val(h('wind_speed_80m'),1),'km/h'],['Max daily wind',val(d('wind_speed_10m_max'),1),'km/h']
      ]},
      { title:'Sun / Solar', subtitle:'Daylight, UV and solar exposure', metrics:[
        ['UV index now',val(h('uv_index'))],['Maximum UV',val(d('uv_index_max'))],['Sunshine duration',val(d('sunshine_duration') == null ? null : d('sunshine_duration')/3600,1),'h'],['Solar radiation',val(h('shortwave_radiation')),'W/m²'],['Sunrise / sunset',`${time(sunrise)} / ${time(sunset)}`,'']
      ]},
      { title:'Water / Flood', subtitle:'Precipitation context, not a flood warning', metrics:[
        ['Rainfall today',val(d('precipitation_sum'),1),'mm'],['Rainfall next hour',val(h('precipitation'),1),'mm'],['Soil moisture',val(h('soil_moisture_0_to_1cm'),2),'m³/m³'],['River discharge',val(riverDischarge,1),riverDischarge == null ? 'unavailable from provider' : 'm³/s']
      ]},
      { title:'Temperature / Comfort', subtitle:'Thermal conditions and apparent temperature', metrics:[
        ['Temperature',val(current.temperature_2m,1),'°C'],['Feels like',val(current.apparent_temperature,1),'°C'],['Daily high',val(d('temperature_2m_max'),1),'°C']
      ]}
    ]
  }, [weather, aqi, hourly, daily, current, riverDischarge])
  return <main className="za-page">
    <AnalyticsHeader type="environment" location={location} onBack={onBack} onLocationClick={onLocationClick}/>
    <div className="za-intro-strip"><span className="za-status-dot"/><span>Live weather context</span><span className="za-intro-separator">·</span><span>Readings are provider observations or forecasts, not safety guarantees.</span></div>
    <div className="za-groups">{groups.map((group,i)=><MetricCarousel key={group.title} title={group.title} subtitle={group.subtitle} accent={i%2?'violet':'blue'} metrics={group.metrics.map(([label,value,unit])=>({label,value,unit}))}/>)}</div>
    <WeatherGraphs weather={weather} aqi={aqi}/>
  </main>
}
