import { useWeatherQuery } from "@/api/weather";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CITIES } from "@/utils/mood-calculator";
import { calculateSunIntensity, getCurrentUnit, getDailyUnit, getTime, getWeatherImage } from "@/utils/weather-utils";
import {
  ArrowBigRight,
  ChevronsUpDown,
  CloudCheck,
  CloudRain,
  Droplet,
  Frown,
  Gauge,
  Radiation,
  Sunset,
  Thermometer,
  Wind,
} from "lucide-react";
import type { FC } from "react";
import { SkeletonWeather } from "./skeleton-weather";

interface MoodFactor {
  label: string;
  impact: number;
}

interface MoodScoreProps {
  score: {
    score: number;
    color: string;
    Icon: React.ElementType;
    factors?: MoodFactor[];
  } | null;
}

const MoodScore: FC<MoodScoreProps> = ({ score }) => {
  if (!score) return null;
  const { score: scoreValue, color, Icon, factors } = score;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <Icon className={color} size={20} />
        <span className={cn("font-bold text-white text-lg", color)}>{scoreValue?.toFixed(0)}%</span>
      </div>
      {factors && factors.length > 0 && (
        <div className="relative">
          <Collapsible>
            <CollapsibleTrigger className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors">
              Mood killers <ChevronsUpDown size={14} />
            </CollapsibleTrigger>
            <CollapsibleContent className="absolute left-1/2 -translate-x-1/2 top-full z-20 mt-1 w-56">
              <div className="rounded-lg bg-black/80 backdrop-blur-md border border-white/10 p-3 space-y-1 shadow-xl">
                {factors.map((f) => (
                  <div key={f.label} className="flex justify-between text-xs">
                    <span className="text-white/80">{f.label}</span>
                    <span className={cn("font-bold", f.impact < 0 ? "text-red-400" : "text-green-400")}>
                      {f.impact > 0 ? "+" : ""}
                      {f.impact}%
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
};

export const MyDay: FC = () => {
  const { data, isLoading, isError } = useWeatherQuery();

  if (isLoading) {
    return (
      <div className="p-4">
        <SkeletonWeather count={3} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <Frown className="mx-auto text-red-400 mb-2" size={32} />
        <p className="text-sm text-muted-foreground">Something went wrong fetching the weather data.</p>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-center text-sm text-muted-foreground">No weather data available.</div>;
  }

  return (
    <div className="p-3 sm:p-4">
      <div className="grid grid-cols-1 gap-3 justify-items-center sm:justify-items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((w, i) => {
          const weatherCode = w?.daily?.weather_code?.[0];
          const bgImage = getWeatherImage(weatherCode);
          return (
            <Card
              key={`weather-${w?.latitude}-${w?.longitude}-${w?.elevation}`}
              className="relative overflow-hidden min-h-80 text-white py-0 w-full"
            >
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: `url(${bgImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(4px) brightness(0.45)",
                }}
                aria-hidden="true"
              />
              <div className="relative z-10 flex flex-col gap-3 h-full p-4">
                <CardTitle className="text-white text-lg font-bold drop-shadow text-center">{CITIES[i]}</CardTitle>
                <CardDescription className="flex flex-col gap-3">
                  <MoodScore score={w} />
                  <div className="grid grid-cols-2 gap-2 px-1">
                    <span className="flex flex-col items-center gap-1 text-center">
                      <Thermometer className="text-red-400" size={18} />
                      <span className="text-sm">
                        <span className="line-through opacity-60">{getCurrentUnit(w, "temperature_2m", 28, 15)}</span>
                        <ArrowBigRight className="inline mx-0.5" size={14} />
                        {getCurrentUnit(w, "apparent_temperature", 28, 15)}
                      </span>
                    </span>
                    <span className="flex flex-col items-center gap-1 text-center">
                      <CloudRain className="text-blue-400" size={18} />
                      <span className="text-sm">
                        {getCurrentUnit(w, "precipitation", 30, 0, true)} /{" "}
                        {getDailyUnit(w, "precipitation_sum", 50, 0, true)}
                      </span>
                    </span>
                    <span className="flex flex-col items-center gap-1 text-center">
                      <Radiation className="text-yellow-400" size={18} />
                      <span className="text-sm">{calculateSunIntensity(w)}</span>
                    </span>
                    <span className="flex flex-col items-center gap-1 text-center">
                      <CloudCheck className="text-gray-300" size={18} />
                      <span className="text-sm">{getCurrentUnit(w, "cloud_cover", undefined, undefined, true)}</span>
                    </span>
                    <span className="flex flex-col items-center gap-1 text-center">
                      <Wind className="text-blue-200" size={18} />
                      <span className="text-sm">{getCurrentUnit(w, "wind_speed_10m", 25)}</span>
                    </span>
                    <span className="flex flex-col items-center gap-1 text-center">
                      <Droplet className="text-blue-300" size={18} />
                      <span className="text-sm">{getCurrentUnit(w, "relative_humidity_2m", 70, 30)}</span>
                    </span>
                    <span className="flex flex-col items-center gap-1 text-center">
                      <Gauge className="text-green-400" size={18} />
                      <span className="text-sm">{getCurrentUnit(w, "pressure_msl", 1022, 1007, true)}</span>
                    </span>
                    <span className="flex flex-col items-center gap-1 text-center">
                      <Sunset className="text-orange-400" size={18} />
                      <span className="text-sm font-semibold">{getTime(w?.daily?.sunset?.[0])}</span>
                    </span>
                  </div>
                </CardDescription>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
