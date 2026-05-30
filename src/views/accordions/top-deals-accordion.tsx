import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Flame } from "lucide-react";
import { Suspense, type FC } from "react";
import { TopDeals } from "../top-deals";

export const TopDealsAccordion: FC = () => {
  return (
    <AccordionItem value="top-deals">
      <AccordionTrigger className="px-4 h-14 text-base font-semibold border-b hover:no-underline focus-visible:ring-2 focus-visible:ring-ring rounded-none">
        <span className="inline-flex items-center gap-2">
          <Flame className="text-orange-400" size={18} />
          Top Deals
        </span>
      </AccordionTrigger>
      <AccordionContent className="bg-background">
        <Suspense fallback={null}>
          <TopDeals />
        </Suspense>
      </AccordionContent>
    </AccordionItem>
  );
};
