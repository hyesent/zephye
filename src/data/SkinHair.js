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
  "Will my hair get frizzy today?",
  "Do I need sunscreen?",
  "Is it bad for my skin today?",
  "Will my makeup melt?",
  "Should I moisturize more?",
  "Is the air drying my skin?",
  "Do I need a hat?",
  "Will I get sunburned?",
  "Is it humid enough for curly hair?",
  "What's my skin type's weather risk?",
  "Will my acne flare up?",
  "Should I exfoliate today?",
  "Is it good weather for a facial?",
  "Will my rosacea act up?",
  "Should I use retinol tonight?",
  "Is the UV high enough to damage my skin indoors?",
  "Will my eczema be triggered?",
  "Should I do a hair mask today?",
  "Will my color-treated hair fade faster?",
  "Is it a good day for a blowout?",
  "Should I use heat protectant?",
  "Will my keratin treatment last?",
  "Is it too humid for straight hair?",
  "Should I wash my hair today?",
  "Will my scalp get sunburned?",
  "Do I need UV protection for my hair?",
  "Will pollution age my skin today?",
  "Should I double cleanse tonight?",
  "Is it a good day for chemical peel?",
  "Will my Botox/fillers be affected?",
  "Should I use vitamin C serum?",
  "Is hyaluronic acid good for today?",
  "Will my psoriasis flare?",
  "Should I use a face oil today?",
  "Is it too hot for makeup?",
  "Will my sunscreen sweat off?",
  "Should I use waterproof makeup?",
  "Is it a good brow day?",
  "Will my lash extensions last?",
  "Should I get a spray tan?",
  "Will my self-tanner streak?",
  "Is it good weather for laser treatment?",
  "Should I avoid the sun after my facial?",
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
  "Should I use anti-frizz serum?",
  "Is it a good ponytail day?",
  "Will my baby hairs curl?",
  "Should I use a bonnet tonight?",
  "Is it good for overnight curls?",
  "Will humidity ruin my blowout?",
  "Should I use hair spray?",
  "Is it good for beach waves?",
  "Will sea salt spray work today?"
];

// ============================================================================
// SKIN TYPE DATABASE
// ============================================================================

