import { 
  calcDewPoint, 
  getBurnTime, 
  calcHeatIndex,
  calcWindChill,
  getUVLevel,
  getComfortScore,
  random,
  getSeason,
  getTimeOfDay,
  calculateHumidityCategory,
  getAQICategory,
  getPollenIndex
} from './calculations';

// ============================================================================
// COMPREHENSIVE BEAUTY, SKIN & HAIR WEATHER ADVISORY SYSTEM
// ============================================================================

export const sampleQuestions = [
  // HAIR
  "Will my hair get frizzy today?",
  "Should I wash my hair today?",
  "Is it too humid for straight hair?",
  "Will my curls be defined today?",
  "Should I use anti-frizz serum?",
  "Is it a good curl day?",
  "Should I use gel or mousse?",
  "Will my edges lay down?",
  "Is it good for box braids?",
  "Should I wear a protective style?",
  "Will my silk press last?",
  "Is it too humid for a wig?",
  "Should I use edge control?",
  "Will my natural hair shrink?",
  "Is it good for a wash and go?",
  "Should I use a leave-in conditioner?",
  "Will my hair be static?",
  "Is it good for air drying?",
  "Should I diffuse or air dry?",
  "Will my hair get oily faster?",
  "Should I use dry shampoo?",
  "Is it a good scalp oil day?",
  "Will dandruff be worse?",
  "Should I use anti-dandruff shampoo?",
  "Is it good for hair growth treatment?",
  "Will my alopecia be affected?",
  "Should I cover my hair?",
  "Is it good for a hair appointment?",
  "Will my color process differently?",
  "Should I get a trim today?",
  "Is it good weather for a haircut?",
  "Will my bangs behave?",
  "Is it a good ponytail day?",
  "Will my baby hairs curl?",
  "Should I use a bonnet tonight?",
  "Is it good for overnight curls?",
  "Will humidity ruin my blowout?",
  "Should I use hair spray?",
  "Is it good for beach waves?",
  "Will sea salt spray work today?",
  
  // SKIN
  "Do I need sunscreen?",
  "Is it bad for my skin today?",
  "Should I moisturize more?",
  "Is the air drying my skin?",
  "Do I need a hat?",
  "Will I get sunburned?",
  "What's my skin type's weather risk?",
  "Will my acne flare up?",
  "Should I exfoliate today?",
  "Is it good weather for a facial?",
  "Will my rosacea act up?",
  "Should I use retinol tonight?",
  "Is the UV high enough to damage my skin indoors?",
  "Will my eczema be triggered?",
  "Will pollution age my skin today?",
  "Should I double cleanse tonight?",
  "Is it a good day for chemical peel?",
  "Will my Botox or fillers be affected?",
  "Should I use vitamin C serum?",
  "Is hyaluronic acid good for today?",
  "Will my psoriasis flare?",
  "Should I use a face oil today?",
  "Is it too hot for makeup?",
  "Will my sunscreen sweat off?",
  "Should I use waterproof makeup?",
  "Will my lips chap today?",
  "Do I need hand cream?",
  "Should I use cuticle oil?",
  "Will my feet get dry?",
  "Is it good weather for body scrub?",
  "Should I shave today?",
  "Will I get razor burn?",
  "Is it too dry for waxing?",
  "Should I use body oil or lotion?",
  "Will my perfume last?",
  
  // GENERAL
  "Is it a good brow day?",
  "Will my lash extensions last?",
  "Should I get a spray tan?",
  "Will my self-tanner streak?",
  "Is it good weather for laser treatment?",
  "Should I avoid the sun after my facial?"
];

// ============================================================================
// ENHANCED SKIN TYPE DATABASE
// ============================================================================

