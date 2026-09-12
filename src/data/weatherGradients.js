// ============================================================================
// WEATHER GRADIENTS + SVG ART — UPGRADED
// Atmospheric composition, softer shapes, edge-biased particles
// ============================================================================

export const WEATHER_THEMES = {
  clearDay: {
    gradient: ['#FFD86B', '#F5A623', '#8B4513'],
    textColor: '#FFFFFF',
    accent: '#FFF3C4',
    svg: 'sunny',
    isNight: false
  },
  clearNight: {
    gradient: ['#1E3A5F', '#0F2027', '#050A0F'],
    textColor: '#FFFFFF',
    accent: '#A0C4FF',
    svg: 'clearNight',
    isNight: true
  },
  partlyCloudyDay: {
    gradient: ['#7EC8F0', '#3D7EA8', '#1B4B6B'],
    textColor: '#FFFFFF',
    accent: '#B8DCF5',
    svg: 'partlyCloudyDay',
    isNight: false
  },
  partlyCloudyNight: {
    gradient: ['#2A3F5A', '#131C2B', '#050810'],
    textColor: '#FFFFFF',
    accent: '#8BA8C7',
    svg: 'partlyCloudyNight',
    isNight: true
  },
  cloudyDay: {
    gradient: ['#8A9AAB', '#5A6B7C', '#2F3A47'],
    textColor: '#FFFFFF',
    accent: '#B0BEC5',
    svg: 'cloudyDay',
    isNight: false
  },
  cloudyNight: {
    gradient: ['#2A333C', '#171D23', '#080B0F'],
    textColor: '#FFFFFF',
    accent: '#7A8A94',
    svg: 'cloudyNight',
    isNight: true
  },
  rainyDay: {
    gradient: ['#4A6275', '#2A3F52', '#141F2A'],
    textColor: '#FFFFFF',
    accent: '#7DB8E8',
    svg: 'rainyDay',
    isNight: false
  },
  rainyNight: {
    gradient: ['#15242E', '#0A141B', '#03080D'],
    textColor: '#FFFFFF',
    accent: '#5A8FB8',
    svg: 'rainyNight',
    isNight: true
  },
  thunderDay: {
    gradient: ['#3A3D4D', '#1F2230', '#0A0C14'],
    textColor: '#FFFFFF',
    accent: '#FBBF24',
    svg: 'thunderDay',
    isNight: false
  },
  thunderNight: {
    gradient: ['#15182A', '#080A18', '#000000'],
    textColor: '#FFFFFF',
    accent: '#FCD34D',
    svg: 'thunderNight',
    isNight: true
  },
  snowDay: {
    gradient: ['#D6E4EF', '#A7BCC9', '#5A6B7C'],
    textColor: '#1A2730',
    accent: '#FFFFFF',
    svg: 'snowDay',
    isNight: false
  },
  snowNight: {
    gradient: ['#4A5F75', '#243040', '#0E151F'],
    textColor: '#FFFFFF',
    accent: '#D4E1EC',
    svg: 'snowNight',
    isNight: true
  },
  fogDay: {
    gradient: ['#C5D0D8', '#8A9AA5', '#4A5762'],
    textColor: '#FFFFFF',
    accent: '#CFD8DC',
    svg: 'fogDay',
    isNight: false
  },
  fogNight: {
    gradient: ['#4A535C', '#252C33', '#0E1216'],
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
// HELPERS — Seeded randomness + edge-biased distribution
// ============================================================================

// Deterministic random so visuals are stable
const seededRandom = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

// Edge-biased position (particles cluster near corners/top)
const edgeBiasedPosition = (seed, w, h, yMin = 0, yMax = 1) => {
  const r = seededRandom(seed)
  const r2 = seededRandom(seed + 1)
  // 60% chance edges, 40% center
  let x
  if (r < 0.6) {
    // Edge zones (left or right 20%)
    x = r2 > 0.5 ? seededRandom(seed + 2) * w * 0.2 : w - (seededRandom(seed + 2) * w * 0.2)
  } else {
    x = seededRandom(seed + 2) * w
  }
  const y = h * yMin + seededRandom(seed + 3) * h * (yMax - yMin)
  return { x, y }
}

// ============================================================================
// SVG ART — Softer shapes, edge-biased, integrated composition
// ============================================================================

export const getSVGArt = (svgType, canvasWidth, canvasHeight) => {
  const w = canvasWidth
  const h = canvasHeight

  const svgs = {
    // ─── SUNNY (Day) — soft warm presence ──────────────────────────────
    sunny: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="28%" r="45%">
            <stop offset="0%" stop-color="#FFF8DC" stop-opacity="0.85"/>
            <stop offset="35%" stop-color="#FFE4A0" stop-opacity="0.4"/>
            <stop offset="70%" stop-color="#FDB813" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="#FDB813" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Soft atmospheric sun glow, top center -->
        <ellipse cx="${w * 0.5}" cy="${h * 0.24}" rx="${w * 0.5}" ry="${h * 0.35}" fill="url(#sunGlow)"/>
        <!-- Sun disc, subtle -->
        <circle cx="${w * 0.5}" cy="${h * 0.24}" r="${w * 0.08}" fill="#FFF8DC" opacity="0.7"/>
        <circle cx="${w * 0.5}" cy="${h * 0.24}" r="${w * 0.05}" fill="#FFFFFF" opacity="0.9"/>
      </svg>
    `,

    // ─── CLEAR NIGHT — moon + sparse stars ─────────────────────────────
    clearNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
            <stop offset="40%" stop-color="#A0C4FF" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#A0C4FF" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Moon glow -->
        <circle cx="${w * 0.75}" cy="${h * 0.22}" r="${w * 0.18}" fill="url(#moonGlow)"/>
        <!-- Moon disc -->
        <circle cx="${w * 0.75}" cy="${h * 0.22}" r="${w * 0.07}" fill="#F5F5F5"/>
        <circle cx="${w * 0.72}" cy="${h * 0.20}" r="${w * 0.018}" fill="#D8D8D8" opacity="0.5"/>
        <circle cx="${w * 0.77}" cy="${h * 0.24}" r="${w * 0.012}" fill="#D8D8D8" opacity="0.4"/>
        <!-- Sparse stars — 18, concentrated top 45%, edge-biased -->
        ${(() => {
          const stars = []
          for (let i = 0; i < 18; i++) {
            const { x, y } = edgeBiasedPosition(i * 7 + 100, w, h, 0.05, 0.45)
            const r = seededRandom(i * 11 + 1) * 1.6 + 0.4
            const opacity = seededRandom(i * 13 + 2) * 0.6 + 0.3
            stars.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${opacity}"/>`)
          }
          return stars.join('')
        })()}
      </svg>
    `,

    // ─── PARTLY CLOUDY (Day) ───────────────────────────────────────────
    partlyCloudyDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pcSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFF8DC" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="#FFF8DC" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Soft sun glow top-right -->
        <circle cx="${w * 0.72}" cy="${h * 0.18}" r="${w * 0.18}" fill="url(#pcSun)"/>
        <circle cx="${w * 0.72}" cy="${h * 0.18}" r="${w * 0.05}" fill="#FFF8DC" opacity="0.65"/>
        <!-- Soft cloud mass — irregular, edge weighted -->
        <g opacity="0.32" filter="blur(2px)">
          <ellipse cx="${w * 0.22}" cy="${h * 0.26}" rx="${w * 0.24}" ry="${w * 0.08}" fill="#FFFFFF"/>
          <ellipse cx="${w * 0.35}" cy="${h * 0.23}" rx="${w * 0.16}" ry="${w * 0.06}" fill="#FFFFFF"/>
        </g>
        <g opacity="0.18" filter="blur(3px)">
          <ellipse cx="${w * 0.72}" cy="${h * 0.38}" rx="${w * 0.22}" ry="${w * 0.07}" fill="#FFFFFF"/>
        </g>
      </svg>
    `,

    // ─── PARTLY CLOUDY (Night) ─────────────────────────────────────────
    partlyCloudyNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <!-- Sparse stars -->
        ${(() => {
          const stars = []
          for (let i = 0; i < 14; i++) {
            const { x, y } = edgeBiasedPosition(i * 11 + 200, w, h, 0.05, 0.4)
            const r = seededRandom(i * 17 + 5) * 1.4 + 0.4
            const opacity = seededRandom(i * 19 + 6) * 0.5 + 0.25
            stars.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${opacity}"/>`)
          }
          return stars.join('')
        })()}
        <!-- Moon peeking -->
        <circle cx="${w * 0.75}" cy="${h * 0.20}" r="${w * 0.05}" fill="#F5F5F5" opacity="0.75"/>
        <!-- Dark cloud mass -->
        <g opacity="0.42" filter="blur(2px)">
          <ellipse cx="${w * 0.25}" cy="${h * 0.32}" rx="${w * 0.26}" ry="${w * 0.09}" fill="#1A2530"/>
          <ellipse cx="${w * 0.40}" cy="${h * 0.29}" rx="${w * 0.17}" ry="${w * 0.065}" fill="#1A2530"/>
        </g>
        <g opacity="0.28" filter="blur(3px)">
          <ellipse cx="${w * 0.70}" cy="${h * 0.42}" rx="${w * 0.24}" ry="${w * 0.08}" fill="#0F1A24"/>
        </g>
      </svg>
    `,

    // ─── CLOUDY (Day) — 2 masses only, softer ──────────────────────────
    cloudyDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.28" filter="blur(3px)">
          <ellipse cx="${w * 0.28}" cy="${h * 0.24}" rx="${w * 0.30}" ry="${w * 0.10}" fill="#FFFFFF"/>
          <ellipse cx="${w * 0.45}" cy="${h * 0.21}" rx="${w * 0.22}" ry="${w * 0.08}" fill="#FFFFFF"/>
        </g>
        <g opacity="0.18" filter="blur(4px)">
          <ellipse cx="${w * 0.72}" cy="${h * 0.40}" rx="${w * 0.28}" ry="${w * 0.10}" fill="#FFFFFF"/>
        </g>
      </svg>
    `,

    // ─── CLOUDY (Night) ────────────────────────────────────────────────
    cloudyNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${(() => {
          const stars = []
          for (let i = 0; i < 8; i++) {
            const { x, y } = edgeBiasedPosition(i * 13 + 300, w, h, 0.05, 0.3)
            const r = seededRandom(i * 23 + 7) * 1 + 0.4
            stars.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="0.35"/>`)
          }
          return stars.join('')
        })()}
        <g opacity="0.35" filter="blur(3px)">
          <ellipse cx="${w * 0.28}" cy="${h * 0.24}" rx="${w * 0.30}" ry="${w * 0.10}" fill="#1A2229"/>
          <ellipse cx="${w * 0.45}" cy="${h * 0.21}" rx="${w * 0.22}" ry="${w * 0.08}" fill="#1A2229"/>
        </g>
        <g opacity="0.22" filter="blur(4px)">
          <ellipse cx="${w * 0.72}" cy="${h * 0.40}" rx="${w * 0.28}" ry="${w * 0.10}" fill="#0F161B"/>
        </g>
      </svg>
    `,

    // ─── RAINY (Day) — sparse, edge-biased rain ────────────────────────
    rainyDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <!-- Cloud mass top -->
        <g opacity="0.4" filter="blur(3px)">
          <ellipse cx="${w * 0.35}" cy="${h * 0.18}" rx="${w * 0.30}" ry="${w * 0.10}" fill="#0F1A24"/>
          <ellipse cx="${w * 0.58}" cy="${h * 0.16}" rx="${w * 0.22}" ry="${w * 0.08}" fill="#0F1A24"/>
        </g>
        <g opacity="0.25" filter="blur(4px)">
          <ellipse cx="${w * 0.25}" cy="${h * 0.30}" rx="${w * 0.28}" ry="${w * 0.10}" fill="#0A1219"/>
        </g>
        <!-- Sparse rain — 22 drops, edge-biased, thinner -->
        ${(() => {
          const drops = []
          for (let i = 0; i < 22; i++) {
            const { x, y } = edgeBiasedPosition(i * 17 + 400, w, h, 0.35, 0.95)
            const len = 16 + seededRandom(i * 29 + 8) * 20
            const opacity = 0.15 + seededRandom(i * 31 + 9) * 0.25
            drops.push(`<line x1="${x}" y1="${y}" x2="${x - 5}" y2="${y + len}" stroke="#7DB8E8" stroke-width="1.4" stroke-linecap="round" opacity="${opacity}"/>`)
          }
          return drops.join('')
        })()}
      </svg>
    `,

    // ─── RAINY (Night) ─────────────────────────────────────────────────
    rainyNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${(() => {
          const stars = []
          for (let i = 0; i < 10; i++) {
            const { x, y } = edgeBiasedPosition(i * 19 + 500, w, h, 0.05, 0.25)
            stars.push(`<circle cx="${x}" cy="${y}" r="1" fill="#FFFFFF" opacity="0.3"/>`)
          }
          return stars.join('')
        })()}
        <g opacity="0.45" filter="blur(3px)">
          <ellipse cx="${w * 0.35}" cy="${h * 0.18}" rx="${w * 0.30}" ry="${w * 0.10}" fill="#050A0F"/>
          <ellipse cx="${w * 0.58}" cy="${h * 0.16}" rx="${w * 0.22}" ry="${w * 0.08}" fill="#050A0F"/>
        </g>
        <g opacity="0.3" filter="blur(4px)">
          <ellipse cx="${w * 0.25}" cy="${h * 0.30}" rx="${w * 0.28}" ry="${w * 0.10}" fill="#020508"/>
        </g>
        ${(() => {
          const drops = []
          for (let i = 0; i < 22; i++) {
            const { x, y } = edgeBiasedPosition(i * 23 + 600, w, h, 0.35, 0.95)
            const len = 16 + seededRandom(i * 37 + 10) * 20
            const opacity = 0.1 + seededRandom(i * 41 + 11) * 0.2
            drops.push(`<line x1="${x}" y1="${y}" x2="${x - 5}" y2="${y + len}" stroke="#5A8FB8" stroke-width="1.4" stroke-linecap="round" opacity="${opacity}"/>`)
          }
          return drops.join('')
        })()}
      </svg>
    `,

    // ─── THUNDER (Day) — subtle lightning, softer clouds ───────────────
    thunderDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.5" filter="blur(3px)">
          <ellipse cx="${w * 0.30}" cy="${h * 0.15}" rx="${w * 0.32}" ry="${w * 0.11}" fill="#0A0C14"/>
          <ellipse cx="${w * 0.58}" cy="${h * 0.13}" rx="${w * 0.26}" ry="${w * 0.09}" fill="#0A0C14"/>
        </g>
        <g opacity="0.3" filter="blur(4px)">
          <ellipse cx="${w * 0.42}" cy="${h * 0.28}" rx="${w * 0.30}" ry="${w * 0.11}" fill="#05070B"/>
        </g>
        <defs>
          <filter id="lightningGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#lightningGlow)" opacity="0.85">
          <path d="M ${w * 0.50} ${h * 0.30} L ${w * 0.46} ${h * 0.52} L ${w * 0.51} ${h * 0.51} L ${w * 0.44} ${h * 0.75} L ${w * 0.55} ${h * 0.48} L ${w * 0.49} ${h * 0.50} L ${w * 0.55} ${h * 0.30} Z" fill="#FCD34D"/>
        </g>
        ${(() => {
          const drops = []
          for (let i = 0; i < 16; i++) {
            const { x, y } = edgeBiasedPosition(i * 29 + 700, w, h, 0.4, 0.9)
            const len = 14 + seededRandom(i * 43 + 12) * 18
            drops.push(`<line x1="${x}" y1="${y}" x2="${x - 4}" y2="${y + len}" stroke="#5A8FB8" stroke-width="1.2" stroke-linecap="round" opacity="0.2"/>`)
          }
          return drops.join('')
        })()}
      </svg>
    `,

    // ─── THUNDER (Night) ───────────────────────────────────────────────
    thunderNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${(() => {
          const stars = []
          for (let i = 0; i < 8; i++) {
            const { x, y } = edgeBiasedPosition(i * 31 + 800, w, h, 0.03, 0.2)
            stars.push(`<circle cx="${x}" cy="${y}" r="1" fill="#FFFFFF" opacity="0.35"/>`)
          }
          return stars.join('')
        })()}
        <g opacity="0.55" filter="blur(3px)">
          <ellipse cx="${w * 0.30}" cy="${h * 0.15}" rx="${w * 0.32}" ry="${w * 0.11}" fill="#000000"/>
          <ellipse cx="${w * 0.58}" cy="${h * 0.13}" rx="${w * 0.26}" ry="${w * 0.09}" fill="#000000"/>
        </g>
        <defs>
          <filter id="lightningGlowNight" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#lightningGlowNight)">
          <path d="M ${w * 0.50} ${h * 0.30} L ${w * 0.46} ${h * 0.52} L ${w * 0.51} ${h * 0.51} L ${w * 0.44} ${h * 0.75} L ${w * 0.55} ${h * 0.48} L ${w * 0.49} ${h * 0.50} L ${w * 0.55} ${h * 0.30} Z" fill="#FCD34D"/>
        </g>
      </svg>
    `,

    // ─── SNOW (Day) — 25 flakes, softer ────────────────────────────────
    snowDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.25" filter="blur(3px)">
          <ellipse cx="${w * 0.35}" cy="${h * 0.20}" rx="${w * 0.28}" ry="${w * 0.09}" fill="#FFFFFF"/>
          <ellipse cx="${w * 0.60}" cy="${h * 0.18}" rx="${w * 0.22}" ry="${w * 0.07}" fill="#FFFFFF"/>
        </g>
        ${(() => {
          const flakes = []
          for (let i = 0; i < 25; i++) {
            const { x, y } = edgeBiasedPosition(i * 41 + 900, w, h, 0.15, 0.95)
            const r = 1.5 + seededRandom(i * 47 + 13) * 2.5
            const opacity = 0.35 + seededRandom(i * 53 + 14) * 0.4
            flakes.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${opacity}"/>`)
          }
          return flakes.join('')
        })()}
      </svg>
    `,

    // ─── SNOW (Night) ──────────────────────────────────────────────────
    snowNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${(() => {
          const stars = []
          for (let i = 0; i < 10; i++) {
            const { x, y } = edgeBiasedPosition(i * 37 + 1000, w, h, 0.03, 0.22)
            stars.push(`<circle cx="${x}" cy="${y}" r="1" fill="#FFFFFF" opacity="0.35"/>`)
          }
          return stars.join('')
        })()}
        <g opacity="0.3" filter="blur(3px)">
          <ellipse cx="${w * 0.35}" cy="${h * 0.20}" rx="${w * 0.28}" ry="${w * 0.09}" fill="#1A2432"/>
          <ellipse cx="${w * 0.60}" cy="${h * 0.18}" rx="${w * 0.22}" ry="${w * 0.07}" fill="#1A2432"/>
        </g>
        ${(() => {
          const flakes = []
          for (let i = 0; i < 25; i++) {
            const { x, y } = edgeBiasedPosition(i * 43 + 1100, w, h, 0.15, 0.95)
            const r = 1.5 + seededRandom(i * 59 + 15) * 2.5
            const opacity = 0.3 + seededRandom(i * 61 + 16) * 0.35
            flakes.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#D4E1EC" opacity="${opacity}"/>`)
          }
          return flakes.join('')
        })()}
      </svg>
    `,

    // ─── FOG (Day) — softer layered bands ──────────────────────────────
    fogDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fogBand" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
            <stop offset="50%" stop-color="#FFFFFF" stop-opacity="1"/>
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect x="0" y="${h * 0.32}" width="${w}" height="${h * 0.10}" fill="url(#fogBand)" opacity="0.14"/>
        <rect x="0" y="${h * 0.48}" width="${w}" height="${h * 0.09}" fill="url(#fogBand)" opacity="0.11"/>
        <rect x="0" y="${h * 0.62}" width="${w}" height="${h * 0.11}" fill="url(#fogBand)" opacity="0.09"/>
        <rect x="0" y="${h * 0.76}" width="${w}" height="${h * 0.08}" fill="url(#fogBand)" opacity="0.07"/>
      </svg>
    `,

    // ─── FOG (Night) ───────────────────────────────────────────────────
    fogNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${(() => {
          const stars = []
          for (let i = 0; i < 6; i++) {
            const { x, y } = edgeBiasedPosition(i * 43 + 1200, w, h, 0.03, 0.2)
            stars.push(`<circle cx="${x}" cy="${y}" r="1" fill="#FFFFFF" opacity="0.25"/>`)
          }
          return stars.join('')
        })()}
        <defs>
          <linearGradient id="fogBandNight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
            <stop offset="50%" stop-color="#FFFFFF" stop-opacity="1"/>
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect x="0" y="${h * 0.32}" width="${w}" height="${h * 0.10}" fill="url(#fogBandNight)" opacity="0.08"/>
        <rect x="0" y="${h * 0.48}" width="${w}" height="${h * 0.09}" fill="url(#fogBandNight)" opacity="0.06"/>
        <rect x="0" y="${h * 0.62}" width="${w}" height="${h * 0.11}" fill="url(#fogBandNight)" opacity="0.05"/>
      </svg>
    `
  }

  return svgs[svgType] || svgs.sunny
}
