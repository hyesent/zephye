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
    uvPeak: 'UV Peak',
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
    fixes: 'Fixes',

    // 🆕 Added — ZephyeFullScreen fallbacks
    yourLocation: 'Your location',
    city: 'City',
    friend: 'there'
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
    notNow: 'Not now',
    seeWhatsNew: "See what's new",
    close: 'Close',
    shareNotSupported: 'Web Share API not supported. Please use "Download Image".',
    cannotShareImage: 'Cannot share image on this device. Please use "Download Image".',

    // 🆕 Added — ZephyeFullScreen tooltips
    stop: 'Stop',
    voiceInput: 'Voice input'
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
    howCanIHelp: 'How can I help you today?',

    // 🆕 Added — ZephyeFullScreen fallback
    hello: 'Hello'
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
    tryDrive: 'Try "drive or bike to work?"',
    typeSchedules: 'Type "schedules" to manage reminders'
  },
  weather: {
    sunny: 'Sunny',
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
  aqi: {
    good: 'Good',
    moderate: 'Moderate',
    unhealthy: 'Unhealthy',
    hazardous: 'Hazardous',
    unknown: 'Unknown'
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
    routeCredit: 'OpenRouteService · Driving',
    rainLikely: 'Rain likely {range}',
    around: 'around',
    weekSummary: 'Mostly dry week ahead. Great for outdoor plans!'
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
  },
  zephye: {
    hereIsWhatIFound: "Here's what I found",
    hereIsWhatIFoundAbout: "Here's what I found about",
    checkFullDetails: 'Check the full details below.',
    multipleTopics: 'Multiple topics covered. Check each section below for details.',
    errorGettingAdvice: 'Error getting advice. Current temp is',
    withCondition: 'with',
    vsLabel: 'vs',
    comparison: 'Comparison',
    locationComparison: 'Location Comparison'
  },
  schedule: {
    menuItem: 'Schedules',
    title: 'Schedules',
    newSchedule: 'New Schedule',
    editSchedule: 'Edit Schedule',
    result: 'Result',
    tabPending: 'Pending',
    tabFired: 'Fired',
    tabHistory: 'History',
    noPending: 'No pending schedules',
    noFired: 'No fired schedules',
    noHistory: 'No history yet',
    noPendingDesc: 'Schedule an ask to get notified at the right time.',
    noFiredDesc: 'Fired schedules will appear here when they trigger.',
    noHistoryDesc: 'Completed and cancelled schedules will show here.',
    newScheduledAsk: 'New Scheduled Ask',
    whatAsking: 'What are you asking?',
    whatAskingPlaceholder: 'e.g. Going to an event in Lagos',
    includeInResult: 'Include in the result',
    destination: 'Destination',
    selectDestination: 'Select a destination...',
    from: 'From',
    date: 'Date',
    time: 'Time',
    fireReminder: 'Fire reminder',
    scheduleAsk: 'Schedule Ask',
    saveChanges: 'Save Changes',
    deleteConfirm: 'Delete this scheduled ask?',
    home: 'Home',
    done: 'Done',
    shift: 'Shift',
    cancel: 'Cancel',
    min15: '15 min before',
    min30: '30 min before',
    hour1: '1 hour before',
    hours2: '2 hours before',
    day1: '1 day before',
    viewResult: 'View Result',
    remove: 'Remove',
    firesIn: 'Fires in',
    fired: 'Fired',
    ready: 'Schedule Ready',
    viewFull: 'View Full',
    hideFull: 'Hide Full',
    openInChat: 'Open in chat',
    of: 'of',
    yourScheduledCheck: 'Your scheduled check is ready.',
    shiftToWhen: 'Shift to when?',
    original: 'Original',
    min15Plus: '+15 min',
    min30Plus: '+30 min',
    hour1Plus: '+1 hour',
    hours2Plus: '+2 hours',
    day1Plus: '+1 day',
    week1Plus: '+1 week',
    confirm: 'Confirm',
    scheduleThisAsk: 'Schedule this ask?',
    firesAutomatically: 'Fires automatically',
    setUp: 'Set up',
    errQuestion: 'Please describe what you want to schedule.',
    errPills: 'Select at least one pill.',
    errDestination: 'Please pick a destination.',
    errDateTime: 'Please pick a date and time.',
    errInvalidDateTime: 'Invalid date or time.',
    errFutureTime: 'Target time must be in the future.',
    errDestinationSaved: 'Destination must be a saved location.',
    errFrom: 'Please pick an origin for the route.',
    pillRoute: 'Route',
    pillTraffic: 'Traffic',
    pillWeather: 'Weather',
    pillClothing: 'Clothing',
    pillEvents: 'Events',
    pillSports: 'Sports',
    pillHealth: 'Health',
    pillDriving: 'Driving',
    pillPets: 'Pets',
    pillEnergy: 'Energy',
    pillStargazing: 'Stargazing',
    pillFarming: 'Farming',
    pillPhotography: 'Photography',
    pillLifestyle: 'Lifestyle',
    pillDIY: 'DIY',
    pillTravel: 'Travel',
    pillBeauty: 'Beauty',
    statusPending: 'PENDING',
    statusFired: 'FIRED',
    statusDone: 'DONE',
    statusCancelled: 'CANCELLED',
    statusDismissed: 'DISMISSED',
    statusMissed: 'MISSED',
    statusShifted: 'SHIFTED',
    statusEdited: 'EDITED',

    // 🆕 Added — from ScheduleAskPanel.jsx
    recOnce: 'Once',
    recDaily: 'Daily',
    recWeekdays: 'Weekdays',
    recWeekends: 'Weekends',
    recWeekly: 'Weekly',
    recCustom: 'Custom',
    dayMon: 'Mon',
    dayTue: 'Tue',
    dayWed: 'Wed',
    dayThu: 'Thu',
    dayFri: 'Fri',
    daySat: 'Sat',
    daySun: 'Sun',
    recurrence: 'Recurrence',
    until: 'Until',
    askNowToo: 'Ask now too',
    extraLocations: 'Extra locations',
    addAnother: 'Add another location',
    daySnapshotHint: 'Day-shifted language detected — will resolve to the actual calendar day when fired.',
    noResult: 'No result yet',
    errNoHomeSet: 'Please set a home location first, or save at least one location.',

    // 🆕 Added — from ScheduleToast.jsx
    moreLocations: 'more locations',
    cancelPromptTitle: 'Cancel this schedule?',
    cancelPromptSubtitle: 'This is a recurring schedule. Cancel just this one, or the entire chain?',
    cancelOne: 'Just this one',
    cancelAll: 'Entire chain',
    daySnapshotBadge: 'Day snapshot',
    routeBadge: 'Route',
    multiBadge: 'Multi',

    // 🆕 Added — from ZephyeFullScreen.jsx
    detectedFutureTime: 'Detected future time',
    askResult: 'Scheduled ask result'
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
    },
    {
      icon: '⏰',
      title: 'Scheduled Asks',
      description: 'Schedule any question to fire automatically at the right time.',
      highlights: [
        'Pick pills for routing, traffic, weather, and more',
        'Fires as a toast notification at your chosen time',
        'Done, Edit, Shift, Cancel, or Dismiss when it fires',
        'Type "schedules" to manage all reminders'
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

// ─── LOOKUP ENGLISH TEXT (walks UI_TEXTS) ──────────────────────────────
const lookupEnglishText = (key) => {
  const parts = key.split('.')
  let current = UI_TEXTS

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      const last = parts[parts.length - 1]
      return last
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, s => s.toUpperCase())
        .trim()
    }
  }

  return typeof current === 'string' ? current : key.split('.').pop()
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

  // ─── CORRECTED t() ──────────────────────────────────────────────────
  const t = (key) => {
    if (uiLanguage === 'en') {
      return lookupEnglishText(key)
    }
    return translations[key] || lookupEnglishText(key)
  }

  return { t, isLoading, translations }
}

// ─── TRANSLATE SHARE TEXT ──────────────────────────────────────────────
export const useShareTranslation = (uiLanguage) => {
  const { translations, isLoading } = useTranslation(uiLanguage)

  // ─── CORRECTED tShare() ─────────────────────────────────────────────
  const tShare = (key) => {
    if (uiLanguage === 'en') {
      return lookupEnglishText(key)
    }
    return translations[key] || lookupEnglishText(key)
  }

  // Translate arbitrary text on the fly
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
