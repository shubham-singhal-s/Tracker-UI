export const CITIES = ["Martin Place", "Castle Hill", "Kellyville", "Vasundhara"];

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

function getMonth(daily: any): number {
  const t = daily?.time?.[0];
  if (!t) return new Date().getMonth() + 1;
  return new Date(t).getMonth() + 1;
}

function seasonalShift(month: number): number {
  // NSW seasons: summer Dec-Feb, winter Jun-Aug
  if ([12, 1, 2].includes(month)) return 1.5;
  if ([6, 7, 8].includes(month)) return -1.5;
  return 0;
}

function temperatureComfortScore(temp: number, month: number): number {
  const shift = seasonalShift(month);
  const center = 22 + shift;
  const min = center - 3;
  const max = center + 3;
  const sdCold = 8;
  const sdHot = 5.5;

  if (temp >= min && temp <= max) return 100;

  if (temp < min) {
    return 100 * Math.exp(-0.5 * Math.pow((min - temp) / sdCold, 2));
  }
  return 100 * Math.exp(-0.5 * Math.pow((temp - max) / sdHot, 2));
}

function uvStressScore(uv: number): number {
  return 30 / (1 + Math.exp(-0.9 * (uv - 6)));
}

function calculateSunHarshness(uv: number, radiation: number, cloud: number): number {
  const radNorm = clamp(radiation / 32, 0, 1.1);
  const uvNorm = uv / 12;
  const skyClarity = 0.85 + ((100 - cloud) / 100) * 0.45;
  const raw = (uvNorm * 0.65 + radNorm * 0.35) * skyClarity;
  return clamp(raw * 100, 0, 100);
}

function dewPointDepressionScore(temp: number, rh: number): number {
  // Plan formula: Td = temp - (100 - rh)/5; DPD = temp - Td = (100 - rh)/5

  const dpd = (100 - rh) / 5;
  if (dpd >= 4) return 0 * temp;
  return (4 - dpd) * 4;
}

function heatIndexScore(temp: number, rh: number): number {
  if (temp <= 26) return 0;
  const deviation = Math.max(0, ((temp - 26) * (rh - 50)) / 20);
  return deviation * 2;
}

