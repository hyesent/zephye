```js
// ============================================================================
// ZEPHYE WEATHER THEMES + SVG ART
// Atmospheric / Premium / Restrained
// Drop-in replacement
// ============================================================================

export const WEATHER_THEMES = {
  clearDay: {
    gradient: ['#F7C65C', '#EFAE52', '#C9783C'],
    textColor: '#FFFFFF',
    accent: '#FFF3C4',
    svg: 'sunny',
    isNight: false,
    svgOpacity: 0.58
  },

  clearNight: {
    gradient: ['#07131D', '#102A3A', '#1D4658'],
    textColor: '#FFFFFF',
    accent: '#A0C4FF',
    svg: 'clearNight',
    isNight: true,
    svgOpacity: 0.62
  },

  partlyCloudyDay: {
    gradient: ['#63AEDB', '#4789B8', '#315F82'],
    textColor: '#FFFFFF',
    accent: '#B8DCF5',
    svg: 'partlyCloudyDay',
    isNight: false,
    svgOpacity: 0.5
  },

  partlyCloudyNight: {
    gradient: ['#101D2A', '#0A1119', '#05090E'],
    textColor: '#FFFFFF',
    accent: '#8BA8C7',
    svg: 'partlyCloudyNight',
    isNight: true,
    svgOpacity: 0.54
  },

  cloudyDay: {
    gradient: ['#71818C', '#53636D', '#394850'],
    textColor: '#FFFFFF',
    accent: '#B0BEC5',
    svg: 'cloudyDay',
    isNight: false,
    svgOpacity: 0.48
  },

  cloudyNight: {
    gradient: ['#171E24', '#0E1419', '#070B0F'],
    textColor: '#FFFFFF',
    accent: '#7A8A94',
    svg: 'cloudyNight',
    isNight: true,
    svgOpacity: 0.5
  },

  rainyDay: {
    gradient: ['#456170', '#304956', '#20353F'],
    textColor: '#FFFFFF',
    accent: '#7DB8E8',
    svg: 'rainyDay',
    isNight: false,
    svgOpacity: 0.54
  },

  rainyNight: {
    gradient: ['#0B1A25', '#07121A', '#03080D'],
    textColor: '#FFFFFF',
    accent: '#5A8FB8',
    svg: 'rainyNight',
    isNight: true,
    svgOpacity: 0.56
  },

  thunderDay: {
    gradient: ['#343743', '#222631', '#151821'],
    textColor: '#FFFFFF',
    accent: '#FBBF24',
    svg: 'thunderDay',
    isNight: false,
    svgOpacity: 0.58
  },

  thunderNight: {
    gradient: ['#090B15', '#050711', '#020307'],
    textColor: '#FFFFFF',
    accent: '#FCD34D',
    svg: 'thunderNight',
    isNight: true,
    svgOpacity: 0.62
  },

  snowDay: {
    gradient: ['#D9E5EA', '#B9CBD4', '#91AAB7'],
    textColor: '#1A2730',
    accent: '#FFFFFF',
    svg: 'snowDay',
    isNight: false,
    svgOpacity: 0.55
  },

  snowNight: {
    gradient: ['#344757', '#202F3D', '#111B25'],
    textColor: '#FFFFFF',
    accent: '#D4E1EC',
    svg: 'snowNight',
    isNight: true,
    svgOpacity: 0.58
  },

  fogDay: {
    gradient: ['#B8C7CC', '#9EAFB5', '#73878E'],
    textColor: '#FFFFFF',
    accent: '#CFD8DC',
    svg: 'fogDay',
    isNight: false,
    svgOpacity: 0.46
  },

  fogNight: {
    gradient: ['#323B42', '#22292F', '#11161A'],
    textColor: '#FFFFFF',
    accent: '#8A959D',
    svg: 'fogNight',
    isNight: true,
    svgOpacity: 0.48
  }
}

// ============================================================================
// DAY / NIGHT
// ============================================================================

export const isNightTime = (targetTime = new Date(), sunrise, sunset) => {
  if (sunrise && sunset) {
    const rise = new Date(sunrise)
    const set = new Date(sunset)

    return targetTime < rise || targetTime >= set
  }

  const hour = targetTime.getHours()

  return hour < 6 || hour >= 18
}

// ============================================================================
// WEATHER CODE → THEME
// ============================================================================

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

export const getWeatherTheme = (weatherCode, isNight = false) => {
  const key = getThemeKey(weatherCode, isNight)

  return WEATHER_THEMES[key] || WEATHER_THEMES.cloudyDay
}

// ============================================================================
// DETERMINISTIC RANDOMNESS
// ============================================================================

const seededRandom = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280

  return x - Math.floor(x)
}

const randomRange = (seed, min, max) => {
  return min + seededRandom(seed) * (max - min)
}

const edgeBiasedPosition = (
  seed,
  w,
  h,
  yMin = 0,
  yMax = 1
) => {
  const r = seededRandom(seed)
  const r2 = seededRandom(seed + 1)

  let x

  if (r < 0.6) {
    x =
      r2 > 0.5
        ? seededRandom(seed + 2) * w * 0.2
        : w - seededRandom(seed + 2) * w * 0.2
  } else {
    x = seededRandom(seed + 2) * w
  }

  const y =
    h * yMin +
    seededRandom(seed + 3) * h * (yMax - yMin)

  return { x, y }
}

// ============================================================================
// SVG HELPERS
// ============================================================================

const svg = (w, h, content, defs = '') => `
  <svg
    width="${w}"
    height="${h}"
    viewBox="0 0 ${w} ${h}"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    ${defs ? `<defs>${defs}</defs>` : ''}
    ${content}
  </svg>
