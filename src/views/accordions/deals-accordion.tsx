import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSavedDeals } from "@/hooks/use-saved-deals";
import { Percent } from "lucide-react";
import { Suspense, type FC } from "react";
import { Ozb } from "../deal";
import { SkeletonGrid } from "../skeleton-grid";

interface DealsAccordionProps {
  hideOld?: boolean;
}

export const DealsAccordion: FC<DealsAccordionProps> = ({ hideOld = true }) => {
  const { deals } = useSavedDeals();

  return (
    <AccordionItem value="deals">
      <AccordionTrigger className="border-b px-4 h-14 text-base font-semibold hover:no-underline focus-visible:ring-2 focus-visible:ring-ring rounded-none">
        <span className="inline-flex items-center gap-2">
          <Percent className="text-emerald-400" size={18} />
          My Deals
          {deals.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {deals.length}
            </span>
          )}
        </span>
      </AccordionTrigger>
      <AccordionContent className="bg-background">
        {deals.length ? (
          <Accordion type="single" collapsible className="px-2 pt-2">
            <Suspense fallback={<SkeletonGrid count={3} />}>
              {deals.map((deal) => (
                <Ozb key={deal} deal={deal} hideOld={hideOld} />
              ))}
            </Suspense>
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
