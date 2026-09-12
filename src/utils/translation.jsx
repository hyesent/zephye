// ============================================================================
// TRANSLATION SYSTEM - Supabase + LocalStorage + API Chain
// ============================================================================

import { useState, useEffect, createContext, useContext } from 'react'
import { translateText, LANG_MAP } from '../zephyeHelpers'
import { supabase } from './supabase'

// ─── UI TEXT MAP ───────────────────────────────────────────────────────
export const UI_TEXTS = {
  tabs: {
    weather: 'Weather',
    map: 'Map',
    quotes: 'Quotes',
    saved: 'Saved',
    ai: 'AI'
  },
  labels: {
    temperature: 'Temperature',
    humidity: 'Humidity',
    wind: 'Wind',
    aqi: 'AQI',
    uv: 'UV Index',
    pressure: 'Pressure',
    visibility: 'Visibility',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    location: 'Location',
    airQuality: 'Air Quality',
    hourlyForecast: 'Hourly Forecast',
    dailyForecast: '7-Day Forecast',
    weatherIntelligence: 'Weather Intelligence',
    currentLocation: 'CURRENT LOCATION',
    savedLocations: 'My Locations',
    noSavedLocations: 'No saved locations yet',
    saveFavoritePlaces: 'Save your favorite places for quick access',
    quoteOfDay: 'Quote of the Day',
    didYouKnow: 'Did You Know?',
    exploreQuotes: 'Explore Quotes',
    now: 'Now',
    feels: 'feels',
    details: 'Weather Details',
    atmosphere: 'Atmosphere',
    sky: 'Sky',
    windLabel: 'Wind',
    sun: 'Sun',
    sunshine: 'Sunshine',
    rain: 'Rain',
    thunder: 'Thunder',
    windGust: 'Wind Gust',
    feelsLike: 'Feels Like',
    live: 'LIVE',
    watching: 'Watching',
    since: 'since',
    language: 'Language',
    voice: 'Voice',
    dewPoint: 'Dew Point',
    europeanAqi: 'AQI (EU)',
    pm25: 'PM2.5',
    pm10: 'PM10',
    ozone: 'Ozone (O₃)',
    nitrogenDioxide: 'NO₂',
    carbonMonoxide: 'CO',
    sulphurDioxide: 'SO₂',
    elevation: 'elevation',
    saved: 'saved',
    myPlaces: 'My Places',
    untitled: 'Untitled Location',
    whyRecommendation: 'Why this recommendation?',
    noSavedQuotes: 'No saved quotes yet.',
    noSavedFacts: 'No saved facts yet.',
    showingWeather: 'Showing weather for',
    high: 'High',
    low: 'Low',
    todayIn: 'Today in',
    next12Hours: 'Next 12 Hours',
    feelsShort: 'Feels',
    chance: 'chance',
    quote: 'Quote',
    fact: 'Fact',
    update: 'Update',
    new: 'New',
    improvements: 'Improvements',
    fixes: 'Fixes'
  },
  buttons: {
    save: 'Save',
    share: 'Share',
    delete: 'Delete',
    edit: 'Edit',
    speak: 'Speak',
    copy: 'Copy',
    cancel: 'Cancel',
    search: 'Search',
    gotIt: 'Got it',
    viewAll: 'View All →',
    newQuote: 'New Quote',
    newFact: 'New Fact',
    addLocation: 'Add Location',
    addAnother: 'Add Another Location',
    back: 'Back to my location',
    backToOriginal: 'Back to original location',
    done: 'Done',
    loading: 'Loading...',
    searching: 'Searching...',
    shareAsImage: 'Share as Image',
    downloadImage: 'Download Image',
    shareAsText: 'Share as Text',
    copyClipboard: 'Copy to Clipboard',
    copied: 'Copied!',
    generating: 'Generating...',
    female: 'Female',
    male: 'Male',
    showOriginal: 'Show Original',
    hideOriginal: 'Hide Original',
    reporter: 'Reporter',
    assistant: 'Assistant',
    you: 'You',
    brief: 'Brief',
    full: 'Full',
    speaking: 'Zephye is Speaking...',
    beginBriefing: 'Begin Weather Briefing',
    manual: 'Manual',
    autoCurrent: 'Auto (current)',
    useMyLocation: 'Use My Current Location',
    refresh: 'Refresh',
    setYourName: 'Set Your Name',
    saveName: 'Save',
    shareWeather: 'Share Weather',
    shareCurrent: 'Current',
    shareToday: 'Today',
    shareHourly: 'Hourly',
    shareSingleHour: 'Single Hour',
    shareWeekly: 'Weekly',
    pickHour: 'Pick an hour',
    why: 'Why?',
    hideDetails: 'Hide details',
    moreDetails: 'More details',
    showLess: 'Show less',
    next: 'Next',
    previous: 'Previous',
    skip: 'Skip',
    seeWhatsNew: "See what's new",
    close: 'Close'
  },
  placeholders: {
    searchCity: 'Type any city, LGA, country...',
    typePlace: 'Type a place name',
    askZephye: 'Ask Zephye...',
    locationName: 'Home, Work, etc...',
    searchLocation: 'Search city...',
    enterYourName: 'Enter your name'
  },
  toasts: {
    locationUpdated: 'Location updated',
    quoteSaved: 'Quote saved',
    factSaved: 'Fact saved',
    locationRemoved: 'Location removed',
    quoteDeleted: 'Quote deleted',
    factDeleted: 'Fact deleted',
    alreadySaved: 'Already saved',
    locationDenied: 'Location denied',
    placeNotFound: 'Place not found',
    searchFailed: 'Search failed',
    weatherFailed: 'Weather failed',
    welcome: 'Welcome to Zephye',
    detecting: 'Detecting your location...',
    gpsUnavailable: 'Location unavailable. Try again or use Manual.',
    locationSaved: 'Location saved. Edit label to name it.',
    typePlace: 'Type a place name',
    locationSuccess: 'Location',
    savedAs: 'Saved as',
    updatedTo: 'Location updated to'
  },
  modals: {
    changeLocation: 'Change Location',
    myLocations: 'My Locations',
    shareQuote: 'Share Quote',
    shareFact: 'Share Fact',
    hourlyForecast: 'Hourly Forecast',
    mapFeatures: 'Map Features',
    mapUpgrade: 'Undergoing Upgrade',
    mapDescription: 'Some map features are being enhanced. Core functionality is still available.',
    howToUse: 'How to use:',
    singleTap: 'Single tap',
    singleTapDesc: 'Weather data',
    doubleTap: 'Double tap',
    doubleTapDesc: 'Pollen data',
    longPress: 'Long press / Right click',
    longPressDesc: 'Route calculation',
    trafficTab: 'Traffic tab',
    trafficTabDesc: 'Live traffic + incidents',
    coordinates: 'Coordinates',
    name: 'Name',
    searchPlace: 'Search place',
    currentCoords: 'Current',
    currentLocationLabel: 'CURRENT LOCATION',
    zephyeGreeting: 'Zephye will greet you by name in the briefing'
  },
  greetings: {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    howCanIHelp: 'How can I help you today?'
  },
  chat: {
    thinking: 'Thinking...',
    howCanIHelp: 'How can I help you today?',
    weatherIntelligence: 'Weather Intelligence',
    askStargazing: 'Ask "stargazing tonight"',
    tryWear: 'Try "what should I wear"',
    askRain: 'Ask "will it rain"',
    compareToday: 'Compare "today vs tomorrow"',
    askBiking: 'Ask "biking vs running today?"',
    tryDrive: 'Try "drive or bike to work?"'
  },
  weather: {
    clear: 'Clear',
    mainlyClear: 'Mainly Clear',
    partlyCloudy: 'Partly Cloudy',
    overcast: 'Overcast',
    fog: 'Fog',
    lightDrizzle: 'Light Drizzle',
    moderateDrizzle: 'Moderate Drizzle',
    heavyDrizzle: 'Heavy Drizzle',
    lightRain: 'Light Rain',
    moderateRain: 'Moderate Rain',
    heavyRain: 'Heavy Rain',
    lightSnow: 'Light Snow',
    moderateSnow: 'Moderate Snow',
    heavySnow: 'Heavy Snow',
    rainShowers: 'Rain Showers',
    heavyShowers: 'Heavy Showers',
    violentShowers: 'Violent Showers',
    thunderstorm: 'Thunderstorm',
    heavyThunderstorm: 'Heavy Thunderstorm',
    severeThunderstorm: 'Severe Thunderstorm',
    heavyStorm: 'Heavy Storm',
    unknown: 'Unknown'
  },
  quoteCategories: {
    all: 'All',
    motivational: 'Motivational',
    success: 'Success',
    wisdom: 'Wisdom',
    love: 'Love'
  },
  factCategories: {
    all: 'All',
    science: 'Science',
    history: 'History',
    animals: 'Animals',
    space: 'Space'
  },
  map: {
    weather: 'Weather',
    pollen: 'Pollen',
    traffic: 'Traffic',
    loadingMap: 'Loading map...',
    mapboxTraffic: 'Mapbox Traffic',
    noIncidents: 'No incidents',
    free: 'Free',
    moderate: 'Moderate',
    heavy: 'Heavy',
    noIncidentsReported: 'No traffic incidents reported',
    incidentReported: 'incident',
    incidentsReported: 'incidents',
    route: 'Route',
    loadingWeather: 'Loading weather...',
    loadingPollen: 'Loading pollen...',
    calculatingRoute: 'Calculating route...',
    routeNotFound: 'Route not found',
    noWeatherData: 'No weather data',
    noPollenData: 'No pollen data',
    pollenLevels: 'Pollen Levels',
    pollenHeatmap: 'Pollen Heatmap',
    low: 'Low',
    medium: 'Med',
    high: 'High',
    tapForWeather: 'Tap for weather · Double tap for pollen · Long press for route',
    longPressForRoute: 'Long press for route',
    doubleTapForPollen: 'Double tap for pollen · Long press for route',
    updatingIncidents: 'Updating incidents...',
    openMeteoCredit: 'Open-Meteo Air Quality (free)',
    routeCredit: 'OpenRouteService · Driving'
  },
  share: {
    via: 'via',
    weatherFor: 'Weather for',
    location: 'Location',
    footerBrand: '✦ Zephye',
    footerUrl: 'zephye.vercel.app',
    cardTypeCurrent: 'Current',
    cardTypeToday: 'Today',
    cardTypeHourly: 'Hourly',
    cardTypeSingleHour: 'Single Hour',
    cardTypeWeekly: 'Weekly'
  }
}