`

const blurFilter = (id, amount) => `
  <filter
    id="${id}"
    x="-50%"
    y="-50%"
    width="200%"
    height="200%"
  >
    <feGaussianBlur stdDeviation="${amount}"/>
  </filter>
`

const glowFilter = (id, amount = 8) => `
  <filter
    id="${id}"
    x="-100%"
    y="-100%"
    width="300%"
    height="300%"
  >
    <feGaussianBlur
      stdDeviation="${amount}"
      result="blur"
    />
    <feMerge>
      <feMergeNode in="blur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
`

const starField = (
  count,
  seedBase,
  w,
  h,
  yMin = 0.03,
  yMax = 0.42,
  opacity = 0.45
) => {
  const stars = []

  for (let i = 0; i < count; i++) {
    const { x, y } = edgeBiasedPosition(
      i * 17 + seedBase,
      w,
      h,
      yMin,
      yMax
    )

    const radius =
      seededRandom(i * 23 + seedBase) * 1.4 + 0.35

    const starOpacity =
      opacity +
      seededRandom(i * 29 + seedBase + 1) * 0.22

    const twinkle =
      seededRandom(i * 31 + seedBase + 2) > 0.82

    if (twinkle) {
      stars.push(`
        <g opacity="${starOpacity}">
          <circle
            cx="${x}"
            cy="${y}"
            r="${radius}"
            fill="#FFFFFF"
          />
          <path
            d="
              M ${x} ${y - radius * 3}
              L ${x + radius * 0.55} ${y}
              L ${x} ${y + radius * 3}
              L ${x - radius * 0.55} ${y}
              Z
            "
            fill="#FFFFFF"
            opacity="0.55"
          />
        </g>
      `)
    } else {
      stars.push(`
        <circle
          cx="${x}"
          cy="${y}"
          r="${radius}"
          fill="#FFFFFF"
          opacity="${starOpacity}"
        />
      `)
    }
  }

  return stars.join('')
}

const cloud = (
  x,
  y,
  scale,
  fill,
  opacity,
  filter = ''
) => `
  <g
    transform="translate(${x} ${y}) scale(${scale})"
    opacity="${opacity}"
    ${filter ? `filter="url(#${filter})"` : ''}
  >
    <ellipse
      cx="0"
      cy="18"
      rx="92"
      ry="25"
      fill="${fill}"
    />
    <ellipse
      cx="-45"
      cy="8"
      rx="42"
      ry="29"
      fill="${fill}"
    />
    <ellipse
      cx="4"
      cy="-3"
      rx="47"
      ry="38"
      fill="${fill}"
    />
    <ellipse
      cx="50"
      cy="8"
      rx="40"
      ry="27"
      fill="${fill}"
    />
  </g>
