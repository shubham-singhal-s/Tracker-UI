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
  return {
    current: {
      apparent_temperature: temp,
      relative_humidity_2m: overrides.humidity ?? 50,
      cloud_cover: overrides.cloud ?? 20,
      is_day: overrides.isDay ?? 1,
      wind_speed_10m: overrides.wind ?? 2,
      pressure_msl: overrides.pressure ?? 1013.25,
    },
    daily: {
      uv_index_max: [overrides.uv ?? 3],
      shortwave_radiation_sum: [overrides.radiation ?? 100],
    },
  };
}

const scenarios: Scenario[] = [
  { name: "Ideal", input: makeApi(22, { humidity: 45, uv: 3, radiation: 18, cloud: 20, wind: 3, pressure: 1013 }) },
  {
    name: "Hot and humid day",
    input: makeApi(32, { humidity: 85, uv: 7, radiation: 28, cloud: 10, wind: 2, pressure: 1010 }),
  },
  {
    name: "Humid winter day",
    input: makeApi(10, { humidity: 80, uv: 2, radiation: 8, cloud: 70, wind: 3, pressure: 1006 }),
  },
  {
    name: "Dry and hot day",
    input: makeApi(34, { humidity: 20, uv: 8, radiation: 32, cloud: 5, wind: 3, pressure: 1012 }),
  },
  { name: "Dry winter", input: makeApi(8, { humidity: 20, uv: 4, radiation: 14, cloud: 10, wind: 2, pressure: 1025 }) },
  {
    name: "Rainy / pre-storm",
    input: makeApi(16, { humidity: 95, uv: 1, radiation: 4, cloud: 90, wind: 4, pressure: 998, isDay: 1 }),
  },
  {
    name: "Overcast mild",
    input: makeApi(18, { humidity: 70, uv: 1, radiation: 6, cloud: 85, wind: 4, pressure: 1008 }),
  },
  {
    name: "Breezy warm",
    input: makeApi(26, { humidity: 40, uv: 6, radiation: 22, cloud: 20, wind: 8, pressure: 1014 }),
  },
  { name: "Calm hot", input: makeApi(35, { humidity: 30, uv: 9, radiation: 34, cloud: 5, wind: 1, pressure: 1011 }) },
  {
    name: "Mild muggy morning",
    input: makeApi(20, { humidity: 75, uv: 2, radiation: 10, cloud: 50, wind: 1, pressure: 1010 }),
  },
  {
    name: "Pleasant spring",
    input: makeApi(21, { humidity: 50, uv: 4, radiation: 20, cloud: 10, wind: 3, pressure: 1016 }),
  },
  {
    name: "Cloudy cool",
    input: makeApi(12, { humidity: 65, uv: 1, radiation: 5, cloud: 80, wind: 3, pressure: 1012 }),
  },
  {
    name: "Sunny hot coastal",
    input: makeApi(30, { humidity: 60, uv: 8, radiation: 30, cloud: 5, wind: 4, pressure: 1010 }),
  },
  {
    name: "Desert hot",
    input: makeApi(40, { humidity: 5, uv: 11, radiation: 35, cloud: 0, wind: 2, pressure: 1005 }),
  },
  {
    name: "Chilly clear",
    input: makeApi(2, { humidity: 40, uv: 1, radiation: 12, cloud: 0, wind: 2, pressure: 1032 }),
  },
];

function printScenario(s: Scenario) {
  const out = calculateMoodScore(s.input);
  const title = `----- ${s.name} -----`;
  console.log(cyan(bold(title)));

  const T = s.input.current.apparent_temperature;
  const H = s.input.current.relative_humidity_2m;
  const UV = s.input.daily.uv_index_max[0];
  const R = s.input.daily.shortwave_radiation_sum[0];
  const C = s.input.current.cloud_cover;
  const W = s.input.current.wind_speed_10m;
  const P = s.input.current.pressure_msl;

  console.log(
    gray(`  Temp: `) +
      `${bold(String(T))}°C, ` +
      gray(`Humidity: `) +
      `${String(H)}%, ` +
      gray(`UV: `) +
      `${String(UV)}, ` +
      gray(`Radiation: `) +
      `${String(R)} W/m², ` +
      gray(`Cloud: `) +
      `${String(C)}%, ` +
      gray(`Wind: `) +
      `${String(W)} m/s, ` +
      gray(`Pressure: `) +
      `${String(P)} hPa`,
  );

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

// ESM-compatible entrypoint check: compare import.meta.url to process.argv[1]
import { pathToFileURL } from "node:url";

const entryArg = process.argv && process.argv[1];
if (entryArg && import.meta.url === pathToFileURL(entryArg).href) {
  main();
}

export { makeApi, scenarios };
