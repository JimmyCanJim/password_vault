import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { MicOrb, Waveform } from "@/components/pinky/MicOrb";
import { PenaltyDestinationPicker } from "@/components/pinky/PenaltyDestinationPicker";
import { PinkyPromiseLock } from "@/components/pinky/PinkyPromiseLock";
import { TxProcessingOverlay } from "@/components/pinky/TxProcessingOverlay";
import { usePinky, type Currency, type PenaltyDestination, type Witness } from "@/lib/pinky-store";
import { toast } from "sonner";

export const Route = createFileRoute("/new")({
  head: () => ({ meta: [{ title: "New Pact — Pinky Pacts" }, { name: "description", content: "Speak your goal. Pinky parses and stakes it." }] }),
  component: NewPact,
});

const TRANSCRIPT = "I'll meditate for ten minutes every morning for thirty days, stake half a SOL, my witnesses are Maya and Jules.";

type Stage = "idle" | "listening" | "parsing" | "summary" | "tx" | "lock";

function NewPact() {
  const navigate = useNavigate();
  const createPact = usePinky((s) => s.createPact);
  const [stage, setStage] = useState<Stage>("idle");
  const [transcript, setTranscript] = useState("");

  const [habit, setHabit] = useState("Meditate 10 min every morning");
  const [duration, setDuration] = useState(30);
  const [stake, setStake] = useState(0.5);
  const [currency, setCurrency] = useState<Currency>("SOL");
  const [penalty, setPenalty] = useState<PenaltyDestination>("split");
  const [witnesses, setWitnesses] = useState<Witness[]>([
    { id: "wm", name: "Maya", handle: "@maya.sol", status: "Pending" },
    { id: "wj", name: "Jules", handle: "@jules", status: "Pending" },
  ]);

  // Simulated voice transcription
  useEffect(() => {
    if (stage !== "listening") return;
    setTranscript("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTranscript(TRANSCRIPT.slice(0, i));
      if (i >= TRANSCRIPT.length) {
        clearInterval(id);
        setStage("parsing");
        setTimeout(() => setStage("summary"), 1100);
      }
    }, 35);
    return () => clearInterval(id);
  }, [stage]);

  const confirm = () => {
    setStage("tx");
  };

  const onTxDone = () => {
    setStage("lock");
    setTimeout(() => {
      const p = createPact({ habit, durationDays: duration, stake, currency, penalty, witnesses });
      toast.success("Pact locked on Devnet");
      navigate({ to: "/pacts/$pactId", params: { pactId: p.id } });
    }, 1800);
  };

  return (
    <div className="px-4">
      <header className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate({ to: "/" })} className="rounded-full bg-muted p-2"><ArrowLeft className="h-4 w-4" /></button>
        <h1 className="text-sm font-semibold text-muted-foreground">New Pact</h1>
        <button onClick={() => navigate({ to: "/" })} className="rounded-full bg-muted p-2"><X className="h-4 w-4" /></button>
      </header>

      <AnimatePresence mode="wait">
        {stage === "idle" || stage === "listening" || stage === "parsing" ? (
          <motion.div key="voice" exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center gap-8 pt-6">
            <div>
              <h2 className="text-center text-3xl font-bold leading-tight">
                {stage === "idle" ? <>Tell Pinky your <span className="text-gradient-pinky">goal</span></> : stage === "listening" ? "Listening…" : "Parsing…"}
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {stage === "idle" ? "Tap the mic. Speak the habit, duration, stake, and witnesses." : "Pinky is hearing you out."}
              </p>
            </div>

            <MicOrb active={stage === "listening" || stage === "parsing"} onClick={() => stage === "idle" && setStage("listening")} />
            <Waveform active={stage === "listening"} />

            <div className="glass min-h-[80px] w-full rounded-2xl p-4 text-center text-sm">
              {transcript || <span className="text-muted-foreground italic">Your transcript will appear here…</span>}
              {stage === "listening" && <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" />}
            </div>

            {stage === "idle" && (
              <button onClick={() => setStage("summary")} className="text-xs text-muted-foreground underline underline-offset-4">or fill it in manually</button>
            )}
          </motion.div>
        ) : stage === "summary" ? (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="glass rounded-3xl p-4">
              <p className="text-xs text-muted-foreground">Habit</p>
              <input value={habit} onChange={(e) => setHabit(e.target.value)} className="w-full bg-transparent text-lg font-semibold outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-3xl p-4">
                <p className="text-xs text-muted-foreground">Duration</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 0)} className="w-16 bg-transparent text-2xl font-bold tabular outline-none" />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </div>
              <div className="glass rounded-3xl p-4">
                <p className="text-xs text-muted-foreground">Stake</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <input type="number" step="0.1" value={stake} onChange={(e) => setStake(parseFloat(e.target.value) || 0)} className="w-16 bg-transparent text-2xl font-bold tabular outline-none text-gradient-pinky" />
                  <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="bg-transparent text-sm font-semibold outline-none">
                    <option className="bg-card">SOL</option>
                    <option className="bg-card">USDC</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-4">
              <p className="mb-2 text-xs text-muted-foreground">If you fail, the stake goes to…</p>
              <PenaltyDestinationPicker value={penalty} onChange={setPenalty} />
            </div>

            <div className="glass rounded-3xl p-4">
              <p className="mb-2 text-xs text-muted-foreground">Witnesses ({witnesses.length})</p>
              <div className="space-y-2">
                {witnesses.map((w, i) => (
                  <div key={w.id} className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2 text-sm">
                    <div className="gradient-solana flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-primary-foreground">{w.name[0]}</div>
                    <input value={w.handle} onChange={(e) => setWitnesses(witnesses.map((ww, j) => j === i ? { ...ww, handle: e.target.value } : ww))} className="flex-1 bg-transparent outline-none" />
                    <button onClick={() => setWitnesses(witnesses.filter((_, j) => j !== i))} className="text-muted-foreground"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                <button
                  onClick={() => setWitnesses([...witnesses, { id: "w" + Math.random(), name: "?", handle: "@new", status: "Pending" }])}
                  className="w-full rounded-xl border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                >
                  + Add witness
                </button>
              </div>
            </div>

            <button
              onClick={confirm}
              className="gradient-pinky w-full rounded-full py-3.5 font-semibold text-primary-foreground glow-pinky transition active:scale-[0.98]"
            >
              Lock it — {stake} {currency}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <TxProcessingOverlay open={stage === "tx"} onComplete={onTxDone} />
      <PinkyPromiseLock show={stage === "lock"} />
    </div>
  );
}
