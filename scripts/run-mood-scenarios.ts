import fs from "node:fs";
import { calculateMoodScore } from "../src/utils/mood-calculator.ts";

// Minimal ANSI color helpers (no external dependency)
const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
};

function color(text: string, code: string) {
  return `${code}${text}${ANSI.reset}`;
}

function bold(text: string) {
  return color(text, ANSI.bold);
}

function cyan(text: string) {
  return color(text, ANSI.cyan);
}

function green(text: string) {
  return color(text, ANSI.green);
}

function yellow(text: string) {
  return color(text, ANSI.yellow);
}

function red(text: string) {
  return color(text, ANSI.red);
}

function magenta(text: string) {
  return color(text, ANSI.magenta);
}

function gray(text: string) {
  return color(text, ANSI.gray);
}

type Scenario = {
  name: string;
  input: any;
};

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
      time: overrides.time ?? ["2024-10-15T00:00:00Z"],
      uv_index_max: [overrides.uv ?? 3],
      shortwave_radiation_sum: [overrides.radiation ?? 18],
      precipitation_sum: [overrides.dailyPrecipitation ?? 0],
    },
  };
}

const scenarios: Scenario[] = [
  // Year-round baselines
  {
    name: "Ideal spring day",
    input: makeApi(22, {
      time: ["2024-10-15T00:00:00Z"],
      humidity: 45,
      uv: 3,
      radiation: 18,
      cloud: 20,
      wind: 3,
      pressure: 1013,
    }),
  },
  {
    name: "Hot and humid summer day",
    input: makeApi(32, {
      time: ["2024-01-15T00:00:00Z"],
      humidity: 85,
      uv: 7,
      radiation: 28,
      cloud: 10,
      wind: 2,
      pressure: 1010,
      apparent: 35,
    }),
  },
  {
    name: "Humid winter day",
    input: makeApi(10, {
      time: ["2024-07-15T00:00:00Z"],
      humidity: 80,
      uv: 2,
      radiation: 8,
      cloud: 70,
      wind: 3,
      pressure: 1006,
    }),
  },
  {
    name: "Dry and hot summer day",
    input: makeApi(34, {
      time: ["2024-01-15T00:00:00Z"],
      humidity: 20,
      uv: 8,
      radiation: 32,
      cloud: 5,
      wind: 3,
      pressure: 1012,
    }),
  },
  {
    name: "Dry crisp winter morning",
    input: makeApi(8, {
      time: ["2024-07-15T00:00:00Z"],
      humidity: 20,
      uv: 4,
      radiation: 14,
      cloud: 10,
      wind: 2,
      pressure: 1025,
    }),
  },

  // Atmospheric pressure & rain scenarios
  {
    name: "Pre-storm cozy vibes",
    input: makeApi(16, {
      time: ["2024-04-15T00:00:00Z"],
      humidity: 95,
      uv: 1,
      radiation: 4,
      cloud: 90,
      wind: 4,
      pressure: 998,
    }),
  },
  {
    name: "Overcast mild autumn",
    input: makeApi(18, {
      time: ["2024-04-15T00:00:00Z"],
      humidity: 70,
      uv: 1,
      radiation: 6,
      cloud: 85,
      wind: 4,
      pressure: 1008,
    }),
  },
  {
    name: "Breezy warm spring",
    input: makeApi(26, {
      time: ["2024-10-15T00:00:00Z"],
      humidity: 40,
      uv: 6,
      radiation: 22,
      cloud: 20,
      wind: 8,
      pressure: 1014,
    }),
  },
  {
    name: "Calm hot summer",
    input: makeApi(35, {
      time: ["2024-01-15T00:00:00Z"],
      humidity: 30,
      uv: 9,
      radiation: 34,
      cloud: 5,
      wind: 1,
      pressure: 1011,
    }),
  },
  {
    name: "Mild muggy morning",
    input: makeApi(20, {
      time: ["2024-10-15T00:00:00Z"],
      humidity: 75,
      uv: 2,
      radiation: 10,
      cloud: 50,
      wind: 1,
      pressure: 1010,
    }),
  },
  {
    name: "Pleasant spring",
    input: makeApi(21, {
      time: ["2024-09-15T00:00:00Z"],
      humidity: 50,
      uv: 4,
      radiation: 20,
      cloud: 10,
      wind: 3,
      pressure: 1016,
    }),
  },
  {
    name: "Cloudy cool winter",
    input: makeApi(12, {
      time: ["2024-07-15T00:00:00Z"],
      humidity: 65,
      uv: 1,
      radiation: 5,
      cloud: 80,
      wind: 3,
      pressure: 1012,
    }),
  },
  {
    name: "Sunny hot coastal summer",
    input: makeApi(30, {
      time: ["2024-01-15T00:00:00Z"],
      humidity: 60,
      uv: 8,
      radiation: 30,
      cloud: 5,
      wind: 4,
      pressure: 1010,
    }),
  },
  {
    name: "Desert hot summer",
    input: makeApi(40, {
      time: ["2024-01-15T00:00:00Z"],
      humidity: 5,
      uv: 11,
      radiation: 35,
      cloud: 0,
      wind: 2,
      pressure: 1005,
    }),
  },
  {
    name: "Chilly clear winter",
    input: makeApi(2, {
      time: ["2024-07-15T00:00:00Z"],
      humidity: 40,
      uv: 1,
      radiation: 12,
      cloud: 0,
      wind: 2,
      pressure: 1032,
    }),
  },

  // Time-of-day scenarios
  {
    name: "Pleasant evening",
    input: makeApi(21, {
      time: ["2024-10-15T00:00:00Z"],
      humidity: 50,
      uv: 0,
      radiation: 0,
      cloud: 30,
      wind: 5,
      pressure: 1015,
      isDay: 0,
    }),
  },
  {
    name: "Warm night stagnation",
    input: makeApi(26, {
      time: ["2024-01-15T00:00:00Z"],
      humidity: 55,
      uv: 0,
      radiation: 0,
      cloud: 20,
      wind: 3,
      pressure: 1025,
      isDay: 0,
    }),
  },

  // Weather-code scenarios
  {
    name: "Gentle drizzle",
    input: makeApi(17, {
      time: ["2024-10-15T00:00:00Z"],
      weatherCode: 53,
      humidity: 85,
      uv: 1,
      radiation: 5,
      cloud: 90,
      wind: 3,
      pressure: 1009,
      precipitation: 1.5,
    }),
  },
  {
    name: "Thunderstorm",
    input: makeApi(19, {
      time: ["2024-10-15T00:00:00Z"],
      weatherCode: 95,
      humidity: 95,
      uv: 2,
      radiation: 8,
      cloud: 100,
      wind: 28,
      pressure: 996,
      precipitation: 25,
    }),
  },
  {
    name: "Foggy morning",
    input: makeApi(12, {
      time: ["2024-04-15T00:00:00Z"],
      weatherCode: 45,
      humidity: 95,
      uv: 1,
      radiation: 3,
      cloud: 100,
      wind: 1,
      pressure: 1015,
    }),
  },
  {
    name: "Heavy rain",
    input: makeApi(15, {
      time: ["2024-07-15T00:00:00Z"],
      weatherCode: 65,
      humidity: 90,
      uv: 1,
      radiation: 4,
      cloud: 100,
      wind: 15,
      pressure: 1000,
      precipitation: 15,
    }),
  },

  // Apparent-temperature delta scenarios
  {
    name: "Wind chill day",
    input: makeApi(8, {
      time: ["2024-07-15T00:00:00Z"],
      apparent: 2,
      humidity: 50,
      uv: 2,
      radiation: 10,
      cloud: 30,
      wind: 25,
      pressure: 1015,
    }),
  },
  {
    name: "Heat index stress",
    input: makeApi(30, {
      time: ["2024-01-15T00:00:00Z"],
      apparent: 36,
      humidity: 75,
      uv: 6,
      radiation: 24,
      cloud: 20,
      wind: 2,
      pressure: 1010,
    }),
  },
];

