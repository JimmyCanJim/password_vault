import elephantUrl from "@/assets/elephant.png";

type Props = {
  size?: number;
  className?: string;
  glow?: boolean;
};

export function Elephant({ size = 220, className, glow = true }: Props) {
  return (
    <div
      className={`relative inline-block ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          aria-hidden
          className="absolute -inset-4 rounded-full blur-2xl opacity-50"
          style={{
            background:
              "conic-gradient(from 200deg, var(--teal), var(--coral), var(--amber), var(--indigo), var(--teal))",
          }}
        />
      )}
      <div
        className="relative w-full h-full rounded-full overflow-hidden ink-shadow"
        style={{
          boxShadow:
            "0 0 0 2px var(--paper), 0 0 0 3px color-mix(in oklab, var(--ink) 20%, transparent), 0 18px 40px rgba(0,0,0,0.18)",
        }}
      >
        <img
          src={elephantUrl}
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