const SKIN_TYPES = {
  oily: {
    characteristics: 'Excess sebum, large pores, prone to acne and shine',
    weatherTriggers: {
      heat: 'Increases oil production 10% per 1°C rise',
      humidity: 'Traps oil on skin surface, clogs pores',
      wind: 'Can strip surface oils = rebound oil production',
      cold: 'Less oil production, but dry indoor heating = dehydration',
      uvIndex: 'UV thickens skin (more clogging), but initially dries acne'
    },
    routine: {
      morning: 'Gel cleanser → Niacinamide → Lightweight moisturizer → SPF (matte finish)',
      evening: 'Double cleanse → Salicylic acid (2-3x/week) → Niacinamide → Oil-free moisturizer',
      weekly: 'Clay mask (kaolin/bentonite) 1-2x/week. BHAs for pore clearing.',
      avoid: 'Heavy creams, facial oils, occlusives in T-zone. Coconut oil (comedogenic).'
    },
    products: {
      cleanser: 'Foaming/gel with salicylic acid or tea tree',
      moisturizer: 'Oil-free, gel-based, hyaluronic acid',
      sunscreen: 'Matte finish, zinc oxide (anti-inflammatory)',
      treatment: 'Niacinamide (oil control), retinol (pore refinement)',
      mask: 'Clay, charcoal, sulfur'
    }
  },
  dry: {
    characteristics: 'Tight, flaky, rough texture, fine lines more visible',
    weatherTriggers: {
      cold: 'Strips natural oils, damages moisture barrier',
      wind: 'Accelerates moisture loss (transepidermal water loss)',
      humidity: 'High humidity helps! Dry skin loves moisture in air',
      heat: 'Dehydration from sweating without oil production',
      indoorHeating: 'Dries air to < 20% humidity = moisture vampire'
    },
    routine: {
      morning: 'Cream/lotion cleanser → Hyaluronic acid → Rich moisturizer → SPF (hydrating)',
      evening: 'Oil/balm cleanse → Cream cleanser → Hydrating toner → Face oil → Heavy night cream',
      weekly: 'Gentle enzyme exfoliant (no scrubs!). Hydrating sheet mask.',
      avoid: 'Foaming cleansers, alcohol toners, physical scrubs, clay masks'
    },
    products: {
      cleanser: 'Cream, milk, or oil-based. No sulfates.',
      moisturizer: 'Ceramides, shea butter, squalane, peptides',
      sunscreen: 'Hydrating formula with glycerin',
      treatment: 'Lactic acid (gentle AHA), ceramide serums',
      mask: 'Sheet masks, honey, aloe, oatmeal'
    }
  },
  combination: {
    characteristics: 'Oily T-zone, dry/normal cheeks. Pores larger in center.',
    weatherTriggers: {
      heat: 'T-zone becomes oilier, cheeks stay normal',
      humidity: 'T-zone congestion, cheeks may be fine',
      cold: 'Cheeks become dry/flaky, T-zone less oily',
      seasonal: 'Spring/summer = more oily. Fall/winter = more dry.'
    },
    routine: {
      morning: 'Gentle cleanser → Niacinamide → Light lotion (T-zone less, cheeks more) → SPF',
      evening: 'Double cleanse T-zone, single cleanse cheeks → Exfoliate T-zone only → Moisturize',
      weekly: 'Clay mask on T-zone, hydrating mask on cheeks (multi-masking!)',
      avoid: 'One-product-fits-all approach. Treat different zones differently.'
    },
    products: {
      cleanser: 'Gentle foaming or gel (not stripping)',
      moisturizer: 'Lightweight lotion, gel-cream hybrid',
      sunscreen: 'Lightweight, non-greasy',
      treatment: 'BHA on T-zone, AHA on cheeks. Niacinamide everywhere.',
      mask: 'Multi-masking: clay on nose/chin, hydrating on cheeks'
    }
  },
  sensitive: {
    characteristics: 'Easily irritated, redness, stinging, reactive to products/weather',
    weatherTriggers: {
      wind: 'Major trigger - windburn and barrier damage',
      temperatureExtremes: 'Both heat and cold trigger flushing, irritation',
      uvIndex: 'Sun is number one rosacea/redness trigger',
      pollution: 'Particulates cause inflammation and oxidative stress',
      humidity: 'Rapid changes in humidity trigger reactions'
    },
    routine: {
      morning: 'Lukewarm water rinse → Minimal products → Barrier cream → Mineral SPF',
      evening: 'Gentle cream cleanser → One treatment max → Rich barrier cream',
      weekly: 'No physical exfoliation. Enzyme mask if tolerated.',
      avoid: 'Fragrance, essential oils, alcohol, acids, retinoids (start very slow)'
    },
    products: {
      cleanser: 'Cream, non-foaming, fragrance-free, minimal ingredients',
      moisturizer: 'Ceramides, centella asiatica, panthenol, minimal ingredients',
      sunscreen: '100% mineral (zinc oxide, titanium dioxide). NO chemical filters.',
      treatment: 'Azelaic acid, centella, green tea (anti-inflammatory)',
      mask: 'Colloidal oatmeal, honey, plain yogurt'
    }
  },
  acne_prone: {
    characteristics: 'Active breakouts, clogged pores, post-inflammatory hyperpigmentation',
    weatherTriggers: {
      humidity: 'Trap bacteria, oil, and dead skin cells = breakouts',
      sweating: 'Sweat + oil + bacteria = body acne, face congestion',
      masks: 'Mask wearing + humidity = maskne (acne mechanica)',
      uvIndex: 'Sun darkens PIH/PIE marks. Some acne meds cause photosensitivity.',
      pollution: 'Particulates oxidize sebum = more inflammatory acne'
    },
    routine: {
      morning: 'Salicylic acid cleanser → Niacinamide → Oil-free SPF',
      evening: 'Double cleanse → Treatment (alternate: retinoid, BHA, rest night) → Light moisturizer',
      weekly: 'Clay mask. Pimple patches for active spots. NO picking.',
      avoid: 'Coconut oil, shea butter, isopropyl myristate, heavy occlusives'
    },
    products: {
      cleanser: 'Salicylic acid 2% or benzoyl peroxide 4-5%',
      moisturizer: 'Oil-free, non-comedogenic, gel texture',
      sunscreen: 'Matte, oil-free, non-comedogenic',
      treatment: 'Adapalene (Differin), benzoyl peroxide, salicylic acid, tea tree',
      mask: 'Sulfur, clay, salicylic acid'
    }
  },
  mature: {
    characteristics: 'Fine lines, wrinkles, loss of elasticity, thinner, drier',
    weatherTriggers: {
      uvIndex: 'CUMULATIVE damage. Every UV exposure adds up over decades.',
      cold: 'Increases appearance of lines (dehydrated skin shows lines more)',
      dryAir: 'Accelerates transepidermal water loss',
      pollution: 'Accelerates aging (free radicals, collagen breakdown)',
      heat: 'Can increase collagen breakdown (inflammation)'
    },
    routine: {
      morning: 'Gentle cleanser → Vitamin C serum → Peptide moisturizer → SPF 50+',
      evening: 'Double cleanse → Retinoid (alternate nights) → Rich night cream → Face oil',
      weekly: 'Gentle AHA exfoliation. Hydrating mask. Facial massage.',
      avoid: 'Harsh cleansers, skipping SPF, aggressive treatments'
    },
    products: {
      cleanser: 'Cream or oil-based, hydrating',
      moisturizer: 'Peptides, ceramides, shea butter, squalane',
      sunscreen: 'SPF 50+ broad spectrum. Tinted for blue light protection.',
      treatment: 'Retinoids (tretinoin), vitamin C, peptides, growth factors',
      mask: 'Hydrating, collagen, honey, avocado'
    }
  },
  hyperpigmentation: {
    characteristics: 'Dark spots, melasma, uneven skin tone, post-inflammatory marks',
    weatherTriggers: {
      uvIndex: 'NUMBER ONE TRIGGER. UV stimulates melanin production.',
      heat: 'Heat alone can trigger melasma (not just UV!)',
      visibleLight: 'Blue light from sun/screens can worsen melasma',
      hormones: 'Weather stress can affect cortisol = hormonal pigmentation'
    },
    routine: {
      morning: 'Vitamin C → Tranexamic acid/niacinamide → SPF 50+ (tinted for blue light)',
      evening: 'Double cleanse → Brightening treatment (alternate: retinoid, AHA, kojic acid) → Moisturizer',
      weekly: 'Gentle chemical exfoliation. Vitamin C mask.',
      avoid: 'Sun exposure. Picking. Harsh physical scrubs. Heat (saunas, hot yoga).'
    },
    products: {
      cleanser: 'Gentle, non-stripping',
      moisturizer: 'With niacinamide, licorice root, vitamin E',
      sunscreen: 'SPF 50+ TINTED mineral (iron oxides block visible light). Reapply every 2 hours.',
      treatment: 'Hydroquinone (Rx), azelaic acid, kojic acid, tranexamic acid, alpha arbutin',
      mask: 'Turmeric, vitamin C, licorice, niacinamide'
    }
  }
};

// ============================================================================
// HAIR TYPE DATABASE
// ============================================================================

