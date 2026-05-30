import { getOzbargainFrontpage, type OzbargainDeal } from "@/api/ozbargain";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import { DealCard } from "./ozbargain-card";
import { SkeletonGrid } from "./skeleton-grid";

export const TopDeals: FC = () => {
  const query = useQuery({
    queryKey: ["ozbargain-frontpage"],
    queryFn: getOzbargainFrontpage,
    retry: false,
    staleTime: 1000 * 60 * 60,
  });

  if (query.isLoading) {
    return <SkeletonGrid count={6} />;
  }

  if (query.isError || !query.data?.length) {
    return (
      <div className="px-4 py-10 text-center text-sm text-muted-foreground">
        No frontpage deals available right now.
      </div>
    );
  }

  const sorted = query.data.toSorted(
    (a: OzbargainDeal, b: OzbargainDeal) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <div className="grid grid-cols-1 gap-3 p-3 justify-items-center sm:justify-items-start sm:gap-4 sm:p-4 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((deal: OzbargainDeal) => (
        <DealCard key={deal.url} deal={deal} />
      ))}
    </div>
  );
};