const SKIN_TYPES = {
  oily: {
    characteristics: 'Excess sebum, large pores, prone to acne and shine',
    weatherTriggers: {
      heat: 'Increases oil production 10% per 1°C rise in temperature',
      humidity: 'Traps oil on skin surface, clogs pores, leads to congestion',
      wind: 'Can strip surface oils causing rebound oil production',
      cold: 'Less oil production, but dry indoor heating causes dehydration',
      uvIndex: 'UV thickens skin causing more clogging, but initially dries acne'
    },
    routine: {
      morning: 'Gel cleanser with salicylic acid. Niacinamide serum. Lightweight gel moisturizer. SPF with matte finish.',
      evening: 'Double cleanse with oil cleanser then gel cleanser. Salicylic acid or glycolic acid. Niacinamide. Oil-free moisturizer.',
      weekly: 'Clay mask with kaolin or bentonite 1-2 times per week. BHA toner for pore clearing.',
      avoid: 'Heavy creams, facial oils, occlusives in T-zone. Coconut oil is highly comedogenic.'
    },
    products: {
      cleanser: 'Foaming or gel with salicylic acid or tea tree oil',
      moisturizer: 'Oil-free, gel-based with hyaluronic acid',
      sunscreen: 'Matte finish, zinc oxide is anti-inflammatory',
      treatment: 'Niacinamide for oil control, retinol for pore refinement',
      mask: 'Clay, charcoal, or sulfur based masks'
    }
  },
  dry: {
    characteristics: 'Tight, flaky, rough texture, fine lines more visible',
    weatherTriggers: {
      cold: 'Strips natural oils, damages moisture barrier',
      wind: 'Accelerates moisture loss through transepidermal water loss',
      humidity: 'High humidity helps. Dry skin loves moisture in the air.',
      heat: 'Dehydration from sweating without oil production',
      indoorHeating: 'Dries air to under 20 percent humidity causing moisture loss'
    },
    routine: {
      morning: 'Cream or lotion cleanser. Hyaluronic acid on damp skin. Rich moisturizer with ceramides. Hydrating SPF.',
      evening: 'Oil or balm cleanse. Cream cleanser. Hydrating toner. Face oil. Heavy night cream.',
      weekly: 'Gentle enzyme exfoliant. No physical scrubs. Hydrating sheet mask.',
      avoid: 'Foaming cleansers, alcohol toners, physical scrubs, clay masks'
    },
    products: {
      cleanser: 'Cream, milk, or oil-based. No sulfates or harsh surfactants.',
      moisturizer: 'Ceramides, shea butter, squalane, peptides',
      sunscreen: 'Hydrating formula with glycerin and antioxidants',
      treatment: 'Lactic acid (gentle AHA), ceramide serums',
      mask: 'Sheet masks, honey, aloe, oatmeal based masks'
    }
  },
  combination: {
    characteristics: 'Oily T-zone with dry or normal cheeks. Pores larger in center of face.',
    weatherTriggers: {
      heat: 'T-zone becomes oilier, cheeks stay relatively normal',
      humidity: 'T-zone congestion increases, cheeks may be fine',
      cold: 'Cheeks become dry and flaky, T-zone less oily',
      seasonal: 'Spring and summer means more oily. Fall and winter means more dry.'
    },
    routine: {
      morning: 'Gentle cleanser. Niacinamide everywhere. Light lotion (less on T-zone, more on cheeks). SPF.',
      evening: 'Double cleanse T-zone, single cleanse cheeks. Exfoliate T-zone only. Moisturize all areas.',
      weekly: 'Clay mask on T-zone only. Hydrating mask on cheeks. Multi-masking works best.',
      avoid: 'One-product-fits-all approach. Treat different zones differently.'
    },
    products: {
      cleanser: 'Gentle foaming or gel cleanser that is not stripping',
      moisturizer: 'Lightweight lotion or gel-cream hybrid formula',
      sunscreen: 'Lightweight, non-greasy, non-comedogenic',
      treatment: 'BHA on T-zone, AHA on cheeks. Niacinamide works everywhere.',
      mask: 'Multi-masking with clay on nose and chin, hydrating on cheeks'
    }
  },
  sensitive: {
    characteristics: 'Easily irritated, redness, stinging, reactive to products and weather',
    weatherTriggers: {
      wind: 'Major trigger causing windburn and barrier damage',
      temperatureExtremes: 'Both heat and cold trigger flushing and irritation',
      uvIndex: 'Sun is the number one rosacea and redness trigger',
      pollution: 'Particulates cause inflammation and oxidative stress',
      humidity: 'Rapid changes in humidity trigger reactions'
    },
    routine: {
      morning: 'Lukewarm water rinse or very gentle cleanser. Minimal product layering. Barrier cream. Mineral SPF only.',
      evening: 'Gentle cream cleanser. One treatment maximum. Rich barrier cream with ceramides.',
      weekly: 'No physical exfoliation. Enzyme mask if tolerated and well tolerated.',
      avoid: 'Fragrance, essential oils, alcohol, acids, retinoids (start very slow)'
    },
    products: {
      cleanser: 'Cream, non-foaming, fragrance-free, minimal ingredients',
      moisturizer: 'Ceramides, centella asiatica, panthenol. Minimal ingredients.',
      sunscreen: '100 percent mineral with zinc oxide and titanium dioxide. No chemical filters.',
      treatment: 'Azelaic acid, centella, green tea for anti-inflammatory benefits',
      mask: 'Colloidal oatmeal, honey, plain yogurt based masks'
    }
  },
  acne_prone: {
    characteristics: 'Active breakouts, clogged pores, post-inflammatory hyperpigmentation',
    weatherTriggers: {
      humidity: 'Traps bacteria, oil, and dead skin cells causing breakouts',
      sweating: 'Sweat combined with oil and bacteria equals body acne and face congestion',
      masks: 'Mask wearing combined with humidity equals maskne or acne mechanica',
      uvIndex: 'Sun darkens PIH and PIE marks. Some acne medications cause photosensitivity.',
      pollution: 'Particulates oxidize sebum causing more inflammatory acne'
    },
    routine: {
      morning: 'Salicylic acid cleanser. Niacinamide serum. Oil-free moisturizer. SPF that is non-comedogenic.',
      evening: 'Double cleanse with oil then cleanser. Treatment alternating retinoid or BHA. Light moisturizer.',
      weekly: 'Clay mask once per week. Pimple patches for active spots. Do NOT pick at anything.',
      avoid: 'Coconut oil, shea butter, isopropyl myristate, heavy occlusives'
    },
    products: {
      cleanser: 'Salicylic acid 2 percent or benzoyl peroxide 4-5 percent',
      moisturizer: 'Oil-free, non-comedogenic, gel texture',
      sunscreen: 'Matte, oil-free, non-comedogenic formula',
      treatment: 'Adapalene (Differin), benzoyl peroxide, salicylic acid, tea tree oil',
      mask: 'Sulfur, clay, or salicylic acid based masks'
    }
  },
  mature: {
    characteristics: 'Fine lines, wrinkles, loss of elasticity, thinner skin, drier texture',
    weatherTriggers: {
      uvIndex: 'CUMULATIVE damage. Every UV exposure adds up over decades.',
      cold: 'Increases appearance of lines and wrinkles due to dehydration',
      dryAir: 'Accelerates transepidermal water loss making lines more visible',
      pollution: 'Accelerates aging through free radicals and collagen breakdown',
      heat: 'Can increase collagen breakdown through inflammation'
    },
    routine: {
      morning: 'Gentle cleanser. Vitamin C serum. Peptide moisturizer. SPF 50 plus.',
      evening: 'Double cleanse. Retinoid on alternating nights. Rich night cream. Face oil.',
      weekly: 'Gentle AHA exfoliation. Hydrating mask. Facial massage for circulation.',
      avoid: 'Harsh cleansers, skipping SPF, aggressive treatments'
    },
    products: {
      cleanser: 'Cream or oil-based, hydrating formula',
      moisturizer: 'Peptides, ceramides, shea butter, squalane',
      sunscreen: 'SPF 50 plus broad spectrum. Tinted for blue light protection.',
      treatment: 'Retinoids like tretinoin, vitamin C, peptides, growth factors',
      mask: 'Hydrating, collagen, honey, or avocado based masks'
    }
  },
  hyperpigmentation: {
    characteristics: 'Dark spots, melasma, uneven skin tone, post-inflammatory marks',
    weatherTriggers: {
      uvIndex: 'NUMBER ONE TRIGGER. UV stimulates melanin production.',
      heat: 'Heat alone can trigger melasma, not just UV exposure.',
      visibleLight: 'Blue light from sun and screens can worsen melasma',
      hormones: 'Weather stress affects cortisol leading to hormonal pigmentation'
    },
    routine: {
      morning: 'Vitamin C serum. Tranexamic acid or niacinamide. SPF 50 plus tinted for blue light protection.',
      evening: 'Double cleanse. Brightening treatment alternating retinoid, AHA, or kojic acid. Moisturizer.',
      weekly: 'Gentle chemical exfoliation. Vitamin C mask. Avoid any physical exfoliation.',
      avoid: 'Sun exposure. Picking at skin. Harsh physical scrubs. Heat from saunas or hot yoga.'
    },
    products: {
      cleanser: 'Gentle, non-stripping formula',
      moisturizer: 'With niacinamide, licorice root, vitamin E',
      sunscreen: 'SPF 50 plus TINTED mineral. Iron oxides block visible light. Reapply every 2 hours.',
      treatment: 'Hydroquinone prescription, azelaic acid, kojic acid, tranexamic acid, alpha arbutin',
      mask: 'Turmeric, vitamin C, licorice, or niacinamide based masks'
    }
  }
};