`

const rainDrops = (
  count,
  seedBase,
  w,
  h,
  yMin,
  yMax,
  stroke,
  opacityMin,
  opacityMax,
  widthMin = 1.2,
  widthMax = 2
) => {
  const drops = []

  for (let i = 0; i < count; i++) {
    const { x, y } = edgeBiasedPosition(
      i * 19 + seedBase,
      w,
      h,
      yMin,
      yMax
    )

    const length = randomRange(
      i * 29 + seedBase,
      14,
      40
    )

    const drift = randomRange(
      i * 37 + seedBase,
      -7,
      -3
    )

    const opacity = randomRange(
      i * 41 + seedBase,
      opacityMin,
      opacityMax
    )

    const width = randomRange(
      i * 47 + seedBase,
      widthMin,
      widthMax
    )

    drops.push(`
      <line
        x1="${x}"
        y1="${y}"
        x2="${x + drift}"
        y2="${y + length}"
        stroke="${stroke}"
        stroke-width="${width}"
        stroke-linecap="round"
        opacity="${opacity}"
      />
    `)
  }

  return drops.join('')
}

const snowField = (
  count,
  seedBase,
  w,
  h,
  fill,
  opacityMin,
  opacityMax
) => {
  const flakes = []

  for (let i = 0; i < count; i++) {
    const { x, y } = edgeBiasedPosition(
      i * 23 + seedBase,
      w,
      h,
      0.08,
      0.98
    )

    const radius = randomRange(
      i * 31 + seedBase,
      1.3,
      4.2
    )

    const opacity = randomRange(
      i * 37 + seedBase,
      opacityMin,
      opacityMax
    )

    const detailed =
      seededRandom(i * 43 + seedBase) > 0.78

    if (detailed) {
      flakes.push(`
        <g
          transform="translate(${x} ${y})"
          opacity="${opacity}"
          stroke="${fill}"
          stroke-width="1"
          stroke-linecap="round"
        >
          <line x1="${-radius * 2}" y1="0" x2="${radius * 2}" y2="0"/>
          <line
            x1="${-radius}"
            y1="${-radius * 1.7}"
            x2="${radius}"
            y2="${radius * 1.7}"
          />
          <line
            x1="${-radius}"
            y1="${radius * 1.7}"
            x2="${radius}"
            y2="${-radius * 1.7}"
          />
        </g>
      `)
    } else {
      flakes.push(`
        <circle
          cx="${x}"
          cy="${y}"
          r="${radius}"
          fill="${fill}"
          opacity="${opacity}"
        />
      `)
    }
  }

  return flakes.join('')
}

// ============================================================================
// SVG ART
// ============================================================================

export const getSVGArt = (
  svgType,
  canvasWidth,
  canvasHeight
) => {
  const w = canvasWidth
  const h = canvasHeight

  const svgs = {

    // ========================================================================
    // CLEAR DAY
    // ========================================================================

    sunny: svg(
      w,
      h,
      `
        <ellipse
          cx="${w * 0.5}"
          cy="${h * 0.16}"
          rx="${w * 0.48}"
          ry="${h * 0.34}"
          fill="url(#sunAtmosphere)"
        />

        <g filter="url(#sunSoftGlow)">
          <circle
            cx="${w * 0.5}"
            cy="${h * 0.16}"
            r="${w * 0.075}"
            fill="#FFF4C7"
            opacity="0.82"
          />
        </g>

        <circle
          cx="${w * 0.5}"
          cy="${h * 0.16}"
          r="${w * 0.046}"
          fill="#FFFFFF"
          opacity="0.96"
        />

        <g
          transform="
            translate(${w * 0.5} ${h * 0.16})
          "
          stroke="#FFF3C4"
          stroke-linecap="round"
          opacity="0.46"
        >
          ${Array.from({ length: 12 }, (_, i) => {
            const angle =
              (i * 30 * Math.PI) / 180

            const inner = w * 0.095
            const outer = w * 0.16

            const x1 =
              Math.cos(angle) * inner
            const y1 =
              Math.sin(angle) * inner
            const x2 =
              Math.cos(angle) * outer
            const y2 =
              Math.sin(angle) * outer

            return `
              <line
                x1="${x1}"
                y1="${y1}"
                x2="${x2}"
                y2="${y2}"
                stroke-width="${i % 3 === 0 ? 3.5 : 2.5}"
                opacity="${0.55 + (i % 3) * 0.1}"
              />
            `
          }).join('')}
        </g>

        <path
          d="
            M 0 ${h * 0.68}
            C ${w * 0.2} ${h * 0.62},
              ${w * 0.36} ${h * 0.73},
              ${w * 0.55} ${h * 0.66}
            C ${w * 0.74} ${h * 0.59},
              ${w * 0.88} ${h * 0.67},
              ${w} ${h * 0.62}
            L ${w} ${h}
            L 0 ${h}
            Z
          "
          fill="#FFF3C4"
          opacity="0.035"
        />
      `,
      `
        <radialGradient
          id="sunAtmosphere"
          cx="50%"
          cy="16%"
          r="55%"
        >
          <stop
            offset="0%"
            stop-color="#FFF8DC"
            stop-opacity="0.58"
          />
          <stop
            offset="42%"
            stop-color="#FFE4A0"
            stop-opacity="0.22"
          />
          <stop
            offset="100%"
            stop-color="#FDB813"
            stop-opacity="0"
          />
        </radialGradient>

        ${glowFilter('sunSoftGlow', 10)}
      `
    ),

    // ========================================================================
    // CLEAR NIGHT
    // ========================================================================

    clearNight: svg(
      w,
      h,
      `
        <ellipse
          cx="${w * 0.76}"
          cy="${h * 0.22}"
          rx="${w * 0.25}"
          ry="${h * 0.25}"
          fill="url(#moonAtmosphere)"
        />

        <g filter="url(#moonGlow)">
          <circle
            cx="${w * 0.76}"
            cy="${h * 0.22}"
            r="${w * 0.062}"
            fill="#F7F9FF"
          />
        </g>

        <circle
          cx="${w * 0.76}"
          cy="${h * 0.22}"
          r="${w * 0.058}"
          fill="#F5F5F5"
          opacity="0.96"
        />

        <circle
          cx="${w * 0.735}"
          cy="${h * 0.202}"
          r="${w * 0.013}"
          fill="#D3D8E0"
          opacity="0.55"
        />

        <circle
          cx="${w * 0.783}"
          cy="${h * 0.238}"
          r="${w * 0.009}"
          fill="#D3D8E0"
          opacity="0.45"
        />

        <circle
          cx="${w * 0.745}"
          cy="${h * 0.246}"
          r="${w * 0.006}"
          fill="#C9CED7"
          opacity="0.35"
        />

        ${starField(
          22,
          100,
          w,
          h,
          0.035,
          0.48,
          0.38
        )}

        <path
          d="
            M 0 ${h * 0.72}
            C ${w * 0.2} ${h * 0.67},
              ${w * 0.38} ${h * 0.77},
              ${w * 0.58} ${h * 0.7}
            C ${w * 0.76} ${h * 0.64},
              ${w * 0.88} ${h * 0.72},
              ${w} ${h * 0.67}
            L ${w} ${h}
            L 0 ${h}
            Z
          "
          fill="#A0C4FF"
          opacity="0.025"
        />
      `,
      `
        <radialGradient
          id="moonAtmosphere"
          cx="50%"
          cy="50%"
          r="50%"
        >
          <stop
            offset="0%"
            stop-color="#FFFFFF"
            stop-opacity="0.42"
          />
          <stop
            offset="45%"
            stop-color="#A0C4FF"
            stop-opacity="0.16"
          />
          <stop
            offset="100%"
            stop-color="#A0C4FF"
            stop-opacity="0"
          />
        </radialGradient>

        ${glowFilter('moonGlow', 8)}
      `
    ),

    // ========================================================================
    // PARTLY CLOUDY DAY
    // ========================================================================

    partlyCloudyDay: svg(
      w,
      h,
      `
        <circle
          cx="${w * 0.73}"
          cy="${h * 0.18}"
          r="${w * 0.2}"
          fill="url(#softDayGlow)"
        />

        <circle
          cx="${w * 0.73}"
          cy="${h * 0.18}"
          r="${w * 0.046}"
          fill="#FFF7D6"
          opacity="0.9"
        />

        <g opacity="0.7">
          ${cloud(
            w * 0.72,
            h * 0.3,
            w / 900,
            '#FFFFFF',
            0.34
          )}

          ${cloud(
            w * 0.24,
            h * 0.43,
            w / 1250,
            '#FFFFFF',
            0.2,
            'cloudBlur'
          )}
        </g>

        <path
          d="
            M 0 ${h * 0.58}
            C ${w * 0.18} ${h * 0.53},
              ${w * 0.34} ${h * 0.61},
              ${w * 0.5} ${h * 0.56}
            C ${w * 0.68} ${h * 0.5},
              ${w * 0.84} ${h * 0.58},
              ${w} ${h * 0.52}
          "
          fill="none"
          stroke="#FFFFFF"
          stroke-width="${Math.max(2, w * 0.012)}"
          opacity="0.035"
        />
      `,
      `
        <radialGradient
          id="softDayGlow"
          cx="50%"
          cy="50%"
          r="50%"
        >
          <stop
            offset="0%"
            stop-color="#FFF8DC"
            stop-opacity="0.5"
          />
          <stop
            offset="100%"
            stop-color="#FFF8DC"
            stop-opacity="0"
          />
        </radialGradient>

        ${blurFilter('cloudBlur', 4)}
      `
    ),

    // ========================================================================
    // PARTLY CLOUDY NIGHT
    // ========================================================================

    partlyCloudyNight: svg(
      w,
      h,
      `
        ${starField(
          16,
          200,
          w,
          h,
          0.035,
          0.42,
          0.3
        )}

        <circle
          cx="${w * 0.76}"
          cy="${h * 0.2}"
          r="${w * 0.15}"
          fill="url(#nightMoonGlow)"
        />

        <circle
          cx="${w * 0.76}"
          cy="${h * 0.2}"
          r="${w * 0.047}"
          fill="#F2F5F8"
          opacity="0.88"
        />

        <circle
          cx="${w * 0.74}"
          cy="${h * 0.185}"
          r="${w * 0.012}"
          fill="#C7CFD8"
          opacity="0.45"
        />

        <g>
          ${cloud(
            w * 0.72,
            h * 0.34,
            w / 1050,
            '#111D28',
            0.55,
            'nightCloudBlur'
          )}

          ${cloud(
            w * 0.18,
            h * 0.42,
            w / 1350,
            '#0B141D',
            0.38,
            'nightCloudBlur'
          )}
        </g>
      `,
      `
        <radialGradient
          id="nightMoonGlow"
          cx="50%"
          cy="50%"
          r="50%"
        >
          <stop
            offset="0%"
            stop-color="#FFFFFF"
            stop-opacity="0.25"
          />
          <stop
            offset="100%"
            stop-color="#A0C4FF"
            stop-opacity="0"
          />
        </radialGradient>

        ${blurFilter('nightCloudBlur', 4)}
      `
    ),

    // ========================================================================
    // CLOUDY DAY
    // ========================================================================

    cloudyDay: svg(
      w,
      h,
      `
        ${cloud(
          w * 0.3,
          h * 0.23,
          w / 900,
          '#FFFFFF',
          0.35,
          'heavyCloudBlur'
        )}

        ${cloud(
          w * 0.76,
          h * 0.38,
          w / 1050,
          '#FFFFFF',
          0.22,
          'heavyCloudBlur'
        )}

        ${cloud(
          w * 0.52,
          h * 0.53,
          w / 1350,
          '#DCE5E9',
          0.14,
          'deepCloudBlur'
        )}

        <rect
          x="0"
          y="${h * 0.56}"
          width="${w}"
          height="${h * 0.44}"
          fill="url(#cloudHaze)"
          opacity="0.18"
        />
      `,
      `
        ${blurFilter('heavyCloudBlur', 5)}
        ${blurFilter('deepCloudBlur', 9)}

        <linearGradient
          id="cloudHaze"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop
            offset="0%"
            stop-color="#FFFFFF"
            stop-opacity="0"
          />
          <stop
            offset="100%"
            stop-color="#FFFFFF"
            stop-opacity="0.35"
          />
        </linearGradient>
      `
    ),

    // ========================================================================
    // CLOUDY NIGHT
    // ========================================================================

    cloudyNight: svg(
      w,
      h,
      `
        ${starField(
          8,
          300,
          w,
          h,
          0.03,
          0.3,
          0.18
        )}

        ${cloud(
          w * 0.3,
          h * 0.24,
          w / 900,
          '#111A22',
          0.58,
          'nightHeavyCloud'
        )}

        ${cloud(
          w * 0.75,
          h * 0.39,
          w / 1050,
          '#0B1218',
          0.5,
          'nightHeavyCloud'
        )}

        ${cloud(
          w * 0.5,
          h * 0.55,
          w / 1300,
          '#080E13',
          0.3,
          'nightDeepCloud'
        )}
      `,
      `
        ${blurFilter('nightHeavyCloud', 5)}
        ${blurFilter('nightDeepCloud', 9)}
      `
    ),

    // ========================================================================
    // RAINY DAY
    // ========================================================================

    rainyDay: svg(
      w,
      h,
      `
        <rect
          width="${w}"
          height="${h}"
          fill="url(#rainHorizon)"
          opacity="0.16"
        />

        ${cloud(
          w * 0.34,
          h * 0.18,
          w / 850,
          '#15222C',
          0.62,
          'rainCloudBlur'
        )}

        ${cloud(
          w * 0.68,
          h * 0.17,
          w / 1050,
          '#0D1820',
          0.5,
          'rainCloudBlur'
        )}

        ${cloud(
          w * 0.2,
          h * 0.32,
          w / 1250,
          '#101B23',
          0.35,
          'rainCloudDeep'
        )}

        ${rainDrops(
          42,
          400,
          w,
          h,
          0.28,
          0.96,
          '#8CC7EE',
          0.18,
          0.42,
          1,
          2
        )}

        ${rainDrops(
          14,
          460,
          w,
          h,
          0.36,
          0.92,
          '#C2E3F7',
          0.12,
          0.24,
          0.8,
          1.4
        )}

        <path
          d="
            M 0 ${h * 0.76}
            C ${w * 0.25} ${h * 0.69},
              ${w * 0.48} ${h * 0.81},
              ${w * 0.72} ${h * 0.73}
            C ${w * 0.84} ${h * 0.69},
              ${w * 0.93} ${h * 0.73},
              ${w} ${h * 0.7}
          "
          fill="none"
          stroke="#A9D5F0"
          stroke-width="${Math.max(1, w * 0.008)}"
          opacity="0.08"
        />
      `,
      `
        ${blurFilter('rainCloudBlur', 5)}
        ${blurFilter('rainCloudDeep', 9)}

        <linearGradient
          id="rainHorizon"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop
            offset="0%"
            stop-color="#B8DCF5"
            stop-opacity="0"
          />
          <stop
            offset="100%"
            stop-color="#9BC8E3"
            stop-opacity="0.45"
          />
        </linearGradient>
      `
    ),

    // ========================================================================
    // RAINY NIGHT
    // ========================================================================

    rainyNight: svg(
      w,
      h,
      `
        ${starField(
          5,
          600,
          w,
          h,
          0.03,
          0.18,
          0.1
        )}

        ${cloud(
          w * 0.34,
          h * 0.18,
          w / 850,
          '#050B10',
          0.76,
          'nightRainCloud'
        )}

        ${cloud(
          w * 0.68,
          h * 0.17,
          w / 1050,
          '#03080C',
          0.7,
          'nightRainCloud'
        )}

        ${cloud(
          w * 0.22,
          h * 0.31,
          w / 1250,
          '#02070B',
          0.55,
          'nightRainDeep'
        )}

        ${rainDrops(
          46,
          600,
          w,
          h,
          0.28,
          0.98,
          '#5A8FB8',
          0.15,
          0.35,
          1,
          1.8
        )}

        ${rainDrops(
          12,
          660,
          w,
          h,
          0.35,
          0.9,
          '#8AB6D5',
          0.08,
          0.18,
          0.8,
          1.3
        )}

        <ellipse
          cx="${w * 0.78}"
          cy="${h * 0.78}"
          rx="${w * 0.3}"
          ry="${h * 0.08}"
          fill="#5A8FB8"
          opacity="0.035"
        />
      `,
      `
        ${blurFilter('nightRainCloud', 5)}
        ${blurFilter('nightRainDeep', 9)}
      `
    ),

    // ========================================================================
    // THUNDER DAY
    // ========================================================================

    thunderDay: svg(
      w,
      h,
      `
        ${cloud(
          w * 0.3,
          h * 0.14,
          w / 820,
          '#0A0D14',
          0.72,
          'stormCloudBlur'
        )}

        ${cloud(
          w * 0.62,
          h * 0.13,
          w / 920,
          '#080B12',
          0.68,
          'stormCloudBlur'
        )}

        ${cloud(
          w * 0.43,
          h * 0.28,
          w / 1050,
          '#070A10',
          0.58,
          'stormCloudDeep'
        )}

        <path
          d="
            M ${w * 0.69} ${h * 0.28}
            L ${w * 0.64} ${h * 0.49}
            L ${w * 0.69} ${h * 0.48}
            L ${w * 0.61} ${h * 0.76}
            L ${w * 0.74} ${h * 0.46}
            L ${w * 0.68} ${h * 0.48}
            L ${w * 0.75} ${h * 0.28}
            Z
          "
          fill="#FCD34D"
          opacity="0.94"
          filter="url(#dayLightningGlow)"
        />

        <path
          d="
            M ${w * 0.69} ${h * 0.28}
            L ${w * 0.64} ${h * 0.49}
            L ${w * 0.69} ${h * 0.48}
            L ${w * 0.61} ${h * 0.76}
            L ${w * 0.74} ${h * 0.46}
            L ${w * 0.68} ${h * 0.48}
            L ${w * 0.75} ${h * 0.28}
            Z
          "
          fill="#FFF7C2"
          opacity="0.72"
        />

        ${rainDrops(
          18,
          700,
          w,
          h,
          0.42,
          0.92,
          '#6D9FC0',
          0.18,
          0.34,
          1,
          1.6
        )}

        <ellipse
          cx="${w * 0.66}"
          cy="${h * 0.5}"
          rx="${w * 0.22}"
          ry="${h * 0.24}"
          fill="#FCD34D"
          opacity="0.035"
        />
      `,
      `
        ${blurFilter('stormCloudBlur', 5)}
        ${blurFilter('stormCloudDeep', 9)}
        ${glowFilter('dayLightningGlow', 7)}
      `
    ),

    // ========================================================================
    // THUNDER NIGHT
    // ========================================================================

    thunderNight: svg(
      w,
      h,
      `
        ${starField(
          7,
          800,
          w,
          h,
          0.03,
          0.2,
          0.12
        )}

        ${cloud(
          w * 0.3,
          h * 0.14,
          w / 820,
          '#000207',
          0.86,
          'nightStormCloud'
        )}

        ${cloud(
          w * 0.62,
          h * 0.13,
          w / 920,
          '#000106',
          0.82,
          'nightStormCloud'
        )}

        ${cloud(
          w * 0.43,
          h * 0.28,
          w / 1050,
          '#000105',
          0.68,
          'nightStormDeep'
        )}

        <path
          d="
            M ${w * 0.69} ${h * 0.29}
            L ${w * 0.64} ${h * 0.5}
            L ${w * 0.69} ${h * 0.49}
            L ${w * 0.61} ${h * 0.76}
            L ${w * 0.74} ${h * 0.47}
            L ${w * 0.68} ${h * 0.49}
            L ${w * 0.75} ${h * 0.29}
            Z
          "
          fill="#FCD34D"
          opacity="0.97"
          filter="url(#nightLightningGlow)"
        />

        <path
          d="
            M ${w * 0.69} ${h * 0.29}
            L ${w * 0.64} ${h * 0.5}
            L ${w * 0.69} ${h * 0.49}
            L ${w * 0.61} ${h * 0.76}
            L ${w * 0.74} ${h * 0.47}
            L ${w * 0.68} ${h * 0.49}
            L ${w * 0.75} ${h * 0.29}
            Z
          "
          fill="#FFF9D6"
          opacity="0.82"
        />

        <path
          d="
            M ${w * 0.68} ${h * 0.31}
            L ${w * 0.58} ${h * 0.43}
            L ${w * 0.61} ${h * 0.46}
          "
          fill="none"
          stroke="#FCD34D"
          stroke-width="2"
          stroke-linecap="round"
          opacity="0.42"
        />

        <path
          d="
            M ${w * 0.76} ${h * 0.34}
            L ${w * 0.82} ${h * 0.43}
            L ${w * 0.79} ${h * 0.47}
          "
          fill="none"
          stroke="#FCD34D"
          stroke-width="1.7"
          stroke-linecap="round"
          opacity="0.3"
        />

        ${rainDrops(
          17,
          820,
          w,
          h,
          0.42,
          0.94,
          '#416D8C',
          0.14,
          0.28,
          1,
          1.5
        )}
      `,
      `
        ${blurFilter('nightStormCloud', 5)}
        ${blurFilter('nightStormDeep', 9)}
        ${glowFilter('nightLightningGlow', 10)}
      `
    ),

    // ========================================================================
    // SNOW DAY
    // ========================================================================

    snowDay: svg(
      w,
      h,
      `
        <ellipse
          cx="${w * 0.5}"
          cy="${h * 0.18}"
          rx="${w * 0.45}"
          ry="${h * 0.24}"
          fill="#FFFFFF"
          opacity="0.08"
        />

        ${cloud(
          w * 0.35,
          h * 0.18,
          w / 950,
          '#FFFFFF',
          0.34,
          'snowCloudBlur'
        )}

        ${cloud(
          w * 0.64,
          h * 0.2,
          w / 1100,
          '#FFFFFF',
          0.27,
          'snowCloudBlur'
        )}

        ${snowField(
          42,
          900,
          w,
          h,
          '#FFFFFF',
          0.42,
          0.78
        )}

        <path
          d="
            M 0 ${h * 0.78}
            C ${w * 0.2} ${h * 0.72},
              ${w * 0.42} ${h * 0.82},
              ${w * 0.62} ${h * 0.75}
            C ${w * 0.78} ${h * 0.69},
              ${w * 0.9} ${h * 0.76},
              ${w} ${h * 0.71}
            L ${w} ${h}
            L 0 ${h}
            Z
          "
          fill="#FFFFFF"
          opacity="0.055"
        />
      `,
      `
        ${blurFilter('snowCloudBlur', 5)}
      `
    ),

    // ========================================================================
    // SNOW NIGHT
    // ========================================================================

    snowNight: svg(
      w,
      h,
      `
        ${starField(
          9,
          1000,
          w,
          h,
          0.03,
          0.2,
          0.18
        )}

        ${cloud(
          w * 0.35,
          h * 0.18,
          w / 950,
          '#16212C',
          0.48,
          'snowNightCloud'
        )}

        ${cloud(
          w * 0.64,
          h * 0.2,
          w / 1100,
          '#101923',
          0.42,
          'snowNightCloud'
        )}

        ${snowField(
          40,
          1100,
          w,
          h,
          '#D4E1EC',
          0.32,
          0.64
        )}

        <ellipse
          cx="${w * 0.5}"
          cy="${h * 0.72}"
          rx="${w * 0.5}"
          ry="${h * 0.22}"
          fill="#D4E1EC"
          opacity="0.025"
        />
      `,
      `
        ${blurFilter('snowNightCloud', 5)}
      `
    ),

    // ========================================================================
    // FOG DAY
    // ========================================================================

    fogDay: svg(
      w,
      h,
      `
        <rect
          x="0"
          y="${h * 0.24}"
          width="${w}"
          height="${h * 0.13}"
          fill="url(#fogLayer)"
          opacity="0.22"
        />

        <rect
          x="0"
          y="${h * 0.39}"
          width="${w}"
          height="${h * 0.1}"
          fill="url(#fogLayer)"
          opacity="0.18"
        />

        <rect
          x="0"
          y="${h * 0.53}"
          width="${w}"
          height="${h * 0.13}"
          fill="url(#fogLayer)"
          opacity="0.16"
        />

        <rect
          x="0"
          y="${h * 0.69}"
          width="${w}"
          height="${h * 0.11}"
          fill="url(#fogLayer)"
          opacity="0.12"
        />

        <path
          d="
            M 0 ${h * 0.34}
            C ${w * 0.18} ${h * 0.3},
              ${w * 0.32} ${h * 0.38},
              ${w * 0.5} ${h * 0.33}
            C ${w * 0.7} ${h * 0.28},
              ${w * 0.85} ${h * 0.36},
              ${w} ${h * 0.31}
          "
          fill="none"
          stroke="#FFFFFF"
          stroke-width="${Math.max(8, w * 0.025)}"
          opacity="0.05"
          filter="url(#fogSoftBlur)"
        />
      `,
      `
        <linearGradient
          id="fogLayer"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            stop-color="#FFFFFF"
            stop-opacity="0"
          />
          <stop
            offset="45%"
            stop-color="#FFFFFF"
            stop-opacity="0.85"
          />
          <stop
            offset="55%"
            stop-color="#FFFFFF"
            stop-opacity="0.95"
          />
          <stop
            offset="100%"
            stop-color="#FFFFFF"
            stop-opacity="0"
          />
        </linearGradient>

        ${blurFilter('fogSoftBlur', 8)}
      `
    ),

    // ========================================================================
    // FOG NIGHT
    // ========================================================================

    fogNight: svg(
      w,
      h,
      `
        ${starField(
          5,
          1200,
          w,
          h,
          0.03,
          0.18,
          0.1
        )}

        <rect
          x="0"
          y="${h * 0.26}"
          width="${w}"
          height="${h * 0.12}"
          fill="url(#nightFogLayer)"
          opacity="0.18"
        />

        <rect
          x="0"
          y="${h * 0.42}"
          width="${w}"
          height="${h * 0.1}"
          fill="url(#nightFogLayer)"
          opacity="0.15"
        />

        <rect
          x="0"
          y="${h * 0.58}"
          width="${w}"
          height="${h * 0.12}"
          fill="url(#nightFogLayer)"
          opacity="0.12"
        />

        <rect
          x="0"
          y="${h * 0.74}"
          width="${w}"
          height="${h * 0.08}"
          fill="url(#nightFogLayer)"
          opacity="0.08"
        />

        <ellipse
          cx="${w * 0.48}"
          cy="${h * 0.58}"
          rx="${w * 0.45}"
          ry="${h * 0.16}"
          fill="#FFFFFF"
          opacity="0.018"
          filter="url(#fogNightBlur)"
        />
      `,
      `
        <linearGradient
          id="nightFogLayer"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            stop-color="#FFFFFF"
            stop-opacity="0"
          />
          <stop
            offset="50%"
            stop-color="#D8E1E7"
            stop-opacity="0.75"
          />
          <stop
            offset="100%"
            stop-color="#FFFFFF"
            stop-opacity="0"
          />
        </linearGradient>

        ${blurFilter('fogNightBlur', 10)}
      `
    )
  }

  return svgs[svgType] || svgs.sunny
}
```
