import { Delete } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  length?: number;
};

export function PinPad({ value, onChange, length = 5 }: Props) {
  const press = (d: string) => {
    if (value.length >= length) return;
    onChange(value + d);
  };
  const back = () => onChange(value.slice(0, -1));
  const clear = () => onChange("");

  const dotColors = ["var(--teal)", "var(--coral)", "var(--amber)", "var(--indigo)", "var(--seal)"];
  const dots = Array.from({ length }, (_, i) => {
    const filled = i < value.length;
    const c = dotColors[i % dotColors.length];
    return (
      <span
        key={i}
        className="inline-block w-4 h-4 rounded-full border-2 transition-all"
        style={{
          backgroundColor: filled ? c : "transparent",
          borderColor: filled ? c : "color-mix(in oklab, var(--foreground) 30%, transparent)",
          transform: filled ? "scale(1.15)" : "scale(1)",
        }}
      />
    );
  });

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-center gap-3 mb-8" aria-label="PIN entry">
        {dots}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => press(String(n))}
            className="h-16 rounded-full bg-card border border-border text-2xl font-serif ink-shadow active:scale-95 transition hover:bg-secondary"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={clear}
          className="h-16 rounded-full text-sm text-muted-foreground hover:text-foreground transition"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => press("0")}
          className="h-16 rounded-full bg-card border border-border text-2xl font-serif ink-shadow active:scale-95 transition hover:bg-secondary"
        >
          0
        </button>
        <button
          type="button"
          onClick={back}
          aria-label="Backspace"
          className="h-16 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
