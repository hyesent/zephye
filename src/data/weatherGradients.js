// ============================================================================
// WEATHER GRADIENTS + SVG ART — SURGICAL TUNING
// Restraint-based hierarchy: gradient mood → SVG weather → content
// ============================================================================

export const WEATHER_THEMES = {
  clearDay: {
    gradient: ['#F7C65C', '#EFAE52', '#C9783C'],
    textColor: '#FFFFFF',
    accent: '#FFF3C4',
    svg: 'sunny',
    isNight: false,
    svgOpacity: 0.32 // 28–35%
  },
  clearNight: {
    gradient: ['#07131D', '#102A3A', '#1D4658'],
    textColor: '#FFFFFF',
    accent: '#A0C4FF',
    svg: 'clearNight',
    isNight: true,
    svgOpacity: 0.28 // 25–32%
  },
  partlyCloudyDay: {
    gradient: ['#5EA8D8', '#4385B4', '#315F82'],
    textColor: '#FFFFFF',
    accent: '#B8DCF5',
    svg: 'partlyCloudyDay',
    isNight: false,
    svgOpacity: 0.21 // 18–25%
  },
  partlyCloudyNight: {
    gradient: ['#101D2A', '#0A1119', '#05090E'],
    textColor: '#FFFFFF',
    accent: '#8BA8C7',
    svg: 'partlyCloudyNight',
    isNight: true,
    svgOpacity: 0.17 // 14–20%
  },
  cloudyDay: {
    gradient: ['#71818C', '#53636D', '#394850'],
    textColor: '#FFFFFF',
    accent: '#B0BEC5',
    svg: 'cloudyDay',
    isNight: false,
    svgOpacity: 0.17 // 14–20%
  },
  cloudyNight: {
    gradient: ['#171E24', '#0E1419', '#070B0F'],
    textColor: '#FFFFFF',
    accent: '#7A8A94',
    svg: 'cloudyNight',
    isNight: true,
    svgOpacity: 0.13 // 10–16%
  },
  rainyDay: {
    gradient: ['#456170', '#304956', '#20353F'],
    textColor: '#FFFFFF',
    accent: '#7DB8E8',
    svg: 'rainyDay',
    isNight: false,
    svgOpacity: 0.21 // 18–24%
  },
  rainyNight: {
    gradient: ['#0B1A25', '#07121A', '#03080D'],
    textColor: '#FFFFFF',
    accent: '#5A8FB8',
    svg: 'rainyNight',
    isNight: true,
    svgOpacity: 0.17 // 14–20%
  },
  thunderDay: {
    gradient: ['#343743', '#222631', '#151821'],
    textColor: '#FFFFFF',
    accent: '#FBBF24',
    svg: 'thunderDay',
    isNight: false,
    svgOpacity: 0.235 // 20–27%
  },
  thunderNight: {
    gradient: ['#090B15', '#050711', '#020307'],
    textColor: '#FFFFFF',
    accent: '#FCD34D',
    svg: 'thunderNight',
    isNight: true,
    svgOpacity: 0.21 // 18–24%
  },
  snowDay: {
    gradient: ['#D9E5EA', '#B9CBD4', '#91AAB7'],
    textColor: '#1A2730',
    accent: '#FFFFFF',
    svg: 'snowDay',
    isNight: false,
    svgOpacity: 0.235 // 20–27%
  },
  snowNight: {
    gradient: ['#344757', '#202F3D', '#111B25'],
    textColor: '#FFFFFF',
    accent: '#D4E1EC',
    svg: 'snowNight',
    isNight: true,
    svgOpacity: 0.2 // 17–23%
  },
  fogDay: {
    gradient: ['#B8C7CC', '#9EAFB5', '#73878E'],
    textColor: '#FFFFFF',
    accent: '#CFD8DC',
    svg: 'fogDay',
    isNight: false,
    svgOpacity: 0.13 // 10–16%
  },
  fogNight: {
    gradient: ['#323B42', '#22292F', '#11161A'],
    textColor: '#FFFFFF',
    accent: '#8A959D',
    svg: 'fogNight',
    isNight: true,
    svgOpacity: 0.105 // 8–13%
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
  if (weatherCode === 0 || weatherCode === 1) return night ? 'clearNight' : 'clearDay'
  if (weatherCode === 2) return night ? 'partlyCloudyNight' : 'partlyCloudyDay'
  if (weatherCode === 3) return night ? 'cloudyNight' : 'cloudyDay'
  if (weatherCode === 45 || weatherCode === 48) return night ? 'fogNight' : 'fogDay'
  if (weatherCode >= 51 && weatherCode <= 67) return night ? 'rainyNight' : 'rainyDay'
  if (weatherCode >= 71 && weatherCode <= 77) return night ? 'snowNight' : 'snowDay'
  if (weatherCode >= 80 && weatherCode <= 82) return night ? 'rainyNight' : 'rainyDay'
  if (weatherCode >= 85 && weatherCode <= 86) return night ? 'snowNight' : 'snowDay'
  if (weatherCode >= 95) return night ? 'thunderNight' : 'thunderDay'
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

const seededRandom = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

// Particles cluster toward edges and top — never dead center behind text
const edgeBiasedPosition = (seed, w, h, yMin = 0, yMax = 1) => {
  const r = seededRandom(seed)
  const r2 = seededRandom(seed + 1)
  let x
  if (r < 0.6) {
    x = r2 > 0.5 ? seededRandom(seed + 2) * w * 0.2 : w - (seededRandom(seed + 2) * w * 0.2)
  } else {
    x = seededRandom(seed + 2) * w
  }
  const y = h * yMin + seededRandom(seed + 3) * h * (yMax - yMin)
  return { x, y }
}

// ============================================================================
// SVG ART — Surgical tuning: softer, edge-weighted, restrained
// ============================================================================

export const getSVGArt = (svgType, canvasWidth, canvasHeight) => {
  const w = canvasWidth
  const h = canvasHeight

  const svgs = {
    // ─── SUNNY (Day) — 8-10 rays, softer, moved up ─────────────────────
    sunny: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="16%" r="35%">
            <stop offset="0%" stop-color="#FFF8DC" stop-opacity="0.22"/>
            <stop offset="45%" stop-color="#FFE4A0" stop-opacity="0.10"/>
            <stop offset="100%" stop-color="#FDB813" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Atmospheric glow, moved to 16% -->
        <ellipse cx="${w * 0.5}" cy="${h * 0.16}" rx="${w * 0.45}" ry="${h * 0.30}" fill="url(#sunGlow)"/>
        <!-- Sun disc, subtle body -->
        <circle cx="${w * 0.5}" cy="${h * 0.16}" r="${w * 0.07}" fill="#FFF8DC" opacity="0.82"/>
        <circle cx="${w * 0.5}" cy="${h * 0.16}" r="${w * 0.045}" fill="#FFFFFF" opacity="0.9"/>
        <!-- 9 rays (down from 12), opacity 0.28–0.38 -->
        ${Array.from({ length: 9 }, (_, i) => {
          const angle = (i * 40) * Math.PI / 180
          const x1 = w * 0.5 + Math.cos(angle) * w * 0.11
          const y1 = h * 0.16 + Math.sin(angle) * w * 0.11
          const x2 = w * 0.5 + Math.cos(angle) * w * 0.17
          const y2 = h * 0.16 + Math.sin(angle) * w * 0.17
          const op = 0.28 + (i % 3) * 0.05
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFF3C4" stroke-width="3" stroke-linecap="round" opacity="${op}"/>`
        }).join('')}
      </svg>
    `,

    // ─── CLEAR NIGHT — moon hero, 15 stars, restrained ─────────────────
    clearNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.18"/>
            <stop offset="50%" stop-color="#A0C4FF" stop-opacity="0.06"/>
            <stop offset="100%" stop-color="#A0C4FF" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="${w * 0.75}" cy="${h * 0.22}" r="${w * 0.16}" fill="url(#moonGlow)"/>
        <circle cx="${w * 0.75}" cy="${h * 0.22}" r="${w * 0.06}" fill="#F5F5F5" opacity="0.78"/>
        <circle cx="${w * 0.72}" cy="${h * 0.20}" r="${w * 0.014}" fill="#D8D8D8" opacity="0.4"/>
        <circle cx="${w * 0.77}" cy="${h * 0.24}" r="${w * 0.010}" fill="#D8D8D8" opacity="0.35"/>
        <!-- 15 stars, opacity 0.25–0.40, concentrated top -->
        ${(() => {
          const stars = []
          for (let i = 0; i < 15; i++) {
            const { x, y } = edgeBiasedPosition(i * 7 + 100, w, h, 0.04, 0.42)
            const r = seededRandom(i * 11 + 1) * 1.4 + 0.4
            const opacity = 0.25 + seededRandom(i * 13 + 2) * 0.15
            stars.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${opacity}"/>`)
          }
          return stars.join('')
        })()}
      </svg>
    `,

    // ─── PARTLY CLOUDY (Day) — clouds to right-upper, subtle sun ───────
    partlyCloudyDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pcSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFF8DC" stop-opacity="0.14"/>
            <stop offset="100%" stop-color="#FFF8DC" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Sun glow, subtle -->
        <circle cx="${w * 0.72}" cy="${h * 0.18}" r="${w * 0.16}" fill="url(#pcSun)"/>
        <circle cx="${w * 0.72}" cy="${h * 0.18}" r="${w * 0.045}" fill="#FFF8DC" opacity="0.7"/>
        <!-- Cloud mass moved right-upper, opacity 0.18–0.26 -->
        <g opacity="0.24" filter="blur(2px)">
          <ellipse cx="${w * 0.78}" cy="${h * 0.32}" rx="${w * 0.26}" ry="${w * 0.09}" fill="#FFFFFF"/>
          <ellipse cx="${w * 0.88}" cy="${h * 0.28}" rx="${w * 0.16}" ry="${w * 0.06}" fill="#FFFFFF"/>
        </g>
        <g opacity="0.18" filter="blur(3px)">
          <ellipse cx="${w * 0.22}" cy="${h * 0.44}" rx="${w * 0.22}" ry="${w * 0.07}" fill="#FFFFFF"/>
        </g>
      </svg>
    `,

    // ─── PARTLY CLOUDY (Night) — clouds almost disappear ───────────────
    partlyCloudyNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${(() => {
          const stars = []
          for (let i = 0; i < 12; i++) {
            const { x, y } = edgeBiasedPosition(i * 11 + 200, w, h, 0.04, 0.4)
            const r = seededRandom(i * 17 + 5) * 1.3 + 0.4
            const opacity = 0.20 + seededRandom(i * 19 + 6) * 0.12
            stars.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${opacity}"/>`)
          }
          return stars.join('')
        })()}
        <!-- Moon glimmer -->
        <circle cx="${w * 0.75}" cy="${h * 0.20}" r="${w * 0.13}" fill="#A0C4FF" opacity="0.12"/>
        <circle cx="${w * 0.75}" cy="${h * 0.20}" r="${w * 0.045}" fill="#F5F5F5" opacity="0.6"/>
        <!-- Dark cloud mass, opacity 0.12–0.18 -->
        <g opacity="0.16" filter="blur(3px)">
          <ellipse cx="${w * 0.75}" cy="${h * 0.34}" rx="${w * 0.28}" ry="${w * 0.10}" fill="#1A2530"/>
        </g>
        <g opacity="0.12" filter="blur(4px)">
          <ellipse cx="${w * 0.20}" cy="${h * 0.40}" rx="${w * 0.24}" ry="${w * 0.08}" fill="#0F1A24"/>
        </g>
      </svg>
    `,

    // ─── CLOUDY (Day) — 2 masses only, opacity 0.14–0.20 ───────────────
    cloudyDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.20" filter="blur(4px)">
          <ellipse cx="${w * 0.30}" cy="${h * 0.24}" rx="${w * 0.34}" ry="${w * 0.11}" fill="#FFFFFF"/>
          <ellipse cx="${w * 0.48}" cy="${h * 0.20}" rx="${w * 0.24}" ry="${w * 0.09}" fill="#FFFFFF"/>
        </g>
        <g opacity="0.14" filter="blur(5px)">
          <ellipse cx="${w * 0.75}" cy="${h * 0.38}" rx="${w * 0.32}" ry="${w * 0.11}" fill="#FFFFFF"/>
        </g>
      </svg>
    `,

    // ─── CLOUDY (Night) — heavy and quiet, almost no stars ─────────────
    cloudyNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${(() => {
          const stars = []
          for (let i = 0; i < 6; i++) {
            const { x, y } = edgeBiasedPosition(i * 13 + 300, w, h, 0.03, 0.28)
            const r = seededRandom(i * 23 + 7) * 1 + 0.3
            stars.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="0.14"/>`)
          }
          return stars.join('')
        })()}
        <g opacity="0.16" filter="blur(4px)">
          <ellipse cx="${w * 0.30}" cy="${h * 0.24}" rx="${w * 0.34}" ry="${w * 0.11}" fill="#1A2229"/>
          <ellipse cx="${w * 0.48}" cy="${h * 0.20}" rx="${w * 0.24}" ry="${w * 0.09}" fill="#1A2229"/>
        </g>
        <g opacity="0.11" filter="blur(5px)">
          <ellipse cx="${w * 0.75}" cy="${h * 0.38}" rx="${w * 0.32}" ry="${w * 0.11}" fill="#0F161B"/>
        </g>
      </svg>
    `,

    // ─── RAINY (Day) — 26 drops, rain opacity 0.20–0.28 ────────────────
    rainyDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.24" filter="blur(4px)">
          <ellipse cx="${w * 0.35}" cy="${h * 0.18}" rx="${w * 0.34}" ry="${w * 0.11}" fill="#0F1A24"/>
          <ellipse cx="${w * 0.60}" cy="${h * 0.15}" rx="${w * 0.26}" ry="${w * 0.09}" fill="#0F1A24"/>
        </g>
        <g opacity="0.20" filter="blur(5px)">
          <ellipse cx="${w * 0.25}" cy="${h * 0.30}" rx="${w * 0.30}" ry="${w * 0.10}" fill="#0A1219"/>
        </g>
        ${(() => {
          const drops = []
          for (let i = 0; i < 26; i++) {
            const { x, y } = edgeBiasedPosition(i * 17 + 400, w, h, 0.35, 0.95)
            const len = 16 + seededRandom(i * 29 + 8) * 20
            const opacity = 0.20 + seededRandom(i * 31 + 9) * 0.08
            drops.push(`<line x1="${x}" y1="${y}" x2="${x - 5}" y2="${y + len}" stroke="#7DB8E8" stroke-width="1.3" stroke-linecap="round" opacity="${opacity}"/>`)
          }
          return drops.join('')
        })()}
      </svg>
    `,

    // ─── RAINY (Night) — darkest card, no stars ────────────────────────
    rainyNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.22" filter="blur(4px)">
          <ellipse cx="${w * 0.35}" cy="${h * 0.18}" rx="${w * 0.34}" ry="${w * 0.11}" fill="#050A0F"/>
          <ellipse cx="${w * 0.60}" cy="${h * 0.15}" rx="${w * 0.26}" ry="${w * 0.09}" fill="#050A0F"/>
        </g>
        <g opacity="0.16" filter="blur(5px)">
          <ellipse cx="${w * 0.25}" cy="${h * 0.30}" rx="${w * 0.30}" ry="${w * 0.10}" fill="#020508"/>
        </g>
        ${(() => {
          const drops = []
          for (let i = 0; i < 26; i++) {
            const { x, y } = edgeBiasedPosition(i * 23 + 600, w, h, 0.35, 0.95)
            const len = 16 + seededRandom(i * 37 + 10) * 20
            const opacity = 0.16 + seededRandom(i * 41 + 11) * 0.06
            drops.push(`<line x1="${x}" y1="${y}" x2="${x - 5}" y2="${y + len}" stroke="#5A8FB8" stroke-width="1.3" stroke-linecap="round" opacity="${opacity}"/>`)
          }
          return drops.join('')
        })()}
      </svg>
    `,

    // ─── THUNDER (Day) — lightning shifted right, glow 0.18 ────────────
    thunderDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.26" filter="blur(4px)">
          <ellipse cx="${w * 0.30}" cy="${h * 0.14}" rx="${w * 0.34}" ry="${w * 0.12}" fill="#0A0C14"/>
          <ellipse cx="${w * 0.60}" cy="${h * 0.12}" rx="${w * 0.28}" ry="${w * 0.10}" fill="#0A0C14"/>
        </g>
        <g opacity="0.20" filter="blur(5px)">
          <ellipse cx="${w * 0.42}" cy="${h * 0.26}" rx="${w * 0.32}" ry="${w * 0.11}" fill="#05070B"/>
        </g>
        <defs>
          <filter id="lightningGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- Lightning shifted right -->
        <g filter="url(#lightningGlow)" opacity="0.62">
          <path d="M ${w * 0.68} ${h * 0.30} L ${w * 0.64} ${h * 0.52} L ${w * 0.69} ${h * 0.51} L ${w * 0.62} ${h * 0.75} L ${w * 0.73} ${h * 0.48} L ${w * 0.67} ${h * 0.50} L ${w * 0.73} ${h * 0.30} Z" fill="#FCD34D"/>
        </g>
        ${(() => {
          const drops = []
          for (let i = 0; i < 14; i++) {
            const { x, y } = edgeBiasedPosition(i * 29 + 700, w, h, 0.4, 0.9)
            const len = 14 + seededRandom(i * 43 + 12) * 18
            drops.push(`<line x1="${x}" y1="${y}" x2="${x - 4}" y2="${y + len}" stroke="#5A8FB8" stroke-width="1.1" stroke-linecap="round" opacity="0.17"/>`)
          }
          return drops.join('')
        })()}
      </svg>
    `,

    // ─── THUNDER (Night) — subtle stars, lightning right ───────────────
    thunderNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${(() => {
          const stars = []
          for (let i = 0; i < 6; i++) {
            const { x, y } = edgeBiasedPosition(i * 31 + 800, w, h, 0.03, 0.18)
            stars.push(`<circle cx="${x}" cy="${y}" r="1" fill="#FFFFFF" opacity="0.28"/>`)
          }
          return stars.join('')
        })()}
        <g opacity="0.28" filter="blur(4px)">
          <ellipse cx="${w * 0.30}" cy="${h * 0.14}" rx="${w * 0.34}" ry="${w * 0.12}" fill="#000000"/>
          <ellipse cx="${w * 0.60}" cy="${h * 0.12}" rx="${w * 0.28}" ry="${w * 0.10}" fill="#000000"/>
        </g>
        <defs>
          <filter id="lightningGlowNight" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#lightningGlowNight)" opacity="0.72">
          <path d="M ${w * 0.68} ${h * 0.30} L ${w * 0.64} ${h * 0.52} L ${w * 0.69} ${h * 0.51} L ${w * 0.62} ${h * 0.75} L ${w * 0.73} ${h * 0.48} L ${w * 0.67} ${h * 0.50} L ${w * 0.73} ${h * 0.30} Z" fill="#FCD34D"/>
        </g>
      </svg>
    `,

    // ─── SNOW (Day) — 34 flakes, larger, opacity 0.28–0.40 ─────────────
    snowDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.20" filter="blur(4px)">
          <ellipse cx="${w * 0.35}" cy="${h * 0.18}" rx="${w * 0.30}" ry="${w * 0.10}" fill="#FFFFFF"/>
          <ellipse cx="${w * 0.62}" cy="${h * 0.16}" rx="${w * 0.24}" ry="${w * 0.08}" fill="#FFFFFF"/>
        </g>
        ${(() => {
          const flakes = []
          for (let i = 0; i < 34; i++) {
            const { x, y } = edgeBiasedPosition(i * 41 + 900, w, h, 0.12, 0.95)
            const r = 2 + seededRandom(i * 47 + 13) * 3
            const opacity = 0.28 + seededRandom(i * 53 + 14) * 0.12
            flakes.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${opacity}"/>`)
          }
          return flakes.join('')
        })()}
      </svg>
    `,

    // ─── SNOW (Night) — 32 flakes, opacity 0.22–0.32 ───────────────────
    snowNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${(() => {
          const stars = []
          for (let i = 0; i < 8; i++) {
            const { x, y } = edgeBiasedPosition(i * 37 + 1000, w, h, 0.03, 0.20)
            stars.push(`<circle cx="${x}" cy="${y}" r="1" fill="#FFFFFF" opacity="0.3"/>`)
          }
          return stars.join('')
        })()}
        <g opacity="0.22" filter="blur(4px)">
          <ellipse cx="${w * 0.35}" cy="${h * 0.18}" rx="${w * 0.30}" ry="${w * 0.10}" fill="#1A2432"/>
          <ellipse cx="${w * 0.62}" cy="${h * 0.16}" rx="${w * 0.24}" ry="${w * 0.08}" fill="#1A2432"/>
        </g>
        ${(() => {
          const flakes = []
          for (let i = 0; i < 32; i++) {
            const { x, y } = edgeBiasedPosition(i * 43 + 1100, w, h, 0.12, 0.95)
            const r = 2 + seededRandom(i * 59 + 15) * 3
            const opacity = 0.22 + seededRandom(i * 61 + 16) * 0.10
            flakes.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#D4E1EC" opacity="${opacity}"/>`)
          }
          return flakes.join('')
        })()}
      </svg>
    `,

    // ─── FOG (Day) — opacity 0.07–0.12, nearly invisible ───────────────
    fogDay: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fogBand" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
            <stop offset="50%" stop-color="#FFFFFF" stop-opacity="1"/>
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect x="0" y="${h * 0.32}" width="${w}" height="${h * 0.10}" fill="url(#fogBand)" opacity="0.11"/>
        <rect x="0" y="${h * 0.48}" width="${w}" height="${h * 0.09}" fill="url(#fogBand)" opacity="0.09"/>
        <rect x="0" y="${h * 0.62}" width="${w}" height="${h * 0.11}" fill="url(#fogBand)" opacity="0.08"/>
        <rect x="0" y="${h * 0.76}" width="${w}" height="${h * 0.08}" fill="url(#fogBand)" opacity="0.07"/>
      </svg>
    `,

    // ─── FOG (Night) — opacity 0.06–0.10, stars 0.04–0.08 ──────────────
    fogNight: `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${(() => {
          const stars = []
          for (let i = 0; i < 5; i++) {
            const { x, y } = edgeBiasedPosition(i * 43 + 1200, w, h, 0.03, 0.18)
            stars.push(`<circle cx="${x}" cy="${y}" r="1" fill="#FFFFFF" opacity="0.06"/>`)
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
        <rect x="0" y="${h * 0.32}" width="${w}" height="${h * 0.10}" fill="url(#fogBandNight)" opacity="0.09"/>
        <rect x="0" y="${h * 0.48}" width="${w}" height="${h * 0.09}" fill="url(#fogBandNight)" opacity="0.07"/>
        <rect x="0" y="${h * 0.62}" width="${w}" height="${h * 0.11}" fill="url(#fogBandNight)" opacity="0.06"/>
      </svg>
    `
  }

  return svgs[svgType] || svgs.sunny
}