function seasonFromTime(time?: string[]): string {
  const t = time?.[0];
  if (!t) return "—";
  const m = new Date(t).getMonth() + 1;
  if ([12, 1, 2].includes(m)) return "Summer";
  if ([3, 4, 5].includes(m)) return "Autumn";
  if ([6, 7, 8].includes(m)) return "Winter";
  return "Spring";
}

function printScenario(s: Scenario) {
  const out = calculateMoodScore(s.input);
  const title = `----- ${s.name} -----`;
  console.log(cyan(bold(title)));

  const actual = s.input.current.temperature_2m;
  const apparent = s.input.current.apparent_temperature;
  const H = s.input.current.relative_humidity_2m;
  const UV = s.input.daily.uv_index_max[0];
  const R = s.input.daily.shortwave_radiation_sum[0];
  const C = s.input.current.cloud_cover;
  const W = s.input.current.wind_speed_10m;
  const P = s.input.current.pressure_msl;
  const wc = s.input.current.weather_code;
  const isDay = s.input.current.is_day;
  const season = seasonFromTime(s.input.daily.time);

  let tempStr = `${bold(String(actual))}°C`;
  if (actual !== apparent) {
    tempStr += gray(` (feels ${apparent}°C)`);
  }

  console.log(
    gray(`  Temp: `) +
      `${tempStr}, ` +
      gray(`Humidity: `) +
      `${String(H)}%, ` +
      gray(`UV: `) +
      `${String(UV)}, ` +
      gray(`Radiation: `) +
      `${String(R)} MJ/m², ` +
      gray(`Cloud: `) +
      `${String(C)}%, ` +
      gray(`Wind: `) +
      `${String(W)} km/h, ` +
      gray(`Pressure: `) +
      `${String(P)} hPa`,
  );

  console.log(gray(`  Season: ${season}, IsDay: ${isDay}, WeatherCode: ${wc}`));

  // Color score based on value
  const score = Number(out.score ?? 0);
  let scoreStr = String(score);
  if (!Number.isNaN(score)) {
    if (score >= 75) scoreStr = green(String(score));
    else if (score >= 40) scoreStr = yellow(String(score));
    else scoreStr = red(String(score));
  }
  console.log(`  ${magenta("Score:")} ${scoreStr}`);

  const sun = Number(out.sunHarshness ?? 0);
  const sunStr = Number.isFinite(sun) ? `${sun}%` : String(out.sunHarshness);
  console.log(`  ${magenta("Sun Harshness:")} ${yellow(sunStr)}`);

  console.log(bold(gray("  Factors:")));
  out.factors.forEach((f: any) => {
    const impact = Number(f.impact ?? 0);
    const impactLabel = `${impact}%`;
    const impactColored = impact < 0 ? red(impactLabel) : impact > 10 ? green(impactLabel) : gray(impactLabel);
    console.log(`   ${gray("└──")} ${bold(f.label)}: ${impactColored}`);
  });
}

