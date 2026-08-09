import { getOzbargainDeals } from "@/api/ozbargain";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSavedDeals } from "@/hooks/use-saved-deals";
import { useQueries } from "@tanstack/react-query";
import { Loader2, Percent } from "lucide-react";
import { useMemo, type FC } from "react";
import { Ozb } from "../deal";

interface DealsAccordionProps {
  hideOld?: boolean;
}

export const DealsAccordion: FC<DealsAccordionProps> = ({ hideOld = true }) => {
  const { deals } = useSavedDeals();

  const dealQueries = useQueries({
    queries: deals.map((term) => ({
      queryKey: ["bargains", term],
      queryFn: () => getOzbargainDeals(term),
      enabled: deals.length > 0,
      retry: false,
      staleTime: 1000 * 60 * 30,
    })),
  });

  const isAnyLoading = dealQueries.some((q) => q.isLoading);

  const visibleCount = useMemo(() => {
    return dealQueries.reduce((sum, query) => {
      const termDeals = query.data?.deals ?? [];
      const filtered = hideOld ? termDeals.filter((d) => d.date <= 1) : termDeals;
      return sum + (filtered.length > 0 ? 1 : 0);
    }, 0);
  }, [dealQueries, hideOld]);

  const countBadge = deals.length > 0 && (
    isAnyLoading ? (
      <Loader2
        size={14}
        className="animate-spin text-muted-foreground"
        aria-label="Loading deal count"
      />
    ) : (
      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        {visibleCount}
      </span>
    )
  );

  return (
    <AccordionItem value="deals">
      <AccordionTrigger className="border-b px-4 h-14 text-base font-semibold hover:no-underline focus-visible:ring-2 focus-visible:ring-ring rounded-none">
        <span className="inline-flex items-center gap-2">
          <Percent className="text-emerald-400" size={18} />
          My Deals
          {countBadge}
        </span>
      </AccordionTrigger>
      <AccordionContent className="bg-background">
        {deals.length ? (
          <Accordion type="single" collapsible className="px-2 pt-2">
            {deals.map((term, index) => (
              <Ozb
                key={term}
                term={term}
                deals={dealQueries[index]?.data?.deals ?? []}
                error={dealQueries[index]?.data?.error}
                isLoading={dealQueries[index]?.isLoading ?? true}
                hideOld={hideOld}
              />
            ))}
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
