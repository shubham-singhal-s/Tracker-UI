import { getOzbargainDealsBulk } from "@/api/ozbargain";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSavedDeals } from "@/hooks/use-saved-deals";
import { useQuery } from "@tanstack/react-query";
import { Percent } from "lucide-react";
import { type FC } from "react";
import { Ozb } from "../deal";
import { SkeletonGrid } from "../skeleton-grid";

interface DealsAccordionProps {
  hideOld?: boolean;
}

export const DealsAccordion: FC<DealsAccordionProps> = ({ hideOld = true }) => {
  const { deals } = useSavedDeals();

  const query = useQuery({
    queryKey: ["bargains", "bulk", deals.slice().sort().join(",")],
    queryFn: () => getOzbargainDealsBulk(deals),
    enabled: deals.length > 0,
    retry: false,
    staleTime: 1000 * 60 * 60,
  });

  const visibleCount = query.data
    ? deals.reduce((sum, term) => {
        const termDeals = query.data[term] ?? [];
        const filtered = hideOld ? termDeals.filter((d) => d.date <= 1) : termDeals;
        return sum + (filtered.length > 0 ? 1 : 0);
      }, 0)
    : deals.length;

  return (
    <AccordionItem value="deals">
      <AccordionTrigger className="border-b px-4 h-14 text-base font-semibold hover:no-underline focus-visible:ring-2 focus-visible:ring-ring rounded-none">
        <span className="inline-flex items-center gap-2">
          <Percent className="text-emerald-400" size={18} />
          My Deals
          {visibleCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {visibleCount}
            </span>
          )}
        </span>
      </AccordionTrigger>
      <AccordionContent className="bg-background">
        {deals.length ? (
          <Accordion type="single" collapsible className="px-2 pt-2">
            {query.isLoading ? (
              <SkeletonGrid count={3} />
            ) : (
              deals.map((deal) => <Ozb key={deal} term={deal} deals={query.data?.[deal] ?? []} hideOld={hideOld} />)
            )}
          </Accordion>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No saved deals yet. Add a search term below to track deals from OzBargain.
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
