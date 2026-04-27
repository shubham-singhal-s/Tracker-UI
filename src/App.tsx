import { useSearch } from "@tanstack/react-router";
import { EyeClosed } from "lucide-react";
import { useState } from "react";
import "./App.css";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";
import { Toggle } from "./components/ui/toggle";
import { DayAccordion } from "./views/accordions/day-accordion";
import { DealsAccordion } from "./views/accordions/deals-accordion";
import { EpicAccordion } from "./views/accordions/epic-accordion";
import { Saver } from "./views/saver";
import { Settings } from "./views/settings";

const App = () => {
  const [hideOld, setHideOld] = useState(true);
  const { notify } = useSearch({ strict: false });

  return (
    <div className="w-full h-full">
      <Accordion type="single" className="bg-zinc-900" collapsible value={notify ? "item-day" : undefined}>
        <DayAccordion />
        <EpicAccordion />
        <DealsAccordion hideOld={hideOld} />
      </Accordion>
      <Accordion type="single" className="bg-black" collapsible>
        <AccordionItem value="menu">
          <AccordionTrigger className="flex-initial m-auto cursor-pointer" style={{ fontWeight: 600 }}>
            Options
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <Toggle
              aria-label="Toggle old"
              size="sm"
              pressed={hideOld}
              onPressedChange={() => setHideOld(!hideOld)}
              className="mb-4 data-[state=on]:bg-transparent data-[state=on]:text-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"
            >
              <EyeClosed />
              Hide Old
            </Toggle>
            <Settings />
            <Saver />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default App;