const HAIR_TYPES = {
  straight: {
    porosity: 'Low to normal',
    weatherResponse: {
      humidity: 'Goes limp, loses volume, gets greasy faster',
      dryAir: 'Static electricity, flyaways',
      rain: 'Goes completely flat, water marks',
      wind: 'Tangles, knots',
      heat: 'Scalp gets oily faster, hair goes limp'
    },
    styling: {
      goodWeather: 'Low dew point (0-10°C): volume holds, smooth, no static',
      badWeather: 'High dew point (>16°C): flat, greasy, no volume',
      products: 'Volumizing mousse, dry shampoo, texturizing spray, light hairspray',
      avoid: 'Heavy oils, thick creams (weigh down), humidity = no blowout'
    },
    tips: [
      'Dew point > 16°C: embrace your natural texture, heat styling won\'t hold',
      'Dew point < 0°C: static city - dryer sheet on brush, anti-static spray',
      'Rain: silk scarf under hood/umbrella preserves style',
      'Oily scalp day: dry shampoo at night (absorbs oil while you sleep)'
    ]
  },
  wavy: {
    porosity: 'Normal to high',
    weatherResponse: {
      humidity: 'Frizzes, waves become undefined, expands',
      dryAir: 'Waves fall flat, lacks definition',
      rain: 'Frizz explosion, waves disappear or go wild',
      wind: 'Tangles, knots, breakage',
      heat: 'Scalp oil + humidity = weighed down waves'
    },
    styling: {
      goodWeather: 'Dew point 10-16°C: defined waves, minimal frizz, holds style',
      badWeather: 'Dew point > 18°C: undefined, frizzy, unpredictable',
      products: 'Curl cream (light), mousse, sea salt spray, anti-humidity spray',
      avoid: 'Heavy butters (weigh down), brushing dry (poof), touching hair'
    },
    tips: [
      'Dew point 10-16°C: PERFECT wave day. Scrunch and go.',
      'Dew point > 18°C: gel cast method (apply gel wet, don\'t touch until dry, scrunch out crunch)',
      'Wind: protective style (braid, bun, scarf)',
      'Refreshing: water + leave-in in spray bottle, scrunch'
    ]
  },
  curly: {
    porosity: 'Normal to high',
    weatherResponse: {
      humidity: 'THE ENEMY. Frizz, undefined, expands 2x normal size',
      dryAir: 'Curls fall flat, no volume, brittle',
      rain: 'Instant frizz reset. Day ruined.',
      wind: 'Tangles = breakage. Ruins curl pattern.',
      heat: 'Frizz + sweat = scalp issues'
    },
    styling: {
      goodWeather: 'Dew point 10-16°C: defined, bouncy, minimal frizz (unicorn day)',
      badWeather: 'Dew point > 18°C: undefined, frizzy, shrinkage, triangle shape',
      products: 'Leave-in conditioner, curl cream, gel, anti-humidity serum',
      avoid: 'Sulfates, drying alcohols, touching hair, brushing dry'
    },
    tips: [
      'Dew point > 21°C: use HUMIDITY-BLOCKING products. Glycerin-free if high humidity.',
      'Dew point 10-16°C: glycerin-based products work beautifully (attracts moisture)',
      'Rain: satin-lined hood/hat. Refresh with steam (shower) not water.',
      'Pineapple at night (loose high ponytail). Satin pillowcase.',
      'Shrinkage: embrace it or stretch with banding method'
    ]
  },
  coily: {
    porosity: 'High',
    weatherResponse: {
      humidity: 'Frizz, shrinkage (up to 75% of length!), undefined',
      dryAir: 'Extremely dry, brittle, breakage risk high',
      rain: 'Massive shrinkage. Hours of work undone.',
      wind: 'Tangles severely. Breakage risk.',
      heat: 'Scalp issues, dryness, breakage'
    },
    styling: {
      goodWeather: 'Dew point 10-16°C: defined, moisturized, manageable',
      badWeather: 'Dew point > 18°C: massive shrinkage, frizz. Dew point < 0°C: extreme dryness.',
      products: 'Heavy creams, butters, oils, leave-in conditioner, gel',
      avoid: 'Sulfates, drying alcohols, mineral oil, petrolatum (builds up)'
    },
    tips: [
      'LOC/LCO method: Liquid → Oil → Cream (or Liquid → Cream → Oil)',
      'Dew point > 21°C: protective style (braids, twists, bun, wig)',
      'Dew point < 0°C: deep condition weekly, hot oil treatments, protective styles',
      'Satin-lined EVERYTHING (bonnet, pillowcase, scarf, hood)',
      'Shrinkage: banding, threading, or embrace. It means healthy hair!'
    ]
  },
  chemically_treated: {
    porosity: 'Very high (damaged cuticle)',
    weatherResponse: {
      humidity: 'Frizz extreme, keratin/relaxer reverses slightly, color fades',
      dryAir: 'Already porous hair loses moisture rapidly',
      rain: 'Keratin treatment can spot, color can bleed',
      uvIndex: 'UV fades color, damages already compromised structure',
      wind: 'Tangles and breaks easily'
    },
    styling: {
      goodWeather: 'Dry, cool days. Minimal humidity.',
      badWeather: 'Any extreme. Chemically treated hair is always compromised.',
      products: 'Bond builders (Olaplex, K18), protein treatments, sulfate-free everything',
      avoid: 'Heat styling without protection, sulfates, salt water, chlorine'
    },
    tips: [
      'UV protection: hair SPF or hat. Color fades 2x faster in high UV.',
      'Swimming: wet hair with clean water + leave-in before pool/ocean',
      'Bond builder every wash. Your hair structure is compromised.',
      'Satin pillowcase/bonnet ALWAYS. Already fragile.',
      'Keratin: wait 72 hours before moisture (rain, sweat, washing)'
    ]
  },
  gray_silver: {
    porosity: 'Low to normal (coarser texture)',
    weatherResponse: {
      humidity: 'Frizzes, yellows from pollution, goes brassy',
      uvIndex: 'Photodamage = yellowing, brassiness',
      pollution: 'Particulates deposit on hair = dull, yellow-gray',
      hardWater: 'Mineral deposits = brassy, dull',
      wind: 'Tangles, flyaways'
    },
    styling: {
      goodWeather: 'Cool, dry, low UV',
      badWeather: 'High UV, high humidity, high pollution',
      products: 'Purple/blue shampoo, anti-brass conditioner, UV protectant',
      avoid: 'Chlorine (turns green-yellow), excessive heat'
    },
    tips: [
      'Purple shampoo 1-2x/week (neutralizes yellow). Don\'t overuse (purple tint).',
      'UV protectant spray essential. Gray hair has no melanin protection.',
      'Filter shower water if hard water. Minerals = brassy.',
      'Silk/satin pillowcase (reduces friction = less yellowing at friction points)'
    ]
  }
};

// ============================================================================
// MAKEUP WEATHER INDEX
// ============================================================================