// ============================================================================
// ENHANCED HAIR TYPE DATABASE
// ============================================================================

const HAIR_TYPES = {
  straight: {
    porosity: 'Low to normal',
    weatherResponse: {
      humidity: 'Goes limp, loses volume, gets greasy faster',
      dryAir: 'Static electricity, flyaways, and frizz',
      rain: 'Goes completely flat with water marks',
      wind: 'Tangles, knots, and breakage',
      heat: 'Scalp gets oily faster, hair goes limp'
    },
    styling: {
      goodWeather: 'Low dew point from 0-10°C provides volume, smoothness, no static',
      badWeather: 'High dew point over 16°C causes flat, greasy, no volume',
      products: 'Volumizing mousse, dry shampoo, texturizing spray, light hairspray',
      avoid: 'Heavy oils and thick creams will weigh down hair. Humidity ruins blowouts.'
    },
    tips: [
      'Dew point over 16°C: embrace your natural texture, heat styling will not hold',
      'Dew point under 0°C: static control needed. Dryer sheet on brush, anti-static spray',
      'Rain: silk scarf under hood or umbrella preserves style',
      'Oily scalp day: use dry shampoo at night to absorb oil while you sleep'
    ]
  },
  wavy: {
    porosity: 'Normal to high',
    weatherResponse: {
      humidity: 'Frizzes, waves become undefined, hair expands',
      dryAir: 'Waves fall flat, lacks definition and bounce',
      rain: 'Frizz explosion, waves disappear or go wild',
      wind: 'Tangles, knots, and breakage',
      heat: 'Scalp oil combined with humidity weighs down waves'
    },
    styling: {
      goodWeather: 'Dew point 10-16°C provides defined waves, minimal frizz, holds style',
      badWeather: 'Dew point over 18°C causes undefined, frizzy, unpredictable waves',
      products: 'Curl cream that is light, mousse, sea salt spray, anti-humidity spray',
      avoid: 'Heavy butters will weigh down waves. Brushing dry hair creates poof. Avoid touching hair.'
    },
    tips: [
      'Dew point 10-16°C: PERFECT wave day. Scrunch and go with light product.',
      'Dew point over 18°C: use gel cast method. Apply gel to wet hair, do not touch until dry, scrunch out the crunch.',
      'Wind: use protective style like braid, bun, or scarf',
      'Refreshing: use water and leave-in conditioner in spray bottle, then scrunch'
    ]
  },
  curly: {
    porosity: 'Normal to high',
    weatherResponse: {
      humidity: 'THE ENEMY. Frizz, undefined curls, expands to 2x normal size',
      dryAir: 'Curls fall flat, no volume, become brittle and dry',
      rain: 'Instant frizz reset. Day is ruined.',
      wind: 'Tangles cause breakage. Ruins curl pattern.',
      heat: 'Frizz combined with sweat creates scalp issues'
    },
    styling: {
      goodWeather: 'Dew point 10-16°C provides defined, bouncy curls with minimal frizz. Unicorn day.',
      badWeather: 'Dew point over 18°C causes undefined, frizzy curls with shrinkage and triangle shape.',
      products: 'Leave-in conditioner, curl cream, gel, anti-humidity serum',
      avoid: 'Sulfates, drying alcohols, touching hair, brushing when dry'
    },
    tips: [
      'Dew point over 21°C: use HUMIDITY-BLOCKING products. Avoid glycerin in high humidity.',
      'Dew point 10-16°C: glycerin-based products work beautifully to attract moisture',
      'Rain: use satin-lined hood or hat. Refresh with steam from shower, not water.',
      'Pineapple at night using loose high ponytail. Use satin pillowcase.',
      'Shrinkage: embrace it or stretch with banding method'
    ]
  },
  coily: {
    porosity: 'High',
    weatherResponse: {
      humidity: 'Frizz, shrinkage up to 75 percent of length, undefined curls',
      dryAir: 'Extremely dry, brittle, breakage risk is very high',
      rain: 'Massive shrinkage. Hours of work undone.',
      wind: 'Severe tangles. Breakage risk is very high.',
      heat: 'Scalp issues, dryness, and breakage'
    },
    styling: {
      goodWeather: 'Dew point 10-16°C provides defined, moisturized, manageable coils',
      badWeather: 'Dew point over 18°C causes massive shrinkage and frizz. Dew point under 0°C causes extreme dryness.',
      products: 'Heavy creams, butters, oils, leave-in conditioner, gel',
      avoid: 'Sulfates, drying alcohols, mineral oil, petrolatum which builds up'
    },
    tips: [
      'LOC or LCO method: Liquid, Oil, Cream or Liquid, Cream, Oil for best moisture retention',
      'Dew point over 21°C: use protective style like braids, twists, bun, or wig',
      'Dew point under 0°C: deep condition weekly, hot oil treatments, protective styles',
      'Satin-lined everything: bonnet, pillowcase, scarf, and hood',
      'Shrinkage: banding, threading, or embrace it. Shrinkage means healthy hair.'
    ]
  },
  chemically_treated: {
    porosity: 'Very high with damaged cuticle',
    weatherResponse: {
      humidity: 'Frizz extreme, keratin or relaxer reverses slightly, color fades',
      dryAir: 'Already porous hair loses moisture very rapidly',
      rain: 'Keratin treatment can spot. Color can bleed.',
      uvIndex: 'UV fades color and damages already compromised structure',
      wind: 'Tangles and breaks very easily'
    },
    styling: {
      goodWeather: 'Dry, cool days with minimal humidity',
      badWeather: 'Any extreme. Chemically treated hair is always compromised.',
      products: 'Bond builders like Olaplex or K18, protein treatments, sulfate-free everything',
      avoid: 'Heat styling without protection, sulfates, salt water, chlorine'
    },
    tips: [
      'UV protection: use hair SPF or wear a hat. Color fades 2x faster in high UV.',
      'Swimming: wet hair with clean water and apply leave-in before pool or ocean',
      'Bond builder every wash. Your hair structure is compromised.',
      'Satin pillowcase and bonnet ALWAYS. Hair is already fragile.',
      'Keratin: wait 72 hours before moisture from rain, sweat, or washing'
    ]
  },
  gray_silver: {
    porosity: 'Low to normal with coarser texture',
    weatherResponse: {
      humidity: 'Frizzes, yellows from pollution, goes brassy',
      uvIndex: 'Photodamage causes yellowing and brassiness',
      pollution: 'Particulates deposit on hair causing dullness and yellow-gray color',
      hardWater: 'Mineral deposits cause brassiness and dullness',
      wind: 'Tangles and flyaways'
    },
    styling: {
      goodWeather: 'Cool, dry, low UV conditions',
      badWeather: 'High UV, high humidity, high pollution conditions',
      products: 'Purple or blue shampoo, anti-brass conditioner, UV protectant',
      avoid: 'Chlorine which turns hair green-yellow, excessive heat'
    },
    tips: [
      'Purple shampoo 1-2 times per week to neutralize yellow. Do not overuse or it creates purple tint.',
      'UV protectant spray is essential. Gray hair has no melanin protection.',
      'Filter shower water if hard water. Minerals cause brassiness.',
      'Silk or satin pillowcase reduces friction and yellowing at friction points.'
    ]
  }
};

