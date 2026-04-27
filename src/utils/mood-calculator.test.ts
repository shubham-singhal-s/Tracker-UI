import { describe, expect, it, test } from "vitest";
import { calculateMoodScore, CITIES } from "./mood-calculator";

function makeApi(temp: number, overrides: any = {}) {
  const apparent = overrides.apparent ?? temp;
  return {
    current: {
      temperature_2m: temp,
      apparent_temperature: apparent,
      relative_humidity_2m: overrides.humidity ?? 50,
      cloud_cover: overrides.cloud ?? 20,
      is_day: overrides.isDay ?? 1,
      wind_speed_10m: overrides.wind ?? 2,
      pressure_msl: overrides.pressure ?? 1013.25,
      precipitation: overrides.precipitation ?? 0,
      weather_code: overrides.weatherCode ?? 0,
    },
    daily: {
      time: overrides.time ?? ["2024-04-15T00:00:00Z"],
      uv_index_max: [overrides.uv ?? 3],
      shortwave_radiation_sum: [overrides.radiation ?? 18],
      precipitation_sum: [overrides.dailyPrecipitation ?? 0],
    },
  };
}

describe("mood calculator — temperature-focused", () => {
  const cases: Array<[string, number]> = [
    ["very cold", 0],
    ["cold", 5],
    ["cool", 10],
    ["comfortable", 22],
    ["warm", 27],
    ["hot", 33],
    ["very hot", 40],
    ["scorching", 45],
  ];

  test.each(cases)("%s (%d°C) returns a numeric, clamped score", (_, temp) => {
    const res = calculateMoodScore(makeApi(temp));
    expect(typeof res.score).toBe("number");
    expect(res.score).toBeGreaterThanOrEqual(-20);
    expect(res.score).toBeLessThanOrEqual(120);
  });
});

describe("Mood Calculator - Scenario Ranges", () => {
  it.each([
    {
      name: "Ideal day",
      api: makeApi(22, { humidity: 30, uv: 3, radiation: 18, cloud: 40, wind: 3, pressure: 1025 }),
      min: 90,
      max: 120,
    },
    {
      name: "Clear day",
      api: makeApi(22, { humidity: 45, uv: 3, radiation: 18, cloud: 20, wind: 3, pressure: 1013 }),
      min: 80,
      max: 110,
    },
    {
      name: "Hot and humid day",
      api: makeApi(32, { humidity: 85, uv: 7, radiation: 28, cloud: 10, wind: 2, pressure: 1010 }),
      min: -20,
      max: 20,
    },
    {
      name: "Humid winter day",
      api: makeApi(10, { humidity: 80, uv: 2, radiation: 8, cloud: 70, wind: 3, pressure: 1006 }),
      min: 30,
      max: 70,
    },
    {
      name: "Dry and hot day",
      api: makeApi(34, { humidity: 20, uv: 8, radiation: 32, cloud: 5, wind: 3, pressure: 1012 }),
      min: -20,
      max: 30,
    },
    {
      name: "Dry winter",
      api: makeApi(8, { humidity: 20, uv: 4, radiation: 14, cloud: 10, wind: 2, pressure: 1025 }),
      min: 30,
      max: 70,
    },
    {
      name: "Rainy / pre-storm",
      api: makeApi(16, { humidity: 95, uv: 1, radiation: 4, cloud: 90, wind: 4, pressure: 998, isDay: 1 }),
      min: 70,
      max: 110,
    },
    {
      name: "Overcast mild",
      api: makeApi(18, { humidity: 70, uv: 1, radiation: 6, cloud: 85, wind: 4, pressure: 1008 }),
      min: 70,
      max: 110,
    },
    {
      name: "Breezy warm",
      api: makeApi(26, { humidity: 40, uv: 6, radiation: 22, cloud: 20, wind: 8, pressure: 1014 }),
      min: 40,
      max: 80,
    },
    {
      name: "Calm hot",
      api: makeApi(35, { humidity: 30, uv: 9, radiation: 34, cloud: 5, wind: 1, pressure: 1011 }),
      min: -20,
      max: 20,
    },
    {
      name: "Mild muggy morning",
      api: makeApi(20, { humidity: 75, uv: 2, radiation: 10, cloud: 50, wind: 1, pressure: 1010 }),
      min: 70,
      max: 110,
    },
    {
      name: "Pleasant spring",
      api: makeApi(21, { humidity: 50, uv: 4, radiation: 20, cloud: 10, wind: 3, pressure: 1016 }),
      min: 70,
      max: 105,
    },
    {
      name: "Cloudy cool",
      api: makeApi(12, { humidity: 65, uv: 1, radiation: 5, cloud: 80, wind: 3, pressure: 1012 }),
      min: 40,
      max: 80,
    },
    {
      name: "Sunny hot coastal",
      api: makeApi(30, { humidity: 60, uv: 8, radiation: 30, cloud: 5, wind: 4, pressure: 1010 }),
      min: -20,
      max: 40,
    },
    {
      name: "Desert hot",
      api: makeApi(40, { humidity: 5, uv: 11, radiation: 35, cloud: 0, wind: 2, pressure: 1005 }),
      min: -20,
      max: 10,
    },
    {
      name: "Chilly clear",
      api: makeApi(2, { humidity: 40, uv: 1, radiation: 12, cloud: 0, wind: 2, pressure: 1032 }),
      min: 0,
      max: 40,
    },
  ])("$name scenario score falls within expected range", ({ api, min, max }) => {
    const res = calculateMoodScore(api);
    expect(res.score).toBeGreaterThanOrEqual(min);
    expect(res.score).toBeLessThanOrEqual(max);
  });
});

