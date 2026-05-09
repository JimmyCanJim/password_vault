import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import { ShieldCheck, Flame, HeartHandshake, Trophy, Users, Gavel } from "lucide-react";
import type { Pact } from "@/lib/pinky-store";
import { riskLevel, timeLeft, progressPct, usePinky } from "@/lib/pinky-store";
import { CountdownRing } from "./CountdownRing";
import { toast } from "sonner";

const penaltyIcon = {
  burn: <Flame className="h-3.5 w-3.5" />,
  donate: <HeartHandshake className="h-3.5 w-3.5" />,
  prize: <Trophy className="h-3.5 w-3.5" />,
  split: <Users className="h-3.5 w-3.5" />,
} as const;

const statusStyles: Record<Pact["status"], string> = {
  Active: "bg-success/15 text-success",
  PendingWitnesses: "bg-warning/15 text-warning",
  Voting: "bg-violet/15 text-[var(--violet)]",
  CompletedSuccess: "bg-success/15 text-success",
  CompletedFailure: "bg-danger/15 text-danger",
  Disputed: "bg-danger/15 text-danger",
};

export function PactCard({ pact }: { pact: Pact }) {
  const risk = riskLevel(pact.stake, pact.currency);
  const t = timeLeft(pact.deadline);
  const pct = progressPct(pact);
  const giveUp = usePinky((s) => s.giveUp);
  const acceptedMembers = pact.witnesses.filter((w) => w.status === "Accepted" || w.status.startsWith("Voted"));
  const verified = acceptedMembers.length;
  const forfeitShare = verified > 0 ? pact.stake / verified : pact.stake;

  const handleGiveUp = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const splitText = verified > 0
      ? `${forfeitShare.toFixed(4)} ${pact.currency} to each remaining member`
      : "the pact pool";
    if (!confirm(`Give up this pact? You forfeit ${pact.stake} ${pact.currency}, split into ${splitText}.`)) return;
    giveUp(pact.id);
    toast("Pact forfeited", { description: `${pact.stake} ${pact.currency} split between ${verified} remaining member${verified === 1 ? "" : "s"}.` });
  };

  return (
    <article className="glass group rounded-3xl p-4 transition hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
      <Link to="/pacts/$pactId" params={{ pactId: pact.id }} className="block">
        <div className="flex items-start gap-4">
          <CountdownRing progress={pct} size={64}>
            <span className="text-base font-bold tabular">{pact.currency === "SOL" ? "◎" : "$"}</span>
          </CountdownRing>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-semibold">{pact.habit}</h3>
              {verified >= 2 && <ShieldCheck className="h-4 w-4 shrink-0 text-cyan" />}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-medium ${statusStyles[pact.status]}`}>
                {pact.status === "PendingWitnesses" ? "Awaiting witnesses" : pact.status === "CompletedSuccess" ? "Respected" : pact.status === "CompletedFailure" ? "Broken" : pact.status}
              </span>
              <span className={`flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 ${risk.color}`}>{risk.label} stake</span>
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                {penaltyIcon[pact.penalty]}
                {pact.penalty}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="font-bold tabular text-gradient-pinky">
                {pact.stake} {pact.currency}
              </span>
              <span className="tabular text-xs text-muted-foreground" suppressHydrationWarning>
                {t.total > 0 ? `${t.days}d ${t.hours}h left` : "deadline passed"}
              </span>
            </div>
          </div>
        </div>
      </Link>
      {pact.status === "Active" && (
        <div className="mt-4 border-t border-border/60 pt-3">
          <p className="text-xs text-muted-foreground">
            Forfeit your {pact.stake} {pact.currency}; {verified > 0 ? `${forfeitShare.toFixed(4)} ${pact.currency} goes to each remaining member.` : "it stays in the pact pool."}
          </p>
          <button
            onClick={handleGiveUp}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-danger/40 bg-danger/10 py-3 text-sm font-semibold text-danger transition hover:bg-danger/20"
          >
            <Gavel className="h-4 w-4" /> Give up & split stake
          </button>
        </div>
      )}
    </article>
  );
}
