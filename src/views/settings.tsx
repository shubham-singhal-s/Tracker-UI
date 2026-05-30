import { Button } from "@/components/ui/button";
import { useSavedDeals } from "@/hooks/use-saved-deals";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { FC } from "react";
import { toast } from "sonner";

const exportSettings = () => {
  const savedDeals = localStorage.getItem("savedDeals") || "[]";
  navigator.clipboard.writeText(savedDeals);
  toast.success("Saved deals copied to clipboard");
};

const tryImportDeals = (raw: string): string[] | null => {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as string[];
  } catch {
    return null;
  }
};

export const Settings: FC = () => {
  const { deals, importDeals } = useSavedDeals();

  const importSettings = () => {
    const settings = prompt("Paste your saved deals here");
    if (!settings) return;
    const parsed = tryImportDeals(settings);
    if (!parsed) {
      toast.error("Invalid saved deals format");
      return;
    }
    importDeals(parsed);
    toast.success("Saved deals imported successfully");
  };

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      <Button onClick={exportSettings} variant="outline" className="h-11 gap-1.5" aria-label="Export saved deals">
        Export <ArrowUp size={16} />
      </Button>
      <Button onClick={importSettings} variant="outline" className="h-11 gap-1.5" aria-label="Import saved deals">
        Import <ArrowDown size={16} />
      </Button>
      {deals.length > 0 && (
        <span className="text-xs text-muted-foreground">
          {deals.length} deal{deals.length === 1 ? "" : "s"} saved
        </span>
      )}
    </div>
  );
};
