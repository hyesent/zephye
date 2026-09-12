import { useTranslation } from './utils/translation'

export default function LiveIndicator({ location, uiLanguage = 'en' }) {
  const { t } = useTranslation(uiLanguage)
  const now = new Date()
  const hour = now.getHours()

  let watchSince = '6:00 AM'

  if (hour >= 12 && hour < 18) watchSince = '12:00 PM'
  if (hour >= 18) watchSince = '6:00 PM'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      <div
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: '#ef4444',
          boxShadow: '0 0 15px #ef4444'
        }}
      />

      <div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#fff'
          }}
        >
          {t('labels.live')}
        </div>

        <div
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,.65)'
          }}
        >
          {t('labels.watching')} {location?.name || 'your area'} {t('labels.since')} {watchSince}
        </div>
      </div>
    </div>
  )
}
