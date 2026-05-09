import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = ["Locking SOL", "Notifying Witnesses", "Securing Pact on Devnet"] as const;

export function TxProcessingOverlay({ open, onComplete }: { open: boolean; onComplete?: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!open) {
      setStep(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), (i + 1) * 900));
    });
    timers.push(setTimeout(() => onComplete?.(), STEPS.length * 900 + 400));
    return () => timers.forEach(clearTimeout);
  }, [open, onComplete]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-background/85 backdrop-blur-xl px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="glass-strong w-full max-w-sm rounded-3xl p-6">
            <h3 className="mb-1 text-lg font-semibold">Sealing your pact</h3>
            <p className="mb-5 text-xs text-muted-foreground">Don't close this window</p>
            <ul className="space-y-3">
              {STEPS.map((s, i) => {
                const done = step > i;
                const active = step === i;
                return (
                  <li key={s} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                        done ? "bg-success text-background" : active ? "gradient-pinky text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : active ? <Loader2 className="h-4 w-4 animate-spin" /> : i + 1}
                    </span>
                    <span className={`text-sm ${done ? "text-foreground" : active ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