function getMakeupAdvice(data) {
  const { temp, humidity, wind, condition, uvIndex, dewPoint } = data;
  const heatIndex = calcHeatIndex(temp, humidity);
  const advice = {
    base: [],
    eyes: [],
    lips: [],
    setting: [],
    touchUp: []
  };
  
  if (heatIndex > 35) {
    advice.base.push("EXTREME HEAT: Foundation will melt. Consider skipping or tinted moisturizer.");
    advice.base.push("Primer: mattifying, gripping. Foundation: long-wear, oil-free.");
    advice.setting.push("Setting spray: mattifying. Setting powder: translucent, baking method.");
    advice.touchUp.push("Blotting papers every 2 hours. Powder compact for touch-ups.");
    advice.eyes.push("Waterproof EVERYTHING. Cream shadows (powder creases in heat).");
    advice.lips.push("Lip stain > lipstick. Gloss will melt. Tinted balm with SPF.");
  } else if (heatIndex > 28) {
    advice.base.push("Hot day: lightweight base. BB cream or skin tint.");
    advice.setting.push("Setting spray essential. Light powder on T-zone.");
    advice.touchUp.push("Blotting papers. Avoid layering powder (cakey).");
  } else if (temp < 5) {
    advice.base.push("Cold: hydrating primer. Dewy foundation (skin looks dry in cold).");
    advice.base.push("Mix facial oil with foundation for extra hydration.");
    advice.lips.push("Heavy lip balm under lipstick. Matte lips will crack.");
    advice.setting.push("Setting spray (dewy finish). Avoid heavy powder (settles in dry patches).");
  }
  
  if (humidity > 80) {
    advice.base.push("HIGH HUMIDITY: Oil-free everything. Silicone-based primer.");
    advice.setting.push("Setting powder crucial. Sandwich method: powder → setting spray → powder.");
    advice.eyes.push("Eyeshadow primer essential (even for no shadow look).");
    advice.eyes.push("Waterproof mascara. Tubing mascara best (doesn't smudge).");
    advice.touchUp.push("Blotting papers. Oil-absorbing roller (Clean & Clear, Revlon).");
  }
  
  if (wind > 20) {
    advice.eyes.push("Wind: contacts dry out. Glasses or eye drops. Waterproof mascara.");
    advice.base.push("Wind = watery eyes. Concealer under eyes. No lower lash mascara.");
    advice.lips.push("Sticky gloss = hair in lip gloss. Lipstick or stain only.");
  }
  
  if (condition === 'rain') {
    advice.base.push("Rain: waterproof face. Cream products > powder (more durable).");
    advice.eyes.push("Waterproof mascara + eyeliner MANDATORY. Tubing mascara = zero smudge.");
    advice.setting.push("Setting spray (waterproof type). Extra layer.");
    advice.lips.push("Long-wear liquid lipstick. No gloss.");
  }
  
  return advice;
}

// ============================================================================
// SKIN BARRIER ASSESSMENT
// ============================================================================

function getBarrierHealth(data) {
  const { temp, humidity, wind, uvIndex, condition, dewPoint, aqi } = data;
  const assessment = {
    score: 100,
    threats: [],
    protection: [],
    recovery: []
  };
  
  // Temperature stress
  if (temp < 0) {
    assessment.score -= 25;
    assessment.threats.push("Freezing temperatures damage skin barrier lipids");
    assessment.protection.push("Occlusive balm (Vaseline, Aquaphor, CeraVe Healing Ointment)");
    assessment.recovery.push("Ceramide-rich cream at night");
  } else if (temp > 32) {
    assessment.score -= 15;
    assessment.threats.push("Heat increases inflammation and oxidative stress");
    assessment.protection.push("Antioxidant serum (Vitamin C, ferulic acid) under SPF");
  }
  
  // Wind damage
  if (wind > 25) {
    assessment.score -= 20;
    assessment.threats.push("Wind strips moisture barrier, causes windburn");
    assessment.protection.push("Thick occlusive layer. Scarf/face covering.");
    assessment.recovery.push("Centella asiatica, panthenol, allantoin (barrier repair)");
  }
  
  // UV damage
  if (uvIndex > 6) {
    assessment.score -= 15;
    assessment.threats.push("UV radiation degrades collagen and damages barrier");
    assessment.protection.push("SPF 50+ PA++++. Reapply every 2 hours. Hat + sunglasses.");
    assessment.recovery.push("Antioxidant serum PM. Aloe vera for any redness.");
  }
  
  // Dry air
  if (humidity < 30) {
    assessment.score -= 15;
    assessment.threats.push("Dry air pulls moisture from skin (transepidermal water loss)");
    assessment.protection.push("Hyaluronic acid on damp skin + occlusive to seal");
    assessment.recovery.push("Humidifier at night. Sheet mask. Layer hydrating products.");
  }
  
  // Pollution
  if (aqi > 100) {
    assessment.score -= 10;
    assessment.threats.push("Particulate matter causes oxidative stress and barrier damage");
    assessment.protection.push("Antioxidant serum AM. Double cleanse PM.");
    assessment.recovery.push("Detoxifying mask (charcoal, clay). Niacinamide for barrier repair.");
  }
  
  return assessment;
}

// ============================================================================
// DEW POINT HAIR BEHAVIOR PREDICTOR
// ============================================================================

