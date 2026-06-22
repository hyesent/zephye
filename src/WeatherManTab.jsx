import { useState, useEffect } from 'react'
import { useAudio } from './AudioContext'
import ZephyeAIPanel from './ZephyeAIPanel'
import { getLang, getVoiceForLocation, useWeatherChat, getGreeting } from './zephyeHelpers'

const BACKEND_URL = 'https://hyezen.onrender.com'

const getAqiLevel = (aqi) => {
  if (aqi == null) return { label: 'Unknown', color: '#6b7280' }
  if (aqi <= 50) return { label: 'Good', color: '#22c55e' }
  if (aqi <= 100) return { label: 'Moderate', color: '#eab308' }
  if (aqi <= 150) return { label: 'Unhealthy', color: '#f97316' }
  return { label: 'Hazardous', color: '#ef4444' }
}

// FULL 19-LANGUAGE BRIEFING TEMPLATES
const BRIEFING_TEMPLATES = {
  en: {
    thunderstorms: 'Heads up, we have thunderstorms in {location} right now.',
    rain: "It's a rainy day in {location}.",
    clear: 'Clear skies over {location} today.',
    cloudy: 'Cloudy conditions in {location}.',
    temp: "Right now it's {temp} degrees, but it feels like {feels}.",
    windStrong: 'Winds are picking up at {wind} kilometers per hour, with gusts up to {gust}.',
    windLight: 'Winds are light at {wind} kilometers per hour.',
    humidity: 'Humidity is sitting at {humidity} percent.',
    uvHigh: 'UV index is high at {uv}, so sun protection is advised.',
    uvModerate: 'UV index is moderate at {uv}.',
    rainSoon: "Grab an umbrella, there's a {prob} percent chance of rain in the next 2 hours.",
    rainLater: "There's a {prob} percent chance of rain later today.",
    noRain: 'No major rain expected today, just a {prob} percent chance.',
    thunder: 'Thunder is possible for about {hours} hours today.',
    aqiBad: 'Air quality is {level}, so sensitive groups should limit outdoor activity.',
    aqiGood: 'Air quality is {level}.',
    sunrise: 'Sunrise was at {sunrise}, and sunset is at {sunset}.',
    closing: "That's your update from Zephye. Stay safe out there.",
    brief: {
      storms: 'Thunderstorms in {location} right now.',
      rain: 'Rain expected in {location}.',
      current: 'Currently {temp} degrees in {location}.',
      feels: 'Feels like {feels}.',
      rain2h: 'Rain likely in 2 hours.',
      rainToday: '{prob} percent chance of rain today.',
      uv: 'High UV index.',
      aqi: 'Air quality is poor.',
      closing: "That's your update from Zephye."
    }
  },
  fr: {
    thunderstorms: 'Attention, il y a des orages à {location} en ce moment.',
    rain: "C'est un jour pluvieux à {location}.",
    clear: 'Ciel dégagé sur {location} aujourd\'hui.',
    cloudy: 'Conditions nuageuses à {location}.',
    temp: 'Il fait actuellement {temp} degrés, mais le ressenti est de {feels}.',
    windStrong: 'Les vents se renforcent à {wind} km/h, avec des rafales jusqu\'à {gust}.',
    windLight: 'Vents légers à {wind} km/h.',
    humidity: 'L\'humidité est à {humidity}%.',
    uvHigh: 'Indice UV élevé à {uv}, protection solaire conseillée.',
    uvModerate: 'Indice UV modéré à {uv}.',
    rainSoon: 'Prenez un parapluie, {prob}% de chance de pluie dans les 2 heures.',
    rainLater: '{prob}% de chance de pluie plus tard aujourd\'hui.',
    noRain: 'Pas de pluie majeure prévue, juste {prob}% de chance.',
    thunder: 'Tonnerre possible pendant environ {hours} heures aujourd\'hui.',
    aqiBad: 'Qualité de l\'air {level}, les groupes sensibles doivent limiter les activités extérieures.',
    aqiGood: 'Qualité de l\'air {level}.',
    sunrise: 'Lever du soleil à {sunrise}, coucher à {sunset}.',
    closing: 'C\'était votre bulletin Zephye. Prenez soin de vous.',
    brief: {
      storms: 'Orages à {location} maintenant.',
      rain: 'Pluie prévue à {location}.',
      current: 'Actuellement {temp} degrés à {location}.',
      feels: 'Ressenti {feels}.',
      rain2h: 'Pluie probable dans 2h.',
      rainToday: '{prob}% de chance de pluie aujourd\'hui.',
      uv: 'Indice UV élevé.',
      aqi: 'Qualité de l\'air mauvaise.',
      closing: 'C\'était Zephye.'
    }
  },
  es: {
    thunderstorms: 'Atención, hay tormentas eléctricas en {location} ahora mismo.',
    rain: 'Es un día lluvioso en {location}.',
    clear: 'Cielos despejados sobre {location} hoy.',
    cloudy: 'Condiciones nubladas en {location}.',
    temp: 'Ahora mismo hace {temp} grados, pero la sensación térmica es de {feels}.',
    windStrong: 'Los vientos aumentan a {wind} km/h, con ráfagas de hasta {gust}.',
    windLight: 'Vientos ligeros a {wind} km/h.',
    humidity: 'La humedad está en {humidity}%.',
    uvHigh: 'Índice UV alto en {uv}, se aconseja protección solar.',
    uvModerate: 'Índice UV moderado en {uv}.',
    rainSoon: 'Coge un paraguas, hay {prob}% de probabilidad de lluvia en 2 horas.',
    rainLater: '{prob}% de probabilidad de lluvia más tarde hoy.',
    noRain: 'No se esperan lluvias importantes, solo {prob}% de probabilidad.',
    thunder: 'Posibles truenos durante unas {hours} horas hoy.',
    aqiBad: 'Calidad del aire {level}, los grupos sensibles deben limitar la actividad exterior.',
    aqiGood: 'Calidad del aire {level}.',
    sunrise: 'Amanecer a las {sunrise}, atardecer a las {sunset}.',
    closing: 'Ese fue tu informe de Zephye. Cuídate.',
    brief: {
      storms: 'Tormentas en {location} ahora.',
      rain: 'Se espera lluvia en {location}.',
      current: 'Actualmente {temp} grados en {location}.',
      feels: 'Sensación de {feels}.',
      rain2h: 'Lluvia probable en 2h.',
      rainToday: '{prob}% de probabilidad de lluvia hoy.',
      uv: 'Índice UV alto.',
      aqi: 'Calidad del aire mala.',
      closing: 'Fue Zephye.'
    }
  },
  de: {
    thunderstorms: 'Achtung, aktuell gibt es Gewitter in {location}.',
    rain: 'Es ist ein regnerischer Tag in {location}.',
    clear: 'Klarer Himmel über {location} heute.',
    cloudy: 'Bewölkte Bedingungen in {location}.',
    temp: 'Aktuell {temp} Grad, gefühlt wie {feels}.',
    windStrong: 'Der Wind frischt auf {wind} km/h auf, mit Böen bis {gust}.',
    windLight: 'Leichter Wind mit {wind} km/h.',
    humidity: 'Luftfeuchtigkeit liegt bei {humidity}%.',
    uvHigh: 'UV-Index hoch bei {uv}, Sonnenschutz empfohlen.',
    uvModerate: 'UV-Index mäßig bei {uv}.',
    rainSoon: 'Nimm einen Schirm mit, {prob}% Regenwahrscheinlichkeit in 2 Stunden.',
    rainLater: '{prob}% Regenwahrscheinlichkeit später heute.',
    noRain: 'Kein starker Regen erwartet, nur {prob}% Wahrscheinlichkeit.',
    thunder: 'Heute etwa {hours} Stunden Gewitter möglich.',
    aqiBad: 'Luftqualität ist {level}, empfindliche Gruppen sollten Aktivitäten einschränken.',
    aqiGood: 'Luftqualität ist {level}.',
    sunrise: 'Sonnenaufgang um {sunrise}, Sonnenuntergang um {sunset}.',
    closing: 'Das war dein Update von Zephye. Pass auf dich auf.',
    brief: {
      storms: 'Gewitter in {location} jetzt.',
      rain: 'Regen in {location} erwartet.',
      current: 'Aktuell {temp} Grad in {location}.',
      feels: 'Gefühlt {feels}.',
      rain2h: 'Regen in 2h wahrscheinlich.',
      rainToday: '{prob}% Regenwahrscheinlichkeit heute.',
      uv: 'UV-Index hoch.',
      aqi: 'Luftqualität schlecht.',
      closing: 'Das war Zephye.'
    }
  },
  it: {
    thunderstorms: 'Attenzione, temporali in corso a {location}.',
    rain: 'È una giornata piovosa a {location}.',
    clear: 'Cielo sereno su {location} oggi.',
    cloudy: 'Condizioni nuvolose a {location}.',
    temp: 'Ora ci sono {temp} gradi, ma la temperatura percepita è {feels}.',
    windStrong: 'I venti aumentano a {wind} km/h, con raffiche fino a {gust}.',
    windLight: 'Venti leggeri a {wind} km/h.',
    humidity: 'Umidità al {humidity}%.',
    uvHigh: 'Indice UV alto a {uv}, si consiglia protezione solare.',
    uvModerate: 'Indice UV moderato a {uv}.',
    rainSoon: 'Prendi l\'ombrello, {prob}% di probabilità di pioggia nelle prossime 2 ore.',
    rainLater: '{prob}% di probabilità di pioggia più tardi oggi.',
    noRain: 'Nessuna pioggia importante prevista, solo {prob}% di probabilità.',
    thunder: 'Possibili tuoni per circa {hours} ore oggi.',
    aqiBad: 'Qualità dell\'aria {level}, i gruppi sensibili dovrebbero limitare l\'attività all\'aperto.',
    aqiGood: 'Qualità dell\'aria {level}.',
    sunrise: 'Alba alle {sunrise}, tramonto alle {sunset}.',
    closing: 'Questo era il tuo aggiornamento da Zephye. Stai al sicuro.',
    brief: {
      storms: 'Temporali a {location} ora.',
      rain: 'Pioggia prevista a {location}.',
      current: 'Attualmente {temp} gradi a {location}.',
      feels: 'Percepiti {feels}.',
      rain2h: 'Pioggia probabile in 2h.',
      rainToday: '{prob}% probabilità di pioggia oggi.',
      uv: 'Indice UV alto.',
      aqi: 'Qualità dell\'aria scarsa.',
      closing: 'Era Zephye.'
    }
  },
  pt: {
    thunderstorms: 'Atenção, há tempestades em {location} agora.',
    rain: 'É um dia chuvoso em {location}.',
    clear: 'Céu limpo sobre {location} hoje.',
    cloudy: 'Condições nubladas em {location}.',
    temp: 'Agora está {temp} graus, mas a sensação térmica é de {feels}.',
    windStrong: 'Os ventos aumentam para {wind} km/h, com rajadas de até {gust}.',
    windLight: 'Ventos leves a {wind} km/h.',
    humidity: 'Umidade em {humidity}%.',
    uvHigh: 'Índice UV alto em {uv}, proteção solar recomendada.',
    uvModerate: 'Índice UV moderado em {uv}.',
    rainSoon: 'Pegue um guarda-chuva, {prob}% de chance de chuva em 2 horas.',
    rainLater: '{prob}% de chance de chuva mais tarde hoje.',
    noRain: 'Nenhuma chuva forte esperada, apenas {prob}% de chance.',
    thunder: 'Possibilidade de trovões por cerca de {hours} horas hoje.',
    aqiBad: 'Qualidade do ar {level}, grupos sensíveis devem limitar atividades ao ar livre.',
    aqiGood: 'Qualidade do ar {level}.',
    sunrise: 'Nascer do sol às {sunrise}, pôr do sol às {sunset}.',
    closing: 'Essa foi sua atualização da Zephye. Fique seguro.',
    brief: {
      storms: 'Tempestades em {location} agora.',
      rain: 'Chuva esperada em {location}.',
      current: 'Atualmente {temp} graus em {location}.',
      feels: 'Sensação de {feels}.',
      rain2h: 'Chuva provável em 2h.',
      rainToday: '{prob}% de chance de chuva hoje.',
      uv: 'Índice UV alto.',
      aqi: 'Qualidade do ar ruim.',
      closing: 'Foi Zephye.'
    }
  },
  da: {
    thunderstorms: 'Bemærk, der er tordenvejr i {location} lige nu.',
    rain: 'Det er en regnvejrsdag i {location}.',
    clear: 'Klar himmel over {location} i dag.',
    cloudy: 'Overskyet i {location}.',
    temp: 'Lige nu er det {temp} grader, men det føles som {feels}.',
    windStrong: 'Vinden tager til med {wind} km/t, med vindstød op til {gust}.',
    windLight: 'Let vind på {wind} km/t.',
    humidity: 'Luftfugtighed er på {humidity}%.',
    uvHigh: 'UV-indeks er højt på {uv}, solbeskyttelse anbefales.',
    uvModerate: 'UV-indeks er moderat på {uv}.',
    rainSoon: 'Tag en paraply, {prob}% chance for regn inden for 2 timer.',
    rainLater: '{prob}% chance for regn senere i dag.',
    noRain: 'Ingen større regn forventet, kun {prob}% chance.',
    thunder: 'Torden mulig i omkring {hours} timer i dag.',
    aqiBad: 'Luftkvaliteten er {level}, følsomme grupper bør begrænse udendørs aktivitet.',
    aqiGood: 'Luftkvaliteten er {level}.',
    sunrise: 'Solopgang kl. {sunrise}, solnedgang kl. {sunset}.',
    closing: 'Det var din opdatering fra Zephye. Pas på dig selv.',
    brief: {
      storms: 'Tordenvejr i {location} nu.',
      rain: 'Regn forventet i {location}.',
      current: 'Lige nu {temp} grader i {location}.',
      feels: 'Føles som {feels}.',
      rain2h: 'Regn sandsynlig om 2t.',
      rainToday: '{prob}% chance for regn i dag.',
      uv: 'Højt UV-indeks.',
      aqi: 'Dårlig luftkvalitet.',
      closing: 'Det var Zephye.'
    }
  },
  sv: {
    thunderstorms: 'Observera, det är åskväder i {location} just nu.',
    rain: 'Det är en regnig dag i {location}.',
    clear: 'Klar himmel över {location} idag.',
    cloudy: 'Molniga förhållanden i {location}.',
    temp: 'Just nu är det {temp} grader, men det känns som {feels}.',
    windStrong: 'Vindarna ökar till {wind} km/h, med vindbyar upp till {gust}.',
    windLight: 'Lätta vindar på {wind} km/h.',
    humidity: 'Luftfuktigheten är {humidity}%.',
    uvHigh: 'UV-index är högt på {uv}, solskydd rekommenderas.',
    uvModerate: 'UV-index är måttligt på {uv}.',
    rainSoon: 'Ta ett paraply, {prob}% chans för regn inom 2 timmar.',
    rainLater: '{prob}% chans för regn senare idag.',
    noRain: 'Inget större regn väntat, bara {prob}% chans.',
    thunder: 'Åska möjlig i cirka {hours} timmar idag.',
    aqiBad: 'Luftkvaliteten är {level}, känsliga grupper bör begränsa utomhusaktiviteter.',
    aqiGood: 'Luftkvaliteten är {level}.',
    sunrise: 'Soluppgång kl. {sunrise}, solnedgång kl. {sunset}.',
    closing: 'Det var din uppdatering från Zephye. Ta hand om dig.',
    brief: {
      storms: 'Åskväder i {location} nu.',
      rain: 'Regn väntat i {location}.',
      current: 'Just nu {temp} grader i {location}.',
      feels: 'Känns som {feels}.',
      rain2h: 'Regn troligt om 2h.',
      rainToday: '{prob}% chans för regn idag.',
      uv: 'Högt UV-index.',
      aqi: 'Dålig luftkvalitet.',
      closing: 'Det var Zephye.'
    }
  },
  no: {
    thunderstorms: 'Merk, det er tordenvær i {location} akkurat nå.',
    rain: 'Det er en regnfull dag i {location}.',
    clear: 'Klar himmel over {location} i dag.',
    cloudy: 'Overskyet i {location}.',
    temp: 'Akkurat nå er det {temp} grader, men det føles som {feels}.',
    windStrong: 'Vinden øker til {wind} km/t, med vindkast opp til {gust}.',
    windLight: 'Lett vind på {wind} km/t.',
    humidity: 'Luftfuktigheten er på {humidity}%.',
    uvHigh: 'UV-indeksen er høy på {uv}, solbeskyttelse anbefales.',
    uvModerate: 'UV-indeksen er moderat på {uv}.',
    rainSoon: 'Ta med paraply, {prob}% sjanse for regn innen 2 timer.',
    rainLater: '{prob}% sjanse for regn senere i dag.',
    noRain: 'Ingen stor nedbør ventet, bare {prob}% sjanse.',
    thunder: 'Torden mulig i omtrent {hours} timer i dag.',
    aqiBad: 'Luftkvaliteten er {level}, sensitive grupper bør begrense utendørs aktivitet.',
    aqiGood: 'Luftkvaliteten er {level}.',
    sunrise: 'Soloppgang kl. {sunrise}, solnedgang kl. {sunset}.',
    closing: 'Det var din oppdatering fra Zephye. Ta vare på deg selv.',
    brief: {
      storms: 'Tordenvær i {location} nå.',
      rain: 'Regn ventet i {location}.',
      current: 'Akkurat nå {temp} grader i {location}.',
      feels: 'Føles som {feels}.',
      rain2h: 'Regn sannsynlig om 2t.',
      rainToday: '{prob}% sjanse for regn i dag.',
      uv: 'Høy UV-indeks.',
      aqi: 'Dårlig luftkvalitet.',
      closing: 'Det var Zephye.'
    }
  },
  fi: {
    thunderstorms: 'Huomio, {location}:ssa on ukkosmyrsky juuri nyt.',
    rain: 'Tänään on sateinen päivä {location}:ssa.',
    clear: 'Kirkas taivas {location}:n yllä tänään.',
    cloudy: 'Pilviset olosuhteet {location}:ssa.',
    temp: 'Juuri nyt on {temp} astetta, mutta tuntuu kuin {feels}.',
    windStrong: 'Tuuli voimistuu {wind} km/h, puuskissa jopa {gust}.',
    windLight: 'Kevyt tuuli {wind} km/h.',
    humidity: 'Ilmankosteus on {humidity}%.',
    uvHigh: 'UV-indeksi on korkea {uv}, aurinkosuojaa suositellaan.',
    uvModerate: 'UV-indeksi on kohtalainen {uv}.',
    rainSoon: 'Ota sateenvarjo, {prob}% sateen todennäköisyys 2 tunnin sisällä.',
    rainLater: '{prob}% sateen todennäköisyys myöhemmin tänään.',
    noRain: 'Ei merkittävää sadetta odotettavissa, vain {prob}% todennäköisyys.',
    thunder: 'Ukkonen mahdollinen noin {hours} tuntia tänään.',
    aqiBad: 'Ilmanlaatu on {level}, herkkien ryhmien tulisi rajoittaa ulkoilua.',
    aqiGood: 'Ilmanlaatu on {level}.',
    sunrise: 'Auringonnousu klo {sunrise}, auringonlasku klo {sunset}.',
    closing: 'Tämä oli Zephyjen päivityksesi. Pysy turvassa.',
    brief: {
      storms: 'Ukkosmyrsky {location}:ssa nyt.',
      rain: 'Sadetta odotettavissa {location}:ssa.',
      current: 'Tällä hetkellä {temp} astetta {location}:ssa.',
      feels: 'Tuntuu {feels}.',
      rain2h: 'Sade todennäköinen 2h sisällä.',
      rainToday: '{prob}% sateen todennäköisyys tänään.',
      uv: 'Korkea UV-indeksi.',
      aqi: 'Huono ilmanlaatu.',
      closing: 'Tämä oli Zephye.'
    }
  },
  nl: {
    thunderstorms: 'Let op, er zijn onweersbuien in {location} op dit moment.',
    rain: 'Het is een regenachtige dag in {location}.',
    clear: 'Heldere hemel boven {location} vandaag.',
    cloudy: 'Bewolkte omstandigheden in {location}.',
    temp: 'Het is nu {temp} graden, maar het voelt als {feels}.',
    windStrong: 'De wind neemt toe tot {wind} km/u, met windstoten tot {gust}.',
    windLight: 'Lichte wind met {wind} km/u.',
    humidity: 'Luchtvochtigheid is {humidity}%.',
    uvHigh: 'UV-index is hoog met {uv}, zonbescherming wordt geadviseerd.',
    uvModerate: 'UV-index is matig met {uv}.',
    rainSoon: 'Neem een paraplu mee, {prob}% kans op regen binnen 2 uur.',
    rainLater: '{prob}% kans op regen later vandaag.',
    noRain: 'Geen grote regen verwacht, slechts {prob}% kans.',
    thunder: 'Onweer mogelijk gedurende ongeveer {hours} uur vandaag.',
    aqiBad: 'Luchtkwaliteit is {level}, gevoelige groepen moeten buitenactiviteiten beperken.',
    aqiGood: 'Luchtkwaliteit is {level}.',
    sunrise: 'Zonsopgang om {sunrise}, zonsondergang om {sunset}.',
    closing: 'Dat was je update van Zephye. Blijf veilig.',
    brief: {
      storms: 'Onweersbuien in {location} nu.',
      rain: 'Regen verwacht in {location}.',
      current: 'Momenteel {temp} graden in {location}.',
      feels: 'Voelt als {feels}.',
      rain2h: 'Regen waarschijnlijk binnen 2u.',
      rainToday: '{prob}% kans op regen vandaag.',
      uv: 'Hoge UV-index.',
      aqi: 'Slechte luchtkwaliteit.',
      closing: 'Dat was Zephye.'
    }
  },
  pl: {
    thunderstorms: 'Uwaga, w {location} są teraz burze.',
    rain: 'To deszczowy dzień w {location}.',
    clear: 'Bezchmurne niebo nad {location} dzisiaj.',
    cloudy: 'Zachmurzenie w {location}.',
    temp: 'Teraz jest {temp} stopni, ale odczuwalna to {feels}.',
    windStrong: 'Wiatr przybiera na sile do {wind} km/h, w porywach do {gust}.',
    windLight: 'Lekki wiatr {wind} km/h.',
    humidity: 'Wilgotność wynosi {humidity}%.',
    uvHigh: 'Indeks UV wysoki {uv}, zalecana ochrona przeciwsłoneczna.',
    uvModerate: 'Indeks UV umiarkowany {uv}.',
    rainSoon: 'Weź parasol, {prob}% szans na deszcz w ciągu 2 godzin.',
    rainLater: '{prob}% szans na deszcz później dzisiaj.',
    noRain: 'Brak większych opadów, tylko {prob}% szans.',
    thunder: 'Możliwe burze przez około {hours} godzin dzisiaj.',
    aqiBad: 'Jakość powietrza {level}, grupy wrażliwe powinny ograniczyć aktywność na zewnątrz.',
    aqiGood: 'Jakość powietrza {level}.',
    sunrise: 'Wschód słońca o {sunrise}, zachód o {sunset}.',
    closing: 'To była twoja aktualizacja od Zephye. Uważaj na siebie.',
    brief: {
      storms: 'Burze w {location} teraz.',
      rain: 'Spodziewany deszcz w {location}.',
      current: 'Obecnie {temp} stopni w {location}.',
      feels: 'Odczuwalne {feels}.',
      rain2h: 'Deszcz prawdopodobny za 2h.',
      rainToday: '{prob}% szans na deszcz dzisiaj.',
      uv: 'Wysoki indeks UV.',
      aqi: 'Zła jakość powietrza.',
      closing: 'To był Zephye.'
    }
  },
  ru: {
    thunderstorms: 'Внимание, в {location} сейчас грозы.',
    rain: 'Сегодня дождливый день в {location}.',
    clear: 'Ясное небо над {location} сегодня.',
    cloudy: 'Облачно в {location}.',
    temp: 'Сейчас {temp} градусов, но ощущается как {feels}.',
    windStrong: 'Ветер усиливается до {wind} км/ч, с порывами до {gust}.',
    windLight: 'Слабый ветер {wind} км/ч.',
    humidity: 'Влажность {humidity}%.',
    uvHigh: 'УФ-индекс высокий {uv}, рекомендуется защита от солнца.',
    uvModerate: 'УФ-индекс умеренный {uv}.',
    rainSoon: 'Возьмите зонт, {prob}% вероятность дождя в течение 2 часов.',
    rainLater: '{prob}% вероятность дождя позже сегодня.',
    noRain: 'Сильного дождя не ожидается, только {prob}% вероятности.',
    thunder: 'Возможна гроза в течение примерно {hours} часов сегодня.',
    aqiBad: 'Качество воздуха {level}, чувствительным группам следует ограничить активность на улице.',
    aqiGood: 'Качество воздуха {level}.',
    sunrise: 'Восход в {sunrise}, закат в {sunset}.',
    closing: 'Это было ваше обновление от Zephye. Берегите себя.',
    brief: {
      storms: 'Грозы в {location} сейчас.',
      rain: 'Ожидается дождь в {location}.',
      current: 'Сейчас {temp} градусов в {location}.',
      feels: 'Ощущается как {feels}.',
      rain2h: 'Дождь вероятен через 2ч.',
      rainToday: '{prob}% вероятность дождя сегодня.',
      uv: 'Высокий УФ-индекс.',
      aqi: 'Плохое качество воздуха.',
      closing: 'Это был Zephye.'
    }
  },
  tr: {
    thunderstorms: 'Dikkat, {location} şehrinde şu anda gök gürültülü fırtına var.',
    rain: '{location} bugün yağmurlu bir gün.',
    clear: '{location} üzerinde bugün açık gökyüzü.',
    cloudy: '{location} bulutlu.',
    temp: 'Şu anda {temp} derece, hissedilen {feels}.',
    windStrong: 'Rüzgar {wind} km/s hıza çıkıyor, hamleleri {gust} km/s.',
    windLight: 'Hafif rüzgar {wind} km/s.',
    humidity: 'Nem %{humidity}.',
    uvHigh: 'UV indeksi yüksek {uv}, güneş koruması önerilir.',
    uvModerate: 'UV indeksi orta seviyede {uv}.',
    rainSoon: 'Şemsiye alın, 2 saat içinde %{prob} yağmur ihtimali.',
    rainLater: 'Bugün ilerleyen saatlerde %{prob} yağmur ihtimali.',
    noRain: 'Büyük yağmur beklenmiyor, sadece %{prob} ihtimal.',
    thunder: 'Bugün yaklaşık {hours} saat gök gürültüsü olabilir.',
    aqiBad: 'Hava kalitesi {level}, hassas gruplar dışarıdaki aktiviteleri sınırlamalı.',
    aqiGood: 'Hava kalitesi {level}.',
    sunrise: 'Gün doğumu {sunrise}, gün batımı {sunset}.',
    closing: 'Zephye\'den güncellemenizdi. Kendinize iyi bakın.',
    brief: {
      storms: '{location} şehrinde şu an fırtına.',
      rain: '{location} için yağmur bekleniyor.',
      current: '{location} şu anda {temp} derece.',
      feels: 'Hissedilen {feels}.',
      rain2h: '2 saat içinde yağmur olası.',
      rainToday: 'Bugün %{prob} yağmur ihtimali.',
      uv: 'Yüksek UV indeksi.',
      aqi: 'Kötü hava kalitesi.',
      closing: 'Bu Zephye\'ydi.'
    }
  },
  ar: {
  thunderstorms: 'تنبيه، هناك عواصف رعدية في {location} الآن.',
  rain: 'إنه يوم ممطر في {location}.',
  clear: 'سماء صافية فوق {location} اليوم.',
  cloudy: 'أجواء غائمة في {location}.',
  temp: 'الآن {temp} درجة، لكن الإحساس الحراري {feels}.',
  windStrong: 'الرياح تزداد إلى {wind} كم/س، مع هبات تصل إلى {gust}.',
  windLight: 'رياح خفيفة بسرعة {wind} كم/س.',
  humidity: 'الرطوبة عند {humidity}%.',
  uvHigh: 'مؤشر الأشعة فوق البنفسجية مرتفع {uv}، يُنصح بالحماية من الشمس.',
  uvModerate: 'مؤشر الأشعة فوق البنفسجية معتدل {uv}.',
  rainSoon: 'خذ مظلة، {prob}% احتمالية هطول أمطار خلال ساعتين.',
  rainLater: '{prob}% احتمالية هطول أمطار لاحقًا اليوم.',
  noRain: 'لا يُتوقع هطول أمطار غزيرة، فقط {prob}% احتمالية.',
  thunder: 'احتمال حدوث رعد لمدة {hours} ساعات تقريبًا اليوم.',
  aqiBad: 'جودة الهواء {level}، يجب على الفئات الحساسة الحد من النشاط الخارجي.',
  aqiGood: 'جودة الهواء {level}.',
  sunrise: 'شروق الشمس في {sunrise}، وغروبها في {sunset}.',
  closing: 'كان هذا تحديثك من Zephye. حافظ على سلامتك.',
  brief: {
    storms: 'عواصف رعدية في {location} الآن.',
    rain: 'أمطار متوقعة في {location}.',
    current: 'حاليًا {temp} درجة في {location}.',
    feels: 'الإحساس {feels}.',
    rain2h: 'أمطار محتملة خلال ساعتين.',
    rainToday: '{prob}% احتمالية هطول أمطار اليوم.',
    uv: 'مؤشر الأشعة فوق البنفسجية مرتفع.',
    aqi: 'جودة الهواء سيئة.',
    closing: 'كان هذا Zephye.'
  }
},

ja: {
  thunderstorms: '{location}では現在雷雨が発生しています。',
  rain: '{location}は雨の一日です。',
  clear: '{location}は今日、晴天です。',
  cloudy: '{location}は曇り空です。',
  temp: '現在の気温は{temp}度ですが、体感温度は{feels}度です。',
  windStrong: '風速は{wind}キロ毎時で、突風は{gust}キロ毎時です。',
  windLight: '風は穏やかで、風速は{wind}キロ毎時です。',
  humidity: '湿度は{humidity}%です。',
  uvHigh: 'UV指数は{uv}で高く、日焼け対策が推奨されます。',
  uvModerate: 'UV指数は{uv}で中程度です。',
  rainSoon: '2時間以内に{prob}%の降水確率があります。傘を持って行きましょう。',
  rainLater: '今日は後ほど{prob}%の降水確率があります。',
  noRain: '大きな雨の心配はありません。降水確率は{prob}%です。',
  thunder: '今日は約{hours}時間、雷の可能性があります。',
  aqiBad: '空気質は{level}です。敏感な方は屋外活動を控えてください。',
  aqiGood: '空気質は{level}です。',
  sunrise: '日の出は{sunrise}、日の入りは{sunset}です。',
  closing: '以上、Zephyeからの天気情報でした。お気をつけて。',
  brief: {
    storms: '{location}で雷雨です。',
    rain: '{location}で雨の予報です。',
    current: '現在{temp}度です。',
    feels: '体感温度は{feels}度。',
    rain2h: '2時間以内に雨の可能性。',
    rainToday: '今日の降水確率は{prob}%。',
    uv: 'UV指数が高いです。',
    aqi: '空気質が悪いです。',
    closing: '以上、Zephyeでした。'
  }
},
  ko: {
  thunderstorms: '{location}에 현재 천둥번개를 동반한 폭풍이 발생하고 있습니다.',
  rain: '{location}에는 비가 내리고 있습니다.',
  clear: '{location}의 하늘은 맑습니다.',
  cloudy: '{location}는 흐린 날씨입니다.',
  temp: '현재 기온은 {temp}도이며 체감온도는 {feels}도입니다.',
  windStrong: '바람은 시속 {wind}킬로미터이며 돌풍은 {gust}킬로미터까지 불겠습니다.',
  windLight: '바람은 시속 {wind}킬로미터로 약하게 불고 있습니다.',
  humidity: '습도는 {humidity}%입니다.',
  uvHigh: '자외선 지수는 {uv}로 높으므로 자외선 차단이 권장됩니다.',
  uvModerate: '자외선 지수는 {uv}로 보통 수준입니다.',
  rainSoon: '2시간 이내 강수 확률이 {prob}%입니다. 우산을 챙기세요.',
  rainLater: '오늘 늦게 비가 올 확률은 {prob}%입니다.',
  noRain: '큰 비는 예상되지 않으며 강수 확률은 {prob}%입니다.',
  thunder: '오늘 약 {hours}시간 동안 천둥 가능성이 있습니다.',
  aqiBad: '대기질은 {level} 수준이며 민감군은 야외 활동을 줄이는 것이 좋습니다.',
  aqiGood: '대기질은 {level} 수준입니다.',
  sunrise: '일출은 {sunrise}, 일몰은 {sunset}입니다.',
  closing: '지금까지 Zephye 날씨 업데이트였습니다. 안전하게 보내세요.',
  brief: {
    storms: '{location}에 천둥번개가 발생 중입니다.',
    rain: '{location}에 비가 예상됩니다.',
    current: '현재 기온은 {temp}도입니다.',
    feels: '체감온도는 {feels}도입니다.',
    rain2h: '2시간 내 비가 올 가능성이 있습니다.',
    rainToday: '오늘 강수 확률은 {prob}%입니다.',
    uv: '자외선 지수가 높습니다.',
    aqi: '대기질이 좋지 않습니다.',
    closing: '이상 Zephye였습니다.'
  }
},

hi: {
  thunderstorms: '{location} में इस समय गरज के साथ बारिश हो रही है।',
  rain: '{location} में आज बारिश का मौसम है।',
  clear: '{location} में आज आसमान साफ है।',
  cloudy: '{location} में बादल छाए हुए हैं।',
  temp: 'अभी तापमान {temp} डिग्री है, लेकिन महसूस {feels} डिग्री जैसा हो रहा है।',
  windStrong: 'हवा की गति {wind} किलोमीटर प्रति घंटा है और झोंके {gust} किलोमीटर प्रति घंटा तक पहुँच सकते हैं।',
  windLight: 'हल्की हवाएँ {wind} किलोमीटर प्रति घंटा की गति से चल रही हैं।',
  humidity: 'नमी {humidity}% है।',
  uvHigh: 'यूवी सूचकांक {uv} है, इसलिए धूप से बचाव की सलाह दी जाती है।',
  uvModerate: 'यूवी सूचकांक {uv} मध्यम स्तर पर है।',
  rainSoon: 'अगले दो घंटों में बारिश की संभावना {prob}% है। छाता साथ रखें।',
  rainLater: 'आज बाद में बारिश की संभावना {prob}% है।',
  noRain: 'आज भारी बारिश की उम्मीद नहीं है, केवल {prob}% संभावना है।',
  thunder: 'आज लगभग {hours} घंटे तक गरज की संभावना है।',
  aqiBad: 'वायु गुणवत्ता {level} है, संवेदनशील लोगों को बाहर की गतिविधियाँ कम करनी चाहिए।',
  aqiGood: 'वायु गुणवत्ता {level} है।',
  sunrise: 'सूर्योदय {sunrise} पर हुआ और सूर्यास्त {sunset} पर होगा।',
  closing: 'यह Zephye की मौसम जानकारी थी। सुरक्षित रहें।',
  brief: {
    storms: '{location} में गरज के साथ बारिश हो रही है।',
    rain: '{location} में बारिश की संभावना है।',
    current: 'अभी तापमान {temp} डिग्री है।',
    feels: 'महसूस {feels} डिग्री जैसा हो रहा है।',
    rain2h: '2 घंटे में बारिश की संभावना है।',
    rainToday: 'आज बारिश की संभावना {prob}% है।',
    uv: 'यूवी सूचकांक ऊँचा है।',
    aqi: 'वायु गुणवत्ता खराब है।',
    closing: 'यह Zephye था।'
  }
},

zh: {
  thunderstorms: '{location}目前有雷暴天气。',
  rain: '{location}今天有降雨。',
  clear: '{location}今天晴空万里。',
  cloudy: '{location}目前多云。',
  temp: '当前气温为{temp}度，体感温度为{feels}度。',
  windStrong: '风速达到每小时{wind}公里，阵风最高可达{gust}公里。',
  windLight: '风力较弱，风速为每小时{wind}公里。',
  humidity: '湿度为{humidity}%。',
  uvHigh: '紫外线指数为{uv}，较高，请注意防晒。',
  uvModerate: '紫外线指数为{uv}，属于中等水平。',
  rainSoon: '未来两小时降雨概率为{prob}%，请带上雨伞。',
  rainLater: '今天稍后降雨概率为{prob}%。',
  noRain: '今天没有明显降雨，降雨概率仅为{prob}%。',
  thunder: '今天约有{hours}小时可能出现雷电。',
  aqiBad: '空气质量为{level}，敏感人群应减少户外活动。',
  aqiGood: '空气质量为{level}。',
  sunrise: '日出时间为{sunrise}，日落时间为{sunset}。',
  closing: '以上是Zephye天气更新，祝您平安。',
  brief: {
    storms: '{location}目前有雷暴。',
    rain: '{location}将有降雨。',
    current: '当前气温为{temp}度。',
    feels: '体感温度为{feels}度。',
    rain2h: '两小时内可能降雨。',
    rainToday: '今天降雨概率为{prob}%。',
    uv: '紫外线指数较高。',
    aqi: '空气质量较差。',
    closing: '这里是Zephye。'
  }
}
}
  export default function WeatherManTab({ weather, location, todayStats, aqi }) {
  const { playGlobal, stopGlobal, isSpeaking } = useAudio()

  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('en-US-GuyNeural')
  const [briefMode, setBriefMode] = useState(false)
  const [userName, setUserName] = useState(
    localStorage.getItem('weatherman_name') || ''
  )

  const { askWeather, isLoading } = useWeatherChat()

  const code = weather?.current?.weather_code || 0

  const countryCode = location?.country_code || 'US'
  const lang = getLang(countryCode)
  const voiceToUse = getVoiceForLocation(selectedVoice, countryCode)
  const timezone = weather?.timezone || 'UTC'
  const greeting = getGreeting(timezone, lang)

  const t = BRIEFING_TEMPLATES[lang] || BRIEFING_TEMPLATES.en

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/voices/fair`)
      .then((r) => r.json())
      .then((data) => setVoices(data || []))
      .catch(() => setVoices([]))
  }, [])

  const fill = (str, vars) =>
    str.replace(/{(\w+)}/g, (_, k) => vars[k] ?? '')

  const buildScript = () => {
    const name = userName || location?.name?.split(',')[0] || 'there'

    const vars = {
      location: location?.name || '',
      temp: Math.round(weather?.current?.temperature_2m || 0),
      feels: Math.round(todayStats?.feelsLike || 0),
      wind: Math.round(weather?.current?.wind_speed_10m || 0),
      gust: Math.round(weather?.daily?.wind_gusts_10m_max?.[0] || 0),
      humidity: weather?.current?.relative_humidity_2m || 0,
      uv: weather?.daily?.uv_index_max?.[0] || 0,
      prob:
        weather?.hourly?.precipitation_probability
          ?.slice(0, 2)
          .reduce((a, b) => Math.max(a, b), 0) || 0,
      hours: todayStats?.thunderHours || 0,
      level: getAqiLevel(aqi?.us_aqi).label,
      sunrise: weather?.daily?.sunrise?.[0]
        ? new Date(weather.daily.sunrise[0]).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        : '',
      sunset: weather?.daily?.sunset?.[0]
        ? new Date(weather.daily.sunset[0]).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        : ''
    }

    let script = `${greeting} ${name}. `

    if (briefMode) {
      const b = t.brief

      if (code >= 95) script += fill(b.storms, vars)
      else if (code >= 51) script += fill(b.rain, vars)
      else script += fill(b.current, vars)

      script += ' ' + fill(b.feels, vars) + ' '

      if (vars.prob >= 60) {
        script += b.rain2h + ' '
      } else if (todayStats?.maxRainProb >= 50) {
        script += fill(b.rainToday, {
          prob: todayStats.maxRainProb
        }) + ' '
      }

      if (vars.uv >= 8) script += b.uv + ' '

      if (aqi?.us_aqi > 100) script += b.aqi + ' '

      script += b.closing

      return script
    }

    if (code >= 95) script += fill(t.thunderstorms, vars)
    else if (code >= 51) script += fill(t.rain, vars)
    else if (code === 0 || code === 1) script += fill(t.clear, vars)
    else script += fill(t.cloudy, vars)

    script += ' ' + fill(t.temp, vars) + ' '

    if (vars.wind >= 20 || vars.gust >= 30)
      script += fill(t.windStrong, vars)
    else
      script += fill(t.windLight, vars)

    script += ' ' + fill(t.humidity, vars) + ' '

    if (vars.uv >= 8)
      script += fill(t.uvHigh, vars)
    else if (vars.uv >= 6)
      script += fill(t.uvModerate, vars)

    if (vars.prob >= 60) {
      script += fill(t.rainSoon, vars)
    } else if (todayStats?.maxRainProb >= 50) {
      script += fill(t.rainLater, {
        prob: todayStats.maxRainProb
      })
    } else {
      script += fill(t.noRain, {
        prob: todayStats?.maxRainProb || 0
      })
    }

    if (vars.hours > 0)
      script += ' ' + fill(t.thunder, vars)

    if (aqi?.us_aqi) {
      if (aqi.us_aqi > 100)
        script += ' ' + fill(t.aqiBad, vars)
      else
        script += ' ' + fill(t.aqiGood, vars)
    }

    script += ' ' + fill(t.sunrise, vars)
    script += ' ' + t.closing

    return script
  }

  const speakScript = async (
    customText = null,
    customVoice = null
  ) => {
    if (isSpeaking) {
      stopGlobal()
      return
    }

    const textToSpeak = customText || buildScript()
    const voiceToSpeak = customVoice || voiceToUse

    try {
      const res = await fetch(`${BACKEND_URL}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: textToSpeak,
          voice: voiceToSpeak,
          type: 'fair'
        })
      })

      const data = await res.json()

      if (data.success) {
        playGlobal(
          `${BACKEND_URL}${data.url}`,
          voiceToSpeak
        )
      } else {
        console.error('TTS failed:', data.error)
      }
    } catch (err) {
      console.error('TTS Error:', err)
    }
  }

  return (
    <ZephyeAIPanel
      weather={weather}
      todayStats={todayStats}
      aqi={aqi}
      location={location}
      voices={voices}
      selectedVoice={selectedVoice}
      setSelectedVoice={setSelectedVoice}
      userName={userName}
      setUserName={setUserName}
      briefMode={briefMode}
      setBriefMode={setBriefMode}
      isSpeaking={isSpeaking}
      speakScript={speakScript}
      buildScript={buildScript}
      getAqiLevel={getAqiLevel}
      lang={lang}
      voiceToUse={voiceToUse}
      greeting={greeting}
      askWeather={askWeather}
      isLoadingChat={isLoading}
    />
  )
  }
