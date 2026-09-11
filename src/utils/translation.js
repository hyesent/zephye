// ============================================================================
// TRANSLATION SYSTEM - Supabase + LocalStorage + API Chain
// ============================================================================

import { useState, useEffect, createContext, useContext } from 'react'
import { translateText, LANG_MAP } from '../zephyeHelpers'
import { supabase } from './supabase'

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// UI TEXT MAP
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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
    watching: 'Watching'
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
    done: 'Done',
    loading: 'Loading...',
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
    brief: 'Brief',
    full: 'Full',
    you: 'You',
    beginBriefing: 'Begin Weather Briefing',
    speaking: 'Zephye is Speaking...',
    manual: 'Manual',
    autoCurrent: 'Auto (current)',
    useMyLocation: 'Use My Current Location',
    refresh: 'Refresh',
    setYourName: 'Set Your Name',
    saveName: 'Save'
  },
  placeholders: {
    searchCity: 'Type any city, LGA, country...',
    typePlace: 'Type a place name',
    askZephye: 'Ask Zephye...',
    locationName: 'Home, Work, etc...',
    searchLocation: 'Search city, LGA, country...',
    enterYourName: 'Enter your name'
  },
  toasts: {
    locationUpdated: 'Location updated',
    quoteSaved: 'Quote saved',
    factSaved: 'Fact saved',
    locationRemoved: 'Location removed',
    alreadySaved: 'Already saved',
    locationDenied: 'Location denied',
    placeNotFound: 'Place not found',
    searchFailed: 'Search failed',
    weatherFailed: 'Weather failed',
    welcome: 'Welcome to Zephye',
    detecting: 'Detecting your location...',
    gpsUnavailable: 'Location unavailable. Try again or use Manual.',
    locationSaved: 'Location saved. Edit label to name it.'
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
    weatherIntelligence: 'Weather Intelligence'
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
    incidentReported: 'incident reported',
    incidentsReported: 'incidents reported',
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
    freeFlow: 'Free',
    moderateFlow: 'Moderate',
    heavyFlow: 'Heavy'
  }
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// LOCALSTORAGE CACHE
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// FLATTEN HELPER
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// SUPABASE FETCH
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// SUPABASE SAVE (AUTO - FIRST TIME ONLY)
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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
        // Duplicate = another user already saved
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

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// TRANSLATION HOOK
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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
        console.log(`📦 [${uiLanguage}] Loaded from localStorage`)
        setTranslations(local)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      // STEP 2: Supabase (shared global cache)
      console.log(`🔍 [${uiLanguage}] Checking Supabase...`)
      const remote = await fetchFromSupabase(uiLanguage)

      if (remote && Object.keys(remote).length > 0) {
        console.log(`🌐 [${uiLanguage}] Loaded from Supabase (${Object.keys(remote).length} keys)`)
        setLocalCache(uiLanguage, remote)
        setTranslations(remote)
        setIsLoading(false)
        return
      }

      // STEP 3: Translate fresh (first time ever for this language)
      console.log(`🔄 [${uiLanguage}] First time. Translating fresh...`)

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

      // STEP 4: Save to localStorage
      setLocalCache(uiLanguage, translated)

      // STEP 5: Save to Supabase (fire and forget)
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

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// LANGUAGE CONTEXT
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

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
