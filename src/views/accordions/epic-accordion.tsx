import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Gamepad2 } from "lucide-react";
import { Suspense } from "react";
import { EpicGames } from "../epic";

export const EpicAccordion = () => {
  return (
    <AccordionItem value="games">
      <AccordionTrigger className="px-4 h-14 text-base font-semibold border-b hover:no-underline focus-visible:ring-2 focus-visible:ring-ring rounded-none">
        <span className="inline-flex items-center gap-2">
          <Gamepad2 className="text-violet-400" size={20} />
          This Week's Free Games
        </span>
      </AccordionTrigger>
      <AccordionContent className="bg-background">
        <Suspense fallback={null}>
          <EpicGames />
        </Suspense>
      </AccordionContent>
    </AccordionItem>
  );
};
