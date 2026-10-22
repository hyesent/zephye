import { useTranslation } from './utils/translation'

function MetricItem({ label, value, color }) {
  return (
    <div
      style={{
        padding: '12px',
        borderRadius: '14px',
        background: 'rgba(255,255,255,.05)',
        border: '1px solid rgba(255,255,255,.08)'
      }}
    >
      <div
        style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,.6)',
          marginBottom: '4px'
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 700,
          fontSize: '14px',
          color: color || '#fff'
        }}
      >
        {value}
      </div>
    </div>
  )
}

function Group({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: 'rgba(255,255,255,.8)',
          marginBottom: '10px'
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          gap: '10px'
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default function MetricGroup({
  weather,
  todayStats,
  aqi,
  getAqiLevel,
  uiLanguage = 'en'
}) {
  const { t } = useTranslation(uiLanguage)

  return (
    <>
      <Group title={t('labels.atmosphere')}>
        <MetricItem
          label={t('labels.aqi')}
          value={aqi?.us_aqi ?? '--'}
          color={getAqiLevel(aqi?.us_aqi).color}
        />

        <MetricItem
          label={t('labels.humidity')}
          value={`${weather?.current?.relative_humidity_2m || 0}%`}
        />

        <MetricItem
          label={t('labels.pressure')}
          value={`${Math.round(weather?.current?.pressure_msl || 0)} hPa`}
        />

        <MetricItem
          label={t('labels.visibility')}
          value={`${Math.round((weather?.current?.visibility || 10000)/1000)} km`}
        />
      </Group>

      <Group title={t('labels.sky')}>
        <MetricItem
          label={t('labels.uv')}
          value={weather?.daily?.uv_index_max?.[0] || 0}
        />

        <MetricItem
          label={t('labels.sunshine')}
          value={`${todayStats?.sunHours || 0}h`}
        />

        <MetricItem
          label={t('labels.rain')}
          value={`${todayStats?.rainHours || 0}h`}
        />

        <MetricItem
          label={t('labels.thunder')}
          value={`${todayStats?.thunderHours || 0}h`}
        />
      </Group>

      <Group title={t('labels.windLabel')}>
        <MetricItem
          label={t('labels.wind')}
          value={`${Math.round(weather?.current?.wind_speed_10m || 0)} km/h`}
        />

        <MetricItem
          label={t('labels.windGust')}
          value={`${Math.round(todayStats?.windGust || 0)} km/h`}
        />

        <MetricItem
          label={t('labels.feelsLike')}
          value={`${Math.round(todayStats?.feelsLike || 0)}°`}
        />
      </Group>

      <Group title={t('labels.sun')}>
        <MetricItem
          label={t('labels.sunrise')}
          value={
            weather?.daily?.sunrise?.[0]
              ? new Date(weather.daily.sunrise[0]).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '--'
          }
        />

        <MetricItem
          label={t('labels.sunset')}
          value={
            weather?.daily?.sunset?.[0]
              ? new Date(weather.daily.sunset[0]).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '--'
          }
        />
      </Group>
    </>
  )
}
