// ============================================================================
// WEATHER GRADIENTS + SVG ART
// Day/Night aware. Weather illustration stays true, only tone shifts.
// ============================================================================

export const WEATHER_THEMES = {
  clearDay: {
    gradient: ['#FDB813', '#F5A623', '#E88D1F'],
    textColor: '#FFFFFF',
    accent: '#FFF3C4',
    svg: 'sunny',
    isNight: false
  },
  clearNight: {
    gradient: ['#0F2027', '#203A43', '#2C5364'],
    textColor: '#FFFFFF',
    accent: '#A0C4FF',
    svg: 'clearNight',
    isNight: true
  },
  partlyCloudyDay: {
    gradient: ['#4A90E2', '#357ABD', '#2C5F8D'],
    textColor: '#FFFFFF',
    accent: '#B8DCF5',
    svg: 'partlyCloudyDay',
    isNight: false
  },
  partlyCloudyNight: {
    gradient: ['#1B2735', '#090A0F', '#000000'],
    textColor: '#FFFFFF',
    accent: '#8BA8C7',
    svg: 'partlyCloudyNight',
    isNight: true
  },
  cloudyDay: {
    gradient: ['#6B7B8C', '#4A5966', '#374151'],
    textColor: '#FFFFFF',
    accent: '#B0BEC5',
    svg: 'cloudyDay',
    isNight: false
  },
  cloudyNight: {
    gradient: ['#1F2429', '#131719', '#0A0C0E'],
    textColor: '#FFFFFF',
    accent: '#7A8A94',
    svg: 'cloudyNight',
    isNight: true
  },
  rainyDay: {
    gradient: ['#3E5262', '#2C3E50', '#1F2D38'],
    textColor: '#FFFFFF',
    accent: '#7DB8E8',
    svg: 'rainyDay',
    isNight: false
  },
  rainyNight: {
    gradient: ['#0D1B26', '#08131A', '#040A0F'],
    textColor: '#FFFFFF',
    accent: '#5A8FB8',
    svg: 'rainyNight',
    isNight: true
  },
  thunderDay: {
    gradient: ['#2C2E3A', '#1E202B', '#14161F'],
    textColor: '#FFFFFF',
    accent: '#FBBF24',
    svg: 'thunderDay',
    isNight: false
  },
  thunderNight: {
    gradient: ['#0A0B14', '#050610', '#000000'],
    textColor: '#FFFFFF',
    accent: '#FCD34D',
    svg: 'thunderNight',
    isNight: true
  },
  snowDay: {
    gradient: ['#C9D6DF', '#A7BCC9', '#8DA5B8'],
    textColor: '#1A2730',
    accent: '#FFFFFF',
    svg: 'snowDay',
    isNight: false
  },
  snowNight: {
    gradient: ['#3A4A5C', '#243040', '#141C28'],
    textColor: '#FFFFFF',
    accent: '#D4E1EC',
    svg: 'snowNight',
    isNight: true
  },
  fogDay: {
    gradient: ['#B0BEC5', '#90A4AE', '#607D8B'],
    textColor: '#FFFFFF',
    accent: '#CFD8DC',
    svg: 'fogDay',
    isNight: false
  },
  fogNight: {
    gradient: ['#39424A', '#252B31', '#141719'],
    textColor: '#FFFFFF',
    accent: '#8A959D',
    svg: 'fogNight',
    isNight: true
  }
}

// ─── Determine day or night ────────────────────────────────────────────
export const isNightTime = (targetTime = new Date(), sunrise, sunset) => {
  if (sunrise && sunset) {
    const rise = new Date(sunrise)
    const set = new Date(sunset)
    return targetTime < rise || targetTime >= set
  }
  const hour = targetTime.getHours()
  return hour < 6 || hour >= 18
}

