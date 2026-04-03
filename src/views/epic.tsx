import { Card, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import { getFreeGames } from "../api/epic";

export const EpicGames: FC = () => {
  const query = useQuery({ queryKey: ["games"], queryFn: getFreeGames });

  return (
    <div>
      {query.data?.map((game: any, index: number) => (
        <div className="w-xs" key={index}>
          <Card
            className="h-full min-h-[400px] relative flex items-center justify-center overflow-hidden cursor-pointer"
            style={{
              backgroundImage: `url(${game.thumbnail?.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={() => window.open(game.url, "_blank")}
          >
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-between py-4">
              <div className="bg-gray-600/10 backdrop-blur-xs">
                <CardTitle className="text-white text-lg font-bold">{game.title}</CardTitle>
                <CardDescription className="text-gray-200 drop-shadow">{game.seller}</CardDescription>
              </div>
              <CardFooter className="mt-auto bg-gray-600/10 backdrop-blur-xs">
                <p className="text-white drop-shadow text-sm ">{game.description}</p>
              </CardFooter>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};