// ============================================================================
// ENHANCED MAKEUP WEATHER INDEX
// ============================================================================

function getMakeupAdvice(data) {
  const { temp, humidity, wind, condition, uvIndex, dewPoint } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const advice = {
    base: [],
    eyes: [],
    lips: [],
    setting: [],
    touchUp: [],
    special: []
  };
  
  // Extreme heat
  if (heatIndex > 35) {
    advice.base.push("EXTREME HEAT: Foundation will melt. Consider skipping or using tinted moisturizer.");
    advice.base.push("Primer should be mattifying and gripping. Foundation should be long-wear and oil-free.");
    advice.setting.push("Setting spray should be mattifying. Use setting powder with baking method.");
    advice.touchUp.push("Use blotting papers every 2 hours. Keep powder compact for touch-ups.");
    advice.eyes.push("Waterproof EVERYTHING. Cream shadows work better than powder which creases in heat.");
    advice.lips.push("Lip stain works better than lipstick. Gloss will melt. Use tinted balm with SPF.");
    advice.special.push("Carry mini fan or cooling spray for makeup meltdown prevention.");
    
  } else if (heatIndex > 28) {
    advice.base.push("Hot day: use lightweight base like BB cream or skin tint.");
    advice.setting.push("Setting spray is essential. Use light powder only on T-zone.");
    advice.touchUp.push("Blotting papers. Avoid layering powder which becomes cakey.");
    
  } else if (temp < 5) {
    advice.base.push("Cold weather: use hydrating primer. Dewy foundation works best as skin looks dry in cold.");
    advice.base.push("Mix facial oil with foundation for extra hydration and glow.");
    advice.lips.push("Use heavy lip balm under lipstick. Matte lips will crack in cold.");
    advice.setting.push("Use dewy finish setting spray. Avoid heavy powder which settles in dry patches.");
    advice.special.push("Apply moisturizer 10 minutes before makeup for better absorption.");
  }
  
  // High humidity
  if (humidity > 80) {
    advice.base.push("HIGH HUMIDITY: Use oil-free everything. Silicone-based primer works best.");
    advice.setting.push("Setting powder is crucial. Sandwich method: powder, setting spray, powder.");
    advice.eyes.push("Eyeshadow primer is essential even for no shadow look.");
    advice.eyes.push("Waterproof mascara. Tubing mascara is best as it does not smudge.");
    advice.touchUp.push("Blotting papers. Oil-absorbing roller helps control shine.");
    advice.special.push("Consider powder foundation instead of liquid in extreme humidity.");
  }
  
  // Wind
  if (wind > 20) {
    advice.eyes.push("Wind: contacts dry out. Use glasses or eye drops. Waterproof mascara is essential.");
    advice.base.push("Wind causes watery eyes. Use concealer under eyes. Skip lower lash mascara.");
    advice.lips.push("Sticky gloss traps hair. Use lipstick or lip stain only.");
    advice.special.push("Use setting spray with fixing ingredients for wind resistance.");
  }
  
  // Rain
  if (condition === 'rain' || condition === 'drizzle') {
    advice.base.push("Rain: use waterproof face products. Cream products work better than powder.");
    advice.eyes.push("Waterproof mascara and eyeliner MANDATORY. Tubing mascara provides zero smudge.");
    advice.setting.push("Use waterproof setting spray with extra layer.");
    advice.lips.push("Long-wear liquid lipstick. No gloss which washes off.");
    advice.special.push("Keep umbrella and touch-up products in bag.");
  }
  
  return advice;
}

// ============================================================================
// ENHANCED SKIN BARRIER ASSESSMENT
// ============================================================================