// ─── WHAT'S NEW CONTENT ────────────────────────────────────────────────
export const WHATS_NEW = {
  version: '2.0.0',
  date: '2026-01-15',
  title: "What's New in Zephye",
  sections: [
    {
      icon: '🌍',
      title: 'Multi-Language Support',
      description: 'Zephye now speaks your language. Every part of the interface translates automatically based on your home location.',
      highlights: [
        'Auto-detects language from your location',
        'Shared global translation cache for instant loading',
        'Choose your home location to lock in your preferred language'
      ]
    },
    {
      icon: '📤',
      title: 'Weather Sharing',
      description: 'Share the current weather, today summary, hourly, or weekly forecast as beautiful cards.',
      highlights: [
        'Current weather card with temperature, AQI, and metrics',
        'Today summary with sun hours, rain periods, and more',
        'Hourly and single-hour shares',
        'Weekly 7-day forecast card',
        'Custom weather-themed gradients'
      ]
    },
    {
      icon: '🎙',
      title: 'Voice Auto-Mapping',
      description: 'The AI briefing voice now matches your location automatically.',
      highlights: [
        'Voice changes when you switch locations',
        'Female and male voice options',
        'Manual override if you prefer a different voice'
      ]
    },
    {
      icon: '📍',
      title: 'Smarter Locations',
      description: 'Manage your saved places with more control.',
      highlights: [
        'Manual or GPS auto-locate for each saved place',
        'Elevation info for saved locations',
        'Prevents duplicate saves (auto-numbers them)'
      ]
    },
    {
      icon: '💨',
      title: 'Air Quality Breakdown',
      description: 'See the full air quality picture, not just the AQI number.',
      highlights: [
        'PM2.5, PM10, Ozone, NO₂, CO, SO₂ breakdown',
        'European AQI alongside US AQI',
        'Dew point for better comfort estimation'
      ]
    }
  ]
}

