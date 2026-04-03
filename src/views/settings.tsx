import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { FC } from "react";
import { toast } from "sonner";

export const Settings: FC = () => {
  const exportSettings = () => {
    const savedDeals = localStorage.getItem("savedDeals") || "";
    navigator.clipboard.writeText(savedDeals);
    toast.success("Saved deals copied to clipboard");
  };

  const importSettings = () => {
    const settings = prompt("Paste your saved deals here");
    if (settings) {
      try {
        JSON.parse(settings);
        localStorage.setItem("savedDeals", settings);
        window.dispatchEvent(new Event("savedDealsUpdated"));
        toast.success("Saved deals imported successfully");
      } catch (e) {
        toast.error("Invalid saved deals format");
      }
    }
  };

  return (
    <div className="flex flex-row gap-2 items-center justify-center">
      <Button onClick={exportSettings}>
        Export <ArrowUp />
      </Button>
      <Button onClick={importSettings}>
        Import <ArrowDown />
      </Button>
    </div>
  );
};