function getBarrierHealth(data) {
  const { temp, humidity, wind, uvIndex, condition, dewPoint, aqi } = data;
  const assessment = {
    score: 100,
    threats: [],
    protection: [],
    recovery: [],
    urgency: 'Low'
  };
  
  // Temperature stress
  if (temp < -5) {
    assessment.score -= 30;
    assessment.threats.push("Freezing temperatures damage skin barrier lipids and cell membranes");
    assessment.protection.push("Occlusive balm like Vaseline, Aquaphor, or CeraVe Healing Ointment");
    assessment.recovery.push("Ceramide-rich cream at night to rebuild barrier");
    assessment.urgency = 'High';
    
  } else if (temp < 0) {
    assessment.score -= 20;
    assessment.threats.push("Below freezing temperatures stress the skin barrier");
    assessment.protection.push("Thick occlusive layer before going outside");
    assessment.recovery.push("Ceramide and fatty acid rich moisturizer at night");
    assessment.urgency = 'Moderate';
    
  } else if (temp > 35) {
    assessment.score -= 20;
    assessment.threats.push("Heat increases inflammation and oxidative stress on skin");
    assessment.protection.push("Antioxidant serum like Vitamin C and ferulic acid under SPF");
    assessment.recovery.push("Cooling gel and aloe vera to calm inflammation");
    assessment.urgency = 'Moderate';
    
  } else if (temp > 32) {
    assessment.score -= 10;
    assessment.threats.push("High heat causes barrier stress and inflammation");
    assessment.protection.push("Antioxidant serum for protection");
  }
  
  // Wind damage
  if (wind > 35) {
    assessment.score -= 25;
    assessment.threats.push("Wind strips moisture barrier causing windburn");
    assessment.protection.push("Thick occlusive layer. Scarf or face covering.");
    assessment.recovery.push("Centella asiatica, panthenol, and allantoin for barrier repair");
    assessment.urgency = 'High';
    
  } else if (wind > 25) {
    assessment.score -= 15;
    assessment.threats.push("Wind accelerates moisture loss from barrier");
    assessment.protection.push("Barrier cream with ceramides");
    assessment.recovery.push("Soothing ingredients like centella");
  }
  
  // UV damage
  if (uvIndex > 9) {
    assessment.score -= 20;
    assessment.threats.push("Extreme UV radiation degrades collagen and damages barrier");
    assessment.protection.push("SPF 50+ PA++++. Reapply every 2 hours. Hat and sunglasses.");
    assessment.recovery.push("Antioxidant serum at night. Aloe vera for any redness.");
    assessment.urgency = 'High';
    
  } else if (uvIndex > 6) {
    assessment.score -= 10;
    assessment.threats.push("UV radiation causes oxidative stress on barrier");
    assessment.protection.push("SPF 50+ with antioxidants");
  }
  
  // Dry air
  if (humidity < 20) {
    assessment.score -= 20;
    assessment.threats.push("Extremely dry air pulls moisture from skin through TEWL");
    assessment.protection.push("Hyaluronic acid on damp skin plus occlusive to seal");
    assessment.recovery.push("Humidifier at night. Sheet mask. Layer hydrating products.");
    assessment.urgency = 'Moderate';
    
  } else if (humidity < 30) {
    assessment.score -= 10;
    assessment.threats.push("Dry air increases transepidermal water loss");
    assessment.protection.push("Hydrating toner and moisturizer");
  }
  
  // Pollution
  if (aqi > 150) {
    assessment.score -= 15;
    assessment.threats.push("High pollution causes oxidative stress and barrier damage");
    assessment.protection.push("Antioxidant serum in morning. Double cleanse at night.");
    assessment.recovery.push("Detoxifying mask. Niacinamide for barrier repair.");
    assessment.urgency = 'Moderate';
    
  } else if (aqi > 100) {
    assessment.score -= 10;
    assessment.threats.push("Particulate matter causes oxidative stress");
    assessment.protection.push("Antioxidant serum AM. Double cleanse PM.");
  }
  
  assessment.score = Math.max(0, Math.min(100, assessment.score));
  
  if (assessment.score < 30) {
    assessment.urgency = 'Critical';
  } else if (assessment.score < 50) {
    assessment.urgency = 'High';
  } else if (assessment.score < 70) {
    assessment.urgency = 'Moderate';
  } else {
    assessment.urgency = 'Low';
  }
  
  return assessment;
}

// ============================================================================
// ENHANCED DEW POINT HAIR BEHAVIOR PREDICTOR
// ============================================================================

function getDewPointHairBehavior(dewPoint, hairType) {
  const behavior = {
    frizz: '',
    definition: '',
    volume: '',
    moisture: '',
    styling: '',
    products: [],
    recommendations: []
  };
  
  if (dewPoint > 21) {
    behavior.frizz = 'EXTREME - Hair will absorb moisture from air, cuticle swells, frizz is inevitable';
    behavior.definition = 'Curly and coily: curl pattern completely disrupted. Straight and wavy: goes flat and fuzzy.';
    behavior.volume = 'Curly and coily: VOLUME EXPLOSION at 2-3 times normal. Straight: limp with no volume.';
    behavior.moisture = 'Hair absorbs so much moisture it becomes over-moisturized causing hygral fatigue';
    behavior.styling = 'Do NOT heat style. Embrace natural texture. Protective styles work best.';
    behavior.products = [
      'Anti-humectant products to block moisture absorption',
      'Silicone-based serums to seal the cuticle',
      'AVOID glycerin which attracts moisture',
      'Hard-hold gel for curly and coily hair',
      'Dry shampoo for straight hair to absorb excess moisture'
    ];
    behavior.recommendations = [
      'Consider protective styling: braids, twists, buns, or wigs',
      'Use diffuser on low heat if blow drying',
      'Apply product in shower on soaking wet hair',
      'Do not touch hair until completely dry'
    ];
    
  } else if (dewPoint > 16) {
    behavior.frizz = 'MODERATE-HIGH - Some frizz, especially for curly and coily hair types';
    behavior.definition = 'Curly: some definition possible with effort. Wavy: may lose pattern. Straight: acceptable.';
    behavior.volume = 'Slight expansion. Manageable with right products.';
    behavior.moisture = 'Slightly over-moisturized. Hair feels soft but can get limp.';
    behavior.styling = 'Heat style with anti-humidity products. Will hold moderately well.';
    behavior.products = [
      'Light anti-humidity spray',
      'Curl cream with moderate hold',
      'Mousse for volume enhancement',
      'Lightweight leave-in conditioner'
    ];
    behavior.recommendations = [
      'Use heat protectant before any heat styling',
      'Allow hair to cool completely before touching',
      'Consider diffusing for curly hair'
    ];
    
  } else if (dewPoint > 10) {
    behavior.frizz = 'LOW - This is the IDEAL dew point range';
    behavior.definition = 'PERFECT definition for all hair types';
    behavior.volume = 'Optimal volume and body';
    behavior.moisture = 'Balanced. Hair retains proper moisture without frizz.';
    behavior.styling = 'Anything works. Heat style, air dry, whatever you want.';
    behavior.products = [
      'Normal routine works perfectly',
      'Glycerin-based products work well by attracting right amount of moisture',
      'Light hold products are sufficient'
    ];
    behavior.recommendations = [
      'Enjoy your hair day. Everything will work.',
      'Experiment with different styles',
      'Good day for important events'
    ];
    
  } else if (dewPoint > 0) {
    behavior.frizz = 'LOW - But static may begin to appear';
    behavior.definition = 'Good definition. Slightly drier than ideal.';
    behavior.volume = 'Good volume. May start to get flyaways.';
    behavior.moisture = 'Starting to dry out. Hair may feel slightly brittle.';
    behavior.styling = 'Heat style with heat protectant. Air dry works but slower.';
    behavior.products = [
      'Leave-in conditioner for moisture',
      'Light oil for ends',
      'Anti-static spray',
      'Cream-based stylers work better than gels'
    ];
    behavior.recommendations = [
      'Deep condition before styling',
      'Use humidifier in bedroom at night',
      'Avoid over-brushing which causes static'
    ];
    
  } else {
    behavior.frizz = 'NONE - But extreme static and brittleness present';
    behavior.definition = 'Hair is dry, brittle, and may break. Does not hold curl well.';
    behavior.volume = 'Flyaways and static. Hair stands up.';
    behavior.moisture = 'CRITICALLY DRY. Moisture is being pulled OUT of hair.';
    behavior.styling = 'Avoid heat styling. Deep condition. Protective styles. No tight styles.';
    behavior.products = [
      'Heavy leave-in conditioner for moisture',
      'Hair oil like argan, jojoba, or castor oil',
      'Deep conditioning mask weekly',
      'Humidifier at night for moisture',
      'Anti-static spray for control',
      'AVOID alcohol-based products'
    ];
    behavior.recommendations = [
      'Protective style highly recommended',
      'Apply oil to ends daily',
      'Wear satin bonnet at night',
      'Consider hot oil treatment'
    ];
  }
  
  return behavior;
}

