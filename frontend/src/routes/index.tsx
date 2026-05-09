import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet, Plus, ArrowDownToLine, Sparkles } from "lucide-react";
import { usePinky } from "@/lib/pinky-store";
import { PactCard } from "@/components/pinky/PactCard";
import { TopUpModal } from "@/components/pinky/TopUpModal";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Pinky Pacts — Your Pacts" }, { name: "description", content: "Track your active on-chain habit pacts." }] }),
  component: Dashboard,
});

function Dashboard() {
  const wallet = usePinky((s) => s.wallet);
  const pacts = usePinky((s) => s.pacts);
  const [topUp, setTopUp] = useState(false);

  const active = pacts.filter((p) => p.status === "Active" || p.status === "PendingWitnesses" || p.status === "Voting");
  const past = pacts.filter((p) => p.status === "CompletedSuccess" || p.status === "CompletedFailure");

  return (
    <div className="flex flex-col gap-5 px-4 sm:gap-6 lg:px-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Your Pacts</h1>
          <p className="text-xs text-muted-foreground">{active.length} active · {past.length} completed</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setTopUp(true)} className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
            <Wallet className="h-3.5 w-3.5 text-primary" />
            <span className="tabular">{wallet.solBalance.toFixed(2)}</span> SOL
          </button>
          <Link to="/new" className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90 lg:inline-flex">
            <Plus className="h-4 w-4" /> New Pact
          </Link>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass relative overflow-hidden rounded-3xl p-5 sm:col-span-2">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary opacity-20 blur-3xl" />
          <p className="text-xs text-muted-foreground">Total at stake</p>
          <p className="mt-1 text-3xl font-bold tabular text-primary lg:text-4xl">
            {active.reduce((s, p) => s + (p.currency === "SOL" ? p.stake : 0), 0).toFixed(2)} <span className="text-base text-foreground/70">SOL</span>
          </p>
          <p className="text-xs text-muted-foreground tabular">+ {active.reduce((s, p) => s + (p.currency === "USDC" ? p.stake : 0), 0)} USDC</p>
        </div>
        <button onClick={() => setTopUp(true)} className="glass flex flex-col items-start justify-center gap-1 rounded-3xl p-5 text-left hover:border-primary">
          <ArrowDownToLine className="h-5 w-5 text-primary" />
          <p className="text-sm font-semibold">Top Up</p>
          <p className="text-xs text-muted-foreground">Bridge from any chain</p>
        </button>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Active</h2>
          <span className="text-xs text-muted-foreground">{active.length}</span>
        </div>
        {active.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {active.map((p) => <PactCard key={p.id} pact={p} />)}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">History</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {past.map((p) => <PactCard key={p.id} pact={p} />)}
          </div>
        </section>
      )}


      <TopUpModal open={topUp} onClose={() => setTopUp(false)} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass flex flex-col items-center gap-3 rounded-3xl px-6 py-10 text-center">
      <div className="gradient-pinky flex h-14 w-14 items-center justify-center rounded-2xl">
        <Sparkles className="h-7 w-7 text-primary-foreground" />
      </div>
      <div>
        <p className="font-semibold">No pacts yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Tap New Pact and tell Pinky your goal — out loud.</p>
      </div>
    </div>
  );
}
