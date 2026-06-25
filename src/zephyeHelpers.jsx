import { useState } from 'react'

export const LANG_MAP = {
  US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en', NG: 'en', KE: 'en', ZA: 'en', TZ: 'en', PH: 'en', SG: 'en', HK: 'en',
  FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  DE: 'de', AT: 'de',
  IT: 'it',
  BR: 'pt', PT: 'pt',
  DK: 'da', SE: 'sv', NO: 'no', FI: 'fi',
  NL: 'nl', PL: 'pl', RU: 'ru', TR: 'tr',
  SA: 'ar', AE: 'ar', EG: 'ar',
  IN: 'hi',
  JP: 'ja',
  CN: 'zh', TW: 'zh',
  KR: 'ko'
}

// Full VOICE_MAP matching your 78-voice backend
export const VOICE_MAP = {
  // English variants by country
  en_US: { male: 'en-US-GuyNeural', female: 'en-US-JennyNeural' },
  en_GB: { male: 'en-GB-RyanNeural', female: 'en-GB-SoniaNeural' },
  en_CA: { male: 'en-CA-LiamNeural', female: 'en-CA-ClaraNeural' },
  en_AU: { male: 'en-AU-WilliamNeural', female: 'en-AU-NatashaNeural' },
  en_NZ: { male: 'en-NZ-MitchellNeural', female: 'en-NZ-MollyNeural' },
  en_IE: { male: 'en-IE-ConorNeural', female: 'en-IE-EmilyNeural' },
  en_NG: { male: 'en-NG-AbeoNeural', female: 'en-NG-EzinneNeural' },
  en_KE: { male: 'en-KE-ChilembaNeural', female: 'en-KE-AsiliaNeural' },
  en_ZA: { male: 'en-ZA-LukeNeural', female: 'en-ZA-LeahNeural' },
  en_TZ: { male: 'en-TZ-ElimuNeural', female: 'en-TZ-ImaniNeural' },
  en_PH: { male: 'en-PH-JamesNeural', female: 'en-PH-RosaNeural' },
  en_SG: { male: 'en-SG-WayneNeural', female: 'en-SG-LunaNeural' },
  en_HK: { male: 'en-HK-SamNeural', female: 'en-HK-YanNeural' },
  en_IN: { male: 'en-IN-PrabhatNeural', female: 'en-IN-NeerjaNeural' },

  // Other languages
  fr: { male: 'fr-FR-HenriNeural', female: 'fr-FR-DeniseNeural' },
  es: { male: 'es-ES-AlvaroNeural', female: 'es-ES-ElviraNeural' },
  es_MX: { male: 'es-MX-JorgeNeural', female: 'es-MX-DaliaNeural' },
  es_AR: { male: 'es-AR-TomasNeural', female: 'es-AR-ElenaNeural' },
  de: { male: 'de-DE-ConradNeural', female: 'de-DE-KatjaNeural' },
  it: { male: 'it-IT-DiegoNeural', female: 'it-IT-ElsaNeural' },
  pt: { male: 'pt-PT-DuarteNeural', female: 'pt-PT-RaquelNeural' },
  pt_BR: { male: 'pt-BR-AntonioNeural', female: 'pt-BR-FranciscaNeural' },
  da: { male: 'da-DK-JeppeNeural', female: 'da-DK-ChristelNeural' },
  sv: { male: 'sv-SE-MattiasNeural', female: 'sv-SE-SofieNeural' },
  no: { male: 'nb-NO-FinnNeural', female: 'nb-NO-IselinNeural' },
  fi: { male: 'fi-FI-HarriNeural', female: 'fi-FI-NooraNeural' },
  nl: { male: 'nl-NL-MaartenNeural', female: 'nl-NL-FennaNeural' },
  pl: { male: 'pl-PL-MarekNeural', female: 'pl-PL-ZofiaNeural' },
  ru: { male: 'ru-RU-DmitryNeural', female: 'ru-RU-SvetlanaNeural' },
  tr: { male: 'tr-TR-AhmetNeural', female: 'tr-TR-EmelNeural' },
  ar: { male: 'ar-SA-HamedNeural', female: 'ar-SA-ZariyahNeural' },
  ar_EG: { male: 'ar-EG-ShakirNeural', female: 'ar-EG-SalmaNeural' },
  hi: { male: 'hi-IN-MadhurNeural', female: 'hi-IN-SwaraNeural' },
  ja: { male: 'ja-JP-KeitaNeural', female: 'ja-JP-NanamiNeural' },
  zh: { male: 'zh-CN-YunxiNeural', female: 'zh-CN-XiaoxiaoNeural' },
  ko: { male: 'ko-KR-InJoonNeural', female: 'ko-KR-SunHiNeural' }
}