function windComfort(temp: number, wind: number): number {
  if (wind >= 5 && wind <= 15) {
    if (temp > 26) return 3;
    return 0;
  }
  if (wind < 3 && temp > 24) return -2;
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

function weatherCodeImpact(code: number, temp: number): { impact: number; label: string } {
  if (code == null) return { impact: 0, label: "" };
  if ([45, 48].includes(code)) return { impact: -3, label: "Fog" };
  if ([51, 53, 55].includes(code) && temp > 10) return { impact: 2, label: "Gentle Drizzle" };
  if ([95, 96, 99].includes(code)) return { impact: -12, label: "Thunderstorm" };
  if ([65, 82].includes(code)) return { impact: -16, label: "Heavy Rain" };
  return { impact: 0, label: "" };
}

function seasonalAdaptation(month: number, temp: number): number {
  const isSummer = [12, 1, 2].includes(month);
  const isWinter = [6, 7, 8].includes(month);
  const ideal = isSummer ? 27 : isWinter ? 17 : 22;
  return 5 * Math.exp(-0.5 * Math.pow((temp - ideal) / 5, 2));
}

function precipitationImpact(
  currentPrecip: number,
  dailyPrecip: number,
  temp: number,
  cloud: number,
): { impact: number; label: string } {
  const precip = (currentPrecip ?? 0) * 0.3 + (dailyPrecip ?? 0) * 0.7;
  if (precip <= 0) return { impact: 0, label: "" };
  if (precip < 2 && temp > 15 && temp < 24 && cloud > 50) {
    return { impact: 4, label: "Gentle Rain Coziness" };
  }
  if (precip < 8) return { impact: -4, label: "Rain Inconvenience" };
  if (precip < 20) return { impact: -10, label: "Heavy Rain Disruption" };
  return { impact: -16, label: "Torrential Rain" };
}

function pressureImpact(
  pressure: number,
  cloud: number,
  temp: number,
  isRaining: boolean,
): { impact: number; label: string } {
  if (pressure < 1008 && cloud > 60 && temp > 12 && temp < 22 && !isRaining) {
    return { impact: 6, label: 'Pre-storm "Cozy" Vibes' };
  }
  let impact = (pressure - 1013) * 0.4;
  if (pressure > 1020 && temp > 28) impact -= 3;
  impact = clamp(impact, -6, 6);
  const label = impact > 1 ? "Stable Atmosphere" : impact < -2 ? "Low Pressure Heaviness" : "Atmospheric Stability";
  return { impact: Math.round(impact), label };
}

function apparentDeltaImpact(actual: number, apparent: number): { impact: number; label: string } {
  const delta = apparent - actual;
  if (delta > 2) {
    const raw = delta * 1.5;
    const capped = Math.min(raw, 15);
    const impact = -Math.round(capped);
    return { impact, label: delta > 4 ? "Heat Index Stress" : "Feels Warmer" };
  }
  if (delta < -4) {
    const raw = Math.abs(delta) * 1.2;
    const capped = Math.min(raw, 15);
    return { impact: -Math.round(capped), label: "Wind Chill" };
  }
  if (delta < -2) {
    return { impact: -2, label: "Cool Breeze Effect" };
  }
  return { impact: 0, label: "" };
}

function checkSynergies(
  temp: number,
  hum: number,
  wind: number,
  uv: number,
  cloud: number,
  isDay: number,
  precip: number,
  pressure: number,
): Array<{ label: string; impact: number }> {
  const out: Array<{ label: string; impact: number }> = [];

  if (temp > 28 && hum > 70) {
    out.push({ label: "Heat Index Stress", impact: -8 });
  }
  if (uv > 10 && temp > 30 && cloud < 10) {
    out.push({ label: "Unrelenting Sun", impact: -10 });
  }
  if (temp < 12 && wind > 25) {
    out.push({ label: "Exposed Chill", impact: -6 });
  }
  if (isDay === 0 && temp >= 18 && temp <= 24 && wind < 10 && precip < 1) {
    out.push({ label: "Pleasant Evening", impact: 3 });
  }
  if (precip > 0 && temp >= 15 && temp <= 22 && cloud > 80 && pressure < 1006) {
    out.push({ label: "Cozy Rain", impact: 4 });
  }

  return out;
}

export const calculateMoodScore = (apiData: any) => {
  const { current, daily } = apiData;
  const month = getMonth(daily);

  const apparentTemp = current.apparent_temperature;
  const actualTemp = current.temperature_2m ?? apparentTemp;
  const hum = current.relative_humidity_2m;
  const uv = daily.uv_index_max?.[0] ?? 0;
  const radiation = daily.shortwave_radiation_sum?.[0] ?? 0;
  const cloud = current.cloud_cover ?? 0;
  const isDay = current.is_day;
  const wind = current.wind_speed_10m;
  const pressure = current.pressure_msl;
  const currentPrecip = current.precipitation ?? 0;
  const dailyPrecip = daily.precipitation_sum?.[0] ?? 0;
  const weatherCode = current.weather_code;

  const factors: any[] = [];
  let score = 0;

  // 1. Temperature comfort
  const tempComfort = temperatureComfortScore(actualTemp, month);
  score += tempComfort;
  factors.push({ label: "Temperature Comfort", impact: Math.round(tempComfort) });

  // 2. Apparent delta
  const deltaFx = apparentDeltaImpact(actualTemp, apparentTemp);
  if (deltaFx.impact !== 0) {
    score += deltaFx.impact;
    factors.push({ label: deltaFx.label, impact: deltaFx.impact });
  }

  // 3. Dew point depression
  const dpdPenalty = dewPointDepressionScore(actualTemp, hum);
  if (dpdPenalty > 0) {
    score -= dpdPenalty;
    factors.push({ label: "Muggy Air", impact: -Math.round(dpdPenalty) });
  }

  // 4. Heat index
  const hiPenalty = heatIndexScore(actualTemp, hum);
  if (hiPenalty > 0) {
    score -= hiPenalty;
    factors.push({ label: "Heat Index Stress", impact: -Math.round(hiPenalty) });
  }

  // 5. Sun harshness
  const sunHarshness = calculateSunHarshness(uv, radiation, cloud);

  if (isDay === 1) {
    const uvStress = uvStressScore(uv);
    if (uvStress > 2) {
      score -= uvStress;
      factors.push({ label: "UV Stress", impact: -Math.round(uvStress) });
    }

    if (sunHarshness > 40) {
      const tempFactor = actualTemp < 15 ? 0.3 : actualTemp < 20 ? 0.7 : 1.0;
      const glarePenalty = ((sunHarshness - 40) / 60) * 25 * tempFactor;
      score -= glarePenalty;
      factors.push({ label: "Solar Intensity", impact: -Math.round(glarePenalty) });
    }

    if (actualTemp < 15 && sunHarshness > 25 && sunHarshness < 65) {
      const sunBonus = Math.min(uv * 1.8, 10);
      score += sunBonus;
      factors.push({ label: "Pleasant Winter Sun", impact: Math.round(sunBonus) });
    }
  }

  // 6. Wind
  const windImpact = windComfort(actualTemp, wind);
  if (windImpact !== 0) {
    score += windImpact;
    factors.push({ label: windImpact > 0 ? "Pleasant Breeze" : "Uncomfortable Wind", impact: windImpact });
  }

  // 7. Weather code
  const codeFx = weatherCodeImpact(weatherCode, actualTemp);
  if (codeFx.impact !== 0) {
    score += codeFx.impact;
    factors.push({ label: codeFx.label, impact: codeFx.impact });
  }

  // 8. Precipitation
  const precipFx = precipitationImpact(currentPrecip, dailyPrecip, actualTemp, cloud);
  if (precipFx.impact !== 0) {
    score += precipFx.impact;
    factors.push({ label: precipFx.label, impact: precipFx.impact });
  }

  // 9. Pressure
  const isRaining = (currentPrecip ?? 0) > 2 || (dailyPrecip ?? 0) > 5;
  const pressureFx = pressureImpact(pressure, cloud, actualTemp, isRaining);
  score += pressureFx.impact;
  factors.push({ label: pressureFx.label, impact: pressureFx.impact });

  // 10. Synergies
  const synergies = checkSynergies(actualTemp, hum, wind, uv, cloud, isDay, currentPrecip, pressure);
  for (const s of synergies) {
    score += s.impact;
    factors.push({ label: s.label, impact: s.impact });
  }

  // 11. Seasonal adaptation
  const seasonalBonus = seasonalAdaptation(month, actualTemp);
  if (seasonalBonus > 1) {
    score += seasonalBonus;
    factors.push({ label: "Seasonal Adaptation", impact: Math.round(seasonalBonus) });
  }

  // 12. Winter crisp
  if (actualTemp < 16 && isDay === 1 && sunHarshness < 50 && hum < 75 && wind < 20) {
    score += 4;
    factors.push({ label: "Crisp Winter Air", impact: 4 });
  }

  // 13. Night mode extras
  if (isDay === 0) {
    if (cloud < 20 && currentPrecip < 1 && wind < 10) {
      score += 2;
      factors.push({ label: "Clear Night Calm", impact: 2 });
    }
    if (pressure > 1018 && actualTemp > 23) {
      const stagnation = Math.min((pressure - 1018) * 1.2, 8);
      score -= stagnation;
      factors.push({ label: "Warm Night Stagnation", impact: -Math.round(stagnation) });
    }
  }

  const finalScore = clamp(Math.round(score), -20, 120);

  return { score: finalScore, factors, sunHarshness: Math.round(sunHarshness) };
};
