import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brain, Lock, Wrench } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const ToolsAccordion = () => {
  return (
    <AccordionItem value="item-tools">
      <AccordionTrigger className="px-4 h-14 text-base font-semibold border-b hover:no-underline focus-visible:ring-2 focus-visible:ring-ring rounded-none">
        <span className="inline-flex items-center gap-2">
          <Wrench className="text-muted-foreground" size={20} />
          Tools
        </span>
      </AccordionTrigger>
      <AccordionContent className="bg-background px-4 py-5">
        <div className="flex flex-wrap gap-3">
          <Link
            to="/stress-log"
            className="inline-flex items-center gap-2 rounded-md bg-muted px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
          >
            <Brain size={16} />
            Stress Log
          </Link>
          <Link
            to="/encrypt"
            className="inline-flex items-center gap-2 rounded-md bg-muted px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
          >
            <Lock size={16} />
            Encrypt
          </Link>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
