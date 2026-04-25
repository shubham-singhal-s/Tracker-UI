export const CITIES = ["Martin Place", "Castle Hill", "Kellyville", "Vasundhara"];

const sigmoid = (x: number, k: number, x0: number) => 1 / (1 + Math.exp(-k * (x - x0)));
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

/* ------------------------------------------------------------------ */
/*  Temperature Comfort — Gaussian plateau 20–24°C with σ=7           */
/* ------------------------------------------------------------------ */
function temperatureComfortScore(temp: number): number {
  const COMFORT_MIN = 20;
  const COMFORT_MAX = 24;
  const SD = 7;

  if (temp >= COMFORT_MIN && temp <= COMFORT_MAX) return 100;

  const distance = temp < COMFORT_MIN ? COMFORT_MIN - temp : temp - COMFORT_MAX;
  return 100 * Math.exp(-0.5 * Math.pow(distance / SD, 2));
}

/* ------------------------------------------------------------------ */
/*  UV Stress — exponential curve because NSW UV regularly hits 11+   */
/* ------------------------------------------------------------------ */
function uvStressScore(uv: number): number {
  // Exponential penalty: negligible at UV 0–4, ramps up 6+, extreme at 10+
  return Math.pow(uv / 5, 2.4) * 7;
}

/* ------------------------------------------------------------------ */
/*  Sun Harshness — standalone metric for glare / thermal load        */
/*  radiation is in MJ/m² (Open-Meteo daily sum)                      */
/* ------------------------------------------------------------------ */
function calculateSunHarshness(uv: number, radiation: number, cloud: number): number {
  const radNorm = clamp(radiation / 32, 0, 1.1); // 0–35 MJ/m² typical daily range
  const uvNorm = uv / 12; // 12 is extreme
  const skyClarity = 0.85 + ((100 - cloud) / 100) * 0.45; // 0.85–1.30
  const raw = (uvNorm * 0.65 + radNorm * 0.35) * skyClarity;
  return clamp(raw * 100, 0, 100);
}

/* ------------------------------------------------------------------ */
/*  Humidity Penalty — context-aware by temperature                   */
/* ------------------------------------------------------------------ */
function humidityPenalty(temp: number, hum: number, wind: number): { penalty: number; relief: number } {
  const humidityWeight = sigmoid(temp, 0.5, 21); // ramps up around 21°C
  const basePenalty = humidityWeight * Math.max(0, hum - 58) * 1.2;

  let relief = 0;
  if (temp > 18 && temp < 30 && wind > 12 && basePenalty > 2) {
    relief = Math.min(basePenalty * 0.5, (wind - 12) * 1.5);
  }

  return { penalty: Math.max(0, basePenalty - relief), relief };
}

/* ------------------------------------------------------------------ */
/*  Wind Comfort — context-sensitive (wind in km/h)                   */
/* ------------------------------------------------------------------ */
function windComfort(temp: number, wind: number): number {
  if (wind >= 5 && wind <= 15) {
    if (temp > 26) return 3; // welcome breeze when hot
    return 0;
  }

  if (wind < 3 && temp > 24) return -2; // stuffy

  if (wind > 25) {
    if (temp < 15) return -8;
    if (temp < 20) return -5;
    return -3;
  }

  if (wind > 18) {
    if (temp < 15) return -4;
    return -1;
  }

  return 0;
}

/* ------------------------------------------------------------------ */
/*  Pressure & Atmospheric Stability                                  */
/* ------------------------------------------------------------------ */
function pressureImpact(pressure: number, cloud: number, temp: number): { impact: number; label: string } {
  if (pressure < 1008 && cloud > 60 && temp > 12 && temp < 22) {
    return { impact: 6, label: 'Pre-storm "Cozy" Vibes' };
  }

  let impact = (pressure - 1013) * 0.4;
  if (pressure > 1020 && temp > 28) impact -= 3; // oppressive heat under strong high

  impact = clamp(impact, -6, 6);
  const label = impact > 1 ? "Stable Atmosphere" : impact < -2 ? "Low Pressure Heaviness" : "Atmospheric Stability";
  return { impact: Math.round(impact), label };
}

/* ------------------------------------------------------------------ */
/*  Precipitation — context aware                                     */
/* ------------------------------------------------------------------ */
function precipitationImpact(precipMm: number, temp: number, cloud: number): { impact: number; label: string } {
  if (!precipMm || precipMm <= 0) return { impact: 0, label: "" };

  if (precipMm < 2 && temp > 15 && temp < 24 && cloud > 50) {
    return { impact: 4, label: "Gentle Rain Coziness" };
  }

  if (precipMm < 8) return { impact: -4, label: "Rain Inconvenience" };
  if (precipMm < 20) return { impact: -10, label: "Heavy Rain Disruption" };
  return { impact: -16, label: "Torrential Rain" };
}

/* ------------------------------------------------------------------ */
/*  Apparent vs Actual Temp Delta                                     */
/* ------------------------------------------------------------------ */
function apparentDeltaImpact(actual: number, apparent: number, wind: number): { impact: number; label: string } {
  const delta = apparent - actual;

  if (delta > 4) return { impact: -Math.round(delta * 1.5), label: "Heat Index Stress" };
  if (delta > 2) return { impact: -Math.round(delta), label: "Feels Warmer" };
  if (delta < -4) return { impact: -Math.round(Math.abs(delta) * 1.2), label: "Wind Chill" };
  if (delta < -2) return { impact: -2, label: "Cool Breeze Effect" };

  return { impact: 0, label: "" };
}

