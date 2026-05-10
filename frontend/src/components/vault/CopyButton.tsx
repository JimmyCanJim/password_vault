import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          toast.success("Copied ✓");
          setTimeout(() => setDone(false), 1500);
        } catch {
          toast.error("Couldn't copy");
        }
      }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm hover:bg-secondary transition active:scale-95"
      aria-label={label}
    >
      {done ? <Check className="w-4 h-4 text-teal" /> : <Copy className="w-4 h-4" />}
      {done ? "Copied" : label}
    </button>
  );
}
