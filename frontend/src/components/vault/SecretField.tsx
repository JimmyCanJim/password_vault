import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { CopyButton } from "./CopyButton";

export function SecretField({ value }: { value: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <code className="flex-1 min-w-0 font-mono text-base bg-secondary rounded-lg px-3 py-2 break-all">
        {show ? value : "•".repeat(Math.min(value.length, 12))}
      </code>
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide" : "Show"}
        className="p-2 rounded-full hover:bg-secondary transition"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
      <CopyButton value={value} />
    </div>
  );
}
