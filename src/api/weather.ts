import { calculateMoodScore } from "@/utils/mood-calculator";
import { useQuery } from "@tanstack/react-query";
import { Angry, Frown, Laugh, Meh } from "lucide-react";
import { DATA } from "./mock-data";

const getMoodScore = (w) => {
  const { score, factors } = calculateMoodScore(w);

  let color = "text-green-400";
  let Icon = Laugh;

  if (score < 40) {
    color = "text-red-400";
    Icon = Angry;
  } else if (score < 60) {
    color = "text-yellow-400";
    Icon = Frown;
  } else if (score < 80) {
    color = "text-blue-300";
    Icon = Meh;
  }

  return {
    score,
    factors,
    color,
    Icon,
  };
};

const getWeather = async () => {
  let response = DATA;
  if (process.env.NODE_ENV === "development") {
    console.warn("Using mock weather data");
  } else {
    const data = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=-33.86745567881718,-33.721265607107675,-33.716219989192204,28.652969062577398&longitude=151.2098488679771,151.01069559121953,150.9573475968067,77.35977729866637&daily=uv_index_max,sunset,weather_code,shortwave_radiation_sum,precipitation_sum&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,cloud_cover,pressure_msl,is_day,precipitation&timezone=Australia%2FSydney&forecast_days=1",
      {
        body: null,
        method: "GET",
      },
    );
    response = await data.json();
  }

  return response?.map((item: any) => ({
    ...item,
    ...getMoodScore(item),
  }));
};

export const useWeatherQuery = () =>
  useQuery({
    queryKey: ["myDay"],
    queryFn: () => getWeather(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 1 hour
  });