// ============================================================================
// ENHANCED UV SKIN DAMAGE CALCULATOR
// ============================================================================

function getUVSkinAdvice(uvIndex, skinType, medications = []) {
  const advice = {
    spf: '',
    reapply: '',
    extra: [],
    burnRisk: '',
    longTerm: [],
    photosensitivity: []
  };
  
  const fitzpatrickTypes = {
    'type1': { description: 'Very fair skin, always burns, never tans', burnTime: 5, spf: '50+', risk: 'Extreme' },
    'type2': { description: 'Fair skin, usually burns, tans minimally', burnTime: 10, spf: '50+', risk: 'Very High' },
    'type3': { description: 'Medium skin, sometimes burns, tans gradually', burnTime: 15, spf: '30+', risk: 'High' },
    'type4': { description: 'Olive skin, rarely burns, tans easily', burnTime: 20, spf: '30', risk: 'Moderate' },
    'type5': { description: 'Brown skin, very rarely burns, tans very easily', burnTime: 30, spf: '15-30', risk: 'Lower' },
    'type6': { description: 'Deeply pigmented skin, almost never burns', burnTime: 45, spf: '15+', risk: 'Low but present' }
  };
  
  const fitz = fitzpatrickTypes[skinType] || fitzpatrickTypes['type3'];
  const actualBurnTime = fitz.burnTime * (1 / (uvIndex / 3));
  
  advice.burnRisk = `${fitz.description}. Estimated burn time: ${Math.round(actualBurnTime)} minutes at UV ${uvIndex}.`;
  advice.spf = `SPF ${fitz.spf} minimum. Broad spectrum UVA and UVB protection. PA++++ rating.`;
  
  if (uvIndex > 11) {
    advice.reapply = 'Every 45-60 minutes. UV this high breaks down sunscreen rapidly. Set phone timer.';
    advice.extra.push('UPF 50+ clothing if outside over 30 minutes');
    advice.extra.push('Wide-brim hat with 10cm or more brim');
    advice.extra.push('UV-blocking sunglasses to protect eyes and delicate eye area');
    advice.extra.push('Seek shade from 10am to 4pm');
    advice.longTerm.push('This UV level causes DNA damage in skin cells. Cumulative effect is serious.');
    
  } else if (uvIndex > 8) {
    advice.reapply = 'Every 1.5 hours. After swimming or sweating: apply immediately.';
    advice.extra.push('Hat and sunglasses recommended');
    advice.extra.push('Limit direct exposure 11am to 3pm');
    
  } else if (uvIndex > 6) {
    advice.reapply = 'Every 2 hours if outside continuously.';
    advice.extra.push('Sunglasses recommended for eye protection');
    
  } else if (uvIndex > 3) {
    advice.reapply = 'Reapply if outside over 4 hours.';
  } else {
    advice.reapply = 'Standard application is sufficient.';
  }
  
  // Photosensitivity from medications
  const photosensitiveMeds = [
    'tetracycline', 'doxycycline', 'minocycline',
    'ibuprofen', 'naproxen', 'ketoprofen',
    'isotretinoin', 'tretinoin', 'adapalene',
    'hydrochlorothiazide', 'furosemide',
    'amiodarone', 'quinidine',
    'sulfonylureas', 'thiazides'
  ];
  
  for (const med of medications) {
    if (photosensitiveMeds.some(m => med.toLowerCase().includes(m))) {
      advice.photosensitivity.push(`${med} increases photosensitivity. Extra UV protection required.`);
    }
  }
  
  advice.longTerm.push('UVA rays cause aging and penetrate clouds and glass. Daily SPF even indoors.');
  advice.longTerm.push('Skin cancer: 90 percent of non-melanoma skin cancers are caused by UV exposure.');
  advice.longTerm.push('Photoaging: 80 percent of visible skin aging comes from UV damage.');
  
  return advice;
}

// ============================================================================
// ENHANCED MAIN SKIN & HAIR ADVICE FUNCTION
// ============================================================================

