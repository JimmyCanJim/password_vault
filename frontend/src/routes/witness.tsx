import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Check, X, ThumbsUp, ThumbsDown, Lock } from "lucide-react";
import { usePinky, timeLeft } from "@/lib/pinky-store";
import { toast } from "sonner";

export const Route = createFileRoute("/witness")({
  head: () => ({ meta: [{ title: "Witness Portal — Pinky Pacts" }, { name: "description", content: "Hold others to their pacts." }] }),
  component: WitnessPortal,
});

function WitnessPortal() {
  const invites = usePinky((s) => s.invites);
  const watching = usePinky((s) => s.watching);
  const accept = usePinky((s) => s.acceptInvite);
  const decline = usePinky((s) => s.declineInvite);

  return (
    <div className="space-y-5 px-4">
      <header>
        <p className="text-xs text-muted-foreground">Witness portal</p>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight"><Eye className="h-6 w-6 text-cyan" /> Watching</h1>
      </header>

      {invites.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Invitations</h2>
          <div className="space-y-3">
            {invites.map((inv) => (
              <div key={inv.id} className="glass rounded-3xl p-4">
                <div className="flex items-center gap-3">
                  <div className="gradient-pinky flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground">{inv.fromName[0]}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm"><span className="font-semibold">{inv.fromName}</span> <span className="text-muted-foreground">{inv.fromHandle}</span></p>
                    <p className="text-xs text-muted-foreground">wants you as a witness</p>
                  </div>
                </div>
                <p className="mt-3 text-base font-semibold">{inv.habit}</p>
                <p className="text-xs text-muted-foreground tabular">{inv.stake} {inv.currency} at stake</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => { accept(inv.id); toast.success(`Accepted ${inv.fromName}'s pact`); }} className="gradient-pinky flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold text-primary-foreground">
                    <Check className="h-3.5 w-3.5" /> Accept
                  </button>
                  <button onClick={() => decline(inv.id)} className="glass flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs">
                    <X className="h-3.5 w-3.5" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Active watches</h2>
        {watching.length === 0 ? (
          <div className="glass rounded-3xl p-6 text-center text-sm text-muted-foreground">Nothing to watch yet.</div>
        ) : (
          <div className="space-y-3">
            {watching.map((p) => <WatchCard key={p.id} pact={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function WatchCard({ pact }: { pact: ReturnType<typeof usePinky.getState>["watching"][number] }) {
  const t = timeLeft(pact.deadline);
  const me = pact.witnesses.find((w) => w.id === "me");
  const locked = t.total > 0;
  const vote = usePinky((s) => s.vote);
  const [voted, setVoted] = useState<"complete" | "fail" | null>(
    me?.status === "VotedComplete" ? "complete" : me?.status === "VotedFail" ? "fail" : null
  );

  const cast = (complete: boolean) => {
    if (locked || !me) return;
    vote(pact.id, me.id, complete);
    setVoted(complete ? "complete" : "fail");
    toast.success(`Voted: ${complete ? "Completed" : "Failed"}`);
  };

  return (
    <div className="glass rounded-3xl p-4">
      <p className="text-base font-semibold">{pact.habit}</p>
      <p className="mt-0.5 text-xs text-muted-foreground tabular">{pact.stake} {pact.currency} • {locked ? `${t.days}d ${t.hours}h until vote` : "Voting open"}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          disabled={locked}
          onClick={() => cast(true)}
          className={`flex items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-semibold transition ${
            voted === "complete" ? "bg-success text-background" : locked ? "bg-muted/50 text-muted-foreground" : "glass hover:bg-success/15 hover:text-success"
          }`}
        >
          {locked ? <Lock className="h-3.5 w-3.5" /> : <ThumbsUp className="h-4 w-4" />} Complete
        </button>
        <button
          disabled={locked}
          onClick={() => cast(false)}
          className={`flex items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-semibold transition ${
            voted === "fail" ? "bg-danger text-background" : locked ? "bg-muted/50 text-muted-foreground" : "glass hover:bg-danger/15 hover:text-danger"
          }`}
        >
          {locked ? <Lock className="h-3.5 w-3.5" /> : <ThumbsDown className="h-4 w-4" />} Fail
        </button>
      </div>
      {locked && <p className="mt-2 text-center text-[10px] text-muted-foreground">Voting unlocks at deadline.</p>}
    </div>
  );
}
