import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Camera, Check, Play, Pause, ShieldCheck, Flame, HeartHandshake, Trophy, Users, Gavel } from "lucide-react";
import { usePinky, timeLeft, progressPct, riskLevel } from "@/lib/pinky-store";
import { CountdownRing } from "@/components/pinky/CountdownRing";
import { toast } from "sonner";

export const Route = createFileRoute("/pacts/$pactId")({
  head: ({ params }) => ({
    meta: [
      { title: `Pact ${params.pactId} — Pinky Pacts Pacts` },
      { name: "description", content: "View your pact, check in, and listen to your AI coach." },
    ],
  }),
  component: PactDetail,
  notFoundComponent: () => (
    <div className="px-4 pt-12 text-center">
      <p className="text-sm text-muted-foreground">Pact not found.</p>
      <Link to="/" className="text-primary underline">Back home</Link>
    </div>
  ),
  errorComponent: ({ error }) => <div className="px-4 pt-12 text-center text-sm text-danger">{error.message}</div>,
});

const penaltyMeta = {
  burn: { label: "Burned", icon: Flame },
  donate: { label: "Donated", icon: HeartHandshake },
  prize: { label: "Prize Pool", icon: Trophy },
  split: { label: "Split with witnesses", icon: Users },
} as const;

function PactDetail() {
  const { pactId } = Route.useParams();
  const navigate = useNavigate();
  const pact = usePinky((s) => s.pacts.find((p) => p.id === pactId));
  const checkIn = usePinky((s) => s.checkIn);
  const giveUp = usePinky((s) => s.giveUp);

  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  if (!pact) {
    return (
      <div className="px-4 pt-12 text-center">
        <p className="text-sm text-muted-foreground">Pact not found.</p>
        <Link to="/" className="text-primary underline">Back home</Link>
      </div>
    );
  }

  const t = timeLeft(pact.deadline);
  const pct = progressPct(pact);
  const risk = riskLevel(pact.stake, pact.currency);
  const PenaltyIcon = penaltyMeta[pact.penalty].icon;
  const accepted = pact.witnesses.filter((w) => w.status === "Accepted" || w.status.startsWith("Voted")).length;
  void now;

  const handleCheckIn = () => {
    const res = checkIn(pact.id, { date: new Date().toISOString() });
    if (!res.ok) {
      toast.error(res.reason || "Check-in failed");
      return;
    }
    toast.success("Checked in for today", { description: `${pact.checkIns.length + 1} day streak` });
  };

  const handleGiveUp = () => {
    const accepted = pact.witnesses.filter((w) => w.status === "Accepted" || w.status.startsWith("Voted"));
    const share = accepted.length > 0 ? pact.stake / accepted.length : pact.stake;
    const splitText = accepted.length > 0
      ? `${share.toFixed(4)} ${pact.currency} to each remaining member`
      : "the pact pool";
    if (!confirm(`Give up this pact? You forfeit ${pact.stake} ${pact.currency}, split into ${splitText}.`)) return;
    giveUp(pact.id);
    toast("Pact forfeited", { description: `${pact.stake} ${pact.currency} split between ${accepted.length} remaining member${accepted.length === 1 ? "" : "s"}.` });
    navigate({ to: "/" });
  };

  return (
    <div className="space-y-5 px-4">
      <header className="flex items-center justify-between">
        <button onClick={() => navigate({ to: "/" })} className="rounded-full bg-muted p-2"><ArrowLeft className="h-4 w-4" /></button>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${pact.status === "Active" ? "bg-success/15 text-success" : pact.status === "Voting" ? "bg-violet/15 text-[var(--violet)]" : "bg-warning/15 text-warning"}`}>
          {pact.status}
        </span>
        {pact.status === "Voting" && (
          <Link to="/pacts/$pactId/settle" params={{ pactId: pact.id }} className="gradient-pinky rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground">
            Settle
          </Link>
        )}
        {pact.status !== "Voting" && <span className="w-8" />}
      </header>

      <section className="glass relative overflow-hidden rounded-3xl p-5">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full gradient-pinky opacity-20 blur-3xl" />
        <div className="flex items-center gap-4">
          <CountdownRing progress={pct} size={96} stroke={6}>
            <div className="text-center">
              <p className="text-2xl font-bold tabular leading-none">{t.days}</p>
              <p className="text-[10px] uppercase text-muted-foreground">days left</p>
            </div>
          </CountdownRing>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-tight">{pact.habit}</h1>
            {pact.description && <p className="mt-1 text-xs text-muted-foreground">{pact.description}</p>}
            <p className="mt-2 tabular text-xs text-muted-foreground">
              {String(t.hours).padStart(2, "0")}:{String(t.minutes).padStart(2, "0")}:{String(t.seconds).padStart(2, "0")}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Stat label="Pool total" value={`${(pact.stake * (1 + accepted)).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${pact.currency}`} accent />
        <Stat label="Risk" value={risk.label} valueClass={risk.color} />
        <Stat label="Penalty" value={penaltyMeta[pact.penalty].label} icon={<PenaltyIcon className="h-3.5 w-3.5" />} />
        <Stat label="Streak" value={`${pact.checkIns.length} days`} />
      </section>

      <section className="glass rounded-3xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Your contribution</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">Locked</span>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold tabular text-gradient-pinky">
            {pact.stake} <span className="text-base font-semibold text-muted-foreground">{pact.currency}</span>
          </p>
          <p className="text-xs text-muted-foreground tabular">
            ≈ ${pact.currency === "SOL" ? (pact.stake * 150).toFixed(2) : pact.stake.toFixed(2)}
          </p>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Added on {new Date(pact.createdAt).toLocaleDateString()} · Released on success, forfeited on fail.
        </p>
      </section>

      <section className="glass rounded-3xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Today's check-in</h3>
          <span className="text-xs text-muted-foreground tabular">{pact.checkIns.length}/{pact.durationDays}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCheckIn}
            className="gradient-pinky flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-primary-foreground"
          >
            <Check className="h-4 w-4" /> Mark done
          </button>
          <button className="glass flex items-center justify-center rounded-2xl px-4">
            <Camera className="h-5 w-5 text-cyan" />
          </button>
        </div>
      </section>

      <CoachPlayer />

      <section className="glass rounded-3xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-cyan" /> Witnesses</h3>
          <span className="text-xs text-muted-foreground">{accepted}/{pact.witnesses.length} accepted</span>
        </div>
        <ul className="space-y-2">
          {pact.witnesses.map((w) => (
            <li key={w.id} className="flex items-center gap-3">
              <div className="gradient-solana flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-primary-foreground">{w.name[0]}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{w.name}</p>
                <p className="text-xs text-muted-foreground">{w.handle}</p>
              </div>
              <WitnessBadge status={w.status} />
            </li>
          ))}
        </ul>
      </section>

      {pact.status === "Voting" && (
        <div className="glass rounded-3xl border border-violet/40 p-4 text-sm">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Gavel className="h-4 w-4 text-[var(--violet)]" /> Witnesses are voting</div>
          <p className="text-xs text-muted-foreground">The deadline has passed. Witnesses are casting votes — head to settlement to see the outcome.</p>
        </div>
      )}

      {pact.status === "Active" && (
        <section className="glass rounded-3xl border border-danger/30 p-4">
          <h3 className="text-sm font-semibold text-danger">Give up</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Forfeit your {pact.stake} {pact.currency}. It will be split equally between the remaining pact members.
          </p>
          <button
            onClick={handleGiveUp}
            className="mt-3 w-full rounded-2xl border border-danger/40 bg-danger/10 py-3 text-sm font-semibold text-danger transition hover:bg-danger/20"
          >
            Give up & forfeit stake
          </button>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, valueClass, icon, accent }: { label: string; value: string; valueClass?: string; icon?: React.ReactNode; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 flex items-center gap-1.5 text-base font-bold tabular ${accent ? "text-gradient-pinky" : valueClass || ""}`}>
        {icon}{value}
      </p>
    </div>
  );
}

function WitnessBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Accepted: "bg-success/15 text-success",
    Pending: "bg-warning/15 text-warning",
    Declined: "bg-muted text-muted-foreground",
    VotedComplete: "bg-success/15 text-success",
    VotedFail: "bg-danger/15 text-danger",
  };
  const label = status === "VotedComplete" ? "Voted ✓" : status === "VotedFail" ? "Voted ✗" : status;
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${map[status]}`}>{label}</span>;
}

function CoachPlayer() {
  const [playing, setPlaying] = useState(false);
  return (
    <section className="glass rounded-3xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Daily AI Coach</h3>
        <span className="text-xs text-muted-foreground">0:42</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setPlaying(!playing)} className="gradient-pinky flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-primary-foreground">
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
        </button>
        <div className="flex flex-1 items-center gap-1">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className={`w-1 rounded-full bg-gradient-to-t from-primary to-violet ${playing ? "animate-waveform" : ""}`}
              style={{ height: `${10 + Math.abs(Math.sin(i * 0.6)) * 22}px`, animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">"You're 8 days in. Momentum compounds — protect tomorrow morning."</p>
    </section>
  );
}
