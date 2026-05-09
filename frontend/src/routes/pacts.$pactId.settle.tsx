import { createFileRoute, useNavigate, notFound, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, PartyPopper, ArrowLeft, ExternalLink } from "lucide-react";
import { usePinky } from "@/lib/pinky-store";

export const Route = createFileRoute("/pacts/$pactId/settle")({
  head: () => ({ meta: [{ title: "Settlement — Pinky Pacts Pacts" }] }),
  component: Settle,
  notFoundComponent: () => <div className="px-4 pt-12 text-center text-sm">Pact not found.</div>,
  errorComponent: ({ error }) => <div className="px-4 pt-12 text-center text-sm text-danger">{error.message}</div>,
});

function Settle() {
  const { pactId } = Route.useParams();
  const navigate = useNavigate();
  const pact = usePinky((s) => s.pacts.find((p) => p.id === pactId));
  const settle = usePinky((s) => s.settle);

  if (!pact) throw notFound();

  const initialSuccess = pact.status === "CompletedSuccess" ? true : pact.status === "CompletedFailure" ? false : null;
  const [outcome, setOutcome] = useState<boolean | null>(initialSuccess);

  useEffect(() => {
    if (outcome === null && pact.status === "Voting") {
      // auto-tally votes
      const yes = pact.witnesses.filter((w) => w.status === "VotedComplete").length;
      const no = pact.witnesses.filter((w) => w.status === "VotedFail").length;
      const result = yes >= no;
      setTimeout(() => {
        setOutcome(result);
        settle(pact.id, result);
      }, 800);
    }
  }, [outcome, pact, settle]);

  return (
    <div className="relative min-h-[80vh] px-4">
      <header className="flex items-center justify-between">
        <button onClick={() => navigate({ to: "/" })} className="rounded-full bg-muted p-2"><ArrowLeft className="h-4 w-4" /></button>
        <h1 className="text-sm font-semibold text-muted-foreground">Settlement</h1>
        <span className="w-8" />
      </header>

      {outcome === null ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <motion.div className="h-16 w-16 rounded-full gradient-pinky" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          <p className="mt-6 text-sm text-muted-foreground">Tallying witness votes…</p>
        </div>
      ) : outcome ? (
        <SuccessView pact={pact} />
      ) : (
        <FailureView pact={pact} />
      )}
    </div>
  );
}

function SuccessView({ pact }: { pact: ReturnType<typeof usePinky.getState>["pacts"][number] }) {
  return (
    <div className="relative pt-10 text-center">
      <Confetti />
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 160, damping: 12 }} className="mx-auto flex h-28 w-28 items-center justify-center rounded-full gradient-pinky shadow-2xl glow-pinky">
        <PartyPopper className="h-14 w-14 text-primary-foreground" />
      </motion.div>
      <h2 className="mt-6 text-3xl font-bold text-gradient-pinky">Pinky Respected</h2>
      <p className="mt-2 text-sm text-muted-foreground">"{pact.habit}" — done.</p>

      <div className="glass mx-auto mt-8 max-w-sm rounded-3xl p-5 text-left">
        <p className="text-xs text-muted-foreground">Returned to wallet</p>
        <p className="mt-1 text-3xl font-bold tabular text-gradient-pinky">+{pact.stake} {pact.currency}</p>
        <TxPath />
      </div>
      <Link to="/" className="gradient-pinky mt-8 inline-block rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground">Back home</Link>
    </div>
  );
}

function FailureView({ pact }: { pact: ReturnType<typeof usePinky.getState>["pacts"][number] }) {
  return (
    <div className="pt-10 text-center">
      <motion.div initial={{ y: 0, opacity: 1, scale: 1 }} animate={{ y: -30, opacity: 0.4, scale: 1.2, filter: "blur(2px)" }} transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse" }} className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-danger/20">
        <Flame className="h-14 w-14 text-danger" />
      </motion.div>
      <h2 className="mt-6 text-3xl font-bold text-danger">Pact Broken</h2>
      <p className="mt-2 text-sm text-muted-foreground">"{pact.habit}" — fell short.</p>

      <div className="glass mx-auto mt-8 max-w-sm rounded-3xl p-5 text-left">
        <p className="text-xs text-muted-foreground">Stake destination — {pact.penalty}</p>
        <p className="mt-1 text-3xl font-bold tabular text-danger">−{pact.stake} {pact.currency}</p>
        <TxPath />
      </div>
      <Link to="/" className="glass mt-8 inline-block rounded-full px-6 py-3 text-sm font-semibold">Back home</Link>
    </div>
  );
}

function TxPath() {
  return (
    <a href="#" className="mt-3 flex items-center gap-2 text-xs text-cyan">
      <span className="tabular">5xQ8…r2Pa</span>
      <ExternalLink className="h-3 w-3" />
      <span className="text-muted-foreground">View on Solscan (Devnet)</span>
    </a>
  );
}

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    color: ["var(--primary)", "var(--violet)", "var(--cyan)", "var(--warning)"][i % 4],
    rot: Math.random() * 360,
  })), []);
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 h-2.5 w-2.5 animate-confetti rounded-sm"
          style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, transform: `rotate(${p.rot}deg)` }}
        />
      ))}
    </div>
  );
}
