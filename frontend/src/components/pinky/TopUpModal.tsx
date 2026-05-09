import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { usePinky, type Currency } from "@/lib/pinky-store";
import { toast } from "sonner";

const CHAINS = ["Ethereum", "Polygon", "Arbitrum", "Base", "Optimism"];
const ASSETS = ["ETH", "USDC", "USDT", "MATIC"];

export function TopUpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const topUp = usePinky((s) => s.topUp);
  const [chain, setChain] = useState(CHAINS[0]);
  const [asset, setAsset] = useState(ASSETS[1]);
  const [amount, setAmount] = useState("100");
  const [target, setTarget] = useState<Currency>("USDC");
  const [pending, setPending] = useState(false);

  const submit = () => {
    setPending(true);
    setTimeout(() => {
      topUp(target, parseFloat(amount) || 0);
      setPending(false);
      toast.success(`Bridged ${amount} ${asset} → ${target}`, { description: `via LI.FI from ${chain}` });
      onClose();
    }, 1400);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-background/70 backdrop-blur-md sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-strong w-full max-w-md rounded-t-3xl p-5 sm:rounded-3xl"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            exit={{ y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Top Up</h3>
                <p className="text-xs text-muted-foreground">Bridge from any chain via LI.FI</p>
              </div>
              <button onClick={onClose} className="rounded-full bg-muted p-1.5"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-3">
              <Field label="From chain">
                <select value={chain} onChange={(e) => setChain(e.target.value)} className="w-full bg-transparent outline-none">
                  {CHAINS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Asset">
                <select value={asset} onChange={(e) => setAsset(e.target.value)} className="w-full bg-transparent outline-none">
                  {ASSETS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="Amount">
                <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="w-full bg-transparent outline-none" />
              </Field>
              <div className="flex items-center justify-center py-1 text-muted-foreground"><ArrowRight className="h-4 w-4" /></div>
              <Field label="To Solana asset">
                <div className="flex gap-2">
                  {(["SOL", "USDC"] as Currency[]).map((c) => (
                    <button key={c} type="button" onClick={() => setTarget(c)} className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${target === c ? "gradient-pinky text-primary-foreground" : "bg-muted text-foreground"}`}>{c}</button>
                  ))}
                </div>
              </Field>

              <button
                onClick={submit}
                disabled={pending}
                className="gradient-pinky mt-2 w-full rounded-full py-3 text-sm font-semibold text-primary-foreground transition active:scale-[0.98] disabled:opacity-60"
              >
                {pending ? "Bridging…" : "Bridge & Stake"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-2xl bg-muted/60 px-3 py-2">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}
