import { motion } from "framer-motion";
import { Mic } from "lucide-react";

export function MicOrb({ active, onClick, label }: { active: boolean; onClick?: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-3 outline-none"
      aria-label={label || "Microphone"}
    >
      <motion.span
        className="absolute inset-0 -z-10 rounded-full"
        animate={active ? { scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] } : { scale: 1, opacity: 0 }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{ background: "radial-gradient(circle, var(--primary), transparent 60%)" }}
      />
      <div
        className={`flex h-40 w-40 items-center justify-center rounded-full transition-all duration-500 ${
          active
            ? "gradient-pinky shadow-[0_0_80px_-10px_var(--primary)] animate-pulse-mic"
            : "glass-strong border-2 border-primary/30"
        }`}
      >
        <Mic className={`h-14 w-14 ${active ? "text-primary-foreground" : "text-primary"}`} />
      </div>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </button>
  );
}

export function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-12 items-center justify-center gap-1.5">
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className={`w-1 rounded-full bg-gradient-to-t from-primary to-violet ${active ? "animate-waveform" : ""}`}
          style={{
            height: active ? `${20 + Math.sin(i) * 20 + Math.random() * 20}px` : "8px",
            animationDelay: `${i * 60}ms`,
            animationDuration: `${600 + (i % 4) * 200}ms`,
          }}
        />
      ))}
    </div>
  );
}