// ─── Map weather code to theme key ─────────────────────────────────────
export const getThemeKey = (weatherCode, night = false) => {
  if (weatherCode === 0 || weatherCode === 1) {
    return night ? 'clearNight' : 'clearDay'
  }
  if (weatherCode === 2) {
    return night ? 'partlyCloudyNight' : 'partlyCloudyDay'
  }
  if (weatherCode === 3) {
    return night ? 'cloudyNight' : 'cloudyDay'
  }
  if (weatherCode === 45 || weatherCode === 48) {
    return night ? 'fogNight' : 'fogDay'
  }
  if (weatherCode >= 51 && weatherCode <= 67) {
    return night ? 'rainyNight' : 'rainyDay'
  }
  if (weatherCode >= 71 && weatherCode <= 77) {
    return night ? 'snowNight' : 'snowDay'
  }
  if (weatherCode >= 80 && weatherCode <= 82) {
    return night ? 'rainyNight' : 'rainyDay'
  }
  if (weatherCode >= 85 && weatherCode <= 86) {
    return night ? 'snowNight' : 'snowDay'
  }
  if (weatherCode >= 95) {
    return night ? 'thunderNight' : 'thunderDay'
  }
  return night ? 'cloudyNight' : 'cloudyDay'
}

// ─── Get theme object ──────────────────────────────────────────────────
export const getWeatherTheme = (weatherCode, isNight = false) => {
  const key = getThemeKey(weatherCode, isNight)
  return WEATHER_THEMES[key] || WEATHER_THEMES.cloudyDay
}

// ============================================================================
// SVG ART - Static illustrations layered on the gradient
// ============================================================================