const GREETINGS = {
  en: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
  fr: { morning: 'Bonjour', afternoon: 'Bon après-midi', evening: 'Bonsoir' },
  es: { morning: 'Buenos días', afternoon: 'Buenas tardes', evening: 'Buenas noches' },
  de: { morning: 'Guten Morgen', afternoon: 'Guten Tag', evening: 'Guten Abend' },
  it: { morning: 'Buongiorno', afternoon: 'Buon pomeriggio', evening: 'Buonasera' },
  pt: { morning: 'Bom dia', afternoon: 'Boa tarde', evening: 'Boa noite' },
  da: { morning: 'Godmorgen', afternoon: 'Goddag', evening: 'Godaften' },
  sv: { morning: 'God morgon', afternoon: 'God eftermiddag', evening: 'God kväll' },
  no: { morning: 'God morgen', afternoon: 'God ettermiddag', evening: 'God kveld' },
  fi: { morning: 'Hyvää huomenta', afternoon: 'Hyvää iltapäivää', evening: 'Hyvää iltaa' },
  nl: { morning: 'Goedemorgen', afternoon: 'Goedemiddag', evening: 'Goedenavond' },
  pl: { morning: 'Dzień dobry', afternoon: 'Dzień dobry', evening: 'Dobry wieczór' },
  ru: { morning: 'Dobroye utro', afternoon: 'Dobryy den\'', evening: 'Dobryy vecher' },
  tr: { morning: 'Günaydın', afternoon: 'Tünaydın', evening: 'İyi akşamlar' },
  ar: { morning: 'Sabah alkhayr', afternoon: 'Masa\' alkhayr', evening: 'Masa\' alkhayr' },
  hi: { morning: 'Shubh prabhat', afternoon: 'Shubh dopahar', evening: 'Shubh sandhya' },
  ja: { morning: 'Ohayō', afternoon: 'Konnichiwa', evening: 'Konbanwa' },
  zh: { morning: 'Zǎo shang hǎo', afternoon: 'Xià wǔ hǎo', evening: 'Wǎn shàng hǎo' },
  ko: { morning: 'Jo-eun achim', afternoon: 'Annyeonghaseyo', evening: 'Jo-eun jeonyeok' }
}

export function getLang(countryCode) {
  return LANG_MAP[countryCode] || 'en'
}

export function getGreeting(timezone, lang = 'en') {
  const hour = parseInt(new Intl.DateTimeFormat('en', {
    hour: 'numeric', hour12: false, timeZone: timezone
  }).format(new Date()))

  const timeOfDay = hour < 12? 'morning' : hour < 18? 'afternoon' : 'evening'
  return GREETINGS[lang]?.[timeOfDay] || GREETINGS.en[timeOfDay]
}

export function getVoiceForLocation(selectedVoice, countryCode, genderPref = 'female') {
  // If user already picked a voice, respect it
  if (selectedVoice && selectedVoice!== 'auto') return selectedVoice

  const lang = getLang(countryCode)

  // Build key for country-specific overrides
  let voiceKey = lang

  // English: use country accent
  if (lang === 'en') voiceKey = `en_${countryCode}`
  // Portuguese: BR override
  if (lang === 'pt' && countryCode === 'BR') voiceKey = 'pt_BR'
  // Spanish: MX/AR overrides
  if (lang === 'es' && countryCode === 'MX') voiceKey = 'es_MX'
  if (lang === 'es' && countryCode === 'AR') voiceKey = 'es_AR'
  // Arabic: EG override
  if (lang === 'ar' && countryCode === 'EG') voiceKey = 'ar_EG'

  const voiceSet = VOICE_MAP[voiceKey] || VOICE_MAP[lang] || VOICE_MAP.en_US
  return voiceSet[genderPref] || voiceSet.female
}

export function useWeatherChat() {
  const [isLoading, setIsLoading] = useState(false)

  async function askWeather(question, weather, location, lang) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/weather-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, weather, location, lang })
      })
      const { answer } = await res.json()
      setIsLoading(false)
      return answer
    } catch (e) {
      setIsLoading(false)
      const errors = {
        da: 'Beklager, der opstod en fejl',
        fr: 'Désolé, erreur',
        es: 'Lo siento, ocurrió un error',
        de: 'Entschuldigung, ein Fehler ist aufgetreten',
        ru: 'Izvinite, proizoshla oshibka',
        ar: 'Aasif, hadatha khata',
        hi: 'Kshama kijiye, error hua',
        zh: 'Bàoqiàn, chūcuòle',
        ko: 'Joesonghamnida, oryu balssenghaessseubnida',
        en: 'Sorry, error occurred'
      }
      return errors[lang] || errors.en
    }
  }

  return { askWeather, isLoading }
    }