describe("mood calculator — scenario matrix (regular ranges)", () => {
  const scenarios = [
    { name: "Ideal", api: makeApi(22, { humidity: 45, uv: 3, radiation: 18, cloud: 20, wind: 3, pressure: 1013 }) },
    {
      name: "Hot and humid day",
      api: makeApi(32, { humidity: 85, uv: 7, radiation: 28, cloud: 10, wind: 2, pressure: 1010 }),
    },
    {
      name: "Humid winter day",
      api: makeApi(10, { humidity: 80, uv: 2, radiation: 8, cloud: 70, wind: 3, pressure: 1006 }),
    },
    {
      name: "Dry and hot day",
      api: makeApi(34, { humidity: 20, uv: 8, radiation: 32, cloud: 5, wind: 3, pressure: 1012 }),
    },
    { name: "Dry winter", api: makeApi(8, { humidity: 20, uv: 4, radiation: 14, cloud: 10, wind: 2, pressure: 1025 }) },
    {
      name: "Rainy / pre-storm",
      api: makeApi(16, { humidity: 95, uv: 1, radiation: 4, cloud: 90, wind: 4, pressure: 998, isDay: 1 }),
    },
    {
      name: "Overcast mild",
      api: makeApi(18, { humidity: 70, uv: 1, radiation: 6, cloud: 85, wind: 4, pressure: 1008 }),
    },
    {
      name: "Breezy warm",
      api: makeApi(26, { humidity: 40, uv: 6, radiation: 22, cloud: 20, wind: 8, pressure: 1014 }),
    },
    { name: "Calm hot", api: makeApi(35, { humidity: 30, uv: 9, radiation: 34, cloud: 5, wind: 1, pressure: 1011 }) },
    {
      name: "Mild muggy morning",
      api: makeApi(20, { humidity: 75, uv: 2, radiation: 10, cloud: 50, wind: 1, pressure: 1010 }),
    },
    {
      name: "Pleasant spring",
      api: makeApi(21, { humidity: 50, uv: 4, radiation: 20, cloud: 10, wind: 3, pressure: 1016 }),
    },
    {
      name: "Cloudy cool",
      api: makeApi(12, { humidity: 65, uv: 1, radiation: 5, cloud: 80, wind: 3, pressure: 1012 }),
    },
    {
      name: "Sunny hot coastal",
      api: makeApi(30, { humidity: 60, uv: 8, radiation: 30, cloud: 5, wind: 4, pressure: 1010 }),
    },
    { name: "Desert hot", api: makeApi(40, { humidity: 5, uv: 11, radiation: 35, cloud: 0, wind: 2, pressure: 1005 }) },
    {
      name: "Chilly clear",
      api: makeApi(2, { humidity: 40, uv: 1, radiation: 12, cloud: 0, wind: 2, pressure: 1032 }),
    },
  ];

  const results = scenarios.map((s) => ({ name: s.name, res: calculateMoodScore(s.api) }));

  it("ideal should be better than hot+humid", () => {
    const ideal = results.find((r) => r.name === "Ideal")!.res.score;
    const hotHumid = results.find((r) => r.name === "Hot and humid day")!.res.score;
    expect(ideal).toBeGreaterThanOrEqual(hotHumid);
  });

  it("dry and hot should score higher than or equal to hot and humid", () => {
    const dryHot = results.find((r) => r.name === "Dry and hot day")!.res.score;
    const hotHumid = results.find((r) => r.name === "Hot and humid day")!.res.score;
    expect(dryHot).toBeGreaterThanOrEqual(hotHumid);
  });

  it('rainy case should include Pre-storm "Cozy" Vibes or high cloud impact', () => {
    const rain = results.find((r) => r.name === "Rainy / pre-storm")!.res;
    const labels = rain.factors.map((f: any) => f.label);
    expect(labels.some((l: string) => l.includes("Cozy") || l.includes("Pre-storm"))).toBe(true);
  });

  it("hot and humid should include muggy penalty or tropical intensity label", () => {
    const hh = results.find((r) => r.name === "Hot and humid day")!.res;
    const labels = hh.factors.map((f: any) => f.label);
    expect(labels.some((l: string) => l.includes("Muggy") || l.includes("Tropical Intensity"))).toBe(true);
  });

  it("dry winter should include Pleasant Winter Sun or Atmospheric factor", () => {
    const dw = results.find((r) => r.name === "Dry winter")!.res;
    const labels = dw.factors.map((f: any) => f.label);
    expect(labels.some((l: string) => l.includes("Pleasant Winter Sun") || l.includes("Atmospheric"))).toBe(true);
  });
});