// ─── LOCALSTORAGE CACHE ────────────────────────────────────────────────
const LOCAL_CACHE_KEY = 'zephye_ui_translations'
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000

const getLocalCache = (lang) => {
  try {
    const key = `${LOCAL_CACHE_KEY}_${lang}`
    const cached = localStorage.getItem(key)
    if (!cached) return null
    const data = JSON.parse(cached)
    if (Date.now() - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key)
      return null
    }
    return data.translations
  } catch {
    return null
  }
}

const setLocalCache = (lang, translations) => {
  try {
    const key = `${LOCAL_CACHE_KEY}_${lang}`
    localStorage.setItem(key, JSON.stringify({
      translations,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.warn('LocalStorage cache failed:', e)
  }
}

// ─── FLATTEN HELPER ────────────────────────────────────────────────────
const flattenUITexts = () => {
  const items = []
  const flatten = (obj, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'object' && value !== null) {
        flatten(value, fullKey)
      } else {
        items.push({ key: fullKey, text: value })
      }
    }
  }
  flatten(UI_TEXTS)
  return items
}

// ─── SUPABASE FETCH ────────────────────────────────────────────────────
const fetchFromSupabase = async (language) => {
  try {
    const { data, error } = await supabase
      .from('ui_translations')
      .select('text_key, translated_text')
      .eq('language', language)

    if (error) throw error
    if (!data || data.length === 0) return null

    const translations = {}
    data.forEach(item => {
      translations[item.text_key] = item.translated_text
    })
    return translations
  } catch (err) {
    console.warn('Supabase fetch failed:', err)
    return null
  }
}

// ─── SUPABASE SAVE (AUTO - FIRST TIME ONLY) ────────────────────────────
const saveToSupabase = async (language, countryCode, translated, originals) => {
  try {
    const rows = Object.keys(translated).map(key => ({
      language,
      country_code: countryCode || null,
      text_key: key,
      original_text: originals[key] || key.split('.').pop(),
      translated_text: translated[key]
    }))

    const batchSize = 100
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
      const { error } = await supabase
        .from('ui_translations')
        .insert(batch)

      if (error) {
        if (error.code === '23505') {
          console.log('✅ Already saved by another user (race handled)')
          return true
        }
        throw error
      }
    }

    console.log(`💾 Saved ${rows.length} translations to Supabase for ${language}`)
    return true
  } catch (err) {
    console.warn('Supabase save failed:', err)
    return false
  }
}

