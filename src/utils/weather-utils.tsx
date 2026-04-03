const BAD = "text-rose-300";
const GOOD = "text-emerald-500";

const getFormatted = (value: any, label: string, high?: number, low?: number, highGood: boolean = false) => {
  if (!value && value !== 0) {
    return;
  }
  let color = "text-white";
  if (high && value > high) {
    color = highGood ? GOOD : BAD;
  } else if (low && value <= low) {
    color = highGood ? BAD : GOOD;
  }
  return (
    <span className={color}>
      <span className="font-bold">{value}</span>
      <span>{label}</span>
    </span>
  );
};

export const getCurrentUnit = (w: any, name: string, highVal?: number, lowVal?: number, highGood?: boolean) => {
  return getFormatted(w?.current?.[name], w?.current_units?.[name], highVal, lowVal, highGood);
};

export const getDailyUnit = (w: any, name: string, highVal?: number, lowVal?: number, highGood?: boolean) => {
  return getFormatted(w?.daily?.[name]?.[0], w?.daily_units?.[name], highVal, lowVal, highGood);
};

export const getTime = (value: string) => {
  if (!value) {
    return "--";
  }
  return new Date(value).toLocaleTimeString("en-AU", {
    timeStyle: "short",
    hour12: true,
  });
};

export const getWeatherImage = (code: number): string => {
  let imageName: string;
  switch (code) {
    // Sunny / Clear
    case 0:
    case 1: // Mainly clear
      imageName = "Sunny";
      break;

    // Clouds
    case 2: // Partly cloudy
    case 3: // Overcast
      imageName = "Clouds";
      break;

    // Fog
    case 45: // Fog
    case 48: // Depositing rime fog
      imageName = "Fog";
      break;

    // Rain / Drizzle
    case 51:
    case 53:
    case 55: // Drizzle
    case 61:
    case 63:
    case 65: // Rain
    case 80:
    case 81:
    case 82: // Rain showers
      imageName = "Rain";
      break;

    // Thunder
    case 95: // Thunderstorm
    case 96: // Thunderstorm with slight hail
    case 99: // Thunderstorm with heavy hail
      imageName = "Thunder";
      break;

    default:
      imageName = "Sunny"; // fallback to Sunny.webp if unknown
      break;
  }
  return `/${imageName}.webp`;
};

export const calculateSunIntensity = (w: any) => {
  const uv = w?.daily?.uv_index_max?.[0];
  const radiation = w?.daily?.shortwave_radiation_sum?.[0];
  const cloud = w?.current?.cloud_cover;

  // 1. Raw Intensity (UV + MJ/m²)
  const rawIntensity = uv * 3.5 + radiation * 0.8;

  // 2. Clear Sky Multiplier (0% cloud = 2.0x, 100% cloud = 1.0x)
  const skyClarityMultiplier = 1 + (100 - cloud) / 100;

  // 3. Normalise against a 'Max NSW Day' (approx 60-70 units)
  const maxDayReference = 65;
  let percentage = (rawIntensity / maxDayReference) * skyClarityMultiplier * 100;

  return getFormatted(Math.min(100, Math.max(0, Math.round(percentage))), "%", 70, 35);
};