function getDewPointHairBehavior(dewPoint, hairType) {
  const behavior = {
    frizz: '',
    definition: '',
    volume: '',
    moisture: '',
    styling: '',
    products: []
  };
  
  if (dewPoint > 21) {
    behavior.frizz = 'EXTREME - Hair will absorb moisture from air, cuticle swells, frizz inevitable';
    behavior.definition = 'Curly/coily: curl pattern disrupted. Straight/wavy: goes flat and fuzzy.';
    behavior.volume = 'Curly/coily: VOLUME EXPLOSION (2-3x normal). Straight: limp, no volume.';
    behavior.moisture = 'Hair absorbs so much moisture it becomes over-moisturized (hygral fatigue)';
    behavior.styling = 'Do NOT heat style. Embrace natural texture. Protective styles best.';
    behavior.products = [
      'Anti-humectant products (block moisture absorption)',
      'Silicone-based serums (seal cuticle)',
      'Avoid glycerin (attracts moisture)',
      'Hard-hold gel for curly/coily',
      'Dry shampoo for straight (absorbs excess moisture)'
    ];
  } else if (dewPoint > 16) {
    behavior.frizz = 'MODERATE-HIGH - Some frizz, especially for curly/coily hair';
    behavior.definition = 'Curly: some definition possible. Wavy: may lose pattern. Straight: ok.';
    behavior.volume = 'Slight expansion. Manageable.';
    behavior.moisture = 'Slightly over-moisturized. Hair feels soft but can get limp.';
    behavior.styling = 'Heat style with anti-humidity products. Will hold moderately.';
    behavior.products = [
      'Light anti-humidity spray',
      'Curl cream with hold',
      'Mousse for volume',
      'Leave-in conditioner (light)'
    ];
  } else if (dewPoint > 10) {
    behavior.frizz = 'LOW - IDEAL dew point range';
    behavior.definition = 'PERFECT definition for all hair types';
    behavior.volume = 'Optimal volume and body';
    behavior.moisture = 'Balanced. Hair retains proper moisture without frizz.';
    behavior.styling = 'Anything works! Heat style, air dry, whatever you want.';
    behavior.products = [
      'Normal routine works perfectly',
      'Glycerin-based products work well (attracts right amount of moisture)',
      'Light hold products sufficient'
    ];
  } else if (dewPoint > 0) {
    behavior.frizz = 'LOW - But static may begin';
    behavior.definition = 'Good definition. Slightly drier than ideal.';
    behavior.volume = 'Good volume. May start to get flyaways.';
    behavior.moisture = 'Starting to dry out. Hair may feel slightly brittle.';
    behavior.styling = 'Heat style with heat protectant. Air dry ok but slower.';
    behavior.products = [
      'Leave-in conditioner',
      'Light oil for ends',
      'Anti-static spray',
      'Cream-based stylers > gels'
    ];
  } else {
    behavior.frizz = 'NONE - But extreme static and brittleness';
    behavior.definition = 'Hair is dry, brittle, may break. Doesn\'t hold curl well.';
    behavior.volume = 'Flyaways and static. Hair stands up.';
    behavior.moisture = 'CRITICALLY DRY. Moisture is being pulled OUT of hair.';
    behavior.styling = 'Avoid heat. Deep condition. Protective styles. No tight styles.';
    behavior.products = [
      'Heavy leave-in conditioner',
      'Hair oil (argan, jojoba, castor)',
      'Deep conditioning mask',
      'Humidifier at night',
      'Anti-static spray',
      'Avoid alcohol-based products'
    ];
  }
  
  return behavior;
}

// ============================================================================
// UV SKIN DAMAGE CALCULATOR
// ============================================================================

function getUVSkinAdvice(uvIndex, skinType) {
  const advice = {
    spf: '',
    reapply: '',
    extra: [],
    burnRisk: '',
    longTerm: []
  };
  
  const fitzpatrickTypes = {
    'type1': { description: 'Very fair, always burns, never tans', burnTime: 5, spf: '50+', risk: 'Extreme' },
    'type2': { description: 'Fair, usually burns, tans minimally', burnTime: 10, spf: '50+', risk: 'Very High' },
    'type3': { description: 'Medium, sometimes burns, tans gradually', burnTime: 15, spf: '30+', risk: 'High' },
    'type4': { description: 'Olive, rarely burns, tans easily', burnTime: 20, spf: '30', risk: 'Moderate' },
    'type5': { description: 'Brown, very rarely burns, tans very easily', burnTime: 30, spf: '15-30', risk: 'Lower' },
    'type6': { description: 'Deeply pigmented, almost never burns', burnTime: 45, spf: '15+', risk: 'Low but present' }
  };
  
  // Default to type 3 if not specified
  const fitz = fitzpatrickTypes[skinType] || fitzpatrickTypes['type3'];
  
  const actualBurnTime = fitz.burnTime * (1 / (uvIndex / 3));
  
  advice.burnRisk = `${fitz.description}. Estimated burn time: ${Math.round(actualBurnTime)} minutes at UV ${uvIndex}.`;
  advice.spf = `SPF ${fitz.spf} minimum. Broad spectrum (UVA + UVB). PA++++ rating.`;
  
  if (uvIndex > 10) {
    advice.reapply = 'Every 60-80 minutes. Set phone timer. UV this high breaks down sunscreen faster.';
    advice.extra.push('UPF 50+ clothing if outside > 30 minutes');
    advice.extra.push('Wide-brim hat (10cm+ brim)');
    advice.extra.push('UV-blocking sunglasses (protects eyes and delicate eye area)');
    advice.extra.push('Seek shade 10am-4pm');
    advice.longTerm.push('This UV level causes DNA damage in skin cells. Cumulative.');
  } else if (uvIndex > 7) {
    advice.reapply = 'Every 2 hours. After swimming/sweating: immediately.';
    advice.extra.push('Hat and sunglasses recommended');
    advice.extra.push('Limit direct exposure 11am-3pm');
  } else if (uvIndex > 5) {
    advice.reapply = 'Every 2 hours if outside continuously.';
    advice.extra.push('Sunglasses recommended');
  } else if (uvIndex > 2) {
    advice.reapply = 'Reapply if outside > 4 hours.';
  } else {
    advice.reapply = 'Standard application sufficient.';
  }
  
  advice.longTerm.push('UVA rays (aging) penetrate clouds and glass. Daily SPF even indoors.');
  advice.longTerm.push('Skin cancer: 90% of non-melanoma skin cancers caused by UV exposure.');
  advice.longTerm.push('Photoaging: 80% of visible skin aging is from UV damage.');
  
  return advice;
}

// ============================================================================
// MAIN SKIN & HAIR ADVICE FUNCTION
// ============================================================================

