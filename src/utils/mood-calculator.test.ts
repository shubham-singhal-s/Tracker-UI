import { describe, expect, it, test } from "vitest";
import { calculateMoodScore } from "./mood-calculator";

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
    },
    daily: {
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
