import { Eye, EyeClosed, Settings2, Zap } from "lucide-react";
import { useState, useTransition } from "react";
import "./App.css";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";
import { Toggle } from "./components/ui/toggle";
import { DayAccordion } from "./views/accordions/day-accordion";
import { DealsAccordion } from "./views/accordions/deals-accordion";
import { EpicAccordion } from "./views/accordions/epic-accordion";
import { TopDealsAccordion } from "./views/accordions/top-deals-accordion";
import { Saver } from "./views/saver";
import { Settings } from "./views/settings";

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  weekday: "long",
  day: "numeric",
  month: "short",
});

const App = () => {
  const [hideOld, setHideOld] = useState(true);
  const [isPending, startTransition] = useTransition();

  const toggleHideOld = () => {
    startTransition(() => {
      setHideOld((prev) => !prev);
    });
  };

  const today = dateFormatter.format(new Date());

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
              <Zap size={18} fill="currentColor" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight">Tracker</span>
              <span className="text-[10px] text-muted-foreground font-medium">Deals & Weather</span>
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">{today}</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 pb-24 sm:px-4 sm:py-6 sm:pb-28">
        <Accordion type="single" className="rounded-xl border bg-card overflow-hidden shadow-sm" collapsible>
          <DayAccordion />
          <EpicAccordion />
          <TopDealsAccordion />
          <DealsAccordion hideOld={hideOld} />
        </Accordion>
      </main>

      <section className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/90 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] backdrop-blur-md">
        <Accordion type="single" collapsible className="mx-auto max-w-7xl">
          <AccordionItem value="menu" className="border-0">
            <AccordionTrigger className="px-5 h-12 text-sm font-semibold hover:no-underline focus-visible:ring-2 focus-visible:ring-ring rounded-none [&>svg]:rotate-180 [&[data-state=open]>svg]:rotate-0">
              <span className="inline-flex items-center gap-2">
                <Settings2 size={18} />
                Options
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap w-full items-center justify-center gap-3">
                  <Toggle
                    aria-label="Toggle hiding of old deals"
                    size="default"
                    pressed={hideOld}
                    onPressedChange={toggleHideOld}
                    disabled={isPending}
                    className="h-11 w-30 data-[state=on]:bg-transparent"
                  >
                    {hideOld ? (
                      <>
                        <EyeClosed size={16} /> Latest
                      </>
                    ) : (
                      <>
                        <Eye size={16} /> All
                      </>
                    )}
                  </Toggle>
                </div>
                <Settings />
                <Saver />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
};

export default App;