export const getSkinHairAdvice = (data, question = '') => {
  if (!data) return "Loading weather data...";

  const { 
    temp, humidity, uvIndex, wind, condition, feelsLike,
    aqi, dewPoint, visibility, tempMin, tempMax
  } = data;
  
  const calculatedDewPoint = dewPoint || calcDewPoint(temp, humidity);
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const effectiveTemp = temp <= 10 ? windChill : temp >= 27 ? heatIndex : feelsLike;
  const burnMin = getBurnTime(uvIndex);
  const isRaining = ['rain', 'drizzle', 'thunderstorm'].includes(condition);
  const season = getSeason();
  
  // Detect skin/hair type from question
  const q = question.toLowerCase();
  let skinType = 'type3'; // default
  let hairType = 'wavy'; // default
  
  if (q.includes('oily') || q.includes('acne') || q.includes('breakout')) skinType = 'oily';
  if (q.includes('dry skin') || q.includes('flake')) skinType = 'dry';
  if (q.includes('combination') || q.includes('t zone')) skinType = 'combination';
  if (q.includes('sensitive') || q.includes('rosacea') || q.includes('redness')) skinType = 'sensitive';
  if (q.includes('mature') || q.includes('aging') || q.includes('wrinkle')) skinType = 'mature';
  if (q.includes('dark spot') || q.includes('melasma') || q.includes('hyperpigmentation')) skinType = 'hyperpigmentation';
  
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
  
  let verdict = [];
  let hairTips = [];
  let skinTips = [];
  let warnings = [];
  let routineAdjustments = [];

  // ========================================================================
  // OVERALL BEAUTY WEATHER RATING
  // ========================================================================
  
  const beautyScore = Math.max(0, 100 - 
    (calculatedDewPoint > 18 ? 30 : calculatedDewPoint > 14 ? 10 : calculatedDewPoint < 0 ? 20 : 0) -
    (uvIndex > 7 ? 15 : 0) -
    (wind > 25 ? 15 : 0) -
    (temp > 32 ? 15 : temp < 0 ? 15 : 0) -
    (aqi > 100 ? 10 : 0)
  );
  
  if (beautyScore > 80) {
    verdict.push("✨ PERFECT BEAUTY DAY: Ideal conditions for skin and hair.");
  } else if (beautyScore > 60) {
    verdict.push("💫 GOOD BEAUTY DAY: Minor adjustments needed.");
  } else if (beautyScore > 40) {
    verdict.push("⚠️ CHALLENGING BEAUTY DAY: Several weather factors working against you.");
  } else {
    verdict.push("🚨 DIFFICULT BEAUTY DAY: Weather is actively fighting your beauty routine.");
  }

  // ========================================================================
  // DEW POINT ANALYSIS
  // ========================================================================
  
  hairTips.push(`💧 DEW POINT: ${calculatedDewPoint.toFixed(1)}°C`);
  
  if (calculatedDewPoint > 21) {
    hairTips.push("EXTREME HUMIDITY: Hair cuticle is wide open absorbing moisture.");
    hairTips.push(`Frizz level: ${dewBehavior.frizz}`);
    hairTips.push(`Styling: ${dewBehavior.styling}`);
    skinTips.push("Skin will feel sticky. Pores will look larger. Oil production increases.");
    warnings.push("Heat styling will NOT hold. Don't waste your time.");
  } else if (calculatedDewPoint > 16) {
    hairTips.push("MODERATE HUMIDITY: Some frizz for curly/coily. Manageable for straight.");
    hairTips.push(`Styling: ${dewBehavior.styling}`);
  } else if (calculatedDewPoint > 10) {
    hairTips.push("IDEAL DEW POINT: Perfect hair weather!");
    hairTips.push(`${dewBehavior.definition} Minimal frizz, maximum style hold.`);
    skinTips.push("Skin balanced. Not too oily, not too dry. Perfect skin day.");
  } else if (calculatedDewPoint > 0) {
    hairTips.push("DRYING: Hair losing moisture. Static may begin.");
    skinTips.push("Skin beginning to feel tight. Switch to richer moisturizer.");
  } else {
    hairTips.push("EXTREMELY DRY: Moisture being pulled from hair and skin.");
    hairTips.push(`${dewBehavior.frizz} Hair brittle, static, breakage risk.`);
    skinTips.push("Skin barrier under stress. Flaking, tightness, irritation possible.");
    warnings.push("Deep condition hair. Slug skin with occlusive tonight.");
  }
  
  // Hair product recommendations
  if (dewBehavior.products.length > 0) {
    hairTips.push("🎯 RECOMMENDED PRODUCTS:");
    dewBehavior.products.forEach(p => hairTips.push(`  • ${p}`));
  }

  // ========================================================================
  // UV & SUN PROTECTION
  // ========================================================================
  
  skinTips.push(`☀️ UV INDEX: ${uvIndex} (${getUVLevel(uvIndex)})`);
  skinTips.push(`BURN TIME: ~${burnMin} minutes for unprotected skin.`);
  skinTips.push(`SPF: ${uvAdvice.spf}`);
  skinTips.push(`Reapply: ${uvAdvice.reapply}`);
  uvAdvice.extra.forEach(e => skinTips.push(`• ${e}`));
  
  if (uvIndex > 5) {
    hairTips.push("HAIR UV DAMAGE: Yes, hair gets sun damage too.");
    hairTips.push("• UV degrades hair protein (keratin) = weaker, duller hair");
    hairTips.push("• Color-treated hair: UV fades color 2x faster");
    hairTips.push("• Hair SPF spray or hat recommended");
    hairTips.push("• Scalp burns! Part line, hairline = skin cancer spots");
    if (hairType === 'chemically_treated' || hairType === 'gray_silver') {
      warnings.push("Your hair type is ESPECIALLY vulnerable to UV. Protect it.");
    }
  }
  
  // ========================================================================
  // TEMPERATURE EFFECTS
  // ========================================================================
  
  if (heatIndex > 35) {
    skinTips.push("🔥 EXTREME HEAT: Makeup will melt. Skin will sweat profusely.");
    skinTips.push("• Lightest possible base (tinted moisturizer or nothing)");
    skinTips.push("• Setting spray your BFF. Blotting papers every 2 hours.");
    skinTips.push("• Avoid heavy creams. Oil-free gel moisturizer only.");
    hairTips.push("• Scalp will sweat = oily roots. Dry shampoo at hairline.");
    hairTips.push("• Updo > down. Hair on neck = more sweat.");
    warnings.push(`Heat index ${heatIndex.toFixed(0)}°C: Heat rash, clogged pores, makeup meltdown.`);
  } else if (heatIndex > 28) {
    skinTips.push("HOT: Lightweight skincare and makeup. Mattifying products for T-zone.");
    hairTips.push("Warm: hair may get greasy faster. Dry shampoo in bag.");
  } else if (temp < 5) {
    skinTips.push("❄️ COLD: Skin barrier under attack.");
    skinTips.push("• Switch to cream cleanser (foaming = too stripping)");
    skinTips.push("• Richer moisturizer. Add face oil to routine.");
    skinTips.push("• Lips WILL chap. Heavy balm (lanolin, petrolatum).");
    skinTips.push("• Hands: cream after every wash. Cuticle oil daily.");
    hairTips.push("• Cold makes hair brittle. No tight styles. Deep condition.");
    hairTips.push("• Static: humidifier, anti-static spray, dryer sheet on brush.");
    warnings.push("Extreme cold = frostbite on exposed skin. Cover face, ears, hands.");
  } else if (temp < 10) {
    skinTips.push("COOL: Transition to richer moisturizer. Lip balm in every bag.");
    hairTips.push("Cool air = less humidity. Hair may be more manageable.");
  }

  // ========================================================================
  // WIND EFFECTS
  // ========================================================================
  
  if (wind > 30) {
    warnings.push(`💨 STRONG WIND ${wind}km/h: Beauty nightmare.`);
    skinTips.push("Windburn: skin red, raw, irritated. Occlusive balm before going out.");
    skinTips.push("Wind + cold = moisture stripped. Heavy barrier cream.");
    hairTips.push("HAIR EMERGENCY: Tangles, breakage, style destruction.");
    hairTips.push("• Protective style ONLY: braid, bun, scarf, hat");
    hairTips.push("• No loose hair. You WILL regret it.");
    hairTips.push("• Leave-in conditioner + oil on ends for slip");
    warnings.push("Wind chill makes it feel even colder. Frostbite on ears/nose possible.");
  } else if (wind > 15) {
    hairTips.push("BREEZY: Hair will move. Style accordingly.");
    hairTips.push("• Ponytail, braid, or half-up to control");
    hairTips.push("• Leave-in conditioner prevents wind tangles");
    skinTips.push("Lips will dry faster. Keep balm handy.");
  } else if (wind < 5 && temp > 25) {
    skinTips.push("STAGNANT AIR: No breeze + heat = sweat doesn't evaporate.");
    skinTips.push("Pores clog faster. Double cleanse tonight.");
  }

  // ========================================================================
  // HUMIDITY DIRECT EFFECTS
  // ========================================================================
  
  if (humidity > 85) {
    skinTips.push("💦 VERY HIGH HUMIDITY: Air is saturated with moisture.");
    skinTips.push("• Skin can't release moisture = sweat trapped on surface");
    skinTips.push("• Pores clog: double cleanse PM essential");
    skinTips.push("• Fungal acne prone? Humidity makes it worse. Ketoconazole wash.");
    skinTips.push("• Body acne: shower immediately after sweating");
    hairTips.push("• Hair absorbs moisture = frizz, loss of style");
    hairTips.push("• Anti-humidity products critical");
    if (hairType === 'curly' || hairType === 'coily') {
      warnings.push("Your hair type + this humidity = extreme shrinkage and frizz.");
      warnings.push("Protective style or anti-humectant products mandatory.");
    }
  } else if (humidity < 25) {
    skinTips.push("🏜️ VERY DRY AIR: Moisture being pulled from your skin.");
    skinTips.push("• Hyaluronic acid on DAMP skin (not dry!) sealed with occlusive");
    skinTips.push("• Humidifier running at home/work. 40-50% humidity ideal.");
    skinTips.push("• No foaming cleansers. No physical exfoliation.");
    skinTips.push("• Static: cotton/natural fiber clothing. Synthetic = more static.");
    hairTips.push("• Static hair: anti-static spray, dryer sheet, ionic dryer");
    hairTips.push("• Leave-in conditioner + hair oil on ends");
    warnings.push("Skin barrier compromised. Be gentle. No actives tonight.");
  }

  // ========================================================================
  // RAIN EFFECTS
  // ========================================================================
  
  if (isRaining) {
    warnings.push("🌧️ RAIN: Immediate beauty impact if you step outside.");
    hairTips.push("• Umbrella or hood ESSENTIAL. Rain = instant frizz reset.");
    hairTips.push("• Silk/satin-lined hood or scarf over hair");
    if (hairType === 'chemically_treated') {
      warnings.push("KERATIN/RELAXER: Do not let hair get wet. 72-hour rule absolute.");
    }
    skinTips.push("• Waterproof mascara only. Tubing mascara best.");
    skinTips.push("• Skip lower lash mascara (will run)");
    if (temp < 15) {
      warnings.push("Cold rain = wet + cold = hypothermia risk. Affects skin barrier.");
    }
  }

  // ========================================================================
  // AIR QUALITY
  // ========================================================================
  
  if (aqi > 100) {
    warnings.push(`😷 POLLUTION: AQI ${aqi}. Skin is breathing this.`);
    skinTips.push("• PM2.5 particulates = 20x smaller than pores. They get IN.");
    skinTips.push("• Oxidative stress = accelerated aging, hyperpigmentation");
    skinTips.push("• DOUBLE CLEANSE tonight (oil cleanser + water-based)");
    skinTips.push("• Antioxidant serum AM (Vitamin C, E, ferulic acid)");
    skinTips.push("• Niacinamide strengthens barrier against pollution");
    hairTips.push("• Pollution deposits on hair = dull, dirty-looking");
    hairTips.push("• Clarifying shampoo this week");
  }

  // ========================================================================
  // SEASONAL ADVICE
  // ========================================================================
  
  if (season === 'winter') {
    routineAdjustments.push("❄️ WINTER ROUTINE SWITCH:");
    routineAdjustments.push("• Cleanse: cream/milk cleanser (not foaming)");
    routineAdjustments.push("• Moisturize: heavier cream. Add face oil.");
    routineAdjustments.push("• SPF: still essential! Snow reflects 80% UV = double exposure.");
    routineAdjustments.push("• Hair: deep condition weekly. Humidifier at night.");
  } else if (season === 'summer') {
    routineAdjustments.push("☀️ SUMMER ROUTINE SWITCH:");
    routineAdjustments.push("• Cleanse: gel or foaming (oil control)");
    routineAdjustments.push("• Moisturize: lightweight, oil-free, gel texture");
    routineAdjustments.push("• SPF: water-resistant for sweat/swimming");
    routineAdjustments.push("• Hair: anti-humidity products. Clarify weekly.");
  }

  // ========================================================================
  // MAKEUP ADVICE
  // ========================================================================
  
  if (temp > 28 || humidity > 75 || wind > 20 || isRaining) {
    skinTips.push("💄 MAKEUP STRATEGY:");
    if (makeupAdvice.base.length) makeupAdvice.base.forEach(b => skinTips.push(`  Base: ${b}`));
    if (makeupAdvice.eyes.length) makeupAdvice.eyes.forEach(e => skinTips.push(`  Eyes: ${e}`));
    if (makeupAdvice.lips.length) makeupAdvice.lips.forEach(l => skinTips.push(`  Lips: ${l}`));
    if (makeupAdvice.setting.length) makeupAdvice.setting.forEach(s => skinTips.push(`  Set: ${s}`));
    if (makeupAdvice.touchUp.length) makeupAdvice.touchUp.forEach(t => skinTips.push(`  Touch-up: ${t}`));
  }

  // ========================================================================
  // BARRIER HEALTH
  // ========================================================================
  
  if (barrier.threats.length > 0) {
    skinTips.push(`🛡️ SKIN BARRIER: Under attack (Score: ${barrier.score}/100)`);
    barrier.threats.forEach(t => skinTips.push(`  ⚠️ ${t}`));
    barrier.protection.forEach(p => skinTips.push(`  🛡️ ${p}`));
    barrier.recovery.forEach(r => skinTips.push(`  🔧 ${r}`));
  }

  // ========================================================================
  // LONG-TERM ADVICE
  // ========================================================================
  
  uvAdvice.longTerm.forEach(lt => {
    if (!skinTips.includes(lt)) skinTips.push(`📚 ${lt}`);
  });

  // ========================================================================
  // ASSEMBLE FINAL RESPONSE
  // ========================================================================
  
  const intros = [
    "💅 Beauty weather report:",
    "💇 Skin + hair forecast:",
    "✨ For your glow-up:",
    "💄 Beauty conditions:",
    "🧴 Zephye's beauty advisory:",
    "💋 Glam weather check:",
    "🪞 Mirror check conditions:"
  ];

  let response = `${random(intros)}\n\n`;
  
  // Verdict
  response += `📊 BEAUTY WEATHER SCORE: ${beautyScore}/100\n`;
  verdict.forEach(v => response += `${v}\n`);
  response += '\n';
  
  // Current Conditions
  response += `🌡️ CONDITIONS:\n`;
  response += `• Temp: ${temp}°C (feels like ${Math.round(effectiveTemp)}°C)\n`;
  response += `• Dew Point: ${calculatedDewPoint.toFixed(1)}°C (${calculatedDewPoint > 16 ? 'HUMID' : calculatedDewPoint > 10 ? 'IDEAL' : calculatedDewPoint > 0 ? 'DRY' : 'VERY DRY'})\n`;
  response += `• Humidity: ${humidity}%\n`;
  response += `• Wind: ${wind}km/h\n`;
  response += `• UV Index: ${uvIndex} (burn ~${burnMin} min)\n`;
  if (aqi > 50) response += `• AQI: ${aqi}\n`;
  response += '\n';
  
  // Hair Section
  if (hairTips.length > 0) {
    response += `💇 HAIR:\n`;
    hairTips.forEach(h => response += `${h}\n`);
    response += '\n';
  }
  
  // Skin Section
  if (skinTips.length > 0) {
    response += `🧴 SKIN:\n`;
    skinTips.forEach(s => response += `${s}\n`);
    response += '\n';
  }
  
  // Routine Adjustments
  if (routineAdjustments.length > 0) {
    response += `🔄 ROUTINE ADJUSTMENTS:\n`;
    routineAdjustments.forEach(r => response += `${r}\n`);
    response += '\n';
  }
  
  // Warnings
  if (warnings.length > 0) {
    response += `⚠️ WARNINGS:\n`;
    warnings.forEach(w => response += `${w}\n`);
    response += '\n';
  }
  
  // Final Verdict
  response += `💡 BOTTOM LINE:\n`;
  if (beautyScore > 80) {
    response += `Today is your beauty day! Hair and skin will cooperate.\n`;
    response += `Perfect for: important events, photos, date night.\n`;
  } else if (beautyScore > 60) {
    response += `Good beauty day with minor adjustments. Follow recommendations.\n`;
  } else if (beautyScore > 40) {
    response += `Challenging day. Prioritize protective styles and barrier care.\n`;
  } else {
    response += `Stay inside if possible. If you must go out: protect, protect, protect.\n`;
    response += `Tonight: deep condition hair, intensive skin barrier treatment.\n`;
  }
  
  // Beauty wisdom
  const wisdom = [
    "Invest in your skin. It's going to represent you for a very long time. - Linden Tyler",
    "Beautiful skin requires commitment, not a miracle. - Erno Laszlo",
    "Your skin is your best accessory. Take care of it.",
    "Healthy hair is a crown you never take off.",
    "Beauty is about being comfortable in your own skin.",
    "The best foundation you can wear is healthy, glowing skin.",
    "Take care of your hair; it's the only crown you never take off."
  ];
  response += `\n💋 ${random(wisdom)}`;

  return response;
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export { getDewPointHairBehavior, getUVSkinAdvice, getBarrierHealth, getMakeupAdvice };

export default getSkinHairAdvice;
