import { type OzbargainDeal } from "@/api/ozbargain";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSavedDeals } from "@/hooks/use-saved-deals";
import { AlertCircle, ExternalLink, Loader2, Star, Trash2 } from "lucide-react";
import type { FC } from "react";
import { DealCard } from "./ozbargain-card";

interface OzbProps {
  term: string;
  deals: OzbargainDeal[];
  error?: string;
  isLoading?: boolean;
  hideOld?: boolean;
}

const isNewDeal = (deal: OzbargainDeal) => {
  const then = new Date(deal.publishedAt).getTime();
  const diffH = (Date.now() - then) / (1000 * 60 * 60);
  return diffH < 24;
};

export const Ozb: FC<OzbProps> = ({
  term,
  deals,
  error,
  isLoading = false,
  hideOld = true,
}) => {
  const { removeDeal } = useSavedDeals();

  const filtered = hideOld ? deals.filter((deal) => deal.date <= 1) : deals;

  if (!isLoading && !error && !filtered.length && hideOld) {
    return null;
  }

  const sorted = filtered.toSorted((a: OzbargainDeal, b: OzbargainDeal) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const newDeals = sorted.some(isNewDeal);

  const handleRemove = () => {
    if (confirm(`Remove "${term}" from saved deals?`)) {
      removeDeal(term);
    }
  };

  return (
    <AccordionItem value={"deals" + term}>
      <AccordionTrigger className="px-4 h-12 text-sm font-medium border-b hover:no-underline focus-visible:ring-2 focus-visible:ring-ring rounded-none">
        <a
          className="inline-flex items-center gap-2"
          href={`https://www.ozbargain.com.au/search/node/${encodeURIComponent(term)}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Open OzBargain search for ${term}`}
        >
          <span className="inline-flex items-center gap-1.5">
            {isLoading ? (
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            ) : error ? (
              <AlertCircle size={14} className="text-destructive" aria-label="Error loading deals" />
            ) : (
              <span className="text-muted-foreground tabular-nums">{sorted.length}</span>
            )}
            <span className="font-semibold text-primary">{term}</span>
            <span className="text-muted-foreground">deals</span>
          </span>
          {!isLoading && !error && newDeals && (
            <Star size={14} className="text-yellow-400" aria-label="New deals available" />
          )}
          <ExternalLink size={12} className="text-muted-foreground/60" />
        </a>
      </AccordionTrigger>
      <AccordionContent className="bg-muted/30">
        {isLoading ? (
          <div className="p-3 sm:p-4">
            <Skeleton className="aspect-video w-full max-w-75 rounded-xl" />
          </div>
        ) : error ? (
          <div className="p-3 sm:p-4">
            <Card className="w-75 border-destructive/50 bg-destructive/5">
              <CardHeader className="gap-2 px-4 py-4">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-destructive">
                  <AlertCircle size={16} />
                  Couldn't load deals
                </CardTitle>
                <CardDescription className="text-xs">{error}</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Button asChild variant="outline" size="sm">
                  <a
                    href={`https://www.ozbargain.com.au/search/node/${encodeURIComponent(term)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5"
                  >
                    Search OzBargain
                    <ExternalLink size={12} />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <div className="w-full text-center">
              <Button
                onClick={handleRemove}
                variant="destructive"
                size="sm"
                className="mt-4 h-10"
                aria-label={`Remove ${term}`}
              >
                <Trash2 size={14} className="mr-1.5" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3 justify-items-center sm:justify-items-start sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((dealItem: OzbargainDeal) => (
                <DealCard key={dealItem.url} deal={dealItem} />
              ))}
            </div>
            <div className="w-full text-center">
              <Button
                onClick={handleRemove}
                variant="destructive"
                size="sm"
                className="mt-4 h-10"
                aria-label={`Remove ${term}`}
              >
                <Trash2 size={14} className="mr-1.5" />
                Remove
              </Button>
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
