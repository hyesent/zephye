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

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── NEW: LANGUAGE NAMES FOR UI ──────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export const LANGUAGE_NAMES = {
  en: 'English', en_US: 'English (US)', en_GB: 'English (UK)',
  en_NG: 'English (Nigeria)', en_KE: 'English (Kenya)', en_ZA: 'English (South Africa)',
  en_TZ: 'English (Tanzania)', en_PH: 'English (Philippines)', en_SG: 'English (Singapore)',
  en_HK: 'English (Hong Kong)', en_IN: 'English (India)', en_CA: 'English (Canada)',
  en_AU: 'English (Australia)', en_NZ: 'English (New Zealand)', en_IE: 'English (Ireland)',
  fr: 'Français', es: 'Español', es_MX: 'Español (México)', es_AR: 'Español (Argentina)',
  de: 'Deutsch', it: 'Italiano', pt: 'Português', pt_BR: 'Português (Brasil)',
  da: 'Dansk', sv: 'Svenska', no: 'Norsk', fi: 'Suomi',
  nl: 'Nederlands', pl: 'Polski', ru: 'Русский', tr: 'Türkçe',
  ar: 'العربية', ar_EG: 'العربية (مصر)', hi: 'हिन्दी',
  ja: '日本語', zh: '中文', ko: '한국어'
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── NEW: LANGUAGE DETECTION PATTERNS ────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export const LANGUAGE_PATTERNS = {
  ar: /[\u0600-\u06FF]/,
  zh: /[\u4E00-\u9FFF]/,
  ja: /[\u3040-\u309F\u30A0-\u30FF]/,
  ko: /[\uAC00-\uD7AF]/,
  ru: /[\u0400-\u04FF]/,
  hi: /[\u0900-\u097F]/,
  el: /[\u0370-\u03FF]/,
  he: /[\u0590-\u05FF]/,
  th: /[\u0E00-\u0E7F]/,
  vi: /[\u0103\u00E2\u00EA\u00F4\u01A1\u01B0\u1EA0-\u1EF9]/,
  fr: /[éèêëùûüÿàâäôöçîïœ]/,
  de: /[äöüßÄÖÜ]/,
  es: /[áéíóúñ¿¡ÁÉÍÓÚÑ]/,
  pt: /[áâãàéêíóôõúçÁÂÃÀÉÊÍÓÔÕÚÇ]/,
  it: /[àèéìòù]/,
  nl: /[ëïéèê]/,
  pl: /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/,
  tr: /[ğüşöçıİĞÜŞÖÇ]/,
  da: /[æøåÆØÅ]/,
  sv: /[åäöÅÄÖ]/,
  no: /[æøåÆØÅ]/,
  fi: /[åäöÅÄÖ]/,
  cs: /[ěščřžýáíéóúůďťňĚŠČŘŽÝÁÍÉÓÚŮĎŤŇ]/,
  hu: /[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/,
  ro: /[ăâîșțĂÂÎȘȚ]/,
  bg: /[\u0400-\u04FF]/,
  uk: /[\u0400-\u04FF]/
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── NEW: LANGUAGE DETECTION FUNCTION ─────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function detectLanguageFromText(text) {
  if (!text || text.trim().length < 2) return 'en'

  const scores = {}
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    const matches = text.match(pattern)
    if (matches) {
      scores[lang] = (matches.length / text.length) * 100
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  if (sorted.length > 0 && sorted[0][1] > 3) {
    // Map to voice-compatible code
    const map = {
      'zh': 'zh',
      'ar_EG': 'ar_EG',
      'es_MX': 'es_MX',
      'es_AR': 'es_AR',
      'pt_BR': 'pt_BR'
    }
    return map[sorted[0][0]] || sorted[0][0]
  }
  return 'en'
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── NEW: NLLB LANGUAGE CODE MAP ─────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function getNLLBLangCode(langCode) {
  const map = {
    en: 'eng_Latn', en_US: 'eng_Latn', en_GB: 'eng_Latn',
    fr: 'fra_Latn', es: 'spa_Latn', es_MX: 'spa_Latn', es_AR: 'spa_Latn',
    de: 'deu_Latn', it: 'ita_Latn', pt: 'por_Latn', pt_BR: 'por_Latn',
    ru: 'rus_Cyrl', zh: 'zho_Hans', zh_CN: 'zho_Hans', zh_TW: 'zho_Hant',
    ja: 'jpn_Jpan', ko: 'kor_Hang', ar: 'arb_Arab', ar_EG: 'arb_Arab',
    hi: 'hin_Deva', nl: 'nld_Latn', pl: 'pol_Latn', tr: 'tur_Latn',
    vi: 'vie_Latn', th: 'tha_Thai', he: 'heb_Hebr', sv: 'swe_Latn',
    da: 'dan_Latn', fi: 'fin_Latn', no: 'nob_Latn', cs: 'ces_Latn',
    el: 'ell_Grek', hu: 'hun_Latn', ro: 'ron_Latn', uk: 'ukr_Cyrl',
    id: 'ind_Latn', ms: 'zsm_Latn', fa: 'pes_Arab', bn: 'ben_Beng',
    ta: 'tam_Taml', te: 'tel_Telu', mr: 'mar_Deva', ur: 'urd_Arab',
    sw: 'swh_Latn', tl: 'tgl_Latn', bg: 'bul_Cyrl', sk: 'slk_Latn',
    hr: 'hrv_Latn', lt: 'lit_Latn', lv: 'lvs_Latn', et: 'est_Latn',
    af: 'afr_Latn', ha: 'hau_Latn', wo: 'wol_Latn', ak: 'aka_Latn',
    az: 'azj_Latn', ka: 'kat_Geor', hy: 'hye_Armn', km: 'khm_Khmr',
    lo: 'lao_Laoo', my: 'mya_Mymr', ne: 'npi_Deva', si: 'sin_Sinh'
  }
  return map[langCode] || map[langCode?.split('_')[0]] || 'eng_Latn'
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── NEW: TRANSLATION ENGINE ──────────────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export async function translateText(text, targetLang) {
  if (!text || targetLang === 'en') return text
  if (text.trim().length < 2) return text

  const engines = [
    translateWithHuggingFace,
    translateWithLibre,
    translateWithGoogle,
    translateWithMyMemory
  ]

  for (const engine of engines) {
    try {
      const result = await engine(text, targetLang)
      if (result && result !== text) return result
    } catch (e) {
      // Continue to next engine
    }
  }
  return text
}

// ─── Translation Engine 1: HuggingFace NLLB ───────────────────────────

async function translateWithHuggingFace(text, targetLang) {
  try {
    const res = await fetch(
      'https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            src_lang: 'eng_Latn',
            tgt_lang: getNLLBLangCode(targetLang)
          }
        })
      }
    )
    if (res.ok) {
      const data = await res.json()
      if (data[0]?.translation_text) return data[0].translation_text
    }
  } catch (e) {}
  return null
}

// ─── Translation Engine 2: LibreTranslate ──────────────────────────────

async function translateWithLibre(text, targetLang) {
  try {
    const res = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'auto',
        target: targetLang,
        format: 'text'
      })
    })
    if (res.ok) {
      const data = await res.json()
      if (data.translatedText) return data.translatedText
    }
  } catch (e) {}
  return null
}

