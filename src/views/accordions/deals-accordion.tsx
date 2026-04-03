import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Percent } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import { Ozb } from "../deal";

interface DealsAccordionProps {
  hideOld?: boolean;
}

export const DealsAccordion: FC<DealsAccordionProps> = ({ hideOld = true }) => {
  const [savedDeals, setSavedDeals] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem("savedDeals") || "[]");
  });

  useEffect(() => {
    const updateDeals = () => {
      setSavedDeals(JSON.parse(localStorage.getItem("savedDeals") || "[]"));
    };
    window.addEventListener("savedDealsUpdated", updateDeals);
    return () => window.removeEventListener("savedDealsUpdated", updateDeals);
  }, []);

  return (
    <AccordionItem value="deals">
      <AccordionTrigger style={{ fontWeight: 600 }} className="border px-4 rounded-none">
        <span>
          <Percent className="inline mr-2 text-white" size={16} />
          Deals
        </span>
      </AccordionTrigger>
      <AccordionContent className="bg-gray-50 dark:bg-neutral-900">
        <Accordion type="single" collapsible>
          {savedDeals.length ? (
            savedDeals.map((deal) => <Ozb key={deal} deal={deal} hideOld={hideOld} />)
          ) : (
            <span className="text-gray-500">No saved deals. Add some from OzBargain!</span>
          )}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
};