export const getSVGArt = (svgType, canvasWidth, canvasHeight) => {
  const w = canvasWidth
  const h = canvasHeight

  const svgs = {
    // ─── SUNNY (Day) ────────────────────────────────────────────────────
    sunny: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="30%" r="30%">
            <stop offset="0%" stop-color="#FFF3C4" stop-opacity="0.9"/>
            <stop offset="50%" stop-color="#FDB813" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#FDB813" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="${w * 0.5}" cy="${h * 0.22}" r="${w * 0.16}" fill="url(#sunGlow)"/>
        <circle cx="${w * 0.5}" cy="${h * 0.22}" r="${w * 0.09}" fill="#FFF3C4" opacity="0.95"/>
        ${Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30) * Math.PI / 180
          const x1 = w * 0.5 + Math.cos(angle) * w * 0.13
          const y1 = h * 0.22 + Math.sin(angle) * w * 0.13
          const x2 = w * 0.5 + Math.cos(angle) * w * 0.20
          const y2 = h * 0.22 + Math.sin(angle) * w * 0.20
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFF3C4" stroke-width="4" stroke-linecap="round" opacity="0.5"/>`
        }).join('')}
      </svg>
    `,

    // ─── CLEAR NIGHT ────────────────────────────────────────────────────
    clearNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
            <stop offset="40%" stop-color="#A0C4FF" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#A0C4FF" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="${w * 0.75}" cy="${h * 0.22}" r="${w * 0.15}" fill="url(#moonGlow)"/>
        <circle cx="${w * 0.75}" cy="${h * 0.22}" r="${w * 0.075}" fill="#F5F5F5"/>
        <circle cx="${w * 0.72}" cy="${h * 0.20}" r="${w * 0.02}" fill="#E0E0E0" opacity="0.6"/>
        <circle cx="${w * 0.77}" cy="${h * 0.24}" r="${w * 0.015}" fill="#E0E0E0" opacity="0.5"/>
        <circle cx="${w * 0.73}" cy="${h * 0.25}" r="${w * 0.01}" fill="#E0E0E0" opacity="0.4"/>
        ${Array.from({ length: 40 }, () => {
          const x = Math.random() * w
          const y = Math.random() * h * 0.6
          const r = Math.random() * 2 + 0.5
          const opacity = Math.random() * 0.7 + 0.3
          return `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${opacity}"/>`
        }).join('')}
      </svg>
    `,

    // ─── PARTLY CLOUDY (Day) ────────────────────────────────────────────
    partlyCloudyDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pcSunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFF" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#FFF" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="${w * 0.72}" cy="${h * 0.18}" r="${w * 0.15}" fill="url(#pcSunGlow)"/>
        <circle cx="${w * 0.72}" cy="${h * 0.18}" r="${w * 0.075}" fill="#FFF8E1" opacity="0.85"/>
        <g opacity="0.7">
          <ellipse cx="${w * 0.25}" cy="${h * 0.28}" rx="${w * 0.13}" ry="${w * 0.055}" fill="#FFFFFF"/>
          <ellipse cx="${w * 0.35}" cy="${h * 0.26}" rx="${w * 0.10}" ry="${w * 0.045}" fill="#FFFFFF"/>
          <ellipse cx="${w * 0.15}" cy="${h * 0.30}" rx="${w * 0.08}" ry="${w * 0.04}" fill="#FFFFFF"/>
        </g>
        <g opacity="0.5">
          <ellipse cx="${w * 0.60}" cy="${h * 0.42}" rx="${w * 0.15}" ry="${w * 0.06}" fill="#FFFFFF"/>
          <ellipse cx="${w * 0.72}" cy="${h * 0.40}" rx="${w * 0.11}" ry="${w * 0.05}" fill="#FFFFFF"/>
        </g>
      </svg>
    `,

    // ─── PARTLY CLOUDY (Night) ──────────────────────────────────────────
    partlyCloudyNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${Array.from({ length: 30 }, () => {
          const x = Math.random() * w
          const y = Math.random() * h * 0.5
          const r = Math.random() * 1.5 + 0.5
          const opacity = Math.random() * 0.6 + 0.3
          return `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${opacity}"/>`
        }).join('')}
        <circle cx="${w * 0.72}" cy="${h * 0.18}" r="${w * 0.06}" fill="#F5F5F5" opacity="0.9"/>
        <g opacity="0.55">
          <ellipse cx="${w * 0.28}" cy="${h * 0.30}" rx="${w * 0.14}" ry="${w * 0.06}" fill="#2A3542"/>
          <ellipse cx="${w * 0.40}" cy="${h * 0.28}" rx="${w * 0.11}" ry="${w * 0.05}" fill="#2A3542"/>
        </g>
        <g opacity="0.4">
          <ellipse cx="${w * 0.60}" cy="${h * 0.42}" rx="${w * 0.16}" ry="${w * 0.065}" fill="#1F2933"/>
          <ellipse cx="${w * 0.72}" cy="${h * 0.40}" rx="${w * 0.12}" ry="${w * 0.055}" fill="#1F2933"/>
        </g>
      </svg>
    `,

    // ─── CLOUDY (Day) ───────────────────────────────────────────────────
    cloudyDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.7">
          <ellipse cx="${w * 0.30}" cy="${h * 0.22}" rx="${w * 0.16}" ry="${w * 0.07}" fill="#FFFFFF"/>
          <ellipse cx="${w * 0.42}" cy="${h * 0.20}" rx="${w * 0.13}" ry="${w * 0.06}" fill="#FFFFFF"/>
          <ellipse cx="${w * 0.18}" cy="${h * 0.24}" rx="${w * 0.10}" ry="${w * 0.05}" fill="#FFFFFF"/>
        </g>
        <g opacity="0.5">
          <ellipse cx="${w * 0.65}" cy="${h * 0.35}" rx="${w * 0.18}" ry="${w * 0.08}" fill="#FFFFFF"/>
          <ellipse cx="${w * 0.80}" cy="${h * 0.33}" rx="${w * 0.14}" ry="${w * 0.06}" fill="#FFFFFF"/>
        </g>
        <g opacity="0.35">
          <ellipse cx="${w * 0.45}" cy="${h * 0.50}" rx="${w * 0.20}" ry="${w * 0.09}" fill="#FFFFFF"/>
        </g>
      </svg>
    `,

    // ─── CLOUDY (Night) ─────────────────────────────────────────────────
    cloudyNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${Array.from({ length: 15 }, () => {
          const x = Math.random() * w
          const y = Math.random() * h * 0.4
          return `<circle cx="${x}" cy="${y}" r="1" fill="#FFFFFF" opacity="0.4"/>`
        }).join('')}
        <g opacity="0.45">
          <ellipse cx="${w * 0.30}" cy="${h * 0.22}" rx="${w * 0.16}" ry="${w * 0.07}" fill="#2A3542"/>
          <ellipse cx="${w * 0.42}" cy="${h * 0.20}" rx="${w * 0.13}" ry="${w * 0.06}" fill="#2A3542"/>
          <ellipse cx="${w * 0.18}" cy="${h * 0.24}" rx="${w * 0.10}" ry="${w * 0.05}" fill="#2A3542"/>
        </g>
        <g opacity="0.35">
          <ellipse cx="${w * 0.65}" cy="${h * 0.35}" rx="${w * 0.18}" ry="${w * 0.08}" fill="#1A2129"/>
        </g>
      </svg>
    `,

    // ─── RAINY (Day) ────────────────────────────────────────────────────
    rainyDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.6">
          <ellipse cx="${w * 0.35}" cy="${h * 0.18}" rx="${w * 0.20}" ry="${w * 0.08}" fill="#0F1A24"/>
          <ellipse cx="${w * 0.55}" cy="${h * 0.16}" rx="${w * 0.16}" ry="${w * 0.07}" fill="#0F1A24"/>
        </g>
        <g opacity="0.4">
          <ellipse cx="${w * 0.25}" cy="${h * 0.30}" rx="${w * 0.22}" ry="${w * 0.09}" fill="#0A1219"/>
        </g>
        ${Array.from({ length: 40 }, () => {
          const x = Math.random() * w
          const y = Math.random() * h * 0.7 + h * 0.25
          const len = Math.random() * 30 + 20
          return `<line x1="${x}" y1="${y}" x2="${x - 8}" y2="${y + len}" stroke="#7DB8E8" stroke-width="2" stroke-linecap="round" opacity="${Math.random() * 0.5 + 0.3}"/>`
        }).join('')}
      </svg>
    `,

    // ─── RAINY (Night) ──────────────────────────────────────────────────
    rainyNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${Array.from({ length: 20 }, () => {
          const x = Math.random() * w
          const y = Math.random() * h * 0.3
          return `<circle cx="${x}" cy="${y}" r="1" fill="#FFFFFF" opacity="0.3"/>`
        }).join('')}
        <g opacity="0.5">
          <ellipse cx="${w * 0.35}" cy="${h * 0.18}" rx="${w * 0.20}" ry="${w * 0.08}" fill="#050A0F"/>
          <ellipse cx="${w * 0.55}" cy="${h * 0.16}" rx="${w * 0.16}" ry="${w * 0.07}" fill="#050A0F"/>
        </g>
        <g opacity="0.35">
          <ellipse cx="${w * 0.25}" cy="${h * 0.30}" rx="${w * 0.22}" ry="${w * 0.09}" fill="#020508"/>
        </g>
        ${Array.from({ length: 40 }, () => {
          const x = Math.random() * w
          const y = Math.random() * h * 0.7 + h * 0.25
          const len = Math.random() * 30 + 20
          return `<line x1="${x}" y1="${y}" x2="${x - 8}" y2="${y + len}" stroke="#5A8FB8" stroke-width="2" stroke-linecap="round" opacity="${Math.random() * 0.4 + 0.2}"/>`
        }).join('')}
      </svg>
    `,

    // ─── THUNDER (Day) ──────────────────────────────────────────────────
    thunderDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.7">
          <ellipse cx="${w * 0.30}" cy="${h * 0.15}" rx="${w * 0.22}" ry="${w * 0.09}" fill="#0A0C14"/>
          <ellipse cx="${w * 0.55}" cy="${h * 0.13}" rx="${w * 0.20}" ry="${w * 0.085}" fill="#0A0C14"/>
          <ellipse cx="${w * 0.75}" cy="${h * 0.16}" rx="${w * 0.15}" ry="${w * 0.07}" fill="#0A0C14"/>
        </g>
        <g opacity="0.5">
          <ellipse cx="${w * 0.40}" cy="${h * 0.28}" rx="${w * 0.25}" ry="${w * 0.10}" fill="#05070B"/>
        </g>
        <defs>
          <filter id="lightningGlow">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <g filter="url(#lightningGlow)">
          <path d="M ${w * 0.50} ${h * 0.30} L ${w * 0.44} ${h * 0.55} L ${w * 0.50} ${h * 0.53} L ${w * 0.42} ${h * 0.78} L ${w * 0.55} ${h * 0.50} L ${w * 0.48} ${h * 0.52} L ${w * 0.55} ${h * 0.30} Z" fill="#FCD34D" opacity="0.95"/>
        </g>
        ${Array.from({ length: 30 }, () => {
          const x = Math.random() * w
          const y = Math.random() * h * 0.6 + h * 0.35
          const len = Math.random() * 30 + 20
          return `<line x1="${x}" y1="${y}" x2="${x - 6}" y2="${y + len}" stroke="#5A8FB8" stroke-width="2" stroke-linecap="round" opacity="${Math.random() * 0.4 + 0.2}"/>`
        }).join('')}
      </svg>
    `,

    // ─── THUNDER (Night) ────────────────────────────────────────────────
    thunderNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${Array.from({ length: 15 }, () => {
          const x = Math.random() * w
          const y = Math.random() * h * 0.25
          return `<circle cx="${x}" cy="${y}" r="1" fill="#FFFFFF" opacity="0.4"/>`
        }).join('')}
        <g opacity="0.6">
          <ellipse cx="${w * 0.30}" cy="${h * 0.15}" rx="${w * 0.22}" ry="${w * 0.09}" fill="#000000"/>
          <ellipse cx="${w * 0.55}" cy="${h * 0.13}" rx="${w * 0.20}" ry="${w * 0.085}" fill="#000000"/>
        </g>
        <defs>
          <filter id="lightningGlowNight">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <g filter="url(#lightningGlowNight)">
          <path d="M ${w * 0.50} ${h * 0.30} L ${w * 0.44} ${h * 0.55} L ${w * 0.50} ${h * 0.53} L ${w * 0.42} ${h * 0.78} L ${w * 0.55} ${h * 0.50} L ${w * 0.48} ${h * 0.52} L ${w * 0.55} ${h * 0.30} Z" fill="#FCD34D"/>
        </g>
      </svg>
    `,

    // ─── SNOW (Day) ─────────────────────────────────────────────────────
    snowDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.5">
          <ellipse cx="${w * 0.35}" cy="${h * 0.20}" rx="${w * 0.18}" ry="${w * 0.07}" fill="#FFFFFF"/>
          <ellipse cx="${w * 0.55}" cy="${h * 0.18}" rx="${w * 0.15}" ry="${w * 0.06}" fill="#FFFFFF"/>
        </g>
        ${Array.from({ length: 60 }, () => {
          const x = Math.random() * w
          const y = Math.random() * h * 0.85 + h * 0.15
          const r = Math.random() * 4 + 1
          return `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${Math.random() * 0.7 + 0.3}"/>`
        }).join('')}
      </svg>
    `,

    // ─── SNOW (Night) ───────────────────────────────────────────────────
    snowNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${Array.from({ length: 25 }, () => {
          const x = Math.random() * w
          const y = Math.random() * h * 0.3
          return `<circle cx="${x}" cy="${y}" r="1" fill="#FFFFFF" opacity="0.4"/>`
        }).join('')}
        <g opacity="0.4">
          <ellipse cx="${w * 0.35}" cy="${h * 0.20}" rx="${w * 0.18}" ry="${w * 0.07}" fill="#1A2432"/>
          <ellipse cx="${w * 0.55}" cy="${h * 0.18}" rx="${w * 0.15}" ry="${w * 0.06}" fill="#1A2432"/>
        </g>
        ${Array.from({ length: 60 }, () => {
          const x = Math.random() * w
          const y = Math.random() * h * 0.85 + h * 0.15
          const r = Math.random() * 4 + 1
          return `<circle cx="${x}" cy="${y}" r="${r}" fill="#D4E1EC" opacity="${Math.random() * 0.7 + 0.3}"/>`
        }).join('')}
      </svg>
    `,

    // ─── FOG (Day) ──────────────────────────────────────────────────────
    fogDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="${h * 0.3}" width="${w}" height="${h * 0.12}" fill="#FFFFFF" opacity="0.15"/>
        <rect x="0" y="${h * 0.45}" width="${w}" height="${h * 0.10}" fill="#FFFFFF" opacity="0.12"/>
        <rect x="0" y="${h * 0.58}" width="${w}" height="${h * 0.14}" fill="#FFFFFF" opacity="0.10"/>
        <rect x="0" y="${h * 0.72}" width="${w}" height="${h * 0.10}" fill="#FFFFFF" opacity="0.08"/>
      </svg>
    `,

    // ─── FOG (Night) ────────────────────────────────────────────────────
    fogNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${Array.from({ length: 12 }, () => {
          const x = Math.random() * w
          const y = Math.random() * h * 0.3
          return `<circle cx="${x}" cy="${y}" r="1" fill="#FFFFFF" opacity="0.3"/>`
        }).join('')}
        <rect x="0" y="${h * 0.3}" width="${w}" height="${h * 0.12}" fill="#FFFFFF" opacity="0.08"/>
        <rect x="0" y="${h * 0.45}" width="${w}" height="${h * 0.10}" fill="#FFFFFF" opacity="0.06"/>
        <rect x="0" y="${h * 0.58}" width="${w}" height="${h * 0.14}" fill="#FFFFFF" opacity="0.05"/>
      </svg>
    `
  }

  return svgs[svgType] || svgs.sunny
}
