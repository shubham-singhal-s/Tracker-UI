import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { encrypt } from "./lib/crypto";
import { cn } from "./lib/utils";

export default function Encrypt() {
  const [encrypted, setEncrypted] = useState<string | null>(null);
  const [value, setValue] = useState("");

  const convert = () => {
    if (value) {
      setEncrypted(encrypt(value) || "Encryption failed");
    }
  };

  const copyToClipboard = () => {
    if (encrypted) {
      navigator.clipboard.writeText(encrypted);
    }
  };

  return (
    <div className={cn("p-4 flex flex-col items-center gap-4")}>
      <h3 className="text-xl">Encrypt a secret</h3>
      <Input
        className="max-w-md rounded-none"
        value={value}
        placeholder="Enter secret here"
        onChange={(e) => setValue(e.target.value)}
      />
      <Button onClick={convert} className="ml-4">
        Convert
      </Button>
      {encrypted && <h6 className="text-sm">Result (click to copy)</h6>}
      {encrypted && (
        <div
          onClick={copyToClipboard}
          className="text-xs text-zinc-500 max-w-sm p-2 border border-gray-300 wrap-break-words cursor-pointer"
        >
          {encrypted}
        </div>
      )}
    </div>
  );
}
