
import { useState } from 'react'

export const LANG_MAP = {
  US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en', NG: 'en',
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
  CN: 'zh', TW: 'zh', HK: 'zh', // Chinese added
  KR: 'ko' // Korean added
}

export const VOICE_MAP = {
  en: { male: 'en-US-GuyNeural', female: 'en-US-JennyNeural' },
  fr: { male: 'fr-FR-HenriNeural', female: 'fr-FR-DeniseNeural' },
  es: { male: 'es-ES-AlvaroNeural', female: 'es-ES-ElviraNeural' },
  de: { male: 'de-DE-ConradNeural', female: 'de-DE-KatjaNeural' },
  it: { male: 'it-IT-DiegoNeural', female: 'it-IT-ElsaNeural' },
  pt: { male: 'pt-BR-AntonioNeural', female: 'pt-BR-FranciscaNeural' },
  da: { male: 'da-DK-MadsNeural', female: 'da-DK-ChristelNeural' },
  sv: { male: 'sv-SE-MattiasNeural', female: 'sv-SE-SofieNeural' },
  no: { male: 'nb-NO-FinnNeural', female: 'nb-NO-PernilleNeural' },
  fi: { male: 'fi-FI-HarriNeural', female: 'fi-FI-NooraNeural' },
  nl: { male: 'nl-NL-MaartenNeural', female: 'nl-NL-ColetteNeural' },
  pl: { male: 'pl-PL-MarekNeural', female: 'pl-PL-ZofiaNeural' },
  ru: { male: 'ru-RU-DmitryNeural', female: 'ru-RU-SvetlanaNeural' },
  tr: { male: 'tr-TR-AhmetNeural', female: 'tr-TR-EmelNeural' },
  ar: { male: 'ar-SA-HamedNeural', female: 'ar-SA-ZariyahNeural' },
  hi: { male: 'hi-IN-MadhurNeural', female: 'hi-IN-SwaraNeural' },
  ja: { male: 'ja-JP-KeitaNeural', female: 'ja-JP-NanamiNeural' },
  zh: { male: 'zh-CN-YunxiNeural', female: 'zh-CN-XiaoxiaoNeural' }, // Mandarin
  ko: { male: 'ko-KR-InJoonNeural', female: 'ko-KR-SunHiNeural' } // Korean
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
  zh: { morning: 'Zǎo shang hǎo', afternoon: 'Xià wǔ hǎo', evening: 'Wǎn shàng hǎo' }, // Chinese
  ko: { morning: 'Jo-eun achim', afternoon: 'Annyeonghaseyo', evening: 'Jo-eun jeonyeok' } // Korean
}

export function getLang(countryCode) {
  return LANG_MAP[countryCode] || 'en'
}

export function getGreeting(timezone, lang = 'en') {
  const hour = parseInt(new Intl.DateTimeFormat('en', {
    hour: 'numeric', hour12: false, timeZone: timezone
  }).format(new Date()))

  const timeOfDay = hour < 12? 'morning' : hour < 18? 'afternoon' : 'evening'
  return GREETINGS?.[timeOfDay] || GREETINGS.en[timeOfDay]
}

export function getVoiceForLocation(selectedVoice, countryCode) {
  const lang = getLang(countryCode)
  const gender = /Guy|Brandon|Davis|Tony|Ryan|Brian|Henri|Alvaro|Conrad|Diego|Antonio|Mads|Mattias|Finn|Harri|Maarten|Marek|Dmitry|Ahmet|Hamed|Madhur|Keita|Yunxi|InJoon/i.test(selectedVoice)? 'male' : 'female'
  return VOICE_MAP?.[gender] || selectedVoice
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
      return errors || errors.en
    }
  }

  return { askWeather, isLoading }
    }
