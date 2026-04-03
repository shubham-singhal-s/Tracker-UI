import { useWeatherQuery } from "@/api/weather";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CITIES } from "@/utils/mood-calculator";
import { calculateSunIntensity, getCurrentUnit, getDailyUnit, getTime, getWeatherImage } from "@/utils/weather-utils";
import { useSearch } from "@tanstack/react-router";
import {
  ArrowBigRight,
  ChevronsUpDown,
  CloudCheck,
  CloudRain,
  Droplet,
  Frown,
  Gauge,
  Loader2,
  Radiation,
  Sunset,
  Thermometer,
  Wind,
} from "lucide-react";
import { useEffect, type FC } from "react";

export const MyDay: FC = () => {
  const { data, isLoading, isError } = useWeatherQuery();
  const { notify } = useSearch({ strict: false });

  useEffect(() => {
    if (notify && data?.length) {
      navigator.serviceWorker.ready.then((r) => {
        r.showNotification("Today's Weather Mood", {
          body: CITIES.map((city, i) => {
            if (i > 1) return null; // Only notify for the first two cities
            const current = data[i];

            return `${city}: ${current?.scoreValue?.toFixed(0)}% mood, ${current?.daily?.precipitation_sum?.[0]}mm rain, ${current?.current?.relative_humidity_2m}% humidity`;
          })
            .filter(Boolean)
            .join("\n"),
          icon: "/Sunny.webp",
        });
      });

      const url = new URL(window.location.href);
      url.searchParams.delete("notify");
      window.history.replaceState(window.history.state, "", url.href);
    }
  }, [data, notify]);

  const renderMoodScore = (score) => {
    if (!score) return null;
    const { score: scoreValue, color, Icon, factors } = score;

    return (
      <div>
        <div className="flex w-full items-center justify-center gap-2 text-shadow-lg">
          <Icon className={color} />
          <span className={cn("text-white", "font-bold", color)}>{scoreValue?.toFixed(0)}%</span>
        </div>
        {factors?.length > 0 && (
          <div>
            <Collapsible>
              <CollapsibleTrigger className="w-full flex flex-row justify-center items-center gap-1">
                Mood killers <ChevronsUpDown size={16} />
              </CollapsibleTrigger>
              <CollapsibleContent className="relative">
                <div className="p-4 px-8 z-20 absolute rounded w-full bg-gray-700/80 text-white">
                  {factors.map((f, i) => (
                    <div key={i} className="flex flex-row justify-between text-sm">
                      <span>{f.label}</span>
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

  if (isLoading) {
    return <Loader2 className="text-white m-auto animate-spin" size={48} />;
  }

  if (isError) {
    return (
      <div>
        <Frown className="m-auto text-red-400" size={32} />
        Something went wrong fetching the weather data.
      </div>
    );
  }

  return (
    <div>
      {data ? (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center m-auto">
          {data.map((w, i) => {
            const weatherCode = w?.daily?.weather_code?.[0];
            const bgImage = getWeatherImage(weatherCode);
            return (
              <Card
                key={"weather-" + w?.latitude + w?.longitude + w?.elevation}
                className="relative overflow-hidden text-shadow-lg"
                style={{ minHeight: 320 }}
              >
                {/* Blurred and darkened background */}
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(3px) brightness(0.5)",
                  }}
                  aria-hidden="true"
                />
                {/* Card content */}
                <div className="relative z-20 flex flex-col gap-2 h-full">
                  <CardTitle className="text-white text-lg font-bold">{CITIES[i]}</CardTitle>
                  <CardDescription>
                    {renderMoodScore(w)}
                    <div className="grid grid-cols-2 gap-2 px-4">
                      <span className="align-middle mt-2">
                        <Thermometer className="m-auto text-red-400" />
                        <span className="line-through">{getCurrentUnit(w, "temperature_2m", 28, 15)}</span>
                        <ArrowBigRight className="inline mx-1" size={16} />
                        {getCurrentUnit(w, "apparent_temperature", 28, 15)}
                      </span>
                      <span className="align-middle mt-2">
                        <CloudRain className="m-auto text-blue-400" />
                        {getCurrentUnit(w, "precipitation", 30, 0, true)}
                        {" / "}
                        {getDailyUnit(w, "precipitation_sum", 50, 0, true)}
                      </span>
                      <span className="align-middle mt-2">
                        <Radiation className="m-auto text-yellow-400" />
                        {calculateSunIntensity(w)}
                      </span>
                      <span>
                        <CloudCheck className="m-auto text-gray-400" />
                        {getCurrentUnit(w, "cloud_cover", undefined, undefined, true)}
                      </span>
                      <span>
                        <Wind className="m-auto text-blue-100" />
                        {getCurrentUnit(w, "wind_speed_10m", 25)}
                      </span>
                      <span>
                        <Droplet className="m-auto text-blue-300" />
                        {getCurrentUnit(w, "relative_humidity_2m", 70, 30)}
                      </span>
                      <span>
                        <Gauge className="m-auto text-green-600" />
                        {getCurrentUnit(w, "pressure_msl", 1022, 1007, true)}
                      </span>
                      <span className="text-white font-bold">
                        <Sunset className="m-auto text-orange-400" />
                        {getTime(w?.daily?.sunset?.[0])}
                      </span>
                    </div>
                  </CardDescription>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div>No data</div>
      )}
    </div>
  );
};
