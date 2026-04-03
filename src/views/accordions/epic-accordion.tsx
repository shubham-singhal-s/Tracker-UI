import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Gamepad2 } from "lucide-react";
import { EpicGames } from "../epic";

export const EpicAccordion = () => {
  return (
    <div>
      <AccordionItem value="games">
        <AccordionTrigger style={{ fontWeight: 600 }} className="border px-4 rounded-none">
          <span>
            <Gamepad2 className="inline mr-2" size={20} />
            This week's free games
          </span>
        </AccordionTrigger>
        <AccordionContent className="pt-4 bg-gray-50 dark:bg-neutral-900">
          <div className="flex flex-row gap-4 justify-center items-stretch flex-wrap">
            <EpicGames />
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};
