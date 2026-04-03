import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sun } from "lucide-react";
import { MyDay } from "../day";

export const DayAccordion = () => {
  return (
    <div>
      <AccordionItem value="item-day">
        <AccordionTrigger style={{ fontWeight: 600 }} className="border px-4 rounded-none">
          <span>
            <Sun className="inline mr-2 text-white" size={20} />
            My Day
          </span>
        </AccordionTrigger>
        <AccordionContent className="p-4 bg-gray-50 dark:bg-neutral-900">
          <MyDay />
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};