export const getSkinHairAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, humidity, uvIndex, wind, condition, feelsLike,
    aqi, dewPoint, visibility, tempMin, tempMax,
    precipitation
  } = data;
  
  const q = question.toLowerCase();
  
  const calculatedDewPoint = dewPoint || calcDewPoint(temp, humidity);
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : feelsLike;
  const burnMin = getBurnTime(uvIndex);
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const season = getSeason();
  const timeOfDay = getTimeOfDay();
  const humidityCategory = calculateHumidityCategory(humidity);
  const aqiCategory = getAQICategory(aqi);
  
  // Detect skin type from question
  let skinType = 'type3';
  if (q.includes('oily') || q.includes('acne') || q.includes('breakout')) skinType = 'oily';
  if (q.includes('dry skin') || q.includes('flake') || q.includes('tight')) skinType = 'dry';
  if (q.includes('combination') || q.includes('t zone')) skinType = 'combination';
  if (q.includes('sensitive') || q.includes('rosacea') || q.includes('redness')) skinType = 'sensitive';
  if (q.includes('mature') || q.includes('aging') || q.includes('wrinkle')) skinType = 'mature';
  if (q.includes('dark spot') || q.includes('melasma') || q.includes('hyperpigmentation')) skinType = 'hyperpigmentation';
  
  // Detect hair type from question
  let hairType = 'wavy';
  if (q.includes('curly') || q.includes('curl')) hairType = 'curly';
  if (q.includes('coily') || q.includes('kinky') || q.includes('4c') || q.includes('afro')) hairType = 'coily';
  if (q.includes('straight') || q.includes('flat iron')) hairType = 'straight';
  if (q.includes('color') || q.includes('dye') || q.includes('bleach') || q.includes('keratin') || q.includes('relaxer')) hairType = 'chemically_treated';
  if (q.includes('gray') || q.includes('grey') || q.includes('silver') || q.includes('white hair')) hairType = 'gray_silver';
  
  const skinConfig = SKIN_TYPES[skinType] || SKIN_TYPES['combination'];
  const hairConfig = HAIR_TYPES[hairType] || HAIR_TYPES['wavy'];
  const dewBehavior = getDewPointHairBehavior(calculatedDewPoint, hairType);
  const uvAdvice = getUVSkinAdvice(uvIndex, skinType);
  const makeupAdvice = getMakeupAdvice(data);
  const barrier = getBarrierHealth(data);
  
  // ========================================================================
  // BUILD RESPONSE
  // ========================================================================
  
  let response = "";
  
  // Header
  const intros = [
    "BEAUTY AND SKINCARE WEATHER ADVISORY",
    "SKIN AND HAIR CONDITIONS REPORT",
    "BEAUTY WEATHER ASSESSMENT",
    "GLAMOUR WEATHER ANALYSIS",
    "BEAUTY ROUTINE ADVISORY"
  ];
  response += `=== ${random(intros)} ===\n`;
  response += `\n`;
  
  // Current conditions
  response += `CURRENT CONDITIONS:\n`;
  response += `  Temperature: ${Math.round(temp)}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  response += `  Daily range: ${Math.round(tempMin)}°C to ${Math.round(tempMax)}°C\n`;
  response += `  Dew Point: ${Math.round(calculatedDewPoint * 10) / 10}°C (${calculatedDewPoint > 18 ? 'VERY HUMID' : calculatedDewPoint > 15 ? 'HUMID' : calculatedDewPoint > 10 ? 'IDEAL' : calculatedDewPoint > 5 ? 'DRY' : 'VERY DRY'})\n`;
  response += `  Humidity: ${Math.round(humidity)}% (${humidityCategory})\n`;
  response += `  Wind: ${Math.round(wind)} km/h\n`;
  response += `  UV Index: ${uvIndex} (${getUVLevel(uvIndex)}) - burn time ~${burnMin} minutes\n`;
  response += `  Air Quality: AQI ${aqi} (${aqiCategory})\n`;
  if (precipitation > 0) response += `  Precipitation: ${Math.round(precipitation)}mm\n`;
  response += `  Season: ${season.charAt(0).toUpperCase() + season.slice(1)}\n`;
  response += `\n`;
  
  // Beauty score
  const beautyScore = Math.max(0, 100 - 
    (calculatedDewPoint > 18 ? 30 : calculatedDewPoint > 14 ? 15 : calculatedDewPoint < 0 ? 25 : 0) -
    (uvIndex > 8 ? 20 : uvIndex > 6 ? 10 : 0) -
    (wind > 30 ? 20 : wind > 20 ? 10 : 0) -
    (temp > 35 ? 20 : temp < -5 ? 20 : 0) -
    (aqi > 150 ? 15 : aqi > 100 ? 10 : 0)
  );
  
  response += `=== BEAUTY WEATHER SCORE ===\n`;
  response += `  Score: ${beautyScore}/100\n`;
  
  let beautyRating = '';
  if (beautyScore > 80) beautyRating = 'EXCELLENT - Perfect beauty conditions';
  else if (beautyScore > 65) beautyRating = 'GOOD - Minor adjustments needed';
  else if (beautyScore > 50) beautyRating = 'FAIR - Several weather factors at play';
  else if (beautyScore > 35) beautyRating = 'POOR - Challenging conditions';
  else beautyRating = 'DIFFICULT - Weather actively working against you';
  
  response += `  Rating: ${beautyRating}\n`;
  response += `\n`;
  
  // Hair section
  response += `=== HAIR CARE ===\n`;
  response += `  Hair type: ${hairType.toUpperCase()}\n`;
  response += `  Dew point behavior: ${dewBehavior.frizz}\n`;
  response += `  Definition: ${dewBehavior.definition}\n`;
  response += `  Volume: ${dewBehavior.volume}\n`;
  response += `  Moisture: ${dewBehavior.moisture}\n`;
  response += `  Styling: ${dewBehavior.styling}\n`;
  
  if (dewBehavior.products.length > 0) {
    response += `  Recommended products:\n`;
    dewBehavior.products.slice(0, 4).forEach(p => response += `    - ${p}\n`);
  }
  
  if (dewBehavior.recommendations.length > 0) {
    response += `  Recommendations:\n`;
    dewBehavior.recommendations.forEach(r => response += `    - ${r}\n`);
  }
  
  // Hair type specific tips
  if (hairConfig.tips) {
    response += `  ${hairType.toUpperCase()} tips:\n`;
    hairConfig.tips.slice(0, 4).forEach(t => response += `    - ${t}\n`);
  }
  response += `\n`;
  
  // Skin section
  response += `=== SKINCARE ===\n`;
  response += `  Skin type: ${skinType.replace(/_/g, ' ').toUpperCase()}\n`;
  response += `  ${skinConfig.characteristics}\n`;
  
  // UV advice
  response += `  UV Protection:\n`;
  response += `    ${uvAdvice.spf}\n`;
  response += `    Reapply: ${uvAdvice.reapply}\n`;
  uvAdvice.extra.forEach(e => response += `    - ${e}\n`);
  if (uvAdvice.photosensitivity.length > 0) {
    uvAdvice.photosensitivity.forEach(p => response += `    ${p}\n`);
  }
  
  // Skin routine
  if (skinConfig.routine) {
    response += `  Morning routine: ${skinConfig.routine.morning}\n`;
    response += `  Evening routine: ${skinConfig.routine.evening}\n`;
    response += `  Weekly: ${skinConfig.routine.weekly}\n`;
    response += `  Avoid: ${skinConfig.routine.avoid}\n`;
  }
  
  // Product recommendations
  if (skinConfig.products) {
    response += `  Recommended products:\n`;
    for (const [key, value] of Object.entries(skinConfig.products)) {
      response += `    - ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
    }
  }
  
  // Weather triggers
  if (skinConfig.weatherTriggers) {
    response += `  Weather triggers:\n`;
    for (const [key, value] of Object.entries(skinConfig.weatherTriggers)) {
      response += `    - ${key}: ${value}\n`;
    }
  }
  response += `\n`;
  
  // Barrier health
  response += `=== SKIN BARRIER HEALTH ===\n`;
  response += `  Score: ${barrier.score}/100\n`;
  response += `  Urgency: ${barrier.urgency}\n`;
  if (barrier.threats.length > 0) {
    response += `  Threats:\n`;
    barrier.threats.forEach(t => response += `    - ${t}\n`);
  }
  if (barrier.protection.length > 0) {
    response += `  Protection:\n`;
    barrier.protection.forEach(p => response += `    - ${p}\n`);
  }
  if (barrier.recovery.length > 0) {
    response += `  Recovery:\n`;
    barrier.recovery.forEach(r => response += `    - ${r}\n`);
  }
  response += `\n`;
  
  // Makeup advice
  if (temp > 28 || humidity > 75 || wind > 20 || isRaining) {
    response += `=== MAKEUP STRATEGY ===\n`;
    if (makeupAdvice.base.length > 0) {
      response += `  Base:\n`;
      makeupAdvice.base.forEach(b => response += `    - ${b}\n`);
    }
    if (makeupAdvice.eyes.length > 0) {
      response += `  Eyes:\n`;
      makeupAdvice.eyes.forEach(e => response += `    - ${e}\n`);
    }
    if (makeupAdvice.lips.length > 0) {
      response += `  Lips:\n`;
      makeupAdvice.lips.forEach(l => response += `    - ${l}\n`);
    }
    if (makeupAdvice.setting.length > 0) {
      response += `  Setting:\n`;
      makeupAdvice.setting.forEach(s => response += `    - ${s}\n`);
    }
    if (makeupAdvice.touchUp.length > 0) {
      response += `  Touch-up:\n`;
      makeupAdvice.touchUp.forEach(t => response += `    - ${t}\n`);
    }
    if (makeupAdvice.special.length > 0) {
      response += `  Special:\n`;
      makeupAdvice.special.forEach(s => response += `    - ${s}\n`);
    }
    response += `\n`;
  }
  
  // Seasonal routine adjustments
  response += `=== SEASONAL ROUTINE ADJUSTMENTS ===\n`;
  if (season === 'winter') {
    response += `  WINTER SWITCH:\n`;
    response += `    - Cleanser: Use cream or milk cleanser, not foaming\n`;
    response += `    - Moisturizer: Use heavier cream. Add face oil.\n`;
    response += `    - SPF: Still essential. Snow reflects 80% UV = double exposure.\n`;
    response += `    - Hair: Deep condition weekly. Use humidifier at night.\n`;
  } else if (season === 'summer') {
    response += `  SUMMER SWITCH:\n`;
    response += `    - Cleanser: Use gel or foaming for oil control\n`;
    response += `    - Moisturizer: Lightweight, oil-free, gel texture\n`;
    response += `    - SPF: Water-resistant for sweat and swimming\n`;
    response += `    - Hair: Use anti-humidity products. Clarify weekly.\n`;
  } else if (season === 'spring') {
    response += `  SPRING SWITCH:\n`;
    response += `    - Transition to lighter moisturizers\n`;
    response += `    - Start using antioxidant serums\n`;
    response += `    - Pollen protection: cleanse face after being outside\n`;
    response += `    - Hair: Clarify to remove winter buildup\n`;
  } else if (season === 'fall') {
    response += `  FALL SWITCH:\n`;
    response += `    - Transition to richer moisturizers\n`;
    response += `    - Repair summer damage with treatments\n`;
    response += `    - Hair: Deep condition and trim damaged ends\n`;
  }
  response += `\n`;
  
  // Long-term UV advice
  response += `=== LONG-TERM SKINCARE ===\n`;
  uvAdvice.longTerm.forEach(lt => response += `  ${lt}\n`);
  response += `\n`;
  
  // Warnings
  if (barrier.score < 50 || uvIndex > 8 || wind > 30 || temp < -5) {
    response += `=== WARNINGS ===\n`;
    if (barrier.score < 50) {
      response += `  SKIN BARRIER COMPROMISED. Use gentle products only.\n`;
      response += `  No exfoliation. Focus on barrier repair.\n`;
    }
    if (uvIndex > 8) {
      response += `  EXTREME UV. Avoid sun exposure 10am-4pm.\n`;
      response += `  Reapply sunscreen every 2 hours. Wear UPF clothing.\n`;
    }
    if (wind > 30) {
      response += `  STRONG WIND. Protect skin with occlusive balm.\n`;
      response += `  Windburn and moisture loss risk is high.\n`;
    }
    if (temp < -5) {
      response += `  EXTREME COLD. Frostbite risk on exposed skin.\n`;
      response += `  Cover all skin. Use rich barrier cream.\n`;
    }
    response += `\n`;
  }
  
  // Bottom line
  response += `=== BOTTOM LINE ===\n`;
  if (beautyScore > 80) {
    response += `  PERFECT BEAUTY DAY. Skin and hair will cooperate.\n`;
    response += `  Great for: important events, photos, and date night.\n`;
  } else if (beautyScore > 65) {
    response += `  GOOD BEAUTY DAY with minor adjustments.\n`;
    response += `  Follow recommendations above for best results.\n`;
  } else if (beautyScore > 50) {
    response += `  CHALLENGING DAY. Prioritize protective styles and barrier care.\n`;
    response += `  Use recommended products for your skin and hair type.\n`;
  } else {
    response += `  DIFFICULT BEAUTY DAY. Stay inside if possible.\n`;
    response += `  Tonight: deep condition hair, intensive skin barrier treatment.\n`;
  }
  
  const wisdom = [
    "Invest in your skin. It is going to represent you for a very long time.",
    "Beautiful skin requires commitment, not a miracle.",
    "Your skin is your best accessory. Take care of it.",
    "Healthy hair is a crown you never take off.",
    "Beauty is about being comfortable in your own skin.",
    "The best foundation you can wear is healthy, glowing skin."
  ];
  response += `\n--- BEAUTY WISDOM ---\n${random(wisdom)}`;
  
  return response;
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { 
  getDewPointHairBehavior, 
  getUVSkinAdvice, 
  getBarrierHealth, 
  getMakeupAdvice,
  SKIN_TYPES,
  HAIR_TYPES
};

export default getSkinHairAdvice;