function main() {
  scenarios.forEach((s) => printScenario(s));
}

function generateMarkdown(scenarios: Scenario[]): string {
  let md = "## 🌤️ Mood Scenario Results\n\n";
  md += "| Scenario | Season | Score | Sun Harshness | Key Factors |\n";
  md += "|----------|--------|-------|---------------|-------------|\n";

  for (const s of scenarios) {
    const out = calculateMoodScore(s.input);
    const season = seasonFromTime(s.input.daily.time);
    const score = out.score;
    const sun = out.sunHarshness;

    const pos = out.factors.filter((f: any) => f.impact > 0).sort((a: any, b: any) => b.impact - a.impact)[0];
    const neg = out.factors.filter((f: any) => f.impact < 0).sort((a: any, b: any) => a.impact - b.impact)[0];

    let keyFactors = "";
    if (pos) keyFactors += `+${pos.impact} ${pos.label}`;
    if (pos && neg) keyFactors += "<br>";
    if (neg) keyFactors += `${neg.impact} ${neg.label}`;
    if (!pos && !neg) keyFactors = "—";

    md += `| ${s.name} | ${season} | **${score}** | ${sun}% | ${keyFactors} |\n`;
  }

  md += "\n";
  return md;
}

function writeSummary(path: string) {
  fs.writeFileSync(path, generateMarkdown(scenarios));
}

// ESM-compatible entrypoint check: compare import.meta.url to process.argv[1]
import { pathToFileURL } from "node:url";

const entryArg = process.argv && process.argv[1];
if (entryArg && import.meta.url === pathToFileURL(entryArg).href) {
  const summaryIndex = process.argv.indexOf("--summary");
  if (summaryIndex !== -1 && process.argv[summaryIndex + 1]) {
    writeSummary(process.argv[summaryIndex + 1]);
  } else {
    main();
  }
}

export { makeApi, scenarios };