// ─── TRANSLATION HOOK ──────────────────────────────────────────────────
export const useTranslation = (uiLanguage, countryCode = null) => {
  const [translations, setTranslations] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTranslations = async () => {
      if (uiLanguage === 'en') {
        setTranslations({})
        setIsLoading(false)
        return
      }

      // STEP 1: localStorage
      const local = getLocalCache(uiLanguage)
      if (local) {
        setTranslations(local)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      // STEP 2: Supabase (shared global cache)
      const remote = await fetchFromSupabase(uiLanguage)

      if (remote && Object.keys(remote).length > 0) {
        setLocalCache(uiLanguage, remote)
        setTranslations(remote)
        setIsLoading(false)
        return
      }

      // STEP 3: Translate fresh (first time ever for this language)
      const items = flattenUITexts()
      const originals = {}
      items.forEach(item => { originals[item.key] = item.text })

      const results = await Promise.all(
        items.map(item =>
          translateText(item.text, uiLanguage).catch(() => item.text)
        )
      )

      const translated = {}
      items.forEach((item, index) => {
        translated[item.key] = results[index]
      })

      setLocalCache(uiLanguage, translated)
      saveToSupabase(uiLanguage, countryCode, translated, originals)

      setTranslations(translated)
      setIsLoading(false)
    }

    loadTranslations()
  }, [uiLanguage, countryCode])

  const t = (key) => {
    if (uiLanguage === 'en') {
      const parts = key.split('.')
      const last = parts[parts.length - 1]
      return last.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
    }
    return translations[key] || key.split('.').pop()
  }

  return { t, isLoading, translations }
}

// ─── TRANSLATE SHARE TEXT ──────────────────────────────────────────────
// Use for share cards where content needs translation before canvas draw
export const useShareTranslation = (uiLanguage) => {
  const { translations, isLoading } = useTranslation(uiLanguage)

  // Translate a raw string using the same cache/lookup
  const tShare = (key) => {
    if (uiLanguage === 'en') {
      const parts = key.split('.')
      const last = parts[parts.length - 1]
      return last.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
    }
    return translations[key] || key.split('.').pop()
  }

  // Translate arbitrary text on the fly (uses Supabase + API chain)
  const translateDynamic = async (text) => {
    if (uiLanguage === 'en' || !text) return text
    try {
      return await translateText(text, uiLanguage)
    } catch {
      return text
    }
  }

  return { tShare, translateDynamic, isLoading }
}

// ─── LANGUAGE CONTEXT ──────────────────────────────────────────────────
const LanguageContext = createContext()

export const LanguageProvider = ({ children, homeLocation }) => {
  const [uiLanguage, setUILanguage] = useState('en')

  useEffect(() => {
    const override = localStorage.getItem('zephye_ui_language_override')
    if (override) {
      setUILanguage(override)
      return
    }

    if (homeLocation) {
      if (homeLocation.country_code === 'NG') {
        setUILanguage('en')
        return
      }
      const lang = LANG_MAP?.[homeLocation.country_code] || 'en'
      setUILanguage(lang)
    }
  }, [homeLocation])

  const overrideLanguage = (lang) => {
    setUILanguage(lang)
    localStorage.setItem('zephye_ui_language_override', lang)
  }

  const resetToHomeLanguage = () => {
    localStorage.removeItem('zephye_ui_language_override')
    if (homeLocation && homeLocation.country_code !== 'NG') {
      setUILanguage(LANG_MAP?.[homeLocation.country_code] || 'en')
    } else {
      setUILanguage('en')
    }
  }

  return (
    <LanguageContext.Provider value={{
      uiLanguage,
      setUILanguage: overrideLanguage,
      resetToHomeLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