describe("mood calculator — new features", () => {
  it("applies wind comfort bonus on hot breezy days", () => {
    const hotStill = makeApi(30, { humidity: 40, wind: 2 });
    const hotBreezy = makeApi(30, { humidity: 40, wind: 10 });
    const stillScore = calculateMoodScore(hotStill).score;
    const breezyScore = calculateMoodScore(hotBreezy).score;
    expect(breezyScore).toBeGreaterThan(stillScore);
  });

  it("applies wind chill penalty on cold windy days", () => {
    const coldCalm = makeApi(5, { humidity: 50, wind: 2 });
    const coldWindy = makeApi(5, { humidity: 50, wind: 30 });
    const calmScore = calculateMoodScore(coldCalm).score;
    const windyScore = calculateMoodScore(coldWindy).score;
    expect(windyScore).toBeLessThan(calmScore);
  });

  it("applies gentle rain coziness for mild overcast conditions", () => {
    const api = makeApi(18, { humidity: 80, cloud: 80, precipitation: 1.5 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Gentle Rain Coziness");
  });

  it("applies heat index stress when apparent temp far exceeds actual", () => {
    const api = makeApi(30, { apparent: 36, humidity: 80, wind: 2 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Heat Index Stress");
  });

  it("applies wind chill label when apparent temp far below actual", () => {
    const api = makeApi(10, { apparent: 4, humidity: 50, wind: 25 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Wind Chill");
  });

  it("night mode adds pleasant evening bonus when conditions are right", () => {
    const api = makeApi(21, { humidity: 50, wind: 5, isDay: 0, precipitation: 0 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Pleasant Evening");
  });
});

describe("mood calculator — exports and return shape", () => {
  it("exports CITIES array", () => {
    expect(Array.isArray(CITIES)).toBe(true);
    expect(CITIES).toContain("Martin Place");
    expect(CITIES).toContain("Castle Hill");
    expect(CITIES).toContain("Kellyville");
    expect(CITIES).toContain("Vasundhara");
  });

  it("returns sunHarshness as a number between 0 and 100", () => {
    const res = calculateMoodScore(makeApi(22));
    expect(typeof res.sunHarshness).toBe("number");
    expect(res.sunHarshness).toBeGreaterThanOrEqual(0);
    expect(res.sunHarshness).toBeLessThanOrEqual(100);
  });

  it("returns factors array with label and impact", () => {
    const res = calculateMoodScore(makeApi(22));
    expect(Array.isArray(res.factors)).toBe(true);
    for (const f of res.factors) {
      expect(f).toHaveProperty("label");
      expect(f).toHaveProperty("impact");
      expect(typeof f.label).toBe("string");
      expect(typeof f.impact).toBe("number");
    }
  });
});

describe("mood calculator — weather code impacts", () => {
  it("applies Fog impact for code 45", () => {
    const res = calculateMoodScore(makeApi(12, { weatherCode: 45 }));
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Fog");
  });

  it("applies Fog impact for code 48", () => {
    const res = calculateMoodScore(makeApi(12, { weatherCode: 48 }));
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Fog");
  });

  it("applies Gentle Drizzle impact for codes 51-55 when temp > 10", () => {
    const res = calculateMoodScore(makeApi(15, { weatherCode: 53 }));
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Gentle Drizzle");
  });

  it("does not apply Gentle Drizzle when temp <= 10", () => {
    const res = calculateMoodScore(makeApi(8, { weatherCode: 53 }));
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).not.toContain("Gentle Drizzle");
  });

  it("applies Thunderstorm impact for codes 95, 96, 99", () => {
    for (const code of [95, 96, 99]) {
      const res = calculateMoodScore(makeApi(20, { weatherCode: code }));
      const labels = res.factors.map((f: any) => f.label);
      expect(labels).toContain("Thunderstorm");
    }
  });

  it("applies Heavy Rain impact for codes 65 and 82", () => {
    for (const code of [65, 82]) {
      const res = calculateMoodScore(makeApi(20, { weatherCode: code }));
      const labels = res.factors.map((f: any) => f.label);
      expect(labels).toContain("Heavy Rain");
    }
  });

  it("ignores unknown weather codes", () => {
    const res = calculateMoodScore(makeApi(20, { weatherCode: 999 }));
    const weatherFactors = res.factors.filter((f: any) =>
      ["Fog", "Gentle Drizzle", "Thunderstorm", "Heavy Rain"].includes(f.label),
    );
    expect(weatherFactors.length).toBe(0);
  });
});

describe("mood calculator — sun and UV", () => {
  it("applies UV Stress for high UV during the day", () => {
    const res = calculateMoodScore(makeApi(25, { uv: 10, radiation: 30, cloud: 5, isDay: 1 }));
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("UV Stress");
  });

  it("applies Solar Intensity for harsh sun", () => {
    const res = calculateMoodScore(makeApi(30, { uv: 10, radiation: 32, cloud: 0, isDay: 1 }));
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Solar Intensity");
  });

  it("applies Pleasant Winter Sun on cold clear days", () => {
    const res = calculateMoodScore(makeApi(10, { uv: 5, radiation: 18, cloud: 10, isDay: 1, wind: 5 }));
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Pleasant Winter Sun");
  });

  it("does not apply Pleasant Winter Sun when sun harshness is too high", () => {
    const res = calculateMoodScore(makeApi(10, { uv: 10, radiation: 35, cloud: 0, isDay: 1, wind: 5 }));
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).not.toContain("Pleasant Winter Sun");
  });

  it("does not apply UV Stress or Solar Intensity at night", () => {
    const res = calculateMoodScore(makeApi(25, { uv: 10, radiation: 30, cloud: 5, isDay: 0 }));
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).not.toContain("UV Stress");
    expect(labels).not.toContain("Solar Intensity");
    expect(labels).not.toContain("Pleasant Winter Sun");
  });
});

describe("mood calculator — night mode", () => {
  it("adds Clear Night Calm when night is clear and calm", () => {
    const api = makeApi(18, { isDay: 0, cloud: 5, wind: 5, precipitation: 0 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Clear Night Calm");
  });

  it("adds Warm Night Stagnation on hot high-pressure nights", () => {
    const api = makeApi(26, { isDay: 0, pressure: 1025 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Warm Night Stagnation");
  });

  it("does not add Clear Night Calm when it is windy or cloudy", () => {
    const api = makeApi(18, { isDay: 0, cloud: 50, wind: 15, precipitation: 0 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).not.toContain("Clear Night Calm");
  });
});

describe("mood calculator — winter and cold weather", () => {
  it("adds Crisp Winter Air on cold sunny calm days", () => {
    const api = makeApi(12, { isDay: 1, cloud: 20, wind: 10, humidity: 60, uv: 4, radiation: 16 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Crisp Winter Air");
  });

  it("does not add Crisp Winter Air when wind is too strong", () => {
    const api = makeApi(12, { isDay: 1, cloud: 20, wind: 25, humidity: 60, uv: 4, radiation: 16 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).not.toContain("Crisp Winter Air");
  });

  it("adds Exposed Chill synergy when cold and windy", () => {
    const api = makeApi(8, { wind: 30, uv: 2, radiation: 8, cloud: 30 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Exposed Chill");
  });
});

describe("mood calculator — pressure impacts", () => {
  it('adds Pre-storm "Cozy" Vibes when pressure is low, cloudy, mild, and not raining', () => {
    const api = makeApi(18, { pressure: 1000, cloud: 80, precipitation: 0, dailyPrecipitation: 0 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain('Pre-storm "Cozy" Vibes');
  });

  it("adds Low Pressure Heaviness for very low pressure", () => {
    const api = makeApi(20, { pressure: 990, cloud: 20 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Low Pressure Heaviness");
  });

  it("adds Stable Atmosphere for high pressure", () => {
    const api = makeApi(20, { pressure: 1025, cloud: 20 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Stable Atmosphere");
  });

  it("caps pressure impact within expected range", () => {
    const veryHigh = calculateMoodScore(makeApi(20, { pressure: 1040 }));
    const veryLow = calculateMoodScore(makeApi(20, { pressure: 980 }));
    const pressureHighFactor = veryHigh.factors.find((f: any) => f.label.includes("Stable"));
    const pressureLowFactor = veryLow.factors.find((f: any) => f.label.includes("Low Pressure"));
    expect(pressureHighFactor!.impact).toBeLessThanOrEqual(6);
    expect(pressureLowFactor!.impact).toBeGreaterThanOrEqual(-6);
  });
});

describe("mood calculator — synergies", () => {
  it("adds Unrelenting Sun when UV, temp, and sky clarity are extreme", () => {
    const api = makeApi(32, { uv: 11, cloud: 0, radiation: 34 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Unrelenting Sun");
  });

  it("adds Cozy Rain when raining in mild overcast low-pressure conditions", () => {
    const api = makeApi(18, { precipitation: 2, cloud: 85, pressure: 1000, humidity: 90 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Cozy Rain");
  });

  it("adds Heat Index Stress synergy when very hot and humid", () => {
    const api = makeApi(30, { humidity: 75, uv: 5, radiation: 20, cloud: 10 });
    const res = calculateMoodScore(api);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Heat Index Stress");
  });
});

describe("mood calculator — seasonal adaptation", () => {
  it("gives higher seasonal bonus in summer for warm temps", () => {
    const summer = makeApi(27, { time: ["2024-01-15T00:00:00Z"] });
    const winter = makeApi(27, { time: ["2024-07-15T00:00:00Z"] });
    const summerScore = calculateMoodScore(summer).score;
    const winterScore = calculateMoodScore(winter).score;
    expect(summerScore).toBeGreaterThan(winterScore);
  });

  it("gives higher seasonal bonus in winter for cool temps", () => {
    const summer = makeApi(15, { time: ["2024-01-15T00:00:00Z"] });
    const winter = makeApi(15, { time: ["2024-07-15T00:00:00Z"] });
    const summerScore = calculateMoodScore(summer).score;
    const winterScore = calculateMoodScore(winter).score;
    expect(winterScore).toBeGreaterThan(summerScore);
  });
});

describe("mood calculator — metric units and celsius consistency", () => {
  it("treats 0°C as very cold and 40°C as very hot", () => {
    const freezing = calculateMoodScore(makeApi(0));
    const scorching = calculateMoodScore(makeApi(40));
    const pleasant = calculateMoodScore(makeApi(22));
    expect(freezing.score).toBeLessThan(pleasant.score);
    expect(scorching.score).toBeLessThan(pleasant.score);
  });

  it("does not apply heat-index penalties below 26°C", () => {
    const res = calculateMoodScore(makeApi(25, { humidity: 90 }));
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).not.toContain("Heat Index Stress");
  });

  it("applies heat-index penalties above 26°C", () => {
    const res = calculateMoodScore(makeApi(30, { humidity: 90 }));
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Heat Index Stress");
  });
});

describe("mood calculator — plan.md alignment", () => {
  it("perfect day scores within the 96-120 band", () => {
    const perfect = makeApi(22, {
      humidity: 45,
      uv: 3,
      radiation: 18,
      cloud: 25,
      wind: 6,
      pressure: 1015,
      precipitation: 0,
      isDay: 1,
    });
    const res = calculateMoodScore(perfect);
    expect(res.score).toBeGreaterThanOrEqual(96);
    expect(res.score).toBeLessThanOrEqual(120);
  });

  it("weather code impacts match plan.md values exactly", () => {
    const fog = calculateMoodScore(makeApi(15, { weatherCode: 45 }));
    const drizzle = calculateMoodScore(makeApi(15, { weatherCode: 53 }));
    const thunder = calculateMoodScore(makeApi(15, { weatherCode: 95 }));
    const heavyRain = calculateMoodScore(makeApi(15, { weatherCode: 65 }));

    const fogFactor = fog.factors.find((f: any) => f.label === "Fog");
    const drizzleFactor = drizzle.factors.find((f: any) => f.label === "Gentle Drizzle");
    const thunderFactor = thunder.factors.find((f: any) => f.label === "Thunderstorm");
    const heavyRainFactor = heavyRain.factors.find((f: any) => f.label === "Heavy Rain");

    expect(fogFactor?.impact).toBe(-3);
    expect(drizzleFactor?.impact).toBe(2);
    expect(thunderFactor?.impact).toBe(-12);
    expect(heavyRainFactor?.impact).toBe(-16);
  });

  it("bonus caps match plan.md specifications", () => {
    const winterSun = calculateMoodScore(makeApi(10, { uv: 5, radiation: 18, cloud: 10, isDay: 1, wind: 5 }));
    const winterSunFactor = winterSun.factors.find((f: any) => f.label === "Pleasant Winter Sun");
    expect(winterSunFactor?.impact).toBeLessThanOrEqual(10);

    const rainCozy = calculateMoodScore(makeApi(18, { precipitation: 1.5, dailyPrecipitation: 1.5, cloud: 85 }));
    const rainCozyFactor = rainCozy.factors.find((f: any) => f.label === "Gentle Rain Coziness");
    expect(rainCozyFactor?.impact).toBe(4);

    const preStorm = calculateMoodScore(
      makeApi(18, { pressure: 1000, cloud: 80, precipitation: 0, dailyPrecipitation: 0 }),
    );
    const preStormFactor = preStorm.factors.find((f: any) => f.label === 'Pre-storm "Cozy" Vibes');
    expect(preStormFactor?.impact).toBe(6);

    const crisp = calculateMoodScore(
      makeApi(14, { isDay: 1, cloud: 20, wind: 10, humidity: 60, uv: 4, radiation: 16 }),
    );
    const crispFactor = crisp.factors.find((f: any) => f.label === "Crisp Winter Air");
    expect(crispFactor?.impact).toBe(4);

    const evening = calculateMoodScore(makeApi(21, { isDay: 0, wind: 5, precipitation: 0 }));
    const eveningFactor = evening.factors.find((f: any) => f.label === "Pleasant Evening");
    expect(eveningFactor?.impact).toBe(3);

    const clearNight = calculateMoodScore(makeApi(18, { isDay: 0, cloud: 5, wind: 5, precipitation: 0 }));
    const clearNightFactor = clearNight.factors.find((f: any) => f.label === "Clear Night Calm");
    expect(clearNightFactor?.impact).toBe(2);

    const seasonal = calculateMoodScore(makeApi(22, { time: ["2024-01-15T00:00:00Z"] }));
    const seasonalFactor = seasonal.factors.find((f: any) => f.label === "Seasonal Adaptation");
    expect(seasonalFactor?.impact).toBeLessThanOrEqual(5);
  });

  it("precipitation impact weights current 30% and daily 70%", () => {
    const currentHeavy = calculateMoodScore(makeApi(18, { precipitation: 10, dailyPrecipitation: 0, cloud: 90 }));
    const dailyHeavy = calculateMoodScore(makeApi(18, { precipitation: 0, dailyPrecipitation: 10, cloud: 90 }));
    expect(dailyHeavy.score).toBeLessThanOrEqual(currentHeavy.score);
  });

  it("uses bounded logistic UV stress instead of unbounded penalty", () => {
    const highUv = calculateMoodScore(makeApi(25, { uv: 12, radiation: 32, cloud: 5, isDay: 1 }));
    const uvStressFactor = highUv.factors.find((f: any) => f.label === "UV Stress");
    expect(uvStressFactor?.impact).toBeLessThanOrEqual(30);
    expect(highUv.factors.some((f: any) => f.label === "UV Stress")).toBe(true);
  });
});

describe("mood calculator — NSW Australia focus", () => {
  it("includes known NSW locations in CITIES", () => {
    expect(CITIES).toContain("Martin Place");
    expect(CITIES).toContain("Castle Hill");
    expect(CITIES).toContain("Kellyville");
  });

  it("uses NSW southern-hemisphere seasons (summer Dec-Feb, winter Jun-Aug)", () => {
    const summer = makeApi(22, { time: ["2024-01-15T00:00:00Z"] });
    const winter = makeApi(22, { time: ["2024-07-15T00:00:00Z"] });
    const autumn = makeApi(32, { time: ["2024-04-15T00:00:00Z"] });

    const summerRes = calculateMoodScore(summer);
    const winterRes = calculateMoodScore(winter);
    const autumnRes = calculateMoodScore(autumn);

    const summerLabels = summerRes.factors.map((f: any) => f.label);
    const winterLabels = winterRes.factors.map((f: any) => f.label);
    const autumnLabels = autumnRes.factors.map((f: any) => f.label);

    expect(summerLabels).toContain("Seasonal Adaptation");
    expect(winterLabels).toContain("Seasonal Adaptation");
    expect(autumnLabels).not.toContain("Seasonal Adaptation");
  });

  it("rewards pleasant winter sun relevant to NSW mild winters", () => {
    const nswWinterDay = makeApi(12, {
      time: ["2024-07-15T00:00:00Z"],
      uv: 4,
      radiation: 16,
      cloud: 10,
      isDay: 1,
      wind: 5,
    });
    const res = calculateMoodScore(nswWinterDay);
    const labels = res.factors.map((f: any) => f.label);
    expect(labels).toContain("Pleasant Winter Sun");
  });
});
