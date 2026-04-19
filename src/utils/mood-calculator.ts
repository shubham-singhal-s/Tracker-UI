export const CITIES = ["Martin Place", "Castle Hill", "Kellyville", "Vasundhara"];

const sigmoid = (x, k, x0) => 1 / (1 + Math.exp(-k * (x - x0)));

function temperatureComfortScore(temp: number): number {
  const COMFORT_MIN = 20;
  const COMFORT_MAX = 25;
  const SD = 7; // preserve existing falloff width

  // Full comfort plateau between COMFORT_MIN and COMFORT_MAX
  if (temp >= COMFORT_MIN && temp <= COMFORT_MAX) {
    return 100;
  }

  // Gaussian falloff outside the plateau
  const distance = temp < COMFORT_MIN ? COMFORT_MIN - temp : temp - COMFORT_MAX;
  return 100 * Math.exp(-0.5 * Math.pow(distance / SD, 2));
}

function sunTempMultiplier(tempC) {
  const minT = 6;
  const maxT = 25;
  const midpoint = (minT + maxT) / 2; // 15.5
  const steepness = 0.25;

  const sigmoid = (x) => 1 / (1 + Math.exp(-x));

  // raw sigmoid values at bounds (for normalization)
  const sMin = sigmoid((minT - midpoint) * steepness);
  const sMax = sigmoid((maxT - midpoint) * steepness);

  // current value
  const s = sigmoid((tempC - midpoint) * steepness);

  // normalize to [0, 1]
  const normalized = (s - sMin) / (sMax - sMin);

  // map to [-1, 1]
  let value = normalized * 2 - 1;

  // clamp inline
  if (value < -1) return -1;
  if (value > 1) return 1;
  return value;
}

export const calculateMoodScore = (apiData) => {
  const { current, daily } = apiData;
  const temp = current.apparent_temperature;
  const hum = current.relative_humidity_2m;
  const uv = daily.uv_index_max?.[0];
  const radiation = daily.shortwave_radiation_sum?.[0];
  const cloud = current.cloud_cover;
  const isDay = current.is_day;
  const wind = current.wind_speed_10m;
  const pressure = current.pressure_msl;

  let factors: any[] = [];

  // 1. BASE COMFORT (Plateau 20–25°C with Gaussian falloff)
  let score = temperatureComfortScore(temp);

  factors.push({ label: "Temperature Comfort", impact: Math.round(score) });

  // 2. SUN HARSHNESS (The Standalone Intensity Metric)
  const rawIntensity = uv * 4.0 + radiation * 1.0;
  const skyClarity = 1 + (100 - cloud) / 100;
  const sunMultiplier = sunTempMultiplier(temp);
  const sunHarshness = (rawIntensity / 65) * skyClarity * 80;

  // 3: Lowered Mugginess Gate (Center at 22.5°C now)
  const humidityWeight = sigmoid(temp, 0.6, 22.5);
  let humidityPenalty = humidityWeight * Math.max(0, hum - 60) * 1.5;

  // Wind Relief Logic: If under 29°C, wind reduces humidity discomfort
  if (temp < 29 && wind > 14 && humidityPenalty > 1) {
    const relief = Math.min(humidityPenalty * 0.6, (wind - 14) * 2);

    if (relief > 1) {
      humidityPenalty -= relief;
      factors.push({ label: "Wind Cooling Relief", impact: Math.round(relief) });
    }
  }

  if (humidityPenalty > 5) {
    score -= humidityPenalty;
    factors.push({ label: "Muggy/Sticky Air", impact: -Math.round(humidityPenalty) });
  }

  // 4. THE "STING" & "MUGGY" CORRECTIONS
  if (isDay === 1) {
    // A: Aggressive Glare Penalty (Visual Fatigue)
    if (sunHarshness > 45) {
      // Using multiplier 0.6 for glare penalty — e.g. 80% harshness
      // yields (80 - 50) * 0.6 ≈ 18 point drop.
      const glarePenalty = (sunHarshness - 50) * 0.6;
      // Harsh sun penalty decreases with low temps
      score -= glarePenalty * sunMultiplier;
      factors.push({ label: "Solar Intensity", impact: -Math.round(glarePenalty * sunMultiplier) });
    }

    // B: Temperature Context (Harsh sun is NEVER a bonus if >70% harsh)
    if (temp < 15 && sunHarshness > 40) {
      const sunBonus = Math.min(uv * 1.5, 10);
      score += sunBonus;
      factors.push({ label: "Pleasant Winter Sun", impact: Math.round(sunBonus) });
    }

    // C: THE SYNERGY PENALTY (The 'Tropical Wall')
    // If both are > 70%, add a compounding penalty
    if (sunHarshness > 70 && hum > 70 && temp > 16) {
      const synergyPenalty = 15;
      score -= synergyPenalty;
      factors.push({ label: "Tropical Intensity", impact: -synergyPenalty });
    }
  }

  // 5. WINTER & PRESSURE (Minor impacts)
  if (temp < 16 && isDay && sunHarshness < 50) {
    score += 5; // Small crisp winter day bonus
  }

  // 5.1. LINEAR PRESSURE IMPACT
  // Standard is ~1013.25.
  // High pressure (>1015) = Stable/Positive. Low (<1008) = Cozy/Heavy.
  let pressureImpact = (pressure - 1013.25) * 0.5;
  // Cap the impact so it doesn't swing the score too wildly
  pressureImpact = Math.max(-8, Math.min(8, pressureImpact));

  if (pressure < 1008 && cloud > 60) {
    // "Cozy" Pre-storm override
    pressureImpact = 7;
    factors.push({ label: 'Pre-storm "Cozy" Vibes', impact: 7 });
  } else {
    factors.push({ label: "Atmospheric Stability", impact: Math.round(pressureImpact) });
  }
  score += pressureImpact;

  const finalScore = Math.min(120, Math.max(-20, Math.round(score)));

  return { score: finalScore, factors, sunHarshness: Math.round(sunHarshness) };
};