// ─── Translation Engine 3: Google Translate (unofficial) ──────────────

async function translateWithGoogle(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    const parsed = await res.json()
    if (parsed && parsed[0]) {
      const translated = parsed[0].map((item) => item[0]).join('')
      if (translated) return translated
    }
  } catch (e) {}
  return null
}

// ─── Translation Engine 4: MyMemory ─────────────────────────────────────

async function translateWithMyMemory(text, targetLang) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText
    }
  } catch (e) {}
  return null
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── NEW: GET VOICE FOR DETECTED LANGUAGE ─────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function getVoiceForDetectedLanguage(detectedLang, genderPref = 'female') {
  let voiceKey = detectedLang
  
  // Map to voice key if needed
  const map = {
    'zh': 'zh',
    'ar_EG': 'ar_EG',
    'es_MX': 'es_MX',
    'es_AR': 'es_AR',
    'pt_BR': 'pt_BR',
    'en': 'en_US'
  }
  voiceKey = map[voiceKey] || voiceKey
  
  const voiceSet = VOICE_MAP[voiceKey] || VOICE_MAP[voiceKey?.split('_')[0]] || VOICE_MAP.en_US
  return voiceSet[genderPref] || voiceSet.female
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// ─── EXISTING FUNCTIONS (UNCHANGED) ──────────────────────────────────
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

export function getLang(countryCode) {
  return LANG_MAP[countryCode] || 'en'
}

export function getGreeting(timezone, lang = 'en') {
  const hour = parseInt(new Intl.DateTimeFormat('en', {
    hour: 'numeric', hour12: false, timeZone: timezone
  }).format(new Date()))

  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
  return GREETINGS[lang]?.[timeOfDay] || GREETINGS.en[timeOfDay]
}

export function getVoiceForLocation(selectedVoice, countryCode, genderPref = 'female') {
  if (selectedVoice && selectedVoice !== 'auto') return selectedVoice

  const lang = getLang(countryCode)

  let voiceKey = lang
  if (lang === 'en') voiceKey = `en_${countryCode}`
  if (lang === 'pt' && countryCode === 'BR') voiceKey = 'pt_BR'
  if (lang === 'es' && countryCode === 'MX') voiceKey = 'es_MX'
  if (lang === 'es' && countryCode === 'AR') voiceKey = 'es_AR'
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
