import { getOzbargainDeals, type OzbargainDeal } from "@/api/ozbargain";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useSavedDeals } from "@/hooks/use-saved-deals";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Star, Trash2 } from "lucide-react";
import type { FC } from "react";
import { DealCard } from "./ozbargain-card";
import { SkeletonGrid } from "./skeleton-grid";

interface OzbProps {
  deal: string;
  hideOld?: boolean;
}

const isNewDeal = (deal: OzbargainDeal) => {
  const then = new Date(deal.publishedAt).getTime();
  const diffH = (Date.now() - then) / (1000 * 60 * 60);
  return diffH < 24;
};

export const Ozb: FC<OzbProps> = ({ deal, hideOld = true }) => {
  const { removeDeal } = useSavedDeals();
  const query = useQuery({
    queryKey: ["bargains", deal, hideOld],
    queryFn: () => getOzbargainDeals(deal, hideOld),
    retry: false,
    staleTime: 1000 * 60 * 60,
  });

  if (query.isLoading) {
    return (
      <AccordionItem value={"deals" + deal}>
        <AccordionTrigger className="px-4 h-12 text-sm font-medium border-b hover:no-underline focus-visible:ring-2 focus-visible:ring-ring rounded-none">
          <span className="inline-flex items-center gap-2">
            <span className="text-muted-foreground">Loading</span>
            <span className="font-semibold text-primary">{deal}</span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="bg-muted/30">
          <SkeletonGrid count={3} />
        </AccordionContent>
      </AccordionItem>
    );
  }

  const newDeals = query.data?.some(isNewDeal);

  if (!query.data?.length && hideOld) {
    return null;
  }

  const sorted = query.data
    ? query.data.toSorted(
        (a: OzbargainDeal, b: OzbargainDeal) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
    : [];

  const handleRemove = () => {
    if (confirm(`Remove "${deal}" from saved deals?`)) {
      removeDeal(deal);
    }
  };

  return (
    <AccordionItem value={"deals" + deal}>
      <AccordionTrigger className="px-4 h-12 text-sm font-medium border-b hover:no-underline focus-visible:ring-2 focus-visible:ring-ring rounded-none">
        <a
          className="inline-flex items-center gap-2"
          href={`https://www.ozbargain.com.au/search/node/${encodeURIComponent(deal)}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Open OzBargain search for ${deal}`}
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="text-muted-foreground tabular-nums">{query.data?.length ?? 0}</span>
            <span className="font-semibold text-primary">{deal}</span>
            <span className="text-muted-foreground">deals</span>
          </span>
          {newDeals && <Star size={14} className="text-yellow-400" aria-label="New deals available" />}
          <ExternalLink size={12} className="text-muted-foreground/60" />
        </a>
      </AccordionTrigger>
      <AccordionContent className="bg-muted/30">
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((dealItem: OzbargainDeal) => (
              <DealCard key={dealItem.url} deal={dealItem} />
            ))}
          </div>
          <Button
            onClick={handleRemove}
            variant="destructive"
            size="sm"
            className="mt-4 h-10"
            aria-label={`Remove ${deal}`}
          >
            <Trash2 size={14} className="mr-1.5" />
            Remove
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
