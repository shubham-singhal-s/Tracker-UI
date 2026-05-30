import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSavedDeals } from "@/hooks/use-saved-deals";
import { useState, useTransition, type FC } from "react";

export const Saver: FC = () => {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const { addDeal } = useSavedDeals();

  const save = () => {
    if (!value.trim()) return;
    startTransition(() => {
      addDeal(value.trim());
      setValue("");
    });
  };

  return (
    <div className="flex flex-row gap-2 justify-center my-4">
      <Input
        className="max-w-md rounded-md h-11"
        placeholder="Add a deal search term…"
        value={value}
        onKeyDown={(e) => e.key === "Enter" && save()}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Deal search term"
      />
      <Button onClick={save} disabled={isPending} className="h-11 px-5">
        Save
      </Button>
    </div>
  );
};