/* ------------------------------------------------------------------ */
/*  Main Entrypoint                                                   */
/* ------------------------------------------------------------------ */
export const calculateMoodScore = (apiData: any) => {
  const { current, daily } = apiData;
  const temp = current.apparent_temperature;
  const actualTemp = current.temperature_2m ?? temp;
  const hum = current.relative_humidity_2m;
  const uv = daily.uv_index_max?.[0] ?? 0;
  const radiation = daily.shortwave_radiation_sum?.[0] ?? 0; // MJ/m²
  const cloud = current.cloud_cover ?? 0;
  const isDay = current.is_day;
  const wind = current.wind_speed_10m; // km/h
  const pressure = current.pressure_msl;
  const precipitation = current.precipitation ?? daily.precipitation_sum?.[0] ?? 0;

  const factors: any[] = [];

  // 1. BASE TEMPERATURE COMFORT
  let score = temperatureComfortScore(temp);
  factors.push({ label: "Temperature Comfort", impact: Math.round(score) });

  // 2. APPARENT TEMP DELTA (mugginess or wind chill)
  const deltaFx = apparentDeltaImpact(actualTemp, temp, wind);
  if (deltaFx.impact !== 0) {
    score += deltaFx.impact;
    factors.push({ label: deltaFx.label, impact: deltaFx.impact });
  }

  // 3. HUMIDITY & MUGGINESS
  const { penalty: humPenalty, relief: windRelief } = humidityPenalty(temp, hum, wind);
  if (windRelief > 1) {
    factors.push({ label: "Wind Cooling Relief", impact: Math.round(windRelief) });
  }
  if (humPenalty > 3) {
    score -= humPenalty;
    factors.push({ label: "Muggy/Sticky Air", impact: -Math.round(humPenalty) });
  }

  // 4. SUN HARSHNESS (daytime only)
  const sunHarshness = calculateSunHarshness(uv, radiation, cloud);

  if (isDay === 1) {
    // UV stress: exponential curve because NSW UV regularly hits 11+
    const uvStress = uvStressScore(uv);
    if (uvStress > 5) {
      score -= uvStress;
      factors.push({ label: "UV Stress", impact: -Math.round(uvStress) });
    }

    // Glare / solar intensity
    if (sunHarshness > 40) {
      const glarePenalty = (sunHarshness - 40) * 0.55;
      // Reduce glare penalty when it's cold (winter sun is welcome)
      const tempFactor = temp < 15 ? 0.3 : temp < 20 ? 0.7 : 1.0;
      const applied = glarePenalty * tempFactor;
      score -= applied;
      factors.push({ label: "Solar Intensity", impact: -Math.round(applied) });
    }

    // Pleasant winter sun: cold day + moderate sun = mood boost
    if (temp < 15 && sunHarshness > 25 && sunHarshness < 65) {
      const sunBonus = Math.min(uv * 1.8, 10);
      score += sunBonus;
      factors.push({ label: "Pleasant Winter Sun", impact: Math.round(sunBonus) });
    }

    // Tropical wall: extreme sun + high humidity + warm
    if (sunHarshness > 70 && hum > 70 && temp > 16) {
      const synergyPenalty = 15;
      score -= synergyPenalty;
      factors.push({ label: "Tropical Intensity", impact: -synergyPenalty });
    }
  }

  // 5. WIND COMFORT
  const windImpact = windComfort(temp, wind);
  if (windImpact !== 0) {
    score += windImpact;
    factors.push({
      label: windImpact > 0 ? "Pleasant Breeze" : "Uncomfortable Wind",
      impact: windImpact,
    });
  }

  // 6. PRECIPITATION
  const precipFx = precipitationImpact(precipitation, temp, cloud);
  if (precipFx.impact !== 0) {
    score += precipFx.impact;
    factors.push({ label: precipFx.label, impact: precipFx.impact });
  }

  // 7. PRESSURE & ATMOSPHERIC STABILITY
  const pressureFx = pressureImpact(pressure, cloud, temp);
  score += pressureFx.impact;
  factors.push({ label: pressureFx.label, impact: pressureFx.impact });

  // 8. WINTER CRISP BONUS
  if (temp < 16 && isDay && sunHarshness < 50 && hum < 75 && wind < 20) {
    score += 4;
    factors.push({ label: "Crisp Winter Air", impact: 4 });
  }

  // 9. NIGHT MODE ADJUSTMENTS
  if (isDay === 0) {
    // Remove harshness of UV at night (already excluded above), but add night calm if pleasant
    if (temp >= 18 && temp <= 24 && hum < 70 && wind < 15 && precipitation < 1) {
      score += 3;
      factors.push({ label: "Pleasant Evening", impact: 3 });
    }
  }

  const finalScore = Math.min(120, Math.max(-20, Math.round(score)));

  return { score: finalScore, factors, sunHarshness: Math.round(sunHarshness) };
};
