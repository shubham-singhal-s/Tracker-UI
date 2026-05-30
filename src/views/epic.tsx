import { Card, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import { getFreeGames } from "../api/epic";

export const EpicGames: FC = () => {
  const query = useQuery({ queryKey: ["games"], queryFn: getFreeGames });

  if (query.isLoading) {
    return (
      <div className="flex flex-row gap-4 justify-center items-stretch flex-wrap p-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="w-72 sm:w-80">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (!query.data?.length) {
    return (
      <div className="px-4 py-10 text-center text-sm text-muted-foreground">No free games available this week.</div>
    );
  }

  return (
    <div className="flex flex-row gap-4 justify-center items-stretch flex-wrap p-4">
      {query.data.map((game: any) => (
        <a
          key={game.url || game.title}
          href={game.url}
          target="_blank"
          rel="noreferrer"
          className="w-72 sm:w-80 group rounded-xl overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={`${game.title} by ${game.seller}`}
        >
          <Card
            className="h-full min-h-96 relative flex items-center justify-center overflow-hidden"
            style={{
              backgroundImage: `url(${game.thumbnail?.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20 transition-opacity duration-300 group-hover:from-black/90" />
            <div className="relative z-10 flex flex-col justify-between h-full w-full py-4">
              <div className="w-full p-2 bg-black/30 text-center">
                <CardTitle className="text-white text-lg font-bold drop-shadow-sm">{game.title}</CardTitle>
                <CardDescription className="text-gray-200 text-sm mt-1 drop-shadow-sm">{game.seller}</CardDescription>
              </div>
              <CardFooter className="mt-auto w-full p-2 bg-black/30 text-center">
                <p className="text-white/90 w-full text-sm text-center line-clamp-4">{game.description}</p>
              </CardFooter>
            </div>
          </Card>
        </a>
      ))}
    </div>
  );
};
