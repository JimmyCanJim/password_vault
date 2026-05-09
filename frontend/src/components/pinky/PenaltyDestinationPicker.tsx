import type { PenaltyDestination } from "@/lib/pinky-store";
import { Flame, HeartHandshake, Trophy, Users } from "lucide-react";

const OPTS: { id: PenaltyDestination; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "split", label: "Split with Witnesses", icon: <Users className="h-5 w-5" />, desc: "Stake is divided equally among your witnesses." },
  { id: "donate", label: "Donate to Charity", icon: <HeartHandshake className="h-5 w-5" />, desc: "Funds go to a verified on-chain charity wallet." },
  { id: "burn", label: "Burn 🔥", icon: <Flame className="h-5 w-5" />, desc: "Sent to the burn address. Gone forever." },
  { id: "prize", label: "Prize Pool", icon: <Trophy className="h-5 w-5" />, desc: "Added to the global Pinky prize pool for winners." },
];

export function PenaltyDestinationPicker({
  value,
  onChange,
}: {
  value: PenaltyDestination;
  onChange: (v: PenaltyDestination) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {OPTS.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`flex flex-col items-start gap-1.5 rounded-2xl border p-3 text-left transition ${
              active ? "border-primary bg-primary/10 glow-pinky" : "border-border bg-muted/40 hover:border-primary/40"
            }`}
            title={o.desc}
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "gradient-pinky text-primary-foreground" : "bg-muted text-foreground"}`}>
              {o.icon}
            </span>
            <span className="text-xs font-semibold">{o.label}</span>
            <span className="text-[10px] leading-tight text-muted-foreground">{o.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
