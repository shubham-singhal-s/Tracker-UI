import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, type FC } from "react";

export const Saver: FC = () => {
  const [value, setValue] = useState("");

  const save = () => {
    if (!value) {
      return;
    }

    const savedDeals = JSON.parse(localStorage.getItem("savedDeals") || "[]") as string[];

    if (!savedDeals.includes(value)) {
      savedDeals.push(value);
      localStorage.setItem("savedDeals", JSON.stringify(savedDeals));
      setValue("");
      window.dispatchEvent(new Event("savedDealsUpdated"));
    }
  };
  return (
    <div className="flex flex-row gap-2 justify-center my-4">
      <Input
        className="max-w-md rounded-none border-amber-50"
        value={value}
        onKeyDown={(e) => e.key === "Enter" && save()}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button onClick={save}>Save</Button>
    </div>
  );
};
